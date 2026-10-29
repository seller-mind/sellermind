// SellerMind service worker
//
// SM-11 fix (2026-10-28 QA): the previous fetch handler called cache.put() for
// every response with status 200 — any method, any origin, any size, forever.
// There was no entry cap, no expiry, and no same-origin filter, so Cache
// Storage grew without bound for long-lived clients. The runtime behaviour
// (network-first, offline fallback) is unchanged; what changed is what is
// allowed into the cache and how large it is allowed to get.

const CACHE_NAME = 'sellermind-v2';
const MAX_ENTRIES = 60;        // hard cap on cached responses
const MAX_BYTES = 5 * 1024 * 1024; // skip anything declared larger than 5 MB

const STATIC_ASSETS = [
  '/',
  '/tools/listing',
  '/tools/reply',
  '/tools/holiday',
  '/tools/review',
  '/tools/batch',
];

// Install: pre-cache the app shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// Activate: drop caches from older versions, then enforce the entry cap
self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const names = await caches.keys();
      await Promise.all(
        names.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n))
      );
      await trimCache();
    })()
  );
  self.clients.claim();
});

// Keep the cache bounded. Called after every write and on activate.
async function trimCache() {
  const cache = await caches.open(CACHE_NAME);
  const keys = await cache.keys();
  if (keys.length <= MAX_ENTRIES) return;
  // caches.keys() preserves insertion order, so the head is the oldest.
  const excess = keys.length - MAX_ENTRIES;
  await Promise.all(keys.slice(0, excess).map((k) => cache.delete(k)));
}

// Only same-origin GET responses are cacheable. Cross-origin responses and
// anything with a non-GET method are left alone.
function isCacheable(request, url) {
  if (request.method !== 'GET') return false;
  if (url.origin !== self.location.origin) return false;
  if (url.pathname.startsWith('/api/')) return false;
  if (request.headers.has('range')) return false;
  return true;
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // API calls: network only, never cached. Offline gets an explicit error
  // envelope instead of a stale success payload.
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request).catch(
        () =>
          new Response(
            JSON.stringify({
              success: false,
              error: {
                code: 'OFFLINE',
                message: 'You are offline. Please check your connection.',
              },
            }),
            { headers: { 'Content-Type': 'application/json' }, status: 503 }
          )
      )
    );
    return;
  }

  // Everything else: network first, cache as fallback.
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (isCacheable(request, url) && response.status === 200) {
          const declared = Number(response.headers.get('content-length') || 0);
          if (!declared || declared <= MAX_BYTES) {
            const responseClone = response.clone();
            caches
              .open(CACHE_NAME)
              .then((cache) => cache.put(request, responseClone))
              .then(trimCache)
              .catch(() => {
                // Quota exceeded or the response was not storable — not fatal,
                // the network response is already being returned to the page.
              });
          }
        }
        return response;
      })
      .catch(() =>
        caches
          .match(request)
          .then((cached) => cached || new Response('Offline', { status: 503 }))
      )
  );
});
