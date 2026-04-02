// ─── Built-in code snippets ─────────────────────────────────────────────────
const SNIPPETS = [
    {
        name: "Log Hello World",
        desc: "Print a greeting to the console",
        code: `console.log("Hello from Injector! 🚀");`
    },
    {
        name: "Change Page Title",
        desc: "Update the document title of the top page",
        code: `document.title = "Page Modified by Injector ⚡";`
    },
    {
        name: "Remove All Ads",
        desc: "Attempt to hide common ad elements",
        code: `const adSelectors = [
  'ins', '[id*="google_ads"]', '[class*="ad-"]',
  '[id*="ad-"]', '.adsbygoogle', 'iframe[src*="doubleclick"]'
];
adSelectors.forEach(sel => {
  document.querySelectorAll(sel).forEach(el => {
    el.style.display = 'none';
  });
});
console.log('Ad elements hidden!');`
    },
    {
        name: "Scroll to Top",
        desc: "Smoothly scroll to the top of the page",
        code: `window.scrollTo({ top: 0, behavior: 'smooth' });
console.log('Scrolled to top!');`
    },
    {
        name: "Dump localStorage",
        desc: "Log all localStorage keys and values",
        code: `const data = {};
for (let i = 0; i < localStorage.length; i++) {
  const key = localStorage.key(i);
  data[key] = localStorage.getItem(key);
}
console.log(JSON.stringify(data, null, 2));`
    },
    {
        name: "Dark Mode Toggle",
        desc: "Toggle a CSS dark mode filter on the page",
        code: `const id = '__inj_dark__';
const existing = document.getElementById(id);
if (existing) {
  existing.remove();
  console.log('Dark mode OFF');
} else {
  const style = document.createElement('style');
  style.id = id;
  style.textContent = 'html { filter: invert(0.9) hue-rotate(180deg); }';
  document.head.appendChild(style);
  console.log('Dark mode ON');
}`
    },
    {
        name: "Highlight All Links",
        desc: "Outline every <a> element in blue",
        code: `document.querySelectorAll('a').forEach(a => {
  a.style.outline = '2px solid #60a5fa';
  a.style.outlineOffset = '2px';
});
console.log('All links highlighted!');`
    },
    {
        name: "Page Info",
        desc: "Log basic page metadata",
        code: `console.log("URL:", location.href);
console.log("Title:", document.title);
console.log("Referrer:", document.referrer);
console.log("Cookies:", document.cookie || '(none)');`
    },
    {
        name: "Cookie Cleaner",
        desc: "Expire all cookies on the current domain",
        code: `document.cookie.split(';').forEach(c => {
  const key = c.split('=')[0].trim();
  document.cookie = key + '=;expires=' + new Date(0).toUTCString() + ';path=/';
});
console.log('Cookies cleared!');`
    },
    {
        name: "Disable Right-Click Lock",
        desc: "Re-enable right-click on pages that block it",
        code: `document.addEventListener('contextmenu', e => e.stopImmediatePropagation(), true);
document.addEventListener('mousedown', e => e.stopImmediatePropagation(), true);
console.log('Right-click restored!');`
    }
];

// ─── Helpers ─────────────────────────────────────────────────────────────────
function showToast(msg: string, error = false): void {
    const toast = document.getElementById("inj-toast") as HTMLElement;
    if (!toast) return;
    toast.textContent = msg;
    toast.style.background = error
        ? "rgba(248, 113, 113, 0.15)"
        : "rgba(160, 110, 255, 0.15)";
    toast.style.borderColor = error
        ? "rgba(248, 113, 113, 0.45)"
        : "rgba(160, 110, 255, 0.45)";
    toast.style.color = error ? "rgb(255, 180, 180)" : "rgb(210, 180, 255)";
    toast.classList.add("visible");
    setTimeout(() => toast.classList.remove("visible"), 2800);
}

function setStatus(state: "ready" | "running" | "success" | "error", text?: string): void {
    const badge = document.getElementById("inj-status-badge")!;
    const statusText = document.getElementById("inj-status-text")!;
    badge.className = "";
    badge.classList.add(`status-${state}`);
    statusText.textContent = text ?? { ready: "Ready", running: "Running…", success: "Success", error: "Error" }[state];
}

// ─── Output / console logging ─────────────────────────────────────────────────
const output = document.getElementById("inj-output") as HTMLElement;

function renderEmpty(): void {
    output.innerHTML = `
        <div class="inj-output-empty">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                <path d="M8 9L12 5L16 9M12 5V19" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span>Run your code to see output here</span>
        </div>`;
}

function appendLog(text: string, type: "info" | "warn" | "error" | "success" | "system" = "info"): void {
    // Remove the empty placeholder if present
    output.querySelector(".inj-output-empty")?.remove();

    const icons: Record<string, string> = {
        info: "›",
        warn: "⚠",
        error: "✕",
        success: "✓",
        system: "⚡"
    };

    const entry = document.createElement("div");
    entry.className = `inj-log-entry inj-log-${type}`;
    entry.innerHTML = `
        <span class="inj-log-icon">${icons[type]}</span>
        <span class="inj-log-text">${escapeHtml(text)}</span>`;
    output.appendChild(entry);
    output.scrollTop = output.scrollHeight;
}

function escapeHtml(str: string): string {
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}

// ─── Serialize any JS value into a readable string ────────────────────────────
function serialize(val: any): string {
    if (val === null) return "null";
    if (val === undefined) return "undefined";
    if (typeof val === "function") return val.toString().split("\n")[0] + " …}";
    if (typeof val === "object") {
        try { return JSON.stringify(val, null, 2); }
        catch { return String(val); }
    }
    return String(val);
}

// ─── Code Injection ──────────────────────────────────────────────────────────
function runCode(): void {
    const editor = document.getElementById("inj-editor") as HTMLTextAreaElement;
    const code = editor.value.trim();

    if (!code) {
        showToast("Nothing to run!");
        return;
    }

    setStatus("running");

    // Intercept console methods at the TOP-LEVEL window
    // Cast to any to bypass TS strict typing on cross-frame Window properties
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const target = (window.top ?? window) as any;

    const originalConsole = {
        log: target.console.log.bind(target.console),
        warn: target.console.warn.bind(target.console),
        error: target.console.error.bind(target.console),
        info: target.console.info.bind(target.console),
    };

    target.console.log = (...args: any[]) => {
        originalConsole.log(...args);
        appendLog(args.map(serialize).join(" "), "info");
    };
    target.console.warn = (...args: any[]) => {
        originalConsole.warn(...args);
        appendLog(args.map(serialize).join(" "), "warn");
    };
    target.console.error = (...args: any[]) => {
        originalConsole.error(...args);
        appendLog(args.map(serialize).join(" "), "error");
    };
    target.console.info = (...args: any[]) => {
        originalConsole.info(...args);
        appendLog(args.map(serialize).join(" "), "info");
    };

    const strictToggle = document.getElementById("inj-toggle-strict") as HTMLElement;
    const useStrict = strictToggle.classList.contains("active");
    const wrappedCode = useStrict ? `"use strict";\n${code}` : code;

    let result: any;
    let errored = false;

    try {
        // Execute in top-level window context using its Function constructor
        const fn = new target.Function(wrappedCode);
        result = fn();
        errored = false;
    } catch (err: any) {
        errored = true;
        appendLog(String(err?.message ?? err), "error");
    } finally {
        // Restore console
        target.console.log = originalConsole.log;
        target.console.warn = originalConsole.warn;
        target.console.error = originalConsole.error;
        target.console.info = originalConsole.info;
    }

    if (!errored) {
        if (result !== undefined) {
            appendLog("← " + serialize(result), "success");
        } else {
            appendLog("Script executed successfully.", "success");
        }
        setStatus("success");
        showToast("Injected successfully ⚡");
    } else {
        setStatus("error");
        showToast("Error during execution", true);
    }
}

// ─── Line numbers ─────────────────────────────────────────────────────────────
function updateLineNumbers(): void {
    const editor = document.getElementById("inj-editor") as HTMLTextAreaElement;
    const lineNums = document.getElementById("inj-line-numbers") as HTMLElement;
    const lines = editor.value.split("\n").length;
    lineNums.textContent = Array.from({ length: lines }, (_, i) => i + 1).join("\n");
    lineNums.scrollTop = editor.scrollTop;
}

// ─── Cursor position ──────────────────────────────────────────────────────────
function updateCursorPos(): void {
    const editor = document.getElementById("inj-editor") as HTMLTextAreaElement;
    const cursorPos = document.getElementById("inj-cursor-pos") as HTMLElement;
    const charCount = document.getElementById("inj-char-count") as HTMLElement;
    const text = editor.value;
    const before = text.substring(0, editor.selectionStart);
    const lines = before.split("\n");
    const ln = lines.length;
    const col = lines[lines.length - 1].length + 1;
    cursorPos.textContent = `Ln ${ln}, Col ${col}`;
    charCount.textContent = `${text.length} char${text.length !== 1 ? "s" : ""}`;
}

// ─── Snippets ─────────────────────────────────────────────────────────────────
function buildSnippetsList(): void {
    const list = document.getElementById("inj-snippets-list") as HTMLElement;
    list.innerHTML = "";
    SNIPPETS.forEach(snippet => {
        const item = document.createElement("div");
        item.className = "inj-snippet-item";
        item.innerHTML = `
            <p class="inj-snippet-name">${escapeHtml(snippet.name)}</p>
            <p class="inj-snippet-desc">${escapeHtml(snippet.desc)}</p>`;
        item.addEventListener("click", () => {
            const editor = document.getElementById("inj-editor") as HTMLTextAreaElement;
            editor.value = snippet.code;
            updateLineNumbers();
            updateCursorPos();
            closeSnippets();
            editor.focus();
            showToast(`Loaded: ${snippet.name}`);
        });
        list.appendChild(item);
    });
}

function openSnippets(): void {
    buildSnippetsList();
    document.getElementById("inj-snippets-overlay")?.classList.remove("hidden");
}

function closeSnippets(): void {
    document.getElementById("inj-snippets-overlay")?.classList.add("hidden");
}

// ─── Init ─────────────────────────────────────────────────────────────────────
function init(): void {
    renderEmpty();
    updateLineNumbers();
    updateCursorPos();
    setStatus("ready");

    const editor = document.getElementById("inj-editor") as HTMLTextAreaElement;

    // Editor sync
    editor.addEventListener("input", () => {
        updateLineNumbers();
        updateCursorPos();
    });
    editor.addEventListener("keyup", updateCursorPos);
    editor.addEventListener("click", updateCursorPos);
    editor.addEventListener("scroll", () => {
        const lineNums = document.getElementById("inj-line-numbers") as HTMLElement;
        lineNums.scrollTop = editor.scrollTop;
    });

    // Tab key → insert 2 spaces
    editor.addEventListener("keydown", (e: KeyboardEvent) => {
        if (e.key === "Tab") {
            e.preventDefault();
            const start = editor.selectionStart;
            const end = editor.selectionEnd;
            editor.value = editor.value.substring(0, start) + "  " + editor.value.substring(end);
            editor.selectionStart = editor.selectionEnd = start + 2;
            updateLineNumbers();
        }
        // Ctrl+Enter → Run
        if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
            e.preventDefault();
            runCode();
        }
    });

    // Toolbar buttons
    document.getElementById("inj-btn-run")?.addEventListener("click", runCode);

    document.getElementById("inj-btn-clear")?.addEventListener("click", () => {
        editor.value = "";
        updateLineNumbers();
        updateCursorPos();
        editor.focus();
        showToast("Editor cleared");
    });

    document.getElementById("inj-btn-copy")?.addEventListener("click", () => {
        if (!editor.value) { showToast("Nothing to copy!"); return; }
        navigator.clipboard.writeText(editor.value).then(() => {
            showToast("Copied to clipboard!");
        }).catch(() => {
            showToast("Copy failed", true);
        });
    });

    document.getElementById("inj-btn-snippet")?.addEventListener("click", openSnippets);
    document.getElementById("inj-snippets-close")?.addEventListener("click", closeSnippets);
    document.getElementById("inj-snippets-overlay")?.addEventListener("click", (e) => {
        if (e.target === document.getElementById("inj-snippets-overlay")) closeSnippets();
    });

    document.getElementById("inj-btn-clear-output")?.addEventListener("click", () => {
        renderEmpty();
    });

    // Strict mode toggle
    const strictToggle = document.getElementById("inj-toggle-strict") as HTMLElement;
    strictToggle.addEventListener("click", () => {
        strictToggle.classList.toggle("active");
    });
}

document.addEventListener("DOMContentLoaded", init);
