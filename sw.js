// Fit Up Service Worker — offline cache v3
// Strategy: network-first (3s timeout) for HTML, cache-first for static assets
const CACHE = 'fitup-v3';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

// HTML paths that should use network-first
const HTML_PATHS = ['./', './index.html'];

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
  // Take over immediately — don't wait for old SW to release
  self.skipWaiting();
});

// Activate: clean old caches, claim all clients immediately
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  // Take control of all clients immediately
  e.waitUntil(self.clients.claim());
});

// Helper: is this an HTML request?
function isHtmlRequest(url) {
  return HTML_PATHS.some(p => url.endsWith(p) || url.endsWith(p.replace('./', '')));
}

// Fetch: network-first for HTML (with 3s timeout), cache-first for assets
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;

  const url = new URL(e.request.url);

  // Only handle same-origin requests
  if (url.origin !== self.location.origin) return;

  e.respondWith(
    caches.open(CACHE).then(cache => {
      if (isHtmlRequest(url.pathname) || url.pathname === '/' || url.pathname.endsWith('/')) {
        // Network-first with 3-second timeout for HTML
        return networkFirstWithTimeout(e.request, cache, 3000);
      }
      // Cache-first for static assets (icons, manifest)
      return cacheFirstWithRefresh(e.request, cache);
    })
  );
});

// Network-first: try network, fall back to cache after timeout
async function networkFirstWithTimeout(request, cache, timeoutMs) {
  let timeoutId;

  try {
    // Race: network vs timeout
    const networkPromise = fetch(request).then(resp => {
      clearTimeout(timeoutId);
      if (resp.ok) {
        cache.put(request, resp.clone());
      }
      return resp;
    });

    const timeoutPromise = new Promise((_, reject) => {
      timeoutId = setTimeout(() => reject(new Error('timeout')), timeoutMs);
    });

    const response = await Promise.race([networkPromise, timeoutPromise]);
    clearTimeout(timeoutId);
    return response;
  } catch (err) {
    // Network failed or timed out — serve from cache
    clearTimeout(timeoutId);
    const cached = await cache.match(request);
    if (cached) return cached;

    // No cache either — offline error
    return new Response('离线模式 — 请连接网络后重试', {
      status: 503,
      statusText: 'Service Unavailable',
      headers: { 'Content-Type': 'text/plain; charset=utf-8' }
    });
  }
}

// Cache-first: serve cached immediately, refresh cache in background
async function cacheFirstWithRefresh(request, cache) {
  const cached = await cache.match(request);

  // Refresh cache in background (don't wait for it)
  fetch(request).then(resp => {
    if (resp.ok) cache.put(request, resp.clone());
  }).catch(() => {});

  return cached || fetch(request).then(resp => {
    if (resp.ok) cache.put(request, resp.clone());
    return resp;
  }).catch(() => new Response('离线', { status: 503 }));
}

// Listen for messages from the page
self.addEventListener('message', e => {
  if (e.data === 'CLEAR_AND_SKIP') {
    // Clear HTML cache entries so fresh content loads after update
    caches.open(CACHE).then(cache => {
      HTML_PATHS.forEach(p => cache.delete(p));
      cache.delete('./');
      cache.delete('/');
    });
    self.skipWaiting();
  }
});
