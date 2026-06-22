if (navigator.userAgent.includes("Firefox")) {
    Object.defineProperty(globalThis, "crossOriginIsolated", {
        value: true,
        writable: false,
    });
}

importScripts("/math/uv.bundle.js");
importScripts("/math/uv.config.js");
importScripts("/math/uv.sw.js");
importScripts("/learn/scramjet.all.js");

const { ScramjetServiceWorker } = $scramjetLoadWorker();
const uv = new UVServiceWorker(self.__uv$config);
const scramjet = new ScramjetServiceWorker();

// Load scramjet config ONCE at startup, not on every request
let scramjetReady = scramjet.loadConfig().catch(err =>
    console.error("Scramjet initial config load failed:", err)
);

// Headers that block proxied sites from loading in iframes
const STRIP_RESPONSE_HEADERS = [
    "x-frame-options",
    "content-security-policy",
    "content-security-policy-report-only",
    "cross-origin-opener-policy",
    "cross-origin-embedder-policy",
    "cross-origin-resource-policy",
    "permissions-policy",
    "x-content-type-options",
];

function stripBlockingHeaders(response) {
    const headers = new Headers(response.headers);
    let stripped = false;
    for (const h of STRIP_RESPONSE_HEADERS) {
        if (headers.has(h)) {
            headers.delete(h);
            stripped = true;
        }
    }
    if (!stripped) return response;
    return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers,
    });
}

async function handleRequest(event) {
    try {
        // Only use Ultraviolet - Scramjet config loading fails
        if (uv.route(event)) {
            const response = await uv.fetch(event);
            return stripBlockingHeaders(response);
        }
    } catch (error) {
        console.error("UV Proxy Error:", error);
        return new Response(
            `<html><body style="font-family:sans-serif;padding:2rem;background:#111;color:#eee">
                <h2>Proxy Error</h2>
                <p>${error.message || "Failed to load resource."}</p>
                <button onclick="history.back()" style="padding:.5rem 1rem;cursor:pointer;background:#333;color:#eee;border:none;border-radius:6px">Go Back</button>
            </body></html>`,
            { status: 503, headers: { "Content-Type": "text/html" } }
        );
    }

    return fetch(event.request);
}

self.addEventListener("fetch", (event) => {
    event.respondWith(handleRequest(event));
});

self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(keys.map((k) => caches.delete(k)))
        )
    );
    self.clients.claim();
});

self.addEventListener("install", () => {
    self.skipWaiting();
});

let playgroundData;
self.addEventListener("message", ({ data }) => {
    if (data.type === "playgroundData") {
        playgroundData = data;
    }
});

scramjet.addEventListener("request", (e) => {
    if (playgroundData && e.url.href.startsWith(playgroundData.origin)) {
        const headers = {};
        const origin = playgroundData.origin;
        if (e.url.href === origin + "/") {
            headers["content-type"] = "text/html";
            e.response = new Response(playgroundData.html, { headers });
        } else if (e.url.href === origin + "/style.css") {
            headers["content-type"] = "text/css";
            e.response = new Response(playgroundData.css, { headers });
        } else if (e.url.href === origin + "/script.js") {
            headers["content-type"] = "application/javascript";
            e.response = new Response(playgroundData.js, { headers });
        } else {
            e.response = new Response("empty response", { headers });
        }
        e.response.rawHeaders = headers;
        e.response.rawResponse = {
            body: e.response.body,
            headers: headers,
            status: e.response.status,
            statusText: e.response.statusText,
        };
        e.response.finalURL = e.url.toString();
    } else {
        return;
    }
});
