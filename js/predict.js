// Lagna-wise weekly prediction engine.
// Method: Gochar (transit) of each planet counted from the Lagna sign, using classical
// favourable-house rules, weighted by planet speed/importance, mapped to four life areas.

import { julianDay, siderealLongitude, isRetrograde, signOf, PLANETS } from './astro.js';
import {
  SIGN_SHORT, PLANET_NAMES, WEEKDAYS, HOUSE_RESULT, PLANET_FLAVOUR, AREA_SUMMARY, OVERVIEW_OPEN,
  LORD_LINE, TRANSIT_LINE, EVENT_LINE, DAY_NOTE, COLOURS, REMEDIES,
} from './i18n.js';

export const IST = 5.5;
const DAY = 86400000;

export const SIGN_LORD = ['Mars', 'Venus', 'Mercury', 'Moon', 'Sun', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Saturn', 'Jupiter'];
const LUCKY_NUMBER = { Sun: 1, Moon: 2, Jupiter: 3, Rahu: 4, Mercury: 5, Venus: 6, Ketu: 7, Saturn: 8, Mars: 9 };
const PLANET_DAY = { Sun: 0, Moon: 1, Mars: 2, Mercury: 3, Jupiter: 4, Venus: 5, Saturn: 6, Rahu: 6, Ketu: 2 };

const GOOD_HOUSES = {
  Sun: [3, 6, 10, 11], Moon: [1, 3, 6, 7, 10, 11], Mars: [3, 6, 11], Mercury: [2, 4, 6, 8, 10, 11],
  Jupiter: [2, 5, 7, 9, 11], Venus: [1, 2, 3, 4, 5, 8, 9, 11, 12], Saturn: [3, 6, 11], Rahu: [3, 6, 11], Ketu: [3, 6, 11],
};
const WEIGHT = { Sun: 1, Moon: 0, Mars: 1.5, Mercury: 1, Jupiter: 3, Venus: 1, Saturn: 3, Rahu: 2, Ketu: 1.5 };
const AREA_HOUSES = { career: [10, 6, 3, 11, 1], finance: [2, 11, 9, 5], love: [7, 5, 4, 2], health: [1, 6, 8, 12] };
const SLOW_FIRST = ['Jupiter', 'Saturn', 'Rahu', 'Ketu', 'Mars', 'Sun', 'Venus', 'Mercury'];

export const isGood = (planet, house) => GOOD_HOUSES[planet].includes(house);
export const houseFrom = (lagna, sign) => ((sign - lagna + 12) % 12) + 1;

// Monday (IST) of the week containing `date`, as a UTC-midnight Date labelling that calendar day.
export function weekStart(date = new Date()) {
  const ist = new Date(date.getTime() + IST * 3600000);
  const dow = ist.getUTCDay();
  const back = (dow + 6) % 7;
  return new Date(Date.UTC(ist.getUTCFullYear(), ist.getUTCMonth(), ist.getUTCDate() - back));
}
export const isoDate = (d) => d.toISOString().slice(0, 10);

// Instant for IST hour `h` on day `i` of the week
const instant = (ws, i, h = 12) => new Date(ws.getTime() + i * DAY + (h - IST) * 3600000);

const cache = new Map();
// Planet positions and events for the week — shared by all lagnas.
export function weekSky(ws) {
  const key = isoDate(ws);
  if (cache.has(key)) return cache.get(key);
  const mid = julianDay(instant(ws, 3, 12));
  const positions = Object.fromEntries(PLANETS.map((p) => {
    const lon = siderealLongitude(p, mid);
    return [p, { lon, sign: signOf(lon), retro: isRetrograde(p, mid) }];
  }));
  const moonDays = [];
  const events = [];
  for (let i = 0; i < 7; i++) {
    moonDays.push(signOf(siderealLongitude('Moon', julianDay(instant(ws, i, 12)))));
    const a = julianDay(instant(ws, i, 0));
    const b = julianDay(instant(ws, i + 1, 0));
    for (const p of PLANETS) {
      if (p === 'Moon') continue;
      const sa = signOf(siderealLongitude(p, a));
      const sb = signOf(siderealLongitude(p, b));
      if (sa !== sb) events.push({ type: 'ingress', planet: p, sign: sb, day: i });
      if (p !== 'Sun' && p !== 'Rahu' && p !== 'Ketu') {
        const ra = isRetrograde(p, a);
        const rb = isRetrograde(p, b);
        if (ra !== rb) events.push({ type: rb ? 'retro' : 'direct', planet: p, day: i });
      }
    }
  }
  const sky = { positions, moonDays, events };
  cache.set(key, sky);
  return sky;
}

const clampStars = (x) => Math.max(1, Math.min(5, Math.round(x)));

export function weeklyForLagna(lagna, ws, lang = 'en') {
  const sky = weekSky(ws);
  const P = PLANET_NAMES[lang];
  const transits = SLOW_FIRST.map((p) => {
    const { sign, retro } = sky.positions[p];
    const house = houseFrom(lagna, sign);
    return { planet: p, sign, house, retro, good: isGood(p, house) };
  });

  // Score each area and overall
  const areas = {};
  let overall = 0;
  for (const t of transits) overall += WEIGHT[t.planet] * (t.good ? 1 : -1) * (t.retro && t.planet !== 'Rahu' && t.planet !== 'Ketu' ? 0.8 : 1);
  const lord = SIGN_LORD[lagna];
  const lordHouse = houseFrom(lagna, sky.positions[lord].sign);
  const lordStrong = [1, 4, 5, 7, 9, 10, 11].includes(lordHouse);
  overall += lordStrong ? 1.5 : -1;

  for (const [area, houses] of Object.entries(AREA_HOUSES)) {
    let score = 0;
    const lines = [];
    for (const t of transits) {
      if (!houses.includes(t.house)) continue;
      const w = WEIGHT[t.planet] * (houses[0] === t.house ? 1.3 : 1);
      score += t.good ? w : -w;
      const res = HOUSE_RESULT[lang][t.good ? 'good' : 'bad'][t.house - 1];
      const flav = PLANET_FLAVOUR[lang][t.planet][t.good ? 0 : 1];
      lines.push(`${TRANSIT_LINE[lang](P[t.planet], t.house, t.retro)}: ${res} ${flav}`);
    }
    if (lordHouse && houses.includes(lordHouse)) score += lordStrong ? 1 : -0.5;
    const level = score >= 1.5 ? 2 : score <= -1.5 ? 0 : 1;
    const stars = clampStars(3 + score / 2);
    areas[area] = { level, stars, text: [AREA_SUMMARY[lang][area][level], ...lines.slice(0, 3)].join(' ') };
  }

  const overallLevel = overall >= 3 ? 2 : overall <= -3 ? 0 : 1;
  const signName = SIGN_SHORT[lang][lagna];
  const keyTransits = transits.slice(0, 4).map((t) => {
    const res = HOUSE_RESULT[lang][t.good ? 'good' : 'bad'][t.house - 1];
    return `${TRANSIT_LINE[lang](P[t.planet], t.house, t.retro)} — ${res}`;
  });
  const overview = [
    OVERVIEW_OPEN[lang][overallLevel](signName),
    LORD_LINE[lang](P[lord], lordHouse),
    ...keyTransits.map((s) => (lang === 'hi' ? s : s)),
  ].join(' ');

  // Day-by-day using Moon's house from Lagna (Chandra gochar)
  const days = sky.moonDays.map((ms, i) => {
    const house = houseFrom(lagna, ms);
    const date = new Date(ws.getTime() + i * DAY);
    const kind = [1, 3, 6, 10, 11].includes(house) ? 'good' : [4, 8, 12].includes(house) ? 'caution' : 'neutral';
    return { date, weekday: date.getUTCDay(), moonSign: ms, house, kind, note: DAY_NOTE[lang][kind] };
  });

  // Weakest planet (heaviest weight in an unfavourable house) gets the remedy
  const weak = transits.filter((t) => !t.good).sort((a, b) => WEIGHT[b.planet] - WEIGHT[a.planet])[0];
  const remedyPlanet = weak ? weak.planet : lord;
  const bestDay = days.find((d) => d.kind === 'good' && d.weekday === PLANET_DAY[lord])
    || days.find((d) => d.kind === 'good') || days[0];

  const events = sky.events.map((e) => {
    const d = WEEKDAYS[lang][(e.day + 1) % 7];
    const E = EVENT_LINE[lang];
    if (e.type === 'ingress') return E.ingress(P[e.planet], SIGN_SHORT[lang][e.sign], d);
    return E[e.type](P[e.planet], d);
  });

  return {
    lagna, weekStart: ws, overview, overallStars: clampStars(3 + overall / 3), overallLevel,
    areas, transits, days, events,
    luckyNumber: LUCKY_NUMBER[lord], luckyColour: COLOURS[lang][lord], luckyDay: bestDay,
    remedyPlanet, remedy: REMEDIES[lang][remedyPlanet],
  };
}
