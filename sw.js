const CACHE_NAME = 'huellitas-cache-v1';
const ASSETS = [
  './admin.html',
  './admin/cajero.html',
  './manifest.json',
  './assets/img/favicon.png'
];

// Instalación del Service Worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Activación y limpieza de caches antiguos
self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
});

// Estrategia de carga: Red primero, si falla usa el Cache
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request);
    })
  );
});
