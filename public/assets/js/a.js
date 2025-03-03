!function () {
    "use strict";
    class e {
        constructor(e, n, t = !0) {
            this.banners = e, this.iframeBanners = n, this.showIframeBanner = t, this.allBanners = [...this.banners], this.iframeBanners && this.iframeBanners.length > 0 && this.showIframeBanner && this.iframeBanners.forEach((e => { this.allBanners.push({ type: "iframe", ...e }) })), this.currentBanner = this.getRandomBanner(), this.createStyles(), this.renderBanner()
        }
        getRandomBanner() {
            return this.allBanners[Math.floor(Math.random() * this.allBanners.length)]
        }
        createStyles() {
            const e = document.createElement("style");
            e.textContent = "\n      .partner {\n        position: fixed;\n        top: 2vh;\n        right: 20px;\n        z-index: 999999;\n        transition: transform 0.3s ease;\n        transform: translateX(120%);\n      }\n      .partner.show {\n        transform: translateX(0);\n      }\n      .partner img {\n        max-width: 200px;\n        height: auto;\n        overflow: hidden;\n        box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.4);\n        transition: transform 0.3s ease;\n        border-radius: 10px;\n      }\n      .partner img:hover {\n        transform: scale(1.05);\n      }\n      .iframe-banner {\n        position: fixed;\n        bottom: 20px;\n        right: 20px;\n        z-index: 999999;\n        transition: transform 0.3s ease;\n        transform: translateX(120%);\n        overflow: hidden;\n        border-radius: 10px;\n        box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.4);\n      }\n      .iframe-banner.show {\n        transform: translateX(0);\n      }\n      .iframe-banner iframe {\n        border: none;\n      }\n    ", document.head.appendChild(e)
        }
        renderBanner() {
            "iframe" === this.currentBanner.type ? this.renderIframe(this.currentBanner) : this.renderImageBanner(this.currentBanner)
        }
        renderImageBanner(e) {
            const n = document.createElement("a");
            n.href = e.link, n.className = "partner", n.target = "_blank";
            const t = document.createElement("img");
            t.src = e.image, t.alt = e.text, t.title = e.text, n.appendChild(t), document.body.appendChild(n), setTimeout((() => { n.classList.add("show") }), 1e3)
        }
        renderIframe(e) {
            const n = document.createElement("div");
            n.className = "iframe-banner";
            const t = document.createElement("iframe");
            t.src = e.src, t.width = e.width, t.height = e.height, n.appendChild(t), document.body.appendChild(n), setTimeout((() => { n.classList.add("show") }), 1e3)
        }
    }
    const n = [{ image: "https://partner.senty.com.au/1.jpeg", link: "https://colormagic.app/shadow?ref=boltunblocker", text: "Color Palette Generator" }, { image: "https://partner.senty.com.au/2.jpeg", link: "https://clickspersecond.com?ref=boltunblocker", text: "CPS Test" }, { image: "https://partner.senty.com.au/3.png", link: "https://sz.games?ref=boltunblocker", text: "SZ Games" }], t = [{ src: "https://colormagic.app/embed", width: "300px", height: "308px" }];
    {
        const e = document.createElement("script");
        e.defer = !0, e.dataset.domain = "boltunblocker.bot.nu", e.src = "https://stats.senty.com.au/js/script.outbound-links.pageview-props.tagged-events.js", document.head.appendChild(e)
    }
    // Removed the problematic overlay div (#ol1) that captured all clicks
    new e(n, t, true)
}();