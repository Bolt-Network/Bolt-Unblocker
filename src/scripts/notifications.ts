/**
 * Bolt Notification System
 * ========================
 * Usage:
 *   notify({
 *     title: "Update Available",
 *     desc: "Bolt needs an update!",
 *     img: "/img/bolt.ico",          // optional
 *     lifespan: 6,                   // seconds (default: 5)
 *     important: true,               // highlights with accent color
 *     sound: true,                   // plays a soft chime (default: true)
 *     buttons: [
 *       { label: "Open Settings", onClick: () => { ... } },
 *       { label: "Update Now",    onClick: () => { ... }, primary: true },
 *     ]
 *   });
 */

export interface NotificationButton {
    label: string;
    onClick: () => void;
    primary?: boolean;
}

export interface NotificationOptions {
    title: string;
    desc: string;
    img?: string;
    lifespan?: number;      // seconds, default 5
    important?: boolean;    // accent highlight
    sound?: boolean;        // default true
    buttons?: NotificationButton[];
}

declare global {
    interface Window {
        notify: (opts: NotificationOptions) => void;
    }
}

// ── Container ──────────────────────────────────────────────────────────────

function getContainer(): HTMLElement {
    let el = document.getElementById('bolt-notif-container');
    if (!el) {
        el = document.createElement('div');
        el.id = 'bolt-notif-container';
        document.body.appendChild(el);
    }
    return el;
}

// ── Sound ──────────────────────────────────────────────────────────────────

function playChime(important: boolean) {
    try {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();

        const freqs = important ? [880, 1100] : [660, 880];
        let time = ctx.currentTime;

        freqs.forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, time + i * 0.12);

            gain.gain.setValueAtTime(0, time + i * 0.12);
            gain.gain.linearRampToValueAtTime(important ? 0.18 : 0.12, time + i * 0.12 + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.0001, time + i * 0.12 + 0.35);

            osc.start(time + i * 0.12);
            osc.stop(time + i * 0.12 + 0.4);
        });
    } catch (_) {
        // AudioContext unavailable — silent fail
    }
}

// ── Core notify() ──────────────────────────────────────────────────────────

export function notify(opts: NotificationOptions): void {
    const {
        title,
        desc,
        img,
        lifespan = 5,
        important = false,
        sound = true,
        buttons = [],
    } = opts;

    const container = getContainer();

    // ── Build element ──────────────────────────────────────────────────────
    const card = document.createElement('div');
    card.className = 'bnotif-card' + (important ? ' bnotif-important' : '');

    // Progress bar (shrinks over lifespan)
    const progress = document.createElement('div');
    progress.className = 'bnotif-progress';
    card.appendChild(progress);

    // Top row: icon + text + close
    const row = document.createElement('div');
    row.className = 'bnotif-row';

    if (img) {
        const icon = document.createElement('img');
        icon.className = 'bnotif-img';
        icon.src = img;
        icon.alt = '';
        row.appendChild(icon);
    }

    const textBlock = document.createElement('div');
    textBlock.className = 'bnotif-text';

    const titleEl = document.createElement('p');
    titleEl.className = 'bnotif-title';
    titleEl.textContent = title;

    const descEl = document.createElement('p');
    descEl.className = 'bnotif-desc';
    descEl.textContent = desc;

    textBlock.appendChild(titleEl);
    textBlock.appendChild(descEl);
    row.appendChild(textBlock);

    const closeBtn = document.createElement('button');
    closeBtn.className = 'bnotif-close';
    closeBtn.setAttribute('aria-label', 'Dismiss');
    closeBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>`;
    row.appendChild(closeBtn);

    card.appendChild(row);

    // Buttons row
    if (buttons.length > 0) {
        const btnRow = document.createElement('div');
        btnRow.className = 'bnotif-btn-row';

        buttons.forEach(btn => {
            const b = document.createElement('button');
            b.className = 'bnotif-btn' + (btn.primary ? ' bnotif-btn-primary' : '');
            b.textContent = btn.label;
            b.addEventListener('click', () => {
                btn.onClick();
                dismiss(card, container);
            });
            btnRow.appendChild(b);
        });

        card.appendChild(btnRow);
    }

    // ── Append & animate in ────────────────────────────────────────────────
    // Prepend so newest is on top
    container.prepend(card);

    // Force reflow then trigger enter animation
    void card.getBoundingClientRect();
    card.classList.add('bnotif-enter');

    // ── Progress bar animation ─────────────────────────────────────────────
    progress.style.transition = `width ${lifespan}s linear`;
    // Start bar after next frame so transition fires
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            progress.style.width = '0%';
        });
    });

    // ── Auto-dismiss ───────────────────────────────────────────────────────
    let autoDismiss = setTimeout(() => dismiss(card, container), lifespan * 1000);

    // Pause timer on hover
    let hoverStart = 0;
    let elapsed = 0;

    card.addEventListener('mouseenter', () => {
        clearTimeout(autoDismiss);
        hoverStart = Date.now();
        progress.style.transition = 'none';
    });

    card.addEventListener('mouseleave', () => {
        elapsed += Date.now() - hoverStart;
        const remaining = Math.max(0, lifespan * 1000 - elapsed);
        progress.style.transition = `width ${remaining / 1000}s linear`;
        progress.style.width = '0%';
        autoDismiss = setTimeout(() => dismiss(card, container), remaining);
    });

    // ── Close button ───────────────────────────────────────────────────────
    closeBtn.addEventListener('click', () => {
        clearTimeout(autoDismiss);
        dismiss(card, container);
    });

    // ── Sound ──────────────────────────────────────────────────────────────
    if (sound) {
        playChime(important);
    }
}

// ── Dismiss helper ─────────────────────────────────────────────────────────

function dismiss(card: HTMLElement, container: HTMLElement): void {
    card.classList.add('bnotif-exit');
    card.addEventListener('transitionend', () => {
        if (card.parentNode === container) {
            container.removeChild(card);
        }
    }, { once: true });
}

// ── Expose globally so non-module scripts can call notify() ───────────────
if (typeof window !== 'undefined') {
    window.notify = notify;
}
