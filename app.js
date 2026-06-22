import Fastify from "fastify";
import fastifyStatic from "@fastify/static";
import { libcurlPath } from "@mercuryworkshop/libcurl-transport";
import { baremuxPath } from "@mercuryworkshop/bare-mux/node";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { hostname } from "node:os";
import { server as wisp } from "@mercuryworkshop/wisp-js/server";

const epoxyPath = fileURLToPath(new URL("./node_modules/@mercuryworkshop/epoxy-tls/full", import.meta.url));



try { process.loadEnvFile(); } catch { /* .env not present or Node is too old */ }

const __dirname = process.cwd();
const publicPath = join(__dirname, "dist");

const fastify = Fastify({
    logger: true,
});

fastify.addHook("onSend", async (request, reply, payload) => {
    // Always set these headers - they're needed for BroadcastChannel in iframes
    reply.header("Cross-Origin-Opener-Policy", "same-origin");
    reply.header("Cross-Origin-Embedder-Policy", "require-corp");
    reply.header("Cross-Origin-Resource-Policy", "cross-origin");
    return payload;
});
fastify.server.on("upgrade", (req, socket, head) => {
    console.log(`[WISP] Upgrade request: ${req.url}`);
    try {
        wisp.routeRequest(req, socket, head);
    } catch (err) {
        console.error(`[WISP] Error routing request:`, err);
        socket.destroy();
    }
});

// Explicit WISP endpoint for debugging
fastify.get("/wisp/", (request, reply) => {
    console.log("[WISP] GET request to /wisp/ (should be WebSocket)");
    return reply.send({ error: "Use WebSocket, not HTTP" });
});


await fastify.register(fastifyStatic, {
    root: publicPath,
    prefix: "/"
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

await fastify.register(fastifyStatic, {
    root: epoxyPath,
    prefix: "/epoxy/",
    decorateReply: false,
    setHeaders: (res, path) => {
        if (path.endsWith('.js') || path.endsWith('.mjs')) {
            res.setHeader('Content-Type', 'application/javascript');
        }
    }
});


fastify.get("/wisp-health", (request, reply) => {
    return reply.send({ status: "ok", wisp: "reachable" });
});

fastify.get("/", (request, reply) => {
    return reply.sendFile("index.html");
});


fastify.post("/api/chat", async (request, reply) => {
    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
        return reply.status(500).send({ error: "API key not configured on server." });
    }

    const upstream = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json",
            "HTTP-Referer": request.headers["origin"] ?? "",
            "X-Title": "Bolt AI",
        },
        body: JSON.stringify(request.body),
    });

    const data = await upstream.json();
    return reply.status(upstream.status).send(data);
});

fastify.post("/api/deepreset", async (request, reply) => {
    const cookieNames = ["session", "auth-token", "refresh-token"];

    for (const name of cookieNames) {
        reply.header(
            "Set-Cookie",
            `${name}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 UTC; HttpOnly; SameSite=Lax`
        );
    }

    reply.header("Clear-Site-Data", '"cache", "cookies", "storage"');

    return reply.status(200).send({ ok: true });
});


fastify.setNotFoundHandler((request, reply) => {
    return reply.send("404 Not Found");
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