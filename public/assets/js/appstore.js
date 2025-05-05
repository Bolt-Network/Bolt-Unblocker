var closeButton = document.getElementById('close-button');
var installButton = document.getElementById('install-button');
var nameInput = document.getElementById('name-input');
var urlInput = document.getElementById('url-input');
var imageInput = document.getElementById('image-input');
const installButtonContainer = document.getElementById('install-button-container');

const appNameCard = document.querySelector('.card:nth-of-type(1)');
const appUrlCard = document.querySelector('.card:nth-of-type(2)');
const appIconCard = document.querySelector('.card:nth-of-type(3)');

const appNameStep = document.getElementById('app-name-step');
const appUrlStep = document.getElementById('app-url-step');
const appIconStep = document.getElementById('app-icon-step');
closeButton.addEventListener('click', closeWindow);

function extractDomain(url) {
    try {
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            url = 'https://' + url;
        }

        const hostname = new URL(url).hostname;

        return hostname.replace(/^www\./, '');
    } catch (e) {
        console.error("Error extracting domain:", e);
        return url;
    }
}

function getSiteName(domain) {
    if (domain.includes('youtube')) return 'YouTube';
    if (domain.includes('google')) return 'Google';
    if (domain.includes('facebook')) return 'Facebook';
    if (domain.includes('instagram')) return 'Instagram';
    if (domain.includes('twitter')) return 'Twitter';
    if (domain.includes('tiktok')) return 'TikTok';
    if (domain.includes('netflix')) return 'Netflix';
    if (domain.includes('amazon')) return 'Amazon';
    if (domain.includes('spotify')) return 'Spotify';
    if (domain.includes('discord')) return 'Discord';
    if (domain.includes('reddit')) return 'Reddit';
    if (domain.includes('twitch')) return 'Twitch';
    if (domain.includes('github')) return 'GitHub';

    const parts = domain.split('.');
    if (parts.length >= 2) {
        return parts[parts.length - 2].charAt(0).toUpperCase() + parts[parts.length - 2].slice(1);
    }
    return domain.charAt(0).toUpperCase() + domain.slice(1);
}

function generateLogoUrl(domain) {
    const knownSites = {
        'youtube': 'https://www.gstatic.com/youtube/img/branding/favicon/favicon_144x144.png',
        'google': 'https://www.google.com/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png',
        'facebook': 'https://static.xx.fbcdn.net/rsrc.php/v3/ya/r/hsAgIHkdyIW.png',
        'twitter': 'https://abs.twimg.com/responsive-web/client-web/icon-default.77d25afe.png',
        'instagram': 'https://static.cdninstagram.com/rsrc.php/v3/yR/r/lam-fZmwmvn.png',
        'amazon': 'https://amazon.com/favicon.ico',
        'netflix': 'https://assets.nflxext.com/ffe/siteui/common/icons/nficon2016.png',
        'reddit': 'https://www.redditstatic.com/desktop2x/img/favicon/android-icon-192x192.png',
        'wikipedia': 'https://en.wikipedia.org/static/favicon/wikipedia.png',
        'github': 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png',
        'spotify': 'https://open.spotifycdn.com/cdn/images/favicon.0f31d2ea.ico',
        'discord': 'https://assets-global.website-files.com/6257adef93867e50d84d30e2/636e0a6cc3c481a15a141738_icon_clyde_white_RGB.png',
        'twitch': 'https://static.twitchcdn.net/assets/favicon-32-e29e246c157142c94346.png',
        'pinterest': 'https://s.pinimg.com/webapp/logo_trans_144x144-5634e7aedc60e5ea2347.png',
        'tiktok': 'https://sf16-scmcdn-va.ibytedtos.com/goofy/tiktok/web/node/_next/static/images/logo-black-fe952c32c1ff1d1cc5e51aed5729c007.svg'
    };

    for (const site in knownSites) {
        if (domain.includes(site)) {
            return knownSites[site];
        }
    }

    return `https://external-content.duckduckgo.com/ip3/${domain}.ico`;
}

function updateLogoPreview() {
    if (urlInput.value.trim() !== '') {
        const domain = extractDomain(urlInput.value);
        const siteName = getSiteName(domain);

        if (nameInput.value.trim() === '') {
            nameInput.value = siteName;
        }

        const logoUrl = generateLogoUrl(domain);
        imageInput.value = logoUrl;

        let imagePreview = document.getElementById('image-preview');
        if (!imagePreview) {
            imagePreview = document.createElement('div');
            imagePreview.id = 'image-preview';
            imagePreview.style.cssText = 'margin-top: 10px; text-align: center;';
            imageInput.parentNode.appendChild(imagePreview);
        }

        imagePreview.innerHTML = `
            <p style="font-size: 14px; margin-bottom: 5px; color: #ccc;">Logo Preview:</p>
            <img src="${logoUrl}" alt="Site Logo" style="max-width: 64px; max-height: 64px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.2);">
        `;
    }
}

urlInput.addEventListener('blur', updateLogoPreview);
urlInput.addEventListener('input', function () {
    clearTimeout(this.typingTimer);
    this.typingTimer = setTimeout(updateLogoPreview, 500);
});

installButton.addEventListener('click', function (event) {
    event.preventDefault();

    if (nameInput.value.trim() === '' || urlInput.value.trim() === '' || imageInput.value.trim() === '') {
        alert('Please fill in all fields');
        return;
    }

    const app = {
        name: nameInput.value,
        url: urlInput.value,
        image: imageInput.value
    };

    if (!app.url.startsWith('http://') && !app.url.startsWith('https://')) {
        app.url = 'https://' + app.url;
    }

    let savedApps = [];
    try {
        const appsData = localStorage.getItem('apps');
        if (appsData) {
            const parsed = JSON.parse(appsData);
            savedApps = Array.isArray(parsed) ? parsed : [];
        }
    } catch (error) {
        console.error('Error parsing apps data:', error);
        savedApps = [];
    }

    let isDuplicate = false;
    for (let i = 0; i < savedApps.length; i++) {
        if (savedApps[i].name === app.name || savedApps[i].url === app.url) {
            isDuplicate = true;
            break;
        }
    }

    if (isDuplicate) {
        alert('An app with this name or URL already exists');
        return;
    }

    savedApps.push(app);
    localStorage.setItem('apps', JSON.stringify(savedApps));

    const originalText = installButton.innerHTML;
    installButton.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"></path>
        </svg>
        Installed Successfully
    `;

    installButton.style.backgroundColor = '#4CAF50';

    setTimeout(() => {
        installButton.innerHTML = originalText;
        installButton.style.backgroundColor = '';

        nameInput.value = '';
        urlInput.value = '';
        imageInput.value = '';

        const imagePreview = document.getElementById('image-preview');
        if (imagePreview) {
            imagePreview.innerHTML = '';
        }
    }, 2000);

    alert('App added successfully! The app will appear in your apps screen next time you open it.');
});

if (appNameCard && appUrlCard && appIconCard && appNameStep && appUrlStep && appIconStep) {
    function setActiveStep(stepNumber) {
        [appNameStep, appUrlStep, appIconStep].forEach(step => {
            step.classList.remove('active');
        });

        if (stepNumber === 1) appNameStep.classList.add('active');
        if (stepNumber === 2) appUrlStep.classList.add('active');
        if (stepNumber === 3) appIconStep.classList.add('active');
    }

    appNameCard.addEventListener('click', () => setActiveStep(1));
    appUrlCard.addEventListener('click', () => setActiveStep(2));
    appIconCard.addEventListener('click', () => setActiveStep(3));

    setActiveStep(1);
}

document.addEventListener('DOMContentLoaded', function () {
    if (urlInput) {
        urlInput.setAttribute('placeholder', 'Enter website URL (e.g. youtube.com)');
    }

    if (urlInput && urlInput.parentNode) {
        const hintText = document.createElement('p');
        hintText.style.cssText = 'margin: 5px 0 0; font-size: 12px; color: #61bbff; text-align: center;';
        hintText.textContent = 'The name and logo will be automatically generated from the URL';
        urlInput.parentNode.appendChild(hintText);
    }
});
