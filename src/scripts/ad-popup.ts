
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
            key: "0b4f29943f8825bf9a2e81a67765af8b",
            format: "iframe",
            height: 90,
            width: 728,
            params: {},
        };
        (window as any).atOptions = atOptions;

        const s = document.createElement("script");
        s.src = "https://thieflamppost.com/0b4f29943f8825bf9a2e81a67765af8b/invoke.js";
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

// Run on page load
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initAdPopup);
} else {
    initAdPopup();
}
