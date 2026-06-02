const CACHE_NAME = 'kopi-moka-offline-v1';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  'https://unpkg.com/lucide@latest',
  'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js'
];

// 1. Force immediate installation and caching of all files
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    }).then(() => self.skipWaiting()) // Forces activation immediately
  );
});

// 2. Claim control of the client immediately without waiting for a reload
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 3. Strict Offline Interceptor: Always serve from device storage
self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((cachedResponse) => {
      // If it's in the local device cache, use it exclusively (No internet ping)
      if (cachedResponse) {
        return cachedResponse;
      }
      // Fallback network request ONLY for things not cached during installation
      return fetch(e.request);
    })
  );
});
