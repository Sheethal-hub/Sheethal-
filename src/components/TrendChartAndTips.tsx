import { useState } from 'react';
import { BarChart3, Calendar, Clock, TrendingUp } from 'lucide-react';
import type { AirQualityPayload, HourlyPoint } from '../types/airQuality';
import { getQuickExposureTips } from '../utils/recommendations';

interface TrendChartAndTipsProps {
  data: AirQualityPayload;
}

const BAND_COLORS: Record<
  HourlyPoint['band'],
  { fill: string; stroke: string; label: string; textClass: string }
> = {
  clean: {
    fill: '#10b981',
    stroke: '#059669',
    label: 'Clean Window',
    textClass: 'text-emerald-700',
  },
  moderate: {
    fill: '#f59e0b',
    stroke: '#d97706',
    label: 'Moderate',
    textClass: 'text-amber-700',
  },
  peak: {
    fill: '#e11d48',
    stroke: '#be123c',
    label: 'Peak Traffic / High',
    textClass: 'text-rose-700',
  },
};

export function TrendChartAndTips({ data }: TrendChartAndTipsProps) {
  const [chartMode, setChartMode] = useState<'bars' | 'line' | '3day'>('bars');
  const [activeIndex, setActiveIndex] = useState<number>(() => {
    const idx = data.hourly.findIndex((h) => h.isCurrentHour);
    return idx >= 0 ? idx : 12;
  });

  const tips = getQuickExposureTips(data);
  const hourly = data.hourly;
  const maxAqi = Math.max(80, ...hourly.map((h) => h.aqi)) * 1.12;
  const activePoint = hourly[activeIndex] ?? hourly[0];

  // SVG coordinate system
  const width = 680;
  const height = 228;
  const padLeft = 36;
  const padRight = 14;
  const padTop = 18;
  const padBottom = 32;
  const plotW = width - padLeft - padRight;
  const plotH = height - padTop - padBottom;
  const slotW = plotW / hourly.length;

  const yTicks = [0, Math.round(maxAqi * 0.33), Math.round(maxAqi * 0.66), Math.round(maxAqi)];

  const linePoints = hourly
    .map((pt, i) => {
      const cx = padLeft + i * slotW + slotW / 2;
      const cy = padTop + plotH - (pt.aqi / maxAqi) * plotH;
      return `${cx.toFixed(1)},${cy.toFixed(1)}`;
    })
    .join(' ');

  return (
    <section
      id="trends"
      aria-label="24-hour AQI trend and personal exposure tips"
      className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-stretch"
    >
      {/* Left: 24-Hour Trend Chart */}
      <div className="glass-panel flex flex-col justify-between rounded-2xl p-6 sm:p-7 lg:col-span-7">
        <div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-slate-950 font-display">
                24-Hour Air Quality Trend
              </h2>
              <p className="mt-0.5 text-xs text-slate-500">
                Hourly forecast for {data.neighborhood} · Tap or hover any bar to check that hour
              </p>
            </div>

            <div className="flex items-center gap-1 self-start rounded-lg bg-slate-900/5 p-1">
              <button
                type="button"
                onClick={() => setChartMode('bars')}
                className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 min-h-[34px] cursor-pointer ${
                  chartMode === 'bars'
                    ? 'bg-white text-slate-950 shadow-xs'
                    : 'text-slate-600 hover:text-slate-950'
                }`}
              >
                <BarChart3 className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Bars</span>
              </button>
              <button
                type="button"
                onClick={() => setChartMode('line')}
                className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 min-h-[34px] cursor-pointer ${
                  chartMode === 'line'
                    ? 'bg-white text-slate-950 shadow-xs'
                    : 'text-slate-600 hover:text-slate-950'
                }`}
              >
                <TrendingUp className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Line</span>
              </button>
              <button
                type="button"
                onClick={() => setChartMode('3day')}
                className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 min-h-[34px] cursor-pointer ${
                  chartMode === '3day'
                    ? 'bg-white text-slate-950 shadow-xs'
                    : 'text-slate-600 hover:text-slate-950'
                }`}
              >
                <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
                <span>3-Day</span>
              </button>
            </div>
          </div>

          {chartMode === '3day' ? (
            <div className="mt-5 grid grid-cols-1 gap-4 divide-y divide-slate-900/8 sm:grid-cols-3 sm:gap-0 sm:divide-x sm:divide-y-0">
              {(data.dailyOutlook ?? []).map((day, idx) => (
                <div
                  key={day.dateIso}
                  className={`flex flex-col justify-between gap-3 ${
                    idx === 0
                      ? 'pb-4 sm:pb-0 sm:pr-5'
                      : idx === 1
                      ? 'py-4 sm:py-0 sm:px-5'
                      : 'pt-4 sm:pt-0 sm:pl-5'
                  }`}
                >
                  <div>
                    <div className="text-xs font-semibold text-slate-500">
                      {day.dayLabel}
                    </div>
                    <div className="mt-2 flex items-baseline gap-2">
                      <span className="font-display text-4xl font-bold text-slate-950 tabular-nums">
                        {day.avgAqi}
                      </span>
                      <span className="font-mono text-xs text-slate-500">
                        avg US AQI
                      </span>
                    </div>
                    <div className="mt-1 text-xs font-medium text-slate-700">
                      {day.status} · India CPCB ~{day.indiaAvgAqi} ({day.indiaStatus})
                    </div>
                  </div>

                  <div className="space-y-1.5 border-t border-slate-900/8 pt-3 text-xs text-slate-600 font-mono tabular-nums">
                    <div>
                      Range: <strong className="text-slate-900">{day.minAqi}–{day.maxAqi}</strong>
                    </div>
                    <div className="text-emerald-800 font-semibold">
                      Best: {day.bestWindowLabel}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>
          {/* Active Hour Readout Strip */}
          {activePoint && (
            <div className="mt-4 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-900/8 bg-white/65 px-4 py-2.5 text-xs">
              <div className="flex items-center gap-2.5">
                <Clock className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
                <span className="font-mono font-semibold text-slate-950 tabular-nums">
                  {activePoint.hourLabel}
                </span>
                <span className="text-slate-400" aria-hidden="true">·</span>
                <span className={`font-semibold ${BAND_COLORS[activePoint.band].textClass}`}>
                  {BAND_COLORS[activePoint.band].label}
                </span>
                {activePoint.isCurrentHour && (
                  <span className="font-mono text-[11px] font-semibold text-slate-600">
                    (Current Hour)
                  </span>
                )}
              </div>

              <div className="flex items-center gap-4 font-mono text-xs text-slate-700 tabular-nums">
                <span>
                  AQI <strong className="text-slate-950">{activePoint.aqi}</strong>
                </span>
                <span>
                  PM2.5 <strong className="text-slate-950">{activePoint.pm25}</strong>
                </span>
                <span>
                  NO2 <strong className="text-slate-950">{activePoint.no2}</strong>
                </span>
              </div>
            </div>
          )}

          {/* Responsive SVG Chart */}
          <div className="mt-4 w-full overflow-hidden">
            <svg
              viewBox={`0 0 ${width} ${height}`}
              className="h-56 w-full select-none"
              role="img"
              aria-label="24-hour hourly AQI chart highlighting cleaner hours in green and peak traffic hours in red"
            >
              {/* Horizontal Grid Lines & Y-axis Labels */}
              {yTicks.map((tick) => {
                const y = padTop + plotH - (tick / maxAqi) * plotH;
                return (
                  <g key={tick}>
                    <line
                      x1={padLeft}
                      y1={y}
                      x2={width - padRight}
                      y2={y}
                      stroke="rgba(15, 23, 42, 0.08)"
                      strokeDasharray={tick === 0 ? undefined : '3 3'}
                    />
                    <text
                      x={padLeft - 8}
                      y={y + 3.5}
                      textAnchor="end"
                      className="fill-slate-400 font-mono text-[10px]"
                    >
                      {tick}
                    </text>
                  </g>
                );
              })}

              {/* Line mode polyline */}
              {chartMode === 'line' && (
                <polyline
                  fill="none"
                  stroke="#334155"
                  strokeWidth="2.25"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  points={linePoints}
                />
              )}

              {/* Bars or Interactive Point Nodes */}
              {hourly.map((pt, i) => {
                const barH = Math.max(6, (pt.aqi / maxAqi) * plotH);
                const xCenter = padLeft + i * slotW + slotW / 2;
                const yTop = padTop + plotH - barH;
                const barW = Math.max(10, slotW * 0.62);
                const isSelected = i === activeIndex;
                const color = BAND_COLORS[pt.band];

                return (
                  <g
                    key={pt.hour24}
                    className="cursor-pointer"
                    onMouseEnter={() => setActiveIndex(i)}
                    onClick={() => setActiveIndex(i)}
                  >
                    {/* Invisible generous hover hit zone */}
                    <rect
                      x={padLeft + i * slotW}
                      y={padTop}
                      width={slotW}
                      height={plotH + 22}
                      fill="transparent"
                    />

                    {isSelected && (
                      <line
                        x1={xCenter}
                        y1={padTop}
                        x2={xCenter}
                        y2={padTop + plotH}
                        stroke="rgba(15, 23, 42, 0.2)"
                        strokeWidth="1"
                        strokeDasharray="2 2"
                      />
                    )}

                    {chartMode === 'bars' ? (
                      <rect
                        x={xCenter - barW / 2}
                        y={yTop}
                        width={barW}
                        height={barH}
                        rx={4}
                        fill={color.fill}
                        fillOpacity={isSelected ? 1 : 0.78}
                        stroke={isSelected ? '#0f172a' : 'none'}
                        strokeWidth={isSelected ? 1.5 : 0}
                      />
                    ) : (
                      <circle
                        cx={xCenter}
                        cy={yTop}
                        r={isSelected ? 6 : 4}
                        fill={color.fill}
                        stroke="#ffffff"
                        strokeWidth={isSelected ? 2 : 1.5}
                      />
                    )}

                    {/* Current hour subtle marker at baseline */}
                    {pt.isCurrentHour && (
                      <circle cx={xCenter} cy={padTop + plotH + 6} r={2.5} fill="#0f172a" />
                    )}

                    {/* Show every 4th hour label on X axis */}
                    {i % 4 === 0 && (
                      <text
                        x={xCenter}
                        y={height - 8}
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
            </>
          )}
        </div>

        {/* Chart Legend & Best/Peak Window Strip */}
        <div className="mt-4 flex flex-col gap-3 border-t border-slate-900/8 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-xs bg-emerald-500" aria-hidden="true" />
              Cleaner Hours
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-xs bg-amber-500" aria-hidden="true" />
              Moderate
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-xs bg-rose-600" aria-hidden="true" />
              Busy Traffic
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-mono tabular-nums">
            <span className="text-emerald-800 font-semibold">
              Best: {data.cleanestWindow.label}
            </span>
            <span className="text-rose-800 font-semibold">
              Busy: {data.peakTrafficWindow.label}
            </span>
          </div>
        </div>
      </div>

      {/* Right: 3 Quick Tips to Lower Personal Exposure */}
      <div className="glass-panel flex flex-col justify-between rounded-2xl p-6 sm:p-7 lg:col-span-5">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-950 font-display">
            3 Simple Ways to Stay Fresh
          </h2>
          <p className="mt-0.5 text-xs text-slate-500">
            Easy daily habits tailored to {data.city}’s air today
          </p>

          <div className="mt-5 divide-y divide-slate-900/8">
            {tips.map((tip) => (
              <div key={tip.index} className="py-4 first:pt-1 last:pb-1">
                <div className="flex items-baseline justify-between gap-3">
                  <h3 className="text-sm font-semibold text-slate-950">
                    <span className="mr-2 font-mono text-xs font-semibold text-slate-400">
                      {tip.index}.
                    </span>
                    {tip.title}
                  </h3>
                </div>
                <p className="mt-1.5 text-xs leading-relaxed text-slate-600 sm:text-sm">
                  {tip.description}
                </p>
                <div className="mt-2 font-mono text-[11px] font-medium text-emerald-700">
                  Impact: {tip.metricImpact}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
