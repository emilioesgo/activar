const CACHE_NAME = 'huellitas-v8'; // Cambié el nombre para forzar actualización
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

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)));
  self.skipWaiting(); // Forza al SW a activarse de inmediato
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      );
    })
  );
  return self.clients.claim(); // Toma control de todos los clientes inmediatamente
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then((r) => {
      return r || fetch(e.request).then((response) => {
        return caches.open(CACHE_NAME).then((cache) => {
          cache.put(e.request, response.clone());
          return response;
        });
      });
    })
  );
});

// --- LÓGICA DE NOTIFICACIÓN SIMPLIFICADA ---
self.addEventListener('push', (event) => {
  let title = 'Huellitas Digitales';
  let body = 'Nueva notificación';
  let url = './';

  if (event.data) {
    try {
      const payload = event.data.json();
      // Firebase Console envía datos en 'notification'
      if (payload.notification) {
        title = payload.notification.title;
        body = payload.notification.body;
      } 
      // Si enviamos datos personalizados
      else {
        title = payload.title || title;
        body = payload.body || body;
      }
      if (payload.data && payload.data.url) url = payload.data.url;
    } catch (e) {
      // Si falla el JSON, usa texto plano
      body = event.data.text();
    }
  }

  const options = {
    body: body,
    icon: 'assets/img/favicon.png',
    badge: 'assets/img/favicon.png',
    vibrate: [100, 50, 100],
    data: { url: url }
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(clients.openWindow(event.notification.data.url));
});
