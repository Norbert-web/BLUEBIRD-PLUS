  // ===== AUTO-LOCK ON PAGE LOAD ===== BUG on desktop enter button does not work after setting a password I guess I will soon fix that nlamn.dev

// This ensures the system locks automatically when page loads if password is set
(function() {
  // Wait for page to fully load
  window.addEventListener('DOMContentLoaded', function() {
    // Check if password is set
    if (securitySystem.hasPassword()) {
      // Force lock screen
      setTimeout(() => {
        lockScreen();
        console.log('System locked - password protection active');
      }, 500); // Small delay to ensure DOM is ready
    }
  });
  
  // Also lock on page refresh/reload
  window.addEventListener('load', function() {
    if (securitySystem.hasPassword()) {
      const lockScreenEl = document.getElementById('lock-screen');
      if (lockScreenEl && !lockScreenEl.classList.contains('active')) {
        lockScreen();
      }
    }
  });
  
  // Prevent bypass via browser back button
  window.addEventListener('pageshow', function(event) {
    if (event.persisted && securitySystem.hasPassword()) {
      // Page was loaded from cache (back/forward button)
      lockScreen();
    }
  });
})();
  // ===== PASSWORD & SECURITY SYSTEM ====
  class SecuritySystem {
  constructor() {
    this.passwordKey = 'bluebird_password';
    this.questionsKey = 'bluebird_recovery_questions';
    this.attemptsKey = 'bluebird_login_attempts';
    this.maxAttempts = 5;
    this.init();
  }
  
  init() {
    // Check if password exists
    const hasPassword = this.hasPassword();
    
    // Update password input listeners
    const newPasswordInput = document.getElementById('new-password');
    
    if (newPasswordInput) {
      newPasswordInput.addEventListener('input', () => this.checkPasswordStrength());
    }
  }
  
  hasPassword() {
    return localStorage.getItem(this.passwordKey) !== null;
  }
  
  checkPasswordStrength() {
    const password = document.getElementById('new-password').value;
    const strengthFill = document.getElementById('strength-fill');
    const strengthText = document.getElementById('strength-text');
    
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.match(/[a-z]/) && password.match(/[A-Z]/)) strength++;
    if (password.match(/[0-9]/)) strength++;
    if (password.match(/[^a-zA-Z0-9]/)) strength++;
    
    strengthFill.className = 'strength-fill';
    
    if (strength <= 1) {
      strengthFill.classList.add('weak');
      strengthText.textContent = 'Weak password';
    } else if (strength <= 3) {
      strengthFill.classList.add('medium');
      strengthText.textContent = 'Medium strength';
    } else {
      strengthFill.classList.add('strong');
      strengthText.textContent = 'Strong password';
    }
  }
  
  hashPassword(password) {
    // Simple hash
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
      const char = password.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash.toString();
  }
  
  setPassword(password) {
    const hashed = this.hashPassword(password);
    localStorage.setItem(this.passwordKey, hashed);
  }
  
  verifyPassword(password) {
    const stored = localStorage.getItem(this.passwordKey);
    const hashed = this.hashPassword(password);
    return stored === hashed;
  }
  
  saveRecoveryQuestions(questions) {
    const encrypted = btoa(JSON.stringify(questions));
    localStorage.setItem(this.questionsKey, encrypted);
  }
  
  getRecoveryQuestions() {
    const stored = localStorage.getItem(this.questionsKey);
    if (!stored) return null;
    return JSON.parse(atob(stored));
  }
  
  verifyRecoveryAnswers(answers) {
    const stored = this.getRecoveryQuestions();
    if (!stored) return false;
    
    return answers.every((answer, index) => {
      return answer.toLowerCase().trim() === stored[index].answer.toLowerCase().trim();
    });
  }
  
  getLoginAttempts() {
    return parseInt(localStorage.getItem(this.attemptsKey) || '0');
  }
  
  incrementAttempts() {
    const attempts = this.getLoginAttempts() + 1;
    localStorage.setItem(this.attemptsKey, attempts.toString());
    return attempts;
  }
  
  resetAttempts() {
    localStorage.removeItem(this.attemptsKey);
  }
  
  clearAllSecurity() {
    localStorage.removeItem(this.passwordKey);
    localStorage.removeItem(this.questionsKey);
    localStorage.removeItem(this.attemptsKey);
  }
}

const securitySystem = new SecuritySystem();

// ===== PASSWORD SETUP FUNCTIONS =====

function openPasswordSetup() {
  document.getElementById('password-setup-modal').style.display = 'flex';
}

function closePasswordSetup() {
  document.getElementById('password-setup-modal').style.display = 'none';
  document.getElementById('step-1').classList.add('active');
  document.getElementById('step-2').classList.remove('active');
}

function nextToRecovery() {
  const password = document.getElementById('new-password').value;
  const confirm = document.getElementById('confirm-password').value;
  
  if (!password || password.length < 6) {
    alert('Password must be at least 6 characters long');
    return;
  }
  
  if (password !== confirm) {
    alert('Passwords do not match');
    return;
  }
  
  document.getElementById('step-1').classList.remove('active');
  document.getElementById('step-2').classList.add('active');
}

function backToPassword() {
  document.getElementById('step-2').classList.remove('active');
  document.getElementById('step-1').classList.add('active');
}

function savePasswordAndQuestions() {
  const password = document.getElementById('new-password').value;
  
  const questions = [
    {
      question: document.getElementById('question-1').options[document.getElementById('question-1').selectedIndex].text,
      answer: document.getElementById('answer-1').value
    },
    {
      question: document.getElementById('question-2').options[document.getElementById('question-2').selectedIndex].text,
      answer: document.getElementById('answer-2').value
    },
    {
      question: document.getElementById('question-3').options[document.getElementById('question-3').selectedIndex].text,
      answer: document.getElementById('answer-3').value
    }
  ];
  
  // Validate
  if (!questions[0].answer || !questions[1].answer || !questions[2].answer) {
    alert('Please answer all security questions');
    return;
  }
  
  if (questions[0].question === '' || questions[1].question === '' || questions[2].question === '') {
    alert('Please select all security questions');
    return;
  }
  
  // Save
  securitySystem.setPassword(password);
  securitySystem.saveRecoveryQuestions(questions);
  
  closePasswordSetup();
  alert('Password and security questions saved successfully!');
  
  // Lock the screen
  lockScreen();
}

// ===== PASSWORD RECOVERY FUNCTIONS =====

function openPasswordRecovery() {
  const questions = securitySystem.getRecoveryQuestions();
  if (!questions) {
    alert('No recovery questions found');
    return;
  }
  
  document.getElementById('recovery-question-1-label').textContent = questions[0].question;
  document.getElementById('recovery-question-2-label').textContent = questions[1].question;
  document.getElementById('recovery-question-3-label').textContent = questions[2].question;
  
  document.getElementById('password-recovery-modal').style.display = 'flex';
}

function closePasswordRecovery() {
  document.getElementById('password-recovery-modal').style.display = 'none';
  document.getElementById('recovery-answer-1').value = '';
  document.getElementById('recovery-answer-2').value = '';
  document.getElementById('recovery-answer-3').value = '';
  document.getElementById('recovery-error').style.display = 'none';
}

function verifyRecoveryAnswers() {
  const answers = [
    { answer: document.getElementById('recovery-answer-1').value },
    { answer: document.getElementById('recovery-answer-2').value },
    { answer: document.getElementById('recovery-answer-3').value }
  ];
  
  if (securitySystem.verifyRecoveryAnswers(answers.map(a => a.answer))) {
    closePasswordRecovery();
    document.getElementById('reset-password-modal').style.display = 'flex';
  } else {
    document.getElementById('recovery-error').style.display = 'block';
  }
}

function saveNewPassword() {
  const newPass = document.getElementById('reset-new-password').value;
  const confirmPass = document.getElementById('reset-confirm-password').value;
  
  if (!newPass || newPass.length < 6) {
    alert('Password must be at least 6 characters long');
    return;
  }
  
  if (newPass !== confirmPass) {
    alert('Passwords do not match');
    return;
  }
  
  securitySystem.setPassword(newPass);
  securitySystem.resetAttempts();
  document.getElementById('reset-password-modal').style.display = 'none';
  document.getElementById('reset-new-password').value = '';
  document.getElementById('reset-confirm-password').value = '';
  
  alert('Password reset successfully!');
}





// ===== WIDGET FUNCTIONS =====

// Weather Widget
function updateWeather() {
  // Simulated weather data
  const conditions = ['Sunny', 'Partly Cloudy', 'Cloudy', 'Rainy', 'Stormy'];
  const temps = [65, 68, 72, 75, 78, 82];
  
  const temp = temps[Math.floor(Math.random() * temps.length)];
  const condition = conditions[Math.floor(Math.random() * conditions.length)];
  
  const tempEl = document.getElementById('weather-temp');
  const conditionEl = document.getElementById('weather-condition');
  
  if (tempEl) tempEl.textContent = `${temp}°F`;
  if (conditionEl) conditionEl.textContent = condition;
}

// Battery Widget
function updateBattery() {
  if ('getBattery' in navigator) {
    navigator.getBattery().then(battery => {
      const level = Math.round(battery.level * 100);
      const charging = battery.charging;
      
      const levelEl = document.getElementById('battery-level');
      const statusEl = document.getElementById('battery-status');
      
      if (levelEl) levelEl.textContent = `${level}%`;
      if (statusEl) statusEl.textContent = charging ? 'Charging' : 'On Battery';
      
      // Update on changes
      battery.addEventListener('levelchange', () => updateBattery());
      battery.addEventListener('chargingchange', () => updateBattery());
    });
  } else {
    // Fallback for browsers without Battery API
    const levelEl = document.getElementById('battery-level');
    const statusEl = document.getElementById('battery-status');
    if (levelEl) levelEl.textContent = '85%';
    if (statusEl) statusEl.textContent = 'Unknown';
  }
}

// Network Widget
function updateNetwork() {
  const online = navigator.onLine;
  const nameEl = document.getElementById('network-name');
  
  if (nameEl) {
    nameEl.textContent = online ? 'Connected' : 'Offline';
  }
  
  // Update on changes
  window.addEventListener('online', updateNetwork);
  window.addEventListener('offline', updateNetwork);
}

// Music Widget Functions
let musicPlaying = false;

function musicPlayPause() {
  musicPlaying = !musicPlaying;
  const btn = event.currentTarget;
  
  if (musicPlaying) {
    btn.innerHTML = `
      <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
        <rect x="6" y="4" width="4" height="16"></rect>
        <rect x="14" y="4" width="4" height="16"></rect>
      </svg>
    `;
  } else {
    btn.innerHTML = `
      <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
        <polygon points="5 3 19 12 5 21 5 3"></polygon>
      </svg>
    `;
  }
}

function musicNext() {
  console.log('Next track');
  // Implement music next functionality
}

function musicPrevious() {
  console.log('Previous track');
  // Implement music previous functionality
}

// Notifications Widget
function showLockNotifications() {
  alert('You have 3 new notifications:\n\n1. Email from John\n2. Calendar reminder\n3. System update available');
}

// Initialize Widgets
function initializeWidgets() {
  updateWeather();
  updateBattery();
  updateNetwork();
  
  // Update weather every 30 minutes
  setInterval(updateWeather, 30 * 60 * 1000);
}

// Call on page load
document.addEventListener('DOMContentLoaded', function() {
  initializeWidgets();
});

// ===== ADD PASSWORD MANAGEMENT TO SETTINGS =====

// Add this to your settings menu or create a button to open password setup
function openSecuritySettings() {
  if (securitySystem.hasPassword()) {
    // Show options to change or remove password
    const action = confirm('Password is already set. Do you want to change it?\n\nOK = Change Password\nCancel = Remove Password');
    
    if (action) {
      // Change password
      const currentPass = prompt('Enter current password:');
      if (currentPass && securitySystem.verifyPassword(currentPass)) {
        openPasswordSetup();
      } else {
        alert('Incorrect password');
      }
    } else {
      // Remove password
      const currentPass = prompt('Enter current password to remove it:');
      if (currentPass && securitySystem.verifyPassword(currentPass)) {
        if (confirm('Are you sure you want to remove password protection?')) {
          securitySystem.clearAllSecurity();
          alert('Password protection removed');
        }
      } else {
        alert('Incorrect password');
      }
    }
  } else {
    openPasswordSetup();
  }
}

// ===== CLEAR BROWSING DATA BYPASS =====

// Note: Users can clear localStorage to bypass password
// Add warning when password is set
window.addEventListener('storage', function(e) {
  if (e.key === securitySystem.passwordKey && e.newValue === null) {
    // Password was cleared
    console.warn('Password protection was removed by clearing browsing data');
    // You could add additional security measures here
  }
});

// Add button to lock screen for forgot password
function addForgotPasswordLink() {
  const lockHint = document.querySelector('.lock-hint');
  if (lockHint && securitySystem.hasPassword()) {
    const forgotLink = document.createElement('div');
    forgotLink.className = 'forgot-password-link';
    forgotLink.innerHTML = `
      <a href="#" onclick="openPasswordRecovery(); return false;" style="color: rgba(255,255,255,0.7); font-size: 13px; text-decoration: underline; margin-top: 12px; display: inline-block;">
        Forgot password?
      </a>
    `;
    lockHint.parentNode.insertBefore(forgotLink, lockHint.nextSibling);
  }
}

// Call when showing password input
const originalShowPasswordInput = showPasswordInput;
showPasswordInput = function() {
  originalShowPasswordInput();
  addForgotPasswordLink();
};

// ===== AUTO-LOCK FEATURE =====

let autoLockTimer = null;
const autoLockDelay = 5 * 60 * 1000; // 5 minutes of inactivity

function resetAutoLockTimer() {
  if (!securitySystem.hasPassword()) return;
  
  clearTimeout(autoLockTimer);
  autoLockTimer = setTimeout(() => {
    const lockScreen = document.getElementById('lock-screen');
    if (lockScreen && !lockScreen.classList.contains('active')) {
      lockScreen();
      console.log('Auto-locked due to inactivity');
    }
  }, autoLockDelay);
}

// Reset timer on user activity
['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'].forEach(event => {
  document.addEventListener(event, resetAutoLockTimer, true);
});

// Start auto-lock timer
resetAutoLockTimer();

// ===== EXPORT/IMPORT SECURITY SETTINGS =====

function exportSecuritySettings() {
  if (!securitySystem.hasPassword()) {
    alert('No password set to export');
    return;
  }
  
  const password = prompt('Enter your password to export settings:');
  if (!password || !securitySystem.verifyPassword(password)) {
    alert('Incorrect password');
    return;
  }
  
  const settings = {
    password: localStorage.getItem(securitySystem.passwordKey),
    questions: localStorage.getItem(securitySystem.questionsKey),
    timestamp: new Date().toISOString()
  };
  
  const dataStr = JSON.stringify(settings);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = 'bluebird-security-backup.json';
  link.click();
  
  URL.revokeObjectURL(url);
  alert('Security settings exported successfully!');
}

function importSecuritySettings() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  
  input.onchange = function(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(event) {
      try {
        const settings = JSON.parse(event.target.result);
        
        if (settings.password && settings.questions) {
          if (confirm('This will replace your current security settings. Continue?')) {
            localStorage.setItem(securitySystem.passwordKey, settings.password);
            localStorage.setItem(securitySystem.questionsKey, settings.questions);
            alert('Security settings imported successfully!');
            lockScreen();
          }
        } else {
          alert('Invalid security backup file');
        }
      } catch (err) {
        alert('Error reading backup file: ' + err.message);
      }
    };
    
    reader.readAsText(file);
  };
  
  input.click();
}

// ===== ADD SECURITY BUTTON TO UI =====

// Add this button somewhere in your UI (like settings menu or start menu)

  
  
  // ===== SEARCH CONTROLLER =====
// ===== SEARCH CONTROLLER =====
class SearchController {
  constructor() {
    this.currentTab = 'all';
    this.searchTimeout = null;
    this.apps = [
      { name: 'File Explorer', icon: '📁', action: 'filemanager' },
      { name: 'Browser', icon: '🌐', action: 'browser' },
      { name: 'Terminal', icon: '💻', action: 'terminal' },
      { name: 'Settings', icon: '⚙️', action: 'settings' },
      { name: 'Calendar', icon: '📅', action: 'calendar' },
      { name: 'Notes', icon: '📝', action: 'notes' },
      { name: 'Calculator', icon: '🔢', action: 'calculator' },
      { name: 'Music Player', icon: '🎵', action: 'music' }
    ];
    
    this.init();
  }
  
  init() {
    const input = document.getElementById('search-input');
    if (input) {
      input.addEventListener('input', (e) => this.handleSearch(e.target.value));
      input.addEventListener('keydown', (e) => this.handleKeyDown(e));
    }
    
    // Global keyboard shortcut
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        toggleSearch();
      }
      if (e.key === 'Escape') {
        const panel = document.getElementById('search-panel');
        if (panel && panel.style.display !== 'none') {
          toggleSearch();
        }
      }
    });
  }
  
  handleSearch(query) {
    const clearBtn = document.getElementById('search-clear-btn');
    
    if (query.trim()) {
      clearBtn.style.display = 'flex';
    } else {
      clearBtn.style.display = 'none';
      this.showSuggestions();
      return;
    }
    
    // Debounce search
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      this.performSearch(query);
    }, 300);
  }
  
  handleKeyDown(e) {
    if (e.key === 'Enter') {
      const query = e.target.value.trim();
      if (query && this.currentTab === 'web') {
        this.searchWeb(query);
      }
    }
  }
  
  async performSearch(query) {
    const lowerQuery = query.toLowerCase();
    
    if (this.currentTab === 'all' || this.currentTab === 'apps') {
      this.searchApps(lowerQuery);
    }
    
    if (this.currentTab === 'all' || this.currentTab === 'web') {
      await this.searchWeb(query);
    }
  }
  
  searchApps(query) {
    const results = this.apps.filter(app => 
      app.name.toLowerCase().includes(query)
    );
    
    if (results.length > 0 && this.currentTab !== 'web') {
      this.displayResults(results.map(app => ({
        type: 'app',
        title: app.name,
        icon: app.icon,
        description: 'Application',
        action: () => this.executeAction(app.action)
      })));
    }
  }
  
  async searchWeb(query) {
    if (this.currentTab === 'apps') return;
    
    this.showLoading();
    
    try {
      // Using DuckDuckGo Instant Answer API (no API key needed)
      const response = await fetch(`https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`);
      const data = await response.json();
      
      const results = [];
      
      // Add abstract result if available
      if (data.Abstract) {
        results.push({
          type: 'web',
          title: data.Heading || query,
          description: data.Abstract,
          url: data.AbstractURL,
          icon: '🔍'
        });
      }
      
      // Add related topics
      if (data.RelatedTopics && data.RelatedTopics.length > 0) {
        data.RelatedTopics.slice(0, 5).forEach(topic => {
          if (topic.Text && topic.FirstURL) {
            results.push({
              type: 'web',
              title: topic.Text.split(' - ')[0],
              description: topic.Text,
              url: topic.FirstURL,
              icon: '🌐'
            });
          }
        });
      }
      
      // If no results, add web search option
      if (results.length === 0) {
        results.push({
          type: 'web',
          title: `Search "${query}" on the web`,
          description: 'Open web browser to search',
          url: `https://www.google.com/search?q=${encodeURIComponent(query)}`,
          icon: '🔍',
          badge: 'Web Search'
        });
      }
      
      this.displayResults(results);
      
    } catch (error) {
      console.error('Search error:', error);
      this.displayResults([{
        type: 'web',
        title: `Search "${query}" on the web`,
        description: 'Open web browser to search',
        url: `https://www.google.com/search?q=${encodeURIComponent(query)}`,
        icon: '🔍',
        badge: 'Web Search'
      }]);
    }
  }
  
  displayResults(results) {
    const suggestions = document.getElementById('search-suggestions');
    const resultsContainer = document.getElementById('search-results');
    const loading = document.getElementById('search-loading');
    const empty = document.getElementById('search-empty');
    
    suggestions.style.display = 'none';
    loading.style.display = 'none';
    
    if (results.length === 0) {
      resultsContainer.style.display = 'none';
      empty.style.display = 'flex';
      return;
    }
    
    empty.style.display = 'none';
    resultsContainer.style.display = 'block';
    
    resultsContainer.innerHTML = results.map(result => {
      if (result.type === 'app') {
        return `
          <div class="result-item" onclick='searchController.executeResultAction(${JSON.stringify(result).replace(/'/g, "&#39;")})'>
            <div class="result-icon">${result.icon}</div>
            <div class="result-content">
              <div class="result-title">${this.escapeHtml(result.title)}</div>
              <div class="result-description">${this.escapeHtml(result.description)}</div>
            </div>
            <div class="result-badge">App</div>
          </div>
        `;
      } else {
        return `
          <a href="${result.url}" target="_blank" class="result-item">
            <div class="result-icon">${result.icon}</div>
            <div class="result-content">
              <div class="result-title">${this.escapeHtml(result.title)}</div>
              <div class="result-description">${this.escapeHtml(result.description)}</div>
              ${result.url ? `<div class="result-url">${this.escapeHtml(result.url)}</div>` : ''}
            </div>
            ${result.badge ? `<div class="result-badge">${result.badge}</div>` : ''}
          </a>
        `;
      }
    }).join('');
  }
  
  executeResultAction(result) {
    if (result.action) {
      result.action();
    }
  }
  
  showLoading() {
    document.getElementById('search-suggestions').style.display = 'none';
    document.getElementById('search-results').style.display = 'none';
    document.getElementById('search-empty').style.display = 'none';
    document.getElementById('search-loading').style.display = 'flex';
  }
  
  showSuggestions() {
    document.getElementById('search-results').style.display = 'none';
    document.getElementById('search-loading').style.display = 'none';
    document.getElementById('search-empty').style.display = 'none';
    document.getElementById('search-suggestions').style.display = 'block';
  }
  
  switchTab(tab) {
    this.currentTab = tab;
    
    // Update active tab
    document.querySelectorAll('.search-tab').forEach(btn => {
      btn.classList.remove('active');
    });
    document.querySelector(`[data-tab="${tab}"]`).classList.add('active');
    
    // Re-search if there's a query
    const input = document.getElementById('search-input');
    if (input.value.trim()) {
      this.performSearch(input.value);
    }
  }
  
  clearSearch() {
    const input = document.getElementById('search-input');
    input.value = '';
    input.focus();
    document.getElementById('search-clear-btn').style.display = 'none';
    this.showSuggestions();
  }
  
  executeAction(action) {
    console.log('Executing action:', action);
    toggleSearch();
    
    // Execute the action based on type
    switch(action) {
      case 'settings':
        if (typeof toggleTaskbarSettings === 'function') toggleTaskbarSettings();
        break;
      case 'theme':
        if (typeof toggleTheme === 'function') toggleTheme();
        break;
      case 'wallpaper':
        if (typeof cycleWallpaper === 'function') cycleWallpaper();
        break;
      case 'calendar':
        if (typeof toggleCalendar === 'function') toggleCalendar();
        break;
      default:
        // Try to open app if function exists
        if (typeof openApp === 'function') {
          openApp(action);
        }
    }
  }
  
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// Initialize search controller
const searchController = new SearchController();

// THIS IS THE IMPORTANT FUNCTION - MAKE SURE IT'S HERE!
function toggleSearch() {
  const panel = document.getElementById('search-panel');
  let backdrop = document.getElementById('search-backdrop');
  
  if (!panel) {
    console.error('Search panel not found! Make sure you added the search panel HTML.');
    return;
  }
  
  if (panel.style.display === 'none' || !panel.style.display) {
    // Create backdrop
    if (!backdrop) {
      backdrop = document.createElement('div');
      backdrop.id = 'search-backdrop';
      backdrop.className = 'search-backdrop';
      backdrop.onclick = toggleSearch;
      document.body.appendChild(backdrop);
    }
    
    backdrop.style.display = 'block';
    panel.style.display = 'flex';
    
    // Focus input
    setTimeout(() => {
      const input = document.getElementById('search-input');
      if (input) input.focus();
    }, 100);
    
    // Show suggestions
    searchController.showSuggestions();
  } else {
    panel.style.display = 'none';
    if (backdrop) {
      backdrop.style.display = 'none';
    }
    
    // Clear search
    searchController.clearSearch();
  }
}


// ===== VOLUME CONTROL SYSTEM =====
class VolumeController {
  constructor() {
    this.masterVolume = 1.0;
    this.isMuted = false;
    this.previousVolume = 1.0;
    this.audioElements = new Set();
    this.appVolumes = new Map();
    
    this.init();
  }
  
  init() {
    // Setup volume slider
    const slider = document.getElementById('volume-slider');
    if (slider) {
      slider.addEventListener('input', (e) => {
        this.setVolume(e.target.value / 100);
      });
    }
    
    // Monitor all audio/video elements
    this.startMonitoring();
    
    // Enumerate audio devices
    this.enumerateDevices();
    
    // Update volume display
    this.updateVolumeDisplay();
  }
  
  startMonitoring() {
    // Monitor existing media elements
    setInterval(() => {
      this.scanForMediaElements();
    }, 1000);
    
    // Monitor iframes
    setInterval(() => {
      this.scanIframes();
    }, 2000);
  }
  
  scanForMediaElements() {
    // Find all audio and video elements
    const mediaElements = document.querySelectorAll('audio, video');
    
    mediaElements.forEach(element => {
      if (!this.audioElements.has(element)) {
        this.audioElements.add(element);
        this.applyVolumeToElement(element);
        
        // Add to mixer
        this.addToMixer(element);
      }
    });
  }
  
  scanIframes() {
    const iframes = document.querySelectorAll('iframe');
    
    iframes.forEach(iframe => {
      try {
        // Try to access iframe content (same-origin only)
        const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
        if (iframeDoc) {
          const mediaElements = iframeDoc.querySelectorAll('audio, video');
          mediaElements.forEach(element => {
            if (!this.audioElements.has(element)) {
              this.audioElements.add(element);
              this.applyVolumeToElement(element);
            }
          });
        }
      } catch (e) {
        // Cross-origin iframe - can't access directly
        // Send message to iframe if it supports postMessage
        try {
          iframe.contentWindow.postMessage({
            type: 'SET_VOLUME',
            volume: this.isMuted ? 0 : this.masterVolume
          }, '*');
        } catch (err) {
          // Silently fail
        }
      }
    });
  }
  
  applyVolumeToElement(element) {
    const effectiveVolume = this.isMuted ? 0 : this.masterVolume;
    element.volume = Math.max(0, Math.min(1, effectiveVolume));
  }
  
  setVolume(volume) {
    this.masterVolume = Math.max(0, Math.min(1, volume));
    this.isMuted = false;
    
    // Update all media elements
    this.audioElements.forEach(element => {
      this.applyVolumeToElement(element);
    });
    
    // Update display
    this.updateVolumeDisplay();
    
    // Send to iframes
    this.broadcastVolumeToIframes();
  }
  
  toggleMute() {
    if (this.isMuted) {
      this.isMuted = false;
      this.masterVolume = this.previousVolume;
    } else {
      this.previousVolume = this.masterVolume;
      this.isMuted = true;
    }
    
    // Update all elements
    this.audioElements.forEach(element => {
      this.applyVolumeToElement(element);
    });
    
    this.updateVolumeDisplay();
    this.broadcastVolumeToIframes();
  }
  
  broadcastVolumeToIframes() {
    const iframes = document.querySelectorAll('iframe');
    const volume = this.isMuted ? 0 : this.masterVolume;
    
    iframes.forEach(iframe => {
      try {
        iframe.contentWindow.postMessage({
          type: 'SET_VOLUME',
          volume: volume
        }, '*');
      } catch (e) {
        // Silently fail
      }
    });
  }
  
  updateVolumeDisplay() {
    const slider = document.getElementById('volume-slider');
    const percentage = document.getElementById('volume-percentage');
    const iconDisplay = document.getElementById('volume-icon-display');
    const muteText = document.getElementById('mute-text');
    
    const displayVolume = this.isMuted ? 0 : Math.round(this.masterVolume * 100);
    
    if (slider) slider.value = displayVolume;
    if (percentage) percentage.textContent = `${displayVolume}%`;
    
    // Update icon
    if (iconDisplay) {
      if (this.isMuted || displayVolume === 0) {
        iconDisplay.classList.add('muted');
        iconDisplay.innerHTML = `
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="32" height="32">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
            <line x1="23" y1="9" x2="17" y2="15"/>
            <line x1="17" y1="9" x2="23" y2="15"/>
          </svg>
        `;
      } else {
        iconDisplay.classList.remove('muted');
        if (displayVolume < 30) {
          iconDisplay.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="32" height="32">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
            </svg>
          `;
        } else if (displayVolume < 70) {
          iconDisplay.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="32" height="32">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
              <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
            </svg>
          `;
        } else {
          iconDisplay.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="32" height="32">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
              <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
            </svg>
          `;
        }
      }
    }
    
    if (muteText) {
      muteText.textContent = this.isMuted ? 'Unmute' : 'Mute';
    }
  }
  
  addToMixer(element) {
    const container = document.getElementById('app-volumes');
    if (!container) return;
    
    const appId = `app-${this.appVolumes.size}`;
    const appName = element.title || element.src?.split('/').pop() || 'Media';
    
    const mixerItem = document.createElement('div');
    mixerItem.className = 'app-volume-item';
    mixerItem.innerHTML = `
      <div class="app-volume-icon">🎵</div>
      <div class="app-volume-info">
        <div class="app-volume-name">${appName}</div>
        <input type="range" class="volume-slider app-volume-slider" min="0" max="100" value="100" data-app="${appId}">
      </div>
    `;
    
    container.appendChild(mixerItem);
    
    const appSlider = mixerItem.querySelector('input');
    appSlider.addEventListener('input', (e) => {
      const volume = e.target.value / 100;
      element.volume = volume * (this.isMuted ? 0 : this.masterVolume);
    });
    
    this.appVolumes.set(appId, { element, mixerItem });
  }
  
  async enumerateDevices() {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      
      const outputSelect = document.getElementById('audio-output-device');
      const inputSelect = document.getElementById('audio-input-device');
      
      if (outputSelect) {
        outputSelect.innerHTML = '';
        devices.filter(d => d.kind === 'audiooutput').forEach(device => {
          const option = document.createElement('option');
          option.value = device.deviceId;
          option.textContent = device.label || `Speaker ${outputSelect.options.length + 1}`;
          outputSelect.appendChild(option);
        });
        
        if (outputSelect.options.length === 0) {
          outputSelect.innerHTML = '<option value="default">Default - Speakers</option>';
        }
      }
      
      if (inputSelect) {
        inputSelect.innerHTML = '';
        devices.filter(d => d.kind === 'audioinput').forEach(device => {
          const option = document.createElement('option');
          option.value = device.deviceId;
          option.textContent = device.label || `Microphone ${inputSelect.options.length + 1}`;
          inputSelect.appendChild(option);
        });
        
        if (inputSelect.options.length === 0) {
          inputSelect.innerHTML = '<option value="default">Default - Microphone</option>';
        }
      }
    } catch (e) {
      console.error('Error enumerating devices:', e);
    }
  }
}

// Initialize volume controller
const volumeController = new VolumeController();

function toggleVolumeControl() {
  const panel = document.getElementById('volume-panel');
  const wifiPanel = document.getElementById('wifi-panel');
  const settingsPanel = document.getElementById('taskbar-settings-panel');
  
  // Close other panels
  if (wifiPanel) wifiPanel.style.display = 'none';
  if (settingsPanel) settingsPanel.style.display = 'none';
  
  if (panel.style.display === 'none') {
    panel.style.display = 'block';
    volumeController.updateVolumeDisplay();
  } else {
    panel.style.display = 'none';
  }
}

function muteToggle() {
  volumeController.toggleMute();
}

// ===== NETWORK/WIFI MONITOR =====
class NetworkMonitor {
  constructor() {
    this.isOnline = navigator.onLine;
    this.connectionType = 'unknown';
    this.latency = null;
    this.downloadSpeed = null;
    this.ipAddress = null;
    
    this.init();
  }
  
  init() {
    // Listen for online/offline events
    window.addEventListener('online', () => this.handleOnline());
    window.addEventListener('offline', () => this.handleOffline());
    
    // Get connection info
    this.updateConnectionInfo();
    
    // Update periodically
    setInterval(() => {
      if (this.isOnline) {
        this.checkLatency();
      }
    }, 30000); // Every 30 seconds
    
    // Initial update
    this.updateDisplay();
  }
  
  handleOnline() {
    this.isOnline = true;
    this.updateConnectionInfo();
    this.updateDisplay();
  }
  
  handleOffline() {
    this.isOnline = false;
    this.latency = null;
    this.downloadSpeed = null;
    this.updateDisplay();
  }
  
  async updateConnectionInfo() {
    // Get connection type
    if ('connection' in navigator) {
      const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
      if (conn) {
        this.connectionType = conn.effectiveType || conn.type || 'unknown';
      }
    }
    
    // Check latency
    await this.checkLatency();
    
    // Get IP address
    await this.getIPAddress();
  }
  
  async checkLatency() {
    const startTime = performance.now();
    
    try {
      await fetch('https://www.google.com/favicon.ico', { 
        mode: 'no-cors',
        cache: 'no-store'
      });
      
      const endTime = performance.now();
      this.latency = Math.round(endTime - startTime);
      this.updateDisplay();
    } catch (e) {
      this.latency = null;
    }
  }
  
  async getIPAddress() {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      this.ipAddress = data.ip;
      this.updateDisplay();
    } catch (e) {
      this.ipAddress = 'Unavailable';
    }
  }
  
  async testSpeed() {
    const testUrl = 'https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_272x92dp.png';
    const startTime = performance.now();
    
    try {
      const response = await fetch(testUrl + '?t=' + Date.now(), { cache: 'no-store' });
      const blob = await response.blob();
      const endTime = performance.now();
      
      const duration = (endTime - startTime) / 1000; // seconds
      const bitsLoaded = blob.size * 8;
      const speedBps = bitsLoaded / duration;
      const speedMbps = (speedBps / (1024 * 1024)).toFixed(2);
      
      this.downloadSpeed = speedMbps;
      this.updateDisplay();
      
      return speedMbps;
    } catch (e) {
      console.error('Speed test failed:', e);
      return null;
    }
  }
  
  updateDisplay() {
    const statusIcon = document.getElementById('network-status-icon');
    const statusTitle = document.getElementById('network-status-title');
    const statusSubtitle = document.getElementById('network-status-subtitle');
    const connectionStatus = document.getElementById('connection-status');
    const connectionType = document.getElementById('connection-type');
    const downloadSpeed = document.getElementById('download-speed');
    const networkLatency = document.getElementById('network-latency');
    const ipAddress = document.getElementById('ip-address');
    const qualityFill = document.getElementById('quality-fill');
    const qualityText = document.getElementById('quality-text');
    
    if (this.isOnline) {
      if (statusIcon) {
        statusIcon.classList.remove('offline', 'slow');
        statusIcon.innerHTML = `
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="48" height="48">





; } if (statusTitle) statusTitle.textContent = 'Connected'; if (statusSubtitle) statusSubtitle.textContent = 'Internet access'; if (connectionStatus) connectionStatus.textContent = 'Online'; } else { if (statusIcon) { statusIcon.classList.add('offline'); statusIcon.classList.remove('slow'); statusIcon.innerHTML = 









`;
}
if (statusTitle) statusTitle.textContent = 'Offline';
if (statusSubtitle) statusSubtitle.textContent = 'No internet access';
if (connectionStatus) connectionStatus.textContent = 'Offline';
}
if (connectionType) {
  const typeMap = {
    'slow-2g': '2G (Slow)',
    '2g': '2G',
    '3g': '3G',
    '4g': '4G/LTE',
    'wifi': 'WiFi',
    'ethernet': 'Ethernet',
    'unknown': 'Unknown'
  };
  connectionType.textContent = typeMap[this.connectionType] || this.connectionType;
}

if (downloadSpeed) {
  downloadSpeed.textContent = this.downloadSpeed ? `${this.downloadSpeed} Mbps` : '--';
}

if (networkLatency) {
  networkLatency.textContent = this.latency ? `${this.latency} ms` : '--';
}

if (ipAddress) {
  ipAddress.textContent = this.ipAddress || '--';
}

// Update quality indicator
let quality = 100;
let qualityLabel = 'Excellent';
let qualityClass = '';

if (!this.isOnline) {
  quality = 0;
  qualityLabel = 'Offline';
  qualityClass = 'poor';
} else if (this.latency) {
  if (this.latency < 50) {
    quality = 100;
    qualityLabel = 'Excellent';
  } else if (this.latency < 100) {
    quality = 75;
    qualityLabel = 'Good';
  } else if (this.latency < 200) {
    quality = 50;
    qualityLabel = 'Fair';
    qualityClass = 'fair';
  } else {
    quality = 25;
    qualityLabel = 'Poor';
    qualityClass = 'poor';
  }
}

if (qualityFill) {
  qualityFill.style.width = `${quality}%`;
  qualityFill.className = `quality-fill ${qualityClass}`;
}

if (qualityText) {
  qualityText.textContent = qualityLabel;
  qualityText.className = `quality-text ${qualityClass}`;
}

// Update taskbar WiFi icon
this.updateTaskbarIcon();
}
updateTaskbarIcon() {
const taskbarWifi = document.querySelector('[onclick="toggleWifi()"]');
if (!taskbarWifi) return;
const svg = taskbarWifi.querySelector('svg');
if (!svg) return;

if (!this.isOnline) {
  svg.innerHTML = `
    <path d="M5 12.55a11 11 0 0 1 14.08 0"/>
    <path d="M1.42 9a16 16 0 0 1 21.16 0"/>
    <path d="M8.53 16.11a6 6 0 0 1 6.95 0"/>
    <line x1="1" y1="1" x2="23" y2="23" stroke="red"/>
    <circle cx="12" cy="20" r="1" fill="currentColor"/>
  `;
  svg.style.color = '#e74c3c';
} else if (this.latency && this.latency > 200) {
  svg.style.color = '#f39c12';
} else {
  svg.style.color = 'rgba(255, 255, 255, 0.9)';
}
}
}
// Initialize network monitor
const networkMonitor = new NetworkMonitor();
function toggleWifi() {
const panel = document.getElementById('wifi-panel');
const volumePanel = document.getElementById('volume-panel');
const settingsPanel = document.getElementById('taskbar-settings-panel');
// Close other panels
if (volumePanel) volumePanel.style.display = 'none';
if (settingsPanel) settingsPanel.style.display = 'none';
if (panel.style.display === 'none') {
panel.style.display = 'block';
networkMonitor.updateDisplay();
} else {
panel.style.display = 'none';
}
}
async function testNetworkSpeed() {
const speedElement = document.getElementById('download-speed');
if (speedElement) {
speedElement.textContent = 'Testing...';
}
await networkMonitor.testSpeed();
}
function refreshNetworkInfo() {
networkMonitor.updateConnectionInfo();
}
// Close panels when clicking outside
document.addEventListener('click', (e) => {
const volumePanel = document.getElementById('volume-panel');
const wifiPanel = document.getElementById('wifi-panel');
const settingsPanel = document.getElementById('taskbar-settings-panel');
const volumeBtn = document.querySelector('[onclick="toggleVolumeControl()"]');
const wifiBtn = document.querySelector('[onclick="toggleWifi()"]');
const settingsBtn = document.querySelector('[onclick="toggleTaskbarSettings()"]');
if (volumePanel && volumePanel.style.display !== 'none') {
if (!volumePanel.contains(e.target) && !volumeBtn?.contains(e.target)) {
volumePanel.style.display = 'none';
}
}
if (wifiPanel && wifiPanel.style.display !== 'none') {
if (!wifiPanel.contains(e.target) && !wifiBtn?.contains(e.target)) {
wifiPanel.style.display = 'none';
}
}
if (settingsPanel && settingsPanel.style.display !== 'none') {
if (!settingsPanel.contains(e.target) && !settingsBtn?.contains(e.target)) {
settingsPanel.style.display = 'none';
}
}
});
