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

// ESCUCHADOR DE NOTIFICACIONES CORREGIDO
self.addEventListener('push', event => {
    let payload = {
        title: 'Huellitas Digitales',
        body: 'Nueva actualización',
        url: './'
    };

    if (event.data) {
        try {
            const json = event.data.json();
            // Firebase suele enviar la info dentro de 'notification' o directo en la raíz
            payload.title = json.title || (json.notification ? json.notification.title : payload.title);
            payload.body = json.body || (json.notification ? json.notification.body : payload.body);
            payload.url = json.url || (json.data ? json.data.url : payload.url);
        } catch (e) {
            payload.body = event.data.text();
        }
    }

    const options = {
        body: payload.body,
        icon: 'assets/img/favicon.png',
        badge: 'assets/img/favicon.png',
        vibrate: [100, 50, 100],
        data: { url: payload.url }
    };

    event.waitUntil(
        self.registration.showNotification(payload.title, options)
    );
});

self.addEventListener('notificationclick', event => {
    event.notification.close();
    event.waitUntil(
        clients.openWindow(event.notification.data.url || './')
    );
});
