const CACHE_NAME = 'diff-checker-v1';
const urlsToCache = [
    '/diff-checker/',
    '/diff-checker/index.html',
    '/diff-checker/style.css',
    '/diff-checker/app.js',
    '/diff-checker/manifest.json'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => cache.addAll(urlsToCache))
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                if (response) {
                    return response;
                }
                return fetch(event.request);
            })
    );
});