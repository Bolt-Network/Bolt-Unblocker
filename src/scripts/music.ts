// ═══════════════════════════════════════════════════════════════
//  Bolt Music  –  music.ts
//  Local music player (Tidal integration placeholder ready)
// ═══════════════════════════════════════════════════════════════

// ── Types ────────────────────────────────────────────────────────
interface Track {
    id: string;
    title: string;
    artist: string;
    album?: string;
    duration: number;       // seconds
    src: string;            // blob URL or remote URL
    artSrc?: string;        // optional album art URL
    provider: 'local' | 'tidal';
    favorited?: boolean;
    data?: Blob;            // Storage data for local tracks
}

type RepeatMode = 'none' | 'all' | 'one';
type ViewMode = 'library' | 'queue' | 'favorites';

// ── State ────────────────────────────────────────────────────────
let tracks: Track[] = [];
let filteredTracks: Track[] = [];
let queue: Track[] = [];
let currentIndex: number = -1;
let isPlaying: boolean = false;
let isShuffle: boolean = false;
let repeatMode: RepeatMode = 'none';
let isMuted: boolean = false;
let volume: number = 0.8;
let currentView: ViewMode = 'library';
let searchQuery: string = '';
let favorites: Set<string> = new Set();
let isDraggingSeek = false;
let isDraggingVolume = false;

// IndexedDB Persistence
const DB_NAME = 'BoltMusicDB';
const DB_VERSION = 1;
const STORE_NAME = 'tracks';

async function openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        request.onupgradeneeded = () => {
            const db = request.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: 'id' });
            }
        };
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

async function saveTrackToDB(track: Track): Promise<void> {
    if (track.provider !== 'local' || !track.data) return;
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    // Remove src (blob URL) before saving as it's temporary
    const toSave = { ...track, src: '' };
    store.put(toSave);
    return new Promise((resolve, reject) => {
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
    });
}

async function loadTracksFromDB(): Promise<Track[]> {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const request = store.getAll();
    return new Promise((resolve, reject) => {
        request.onsuccess = () => {
            const loaded = request.result as Track[];
            loaded.forEach(t => {
                if (t.data) {
                    t.src = URL.createObjectURL(t.data);
                }
            });
            resolve(loaded);
        };
        request.onerror = () => reject(request.error);
    });
}

// Load saved settings from localStorage
function loadPersistedSettings(): void {
    try {
        const fav = localStorage.getItem('music_favorites');
        if (fav) favorites = new Set(JSON.parse(fav));
        const vol = localStorage.getItem('music_volume');
        if (vol) volume = parseFloat(vol);
        const shuf = localStorage.getItem('music_shuffle');
        if (shuf) isShuffle = shuf === 'true';
        const rep = localStorage.getItem('music_repeat');
        if (rep) repeatMode = rep as RepeatMode;
    } catch { }
}

function savePersisted(): void {
    try {
        localStorage.setItem('music_favorites', JSON.stringify([...favorites]));
        localStorage.setItem('music_volume', String(volume));
        localStorage.setItem('music_shuffle', String(isShuffle));
        localStorage.setItem('music_repeat', repeatMode);
    } catch { }
}

// ── DOM refs ─────────────────────────────────────────────────────
const audio = document.getElementById('music-audio') as HTMLAudioElement;

const tracklistEl = document.getElementById('music-tracklist')!;
const noResultsEl = document.getElementById('music-no-results')!;
const searchInput = document.getElementById('music-search') as HTMLInputElement;
const searchClear = document.getElementById('music-search-clear')!;
const navItems = document.querySelectorAll<HTMLButtonElement>('.music-nav-item');

const nowTitle = document.getElementById('now-title')!;
const nowArtist = document.getElementById('now-artist')!;
const nowArtImg = document.getElementById('now-art-img') as HTMLImageElement;
const nowArtPlaceholder = document.getElementById('now-art-placeholder')!;
const nowArtRing = document.getElementById('now-art-ring')!;
const nowArtEl = document.getElementById('now-art')!;
const providerBadge = document.getElementById('now-provider-badge')!;

const seekTrack = document.getElementById('seek-track')!;
const seekFill = document.getElementById('seek-fill')!;
const seekThumb = document.getElementById('seek-thumb')!;
const seekCurrent = document.getElementById('seek-current')!;
const seekDuration = document.getElementById('seek-duration')!;

const btnPlay = document.getElementById('btn-play')!;
const iconPlay = document.getElementById('icon-play')!;
const iconPause = document.getElementById('icon-pause')!;
const btnPrev = document.getElementById('btn-prev')!;
const btnNext = document.getElementById('btn-next')!;
const btnShuffle = document.getElementById('btn-shuffle')!;
const btnRepeat = document.getElementById('btn-repeat')!;
const btnMute = document.getElementById('btn-mute')!;
const iconVol = document.getElementById('icon-vol')!;
const iconMuteEl = document.getElementById('icon-mute')!;
const volTrack = document.getElementById('vol-track')!;
const volFill = document.getElementById('vol-fill')!;
const volThumb = document.getElementById('vol-thumb')!;
const volLabel = document.getElementById('vol-label')!;
const btnFav = document.getElementById('btn-fav')!;
const iconFavEmpty = document.getElementById('icon-fav-empty')!;
const iconFavFilled = document.getElementById('icon-fav-filled')!;

const queueList = document.getElementById('queue-list')!;
const queueCount = document.getElementById('queue-count')!;
const queueEmpty = document.getElementById('queue-empty')!;

// ── Helpers ──────────────────────────────────────────────────────
function formatTime(s: number): string {
    if (!isFinite(s) || s < 0) return '0:00';
    const m = Math.floor(s / 60);
    const ss = Math.floor(s % 60).toString().padStart(2, '0');
    return `${m}:${ss}`;
}

function generateId(): string {
    return Math.random().toString(36).slice(2, 10);
}

function cls(el: Element | null, add: string[], remove: string[] = []): void {
    if (!el) return;
    el.classList.add(...add);
    if (remove.length) el.classList.remove(...remove);
}

function toggleHidden(el: Element | null, hidden: boolean): void {
    if (!el) return;
    if (hidden) { el.classList.add('hidden'); }
    else { el.classList.remove('hidden'); }
}

// ── Track management ─────────────────────────────────────────────
function addTracks(newTracks: Track[]): void {
    newTracks.forEach(t => {
        t.favorited = favorites.has(t.id);
    });
    tracks.push(...newTracks);
    applyFilter();
    rebuildQueue();
}

function applyFilter(): void {
    const q = searchQuery.toLowerCase().trim();

    let source: Track[];
    if (currentView === 'favorites') {
        source = tracks.filter(t => favorites.has(t.id));
    } else {
        source = [...tracks];
    }

    if (q) {
        filteredTracks = source.filter(
            t => t.title.toLowerCase().includes(q) || t.artist.toLowerCase().includes(q)
        );
    } else {
        filteredTracks = source;
    }

    renderTracklist();
}

function rebuildQueue(): void {
    // Queue = all tracks except the one currently playing
    if (currentIndex < 0) {
        queue = [...filteredTracks];
    } else {
        const playing = tracks[currentIndex];
        queue = filteredTracks.filter(t => t.id !== playing?.id);
    }
    renderQueue();
}

// ── Rendering ────────────────────────────────────────────────────
function renderTracklist(): void {
    tracklistEl.innerHTML = '';

    if (filteredTracks.length === 0) {
        toggleHidden(noResultsEl, false);
        return;
    }
    toggleHidden(noResultsEl, true);

    filteredTracks.forEach((track, idx) => {
        const item = document.createElement('div');
        item.className = 'music-track-item' + (isFavorite(track.id) ? ' favorited' : '');
        if (currentIndex >= 0 && tracks[currentIndex]?.id === track.id) {
            item.classList.add('active');
        }
        item.dataset.trackId = track.id;

        item.innerHTML = `
            <span class="track-num">${idx + 1}</span>
            <div class="track-playing-icon" aria-hidden="true">
                <span class="bar"></span>
                <span class="bar"></span>
                <span class="bar"></span>
            </div>
            <div class="track-art-mini">
                ${track.artSrc
                ? `<img src="${track.artSrc}" alt="" loading="lazy"/>`
                : `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"> <path d="M9 18V6.35537C9 5.87383 9 5.63306 9.0876 5.43778C9.16482 5.26565 9.28917 5.11887 9.44627 5.0144C9.62449 4.89588 9.86198 4.8563 10.337 4.77714L19.137 3.31047C19.7779 3.20364 20.0984 3.15023 20.3482 3.243C20.5674 3.32441 20.7511 3.48005 20.8674 3.68286C21 3.91398 21 4.23889 21 4.8887V16M9 18C9 19.6568 7.65685 21 6 21C4.34315 21 3 19.6568 3 18C3 16.3431 4.34315 15 6 15C7.65685 15 9 16.3431 9 18ZM21 16C21 17.6568 19.6569 19 18 19C16.3431 19 15 17.6568 15 16C15 14.3431 16.3431 13 18 13C19.6569 13 21 14.3431 21 16Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/> </svg>`
            }
            </div>
            <div class="track-meta">
                <span class="track-name">${escHtml(track.title)}</span>
                <span class="track-artist">${escHtml(track.artist)}</span>
            </div>
            <span class="track-duration">${formatTime(track.duration)}</span>
            <span class="track-fav-dot" title="Favorited"></span>
        `;

        item.addEventListener('click', () => {
            const globalIdx = tracks.findIndex(t => t.id === track.id);
            playTrack(globalIdx);
        });

        tracklistEl.appendChild(item);
    });
}

function renderQueue(): void {
    queueList.innerHTML = '';

    if (queue.length === 0) {
        toggleHidden(queueEmpty, false);
        queueCount.textContent = '0 tracks';
        return;
    }
    toggleHidden(queueEmpty, true);
    queueCount.textContent = `${queue.length} track${queue.length !== 1 ? 's' : ''}`;

    queue.slice(0, 30).forEach(track => {
        const card = document.createElement('div');
        card.className = 'queue-card';
        card.innerHTML = `
            <div class="queue-card-art">
                ${track.artSrc
                ? `<img src="${track.artSrc}" alt="" loading="lazy"/>`
                : `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
 <path d="M9 18V6.35537C9 5.87383 9 5.63306 9.0876 5.43778C9.16482 5.26565 9.28917 5.11887 9.44627 5.0144C9.62449 4.89588 9.86198 4.8563 10.337 4.77714L19.137 3.31047C19.7779 3.20364 20.0984 3.15023 20.3482 3.243C20.5674 3.32441 20.7511 3.48005 20.8674 3.68286C21 3.91398 21 4.23889 21 4.8887V16M9 18C9 19.6568 7.65685 21 6 21C4.34315 21 3 19.6568 3 18C3 16.3431 4.34315 15 6 15C7.65685 15 9 16.3431 9 18ZM21 16C21 17.6568 19.6569 19 18 19C16.3431 19 15 17.6568 15 16C15 14.3431 16.3431 13 18 13C19.6569 13 21 14.3431 21 16Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
 </svg>`
            }
            </div>
            <span class="queue-card-name">${escHtml(track.title)}</span>
        `;
        card.addEventListener('click', () => {
            const idx = tracks.findIndex(t => t.id === track.id);
            playTrack(idx);
        });
        queueList.appendChild(card);
    });
}

function updateNowPlaying(): void {
    const track = currentIndex >= 0 ? tracks[currentIndex] : null;

    if (track) {
        nowTitle.textContent = track.title;
        nowArtist.textContent = track.artist;
        providerBadge.innerHTML = `
           <svg width="10" height="10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
 <path d="M9 18V6.35537C9 5.87383 9 5.63306 9.0876 5.43778C9.16482 5.26565 9.28917 5.11887 9.44627 5.0144C9.62449 4.89588 9.86198 4.8563 10.337 4.77714L19.137 3.31047C19.7779 3.20364 20.0984 3.15023 20.3482 3.243C20.5674 3.32441 20.7511 3.48005 20.8674 3.68286C21 3.91398 21 4.23889 21 4.8887V16M9 18C9 19.6568 7.65685 21 6 21C4.34315 21 3 19.6568 3 18C3 16.3431 4.34315 15 6 15C7.65685 15 9 16.3431 9 18ZM21 16C21 17.6568 19.6569 19 18 19C16.3431 19 15 17.6568 15 16C15 14.3431 16.3431 13 18 13C19.6569 13 21 14.3431 21 16Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
 </svg>
            ${track.provider === 'tidal' ? 'Tidal' : 'Local'}
        `;

        if (track.artSrc) {
            nowArtImg.src = track.artSrc;
            toggleHidden(nowArtImg, false);
            toggleHidden(nowArtPlaceholder, true);
        } else {
            toggleHidden(nowArtImg, true);
            toggleHidden(nowArtPlaceholder, false);
        }

        // Favorite state
        updateFavUI(track.id);
    } else {
        nowTitle.textContent = 'Nothing Playing';
        nowArtist.textContent = 'Select a track to begin';
        toggleHidden(nowArtImg, true);
        toggleHidden(nowArtPlaceholder, false);
        updateFavUI('');
    }

    // Refresh tracklist active state
    document.querySelectorAll<HTMLElement>('.music-track-item').forEach(el => {
        const id = el.dataset.trackId;
        if (track && id === track.id) {
            el.classList.add('active');
        } else {
            el.classList.remove('active');
        }
    });
}

function updatePlayUI(): void {
    if (isPlaying) {
        toggleHidden(iconPlay, true);
        toggleHidden(iconPause, false);
        cls(nowArtEl, ['playing']);
        cls(nowArtRing, ['spinning']);
    } else {
        toggleHidden(iconPlay, false);
        toggleHidden(iconPause, true);
        nowArtEl.classList.remove('playing');
        nowArtRing.classList.remove('spinning');
    }
}

function updateSeekUI(): void {
    const t = audio.currentTime;
    const d = audio.duration || 0;
    const pct = d > 0 ? (t / d) * 100 : 0;
    seekFill.style.width = pct + '%';
    seekThumb.style.left = pct + '%';
    seekCurrent.textContent = formatTime(t);
    seekDuration.textContent = formatTime(d);
}

function updateVolumeUI(): void {
    const pct = (isMuted ? 0 : volume) * 100;
    volFill.style.width = pct + '%';
    volThumb.style.left = pct + '%';
    volLabel.textContent = Math.round(pct) + '%';
    toggleHidden(iconVol, isMuted);
    toggleHidden(iconMuteEl, !isMuted);
}

function updateShuffleUI(): void {
    if (isShuffle) { btnShuffle.classList.add('active'); }
    else { btnShuffle.classList.remove('active'); }
}

function updateRepeatUI(): void {
    if (repeatMode !== 'none') { btnRepeat.classList.add('active'); }
    else { btnRepeat.classList.remove('active'); }
    btnRepeat.title = repeatMode === 'one' ? 'Repeat one' : repeatMode === 'all' ? 'Repeat all' : 'Repeat';
}

// ── Favorites ─────────────────────────────────────────────────────
function isFavorite(id: string): boolean { return favorites.has(id); }

function toggleFavorite(id: string): void {
    if (!id) return;
    if (favorites.has(id)) { favorites.delete(id); }
    else { favorites.add(id); }
    savePersisted();
    updateFavUI(id);
    // Update tracklist dot
    document.querySelectorAll<HTMLElement>('.music-track-item').forEach(el => {
        if (el.dataset.trackId === id) {
            if (favorites.has(id)) { el.classList.add('favorited'); }
            else { el.classList.remove('favorited'); }
        }
    });
    if (currentView === 'favorites') applyFilter();
}

function updateFavUI(id: string): void {
    if (isFavorite(id)) {
        btnFav.classList.add('favorited');
        toggleHidden(iconFavEmpty, true);
        toggleHidden(iconFavFilled, false);
    } else {
        btnFav.classList.remove('favorited');
        toggleHidden(iconFavEmpty, false);
        toggleHidden(iconFavFilled, true);
    }
}

// ── Playback ─────────────────────────────────────────────────────
async function playTrack(index: number): Promise<void> {
    if (index < 0 || index >= tracks.length) return;

    currentIndex = index;
    const track = tracks[currentIndex];

    audio.src = track.src;
    audio.volume = isMuted ? 0 : volume;
    audio.load();

    try {
        await audio.play();
        isPlaying = true;
    } catch (e) {
        console.warn('Playback error:', e);
        isPlaying = false;
    }

    updateNowPlaying();
    updatePlayUI();
    updateSeekUI();
    rebuildQueue();
}

function playOrPause(): void {
    if (currentIndex < 0) {
        if (tracks.length > 0) playTrack(0);
        return;
    }
    if (isPlaying) {
        audio.pause();
        isPlaying = false;
    } else {
        audio.play().catch(() => { });
        isPlaying = true;
    }
    updatePlayUI();
}

function playNext(): void {
    if (tracks.length === 0) return;

    if (repeatMode === 'one') {
        audio.currentTime = 0;
        audio.play().catch(() => { });
        return;
    }

    if (isShuffle) {
        let next: number;
        do { next = Math.floor(Math.random() * tracks.length); }
        while (next === currentIndex && tracks.length > 1);
        playTrack(next);
    } else {
        let next = currentIndex + 1;
        if (next >= tracks.length) {
            if (repeatMode === 'all') { next = 0; }
            else { isPlaying = false; updatePlayUI(); return; }
        }
        playTrack(next);
    }
}

function playPrev(): void {
    if (tracks.length === 0) return;

    // If more than 3s in, restart current
    if (audio.currentTime > 3) {
        audio.currentTime = 0;
        return;
    }

    let prev = currentIndex - 1;
    if (prev < 0) prev = repeatMode === 'all' ? tracks.length - 1 : 0;
    playTrack(prev);
}

// ── Seek interactions ─────────────────────────────────────────────
function seekToPercent(pct: number): void {
    const d = audio.duration;
    if (!isFinite(d) || d <= 0) return;
    audio.currentTime = Math.max(0, Math.min(d, (pct / 100) * d));
    updateSeekUI();
}

function getSeekPct(e: MouseEvent | Touch): number {
    const rect = seekTrack.getBoundingClientRect();
    const x = (e as MouseEvent).clientX ?? (e as Touch).clientX;
    return Math.max(0, Math.min(100, ((x - rect.left) / rect.width) * 100));
}

seekTrack.addEventListener('mousedown', (e) => {
    isDraggingSeek = true;
    seekToPercent(getSeekPct(e));
});

document.addEventListener('mousemove', (e) => {
    if (isDraggingSeek) seekToPercent(getSeekPct(e));
    if (isDraggingVolume) setVolumeFromMouse(e);
});

document.addEventListener('mouseup', () => {
    isDraggingSeek = false;
    isDraggingVolume = false;
});

// Touch support for seek
seekTrack.addEventListener('touchstart', (e) => {
    isDraggingSeek = true;
    seekToPercent(getSeekPct(e.touches[0] as unknown as MouseEvent));
}, { passive: true });
document.addEventListener('touchmove', (e) => {
    if (isDraggingSeek) seekToPercent(getSeekPct(e.touches[0] as unknown as MouseEvent));
}, { passive: true });
document.addEventListener('touchend', () => { isDraggingSeek = false; });

// ── Volume interactions ───────────────────────────────────────────
function setVolumeFromMouse(e: MouseEvent): void {
    const rect = volTrack.getBoundingClientRect();
    const pct = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    volume = pct / 100;
    audio.volume = isMuted ? 0 : volume;
    updateVolumeUI();
    savePersisted();
}

volTrack.addEventListener('mousedown', (e) => {
    isDraggingVolume = true;
    setVolumeFromMouse(e);
});

// ── Audio events ──────────────────────────────────────────────────
audio.addEventListener('timeupdate', () => {
    if (!isDraggingSeek) updateSeekUI();
});

audio.addEventListener('loadedmetadata', () => {
    updateSeekUI();
    const track = tracks[currentIndex];
    if (track && !isFinite(track.duration)) {
        track.duration = audio.duration;
        renderTracklist();
    }
});

audio.addEventListener('ended', () => {
    playNext();
});

audio.addEventListener('error', (e) => {
    console.error('Audio error', e);
    isPlaying = false;
    updatePlayUI();
});

// ── Button handlers ───────────────────────────────────────────────
btnPlay.addEventListener('click', playOrPause);
btnNext.addEventListener('click', playNext);
btnPrev.addEventListener('click', playPrev);

btnShuffle.addEventListener('click', () => {
    isShuffle = !isShuffle;
    updateShuffleUI();
    savePersisted();
});

btnRepeat.addEventListener('click', () => {
    const modes: RepeatMode[] = ['none', 'all', 'one'];
    const idx = modes.indexOf(repeatMode);
    repeatMode = modes[(idx + 1) % modes.length];
    updateRepeatUI();
    savePersisted();
});

btnMute.addEventListener('click', () => {
    isMuted = !isMuted;
    audio.volume = isMuted ? 0 : volume;
    updateVolumeUI();
});

btnFav.addEventListener('click', () => {
    if (currentIndex >= 0) {
        toggleFavorite(tracks[currentIndex].id);
    }
});

// ── Search ────────────────────────────────────────────────────────
searchInput.addEventListener('input', () => {
    searchQuery = searchInput.value;
    const hasTxt = searchQuery.trim().length > 0;
    if (hasTxt) { searchClear.classList.add('visible'); }
    else { searchClear.classList.remove('visible'); }
    applyFilter();
});

searchClear.addEventListener('click', () => {
    searchInput.value = '';
    searchQuery = '';
    searchClear.classList.remove('visible');
    searchInput.focus();
    applyFilter();
});

// ── Navigation ────────────────────────────────────────────────────
navItems.forEach(btn => {
    btn.addEventListener('click', () => {
        navItems.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentView = btn.dataset.view as ViewMode;
        applyFilter();
    });
});

// ── File import (drag & drop + file picker) ──────────────────────
async function importFiles(files: FileList | File[]): Promise<void> {
    const newTracks: Track[] = [];
    const fileList = Array.from(files);

    for (const file of fileList) {
        if (!file.type.startsWith('audio/')) continue;

        const src = URL.createObjectURL(file);

        // Parse title/artist from filename:  "Artist - Title.mp3"
        const base = file.name.replace(/\.[^.]+$/, '');
        let title = base;
        let artist = 'Unknown Artist';

        const sep = base.indexOf(' - ');
        if (sep !== -1) {
            artist = base.slice(0, sep).trim();
            title = base.slice(sep + 3).trim();
        }

        const id = generateId();

        const track: Track = {
            id,
            title,
            artist,
            duration: 0,
            src,
            provider: 'local',
            data: file // Store the actual file blob
        };

        // Probe duration via a temp Audio element
        await new Promise<void>((resolve) => {
            const probe = new Audio(src);
            probe.addEventListener('loadedmetadata', () => {
                track.duration = probe.duration;
                resolve();
            }, { once: true });
            probe.addEventListener('error', () => resolve(), { once: true });
            // Timeout if it takes too long
            setTimeout(resolve, 2000);
        });

        newTracks.push(track);
        // Save each track to DB immediately
        await saveTrackToDB(track).catch(err => console.error('Failed to save to DB:', err));
    }

    if (newTracks.length > 0) {
        addTracks(newTracks);
        // Remove the hint if it exists
        document.getElementById('music-drop-hint')?.remove();
    }
}

// Drop zone: whole page
document.addEventListener('dragover', (e) => { e.preventDefault(); });
document.addEventListener('drop', (e) => {
    e.preventDefault();
    if (e.dataTransfer?.files.length) importFiles(e.dataTransfer.files);
});

// ── Keyboard shortcuts ────────────────────────────────────────────
document.addEventListener('keydown', (e) => {
    const tag = (e.target as HTMLElement).tagName.toLowerCase();
    if (tag === 'input' || tag === 'textarea') return;

    switch (e.key) {
        case ' ':
        case 'k':
            e.preventDefault();
            playOrPause();
            break;
        case 'ArrowRight':
            e.preventDefault();
            audio.currentTime = Math.min(audio.duration || 0, audio.currentTime + 10);
            break;
        case 'ArrowLeft':
            e.preventDefault();
            audio.currentTime = Math.max(0, audio.currentTime - 10);
            break;
        case 'n':
        case 'N':
            playNext();
            break;
        case 'p':
        case 'P':
            playPrev();
            break;
        case 'm':
        case 'M':
            isMuted = !isMuted;
            audio.volume = isMuted ? 0 : volume;
            updateVolumeUI();
            break;
        case 's':
        case 'S':
            isShuffle = !isShuffle;
            updateShuffleUI();
            savePersisted();
            break;
        case 'f':
        case 'F':
            if (currentIndex >= 0) toggleFavorite(tracks[currentIndex].id);
            break;
    }
});

// ── Tidal integration stub ────────────────────────────────────────
// You can extend this in the future:
//   addTidalTrack({ title, artist, src, artSrc, duration, provider: 'tidal' })
export function addTidalTrack(track: Omit<Track, 'id'>): void {
    addTracks([{ ...track, id: generateId() }]);
}

// ── HTML escape ───────────────────────────────────────────────────
function escHtml(str: string): string {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

// ── Init ─────────────────────────────────────────────────────────
async function init(): Promise<void> {
    loadPersistedSettings();

    // Load tracks from IndexedDB
    try {
        const localTracks = await loadTracksFromDB();
        if (localTracks.length > 0) {
            addTracks(localTracks);
        }
    } catch (e) {
        console.error('Failed to load tracks from DB:', e);
    }

    audio.volume = volume;
    updateVolumeUI();
    updateShuffleUI();
    updateRepeatUI();
    updateNowPlaying();
    updatePlayUI();
    renderTracklist();
    renderQueue();

    // Global upload button
    const uploadBtn = document.getElementById('music-upload-sidebar');
    const globalInput = document.getElementById('music-file-input-global') as HTMLInputElement;
    uploadBtn?.addEventListener('click', () => globalInput?.click());
    globalInput?.addEventListener('change', () => {
        if (globalInput.files?.length) {
            importFiles(globalInput.files);
            globalInput.value = ''; // Reset for next time
        }
    });

    // Show an empty-state hint in the tracklist
    if (tracks.length === 0) {
        const hint = document.createElement('div');
        hint.id = 'music-drop-hint';
        hint.innerHTML = `
            <div style="
                display:flex;flex-direction:column;align-items:center;justify-content:center;
                gap:0.7rem;padding:2rem 1rem;color:rgba(255,255,255,0.2);
                font-family:medium,sans-serif;font-size:0.83rem;text-align:center;
            ">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                    <path d="M12 15V3M12 15L8 11M12 15L16 11" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M2 17L2 19C2 20.1 2.9 21 4 21L20 21C21.1 21 22 20.1 22 19V17" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
                </svg>
                <span>Drop audio files here<br/>or click below to browse</span>
                <label id="music-file-label" style="
                    display:inline-flex;align-items:center;gap:0.4rem;
                    background:rgba(73,212,255,0.1);
                    outline:1px solid rgba(73,212,255,0.25);
                    border-radius:10px;padding:0.45rem 1rem;
                    cursor:pointer;color:rgba(171,217,255,0.85);
                    transition:all 0.2s ease;font-size:0.82rem;
                ">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                        <path d="M12 15V3M12 3L8 7M12 3L16 7" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                        <path d="M2 17L2 19C2 20.1 2.9 21 4 21L20 21C21.1 21 22 20.1 22 19V17" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                    </svg>
                    Browse files
                    <input id="music-file-input" type="file" accept="audio/*" multiple style="display:none"/>
                </label>
            </div>
        `;
        tracklistEl.appendChild(hint);

        // Wire file input after insertion
        const fi = document.getElementById('music-file-input') as HTMLInputElement;
        fi?.addEventListener('change', () => {
            if (fi.files?.length) {
                importFiles(fi.files);
                hint.remove();
            }
        });
    }
}

init();
