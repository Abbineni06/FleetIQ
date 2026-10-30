/**
 * FleetIQ AI Maintenance Assistant Logic
 */

document.addEventListener('DOMContentLoaded', () => {
  loadChatHistory();
});

async function loadChatHistory() {
  try {
    const history = await API.get('/api/ai/history');
    const container = document.getElementById('chat-messages-container');
    if (!container || history.length === 0) return;

    history.forEach(msg => {
      appendMessage(msg.role, msg.message, false);
    });

    scrollToBottom();
  } catch (e) {
    console.error(e);
  }
}

function handleInputKey(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
}

function askPreset(question) {
  document.getElementById('chat-input').value = question;
  sendMessage();
}

async function sendMessage() {
  const input = document.getElementById('chat-input');
  const query = input.value.trim();
  if (!query) return;

  input.value = '';
  appendMessage('user', query, true);

  // Typing indicator
  const typingId = appendTypingIndicator();
  scrollToBottom();

  const sendBtn = document.getElementById('chat-send-btn');
  sendBtn.disabled = true;

  try {
    const res = await API.post('/api/ai/chat', { message: query });
    removeTypingIndicator(typingId);
    appendMessage('assistant', res.reply, true, res.followUpSuggestions);
  } catch (err) {
    removeTypingIndicator(typingId);
    appendMessage('assistant', `⚠️ **Error communicating with FleetIQ AI Engine:** ${err.message}`, true);
  } finally {
    sendBtn.disabled = false;
    scrollToBottom();
  }
}

function appendMessage(role, text, shouldScroll = true, suggestions = []) {
  const container = document.getElementById('chat-messages-container');
  if (!container) return;

  const isUser = role === 'user';
  const bubble = document.createElement('div');
  bubble.className = `message-bubble ${isUser ? 'user' : 'assistant'}`;

  const renderedContent = isUser ? escapeHtml(text) : (window.marked ? marked.parse(text) : text);

  let suggestionsHtml = '';
  if (suggestions && suggestions.length > 0) {
    suggestionsHtml = `
      <div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:12px;">
        ${suggestions.map(s => `
          <button style="font-size:0.75rem;padding:4px 8px;border-radius:var(--radius-sm);background:var(--bg-card);border:1px solid var(--border-color);color:var(--primary-orange);cursor:pointer;" onclick="askPreset('${s.replace(/'/g, "\\'")}')">
            ${escapeHtml(s)}
          </button>
        `).join('')}
      </div>
    `;
  }

  bubble.innerHTML = `
    <div class="msg-avatar ${isUser ? 'user-av' : 'ai-av'}">
      <i data-lucide="${isUser ? 'user' : 'bot'}" style="width:18px;height:18px;"></i>
    </div>
    <div class="msg-content">
      ${renderedContent}
      ${suggestionsHtml}
    </div>
  `;

  container.appendChild(bubble);
  if (window.lucide) lucide.createIcons();

  if (shouldScroll) {
    scrollToBottom();
  }
}

function appendTypingIndicator() {
  const container = document.getElementById('chat-messages-container');
  const id = 'typing-' + Date.now();
  const bubble = document.createElement('div');
  bubble.id = id;
  bubble.className = 'message-bubble assistant';
  bubble.innerHTML = `
    <div class="msg-avatar ai-av"><i data-lucide="bot" style="width:18px;height:18px;"></i></div>
    <div class="msg-content" style="display:flex;align-items:center;gap:8px;color:var(--text-muted);font-style:italic;">
      <i data-lucide="loader-2" class="spin" style="width:16px;height:16px;"></i> Querying fleet database & synthesizing response...
    </div>
  `;
  container.appendChild(bubble);
  if (window.lucide) lucide.createIcons();
  return id;
}

function removeTypingIndicator(id) {
  const el = document.getElementById(id);
  if (el) el.remove();
}

function scrollToBottom() {
  const container = document.getElementById('chat-messages-container');
  if (container) {
    container.scrollTop = container.scrollHeight;
  }
}

async function clearChatHistory() {
  if (!confirm('Are you sure you want to clear your AI chat history?')) return;

  try {
    await API.delete('/api/ai/history');
    const container = document.getElementById('chat-messages-container');
    if (container) {
      container.innerHTML = `
        <div class="message-bubble assistant">
          <div class="msg-avatar ai-av"><i data-lucide="bot" style="width:20px;height:20px;"></i></div>
          <div class="msg-content">
            <strong>Chat history cleared.</strong><br/>
            How can I assist your fleet management team today?
          </div>
        </div>
      `;
      if (window.lucide) lucide.createIcons();
    }
    showToast('Chat history cleared', 'success');
  } catch (err) {
    showToast('Failed to clear history: ' + err.message, 'danger');
  }
}
