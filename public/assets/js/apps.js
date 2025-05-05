const flogo = document.getElementById("flogo");
// Modify the launchApp function in index.js
function launchApp(appId, urlKey) {
    var zindx = 9;
    for (var i = 0; i < document.getElementsByClassName("window").length; i++) {
        document.getElementsByClassName("window")[i].style.zIndex = zindx;
        zindx += 1;
    }

    // Get app icon and name
    let appName = appId;
    let appIcon = '/assets/imgs/logos/boltlogo11.ico'; // Default icon

    // Try to find the app in pinnedApps to get its icon
    const pinnedApps = JSON.parse(localStorage.getItem("pinnedApps")) || [];
    const pinnedApp = pinnedApps.find(app => app.name === appId);
    if (pinnedApp) {
        appIcon = pinnedApp.image;
    }

    var awindow = document.createElement("iframe");
    awindow.id = appId + "window";
    if (urlKey) localStorage.setItem("launchertarget", urlKey);
    awindow.src = "/srcdocs/apps/launcher.html";
    awindow.classList.add("window");
    awindow.style.cssText = "z-index: " + zindx + "; position: absolute; top: 0; left: 0; width: 100%; height: 93vh; background-color: none; border: none; opacity: 0; transform: scale(0.5);";
    document.getElementById("apps").classList.remove("active");
    document.body.appendChild(awindow);

    // Add to taskbar
    addToTaskbar(awindow, appName, appIcon);

    setTimeout(() => {
        awindow.style.cssText = "z-index:" + zindx + "; position: absolute; top: 0; left: 0; width: 100%; height: 93vh; background-color: none; border: none; opacity: 1; transform: scale(1); transition: opacity 0.5s, transform 0.5s;";
    }, 100);
}

// Similarly modify launchApp2 and createBrowserWindow functions
function launchApp2(appId, urlKey) {
    var zindx = 9;
    for (var i = 0; i < document.getElementsByClassName("window").length; i++) {
        document.getElementsByClassName("window")[i].style.zIndex = zindx;
        zindx += 1;
    }

    // Get app icon and name
    let appName = appId;
    let appIcon = '/assets/imgs/logos/boltlogo11.ico'; // Default icon

    // Special cases for built-in apps
    if (appId === "settings") {
        appIcon = "/assets/imgs/logos/cog.svg";
        appName = "Settings";
    } else if (appId === "appstore") {
        appIcon = "/assets/imgs/logos/appstore.svg";
        appName = "App Store";
    }

    var awindow = document.createElement("iframe");
    awindow.id = appId + "window";
    awindow.src = urlKey;
    awindow.classList.add("window");
    awindow.style.cssText = "z-index: " + zindx + "; position: absolute; top: 0; left: 0; width: 100%; height: 93vh; background-color: none; border: none; opacity: 0; transform: scale(0.5);";
    document.getElementById("apps").classList.remove("active");
    document.body.appendChild(awindow);

    // Add to taskbar
    addToTaskbar(awindow, appName, appIcon);

    setTimeout(() => {
        awindow.style.cssText = "z-index:" + zindx + "; position: absolute; top: 0; left: 0; width: 100%; height: 93vh; background-color: none; border: none; opacity: 1; transform: scale(1); transition: opacity 0.5s, transform 0.5s;";
    }, 100);
}

function createBrowserWindow(zindx) {
    var browserWindow = document.createElement("iframe");
    browserWindow.id = "browserwindow";
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

ap.contentWindow.document.addEventListener("DOMContentLoaded", function () {
    ap.contentWindow.document.getElementById("browser").addEventListener("click", () => {
        var zindx = 9;
        for (var i = 0; i < document.getElementsByClassName("window").length; i++) {
            document.getElementsByClassName("window")[i].style.zIndex = zindx;
            zindx += 1;
        }

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
    });
    ap.contentWindow.document.getElementById("gamehub").addEventListener("click", () => launchApp("gamehub", "https://sparkgames.vercel.app"));
    ap.contentWindow.document.getElementById("settings").addEventListener("click", () => launchApp2("settings", "/srcdocs/apps/settings.html"));
    ap.contentWindow.document.getElementById("appstore").addEventListener("click", () => launchApp2("appstore", "/srcdocs/apps/appstore.html"));
    // Add this function at an appropriate place in your file
    function showContextMenu(e, appElement) {
        e.preventDefault();

        // Remove any existing context menus
        const existingMenu = document.querySelector('.context-menu');
        if (existingMenu) {
            existingMenu.remove();
        }

        const appName = appElement.getAttribute("data-tooltip");
        const appImage = appElement.querySelector("img").src;
        const appUrl = appElement.getAttribute("data-url");

        // Create context menu
        const contextMenu = document.createElement('div');
        contextMenu.className = 'context-menu';
        contextMenu.style.left = `${e.pageX}px`;
        contextMenu.style.top = `${e.pageY}px`;

        // Create pin option
        const pinOption = document.createElement('div');
        pinOption.className = 'context-menu-item';
        pinOption.textContent = 'Pin to Taskbar';
        pinOption.addEventListener('click', () => {
            // Check if app is already pinned
            const isPinned = pinnedApps.some(pinnedApp => pinnedApp.name === appName);

            if (!isPinned) {
                pinnedApps.push({
                    name: appName,
                    image: appImage,
                    url: appUrl
                });

                // Save to localStorage and update pinned apps
                localStorage.setItem("pinnedApps", JSON.stringify(pinnedApps));
                window.renderPinnedApps();
            }
            else {
                alert(`${appName} is already pinned!`);
            }

            // Remove the context menu after action
            contextMenu.remove();
        });

        contextMenu.appendChild(pinOption);

        // Add more menu items if needed
        const openOption = document.createElement('div');
        openOption.className = 'context-menu-item';
        openOption.textContent = 'Open';
        openOption.addEventListener('click', () => {
            // Trigger the app's click event
            appElement.click();
            contextMenu.remove();
        });

        contextMenu.appendChild(openOption);

        // Add to document
        document.body.appendChild(contextMenu);

        // Close menu when clicking elsewhere
        document.addEventListener('click', function closeMenu() {
            contextMenu.remove();
            document.removeEventListener('click', closeMenu);
        });
    }

    // Then modify your existing event listener for context menu
    const builtInApps = ap.contentWindow.document.querySelectorAll(".builtin");
    builtInApps.forEach(app => {
        app.addEventListener("contextmenu", function (e) {
            showContextMenu(e, this);
        });
    });
});

function launchInBrowser(appId, url) {
    var zindx = 9;
    for (var i = 0; i < document.getElementsByClassName("window").length; i++) {
        document.getElementsByClassName("window")[i].style.zIndex = zindx;
        zindx += 1;
    }

    createNewBrowserWindow(url, zindx);
}

function createNewBrowserWindow(url, zindx) {
    var browserWindow = document.createElement("iframe");
    browserWindow.id = "browserwindow";
    browserWindow.src = "/srcdocs/apps/browser.html";
    browserWindow.classList.add("window");
    browserWindow.style.cssText = "z-index: " + zindx + "; position: absolute; top: 0; left: 0; width: 100%; height: 93vh; background-color: none; border: none; opacity: 0; transform: scale(0.5);";
    document.getElementById("apps").classList.remove("active");
    document.body.appendChild(browserWindow);
    updateAbut();

    browserWindow.onload = function () {
        browserWindow.contentWindow.postMessage({
            type: 'navigate',
            url: url
        }, '*');
    };

    setTimeout(() => {
        browserWindow.style.cssText = "z-index:" + zindx + "; position: absolute; top: 0; left: 0; width: 100%; height: 93vh; background-color: none; border: none; opacity: 1; transform: scale(1); transition: opacity 0.5s, transform 0.5s;";
    }, 100);
}

function updateAbut() {
    abut.setAttribute("data-tooltip", ap.classList.contains("active") ? "Close" : "Apps");
    tooltip.textContent = flogo.getAttribute('data-tooltip');
}

function getAppUrl(appElement) {
    let url = appElement.getAttribute('data-app-url');
    if (!url && appElement.id) {
        switch (appElement.id) {
            case 'browser': return '/srcdocs/apps/browser.html';
            case 'gamehub': return 'https://sparkgames.vercel.app';
            case 'settings': return '/srcdocs/apps/settings.html';
            case 'appstore': return '/srcdocs/apps/appstore.html';
            default: return '';
        }
    }
    if (!url && !appElement.id) {
        try {
            const appName = appElement.querySelector('img').getAttribute('data-tooltip') ||
                appElement.querySelector('img').getAttribute('alt');
            const appImage = appElement.querySelector('img').getAttribute('src');
            const customApps = JSON.parse(localStorage.getItem("apps")) || [];
            const matchingApp = customApps.find(app =>
                app.name === appName && app.image === appImage
            );
            if (matchingApp && matchingApp.url) {
                return matchingApp.url;
            }
        } catch (e) {
            console.error("Error finding URL for custom app:", e);
        }
    }
    return url || '';
}

function getCustomApps() {
    try {
        const appsData = localStorage.getItem("apps");
        if (!appsData) {
            console.log("No custom apps found in localStorage.");
            makeAppsDraggable();
            return;
        }
        const apps = JSON.parse(appsData);
        if (!Array.isArray(apps)) {
            console.error("Invalid apps data format. Expected an array.");
            makeAppsDraggable();
            return;
        }

        // Clear existing custom apps
        ap.contentWindow.document.querySelectorAll('#apps .app:not([id])').forEach(app => app.remove());

        // Get the apps container instead of using document directly
        const appsContainer =
            ap.contentWindow.document.body.querySelector('#apps');

        apps.forEach(app => {
            const appElement = document.createElement("div");
            appElement.classList.add("app");
            appElement.setAttribute('data-app-name', app.name);
            appElement.setAttribute('data-app-url', app.url);
            appElement.setAttribute('data-tooltip', app.name);
            appElement.innerHTML = `
                <img src="${app.image}" alt="${app.name}" class="applogo">
                <span class="app-name">${app.name}</span>
            `;
            appElement.addEventListener("click", () => {
                var zindx = 9;
                for (var i = 0; i < document.getElementsByClassName("window").length; i++) {
                    document.getElementsByClassName("window")[i].style.zIndex = zindx;
                    zindx += 1;
                }
                launchApp(app.name, app.url);
                document.getElementById("apps").classList.remove("active");
            });
            addContextMenu(appElement, app);

            // Append to the apps container, not directly to document
            appsContainer.appendChild(appElement);
        });
        loadAppOrder();
        makeAppsDraggable();
    } catch (error) {
        console.error("Error loading custom apps:", error);
    }
}


function getDragAfterElement(container, x, y) {
    const draggableElements = [...container.querySelectorAll('.app:not(.dragging)')];
    const row = draggableElements.filter(child => Math.abs(y - (child.getBoundingClientRect().top + child.getBoundingClientRect().height / 2)) <= child.getBoundingClientRect().height / 2);
    if (row.length > 0) {
        return row.reduce((closest, child) => {
            const offset = x - child.getBoundingClientRect().left - child.getBoundingClientRect().width / 2;
            return (offset < 0 && offset > closest.offset) ? { offset: offset, element: child } : closest;
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    } else {
        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const dx = x - (box.left + box.width / 2);
            const dy = y - (box.top + box.height / 2);
            const distance = Math.sqrt(dx * dx + dy * dy);
            return (distance < closest.distance) ? { distance: distance, element: child } : closest;
        }, { distance: Number.POSITIVE_INFINITY }).element;
    }
}

function makeAppsDraggable() {
    const appsContainer = document.getElementById('apps');
    const appElements = document.querySelectorAll('.app');
    appElements.forEach(app => {
        app.setAttribute('draggable', 'true');
        app.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', app.id || 'custom-app');
            app.classList.add('dragging');
            setTimeout(() => {
                app.style.opacity = '0.6';
            }, 0);
        });
        app.addEventListener('dragend', () => {
            app.classList.remove('dragging');
            app.style.opacity = '1';
            saveAppOrder();
        });
        const appUrl = app.getAttribute('data-url') || (app.id === 'browser' ? '/srcdocs/apps/browser.html' :
            app.id === 'settings' ? '/srcdocs/apps/settings.html' :
                app.id === 'appstore' ? '/srcdocs/apps/appstore.html' :
                    app.id === 'gamehub' ? 'https://sparkgames.vercel.app' : '');
        app.setAttribute('data-app-url', appUrl);
        const appData = {
            name: app.querySelector('img').getAttribute('data-tooltip'),
            image: app.querySelector('img').getAttribute('src'),
            url: appUrl
        };
        addContextMenu(app, appData);
    });
    appsContainer.addEventListener('dragover', (e) => {
        e.preventDefault();
        const afterElement = getDragAfterElement(appsContainer, e.clientX, e.clientY);
        const draggable = document.querySelector('.dragging');
        if (afterElement == null) {
            appsContainer.appendChild(draggable);
        } else {
            appsContainer.insertBefore(draggable, afterElement);
        }
    });
    appsContainer.addEventListener('dragenter', (e) => e.preventDefault());
    appsContainer.addEventListener('drop', (e) => e.preventDefault());
}

document.addEventListener('DOMContentLoaded', () => {
    makeAppsDraggable();
});

function saveAppOrder() {
    const appElements = document.querySelectorAll('#apps .app');
    const appOrder = [];
    appElements.forEach(appElement => {
        if (appElement.id) {
            appOrder.push({ type: 'builtin', id: appElement.id });
        } else {
            const img = appElement.querySelector('img');
            if (img) {
                const appName = img.getAttribute('alt') || img.getAttribute('data-tooltip');
                if (appName) {
                    appOrder.push({ type: 'custom', name: appName });
                }
            }
        }
    });
    localStorage.setItem("appOrder", JSON.stringify(appOrder));
    console.log("Complete app order saved successfully!");
}

function loadAppOrder() {
    const savedOrderJson = localStorage.getItem("appOrder");
    if (!savedOrderJson) {
        console.log("No saved app order found. Using default order.");
        return false;
    }
    try {
        const savedOrder = JSON.parse(savedOrderJson);
        if (!Array.isArray(savedOrder) || savedOrder.length === 0) {
            console.log("Invalid saved app order. Using default order.");
            return false;
        }
        const appsContainer = document.getElementById("apps");
        const appElementMap = { builtin: {}, custom: {} };
        document.querySelectorAll('#apps .app[id]').forEach(app => {
            appElementMap.builtin[app.id] = app;
        });
        document.querySelectorAll('#apps .app:not([id])').forEach(app => {
            const img = app.querySelector('img');
            if (img) {
                const appName = img.getAttribute('alt') || img.getAttribute('data-tooltip');
                if (appName) {
                    if (!appElementMap.custom[appName]) {
                        appElementMap.custom[appName] = app;
                    }
                }
            }
        });
        const fragment = document.createDocumentFragment();
        savedOrder.forEach(appInfo => {
            if (appInfo.type === 'builtin' && appElementMap.builtin[appInfo.id]) {
                fragment.appendChild(appElementMap.builtin[appInfo.id]);
                delete appElementMap.builtin[appInfo.id];
            } else if (appInfo.type === 'custom' && appElementMap.custom[appInfo.name]) {
                fragment.appendChild(appElementMap.custom[appInfo.name]);
                delete appElementMap.custom[appInfo.name];
            }
        });
        Object.values(appElementMap.builtin).forEach(app => {
            fragment.appendChild(app);
        });
        Object.values(appElementMap.custom).forEach(app => {
            fragment.appendChild(app);
        });
        while (appsContainer.firstChild) {
            appsContainer.removeChild(appsContainer.firstChild);
        }
        appsContainer.appendChild(fragment);
        return true;
    } catch (error) {
        console.error("Error loading app order:", error);
        return false;
    }
}

function addContextMenu(appElement, app) {
    appElement.addEventListener("contextmenu", (e) => {
        e.preventDefault();

        // Remove any existing context menus
        const existingMenus = document.querySelectorAll('.context-menu');
        existingMenus.forEach(menu => menu.remove());

        // Create and style the context menu
        const contextMenu = document.createElement("div");
        contextMenu.classList.add("context-menu");

        // Position the menu at cursor location
        contextMenu.style.left = `${e.pageX}px`;
        contextMenu.style.top = `${e.pageY}px`;

        // Create Pin option
        const pinOption = document.createElement("div");
        pinOption.classList.add("context-menu-item");
        pinOption.textContent = "Pin App";
        pinOption.addEventListener("click", () => {
            const appUrl = getAppUrl(appElement);
            const imgElement = appElement.querySelector('img');
            const appName = imgElement.getAttribute('data-tooltip') || imgElement.getAttribute('alt');
            const appImage = imgElement.getAttribute('src');

            const appData = { name: appName, image: appImage, url: appUrl };

            // Handle missing URL cases
            if (!appData.url || appData.url === '') {
                console.warn("WARNING: No URL found for app:", appName);
                if (appElement.id === 'browser') {
                    appData.url = '/srcdocs/apps/browser.html';
                } else if (appElement.id === 'settings') {
                    appData.url = '/srcdocs/apps/settings.html';
                } else if (appElement.id === 'appstore') {
                    appData.url = '/srcdocs/apps/appstore.html';
                } else if (appElement.id === 'gamehub') {
                    appData.url = 'https://sparkgames.vercel.app';
                } else {
                    // Check localStorage for custom apps
                    const customApps = JSON.parse(localStorage.getItem("apps")) || [];
                    const storedApp = customApps.find(app => app.name === appName);
                    if (storedApp) {
                        appData.url = storedApp.url;
                    }
                }
            }

            const pinnedApps = JSON.parse(localStorage.getItem("pinnedApps")) || [];
            const isAlreadyPinned = pinnedApps.some(pinnedApp =>
                pinnedApp.name === appData.name && pinnedApp.url === appData.url
            );

            if (isAlreadyPinned) {
                alert(`${appName} is already pinned!`);
            } else {
                pinnedApps.push(appData);
                localStorage.setItem("pinnedApps", JSON.stringify(pinnedApps));
                alert(`${appName} has been pinned! Reload the page for changes to take effect.`);
            }

            contextMenu.remove();
        });
        contextMenu.appendChild(pinOption);

        // Add Uninstall option for custom apps
        if (!appElement.id) {
            const uninstallOption = document.createElement("div");
            uninstallOption.classList.add("context-menu-item");
            uninstallOption.textContent = "Uninstall";

            uninstallOption.addEventListener("click", () => {
                try {
                    const imgElement = appElement.querySelector('img');
                    const appName = imgElement.getAttribute('data-tooltip') || imgElement.getAttribute('alt');
                    const appImage = imgElement.getAttribute('src');
                    const customApps = JSON.parse(localStorage.getItem("apps")) || [];

                    const appIndex = customApps.findIndex(customApp =>
                        customApp.name === appName && customApp.image === appImage
                    );

                    if (appIndex !== -1) {
                        customApps.splice(appIndex, 1);
                        localStorage.setItem("apps", JSON.stringify(customApps));
                        appElement.remove();
                        saveAppOrder();
                    } else {
                        alert("Error: Could not find this app in storage. Try refreshing the page.");
                    }
                } catch (error) {
                    console.error("Error uninstalling app:", error);
                    alert("Error uninstalling app. See console for details.");
                }
                contextMenu.remove();
            });
            contextMenu.appendChild(uninstallOption);

            const openOption = document.createElement('div');
            openOption.className = 'context-menu-item';
            openOption.textContent = 'Open';
            openOption.addEventListener('click', () => {
                // Trigger the app's click event
                appElement.click();
                contextMenu.remove();
            });

            contextMenu.appendChild(openOption);
        }

        document.body.appendChild(contextMenu);

        // Close menu when clicking outside
        const closeMenu = (e) => {
            if (!contextMenu.contains(e.target)) {
                contextMenu.remove();
                document.removeEventListener('click', closeMenu);
            }
        };

        // Delay adding the click listener to prevent immediate closing
        setTimeout(() => {
            document.addEventListener('click', closeMenu);
        }, 0);
    });
}



function setupBuiltInAppUrls() {
    const browserApp = document.getElementById('browser');
    if (browserApp) browserApp.setAttribute('data-app-url', '/srcdocs/apps/browser.html');
    const settingsApp = document.getElementById('settings');
    if (settingsApp) settingsApp.setAttribute('data-app-url', '/srcdocs/apps/settings.html');
    const appstoreApp = document.getElementById('appstore');
    if (appstoreApp) appstoreApp.setAttribute('data-app-url', '/srcdocs/apps/appstore.html');
    const gamehubApp = document.getElementById('gamehub');
    if (gamehubApp) gamehubApp.setAttribute('data-app-url', 'https://sparkgames.vercel.app');
}

ap.contentWindow.document.addEventListener('DOMContentLoaded', () => {
    setupBuiltInAppUrls();
    getCustomApps();
    makeAppsDraggable();
});
