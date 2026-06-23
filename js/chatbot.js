/* ============================================
   AI CHATBOT ASSISTANT
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  // Construct and Inject Chatbot Widget into DOM
  createChatbotWidget();

  // Setup Event Listeners
  const toggleBtn = document.getElementById('chatbot-toggle-btn');
  const widgetContainer = document.getElementById('chatbot-widget');
  const closeBtn = document.getElementById('chatbot-close-btn');
  const sendBtn = document.getElementById('chatbot-send-btn');
  const chatInput = document.getElementById('chatbot-input');

  if (toggleBtn && widgetContainer) {
    toggleBtn.addEventListener('click', () => {
      widgetContainer.classList.toggle('open');
      if (widgetContainer.classList.contains('open')) {
        // Scroll to bottom
        scrollToBottom();
      }
    });
  }

  if (closeBtn && widgetContainer) {
    closeBtn.addEventListener('click', () => {
      widgetContainer.classList.remove('open');
    });
  }

  if (sendBtn && chatInput) {
    sendBtn.addEventListener('click', () => handleUserMsgSend());
    chatInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        handleUserMsgSend();
      }
    });
  }
});

function createChatbotWidget() {
  // Styles for chatbot widget
  const style = document.createElement('style');
  style.innerHTML = `
    .chatbot-widget {
      position: fixed;
      bottom: var(--space-6);
      right: var(--space-6);
      z-index: var(--z-tooltip);
      display: flex;
      flex-direction: column;
      width: 350px;
      height: 480px;
      background: var(--bg-secondary);
      border: 1px solid var(--border-primary);
      border-radius: var(--radius-2xl);
      box-shadow: var(--shadow-xl), var(--shadow-glow);
      overflow: hidden;
      transform: translateY(20px) scale(0.9);
      opacity: 0;
      visibility: hidden;
      transition: all var(--transition-spring);
    }
    .chatbot-widget.open {
      transform: translateY(0) scale(1);
      opacity: 1;
      visibility: visible;
    }
    .chatbot-header {
      background: var(--gradient-accent);
      color: white;
      padding: var(--space-4);
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .chatbot-header h3 {
      font-size: 0.95rem;
      font-weight: 700;
      color: white;
    }
    .chatbot-messages {
      flex: 1;
      padding: var(--space-4);
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: var(--space-3);
    }
    .chat-bubble {
      max-width: 80%;
      padding: var(--space-3) var(--space-4);
      border-radius: var(--radius-xl);
      font-size: 0.85rem;
      line-height: 1.5;
    }
    .chat-bubble.bot {
      background: var(--bg-tertiary);
      color: var(--text-primary);
      align-self: flex-start;
      border-top-left-radius: var(--radius-sm);
    }
    .chat-bubble.user {
      background: var(--primary-500);
      color: white;
      align-self: flex-end;
      border-top-right-radius: var(--radius-sm);
    }
    .chatbot-suggestions {
      display: flex;
      flex-wrap: wrap;
      gap: var(--space-2);
      padding: var(--space-2) var(--space-4);
      background: var(--bg-primary);
      border-top: 1px solid var(--border-secondary);
    }
    .chatbot-suggestion-btn {
      padding: var(--space-1) var(--space-3);
      background: var(--bg-card);
      border: 1px solid var(--border-primary);
      border-radius: var(--radius-full);
      font-size: 0.75rem;
      font-family: var(--font-body);
      color: var(--text-secondary);
      cursor: pointer;
      transition: all var(--transition-fast);
    }
    .chatbot-suggestion-btn:hover {
      border-color: var(--primary-500);
      color: var(--primary-400);
    }
    .chatbot-footer {
      padding: var(--space-3) var(--space-4);
      background: var(--bg-tertiary);
      border-top: 1px solid var(--border-primary);
      display: flex;
      gap: var(--space-2);
    }
    .chatbot-footer input {
      flex: 1;
      padding: var(--space-2) var(--space-3);
      border-radius: var(--radius-lg);
      border: 1px solid var(--border-primary);
      background: var(--bg-primary);
      color: var(--text-primary);
      font-size: 0.85rem;
      outline: none;
    }
    .chatbot-footer input:focus { border-color: var(--primary-500); }
    .chatbot-toggle-btn {
      position: fixed;
      bottom: var(--space-6);
      right: var(--space-6);
      z-index: var(--z-tooltip);
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background: var(--gradient-accent);
      color: white;
      border: none;
      cursor: pointer;
      box-shadow: var(--shadow-xl), var(--shadow-glow);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      transition: all var(--transition-spring);
    }
    .chatbot-toggle-btn:hover {
      transform: scale(1.05);
    }
    .chatbot-widget.open ~ .chatbot-toggle-btn {
      transform: scale(0) rotate(180deg);
      opacity: 0;
      visibility: hidden;
    }
    /* Typing indicator */
    .typing-dots {
      display: flex;
      gap: 4px;
      align-items: center;
      height: 12px;
    }
    .typing-dots span {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: var(--text-secondary);
      animation: bounce 1.2s infinite;
    }
    .typing-dots span:nth-child(2) { animation-delay: 0.2s; }
    .typing-dots span:nth-child(3) { animation-delay: 0.4s; }
    @keyframes bounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-4px); }
    }
  `;
  document.head.appendChild(style);

  // Widget HTML injection
  const widget = document.createElement('div');
  widget.className = 'chatbot-widget';
  widget.id = 'chatbot-widget';
  widget.innerHTML = `
    <div class="chatbot-header">
      <div class="flex items-center gap-2">
        <span style="font-size: 1.2rem;">🤖</span>
        <h3>Veritas AI Assistant</h3>
      </div>
      <button class="toast-close" id="chatbot-close-btn" style="color: white;">&times;</button>
    </div>
    
    <div class="chatbot-messages" id="chatbot-messages">
      <div class="chat-bubble bot">
        Hello! I'm Veritas, your news verification assistant. How can I help you analyze news credibility today?
      </div>
    </div>
    
    <div class="chatbot-suggestions">
      <button class="chatbot-suggestion-btn" onclick="sendSuggestion('Why is this article fake?')">Why is this article fake?</button>
      <button class="chatbot-suggestion-btn" onclick="sendSuggestion('Explain confidence score')">Explain confidence score</button>
      <button class="chatbot-suggestion-btn" onclick="sendSuggestion('How does detection work?')">How does detection work?</button>
    </div>
    
    <div class="chatbot-footer">
      <input type="text" placeholder="Ask a question..." id="chatbot-input">
      <button class="btn btn-primary btn-sm" id="chatbot-send-btn">Send</button>
    </div>
  `;
  document.body.appendChild(widget);

  // Toggle button injection
  const toggleBtn = document.createElement('button');
  toggleBtn.className = 'chatbot-toggle-btn';
  toggleBtn.id = 'chatbot-toggle-btn';
  toggleBtn.innerText = '💬';
  document.body.appendChild(toggleBtn);
}

function handleUserMsgSend() {
  const input = document.getElementById('chatbot-input');
  const text = input.value.trim();
  if (!text) return;

  // Render User Bubble
  renderMessage(text, 'user');
  input.value = '';

  // Process Bot Reply after typing simulation
  showTypingIndicator();
  setTimeout(() => {
    removeTypingIndicator();
    const reply = getBotResponse(text);
    renderMessage(reply, 'bot');
  }, 1000 + Math.random() * 800);
}

window.sendSuggestion = function(text) {
  renderMessage(text, 'user');
  
  showTypingIndicator();
  setTimeout(() => {
    removeTypingIndicator();
    const reply = getBotResponse(text);
    renderMessage(reply, 'bot');
  }, 800);
};

function renderMessage(text, sender) {
  const messagesBox = document.getElementById('chatbot-messages');
  if (!messagesBox) return;

  const bubble = document.createElement('div');
  bubble.className = `chat-bubble ${sender}`;
  bubble.innerText = text;
  messagesBox.appendChild(bubble);

  scrollToBottom();
}

function showTypingIndicator() {
  const messagesBox = document.getElementById('chatbot-messages');
  if (!messagesBox) return;

  const bubble = document.createElement('div');
  bubble.className = 'chat-bubble bot';
  bubble.id = 'typing-indicator';
  bubble.innerHTML = `
    <div class="typing-dots">
      <span></span>
      <span></span>
      <span></span>
    </div>
  `;
  messagesBox.appendChild(bubble);
  scrollToBottom();
}

function removeTypingIndicator() {
  const indicator = document.getElementById('typing-indicator');
  if (indicator) indicator.remove();
}

function scrollToBottom() {
  const messagesBox = document.getElementById('chatbot-messages');
  if (messagesBox) {
    messagesBox.scrollTop = messagesBox.scrollHeight;
  }
}

// Bot knowledge responses routing table
function getBotResponse(text) {
  const clean = text.toLowerCase();
  
  if (clean.includes('fake') && clean.includes('why')) {
    return "Articles are flagged as FAKE due to key NLP factors: clickbait sensationalism in headlines, high density of extremely negative or emotive phrasing, unverified/anonymous hosting domains, and discrepancies in Named Entities when compared to trusted records.";
  }
  
  if (clean.includes('confidence') || clean.includes('score')) {
    return "Model Confidence matches classification weight. It measures similarity to verified real articles vs. sensationalized hoaxes in our ML databases. High scores mean deep thematic matches to either side.";
  }
  
  if (clean.includes('how does') || clean.includes('work') || clean.includes('detection')) {
    return "Veritas runs standard TF-IDF text vectorizers combined with Logistic Regression classifiers. It concurrently extracts sentiment metrics, runs Named Entity Chunking (NER) to locate persons/orgs, and runs credibility lookup algorithms against domain trust registries.";
  }

  if (clean.includes('save') || clean.includes('report') || clean.includes('bookmark')) {
    return "To save any analysis, click 'Save Analysis Report' on the results dashboard. It stores the metrics locally in your Personal Profile Dashboard under 'Saved Reports' where you can inspect them anytime.";
  }

  if (clean.includes('hello') || clean.includes('hi')) {
    return "Hello! I can answer questions about classification scores, language sentiment analysis, keyword weights, or saving reports. What would you like to know?";
  }

  // Fallback default answer
  return "I understand. Veritas is trained on text classification patterns. Try asking: 'Why is this article fake?', 'How does news detection work?', or 'Explain confidence score'.";
}
