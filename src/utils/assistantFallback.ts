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

  const indiaNote =
    data.indiaAqi !== undefined
      ? ` (around **${data.indiaAqi} · ${data.indiaStatus}** on India's CPCB scale)`
      : '';

  const pollutantSummary = `PM2.5 **${data.pm25} µg/m³**, Road Dust PM10 **${data.pm10} µg/m³**, and Traffic Exhaust NO2 **${data.no2} µg/m³**`;

  const mentionedHour = parseMentionedHour(q);
  const hourPoint =
    mentionedHour !== null ? findHourlyPoint(data.hourly, mentionedHour) : undefined;

  const isAccuracyQuery =
    /\b(accurate|accuracy|basis|source|real|scared|panic|scale|cpcb|who|trust|reliable|wrong|calculated|where.*data|how.*numbers)\b/.test(
      q
    );
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
    /\b(why|no2|pm2\.?5|pm10|pollutant|cause|spike|guideline|wind|weather)\b/.test(
      q
    );

  // 0. Data accuracy, basis, or scale comparison question
  if (isAccuracyQuery) {
    return `Here is how **${data.neighborhood}, ${data.city}** is calculated so you know what the numbers mean:\n\n• **Data Source (${data.sourceLabel}):** Base readings come hourly from **Open-Meteo's Copernicus weather & air model** for your area's GPS coordinates, gently adjusted for local traffic and tree cover.\n• **Why Numbers Look Stricter Here:** The main score (**${data.aqi} · ${data.status}**) uses the **US AQI** scale${indiaNote}. India's official CPCB scale rates ` + '`101–200`' + ` as **Moderate** rather than high risk.\n• **Real-World Accuracy:** Regional weather models cover a ~10–25 km area, so readings can differ by ~15–25% from a physical roadside government monitor.`;
  }

  // 1. Time-specific or outdoor exercise question
  if (isExerciseQuery && !isIndoorDustQuery && !isMaskCommuteQuery) {
    if (hourPoint) {
      const hourRiskNote =
        hourPoint.band === 'peak'
          ? `At **${hourPoint.hourLabel}**, **${data.neighborhood}, ${data.city}** is in a busier traffic window with US AQI around **${hourPoint.aqi} (${hourPoint.status})** (PM2.5 **${hourPoint.pm25} µg/m³**).`
          : hourPoint.band === 'clean'
          ? `At **${hourPoint.hourLabel}**, **${data.neighborhood}, ${data.city}** is in one of today's cleaner hours with US AQI near **${hourPoint.aqi} (${hourPoint.status})** (PM2.5 **${hourPoint.pm25} µg/m³**).`
          : `At **${hourPoint.hourLabel}**, **${data.neighborhood}, ${data.city}** is expected to be around **US AQI ${hourPoint.aqi} (${hourPoint.status})**.`;

      const actionAdvice =
        hourPoint.aqi >= 180 || (profile !== 'general' && hourPoint.aqi >= 145)
          ? `For **${profileMeta.label}**, normal walking is fine, or move heavy running indoors / aim for today's cleanest hours (**${data.cleanestWindow.label}**, avg AQI **${data.cleanestWindow.avgAqi}**).`
          : `For **${profileMeta.label}**, outdoor guidance is **${exerciseRec.verdict}**—choose quiet green lanes away from main signals and avoid **${data.peakTrafficWindow.label}**.`;

      return `${hourRiskNote}\n\n• **Right Now:** US AQI **${data.aqi} (${data.status})**${indiaNote}.\n• **Simple Advice:** ${actionAdvice} Mask status: **${maskRec.verdict}**.`;
    }

    return `In **${data.neighborhood}, ${data.city}** (**US AQI ${data.aqi} · ${data.status}**${indiaNote}), outdoor advice for **${profileMeta.label}** is **${exerciseRec.verdict}**.\n\n• **What to Do:** ${exerciseRec.detail}\n• **Best Hours:** **${data.cleanestWindow.label}** (avg AQI **${data.cleanestWindow.avgAqi}**) is cleanest; traffic builds around **${data.peakTrafficWindow.label}**.`;
  }

  // 2. Indoor dust / ventilation / home air question
  if (isIndoorDustQuery) {
    const dustDetail =
      data.pm10 > 85
        ? `Road dust (PM10) is **${data.pm10} µg/m³** (India 24h safe limit: 100 µg/m³). Damp-mopping floors keeps settled dust out of the air better than dry sweeping.`
        : `Current readings in **${data.neighborhood}** are ${pollutantSummary}.`;

    return `For **${data.neighborhood}, ${data.city}** (**US AQI ${data.aqi} · ${data.status}**${indiaNote}), home window advice for **${profileMeta.label}** is **${ventRec.verdict}**.\n\n• **At Home:** ${dustDetail} ${ventRec.detail}\n• **Quick Steps:** Damp-mop instead of dry sweeping and air out rooms during **${data.cleanestWindow.label}**.`;
  }

  // 3. Mask / commute / traffic question
  if (isMaskCommuteQuery) {
    return `For **${profileMeta.label}** travelling through **${data.neighborhood}, ${data.city}** (**US AQI ${data.aqi} · ${data.status}**${indiaNote}), mask guidance is **${maskRec.verdict}**.\n\n• **What's in the Air:** ${pollutantSummary}.\n• **Practical Advice:** ${maskRec.detail}\n• **Commute Tip:** ${local.commuteTip}.`;
  }

  // 4. Pollutant / cause / weather breakdown
  if (isPollutantWhyQuery) {
    return `**${data.neighborhood}, ${data.city}** is at **US AQI ${data.aqi} (${data.status})**${indiaNote}, led mainly by **${data.dominantPollutant}**.\n\n• **PM2.5 (Tiny Particles):** ${data.pm25} µg/m³ (India 24h safe limit: 60 µg/m³)\n• **PM10 (Road Dust):** ${data.pm10} µg/m³ (India 24h safe limit: 100 µg/m³)\n• **NO2 (Traffic Exhaust):** ${data.no2} µg/m³ (India 24h safe limit: 80 µg/m³)\n\nWind is blowing at **${data.windKmh} km/h**. Cleanest outdoor window today is **${data.cleanestWindow.label}**.`;
  }

  // 5. General catch-all summary
  return `Quick air summary for **${data.neighborhood}, ${data.city}** (**US AQI ${data.aqi} · ${data.status}**${indiaNote}) for **${profileMeta.label}**:\n\n• **Outdoor Time:** ${exerciseRec.verdict} — ${exerciseRec.detail}\n• **Masks:** ${maskRec.verdict} — ${maskRec.timingNote}.\n• **Windows:** ${ventRec.verdict} — ${ventRec.timingNote}.\n\n${local.headline}. ${local.commuteTip}.`;
}
