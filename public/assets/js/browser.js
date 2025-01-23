async function init() {
    try {
        const connection = new BareMux.BareMuxConnection("/baremux/worker.js");
        const wispUrl = (location.protocol === "https:" ? "wss" : "ws") + "://" + location.host + "/wisp/";
        if (await connection.getTransport() !== "/epoxy/index.mjs") {
            await connection.setTransport("/epoxy/index.mjs", [{ wisp: wispUrl }]);
            console.log("Using websocket transport. Wisp URL is: " + wispUrl);
        }
    } catch (err) {
        console.error("An error occurred while setting up baremux:", err);
    }
    document.getElementById("frame").src = localStorage.getItem("url");
    if (localStorage.getItem("load") === "quick") {
        document.getElementById("particles-js")?.remove();
        document.getElementById("wrapper")?.remove();
        document.getElementById("bga")?.remove();
    }
}

init().then(() => {
});
