// Notification System
let notifications = [];
let notificationId = 0;
let isDoNotDisturb = false;

// SVG Icon Library for Windows 11
const notificationIcons = {
    info: `<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>`,
    success: `<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>`,
    warning: `<path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>`,
    error: `<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>`,
    online: `<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>`,
    offline: `<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM4 12c0-4.42 3.58-8 8-8 1.85 0 3.55.63 4.9 1.69L5.69 16.9C4.63 15.55 4 13.85 4 12zm8 8c-1.85 0-3.55-.63-4.9-1.69L18.31 7.1C19.37 8.45 20 10.15 20 12c0 4.42-3.58 8-8 8z"/>`,
    update: `<path d="M21 10.12h-6.78l2.74-2.82c-2.73-2.7-7.15-2.8-9.88-.1-2.73 2.71-2.73 7.08 0 9.79 2.73 2.71 7.15 2.71 9.88 0 1.36-1.35 2.04-3.16 2.04-4.98h-2c0 1.98-.78 3.81-2.04 5.18-3.31 3.28-8.72 3.25-12.01-.05-3.29-3.29-3.26-8.74.03-12.01 3.27-3.26 8.58-3.26 11.85 0L21 3v7.12zM12.5 8v4.25l3.5 2.08-.72 1.21L11 13V8h1.5z"/>`,
    security: `<path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/>`,
    battery: `<path d="M15.67 4H14V2h-4v2H8.33C7.6 4 7 4.6 7 5.33v15.34C7 21.4 7.6 22 8.33 22h7.34c.74 0 1.34-.6 1.34-1.33V5.33C17 4.6 16.4 4 15.67 4zM11 20v-5.5H9L13 7v5.5h2L11 20z"/>`,
    wifi: `<path d="M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.08 2.93 1 9zm8 8l3 3 3-3c-1.65-1.66-4.34-1.66-6 0zm-4-4l2 2c2.76-2.76 7.24-2.76 10 0l2-2C15.14 9.14 8.87 9.14 5 13z"/>`,
    bluetooth: `<path d="M17.71 7.71L12 2h-1v7.59L6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 11 14.41V22h1l5.71-5.71-4.3-4.29 4.3-4.29zM13 5.83l1.88 1.88L13 9.59V5.83zm1.88 10.46L13 18.17v-3.76l1.88 1.88z"/>`,
    bell: `<path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/>`,
    calendar: `<path d="M17 12h-5v5h5v-5zM16 1v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-1V1h-2zm3 18H5V8h14v11z"/>`,
    settings: `<path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/>`
};

// Settings object
const settings = {
    clearBadgeOnOpen: false,
    showToasts: true,
    toastDuration: 5000,
    soundEnabled: false,
    autoRemoveAfter: 24 * 60 * 60 * 1000
};

// Initialize the system
function initNotificationSystem() {
    loadSettings();
    setupEventListeners();
    setupToastContainer();
    monitorSystemEvents();
    
    // Welcome notification after delay
    setTimeout(() => {
        addNotification(
            'Welcome to Windows 11',
            'System is ready and online',
            'online',
            'update',
            [
                { text: 'Get Started', action: 'open-tour', type: 'primary' },
                { text: 'Dismiss', action: 'dismiss', type: 'secondary' }
            ]
        );
    }, 1500);
}

// Load settings from localStorage
function loadSettings() {
    const savedSettings = localStorage.getItem('win11NotificationSettings');
    if (savedSettings) {
        Object.assign(settings, JSON.parse(savedSettings));
    }
    isDoNotDisturb = localStorage.getItem('win11DoNotDisturb') === 'true';
    
    // Update DND toggle UI
    updateDNDToggle();
}

// Save settings to localStorage
function saveSettings() {
    localStorage.setItem('win11NotificationSettings', JSON.stringify(settings));
    localStorage.setItem('win11DoNotDisturb', isDoNotDisturb);
}

// Setup toast container
function setupToastContainer() {
    if (!document.getElementById('toast-container')) {
        const container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'toast-container';
        document.body.appendChild(container);
    }
}

// Setup event listeners
function setupEventListeners() {
    // Close notification center when clicking outside
    document.addEventListener('click', (e) => {
        const center = document.getElementById('notification-center');
        const bellIcon = e.target.closest('[aria-label="Notifications"]');
        
        if (!e.target.closest('#notification-center') && !bellIcon) {
            center.classList.remove('open');
        }
    });

    // Monitor online/offline status
    window.addEventListener('online', () => {
        addNotification(
            'Connection Restored',
            'You are now back online',
            'online',
            'wifi',
            [{ text: 'Network settings', action: 'open-network-settings', type: 'primary' }]
        );
    });
    
    window.addEventListener('offline', () => {
        addNotification(
            'Connection Lost',
            'You are currently offline',
            'offline',
            'wifi',
            [{ text: 'Troubleshoot', action: 'troubleshoot-network', type: 'primary' }]
        );
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Win + N (Ctrl + N for demo)
        if (e.ctrlKey && e.key === 'n') {
            e.preventDefault();
            toggleNotificationCenter();
        }
        
        // Escape to close
        if (e.key === 'Escape') {
            const center = document.getElementById('notification-center');
            if (center.classList.contains('open')) {
                center.classList.remove('open');
            }
        }
    });
}

// Toggle notification center
function toggleNotificationCenter() {
    const center = document.getElementById('notification-center');
    const isOpen = center.classList.contains('open');

    if (isOpen) {
        center.classList.remove('open');
    } else {
        center.classList.add('open');
        // Mark all as read when opening
        markAllAsRead();
        // Clear badge if setting enabled
        if (settings.clearBadgeOnOpen) updateNotificationBadge(0);
    }
}

// Add a new notification
function addNotification(title, message, type = 'info', icon = 'bell', actions = [], metadata = {}) {
    if (isDoNotDisturb && metadata.urgent !== true) {
        return null;
    }

    const id = notificationId++;
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const timestamp = Date.now();

    const notification = {
        id,
        title,
        message,
        type,
        icon,
        actions,
        time,
        timestamp,
        read: false,
        metadata
    };

    notifications.unshift(notification);
    renderNotifications();
    updateNotificationBadge();

    // Show toast notification
    if (settings.showToasts && !metadata.silent) {
        showToastNotification(notification);
    }

    // Auto-remove after configured time
    if (settings.autoRemoveAfter > 0 && !metadata.persistent) {
        setTimeout(() => removeNotification(id), settings.autoRemoveAfter);
    }

    // Save to localStorage
    saveNotifications();

    return id;
}

//  toast notification
function showToastNotification(notification) {
    if (isDoNotDisturb) return;

    const toastId = `toast-${Date.now()}`;
    const toast = document.createElement('div');
    toast.id = toastId;
    toast.className = `toast-notification toast-${notification.type}`;

    let actionsHTML = '';
    if (notification.actions && notification.actions.length > 0) {
        actionsHTML = `
            <div class="toast-actions">
                ${notification.actions.map(action => `
                    <button class="toast-action-btn ${action.type || 'secondary'}" 
                            data-action="${action.action}"
                            data-toast-id="${toastId}"
                            data-notification-id="${notification.id}">
                        ${action.text}
                    </button>
                `).join('')}
            </div>
        `;
    }

    toast.innerHTML = `
        <div class="toast-header">
            <div class="toast-icon">
                <svg viewBox="0 0 24 24" fill="currentColor">
                    ${getIconSVG(notification.icon)}
                </svg>
            </div>
            <div class="toast-content">
                <div class="toast-title">${notification.title}</div>
                <div class="toast-message">${notification.message}</div>
            </div>
            <button class="toast-close" data-toast-id="${toastId}">
                <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                </svg>
            </button>
        </div>
        ${actionsHTML}
        <div class="toast-progress"></div>
    `;

    document.getElementById('toast-container').appendChild(toast);

    // Animate in
    setTimeout(() => toast.classList.add('show'), 10);

    // Progress bar animation
    const progressBar = toast.querySelector('.toast-progress');
    if (progressBar) {
        progressBar.style.animationDuration = `${settings.toastDuration}ms`;
    }

    // Auto-dismiss
    const dismissTimeout = setTimeout(() => {
        hideToast(toastId);
    }, settings.toastDuration);

    // Close button
    toast.querySelector('.toast-close')?.addEventListener('click', () => {
        clearTimeout(dismissTimeout);
        hideToast(toastId);
    });

    // Action buttons
    toast.querySelectorAll('.toast-action-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const action = e.target.dataset.action;
            const notificationId = parseInt(e.target.dataset.notificationId);
            handleNotificationAction(notificationId, action);
            hideToast(toastId);
        });
    });

    // Click on toast to open notification center
    toast.addEventListener('click', (e) => {
        if (!e.target.closest('.toast-close') && !e.target.closest('.toast-action-btn')) {
            toggleNotificationCenter();
            hideToast(toastId);
        }
    });
}

// Hide toast notification
function hideToast(toastId) {
    const toast = document.getElementById(toastId);
    if (toast) {
        toast.classList.remove('show');
        toast.classList.add('hiding');
        setTimeout(() => toast.remove(), 300);
    }
}

// Remove notification
function removeNotification(id) {
    notifications = notifications.filter(n => n.id !== id);
    renderNotifications();
    updateNotificationBadge();
    saveNotifications();
}

// Mark as read
function markAsRead(id) {
    const notification = notifications.find(n => n.id === id);
    if (notification) {
        notification.read = true;
        updateNotificationBadge();
        saveNotifications();
    }
}

// Mark all as read
function markAllAsRead() {
    notifications.forEach(n => n.read = true);
    updateNotificationBadge();
    saveNotifications();
}

// Clear all notifications
function clearAllNotifications() {
    notifications = [];
    renderNotifications();
    updateNotificationBadge(0);
    saveNotifications();
}

// Render notifications
function renderNotifications() {
    const list = document.getElementById('notification-list');
    if (!list) return;

    if (notifications.length === 0) {
        list.innerHTML = `
            <div class="notification-empty">
                <div class="notification-empty-icon">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/>
                    </svg>
                </div>
                <div>No new notifications</div>
                <div class="notification-empty-subtitle">All caught up!</div>
            </div>
        `;
        return;
    }

    list.innerHTML = notifications.map(notification => {
        const actionButtons = notification.actions && notification.actions.length > 0 ? `
            <div class="notification-actions">
                ${notification.actions.map(action => `
                    <button class="notification-action-btn ${action.type || 'secondary'}" 
                            data-action="${action.action}" 
                            data-notification-id="${notification.id}">
                        ${action.text}
                    </button>
                `).join('')}
            </div>
        ` : '';

        return `
            <div class="notification-item ${notification.type} ${notification.read ? '' : 'unread'}" 
                 data-id="${notification.id}">
                <div class="notification-item-header">
                    <div class="notification-icon">
                        <svg viewBox="0 0 24 24" fill="currentColor">
                            ${getIconSVG(notification.icon)}
                        </svg>
                    </div>
                    <div class="notification-content">
                        <div class="notification-item-title">${notification.title}</div>
                        <div class="notification-item-text">${notification.message}</div>
                        <div class="notification-time">
                            <svg viewBox="0 0 24 24" fill="currentColor" width="10" height="10">
                                <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
                            </svg>
                            ${notification.time}
                        </div>
                    </div>
                </div>
                ${actionButtons}
                ${notification.metadata?.app ? `<div class="notification-app">${notification.metadata.app}</div>` : ''}
            </div>
        `;
    }).join('');

    // Add event listeners to new notifications
    list.querySelectorAll('.notification-item').forEach(item => {
        const id = parseInt(item.dataset.id);
        
        // Click to mark as read
        item.addEventListener('click', (e) => {
            if (!e.target.closest('.notification-action-btn')) {
                markAsRead(id);
                item.classList.remove('unread');
            }
        });
        
        // Action buttons
        item.querySelectorAll('.notification-action-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const action = e.target.dataset.action;
                const notificationId = parseInt(e.target.dataset.notificationId);
                handleNotificationAction(notificationId, action);
            });
        });
    });
}

// Update notification badge
function updateNotificationBadge() {
    const badge = document.getElementById('notification-badge');
    if (!badge) return;
    
    const unreadCount = notifications.filter(n => !n.read).length;
    
    if (isDoNotDisturb) {
        badge.style.display = 'none';
        return;
    }
    
    if (unreadCount > 0) {
        badge.textContent = unreadCount > 99 ? '99+' : unreadCount;
        badge.style.display = 'flex';
        
        // Add pulse animation for new notifications
        if (badge.textContent !== badge.dataset.lastCount) {
            badge.classList.add('pulse');
            setTimeout(() => badge.classList.remove('pulse'), 1000);
        }
    } else {
        badge.style.display = 'none';
    }
    
    badge.dataset.lastCount = badge.textContent;
}

// Toggle Do Not Disturb
function toggleDoNotDisturb() {
    isDoNotDisturb = !isDoNotDisturb;
    updateDNDToggle();
    updateNotificationBadge();
    
    if (isDoNotDisturb) {
        // Hide all toasts when enabling DND
        document.querySelectorAll('.toast-notification').forEach(toast => hideToast(toast.id));
        
        // Show notification about DND status
        addNotification(
            'Do Not Disturb',
            'Notifications are now silenced. You won\'t see or hear alerts.',
            'info',
            'security',
            [{ text: 'Turn off', action: 'toggle-dnd', type: 'primary' }],
            { silent: true, persistent: true }
        );
    }
    
    saveSettings();
}

// Update DND toggle UI
function updateDNDToggle() {
    const dndToggle = document.getElementById('dnd-toggle');
    const dndIndicator = document.getElementById('dnd-indicator');
    
    if (dndToggle) {
        dndToggle.classList.toggle('active', isDoNotDisturb);
        dndToggle.innerHTML = `
            <svg viewBox="0 0 24 24" fill="currentColor">
                ${isDoNotDisturb ? 
                    '<path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>' :
                    '<path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>'
                }
            </svg>
            ${isDoNotDisturb ? 'Do not disturb (On)' : 'Do not disturb'}
        `;
    }
    
    if (dndIndicator) {
        dndIndicator.style.display = isDoNotDisturb ? 'flex' : 'none';
    }
}

// Handle notification actions
function handleNotificationAction(notificationId, action) {
    console.log(`Action: ${action} for notification ${notificationId}`);
    
    switch (action) {
        case 'toggle-dnd':
            toggleDoNotDisturb();
            break;
        case 'open-network-settings':
            showToastMessage('Opening network settings...', 'info');
            break;
        case 'open-tour':
            showToastMessage('Starting welcome tour...', 'info');
            break;
        case 'dismiss':
            removeNotification(notificationId);
            break;
        default:
            // Handle custom actions
            if (typeof window.handleNotificationAction === 'function') {
                window.handleNotificationAction(notificationId, action);
            }
    }
}

// Show toast message
function showToastMessage(message, type = 'info', duration = 3000) {
    const toastId = `toast-${Date.now()}`;
    const toast = document.createElement('div');
    toast.id = toastId;
    toast.className = `toast-notification toast-${type}`;
    toast.innerHTML = `
        <div class="toast-header">
            <div class="toast-content">
                <div class="toast-message">${message}</div>
            </div>
            <button class="toast-close" data-toast-id="${toastId}">
                <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                </svg>
            </button>
        </div>
    `;
    
    document.getElementById('toast-container').appendChild(toast);
    setTimeout(() => toast.classList.add('show'), 10);
    
    setTimeout(() => hideToast(toastId), duration);
    
    toast.querySelector('.toast-close')?.addEventListener('click', () => hideToast(toastId));
}

// Get SVG icon
function getIconSVG(iconName) {
    return notificationIcons[iconName] || notificationIcons.bell;
}

// Save notifications to localStorage
function saveNotifications() {
    localStorage.setItem('win11Notifications', JSON.stringify(notifications));
}

// Load notifications from localStorage
function loadNotifications() {
    const saved = localStorage.getItem('win11Notifications');
    if (saved) {
        notifications = JSON.parse(saved);
        notificationId = notifications.length > 0 ? Math.max(...notifications.map(n => n.id)) + 1 : 0;
        renderNotifications();
        updateNotificationBadge();
    }
}

// Monitor system events
function monitorSystemEvents() {
    // Monitor battery if available
    if ('getBattery' in navigator) {
        navigator.getBattery().then(battery => {
            const updateBatteryStatus = () => {
                if (battery.level < 0.2 && !battery.charging) {
                    addNotification(
                        'Low Battery',
                        `Battery is at ${Math.round(battery.level * 100)}%. Connect to power soon.`,
                        'warning',
                        'battery',
                        [{ text: 'Power Settings', action: 'open-power-settings', type: 'primary' }],
                        { urgent: true }
                    );
                }
            };
            
            battery.addEventListener('levelchange', updateBatteryStatus);
            battery.addEventListener('chargingchange', updateBatteryStatus);
            updateBatteryStatus();
        });
    }
    
    // Monitor storage if available
    if ('storage' in navigator && 'estimate' in navigator.storage) {
        setInterval(() => {
            navigator.storage.estimate().then(estimate => {
                const usedPercent = (estimate.usage / estimate.quota) * 100;
                if (usedPercent > 90) {
                    addNotification(
                        'Storage Almost Full',
                        `Your storage is ${Math.round(usedPercent)}% full. Consider freeing up space.`,
                        'warning',
                        'settings',
                        [{ text: 'Storage Settings', action: 'open-storage-settings', type: 'primary' }]
                    );
                }
            });
        }, 5 * 60 * 1000);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    loadNotifications();
    initNotificationSystem();
    
    // Add DND toggle event listener
    const dndToggle = document.getElementById('dnd-toggle');
    if (dndToggle) {
        dndToggle.addEventListener('click', toggleDoNotDisturb);
    }
    
    // Add clear all event listener
    const clearAllBtn = document.getElementById('clear-all-notifications');
    if (clearAllBtn) {
        clearAllBtn.addEventListener('click', clearAllNotifications);
    }
    
    // Test notifications
    setTimeout(() => {
        addNotification(
            'System Update Available',
            'A new security update is ready to install.',
            'info',
            'update',
            [
                { text: 'Install Now', action: 'install-update', type: 'primary' },
                { text: 'Schedule', action: 'schedule-update', type: 'secondary' },
                { text: 'Remind Later', action: 'remind-later', type: 'secondary' }
            ],
            { app: 'Windows Update' }
        );
    }, 3000);
    
    setTimeout(() => {
        addNotification(
            'Reminder: Team Meeting',
            'Team meeting starts in 15 minutes in Conference Room A',
            'info',
            'calendar',
            [
                { text: 'Snooze 5 min', action: 'snooze-reminder', type: 'primary' },
                { text: 'Dismiss', action: 'dismiss', type: 'secondary' }
            ],
            { app: 'Calendar' }
        );
    }, 5000);
});

// Export for global use
window.notificationSystem = {
    addNotification,
    removeNotification,
    clearAllNotifications,
    toggleDoNotDisturb,
    toggleNotificationCenter,
    showToastMessage,
    markAllAsRead
};