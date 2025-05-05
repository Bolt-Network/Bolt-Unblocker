class Tab {
    constructor(url = 'https://www.duckduckgo.com/') {
        this.id = Math.random().toString(36).substr(2, 9);
        this.originalUrl = url;
        if (localStorage.getItem("proxy") == "uv") {
            this.url = uvEncode(url);
        }
        else {
            this.url = sjEncode(url);
        }
        this.title = 'New Tab';
        this.favicon = '/assets/imgs/logos/boltbrowser.svg';
        this.element = this.createTabElement();
        this.iframe = this.createIframe();
    }


    createTabElement() {
        const tab = document.createElement('div');
        tab.className = 'tab';
        tab.setAttribute('data-tab-id', this.id);
        tab.innerHTML = `
                    <img class="tab-favicon" src="${this.favicon}" alt="">
                    <span class="tab-title">${this.title}</span>
                    <button class="tab-close">
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                        </svg>
                    </button>
                `;
        return tab;
    }

    // In the Tab class, modify the createIframe method to add navigation tracking
    createIframe() {
        const iframe = document.createElement('iframe');
        iframe.id = `frame-${this.id}`;
        iframe.className = 'browser-frame';
        iframe.style.opacity = '0';
        iframe.style.zIndex = '1';

        iframe.src = this.url;

        iframe.addEventListener('load', () => {
            try {
                const title = iframe.contentWindow.document.title;
                // Update the originalUrl to match the current location
                try {
                    // This might fail due to cross-origin restrictions
                    this.originalUrl = iframe.contentWindow.location.href;
                    // Update URL bar with current URL
                    if (this.id === tabManager.activeTabId) {
                        document.getElementById('url-bar').value = this.originalUrl;
                    }
                } catch (e) {
                    // If we can't access the location due to CORS, we keep the original URL
                    console.log("Could not access iframe location due to CORS");
                }

                let favicon = '/assets/imgs/logos/boltbrowser.svg';

                const faviconEl = iframe.contentWindow.document.querySelector('link[rel="icon"], link[rel="shortcut icon"], link[rel="apple-touch-icon"]');
                if (faviconEl && faviconEl.href) {
                    favicon = faviconEl.href;
                } else {
                    const url = new URL(this.originalUrl);
                    favicon = `${url.protocol}//${url.hostname}/favicon.ico`;
                }

                this.update(title, favicon);
            } catch (err) {
                console.error("Error updating tab info:", err);
                this.update('New Tab', '/assets/imgs/logos/boltbrowser.svg');
            }
            document.querySelector('.browser-container').classList.remove('loading');
        });

        return iframe;
    }

    show() {
        if (this.iframe) {
            this.iframe.style.opacity = '1';
            this.iframe.style.zIndex = '2';
        }
    }

    hide() {
        if (this.iframe) {
            this.iframe.style.opacity = '0';
            this.iframe.style.zIndex = '1';
        }
    }

    remove() {
        this.element.remove();
        if (this.iframe) {
            this.iframe.remove();
        }
    }

    update(title, favicon) {
        this.title = title || 'New Tab';
        this.favicon = favicon || '/assets/imgs/logos/boltbrowser.svg';
        const titleEl = this.element.querySelector('.tab-title');
        const faviconEl = this.element.querySelector('.tab-favicon');
        titleEl.textContent = this.title;
        faviconEl.src = this.favicon;
    }
}

class TabManager {
    constructor() {
        this.tabs = new Map();
        this.activeTabId = null;
        this.tabsContainer = document.querySelector('.tabs-container');
        this.iframeContainer = document.querySelector('.iframe-container');
        this.draggedTab = null;
        this.draggedTabIndex = null;

        document.querySelector('.new-tab-button').addEventListener('click', () => this.createTab());

        // Initialize drag and drop functionality
        this.initDragAndDrop();
    }

    initDragAndDrop() {
        // Use event delegation for drag events on the tabs container
        this.tabsContainer.addEventListener('dragstart', this.handleDragStart.bind(this));
        this.tabsContainer.addEventListener('dragover', this.handleDragOver.bind(this));
        this.tabsContainer.addEventListener('dragenter', this.handleDragEnter.bind(this));
        this.tabsContainer.addEventListener('dragleave', this.handleDragLeave.bind(this));
        this.tabsContainer.addEventListener('drop', this.handleDrop.bind(this));
        this.tabsContainer.addEventListener('dragend', this.handleDragEnd.bind(this));
    }

    handleDragStart(e) {
        const tabElement = e.target.closest('.tab');
        if (!tabElement) return;

        // Prevent drag on close button
        if (e.target.closest('.tab-close')) {
            e.preventDefault();
            return;
        }

        this.draggedTab = tabElement;
        this.draggedTabIndex = Array.from(this.tabsContainer.children).indexOf(tabElement);

        // Set data transfer properties
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', tabElement.getAttribute('data-tab-id'));

        // Add a class to style the dragged tab
        setTimeout(() => {
            tabElement.classList.add('dragging');
        }, 0);
    }

    handleDragOver(e) {
        if (!this.draggedTab) return;
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';

        const targetTab = e.target.closest('.tab');
        if (!targetTab || targetTab === this.draggedTab) return;

        // Determine if we're hovering above or below the target tab
        const targetRect = targetTab.getBoundingClientRect();
        const midpoint = targetRect.top + (targetRect.height / 2);

        // Remove all drop indicators first
        document.querySelectorAll('.tab').forEach(tab => {
            tab.classList.remove('drop-above', 'drop-below');
        });

        // Add appropriate drop indicator
        if (e.clientY < midpoint) {
            targetTab.classList.add('drop-above');
        } else {
            targetTab.classList.add('drop-below');
        }
    }

    handleDragEnter(e) {
        const targetTab = e.target.closest('.tab');
        if (targetTab && targetTab !== this.draggedTab) {
            targetTab.classList.add('drag-over');
        }
    }

    handleDragLeave(e) {
        const targetTab = e.target.closest('.tab');
        if (targetTab) {
            targetTab.classList.remove('drag-over');
        }
    }

    handleDrop(e) {
        e.preventDefault();
        if (!this.draggedTab) return;

        const targetTab = e.target.closest('.tab');
        if (!targetTab || targetTab === this.draggedTab) {
            this.resetDragState();
            return;
        }

        // Determine if we're dropping above or below the target tab
        const targetRect = targetTab.getBoundingClientRect();
        const midpoint = targetRect.top + (targetRect.height / 2);

        if (e.clientY < midpoint) {
            // Drop above
            this.tabsContainer.insertBefore(this.draggedTab, targetTab);
        } else {
            // Drop below
            this.tabsContainer.insertBefore(this.draggedTab, targetTab.nextSibling);
        }

        this.resetDragState();
    }

    handleDragEnd() {
        this.resetDragState();
    }

    resetDragState() {
        // Remove all visual indicators
        document.querySelectorAll('.tab').forEach(tab => {
            tab.classList.remove('dragging', 'drag-over', 'drop-above', 'drop-below');
        });

        this.draggedTab = null;
        this.draggedTabIndex = null;
    }

    createTab() {
        const tab = new Tab();
        this.tabs.set(tab.id, tab);
        this.tabsContainer.appendChild(tab.element);
        this.iframeContainer.appendChild(tab.iframe);

        // Make the tab draggable
        tab.element.setAttribute('draggable', 'true');

        tab.element.addEventListener('click', (e) => {
            if (!e.target.closest('.tab-close')) {
                this.activateTab(tab.id);
            }
        });

        tab.element.querySelector('.tab-close').addEventListener('click', (e) => {
            e.stopPropagation();
            this.closeTab(tab.id);
        });

        this.activateTab(tab.id);
        return tab;
    }


    activateTab(tabId) {
        const newTab = this.tabs.get(tabId);
        if (!newTab) {
            console.error(`Tab with ID ${tabId} not found`);
            return;
        }

        if (this.activeTabId) {
            const oldTab = this.tabs.get(this.activeTabId);
            if (oldTab) {
                oldTab.element.classList.remove('active');
                oldTab.hide();
            }
        }

        this.activeTabId = tabId;
        newTab.element.classList.add('active');
        newTab.show();

        // Update URL bar with the current tab's URL
        var setUrl = newTab.originalUrl;
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
    }

    closeTab(tabId) {
        const tab = this.tabs.get(tabId);
        if (!tab) return;


        const tabsArray = Array.from(this.tabs.keys());
        const closingTabIndex = tabsArray.indexOf(tabId);


        tab.remove();
        this.tabs.delete(tabId);


        if (this.activeTabId === tabId) {
            const remainingTabs = Array.from(this.tabs.keys());
            if (remainingTabs.length) {

                const newActiveIndex = Math.max(0, closingTabIndex - 1);
                const newTabId = remainingTabs[newActiveIndex];


                if (this.tabs.has(newTabId)) {
                    this.activateTab(newTabId);
                } else if (remainingTabs.length > 0) {

                    this.activateTab(remainingTabs[0]);
                } else {

                    this.createTab();
                }
            } else {

                this.createTab();
            }
        }
    }


    navigateToUrl(url) {
        if (this.activeTabId) {
            const tab = this.tabs.get(this.activeTabId);
            tab.originalUrl = url;
            if (localStorage.getItem("proxy") == "uv") {
                tab.url = uvEncode(url);
            }
            else {
                tab.url = sjEncode(url);
            }
            tab.iframe.src = tab.url;
        }
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
