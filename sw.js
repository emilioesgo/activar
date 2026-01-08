const CACHE_NAME = 'huellitas-cache-v1';
const ASSETS = [
  '/activar/admin.html',
  '/activar/admin/cajero.html',
  '/activar/manifest.json',
  '/activar/assets/img/favicon.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
