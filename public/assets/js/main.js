async function init() {
    try {
        const connection = new BareMux.BareMuxConnection("/baremux/worker.js");
        const wispUrl = (location.protocol === "https:" ? "wss" : "ws") + "://" + location.host + "/wisp/";
        if (localStorage.getItem("transport") == "epoxy") {
            if (await connection.getTransport() !== "/epoxy/index.mjs") {
                await connection.setTransport("/epoxy/index.mjs", [{ wisp: wispUrl }]);
                console.log("Using Epoxy transport. Wisp URL is: " + wispUrl);
            }
        }
        else if (localStorage.getItem("transport") == "libcurl") {
            if (await connection.getTransport() !== "/libcurl/index.mjs") {
                await connection.setTransport("/libcurl/index.mjs", [{ wisp: wispUrl }]);
                console.log("Using Libcurl transport. Wisp URL is: " + wispUrl);
            }
        }
        else {
            localStorage.setItem("transport", "epoxy");
            if (await connection.getTransport() !== "/epoxy/index.mjs") {
                await connection.setTransport("/epoxy/index.mjs", [{ wisp: wispUrl }]);
                console.log("Using Epoxy transport. Wisp URL is: " + wispUrl);
            }
        }

    } catch (err) {
        console.error("An error occurred while setting up baremux:", err);
    }
}


if (!localStorage.getItem("proxy")) {
    localStorage.setItem("proxy", "uv");
}

const scramjet = new ScramjetController({
    prefix: "/scram/service/",
    files: {
        wasm: "/scram/scramjet.wasm.wasm",
        worker: "/scram/scramjet.worker.js",
        client: "/scram/scramjet.client.js",
        shared: "/scram/scramjet.shared.js",
        sync: "/scram/scramjet.sync.js"
    },
    flags: {
        "serviceworkers": false,
        "syncxhr": false,
        "naiiveRewriter": false,
        "strictRewrites": true,
        "rewriterLogs": false,
        "captureErrors": false,
        "cleanErrors": false,
        "scramitize": false,
        "sourcemaps": true
    },
});
window.sj = scramjet;
scramjet.init();

if (navigator.serviceWorker) {
    navigator.serviceWorker.getRegistrations().then(registrations => {
        if (registrations.length === 0) {
            try {
                navigator.serviceWorker.register("sw.js").then(() => {
                    console.log("Service worker registered.");
                });
            } catch (err) {
                console.error("An error occurred while registering service worker:", err);
            }
        }
    });
}
init();