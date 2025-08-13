const CACHE = 'trip-movie-v1';
const CORE = [ './','./index.html','./src/style.css','./src/main.js','./src/subtitle-loader.js','./src/metrics.js' ];
self.addEventListener('install', e=>{ e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE))); });
self.addEventListener('activate', e=>{ e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))))); });
self.addEventListener('fetch', e=>{ const url = new URL(e.request.url); if(url.pathname.includes('/assets/video/intro')) { e.respondWith(caches.match(e.request).then(r=>r || fetch(e.request).then(resp=>{ const clone = resp.clone(); caches.open(CACHE).then(c=>c.put(e.request, clone)); return resp; }))); } });
