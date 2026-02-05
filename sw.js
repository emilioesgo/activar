const CACHE_NAME = 'huellitas-app-v2'; // Cambia el nombre si haces cambios grandes para forzar actualización
const ASSETS = [
  '/',
  '/hub.html',
  '/perfil.html',
  '/flyer.html',
  '/index.html',
  '/activar.html',
  '/editar.html',
  '/carnet.html',
  '/peso.html',
  '/veterinarias.html',
  '/esteticas.html',
  '/hospedaje.html',
  '/manifest-hub.json',
  '/assets/img/logo.png',
  '/assets/img/favicon.png',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css',
  'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js'
];

// Instalación: Guarda los archivos esenciales
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

// Activación: Limpia versiones viejas de caché automáticamente
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            console.log('Borrando caché antiguo:', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
});

// Estrategia de búsqueda: Intentar red, si falla usar caché
self.addEventListener('fetch', event => {
  // Solo procesamos peticiones de tipo GET
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Si la respuesta es buena, guardamos una copia en caché actualizada
        const resClone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, resClone));
        return response;
      })
      .catch(() => {
        // Si falla la red (está offline), buscamos en el caché
        return caches.match(event.request).then(res => {
          if (res) return res;
        });
      })
  );
});

/* --- MEJORAS DE NOTIFICACIONES PUSH Y APP BADGING --- */

// Escuchar evento de notificación Push
self.addEventListener('push', event => {
    let data = { title: 'Huellitas Digitales', body: 'Nueva actualización de tu mascota.', url: '/' };
    
    try {
        if (event.data) {
            data = event.data.json();
        }
    } catch (e) {
        data.body = event.data.text();
    }

    const options = {
        body: data.body,
        icon: '/assets/img/favicon.png',
        badge: '/assets/img/favicon.png',
        vibrate: [100, 50, 100],
        data: { url: data.url }
    };

    // Actualizar el número en el icono si la API está disponible
    if (navigator.setAppBadge && data.badgeCount) {
        navigator.setAppBadge(data.badgeCount);
    }

    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});

// Manejar el clic en la notificación para abrir la App
self.addEventListener('notificationclick', event => {
    event.notification.close();
    event.waitUntil(
        clients.matchAll({ type: 'window' }).then(windowClients => {
            // Si la app ya está abierta, poner el foco en ella
            for (var i = 0; i < windowClients.length; i++) {
                var client = windowClients[i];
                if (client.url === event.notification.data.url && 'focus' in client) {
                    return client.focus();
                }
            }
            // Si no está abierta, abrir una nueva pestaña
            if (clients.openWindow) {
                return clients.openWindow(event.notification.data.url);
            }
        })
    );
});
