import { AlertTriangle, CheckCircle2, Droplets, Flame, ShieldAlert, Thermometer, Wind } from 'lucide-react';
import type { AirQualityPayload, AqiStatus } from '../types/airQuality';

interface AqiHeroPanelProps {
  data: AirQualityPayload;
  isLoading: boolean;
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
    summary: 'Clean atmospheric dispersion with minimal particulate burden.',
    Icon: CheckCircle2,
  },
  Moderate: {
    badgeClass: 'bg-amber-500/14 text-amber-900 border-amber-500/30',
    barColor: 'bg-amber-500',
    textAccent: 'text-amber-700',
    summary: 'Acceptable ambient air; sensitive lungs should limit roadside exertion.',
    Icon: AlertTriangle,
  },
  Poor: {
    badgeClass: 'bg-orange-500/15 text-orange-900 border-orange-500/35',
    barColor: 'bg-orange-600',
    textAccent: 'text-orange-700',
    summary: 'Elevated fine particulates accumulating along urban corridors.',
    Icon: ShieldAlert,
  },
  Severe: {
    badgeClass: 'bg-rose-600/15 text-rose-900 border-rose-600/35',
    barColor: 'bg-rose-600',
    textAccent: 'text-rose-700',
    summary: 'High pollution load; prioritize indoor filtration and N95 protection.',
    Icon: Flame,
  },
};

interface PollutantRow {
  label: string;
  formula: string;
  value: number;
  whoLimit: number;
  note: string;
}

export function AqiHeroPanel({ data, isLoading }: AqiHeroPanelProps) {
  const style = STATUS_STYLE[data.status];
  const StatusIcon = style.Icon;
  const gaugePct = Math.min(100, Math.max(3, (data.aqi / 320) * 100));

  const updatedTime = new Date(data.updatedAt).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  const pollutants: PollutantRow[] = [
    {
      label: 'Fine Particulates',
      formula: 'PM2.5',
      value: data.pm25,
      whoLimit: 15,
      note: 'Combustion & haze aerosols (<2.5 µm)',
    },
    {
      label: 'Coarse Dust',
      formula: 'PM10',
      value: data.pm10,
      whoLimit: 45,
      note: 'Road dust & construction particles',
    },
    {
      label: 'Nitrogen Dioxide',
      formula: 'NO2',
      value: data.no2,
      whoLimit: 25,
      note: 'Vehicle exhaust & arterial traffic load',
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
            <div className="flex items-baseline gap-4">
              <div>
                <div className="text-xs font-semibold tracking-wide text-slate-500">
                  Air Quality Index
                </div>
                <div className="mt-1 flex items-baseline gap-3">
                  <span className="font-display text-6xl font-bold tracking-tight text-slate-950 tabular-nums sm:text-7xl leading-none">
                    {data.aqi}
                  </span>
                  <span className="font-mono text-xs font-medium text-slate-400">
                    US AQI
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-start sm:items-end gap-2">
              <div
                className={`inline-flex items-center gap-2 rounded-lg border px-3.5 py-2 text-sm font-semibold ${style.badgeClass}`}
              >
                <StatusIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span>Status: {data.status}</span>
              </div>
              <p className="text-xs text-slate-600 sm:text-right max-w-xs">
                {style.summary}
              </p>
            </div>
          </div>

          {/* Spectrum Bar & Weather Micro-Metrics */}
          <div className="space-y-4">
            <div>
              <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-slate-200/80">
                <div
                  className="absolute inset-0 opacity-85"
                  style={{
                    background:
                      'linear-gradient(90deg, #10b981 0%, #f59e0b 36%, #ea580c 64%, #dc2626 100%)',
                  }}
                />
                <div
                  className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-slate-950 shadow-md transition-all duration-300"
                  style={{ left: `${gaugePct}%` }}
                  aria-hidden="true"
                />
              </div>
              <div className="mt-1.5 flex justify-between font-mono text-[11px] text-slate-500 tabular-nums">
                <span>0 Good</span>
                <span>51 Moderate</span>
                <span>121 Poor</span>
                <span>201+ Severe</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-slate-900/8 pt-3.5 text-xs text-slate-600">
              <div className="inline-flex items-center gap-1.5 font-mono tabular-nums">
                <Thermometer className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
                <span>{data.tempC}°C</span>
              </div>
              <div className="inline-flex items-center gap-1.5 font-mono tabular-nums">
                <Droplets className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
                <span>{data.humidityPct}% RH</span>
              </div>
              <div className="inline-flex items-center gap-1.5 font-mono tabular-nums">
                <Wind className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
                <span>{data.windKmh} km/h Wind</span>
              </div>
              <div className="text-slate-500">
                Primary driver:{' '}
                <span className={`font-semibold ${style.textAccent}`}>
                  {data.dominantPollutant}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Structured Pollutant Breakdown (Hairline dividers, zero nested cards) */}
        <div className="flex flex-col justify-between border-t border-slate-900/10 pt-6 lg:col-span-5 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
          <div className="flex items-baseline justify-between pb-3 border-b border-slate-900/8">
            <h2 className="text-sm font-semibold text-slate-900">
              Key Pollutants
            </h2>
            <span className="font-mono text-xs text-slate-500">
              vs. WHO 24h Guideline
            </span>
          </div>

          <div className="divide-y divide-slate-900/8">
            {pollutants.map((p) => {
              const ratio = p.value / p.whoLimit;
              const levelLabel =
                ratio <= 1
                  ? 'Within WHO'
                  : ratio <= 2.2
                  ? 'Elevated'
                  : 'High Load';
              const levelColor =
                ratio <= 1
                  ? 'text-emerald-700'
                  : ratio <= 2.2
                  ? 'text-amber-700'
                  : 'text-rose-700';
              const fillColor =
                ratio <= 1
                  ? 'bg-emerald-500'
                  : ratio <= 2.2
                  ? 'bg-amber-500'
                  : 'bg-rose-600';
              const barPct = Math.min(100, Math.max(8, (p.value / (p.whoLimit * 3.5)) * 100));

              return (
                <div key={p.formula} className="py-4 first:pt-4 last:pb-1">
                  <div className="flex items-baseline justify-between gap-4">
                    <div>
                      <div className="flex items-baseline gap-2">
                        <span className="font-mono text-sm font-semibold text-slate-950">
                          {p.formula}
                        </span>
                        <span className="text-xs text-slate-500">
                          {p.label}
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
                        {levelLabel} · {ratio.toFixed(1)}× WHO
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
