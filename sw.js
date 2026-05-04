const CACHE_NAME = 'truper-catalogo-pwa-v4';
const urlsToCache = [
  './',
  './index.html',
  './cotizador.html',
  './truper_cart.js',
  './manifest.json',
  './app_icon.svg'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(name => name !== CACHE_NAME).map(name => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request).catch(async () => {
      const cachedResponse = await caches.match(event.request);
      if (cachedResponse) return cachedResponse;
      
      // Fallback si no hay red ni caché
      return new Response('Offline / Archivo no encontrado en caché', {
        status: 503,
        statusText: 'Service Unavailable'
      });
    })
  );
});
