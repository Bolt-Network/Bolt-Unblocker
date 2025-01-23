async function init() {
    try {
        const scramjet = new ScramjetController({
            prefix: "/scram/service/",
            files: {
                wasm: "/scram/scramjet.wasm.js",
                worker: "/scram/scramjet.worker.js",
                client: "/scram/scramjet.client.js",
                shared: "/scram/scramjet.shared.js",
                sync: "/scram/scramjet.sync.js"
            },
        });
        window.sj = scramjet;
        scramjet.init("/sw.js");


    } catch (error) {
        console.error("Error setting up uv & sj", error);
    }
}
init();