import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { placeKey, wordKeys, shardFor, searchPlaces } from '../js/places.js';

const root = new URL('../', import.meta.url);
const fetchFn = async (u) => {
  try {
    const txt = await readFile(new URL(u, root), 'utf8');
    return { ok: true, text: async () => txt, json: async () => JSON.parse(txt) };
  } catch { return { ok: false, status: 404 }; }
};
const top = async (q) => (await searchPlaces(q, { fetchFn, limit: 5 })).results;

test('phonetic key absorbs common spelling differences', () => {
  assert.equal(placeKey('Darjeeling'), placeKey('Dārjiling'));
  assert.equal(placeKey('Kedarnath'), placeKey('Kedaarnath'));
  assert.equal(placeKey('Naini Tāl'), placeKey('Nainital'));
  assert.equal(placeKey('Bhatinda'), placeKey('Batinda'));
  assert.deepEqual(wordKeys('Bodh Gaya'), ['bodgaya', 'gaya']);
});

test('shard lookup follows split prefixes', () => {
  const split = new Set(['pu', 'pur']);
  assert.deepEqual(shardFor('ludiana', split), { file: 'lu', needMore: false });
  assert.deepEqual(shardFor('pun', split), { file: 'pun', needMore: false });
  assert.deepEqual(shardFor('pu', split), { file: 'pu_', needMore: true });
  assert.deepEqual(shardFor('purnia', split), { file: 'purn', needMore: false });
});

test('index covers every state and over 500,000 places', async () => {
  const idx = JSON.parse(await readFile(new URL('data/places/index.json', root), 'utf8'));
  assert.ok(idx.places > 500000, `${idx.places}`);
  assert.equal(idx.states.length, 36);
  for (const p of idx.split) assert.ok(p.length < 4);
});

test('finds cities, towns, pilgrim towns and villages, by modern, old or variant names', async () => {
  const cases = {
    'New Delhi': ['Delhi', 28.6, 77.2], Bombay: ['Maharashtra', 19.1, 72.9], Bengaluru: ['Karnataka', 13.0, 77.6],
    Nainital: ['Uttarakhand', 29.4, 79.5], Darjeeling: ['West Bengal', 27.0, 88.3], 'Mount Abu': ['Rajasthan', 24.6, 72.7],
    Kedarnath: ['Uttarakhand', 30.7, 79.1], Gurgaon: ['Haryana', 28.5, 77.0], Prayagraj: ['Uttar Pradesh', 25.4, 81.8],
    Kohima: ['Nagaland', 25.7, 94.1], 'Port Blair': ['Andaman', 11.7, 92.7], Gaya: ['Bihar', 24.8, 85.0],
  };
  for (const [q, [state, lat, lon]] of Object.entries(cases)) {
    const [first] = await top(q);
    assert.ok(first, q);
    assert.ok(first.label.includes(state), `${q} → ${first.label}`);
    assert.ok(Math.abs(first.lat - lat) < 0.15 && Math.abs(first.lon - lon) < 0.15, `${q} → ${first.lat},${first.lon}`);
    assert.equal(first.tz, 5.5);
  }
});

test('short or split prefixes ask for more letters; foreign cities keep their timezone', async () => {
  assert.equal((await searchPlaces('p', { fetchFn })).needMore, true);
  assert.equal((await searchPlaces('pu', { fetchFn })).needMore, true);
  const [dubai] = await top('Dubai');
  assert.equal(dubai.tz, 4);
});

test('Hindi (Devanagari) queries find the right place first', async () => {
  const cases = {
    'वाराणसी': 'Varanasi', 'कानपुर': 'Kanpur', 'मथुरा': 'Mathura', 'नैनीताल': 'Naini', 'दार्जिलिंग': 'Dārjiling',
    'मेरठ': 'Meerut', 'बरेली': 'Bareilly', 'अयोध्या': 'Ayodhya', 'गोरखपुर': 'Gorakhpur', 'लखनऊ': 'Lucknow',
    'जयपुर': 'Jaipur', 'उदयपुर': 'Udaipur', 'इंदौर': 'Indore', 'भोपाल': 'Bhopal', 'चंडीगढ़': 'Chandigarh',
    'हरिद्वार': 'Haridwar', 'उज्जैन': 'Ujjain', 'कोलकाता': 'Kolkata', 'मुंबई': 'Mumbai', 'पुणे': 'Pune',
    'शिमला': 'Shimla', 'नई दिल्ली': 'New Delhi', 'बोध गया': 'Bodh Gaya', 'झुंझुनू': 'Jhunjhun', 'केदारनाथ': 'Kedārnāth',
    'ऋषिकेश': 'Rishikesh', 'प्रयागराज': 'Prayagraj', 'पटना': 'Patna', 'सीकर': 'Sīkar', 'छपरा': 'Chāpra',
  };
  for (const [q, want] of Object.entries(cases)) {
    const [first] = await top(q);
    assert.ok(first && placeKey(first.label).startsWith(placeKey(want)), `${q} → ${first?.label}`);
  }
});

test('alternate spellings show the main name', async () => {
  const [m] = await top('Bombay');
  assert.equal(m.name, 'Mumbai');
  assert.equal(m.alias, 'Bombay');
});

test('results carry Hindi names: real ones where known, transliterated otherwise', async () => {
  const known = { Gorakhpur: 'गोरखपुर, उत्तर प्रदेश', Varanasi: 'वाराणसी, उत्तर प्रदेश', Bombay: 'मुम्बई, महाराष्ट्र', Darjeeling: 'दार्जिलिंग, पश्चिम बंगाल' };
  for (const [q, want] of Object.entries(known)) {
    const [first] = await top(q);
    assert.equal(first.labelHi, want, q);
    assert.equal(first.hiExact, true, q);
  }
  for (const q of ['Rampur', 'chandrapura', 'purwa', 'Kedarnath', 'Dubai', 'Thrissur']) {
    for (const r of await top(q)) assert.match(r.nameHi, /^[ऀ-ॿ\s\-.,()]+$/, `${q}: ${r.label} → ${r.nameHi}`);
  }
  // A wrong Wikidata match is rejected in favour of transliteration
  const sambalpur = (await searchPlaces('Rampur', { fetchFn, limit: 25 })).results.find((r) => r.label.includes('Sambalpur'));
  assert.equal(sambalpur.nameHi, 'रामपुर');
});

test('Hindi names are checked against the English name', async () => {
  const { hindiMatches } = await import('../js/places.js');
  for (const [hi, en] of [['शिलांग', 'Shillong'], ['रायबरेली', 'Raebareli'], ['कटक', 'Cuttack'], ['तृश्शूर', 'Thrissur'], ['भुवनेश्वर', 'Bhubaneswar'], ['काँगड़ा', 'Kangra']]) {
    assert.ok(hindiMatches(hi, en), `${en} = ${hi}`);
  }
  for (const [hi, en] of [['रैड़ाखोल', 'Rampur'], ['बिधाननगर', 'Salt Lake City'], ['तिनसुकिया', 'Digboi']]) {
    assert.ok(!hindiMatches(hi, en), `${en} ≠ ${hi}`);
  }
});

test('transliteration of common place-name patterns', async () => {
  const { toHindi } = await import('../js/hindi.js');
  const cases = {
    Gorakhpur: 'गोरखपुर', Chandrapur: 'चंद्रपुर', Ayodhya: 'अयोध्या', Ujjain: 'उज्जैन', Amritsar: 'अमृतसर', Araria: 'अररिया',
    'Rāmpur': 'रामपुर', Badrinath: 'बद्रीनाथ', 'Ahmadābād': 'अहमदाबाद', Kishangarh: 'किशनगढ़', Mumbai: 'मुंबई', Chennai: 'चेन्नई',
    'Kedārnāth': 'केदारनाथ', 'Bhāgalpur': 'भागलपुर', 'New Colony': 'नई कॉलोनी',
  };
  for (const [en, hi] of Object.entries(cases)) assert.equal(toHindi(en), hi, en);
});
