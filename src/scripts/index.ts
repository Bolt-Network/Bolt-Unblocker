
import Window from "./Window";
import WindowManager from "./WindowManager";

// Initialize WindowManager singleton (windows self-register)
const windowManager = WindowManager.getInstance();
(window as any).Window = Window;
(window as any).WindowManager = WindowManager;
const mainTitle = document.querySelector("#main-title") as HTMLHeadingElement;
const greeting = document.querySelector("#greeting") as HTMLHeadingElement;
const settings = JSON.parse(localStorage.getItem("bolt-settings") || "{}");
const searchBar = document.querySelector("#searchbar input") as HTMLInputElement;
const searchForm = document.querySelector("#search-form") as HTMLFormElement;
const searchButton = document.querySelector("#search-form button") as HTMLButtonElement;
const searchEngine = settings.searchEngine || 'duckduckgo';
let searchEngineUrl = '';

switch (searchEngine) {
    case 'duckduckgo':
        searchEngineUrl = 'https://duckduckgo.com/?q=';
        break;
    case 'google':
        searchEngineUrl = 'https://www.google.com/search?q=';
        break;
    case 'bing':
        searchEngineUrl = 'https://www.bing.com/search?q=';
        break;
    case 'yahoo':
        searchEngineUrl = 'https://search.yahoo.com/search?q=';
        break;
    case 'brave':
        searchEngineUrl = 'https://search.brave.com/search?q=';
        break;
}

function search(event?: Event) {
    event?.preventDefault();
    const query = searchBar?.value;
    let destinationUrl = "";

    if (query == "" || query == null) {
        return;
    }

    if (query.startsWith('https://') || query.startsWith('http://')) {
        destinationUrl = query;
    } else if (query.includes('.') && !query.includes(' ')) {
        destinationUrl = 'https://' + query;
    } else {
        destinationUrl = searchEngineUrl + query;
    }

    new Window({
        url: "/browser?url=" + destinationUrl,
        title: "Browser",
        icon: "/img/icons/browser.webp",
        startMaximized: false
    });
}


searchForm.addEventListener("submit", search);
searchButton.addEventListener("click", search);
const phrases = ["Proverbs 4:7", "Killing School Boredom", "If you're caught, I was never here", "lock in bro", "(not) developed by a donut", "fastest proxy since 2067", "RAHH 🦅🦅🇺🇸🇺🇸"];
if (!settings.showGreeting) {
    mainTitle.textContent = "Bolt";

    const randomPhrase = phrases[Math.floor(Math.random() * phrases.length)];
    greeting.textContent = randomPhrase;
} else {
    const words = ["Welcome", "Hello", "Hi There", "Aloha", "Hola"];

    const randomWord = words[Math.floor(Math.random() * words.length)];
    const randomPhrase = phrases[Math.floor(Math.random() * phrases.length)];
    mainTitle.textContent = randomWord;
    greeting.textContent = randomPhrase;
}
// First visit debug window logic
const firstVisitKey = "bolt-first-visit";
if (!localStorage.getItem(firstVisitKey)) {
    localStorage.setItem(firstVisitKey, "true");

    const debugWindow = new Window({
        url: "/browser",
        title: "Debug Browser",
        icon: "/img/icons/browser.webp",
        startMaximized: false,
        width: 300,
        height: 200
    });

    // Close it almost instantly
    setTimeout(() => {
        debugWindow.destroy();
    }, 300);
}
