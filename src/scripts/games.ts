


let allGames: any[] = [];
let currentCategory = 'All';
let currentSearch = '';
let favorites: Set<string> = new Set();
let isNavigating = false;

function loadFavorites() {
    const saved = window.top?.localStorage.getItem('gameFavorites');
    if (saved) favorites = new Set(JSON.parse(saved));
}

function saveFavorites() {
    window.top?.localStorage.setItem('gameFavorites', JSON.stringify([...favorites]));
}

function toggleFavorite(gameUrl: string) {
    if (favorites.has(gameUrl)) {
        favorites.delete(gameUrl);
    } else {
        favorites.add(gameUrl);
    }
    saveFavorites();
    filterGames();
}

const categories = [
    { name: 'All', icon: '<svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"> <path d="M3 9H21M9 9L9 21M7.8 3H16.2C17.8802 3 18.7202 3 19.362 3.32698C19.9265 3.6146 20.3854 4.07354 20.673 4.63803C21 5.27976 21 6.11984 21 7.8V16.2C21 17.8802 21 18.7202 20.673 19.362C20.3854 19.9265 19.9265 20.3854 19.362 20.673C18.7202 21 17.8802 21 16.2 21H7.8C6.11984 21 5.27976 21 4.63803 20.673C4.07354 20.3854 3.6146 19.9265 3.32698 19.362C3 18.7202 3 17.8802 3 16.2V7.8C3 6.11984 3 5.27976 3.32698 4.63803C3.6146 4.07354 4.07354 3.6146 4.63803 3.32698C5.27976 3 6.11984 3 7.8 3Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/> </svg>' },
    { name: 'PC Games', icon: '<svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"> <path d="M5.5 20H8M17 9H17.01M8 6H5.2C4.0799 6 3.51984 6 3.09202 6.21799C2.71569 6.40973 2.40973 6.71569 2.21799 7.09202C2 7.51984 2 8.0799 2 9.2V12.8C2 13.9201 2 14.4802 2.21799 14.908C2.40973 15.2843 2.71569 15.5903 3.09202 15.782C3.51984 16 4.0799 16 5.2 16H8M15.2 20H18.8C19.9201 20 20.4802 20 20.908 19.782C21.2843 19.5903 21.5903 19.2843 21.782 18.908C22 18.4802 22 17.9201 22 16.8V7.2C22 6.0799 22 5.51984 21.782 5.09202C21.5903 4.71569 21.2843 4.40973 20.908 4.21799C20.4802 4 19.9201 4 18.8 4H15.2C14.0799 4 13.5198 4 13.092 4.21799C12.7157 4.40973 12.4097 4.71569 12.218 5.09202C12 5.51984 12 6.07989 12 7.2V16.8C12 17.9201 12 18.4802 12.218 18.908C12.4097 19.2843 12.7157 19.5903 13.092 19.782C13.5198 20 14.0799 20 15.2 20ZM18 15C18 15.5523 17.5523 16 17 16C16.4477 16 16 15.5523 16 15C16 14.4477 16.4477 14 17 14C17.5523 14 18 14.4477 18 15Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/> </svg>' },
    { name: 'Action', icon: '<svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"> <path d="M11.2896 3.36637C11.5193 2.92427 11.6342 2.70323 11.7881 2.63139C11.9221 2.56883 12.077 2.56883 12.211 2.63139C12.3649 2.70323 12.4798 2.92427 12.7095 3.36637L14.2225 6.27865C14.3216 6.46934 14.3711 6.56468 14.4454 6.62803C14.511 6.68394 14.5899 6.72195 14.6745 6.73837C14.7704 6.75697 14.8758 6.73625 15.0867 6.69481L18.3069 6.06197C18.7958 5.9659 19.0402 5.91786 19.1923 5.99342C19.3248 6.05921 19.4214 6.18027 19.456 6.32406C19.4958 6.4892 19.3946 6.71681 19.1922 7.17203L17.8586 10.1707C17.7713 10.3671 17.7276 10.4653 17.7244 10.5628C17.7216 10.649 17.7411 10.7344 17.781 10.8108C17.8262 10.8973 17.9082 10.9668 18.072 11.1058L20.5746 13.229C20.9545 13.5513 21.1445 13.7124 21.1803 13.8785C21.2114 14.0231 21.177 14.174 21.0862 14.2908C20.9819 14.4249 20.7408 14.4876 20.2587 14.6132L17.0827 15.4402C16.8748 15.4944 16.7708 15.5215 16.6925 15.5798C16.6234 15.6313 16.5688 15.6998 16.534 15.7786C16.4945 15.868 16.4912 15.9754 16.4847 16.1901L16.3851 19.4705C16.37 19.9685 16.3624 20.2175 16.2549 20.349C16.1613 20.4635 16.0218 20.5307 15.8739 20.5325C15.704 20.5345 15.5047 20.3852 15.1059 20.0865L12.4791 18.1191C12.3071 17.9903 12.2211 17.9259 12.1267 17.9011C12.0434 17.8791 11.9558 17.8791 11.8724 17.9011C11.778 17.9259 11.692 17.9903 11.52 18.1191L8.8932 20.0865C8.49444 20.3852 8.29506 20.5345 8.12521 20.5325C7.97731 20.5307 7.8378 20.4635 7.74418 20.349C7.63667 20.2175 7.62911 19.9685 7.61399 19.4705L7.51439 16.1901C7.50787 15.9754 7.50461 15.868 7.46514 15.7786C7.43031 15.6998 7.37569 15.6313 7.30658 15.5798C7.22829 15.5215 7.12432 15.4944 6.91636 15.4402L3.74042 14.6132C3.2583 14.4876 3.01724 14.4249 2.91295 14.2908C2.82214 14.174 2.78768 14.0231 2.81884 13.8785C2.85463 13.7124 3.04458 13.5513 3.42448 13.229L5.92706 11.1058C6.09093 10.9668 6.17286 10.8973 6.21808 10.8108C6.258 10.7344 6.27749 10.649 6.27467 10.5628C6.27148 10.4653 6.22782 10.3671 6.1405 10.1707L4.80694 7.17203C4.6045 6.71681 4.50328 6.4892 4.54309 6.32406C4.57775 6.18027 4.6743 6.05921 4.80677 5.99342C4.95891 5.91786 5.20333 5.9659 5.69219 6.06197L8.91245 6.69481C9.1233 6.73625 9.22873 6.75697 9.32458 6.73837C9.4092 6.72195 9.48812 6.68394 9.55371 6.62803C9.62802 6.56468 9.67755 6.46934 9.77662 6.27865L11.2896 3.36637Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/> </svg>' },
    { name: 'Adventure', icon: '<svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"> <path d="M9 18L2 22V6L9 2M9 18L16 22M9 18V2M16 22L22 18V2L16 6M16 22V6M16 6L9 2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/> </svg>' },
    { name: 'Horror', icon: '<svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"> <path d="M12 2C16.4183 2 20 5.58172 20 10V21L16 17L12 21L8 17L4 21V10C4 5.58172 7.58172 2 12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/> <path d="M9 9H9.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/> <path d="M15 9H15.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/> </svg>' },
    { name: 'Shooting', icon: '<svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"> <path d="M22 12H18M6 12H2M12 6V2M12 22V18M20 12C20 16.4183 16.4183 20 12 20C7.58172 20 4 16.4183 4 12C4 7.58172 7.58172 4 12 4C16.4183 4 20 7.58172 20 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/> </svg>' },
    { name: 'Puzzle', icon: '<svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"> <path d="M7.5 4.5C7.5 3.11929 8.61929 2 10 2C11.3807 2 12.5 3.11929 12.5 4.5V6H13.5C14.8978 6 15.5967 6 16.1481 6.22836C16.8831 6.53284 17.4672 7.11687 17.7716 7.85195C18 8.40326 18 9.10218 18 10.5H19.5C20.8807 10.5 22 11.6193 22 13C22 14.3807 20.8807 15.5 19.5 15.5H18V17.2C18 18.8802 18 19.7202 17.673 20.362C17.3854 20.9265 16.9265 21.3854 16.362 21.673C15.7202 22 14.8802 22 13.2 22H12.5V20.25C12.5 19.0074 11.4926 18 10.25 18C9.00736 18 8 19.0074 8 20.25V22H6.8C5.11984 22 4.27976 22 3.63803 21.673C3.07354 21.3854 2.6146 20.9265 2.32698 20.362C2 19.7202 2 18.8802 2 17.2V15.5H3.5C4.88071 15.5 6 14.3807 6 13C6 11.6193 4.88071 10.5 3.5 10.5H2C2 9.10218 2 8.40326 2.22836 7.85195C2.53284 7.11687 3.11687 6.53284 3.85195 6.22836C4.40326 6 5.10218 6 6.5 6H7.5V4.5Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/> </svg>' },
    { name: 'Sports', icon: '<svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"> <!-- Outer circle --> <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/> <!-- Inner pentagon --> <path d="M12 8L15.8 10.76L14.35 15.24H9.65L8.2 10.76Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/> <!-- Lines from pentagon vertices to circle edge --> <line x1="12" y1="8" x2="12" y2="2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/> <line x1="15.8" y1="10.76" x2="21.51" y2="8.91" stroke="currentColor" stroke-width="2" stroke-linecap="round"/> <line x1="14.35" y1="15.24" x2="17.88" y2="20.09" stroke="currentColor" stroke-width="2" stroke-linecap="round"/> <line x1="9.65" y1="15.24" x2="6.12" y2="20.09" stroke="currentColor" stroke-width="2" stroke-linecap="round"/> <line x1="8.2" y1="10.76" x2="2.49" y2="8.91" stroke="currentColor" stroke-width="2" stroke-linecap="round"/> </svg>' },
    { name: 'Racing', icon: '<svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"> <path d="M5 13H8M2 9L4 10L5.27064 6.18807C5.53292 5.40125 5.66405 5.00784 5.90729 4.71698C6.12208 4.46013 6.39792 4.26132 6.70951 4.13878C7.06236 4 7.47705 4 8.30643 4H15.6936C16.523 4 16.9376 4 17.2905 4.13878C17.6021 4.26132 17.8779 4.46013 18.0927 4.71698C18.3359 5.00784 18.4671 5.40125 18.7294 6.18807L20 10L22 9M16 13H19M6.8 10H17.2C18.8802 10 19.7202 10 20.362 10.327C20.9265 10.6146 21.3854 11.0735 21.673 11.638C22 12.2798 22 13.1198 22 14.8V17.5C22 17.9647 22 18.197 21.9616 18.3902C21.8038 19.1836 21.1836 19.8038 20.3902 19.9616C20.197 20 19.9647 20 19.5 20H19C17.8954 20 17 19.1046 17 18C17 17.7239 16.7761 17.5 16.5 17.5H7.5C7.22386 17.5 7 17.7239 7 18C7 19.1046 6.10457 20 5 20H4.5C4.03534 20 3.80302 20 3.60982 19.9616C2.81644 19.8038 2.19624 19.1836 2.03843 18.3902C2 18.197 2 17.9647 2 17.5V14.8C2 13.1198 2 12.2798 2.32698 11.638C2.6146 11.0735 3.07354 10.6146 3.63803 10.327C4.27976 10 5.11984 10 6.8 10Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/> </svg>' },
    { name: 'Arcade', icon: '<svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"> <path d="M5.99989 11H9.99989M7.99989 9V13M14.9999 12H15.0099M17.9999 10H18.0099M10.4488 5H13.5509C16.1758 5 17.4883 5 18.5184 5.49743C19.4254 5.9354 20.179 6.63709 20.6805 7.51059C21.2501 8.5027 21.3436 9.81181 21.5306 12.43L21.7766 15.8745C21.8973 17.5634 20.5597 19 18.8664 19C18.0005 19 17.1794 18.6154 16.6251 17.9502L16.2499 17.5C15.9068 17.0882 15.7351 16.8823 15.5398 16.7159C15.1302 16.3672 14.6344 16.1349 14.1043 16.0436C13.8514 16 13.5834 16 13.0473 16H10.9525C10.4164 16 10.1484 16 9.89553 16.0436C9.36539 16.1349 8.86957 16.3672 8.46 16.7159C8.26463 16.8823 8.09305 17.0882 7.74989 17.5L7.37473 17.9502C6.8204 18.6154 5.99924 19 5.13335 19C3.44013 19 2.1025 17.5634 2.22314 15.8745L2.46918 12.43C2.65619 9.81181 2.7497 8.5027 3.31926 7.51059C3.82074 6.63709 4.57433 5.9354 5.48135 5.49743C6.51151 5 7.82396 5 10.4488 5Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/> </svg>' },
    { name: 'Strategy', icon: '<svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"> <path d="M11.5 5H11.9344C14.9816 5 16.5053 5 17.0836 5.54729C17.5836 6.02037 17.8051 6.71728 17.6702 7.39221C17.514 8.17302 16.2701 9.05285 13.7823 10.8125L9.71772 13.6875C7.2299 15.4471 5.98599 16.327 5.82984 17.1078C5.69486 17.7827 5.91642 18.4796 6.41636 18.9527C6.99474 19.5 8.51836 19.5 11.5656 19.5H12.5M8 5C8 6.65685 6.65685 8 5 8C3.34315 8 2 6.65685 2 5C2 3.34315 3.34315 2 5 2C6.65685 2 8 3.34315 8 5ZM22 19C22 20.6569 20.6569 22 19 22C17.3431 22 16 20.6569 16 19C16 17.3431 17.3431 16 19 16C20.6569 16 22 17.3431 22 19Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/> </svg>' },
    { name: 'Multiplayer', icon: '<svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"> <path d="M22 21V19C22 17.1362 20.7252 15.5701 19 15.126M15.5 3.29076C16.9659 3.88415 18 5.32131 18 7C18 8.67869 16.9659 10.1159 15.5 10.7092M17 21C17 19.1362 17 18.2044 16.6955 17.4693C16.2895 16.4892 15.5108 15.7105 14.5307 15.3045C13.7956 15 12.8638 15 11 15H8C6.13623 15 5.20435 15 4.46927 15.3045C3.48915 15.7105 2.71046 16.4892 2.30448 17.4693C2 18.2044 2 19.1362 2 21M13.5 7C13.5 9.20914 11.7091 11 9.5 11C7.29086 11 5.5 9.20914 5.5 7C5.5 4.79086 7.29086 3 9.5 3C11.7091 3 13.5 4.79086 13.5 7Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/> </svg>' }
];

function categorizeGame(game: any): string[] {
    const name = game.name.toLowerCase();
    const categories: string[] = [];

    if (name.includes('shoot') || name.includes('gun') || name.includes('war') || name.includes('battle') || name.includes('fight') || name.includes('tank') || name.includes('zombie') || name.includes('sniper')) categories.push('Action');
    if (name.includes('adventure') || name.includes('quest') || name.includes('explore')) categories.push('Adventure');
    if (name.includes('puzzle') || name.includes('2048') || name.includes('quiz') || name.includes('sudoku') || name.includes('chess') || name.includes('solitaire') || name.includes('minesweeper')) categories.push('Puzzle');
    if (name.includes('gun') || name.includes('shooting') || name.includes('shot') || name.includes('bullet') || name.includes('fortzone') || name.includes('tank') || name.includes('boom') || name.includes('shooter')) categories.push('Shooting');
    if (name.includes('basketball') || name.includes('football') || name.includes('soccer') || name.includes('golf') || name.includes('sport')) categories.push('Sports');
    if (name.includes('racing') || name.includes('car') || name.includes('drive') || name.includes('moto') || name.includes('kart') || name.includes('drift')) categories.push('Racing');
    if (name.includes('run') || name.includes('jump') || name.includes('flappy') || name.includes('slope') || name.includes('dash') || name.includes('vex')) categories.push('Arcade');
    if (name.includes('tower') || name.includes('defense') || name.includes('strategy') || name.includes('td') || name.includes('bloons')) categories.push('Strategy');
    if (name.includes('.io') || name.includes('multiplayer') || name.includes('online')) categories.push('Multiplayer');

    if (categories.length === 0) categories.push('Arcade');

    return categories;
}
function setupDelegatedListeners() {
    // Use document.body (or a persistent wrapper) instead of the grid elements,
    // so click handling is ready before any game cards are rendered.
    document.body.addEventListener('click', (e) => {
        const favBtn = (e.target as HTMLElement).closest('.fav-btn');
        if (favBtn) {
            e.stopPropagation();
            const url = favBtn.getAttribute('data-url');
            if (url) toggleFavorite(url);
            return;
        }

        const card = (e.target as HTMLElement).closest('.game-card') as HTMLElement;
        if (!card) return;

        const needsProxy = card.getAttribute('data-proxy') === 'true';
        if (needsProxy) {
            const topWindow = window.top as any;
            const originalUrl = card.getAttribute('data-original-url');
            const title = card.querySelector('h3')?.textContent || "Game";
            const icon = card.querySelector('img')?.getAttribute('src') || "/img/icons/browser.webp";

            if (topWindow && topWindow.Window && originalUrl) {
                new topWindow.Window({ url: `/siterunner?url=${originalUrl}`, title, icon, startMaximized: false });
                return;
            }
        }



        const link = card.getAttribute('data-link');
        console.log("link value:", link);
        if (link) {
            console.log("navigating");
            isNavigating = true;
            window.stop();                  // ← cancel all pending image/resource loads
            window.location.replace(link);
            return;
        }

    });
}
function loadGames() {
    loadFavorites();

    fetch('/json/games.json')
        .then(response => response.json())
        .then(games => {
            allGames = games
                // Filter out the old suggest/random special cards
                .filter((game: any) => !['sug', 'ran'].includes(game.url))
                .map((game: any) => ({
                    ...game,
                    categories: (game.categories && game.categories.length > 0) ? game.categories : (game.category ? [game.category] : categorizeGame(game))
                }));

            renderCategories();
            filterGames();

            const searchInput = document.getElementById('searchInput') as HTMLInputElement;
            if (searchInput) {
                searchInput.addEventListener('input', () => {
                    currentSearch = searchInput.value.toLowerCase().trim();
                    filterGames();
                });
            }

            // Wire up action buttons
            const suggestBtn = document.getElementById('suggest-btn');
            if (suggestBtn) {
                suggestBtn.addEventListener('click', () => {
                    window.open('https://discord.gg/j9taJKe7H8', '_blank');
                });
            }

            const randomBtn = document.getElementById('random-btn');
            // Random button
            if (randomBtn) {
                randomBtn.addEventListener('click', () => {
                    const usableGames = allGames.filter(g => !['sug', 'ran'].includes(g.url));
                    if (usableGames.length === 0) return;
                    const randomGame = usableGames[Math.floor(Math.random() * usableGames.length)];

                    let gameUrl = randomGame.url;
                    if (!gameUrl.startsWith('http') && !gameUrl.startsWith('/cdn/games/')) {
                        gameUrl = `/cdn/games/${gameUrl}`;
                    }

                    const nextUrl = `/play?url=${encodeURIComponent(gameUrl)}&title=${encodeURIComponent(randomGame.name)}&icon=${encodeURIComponent(randomGame.image)}`;
                    isNavigating = true;
                    window.stop();              // ← and here
                    window.location.href = nextUrl;
                });
            }
            // Sidebar toggle logic
            const sidebar = document.getElementById('sidebar');
            const sidebarToggle = document.getElementById('sidebar-toggle');

            if (sidebar && sidebarToggle) {
                // Initialize state
                if (window.innerWidth <= 1024) {
                    sidebar.classList.add('collapsed');
                }

                sidebarToggle.addEventListener('click', () => {
                    sidebar.classList.toggle('collapsed');

                    // Save preference if needed
                    if (window.innerWidth > 1024) {
                        localStorage.setItem('sidebarCollapsed', sidebar.classList.contains('collapsed').toString());
                    }
                });

                // Load saved preference for desktop
                const savedPreference = localStorage.getItem('sidebarCollapsed');
                if (window.innerWidth > 1024 && savedPreference === 'true') {
                    sidebar.classList.add('collapsed');
                }
            }
        })
        .catch(error => console.error('Error loading games:', error));
}

function renderCategories() {
    const categoriesContainer = document.getElementById('categories');
    if (!categoriesContainer) return;

    categoriesContainer.innerHTML = categories.map(category => `
        <button class="category-btn ${category.name === 'All' ? 'active' : ''}" data-category="${category.name}">
            ${category.icon}
            <span>${category.name}</span>
        </button>
    `).join('');

    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const target = (e.target as HTMLElement).closest('.category-btn') as HTMLElement;
            if (!target) return;
            currentCategory = target.dataset.category || 'All';

            document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
            target.classList.add('active');

            filterGames();
        });
    });
}

function filterGames() {
    let filtered = allGames;

    if (currentCategory !== 'All') {
        filtered = filtered.filter(game => game.categories.includes(currentCategory));
    }

    if (currentSearch) {
        filtered = filtered.filter(game => game.name.toLowerCase().includes(currentSearch));
    }

    renderGames(filtered);
}
function renderGames(games: any[]) {
    if (isNavigating) return;

    const favoritesSection = document.getElementById('favorites-section') as HTMLElement;
    const favoritesGrid = document.getElementById('favorites-grid');
    const featuredGrid = document.getElementById('featured-grid');
    const allGamesGrid = document.getElementById('games');

    if (!favoritesGrid || !featuredGrid || !allGamesGrid || !favoritesSection) return;

    const favoriteGames = games.filter(g => favorites.has(g.url));
    const featuredGames = games.filter(g => g.featured);

    if (favoriteGames.length > 0) {
        favoritesSection.style.display = '';
        favoritesGrid.innerHTML = favoriteGames.map(game => createGameCard(game)).join('');
    } else {
        favoritesSection.style.display = 'none';
        favoritesGrid.innerHTML = '';
    }

    featuredGrid.innerHTML = featuredGames.length > 0
        ? featuredGames.map(game => createGameCard(game)).join('')
        : '<p class="no-games-msg">No featured games in this category</p>';

    allGamesGrid.innerHTML = games.length > 0
        ? games.map(game => createGameCard(game)).join('')
        : '<p class="no-games-msg">No games found</p>';
}
function createGameCard(game: any): string {


    let gameUrl = game.url;
    if (!gameUrl.startsWith('http') && !['sug', 'ran'].includes(gameUrl) && !gameUrl.startsWith('/cdn/games/')) {
        gameUrl = `/cdn/games/${gameUrl}`;
    }

    const link = `/play?url=${encodeURIComponent(gameUrl)}&title=${encodeURIComponent(game.name)}&icon=${encodeURIComponent(game.image)}`;
    const isFav = favorites.has(game.url);

    return `
        <div class="game-card glass cursor-pointer transform transition-transform" data-link="${link}" data-original-url="${game.url}" data-proxy="${game.proxy || 'false'}">
            <img 
                src="${game.image}" 
                alt="${game.name} image" 
                class="game-image"
               
            >
            <div class="px-3 py-2 flex justify-between items-center">
                <h3 class="text-white font-medium text-xl">${game.name}</h3>
                <button class="fav-btn text-2xl text-blue-500" data-url="${game.url}">${isFav ? '★' : '☆'}</button>
            </div>
        </div>
    `;
}

document.addEventListener('DOMContentLoaded', () => {
    setupDelegatedListeners();
    loadGames();
});