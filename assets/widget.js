(function () {
  if (window.__salusWidget) return;
  window.__salusWidget = true;

  const BACKEND_FALLBACK = 'https://chat.salussaunastech.com';
  const STORAGE_KEY = 'salus_session_id';
  const POLL_INTERVAL_MS = 3000;
  const BOT_STATUS_POLL_INTERVAL_MS = 5000;
  const MOBILE_BREAKPOINT = 768;
  const SYSTEM_CONNECTING_MESSAGE = 'Connecting you to our sales team...';

  const WIDGET_STYLE = `
    :host {
      all: initial;
    }

    *, *::before, *::after {
      box-sizing: border-box;
    }

    [hidden] {
      display: none !important;
    }

    .salus-widget {
      position: fixed;
      right: 24px;
      bottom: 24px;
      z-index: 999999;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      color: #121826;
    }

    .salus-widget--open .salus-widget__panel {
      opacity: 1;
      pointer-events: auto;
      transform: translateY(0) scale(1);
    }

    .salus-widget__bubble {
      width: 64px;
      height: 64px;
      border: 0;
      border-radius: 999px;
      background: linear-gradient(135deg, #101828 0%, #1d2939 100%);
      color: #ffffff;
      box-shadow: 0 18px 40px rgba(16, 24, 40, 0.28);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: transform 140ms ease, box-shadow 140ms ease, opacity 140ms ease;
    }

    .salus-widget__bubble:hover,
    .salus-widget__bubble:focus-visible {
      transform: translateY(-2px);
      box-shadow: 0 24px 48px rgba(16, 24, 40, 0.34);
      outline: none;
    }

    .salus-widget__bubble svg {
      width: 28px;
      height: 28px;
      fill: currentColor;
    }

    .salus-widget__panel {
      position: fixed;
      right: 24px;
      bottom: 104px;
      width: min(380px, calc(100vw - 32px));
      height: min(680px, calc(100vh - 136px));
      background: #ffffff;
      border: 1px solid rgba(15, 23, 42, 0.08);
      border-radius: 24px;
      box-shadow: 0 30px 60px rgba(15, 23, 42, 0.18);
      display: flex;
      flex-direction: column;
      overflow: hidden;
      opacity: 0;
      pointer-events: none;
      transform: translateY(12px) scale(0.98);
      transition: opacity 160ms ease, transform 160ms ease;
    }

    .salus-widget__header {
      background: linear-gradient(135deg, #111827 0%, #0f172a 100%);
      color: #ffffff;
      padding: 16px 18px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      flex: none;
    }

    .salus-widget__header-copy {
      min-width: 0;
    }

    .salus-widget__eyebrow {
      font-size: 11px;
      line-height: 1.2;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      opacity: 0.72;
      margin: 0 0 4px;
    }

    .salus-widget__title {
      font-size: 18px;
      line-height: 1.35;
      font-weight: 700;
      margin: 0;
    }

    .salus-widget__close {
      flex: none;
      width: 36px;
      height: 36px;
      border: 0;
      border-radius: 999px;
      background: rgba(255, 255, 255, 0.12);
      color: #ffffff;
      cursor: pointer;
      font-size: 18px;
      line-height: 1;
    }

    .salus-widget__close:hover,
    .salus-widget__close:focus-visible {
      background: rgba(255, 255, 255, 0.2);
      outline: none;
    }

    .salus-widget__body {
      flex: 1;
      min-height: 0;
      display: flex;
      flex-direction: column;
      background:
        radial-gradient(circle at top right, rgba(15, 118, 110, 0.08), transparent 28%),
        linear-gradient(180deg, #f8fafc 0%, #f3f4f6 100%);
    }

    .salus-widget--identity-required .salus-widget__messages,
    .salus-widget--identity-required .salus-widget__composer {
      display: none;
    }

    .salus-widget__messages {
      flex: 1;
      min-height: 0;
      overflow-y: auto;
      padding: 14px 14px 10px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      scroll-behavior: smooth;
      min-height: 100px;
    }

    .salus-widget__disclaimer {
      font-size: 12px;
      line-height: 1.5;
      color: #667085;
      text-align: center;
      padding: 10px 12px;
      border-radius: 16px;
      background: rgba(255, 255, 255, 0.82);
      border: 1px solid rgba(15, 23, 42, 0.06);
    }

    .salus-widget__identity-screen {
      display: none;
      flex: 1;
      align-items: center;
      justify-content: center;
      padding: 20px 16px;
    }

    .salus-widget--identity-required .salus-widget__identity-screen {
      display: flex;
    }

    .salus-widget__identity-card {
      width: 100%;
      max-width: 320px;
      padding: 24px 20px;
      border-radius: 22px;
      background: rgba(255, 255, 255, 0.95);
      border: 1px solid rgba(15, 23, 42, 0.08);
      box-shadow: 0 20px 44px rgba(15, 23, 42, 0.12);
      display: flex;
      flex-direction: column;
      gap: 14px;
    }

    .salus-widget__identity-eyebrow {
      margin: 0;
      font-size: 11px;
      line-height: 1.2;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: #0f766e;
      font-weight: 700;
    }

    .salus-widget__identity-title {
      margin: 0;
      font-size: 22px;
      line-height: 1.25;
      color: #111827;
      font-weight: 700;
    }

    .salus-widget__identity-copy {
      margin: 0;
      font-size: 13px;
      line-height: 1.6;
      color: #475467;
    }

    .salus-widget__identity-form {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .salus-widget__message {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .salus-widget__message--user {
      align-items: flex-end;
    }

    .salus-widget__message--assistant {
      align-items: flex-start;
    }

    .salus-widget__message--system {
      align-items: center;
    }

    .salus-widget__sender {
      font-size: 11px;
      line-height: 1.4;
      color: #667085;
      padding: 0 4px;
    }

    .salus-widget__bubble-copy {
      max-width: 88%;
      padding: 12px 14px;
      border-radius: 18px;
      font-size: 14px;
      line-height: 1.55;
      white-space: pre-wrap;
      word-break: break-word;
    }

    .salus-widget__message--user .salus-widget__bubble-copy {
      background: linear-gradient(135deg, #0f766e 0%, #0f9b8e 100%);
      color: #ffffff;
      border-bottom-right-radius: 6px;
      box-shadow: 0 10px 24px rgba(15, 118, 110, 0.18);
    }

    .salus-widget__message--assistant .salus-widget__bubble-copy {
      background: #ffffff;
      color: #111827;
      border: 1px solid rgba(15, 23, 42, 0.08);
      border-bottom-left-radius: 6px;
    }

    .salus-widget__message--system .salus-widget__bubble-copy {
      max-width: 100%;
      padding: 0;
      background: transparent;
      border: 0;
      color: #667085;
      font-size: 12px;
      text-align: center;
      box-shadow: none;
    }

    .salus-widget__typing {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      padding: 10px 12px;
      border-radius: 18px;
      border-bottom-left-radius: 6px;
      background: #ffffff;
      border: 1px solid rgba(15, 23, 42, 0.08);
    }

    .salus-widget__typing-dot {
      width: 7px;
      height: 7px;
      border-radius: 999px;
      background: #98a2b3;
      animation: salus-widget-bounce 900ms infinite ease-in-out;
    }

    .salus-widget__typing-dot:nth-child(2) {
      animation-delay: 120ms;
    }

    .salus-widget__typing-dot:nth-child(3) {
      animation-delay: 240ms;
    }

    .salus-widget__footer {
      border-top: 1px solid rgba(15, 23, 42, 0.08);
      background: rgba(255, 255, 255, 0.96);
      padding: 12px 12px calc(12px + env(safe-area-inset-bottom));
      display: flex;
      flex-direction: column;
      gap: 10px;
      flex: none;
    }

    .salus-widget__status {
      display: none;
      font-size: 12px;
      line-height: 1.5;
      color: #475467;
      padding: 10px 12px;
      border-radius: 14px;
      background: #f8fafc;
      border: 1px solid rgba(15, 23, 42, 0.06);
    }

    .salus-widget__status.is-visible {
      display: block;
    }

    .salus-widget__field {
      width: 100%;
      border: 1px solid rgba(15, 23, 42, 0.14);
      border-radius: 14px;
      background: #ffffff;
      color: #111827;
      font: inherit;
      padding: 11px 12px;
      outline: none;
    }

    .salus-widget__field:focus {
      border-color: #0f766e;
      box-shadow: 0 0 0 4px rgba(15, 118, 110, 0.12);
    }

    .salus-widget__composer {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .salus-widget__actions {
      position: relative;
    }

    .salus-widget__textarea {
      width: 100%;
      min-height: 50px;
      max-height: 104px;
      resize: none;
      border: 1px solid rgba(15, 23, 42, 0.14);
      border-radius: 16px;
      padding: 13px 62px 13px 14px;
      background: #ffffff;
      color: #111827;
      font: inherit;
      line-height: 1.45;
      outline: none;
      overflow-y: hidden;
    }

    .salus-widget__textarea:focus {
      border-color: #0f766e;
      box-shadow: 0 0 0 4px rgba(15, 118, 110, 0.12);
    }

    .salus-widget__button {
      border: 0;
      cursor: pointer;
      border-radius: 14px;
      font: inherit;
      transition: opacity 140ms ease, transform 140ms ease, background 140ms ease;
    }

    .salus-widget__button:disabled {
      cursor: not-allowed;
      opacity: 0.56;
      transform: none;
    }

    .salus-widget__button--send,
    .salus-widget__button--submit {
      flex: none;
      min-width: 52px;
      padding: 12px 14px;
      background: #111827;
      color: #ffffff;
      font-weight: 600;
    }

    .salus-widget__button--send {
      position: absolute;
      right: 8px;
      bottom: 8px;
      width: 36px;
      height: 36px;
      min-width: 36px;
      padding: 0;
      border-radius: 999px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 8px 18px rgba(17, 24, 39, 0.18);
    }

    .salus-widget__button--send svg {
      width: 16px;
      height: 16px;
      fill: currentColor;
    }

    .salus-widget__button--send:hover:not(:disabled),
    .salus-widget__button--submit:hover:not(:disabled),
    .salus-widget__button--ghost:hover:not(:disabled) {
      transform: translateY(-1px);
    }

    .salus-widget__button--ghost {
      background: transparent;
      color: #0f766e;
      font-size: 13px;
      line-height: 1.4;
      padding: 0;
      text-align: left;
      font-weight: 600;
    }

    .salus-widget__restart {
      display: none;
      align-self: flex-start;
      background: transparent;
      border: 0;
      padding: 0;
      color: #0f766e;
      cursor: pointer;
      font: inherit;
      font-size: 13px;
      font-weight: 600;
    }

    .salus-widget__restart.is-visible {
      display: inline-flex;
    }

    .salus-widget__error-note {
      margin-top: 6px;
      font-size: 12px;
      line-height: 1.5;
      color: #b42318;
    }

    @keyframes salus-widget-bounce {
      0%, 80%, 100% {
        transform: translateY(0);
        opacity: 0.5;
      }
      40% {
        transform: translateY(-4px);
        opacity: 1;
      }
    }

    @media (max-width: 768px) {
      .salus-widget {
        right: 16px;
        bottom: 16px;
      }

      .salus-widget__panel {
        top: 0;
        left: 0;
        right: 0;
        bottom: auto;
        width: 100vw;
        border-radius: 0;
        border: 0;
      }

      .salus-widget__bubble {
        width: 58px;
        height: 58px;
      }

      .salus-widget__bubble-copy {
        max-width: 92%;
      }
    }
  `;

  function initWidget() {
    const backendUrl = (
      window.SalusWidgetConfig &&
      typeof window.SalusWidgetConfig.backendUrl === 'string' &&
      window.SalusWidgetConfig.backendUrl
    ) || BACKEND_FALLBACK;
    const isProductPage = Boolean(
      (window.SalusWidgetConfig && window.SalusWidgetConfig.isProductPage) ||
      (document.body && document.body.classList.contains('template--product'))
    );

    if (document.getElementById('salus-chat-widget')) return;

    const host = document.createElement('div');
    host.id = 'salus-chat-widget';
    document.body.appendChild(host);

    const shadow = host.attachShadow({ mode: 'open' });
    shadow.innerHTML = `
      <style>${WIDGET_STYLE}</style>
      <div class="salus-widget">
        <div class="salus-widget__panel" aria-hidden="true">
          <div class="salus-widget__header">
            <div class="salus-widget__header-copy">
              <p class="salus-widget__eyebrow">Salus Saunas</p>
              <h2 class="salus-widget__title">Hi there! How can we help?</h2>
            </div>
            <button type="button" class="salus-widget__close" aria-label="Close chat">×</button>
          </div>
          <div class="salus-widget__body">
            <div class="salus-widget__messages" aria-live="polite" aria-atomic="false">
              <div class="salus-widget__disclaimer">AI assistant — responses may not always be accurate</div>
            </div>
            <div class="salus-widget__identity-screen">
              <div class="salus-widget__identity-card">
                <p class="salus-widget__identity-eyebrow">Before we start</p>
                <h3 class="salus-widget__identity-title">Tell us where to reach you</h3>
                <p class="salus-widget__identity-copy">Add your details for tailored recommendations and an easier follow-up experience.</p>
                <form class="salus-widget__identity-form" novalidate>
                  <input class="salus-widget__field salus-widget__identity-name" name="visitor_name" type="text" placeholder="Your name" required>
                  <input class="salus-widget__field salus-widget__identity-email" name="visitor_email" type="email" placeholder="Email address" required>
                  <button type="submit" class="salus-widget__button salus-widget__button--submit">Start chatting</button>
                </form>
              </div>
            </div>
            <div class="salus-widget__footer">
              <div class="salus-widget__status" role="status"></div>
              <div class="salus-widget__composer">
                <button type="button" class="salus-widget__button salus-widget__button--ghost salus-widget__handoff-toggle">Talk to a human</button>
                <div class="salus-widget__actions">
                  <textarea class="salus-widget__textarea" rows="1" placeholder="Ask about any sauna, feature, or setup"></textarea>
                  <button type="button" class="salus-widget__button salus-widget__button--send" aria-label="Send message">
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M21.8 3.6a1 1 0 0 0-1.08-.2L3.1 10.8a1 1 0 0 0 .08 1.87l6.66 2.35 2.35 6.67a1 1 0 0 0 .92.67h.05a1 1 0 0 0 .91-.77l7.52-17.63a1 1 0 0 0-.2-1.08ZM12.9 18.22l-1.44-4.08a1 1 0 0 0-.6-.6L6.78 12.1l11.11-4.74Z"/>
                    </svg>
                  </button>
                </div>
              </div>
              <button type="button" class="salus-widget__restart">Start new conversation</button>
            </div>
          </div>
        </div>
        <button type="button" class="salus-widget__bubble" aria-label="Open chat" role="button" tabindex="0">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 3C6.48 3 2 6.94 2 11.8c0 2.7 1.41 5.11 3.62 6.69L4.5 22l4.01-2.14c1.1.31 2.27.47 3.49.47 5.52 0 10-3.94 10-8.8S17.52 3 12 3zm-4 7h8a1 1 0 0 1 0 2H8a1 1 0 1 1 0-2zm0 4h5a1 1 0 0 1 0 2H8a1 1 0 1 1 0-2z"/>
          </svg>
        </button>
      </div>
    `;

    const elements = {
      root: shadow.querySelector('.salus-widget'),
      panel: shadow.querySelector('.salus-widget__panel'),
      bubble: shadow.querySelector('.salus-widget__bubble'),
      close: shadow.querySelector('.salus-widget__close'),
      messages: shadow.querySelector('.salus-widget__messages'),
      identityForm: shadow.querySelector('.salus-widget__identity-form'),
      identityName: shadow.querySelector('.salus-widget__identity-name'),
      identityEmail: shadow.querySelector('.salus-widget__identity-email'),
      identityScreen: shadow.querySelector('.salus-widget__identity-screen'),
      status: shadow.querySelector('.salus-widget__status'),
      textarea: shadow.querySelector('.salus-widget__textarea'),
      send: shadow.querySelector('.salus-widget__button--send'),
      composer: shadow.querySelector('.salus-widget__composer'),
      handoffToggle: shadow.querySelector('.salus-widget__handoff-toggle'),
      restart: shadow.querySelector('.salus-widget__restart'),
    };

    const state = {
      backendUrl: backendUrl.replace(/\/+$/, ''),
      isProductPage: isProductPage,
      isOpen: false,
      uiState: 'IDLE',
      sessionStatus: 'bot',
      sessionId: null,
      isStreaming: false,
      pollTimer: null,
      backgroundPollTimer: null,
      renderedServerMessageCount: 0,
      optimisticQueue: [],
      typingNode: null,
      activeAssistantBody: null,
      activeAssistantRawText: '',
      viewportHandler: null,
      viewportSettleTimer: null,
      viewportFrame: null,
      visitorName: '',
      visitorEmail: '',
      bodyScrollLocked: false,
      lockedScrollY: 0,
      currentScreen: 'CLOSED',
      suppressBubbleClickUntil: 0,
    };

    function emitWidgetStateChange() {
      document.dispatchEvent(new CustomEvent('salus-widget:state-change', {
        detail: {
          isOpen: state.isOpen,
          isProductPage: state.isProductPage,
        },
      }));
    }

    function deriveCurrentScreen() {
      if (!state.isOpen) {
        return 'CLOSED';
      }
      const identityRequired = !hasVisitorIdentity() && state.sessionStatus !== 'closed';
      if (identityRequired) {
        return 'IDENTITY';
      }
      return 'CONVERSATION';
    }

    function updateCurrentScreen() {
      const nextScreen = deriveCurrentScreen();
      if (state.currentScreen !== nextScreen) {
        state.currentScreen = nextScreen;
      }
    }

    function shouldHideBubble() {
      return state.isProductPage && window.innerWidth <= MOBILE_BREAKPOINT;
    }

    function syncBubbleVisibility() {
      var hide = shouldHideBubble();
      elements.bubble.hidden = hide;
      elements.bubble.setAttribute('aria-hidden', hide ? 'true' : 'false');
      elements.bubble.tabIndex = hide ? -1 : 0;
    }

    function getSessionStorage() {
      try {
        return window.localStorage;
      } catch (error) {
        return null;
      }
    }

    function saveSessionId(sessionId) {
      state.sessionId = sessionId || null;
      const storage = getSessionStorage();
      if (!storage) return;
      if (state.sessionId) {
        storage.setItem(STORAGE_KEY, state.sessionId);
      } else {
        storage.removeItem(STORAGE_KEY);
      }
    }

    function loadStoredSessionId() {
      const storage = getSessionStorage();
      if (!storage) return null;
      return storage.getItem(STORAGE_KEY);
    }

    function setUiState(nextState) {
      state.uiState = nextState;
    }

    function setSessionStatus(nextStatus) {
      state.sessionStatus = nextStatus || 'bot';
    }

    function hasVisitorIdentity() {
      return Boolean(state.visitorName && state.visitorEmail);
    }

    function setVisitorIdentity(name, email) {
      state.visitorName = (name || '').trim();
      state.visitorEmail = (email || '').trim();
      elements.identityName.value = state.visitorName;
      elements.identityEmail.value = state.visitorEmail;
    }

    function syncIdentityFromSession(session) {
      if (!session) return;
      if (session.visitor_name || session.visitor_email) {
        setVisitorIdentity(session.visitor_name || state.visitorName, session.visitor_email || state.visitorEmail);
      }
    }

    function openWidget() {
      state.isOpen = true;
      elements.root.classList.add('salus-widget--open');
      elements.panel.setAttribute('aria-hidden', 'false');
      elements.bubble.setAttribute('aria-label', 'Close chat');
      scrollMessagesToBottom();
      updateViewportHeight();
      if (window.innerWidth <= MOBILE_BREAKPOINT) lockBodyScroll();
      updateCurrentScreen();
      syncBubbleVisibility();
      emitWidgetStateChange();
    }

    function closeWidget() {
      state.isOpen = false;
      elements.root.classList.remove('salus-widget--open');
      elements.panel.setAttribute('aria-hidden', 'true');
      elements.bubble.setAttribute('aria-label', 'Open chat');
      clearViewportHeight();
      unlockBodyScroll();
      updateCurrentScreen();
      syncBubbleVisibility();
      emitWidgetStateChange();
    }

    function toggleWidget() {
      if (state.isOpen) {
        closeWidget();
      } else {
        openWidget();
      }
    }

    function handleBubbleTouchStart(event) {
      event.preventDefault();
      state.suppressBubbleClickUntil = Date.now() + 500;
      toggleWidget();
    }

    function handleBubbleClick(event) {
      if (state.suppressBubbleClickUntil > Date.now()) {
        event.preventDefault();
        return;
      }
      toggleWidget();
    }

    function scrollMessagesToBottom() {
      requestAnimationFrame(function () {
        elements.messages.scrollTop = elements.messages.scrollHeight;
      });
    }

    function lockBodyScroll() {
      if (state.bodyScrollLocked) return;
      state.lockedScrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = '-' + state.lockedScrollY + 'px';
      document.body.style.left = '0';
      document.body.style.right = '0';
      document.body.style.overflow = 'hidden';
      state.bodyScrollLocked = true;
    }

    function unlockBodyScroll() {
      if (!state.bodyScrollLocked) return;
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.right = '';
      document.body.style.overflow = '';
      window.scrollTo(0, state.lockedScrollY);
      state.bodyScrollLocked = false;
    }

    function resizeTextarea() {
      elements.textarea.style.height = 'auto';
      const nextHeight = Math.min(elements.textarea.scrollHeight, 104);
      elements.textarea.style.height = nextHeight + 'px';
      elements.textarea.style.overflowY = elements.textarea.scrollHeight > 104 ? 'auto' : 'hidden';
    }

    function setStatusMessage(message) {
      if (message) {
        elements.status.textContent = message;
        elements.status.classList.add('is-visible');
      } else {
        elements.status.textContent = '';
        elements.status.classList.remove('is-visible');
      }
    }

    function clearMessages() {
      const nodes = elements.messages.querySelectorAll('[data-message-node="true"]');
      nodes.forEach(function (node) {
        node.remove();
      });
      state.renderedServerMessageCount = 0;
      state.optimisticQueue = [];
      state.activeAssistantBody = null;
      state.activeAssistantRawText = '';
      removeTypingIndicator();
    }

    function parseBasicMarkdown(text) {
      return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/\*\*\*([\s\S]*?)\*\*\*/g, '<strong><em>$1</em></strong>')
        .replace(/\*\*([\s\S]*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*([\s\S]*?)\*/g, '<em>$1</em>')
        .replace(/\n/g, '<br>');
    }

    function createMessageNode(role, content, senderName) {
      const wrapper = document.createElement('div');
      wrapper.dataset.messageNode = 'true';
      wrapper.className = 'salus-widget__message salus-widget__message--' + role;

      if (senderName) {
        const sender = document.createElement('div');
        sender.className = 'salus-widget__sender';
        sender.textContent = senderName;
        wrapper.appendChild(sender);
      }

      const bubble = document.createElement('div');
      bubble.className = 'salus-widget__bubble-copy';
      if (role === 'assistant') {
        bubble.innerHTML = parseBasicMarkdown(content);
      } else {
        bubble.textContent = content;
      }
      wrapper.appendChild(bubble);

      elements.messages.appendChild(wrapper);
      scrollMessagesToBottom();

      return { wrapper: wrapper, body: bubble };
    }

    function appendMessage(role, content, senderName) {
      return createMessageNode(role, content, senderName);
    }

    function appendOptimisticUserMessage(content) {
      appendMessage('user', content);
      state.optimisticQueue.push({ role: 'user', content: content });
    }

    function appendSystemMessage(content) {
      appendMessage('system', content);
    }

    function createAssistantStreamMessage() {
      const created = appendMessage('assistant', '');
      state.activeAssistantBody = created.body;
      state.activeAssistantRawText = '';
    }

    function appendAssistantToken(content) {
      if (!state.activeAssistantBody) {
        createAssistantStreamMessage();
      }
      if (typeof state.activeAssistantRawText !== 'string') {
        state.activeAssistantRawText = '';
      }
      state.activeAssistantRawText += content || '';
      state.activeAssistantBody.innerHTML = parseBasicMarkdown(state.activeAssistantRawText);
      scrollMessagesToBottom();
    }

    function markActiveAssistantWithError(message) {
      if (!state.activeAssistantBody) return;
      const note = document.createElement('div');
      note.className = 'salus-widget__error-note';
      note.textContent = message;
      state.activeAssistantBody.parentElement.appendChild(note);
      scrollMessagesToBottom();
    }

    function showTypingIndicator() {
      if (state.typingNode || state.sessionStatus !== 'bot') return;
      const typingWrapper = document.createElement('div');
      typingWrapper.dataset.messageNode = 'true';
      typingWrapper.className = 'salus-widget__message salus-widget__message--assistant';
      const bubble = document.createElement('div');
      bubble.className = 'salus-widget__typing';
      bubble.innerHTML = [
        '<span class="salus-widget__typing-dot"></span>',
        '<span class="salus-widget__typing-dot"></span>',
        '<span class="salus-widget__typing-dot"></span>',
      ].join('');
      typingWrapper.appendChild(bubble);
      elements.messages.appendChild(typingWrapper);
      state.typingNode = typingWrapper;
      scrollMessagesToBottom();
    }

    function removeTypingIndicator() {
      if (!state.typingNode) return;
      state.typingNode.remove();
      state.typingNode = null;
    }

    function normalizeStatus(status) {
      if (status === 'waiting_for_human' || status === 'human' || status === 'closed') {
        return status;
      }
      return 'bot';
    }

    function updateControls() {
      const identityRequired = !hasVisitorIdentity() && state.sessionStatus !== 'closed';
      const inputDisabled = identityRequired || state.isStreaming || state.sessionStatus === 'closed';
      elements.textarea.disabled = inputDisabled;
      elements.send.disabled = inputDisabled;
      elements.root.classList.toggle('salus-widget--identity-required', identityRequired);
      updateCurrentScreen();
      syncBubbleVisibility();

      const showHandoff = state.sessionStatus === 'bot' && !identityRequired;
      elements.handoffToggle.style.display = showHandoff ? 'inline-flex' : 'none';

      elements.restart.classList.toggle('is-visible', state.sessionStatus === 'closed');

      if (state.sessionStatus === 'waiting_for_human') {
        setStatusMessage('A sales rep will join this conversation shortly. You can keep sending messages.');
      } else if (state.sessionStatus === 'human') {
        setStatusMessage('You are connected to our sales team. Your next message will go directly to them.');
      } else if (state.sessionStatus === 'closed') {
        setStatusMessage('This conversation has been closed. Start a new one to continue.');
      } else {
        setStatusMessage('');
      }
    }

    function stopPolling() {
      if (state.pollTimer) {
        window.clearInterval(state.pollTimer);
        state.pollTimer = null;
      }
    }

    function stopBackgroundPolling() {
      if (state.backgroundPollTimer) {
        window.clearInterval(state.backgroundPollTimer);
        state.backgroundPollTimer = null;
      }
    }

    function updatePollingStrategy() {
      if (state.isStreaming || !state.sessionId || state.sessionStatus === 'closed') {
        stopPolling();
        stopBackgroundPolling();
        return;
      }

      if (state.sessionStatus === 'waiting_for_human' || state.sessionStatus === 'human') {
        stopBackgroundPolling();
        startPolling();
        return;
      }

      stopPolling();
      startBackgroundPolling();
    }

    async function fetchSession(sessionId) {
      const response = await fetch(state.backendUrl + '/api/sessions/' + encodeURIComponent(sessionId), {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
      });

      if (response.status === 404) {
        saveSessionId(null);
        throw new Error('SESSION_NOT_FOUND');
      }

      if (!response.ok) {
        throw new Error('SESSION_FETCH_FAILED');
      }

      return response.json();
    }

    async function createSessionWithIdentity(name, email) {
      const response = await fetch(state.backendUrl + '/api/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          visitor_name: name,
          visitor_email: email,
        }),
      });

      if (!response.ok) {
        throw new Error('SESSION_CREATE_FAILED');
      }

      return response.json();
    }

    function consumeOptimisticMatch(message) {
      if (!state.optimisticQueue.length) return false;
      const pending = state.optimisticQueue[0];
      if (pending.role === message.role && pending.content === message.content) {
        state.optimisticQueue.shift();
        return true;
      }
      return false;
    }

    function renderServerMessages(messages, options) {
      const reset = Boolean(options && options.reset);
      if (reset) {
        clearMessages();
      }

      const startIndex = reset ? 0 : state.renderedServerMessageCount;
      if (messages.length <= startIndex) {
        state.renderedServerMessageCount = messages.length;
        return;
      }

      for (let index = startIndex; index < messages.length; index += 1) {
        const message = messages[index];
        if (!reset && consumeOptimisticMatch(message)) {
          continue;
        }

        if (message.role === 'system') {
          appendSystemMessage(message.content);
        } else if (message.role === 'assistant') {
          appendMessage('assistant', message.content, message.sender_name || null);
        } else {
          appendMessage('user', message.content);
        }
      }

      state.renderedServerMessageCount = messages.length;
    }

    function handleSessionStatus(status, options) {
      const nextStatus = normalizeStatus(status);
      setSessionStatus(nextStatus);

      if (nextStatus === 'closed') {
        setUiState('CLOSED');
        stopPolling();
        stopBackgroundPolling();
        saveSessionId(null);
      } else if (nextStatus === 'waiting_for_human' || nextStatus === 'human') {
        setUiState('HANDOFF');
        if (!(options && options.skipPollingStart)) {
          startPolling();
        }
      } else if (state.isStreaming) {
        setUiState('STREAMING');
      } else if (state.sessionId) {
        setUiState('READY');
      } else {
        setUiState('IDLE');
      }

      updatePollingStrategy();
      updateControls();
    }

    async function restoreSession() {
      const storedSessionId = loadStoredSessionId();
      if (!storedSessionId) {
        saveSessionId(null);
        handleSessionStatus('bot', { skipPollingStart: true });
        return;
      }

      saveSessionId(storedSessionId);

      try {
        const session = await fetchSession(storedSessionId);
        syncIdentityFromSession(session);
        renderServerMessages(session.messages || [], { reset: true });
        handleSessionStatus(session.status, { skipPollingStart: true });
      } catch (error) {
        if (error.message === 'SESSION_NOT_FOUND') {
          clearMessages();
          handleSessionStatus('bot', { skipPollingStart: true });
          return;
        }
        saveSessionId(null);
        clearMessages();
        handleSessionStatus('bot', { skipPollingStart: true });
      }
    }

    async function postStreamStatusCheck() {
      if (!state.sessionId || state.sessionStatus !== 'bot') return;

      try {
        const session = await fetchSession(state.sessionId);
        syncIdentityFromSession(session);
        state.renderedServerMessageCount = session.messages ? session.messages.length : state.renderedServerMessageCount;
        if (session.status === 'waiting_for_human' || session.status === 'human') {
          renderServerMessages(session.messages || [], { reset: true });
          handleSessionStatus(session.status);
        } else if (session.status === 'closed') {
          renderServerMessages(session.messages || [], { reset: true });
          handleSessionStatus('closed');
        }
      } catch (error) {
        if (error.message === 'SESSION_NOT_FOUND') {
          clearMessages();
          handleSessionStatus('bot', { skipPollingStart: true });
        }
      }
    }

    async function pollSession() {
      if (!state.sessionId || state.isStreaming) return;

      try {
        const session = await fetchSession(state.sessionId);
        syncIdentityFromSession(session);
        renderServerMessages(session.messages || []);

        if (session.status === 'closed') {
          handleSessionStatus('closed');
          return;
        }

        if (session.status === 'waiting_for_human' || session.status === 'human') {
          handleSessionStatus(session.status, { skipPollingStart: true });
        }
      } catch (error) {
        if (error.message === 'SESSION_NOT_FOUND') {
          clearMessages();
          handleSessionStatus('bot', { skipPollingStart: true });
        }
      }
    }

    function startPolling() {
      if (!state.sessionId || state.pollTimer || state.isStreaming) return;
      state.pollTimer = window.setInterval(function () {
        pollSession().catch(function () {});
      }, POLL_INTERVAL_MS);
    }

    async function backgroundStatusCheck() {
      if (!state.sessionId || state.isStreaming || state.sessionStatus !== 'bot') return;

      try {
        const session = await fetchSession(state.sessionId);
        syncIdentityFromSession(session);

        if (session.status === 'waiting_for_human' || session.status === 'human') {
          renderServerMessages(session.messages || [], { reset: true });
          handleSessionStatus(session.status);
          return;
        }

        if (session.status === 'closed') {
          renderServerMessages(session.messages || [], { reset: true });
          handleSessionStatus('closed');
        }
      } catch (error) {
        if (error.message === 'SESSION_NOT_FOUND') {
          clearMessages();
          handleSessionStatus('bot', { skipPollingStart: true });
        }
      }
    }

    function startBackgroundPolling() {
      if (!state.sessionId || state.backgroundPollTimer || state.isStreaming || state.sessionStatus !== 'bot') return;
      state.backgroundPollTimer = window.setInterval(function () {
        backgroundStatusCheck().catch(function () {});
      }, BOT_STATUS_POLL_INTERVAL_MS);
    }

    function resetConversation() {
      stopPolling();
      stopBackgroundPolling();
      saveSessionId(null);
      clearMessages();
      setVisitorIdentity('', '');
      setSessionStatus('bot');
      setUiState('IDLE');
      state.isStreaming = false;
      elements.textarea.value = '';
      resizeTextarea();
      updateControls();
      setStatusMessage('');
      openWidget();
    }

    async function requestHandoff() {
      if (!state.sessionId) {
        setStatusMessage('Send a message first so we can attach the handoff to your conversation.');
        return;
      }

      try {
        const response = await fetch(state.backendUrl + '/api/sessions/' + encodeURIComponent(state.sessionId) + '/handoff', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({
            name: state.visitorName || null,
            email: state.visitorEmail || null,
          }),
        });

        if (response.status !== 200 && response.status !== 409) {
          throw new Error('HANDOFF_FAILED');
        }

        if (response.status === 200) {
          appendSystemMessage(SYSTEM_CONNECTING_MESSAGE);
          state.renderedServerMessageCount += 1;
        }

        handleSessionStatus('waiting_for_human');
        await pollSession();
      } catch (error) {
        setStatusMessage('Unable to request a handoff right now. Please try again.');
      }
    }

    async function readStream(response, createdAssistant) {
      const reader = response.body && response.body.getReader ? response.body.getReader() : null;
      if (!reader) {
        throw new Error('STREAM_NOT_SUPPORTED');
      }

      const decoder = new TextDecoder();
      let buffer = '';
      let sawMetadata = false;
      let sawError = false;

      while (true) {
        const result = await reader.read();
        if (result.done) break;

        buffer += decoder.decode(result.value, { stream: true });
        const events = buffer.split('\n\n');
        buffer = events.pop() || '';

        for (let index = 0; index < events.length; index += 1) {
          const line = events[index].trim();
          if (!line.startsWith('data: ')) continue;
          const payload = line.slice(6);

          if (payload === '[DONE]') {
            return { sawMetadata: sawMetadata, sawError: sawError };
          }

          let data;
          try {
            data = JSON.parse(payload);
          } catch (error) {
            continue;
          }

          if (data.type === 'token') {
            appendAssistantToken(data.content || '');
          } else if (data.type === 'metadata') {
            sawMetadata = true;
            if (data.session_id) {
              saveSessionId(data.session_id);
            }
          } else if (data.type === 'error') {
            sawError = true;
            if (createdAssistant || state.activeAssistantBody) {
              markActiveAssistantWithError(data.message || 'Unable to connect.');
            } else {
              appendSystemMessage(data.message || 'Unable to connect.');
            }
          }
        }
      }

      return { sawMetadata: sawMetadata, sawError: sawError };
    }

    async function sendMessage(messageText) {
      const text = messageText.trim();
      if (!text || state.isStreaming || state.sessionStatus === 'closed' || !hasVisitorIdentity() || !state.sessionId) return;

      openWidget();
      setStatusMessage('');
      appendOptimisticUserMessage(text);

      const shouldShowTyping = state.sessionStatus === 'bot';
      if (shouldShowTyping) {
        showTypingIndicator();
      }

      state.isStreaming = true;
      setUiState('STREAMING');
      updatePollingStrategy();
      updateControls();

      if (shouldShowTyping) {
        createAssistantStreamMessage();
      }

      try {
        const body = {
          message: text,
          session_id: state.sessionId,
        };

        const response = await fetch(state.backendUrl + '/api/chat/stream', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'text/event-stream',
          },
          body: JSON.stringify(body),
        });

        if (response.status === 503) {
          throw new Error('SERVICE_UNAVAILABLE');
        }

        if (response.status === 410) {
          handleSessionStatus('closed');
          throw new Error('SESSION_CLOSED');
        }

        if (!response.ok) {
          throw new Error('SEND_FAILED');
        }

        await readStream(response, shouldShowTyping);

        if (shouldShowTyping) {
          state.renderedServerMessageCount += 2;
          state.optimisticQueue = [];
        }
      } catch (error) {
        if (error.message === 'SERVICE_UNAVAILABLE') {
          appendSystemMessage('Service temporarily unavailable. Please try again in a moment.');
        } else if (error.message === 'SESSION_CLOSED') {
          appendSystemMessage('This conversation has been closed. Start a new one to continue.');
        } else if (shouldShowTyping && state.activeAssistantBody && state.activeAssistantBody.textContent) {
          markActiveAssistantWithError('Connection lost. Please try again.');
        } else {
          appendSystemMessage('Unable to connect. Please try again.');
        }
      } finally {
        removeTypingIndicator();
        state.activeAssistantBody = null;
        state.activeAssistantRawText = '';
        state.isStreaming = false;

        if (state.sessionStatus === 'bot') {
          setUiState(state.sessionId ? 'READY' : 'IDLE');
        } else if (state.sessionStatus === 'closed') {
          setUiState('CLOSED');
        } else {
          setUiState('HANDOFF');
        }

        updatePollingStrategy();
        updateControls();
        await postStreamStatusCheck();
      }
    }

    function handleTextareaKeydown(event) {
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        const value = elements.textarea.value;
        elements.textarea.value = '';
        resizeTextarea();
        sendMessage(value).catch(function () {});
      }
    }

    function handleSendClick() {
      const value = elements.textarea.value;
      elements.textarea.value = '';
      resizeTextarea();
      sendMessage(value).catch(function () {});
    }

    function updateViewportHeight() {
      if (!state.isOpen || window.innerWidth > MOBILE_BREAKPOINT) {
        clearViewportHeight();
        return;
      }
      lockBodyScroll();
      var viewport = window.visualViewport;
      if (viewport) {
        elements.panel.style.top = Math.round(viewport.offsetTop) + 'px';
        elements.panel.style.height = Math.round(viewport.height) + 'px';
        if (elements.identityScreen && viewport.height < window.innerHeight) {
          elements.identityScreen.style.alignItems = 'flex-start';
          elements.identityScreen.style.paddingTop = '20px';
        }
      } else {
        elements.panel.style.top = '0px';
        elements.panel.style.height = '100vh';
      }
      scrollMessagesToBottom();
    }

    function clearViewportHeight() {
      if (state.viewportFrame) {
        window.cancelAnimationFrame(state.viewportFrame);
        state.viewportFrame = null;
      }
      if (state.viewportSettleTimer) {
        window.clearTimeout(state.viewportSettleTimer);
        state.viewportSettleTimer = null;
      }
      elements.panel.style.top = '';
      elements.panel.style.height = '';
      if (elements.identityScreen) {
        elements.identityScreen.style.alignItems = '';
        elements.identityScreen.style.paddingTop = '';
      }
      unlockBodyScroll();
    }

    function scheduleViewportSync() {
      if (state.viewportFrame) {
        window.cancelAnimationFrame(state.viewportFrame);
      }
      if (state.viewportSettleTimer) {
        window.clearTimeout(state.viewportSettleTimer);
      }
      state.viewportFrame = window.requestAnimationFrame(function () {
        state.viewportFrame = null;
        updateViewportHeight();
      });
      state.viewportSettleTimer = window.setTimeout(function () {
        state.viewportSettleTimer = null;
        updateViewportHeight();
      }, 400);
    }

    function bindViewportEvents() {
      state.viewportHandler = function () {
        scheduleViewportSync();
      };

      if (window.visualViewport) {
        window.visualViewport.addEventListener('resize', state.viewportHandler);
        window.visualViewport.addEventListener('scroll', state.viewportHandler);
      }

      window.addEventListener('orientationchange', function () {
        scheduleViewportSync();
        syncBubbleVisibility();
      });

      var focusTimer = null;
      function handleInputFocus() {
        if (focusTimer) clearTimeout(focusTimer);
        updateViewportHeight();
        focusTimer = setTimeout(updateViewportHeight, 300);
      }
      function handleInputBlur() {
        if (focusTimer) clearTimeout(focusTimer);
        focusTimer = setTimeout(updateViewportHeight, 100);
      }

      elements.textarea.addEventListener('focus', handleInputFocus);
      elements.textarea.addEventListener('blur', handleInputBlur);
      elements.identityName.addEventListener('focus', handleInputFocus);
      elements.identityName.addEventListener('blur', handleInputBlur);
      elements.identityEmail.addEventListener('focus', handleInputFocus);
      elements.identityEmail.addEventListener('blur', handleInputBlur);
    }

    window.SalusWidget = {
      open: openWidget,
      close: closeWidget,
      toggle: toggleWidget,
      isOpen: function () {
        return state.isOpen;
      },
    };

    elements.bubble.addEventListener('touchstart', handleBubbleTouchStart, { passive: false });
    elements.bubble.addEventListener('click', handleBubbleClick);
    elements.bubble.addEventListener('keydown', function (event) {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        toggleWidget();
      }
    });
    elements.close.addEventListener('click', closeWidget);
    elements.textarea.addEventListener('input', resizeTextarea);
    elements.textarea.addEventListener('keydown', handleTextareaKeydown);
    elements.send.addEventListener('click', handleSendClick);
    elements.handoffToggle.addEventListener('click', function () {
      requestHandoff().catch(function () {});
    });
    elements.identityForm.addEventListener('submit', function (event) {
      event.preventDefault();
      const name = elements.identityName.value.trim();
      const email = elements.identityEmail.value.trim();
      if (!name || !email) {
        setStatusMessage('Please add your name and email so we can start the conversation.');
        return;
      }
      if (!elements.identityEmail.checkValidity()) {
        setStatusMessage('Please enter a valid email address.');
        elements.identityEmail.focus();
        return;
      }

      createSessionWithIdentity(name, email)
        .then(function (session) {
          setVisitorIdentity(name, email);
          saveSessionId(session.session_id);
          syncIdentityFromSession(session);
          state.renderedServerMessageCount = Array.isArray(session.messages) ? session.messages.length : 0;
          handleSessionStatus(session.status || 'bot', { skipPollingStart: true });
          setStatusMessage('');
          updateControls();
          elements.textarea.focus();
        })
        .catch(function () {
          setStatusMessage('Unable to start the chat right now. Please try again.');
        });
    });
    elements.restart.addEventListener('click', resetConversation);

    function bindResizeSync() {
      var debounceTimer;
      window.addEventListener('resize', function () {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(syncBubbleVisibility, 150);
      });
    }

    bindViewportEvents();
    bindResizeSync();
    syncBubbleVisibility();
    emitWidgetStateChange();
    resizeTextarea();
    updateControls();
    restoreSession().catch(function () {});
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initWidget, { once: true });
  } else {
    initWidget();
  }
}());
