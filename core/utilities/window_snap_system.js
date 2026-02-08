// Window Snapping System
let isDraggingForSnap = false;
let snapPreview = null;
let snapZone = null;
let currentSnapLayout = null;

// Create snap preview overlay
function createSnapPreview() {
  if (!snapPreview) {
    snapPreview = document.createElement('div');
    snapPreview.id = 'snap-preview';
    snapPreview.style.cssText = `
      position: fixed;
      border: 3px solid var(--accent);
      background: rgba(74, 222, 128, 0.1);
      backdrop-filter: blur(10px);
      border-radius: 8px;
      pointer-events: none;
      z-index: 99999;
      display: none;
      transition: all 0.15s ease;
    `;
    document.body.appendChild(snapPreview);
  }
  return snapPreview;
}

// Detect snap zone based on mouse position
function detectSnapZone(x, y) {
  const edgeThreshold = 20;
  const cornerThreshold = 150;
  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight;
  const taskbarHeight = 60;
  
  // Left edge
  if (x <= edgeThreshold) {
    if (y <= cornerThreshold) return 'top-left';
    if (y >= screenHeight - cornerThreshold - taskbarHeight) return 'bottom-left';
    return 'left';
  }
  
  // Right edge
  if (x >= screenWidth - edgeThreshold) {
    if (y <= cornerThreshold) return 'top-right';
    if (y >= screenHeight - cornerThreshold - taskbarHeight) return 'bottom-right';
    return 'right';
  }
  
  // Top edge
  if (y <= edgeThreshold) {
    return 'maximize';
  }
  
  return null;
}

// Get snap preview dimensions
function getSnapDimensions(zone) {
  const taskbarHeight = 60;
  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight - taskbarHeight;
  
  const layouts = {
    'left': { left: 0, top: 0, width: screenWidth / 2, height: screenHeight },
    'right': { left: screenWidth / 2, top: 0, width: screenWidth / 2, height: screenHeight },
    'top-left': { left: 0, top: 0, width: screenWidth / 2, height: screenHeight / 2 },
    'top-right': { left: screenWidth / 2, top: 0, width: screenWidth / 2, height: screenHeight / 2 },
    'bottom-left': { left: 0, top: screenHeight / 2, width: screenWidth / 2, height: screenHeight / 2 },
    'bottom-right': { left: screenWidth / 2, top: screenHeight / 2, width: screenWidth / 2, height: screenHeight / 2 },
    'maximize': { left: 0, top: 0, width: screenWidth, height: screenHeight }
  };
  
  return layouts[zone] || null;
}

// Show snap preview
function showSnapPreview(zone) {
  const preview = createSnapPreview();
  const dims = getSnapDimensions(zone);
  
  if (dims) {
    preview.style.left = dims.left + 'px';
    preview.style.top = dims.top + 'px';
    preview.style.width = dims.width + 'px';
    preview.style.height = dims.height + 'px';
    preview.style.display = 'block';
  }
}

// Hide snap preview
function hideSnapPreview() {
  if (snapPreview) {
    snapPreview.style.display = 'none';
  }
}

// Apply snap to window
function applySnap(windowEl, zone) {
  const dims = getSnapDimensions(zone);
  if (!dims) return;
  
  windowEl.style.left = dims.left + 'px';
  windowEl.style.top = dims.top + 'px';
  windowEl.style.width = dims.width + 'px';
  windowEl.style.height = dims.height + 'px';
  
  // Mark window as snapped
  windowEl.dataset.snapped = zone;
  
  // Remove maximized state if present
  windowEl.classList.remove('maximized');
  
  // Play sound
  if (window.playSound) playSound();
}

// Update your existing window drag function
// Find the startDrag function and modify it:
function startDrag(e, windowId) {
  if (e.target.closest('.window-controls')) return;
  
  const windowEl = document.getElementById(windowId);
  if (!windowEl) return;
  
  // If window is snapped, unsnap it
  if (windowEl.dataset.snapped) {
    // Calculate new position to keep window under cursor
    const rect = windowEl.getBoundingClientRect();
    const cursorXInWindow = e.clientX - rect.left;
    const cursorYInWindow = e.clientY - rect.top;
    
    // Remove snap
    delete windowEl.dataset.snapped;
    
    // Set new dimensions (smaller than snapped)
    const newWidth = Math.min(800, rect.width * 0.6);
    const newHeight = Math.min(600, rect.height * 0.8);
    windowEl.style.width = newWidth + 'px';
    windowEl.style.height = newHeight + 'px';
    
    // Position window under cursor
    windowEl.style.left = (e.clientX - (cursorXInWindow * newWidth / rect.width)) + 'px';
    windowEl.style.top = (e.clientY - (cursorYInWindow * newHeight / rect.height)) + 'px';
  }
  
  isDraggingForSnap = true;
  draggedWindow = windowEl;
  offsetX = e.clientX - windowEl.offsetLeft;
  offsetY = e.clientY - windowEl.offsetTop;
  
  windowEl.classList.add('dragging');
  bringToFront(windowId);
  
  e.preventDefault();
}

// Modify your existing onMouseMove to include snap detection
document.addEventListener('mousemove', function(e) {
  if (isDraggingForSnap && draggedWindow) {
    const x = e.clientX - offsetX;
    const y = e.clientY - offsetY;
    
    draggedWindow.style.left = x + 'px';
    draggedWindow.style.top = y + 'px';
    
    // Detect and show snap zone
    const zone = detectSnapZone(e.clientX, e.clientY);
    if (zone && zone !== snapZone) {
      snapZone = zone;
      showSnapPreview(zone);
    } else if (!zone && snapZone) {
      snapZone = null;
      hideSnapPreview();
    }
  }
});

// Modify your existing stopDrag function
function stopDrag() {
  if (isDraggingForSnap && draggedWindow) {
    draggedWindow.classList.remove('dragging');
    
    // Apply snap if in snap zone
    if (snapZone) {
      applySnap(draggedWindow, snapZone);
      hideSnapPreview();
      snapZone = null;
    }
    
    isDraggingForSnap = false;
    draggedWindow = null;
  }
}

document.addEventListener('mouseup', stopDrag);

// Keyboard shortcuts for snapping
document.addEventListener('keydown', function(e) {
  // Win + Arrow keys for snapping
  if (e.metaKey || e.key === 'Meta') {
    const activeWindow = document.querySelector('.window:not([style*="display: none"])');
    if (!activeWindow) return;
    
    switch(e.key) {
      case 'ArrowLeft':
        e.preventDefault();
        applySnap(activeWindow, 'left');
        break;
      case 'ArrowRight':
        e.preventDefault();
        applySnap(activeWindow, 'right');
        break;
      case 'ArrowUp':
        e.preventDefault();
        applySnap(activeWindow, 'maximize');
        break;
    }
  }
});

// Snap Layout Picker (hover over maximize button)
function createSnapLayoutPicker() {
  const picker = document.createElement('div');
  picker.id = 'snap-layout-picker';
  picker.innerHTML = `
    <div class="snap-layout-grid">
      <div class="snap-layout-option" data-layout="left-right" title="Side by side">
        <div class="snap-layout-preview">
          <div style="width: 50%; height: 100%; background: var(--accent); opacity: 0.5;"></div>
          <div style="width: 50%; height: 100%; background: var(--accent); opacity: 0.3;"></div>
        </div>
      </div>
      <div class="snap-layout-option" data-layout="quarters" title="Four corners">
        <div class="snap-layout-preview" style="display: grid; grid-template-columns: 1fr 1fr; grid-template-rows: 1fr 1fr;">
          <div style="background: var(--accent); opacity: 0.5;"></div>
          <div style="background: var(--accent); opacity: 0.3;"></div>
          <div style="background: var(--accent); opacity: 0.3;"></div>
          <div style="background: var(--accent); opacity: 0.3;"></div>
        </div>
      </div>
      <div class="snap-layout-option" data-layout="triple" title="Triple layout">
        <div class="snap-layout-preview" style="display: grid; grid-template-columns: 1fr 1fr;">
          <div style="background: var(--accent); opacity: 0.5;"></div>
          <div style="display: grid; grid-template-rows: 1fr 1fr; gap: 2px;">
           <div style="background: var(--accent); opacity: 0.3;"></div>
            <div style="background: var(--accent); opacity: 0.3;"></div>
          </div>
        </div>
      </div>
    </div>
  `;
  
  picker.style.cssText = `
    position: absolute;
    bottom: 100%;
    right: 0;
    margin-bottom: 8px;
    background: var(--window-bg);
    backdrop-filter: blur(40px);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 8px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
    display: none;
    z-index: 99999;
  `;
  
  return picker;
}
// Add snap layout picker to all maximize buttons
function initializeSnapLayoutPickers() {
  document.querySelectorAll('.win-max').forEach(maxBtn => {
    let picker = null;
    let pickerTimeout = null;
    
    maxBtn.addEventListener('mouseenter', function(e) {
      pickerTimeout = setTimeout(() => {
        if (!picker) {
          picker = createSnapLayoutPicker();
          maxBtn.parentElement.style.position = 'relative';
          maxBtn.parentElement.appendChild(picker);
          
          // Add click handlers to layout options
          picker.querySelectorAll('.snap-layout-option').forEach(option => {
            option.addEventListener('click', function() {
              const layout = this.dataset.layout;
              const windowEl = maxBtn.closest('.window');
              applySnapLayout(windowEl, layout);
              picker.style.display = 'none';
            });
          });
        }
        picker.style.display = 'block';
      }, 500); // Show after 500ms hover
    });
    
    maxBtn.addEventListener('mouseleave', function() {
      clearTimeout(pickerTimeout);
      if (picker) {
        setTimeout(() => {
          if (picker && !picker.matches(':hover')) {
            picker.style.display = 'none';
          }
        }, 200);
      }
    });
    
    // Hide picker when mouse leaves it
    if (picker) {
      picker.addEventListener('mouseleave', function() {
        picker.style.display = 'none';
      });
    }
  });
}

// Apply snap layout
function applySnapLayout(windowEl, layout) {
  const windowId = windowEl.id;
  
  switch(layout) {
    case 'left-right':
      applySnap(windowEl, 'left');
      // Here you could open a second window and snap it right
      break;
    case 'quarters':
      applySnap(windowEl, 'top-left');
      break;
    case 'triple':
      applySnap(windowEl, 'left');
      break;
  }
}

// Initialize snap layout pickers when DOM is ready
window.addEventListener('DOMContentLoaded', () => {
  setTimeout(initializeSnapLayoutPickers, 1000);
});

// Respond to window resize (reapply snap if window was snapped)
window.addEventListener('resize', function() {
  document.querySelectorAll('.window[data-snapped]').forEach(windowEl => {
    const snapZone = windowEl.dataset.snapped;
    if (snapZone) {
      const dims = getSnapDimensions(snapZone);
      if (dims) {
        windowEl.style.left = dims.left + 'px';
        windowEl.style.top = dims.top + 'px';
        windowEl.style.width = dims.width + 'px';
        windowEl.style.height = dims.height + 'px';
      }
    }
  });
});

// Double-click titlebar to toggle maximize/restore with snap awareness
document.addEventListener('dblclick', function(e) {
  if (e.target.closest('.window-header') && !e.target.closest('.window-controls')) {
    const windowEl = e.target.closest('.window');
    if (!windowEl) return;
    
    if (windowEl.dataset.snapped === 'maximize' || windowEl.classList.contains('maximized')) {
      // Restore to previous size
      restoreWindow(windowEl.id);
    } else {
      // Maximize
      applySnap(windowEl, 'maximize');
    }
  }
});

// Restore window function (for when unsnapping)
function restoreWindow(windowId) {
  const windowEl = document.getElementById(windowId);
  if (!windowEl) return;
  
  // Remove snap state
  delete windowEl.dataset.snapped;
  windowEl.classList.remove('maximized');
  
  // Restore to default size or saved size
  const savedSize = localStorage.getItem(`${windowId}-size`);
  if (savedSize) {
    const size = JSON.parse(savedSize);
    windowEl.style.width = size.width;
    windowEl.style.height = size.height;
    windowEl.style.left = size.left;
    windowEl.style.top = size.top;
  } else {
    // Default restored size
    windowEl.style.width = '600px';
    windowEl.style.height = '500px';
    windowEl.style.left = '20%';
    windowEl.style.top = '15%';
  }
  
  if (window.playSound) playSound();
}

// Save window size before snapping
function saveWindowSize(windowId) {
  const windowEl = document.getElementById(windowId);
  if (!windowEl || windowEl.dataset.snapped) return;
  
  const size = {
    width: windowEl.style.width,
    height: windowEl.style.height,
    left: windowEl.style.left,
    top: windowEl.style.top
  };
  
  localStorage.setItem(`${windowId}-size`, JSON.stringify(size));
}

// Call saveWindowSize before applying snap
const originalApplySnap = applySnap;
applySnap = function(windowEl, zone) {
  if (!windowEl.dataset.snapped) {
    saveWindowSize(windowEl.id);
  }
  originalApplySnap(windowEl, zone);
};
