import Hls from "hls.js";

// ─── Types ────────────────────────────────────────────────────────────────────

interface AudioTrack {
  language: string;
  label: string;
}

interface Source {
  id: string;
  url: string;
  type: string;
  quality: string;
  audioTracks?: AudioTrack[];
  provider?: { id: string; name: string };
}

interface Subtitle {
  url: string;
  label: string;
  format: string;
}

interface StreamResponse {
  responseId: string;
  expiresAt: string;
  sources: Source[];
  subtitles: Subtitle[];
  diagnostics?: unknown[];
}

// ─── URL fix ──────────────────────────────────────────────────────────────────

function fixUrl(url: string): string {
  if (!url) return url;
  /* 
    try {
      const parsed = new URL(url);
      const isLocalhost =
        parsed.hostname === "localhost" ||
        parsed.hostname === "127.0.0.1" ||
        parsed.hostname === "::1";
  
      if (isLocalhost) {
        // Always strip the origin for any localhost URL — use only path+query
        url = parsed.pathname + parsed.search + parsed.hash;
      }
    } catch {
      // Already a relative path, nothing to strip
    }
  
    if (url.startsWith("/strapi/")) return url;         // already correct
    if (url.startsWith("/v1/")) return `/strapi${url}`; // needs /strapi prefix */
  return url;
}

// ─── Source probe ─────────────────────────────────────────────────────────────

interface ProbeResult {
  source: Source;
  latencyMs: number;
  ok: boolean;
}

async function probeSource(source: Source): Promise<ProbeResult> {
  const url = fixUrl(source.url);
  const start = performance.now();
  try {
    const res = await fetch(url, { method: "HEAD", signal: AbortSignal.timeout(5000) });
    const latencyMs = performance.now() - start;
    return { source, latencyMs, ok: res.ok };
  } catch {
    return { source, latencyMs: Infinity, ok: false };
  }
}

async function pickBestSource(sources: Source[]): Promise<Source> {
  if (sources.length === 0) throw new Error("No sources available");
  if (sources.length === 1) return sources[0];

  // Prefer higher quality when probing concurrently
  const qualityScore = (q: string) => {
    const n = parseInt(q);
    return isNaN(n) ? 0 : n;
  };

  const results = await Promise.all(sources.map(probeSource));
  const working = results.filter((r) => r.ok);

  if (working.length === 0) {
    // Fallback: fastest HEAD even if not 2xx
    results.sort((a, b) => a.latencyMs - b.latencyMs);
    return results[0].source;
  }

  // Score: latency (ms, lower better) penalised against quality (higher better)
  working.sort((a, b) => {
    const scoreA = a.latencyMs - qualityScore(a.source.quality) * 10;
    const scoreB = b.latencyMs - qualityScore(b.source.quality) * 10;
    return scoreA - scoreB;
  });

  return working[0].source;
}

// ─── Player HTML ──────────────────────────────────────────────────────────────

function buildPlayer(container: HTMLElement, response: StreamResponse) {
  const { sources, subtitles } = response;

  container.innerHTML = `
    <div id="strm-player">
      <div id="strm-video-wrap">
        <video id="strm-video" playsinline></video>

        <div id="strm-overlay" class="strm-overlay">
          <div class="strm-center-btns">
            <button id="strm-skip-back" title="Back 5s">
              <svg viewBox="0 0 24 24"><path d="M12 5V2L7 7l5 5V9c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/><text x="12" y="16" text-anchor="middle" font-size="6" fill="currentColor">5</text></svg>
            </button>
            <button id="strm-play-pause" title="Play / Pause">
              <svg id="strm-play-icon" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
              <svg id="strm-pause-icon" viewBox="0 0 24 24" style="display:none"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
            </button>
            <button id="strm-skip-fwd" title="Forward 5s">
              <svg viewBox="0 0 24 24"><path d="M12 5V2l5 5-5 5V9c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6h2c0 4.42-3.58 8-8 8s-8-3.58-8-8 3.58-8 8-8z"/><text x="12" y="16" text-anchor="middle" font-size="6" fill="currentColor">5</text></svg>
            </button>
          </div>
        </div>

        <div id="strm-controls">
          <div id="strm-progress-wrap">
            <div id="strm-buffered"></div>
            <div id="strm-played"></div>
            <input id="strm-seek" type="range" min="0" max="1000" value="0" step="1" />
          </div>

          <div id="strm-bottom-row">
            <div class="strm-left">
              <button id="strm-ctrl-play" title="Play/Pause">
                <svg id="strm-ctrl-play-icon" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                <svg id="strm-ctrl-pause-icon" viewBox="0 0 24 24" style="display:none"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
              </button>
              <div id="strm-vol-wrap">
                <button id="strm-mute" title="Mute">
                  <svg id="strm-vol-icon" viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/></svg>
                  <svg id="strm-mute-icon" viewBox="0 0 24 24" style="display:none"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/></svg>
                </button>
                <input id="strm-vol" type="range" min="0" max="100" value="100" step="1" title="Volume" />
              </div>
              <span id="strm-time">0:00 / 0:00</span>
            </div>

            <div class="strm-right">
              ${subtitles.length > 0 ? `
              <select id="strm-sub-select" title="Subtitles">
                <option value="">Subtitles: Off</option>
                ${subtitles.map((s, i) => `<option value="${i}">${s.label}</option>`).join("")}
              </select>` : ""}

              ${sources.length > 1 ? `
              <select id="strm-src-select" title="Source">
                ${sources.map((s, i) => `<option value="${i}">${s.provider?.name ?? "Source " + (i + 1)} — ${s.quality}</option>`).join("")}
              </select>` : ""}

              <button id="strm-fullscreen" title="Fullscreen">
                <svg viewBox="0 0 24 24"><path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/></svg>
              </button>
            </div>
          </div>
        </div>

        <div id="strm-status"></div>
      </div>
    </div>
  `;

  injectStyles();
  wirePlayer(container, sources, subtitles);
}

// ─── Wire up player logic ─────────────────────────────────────────────────────

let hlsInstance: Hls | null = null;

function loadSource(video: HTMLVideoElement, source: Source, onReady?: () => void) {
  const url = fixUrl(source.url);

  if (hlsInstance) {
    hlsInstance.destroy();
    hlsInstance = null;
  }

  if (source.type === "hls" || url.includes(".m3u8")) {
    if (Hls.isSupported()) {
      const hls = new Hls({ enableWorker: true, lowLatencyMode: false });
      hlsInstance = hls;
      hls.loadSource(url);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => onReady?.());
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = url;
      video.addEventListener("loadedmetadata", () => onReady?.(), { once: true });
    }
  } else {
    video.src = url;
    video.addEventListener("loadedmetadata", () => onReady?.(), { once: true });
  }
}

function formatTime(s: number): string {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60).toString().padStart(2, "0");
  return `${m}:${sec}`;
}

function wirePlayer(container: HTMLElement, sources: Source[], subtitles: Subtitle[]) {
  const video = container.querySelector<HTMLVideoElement>("#strm-video")!;
  const playPause = container.querySelector<HTMLButtonElement>("#strm-play-pause")!;
  const ctrlPlay = container.querySelector<HTMLButtonElement>("#strm-ctrl-play")!;
  const skipBack = container.querySelector<HTMLButtonElement>("#strm-skip-back")!;
  const skipFwd = container.querySelector<HTMLButtonElement>("#strm-skip-fwd")!;
  const seek = container.querySelector<HTMLInputElement>("#strm-seek")!;
  const buffered = container.querySelector<HTMLDivElement>("#strm-buffered")!;
  const played = container.querySelector<HTMLDivElement>("#strm-played")!;
  const timeEl = container.querySelector<HTMLSpanElement>("#strm-time")!;
  const muteBtn = container.querySelector<HTMLButtonElement>("#strm-mute")!;
  const volSlider = container.querySelector<HTMLInputElement>("#strm-vol")!;
  const fsBtn = container.querySelector<HTMLButtonElement>("#strm-fullscreen")!;
  const statusEl = container.querySelector<HTMLDivElement>("#strm-status")!;
  const srcSelect = container.querySelector<HTMLSelectElement>("#strm-src-select");
  const subSelect = container.querySelector<HTMLSelectElement>("#strm-sub-select");
  const overlay = container.querySelector<HTMLDivElement>("#strm-overlay")!;
  const playerWrap = container.querySelector<HTMLDivElement>("#strm-player")!;

  let activeSubTrack: HTMLTrackElement | null = null;
  let hideTimer: ReturnType<typeof setTimeout>;

  function setStatus(msg: string) {
    statusEl.textContent = msg;
    statusEl.style.opacity = "1";
    setTimeout(() => (statusEl.style.opacity = "0"), 3000);
  }

  function updatePlayIcons(paused: boolean) {
    [container.querySelector<SVGElement>("#strm-play-icon"), container.querySelector<SVGElement>("#strm-ctrl-play-icon")].forEach(el => el && (el.style.display = paused ? "" : "none"));
    [container.querySelector<SVGElement>("#strm-pause-icon"), container.querySelector<SVGElement>("#strm-ctrl-pause-icon")].forEach(el => el && (el.style.display = paused ? "none" : ""));
  }

  function togglePlay() {
    if (video.paused) video.play();
    else video.pause();
  }

  playPause.addEventListener("click", togglePlay);
  ctrlPlay.addEventListener("click", togglePlay);
  skipBack.addEventListener("click", () => { video.currentTime = Math.max(0, video.currentTime - 5); });
  skipFwd.addEventListener("click", () => { video.currentTime = Math.min(video.duration || 0, video.currentTime + 5); });

  video.addEventListener("play", () => updatePlayIcons(false));
  video.addEventListener("pause", () => updatePlayIcons(true));

  video.addEventListener("timeupdate", () => {
    if (!video.duration) return;
    const pct = video.currentTime / video.duration;
    seek.value = String(Math.round(pct * 1000));
    played.style.width = `${pct * 100}%`;
    timeEl.textContent = `${formatTime(video.currentTime)} / ${formatTime(video.duration)}`;
  });

  video.addEventListener("progress", () => {
    if (!video.duration || !video.buffered.length) return;
    const pct = video.buffered.end(video.buffered.length - 1) / video.duration;
    buffered.style.width = `${pct * 100}%`;
  });

  seek.addEventListener("input", () => {
    if (!video.duration) return;
    video.currentTime = (Number(seek.value) / 1000) * video.duration;
  });

  muteBtn.addEventListener("click", () => {
    video.muted = !video.muted;
    container.querySelector<SVGElement>("#strm-vol-icon")!.style.display = video.muted ? "none" : "";
    container.querySelector<SVGElement>("#strm-mute-icon")!.style.display = video.muted ? "" : "none";
  });

  volSlider.addEventListener("input", () => {
    video.volume = Number(volSlider.value) / 100;
    video.muted = video.volume === 0;
  });

  fsBtn.addEventListener("click", () => {
    if (!document.fullscreenElement) playerWrap.requestFullscreen();
    else document.exitFullscreen();
  });

  // Show/hide controls on mouse move
  playerWrap.addEventListener("mousemove", () => {
    overlay.style.opacity = "1";
    container.querySelector<HTMLDivElement>("#strm-controls")!.style.opacity = "1";
    clearTimeout(hideTimer);
    hideTimer = setTimeout(() => {
      if (!video.paused) {
        overlay.style.opacity = "0";
        container.querySelector<HTMLDivElement>("#strm-controls")!.style.opacity = "0";
      }
    }, 2500);
  });

  // Subtitle handling
  function applySubtitle(index: number | null) {
    if (activeSubTrack) {
      video.removeChild(activeSubTrack);
      activeSubTrack = null;
    }
    if (index === null) return;
    const sub = subtitles[index];
    if (!sub) return;
    const track = document.createElement("track");
    track.kind = "subtitles";
    track.label = sub.label;
    track.src = fixUrl(sub.url);
    track.default = true;
    video.appendChild(track);
    activeSubTrack = track;
    // Force enable
    if (video.textTracks.length > 0) {
      for (let i = 0; i < video.textTracks.length; i++) {
        video.textTracks[i].mode = "showing";
      }
    }
  }

  subSelect?.addEventListener("change", () => {
    const val = subSelect.value;
    applySubtitle(val === "" ? null : Number(val));
  });

  // Source switching
  function switchSource(index: number) {
    const src = sources[index];
    if (!src) return;
    const currentTime = video.currentTime;
    const wasPlaying = !video.paused;
    setStatus(`Switching to ${src.provider?.name ?? "source"} (${src.quality})…`);
    loadSource(video, src, () => {
      video.currentTime = currentTime;
      if (wasPlaying) video.play();
    });
  }

  srcSelect?.addEventListener("change", () => {
    switchSource(Number(srcSelect.value));
  });

  // Keyboard shortcuts
  document.addEventListener("keydown", (e) => {
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLSelectElement) return;
    if (e.code === "Space") { e.preventDefault(); togglePlay(); }
    if (e.code === "ArrowLeft") { e.preventDefault(); video.currentTime = Math.max(0, video.currentTime - 5); }
    if (e.code === "ArrowRight") { e.preventDefault(); video.currentTime = Math.min(video.duration || 0, video.currentTime + 5); }
    if (e.code === "KeyF") { fsBtn.click(); }
    if (e.code === "KeyM") { muteBtn.click(); }
  });
}

// ─── Styles ───────────────────────────────────────────────────────────────────

function injectStyles() {
  if (document.getElementById("strm-styles")) return;
  const style = document.createElement("style");
  style.id = "strm-styles";
  style.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&display=swap');

    #strm-player {
      --clr-bg: #0a0a0f;
      --clr-accent: #e8ff47;
      --clr-track: rgba(255,255,255,0.15);
      --clr-text: #e8e8e8;
      --radius: 4px;
      position: relative;
      background: var(--clr-bg);
      border-radius: 8px;
      overflow: hidden;
      font-family: 'DM Mono', monospace;
      user-select: none;
      max-width: 960px;
      margin: 2rem auto;
      box-shadow: 0 0 0 1px rgba(232,255,71,0.1), 0 24px 60px rgba(0,0,0,0.7);
    }

    #strm-video-wrap {
      position: relative;
      aspect-ratio: 16/9;
      background: #000;
    }

    #strm-video {
      width: 100%;
      height: 100%;
      display: block;
    }

    .strm-overlay {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: opacity 0.3s;
      pointer-events: none;
    }

    .strm-center-btns {
      display: flex;
      gap: 1.5rem;
      align-items: center;
      pointer-events: all;
    }

    .strm-center-btns button {
      background: rgba(0,0,0,0.5);
      border: 1px solid rgba(255,255,255,0.15);
      border-radius: 50%;
      color: #fff;
      width: 44px;
      height: 44px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.15s, transform 0.1s;
      padding: 0;
    }

    .strm-center-btns button:hover { background: rgba(232,255,71,0.2); transform: scale(1.08); }

    #strm-play-pause { width: 56px !important; height: 56px !important; }

    .strm-center-btns svg { width: 22px; height: 22px; fill: currentColor; }

    #strm-controls {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      background: linear-gradient(transparent, rgba(0,0,0,0.85));
      padding: 1rem 1rem 0.75rem;
      transition: opacity 0.3s;
    }

    #strm-progress-wrap {
      position: relative;
      height: 4px;
      background: var(--clr-track);
      border-radius: 2px;
      margin-bottom: 0.6rem;
      cursor: pointer;
    }

    #strm-progress-wrap:hover { height: 6px; margin-bottom: calc(0.6rem - 2px); }

    #strm-buffered, #strm-played {
      position: absolute;
      top: 0; left: 0; height: 100%;
      border-radius: 2px;
      pointer-events: none;
    }

    #strm-buffered { background: rgba(255,255,255,0.25); }
    #strm-played { background: var(--clr-accent); z-index: 1; }

    #strm-seek {
      position: absolute;
      inset: -6px 0;
      width: 100%;
      opacity: 0;
      cursor: pointer;
      z-index: 2;
    }

    #strm-bottom-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.5rem;
    }

    .strm-left, .strm-right {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    #strm-controls button {
      background: none;
      border: none;
      color: var(--clr-text);
      cursor: pointer;
      padding: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: color 0.15s;
      border-radius: var(--radius);
    }

    #strm-controls button:hover { color: var(--clr-accent); }
    #strm-controls button svg { width: 18px; height: 18px; fill: currentColor; }

    #strm-vol-wrap {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    #strm-vol {
      width: 64px;
      accent-color: var(--clr-accent);
      cursor: pointer;
    }

    #strm-time {
      font-size: 0.7rem;
      color: rgba(255,255,255,0.7);
      white-space: nowrap;
    }

    #strm-controls select {
      background: rgba(255,255,255,0.08);
      border: 1px solid rgba(255,255,255,0.15);
      color: var(--clr-text);
      font-family: 'DM Mono', monospace;
      font-size: 0.65rem;
      padding: 3px 6px;
      border-radius: var(--radius);
      cursor: pointer;
      outline: none;
      transition: border-color 0.15s;
    }

    #strm-controls select:hover,
    #strm-controls select:focus { border-color: var(--clr-accent); }

    #strm-status {
      position: absolute;
      top: 0.75rem;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(0,0,0,0.75);
      color: var(--clr-accent);
      font-family: 'DM Mono', monospace;
      font-size: 0.7rem;
      padding: 4px 12px;
      border-radius: 20px;
      border: 1px solid rgba(232,255,71,0.3);
      opacity: 0;
      transition: opacity 0.4s;
      pointer-events: none;
      white-space: nowrap;
    }

    /* Subtitle cues */
    #strm-video::cue {
      background: rgba(0,0,0,0.75);
      color: #fff;
      font-family: 'DM Mono', monospace;
      font-size: 1em;
    }
  `;
  document.head.appendChild(style);
}

// ─── Entry ────────────────────────────────────────────────────────────────────

const tmbdForm = document.getElementById("tmbd-form") as HTMLFormElement;
const typeSelect = document.getElementById("type") as HTMLSelectElement;
let typev: "movie" | "tv" = "movie";

typeSelect.addEventListener("change", () => {
  typev = typeSelect.value as "movie" | "tv";
});

tmbdForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const tmbdId = (document.getElementById("tmbd-id") as HTMLInputElement).value.trim();
  if (!tmbdId) return;

  const submitBtn = tmbdForm.querySelector("button[type='submit']") as HTMLButtonElement;
  submitBtn.disabled = true;
  submitBtn.textContent = "Loading…";

  try {
    await submit(tmbdId, typev);
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Enter";
  }
});

async function submit(tmbdId: string, type: "movie" | "tv") {
  const url =
    type === "movie"
      ? `/strapi/api/movie?id=${tmbdId}`
      : `/strapi/api/tv?id=${tmbdId}&season=1&episode=1`;

  let data: StreamResponse;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    data = await res.json();
  } catch (err) {
    console.error("Fetch error:", err);
    alert("Failed to load stream data. Check the console.");
    return;
  }

  if (!data.sources?.length) {
    alert("No sources returned by the API.");
    return;
  }

  // Find or create player container
  let container = document.getElementById("strm-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "strm-container";
    tmbdForm.insertAdjacentElement("afterend", container);
  }

  // Build player UI first (shows controls while probing)
  buildPlayer(container, data);

  const video = container.querySelector<HTMLVideoElement>("#strm-video")!;
  const statusEl = container.querySelector<HTMLDivElement>("#strm-status")!;
  const srcSelect = container.querySelector<HTMLSelectElement>("#strm-src-select");

  statusEl.textContent = "Probing sources…";
  statusEl.style.opacity = "1";

  const best = await pickBestSource(data.sources);

  // Sync the source selector to the best source
  if (srcSelect) {
    const idx = data.sources.findIndex((s) => s.id === best.id);
    if (idx !== -1) srcSelect.value = String(idx);
  }

  statusEl.style.opacity = "0";

  loadSource(video, best, () => {
    console.log(`[strm] Playing via ${best.provider?.name ?? best.id} (${best.quality})`);
  });
}