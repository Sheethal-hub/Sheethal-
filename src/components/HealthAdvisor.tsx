import { Activity, DoorOpen, MapPin, Shield } from 'lucide-react';
import type { AdviceItem, AirQualityPayload, UserProfile } from '../types/airQuality';
import { getHealthRecommendations, getLocalMetroAdvisory, USER_PROFILES } from '../utils/recommendations';

interface HealthAdvisorProps {
  data: AirQualityPayload;
  profile: UserProfile;
  onProfileChange: (profile: UserProfile) => void;
}

const TONE_MAP: Record<
  AdviceItem['tone'],
  { pill: string; iconBg: string; verdictText: string }
> = {
  emerald: {
    pill: 'bg-emerald-500/12 text-emerald-800 border-emerald-500/25',
    iconBg: 'bg-emerald-500/12 text-emerald-700',
    verdictText: 'text-emerald-800',
  },
  amber: {
    pill: 'bg-amber-500/14 text-amber-900 border-amber-500/30',
    iconBg: 'bg-amber-500/14 text-amber-800',
    verdictText: 'text-amber-800',
  },
  orange: {
    pill: 'bg-orange-500/15 text-orange-900 border-orange-500/30',
    iconBg: 'bg-orange-500/14 text-orange-800',
    verdictText: 'text-orange-800',
  },
  crimson: {
    pill: 'bg-rose-600/14 text-rose-900 border-rose-600/30',
    iconBg: 'bg-rose-600/12 text-rose-700',
    verdictText: 'text-rose-800',
  },
};

const CATEGORY_ICON = {
  exercise: Activity,
  mask: Shield,
  ventilation: DoorOpen,
};

export function HealthAdvisor({
  data,
  profile,
  onProfileChange,
}: HealthAdvisorProps) {
  const recommendations = getHealthRecommendations(data, profile);
  const localAdvisory = getLocalMetroAdvisory(data, profile);
  const activeProfileMeta =
    USER_PROFILES.find((p) => p.id === profile) ?? USER_PROFILES[0];

  return (
    <section
      id="advisor"
      aria-label="Smart Health and Commute Advisor"
      className="glass-panel rounded-2xl p-6 sm:p-8"
    >
      <div className="flex flex-col gap-5 border-b border-slate-900/8 pb-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-950 sm:text-2xl font-display">
            Smart Health & Commute Advisor
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Tailored for{' '}
            <span className="font-semibold text-slate-900">
              {activeProfileMeta.label}
            </span>{' '}
            · {activeProfileMeta.description}
          </p>
        </div>

        {/* Profile Segmented Toggle */}
        <div
          role="group"
          aria-label="Select health sensitivity profile"
          className="flex flex-wrap gap-1.5 rounded-xl bg-slate-900/5 p-1.5"
        >
          {USER_PROFILES.map((item) => {
            const isSelected = item.id === profile;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onProfileChange(item.id)}
                aria-pressed={isSelected}
                className={`rounded-lg px-3.5 py-2 text-xs font-semibold transition-all duration-150 whitespace-nowrap shrink-0 min-h-[38px] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 ${
                  isSelected
                    ? 'bg-white text-slate-950 shadow-sm'
                    : 'text-slate-600 hover:text-slate-950 hover:bg-white/50'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3 Advisory Columns separated by clean hairline dividers */}
      <div className="mt-6 grid grid-cols-1 gap-6 divide-y divide-slate-900/8 md:grid-cols-3 md:gap-0 md:divide-x md:divide-y-0">
        {recommendations.map((item, idx) => {
          const tone = TONE_MAP[item.tone];
          const Icon = CATEGORY_ICON[item.category];
          return (
            <div
              key={item.category}
              className={`flex flex-col justify-between gap-4 ${
                idx === 0
                  ? 'pb-6 md:pb-0 md:pr-6'
                  : idx === 1
                  ? 'py-6 md:py-0 md:px-6'
                  : 'pt-6 md:pt-0 md:pl-6'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`flex h-9 w-9 items-center justify-center rounded-lg ${tone.iconBg}`}
                    >
                      <Icon className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <h3 className="text-sm font-semibold text-slate-900">
                      {item.title}
                    </h3>
                  </div>
                </div>

                <div className="mt-4">
                  <span
                    className={`inline-flex items-center rounded-md border px-2.5 py-1 text-xs font-semibold ${tone.pill}`}
                  >
                    {item.verdict}
                  </span>
                </div>

                <p className="mt-3 text-sm leading-relaxed text-slate-700">
                  {item.detail}
                </p>
              </div>

              <div className="border-t border-slate-900/6 pt-3 text-xs font-medium text-slate-500">
                {item.timingNote}
              </div>
            </div>
          );
        })}
      </div>

      {/* Local Regional Context Strip */}
      <div className="mt-6 flex flex-col gap-2 border-t border-slate-900/8 pt-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500">
            <MapPin className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
            <span>{localAdvisory.regionLabel}</span>
          </div>
          <p className="text-sm font-semibold text-slate-950">
            {localAdvisory.headline}
          </p>
          <p className="text-xs leading-relaxed text-slate-600 max-w-3xl">
            {localAdvisory.guidance}
          </p>
        </div>
        <div className="text-xs font-medium text-slate-700 sm:text-right shrink-0">
          <span className="text-slate-500">Local Commute Note:</span>{' '}
          <span className="font-semibold text-slate-900">{localAdvisory.commuteTip}</span>
        </div>
      </div>
    </section>
  );
}
