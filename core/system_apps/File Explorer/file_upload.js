// ==================== FILE UPLOAD ====================

// Create upload zone (add to toolbar or use drag & drop)
function createNewFolder() {
  const name = prompt('Enter folder name:');
  if (!name) return;
  
  const newPath = currentPath === '/' ? '/' + name : currentPath + '/' + name;
  
  if (fileSystem[newPath]) {
    alert('A folder with that name already exists.');
    return;
  }
  
  fileSystem[newPath] = {
    type: 'folder',
    name: name,
    children: []
  };
  
  const parent = fileSystem[currentPath];
  if (parent && parent.children) {
    parent.children.push(name);
  }
  
  saveExplorerToStorage();
  renderExplorerItems();
  
  if (window.playSound) playSound();
}

function uploadFiles() {
  const input = document.createElement('input');
  input.type = 'file';
  input.multiple = true;
  
  input.onchange = async (e) => {
    const files = Array.from(e.target.files);
    
    for (const file of files) {
      await uploadFile(file);
    }
    
    renderExplorerItems();
    if (window.playSound) playSound();
  };
  
  input.click();
}

async function uploadFile(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const filePath = currentPath === '/' ? '/' + file.name : currentPath + '/' + file.name;
      
      // Check if file exists
      if (fileSystem[filePath]) {
        if (!confirm(`File "${file.name}" already exists. Overwrite?`)) {
          resolve();
          return;
        }
      }
      
      fileSystem[filePath] = {
        type: 'file',
        name: file.name,
        size: file.size,
        modified: new Date(file.lastModified),
        dataUrl: e.target.result
      };
      
      const parent = fileSystem[currentPath];
      if (parent && parent.children && !parent.children.includes(file.name)) {
        parent.children.push(file.name);
      }
      
      saveExplorerToStorage();
      resolve();
    };
    
    reader.readAsDataURL(file);
  });
}

// Drag and drop for file explorer
function initializeFileDragDrop() {
  const explorerMain = document.querySelector('.explorer-main');
  if (!explorerMain) return;
  
  explorerMain.addEventListener('dragover', (e) => {
    e.preventDefault();
    explorerMain.style.background = 'rgba(74, 222, 128, 0.1)';
  });
  
  explorerMain.addEventListener('dragleave', (e) => {
    e.preventDefault();
    explorerMain.style.background = '';
  });
  
  explorerMain.addEventListener('drop', async (e) => {
    e.preventDefault();
    explorerMain.style.background = '';
    
    const files = Array.from(e.dataTransfer.files);
    for (const file of files) {
      await uploadFile(file);
    }
    
    renderExplorerItems();
    if (window.playSound) playSound();
  });
}

document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    initializeFileDragDrop();
  }, 1000);
});

// Add toolbar buttons for file operations
function addExplorerToolbarButtons() {
  const toolbar = document.querySelector('.explorer-toolbar');
  if (!toolbar) return;
  
  // Find the search box
  const searchBox = toolbar.querySelector('.explorer-search');
  
  // Create new buttons container
  const btnContainer = document.createElement('div');
  btnContainer.style.cssText = 'display: flex; gap: 4px;';
  
  btnContainer.innerHTML = `
    <button class="explorer-nav-btn" onclick="createNewFolder()" title="New Folder">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
        <line x1="12" y1="11" x2="12" y2="17"></line>
        <line x1="9" y1="14" x2="15" y2="14"></line>
      </svg>
    </button>
    <button class="explorer-nav-btn" onclick="uploadFiles()" title="Upload Files">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
        <polyline points="17 8 12 3 7 8"></polyline>
        <line x1="12" y1="3" x2="12" y2="15"></line>
      </svg>
    </button>
  `;
  
  // Insert before search box
  toolbar.insertBefore(btnContainer, searchBox);
}

document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    addExplorerToolbarButtons();
  }, 1000);
});

// Keyboard shortcuts for file explorer
document.addEventListener('keydown', (e) => {
  // Only handle shortcuts when file explorer is open
  const explorerWin = document.getElementById('file-explorer-win');
  if (!explorerWin || explorerWin.style.display === 'none') return;
  
  // Ctrl/Cmd + N - New Folder
  if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
    e.preventDefault();
    createNewFolder();
  }
  
  // Ctrl/Cmd + U - Upload Files
  if ((e.ctrlKey || e.metaKey) && e.key === 'u') {
    e.preventDefault();
    uploadFiles();
  }
  
  // Delete - Delete selected files
  if (e.key === 'Delete' && selectedFiles.length > 0) {
    e.preventDefault();
    selectedFiles.forEach(path => deleteFile(path));
  }
  
  // F2 - Rename selected file
  if (e.key === 'F2' && selectedFiles.length === 1) {
    e.preventDefault();
    renameFile(selectedFiles[0]);
  }
  
  // Backspace/Alt+Left - Go back
  if ((e.key === 'Backspace' || (e.altKey && e.key === 'ArrowLeft')) && historyIndex > 0) {
    e.preventDefault();
    explorerGoBack();
  }
  
  // Alt+Right - Go forward
  if (e.altKey && e.key === 'ArrowRight' && historyIndex < explorerHistory.length - 1) {
    e.preventDefault();
    explorerGoForward();
  }
  
  // Alt+Up - Go up
  if (e.altKey && e.key === 'ArrowUp' && currentPath !== '/') {
    e.preventDefault();
    explorerGoUp();
  }
  
  // Ctrl/Cmd + A - Select all
  if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
    const explorerItems = document.getElementById('explorer-items');
    if (explorerItems.contains(document.activeElement) || document.activeElement === document.body) {
      e.preventDefault();
      document.querySelectorAll('.explorer-item').forEach(item => {
        item.classList.add('selected');
        selectedFiles.push(item.dataset.path);
      });
    }
  }
});

// Add File Explorer to Start Menu (if not already there)
// You can add this to your start menu HTML:
/*
<div class="menu-item" onclick="openWindow('file-explorer-win'); toggleStartMenu()" role="menuitem">
  <i><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
  </svg></i>
  <span>File Explorer</span>
</div>
*/

// Add Music Player to Start Menu (if not already there)
/*
<div class="menu-item" onclick="openWindow('music-player-win'); toggleStartMenu()" role="menuitem">
  <i><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <path d="M9 18V5l12-2v13"></path>
    <circle cx="6" cy="18" r="3"></circle>
    <circle cx="18" cy="16" r="3"></circle>
  </svg></i>
  <span>Music Player</span>
</div>
*/