// ===== PRODUCTIVITY ANALYTICS =====
let productivityData = {
  sessionStart: Date.now(),
  appsLaunched: 0,
  ideasCreated: 0,
  totalTime: 0
};

function loadProductivityDashboard() {
  // Calculate stats
  const sessionTime = Math.floor((Date.now() - productivityData.sessionStart) / 60000);
  const hours = Math.floor(sessionTime / 60);
  const minutes = sessionTime % 60;

  document.getElementById('total-session-time').textContent = `${hours}h ${minutes}m`;
  document.getElementById('apps-launched').textContent = Object.values(userBehavior.appUsage).reduce((sum, app) => sum + app.count, 0);
  document.getElementById('ideas-created').textContent = inspireIdeas.length;
  
  // Calculate productivity score (0-100)
  const score = Math.min(100, Math.floor(
    (Object.keys(windows).length * 10) +
    (inspireIdeas.length * 5) +
    (Object.keys(userBehavior.appUsage).length * 3)
  ));
  document.getElementById('productivity-score').textContent = score + '%';

  // Render top apps
  renderTopApps();
  
  // Render chart
  renderUsageChart();
}

function renderTopApps() {
  const list = document.getElementById('top-apps-list');
  const sorted = Object.entries(userBehavior.appUsage)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 5);

  if (sorted.length === 0) {
    list.innerHTML = '<p style="color:rgba(255,255,255,0.5); text-align:center; padding:2rem;">No app usage data yet</p>';
    return;
  }

  list.innerHTML = sorted.map(([id, data], index) => `
    <div class="top-app-item">
      <div>
        <span style="color:var(--accent); font-weight:700; margin-right:0.5rem;">#${index + 1}</span>
        <span class="top-app-name">${data.name}</span>
      </div>
      <div class="top-app-count">${data.count} uses</div>
    </div>
  `).join('');
}

function renderUsageChart() {
  const canvas = document.getElementById('usage-chart');
  const ctx = canvas.getContext('2d');
  
  // Simple bar chart
  const apps = Object.entries(userBehavior.appUsage)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 6);

  if (apps.length === 0) return;

  const maxCount = Math.max(...apps.map(([id, data]) => data.count));
  const barWidth = canvas.width / apps.length - 20;
  const barSpacing = 20;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  apps.forEach(([id, data], index) => {
    const barHeight = (data.count / maxCount) * (canvas.height - 40);
    const x = index * (barWidth + barSpacing) + 10;
    const y = canvas.height - barHeight - 20;

    // Draw bar
    const gradient = ctx.createLinearGradient(x, y, x, canvas.height);
    gradient.addColorStop(0, '#4ade80');
    gradient.addColorStop(1, '#22c55e');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(x, y, barWidth, barHeight);

    // Draw label
    ctx.fillStyle = '#fff';
    ctx.font = '12px Ubuntu';
    ctx.textAlign = 'center';
    ctx.fillText(data.name.substring(0, 8), x + barWidth / 2, canvas.height - 5);
    
    // Draw count
    ctx.fillText(data.count, x + barWidth / 2, y - 5);
  });
}

// Update taskbar map
windowTaskbarMap['productivity-dashboard'] = { icon: '📊', label: 'Analytics' };

// Track window opening for productivity
const originalOpenWindowProd = openWindow;
openWindow = function(id) {
  originalOpenWindowProd(id);
  if (id === 'productivity-dashboard') {
    loadProductivityDashboard();
  }
};

window.loadProductivityDashboard = loadProductivityDashboard;