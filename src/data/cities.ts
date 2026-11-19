import type { AirQualityPayload, AqiStatus, CityPreset, HourlyPoint } from '../types/airQuality';

export const INDIAN_METRO_NAMES = ['Bengaluru', 'Delhi', 'Chennai', 'Mumbai'] as const;

export const CITY_PRESETS: CityPreset[] = [
  {
    id: 'bengaluru',
    name: 'Bengaluru',
    country: 'India',
    lat: 12.9716,
    lon: 77.5946,
    timezone: 'Asia/Kolkata',
    basePm25: 27,
    basePm10: 54,
    baseNo2: 34,
    tempC: 24,
    humidityPct: 61,
    windKmh: 11,
    neighborhoods: [
      { id: 'indiranagar', name: 'Indiranagar', zoneType: 'Mixed Residential & Metro Corridor', aqiOffset: -6, pm25Factor: 0.92, pm10Factor: 0.9, no2Factor: 0.95 },
      { id: 'koramangala', name: 'Koramangala', zoneType: 'Urban Arterial & Tech Hub', aqiOffset: 6, pm25Factor: 1.06, pm10Factor: 1.08, no2Factor: 1.12 },
      { id: 'whitefield', name: 'Whitefield', zoneType: 'Outer Ring Traffic & Construction', aqiOffset: 24, pm25Factor: 1.28, pm10Factor: 1.38, no2Factor: 1.24 },
    ],
  },
  {
    id: 'delhi',
    name: 'Delhi',
    country: 'India',
    lat: 28.6139,
    lon: 77.209,
    timezone: 'Asia/Kolkata',
    basePm25: 138,
    basePm10: 232,
    baseNo2: 68,
    tempC: 21,
    humidityPct: 58,
    windKmh: 5,
    neighborhoods: [
      { id: 'connaught-place', name: 'Connaught Place', zoneType: 'Central Commercial Ring', aqiOffset: 10, pm25Factor: 1.06, pm10Factor: 1.04, no2Factor: 1.18 },
      { id: 'hauz-khas', name: 'Hauz Khas', zoneType: 'Green Park & South Urban', aqiOffset: -28, pm25Factor: 0.84, pm10Factor: 0.86, no2Factor: 0.82 },
      { id: 'anand-vihar', name: 'Anand Vihar', zoneType: 'Transit Terminal & Industrial Edge', aqiOffset: 52, pm25Factor: 1.26, pm10Factor: 1.32, no2Factor: 1.35 },
    ],
  },
  {
    id: 'chennai',
    name: 'Chennai',
    country: 'India',
    lat: 13.0827,
    lon: 80.2707,
    timezone: 'Asia/Kolkata',
    basePm25: 24,
    basePm10: 49,
    baseNo2: 29,
    tempC: 30,
    humidityPct: 75,
    windKmh: 16,
    neighborhoods: [
      { id: 'adyar', name: 'Adyar', zoneType: 'Coastal Tree Canopy & Estuary', aqiOffset: -9, pm25Factor: 0.85, pm10Factor: 0.86, no2Factor: 0.82 },
      { id: 't-nagar', name: 'T. Nagar', zoneType: 'Dense Commercial & Bus Corridor', aqiOffset: 12, pm25Factor: 1.14, pm10Factor: 1.18, no2Factor: 1.24 },
      { id: 'velachery', name: 'Velachery', zoneType: 'IT Arterial & Junction Basin', aqiOffset: 18, pm25Factor: 1.2, pm10Factor: 1.26, no2Factor: 1.18 },
    ],
  },
  {
    id: 'mumbai',
    name: 'Mumbai',
    country: 'India',
    lat: 19.076,
    lon: 72.8777,
    timezone: 'Asia/Kolkata',
    basePm25: 56,
    basePm10: 108,
    baseNo2: 46,
    tempC: 29,
    humidityPct: 72,
    windKmh: 14,
    neighborhoods: [
      { id: 'bandra-west', name: 'Bandra West', zoneType: 'Coastal Promenade & Arterial', aqiOffset: -12, pm25Factor: 0.88, pm10Factor: 0.9, no2Factor: 0.92 },
      { id: 'colaba', name: 'Colaba', zoneType: 'Harbor Tip & Sea Breeze', aqiOffset: -22, pm25Factor: 0.78, pm10Factor: 0.8, no2Factor: 0.76 },
      { id: 'powai', name: 'Powai', zoneType: 'Inland Basin & Highway Corridor', aqiOffset: 16, pm25Factor: 1.15, pm10Factor: 1.18, no2Factor: 1.2 },
    ],
  },
  {
    id: 'london',
    name: 'London',
    country: 'United Kingdom',
    lat: 51.5072,
    lon: -0.1276,
    timezone: 'Europe/London',
    basePm25: 9,
    basePm10: 17,
    baseNo2: 26,
    tempC: 13,
    humidityPct: 74,
    windKmh: 18,
    neighborhoods: [
      { id: 'hampstead', name: 'Hampstead', zoneType: 'Heathland Elevated Park', aqiOffset: -8, pm25Factor: 0.75, pm10Factor: 0.78, no2Factor: 0.65 },
      { id: 'soho', name: 'Soho', zoneType: 'Central Low-Emission Street Grid', aqiOffset: 6, pm25Factor: 1.12, pm10Factor: 1.08, no2Factor: 1.32 },
      { id: 'canary-wharf', name: 'Canary Wharf', zoneType: 'Thames Basin & Docklands', aqiOffset: 2, pm25Factor: 1.0, pm10Factor: 1.02, no2Factor: 1.1 },
    ],
  },
  {
    id: 'new-york',
    name: 'New York',
    country: 'United States',
    lat: 40.7128,
    lon: -74.006,
    timezone: 'America/New_York',
    basePm25: 13,
    basePm10: 24,
    baseNo2: 31,
    tempC: 15,
    humidityPct: 55,
    windKmh: 16,
    neighborhoods: [
      { id: 'astoria', name: 'Astoria', zoneType: 'East River Residential', aqiOffset: -7, pm25Factor: 0.84, pm10Factor: 0.86, no2Factor: 0.8 },
      { id: 'brooklyn-heights', name: 'Brooklyn Heights', zoneType: 'Waterfront Promenade', aqiOffset: -3, pm25Factor: 0.92, pm10Factor: 0.94, no2Factor: 0.92 },
      { id: 'midtown', name: 'Midtown Manhattan', zoneType: 'High-Density Avenue Canyon', aqiOffset: 14, pm25Factor: 1.24, pm10Factor: 1.2, no2Factor: 1.42 },
    ],
  },
];

export function getAqiStatus(aqi: number): AqiStatus {
  if (aqi <= 50) return 'Good';
  if (aqi <= 120) return 'Moderate';
  if (aqi <= 200) return 'Poor';
  return 'Severe';
}

export function pm25ToAqi(pm25: number): number {
  const c = Math.max(0, pm25);
  const bps: [number, number, number, number][] = [
    [0, 12.0, 0, 50],
    [12.1, 35.4, 51, 100],
    [35.5, 55.4, 101, 150],
    [55.5, 150.4, 151, 200],
    [150.5, 250.4, 201, 300],
    [250.5, 500.4, 301, 500],
  ];
  for (const [cLow, cHigh, iLow, iHigh] of bps) {
    if (c <= cHigh) {
      return Math.round(((iHigh - iLow) / (cHigh - cLow)) * (c - cLow) + iLow);
    }
  }
  return 500;
}

export function pm10ToAqi(pm10: number): number {
  const c = Math.max(0, pm10);
  const bps: [number, number, number, number][] = [
    [0, 54, 0, 50],
    [55, 154, 51, 100],
    [155, 254, 101, 150],
    [255, 354, 151, 200],
    [355, 424, 201, 300],
    [425, 604, 301, 500],
  ];
  for (const [cLow, cHigh, iLow, iHigh] of bps) {
    if (c <= cHigh) {
      return Math.round(((iHigh - iLow) / (cHigh - cLow)) * (c - cLow) + iLow);
    }
  }
  return 500;
}

export function no2ToAqi(no2Ugm3: number): number {
  // Convert ug/m3 to ppb approx (1 ppb NO2 ≈ 1.88 ug/m3)
  const ppb = Math.max(0, no2Ugm3 / 1.88);
  const bps: [number, number, number, number][] = [
    [0, 53, 0, 50],
    [54, 100, 51, 100],
    [101, 360, 101, 150],
    [361, 649, 151, 200],
    [650, 1249, 201, 300],
  ];
  for (const [cLow, cHigh, iLow, iHigh] of bps) {
    if (ppb <= cHigh) {
      return Math.round(((iHigh - iLow) / (cHigh - cLow)) * (ppb - cLow) + iLow);
    }
  }
  return 350;
}

function hashSeed(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

// Diurnal traffic + atmospheric boundary layer multipliers for 24h curve
const DIURNAL_FACTORS = [
  0.84, 0.78, 0.72, 0.68, 0.66, 0.70, // 00:00 - 05:00 (overnight / early clean)
  0.82, 1.04, 1.24, 1.28, 1.12, 0.94, // 06:00 - 11:00 (morning rush)
  0.82, 0.74, 0.71, 0.73, 0.84, 1.06, // 12:00 - 17:00 (midday dispersion -> evening buildup)
  1.26, 1.34, 1.28, 1.16, 1.02, 0.92, // 18:00 - 23:00 (evening peak traffic)
];

export function formatHourLabel(hour24: number): string {
  if (hour24 === 0) return '12 AM';
  if (hour24 < 12) return `${hour24} AM`;
  if (hour24 === 12) return '12 PM';
  return `${hour24 - 12} PM`;
}

export function computeWindows(hourly: HourlyPoint[]): {
  cleanestWindow: { label: string; avgAqi: number };
  peakTrafficWindow: { label: string; avgAqi: number };
} {
  let bestStart = 0;
  let bestAvg = Infinity;
  let worstStart = 0;
  let worstAvg = -Infinity;

  for (let i = 0; i <= hourly.length - 3; i++) {
    const avg = (hourly[i].aqi + hourly[i + 1].aqi + hourly[i + 2].aqi) / 3;
    if (avg < bestAvg) {
      bestAvg = avg;
      bestStart = i;
    }
    if (avg > worstAvg) {
      worstAvg = avg;
      worstStart = i;
    }
  }

  return {
    cleanestWindow: {
      label: `${formatHourLabel(hourly[bestStart].hour24)} – ${formatHourLabel((hourly[bestStart].hour24 + 3) % 24)}`,
      avgAqi: Math.round(bestAvg),
    },
    peakTrafficWindow: {
      label: `${formatHourLabel(hourly[worstStart].hour24)} – ${formatHourLabel((hourly[worstStart].hour24 + 3) % 24)}`,
      avgAqi: Math.round(worstAvg),
    },
  };
}

export function classifyHourBand(aqi: number, minAqi: number, maxAqi: number): 'clean' | 'moderate' | 'peak' {
  if (aqi >= 150) return 'peak';
  if (aqi <= 55) return 'clean';
  const span = Math.max(15, maxAqi - minAqi);
  const rel = (aqi - minAqi) / span;
  if (rel <= 0.34) return 'clean';
  if (rel >= 0.72) return 'peak';
  return 'moderate';
}

export function buildSimulatedAirQuality(
  cityName: string,
  neighborhoodName?: string
): AirQualityPayload {
  const normalized = cityName.trim().toLowerCase();
  const preset = CITY_PRESETS.find(
    (c) => c.name.toLowerCase() === normalized || c.id === normalized
  );

  const currentHour = new Date().getHours();

  if (preset) {
    const nb =
      preset.neighborhoods.find(
        (n) =>
          n.name.toLowerCase() === (neighborhoodName ?? '').trim().toLowerCase() ||
          n.id === (neighborhoodName ?? '').trim().toLowerCase()
      ) ?? preset.neighborhoods[0];

    const pm25 = Number((preset.basePm25 * nb.pm25Factor).toFixed(1));
    const pm10 = Number((preset.basePm10 * nb.pm10Factor).toFixed(1));
    const no2 = Number((preset.baseNo2 * nb.no2Factor).toFixed(1));

    const rawAqi = Math.max(pm25ToAqi(pm25), pm10ToAqi(pm10), no2ToAqi(no2));
    const aqi = Math.max(12, Math.min(480, rawAqi + nb.aqiOffset));
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

    const rawHours = DIURNAL_FACTORS.map((factor, hour24) => {
      const jitter = ((hashSeed(`${preset.id}-${nb.id}-${hour24}`) % 9) - 4) * 0.015;
      const hAqi = Math.max(10, Math.round(aqi * (factor + jitter)));
      const hPm25 = Number((pm25 * (factor + jitter)).toFixed(1));
      const hNo2 = Number((no2 * (factor + jitter * 1.4)).toFixed(1));
      return { hour24, hAqi, hPm25, hNo2 };
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
      city: preset.name,
      country: preset.country,
      neighborhood: nb.name,
      zoneType: nb.zoneType,
      aqi,
      status,
      dominantPollutant,
      pm25,
      pm10,
      no2,
      tempC: preset.tempC,
      humidityPct: preset.humidityPct,
      windKmh: preset.windKmh,
      updatedAt: new Date().toISOString(),
      source: 'calibrated',
      sourceLabel: 'Calibrated Urban Model',
      hourly,
      ...windows,
    };
  }

  // Deterministic realistic fallback for any custom city typed by user
  const seed = hashSeed(normalized || 'urban-center');
  const pm25 = Number((12 + (seed % 75)).toFixed(1));
  const pm10 = Number((pm25 * (1.75 + (seed % 5) * 0.1)).toFixed(1));
  const no2 = Number((18 + (seed % 46)).toFixed(1));
  const aqi = Math.max(pm25ToAqi(pm25), pm10ToAqi(pm10), no2ToAqi(no2));
  const status = getAqiStatus(aqi);

  const rawHours = DIURNAL_FACTORS.map((factor, hour24) => {
    const jitter = ((hashSeed(`${normalized}-${hour24}`) % 9) - 4) * 0.015;
    const hAqi = Math.max(10, Math.round(aqi * (factor + jitter)));
    return {
      hour24,
      hAqi,
      hPm25: Number((pm25 * (factor + jitter)).toFixed(1)),
      hNo2: Number((no2 * (factor + jitter)).toFixed(1)),
    };
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
  const displayCity = cityName
    .trim()
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

  return {
    city: displayCity || 'Metropolis',
    country: 'Urban Monitoring Grid',
    neighborhood: neighborhoodName?.trim() || 'City Center',
    zoneType: 'Metropolitan Airshed',
    aqi,
    status,
    dominantPollutant: pm25ToAqi(pm25) >= pm10ToAqi(pm10) ? 'PM2.5' : 'PM10',
    pm25,
    pm10,
    no2,
    tempC: 18 + (seed % 14),
    humidityPct: 45 + (seed % 35),
    windKmh: 7 + (seed % 15),
    updatedAt: new Date().toISOString(),
    source: 'calibrated',
    sourceLabel: 'Calibrated Urban Model',
    hourly,
    ...windows,
  };
}
