# Astro Turf — Vedic astrology app

An installable web app (PWA) in the spirit of AstroSage, focused on **Lagna-wise (ascendant-wise) weekly rashifal**.
English and Hindi. No build step, no backend, works offline.

## Features
- **Lagna-wise weekly rashifal** (Mon–Sun, IST) for all 12 lagnas: overview, career, money, love & family,
  health (with star ratings), day-by-day guide, key planetary events (sign changes, retrograde/direct stations),
  lucky number / colour / day, and a remedy (upay). Browse past and future weeks.
- **Lagna-based reading the way weekly lagna videos do it**: every planet is described by the houses it *rules* for
  your lagna and the house it *transits* ("Venus, lord of your 2nd & 7th, sits in your 6th"); each life area follows
  its key house lord (10th = career, 2nd = money, 7th = marriage, 1st = health); Jupiter, Saturn and Mars aspects
  (drishti) on those houses; a **Moon timeline** with the exact IST minute the Moon changes house; and a
  **do's & don'ts** list.
- **Astrologer's weekly note**: enter a reference astrologer's lagna-wise weekly prediction in the **Editor**
  (or publish it as `data/weekly/<monday>.json`) and it appears alongside the calculated reading. See
  `data/weekly/README.md`.
- **Every Indian city, town and village** (549,000+ places from GeoNames) in a searchable birth-place field that
  tolerates spelling variants (Darjeeling/Darjiling, Nainital/Naini Tal) and old names (Bombay, Allahabad, Gurgaon).
  Names can be typed **in Hindi** too (वाराणसी, कानपुर, नई दिल्ली): Devanagari is transliterated into the same
  phonetic key, with Hindi's silent inherent "a" treated as optional, so every place is searchable either way.
  The list is split into ~1,100 small files by the first letters typed, so a search downloads only 20–200 KB.
  Rebuild with `tools/build_places.py` (instructions at the top of the script), then bump `PLACES` in `sw.js`.
- **Free Kundli**: Lagna, Moon sign, birth nakshatra, North-Indian lagna chart, planetary positions table.
  "Save as my Lagna" personalises the home screen.
- **Panchang**: tithi, nakshatra, yoga, karana, vara, sunrise/sunset and Rahu Kaal for Indian cities.

## How the weekly prediction is calculated
Planet positions are computed in the app (`js/astro.js`): Meeus series for Sun and Moon, JPL Keplerian elements
for Mars–Saturn, mean node for Rahu/Ketu, Lahiri ayanamsa. For each lagna, `js/predict.js` counts every planet's
house from the lagna sign (gochar from lagna), scores it with classical favourable-house rules weighted by planet
(Jupiter/Saturn heaviest), maps houses to life areas (e.g. career = 10, 6, 3, 11, 1), and the Moon's daily house
gives the day-by-day guide. House lordship comes from the sign lords counted from the lagna, aspects use the
classical special aspects (Mars 4/7/8, Jupiter 5/7/9, Saturn 3/7/10, others 7), and Moon sign changes are found by
bisection to the minute. Text comes from bilingual templates in `js/i18n.js`.

## Run
```bash
python3 -m http.server 8000   # then open http://localhost:8000
```
(ES modules need http://, not file://.) Deploy as-is to GitHub Pages, Netlify, etc.

## Test
```bash
node --test tests/*.mjs
```
Checks ayanamsa, equinox, Makar Sankranti, the 12 Aug 2026 eclipse, 2026 slow-planet signs, ascendant = Sun at
sunrise, Delhi sunrise time, Purnima tithi, and that every lagna's weekly reading is complete in both languages.

Place data © GeoNames (geonames.org), CC BY 4.0.

Astrology content is for guidance/entertainment, not professional advice.
