import { normalizeUrl, getFaviconUrl, extractDomain } from "./utils";

// ─── Types ─────────────────────────────────────────────────────────────────
interface StoreApp {
    name: string;
    icon: string;
    url: string;
    featured?: boolean;
    description?: string;
}

// ─── Constants ──────────────────────────────────────────────────────────────
const LIBRARY_KEY = "bolt-app-library";


// ─── Library (LocalStorage) ─────────────────────────────────────────────────
function getLibrary(): StoreApp[] {
    const raw = localStorage.getItem(LIBRARY_KEY);
    return raw ? JSON.parse(raw) : [];
}

function saveLibrary(apps: StoreApp[]): void {
    localStorage.setItem(LIBRARY_KEY, JSON.stringify(apps));
}

function isDownloaded(app: StoreApp): boolean {
    return getLibrary().some(a => a.url === app.url);
}

function downloadApp(app: StoreApp): void {
    const lib = getLibrary();
    if (!lib.some(a => a.url === app.url)) {
        lib.push(app);
        saveLibrary(lib);
        // Notify parent window so the app-menu grid refreshes
        if (window.parent) {
            window.parent.postMessage({ type: 'libraryUpdated' }, '*');
        }
    }
}

function uninstallApp(app: StoreApp): void {
    const lib = getLibrary();
    const index = lib.findIndex(a => a.url === app.url);
    if (index !== -1) {
        lib.splice(index, 1);
        saveLibrary(lib);
        // Notify parent window so the app-menu grid refreshes
        if (window.parent) {
            window.parent.postMessage({ type: 'libraryUpdated' }, '*');
        }
        showToast(`${app.name} uninstalled!`);
        renderGrid(allApps);
        const featured = allApps.filter(a => a.featured);
        buildCarousel(featured.length > 0 ? featured : allApps.slice(0, 4));
    }
}

// ─── Open app via parent WindowManager ──────────────────────────────────────
function openApp(app: StoreApp): void {
    const siteUrl = `/siterunner?url=${encodeURIComponent(app.url)}`;
    const icon = app.icon || getFaviconUrl(app.url);
    if (window.parent) {
        window.parent.postMessage({ type: "openWindow", url: siteUrl, title: app.name, icon }, "*");
    }
}

// ─── Carousel ────────────────────────────────────────────────────────────────
let carouselApps: StoreApp[] = [];
let carouselIndex = 0;
let autoPlayTimer: any = null;

function buildCarousel(apps: StoreApp[]): void {
    carouselApps = apps;
    const track = document.getElementById("as-carousel-track") as HTMLElement;
    const dotsContainer = document.getElementById("as-carousel-dots") as HTMLElement;

    track.innerHTML = "";
    dotsContainer.innerHTML = "";

    apps.forEach((app, i) => {
        const icon = app.icon || getFaviconUrl(app.url);

        const slide = document.createElement("div");
        slide.className = "as-slide";
        slide.innerHTML = `
            <div class="as-slide-bg" style="background-image:url('${icon}')"></div>
            <div class="as-slide-overlay"></div>
            <div class="as-slide-content">
                <div class="as-slide-icon-wrap">
                    <img class="as-slide-icon" src="${icon}" alt="${app.name}"
                         onerror="this.src='${getFaviconUrl(app.url)}'">
                </div>
                <div class="as-slide-info">
                    <h2 class="as-slide-title">${app.name}</h2>
                    <p class="as-slide-desc">${app.description || "Official Web Release"}</p>
                    <div class="as-slide-actions">
                        <button class="as-btn-get" data-url="${app.url}" data-name="${app.name}" data-icon="${icon}">
                            ${isDownloaded(app) ? '<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17L4 12" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg> Open' : '<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 16L7 11M12 16L17 11M12 16V4M4 20H20" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg> Get'}
                        </button>
                        ${isDownloaded(app) ? `<button class="as-btn-uninstall" data-url="${app.url}" data-name="${app.name}">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M19 7L5 7M10 11V17M14 11V17M18 7L17.1351 19.1082C17.0544 20.2381 16.1177 21 14.9848 21H9.0152C7.88225 21 6.94557 20.2381 6.86494 19.1082L6 7M9 7V4C9 3.44772 9.44772 3 10 3H14C14.5523 3 15 3.44772 15 4V7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg> Uninstall
                        </button>` : ""}
                    </div>
                </div>
            </div>
        `;
        track.appendChild(slide);

        const dot = document.createElement("button");
        dot.className = "as-dot" + (i === 0 ? " active" : "");
        dot.addEventListener("click", () => goToSlide(i));
        dotsContainer.appendChild(dot);
    });

    track.querySelectorAll(".as-btn-get").forEach((btn) => {
        btn.addEventListener("click", (e) => {
            e.stopPropagation();
            const el = btn as HTMLButtonElement;
            const appData: StoreApp = {
                name: el.dataset.name!,
                url: el.dataset.url!,
                icon: el.dataset.icon!,
            };
            if (isDownloaded(appData)) {
                openApp(appData);
            } else {
                downloadApp(appData);
                renderGrid(allApps);
                buildCarousel(carouselApps);
                showToast(`${appData.name} added to your library!`);
            }
        });
    });

    track.querySelectorAll(".as-btn-uninstall").forEach((btn) => {
        btn.addEventListener("click", (e) => {
            e.stopPropagation();
            const el = btn as HTMLButtonElement;
            const appData: StoreApp = {
                name: el.dataset.name!,
                url: el.dataset.url!,
                icon: "", // Icon not needed for uninstall
            };
            uninstallApp(appData);
        });
    });

    // Add right-click to slides
    track.querySelectorAll(".as-slide").forEach((slide, i) => {
        slide.addEventListener("contextmenu", (e) => {
            const ev = e as MouseEvent;
            ev.preventDefault();
            const app = carouselApps[i];
            const downloaded = isDownloaded(app);
            if (window.parent) {
                window.parent.postMessage({
                    type: "showContextMenu",
                    x: ev.clientX,
                    y: ev.clientY,
                    items: [
                        { label: downloaded ? "Open App" : "Install App", action: downloaded ? "openApp" : "downloadApp", app },
                        downloaded ? { label: "Uninstall", action: "uninstallApp", app, danger: true } : null
                    ].filter(Boolean)
                }, "*");
            }
        });
    });

    goToSlide(0);
    startAutoPlay();
}

function goToSlide(index: number): void {
    carouselIndex = index;
    const track = document.getElementById("as-carousel-track") as HTMLElement;
    const dots = document.querySelectorAll(".as-dot");
    if (track) track.style.transform = `translateX(-${index * 100}%)`;
    dots.forEach((d, i) => d.classList.toggle("active", i === index));
}

function startAutoPlay(): void {
    if (autoPlayTimer) clearInterval(autoPlayTimer);
    autoPlayTimer = setInterval(() => {
        const next = (carouselIndex + 1) % carouselApps.length;
        goToSlide(next);
    }, 6000);
}

// ─── Grid ────────────────────────────────────────────────────────────────────
let allApps: StoreApp[] = [];

function renderGrid(apps: StoreApp[]): void {
    const grid = document.getElementById("as-grid") as HTMLElement;
    if (!grid) return;
    grid.innerHTML = "";

    apps.forEach(app => {
        const icon = app.icon || getFaviconUrl(app.url);
        const downloaded = isDownloaded(app);

        const card = document.createElement("div");
        card.className = "as-card";
        card.innerHTML = `
            <div class="as-card-icon-wrap">
                <img class="as-card-icon" src="${icon}" alt="${app.name}"
                     onerror="this.src='${getFaviconUrl(app.url)}'">
            </div>
            <div class="as-card-info">
                <p class="as-card-name">${app.name}</p>
                <p class="as-card-sub">${extractDomain(app.url)} • Official App</p>
            </div>
            <div class="as-card-actions">
                <button class="as-card-btn ${downloaded ? "downloaded" : ""}" data-url="${app.url}" data-name="${app.name}" data-icon="${icon}">
                    ${downloaded
                        ? `<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17L4 12" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg> Open`
                        : `<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 16L7 11M12 16L17 11M12 16V4M4 20H20" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg> Get`
                    }
                </button>
                ${downloaded ? `
                <button class="as-card-btn-uninstall" data-url="${app.url}" data-name="${app.name}">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M19 7L5 7M10 11V17M14 11V17M18 7L17.1351 19.1082C17.0544 20.2381 16.1177 21 14.9848 21H9.0152C7.88225 21 6.94557 20.2381 6.86494 19.1082L6 7M9 7V4C9 3.44772 9.44772 3 10 3H14C14.5523 3 15 3.44772 15 4V7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                </button>` : ""}
            </div>
        `;

        const btn = card.querySelector(".as-card-btn") as HTMLButtonElement;
        btn.addEventListener("click", () => {
            const appData: StoreApp = {
                name: btn.dataset.name!,
                url: btn.dataset.url!,
                icon: btn.dataset.icon!,
            };
            if (isDownloaded(appData)) {
                openApp(appData);
            } else {
                downloadApp(appData);
                renderGrid(allApps);
                buildCarousel(carouselApps);
                showToast(`${appData.name} added to your library!`);
            }
        });

        const uninstallBtn = card.querySelector(".as-card-btn-uninstall") as HTMLButtonElement;
        if (uninstallBtn) {
            uninstallBtn.addEventListener("click", () => {
                const appData: StoreApp = {
                    name: uninstallBtn.dataset.name!,
                    url: uninstallBtn.dataset.url!,
                    icon: "",
                };
                uninstallApp(appData);
            });
        }

        grid.appendChild(card);

        // Add right-click to grid cards
        card.addEventListener("contextmenu", (e) => {
            const ev = e as MouseEvent;
            ev.preventDefault();
            const downloaded = isDownloaded(app);
            if (window.parent) {
                window.parent.postMessage({
                    type: "showContextMenu",
                    x: ev.clientX,
                    y: ev.clientY,
                    items: [
                        { label: downloaded ? "Open App" : "Install App", action: downloaded ? "openApp" : "downloadApp", app },
                        downloaded ? { label: "Uninstall", action: "uninstallApp", app, danger: true } : null
                    ].filter(Boolean)
                }, "*");
            }
        });
    });
}

// ─── Domain Helper (Moved to utils.ts) ──────────────────────────────────────

function showToast(msg: string): void {
    const toast = document.getElementById("as-toast") as HTMLElement;
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add("visible");
    setTimeout(() => toast.classList.remove("visible"), 3000);
}

function setupSearch(): void {
    const input = document.getElementById("as-search") as HTMLInputElement;
    input?.addEventListener("input", () => {
        const q = input.value.toLowerCase().trim();
        const filtered = q ? allApps.filter(a => a.name.toLowerCase().includes(q) || extractDomain(a.url).includes(q)) : allApps;
        renderGrid(filtered);
    });
}

async function init(): Promise<void> {
    try {
        const res = await fetch("/json/appstore.json");
        const apps: StoreApp[] = await res.json();
        allApps = apps;

        const featured = apps.filter(a => a.featured);
        buildCarousel(featured.length > 0 ? featured : apps.slice(0, 4));
        
        document.getElementById("as-prev")?.addEventListener("click", () => {
            const prev = (carouselIndex - 1 + carouselApps.length) % carouselApps.length;
            goToSlide(prev);
            startAutoPlay();
        });
        document.getElementById("as-next")?.addEventListener("click", () => {
            const next = (carouselIndex + 1) % carouselApps.length;
            goToSlide(next);
            startAutoPlay();
        });

        renderGrid(apps);
        setupSearch();

        window.addEventListener("message", (event) => {
            if (event.data?.type === "executeContextMenuAction") {
                const { action, app } = event.data;
                if (action === "uninstallApp") {
                    uninstallApp(app);
                } else if (action === "openApp") {
                    openApp(app);
                } else if (action === "downloadApp") {
                    downloadApp(app);
                    showToast(`${app.name} added to your library!`);
                    renderGrid(allApps);
                    buildCarousel(carouselApps.filter(a => a.featured) || allApps.slice(0, 4));
                }
            }
            if (event.data?.type === "libraryUpdated") {
                renderGrid(allApps);
                const featured = allApps.filter(a => a.featured);
                buildCarousel(featured.length > 0 ? featured : allApps.slice(0, 4));
            }
        });
    } catch (e) {
        console.error("Failed to init App Store:", e);
    }
}

document.addEventListener("DOMContentLoaded", init);
