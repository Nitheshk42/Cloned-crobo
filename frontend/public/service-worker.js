const CACHE_NAME = 'crobo-v1';

// Install - skip waiting to activate immediately
self.addEventListener('install', event => {
  console.log('Crobo service worker installing...');
  self.skipWaiting();
});

// Activate immediately
self.addEventListener('activate', event => {
  console.log('Crobo service worker activated!');
  event.waitUntil(clients.claim());
});

// Fetch — network first, fallback to cache
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Cache successful responses
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then(cache => {
          if (event.request.method === 'GET') {
            cache.put(event.request, responseClone);
          }
        });
        return response;
      })
      .catch(() => {
        return caches.match(event.request);
      })
  );
});