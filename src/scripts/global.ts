if (typeof window !== 'undefined') {
    const settingsRaw = localStorage.getItem('bolt-settings');
    if (settingsRaw) {
        const settings = JSON.parse(settingsRaw);
        const panicKey = settings.panicKey;
        const panicUrl = settings.panicUrl;
        const autoCloak = settings.autoCloak;

        // Tab Cloaking Logic
        if (settings.tabCloak) {
            const icon = document.querySelector('link[rel="icon"]');
            switch (settings.cloakTitle) {
                case 'google':
                    icon?.setAttribute('href', '/img/cloaks/google.ico');
                    document.title = 'math synonym - Google Search';
                    break;
                case 'google-classroom':
                    icon?.setAttribute('href', '/img/cloaks/classroom.png');
                    document.title = 'Home';
                    break;
                case 'clever':
                    icon?.setAttribute('href', '/img/cloaks/clever.webp');
                    document.title = 'Clever';
                    break;
                case 'khan-academy':
                    icon?.setAttribute('href', '/img/cloaks/khan.ico');
                    document.title = 'Khan Academy';
                    break;
            }
        }

        // Panic Key Logic
        if (panicKey && panicUrl) {
            document.addEventListener('keydown', (e) => {
                if (e.key === panicKey) {
                    window.location.href = panicUrl;
                }
            });
        }

        // Auto Cloaking
        if (autoCloak && window.self === window.top) {
            function doCloak() {
                const cloaked = window.open('about:blank', '_blank');
                if (cloaked) {
                    const doc = cloaked.document;
                    doc.body.style.margin = '0';
                    doc.body.style.padding = '0';
                    doc.body.style.width = '100vw';
                    doc.body.style.height = '100vh';
                    doc.body.style.overflow = 'hidden';

                    const iframe = doc.createElement('iframe');
                    iframe.src = window.location.href;
                    iframe.style.width = '100%';
                    iframe.style.height = '100%';
                    iframe.style.border = 'none';
                    iframe.style.margin = '0';
                    iframe.style.padding = '0';

                    doc.body.appendChild(iframe);
                    window.location.replace('https://www.clever.com/');
                }
            }

            // Try immediately first (works on reload)
            const tried = window.open('about:blank', '_blank');
            if (tried) {
                tried.close();
                doCloak();
            } else {
                // Blocked — wait for first user interaction to bypass popup blocker
                const overlay = document.createElement('div');
                overlay.style.cssText = `
                position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
                background: black; z-index: 999999; display: flex;
                align-items: center; justify-content: center; cursor: pointer;
                color: white; font-family: sans-serif; font-size: 1.5rem;
            `;
                overlay.textContent = 'Click anywhere to cloak Bolt';
                document.body.appendChild(overlay);

                overlay.addEventListener('click', () => {
                    doCloak(); // Now inside a user gesture — popup blocker won't block it
                }, { once: true });
            }
        }
    }
}
