const ap = document.getElementById("apps");
const abut = document.getElementById("flogo");

function loadCustomApps() {
    try {
        const appsFrame = document.getElementById("apps");
        if (!appsFrame) {
            console.warn("Apps frame not found");
            return;
        }

        if (appsFrame.contentWindow) {
            if (typeof appsFrame.contentWindow.getCustomApps === 'function') {
                appsFrame.contentWindow.getCustomApps();
            } else {
                console.log("getCustomApps function not found in iframe - this is normal if no custom apps are defined");
            }
        } else {
            console.log("Waiting for iframe to load...");
            appsFrame.onload = () => {
                if (typeof appsFrame.contentWindow.getCustomApps === 'function') {
                    appsFrame.contentWindow.getCustomApps();
                }
            };
        }
    } catch (error) {
        console.error("Error loading custom apps:", error);
    }
}

if (abut) {
    abut.addEventListener("click", () => {
        if (ap) {
            ap.classList.toggle("active");
            abut.setAttribute("data-tooltip", ap.classList.contains("active") ? "Close" : "Apps");
            const tooltip = document.querySelector('[data-tooltip]');
            if (tooltip) {
                tooltip.textContent = abut.getAttribute('data-tooltip');
            }
            
            if (ap.classList.contains("active")) {
                setTimeout(loadCustomApps, 100);
            }
        }
    });
}
