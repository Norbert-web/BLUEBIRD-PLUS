  // Force Desktop Site Mode (CORRECTED VERSION)
function toggleForceDesktopSite(enabled) {
  const viewportMeta = document.getElementById('viewport-meta');
  
  if (enabled) {
    // Force desktop viewport - wider minimum width
    viewportMeta.setAttribute('content', 'width=1280, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes');
    document.body.classList.add('force-desktop-site');
    localStorage.setItem('bluebird-force-desktop', 'true');
    
    // Show reload prompt
    if (confirm('✅ Desktop site mode enabled!\n\n📱 On mobile, you can now pinch to zoom and pan around like a real desktop.\n\nReload page now for best experience?')) {
      location.reload();
    }
  } else {
    // Restore responsive viewport
    viewportMeta.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
    document.body.classList.remove('force-desktop-site');
    localStorage.setItem('bluebird-force-desktop', 'false');
    
    if (confirm('✅ Responsive mobile mode restored.\n\nReload page now?')) {
      location.reload();
    }
  }
}

function loadForceDesktopSetting() {
  const forceDesktop = localStorage.getItem('bluebird-force-desktop') === 'true';
  const viewportMeta = document.getElementById('viewport-meta');
  const checkbox = document.getElementById('setting-force-desktop');
  
  if (forceDesktop) {
    viewportMeta.setAttribute('content', 'width=1280, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes');
    document.body.classList.add('force-desktop-site');
    if (checkbox) checkbox.checked = true;
  } else {
    viewportMeta.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
    if (checkbox) checkbox.checked = false;
  }
}
// Screen Orientation Lock
function setOrientationPreference(orientation) {
  localStorage.setItem('bluebird-orientation', orientation);
  applyOrientationLock(orientation);
}

async function applyOrientationLock(orientation) {
  // Check if Screen Orientation API is supported
  if (!screen.orientation || !screen.orientation.lock) {
    console.log('Screen Orientation API not supported');
    return;
  }
  
  try {
    if (orientation === 'portrait') {
      await screen.orientation.lock('portrait');
      addNotification('Orientation Locked', 'Screen locked to portrait mode', 'info', '📱');
    } else if (orientation === 'landscape') {
      await screen.orientation.lock('landscape');
      addNotification('Orientation Locked', 'Screen locked to landscape mode', 'info', '📱');
    } else {
      screen.orientation.unlock();
      addNotification('Auto-rotate Enabled', 'Screen can rotate freely', 'info', '🔄');
    }
  } catch (err) {
    console.log('Orientation lock failed:', err.message);
    // Silently fail - some browsers/contexts don't allow orientation locking
  }
}

function loadOrientationSetting() {
  const savedOrientation = localStorage.getItem('bluebird-orientation') || 'any';
  const select = document.getElementById('orientation-select');
  
  if (select) {
    select.value = savedOrientation;
  }
  
  // Only apply orientation lock if user has interacted with the page
  if (window.wasInteracted) {
    applyOrientationLock(savedOrientation);
  }
}

// Detect if user is on mobile device
function isMobileDevice() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

// Show helpful hint on mobile
function showMobileHint() {
  if (isMobileDevice() && localStorage.getItem('bluebird-mobile-hint-shown') !== 'true') {
    setTimeout(() => {
      addNotification(
        'Mobile Device Detected',
        'Tip: Enable "Force Desktop Site" in Settings for full desktop experience',
        'info',
        '💡'
      );
      localStorage.setItem('bluebird-mobile-hint-shown', 'true');
    }, 4000);
  }
}

// Expose to global
window.toggleForceDesktopSite = toggleForceDesktopSite;
window.setOrientationPreference = setOrientationPreference;

// REMOVE these old functions - we don't need them anymore:
// - setDisplayMode()
// - loadDisplayMode()











