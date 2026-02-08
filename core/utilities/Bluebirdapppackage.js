// ===== BAAP (Bluebird App Package) SYSTEM - FIXED BUG; app not rendered properly,weird system codes so I willfix it probably soon =====

// Install BAAP file
async function installBAAP(file) {
  try {
    // BAAP is a ZIP file with specific structure
    const JSZip = window.JSZip;
    if (!JSZip) {
      alert('ZIP library not loaded. Please reload the page.');
      return;
    }

    const zip = await JSZip.loadAsync(file);
    
    // Check for manifest.json
    const manifestFile = zip.file('manifest.json');
    if (!manifestFile) {
      alert('Invalid BAAP: missing manifest.json');
      return;
    }

    const manifestText = await manifestFile.async('text');
    const manifest = JSON.parse(manifestText);

    // Check for index.html
    const indexFile = zip.file('index.html');
    if (!indexFile) {
      alert('Invalid BAAP: missing index.html');
      return;
    }

    let indexHTML = await indexFile.async('text');

    // Process all files and convert to data URLs
    const files = {};
    for (const [path, zipEntry] of Object.entries(zip.files)) {
      if (zipEntry.dir) continue;
      if (path === 'manifest.json' || path === 'index.html') continue;
      
      const content = await zipEntry.async('base64');
      const mimeType = getMimeType(path);
      files[path] = `data:${mimeType};base64,${content}`;
    }

    // Replace file references in HTML with data URLs
    // Use more specific replacement to avoid replacing random text
    for (const [path, dataUrl] of Object.entries(files)) {
      // Replace in common HTML attributes
      const quotedPath = path.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // Escape regex chars
      
      // Replace href="path", src="path", href='path', src='path'
      indexHTML = indexHTML.replace(
        new RegExp(`(href|src)=["'](\\.?\\/)?${quotedPath}["']`, 'gi'),
        `$1="${dataUrl}"`
      );
    }

    // Embed manifest into HTML (replacing existing one if present)
    const manifestScript = `<script type="application/json" id="bluebird-app-manifest">${JSON.stringify(manifest)}</script>`;
    
    // Remove existing manifest if present
    indexHTML = indexHTML.replace(/<script[^>]*id=["']bluebird-app-manifest["'][^>]*>[\s\S]*?<\/script>/gi, '');
    
    // Add new manifest
    if (indexHTML.includes('</head>')) {
      indexHTML = indexHTML.replace('</head>', manifestScript + '\n</head>');
    } else {
      // If no head tag, add it
      indexHTML = manifestScript + '\n' + indexHTML;
    }

    // Show preview
    showAppPreview(manifest, indexHTML);

  } catch(e) {
    console.error('BAAP installation error:', e);
    alert('Failed to install BAAP: ' + e.message);
  }
}

function getMimeType(filename) {
  const ext = filename.split('.').pop().toLowerCase();
  const mimeTypes = {
    'html': 'text/html',
    'css': 'text/css',
    'js': 'application/javascript',
    'json': 'application/json',
    'png': 'image/png',
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'gif': 'image/gif',
    'svg': 'image/svg+xml',
    'ico': 'image/x-icon',
    'woff': 'font/woff',
    'woff2': 'font/woff2',
    'ttf': 'font/ttf',
    'mp3': 'audio/mpeg',
    'wav': 'audio/wav',
    'mp4': 'video/mp4',
    'webm': 'video/webm'
  };
  return mimeTypes[ext] || 'application/octet-stream';
}

// Update installApp function to support BAAP
const originalInstallApp = window.installApp;
window.installApp = function() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.html,.baap,.zip';
  input.onchange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Check if it's a BAAP file
    if (file.name.endsWith('.baap') || file.name.endsWith('.zip')) {
      await installBAAP(file);
    } else {
      // Original HTML file installation
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
        } catch(err) {
          console.error(err);
          alert('Failed to load app.');
        }
      };
      reader.readAsText(file);
    }
  };
  input.click();
};

// Expose function
window.installBAAP = installBAAP;