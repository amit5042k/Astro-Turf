"""Build the searchable Indian places index (data/places/) from GeoNames.

Usage:
  curl -O https://download.geonames.org/export/dump/IN.zip && unzip IN.zip
  curl -O https://download.geonames.org/export/dump/admin1CodesASCII.txt
  curl -O https://download.geonames.org/export/dump/admin2Codes.txt
  mkdir alt && curl -o alt/IN.zip https://download.geonames.org/export/dump/alternatenames/IN.zip && unzip -d alt alt/IN.zip
  python3 tools/build_places.py <that dir> data/places

Output:
  index.json   {"states": [...], "districts": [[name, stateIdx], ...], "source": ...}
  <xx>.tsv     one place per line: name \t lat*100 \t lon*100 \t districtIdx \t population [\t main name]
               (the last column is present when `name` is an alternate spelling)
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

    def district_of(a1, a2):
        state = admin1.get(a1)
        if state is None:
            return None
        name = admin2.get(f'{a1}.{a2}', '')
        k = (name, state)
        if k not in district_idx:
            district_idx[k] = len(districts)
            districts.append([name, state_idx[state]])
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
        seen_keys = set()
        added = False
        for n in names:
            nk = place_key(n)
            if len(nk) < 2 or nk in seen_keys:
                continue
            seen_keys.add(nk)
            row = f'{n}\t{lat}\t{lon}\t{d}\t{pop}' + (f'\t{name}' if n != name else '')
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
        json.dump({'source': 'GeoNames (geonames.org), CC BY 4.0', 'places': places, 'split': split,
                   'states': states, 'districts': districts}, fh, ensure_ascii=False, separators=(',', ':'))
    print(f'{places} places, {total} index rows, {files} files ({len(split)} split), {len(districts)} districts')


if __name__ == '__main__':
    main(sys.argv[1], sys.argv[2])
