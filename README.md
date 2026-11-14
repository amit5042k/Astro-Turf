# Astro Turf — Vedic astrology app

An installable web app (PWA) in the spirit of AstroSage, focused on **Lagna-wise (ascendant-wise) weekly rashifal**.
English and Hindi. No build step, no backend, works offline.

## Features
- **Lagna-wise weekly rashifal** (Mon–Sun, IST) for all 12 lagnas: overview, career, money, love & family,
  health (with star ratings), day-by-day guide, key planetary events (sign changes, retrograde/direct stations),
  lucky number / colour / day, and a remedy (upay). Browse past and future weeks.
- **Astrologer's weekly note**: enter a reference astrologer's lagna-wise weekly prediction in the **Editor**
  (or publish it as `data/weekly/<monday>.json`) and it appears alongside the calculated reading. See
  `data/weekly/README.md`.
- **Free Kundli**: Lagna, Moon sign, birth nakshatra, North-Indian lagna chart, planetary positions table.
  "Save as my Lagna" personalises the home screen.
- **Panchang**: tithi, nakshatra, yoga, karana, vara, sunrise/sunset and Rahu Kaal for Indian cities.

## How the weekly prediction is calculated
Planet positions are computed in the app (`js/astro.js`): Meeus series for Sun and Moon, JPL Keplerian elements
for Mars–Saturn, mean node for Rahu/Ketu, Lahiri ayanamsa. For each lagna, `js/predict.js` counts every planet's
house from the lagna sign (gochar from lagna), scores it with classical favourable-house rules weighted by planet
(Jupiter/Saturn heaviest), maps houses to life areas (e.g. career = 10, 6, 3, 11, 1), and the Moon's daily house
gives the day-by-day guide. Text comes from bilingual templates in `js/i18n.js`.

## Run
```bash
python3 -m http.server 8000   # then open http://localhost:8000
```
(ES modules need http://, not file://.) Deploy as-is to GitHub Pages, Netlify, etc.

## Test
```bash
node --test tests/astro.test.mjs
```
Checks ayanamsa, equinox, Makar Sankranti, the 12 Aug 2026 eclipse, 2026 slow-planet signs, ascendant = Sun at
sunrise, Delhi sunrise time, Purnima tithi, and that every lagna's weekly reading is complete in both languages.

Astrology content is for guidance/entertainment, not professional advice.
