// ===== BACKGROUND ANIMATIONS SYSTEM =====
let bgAnimation = {
  active: false,
  type: 'none',
  intensity: 50,
  particles: [],
  animationFrame: null,
  canvas: null,
  ctx: null
};

function initBackgroundAnimation() {
  bgAnimation.canvas = document.getElementById('bg-animation-canvas');
  if (!bgAnimation.canvas) return;
  
  // For some animations we'll use canvas, for others we'll use DOM elements
  bgAnimation.ctx = bgAnimation.canvas.getContext('2d');
  resizeCanvas();
  
  window.addEventListener('resize', resizeCanvas);
  
  // Load saved animation settings
  const savedType = localStorage.getItem('bg-animation-type') || 'none';
  const savedIntensity = localStorage.getItem('bg-animation-intensity') || '50';
  
  bgAnimation.intensity = parseInt(savedIntensity);
  
  // Update UI
  const select = document.getElementById('bg-animation-select');
  const intensitySlider = document.getElementById('animation-intensity');
  const intensityValue = document.getElementById('intensity-value');
  
  if (select) select.value = savedType;
  if (intensitySlider) intensitySlider.value = savedIntensity;
  if (intensityValue) intensityValue.textContent = savedIntensity;
  
  if (savedType !== 'none') {
    setBackgroundAnimation(savedType, false);
  }
}

function resizeCanvas() {
  if (!bgAnimation.canvas) return;
  bgAnimation.canvas.width = window.innerWidth;
  bgAnimation.canvas.height = window.innerHeight;
}

function setBackgroundAnimation(type, save = true) {
  // Stop current animation
  stopBackgroundAnimation();
  
  bgAnimation.type = type;
  bgAnimation.active = type !== 'none';
  
  if (save) {
    localStorage.setItem('bg-animation-type', type);
  }
  
  if (type === 'none') {
    bgAnimation.canvas.classList.remove('active');
    return;
  }
  
  bgAnimation.canvas.classList.add('active');
  
  // Initialize particles based on type
  switch(type) {
    case 'snow':
      createSnowflakes();
      break;
    case 'bubbles':
      createBubbles();
      break;
    case 'stars':
      createStars();
      break;
    case 'rain':
      createRain();
      break;
    case 'hearts':
      createHearts();
      break;
    case 'confetti':
      createConfetti();
      break;
    case 'fireflies':
      createFireflies();
      break;
    case 'leaves':
      createLeaves();
      break;
    case 'matrix':
      createMatrixRain();
      break;
    case 'sakura':
      createSakura();
      break;
  }
}

function stopBackgroundAnimation() {
  bgAnimation.active = false;
  
  // Clear all DOM particles
  const particles = document.querySelectorAll('.particle');
  particles.forEach(p => p.remove());
  bgAnimation.particles = [];
  
  // Clear canvas
  if (bgAnimation.ctx) {
    bgAnimation.ctx.clearRect(0, 0, bgAnimation.canvas.width, bgAnimation.canvas.height);
  }
  
  if (bgAnimation.animationFrame) {
    cancelAnimationFrame(bgAnimation.animationFrame);
  }
}

function updateAnimationIntensity(value) {
  bgAnimation.intensity = parseInt(value);
  document.getElementById('intensity-value').textContent = value;
  localStorage.setItem('bg-animation-intensity', value);
  
  // Restart animation with new intensity
  if (bgAnimation.type !== 'none') {
    setBackgroundAnimation(bgAnimation.type, false);
  }
}

function getParticleCount() {
  // Scale particle count based on intensity (10-100)
  const base = {
    snow: 50,
    bubbles: 20,
    stars: 100,
    rain: 100,
    hearts: 15,
    confetti: 50,
    fireflies: 30,
    leaves: 25,
    matrix: 15,
    sakura: 30
  };
  
  const baseCount = base[bgAnimation.type] || 50;
  return Math.floor((baseCount * bgAnimation.intensity) / 50);
}

// ===== SNOWFLAKES =====
function createSnowflakes() {
  const count = getParticleCount();
  const container = document.getElementById('desktop');
  
  for (let i = 0; i < count; i++) {
    const snowflake = document.createElement('div');
    snowflake.className = 'particle snowflake';
    snowflake.textContent = ['❄', '❅', '❆'][Math.floor(Math.random() * 3)];
    snowflake.style.left = Math.random() * 100 + '%';
    snowflake.style.fontSize = (Math.random() * 1.5 + 0.5) + 'em';
    snowflake.style.animationDuration = (Math.random() * 10 + 10) + 's';
    snowflake.style.animationDelay = Math.random() * 10 + 's';
    container.appendChild(snowflake);
    bgAnimation.particles.push(snowflake);
  }
}

// ===== BUBBLES =====
function createBubbles() {
  const count = getParticleCount();
  const container = document.getElementById('desktop');
  
  for (let i = 0; i < count; i++) {
    const bubble = document.createElement('div');
    bubble.className = 'particle bubble';
    const size = Math.random() * 60 + 20;
    bubble.style.width = size + 'px';
    bubble.style.height = size + 'px';
    bubble.style.left = Math.random() * 100 + '%';
    bubble.style.setProperty('--drift-x', (Math.random() * 200 - 100) + 'px');
    bubble.style.animationDuration = (Math.random() * 8 + 8) + 's';
    bubble.style.animationDelay = Math.random() * 8 + 's';
    container.appendChild(bubble);
    bgAnimation.particles.push(bubble);
  }
}

// ===== STARS =====
function createStars() {
  const count = getParticleCount();
  const container = document.getElementById('desktop');
  
  for (let i = 0; i < count; i++) {
    const star = document.createElement('div');
    star.className = 'particle star';
    const size = Math.random() * 3 + 1;
    star.style.width = size + 'px';
    star.style.height = size + 'px';
    star.style.left = Math.random() * 100 + '%';
    star.style.top = Math.random() * 100 + '%';
    star.style.animationDuration = (Math.random() * 3 + 2) + 's';
    star.style.animationDelay = Math.random() * 3 + 's';
    container.appendChild(star);
    bgAnimation.particles.push(star);
  }
}

// ===== RAIN =====
function createRain() {
  const count = getParticleCount();
  const container = document.getElementById('desktop');
  
  for (let i = 0; i < count; i++) {
    const drop = document.createElement('div');
    drop.className = 'particle raindrop';
    drop.style.left = Math.random() * 100 + '%';
    drop.style.height = (Math.random() * 30 + 20) + 'px';
    drop.style.animationDuration = (Math.random() * 1 + 0.5) + 's';
    drop.style.animationDelay = Math.random() * 2 + 's';
    container.appendChild(drop);
    bgAnimation.particles.push(drop);
  }
}

// ===== HEARTS =====
function createHearts() {
  const count = getParticleCount();
  const container = document.getElementById('desktop');
  
  for (let i = 0; i < count; i++) {
    const heart = document.createElement('div');
    heart.className = 'particle heart';
    heart.textContent = ['❤', '💕', '💖', '💗'][Math.floor(Math.random() * 4)];
    heart.style.left = Math.random() * 100 + '%';
    heart.style.animationDuration = (Math.random() * 6 + 6) + 's';
    heart.style.animationDelay = Math.random() * 6 + 's';
    container.appendChild(heart);
    bgAnimation.particles.push(heart);
  }
}

// ===== CONFETTI =====
function createConfetti() {
  const count = getParticleCount();
  const container = document.getElementById('desktop');
  const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f7b731', '#5f27cd', '#00d2d3', '#ff9ff3'];
  
  for (let i = 0; i < count; i++) {
    const piece = document.createElement('div');
    piece.className = 'particle confetti';
    piece.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    piece.style.left = Math.random() * 100 + '%';
    piece.style.animationDuration = (Math.random() * 3 + 2) + 's';
    piece.style.animationDelay = Math.random() * 3 + 's';
    container.appendChild(piece);
    bgAnimation.particles.push(piece);
  }
}

// ===== FIREFLIES =====
function createFireflies() {
  const count = getParticleCount();
  const container = document.getElementById('desktop');
  
  for (let i = 0; i < count; i++) {
    const firefly = document.createElement('div');
    firefly.className = 'particle firefly';
    firefly.style.left = Math.random() * 100 + '%';
    firefly.style.top = Math.random() * 80 + 10 + '%';
    firefly.style.setProperty('--fly-x1', (Math.random() * 60 - 30) + 'px');
    firefly.style.setProperty('--fly-y1', (Math.random() * 60 - 30) + 'px');
    firefly.style.setProperty('--fly-x2', (Math.random() * 60 - 30) + 'px');
    firefly.style.setProperty('--fly-y2', (Math.random() * 60 - 30) + 'px');
    firefly.style.setProperty('--fly-x3', (Math.random() * 60 - 30) + 'px');
    firefly.style.setProperty('--fly-y3', (Math.random() * 60 - 30) + 'px');
    firefly.style.animationDuration = (Math.random() * 4 + 4) + 's';
    firefly.style.animationDelay = Math.random() * 4 + 's';
    container.appendChild(firefly);
    bgAnimation.particles.push(firefly);
  }
}

// ===== LEAVES =====
function createLeaves() {
  const count = getParticleCount();
  const container = document.getElementById('desktop');
  const leafTypes = ['🍂', '🍁', '🍃'];
  
  for (let i = 0; i < count; i++) {
    const leaf = document.createElement('div');
    leaf.className = 'particle leaf';
    leaf.textContent = leafTypes[Math.floor(Math.random() * leafTypes.length)];
    leaf.style.left = Math.random() * 100 + '%';
    leaf.style.setProperty('--sway', (Math.random() * 100 - 50) + 'px');
    leaf.style.animationDuration = (Math.random() * 8 + 8) + 's';
    leaf.style.animationDelay = Math.random() * 8 + 's';
    container.appendChild(leaf);
    bgAnimation.particles.push(leaf);
  }
}

// ===== MATRIX RAIN =====
function createMatrixRain() {
  const count = getParticleCount();
  const container = document.getElementById('desktop');
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%^&*()_+-=[]{}|;:,.<>?/~`';
  
  for (let i = 0; i < count; i++) {
    const column = document.createElement('div');
    column.className = 'particle matrix-char';
    column.textContent = chars[Math.floor(Math.random() * chars.length)];
    column.style.left = Math.random() * 100 + '%';
    column.style.fontSize = (Math.random() * 0.5 + 0.8) + 'em';
    column.style.animationDuration = (Math.random() * 3 + 2) + 's';
    column.style.animationDelay = Math.random() * 3 + 's';
    container.appendChild(column);
    bgAnimation.particles.push(column);
    
    // Change character randomly
    setInterval(() => {
      if (column.isConnected) {
        column.textContent = chars[Math.floor(Math.random() * chars.length)];
      }
    }, 500);
  }
}

// ===== SAKURA (CHERRY BLOSSOMS) =====
function createSakura() {
  const count = getParticleCount();
  const container = document.getElementById('desktop');
  
  for (let i = 0; i < count; i++) {
    const petal = document.createElement('div');
    petal.className = 'particle sakura';
    petal.textContent = '🌸';
    petal.style.left = Math.random() * 100 + '%';
    petal.style.setProperty('--drift', (Math.random() * 80 - 40) + 'px');
    petal.style.animationDuration = (Math.random() * 10 + 10) + 's';
    petal.style.animationDelay = Math.random() * 10 + 's';
    container.appendChild(petal);
    bgAnimation.particles.push(petal);
  }
}

// Expose functions globally
window.setBackgroundAnimation = setBackgroundAnimation;
window.updateAnimationIntensity = updateAnimationIntensity;

// Initialize on load
setTimeout(() => {
  initBackgroundAnimation();
}, 1500);
