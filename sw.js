// sw.js (v6)
const CACHE = 'veripos-v6';
const ASSETS = ['/', '/index.html', '/manifest.json']; // quita iconos si aún no existen

self.addEventListener('install', e=>{
  e.waitUntil((async ()=>{
    const c = await caches.open(CACHE);
    for (const url of ASSETS){
      try { await c.add(url); }
      catch (err) { console.warn('SW: skip asset', url, err); }
    }
  })());
  self.skipWaiting();
});

self.addEventListener('activate', e=>{
  e.waitUntil(
    caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', e=>{
  e.respondWith(
    caches.match(e.request).then(cached=>{
      const fetchPromise = fetch(e.request).then(net=>{
        const clone = net.clone();
        caches.open(CACHE).then(c=>c.put(e.request, clone));
        return net;
      }).catch(()=>cached);
      return cached || fetchPromise;
    })
  );
});


