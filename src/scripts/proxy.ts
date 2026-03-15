import { BareMuxConnection } from '@mercuryworkshop/bare-mux';

// temp: change default to lib
const wispUrl = (location.protocol === "https:" ? "wss" : "ws") + "://" + location.host + "/wisp/";
const bareUrl = (location.protocol === "https:" ? "https" : "http") + "://" + location.host + "/bare/";
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
export const swReady = new Promise<void>((resolve) => {
    if ('serviceWorker' in navigator) {
        const settings = JSON.parse(localStorage.getItem('bolt-settings') || '{}');
        const engine = settings.proxyEngine || 'scramjet';
        const swPath = engine === 'ultraviolet' ? '/uv-sw.js' : '/sw.js';

        navigator.serviceWorker.register(swPath).then(() => {
            if (navigator.serviceWorker.controller) {
                resolve();
            } else {
                navigator.serviceWorker.addEventListener('controllerchange', () => resolve());
            }
        });
    } else {
        resolve();
    }
});

const bmc = new BareMuxConnection("/baremux/worker.js");
(async () => {
    if (!await bmc.getTransport()) {
        await bmc.setTransport(transport, [{ wisp: wispUrl }]);
    }
})();

function getProxyEngine(): string {
    try {
        const settings = JSON.parse(localStorage.getItem('bolt-settings') || '{}');
        return settings.proxyEngine || 'scramjet';
    } catch {
        return 'scramjet';
    }
}

function encodeUrl(url: string): string {
    const engine = getProxyEngine();

    if (engine === 'ultraviolet') {
        const encoded = uvXorEncode(url);
        return '/maths/' + encoded;
    }

    return scramjet.encodeUrl(url);
}

function uvXorEncode(str: string): string {
    if (!str) return str;
    let result = '';
    for (let i = 0; i < str.length; i++) {
        if (i % 2) {
            result += String.fromCharCode(str.charCodeAt(i) ^ 2);
        } else {
            result += str[i];
        }
    }
    return encodeURIComponent(result);
}

function decodeProxiedUrl(proxiedUrl: string): string {
    const engine = getProxyEngine();

    if (engine === 'ultraviolet' && proxiedUrl.includes('/maths/')) {
        const encoded = proxiedUrl.split('/maths/')[1];
        if (encoded) {
            return uvXorDecode(encoded);
        }
    }

    if (proxiedUrl.includes('/$/')) {
        return decodeURIComponent(proxiedUrl.split('/$/')[1] || proxiedUrl);
    }

    return proxiedUrl;
}

function uvXorDecode(str: string): string {
    if (!str) return str;
    let [input, ...search] = str.split('?');

    let decodedInput = decodeURIComponent(input);
    let result = '';
    for (let i = 0; i < decodedInput.length; i++) {
        if (i % 2) {
            result += String.fromCharCode(decodedInput.charCodeAt(i) ^ 2);
        } else {
            result += decodedInput[i];
        }
    }
    return result + (search.length ? '?' + search.join('?') : '');
}

function isProxiedUrl(url: string): boolean {
    return url.includes('/$/') || url.includes('/maths/');
}

function getProxyPrefix(): string {
    return getProxyEngine() === 'ultraviolet' ? '/maths/' : '/$/';
}

const proxy = {
    encodeUrl,
    decodeProxiedUrl,
    isProxiedUrl,
    getProxyPrefix,
    getProxyEngine,
    scramjet,
};

export default proxy;