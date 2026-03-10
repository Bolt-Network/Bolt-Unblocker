export interface ContextMenuItem {
    label: string;
    action: () => void;
    danger?: boolean;
}

export default class ContextMenu {
    private static instance: ContextMenu;
    private element: HTMLDivElement | null = null;

    private constructor() {
        // Close menu on click outside
        window.addEventListener('click', () => this.hide());
        window.addEventListener('contextmenu', (e) => {
            // If we didn't right click on something that should have a context menu,
            // we might want to hide the existing one.
            // But for now let's just let it be.
        });
        window.addEventListener('resize', () => this.hide());
    }

    public static getInstance(): ContextMenu {
        if (!ContextMenu.instance) {
            ContextMenu.instance = new ContextMenu();
        }
        return ContextMenu.instance;
    }

    public show(x: number, y: number, items: ContextMenuItem[]): void {
        this.hide();

        const menu = document.createElement('div');
        menu.className = 'context-menu';

        items.forEach(item => {
            const menuItem = document.createElement('div');
            menuItem.className = 'context-menu-item';
            if (item.danger) {
                menuItem.classList.add('danger');
            }
            menuItem.textContent = item.label;
            menuItem.addEventListener('click', (e) => {
                e.stopPropagation();
                item.action();
                this.hide();
            });
            menu.appendChild(menuItem);
        });

        document.body.appendChild(menu);
        this.element = menu;

        // Position adjustment
        const menuRect = menu.getBoundingClientRect();
        let posX = x;
        let posY = y;

        // Keep inside viewport
        if (posX + menuRect.width > window.innerWidth) {
            posX = window.innerWidth - menuRect.width - 10;
        }
        if (posY + menuRect.height > window.innerHeight) {
            posY = window.innerHeight - menuRect.height - 10;
        }

        menu.style.left = `${posX}px`;
        menu.style.top = `${posY}px`;

        // Prevent default context menu on the menu itself
        menu.addEventListener('contextmenu', (e) => e.preventDefault());
    }

    public hide(): void {
        if (this.element) {
            this.element.remove();
            this.element = null;
        }
    }
}
