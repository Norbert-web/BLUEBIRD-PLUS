// ==================== FILE PREVIEW ====================

let currentPreviewFile = null;

function openFilePreview(path) {
  const file = fileSystem[path];
  if (!file) return;
  
  currentPreviewFile = { path, file };
  
  const modal = document.getElementById('file-preview-modal');
  const title = document.getElementById('preview-file-name');
  const body = document.getElementById('preview-body');
  
  title.textContent = file.name;
  
  const ext = getFileExtension(file.name).toLowerCase();
  
  // Clear previous content
  body.innerHTML = '';
  
  // Image preview
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext)) {
    if (file.dataUrl) {
      body.innerHTML = `<img src="${file.dataUrl}" alt="${file.name}">`;
    } else {
      body.innerHTML = '<p style="color: rgba(255,255,255,0.5);">Image preview not available</p>';
    }
  }
  // Video preview
  else if (['mp4', 'webm', 'ogg', 'mov'].includes(ext)) {
    if (file.dataUrl) {
      body.innerHTML = `<video controls src="${file.dataUrl}"></video>`;
    } else {
      body.innerHTML = '<p style="color: rgba(255,255,255,0.5);">Video preview not available</p>';
    }
  }
  // Audio preview
  else if (['mp3', 'wav', 'ogg', 'flac', 'm4a'].includes(ext)) {
    if (file.dataUrl) {
      body.innerHTML = `
        <div style="text-align: center;">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 120px; height: 120px; margin-bottom: 20px; color: var(--accent);">
            <path d="M9 18V5l12-2v13"></path>
            <circle cx="6" cy="18" r="3"></circle>
            <circle cx="18" cy="16" r="3"></circle>
          </svg>
          <audio controls src="${file.dataUrl}" style="width: 100%; max-width: 500px;"></audio>
        </div>
      `;
    } else {
      body.innerHTML = '<p style="color: rgba(255,255,255,0.5);">Audio preview not available</p>';
    }
  }
  // PDF preview
  else if (ext === 'pdf') {
    if (file.dataUrl) {
      body.innerHTML = `<iframe src="${file.dataUrl}"></iframe>`;
    } else {
      body.innerHTML = '<p style="color: rgba(255,255,255,0.5);">PDF preview not available</p>';
    }
  }
  // Text files
  else if (['txt', 'md', 'json', 'html', 'css', 'js', 'py'].includes(ext)) {
    if (file.content) {
      body.innerHTML = `<div class="preview-text-content">${escapeHtml(file.content)}</div>`;
    } else if (file.dataUrl && file.dataUrl.startsWith('data:text')) {
      // Try to decode text from data URL
      try {
        const base64 = file.dataUrl.split(',')[1];
        const text = atob(base64);
        body.innerHTML = `<div class="preview-text-content">${escapeHtml(text)}</div>`;
      } catch (e) {
        body.innerHTML = '<p style="color: rgba(255,255,255,0.5);">Text preview not available</p>';
      }
    } else {
      body.innerHTML = '<p style="color: rgba(255,255,255,0.5);">Text preview not available</p>';
    }
  }
  // Unknown file type
  else {
    body.innerHTML = `
      <div style="text-align: center; color: rgba(255,255,255,0.5);">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 80px; height: 80px; margin-bottom: 20px; opacity: 0.3;">
          <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
          <polyline points="13 2 13 9 20 9"></polyline>
        </svg>
        <p>Preview not available for this file type</p>
        <p style="font-size: 12px; margin-top: 10px;">File type: .${ext}</p>
      </div>
    `;
  }
  
  modal.style.display = 'flex';
}

function closeFilePreview() {
  document.getElementById('file-preview-modal').style.display = 'none';
  currentPreviewFile = null;
}

function downloadPreviewFile() {
  if (currentPreviewFile) {
    downloadFile(currentPreviewFile.path);
  }
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

