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

  const pollutantSummary = `PM2.5 **${data.pm25} µg/m³**, PM10 **${data.pm10} µg/m³**, and NO2 **${data.no2} µg/m³** (dominant: **${data.dominantPollutant}**)`;

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
          ? `At **${hourPoint.hourLabel}**, **${data.neighborhood}, ${data.city}** enters a peak traffic/pollution period with AQI projected around **${hourPoint.aqi} (${hourPoint.status})** (hour PM2.5 **${hourPoint.pm25} µg/m³**, NO2 **${hourPoint.no2} µg/m³**).`
          : hourPoint.band === 'clean'
          ? `At **${hourPoint.hourLabel}**, **${data.neighborhood}, ${data.city}** is in a cleaner dispersion window with AQI projected near **${hourPoint.aqi} (${hourPoint.status})** (hour PM2.5 **${hourPoint.pm25} µg/m³**, NO2 **${hourPoint.no2} µg/m³**).`
          : `At **${hourPoint.hourLabel}**, **${data.neighborhood}, ${data.city}** is projected at **AQI ${hourPoint.aqi} (${hourPoint.status})** (hour PM2.5 **${hourPoint.pm25} µg/m³**, NO2 **${hourPoint.no2} µg/m³**).`;

      const actionAdvice =
        hourPoint.aqi >= 150 || (profile !== 'general' && hourPoint.aqi >= 100)
          ? `For **${profileMeta.label}**, shift intense cardio indoors or aim for today's cleanest window (**${data.cleanestWindow.label}**, avg AQI **${data.cleanestWindow.avgAqi}**).`
          : `For **${profileMeta.label}**, outdoor guidance is **${exerciseRec.verdict}**—stick to tree-lined side streets away from main roads and avoid **${data.peakTrafficWindow.label}** (avg AQI **${data.peakTrafficWindow.avgAqi}**).`;

      return `${hourRiskNote}\n\n• **Current Baseline:** AQI **${data.aqi} (${data.status})** with ${pollutantSummary}.\n• **Safety Plan (${profileMeta.label}):** ${actionAdvice} Mask guidance: **${maskRec.verdict}**.`;
    }

    return `In **${data.neighborhood}, ${data.city}** (current **AQI ${data.aqi} · ${data.status}**), outdoor activity guidance for **${profileMeta.label}** is **${exerciseRec.verdict}**.\n\n• **Pollutant Levels:** ${pollutantSummary}.\n• **Guidance:** ${exerciseRec.detail}\n• **Best Timing:** Target **${data.cleanestWindow.label}** (avg AQI **${data.cleanestWindow.avgAqi}**) and avoid **${data.peakTrafficWindow.label}** (avg AQI **${data.peakTrafficWindow.avgAqi}**).`;
  }

  // 2. Indoor dust / ventilation / home air question
  if (isIndoorDustQuery) {
    const dustDetail =
      data.pm10 > 70
        ? `Coarse dust (PM10) is elevated at **${data.pm10} µg/m³** alongside PM2.5 at **${data.pm25} µg/m³** and NO2 at **${data.no2} µg/m³**. Avoid dry sweeping, which resuspends settled dust into breathing height.`
        : `Current readings in **${data.neighborhood}** are ${pollutantSummary}.`;

    return `For **${data.neighborhood}, ${data.city}** (**AQI ${data.aqi} · ${data.status}**) and the **${profileMeta.label}** profile, window ventilation guidance is **${ventRec.verdict}**.\n\n• **Indoor Air & Dust:** ${dustDetail} ${ventRec.detail}\n• **Practical Steps:** Damp-mop floors with microfiber, keep outdoor shoes at the entry, and restrict any brief window airing to **${data.cleanestWindow.label}** (avg AQI **${data.cleanestWindow.avgAqi}**).`;
  }

  // 3. Mask / commute / traffic question
  if (isMaskCommuteQuery) {
    return `For **${profileMeta.label}** commuting through **${data.neighborhood}, ${data.city}** (**AQI ${data.aqi} · ${data.status}**), mask protection is **${maskRec.verdict}**.\n\n• **Exposure Snapshot:** ${pollutantSummary}.\n• **Mask & Fit:** ${maskRec.detail} ${maskRec.timingNote}.\n• **Local Commute Tip:** ${local.commuteTip}. Stepping one block off arterial roads reduces tailpipe NO2 spikes significantly.`;
  }

  // 4. Pollutant / cause / meteorological breakdown
  if (isPollutantWhyQuery) {
    const whoPm25Ratio = (data.pm25 / 15).toFixed(1);
    const whoPm10Ratio = (data.pm10 / 45).toFixed(1);
    const whoNo2Ratio = (data.no2 / 25).toFixed(1);
    return `**${data.neighborhood}, ${data.city}** is at **AQI ${data.aqi} (${data.status})**, led by **${data.dominantPollutant}**.\n\n• **PM2.5:** ${data.pm25} µg/m³ (${whoPm25Ratio}× WHO 24h limit of 15 µg/m³)\n• **PM10:** ${data.pm10} µg/m³ (${whoPm10Ratio}× WHO 24h limit of 45 µg/m³)\n• **NO2:** ${data.no2} µg/m³ (${whoNo2Ratio}× WHO 24h limit of 25 µg/m³)\n\nFor **${profileMeta.label}**, keep heavy exertion to **${data.cleanestWindow.label}** (avg AQI **${data.cleanestWindow.avgAqi}**) when **${data.windKmh} km/h** wind disperses buildup, and take precautions during **${data.peakTrafficWindow.label}**.`;
  }

  // 5. General catch-all safety summary tailored to city + profile
  return `Safety briefing for **${data.neighborhood}, ${data.city}** (**AQI ${data.aqi} · ${data.status}**) tailored to **${profileMeta.label}**:\n\n• **Pollutants:** ${pollutantSummary}.\n• **Outdoor Exercise:** ${exerciseRec.verdict} — ${exerciseRec.detail}\n• **Mask Protection:** ${maskRec.verdict} — ${maskRec.timingNote}.\n• **Window Ventilation:** ${ventRec.verdict} — ${ventRec.timingNote}.\n\n${local.headline}. ${local.commuteTip}.`;
}
