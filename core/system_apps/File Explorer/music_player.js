// ==================== MUSIC PLAYER ====================

let playlist = [];
let currentTrackIndex = -1;
let isPlaying = false;
let isShuffle = false;
let repeatMode = 'off'; // 'off', 'all', 'one'
let audioElement = null;

function initializeMusicPlayer() {
  audioElement = document.getElementById('music-audio');
  
  // Audio event listeners
  audioElement.addEventListener('timeupdate', updateMusicProgress);
  audioElement.addEventListener('ended', onTrackEnded);
  audioElement.addEventListener('loadedmetadata', onTrackLoaded);
  
  // Load saved playlist
  loadPlaylistFromStorage();
}

function addToPlaylist(path, file) {
  // Check if already in playlist
  const exists = playlist.find(track => track.path === path);
  if (exists) {
    // Play this track
    const index = playlist.indexOf(exists);
    playTrack(index);
    return;
  }
  
  // Add to playlist
  const track = {
    path,
    name: file.name,
    duration: 0,
    dataUrl: file.dataUrl
  };
  
  playlist.push(track);
  renderPlaylist();
  savePlaylistToStorage();
  
  // If this is the first track, play it
  if (playlist.length === 1) {
    playTrack(0);
  }
}

function renderPlaylist() {
  const container = document.getElementById('playlist-items');
  
  if (playlist.length === 0) {
    container.innerHTML = `
      <div class="playlist-empty">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M9 18V5l12-2v13"></path>
          <circle cx="6" cy="18" r="3"></circle>
          <circle cx="18" cy="16" r="3"></circle>
        </svg>
        <p>No songs in playlist</p>
        <p class="playlist-hint">Open File Explorer and double-click on music files</p>
      </div>
    `;
    return;
  }
  
  let html = '';
  playlist.forEach((track, index) => {
    const isActive = index === currentTrackIndex;
    const duration = formatTime(track.duration);html += `
      <div class="playlist-item ${isActive ? 'active' : ''}" onclick="playTrack(${index})">
        <div class="playlist-item-number">${index + 1}</div>
        <div class="playlist-item-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 18V5l12-2v13"></path>
            <circle cx="6" cy="18" r="3"></circle>
            <circle cx="18" cy="16" r="3"></circle>
          </svg>
        </div>
        <div class="playlist-item-info">
          <div class="playlist-item-title">${track.name}</div>
          <div class="playlist-item-duration">${duration || '--:--'}</div>
        </div>
      </div>
    `;
  });
  
  container.innerHTML = html;
}

function playTrack(index) {
  if (index < 0 || index >= playlist.length) return;
  
  currentTrackIndex = index;
  const track = playlist[index];
  
  // Update UI
  document.getElementById('music-title').textContent = track.name.replace(/\.[^/.]+$/, '');
  document.getElementById('music-artist').textContent = 'Unknown Artist';
  
  // Load and play audio
  if (track.dataUrl) {
    audioElement.src = track.dataUrl;
    audioElement.play().then(() => {
      isPlaying = true;
      updatePlayPauseButton();
      startVisualizer();
      document.querySelector('.album-art').classList.add('spinning');
    }).catch(error => {
      console.error('Error playing audio:', error);
    });
  }
  
  renderPlaylist();
}

function togglePlayPause() {
  if (!audioElement.src) {
    // No track loaded, play first track if available
    if (playlist.length > 0) {
      playTrack(0);
    }
    return;
  }
  
  if (isPlaying) {
    audioElement.pause();
    isPlaying = false;
    stopVisualizer();
    document.querySelector('.album-art').classList.remove('spinning');
  } else {
    audioElement.play().then(() => {
      isPlaying = true;
      startVisualizer();
      document.querySelector('.album-art').classList.add('spinning');
    }).catch(error => {
      console.error('Error playing audio:', error);
    });
  }
  
  updatePlayPauseButton();
}

function updatePlayPauseButton() {
  const playIcon = document.getElementById('play-icon');
  const pauseIcon = document.getElementById('pause-icon');
  
  if (isPlaying) {
    playIcon.style.display = 'none';
    pauseIcon.style.display = 'block';
  } else {
    playIcon.style.display = 'block';
    pauseIcon.style.display = 'none';
  }
}

function previousTrack() {
  if (currentTrackIndex > 0) {
    playTrack(currentTrackIndex - 1);
  } else if (repeatMode === 'all') {
    playTrack(playlist.length - 1);
  }
}

function nextTrack() {
  if (isShuffle) {
    const randomIndex = Math.floor(Math.random() * playlist.length);
    playTrack(randomIndex);
  } else if (currentTrackIndex < playlist.length - 1) {
    playTrack(currentTrackIndex + 1);
  } else if (repeatMode === 'all') {
    playTrack(0);
  }
}

function toggleShuffle() {
  isShuffle = !isShuffle;
  const btn = document.getElementById('shuffle-btn');
  
  if (isShuffle) {
    btn.classList.add('active');
  } else {
    btn.classList.remove('active');
  }
  
  if (window.playSound) playSound();
}

function toggleRepeat() {
  const modes = ['off', 'all', 'one'];
  const currentIndex = modes.indexOf(repeatMode);
  repeatMode = modes[(currentIndex + 1) % modes.length];
  
  const btn = document.getElementById('repeat-btn');
  
  if (repeatMode === 'off') {
    btn.classList.remove('active');
    btn.title = 'Repeat';
  } else if (repeatMode === 'all') {
    btn.classList.add('active');
    btn.title = 'Repeat All';
  } else {
    btn.classList.add('active');
    btn.title = 'Repeat One';
  }
  
  if (window.playSound) playSound();
}

function onTrackEnded() {
  if (repeatMode === 'one') {
    audioElement.currentTime = 0;
    audioElement.play();
  } else {
    nextTrack();
  }
}

function onTrackLoaded() {
  const track = playlist[currentTrackIndex];
  if (track) {
    track.duration = audioElement.duration;
    renderPlaylist();
  }
  
  document.getElementById('total-time').textContent = formatTime(audioElement.duration);
}

function updateMusicProgress() {
  if (!audioElement.duration) return;
  
  const progress = (audioElement.currentTime / audioElement.duration) * 100;
  document.getElementById('music-progress').style.width = progress + '%';
  document.getElementById('current-time').textContent = formatTime(audioElement.currentTime);
}

function seekMusic(event) {
  if (!audioElement.duration) return;
  
  const bar = event.currentTarget;
  const rect = bar.getBoundingClientRect();
  const percent = (event.clientX - rect.left) / rect.width;
  audioElement.currentTime = percent * audioElement.duration;
}

function setVolume(value) {
  audioElement.volume = value / 100;
  updateVolumeIcon(value);
}

function toggleMute() {
  if (audioElement.volume > 0) {
    audioElement.dataset.previousVolume = audioElement.volume;
    audioElement.volume = 0;
    document.getElementById('volume-slider').value = 0;
    updateVolumeIcon(0);
  } else {
    const previousVolume = parseFloat(audioElement.dataset.previousVolume) || 0.7;
    audioElement.volume = previousVolume;
    document.getElementById('volume-slider').value = previousVolume * 100;
    updateVolumeIcon(previousVolume * 100);
  }
}

function updateVolumeIcon(value) {
  const icon = document.getElementById('volume-icon');
  
  if (value === 0) {
    icon.innerHTML = `
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
      <line x1="23" y1="9" x2="17" y2="15"></line>
      <line x1="17" y1="9" x2="23" y2="15"></line>
    `;
  } else if (value < 50) {
    icon.innerHTML = `
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
    `;
  } else {
    icon.innerHTML = `
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
    `;
  }
}

function clearPlaylist() {
  if (!confirm('Clear all songs from playlist?')) return;
  
  audioElement.pause();
  audioElement.src = '';
  playlist = [];
  currentTrackIndex = -1;
  isPlaying = false;
  
  renderPlaylist();
  updatePlayPauseButton();
  stopVisualizer();
  
  document.getElementById('music-title').textContent = 'No track selected';
  document.getElementById('music-artist').textContent = 'Select a song to play';
  document.getElementById('current-time').textContent = '0:00';
  document.getElementById('total-time').textContent = '0:00';
  document.getElementById('music-progress').style.width = '0%';
  document.querySelector('.album-art').classList.remove('spinning');
  
  savePlaylistToStorage();
}

function formatTime(seconds) {
  if (isNaN(seconds) || !isFinite(seconds)) return '0:00';
  
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Visualizer
let visualizerInterval = null;

function startVisualizer() {
  const visualizer = document.getElementById('music-visualizer');
  visualizer.classList.remove('paused');
}

function stopVisualizer() {
  const visualizer = document.getElementById('music-visualizer');
  visualizer.classList.add('paused');
}

// Save/Load playlist
function savePlaylistToStorage() {
  try {
    localStorage.setItem('musicPlaylist', JSON.stringify(playlist));
  } catch (e) {
    console.error('Failed to save playlist:', e);
  }
}

function loadPlaylistFromStorage() {
  try {
    const saved = localStorage.getItem('musicPlaylist');
    if (saved) {
      playlist = JSON.parse(saved);
      renderPlaylist();
    }
  } catch (e) {
    console.error('Failed to load playlist:', e);
  }
}

// Initialize music player
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    initializeMusicPlayer();
  }, 500);
});
