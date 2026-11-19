import type { AirQualityPayload, HourlyPoint, UserProfile } from '../types/airQuality';
import {
  getHealthRecommendations,
  getLocalMetroAdvisory,
  USER_PROFILES,
} from './recommendations.ts';

function parseMentionedHour(question: string): number | null {
  const q = question.toLowerCase();

  // Match "6 pm", "6:30pm", "18:00", "7 am"
  const amPmMatch = q.match(/\b(1[0-2]|0?[1-9])(?::\d{2})?\s*(am|pm)\b/);
  if (amPmMatch) {
    let hr = Number(amPmMatch[1]);
    const meridiem = amPmMatch[2];
    if (meridiem === 'pm' && hr < 12) hr += 12;
    if (meridiem === 'am' && hr === 12) hr = 0;
    return hr;
  }

  const twentyFourMatch = q.match(/\b([01]?\d|2[0-3]):[0-5]\d\b/);
  if (twentyFourMatch) {
    return Number(twentyFourMatch[1]);
  }

  if (/\b(early morning|dawn|sunrise)\b/.test(q)) return 6;
  if (/\b(morning)\b/.test(q)) return 8;
  if (/\b(noon|midday|lunch|afternoon)\b/.test(q)) return 14;
  if (/\b(evening|sunset)\b/.test(q)) return 18;
  if (/\b(night|tonight|late)\b/.test(q)) return 21;
  return null;
}

function findHourlyPoint(hourly: HourlyPoint[], hour24: number): HourlyPoint | undefined {
  return hourly.find((h) => h.hour24 === hour24) ?? hourly[hour24];
}

export function buildSmartAqiReply(
  question: string,
  data: AirQualityPayload,
  profile: UserProfile
): string {
  const q = question.toLowerCase();
  const profileMeta =
    USER_PROFILES.find((p) => p.id === profile) ?? USER_PROFILES[0];
  const recs = getHealthRecommendations(data, profile);
  const exerciseRec = recs.find((r) => r.category === 'exercise')!;
  const maskRec = recs.find((r) => r.category === 'mask')!;
  const ventRec = recs.find((r) => r.category === 'ventilation')!;
  const local = getLocalMetroAdvisory(data, profile);

  const mentionedHour = parseMentionedHour(q);
  const hourPoint =
    mentionedHour !== null ? findHourlyPoint(data.hourly, mentionedHour) : undefined;

  const isExerciseQuery =
    /\b(run|running|jog|jogging|cycle|cycling|bike|walk|walking|exercise|workout|cardio|play|outdoor|sport|park)\b/.test(
      q
    ) || mentionedHour !== null;
  const isIndoorDustQuery =
    /\b(dust|indoor|inside|home|house|room|window|windows|ventilat|airing|purifier|hepa|mop|clean|sleep|bedroom)\b/.test(
      q
    );
  const isMaskCommuteQuery =
    /\b(mask|n95|kn95|ffp2|respirator|commute|traffic|road|bus|metro|train|drive|car|travel|office)\b/.test(
      q
    );
  const isPollutantWhyQuery =
    /\b(why|no2|pm2\.?5|pm10|pollutant|cause|spike|who|guideline|wind|weather)\b/.test(
      q
    );

  // 1. Time-specific or outdoor exercise question
  if (isExerciseQuery && !isIndoorDustQuery && !isMaskCommuteQuery) {
    if (hourPoint) {
      const hourRiskNote =
        hourPoint.band === 'peak'
          ? `That falls inside a higher-load period for ${data.neighborhood}, with AQI projected around **${hourPoint.aqi} (${hourPoint.status})**, PM2.5 near **${hourPoint.pm25} µg/m³**, and NO2 around **${hourPoint.no2} µg/m³**.`
          : hourPoint.band === 'clean'
          ? `That lines up with one of the cleaner hours in ${data.neighborhood}, with AQI projected near **${hourPoint.aqi} (${hourPoint.status})** and PM2.5 around **${hourPoint.pm25} µg/m³**.`
          : `At **${hourPoint.hourLabel}**, ${data.neighborhood} is projected at **AQI ${hourPoint.aqi} (${hourPoint.status})** (PM2.5 **${hourPoint.pm25} µg/m³**, NO2 **${hourPoint.no2} µg/m³**).`;

      const actionAdvice =
        hourPoint.aqi >= 150 || (profile !== 'general' && hourPoint.aqi >= 100)
          ? `For **${profileMeta.label}**, I recommend moving intense cardio indoors or shifting your session to the cleanest window today (**${data.cleanestWindow.label}**, avg AQI **${data.cleanestWindow.avgAqi}**).`
          : `For **${profileMeta.label}**, the recommendation is **${exerciseRec.verdict}**—stick to tree-lined side streets away from arterial traffic and watch for peak buildup around **${data.peakTrafficWindow.label}**.`;

      const maskNote =
        maskRec.verdict !== 'Not Required'
          ? ` Mask guidance during peak traffic is **${maskRec.verdict}**.`
          : '';

      return `${hourRiskNote}\n\n${actionAdvice}${maskNote}`;
    }

    return `In **${data.neighborhood}, ${data.city}** (current **AQI ${data.aqi} · ${data.status}**), the outdoor activity guidance for **${profileMeta.label}** is **${exerciseRec.verdict}**.\n\n${exerciseRec.detail} Aim for **${data.cleanestWindow.label}** (avg AQI **${data.cleanestWindow.avgAqi}**) and avoid **${data.peakTrafficWindow.label}** (avg AQI **${data.peakTrafficWindow.avgAqi}**).`;
  }

  // 2. Indoor dust / ventilation / home air question
  if (isIndoorDustQuery) {
    const dustDetail =
      data.pm10 > 70
        ? `Coarse dust (PM10) is elevated at **${data.pm10} µg/m³** alongside PM2.5 at **${data.pm25} µg/m³**. Avoid dry sweeping or feather dusting, which puts settled dust right back into breathing height.`
        : `Ambient PM10 is **${data.pm10} µg/m³** and PM2.5 is **${data.pm25} µg/m³**.`;

    return `For **${data.neighborhood}** right now (**AQI ${data.aqi} · ${data.status}**), the ventilation status is **${ventRec.verdict}**.\n\n${dustDetail} ${ventRec.detail}\n\nPractical steps today: damp-mop hard floors with a microfiber cloth, keep shoes at the entryway, and if you open windows, limit airing to **${data.cleanestWindow.label}** (avg AQI **${data.cleanestWindow.avgAqi}**).`;
  }

  // 3. Mask / commute / traffic question
  if (isMaskCommuteQuery) {
    return `For **${profileMeta.label}** commuting through **${data.neighborhood}, ${data.city}** (**AQI ${data.aqi} · ${data.status}**), mask guidance is **${maskRec.verdict}**.\n\n${maskRec.detail} Current traffic-related NO2 is **${data.no2} µg/m³** and PM2.5 is **${data.pm25} µg/m³**.\n\n**Local commute tip:** ${local.commuteTip}. Stepping one block off main roads also cuts roadside exhaust spikes substantially.`;
  }

  // 4. Pollutant / cause / meteorological breakdown
  if (isPollutantWhyQuery) {
    const whoPm25Ratio = (data.pm25 / 15).toFixed(1);
    const whoNo2Ratio = (data.no2 / 25).toFixed(1);
    return `**${data.neighborhood}** is currently at **AQI ${data.aqi} (${data.status})**, driven primarily by **${data.dominantPollutant}**.\n\n• **PM2.5:** ${data.pm25} µg/m³ (${whoPm25Ratio}× the WHO 24h guideline of 15 µg/m³)\n• **PM10:** ${data.pm10} µg/m³ (WHO guideline: 45 µg/m³)\n• **NO2:** ${data.no2} µg/m³ (${whoNo2Ratio}× the WHO guideline of 25 µg/m³)\n\nWith **${data.windKmh} km/h** winds and **${data.humidityPct}%** humidity, air is cleanest around **${data.cleanestWindow.label}** (avg AQI **${data.cleanestWindow.avgAqi}**) and heaviest during **${data.peakTrafficWindow.label}** (avg AQI **${data.peakTrafficWindow.avgAqi}**).`;
  }

  // 5. General catch-all summary tailored to city + profile
  return `Right now in **${data.neighborhood}, ${data.city}**, air quality is **AQI ${data.aqi} (${data.status})**, led by **${data.dominantPollutant}** (PM2.5 **${data.pm25} µg/m³**, PM10 **${data.pm10} µg/m³**, NO2 **${data.no2} µg/m³**).\n\nFor **${profileMeta.label}**:\n• **Outdoor Exercise:** ${exerciseRec.verdict} — ${exerciseRec.timingNote}\n• **Mask Protection:** ${maskRec.verdict}\n• **Window Ventilation:** ${ventRec.verdict}\n\n${local.headline}. ${local.commuteTip}.`;
}
