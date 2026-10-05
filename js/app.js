/* app.js - UI, state, location, offline status */
(function () {
'use strict';
const NM = window.NM, D = NM.data, B = NM.basemap, G = NM.geo;
const $ = (s) => document.querySelector(s);
const esc = (s) => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const store = { get(k, d) { try { return localStorage.getItem(k) || d; } catch (_) { return d; } }, set(k, v) { try { localStorage.setItem(k, v); } catch (_) {} } };

const I = NM.i18n, t = I.t;
const state = { style: store.get('nm_style', 'old'), era: store.get('nm_era', 'now'), sel: null, bsel: null, d3: store.get('nm_d3', '1') !== '0', hl: null, route: null, leg: null, tmode: store.get('nm_tmode', 'foot'), tour: null, year: null, loc: null, sim: false, follow: false, destr: 0, destrTarget: 0, cat: 'all' };
if (!D.ERAS.some(e => e.id === state.era)) state.era = 'now';
const LMS = B.landmarks;
const byId = {}; LMS.forEach(l => byId[l.id] = l);
/* first year each landmark stood (approximate, from the "built" text) and, for the synagogue, the year it ended */
const Y0 = { kaiserburg: [1050], durer: [1420], hauptmarkt: [1349], frauenkirche: [1352], sebald: [1225], lorenz: [1250], rathaus: [1332], weisserturm: [1250], spital: [1339], henkersteg: [1457], koenigstor: [1400], hbf: [1906], gnm: [1380], justiz: [1909], zeppelin: [1935], kongress: [1935], johannis: [1234],
  pellerhaus: [1602], fembohaus: [1591], tiergaertnertor: [1280], neutor: [1377], spittlertor: [1377], laufer: [1250], tucherschloss: [1533], luginsland: [1377], max_morlock_stadion: [1928], tiergarten: [1912], st_egidien: [1150], st_klara: [1270], katharinenruine: [1295], ehekarussell: [1984], neues_museum: [1999],
  fleischbruecke: [1596], synagoge: [1874, 1938], nassauer: [1250], martha: [1356], spielzeug: [1517], kunstbunker: [1380], felsengaenge: [1380], bratwurst: [1519], schlayer: [1419], mauthalle: [1498], hirsvogel: [1534], dstadion: [1937], luitpold: [1906], maerzfeld: [1937], ss_kaserne: [1937], meistersinger: [1963], ei: [1980], sinwell: [1250] };
LMS.forEach(l => { const y = Y0[l.id]; if (y) { l.y0 = y[0]; l.y1 = y[1]; } });
/* what a landmark looks like right now: era data, adjusted when the timeline slider is on a specific year */
function entryFor(l, era, year) {
  era = era || state.era; if (year === undefined) year = state.year;
  const e = l.eras[era];
  if (year != null && l.y0 != null) {
    if (year < l.y0) return ['absent', t('year_not_yet', { y: year, b: I.L(l).built }), ''];
    if (l.y1 && year < l.y1 && (e[0] === 'ruin' || e[0] === 'absent')) return ['standing', t('year_stood', { y: year }), ''];
  }
  return e;
}
const statusOf = (l, era) => entryFor(l, era)[0];

/* ---------- map ---------- */
const mapEl = $('#map');
const view = new NM.MapView(mapEl, $('#canvas'), {
  draw: (ctx, V) => { V.mpp; maybeHD(); B.draw(ctx, V, { ovl: ovlDraw(), style: state.style, era: state.era, destr: state.destr, statusOf: (l) => statusOf(l), route: state.route, leg: state.leg, d3: state.d3, hl: state.hl }); }
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
  p.innerHTML = '<button class="btn" type="button"><div class="body">' + icon(l) + '<span class="badge"></span></div></button><span class="lbl"></span>';
  const pb = p.querySelector('.btn'); let lastSel = 0;
  const pick = (e) => { e.stopPropagation(); if (view.moved) return; const t = Date.now(); if (t - lastSel < 400) return; lastSel = t; select(l.id, true); };
  pb.addEventListener('click', pick);
  pinsEl.appendChild(p); pinEls[l.id] = p;
});
function pinTexts() {
  LMS.forEach(l => { const p = pinEls[l.id], n = I.L(l).name; p.querySelector('.btn').setAttribute('aria-label', n); p.querySelector('.lbl').textContent = n.split(' (')[0]; });
}
function refreshPins() {
  LMS.forEach(l => {
    const st = statusOf(l), p = pinEls[l.id];
    p.className = 'pin st-' + st + (state.sel === l.id ? ' sel' : '');
    const ti = state.tour ? state.tour.t.ids.indexOf(l.id) : -1; if (ti >= 0) { p.dataset.n = ti + 1; p.classList.add('tour'); if (state.tour.i === ti) p.classList.add('cur'); } else delete p.dataset.n;
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
  b.innerHTML = '<span class="y"></span><span class="n"></span>';
  b.addEventListener('click', () => setEra(e.id)); erasEl.appendChild(b);
});
function eraTexts() { D.ERAS.forEach((e, i) => { const b = erasEl.children[i]; b.querySelector('.y').textContent = I.eraYear(e); b.querySelector('.n').textContent = I.eraName(e); }); }
const ANCHOR = { '1648': 1648, '1939': 1939, '1945': 1945, now: 2025 };
function eraForYear(y) { return y <= 1800 ? '1648' : y < 1945 ? '1939' : y < 1950 ? '1945' : 'now'; }
function caption() { const e = D.ERAS.find(x => x.id === state.era); $('#eraCaption').textContent = (state.year != null ? state.year : I.eraYear(e)) + ' · ' + I.eraName(e); }
function setEra(id, quiet, keepYear) {
  if (!keepYear) { state.year = null; const r = $('#tRange'); if (r) { r.value = year2pos(ANCHOR[id]); syncTime(); } }
  state.era = id; store.set('nm_era', id);
  document.body.className = document.body.className.replace(/era-\S+/, 'era-' + id);
  erasEl.querySelectorAll('button').forEach(b => { const on = b.dataset.era === id; b.classList.toggle('on', on); b.setAttribute('aria-selected', on); });
  caption();
  state.destrTarget = id === '1945' ? 1 : 0;
  animateDestr();
  refreshPins(); renderList(); renderOpenSheet(); view.render();
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
const fmtD = (m) => m < 950 ? Math.round(m / 10) * 10 + ' m' : (m / 1000).toFixed(m < 10000 ? 1 : 0) + ' km';
function rel(l) {
  if (!state.loc) return null;
  const d = hav(state.loc.lat, state.loc.lon, l.lat, l.lon), br = bearing(state.loc.lat, state.loc.lon, l.lat, l.lon);
  return { d, dir: t('dirs')[Math.round(br / 45) % 8], min: Math.max(1, Math.round(d / 80)) };
}
const isApple = /iPad|iPhone|iPod|Macintosh/.test(navigator.userAgent) && 'ontouchend' in document;

/* ---------- sheet ---------- */
const sheet = $('#sheet'), sheetBody = $('#sheetBody');
const hostOf = (u) => { try { return new URL(u).hostname.replace(/^www\./, ''); } catch (_) { return u; } };
function renderOpenSheet() { if (state.sel) renderSheet(); else if (state.bsel) renderBuilding(); }
/* ---- historic and modern photos (Wikimedia Commons, free licences; cached for offline use once seen) ---- */
function photoList(id) { const a = (NM.photos && NM.photos[id]) || []; return a.slice().sort((x, y) => (x.k === 'h' ? 0 : 1) - (y.k === 'h' ? 0 : 1)); }
const photoUrl = (p) => NM.photoBase + p.p;
function photoHtml(l) {
  const a = photoList(l.id); if (!a.length) return '';
  return '<div class="photos">' + a.map(p => '<figure><img src="' + esc(photoUrl(p)) + '" alt="' + esc(I.L(l).name + ' – ' + p.d) + '" crossorigin="anonymous" loading="lazy" decoding="async"><figcaption><b>' + esc(p.k === 'h' ? t('ph_hist') : t('ph_now')) + ' · ' + esc(p.d) + '</b> · ' + esc(p.a) + ' · ' + esc(p.l) + ' · <a href="https://commons.wikimedia.org/wiki/File:' + encodeURIComponent(p.f.replace(/ /g, '_')) + '" target="_blank" rel="noopener">Wikimedia Commons</a></figcaption></figure>').join('') + '</div>';
}
function renderSheet() {
  const l = byId[state.sel]; if (!l) return;
  const Lc = I.L(l), e = entryFor(l), st = e[0], S = D.STATUS[st], era = D.ERAS.find(x => x.id === state.era), cat = D.CATS[l.cat];
  const text = e[1] === l.eras[state.era][1] ? Lc.text(state.era) : e[1], badge = e[1] === l.eras[state.era][1] ? Lc.badge(state.era) : '';
  const r = rel(l), pt = state.sim ? t('pretend_tag') : '';
  let dist = '';
  if (r) dist = r.d < 25 ? t('right_here') : (r.d > 30000 ? t('from_here', { d: fmtD(r.d), p: pt }) : t('of_you', { d: fmtD(r.d), dir: r.dir, m: r.min, p: pt }));
  else dist = t('tap_target');
  const nav = isApple ? 'https://maps.apple.com/?daddr=' + l.lat + ',' + l.lon + '&dirflg=w' : 'https://www.google.com/maps/dir/?api=1&travelmode=walking&destination=' + l.lat + ',' + l.lon;
  const wk = I.lang === 'de' ? 'https://de.wikipedia.org/wiki/Special:Search?search=' + encodeURIComponent(Lc.name.split(' (')[0].split(' & ')[0]) : 'https://en.wikipedia.org/wiki/Special:Search?search=' + encodeURIComponent(l.wiki);
  const src = (D.SRC && D.SRC[l.id]) || [];
  sheetBody.innerHTML =
    '<span class="chip" style="--c:' + cat.color + '">' + esc(I.cat(l.cat)) + '</span>' +
    '<h2>' + esc(Lc.name) + '</h2><p class="sub">' + esc(Lc.blurb) + ' <span>(' + esc(Lc.built) + ')</span></p>' +
    '<div class="stat" style="--sc:' + S.color + '"><span class="dot"></span><b>' + esc(badge || I.status(st)) + '</b><span class="en">· ' + esc(state.year != null ? state.year : I.eraYear(era)) + ' ' + (era.id === 'now' && state.year == null ? '' : esc(I.eraName(era))) + '</span></div>' +
    '<p class="txt">' + esc(text) + '</p>' + photoHtml(l) +
    '<h3>' + esc(t('eras_h')) + '</h3><ul class="tl">' + D.ERAS.map(x => {
      const ee = l.eras[x.id], ss = D.STATUS[ee[0]];
      return '<li data-era="' + x.id + '" class="' + (x.id === state.era ? 'on' : '') + '" style="--sc:' + ss.color + '"><span class="dot"></span><span class="yr">' + esc(I.eraYear(x)) + '</span><span class="lb">' + esc(Lc.badge(x.id) || I.status(ee[0])) + '</span></li>';
    }).join('') + '</ul>' +
    (Lc.facts.length ? '<h3>' + esc(t('facts_h')) + '</h3><ul class="facts">' + Lc.facts.map(f => '<li>' + esc(f) + '</li>').join('') + '</ul>' : '') +
    '<div class="acts"><div class="dist">' + esc(dist) + '</div><a class="btn2" href="' + nav + '" target="_blank" rel="noopener">' + esc(t('directions')) + '</a>' +
    '<a class="btn2 alt" href="' + wk + '" target="_blank" rel="noopener">' + esc(t('read_more')) + '</a></div>' +
    (src.length ? '<h3>' + esc(t('sources_h')) + '</h3><ul class="srcs">' + src.map(u => '<li><a href="' + esc(u) + '" target="_blank" rel="noopener">' + esc(hostOf(u)) + '</a></li>').join('') + '</ul>' : '');
  sheetBody.querySelectorAll('.tl li').forEach(li => li.addEventListener('click', () => setEra(li.dataset.era)));
  sheetBody.querySelectorAll('.photos img').forEach(im => { im.addEventListener('error', () => { const f = im.closest('figure'); if (f) f.remove(); }); });
}
/* ---- any building: address / year / type from OpenStreetMap tags, plus an era note ---- */
let TAGMAP = null;
function tagMap() {
  if (TAGMAP) return TAGMAP; TAGMAP = {};
  const T = NM.btags; if (!T) return TAGMAP;
  let X = 0, Y = 0;
  T.t.forEach(r => {
    X += r[0]; Y += r[1];
    const m = G.ll2m(T.o[0] + X / 1e5, T.o[1] + Y / 1e5), b = B.hit(m[0], m[1], 4); if (!b) return;
    const tag = { street: r[2] >= 0 ? T.s[r[2]] : '', hn: r[3] || '', year: r[4] || 0, name: r[5] != null && r[5] >= 0 ? T.n[r[5]] : '', type: r[6] || '' };
    const cur = TAGMAP[b.i]; if (!cur || (!cur.name && tag.name) || (!cur.year && tag.year)) TAGMAP[b.i] = Object.assign({}, cur || {}, tag, { name: tag.name || (cur && cur.name) || '', year: tag.year || (cur && cur.year) || 0 });
  });
  return TAGMAP;
}
function renderBuilding() {
  const b = state.bsel; if (!b) return;
  const tg = tagMap()[b.i] || {}, bt = I.t('bt'), typ = tg.type ? (bt[tg.type] || tg.type) : ((b.f & 2) ? t('church') : '');
  const title = tg.name || (typ && typ !== bt.yes ? typ : t('bld'));
  const rows = [];
  if (tg.street || tg.hn) rows.push([t('addr'), (tg.street ? tg.street + ' ' : '') + tg.hn]);
  if (tg.year) rows.push([t('yr_built'), tg.year]);
  if (typ && typ !== title) rows.push([t('bld_type'), typ]);
  let note;
  if (state.era === '1648') note = (b.f & 1) ? t(B.evidence(b, '1648') === 'plan' ? 'ev1648_plan' : 'ev1648_est') : t('snap1648_out');
  else if (state.era === '1939') note = t(B.evidence(b, '1939') === 'plan' ? 'ev1939_plan' : 'ev1939_est');
  else if (state.era === '1945') { const c = B.dmgOf(b); note = c === 2 ? t('dmg2') : c === 1 ? t('dmg1') : c === 0 ? t('dmg0') : (B.isRubble(b) ? t('snap1945_ruin') : t('snap1945_ok')); }
  else note = t('snapnow');
  const era = D.ERAS.find(x => x.id === state.era);
  sheetBody.innerHTML =
    '<span class="chip" style="--c:#6a6455">' + esc(t('bld')) + '</span><h2>' + esc(title) + '</h2>' +
    (rows.length ? '<dl class="bi">' + rows.map(r => '<dt>' + esc(r[0]) + '</dt><dd>' + esc(r[1]) + '</dd>').join('') + '</dl><p class="sub">' + esc(t('osm_note')) + '</p>' : '<p class="sub">' + esc(t('no_info')) + '</p>') +
    '<h3>' + esc(t('snap')) + ' · ' + esc(state.year != null ? state.year : I.eraYear(era)) + '</h3><p class="txt">' + esc(note) + '</p>';
}
function showBuilding(b) {
  state.sel = null; state.bsel = b; state.hl = b; refreshPins(); renderBuilding();
  sheet.classList.add('open'); sheet.setAttribute('aria-hidden', 'false'); sheet.scrollTop = 0; closeList(); hideHint(); view.render();
  setTimeout(() => reveal(b.cx, b.cy, view.z), 30);
}
function reveal(x, y, z, ms) {
  const wide = window.innerWidth >= 900;
  const visTop = 70, visBot = wide ? view.h - erasEl.offsetHeight - 20 : view.h - erasEl.offsetHeight - sheet.offsetHeight;
  const cy = (visTop + visBot) / 2, cx = wide ? (view.w + 420) / 2 : view.w / 2;
  const k = Math.pow(2, z) / (156543.03392 * Math.cos(49.4541 * Math.PI / 180));
  view.flyTo(x - (cx - view.w / 2) / k, y + (cy - view.h / 2) / k, z, ms || 650);
}
function select(id, fly) {
  state.sel = id; state.bsel = null; state.hl = null; refreshPins(); renderSheet(); view.render();
  sheet.classList.add('open'); sheet.setAttribute('aria-hidden', 'false'); sheet.scrollTop = 0;
  closeList(); hideHint();
  if (fly) { const l = byId[id]; setTimeout(() => reveal(l.m[0], l.m[1], Math.max(view.z, 16.8)), 30); }
}
function closeSheet() { state.sel = null; state.bsel = null; state.hl = null; sheet.classList.remove('open'); sheet.setAttribute('aria-hidden', 'true'); refreshPins(); view.render(); }
$('#sheetX').addEventListener('click', closeSheet);
view.on('tap', (e) => {
  hideHint(); closeList(); closeTours();
  if (view.z >= 15.4) {
    const b = B.hit(e.world[0], e.world[1], Math.max(2.5, 7 * view.mpp));
    if (b && (b.lm >= 0 ? (state.era !== '1648' || (b.f & 1)) : B.shown(b, state.era))) {
      if (b.lm >= 0) { const lm = LMS[b.lm]; if (statusOf(lm) !== 'absent') { select(lm.id, true); return; } }
      else { showBuilding(b); return; }
    }
  }
  if (state.sel || state.bsel) closeSheet();
});
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
  const cats = [['all', t('all')]].concat(Object.keys(D.CATS).map(k => [k, I.cat(k)]));
  chipsEl.innerHTML = cats.map(c => '<button type="button" data-c="' + c[0] + '" class="' + (state.cat === c[0] ? 'on' : '') + '">' + esc(c[1]) + '</button>').join('');
}
chipsEl.addEventListener('click', (e) => { const b = e.target.closest('button'); if (!b) return; state.cat = b.dataset.c; renderChips(); renderList(); });
qEl.addEventListener('input', renderList);
function renderList() {
  const q = qEl.value.trim().toLowerCase();
  let arr = LMS.filter(l => (state.cat === 'all' || l.cat === state.cat) && (!q || (l.name + ' ' + l.blurb + ' ' + I.L(l).name + ' ' + I.L(l).blurb).toLowerCase().includes(q)));
  if (state.loc) arr = arr.slice().sort((a, b) => rel(a).d - rel(b).d);
  itemsEl.innerHTML = arr.map(l => {
    const st = statusOf(l), r = rel(l);
    return '<li data-id="' + l.id + '" style="--c:' + D.CATS[l.cat].color + ';--sc:' + D.STATUS[st].color + '"><div class="ic"><svg viewBox="0 0 24 24"><use href="#i-' + l.icon + '"/></svg></div><div><div class="nm">' + esc(I.L(l).name) + '</div><div class="mt">' + esc(I.cat(l.cat)) + (r ? ' · ' + fmtD(r.d) : '') + ' · ' + esc(entryFor(l)[2] === l.eras[state.era][2] ? (I.L(l).badge(state.era) || I.status(st)) : I.status(st)) + '</div></div><span class="sd"></span></li>';
  }).join('') || '<li><div class="mt">' + esc(t('no_matches')) + '</div></li>';
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
    nearestEl.hidden = false; nearestEl.textContent = (bd < 40 ? t('at_') : t('nearest_')) + I.L(best).name.split(' (')[0] + (bd < 40 ? '' : ' · ' + fmtD(bd)) + (sim ? t('pretend_short') : '');
    nearestEl.onclick = () => select(best.id, true);
  } else { nearestEl.hidden = false; nearestEl.textContent = t('from_nearest', { d: fmtD(bd) }) + (sim ? t('pretend_short') : ''); nearestEl.onclick = null; }
  renderOpenSheet(); if (listEl.classList.contains('open')) renderList();
  if (state.follow || !firstFix) {
    const m = G.ll2m(lon, lat);
    if (bd < 30000) view.flyTo(m[0], m[1], Math.max(view.z, 16.5), firstFix ? 400 : 800);
    else toast(t('far', { d: fmtD(bd) }), null, 5500);
    firstFix = true;
  }
  view.render();
}
function startLocate() {
  const btn = $('#bLocate');
  if (!navigator.geolocation) { toast(t('no_geo')); return; }
  state.follow = true; btn.classList.add('on'); firstFix = false;
  if (state.loc && !state.sim) { onLoc(state.loc.lat, state.loc.lon, state.loc.acc, state.loc.heading, false); }
  if (watchId != null) { if (state.sim) { navigator.geolocation.clearWatch(watchId); watchId = null; } else return; }
  watchId = navigator.geolocation.watchPosition(
    (p) => onLoc(p.coords.latitude, p.coords.longitude, p.coords.accuracy, p.coords.heading, false),
    (err) => { btn.classList.remove('on'); state.follow = false; watchId = null; toast(err.code === 1 ? t('blocked') : t('geo_fail'), null, 5000); },
    { enableHighAccuracy: true, maximumAge: 4000, timeout: 20000 });
}
$('#bLocate').addEventListener('click', startLocate);
view.on('longpress', (e) => {
  const ll = G.m2ll(e.world[0], e.world[1]), lat = +ll[1].toFixed(5), lon = +ll[0].toFixed(5);
  if (watchId != null) { navigator.geolocation.clearWatch(watchId); watchId = null; }
  firstFix = true; state.follow = false; $('#bLocate').classList.remove('on');
  onLoc(lat, lon, 15, null, true);
  const txt = lat + ', ' + lon;
  toast(t('pretend_loc', { c: txt }), { label: t('copy'), fn: () => { try { navigator.clipboard.writeText(txt); toast(t('copied', { c: txt })); } catch (_) { toast(txt); } } }, 6000);
});
$('#bZin').addEventListener('click', () => view.zoomBy(0.8));
$('#bZout').addEventListener('click', () => view.zoomBy(-0.8));

/* ---------- about ---------- */
const aboutEl = $('#about');
function renderAbout() {
  const st = D.STATUS;
  $('#aboutBody').innerHTML =
    '<h2>' + esc(t('about_h')) + '</h2><p>' + esc(t('about_intro')) + '</p>' +
    '<h3>' + esc(t('about_pins')) + '</h3><div class="legend">' + Object.keys(st).map(k => '<span><i style="background:' + st[k].color + '"></i>' + esc(I.status(k)) + '</span>').join('') + '</div>' +
    '<p>' + esc(t('about_pins_p')) + '</p>' +
    '<h3>' + esc(t('about_loc')) + '</h3><p>' + esc(t('about_loc_p')) + '</p>' +
    '<h3>' + esc(t('about_inst')) + '</h3><ul><li>' + t('about_ios') + '</li><li>' + t('about_and') + '</li><li>' + esc(t('about_off')) + ' <span id="offlineState"></span></li></ul>' +
    '<h3>' + esc(t('ph_h')) + '</h3><p>' + esc(t('ph_p')) + '</p><p><button type="button" class="btn2" id="phLoad">' + esc(t('ph_btn')) + '</button> <span id="phState"></span></p>' +
    '<h3>' + esc(t('about_map')) + '</h3><p>' + esc(t('about_map_p')) + '</p>' +
    '<p class="mt">' + esc(t('v_label')) + ' ' + (window.NM_VERSION || '1.7.0') + '</p>';
  checkOffline(); $('#phLoad').addEventListener('click', preloadPhotos);
}
async function preloadPhotos() {
  const all = []; Object.keys(NM.photos || {}).forEach(k => NM.photos[k].forEach(p => all.push(photoUrl(p)))); const st = $('#phState'), btn = $('#phLoad');
  if (!('caches' in window)) { st.textContent = t('ph_nocache'); return; }
  if (!confirm(t('ph_confirm', { n: all.length }))) return;
  btn.disabled = true; let done = 0, fail = 0;
  try {
    const c = await caches.open('nm-photos');
    for (let i = 0; i < all.length; i += 4) {
      await Promise.all(all.slice(i, i + 4).map(async (u) => { try { if (!(await c.match(u))) { const r = await fetch(u, { mode: 'cors' }); if (!r.ok) throw 0; await c.put(u, r); } } catch (_) { fail++; } done++; st.textContent = done + ' / ' + all.length; }));
    }
  } catch (_) { fail = all.length; }
  btn.disabled = false; st.textContent = fail ? t('ph_partial', { n: all.length - fail, m: all.length }) : t('ph_done', { n: all.length });
}
$('#bInfo').addEventListener('click', () => { renderAbout(); aboutEl.classList.add('open'); aboutEl.setAttribute('aria-hidden', 'false'); });
function closeAbout() { aboutEl.classList.remove('open'); aboutEl.setAttribute('aria-hidden', 'true'); }
$('#aboutX').addEventListener('click', closeAbout);
aboutEl.addEventListener('click', (e) => { if (e.target === aboutEl) closeAbout(); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { closeMaps(); closeAbout(); closeList(); closeTours(); closeSheet(); } });

/* ---------- service worker / offline ---------- */
function checkOffline() {
  const el = $('#offlineState'); if (!el) return;
  if (!('serviceWorker' in navigator) || !window.caches) { el.textContent = t('off_unsupported'); return; }
  caches.keys().then(k => { el.textContent = k.some(n => n.indexOf('nuremberg-map-') === 0) ? t('off_ready') : t('off_not'); });
}
if ('serviceWorker' in navigator && location.protocol !== 'file:') {
  const had = !!navigator.serviceWorker.controller;
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').then(() => { setTimeout(() => { checkOffline(); if (!had) toast(t('saved_off')); }, 2500); }).catch(() => {});
  });
  navigator.serviceWorker.addEventListener('controllerchange', () => { if (had) toast(t('updated'), { label: t('reload'), fn: () => location.reload() }, 9000); });
  if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {});
}

/* ---------- guided tours ---------- */
const TOURS = [
  { id: 'old', era: 'now', ids: ['kaiserburg', 'sinwell', 'durer', 'sebald', 'rathaus', 'hauptmarkt', 'frauenkirche', 'fleischbruecke', 'spital', 'henkersteg', 'lorenz', 'weisserturm'],
    en: ['Old-town highlights', 'From the castle down to the river and the great churches.'], de: ['Highlights der Altstadt', 'Von der Burg hinunter zum Fluss und zu den großen Kirchen.'] },
  { id: 'war', era: '1945', ids: ['luginsland', 'bratwurst', 'sebald', 'frauenkirche', 'nassauer', 'lorenz', 'mauthalle', 'katharinenruine', 'st_egidien', 'pellerhaus', 'tucherschloss', 'hirsvogel'],
    en: ['War and rebuilding', 'What the raid of 2 January 1945 destroyed, and what came back.'], de: ['Krieg und Wiederaufbau', 'Was der Luftangriff vom 2. Januar 1945 zerstörte und was wiederkam.'] },
  { id: 'walls', era: '1648', ids: ['koenigstor', 'spittlertor', 'weisserturm', 'schlayer', 'neutor', 'tiergaertnertor', 'laufer'],
    en: ['Walls and gates', 'The surviving towers and gates of the city fortifications.'], de: ['Mauern und Tore', 'Die erhaltenen Türme und Tore der Stadtbefestigung.'] },
  { id: 'nazi', era: '1939', ids: ['synagoge', 'justiz', 'ss_kaserne', 'luitpold', 'kongress', 'zeppelin', 'dstadion', 'maerzfeld'],
    en: ['Nazi era and the trials', 'The destroyed synagogue, the rally grounds and the courtroom of 1945-46. Long distances: plan to ride.'], de: ['NS-Zeit und die Prozesse', 'Die zerstörte Synagoge, das Reichsparteitagsgelände und der Gerichtssaal von 1945-46. Weite Strecken: besser mit dem Rad oder der Bahn.'] }
];
/* real routes along streets (computed from OpenStreetMap footways/roads and bike-legal ways), see js/routes.js */
const SPEED = { foot: 75, bike: 217 }; /* metres per minute: 4.5 km/h walking, 13 km/h cycling (moving time only, no stops) */
function decodeLeg(enc) { const o = []; let x = 0, y = 0; for (let i = 0; i < enc.length; i += 2) { x += enc[i]; y += enc[i + 1]; o.push(B.ll2m(x / 1e5, y / 1e5)); } return o; }
TOURS.forEach(T => {
  T.legs = {}; T.dist = {}; T.min = {};
  ['foot', 'bike'].forEach(m => {
    const r = (NM.routes || {})[m + '_' + T.id] || []; T.legs[m] = r.map((lg, k) => { const a = byId[T.ids[k]].m, b = byId[T.ids[k + 1]].m, pts = decodeLeg(lg[1]); return { m: lg[0], pts: [a].concat(pts, [b]) }; });
    T.dist[m] = T.legs[m].reduce((s, l) => s + l.m, 0); T.min[m] = Math.round(T.dist[m] / SPEED[m]);
  });
});
function fmtMin(n) { return n >= 60 ? Math.floor(n / 60) + ' h ' + String(n % 60).padStart(2, '0') + ' min' : n + ' min'; }
function fmtDist(m) { return m >= 1000 ? (m / 1000).toFixed(1) + ' km' : Math.round(m / 10) * 10 + ' m'; }
const toursEl = $('#tours'), pillEl = $('#tourpill');
function renderTours() {
  $('#toursH').textContent = t('tours_h');
  const md = state.tmode;
  $('#tourItems').innerHTML = '<li class="tm"><button type="button" data-m="foot" class="' + (md === 'foot' ? 'on' : '') + '">' + esc(t('m_foot')) + '</button><button type="button" data-m="bike" class="' + (md === 'bike' ? 'on' : '') + '">' + esc(t('m_bike')) + '</button></li>' +
    TOURS.map(T => { const x = T[I.lang]; return '<li data-t="' + T.id + '"><div class="nm">' + esc(x[0]) + '</div><div class="mt">' + esc(x[1]) + '</div><div class="mt b">' + esc(t('tour_stops', { n: T.ids.length, m: (T.dist[md] / 1000).toFixed(1) })) + ' · ' + esc(t('tour_time', { t: fmtMin(T.min[md]) })) + ' · ' + esc(I.eraYear(D.ERAS.find(e => e.id === T.era))) + '</div><button type="button" class="btn2">' + esc(t('tour_start')) + '</button></li>'; }).join('') + '<li class="note">' + esc(t('tour_note')) + '</li>';
}
function openTours() { renderTours(); closeList(); toursEl.classList.add('open'); toursEl.setAttribute('aria-hidden', 'false'); }
function closeTours() { toursEl.classList.remove('open'); toursEl.setAttribute('aria-hidden', 'true'); }
$('#bTour').addEventListener('click', () => toursEl.classList.contains('open') ? closeTours() : openTours());
$('#toursX').addEventListener('click', closeTours);
$('#tourItems').addEventListener('click', (e) => { const mb = e.target.closest('button[data-m]'); if (mb) { setTMode(mb.dataset.m); renderTours(); return; } const li = e.target.closest('li[data-t]'); if (li) startTour(li.dataset.t); });
function setTMode(m) { state.tmode = m; store.set('nm_tmode', m); if (state.tour) { setRoute(); tourPill(); view.render(); } }
function setRoute() { const tr = state.tour, L = tr.t.legs[state.tmode]; state.route = [].concat(...L.map(l => l.pts)); const k = Math.min(tr.i, L.length - 1) - (tr.i >= L.length ? 0 : 0); state.leg = tr.i < L.length ? L[tr.i].pts : L[L.length - 1].pts; }
function startTour(id) {
  const T = TOURS.find(x => x.id === id); if (!T) return;
  closeTours(); closeSheet();
  state.tour = { t: T, i: 0 };
  setRoute();
  setEra(T.era, true);
  tourGo(0);
}
function tourGo(i) {
  const tr = state.tour; if (!tr) return;
  tr.i = Math.max(0, Math.min(tr.t.ids.length - 1, i)); setRoute();
  select(tr.t.ids[tr.i], true); tourPill();
}
function tourPill() {
  const tr = state.tour; pillEl.hidden = !tr; if (!tr) return;
  const L = tr.t.legs[state.tmode], nx = tr.i < L.length ? L[tr.i] : null, md = state.tmode;
  $('#tpLabel').innerHTML = '<b>' + esc(t('tour_stop', { i: tr.i + 1, n: tr.t.ids.length })) + '</b><small>' + esc(nx ? t('tour_leg', { d: fmtDist(nx.m), t: fmtMin(Math.max(1, Math.round(nx.m / SPEED[md]))) }) : t('tour_last', { d: fmtDist(tr.t.dist[md]), t: fmtMin(tr.t.min[md]) })) + '</small>';
  $('#tpMode').textContent = t(md === 'foot' ? 'm_foot' : 'm_bike');
  $('#tpPrev').textContent = '‹ ' + t('tour_prev'); $('#tpNext').textContent = t('tour_next') + ' ›'; $('#tpEnd').textContent = t('tour_end');
  $('#tpPrev').disabled = tr.i === 0; $('#tpNext').disabled = tr.i === tr.t.ids.length - 1;
}
function endTour() { state.tour = null; state.route = null; state.leg = null; pillEl.hidden = true; refreshPins(); view.render(); }
$('#tpPrev').addEventListener('click', () => tourGo(state.tour.i - 1));
$('#tpNext').addEventListener('click', () => tourGo(state.tour.i + 1));
$('#tpEnd').addEventListener('click', endTour);
$('#tpMode').addEventListener('click', () => setTMode(state.tmode === 'foot' ? 'bike' : 'foot'));

/* ---------- timeline slider (1450 to today) ----------
   The slider position is NOT linear in years: the four map eras sit at fixed marks so the printed labels line up exactly. */
const TSTOPS = [[1450, 0], [1648, 250], [1939, 640], [1945, 740], [2025, 1000]];
function pos2year(p) { for (let i = 1; i < TSTOPS.length; i++) if (p <= TSTOPS[i][1]) { const a = TSTOPS[i - 1], b = TSTOPS[i]; return Math.round(a[0] + (b[0] - a[0]) * (p - a[1]) / (b[1] - a[1])); } return 2025; }
function year2pos(y) { for (let i = 1; i < TSTOPS.length; i++) if (y <= TSTOPS[i][0]) { const a = TSTOPS[i - 1], b = TSTOPS[i]; return Math.round(a[1] + (b[1] - a[1]) * (y - a[0]) / (b[0] - a[0])); } return 1000; }
const timeEl = $('#timebar'), tRange = $('#tRange');
function syncTime() {
  const y = pos2year(+tRange.value); $('#tYear').textContent = y >= 2025 ? I.eraYear(D.ERAS[3]) : y;
  const e = D.ERAS.find(x => x.id === eraForYear(y)); $('#tName').textContent = I.eraName(e);
  const pct = +tRange.value / 10; tRange.style.setProperty('--p', pct + '%');
}
tRange.addEventListener('input', () => {
  const y = pos2year(+tRange.value); state.year = y >= 2025 ? null : y; syncTime();
  const era = eraForYear(y);
  if (era !== state.era) setEra(era, true, true);
  else { caption(); refreshPins(); renderList(); renderOpenSheet(); view.render(); }
});
$('#bTime').addEventListener('click', () => { if (typeof closeMaps === 'function') closeMaps(); const on = timeEl.classList.toggle('open'); $('#bTime').classList.toggle('on', on); document.body.classList.toggle('timeopen', on); });

/* ---------- old maps overlay ---------- */
const mapsEl = $('#mapsP');
const OVL = { id: null, alpha: Math.min(1, Math.max(0.1, parseFloat(store.get('nm_ova', '0.7')) || 0.7)), img: null, hd: null, hdBusy: false, hdTried: {}, st: '' };
const imgP = {};
function loadImg(url) {
  if (!imgP[url]) imgP[url] = new Promise((res, rej) => { const im = new Image(); im.crossOrigin = 'anonymous'; im.onload = () => res(im); im.onerror = () => { delete imgP[url]; rej(new Error('load')); }; im.src = url; });
  return imgP[url];
}
function curMap() { return OVL.id ? NM.maps.find(x => x.id === OVL.id) : null; }
function ovlDraw() {
  const m = curMap(); if (!m) return null; const img = OVL.hd || OVL.img; if (!img) return null;
  return { img, M: m.M, rw: m.rw, rh: m.rh, clip: m.clip, alpha: OVL.alpha };
}
function maybeHD() {
  const m = curMap(); if (!m || !m.u2 || OVL.hd || OVL.hdBusy || OVL.hdTried[m.id] || !OVL.img || view.mpp > 3.2) return;
  OVL.hdBusy = true; OVL.hdTried[m.id] = true; OVL.st = 'hd'; mapStatus();
  loadImg(m.u2).then(im => { if (OVL.id === m.id) { OVL.hd = im; OVL.st = 'sharp'; mapStatus(); view.render(); } OVL.hdBusy = false; }, () => { OVL.hdBusy = false; if (OVL.id === m.id) { OVL.st = 'ok'; mapStatus(); } });
}
function selectMap(id) {
  OVL.id = id || null; OVL.img = null; OVL.hd = null; OVL.hdBusy = false; OVL.st = '';
  $('#bMap').classList.toggle('on', !!id);
  const m = curMap();
  if (m) {
    OVL.st = 'loading';
    loadImg(m.u1).then(im => { if (OVL.id === m.id) { OVL.img = im; OVL.st = 'ok'; mapStatus(); view.render(); maybeHD(); } }, () => { if (OVL.id === m.id) { OVL.st = 'err'; mapStatus(); toast(t('maps_err'), null, 6000); } });
  }
  renderMaps(); view.render();
}
function mapStatus() {
  const el = $('#mStatus'); if (!el) return;
  el.textContent = OVL.st === 'loading' ? t('maps_loading') : OVL.st === 'hd' ? t('maps_hd') : OVL.st === 'sharp' ? t('maps_sharp') : OVL.st === 'err' ? t('maps_err') : OVL.st === 'ok' ? t('maps_ok') : '';
}
function mapYr(m) { return I.lang === 'de' ? m.yr.replace('c. ', 'um ') : m.yr; }
function renderMaps() {
  const m = curMap(), de = I.lang === 'de';
  mapsEl.innerHTML =
    '<div class="mh"><b>' + esc(t('maps_h')) + '</b><button class="x" id="mapsX" type="button" aria-label="' + esc(t('close')) + '">&times;</button></div>' +
    '<div class="mchips"><button type="button" data-m=""' + (m ? '' : ' class="on"') + '>' + esc(t('maps_off')) + '<small>&nbsp;</small></button>' +
    NM.maps.map(x => '<button type="button" data-m="' + x.id + '"' + (m && m.id === x.id ? ' class="on"' : '') + '>' + esc(mapYr(x)) + '<small>' + esc(de ? x.de : x.en) + '</small></button>').join('') + '</div>' +
    (m ? '<div class="mn">' + esc(de ? m.de : m.en) + ' · ' + esc(mapYr(m)) + '</div><div class="mnote">' + esc(de ? m.nde : m.nen) + '</div>' +
      '<div class="mop"><span>' + esc(t('maps_op')) + '</span><input id="mAlpha" type="range" min="10" max="100" step="1" value="' + Math.round(OVL.alpha * 100) + '" aria-label="' + esc(t('maps_op')) + '"><span id="mPct">' + Math.round(OVL.alpha * 100) + '%</span></div>' +
      '<div class="mst" id="mStatus"></div><div class="msrc">' + esc(t('maps_src')) + ': <a href="' + m.page + '" target="_blank" rel="noopener">' + esc(de ? m.cde : m.cen) + '</a></div>'
      : '<div class="mnote">' + esc(t('maps_hint')) + '</div>');
  mapStatus();
}
mapsEl.addEventListener('click', (e) => {
  const bt = e.target.closest('button'); if (!bt) return;
  if (bt.id === 'mapsX') { closeMaps(); return; }
  if (bt.dataset.m !== undefined) selectMap(bt.dataset.m);
});
mapsEl.addEventListener('input', (e) => { if (e.target.id === 'mAlpha') { OVL.alpha = e.target.value / 100; store.set('nm_ova', String(OVL.alpha)); $('#mPct').textContent = e.target.value + '%'; view.render(); } });
function openMaps() { renderMaps(); timeEl.classList.remove('open'); $('#bTime').classList.remove('on'); document.body.classList.remove('timeopen'); mapsEl.classList.add('open'); mapsEl.setAttribute('aria-hidden', 'false'); document.body.classList.add('mapsopen'); }
function closeMaps() { mapsEl.classList.remove('open'); mapsEl.setAttribute('aria-hidden', 'true'); document.body.classList.remove('mapsopen'); }
$('#bMap').addEventListener('click', () => mapsEl.classList.contains('open') ? closeMaps() : openMaps());

/* ---------- language ---------- */
function applyStatic() {
  const q = (s) => document.querySelector(s), set = (s, a, v) => { const el = q(s); if (el) el.setAttribute(a, v); };
  styleSeg.querySelector('[data-style=modern]').textContent = t('style_modern'); styleSeg.querySelector('[data-style=old]').textContent = t('style_old');
  $('#hint').textContent = t('hint'); q('#list h2').textContent = t('landmarks'); qEl.placeholder = t('search');
  set('#bLocate', 'aria-label', t('locate')); set('#bList', 'aria-label', t('list_aria')); set('#bInfo', 'aria-label', t('info_aria')); set('#bZin', 'aria-label', t('zin')); set('#bZout', 'aria-label', t('zout'));
  set('#bLang', 'aria-label', t('lang_aria')); set('#bTour', 'aria-label', t('tours')); set('#bTime', 'aria-label', t('time_aria')); set('#bMap', 'aria-label', t('maps_h'));
  ['#sheetX', '#listX', '#aboutX', '#toursX'].forEach(x => set(x, 'aria-label', t('close')));
  sync3d();
  $('#bLang').textContent = I.lang === 'de' ? 'EN' : 'DE';
  $('#tTitle').textContent = t('time_h'); $('#tHint').textContent = t('time_hint');
  q('.brand .t1').textContent = I.lang === 'de' ? 'Nürnberg' : 'Nuremberg';
}
function setLang(l) {
  I.setLang(l); applyStatic(); eraTexts(); caption(); pinTexts(); renderChips(); renderList(); renderTours(); tourPill(); syncTime(); renderOpenSheet(); if (aboutEl.classList.contains('open')) renderAbout(); if (mapsEl.classList.contains('open')) renderMaps();
  if (state.loc) onLoc(state.loc.lat, state.loc.lon, state.loc.acc, state.loc.heading, state.sim);
}
function sync3d() { const b = $('#b3d'); b.textContent = state.d3 ? '3D' : '2D'; b.setAttribute('aria-label', t('d3_aria')); b.classList.toggle('on', state.d3); }
$('#b3d').addEventListener('click', () => { state.d3 = !state.d3; store.set('nm_d3', state.d3 ? '1' : '0'); sync3d(); view.render(); });
sync3d();
$('#bLang').addEventListener('click', () => setLang(I.lang === 'de' ? 'en' : 'de'));

/* ---------- init ---------- */
setStyle(state.style);
applyStatic(); eraTexts(); pinTexts(); renderTours();
setEra(state.era, true);
setTimeout(pulsePins, 600);
window.NM.app = { state, view, select, setEra, setStyle, setLang, showBuilding, startTour, tourGo, endTour };
})();
