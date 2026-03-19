(function () {
  if (window.__salusWidget) return;
  window.__salusWidget = true;

  const BACKEND_FALLBACK = 'https://chat.salussaunastech.com';
  const STORAGE_KEY = 'salus_session_id';
  const POLL_INTERVAL_MS = 3000;
  const MOBILE_BREAKPOINT = 600;
  const SYSTEM_CONNECTING_MESSAGE = 'Connecting you to our sales team...';

  const WIDGET_STYLE = `
    :host {
      all: initial;
    }

    *, *::before, *::after {
      box-sizing: border-box;
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
      font-size: 17px;
      line-height: 1.3;
      font-weight: 600;
      margin: 0;
    }

    .salus-widget__subtitle {
      font-size: 12px;
      line-height: 1.45;
      margin: 4px 0 0;
      opacity: 0.78;
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

    .salus-widget__messages {
      flex: 1;
      min-height: 0;
      overflow-y: auto;
      padding: 14px 14px 10px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      scroll-behavior: smooth;
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

    .salus-widget__handoff {
      display: none;
      gap: 10px;
      flex-direction: column;
    }

    .salus-widget__handoff.is-visible {
      display: flex;
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

    .salus-widget__actions {
      display: flex;
      gap: 8px;
      align-items: flex-end;
    }

    .salus-widget__textarea {
      min-height: 46px;
      max-height: 104px;
      resize: none;
      flex: 1;
      border: 1px solid rgba(15, 23, 42, 0.14);
      border-radius: 16px;
      padding: 12px 14px;
      background: #ffffff;
      color: #111827;
      font: inherit;
      line-height: 1.45;
      outline: none;
      overflow-y: auto;
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

    @media (max-width: 600px) {
      .salus-widget {
        right: 16px;
        bottom: 16px;
      }

      .salus-widget__panel {
        inset: 0;
        width: 100vw;
        height: 100vh;
        border-radius: 0;
        border: 0;
        right: auto;
        bottom: auto;
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

    if (document.getElementById('salus-chat-widget')) return;

    const host = document.createElement('div');
    host.id = 'salus-chat-widget';
    document.body.appendChild(host);

    const shadow = host.attachShadow({ mode: 'open' });
    shadow.innerHTML = `
      <style>${WIDGET_STYLE}</style>
      <div class="salus-widget" data-state="closed">
        <div class="salus-widget__panel" aria-hidden="true">
          <div class="salus-widget__header">
            <div class="salus-widget__header-copy">
              <p class="salus-widget__eyebrow">Salus Sales</p>
              <h2 class="salus-widget__title">Ask our sauna assistant</h2>
              <p class="salus-widget__subtitle">Get product guidance or request a human handoff.</p>
            </div>
            <button type="button" class="salus-widget__close" aria-label="Close chat">×</button>
          </div>
          <div class="salus-widget__body">
            <div class="salus-widget__messages" aria-live="polite" aria-atomic="false">
              <div class="salus-widget__disclaimer">AI assistant — responses may not always be accurate</div>
            </div>
            <div class="salus-widget__footer">
              <div class="salus-widget__status" role="status"></div>
              <form class="salus-widget__handoff" novalidate>
                <input class="salus-widget__field salus-widget__handoff-name" name="name" type="text" placeholder="Your name" required>
                <input class="salus-widget__field salus-widget__handoff-email" name="email" type="email" placeholder="Email address" required>
                <button type="submit" class="salus-widget__button salus-widget__button--submit">Request handoff</button>
              </form>
              <button type="button" class="salus-widget__button salus-widget__button--ghost salus-widget__handoff-toggle">Talk to a human</button>
              <div class="salus-widget__actions">
                <textarea class="salus-widget__textarea" rows="1" placeholder="Ask about any sauna, feature, or setup"></textarea>
                <button type="button" class="salus-widget__button salus-widget__button--send" aria-label="Send message">Send</button>
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
      status: shadow.querySelector('.salus-widget__status'),
      textarea: shadow.querySelector('.salus-widget__textarea'),
      send: shadow.querySelector('.salus-widget__button--send'),
      handoffToggle: shadow.querySelector('.salus-widget__handoff-toggle'),
      handoffForm: shadow.querySelector('.salus-widget__handoff'),
      handoffName: shadow.querySelector('.salus-widget__handoff-name'),
      handoffEmail: shadow.querySelector('.salus-widget__handoff-email'),
      restart: shadow.querySelector('.salus-widget__restart'),
    };

    const state = {
      backendUrl: backendUrl.replace(/\/+$/, ''),
      isOpen: false,
      uiState: 'IDLE',
      sessionStatus: 'bot',
      sessionId: null,
      isStreaming: false,
      pollTimer: null,
      renderedServerMessageCount: 0,
      optimisticQueue: [],
      typingNode: null,
      activeAssistantBody: null,
      viewportHandler: null,
    };

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

    function openWidget() {
      state.isOpen = true;
      elements.root.classList.add('salus-widget--open');
      elements.panel.setAttribute('aria-hidden', 'false');
      elements.bubble.setAttribute('aria-label', 'Close chat');
      scrollMessagesToBottom();
      updateViewportHeight();
    }

    function closeWidget() {
      state.isOpen = false;
      elements.root.classList.remove('salus-widget--open');
      elements.panel.setAttribute('aria-hidden', 'true');
      elements.bubble.setAttribute('aria-label', 'Open chat');
      clearViewportHeight();
    }

    function toggleWidget() {
      if (state.isOpen) {
        closeWidget();
      } else {
        openWidget();
      }
    }

    function scrollMessagesToBottom() {
      requestAnimationFrame(function () {
        elements.messages.scrollTop = elements.messages.scrollHeight;
      });
    }

    function resizeTextarea() {
      elements.textarea.style.height = 'auto';
      const nextHeight = Math.min(elements.textarea.scrollHeight, 104);
      elements.textarea.style.height = nextHeight + 'px';
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
      removeTypingIndicator();
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
      bubble.textContent = content;
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
    }

    function appendAssistantToken(content) {
      if (!state.activeAssistantBody) {
        createAssistantStreamMessage();
      }
      state.activeAssistantBody.textContent += content;
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
      const inputDisabled = state.isStreaming || state.sessionStatus === 'closed';
      elements.textarea.disabled = inputDisabled;
      elements.send.disabled = inputDisabled;

      const showHandoff = state.sessionStatus === 'bot';
      elements.handoffToggle.style.display = showHandoff ? 'inline-flex' : 'none';
      if (!showHandoff) {
        elements.handoffForm.classList.remove('is-visible');
      }

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
          appendMessage('assistant', message.content, message.sender_name || '');
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
        stopPolling();
      } else {
        setUiState('IDLE');
        stopPolling();
      }

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
        renderServerMessages(session.messages || [], { reset: true });
        handleSessionStatus(session.status, { skipPollingStart: true });
        if (state.sessionStatus === 'waiting_for_human' || state.sessionStatus === 'human') {
          startPolling();
        }
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
        state.renderedServerMessageCount = session.messages ? session.messages.length : state.renderedServerMessageCount;
        if (session.status === 'waiting_for_human' || session.status === 'human') {
          handleSessionStatus(session.status);
          renderServerMessages(session.messages || [], { reset: true });
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

    function resetConversation() {
      stopPolling();
      saveSessionId(null);
      clearMessages();
      setSessionStatus('bot');
      setUiState('IDLE');
      state.isStreaming = false;
      elements.textarea.value = '';
      resizeTextarea();
      updateControls();
      setStatusMessage('');
      openWidget();
    }

    async function requestHandoff(name, email) {
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
          body: JSON.stringify({ name: name, email: email }),
        });

        if (response.status !== 200 && response.status !== 409) {
          throw new Error('HANDOFF_FAILED');
        }

        elements.handoffForm.classList.remove('is-visible');

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
      if (!text || state.isStreaming || state.sessionStatus === 'closed') return;

      openWidget();
      setStatusMessage('');
      appendOptimisticUserMessage(text);

      const shouldShowTyping = state.sessionStatus === 'bot';
      if (shouldShowTyping) {
        showTypingIndicator();
      }

      state.isStreaming = true;
      setUiState('STREAMING');
      updateControls();

      if (shouldShowTyping) {
        createAssistantStreamMessage();
      }

      try {
        const body = { message: text };
        if (state.sessionId) {
          body.session_id = state.sessionId;
        }

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
        state.isStreaming = false;

        if (state.sessionStatus === 'bot') {
          setUiState(state.sessionId ? 'READY' : 'IDLE');
        } else if (state.sessionStatus === 'closed') {
          setUiState('CLOSED');
        } else {
          setUiState('HANDOFF');
        }

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
      if (!state.isOpen || window.innerWidth > MOBILE_BREAKPOINT || !window.visualViewport) return;
      elements.panel.style.height = window.visualViewport.height + 'px';
    }

    function clearViewportHeight() {
      elements.panel.style.height = '';
    }

    function bindViewportEvents() {
      if (!window.visualViewport) return;
      state.viewportHandler = function () {
        updateViewportHeight();
      };
      window.visualViewport.addEventListener('resize', state.viewportHandler);
    }

    elements.bubble.addEventListener('click', toggleWidget);
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
      elements.handoffForm.classList.toggle('is-visible');
      if (elements.handoffForm.classList.contains('is-visible')) {
        elements.handoffName.focus();
      }
    });
    elements.handoffForm.addEventListener('submit', function (event) {
      event.preventDefault();
      const name = elements.handoffName.value.trim();
      const email = elements.handoffEmail.value.trim();
      if (!name || !email) {
        setStatusMessage('Please add your name and email so our team can follow up.');
        return;
      }
      requestHandoff(name, email).catch(function () {});
    });
    elements.restart.addEventListener('click', resetConversation);

    bindViewportEvents();
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
