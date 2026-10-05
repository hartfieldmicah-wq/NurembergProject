/* basemap.js - renders the REAL OpenStreetMap geometry (js/osm-data.js) in two styles (modern / old engraved map)
   and four eras (1648, 1939, 1945 rubble, today). Map data (c) OpenStreetMap contributors, ODbL. */
(function (global) {
'use strict';
const NM = global.NM = global.NM || {};
const D = NM.data, O = NM.osm;
const RAD = Math.PI / 180;

/* ---------- local metre frame (same origin the data was projected with) ---------- */
const ORIGIN = { lon: O.o[0], lat: O.o[1] };
const MY = 110574, MX = 111320 * Math.cos(ORIGIN.lat * RAD);
const ll2m = (lon, lat) => [(lon - ORIGIN.lon) * MX, (lat - ORIGIN.lat) * MY];
const m2ll = (x, y) => [ORIGIN.lon + x / MX, ORIGIN.lat + y / MY];
NM.geo = { ORIGIN, ll2m, m2ll, MX, MY };

function hash(i) { let h = Math.imul(i + 1, 0x9E3779B1); h ^= h >>> 15; h = Math.imul(h, 0x85EBCA6B); h ^= h >>> 13; return (h >>> 0) / 4294967296; }
function dec(a, s) {
  const n = (a.length - s) >> 1, out = new Float32Array(n * 2); let x = 0, y = 0;
  for (let i = 0; i < n; i++) { x += a[s + 2 * i]; y += a[s + 2 * i + 1]; out[2 * i] = x / 10; out[2 * i + 1] = y / 10; }
  return out;
}
function bb(o, p) {
  let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
  for (let i = 0; i < p.length; i += 2) { const x = p[i], y = p[i + 1]; if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
  o.x0 = Math.min(o.x0 === undefined ? 1e9 : o.x0, x0); o.x1 = Math.max(o.x1 === undefined ? -1e9 : o.x1, x1);
  o.y0 = Math.min(o.y0 === undefined ? 1e9 : o.y0, y0); o.y1 = Math.max(o.y1 === undefined ? -1e9 : o.y1, y1);
  return o;
}

/* ---------- decode ---------- */
const BLD = [];
O.b.forEach((a, i) => {
  const p = dec(a, 1), n = p.length / 2; let cx = 0, cy = 0, A = 0;
  for (let k = 0; k < n; k++) { const x = p[2 * k], y = p[2 * k + 1], x2 = p[2 * ((k + 1) % n)], y2 = p[2 * ((k + 1) % n) + 1]; cx += x; cy += y; A += x * y2 - x2 * y; }
  cx /= n; cy /= n;
  BLD.push(bb({ p, i, f: a[0], cx, cy, ar: Math.abs(A) / 2, r: hash(i), lm: -1, dd: Math.hypot(cx, cy) }, p));
});
const ROAD = [[], [], [], [], [], [], [], []];
O.road.forEach(a => { const c = a[0] & 7, p = dec(a, 1); if (p.length >= 4) ROAD[c].push(bb({ p }, p)); });
const RAIL = O.rail.map(a => { const p = dec(a, 0); return bb({ p }, p); });
const WW = O.ww.map(a => { const p = dec(a, 1); return bb({ c: a[0], p }, p); });
const WATER = O.water.map(f => { const o = { rs: f.map(r => dec(r, 0)) }; o.rs.forEach(r => bb(o, r)); return o; });
const GREEN = O.green.map(f => { const o = { t: f[0], rs: f.slice(1).map(r => dec(r, 0)) }; o.rs.forEach(r => bb(o, r)); return o; });
const WALL = O.wall.map(a => dec(a, 0));
const RING = O.ring;
const TOWERS = (function () {
  const t0 = []; WALL.forEach(p => { let acc = 60; for (let i = 0; i + 3 < p.length; i += 2) { const dx = p[i + 2] - p[i], dy = p[i + 3] - p[i + 1], L = Math.hypot(dx, dy); let d = 0; while (acc + (L - d) >= 75) { d += 75 - acc; acc = 0; t0.push([p[i] + dx * d / L, p[i + 1] + dy * d / L]); } acc += L - d; } });
  const t = [], grid = {}; t0.forEach(q => { const gx = Math.floor(q[0] / 70), gy = Math.floor(q[1] / 70); for (let a = -1; a <= 1; a++) for (let b = -1; b <= 1; b++) { const c = grid[(gx + a) + ',' + (gy + b)]; if (c && c.some(w => Math.hypot(w[0] - q[0], w[1] - q[1]) < 70)) return; } (grid[gx + ',' + gy] = grid[gx + ',' + gy] || []).push(q); t.push(q); });
  return t;
})();


/* ---------- star bastions (1648) generated along the outer wall ring ---------- */
const BAST = (function () {
  const P = RING.map(q => [q[0], q[1]]); let A = 0;
  for (let i = 0; i < P.length; i++) { const a = P[i], b = P[(i + 1) % P.length]; A += a[0] * b[1] - b[0] * a[1]; }
  const sg = A > 0 ? 1 : -1, out = []; let acc = 150;
  const sh = [[-62, -16], [-62, 16], [-28, 70], [0, 108], [28, 70], [62, 16], [62, -16]];
  for (let i = 0; i < P.length; i++) {
    const a = P[i], b = P[(i + 1) % P.length], dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy); if (!L) continue;
    const tx = dx / L, ty = dy / L, nx = sg * ty, ny = -sg * tx; let d = 0;
    while (acc + (L - d) >= 290) { d += 290 - acc; acc = 0; const px = a[0] + tx * d, py = a[1] + ty * d;
      const T = (s) => sh.map(q => [px + tx * q[0] * s + nx * q[1] * s, py + ty * q[0] * s + ny * q[1] * s]);
      out.push({ o: T(1), g: T(1.24) }); }
    acc += L - d;
  }
  return out;
})();

/* ---------- oblique "bird's-eye" houses (old map) ---------- */
function prep3d(b) {
  if (b.h) return; const p = b.p, n = p.length / 2; let A = 0, bl = 0, bx = 1, by = 0;
  for (let i = 0; i < n; i++) { const x = p[2 * i], y = p[2 * i + 1], j = (i + 1) % n, x2 = p[2 * j], y2 = p[2 * j + 1]; A += x * y2 - x2 * y; const l = Math.hypot(x2 - x, y2 - y); if (l > bl) { bl = l; bx = (x2 - x) / l; by = (y2 - y) / l; } }
  b.ccw = A > 0; b.h = Math.min(24, 7 + Math.sqrt(b.ar) * 0.32) * ((b.f & 2) ? 1.7 : 1);
  let mn = 1e9, mx = -1e9; for (let i = 0; i < n; i++) { const d = (p[2 * i] - b.cx) * bx + (p[2 * i + 1] - b.cy) * by; if (d < mn) mn = d; if (d > mx) mx = d; }
  b.rdx = bx; b.rdy = by; b.r0 = mn * 0.78; b.r1 = mx * 0.78;
}
function shade(hex, f) { const n = parseInt(hex.slice(1), 16); const c = (v) => Math.max(0, Math.min(255, Math.round(v * f))); return 'rgb(' + c(n >> 16) + ',' + c((n >> 8) & 255) + ',' + c(n & 255) + ')'; }
function drawOblique(ctx, T, V, PT, lo, mpp, pal) {
  const k = V.k, w = 0.8 / k; ctx.lineWidth = w; ctx.strokeStyle = pal.ink; ctx.lineJoin = 'round';
  const hatch = (pal.hatch && !lo && mpp < 6) ? patFill(ctx, PT.hatch, V) : null;
  for (const b of T) {
    prep3d(b); const lc = b.lc, off = Math.max(b.h * (lc ? 0.95 : 0.6), mpp * (lc ? 3.2 : 2.2)), p = b.p, n = p.length / 2, ch = b.f & 2;
    ctx.beginPath();
    for (let i = 0; i < n; i++) { const j = (i + 1) % n, x = p[2 * i], y = p[2 * i + 1], x2 = p[2 * j], y2 = p[2 * j + 1], dx = x2 - x;
      if (b.ccw ? dx > 0 : dx < 0) { ctx.moveTo(x, y); ctx.lineTo(x2, y2); ctx.lineTo(x2, y2 + off); ctx.lineTo(x, y + off); ctx.closePath(); } }
    ctx.fillStyle = lc ? shade(lc, .62) : ch ? pal.cwall : pal.wall; ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(p[0], p[1] + off); for (let i = 1; i < n; i++) ctx.lineTo(p[2 * i], p[2 * i + 1] + off); ctx.closePath();
    ctx.fillStyle = lc ? lc : ch ? pal.croof : pal.roof; ctx.fill(); if (hatch && !lc) { ctx.fillStyle = hatch; ctx.fill(); } ctx.stroke();
    if (!lo && mpp < 3.5) { ctx.beginPath(); ctx.moveTo(b.cx + b.rdx * b.r0, b.cy + b.rdy * b.r0 + off); ctx.lineTo(b.cx + b.rdx * b.r1, b.cy + b.rdy * b.r1 + off); ctx.stroke(); }
  }
}

/* ---------- landmarks and their real buildings ---------- */
const LM = D.LANDMARKS.map(l => Object.assign({ m: ll2m(l.lon, l.lat) }, l));
const ASSOC = { kaiserburg: [110, .06], durer: [16, .3], frauenkirche: [30, .5], sebald: [45, .5], lorenz: [55, .5], rathaus: [50, .4],
  weisserturm: [20, .5], spital: [45, .3], henkersteg: [25, .15], koenigstor: [25, .3], hbf: [140, .2], gnm: [110, .15],
  justiz: [90, .3], zeppelin: [150, .05], kongress: [260, .5],
  pellerhaus: [28, .4], fembohaus: [16, .3], tucherschloss: [26, .3], st_egidien: [40, .5], st_klara: [30, .5], martha: [20, .5], katharinenruine: [30, .5],
  nassauer: [12, .4], mauthalle: [35, .5], spielzeug: [12, .4], meistersinger: [70, .3], neues_museum: [40, .4], max_morlock_stadion: [150, .1],
  tiergaertnertor: [14, .4], neutor: [20, .3], spittlertor: [14, .5], laufer: [12, .5], luginsland: [30, .25], hirsvogel: [14, .5] };
LM.forEach((l, li) => {
  l.bl = []; const c = ASSOC[l.id]; if (!c) return;
  let mx = 0; const cand = [];
  BLD.forEach(b => { if (Math.hypot(b.cx - l.m[0], b.cy - l.m[1]) < c[0]) { cand.push(b); if (b.ar > mx) mx = b.ar; } });
  cand.forEach(b => { if (b.ar >= c[1] * mx && b.lm < 0) { b.lm = li; l.bl.push(b); } });
});
const LMB = BLD.filter(b => b.lm >= 0);

/* ---------- styles ---------- */
const INK = '#2b2923';
const M = { bg: '#f1eee6', park: '#cfe5bf', forest: '#bcd8a6', cem: '#c8dcc2', rec: '#d9e9c7', water: '#a9d3ec', waterEdge: '#86b9d9',
  bld: '#dfd6c9', bldEdge: '#c4b9a8', church: '#d3bfb4', rubble: '#a99682', rubbleDot: '#5a4d40', rubbleEdge: '#7d6c5a',
  rail: '#9a9a9a', wall: '#8b6e4e', tower: '#d9c7a8', label: '#575047', halo: 'rgba(255,255,255,.85)', river: '#4a86ad',
  rc: [['#d9a266', '#f7c9a0'], ['#d3b45f', '#fde7a8'], ['#c7c0b2', '#ffffff'], ['#cfc9bd', '#ffffff'], ['#d3cdc1', '#ffffff'], ['#dcd6ca', '#f3efe7'], ['#dad4c8', '#fbfaf7'], ['#e4ddd1', '#e4ddd1']] };
const OLD = { wash: '#e8e1c8', park: '#dcd6b4', forest: '#d3cdaa', water: '#cfd5c4', paper: '#f1ecd9', rubble: '#a89a78', label: INK, halo: 'rgba(233,227,205,.9)' };
const RW = [[16, 3.4, 2], [13, 3, 1.9], [11, 2.5, 1.8], [9, 2.1, 1.7], [7, 1.7, 1.6], [6, 1.5, 1.5], [4, 1.1, 1.3], [2.2, .8, 0]];   // [real metres, min px, casing px]
const RV = [4.6, 3.2, 2.6, 2.2, 1.9, 1.7, 1.2, 0.9];   // road visible when mpp < ... (inverse listed below)
const ROADMAX = [99, 99, 30, 14, 7, 5, 2.6, 1.6];

let paper = null, PAT = null;
function paperPattern(ctx) {
  if (paper) return paper;
  const c = document.createElement('canvas'); c.width = c.height = 512;
  const g = c.getContext('2d'); let s = 7; const r = () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
  g.fillStyle = '#e9e3cd'; g.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 45; i++) { const x = r() * 512, y = r() * 512, rad = 30 + r() * 90, gr = g.createRadialGradient(x, y, 0, x, y, rad); const d = r() < .5; gr.addColorStop(0, d ? 'rgba(110,95,60,.06)' : 'rgba(255,252,235,.10)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(x - rad, y - rad, rad * 2, rad * 2); }
  for (let i = 0; i < 7000; i++) { g.fillStyle = 'rgba(80,70,40,' + (0.03 + r() * 0.08) + ')'; g.fillRect(r() * 512, r() * 512, 1 + r() * 1.2, 1); }
  paper = { pattern: ctx.createPattern(c, 'repeat') }; return paper;
}
function patterns(ctx, dpr) {
  if (PAT && PAT.dpr === dpr) return PAT;
  const mk = (w, h, fn) => { const c = document.createElement('canvas'); c.width = Math.round(w * dpr); c.height = Math.round(h * dpr); const g = c.getContext('2d'); g.scale(dpr, dpr); fn(g, w, h); return ctx.createPattern(c, 'repeat'); };
  PAT = { dpr,
    hatch: mk(4.5, 4.5, (g, w, h) => { g.strokeStyle = 'rgba(43,41,35,.62)'; g.lineWidth = 0.9; g.beginPath(); g.moveTo(-1, h + 1); g.lineTo(w + 1, -1); g.moveTo(-1 - w / 2, h / 2 + 1); g.lineTo(w / 2 + 1, -1 - h / 2 + 0); g.moveTo(w / 2 - 1, h + 1); g.lineTo(w + w / 2 + 1, h / 2 - 1); g.stroke(); }),
    waves: mk(7, 4, (g, w, h) => { g.strokeStyle = 'rgba(43,41,35,.55)'; g.lineWidth = 0.7; g.beginPath(); g.moveTo(0, h / 2); g.quadraticCurveTo(w / 4, h / 2 - 1.3, w / 2, h / 2); g.quadraticCurveTo(w * 3 / 4, h / 2 + 1.3, w, h / 2); g.stroke(); }),
    trees: mk(11, 11, (g, w, h) => { g.strokeStyle = 'rgba(43,41,35,.7)'; g.lineWidth = 0.8; g.beginPath(); g.arc(3, 3.5, 2.4, 0, 6.3); g.moveTo(8.8, 8.8); g.arc(8.2, 9, 2.2, 0, 6.3); g.stroke(); }),
    dots: mk(6, 6, (g) => { g.fillStyle = 'rgba(43,41,35,.5)'; g.beginPath(); g.arc(1.5, 1.5, .6, 0, 6.3); g.arc(4.5, 4.5, .5, 0, 6.3); g.fill(); })
  };
  return PAT;
}
function patFill(ctx, pat, V) { try { pat.setTransform(new DOMMatrix().scale(1 / (V.dpr * V.k))); } catch (_) {} return pat; }

/* ---------- drawing helpers ---------- */
function poly(ctx, p, close) { ctx.moveTo(p[0], p[1]); for (let i = 2; i < p.length; i += 2) ctx.lineTo(p[i], p[i + 1]); if (close) ctx.closePath(); }
function rubblePoly(b) {
  if (b.rp) return b.rp; const p = b.p, q = new Float32Array(p.length); let s = (b.r * 99991) | 0;
  const rnd = () => { s = (Math.imul(s, 1103515245) + 12345) | 0; return ((s >>> 8) & 1023) / 1024 - 0.5; };
  for (let i = 0; i < p.length; i += 2) { const k = 0.82 + rnd() * 0.12; q[i] = b.cx + (p[i] - b.cx) * k + rnd() * 2.2; q[i + 1] = b.cy + (p[i + 1] - b.cy) * k + rnd() * 2.2; }
  return (b.rp = q);
}
function label(ctx, txt, sx, sy, size, old, spacing, ang, color, halo) {
  ctx.save(); ctx.translate(sx, sy); if (ang) ctx.rotate(ang);
  ctx.font = (old ? 'italic ' : '600 ') + size + 'px ' + (old ? '"Iowan Old Style","Palatino Linotype",Palatino,Georgia,serif' : '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif');
  ctx.textBaseline = 'middle'; ctx.textAlign = 'left'; ctx.lineJoin = 'round'; ctx.lineWidth = 3.5; ctx.strokeStyle = halo; ctx.fillStyle = color;
  const ch = [...txt]; let w = 0; const ws = ch.map(c => { const m = ctx.measureText(c).width + spacing; w += m; return m; });
  let x = -w / 2; ch.forEach((c, i) => { ctx.strokeText(c, x, 0); ctx.fillText(c, x, 0); x += ws[i]; }); ctx.restore();
}
function nearestVertex(list, x, y) { let best = null, bd = 1e12; list.forEach(o => { const p = o.p; for (let i = 0; i < p.length; i += 2) { const d = (p[i] - x) ** 2 + (p[i + 1] - y) ** 2; if (d < bd) { bd = d; best = [p[i], p[i + 1], i, p]; } } }); return best; }
const PEG = (function () { const r = WW.filter(w => w.c === 0); const a = ll2m(11.0760, 49.4529); const v = nearestVertex(r, a[0], a[1]); if (!v) return null; const p = v[3], i = Math.min(Math.max(v[2], 2), p.length - 4); let ag = Math.atan2(p[i + 3] - p[i - 1], p[i + 2] - p[i - 2]); if (ag > Math.PI / 2) ag -= Math.PI; if (ag < -Math.PI / 2) ag += Math.PI; return { x: v[0], y: v[1], ang: ag }; })();

/* ---------- main draw ---------- */
function draw(ctx, V, o) {
  const old = o.style === 'old', era = o.era, k = V.k, mpp = V.mpp, destr = o.destr, dpr = V.dpr;
  const is1648 = era === '1648', lo = !!V.moving;
  const stOf = LM.map(l => o.statusOf(l));
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  if (old) { const pp = paperPattern(ctx); ctx.fillStyle = pp.pattern; ctx.save(); ctx.translate(((V.w / 2 - V.x * k) % 512) - 512, ((V.h / 2 + V.y * k) % 512) - 512); ctx.fillRect(0, 0, V.w + 1024, V.h + 1024); ctx.restore(); }
  else { ctx.fillStyle = M.bg; ctx.fillRect(0, 0, V.w, V.h); }
  const PT = old ? patterns(ctx, dpr) : null;
  const ox = V.w / 2 - V.x * k, oy = V.h / 2 + V.y * k;
  ctx.setTransform(dpr * k, 0, 0, -dpr * k, dpr * ox, dpr * oy);
  ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  const pad = 40, X0 = V.x - V.w / 2 / k - pad, X1 = V.x + V.w / 2 / k + pad, Y0 = V.y - V.h / 2 / k - pad, Y1 = V.y + V.h / 2 / k + pad;
  const vis = (q) => q.x1 >= X0 && q.x0 <= X1 && q.y1 >= Y0 && q.y0 <= Y1;
  const px = (n) => n / k;

  /* ---- greens ---- */
  const gcol = (t) => old ? (t === 1 ? OLD.forest : OLD.park) : (t === 1 ? M.forest : t === 2 ? M.cem : t === 3 ? M.rec : M.park);
  for (let t = 0; t < 4; t++) {
    if (is1648 && t !== 1) continue;
    ctx.beginPath(); let any = false;
    for (const g of GREEN) { if (g.t !== t || !vis(g)) continue; any = true; for (const r of g.rs) poly(ctx, r, true); }
    if (!any) continue;
    ctx.fillStyle = gcol(t); ctx.fill('evenodd');
    if (old && mpp < 14 && !lo) { ctx.fillStyle = patFill(ctx, t === 1 ? PT.trees : PT.dots, V); ctx.fill('evenodd'); }
  }

  /* ---- water ---- */
  ctx.beginPath(); for (const w of WATER) if (vis(w)) for (const r of w.rs) poly(ctx, r, true);
  ctx.fillStyle = old ? OLD.water : M.water; ctx.fill('evenodd');
  if (old) { if (!lo) { ctx.fillStyle = patFill(ctx, PT.waves, V); ctx.fill('evenodd'); } ctx.lineWidth = px(1); ctx.strokeStyle = INK; ctx.stroke(); }
  else { ctx.lineWidth = px(1); ctx.strokeStyle = M.waterEdge; ctx.stroke(); }
  for (const c of [1, 0]) {
    ctx.beginPath(); let any = false; for (const w of WW) if (w.c === c && vis(w)) { poly(ctx, w.p, false); any = true; }
    if (!any) continue; const wm = c === 0 ? 11 : 3, wpx = Math.max(c === 0 ? 2.6 : 1.4, wm * k);
    if (old) { ctx.lineWidth = px(wpx + 1.6); ctx.strokeStyle = INK; ctx.stroke(); ctx.lineWidth = px(wpx); ctx.strokeStyle = OLD.water; ctx.stroke(); if (wpx > 4) { ctx.setLineDash([px(4), px(4)]); ctx.lineWidth = px(.7); ctx.strokeStyle = 'rgba(43,41,35,.6)'; ctx.stroke(); ctx.setLineDash([]); } }
    else { ctx.lineWidth = px(wpx + 1.4); ctx.strokeStyle = M.waterEdge; ctx.stroke(); ctx.lineWidth = px(wpx); ctx.strokeStyle = M.water; ctx.stroke(); }
  }

  /* ---- 1648: moat band along the wall ---- */
  if (is1648) { ctx.beginPath(); for (const p of WALL) poly(ctx, p, false); ctx.lineWidth = Math.max(px(3), 30); ctx.strokeStyle = old ? OLD.water : M.water; ctx.stroke(); ctx.lineWidth = Math.max(px(1), 30) + px(2); ctx.globalCompositeOperation = 'source-over'; }

  /* ---- railway (not in 1648) ---- */
  if (!is1648 && mpp < 20) {
    ctx.beginPath(); for (const r of RAIL) if (vis(r)) poly(ctx, r.p, false);
    ctx.lineWidth = px(old ? 2.8 : 2.6); ctx.strokeStyle = old ? INK : M.rail; ctx.stroke();
    ctx.setLineDash([px(5), px(5)]); ctx.lineWidth = px(old ? 1.6 : 1.4); ctx.strokeStyle = old ? OLD.paper : '#ffffff'; ctx.stroke(); ctx.setLineDash([]);
  }

  /* ---- roads ---- */
  ctx.save();
  if (is1648) { ctx.beginPath(); ctx.moveTo(RING[0][0], RING[0][1]); for (let i = 1; i < RING.length; i++) ctx.lineTo(RING[i][0], RING[i][1]); ctx.closePath(); ctx.clip(); }
  for (let c = 7; c >= 0; c--) {
    if (mpp >= ROADMAX[c] || (lo && c >= 6)) continue;
    ctx.beginPath(); let any = false;
    for (const r of ROAD[c]) if (vis(r)) { poly(ctx, r.p, false); any = true; }
    if (!any) continue;
    const w = Math.max(RW[c][1], RW[c][0] * k), cs = RW[c][2];
    if (old) {
      if (c < 7) { ctx.lineWidth = px(w + 1.3); ctx.strokeStyle = INK; ctx.stroke(); ctx.lineWidth = px(w); ctx.strokeStyle = OLD.paper; ctx.stroke(); }
      else { ctx.lineWidth = px(.7); ctx.strokeStyle = 'rgba(43,41,35,.55)'; ctx.setLineDash([px(3), px(2)]); ctx.stroke(); ctx.setLineDash([]); }
    } else {
      if (c < 7) { ctx.lineWidth = px(w + cs); ctx.strokeStyle = M.rc[c][0]; ctx.stroke(); ctx.lineWidth = px(w); ctx.strokeStyle = M.rc[c][1]; ctx.stroke(); }
      else { ctx.lineWidth = px(Math.max(1, w)); ctx.strokeStyle = M.rc[7][0]; ctx.setLineDash([px(3), px(2)]); ctx.stroke(); ctx.setLineDash([]); }
    }
  }
  ctx.restore();

  /* ---- bastions (1648) ---- */
  if (is1648) {
    ctx.beginPath(); for (const bs of BAST) poly(ctx, bs.g, true);
    ctx.fillStyle = old ? 'rgba(43,41,35,.07)' : 'rgba(139,110,78,.12)'; ctx.fill(); ctx.lineWidth = px(.8); ctx.strokeStyle = old ? INK : M.wall; ctx.stroke();
    ctx.beginPath(); for (const bs of BAST) poly(ctx, bs.o, true);
    ctx.fillStyle = old ? OLD.paper : '#e4dccb'; ctx.fill(); if (old && !lo) { ctx.fillStyle = patFill(ctx, PT.hatch, V); ctx.fill(); }
    ctx.lineWidth = px(old ? 1.8 : 1.4); ctx.strokeStyle = old ? INK : M.wall; ctx.stroke();
  }

  /* ---- buildings ---- */
  const bFill = old ? OLD.paper : M.bld;
  const A = [], C = [], R = [];
  const pr = (b) => b.f & 1 ? 0.9 : Math.max(0.08, 0.62 * Math.exp(-b.dd / 2300));
  const G = [];
  for (const b of BLD) {
    if (b.lm >= 0 || !vis(b)) continue;
    if (is1648 && !(b.f & 1)) continue;
    if (destr > 0) { const c = dmgOf(b); if (c === 2) { if (b.r < destr) { R.push(b); continue; } } else if (c === 1) { if (b.r < destr) { G.push(b); } } else if (c === 3 && b.r < pr(b) * destr) { R.push(b); continue; } }
    ((b.f & 2) ? C : A).push(b);
  }
  const fine = mpp < 9;
  const drawRubble = () => {
    if (G.length) { ctx.beginPath(); for (const b of G) poly(ctx, b.p, true); ctx.fillStyle = old ? OLD.rubble : M.rubble; ctx.globalAlpha = 0.55 * Math.min(1, destr + 0.2); ctx.fill(); ctx.globalAlpha = 1; if (!lo) { ctx.lineWidth = px(.9); ctx.strokeStyle = old ? INK : M.rubbleEdge; ctx.setLineDash([px(2), px(2)]); ctx.stroke(); ctx.setLineDash([]); } }
    if (!R.length) return;
    ctx.beginPath(); for (const b of R) poly(ctx, rubblePoly(b), true);
    ctx.fillStyle = old ? OLD.rubble : M.rubble; ctx.globalAlpha = Math.min(1, 0.35 + destr); ctx.fill(); ctx.globalAlpha = 1;
    if (!lo) { ctx.lineWidth = px(.9); ctx.strokeStyle = old ? INK : M.rubbleEdge; if (mpp < 2.2) ctx.setLineDash([px(3), px(2)]); ctx.stroke(); ctx.setLineDash([]); }
    if (mpp < 3.2 && !lo) { ctx.beginPath(); let i = 0; for (const b of R) { for (let j = 0; j < 4; j++) { const h1 = hash(i * 7 + j), h2 = hash(i * 13 + j + 3), x = b.x0 + (b.x1 - b.x0) * h1, y = b.y0 + (b.y1 - b.y0) * h2, s = 1.4 + h1 * 1.6; ctx.moveTo(x, y); ctx.lineTo(x + s, y + s * .4); ctx.lineTo(x + s * .2, y + s); ctx.closePath(); } i++; } ctx.fillStyle = old ? INK : M.rubbleDot; ctx.globalAlpha = .8; ctx.fill(); ctx.globalAlpha = 1; }
  };
  const obl = o.d3 !== false && (old ? (is1648 || mpp < 2.2) : mpp < 2.2);
  const pal = old ? { ink: INK, roof: OLD.paper, wall: '#d8cfae', croof: '#85734f', cwall: '#b4a27c', hatch: true } : { ink: M.bldEdge, roof: M.bld, wall: shade(M.bld, .86), croof: M.church, cwall: shade(M.church, .8), hatch: false };
  for (const b of LMB) b.lc = null;
  if (obl) LM.forEach((l, li) => { const st = stOf[li]; if (st === 'absent' || st === 'ruin') return; const c = old ? '#8b2e1f' : D.CATS[l.cat].color; l.bl.forEach(b => { if (is1648 && !(b.f & 1)) return; b.lc = c; (b.f & 2 ? C : A).push(b); }); });
  if (obl) {
    drawRubble();
    const T = A.concat(C); T.sort((a, b) => b.cy - a.cy);
    drawOblique(ctx, T, V, PT, lo, mpp, pal);
  } else {
    if (A.length) {
      ctx.beginPath(); for (const b of A) poly(ctx, b.p, true);
      if (old) { ctx.fillStyle = bFill; ctx.fill(); if (mpp < 7 && !lo) { ctx.fillStyle = patFill(ctx, PT.hatch, V); ctx.fill(); } ctx.lineWidth = px(mpp < 7 ? .9 : .5); ctx.strokeStyle = INK; ctx.stroke(); }
      else { ctx.fillStyle = M.bld; ctx.fill(); if (fine && !lo) { ctx.lineWidth = px(.8); ctx.strokeStyle = M.bldEdge; ctx.stroke(); } }
    }
    if (C.length) {
      ctx.beginPath(); for (const b of C) poly(ctx, b.p, true);
      ctx.fillStyle = old ? '#6f5a3f' : M.church; ctx.fill(); ctx.lineWidth = px(.9); ctx.strokeStyle = old ? INK : '#b39e90'; ctx.stroke();
    }
    drawRubble();
  }

  /* ---- 1648 wall bastion look / wall ---- */
  ctx.beginPath(); for (const p of WALL) poly(ctx, p, false);
  if (old) { ctx.lineWidth = px(is1648 ? 5.5 : 4.5); ctx.strokeStyle = INK; ctx.setLineDash([px(3.2), px(2.2)]); ctx.stroke(); ctx.setLineDash([]); ctx.lineWidth = px(1.3); ctx.stroke(); }
  else { ctx.lineWidth = px(is1648 ? 3.4 : 2.4); ctx.strokeStyle = M.wall; ctx.setLineDash([px(6), px(2.5)]); ctx.stroke(); ctx.setLineDash([]); }
  if (mpp < 9 && !lo) { ctx.beginPath(); const r = Math.max(2.6, px(3.2)); for (const t of TOWERS) { if (t[0] < X0 || t[0] > X1 || t[1] < Y0 || t[1] > Y1) continue; ctx.moveTo(t[0] + r, t[1]); ctx.arc(t[0], t[1], r, 0, 6.283); } ctx.fillStyle = old ? OLD.paper : M.tower; ctx.fill(); ctx.lineWidth = px(old ? 1.1 : .9); ctx.strokeStyle = old ? INK : M.wall; ctx.stroke(); }

  /* ---- landmark buildings ---- */
  LM.forEach((l, li) => {
    const st = stOf[li]; if (st === 'absent') return;
    const col = old ? '#8b2e1f' : D.CATS[l.cat].color;
    if (!l.bl.length) { ctx.beginPath(); ctx.arc(l.m[0], l.m[1], Math.max(14, px(9)), 0, 6.283); ctx.fillStyle = col; ctx.globalAlpha = .22; ctx.fill(); ctx.globalAlpha = 1; ctx.lineWidth = px(1.4); ctx.strokeStyle = col; if (st === 'ruin') ctx.setLineDash([px(4), px(3)]); ctx.stroke(); ctx.setLineDash([]); return; }
    const ruin = st === 'ruin';
    if (obl && !ruin) { if (st === 'damaged') { ctx.beginPath(); l.bl.forEach((b, i) => { const n = Math.min(14, 3 + Math.round(Math.sqrt(b.ar) / 3)); const off = Math.max(b.h * 0.95, mpp * 3.2); for (let j = 0; j < n; j++) { const h1 = hash(li * 977 + i * 31 + j), h2 = hash(li * 313 + i * 17 + j + 9), x = b.x0 + (b.x1 - b.x0) * h1, y = b.y0 + (b.y1 - b.y0) * h2 + off * .7, s = 1.6 + h1 * 2.2; ctx.moveTo(x, y); ctx.lineTo(x + s, y + s * .4); ctx.lineTo(x + s * .2, y + s); ctx.closePath(); } }); ctx.fillStyle = old ? INK : '#4a4036'; ctx.globalAlpha = .85; ctx.fill(); ctx.globalAlpha = 1; } return; }
    ctx.beginPath(); l.bl.forEach(b => poly(ctx, ruin ? rubblePoly(b) : b.p, true));
    ctx.fillStyle = ruin ? (old ? OLD.rubble : M.rubble) : col; ctx.globalAlpha = ruin ? 1 : (old ? .88 : .9); ctx.fill(); ctx.globalAlpha = 1;
    ctx.lineWidth = px(ruin ? 1.5 : 1.1); ctx.strokeStyle = ruin ? col : (old ? INK : 'rgba(0,0,0,.4)'); if (ruin) ctx.setLineDash([px(4), px(3)]); ctx.stroke(); ctx.setLineDash([]);
    if (ruin || st === 'damaged') { ctx.beginPath(); let i = 0; for (const b of l.bl) { const n = Math.min(26, 4 + Math.round(Math.sqrt(b.ar) / 2)); for (let j = 0; j < n; j++) { const h1 = hash(li * 977 + i * 31 + j), h2 = hash(li * 313 + i * 17 + j + 9), x = b.x0 + (b.x1 - b.x0) * h1, y = b.y0 + (b.y1 - b.y0) * h2, s = 1.6 + h1 * 2.2; ctx.moveTo(x, y); ctx.lineTo(x + s, y + s * .4); ctx.lineTo(x + s * .2, y + s); ctx.closePath(); } i++; } ctx.fillStyle = old ? INK : '#4a4036'; ctx.globalAlpha = .85; ctx.fill(); ctx.globalAlpha = 1; }
  });

  /* ---- tour route and highlighted building ---- */
  if (o.route && o.route.length > 1) {
    ctx.beginPath(); o.route.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]));
    ctx.lineJoin = 'round'; ctx.lineWidth = px(2.6); ctx.strokeStyle = old ? '#8b2e1f' : '#d9422b'; ctx.setLineDash([px(8), px(6)]); ctx.globalAlpha = .6; ctx.stroke(); ctx.setLineDash([]); ctx.globalAlpha = 1;
  }
  if (o.leg && o.leg.length > 1) {
    ctx.beginPath(); o.leg.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]));
    ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.lineWidth = px(6.5); ctx.strokeStyle = 'rgba(255,255,255,.85)'; ctx.stroke();
    ctx.lineWidth = px(3.6); ctx.strokeStyle = old ? '#8b2e1f' : '#d9422b'; ctx.stroke(); ctx.lineCap = 'butt';
  }
  if (o.hl) { ctx.beginPath(); poly(ctx, o.hl.p, true); ctx.fillStyle = 'rgba(217,66,43,.30)'; ctx.fill(); ctx.lineWidth = px(2.6); ctx.strokeStyle = old ? '#8b2e1f' : '#d9422b'; ctx.stroke(); }

  /* ---- labels (screen space) ---- */
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const z = V.z, col = old ? OLD.label : M.label, halo = old ? OLD.halo : M.halo, riv = old ? INK : M.river;
  const L = (t, x, y, s, sp, a, c) => { const p = V.wts(x, y); if (p[0] > -200 && p[0] < V.w + 200 && p[1] > -100 && p[1] < V.h + 100) label(ctx, t, p[0], p[1], s, old, sp, a, c || col, halo); };
  if (PEG && z >= 15.2) L('Pegnitz', PEG.x, PEG.y, 12, old ? 3 : 1, -PEG.ang, riv);
  if (z >= 14.2 && z < 16.2) { let a = ll2m(11.0770, 49.4565); L(old ? 'SEBALDER SEITE' : 'SEBALDER SEITE', a[0], a[1], 11.5, 3, 0); a = ll2m(11.0795, 49.4490); L('LORENZER SEITE', a[0], a[1], 11.5, 3, 0); }
  if (z >= 13.6 && z < 14.8) { const a = ll2m(11.0770, 49.4532); L(old ? 'NORENBERGA' : 'ALTSTADT', a[0], a[1] - 260 * 0, z < 14.6 ? 14 : 17, old ? 7 : 4, 0); }
  if (z >= 14.4) { let a = ll2m(11.1164, 49.4352); L('Dutzendteich', a[0], a[1], 11.5, old ? 2 : .5, 0, riv); a = ll2m(11.1090, 49.4363); if (z >= 15) L('Luitpoldhain', a[0], a[1], 11, old ? 2 : .5, 0); }

  if (old) {
    const g = ctx.createRadialGradient(V.w / 2, V.h / 2, Math.min(V.w, V.h) * 0.35, V.w / 2, V.h / 2, Math.max(V.w, V.h) * 0.75);
    g.addColorStop(0, 'rgba(70,60,30,0)'); g.addColorStop(1, 'rgba(70,60,30,.26)'); ctx.fillStyle = g; ctx.fillRect(0, 0, V.w, V.h);
  }
}


/* ---------- hit test (tap a building) ---------- */
let GRID = null;
function buildGrid() {
  GRID = {}; const C = 100;
  BLD.forEach(b => { for (let gx = Math.floor(b.x0 / C); gx <= Math.floor(b.x1 / C); gx++) for (let gy = Math.floor(b.y0 / C); gy <= Math.floor(b.y1 / C); gy++) (GRID[gx + ',' + gy] = GRID[gx + ',' + gy] || []).push(b); });
}
function inPoly(p, x, y) { let c = false; const n = p.length / 2; for (let i = 0, j = n - 1; i < n; j = i++) { const xi = p[2 * i], yi = p[2 * i + 1], xj = p[2 * j], yj = p[2 * j + 1]; if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) c = !c; } return c; }
function hit(x, y, tol) {
  if (!GRID) buildGrid();
  const list = GRID[Math.floor(x / 100) + ',' + Math.floor(y / 100)] || []; let best = null, bd = 1e9;
  for (const b of list) {
    if (x < b.x0 - tol || x > b.x1 + tol || y < b.y0 - tol || y > b.y1 + tol) continue;
    if (inPoly(b.p, x, y)) return b;
    const d = Math.hypot(b.cx - x, b.cy - y); if (tol > 0 && d < bd && d < tol + Math.sqrt(b.ar) / 2) { bd = d; best = b; }
  }
  return best;
}
const dmgOf = (b) => (NM.dmg && NM.dmg[b.i] !== undefined) ? NM.dmg[b.i] : 3;
const isRubble = (b) => { const c = dmgOf(b); return c === 2 ? true : c === 3 ? (!!(b.f & 1) ? b.r < 0.9 : b.r < Math.max(0.08, 0.62 * Math.exp(-b.dd / 2300))) : false; };

NM.basemap = { draw, hit, isRubble, dmgOf, buildings: BLD, landmarks: LM, ll2m, m2ll, counts: { buildings: BLD.length, landmarkBuildings: LMB.length } };
})(window);
