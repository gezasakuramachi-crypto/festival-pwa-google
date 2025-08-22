const CACHE = 'festival-pwa-google-v1';
const ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './js/config.js',
  './js/app.js'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS))
  );
});
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
});
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  const dynamic = url.pathname.includes('/api/positions') || url.pathname.includes('/data/');
  if (dynamic) {
    e.respondWith(fetch(e.request).catch(() => caches.match(e.request)));
  } else {
    e.respondWith(
      caches.match(e.request).then(r => r || fetch(e.request))
    );
  }
});
