const gameFrame = document.getElementById('game-frame') as HTMLIFrameElement;
const gameTitleElement = document.getElementById('game-title') as HTMLHeadingElement;
const gameIconElement = document.getElementById('game-icon') as HTMLImageElement;
const gameContainer = document.getElementById('game-container') as HTMLDivElement;
const fullscreenBtn = document.getElementById('fullscreen-btn') as HTMLButtonElement;
const reloadBtn = document.getElementById('reload-btn') as HTMLButtonElement;

// Get URL parameters
const urlParams = new URLSearchParams(window.location.search);
const gameUrl = urlParams.get('url');
const gameTitle = urlParams.get('title');
const gameIcon = urlParams.get('icon');

// Load game data
if (gameUrl) {
    gameFrame.src = String(gameUrl);
    gameTitleElement.textContent = String(gameTitle || 'Game');
    gameIconElement.src = String(gameIcon || '/favicon.svg');
    gameIconElement.alt = `${gameTitle} icon`;
} else {
    gameTitleElement.textContent = 'No game selected';
    console.error('No game URL provided');
}

// Fullscreen functionality
let isFullscreen = false;

fullscreenBtn.addEventListener('click', () => {
    toggleFullscreen();
});

function toggleFullscreen() {
    if (!isFullscreen) {
        // Enter fullscreen
        if (gameContainer.requestFullscreen) {
            gameContainer.requestFullscreen();
        } else if ((gameContainer as any).webkitRequestFullscreen) {
            (gameContainer as any).webkitRequestFullscreen();
        } else if ((gameContainer as any).msRequestFullscreen) {
            (gameContainer as any).msRequestFullscreen();
        }
        gameContainer.classList.add('fullscreen');
        isFullscreen = true;
    } else {
        // Exit fullscreen
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if ((document as any).webkitExitFullscreen) {
            (document as any).webkitExitFullscreen();
        } else if ((document as any).msExitFullscreen) {
            (document as any).msExitFullscreen();
        }
        gameContainer.classList.remove('fullscreen');
        isFullscreen = false;
    }
}

// Listen for fullscreen changes (e.g., when user presses ESC)
document.addEventListener('fullscreenchange', handleFullscreenChange);
document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
document.addEventListener('msfullscreenchange', handleFullscreenChange);

function handleFullscreenChange() {
    if (!document.fullscreenElement &&
        !(document as any).webkitFullscreenElement &&
        !(document as any).msFullscreenElement) {
        gameContainer.classList.remove('fullscreen');
        isFullscreen = false;
    }
}

// Reload functionality
reloadBtn.addEventListener('click', () => {
    if (gameFrame.src) {
        // Add a subtle animation
        gameFrame.style.opacity = '0.5';
        gameFrame.src = gameFrame.src;

        // Reset opacity after a brief moment
        setTimeout(() => {
            gameFrame.style.opacity = '1';
        }, 300);
    }
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // F11 for fullscreen
    if (e.key === 'F11') {
        e.preventDefault();
        toggleFullscreen();
    }

    // Ctrl/Cmd + R for reload
    if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
        e.preventDefault();
        reloadBtn.click();
    }
});

// Handle iframe load events
gameFrame.addEventListener('load', () => {
    console.log('Game loaded successfully');
});

gameFrame.addEventListener('error', () => {
    console.error('Failed to load game');
    gameTitleElement.textContent = 'Failed to load game';
});
