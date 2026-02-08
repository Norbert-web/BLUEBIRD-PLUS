// ===== POWER MENU & ACTIONS =====

function togglePowerMenu() {
  const menu = document.getElementById('power-menu');
  if (!menu) return;

  if (menu.classList.contains('open')) {
    menu.classList.remove('open');
  } else {
    menu.classList.add('open');
    
    // Close other panels
    const volumePanel = document.getElementById('volume-panel');
    const wifiPanel = document.getElementById('wifi-panel');
    const settingsPanel = document.getElementById('taskbar-settings-panel');
    const calendarPanel = document.getElementById('calendar-panel');
    const searchPanel = document.getElementById('search-panel');
    
    if (volumePanel) volumePanel.style.display = 'none';
    if (wifiPanel) wifiPanel.style.display = 'none';
    if (settingsPanel) settingsPanel.style.display = 'none';
    if (calendarPanel) calendarPanel.style.display = 'none';
    if (searchPanel) searchPanel.style.display = 'none';
  }
}

// Close power menu when clicking outside
document.addEventListener('click', function(e) {
  const powerMenu = document.getElementById('power-menu');
  const powerBtns = document.querySelectorAll('[onclick*="togglePowerMenu"]');
  
  let clickedPowerBtn = false;
  powerBtns.forEach(btn => {
    if (btn.contains(e.target)) clickedPowerBtn = true;
  });
  
  if (powerMenu && powerMenu.classList.contains('open')) {
    if (!powerMenu.contains(e.target) && !clickedPowerBtn) {
      powerMenu.classList.remove('open');
    }
  }
});

function sleepSystem() {
  const powerMenu = document.getElementById('power-menu');
  if (powerMenu) powerMenu.classList.remove('open');
  
  const sleepOverlay = document.createElement('div');
  sleepOverlay.id = 'sleep-overlay';
  sleepOverlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: #000;
    z-index: 999999;
    cursor: pointer;
  `;
  document.body.appendChild(sleepOverlay);
  
  sleepOverlay.addEventListener('click', function() {
    sleepOverlay.remove();
  });
}

function signOutUser() {
  const powerMenu = document.getElementById('power-menu');
  if (powerMenu) powerMenu.classList.remove('open');
  
  if (confirm('Are you sure you want to sign out?')) {
    document.querySelectorAll('.window').forEach(win => win.remove());
    const taskbarCenter = document.getElementById('taskbar-center');
    if (taskbarCenter) taskbarCenter.innerHTML = '';
    lockScreen();
  }
}
function restartSystem() {
  const powerMenu = document.getElementById('power-menu');
  if (powerMenu) powerMenu.classList.remove('open');
  
  if (confirm('Are you sure you want to restart?')) {
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(135deg, #0a0e27, #1a1f3a);
      z-index: 999999;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      font-size: 24px;
    `;
    overlay.innerHTML = `
      <div style="text-align: center;">
        <div style="width: 60px; height: 60px; border: 4px solid rgba(255,255,255,0.2); border-top-color: #3b82f6; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 20px;"></div>
        <div style="font-size: 20px; font-weight: 500;">Restarting...</div>
        <div style="font-size: 14px; opacity: 0.7; margin-top: 8px;">Please wait</div>
      </div>
    `;
    document.body.appendChild(overlay);
    
    setTimeout(() => {
      overlay.remove();
      // If password is set, lock screen instead of just reloading
      if (securitySystem.hasPassword()) {
        // Close all windows
        document.querySelectorAll('.window').forEach(win => win.remove());
        const taskbarCenter = document.getElementById('taskbar-center');
        if (taskbarCenter) taskbarCenter.innerHTML = '';
        
        // Lock screen
        lockScreen();
      } else {
        location.reload();
      }
    }, 2000);
  }
}

function shutdownSystem() {
  const powerMenu = document.getElementById('power-menu');
  if (powerMenu) powerMenu.classList.remove('open');
  
  if (confirm('Are you sure you want to shut down?')) {
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: #000;
      z-index: 999999;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      font-size: 24px;
      flex-direction: column;
      gap: 20px;
    `;
    overlay.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="64" height="64" style="color: #fff; opacity: 0.8;">
        <path d="M18.36 6.64a9 9 0 1 1-12.73 0"></path>
        <line x1="12" y1="2" x2="12" y2="12"></line>
      </svg>
      <div>Shutting down...</div>
      <div style="font-size: 16px; opacity: 0.7;">Goodbye</div>
    `;
    document.body.appendChild(overlay);
    
    setTimeout(() => {
      overlay.innerHTML = `
        <div style="font-size: 24px; font-weight: 300; text-align: center; padding: 40px;">
          It's now safe to close this window
        </div>
      `;
      
      // If password is set, show shutdown screen permanently
      // User must close browser/tab manually
    }, 3000);
  }
}