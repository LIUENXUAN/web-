const CACHE_NAME = 'camp-os-v3-no-model-cache';
const CORE_ASSETS = [
  '/',
  '/index.html',
  '/console/index.html',
  '/console/console.css',
  '/console/console.js',
  '/app/index.html',
  '/admin/index.html'
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(CORE_ASSETS)).catch(() => undefined));
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.pathname.endsWith('.glb') || url.pathname.endsWith('.js') || url.pathname === '/model-test.html') return;
  event.respondWith(fetch(request).catch(() => caches.match(request).then(response => response || caches.match('/console/index.html'))));
});
