const CACHE_NAME = 'huellitas-app-v7'; // Subimos versión
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

// --- LÓGICA DE NOTIFICACIONES ROBUSTA ---
self.addEventListener('push', event => {
    // 1. Valores por defecto (si todo falla, mostrará esto)
    let title = 'Huellitas Digitales';
    let options = {
        body: 'Nueva notificación recibida.',
        icon: 'assets/img/favicon.png',
        badge: 'assets/img/favicon.png',
        vibrate: [100, 50, 100],
        data: { url: './' }
    };

    // 2. Intentar leer los datos que envía Firebase
    if (event.data) {
        try {
            const payload = event.data.json(); // Convertir a objeto
            console.log("Notificación recibida:", payload); // Para depuración

            // Firebase a veces envía los datos dentro de 'notification' y a veces en la raíz
            if (payload.notification) {
                title = payload.notification.title || title;
                options.body = payload.notification.body || options.body;
            } else {
                title = payload.title || title;
                options.body = payload.body || options.body;
            }

            // Si hay una URL personalizada
            if (payload.data && payload.data.url) {
                options.data.url = payload.data.url;
            }
            
        } catch (error) {
            console.error("Error leyendo notificación:", error);
            // Si falla el JSON, usamos el texto plano como cuerpo
            options.body = event.data.text(); 
        }
    }

    // 3. Mostrar la notificación (ESTO ES LO QUE HACE QUE SUENE)
    event.waitUntil(
        self.registration.showNotification(title, options)
    );
});

self.addEventListener('notificationclick', event => {
    event.notification.close();
    event.waitUntil(
        clients.openWindow(event.notification.data.url)
    );
});
