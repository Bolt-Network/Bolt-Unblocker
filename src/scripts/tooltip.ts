const tooltip = document.querySelector("#apps-tooltip") as HTMLDivElement;
const okBtn = document.querySelector("#tooltip-ok") as HTMLButtonElement;
const noShowBtn = document.querySelector("#tooltip-no-show") as HTMLButtonElement;
const appMenuBtn = document.querySelector("#app-menu-button") as HTMLDivElement;

const HIDE_KEY = "showAppsTooltip";

function updateTooltipPosition() {
    if (!tooltip || !appMenuBtn) return;

    const rect = appMenuBtn.getBoundingClientRect();
    const tooltipRect = tooltip.getBoundingClientRect();

    tooltip.style.bottom = `${window.innerHeight - rect.top + 10}px`;
}

function showTooltip() {
    if (localStorage.getItem(HIDE_KEY) === "false") {
        tooltip.classList.add("hidden");
        return;
    }

    tooltip.classList.remove("hidden");
    // Wait a bit for the DOM to settle or use requestAnimationFrame if needed
    setTimeout(updateTooltipPosition, 100);
}

okBtn.addEventListener("click", () => {
    tooltip.classList.add("hidden");
});

noShowBtn.addEventListener("click", () => {
    localStorage.setItem(HIDE_KEY, "false");
    tooltip.classList.add("hidden");
});

window.addEventListener("resize", updateTooltipPosition);

// Also update when the app menu button is clicked (to hide it)
appMenuBtn.addEventListener("click", () => {
    tooltip.classList.add("hidden");
});

// Initial show
showTooltip();
