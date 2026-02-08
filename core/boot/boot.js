// Splash Screen Controller
(function() {
  const splashMessages = [
    'Initializing system',
    'Loading resources',
    'Preparing interface',
    'Almost ready',
    'Starting Bluebird OS'
  ];
  
  let messageIndex = 0;
  const statusElement = document.getElementById('splash-status');
  
  // Cycle through status messages
  const messageInterval = setInterval(() => {
    if (statusElement && messageIndex < splashMessages.length) {
      statusElement.style.opacity = '0';
      setTimeout(() => {
        statusElement.textContent = splashMessages[messageIndex];
        statusElement.style.opacity = '1';
        messageIndex++;
      }, 300);
    }
  }, 600);
    // Remove splash screen after loading
  window.addEventListener('load', () => {
    setTimeout(() => {
      clearInterval(messageInterval);
      const splash = document.getElementById('splash');
      if (splash) {
        splash.classList.add('fade-out');
        setTimeout(() => {
          splash.style.display = 'none';
          splash.setAttribute('aria-hidden', 'true');
        }, 800);
      }
    }, 2000); // Show for 2 seconds after page load
  });
})();
// ===== GLOBAL STATE =====
let currentWall = 0;
let windows = {};
let resizing = null;
let windowZIndex = 100;
const windowTaskbarMap = {
  'resume-win': { icon: '📝', label: 'Resume' },
  'projects-win': { icon: '🚀', label: 'Projects' },
  'connect-win': { icon: '📬', label: 'Connect' },
  'settings-win': { icon: '⚙️', label: 'Settings' }
};

// ===== UTILS: adjust window to content (best-effort) =====
function adjustWindowToContent(winEl) {
  if (!winEl) return;
  try {
    const body = winEl.querySelector('.window-body');
    if (!body) return;
    // measure content
    const contentRect = body.getBoundingClientRect();
    // compute required width based on scrollWidth (content inside)
    const desiredWidth = Math.min(window.innerWidth * 0.92, Math.max(parseFloat(getComputedStyle(winEl).minWidth) || 320, body.scrollWidth + 48));
    const desiredHeight = Math.min(window.innerHeight * 0.9, Math.max(parseFloat(getComputedStyle(winEl).minHeight) || 220, body.scrollHeight + (winEl.querySelector('.window-header') ? winEl.querySelector('.window-header').offsetHeight : 48) + 24));
    winEl.style.width = desiredWidth + 'px';
    winEl.style.height = desiredHeight + 'px';
    // Clamp position into viewport
    const rect = winEl.getBoundingClientRect();
    if (rect.right > window.innerWidth - 12) winEl.style.left = Math.max(12, window.innerWidth - desiredWidth - 12) + 'px';
    if (rect.bottom > window.innerHeight - 12) winEl.style.top = Math.max(12, window.innerHeight - desiredHeight - 12) + 'px';
  } catch(e){ console.warn('adjustWindowToContent failed', e); }
}

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
  // Load settings (appearance/behavior)
  loadSettings();
  // Show app download modal after load
showAppDownloadModal();

  // Load viewport and orientation settings
loadForceDesktopSetting();
loadOrientationSetting();
// Initialize background animations
initBackgroundAnimation();
// Show InspireBoard promo after app download modal
showInspirePromo();

// Show mobile hint if applicable
showMobileHint();
  // apply setting toggles UI
  const clearBadgeCheckbox = document.getElementById('setting-clear-badge');
  if (clearBadgeCheckbox) clearBadgeCheckbox.checked = !!settings.clearBadgeOnOpen;
  const fitToContentCheckbox = document.getElementById('setting-fit-to-content');
  if (fitToContentCheckbox) fitToContentCheckbox.checked = !!settings.fitWindowsToContent;

  // Load theme & accent
  const theme = localStorage.getItem('bluebird-theme');
  if (theme === 'light') { document.body.classList.remove('dark-theme'); document.body.classList.add('light-theme'); }
  else { document.body.classList.remove('light-theme'); document.body.classList.add('dark-theme'); }
  const savedAccent = localStorage.getItem('bluebird-accent');
  if (savedAccent) changeAccentColor(savedAccent, false);

  // Load saved icon size and apply class
  const savedIconSize = localStorage.getItem('bluebird-icon-size') || 'medium';
  applyIconSize(savedIconSize, false);

  const savedBg = localStorage.getItem('bluebird-custom-wall');
  if (savedBg) setCustomBackground(savedBg, false);

  // Load user avatar
  loadUserAvatar();

  // Load installed apps
  loadInstalledApps();

  // Load user name
  const savedName = localStorage.getItem('bluebird-user-name');
  if (savedName) { document.getElementById('user-name').textContent = savedName; updateAvatarText(savedName); }

  // Splash → Desktop
  setTimeout(() => {
    document.getElementById('splash').style.opacity = '0';
    setTimeout(() => {
      document.getElementById('splash').style.display = 'none';
      document.getElementById('desktop').classList.add('loaded');
      document.getElementById('desktop').removeAttribute('aria-hidden');
      const soundPref = localStorage.getItem('bluebird-sound') !== 'off';
      if (soundPref && window.wasInteracted) {
        document.getElementById('welcome-sound').play().catch(e => console.log('Sound blocked:', e));
      }
    }, 700);
  }, 900);

  // Wallpaper initial
  const wallpapers = ['savannah', 'kampala', 'nile', 'techlab'];
  const savedWall = localStorage.getItem('bluebird-wallpaper');
  const uploadedWall = localStorage.getItem('bluebird-uploaded-wallpaper');

  if (uploadedWall) {
    const wallEl = document.getElementById('wall-uploaded');
    wallEl.style.backgroundImage = `url(${uploadedWall})`;
    setActiveWallpaper('uploaded');
  } else if (savedWall && wallpapers.includes(savedWall)) {
    currentWall = wallpapers.indexOf(savedWall);
    setActiveWallpaper(savedWall);
  } else {
    setActiveWallpaper('savannah');
  }

  // Modal button bindings
  document.getElementById('modal-cancel').addEventListener('click', closeConfirmModal);
  document.getElementById('modal-confirm').addEventListener('click', openTerminalConfirmed);

  // Escape closes modal / context menu
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { closeConfirmModal(); hideDesktopContextMenu(); }
  });

  // Desktop context: right-click / long-press
  const desktop = document.getElementById('desktop');
  desktop.addEventListener('contextmenu', (e) => {
    if (e.target.closest('.icon') || e.target.closest('.window') || e.target.closest('#start-menu')) return;
    e.preventDefault();
    showDesktopContextMenu(e.clientX, e.clientY);
  });

  // long-press support for touch devices
  let longPressTimer = null;
  desktop.addEventListener('touchstart', (e) => {
    if (e.target.closest('.icon') || e.target.closest('.window') || e.target.closest('#start-menu')) return;
    longPressTimer = setTimeout(()=>{
      const touch = (e.touches && e.touches[0]) || e;
      showDesktopContextMenu(touch.clientX, touch.clientY);
    }, 600);
  }, {passive:true});
  desktop.addEventListener('touchend', ()=>{ clearTimeout(longPressTimer); });

  // Close context menu with Escape
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') hideDesktopContextMenu(); });
});

// Track user interaction for sound
window.wasInteracted = false;
document.addEventListener('click', () => { window.wasInteracted = true; }, { once: true });

// ===== WALLPAPER =====
function cycleWallpaper() {
  const wallpapers = ['savannah', 'kampala', 'nile', 'techlab'];
  currentWall = (currentWall + 1) % wallpapers.length;
  const next = wallpapers[currentWall];
  setActiveWallpaper(next);
  localStorage.setItem('bluebird-wallpaper', next);
}
function setActiveWallpaper(name) {
  document.querySelectorAll('.wallpaper').forEach(w => w.classList.remove('active'));
  const el = document.getElementById('wall-' + name) || document.getElementById('wall-custom');
  if (el) el.classList.add('active');
  localStorage.setItem('bluebird-wallpaper', name);
}
function setCustomBackground(hex, persist=true) {
  const el = document.getElementById('wall-custom');
  const darker = shadeColor(hex, -18);
  el.style.background = `linear-gradient(135deg, ${hex} 0%, ${darker} 100%)`;
  setActiveWallpaper('custom');
  if (persist) localStorage.setItem('bluebird-custom-wall', hex);
}
function clearCustomBackground(){
  localStorage.removeItem('bluebird-custom-wall');
  setActiveWallpaper('savannah');
}
function uploadCustomWallpaper(event) {
  const file = event.target.files[0]; if (!file) return;
  if (!file.type.startsWith('image/')) { alert('Please select a valid image file'); return; }
  const reader = new FileReader();
  reader.onload = (e) => {
    const dataUrl = e.target.result;
    const wallEl = document.getElementById('wall-uploaded');
    wallEl.style.backgroundImage = `url(${dataUrl})`;
    localStorage.setItem('bluebird-uploaded-wallpaper', dataUrl);
    setActiveWallpaper('uploaded');
  };
  reader.readAsDataURL(file);
}
function clearUploadedWallpaper() {
  localStorage.removeItem('bluebird-uploaded-wallpaper');
  const wallEl = document.getElementById('wall-uploaded'); wallEl.style.backgroundImage = '';
  setActiveWallpaper('savannah');
  const input = document.getElementById('wallpaper-upload'); if (input) input.value = '';
}
function shadeColor(color, percent) {
  let R = parseInt(color.substring(1,3),16);
  let G = parseInt(color.substring(3,5),16);
  let B = parseInt(color.substring(5,7),16);
  R = parseInt(R * (100 + percent) / 100);
  G = parseInt(G * (100 + percent) / 100);
  B = parseInt(B * (100 + percent) / 100);
  R = (R<255)?R:255; G = (G<255)?G:255; B = (B<255)?B:255;
  const RR = ((R.toString(16).length==1)?"0"+R.toString(16):R.toString(16));
  const GG = ((G.toString(16).length==1)?"0"+G.toString(16):G.toString(16));
  const BB = ((B.toString(16).length==1)?"0"+B.toString(16):B.toString(16));
  return "#"+RR+GG+BB;
}

// ===== SOUND =====
function toggleSound() {
  const isOn = localStorage.getItem('bluebird-sound') !== 'off';
  if (isOn) {
    localStorage.setItem('bluebird-sound', 'off');
    document.getElementById('sound-status').textContent = 'Sound: Off';
  } else {
    localStorage.setItem('bluebird-sound', 'on');
    document.getElementById('sound-status').textContent = 'Sound: On';
  }
}

// ===== THEME & ACCENT =====
function toggleTheme() {
  const isDark = document.body.classList.contains('dark-theme');
  if (isDark) {
    document.body.classList.remove('dark-theme');
    document.body.classList.add('light-theme');
    localStorage.setItem('bluebird-theme', 'light');
  } else {
    document.body.classList.remove('light-theme');
    document.body.classList.add('dark-theme');
    localStorage.setItem('bluebird-theme', 'dark');
  }
}
function toggleThemeFromContext(){ hideDesktopContextMenu(); toggleTheme(); }

function changeAccentColor(hex, persist=true) {
  document.documentElement.style.setProperty('--accent', hex);
  if (persist) localStorage.setItem('bluebird-accent', hex);
  const accentInput = document.getElementById('settings-accent');
  if (accentInput) accentInput.value = hex;
}
function openAccentColorPicker(){
  hideDesktopContextMenu();
  const picker = document.getElementById('desktop-accent-picker');
  picker.value = localStorage.getItem('bluebird-accent') || '#4ade80';
  picker.onchange = function(){ changeAccentColor(this.value); };
  picker.click();
}

// ===== WINDOWS (open/close/minimize/maximize) ===== And there is bit of a bug here more code needed coz te window snap system is not working at all
function openWindow(id) {
  const win = document.getElementById(id);
  if (!win) return;
  windowZIndex++; win.style.zIndex = windowZIndex;
  win.style.display = 'flex'; win.classList.add('active'); windows[id] = true;
  // adjust width/height to fit content if setting enabled
  if (settings.fitWindowsToContent) {
    setTimeout(()=>adjustWindowToContent(win), 180);
  }
  updateTaskbar();
}
function closeWindow(id) {
  const win = document.getElementById(id);
  if (!win) return;
  win.style.display = 'none'; win.classList.remove('active'); delete windows[id];
  updateTaskbar();
}
function minimizeWindow(id) {
  const win = document.getElementById(id);
  if (!win) return;
  win.style.display = 'none'; win.classList.remove('active');
  updateTaskbar();
}
function maximizeWindow(id) {
  const win = document.getElementById(id);
  if (!win) return;
  if (win.classList.contains('maximized')) {
    win.classList.remove('maximized');
    win.style.width = win.dataset.origWidth || '';
    win.style.height = win.dataset.origHeight || '';
    win.style.top = win.dataset.origTop || '';
    win.style.left = win.dataset.origLeft || '';
  } else {
    win.dataset.origWidth = win.style.width || '';
    win.dataset.origHeight = win.style.height || '';
    win.dataset.origTop = win.style.top || '';
    win.dataset.origLeft = win.style.left || '';
    win.style.width = '92%';
    win.style.height = '84%';
    win.style.top = '6%';
    win.style.left = '4%';
    win.classList.add('maximized');
  }
  win.classList.add('active');
}

function updateTaskbar() {
  const taskbarCenter = document.getElementById('taskbar-center');
  taskbarCenter.innerHTML = '';
  for (const winId in windows) {
    const info = windowTaskbarMap[winId];
    if (!info) continue;
    const win = document.getElementById(winId);
    const isActive = win && win.classList.contains('active') && win.style.display !== 'none';
    const icon = document.createElement('div');
    icon.className = 'taskbar-icon' + (isActive ? ' active' : '');
    icon.innerHTML = info.icon;
    icon.setAttribute('role', 'button');
    icon.setAttribute('aria-label', info.label);
    icon.setAttribute('title', info.label);
    icon.onclick = () => {
      if (win.style.display === 'none') {
        win.style.display = 'flex';
        win.classList.add('active');
        windowZIndex++; win.style.zIndex = windowZIndex;
      } else if (isActive) {
        minimizeWindow(winId);
      } else {
        windowZIndex++; win.style.zIndex = windowZIndex; win.classList.add('active');
      }
      updateTaskbar();
    };
    taskbarCenter.appendChild(icon);
  }
}
function addAppToTaskbar(appKey, manifest) {
  windowTaskbarMap[appKey] = { icon: manifest.icon || '📦', label: manifest.name || 'App' };
}

// ===== START MENU =====
let startMenuOpen = false;
const startBtn = document.getElementById('start-button');
function toggleStartMenu() {
  const menu = document.getElementById('start-menu');
  startMenuOpen = !startMenuOpen;
  menu.classList.toggle('open', startMenuOpen);
  startBtn.setAttribute('aria-expanded', String(startMenuOpen));
}
document.addEventListener('click', (e) => {
  if (!e.target.closest('.start-btn') && !e.target.closest('#start-menu')) {
    document.getElementById('start-menu').classList.remove('open');
    startMenuOpen = false;
    startBtn.setAttribute('aria-expanded', 'false');
  }
});

// ===== RESIZE & DRAG =====
function startResize(e, id) {
  e.preventDefault();
  resizing = { id, startX: e.clientX, startY: e.clientY };
  document.addEventListener('mousemove', doResize);
  document.addEventListener('mouseup', stopResize);
}
function doResize(e) {
  if (!resizing) return;
  const win = document.getElementById(resizing.id);
  const dx = e.clientX - resizing.startX;
  const dy = e.clientY - resizing.startY;
  let width = parseFloat(getComputedStyle(win).width) + dx;
  let height = parseFloat(getComputedStyle(win).height) + dy;
  if (Number.isFinite(width) && width > 320) win.style.width = width + 'px';
  if (Number.isFinite(height) && height > 220) win.style.height = height + 'px';
  resizing.startX = e.clientX;
  resizing.startY = e.clientY;
}
function stopResize() {
  document.removeEventListener('mousemove', doResize);
  document.removeEventListener('mouseup', stopResize);
  resizing = null;
}
function makeHeaderDraggable(header) {
  header.addEventListener('mousedown', (e) => {
    if (e.target.closest('.win-btn')) return;
    const win = header.parentElement;
    const rect = win.getBoundingClientRect();
    const shiftX = e.clientX - rect.left;
    const shiftY = e.clientY - rect.top;
    const move = (e) => {
      win.style.left = (e.clientX - shiftX) + 'px';
      win.style.top = (e.clientY - shiftY) + 'px';
    };
    const stop = () => {
      document.removeEventListener('mousemove', move);
      document.removeEventListener('mouseup', stop);
    };
    document.addEventListener('mousemove', move);
    document.addEventListener('mouseup', stop);
  });
}
document.querySelectorAll('.window-header').forEach(h => makeHeaderDraggable(h));

// ===== TERMINAL CONFIRMATION FLOW =====
function confirmOpenTerminal() {
  const menu = document.getElementById('start-menu'); menu.classList.remove('open'); startMenuOpen = false; startBtn.setAttribute('aria-expanded', 'false');
  openConfirmModal();
}
function openConfirmModal() {
  const overlay = document.getElementById('confirm-modal'); overlay.classList.add('open'); overlay.setAttribute('aria-hidden', 'false');
  document.getElementById('modal-confirm').focus();
}
function closeConfirmModal() {
  const overlay = document.getElementById('confirm-modal'); overlay.classList.remove('open'); overlay.setAttribute('aria-hidden', 'true'); startBtn.focus();
}
function openTerminalConfirmed() {
  closeConfirmModal();
  window.open('terminal.html', '_blank', 'noopener');
}
document.addEventListener('keydown', (e) => {
  if (e.ctrlKey && e.altKey && e.key.toLowerCase() === 't') { e.preventDefault(); confirmOpenTerminal(); }
});

// ===== Desktop Context Menu Implementation =====
const desktopCtx = document.getElementById('desktop-context-menu');
function showDesktopContextMenu(x, y) {
  const menuWidth = 220;
  const left = Math.min(x, window.innerWidth - menuWidth - 8);
  const top = Math.min(y, window.innerHeight - 160 - 8);
  desktopCtx.style.left = (left < 0 ? 8 : left) + 'px';
  desktopCtx.style.top = (top < 0 ? 8 : top) + 'px';
  desktopCtx.style.display = 'block';
  desktopCtx.setAttribute('aria-hidden', 'false');
}
function hideDesktopContextMenu() {
  desktopCtx.style.display = 'none';
  desktopCtx.setAttribute('aria-hidden', 'true');
}
function openBackgroundColorPicker(){
  hideDesktopContextMenu();
  const picker = document.getElementById('desktop-bg-picker');
  picker.value = localStorage.getItem('bluebird-custom-wall') || '#0f1724';
  picker.onchange = function(){ setCustomBackground(this.value); };
  picker.click();
}
function openSettingsFromContext(){
  hideDesktopContextMenu();
  openWindow('settings-win');
}

// ===== USER AVATAR =====
function changeUserAvatar() {
  const input = document.createElement('input');
  input.type = 'file'; input.accept = 'image/*';
  input.onchange = (e) => {
    const file = e.target.files[0]; if (!file) return;
    if (!file.type.startsWith('image/')) { alert('Please select a valid image file'); return; }
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target.result;
      localStorage.setItem('bluebird-user-avatar', dataUrl);
      loadUserAvatar();
    };
    reader.readAsDataURL(file);
  };
  input.click();
}
function loadUserAvatar() {
  const savedAvatar = localStorage.getItem('bluebird-user-avatar');
  const avatarImg = document.getElementById('user-avatar-img');
  const avatarText = document.getElementById('user-avatar-text');
  
  if (savedAvatar) {
    // User has uploaded a custom avatar
    avatarImg.src = savedAvatar;
    avatarImg.style.display = 'block';
    avatarText.style.display = 'none';
  } else {
    // Try to use default profile.jpg
    avatarImg.src = 'profile.jpg';
    
    // Set up error handler in case profile.jpg doesn't exist
    avatarImg.onerror = function() {
      avatarImg.style.display = 'none';
      avatarText.style.display = 'flex';
    };
    
    // Set up success handler
    avatarImg.onload = function() {
      avatarImg.style.display = 'block';
      avatarText.style.display = 'none';
    };
  }
}
function updateAvatarText(name) {
  const initial = name && name.length ? name.charAt(0).toUpperCase() : 'N';
  document.getElementById('user-avatar-text').textContent = initial;
}

// ===== START MENU SEARCH =====
function filterStartMenu(query) {
  const items = document.querySelectorAll('.menu-item');
  const lowerQuery = query.toLowerCase();
  items.forEach(item => {
    const text = item.textContent.toLowerCase();
    if (text.includes(lowerQuery)) item.style.display = 'flex'; else item.style.display = 'none';
  });
}


// Track long press for labels
let longPressTimer;
let longPressTarget = null;

// Enable label on long press
function startLongPress(e, icon) {
    if (e.button !== 0) return; // Only left click
    
    longPressTarget = icon;
    longPressTimer = setTimeout(() => {
        icon.classList.add('show-label');
        longPressTarget = null;
    }, 500); // 500ms for long press
}

// Clear long press timer
function clearLongPress() {
    if (longPressTimer) {
        clearTimeout(longPressTimer);
        longPressTimer = null;
    }
    if (longPressTarget) {
        longPressTarget.classList.remove('show-label');
        longPressTarget = null;
    }
}

// Add event listeners to all icons
document.addEventListener('DOMContentLoaded', function() {
    const icons = document.querySelectorAll('.icon');
    
    icons.forEach(icon => {
        // Mouse events
        icon.addEventListener('mousedown', (e) => startLongPress(e, icon));
        icon.addEventListener('mouseup', clearLongPress);
        icon.addEventListener('mouseleave', clearLongPress);
        
        // Touch events for mobile
        icon.addEventListener('touchstart', (e) => {
            e.preventDefault();
            startLongPress(e, icon);
        });
        icon.addEventListener('touchend', clearLongPress);
        icon.addEventListener('touchcancel', clearLongPress);
        
        // Show label on focus (accessibility)
        icon.addEventListener('focus', () => {
            icon.classList.add('show-label');
        });
        icon.addEventListener('blur', () => {
            icon.classList.remove('show-label');
        });
        
        // Single click handling
        icon.addEventListener('click', (e) => {
            if (e.button === 0) { // Left click only
                // Clear any selection
                document.querySelectorAll('.icon.selected').forEach(sel => {
                    sel.classList.remove('selected');
                });
                // Select this icon
                icon.classList.add('selected');
            }
        });
    });
    
    // Click outside to deselect
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.icon')) {
            document.querySelectorAll('.icon.selected').forEach(sel => {
                sel.classList.remove('selected');
            });
        }
    });
    
    // Context menu handling
    document.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        showWindows11ContextMenu(e);
    });
    
    // ESC key to clear selection
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            document.querySelectorAll('.icon.selected').forEach(sel => {
                sel.classList.remove('selected');
            });
        }
    });
});

// Windows 11 Context Menu
function showWindows11ContextMenu(e) {
    // Remove existing context menu
    const existingMenu = document.querySelector('.context-menu');
    if (existingMenu) existingMenu.remove();
    
    // Create new context menu
    const menu = document.createElement('div');
    menu.className = 'context-menu';
    menu.style.left = e.pageX + 'px';
    menu.style.top = e.pageY + 'px';
    
    menu.innerHTML = `
        <div class="context-menu-item" onclick="refreshDesktop()">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
            </svg>
            Refresh
        </div>
        <div class="context-menu-divider"></div>
        <div class="context-menu-item" onclick="viewIcons('large')">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 5v14h18V5H3zm16 6h-3.33V7H19v4zm-5.33 0h-3.33V7h3.33v4zM8.33 7v4H5V7h3.33zM5 17v-4h3.33v4H5zm5.33 0v-4h3.33v4h-3.33zm8.34 0h-3.33v-4H19v4z"/>
            </svg>
            View → Large icons
        </div>
        <div class="context-menu-item" onclick="viewIcons('small')">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 5v14h18V5H3zm16 6h-5v5h5v-5zm-7 0H7v5h5v-5zm-5-4h5V7H7v4zm7 4v5h5v-5h-5zM7 17v-5h5v5H7z"/>
            </svg>
            View → Small icons
        </div>
        <div class="context-menu-divider"></div>
        <div class="context-menu-item" onclick="sortIcons('name')">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 18h6v-2H3v2zM3 6v2h18V6H3zm0 7h12v-2H3v2z"/>
            </svg>
            Sort by → Name
        </div>
        <div class="context-menu-item" onclick="sortIcons('date')">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
            </svg>
            Sort by → Date modified
        </div>
    `;
    
    document.body.appendChild(menu);
    
    // Close menu when clicking elsewhere
    setTimeout(() => {
        document.addEventListener('click', function closeMenu() {
            menu.remove();
            document.removeEventListener('click', closeMenu);
        });
    }, 100);
}

// Utility functions
function refreshDesktop() {
    document.querySelectorAll('.icon').forEach(icon => {
        icon.style.animation = 'none';
        setTimeout(() => {
            icon.style.animation = 'labelFadeIn 0.3s ease';
        }, 10);
    });
}

function viewIcons(size) {
    const iconsContainer = document.querySelector('.desktop-icons');
    iconsContainer.classList.remove('large-icons', 'small-icons');
    iconsContainer.classList.add(size + '-icons');
}

function sortIcons(method) {
    const container = document.getElementById('desktop-icons');
    const icons = Array.from(container.children);
    
    icons.sort((a, b) => {
        const aText = a.querySelector('.icon-label').textContent;
        const bText = b.querySelector('.icon-label').textContent;
        return aText.localeCompare(bText);
    });
    
    icons.forEach(icon => container.appendChild(icon));
}

// Taskbar Functionality
function initializeTaskbar() {
    // Update time
    updateTaskbarTime();
    setInterval(updateTaskbarTime, 60000);
    
    // Initialize apps
    initializeTaskbarApps();
    
    // Setup event listeners
    setupTaskbarEvents();
    
    // Check for notifications
    checkNotifications();
}

function updateTaskbarTime() {
    const now = new Date();
    const timeElement = document.getElementById('taskbar-time');
    const dateElement = document.getElementById('taskbar-date');
    
    if (timeElement) {
        timeElement.textContent = now.toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: false 
        });
    }
    
    if (dateElement) {
        dateElement.textContent = now.toLocaleDateString([], {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    }
}

function initializeTaskbarApps() {
    const appsContainer = document.getElementById('taskbar-apps');
    
    // Make apps draggable for reordering
    let dragSrcEl = null;
    
    appsContainer.querySelectorAll('.taskbar-app').forEach(app => {
        app.setAttribute('draggable', 'true');
        
        app.addEventListener('dragstart', function(e) {
            dragSrcEl = this;
            this.style.opacity = '0.4';
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/html', this.innerHTML);
        });
        
        app.addEventListener('dragover', function(e) {
            if (e.preventDefault) {
                e.preventDefault();
            }
            e.dataTransfer.dropEffect = 'move';
            return false;
        });
        
        app.addEventListener('dragenter', function(e) {
            this.classList.add('over');
        });
        
        app.addEventListener('dragleave', function() {
            this.classList.remove('over');
        });
        
        app.addEventListener('drop', function(e) {
            if (e.stopPropagation) {
                e.stopPropagation();
            }
            
            if (dragSrcEl !== this) {
                dragSrcEl.innerHTML = this.innerHTML;
                this.innerHTML = e.dataTransfer.getData('text/html');
            }
            
            return false;
        });
        
        app.addEventListener('dragend', function() {
            this.style.opacity = '1';
            appsContainer.querySelectorAll('.taskbar-app').forEach(app => {
                app.classList.remove('over');
            });
        });
    });
}

function setupTaskbarEvents() {
    // Auto-hide functionality
    let hideTimeout;
    const taskbar = document.getElementById('taskbar');
    
    if (taskbar.classList.contains('taskbar-autohide')) {
        document.addEventListener('mousemove', (e) => {
            const isNearTaskbar = e.clientY > window.innerHeight - 10;
            
            clearTimeout(hideTimeout);
            
            if (isNearTaskbar) {
                taskbar.classList.add('taskbar-peek');
            } else {
                hideTimeout = setTimeout(() => {
                    taskbar.classList.remove('taskbar-peek');
                }, 1000);
            }
        });
    }
    
    // Touch support
    document.addEventListener('touchstart', (e) => {
        if (taskbar.classList.contains('taskbar-autohide')) {
            const isNearBottom = e.touches[0].clientY > window.innerHeight - 50;
            
            if (isNearBottom) {
                taskbar.classList.add('taskbar-peek');
                setTimeout(() => {
                    taskbar.classList.remove('taskbar-peek');
                }, 3000);
            }
        }
    });
}

function checkNotifications() {
    // Simulate checking for notifications
    setTimeout(() => {
        updateNotificationBadge(3);
    }, 2000);
}

function updateNotificationBadge(count) {
    const badge = document.getElementById('notification-badge');
    if (badge) {
        if (count > 0) {
            badge.textContent = count > 99 ? '99+' : count;
            badge.style.display = 'flex';
        } else {
            badge.style.display = 'none';
        }
    }
}

function toggleHiddenIcons() {
    const panel = document.getElementById('hidden-icons-panel');
    const taskbar = document.getElementById('taskbar');
    const rect = taskbar.getBoundingClientRect();
    
    panel.classList.toggle('visible');
    
    if (panel.classList.contains('visible')) {
        panel.style.bottom = (window.innerHeight - rect.top + 10) + 'px';
        panel.style.right = '10px';
        
        // Close on click outside
        setTimeout(() => {
            document.addEventListener('click', function closePanel(e) {
                if (!panel.contains(e.target) && 
                    !e.target.closest('.hidden-icons') && 
                    !e.target.closest('#hidden-icons')) {
                    panel.classList.remove('visible');
                    document.removeEventListener('click', closePanel);
                }
            });
        }, 100);
    }
}

function showDesktop() {
    // Minimize all windows
    document.querySelectorAll('.window').forEach(window => {
        window.classList.remove('maximized', 'active');
        window.classList.add('minimized');
    });
    
    // Show desktop
    document.getElementById('desktop').style.zIndex = '1';
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeTaskbar);