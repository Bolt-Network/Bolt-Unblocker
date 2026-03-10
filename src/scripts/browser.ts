import scramjet from "./proxy";
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

    /**
     * Resolves the URL for the iframe src.
     * bolt://page -> /page
     */
    getResolvedUrl(): string {
        if (this.url === 'about:blank') return 'about:blank';
        if (this.url.startsWith('bolt://')) {
            return '/' + this.url.replace('bolt://', '');
        }
        return this.url;
    }

    /**
     * This "method" creates or updates the visual HTML for the tab.
     */
    render() {
        if (!this.element) {
            this.element = document.createElement('div');
        }

        if (!this.iframe) {
            this.iframe = document.createElement('iframe');
            this.iframe.src = this.getResolvedUrl();
        } else {

            try {
                const currentSrc = this.iframe.src;
                const targetUrl = this.url === 'about:blank' ? 'about:blank' : new URL(this.getResolvedUrl(), window.location.href).href;


                if (currentSrc !== targetUrl) {
                    this.iframe.src = this.getResolvedUrl();
                }
            } catch (err) {
                // Fallback for invalid URLs
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

    // Drag and drop state
    draggedTab: Tab | null = null;
    draggedOverTab: Tab | null = null;
    dragStartX: number = 0;
    dragStartY: number = 0;

    constructor(containerId: string, webSectionId: string) {
        this.tabsContainer = document.getElementById(containerId) as HTMLElement;
        this.webSection = document.getElementById(webSectionId) as HTMLElement;

        // Add event listener for address bar
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
                    finalUrl = scramjet.encodeUrl(destinationUrl);
                } else if (addressInput.value.includes('.') && !addressInput.value.includes(' ')) {
                    destinationUrl = 'https://' + addressInput.value;
                    finalUrl = scramjet.encodeUrl(destinationUrl);
                } else {
                    destinationUrl = searchEngineUrl + addressInput.value;
                    finalUrl = scramjet.encodeUrl(destinationUrl);
                }

                this.updateActiveTabUrl(finalUrl);
            }
        });

        // Hook up navigation buttons
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
            if (activeTab?.iframe) activeTab.iframe.src = activeTab.iframe.src;
        });
    }

    /**
     * Updates the URL of the currently active tab.
     */
    updateActiveTabUrl(url: string) {
        const activeTab = this.tabs.find(tab => tab.id === this.activeTabId);
        if (activeTab) {
            activeTab.url = url;
            this.renderTabs();
        }
    }

    /**
     * Adds a new Tab object to our list and the screen.
     */
    addTab(title: string, url: string = 'about:blank') {
        const id = Math.random().toString(36).substr(2, 9);
        const newTab = new Tab(id, title, url);

        this.tabs.push(newTab);
        // We only call activateTab here, which will trigger renderTabs
        this.activateTab(id);
    }

    /**
     * Removes a Tab object from our list.
     */
    removeTab(id: string) {
        const tabToRemove = this.tabs.find(t => t.id === id);
        if (tabToRemove && tabToRemove.iframe) {
            tabToRemove.iframe.remove();
        }

        this.tabs = this.tabs.filter(tab => tab.id !== id);

        // If we closed the active tab, pick a new one
        if (this.activeTabId === id && this.tabs.length > 0) {
            this.activateTab(this.tabs[this.tabs.length - 1].id);
        } else {
            if (this.tabs.length === 0) {
                this.activeTabId = null;
            }
            this.renderTabs();
        }
    }

    /**
     * Switches which tab is currently "Active".
     */
    activateTab(id: string) {
        this.activeTabId = id;
        this.tabs.forEach(tab => {
            tab.isActive = (tab.id === id);
        });
        this.renderTabs();
    }

    /**
     * Handles the start of a drag operation
     */
    handleDragStart(tab: Tab, e: DragEvent) {
        this.draggedTab = tab;
        tab.isDragging = true;

        if (e.dataTransfer) {
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/html', tab.id);
        }

        // Add dragging class for visual feedback
        setTimeout(() => {
            if (tab.element) {
                tab.element.classList.add('dragging');
            }
        }, 0);
    }

    /**
     * Handles dragging over another tab
     */
    handleDragOver(tab: Tab, e: DragEvent) {
        e.preventDefault();

        if (!this.draggedTab || this.draggedTab.id === tab.id) {
            return;
        }

        if (e.dataTransfer) {
            e.dataTransfer.dropEffect = 'move';
        }

        // Get the position to determine if we should insert before or after
        const targetElement = tab.element;
        if (!targetElement) return;

        const rect = targetElement.getBoundingClientRect();
        const midpoint = rect.left + rect.width / 2;

        // Remove previous drag-over classes
        document.querySelectorAll('.drag-over-left, .drag-over-right').forEach(el => {
            el.classList.remove('drag-over-left', 'drag-over-right');
        });

        // Add appropriate class based on cursor position
        if (e.clientX < midpoint) {
            targetElement.classList.add('drag-over-left');
        } else {
            targetElement.classList.add('drag-over-right');
        }

        this.draggedOverTab = tab;
    }

    /**
     * Handles the drag leave event
     */
    handleDragLeave(tab: Tab, e: DragEvent) {
        if (tab.element) {
            tab.element.classList.remove('drag-over-left', 'drag-over-right');
        }
    }

    /**
     * Handles dropping a tab
     */
    handleDrop(tab: Tab, e: DragEvent) {
        e.preventDefault();
        e.stopPropagation();

        if (!this.draggedTab || this.draggedTab.id === tab.id) {
            return;
        }

        // Determine drop position
        const targetElement = tab.element;
        if (!targetElement) return;

        const rect = targetElement.getBoundingClientRect();
        const midpoint = rect.left + rect.width / 2;
        const insertBefore = e.clientX < midpoint;

        // Reorder the tabs array
        const draggedIndex = this.tabs.findIndex(t => t.id === this.draggedTab!.id);
        const targetIndex = this.tabs.findIndex(t => t.id === tab.id);

        if (draggedIndex !== -1 && targetIndex !== -1) {
            // Remove the dragged tab from its current position
            const [draggedTabObj] = this.tabs.splice(draggedIndex, 1);

            // Calculate the new index
            let newIndex = targetIndex;
            if (draggedIndex < targetIndex && !insertBefore) {
                // If dragging forward and dropping after, don't adjust
                newIndex = targetIndex;
            } else if (draggedIndex < targetIndex && insertBefore) {
                // If dragging forward and dropping before
                newIndex = targetIndex - 1;
            } else if (draggedIndex > targetIndex && insertBefore) {
                // If dragging backward and dropping before
                newIndex = targetIndex;
            } else {
                // If dragging backward and dropping after
                newIndex = targetIndex + 1;
            }

            // Insert at the new position
            this.tabs.splice(newIndex, 0, draggedTabObj);
        }

        this.renderTabs();
    }

    /**
     * Handles the end of a drag operation
     */
    handleDragEnd(tab: Tab) {
        tab.isDragging = false;

        // Clean up all drag-related classes
        document.querySelectorAll('.dragging, .drag-over-left, .drag-over-right').forEach(el => {
            el.classList.remove('dragging', 'drag-over-left', 'drag-over-right');
        });

        this.draggedTab = null;
        this.draggedOverTab = null;
    }

    /**
     * Updates the UI to match our internal list of Tab objects.
     */
    renderTabs() {
        if (!this.tabsContainer) return;

        // Clear only the tab elements from the tabs-section
        const existingTabs = this.tabsContainer?.querySelectorAll('.tab');
        existingTabs?.forEach(el => el.remove());

        this.tabs.forEach(tab => {
            const { tabElement, iframe } = tab.render();

            // Make tab draggable
            tabElement.draggable = true;

            // Set up drag event listeners
            tabElement.addEventListener('dragstart', (e) => this.handleDragStart(tab, e as DragEvent));
            tabElement.addEventListener('dragover', (e) => this.handleDragOver(tab, e as DragEvent));
            tabElement.addEventListener('dragleave', (e) => this.handleDragLeave(tab, e as DragEvent));
            tabElement.addEventListener('drop', (e) => this.handleDrop(tab, e as DragEvent));
            tabElement.addEventListener('dragend', () => this.handleDragEnd(tab));

            // Set up event listeners (use onclick to avoid duplicates if element is reused)
            tabElement.onclick = (e) => {
                // Don't activate if we're clicking the close button
                if ((e.target as HTMLElement).closest('.close-tab-button')) {
                    return;
                }
                this.activateTab(tab.id);
            };

            // Ensure the iframe is in the web-section
            if (this.webSection && !this.webSection.contains(iframe)) {
                this.webSection.appendChild(iframe);
            }

            // Sync iframe visibility
            iframe.classList.toggle('active', tab.isActive);

            // Set up close button
            const closeBtn = tabElement.querySelector('.close-tab-button') as HTMLElement;
            if (closeBtn) {
                closeBtn.onclick = (e: Event) => {
                    e.stopPropagation();
                    this.removeTab(tab.id);
                };
            }

            // If this tab is active, update the address bar
            if (tab.isActive) {
                const addressInput = document.getElementById('address-input') as HTMLInputElement;
                if (addressInput) {
                    if (tab.url.includes("/$/")) {
                        addressInput.value = decodeURIComponent(tab.url.split("/$/")[1]);
                    } else {
                        addressInput.value = tab.url;
                    }

                }
            }

            iframe.onload = () => {
                const addressInput = document.getElementById('address-input') as HTMLInputElement;
                const newTitle = iframe.contentWindow?.document.title;
                if (newTitle && tab.title !== newTitle) {
                    tab.title = newTitle;
                    this.renderTabs();
                }
                if (newTitle === "Scramjet" || newTitle === "404: Not Found") {
                    iframe.contentWindow?.location.reload();
                }

                if (addressInput) {
                    const currentHref = iframe.contentWindow?.location.href || '';

                    if (tab.url.includes("/$/")) {
                        addressInput.value = decodeURIComponent(currentHref.split("/$/")[1] || currentHref);
                    } else if (currentHref.startsWith(window.location.origin) && !currentHref.includes('/$/')) {
                        const path = new URL(currentHref).pathname.slice(1);
                        addressInput.value = 'bolt://' + path;
                    } else {
                        addressInput.value = currentHref;
                    }
                }
            }

            // Insert the tab element into the container
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

// 3. Add a starting tab
const initialDestination = url ? (url.startsWith('bolt://') ? url : scramjet.encodeUrl(url)) : ('bolt://newtab');
myBrowser.addTab('Loading...', initialDestination);

//4. Global Functions
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

    myBrowser.updateActiveTabUrl(scramjet.encodeUrl(newUrl));
}

function openNewTab() {
    myBrowser.addTab('Loading...', 'bolt://newtab');
}
export { navigateTo, openNewTab };

// Expose to window for iframes to call
(window as any).navigateTo = navigateTo;
(window as any).openNewTab = openNewTab;

// Listen for messages from iframes (alternative to direct calls)
window.addEventListener('message', (event) => {
    if (event.data.type === 'navigate') {
        navigateTo(event.data.url);
    } else if (event.data.type === 'openNewTab') {
        openNewTab();
    }
});