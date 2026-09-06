/* sw.js – Service Worker: App funktioniert offline.
   Speichert alle Dateien im Cache und liefert sie ohne Internet. */

const CACHE = 'nala-waldschule-v1';
const DATEIEN = [
  './',
  './index.html',
  './css/style.css',
  './js/audio.js',
  './js/storage.js',
  './js/games.js',
  './js/app.js',
  './manifest.webmanifest',
  './icons/icon.svg',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(DATEIEN)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then((treffer) => treffer || fetch(e.request).then((res) => {
      const kopie = res.clone();
      caches.open(CACHE).then((c) => c.put(e.request, kopie)).catch(() => {});
      return res;
    }).catch(() => caches.match('./index.html')))
  );
});
