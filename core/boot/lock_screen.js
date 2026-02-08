// ===== LOCK SCREEN MINI PANEL FUNCTIONS =====

// Toggle Lock WiFi Panel
function toggleLockWifi() {
  closeLockPanel('lock-power-panel');
  closeLockPanel('lock-accessibility-panel');
  
  const panel = document.getElementById('lock-wifi-panel');
  if (!panel) return;
  
  if (panel.style.display === 'none' || !panel.style.display) {
    panel.style.display = 'block';
  } else {
    panel.style.display = 'none';
  }
}

// Toggle Lock Power Panel
function toggleLockPower() {
  closeLockPanel('lock-wifi-panel');
  closeLockPanel('lock-accessibility-panel');
  
  const panel = document.getElementById('lock-power-panel');
  if (!panel) return;
  
  if (panel.style.display === 'none' || !panel.style.display) {
    panel.style.display = 'block';
  } else {
    panel.style.display = 'none';
  }
}

// Toggle Lock Accessibility Panel
function toggleLockAccessibility() {
  closeLockPanel('lock-wifi-panel');
  closeLockPanel('lock-power-panel');
  
  const panel = document.getElementById('lock-accessibility-panel');
  if (!panel) return;
  
  if (panel.style.display === 'none' || !panel.style.display) {
    panel.style.display = 'block';
  } else {
    panel.style.display = 'none';
  }
}

// Close Lock Panel
function closeLockPanel(panelId) {
  const panel = document.getElementById(panelId);
  if (panel) {
    panel.style.display = 'none';
  }
}

// Close panels when clicking outside
document.addEventListener('click', function(e) {
  const lockPanels = ['lock-wifi-panel', 'lock-power-panel', 'lock-accessibility-panel'];
  const lockBtns = document.querySelectorAll('.lock-action-btn');
  
  let clickedBtn = false;
  lockBtns.forEach(btn => {
    if (btn.contains(e.target)) clickedBtn = true;
  });
  
  if (!clickedBtn) {
    lockPanels.forEach(panelId => {
      const panel = document.getElementById(panelId);
      if (panel && !panel.contains(e.target)) {
        panel.style.display = 'none';
      }
    });
  }
});

// ===== WIFI FUNCTIONS =====
function toggleWifiState(checkbox) {
  const statusIcon = document.querySelector('.lock-network-status svg');
  const statusTitle = document.querySelector('.lock-network-status .status-title');
  const statusSubtitle = document.querySelector('.lock-network-status .status-subtitle');
  
  if (checkbox.checked) {
    statusIcon.classList.remove('offline');
    statusIcon.classList.add('online');
    statusTitle.textContent = 'Connected';
    statusSubtitle.textContent = 'Internet Available';
  } else {
    statusIcon.classList.remove('online');
    statusIcon.classList.add('offline');
    statusTitle.textContent = 'Disconnected';
    statusSubtitle.textContent = 'No Internet';
  }
}

function toggleAirplaneMode(checkbox) {
  const wifiToggle = document.querySelector('.lock-network-toggle input[type="checkbox"]');
  if (checkbox.checked) {
    wifiToggle.checked = false;
    wifiToggle.disabled = true;
    toggleWifiState(wifiToggle);
  } else {
    wifiToggle.disabled = false;
  }
}

// ===== POWER FUNCTIONS FROM LOCK =====
function sleepFromLock() {
  closeLockPanel('lock-power-panel');
  sleepSystem();
}

function restartFromLock() {
  closeLockPanel('lock-power-panel');
  restartSystem();
}

function shutdownFromLock() {
  closeLockPanel('lock-power-panel');
  shutdownSystem();
}

// ===== ACCESSIBILITY FUNCTIONS =====
function toggleHighContrast() {
  const toggle = document.getElementById('high-contrast-toggle');
  const isEnabled = toggle ? toggle.checked : false;
  
  if (isEnabled) {
    document.body.classList.add('high-contrast');
    document.body.style.filter = 'contrast(1.5)';
  } else {
    document.body.classList.remove('high-contrast');
    document.body.style.filter = '';
  }
}

function toggleLargeText() {
  const toggle = document.getElementById('large-text-toggle');
  const isEnabled = toggle ? toggle.checked : false;
  
  if (isEnabled) {
    document.documentElement.style.fontSize = '18px';
  } else {
    document.documentElement.style.fontSize = '';
  }
}

function toggleScreenReader() {
  const toggle = document.getElementById('screen-reader-toggle');
  const isEnabled = toggle ? toggle.checked : false;
  
  if (isEnabled) {
    // Simulate screen reader announcement
    const announcement = document.createElement('div');
    announcement.setAttribute('role', 'alert');
    announcement.setAttribute('aria-live', 'assertive');
    announcement.style.position = 'absolute';
    announcement.style.left = '-10000px';
    announcement.textContent = 'Screen reader enabled';
    document.body.appendChild(announcement);
    
    setTimeout(() => announcement.remove(), 3000);
    
    alert('Screen reader mode enabled. This is a simulation.');
  } else {
    alert('Screen reader mode disabled.');
  }
}

function toggleReduceMotion() {
  const toggle = document.getElementById('reduce-motion-toggle');
  const isEnabled = toggle ? toggle.checked : false;
  
  if (isEnabled) {
    document.body.classList.add('reduce-motion');
    const style = document.createElement('style');
    style.id = 'reduce-motion-style';
    style.textContent = `
      .reduce-motion *,
      .reduce-motion *::before,
      .reduce-motion *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
      }
    `;
    document.head.appendChild(style);
  } else {
    document.body.classList.remove('reduce-motion');
    const style = document.getElementById('reduce-motion-style');
    if (style) style.remove();
  }
}

function toggleColorFilters() {
  const toggle = document.getElementById('color-filter-toggle');
  const isEnabled = toggle ? toggle.checked : false;
  
  if (isEnabled) {
    // Deuteranopia (red-green color blindness) filter
    document.body.style.filter = 'url(#deuteranopia)';
    
    // Create SVG filter if it doesn't exist
    if (!document.getElementById('deuteranopia')) {
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.style.position = 'absolute';
      svg.style.width = '0';
      svg.style.height = '0';
      svg.innerHTML = `
        <defs>
          <filter id="deuteranopia">
            <feColorMatrix type="matrix" values="0.625 0.375 0   0 0
                                                   0.7   0.3   0   0 0
                                                   0     0.3   0.7 0 0
                                                   0     0     0   1 0"/>
          </filter>
        </defs>
      `;
      document.body.appendChild(svg);
    }
  } else {
    document.body.style.filter = '';
  }
}

function toggleMagnifier() {
  const toggle = document.getElementById('magnifier-toggle');
  const isEnabled = toggle ? toggle.checked : false;
  
  if (isEnabled) {
    document.body.style.transform = 'scale(1.5)';
    document.body.style.transformOrigin = 'top left';
    alert('Magnifier enabled. Click again to disable.');
  } else {
    document.body.style.transform = '';
    document.body.style.transformOrigin = '';
  }
}

// ===== LOCK SCREEN FUNCTIONS =====

// Update Lock Screen Time
function updateLockTime() {
  const now = new Date();
  const timeEl = document.getElementById('lock-time');
  const dateEl = document.getElementById('lock-date');
  
  if (timeEl) {
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const displayHours = hours.toString().padStart(2, '0');
    const displayMinutes = minutes.toString().padStart(2, '0');
    timeEl.textContent = `${displayHours}:${displayMinutes}`;
  }
  
  if (dateEl) {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const dateStr = `${days[now.getDay()]}, ${months[now.getMonth()]} ${now.getDate()}`;
    dateEl.textContent = dateStr;
  }
}

// Lock Screen
function lockScreen() {
  const lockScreenEl = document.getElementById('lock-screen');
  const powerMenu = document.getElementById('power-menu');
  const startMenu = document.getElementById('start-menu');
  
  if (!lockScreenEl) return;
  
  // Close all menus
  if (powerMenu) powerMenu.classList.remove('open');
  if (startMenu) startMenu.classList.remove('open');
  
  // Update lock screen with current user info
  const userNameEl = document.getElementById('user-name');
  const lockUserNameEl = document.getElementById('lock-username');
  if (userNameEl && lockUserNameEl) {
    lockUserNameEl.textContent = userNameEl.textContent || 'User';
  }
  
  const userAvatarImg = document.getElementById('user-avatar-img');
  const lockAvatarImg = document.getElementById('lock-avatar-img');
  const lockAvatarText = document.getElementById('lock-avatar-text');
  const userAvatarText = document.getElementById('user-avatar-text');
  
  if (userAvatarImg && lockAvatarImg && lockAvatarText) {
    if (userAvatarImg.style.display !== 'none' && userAvatarImg.src) {
      lockAvatarImg.src = userAvatarImg.src;
      lockAvatarImg.style.display = 'block';
      lockAvatarText.style.display = 'none';
    } else if (userAvatarText) {
      lockAvatarText.textContent = userAvatarText.textContent || 'U';
      lockAvatarImg.style.display = 'none';
      lockAvatarText.style.display = 'flex';
    }
  }
  
  // Show lock screen
  lockScreenEl.classList.add('active');
  lockScreenEl.style.display = 'block';
  
  // Make lock screen unremovable if password is set
  if (securitySystem.hasPassword()) {
    lockScreenEl.style.pointerEvents = 'auto';
    // Prevent closing lock screen without password
    lockScreenEl.setAttribute('data-protected', 'true');
  }
  
  // Update time immediately and start interval
  updateLockTime();
  if (window.lockTimeInterval) clearInterval(window.lockTimeInterval);
  window.lockTimeInterval = setInterval(updateLockTime, 1000);
  
  // Reset password input state
  const passwordContainer = document.getElementById('lock-password-container');
  const unlockBtn = document.getElementById('lock-unlock-btn');
  const passwordInput = document.getElementById('lock-password-input');
  const errorMessage = document.getElementById('lock-error-message');
  
  if (passwordContainer) passwordContainer.style.display = 'none';
  if (unlockBtn) unlockBtn.style.display = 'flex';
  if (passwordInput) {
    passwordInput.value = '';
    passwordInput.disabled = false;
  }
  if (errorMessage) errorMessage.style.display = 'none';
}

// Show Password Input
// Update showPasswordInput to check for password
function showPasswordInput() {
  if (!securitySystem.hasPassword()) {
    // No password - offer to set one or unlock directly
    if (confirm('No password set. Would you like to set up a password for security?')) {
      openPasswordSetup();
    } else {
      unlockScreen();
    }
    return;
  }
  
  const passwordContainer = document.getElementById('lock-password-container');
  const unlockBtn = document.getElementById('lock-unlock-btn');
  const passwordInput = document.getElementById('lock-password-input');
  
  if (!passwordContainer || !unlockBtn) return;
  
  passwordContainer.style.display = 'block';
  unlockBtn.style.display = 'none';
  
  // Focus password input
  setTimeout(() => {
    if (passwordInput) {
      passwordInput.focus();
    }
  }, 100);
}

// Toggle Password Visibility
function togglePasswordVisibility() {
  const passwordInput = document.getElementById('lock-password-input');
  const btn = event.currentTarget;
  
  if (!passwordInput || !btn) return;
  
  if (passwordInput.type === 'password') {
    passwordInput.type = 'text';
    btn.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
        <line x1="1" y1="1" x2="23" y2="23"></line>
      </svg>
    `;
  } else {
    passwordInput.type = 'password';
    btn.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
        <circle cx="12" cy="12" r="3"></circle>
      </svg>
    `;
  }
}

// UNLOCK SCREEN FUNCTION 

function unlockScreen() {
  const passwordInput = document.getElementById('lock-password-input');
  const errorMessage = document.getElementById('lock-error-message');
  const lockScreenEl = document.getElementById('lock-screen');
  const passwordContainer = document.getElementById('lock-password-container');
  
  if (!lockScreenEl) return;
  
  // Check if password is set
  if (!securitySystem.hasPassword()) {
    // No password set - unlock directly
    performUnlock();
    return;
  }
  
  // Check if password input is visible
  if (passwordContainer && passwordContainer.style.display !== 'none') {
    const password = passwordInput ? passwordInput.value : '';
    
    if (password.length === 0) {
      if (errorMessage) {
        errorMessage.textContent = 'Please enter a password';
        errorMessage.style.display = 'block';
        if (passwordInput) passwordInput.focus();
        
        setTimeout(() => {
          if (errorMessage) errorMessage.style.display = 'none';
        }, 3000);
      }
      return;
    }
    
    // Verify password
    if (securitySystem.verifyPassword(password)) {
      // Correct password
      securitySystem.resetAttempts();
      performUnlock();
    } else {
      // Incorrect password
      const attempts = securitySystem.incrementAttempts();
      const remaining = securitySystem.maxAttempts - attempts;
      
      if (remaining <= 0) {
        // Max attempts reached - offer recovery
        if (errorMessage) {
          errorMessage.innerHTML = `
            Too many failed attempts. 
            <a href="#" onclick="openPasswordRecovery(); return false;" style="color: #3b82f6; text-decoration: underline;">
              Forgot password?
            </a>
          `;
          errorMessage.style.display = 'block';
        }
        if (passwordInput) {
          passwordInput.value = '';
          passwordInput.disabled = true;
        }
      } else {
        if (errorMessage) {
          errorMessage.textContent = `Incorrect password. ${remaining} attempts remaining.`;
          errorMessage.style.display = 'block';
          if (passwordInput) {
            passwordInput.value = '';
            passwordInput.focus();
          }
          
          setTimeout(() => {
            if (errorMessage) errorMessage.style.display = 'none';
          }, 3000);
        }
      }
    }
  }
}

function performUnlock() {
  const lockScreenEl = document.getElementById('lock-screen');
  
  // Unlock animation
  lockScreenEl.style.animation = 'lockFadeOut 0.5s ease forwards';
  
  setTimeout(() => {
    lockScreenEl.classList.remove('active');
    lockScreenEl.style.display = 'none';
    lockScreenEl.style.animation = '';
    
    // Clear interval
    if (window.lockTimeInterval) {
      clearInterval(window.lockTimeInterval);
    }
    
    // Reset password input
    const passwordContainer = document.getElementById('lock-password-container');
    const unlockBtn = document.getElementById('lock-unlock-btn');
    const passwordInput = document.getElementById('lock-password-input');
    const errorMessage = document.getElementById('lock-error-message');
    
    if (passwordContainer) passwordContainer.style.display = 'none';
    if (unlockBtn) unlockBtn.style.display = 'flex';
    if (passwordInput) {
      passwordInput.value = '';
      passwordInput.disabled = false;
    }
    if (errorMessage) errorMessage.style.display = 'none';
  }, 500);
}

// Add Enter key support for password input
document.addEventListener('DOMContentLoaded', function() {
  const passwordInput = document.getElementById('lock-password-input');
  if (passwordInput) {
    passwordInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        unlockScreen();
      }
    });
  }
  
  // Initialize lock time
  updateLockTime();
});

// Accessibility Toggle
function toggleAccessibility() {
  console.log('Accessibility options');
  alert('Accessibility settings would open here');
}

// Add lockFadeOut animation to CSS
const style = document.createElement('style');
style.textContent = `
  @keyframes lockFadeOut {
    to {
      opacity: 0;
      transform: scale(1.05);
    }
  }
`;
document.head.appendChild(style);

