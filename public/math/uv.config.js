/*global Ultraviolet*/
self.__uv$config = {
    prefix: '/maths/',
    wisp: (location.protocol === 'https:' ? 'wss://' : 'ws://') + location.host + '/wisp/',
    encodeUrl: Ultraviolet.codec.base64.encode,
    decodeUrl: Ultraviolet.codec.base64.decode,
    handler: '/math/uv.handler.js',
    client: '/math/uv.client.js',
    bundle: '/math/uv.bundle.js',
    config: '/math/uv.config.js',
    sw: '/math/uv.sw.js',
};
