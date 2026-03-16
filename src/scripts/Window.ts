import WindowManager from "./WindowManager";

export interface WindowOptions {
    url: string;
    title: string;
    icon?: string;
    startMaximized?: boolean;
    width?: number;
    height?: number;
    credentialless?: boolean;
    backgroundWindow?: boolean;
}

export default class AppWindow {
    public readonly id: string;
    private title: string;
    private icon: string;
    private element: HTMLDivElement | null = null;
    private manager: WindowManager;
    private zIndex: number;

    public isMinimized = false;
    public isMaximized = false;
    private isDragging = false;
    private isResizing = false;
    private resizeType: string = '';
    private dragOffset = { x: 0, y: 0 };
    private currentPos = { x: 0, y: 0 };
    private currentSize = { width: 0, height: 0 };
    private backgroundWindow = false;

    constructor(options: WindowOptions) {
        // Get WindowManager singleton
        this.manager = WindowManager.getInstance();

        // Generate unique ID
        this.id = this.manager.generateWindowId();

        // Store title and icon
        this.title = options.title;
        this.icon = options.icon || "";

        // Store background status
        this.backgroundWindow = options.backgroundWindow || false;

        // Get initial z-index
        if (this.backgroundWindow) {
            this.zIndex = -10000;
        } else {
            this.zIndex = this.manager.getNextZIndex();
        }

        // Create the window DOM
        this.create(options);

        // Register with WindowManager
        this.manager.addWindow(this);

        // Focus the window on creation if it's not a background window
        if (!this.backgroundWindow) {
            this.focus();
        }
    }

    private create(options: WindowOptions) {
        const win = document.createElement('div');
        win.className = 'app-window';
        win.setAttribute('data-window-id', this.id);

        if (options.startMaximized) {
            win.classList.add('maximized');
        }

        // Set z-index
        win.style.zIndex = String(this.zIndex);

        // Set initial position and size
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const initialWidth = viewportWidth * 0.8;
        const initialHeight = viewportHeight * 0.8;

        this.currentSize = {
            width: options.width || initialWidth,
            height: options.height || initialHeight
        };
        this.currentPos = {
            x: (viewportWidth - (options.width || initialWidth)) / 2,
            y: (viewportHeight - (options.height || initialHeight)) / 2
        };

        this.updatePosition(win);
        this.updateSize(win);

        win.innerHTML = `
            <div class="window-header">
                <div class="window-header-left">
                    <div class="window-header-left-buttons">
                        <div class="window-header-left-button-close" title="Close"></div>
                        <div class="window-header-left-button-minimize" title="Minimize"></div>
                        <div class="window-header-left-button-maximize" title="Maximize"></div>
                    </div>
                    <div class="window-header-left-title">${options.title}</div>
                </div>
                <div class="window-header-right">
                    <div class="window-header-right-buttons">
                        <div class="window-header-right-button-close"></div>
                        <div class="window-header-right-button-minimize"></div>
                        <div class="window-header-right-button-maximize"></div>
                    </div>
                </div>
            </div>
            <div class="window-content">
                <div class="iframe-overlay" style="display: none; position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 5;"></div>
                 <iframe src="${options.url}" title="${options.title}" ${options.credentialless ? 'credentialless="true"' : ''}></iframe>
            </div>
            <!-- Resize Handles -->
            <div class="window-resize-handle n" data-resize="n"></div>
            <div class="window-resize-handle s" data-resize="s"></div>
            <div class="window-resize-handle e" data-resize="e"></div>
            <div class="window-resize-handle w" data-resize="w"></div>
            <div class="window-resize-handle nw" data-resize="nw"></div>
            <div class="window-resize-handle ne" data-resize="ne"></div>
            <div class="window-resize-handle sw" data-resize="sw"></div>
            <div class="window-resize-handle se" data-resize="se"></div>
        `;

        document.body.appendChild(win);

        // Store reference to the element
        this.element = win;

        // Add button functionality with stopPropagation to prevent dragging
        const buttons = win.querySelectorAll('.window-header-left-button-close, .window-header-left-button-minimize, .window-header-left-button-maximize, .window-header-right-button-close, .window-header-right-button-minimize, .window-header-right-button-maximize');

        buttons.forEach(btn => {
            btn.addEventListener('mousedown', (e) => e.stopPropagation());
            btn.addEventListener('touchstart', (e) => e.stopPropagation());
        });

        const closeBtn = win.querySelector('.window-header-left-button-close');
        closeBtn?.addEventListener('click', (e) => {
            e.stopPropagation();
            this.destroy();
        });

        const closeBtnRight = win.querySelector('.window-header-right-button-close');
        closeBtnRight?.addEventListener('click', (e) => {
            e.stopPropagation();
            this.destroy();
        });

        const maximizeBtn = win.querySelector('.window-header-left-button-maximize');
        maximizeBtn?.addEventListener('click', (e) => {
            e.stopPropagation();
            this.manager.maximizeWindow(this);
        });

        const minimizeBtn = win.querySelector('.window-header-left-button-minimize');
        minimizeBtn?.addEventListener('click', (e) => {
            e.stopPropagation();
            this.manager.minimizeWindow(this);
        });

        // Add drag functionality
        this.addDragFunctionality(win);

        // Add resize functionality
        this.addResizeFunctionality(win);

        // Add click-to-focus functionality
        win.addEventListener('mousedown', () => this.focus());
    }

    private addDragFunctionality(win: HTMLDivElement) {
        const header = win.querySelector('.window-header') as HTMLDivElement;
        const overlay = win.querySelector('.iframe-overlay') as HTMLDivElement;

        if (!header) return;

        // Mouse events
        header.addEventListener('mousedown', (e) => {
            this.startDrag(e, win);
            if (overlay) overlay.style.display = 'block';
        });
        document.addEventListener('mousemove', (e) => this.onDrag(e, win));
        document.addEventListener('mouseup', () => {
            if (this.isDragging) {
                this.endDrag();
                if (overlay) overlay.style.display = 'none';
            }
        });

        // Touch events for mobile
        header.addEventListener('touchstart', (e) => {
            this.startDrag(e.touches[0], win);
            if (overlay) overlay.style.display = 'block';
        }, { passive: false });
        document.addEventListener('touchmove', (e) => this.onDrag(e.touches[0], win), { passive: false });
        document.addEventListener('touchend', () => {
            if (this.isDragging) {
                this.endDrag();
                if (overlay) overlay.style.display = 'none';
            }
        });
    }

    private addResizeFunctionality(win: HTMLDivElement) {
        const handles = win.querySelectorAll('.window-resize-handle');
        const overlay = win.querySelector('.iframe-overlay') as HTMLDivElement;

        handles.forEach(handle => {
            const h = handle as HTMLDivElement;
            const type = h.getAttribute('data-resize') || '';

            h.addEventListener('mousedown', (e) => {
                this.startResize(e, type, win);
                if (overlay) overlay.style.display = 'block';
                e.stopPropagation(); // Prevent drag when resizing
            });

            h.addEventListener('touchstart', (e) => {
                this.startResize(e.touches[0], type, win);
                if (overlay) overlay.style.display = 'block';
                e.stopPropagation();
            }, { passive: false });
        });

        document.addEventListener('mousemove', (e) => this.onResize(e, win));
        document.addEventListener('touchmove', (e) => this.onResize(e.touches[0], win), { passive: false });

        document.addEventListener('mouseup', () => {
            if (this.isResizing) {
                this.endResize();
                if (overlay) overlay.style.display = 'none';
            }
        });
        document.addEventListener('touchend', () => {
            if (this.isResizing) {
                this.endResize();
                if (overlay) overlay.style.display = 'none';
            }
        });
    }

    private startDrag(e: MouseEvent | Touch, win: HTMLDivElement) {
        if (win.classList.contains('maximized')) {
            win.classList.remove('maximized');
            // When un-maximizing via drag, we might want to center it under the mouse
            // but for now let's just let it snap back to its previous currentSize
            this.updateSize(win);
        }

        this.isDragging = true;
        win.style.userSelect = 'none';
        win.style.cursor = 'grabbing';

        // Calculate offset from window edge to mouse/touch position
        this.dragOffset.x = e.clientX - this.currentPos.x;
        this.dragOffset.y = e.clientY - this.currentPos.y;
    }

    private onDrag(e: MouseEvent | Touch, win: HTMLDivElement) {
        if (!this.isDragging) return;

        // Calculate new position
        let newX = e.clientX - this.dragOffset.x;
        let newY = e.clientY - this.dragOffset.y;

        this.currentPos = { x: newX, y: newY };
        this.updatePosition(win);
    }

    private endDrag() {
        if (this.isDragging) {
            this.isDragging = false;
        }
    }

    public maximize() {
        const win = this.element;
        if (!win) return;

        if (win.classList.contains('maximized')) {
            win.classList.remove('maximized');
            this.updateSize(win);
        } else {
            win.classList.add('maximized');
            this.updateSize(win);
        }
    }
    public minimize() {
        const win = this.element;
        if (!win) return;

        if (win.classList.contains('minimized')) {
            win.classList.remove('minimized');
            this.updateSize(win);
            this.isMinimized = false;
        } else {
            win.classList.add('minimized');
            this.updateSize(win);
            this.isMinimized = true;
        }
    }

    private startResize(e: MouseEvent | Touch, type: string, win: HTMLDivElement) {
        if (win.classList.contains('maximized')) {
            win.classList.remove('maximized');
            this.updateSize(win);
        }

        this.isResizing = true;
        this.resizeType = type;
        win.style.userSelect = 'none';

        this.dragOffset.x = e.clientX;
        this.dragOffset.y = e.clientY;
    }

    private onResize(e: MouseEvent | Touch, win: HTMLDivElement) {
        if (!this.isResizing) return;

        const deltaX = e.clientX - this.dragOffset.x;
        const deltaY = e.clientY - this.dragOffset.y;

        let { x, y } = this.currentPos;
        let { width, height } = this.currentSize;

        const minWidth = 200;
        const minHeight = 100;

        if (this.resizeType.includes('e')) {
            width = Math.max(minWidth, width + deltaX);
        }
        if (this.resizeType.includes('w')) {
            const newWidth = Math.max(minWidth, width - deltaX);
            const actualDeltaW = width - newWidth;
            x += actualDeltaW;
            width = newWidth;
        }
        if (this.resizeType.includes('s')) {
            height = Math.max(minHeight, height + deltaY);
        }
        if (this.resizeType.includes('n')) {
            const newHeight = Math.max(minHeight, height - deltaY);
            const actualDeltaH = height - newHeight;
            y += actualDeltaH;
            height = newHeight;
        }

        this.currentPos = { x, y };
        this.currentSize = { width, height };

        this.dragOffset.x = e.clientX;
        this.dragOffset.y = e.clientY;

        this.updatePosition(win);
        this.updateSize(win);
    }

    private endResize() {
        this.isResizing = false;
        this.resizeType = '';
    }

    private updatePosition(win: HTMLDivElement) {
        win.style.left = `${this.currentPos.x}px`;
        win.style.top = `${this.currentPos.y}px`;
        win.style.transform = 'none'; // Remove the centering transform when dragging
    }

    private updateSize(win: HTMLDivElement) {
        win.style.width = `${this.currentSize.width}px`;
        win.style.height = `${this.currentSize.height}px`;
    }

    /**
     * Get the window title
     */
    public getTitle(): string {
        return this.title;
    }

    /**
     * Get the window icon
     */
    public getIcon(): string {
        return this.icon;
    }

    /**
     * Set z-index and bring window to front (internal method)
     */
    public bringToFront(): void {
        if (!this.element || this.backgroundWindow) return;


        this.zIndex = this.manager.getNextZIndex();
        this.element.style.zIndex = String(this.zIndex);
    }

    /**
     * Focus this window (brings to front and updates manager)
     */
    public focus(): void {
        if (this.isMinimized) {
            this.minimize();
        }
        this.manager.focusWindow(this);
    }

    /**
     * Destroy the window and clean up resources
     */
    public destroy(): void {
        // Remove from manager first
        this.manager.removeWindow(this);

        // Remove DOM element
        if (this.element && this.element.parentNode) {
            this.element.remove();
        }

        // Clear reference
        this.element = null;
    }

    /**
     * Get the DOM element
     */
    public getElement(): HTMLDivElement | null {
        return this.element;
    }
}
