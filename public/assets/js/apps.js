const flogo = document.getElementById("flogo");


function pinBuiltInNew(appElement) {
    const appUrl = getAppUrl(appElement);
    const imgElement = appElement.querySelector('img');
    const appName = imgElement.getAttribute('data-tooltip') || imgElement.getAttribute('alt');
    const appImage = imgElement.getAttribute('src');

    const appData = { name: appName, image: appImage, url: appUrl };

    if (!appData.url || appData.url === '') {
        console.warn("WARNING: No URL found for app:", appName);
        if (appElement.id === 'browser') {
            appData.url = '/srcdocs/apps/browser.html';
        } else if (appElement.id === 'settings') {
            appData.url = '/srcdocs/apps/settings.html';
        } else if (appElement.id === 'appstore') {
            appData.url = '/srcdocs/apps/appstore.html';
        } else if (appElement.id === 'gamehub') {
            appData.url = 'https://sparkgames.xyz';
        } else {

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
        console.warn(`${appName} is already pinned!`);
    } else {
        pinnedApps.push(appData);
        localStorage.setItem("pinnedApps", JSON.stringify(pinnedApps));
        window.location.reload();
    }

}

function launchApp(appId, urlKey) {
    var zindx = 9;
    for (var i = 0; i < document.getElementsByClassName("window").length; i++) {
        document.getElementsByClassName("window")[i].style.zIndex = zindx;
        zindx += 1;
    }

    let appName = appId;
    let appIcon = '/assets/imgs/logos/boltlogo11.ico';

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

    addToTaskbar(awindow, appName, appIcon);

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

    let appName = appId;
    let appIcon = '/assets/imgs/logos/boltlogo11.ico';

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

    addToTaskbar(browserWindow, "Bolt Browser", "/assets/imgs/logos/boltbrowser.svg");

    setTimeout(() => {
        browserWindow.style.cssText = "z-index:" + zindx + "; position: absolute; top: 0; left: 0; width: 100%; height: 93vh; background-color: none; border: none; opacity: 1; transform: scale(1); transition: opacity 0.5s, transform 0.5s;";
    }, 100);

    return browserWindow;
}

ap.contentWindow.document.addEventListener("DOMContentLoaded", function () {
    if (localStorage.getItem("new") === "true") {
        pinBuiltInNew(ap.contentWindow.document.getElementById("browser"));
        pinBuiltInNew(ap.contentWindow.document.getElementById("gamehub"));
        pinBuiltInNew(ap.contentWindow.document.getElementById("settings"));
        pinBuiltInNew(ap.contentWindow.document.getElementById("appstore"));
        localStorage.setItem("new", "false");
    }


    ap.contentWindow.document.getElementById("browser").addEventListener("click", () => {
        var zindx = 9;
        for (var i = 0; i < document.getElementsByClassName("window").length; i++) {
            document.getElementsByClassName("window")[i].style.zIndex = zindx;
            zindx += 1;
        }

        const uniqueWindowId = generateUniqueWindowId("browserwindow");

        var browserWindow = document.createElement("iframe");
        browserWindow.id = uniqueWindowId;
        browserWindow.src = "/srcdocs/apps/browser.html";
        browserWindow.classList.add("window");
        browserWindow.style.cssText = "z-index: " + zindx + "; position: absolute; top: 0; left: 0; width: 100%; height: 93vh; background-color: none; border: none; opacity: 0; transform: scale(0.5);";
        document.getElementById("apps").classList.remove("active");
        document.body.appendChild(browserWindow);

        addToTaskbar(browserWindow, "Bolt Browser", "/assets/imgs/logos/boltbrowser.svg");

        setTimeout(() => {
            browserWindow.style.cssText = "z-index:" + zindx + "; position: absolute; top: 0; left: 0; width: 100%; height: 93vh; background-color: none; border: none; opacity: 1; transform: scale(1); transition: opacity 0.5s, transform 0.5s;";
        }, 100);
    });
    ap.contentWindow.document.getElementById("browser").addEventListener("hold", () => pinBuiltIn(ap.contentWindow.document.getElementById("browser")));
    ap.contentWindow.document.getElementById("gamehub").addEventListener("click", () => launchApp("gamehub", "https://sparkgames.xyz"));
    ap.contentWindow.document.getElementById("gamehub").addEventListener("hold", () => pinBuiltIn(ap.contentWindow.document.getElementById("gamehub")));
    ap.contentWindow.document.getElementById("settings").addEventListener("click", () => launchApp2("settings", "/srcdocs/apps/settings.html"));
    ap.contentWindow.document.getElementById("settings").addEventListener("hold", () => pinBuiltIn(ap.contentWindow.document.getElementById("settings")));
    ap.contentWindow.document.getElementById("appstore").addEventListener("click", () => launchApp2("appstore", "/srcdocs/apps/appstore.html"));
    ap.contentWindow.document.getElementById("appstore").addEventListener("hold", () => pinBuiltIn(ap.contentWindow.document.getElementById("appstore")));
    function pinBuiltIn(appElement) {
        const appUrl = getAppUrl(appElement);
        const imgElement = appElement.querySelector('img');
        const appName = imgElement.getAttribute('data-tooltip') || imgElement.getAttribute('alt');
        const appImage = imgElement.getAttribute('src');

        const appData = { name: appName, image: appImage, url: appUrl };

        if (!appData.url || appData.url === '') {
            console.warn("WARNING: No URL found for app:", appName);
            if (appElement.id === 'browser') {
                appData.url = '/srcdocs/apps/browser.html';
            } else if (appElement.id === 'settings') {
                appData.url = '/srcdocs/apps/settings.html';
            } else if (appElement.id === 'appstore') {
                appData.url = '/srcdocs/apps/appstore.html';
            } else if (appElement.id === 'gamehub') {
                appData.url = 'https://sparkgames.xyz';
            } else {

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

    }
    function showContextMenu(e, appElement) {
        e.preventDefault();

        const existingMenu = document.querySelector('.context-menu');
        if (existingMenu) {
            existingMenu.remove();
        }

        const appName = appElement.getAttribute("data-tooltip");
        const appImage = appElement.querySelector("img").src;
        const appUrl = appElement.getAttribute("data-url");

        const contextMenu = document.createElement('div');
        contextMenu.className = 'context-menu';
        contextMenu.style.left = `${e.pageX}px`;
        contextMenu.style.top = `${e.pageY}px`;

        const pinOption = document.createElement('div');
        pinOption.className = 'context-menu-item';
        pinOption.textContent = 'Pin to Taskbar';
        pinOption.addEventListener('click', () => {

            const isPinned = pinnedApps.some(pinnedApp => pinnedApp.name === appName);

            if (!isPinned) {
                pinnedApps.push({
                    name: appName,
                    image: appImage,
                    url: appUrl
                });

                localStorage.setItem("pinnedApps", JSON.stringify(pinnedApps));
                window.renderPinnedApps();
            }
            else {
                alert(`${appName} is already pinned!`);
            }

            contextMenu.remove();
        });

        contextMenu.appendChild(pinOption);

        const openOption = document.createElement('div');
        openOption.className = 'context-menu-item';
        openOption.textContent = 'Open';
        openOption.addEventListener('click', () => {

            appElement.click();
            contextMenu.remove();
        });

        contextMenu.appendChild(openOption);

        document.body.appendChild(contextMenu);

        document.addEventListener('click', function closeMenu() {
            contextMenu.remove();
            document.removeEventListener('click', closeMenu);
        });
    }

    const builtInApps = ap.contentWindow.document.querySelectorAll(".builtin");
    builtInApps.forEach(app => {
        enableHoldEvent(app);
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
            case 'gamehub': return 'https://sparkgames.xyz';
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

        ap.contentWindow.document.querySelectorAll('#apps .app:not([id])').forEach(app => app.remove());

        const appsContainer =
            ap.contentWindow.document.body.querySelector('#apps');

        apps.forEach(app => {
            const appElement = document.createElement("div");
            appElement.classList.add("app");
            appElement.setAttribute('data-app-name', app.name);
            appElement.setAttribute('data-app-url', app.url);
            appElement.setAttribute('data-tooltip', app.name);
            enableHoldEvent(appElement);
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
            appElement.addEventListener("hold", () => {
                const appUrl = getAppUrl(appElement);
                const imgElement = appElement.querySelector('img');
                const appName = imgElement.getAttribute('data-tooltip') || imgElement.getAttribute('alt');
                const appImage = imgElement.getAttribute('src');

                const appData = { name: appName, image: appImage, url: appUrl };

                if (!appData.url || appData.url === '') {
                    console.warn("WARNING: No URL found for app:", appName);
                    if (appElement.id === 'browser') {
                        appData.url = '/srcdocs/apps/browser.html';
                    } else if (appElement.id === 'settings') {
                        appData.url = '/srcdocs/apps/settings.html';
                    } else if (appElement.id === 'appstore') {
                        appData.url = '/srcdocs/apps/appstore.html';
                    } else if (appElement.id === 'gamehub') {
                        appData.url = 'https://sparkgames.xyz';
                    } else {

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
            });
            addContextMenu(appElement, app);

            appsContainer.appendChild(appElement);
        });
        loadAppOrder();
        makeAppsDraggable();
    } catch (error) {
        console.error("Error loading custom apps:", error);
    }
}



function enableHoldEvent(element, duration = 500) {
    let timer;

    element.addEventListener('mousedown', function (e) {
        timer = setTimeout(() => {
            const holdEvent = new CustomEvent('hold', {
                bubbles: true,
                cancelable: true,
                detail: { originalEvent: e }
            });
            element.dispatchEvent(holdEvent);
        }, duration);
    });

    element.addEventListener('mouseup', () => clearTimeout(timer));
    element.addEventListener('mouseleave', () => clearTimeout(timer));
    element.addEventListener('mousemove', () => clearTimeout(timer));

    // For touch devices
    element.addEventListener('touchstart', function (e) {
        timer = setTimeout(() => {
            const holdEvent = new CustomEvent('hold', {
                bubbles: true,
                cancelable: true,
                detail: { originalEvent: e }
            });
            element.dispatchEvent(holdEvent);
        }, duration);
    });

    element.addEventListener('touchend', () => clearTimeout(timer));
    element.addEventListener('touchmove', () => clearTimeout(timer));
}


function enableHoldEvent(element, duration = 800) {
    let timer;

    element.addEventListener('mousedown', function (e) {
        timer = setTimeout(() => {
            // Create and dispatch a custom "hold" event
            const holdEvent = new CustomEvent('hold', {
                bubbles: true,
                cancelable: true,
                detail: { originalEvent: e }
            });
            element.dispatchEvent(holdEvent);
        }, duration);
    });

    // Clear the timer if the mouse is released or moved
    element.addEventListener('mouseup', () => clearTimeout(timer));
    element.addEventListener('mouseleave', () => clearTimeout(timer));
    element.addEventListener('mousemove', () => clearTimeout(timer));

    // For touch devices
    element.addEventListener('touchstart', function (e) {
        timer = setTimeout(() => {
            const holdEvent = new CustomEvent('hold', {
                bubbles: true,
                cancelable: true,
                detail: { originalEvent: e }
            });
            element.dispatchEvent(holdEvent);
        }, duration);
    });

    element.addEventListener('touchend', () => clearTimeout(timer));
    element.addEventListener('touchmove', () => clearTimeout(timer));
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
                    app.id === 'gamehub' ? 'https://sparkgames.xyz' : '');
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

        const existingMenus = document.querySelectorAll('.context-menu');
        existingMenus.forEach(menu => menu.remove());

        const contextMenu = document.createElement("div");
        contextMenu.classList.add("context-menu");

        contextMenu.style.left = `${e.pageX}px`;
        contextMenu.style.top = `${e.pageY}px`;

        const pinOption = document.createElement("div");
        pinOption.classList.add("context-menu-item");
        pinOption.textContent = "Pin App";
        pinOption.addEventListener("click", () => {
            const appUrl = getAppUrl(appElement);
            const imgElement = appElement.querySelector('img');
            const appName = imgElement.getAttribute('data-tooltip') || imgElement.getAttribute('alt');
            const appImage = imgElement.getAttribute('src');

            const appData = { name: appName, image: appImage, url: appUrl };

            if (!appData.url || appData.url === '') {
                console.warn("WARNING: No URL found for app:", appName);
                if (appElement.id === 'browser') {
                    appData.url = '/srcdocs/apps/browser.html';
                } else if (appElement.id === 'settings') {
                    appData.url = '/srcdocs/apps/settings.html';
                } else if (appElement.id === 'appstore') {
                    appData.url = '/srcdocs/apps/appstore.html';
                } else if (appElement.id === 'gamehub') {
                    appData.url = 'https://sparkgames.xyz';
                } else {

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

                appElement.click();
                contextMenu.remove();
            });

            contextMenu.appendChild(openOption);
        }

        document.body.appendChild(contextMenu);

        const closeMenu = (e) => {
            if (!contextMenu.contains(e.target)) {
                contextMenu.remove();
                document.removeEventListener('click', closeMenu);
            }
        };

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
    if (gamehubApp) gamehubApp.setAttribute('data-app-url', 'https://sparkgames.xyz');
}

ap.contentWindow.document.addEventListener('DOMContentLoaded', () => {
    setupBuiltInAppUrls();
    getCustomApps();
    makeAppsDraggable();
});