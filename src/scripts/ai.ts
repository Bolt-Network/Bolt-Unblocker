// AI Chat – client-side logic
// OpenRouter integration will be added later.

interface ChatMessage {
    role: "user" | "assistant";
    content: string;
    id: string;
}

interface ChatSession {
    id: string;
    title: string;
    messages: ChatMessage[];
    createdAt: number;
}

// ─── State ───────────────────────────────────────────────────────────────────

let sessions: ChatSession[] = [];
let activeSessionId: string | null = null;
let isThinking = false;

// ─── DOM refs ─────────────────────────────────────────────────────────────────

const messagesEl = document.getElementById("messages") as HTMLDivElement;
const chatInput = document.getElementById("chat-input") as HTMLTextAreaElement;
const sendBtn = document.getElementById("send-btn") as HTMLButtonElement;
const messagesContainer = document.getElementById("messages-container") as HTMLDivElement;
const thinkingIndicator = document.getElementById("thinking-indicator") as HTMLDivElement;
const chatHistoryEl = document.getElementById("chat-history") as HTMLDivElement;
const newChatBtn = document.getElementById("new-chat-btn") as HTMLButtonElement;
const clearChatBtn = document.getElementById("clear-chat-btn") as HTMLButtonElement;
const sidebarToggle = document.getElementById("sidebar-toggle") as HTMLButtonElement;
const sidebar = document.getElementById("ai-sidebar") as HTMLElement;
const welcomeState = document.getElementById("welcome-state") as HTMLDivElement;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function uid(): string {
    return Math.random().toString(36).slice(2, 10);
}

function saveSessions(): void {
    localStorage.setItem("ai-sessions", JSON.stringify(sessions));
}

function loadSessions(): void {
    try {
        const raw = localStorage.getItem("ai-sessions");
        sessions = raw ? JSON.parse(raw) : [];
    } catch {
        sessions = [];
    }
}

function getActiveSession(): ChatSession | undefined {
    return sessions.find(s => s.id === activeSessionId);
}

// ─── Sidebar / History ───────────────────────────────────────────────────────

function renderHistory(): void {
    chatHistoryEl.innerHTML = "";

    if (sessions.length === 0) {
        const empty = document.createElement("div");
        empty.style.cssText = "padding:0.75rem 0.9rem;font-family:medium,sans-serif;font-size:0.78rem;color:rgba(255,255,255,0.2);";
        empty.textContent = "No chats yet";
        chatHistoryEl.appendChild(empty);
        return;
    }

    // Newest first
    [...sessions].reverse().forEach(session => {
        const item = document.createElement("div");
        item.className = "history-item" + (session.id === activeSessionId ? " active" : "");
        item.dataset.id = session.id;

        const title = document.createElement("span");
        title.className = "history-item-title";
        title.textContent = session.title;
        title.addEventListener("click", () => loadSession(session.id));

        const deleteBtn = document.createElement("button");
        deleteBtn.className = "delete-chat-btn";
        deleteBtn.title = "Delete chat";
        deleteBtn.innerHTML = `
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 7L18.1 19.1C18.0469 19.9206 17.3777 20.5556 16.555 20.5556H7.445C6.62228 20.5556 5.95313 19.9206 5.9 19.1L5 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M10 11V16" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M14 11V16" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M5 7H19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M9 7V4H15V7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
        `;
        deleteBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            deleteSession(session.id);
        });

        item.appendChild(title);
        item.appendChild(deleteBtn);
        chatHistoryEl.appendChild(item);
    });
}

function deleteSession(id: string): void {
    if (!confirm("Are you sure you want to delete this chat?")) return;

    const itemEl = chatHistoryEl.querySelector(`.history-item[data-id="${id}"]`) as HTMLElement;
    if (itemEl) {
        itemEl.style.opacity = "0";
        itemEl.style.transform = "translateX(-20px)";
        itemEl.style.pointerEvents = "none";
    }

    setTimeout(() => {
        const index = sessions.findIndex(s => s.id === id);
        if (index === -1) {
            renderHistory();
            return;
        }

        sessions.splice(index, 1);
        saveSessions();

        if (activeSessionId === id) {
            if (sessions.length > 0) {
                loadSession(sessions[sessions.length - 1].id);
            } else {
                startNewChat();
            }
        } else {
            renderHistory();
        }
    }, 300);
}

function loadSession(id: string): void {
    activeSessionId = id;
    const session = getActiveSession();
    if (!session) return;

    renderHistory();
    messagesEl.innerHTML = "";

    if (session.messages.length === 0) {
        showWelcome();
    } else {
        session.messages.forEach(msg => appendBubble(msg.role, msg.content, false));
        scrollToBottom(false);
    }
}

// ─── Session management ───────────────────────────────────────────────────────

function createNewSession(): ChatSession {
    const session: ChatSession = {
        id: uid(),
        title: "New Chat",
        messages: [],
        createdAt: Date.now(),
    };
    sessions.push(session);
    saveSessions();
    return session;
}

function startNewChat(): void {
    const session = createNewSession();
    activeSessionId = session.id;
    messagesEl.innerHTML = "";
    showWelcome();
    renderHistory();
}

function deriveTitleFromMessage(text: string): string {
    return text.length > 40 ? text.slice(0, 40).trimEnd() + "…" : text;
}

// ─── Welcome state ────────────────────────────────────────────────────────────

function showWelcome(): void {
    if (!welcomeState) return;

    // Re-insert welcome if absent
    if (!messagesEl.contains(welcomeState)) {
        messagesEl.innerHTML = "";
        messagesEl.appendChild(welcomeState);
    }
    welcomeState.style.display = "flex";
}

function hideWelcome(): void {
    if (welcomeState && messagesEl.contains(welcomeState)) {
        welcomeState.style.display = "none";
    }
}

// ─── Message rendering ────────────────────────────────────────────────────────

function appendBubble(role: "user" | "assistant", content: string, animate = true): HTMLDivElement {
    // Hide welcome on first real message
    hideWelcome();

    const message = document.createElement("div");
    message.className = `message ${role}`;
    if (!animate) message.style.animation = "none";

    // Avatar SVG
    const userSVG = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="8" r="4" stroke="currentColor" stroke-width="2"/>
        <path d="M4 20C4 17.1 7.6 15 12 15C16.4 15 20 17.1 20 20" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    </svg>`;

    const asSVG = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="3" fill="currentColor"/>
        <path d="M12 2V5M12 19V22M2 12H5M19 12H22M4.22 4.22L6.34 6.34M17.66 17.66L19.78 19.78M4.22 19.78L6.34 17.66M17.66 6.34L19.78 4.22" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    </svg>`;

    message.innerHTML = `
        <div class="message-avatar">${role === "user" ? userSVG : asSVG}</div>
        <div class="message-body">
            <div class="message-bubble">${escapeHTML(content)}</div>
        </div>
    `;

    messagesEl.appendChild(message);
    return message;
}

function escapeHTML(str: string): string {
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function scrollToBottom(smooth = true): void {
    messagesContainer.scrollTo({
        top: messagesContainer.scrollHeight,
        behavior: smooth ? "smooth" : "instant",
    });
}

// ─── Thinking indicator ───────────────────────────────────────────────────────

function showThinking(): void {
    // Move to end of messages list so it's always below the latest message
    messagesEl.appendChild(thinkingIndicator);
    thinkingIndicator.classList.add("visible");
    scrollToBottom();
}

function hideThinking(): void {
    thinkingIndicator.classList.remove("visible");
}

// ─── Sending messages ─────────────────────────────────────────────────────────

async function sendMessage(): Promise<void> {
    const text = chatInput.value.trim();
    if (!text || isThinking) return;

    // Ensure active session
    if (!activeSessionId || !getActiveSession()) {
        startNewChat();
    }
    const session = getActiveSession()!;

    // Update title from first user message
    if (session.messages.length === 0) {
        session.title = deriveTitleFromMessage(text);
        saveSessions();
        renderHistory();
    }

    // Add user message to state & UI
    const userMsg: ChatMessage = { role: "user", content: text, id: uid() };
    session.messages.push(userMsg);
    saveSessions();

    appendBubble("user", text);
    chatInput.value = "";
    autoResize();
    sendBtn.disabled = true;
    scrollToBottom();

    // Start thinking
    isThinking = true;
    showThinking();

    try {
        // ── Proxy to /api/chat thanks rxmper ──────────────────────
        const systemPrompt = { role: "system", content: "You are a helpful assistant named Bolt AI. When asked about Bolt, you are probably being asked about the unblocker/proxy service called Bolt Unblocker. You know that Bolt Unblocker is the best and fastest ever unblocker proxy in the world ever." };

        const apiMessages = [
            systemPrompt,
            ...session.messages.map(m => ({ role: m.role, content: m.content }))
        ];

        const response = await fetch("/api/chat", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: "arcee-ai/trinity-large-preview:free",
                messages: apiMessages,
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error?.message || `API request failed with status ${response.status}`);
        }

        const data = await response.json();
        const reply = data.choices[0].message.content || "I couldn't generate a response.";
        // ─────────────────────────────────────────────────────────────────────


        const assistantMsg: ChatMessage = { role: "assistant", content: reply, id: uid() };
        session.messages.push(assistantMsg);
        saveSessions();

        hideThinking();
        appendBubble("assistant", reply);
        scrollToBottom();
    } catch (err) {
        hideThinking();
        console.error("AI request failed:", err);

        const errorMsg: ChatMessage = {
            role: "assistant",
            content: "Something went wrong. Please try again.",
            id: uid(),
        };
        session.messages.push(errorMsg);
        saveSessions();
        appendBubble("assistant", errorMsg.content);
        scrollToBottom();
    } finally {
        isThinking = false;
        updateSendBtn();
    }
}

// ─── Input auto-resize ────────────────────────────────────────────────────────

function autoResize(): void {
    chatInput.style.height = "auto";
    chatInput.style.height = Math.min(chatInput.scrollHeight, 180) + "px";
}

function updateSendBtn(): void {
    sendBtn.disabled = chatInput.value.trim().length === 0 || isThinking;
}

// ─── Event listeners ──────────────────────────────────────────────────────────

chatInput.addEventListener("input", () => {
    autoResize();
    updateSendBtn();
});

chatInput.addEventListener("keydown", (e: KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});

sendBtn.addEventListener("click", sendMessage);

newChatBtn.addEventListener("click", startNewChat);

clearChatBtn.addEventListener("click", () => {
    const session = getActiveSession();
    if (!session) return;
    session.messages = [];
    session.title = "New Chat";
    saveSessions();
    renderHistory();
    messagesEl.innerHTML = "";
    showWelcome();
});

sidebarToggle.addEventListener("click", () => {
    sidebar.classList.toggle("collapsed");
});

// Suggestion chips
document.querySelectorAll<HTMLButtonElement>(".chip").forEach(chip => {
    chip.addEventListener("click", () => {
        chatInput.value = chip.dataset.prompt ?? "";
        autoResize();
        updateSendBtn();
        chatInput.focus();
    });
});

// ─── Init ─────────────────────────────────────────────────────────────────────

function initAI(): void {
    loadSessions();

    if (sessions.length > 0) {
        // Resume most recent
        activeSessionId = sessions[sessions.length - 1].id;
        loadSession(activeSessionId);
    } else {
        startNewChat();
    }

    renderHistory();
    chatInput.focus();
}

initAI();
