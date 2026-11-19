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
    description: 'Healthy adults commuting or running daily errands',
  },
  {
    id: 'jogger',
    label: 'Jogger / Cyclist',
    shortLabel: 'Jogger / Cyclist',
    description: 'Elevated respiratory rate during outdoor cardio',
  },
  {
    id: 'asthma',
    label: 'Asthma / Sensitive',
    shortLabel: 'Asthma / Sensitive',
    description: 'Airway hyper-reactivity to fine particulates & NO2',
  },
  {
    id: 'vulnerable',
    label: 'Child / Elderly',
    shortLabel: 'Child / Elderly',
    description: 'Developing or lower-reserve respiratory protection',
  },
];

export function getHealthRecommendations(
  data: AirQualityPayload,
  profile: UserProfile
): AdviceItem[] {
  const { aqi, no2, pm25, cleanestWindow, peakTrafficWindow } = data;
  const highTrafficNo2 = no2 >= 45;

  // Adjust effective threshold downward for higher-sensitivity profiles
  const sensitivityPenalty =
    profile === 'general'
      ? 0
      : profile === 'jogger'
      ? 20
      : profile === 'vulnerable'
      ? 30
      : 40; // asthma

  const effectiveAqi = aqi + sensitivityPenalty;

  // 1. Outdoor Exercise
  let exercise: AdviceItem;
  if (effectiveAqi <= 60) {
    exercise = {
      category: 'exercise',
      title: 'Outdoor Exercise',
      verdict: 'Cleared for Full Activity',
      tone: 'emerald',
      detail:
        profile === 'jogger'
          ? `Ideal respiratory conditions (PM2.5 ${pm25} µg/m³). Tempo runs and cycling intervals are safe along most urban routes.`
          : `Comfortable outdoor air quality. Brisk walks, park workouts, and outdoor errands carry minimal particulate strain.`,
      timingNote: `Best air window: ${cleanestWindow.label} (avg AQI ${cleanestWindow.avgAqi})`,
    };
  } else if (effectiveAqi <= 115) {
    exercise = {
      category: 'exercise',
      title: 'Outdoor Exercise',
      verdict:
        profile === 'jogger'
          ? 'Shift Route & Pace'
          : 'Moderate with Pacing',
      tone: 'amber',
      detail:
        profile === 'asthma' || profile === 'vulnerable'
          ? `Keep exertion light and carry rescue medication if prescribed. Avoid high-traffic junctions where NO2 sits at ${no2} µg/m³.`
          : `Standard outdoor walks are fine, but shift intense cardio away from main roads to reduce deep lung inhalation of fine particles.`,
      timingNote: `Target ${cleanestWindow.label} · Skip ${peakTrafficWindow.label}`,
    };
  } else if (effectiveAqi <= 185) {
    exercise = {
      category: 'exercise',
      title: 'Outdoor Exercise',
      verdict: 'Move Cardio Indoors',
      tone: 'orange',
      detail:
        profile === 'general'
          ? `Limit prolonged heavy exertion outdoors. Short walks are acceptable, but endurance training should move to a ventilated gym.`
          : `Avoid outdoor workouts today. Elevated PM2.5 (${pm25} µg/m³) penetrates deep airways during elevated breathing rates.`,
      timingNote: `If stepping out, stay under 30 min near ${cleanestWindow.label}`,
    };
  } else {
    exercise = {
      category: 'exercise',
      title: 'Outdoor Exercise',
      verdict: 'Avoid Outdoor Exertion',
      tone: 'crimson',
      detail: `Hazardous particulate load (AQI ${aqi}). Suspend all outdoor running, cycling, and prolonged park exposure until levels drop.`,
      timingNote: `Peak load reaches AQI ${peakTrafficWindow.avgAqi} around ${peakTrafficWindow.label}`,
    };
  }

  // 2. Mask Protection
  let mask: AdviceItem;
  if (effectiveAqi <= 65 && !highTrafficNo2) {
    mask = {
      category: 'mask',
      title: 'Mask Protection',
      verdict: 'Not Required',
      tone: 'emerald',
      detail: `Ambient fine particulate levels are well below acute irritation thresholds for ${profile === 'general' ? 'daily commutes' : 'your profile'}.`,
      timingNote: 'Keep a spare mask only for underground transit or dusty sites',
    };
  } else if (effectiveAqi <= 125) {
    mask = {
      category: 'mask',
      title: 'Mask Protection',
      verdict:
        profile === 'asthma' || profile === 'vulnerable'
          ? 'KN95 / FFP2 Recommended'
          : 'Optional Near Traffic',
      tone: 'amber',
      detail:
        profile === 'asthma' || profile === 'vulnerable'
          ? `Wear a snug KN95 or FFP2 mask when walking along arterial roads or waiting at busy bus stops.`
          : `Unnecessary in parks, but a light KF94/KN95 helps along congested corridors${highTrafficNo2 ? ` (NO2 elevated at ${no2} µg/m³)` : ''}.`,
      timingNote: `Highest benefit during ${peakTrafficWindow.label}`,
    };
  } else if (effectiveAqi <= 195) {
    mask = {
      category: 'mask',
      title: 'Mask Protection',
      verdict: 'N95 / FFP2 Advised',
      tone: 'orange',
      detail: `Use a well-sealed N95 or FFP2 respirator for outdoor commutes over 15 minutes. Cloth and surgical masks will not filter PM2.5.`,
      timingNote: 'Check nose-bridge seal to eliminate side-gap leakage',
    };
  } else {
    mask = {
      category: 'mask',
      title: 'Mask Protection',
      verdict: 'Tight-Seal N95 Essential',
      tone: 'crimson',
      detail: `Certified N95/P100 respirator required for any outdoor transit. Valved N95 models ease exhalation during brisk walking.`,
      timingNote: 'Replace filter once breathing resistance rises or after ~40 hrs',
    };
  }

  // 3. Window Ventilation
  let ventilation: AdviceItem;
  if (aqi <= 50) {
    ventilation = {
      category: 'ventilation',
      title: 'Window Ventilation',
      verdict: 'Open for Cross-Breeze',
      tone: 'emerald',
      detail: `Outdoor air is cleaner than typical indoor CO2 buildup. Open opposite windows for 20–30 minutes to refresh indoor air.`,
      timingNote: `Optimal cross-ventilation window: ${cleanestWindow.label}`,
    };
  } else if (aqi <= 115) {
    ventilation = {
      category: 'ventilation',
      title: 'Window Ventilation',
      verdict: 'Timed Off-Peak Airing',
      tone: 'amber',
      detail: `Keep street-facing windows closed during rush hours. Crack courtyard-facing windows briefly during the midday dispersion dip.`,
      timingNote: `Open 15–20 min only near ${cleanestWindow.label}`,
    };
  } else if (aqi <= 185) {
    ventilation = {
      category: 'ventilation',
      title: 'Window Ventilation',
      verdict: 'Keep Sealed + Filter',
      tone: 'orange',
      detail: `Keep exterior windows shut and set HVAC to recirculate mode. Run a HEPA air purifier at medium-high fan speed in bedrooms.`,
      timingNote: `Avoid airing during ${peakTrafficWindow.label}`,
    };
  } else {
    ventilation = {
      category: 'ventilation',
      title: 'Window Ventilation',
      verdict: 'Seal Gaps + Run HEPA',
      tone: 'crimson',
      detail: `Keep all windows and balcony doors latched. Seal drafty door sweeps with damp towels if indoor odor enters, and run HEPA continuously.`,
      timingNote: 'Use kitchen range hood on exhaust only briefly while cooking',
    };
  }

  return [exercise, mask, ventilation];
}

export function getQuickExposureTips(data: AirQualityPayload): QuickExposureTip[] {
  const { neighborhood, aqi, pm25, pm10, no2, cleanestWindow, peakTrafficWindow } = data;
  const isDustHeavy = pm10 > pm25 * 2.1;
  const isTrafficHeavy = no2 >= 42;

  return [
    {
      index: '01',
      title: 'Step one block off arterial roads',
      description: isTrafficHeavy
        ? `NO2 in ${neighborhood} is ${no2} µg/m³. Walking or cycling along parallel residential streets cuts tailpipe plume exposure sharply.`
        : `Even one parallel side-street away from main intersections drops ultra-fine particulate spikes by avoiding idling traffic.`,
      metricImpact: 'Up to 35–50% lower NO2 intake',
    },
    {
      index: '02',
      title: `Anchor outdoor trips to ${cleanestWindow.label}`,
      description: `Schedule errands, dog walks, or workouts around ${cleanestWindow.label} (projected AQI ~${cleanestWindow.avgAqi}) and stay clear of ${peakTrafficWindow.label}.`,
      metricImpact: `Saves ~${Math.max(8, peakTrafficWindow.avgAqi - cleanestWindow.avgAqi)} AQI points`,
    },
    {
      index: '03',
      title: isDustHeavy ? 'Wet-mop instead of dry sweeping' : 'Switch HVAC & car vents to recirculate',
      description: isDustHeavy
        ? `Coarse dust (PM10 ${pm10} µg/m³) settles fast indoors. Damp microfiber mopping traps particles without resuspending them into breathing height.`
        : aqi > 100
        ? `In transit and at home, turn cabin/AC air to internal recirculation and pair with a MERV-13 or portable HEPA unit.`
        : `Use recirculate mode when stuck behind diesel buses or tunnels, then switch back to fresh intake in open parks.`,
      metricImpact: 'Cuts indoor PM2.5 drift',
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
      regionLabel: 'Bengaluru · Deccan Plateau Airshed',
      headline:
        data.aqi <= 65
          ? 'Tree-canopy wards are clear; watch Outer Ring junctions'
          : 'Traffic corridor dust & two-wheeler NO2 spikes active',
      guidance: isSensitive
        ? `Stick to park-buffered streets (Cubbon/Indiranagar side lanes) and avoid Silk Board or Whitefield construction plumes.`
        : `Moderate plateau breeze (${data.windKmh} km/h) clears residential pockets, though peak junction PM10 (${data.pm10} µg/m³) stays elevated.`,
      commuteTip: 'Prefer Metro or closed-cabin commute during 8:30–11 AM & 6–9 PM rush',
    };
  }

  if (cityKey === 'delhi') {
    return {
      regionLabel: 'Delhi NCR · Indo-Gangetic Inversion Zone',
      headline:
        data.aqi >= 200
          ? 'Severe stagnant inversion — strict indoor air protection'
          : 'Elevated NCR smog; midday dispersion window only',
      guidance: isSensitive
        ? `Keep N95 respirator sealed outdoors, seal window drafts, and run HEPA continuously in sleeping areas (PM2.5 ${data.pm25} µg/m³).`
        : `Calm winds (${data.windKmh} km/h) trap combustion haze near ground level overnight and early morning. Shift all outdoor errands to ${data.cleanestWindow.label}.`,
      commuteTip: 'Use N95/FFP2 even for short auto/metro feeder walks',
    };
  }

  if (cityKey === 'chennai') {
    return {
      regionLabel: 'Chennai · Bay of Bengal Coastal Breeze',
      headline:
        data.aqi <= 65
          ? 'Onshore sea breeze dispersing roadside exhaust effectively'
          : 'Humid coastal haze & arterial corridor dust accumulation',
      guidance: isSensitive
        ? `Coastal wards like Adyar stay fresher after midday sea-breeze onset; avoid humid midday heat along congested bus corridors.`
        : `Higher humidity (${data.humidityPct}%) can make fine particulates feel heavier during brisk runs—choose shaded coastal or park loops.`,
      commuteTip: 'Best outdoor cardio window aligns with afternoon sea breeze',
    };
  }

  if (cityKey === 'mumbai') {
    return {
      regionLabel: 'Mumbai · Arabian Sea Marine Boundary',
      headline:
        data.aqi <= 100
          ? 'Sea breeze moderating harbor wards; inland basins warmer'
          : 'Coastal humidity trapping construction dust & highway exhaust',
      guidance: isSensitive
        ? `Western sea-facing promenades carry noticeably cleaner air than inland highway corridors like Powai or Eastern Express Highway.`
        : `Watch coastal mist mixed with PM10 (${data.pm10} µg/m³) near metro civil works—wear a light KN95 on open two-wheeler or rickshaw rides.`,
      commuteTip: 'Choose local rail / AC transit over open-air arterial rides at peak hour',
    };
  }

  return {
    regionLabel: `${data.city} · Local Urban Advisory`,
    headline: `${data.status} ambient conditions (${data.dominantPollutant} driven)`,
    guidance: `Current PM2.5 is ${data.pm25} µg/m³ with ${data.windKmh} km/h wind dispersion. Schedule heavier outdoor tasks around ${data.cleanestWindow.label}.`,
    commuteTip: `Peak corridor buildup occurs around ${data.peakTrafficWindow.label}`,
  };
}

