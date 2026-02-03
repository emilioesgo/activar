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
          
          // Opcional: Si es una página HTML y no está en caché, podrías retornar una página de error offline genérica
          // return caches.match('/offline.html');
        });
      })
  );
});
