// ===== PERMISSIONS SYSTEM =====
const permissions = {
  granted: {},
  requestQueue: []
};

// Load saved permissions
function loadPermissions() {
  try {
    const saved = localStorage.getItem('bluebird-permissions');
    if (saved) {
      permissions.granted = JSON.parse(saved);
    }
  } catch(e) {
    console.error('Failed to load permissions:', e);
  }
}

function savePermissions() {
  localStorage.setItem('bluebird-permissions', JSON.stringify(permissions.granted));
}

// Request permission
async function requestPermission(appId, permissionType, description) {
  return new Promise((resolve, reject) => {
    // Check if already granted
    if (permissions.granted[appId] && permissions.granted[appId][permissionType]) {
      resolve(true);
      return;
    }

    // Show permission dialog
    const modal = document.createElement('div');
    modal.style.cssText = 'position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.8); z-index:9999; display:flex; align-items:center; justify-content:center; backdrop-filter:blur(5px); padding:1rem;';
    
    const permissionIcons = {
      camera: '📷',
      microphone: '🎤',
      location: '📍',
      notifications: '🔔',
      storage: '💾',
      clipboard: '📋'
    };

    modal.innerHTML = `
      <div style="background:#fff; border-radius:16px; max-width:500px; width:100%; box-shadow:0 25px 80px rgba(0,0,0,0.6); animation: permissionSlideIn 0.3s ease-out;">
        <div style="padding:2rem; text-align:center;">
          <div style="font-size:4rem; margin-bottom:1rem;">${permissionIcons[permissionType] || '🔐'}</div>
          <h2 style="color:#2d3748; font-size:1.5rem; margin-bottom:0.8rem;">Permission Request</h2>
          <p style="color:#718096; font-size:1rem; margin-bottom:0.5rem;">
            <strong style="color:#2d3748;">${appId}</strong> wants to access your <strong style="color:#2d3748;">${permissionType}</strong>
          </p>
          <p style="color:#a0aec0; font-size:0.9rem; margin-bottom:2rem; line-height:1.6;">
            ${description}
          </p>
          
          <div style="display:flex; gap:0.8rem; justify-content:center; margin-bottom:1rem;">
            <button id="perm-deny" style="flex:1; padding:0.9rem 1.5rem; background:#f7fafc; border:1px solid #e2e8f0; border-radius:10px; cursor:pointer; font-weight:600; color:#2d3748; transition:all 0.2s;">
              Deny
            </button>
            <button id="perm-allow" style="flex:1; padding:0.9rem 1.5rem; background:linear-gradient(135deg, #4ade80, #22c55e); color:#000; border:none; border-radius:10px; cursor:pointer; font-weight:600; box-shadow:0 4px 12px rgba(74,222,128,0.3); transition:all 0.2s;">
              Allow
            </button>
          </div>

          <label style="display:flex; align-items:center; justify-content:center; gap:0.5rem; color:#718096; font-size:0.85rem; cursor:pointer;">
            <input type="checkbox" id="perm-remember" style="width:16px; height:16px; cursor:pointer;">
            <span>Remember my choice</span>
          </label>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Add animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes permissionSlideIn {
        from { opacity:0; transform:scale(0.9) translateY(-20px); }
        to { opacity:1; transform:scale(1) translateY(0); }
      }
    `;
    document.head.appendChild(style);

    // Handle button clicks
    modal.querySelector('#perm-allow').onclick = () => {
      const remember = modal.querySelector('#perm-remember').checked;
      
      if (remember) {
        if (!permissions.granted[appId]) permissions.granted[appId] = {};
        permissions.granted[appId][permissionType] = true;
        savePermissions();
      }

      modal.remove();
      style.remove();
      addNotification('Permission Granted', `${appId} can now access your ${permissionType}`, 'success', '✅');
      resolve(true);
    };

    modal.querySelector('#perm-deny').onclick = () => {
      const remember = modal.querySelector('#perm-remember').checked;
      
      if (remember) {
        if (!permissions.granted[appId]) permissions.granted[appId] = {};
        permissions.granted[appId][permissionType] = false;
        savePermissions();
      }

      modal.remove();
      style.remove();
      addNotification('Permission Denied', `${appId} cannot access your ${permissionType}`, 'warning', '⚠️');
      resolve(false);
    };
  });
}

// Check if permission is granted
function hasPermission(appId, permissionType) {
  return permissions.granted[appId] && permissions.granted[appId][permissionType] === true;
}

// Revoke permission
function revokePermission(appId, permissionType) {
  if (permissions.granted[appId]) {
    delete permissions.granted[appId][permissionType];
    savePermissions();
    addNotification('Permission Revoked', `${appId} can no longer access your ${permissionType}`, 'info', 'ℹ️');
  }
}

// View all permissions
function viewPermissions() {
  const modal = document.createElement('div');
  modal.style.cssText = 'position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.8); z-index:9999; display:flex; align-items:center; justify-content:center; backdrop-filter:blur(5px); padding:1rem;';
  
  let permissionsHTML = '';
  
  for (const [appId, perms] of Object.entries(permissions.granted)) {
    for (const [perm, granted] of Object.entries(perms)) {
      if (granted) {
        permissionsHTML += `
          <div style="display:flex; justify-content:space-between; align-items:center; padding:0.8rem; background:#f7fafc; border-radius:8px; margin-bottom:0.5rem;">
            <div>
              <div style="font-weight:600; color:#2d3748;">${appId}</div>
              <div style="font-size:0.85rem; color:#718096;">Can access ${perm}</div>
            </div>
            <button onclick="revokePermission('${appId}', '${perm}'); this.closest('.permission-item').remove();" style="padding:0.4rem 0.8rem; background:#ff6b6b; color:white; border:none; border-radius:6px; cursor:pointer; font-size:0.85rem; font-weight:600;">
              Revoke
            </button>
          </div>
        `;
      }
    }
  }

  if (!permissionsHTML) {
    permissionsHTML = '<p style="text-align:center; color:#a0aec0; padding:2rem;">No permissions granted yet</p>';
  }

  modal.innerHTML = `
    <div style="background:#fff; border-radius:16px; max-width:600px; width:100%; max-height:80vh; overflow:hidden; box-shadow:0 25px 80px rgba(0,0,0,0.6);">
      <div style="padding:1.5rem; border-bottom:1px solid #e2e8f0; display:flex; justify-content:space-between; align-items:center;">
        <h2 style="color:#2d3748; font-size:1.3rem; margin:0;">App Permissions</h2>
        <button onclick="this.closest('div[style*=fixed]').remove()" style="background:none; border:none; font-size:2rem; color:#a0aec0; cursor:pointer; line-height:1; padding:0;">×</button>
      </div>
      <div style="padding:1.5rem; overflow-y:auto; max-height:60vh;">
        ${permissionsHTML}
      </div>
    </div>
  `;

  document.body.appendChild(modal);
}

// Example usage in apps
async function useCamera(appId) {
  const hasAccess = await requestPermission(
    appId,
    'camera',
    'This app needs camera access to take photos or videos.'
  );

  if (hasAccess) {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      return stream;
    } catch(e) {
      addNotification('Camera Error', 'Unable to access camera', 'error', '❌');
      return null;
    }
  }
  return null;
}

async function useMicrophone(appId) {
  const hasAccess = await requestPermission(
    appId,
    'microphone',
    'This app needs microphone access to record audio.'
  );

  if (hasAccess) {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      return stream;
    } catch(e) {
      addNotification('Microphone Error', 'Unable to access microphone', 'error', '❌');
      return null;
    }
  }
  return null;
}

async function useLocation(appId) {
  const hasAccess = await requestPermission(
    appId,
    'location',
    'This app needs to know your location.'
  );

  if (hasAccess) {
    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => resolve(position),
        (error) => {
          addNotification('Location Error', 'Unable to get location', 'error', '❌');
          resolve(null);
        }
      );
    });
  }
  return null;
}

// Initialize permissions on load
loadPermissions();

// Expose functions
window.requestPermission = requestPermission;
window.hasPermission = hasPermission;
window.revokePermission = revokePermission;
window.viewPermissions = viewPermissions;
window.useCamera = useCamera;
window.useMicrophone = useMicrophone;
window.useLocation = useLocation;
