document.addEventListener('DOMContentLoaded', function () {
    const urlBar = document.getElementById('url-bar');
    const goButton = document.getElementById('go-button');
    const refreshButton = document.getElementById('refresh-button');
    const backButton = document.getElementById('back-button');
    const forwardButton = document.getElementById('forward-button');
    const closeButton = document.getElementById('close-button');
    const tooltip = document.getElementById('tooltip');
    const tabManager = new TabManager();
    tabManager.createTab();
    const sidebarToggle = document.querySelector('.sidebar-toggle');
    const sidebar = document.querySelector('.tab-sidebar');
    const browserContainer = document.querySelector('.browser-container');

    const searchQuery = localStorage.getItem("searchQuery");
    if (searchQuery) {
        localStorage.removeItem("searchQuery");

        if (urlBar) {
            urlBar.value = searchQuery;
        }

        setTimeout(() => {
            navigateToUrl();
        }, 300);
    }

    document.addEventListener("performSearch", function () {
        const searchQuery = localStorage.getItem("searchQuery");
        if (searchQuery) {
            localStorage.removeItem("searchQuery");

            if (urlBar) {
                urlBar.value = searchQuery;
            }

            navigateToUrl();
        }
    });

    window.addEventListener('message', function (event) {
        if (event.data && event.data.type === 'navigate') {
            let url = event.data.url;

            if (!url.includes('.') && !url.startsWith('http')) {
                url = 'https://' + localStorage.getItem('searchEngine') + '.com/search?q=' + encodeURIComponent(url);
            } else if (!/^https?:\/\//i.test(url) && !url.startsWith('/')) {
                url = 'https://' + url;
            }

            const tab = tabManager.createTab();

            if (urlBar) {
                urlBar.value = url;
            }

            tabManager.navigateToUrl(url);
        }
    });

    sidebarToggle.addEventListener('click', () => {
        sidebar.classList.toggle('collapsed');
        browserContainer.classList.toggle('sidebar-collapsed');

        localStorage.setItem('sidebar-collapsed', sidebar.classList.contains('collapsed'));

        const svgPath = sidebarToggle.querySelector('svg path');
        if (sidebar.classList.contains('collapsed')) {
            svgPath.setAttribute('d', 'M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z');
        } else {
            svgPath.setAttribute('d', 'M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z');
        }
    });

    if (localStorage.getItem('sidebar-collapsed') === 'true') {
        sidebar.classList.add('collapsed');
        browserContainer.classList.add('sidebar-collapsed');
        const svgPath = sidebarToggle.querySelector('svg path');
        svgPath.setAttribute('d', 'M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z');
    }

    window.dispatchEvent(new Event('resize'));

    function navigateToUrl() {
        let url = urlBar.value.trim();

        if (!url) return;

        document.querySelector('.browser-container').classList.add('loading');

        if (!url.includes('.') && !url.startsWith('http')) {
            url = "https://" + localStorage.getItem("searchEngine") + ".com/search?q=" + encodeURIComponent(url);
        } else if (!/^https?:\/\//i.test(url)) {
            url = 'https://' + url;
        }

        tabManager.navigateToUrl(url);

    }

    function refreshPage() {
        const activeTab = tabManager.getActiveTab();
        if (activeTab && activeTab.iframe) {
            document.querySelector('.browser-container').classList.add('loading');
            activeTab.iframe.contentWindow.location.reload();
        }
    }

    function goBack() {
        const activeTab = tabManager.getActiveTab();
        if (activeTab && activeTab.iframe) {
            document.querySelector('.browser-container').classList.add('loading');
            try {
                activeTab.iframe.contentWindow.history.back();
            } catch (err) {
                console.log('Cannot access cross-origin history');
            }
        }
    }

    function goForward() {
        const activeTab = tabManager.getActiveTab();
        if (activeTab && activeTab.iframe) {
            document.querySelector('.browser-container').classList.add('loading');
            try {
                activeTab.iframe.contentWindow.history.forward();
            } catch (err) {
                console.log('Cannot access cross-origin history');
            }
        }
    }
    // Add this to the DOMContentLoaded event handler in browser.js
    function setupIframeNavMonitoring() {
        // Use MutationObserver to detect when iframes are added
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach((node) => {
                        if (node.tagName === 'IFRAME') {
                            monitorIframeNavigation(node);
                        }
                    });
                }
            });
        });

        observer.observe(document.querySelector('.iframe-container'), { childList: true });

        // Also monitor existing iframes
        document.querySelectorAll('.iframe-container iframe').forEach(iframe => {
            monitorIframeNavigation(iframe);
        });
    }

    function monitorIframeNavigation(iframe) {
        try {
            iframe.addEventListener('load', () => {
                const tabId = iframe.id.replace('frame-', '');
                const tab = tabManager.tabs.get(tabId);

                if (tab && tabManager.activeTabId === tabId) {
                    try {
                        // Try to get the current URL from the iframe
                        const currentUrl = iframe.contentWindow.location.href;
                        var setUrl = currentUrl;
                        tab.originalUrl = currentUrl;
                        setUrl = setUrl.replace(window.location.origin, '');
                        if (setUrl.includes('uv')) {
                            setUrl = setUrl.replace('/uv/service/', '');
                            setUrl = uvDecodeUrl(setUrl);
                        }
                        if (setUrl.includes('scram')) {
                            setUrl = setUrl.replace('/scram/service/', '');
                            setUrl = sjDecodeUrl(setUrl);
                        }
                        document.getElementById('url-bar').value = setUrl;
                    } catch (e) {
                        // CORS might prevent access to location
                        console.log("Could not access iframe location due to CORS");
                    }
                }
            });
        } catch (e) {
            console.error("Error setting up iframe navigation monitoring", e);
        }
    }

    setupIframeNavMonitoring();

    TabManager.prototype.getActiveTab = function () {
        return this.tabs.get(this.activeTabId);
    };

    if (goButton) goButton.addEventListener('click', navigateToUrl);
    if (refreshButton) refreshButton.addEventListener('click', refreshPage);
    if (backButton) backButton.addEventListener('click', goBack);
    if (forwardButton) forwardButton.addEventListener('click', goForward);
    if (closeButton) closeButton.addEventListener('click', closeWindow);

    if (urlBar) {
        urlBar.addEventListener('keydown', function (e) {
            if (e.key === 'Enter') {
                navigateToUrl();
            }
        });
    }

    setupTooltips();



    function setupTooltips() {
        const buttons = document.querySelectorAll('.control-button');

        buttons.forEach(button => {
            button.addEventListener('mouseenter', function (e) {
                const title = this.getAttribute('title');
                if (title && tooltip) {
                    const rect = this.getBoundingClientRect();
                    tooltip.textContent = title;
                    tooltip.style.opacity = '1';
                    tooltip.style.top = rect.bottom + 8 + 'px';
                    tooltip.style.left = rect.left + rect.width / 2 - tooltip.offsetWidth / 2 + 'px';
                }
            });

            button.addEventListener('mouseleave', function () {
                if (tooltip) {
                    tooltip.style.opacity = '0';
                }
            });
        });
    }
});
