const CACHE_NAME = 'huellitas-v1';
const assets = [
  './admin.html',
  './admin/cajero.html',
  './assets/img/logo.png',
  './assets/img/favicon.png'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(assets)));
});

self.addEventListener('fetch', e => {
  e.respondWith(caches.match(e.request).then(res => res || fetch(e.request)));
});
