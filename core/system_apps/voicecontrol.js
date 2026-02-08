// ===== VOICE COMMANDS SYSTEM =====
let voiceCommandsActive = false;
let voiceCommandRecognition = null;
let voiceCommandTimeout = null;

function initVoiceCommands() {
  if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
    console.warn('Voice commands not supported');
    return;
  }

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  voiceCommandRecognition = new SpeechRecognition();
  
  voiceCommandRecognition.continuous = true;
  voiceCommandRecognition.interimResults = false;
  voiceCommandRecognition.lang = 'en-US';

  voiceCommandRecognition.onstart = () => {
    addNotification('Voice Commands Active', 'Say "Hey Bluebird" to give commands', 'success', '🎤');
  };

  voiceCommandRecognition.onresult = (event) => {
    const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase();
    console.log('Voice command heard:', transcript);
    
    // Wake word detection
    if (transcript.includes('hey bluebird') || transcript.includes('hey blue bird')) {
      playSound('activate');
      showVoiceCommandIndicator();
      processVoiceCommand(transcript);
    }
  };

  voiceCommandRecognition.onerror = (event) => {
    console.error('Voice command error:', event.error);
    if (event.error === 'no-speech') {
      // Ignore no-speech errors
      return;
    }
  };

  voiceCommandRecognition.onend = () => {
    // Restart if still active
    if (voiceCommandsActive) {
      try {
        voiceCommandRecognition.start();
      } catch(e) {
        console.error('Failed to restart voice commands:', e);
      }
    }
  };
}

async function toggleVoiceCommands() {
  if (!voiceCommandRecognition) {
    initVoiceCommands();
  }

  if (!voiceCommandsActive) {
    const hasAccess = await requestPermission(
      'Voice Commands',
      'microphone',
      'Voice commands need microphone access to listen for "Hey Bluebird".'
    );

    if (!hasAccess) {
      addNotification('Permission Denied', 'Cannot enable voice commands', 'error', '❌');
      return;
    }

    voiceCommandsActive = true;
    try {
      voiceCommandRecognition.start();
      updateVoiceCommandUI(true);
    } catch(e) {
      console.error('Failed to start voice commands:', e);
      voiceCommandsActive = false;
    }
  } else {
    voiceCommandsActive = false;
    try {
      voiceCommandRecognition.stop();
    } catch(e) {}
    updateVoiceCommandUI(false);
    addNotification('Voice Commands Off', 'Voice control disabled', 'info', 'ℹ️');
  }
}

function updateVoiceCommandUI(active) {
  const indicator = document.getElementById('voice-command-indicator');
  if (indicator) {
    indicator.style.display = active ? 'flex' : 'none';
  }
}

function showVoiceCommandIndicator() {
  const indicator = document.createElement('div');
  indicator.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: linear-gradient(135deg, rgba(74,222,128,0.95), rgba(34,197,94,0.95));
    color: #000;
    padding: 2rem 3rem;
    border-radius: 20px;
    font-size: 1.5rem;
    font-weight: 700;
    z-index: 9999;
    box-shadow: 0 20px 60px rgba(74,222,128,0.5);
    animation: voiceIndicator 2s ease-out forwards;
  `;
  indicator.innerHTML = '🎤 Listening...';
  document.body.appendChild(indicator);

  setTimeout(() => indicator.remove(), 2000);
}

function processVoiceCommand(transcript) {
  const lower = transcript.toLowerCase();

  // Remove wake word
  const command = lower.replace(/hey bluebird|hey blue bird/gi, '').trim();

  // System commands
  if (command.includes('open') && command.includes('app launcher')) {
    openAppField();
    speak('Opening app launcher');
  } else if (command.includes('open')) {
    const appName = command.replace('open', '').trim();
    const apps = {
      'resume': 'resume-win',
      'projects': 'projects-win',
      'connect': 'connect-win',
      'settings': 'settings-win',
      'inspire board': 'inspireboard-win',
      'terminal': 'birdshell-win',
      'shell': 'birdshell-win',
      'claude': 'claude-win',
      'assistant': 'claude-win'
    };

    for (const [key, winId] of Object.entries(apps)) {
      if (appName.includes(key)) {
        if (key === 'terminal' || key === 'shell') {
          openBirdShell();
        } else {
          openWindow(winId);
        }
        speak(`Opening ${key}`);
        return;
      }
    }
    speak('App not found');
  } else if (command.includes('close all')) {
    Object.keys(windows).forEach(winId => closeWindow(winId));
    speak('Closing all windows');
  } else if (command.includes('dark mode') || command.includes('dark theme')) {
    if (!document.body.classList.contains('dark-theme')) {
      toggleTheme();
    }
    speak('Dark mode activated');
  } else if (command.includes('light mode') || command.includes('light theme')) {
    if (document.body.classList.contains('dark-theme')) {
      toggleTheme();
    }
    speak('Light mode activated');
  } else if (command.includes('change wallpaper') || command.includes('next wallpaper')) {
    cycleWallpaper();
    speak('Wallpaper changed');
  } else if (command.includes('lock screen')) {
    lockScreen();
    speak('Locking screen');
  } else if (command.includes('what time')) {
    const time = new Date().toLocaleTimeString();
    speak(`It's ${time}`);
  } else if (command.includes('gesture control') || command.includes('gesture mode')) {
    startGestureMode();
    speak('Starting gesture control');
  } else if (command.includes('take screenshot')) {
    captureAndAnalyzeScreen();
    speak('Taking screenshot');
  } else if (command.includes('show notifications')) {
    toggleNotificationCenter();
    speak('Showing notifications');
  } else if (command.includes('help') || command.includes('what can you do')) {
    speak('You can say: open apps, close all, change theme, lock screen, gesture control, take screenshot, and more');
  } else {
    speak('Command not recognized. Say hey bluebird help for options');
  }
}

function speak(text) {
  if ('speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.1;
    utterance.pitch = 1.0;
    utterance.volume = 0.8;
    speechSynthesis.speak(utterance);
  }
}

function playSound(type) {
  // Create simple beep sounds
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  if (type === 'activate') {
    oscillator.frequency.value = 800;
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
  }

  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + 0.3);
}

// Add voice command indicator to taskbar
function createVoiceCommandIndicator() {
  const indicator = document.createElement('div');
  indicator.id = 'voice-command-indicator';
  indicator.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: linear-gradient(135deg, rgba(74,222,128,0.9), rgba(34,197,94,0.9));
    color: #000;
    padding: 0.8rem 1.2rem;
    border-radius: 25px;
    font-weight: 700;
    font-size: 0.9rem;
    z-index: 2000;
    display: none;
    align-items: center;
    gap: 0.5rem;
    box-shadow: 0 8px 25px rgba(74,222,128,0.4);
    animation: float 3s ease-in-out infinite;
  `;
  indicator.innerHTML = `
    <div style="width:10px; height:10px; background:#000; border-radius:50%; animation: pulse 1.5s ease-in-out infinite;"></div>
    <span>Voice Commands Active</span>
  `;
  document.body.appendChild(indicator);
}

// Initialize on load
setTimeout(() => {
  initVoiceCommands();
  createVoiceCommandIndicator();
}, 2000);

window.toggleVoiceCommands = toggleVoiceCommands;