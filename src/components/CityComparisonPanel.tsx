import { useState, type FormEvent } from 'react';
import { ArrowLeftRight, CheckCircle2, AlertTriangle, ShieldAlert, Flame, Search, X } from 'lucide-react';
import { CITY_PRESETS } from '../data/cities';
import type { AirQualityPayload, AqiStatus, UserProfile } from '../types/airQuality';
import { getHealthRecommendations, USER_PROFILES } from '../utils/recommendations';

interface CityComparisonPanelProps {
  cityA: AirQualityPayload;
  cityB: AirQualityPayload;
  profile: UserProfile;
  isLoadingB: boolean;
  onSelectCityB: (city: string, neighborhood?: string) => void;
  onSwapCities: () => void;
  onClose: () => void;
}

const STATUS_BADGE: Record<AqiStatus, { cls: string; Icon: typeof CheckCircle2 }> = {
  Good: { cls: 'bg-emerald-500/12 text-emerald-800 border-emerald-500/25', Icon: CheckCircle2 },
  Moderate: { cls: 'bg-amber-500/14 text-amber-900 border-amber-500/30', Icon: AlertTriangle },
  Poor: { cls: 'bg-orange-500/15 text-orange-900 border-orange-500/35', Icon: ShieldAlert },
  Severe: { cls: 'bg-rose-600/15 text-rose-900 border-rose-600/35', Icon: Flame },
};

function DeltaChip({
  diff,
  unit = '',
}: {
  diff: number;
  unit?: string;
}) {
  if (Math.abs(diff) < 0.5) {
    return (
      <span className="font-mono text-xs font-medium text-slate-500 tabular-nums">
        Equal
      </span>
    );
  }
  const rounded = Number.isInteger(diff) ? diff : Number(diff.toFixed(1));
  const isCleaner = diff < 0;
  return (
    <span
      className={`font-mono text-xs font-semibold tabular-nums ${
        isCleaner ? 'text-emerald-700' : 'text-rose-700'
      }`}
    >
      {isCleaner ? `${rounded}${unit} cleaner` : `+${rounded}${unit} higher`}
    </span>
  );
}

export function CityComparisonPanel({
  cityA,
  cityB,
  profile,
  isLoadingB,
  onSelectCityB,
  onSwapCities,
  onClose,
}: CityComparisonPanelProps) {
  const [searchB, setSearchB] = useState('');
  const [hoverHour, setHoverHour] = useState<number>(() => {
    const idx = cityA.hourly.findIndex((h) => h.isCurrentHour);
    return idx >= 0 ? idx : 12;
  });

  const presetB = CITY_PRESETS.find(
    (c) => c.name.toLowerCase() === cityB.city.trim().toLowerCase()
  );

  const handleSearchB = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = searchB.trim();
    if (!trimmed) return;
    onSelectCityB(trimmed);
    setSearchB('');
  };

  const aqiDiff = cityA.aqi - cityB.aqi;
  const headlineVerdict =
    aqiDiff === 0
      ? `${cityA.city} and ${cityB.city} share the exact same AQI (${cityA.aqi}) right now.`
      : aqiDiff < 0
      ? `${cityA.city} (${cityA.neighborhood}) is ${Math.abs(aqiDiff)} AQI points cleaner than ${cityB.city} (${cityB.neighborhood}).`
      : `${cityB.city} (${cityB.neighborhood}) is ${Math.abs(aqiDiff)} AQI points cleaner than ${cityA.city} (${cityA.neighborhood}).`;

  const adviceA = getHealthRecommendations(cityA, profile);
  const adviceB = getHealthRecommendations(cityB, profile);
  const profileLabel =
    USER_PROFILES.find((p) => p.id === profile)?.label ?? 'General Public';

  // Dual-curve SVG dimensions
  const width = 680;
  const height = 186;
  const padLeft = 36;
  const padRight = 14;
  const padTop = 16;
  const padBottom = 28;
  const plotW = width - padLeft - padRight;
  const plotH = height - padTop - padBottom;
  const maxVal = Math.max(
    80,
    ...cityA.hourly.map((h) => h.aqi),
    ...cityB.hourly.map((h) => h.aqi)
  ) * 1.12;

  const slotW = plotW / 24;
  const pointsA = cityA.hourly
    .map((h, i) => {
      const x = padLeft + i * slotW + slotW / 2;
      const y = padTop + plotH - (h.aqi / maxVal) * plotH;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');
  const pointsB = cityB.hourly
    .map((h, i) => {
      const x = padLeft + i * slotW + slotW / 2;
      const y = padTop + plotH - (h.aqi / maxVal) * plotH;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  const hoverA = cityA.hourly[hoverHour] ?? cityA.hourly[0];
  const hoverB = cityB.hourly[hoverHour] ?? cityB.hourly[0];

  const badgeA = STATUS_BADGE[cityA.status];
  const badgeB = STATUS_BADGE[cityB.status];
  const IconA = badgeA.Icon;
  const IconB = badgeB.Icon;

  return (
    <section
      aria-label="Side-by-side city comparison"
      className="glass-panel rounded-2xl p-6 sm:p-8"
    >
      {/* Top Bar: Title + Controls */}
      <div className="flex flex-col gap-4 border-b border-slate-900/8 pb-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <ArrowLeftRight className="h-5 w-5 text-slate-800" aria-hidden="true" />
            <h2 className="text-xl font-bold tracking-tight text-slate-950 sm:text-2xl font-display">
              City Comparison Mode
            </h2>
          </div>
          <p className="mt-1 text-sm font-medium text-slate-700">
            {headlineVerdict}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onSwapCities}
            disabled={isLoadingB}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0 min-h-[38px] cursor-pointer"
          >
            <ArrowLeftRight className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Swap Cities</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900/8 px-3.5 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-900/15 transition-colors whitespace-nowrap shrink-0 min-h-[38px] cursor-pointer"
          >
            <X className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Close Compare</span>
          </button>
        </div>
      </div>

      {/* City B Picker Strip */}
      <div className="mt-4 flex flex-col gap-3 rounded-xl border border-slate-900/8 bg-white/55 p-3.5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="mr-1 text-xs font-semibold text-slate-500 whitespace-nowrap shrink-0">
            Compare Against (City B):
          </span>
          {CITY_PRESETS.map((city) => {
            const active =
              city.name.toLowerCase() === cityB.city.trim().toLowerCase();
            return (
              <button
                key={city.id}
                type="button"
                disabled={isLoadingB}
                onClick={() =>
                  onSelectCityB(city.name, city.neighborhoods[0].name)
                }
                className={`rounded-md px-2.5 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 min-h-[34px] cursor-pointer ${
                  active
                    ? 'bg-slate-900 text-white'
                    : 'bg-white/80 text-slate-700 hover:bg-white hover:text-slate-950 border border-slate-200/80'
                }`}
              >
                {city.name}
              </button>
            );
          })}

          {presetB && (
            <select
              aria-label="Select neighborhood for City B"
              value={cityB.neighborhood}
              onChange={(e) => onSelectCityB(cityB.city, e.target.value)}
              className="ml-1 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-800 min-h-[34px] cursor-pointer"
            >
              {presetB.neighborhoods.map((nb) => (
                <option key={nb.id} value={nb.name}>
                  {nb.name}
                </option>
              ))}
            </select>
          )}
        </div>

        <form onSubmit={handleSearchB} className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-52">
            <Search
              className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400"
              aria-hidden="true"
            />
            <input
              type="text"
              value={searchB}
              onChange={(e) => setSearchB(e.target.value)}
              placeholder="Search City B..."
              aria-label="Search comparison city"
              className="w-full rounded-md border border-slate-200 bg-white py-1.5 pl-8 pr-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:outline-none min-h-[34px]"
            />
          </div>
          <button
            type="submit"
            disabled={!searchB.trim() || isLoadingB}
            className="rounded-md bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 whitespace-nowrap shrink-0 min-h-[34px] cursor-pointer disabled:opacity-45"
          >
            Set City B
          </button>
        </form>
      </div>

      {/* Side-by-Side Core Metrics Grid */}
      <div
        className={`mt-6 grid grid-cols-1 gap-6 divide-y divide-slate-900/8 md:grid-cols-2 md:gap-0 md:divide-x md:divide-y-0 transition-opacity ${
          isLoadingB ? 'opacity-70' : 'opacity-100'
        }`}
      >
        {[
          { label: 'City A (Primary)', payload: cityA, other: cityB, badge: badgeA, Icon: IconA },
          { label: 'City B (Comparison)', payload: cityB, other: cityA, badge: badgeB, Icon: IconB },
        ].map((col, idx) => {
          const ColIcon = col.Icon;
          return (
            <div
              key={col.label}
              className={idx === 0 ? 'pb-6 md:pb-0 md:pr-6' : 'pt-6 md:pt-0 md:pl-6'}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-xs font-semibold text-slate-500">
                    {col.label} · {col.payload.sourceLabel}
                  </div>
                  <h3 className="mt-1 text-2xl font-bold text-slate-950 font-display">
                    {col.payload.city}
                    <span className="ml-2 text-base font-medium text-slate-500">
                      {col.payload.neighborhood}
                    </span>
                  </h3>
                </div>

                <div
                  className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-semibold whitespace-nowrap shrink-0 ${col.badge.cls}`}
                >
                  <ColIcon className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>{col.payload.status}</span>
                </div>
              </div>

              {/* AQI & Delta */}
              <div className="mt-4 flex items-baseline justify-between border-b border-slate-900/8 pb-4">
                <div className="flex items-baseline gap-2.5">
                  <span className="font-display text-5xl font-bold text-slate-950 tabular-nums">
                    {col.payload.aqi}
                  </span>
                  <span className="font-mono text-xs text-slate-500">US AQI</span>
                </div>
                <DeltaChip diff={col.payload.aqi - col.other.aqi} unit=" AQI" />
              </div>

              {/* Pollutant & Weather Comparison Table */}
              <div className="mt-3 divide-y divide-slate-900/6 text-xs">
                <div className="flex items-center justify-between py-2.5">
                  <span className="font-medium text-slate-600">PM2.5 Fine Particulates</span>
                  <div className="flex items-center gap-3 font-mono tabular-nums">
                    <span className="font-semibold text-slate-950">
                      {col.payload.pm25} µg/m³
                    </span>
                    <DeltaChip diff={col.payload.pm25 - col.other.pm25} />
                  </div>
                </div>
                <div className="flex items-center justify-between py-2.5">
                  <span className="font-medium text-slate-600">PM10 Coarse Dust</span>
                  <div className="flex items-center gap-3 font-mono tabular-nums">
                    <span className="font-semibold text-slate-950">
                      {col.payload.pm10} µg/m³
                    </span>
                    <DeltaChip diff={col.payload.pm10 - col.other.pm10} />
                  </div>
                </div>
                <div className="flex items-center justify-between py-2.5">
                  <span className="font-medium text-slate-600">NO2 Traffic Exhaust</span>
                  <div className="flex items-center gap-3 font-mono tabular-nums">
                    <span className="font-semibold text-slate-950">
                      {col.payload.no2} µg/m³
                    </span>
                    <DeltaChip diff={col.payload.no2 - col.other.no2} />
                  </div>
                </div>
                <div className="flex items-center justify-between py-2.5">
                  <span className="font-medium text-slate-600">Cleanest 3h Window</span>
                  <span className="font-mono font-semibold text-emerald-800 tabular-nums">
                    {col.payload.cleanestWindow.label} (AQI {col.payload.cleanestWindow.avgAqi})
                  </span>
                </div>
                <div className="flex items-center justify-between py-2.5">
                  <span className="font-medium text-slate-600">Weather &amp; Dispersion</span>
                  <span className="font-mono text-slate-700 tabular-nums">
                    {col.payload.tempC}°C · {col.payload.humidityPct}% RH · {col.payload.windKmh} km/h
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Dual-City 24h Overlaid Curve + Health Verdict Delta */}
      <div className="mt-6 grid grid-cols-1 gap-6 border-t border-slate-900/10 pt-6 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-sm font-semibold text-slate-900">
              24-Hour Overlaid AQI Curve
            </h3>
            <div className="flex items-center gap-4 text-xs font-medium">
              <span className="inline-flex items-center gap-1.5 text-slate-900">
                <span className="h-0.5 w-4 bg-slate-900" aria-hidden="true" />
                {cityA.city}
              </span>
              <span className="inline-flex items-center gap-1.5 text-slate-600">
                <span
                  className="h-0.5 w-4 border-t-2 border-dashed border-rose-600"
                  aria-hidden="true"
                />
                {cityB.city}
              </span>
            </div>
          </div>

          {hoverA && hoverB && (
            <div className="mt-2 flex flex-wrap items-center justify-between gap-2 rounded-lg bg-white/70 px-3 py-2 text-xs border border-slate-900/8 font-mono tabular-nums">
              <span className="font-semibold text-slate-900">{hoverA.hourLabel}</span>
              <div className="flex items-center gap-4">
                <span className="text-slate-900">
                  {cityA.city}: <strong>{hoverA.aqi}</strong>
                </span>
                <span className="text-rose-700">
                  {cityB.city}: <strong>{hoverB.aqi}</strong>
                </span>
              </div>
            </div>
          )}

          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="mt-2 h-44 w-full select-none"
            role="img"
            aria-label={`24 hour AQI comparison between ${cityA.city} and ${cityB.city}`}
          >
            {[0, 0.5, 1].map((frac) => {
              const val = Math.round(maxVal * frac);
              const y = padTop + plotH - frac * plotH;
              return (
                <g key={frac}>
                  <line
                    x1={padLeft}
                    y1={y}
                    x2={width - padRight}
                    y2={y}
                    stroke="rgba(15, 23, 42, 0.08)"
                    strokeDasharray={frac === 0 ? undefined : '3 3'}
                  />
                  <text
                    x={padLeft - 8}
                    y={y + 3.5}
                    textAnchor="end"
                    className="fill-slate-400 font-mono text-[10px]"
                  >
                    {val}
                  </text>
                </g>
              );
            })}

            <polyline
              fill="none"
              stroke="#0f172a"
              strokeWidth="2.4"
              strokeLinejoin="round"
              strokeLinecap="round"
              points={pointsA}
            />
            <polyline
              fill="none"
              stroke="#e11d48"
              strokeWidth="2.2"
              strokeDasharray="5 4"
              strokeLinejoin="round"
              strokeLinecap="round"
              points={pointsB}
            />

            {cityA.hourly.map((pt, i) => {
              const x = padLeft + i * slotW + slotW / 2;
              const yA = padTop + plotH - (pt.aqi / maxVal) * plotH;
              const yB = padTop + plotH - ((cityB.hourly[i]?.aqi ?? 0) / maxVal) * plotH;
              const active = i === hoverHour;
              return (
                <g
                  key={pt.hour24}
                  className="cursor-pointer"
                  onMouseEnter={() => setHoverHour(i)}
                  onClick={() => setHoverHour(i)}
                >
                  <rect
                    x={padLeft + i * slotW}
                    y={padTop}
                    width={slotW}
                    height={plotH + 20}
                    fill="transparent"
                  />
                  {active && (
                    <>
                      <line
                        x1={x}
                        y1={padTop}
                        x2={x}
                        y2={padTop + plotH}
                        stroke="rgba(15, 23, 42, 0.2)"
                      />
                      <circle cx={x} cy={yA} r={4.5} fill="#0f172a" stroke="#fff" strokeWidth={1.5} />
                      <circle cx={x} cy={yB} r={4.5} fill="#e11d48" stroke="#fff" strokeWidth={1.5} />
                    </>
                  )}
                  {i % 4 === 0 && (
                    <text
                      x={x}
                      y={height - 6}
                      textAnchor="middle"
                      className="fill-slate-500 font-mono text-[10px]"
                    >
                      {pt.hourLabel}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
        </div>

        {/* Advisory Difference for Active Profile */}
        <div className="lg:col-span-5 lg:border-l lg:border-slate-900/8 lg:pl-6">
          <h3 className="text-sm font-semibold text-slate-900">
            Health Guidance Delta · {profileLabel}
          </h3>
          <div className="mt-3 divide-y divide-slate-900/8 text-xs">
            {adviceA.map((itemA, i) => {
              const itemB = adviceB[i];
              return (
                <div key={itemA.category} className="py-3 first:pt-1 last:pb-0">
                  <div className="font-semibold text-slate-500">{itemA.title}</div>
                  <div className="mt-1.5 grid grid-cols-2 gap-3">
                    <div>
                      <div className="text-[11px] font-medium text-slate-500">{cityA.city}</div>
                      <div className="mt-0.5 font-semibold text-slate-950">{itemA.verdict}</div>
                    </div>
                    <div>
                      <div className="text-[11px] font-medium text-slate-500">{cityB.city}</div>
                      <div className="mt-0.5 font-semibold text-slate-950">{itemB.verdict}</div>
                    </div>
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
