// ===== APP LAUNCHER FIELD =====
let fieldApps = [];
let fieldFolders = [];
let fieldEditMode = false;
let fieldZoomLevel = 2;
let draggedItem = null;

function loadAppField() {
  try {
    const savedApps = localStorage.getItem('app-field-apps');
    const savedFolders = localStorage.getItem('app-field-folders');
    
    if (savedApps) {
      fieldApps = JSON.parse(savedApps);
    } else {
      // Initialize with built-in apps
      fieldApps = [
        { id: 'resume', name: 'Resume', icon: '📝', type: 'builtin' },
        { id: 'projects', name: 'Projects', icon: '🚀', type: 'builtin' },
        { id: 'connect', name: 'Connect', icon: '📬', type: 'builtin' },
        { id: 'settings', name: 'Settings', icon: '⚙️', type: 'builtin' },
        { id: 'inspireboard', name: 'InspireBoard', icon: '💡', type: 'builtin' },
        { id: 'birdshell', name: 'BirdShell', icon: '⌨️', type: 'builtin' },
        { id: 'claude', name: 'Comfort Claude', icon: '🤖', type: 'builtin' }
      ];
      
      // Add installed apps
      Object.entries(installedApps).forEach(([key, app]) => {
        fieldApps.push({
          id: key,
          name: app.manifest.name,
          icon: app.manifest.icon,
          iconType: app.manifest.iconType,
          type: 'installed'
        });
      });
      
      saveAppField();
    }
    
    if (savedFolders) {
      fieldFolders = JSON.parse(savedFolders);
    }
    
  } catch(e) {
    console.error('Failed to load app field:', e);
  }
}

function saveAppField() {
  localStorage.setItem('app-field-apps', JSON.stringify(fieldApps));
  localStorage.setItem('app-field-folders', JSON.stringify(fieldFolders));
}

function openAppField() {
  loadAppField();
  renderAppField();
  document.getElementById('app-field-launcher').classList.add('active');
  addNotification('App Launcher', 'Swipe, pinch to zoom, and organize your apps!', 'info', '🚀');
}

function closeAppField() {
  document.getElementById('app-field-launcher').classList.remove('active');
  if (fieldEditMode) {
    toggleFieldEditMode();
  }
}

function renderAppField() {
  const grid = document.getElementById('field-grid');
  grid.innerHTML = '';

  // Render folders first
  fieldFolders.forEach(folder => {
    const folderEl = createFieldFolderElement(folder);
    grid.appendChild(folderEl);
  });

  // Render apps
  fieldApps.forEach(app => {
    if (!app.folderId) { // Only show apps not in folders
      const appEl = createFieldAppElement(app);
      grid.appendChild(appEl);
    }
  });
}

function createFieldAppElement(app) {
  const div = document.createElement('div');
  div.className = 'app-field-item';
  div.draggable = fieldEditMode;
  div.dataset.appId = app.id;

  const iconHTML = app.iconType ? getIconDisplay(app.icon, app.iconType) : app.icon;

  div.innerHTML = `
    <div class="app-field-icon">
      ${iconHTML}
    </div>
    <div class="app-field-label">${app.name}</div>
  `;

  // Click to launch
  div.addEventListener('click', (e) => {
    if (!fieldEditMode) {
      launchFieldApp(app);
    }
  });

  // Drag and drop for organizing
  if (fieldEditMode) {
    div.addEventListener('dragstart', handleFieldDragStart);
    div.addEventListener('dragend', handleFieldDragEnd);
    div.addEventListener('dragover', handleFieldDragOver);
    div.addEventListener('drop', handleFieldDrop);
  }

  return div;
}

function createFieldFolderElement(folder) {
  const div = document.createElement('div');
  div.className = 'app-field-item field-folder';
  div.draggable = fieldEditMode;
  div.dataset.folderId = folder.id;

  const appsInFolder = fieldApps.filter(app => app.folderId === folder.id);

  div.innerHTML = `
    <div class="app-field-icon">
      📁
      ${appsInFolder.length > 0 ? `<div class="folder-badge">${appsInFolder.length}</div>` : ''}
    </div>
    <div class="app-field-label">${folder.name}</div>
  `;

  div.addEventListener('click', () => {
    if (!fieldEditMode) {
      openFolder(folder);
    }
  });

  if (fieldEditMode) {
    div.addEventListener('dragstart', handleFieldDragStart);
    div.addEventListener('dragend', handleFieldDragEnd);
    div.addEventListener('dragover', handleFieldDragOver);
    div.addEventListener('drop', handleFieldDrop);
  }

  return div;
}

function launchFieldApp(app) {
  closeAppField();
  
  if (app.type === 'builtin') {
    const windowId = app.id === 'claude' ? 'claude-win' : 
                    app.id === 'birdshell' ? 'birdshell-win' :
                    app.id === 'inspireboard' ? 'inspireboard-win' :
                    `${app.id}-win`;
    
    if (app.id === 'birdshell') {
      openBirdShell();
    } else {
      openWindow(windowId);
    }
  } else {
    openApp(app.id);
  }
  
  addNotification('Launching', `Opening ${app.name}...`, 'success', '🚀');
}

function toggleFieldEditMode() {
  fieldEditMode = !fieldEditMode;
  const btn = document.getElementById('edit-mode-text');
  
  if (fieldEditMode) {
    btn.textContent = 'Done';
    btn.parentElement.classList.add('active');
    addNotification('Edit Mode', 'Drag apps to rearrange or create folders', 'info', '✏️');
  } else {
    btn.textContent = 'Edit Mode';
    btn.parentElement.classList.remove('active');
    saveAppField();
  }
  
  renderAppField();
}

function createFolder() {
  const name = prompt('Enter folder name:');
  if (!name) return;

  const folder = {
    id: `folder_${Date.now()}`,
    name: name,
    created: new Date().toISOString()
  };

  fieldFolders.push(folder);
  saveAppField();
  renderAppField();
  
  addNotification('Folder Created', `Created "${name}" folder`, 'success', '📁');
}

function openFolder(folder) {
  const modal = document.getElementById('folder-modal');
  const grid = document.getElementById('folder-modal-grid');
  const title = document.getElementById('folder-modal-title');

  title.innerHTML = `<span>📁</span><span>${folder.name}</span>`;
  grid.innerHTML = '';

  const appsInFolder = fieldApps.filter(app => app.folderId === folder.id);

  if (appsInFolder.length === 0) {
    grid.innerHTML = '<p style="color:rgba(255,255,255,0.5); text-align:center; padding:2rem;">Folder is empty</p>';
  } else {
    appsInFolder.forEach(app => {
      const appEl = createFieldAppElement(app);
      grid.appendChild(appEl);
    });
  }

  modal.classList.add('active');
}

function closeFolderModal() {
  document.getElementById('folder-modal').classList.remove('active');
}

function setFieldZoom(level) {
  fieldZoomLevel = level;
  const grid = document.getElementById('field-grid');
  
  grid.classList.remove('zoom-1', 'zoom-2', 'zoom-3');
  grid.classList.add(`zoom-${level}`);

  document.querySelectorAll('.zoom-btn').forEach(btn => btn.classList.remove('active'));
  event.target.closest('.zoom-btn').classList.add('active');
}

function filterFieldApps(query) {
  const lower = query.toLowerCase();
  const items = document.querySelectorAll('.app-field-item');

  items.forEach(item => {
    const label = item.querySelector('.app-field-label').textContent.toLowerCase();
    item.style.display = label.includes(lower) ? 'flex' : 'none';
  });
}

// Drag and drop handlers
function handleFieldDragStart(e) {
  draggedItem = e.target;
  e.target.classList.add('dragging');
  e.dataTransfer.effectAllowed = 'move';
}

function handleFieldDragEnd(e) {
  e.target.classList.remove('dragging');
  draggedItem = null;
}

function handleFieldDragOver(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';
}

function handleFieldDrop(e) {
  e.preventDefault();
  
  if (!draggedItem) return;

  const dropTarget = e.target.closest('.app-field-item');
  if (!dropTarget || dropTarget === draggedItem) return;

  // Check if dropping on a folder
  if (dropTarget.classList.contains('field-folder')) {
    const folderId = dropTarget.dataset.folderId;
    const appId = draggedItem.dataset.appId;

    if (appId) {
      const app = fieldApps.find(a => a.id === appId);
      if (app) {
        app.folderId = folderId;
        saveAppField();
        renderAppField();
        addNotification('App Moved', `Added to folder`, 'success', '📁');
      }
    }
  } else {
    // Reorder items
    const grid = document.getElementById('field-grid');
    const allItems = [...grid.children];
    const dragIndex = allItems.indexOf(draggedItem);
    const dropIndex = allItems.indexOf(dropTarget);

    if (dragIndex < dropIndex) {
      dropTarget.after(draggedItem);
    } else {
      dropTarget.before(draggedItem);
    }

    // Update order in data
    // This would require more complex logic to persist order
  }
}

// Initialize app field on load
setTimeout(() => {
  loadAppField();
}, 1500);

// Expose functions
window.openAppField = openAppField;
window.closeAppField = closeAppField;
window.toggleFieldEditMode = toggleFieldEditMode;
window.createFolder = createFolder;
window.closeFolderModal = closeFolderModal;
window.setFieldZoom = setFieldZoom;
window.filterFieldApps = filterFieldApps;
