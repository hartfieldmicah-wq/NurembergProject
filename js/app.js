/* app.js - UI, state, location, offline status */
(function () {
'use strict';
const NM = window.NM, D = NM.data, B = NM.basemap, G = NM.geo;
const $ = (s) => document.querySelector(s);
const esc = (s) => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const store = { get(k, d) { try { return localStorage.getItem(k) || d; } catch (_) { return d; } }, set(k, v) { try { localStorage.setItem(k, v); } catch (_) {} } };

const state = { style: store.get('nm_style', 'old'), era: store.get('nm_era', 'now'), sel: null, loc: null, sim: false, follow: false, destr: 0, destrTarget: 0, cat: 'all' };
if (!D.ERAS.some(e => e.id === state.era)) state.era = 'now';
const LMS = B.landmarks;
const byId = {}; LMS.forEach(l => byId[l.id] = l);
const statusOf = (l, era) => l.eras[era || state.era][0];

/* ---------- map ---------- */
const mapEl = $('#map');
const view = new NM.MapView(mapEl, $('#canvas'), {
  draw: (ctx, V) => { V.mpp; B.draw(ctx, V, { style: state.style, era: state.era, destr: state.destr, statusOf: (l) => statusOf(l) }); }
});
function fitHome() {
  const z = view.zoomForSize(2300, 2000, 20, 190);
  view.setView(-60, 10, Math.min(Math.max(z, 13.5), 16.5));
}
fitHome();

/* ---------- pins ---------- */
const pinsEl = $('#pins'), layerEl = $('#layer');
const pinEls = {};
const icon = (l) => '<svg class="shape" viewBox="0 0 40 52" aria-hidden="true"><path class="p" d="M20 50C20 50 3 31 3 19a17 17 0 0 1 34 0c0 12-17 31-17 31z"/><circle cx="20" cy="19" r="12.5"/><use href="#i-' + l.icon + '" x="9" y="8" width="22" height="22"/></svg>';
const BADGE = { damaged: '!', ruin: '×', rebuilt: '✓', absent: '–' };
LMS.forEach(l => {
  const p = document.createElement('div'); p.className = 'pin'; p.dataset.id = l.id;
  p.style.setProperty('--c', D.CATS[l.cat].color);
  p.innerHTML = '<button class="btn" type="button" aria-label="' + esc(l.name) + '. Tap for history."><div class="body">' + icon(l) + '<span class="badge"></span></div></button><span class="lbl">' + esc(l.name.split(' (')[0].replace(' & ', ' & ')) + '</span>';
  const pb = p.querySelector('.btn'); let lastSel = 0;
  const pick = (e) => { e.stopPropagation(); if (view.moved) return; const t = Date.now(); if (t - lastSel < 400) return; lastSel = t; select(l.id, true); };
  pb.addEventListener('click', pick);
  pinsEl.appendChild(p); pinEls[l.id] = p;
});
function refreshPins() {
  LMS.forEach(l => {
    const st = statusOf(l), p = pinEls[l.id];
    p.className = 'pin st-' + st + (state.sel === l.id ? ' sel' : '');
    p.style.setProperty('--sc', D.STATUS[st].color);
    p.querySelector('.badge').textContent = BADGE[st] || '';
  });
}
function pulsePins() { LMS.forEach(l => pinEls[l.id].classList.add('pulse')); setTimeout(() => LMS.forEach(l => pinEls[l.id].classList.remove('pulse')), 5200); }

const userEl = $('#user');
const clusEl = document.createElement('div'); clusEl.id = 'clusters'; layerEl.appendChild(clusEl);
const clusPool = [];
function clusterBtn(i) {
  if (clusPool[i]) return clusPool[i];
  const w = document.createElement('div'); w.className = 'clus';
  const b = document.createElement('button'); b.type = 'button'; w.appendChild(b); clusEl.appendChild(w);
  b.addEventListener('click', (e) => {
    e.stopPropagation(); if (view.moved) return; const m = w._members || []; if (!m.length) return;
    let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9; m.forEach(l => { x0 = Math.min(x0, l.m[0]); x1 = Math.max(x1, l.m[0]); y0 = Math.min(y0, l.m[1]); y1 = Math.max(y1, l.m[1]); });
    const fit = view.zoomForSize(Math.max(x1 - x0, 70), Math.max(y1 - y0, 70), 150, 330);
    view.flyTo((x0 + x1) / 2, (y0 + y1) / 2, Math.min(18.6, Math.max(fit, view.z + 1)), 600); hideHint();
  });
  return (clusPool[i] = w);
}
view.on('render', () => {
  const z = view.z, ps = z < 14.4 ? 0.55 : z < 15.1 ? 0.66 : z < 15.9 ? 0.82 : 1;
  layerEl.dataset.labels = z >= 15.7 ? '1' : '0';
  pinsEl.style.setProperty('--ps', ps);
  const sc = {}, par = {}; LMS.forEach(l => { sc[l.id] = view.wts(l.m[0], l.m[1]); par[l.id] = l.id; });
  const find = (i) => par[i] === i ? i : (par[i] = find(par[i])), thr = 40 * ps + 8;
  for (let a = 0; a < LMS.length; a++) for (let b = a + 1; b < LMS.length; b++) {
    const A = LMS[a].id, B = LMS[b].id; if (A === state.sel || B === state.sel) continue;
    if (Math.hypot(sc[A][0] - sc[B][0], sc[A][1] - sc[B][1]) < thr) par[find(B)] = find(A);
  }
  const groups = {}; LMS.forEach(l => { const r = find(l.id); (groups[r] = groups[r] || []).push(l); });
  let ci = 0;
  for (const r in groups) {
    const g = groups[r];
    if (g.length === 1) {
      const l = g[0], s = sc[l.id], p = pinEls[l.id];
      p.style.transform = 'translate3d(' + s[0].toFixed(1) + 'px,' + s[1].toFixed(1) + 'px,0)';
      p.style.display = (s[0] < -80 || s[0] > view.w + 80 || s[1] < -80 || s[1] > view.h + 120) ? 'none' : '';
    } else {
      let cx = 0, cy = 0; g.forEach(l => { cx += sc[l.id][0]; cy += sc[l.id][1]; pinEls[l.id].style.display = 'none'; }); cx /= g.length; cy /= g.length;
      const w = clusterBtn(ci++); w._members = g; w.style.display = '';
      w.style.transform = 'translate3d(' + cx.toFixed(1) + 'px,' + cy.toFixed(1) + 'px,0)';
      const b = w.firstChild; b.innerHTML = g.length + '<small>places</small>'; b.setAttribute('aria-label', g.length + ' landmarks here. Tap to zoom in.');
    }
  }
  for (let i = ci; i < clusPool.length; i++) clusPool[i].style.display = 'none';
  if (state.loc) {
    const m = G.ll2m(state.loc.lon, state.loc.lat), s = view.wts(m[0], m[1]);
    userEl.style.transform = 'translate3d(' + s[0].toFixed(1) + 'px,' + s[1].toFixed(1) + 'px,0)';
    const d = Math.max(28, 2 * (state.loc.acc || 20) * view.k), a = userEl.firstElementChild;
    a.style.width = a.style.height = d + 'px'; a.style.left = a.style.top = (-d / 2) + 'px';
  }
});
// ornament for the old-map style: laurel wreath with two shields
(function () {
  const w = document.getElementById('wreath'); if (!w) return; let h = '';
  for (let i = 0; i < 26; i++) { const a = i / 26 * 360, side = i % 2 ? 1 : -1; h += '<ellipse cx="50" cy="12" rx="2.6" ry="6.4" transform="rotate(' + a + ' 50 50) rotate(' + side * 28 + ' 50 12)" fill="none" stroke="currentColor" stroke-width="1"/>'; }
  h += '<circle cx="50" cy="50" r="33" fill="none" stroke="currentColor" stroke-width=".8"/>';
  h += '<path d="M27 33h20v17c0 9-7 13-10 15-3-2-10-6-10-15z" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="M53 33h20v17c0 9-7 13-10 15-3-2-10-6-10-15z" fill="none" stroke="currentColor" stroke-width="1.4"/>';
  for (let x = 30; x < 46; x += 2.4) h += '<line x1="' + x + '" y1="35" x2="' + x + '" y2="56" stroke="currentColor" stroke-width=".8"/>';
  for (let y = 36; y < 58; y += 4) h += '<rect x="55" y="' + y + '" width="16" height="2" fill="currentColor"/>';
  w.innerHTML = h;
})();
view.on('movestart', () => { state.follow = false; $('#bLocate').classList.remove('on'); hideHint(); });

/* ---------- eras ---------- */
const erasEl = $('#eras');
D.ERAS.forEach(e => {
  const b = document.createElement('button'); b.type = 'button'; b.dataset.era = e.id; b.setAttribute('role', 'tab');
  b.innerHTML = '<span class="y">' + esc(e.year) + '</span><span class="n">' + esc(e.name) + '</span>';
  b.addEventListener('click', () => setEra(e.id)); erasEl.appendChild(b);
});
function setEra(id, quiet) {
  state.era = id; store.set('nm_era', id);
  document.body.className = document.body.className.replace(/era-\S+/, 'era-' + id);
  erasEl.querySelectorAll('button').forEach(b => { const on = b.dataset.era === id; b.classList.toggle('on', on); b.setAttribute('aria-selected', on); });
  const e = D.ERAS.find(x => x.id === id);
  $('#eraCaption').textContent = e.year + ' · ' + e.name;
  state.destrTarget = id === '1945' ? 1 : 0;
  animateDestr();
  refreshPins(); renderList(); if (state.sel) renderSheet(); view.render();
  if (!quiet) { pulsePins(); hideHint(); }
}
let destrRAF = 0;
function animateDestr() {
  cancelAnimationFrame(destrRAF);
  let last = performance.now();
  const step = (t) => {
    const dt = Math.min(60, t - last); last = t;
    const dir = Math.sign(state.destrTarget - state.destr);
    state.destr += dir * dt / 1100;
    if ((dir > 0 && state.destr >= state.destrTarget) || (dir < 0 && state.destr <= state.destrTarget) || dir === 0) { state.destr = state.destrTarget; view.touch(); return; }
    view.touch(); destrRAF = requestAnimationFrame(step);
  };
  destrRAF = requestAnimationFrame(step);
}

/* ---------- style ---------- */
const styleSeg = $('#styleSeg');
function setStyle(s) {
  state.style = s; store.set('nm_style', s);
  document.body.className = document.body.className.replace(/style-\S+/, 'style-' + s);
  styleSeg.querySelectorAll('button').forEach(b => b.classList.toggle('on', b.dataset.style === s));
  const tc = document.querySelector('meta[name=theme-color]'); if (tc) tc.content = s === 'old' ? '#2b2923' : '#1d1b18';
  view.render();
}
styleSeg.addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) setStyle(b.dataset.style); });

/* ---------- distance helpers ---------- */
function hav(a, b, c, d) { const R = 6371000, r = Math.PI / 180, dl = (c - a) * r, dn = (d - b) * r; const x = Math.sin(dl / 2) ** 2 + Math.cos(a * r) * Math.cos(c * r) * Math.sin(dn / 2) ** 2; return 2 * R * Math.asin(Math.sqrt(x)); }
function bearing(a, b, c, d) { const r = Math.PI / 180, y = Math.sin((d - b) * r) * Math.cos(c * r), x = Math.cos(a * r) * Math.sin(c * r) - Math.sin(a * r) * Math.cos(c * r) * Math.cos((d - b) * r); return (Math.atan2(y, x) / r + 360) % 360; }
const DIRS = ['north', 'north-east', 'east', 'south-east', 'south', 'south-west', 'west', 'north-west'];
const fmtD = (m) => m < 950 ? Math.round(m / 10) * 10 + ' m' : (m / 1000).toFixed(m < 10000 ? 1 : 0) + ' km';
function rel(l) {
  if (!state.loc) return null;
  const d = hav(state.loc.lat, state.loc.lon, l.lat, l.lon), br = bearing(state.loc.lat, state.loc.lon, l.lat, l.lon);
  return { d, dir: DIRS[Math.round(br / 45) % 8], min: Math.max(1, Math.round(d / 80)) };
}
const isApple = /iPad|iPhone|iPod|Macintosh/.test(navigator.userAgent) && 'ontouchend' in document;

/* ---------- sheet ---------- */
const sheet = $('#sheet'), sheetBody = $('#sheetBody');
function renderSheet() {
  const l = byId[state.sel]; if (!l) return;
  const e = l.eras[state.era], st = e[0], S = D.STATUS[st], era = D.ERAS.find(x => x.id === state.era), cat = D.CATS[l.cat];
  const r = rel(l);
  let dist = '';
  if (r) dist = r.d < 25 ? 'You are right here.' : (r.d > 30000 ? 'You are ' + fmtD(r.d) + ' from here' + (state.sim ? ' (pretend location)' : '') : fmtD(r.d) + ' ' + r.dir + ' of you · about ' + r.min + ' min on foot' + (state.sim ? ' (pretend location)' : ''));
  else dist = 'Tap the target button to see how far this is from you.';
  const nav = isApple ? 'https://maps.apple.com/?daddr=' + l.lat + ',' + l.lon + '&dirflg=w' : 'https://www.google.com/maps/dir/?api=1&travelmode=walking&destination=' + l.lat + ',' + l.lon;
  sheetBody.innerHTML =
    '<span class="chip" style="--c:' + cat.color + '">' + esc(cat.label) + '</span>' +
    '<h2>' + esc(l.name) + '</h2><p class="sub">' + esc(l.blurb) + ' <span>(' + esc(l.built) + ')</span></p>' +
    '<div class="stat" style="--sc:' + S.color + '"><span class="dot"></span><b>' + esc(e[2] || S.label) + '</b><span class="en">· ' + esc(era.year === 'Today' ? 'Today' : era.year) + ' ' + (era.id === 'now' ? '' : esc(era.name)) + '</span></div>' +
    '<p class="txt">' + esc(e[1]) + '</p>' +
    '<h3>Through the eras</h3><ul class="tl">' + D.ERAS.map(x => {
      const ee = l.eras[x.id], ss = D.STATUS[ee[0]];
      return '<li data-era="' + x.id + '" class="' + (x.id === state.era ? 'on' : '') + '" style="--sc:' + ss.color + '"><span class="dot"></span><span class="yr">' + esc(x.year) + '</span><span class="lb">' + esc(ee[2] || ss.label) + '</span></li>';
    }).join('') + '</ul>' +
    (l.facts && l.facts.length ? '<h3>Did you know?</h3><ul class="facts">' + l.facts.map(f => '<li>' + esc(f) + '</li>').join('') + '</ul>' : '') +
    '<div class="acts"><div class="dist">' + esc(dist) + '</div><a class="btn2" href="' + nav + '" target="_blank" rel="noopener">Directions</a>' +
    '<a class="btn2 alt" href="https://en.wikipedia.org/wiki/Special:Search?search=' + encodeURIComponent(l.wiki) + '" target="_blank" rel="noopener">Read more (online)</a></div>';
  sheetBody.querySelectorAll('.tl li').forEach(li => li.addEventListener('click', () => setEra(li.dataset.era)));
}
function select(id, fly) {
  state.sel = id; refreshPins(); renderSheet();
  sheet.classList.add('open'); sheet.setAttribute('aria-hidden', 'false'); sheet.scrollTop = 0;
  closeList(); hideHint();
  if (fly) {
    const l = byId[id];
    setTimeout(() => {
      const wide = window.innerWidth >= 900;
      const visTop = 70, visBot = wide ? view.h - erasEl.offsetHeight - 20 : view.h - erasEl.offsetHeight - sheet.offsetHeight;
      const cy = (visTop + visBot) / 2, cx = wide ? (view.w + 420) / 2 : view.w / 2;
      const z = Math.max(view.z, 16.8), k = Math.pow(2, z) / (156543.03392 * Math.cos(49.4541 * Math.PI / 180));
      view.flyTo(l.m[0] - (cx - view.w / 2) / k, l.m[1] + (cy - view.h / 2) / k, z, 650);
    }, 30);
  }
}
function closeSheet() { state.sel = null; sheet.classList.remove('open'); sheet.setAttribute('aria-hidden', 'true'); refreshPins(); }
$('#sheetX').addEventListener('click', closeSheet);
view.on('tap', () => { if (state.sel) closeSheet(); closeList(); hideHint(); });
(function swipe() {
  let y0 = null, dy = 0;
  const g = $('#grab');
  g.addEventListener('touchstart', (e) => { y0 = e.touches[0].clientY; dy = 0; }, { passive: true });
  g.addEventListener('touchmove', (e) => { if (y0 == null) return; dy = e.touches[0].clientY - y0; if (dy > 0) sheet.style.transform = 'translateY(' + dy + 'px)'; }, { passive: true });
  g.addEventListener('touchend', () => { sheet.style.transform = ''; if (dy > 70) closeSheet(); y0 = null; });
})();

/* ---------- list ---------- */
const listEl = $('#list'), itemsEl = $('#items'), chipsEl = $('#chips'), qEl = $('#q');
function renderChips() {
  const cats = [['all', 'All']].concat(Object.entries(D.CATS).map(([k, v]) => [k, v.label]));
  chipsEl.innerHTML = cats.map(c => '<button type="button" data-c="' + c[0] + '" class="' + (state.cat === c[0] ? 'on' : '') + '">' + esc(c[1]) + '</button>').join('');
}
chipsEl.addEventListener('click', (e) => { const b = e.target.closest('button'); if (!b) return; state.cat = b.dataset.c; renderChips(); renderList(); });
qEl.addEventListener('input', renderList);
function renderList() {
  const q = qEl.value.trim().toLowerCase();
  let arr = LMS.filter(l => (state.cat === 'all' || l.cat === state.cat) && (!q || (l.name + ' ' + l.blurb).toLowerCase().includes(q)));
  if (state.loc) arr = arr.slice().sort((a, b) => rel(a).d - rel(b).d);
  itemsEl.innerHTML = arr.map(l => {
    const st = statusOf(l), r = rel(l);
    return '<li data-id="' + l.id + '" style="--c:' + D.CATS[l.cat].color + ';--sc:' + D.STATUS[st].color + '"><div class="ic"><svg viewBox="0 0 24 24"><use href="#i-' + l.icon + '"/></svg></div><div><div class="nm">' + esc(l.name) + '</div><div class="mt">' + esc(D.CATS[l.cat].label) + (r ? ' · ' + fmtD(r.d) : '') + ' · ' + esc(l.eras[state.era][2] || D.STATUS[st].label) + '</div></div><span class="sd"></span></li>';
  }).join('') || '<li><div class="mt">No matches</div></li>';
}
itemsEl.addEventListener('click', (e) => { const li = e.target.closest('li[data-id]'); if (li) select(li.dataset.id, true); });
function openList() { renderChips(); renderList(); listEl.classList.add('open'); listEl.setAttribute('aria-hidden', 'false'); }
function closeList() { listEl.classList.remove('open'); listEl.setAttribute('aria-hidden', 'true'); }
$('#bList').addEventListener('click', () => listEl.classList.contains('open') ? closeList() : openList());
$('#listX').addEventListener('click', closeList);

/* ---------- toast & hint ---------- */
const toastEl = $('#toast'); let toastT = 0;
function toast(msg, action, ms) {
  toastEl.innerHTML = esc(msg); if (action) { const b = document.createElement('button'); b.textContent = action.label; b.onclick = action.fn; toastEl.appendChild(b); }
  toastEl.classList.add('show'); clearTimeout(toastT); toastT = setTimeout(() => toastEl.classList.remove('show'), ms || 3800);
}
const hintEl = $('#hint');
function hideHint() { hintEl.classList.add('gone'); store.set('nm_hint', '1'); }
if (store.get('nm_hint', '') === '1') hintEl.classList.add('gone'); else setTimeout(hideHint, 9000);

/* ---------- location ---------- */
let watchId = null, firstFix = false;
const nearestEl = $('#nearest');
function onLoc(lat, lon, acc, heading, sim) {
  state.loc = { lat, lon, acc, heading }; state.sim = !!sim;
  userEl.hidden = false; userEl.classList.toggle('sim', !!sim);
  let best = null, bd = 1e12; LMS.forEach(l => { const d = hav(lat, lon, l.lat, l.lon); if (d < bd) { bd = d; best = l; } });
  if (best && bd < 30000) {
    nearestEl.hidden = false; nearestEl.textContent = (bd < 40 ? 'You are at ' : 'Nearest: ') + best.name.split(' (')[0] + (bd < 40 ? '' : ' · ' + fmtD(bd)) + (sim ? ' (pretend)' : '');
    nearestEl.onclick = () => select(best.id, true);
  } else { nearestEl.hidden = false; nearestEl.textContent = 'You are ' + fmtD(bd) + ' from the nearest landmark' + (sim ? ' (pretend)' : ''); nearestEl.onclick = null; }
  if (state.sel) renderSheet(); if (listEl.classList.contains('open')) renderList();
  if (state.follow || !firstFix) {
    const m = G.ll2m(lon, lat);
    if (bd < 30000) view.flyTo(m[0], m[1], Math.max(view.z, 16.5), firstFix ? 400 : 800);
    else toast('You are far from Nuremberg (' + fmtD(bd) + '). Long-press the map to place a pretend location.', null, 5500);
    firstFix = true;
  }
  view.render();
}
function startLocate() {
  const btn = $('#bLocate');
  if (!navigator.geolocation) { toast('This browser cannot provide your location.'); return; }
  state.follow = true; btn.classList.add('on'); firstFix = false;
  if (state.loc && !state.sim) { onLoc(state.loc.lat, state.loc.lon, state.loc.acc, state.loc.heading, false); }
  if (watchId != null) { if (state.sim) { navigator.geolocation.clearWatch(watchId); watchId = null; } else return; }
  watchId = navigator.geolocation.watchPosition(
    (p) => onLoc(p.coords.latitude, p.coords.longitude, p.coords.accuracy, p.coords.heading, false),
    (err) => { btn.classList.remove('on'); state.follow = false; watchId = null; toast(err.code === 1 ? 'Location is blocked. Allow it in your browser or iOS settings, or long-press the map to pretend.' : 'Could not get your location. Try again outdoors.', null, 5000); },
    { enableHighAccuracy: true, maximumAge: 4000, timeout: 20000 });
}
$('#bLocate').addEventListener('click', startLocate);
view.on('longpress', (e) => {
  const ll = G.m2ll(e.world[0], e.world[1]), lat = +ll[1].toFixed(5), lon = +ll[0].toFixed(5);
  if (watchId != null) { navigator.geolocation.clearWatch(watchId); watchId = null; }
  firstFix = true; state.follow = false; $('#bLocate').classList.remove('on');
  onLoc(lat, lon, 15, null, true);
  const txt = lat + ', ' + lon;
  toast('Pretend location: ' + txt, { label: 'Copy', fn: () => { try { navigator.clipboard.writeText(txt); toast('Copied ' + txt); } catch (_) { toast(txt); } } }, 6000);
});
$('#bZin').addEventListener('click', () => view.zoomBy(0.8));
$('#bZout').addEventListener('click', () => view.zoomBy(-0.8));

/* ---------- about ---------- */
const aboutEl = $('#about');
function renderAbout() {
  const st = D.STATUS;
  $('#aboutBody').innerHTML =
    '<h2>Nuremberg Then &amp; Now</h2>' +
    '<p>An offline historical map. Pick a time with the buttons at the bottom and tap any pin to read what stood there.</p>' +
    '<h3>Pins</h3><div class="legend">' + Object.keys(st).map(k => '<span><i style="background:' + st[k].color + '"></i>' + st[k].label + '</span>').join('') + '</div>' +
    '<p>Every pin is tappable. A small badge on a pin shows its condition in the chosen year.</p>' +
    '<h3>Your location</h3><p>Tap the target button. Away from Nuremberg, long-press the map to place a pretend location (and copy its coordinates).</p>' +
    '<h3>Install and offline</h3><ul><li><b>iPhone:</b> open in Safari, tap Share, then Add to Home Screen.</li><li><b>Android:</b> browser menu, then Install app.</li><li>Open it once online; after that it works with no connection. <span id="offlineState"></span></li></ul>' +
    '<h3>About the map</h3><p>Streets, buildings, river, parks and the city wall are real geometry from OpenStreetMap, drawn in two styles. Today\'s building outlines are used for the older eras too, so 1648 and 1939 are an approximation of the layout; the 1945 rubble pattern is illustrative (about 90% of the old town was destroyed) apart from the landmarks, whose condition comes from the texts. Historical text is a short summary: please check details before relying on them.</p><p>Map data &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap contributors</a> (ODbL).</p>' +
    '<p class="mt">Version ' + (window.NM_VERSION || '1.0.1') + '</p>';
  checkOffline();
}
$('#bInfo').addEventListener('click', () => { renderAbout(); aboutEl.classList.add('open'); aboutEl.setAttribute('aria-hidden', 'false'); });
function closeAbout() { aboutEl.classList.remove('open'); aboutEl.setAttribute('aria-hidden', 'true'); }
$('#aboutX').addEventListener('click', closeAbout);
aboutEl.addEventListener('click', (e) => { if (e.target === aboutEl) closeAbout(); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { closeAbout(); closeList(); closeSheet(); } });

/* ---------- service worker / offline ---------- */
function checkOffline() {
  const el = $('#offlineState'); if (!el) return;
  if (!('serviceWorker' in navigator) || !window.caches) { el.textContent = 'Offline mode is not supported in this browser.'; return; }
  caches.keys().then(k => { el.textContent = k.some(n => n.indexOf('nuremberg-map-') === 0) ? '✓ Ready for offline use.' : 'Not saved for offline yet; stay online a moment.'; });
}
if ('serviceWorker' in navigator && location.protocol !== 'file:') {
  const had = !!navigator.serviceWorker.controller;
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').then(() => { setTimeout(() => { checkOffline(); if (!had) toast('Saved for offline use ✓'); }, 2500); }).catch(() => {});
  });
  navigator.serviceWorker.addEventListener('controllerchange', () => { if (had) toast('Updated.', { label: 'Reload', fn: () => location.reload() }, 9000); });
  if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {});
}

/* ---------- init ---------- */
setStyle(state.style);
setEra(state.era, true);
setTimeout(pulsePins, 600);
window.NM.app = { state, view, select, setEra, setStyle };
})();
