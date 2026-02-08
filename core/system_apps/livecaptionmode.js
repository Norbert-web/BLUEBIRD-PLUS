// ===== LIVE CAPTION MODE =====
let liveCaptionActive = false;
let captionRecognition = null;
let captionLanguage = 'en-US';
let captionHistory = [];

function initLiveCaptions() {
  // Check for Speech Recognition support
  if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
    console.warn('Speech Recognition not supported in this browser');
    return;
  }

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  captionRecognition = new SpeechRecognition();
  
  captionRecognition.continuous = true;
  captionRecognition.interimResults = true;
  captionRecognition.lang = captionLanguage;
  captionRecognition.maxAlternatives = 1;

  captionRecognition.onstart = () => {
    document.getElementById('caption-status-text').textContent = 'Listening...';
    addNotification('Live Captions Active', 'Audio will be transcribed in real-time', 'success', '🎤');
  };

  captionRecognition.onresult = (event) => {
    let interimTranscript = '';
    let finalTranscript = '';

    for (let i = event.resultIndex; i < event.results.length; i++) {
      const transcript = event.results[i][0].transcript;
      
      if (event.results[i].isFinal) {
        finalTranscript += transcript + ' ';
      } else {
        interimTranscript += transcript;
      }
    }

    const captionText = document.getElementById('caption-text');
    
    if (finalTranscript) {
      captionText.textContent = finalTranscript;
      captionText.classList.remove('interim');
      
      // Add to history
      captionHistory.push({
        text: finalTranscript.trim(),
        timestamp: new Date().toISOString(),
        language: captionLanguage
      });
      
      // Keep only last 50 captions
      if (captionHistory.length > 50) {
        captionHistory.shift();
      }
      
      // Save to localStorage
      localStorage.setItem('caption-history', JSON.stringify(captionHistory));
      
    } else if (interimTranscript) {
      captionText.textContent = interimTranscript;
      captionText.classList.add('interim');
    }

    // Auto-scroll if enabled
    if (document.getElementById('caption-autoscroll')?.checked) {
      captionText.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  };

  captionRecognition.onerror = (event) => {
    console.error('Caption error:', event.error);
    
    if (event.error === 'no-speech') {
      document.getElementById('caption-status-text').textContent = 'No audio detected';
      setTimeout(() => {
        if (liveCaptionActive) {
          document.getElementById('caption-status-text').textContent = 'Listening...';
        }
      }, 2000);
    } else if (event.error === 'not-allowed') {
      addNotification('Microphone Access Denied', 'Please allow microphone access for captions', 'error', '❌');
      toggleLiveCaptions();
    } else {
      document.getElementById('caption-status-text').textContent = 'Error: ' + event.error;
    }
  };

  captionRecognition.onend = () => {
    // Restart if still active
    if (liveCaptionActive) {
      try {
        captionRecognition.start();
      } catch(e) {
        console.error('Failed to restart caption recognition:', e);
      }
    }
  };

  // Load caption history
  try {
    const saved = localStorage.getItem('caption-history');
    if (saved) {
      captionHistory = JSON.parse(saved);
    }
  } catch(e) {
    console.error('Failed to load caption history:', e);
  }
}

async function toggleLiveCaptions() {
  const container = document.getElementById('live-caption-container');
  const toggleBtn = document.querySelector('[onclick*="toggleLiveCaptions"]');
  
  if (!liveCaptionActive) {
    // Request microphone permission
    const hasAccess = await requestPermission(
      'Live Captions',
      'microphone',
      'Live Captions needs microphone access to transcribe audio in real-time.'
    );

    if (!hasAccess) {
      addNotification('Permission Denied', 'Cannot enable live captions without microphone access', 'error', '❌');
      return;
    }

    // Start captions
    liveCaptionActive = true;
    container.classList.add('active');
    
    if (toggleBtn) {
      toggleBtn.closest('.taskbar-icon')?.classList.add('caption-toggle', 'active');
    }

    try {
      captionRecognition.start();
    } catch(e) {
      console.error('Failed to start caption recognition:', e);
      addNotification('Caption Error', 'Failed to start live captions', 'error', '❌');
      liveCaptionActive = false;
      container.classList.remove('active');
    }
  } else {
    // Stop captions
    liveCaptionActive = false;
    container.classList.remove('active');
    
    if (toggleBtn) {
      toggleBtn.closest('.taskbar-icon')?.classList.remove('caption-toggle', 'active');
    }

    try {
      captionRecognition.stop();
    } catch(e) {
      console.error('Failed to stop caption recognition:', e);
    }

    document.getElementById('caption-text').textContent = 'Speak or play audio to see captions appear here...';
    document.getElementById('caption-text').classList.remove('interim');
    
    addNotification('Live Captions Stopped', 'Transcription has ended', 'info', 'ℹ️');
  }
}

function toggleCaptionSettings() {
  const panel = document.getElementById('caption-settings');
  panel.classList.toggle('active');
}

function updateCaptionLanguage(lang) {
  captionLanguage = lang;
  
  if (captionRecognition) {
    captionRecognition.lang = lang;
  }

  // Update language display
  const langNames = {
    'en-US': 'English (United States)',
    'en-GB': 'English (United Kingdom)',
    'es-ES': 'Spanish (Spain)',
    'fr-FR': 'French',
    'de-DE': 'German',
    'it-IT': 'Italian',
    'pt-BR': 'Portuguese (Brazil)',
    'ru-RU': 'Russian',
    'zh-CN': 'Chinese (Simplified)',
    'ja-JP': 'Japanese',
    'ko-KR': 'Korean',
    'ar-SA': 'Arabic',
    'hi-IN': 'Hindi',
    'sw-KE': 'Swahili'
  };

  document.getElementById('caption-language').textContent = langNames[lang] || lang;
  
  // Restart recognition if active
  if (liveCaptionActive) {
    try {
      captionRecognition.stop();
      setTimeout(() => {
        captionRecognition.start();
      }, 100);
    } catch(e) {
      console.error('Failed to restart with new language:', e);
    }
  }

  localStorage.setItem('caption-language', lang);
  addNotification('Language Changed', `Captions now in ${langNames[lang]}`, 'success', '🌍');
}

function updateCaptionSize(size) {
  const captionText = document.getElementById('caption-text');
  captionText.style.fontSize = size + 'rem';
  localStorage.setItem('caption-text-size', size);
}

function exportCaptionHistory() {
  if (captionHistory.length === 0) {
    alert('No caption history to export');
    return;
  }

  const text = captionHistory.map(item => {
    const date = new Date(item.timestamp).toLocaleString();
    return `[${date}] ${item.text}`;
  }).join('\n\n');

  const blob = new Blob([text], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `captions-${Date.now()}.txt`;
  a.click();
  URL.revokeObjectURL(url);

  addNotification('Captions Exported', 'Caption history saved to file', 'success', '💾');
}

function clearCaptionHistory() {
  if (confirm('Clear all caption history?')) {
    captionHistory = [];
    localStorage.removeItem('caption-history');
    addNotification('History Cleared', 'All caption history has been deleted', 'success', '🗑️');
  }
}

// Initialize on load
setTimeout(() => {
  initLiveCaptions();
  
  // Load saved settings
  const savedLang = localStorage.getItem('caption-language');
  if (savedLang) {
    captionLanguage = savedLang;
    document.getElementById('caption-lang-select').value = savedLang;
    updateCaptionLanguage(savedLang);
  }

  const savedSize = localStorage.getItem('caption-text-size');
  if (savedSize) {
    document.getElementById('caption-size-select').value = savedSize;
    updateCaptionSize(savedSize);
  }
}, 2000);

// Expose functions
window.toggleLiveCaptions = toggleLiveCaptions;
window.toggleCaptionSettings = toggleCaptionSettings;
window.updateCaptionLanguage = updateCaptionLanguage;
window.updateCaptionSize = updateCaptionSize;
window.exportCaptionHistory = exportCaptionHistory;
window.clearCaptionHistory = clearCaptionHistory;