import WindowManager from "./WindowManager";

const appMenuButton = document.querySelector("#app-menu-button") as HTMLDivElement;
const appMenu = document.querySelector("#app-menu") as HTMLDivElement;
const appsGrid = document.querySelector("#apps-grid") as HTMLDivElement;

appMenuButton.addEventListener("click", () => {
    appMenu.classList.toggle("active");
});

window.addEventListener("mousedown", (event) => {
    if (!appMenu.contains(event.target as Node) && !appMenuButton.contains(event.target as Node)) {
        appMenu.classList.remove("active");
    }
});

async function loadApps() {
    const response = await fetch("/json/apps.json");
    const apps = await response.json();
    apps.forEach((app: any) => {
        const appElement = document.createElement("div");
        appElement.classList.add("app");
        appElement.innerHTML = `
            <img src="${app.icon}" alt="${app.name}">
            <p>${app.name}</p>
        `;
        appElement.addEventListener("click", () => {
            WindowManager.getInstance().openWindow(app.url, app.name, app.icon, false, (app.credentialless || false));
        });
        appsGrid.appendChild(appElement);
    });
}

loadApps();