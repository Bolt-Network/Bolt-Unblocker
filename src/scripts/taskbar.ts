import WindowManager from "./WindowManager";
import Window from "./Window";
import ContextMenu from "./ContextMenu";
const taskbar = document.getElementById("taskbar-right");

const windowManager = WindowManager.getInstance();
const contextMenu = ContextMenu.getInstance();

let draggedItem: HTMLElement | null = null;

// Handle dropping in the taskbar container (empty space)
taskbar?.addEventListener("dragover", (e) => {
    e.preventDefault();
    if (e.dataTransfer) {
        e.dataTransfer.dropEffect = "move";
    }
});

taskbar?.addEventListener("drop", (e) => {
    e.preventDefault();
    // If we're dropping on the taskbar itself and not on a specific item
    if (draggedItem && !(e.target as HTMLElement).closest(".taskbar-item")) {
        taskbar.appendChild(draggedItem);
    }
});

// detect when a window is added
windowManager.addEventListener("windowAdded", (window: Window) => {
    const taskbarItem = document.createElement("div");
    taskbarItem.id = `taskbar-item-${window.id}`;
    taskbarItem.className = "taskbar-item";
    taskbarItem.setAttribute("data-window-id", window.id);
    taskbarItem.draggable = true;
    taskbarItem.innerHTML = `
     <img src="${window.getIcon()}" alt="${window.getTitle()}">
    `;

    taskbarItem.addEventListener("click", () => {
        const win = windowManager.getWindowById(taskbarItem.getAttribute("data-window-id") as string);
        if (!win) return;

        if (!win.isMinimized && windowManager.getFocusedWindow() === win) {
            windowManager.minimizeWindow(win);
        }
        else {
            windowManager.focusWindow(win);
        }
    });

    taskbarItem.addEventListener("contextmenu", (e) => {
        e.preventDefault();
        const win = windowManager.getWindowById(taskbarItem.getAttribute("data-window-id") as string);
        if (win) {
            contextMenu.show(e.clientX, e.clientY, [
                {
                    label: win.isMinimized ? "Restore" : "Minimize",
                    action: () => {
                        if (win.isMinimized) {
                            windowManager.focusWindow(win);
                        } else {
                            windowManager.minimizeWindow(win);
                        }
                    }
                },
                {
                    label: "Maximize",
                    action: () => windowManager.maximizeWindow(win)
                },
                {
                    label: "Close Window",
                    danger: true,
                    action: () => win.destroy()
                }
            ]);
        }
    });

    // Drag and Drop implementation
    taskbarItem.addEventListener("dragstart", (e) => {
        draggedItem = taskbarItem;
        taskbarItem.classList.add("dragging");
        if (e.dataTransfer) {
            e.dataTransfer.effectAllowed = "move";
            // Create a ghost image if needed, but default is usually fine
        }


    });

    taskbarItem.addEventListener("dragover", (e) => {
        e.preventDefault();
        if (!draggedItem || draggedItem === taskbarItem) return;

        const rect = taskbarItem.getBoundingClientRect();
        const midpoint = rect.left + rect.width / 2;

        if (e.clientX < midpoint) {
            taskbarItem.classList.add("drag-over-left");
            taskbarItem.classList.remove("drag-over-right");
        } else {
            taskbarItem.classList.add("drag-over-right");
            taskbarItem.classList.remove("drag-over-left");
        }
    });

    taskbarItem.addEventListener("dragleave", () => {
        taskbarItem.classList.remove("drag-over-left", "drag-over-right");
    });

    taskbarItem.addEventListener("dragend", () => {
        taskbarItem.classList.remove("dragging");

        const items = document.querySelectorAll(".taskbar-item");
        items.forEach(item => item.classList.remove("drag-over-left", "drag-over-right"));
        draggedItem = null;
    });

    taskbarItem.addEventListener("drop", (e) => {
        e.preventDefault();
        if (!draggedItem || draggedItem === taskbarItem) return;

        const rect = taskbarItem.getBoundingClientRect();
        const midpoint = rect.left + rect.width / 2;

        if (e.clientX < midpoint) {
            taskbar?.insertBefore(draggedItem, taskbarItem);
        } else {
            taskbar?.insertBefore(draggedItem, taskbarItem.nextSibling);
        }

        taskbarItem.classList.remove("drag-over-left", "drag-over-right");
    });

    taskbar?.appendChild(taskbarItem);
});


// detect when a window is removed
windowManager.addEventListener("windowRemoved", (window: Window) => {
    const taskbarItem = document.getElementById(`taskbar-item-${window.id}`);
    taskbarItem?.classList.add("removed");
    setTimeout(() => {
        taskbarItem?.remove();
    }, 200);
});

windowManager.addEventListener("windowFocused", (window: Window) => {
    const taskbarItem = document.getElementById(`taskbar-item-${window.id}`);
    Array.from(taskbar?.children as HTMLCollectionOf<HTMLDivElement>).forEach(element => {
        element.classList.remove("active");
    });
    taskbarItem?.classList.add("active");
});

windowManager.addEventListener("windowUnfocused", (window: Window) => {
    const taskbarItem = document.getElementById(`taskbar-item-${window.id}`);

    taskbarItem?.classList.remove("active");
});
