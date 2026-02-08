// ===== INSPIREBOARD APP =====
let inspireIdeas = [];
let inspireCurrentIcon = '💡';
let inspireEditingId = null;

function loadInspireIdeas() {
  const saved = localStorage.getItem('inspireboard-ideas');
  if (saved) {
    inspireIdeas = JSON.parse(saved);
  } else {
    // Sample ideas
    inspireIdeas = [
      {
        id: Date.now() + 1,
        icon: '🚀',
        title: 'AI-Powered Learning Platform',
        category: 'tech',
        description: 'Create an adaptive learning platform that uses AI to personalize education for African students with limited internet access.',
        date: new Date().toISOString(),
        likes: 0
      },
      {
        id: Date.now() + 2,
        icon: '🎨',
        title: 'African Design System',
        category: 'design',
        description: 'Build a comprehensive design system inspired by African patterns, colors, and cultural elements for modern web applications.',
        date: new Date().toISOString(),
        likes: 0
      },
      {
        id: Date.now() + 3,
        icon: '💼',
        title: 'Rural Business Hub',
        category: 'business',
        description: 'Establish co-working spaces in rural areas with reliable internet and tools to empower local entrepreneurs.',
        date: new Date().toISOString(),
        likes: 0
      }
    ];
    saveInspireIdeas();
  }
  renderInspireIdeas();
}

function saveInspireIdeas() {
  localStorage.setItem('inspireboard-ideas', JSON.stringify(inspireIdeas));
}

function renderInspireIdeas() {
  const grid = document.getElementById('inspire-grid');
  if (!grid) return;

  const searchTerm = (document.getElementById('inspire-search')?.value || '').toLowerCase();
  const filterCategory = document.getElementById('inspire-filter')?.value || 'all';

  let filtered = inspireIdeas.filter(idea => {
    const matchesSearch = idea.title.toLowerCase().includes(searchTerm) || 
                         idea.description.toLowerCase().includes(searchTerm);
    const matchesFilter = filterCategory === 'all' || idea.category === filterCategory;
    return matchesSearch && matchesFilter;
  });

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div style="grid-column:1/-1; text-align:center; padding:3rem; color:white;">
        <div style="font-size:4rem; margin-bottom:1rem; opacity:0.7;">💭</div>
        <div style="font-size:1.3rem; margin-bottom:0.5rem;">No ideas yet</div>
        <div style="opacity:0.8;">Click "New Idea" to create your first inspiration!</div>
      </div>
    `;
    return;
  }

  grid.innerHTML = filtered.map(idea => {
    const categoryColors = {
      tech: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      design: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      business: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      life: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      education: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
    };

    return `
      <div class="inspire-card" onclick="viewInspireIdea(${idea.id})">
        <div style="height:120px; display:flex; align-items:center; justify-content:center; background:${categoryColors[idea.category]}; font-size:3rem; color:white;">
          ${idea.icon}
        </div>
        <div style="padding:1rem;">
          <div style="display:inline-block; padding:0.25rem 0.6rem; background:${categoryColors[idea.category]}; color:white; font-size:0.7rem; font-weight:700; border-radius:8px; text-transform:uppercase; margin-bottom:0.6rem; letter-spacing:0.5px;">
            ${idea.category}
          </div>
          <h4 style="color:#2d3748; font-size:1.1rem; margin-bottom:0.5rem; font-weight:700; line-height:1.3;">
            ${idea.title}
          </h4>
          <p style="color:#718096; font-size:0.85rem; line-height:1.5; margin-bottom:0.8rem; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden;">
            ${idea.description}
          </p>
          <div style="display:flex; justify-content:space-between; align-items:center; padding-top:0.8rem; border-top:1px solid #e2e8f0; font-size:0.8rem; color:#a0aec0;">
            <span>${formatInspireDate(idea.date)}</span>
            <button onclick="likeInspireIdea(event, ${idea.id})" style="background:none; border:none; cursor:pointer; font-size:1.1rem; transition:all 0.2s; padding:0.2rem;" title="Like">
              ${idea.likes > 0 ? '❤️' : '🤍'} ${idea.likes}
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function formatInspireDate(dateStr) {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now - date;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  return date.toLocaleDateString();
}

function filterInspireIdeas() {
  renderInspireIdeas();
}

function openInspireCreate() {
  inspireEditingId = null;
  inspireCurrentIcon = '💡';
  document.getElementById('inspire-modal-title').textContent = 'Create New Idea';
  document.getElementById('inspire-form').reset();
  document.getElementById('inspire-icon').value = '💡';
  document.getElementById('inspire-edit-id').value = '';
  
  // Reset emoji selection
  document.querySelectorAll('.inspire-emoji').forEach(btn => {
    btn.classList.remove('selected');
  });
  document.querySelector('.inspire-emoji').classList.add('selected');
  
  document.getElementById('inspire-modal').style.display = 'flex';
}

function closeInspireModal() {
  document.getElementById('inspire-modal').style.display = 'none';
}

function selectInspireEmoji(emoji) {
  inspireCurrentIcon = emoji;
  document.getElementById('inspire-icon').value = emoji;
  
  // Update UI
  document.querySelectorAll('.inspire-emoji').forEach(btn => {
    btn.classList.remove('selected');
    if (btn.textContent === emoji) {
      btn.classList.add('selected');
    }
  });
}

function saveInspireIdea(e) {
  e.preventDefault();
  
  const title = document.getElementById('inspire-title').value;
  const category = document.getElementById('inspire-category').value;
  const description = document.getElementById('inspire-description').value;
  const editId = document.getElementById('inspire-edit-id').value;
  
  if (editId) {
    // Edit existing
    const idea = inspireIdeas.find(i => i.id == editId);
    if (idea) {
      idea.icon = inspireCurrentIcon;
      idea.title = title;
      idea.category = category;
      idea.description = description;
    }
    addNotification('Idea Updated', 'Your idea has been successfully updated', 'success', '✅');
  } else {
    // Create new
    const newIdea = {
      id: Date.now(),
      icon: inspireCurrentIcon,
      title,
      category,
      description,
      date: new Date().toISOString(),
      likes: 0
    };
    inspireIdeas.unshift(newIdea);
    addNotification('Idea Created', 'Your brilliant idea has been saved!', 'success', '✨');
  }
  
  saveInspireIdeas();
  renderInspireIdeas();
  closeInspireModal();
}

function viewInspireIdea(id) {
  const idea = inspireIdeas.find(i => i.id === id);
  if (!idea) return;
  
  const categoryColors = {
    tech: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    design: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    business: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    life: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    education: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
  };
  
  const modal = document.createElement('div');
  modal.id = 'inspire-detail-modal';
  modal.style.cssText = 'position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.8); z-index:3600; display:flex; align-items:center; justify-content:center; backdrop-filter:blur(5px); padding:1rem;';
  
  modal.innerHTML = `
    <div style="background:#fff; border-radius:20px; max-width:700px; width:100%; max-height:90vh; overflow-y:auto; box-shadow:0 25px 80px rgba(0,0,0,0.6);">
      <div style="padding:2rem; border-bottom:1px solid #e2e8f0;">
        <div style="height:200px; background:${categoryColors[idea.category]}; border-radius:12px; display:flex; align-items:center; justify-content:center; font-size:5rem; color:white; margin-bottom:1.5rem;">
          ${idea.icon}
        </div>
        <div style="display:inline-block; padding:0.4rem 0.8rem; background:${categoryColors[idea.category]}; color:white; font-size:0.75rem; font-weight:700; border-radius:8px; text-transform:uppercase; margin-bottom:1rem; letter-spacing:0.5px;">
          ${idea.category}
        </div>
        <h2 style="color:#2d3748; font-size:2rem; font-weight:700; margin-bottom:0.5rem; line-height:1.3;">
          ${idea.title}
        </h2>
        <p style="color:#a0aec0; font-size:0.9rem;">${formatInspireDate(idea.date)}</p>
      </div>
      <div style="padding:2rem;">
        <p style="color:#4a5568; font-size:1.05rem; line-height:1.8; margin-bottom:1.5rem;">
          ${idea.description}
        </p>
        <div style="display:flex; gap:1.5rem; padding:1.2rem; background:#f7fafc; border-radius:10px; margin-bottom:1.5rem;">
          <div style="display:flex; align-items:center; gap:0.5rem;">
            <span style="font-size:1.3rem;">${idea.likes > 0 ? '❤️' : '🤍'}</span>
            <span style="font-weight:700; color:#2d3748;">${idea.likes}</span>
            <span style="color:#718096; font-size:0.9rem;">likes</span>
          </div>
        </div>
        <div style="display:flex; gap:0.8rem; justify-content:flex-end;">
          <button onclick="deleteInspireIdea(${idea.id})" style="padding:0.7rem 1.2rem; background:linear-gradient(135deg, #ff6b6b, #ee5a6f); color:white; border:none; border-radius:8px; cursor:pointer; font-weight:600; box-shadow:0 4px 12px rgba(255,107,107,0.3);">
            🗑️ Delete
          </button>
          <button onclick="editInspireIdea(${idea.id})" style="padding:0.7rem 1.2rem; background:linear-gradient(135deg, #667eea 0%, #764ba2 100%); color:white; border:none; border-radius:8px; cursor:pointer; font-weight:600; box-shadow:0 4px 12px rgba(102,126,234,0.3);">
            ✏️ Edit
          </button>
          <button onclick="closeInspireDetailModal()" style="padding:0.7rem 1.2rem; background:rgba(0,0,0,0.05); border:1px solid #e2e8f0; border-radius:8px; cursor:pointer; font-weight:600;">
            Close
          </button>
        </div>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
}

function closeInspireDetailModal() {
  const modal = document.getElementById('inspire-detail-modal');
  if (modal) modal.remove();
}

function editInspireIdea(id) {
  const idea = inspireIdeas.find(i => i.id === id);
  if (!idea) return;
  
  closeInspireDetailModal();
  
  inspireEditingId = id;
  inspireCurrentIcon = idea.icon
  ;
  document.getElementById('inspire-modal-title').textContent = 'Edit Idea';
  document.getElementById('inspire-title').value = idea.title;
  document.getElementById('inspire-category').value = idea.category;
  document.getElementById('inspire-description').value = idea.description;
  document.getElementById('inspire-icon').value = idea.icon;
  document.getElementById('inspire-edit-id').value = id;
  
  // Update emoji selection
  document.querySelectorAll('.inspire-emoji').forEach(btn => {
    btn.classList.remove('selected');
    if (btn.textContent === idea.icon) {
      btn.classList.add('selected');
    }
  });
  
  document.getElementById('inspire-modal').style.display = 'flex';
}

function deleteInspireIdea(id) {
  if (!confirm('Are you sure you want to delete this idea? This action cannot be undone.')) {
    return;
  }
  
  inspireIdeas = inspireIdeas.filter(i => i.id !== id);
  saveInspireIdeas();
  renderInspireIdeas();
  closeInspireDetailModal();
  addNotification('Idea Deleted', 'Your idea has been removed', 'warning', '🗑️');
}

function likeInspireIdea(e, id) {
  e.stopPropagation();
  const idea = inspireIdeas.find(i => i.id === id);
  if (idea) {
    idea.likes = (idea.likes || 0) + 1;
    saveInspireIdeas();
    renderInspireIdeas();
  }
}

// Update taskbar map
windowTaskbarMap['inspireboard-win'] = { icon: '💡', label: 'InspireBoard' };

// Initialize when window opens
const originalOpenWindow = openWindow;
openWindow = function(id) {
  originalOpenWindow(id);
  if (id === 'inspireboard-win') {
    loadInspireIdeas();
  }
};

// Expose functions globally
window.openInspireCreate = openInspireCreate;
window.closeInspireModal = closeInspireModal;
window.selectInspireEmoji = selectInspireEmoji;
window.saveInspireIdea = saveInspireIdea;
window.filterInspireIdeas = filterInspireIdeas;
window.viewInspireIdea = viewInspireIdea;
window.editInspireIdea = editInspireIdea;
window.deleteInspireIdea = deleteInspireIdea;
window.likeInspireIdea = likeInspireIdea;
window.closeInspireDetailModal = closeInspireDetailModal;

// ===== INSPIREBOARD PROMO =====
function showInspirePromo() {
  const promo = document.getElementById('inspireboard-promo');
  
  // Check if user has dismissed before
  const dismissed = localStorage.getItem('inspireboard-promo-dismissed');
  const lastShown = localStorage.getItem('inspireboard-promo-last-shown');
  const now = Date.now();
  
  // Show if never dismissed, or if it's been more than 14 days since last shown
  if (!dismissed || (lastShown && (now - parseInt(lastShown)) > 14 * 24 * 60 * 60 * 1000)) {
    setTimeout(() => {
      promo.style.display = 'block';
      promo.classList.add('show');
      addNotification(
        'InspireBoard Available!',
        'Organize your ideas beautifully - try InspireBoard',
        'info',
        '💡'
      );
    }, 8000); // Show 8 seconds after OS loads (after app download modal)
  }
}

function closeInspirePromo() {
  const promo = document.getElementById('inspireboard-promo');
  promo.classList.remove('show');
  setTimeout(() => {
    promo.style.display = 'none';
  }, 300);
}

function dismissInspirePromo() {
  closeInspirePromo();
  
  // Remember dismissal but allow showing again after 14 days
  localStorage.setItem('inspireboard-promo-last-shown', Date.now().toString());
  
  addNotification(
    'Reminder Set',
    "We'll remind you about InspireBoard in 2 weeks",
    'info',
    '⏰'
  );
}

function launchInspireBoard() {
  closeInspirePromo();
  openWindow('inspireboard-win');
  
  // Mark as launched
  localStorage.setItem('inspireboard-promo-dismissed', 'true');
  
  addNotification(
    'Welcome to InspireBoard!',
    'Start capturing your brilliant ideas',
    'success',
    '✨'
  );
}

// Expose functions
window.closeInspirePromo = closeInspirePromo;
window.dismissInspirePromo = dismissInspirePromo;
window.launchInspireBoard = launchInspireBoard;