// versão do app: mudar junto com o "vN" do topo do index.html
const V='peirot-qv-v31';
const CORE=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png',
 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css','https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js','https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>Promise.allSettled(CORE.map(u=>c.add(new Request(u,{cache:'reload'}))))));self.skipWaiting()});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==V&&k!=='peirot-tiles').map(k=>caches.delete(k)))));self.clients.claim()});
self.addEventListener('fetch',e=>{const u=e.request.url;
 if(/firestore\.googleapis|identitytoolkit|securetoken|googleapis\.com\/identity/.test(u))return; // Firebase sempre direto pela rede
 if(/mt\d\.google\.com|arcgisonline\.com/.test(u)){ // satélite: guarda o que já foi visto para usar sem sinal
  e.respondWith(caches.open('peirot-tiles').then(c=>c.match(e.request).then(r=>r||fetch(e.request).then(n=>{c.put(e.request,n.clone());return n}).catch(()=>r))));return}
 if(e.request.mode==='navigate'){ // página: sempre a versão mais nova do site (sem o cache de 10 min do navegador); sem sinal, ou 6 s sem resposta, abre a guardada
  const rede=fetch(e.request.url,{cache:'no-cache',redirect:'manual'}),guardada=()=>caches.match('./index.html');
  e.waitUntil(rede.then(n=>{if(!n.ok)return;const c2=n.clone();return caches.open(V).then(c=>c.put('./index.html',c2))}).catch(()=>{}));
  e.respondWith(new Promise(ok=>{const t=setTimeout(()=>guardada().then(r=>r&&ok(r)),6000);
   rede.then(n=>{clearTimeout(t);ok(n)},()=>{clearTimeout(t);guardada().then(r=>ok(r||Response.error()))})}));return}
 e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request).then(n=>{if(n.ok||n.type==='opaque')caches.open(V).then(c=>c.put(e.request,n.clone()));return n})));
});
