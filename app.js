import Fastify from "fastify";
import fastifyStatic from "@fastify/static";
import { epoxyPath } from "@mercuryworkshop/epoxy-transport";
import { libcurlPath } from "@mercuryworkshop/libcurl-transport";
import { baremuxPath } from "@mercuryworkshop/bare-mux/node";
import { join } from "node:path";
import { hostname } from "node:os";
import { server as wisp } from "@mercuryworkshop/wisp-js/server";
import { createServer } from "node:http";

const __dirname = process.cwd();
const publicPath = join(__dirname, "public");

const fastify = Fastify({
    logger: true,
    serverFactory: (handler) => {
        const server = createServer((req, res) => {
            res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
            res.setHeader("Cross-Origin-Embedder-Policy", "anonymous");
            handler(req, res);
        });

        server.on("upgrade", (req, socket, head) => {
            wisp.routeRequest(req, socket, head);
        });

        return server;
    }
});


await fastify.register(fastifyStatic, {
    root: publicPath,
    prefix: "/"
});


await fastify.register(fastifyStatic, {
    root: epoxyPath,
    prefix: "/epoxy/",
    decorateReply: false
});

fastify.addContentTypeParser('application/javascript', { parseAs: 'string' }, (req, body, done) => {
    done(null, body);
});

await fastify.register(fastifyStatic, {
    root: libcurlPath,
    prefix: "/libcurl/",
    decorateReply: false,
    setHeaders: (res, path, stat) => {
        if (path.endsWith('.mjs')) {
            res.setHeader('Content-Type', 'application/javascript');
        }
    }
});

await fastify.register(fastifyStatic, {
    root: baremuxPath,
    prefix: "/baremux/",
    decorateReply: false
});


fastify.get("/", (request, reply) => {
    return reply.sendFile("index.html");
});


fastify.setNotFoundHandler((request, reply) => {
    return reply.sendFile("index.html");
});


function shutdown() {
    console.log("SIGTERM signal received: closing HTTP server");
    fastify.close();
    process.exit(0);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);


let port = parseInt(process.env.PORT || "8080");
if (isNaN(port)) port = 8080;

try {
    const address = await fastify.listen({ port, host: "0.0.0.0" });
    console.log("Listening on:");
    console.log(`\thttp://localhost:${port}`);
    console.log(`\thttp://${hostname()}:${port}`);

    const serverAddress = fastify.server.address();
    console.log(
        `\thttp://${serverAddress.family === "IPv6" ? `[${serverAddress.address}]` : serverAddress.address}:${serverAddress.port}`
    );
} catch (err) {
    fastify.log.error(err);
    process.exit(1);
}