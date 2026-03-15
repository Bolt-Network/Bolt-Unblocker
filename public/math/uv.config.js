/*global Ultraviolet*/
self.__uv$config = {
    prefix: '/maths/',
    bare: '/bare/',
    wisp: (location.protocol === 'https:' ? 'wss://' : 'ws://') + location.host + '/wisp/',
    encodeUrl: Ultraviolet.codec.xor.encode,
    decodeUrl: Ultraviolet.codec.xor.decode,
    handler: '/math/uv.handler.js',
    client: '/math/uv.client.js',
    bundle: '/math/uv.bundle.js',
    config: '/math/uv.config.js',
    sw: '/math/uv.sw.js',
};
