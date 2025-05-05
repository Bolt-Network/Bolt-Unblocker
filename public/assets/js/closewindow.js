function closeWindow() {
    const currentWindow = window.frameElement;
    if (currentWindow && currentWindow.classList.contains('window')) {
        currentWindow.classList.add('closing');

        window.parent.postMessage({
            type: 'closeWindow',
            windowId: currentWindow.id
        }, '*');

        setTimeout(function () {
            if (currentWindow.parentNode) {
                currentWindow.remove();
            }
        }, 500);
    }
}
window.closeWindow = closeWindow;

window.addEventListener('beforeunload', function () {
    closeWindow();
});