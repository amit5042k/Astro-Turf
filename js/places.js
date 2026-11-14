// Searchable list of every populated place in India (GeoNames, CC BY 4.0), built by tools/build_places.py.
// The index is split into small files by the first letters of a phonetic key, and only the file
// for what the user is typing is fetched.

const BASE = 'data/places/';
const REPL = [['ph', 'f'], ['kh', 'k'], ['gh', 'g'], ['chh', 'c'], ['ch', 'c'], ['jh', 'j'], ['th', 't'], ['dh', 'd'],
  ['bh', 'b'], ['sh', 's'], ['ee', 'i'], ['oo', 'u'], ['w', 'v'], ['z', 'j'], ['q', 'k']];

// Phonetic key tolerant of common romanisation differences (Darjeeling/Darjiling, Kedarnath/Kedaarnath).
// Must match place_key() in tools/build_places.py.
export function placeKey(s) {
  let k = String(s).normalize('NFKD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z]/g, '');
  for (const [a, b] of REPL) k = k.split(a).join(b);
  return k.replace(/(.)\1+/g, '$1');
}

// Keys of every word-start suffix: 'Bodh Gaya' -> ['bodgaya', 'gaya']
export function wordKeys(name) {
  const words = name.split(/[\s\-/(),.]+/);
  const out = [];
  for (let i = 0; i < words.length; i++) {
    const k = placeKey(words.slice(i).join(' '));
    if (k.length >= 2) out.push(k);
  }
  return out;
}

// ---------- Hindi (Devanagari) input ----------
// A Devanagari query is turned into a pattern over the same phonetic key the Latin names use.
// Each token is a list of alternatives in key-space; `opt` tokens may be absent. The inherent "a"
// is required after a word's first consonant and optional elsewhere (Hindi drops it: कानपुर = Kanpur).
const DEV_CONS = {
  'क': ['k'], 'ख': ['k'], 'ग': ['g'], 'घ': ['g'], 'ङ': ['n'], 'च': ['c'], 'छ': ['c'], 'ज': ['j'], 'झ': ['j'], 'ञ': ['n'],
  'ट': ['t'], 'ठ': ['t'], 'ड': ['d'], 'ढ': ['d'], 'ण': ['n'], 'त': ['t'], 'थ': ['t'], 'द': ['d'], 'ध': ['d'], 'न': ['n'],
  'प': ['p'], 'फ': ['f', 'p'], 'ब': ['b'], 'भ': ['b'], 'म': ['m'], 'य': ['y', 'i'], 'र': ['r'], 'ल': ['l'], 'ळ': ['l'],
  'व': ['v', 'b'], 'श': ['s'], 'ष': ['s'], 'स': ['s'], 'ह': ['h'],
  // nukta forms
  'क़': ['k'], 'ख़': ['k'], 'ग़': ['g'], 'ज़': ['j'], 'ड़': ['r', 'd'], 'ढ़': ['rh', 'r', 'd'], 'फ़': ['f'], 'य़': ['y'],
};
const V = {
  a: ['a'], i: ['i', 'e', 'y'], u: ['u', 'o'], e: ['e', 'i', 'ei', 'ai', 'ay', 'ey'], ai: ['ai', 'ae', 'ay', 'ei', 'e', 'a'],
  o: ['o', 'u', 'au', 'ou'], au: ['au', 'ou', 'o', 'av'], ri: ['ri', 'ru', 'r'],
};
const SCHWA_FIRST = ['a', 'e', 'u'];
const SCHWA = ['a', 'e', 'u', 'o'];
const DEV_VOWEL = { 'अ': V.a, 'आ': V.a, 'इ': V.i, 'ई': V.i, 'उ': V.u, 'ऊ': V.u, 'ए': V.e, 'ऐ': V.ai, 'ओ': V.o, 'औ': V.au, 'ऋ': V.ri, 'ऑ': V.o };
const DEV_MATRA = { 'ा': V.a, 'ि': V.i, 'ी': V.i, 'ु': V.u, 'ू': V.u, 'े': V.e, 'ै': V.ai, 'ो': V.o, 'ौ': V.au, 'ृ': V.ri, 'ॉ': V.o };
const HALANT = '्';
export const hasDevanagari = (s) => /[\u0900-\u097f]/.test(s);

export function devanagariTokens(q) {
  const chars = [...String(q).normalize('NFC').replace(/ज्ञ/g, 'ग्य')];
  const tokens = [];
  let wordStart = true;
  for (let i = 0; i < chars.length; i++) {
    let c = chars[i];
    if (chars[i + 1] === '़') { c += '़'; i++; } // decomposed nukta
    if (DEV_CONS[c]) {
      const cons = DEV_CONS[c];
      const prev = tokens.at(-1);
      // A doubled consonant (पट्टी, उज्जैन) is a single letter in the key
      const dup = prev && !prev.opt && prev.alts.length === cons.length && prev.alts.every((x, k) => x === cons[k]);
      if (!dup) tokens.push({ alts: cons, opt: false, cons: true });
      const next = chars[i + 1];
      if (next === HALANT) { i++; continue; }
      if (DEV_MATRA[next]) { tokens.push({ alts: DEV_MATRA[next], opt: false }); i++; }
      else if (next !== '़') tokens.push({ alts: wordStart ? SCHWA_FIRST : SCHWA, opt: !wordStart });
      wordStart = false;
    } else if (DEV_VOWEL[c]) {
      tokens.push({ alts: DEV_VOWEL[c], opt: false }); wordStart = false;
    } else if (c === 'ं') tokens.push({ alts: ['n', 'm'], opt: true });
    else if (c === 'ँ') tokens.push({ alts: ['n'], opt: true });
    else if (c === 'ः') tokens.push({ alts: ['h'], opt: true });
    else if (/[\s\-,.]/.test(c)) wordStart = true;
    else if (/[a-z]/i.test(c)) { tokens.push({ alts: [placeKey(c) || c.toLowerCase()], opt: false }); wordStart = false; }
  }
  // Drop a trailing optional schwa: the user may still be typing
  while (tokens.length && tokens.at(-1).opt) tokens.pop();
  return tokens;
}

export function tokensToRegex(tokens) {
  return new RegExp(`^${tokens.map((t) => `(?:${t.alts.join('|')})${t.opt ? '?' : ''}`).join('')}`);
}

// Every distinct key prefix (up to 4 letters) the tokens can start with — used to pick index files
export function tokenPrefixes(tokens, depth = 4, cap = 96) {
  let states = new Set(['']);
  for (const t of tokens) {
    const next = new Set();
    for (const s of states) {
      if (s.length >= depth) { next.add(s); continue; }
      for (const a of t.opt ? ['', ...t.alts] : t.alts) next.add(placeKey(s + a).slice(0, depth));
    }
    states = next;
    if (states.size > cap) break;
    if ([...states].every((s) => s.length >= depth)) break;
  }
  return [...states].filter((s) => s.length >= 2);
}

// Common names whose usual English spelling isn't a transliteration of the Hindi
const HINDI_ALIASES = {
  'दिल्ली': 'Delhi', 'नई दिल्ली': 'New Delhi', 'नयी दिल्ली': 'New Delhi', 'गुड़गांव': 'Gurgaon', 'गुड़गाँव': 'Gurgaon',
  'मुंबई': 'Mumbai', 'बम्बई': 'Bombay', 'कोलकाता': 'Kolkata', 'कलकत्ता': 'Calcutta', 'चेन्नई': 'Chennai', 'मद्रास': 'Madras',
  'बेंगलुरु': 'Bengaluru', 'बंगलौर': 'Bangalore', 'बैंगलोर': 'Bangalore', 'त्रिवेंद्रम': 'Thiruvananthapuram', 'तिरुवनंतपुरम': 'Thiruvananthapuram',
  'प्रयागराज': 'Prayagraj', 'इलाहाबाद': 'Allahabad', 'बनारस': 'Varanasi', 'काशी': 'Varanasi', 'लखनऊ': 'Lucknow', 'ऋषिकेश': 'Rishikesh',
  'पुदुचेरी': 'Puducherry', 'पांडिचेरी': 'Pondicherry', 'मेरठ': 'Meerut', 'बरेली': 'Bareilly', 'अमृतसर': 'Amritsar', 'उदयपुर': 'Udaipur',
};

// Places outside India offered alongside (timezone differs from IST)
export const FOREIGN = [
  { name: 'Kathmandu', label: 'Kathmandu, Nepal', lat: 27.7172, lon: 85.324, tz: 5.75 },
  { name: 'Dubai', label: 'Dubai, UAE', lat: 25.2048, lon: 55.2708, tz: 4 },
  { name: 'Singapore', label: 'Singapore', lat: 1.3521, lon: 103.8198, tz: 8 },
  { name: 'London', label: 'London, UK (GMT)', lat: 51.5072, lon: -0.1276, tz: 0 },
  { name: 'New York', label: 'New York, USA (EST)', lat: 40.7128, lon: -74.006, tz: -5 },
];

let indexPromise = null;
export function loadIndex(fetchFn = fetch) {
  if (!indexPromise) {
    indexPromise = fetchFn(`${BASE}index.json`).then((r) => {
      if (!r.ok) throw new Error(`places index ${r.status}`);
      return r.json();
    }).then((idx) => ({ ...idx, splitSet: new Set(idx.split) }))
      .catch((e) => { indexPromise = null; throw e; });
  }
  return indexPromise;
}

const shardCache = new Map();
function loadShard(name, idx, fetchFn) {
  if (!shardCache.has(name)) {
    const p = fetchFn(`${BASE}${name}.tsv`).then((r) => (r.ok ? r.text() : '')).then((txt) => txt.split('\n')
      .filter(Boolean).map((line) => {
        const [n, lat, lon, d, pop, main] = line.split('\t');
        const [district, s] = idx.districts[Number(d)] || ['', -1];
        return { name: n, main: main || n, lat: Number(lat) / 100, lon: Number(lon) / 100, district, state: idx.states[s] || '', pop: Number(pop), keys: null };
      })).catch((e) => { shardCache.delete(name); throw e; });
    shardCache.set(name, p);
  }
  return shardCache.get(name);
}

// Which file holds words starting with `key`. Returns { file, needMore } where needMore means the
// prefix is too short to pick a single file (we then search only the words that end right there).
export function shardFor(key, splitSet) {
  let p = key.slice(0, 2);
  while (splitSet.has(p)) {
    if (key.length <= p.length) return { file: `${p}_`, needMore: true };
    p = key.slice(0, p.length + 1);
  }
  return { file: p, needMore: false };
}

export function labelOf(pl) {
  const name = pl.main || pl.name;
  const parts = [name];
  if (pl.district && placeKey(pl.district) !== placeKey(name)) parts.push(pl.district);
  if (pl.state) parts.push(pl.state);
  return parts.join(', ');
}

/**
 * Search places. Resolves to { results: [{ name, label, lat, lon, tz }], needMore }.
 * Ranking: whole-name prefix before later-word match, exact name first, then population.
 */
export async function searchPlaces(query, { limit = 25, fetchFn = fetch } = {}) {
  const q = String(query).trim().normalize('NFC');
  if (hasDevanagari(q)) {
    const alias = HINDI_ALIASES[q];
    const viaHindi = await searchHindi(q, { limit, fetchFn });
    if (!alias) return viaHindi;
    const viaAlias = await searchPlaces(alias, { limit, fetchFn });
    const seen = new Set(viaAlias.results.map((r) => r.label));
    return { ...viaHindi, results: [...viaAlias.results.slice(0, 3), ...viaHindi.results.filter((r) => !seen.has(r.label))].slice(0, limit) };
  }
  const key = placeKey(query);
  const foreign = key.length >= 2 ? FOREIGN.filter((f) => wordKeys(f.label).some((k) => k.startsWith(key))) : [];
  if (key.length < 2) return { results: [], needMore: true };
  const idx = await loadIndex(fetchFn);
  const { file, needMore } = shardFor(key, idx.splitSet);
  const rows = await loadShard(file, idx, fetchFn);
  const scored = [];
  for (const r of rows) {
    if (!r.keys) r.keys = wordKeys(r.name);
    let rank = -1;
    if (r.keys[0] === key) rank = 0;
    else if (r.keys[0].startsWith(key)) rank = 1;
    else if (r.keys.some((k) => k.startsWith(key))) rank = 2;
    if (rank >= 0) scored.push([rank, r]);
    if (scored.length > 4000) break;
  }
  return { results: [...foreign, ...collect(scored, limit)].slice(0, limit), needMore, total: idx.places };
}

function collect(scored, limit) {
  // Rows are pre-sorted by population within a file; rank, then population, decides across files
  scored.sort((a, b) => a[0] - b[0] || (b[1].pop > 0) - (a[1].pop > 0) || b[1].pop - a[1].pop);
  const seen = new Set();
  const results = [];
  for (const [, r] of scored) {
    const id = `${r.lat},${r.lon},${r.district},${r.state}`;
    const lbl = labelOf(r);
    if (seen.has(id) || seen.has(lbl)) continue;
    seen.add(id); seen.add(lbl);
    results.push({
      name: r.main, label: lbl, lat: r.lat, lon: r.lon, tz: 5.5,
      ...(placeKey(r.name) !== placeKey(r.main) ? { alias: r.name } : {}),
    });
    if (results.length >= limit) break;
  }
  return results;
}

async function searchHindi(q, { limit, fetchFn }) {
  const tokens = devanagariTokens(q);
  const consonants = tokens.filter((t) => t.cons).length;
  if (consonants < 2 && tokens.length < 3) return { results: [], needMore: true };
  const idx = await loadIndex(fetchFn);
  const re = tokensToRegex(tokens);
  const files = new Map();
  let needMore = false;
  for (const p of tokenPrefixes(tokens)) {
    const s = shardFor(p, idx.splitSet);
    needMore ||= s.needMore;
    files.set(s.file, true);
    if (files.size >= 10) break;
  }
  const scored = [];
  const shards = await Promise.all([...files.keys()].map((f) => loadShard(f, idx, fetchFn)));
  for (const rows of shards) {
    for (const r of rows) {
      if (!r.keys) r.keys = wordKeys(r.name);
      let rank = -1;
      const m = r.keys[0].match(re);
      if (m) rank = m[0].length === r.keys[0].length ? 0 : 1;
      else if (r.keys.some((k) => re.test(k))) rank = 2;
      if (rank >= 0) scored.push([rank, r]);
    }
  }
  return { results: collect(scored, limit), needMore, total: idx.places };
}
