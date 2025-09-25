const CACHE_NAME = 'pa-cache-v1';
const ASSETS = ['index.html','app.js','manifest.json','icons/icon-192.png','icons/icon-512.png','service-worker.js'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('fetch', e => {
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
});
