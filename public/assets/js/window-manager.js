const originalLaunchApp = window.launchApp;
window.launchApp = function (appId, urlKey) {
    var zindx = 9;
    for (var i = 0; i < document.getElementsByClassName("window").length; i++) {
        document.getElementsByClassName("window")[i].style.zIndex = zindx;
        zindx += 1;
    }

    let appName = appId;
    let appIcon = '/assets/imgs/logos/gamehub.svg';

    const pinnedApps = JSON.parse(localStorage.getItem("pinnedApps")) || [];
    const pinnedApp = pinnedApps.find(app => app.name === appId);
    if (pinnedApp) {
        appIcon = pinnedApp.image;
    }

    const customApps = JSON.parse(localStorage.getItem("apps")) || [];
    const customApp = customApps.find(app => app.name === appId);
    if (customApp) {
        appIcon = customApp.image;
    }

    const uniqueWindowId = generateUniqueWindowId(appId + "window");

    var awindow = document.createElement("iframe");
    awindow.id = uniqueWindowId;
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

    return awindow;
};

const originalLaunchApp2 = window.launchApp2;
window.launchApp2 = function (appId, urlKey) {
    var zindx = 9;
    for (var i = 0; i < document.getElementsByClassName("window").length; i++) {
        document.getElementsByClassName("window")[i].style.zIndex = zindx;
        zindx += 1;
    }

    let appName = appId;
    let appIcon = '/assets/imgs/logos/boltlogo.png';

    if (appId === "settings") {
        appIcon = "/assets/imgs/logos/cog.svg";
        appName = "Settings";
    } else if (appId === "appstore") {
        appIcon = "/assets/imgs/logos/appstore.svg";
        appName = "App Store";
    }

    const uniqueWindowId = generateUniqueWindowId(appId + "window");

    var awindow = document.createElement("iframe");
    awindow.id = uniqueWindowId;
    awindow.src = urlKey;
    awindow.classList.add("window");
    awindow.style.cssText = "z-index: " + zindx + "; position: absolute; top: 0; left: 0; width: 100%; height: 93vh; background-color: none; border: none; opacity: 0; transform: scale(0.5);";
    document.getElementById("apps").classList.remove("active");
    document.body.appendChild(awindow);

    addToTaskbar(awindow, appName, appIcon);

    setTimeout(() => {
        awindow.style.cssText = "z-index:" + zindx + "; position: absolute; top: 0; left: 0; width: 100%; height: 93vh; background-color: none; border: none; opacity: 1; transform: scale(1); transition: opacity 0.5s, transform 0.5s;";
    }, 100);

    return awindow;
};

const originalCreateBrowserWindow = window.createBrowserWindow;
window.createBrowserWindow = function (zindx) {

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

    return browserWindow;
};

function testTaskbar() {
    console.log("Testing taskbar functionality...");

    const testWindow = document.createElement("iframe");
    testWindow.id = "test-window";
    testWindow.src = "about:blank";
    testWindow.classList.add("window");
    testWindow.style.cssText = "z-index: 100; position: absolute; top: 0; left: 0; width: 100%; height: 93vh; background-color: white; border: none;";
    document.body.appendChild(testWindow);

    addToTaskbar(testWindow, "Test Window", '/assets/imgs/logos/boltlogo11.ico');

    console.log("Test window created with ID: test-window");
    console.log("Try clicking the taskbar icon to minimize/restore the window");
}

window.testTaskbar = testTaskbar;