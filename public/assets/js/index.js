var big = document.getElementById("big");
var disc = document.getElementById("disc");
var yt = document.getElementById("yt");
var tt = document.getElementById("tt");
var pinnedApps = JSON.parse(localStorage.getItem("pinnedApps")) || [];
var pinned = document.getElementById("pinned-apps");
const searchInput = document.getElementById("search-input");

big.innerText = localStorage.getItem("name") || "User";
if (!localStorage.getItem("searchEngine")) {
    localStorage.setItem("searchEngine", "duckduckgo");
}
      localStorage.setItem('particlesEnabled', false);
                    localStorage.setItem('background', '3');
if (!window.location.href.includes("localhost:8080")) {
    if (localStorage.getItem("a") === "true" || localStorage.getItem("a") === null) {
        const a = document.createElement("script");
        a.src = '//pl26605217.profitableratecpm.com/9a/a1/e7/9aa1e73d0caebe8da0973fa2f16fb7c0.js';
        a.type = "text/javascript";
        a.id = "script";
        document.body.appendChild(a);
        const b = document.createElement("div");
        b.classList.add("sz-link");
        b.innerHTML = '<a href="https://sz.games" target="_blank">SZ Games</a><script src="https://partner.senty.com.au/partner-3b3f1808.js"></script>'
        document.body.appendChild(b);
    }
}

disc.addEventListener("click", function () {
    window.open("https://discord.gg/UPGBjxZut2", "_blank");
});

yt.addEventListener("click", function () {
    window.open("https://www.youtube.com/@bolt.network", "_blank");
});
tt.addEventListener("click", function () {
    window.open("https://www.tiktok.com/@bolt.network", "_blank");
});

function performSearch() {
    const query = searchInput.value.trim();
    if (query !== "") {
        const browserWindow = createBrowserWindow(9999);

        setTimeout(() => {
            localStorage.setItem("searchQuery", query);

            const searchEvent = new CustomEvent("performSearch");
            document.dispatchEvent(searchEvent);

            searchInput.value = "";
        }, 300);
    }
}


document.addEventListener("DOMContentLoaded", function () {
    renderPinnedApps();

    if (searchInput) {
        searchInput.addEventListener("keypress", function (e) {
            if (e.key === "Enter") {
                performSearch();
            }
        });
    }

    if (!localStorage.getItem('appsTooltipShown')) {
        const appsTooltip = document.createElement('div');
        appsTooltip.id = 'apps-tooltip';
        appsTooltip.textContent = 'Click here to open apps menu';
        document.body.appendChild(appsTooltip);

        setTimeout(() => {
            appsTooltip.classList.add('visible');
        }, 1000);

        document.getElementById('flogo').addEventListener('click', () => {
            appsTooltip.classList.remove('visible');
            localStorage.setItem('appsTooltipShown', 'true');
        });
    }
});

function unpinApp(app) {
    pinnedApps = pinnedApps.filter(pinnedApp => pinnedApp.name !== app.name);
    localStorage.setItem("pinnedApps", JSON.stringify(pinnedApps));
    renderPinnedApps();
}

function launchApp(appId, urlKey) {
    var zindx = 9;
    for (var i = 0; i < document.getElementsByClassName("window").length; i++) {
        document.getElementsByClassName("window")[i].style.zIndex = zindx;
        zindx += 1;
    }
    var awindow = document.createElement("iframe");
    awindow.id = appId + "window";
    if (urlKey) localStorage.setItem("launchertarget", urlKey);
    awindow.src = "/srcdocs/apps/launcher.html";
    awindow.classList.add("window");
    awindow.style.cssText = "z-index: " + zindx + "; position: absolute; top: 0; left: 0; width: 100%; height: 93vh; background-color: none; border: none; opacity: 0; transform: scale(0.5);";
    document.getElementById("apps").classList.remove("active");
    document.body.appendChild(awindow);
    setTimeout(() => {
        awindow.style.cssText = "z-index:" + zindx + "; position: absolute; top: 0; left: 0; width: 100%; height: 93vh; background-color: none; border: none; opacity: 1; transform: scale(1); transition: opacity 0.5s, transform 0.5s;";
    }, 100);
}
function launchApp2(appId, urlKey) {
    var zindx = 9;
    for (var i = 0; i < document.getElementsByClassName("window").length; i++) {
        document.getElementsByClassName("window")[i].style.zIndex = zindx;
        zindx += 1;
    }
    var awindow = document.createElement("iframe");
    awindow.id = appId + "window";
    awindow.src = urlKey;
    awindow.classList.add("window");
    awindow.style.cssText = "z-index: " + zindx + "; position: absolute; top: 0; left: 0; width: 100%; height: 93vh; background-color: none; border: none; opacity: 0; transform: scale(0.5);";
    document.getElementById("apps").classList.remove("active");
    document.body.appendChild(awindow);

    setTimeout(() => {
        awindow.style.cssText = "z-index:" + zindx + "; position: absolute; top: 0; left: 0; width: 100%; height: 93vh; background-color: none; border: none; opacity: 1; transform: scale(1); transition: opacity 0.5s, transform 0.5s;";
    }, 100);
}

function renderPinnedApps() {
    pinned.innerHTML = '';

    if (pinnedApps.length === 0) {
        const spacer = document.createElement("div");
        spacer.style.padding = "0 10px";
        spacer.style.color = "rgba(255, 255, 255, 0.5)";
        spacer.style.fontSize = "12px";
        spacer.textContent = "Right-click on apps to pin them here";
        pinned.appendChild(spacer);
        return;
    }

    pinnedApps.forEach((app) => {
        var appElement = document.createElement("div");
        appElement.id = "pinned-app";
        appElement.setAttribute("data-tooltip", app.name);

        const imgElement = document.createElement("img");
        imgElement.src = app.image;
        imgElement.alt = app.name;
        imgElement.className = "app-icon";

        imgElement.onerror = function () {
            this.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23ffffff"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-.71-13.5h1.5v4.5h-1.5zm0 6h1.5v1.5h-1.5z"/></svg>';
            this.style.padding = "8px";
            this.style.backgroundColor = "rgba(97, 187, 255, 0.2)";
        };

        appElement.innerHTML = '';
        appElement.appendChild(imgElement);

        appElement.addEventListener("click", () => {
            var zindx = 9;
            for (var i = 0; i < document.getElementsByClassName("window").length; i++) {
                document.getElementsByClassName("window")[i].style.zIndex = zindx;
                zindx += 1;
            }

            appElement.style.transform = "scale(0.9)";
            setTimeout(() => {
                appElement.style.transform = "";
            }, 150);

            if (app.name == "Bolt Browser") {
                createBrowserWindow(zindx);
            }
            else if (app.name == "Settings") {
                launchApp2("settings", "/srcdocs/apps/settings.html");
            }
            else if (app.name == "App Installer" || app.name == "App Store") {
                launchApp2("appstore", "/srcdocs/apps/appstore.html");
            }
            else if (app.name == "Game Hub") {
                launchApp("gamehub", "https://sparkgames.xyz");
            }
            else {
                launchApp(app.name, app.url);
            }
        });

        appElement.addEventListener("contextmenu", (e) => {
            e.preventDefault();

            const existingMenus = document.querySelectorAll('.context-menu');
            existingMenus.forEach(menu => menu.remove());

            const contextMenu = document.createElement("div");
            contextMenu.className = "context-menu";
            contextMenu.style.position = "absolute";
            contextMenu.style.left = `${e.pageX}px`;
            contextMenu.style.top = `${e.pageY}px`;
            contextMenu.style.zIndex = "9999";

            const unpinItem = document.createElement("div");
            unpinItem.className = "context-menu-item";
            unpinItem.innerHTML = `
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style="margin-right: 8px; vertical-align: text-bottom;">
                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"></path>
                </svg>
                Unpin
            `;

            contextMenu.appendChild(unpinItem);
            document.body.appendChild(contextMenu);

            unpinItem.addEventListener("click", () => {
                appElement.style.transform = "scale(0)";
                appElement.style.opacity = "0";

                setTimeout(() => {
                    unpinApp(app);
                    contextMenu.remove();
                }, 300);
            });

            document.addEventListener("click", function closeMenu(event) {
                if (!contextMenu.contains(event.target)) {
                    contextMenu.remove();
                    document.removeEventListener("click", closeMenu);
                }
            });
        });

        pinned.appendChild(appElement);
    });
}
window.renderPinnedApps = renderPinnedApps;

function createBrowserWindow(zindx) {
    // Generate unique window ID
    const uniqueWindowId = generateUniqueWindowId("browserwindow");

    var browserWindow = document.createElement("iframe");
    browserWindow.id = uniqueWindowId;
    browserWindow.src = "/srcdocs/apps/browser.html";
    browserWindow.classList.add("window");
    browserWindow.style.cssText = "z-index: " + zindx + "; position: absolute; top: 0; left: 0; width: 100%; height: 93vh; background-color: none; border: none; opacity: 0; transform: scale(0.5);";
    document.getElementById("apps").classList.remove("active");
    document.body.appendChild(browserWindow);

    // Add to taskbar
    addToTaskbar(browserWindow, "Bolt Browser", "/assets/imgs/logos/boltbrowser.svg");

    setTimeout(() => {
        browserWindow.style.cssText = "z-index:" + zindx + "; position: absolute; top: 0; left: 0; width: 100%; height: 93vh; background-color: none; border: none; opacity: 1; transform: scale(1); transition: opacity 0.5s, transform 0.5s;";
    }, 100);

    return browserWindow;
}


async function isFlagged() {
    await fetch("https://p22gzhpvnum6gihjgf7ar9b.pages.dev/DNjXbCqnUsRR.txt", {
        method: 'GET',
        headers: {
        }
    })
        .then(response => response.text())
        .then(data => {
            if (window.location.href === data) {
                alert("This Bolt link is either flagged or down. Please join the Discord server for working links.");
                window.location.href = "https://discord.gg/UPGBjxZut2";
            }
        })
        .catch(error => {
            console.error('Error checking premium code:', error);
        });
}
isFlagged();

if (localStorage.getItem("performanceMode")) {
    localStorage.setItem('particlesEnabled', false);
    localStorage.setItem('background', '3');
}

function isMobileUserAgent() {
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|Windows Phone/i.test(navigator.userAgent)) {
        alert('📱 Mobile device detected! Please use a desktop browser for the best experience. ❗IMPORTANT TIP❗ Press and hold apps to pin them.');
    }
}
isMobileUserAgent();

document.body.style.backgroundImage = "url('" + localStorage.getItem("wallpaper") + "')";