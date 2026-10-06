const V='peirot-qv-v2';
const CORE=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png',
 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css','https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js','https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>Promise.allSettled(CORE.map(u=>c.add(u)))));self.skipWaiting()});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==V&&k!=='peirot-tiles').map(k=>caches.delete(k)))));self.clients.claim()});
self.addEventListener('fetch',e=>{const u=e.request.url;
 if(/mt\d\.google\.com|arcgisonline\.com/.test(u)){ // satélite: guarda o que já foi visto para usar sem sinal
  e.respondWith(caches.open('peirot-tiles').then(c=>c.match(e.request).then(r=>r||fetch(e.request).then(n=>{c.put(e.request,n.clone());return n}).catch(()=>r))));return}
 if(e.request.mode==='navigate'){e.respondWith(fetch(e.request).then(n=>{caches.open(V).then(c=>c.put('./index.html',n.clone()));return n}).catch(()=>caches.match('./index.html')));return}
 e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request).then(n=>{if(n.ok||n.type==='opaque')caches.open(V).then(c=>c.put(e.request,n.clone()));return n})));
});
