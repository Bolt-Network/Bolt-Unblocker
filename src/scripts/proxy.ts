import { BareMuxConnection } from '@mercuryworkshop/bare-mux';

// temp: change default to lib
const wispUrl = (location.protocol === "https:" ? "wss" : "ws") + "://" + location.host + "/wisp/";
var transport = "/libcurl/index.mjs";
const { ScramjetController } = typeof $scramjetLoadController !== 'undefined' ? $scramjetLoadController() : {
    ScramjetController: class {
        init() { }
        encodeUrl(url: string) { return url; }
    } as any
};

if (localStorage.getItem('transport') === 'lib') {
    transport = '/libcurl/index.mjs';
}

const scramjet = new ScramjetController({
    files: {
        wasm: "/learn/scramjet.wasm.wasm",
        all: "/learn/scramjet.all.js",
        sync: "/learn/scramjet.sync.js",
    },
    flags: {
        rewriterLogs: false,
        scramitize: false,
        cleanErrors: true,
        sourcemaps: true,
    },
    siteFlags: {

    },
    prefix: '/$/'
});

if (scramjet.init) scramjet.init();
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register("/sw.js");
}

const bmc = new BareMuxConnection("/baremux/worker.js");
bmc.setTransport(transport, [{ wisp: wispUrl }]);

export default scramjet;