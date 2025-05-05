var closeButton = document.getElementById('close-button');
var frame = document.getElementById('frame');
var loadingIndicator = document.getElementById('loading-indicator');
closeButton.addEventListener('click', closeWindow);

if (loadingIndicator) {
    loadingIndicator.classList.add('active');
    frame.onload = function () {
        loadingIndicator.classList.remove('active');
    };
}

if (frame) {
    if (localStorage.getItem("launchertarget")) {
        if (!localStorage.getItem("proxy")) {
            localStorage.setItem("proxy", "uv");
            frame.src = uvEncode(localStorage.getItem("launchertarget"));
        }
        if (localStorage.getItem("proxy") == "uv") {
            frame.src = uvEncode(localStorage.getItem("launchertarget"));
        } else {
            frame.src = sjEncode(localStorage.getItem("launchertarget"));
        }
    }
    else {
        alert("No target URL provided.");
        closeWindow();
    }
}

function uvEncode(url) {
    const encodedUrl = __uv$config.prefix + __uv$config.encodeUrl(url);
    return encodedUrl;
}

function sjEncode(url) {
    const encodedUrl = scramjet.encodeUrl(url);
    return encodedUrl;
}


