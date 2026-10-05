/* mapview.js - tiny dependency-free pan/zoom engine on a canvas (touch, mouse, wheel, pinch, inertia). */
(function (global) {
'use strict';
const NM = global.NM = global.NM || {};
const COSLAT = Math.cos(49.4541 * Math.PI / 180);
const MPP0 = 156543.03392 * COSLAT;           // metres per pixel at z0
const BOUNDS = { x0: -3600, x1: 5300, y0: -4300, y1: 2900 };

class MapView {
  constructor(el, canvas, opts) {
    this.el = el; this.canvas = canvas; this.ctx = canvas.getContext('2d');
    this.opts = Object.assign({ minZ: 13, maxZ: 19.5, ignore: '.pin,button,a' }, opts || {});
    this.x = 0; this.y = 0; this.z = 15.5; this.w = 300; this.h = 300; this.dpr = 1;
    this.pointers = new Map(); this.listeners = {}; this.dirty = true; this.anim = null; this.fling = null;
    this.moved = false; this.lastTap = 0;
    this._bind();
    this.resize();
    const loop = (t) => { this._frame(t); requestAnimationFrame(loop); };
    requestAnimationFrame(loop);
  }
  get k() { return Math.pow(2, this.z) / MPP0; }
  get mpp() { return 1 / this.k; }
  on(n, f) { (this.listeners[n] = this.listeners[n] || []).push(f); return this; }
  emit(n, a) { (this.listeners[n] || []).forEach(f => f(a)); }
  wts(X, Y) { const k = this.k; return [this.w / 2 + (X - this.x) * k, this.h / 2 - (Y - this.y) * k]; }
  stw(sx, sy) { const k = this.k; return [this.x + (sx - this.w / 2) / k, this.y - (sy - this.h / 2) / k]; }
  render() { this.dirty = true; this.contentDirty = true; }
  /* touch(true) = only the view moved (pan/zoom/fling): the prerendered map image is reused, not redrawn */
  touch(viewOnly) { this.moving = true; this._mt = performance.now(); this.dirty = true; if (!viewOnly) this.contentDirty = true; }
  resize() {
    const r = this.el.getBoundingClientRect();
    this.w = Math.max(1, r.width); this.h = Math.max(1, r.height);
    this.dpr = Math.min(window.devicePixelRatio || 1, 2.5);
    this.canvas.width = Math.round(this.w * this.dpr); this.canvas.height = Math.round(this.h * this.dpr);
    this.dirty = true; this.contentDirty = true; this.emit('resize');
  }
  zoomForSize(wm, hm, padX, padY) {
    const k = Math.min((this.w - padX) / wm, (this.h - padY) / hm);
    return Math.log2(k * MPP0);
  }
  _clamp() {
    this.z = Math.max(this.opts.minZ, Math.min(this.opts.maxZ, this.z));
    this.x = Math.max(BOUNDS.x0, Math.min(BOUNDS.x1, this.x));
    this.y = Math.max(BOUNDS.y0, Math.min(BOUNDS.y1, this.y));
  }
  setView(x, y, z) { this.x = x; this.y = y; this.z = z; this._clamp(); this.dirty = true; }
  zoomAt(newZ, sx, sy) {
    const before = this.stw(sx, sy);
    this.z = Math.max(this.opts.minZ, Math.min(this.opts.maxZ, newZ));
    const after = this.stw(sx, sy);
    this.x += before[0] - after[0]; this.y += before[1] - after[1];
    this._clamp(); this.touch(true);
  }
  panPx(dx, dy) { const k = this.k; this.x -= dx / k; this.y += dy / k; this._clamp(); this.touch(true); }
  flyTo(x, y, z, ms) {
    this.fling = null;
    z = Math.max(this.opts.minZ, Math.min(this.opts.maxZ, z));
    this.anim = { x0: this.x, y0: this.y, z0: this.z, x1: x, y1: y, z1: z, t0: performance.now(), ms: ms == null ? 700 : ms };
  }
  zoomBy(dz) { this.flyTo(this.x, this.y, this.z + dz, 260); }
  _frame(t) {
    if (this.moving && !this.anim && !this.fling && t - this._mt > 160) { this.moving = false; this.dirty = true; }
    if (this.anim) {
      const a = this.anim, p = Math.min(1, (t - a.t0) / a.ms), e = p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
      this.z = a.z0 + (a.z1 - a.z0) * e;
      // interpolate in screen-consistent way: blend centre linearly
      this.x = a.x0 + (a.x1 - a.x0) * e; this.y = a.y0 + (a.y1 - a.y0) * e;
      this._clamp(); this.touch(true); if (p >= 1) { this.anim = null; this.emit('moveend'); }
    } else if (this.fling) {
      const f = this.fling, dt = Math.min(48, t - f.t); f.t = t;
      const decay = Math.pow(0.0025, dt / 1000); f.vx *= decay; f.vy *= decay;
      this.panPx(f.vx * dt, f.vy * dt);
      if (Math.hypot(f.vx, f.vy) < 0.02) { this.fling = null; this.emit('moveend'); }
    }
    if (this.dirty) {
      this.dirty = false;
      this.opts.draw && this.opts.draw(this.ctx, this);
      this.emit('render');
    }
  }
  _bind() {
    const el = this.el, P = this.pointers;
    let down = null, pinch = null, lpTimer = null, samples = [];
    const cancelLP = () => { clearTimeout(lpTimer); lpTimer = null; };
    const rel = (e) => { const r = el.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
    el.addEventListener('pointerdown', (e) => {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      this.anim = null; this.fling = null;
      const p = rel(e); P.set(e.pointerId, p);
      this.dragTarget = e.target;
      if (P.size === 1) {
        down = { x: p[0], y: p[1], t: performance.now(), target: e.target }; this.moved = false; samples = [[down.t, p[0], p[1]]];
        cancelLP();
        lpTimer = setTimeout(() => { if (!this.moved && P.size === 1) { this.moved = true; this.emit('longpress', { sx: p[0], sy: p[1], world: this.stw(p[0], p[1]) }); } }, 650);
      } else if (P.size === 2) {
        cancelLP(); this.moved = true;
        const [a, b] = [...P.values()]; pinch = { d: Math.hypot(a[0] - b[0], a[1] - b[1]), z: this.z };
      }
      try { if (e.pointerType === 'mouse' && !(e.target.closest && e.target.closest(this.opts.ignore))) el.setPointerCapture(e.pointerId); } catch (_) {}
    });
    el.addEventListener('pointermove', (e) => {
      if (!P.has(e.pointerId)) return;
      if (e.pointerType === 'mouse' && e.buttons === 0) { end(e); return; }   // release was missed: stop dragging
      const p = rel(e), prev = P.get(e.pointerId); P.set(e.pointerId, p);
      if (P.size === 1 && down) {
        if (!this.moved && Math.hypot(p[0] - down.x, p[1] - down.y) > 7) { this.moved = true; cancelLP(); }
        if (this.moved) { this.panPx(p[0] - prev[0], p[1] - prev[1]); const t = performance.now(); samples.push([t, p[0], p[1]]); if (samples.length > 6) samples.shift(); this.emit('movestart'); }
      } else if (P.size === 2 && pinch) {
        const [a, b] = [...P.values()], d = Math.hypot(a[0] - b[0], a[1] - b[1]);
        const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2;
        // pan by midpoint movement
        const pa = [...P.keys()][0]; void pa;
        this.zoomAt(pinch.z + Math.log2(Math.max(0.01, d / pinch.d)), mx, my);
        const old = this._pm; if (old) this.panPx(mx - old[0], my - old[1]); this._pm = [mx, my];
      }
    });
    const end = (e) => {
      if (!P.has(e.pointerId)) return;
      const p = P.get(e.pointerId); P.delete(e.pointerId); cancelLP(); this._pm = null;
      if (P.size === 0 && down) {
        const now = performance.now();
        if (!this.moved && now - down.t < 500) {
          const ign = down.target.closest && down.target.closest(this.opts.ignore);
          if (!ign) {
            const world = this.stw(p[0], p[1]);
            if (now - this.lastTap < 320) { this.lastTap = 0; this.flyTo(world[0], world[1], this.z + 1, 280); }
            else { this.lastTap = now; this.emit('tap', { sx: p[0], sy: p[1], world }); }
          }
        } else if (this.moved && samples.length > 2) {
          const a = samples[0], b = samples[samples.length - 1], dt = b[0] - a[0];
          if (dt > 0 && now - b[0] < 80) { const vx = (b[1] - a[1]) / dt, vy = (b[2] - a[2]) / dt; if (Math.hypot(vx, vy) > 0.2) this.fling = { vx, vy, t: now }; }
        }
        down = null;
      }
      if (P.size < 2) pinch = null;
      if (P.size === 1) { const r = [...P.values()][0]; down = { x: r[0], y: r[1], t: performance.now(), target: el }; samples = []; this.moved = true; }
    };
    el.addEventListener('pointerup', end); el.addEventListener('pointercancel', end);
    window.addEventListener('pointerup', (e) => { if (P.has(e.pointerId)) end(e); });
    window.addEventListener('blur', () => { P.clear(); down = null; pinch = null; });
    el.addEventListener('wheel', (e) => {
      e.preventDefault(); this.anim = null; this.fling = null;
      const dy = e.deltaMode === 1 ? e.deltaY * 16 : e.deltaMode === 2 ? e.deltaY * 100 : e.deltaY;
      const p = rel(e); this.zoomAt(this.z - dy * (e.ctrlKey ? 0.01 : 0.0022), p[0], p[1]);
    }, { passive: false });
    el.addEventListener('keydown', (e) => {
      const s = 80;
      if (e.key === 'ArrowLeft') this.panPx(s, 0); else if (e.key === 'ArrowRight') this.panPx(-s, 0);
      else if (e.key === 'ArrowUp') this.panPx(0, s); else if (e.key === 'ArrowDown') this.panPx(0, -s);
      else if (e.key === '+' || e.key === '=') this.zoomBy(0.5); else if (e.key === '-') this.zoomBy(-0.5); else return;
      e.preventDefault();
    });
    el.addEventListener('contextmenu', (e) => e.preventDefault());
    window.addEventListener('resize', () => this.resize());
    window.addEventListener('orientationchange', () => setTimeout(() => this.resize(), 250));
    if (window.ResizeObserver) new ResizeObserver(() => this.resize()).observe(el);
  }
}
NM.MapView = MapView;
})(window);
