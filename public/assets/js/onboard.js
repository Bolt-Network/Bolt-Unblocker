var iframe = document.getElementById('iframe');

// Function to attach the click handler
function attachClickHandler() {
    var innerDoc = iframe.contentDocument || iframe.contentWindow.document;
    var letsgoButton = innerDoc.getElementById('letsgo');

    if (letsgoButton) {
        letsgoButton.addEventListener('click', function () {
            iframe.src = '/srcdocs/name.html';
        });
    }
}

// Listen for iframe load event
iframe.addEventListener('load', attachClickHandler);

// Also try to attach on DOMContentLoaded for redundancy
iframe.contentWindow.addEventListener('DOMContentLoaded', attachClickHandler);