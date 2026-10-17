/* Sillapa standalone public dashboard cache (no private API, names, or school plans separately stored). */
const CACHE_NAME = 'sillapa-public-v26-3d-r18a-20261017';
const CACHE_PREFIX = 'sillapa-public-';
const SHELL = ['./', './index.html', './manifest.webmanifest', './pwa.css', './pwa.js', './ia1.css', './ia2.css', './ia2-registry.js', './ia3.css', './ia3-readiness.js', './ia4.css', './ia4-workspace.js', './ia5.css', './desktop-shell.css', './ia5-judge-venue.js', './ia6.css', './ia6-executive.js',
  './round70-catalog.js', './pull-refresh.js', './venues/traffic-r16.mjs', './venues/vehicle-models-r16b.mjs', './venues/dropoff-r17.mjs', './venues/wayfinding-r18.mjs',
  './icons/icon-192.png', './icons/icon-512.png', './icons/apple-touch-icon.png'];
const INDEX = new URL('./index.html', self.registration.scope).href;
const SCOPE = new URL(self.registration.scope);

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys
        .filter(name => name.startsWith(CACHE_PREFIX) && name !== CACHE_NAME)
        .map(name => caches.delete(name))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== SCOPE.origin || !url.pathname.startsWith(SCOPE.pathname)) return;

  if (request.mode === 'navigate') {
    /* Network-first avoids shipping an old competition calendar indefinitely. */
    event.respondWith((async () => {
      try {
        const response = await fetch(request, {cache: 'no-store'});
        if (response.ok) {
          const cache = await caches.open(CACHE_NAME);
          try { await cache.put(INDEX, response.clone()); }
          catch (_) { /* quota error does not invalidate the fresh response */ }
        }
        return response;
      } catch (_) {
        return (await caches.match(INDEX)) || Response.error();
      }
    })());
    return;
  }

  const allowed = new Set(SHELL.slice(2).map(path => new URL(path, SCOPE).pathname));
  if (!allowed.has(url.pathname)) return;
  event.respondWith((async () => {
    // Network-first for code/style assets: deployed UI fixes should reach installed PWAs.
    // Keep cached assets as offline fallback.
    if (/\.(?:css|m?js)$/.test(url.pathname)) {
      try {
        const fresh = await fetch(request, {cache: 'no-store'});
        if (fresh.ok) {
          const cache = await caches.open(CACHE_NAME);
          await cache.put(request, fresh.clone());
        }
        return fresh;
      } catch (_) {
        return (await caches.match(request, {ignoreSearch: true})) || Response.error();
      }
    }
    const cached = await caches.match(request, {ignoreSearch: true});
    if (cached) return cached;
    return fetch(request);
  })());
});
