const CACHE_NAME = 'estech-scoutier-v1';

self.addEventListener('install', (event) => {
  const scope = self.registration.scope;
  const assets = [
    scope,
    new URL('index.html', scope).href,
    new URL('manifest.webmanifest', scope).href,
    new URL('icons/icon-192.svg', scope).href,
    new URL('icons/icon-512.svg', scope).href
  ];

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(assets);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Navigation requests: Stale-while-revalidate or Network falling back to cached index.html
  if (event.request.mode === 'navigate') {
    const scope = self.registration.scope;
    const indexUrl = new URL('index.html', scope).href;
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match(indexUrl).then((res) => res || caches.match(scope));
      })
    );
    return;
  }

  // Cache first for static assets, fallback to network
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).then((response) => {
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });
        return response;
      });
    })
  );
});
