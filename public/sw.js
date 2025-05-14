importScripts('/uv/uv.bundle.js');
importScripts('/uv/uv.config.js');
importScripts('/uv/uv.sw.js');
importScripts("/scram/scramjet.shared.js", "/scram/scramjet.worker.js");

const uv = new UVServiceWorker();
const scramjet = new ScramjetServiceWorker();
let playgroundData;

const CACHE_NAME = 'bolt-cache-v1';
const STATIC_CACHE = 'static-cache-v1';

const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/assets/styles/main.css',
    '/assets/imgs/logos/boltlogo11.ico',
    '/assets/imgs/otherlogos/discord.svg',
    '/assets/imgs/otherlogos/youtube.svg',
    '/assets/imgs/otherlogos/tiktok.svg'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(STATIC_CACHE).then((cache) => {
            return cache.addAll(STATIC_ASSETS);
        })
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== STATIC_CACHE && cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

self.addEventListener('message', ({ data }) => {
    if (data.type === 'playgroundData') {
        playgroundData = data;
    }
});

async function handleRequest(event) {
    const cachedResponse = await caches.match(event.request);
    if (cachedResponse) {
        return cachedResponse;
    }

    if (uv.route(event)) {
        return await uv.fetch(event);
    }

    await scramjet.loadConfig();
    if (scramjet.route(event)) {
        return scramjet.fetch(event);
    }

    try {
        const response = await fetch(event.request);
        if (response.ok && event.request.method === 'GET') {
            const cache = await caches.open(CACHE_NAME);
            cache.put(event.request, response.clone());
        }
        return response;
    } catch (error) {
        const offlineResponse = await caches.match('/offline.html');
        return offlineResponse || new Response('Network error', { status: 503 });
    }
}

self.addEventListener('fetch', (event) => {
    event.respondWith(handleRequest(event));
});