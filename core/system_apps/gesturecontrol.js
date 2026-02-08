// ===== GESTURE CONTROL SYSTEM =====
let gestureMode = false;
let gestureStream = null;
let gestureDetector = null;
let handTracker = null;

async function startGestureMode() {
  const hasAccess = await requestPermission(
    'Gesture Control',
    'camera',
    'Gesture control needs camera access to track your hand movements.'
  );

  if (!hasAccess) {
    addNotification('Permission Denied', 'Cannot start gesture mode without camera access', 'error', '❌');
    return;
  }

  document.getElementById('gesture-mode').classList.add('active');
  gestureMode = true;

  try {
    // Request camera
    gestureStream = await navigator.mediaDevices.getUserMedia({
      video: { width: 640, height: 480, facingMode: 'user' }
    });

    const video = document.getElementById('gesture-video');
    video.srcObject = gestureStream;

    // Load MediaPipe Hands
    await loadHandTracking();
    
    addNotification('Gesture Mode Active', 'Use your hands to control the OS!', 'success', '👋');

  } catch(e) {
    console.error('Gesture mode error:', e);
    addNotification('Camera Error', 'Failed to start gesture control', 'error', '❌');
    exitGestureMode();
  }
}

async function loadHandTracking() {
  // Load MediaPipe Hands library
  const script = document.createElement('script');
  script.src = 'https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js';
  
  script.onload = async () => {
    const script2 = document.createElement('script');
    script2.src = 'https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js';
    
    script2.onload = () => {
      initializeHandTracking();
    };
    
    document.head.appendChild(script2);
  };
  
  document.head.appendChild(script);
}

function initializeHandTracking() {
  const video = document.getElementById('gesture-video');
  const canvas = document.getElementById('gesture-canvas');
  const ctx = canvas.getContext('2d');

  // Initialize MediaPipe Hands
  const hands = new Hands({
    locateFile: (file) => {
      return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
    }
  });

  hands.setOptions({
    maxNumHands: 1,
    modelComplexity: 1,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5
  });

  hands.onResults(onHandsResults);

  const camera = new Camera(video, {
    onFrame: async () => {
      await hands.send({ image: video });
    },
    width: 640,
    height: 480
  });

  camera.start();
  handTracker = { hands, camera };
}

let lastGesture = null;
let gestureCooldown = false;

function onHandsResults(results) {
  const canvas = document.getElementById('gesture-canvas');
  const ctx = canvas.getContext('2d');
  const workspace = document.getElementById('gesture-workspace');
  const cursor = document.getElementById('gesture-cursor');

  canvas.width = results.image.width;
  canvas.height = results.image.height;

  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
    const landmarks = results.multiHandLandmarks[0];
    
    // Draw hand landmarks
    drawHand(ctx, landmarks);

    // Get index finger tip position (landmark 8)
    const indexTip = landmarks[8];
    const thumb = landmarks[4];
    const middle = landmarks[12];

    // Map to workspace coordinates
    const workspaceRect = workspace.getBoundingClientRect();
    const cursorX = workspaceRect.left + (1 - indexTip.x) * workspaceRect.width; // Mirror X
    const cursorY = workspaceRect.top + indexTip.y * workspaceRect.height;

    // Move cursor
    cursor.style.left = cursorX + 'px';
    cursor.style.top = cursorY + 'px';

    // Detect gesture
    const gesture = detectGesture(landmarks);
    
    if (gesture && !gestureCooldown) {
      handleGesture(gesture, cursorX - workspaceRect.left, cursorY - workspaceRect.top);
      gestureCooldown = true;
      setTimeout(() => { gestureCooldown = false; }, 500);
    }

    lastGesture = gesture;
  }
}

function drawHand(ctx, landmarks) {
  // Draw connections
  const connections = [
    [0,1],[1,2],[2,3],[3,4], // Thumb
    [0,5],[5,6],[6,7],[7,8], // Index
    [0,9],[9,10],[10,11],[11,12], // Middle
    [0,13],[13,14],[14,15],[15,16], // Ring
    [0,17],[17,18],[18,19],[19,20], // Pinky
    [5,9],[9,13],[13,17] // Palm
  ];

  ctx.strokeStyle = '#4ade80';
  ctx.lineWidth = 2;

  connections.forEach(([start, end]) => {
    const startPoint = landmarks[start];
    const endPoint = landmarks[end];
    
    ctx.beginPath();
    ctx.moveTo(startPoint.x * ctx.canvas.width, startPoint.y * ctx.canvas.height);
    ctx.lineTo(endPoint.x * ctx.canvas.width, endPoint.y * ctx.canvas.height);
    ctx.stroke();
  });

  // Draw landmarks
  ctx.fillStyle = '#4ade80';
  landmarks.forEach(landmark => {
    ctx.beginPath();
    ctx.arc(
      landmark.x * ctx.canvas.width,
      landmark.y * ctx.canvas.height,
      5,
      0,
      2 * Math.PI
    );
    ctx.fill();
  });
}

function detectGesture(landmarks) {
  const thumb = landmarks[4];
  const index = landmarks[8];
  const middle = landmarks[12];
  const ring = landmarks[16];
  const pinky = landmarks[20];
  const wrist = landmarks[0];

  // Calculate distances
  const thumbIndexDist = distance3D(thumb, index);
  const indexMiddleDist = distance3D(index, middle);
  
  // Finger states (extended vs folded)
  const indexExtended = index.y < landmarks[6].y;
  const middleExtended = middle.y < landmarks[10].y;
  const ringExtended = ring.y < landmarks[14].y;
  const pinkyExtended = pinky.y < landmarks[18].y;

  // Pinch gesture (thumb and index close)
  if (thumbIndexDist < 0.05) {
    return 'pinch';
  }

  // Fist (all fingers folded)
  if (!indexExtended && !middleExtended && !ringExtended && !pinkyExtended) {
    return 'fist';
  }

  // Open palm (all fingers extended)
  if (indexExtended && middleExtended && ringExtended && pinkyExtended) {
    return 'palm';
  }

  // Peace sign (index and middle extended)
  if (indexExtended && middleExtended && !ringExtended && !pinkyExtended) {
    return 'peace';
  }

  // Pointing (only index extended)
  if (indexExtended && !middleExtended && !ringExtended && !pinkyExtended) {return 'point';
  }

  return null;
}

function distance3D(point1, point2) {
  return Math.sqrt(
    Math.pow(point1.x - point2.x, 2) +
    Math.pow(point1.y - point2.y, 2) +
    Math.pow(point1.z - point2.z, 2)
  );
}

function handleGesture(gesture, x, y) {
  const actionIndicator = document.getElementById('gesture-action');
  
  switch(gesture) {
    case 'pinch':
      // Click/Select action
      actionIndicator.textContent = '👌';
      actionIndicator.classList.add('show');
      setTimeout(() => actionIndicator.classList.remove('show'), 600);
      
      // Trigger click at cursor position
      simulateClick(x, y);
      
      document.getElementById('gesture-status-text').textContent = 'Pinch: Click';
      break;

    case 'fist':
      // Grab/Drag action
      actionIndicator.textContent = '✊';
      actionIndicator.classList.add('show');
      setTimeout(() => actionIndicator.classList.remove('show'), 600);
      
      document.getElementById('gesture-status-text').textContent = 'Fist: Grab';
      break;

    case 'palm':
      // Stop/Cancel action
      actionIndicator.textContent = '🤚';
      actionIndicator.classList.add('show');
      setTimeout(() => actionIndicator.classList.remove('show'), 600);
      
      document.getElementById('gesture-status-text').textContent = 'Palm: Stop';
      break;

    case 'peace':
      // Scroll action
      actionIndicator.textContent = '✌️';
      actionIndicator.classList.add('show');
      setTimeout(() => actionIndicator.classList.remove('show'), 600);
      
      document.getElementById('gesture-status-text').textContent = 'Peace: Scroll';
      break;

    case 'point':
      document.getElementById('gesture-status-text').textContent = 'Pointing: Move cursor';
      break;

    default:
      document.getElementById('gesture-status-text').textContent = 'Camera Active';
  }
}

function simulateClick(x, y) {
  // Find element at position
  const elements = document.elementsFromPoint(x, y);
  const clickableElement = elements.find(el => 
    el.onclick || 
    el.classList.contains('app-field-item') ||
    el.tagName === 'BUTTON' ||
    el.tagName === 'A'
  );

  if (clickableElement) {
    clickableElement.click();
    
    // Visual feedback
    const ripple = document.createElement('div');
    ripple.style.cssText = `
      position: fixed;
      left: ${x}px;
      top: ${y}px;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: rgba(74,222,128,0.4);
      transform: translate(-50%, -50%);
      pointer-events: none;
      animation: rippleEffect 0.6s ease-out;
      z-index: 10001;
    `;
    document.body.appendChild(ripple);
    
    setTimeout(() => ripple.remove(), 600);
  }
}

function exitGestureMode() {
  gestureMode = false;
  document.getElementById('gesture-mode').classList.remove('active');

  if (gestureStream) {
    gestureStream.getTracks().forEach(track => track.stop());
    gestureStream = null;
  }

  if (handTracker && handTracker.camera) {
    handTracker.camera.stop();
  }

  addNotification('Gesture Mode Ended', 'Returning to normal mode', 'info', 'ℹ️');
}

// Add ripple animation
const rippleStyle = document.createElement('style');
rippleStyle.textContent = `
  @keyframes rippleEffect {
    0% {
      transform: translate(-50%, -50%) scale(0);
      opacity: 1;
    }
    100% {
      transform: translate(-50%, -50%) scale(3);
      opacity: 0;
    }
  }
`;
document.head.appendChild(rippleStyle);

// Expose functions
window.startGestureMode = startGestureMode;
window.exitGestureMode = exitGestureMode;