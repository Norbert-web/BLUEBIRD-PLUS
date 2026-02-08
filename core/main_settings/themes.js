  // Theme System
const themes = {
  'bluebird-dark': {
    '--bg': 'linear-gradient(135deg, #0f1724 0%, #1a2332 100%)',
    '--panel': '#0b1220',
    '--window-bg': 'rgba(15, 23, 36, 0.95)',
    '--text': '#e6eef8',
    '--accent': '#4ade80',
    '--taskbar-bg': 'rgba(11, 18, 32, 0.85)',
    '--border': '#1f2a37'
  },
  'bluebird-light': {
    '--bg': 'linear-gradient(135deg, #f0f4f8 0%, #e1e8ed 100%)',
    '--panel': '#ffffff',
    '--window-bg': 'rgba(255, 255, 255, 0.95)',
    '--text': '#1e293b',
    '--accent': '#3b82f6',
    '--taskbar-bg': 'rgba(241, 245, 249, 0.9)',
    '--border': '#cbd5e1'
  },
  'midnight-purple': {
    '--bg': 'linear-gradient(135deg, #1a0b2e 0%, #2d1b4e 100%)',
    '--panel': '#150a28',
    '--window-bg': 'rgba(26, 11, 46, 0.95)',
    '--text': '#e0d4ff',
    '--accent': '#a78bfa',
    '--taskbar-bg': 'rgba(20, 10, 40, 0.85)',
    '--border': '#3d2b5f'
  },
  'ocean-breeze': {
    '--bg': 'linear-gradient(135deg, #0c2340 0%, #1e3a5f 100%)',
    '--panel': '#081a30',
    '--window-bg': 'rgba(12, 35, 64, 0.95)',
    '--text': '#dbeafe',
    '--accent': '#06b6d4',
    '--taskbar-bg': 'rgba(8, 26, 48, 0.85)',
    '--border': '#1e3a5f'
  },
  'sunset-orange': {
    '--bg': 'linear-gradient(135deg, #2d1810 0%, #4a2618 100%)',
    '--panel': '#231208',
    '--window-bg': 'rgba(45, 24, 16, 0.95)',
    '--text': '#ffedd5',
    '--accent': '#fb923c',
    '--taskbar-bg': 'rgba(35, 18, 12, 0.85)',
    '--border': '#4a2618'
  },
  'forest-green': {
    '--bg': 'linear-gradient(135deg, #0f2415 0%, #1a3a24 100%)',
    '--panel': '#0a1c0f',
    '--window-bg': 'rgba(15, 36, 21, 0.95)',
    '--text': '#d1fae5',
    '--accent': '#22c55e',
    '--taskbar-bg': 'rgba(10, 28, 15, 0.85)',
    '--border': '#1a3a24'
  },
  'rose-gold': {
    '--bg': 'linear-gradient(135deg, #2a1a1f 0%, #3d2630 100%)',
    '--panel': '#1f1218',
    '--window-bg': 'rgba(42, 26, 31, 0.95)',
    '--text': '#fce7f3',
    '--accent': '#f5a3b8',
    '--taskbar-bg': 'rgba(31, 18, 24, 0.85)',
    '--border': '#3d2630'
  },
  'cyber-neon': {
    '--bg': 'linear-gradient(135deg, #0a0e1a 0%, #1a1f35 100%)',
    '--panel': '#060a14',
    '--window-bg': 'rgba(10, 14, 26, 0.95)',
    '--text': '#00ffff',
    '--accent': '#00ffff',
    '--taskbar-bg': 'rgba(6, 10, 20, 0.85)',
    '--border': '#1a1f35'
  },
  'cherry-blossom': {
    '--bg': 'linear-gradient(135deg, #fef3f5 0%, #fce7eb 100%)',
    '--panel': '#fff5f7',
    '--window-bg': 'rgba(255, 255, 255, 0.95)',
    '--text': '#881337',
    '--accent': '#ec4899',
    '--taskbar-bg': 'rgba(254, 242, 242, 0.9)',
    '--border': '#fecdd3'
  },
  'arctic-blue': {
    '--bg': 'linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%)',
    '--panel': '#f0f9ff',
    '--window-bg': 'rgba(255, 255, 255, 0.95)',
    '--text': '#0c4a6e',
    '--accent': '#0284c7',
    '--taskbar-bg': 'rgba(240, 249, 255, 0.9)',
    '--border': '#7dd3fc'
  },
  'mocha-coffee': {
    '--bg': 'linear-gradient(135deg, #3e2723 0%, #5d4037 100%)',
    '--panel': '#2e1f1b',
    '--window-bg': 'rgba(62, 39, 35, 0.95)',
    '--text': '#efebe9',
    '--accent': '#d4a574',
    '--taskbar-bg': 'rgba(46, 31, 27, 0.85)',
    '--border': '#5d4037'
  },
  'lavender-dreams': {
    '--bg': 'linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%)',
    '--panel': '#faf5ff',
    '--window-bg': 'rgba(255, 255, 255, 0.95)',
    '--text': '#4a148c',
    '--accent': '#9c27b0',
    '--taskbar-bg': 'rgba(250, 245, 255, 0.9)',
    '--border': '#ce93d8'
  }
};

// Apply theme function (keep the same)

function applyTheme(themeName) {
  const theme = themes[themeName];
  if (!theme) return;
  
  // Set variables on BODY element to override any CSS class variables
  const body = document.body;
  Object.keys(theme).forEach(property => {
    body.style.setProperty(property, theme[property]);
  });
  
  // Save theme preference
  localStorage.setItem('selectedTheme', themeName);
  
  // Update active theme card
  document.querySelectorAll('.theme-card').forEach(card => {
    card.classList.remove('active');
  });
  const activeCard = document.querySelector(`.theme-card[data-theme="${themeName}"]`);
  if (activeCard) {
    activeCard.classList.add('active');
  }
  
  // Update body class for light themes (for other CSS rules)
  const lightThemes = ['bluebird-light', 'cherry-blossom', 'arctic-blue', 'lavender-dreams'];
  document.body.classList.remove('light-theme', 'dark-theme');
  if (lightThemes.includes(themeName)) {
    document.body.classList.add('light-theme');
  } else {
    document.body.classList.add('dark-theme');
  }
  
  // Play sound effect if available
  if (window.playSound) {
    playSound();
  }
}
// Load saved theme on page load
function loadSavedTheme() {
  const savedTheme = localStorage.getItem('selectedTheme');
  if (savedTheme && themes[savedTheme]) {
    applyTheme(savedTheme);
  } else {
    // Apply default theme
    applyTheme('bluebird-dark');
  }
}

// Call this when page loads
window.addEventListener('DOMContentLoaded', loadSavedTheme);
  // Settings section navigation
function showSettingsSection(sectionName) {
  // Hide all sections
  document.querySelectorAll('.settings-section').forEach(section => {
    section.classList.remove('active');
  });
  
  // Remove active state from all nav items
  document.querySelectorAll('.settings-nav-item').forEach(item => {
    item.classList.remove('active');
  });
  
  // Show selected section
  const selectedSection = document.getElementById(`settings-${sectionName}`);
  if (selectedSection) {
    selectedSection.classList.add('active');
  }
  
  // Add active state to clicked nav item
  event.target.closest('.settings-nav-item').classList.add('active');
}

// Update animation intensity display
function updateAnimationIntensity(value) {
  document.getElementById('intensity-value').textContent = value;
  // Add your actual animation intensity logic here
  if (window.setBackgroundAnimationIntensity) {
    window.setBackgroundAnimationIntensity(value);
  }
}
// Initialize taskbar time
function updateTaskbarTime() {
  const now = new Date();
  const timeEl = document.getElementById('taskbar-time');
  const dateEl = document.getElementById('taskbar-date');
  
  if (timeEl) {
    timeEl.textContent = now.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  }
  
  if (dateEl) {
    dateEl.textContent = now.toLocaleDateString('en-US', { 
      month: 'numeric', 
      day: 'numeric',
      year: 'numeric'
    });
  }
}

updateTaskbarTime();
setInterval(updateTaskbarTime, 1000);

// Taskbar Settings Functions
function toggleTaskbarSettings() {
  const panel = document.getElementById('taskbar-settings-panel');
  if (panel.style.display === 'none') {
    panel.style.display = 'block';
  } else {
    panel.style.display = 'none';
  }
}

function setTaskbarPosition(position) {
  const taskbar = document.getElementById('taskbar');
  taskbar.classList.remove('taskbar-bottom', 'taskbar-top', 'taskbar-left', 'taskbar-right', 'taskbar-horizontal', 'taskbar-vertical');
  
  if (position === 'bottom' || position === 'top') {
    taskbar.classList.add('taskbar-horizontal', `taskbar-${position}`);
  } else {
    taskbar.classList.add('taskbar-vertical', `taskbar-${position}`);
  }
}

function setTaskbarAlignment(alignment) {
  const taskbar = document.getElementById('taskbar');
  if (alignment === 'center') {
    taskbar.classList.add('taskbar-center-aligned');
  } else {
    taskbar.classList.remove('taskbar-center-aligned');
  }
}

function setTaskbarAutoHide(enabled) {
  const taskbar = document.getElementById('taskbar');
  if (enabled) {
    taskbar.classList.add('taskbar-autohide');
  } else {
    taskbar.classList.remove('taskbar-autohide');
  }
}

function setTaskbarExtend(enabled) {
  const taskbar = document.getElementById('taskbar');
  if (enabled) {
    taskbar.classList.add('taskbar-extend');
  } else {
    taskbar.classList.remove('taskbar-extend');
  }
}

function setTaskbarSize(size) {
  const taskbar = document.getElementById('taskbar');
  taskbar.classList.remove('taskbar-size-small', 'taskbar-size-medium', 'taskbar-size-large');
  taskbar.classList.add(`taskbar-size-${size}`);
}

// Placeholder functions (implement as needed)
function toggleCalendar() {
  console.log('Calendar toggled');
}