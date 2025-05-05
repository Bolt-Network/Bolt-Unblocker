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
const WEBHOOK_URL = 'https://discord.com/api/webhooks/1367964536082272416/3Ylrn86tGPIR256DbCpxRBogegi8hjIfEwSFEpwoSHY2s8Pk4-bZXAORPvpLpHgRhicB';

document.addEventListener('DOMContentLoaded', () => {
    initTooltips();
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

particlesToggle.checked = localStorage.getItem('particlesEnabled') === 'true';
particlesToggle.addEventListener('change', () => {
    localStorage.setItem('particlesEnabled', particlesToggle.checked);
    window.top.location.reload();
});
backgroundSelect.value = localStorage.getItem('background') || '0';
backgroundSelect.addEventListener('change', () => {
    localStorage.setItem('background', backgroundSelect.value);
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
        try {
            const payload = {
                username: "Premium Activation",
                content: "`" + localStorage.getItem('name') + "` sent a premium activation code. The code sent was: `" + boltPremium.value + "`",
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
});