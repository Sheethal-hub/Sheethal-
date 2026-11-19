import { useState } from 'react';
import {
  AlertTriangle,
  Bookmark,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Copy,
  Droplets,
  Flame,
  Info,
  ShieldAlert,
  Thermometer,
  Wind,
} from 'lucide-react';
import type { AirQualityPayload, AqiStatus, UserProfile } from '../types/airQuality';
import { buildShareableSummary } from '../utils/recommendations';

interface AqiHeroPanelProps {
  data: AirQualityPayload;
  profile: UserProfile;
  isLoading: boolean;
  isPinned: boolean;
  onTogglePin: () => void;
}

const STATUS_STYLE: Record<
  AqiStatus,
  {
    badgeClass: string;
    barColor: string;
    textAccent: string;
    summary: string;
    Icon: typeof CheckCircle2;
  }
> = {
  Good: {
    badgeClass: 'bg-emerald-500/12 text-emerald-800 border-emerald-500/25',
    barColor: 'bg-emerald-600',
    textAccent: 'text-emerald-700',
    summary: 'Fresh, clean air. Safe for walks, kids playing outside, and open windows.',
    Icon: CheckCircle2,
  },
  Moderate: {
    badgeClass: 'bg-amber-500/14 text-amber-900 border-amber-500/30',
    barColor: 'bg-amber-500',
    textAccent: 'text-amber-700',
    summary: 'Okay for everyday routines. Just go lighter near heavy road traffic.',
    Icon: AlertTriangle,
  },
  Poor: {
    badgeClass: 'bg-orange-500/15 text-orange-900 border-orange-500/35',
    barColor: 'bg-orange-600',
    textAccent: 'text-orange-700',
    summary: 'Noticeable haze or road dust. Normal short trips are okay; skip heavy runs on busy roads.',
    Icon: ShieldAlert,
  },
  Severe: {
    badgeClass: 'bg-rose-600/15 text-rose-900 border-rose-600/35',
    barColor: 'bg-rose-600',
    textAccent: 'text-rose-700',
    summary: 'Heavy pollution right now. Stay indoors when you can and wear an N95 mask outside.',
    Icon: Flame,
  },
};

const POLLUTANT_FRIENDLY_NAME: Record<AirQualityPayload['dominantPollutant'], string> = {
  'PM2.5': 'Tiny Particles (PM2.5)',
  PM10: 'Road Dust (PM10)',
  NO2: 'Traffic Exhaust (NO2)',
};

interface PollutantRow {
  label: string;
  formula: string;
  value: number;
  safeLimit: number;
  whoGoal: number;
  note: string;
}

export function AqiHeroPanel({
  data,
  profile,
  isLoading,
  isPinned,
  onTogglePin,
}: AqiHeroPanelProps) {
  const [showAccuracyInfo, setShowAccuracyInfo] = useState(false);
  const [copiedSummary, setCopiedSummary] = useState(false);

  const handleCopySummary = async () => {
    const summaryText = buildShareableSummary(data, profile);
    try {
      await navigator.clipboard.writeText(summaryText);
      setCopiedSummary(true);
      window.setTimeout(() => setCopiedSummary(false), 2400);
    } catch {
      // Clipboard fallback for older iframe contexts
      const el = document.createElement('textarea');
      el.value = summaryText;
      el.style.position = 'fixed';
      el.style.opacity = '0';
      document.body.appendChild(el);
      el.select();
      try {
        document.execCommand('copy');
        setCopiedSummary(true);
        window.setTimeout(() => setCopiedSummary(false), 2400);
      } finally {
        document.body.removeChild(el);
      }
    }
  };

  const style = STATUS_STYLE[data.status];
  const StatusIcon = style.Icon;
  const gaugePct = Math.min(100, Math.max(3, (data.aqi / 320) * 100));

  const updatedTime = new Date(data.updatedAt).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  const pollutants: PollutantRow[] = [
    {
      label: 'Tiny Particles',
      formula: 'PM2.5',
      value: data.pm25,
      safeLimit: 60,
      whoGoal: 15,
      note: 'Smoke & fine haze from vehicles and burning',
    },
    {
      label: 'Road & Site Dust',
      formula: 'PM10',
      value: data.pm10,
      safeLimit: 100,
      whoGoal: 45,
      note: 'Coarse dust from traffic, dry roads & construction',
    },
    {
      label: 'Traffic Exhaust',
      formula: 'NO2',
      value: data.no2,
      safeLimit: 80,
      whoGoal: 25,
      note: 'Fresh vehicle fumes near signals & main roads',
    },
  ];

  return (
    <section
      id="overview"
      aria-label="Current air quality overview"
      className={`glass-panel rounded-2xl p-6 sm:p-8 transition-opacity duration-200 ${
        isLoading ? 'opacity-70' : 'opacity-100'
      }`}
    >
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-stretch">
        {/* Left: Primary AQI Score & Status */}
        <div className="flex flex-col justify-between gap-6 lg:col-span-7 lg:pr-6">
          <div>
            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs font-medium text-slate-500">
              <span>{data.sourceLabel}</span>
              <span aria-hidden="true">·</span>
              <span>{data.zoneType}</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono tabular-nums">Updated {updatedTime}</span>
            </div>

            <div className="mt-3 flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl font-display">
                {data.neighborhood}
              </h1>
              <span className="text-lg font-medium text-slate-500">
                {data.city}, {data.country}
              </span>
            </div>
          </div>

          {/* AQI Readout + Explicit Status Indicator */}
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="text-xs font-semibold tracking-wide text-slate-500">
                Air Quality Score (Lower is Cleaner)
              </div>
              <div className="mt-1 flex items-baseline gap-3">
                <span className="font-display text-6xl font-bold tracking-tight text-slate-950 tabular-nums sm:text-7xl leading-none">
                  {data.aqi}
                </span>
                <span className="font-mono text-xs font-medium text-slate-500">
                  US AQI
                </span>
              </div>
              {data.indiaAqi !== undefined && data.indiaStatus && (
                <div className="mt-2 text-xs text-slate-600">
                  India CPCB Scale:{' '}
                  <span className="font-mono font-semibold text-slate-900 tabular-nums">
                    ~{data.indiaAqi}
                  </span>{' '}
                  <span className="font-medium text-slate-700">
                    ({data.indiaStatus})
                  </span>
                </div>
              )}
            </div>

            <div className="flex flex-col items-start sm:items-end gap-2">
              <div
                className={`inline-flex items-center gap-2 rounded-lg border px-3.5 py-2 text-sm font-semibold ${style.badgeClass}`}
              >
                <StatusIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span>Air Status: {data.status}</span>
              </div>
              <p className="text-xs text-slate-600 sm:text-right max-w-xs leading-relaxed">
                {style.summary}
              </p>
            </div>
          </div>

          {/* Spectrum Bar, Weather & Accuracy Basis Toggle */}
          <div className="space-y-4">
            <div>
              <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-slate-200/80">
                <div
                  className="absolute inset-0 opacity-85"
                  style={{
                    background:
                      'linear-gradient(90deg, #10b981 0%, #f59e0b 40%, #ea580c 70%, #dc2626 100%)',
                  }}
                />
                <div
                  className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-slate-950 shadow-md transition-all duration-300"
                  style={{ left: `${gaugePct}%` }}
                  aria-hidden="true"
                />
              </div>
              <div className="mt-1.5 flex justify-between font-mono text-[11px] text-slate-500 tabular-nums">
                <span>0–50 Good</span>
                <span>51–150 Moderate</span>
                <span>151–220 Poor</span>
                <span>221+ Severe</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-900/8 pt-3.5 text-xs text-slate-600">
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
                <div className="inline-flex items-center gap-1.5 font-mono tabular-nums">
                  <Thermometer className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
                  <span>{data.tempC}°C</span>
                </div>
                <div className="inline-flex items-center gap-1.5 font-mono tabular-nums">
                  <Droplets className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
                  <span>{data.humidityPct}% Humidity</span>
                </div>
                <div className="inline-flex items-center gap-1.5 font-mono tabular-nums">
                  <Wind className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
                  <span>{data.windKmh} km/h Wind</span>
                </div>
                <div className="text-slate-500">
                  Main factor:{' '}
                  <span className={`font-semibold ${style.textAccent}`}>
                    {POLLUTANT_FRIENDLY_NAME[data.dominantPollutant]}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={onTogglePin}
                  aria-pressed={isPinned}
                  className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    isPinned
                      ? 'border-slate-900 bg-slate-900 text-white'
                      : 'border-slate-900/12 bg-white/75 text-slate-700 hover:bg-white hover:text-slate-950'
                  }`}
                >
                  <Bookmark className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>{isPinned ? 'Saved' : 'Save Area'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => void handleCopySummary()}
                  className="inline-flex items-center gap-1.5 rounded-md border border-slate-900/12 bg-white/75 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-white hover:text-slate-950 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  {copiedSummary ? (
                    <Check className="h-3.5 w-3.5 text-emerald-700" aria-hidden="true" />
                  ) : (
                    <Copy className="h-3.5 w-3.5 text-slate-500" aria-hidden="true" />
                  )}
                  <span>{copiedSummary ? 'Copied Summary' : 'Share Summary'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowAccuracyInfo((prev) => !prev)}
                  aria-expanded={showAccuracyInfo}
                  className="inline-flex items-center gap-1.5 rounded-md border border-slate-900/12 bg-white/75 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-white hover:text-slate-950 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <Info className="h-3.5 w-3.5 text-slate-500" aria-hidden="true" />
                  <span>How accurate is this?</span>
                  {showAccuracyInfo ? (
                    <ChevronUp className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
                  ) : (
                    <ChevronDown className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
                  )}
                </button>
              </div>
            </div>

            {showAccuracyInfo && (
              <div className="rounded-xl border border-slate-900/10 bg-white/75 p-4 text-xs leading-relaxed text-slate-700 space-y-2">
                <div className="font-semibold text-slate-950">
                  Where these numbers come from &amp; how to read them:
                </div>
                <ul className="list-disc pl-4 space-y-1.5">
                  <li>
                    <strong>Weather &amp; Satellite Grid (Not a street sensor):</strong>{' '}
                    Live base data comes hourly from{' '}
                    <span className="font-medium">Open-Meteo (Copernicus atmospheric model)</span>{' '}
                    for your area&apos;s coordinates. Because it models a wide ~10–25 km zone, readings can differ by ~15–25% from a physical roadside government monitor.
                  </li>
                  <li>
                    <strong>Area Adjustments:</strong> Local wards adjust gently for green tree cover vs. busy ring-road traffic dust so you can compare pockets safely.
                  </li>
                  <li>
                    <strong>Why US AQI looks higher than local apps:</strong> The big score uses the stricter{' '}
                    <span className="font-medium">US EPA AQI</span> scale (which flags PM2.5 above 55 µg/m³ as 151+). Under{' '}
                    <span className="font-medium">India&apos;s official CPCB scale</span>, 101–200 is rated{' '}
                    <strong>Moderate</strong>, not an emergency.
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Right: Structured Pollutant Breakdown (Everyday Limits, Plain Language) */}
        <div className="flex flex-col justify-between border-t border-slate-900/10 pt-6 lg:col-span-5 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
          <div className="flex items-baseline justify-between pb-3 border-b border-slate-900/8">
            <h2 className="text-sm font-semibold text-slate-900">
              What&apos;s in the Air Today
            </h2>
            <span className="font-mono text-[11px] text-slate-500">
              vs. 24h Safe Limit
            </span>
          </div>

          <div className="divide-y divide-slate-900/8">
            {pollutants.map((p) => {
              const ratio = p.value / p.safeLimit;
              const levelLabel =
                p.value <= p.whoGoal
                  ? 'Very Clean'
                  : ratio <= 0.85
                  ? 'Safe Range'
                  : ratio <= 1.25
                  ? 'Near Safe Limit'
                  : 'Above Safe Limit';
              const levelColor =
                p.value <= p.whoGoal || ratio <= 0.85
                  ? 'text-emerald-700'
                  : ratio <= 1.25
                  ? 'text-amber-700'
                  : 'text-orange-700';
              const fillColor =
                p.value <= p.whoGoal || ratio <= 0.85
                  ? 'bg-emerald-500'
                  : ratio <= 1.25
                  ? 'bg-amber-500'
                  : 'bg-orange-500';
              const barPct = Math.min(100, Math.max(8, (p.value / (p.safeLimit * 1.8)) * 100));

              return (
                <div key={p.formula} className="py-4 first:pt-4 last:pb-1">
                  <div className="flex items-baseline justify-between gap-4">
                    <div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-sm font-semibold text-slate-950">
                          {p.label}
                        </span>
                        <span className="font-mono text-xs text-slate-500">
                          ({p.formula})
                        </span>
                      </div>
                      <p className="mt-0.5 text-xs text-slate-500">{p.note}</p>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="font-mono text-xl font-semibold text-slate-950 tabular-nums">
                        {p.value}
                        <span className="ml-1 text-xs font-normal text-slate-500">
                          µg/m³
                        </span>
                      </div>
                      <div className={`text-[11px] font-semibold ${levelColor}`}>
                        {levelLabel} · Safe ≤ {p.safeLimit}
                      </div>
                    </div>
                  </div>

                  <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-200/80">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${fillColor}`}
                      style={{ width: `${barPct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
