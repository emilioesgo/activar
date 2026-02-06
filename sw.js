const CACHE_NAME = 'huellitas-v10'; // Subí versión para asegurar cambios
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
  self.skipWaiting(); 
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
  return self.clients.claim(); 
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

// --- LÓGICA DE NOTIFICACIÓN MEJORADA (COMPATIBLE CON API V1) ---
self.addEventListener('push', (event) => {
  let title = 'Huellitas Digitales';
  let body = 'Nueva notificación';
  // URL por defecto para evitar pantalla blanca si falla el link
  let url = 'hub.html'; 

  if (event.data) {
    try {
      const payload = event.data.json();
      
      // 1. Datos básicos de notificación
      if (payload.notification) {
        title = payload.notification.title || title;
        body = payload.notification.body || body;
        // Soporte para click_action (Legacy)
        if (payload.notification.click_action) url = payload.notification.click_action;
      } 
      
      // 2. Soporte para API V1 (fcm_options link) - ESTE ES EL CLAVE
      if (payload.fcm_options && payload.fcm_options.link) {
        url = payload.fcm_options.link;
      }

      // 3. Soporte para datos personalizados (data)
      if (payload.data && payload.data.url) {
        url = payload.data.url;
      }

    } catch (e) {
      body = event.data.text();
    }
  }

  const options = {
    body: body,
    icon: 'assets/img/favicon.png',
    badge: 'assets/img/favicon.png',
    // Patrón de vibración más fuerte: vibra-pausa-vibra-pausa-vibra
    vibrate: [200, 100, 200, 100, 200], 
    data: { url: url }, // Guardamos la URL aquí para usarla al hacer clic
    requireInteraction: true, // La notificación no desaparece sola
    actions: [
      { action: 'open', title: 'Ver Ahora' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  // Recuperamos la URL guardada en 'options.data'
  // Si por alguna razón no existe, mandamos al hub.html
  const urlToOpen = (event.notification.data && event.notification.data.url) 
                    ? event.notification.data.url 
                    : 'hub.html';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // Si ya hay una ventana abierta con esa URL, la enfocamos
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      // Si no, abrimos una nueva
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
