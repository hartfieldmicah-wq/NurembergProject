/* Service worker: precaches the whole app so it works fully offline. Bump VERSION when you change any file. */
const VERSION = '1.4.0';
const CACHE = 'nuremberg-map-' + VERSION;
const CORE = [
  './', 'index.html', 'manifest.webmanifest', 'css/style.css',
  'js/data.js', 'js/data2.js', 'js/i18n.js', 'js/btags.js', 'js/routes.js', 'js/photos.js', 'js/osm-data.js', 'js/basemap.js', 'js/mapview.js', 'js/app.js',
  'apple-touch-icon.png', 'icons/favicon-32.png', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/icon-maskable-512.png',
  'icons/apple-touch-icon-152.png', 'icons/apple-touch-icon-167.png', 'icons/apple-touch-icon-180.png'
];
self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => Promise.all(CORE.map((u) => c.add(new Request(u, { cache: 'reload' }))))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k.indexOf('nuremberg-map-') === 0 && k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.hostname === 'upload.wikimedia.org') {          // landmark photos: cache first, kept in their own cache so app updates don't delete them
    e.respondWith((async () => { const c = await caches.open('nm-photos'); const hit = await c.match(req); if (hit) return hit; try { const res = await fetch(req); if (res && res.ok) c.put(req, res.clone()); return res; } catch (_) { return new Response('', { status: 504 }); } })());
    return;
  }
  if (url.origin !== location.origin) return;            // external links (Wikipedia, maps) go to the network
  e.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const cached = await cache.match(req, { ignoreSearch: true }) || (req.mode === 'navigate' ? await cache.match('index.html') : null);
    const refresh = fetch(req).then((res) => { if (res && res.ok) cache.put(req, res.clone()); return res; }).catch(() => null);
    if (cached) { e.waitUntil(refresh); return cached; }   // cache first, refresh in background
    return (await refresh) || new Response('Offline', { status: 503 });
  })());
});
