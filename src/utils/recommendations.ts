import type {
  AdviceItem,
  AirQualityPayload,
  QuickExposureTip,
  UserProfile,
} from '../types/airQuality';

export const USER_PROFILES: {
  id: UserProfile;
  label: string;
  shortLabel: string;
  description: string;
}[] = [
  {
    id: 'general',
    label: 'General Public',
    shortLabel: 'General',
    description: 'Everyday walking, work & errands',
  },
  {
    id: 'jogger',
    label: 'Jogger / Cyclist',
    shortLabel: 'Jogger / Cyclist',
    description: 'Running or cycling outdoors',
  },
  {
    id: 'asthma',
    label: 'Asthma / Sensitive',
    shortLabel: 'Asthma / Sensitive',
    description: 'Asthma, allergies or sensitive lungs',
  },
  {
    id: 'vulnerable',
    label: 'Child / Elderly',
    shortLabel: 'Child / Elderly',
    description: 'Kids, seniors & older adults',
  },
];

export function getHealthRecommendations(
  data: AirQualityPayload,
  profile: UserProfile
): AdviceItem[] {
  const { aqi, no2, pm25, cleanestWindow, peakTrafficWindow } = data;
  const highTrafficNo2 = no2 >= 65;

  // Adjust sensitivity gently for people doing heavy cardio or with sensitive breathing
  const sensitivityPenalty =
    profile === 'general'
      ? 0
      : profile === 'jogger'
      ? 15
      : profile === 'vulnerable'
      ? 25
      : 35; // asthma

  const effectiveAqi = aqi + sensitivityPenalty;

  // 1. Outdoor Exercise
  let exercise: AdviceItem;
  if (effectiveAqi <= 65) {
    exercise = {
      category: 'exercise',
      title: 'Outdoor Exercise',
      verdict: 'Great for Outdoors',
      tone: 'emerald',
      detail:
        profile === 'jogger'
          ? `Fresh air for running and cycling (PM2.5 is low at ${pm25} µg/m³). Parks and neighborhood roads feel comfortable.`
          : `Clean air right now. Regular walks, outdoor play, and daily errands are completely fine.`,
      timingNote: `Cleanest air: ${cleanestWindow.label} (avg AQI ${cleanestWindow.avgAqi})`,
    };
  } else if (effectiveAqi <= 145) {
    exercise = {
      category: 'exercise',
      title: 'Outdoor Exercise',
      verdict:
        profile === 'jogger'
          ? 'Pick Parks or Quiet Lanes'
          : 'Normal Daily Activity OK',
      tone: 'amber',
      detail:
        profile === 'asthma' || profile === 'vulnerable'
          ? `Gentle walks are fine, especially inside parks. Avoid lingering right next to busy traffic signals.`
          : `Daily walks and errands are fine. If doing heavy running or cycling, choose greener side streets or go during cleaner hours.`,
      timingNote: `Best time: ${cleanestWindow.label} · Busy traffic: ${peakTrafficWindow.label}`,
    };
  } else if (effectiveAqi <= 215) {
    exercise = {
      category: 'exercise',
      title: 'Outdoor Exercise',
      verdict:
        profile === 'general'
          ? 'Keep Workouts Light'
          : 'Prefer Indoor Activity',
      tone: 'orange',
      detail:
        profile === 'general'
          ? `Short walks and normal commuting are okay, but move intense running or long workouts indoors until evening haze clears.`
          : `Keep outdoor time shorter today and skip heavy exercise outside. Parks during cleaner afternoon hours are safer than busy roads.`,
      timingNote: `Best outdoor window: ${cleanestWindow.label} (avg AQI ${cleanestWindow.avgAqi})`,
    };
  } else {
    exercise = {
      category: 'exercise',
      title: 'Outdoor Exercise',
      verdict: 'Stay Indoors Today',
      tone: 'crimson',
      detail: `Air pollution is genuinely heavy right now (AQI ${aqi}). Pause outdoor runs or long play outside until air clears.`,
      timingNote: `Heaviest buildup around ${peakTrafficWindow.label} (avg AQI ${peakTrafficWindow.avgAqi})`,
    };
  }

  // 2. Mask Protection
  let mask: AdviceItem;
  if (effectiveAqi <= 85 && !highTrafficNo2) {
    mask = {
      category: 'mask',
      title: 'Mask Protection',
      verdict: 'No Mask Needed',
      tone: 'emerald',
      detail: `No mask is needed for everyday walking, parks, or daily errands.`,
      timingNote: 'Only carry a mask if passing active construction dust',
    };
  } else if (effectiveAqi <= 165) {
    mask = {
      category: 'mask',
      title: 'Mask Protection',
      verdict:
        profile === 'asthma' || profile === 'vulnerable'
          ? 'Mask Helpful in Traffic'
          : 'Optional Near Traffic',
      tone: 'amber',
      detail:
        profile === 'asthma' || profile === 'vulnerable'
          ? `Not needed inside quiet parks or indoors, but wearing a comfortable KN95/N95 helps at busy bus stops or main roads.`
          : `Not needed for short neighborhood walks. A simple N95/KN95 helps if riding a two-wheeler or stuck in heavy traffic.`,
      timingNote: `Most useful during rush hour (${peakTrafficWindow.label})`,
    };
  } else if (effectiveAqi <= 225) {
    mask = {
      category: 'mask',
      title: 'Mask Protection',
      verdict: 'N95 / KN95 Recommended',
      tone: 'orange',
      detail: `Wear a snug N95 or KN95 mask if commuting in open traffic or spending 20+ minutes near busy roads.`,
      timingNote: 'Make sure the nose clip sits snug so polluted air stays out',
    };
  } else {
    mask = {
      category: 'mask',
      title: 'Mask Protection',
      verdict: 'Wear Snug N95 Outdoors',
      tone: 'crimson',
      detail: `Wear a well-fitted N95 mask whenever stepping outside for errands or travel today.`,
      timingNote: 'Cloth masks do not block fine smoke particles well',
    };
  }

  // 3. Window Ventilation
  let ventilation: AdviceItem;
  if (aqi <= 65) {
    ventilation = {
      category: 'ventilation',
      title: 'Home Windows',
      verdict: 'Open Windows Freely',
      tone: 'emerald',
      detail: `Outdoor air is fresh. Keep windows open for natural cross-breeze throughout the day.`,
      timingNote: `Freshest breeze: ${cleanestWindow.label}`,
    };
  } else if (aqi <= 155) {
    ventilation = {
      category: 'ventilation',
      title: 'Home Windows',
      verdict: 'Open in Clean Hours',
      tone: 'amber',
      detail: `Open windows for 20–30 minutes during cleaner midday or afternoon hours. Close road-facing windows during evening rush.`,
      timingNote: `Best airing window: ${cleanestWindow.label}`,
    };
  } else if (aqi <= 215) {
    ventilation = {
      category: 'ventilation',
      title: 'Home Windows',
      verdict: 'Close Road-Side Windows',
      tone: 'orange',
      detail: `Keep windows facing busy roads shut during traffic peaks. Open briefly during cleaner hours or run a room purifier if you have one.`,
      timingNote: `Avoid airing during ${peakTrafficWindow.label}`,
    };
  } else {
    ventilation = {
      category: 'ventilation',
      title: 'Home Windows',
      verdict: 'Keep Windows Shut',
      tone: 'crimson',
      detail: `Keep exterior windows closed today and run a purifier or fan circulation inside bedrooms.`,
      timingNote: 'Wait for air to clear before opening balcony doors',
    };
  }

  return [exercise, mask, ventilation];
}

export function getQuickExposureTips(data: AirQualityPayload): QuickExposureTip[] {
  const { neighborhood, aqi, pm10, no2, cleanestWindow, peakTrafficWindow } = data;
  const isDustHeavy = pm10 > 85;
  const isTrafficHeavy = no2 >= 55;

  return [
    {
      index: '01',
      title: 'Walk one street away from main roads',
      description: isTrafficHeavy
        ? `Traffic exhaust near ${neighborhood} main roads is busy right now. Stepping one lane inside cuts vehicle fume exposure sharply.`
        : `Even one quiet side-street away from signals gives much fresher air than walking right beside traffic.`,
      metricImpact: 'Up to 35–50% less exhaust',
    },
    {
      index: '02',
      title: `Plan outdoor errands around ${cleanestWindow.label}`,
      description: `Schedule walks, shopping, or kids' park time near ${cleanestWindow.label} (avg AQI ~${cleanestWindow.avgAqi}) and skip busy traffic near ${peakTrafficWindow.label}.`,
      metricImpact: `Saves ~${Math.max(8, peakTrafficWindow.avgAqi - cleanestWindow.avgAqi)} AQI points`,
    },
    {
      index: '03',
      title: isDustHeavy ? 'Wet-mop instead of dry sweeping' : 'Use AC recirculate mode in traffic',
      description: isDustHeavy
        ? `Road dust (PM10 ${pm10} µg/m³) settles indoors. A damp mop traps floor dust cleanly instead of kicking it back into the air.`
        : aqi > 130
        ? `When driving or in cabs/buses, switch the AC vent to inside-air recirculate mode in traffic jams.`
        : `Switch car AC to recirculate mode behind smoky trucks, then bring fresh air back in on tree-lined roads.`,
      metricImpact: 'Keeps indoor & cabin air cleaner',
    },
  ];
}

export interface LocalMetroAdvisory {
  regionLabel: string;
  headline: string;
  guidance: string;
  commuteTip: string;
}

export function getLocalMetroAdvisory(
  data: AirQualityPayload,
  profile: UserProfile
): LocalMetroAdvisory {
  const cityKey = data.city.trim().toLowerCase();
  const isSensitive = profile === 'asthma' || profile === 'vulnerable';

  if (cityKey === 'bengaluru') {
    return {
      regionLabel: 'Bengaluru · Local Context',
      headline:
        data.aqi <= 90
          ? 'Green residential pockets are fresh; main junctions slightly dusty'
          : 'Calm weather holding evening traffic dust near busy corridors',
      guidance: isSensitive
        ? `Park-lined lanes (Indiranagar, Jayanagar, Malleswaram) stay noticeably fresher than major junctions like Silk Board or Outer Ring Road.`
        : `A steady breeze (${data.windKmh} km/h) keeps residential lanes comfortable; most buildup is near heavy traffic signals and construction belts.`,
      commuteTip: 'Metro or closed-window travel feels best during 8:30–11 AM & 6–9 PM rush',
    };
  }

  if (cityKey === 'delhi') {
    return {
      regionLabel: 'Delhi NCR · Local Context',
      headline:
        data.aqi >= 220
          ? 'Heavy winter haze — limit outdoor time today'
          : 'Moderate-to-high NCR haze; afternoon hours are clearest',
      guidance: isSensitive
        ? `Wear a snug N95 outdoors, keep road-facing windows closed, and plan short errands only during midday sun.`
        : `Low wind (${data.windKmh} km/h) traps smoke close to the ground overnight and early morning. Midday (${data.cleanestWindow.label}) is the safest time out.`,
      commuteTip: 'Keep an N95 handy for outdoor station walks and open-road transit',
    };
  }

  if (cityKey === 'chennai') {
    return {
      regionLabel: 'Chennai · Coastal Breeze',
      headline:
        data.aqi <= 90
          ? 'Sea breeze keeping city air moving cleanly'
          : 'Warm humid air mixing with busy-road traffic exhaust',
      guidance: isSensitive
        ? `Areas closer to the coast like Adyar feel fresher once afternoon sea breezes pick up.`
        : `High humidity (${data.humidityPct}%) can make warm air feel heavier during midday runs—pick shaded park loops or early/evening coastal routes.`,
      commuteTip: 'Afternoon sea breeze usually helps clear roadside buildup',
    };
  }

  if (cityKey === 'mumbai') {
    return {
      regionLabel: 'Mumbai · Sea Breeze & Metro Corridors',
      headline:
        data.aqi <= 110
          ? 'Sea-facing areas stay fresher than inland highways'
          : 'Coastal humidity trapping highway & metro-work dust',
      guidance: isSensitive
        ? `Sea-facing promenades (Colaba, Bandra) stay cleaner than inland highway corridors like Powai or Andheri East.`
        : `Road and metro-work dust (PM10 ${data.pm10} µg/m³) rises near busy junctions—keep an optional mask handy for open-auto rides.`,
      commuteTip: 'Local rail or AC commute avoids open highway dust',
    };
  }

  if (cityKey === 'hyderabad') {
    return {
      regionLabel: 'Hyderabad · Deccan Breeze & IT Corridor',
      headline:
        data.aqi <= 105
          ? 'Open plateau winds keeping western hills comfortable'
          : 'Traffic dust building up along Outer Ring & metro arteries',
      guidance: isSensitive
        ? `Elevated green neighborhoods (Banjara Hills, Jubilee Hills) stay cleaner than dense arterial junctions like Kukatpally or Uppal.`
        : `Moderate road dust (PM10 ${data.pm10} µg/m³) spikes near HITEC & ORR bottlenecks—pick park loops during ${data.cleanestWindow.label}.`,
      commuteTip: 'Metro or enclosed commute avoids ORR & flyover construction dust',
    };
  }

  if (cityKey === 'pune') {
    return {
      regionLabel: 'Pune · Foothill Canopy & Expressway',
      headline:
        data.aqi <= 100
          ? 'Fresh foothill air across green residential wards'
          : 'Cooler air holding road & highway dust along valley corridors',
      guidance: isSensitive
        ? `Tree-lined lanes in Koregaon Park, Aundh, and Kothrud stay noticeably cleaner than expressway junctions like Hinjewadi or Hadapsar.`
        : `Evening traffic haze builds near expressway interchanges—schedule longer outdoor runs around ${data.cleanestWindow.label}.`,
      commuteTip: 'Wear a visor or light mask for two-wheeler trips near highway bottlenecks',
    };
  }

  if (cityKey === 'kolkata') {
    return {
      regionLabel: 'Kolkata · River Basin & Salt Lake Grid',
      headline:
        data.aqi <= 110
          ? 'River breeze and green parks easing midday haze'
          : 'Humid river-basin air trapping evening traffic emissions',
      guidance: isSensitive
        ? `Planned green grids (Salt Lake, New Town, Alipore) feel cleaner than busy bridge corridors like Howrah or Esplanade.`
        : `Evening humidity traps exhaust close to street level—prefer midday errands (${data.cleanestWindow.label}) and park walkways.`,
      commuteTip: 'Metro or AC transit cuts roadside exposure along Howrah & EM Bypass',
    };
  }

  return {
    regionLabel: `${data.city} · Local Summary`,
    headline: `${data.status} air right now (driven by ${data.dominantPollutant})`,
    guidance: `Current PM2.5 is ${data.pm25} µg/m³ with ${data.windKmh} km/h wind. Best time for outdoor errands is ${data.cleanestWindow.label}.`,
    commuteTip: `Busiest traffic hours are around ${data.peakTrafficWindow.label}`,
  };
}

export type ActivityId =
  | 'morning-walk'
  | 'school-run'
  | 'two-wheeler'
  | 'evening-jog'
  | 'air-home';

export const ACTIVITY_OPTIONS: {
  id: ActivityId;
  label: string;
  startHour: number;
  endHour: number;
}[] = [
  { id: 'morning-walk', label: 'Morning Walk', startHour: 5, endHour: 10 },
  { id: 'school-run', label: 'School / Errands', startHour: 7, endHour: 16 },
  { id: 'two-wheeler', label: 'Bike / Scooter', startHour: 7, endHour: 21 },
  { id: 'evening-jog', label: 'Evening Run', startHour: 16, endHour: 21 },
  { id: 'air-home', label: 'Air Out Home', startHour: 6, endHour: 22 },
];

export function getBestActivityWindow(
  data: AirQualityPayload,
  activityId: ActivityId,
  profile: UserProfile
): {
  bestLabel: string;
  bestAvgAqi: number;
  avoidLabel: string;
  tip: string;
} {
  const cfg =
    ACTIVITY_OPTIONS.find((a) => a.id === activityId) ?? ACTIVITY_OPTIONS[0];
  const hourly = data.hourly;

  // Build ordered slots matching the activity hours
  const matching = hourly.filter(
    (h) => h.hour24 >= cfg.startHour && h.hour24 <= cfg.endHour
  );
  const pool = matching.length >= 2 ? matching : hourly;

  let bestIdx = 0;
  let bestAvg = Infinity;
  let worstIdx = 0;
  let worstAvg = -Infinity;

  for (let i = 0; i <= pool.length - 2; i++) {
    const avg = (pool[i].aqi + pool[i + 1].aqi) / 2;
    if (avg < bestAvg) {
      bestAvg = avg;
      bestIdx = i;
    }
    if (avg > worstAvg) {
      worstAvg = avg;
      worstIdx = i;
    }
  }

  const fmtHour = (h24: number) => {
    const h = ((h24 % 24) + 24) % 24;
    if (h === 0) return '12 AM';
    if (h < 12) return `${h} AM`;
    if (h === 12) return '12 PM';
    return `${h - 12} PM`;
  };

  const bestLabel = `${fmtHour(pool[bestIdx].hour24)} – ${fmtHour(pool[bestIdx].hour24 + 2)}`;
  const avoidLabel = `${fmtHour(pool[worstIdx].hour24)} – ${fmtHour(pool[worstIdx].hour24 + 2)}`;
  const bestAvgAqi = Math.round(bestAvg);

  let tip: string;
  if (activityId === 'air-home') {
    tip =
      bestAvgAqi <= 145
        ? `Crack windows open for 20–30 minutes around ${bestLabel}; keep road-facing windows shut near ${avoidLabel}.`
        : `Open courtyard or non-road windows briefly around ${bestLabel}, then keep closed during traffic peak (${avoidLabel}).`;
  } else if (activityId === 'two-wheeler') {
    tip =
      bestAvgAqi > 140 || profile === 'asthma'
        ? `Road exhaust rises sharply near signals — wear a snug KN95/N95 helmet mask and pick parallel lanes if riding near ${avoidLabel}.`
        : `Cleaner ride window is ${bestLabel}. Use a visor or light mask along congested junctions.`;
  } else if (activityId === 'evening-jog') {
    tip =
      bestAvgAqi > 155 || (profile !== 'general' && bestAvgAqi > 135)
        ? `Even the cleanest evening slot (${bestLabel}) stays hazy (US AQI ~${bestAvgAqi}) — keep runs gentle inside a park or pick ${data.cleanestWindow.label} instead.`
        : `Best evening slot is ${bestLabel} (US AQI ~${bestAvgAqi}). Stick to green parks rather than main roads.`;
  } else {
    tip =
      bestAvgAqi <= 145
        ? `${bestLabel} offers the freshest air in this window (US AQI ~${bestAvgAqi}).`
        : `Keep trips shorter around ${bestLabel} and avoid lingering next to busy signals around ${avoidLabel}.`;
  }

  return { bestLabel, bestAvgAqi, avoidLabel, tip };
}

export function buildShareableSummary(
  data: AirQualityPayload,
  profile: UserProfile
): string {
  const recs = getHealthRecommendations(data, profile);
  const exercise = recs.find((r) => r.category === 'exercise');
  const mask = recs.find((r) => r.category === 'mask');
  const indiaText =
    data.indiaAqi !== undefined
      ? ` (India CPCB ~${data.indiaAqi} · ${data.indiaStatus})`
      : '';

  return [
    `${data.neighborhood}, ${data.city} Air Update`,
    `Score: US AQI ${data.aqi} · ${data.status}${indiaText}`,
    `Cleanest hours today: ${data.cleanestWindow.label} (avoid ${data.peakTrafficWindow.label})`,
    `Tip: ${exercise?.verdict ?? 'Normal activity OK'} · Mask: ${mask?.verdict ?? 'Optional'}`,
  ].join('\n');
}
