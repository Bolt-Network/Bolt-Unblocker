// Settings Page Logic
// Handles loading, saving, and interactive behavior for all settings

interface BoltSettings {
    // Performance
    ultraPerformance: boolean;
    backgroundDetailLevel: string;

    // Personalization
    theme: string;
    customBg: string;
    tabStyle: string;
    showGreeting: boolean;
    // Cloaking
    tabCloak: boolean;
    cloakTitle: string;

    panicKey: string;
    panicUrl: string;
    autoCloak: boolean;
    // Search
    searchEngine: string;
    searchSuggestions: boolean;
    searchNewTab: boolean;
    customSearchUrl: string;
}

const STORAGE_KEY = 'bolt-settings';

const defaults: BoltSettings = {
    ultraPerformance: false,
    backgroundDetailLevel: 'eco',

    theme: '0',
    customBg: '',
    tabStyle: 'rounded',
    showGreeting: true,
    tabCloak: false,
    cloakTitle: '',
    panicKey: '',
    panicUrl: '',
    autoCloak: false,
    searchEngine: 'google',
    searchSuggestions: true,
    searchNewTab: false,
    customSearchUrl: '',
};

function loadSettings(): BoltSettings {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
            return { ...defaults, ...JSON.parse(raw) };
        }
    } catch {
        // ignore parse errors
    }
    return { ...defaults };
}

function saveSettings(settings: BoltSettings): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    showToast();
}

function showToast(): void {
    const toast = document.getElementById('save-toast');
    if (!toast) return;
    toast.classList.add('visible');
    setTimeout(() => toast.classList.remove('visible'), 2000);
}

// Element helpers
function getCheckbox(id: string): HTMLInputElement | null {
    return document.getElementById(id) as HTMLInputElement | null;
}

function getSelect(id: string): HTMLSelectElement | null {
    return document.getElementById(id) as HTMLSelectElement | null;
}

function getInput(id: string): HTMLInputElement | null {
    return document.getElementById(id) as HTMLInputElement | null;
}

function init(): void {
    const settings = loadSettings();

    // --- Bind values ---
    // Performance
    const backgroundDetailLevel = getSelect('background-detail-level');
    const ultraPerformance = getCheckbox('ultra-performance');
    // Personalization
    const themeSelect = getSelect('theme-select');
    const customBg = getInput('custom-bg');
    const tabStyle = getSelect('tab-style');
    const showGreeting = getCheckbox('show-greeting');

    // Cloaking
    const tabCloak = getCheckbox('tab-cloak');
    const cloakTitle = getInput('cloak-title');
    const panicKey = getInput('panic-key');
    const panicUrl = getInput('panic-url');
    const autoCloak = getCheckbox('auto-cloak');
    // Search
    const searchEngine = getSelect('search-engine');
    const searchSuggestions = getCheckbox('search-suggestions');
    const searchNewTab = getCheckbox('search-new-tab');
    const customSearchUrl = getInput('custom-search-url');

    // Apply loaded values
    if (backgroundDetailLevel) backgroundDetailLevel.value = settings.backgroundDetailLevel;
    if (ultraPerformance) ultraPerformance.checked = settings.ultraPerformance;
    if (themeSelect) themeSelect.value = settings.theme;
    if (customBg) customBg.value = settings.customBg;
    if (tabStyle) tabStyle.value = settings.tabStyle;
    if (showGreeting) showGreeting.checked = settings.showGreeting;

    if (tabCloak) tabCloak.checked = settings.tabCloak;
    if (cloakTitle) cloakTitle.value = settings.cloakTitle;
    if (panicKey) panicKey.value = settings.panicKey;
    if (panicUrl) panicUrl.value = settings.panicUrl;
    if (autoCloak) autoCloak.checked = settings.autoCloak;

    if (searchEngine) searchEngine.value = settings.searchEngine;
    if (searchSuggestions) searchSuggestions.checked = settings.searchSuggestions;
    if (searchNewTab) searchNewTab.checked = settings.searchNewTab;
    if (customSearchUrl) customSearchUrl.value = settings.customSearchUrl;

    // --- Toggle cloaking sub-items ---
    function updateCloakVisibility(): void {
        const isOn = tabCloak?.checked ?? false;
        document.querySelectorAll('.cloak-sub').forEach((el) => {
            el.classList.toggle('active', isOn);
        });
    }
    updateCloakVisibility();

    // --- Auto-save on change ---
    function collect(): BoltSettings {
        return {
            ultraPerformance: ultraPerformance?.checked ?? defaults.ultraPerformance,
            backgroundDetailLevel: backgroundDetailLevel?.value ?? defaults.backgroundDetailLevel,
            theme: themeSelect?.value ?? defaults.theme,
            customBg: customBg?.value ?? defaults.customBg,
            tabStyle: tabStyle?.value ?? defaults.tabStyle,
            showGreeting: showGreeting?.checked ?? defaults.showGreeting,
            tabCloak: tabCloak?.checked ?? defaults.tabCloak,
            cloakTitle: cloakTitle?.value ?? defaults.cloakTitle,
            panicKey: panicKey?.value ?? defaults.panicKey,
            panicUrl: panicUrl?.value ?? defaults.panicUrl,
            autoCloak: autoCloak?.checked ?? defaults.autoCloak,
            searchEngine: searchEngine?.value ?? defaults.searchEngine,
            searchSuggestions: searchSuggestions?.checked ?? defaults.searchSuggestions,
            searchNewTab: searchNewTab?.checked ?? defaults.searchNewTab,
            customSearchUrl: customSearchUrl?.value ?? defaults.customSearchUrl,
        };
    }

    let saveTimeout: ReturnType<typeof setTimeout> | null = null;

    function debouncedSave(): void {
        if (saveTimeout) clearTimeout(saveTimeout);
        saveTimeout = setTimeout(() => saveSettings(collect()), 400);
    }

    // Attach listeners to all controls
    const checkboxes = [showGreeting, tabCloak, searchSuggestions, searchNewTab, ultraPerformance, autoCloak];
    const selects = [backgroundDetailLevel, themeSelect, tabStyle, searchEngine];
    const inputs = [customBg, cloakTitle, panicKey, panicUrl, customSearchUrl];

    checkboxes.forEach((el) => {
        el?.addEventListener('change', () => {
            debouncedSave();
            if (el === tabCloak) updateCloakVisibility();
        });
    });

    selects.forEach((el) => {
        el?.addEventListener('change', debouncedSave);
    });

    inputs.forEach((el) => {
        el?.addEventListener('input', debouncedSave);
    });
}

// Run on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

const openBlank = document.getElementById('open-blank');
openBlank?.addEventListener('click', () => {
    const cloaked = window.open('about:blank', '_blank');
    if (cloaked) {
        cloaked.document.body.style.margin = '0';
        cloaked.document.body.style.padding = '0';
        cloaked.document.body.style.width = '100%';
        cloaked.document.body.style.height = '100%';
        cloaked.document.body.style.overflow = 'hidden';
        cloaked.document.body.innerHTML = (`

    <iframe src="/" style="width: 100%; height: 100%; border: none;"></iframe>

        `);
        if (window.top) window.top.location.href = 'https://www.clever.com/';
    }
});