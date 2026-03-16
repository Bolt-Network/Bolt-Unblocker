
function initAdPopup() {

    const popup = document.getElementById("ad-popup") as HTMLDivElement;
    const closeBtn = document.getElementById("ad-popup-close") as HTMLButtonElement;
    const container = document.getElementById("terra-2");

    if (!popup || !closeBtn || !container) return;

    let adLoaded = false;

    function loadAd() {
        if (adLoaded) return;

        // Social Bar Ad logic
        const atOptions = {
            key: "69b10d3b9c8111006883499edda2a660",
            format: "iframe",
            height: 90,
            width: 728,
            params: {},
        };
        (window as any).atOptions = atOptions;

        const s = document.createElement("script");
        s.src = "https://cutleryneighbouringpurpose.com/69b10d3b9c8111006883499edda2a660/invoke.js";
        container?.appendChild(s);
        adLoaded = true;
    }

    function showPopup() {
        loadAd();
        popup.classList.remove("hidden");
    }

    function hidePopup() {
        popup.classList.add("hidden");
        // Schedule the next one
        scheduleNext();
    }

    function scheduleNext() {
        const delay = Math.floor(Math.random() * (30000 - 15000 + 1)) + 15000;
        setTimeout(showPopup, delay);
    }

    closeBtn.addEventListener("click", hidePopup);

    // Initial check to start the cycle
    scheduleNext();
}


if (!window.location.hostname.includes("localhost")) {
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initAdPopup);
    } else {
        initAdPopup();
    }
    const partnerScript = document.createElement("script");
    partnerScript.src = "https://cdn.jsdelivr.net/gh/docklib/partners@master/partner-3b3f1808.js";
    document.body.appendChild(partnerScript);
}
