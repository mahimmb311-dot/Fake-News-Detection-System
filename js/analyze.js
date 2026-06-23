/* ============================================
   ANALYSIS SUBMISSION AND ENGINE SIMULATION
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  // Tab Switcher logic
  const tabButtons = document.querySelectorAll('.analyze-tabs .tab');
  const tabContents = document.querySelectorAll('.tab-content');

  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      const tabTarget = button.getAttribute('data-tab');
      
      // Update button classes
      tabButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');

      // Update content panels
      tabContents.forEach(content => {
        if (content.id === `${tabTarget}-tab`) {
          content.classList.add('active');
        } else {
          content.classList.remove('active');
        }
      });

      // Show/hide sidebar panel based on active tab
      const sideNotePanel = document.getElementById('side-note-panel');
      if (sideNotePanel) {
        if (tabTarget === 'title') {
          sideNotePanel.classList.add('active');
        } else {
          sideNotePanel.classList.remove('active');
        }
      }
    });
  });

  // TextArea characters length tracker
  const textInput = document.getElementById('analyze-text-input');
  const charCounter = document.getElementById('char-count');
  
  if (textInput && charCounter) {
    textInput.addEventListener('input', () => {
      const len = textInput.value.length;
      charCounter.innerText = `${len} characters`;
      
      if (len > 8000) {
        charCounter.className = 'count danger';
      } else if (len > 5000) {
        charCounter.className = 'count warning';
      } else {
        charCounter.className = 'count';
      }
    });
  }

  // Title Input automatic live pre-analysis
  const titleInput = document.getElementById('analyze-title-input');
  const sideNotePanel = document.getElementById('side-note-panel');
  const sideNoteBody = document.getElementById('side-note-body');
  const sideNoteStatus = document.getElementById('side-note-status');
  let titleTimeout = null;

  if (titleInput) {
    titleInput.addEventListener('input', () => {
      const titleText = titleInput.value.trim();

      if (titleText.length < 5) {
        if (sideNoteStatus) {
          sideNoteStatus.innerText = 'Waiting';
          sideNoteStatus.className = 'badge badge-neutral';
        }
        if (sideNoteBody) {
          sideNoteBody.innerHTML = `<p class="text-secondary text-sm" style="line-height: 1.6;">Start typing a news title on the left. Veritas AI will analyze it in real-time and display a preview of its credibility markers here.</p>`;
        }
        return;
      }

      if (sideNoteStatus) {
        sideNoteStatus.innerText = 'Typing...';
        sideNoteStatus.className = 'badge badge-warning';
      }

      // Debounce simulation
      clearTimeout(titleTimeout);
      titleTimeout = setTimeout(() => {
        runSideNoteAnalysis(titleText);
      }, 800);
    });
  }
});

// Trigger primary analysis
window.startAnalysis = function(type) {
  let content = '';
  let source = '';

  if (type === 'text') {
    const textInput = document.getElementById('analyze-text-input');
    content = textInput.value.trim();
    source = 'Text Input';
    
    if (content.length < 50) {
      Toast.show('Input Too Short', 'Please paste at least 50 characters of a news article to analyze.', 'warning');
      return;
    }
  } else if (type === 'url') {
    const urlInput = document.getElementById('analyze-url-input');
    content = urlInput.value.trim();
    source = content;

    // URL validations
    if (!content.startsWith('http://') && !content.startsWith('https://')) {
      Toast.show('Invalid URL', 'Please enter a valid website URL starting with http:// or https://', 'error');
      return;
    }
  } else {
    const titleInput = document.getElementById('analyze-title-input');
    content = titleInput.value.trim();
    source = 'Title Input';

    if (content.length < 5) {
      Toast.show('Input Too Short', 'Please enter at least 5 characters for the article title.', 'warning');
      return;
    }
  }

  // Hide inputs, show analysis step runner
  const inputPanel = document.getElementById('analysis-input-panel');
  const loadingPanel = document.getElementById('analysis-loading-panel');

  if (inputPanel && loadingPanel) {
    inputPanel.classList.add('hidden');
    loadingPanel.classList.add('active');
  }

  // Run Simulated Step-by-Step AI Engine Loading States
  const steps = document.querySelectorAll('.loading-step');
  let currentStep = 0;

  function processNextStep() {
    if (currentStep > 0) {
      steps[currentStep - 1].classList.remove('active');
      steps[currentStep - 1].classList.add('completed');
    }
    
    if (currentStep < steps.length) {
      steps[currentStep].classList.add('active');
      currentStep++;
      setTimeout(processNextStep, 50);
    } else {
      // Completed all mock analysis steps, build results database entity
      const selectedLang = document.getElementById('language-select') ? document.getElementById('language-select').value : 'en';
      generateAnalysisResult(content, type, selectedLang);
    }
  }

  // Kickoff step sequence
  setTimeout(processNextStep, 50);
};

// Paste quick examples
window.pasteExample = function(verdict) {
  const textInput = document.getElementById('analyze-text-input');
  if (!textInput) return;

  if (verdict === 'real') {
    textInput.value = `Scientists at NASA have officially discovered a new planet orbiting within the habitable zone of a neighboring star Kepler-186f. Using advanced spectrographic analysis from the James Webb telescope, researchers confirmed the atmospheric content includes oxygen and trace greenhouse gases necessary to support liquid water on the surface. The study was published in the Science Journal peer-reviewed publication this week.`;
  } else {
    textInput.value = `⚠️ BREAKING EXCLUSIVE NEWS! You won't believe what happened! A high-ranking government official leaked secret papers showing they are planning to completely ban all fresh vegetables and fruits by next month! They want everyone eating their synthetic lab-grown chemically modified nutrients instead. Repost this immediately to warn your friends before it gets censored from the web!`;
  }

  // Trigger character update event manually
  const event = new Event('input');
  textInput.dispatchEvent(event);
  Toast.show('Template Copied', 'Example text pasted in editor.', 'info');
};

// Heuristic to dynamically extract Persons, Organizations, and Locations from the text
function extractEntitiesHeuristics(text) {
  const lower = text.toLowerCase();
  const persons = [];
  const orgs = [];
  const locations = [];

  // 1. Direct key matches for standard mock data or common inputs
  if (lower.includes('nasa')) orgs.push('NASA');
  if (lower.includes('esa')) orgs.push('ESA');
  if (lower.includes('fda')) orgs.push('FDA');
  if (lower.includes('james webb')) persons.push('James Webb');
  if (lower.includes('helen vance')) persons.push('Dr. Helen Vance');
  if (lower.includes('smith')) persons.push('Minister Smith');
  if (lower.includes('kepler')) locations.push('Kepler-186f');
  if (lower.includes('earth')) locations.push('Earth');
  if (lower.includes('washington')) locations.push('Washington');

  // 2. Scan capitalized words to extract others
  const words = text.match(/\b[A-Z][a-zA-Z]+\b/g) || [];
  const stopwords = new Set([
    'The', 'A', 'An', 'In', 'On', 'At', 'To', 'For', 'With', 'By', 'And', 'But', 'Or', 'As', 'If', 
    'This', 'That', 'It', 'We', 'They', 'He', 'She', 'You', 'I', 'NASA', 'ESA', 'FDA', 'James', 
    'Webb', 'Helen', 'Vance', 'Kepler', 'Earth', 'Washington', 'Minister', 'Smith', 'Dr', 'Mr', 'Mrs'
  ]);

  words.forEach(word => {
    if (stopwords.has(word) || word.length < 3) return;
    // Categorize very simply based on word endings or lengths
    if (word.endsWith('son') || word.endsWith('er') || word.endsWith('en')) {
      if (!persons.includes(word) && persons.length < 3) persons.push(word);
    } else if (word.endsWith('corp') || word.endsWith('org') || word.endsWith('inc') || word.endsWith('center')) {
      if (!orgs.includes(word) && orgs.length < 3) orgs.push(word);
    } else {
      if (!locations.includes(word) && locations.length < 3) locations.push(word);
    }
  });

  // Fallbacks if lists are empty
  if (persons.length === 0) persons.push('Independent Journalist');
  if (orgs.length === 0) orgs.push('News Press Network');
  if (locations.length === 0) locations.push('Global Reference');

  return { persons, orgs, locations };
}

// Heuristic to dynamically extract keywords by counting word frequencies (minus common stopwords)
function extractKeywordsHeuristics(text) {
  const words = text.toLowerCase()
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"']/g, "")
    .split(/\s+/);
  
  const stopwords = new Set([
    'the', 'a', 'an', 'and', 'but', 'or', 'as', 'if', 'this', 'that', 'it', 'to', 'for', 'in', 'on', 'at', 'with', 
    'by', 'from', 'of', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'not', 
    'we', 'they', 'he', 'she', 'you', 'i', 'will', 'would', 'can', 'could', 'should', 'more', 'about', 'other', 
    'some', 'their', 'them', 'his', 'her', 'its', 'this', 'that', 'these', 'those', 'also', 'very', 'just', 'out'
  ]);
  
  const counts = {};
  words.forEach(w => {
    if (w.length < 4 || stopwords.has(w)) return;
    counts[w] = (counts[w] || 0) + 1;
  });
  
  const sorted = Object.keys(counts).sort((a, b) => counts[b] - counts[a]);
  const result = sorted.slice(0, 5);
  
  if (result.length === 0) {
    return ['analysis', 'credibility', 'veracity', 'facts', 'nlp'];
  }
  return result;
}

// Generate dynamic context-relevant reasons
function generateDynamicReasons(text, isFake, clickbaitScore) {
  const reasons = [];
  const lower = text.toLowerCase();
  
  if (isFake) {
    if (clickbaitScore > 65) {
      reasons.push('Sensationalist or clickbait phrasing detected in headlines.');
    }
    if (lower.includes('!') || lower.includes('breaking') || lower.includes('warning')) {
      reasons.push('Contains highly emotional exclamation tags or urgent warnings.');
    }
    reasons.push('Failed verification checks against trusted database registries.');
    reasons.push('Unsubstantiated claims without authoritative official references.');
  } else {
    reasons.push('Objective, non-emotive language with high statement coherence.');
    reasons.push('Corroborated by verified entity registries and domain host records.');
    reasons.push('Proper citations aligning with scientific or primary journalistic logs.');
  }
  
  return reasons.slice(0, 3);
}

// Generate dynamic, context-appropriate summary based on actual lead sentences
function generateDynamicSummary(text, isFake) {
  const sentences = text.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 10);
  if (sentences.length === 0) {
    return isFake ? "This article contains unsubstantiated assertions." : "This article presents factual observations.";
  }
  
  const leadSentences = sentences.slice(0, 2).join('. ') + '.';
  if (isFake) {
    return `Potential credibility issue: "${leadSentences}" The text utilizes sensationalist phrasing, lacks authoritative sources, and displays high emotive bias characteristic of unverified reports.`;
  } else {
    return `Factual summary: "${leadSentences}" The text maintains an objective tone and references verifiable events/data consistent with reliable reporting.`;
  }
}

// Helper to generate claims truth statement breakdown dynamically
function generateClaimsBreakdown(content, verdict) {
  const sentences = content.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 12);
  if (sentences.length === 0) {
    sentences.push(content);
  }

  // To prevent too many items, limit to 4 statements
  const selectedSentences = sentences.slice(0, 4);

  return selectedSentences.map((sentence, index) => {
    let status = 'TRUE';
    let explanation = '';
    const lower = sentence.toLowerCase();

    if (verdict === 'FAKE') {
      if (lower.includes('ban') || lower.includes('government') || lower.includes('official') || lower.includes('law') || lower.includes('bill')) {
        status = 'FALSE';
        explanation = `The assertion regarding official legislative bans lacks backing. No primary source verifies this regulation.`;
      } else if (lower.includes('secret') || lower.includes('leak') || lower.includes('hidden') || lower.includes('underground')) {
        status = 'FALSE';
        explanation = `Conspiracy keywords detected. The claim of a "secret" leak is unsubstantiated and lacks credible metadata.`;
      } else if (lower.includes('synthetic') || lower.includes('chemical') || lower.includes('modified') || lower.includes('lab-grown')) {
        status = 'FALSE';
        explanation = `Scientific claims regarding artificial/chemical modifications are uncorroborated by agricultural or food safety datasets.`;
      } else if (lower.includes('shocking') || lower.includes('exclusive') || lower.includes('won\'t believe') || lower.includes('!') || lower.includes('repost')) {
        status = 'FALSE';
        explanation = `Sensational call-to-action or clickbait phrasing is used to stimulate emotional response and rapid sharing.`;
      } else {
        status = index % 2 === 0 ? 'NEUTRAL' : 'FALSE';
        explanation = status === 'NEUTRAL' 
          ? `Introductory or context-setting sentence. Does not contain explicit fake assertions, but lacks primary citation.`
          : `Unverified claim. No peer-reviewed journals or official regulatory indexes corroborate this statement.`;
      }
    } else {
      // Verdict is REAL
      if (lower.includes('nasa') || lower.includes('planet') || lower.includes('kepler') || lower.includes('space') || lower.includes('telescope') || lower.includes('orbit')) {
        status = 'TRUE';
        explanation = `Corroborated by NASA exoplanet archive registries and astrophysics publication logs.`;
      } else if (lower.includes('study') || lower.includes('journal') || lower.includes('research') || lower.includes('data') || lower.includes('analyst')) {
        status = 'TRUE';
        explanation = `Supported by scientific datasets published in peer-reviewed scientific reviews.`;
      } else if (lower.includes('business') || lower.includes('economic') || lower.includes('productivity') || lower.includes('remote') || lower.includes('work')) {
        status = 'TRUE';
        explanation = `Matches verified global economic reports and workplace index statistics.`;
      } else {
        status = 'TRUE';
        explanation = `Consistent with professional journalistic standards and objective reporting conventions.`;
      }
    }

    return {
      text: sentence + '.',
      status: status,
      explanation: explanation
    };
  });
}

// Simulated AI NLP Analysis Model Output Generation
function generateAnalysisResult(inputSource, type, language) {
  const isFakeNews = inputSource.toLowerCase().includes('breaking exclusive') || 
                     inputSource.toLowerCase().includes('ban all vegetables') || 
                     inputSource.toLowerCase().includes('you won\'t believe') ||
                     inputSource.toLowerCase().includes('synthetic lab-grown') ||
                     (type === 'url' && inputSource.includes('fakenewsalert.net')) ||
                     (Math.random() < 0.5); // Fallback random toggle if custom text

  const currentUserId = AppState.getCurrentUser() ? AppState.getCurrentUser().username : 'guest';
  const analysisId = Date.now().toString();

  // Populate realistic article content for URL and Title inputs
  let fullBody = inputSource;
  if (type === 'url') {
    if (inputSource.toLowerCase().includes('nasa') || inputSource.toLowerCase().includes('planet') || inputSource.toLowerCase().includes('kepler')) {
      fullBody = `Scientists at NASA have officially discovered a new planet orbiting within the habitable zone of a neighboring star Kepler-186f. Using advanced spectrographic analysis from the James Webb telescope, researchers confirmed the atmospheric content includes oxygen and trace greenhouse gases necessary to support liquid water on the surface. The study was published in the Science Journal peer-reviewed publication this week.`;
    } else if (inputSource.toLowerCase().includes('vegetables') || inputSource.toLowerCase().includes('ban') || inputSource.toLowerCase().includes('government')) {
      fullBody = `BREAKING EXCLUSIVE NEWS! You won't believe what happened! A high-ranking government official leaked secret papers showing they are planning to completely ban all fresh vegetables and fruits by next month! They want everyone eating their synthetic lab-grown chemically modified nutrients instead. Repost this immediately to warn your friends before it gets censored from the web!`;
    } else {
      if (isFakeNews) {
        fullBody = `WARNING: Shocking secret papers have been leaked by inside whistleblowers! The global federation is planning to ban all private transportation starting next quarter. They want to force all citizens to use centralized electronic railways to track movement. This extreme directive is being hidden from the mainstream media, so please share this warning with everyone you know!`;
      } else {
        fullBody = `A new economic study conducted by the Global Research Center indicates that small businesses have experienced a 12% increase in productivity following the adoption of remote communication tools. Analysts reviewed data from over 5,000 firms and concluded that flexible hours combined with robust digital dashboards led to higher work satisfaction and lower overhead costs. The findings were published in the quarterly Journal of Business and Economics.`;
      }
    }
  } else if (type === 'title') {
    if (inputSource.toLowerCase().includes('vegetables') || inputSource.toLowerCase().includes('ban') || inputSource.toLowerCase().includes('government')) {
      fullBody = `BREAKING EXCLUSIVE NEWS! You won't believe what happened! A high-ranking government official leaked secret papers showing they are planning to completely ban all fresh vegetables and fruits by next month! They want everyone eating their synthetic lab-grown chemically modified nutrients instead. Repost this immediately to warn your friends before it gets censored from the web!`;
    } else if (inputSource.toLowerCase().includes('nasa') || inputSource.toLowerCase().includes('planet') || inputSource.toLowerCase().includes('kepler')) {
      fullBody = `Scientists at NASA have officially discovered a new planet orbiting within the habitable zone of a neighboring star Kepler-186f. Using advanced spectrographic analysis from the James Webb telescope, researchers confirmed the atmospheric content includes oxygen and trace greenhouse gases necessary to support liquid water on the surface. The study was published in the Science Journal peer-reviewed publication this week.`;
    } else {
      if (isFakeNews) {
        fullBody = `BREAKING: Sensational reports are spreading regarding "${inputSource}". Inside sources claim that authorities have drafted secret documents to enforce this immediately. Witnesses claim that independent scientists warning about the consequences have had their statements deleted from the web. Share this post immediately to expose the truth!`;
      } else {
        fullBody = `Recent reports concerning "${inputSource}" have been verified by independent panels. Academic researchers published a comprehensive review analyzing the official documentation. The study confirms that the project adheres to standards and was evaluated under strict control parameters, showing measurable positive impacts for local communities.`;
      }
    }
  }

  // Generate metrics based on actual body content
  const clickbaitScore = isFakeNews ? Number((80 + Math.random() * 19).toFixed(0)) : Number((5 + Math.random() * 15).toFixed(0));
  const dynamicSummaryText = generateDynamicSummary(fullBody, isFakeNews);
  const dynamicEntities = extractEntitiesHeuristics(fullBody);
  const dynamicReasons = generateDynamicReasons(fullBody, isFakeNews, clickbaitScore);
  const dynamicKeywords = extractKeywordsHeuristics(fullBody);

  // Create highly detailed metrics
  let resultPayload = {
    id: analysisId,
    username: currentUserId,
    date: new Date().toISOString(),
    content: fullBody,
    originalInput: inputSource,
    title: type === 'text' 
      ? (inputSource.split('.').slice(0, 2).join('.') || 'Paste Article Analysis')
      : (type === 'title' ? inputSource : `Extracted news content from: ${inputSource.split('//')[1].split('/')[0]}`),
    verdict: isFakeNews ? 'FAKE' : 'REAL',
    confidence: isFakeNews ? Number((90 + Math.random() * 9).toFixed(1)) : Number((88 + Math.random() * 11).toFixed(1)),
    category: isFakeNews ? 'Politics' : 'Science',
    sentiment: isFakeNews 
      ? { positive: 8, neutral: 12, negative: 80 } 
      : { positive: 68, neutral: 22, negative: 10 },
    sourceScore: isFakeNews ? Number((10 + Math.random() * 25).toFixed(0)) : Number((85 + Math.random() * 14).toFixed(0)),
    clickbait: clickbaitScore,
    summary: dynamicSummaryText,
    entities: dynamicEntities,
    reasons: dynamicReasons,
    keywords: dynamicKeywords
  };

  // Generate statement-by-statement claim verification breakdown
  resultPayload.statements = generateClaimsBreakdown(resultPayload.content, resultPayload.verdict);

  // Push to local storage database
  const history = AppState.getHistory();
  history.unshift(resultPayload);
  AppState.setHistory(history);

  // Update user stats
  if (currentUserId !== 'guest') {
    const users = AppState.getUsers();
    const activeIndex = users.findIndex(u => u.username === currentUserId);
    if (activeIndex !== -1) {
      users[activeIndex].analysesCount = (users[activeIndex].analysesCount || 0) + 1;
      AppState.setUsers(users);
    }
  }

  // Dynamic system notification
  const notifications = AppState.getNotifications();
  notifications.unshift({
    id: Date.now().toString(),
    message: `New News Analysis Complete: classified as ${resultPayload.verdict} (${resultPayload.confidence}% confidence)`,
    time: 'Just now',
    read: false
  });
  AppState.setNotifications(notifications);

  // Redirect to results
  window.location.href = `result.html?id=${analysisId}&lang=${language}`;
}

// ============================================
// SPEECH RECOGNITION AND TITLE ANALYSIS
// ============================================

let recognition = null;
let isRecording = false;

window.toggleSpeechRecognition = function() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  
  if (!SpeechRecognition) {
    Toast.show('Feature Unsupported', 'Voice recognition is not supported in this browser. Please try Chrome or Edge.', 'error');
    return;
  }

  const micBtn = document.getElementById('mic-btn');
  const micIcon = document.getElementById('mic-icon');
  const micText = document.getElementById('mic-text');
  const textInput = document.getElementById('analyze-text-input');

  if (!recognition) {
    recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      isRecording = true;
      if (micBtn) micBtn.classList.add('btn-danger');
      if (micIcon) micIcon.innerText = '🛑';
      if (micText) micText.innerText = 'Listening...';
      Toast.show('Microphone Active', 'Listening to speech. Click stop when finished.', 'success');
    };

    recognition.onresult = (event) => {
      const transcript = event.results[event.results.length - 1][0].transcript;
      if (textInput) {
        textInput.value += (textInput.value ? ' ' : '') + transcript;
        // Trigger char count recalculation
        const triggerEvent = new Event('input');
        textInput.dispatchEvent(triggerEvent);
      }
    };

    recognition.onerror = (event) => {
      console.error(event.error);
      Toast.show('Speech Error', 'Could not capture audio: ' + event.error, 'error');
      stopRecognition();
    };

    recognition.onend = () => {
      stopRecognition();
    };
  }

  if (!isRecording) {
    recognition.start();
  } else {
    recognition.stop();
  }

  function stopRecognition() {
    isRecording = false;
    if (micBtn) micBtn.classList.remove('btn-danger');
    if (micIcon) micIcon.innerText = '🎙️';
    if (micText) micText.innerText = 'Voice Input';
  }
};

window.runSideNoteAnalysis = function(titleText) {
  const sideNoteBody = document.getElementById('side-note-body');
  const sideNoteStatus = document.getElementById('side-note-status');
  if (!sideNoteBody) return;

  const isFakeNews = titleText.toLowerCase().includes('breaking') || 
                     titleText.toLowerCase().includes('ban') || 
                     titleText.toLowerCase().includes('secret') ||
                     titleText.toLowerCase().includes('shocking') ||
                     titleText.toLowerCase().includes('you won\'t believe') ||
                     titleText.toLowerCase().includes('hoax') ||
                     (Math.random() < 0.5);

  const confidence = isFakeNews ? (85 + Math.random() * 10).toFixed(1) : (88 + Math.random() * 10).toFixed(1);
  const clickbait = isFakeNews ? (75 + Math.random() * 20).toFixed(0) : (5 + Math.random() * 15).toFixed(0);

  if (sideNoteStatus) {
    sideNoteStatus.innerText = isFakeNews ? 'Hoax Alert' : 'Verified';
    sideNoteStatus.className = isFakeNews ? 'badge badge-danger' : 'badge badge-success';
  }

  const mockContent = isFakeNews 
    ? `An analysis of the headline "${titleText}" suggests strong sensationalist markers. Clickbait rating is high (${clickbait}%), and writing style shows strong negative emotive bias.`
    : `The headline "${titleText}" displays professional journalistic structure. Clickbait rating is low (${clickbait}%), and entities reference verified databases.`;

  sideNoteBody.innerHTML = `
    <div style="margin-bottom: var(--space-4);">
      <div style="font-size: 0.85rem; color: var(--text-tertiary); margin-bottom: 2px;">Subject Focus</div>
      <div class="font-medium text-sm" style="color: var(--text-primary); font-weight: 500;">${titleText}</div>
    </div>
    
    <div style="margin-bottom: var(--space-4);">
      <div style="font-size: 0.85rem; color: var(--text-tertiary); margin-bottom: var(--space-1);">Verdict Preview</div>
      <div style="display: flex; align-items: center; gap: 8px;">
        <span style="font-size: 1rem; font-weight: bold; color: ${isFakeNews ? 'var(--danger-400)' : 'var(--success-400)'};">
          ${isFakeNews ? '🚨 FAKE PREDICTION' : '🛡️ REAL PREDICTION'}
        </span>
        <span style="font-size: 0.8rem; color: var(--text-secondary);">(${confidence}%)</span>
      </div>
    </div>

    <div style="margin-bottom: var(--space-4);">
      <div style="font-size: 0.85rem; color: var(--text-tertiary); margin-bottom: var(--space-1);">Clickbait Check</div>
      <div style="display: flex; align-items: center; gap: 8px;">
        <div style="flex: 1; height: 6px; background: var(--border-primary); border-radius: 3px; overflow: hidden;">
          <div style="width: ${clickbait}%; height: 100%; background: ${clickbait > 50 ? 'var(--danger-400)' : 'var(--success-400)'};"></div>
        </div>
        <span style="font-size: 0.8rem; font-weight: 600; color: var(--text-secondary);">${clickbait}%</span>
      </div>
    </div>

    <div style="margin-bottom: var(--space-6);">
      <div style="font-size: 0.85rem; color: var(--text-tertiary); margin-bottom: 2px;">Side Note Summary</div>
      <p class="text-secondary text-xs" style="line-height: 1.5;">${mockContent}</p>
    </div>

    <button class="btn btn-primary btn-sm w-full" onclick="startTitleAnalysis('${titleText.replace(/'/g, "\\'")}', ${isFakeNews})">
      See Full Analysis ➔
    </button>
  `;
};

window.startTitleAnalysis = function(titleText, isFake) {
  const selectedLang = document.getElementById('language-select') ? document.getElementById('language-select').value : 'en';
  
  const inputPanel = document.getElementById('analysis-input-panel');
  const loadingPanel = document.getElementById('analysis-loading-panel');

  if (inputPanel && loadingPanel) {
    inputPanel.classList.add('hidden');
    loadingPanel.classList.add('active');
  }

  setTimeout(() => {
    generateAnalysisResult(titleText, 'title', selectedLang);
  }, 1500);
};
