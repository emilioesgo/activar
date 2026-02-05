const CACHE_NAME = 'huellitas-app-v3'; // Subimos versión para forzar actualización
const ASSETS = [
  './',               // Cambiado de '/' a './'
  'index.html',       // Quitamos la barra inicial '/'
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

// Instalación
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache abierto, guardando recursos...');
        return cache.addAll(ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activación
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
});

// Fetch
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    fetch(event.request)
      .then(response => {
        const resClone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, resClone));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});

// Notificaciones Push
self.addEventListener('push', event => {
    let data = { title: 'Huellitas Digitales', body: 'Nueva actualización.', url: './' };
    try {
        if (event.data) data = event.data.json();
    } catch (e) { data.body = event.data.text(); }

    const options = {
        body: data.body,
        icon: 'assets/img/favicon.png',
        badge: 'assets/img/favicon.png',
        vibrate: [100, 50, 100],
        data: { url: data.url }
    };
    
    if (navigator.setAppBadge && data.badgeCount) {
        navigator.setAppBadge(data.badgeCount);
    }

    event.waitUntil(self.registration.showNotification(data.title, options));
});

// Click en Notificación
self.addEventListener('notificationclick', event => {
    event.notification.close();
    event.waitUntil(
        clients.matchAll({ type: 'window' }).then(windowClients => {
            for (var i = 0; i < windowClients.length; i++) {
                var client = windowClients[i];
                if (client.url === event.notification.data.url && 'focus' in client) {
                    return client.focus();
                }
            }
            if (clients.openWindow) return clients.openWindow(event.notification.data.url);
        })
    );
});
