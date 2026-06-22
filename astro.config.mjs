import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";

import { server as wisp } from "@mercuryworkshop/wisp-js/server";
import { libcurlPath } from "@mercuryworkshop/libcurl-transport";
import { baremuxPath } from "@mercuryworkshop/bare-mux/node";
import sirv from "sirv";
import { fileURLToPath } from "node:url";

const epoxyPath = fileURLToPath(new URL("./node_modules/@mercuryworkshop/epoxy-tls/full", import.meta.url));

function customDevServer() {
    return {
        name: 'custom-dev-server',
        hooks: {
            'astro:server:setup': ({ server }) => {
                const attachWisp = () => {
                    if (server.httpServer) {
                        server.httpServer.on('upgrade', (req, socket, head) => {
                            if (req.url.startsWith("/wisp/")) {
                                wisp.routeRequest(req, socket, head);
                            }
                        });
                    }
                };

                if (server.httpServer) {
                    attachWisp();
                } else {
                    server.middlewares.use((_req, _res, next) => {
                        if (!server._wispAttached && server.httpServer) {
                            server._wispAttached = true;
                            attachWisp();
                        }
                        next();
                    });
                }

                server.middlewares.use((req, res, next) => {
                    res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
                    res.setHeader("Cross-Origin-Embedder-Policy", "credentialless");
                    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
                    next();
                });

                server.middlewares.use('/baremux/', sirv(baremuxPath, { dev: true, etag: true }));
                server.middlewares.use('/epoxy/', sirv(epoxyPath, { dev: true, etag: true }));

                const serveLibcurl = sirv(libcurlPath, { dev: true, etag: true });
                server.middlewares.use('/libcurl/', (req, res, next) => {
                    if (req.originalUrl.endsWith('.mjs')) {
                        res.setHeader('Content-Type', 'application/javascript');
                    }
                    serveLibcurl(req, res, next);
                });
            },
        },
    };
}

export default defineConfig({
    root: "./",
    outDir: "./dist",
    publicDir: "./public",
    srcDir: "./src",
    server: {
        host: "0.0.0.0",
        port: 5000,
        allowedHosts: true,
    },
    vite: {
        plugins: [tailwindcss()],
        server: {
            allowedHosts: true,
        }
    },
    build: {
        concurrency: 1
    },
    integrations: [
        customDevServer()
    ]
});
