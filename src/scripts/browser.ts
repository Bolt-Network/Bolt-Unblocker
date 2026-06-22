import { BareMuxConnection } from '@mercuryworkshop/bare-mux';
import dummyProxy, { swReady } from "./encoding";

const wispUrl = (location.protocol === "https:" ? "wss" : "ws") + "://" + location.host + "/wisp/";

function getTransport(): string {
    try {
        const settings = JSON.parse(localStorage.getItem('bolt-settings') || '{}');
        return settings.transport || 'libcurl';
    } catch {
        return 'libcurl';
    }
}

const transportPath = getTransport() === 'epoxy'
    ? '/epoxy-transport.mjs'
    : '/libcurl/index.mjs';

const bmc = new BareMuxConnection("/baremux/worker.js");
export const transportReady: Promise<void> = (async () => {
    await bmc.setTransport(transportPath, [{ wisp: wispUrl }]);
})();

// --- Site Alert Logic ---
let siteAlerts: any[] = [];
let shownAlerts: Set<string> = new Set();

async function loadSiteAlerts() {
    try {
        const response = await fetch('/json/site-alerts.json');
        if (!response.ok) throw new Error("Failed to fetch site-alerts.json");
        siteAlerts = await response.json();
    } catch (err) {
        console.error('Failed to load site alerts:', err);
    }
}

loadSiteAlerts();

function checkForSiteAlerts(url: string) {
    if (!url || url === 'about:blank' || url.startsWith('bolt://') || siteAlerts.length === 0) return;

    for (const entry of siteAlerts) {
        const entrySite = entry.site ? entry.site.toLowerCase() : '';
        const lowerUrl = url.toLowerCase();

        const matchesSite = entrySite && lowerUrl.includes(entrySite);
        const matchesKeyword = entry.keywords && entry.keywords.some((kw: string) => lowerUrl.includes(kw.toLowerCase()));

        if (matchesSite || matchesKeyword) {
            const alertId = entry.site || (entry.keywords && entry.keywords[0]) || 'generic-alert';
            if (!shownAlerts.has(alertId)) {
                shownAlerts.add(alertId);

                const notifyFn = (window.top as any)?.notify || (window as any).notify;
                if (notifyFn) {
                    notifyFn({
                        title: "Site Alert",
                        desc: entry.alert,
                        img: "/img/warning.webp",
                        lifespan: 12,
                        important: true,
                        buttons: entry.button ? [
                            {
                                label: entry.button,
                                primary: true,
                                onClick: () => {
                                    if (entry.buttonAction) {
                                        try {
                                            if (window.top) {
                                                (window.top as any).eval(entry.buttonAction);
                                            } else {
                                                new Function(entry.buttonAction)();
                                            }
                                        } catch (e) {
                                            console.error("Failed to execute alert action:", e);
                                        }
                                    }
                                }
                            }
                        ] : []
                    });
                }
            }
        }
    }
}

const urlParams = new URLSearchParams(window.location.search);
const settings = JSON.parse(localStorage.getItem('bolt-settings') || '{}');
const url = urlParams.get('url');
const searchEngine = settings.searchEngine || 'duckduckgo';
let searchEngineUrl = '';

switch (searchEngine) {
    case 'duckduckgo':
        searchEngineUrl = 'https://duckduckgo.com/?q=';
        break;
    case 'google':
        searchEngineUrl = 'https://www.google.com/search?q=';
        break;
    case 'bing':
        searchEngineUrl = 'https://www.bing.com/search?q=';
        break;
    case 'yahoo':
        searchEngineUrl = 'https://search.yahoo.com/search?q=';
        break;
    case 'brave':
        searchEngineUrl = 'https://search.brave.com/search?q=';
        break;
}

/**
 * Represents a single Tab object.
 * This is the "Blueprint" (Class).
 */
class Tab {
    id: string;
    title: string;
    url: string;
    iframe: HTMLIFrameElement | null = null;
    isActive: boolean;
    hasIframe: boolean = false;

    element: HTMLElement | null = null;
    isDragging: boolean = false;

    constructor(id: string, title: string, url: string = 'about:blank') {
        this.id = id;
        this.title = title;
        this.url = url;
        this.isActive = false;
    }

    getResolvedUrl(): string {
        if (this.url === 'about:blank') return 'about:blank';
        if (this.url.startsWith('bolt://')) {
            return '/' + this.url.replace('bolt://', '');
        }
        return this.url;
    }

    render() {
        if (!this.element) {
            this.element = document.createElement('div');
        }

        if (!this.iframe) {
            this.iframe = document.createElement('iframe');
            this.iframe.src = this.getResolvedUrl();
        } else {
            try {
                const currentActualUrl = this.iframe.contentWindow?.location.href;
                const targetUrl = this.url === 'about:blank' ? 'about:blank' : new URL(this.getResolvedUrl(), window.location.href).href;

                if (currentActualUrl !== targetUrl && this.iframe.src !== targetUrl) {
                    this.iframe.src = this.getResolvedUrl();
                }
            } catch (err) {
                if (this.iframe.src !== this.getResolvedUrl()) {
                    this.iframe.src = this.getResolvedUrl();
                }
            }
        }

        this.element.className = `tab ${this.isActive ? 'active' : ''}`;
        this.element.id = `tab-${this.id}`;

        this.element.innerHTML = `
            <p>${this.title}</p>
            <button class="close-tab-button" data-id="${this.id}">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M18 6L6 18M6 6L18 18"></path>
                </svg>
            </button>
        `;

        return { tabElement: this.element, iframe: this.iframe };
    }
}

/**
 * Manages the collection of Tab objects.
 * This is the "Orchestrator".
 */
class TabManager {
    tabs: Tab[] = [];
    activeTabId: string | null = null;
    tabsContainer: HTMLElement;
    webSection: HTMLElement;

    draggedTab: Tab | null = null;
    draggedOverTab: Tab | null = null;
    dragStartX: number = 0;
    dragStartY: number = 0;

    constructor(containerId: string, webSectionId: string) {
        this.tabsContainer = document.getElementById(containerId) as HTMLElement;
        this.webSection = document.getElementById(webSectionId) as HTMLElement;

        const addressInput = document.getElementById('address-input') as HTMLInputElement;
        addressInput?.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                let destinationUrl = '';
                let finalUrl = '';

                if (addressInput.value.startsWith('bolt://')) {
                    destinationUrl = addressInput.value;
                    finalUrl = destinationUrl;
                } else if (addressInput.value.startsWith('https://') || addressInput.value.startsWith('http://')) {
                    destinationUrl = addressInput.value;
                    finalUrl = dummyProxy.encodeUrl(destinationUrl);
                } else if (addressInput.value.includes('.') && !addressInput.value.includes(' ')) {
                    destinationUrl = 'https://' + addressInput.value;
                    finalUrl = dummyProxy.encodeUrl(destinationUrl);
                } else {
                    destinationUrl = searchEngineUrl + addressInput.value;
                    finalUrl = dummyProxy.encodeUrl(destinationUrl);
                }

                this.updateActiveTabUrl(finalUrl);
            }
        });

        document.getElementById('back-button')?.addEventListener('click', () => {
            const activeTab = this.tabs.find(t => t.id === this.activeTabId);
            if (activeTab?.iframe) activeTab.iframe.contentWindow?.history.back();
        });

        document.getElementById('forward-button')?.addEventListener('click', () => {
            const activeTab = this.tabs.find(t => t.id === this.activeTabId);
            if (activeTab?.iframe) activeTab.iframe.contentWindow?.history.forward();
        });

        document.getElementById('reload-button')?.addEventListener('click', () => {
            const activeTab = this.tabs.find(t => t.id === this.activeTabId);
            if (activeTab?.iframe) {
                try {
                    activeTab.iframe.contentWindow?.location.reload();
                } catch (e) {
                    activeTab.iframe.src = activeTab.iframe.src;
                }
            }
        });
    }

    private popupTimeout: any = null;

    private showErrorPopup() {
        let popup = document.getElementById('error-popup');
        if (!popup) {
            popup = document.createElement('div');
            popup.id = 'error-popup';
            popup.innerHTML = `
                <div class="error-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="8" x2="12" y2="12"></line>
                        <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                </div>
                <span>Error detected, please reload the page</span>
            `;
            document.body.appendChild(popup);
        }

        if (this.popupTimeout) {
            clearTimeout(this.popupTimeout);
        }

        setTimeout(() => {
            popup?.classList.add('active');
        }, 10);

        this.popupTimeout = setTimeout(() => {
            popup?.classList.remove('active');
            this.popupTimeout = null;
        }, 6000);
    }

    updateActiveTabUrl(url: string) {
        const activeTab = this.tabs.find(tab => tab.id === this.activeTabId);
        if (activeTab) {
            activeTab.url = url;
            this.renderTabs();
        }
    }

    addTab(title: string, url: string = 'about:blank') {
        const id = Math.random().toString(36).substr(2, 9);
        const newTab = new Tab(id, title, url);
        this.tabs.push(newTab);
        this.activateTab(id);
    }

    removeTab(id: string) {
        const tabToRemove = this.tabs.find(t => t.id === id);
        if (tabToRemove && tabToRemove.iframe) {
            tabToRemove.iframe.remove();
        }

        this.tabs = this.tabs.filter(tab => tab.id !== id);

        if (this.activeTabId === id && this.tabs.length > 0) {
            this.activateTab(this.tabs[this.tabs.length - 1].id);
        } else {
            if (this.tabs.length === 0) {
                this.activeTabId = null;
            }
            this.renderTabs();
        }
    }

    activateTab(id: string) {
        this.activeTabId = id;
        this.tabs.forEach(tab => {
            tab.isActive = (tab.id === id);
        });
        this.renderTabs();
    }

    handleDragStart(tab: Tab, e: DragEvent) {
        this.draggedTab = tab;
        tab.isDragging = true;

        if (e.dataTransfer) {
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/html', tab.id);
        }

        setTimeout(() => {
            if (tab.element) {
                tab.element.classList.add('dragging');
            }
        }, 0);
    }

    handleDragOver(tab: Tab, e: DragEvent) {
        e.preventDefault();

        if (!this.draggedTab || this.draggedTab.id === tab.id) {
            return;
        }

        if (e.dataTransfer) {
            e.dataTransfer.dropEffect = 'move';
        }

        const targetElement = tab.element;
        if (!targetElement) return;

        const rect = targetElement.getBoundingClientRect();
        const midpoint = rect.left + rect.width / 2;

        document.querySelectorAll('.drag-over-left, .drag-over-right').forEach(el => {
            el.classList.remove('drag-over-left', 'drag-over-right');
        });

        if (e.clientX < midpoint) {
            targetElement.classList.add('drag-over-left');
        } else {
            targetElement.classList.add('drag-over-right');
        }

        this.draggedOverTab = tab;
    }

    handleDragLeave(tab: Tab, e: DragEvent) {
        if (tab.element) {
            tab.element.classList.remove('drag-over-left', 'drag-over-right');
        }
    }

    handleDrop(tab: Tab, e: DragEvent) {
        e.preventDefault();
        e.stopPropagation();

        if (!this.draggedTab || this.draggedTab.id === tab.id) {
            return;
        }

        const targetElement = tab.element;
        if (!targetElement) return;

        const rect = targetElement.getBoundingClientRect();
        const midpoint = rect.left + rect.width / 2;
        const insertBefore = e.clientX < midpoint;

        const draggedIndex = this.tabs.findIndex(t => t.id === this.draggedTab!.id);
        const targetIndex = this.tabs.findIndex(t => t.id === tab.id);

        if (draggedIndex !== -1 && targetIndex !== -1) {
            const [draggedTabObj] = this.tabs.splice(draggedIndex, 1);

            let newIndex = targetIndex;
            if (draggedIndex < targetIndex && !insertBefore) {
                newIndex = targetIndex;
            } else if (draggedIndex < targetIndex && insertBefore) {
                newIndex = targetIndex - 1;
            } else if (draggedIndex > targetIndex && insertBefore) {
                newIndex = targetIndex;
            } else {
                newIndex = targetIndex + 1;
            }

            this.tabs.splice(newIndex, 0, draggedTabObj);
        }

        this.renderTabs();
    }

    handleDragEnd(tab: Tab) {
        tab.isDragging = false;

        document.querySelectorAll('.dragging, .drag-over-left, .drag-over-right').forEach(el => {
            el.classList.remove('dragging', 'drag-over-left', 'drag-over-right');
        });

        this.draggedTab = null;
        this.draggedOverTab = null;
    }

    renderTabs() {
        if (!this.tabsContainer) return;

        const existingTabs = this.tabsContainer?.querySelectorAll('.tab');
        existingTabs?.forEach(el => el.remove());

        this.tabs.forEach(tab => {
            const { tabElement, iframe } = tab.render();

            tabElement.draggable = true;

            tabElement.addEventListener('dragstart', (e) => this.handleDragStart(tab, e as DragEvent));
            tabElement.addEventListener('dragover', (e) => this.handleDragOver(tab, e as DragEvent));
            tabElement.addEventListener('dragleave', (e) => this.handleDragLeave(tab, e as DragEvent));
            tabElement.addEventListener('drop', (e) => this.handleDrop(tab, e as DragEvent));
            tabElement.addEventListener('dragend', () => this.handleDragEnd(tab));

            tabElement.onclick = (e) => {
                if ((e.target as HTMLElement).closest('.close-tab-button')) {
                    return;
                }
                this.activateTab(tab.id);
            };

            if (this.webSection && !this.webSection.contains(iframe)) {
                this.webSection.appendChild(iframe);
            }

            iframe.classList.toggle('active', tab.isActive);

            const closeBtn = tabElement.querySelector('.close-tab-button') as HTMLElement;
            if (closeBtn) {
                closeBtn.onclick = (e: Event) => {
                    e.stopPropagation();
                    this.removeTab(tab.id);
                };
            }

            if (tab.isActive) {
                const addressInput = document.getElementById('address-input') as HTMLInputElement;
                if (addressInput) {
                    if (dummyProxy.isProxiedUrl(tab.url)) {
                        addressInput.value = dummyProxy.decodeProxiedUrl(tab.url);
                    } else {
                        addressInput.value = tab.url;
                    }
                }
            }

            iframe.onload = () => {
                const addressInput = document.getElementById('address-input') as HTMLInputElement;

                try {
                    const currentHref = iframe.contentWindow?.location.href;
                    if (currentHref && currentHref !== 'about:blank') {
                        if (currentHref.startsWith(window.location.origin) && !dummyProxy.isProxiedUrl(currentHref)) {
                            const path = new URL(currentHref).pathname.slice(1);
                            tab.url = 'bolt://' + (path || 'newtab');
                        } else {
                            tab.url = currentHref;
                        }
                    }
                } catch (e) {
                    // Ignore cross-origin errors
                }

                const newTitle = iframe.contentWindow?.document.title;
                if (newTitle && tab.title !== newTitle) {
                    tab.title = newTitle;
                    this.renderTabs();
                }

                if (newTitle === "Scramjet" || newTitle === "Ultraviolet" || newTitle === "404: Not Found" || newTitle === "Error") {
                    this.showErrorPopup();
                }

                if (addressInput && tab.isActive) {
                    let displayUrl = '';
                    if (dummyProxy.isProxiedUrl(tab.url)) {
                        displayUrl = dummyProxy.decodeProxiedUrl(tab.url);
                    } else {
                        displayUrl = tab.url;
                    }
                    addressInput.value = displayUrl;
                    checkForSiteAlerts(displayUrl);
                }
            }

            const newTabBtn = document.getElementById('new-tab');
            if (newTabBtn) {
                this.tabsContainer.insertBefore(tabElement, newTabBtn);
            } else {
                this.tabsContainer.appendChild(tabElement);
            }
        });
    }
}

// --- Initialization ---

// 1. Create the Manager Object
const myBrowser = new TabManager('tabs-section', 'web-section');

// 2. Hook up the "New Tab" button
const newTabBtn = document.getElementById('new-tab-button');
newTabBtn?.addEventListener('click', () => {
    myBrowser.addTab('Loading...', 'bolt://newtab');
});

// 3. Add a starting tab — wait for both SW and transport to be ready
Promise.all([swReady, transportReady]).then(() => {
    const initialDestination = url ? (url.startsWith('bolt://') ? url : dummyProxy.encodeUrl(url)) : ('bolt://newtab');
    myBrowser.addTab('Loading...', initialDestination);
});

// 4. Global Functions
function navigateTo(url: string) {
    let newUrl;
    if (url == "" || url == null) {
        return;
    }

    if (url.startsWith('https://') || url.startsWith('http://')) {
        newUrl = url;
    } else if (url.includes('.') && !url.includes(' ')) {
        newUrl = 'https://' + url;
    } else {
        newUrl = searchEngineUrl + url;
    }

    myBrowser.updateActiveTabUrl(dummyProxy.encodeUrl(newUrl));
}

function openNewTab() {
    myBrowser.addTab('Loading...', 'bolt://newtab');
}
export { navigateTo, openNewTab };

// Expose to window for iframes to call
(window as any).navigateTo = navigateTo;
(window as any).openNewTab = openNewTab;

// Listen for messages from iframes
window.addEventListener('message', (event) => {
    if (event.data.type === 'navigate') {
        navigateTo(event.data.url);
    } else if (event.data.type === 'openNewTab') {
        openNewTab();
    }
});
