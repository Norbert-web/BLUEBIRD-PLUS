/**
 * Core Module
 * - Home view
 * - Dashboard
 * - Profile
 * - Settings
 * - Privacy/About
 */

import { state, router, eventBus } from '../index.js';

export async function renderHome(params) {
    const profile = state.get('profile');
    const lessonsCompleted = Object.keys(state.get('progress.lessonsCompleted') || {}).length;
    const streak = state.get('streak.count') || 0;
    
    return `
        <div class="view home-view">
            <div class="card-hero">
                <h1>Welcome, ${'${'}escapeHtml(profile.name)}! 👋</h1>
                <p>Free, offline-first e-learning for the Uganda curriculum</p>
                <div class="btn-group">
                    <button class="btn" onclick="window.__BLUEBIRD.router.navigateTo('subjects')">
                        📚 Browse Subjects
                    </button>
                    <button class="btn outline" onclick="window.__BLUEBIRD.router.navigateTo('dashboard')">
                        📊 Your Dashboard
                    </button>
                </div>
            </div>

            <div class="grid-3">
                <div class="card">
                    <h3>📖 Lessons</h3>
                    <p style="font-size:2rem;font-weight:700">${'${'}lessonsCompleted}</p>
                    <p class="muted">Completed</p>
                    <button class="btn small" onclick="window.__BLUEBIRD.router.navigateTo('subjects')">
                        Continue Learning
                    </button>
                </div>
                <div class="card">
                    <h3>🔥 Streak</h3>
                    <p style="font-size:2rem;font-weight:700">${'${'}streak}</p>
                    <p class="muted">Days Active</p>
                    <button class="btn small" onclick="window.__BLUEBIRD.router.navigateTo('analytics')">
                        View Progress
                    </button>
                </div>
                <div class="card">
                    <h3>🏆 Achievements</h3>
                    <p style="font-size:2rem;font-weight:700">${'${'}(state.get('achievements') || []).length}</p>
                    <p class="muted">Badges Earned</p>
                    <button class="btn small" onclick="window.__BLUEBIRD.router.navigateTo('achievements')">
                        View Badges
                    </button>
                </div>
            </div>

            <div class="grid-2">
                <div class="card">
                    <h3>Quick Actions</h3>
                    <div class="btn-list">
                        <button class="btn small" onclick="window.__BLUEBIRD.router.navigateTo('exercises')">
                            ✏️ Practice Exercises
                        </button>
                        <button class="btn small outline" onclick="window.__BLUEBIRD.router.navigateTo('quizzes')">
                            ❓ Take a Quiz
                        </button>
                        <button class="btn small outline" onclick="window.__BLUEBIRD.router.navigateTo('flashcards')">
                            🎴 Study Flashcards
                        </button>
                        <button class="btn small ghost" onclick="window.__BLUEBIRD.router.navigateTo('notes')">
                            📝 My Notes
                        </button>
                    </div>
                </div>
                <div class="card">
                    <h3>📚 Explore</h3>
                    <div class="btn-list">
                        <button class="btn small" onclick="window.__BLUEBIRD.router.navigateTo('subjects', {level:'primary'})">
                            🎒 Primary (P1-P7)
                        </button>
                        <button class="btn small outline" onclick="window.__BLUEBIRD.router.navigateTo('subjects', {level:'secondary'})">
                            🏫 Secondary (S1-S6)
                        </button>
                        <button class="btn small outline" onclick="window.__BLUEBIRD.router.navigateTo('library')">
                            📖 Resource Library
                        </button>
                        <button class="btn small ghost" onclick="window.__BLUEBIRD.router.navigateTo('community')">
                            💬 Community Forum
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

export async function renderDashboard(params) {
    const profile = state.get('profile');
    const progress = state.get('progress');
    const bookmarks = state.get('bookmarks') || [];
    const achievements = state.get('achievements') || [];

    return `
        <div class="view dashboard-view">
            <h1>Your Dashboard</h1>
            
            <div class="grid-2">
                <div class="card">
                    <div class="card-header">
                        <h3>📈 Learning Progress</h3>
                    </div>
                    <div class="stats-grid">
                        <div class="stat">
                            <span class="stat-label">Lessons</span>
                            <span class="stat-value">${'${'}Object.keys(progress.lessonsCompleted || {}).length}</span>
                        </div>
                        <div class="stat">
                            <span class="stat-label">Quizzes</span>
                            <span class="stat-value">${'${'}(progress.quizAttempts || []).length}</span>
                        </div>
                        <div class="stat">
                            <span class="stat-label">Exercises</span>
                            <span class="stat-value">${'${'}(progress.exerciseAttempts || []).length}</span>
                        </div>
                        <div class="stat">
                            <span class="stat-label">Avg Score</span>
                            <span class="stat-value">${'${'}calculateAvgScore(progress.quizAttempts)}%</span>
                        </div>
                    </div>
                </div>

                <div class="card">
                    <div class="card-header">
                        <h3>👤 Profile Info</h3>
                    </div>
                    <div class="profile-info">
                        <p><strong>Name:</strong> ${'${'}escapeHtml(profile.name)}</p>
                        <p><strong>Role:</strong> ${'${'}escapeHtml(profile.role)}</p>
                        <p><strong>Class:</strong> ${'${'}escapeHtml(profile.class || 'Not set')}</p>
                        <p><strong>School:</strong> ${'${'}escapeHtml(profile.school || 'Not set')}</p>
                        <button class="btn small" onclick="window.__BLUEBIRD.router.navigateTo('profile')">
                            ✏️ Edit Profile
                        </button>
                    </div>
                </div>
            </div>

            <div class="card">
                <h3>🔖 Recent Bookmarks (${bookmarks.length})</h3>
                <div class="bookmark-list">
                    ${'${'}bookmarks.length === 0 
                        ? '<p class="muted">No bookmarks yet. Bookmark lessons to save them!</p>'
                        : bookmarks.slice(0, 5).map(b => `
                            <div class="bookmark-item">
                                <strong>${'${'}escapeHtml(b.title || b)}</strong>
                                <button class="btn small" onclick="window.__BLUEBIRD.router.navigateTo('lesson', {topicId:'${'${'}b.id}'})">
                                    Open
                                </button>
                            </div>
                        `).join('')
                    }
                </div>
            </div>

            <div class="card">
                <h3>🏆 Recent Achievements (${achievements.length})</h3>
                <div class="achievements-list">
                    ${'${'}achievements.slice(-3).reverse().map(a => `
                        <div class="achievement-item">
                            <span style="font-size:2rem">${'${'}a.icon}</span>
                            <div>
                                <strong>${'${'}escapeHtml(a.name)}</strong>
                                <p class="muted">${'${'}new Date(a.earnedAt).toLocaleDateString()}</p>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `;
}

export async function renderProfile(params) {
    const profile = state.get('profile');

    return `
        <div class="view profile-view">
            <h1>Profile</h1>
            
            <div class="card">
                <div class="profile-header">
                    <div style="font-size:4rem">${'${'}profile.avatar}</div>
                    <div>
                        <h2>${'${'}escapeHtml(profile.name)}</h2>
                        <p class="muted">${'${'}escapeHtml(profile.role)} • ${'${'}escapeHtml(profile.school)}</p>
                    </div>
                </div>

                <hr class="divider">

                <div class="profile-details">
                    <div class="detail">
                        <label>Name</label>
                        <p>${'${'}escapeHtml(profile.name)}</p>
                    </div>
                    <div class="detail">
                        <label>Role</label>
                        <p>${'${'}escapeHtml(profile.role)}</p>
                    </div>
                    <div class="detail">
                        <label>Class</label>
                        <p>${'${'}escapeHtml(profile.class || 'Not set')}</p>
                    </div>
                    <div class="detail">
                        <label>School</label>
                        <p>${'${'}escapeHtml(profile.school || 'Not set')}</p>
                    </div>
                    <div class="detail">
                        <label>Favorite Subjects</label>
                        <p>${'${'}(profile.favorites || []).join(', ') || 'None'}</p>
                    </div>
                </div>

                <div class="btn-group">
                    <button class="btn" onclick="window.__BLUEBIRD.router.navigateTo('settings')">
                        ⚙️ Edit Profile
                    </button>
                    <button class="btn outline" onclick="window.__BLUEBIRD.router.navigateTo('settings')">
                        🔑 Change Password
                    </button>
                </div>
            </div>
        </div>
    `;
}

export async function renderSettings(params) {
    const prefs = state.get('preferences');

    return `
        <div class="view settings-view">\n            <h1>Settings</h1>\n            \n            <div class="card">\n                <h3>🎨 Appearance</h3>\n                <div class="setting-group">\n                    <label>Theme</label>\n                    <select onchange="window.__BLUEBIRD.state.set('preferences.theme', this.value)">\n                        <option value="auto" ${'${'}prefs.theme === 'auto' ? 'selected' : ''}>Auto</option>\n                        <option value="light" ${'${'}prefs.theme === 'light' ? 'selected' : ''}>Light</option>\n                        <option value="dark" ${'${'}prefs.theme === 'dark' ? 'selected' : ''}>Dark</option>\n                    </select>\n                </div>\n                <div class="setting-group">\n                    <label>Font Size</label>\n                    <input type="range" min="12" max="20" value="${'${'}prefs.fontSize}" \n                        onchange="window.__BLUEBIRD.state.set('preferences.fontSize', parseInt(this.value))">\n                    <span>${'${'}prefs.fontSize}px</span>\n                </div>\n            </div>\n
            <div class="card">\n                <h3>🔔 Notifications</h3>\n                <div class="setting-group">\n                    <label>\n                        <input type="checkbox" ${'${'}prefs.notifications ? 'checked' : ''} \n                            onchange="window.__BLUEBIRD.state.set('preferences.notifications', this.checked)">\n                        Enable Notifications\n                    </label>\n                </div>\n            </div>\n
            <div class="card">\n                <h3>🌍 Language</h3>\n                <div class="setting-group">\n                    <label>Language</label>\n                    <select onchange="window.__BLUEBIRD.state.set('preferences.language', this.value)">\n                        <option value="en" ${'${'}prefs.language === 'en' ? 'selected' : ''}>English</option>\n                        <option value="lg" ${'${'}prefs.language === 'lg' ? 'selected' : ''}>Luganda</option>\n                        <option value="sw" ${'${'}prefs.language === 'sw' ? 'selected' : ''}>Swahili</option>\n                    </select>\n                </div>\n            </div>\n
            <div class="card">\n                <h3>⚠️ Danger Zone</h3>\n                <button class="btn danger" onclick="if(confirm('Reset all progress? This cannot be undone.')) { window.__BLUEBIRD.state.reset(); location.reload(); }">\n                    🗑️ Clear All Data\n                </button>\n            </div>\n        </div>\n    `;\n}

export async function renderPrivacy(params) {
    return `
        <div class="view privacy-view">
            <h1>Privacy & Safety</h1>
            
            <div class="card">
                <h2>Your Data is Private</h2>
                <ul>
                    <li>✅ All data stored locally on your device</li>
                    <li>✅ No user accounts required</li>
                    <li>✅ No remote servers collect your data</li>
                    <li>✅ No tracking or analytics</li>
                    <li>✅ No advertisements</li>
                    <li>✅ No personal data shared</li>
                </ul>
            </div>

            <div class="card">
                <h2>Child Safety</h2>
                <p>BLUEBIRD-PLUS is designed to be safe for children with:</p>
                <ul>
                    <li>No external links or pop-ups</li>
                    <li>No in-app purchases</li>
                    <li>Age-appropriate content</li>
                    <li>Educational focus only</li>
                </ul>
            </div>

            <div class="card">
                <h2>Data Export & Control</h2>
                <button class="btn small" onclick="window.__BLUEBIRD.router.navigateTo('settings')">
                    📥 Export My Data
                </button>
                <button class="btn small outline" onclick="window.__BLUEBIRD.router.navigateTo('settings')">
                    ⬆️ Backup to Cloud
                </button>
            </div>
        </div>
    `;
}

export async function renderAbout(params) {
    return `
        <div class="view about-view">
            <h1>About BLUEBIRD-PLUS</h1>
            
            <div class="card">
                <h2>🚀 BLUEBIRD-PLUS v2.0</h2>
                <p>Free, offline-first e-learning platform for the Uganda National Curriculum (NCDC).</p>
                <p>Covering <strong>Primary (P1-P7)</strong> and <strong>Secondary (S1-S6)</strong> with lessons, exercises, quizzes, flashcards, and progress tracking.</p>
            </div>

            <div class="card">
                <h2>⌨️ Keyboard Shortcuts</h2>
                <table style="width:100%">
                    <tr><td>/</td><td>Focus search</td></tr>
                    <tr><td>H</td><td>Go to Home</td></tr>
                    <tr><td>Esc</td><td>Close modals</td></tr>
                </table>
            </div>

            <div class="card">
                <h2>📝 Credits</h2>
                <p>Built for learners in Uganda and beyond.</p>
                <p>No tracking. No accounts. No ads. Just learning.</p>
            </div>
        </div>
    `;
}

// Helpers
function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

function calculateAvgScore(attempts) {
    if (!attempts || attempts.length === 0) return 0;
    const sum = attempts.reduce((acc, a) => acc + (a.score || 0), 0);
    return Math.round(sum / attempts.length);
}
