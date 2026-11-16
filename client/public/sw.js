const CACHE = 'afc-shell-v1';
self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    const response = await fetch('/offline-assets.json', { cache: 'no-store' });
    if (!response.ok) throw new Error('Offline asset list unavailable');
    const assets = await response.json();
    await cache.addAll(['/', '/manifest.webmanifest', '/afc-logo.png', '/favicon.svg', '/app-icon-192.png', '/app-icon-512.png', ...assets]);
    await self.skipWaiting();
  })());
});
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k.startsWith('afc-shell-') && k !== CACHE).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});
self.addEventListener('fetch', event => {
  const request = event.request, url = new URL(request.url);
  if (request.method !== 'GET' || url.pathname.startsWith('/api/') || url.pathname.startsWith('/__manus') || url.pathname.startsWith('/__system')) return;
  if (url.origin !== self.location.origin && !['fonts.googleapis.com', 'fonts.gstatic.com'].includes(url.hostname)) return;
  if (request.mode === 'navigate') {
    event.respondWith((async () => {
      try { const fresh = await fetch(request); if (fresh.ok) { const cache = await caches.open(CACHE); await cache.put('/', fresh.clone()); } return fresh; }
      catch { return (await caches.match('/')) || Response.error(); }
    })());
    return;
  }
  event.respondWith((async () => {
    const cached = await caches.match(request);
    if (cached) return cached;
    try { const response = await fetch(request); if (response.ok || response.type === 'opaque') { const cache = await caches.open(CACHE); await cache.put(request, response.clone()); } return response; }
    catch { return Response.error(); }
  })());
});
