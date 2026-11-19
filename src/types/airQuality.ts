export type AqiStatus = 'Good' | 'Moderate' | 'Poor' | 'Severe';

export type UserProfile =
  | 'general'
  | 'jogger'
  | 'asthma'
  | 'vulnerable';

export interface NeighborhoodPreset {
  id: string;
  name: string;
  aliases?: string[];
  zoneType: string;
  lat?: number;
  lon?: number;
  pm25Factor: number;
  pm10Factor: number;
  no2Factor: number;
}

export interface CityPreset {
  id: string;
  name: string;
  aliases?: string[];
  country: string;
  lat: number;
  lon: number;
  timezone: string;
  basePm25: number;
  basePm10: number;
  baseNo2: number;
  tempC: number;
  humidityPct: number;
  windKmh: number;
  neighborhoods: NeighborhoodPreset[];
}

export interface HourlyPoint {
  hourLabel: string;
  hour24: number;
  aqi: number;
  pm25: number;
  no2: number;
  status: AqiStatus;
  band: 'clean' | 'moderate' | 'peak';
  isCurrentHour: boolean;
}

export interface DailyOutlookPoint {
  dayLabel: string;
  dateIso: string;
  minAqi: number;
  avgAqi: number;
  maxAqi: number;
  indiaAvgAqi: number;
  status: AqiStatus;
  indiaStatus: string;
  bestWindowLabel: string;
}

export interface PinnedLocation {
  id: string;
  city: string;
  neighborhood: string;
  aqi: number;
  indiaAqi?: number;
  status: AqiStatus;
}

export interface AirQualityPayload {
  city: string;
  country: string;
  neighborhood: string;
  zoneType: string;
  aqi: number;
  status: AqiStatus;
  indiaAqi?: number;
  indiaStatus?: string;
  dominantPollutant: 'PM2.5' | 'PM10' | 'NO2';
  pm25: number;
  pm10: number;
  no2: number;
  tempC: number;
  humidityPct: number;
  windKmh: number;
  updatedAt: string;
  source: 'live' | 'calibrated';
  sourceLabel: string;
  hourly: HourlyPoint[];
  dailyOutlook?: DailyOutlookPoint[];
  cleanestWindow: {
    label: string;
    avgAqi: number;
  };
  peakTrafficWindow: {
    label: string;
    avgAqi: number;
  };
}

export interface AdviceItem {
  category: 'exercise' | 'mask' | 'ventilation';
  title: string;
  verdict: string;
  tone: 'emerald' | 'amber' | 'orange' | 'crimson';
  detail: string;
  timingNote: string;
}

export interface QuickExposureTip {
  index: string;
  title: string;
  description: string;
  metricImpact: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}
