const closeButton = document.getElementById('close-button');
const navItems = document.querySelectorAll('.nav-item');
const sections = document.querySelectorAll('.settings-section');
const particlesToggle = document.getElementById('particles-toggle');
const backgroundSelect = document.getElementById('background-select');
const classroom = document.getElementById('google-classroom');
const clever = document.getElementById('clever');
const desmos = document.getElementById('desmos');
const bolt = document.getElementById('bolt');
const bugDialogToggle = document.getElementById('bug-dialog-toggle');
const blooket = document.getElementById('blooket');
const gimkit = document.getElementById('gimkit');
const ab = document.getElementById('ab');
const abToggle = document.getElementById('ab-toggle');
const usernameInput = document.getElementById('username');
const setUsernameButton = document.getElementById('set-username');
const deleteAccountButton = document.getElementById('delete-account');
const uvDecode = document.getElementById('uvdecoder');
const uvDecodeButton = document.getElementById('decodeuv');
const sjDecode = document.getElementById('sjdecoder');
const sjDecodeButton = document.getElementById('decodesj');
const proxySelect = document.getElementById('proxy-select');
const transportSelect = document.getElementById('transport-select');
const boltPremium = document.getElementById('bolt-premium');
const premiumActivate = document.getElementById('activate-premium');
const searchEngineSelect = document.getElementById('search-engine');
const performaceMode = document.getElementById('activate-upm');
const adsDisable = document.getElementById('disable-ads');
const addWallpaper = document.getElementById('add-wallpaper-btn');
const addWallpaperURL = document.getElementById('add-wallpaper-url');
const WEBHOOK_URL = 'https://discord.com/api/webhooks/1369096278142746665/xELduKuAgvubhRUj1Oah8QHCIEE2fr6WTAZtkRh4dKIY0kW8Zrsy3mqEn43kBKo-tohK';

document.addEventListener('DOMContentLoaded', () => {
    initTooltips();
    if (localStorage.getItem("wallpaper") == "/assets/imgs/wallpapers/wallpaper.jpg") {
        backgroundSelect.value = "0";
    }
    else if (localStorage.getItem("wallpaper") == "/assets/imgs/wallpapers/wallpaper1.jpg") {
        backgroundSelect.value = "1";
    }
    else if (localStorage.getItem("wallpaper") == "/assets/imgs/wallpapers/wallpaper2.jpg") {
        backgroundSelect.value = "2";
    }
    else {
        backgroundSelect.text = "Custom";
    }

    particlesToggle.checked = localStorage.getItem('particlesEnabled');
});

closeButton.addEventListener('click', closeWindow);
navItems.forEach(item => {
    item.addEventListener('click', () => {
        navItems.forEach(navItem => navItem.classList.remove('active'));
        item.classList.add('active');
        const sectionId = item.getAttribute('data-section');
        sections.forEach(section => section.classList.remove('active'));
        document.getElementById(`${sectionId}-section`).classList.add('active');
    });
});

function initTooltips() {
    const tooltipElements = document.querySelectorAll('[data-tooltip]');

    tooltipElements.forEach(element => {
        element.addEventListener('mouseover', (e) => {
            const tooltipText = element.getAttribute('data-tooltip');
            tooltip.textContent = tooltipText;
            tooltip.style.opacity = '1';

            const rect = element.getBoundingClientRect();
            tooltip.style.top = `${rect.bottom + 10}px`;
            tooltip.style.left = `${rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2)}px`;
        });

        element.addEventListener('mouseout', () => {
            tooltip.style.opacity = '0';
        });
    });
}

// particlesToggle.checked = localStorage.getItem('particlesEnabled') === 'true';
particlesToggle.addEventListener('change', () => {
    localStorage.setItem('particlesEnabled', particlesToggle.checked);
    window.top.location.reload();
});
backgroundSelect.value = localStorage.getItem('background') || '0';
backgroundSelect.addEventListener('change', () => {
    if (backgroundSelect.value == "0") {
        localStorage.setItem('wallpaper', "/assets/imgs/wallpapers/wallpaper.jpg");
    } else if (backgroundSelect.value == "1") {
        localStorage.setItem('wallpaper', "/assets/imgs/wallpapers/wallpaper1.jpg");
    } else if (backgroundSelect.value == "2") {
        localStorage.setItem('wallpaper', "/assets/imgs/wallpapers/wallpaper2.jpg");
    }
    window.top.location.reload();
});
addWallpaper.addEventListener('click', () => {
    localStorage.setItem('wallpaper', addWallpaperURL.value);
    window.top.location.reload();
});
classroom.addEventListener('click', () => {
    localStorage.setItem('cloak', 'classroom');
    window.top.location.reload();
});
clever.addEventListener('click', () => {
    localStorage.setItem('cloak', 'clever');
    window.top.location.reload();
});
desmos.addEventListener('click', () => {
    localStorage.setItem('cloak', 'desmos');
    window.top.location.reload();
});
bolt.addEventListener('click', () => {
    localStorage.setItem('cloak', 'none');
    window.top.location.reload();
});
bugDialogToggle.checked = localStorage.getItem('bug-reporter-notification') === 'true';
bugDialogToggle.addEventListener('change', () => {
    localStorage.setItem('bug-reporter-notification', bugDialogToggle.checked);
});
blooket.addEventListener('click', () => {
    fetch('/assets/cheats/blooket.txt')
        .then(response => response.text())
        .then(data => {
            navigator.clipboard.writeText(data);
        })
        .catch(error => {
            console.error('Error copying Blooket cheats:', error);
        });
    alert('Cheats copied to clipboard!');
});

gimkit.addEventListener('click', () => {
    fetch('/assets/cheats/gimkit.txt')
        .then(response => response.text())
        .then(data => {
            navigator.clipboard.writeText(data);
        })
        .catch(error => {
            console.error('Error copying Gimkit cheats:', error);
        });
    alert('Cheats copied to clipboard!');
});

ab.addEventListener('click', () => {
    var newTab = window.open('about:blank', '_blank');
    newTab.document.body.innerHTML = '<iframe src="/srcdocs/apps/index.html" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: none;"></iframe>';
    window.top.location.href = 'https://classroom.google.com/u/0/h';
});

abToggle.checked = localStorage.getItem('autoab') === 'true';
abToggle.addEventListener('change', () => {
    localStorage.setItem('autoab', abToggle.checked);
});

setUsernameButton.addEventListener('click', () => {
    if (usernameInput.value === '' || usernameInput.value === null || usernameInput.value === " ") {
        alert('Please enter a username.');
        return;
    }
    localStorage.setItem('name', usernameInput.value);
    window.top.location.reload();
});

deleteAccountButton.addEventListener('click', () => {
    if (confirm('Are you sure you want to delete your account? All data will be lost.')) {
        localStorage.clear();
        window.top.location.reload();
    }
});

uvDecodeButton.addEventListener('click', () => {
    if (uvDecode.value === '' || uvDecode.value === null || uvDecode.value === " ") {
        alert('Please enter a URL to decode.');
        return;
    }
    var decodedURL = window.uvDecodeUrl(uvDecode.value);
    uvDecode.value = decodedURL;
});
sjDecodeButton.addEventListener('click', () => {
    if (sjDecode.value === '' || sjDecode.value === null || sjDecode.value === " ") {
        alert('Please enter a URL to decode.');
        return;
    }
    var decodedURL = window.sjDecodeUrl(sjDecode.value);
    sjDecode.value = decodedURL;
});
proxySelect.value = localStorage.getItem('proxy') || 'uv';
proxySelect.addEventListener('change', () => {
    localStorage.setItem('proxy', proxySelect.value);
});
transportSelect.value = localStorage.getItem('transport') || 'epoxy';
transportSelect.addEventListener('change', () => {
    localStorage.setItem('transport', transportSelect.value);
});

premiumActivate.addEventListener('click', async () => {
    if (boltPremium.value === '' || boltPremium.value === null || boltPremium.value === " ") {
        alert('Please enter a valid premium code.');
        return;
    } else {
        var a = '117,116,102,45,56'
        var b = '104,116,116,112,115,58,47,47,112,50,50,103,122,104,112,118,110,117,109,54,103,105,104,106,103,102,55,97,114,57,98,46,112,97,103,101,115,46,100,101,118,47,82,68,120,78,53,51,55,51,65,70,106,66,55,108,46,116,120,116';
        var c = new TextDecoder().decode(new Uint8Array(a.split(',').map(Number)));
        var d = new TextDecoder(c).decode(new Uint8Array(b.split(',').map(Number)));
        await fetch(d, {
            method: 'GET',
            headers: {
            }
        })
            .then(response => response.text())
            .then(data => {
                if (data === boltPremium.value) {
                    var discordname = prompt('Premium code is valid! Enter your Discord username to send the activation request. NOTE: You must be in the Discord server for this to work.');
                    sendWebhookMessage(discordname);
                    localStorage.setItem('a', 'false');
                    window.top.location.reload();
                }
                else {
                    alert('Invalid premium code.');
                }
            })
            .catch(error => {
                console.error('Error checking premium code:', error);
            });
    }
});

async function sendWebhookMessage(username) {
    try {
        const payload = {
            username: "Premium Activation",
            content: "`" + localStorage.getItem('name') + "` sent a premium activation request for `" + username + "`.",
        };

        const response = await fetch(WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error(`Failed to send to Discord: ${response.status}`);
        }

        alert('Activation request sent! Waiting for approval by a moderator.');
    } catch (error) {
        console.error('Error sending activation request:', error);
        alert('Failed to send activation request. Please try again.');
    }
}

searchEngineSelect.value = localStorage.getItem('searchEngine') || 'duckduckgo';
searchEngineSelect.addEventListener('change', () => {
    localStorage.setItem('searchEngine', searchEngineSelect.value);
});

performaceMode.addEventListener('click', () => {
    if (localStorage.getItem('performaceMode') === 'true') {
        localStorage.setItem('performaceMode', 'false');
        window.top.location.reload();
    } else {
        localStorage.setItem('particlesEnabled', false);
        localStorage.setItem('wallpaper', '/assets/imgs/wallpapers/wallpaper.jpg');
        localStorage.setItem('performaceMode', 'true');
        window.top.location.reload();
    }
});

adsDisable.addEventListener('click', () => {
    if (localStorage.getItem('a') === 'true') {
        localStorage.setItem('a', 'false');
        alert('Ads have been disabled. I guess you don`t want to support Bolt. Meanie.');
        window.top.location.reload();
    } else if (localStorage.getItem('a') === 'false') {
        localStorage.setItem('a', 'true');
        alert('Ads have been re-enabled. Thanks for supporting Bolt! 💖');
        window.top.location.reload();
    }
    else {
        localStorage.setItem('a', 'false');
        alert('Ads have been disabled. I guess you don`t want to support Bolt. Meanie.');
        window.top.location.reload();
    }
});
