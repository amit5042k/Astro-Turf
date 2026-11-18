// Rule-based transliteration of Indian place names from Latin script to Devanagari.
// Used for places that have no Hindi name in Wikidata/GeoNames. GeoNames' diacritics
// (ā ī ū ṭ ḍ ṇ ṣ ś) are honoured when present; without them vowel length and retroflex
// consonants are guessed, so the result is a readable approximation.

const CONS = [
  ['chh', 'छ'], ['ch', 'च'], ['kh', 'ख'], ['gh', 'घ'], ['jh', 'झ'], ['ṭh', 'ठ'], ['ḍh', 'ढ'], ['th', 'थ'], ['dh', 'ध'],
  ['ph', 'फ'], ['bh', 'भ'], ['sh', 'श'], ['ṛh', 'ढ़'], ['ck', 'क'],
  ['k', 'क'], ['g', 'ग'], ['c', 'क'], ['j', 'ज'], ['ṭ', 'ट'], ['ḍ', 'ड'], ['t', 'त'], ['d', 'द'], ['ṇ', 'ण'], ['n', 'न'],
  ['ñ', 'ञ'], ['ṅ', 'ङ'], ['p', 'प'], ['f', 'फ़'], ['b', 'ब'], ['m', 'म'], ['y', 'य'], ['r', 'र'], ['ṛ', 'ड़'], ['l', 'ल'],
  ['v', 'व'], ['w', 'व'], ['s', 'स'], ['ś', 'श'], ['ṣ', 'ष'], ['h', 'ह'], ['z', 'ज़'], ['q', 'क़'], ['x', 'क्स'],
];
// [latin, independent letter, matra]
const VOW = [
  ['ai', 'ऐ', 'ै'], ['au', 'औ', 'ौ'], ['ou', 'औ', 'ौ'], ['ei', 'ए', 'े'], ['ā', 'आ', 'ा'], ['ī', 'ई', 'ी'], ['ū', 'ऊ', 'ू'],
  ['ē', 'ए', 'े'], ['ō', 'ओ', 'ो'], ['a', 'अ', ''], ['i', 'इ', 'ि'], ['u', 'उ', 'ु'], ['e', 'ए', 'े'], ['o', 'ओ', 'ो'],
];
const LABIAL_ETC = new Set(['प', 'फ', 'ब', 'भ', 'म', 'ह', 'ल', 'स', 'श']); // keep न before these (Kanpur → कनपुर)
const SEMI = new Set(['र', 'य', 'व']);
const V_CLUSTER = new Set(['द', 'स', 'त', 'ध', 'श', 'ज', 'क']); // द्व स्व त्व ध्व श्व ज्व क्व
const VOWEL_CHARS = /[aāiīuūeēoō]/;

// Common English or generic words in place names
const WORDS = {
  new: 'नई', old: 'पुराना', north: 'उत्तर', south: 'दक्षिण', east: 'पूर्व', west: 'पश्चिम', upper: 'ऊपरी', lower: 'निचला',
  colony: 'कॉलोनी', road: 'रोड', station: 'स्टेशन', town: 'टाउन', city: 'सिटी', camp: 'कैंप', cantonment: 'छावनी',
  junction: 'जंक्शन', jn: 'जं.', district: 'ज़िला', division: 'मंडल', bazar: 'बाज़ार', bazaar: 'बाज़ार', market: 'मार्केट',
  village: 'गाँव', khurd: 'खुर्द', kalan: 'कलाँ', and: 'और', port: 'पोर्ट', mount: 'माउंट', fort: 'फोर्ट', nagar: 'नगर',
  pur: 'पुर', ganj: 'गंज', garh: 'गढ़', abad: 'आबाद', sector: 'सेक्टर', no: 'नं.', mohalla: 'मोहल्ला', tola: 'टोला',
};

function prep(word) {
  let s = word.normalize('NFC').toLowerCase()
    .replace(/aa/g, 'ā').replace(/ee/g, 'ī').replace(/oo/g, 'ū');
  // Keep the diacritics we use; strip any others (é → e)
  s = [...s].map((ch) => (/[a-zāīūṭḍṇṣśñṅṛēō]/.test(ch) ? ch : ch.normalize('NFKD').replace(/[̀-ͯ]/g, ''))).join('');
  return s.replace(/[^a-zāīūṭḍṇṣśñṅṛēō]/g, '');
}

function tokenize(s) {
  const toks = [];
  let i = 0;
  while (i < s.length) {
    const prevC = toks.length && toks.at(-1).c;
    // "ri" between consonants is the vowel ऋ after a word-initial consonant or m (कृष्णनगर, अमृतसर);
    // elsewhere it is usually र + ि (Badrinath → बद्रीनाथ)
    if (prevC && s.startsWith('ri', i) && s[i + 2] && !VOWEL_CHARS.test(s[i + 2])
        && (toks.length === 1 || toks.at(-1).c === 'म')) {
      toks.push({ v: true, ind: 'ऋ', matra: 'ृ' }); i += 2; continue;
    }
    // "rh" after a vowel is ढ़ (Garh → गढ़); at the start it is र + ह
    if (i > 0 && s.startsWith('rh', i) && !prevC) { toks.push({ c: 'ढ़' }); i += 2; continue; }
    // Final "y" after a consonant is the vowel ī (Bareilly → बरेली)
    if (s[i] === 'y' && i === s.length - 1 && prevC) { toks.push({ v: true, ind: 'ई', matra: 'ी' }); i += 1; continue; }
    // Final "ai" after a consonant is written अ + ई (Mumbai → मुंबई, Chennai → चेन्नई)
    if (prevC && s.slice(i) === 'ai') { toks.push({ v: true, l: 'a', ind: 'अ', matra: '' }, { v: true, ind: 'ई', matra: 'ई' }); break; }
    // "ia" / "iya" at the end is िया (Araria → अररिया)
    if (prevC && /^iy?a$/.test(s.slice(i))) {
      toks.push({ v: true, l: 'i', ind: 'इ', matra: 'ि' }, { c: 'य' }, { v: true, l: 'ā', ind: 'आ', matra: 'ा' });
      break;
    }
    const v = VOW.find(([l]) => s.startsWith(l, i));
    if (v) { toks.push({ v: true, l: v[0], ind: v[1], matra: v[2] }); i += v[0].length; continue; }
    const c = CONS.find(([l]) => s.startsWith(l, i));
    if (c) { toks.push({ c: c[1] }); i += c[0].length; continue; }
    i += 1;
  }
  return toks;
}

// Is consonant `a` followed by `b` written as a conjunct? `before` is the token before `a`.
function conjunct(a, b, before) {
  if (b === 'य') return true; // ध्य, र्य
  if (b === 'व') return V_CLUSTER.has(a);
  if (b === 'र') return !before || before.c || ['द', 'त', 'ट', 'ड'].includes(a); // प्र… at the start, न्द्र, द्र/त्र
  return false;
}

// Common place-name endings, longest first; matched on the prepared (lower-case, ā-normalised) word
const SUFFIXES = [
  ['nagaram', 'नगरम'], ['puram', 'पुरम'], ['palle', 'पल्ले'], ['palli', 'पल्ली'], ['halli', 'हल्ली'], ['patti', 'पट्टी'],
  ['pettai', 'पेट्टई'], ['kuppam', 'कुप्पम'], ['nagar', 'नगर'], ['gaon', 'गाँव'], ['gāon', 'गाँव'], ['gānv', 'गाँव'],
  ['wādi', 'वाड़ी'], ['wadi', 'वाड़ी'], ['wāda', 'वाड़ा'], ['wada', 'वाड़ा'], ['wāla', 'वाला'], ['wala', 'वाला'], ['wāli', 'वाली'],
  ['wali', 'वाली'], ['ābād', 'आबाद'], ['abad', 'आबाद'], ['nāth', 'नाथ'], ['nath', 'नाथ'], ['rāj', 'राज'], ['raj', 'राज'],
  ['ghāt', 'घाट'], ['ghat', 'घाट'], ['garh', 'गढ़'], ['gaṛh', 'गढ़'], ['ganj', 'गंज'], ['gañj', 'गंज'], ['kot', 'कोट'],
  ['pura', 'पुरा'], ['pur', 'पुर'], ['bād', 'बाद'], ['ner', 'नेर'], ['sar', 'सर'],
];

const TO_MATRA = { 'आ': 'ा', 'इ': 'ि', 'ई': 'ी', 'उ': 'ु', 'ऊ': 'ू', 'ए': 'े', 'ओ': 'ो' };

// `wordEnd` is false when an ending follows, so a stem-final -a stays short (Chandra+pur → चंद्रपुर)
function translitCore(s, wordEnd = true) {
  const toks = tokenize(s);
  let out = '';
  for (let k = 0; k < toks.length; k++) {
    const t = toks[k];
    const prev = toks[k - 1];
    const last = k === toks.length - 1;
    if (t.c) {
      if (prev && prev.c) {
        const nAnusvara = (prev.c === 'न' || prev.c === 'ण') && !LABIAL_ETC.has(t.c);
        const mAnusvara = prev.c === 'म' && (t.c === 'ब' || t.c === 'भ'); // मुंबई, अंबाला
        if ((nAnusvara || mAnusvara) && !SEMI.has(t.c) && t.c !== prev.c && k > 1) {
          out = `${out.slice(0, -prev.c.length)}ं`; // n before a consonant → anusvara (Chandigarh → चंडीगढ़)
        } else if (t.c === prev.c || conjunct(prev.c, t.c, toks[k - 2])) {
          out += '्'; // doubled consonant or a cluster with r/y/v → conjunct (उज्जैन, प्रयाग, हरिद्वार)
        }
      }
      out += t.c;
    } else {
      // vowel
      if (prev && prev.c) {
        if (t.l === 'a' && last && wordEnd && toks.length > 2) out += 'ा'; // final -a is long (Patna → पटना)
        else if (t.l === 'i' && last) out += 'ी'; // final -i is long (Bareli → बरेली)
        else out += t.matra;
      } else out += t.ind;
    }
  }
  return out;
}

export function translitWord(word) {
  const lw = word.toLowerCase();
  if (WORDS[lw]) return WORDS[lw];
  const s = prep(word);
  for (const [suf, hi] of SUFFIXES) {
    if (s.length - suf.length >= 2 && s.endsWith(suf)) {
      const stem = s.slice(0, -suf.length);
      const head = translitCore(stem, false);
      // after a consonant a vowel-initial ending takes the matra: Ahmad + ābād → अहमदाबाद
      const stemEndsInConsonant = !VOWEL_CHARS.test(stem.at(-1));
      return head + (stemEndsInConsonant && TO_MATRA[hi[0]] ? TO_MATRA[hi[0]] + hi.slice(1) : hi);
    }
  }
  return translitCore(s);
}

const cache = new Map();
export function toHindi(text) {
  if (!text) return '';
  if (cache.has(text)) return cache.get(text);
  const out = String(text).split(/([\s\-/(),.]+)/).map((part, i) => (i % 2 ? part : translitWord(part))).join('');
  if (cache.size > 2000) cache.clear();
  cache.set(text, out);
  return out;
}
