/**
 * Nahu AI Chat Widget
 * Drop this script into nahuai.app's index.html before </body>
 * 
 * Usage:
 *   <script src="nahu-chat.js"></script>
 * 
 * Config (optional, set before the script tag):
 *   <script>window.NAHU_CHAT_API = "https://your-railway-url.up.railway.app";</script>
 */

(function () {
  "use strict";

  const API_BASE = window.NAHU_CHAT_API || "https://nahu-chat-agent.up.railway.app";

  // ── Styles ────────────────────────────────────────────────────────────────
  const css = `
    #nahu-chat-fab {
      position: fixed;
      bottom: 28px;
      right: 28px;
      width: 58px;
      height: 58px;
      border-radius: 50%;
      background: #1B6B45;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 18px rgba(27,107,69,0.38);
      z-index: 9999;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    #nahu-chat-fab:hover {
      transform: scale(1.07);
      box-shadow: 0 6px 24px rgba(27,107,69,0.48);
    }
    #nahu-chat-fab svg { width: 26px; height: 26px; fill: #fff; }

    #nahu-chat-bubble {
      position: fixed;
      bottom: 100px;
      right: 28px;
      background: #1B6B45;
      color: #fff;
      font-family: system-ui, sans-serif;
      font-size: 13px;
      padding: 8px 14px;
      border-radius: 20px 20px 4px 20px;
      box-shadow: 0 3px 12px rgba(27,107,69,0.3);
      z-index: 9998;
      white-space: nowrap;
      animation: nahu-fadein 0.4s ease;
      cursor: pointer;
    }
    #nahu-chat-bubble::after {
      content: '';
      position: absolute;
      bottom: -6px;
      right: 16px;
      border: 6px solid transparent;
      border-top-color: #1B6B45;
      border-bottom: none;
    }

    #nahu-chat-window {
      position: fixed;
      bottom: 100px;
      right: 28px;
      width: 360px;
      max-width: calc(100vw - 40px);
      height: 500px;
      max-height: calc(100vh - 140px);
      background: #fff;
      border-radius: 18px;
      box-shadow: 0 8px 40px rgba(0,0,0,0.16);
      display: flex;
      flex-direction: column;
      overflow: hidden;
      z-index: 9998;
      font-family: system-ui, -apple-system, sans-serif;
      animation: nahu-slidein 0.25s ease;
    }

    @keyframes nahu-fadein { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
    @keyframes nahu-slidein { from { opacity: 0; transform: translateY(16px) scale(0.97); } to { opacity: 1; transform: none; } }

    #nahu-chat-header {
      background: #1B6B45;
      padding: 14px 16px;
      display: flex;
      align-items: center;
      gap: 10px;
      flex-shrink: 0;
    }
    #nahu-chat-header-avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: rgba(255,255,255,0.2);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      flex-shrink: 0;
    }
    #nahu-chat-header-info { flex: 1; }
    #nahu-chat-header-name {
      color: #fff;
      font-size: 14px;
      font-weight: 600;
      margin: 0;
      line-height: 1.3;
    }
    #nahu-chat-header-status {
      color: rgba(255,255,255,0.75);
      font-size: 11px;
      margin: 0;
    }
    #nahu-chat-close {
      background: none;
      border: none;
      color: rgba(255,255,255,0.8);
      cursor: pointer;
      padding: 4px;
      display: flex;
      align-items: center;
      border-radius: 6px;
      transition: background 0.15s;
    }
    #nahu-chat-close:hover { background: rgba(255,255,255,0.15); color: #fff; }
    #nahu-chat-close svg { width: 18px; height: 18px; }

    #nahu-chat-messages {
      flex: 1;
      overflow-y: auto;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      background: #F7F9F8;
    }
    #nahu-chat-messages::-webkit-scrollbar { width: 4px; }
    #nahu-chat-messages::-webkit-scrollbar-track { background: transparent; }
    #nahu-chat-messages::-webkit-scrollbar-thumb { background: #ccc; border-radius: 4px; }

    .nahu-msg {
      max-width: 82%;
      padding: 9px 13px;
      border-radius: 14px;
      font-size: 13.5px;
      line-height: 1.5;
      word-break: break-word;
    }
    .nahu-msg-bot {
      background: #fff;
      color: #1a1a1a;
      align-self: flex-start;
      border-radius: 4px 14px 14px 14px;
      box-shadow: 0 1px 4px rgba(0,0,0,0.08);
    }
    .nahu-msg-user {
      background: #1B6B45;
      color: #fff;
      align-self: flex-end;
      border-radius: 14px 14px 4px 14px;
    }
    .nahu-msg-time {
      font-size: 10px;
      color: #999;
      margin-top: 2px;
      align-self: flex-start;
    }
    .nahu-msg-time.nahu-right { align-self: flex-end; }

    .nahu-typing {
      display: flex;
      gap: 4px;
      padding: 10px 14px;
      background: #fff;
      border-radius: 4px 14px 14px 14px;
      align-self: flex-start;
      box-shadow: 0 1px 4px rgba(0,0,0,0.08);
    }
    .nahu-typing span {
      width: 7px; height: 7px;
      background: #1B6B45;
      border-radius: 50%;
      animation: nahu-bounce 1.2s ease-in-out infinite;
    }
    .nahu-typing span:nth-child(2) { animation-delay: 0.2s; }
    .nahu-typing span:nth-child(3) { animation-delay: 0.4s; }
    @keyframes nahu-bounce { 0%,80%,100% { transform: scale(0.6); opacity:0.4; } 40% { transform: scale(1); opacity:1; } }

    #nahu-chat-lead-form {
      padding: 14px 16px;
      background: #fff;
      border-top: 1px solid #eee;
      flex-shrink: 0;
    }
    #nahu-chat-lead-form p {
      font-size: 12px;
      color: #555;
      margin: 0 0 8px;
    }
    #nahu-chat-lead-form input {
      width: 100%;
      padding: 8px 11px;
      border: 1.5px solid #ddd;
      border-radius: 8px;
      font-size: 13px;
      outline: none;
      box-sizing: border-box;
      transition: border-color 0.15s;
      margin-bottom: 6px;
    }
    #nahu-chat-lead-form input:focus { border-color: #1B6B45; }
    #nahu-chat-lead-submit {
      width: 100%;
      background: #1B6B45;
      color: #fff;
      border: none;
      padding: 9px;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.15s;
    }
    #nahu-chat-lead-submit:hover { background: #145235; }

    #nahu-chat-input-area {
      display: flex;
      align-items: flex-end;
      gap: 8px;
      padding: 12px 14px;
      background: #fff;
      border-top: 1px solid #eee;
      flex-shrink: 0;
    }
    #nahu-chat-input {
      flex: 1;
      border: 1.5px solid #e0e0e0;
      border-radius: 20px;
      padding: 9px 14px;
      font-size: 13.5px;
      outline: none;
      resize: none;
      max-height: 100px;
      overflow-y: auto;
      line-height: 1.4;
      font-family: inherit;
      transition: border-color 0.15s;
    }
    #nahu-chat-input:focus { border-color: #1B6B45; }
    #nahu-chat-send {
      width: 38px;
      height: 38px;
      border-radius: 50%;
      background: #1B6B45;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      transition: background 0.15s, transform 0.1s;
    }
    #nahu-chat-send:hover { background: #145235; }
    #nahu-chat-send:active { transform: scale(0.93); }
    #nahu-chat-send svg { width: 18px; height: 18px; fill: #fff; }
    #nahu-chat-send:disabled { background: #b0c9bc; cursor: default; }

    #nahu-chat-footer {
      padding: 6px 14px 8px;
      background: #fff;
      text-align: center;
      font-size: 10.5px;
      color: #aaa;
      flex-shrink: 0;
    }
    #nahu-chat-footer a { color: #1B6B45; text-decoration: none; }
  `;

  // ── State ─────────────────────────────────────────────────────────────────
  let isOpen = false;
  let messages = [];
  let leadCaptured = false;
  let showingLeadForm = false;
  let msgCount = 0;

  // ── DOM Helpers ───────────────────────────────────────────────────────────
  function injectStyles() {
    const style = document.createElement("style");
    style.textContent = css;
    document.head.appendChild(style);
  }

  function now() {
    return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  function escapeHtml(text) {
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\n/g, "<br>");
  }

  function scrollToBottom() {
    const msgs = document.getElementById("nahu-chat-messages");
    if (msgs) msgs.scrollTop = msgs.scrollHeight;
  }

  function addMessage(role, text) {
    const msgs = document.getElementById("nahu-chat-messages");
    if (!msgs) return;

    const div = document.createElement("div");
    div.className = `nahu-msg nahu-msg-${role === "user" ? "user" : "bot"}`;
    div.innerHTML = escapeHtml(text);
    msgs.appendChild(div);

    const time = document.createElement("div");
    time.className = `nahu-msg-time ${role === "user" ? "nahu-right" : ""}`;
    time.textContent = now();
    msgs.appendChild(time);

    scrollToBottom();
  }

  function showTyping() {
    const msgs = document.getElementById("nahu-chat-messages");
    if (!msgs) return;
    const el = document.createElement("div");
    el.className = "nahu-typing";
    el.id = "nahu-typing-indicator";
    el.innerHTML = "<span></span><span></span><span></span>";
    msgs.appendChild(el);
    scrollToBottom();
  }

  function hideTyping() {
    const el = document.getElementById("nahu-typing-indicator");
    if (el) el.remove();
  }

  // ── Lead Form ─────────────────────────────────────────────────────────────
  function showLeadForm() {
    if (showingLeadForm || leadCaptured) return;
    showingLeadForm = true;
    const form = document.getElementById("nahu-chat-lead-form");
    if (form) form.style.display = "block";
  }

  function hideLeadForm() {
    const form = document.getElementById("nahu-chat-lead-form");
    if (form) form.style.display = "none";
  }

  async function submitLead(email, name) {
    const summary = messages
      .slice(-6)
      .map((m) => `${m.role}: ${m.content}`)
      .join(" | ");
    try {
      await fetch(`${API_BASE}/lead`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name, summary }),
      });
    } catch (_) {
      // silently fail — lead capture is best-effort
    }
  }

  // ── API Call ──────────────────────────────────────────────────────────────
  async function sendToAPI(userText) {
    messages.push({ role: "user", content: userText });
    msgCount++;

    const sendBtn = document.getElementById("nahu-chat-send");
    const input = document.getElementById("nahu-chat-input");
    if (sendBtn) sendBtn.disabled = true;
    if (input) input.disabled = true;

    showTyping();

    try {
      const resp = await fetch(`${API_BASE}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages }),
      });

      const data = await resp.json();
      hideTyping();

      const reply = data.reply || "Sorry, I couldn't get a response. Try again!";
      messages.push({ role: "assistant", content: reply });
      addMessage("bot", reply);

      // Show lead form after 3 exchanges
      if (msgCount >= 3 && !leadCaptured) {
        setTimeout(showLeadForm, 800);
      }
    } catch (_) {
      hideTyping();
      addMessage("bot", "Connection issue. Please try again or email us at tesfa@nahuai.app");
    }

    if (sendBtn) sendBtn.disabled = false;
    if (input) { input.disabled = false; input.focus(); }
  }

  // ── Widget HTML ───────────────────────────────────────────────────────────
  function buildWidget() {
    // Bubble teaser
    const bubble = document.createElement("div");
    bubble.id = "nahu-chat-bubble";
    bubble.textContent = "👋 Chat with Nahu AI";
    bubble.addEventListener("click", openChat);
    document.body.appendChild(bubble);

    // Hide bubble after 6s
    setTimeout(() => {
      if (!isOpen && bubble.parentNode) {
        bubble.style.transition = "opacity 0.4s";
        bubble.style.opacity = "0";
        setTimeout(() => bubble.remove(), 400);
      }
    }, 6000);

    // FAB button
    const fab = document.createElement("button");
    fab.id = "nahu-chat-fab";
    fab.setAttribute("aria-label", "Open Nahu AI chat");
    fab.innerHTML = `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 10H6V10h12v2zm0-3H6V7h12v2z"/>
    </svg>`;
    fab.addEventListener("click", toggleChat);
    document.body.appendChild(fab);

    // Chat window
    const win = document.createElement("div");
    win.id = "nahu-chat-window";
    win.style.display = "none";
    win.innerHTML = `
      <div id="nahu-chat-header">
        <div id="nahu-chat-header-avatar">🤖</div>
        <div id="nahu-chat-header-info">
          <p id="nahu-chat-header-name">Nahu AI Assistant</p>
          <p id="nahu-chat-header-status">● Online — replies instantly</p>
        </div>
        <button id="nahu-chat-close" aria-label="Close chat">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
      <div id="nahu-chat-messages"></div>
      <div id="nahu-chat-lead-form" style="display:none;">
        <p>Leave your email and our team will follow up with you:</p>
        <input type="text" id="nahu-lead-name" placeholder="Your name" autocomplete="name" />
        <input type="email" id="nahu-lead-email" placeholder="Your email address" autocomplete="email" />
        <button id="nahu-chat-lead-submit">Send — we'll be in touch ✓</button>
      </div>
      <div id="nahu-chat-input-area">
        <textarea
          id="nahu-chat-input"
          placeholder="Ask about Nahu AI products…"
          rows="1"
          aria-label="Type your message"
        ></textarea>
        <button id="nahu-chat-send" aria-label="Send message">
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
          </svg>
        </button>
      </div>
      <div id="nahu-chat-footer">Powered by <a href="https://nahuai.app" target="_blank">Nahu AI</a></div>
    `;
    document.body.appendChild(win);

    // Event listeners
    document.getElementById("nahu-chat-close").addEventListener("click", closeChat);

    const input = document.getElementById("nahu-chat-input");
    const sendBtn = document.getElementById("nahu-chat-send");

    function handleSend() {
      const text = input.value.trim();
      if (!text) return;
      input.value = "";
      input.style.height = "auto";
      addMessage("user", text);
      sendToAPI(text);
    }

    sendBtn.addEventListener("click", handleSend);
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    });
    input.addEventListener("input", () => {
      input.style.height = "auto";
      input.style.height = Math.min(input.scrollHeight, 100) + "px";
    });

    // Lead form submit
    document.getElementById("nahu-chat-lead-submit").addEventListener("click", async () => {
      const email = document.getElementById("nahu-lead-email").value.trim();
      const name = document.getElementById("nahu-lead-name").value.trim() || "Website visitor";
      if (!email || !email.includes("@")) {
        document.getElementById("nahu-lead-email").focus();
        return;
      }
      leadCaptured = true;
      hideLeadForm();
      await submitLead(email, name);
      addMessage("bot", `Thank you${name !== "Website visitor" ? ", " + name : ""}! We've got your email and will be in touch within 1–2 business days. 🙏`);
    });
  }

  // ── Open / Close ──────────────────────────────────────────────────────────
  function openChat() {
    const bubble = document.getElementById("nahu-chat-bubble");
    if (bubble) bubble.remove();

    const win = document.getElementById("nahu-chat-window");
    win.style.display = "flex";
    isOpen = true;

    // Change FAB to X
    const fab = document.getElementById("nahu-chat-fab");
    fab.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>`;

    // Send welcome message on first open
    if (messages.length === 0) {
      setTimeout(() => {
        addMessage(
          "bot",
          "ሰላም! Hello! I'm Nahu, the AI assistant for Nahu AI.\n\nI can tell you about our Amharic AI chatbots, the Buna Gebaya coffee marketplace, and how we can build custom AI solutions for your organization.\n\nHow can I help you today?"
        );
      }, 400);
    }

    setTimeout(() => document.getElementById("nahu-chat-input")?.focus(), 300);
  }

  function closeChat() {
    const win = document.getElementById("nahu-chat-window");
    win.style.display = "none";
    isOpen = false;

    const fab = document.getElementById("nahu-chat-fab");
    fab.innerHTML = `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="#fff">
      <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 10H6V10h12v2zm0-3H6V7h12v2z"/>
    </svg>`;
  }

  function toggleChat() {
    isOpen ? closeChat() : openChat();
  }

  // ── Init ──────────────────────────────────────────────────────────────────
  function init() {
    injectStyles();
    buildWidget();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
