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
        const [n, lat, lon, d, pop] = line.split('\t');
        const [district, s] = idx.districts[Number(d)] || ['', -1];
        return { name: n, lat: Number(lat) / 100, lon: Number(lon) / 100, district, state: idx.states[s] || '', pop: Number(pop), keys: null };
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
  const parts = [pl.name];
  if (pl.district && placeKey(pl.district) !== placeKey(pl.name)) parts.push(pl.district);
  if (pl.state) parts.push(pl.state);
  return parts.join(', ');
}

/**
 * Search places. Resolves to { results: [{ name, label, lat, lon, tz }], needMore }.
 * Ranking: whole-name prefix before later-word match, exact name first, then population.
 */
export async function searchPlaces(query, { limit = 25, fetchFn = fetch } = {}) {
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
  // Rows are pre-sorted by population, and Array.sort is stable
  scored.sort((a, b) => a[0] - b[0] || (b[1].pop > 0) - (a[1].pop > 0));
  const seen = new Set();
  const results = [];
  for (const [, r] of scored) {
    const id = `${r.lat},${r.lon},${r.district},${r.state}`;
    const lbl = labelOf(r);
    if (seen.has(id) || seen.has(lbl)) continue;
    seen.add(id); seen.add(lbl);
    results.push({ name: r.name, label: lbl, lat: r.lat, lon: r.lon, tz: 5.5 });
    if (results.length >= limit) break;
  }
  return { results: [...foreign, ...results].slice(0, limit), needMore, total: idx.places };
}
