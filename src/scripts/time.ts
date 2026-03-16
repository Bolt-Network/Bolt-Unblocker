const timeOptions: Intl.DateTimeFormatOptions = {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
};

const date = new Date();
const initialTime = date.toLocaleTimeString([], timeOptions);

function update() {
    if (typeof document !== 'undefined') {
        const date = new Date();
        const time = date.toLocaleTimeString([], timeOptions);
        const timeElement = document.getElementById("time");
        if (timeElement) {
            timeElement.textContent = time;
        }
    }
}

if (typeof window !== 'undefined') {
    update();
    setInterval(update, 1000);
}

export default initialTime;
