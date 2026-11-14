import {
  birthChart, localToDate, formatDeg, panchang, julianDay, siderealLongitude, signOf, sunriseSunset,
} from './astro.js';
import { weeklyForLagna, weekStart, isoDate } from './predict.js';
import {
  UI, SIGNS, SIGN_SHORT, SIGN_GLYPHS, PLANET_NAMES, PLANET_ABBR, NAKSHATRAS, WEEKDAYS, WEEKDAYS_SHORT,
  YOGAS, KARANAS, tithiName,
} from './i18n.js';

// ---------- state & helpers ----------
const store = {
  get(k, d = null) { try { const v = localStorage.getItem(`astroturf.${k}`); return v === null ? d : JSON.parse(v); } catch { return d; } },
  set(k, v) { try { localStorage.setItem(`astroturf.${k}`, JSON.stringify(v)); } catch { /* storage unavailable */ } },
  del(k) { try { localStorage.removeItem(`astroturf.${k}`); } catch { /* ignore */ } },
};
let lang = store.get('lang', (navigator.language || '').startsWith('hi') ? 'hi' : 'en');
const t = (k) => UI[lang][k] ?? UI.en[k] ?? k;
const $ = (sel, root = document) => root.querySelector(sel);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const stars = (n) => `<span class="stars" aria-label="${n}/5">${'★'.repeat(n)}${'☆'.repeat(5 - n)}</span>`;
const LAGNA_KEYS = SIGN_SHORT.en.map((s) => s.toLowerCase());
const locale = () => (lang === 'hi' ? 'hi-IN' : 'en-IN');
const fmtDay = (d, opts = { day: 'numeric', month: 'short' }) => d.toLocaleDateString(locale(), { ...opts, timeZone: 'UTC' });
const fmtTime = (d, tz) => (d ? new Date(d.getTime() + tz * 3600000).toLocaleTimeString(locale(), { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' }) : '—');
const addDays = (d, n) => new Date(d.getTime() + n * 86400000);

function toast(msg) {
  const el = document.createElement('div');
  el.className = 'toast'; el.role = 'status'; el.textContent = msg;
  document.body.append(el);
  setTimeout(() => el.remove(), 2200);
}

export const CITIES = [
  ['New Delhi', 28.6139, 77.209, 5.5], ['Mumbai', 19.076, 72.8777, 5.5], ['Kolkata', 22.5726, 88.3639, 5.5],
  ['Chennai', 13.0827, 80.2707, 5.5], ['Bengaluru', 12.9716, 77.5946, 5.5], ['Hyderabad', 17.385, 78.4867, 5.5],
  ['Ahmedabad', 23.0225, 72.5714, 5.5], ['Pune', 18.5204, 73.8567, 5.5], ['Jaipur', 26.9124, 75.7873, 5.5],
  ['Lucknow', 26.8467, 80.9462, 5.5], ['Kanpur', 26.4499, 80.3319, 5.5], ['Patna', 25.5941, 85.1376, 5.5],
  ['Varanasi', 25.3176, 82.9739, 5.5], ['Bhopal', 23.2599, 77.4126, 5.5], ['Indore', 22.7196, 75.8577, 5.5],
  ['Nagpur', 21.1458, 79.0882, 5.5], ['Chandigarh', 30.7333, 76.7794, 5.5], ['Dehradun', 30.3165, 78.0322, 5.5],
  ['Amritsar', 31.634, 74.8723, 5.5], ['Surat', 21.1702, 72.8311, 5.5], ['Guwahati', 26.1445, 91.7362, 5.5],
  ['Bhubaneswar', 20.2961, 85.8245, 5.5], ['Ranchi', 23.3441, 85.3096, 5.5], ['Raipur', 21.2514, 81.6296, 5.5],
  ['Thiruvananthapuram', 8.5241, 76.9366, 5.5], ['Kathmandu', 27.7172, 85.324, 5.75], ['Dubai', 25.2048, 55.2708, 4],
  ['Singapore', 1.3521, 103.8198, 8],
];

function cityOptions(selected) {
  return CITIES.map(([n], i) => `<option value="${i}" ${i === selected ? 'selected' : ''}>${n}</option>`).join('')
    + `<option value="custom" ${selected === 'custom' ? 'selected' : ''}>${t('custom')}</option>`;
}

// ---------- astrologer notes (reference weekly predictions) ----------
const remoteNotes = new Map();
async function loadNotes(ws) {
  const key = isoDate(ws);
  if (!remoteNotes.has(key)) {
    let data = null;
    try {
      const r = await fetch(`data/weekly/${key}.json`, { cache: 'no-cache' });
      if (r.ok) data = await r.json();
    } catch { /* offline or missing */ }
    remoteNotes.set(key, data);
  }
  const remote = remoteNotes.get(key) || { lagnas: {} };
  const local = store.get(`notes.${key}`, { lagnas: {} });
  return { source: local.source || remote.source || '', lagnas: { ...remote.lagnas, ...local.lagnas } };
}

// ---------- views ----------
function lagnaGrid(ws, current, hrefFor) {
  const mine = store.get('myLagna');
  return `<div class="lagna-grid">${SIGN_SHORT[lang].map((name, i) => {
    const w = weeklyForLagna(i, ws, lang);
    return `<a class="lagna-btn" href="${hrefFor(i)}" ${i === current ? 'aria-current="true"' : ''}>
      <span class="glyph" aria-hidden="true">${SIGN_GLYPHS[i]}</span><span class="nm">${esc(name)}</span>
      <span class="st">${'★'.repeat(w.overallStars)}${'☆'.repeat(5 - w.overallStars)}</span>
      ${i === mine ? `<span class="mine">${t('myLagna')}</span>` : ''}</a>`;
  }).join('')}</div>`;
}

function viewHome() {
  const ws = weekStart();
  const mine = store.get('myLagna');
  const city = CITIES[0];
  const p = panchang(new Date(), city[1], city[2], city[3]);
  const mineCard = mine !== null ? (() => {
    const w = weeklyForLagna(mine, ws, lang);
    return `<section class="card"><div class="row spread"><h2>${t('myLagna')}: ${SIGN_GLYPHS[mine]} ${esc(SIGNS[lang][mine])}</h2>${stars(w.overallStars)}</div>
      <p>${esc(w.overview.split(/(?<=[.।])\s/).slice(0, 2).join(' '))}</p>
      <a class="btn" href="#/weekly/${mine}">${t('open')} →</a></section>`;
  })() : '';
  return `
    <section class="card hero">
      <h1>${t('weeklyTitle')}</h1>
      <p>${fmtDay(ws, { day: 'numeric', month: 'long' })} – ${fmtDay(addDays(ws, 6), { day: 'numeric', month: 'long', year: 'numeric' })}</p>
      <div class="row"><a class="btn" href="#/weekly${mine !== null ? `/${mine}` : ''}">${t('navWeekly')} →</a>
      <a class="btn secondary" href="#/kundli">${t('findLagna')}</a></div>
    </section>
    ${mineCard}
    <section class="card"><h2>${t('quickWeekly')}</h2>${lagnaGrid(ws, mine, (i) => `#/weekly/${i}`)}</section>
    <section class="card"><div class="row spread"><h2>${t('panchangToday')}</h2><span class="muted small">${city[0]}</span></div>
      <dl class="kv">
        <div><dt>${t('vara')}</dt><dd>${WEEKDAYS[lang][p.weekday]}</dd></div>
        <div><dt>${t('tithi')}</dt><dd>${tithiName(p.tithi, lang)}</dd></div>
        <div><dt>${t('nakshatra')}</dt><dd>${NAKSHATRAS[lang][p.nakshatra]}</dd></div>
        <div><dt>${t('rahuKaal')}</dt><dd>${p.rahuKaal ? `${fmtTime(p.rahuKaal.start, city[3])} – ${fmtTime(p.rahuKaal.end, city[3])}` : '—'}</dd></div>
      </dl>
      <p style="margin-top:12px"><a href="#/panchang">${t('navPanchang')} →</a></p>
    </section>`;
}

async function viewWeekly(params) {
  const mine = store.get('myLagna');
  const lagna = params[0] !== undefined && params[0] !== '' ? Number(params[0]) : (mine ?? 0);
  const ws = params[1] ? weekStart(new Date(`${params[1]}T06:00:00Z`)) : weekStart();
  const w = weeklyForLagna(lagna, ws, lang);
  const notes = await loadNotes(ws);
  const note = notes.lagnas[LAGNA_KEYS[lagna]];
  const noteText = note ? (note[lang] || note.en || note.hi) : '';
  const href = (l, d = ws) => `#/weekly/${l}/${isoDate(d)}`;
  const P = PLANET_NAMES[lang];
  const area = (k) => `<div class="area l${w.areas[k].level}"><div class="area-head"><h3>${t(k)}</h3>${stars(w.areas[k].stars)}</div>
    <p>${esc(w.areas[k].text)}</p></div>`;

  return `
    <h1>${t('weeklyTitle')}</h1>
    <div class="card weeknav">
      <a class="btn secondary" href="${href(lagna, addDays(ws, -7))}">${t('prevWeek')}</a>
      <span class="range">${fmtDay(ws)} – ${fmtDay(addDays(ws, 6), { day: 'numeric', month: 'short', year: 'numeric' })}</span>
      <a class="btn secondary" href="${href(lagna, addDays(ws, 7))}">${t('nextWeek')}</a>
    </div>
    <section class="card"><h2>${t('chooseLagna')}</h2>${lagnaGrid(ws, lagna, (i) => href(i))}
      <p class="small" style="margin-top:10px"><a href="#/kundli">${t('dontKnow')}</a></p></section>

    <article class="card">
      <div class="row spread"><h2>${SIGN_GLYPHS[lagna]} ${esc(SIGNS[lang][lagna])} — ${t('overview')}</h2>${stars(w.overallStars)}</div>
      <p class="muted small">${t('calculated')}</p>
      <p>${esc(w.overview)}</p>
      <button class="chip" id="save-lagna" type="button">${mine === lagna ? `✓ ${t('saved')}` : t('setMyLagna')}</button>
    </article>

    ${noteText ? `<section class="card"><h2>${t('astroNote')}</h2><div class="note">${esc(noteText)}</div>
      ${notes.source ? `<p class="small muted" style="margin-top:8px">${t('astroNoteSrc')}: ${esc(notes.source)}</p>` : ''}</section>` : ''}

    <section class="card">${area('career')}${area('finance')}${area('love')}${area('health')}</section>

    <div class="grid grid-2">
      <section class="card"><h2>${t('lucky')}</h2>
        <dl class="kv">
          <div><dt>${t('luckyNumber')}</dt><dd>${w.luckyNumber}</dd></div>
          <div><dt>${t('luckyColour')}</dt><dd>${esc(w.luckyColour)}</dd></div>
          <div><dt>${t('luckyDay')}</dt><dd>${WEEKDAYS[lang][w.luckyDay.weekday]}</dd></div>
        </dl>
        <h3 style="margin-top:14px">${t('remedy')} · ${P[w.remedyPlanet]}</h3><p>${esc(w.remedy)}</p>
      </section>
      <section class="card"><h2>${t('events')}</h2>
        ${w.events.length ? `<ul class="clean">${w.events.map((e) => `<li>${esc(e)}</li>`).join('')}</ul>` : `<p class="muted">${t('none')}</p>`}
      </section>
    </div>

    <section class="card"><h2>${t('dayByDay')}</h2><div class="days">${w.days.map((d) => `
      <div class="day ${d.kind}"><b>${WEEKDAYS_SHORT[lang][d.weekday]} ${fmtDay(d.date, { day: 'numeric' })}</b>
      <span class="small muted">${t('moonHouse')} ${d.house} · ${esc(SIGN_SHORT[lang][d.moonSign])}</span><br>
      <span class="badge ${d.kind}">${esc(d.note)}</span></div>`).join('')}</div></section>

    <section class="card"><h2>${t('transits')}</h2><div class="table-wrap"><table>
      <thead><tr><th>${t('planet')}</th><th>${t('sign')}</th><th>${t('house')}</th><th></th></tr></thead>
      <tbody>${w.transits.map((tr) => `<tr><td>${P[tr.planet]}${tr.retro ? ` (${t('retro')})` : ''}</td>
        <td>${esc(SIGN_SHORT[lang][tr.sign])}</td><td>${tr.house}</td>
        <td class="${tr.good ? 'good' : 'caution'}">${tr.good ? t('good') : t('caution')}</td></tr>`).join('')}</tbody>
    </table></div></section>`;
}

function bindWeekly(params) {
  const btn = $('#save-lagna');
  if (!btn) return;
  btn.onclick = () => {
    const mine = store.get('myLagna');
    const lagna = params[0] !== undefined && params[0] !== '' ? Number(params[0]) : (mine ?? 0);
    store.set('myLagna', lagna);
    btn.textContent = `✓ ${t('saved')}`;
  };
}

function northChart(chart) {
  // House centres for a 400×400 North Indian chart; house 1 is the top diamond.
  const C = [[200, 110], [100, 45], [45, 100], [110, 200], [45, 300], [100, 355], [200, 290], [300, 355], [355, 300], [290, 200], [355, 100], [300, 45]];
  const byHouse = Array.from({ length: 12 }, () => []);
  for (const p of chart.planets) byHouse[p.house - 1].push(`${PLANET_ABBR[lang][p.name]}${p.retro && p.name !== 'Rahu' && p.name !== 'Ketu' ? '℞' : ''}`);
  const cells = C.map(([x, y], h) => {
    const sign = ((chart.lagna + h) % 12) + 1;
    const pl = byHouse[h];
    const lines = [];
    for (let i = 0; i < pl.length; i += 3) lines.push(pl.slice(i, i + 3).join(' '));
    return `<text class="sn" x="${x}" y="${y - 14}" text-anchor="middle">${sign}</text>
      ${h === 0 ? `<text class="asc" x="${x}" y="${y - 30}" text-anchor="middle">${lang === 'hi' ? 'लग्न' : 'Asc'}</text>` : ''}
      ${lines.map((l, i) => `<text class="pl" x="${x}" y="${y + 4 + i * 15}" text-anchor="middle">${l}</text>`).join('')}`;
  }).join('');
  return `<svg class="chart" viewBox="0 0 400 400" role="img" aria-label="${t('lagnaChart')}">
    <rect x="1" y="1" width="398" height="398"/><line x1="0" y1="0" x2="400" y2="400"/><line x1="400" y1="0" x2="0" y2="400"/>
    <line x1="200" y1="0" x2="0" y2="200"/><line x1="0" y1="200" x2="200" y2="400"/><line x1="200" y1="400" x2="400" y2="200"/><line x1="400" y1="200" x2="200" y2="0"/>
    ${cells}</svg>`;
}

function viewKundli() {
  const last = store.get('birth', { name: '', date: '1990-01-01', time: '06:00', city: 0, lat: '', lon: '', tz: 5.5 });
  return `<h1>${t('kundliTitle')}</h1>
    <form class="card" id="kundli-form">
      <div class="fields">
        <label>${t('name')}<input name="name" value="${esc(last.name)}" autocomplete="name"></label>
        <label>${t('place')}<select name="city">${cityOptions(last.city)}</select></label>
        <label>${t('dob')}<input type="date" name="date" value="${esc(last.date)}" required></label>
        <label>${t('tob')}<input type="time" name="time" value="${esc(last.time)}" required></label>
        <div class="span-2 fields" id="custom-loc" ${last.city === 'custom' ? '' : 'hidden'}>
          <label>${t('lat')}<input type="number" step="any" name="lat" value="${esc(last.lat)}" placeholder="28.61"></label>
          <label>${t('lon')}<input type="number" step="any" name="lon" value="${esc(last.lon)}" placeholder="77.21"></label>
          <label>${t('tz')}<input type="number" step="0.25" name="tz" value="${esc(last.tz)}"></label>
        </div>
      </div>
      <p style="margin-top:14px"><button class="btn" type="submit">${t('generate')}</button></p>
    </form>
    <div id="kundli-out"></div>`;
}

function renderKundli(b) {
  const [y, m, d] = b.date.split('-').map(Number);
  const [hh, mm] = b.time.split(':').map(Number);
  const loc = b.city === 'custom' ? [null, Number(b.lat), Number(b.lon), Number(b.tz)] : CITIES[b.city];
  const chart = birthChart({ date: localToDate(y, m, d, hh, mm, loc[3]), lat: loc[1], lon: loc[2] });
  const moon = chart.planets.find((p) => p.name === 'Moon');
  const sun = chart.planets.find((p) => p.name === 'Sun');
  const P = PLANET_NAMES[lang];
  return `<section class="card">
      <h2>${b.name ? `${esc(b.name)} — ` : ''}${t('yourLagna')}: ${SIGN_GLYPHS[chart.lagna]} ${esc(SIGNS[lang][chart.lagna])} ${formatDeg(chart.ascendant)}</h2>
      <dl class="kv">
        <div><dt>${t('yourLagna')}</dt><dd>${esc(SIGN_SHORT[lang][chart.lagna])}</dd></div>
        <div><dt>${t('moonSign')}</dt><dd>${esc(SIGN_SHORT[lang][moon.sign])}</dd></div>
        <div><dt>${t('sunSign')}</dt><dd>${esc(SIGN_SHORT[lang][sun.sign])}</dd></div>
        <div><dt>${t('birthStar')}</dt><dd>${NAKSHATRAS[lang][moon.nakshatra]} (${moon.pada})</dd></div>
      </dl>
      <div class="row" style="margin-top:14px">
        <a class="btn" href="#/weekly/${chart.lagna}">${t('seeWeekly')} ${esc(SIGN_SHORT[lang][chart.lagna])} →</a>
        <button class="btn secondary" type="button" id="kundli-save" data-lagna="${chart.lagna}">${t('setMyLagna')}</button>
      </div>
    </section>
    <div class="grid grid-2">
      <section class="card"><h2>${t('lagnaChart')}</h2>${northChart(chart)}</section>
      <section class="card"><h2>${t('planetTable')}</h2><div class="table-wrap"><table>
        <thead><tr><th>${t('planet')}</th><th>${t('sign')}</th><th>${t('degree')}</th><th>${t('nakshatra')}</th><th>${t('house')}</th></tr></thead>
        <tbody><tr><td><b>${lang === 'hi' ? 'लग्न' : 'Ascendant'}</b></td><td>${esc(SIGN_SHORT[lang][chart.lagna])}</td><td>${formatDeg(chart.ascendant)}</td><td>—</td><td>1</td></tr>
        ${chart.planets.map((p) => `<tr><td>${P[p.name]}${p.retro && p.name !== 'Rahu' && p.name !== 'Ketu' ? ` (${t('retro')})` : ''}</td>
          <td>${esc(SIGN_SHORT[lang][p.sign])}</td><td>${formatDeg(p.lon)}</td><td>${NAKSHATRAS[lang][p.nakshatra]} ${p.pada}</td><td>${p.house}</td></tr>`).join('')}
        </tbody></table></div>
        <p class="small muted" style="margin-top:8px">Lahiri ayanamsa ${chart.ayanamsa.toFixed(2)}° · ${t('retro')} = ${t('retroFull')}</p>
      </section>
    </div>`;
}

function bindKundli() {
  const form = $('#kundli-form');
  const custom = $('#custom-loc');
  form.city.onchange = () => { custom.hidden = form.city.value !== 'custom'; };
  const submit = () => {
    const b = {
      name: form.name.value.trim(), date: form.date.value, time: form.time.value,
      city: form.city.value === 'custom' ? 'custom' : Number(form.city.value),
      lat: form.lat.value, lon: form.lon.value, tz: form.tz.value || 5.5,
    };
    if (b.city === 'custom' && (b.lat === '' || b.lon === '')) { toast(`${t('lat')} / ${t('lon')}?`); return; }
    store.set('birth', b);
    $('#kundli-out').innerHTML = renderKundli(b);
    $('#kundli-save').onclick = (e) => { store.set('myLagna', Number(e.target.dataset.lagna)); e.target.textContent = `✓ ${t('saved')}`; };
  };
  form.onsubmit = (e) => { e.preventDefault(); submit(); $('#kundli-out').scrollIntoView({ behavior: 'smooth' }); };
  if (store.get('birth')) submit();
}

function viewPanchang() {
  const s = store.get('panchang', { city: 0 });
  const today = new Date(Date.now() + 5.5 * 3600000).toISOString().slice(0, 10);
  return `<h1>${t('panchangTitle')}</h1>
    <form class="card" id="pan-form"><div class="fields">
      <label>${t('date')}<input type="date" name="date" value="${today}"></label>
      <label>${t('place')}<select name="city">${cityOptions(s.city).replace(/<option value="custom".*<\/option>/, '')}</select></label>
    </div></form><div id="pan-out"></div>`;
}

function bindPanchang() {
  const form = $('#pan-form');
  const render = () => {
    const [y, m, d] = form.date.value.split('-').map(Number);
    const c = CITIES[Number(form.city.value)];
    store.set('panchang', { city: Number(form.city.value) });
    const sr = sunriseSunset(y, m, d, c[1], c[2], c[3]).sunrise || localToDate(y, m, d, 6, 0, c[3]);
    const p = panchang(sr, c[1], c[2], c[3]);
    const noon = julianDay(localToDate(y, m, d, 12, 0, c[3]));
    $('#pan-out').innerHTML = `<section class="card"><h2>${WEEKDAYS[lang][p.weekday]}, ${fmtDay(new Date(Date.UTC(y, m - 1, d)), { day: 'numeric', month: 'long', year: 'numeric' })} · ${c[0]}</h2>
      <p class="small muted">${lang === 'hi' ? 'सूर्योदय के समय' : 'At sunrise'}</p>
      <dl class="kv">
        <div><dt>${t('tithi')}</dt><dd>${tithiName(p.tithi, lang)}</dd></div>
        <div><dt>${t('nakshatra')}</dt><dd>${NAKSHATRAS[lang][p.nakshatra]} (${p.pada})</dd></div>
        <div><dt>${t('yoga')}</dt><dd>${YOGAS[lang][p.yoga]}</dd></div>
        <div><dt>${t('karana')}</dt><dd>${KARANAS[lang][p.karana]}</dd></div>
        <div><dt>${t('vara')}</dt><dd>${WEEKDAYS[lang][p.weekday]}</dd></div>
        <div><dt>${t('sunrise')}</dt><dd>${fmtTime(p.sunrise, c[3])}</dd></div>
        <div><dt>${t('sunset')}</dt><dd>${fmtTime(p.sunset, c[3])}</dd></div>
        <div><dt>${t('rahuKaal')}</dt><dd>${p.rahuKaal ? `${fmtTime(p.rahuKaal.start, c[3])} – ${fmtTime(p.rahuKaal.end, c[3])}` : '—'}</dd></div>
        <div><dt>${t('moonIn')}</dt><dd>${esc(SIGN_SHORT[lang][signOf(siderealLongitude('Moon', noon))])}</dd></div>
        <div><dt>${t('sunIn')}</dt><dd>${esc(SIGN_SHORT[lang][signOf(siderealLongitude('Sun', noon))])}</dd></div>
      </dl></section>`;
  };
  form.onchange = render;
  render();
}

function viewEditor() {
  return `<h1>${t('editorTitle')}</h1>
    <section class="card"><p class="muted">${esc(t('editorHelp'))}</p>
    <form id="ed-form"><div class="fields">
      <label>${t('week')}<input type="date" name="week" value="${isoDate(weekStart())}"></label>
      <label>${t('lagna')}<select name="lagna">${SIGNS[lang].map((s, i) => `<option value="${i}">${esc(s)}</option>`).join('')}</select></label>
      <label class="span-2">${t('sourceLabel')}<input name="source"></label>
      <label class="span-2">${t('textHi')}<textarea name="hi" lang="hi"></textarea></label>
      <label class="span-2">${t('textEn')}<textarea name="en" lang="en"></textarea></label>
    </div>
    <div class="row" style="margin-top:14px">
      <button class="btn" type="submit">${t('save')}</button>
      <button class="btn secondary" type="button" id="ed-export">${t('export')}</button>
      <label class="btn secondary" style="flex-direction:row">${t('import')}<input type="file" id="ed-import" accept="application/json" hidden></label>
      <button class="btn secondary" type="button" id="ed-clear">${t('clear')}</button>
    </div></form></section>
    <section class="card"><h2 id="ed-status-h"></h2><div id="ed-status" class="lagna-grid"></div></section>`;
}

function bindEditor() {
  const f = $('#ed-form');
  const key = () => isoDate(weekStart(new Date(`${f.week.value}T06:00:00Z`)));
  const refresh = async () => {
    const ws = weekStart(new Date(`${f.week.value}T06:00:00Z`));
    f.week.value = isoDate(ws);
    const notes = await loadNotes(ws);
    const n = notes.lagnas[LAGNA_KEYS[f.lagna.value]] || {};
    f.en.value = n.en || ''; f.hi.value = n.hi || ''; f.source.value = notes.source || '';
    $('#ed-status-h').textContent = `${t('week_of')} ${fmtDay(ws)} – ${fmtDay(addDays(ws, 6), { day: 'numeric', month: 'short', year: 'numeric' })}`;
    $('#ed-status').innerHTML = SIGN_SHORT[lang].map((s, i) => {
      const has = notes.lagnas[LAGNA_KEYS[i]];
      return `<button type="button" class="lagna-btn" data-l="${i}" ${String(i) === f.lagna.value ? 'aria-current="true"' : ''}>
        <span class="glyph">${SIGN_GLYPHS[i]}</span><span class="nm">${esc(s)}</span><span class="st">${has ? '✓' : '—'}</span></button>`;
    }).join('');
    $('#ed-status').querySelectorAll('button').forEach((b) => { b.onclick = () => { f.lagna.value = b.dataset.l; refresh(); }; });
  };
  f.week.onchange = refresh;
  f.lagna.onchange = refresh;
  f.onsubmit = (e) => {
    e.preventDefault();
    const k = key();
    const local = store.get(`notes.${k}`, { lagnas: {} });
    local.source = f.source.value.trim();
    const entry = { en: f.en.value.trim(), hi: f.hi.value.trim() };
    if (entry.en || entry.hi) local.lagnas[LAGNA_KEYS[f.lagna.value]] = entry;
    else delete local.lagnas[LAGNA_KEYS[f.lagna.value]];
    store.set(`notes.${k}`, local);
    toast(t('savedOk'));
    refresh();
  };
  $('#ed-export').onclick = async () => {
    const k = key();
    const notes = await loadNotes(weekStart(new Date(`${k}T06:00:00Z`)));
    const blob = new Blob([JSON.stringify({ weekStart: k, source: notes.source, lagnas: notes.lagnas }, null, 2)], { type: 'application/json' });
    const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(blob), download: `${k}.json` });
    a.click(); URL.revokeObjectURL(a.href);
  };
  $('#ed-import').onchange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const data = JSON.parse(await file.text());
      const k = isoDate(weekStart(new Date(`${data.weekStart || key()}T06:00:00Z`)));
      store.set(`notes.${k}`, { source: data.source || '', lagnas: data.lagnas || {} });
      f.week.value = k; toast(t('imported')); refresh();
    } catch { toast('Invalid JSON'); }
  };
  $('#ed-clear').onclick = () => { store.del(`notes.${key()}`); refresh(); };
  refresh();
}

// ---------- router ----------
const ROUTES = {
  home: [viewHome, null], weekly: [viewWeekly, bindWeekly], kundli: [viewKundli, bindKundli],
  panchang: [viewPanchang, bindPanchang], editor: [viewEditor, bindEditor],
};

async function render() {
  const parts = location.hash.replace(/^#\/?/, '').split('/');
  const name = ROUTES[parts[0]] ? parts[0] : 'home';
  const params = parts.slice(1);
  const [view, bind] = ROUTES[name];
  const main = $('#view');
  main.innerHTML = await view(params);
  if (bind) bind(params);
  document.querySelectorAll('[data-route]').forEach((a) => a.classList.toggle('active', a.dataset.route === name));
  document.querySelectorAll('[data-i18n]').forEach((el) => { el.textContent = t(el.dataset.i18n); });
  document.documentElement.lang = lang;
  $('#lang-toggle').textContent = t('language');
}

$('#lang-toggle').onclick = () => { lang = lang === 'en' ? 'hi' : 'en'; store.set('lang', lang); render(); };
window.addEventListener('hashchange', () => { render(); window.scrollTo(0, 0); });
render();

if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
