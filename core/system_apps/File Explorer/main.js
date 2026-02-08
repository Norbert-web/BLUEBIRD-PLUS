// ==================== FILE SYSTEM & EXPLORER ====================

// Virtual File System
const fileSystem = {
  '/': {
    type: 'folder',
    name: 'Home',
    children: ['Desktop', 'Documents', 'Downloads', 'Pictures', 'Music', 'Videos']
  },
  '/Desktop': {
    type: 'folder',
    name: 'Desktop',
    children: ['Welcome.txt', 'Projects']
  },
  '/Desktop/Welcome.txt': {
    type: 'file',
    name: 'Welcome.txt',
    size: 1024,
    modified: new Date('2025-01-20'),
    content: 'Welcome to Bluebird OS!\n\nThis is your file explorer. You can:\n- Create folders and files\n- Upload and download files\n- Preview images, videos, and documents\n- Play music files\n\nEnjoy your experience!'
  },
  '/Desktop/Projects': {
    type: 'folder',
    name: 'Projects',
    children: []
  },
  '/Documents': {
    type: 'folder',
    name: 'Documents',
    children: ['Resume.pdf', 'Notes.txt']
  },
  '/Documents/Resume.pdf': {
    type: 'file',
    name: 'Resume.pdf',
    size: 245760,
    modified: new Date('2025-01-15')
  },
  '/Documents/Notes.txt': {
    type: 'file',
    name: 'Notes.txt',
    size: 512,
    modified: new Date('2025-01-22'),
    content: 'Meeting notes:\n- Project deadline: Feb 15\n- Team sync: Every Monday\n- Code review: Thursdays'
  },
  '/Downloads': {
    type: 'folder',
    name: 'Downloads',
    children: []
  },
  '/Pictures': {
    type: 'folder',
    name: 'Pictures',
    children: []
  },
  '/Music': {
    type: 'folder',
    name: 'Music',
    children: []
  },
  '/Videos': {
    type: 'folder',
    name: 'Videos',
    children: []
  }
};

// Explorer state
let currentPath = '/';
let explorerHistory = ['/'];
let historyIndex = 0;
let explorerView = 'grid';
let selectedFiles = [];

// Initialize explorer
function initializeExplorer() {
  loadExplorerFromStorage();
  navigateToFolder('/');
}

// Load file system from localStorage
function loadExplorerFromStorage() {
  const saved = localStorage.getItem('fileSystem');
  if (saved) {
    try {
      const savedFS = JSON.parse(saved);
      Object.assign(fileSystem, savedFS);
    } catch (e) {
      console.error('Failed to load file system:', e);
    }
  }
}

// Save file system to localStorage
function saveExplorerToStorage() {
  try {
    localStorage.setItem('fileSystem', JSON.stringify(fileSystem));
  } catch (e) {
    console.error('Failed to save file system:', e);
  }
}

// Navigate to folder
function navigateToFolder(path) {
  currentPath = path;
  
  // Update history
  if (historyIndex < explorerHistory.length - 1) {
    explorerHistory = explorerHistory.slice(0, historyIndex + 1);
  }
  if (explorerHistory[explorerHistory.length - 1] !== path) {
    explorerHistory.push(path);
    historyIndex = explorerHistory.length - 1;
  }
  
  updateNavigationButtons();
  updateAddressBar();
  updateBreadcrumb();
  renderExplorerItems();
  updateSidebarActive();
}

// Explorer navigation
function explorerGoBack() {
  if (historyIndex > 0) {
    historyIndex--;
    currentPath = explorerHistory[historyIndex];
    updateNavigationButtons();
    updateAddressBar();
    updateBreadcrumb();
    renderExplorerItems();
    updateSidebarActive();
  }
}

function explorerGoForward() {
  if (historyIndex < explorerHistory.length - 1) {
    historyIndex++;
    currentPath = explorerHistory[historyIndex];
    updateNavigationButtons();
    updateAddressBar();
    updateBreadcrumb();
    renderExplorerItems();
    updateSidebarActive();
  }
}

function explorerGoUp() {
  if (currentPath !== '/') {
    const parts = currentPath.split('/').filter(p => p);
    parts.pop();
    const newPath = '/' + parts.join('/');
    navigateToFolder(newPath || '/');
  }
}

function explorerRefresh() {
  renderExplorerItems();
  if (window.playSound) playSound();
}

// Update navigation buttons
function updateNavigationButtons() {
  document.getElementById('explorer-back-btn').disabled = historyIndex === 0;
  document.getElementById('explorer-forward-btn').disabled = historyIndex >= explorerHistory.length - 1;
  document.getElementById('explorer-up-btn').disabled = currentPath === '/';
}

// Update address bar
function updateAddressBar() {
  document.getElementById('explorer-path').value = currentPath;
}

// Update breadcrumb
function updateBreadcrumb() {
  const breadcrumb = document.getElementById('path-breadcrumb');
  const parts = currentPath.split('/').filter(p => p);
  
  let html = '<span onclick="navigateToFolder(\'/\')">Home</span>';
  let path = '';
  
  parts.forEach((part, index) => {
    path += '/' + part;
    const currentPathForClick = path;
    html += `<span onclick="navigateToFolder('${currentPathForClick}')">${part}</span>`;
  });
  
  breadcrumb.innerHTML = html;
}

// Update sidebar active state
function updateSidebarActive() {
  document.querySelectorAll('.sidebar-item').forEach(item => {
    item.classList.remove('active');
  });
  
  const activeItem = Array.from(document.querySelectorAll('.sidebar-item')).find(item => {
    const span = item.querySelector('span');
    if (!span) return false;
    const itemPath = getPathFromSidebarItem(span.textContent);
    return itemPath === currentPath;
  });
  
  if (activeItem) {
    activeItem.classList.add('active');
  }
}

function getPathFromSidebarItem(text) {
  const pathMap = {
    'Home': '/',
    'Desktop': '/Desktop',
    'Documents': '/Documents',
    'Downloads': '/Downloads',
    'Pictures': '/Pictures',
    'Music': '/Music',
    'Videos': '/Videos'
  };
  return pathMap[text] || '/';
}

// Render explorer items
function renderExplorerItems() {
  const container = document.getElementById('explorer-items');
  const folder = fileSystem[currentPath];
  
  if (!folder || folder.type !== 'folder') {
    container.innerHTML = '<div class="explorer-empty"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg><p>Folder not found</p></div>';
    return;
  }
  
  container.className = `explorer-items ${explorerView}-view`;
  
  if (!folder.children || folder.children.length === 0) {
    container.innerHTML = '<div class="explorer-empty"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg><p>This folder is empty</p></div>';
    updateStatusBar(0);
    return;
  }
  
  let html = '';
  folder.children.forEach(childName => {
    const childPath = currentPath === '/' ? '/' + childName : currentPath + '/' + childName;
    const child = fileSystem[childPath];
    
    if (child) {
      html += createExplorerItemHTML(child, childPath);
    }
  });
  
  container.innerHTML = html;
  updateStatusBar(folder.children.length);
}

// Create explorer item HTML
function createExplorerItemHTML(item, path) {
  const isFolder = item.type === 'folder';
  const icon = getFileIcon(item);
  const extension = getFileExtension(item.name);
  const details = isFolder ? `${(item.children || []).length} items` : formatFileSize(item.size || 0);
  
  return `
    <div class="explorer-item" 
         data-path="${path}" 
         ondblclick="handleExplorerItemDoubleClick('${path}')"
         onclick="handleExplorerItemClick(event, '${path}')"
         oncontextmenu="showFileContextMenu(event, '${path}')">
      <div class="explorer-item-icon ${icon.class}">
        ${icon.svg}
        ${!isFolder && extension ? `<span class="file-extension">${extension}</span>` : ''}
      </div>
      <div class="explorer-item-name" title="${item.name}">${item.name}</div>
      <div class="explorer-item-details">${details}</div>
    </div>
  `;
}

// Get file icon
function getFileIcon(item) {
  if (item.type === 'folder') {
    return {
      class: 'file-icon-folder',
      svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
      </svg>`
    };
  }
  
  const ext = getFileExtension(item.name).toLowerCase();
  const iconMap = {
    // Images
    'jpg': { class: 'file-icon-image', svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>' },
    'jpeg': { class: 'file-icon-image', svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>' },
    'png': { class: 'file-icon-image', svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>' },
    'gif': { class: 'file-icon-image', svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>' },
    'webp': { class: 'file-icon-image', svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>' },
    
    // Videos
    'mp4': { class: 'file-icon-video', svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>' },
    'avi': { class: 'file-icon-video', svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>' },
    'mov': { class: 'file-icon-video', svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>' },
    'mkv': { class: 'file-icon-video', svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>' },
    'webm': { class: 'file-icon-video', svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>' },
    
    // Audio
    'mp3': { class: 'file-icon-audio', svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle></svg>' },
    'wav': { class: 'file-icon-audio', svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle></svg>' },
    'ogg': { class: 'file-icon-audio', svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle></svg>' },
    'flac': { class: 'file-icon-audio', svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle></svg>' },
    'm4a': { class: 'file-icon-audio', svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle></svg>' },
    
    // Documents
    'pdf': { class: 'file-icon-document', svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>' },
    'doc': { class: 'file-icon-document', svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>' },
    'docx': { class: 'file-icon-document', svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>' },
    'txt': { class: 'file-icon-document', svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>' },
    
    // Archives
    'zip': { class: 'file-icon-archive', svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>' },
    'rar': { class: 'file-icon-archive', svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>' },
    '7z': { class: 'file-icon-archive', svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>' },
    
    // Code
    'js': { class: 'file-icon-code', svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>' },
    'html': { class: 'file-icon-code', svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>' },
    'css': { class: 'file-icon-code', svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>' },
    'py': { class: 'file-icon-code', svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>' },
    'json': { class: 'file-icon-code', svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>' }
  };
  
  return iconMap[ext] || {
    class: 'file-icon-document',
    svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path><polyline points="13 2 13 9 20 9"></polyline></svg>'
  };
}

// Get file extension
function getFileExtension(filename) {
  const parts = filename.split('.');
  return parts.length > 1 ? parts.pop() : '';
}

// Format file size
function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

// Update status bar
function updateStatusBar(count) {
  document.getElementById('explorer-items-count').textContent = `${count} item${count !== 1 ? 's' : ''}`;
}

// Handle explorer item click
function handleExplorerItemClick(event, path) {
  if (!event.ctrlKey && !event.metaKey) {
    // Clear all selections
    document.querySelectorAll('.explorer-item').forEach(item => {
      item.classList.remove('selected');
    });
    selectedFiles = [];
  }
  
  const item = event.currentTarget;
  if (item.classList.contains('selected')) {
    item.classList.remove('selected');
    selectedFiles = selectedFiles.filter(p => p !== path);
  } else {
    item.classList.add('selected');
    selectedFiles.push(path);
  }
}

// Handle explorer item double click
function handleExplorerItemDoubleClick(path) {
  const item = fileSystem[path];
  if (!item) return;
  
  if (item.type === 'folder') {
    navigateToFolder(path);
  } else {
    openFile(path);
  }
}

// Open file
function openFile(path) {
  const file = fileSystem[path];
  if (!file) return;
  
  const ext = getFileExtension(file.name).toLowerCase();
  
  // Audio files - add to music player
  if (['mp3', 'wav', 'ogg', 'flac', 'm4a'].includes(ext)) {
    addToPlaylist(path, file);
    openWindow('music-player-win');
    return;
  }
  
  // Other files - open preview
  openFilePreview(path);
}

// Set explorer view
function setExplorerView(view) {
  explorerView = view;
  document.querySelectorAll('.explorer-view-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  document.getElementById(`view-${view}-btn`).classList.add('active');
  renderExplorerItems();
}

// Search files
let searchTimeout;
function searchFiles(query) {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    if (!query.trim()) {
      renderExplorerItems();
      return;
    }
    
    const container = document.getElementById('explorer-items');
    container.className = `explorer-items ${explorerView}-view`;
    
    const results = searchInFileSystem(query.toLowerCase());
    
    if (results.length === 0) {
      container.innerHTML = `
        <div class="explorer-empty">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.35-4.35"></path>
          </svg>
          <p>No results found for "${query}"</p>
        </div>
      `;
      return;
    }
    
    let html = '';
    results.forEach(result => {
      html += createExplorerItemHTML(result.item, result.path);
    });
    container.innerHTML = html;
    updateStatusBar(results.length);
  }, 300);
}

function searchInFileSystem(query) {
  const results = [];
  
  function search(path) {
    const item = fileSystem[path];
    if (!item) return;
    
    if (item.name.toLowerCase().includes(query)) {
      results.push({ path, item });
    }
    
    if (item.type === 'folder' && item.children) {
      item.children.forEach(child => {
        const childPath = path === '/' ? '/' + child : path + '/' + child;
        search(childPath);
      });
    }
  }
  
  search('/');
  return results;
}

// File context menu
let contextMenuElement = null;

function showFileContextMenu(event, path) {
  event.preventDefault();
  
  // Remove existing context menu
  if (contextMenuElement) {
    contextMenuElement.remove();
  }
  
  const item = fileSystem[path];
  if (!item) return;
  
  const menu = document.createElement('div');
  menu.className = 'file-context-menu';
  menu.style.left = event.clientX + 'px';
  menu.style.top = event.clientY + 'px';
  
  const isFolder = item.type === 'folder';
  
  menu.innerHTML = `
    <div class="context-menu-item" onclick="openFile('${path}'); closeContextMenu();">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
        <polyline points="15 3 21 3 21 9"></polyline>
        <line x1="10" y1="14" x2="21" y2="3"></line>
      </svg>
      Open
    </div>
    ${!isFolder ? `
      <div class="context-menu-item" onclick="downloadFile('${path}'); closeContextMenu();">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
          <polyline points="7 10 12 15 17 10"></polyline>
          <line x1="12" y1="15" x2="12" y2="3"></line>
        </svg>
        Download
      </div>
    ` : ''}
    <div class="context-menu-divider"></div>
    <div class="context-menu-item" onclick="renameFile('${path}'); closeContextMenu();">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
      </svg>
      Rename
    </div>
    <div class="context-menu-item" onclick="deleteFile('${path}'); closeContextMenu();">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="3 6 5 6 21 6"></polyline>
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
      </svg>
      Delete
    </div>
  `;
  
  document.body.appendChild(menu);
  contextMenuElement = menu;
  
  // Close menu when clicking outside
  setTimeout(() => {
    document.addEventListener('click', closeContextMenu);
  }, 0);
}

function closeContextMenu() {
  if (contextMenuElement) {
    contextMenuElement.remove();
    contextMenuElement = null;
  }
  document.removeEventListener('click', closeContextMenu);
}

// File operations
function renameFile(path) {
  const item = fileSystem[path];
  if (!item) return;
  
  const newName = prompt('Enter new name:', item.name);
  if (!newName || newName === item.name) return;
  
  const parts = path.split('/');
  parts.pop();
  const parentPath = parts.join('/') || '/';
  const newPath = parentPath === '/' ? '/' + newName : parentPath + '/' + newName;
  
  // Check if name already exists
  if (fileSystem[newPath]) {
    alert('A file or folder with that name already exists.');
    return;
  }
  
  // Rename
  fileSystem[newPath] = { ...item, name: newName };
  delete fileSystem[path];
  
  // Update parent
  const parent = fileSystem[parentPath];
  if (parent && parent.children) {
    const index = parent.children.indexOf(item.name);
    if (index > -1) {
      parent.children[index] = newName;
    }
  }
  
  saveExplorerToStorage();
  renderExplorerItems();
  
  if (window.playSound) playSound();
}

function deleteFile(path) {
  const item = fileSystem[path];
  if (!item) return;
  
  if (!confirm(`Are you sure you want to delete "${item.name}"?`)) return;
  
  const parts = path.split('/');
  parts.pop();
  const parentPath = parts.join('/') || '/';
  
  // Delete
  delete fileSystem[path];
  
  // Update parent
  const parent = fileSystem[parentPath];
  if (parent && parent.children) {
    parent.children = parent.children.filter(c => c !== item.name);
  }
  
  saveExplorerToStorage();
  renderExplorerItems();
  
  if (window.playSound) playSound();
}

function downloadFile(path) {
  const file = fileSystem[path];
  if (!file || file.type === 'folder') return;
  
  // For text files with content
  if (file.content) {
    const blob = new Blob([file.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    a.click();
    URL.revokeObjectURL(url);
    return;
  }
  
  // For uploaded files with data URL
  if (file.dataUrl) {
    const a = document.createElement('a');
    a.href = file.dataUrl;
    a.download = file.name;
    a.click();
    return;
  }
  
  alert('This file cannot be downloaded.');
}

// Initialize explorer when window opens
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    initializeExplorer();
  }, 500);
});