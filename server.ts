import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';
import {
  CITY_PRESETS,
  buildSimulatedAirQuality,
  classifyHourBand,
  computeWindows,
  formatHourLabel,
  getAqiStatus,
  no2ToAqi,
  pm10ToAqi,
  pm25ToAqi,
} from './src/data/cities.ts';
import type { AirQualityPayload, ChatMessage, HourlyPoint, UserProfile } from './src/types/airQuality.ts';
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

async function fetchLiveOpenMeteo(
  cityQuery: string,
  neighborhoodQuery?: string
): Promise<AirQualityPayload | null> {
  const normalized = cityQuery.trim().toLowerCase();
  const preset = CITY_PRESETS.find(
    (c) => c.name.toLowerCase() === normalized || c.id === normalized
  );

  let lat = preset?.lat;
  let lon = preset?.lon;
  let resolvedCity = preset?.name ?? cityQuery.trim();
  let resolvedCountry = preset?.country ?? '';

  if (lat === undefined || lon === undefined) {
    const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
      cityQuery.trim()
    )}&count=1&language=en&format=json`;
    const geoRes = await fetchWithTimeout(geoUrl, 3000);
    if (!geoRes.ok) return null;
    const geoJson = (await geoRes.json()) as {
      results?: { name: string; country?: string; latitude: number; longitude: number }[];
    };
    const match = geoJson.results?.[0];
    if (!match) return null;
    lat = match.latitude;
    lon = match.longitude;
    resolvedCity = match.name;
    resolvedCountry = match.country ?? 'Global Station';
  }

  const aqUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=us_aqi,pm10,pm2_5,nitrogen_dioxide&hourly=pm10,pm2_5,nitrogen_dioxide,us_aqi&timezone=auto&forecast_days=1`;
  const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m&timezone=auto`;

  const [aqRes, weatherRes] = await Promise.all([
    fetchWithTimeout(aqUrl, 3500),
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
      pm2_5?: (number | null)[];
      nitrogen_dioxide?: (number | null)[];
    };
  };

  if (!aqJson.current || aqJson.current.pm2_5 == null) {
    return null;
  }

  let tempC = preset?.tempC ?? 20;
  let humidityPct = preset?.humidityPct ?? 60;
  let windKmh = preset?.windKmh ?? 12;

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

  const nb = preset
    ? preset.neighborhoods.find(
        (n) =>
          n.name.toLowerCase() === (neighborhoodQuery ?? '').trim().toLowerCase() ||
          n.id === (neighborhoodQuery ?? '').trim().toLowerCase()
      ) ?? preset.neighborhoods[0]
    : null;

  const pm25Factor = nb?.pm25Factor ?? 1;
  const pm10Factor = nb?.pm10Factor ?? 1;
  const no2Factor = nb?.no2Factor ?? 1;
  const aqiOffset = nb?.aqiOffset ?? 0;

  const pm25 = Number(((aqJson.current.pm2_5 ?? 18) * pm25Factor).toFixed(1));
  const pm10 = Number(((aqJson.current.pm10 ?? 34) * pm10Factor).toFixed(1));
  const no2 = Number(((aqJson.current.nitrogen_dioxide ?? 22) * no2Factor).toFixed(1));

  const computedAqi = Math.max(
    aqJson.current.us_aqi ?? 0,
    pm25ToAqi(pm25),
    pm10ToAqi(pm10),
    no2ToAqi(no2)
  );
  const aqi = Math.max(10, Math.min(480, Math.round(computedAqi + aqiOffset)));
  const status = getAqiStatus(aqi);

  const aqiPm25 = pm25ToAqi(pm25);
  const aqiPm10 = pm10ToAqi(pm10);
  const aqiNo2 = no2ToAqi(no2);
  const dominantPollutant =
    aqiPm25 >= aqiPm10 && aqiPm25 >= aqiNo2
      ? 'PM2.5'
      : aqiPm10 >= aqiNo2
      ? 'PM10'
      : 'NO2';

  const currentHourMatch = aqJson.current.time?.match(/T(\d{2}):/);
  const currentHour = currentHourMatch ? Number(currentHourMatch[1]) : new Date().getHours();

  const times = aqJson.hourly?.time ?? [];
  const rawHours = Array.from({ length: 24 }, (_, hour24) => {
    const hAqiRaw = aqJson.hourly?.us_aqi?.[hour24];
    const hPm25Raw = aqJson.hourly?.pm2_5?.[hour24];
    const hNo2Raw = aqJson.hourly?.nitrogen_dioxide?.[hour24];
    const hPm25 = Number(((hPm25Raw ?? aqJson.current?.pm2_5 ?? 18) * pm25Factor).toFixed(1));
    const hNo2 = Number(
      ((hNo2Raw ?? aqJson.current?.nitrogen_dioxide ?? 22) * no2Factor).toFixed(1)
    );
    const baseHourAqi =
      hAqiRaw != null ? Math.round(hAqiRaw + aqiOffset) : Math.round(pm25ToAqi(hPm25) + aqiOffset);
    const hAqi = Math.max(10, Math.min(480, baseHourAqi));

    const parsedHour = times[hour24]?.match(/T(\d{2}):/);
    const hr = parsedHour ? Number(parsedHour[1]) : hour24;
    return { hour24: hr, hAqi, hPm25, hNo2 };
  });

  const minAqi = Math.min(...rawHours.map((h) => h.hAqi));
  const maxAqi = Math.max(...rawHours.map((h) => h.hAqi));

  const hourly: HourlyPoint[] = rawHours.map((h) => ({
    hourLabel: formatHourLabel(h.hour24),
    hour24: h.hour24,
    aqi: h.hAqi,
    pm25: h.hPm25,
    no2: h.hNo2,
    status: getAqiStatus(h.hAqi),
    band: classifyHourBand(h.hAqi, minAqi, maxAqi),
    isCurrentHour: h.hour24 === currentHour,
  }));

  const windows = computeWindows(hourly);

  return {
    city: resolvedCity,
    country: resolvedCountry || 'Monitoring Grid',
    neighborhood: nb?.name ?? (neighborhoodQuery?.trim() || 'Central Station'),
    zoneType: nb?.zoneType ?? 'Urban Airshed',
    aqi,
    status,
    dominantPollutant,
    pm25,
    pm10,
    no2,
    tempC,
    humidityPct,
    windKmh,
    updatedAt: new Date().toISOString(),
    source: 'live',
    sourceLabel: 'Live Sensor Feed · Open-Meteo',
    hourly,
    ...windows,
  };
}

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

app.get('/api/air-quality', async (req, res) => {
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

  const systemInstruction = `You are AeroSense, an evidence-based urban air quality and respiratory health assistant.
Give clear, practical, empathetic, and concise guidance (usually 2–4 short paragraphs or crisp bullet points, under 150 words) strictly grounded in the live dashboard telemetry provided below.

Current Station Context:
- City & Neighborhood: ${airQuality.city}, ${airQuality.country} — ${airQuality.neighborhood} (${airQuality.zoneType})
- Overall AQI: ${airQuality.aqi} (${airQuality.status})
- Dominant Pollutant: ${airQuality.dominantPollutant}
- Fine Particulates PM2.5: ${airQuality.pm25} µg/m³ (WHO 24h guideline: 15 µg/m³)
- Coarse Particulates PM10: ${airQuality.pm10} µg/m³ (WHO 24h guideline: 45 µg/m³)
- Nitrogen Dioxide NO2: ${airQuality.no2} µg/m³ (WHO 24h guideline: 25 µg/m³)
- Meteorology: ${airQuality.tempC}°C, ${airQuality.humidityPct}% humidity, ${airQuality.windKmh} km/h wind
- Cleanest 3h Window Today: ${airQuality.cleanestWindow.label} (avg AQI ${airQuality.cleanestWindow.avgAqi})
- Peak Traffic Window Today: ${airQuality.peakTrafficWindow.label} (avg AQI ${airQuality.peakTrafficWindow.avgAqi})
- Sampled 24h Curve: ${hourlySummary}
- Active User Profile: ${activeProfile}

Rules:
1. Reference the exact numbers from the context (AQI, PM2.5, NO2, or specific time windows) so the advice feels tailored to ${airQuality.neighborhood}.
2. When asked about timing (e.g., running at 6 PM), check the 24h curve and compare against the cleanest window.
3. Recommend specific mask grades (e.g., N95/FFP2/KN95) only when justified by AQI/PM2.5/NO2 and the user's profile; never give false reassurance when AQI is Poor or Severe.
4. For medical emergencies or worsening asthma symptoms, briefly advise consulting a clinician or using prescribed rescue medication.`;

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
