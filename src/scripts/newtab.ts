import { normalizeUrl, getFaviconUrl } from "./utils";

// Types
interface Shortcut {
    id: string;
    name: string;
    url: string;
    favicon: string;
}

// Constants
const SHORTCUTS_KEY = "bolt-shortcuts";
const shortcutsContainer = document.getElementById("shortcuts");

// Search form functionality
const newtabform = document.getElementById("new-tab-form") as HTMLFormElement;

function navigateTo(url: string) {
    if (window.parent && (window.parent as any).navigateTo) {
        (window.parent as any).navigateTo(url);
    } else {
        window.parent.postMessage({ type: 'navigate', url }, '*');
    }
}

if (newtabform) {
    newtabform.addEventListener("submit", (e) => {
        e.preventDefault();
        const input = newtabform.querySelector("input") as HTMLInputElement;
        const search = input?.value;

        if (search) {
            navigateTo(search);
        }
    });
}

// LocalStorage functions
function getShortcuts(): Shortcut[] {
    const stored = localStorage.getItem(SHORTCUTS_KEY);
    return stored ? JSON.parse(stored) : [];
}

function saveShortcuts(shortcuts: Shortcut[]): void {
    localStorage.setItem(SHORTCUTS_KEY, JSON.stringify(shortcuts));
}


function createShortcutElement(shortcut: Shortcut): HTMLElement {
    const div = document.createElement("div");
    div.className = "shortcut";
    div.dataset.id = shortcut.id;

    div.innerHTML = `
        <img src="${shortcut.favicon}" alt="${shortcut.name}" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22 fill=%22white%22><path d=%22M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z%22/></svg>'">
        <p>${shortcut.name}</p>
        <button class="delete-shortcut" aria-label="Delete ${shortcut.name}">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
        </button>
    `;

    // Get the delete button
    const deleteBtn = div.querySelector('.delete-shortcut') as HTMLElement;

    // Delete button click handler
    if (deleteBtn) {
        deleteBtn.addEventListener("click", (e) => {
            e.stopPropagation(); // Prevent triggering the shortcut navigation
            if (confirm(`Delete "${shortcut.name}"?`)) {
                deleteShortcut(shortcut.id);
            }
        });
    }

    // Click to navigate
    div.addEventListener("click", (e) => {
        // Don't navigate if clicking the delete button
        if ((e.target as HTMLElement).closest('.delete-shortcut')) {
            return;
        }
        navigateTo(shortcut.url);
    });

    // Right-click to delete (keeping this as alternative)
    div.addEventListener("contextmenu", (e) => {
        e.preventDefault();
        if (confirm(`Delete "${shortcut.name}"?`)) {
            deleteShortcut(shortcut.id);
        }
    });

    return div;
}

function renderShortcuts(): void {
    if (!shortcutsContainer) return;

    const shortcuts = getShortcuts();

    // Clear existing shortcuts (except the add button)
    const existingShortcuts = shortcutsContainer.querySelectorAll(".shortcut");
    existingShortcuts.forEach(el => el.remove());

    // Add all shortcuts before the add button
    const addButton = shortcutsContainer.querySelector(".shortcut-add");
    shortcuts.forEach(shortcut => {
        const element = createShortcutElement(shortcut);
        if (addButton) {
            shortcutsContainer.insertBefore(element, addButton);
        } else {
            shortcutsContainer.appendChild(element);
        }
    });
}

function addShortcut(name: string, url: string): void {
    const shortcuts = getShortcuts();
    const normalizedUrl = normalizeUrl(url);

    const newShortcut: Shortcut = {
        id: Date.now().toString(),
        name,
        url: normalizedUrl,
        favicon: getFaviconUrl(normalizedUrl)
    };

    shortcuts.push(newShortcut);
    saveShortcuts(shortcuts);
    renderShortcuts();
}

function deleteShortcut(id: string): void {
    const shortcuts = getShortcuts();
    const filtered = shortcuts.filter(s => s.id !== id);
    saveShortcuts(filtered);
    renderShortcuts();
}

// Modal functionality
const modal = document.getElementById("shortcut-add-modal");
const addShortcutButton = document.querySelector(".shortcut-add") as HTMLElement;
const shortcutForm = document.getElementById("shortcut-add-form") as HTMLFormElement;

// Open modal
if (addShortcutButton && modal) {
    addShortcutButton.addEventListener("click", () => {
        modal.classList.add("active");
        // Focus first input when modal opens
        const firstInput = shortcutForm?.querySelector("input");
        setTimeout(() => firstInput?.focus(), 100);
    });
}

// Close modal function
function closeModal() {
    if (modal) {
        modal.classList.remove("active");
        // Reset form
        if (shortcutForm) {
            shortcutForm.reset();
        }
    }
}

// Close modal when clicking outside
if (modal) {
    modal.addEventListener("click", (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });
}

// Close modal on ESC key
document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal?.classList.contains("active")) {
        closeModal();
    }
});

// Handle form submission
if (shortcutForm) {
    shortcutForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const nameInput = shortcutForm.querySelector('input[name="name"]') as HTMLInputElement;
        const urlInput = shortcutForm.querySelector('input[name="url"]') as HTMLInputElement;

        const name = nameInput?.value.trim();
        const url = urlInput?.value.trim();

        if (name && url) {
            addShortcut(name, url);
            closeModal();
        }
    });
}

// Initialize shortcuts on page load
document.addEventListener("DOMContentLoaded", () => {
    renderShortcuts();
});