import { ArrowRight, CheckCircle2, AlertTriangle, ShieldAlert, Flame, MapPin, X } from 'lucide-react';
import type { AirQualityPayload, AqiStatus, UserProfile } from '../types/airQuality';
import { getLocalMetroAdvisory, USER_PROFILES } from '../utils/recommendations';

interface IndianMetroGridProps {
  metros: AirQualityPayload[];
  activeCity: string;
  profile: UserProfile;
  isLoading: boolean;
  onFocusMetro: (city: string, neighborhood: string) => void;
  onCompareMetro: (city: string, neighborhood: string) => void;
  onClose: () => void;
}

const STATUS_STYLE: Record<AqiStatus, { cls: string; Icon: typeof CheckCircle2 }> = {
  Good: { cls: 'bg-emerald-500/12 text-emerald-800 border-emerald-500/25', Icon: CheckCircle2 },
  Moderate: { cls: 'bg-amber-500/14 text-amber-900 border-amber-500/30', Icon: AlertTriangle },
  Poor: { cls: 'bg-orange-500/15 text-orange-900 border-orange-500/35', Icon: ShieldAlert },
  Severe: { cls: 'bg-rose-600/15 text-rose-900 border-rose-600/35', Icon: Flame },
};

export function IndianMetroGrid({
  metros,
  activeCity,
  profile,
  isLoading,
  onFocusMetro,
  onCompareMetro,
  onClose,
}: IndianMetroGridProps) {
  const profileLabel =
    USER_PROFILES.find((p) => p.id === profile)?.label ?? 'General Public';

  return (
    <section
      aria-label="Indian Metro Air Quality Snapshot and Local Advisories"
      className="glass-panel rounded-2xl p-6 sm:p-8"
    >
      <div className="flex flex-col gap-3 border-b border-slate-900/8 pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-slate-800" aria-hidden="true" />
            <h2 className="text-xl font-bold tracking-tight text-slate-950 sm:text-2xl font-display">
              Indian Metros Snapshot
            </h2>
          </div>
          <p className="mt-1 text-xs text-slate-600 sm:text-sm">
            Bengaluru, Delhi, Chennai &amp; Mumbai · Local health advisories tailored for{' '}
            <span className="font-semibold text-slate-900">{profileLabel}</span>
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="inline-flex items-center gap-1.5 self-start rounded-lg bg-slate-900/8 px-3.5 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-900/15 transition-colors whitespace-nowrap shrink-0 min-h-[38px] cursor-pointer"
        >
          <X className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Hide Metros</span>
        </button>
      </div>

      <div
        className={`mt-6 grid grid-cols-1 gap-6 divide-y divide-slate-900/8 md:grid-cols-2 md:gap-6 md:divide-y-0 xl:grid-cols-4 xl:gap-0 xl:divide-x transition-opacity ${
          isLoading ? 'opacity-70' : 'opacity-100'
        }`}
      >
        {metros.map((metro, idx) => {
          const badge = STATUS_STYLE[metro.status];
          const Icon = badge.Icon;
          const advisory = getLocalMetroAdvisory(metro, profile);
          const isFocused =
            metro.city.toLowerCase() === activeCity.trim().toLowerCase();

          return (
            <div
              key={metro.city}
              className={`flex flex-col justify-between gap-4 ${
                idx === 0
                  ? 'pb-5 md:pb-0 xl:pr-5'
                  : idx === 1
                  ? 'py-5 md:py-0 xl:px-5'
                  : idx === 2
                  ? 'py-5 md:py-0 xl:px-5'
                  : 'pt-5 md:pt-0 xl:pl-5'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-lg font-bold text-slate-950 font-display">
                      {metro.city}
                    </h3>
                    <div className="text-xs text-slate-500">
                      {metro.neighborhood}
                    </div>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1 rounded-md border px-2 py-1 text-[11px] font-semibold whitespace-nowrap shrink-0 ${badge.cls}`}
                  >
                    <Icon className="h-3 w-3" aria-hidden="true" />
                    <span>{metro.status}</span>
                  </span>
                </div>

                {/* Big AQI + Compact Pollutant Row */}
                <div className="mt-4 flex items-baseline justify-between border-b border-slate-900/8 pb-3">
                  <div className="flex items-baseline gap-1.5">
                    <span className="font-display text-4xl font-bold text-slate-950 tabular-nums">
                      {metro.aqi}
                    </span>
                    <span className="font-mono text-[11px] text-slate-500">
                      AQI
                    </span>
                  </div>
                  <div className="font-mono text-[11px] text-slate-600 tabular-nums">
                    PM2.5 <strong className="text-slate-950">{metro.pm25}</strong> · NO2{' '}
                    <strong className="text-slate-950">{metro.no2}</strong>
                  </div>
                </div>

                {/* Local Health Advisory */}
                <div className="mt-3 space-y-1.5">
                  <div className="text-xs font-semibold text-slate-900">
                    {advisory.headline}
                  </div>
                  <p className="text-xs leading-relaxed text-slate-600">
                    {advisory.guidance}
                  </p>
                  <div className="text-[11px] font-medium text-slate-500">
                    {advisory.commuteTip}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 border-t border-slate-900/6 pt-3">
                <button
                  type="button"
                  onClick={() => onFocusMetro(metro.city, metro.neighborhood)}
                  className={`flex-1 inline-flex items-center justify-center gap-1 rounded-lg px-3 py-2 text-xs font-semibold transition-colors whitespace-nowrap min-h-[36px] cursor-pointer ${
                    isFocused
                      ? 'bg-slate-900 text-white'
                      : 'bg-white/80 text-slate-800 border border-slate-200 hover:bg-white'
                  }`}
                >
                  <span>{isFocused ? 'Active City' : 'Inspect'}</span>
                  {!isFocused && <ArrowRight className="h-3 w-3" aria-hidden="true" />}
                </button>
                <button
                  type="button"
                  onClick={() => onCompareMetro(metro.city, metro.neighborhood)}
                  className="rounded-lg border border-slate-200 bg-white/75 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-white hover:text-slate-950 transition-colors whitespace-nowrap shrink-0 min-h-[36px] cursor-pointer"
                >
                  Compare
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
