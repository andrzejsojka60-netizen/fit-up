// Fit Up Service Worker — offline cache v2
const CACHE = 'fitup-v2';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

// Install: cache each asset individually so one failure doesn't block all
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(cache =>
      Promise.allSettled(
        ASSETS.map(url =>
          cache.add(url).catch(err =>
            console.warn('[SW] cache miss:', url, err.message)
          )
        )
      )
    )
  );
  self.skipWaiting();
});

// Activate: clean old caches, claim clients immediately
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  e.waitUntil(self.clients.claim());
});

// Fetch: cache-first with network fallback (stale-while-revalidate would be better
// but cache-first ensures offline works reliably)
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;

  e.respondWith(
    caches.match(e.request).then(cached => {
      // Fire network request to refresh cache in background
      const fetchPromise = fetch(e.request).then(resp => {
        if (resp.ok) {
          const clone = resp.clone();
          caches.open(CACHE).then(cache => cache.put(e.request, clone));
        }
        return resp;
      }).catch(() => null);

      // Return cached immediately, or wait for network
      return cached || fetchPromise.then(resp =>
        resp || new Response('离线模式 — 请连接网络后重试', {
          status: 503,
          statusText: 'Service Unavailable',
          headers: { 'Content-Type': 'text/plain; charset=utf-8' }
        })
      );
    })
  );
});
