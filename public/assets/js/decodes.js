function uvDecodeUrl(url) {
    const decodedUrl = __uv$config.decodeUrl(url);
    return decodedUrl;
}
window.uvDecodeUrl = uvDecodeUrl;

function sjDecodeUrl(url) {
    const decodedUrl = decodeURIComponent(url);
    return decodedUrl;
}
window.sjDecodeUrl = sjDecodeUrl;