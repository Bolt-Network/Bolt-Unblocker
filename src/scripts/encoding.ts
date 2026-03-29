export const swReady = new Promise<void>((resolve) => {
    resolve();
});

function getProxyEngine(): string {
    try {
        const settings = JSON.parse(window.top?.localStorage.getItem('bolt-settings') || '{}');
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

    return '/$/' + encodeURIComponent(url);
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

const dummyProxy = {
    encodeUrl,
    decodeProxiedUrl,
    isProxiedUrl,
    getProxyPrefix,
    getProxyEngine,
};

export default dummyProxy;