// epoxy-transport.mjs
// bare-mux v2 compatible transport using Epoxy TLS (WASM TCP proxy)
// Connects at TCP/TLS level — bypasses JS rewriting detection on heavy sites

let EpoxyClient, EpoxyClientOptions, EpoxyHandlers;

async function loadEpoxy() {
    if (EpoxyClient) return;
    const mod = await import('/epoxy/epoxy-bundled.js');
    // Must call the default export (__wbg_init) to initialize the WASM binary
    // before any class constructors (EpoxyClient, EpoxyClientOptions, etc.) work
    await mod.default();
    EpoxyClient = mod.EpoxyClient;
    EpoxyClientOptions = mod.EpoxyClientOptions;
    EpoxyHandlers = mod.EpoxyHandlers;
}

export default class EpoxyTransport {
    constructor(config) {
        this.wispUrl = config?.[0]?.wisp ?? ('wss://' + self.location.host + '/wisp/');
        this.client = null;
        this._initPromise = null;
    }

    async init() {
        if (this._initPromise) return this._initPromise;
        this._initPromise = (async () => {
            await loadEpoxy();
            const options = new EpoxyClientOptions();
            options.user_agent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36';
            this.client = new EpoxyClient(this.wispUrl, options);
        })();
        return this._initPromise;
    }

    async request(url, method, body, headers, _signal) {
        if (!this.client) await this.init();

        const fetchHeaders = {};
        if (headers) {
            for (const [k, v] of Object.entries(headers)) {
                fetchHeaders[k] = Array.isArray(v) ? v.join(', ') : v;
            }
        }

        const response = await this.client.fetch(url.toString(), {
            method: method || 'GET',
            headers: fetchHeaders,
            body: body ?? undefined,
            redirect: 'follow',
        });

        const responseHeaders = {};
        response.headers.forEach((v, k) => { responseHeaders[k] = v; });

        return {
            status: response.status,
            statusText: response.statusText,
            headers: responseHeaders,
            body: response.body,
        };
    }

    connect(url, protocols, requestHeaders, onopen, onmessage, onclose, onerror) {
        let ws = null;

        (async () => {
            try {
                if (!this.client) await this.init();

                const wsHeaders = {};
                if (requestHeaders) {
                    for (const [k, v] of Object.entries(requestHeaders)) {
                        wsHeaders[k] = Array.isArray(v) ? v.join(', ') : v;
                    }
                }

                const handlers = new EpoxyHandlers(
                    (protocol) => onopen(protocol || (protocols?.[0] ?? '')),
                    (code, reason) => onclose(code ?? 1000, reason ?? ''),
                    (err) => onerror(err?.toString() ?? 'Epoxy WebSocket error'),
                    (data) => {
                        if (data instanceof ArrayBuffer) {
                            onmessage(data);
                        } else if (typeof data === 'string') {
                            onmessage(data);
                        } else {
                            onmessage(data.buffer ?? data);
                        }
                    }
                );

                ws = await this.client.connect_websocket(
                    handlers,
                    url.toString(),
                    protocols ?? [],
                    wsHeaders
                );
            } catch (e) {
                onerror(e?.message ?? 'Epoxy WebSocket connection failed');
            }
        })();

        const send = async (data) => {
            if (ws) {
                try {
                    await ws.send(typeof data === 'string' ? data : new Uint8Array(data instanceof ArrayBuffer ? data : data));
                } catch (e) {
                    console.error('Epoxy send error:', e);
                }
            }
        };

        const close = async (code, reason) => {
            if (ws) {
                try { await ws.close(code ?? 1000, reason ?? ''); } catch {}
            }
        };

        return [send, close];
    }

    meta() {
        return { url: this.wispUrl };
    }
}
