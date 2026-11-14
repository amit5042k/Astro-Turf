// Astronomy engine for sidereal (Vedic) astrology.
// Sun & Moon: Meeus (Astronomical Algorithms) series.
// Planets: JPL "Approximate Positions of the Planets" Keplerian elements (valid 1800–2050).
// Ayanamsa: Lahiri (Chitrapaksha), linear approximation.
// Accuracy is a few arc-minutes for most bodies — enough for sign, nakshatra and house work.

const D2R = Math.PI / 180;
const R2D = 180 / Math.PI;

export const norm360 = (x) => ((x % 360) + 360) % 360;
const sin = (d) => Math.sin(d * D2R);
const cos = (d) => Math.cos(d * D2R);

export const PLANETS = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];

export function julianDay(date) {
  return date.getTime() / 86400000 + 2440587.5;
}

const centuries = (jd) => (jd - 2451545.0) / 36525;

export function lahiriAyanamsa(jd) {
  return 23.85306 + 1.39697 * centuries(jd);
}

export function obliquity(jd) {
  const T = centuries(jd);
  return 23.4392911 - 0.0130042 * T;
}

export function sunTropical(jd) {
  const T = centuries(jd);
  const L0 = 280.46646 + 36000.76983 * T + 0.0003032 * T * T;
  const M = 357.52911 + 35999.05029 * T - 0.0001537 * T * T;
  const C = (1.914602 - 0.004817 * T - 0.000014 * T * T) * sin(M)
    + (0.019993 - 0.000101 * T) * sin(2 * M) + 0.000289 * sin(3 * M);
  const omega = 125.04 - 1934.136 * T;
  return norm360(L0 + C - 0.00569 - 0.00478 * sin(omega));
}

// [D, M, M', F, coefficient (1e-6 deg)]
const MOON_TERMS = [
  [0, 0, 1, 0, 6288774], [2, 0, -1, 0, 1274027], [2, 0, 0, 0, 658314], [0, 0, 2, 0, 213618],
  [0, 1, 0, 0, -185116], [0, 0, 0, 2, -114332], [2, 0, -2, 0, 58793], [2, -1, -1, 0, 57066],
  [2, 0, 1, 0, 53322], [2, -1, 0, 0, 45758], [0, 1, -1, 0, -40923], [1, 0, 0, 0, -34720],
  [0, 1, 1, 0, -30383], [2, 0, 0, -2, 15327], [0, 0, 1, 2, -12528], [0, 0, 1, -2, 10980],
  [4, 0, -1, 0, 10675], [0, 0, 3, 0, 10034], [4, 0, -2, 0, 8548], [2, 1, -1, 0, -7888],
  [2, 1, 0, 0, -6766], [1, 0, -1, 0, -5163], [1, 1, 0, 0, 4987], [2, -1, 1, 0, 4036],
  [2, 0, 2, 0, 3994], [4, 0, 0, 0, 3861], [2, 0, -3, 0, 3665], [0, 1, -2, 0, -2689],
  [2, 0, -1, 2, -2602], [2, -1, -2, 0, 2390], [1, 0, 1, 0, -2348], [2, -2, 0, 0, 2236],
  [0, 1, 2, 0, -2120], [0, 2, 0, 0, -2069], [2, -2, -1, 0, 2048], [2, 0, 1, -2, -1773],
  [2, 0, 0, 2, -1595], [4, -1, -1, 0, 1215], [0, 0, 2, 2, -1110], [3, 0, -1, 0, -892],
];

export function moonTropical(jd) {
  const T = centuries(jd);
  const Lp = 218.3164477 + 481267.88123421 * T - 0.0015786 * T * T;
  const D = 297.8501921 + 445267.1114034 * T - 0.0018819 * T * T;
  const M = 357.5291092 + 35999.0502909 * T - 0.0001536 * T * T;
  const Mp = 134.9633964 + 477198.8675055 * T + 0.0087414 * T * T;
  const F = 93.272095 + 483202.0175233 * T - 0.0036539 * T * T;
  const E = 1 - 0.002516 * T - 0.0000074 * T * T;
  const A1 = 119.75 + 131.849 * T;
  const A2 = 53.09 + 479264.29 * T;
  let sum = 0;
  for (const [d, m, mp, f, c] of MOON_TERMS) {
    const e = Math.abs(m) === 1 ? E : Math.abs(m) === 2 ? E * E : 1;
    sum += c * e * sin(d * D + m * M + mp * Mp + f * F);
  }
  sum += 3958 * sin(A1) + 1962 * sin(Lp - F) + 318 * sin(A2);
  return norm360(Lp + sum / 1e6);
}

// a, e, I, L, longPeri, longNode and their rates per Julian century (J2000 ecliptic)
const ELEMENTS = {
  Mercury: [[0.38709927, 0.20563593, 7.00497902, 252.2503235, 77.45779628, 48.33076593],
    [0.00000037, 0.00001906, -0.00594749, 149472.67411175, 0.16047689, -0.12534081]],
  Venus: [[0.72333566, 0.00677672, 3.39467605, 181.9790995, 131.60246718, 76.67984255],
    [0.0000039, -0.00004107, -0.0007889, 58517.81538729, 0.00268329, -0.27769418]],
  Earth: [[1.00000261, 0.01671123, -0.00001531, 100.46457166, 102.93768193, 0],
    [0.00000562, -0.00004392, -0.01294668, 35999.37244981, 0.32327364, 0]],
  Mars: [[1.52371034, 0.0933941, 1.84969142, -4.55343205, -23.94362959, 49.55953891],
    [0.00001847, 0.00007882, -0.00813131, 19140.30268499, 0.44441088, -0.29257343]],
  Jupiter: [[5.202887, 0.04838624, 1.30439695, 34.39644051, 14.72847983, 100.47390909],
    [-0.00011607, -0.00013253, -0.00183714, 3034.74612775, 0.21252668, 0.20469106]],
  Saturn: [[9.53667594, 0.05386179, 2.48599187, 49.95424423, 92.59887831, 113.66242448],
    [-0.0012506, -0.00050991, 0.00193609, 1222.49362201, -0.41897216, -0.28867794]],
};

function helio(name, T) {
  const [base, rate] = ELEMENTS[name];
  const [a, e, I, L, wbar, node] = base.map((v, i) => v + rate[i] * T);
  const w = wbar - node;
  const M = norm360(L - wbar);
  let E = M + R2D * e * sin(M);
  for (let i = 0; i < 8; i++) {
    const dE = (M - (E - R2D * e * sin(E))) / (1 - e * cos(E));
    E += dE;
    if (Math.abs(dE) < 1e-7) break;
  }
  const xp = a * (cos(E) - e);
  const yp = a * Math.sqrt(1 - e * e) * sin(E);
  const x = (cos(w) * cos(node) - sin(w) * sin(node) * cos(I)) * xp
    + (-sin(w) * cos(node) - cos(w) * sin(node) * cos(I)) * yp;
  const y = (cos(w) * sin(node) + sin(w) * cos(node) * cos(I)) * xp
    + (-sin(w) * sin(node) + cos(w) * cos(node) * cos(I)) * yp;
  const z = sin(w) * sin(I) * xp + cos(w) * sin(I) * yp;
  return [x, y, z];
}

export function planetTropical(name, jd) {
  const T = centuries(jd);
  const p = helio(name, T);
  const earth = helio('Earth', T);
  const lonJ2000 = Math.atan2(p[1] - earth[1], p[0] - earth[0]) * R2D;
  return norm360(lonJ2000 + 1.396971 * T); // precess J2000 -> equinox of date
}

export function meanNodeTropical(jd) {
  const T = centuries(jd);
  return norm360(125.0445479 - 1934.1362891 * T + 0.0020754 * T * T);
}

export function tropicalLongitude(name, jd) {
  switch (name) {
    case 'Sun': return sunTropical(jd);
    case 'Moon': return moonTropical(jd);
    case 'Rahu': return meanNodeTropical(jd);
    case 'Ketu': return norm360(meanNodeTropical(jd) + 180);
    default: return planetTropical(name, jd);
  }
}

export function siderealLongitude(name, jd) {
  return norm360(tropicalLongitude(name, jd) - lahiriAyanamsa(jd));
}

export function isRetrograde(name, jd) {
  if (name === 'Rahu' || name === 'Ketu') return true;
  if (name === 'Sun' || name === 'Moon') return false;
  const a = tropicalLongitude(name, jd - 0.5);
  const b = tropicalLongitude(name, jd + 0.5);
  return ((b - a + 540) % 360) - 180 < 0;
}

export function gmst(jd) {
  const T = centuries(jd);
  return norm360(280.46061837 + 360.98564736629 * (jd - 2451545) + 0.000387933 * T * T - (T * T * T) / 38710000);
}

// Tropical ascendant from RAMC (local sidereal time in degrees), obliquity and latitude.
export function ascendantFromRAMC(ramc, eps, lat) {
  const y = cos(ramc);
  const x = -(sin(ramc) * cos(eps) + Math.tan(lat * D2R) * sin(eps));
  return norm360(Math.atan2(y, x) * R2D);
}

export function siderealAscendant(jd, lat, lon) {
  const ramc = norm360(gmst(jd) + lon);
  return norm360(ascendantFromRAMC(ramc, obliquity(jd), lat) - lahiriAyanamsa(jd));
}

export const signOf = (lon) => Math.floor(norm360(lon) / 30); // 0 = Aries
export const nakshatraOf = (lon) => Math.floor(norm360(lon) / (360 / 27));
export const padaOf = (lon) => Math.floor((norm360(lon) % (360 / 27)) / (360 / 108)) + 1;

export function formatDeg(lon) {
  const d = norm360(lon) % 30;
  const deg = Math.floor(d);
  const min = Math.floor((d - deg) * 60);
  return `${deg}°${String(min).padStart(2, '0')}'`;
}

// Convert local civil time (fields) with a UTC offset in hours to a Date (UTC instant).
export function localToDate(y, m, d, hh, mm, tzHours) {
  return new Date(Date.UTC(y, m - 1, d, hh, mm) - tzHours * 3600000);
}

export function birthChart({ date, lat, lon }) {
  const jd = julianDay(date);
  const asc = siderealAscendant(jd, lat, lon);
  const lagna = signOf(asc);
  const planets = PLANETS.map((name) => {
    const l = siderealLongitude(name, jd);
    return {
      name, lon: l, sign: signOf(l), nakshatra: nakshatraOf(l), pada: padaOf(l),
      house: ((signOf(l) - lagna + 12) % 12) + 1, retro: isRetrograde(name, jd),
    };
  });
  return { jd, ascendant: asc, lagna, planets, ayanamsa: lahiriAyanamsa(jd) };
}

// ---------- Panchang ----------

function sunEquatorial(jd) {
  const lam = sunTropical(jd);
  const eps = obliquity(jd);
  const ra = norm360(Math.atan2(cos(eps) * sin(lam), cos(lam)) * R2D);
  const dec = Math.asin(sin(eps) * sin(lam)) * R2D;
  return { ra, dec };
}

// Returns UTC Date of sunrise/sunset for the local calendar day (y,m,d) at given place.
export function sunriseSunset(y, m, d, lat, lon, tzHours) {
  const event = (rising) => {
    let jd = julianDay(localToDate(y, m, d, 12, 0, tzHours));
    for (let i = 0; i < 4; i++) {
      const { ra, dec } = sunEquatorial(jd);
      const cosH = (sin(-0.833) - sin(lat) * sin(dec)) / (cos(lat) * cos(dec));
      if (cosH < -1 || cosH > 1) return null;
      const H = Math.acos(cosH) * R2D;
      const transitLST = ra; // Sun on meridian when LST == RA
      const targetLST = rising ? transitLST - H : transitLST + H;
      const lst = norm360(gmst(jd) + lon);
      let diff = ((targetLST - lst + 540) % 360) - 180;
      jd += diff / 360.98564736629;
    }
    return new Date((jd - 2440587.5) * 86400000);
  };
  return { sunrise: event(true), sunset: event(false) };
}

export function panchang(date, lat, lon, tzHours) {
  const jd = julianDay(date);
  const sun = siderealLongitude('Sun', jd);
  const moon = siderealLongitude('Moon', jd);
  const diff = norm360(moon - sun);
  const tithi = Math.floor(diff / 12); // 0..29
  const half = Math.floor(diff / 6); // 0..59
  let karana;
  if (half === 0) karana = 10;
  else if (half >= 57) karana = 7 + (half - 57);
  else karana = (half - 1) % 7;
  const yoga = Math.floor(norm360(sun + moon) / (360 / 27));
  const local = new Date(date.getTime() + tzHours * 3600000);
  const y = local.getUTCFullYear(); const m = local.getUTCMonth() + 1; const d = local.getUTCDate();
  const weekday = local.getUTCDay();
  const { sunrise, sunset } = sunriseSunset(y, m, d, lat, lon, tzHours);
  let rahuKaal = null;
  if (sunrise && sunset) {
    const seg = (sunset - sunrise) / 8;
    const idx = [7, 1, 6, 4, 5, 3, 2][weekday]; // 0-based segment for Sun..Sat
    rahuKaal = { start: new Date(sunrise.getTime() + seg * idx), end: new Date(sunrise.getTime() + seg * (idx + 1)) };
  }
  return {
    tithi, paksha: tithi < 15 ? 'Shukla' : 'Krishna', nakshatra: nakshatraOf(moon), pada: padaOf(moon),
    yoga, karana, weekday, sunrise, sunset, rahuKaal, moonSign: signOf(moon), sunSign: signOf(sun),
  };
}
