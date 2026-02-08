// ===== AI-POWERED APP SUGGESTIONS =====
let userBehavior = {
  appUsage: {},
  timeOfDay: {},
  sessionCount: 0,
  lastSessionDate: null
};

function loadUserBehavior() {
  try {
    const saved = localStorage.getItem('user-behavior');
    if (saved) {
      userBehavior = JSON.parse(saved);
    }
  } catch(e) {
    console.error('Failed to load user behavior:', e);
  }
}

function saveUserBehavior() {
  localStorage.setItem('user-behavior', JSON.stringify(userBehavior));
}

function trackAppUsage(appId, appName) {
  const hour = new Date().getHours();
  const timeCategory = hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening';

  // Track app usage
  if (!userBehavior.appUsage[appId]) {
    userBehavior.appUsage[appId] = {
      name: appName,
      count: 0,
      lastUsed: null,
      timePreference: { morning: 0, afternoon: 0, evening: 0 }
    };
  }

  userBehavior.appUsage[appId].count++;
  userBehavior.appUsage[appId].lastUsed = new Date().toISOString();
  userBehavior.appUsage[appId].timePreference[timeCategory]++;

  // Track time of day
  if (!userBehavior.timeOfDay[timeCategory]) {
    userBehavior.timeOfDay[timeCategory] = 0;
  }
  userBehavior.timeOfDay[timeCategory]++;

  saveUserBehavior();
}

function getAISuggestions() {
  const hour = new Date().getHours();
  const timeCategory = hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening';
  const suggestions = [];

  // Get most used apps
  const sortedApps = Object.entries(userBehavior.appUsage)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 3);

  // Time-based suggestions
  const timeSuggestions = Object.entries(userBehavior.appUsage)
    .filter(([id, data]) => data.timePreference[timeCategory] > 0)
    .sort((a, b) => b[1].timePreference[timeCategory] - a[1].timePreference[timeCategory])
    .slice(0, 2);

  // Recently used
  const recentApps = Object.entries(userBehavior.appUsage)
    .filter(([id, data]) => data.lastUsed)
    .sort((a, b) => new Date(b[1].lastUsed) - new Date(a[1].lastUsed))
    .slice(0, 2);

  // Combine suggestions
  const allSuggestions = new Set([
    ...sortedApps.map(([id, data]) => ({ id, name: data.name, reason: 'Most used' })),
    ...timeSuggestions.map(([id, data]) => ({ id, name: data.name, reason: `Popular in the ${timeCategory}` })),
    ...recentApps.map(([id, data]) => ({ id, name: data.name, reason: 'Recently used' }))
  ]);

  return Array.from(allSuggestions).slice(0, 4);
}

function showAISuggestions() {
  const suggestions = getAISuggestions();
  
  if (suggestions.length === 0) return;

  const modal = document.createElement('div');
  modal.style.cssText = `
    position: fixed;
    bottom: 120px;
    left: 50%;
    transform: translateX(-50%);
    background: linear-gradient(135deg, rgba(74,222,128,0.95), rgba(34,197,94,0.95));
    backdrop-filter: blur(20px);
    border-radius: 16px;
    padding: 1.5rem;
    max-width: 500px;
    width: 90%;
    z-index: 2500;
    box-shadow: 0 20px 60px rgba(0,0,0,0.6);
    animation: slideInUp 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
  `;

  let suggestionsHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem;">
      <h3 style="color:#000; font-size:1.2rem; margin:0; display:flex; align-items:center; gap:0.5rem;">
        <span>🤖</span>
        <span>AI Suggestions</span>
      </h3>
      <button onclick="this.closest('div[style*=fixed]').remove()" style="background:rgba(0,0,0,0.2); border:none; color:#000; font-size:1.5rem; width:30px; height:30px; border-radius:50%; cursor:pointer; display:flex; align-items:center; justify-content:center;">×</button>
    </div>
    <div style="display:flex; flex-direction:column; gap:0.8rem;">
  `;

  suggestions.forEach(sugg => {
    suggestionsHTML += `
      <div onclick="launchSuggestedApp('${sugg.id}', '${sugg.name}'); this.closest('div[style*=fixed]').remove();" style="background:rgba(0,0,0,0.1); padding:1rem; border-radius:10px; cursor:pointer; transition:all 0.2s; display:flex; justify-content:space-between; align-items:center;">
        <div>
          <div style="color:#000; font-weight:600; margin-bottom:0.2rem;">${sugg.name}</div>
          <div style="color:rgba(0,0,0,0.7); font-size:0.85rem;">${sugg.reason}</div>
        </div>
        <div style="color:#000; font-size:1.5rem;">→</div>
      </div>
    `;
  });

  suggestionsHTML += '</div>';
  modal.innerHTML = suggestionsHTML;
  document.body.appendChild(modal);

  setTimeout(() => modal.remove(), 15000);
}

function launchSuggestedApp(appId, appName) {
  const apps = {
    'resume': 'resume-win',
    'projects': 'projects-win',
    'connect': 'connect-win',
    'settings': 'settings-win',
    'inspireboard': 'inspireboard-win',
    'birdshell': 'birdshell-win',
    'claude': 'claude-win'
  };

  if (apps[appId]) {
    if (appId === 'birdshell') {
      openBirdShell();
    } else {
      openWindow(apps[appId]);
    }
  } else {
    openApp(appId);
  }

  trackAppUsage(appId, appName);
}

// Show suggestions periodically
setInterval(() => {
  if (Math.random() > 0.7 && Object.keys(userBehavior.appUsage).length > 2) {
    showAISuggestions();
  }
}, 600000); // Every 10 minutes

// Track when windows open
const originalOpenWindowTracking = openWindow;
openWindow = function(id) {
  originalOpenWindowTracking(id);
  
  const appName = windowTaskbarMap[id]?.label || id;
  trackAppUsage(id, appName);
};

// Initialize
loadUserBehavior();