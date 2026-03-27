const notification = document.querySelector("#discord-notification") as HTMLDivElement;
const closeBtn = document.querySelector("#discord-close") as HTMLButtonElement;
const copyBtn = document.querySelector("#discord-copy") as HTMLButtonElement;
const joinBtn = document.querySelector("#discord-join") as HTMLButtonElement;
const noShowBtnDisc = document.querySelector("#discord-no-show") as HTMLButtonElement;

const DISCORD_LINK = "https://discord.gg/bcHb3gWegn";
const NO_SHOW_KEY = "discord_no_show";

function initDiscordNotify() {
    if (!notification) return;


    if (localStorage.getItem(NO_SHOW_KEY) === "true") {
        return;
    }

    const delay = Math.floor(Math.random() * (12000 - 10000 + 1)) + 10000;

    setTimeout(() => {
        notification.classList.remove("hidden");
    }, delay);
}

closeBtn?.addEventListener("click", () => {
    notification.classList.add("hidden");
});

copyBtn?.addEventListener("click", () => {
    navigator.clipboard.writeText(DISCORD_LINK).then(() => {
        const originalText = copyBtn.innerText;
        copyBtn.innerText = "Copied!";
        copyBtn.style.color = "#87c9ff";
        setTimeout(() => {
            copyBtn.innerText = originalText;
            copyBtn.style.color = "";
        }, 2000);
    });
});

joinBtn?.addEventListener("click", () => {
    window.open(DISCORD_LINK, "_blank");
    notification.classList.add("hidden");
});

noShowBtnDisc?.addEventListener("click", () => {
    localStorage.setItem(NO_SHOW_KEY, "true");
    notification.classList.add("hidden");
});

// Run on page load
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initDiscordNotify);
} else {
    initDiscordNotify();
}
