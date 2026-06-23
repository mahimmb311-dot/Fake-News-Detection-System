/* ============================================
   CORE APPLICATION JS & STATE SIMULATION
   ============================================ */

// Safe storage wrapper to prevent crashes when localStorage/sessionStorage are disabled or under file:// security blocks
const safeStorage = {
  memoryStore: {},

  getItem(key, useSession = false) {
    try {
      const storage = useSession ? sessionStorage : localStorage;
      return storage.getItem(key);
    } catch (e) {
      console.warn("Storage access failed, using memory fallback:", e);
      return this.memoryStore[key] || null;
    }
  },

  setItem(key, value, useSession = false) {
    try {
      const storage = useSession ? sessionStorage : localStorage;
      storage.setItem(key, value);
    } catch (e) {
      console.warn("Storage access failed, using memory fallback:", e);
      this.memoryStore[key] = value;
    }
  },

  removeItem(key, useSession = false) {
    try {
      const storage = useSession ? sessionStorage : localStorage;
      storage.removeItem(key);
    } catch (e) {
      console.warn("Storage access failed, using memory fallback:", e);
      delete this.memoryStore[key];
    }
  }
};

// Initialize global state in localStorage if not exists
function initMockDatabase() {
  if (!safeStorage.getItem('fake_news_users')) {
    const defaultUsers = [
      {
        fullName: 'Demo User',
        username: 'demouser',
        email: 'user@example.com',
        mobile: '1234567890',
        password: 'password123',
        joinedDate: '2026-01-15',
        role: 'user',
        analysesCount: 12,
        accuracy: 91.5
      },
      {
        fullName: 'Admin User',
        username: 'admin',
        email: 'admin@example.com',
        mobile: '0987654321',
        password: 'adminpassword',
        joinedDate: '2025-11-01',
        role: 'admin',
        analysesCount: 0,
        accuracy: 100.0
      }
    ];
    safeStorage.setItem('fake_news_users', JSON.stringify(defaultUsers));
  }

  if (!safeStorage.getItem('fake_news_history')) {
    const defaultHistory = [
      {
        id: '1',
        username: 'demouser',
        date: '2026-06-14T10:30:00Z',
        title: 'NASA Discovers New Habitable Exoplanet in Nearby Solar System',
        verdict: 'REAL',
        confidence: 94.7,
        category: 'Science',
        sentiment: { positive: 65, neutral: 20, negative: 15 },
        sourceScore: 92,
        clickbait: 12,
        summary: 'Researchers using the James Webb Space Telescope have identified a new terrestrial exoplanet orbiting within the habitable zone of a red dwarf star just 22 light-years away.',
        entities: {
          persons: ['Dr. Helen Vance', 'James Webb'],
          orgs: ['NASA', 'ESA'],
          locations: ['Kepler-186f', 'Earth']
        },
        reasons: ['Trusted news source verified', 'Facts match peer-reviewed journals', 'Balanced, non-emotive language used'],
        keywords: ['NASA', 'exoplanet', 'habitable', 'discovery']
      },
      {
        id: '2',
        username: 'demouser',
        date: '2026-06-12T14:15:00Z',
        title: 'BREAKING: Government to Ban All Vegetables Starting Next Month!',
        verdict: 'FAKE',
        confidence: 97.2,
        category: 'Politics',
        sentiment: { positive: 10, neutral: 15, negative: 75 },
        sourceScore: 21,
        clickbait: 88,
        summary: 'A widely circulated social media post claims a secret bill was passed banning the trade and cultivation of vegetables in favor of lab-grown alternatives.',
        entities: {
          persons: ['President John'],
          orgs: ['FDA', 'Greenpeace'],
          locations: ['Washington']
        },
        reasons: ['Clickbait headline detected', 'Highly emotional language and exclamation marks', 'Unverified, anonymous source domain name'],
        keywords: ['government', 'ban', 'vegetables', 'breaking']
      }
    ];
    safeStorage.setItem('fake_news_history', JSON.stringify(defaultHistory));
  }

  if (!safeStorage.getItem('fake_news_saved')) {
    safeStorage.setItem('fake_news_saved', JSON.stringify([]));
  }

  if (!safeStorage.getItem('fake_news_notifications')) {
    safeStorage.setItem('fake_news_notifications', JSON.stringify([
      { id: '1', message: 'Welcome to the Fake News Detection System!', time: '1 day ago', read: false }
    ]));
  }
}

// Global App State Object
const AppState = {
  getUsers: () => JSON.parse(safeStorage.getItem('fake_news_users')),
  setUsers: (users) => safeStorage.setItem('fake_news_users', JSON.stringify(users)),

  getHistory: () => JSON.parse(safeStorage.getItem('fake_news_history')),
  setHistory: (history) => safeStorage.setItem('fake_news_history', JSON.stringify(history)),

  getSaved: () => JSON.parse(safeStorage.getItem('fake_news_saved')),
  setSaved: (saved) => safeStorage.setItem('fake_news_saved', JSON.stringify(saved)),

  getNotifications: () => JSON.parse(safeStorage.getItem('fake_news_notifications')),
  setNotifications: (notes) => safeStorage.setItem('fake_news_notifications', JSON.stringify(notes)),

  // Store current_user in localStorage to persist across pages on file:// protocol
  getCurrentUser: () => JSON.parse(safeStorage.getItem('current_user')),
  setCurrentUser: (user) => safeStorage.setItem('current_user', JSON.stringify(user)),
  logout: () => {
    safeStorage.removeItem('current_user');
    window.location.href = 'login.html';
  }
};

// Initialize Database immediately
initMockDatabase();

// Auth Guard: redirect to login if not logged in (except on login.html and signup.html)
function checkAuthGuard() {
  const currentUser = AppState.getCurrentUser();
  const path = window.location.pathname;
  const currentPage = path.split('/').pop() || 'index.html';
  
  if (!currentUser && currentPage !== 'login.html' && currentPage !== 'signup.html') {
    window.location.href = 'login.html';
  }
}
checkAuthGuard();

// Toast Notifications System
const Toast = {
  container: null,
  init() {
    this.container = document.createElement('div');
    this.container.className = 'toast-container';
    document.body.appendChild(this.container);
  },
  show(title, message, type = 'info', duration = 4000) {
    if (!this.container) this.init();

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    let icon = 'ℹ️';
    if (type === 'success') icon = '✅';
    if (type === 'error') icon = '❌';
    if (type === 'warning') icon = '⚠️';

    toast.innerHTML = `
      <div class="toast-icon">${icon}</div>
      <div class="toast-content">
        <div class="toast-title">${title}</div>
        <div class="toast-message">${message}</div>
      </div>
      <button class="toast-close">&times;</button>
    `;

    this.container.appendChild(toast);

    const closeBtn = toast.querySelector('.toast-close');
    closeBtn.addEventListener('click', () => {
      this.remove(toast);
    });

    setTimeout(() => {
      this.remove(toast);
    }, duration);
  },
  remove(toast) {
    toast.classList.add('removing');
    toast.addEventListener('animationend', () => {
      toast.remove();
    });
  }
};

// Theme Toggler Utility
function initTheme() {
  const currentTheme = safeStorage.getItem('theme') || 'dark';
  document.documentElement.setAttribute('data-theme', currentTheme);

  const themeToggleBtn = document.getElementById('theme-toggle');
  if (themeToggleBtn) {
    themeToggleBtn.innerHTML = currentTheme === 'light' ? '🌙' : '☀️';
    themeToggleBtn.addEventListener('click', () => {
      const activeTheme = document.documentElement.getAttribute('data-theme');
      const newTheme = activeTheme === 'light' ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', newTheme);
      safeStorage.setItem('theme', newTheme);
      themeToggleBtn.innerHTML = newTheme === 'light' ? '🌙' : '☀️';
    });
  }
}

// Setup Global Event Listeners & Navbar States
document.addEventListener('DOMContentLoaded', () => {
  initTheme();

  // Navbar Scrolled background modification
  const navbar = document.querySelector('.navbar');
  if (navbar) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    });
  }

  // Mobile Menu Switcher
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const navLinks = document.getElementById('nav-links');
  if (mobileMenuBtn && navLinks) {
    mobileMenuBtn.addEventListener('click', () => {
      navLinks.classList.toggle('open');
    });
  }

  // Render User Actions in Navigation Bar
  renderNavbarAuth();
});

// Updates the navigation buttons based on user session state
function renderNavbarAuth() {
  const navActions = document.getElementById('nav-actions');
  if (!navActions) return;

  const currentUser = AppState.getCurrentUser();

  if (currentUser) {
    // Inject logged in state
    navActions.innerHTML = `
      <div class="dropdown" id="user-dropdown">
        <div class="nav-user" onclick="toggleUserDropdown(event)">
          <div class="avatar">${currentUser.fullName.split(' ').map(n => n[0]).join('')}</div>
          <span class="user-name">${currentUser.fullName}</span>
        </div>
        <div class="dropdown-menu">
          <a class="dropdown-item" href="dashboard.html">📊 Personal Dashboard</a>
          <a class="dropdown-item" href="profile.html">👤 My Profile</a>
          ${currentUser.role === 'admin' ? '<a class="dropdown-item" href="admin.html">🛡️ Admin Control Panel</a>' : ''}
          <div class="dropdown-divider"></div>
          <button class="dropdown-item" onclick="AppState.logout()" style="color: var(--danger-400);">🚪 Logout Session</button>
        </div>
      </div>
      <button class="theme-toggle" id="theme-toggle">☀️</button>
    `;
  } else {
    // Inject logged out button defaults
    navActions.innerHTML = `
      <a class="btn btn-secondary btn-sm" href="login.html">Login</a>
      <a class="btn btn-primary btn-sm" href="signup.html">Get Started</a>
      <button class="theme-toggle" id="theme-toggle">☀️</button>
    `;
  }

  // Re-run theme icon setup for the new DOM button
  const currentTheme = safeStorage.getItem('theme') || 'dark';
  const themeToggleBtn = document.getElementById('theme-toggle');
  if (themeToggleBtn) {
    themeToggleBtn.innerHTML = currentTheme === 'light' ? '🌙' : '☀️';
    themeToggleBtn.addEventListener('click', () => {
      const activeTheme = document.documentElement.getAttribute('data-theme');
      const newTheme = activeTheme === 'light' ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', newTheme);
      safeStorage.setItem('theme', newTheme);
      themeToggleBtn.innerHTML = newTheme === 'light' ? '🌙' : '☀️';
    });
  }
}

function toggleUserDropdown(event) {
  event.stopPropagation();
  const dropdown = document.getElementById('user-dropdown');
  if (dropdown) dropdown.classList.toggle('open');
}

// Close dropdowns when clicking outside
window.addEventListener('click', () => {
  const dropdown = document.getElementById('user-dropdown');
  if (dropdown) dropdown.classList.remove('open');
});

// ============================================
// HOMEPAGE TRANSLATION DICTIONARY AND CONTROLLER
// ============================================

const homeTranslations = {
  en: {
    heroBadge: "✨ Advanced NLP Verification Engine",
    heroTitle: "Detect Truth in News Instantly with <span class=\"gradient-text\">Explainable AI</span>",
    heroDesc: "An intelligent SaaS suite extracting Named Entities, scoring source credibility, measuring headline clickbait thresholds, and flagging media misinformation using light, blazing fast local ML vectorizers.",
    btnAnalyze: "Analyze News Now 🚀",
    btnDashboard: "View Personal Dashboard",
    stat1: "Model Accuracy Rating",
    stat2: "Hoaxes Purged",
    stat3: "Analysis Speed Index",
    stat4: "Languages Supported",
    featBadge: "FEATURES",
    featTitle: "Full Suite NLP Processing Pipeline",
    featSubtitle: "Our algorithm decomposes news structures to expose manipulation techniques.",
    locBadge: "LOCALIZATION",
    locTitle: "Multi-Language Result Translations",
    locDesc: "Instantly translate verified verdicts, explainable reasons lists, summaries, and keyword chips into English, Tamil, Hindi, Telugu, Malayalam, and Kannada with a single click.",
    previewTitle: "✅ REAL NEWS",
    previewDesc: "\"உண்மைச் செய்தி • 94.7% மாதிரி நம்பிக்கை\"",
    previewBtn: "Test Localizer"
  },
  ta: {
    heroBadge: "✨ மேம்பட்ட NLP சரிபார்ப்பு இயந்திரம்",
    heroTitle: "<span class=\"gradient-text\">விளக்கக்கூடிய AI</span> உடன் செய்திகளின் உண்மையை உடனே கண்டறியவும்",
    heroDesc: "பெயரிடப்பட்ட நிறுவனங்களை பிரித்தெடுக்கும், மூல நம்பகத்தன்மையை மதிப்பிடும், தலைப்பு கிளிக்பைட் வரம்புகளை அளவிடும் மற்றும் உள்ளூர் ML வெக்டரைசர்களைப் பயன்படுத்தி ஊடக தவறான தகவல்களைக் குறிக்கும் ஒரு அறிவார்ந்த சாஸ் தொகுப்பு.",
    btnAnalyze: "செய்திகளை பகுப்பாய்வு செய் 🚀",
    btnDashboard: "தனிப்பட்ட டாஷ்போர்டு",
    stat1: "மாதிரி துல்லியம் மதிப்பீடு",
    stat2: "போலிகள் நீக்கப்பட்டன",
    stat3: "செயலாக்க வேகக் குறியீடு",
    stat4: "ஆதரிக்கப்படும் மொழிகள்",
    featBadge: "அம்சங்கள்",
    featTitle: "முழு நுகர்வு NLP செயலாக்க பைப்லைன்",
    featSubtitle: "செய்டி கையாளுதல் நுட்பங்களை அம்பலப்படுத்த எங்கள் அல்காரிதம் செய்தி கட்டமைப்புகளை சிதைக்கிறது.",
    locBadge: "மொழிபெயர்ப்பு",
    locTitle: "பல மொழி முடிவு மொழிபெயர்ப்புகள்",
    locDesc: "சரிபார்க்கப்பட்ட தீர்ப்புகள், விளக்கக்கூடிய காரணங்கள் மற்றும் முக்கிய வார்த்தைகளை தமிழ், ஆங்கிலம், இந்தி, தெலுங்கு, மலையாளம் மற்றும் கன்னடத்தில் ஒரே கிளிக்கில் மொழிபெயர்க்கவும்.",
    previewTitle: "✅ உண்மைச் செய்தி",
    previewDesc: "\"உண்மைச் செய்தி • 94.7% மாதிரி நம்பிக்கை\"",
    previewBtn: "மொழிபெயர்ப்பைச் சோதிக்கவும்"
  },
  hi: {
    heroBadge: "✨ उन्नत एनएलपी सत्यापन इंजन",
    heroTitle: "<span class=\"gradient-text\">व्याख्यात्मक एआई</span> के साथ तुरंत समाचारों की सत्यता जानें",
    heroDesc: "एक बुद्धिमान सास (SaaS) सूट जो नामित संस्थाओं को निकालता है, स्रोत की विश्वसनीयता को स्कोर करता है, क्लिकबेट थ्रेसहोल्ड को मापता है और तेजी से स्थानीय एमएल का उपयोग करके मीडिया के गलत दावों को पकड़ता है।",
    btnAnalyze: "समाचार विश्लेषण शुरू करें 🚀",
    btnDashboard: "व्यक्तिगत डैशबोर्ड",
    stat1: "मॉडल सटीकता रेटिंग",
    stat2: "फर्जी ख़बरें खारिज की गईं",
    stat3: "विश्लेषण गति सूचकांक",
    stat4: "समर्थित भाषाएँ",
    featBadge: "विशेषताएं",
    featTitle: "पूर्ण सुइट एनएलपी प्रसंस्करण पाइपलाइन",
    featSubtitle: "हमारा एल्गोरिथम हेरफेर तकनीकों को उजागर करने के लिए समाचार संरचनाओं का विश्लेषण करता है।",
    locBadge: "स्थानीयकरण",
    locTitle: "बहु-भाषा परिणाम अनुवाद",
    locDesc: "सत्यापित निर्णयों, समझने योग्य कारणों, सारांश और कीवर्ड को एक क्लिक में अंग्रेजी, तमिल, हिंदी, तेलुगु, मलयालम और कन्नड़ में अनुवाद करें।",
    previewTitle: "✅ वास्तविक समाचार",
    previewDesc: "\"உண்மைச் செய்தி • 94.7% மாதிரி நம்பிக்கை\"",
    previewBtn: "लोकलइज़र टेस्ट करें"
  },
  te: {
    heroBadge: "✨ అధునాతన NLP వెరిఫിക്കేషన్ ఇంజిన్",
    heroTitle: "<span class=\"gradient-text\">వివరించదగిన AI</span> తో తక్షణమే నిజాలను గుర్తించండి",
    heroDesc: "నామకరణ ఎంటిటీలను సంగ్రహించడం, మూల విశ్వసనీయత స్కోరింగ్ చేయడం, క్లిక్‌బైట్ పరిమితిని కొలవడం మరియు లోకల్ ML వెక్టరൈజర్‌లతో తప్పుడు సమాచారాన్ని గుర్తించే సాస్ సూట్.",
    btnAnalyze: "వార్తలను విశ్లేషించండి 🚀",
    btnDashboard: "వ్యక్తిగత డాష్‌బోర్డ్",
    stat1: "నమూనా ఖచ్చితత్వ రేటింగ్",
    stat2: "రూమర్లు తొలగించబడ్డాయి",
    stat3: "విశ్లేషణ వేగ సూചీ",
    stat4: "మద్దతు ఉన్న భాషలు",
    featBadge: "ఫీచర్లు",
    featTitle: "పూర్తి NLP ప్రాసెసింగ్ పైప్‌లైన్",
    featSubtitle: "మా అల్గారిథమ్ తప్పుడు సమాచారాన్ని బయటపెట్టడానికి వార్తల నిర్మాణాన్ని విశ్లేషిస్తుంది.",
    locBadge: "స్థానికీకరణ",
    locTitle: "బహుళ భాషా ఫలితాల అనువాదాలు",
    locDesc: "ధృవీకరించబడిన ఫలితాలు, వివరణాటక కారణాలు, సారాంశాలు మరియు కీవర్డ్‌లను ఒకే క్లిక్‌తో తెలుగు, ఇంగ్లీష్, తమిళం, హిందీ, మలయాళం మరియు కన్నడలోకి అనువదించండి.",
    previewTitle: "✅ నిజమైన వార్తలు",
    previewDesc: "\"உண்மைச் செய்தி • 94.7% மாதிரி நம்பிக்கை\"",
    previewBtn: "ట్రాన్స్‌లేటర్ టెస్ట్ చేయండి"
  },
  ml: {
    heroBadge: "✨ അഡ്വാൻസ്ഡ് എൻ‌എൽ‌പി വെരിഫിക്കേഷൻ എഞ്ചിൻ",
    heroTitle: "<span class=\"gradient-text\">വിശദീകരിക്കാവുന്ന AI</span> ഉപയോഗിച്ച് വാർത്തയിലെ സത്യാവസ്ഥ കണ്ടെത്തൂ",
    heroDesc: "എന്റിറ്റികളെ വേർതിരിച്ചെടുക്കുകയും, സോഴ്സ് ക്രെഡിബിലിറ്റി സ്കോർ ചെയ്യുകയും, ക്ലിക്ക്ബെയ്റ്റ് സാധ്യത അളക്കുകയും ചെയ്യുന്ന അഡ്വാൻസ്ഡ് സാസ് ടൂൾ കിറ്റ്.",
    btnAnalyze: "വാർത്തകൾ പരിശോധിക്കുക 🚀",
    btnDashboard: "വ്യക്തിഗത ഡാഷ്‌ബോർഡ്",
    stat1: "കൃത്യത റേറ്റിംഗ്",
    stat2: "വ്യാജ വാർത്തകൾ നീക്കം ചെയ്തു",
    stat3: "വിശകലന വേഗത സൂചിക",
    stat4: "ലഭ്യമായ ഭാഷകൾ",
    featBadge: "ഫീച്ചറുകൾ",
    featTitle: "എൻ‌എൽ‌പി പ്രോസസ്സിംഗ് പൈപ്പ്ലൈൻ",
    featSubtitle: "കൃത്രിമങ്ങൾ കണ്ടെത്തുന്നതിനായി വാർത്താഘടനകളെ ഞങ്ങളുടെ അൽഗോരിതം അപഗ്രഥിക്കുന്നു.",
    locBadge: "പ്രാദേശികവൽക്കരണം",
    locTitle: "ബഹുഭാഷാ ഫല വിവർത്തനങ്ങൾ",
    locDesc: "സ്ഥിരീകരിച്ച വിധികൾ, വിശദീകരണങ്ങൾ, സംഗ്രഹങ്ങൾ, കീവേഡുകൾ എന്നിവ മലയാളം, ഇംഗ്ലീഷ്, തമിഴ്, ഹിന്ദി, തെലുങ്ക്, കന്നഡ എന്നിവയിലേക്ക് വിവർത്തനം ചെയ്യുക.",
    previewTitle: "✅ യഥാർത്ഥ വാർത്ത",
    previewDesc: "\"உண்மைச் செய்தி • 94.7% மாதிரி நம்பிக்கை\"",
    previewBtn: "ലോക്കലൈസർ പരീക്ഷിക്കുക"
  },
  kn: {
    heroBadge: "✨ ಸುಧಾರಿತ NLP ಪರಿಶೀಲನಾ ಎಂಜಿನ್",
    heroTitle: "<span class=\"gradient-text\">ವಿವರಿಸಬಹುದಾದ AI</span> ನೊಂದಿಗೆ ಸುದ್ದಿಯ ಸತ್ಯಾಸತ್ಯತೆಯನ್ನು ತಕ್ಷಣವೇ ಪತ್ತೆಹಚ್ಚಿ",
    heroDesc: "ಹೆಸರಿಸಲಾದ ಘಟಕಗಳನ್ನು ಹೊರತೆಗೆಯುವ, ಮೂಲ ವಿಶ್ವಾಸಾರ್ಹತೆಯನ್ನು ಸ್ಕೋರ್ ಮಾಡುವ, ಕ್ಲಿಕ್‌ಬೈಟ್ ಮಿತಿಗಳನ್ನು ಅಳೆಯುವ ಮತ್ತು ಹಗುರವಾದ, ಅತ್ಯಂತ ವೇಗದ ಸ್ಥಳೀಯ ML ವೆಕ್ಟರೈಜರ್‌ಗಳನ್ನು ಬಳಸಿಕೊಂಡು ಮಾಧ್ಯಮ ತಪ್ಪು ಮಾಹಿತಿಯನ್ನು ಫ್ಲ್ಯಾಗ್ ಮಾಡುವ ಬುದ್ಧಿವಂತ ಸಾಸ್ ಸೂಟ್.",
    btnAnalyze: "ಸುದ್ದಿ ವಿಶ್ಲೇಷಿಸಿ 🚀",
    btnDashboard: "ವೈಯಕ್ತಿಕ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್ ವೀಕ್ಷಿಸಿ",
    stat1: "ಮಾದರಿಯ ನಿಖರತೆಯ ರೇಟಿಂಗ್",
    stat2: "ಹೋಗಲಾಡಿಸಿದ ವದಂತಿಗಳು",
    stat3: "ವಿಶ್ಲೇಷಣೆ ವೇಗದ ಸೂಚ್ಯಂಕ",
    stat4: "ಬೆಂಬಲಿತ ಭಾಷೆಗಳು",
    featBadge: "ವೈಶಿಷ್ಟ್ಯಗಳು",
    featTitle: "ಪೂರ್ಣ ಸರಣಿ NLP ಪ್ರಕ್ರಿಯೆ ಪೈಪ್‌ಲೈನ್",
    featSubtitle: "ಕುಶಲ ತಂತ್ರಗಳನ್ನು ಬಯಲು ಮಾಡಲು ನಮ್ಮ ಅಲ್ಗಾರಿದಮ್ ಸುದ್ದಿಯ ರಚನೆಗಳನ್ನು ವಿಭಜಿಸುತ್ತದೆ.",
    locBadge: "ಸ್ಥಳೀಕರಣ",
    locTitle: "ಬಹು-ಭಾಷಾ ಫಲಿತಾಂಶದ ಅನುವಾದಗಳು",
    locDesc: "ಸ್ಥಿರೀಕರಿಸಿದ ತೀರ್ಪುಗಳು, ವಿವರಣಾತ್ಮಕ ಕಾರಣಗಳು, ಸಾರಾಂಶಗಳು ಮತ್ತು ಕೀವರ್ಡ್‌ಗಳನ್ನು ಒಂದೇ ಕ್ಲಿಕ್‌ನಲ್ಲಿ ಕನ್ನಡ, ಇಂಗ್ಲಿಷ್, ತಮಿಳು, ಹಿಂದಿ, ತೆಲುಗು ಮತ್ತು ಮಲಯಾಳಂಗೆ ಅನುವಾದಿಸಿ.",
    previewTitle: "✅ ನಿಜವಾದ ಸುದ್ದಿ",
    previewDesc: "\"உண்மைச் செய்தி • 94.7% மாதிரி நம்பிக்கை\"",
    previewBtn: "ಅನುವಾದಕವನ್ನು ಪರೀಕ್ಷಿಸಿ"
  }
};

window.translateHomePage = function (lang) {
  const tr = homeTranslations[lang] || homeTranslations['en'];

  // Update elements
  updateHomeText('home-hero-badge', tr.heroBadge);

  const heroTitle = document.getElementById('home-hero-title');
  if (heroTitle) heroTitle.innerHTML = tr.heroTitle;

  updateHomeText('home-hero-desc', tr.heroDesc);
  updateHomeText('home-btn-analyze', tr.btnAnalyze);
  updateHomeText('home-btn-dashboard', tr.btnDashboard);

  updateHomeText('home-stat-1', tr.stat1);
  updateHomeText('home-stat-2', tr.stat2);
  updateHomeText('home-stat-3', tr.stat3);
  updateHomeText('home-stat-4', tr.stat4);

  updateHomeText('home-feat-badge', tr.featBadge);
  updateHomeText('home-feat-title', tr.featTitle);
  updateHomeText('home-feat-subtitle', tr.featSubtitle);

  updateHomeText('home-loc-badge', tr.locBadge);
  updateHomeText('home-loc-title', tr.locTitle);
  updateHomeText('home-loc-desc', tr.locDesc);

  updateHomeText('home-preview-title', tr.previewTitle);
  updateHomeText('home-preview-desc', tr.previewDesc);
  updateHomeText('home-preview-btn', tr.previewBtn);

  // Toggle active class on lang button
  const buttons = document.querySelectorAll('#home-lang-buttons button');
  buttons.forEach(btn => {
    const onclickStr = btn.getAttribute('onclick') || '';
    if (onclickStr.includes(lang)) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  Toast.show('Language Shifted', `Page translation updated to target lang: ${lang.toUpperCase()}`, 'info');
};

function updateHomeText(id, text) {
  const el = document.getElementById(id);
  if (el) el.innerText = text;
}
