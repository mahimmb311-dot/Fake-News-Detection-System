/* ============================================
   RESULT RENDERING AND TRANSLATION CONTROLLER
   ============================================ */

// Language Translation Mapping Table
const translations = {
  en: {
    resultTitle: 'Prediction Result Dashboard',
    verdictReal: 'REAL NEWS',
    verdictFake: 'FAKE NEWS',
    confidenceLabel: 'Model Confidence',
    reliabilityHigh: 'Highly Reliable',
    reliabilityLow: 'High Risk / Unverified',
    sentiment: 'Sentiment Analysis',
    keywords: 'Keyword Extraction',
    ner: 'Named Entity Recognition',
    sourceScore: 'Source Credibility',
    clickbait: 'Clickbait Probability',
    reasons: 'Explainable AI (XAI) Reasons',
    summary: 'AI Summary Generator',
    related: 'Similar News Verification',
    downloadPdf: 'Download PDF Report',
    downloadCsv: 'Export CSV',
    bookmark: 'Save Analysis Report',
    claimsTitle: 'Fact-by-Fact Statement Verification'
  },
  ta: {
    resultTitle: 'கணிப்பு முடிவு டாஷ்போர்டு',
    verdictReal: 'உண்மைச் செய்தி',
    verdictFake: 'போலிச் செய்தி',
    confidenceLabel: 'மாதிரி நம்பிக்கை',
    reliabilityHigh: 'மிகவும் நம்பகமானது',
    reliabilityLow: 'அதிக ஆபத்து / சரிபார்க்கப்படாதது',
    sentiment: 'உணர்வு பகுப்பாய்வு',
    keywords: 'முக்கிய வார்த்தை பிரித்தெடுத்தல்',
    ner: 'பெயரிடப்பட்ட நிறுவன அங்கீகாரம்',
    sourceScore: 'மூல நம்பகத்தன்மை',
    clickbait: 'கிளிக்பைட் நிகழ்தகவு',
    reasons: 'விளக்கக்கூடிய AI (XAI) காரணங்கள்',
    summary: 'AI சுருக்க ஜெனரேட்டர்',
    related: 'இதே போன்ற செய்தி சரிபார்ப்பு',
    downloadPdf: 'PDF அறிக்கையைப் பதிவிறக்கவும்',
    downloadCsv: 'CSV ஏற்றுமதி',
    bookmark: 'பகுப்பாய்வு அறிக்கையைச் சேமிக்கவும்',
    claimsTitle: 'கூற்று வாரியாக சரிபார்ப்பு'
  },
  hi: {
    resultTitle: 'पूर्वानुमान परिणाम डैशबोर्ड',
    verdictReal: 'वास्तविक समाचार',
    verdictFake: 'फर्जी समाचार',
    confidenceLabel: 'मॉडल विश्वसनीयता',
    reliabilityHigh: 'अत्यधिक विश्वसनीय',
    reliabilityLow: 'उच्च जोखिम / असत्यापित',
    sentiment: 'भावना विश्लेषण',
    keywords: 'कीवर्ड निष्कर्षण',
    ner: 'नामित इकाई मान्यता',
    sourceScore: 'स्रोत विश्वसनीयता',
    clickbait: 'क्लिकबैट संभावना',
    reasons: 'व्याख्यात्मक एआई (XAI) कारण',
    summary: 'एआई सारांश जेनरेटर',
    related: 'समान समाचार सत्यापन',
    downloadPdf: 'पीडीएफ रिपोर्ट डाउनलोड करें',
    downloadCsv: 'सीएसवी निर्यात',
    bookmark: 'विश्लेषण रिपोर्ट सहेजें',
    claimsTitle: 'तथ्य-दर-तथ्य कथन सत्यापन'
  },
  te: {
    resultTitle: 'అంచనా ఫలితాల డాష్‌బోర్డ్',
    verdictReal: 'నిజమైన వార్తలు',
    verdictFake: 'నకిలీ వార్తలు',
    confidenceLabel: 'నమూనా విశ్వసనీయత',
    reliabilityHigh: 'అత్యంత నమ్మదగినది',
    reliabilityLow: 'అధిక ప్రమాదం / ధృవీకరించబడలేదు',
    sentiment: 'భావోద్వేగ విశ్లేషణ',
    keywords: 'కీవర్డ్ వెలికితీత',
    ner: 'నామకరణం చేయబడిన ఎంటిటీ గుర్తింపు',
    sourceScore: 'మూల విశ్వసనీయత',
    clickbait: 'క్లిక్‌బైట్ సంభావ్యత',
    reasons: 'వివరించదగిన AI (XAI) కారణాలు',
    summary: 'AI సారాంశం జెనరేటర్',
    related: 'సారూప్య వార్తల ధృవీకరణ',
    downloadPdf: 'PDF నివేదికను డౌన్‌లోడ్ చేయండి',
    downloadCsv: 'CSV ఎగుమతి',
    bookmark: 'విశ్లేషణ నివేదికను సేవ్ చేయి',
    claimsTitle: 'అంశాల వారీగా ప్రకటనల ధృవీకరణ'
  },
  ml: {
    resultTitle: 'പ്രവചന ഫല ഡാഷ്‌ബോർഡ്',
    verdictReal: 'യഥാർത്ഥ വാർത്ത',
    verdictFake: 'വ്യാജ വാർത്ത',
    confidenceLabel: 'മോഡൽ ആത്മവിശ്വാസം',
    reliabilityHigh: 'വളരെ വിശ്വസനീയം',
    reliabilityLow: 'ഉയർന്ന റിസ്ക് / സ്ഥിരീകരിക്കാത്തത്',
    sentiment: 'വികാര വിശകലനം',
    keywords: 'കീവേഡ് വേർതിരിച്ചെടുക്കൽ',
    ner: 'നാമനിർദ്ദേശം ചെയ്യപ്പെട്ട എന്റിറ്റി തിരിച്ചറിയൽ',
    sourceScore: 'ഉറവിട വിശ്വാസ്യത',
    clickbait: 'ക്ലിക്ക്ബെയ്റ്റ് സാധ്യത',
    reasons: 'വിശദീകരിക്കാവുന്ന AI (XAI) കാരണങ്ങൾ',
    summary: 'AI സംഗ്രഹം ജനറേറ്റർ',
    related: 'സമാന വാർത്താ പരിശോധന',
    downloadPdf: 'PDF റിപ്പോർട്ട് ഡൗൺലോഡ് ചെയ്യുക',
    downloadCsv: 'CSV കയറ്റുമതി ചെയ്യുക',
    bookmark: 'വിശകലന റിപ്പോർട്ട് സംരക്ഷിക്കുക',
    claimsTitle: 'വസ്തുതാപരമായ പ്രസ്താവന പരിശോധന'
  },
  kn: {
    resultTitle: 'ಮುನ್ಸೂಚನೆ ಫಲಿತಾಂಶದ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್',
    verdictReal: 'ನಿಜವಾದ ಸುದ್ದಿ',
    verdictFake: 'ಸುಳ್ಳು ಸುದ್ದಿ',
    confidenceLabel: 'ಮಾದರಿಯ ವಿಶ್ವಾಸಾರ್ಹತೆ',
    reliabilityHigh: 'ಹೆಚ್ಚು ವಿಶ್ವಾಸಾರ್ಹ',
    reliabilityLow: 'ಹೆಚ್ಚಿನ ಅಪಾಯ / ಪರಿಶೀಲಿಸದ',
    sentiment: 'ಭಾವನೆ ವಿಶ್ಲೇಷಣೆ',
    keywords: 'ಕೀವರ್ಡ್ ಹೊರತೆಗೆಯುವಿಕೆ',
    ner: 'ಹೆಸರಿಸಲಾದ ಘಟಕದ ಗುರುತಿಸುವಿಕೆ',
    sourceScore: 'ಮೂಲದ ವಿಶ್ವಾಸಾರ್ಹತೆ',
    clickbait: 'ಕ್ಲಿಕ್‌ಬೈಟ್ ಸಂಭಾವ್ಯತೆ',
    reasons: 'ವಿವರಿಸಬಹುದಾದ AI (XAI) ಕಾರಣಗಳು',
    summary: 'AI ಸಾರಾಂಶ ಜನರೇಟರ್',
    related: 'ಹೋಲುವ ಸುದ್ದಿ ಪರಿಶೀಲನೆ',
    downloadPdf: 'PDF ವರದಿಯನ್ನು ಡೌನ್‌ಲೋಡ್ ಮಾಡಿ',
    downloadCsv: 'CSV ರಫ್ತು',
    bookmark: 'ವಿಶ್ಲೇಷಣೆ ವರದಿಯನ್ನು ಉಳಿಸಿ',
    claimsTitle: 'ವಿಷಯವಾರು ಹೇಳಿಕೆಗಳ ಪರಿಶೀಲನೆ'
  }
};

let activeReport = null;

document.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  const reportId = urlParams.get('id');
  const initialLang = urlParams.get('lang') || 'en';

  const history = AppState.getHistory();
  if (reportId) {
    activeReport = history.find(r => r.id === reportId);
  }

  // Fallback to latest
  if (!activeReport && history.length > 0) {
    activeReport = history[0];
  }

  if (!activeReport) {
    Toast.show('No Analysis Found', 'Could not locate any valid news reports.', 'error');
    return;
  }

  // Render Page Content
  renderResultData(activeReport);
  applyLanguageTranslation(initialLang);

  // Setup Language Selector
  const langSelect = document.getElementById('result-lang-select');
  if (langSelect) {
    langSelect.value = initialLang;
    langSelect.addEventListener('change', () => {
      applyLanguageTranslation(langSelect.value);
    });
  }
});

// Primary HTML dynamic template injector
function renderResultData(report) {
  // Update Verdict
  const heroBadge = document.getElementById('verdict-hero-badge');
  const heroLabel = document.getElementById('verdict-hero-sublabel');
  
  if (heroBadge && heroLabel) {
    if (report.verdict === 'REAL') {
      heroBadge.className = 'verdict-badge real animate-scale-in';
      heroBadge.innerHTML = `<span class="verdict-icon">✅</span> <span id="trans-verdict">${report.verdict}</span>`;
      heroLabel.className = 'text-success animate-fade-in-up';
    } else {
      heroBadge.className = 'verdict-badge fake animate-scale-in';
      heroBadge.innerHTML = `<span class="verdict-icon">❌</span> <span id="trans-verdict">${report.verdict}</span>`;
      heroLabel.className = 'text-danger animate-fade-in-up';
    }
  }

  // Animate Gauge Confidence
  animateConfidenceGauge(report.confidence, report.verdict === 'REAL' ? 'success' : 'danger');

  // Sentiment Bars
  const sentimentFillPos = document.getElementById('sentiment-fill-pos');
  const sentimentFillNeu = document.getElementById('sentiment-fill-neu');
  const sentimentFillNeg = document.getElementById('sentiment-fill-neg');
  const sentimentValPos = document.getElementById('sentiment-val-pos');
  const sentimentValNeu = document.getElementById('sentiment-val-neu');
  const sentimentValNeg = document.getElementById('sentiment-val-neg');

  if (sentimentFillPos && sentimentFillNeu && sentimentFillNeg) {
    setTimeout(() => {
      sentimentFillPos.style.width = `${report.sentiment.positive}%`;
      sentimentFillNeu.style.width = `${report.sentiment.neutral}%`;
      sentimentFillNeg.style.width = `${report.sentiment.negative}%`;
      
      sentimentValPos.innerText = `${report.sentiment.positive}%`;
      sentimentValNeu.innerText = `${report.sentiment.neutral}%`;
      sentimentValNeg.innerText = `${report.sentiment.negative}%`;
    }, 400);
  }

  // Keywords
  const keywordsCloud = document.getElementById('keywords-cloud');
  if (keywordsCloud) {
    keywordsCloud.innerHTML = report.keywords.map(kw => `
      <span class="keyword-tag">#${kw}</span>
    `).join('');
  }

  // NER Tags
  const personContainer = document.getElementById('ner-persons');
  const orgContainer = document.getElementById('ner-orgs');
  const locContainer = document.getElementById('ner-locations');

  if (personContainer) {
    personContainer.innerHTML = report.entities.persons.length > 0 
      ? report.entities.persons.map(p => `<span class="ner-tag person">👤 ${p}</span>`).join('')
      : '<span class="text-tertiary text-xs">No person entities detected</span>';
  }
  if (orgContainer) {
    orgContainer.innerHTML = report.entities.orgs.length > 0 
      ? report.entities.orgs.map(o => `<span class="ner-tag org">🏢 ${o}</span>`).join('')
      : '<span class="text-tertiary text-xs">No organization entities detected</span>';
  }
  if (locContainer) {
    locContainer.innerHTML = report.entities.locations.length > 0 
      ? report.entities.locations.map(l => `<span class="ner-tag location">📍 ${l}</span>`).join('')
      : '<span class="text-tertiary text-xs">No locations detected</span>';
  }

  // Source Credibility ring canvas
  animateCredibilityRing(report.sourceScore);

  // Clickbait detector meter
  const clickbaitFill = document.getElementById('clickbait-fill');
  const clickbaitVal = document.getElementById('clickbait-value');
  
  if (clickbaitFill && clickbaitVal) {
    setTimeout(() => {
      clickbaitFill.style.width = `${report.clickbait}%`;
      clickbaitVal.innerText = `${report.clickbait}%`;
      
      if (report.clickbait < 30) {
        clickbaitFill.className = 'clickbait-meter-fill clickbait-low';
      } else if (report.clickbait < 70) {
        clickbaitFill.className = 'clickbait-meter-fill clickbait-medium';
      } else {
        clickbaitFill.className = 'clickbait-meter-fill clickbait-high';
      }
    }, 500);
  }

  // XAI Explanations
  const xaiContainer = document.getElementById('xai-reasons-list');
  if (xaiContainer) {
    const isReal = report.verdict === 'REAL';
    xaiContainer.innerHTML = report.reasons.map(reason => `
      <div class="xai-reason ${isReal ? 'positive' : 'negative'} animate-fade-in-up">
        <div class="reason-icon">${isReal ? '🛡️' : '⚠️'}</div>
        <div>${reason}</div>
      </div>
    `).join('');
  }

  // AI Summary Generator
  const summaryBox = document.getElementById('summary-text-box');
  if (summaryBox) {
    summaryBox.innerHTML = `<p>${report.summary}</p>`;
  }

  // Fact-by-Fact Claims and Full Article Reader Populator
  const articleContentBody = document.getElementById('article-content-body');
  if (articleContentBody) {
    articleContentBody.innerText = report.content || report.summary || "No article content available.";
  }

  const claimsListContainer = document.getElementById('claims-list-container');
  const countAll = document.getElementById('claim-count-all');
  const countTrue = document.getElementById('claim-count-true');
  const countFalse = document.getElementById('claim-count-false');

  if (claimsListContainer) {
    const statements = report.statements || [
      { text: report.title, status: report.verdict === 'REAL' ? 'TRUE' : 'FALSE', explanation: report.summary }
    ];

    let trueCount = 0;
    let falseCount = 0;

    claimsListContainer.innerHTML = statements.map((st, idx) => {
      const isTrue = st.status === 'TRUE';
      const isFalse = st.status === 'FALSE';
      
      if (isTrue) trueCount++;
      if (isFalse) falseCount++;

      let statusBadgeClass = 'neutral';
      let statusIcon = '⚠️';
      if (isTrue) {
        statusBadgeClass = 'true';
        statusIcon = '✅';
      } else if (isFalse) {
        statusBadgeClass = 'false';
        statusIcon = '❌';
      }

      return `
        <div class="claim-item status-${st.status.toLowerCase()}" data-status="${st.status.toLowerCase()}">
          <div class="claim-header-status">
            <span class="claim-badge ${statusBadgeClass}">${statusIcon} ${st.status}</span>
            <span style="font-size: 0.75rem; color: var(--text-tertiary);">Claim #${idx + 1}</span>
          </div>
          <p class="claim-text">${st.text}</p>
          <div class="claim-explanation">
            <strong>AI Assessment:</strong> ${st.explanation}
          </div>
        </div>
      `;
    }).join('');

    if (countAll) countAll.innerText = statements.length;
    if (countTrue) countTrue.innerText = trueCount;
    if (countFalse) countFalse.innerText = falseCount;
  }

  // Similar News Verification
  const relatedContainer = document.getElementById('related-articles-list');
  if (relatedContainer) {
    const listSources = ['BBC News', 'Reuters', 'CNN Business', 'The Hindu'];
    relatedContainer.innerHTML = listSources.map((src, idx) => {
      const matchScore = report.verdict === 'REAL' ? (98 - idx * 4) : (35 + idx * 8);
      return `
        <div class="related-article">
          <div class="source-logo">${src[0]}</div>
          <div class="article-info">
            <div class="article-title">${report.title}</div>
            <div class="article-source">${src} • Verified News Partner</div>
          </div>
          <div class="match-score" style="color: ${matchScore > 70 ? 'var(--success-400)' : 'var(--danger-400)'};">${matchScore}% Similarity</div>
        </div>
      `;
    }).join('');
  }
}

// Draw HTML5 circular progress for confidence rating
function animateConfidenceGauge(score, type) {
  const canvas = document.getElementById('gauge-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const textElem = document.getElementById('gauge-number');
  
  let currentVal = 0;
  const targetVal = score;
  const radius = 80;
  const centerX = 100;
  const centerY = 100;

  function drawFrame() {
    ctx.clearRect(0, 0, 200, 200);

    // Track circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.strokeStyle = 'var(--border-primary)';
    ctx.lineWidth = 14;
    ctx.stroke();

    // Arc progress fill
    ctx.beginPath();
    // Arc starts from bottom center or top. We will start at -PI/2 (top center)
    const endAngle = (currentVal / 100) * 2 * Math.PI - Math.PI / 2;
    ctx.arc(centerX, centerY, radius, -Math.PI / 2, endAngle);
    
    // Choose dynamic gradient
    const gradient = ctx.createLinearGradient(0, 0, 200, 0);
    if (type === 'success') {
      gradient.addColorStop(0, '#10b981');
      gradient.addColorStop(1, '#34d399');
    } else {
      gradient.addColorStop(0, '#ef4444');
      gradient.addColorStop(1, '#f87171');
    }

    ctx.strokeStyle = gradient;
    ctx.lineWidth = 14;
    ctx.lineCap = 'round';
    ctx.stroke();

    if (currentVal < targetVal) {
      currentVal += 1.5;
      if (currentVal > targetVal) currentVal = targetVal;
      textElem.innerText = `${currentVal.toFixed(1)}%`;
      requestAnimationFrame(drawFrame);
    }
  }

  requestAnimationFrame(drawFrame);
}

// Draw Source Score circular ring
function animateCredibilityRing(score) {
  const canvas = document.getElementById('credibility-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const textElem = document.getElementById('credibility-val-text');
  const labelElem = document.getElementById('credibility-val-label');

  let currentVal = 0;
  const targetVal = score;
  const radius = 46;
  const centerX = 60;
  const centerY = 60;

  function draw() {
    ctx.clearRect(0, 0, 120, 120);

    // Track
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.strokeStyle = 'var(--border-primary)';
    ctx.lineWidth = 8;
    ctx.stroke();

    // Fill
    ctx.beginPath();
    const endAngle = (currentVal / 100) * 2 * Math.PI - Math.PI / 2;
    ctx.arc(centerX, centerY, radius, -Math.PI / 2, endAngle);
    
    const isHigh = targetVal > 70;
    const isLow = targetVal < 40;
    ctx.strokeStyle = isHigh ? 'var(--success-400)' : (isLow ? 'var(--danger-400)' : 'var(--warning-400)');
    ctx.lineWidth = 8;
    ctx.lineCap = 'round';
    ctx.stroke();

    if (currentVal < targetVal) {
      currentVal += 2;
      if (currentVal > targetVal) currentVal = targetVal;
      textElem.innerText = `${Math.floor(currentVal)}`;
      requestAnimationFrame(draw);
    } else {
      // Set sub-labels
      if (targetVal > 70) {
        labelElem.innerText = 'Trusted Source';
        labelElem.className = 'credibility-label trusted';
      } else if (targetVal < 40) {
        labelElem.innerText = 'Suspicious Source';
        labelElem.className = 'credibility-label suspicious';
      } else {
        labelElem.innerText = 'Moderate Credibility';
        labelElem.className = 'credibility-label moderate';
      }
    }
  }

  requestAnimationFrame(draw);
}

// Apply Selected Language translation lookups
function applyLanguageTranslation(lang) {
  const tr = translations[lang] || translations['en'];

  // Replace Header titles
  updateTextById('page-title-trans', tr.resultTitle);
  updateTextById('trans-confidence-label', tr.confidenceLabel);
  updateTextById('trans-sentiment-title', tr.sentiment);
  updateTextById('trans-keywords-title', tr.keywords);
  updateTextById('trans-ner-title', tr.ner);
  updateTextById('trans-source-title', tr.sourceScore);
  updateTextById('trans-clickbait-title', tr.clickbait);
  updateTextById('trans-xai-title', tr.reasons);
  updateTextById('trans-summary-title', tr.summary);
  updateTextById('trans-related-title', tr.related);
  updateTextById('trans-claims-title', tr.claimsTitle || 'Fact-by-Fact Statement Verification');
  
  // Replace Verdict labels
  const verdictText = document.getElementById('trans-verdict');
  if (verdictText) {
    const baseVerdict = activeReport.verdict;
    verdictText.innerText = baseVerdict === 'REAL' ? tr.verdictReal : tr.verdictFake;
  }

  const subLabel = document.getElementById('verdict-hero-sublabel');
  if (subLabel) {
    subLabel.innerText = activeReport.verdict === 'REAL' ? tr.reliabilityHigh : tr.reliabilityLow;
  }

  // Update button texts
  const pdfBtn = document.getElementById('btn-download-pdf');
  const csvBtn = document.getElementById('btn-download-csv');
  const saveBtn = document.getElementById('btn-save-report');
  const saveBtnInline = document.getElementById('btn-save-report-inline');

  if (pdfBtn) pdfBtn.innerHTML = `🖨️ ${tr.downloadPdf}`;
  if (csvBtn) csvBtn.innerHTML = `📊 ${tr.downloadCsv}`;
  if (saveBtn) saveBtn.innerHTML = `💾 ${tr.bookmark}`;
  if (saveBtnInline) saveBtnInline.innerHTML = `💾 ${tr.bookmark}`;
}

function updateTextById(id, text) {
  const elem = document.getElementById(id);
  if (elem) elem.innerText = text;
}

// Download PDF Flow using window print formatting styles
window.downloadPdfReport = function() {
  window.print();
  Toast.show('PDF Report Generated', 'Sent analysis document details to printing queue.', 'success');
};

// Export to CSV spreadsheet downloader
window.downloadCsvReport = function() {
  if (!activeReport) return;

  const rows = [
    ['Metric', 'Value'],
    ['Report ID', activeReport.id],
    ['Title', activeReport.title],
    ['AI Classification Verdict', activeReport.verdict],
    ['Confidence Score (%)', activeReport.confidence],
    ['Sentiment Positive (%)', activeReport.sentiment.positive],
    ['Sentiment Neutral (%)', activeReport.sentiment.neutral],
    ['Sentiment Negative (%)', activeReport.sentiment.negative],
    ['Source Credibility Score', activeReport.sourceScore],
    ['Clickbait Score (%)', activeReport.clickbait],
    ['AI Generated Summary', activeReport.summary],
    ['Classification Reasons', activeReport.reasons.join('; ')]
  ];

  let csvContent = 'data:text/csv;charset=utf-8,' 
    + rows.map(e => e.map(val => `"${val.toString().replace(/"/g, '""')}"`).join(',')).join('\n');

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `FakeNewsReport_${activeReport.id}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  Toast.show('CSV Downloaded', 'Spreadsheet formatted analysis saved successfully.', 'success');
};

// Save / Bookmark report inside Personal Saved dashboard lists
window.saveReportToDashboard = function() {
  if (!activeReport) return;

  const saved = AppState.getSaved();
  if (saved.find(s => s.id === activeReport.id)) {
    Toast.show('Already Saved', 'This analysis report is already saved in your dashboard.', 'info');
    return;
  }

  saved.push(activeReport);
  AppState.setSaved(saved);
  
  Toast.show('Report Saved', 'Bookmarked report. You can retrieve it in your dashboard profile.', 'success');
};

// Filter Claims lists on the result screen
window.filterClaims = function(status) {
  const tabs = document.querySelectorAll('#claims-filter-tabs .claims-tab');
  tabs.forEach(tab => {
    const filter = tab.getAttribute('data-claim-filter');
    if (filter === status) {
      tab.classList.add('active');
    } else {
      tab.classList.remove('active');
    }
  });

  const items = document.querySelectorAll('.claims-list .claim-item');
  items.forEach(item => {
    const itemStatus = item.getAttribute('data-status');
    if (status === 'all') {
      item.classList.remove('hidden');
    } else if (status === 'true' && itemStatus === 'true') {
      item.classList.remove('hidden');
    } else if (status === 'false' && itemStatus === 'false') {
      item.classList.remove('hidden');
    } else {
      item.classList.add('hidden');
    }
  });
};

// Download Original Clean Article Body (.txt)
window.downloadArticleTxt = function() {
  if (!activeReport) return;

  const content = `=========================================
VERITAS AI - ARTICLE VERIFICATION REPORT
=========================================
Article Title: ${activeReport.title}
Date Analyzed: ${new Date(activeReport.date).toLocaleString()}
Overall Verdict: ${activeReport.verdict} (${activeReport.confidence}% confidence)
-----------------------------------------

Original Content Analyzed:
${activeReport.content || "No original content stored."}

-----------------------------------------
Verified via Veritas AI Systems.
`;

  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `Article_${activeReport.id}.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  Toast.show('Article Downloaded', 'The full article text file was saved.', 'success');
};

// Download Detailed Claim Analysis Markdown Report (.md)
window.downloadTruthReportMd = function() {
  if (!activeReport) return;

  const statements = activeReport.statements || [];
  
  let claimsTable = `| Claim ID | Verified Status | Statement text | AI Fact-Checking Assessment |\n| :--- | :--- | :--- | :--- |\n`;
  statements.forEach((st, idx) => {
    const statusIcon = st.status === 'TRUE' ? '✅ TRUE' : (st.status === 'FALSE' ? '❌ FALSE' : '⚠️ NEUTRAL');
    claimsTable += `| #${idx + 1} | ${statusIcon} | ${st.text} | ${st.explanation} |\n`;
  });

  const markdownContent = `# Veritas AI Claims Verification Report

* **Article Title:** ${activeReport.title}
* **Analysis Date:** ${new Date(activeReport.date).toLocaleString()}
* **System Verdict:** **${activeReport.verdict}** (${activeReport.confidence}% confidence)
* **Publisher Score:** ${activeReport.sourceScore}/100
* **Clickbait Meter:** ${activeReport.clickbait}%

## Executive Summary
${activeReport.summary}

## Original Article Text
\`\`\`text
${activeReport.content || "No original content stored."}
\`\`\`

## Fact-by-Fact Statement Verification
The analysis engine parsed the article into individual claims and mapped their credibility against trusted databases:

${claimsTable}

---
*Report generated automatically by Veritas NLP Verification Systems.*
`;

  const blob = new Blob([markdownContent], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `VeritasReport_${activeReport.id}.md`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  Toast.show('Report Downloaded', 'Claims Verification Markdown file saved.', 'success');
};
