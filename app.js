import express from "express";
import { createServer } from "node:http";
import { epoxyPath } from "@mercuryworkshop/epoxy-transport";
import { libcurlPath } from "@mercuryworkshop/libcurl-transport";
import { baremuxPath } from "@mercuryworkshop/bare-mux/node";
import { join } from "node:path";
import { hostname } from "node:os";
import { server as wisp } from "@mercuryworkshop/wisp-js/server";

const __dirname = process.cwd();
const app = express();

const publicPath = join(__dirname, "public");
app.use(express.static(publicPath));
app.use("/epoxy/", express.static(epoxyPath));
app.use("/libcurl/", express.static(libcurlPath));
app.use("/baremux/", express.static(baremuxPath));

const server = createServer();

app.get("/games", (req, res) => {
    res.sendFile(join(publicPath, "games.html"));
});

app.get("/apps", (req, res) => {
    res.sendFile(join(publicPath, "apps.html"));
});

app.get("/chat", (req, res) => {
    res.sendFile(join(publicPath, "chat.html"));
});

app.get("/settings", (req, res) => {
    res.sendFile(join(publicPath, "settings.html"));
});

app.get("/browser", (req, res) => {
    res.sendFile(join(publicPath, "browser.html"));
});

app.get("/", (req, res) => {
    res.sendFile(join(publicPath, "index.html"));
});

app.use((req, res) => {
    res.status(404);
    res.sendFile(join(publicPath, "index.html"));
});


server.on("request", (req, res) => {
    res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
    res.setHeader("Cross-Origin-Embedder-Policy", "anonymous");
    app(req, res);
});

server.on("upgrade", (req, socket, head) => {
    wisp.routeRequest(req, socket, head);
});

let port = parseInt(process.env.PORT || "8080");

if (isNaN(port)) port = 8080;

server.on("listening", () => {
    const address = server.address();

    // by default we are listening on 0.0.0.0 (every interface)
    // we just need to list a few
    console.log("Listening on:");
    console.log(`\thttp://localhost:${address.port}`);
    console.log(`\thttp://${hostname()}:${address.port}`);
    console.log(
        `\thttp://${address.family === "IPv6" ? `[${address.address}]` : address.address
        }:${address.port}`
    );

});

// https://expressjs.com/en/advanced/healthcheck-graceful-shutdown.html
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

function shutdown() {
    console.log("SIGTERM signal received: closing HTTP server");
    server.close();
    process.exit(0);
}

server.listen({
    port,
});