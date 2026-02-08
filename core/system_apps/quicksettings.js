// Quick Settings Panel
let quickSettingsState = {
  wifi: true,
  bluetooth: false,
  airplane: false,
  nightlight: false,
  focus: false,
  sound: true,
  brightness: 70,
  volume: 50
};

function toggleQuickSettings() {
  const panel = document.getElementById('quick-settings');
  const isVisible = panel.style.display !== 'none';
  
  if (isVisible) {
    panel.style.display = 'none';
  } else {
    panel.style.display = 'block';
    // Close notification center if open
    document.getElementById('notification-center').style.display = 'none';
  }
}

function toggleQuickTile(tileName) {
  const tile = document.getElementById(`${tileName}-tile`);
  const statusEl = tile.querySelector('.quick-tile-status');
  
  quickSettingsState[tileName] = !quickSettingsState[tileName];
  const isActive = quickSettingsState[tileName];
  
  if (isActive) {
    tile.classList.add('active');
    statusEl.textContent = 'On';
  } else {
    tile.classList.remove('active');
    statusEl.textContent = 'Off';
  }
  
  // Handle specific tile actions
  switch(tileName) {
    case 'nightlight':
      applyNightLight(isActive);
      break;
    case 'sound':
      // Update sound status elsewhere in your OS
      if (window.toggleSound) toggleSound();
      break;
    case 'wifi':
    case 'bluetooth':
    case 'airplane':
    case 'focus':
      // Visual feedback only for now
      if (window.playSound) playSound();
      break;
  }
  
  // Save state
  localStorage.setItem('quickSettingsState', JSON.stringify(quickSettingsState));
}

function updateBrightness(value) {
  document.getElementById('brightness-value').textContent = value + '%';
  quickSettingsState.brightness = value;
  
  // Apply brightness filter to body
  const brightness = value / 100;
  document.body.style.filter = `brightness(${brightness})`;
  
  localStorage.setItem('quickSettingsState', JSON.stringify(quickSettingsState));
}

function updateVolume(value) {
  document.getElementById('volume-value').textContent = value + '%';
  quickSettingsState.volume = value;
  
  // If you have audio elements, update their volume
  document.querySelectorAll('audio, video').forEach(media => {
    media.volume = value / 100;
  });
  
  localStorage.setItem('quickSettingsState', JSON.stringify(quickSettingsState));
}

function applyNightLight(enabled) {
  if (enabled) {
    document.body.style.filter = `brightness(${quickSettingsState.brightness / 100}) sepia(0.3) saturate(0.8)`;
  } else {
    document.body.style.filter = `brightness(${quickSettingsState.brightness / 100})`;
  }
}

// Load saved quick settings state
function loadQuickSettingsState() {
  const saved = localStorage.getItem('quickSettingsState');
  if (saved) {
    quickSettingsState = JSON.parse(saved);
    
    // Apply saved states
    Object.keys(quickSettingsState).forEach(key => {
      if (key === 'brightness') {
        document.getElementById('brightness-slider').value = quickSettingsState[key];
        updateBrightness(quickSettingsState[key]);
      } else if (key === 'volume') {
        document.getElementById('volume-slider').value = quickSettingsState[key];
        updateVolume(quickSettingsState[key]);
      } else {
        const tile = document.getElementById(`${key}-tile`);
        if (tile) {
          const statusEl = tile.querySelector('.quick-tile-status');
          if (quickSettingsState[key]) {
            tile.classList.add('active');
            statusEl.textContent = 'On';
          } else {
            tile.classList.remove('active');
            statusEl.textContent = 'Off';
          }
        }
      }
    });
    
    if (quickSettingsState.nightlight) {
      applyNightLight(true);
    }
  }
}

// Load on page load
window.addEventListener('DOMContentLoaded', loadQuickSettingsState);

// Close quick settings when clicking outside
document.addEventListener('click', function(e) {
  const quickSettings = document.getElementById('quick-settings');
  const quickSettingsBtn = document.getElementById('quick-settings-btn'); // You'll need to add this button
  
  if (quickSettings.style.display !== 'none' && 
      !quickSettings.contains(e.target) && 
      (!quickSettingsBtn || !quickSettingsBtn.contains(e.target))) {
    quickSettings.style.display = 'none';
  }
});