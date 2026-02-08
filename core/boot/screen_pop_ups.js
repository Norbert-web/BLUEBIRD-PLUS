// Update taskbar map
windowTaskbarMap['birdshell-win'] = { icon: '⌨️', label: 'BirdShell' };
// ===== BIRDSHELL TERMINAL =====
function openBirdShell() {
  openWindow('birdshell-win');
  const frame = document.getElementById('birdshell-frame');
  if (!frame.src) {
    frame.src = 'terminal.html';
  }
}
// ===== APP DOWNLOAD MODAL =====
function showAppDownloadModal() {
  const modal = document.getElementById('app-download-modal');
  
  // Check if user has dismissed before
  const dismissed = localStorage.getItem('app-download-dismissed');
  const lastShown = localStorage.getItem('app-download-last-shown');
  const now = Date.now();
  
  // Show if never dismissed, or if it's been more than 7 days since last shown
  if (!dismissed || (lastShown && (now - parseInt(lastShown)) > 7 * 24 * 60 * 60 * 1000)) {
    setTimeout(() => {
      modal.classList.add('show');
      addNotification(
        'App Available!',
        'Bluebird Ultimate is now available for Android',
        'info',
        '📱'
      );
    }, 3000); // Show 3 seconds after OS loads
  }
}

function closeAppDownloadModal() {
  const modal = document.getElementById('app-download-modal');
  modal.classList.remove('show');
}

function dismissAppDownloadModal() {
  const modal = document.getElementById('app-download-modal');
  modal.classList.remove('show');
  
  // Remember dismissal but allow showing again after 7 days
  localStorage.setItem('app-download-last-shown', Date.now().toString());
  
  addNotification(
    'Reminder Set',
    "We'll remind you about the app in 7 days",
    'info',
    '⏰'
  );
}

function trackAppDownload(platform) {
  // Track which platform was clicked
  localStorage.setItem('app-download-platform', platform);
  localStorage.setItem('app-download-dismissed', 'true');
  
  addNotification(
    'Thank You!',
    `Downloading Bluebird Ultimate for ${platform}`,
    'success',
    '✅'
  );
  
  closeAppDownloadModal();
}
// Expose functions
window.openBirdShell = openBirdShell;
window.showAppDownloadModal = showAppDownloadModal;
window.closeAppDownloadModal = closeAppDownloadModal;
window.dismissAppDownloadModal = dismissAppDownloadModal;
window.trackAppDownload = trackAppDownload;