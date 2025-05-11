var iframe = document.getElementById('iframe');


function attachClickHandler() {
    var innerDoc = iframe.contentDocument || iframe.contentWindow.document;
    var letsgoButton = innerDoc.getElementById('letsgo');

    if (letsgoButton) {
        letsgoButton.addEventListener('click', function () {
            iframe.src = '/srcdocs/name.html';
        });
    }
}


iframe.addEventListener('load', attachClickHandler);


iframe.contentWindow.addEventListener('DOMContentLoaded', attachClickHandler);