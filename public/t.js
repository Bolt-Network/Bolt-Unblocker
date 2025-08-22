!(function () {
    "use strict";
    class e {
        constructor(e, n, t = !0, r = { bottom: "20px", right: "20px" }, a = !1) {
            (this.banners = e),
                (this.iframeBanners = n),
                (this.showIframeBanner = t),
                (this.position = r),
                (this.debug = a),
                (this.bannerCount = 0),
                (this.maxBanners = 2),
                (this.currentBannerElement = null),
                (this.autoCloseTimer = null),
                this.log("Banner initialized with debug mode enabled"),
                this.log("Banners:", this.banners),
                this.log("iframeBanners:", this.iframeBanners),
                (this.allBanners = [...this.banners]),
                this.iframeBanners &&
                this.iframeBanners.length > 0 &&
                this.showIframeBanner &&
                this.iframeBanners.forEach((e) => {
                    this.allBanners.push({ type: "iframe", ...e });
                }),
                (this.currentBanner = this.getRandomBanner()),
                this.log("Selected banner:", this.currentBanner),
                this.createStyles(),
                this.renderBanner();
        }
        log(...e) {
            if (this.debug) {
                new Date().toISOString().split("T")[1].slice(0, -1);
            }
        }
        getRandomBanner() {
            const e = this.allBanners[Math.floor(Math.random() * this.allBanners.length)];
            return this.log("Random banner selected:", e), e;
        }
        getRandomIframeBanner() {
            const e = this.iframeBanners.map((e) => ({ type: "iframe", ...e }));
            let n = e;
            this.currentBanner && "iframe" === this.currentBanner.type && ((n = e.filter((e) => e.src !== this.currentBanner.src)), 0 === n.length && (n = e));
            const t = n[Math.floor(Math.random() * n.length)];
            return this.log("Random iframe banner selected:", t), t;
        }
        getRandomDelay() {
            return Math.floor(1e4 * Math.random()) + 2e4;
        }
        showNextBanner(e = !0) {
            if ((this.bannerCount++, this.bannerCount < this.maxBanners))
                if (1 === this.bannerCount)
                    if (e) {
                        const e = this.getRandomDelay();
                        this.log(`Scheduling next iframe banner to show in ${e / 1e3} seconds`),
                            setTimeout(() => {
                                (this.currentBanner = this.getRandomIframeBanner()), this.log("Next iframe banner selected:", this.currentBanner), this.renderBanner();
                            }, e);
                    } else this.log("Showing next iframe banner immediately"), (this.currentBanner = this.getRandomIframeBanner()), this.log("Next iframe banner selected:", this.currentBanner), this.renderBanner();
                else if (e) {
                    const e = this.getRandomDelay();
                    this.log(`Scheduling next banner to show in ${e / 1e3} seconds`),
                        setTimeout(() => {
                            (this.currentBanner = this.getRandomBanner()), this.log("Next banner selected:", this.currentBanner), this.renderBanner();
                        }, e);
                } else this.log("Showing next banner immediately"), (this.currentBanner = this.getRandomBanner()), this.log("Next banner selected:", this.currentBanner), this.renderBanner();
            else this.log(`Maximum banner count (${this.maxBanners}) reached. No more banners will be shown.`);
        }
        createStyles() {
            const e = document.createElement("style"),
                { top: n, right: t, bottom: r, left: a } = this.position,
                s = `\n      ${n ? `top: ${n};` : ""}\n      ${t ? `right: ${t};` : ""}\n      ${r ? `bottom: ${r};` : ""}\n      ${a ? `left: ${a};` : ""}\n    `;
            (e.textContent = `\n      .pp-banner-partner {\n        position: fixed;\n        ${s}\n        z-index: 999999;\n        transition: transform 0.3s ease;\n        transform: translateX(120%);\n      }\n      .pp-banner-partner.show {\n        transform: translateX(0);\n      }\n      .pp-banner-partner img {\n        max-width: 150px;\n        height: auto;\n        overflow: hidden;\n        box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.4);\n        transition: transform 0.3s ease;\n        border-radius: 10px;\n      }\n      .pp-banner-partner img:hover {\n        transform: scale(1.05);\n      }\n      .pp-banner-close-button {\n        position: absolute;\n        top: -10px;\n        right: -10px;\n        width: 24px;\n        height: 24px;\n        background: #fff;\n        border-radius: 50%;\n        display: flex;\n        align-items: center;\n        justify-content: center;\n        cursor: pointer;\n        box-shadow: 0 0 5px rgba(0,0,0,0.3);\n        z-index: 1000000;\n      }\n      .pp-banner-close-button::before,\n      .pp-banner-close-button::after {\n        content: '';\n        position: absolute;\n        width: 12px;\n        height: 2px;\n        background: #333;\n        transform-origin: center;\n      }\n      .pp-banner-close-button::before {\n        transform: rotate(45deg);\n      }\n      .pp-banner-close-button::after {\n        transform: rotate(-45deg);\n      }\n      .pp-banner-close-button:hover {\n        transform: scale(1.1);\n      }\n      .pp-banner-iframe {\n        position: fixed;\n        ${s}\n        z-index: 999999;\n        transition: transform 0.3s ease;\n        transform: translateX(120%);\n        overflow: visible;\n        border-radius: 10px;\n        box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.4);\n        padding: 10px;\n        background: white;\n      }\n      .pp-banner-iframe.show {\n        transform: translateX(0);\n      }\n      .pp-banner-iframe iframe {\n        border: none;\n        border-radius: 10px;\n        display: block;\n      }\n      .pp-banner-hide {\n        transform: translateX(120%) !important;\n      }\n    `),
                document.head.appendChild(e);
        }
        renderBanner() {
            if (
                (this.log("Rendering banner:", this.currentBanner),
                    "iframe" === this.currentBanner.type ? (this.log("Rendering iframe banner"), this.renderIframe(this.currentBanner)) : (this.log("Rendering image banner"), this.renderImageBanner(this.currentBanner)),
                    0 === this.bannerCount)
            ) {
                const e = this.getRandomDelay();
                this.log(`Setting auto-close timer for ${e / 1e3} seconds (first banner only)`),
                    (this.autoCloseTimer = setTimeout(() => {
                        this.log("Auto-closing banner due to timeout"),
                            this.currentBannerElement &&
                            (this.currentBannerElement.classList.add("pp-banner-hide"),
                                setTimeout(() => {
                                    this.currentBannerElement && (this.currentBannerElement.remove(), (this.currentBannerElement = null)), this.showNextBanner(!1);
                                }, 300));
                    }, e));
            } else this.log("This is the second banner - no auto-close timer will be set");
        }
        renderImageBanner(e) {
            this.log("Creating image banner element for:", e);
            const n = document.createElement("a");
            (n.href = e.link), (n.className = "pp-banner-partner"), (n.target = "_blank");
            const t = document.createElement("div");
            (t.className = "pp-banner-close-button"),
                (t.onclick = (e) => {
                    e.preventDefault(),
                        e.stopPropagation(),
                        n.classList.add("pp-banner-hide"),
                        this.autoCloseTimer && (clearTimeout(this.autoCloseTimer), (this.autoCloseTimer = null)),
                        setTimeout(() => {
                            n.remove(), (this.currentBannerElement = null), this.showNextBanner(!0);
                        }, 300);
                });
            const r = document.createElement("img");
            (r.src = e.image),
                (r.alt = e.text),
                (r.title = e.text),
                n.appendChild(t),
                n.appendChild(r),
                document.body.appendChild(n),
                (this.currentBannerElement = n),
                setTimeout(() => {
                    this.log("Showing image banner"), n.classList.add("show");
                }, 1e3);
        }
        renderIframe(e) {
            this.log("Creating iframe banner element for:", e);
            const n = document.createElement("div");
            n.className = "pp-banner-iframe";
            const t = document.createElement("div");
            (t.className = "pp-banner-close-button"),
                (t.onclick = () => {
                    n.classList.add("pp-banner-hide"),
                        this.autoCloseTimer && (clearTimeout(this.autoCloseTimer), (this.autoCloseTimer = null)),
                        setTimeout(() => {
                            n.remove(), (this.currentBannerElement = null), this.showNextBanner(!0);
                        }, 300);
                });
            const r = document.createElement("iframe");
            (r.src = e.src),
                (r.width = e.width),
                (r.height = e.height),
                n.appendChild(t),
                n.appendChild(r),
                document.body.appendChild(n),
                (this.currentBannerElement = n),
                setTimeout(() => {
                    this.log("Showing iframe banner"), n.classList.add("show");
                }, 1e3);
        }
    }
    const n = [],
        t = [
            { link: "https://colormagic.app/shadow?ref=boltunblocker", text: "Color Magic Premium" },
            { link: "https://fontgenerator.cc?ref=boltunblocker", text: "Font Generator Pro" },
        ],
        r = [
            { src: "https://colormagic.app/embed", width: "300px", height: "308px" },
            { src: "https://fontgenerator.cc/embed", width: "300px", height: "120px" },
        ],
        a = { top: "20px", right: "20px" };
    {
        const e = document.createElement("script");
        (e.defer = !0), (e.dataset.domain = "boltunblocker.bot.nu"), (e.src = "https://stats.senty.com.au/js/script.outbound-links.pageview-props.tagged-events.js"), document.head.appendChild(e);
    }
    function s() {

    }
    "loading" === document.readyState ? document.addEventListener("DOMContentLoaded", s) : s();
})();
