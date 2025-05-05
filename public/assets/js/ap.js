const ap = document.getElementById("apps");
const abut = document.getElementById("flogo");

function loadCustomApps() {
    try {
        const appsFrame = document.getElementById("apps");
        const appsDoc = appsFrame.contentDocument || appsFrame.contentWindow.document;
        
        if (appsFrame.contentWindow.getCustomApps) {
            appsFrame.contentWindow.getCustomApps();
        } else {
            console.log("getCustomApps function not found in iframe");
        }
    } catch (error) {
        console.error("Error loading custom apps:", error);
    }
}

abut.addEventListener("click", () => {
    ap.classList.toggle("active");
    abut.setAttribute("data-tooltip", ap.classList.contains("active") ? "Close" : "Apps");
    tooltip.textContent = flogo.getAttribute('data-tooltip');
    
    if (ap.classList.contains("active")) {
        setTimeout(loadCustomApps, 100);
    }
});
