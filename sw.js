const CACHE = 'veripos-v2';
const ASSETS = ['/', '/index.html', '/manifest.json', '/assets/icon-192.png', '/assets/icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(cached => {
      const fetchPromise = fetch(e.request).then(net => {
        const clone = net.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
        return net;
      }).catch(() => cached || new Response('Offline', {status: 503}));
      return cached || fetchPromise;
    })
  );
});
