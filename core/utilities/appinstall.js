// ===== Bluebird App Installer System =====
let installedApps = {}; // key = appKey, value = {html, manifest}
function loadInstalledApps() {
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key || !key.startsWith('bb_app_')) continue;
    try {
      const html = localStorage.getItem(key);
      if (!html) continue;
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const manifestTag = doc.querySelector('#bluebird-app-manifest');
      if (!manifestTag) continue;
      const manifest = JSON.parse(manifestTag.textContent);
      if (!installedApps[key]) {
        installedApps[key] = { html, manifest };
        addAppIcon(key, manifest);
        addStartMenuApp(key, manifest);
      }
    } catch (e) { console.error('Failed to load app', key, e); }
  }
}
function addAppIcon(appKey, manifest){
  const desktop = document.getElementById('desktop-icons');
  if (document.getElementById('icon_'+appKey)) return;
  const icon = document.createElement('div');
  icon.className = 'icon';
  icon.id = 'icon_'+appKey;
  const iconContent = document.createElement('div');
  iconContent.className = 'icon-img';
  iconContent.innerHTML = manifest.icon || '📦';
  const label = document.createElement('div');
  label.className = 'icon-label';
  label.textContent = manifest.name || 'App';
  icon.appendChild(iconContent);
  icon.appendChild(label);

  icon.onclick = ()=>openApp(appKey);
  icon.oncontextmenu = (e)=>{
    e.preventDefault();
    showAppContextMenu(e, appKey, manifest);
  };

  // Long press for touch devices
  let longPressTimer = null;
  icon.addEventListener('touchstart', (e) => {
    longPressTimer = setTimeout(()=>{
      e.preventDefault();
      const touch = e.touches[0];
      showAppContextMenu({clientX: touch.clientX, clientY: touch.clientY, preventDefault:()=>{}}, appKey, manifest);
    }, 600);
  }, {passive: true});
  icon.addEventListener('touchend', ()=>{ clearTimeout(longPressTimer); });
  icon.addEventListener('touchmove', ()=>{ clearTimeout(longPressTimer); });

  desktop.appendChild(icon);
}
function addStartMenuApp(appKey, manifest){
  const startMenu = document.getElementById('menu-apps');
  if (document.getElementById('menu_'+appKey)) return;

  const menuItem = document.createElement('div');
  menuItem.className = 'menu-item';
  menuItem.id = 'menu_'+appKey;
  const iconSpan = document.createElement('i');
  iconSpan.style.fontSize='20px';
  iconSpan.style.width='24px';
  iconSpan.style.textAlign='center';
  iconSpan.innerHTML = manifest.icon || '📦';
  const textSpan = document.createElement('span');
  textSpan.textContent = manifest.name || 'App';
  menuItem.appendChild(iconSpan);
  menuItem.appendChild(textSpan);
  menuItem.onclick = ()=>{ openApp(appKey); toggleStartMenu(); }

  let pinnedTitle = null;
  const sections = startMenu.querySelectorAll('.menu-section-title');
  for (const s of sections) {
    if (s.textContent.trim().toLowerCase() === 'pinned') { pinnedTitle = s; break; }
  }
  if (pinnedTitle && pinnedTitle.nextSibling) {
    let insertPoint = pinnedTitle.nextSibling;
    while (insertPoint && !insertPoint.classList?.contains('menu-section-title')) {
      insertPoint = insertPoint.nextSibling;
    }
    if (insertPoint) startMenu.insertBefore(menuItem, insertPoint);
    else startMenu.appendChild(menuItem);
  } else {
    startMenu.appendChild(menuItem);
  }
}


function openApp(appKey){
  const entry = installedApps[appKey];
  if(!entry) return alert('App not found!');
  const appHtml = entry.html;
  const winId = 'win_'+Math.random().toString(36).substr(2,5);
  const desktop = document.getElementById('desktop');

  const div = document.createElement('div');
  div.className = 'window active';
  div.id = winId;
  div.style.width='640px';
  div.style.height='480px';
  div.style.top='12%';
  div.style.left='12%';
  div.style.display='flex';
  div.style.flexDirection='column';
  div.style.position='absolute';

  windowZIndex++;
  div.style.zIndex = windowZIndex;
  

  // Build header
  const header = document.createElement('div');
  header.className = 'window-header';
  header.innerHTML = `
    <div class="window-title">${entry.manifest.icon || ''} ${entry.manifest.name}</div>
    <div class="window-controls">
      <div class="win-btn win-min" title="Minimize">−</div>
      <div class="win-btn win-max" title="Maximize">□</div>
      <div class="win-btn win-close" title="Close">✕</div>
    </div>
  `;
  const winMin = header.querySelector('.win-min');
  const winMax = header.querySelector('.win-max');
  const winClose = header.querySelector('.win-close');
  winMin.addEventListener('click', ()=>minimizeWindow(winId));
  winMax.addEventListener('click', ()=>maximizeWindow(winId));
  winClose.addEventListener('click', ()=>{
    closeWindow(winId);
    try { div.remove(); } catch(e){}
  });

  const body = document.createElement('div');
  body.className = 'window-body';
  body.style.padding = '0';

  const iframe = document.createElement('iframe');
  iframe.setAttribute('sandbox', 'allow-scripts allow-forms');
  iframe.style.width = '100%';
  iframe.style.height = '100%';
  iframe.style.border = 'none';
  try {
    iframe.srcdoc = appHtml;
  } catch (e) {
    const blob = new Blob([appHtml], {type: 'text/html'});
    iframe.src = URL.createObjectURL(blob);
  }

  body.appendChild(iframe);
  const resize = document.createElement('div');
  resize.className = 'window-resize';
  resize.onmousedown = (e)=>startResize(e, winId);

  div.appendChild(header);
  div.appendChild(body);
  div.appendChild(resize);

  desktop.appendChild(div);
  makeHeaderDraggable(header);

  windows[winId] = true;
  addAppToTaskbar(winId, entry.manifest);
  updateTaskbar();

  // If user wants windows to fit content, attempt to adjust (best-effort)
  if (settings.fitWindowsToContent) {
    setTimeout(()=>adjustWindowToContent(div), 350);
  }
  setTimeout(()=>{ try{ iframe.contentWindow && iframe.contentWindow.focus(); }catch(e){} }, 300);
}


// ========== Install App ==========
function installApp() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.html';
  input.onchange = e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const html = reader.result;
      try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const manifestTag = doc.querySelector('#bluebird-app-manifest');
        if (!manifestTag) return alert('Invalid app file: missing manifest');
        const manifest = JSON.parse(manifestTag.textContent);
        showAppPreview(manifest, html);
      } catch (err) {
        console.error(err);
        alert('Failed to load app.');
      }
    };
    reader.readAsText(file);
  };
  input.click();
}
function installFromContext() { hideDesktopContextMenu(); installApp(); }
function sanitizeKey(s){
  if(!s) return 'app';
  return String(s).replace(/[^a-zA-Z0-9-_]/g,'_').replace(/^_+|_+$/g,'').toLowerCase();
}
// ===== CUSTOM ICON SUPPORT =====

// Update showAppPreview function (around line 1100)
function showAppPreview(manifest, html) {
  const duplicateCheck = isAppAlreadyInstalled(manifest);
  if (duplicateCheck.isDuplicate) {
    const result = confirm(
      `This app "${manifest.name}" (ID: ${manifest.appId}) is already installed as "${duplicateCheck.existingName}".\n\n` +
      `Do you want to:\n` +
      `• OK - Update the existing app\n` +
      `• Cancel - Keep the current version`
    );
    if (!result) return;
    const oldKey = duplicateCheck.existingKey;
    const icon = document.getElementById('icon_' + oldKey);
    if (icon) icon.remove();
    const menuItem = document.getElementById('menu_' + oldKey);
    if (menuItem) menuItem.remove();
    localStorage.removeItem(oldKey);
    delete installedApps[oldKey];
  }
  
  const modal = document.getElementById('app-preview-modal');
  
  // Handle custom icons (PNG/SVG)
  const iconDisplay = getIconDisplay(manifest.icon, manifest.iconType);
  document.getElementById('preview-icon').innerHTML = iconDisplay;
  
  document.getElementById('preview-name').textContent = manifest.name || 'Unknown App';
  document.getElementById('preview-desc').textContent = manifest.description || 'No description provided.';
  const installBtn = document.getElementById('preview-install-btn');
  installBtn.textContent = duplicateCheck.isDuplicate ? 'Update' : 'Install';
  installBtn.onclick = () => {
    const baseName = manifest.appId ? sanitizeKey(manifest.appId) : sanitizeKey(manifest.name);
    let appKey = 'bb_app_' + (baseName || 'app');
    if (!duplicateCheck.isDuplicate) {
      let counter = 1;
      let baseKey = appKey;
      while(localStorage.getItem(appKey)) appKey = baseKey + '_' + counter++;
    } else appKey = duplicateCheck.existingKey;

    localStorage.setItem(appKey, html);
    installedApps[appKey] = { html, manifest };
    addAppIcon(appKey, manifest);
    addStartMenuApp(appKey, manifest);

    const action = duplicateCheck.isDuplicate ? 'updated' : 'installed';
    alert(`${manifest.name} ${action} successfully!`);
    closeAppPreview();
  };
  modal.style.display = 'flex';
}

// Get icon display HTML based on type
function getIconDisplay(icon, iconType) {
  if (!icon) return '📦';
  
  if (iconType === 'svg') {
    // SVG string
    return icon;
  } else if (iconType === 'png' || iconType === 'jpg' || iconType === 'image') {
    // Image URL or data URL
    return `<img src="${icon}" style="width:100%; height:100%; object-fit:contain;" alt="App icon">`;
  } else {
    // Emoji (default)
    return icon;
  }
}

// Update addAppIcon to support custom icons
function addAppIcon(appKey, manifest){
  const desktop = document.getElementById('desktop-icons');
  if (document.getElementById('icon_'+appKey)) return;
  const icon = document.createElement('div');
  icon.className = 'icon';
  icon.id = 'icon_'+appKey;
  const iconContent = document.createElement('div');
  iconContent.className = 'icon-img';
  
  // Use custom icon display
  iconContent.innerHTML = getIconDisplay(manifest.icon, manifest.iconType) || '📦';
  
  const label = document.createElement('div');
  label.className = 'icon-label';
  label.textContent = manifest.name || 'App';
  icon.appendChild(iconContent);
  icon.appendChild(label);

  icon.onclick = ()=>openApp(appKey);
  icon.oncontextmenu = (e)=>{
    e.preventDefault();
    showAppContextMenu(e, appKey, manifest);
  };

  // Long press for touch devices
  let longPressTimer = null;
  icon.addEventListener('touchstart', (e) => {
    longPressTimer = setTimeout(()=>{
      e.preventDefault();
      const touch = e.touches[0];
      showAppContextMenu({clientX: touch.clientX, clientY: touch.clientY, preventDefault:()=>{}}, appKey, manifest);
    }, 600);
  }, {passive: true});
  icon.addEventListener('touchend', ()=>{ clearTimeout(longPressTimer); });
  icon.addEventListener('touchmove', ()=>{ clearTimeout(longPressTimer); });

  desktop.appendChild(icon);
}

// Update addStartMenuApp to support custom icons
function addStartMenuApp(appKey, manifest){
  const startMenu = document.getElementById('menu-apps');
  if (document.getElementById('menu_'+appKey)) return;

  const menuItem = document.createElement('div');
  menuItem.className = 'menu-item';
  menuItem.id = 'menu_'+appKey;
  const iconSpan = document.createElement('i');
  iconSpan.style.fontSize='20px';
  iconSpan.style.width='24px';
  iconSpan.style.textAlign='center';
  iconSpan.style.display='flex';
  iconSpan.style.alignItems='center';
  iconSpan.style.justifyContent='center';
  
  // Use custom icon display (scaled down for menu)
  const iconHTML = getIconDisplay(manifest.icon, manifest.iconType) || '📦';
  if (manifest.iconType === 'svg' || manifest.iconType === 'png' || manifest.iconType === 'image') {
    iconSpan.innerHTML = `<div style="width:20px; height:20px; display:flex; align-items:center; justify-content:center;">${iconHTML}</div>`;
  } else {
    iconSpan.innerHTML = iconHTML;
  }
  
  const textSpan = document.createElement('span');
  textSpan.textContent = manifest.name || 'App';
  menuItem.appendChild(iconSpan);
  menuItem.appendChild(textSpan);
  menuItem.onclick = ()=>{ openApp(appKey); toggleStartMenu(); }

  let pinnedTitle = null;
  const sections = startMenu.querySelectorAll('.menu-section-title');
  for (const s of sections) {
    if (s.textContent.trim().toLowerCase() === 'pinned') { pinnedTitle = s; break; }
  }
  if (pinnedTitle && pinnedTitle.nextSibling) {
    let insertPoint = pinnedTitle.nextSibling;
    while (insertPoint && !insertPoint.classList?.contains('menu-section-title')) {
      insertPoint = insertPoint.nextSibling;
    }
    if (insertPoint) startMenu.insertBefore(menuItem, insertPoint);
    else startMenu.appendChild(menuItem);
  } else {
    startMenu.appendChild(menuItem);
  }
}

// Expose function
window.getIconDisplay = getIconDisplay;
function isAppAlreadyInstalled(manifest) {
  if (!manifest) return { isDuplicate: false };
  if (manifest.appId) {
    for (let key in installedApps) {
      try {
        if (installedApps[key].manifest && installedApps[key].manifest.appId === manifest.appId) {
          return { isDuplicate: true, existingKey: key, existingName: installedApps[key].manifest.name };
        }
      } catch(e){}
    }
  }
  const sanitized = sanitizeKey(manifest.name);
  for (let key in installedApps) {
    try {
      const installedName = sanitizeKey(installedApps[key].manifest.name);
      if (installedName && installedName === sanitized) {
        return { isDuplicate: true, existingKey: key, existingName: installedApps[key].manifest.name };
      }
    } catch(e){}
  }
  return { isDuplicate: false };
}
function closeAppPreview() { document.getElementById('app-preview-modal').style.display = 'none'; }
function uninstallApp(appKey){
  if(confirm('Are you sure you want to uninstall this app?')){
    localStorage.removeItem(appKey);
    delete installedApps[appKey];
    const icon = document.getElementById('icon_'+appKey); if(icon) icon.remove();
    const menuItem = document.getElementById('menu_'+appKey); if(menuItem) menuItem.remove();
    alert('App uninstalled!');
  }
}

function showAppContextMenu(e, appKey, manifest){
  if (e && e.preventDefault) e.preventDefault();
  let menu = document.getElementById('app-context-menu');
  if(!menu){
    menu = document.createElement('div');
    menu.id='app-context-menu';
    menu.style.position='fixed';
    menu.style.background='var(--panel)';
    menu.style.border='1px solid var(--border)';
    menu.style.borderRadius='12px';
    menu.style.padding='8px';
    menu.style.zIndex=4000;
    menu.style.minWidth='200px';
    menu.style.boxShadow='0 10px 40px rgba(0,0,0,0.7)';
    menu.style.backdropFilter='blur(10px)';
    document.body.appendChild(menu);
  }
  menu.innerHTML = '';

  // Helper function to create menu items with SVG icons
  const createMenuItem = (icon, text, color, onClick) => {
    const item = document.createElement('div');
    item.className = 'ctx-item';
    item.style.display = 'flex';
    item.style.alignItems = 'center';
    item.style.padding = '10px 12px';
    item.style.cursor = 'pointer';
    item.style.borderRadius = '6px';
    item.style.transition = 'background 0.2s ease';
    item.style.gap = '12px';
    if(color) item.style.color = color;
    
    item.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        ${icon}
      </svg>
      <span style="flex: 1; font-size: 14px;">${text}</span>
    `;
    
    item.addEventListener('mouseenter', () => {
      item.style.background = 'rgba(255,255,255,0.1)';
    });
    item.addEventListener('mouseleave', () => {
      item.style.background = 'transparent';
    });
    item.addEventListener('click', onClick);
    return item;
  };

  // Open
  const openItem = createMenuItem(
    '<path d="M5 12l5 5L20 7"></path>',
    'Open',
    null,
    () => { openApp(appKey); hideAppContextMenu(); }
  );

  // Open in New Window
  const newWindowItem = createMenuItem(
    '<rect x="3" y="3" width="18" height="18" rx="2"></rect><path d="M9 3v18"></path><path d="M15 3v18"></path>',
    'Open in New Window',
    null,
    () => { openAppInNewWindow(appKey); hideAppContextMenu(); }
  );

  // Divider
  const divider1 = document.createElement('div');
  divider1.style.height = '1px';
  divider1.style.background = 'var(--border)';
  divider1.style.margin = '6px 0';

  // Info
  const infoItem = createMenuItem(
    '<circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line>',
    'App Info',
    null,
    () => { showAppInfo(appKey); hideAppContextMenu(); }
  );

  // Pin to Taskbar
  const pinItem = createMenuItem(
    '<path d="M12 17l-5 5v-5H5V5h14v12h-2v5z"></path>',
    'Pin to Taskbar',
    null,
    () => { pinAppToTaskbar(appKey); hideAppContextMenu(); }
  );

  // Create Shortcut
  const shortcutItem = createMenuItem(
    '<path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"></path>',
    'Create Shortcut',
    null,
    () => { createAppShortcut(appKey); hideAppContextMenu(); }
  );

  // Divider
  const divider2 = document.createElement('div');
  divider2.style.height = '1px';
  divider2.style.background = 'var(--border)';
  divider2.style.margin = '6px 0';

  // Refresh/Reinstall
  const refreshItem = createMenuItem(
    '<path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"></path>',
    'Refresh App',
    null,
    () => { refreshApp(appKey); hideAppContextMenu(); }
  );

  // Uninstall
  const uninstallItem = createMenuItem(
    '<path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6"></path>',
    'Uninstall',
    '#ef4444',
    () => { 
      if(confirm(`Are you sure you want to uninstall ${manifest?.name || 'this app'}?`)){
        uninstallApp(appKey); 
        hideAppContextMenu(); 
      }
    }
  );

  // Append all items
  menu.appendChild(openItem);
  menu.appendChild(newWindowItem);
  menu.appendChild(divider1);
  menu.appendChild(infoItem);
  menu.appendChild(pinItem);
  menu.appendChild(shortcutItem);
  menu.appendChild(divider2);
  menu.appendChild(refreshItem);
  menu.appendChild(uninstallItem);

  // Position menu
  const x = (e && e.clientX) || (e && e.x) || 100;
  const y = (e && e.clientY) || (e && e.y) || 100;
  const menuWidth = 240;
  const menuHeight = 320;
  const left = Math.min(x, window.innerWidth - menuWidth - 8);
  const top = Math.min(y, window.innerHeight - menuHeight - 8);
  menu.style.left = (left < 0 ? 8 : left) + 'px';
  menu.style.top = (top < 0 ? 8 : top) + 'px';
  menu.style.display='block';
}

// Helper functions for new features (implement these based on your app structure)
function openAppInNewWindow(appKey) {
  // Implementation for opening app in new window
  console.log('Opening app in new window:', appKey);
}

function pinAppToTaskbar(appKey) {
  // Implementation for pinning app to taskbar
  console.log('Pinning app to taskbar:', appKey);
}

function createAppShortcut(appKey) {
  // Implementation for creating desktop shortcut
  console.log('Creating shortcut for:', appKey);
}

function refreshApp(appKey) {
  // Implementation for refreshing/reinstalling app
  console.log('Refreshing app:', appKey);
}
function hideAppContextMenu(){ const menu = document.getElementById('app-context-menu'); if(menu) menu.style.display='none'; }
function showAppInfo(appKey) {
  const entry = installedApps[appKey];
  if (!entry) return;
  const manifest = entry.manifest;
  const modal = document.createElement('div');
  modal.className = 'modal-overlay open'; modal.style.display = 'flex';
  modal.innerHTML = `
    <div class="modal" style="max-width:520px;">
      <div style="display:flex; align-items:center; gap:1rem; margin-bottom:1rem;">
        <div style="font-size:48px;">${manifest.icon || '📦'}</div>
        <div>
          <h2 style="margin:0; color:var(--accent);">${manifest.name || 'Unknown'}</h2>
          <p style="margin:0.2rem 0 0 0; color:#9fbf9f; font-size:14px;">${manifest.version || 'v1.0'}</p>
        </div>
      </div>
      <p style="margin-bottom:1rem;">${manifest.description || 'No description available.'}</p>
      <div style="background:rgba(255,255,255,0.02); padding:0.8rem; border-radius:6px; margin-bottom:1rem;">
        <p style="margin:0; font-size:13px;"><strong>Author:</strong> ${manifest.author || 'Unknown'}</p>
        <p style="margin:0.4rem 0 0 0; font-size:13px;"><strong>App ID:</strong> ${appKey}</p>
      </div>
      <div style="text-align:right;">
        <button id="close-info-btn" class="btn" style="padding:0.5rem 1rem; background:var(--accent); color:#000;">Close</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  modal.onclick = (e) => { if (e.target === modal) modal.remove(); };
  modal.querySelector('#close-info-btn').addEventListener('click', ()=> modal.remove());
}

function showContextMenuForIcon(e, target){
  e.preventDefault();
  if (target && target.startsWith('bb_app_')) {
    showAppContextMenu(e, target, installedApps[target].manifest);
    return;
  }
  let menu = document.getElementById('icon-context-menu');
  if(!menu){
    menu = document.createElement('div');
    menu.id='icon-context-menu';
    menu.style.position='fixed';
    menu.style.background='var(--panel)';
    menu.style.border='1px solid var(--border)';
    menu.style.borderRadius='6px';
    menu.style.padding='0.3rem';
    menu.style.zIndex=4000;
    document.body.appendChild(menu);
  }
  menu.innerHTML = `<div style="cursor:pointer;padding:0.5rem;" onclick="hideIconContextMenu()">Properties</div>`;
  menu.style.top=e.clientY+'px';
  menu.style.left=e.clientX+'px';
  menu.style.display='block';
}
function hideIconContextMenu(){ const m=document.getElementById('icon-context-menu'); if(m) m.style.display='none'; }

document.addEventListener('click', (e)=>{
  if(!e.target.closest('#app-context-menu')) hideAppContextMenu();
  if(!e.target.closest('#icon-context-menu')) hideIconContextMenu();
  if(!e.target.closest('#desktop-context-menu')) hideDesktopContextMenu();
});

// ===== Drag & Drop Install Support =====
document.addEventListener('dragover', e=>e.preventDefault());
document.addEventListener('drop', e=>{
  e.preventDefault();
  if(e.dataTransfer.files.length>0){
    const file = e.dataTransfer.files[0];
    if(file.name.endsWith('.html')){
      const reader = new FileReader();
      reader.onload = ()=>{
        const html = reader.result;
        try{
          const parser = new DOMParser();
          const doc = parser.parseFromString(html,'text/html');
          const manifestTag = doc.querySelector('#bluebird-app-manifest');
          if(!manifestTag) return alert('Invalid app file: missing manifest');
          const manifest = JSON.parse(manifestTag.textContent);
          const duplicateCheck = isAppAlreadyInstalled(manifest);
          if (duplicateCheck.isDuplicate) {
            const result = confirm(`This app "${manifest.name}" is already installed.\n\nDrop to update the existing version?`);
            if (!result) return;
            const oldKey = duplicateCheck.existingKey;
            const icon = document.getElementById('icon_' + oldKey);
            if (icon) icon.remove();
            const menuItem = document.getElementById('menu_' + oldKey);
            if (menuItem) menuItem.remove();
            localStorage.removeItem(oldKey);
            delete installedApps[oldKey];
          }
          const baseName = manifest.appId ? sanitizeKey(manifest.appId) : sanitizeKey(manifest.name);
          let appKey = 'bb_app_' + (baseName || 'app');
          if (!duplicateCheck.isDuplicate) {
            let counter = 1; let baseKey = appKey;
            while(localStorage.getItem(appKey)) appKey = baseKey + '_' + counter++;
          }
          localStorage.setItem(appKey, html);
          installedApps[appKey] = {html, manifest};
          addAppIcon(appKey, manifest);
          addStartMenuApp(appKey, manifest);
          const action = duplicateCheck.isDuplicate ? 'updated' : 'installed';
          alert(`${manifest.name} ${action} successfully!`);
        }catch(err){ console.error(err); alert('Failed to install app.'); }
      }
      reader.readAsText(file);
    }
  }
});
