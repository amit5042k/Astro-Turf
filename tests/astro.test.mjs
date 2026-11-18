import test from 'node:test';
import assert from 'node:assert/strict';
import {
  julianDay, siderealLongitude, lahiriAyanamsa, signOf, ascendantFromRAMC, norm360,
  sunTropical, panchang, sunriseSunset,
} from '../js/astro.js';
import { weeklyForLagna, weekStart } from '../js/predict.js';

const jd = (iso) => julianDay(new Date(iso));
const angDiff = (a, b) => Math.abs(((a - b + 540) % 360) - 180);

test('Lahiri ayanamsa ~24.2° in 2026', () => {
  const a = lahiriAyanamsa(jd('2026-01-01T00:00:00Z'));
  assert.ok(a > 24.15 && a < 24.27, `got ${a}`);
});

test('March 2026 equinox: tropical Sun ≈ 0°', () => {
  assert.ok(angDiff(sunTropical(jd('2026-03-20T14:46:00Z')), 0) < 0.05);
});

test('Makar Sankranti 2026: sidereal Sun enters Capricorn (270°) around 14 Jan', () => {
  const s = siderealLongitude('Sun', jd('2026-01-14T09:45:00Z'));
  assert.ok(angDiff(s, 270) < 0.5, `got ${s}`);
});

test('Solar eclipse 12 Aug 2026: Sun and Moon conjunct', () => {
  const t = jd('2026-08-12T17:46:00Z');
  const d = angDiff(siderealLongitude('Sun', t), siderealLongitude('Moon', t));
  assert.ok(d < 0.5, `separation ${d}`);
});

test('Slow planet signs in mid-2026 (sidereal)', () => {
  const t = jd('2026-07-15T00:00:00Z');
  assert.equal(signOf(siderealLongitude('Saturn', t)), 11, 'Saturn in Pisces');
  assert.equal(signOf(siderealLongitude('Jupiter', t)), 3, 'Jupiter in Cancer');
  assert.equal(signOf(siderealLongitude('Rahu', t)), 10, 'Rahu in Aquarius');
  assert.equal(signOf(siderealLongitude('Ketu', t)), 4, 'Ketu in Leo');
});

test('Ascendant: equator with RAMC 0 rises at 90°', () => {
  assert.ok(angDiff(ascendantFromRAMC(0, 23.44, 0), 90) < 1e-9);
  assert.ok(angDiff(ascendantFromRAMC(180, 23.44, 0), 270) < 1e-9);
});

test('Delhi sunrise in mid-November ≈ 06:45 IST', () => {
  const { sunrise } = sunriseSunset(2026, 11, 14, 28.61, 77.21, 5.5);
  const ist = new Date(sunrise.getTime() + 5.5 * 3600000);
  const mins = ist.getUTCHours() * 60 + ist.getUTCMinutes();
  assert.ok(Math.abs(mins - (6 * 60 + 45)) < 8, `got ${ist.toISOString()}`);
});

test('Panchang on full moon has tithi Purnima (index 14)', () => {
  // Full moon 2026-08-28 ~04:18 UTC
  const p = panchang(new Date('2026-08-28T04:18:00Z'), 28.61, 77.21, 5.5);
  assert.ok(p.tithi === 14 || p.tithi === 15, `tithi ${p.tithi}`);
});

test('weekStart returns a Monday', () => {
  const m = weekStart(new Date('2026-11-14T10:00:00Z'));
  assert.equal(m.getUTCDay(), 1);
  assert.equal(m.toISOString().slice(0, 10), '2026-11-09');
});

test('weekly prediction produces all sections for all 12 lagnas, in both languages', () => {
  const ws = weekStart(new Date('2026-11-14T10:00:00Z'));
  for (const lang of ['en', 'hi']) {
    for (let l = 0; l < 12; l++) {
      const w = weeklyForLagna(l, ws, lang);
      assert.ok(w.overview.length > 40);
      for (const k of ['career', 'finance', 'love', 'health']) {
        assert.ok(w.areas[k].text.length > 20, `${lang} ${l} ${k}`);
        assert.ok(w.areas[k].stars >= 1 && w.areas[k].stars <= 5);
      }
      assert.equal(w.days.length, 7);
      assert.ok(w.luckyNumber >= 1 && w.luckyNumber <= 9);
      assert.ok(w.remedy.length > 10);
      assert.ok(!/undefined|NaN/.test(JSON.stringify(w)), `${lang} ${l}`);
    }
  }
});

test('norm360 handles negatives', () => assert.equal(norm360(-30), 330));

test('At sunrise the ascendant equals the Sun’s longitude', async () => {
  const { siderealAscendant } = await import('../js/astro.js');
  for (const [lat, lon, y, m, d] of [[28.61, 77.21, 2026, 11, 14], [19.08, 72.88, 2026, 6, 21], [13.08, 80.27, 2026, 1, 1]]) {
    const { sunrise } = sunriseSunset(y, m, d, lat, lon, 5.5);
    const t = julianDay(sunrise);
    const diff = angDiff(siderealAscendant(t, lat, lon), siderealLongitude('Sun', t));
    assert.ok(diff < 1.5, `asc vs sun diff ${diff} at ${lat},${lon}`);
  }
});

test('house lordship and aspects from lagna', async () => {
  const { housesRuled, aspectedHouses } = await import('../js/predict.js');
  assert.deepEqual(housesRuled('Venus', 0), [2, 7]); // Aries lagna: Venus rules Taurus & Libra
  assert.deepEqual(housesRuled('Saturn', 9), [1, 2]); // Capricorn lagna
  assert.deepEqual(housesRuled('Sun', 4), [1]);
  assert.deepEqual(housesRuled('Rahu', 3), []);
  assert.deepEqual(aspectedHouses('Jupiter', 5), [9, 11, 1]);
  assert.deepEqual(aspectedHouses('Saturn', 12), [2, 6, 9]);
  assert.deepEqual(aspectedHouses('Venus', 3), [9]);
});

test('Moon timeline covers the week with exact, ordered sign changes', async () => {
  const { weekSky } = await import('../js/predict.js');
  const ws = weekStart(new Date('2026-11-14T10:00:00Z'));
  const segs = weekSky(ws).moonSegments;
  assert.ok(segs.length >= 3 && segs.length <= 5, `${segs.length} segments`);
  assert.equal(segs[0].start, null);
  assert.equal(segs.at(-1).end, null);
  for (let i = 1; i < segs.length; i++) {
    assert.equal(segs[i].start.getTime(), segs[i - 1].end.getTime());
    assert.equal(segs[i].sign, (segs[i - 1].sign + 1) % 12);
    const jd = julianDay(segs[i].start);
    const before = signOf(siderealLongitude('Moon', jd - 2 / 1440));
    const after = signOf(siderealLongitude('Moon', jd + 2 / 1440));
    assert.notEqual(before, after, 'change lands within ±2 minutes');
  }
});

test('area texts do not repeat the same transit line, and do/avoid lists are filled', () => {
  const ws = weekStart(new Date('2026-11-14T10:00:00Z'));
  for (let l = 0; l < 12; l++) {
    const w = weeklyForLagna(l, ws, 'en');
    const sentences = Object.values(w.areas).flatMap((a) => a.text.split(/(?<=\.)\s/).filter((x) => /house/.test(x) && /: /.test(x)));
    assert.equal(new Set(sentences).size, sentences.length, `lagna ${l}`);
    assert.ok(w.dos.length >= 1 && w.donts.length >= 1);
  }
});
