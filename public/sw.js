if (navigator.userAgent.includes('Firefox')) {
    Object.defineProperty(globalThis, 'crossOriginIsolated', {
        value: true,
        writable: false,
    });
}

importScripts('/uv/uv.bundle.js');
importScripts('/uv/uv.config.js');
importScripts('/uv/uv.sw.js');
importScripts("/scram/scramjet.shared.js", "/scram/scramjet.worker.js");


const uv = new UVServiceWorker();
const scramjet = new ScramjetServiceWorker();

let playgroundData;

self.addEventListener('message', ({ data }) => {
    if (data.type === 'playgroundData') {
        playgroundData = data;
    }
});

async function handleRequest(event) {
    if (uv.route(event)) {
        return await uv.fetch(event);
    }

    await scramjet.loadConfig();
    if (scramjet.route(event)) {
        return scramjet.fetch(event);
    }
    return await fetch(event.request);
}

self.addEventListener('fetch', (event) => {
    event.respondWith(handleRequest(event));
});