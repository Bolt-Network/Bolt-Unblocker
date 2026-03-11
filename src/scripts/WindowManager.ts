import Window from "./Window";

export default class WindowManager {
    private windows: Map<string, Window> = new Map();
    private windowCounter = 0;
    private baseZIndex = 1000;
    private currentMaxZIndex = 1000;
    private static instance: WindowManager;
    private focusedWindow: Window | null = null;

    constructor() {
        if (WindowManager.instance) {
            return WindowManager.instance;
        }
        WindowManager.instance = this;
    }

    private listeners: Map<string, Function[]> = new Map();

    /**
     * Add an event listener
     */
    public addEventListener(event: string, callback: Function): void {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event)?.push(callback);
    }

    /**
     * Remove an event listener
     */
    public removeEventListener(event: string, callback: Function): void {
        const eventListeners = this.listeners.get(event);
        if (eventListeners) {
            const index = eventListeners.indexOf(callback);
            if (index !== -1) {
                eventListeners.splice(index, 1);
            }
        }
    }

    /**
     * Emit an event
     */
    private emit(event: string, payload: any): void {
        const eventListeners = this.listeners.get(event);
        if (eventListeners) {
            eventListeners.forEach(callback => callback(payload));
        }
    }

    /**
     * Get the singleton instance of WindowManager
     */
    static getInstance(): WindowManager {
        if (!WindowManager.instance) {
            WindowManager.instance = new WindowManager();
        }
        return WindowManager.instance;
    }

    /**
     * Generate a unique ID for a new window
     */
    generateWindowId(): string {
        this.windowCounter++;
        return `window-${this.windowCounter}`;
    }

    /**
     * Open a window
     */
    openWindow(url: string, title: string, icon: string, startMaximized: boolean = false, credentialless: boolean = false): void {
        new Window({ url, title, icon, startMaximized, credentialless });
    }

    /**
     * Get the next z-index value for layering
     */
    getNextZIndex(): number {
        this.currentMaxZIndex++;
        return this.currentMaxZIndex;
    }

    /**
     * Add a window to the manager
     */
    addWindow(window: Window): void {
        if (!window || !window.id) {
            console.error("Cannot add window: invalid window or missing ID");
            return;
        }

        if (this.windows.has(window.id)) {
            console.warn(`Window with ID ${window.id} already exists`);
            return;
        }

        this.windows.set(window.id, window);
        this.emit("windowAdded", window);
        console.log(`Window ${window.id} added. Total windows: ${this.windows.size}`);
    }

    /**
     * Remove a window from the manager
     */
    removeWindow(window: Window): void {
        if (!window || !window.id) {
            console.error("Cannot remove window: invalid window or missing ID");
            return;
        }

        if (this.windows.has(window.id)) {
            this.windows.delete(window.id);
            this.emit("windowRemoved", window);

            // Clear focused window if it was removed
            if (this.focusedWindow === window) {
                this.focusedWindow = null;
            }

            console.log(`Window ${window.id} removed. Total windows: ${this.windows.size}`);
        }
    }

    /**
     * Get a window by its ID
     */
    getWindow(id: string): Window | undefined {
        return this.windows.get(id);
    }

    /**
     * Get a window by its title
     */
    getWindowByTitle(title: string): Window | undefined {
        for (const window of this.windows.values()) {
            if (window.getTitle() === title) {
                return window;
            }
        }
        return undefined;
    }

    /**
     * Get all windows as an array
     */
    getWindows(): Window[] {
        return Array.from(this.windows.values());
    }

    /**
     * Get the number of windows currently managed
     */
    getWindowCount(): number {
        return this.windows.size;
    }

    getWindowById(id: string): Window | undefined {
        return this.windows.get(id);
    }

    /**
     * Bring a window to the front (focus)
     */
    focusWindow(window: Window): void {

        if (!window || !this.windows.has(window.id)) {
            return;
        }
        if (window.isMinimized) {
            window.minimize();
        }
        this.focusedWindow = window;
        this.emit("windowFocused", window);
        window.bringToFront();
    }

    unfocusWindow(window: Window): void {
        if (!window || !this.windows.has(window.id)) {
            return;
        }
        if (this.focusedWindow === window) {
            this.focusedWindow = null;
            this.emit("windowUnfocused", window);
        }
    }

    maximizeWindow(window: Window): void {
        if (!window || !this.windows.has(window.id)) {
            return;
        }
        this.focusWindow(window);
        window.maximize();
    }

    minimizeWindow(window: Window): void {
        if (!window || !this.windows.has(window.id)) {
            return;
        }
        if (this.focusedWindow === window) {
            this.unfocusWindow(window);
        }
        window.minimize();
    }

    /**
     * Get the currently focused window
     */
    getFocusedWindow(): Window | null {
        return this.focusedWindow;
    }

    /**
     * Close all windows
     */
    closeAllWindows(): void {
        const windowsArray = Array.from(this.windows.values());
        windowsArray.forEach(window => window.destroy());
    }
}