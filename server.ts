import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';
import {
  buildSimulatedAirQuality,
  classifyHourBand,
  computeIndiaNaqi,
  computeWindows,
  findClosestPresetByCoords,
  formatHourLabel,
  getAqiStatus,
  getCustomNeighborhoodFactors,
  getIndiaNaqiStatus,
  haversineKm,
  no2ToAqi,
  pm10ToAqi,
  pm25ToAqi,
  resolveCityAndNeighborhood,
} from './src/data/cities.ts';
import type {
  AirQualityPayload,
  ChatMessage,
  DailyOutlookPoint,
  HourlyPoint,
  NeighborhoodPreset,
  UserProfile,
} from './src/types/airQuality.ts';
import { buildSmartAqiReply } from './src/utils/assistantFallback.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json({ limit: '1mb' }));

const PORT = Number(process.env.PORT) || 3000;

function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY_MISSING');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

async function fetchWithTimeout(url: string, timeoutMs = 3500): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

interface GeoCandidate {
  name: string;
  admin1?: string;
  admin2?: string;
  country?: string;
  population?: number;
  latitude: number;
  longitude: number;
}

async function geocodeOpenMeteo(
  name: string,
  hint?: string
): Promise<GeoCandidate | null> {
  const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
    name.trim()
  )}&count=8&language=en&format=json`;
  const geoRes = await fetchWithTimeout(geoUrl, 3000);
  if (!geoRes.ok) return null;
  const geoJson = (await geoRes.json()) as { results?: GeoCandidate[] };
  const results = geoJson.results;
  if (!results || results.length === 0) return null;

  if (hint) {
    const h = hint.trim().toLowerCase();
    const hinted = results.filter((r) => {
      const fields = [r.country, r.admin1, r.admin2, r.name]
        .filter(Boolean)
        .map((s) => s!.toLowerCase());
      return fields.some((f) => f.includes(h) || h.includes(f));
    });
    if (hinted.length > 0) {
      return hinted.sort((a, b) => (b.population ?? 0) - (a.population ?? 0))[0];
    }
    return null;
  }

  return [...results].sort((a, b) => (b.population ?? 0) - (a.population ?? 0))[0];
}

async function reverseGeocodeCoords(
  lat: number,
  lon: number
): Promise<{ city: string; neighborhood: string; country: string } | null> {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=14`;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 2500);
    try {
      const res = await fetch(url, {
        signal: controller.signal,
        headers: { 'User-Agent': 'AeroSense-AirAssistant/1.0' },
      });
      if (!res.ok) return null;
      const json = (await res.json()) as {
        address?: {
          quarter?: string;
          neighbourhood?: string;
          suburb?: string;
          city_district?: string;
          city?: string;
          town?: string;
          village?: string;
          state_district?: string;
          state?: string;
          country?: string;
        };
      };
      const addr = json.address;
      if (!addr) return null;
      const city =
        addr.city || addr.town || addr.village || addr.state_district || 'Current Area';
      const neighborhood =
        addr.suburb || addr.quarter || addr.neighbourhood || addr.city_district || city;
      const country = [addr.state, addr.country].filter(Boolean).join(', ') || 'GPS Location';
      return { city, neighborhood, country };
    } finally {
      clearTimeout(timer);
    }
  } catch {
    return null;
  }
}

async function geocodeNeighborhoodWithinCity(
  areaName: string,
  cityName: string,
  cityLat: number,
  cityLon: number
): Promise<{ lat: number; lon: number } | null> {
  const cleanArea = areaName.trim();
  if (!cleanArea || cleanArea.toLowerCase() === 'city center') return null;

  try {
    const omMatch = await geocodeOpenMeteo(cleanArea, cityName);
    if (
      omMatch &&
      haversineKm(cityLat, cityLon, omMatch.latitude, omMatch.longitude) <= 45
    ) {
      return { lat: omMatch.latitude, lon: omMatch.longitude };
    }
  } catch {
    // Fall through to Nominatim
  }

  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
      `${cleanArea}, ${cityName}`
    )}&format=json&limit=3`;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 2500);
    try {
      const res = await fetch(url, {
        signal: controller.signal,
        headers: { 'User-Agent': 'AeroSense-AirAssistant/1.0' },
      });
      if (!res.ok) return null;
      const results = (await res.json()) as { lat?: string; lon?: string }[];
      if (!Array.isArray(results)) return null;
      for (const item of results) {
        const candLat = Number(item.lat);
        const candLon = Number(item.lon);
        if (
          Number.isFinite(candLat) &&
          Number.isFinite(candLon) &&
          haversineKm(cityLat, cityLon, candLat, candLon) <= 45
        ) {
          return { lat: candLat, lon: candLon };
        }
      }
      return null;
    } finally {
      clearTimeout(timer);
    }
  } catch {
    return null;
  }
}

async function fetchLiveOpenMeteoForCoords(params: {
  lat: number;
  lon: number;
  resolvedCity: string;
  resolvedCountry: string;
  resolvedNeighborhood: string;
  zoneType: string;
  nbFactors?: Pick<NeighborhoodPreset, 'pm25Factor' | 'pm10Factor' | 'no2Factor'> | null;
  defaultWeather?: { tempC: number; humidityPct: number; windKmh: number };
}): Promise<AirQualityPayload | null> {
  const {
    lat,
    lon,
    resolvedCity,
    resolvedCountry,
    resolvedNeighborhood,
    zoneType,
    nbFactors,
    defaultWeather,
  } = params;

  const aqUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=us_aqi,pm10,pm2_5,nitrogen_dioxide&hourly=pm10,pm2_5,nitrogen_dioxide,us_aqi&timezone=auto&forecast_days=3`;
  const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m&timezone=auto`;

  const [aqRes, weatherRes] = await Promise.all([
    fetchWithTimeout(aqUrl, 3800),
    fetchWithTimeout(weatherUrl, 3500).catch(() => null),
  ]);

  if (!aqRes.ok) return null;
  const aqJson = (await aqRes.json()) as {
    current?: {
      time?: string;
      us_aqi?: number;
      pm10?: number;
      pm2_5?: number;
      nitrogen_dioxide?: number;
    };
    hourly?: {
      time?: string[];
      us_aqi?: (number | null)[];
      pm10?: (number | null)[];
      pm2_5?: (number | null)[];
      nitrogen_dioxide?: (number | null)[];
    };
  };

  if (!aqJson.current || aqJson.current.pm2_5 == null) {
    return null;
  }

  let tempC = defaultWeather?.tempC ?? 22;
  let humidityPct = defaultWeather?.humidityPct ?? 60;
  let windKmh = defaultWeather?.windKmh ?? 12;

  if (weatherRes && weatherRes.ok) {
    const wJson = (await weatherRes.json()) as {
      current?: {
        temperature_2m?: number;
        relative_humidity_2m?: number;
        wind_speed_10m?: number;
      };
    };
    if (wJson.current?.temperature_2m != null) tempC = Math.round(wJson.current.temperature_2m);
    if (wJson.current?.relative_humidity_2m != null)
      humidityPct = Math.round(wJson.current.relative_humidity_2m);
    if (wJson.current?.wind_speed_10m != null) windKmh = Math.round(wJson.current.wind_speed_10m);
  }

  const pm25Factor = nbFactors?.pm25Factor ?? 1;
  const pm10Factor = nbFactors?.pm10Factor ?? 1;
  const no2Factor = nbFactors?.no2Factor ?? 1;

  const pm25 = Number(((aqJson.current.pm2_5 ?? 18) * pm25Factor).toFixed(1));
  const pm10 = Number(((aqJson.current.pm10 ?? 34) * pm10Factor).toFixed(1));
  const no2 = Number(((aqJson.current.nitrogen_dioxide ?? 22) * no2Factor).toFixed(1));

  const aqiPm25 = pm25ToAqi(pm25);
  const aqiPm10 = pm10ToAqi(pm10);
  const aqiNo2 = no2ToAqi(no2);
  const aqi = Math.max(10, Math.min(480, Math.max(aqiPm25, aqiPm10, aqiNo2)));
  const status = getAqiStatus(aqi);

  const dominantPollutant =
    aqiPm25 >= aqiPm10 && aqiPm25 >= aqiNo2
      ? 'PM2.5'
      : aqiPm10 >= aqiNo2
      ? 'PM10'
      : 'NO2';

  const currentHourMatch = aqJson.current.time?.match(/T(\d{2}):/);
  const currentHour = currentHourMatch ? Number(currentHourMatch[1]) : new Date().getHours();

  const times = aqJson.hourly?.time ?? [];
  const buildDayHours = (dayIndex: number) => {
    const start = dayIndex * 24;
    const dayRaw = Array.from({ length: 24 }, (_, hourIdx) => {
      const idx = start + hourIdx;
      const hPm25Raw = aqJson.hourly?.pm2_5?.[idx];
      const hPm10Raw = aqJson.hourly?.pm10?.[idx];
      const hNo2Raw = aqJson.hourly?.nitrogen_dioxide?.[idx];
      const hPm25 = Number(((hPm25Raw ?? aqJson.current?.pm2_5 ?? 18) * pm25Factor).toFixed(1));
      const hPm10 = Number(((hPm10Raw ?? aqJson.current?.pm10 ?? 34) * pm10Factor).toFixed(1));
      const hNo2 = Number(
        ((hNo2Raw ?? aqJson.current?.nitrogen_dioxide ?? 22) * no2Factor).toFixed(1)
      );
      const hAqi = Math.max(
        10,
        Math.min(480, Math.max(pm25ToAqi(hPm25), pm10ToAqi(hPm10), no2ToAqi(hNo2)))
      );
      const hIndia = computeIndiaNaqi(hPm25, hPm10, hNo2);
      const parsedHour = times[idx]?.match(/T(\d{2}):/);
      const hr = parsedHour ? Number(parsedHour[1]) : hourIdx;
      return { hour24: hr, hAqi, hPm25, hNo2, hIndia };
    });

    const minAqi = Math.min(...dayRaw.map((h) => h.hAqi));
    const maxAqi = Math.max(...dayRaw.map((h) => h.hAqi));

    const pts: HourlyPoint[] = dayRaw.map((h) => ({
      hourLabel: formatHourLabel(h.hour24),
      hour24: h.hour24,
      aqi: h.hAqi,
      pm25: h.hPm25,
      no2: h.hNo2,
      status: getAqiStatus(h.hAqi),
      band: classifyHourBand(h.hAqi, minAqi, maxAqi),
      isCurrentHour: dayIndex === 0 && h.hour24 === currentHour,
    }));

    return { dayRaw, pts, minAqi, maxAqi };
  };

  const todayBlock = buildDayHours(0);
  const windows = computeWindows(todayBlock.pts);
  const indiaAqi = computeIndiaNaqi(pm25, pm10, no2);

  // Build 3-day outlook from live Open-Meteo 72h data
  const totalAvailableDays = Math.min(3, Math.max(1, Math.floor(times.length / 24) || 1));
  const dailyOutlook: DailyOutlookPoint[] = Array.from(
    { length: totalAvailableDays },
    (_, dayIdx) => {
      const block = dayIdx === 0 ? todayBlock : buildDayHours(dayIdx);
      const avgAqi = Math.round(
        block.pts.reduce((acc, h) => acc + h.aqi, 0) / block.pts.length
      );
      const indiaAvgAqi = Math.round(
        block.dayRaw.reduce((acc, h) => acc + h.hIndia, 0) / block.dayRaw.length
      );
      const dayWin = computeWindows(block.pts);
      const dateStr =
        times[dayIdx * 24]?.slice(0, 10) ??
        new Date(Date.now() + dayIdx * 86400000).toISOString().slice(0, 10);
      const parsedDate = new Date(`${dateStr}T12:00:00`);
      const dayLabel =
        dayIdx === 0
          ? 'Today'
          : dayIdx === 1
          ? 'Tomorrow'
          : parsedDate.toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
            });

      return {
        dayLabel,
        dateIso: dateStr,
        minAqi: block.minAqi,
        avgAqi,
        maxAqi: block.maxAqi,
        indiaAvgAqi,
        status: getAqiStatus(avgAqi),
        indiaStatus: getIndiaNaqiStatus(indiaAvgAqi),
        bestWindowLabel: dayWin.cleanestWindow.label,
      };
    }
  );

  return {
    city: resolvedCity,
    country: resolvedCountry || 'Monitoring Grid',
    neighborhood: resolvedNeighborhood || 'Central Area',
    zoneType,
    aqi,
    status,
    indiaAqi,
    indiaStatus: getIndiaNaqiStatus(indiaAqi),
    dominantPollutant,
    pm25,
    pm10,
    no2,
    tempC,
    humidityPct,
    windKmh,
    updatedAt: new Date().toISOString(),
    source: 'live',
    sourceLabel: 'Open-Meteo Live Model (Satellite + Weather)',
    hourly: todayBlock.pts,
    dailyOutlook,
    ...windows,
  };
}

async function fetchLiveOpenMeteo(
  cityQuery: string,
  neighborhoodQuery?: string
): Promise<AirQualityPayload | null> {
  const resolved = resolveCityAndNeighborhood(cityQuery, neighborhoodQuery);
  const preset = resolved.preset;
  let resolvedNbProfile = preset
    ? resolved.neighborhood ??
      (resolved.resolvedNeighborhoodName
        ? getCustomNeighborhoodFactors(preset.name, resolved.resolvedNeighborhoodName)
        : preset.neighborhoods[0])
    : resolved.resolvedNeighborhoodName
    ? getCustomNeighborhoodFactors(resolved.resolvedCityName, resolved.resolvedNeighborhoodName)
    : null;

  let lat = resolvedNbProfile?.lat ?? preset?.lat;
  let lon = resolvedNbProfile?.lon ?? preset?.lon;
  let resolvedCity = preset?.name ?? resolved.resolvedCityName;
  let resolvedCountry = preset?.country ?? '';
  let resolvedNeighborhoodLabel =
    resolvedNbProfile?.name ?? (neighborhoodQuery?.trim() || '');

  if (lat === undefined || lon === undefined) {
    const parts = cityQuery
      .split(/[,-]/)
      .map((s) => s.trim())
      .filter(Boolean);

    let match: GeoCandidate | null = null;
    if (parts.length === 2) {
      const [first, second] = parts;
      const areaMatch = await geocodeOpenMeteo(first, second);
      if (areaMatch) {
        match = areaMatch;
        const countryOrStateMatch =
          areaMatch.country?.toLowerCase().includes(second.toLowerCase()) ||
          areaMatch.admin1?.toLowerCase().includes(second.toLowerCase());

        if (countryOrStateMatch && !areaMatch.population) {
          resolvedCity = areaMatch.name;
          resolvedNeighborhoodLabel = neighborhoodQuery?.trim() || areaMatch.name;
        } else if (countryOrStateMatch) {
          resolvedCity = areaMatch.name;
        } else {
          resolvedCity = second
            .split(/\s+/)
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
            .join(' ');
          resolvedNeighborhoodLabel = areaMatch.name;
          resolvedNbProfile = getCustomNeighborhoodFactors(resolvedCity, areaMatch.name);
        }
      } else {
        const cityMatch = await geocodeOpenMeteo(second);
        if (cityMatch) {
          match = cityMatch;
          resolvedCity = cityMatch.name;
          resolvedNeighborhoodLabel =
            neighborhoodQuery?.trim() ||
            first
              .split(/\s+/)
              .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
              .join(' ');
          resolvedNbProfile = getCustomNeighborhoodFactors(
            resolvedCity,
            resolvedNeighborhoodLabel
          );
        }
      }
    } else {
      match = await geocodeOpenMeteo(resolved.resolvedCityName);
      if (match) {
        resolvedCity = match.name;
      }
    }

    if (!match) return null;
    lat = match.latitude;
    lon = match.longitude;
    resolvedCountry = [match.admin1, match.country].filter(Boolean).join(', ') || 'Global Station';
  }

  // If user requested a non-preset neighborhood inside any preset or global city,
  // refine coordinates to the exact neighborhood when found within 45 km of the city center.
  const hasPresetAreaCoords = Boolean(resolvedNbProfile?.lat !== undefined && resolvedNbProfile?.lon !== undefined);
  if (!hasPresetAreaCoords && resolvedNeighborhoodLabel && lat !== undefined && lon !== undefined) {
    const areaCoords = await geocodeNeighborhoodWithinCity(
      resolvedNeighborhoodLabel,
      resolvedCity,
      lat,
      lon
    );
    if (areaCoords) {
      lat = areaCoords.lat;
      lon = areaCoords.lon;
    }
  }

  return fetchLiveOpenMeteoForCoords({
    lat,
    lon,
    resolvedCity,
    resolvedCountry,
    resolvedNeighborhood: resolvedNeighborhoodLabel || resolvedNbProfile?.name || 'Central Area',
    zoneType: resolvedNbProfile?.zoneType ?? 'Urban Area',
    nbFactors: resolvedNbProfile,
    defaultWeather: preset
      ? { tempC: preset.tempC, humidityPct: preset.humidityPct, windKmh: preset.windKmh }
      : undefined,
  });
}

async function fetchLiveOpenMeteoByCoords(
  lat: number,
  lon: number
): Promise<AirQualityPayload | null> {
  const closestPreset = findClosestPresetByCoords(lat, lon);
  const rev = await reverseGeocodeCoords(lat, lon);

  const city = closestPreset?.preset.name ?? rev?.city ?? 'Your Location';
  const country = closestPreset?.preset.country ?? rev?.country ?? 'GPS Coordinates';
  const neighborhood =
    closestPreset?.neighborhood?.name ?? rev?.neighborhood ?? 'Nearby Area';

  const nbFactors =
    closestPreset?.neighborhood ??
    (neighborhood && neighborhood !== city
      ? getCustomNeighborhoodFactors(city, neighborhood)
      : null);

  return fetchLiveOpenMeteoForCoords({
    lat,
    lon,
    resolvedCity: city,
    resolvedCountry: country,
    resolvedNeighborhood: neighborhood,
    zoneType: nbFactors?.zoneType ?? 'Current GPS Location',
    nbFactors,
    defaultWeather: closestPreset?.preset
      ? {
          tempC: closestPreset.preset.tempC,
          humidityPct: closestPreset.preset.humidityPct,
          windKmh: closestPreset.preset.windKmh,
        }
      : undefined,
  });
}

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

app.get('/api/air-quality', async (req, res) => {
  const latParam = req.query.lat !== undefined ? Number(req.query.lat) : NaN;
  const lonParam = req.query.lon !== undefined ? Number(req.query.lon) : NaN;

  if (Number.isFinite(latParam) && Number.isFinite(lonParam)) {
    try {
      const gpsData = await fetchLiveOpenMeteoByCoords(latParam, lonParam);
      if (gpsData) {
        res.json(gpsData);
        return;
      }
    } catch {
      // Fall through cleanly if live coordinate lookup fails
    }
    const fallback = buildSimulatedAirQuality('Bengaluru', 'Indiranagar');
    res.json(fallback);
    return;
  }

  const city = String(req.query.city || 'Bengaluru').trim();
  const neighborhood = req.query.neighborhood ? String(req.query.neighborhood).trim() : undefined;

  if (!city) {
    res.status(400).json({ error: 'City parameter is required.' });
    return;
  }

  try {
    const liveData = await fetchLiveOpenMeteo(city, neighborhood);
    if (liveData) {
      res.json(liveData);
      return;
    }
  } catch {
    // Fall back gracefully to calibrated city telemetry when upstream network is unavailable
  }

  const simulated = buildSimulatedAirQuality(city, neighborhood);
  res.json(simulated);
});

app.post('/api/assistant', async (req, res) => {
  const { question, history, airQuality, profile } = req.body as {
    question?: string;
    history?: ChatMessage[];
    airQuality?: AirQualityPayload;
    profile?: UserProfile;
  };

  if (!question || typeof question !== 'string' || !question.trim()) {
    res.status(400).json({ error: 'Please enter a question for AeroSense.' });
    return;
  }

  if (!airQuality) {
    res.status(400).json({ error: 'Air quality context is required.' });
    return;
  }

  const selectedProfile: UserProfile = profile ?? 'general';

  let ai: GoogleGenAI;
  try {
    ai = getGeminiClient();
  } catch {
    res.json({
      answer: buildSmartAqiReply(question, airQuality, selectedProfile),
      mode: 'smart-rules',
    });
    return;
  }

  const profileLabels: Record<UserProfile, string> = {
    general: 'General Public',
    jogger: 'Jogger / Cyclist (high-ventilation outdoor cardio)',
    asthma: 'Asthma / Respiratory Sensitive',
    vulnerable: 'Child / Elderly Caregiver',
  };

  const activeProfile = profileLabels[selectedProfile] ?? profileLabels.general;

  const hourlySummary = airQuality.hourly
    .filter((_, idx) => idx % 2 === 0)
    .map((h) => `${h.hourLabel}: AQI ${h.aqi} (${h.band})`)
    .join(', ');

  const systemInstruction = `You are AeroSense, a calm, friendly, easy-to-understand everyday air quality guide.
Explain air quality in simple everyday language (no scary medical jargon, short clear bullets under 140 words) using the data below.

Current Location Data:
- Area: ${airQuality.neighborhood}, ${airQuality.city}, ${airQuality.country} (${airQuality.zoneType})
- Data Basis: ${airQuality.sourceLabel} (hourly regional Copernicus atmospheric model via Open-Meteo, gently adjusted for local traffic/greenery)
- US AQI Score: ${airQuality.aqi} (${airQuality.status})${airQuality.indiaAqi ? `\n- India CPCB Scale Equivalent: ~${airQuality.indiaAqi} (${airQuality.indiaStatus})` : ''}
- Main Pollutant: ${airQuality.dominantPollutant}
- PM2.5 (Tiny Particles): ${airQuality.pm25} µg/m³ (India 24h safe limit: 60 µg/m³)
- PM10 (Road Dust): ${airQuality.pm10} µg/m³ (India 24h safe limit: 100 µg/m³)
- NO2 (Traffic Exhaust): ${airQuality.no2} µg/m³ (India 24h safe limit: 80 µg/m³)
- Weather: ${airQuality.tempC}°C, ${airQuality.humidityPct}% humidity, ${airQuality.windKmh} km/h wind
- Cleanest 3h Window: ${airQuality.cleanestWindow.label} (avg AQI ${airQuality.cleanestWindow.avgAqi})
- Busy Traffic Window: ${airQuality.peakTrafficWindow.label} (avg AQI ${airQuality.peakTrafficWindow.avgAqi})
- 24h Trend: ${hourlySummary}
- User Profile: ${activeProfile}

Rules:
1. Keep the tone calm, honest, and reassuring—avoid alarmist wording. Mention exact numbers simply so anyone can follow.
2. If asked about data accuracy or why numbers look high/different, explain honestly that Open-Meteo uses a regional weather/satellite grid (~10–25 km) rather than a street sensor, so numbers can differ ~15–25% from roadside CPCB stations, and that US AQI runs stricter than India's CPCB scale.
3. For timing questions (like running at 6 PM), check the 24h trend and suggest the cleanest window if helpful.
4. Recommend masks (KN95/N95) only when needed for the profile and current traffic/AQI level.`;

  const conversationTurns = (history ?? []).slice(-6).map((msg) => ({
    role: msg.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: msg.content }],
  }));

  const contents = [
    ...conversationTurns,
    {
      role: 'user',
      parts: [{ text: question.trim() }],
    },
  ];

  const callModelWithTimeout = async (model: string, timeoutMs: number): Promise<string | null> => {
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('GEMINI_TIMEOUT')), timeoutMs)
    );
    const apiPromise = ai.models.generateContent({
      model,
      contents,
      config: {
        systemInstruction,
        thinkingConfig: {
          thinkingLevel:
            model === 'gemini-3.1-flash-lite'
              ? ThinkingLevel.MINIMAL
              : ThinkingLevel.LOW,
        },
      },
    });
    const response = await Promise.race([apiPromise, timeoutPromise]);
    return response.text?.trim() || null;
  };

  try {
    let answer: string | null = null;
    let shouldTrySecondary = true;

    try {
      answer = await callModelWithTimeout('gemini-4-hydrogen', 2800);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      // On 429 rate-limit or auth errors, skip secondary Gemini call and answer immediately via built-in rules
      if (
        /\b(400|401|403|429)\b/.test(msg) ||
        msg.includes('RESOURCE_EXHAUSTED') ||
        msg.includes('PERMISSION_DENIED') ||
        msg.includes('API_KEY_INVALID')
      ) {
        shouldTrySecondary = false;
      }
    }

    if (!answer && shouldTrySecondary) {
      try {
        answer = await callModelWithTimeout('gemini-3.1-flash-lite', 2200);
      } catch {
        // Fall through cleanly to built-in smart health & AQI rules
      }
    }

    if (answer) {
      res.json({ answer, mode: 'gemini' });
      return;
    }
  } catch {
    // Fall through cleanly to built-in smart health & AQI rules
  }

  res.json({
    answer: buildSmartAqiReply(question, airQuality, selectedProfile),
    mode: 'smart-rules',
  });
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`AeroSense server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
