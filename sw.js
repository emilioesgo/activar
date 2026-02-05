const CACHE_NAME = 'huellitas-app-v6';
const ASSETS = [
  './',
  'index.html',
  'hub.html',
  'perfil.html',
  'flyer.html',
  'activar.html',
  'editar.html',
  'carnet.html',
  'peso.html',
  'veterinarias.html',
  'esteticas.html',
  'hospedaje.html',
  'manifest-hub.json',
  'assets/img/logo.png',
  'assets/img/favicon.png',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css',
  'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) return caches.delete(cache);
        })
      );
    })
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    fetch(event.request)
      .then(res => {
        const resClone = res.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, resClone));
        return res;
      }).catch(() => caches.match(event.request))
  );
});

self.addEventListener('push', event => {
    let payload = {};
    
    if (event.data) {
        try {
            payload = event.data.json();
        } catch (e) {
            payload = { body: event.data.text() };
        }
    }

    // Mejora para evitar 'undefined' buscando en múltiples estructuras de Firebase
    const notificationTitle = payload.title || (payload.notification ? payload.notification.title : 'Huellitas Digitales');
    const notificationBody = payload.body || (payload.notification ? payload.notification.body : 'Nueva actualización de tu mascota');
    const notificationUrl = payload.url || (payload.data ? payload.data.url : './');

    const options = {
        body: notificationBody,
        icon: 'assets/img/favicon.png',
        badge: 'assets/img/favicon.png',
        vibrate: [100, 50, 100],
        data: { url: notificationUrl }
    };

    // Soporte para App Badging
    if (navigator.setAppBadge && payload.badgeCount) {
        navigator.setAppBadge(payload.badgeCount);
    }

    event.waitUntil(self.registration.showNotification(notificationTitle, options));
});

self.addEventListener('notificationclick', event => {
    event.notification.close();
    event.waitUntil(clients.openWindow(event.notification.data.url || './'));
});
