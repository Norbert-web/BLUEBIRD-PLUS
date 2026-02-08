const CACHE = 'bluebird';
const ASSETS = [
  '/',
  '/index.html',
  '/styles.css',
  '/manifest.json',
  '/logo.svg'
];

self.addEventListener('install', (ev) => {
  ev.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS)).catch(()=>{}));
  self.skipWaiting();
});

self.addEventListener('activate', (ev) => {
  ev.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (ev) => {
  const req = ev.request;
  if (req.mode === 'navigate') {
    ev.respondWith(fetch(req).catch(()=> caches.match('/index.html')));
    return;
  }
  ev.respondWith(caches.match(req).then(r => r || fetch(req).catch(()=>{})));
}); 