// versão do app: mudar junto com o "vN" do topo do index.html
const V='peirot-qv-v36';
const CORE=['./','./index.html','./reservatorio.html','./manifest.webmanifest','./icon-192.png','./icon-512.png',
 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css','https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js','https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js'];
// no-cache: confere com o servidor e só baixa o que mudou; se a cópia nova não chegar (sinal fraco), fica a da versão anterior
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>Promise.allSettled(CORE.map(u=>c.add(new Request(u,{cache:'no-cache'})).catch(()=>caches.match(u).then(r=>r&&c.put(u,r)))))));self.skipWaiting()});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==V&&k!=='peirot-tiles').map(k=>caches.delete(k)))));self.clients.claim()});
self.addEventListener('fetch',e=>{const u=e.request.url;
 if(/firestore\.googleapis|identitytoolkit|securetoken|googleapis\.com\/identity/.test(u))return; // Firebase sempre direto pela rede
 if(/mt\d\.google\.com|arcgisonline\.com/.test(u)){ // satélite: guarda o que já foi visto para usar sem sinal
  e.respondWith(caches.open('peirot-tiles').then(c=>c.match(e.request).then(r=>r||fetch(e.request).then(n=>{c.put(e.request,n.clone());return n}).catch(()=>r))));return}
 if(e.request.mode==='navigate'){ // página: sempre a versão mais nova do site (sem o cache de 10 min do navegador); sem sinal, ou 6 s sem resposta, abre a guardada
  // o reservatório 3D abre num quadro dentro do app e tem a sua própria cópia guardada (não pode ocupar o lugar do index.html)
  const pag=/\/reservatorio\.html$/.test(new URL(e.request.url).pathname)?'./reservatorio.html':'./index.html';
  if(pag==='./reservatorio.html'){ // o 3D vem junto com cada versão: abre a cópia guardada na hora e confere a rede por trás
   const rede=fetch(e.request.url,{cache:'no-cache'});
   e.waitUntil(rede.then(n=>{if(!n.ok)return;const c2=n.clone();return caches.open(V).then(c=>c.put(pag,c2))}).catch(()=>{}));
   e.respondWith(caches.match(pag).then(r=>r||rede));return}
  const rede=fetch(e.request.url,{cache:'no-cache',redirect:'manual'}),guardada=()=>caches.match(pag);
  e.waitUntil(rede.then(n=>{if(!n.ok)return;const c2=n.clone();return caches.open(V).then(c=>c.put(pag,c2))}).catch(()=>{}));
  e.respondWith(new Promise(ok=>{const t=setTimeout(()=>guardada().then(r=>r&&ok(r)),6000);
   rede.then(n=>{clearTimeout(t);ok(n)},()=>{clearTimeout(t);guardada().then(r=>ok(r||Response.error()))})}));return}
 e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request).then(n=>{if(n.ok||n.type==='opaque')caches.open(V).then(c=>c.put(e.request,n.clone()));return n})));
});
