// Lumio CSV - Service Worker (PWA Offline Engine)
const CACHE_NAME = 'lumio-csv-v1.1.0';

const STATIC_ASSETS = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './csv-engine.js',
  './manifest.webmanifest',
  './sample_data.csv',
  './favicon.ico',
  './assets/icons/icon.svg',
  './assets/icons/icon-192.png',
  './assets/icons/icon-512.png',
  './assets/icons/icon-512-maskable.png',
  './assets/icons/icon-64.png'
];

// Install: pre-cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// Activate: clean up old caches
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
    }).then(() => self.clients.claim())
  );
});

// Fetch: serve from cache if available, fallback to network and cache external assets (e.g. fonts)
self.addEventListener('fetch', (event) => {
  const request = event.request;

  // Ignore non-GET requests
  if (request.method !== 'GET') return;

  // Do not intercept chrome-extension or unsupported schemes
  if (!request.url.startsWith('http://') && !request.url.startsWith('https://')) {
    return;
  }

  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(request).then((networkResponse) => {
        // Cache successful responses for Google Fonts or same-origin assets
        if (
          networkResponse &&
          networkResponse.status === 200 &&
          (request.url.includes('fonts.googleapis.com') ||
           request.url.includes('fonts.gstatic.com') ||
           request.url.startsWith(self.location.origin))
        ) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(() => {
        // Fallback for HTML navigation requests when offline
        if (request.mode === 'navigate') {
          return caches.match('./index.html').then((res) => res || caches.match('./'));
        }
      });
    })
  );
});
