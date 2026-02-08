// ===== Settings: Icon size & behavior toggles =====
function applyIconSize(size, persist=true) {
  document.body.classList.remove('small-icons','medium-icons','large-icons');
  if (size === 'small') document.body.classList.add('small-icons');
  else if (size === 'large') document.body.classList.add('large-icons');
  else document.body.classList.add('medium-icons');
  if (persist) localStorage.setItem('bluebird-icon-size', size);
  // update radio UI if present
  const radios = document.querySelectorAll('input[name="icon-size"]');
  radios.forEach(r => { if (r.value === size) r.checked = true; });
}

function toggleClearBadgeSetting(checked) {
  settings.clearBadgeOnOpen = !!checked; saveSettings();
}
function toggleFitToContent(checked) {
  settings.fitWindowsToContent = !!checked; saveSettings();
}

// Expose functions to inline handlers & global scope
window.toggleNotificationCenter = toggleNotificationCenter;
window.addNotification = addNotification;
window.clearAllNotifications = clearAllNotifications;
window.removeNotification = removeNotification;

window.togglePowerMenu = togglePowerMenu;
window.lockScreen = lockScreen;
window.unlockScreen = unlockScreen;
window.sleepSystem = sleepSystem;
window.restartSystem = restartSystem;
window.shutdownSystem = shutdownSystem;

window.installApp = installApp;
window.openWindow = openWindow;
window.closeWindow = closeWindow;
window.minimizeWindow = minimizeWindow;
window.maximizeWindow = maximizeWindow;
window.cycleWallpaper = cycleWallpaper;
window.toggleTheme = toggleTheme;
window.toggleSound = toggleSound;
window.installFromContext = installFromContext;
window.openBackgroundColorPicker = openBackgroundColorPicker;
window.openAccentColorPicker = openAccentColorPicker;
window.openSettingsFromContext = openSettingsFromContext;
window.confirmOpenTerminal = confirmOpenTerminal;
window.setActiveWallpaper = setActiveWallpaper;
window.setCustomBackground = setCustomBackground;
window.clearCustomBackground = clearCustomBackground;
window.changeAccentColor = function(val, persist=true){ changeAccentColor(val, persist); };
window.uploadCustomWallpaper = uploadCustomWallpaper;
window.clearUploadedWallpaper = clearUploadedWallpaper;
window.showAppInfo = showAppInfo;
window.openApp = openApp;
window.changeUserAvatar = changeUserAvatar;
window.filterStartMenu = filterStartMenu;
window.toggleStartMenu = toggleStartMenu;
window.applyIconSize = applyIconSize;
