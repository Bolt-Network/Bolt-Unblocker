const openWindows = new Map();
let activeWindowId = null;

function addToTaskbar(windowElement, appName, appIcon) {
    const windowId = windowElement.id;

    const taskbarItem = document.createElement("div");
    taskbarItem.id = `taskbar-${windowId}`;
    taskbarItem.className = "taskbar-item active";
    taskbarItem.setAttribute("data-window-id", windowId);
    taskbarItem.setAttribute("data-tooltip", appName);

    const iconElement = document.createElement("img");
    iconElement.src = appIcon;
    iconElement.alt = appName;
    iconElement.className = "taskbar-icon";

    taskbarItem.appendChild(iconElement);

    taskbarItem.onclick = function (e) {
        e.preventDefault();
        e.stopPropagation();
        console.log(`Taskbar item clicked for window: ${windowId}`);
        toggleWindow(windowId);
    };

    openWindows.set(windowId, {
        window: windowElement,
        taskbar: taskbarItem,
        minimized: false,
        appName: appName,
        appIcon: appIcon
    });

    const pinnedAppsContainer = document.getElementById("pinned-apps");
    if (pinnedAppsContainer) {
        pinnedAppsContainer.appendChild(taskbarItem);
        console.log(`Added taskbar item for window: ${windowId}`);
    } else {
        console.error("Pinned apps container not found!");
    }

    setActiveWindow(windowId);

    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'childList') {
                mutation.removedNodes.forEach((node) => {
                    if (node === windowElement) {
                        removeFromTaskbar(windowId);
                        observer.disconnect();
                    }
                });
            }
        });
    });

    observer.observe(document.body, { childList: true });
}

function toggleWindow(windowId) {
    const windowData = openWindows.get(windowId);

    if (!windowData) {
        console.error(`Window data not found for ID: ${windowId}`);
        return;
    }

    console.log(`Toggling window ${windowId}, currently minimized: ${windowData.minimized}, active: ${windowId === activeWindowId}`);

    if (windowData.minimized) {
        restoreWindow(windowId);
        return;
    }

    if (windowId === activeWindowId) {
        minimizeWindow(windowId);
        return;
    }

    setActiveWindow(windowId);
    console.log(`Window ${windowId} brought to front`);
}

function minimizeWindow(windowId) {
    const windowData = openWindows.get(windowId);

    if (!windowData || windowData.minimized) return;

    windowData.window.style.transition = "transform 0.25s ease-in, opacity 0.25s ease-in";
    windowData.window.style.transformOrigin = "center bottom";
    windowData.window.style.transform = "scale(0.7)";
    windowData.window.style.opacity = "0";

    windowData.minimized = true;
    windowData.taskbar.classList.remove("active");

    let foundNewFocus = false;
    if (windowId === activeWindowId) {
        for (const [id, data] of openWindows.entries()) {
            if (id !== windowId && !data.minimized) {
                setActiveWindow(id);
                foundNewFocus = true;
                console.log(`Window ${windowId} minimized, focus switched to ${id}`);
                break;
            }
        }

        if (!foundNewFocus) {
            activeWindowId = null;
            console.log(`Window ${windowId} minimized, no other windows to focus`);
        }
    }

    setTimeout(() => {
        windowData.window.style.display = "none";
        windowData.window.style.transition = "";
        console.log(`Window ${windowId} minimized animation complete`);
    }, 250);
}

function restoreWindow(windowId) {
    const windowData = openWindows.get(windowId);

    if (!windowData || !windowData.minimized) return;

    windowData.window.style.display = "block";
    windowData.window.style.opacity = "0";
    windowData.window.style.transform = "scale(0.7)";
    windowData.window.style.transformOrigin = "center bottom";

    windowData.window.offsetHeight;

    windowData.window.style.transition = "transform 0.25s ease-out, opacity 0.25s ease-out";
    windowData.window.style.transform = "scale(1)";
    windowData.window.style.opacity = "1";

    windowData.minimized = false;

    setActiveWindow(windowId);

    setTimeout(() => {
        windowData.window.style.transition = "";
        console.log(`Window ${windowId} restored`);
    }, 250);
}

function setActiveWindow(windowId) {
    const windowData = openWindows.get(windowId);

    if (!windowData) {
        console.error(`Window data not found for ID: ${windowId}`);
        return;
    }

    if (windowData.minimized) {
        console.warn(`Cannot set minimized window ${windowId} as active`);
        return;
    }

    openWindows.forEach((data, id) => {
        if (id !== windowId) {
            data.taskbar.classList.remove("active");
            if (!data.minimized) {
                data.window.style.zIndex = "10";
            }
        }
    });

    windowData.window.style.zIndex = "100";
    windowData.taskbar.classList.add("active");
    activeWindowId = windowId;

    windowData.window.style.display = "block";

    console.log(`Window ${windowId} set as active`);
}

function removeFromTaskbar(windowId) {
    const windowData = openWindows.get(windowId);

    if (windowData) {

        if (windowData.taskbar && windowData.taskbar.parentNode) {
            windowData.taskbar.remove();
        }

        openWindows.delete(windowId);

        if (activeWindowId === windowId) {
            activeWindowId = null;

            if (openWindows.size > 0) {
                const nextWindowId = Array.from(openWindows.keys())[0];
                setActiveWindow(nextWindowId);
            }
        }

        console.log(`Removed window ${windowId} from taskbar. Remaining windows: ${openWindows.size}`);
    }
}

function generateUniqueWindowId(baseId) {
    let id = baseId;
    let counter = 1;

    while (document.getElementById(id) || openWindows.has(id)) {
        id = `${baseId}-${counter}`;
        counter++;
    }

    return id;
}

document.addEventListener("DOMContentLoaded", function () {
    console.log("Initializing taskbar system");

    window.addEventListener('message', function (event) {
        if (event.data && event.data.type === 'closeWindow') {
            removeFromTaskbar(event.data.windowId);
        }
    });

    document.body.addEventListener('click', function (event) {
        const windowElement = event.target.closest('.window');
        if (windowElement) {
            setActiveWindow(windowElement.id);
        }
    });

    cleanupOrphanedTaskbarItems();
});

function cleanupOrphanedTaskbarItems() {
    const taskbarItems = document.querySelectorAll('.taskbar-item');

    taskbarItems.forEach(item => {
        const windowId = item.getAttribute('data-window-id');
        const windowElement = document.getElementById(windowId);

        if (!windowElement) {
            item.remove();
        }
    });
}

function preserveWindowIcons() {

    const windowIcons = [];
    openWindows.forEach((data, id) => {
        if (data.taskbar && data.taskbar.parentNode) {
            // Remove from DOM temporarily
            data.taskbar.remove();
            windowIcons.push(data);
        }
    });


    setTimeout(() => {

        const pinnedAppsContainer = document.getElementById("pinned-apps");
        if (pinnedAppsContainer) {
            windowIcons.forEach(data => {
                pinnedAppsContainer.appendChild(data.taskbar);
            });
            console.log(`Restored ${windowIcons.length} window icons after pinned apps rerender`);
        } else {
            console.error("Pinned apps container not found after rerender!");
        }
    }, 50);
}


const originalRenderPinnedApps = window.renderPinnedApps;
if (originalRenderPinnedApps) {
    window.renderPinnedApps = function () {

        preserveWindowIcons();


        originalRenderPinnedApps.apply(this, arguments);
    };
    console.log("Overrode renderPinnedApps to preserve window icons");
}

window.addToTaskbar = addToTaskbar;
window.removeFromTaskbar = removeFromTaskbar;
window.toggleWindow = toggleWindow;
window.minimizeWindow = minimizeWindow;
window.restoreWindow = restoreWindow;
window.setActiveWindow = setActiveWindow;
window.generateUniqueWindowId = generateUniqueWindowId;

console.log("Taskbar script loaded");