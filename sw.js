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

    let data = { title: 'Huellitas', body: 'Alerta', url: './' };

    try { if (event.data) data = event.data.json(); } catch (e) {}

    

    const options = {

        body: data.body,

        icon: 'assets/img/favicon.png',

        data: { url: data.url }

    };

    event.waitUntil(self.registration.showNotification(data.title, options));

});



self.addEventListener('notificationclick', event => {

    event.notification.close();

    event.waitUntil(clients.openWindow(event.notification.data.url));

});
