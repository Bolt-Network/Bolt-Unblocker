import WindowManager from "./WindowManager";
import { getFaviconUrl } from "./utils";
import ContextMenu from "./ContextMenu";

const appMenuButton = document.querySelector("#app-menu-button") as HTMLDivElement;
const appMenu = document.querySelector("#app-menu") as HTMLDivElement;
const appsGrid = document.querySelector("#apps-grid") as HTMLDivElement;

const settings = JSON.parse(localStorage.getItem("bolt-settings") || "{}");
if (settings.showAppsOnLaunch !== false) {
    appMenu.classList.add("active");
}

const LIBRARY_KEY = "bolt-app-library";

appMenuButton.addEventListener("click", () => {
    appMenu.classList.toggle("active");
});

window.addEventListener("mousedown", (event) => {
    if (!appMenu.contains(event.target as Node) && !appMenuButton.contains(event.target as Node)) {
        appMenu.classList.remove("active");
    }
});

function createAppElement(app: any, onClick: () => void): HTMLDivElement {
    const appElement = document.createElement("div");
    appElement.classList.add("app");
    appElement.innerHTML = `
        <img src="${app.icon}" alt="${app.name}" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22 fill=%22white%22><circle cx=%2212%22 cy=%2212%22 r=%2210%22/></svg>'">
        <p>${app.name}</p>
    `;
    appElement.addEventListener("click", onClick);

    // Add Right-Click for uninstallation (only for library apps)
    appElement.addEventListener("contextmenu", (e) => {
        if (appElement.hasAttribute('data-library-app')) {
            e.preventDefault();
            const rect = appElement.getBoundingClientRect();
            ContextMenu.getInstance().show(e.clientX, e.clientY, [
                {
                    label: "Open App",
                    action: () => onClick()
                },
                {
                    label: "Uninstall",
                    action: () => {
                        const lib = getLibraryApps();
                        const url = appElement.getAttribute('data-library-app');
                        const newLib = lib.filter(a => a.url !== url);
                        localStorage.setItem(LIBRARY_KEY, JSON.stringify(newLib));
                        refreshLibraryApps();
                        // Notify all other windows (like App Store)
                        WindowManager.getInstance().getWindows().forEach(w => {
                            w.getElement()?.querySelector('iframe')?.contentWindow?.postMessage({ type: 'libraryUpdated' }, '*');
                        });
                    },
                    danger: true
                }
            ]);
        } else {
            // System apps - only "Open"
            e.preventDefault();
            ContextMenu.getInstance().show(e.clientX, e.clientY, [{ label: "Open App", action: () => onClick() }]);
        }
    });

    return appElement;
}

// ─── Append the Library Apps after the Settings app if it exists ──────────────
function appendLibraryApps() {
    // Collect all library apps
    const libApps = getLibraryApps();

    // Find Settings element to insert after it
    const allAppsInGrid = Array.from(appsGrid.children) as HTMLElement[];
    const settingsAppEl = allAppsInGrid.find(el => el.querySelector('p')?.textContent === "Settings");

    let lastInserted: Node | undefined = settingsAppEl ? settingsAppEl : undefined;

    libApps.forEach(app => {
        const siteUrl = `/siterunner?url=${encodeURIComponent(app.url)}`;
        const icon = app.icon || getFaviconUrl(app.url);

        const el = createAppElement({ ...app, icon }, () => {
            WindowManager.getInstance().openWindow(siteUrl, app.name, icon, false, false);
        });
        el.dataset.libraryApp = app.url;

        if (lastInserted && lastInserted.nextSibling) {
            appsGrid.insertBefore(el, lastInserted.nextSibling);
        } else {
            appsGrid.appendChild(el);
        }
        lastInserted = el;
    });
}

function getLibraryApps(): any[] {
    const raw = localStorage.getItem(LIBRARY_KEY);
    return raw ? JSON.parse(raw) : [];
}

async function loadApps() {
    const response = await fetch("/json/apps.json");
    const apps = await response.json();

    apps.forEach((app: any) => {
        const el = createAppElement(app, () => {
            WindowManager.getInstance().openWindow(app.url, app.name, app.icon, false, (app.credentialless || false), (app.frameId || ""));
        });
        appsGrid.appendChild(el);
    });

    // After loading main apps, insert the library apps
    appendLibraryApps();
}

export function refreshLibraryApps() {
    // Remove old library app elements
    appsGrid.querySelectorAll("[data-library-app]").forEach(el => el.remove());
    // Find Settings again and insert
    appendLibraryApps();
}

// Listen for messages from within iframes
window.addEventListener("message", (event) => {
    if (event.data?.type === "openWindow") {
        const { url, title, icon } = event.data;
        WindowManager.getInstance().openWindow(url, title, icon, false, false);
    }
    if (event.data?.type === "libraryUpdated") {
        refreshLibraryApps();
        // Also refresh the taskbar if necessary? 
        // No, taskbar only shows open windows.
    }
    if (event.data?.type === "showContextMenu") {
        const { x, y, items } = event.data;
        const source = event.source as WindowProxy;

        // Find which window this is
        const windows = WindowManager.getInstance().getWindows();
        const activeWindow = windows.find(w => {
            const iframe = w.getElement()?.querySelector('iframe');
            return iframe?.contentWindow === source;
        });

        let posX = x;
        let posY = y;

        if (activeWindow) {
            const el = activeWindow.getElement();
            if (el) {
                const rect = el.querySelector('.window-content')?.getBoundingClientRect();
                if (rect) {
                    posX += rect.left;
                    posY += rect.top;
                }
            }
        }

        ContextMenu.getInstance().show(posX, posY, items.map((item: any) => ({
            label: item.label,
            danger: item.danger,
            action: () => {
                source.postMessage({
                    type: "executeContextMenuAction",
                    action: item.action,
                    app: item.app
                }, "*");
            }
        })));
    }
});

loadApps();