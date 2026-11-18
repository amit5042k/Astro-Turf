"""Build the searchable Indian places index (data/places/) from GeoNames.

Usage:
  curl -O https://download.geonames.org/export/dump/IN.zip && unzip IN.zip
  curl -O https://download.geonames.org/export/dump/admin1CodesASCII.txt
  curl -O https://download.geonames.org/export/dump/admin2Codes.txt
  mkdir alt && curl -o alt/IN.zip https://download.geonames.org/export/dump/alternatenames/IN.zip && unzip -d alt alt/IN.zip
  # Optional Hindi names from Wikidata (https://query.wikidata.org/sparql, TSV):
  #   wd_hi.tsv     SELECT ?gn ?hi WHERE { ?item wdt:P1566 ?gn ; wdt:P17 wd:Q668 ; rdfs:label ?hi .
  #                 FILTER(LANG(?hi) = "hi") }
  #   wd_coord.tsv  SELECT ?item ?en ?hi ?c WHERE { ?item wdt:P17 wd:Q668 ; wdt:P625 ?c ; rdfs:label ?hi .
  #                 FILTER(LANG(?hi) = "hi") OPTIONAL { ?item rdfs:label ?en . FILTER(LANG(?en) = "en") } }
  python3 tools/build_places.py <that dir> data/places

Output:
  index.json   {"states": [...], "statesHi": [...], "districts": [[name, stateIdx, hindiName?], ...], "source": ...}
  <xx>.tsv     one place per line: name \t lat*100 \t lon*100 \t districtIdx \t population [\t main name [\t Hindi name]]
               (main name is empty when `name` is the main name; trailing empty columns are omitted).
               The Hindi name comes from Wikidata (matched by GeoNames ID, or by name within 5 km) or
               GeoNames; places without one are transliterated in the browser (js/hindi.js).
               where <xx> is the first two letters of the phonetic search key (see placeKey in js/places.js).
               Large shards are split by the next letter, up to 4 letters (<xxy>.tsv, <xxyz>.tsv); index.json lists
               every split prefix under "split". A word that ends at a split prefix lands in <prefix>_.tsv.
               A place is listed in the shard of every word it contains, so "Bodh Gaya" is found by "gaya".
               Alternate spellings (English or untagged in GeoNames, including historic names such as
               Bombay) are listed as extra rows pointing at the same place.

Data: GeoNames (https://www.geonames.org), CC BY 4.0.
"""
import csv
import json
import os
import re
import sys
import unicodedata
from collections import defaultdict

SPLIT_BYTES = 200_000
SKIP_CODES = {'PPLQ', 'PPLH', 'PPLW', 'PPLCH'}  # abandoned, historical, destroyed
REPL = [('ph', 'f'), ('kh', 'k'), ('gh', 'g'), ('chh', 'c'), ('ch', 'c'), ('jh', 'j'), ('th', 't'), ('dh', 'd'),
        ('bh', 'b'), ('sh', 's'), ('ee', 'i'), ('oo', 'u'), ('w', 'v'), ('z', 'j'), ('q', 'k')]


def ascii_fold(s):
    return unicodedata.normalize('NFKD', s).encode('ascii', 'ignore').decode()


def place_key(s):
    """Phonetic key; must match placeKey() in js/places.js."""
    k = re.sub(r'[^a-z]', '', ascii_fold(s).lower())
    for a, b in REPL:
        k = k.replace(a, b)
    return re.sub(r'(.)\1+', r'\1', k)


def word_keys(name):
    """Keys of every word-start suffix: 'Bodh Gaya' -> ['bodgaya', 'gaya']."""
    words = re.split(r'[\s\-/(),.]+', name)
    return [k for k in (place_key(' '.join(words[i:])) for i in range(len(words))) if len(k) >= 2]


STATES_HI = {
    'Andaman and Nicobar': 'अंडमान और निकोबार', 'Andhra Pradesh': 'आंध्र प्रदेश', 'Arunachal Pradesh': 'अरुणाचल प्रदेश',
    'Assam': 'असम', 'Bihar': 'बिहार', 'Chandigarh': 'चंडीगढ़', 'Chhattisgarh': 'छत्तीसगढ़',
    'Dadra and Nagar Haveli and Daman and Diu': 'दादरा और नगर हवेली और दमन और दीव', 'Delhi': 'दिल्ली', 'Goa': 'गोवा',
    'Gujarat': 'गुजरात', 'Haryana': 'हरियाणा', 'Himachal Pradesh': 'हिमाचल प्रदेश', 'Jammu and Kashmir': 'जम्मू और कश्मीर',
    'Jharkhand': 'झारखंड', 'Karnataka': 'कर्नाटक', 'Kerala': 'केरल', 'Ladakh': 'लद्दाख', 'Lakshadweep': 'लक्षद्वीप',
    'Madhya Pradesh': 'मध्य प्रदेश', 'Maharashtra': 'महाराष्ट्र', 'Manipur': 'मणिपुर', 'Meghalaya': 'मेघालय', 'Mizoram': 'मिज़ोरम',
    'Nagaland': 'नागालैंड', 'Odisha': 'ओडिशा', 'Puducherry': 'पुदुचेरी', 'Punjab': 'पंजाब', 'Rajasthan': 'राजस्थान',
    'Sikkim': 'सिक्किम', 'Tamil Nadu': 'तमिलनाडु', 'Telangana': 'तेलंगाना', 'Tripura': 'त्रिपुरा', 'Uttar Pradesh': 'उत्तर प्रदेश',
    'Uttarakhand': 'उत्तराखंड', 'West Bengal': 'पश्चिम बंगाल',
}
DEVANAGARI = re.compile(r'^[\u0900-\u097f\s\-.]+$')


# Labels of things that share a place's name and location but are not the settlement itself
NOT_A_PLACE = re.compile(r'निर्वाचन|क्षेत्र|नदी|मंदिर|मन्दिर|किला|क़िला|दुर्ग|झील|पर्वत|पहाड़|स्टेशन|हवाई|विश्वविद्यालय|'
                         r'विद्यालय|महाविद्यालय|अस्पताल|बाँध|बांध|मस्जिद|गुरुद्वारा|गिरजाघर|चर्च|युद्ध|पुल|उद्यान|अभयारण्य|'
                         r'जलप्रपात|प्रपात|गुफा|मठ|स्तूप|मकबरा|महल|संग्रहालय|बंदरगाह|विधानसभा|लोकसभा|रियासत|राज्य$')
# Generic words Wikidata appends to a settlement's name
TRAILING = re.compile(r'(\s+(गाँव|गांव|ग्राम|कस्बा|क़स्बा|शहर|नगर पंचायत|नगर पालिका|नगरपालिका|तहसील|प्रखंड|प्रखण्ड|ब्लॉक|'
                      + '|'.join(sorted(STATES_HI.values(), key=len, reverse=True)) + r'))+$')


def clean_hi(h):
    """Wikidata label -> bare place name: drop qualifiers, generic trailing words and non-settlements."""
    h = re.split(r'[,(（]', h)[0].strip()
    if NOT_A_PLACE.search(h):
        return ''
    h = TRAILING.sub('', h).strip()
    return h if DEVANAGARI.match(h) and len(h) >= 2 else ''


def district_key(name):
    return place_key(re.sub(r'\b(district|division|zila|zilla|jila)\b', '', name, flags=re.I))


def load_hindi(src):
    """Returns (by_geonames_id, by_name_key -> [(lat, lon, hi)], district_key -> hi)."""
    by_id, by_key, dist = {}, defaultdict(list), {}
    p = os.path.join(src, 'wd_hi.tsv')
    if os.path.exists(p):
        for line in open(p, encoding='utf-8').read().splitlines()[1:]:
            g, h = line.split('\t')
            h = clean_hi(h.rsplit('@', 1)[0].strip('"'))
            if h:
                by_id[g.strip('"')] = h
    p = os.path.join(src, 'alt', 'IN.txt')
    if os.path.exists(p):
        for line in open(p, encoding='utf-8'):
            f = line.split('\t')
            if f[2] == 'hi' and clean_hi(f[3]):
                by_id.setdefault(f[1], clean_hi(f[3]))
    p = os.path.join(src, 'wd_coord.tsv')
    if os.path.exists(p):
        for line in open(p, encoding='utf-8').read().splitlines()[1:]:
            f = line.split('\t')
            if len(f) < 4 or not f[1]:
                continue
            en = f[1].rsplit('@', 1)[0].strip('"')
            hi = clean_hi(f[2].rsplit('@', 1)[0].strip('"'))
            m = re.search(r'Point\(([-\d.]+) ([-\d.]+)\)', f[3])
            if not hi or not m:
                continue
            if re.search(r'\bdistrict\b', en, re.I):
                dist.setdefault(district_key(en), re.sub(r'\s*(ज़िला|जिला|जनपद|ज़िले)$', '', hi).strip())
                continue
            by_key[place_key(re.split(r'[,(]', en)[0])].append((float(m.group(2)), float(m.group(1)), hi))
    return by_id, by_key, dist


def main(src, out):
    csv.field_size_limit(10 ** 9)
    admin1 = {}
    for line in open(os.path.join(src, 'admin1CodesASCII.txt'), encoding='utf-8'):
        code, name, *_ = line.rstrip('\n').split('\t')
        if code.startswith('IN.'):
            admin1[code[3:]] = name
    admin2 = {}
    for line in open(os.path.join(src, 'admin2Codes.txt'), encoding='utf-8'):
        code, name, *_ = line.rstrip('\n').split('\t')
        if code.startswith('IN.'):
            admin2[code[3:]] = name

    alts = defaultdict(list)
    alt_path = os.path.join(src, 'alt', 'IN.txt')
    if os.path.exists(alt_path):
        for line in open(alt_path, encoding='utf-8'):
            f = line.rstrip('\n').split('\t')
            if f[2] in ('', 'en') and 2 <= len(f[3]) <= 40 and all(ord(ch) < 0x250 for ch in f[3]) \
                    and not re.search(r'\d|https?:|[@_]', f[3]):
                alts[f[1]].append(f[3])

    states = sorted(set(admin1.values()))
    state_idx = {s: i for i, s in enumerate(states)}
    districts, district_idx = [], {}
    hi_by_id, hi_by_key, hi_dist = load_hindi(src)
    hi_stats = defaultdict(int)

    def hindi_for(r, keys):
        if r[0] in hi_by_id:
            hi_stats['geonames id'] += 1
            return hi_by_id[r[0]]
        lat, lon = float(r[4]), float(r[5])
        for k in keys:
            for wlat, wlon, hi in hi_by_key.get(k, ()):
                if abs(wlat - lat) < 0.045 and abs(wlon - lon) < 0.05:  # ~5 km
                    hi_stats['name + location'] += 1
                    return hi
        return ''

    def district_of(a1, a2):
        state = admin1.get(a1)
        if state is None:
            return None
        name = admin2.get(f'{a1}.{a2}', '')
        k = (name, state)
        if k not in district_idx:
            district_idx[k] = len(districts)
            hi = hi_dist.get(district_key(name), '') if name else ''
            districts.append([name, state_idx[state], hi] if hi else [name, state_idx[state]])
            hi_stats['districts with Hindi'] += bool(hi)
        return district_idx[k]

    shards = defaultdict(dict)  # shard -> {(name_key, lat, lon): row}
    places = 0
    reader = csv.reader(open(os.path.join(src, 'IN.txt'), encoding='utf-8'), delimiter='\t', quoting=csv.QUOTE_NONE)
    for r in reader:
        if r[6] != 'P' or r[7] in SKIP_CODES:
            continue
        d = district_of(r[10], r[11])
        if d is None:
            continue
        lat, lon = round(float(r[4]) * 100), round(float(r[5]) * 100)
        pop = int(r[14] or 0)
        name = r[1].strip()
        names = [name, r[2], *alts.get(r[0], [])]
        hi = hindi_for(r, {place_key(n) for n in names})
        seen_keys = set()
        added = False
        for n in names:
            nk = place_key(n)
            if len(nk) < 2 or nk in seen_keys:
                continue
            seen_keys.add(nk)
            row = f'{n}\t{lat}\t{lon}\t{d}\t{pop}\t{name if n != name else ""}\t{hi}'.rstrip('\t')
            for wk in set(word_keys(n)):
                key = (nk, lat // 2, lon // 2)  # same name within ~2 km counts as a duplicate
                bucket = shards[wk[:2]]
                if key not in bucket or pop > int(bucket[key].split('\t')[4]):
                    bucket[key] = row
                added = True
        places += added

    os.makedirs(out, exist_ok=True)
    for f in os.listdir(out):
        if f.endswith('.tsv'):
            os.remove(os.path.join(out, f))
    total = 0
    split = []
    files = 0

    def write(name, rows):
        nonlocal files
        lines = sorted(rows, key=lambda x: -int(x.split('\t')[4]))
        with open(os.path.join(out, f'{name}.tsv'), 'w', encoding='utf-8') as fh:
            fh.write('\n'.join(lines) + '\n')
        files += 1

    def emit(prefix, rows):
        """Write rows (whose matching word keys start with `prefix`) or split by the next letter."""
        if len(prefix) >= 4 or sum(len(x.encode()) + 1 for x in rows) <= SPLIT_BYTES:
            write(prefix, rows)
            return
        split.append(prefix)
        sub = defaultdict(list)
        n = len(prefix)
        for row in rows:
            name = row.split('\t', 1)[0]
            nxt = {wk[n] if len(wk) > n else '_' for wk in word_keys(name) if wk.startswith(prefix)}
            for c in nxt:
                sub[prefix + c].append(row)
        for c, sub_rows in sub.items():
            if c.endswith('_'):
                write(c, sub_rows)
            else:
                emit(c, sub_rows)

    for shard, rows in sorted(shards.items()):
        total += len(rows)
        emit(shard, list(rows.values()))

    with open(os.path.join(out, 'index.json'), 'w', encoding='utf-8') as fh:
        json.dump({'source': 'GeoNames (geonames.org), CC BY 4.0; Hindi names: Wikidata (CC0)', 'places': places, 'split': split,
               'statesHi': [STATES_HI.get(s, '') for s in states],
                   'states': states, 'districts': districts}, fh, ensure_ascii=False, separators=(',', ':'))
    print('Hindi names:', dict(hi_stats))
    print(f'{places} places, {total} index rows, {files} files ({len(split)} split), {len(districts)} districts')


if __name__ == '__main__':
    main(sys.argv[1], sys.argv[2])
