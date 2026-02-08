// ===== AI ASSISTANT =====
let claudeKnowledge = {};
let claudeConversationHistory = [];
let claudeContext = {
  lastCommand: null,
  lastApp: null,
  userMood: 'neutral',
  sessionStart: Date.now(),
  commandCount: 0,
  learningMode: true,
  language: 'en',
  voiceEnabled: false,
  personalityMode: 'professional',
  userName: 'User'
};
let isListening = false;
let recognition = null;
let synthesis = window.speechSynthesis;
let claudeTasks = [];
let claudeHabits = [];
let claudeGoals = [];
let claudeClipboard = [];
let focusModeActive = false;
let pomodoroTimer = null;

// ===== ENHANCED PERSONALITY SYSTEM =====
const claudePersonalities = {
  professional: {
    greetings: ["Good day. How may I assist you?", "Hello. Ready to work efficiently.", "Greetings. What can I help you accomplish?"],
    thanks: ["You're welcome. Happy to help.", "My pleasure. Feel free to ask anything else.", "Glad I could assist."],
    tone: "formal"
  },
  casual: {
    greetings: ["Hey there! 👋 What's up?", "Yo! How can I help?", "Hi! What's on your mind?"],
    thanks: ["No prob! 😊", "Anytime! That's what I'm here for!", "Happy to help! 🎉"],
    tone: "friendly"
  },
  motivational: {
    greetings: ["You're going to do AMAZING things today! 🌟", "Ready to crush your goals? Let's go! 💪", "Today is YOUR day! How can I help you shine? ✨"],
    thanks: ["YOU are awesome! Keep going! 🚀", "That's the spirit! You're unstoppable! 💥", "You're doing GREAT! Keep it up! 🏆"],
    tone: "enthusiastic"
  },
  funny: {
    greetings: ["Hey! Ready to make today less boring? 😄", "Sup! Let's get stuff done... or at least pretend to! 😎", "Hello human! How can I help you today without causing Skynet? 🤖"],
    thanks: ["You're welcome! *takes a bow* 🎭", "Anytime! I'm here all week! 😄", "No biggie! I accept payment in compliments! 😊"],
    tone: "humorous"
  }
};

// ===== MULTI-LANGUAGE SUPPORT =====
const claudeLanguages = {
  en: { name: "English", code: "en-US", flag: "🇺🇸" },
  es: { name: "Español", code: "es-ES", flag: "🇪🇸" },
  fr: { name: "Français", code: "fr-FR", flag: "🇫🇷" },
  de: { name: "Deutsch", code: "de-DE", flag: "🇩🇪" },
  sw: { name: "Kiswahili", code: "sw-KE", flag: "🇰🇪" },
  ar: { name: "العربية", code: "ar-SA", flag: "🇸🇦" },
  zh: { name: "中文", code: "zh-CN", flag: "🇨🇳" },
  hi: { name: "हिन्दी", code: "hi-IN", flag: "🇮🇳" },
  pt: { name: "Português", code: "pt-BR", flag: "🇧🇷" },
  ru: { name: "Русский", code: "ru-RU", flag: "🇷🇺" }
};

const translations = {
  en: {
    greeting: "Hello! I'm Comfort Claude, your AI assistant.",
    help: "How can I help you today?",
    searching: "Searching...",
    error: "Sorry, I encountered an error.",
    success: "Done!",
    working: "Working on it..."
  },
  es: {
    greeting: "¡Hola! Soy Comfort Claude, tu asistente AI.",
    help: "¿Cómo puedo ayudarte hoy?",
    searching: "Buscando...",
    error: "Lo siento, encontré un error.",
    success: "¡Hecho!",
    working: "Trabajando en ello..."
  },
  fr: {
    greeting: "Bonjour! Je suis Comfort Claude, votre assistant IA.",
    help: "Comment puis-je vous aider aujourd'hui?",
    searching: "Recherche...",
    error: "Désolé, j'ai rencontré une erreur.",
    success: "Terminé!",
    working: "Je travaille dessus..."
  },
  sw: {
    greeting: "Habari! Mimi ni Comfort Claude, msaidizi wako wa AI.",
    help: "Naweza kukusaidiaje leo?",
    searching: "Inatafuta...",
    error: "Samahani, nimekutana na hitilafu.",
    success: "Imekamilika!",
    working: "Ninafanya kazi..."
  }
};

// ===== SVG ICONS LIBRARY =====
const claudeIcons = {
  search: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>`,
  microphone: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>`,
  speaker: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>`,
  task: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>`,
  calendar: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,
  brain: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z"/><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z"/></svg>`,
  chart: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>`,
  email: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>`,
  weather: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/></svg>`,
  news: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/><path d="M18 14h-8"/><path d="M15 18h-5"/><path d="M10 6h8v4h-8V6Z"/></svg>`,
  translate: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m5 8 6 6"/><path d="m4 14 6-6 2-3"/><path d="M2 5h12"/><path d="M7 2h1"/><path d="m22 22-5-10-5 10"/><path d="M14 18h6"/></svg>`,
  goal: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>`,
  focus: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M12 1v6m0 6v6m6-12v6m0 0v6m-12-12v6m0 0v6"/></svg>`,
  clipboard: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg>`,
  trophy: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>`,
  lightbulb: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/></svg>`,
  zap: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`
};

// ===== TEXT-TO-SPEECH ENGINE =====
function speak(text, rate = 1.0, pitch = 1.0) {
  if (!claudeContext.voiceEnabled || !synthesis) return;
  
  synthesis.cancel(); // Stop any ongoing speech
  
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = rate;
  utterance.pitch = pitch;
  utterance.lang = claudeLanguages[claudeContext.language].code;
  
  // Try to find a voice for the selected language
  const voices = synthesis.getVoices();
  const voice = voices.find(v => v.lang.startsWith(claudeContext.language)) || voices[0];
  if (voice) utterance.voice = voice;
  
  synthesis.speak(utterance);
}

function toggleVoiceOutput() {
  claudeContext.voiceEnabled = !claudeContext.voiceEnabled;
  const status = claudeContext.voiceEnabled ? 'enabled' : 'disabled';
  addClaudeMessage('assistant', `🔊 Voice output ${status}. ${claudeContext.voiceEnabled ? 'I will now speak my responses!' : 'I will stay silent.'}`);
  saveClaudeKnowledge();
}

// ===== SMART SUGGESTIONS ENGINE =====
const commandSuggestions = [
  { cmd: "search for", icon: claudeIcons.search, desc: "Search the web" },
  { cmd: "open ", icon: "🚀", desc: "Launch an app" },
  { cmd: "add task", icon: claudeIcons.task, desc: "Create a to-do" },
  { cmd: "add event", icon: claudeIcons.calendar, desc: "Schedule event" },
  { cmd: "calc ", icon: "🧮", desc: "Calculate" },
  { cmd: "translate", icon: claudeIcons.translate, desc: "Translate text" },
  { cmd: "weather", icon: claudeIcons.weather, desc: "Get weather" },
  { cmd: "news", icon: claudeIcons.news, desc: "Latest news" },
  { cmd: "screenshot", icon: "📸", desc: "Capture screen" },
  { cmd: "email draft", icon: claudeIcons.email, desc: "Draft email" }
];

function showSmartSuggestions(input) {
  const suggestionsDiv = document.getElementById('claude-suggestions');
  if (!suggestionsDiv) return;
  
  const value = input.toLowerCase();
  if (value.length < 2) {
    suggestionsDiv.style.display = 'none';
    return;
  }
  
  const matches = commandSuggestions.filter(s => 
    s.cmd.toLowerCase().includes(value) || s.desc.toLowerCase().includes(value)
  );
  
  if (matches.length === 0) {
    suggestionsDiv.style.display = 'none';
    return;
  }
  
  suggestionsDiv.innerHTML = matches.slice(0, 5).map(s => `
    <div class="suggestion-item" onclick="applySuggestion('${s.cmd}')">
      <span class="suggestion-icon">${typeof s.icon === 'string' && s.icon.startsWith('<svg') ? s.icon : s.icon}</span>
      <div>
        <div class="suggestion-cmd">${s.cmd}</div>
        <div class="suggestion-desc">${s.desc}</div>
      </div>
    </div>
  `).join('');
  
  suggestionsDiv.style.display = 'block';
}

function applySuggestion(cmd) {
  document.getElementById('claude-input').value = cmd;
  document.getElementById('claude-suggestions').style.display = 'none';
  document.getElementById('claude-input').focus();
}

// ===== TASK MANAGEMENT SYSTEM =====
function addTask(title, priority = 'medium', dueDate = null) {
  const task = {
    id: Date.now(),
    title,
    priority,
    dueDate,
    completed: false,
    created: new Date().toISOString()
  };
  
  claudeTasks.push(task);
  saveClaudeKnowledge();
  
  const priorityEmoji = priority === 'high' ? '🔴' : priority === 'medium' ? '🟡' : '🟢';
  addClaudeMessage('assistant', `✅ **Task Added!**\n\n${priorityEmoji} ${title}\n${dueDate ? `📅 Due: ${dueDate}` : 'No deadline'}\n\nYou now have ${claudeTasks.filter(t => !t.completed).length} pending tasks.`);
}

function listTasks(filter = 'all') {
  let tasks = claudeTasks;
  
  if (filter === 'pending') {
    tasks = tasks.filter(t => !t.completed);
  } else if (filter === 'completed') {
    tasks = tasks.filter(t => t.completed);
  }
  
  if (tasks.length === 0) {
    addClaudeMessage('assistant', `📋 **Tasks**\n\nNo ${filter} tasks! ${filter === 'pending' ? 'Great job! 🎉' : ''}`);
    return;
  }
  
  let message = `📋 **${filter.charAt(0).toUpperCase() + filter.slice(1)} Tasks:**\n\n`;
  tasks.forEach((t, i) => {
    const priorityEmoji = t.priority === 'high' ? '🔴' : t.priority === 'medium' ? '🟡' : '🟢';
    const status = t.completed ? '✅' : '⬜';
    message += `${i + 1}. ${status} ${priorityEmoji} ${t.title}\n`;
    if (t.dueDate) message += `   📅 ${t.dueDate}\n`;
  });
  
  addClaudeMessage('assistant', message);
}

function completeTask(taskId) {
  const task = claudeTasks.find(t => t.id === taskId);
  if (task) {
    task.completed = true;
    saveClaudeKnowledge();
    addClaudeMessage('assistant', `🎉 **Task Completed!**\n\n${task.title}\n\nGreat work! Keep it up! 💪`);
  }
}

// ===== HABIT TRACKER =====
function addHabit(name, frequency = 'daily') {
  const habit = {
    id: Date.now(),
    name,
    frequency,
    streak: 0,
    lastChecked: null,
    history: [],
    created: new Date().toISOString()
  };
  
  claudeHabits.push(habit);
  saveClaudeKnowledge();
  
  addClaudeMessage('assistant', `🎯 **Habit Tracker Started!**\n\n${name}\nFrequency: ${frequency}\n\nLet's build that streak! 💪`);
}

function checkHabit(habitId) {
  const habit = claudeHabits.find(h => h.id === habitId);
  if (!habit) return;
  
  const today = new Date().toISOString().split('T')[0];
  
  if (habit.lastChecked === today) {
    addClaudeMessage('assistant', `Already checked today! Come back tomorrow! 😊`);
    return;
  }
  
  // Check if streak continues
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];
  
  if (habit.lastChecked === yesterdayStr || habit.streak === 0) {
    habit.streak++;
  } else {
    habit.streak = 1; // Reset streak
  }
  
  habit.lastChecked = today;
  habit.history.push(today);
  saveClaudeKnowledge();
  
  const encouragement = habit.streak >= 7 ? "🔥 You're on fire!" : 
                       habit.streak >= 3 ? "💪 Keep going!" : "🌟 Great start!";
  
  addClaudeMessage('assistant', `✅ **Habit Checked!**\n\n${habit.name}\nStreak: ${habit.streak} days 🎯\n\n${encouragement}`);
}

function listHabits() {
  if (claudeHabits.length === 0) {
    addClaudeMessage('assistant', `🎯 **Habits**\n\nNo habits tracked yet! Start with "add habit: drink water"`);
    return;
  }
  
  let message = `🎯 **Your Habits:**\n\n`;
  claudeHabits.forEach((h, i) => {
    const fire = h.streak >= 7 ? '🔥' : h.streak >= 3 ? '💪' : '🌟';
    message += `${i + 1}. ${fire} ${h.name}\n   Streak: ${h.streak} days | ${h.frequency}\n`;
  });
  
  addClaudeMessage('assistant', message);
}

// ===== GOAL SYSTEM =====
function addGoal(title, deadline, milestones = []) {
  const goal = {
    id: Date.now(),
    title,
    deadline,
    milestones,
    progress: 0,
    created: new Date().toISOString()
  };
  
  claudeGoals.push(goal);
  saveClaudeKnowledge();
  
  addClaudeMessage('assistant', `🎯 **Goal Set!**\n\n${title}\n📅 Deadline: ${deadline}\n${milestones.length > 0 ? `\nMilestones:\n${milestones.map((m, i) => `${i + 1}. ${m}`).join('\n')}` : ''}\n\nLet's make it happen! 🚀`);
}

function updateGoalProgress(goalId, progress) {
  const goal = claudeGoals.find(g => g.id === goalId);
  if (goal) {
    goal.progress = progress;
    saveClaudeKnowledge();
    
    const progressBar = '█'.repeat(Math.floor(progress / 10)) + '░'.repeat(10 - Math.floor(progress / 10));
    addClaudeMessage('assistant', `📊 **Goal Progress Updated!**\n\n${goal.title}\n${progressBar} ${progress}%\n\n${progress >= 100 ? '🎉 GOAL COMPLETED! Amazing work!' : 'Keep pushing! 💪'}`);
  }
}

// ===== WEB SEARCH =====
async function searchWeb(query) {
  try {
    addClaudeMessage('assistant', `${claudeIcons.search} ${translations[claudeContext.language].searching} "${query}"...`);
    
    // Multi-source search
    const sources = await Promise.allSettled([
      fetch(`https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json`).then(r => r.json()),
      fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`).then(r => r.json())
    ]);
    
    let results = [];
    
    // DuckDuckGo results
    if (sources[0].status === 'fulfilled' && sources[0].value.AbstractText) {
      results.push({
        source: 'DuckDuckGo',
        text: sources[0].value.AbstractText,
        url: sources[0].value.AbstractURL
      });
    }
    
    // Wikipedia results
    if (sources[1].status === 'fulfilled' && sources[1].value.extract) {
      results.push({
        source: 'Wikipedia',
        text: sources[1].value.extract,
        url: sources[1].value.content_urls?.desktop?.page
      });
    }
    
    if (results.length === 0) {
      addClaudeMessage('assistant', `❌ No results found for "${query}". Try:\n• Different keywords\n• More specific terms\n• Check spelling`);
      return;
    }
    
    let message = `📝 **Search Results for "${query}":**\n\n`;
    results.forEach((r, i) => {
      message += `**${i + 1}. ${r.source}**\n${r.text.slice(0, 300)}${r.text.length > 300 ? '...' : ''}\n${r.url ? `🔗 [Read more](${r.url})` : ''}\n\n`;
    });
    
    addClaudeMessage('assistant', message);
    speak(results[0].text.slice(0, 200));
    
  } catch (e) {
    console.error('Search error:', e);
    addClaudeMessage('assistant', `❌ ${translations[claudeContext.language].error}`);
  }
}

// ===== WEATHER API =====
async function getWeather(location = null) {
  try {
    let weatherData;
    
    if (!location) {
      // Get user location
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });
      
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;
      
      // Using Open-Meteo (no API key required)
      const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&temperature_unit=celsius`);
      weatherData = await response.json();
    }
    
    const temp = weatherData.current_weather.temperature;
    const windSpeed = weatherData.current_weather.windspeed;
    const weatherCode = weatherData.current_weather.weathercode;
    
    const weatherEmoji = weatherCode === 0 ? '☀️' : 
                        weatherCode <= 3 ? '⛅' :
                        weatherCode <= 67 ? '🌧️' : 
                        weatherCode <= 77 ? '🌨️' : '⛈️';
    
    const message = `${claudeIcons.weather} **Weather Report**\n\n${weatherEmoji} Temperature: ${temp}°C\n💨 Wind: ${windSpeed} km/h\n\n${temp > 25 ? 'Stay hydrated! 💧' : temp < 10 ? 'Bundle up! 🧥' : 'Perfect weather! 😊'}`;
    
    addClaudeMessage('assistant', message);
    speak(`Current temperature is ${temp} degrees celsius`);
    
  } catch (e) {
    addClaudeMessage('assistant', '❌ Could not fetch weather. Please enable location access.');
  }
}

// ===== NEWS FEED =====
async function getNews(topic = 'technology') {
  try {
    addClaudeMessage('assistant', `${claudeIcons.news} Fetching latest ${topic} news...`);
    
    // Using NewsAPI alternative (GNews - free tier)
    // Note: In production, you'd need an API key
    const response = await fetch(`https://gnews.io/api/v4/search?q=${topic}&lang=en&max=5&apikey=YOUR_API_KEY`);
    const data = await response.json();
    
    if (!data.articles || data.articles.length === 0) {
      addClaudeMessage('assistant', 'No news found. Using fallback...');
      // Fallback: Use Wikipedia current events
      const wikiResponse = await fetch('https://en.wikipedia.org/api/rest_v1/page/summary/Current_events');
      const wikiData = await wikiResponse.json();
      addClaudeMessage('assistant', `📰 **Latest Updates:**\n\n${wikiData.extract}\n\n🔗 [More on Wikipedia](${wikiData.content_urls.desktop.page})`);
      return;
    }
    
    let message = `📰 **Top ${topic} News:**\n\n`;
    data.articles.slice(0, 5).forEach((article, i) => {
      message += `${i + 1}. **${article.title}**\n${article.description}\n🔗 [Read more](${article.url})\n\n`;
    });
    
    addClaudeMessage('assistant', message);
    
  } catch (e) {console.error('News error:', e);
    addClaudeMessage('assistant', '❌ Could not fetch news. Try again later.');
  }
}

// ===== TRANSLATION SERVICE =====
async function translateText(text, targetLang) {
  try {
    addClaudeMessage('assistant', `${claudeIcons.translate} Translating to ${claudeLanguages[targetLang]?.name || targetLang}...`);
    
    // Using MyMemory Translation API (free, no key required)
    const response = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|${targetLang}`);
    const data = await response.json();
    
    if (data.responseStatus === 200) {
      const translated = data.responseData.translatedText;
      addClaudeMessage('assistant', `${claudeIcons.translate} **Translation:**\n\n📝 Original: ${text}\n🌍 ${claudeLanguages[targetLang]?.flag || ''} ${claudeLanguages[targetLang]?.name || targetLang}: ${translated}`);
      speak(translated);
    } else {
      addClaudeMessage('assistant', '❌ Translation failed. Try a different phrase.');
    }
    
  } catch (e) {
    console.error('Translation error:', e);
    addClaudeMessage('assistant', '❌ Translation service unavailable.');
  }
}

// ===== CURRENCY CONVERTER =====
async function convertCurrency(amount, from, to) {
  try {
    addClaudeMessage('assistant', `💱 Converting ${amount} ${from.toUpperCase()} to ${to.toUpperCase()}...`);
    
    // Using exchangerate-api (free tier)
    const response = await fetch(`https://api.exchangerate-api.com/v4/latest/${from.toUpperCase()}`);
    const data = await response.json();
    
    if (data.rates && data.rates[to.toUpperCase()]) {
      const rate = data.rates[to.toUpperCase()];
      const result = (amount * rate).toFixed(2);
      
      addClaudeMessage('assistant', `💱 **Currency Conversion:**\n\n${amount} ${from.toUpperCase()} = ${result} ${to.toUpperCase()}\n\n📊 Exchange Rate: 1 ${from.toUpperCase()} = ${rate.toFixed(4)} ${to.toUpperCase()}\n⏰ Updated: ${new Date().toLocaleTimeString()}`);
    } else {
      addClaudeMessage('assistant', '❌ Invalid currency code. Use ISO codes (USD, EUR, GBP, etc.)');
    }
    
  } catch (e) {
    console.error('Currency error:', e);
    addClaudeMessage('assistant', '❌ Currency service unavailable.');
  }
}

// ===== DICTIONARY & THESAURUS =====
async function defineWord(word) {
  try {
    addClaudeMessage('assistant', `📖 Looking up "${word}"...`);
    
    // Using Free Dictionary API
    const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
    const data = await response.json();
    
    if (Array.isArray(data) && data.length > 0) {
      const entry = data[0];
      const meaning = entry.meanings[0];
      const definition = meaning.definitions[0];
      
      let message = `📖 **${word}** (${meaning.partOfSpeech})\n\n`;
      message += `**Definition:** ${definition.definition}\n\n`;
      
      if (definition.example) {
        message += `**Example:** "${definition.example}"\n\n`;
      }
      
      if (definition.synonyms && definition.synonyms.length > 0) {
        message += `**Synonyms:** ${definition.synonyms.slice(0, 5).join(', ')}\n\n`;
      }
      
      if (entry.phonetic) {
        message += `**Pronunciation:** ${entry.phonetic}`;
      }
      
      addClaudeMessage('assistant', message);
      speak(definition.definition);
    } else {
      addClaudeMessage('assistant', `❌ Word "${word}" not found in dictionary.`);
    }
    
  } catch (e) {
    console.error('Dictionary error:', e);
    addClaudeMessage('assistant', '❌ Dictionary service unavailable.');
  }
}

// ===== EMAIL DRAFT ASSISTANT =====
function draftEmail(recipient, subject, tone = 'professional', context = '') {
  const templates = {
    professional: {
      greeting: `Dear ${recipient},`,
      closing: 'Best regards,',
      style: 'formal and respectful'
    },
    casual: {
      greeting: `Hi ${recipient},`,
      closing: 'Cheers,',
      style: 'friendly and conversational'
    },
    formal: {
      greeting: `Dear ${recipient},`,
      closing: 'Sincerely,',
      style: 'very formal and official'
    }
  };
  
  const template = templates[tone] || templates.professional;
  
  const draft = `${claudeIcons.email} **Email Draft**\n\n**To:** ${recipient}\n**Subject:** ${subject}\n\n${template.greeting}\n\n[Your message here - ${template.style}]\n\n${context ? `Context: ${context}\n\n` : ''}${template.closing}\n${claudeContext.userName}`;
  
  addClaudeMessage('assistant', draft);
  addClaudeMessage('assistant', '💡 **Tip:** You can customize this draft before sending!');
}

// ===== POMODORO TIMER =====
function startPomodoro(duration = 25) {
  if (pomodoroTimer) {
    addClaudeMessage('assistant', '⏰ A Pomodoro session is already running!');
    return;
  }
  
  addClaudeMessage('assistant', `${claudeIcons.focus} **Pomodoro Started!**\n\n⏰ ${duration} minutes of focused work\n🎯 Stay focused!\n\n💡 I'll notify you when it's break time.`);
  
  focusModeActive = true;
  
  pomodoroTimer = setTimeout(() => {
    focusModeActive = false;
    pomodoroTimer = null;
    
    addClaudeMessage('assistant', `🎉 **Pomodoro Complete!**\n\nGreat work! Take a 5-minute break! 🧘\n\n💧 Drink water\n👀 Rest your eyes\n🚶 Stretch your legs`);
    
    addNotification('Pomodoro Complete!', 'Time for a break!', 'success', '🎉');
    speak('Pomodoro session complete! Time for a break!');
    
    // Auto-start break timer
    setTimeout(() => {
      addClaudeMessage('assistant', '⏰ Break time over! Ready for another session? Say "start pomodoro"');
      addNotification('Break Over', 'Ready to focus again?', 'info', '⏰');
    }, 5 * 60 * 1000); // 5 minutes
    
  }, duration * 60 * 1000);
}

function stopPomodoro() {
  if (pomodoroTimer) {
    clearTimeout(pomodoroTimer);
    pomodoroTimer = null;
    focusModeActive = false;
    addClaudeMessage('assistant', '⏸️ Pomodoro session stopped.');
  } else {
    addClaudeMessage('assistant', 'No active Pomodoro session.');
  }
}

// ===== CLIPBOARD MANAGER =====
function addToClipboard(text) {
  claudeClipboard.unshift({
    id: Date.now(),
    text: text.slice(0, 500), // Limit size
    timestamp: new Date().toISOString()
  });
  
  // Keep only last 20 items
  if (claudeClipboard.length > 20) {
    claudeClipboard = claudeClipboard.slice(0, 20);
  }
  
  saveClaudeKnowledge();
}

async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    addToClipboard(text);
    addClaudeMessage('assistant', `${claudeIcons.clipboard} Copied to clipboard!`);
  } catch (e) {
    addClaudeMessage('assistant', '❌ Could not copy to clipboard.');
  }
}

function showClipboardHistory() {
  if (claudeClipboard.length === 0) {
    addClaudeMessage('assistant', `${claudeIcons.clipboard} **Clipboard History**\n\nNo items yet!`);
    return;
  }
  
  let message = `${claudeIcons.clipboard} **Clipboard History:**\n\n`;
  claudeClipboard.slice(0, 10).forEach((item, i) => {
    const preview = item.text.slice(0, 50);
    const time = new Date(item.timestamp).toLocaleTimeString();
    message += `${i + 1}. ${preview}${item.text.length > 50 ? '...' : ''}\n   ⏰ ${time}\n\n`;
  });
  
  addClaudeMessage('assistant', message);
}

// ===== AI WRITING ASSISTANT =====
function improveWriting(text, mode = 'grammar') {
  const improvements = {
    grammar: {
      prompt: 'Fix grammar and spelling',
      icon: '✏️'
    },
    professional: {
      prompt: 'Make more professional',
      icon: '💼'
    },
    casual: {
      prompt: 'Make more casual and friendly',
      icon: '😊'
    },
    concise: {
      prompt: 'Make more concise',
      icon: '📝'
    },
    elaborate: {
      prompt: 'Add more detail',
      icon: '📖'
    }
  };
  
  const improvement = improvements[mode] || improvements.grammar;
  
  // Simple improvements (would be AI-powered in production)
  let improved = text;
  
  // Grammar fixes
  improved = improved.replace(/\bi\b/g, 'I');
  improved = improved.replace(/\s+/g, ' ');
  improved = improved.trim();
  improved = improved.charAt(0).toUpperCase() + improved.slice(1);
  
  if (!improved.match(/[.!?]$/)) {
    improved += '.';
  }
  
  addClaudeMessage('assistant', `${improvement.icon} **Writing Improved** (${mode})\n\n**Original:**\n${text}\n\n**Improved:**\n${improved}\n\n💡 Want to try another style? Available: grammar, professional, casual, concise, elaborate`);
}

function summarizeText(text, length = 'short') {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim());
  
  let summaryLength;
  if (length === 'short') summaryLength = Math.ceil(sentences.length * 0.3);
  else if (length === 'medium') summaryLength = Math.ceil(sentences.length * 0.5);
  else summaryLength = Math.ceil(sentences.length * 0.7);
  
  const summary = sentences.slice(0, summaryLength).join('. ') + '.';
  
  addClaudeMessage('assistant', `📝 **Text Summary** (${length})\n\n${summary}\n\n📊 Original: ${text.length} chars | Summary: ${summary.length} chars\nReduction: ${Math.round((1 - summary.length / text.length) * 100)}%`);
}

// ===== PRODUCTIVITY ANALYTICS =====
function showProductivityDashboard() {
  const sessionMinutes = Math.floor((Date.now() - claudeContext.sessionStart) / 60000);
  const pendingTasks = claudeTasks.filter(t => !t.completed).length;
  const completedTasks = claudeTasks.filter(t => t.completed).length;
  const totalHabits = claudeHabits.length;
  const avgStreak = claudeHabits.length > 0 ? 
    Math.round(claudeHabits.reduce((sum, h) => sum + h.streak, 0) / claudeHabits.length) : 0;
  
  const message = `${claudeIcons.chart} **Productivity Dashboard**\n\n⏱️ **Session:** ${sessionMinutes} minutes\n💬 **Commands:** ${claudeContext.commandCount}\n\n📋 **Tasks:**\n   • Pending: ${pendingTasks}\n   • Completed: ${completedTasks}\n   • Completion Rate: ${completedTasks > 0 ? Math.round(completedTasks / (pendingTasks + completedTasks) * 100) : 0}%\n\n🎯 **Habits:**\n   • Tracked: ${totalHabits}\n   • Avg Streak: ${avgStreak} days\n\n🏆 **Achievement:** ${completedTasks >= 5 ? 'Task Master 🌟' : completedTasks >= 3 ? 'Getting Things Done 💪' : 'Just Getting Started 🚀'}\n\n💡 **Insight:** ${sessionMinutes > 60 ? 'Take a break soon!' : pendingTasks > 5 ? 'Focus on high-priority tasks!' : 'Great pace!'}`;
  
  addClaudeMessage('assistant', message);
}

// ===== FOCUS MODE =====
function toggleFocusMode() {
  focusModeActive = !focusModeActive;
  
  if (focusModeActive) {
    addClaudeMessage('assistant', `${claudeIcons.focus} **Focus Mode Activated**\n\n🔕 Notifications muted\n🎯 Distractions minimized\n⏰ Good luck!\n\nSay "stop focus mode" when done.`);
    
    // Mute notifications
    const notifCenter = document.getElementById('notification-center');
    if (notifCenter) notifCenter.style.display = 'none';
    
  } else {
    addClaudeMessage('assistant', `✅ **Focus Mode Deactivated**\n\nWelcome back! Hope you got lots done! 🎉`);
    
    // Restore notifications
    const notifCenter = document.getElementById('notification-center');
    if (notifCenter) notifCenter.style.display = '';
  }
}

// ===== PERSONALITY SWITCHER =====
function changePersonality(mode) {
  if (!claudePersonalities[mode]) {
    addClaudeMessage('assistant', `❌ Unknown personality mode. Available: ${Object.keys(claudePersonalities).join(', ')}`);
    return;
  }
  
  claudeContext.personalityMode = mode;
  saveClaudeKnowledge();
  
  const personality = claudePersonalities[mode];
  const greeting = personality.greetings[Math.floor(Math.random() * personality.greetings.length)];
  
  addClaudeMessage('assistant', `🎭 **Personality Changed to ${mode.charAt(0).toUpperCase() + mode.slice(1)}**\n\n${greeting}`);
}

// ===== LANGUAGE SWITCHER =====
function changeLanguage(lang) {
  if (!claudeLanguages[lang]) {
    addClaudeMessage('assistant', `❌ Language not supported. Available: ${Object.keys(claudeLanguages).map(l => `${claudeLanguages[l].flag} ${claudeLanguages[l].name}`).join(', ')}`);
    return;
  }
  
  claudeContext.language = lang;
  saveClaudeKnowledge();
  
  const langInfo = claudeLanguages[lang];
  addClaudeMessage('assistant', `${langInfo.flag} **Language changed to ${langInfo.name}**\n\n${translations[lang].greeting}`);
  speak(translations[lang].greeting);
}

// ===== ADVANCED SCREENSHOT ANALYSIS =====
async function captureAndAnalyzeScreen() {
  try {
    const hasAccess = await requestPermission(
      'Comfort Claude',
      'camera',
      'I need screen capture permission to analyze what you\'re seeing.'
    );

    if (!hasAccess) {
      addClaudeMessage('assistant', '❌ I need permission to capture the screen. Please allow access!');
      return;
    }

    addClaudeMessage('assistant', '📸 Capturing screenshot... analyzing what I see!');

    const canvas = await html2canvas(document.body);
    const imageData = canvas.toDataURL('image/png');
    
    analyzeScreenshot(imageData);

  } catch (e) {
    console.error('Screenshot error:', e);
    addClaudeMessage('assistant', '❌ Failed to capture screenshot. Error: ' + e.message);
  }
}

function analyzeScreenshot(imageData) {
  const openApps = Object.keys(windows).map(id => {
    const info = windowTaskbarMap[id];
    return info ? info.label : id;
  });

  const theme = document.body.classList.contains('dark-theme') ? 'Dark' : 'Light';
  const currentBgAnimation = bgAnimation && bgAnimation.type ? bgAnimation.type : 'None';
  const notifications = document.querySelectorAll('.notification-item').length;
  const time = new Date().toLocaleTimeString();
  
  // Advanced analysis
  const taskbarItems = document.querySelectorAll('.taskbar-icon').length;
  const desktopIcons = document.querySelectorAll('.desktop-icons .icon').length;
  const activeWindows = Object.keys(windows).filter(id => {
    const win = document.getElementById(id);
    return win && win.classList.contains('active');
  }).length;

  let analysis = `📊 **Advanced Screenshot Analysis:**\n\n`;
  
  // System Status
  analysis += `**System:**\n`;
  analysis += `🎨 Theme: ${theme} mode\n`;
  analysis += `✨ Animation: ${currentBgAnimation}\n`;
  analysis += `⏰ Time: ${time}\n\n`;
  
  // Desktop Layout
  analysis += `**Desktop:**\n`;
  analysis += `🖥️ Icons: ${desktopIcons}\n`;
  analysis += `📦 Taskbar Apps: ${taskbarItems}\n`;
  analysis += `🪟 Open Windows: ${openApps.length}\n`;
  analysis += `✅ Active Windows: ${activeWindows}\n\n`;
  
  // Apps
  if (openApps.length > 0) {
    analysis += `**Open Apps:**\n${openApps.map(app => `• ${app}`).join('\n')}\n\n`;
  }
  
  // Notifications
  analysis += `🔔 **Notifications:** ${notifications} unread\n\n`;
  
  // AI Insights
  analysis += `**💡 AI Insights:**\n`;
  
  if (openApps.length === 0) {
    analysis += `• Clean workspace - ready for productivity!\n`;
    analysis += `• Consider opening InspireBoard for ideas\n`;
  } else if (openApps.length > 3) {
    analysis += `• Multiple apps open - might affect focus\n`;
    analysis += `• Consider closing unused apps\n`;
  } else {
    analysis += `• Good app balance - productive setup!\n`;
  }
  
  if (theme === 'Dark' && parseInt(time.split(':')[0]) < 18) {
    analysis += `• Using dark mode during day - easy on eyes! 👀\n`;
  }
  
  if (notifications > 5) {
    analysis += `• Many unread notifications - time to clear them?\n`;
  }
  
  addClaudeMessage('assistant', analysis);

  // Save screenshot
  const a = document.createElement('a');
  a.href = imageData;
  a.download = `bluebird-analysis-${Date.now()}.png`;
  a.click();

  addNotification('Screenshot Saved', 'Screenshot analyzed and saved!', 'success', '📸');
  speak('Screenshot analysis complete');
}

// ===== SAFE CODE EXECUTION =====
function executeCode(code, language = 'javascript') {
  addClaudeMessage('assistant', `⚙️ Executing ${language} code...`);

  try {
    if (language === 'javascript' || language === 'js') {
      const result = new Function(code)();
      addClaudeMessage('assistant', `✅ **Code executed successfully!**\n\n**Result:**\n\`\`\`json\n${JSON.stringify(result, null, 2)}\n\`\`\``);
    } else if (language === 'math' || language === 'calc') {
      const result = Function('"use strict"; return (' + code + ')')();
      addClaudeMessage('assistant', `🧮 **Calculation Result:** ${result}`);
      speak(`The result is ${result}`);
    } else {
      addClaudeMessage('assistant', `Currently I can only execute JavaScript code. Other languages coming soon!`);
    }
  } catch (e) {
    addClaudeMessage('assistant', `❌ **Execution Error:**\n\n\`\`\`\n${e.message}\n\`\`\`\n\n💡 Make sure your code is valid ${language}!`);
  }
}

// ===== CALENDAR INTEGRATION =====
let claudeCalendar = [];

function loadCalendar() {
  try {
    const saved = localStorage.getItem('claude-calendar');
    if (saved) {
      claudeCalendar = JSON.parse(saved);
    }
  } catch(e) {
    console.error('Failed to load calendar:', e);
  }
}

function saveCalendar() {
  localStorage.setItem('claude-calendar', JSON.stringify(claudeCalendar));
}

function addCalendarEvent(title, date, time, description = '') {
  const event = {
    id: Date.now(),
    title,
    date,
    time,
    description,
    created: new Date().toISOString()
  };

  claudeCalendar.push(event);
  saveCalendar();

  addClaudeMessage('assistant', `${claudeIcons.calendar} **Event Added!**\n\n📅 ${title}\n🕐 ${date} at ${time}\n${description ? `📝 ${description}` : ''}\n\nI'll remind you about this! 🔔`);
  
  setEventReminder(event);
}

function setEventReminder(event) {
  const eventDateTime = new Date(`${event.date} ${event.time}`);
  const now = new Date();
  const timeDiff = eventDateTime - now;

  if (timeDiff > 0) {
    const reminderTime = timeDiff - (15 * 60 * 1000);
    
    if (reminderTime > 0) {
      setTimeout(() => {
        addNotification(
          `Upcoming: ${event.title}`,
          `In 15 minutes at ${event.time}`,
          'info',
          '📅'
        );
        
        speak(`Reminder: ${event.title} in 15 minutes`);
        
        if (window.Notification && Notification.permission === 'granted') {
          new Notification('Bluebird OS Reminder', {
            body: `${event.title} at ${event.time}`,
            icon: '📅'
          });
        }
      }, reminderTime);
    }
  }
}

function listUpcomingEvents() {
  const now = new Date();
  const upcoming = claudeCalendar.filter(e => {
    const eventDate = new Date(`${e.date} ${e.time}`);
    return eventDate > now;
  }).sort((a, b) => new Date(`${a.date} ${a.time}`) - new Date(`${b.date} ${b.time}`));

  if (upcoming.length === 0) {
    addClaudeMessage('assistant', `${claudeIcons.calendar} **Calendar**\n\nNo upcoming events! Your schedule is clear. Want to add something?`);
    return;
  }

  let message = `${claudeIcons.calendar} **Upcoming Events:**\n\n`;
  upcoming.slice(0, 5).forEach((e, i) => {
    message += `${i + 1}. **${e.title}**\n   📅 ${e.date} at ${e.time}\n   ${e.description ? `📝 ${e.description}\n` : ''}\n`;
  });

  if (upcoming.length > 5) {
    message += `\n...and ${upcoming.length - 5} more events`;
  }

  addClaudeMessage('assistant', message);
}

function parseNaturalDate(dateStr) {
  const lower = dateStr.toLowerCase();
  const now = new Date();

  if (lower.includes('today')) {
    return now.toISOString().split('T')[0];
  } else if (lower.includes('tomorrow')) {
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  } else if (lower.includes('next week')) {
    const nextWeek = new Date(now);
    nextWeek.setDate(nextWeek.getDate() + 7);
    return nextWeek.toISOString().split('T')[0];
  } else if (lower.match(/\d{4}-\d{2}-\d{2}/)) {
    return lower.match(/\d{4}-\d{2}-\d{2}/)[0];
  }

  return null;
}

// ===== LOAD/SAVE ENHANCED =====
function loadClaudeKnowledge() {
  try {
    const saved = localStorage.getItem('claude-knowledge');
    if (saved) {
      claudeKnowledge = JSON.parse(saved);
      updateKnowledgeDisplay();
    }
    
    const history = localStorage.getItem('claude-conversation-history');
    if (history) {
      claudeConversationHistory = JSON.parse(history);
    }
    
    const context = localStorage.getItem('claude-context');
    if (context) {
      const savedContext = JSON.parse(context);
      claudeContext = { ...claudeContext, ...savedContext };
    }
    
    const tasks = localStorage.getItem('claude-tasks');
    if (tasks) {
      claudeTasks = JSON.parse(tasks);
    }
    
    const habits = localStorage.getItem('claude-habits');
    if (habits) {
      claudeHabits = JSON.parse(habits);
    }
    
    const goals = localStorage.getItem('claude-goals');
    if (goals) {
      claudeGoals = JSON.parse(goals);
    }
    
    const clipboard = localStorage.getItem('claude-clipboard');
    if (clipboard) {
      claudeClipboard = JSON.parse(clipboard);
    }
    
  } catch(e) {
    console.error('Failed to load knowledge:', e);
  }
}

function saveClaudeKnowledge() {
  try {
    localStorage.setItem('claude-knowledge', JSON.stringify(claudeKnowledge));
    localStorage.setItem('claude-conversation-history', JSON.stringify(claudeConversationHistory.slice(-100)));
    localStorage.setItem('claude-context', JSON.stringify(claudeContext));
    localStorage.setItem('claude-tasks', JSON.stringify(claudeTasks));
    localStorage.setItem('claude-habits', JSON.stringify(claudeHabits));
    localStorage.setItem('claude-goals', JSON.stringify(claudeGoals));
    localStorage.setItem('claude-clipboard', JSON.stringify(claudeClipboard.slice(0, 20)));
  } catch(e) {
    console.error('Failed to save knowledge:', e);
  }
}
// Continue in next message...// Continue from Part 1...
// Smart context detection
function detectUserIntent(message) {
  const lower = message.toLowerCase();
  
  // Sentiment analysis
  const positiveWords = ['thanks', 'thank you', 'awesome', 'great', 'good', 'nice', 'love', 'excellent', 'perfect'];
  const negativeWords = ['bad', 'terrible', 'awful', 'hate', 'broken', 'error', 'problem', 'issue', 'help'];
  const questionWords = ['what', 'how', 'why', 'when', 'where', 'who', 'can', 'could', 'would', 'should'];
  
  const sentiment = positiveWords.some(w => lower.includes(w)) ? 'positive' :
                   negativeWords.some(w => lower.includes(w)) ? 'negative' :
                   questionWords.some(w => lower.startsWith(w)) ? 'question' : 'neutral';
  
  claudeContext.userMood = sentiment;
  
  // Intent detection
  if (lower.match(/\b(hi|hello|hey|greetings|good morning|good afternoon)\b/)) {
    return { type: 'greeting', sentiment };
  }
  
  if (lower.match(/\b(thanks|thank you|thx|appreciate)\b/)) {
    return { type: 'thanks', sentiment };
  }
  
  if (lower.match(/\b(how are you|what's up|wassup|how do you feel)\b/)) {
    return { type: 'wellbeing', sentiment };
  }
  
  if (lower.match(/\b(joke|funny|laugh|humor|make me laugh)\b/)) {
    return { type: 'joke', sentiment };
  }
  
  if (lower.match(/\b(you are|you're) (smart|good|great|awesome|amazing|cool|brilliant)\b/)) {
    return { type: 'compliment', sentiment };
  }
  
  if (lower.match(/\b(open|launch|start|run|show)\b/)) {
    return { type: 'open_command', sentiment };
  }
  
  if (lower.match(/\b(close|exit|quit|shutdown|kill)\b/)) {
    return { type: 'close_command', sentiment };
  }
  
  if (lower.match(/\b(change|switch|toggle|set) (theme|wallpaper|background|animation)\b/)) {
    return { type: 'system_command', sentiment };
  }
  
  if (lower.match(/\b(what|how|why|when|where|who|can|could)\b/)) {
    return { type: 'question', sentiment };
  }
  
  if (lower.match(/\b(teach|learn|remember|correction|wrong|mistake)\b/)) {
    return { type: 'learning', sentiment };
  }
  
  return { type: 'general', sentiment };
}
// ===== ADVANCED COMMAND PROCESSOR =====
function processAdvancedCommand(message) {
  const lower = message.toLowerCase();
  const intent = detectUserIntent(message);
  
  // ===== WEB SEARCH =====
  if (lower.includes('search for') || lower.includes('look up') || lower.includes('find information about')) {
    const searchQuery = message.replace(/search for|look up|find information about/gi, '').trim();
    if (searchQuery) {
      searchWeb(searchQuery);
    } else {
      addClaudeMessage('assistant', 'What would you like me to search for? 🔍');
    }
    return;
  }
  
  // ===== WEATHER =====
  if (lower.includes('weather') || lower.includes('temperature')) {
    getWeather();
    return;
  }
  
  // ===== NEWS =====
  if (lower.includes('news') || lower.includes('headlines')) {
    const topicMatch = message.match(/news about (.+)|(.+) news/i);
    const topic = topicMatch ? (topicMatch[1] || topicMatch[2]) : 'technology';
    getNews(topic);
    return;
  }
  
  // ===== TRANSLATION =====
  if (lower.includes('translate')) {
    const translateMatch = message.match(/translate ['""](.+?)['""] to (\w+)|translate (.+) to (\w+)/i);
    if (translateMatch) {
      const text = translateMatch[1] || translateMatch[3];
      const targetLang = translateMatch[2] || translateMatch[4];
      translateText(text, targetLang);
    } else {
      addClaudeMessage('assistant', `To translate, say: "translate 'hello' to es" or "translate hello to spanish"`);
    }
    return;
  }
  
  // ===== CURRENCY CONVERSION =====
  if (lower.includes('convert') && (lower.includes('usd') || lower.includes('eur') || lower.includes('gbp'))) {
    const currencyMatch = message.match(/convert (\d+(?:\.\d+)?)\s*(\w+)\s+to\s+(\w+)/i);
    if (currencyMatch) {
      const amount = parseFloat(currencyMatch[1]);
      const from = currencyMatch[2];
      const to = currencyMatch[3];
      convertCurrency(amount, from, to);
    } else {
      addClaudeMessage('assistant', 'Format: "convert 100 USD to EUR"');
    }
    return;
  }
  
  // ===== DICTIONARY =====
  if (lower.includes('define ') || lower.includes('what does ') || lower.includes('meaning of')) {
    const wordMatch = message.match(/define\s+(\w+)|what does\s+(\w+)\s+mean|meaning of\s+(\w+)/i);
    if (wordMatch) {
      const word = wordMatch[1] || wordMatch[2] || wordMatch[3];
      defineWord(word);
    } else {
      addClaudeMessage('assistant', 'Which word would you like me to define?');
    }
    return;
  }
  
  // ===== SCREENSHOT =====
  if (lower.includes('screenshot') || lower.includes('analyze screen') || lower.includes('what do you see')) {
    captureAndAnalyzeScreen();
    return;
  }
  
  // ===== CODE EXECUTION =====
  if (lower.includes('execute') || lower.includes('run code') || lower.includes('eval')) {
    const codeMatch = message.match(/```(\w+)?\n([\s\S]+?)```|`([^`]+)`|"([^"]+)"/);
    
    if (codeMatch) {
      const language = codeMatch[1] || 'javascript';
      const code = codeMatch[2] || codeMatch[3] || codeMatch[4];
      executeCode(code.trim(), language);
    } else {
      addClaudeMessage('assistant', `To execute code, format it like this:\n\n\`\`\`javascript\nconsole.log("Hello!");\n\`\`\`\n\nOr use backticks: \`alert("Hi")\``);
    }
    return;
  }
  
  // ===== QUICK CALCULATIONS =====
  if (lower.match(/^(calc|calculate|compute|math)\s+/)) {
    const expression = message.replace(/^(calc|calculate|compute|math)\s+/i, '');
    executeCode(expression, 'math');
    return;
  }
  
  // ===== TASKS =====
  if (lower.includes('add task') || lower.includes('create task') || lower.includes('new task')) {
    const taskMatch = message.match(/(?:add|create|new) task:?\s*(.+?)(?:\s+priority\s+(high|medium|low))?(?:\s+due\s+(.+))?$/i);
    if (taskMatch) {
      const title = taskMatch[1].trim();
      const priority = taskMatch[2] || 'medium';
      const dueDate = taskMatch[3] || null;
      addTask(title, priority, dueDate);
    } else {
      addClaudeMessage('assistant', 'Format: "add task: Task name" or "add task: Task name priority high due tomorrow"');
    }
    return;
  }
  
  if (lower.includes('my tasks') || lower.includes('list tasks') || lower.includes('show tasks')) {
    const filter = lower.includes('completed') ? 'completed' : lower.includes('pending') ? 'pending' : 'all';
    listTasks(filter);
    return;
  }
  
  // ===== HABITS =====
  if (lower.includes('add habit') || lower.includes('track habit')) {
    const habitMatch = message.match(/(?:add|track) habit:?\s*(.+?)(?:\s+(daily|weekly|monthly))?$/i);
    if (habitMatch) {
      const name = habitMatch[1].trim();
      const frequency = habitMatch[2] || 'daily';
      addHabit(name, frequency);
    } else {
      addClaudeMessage('assistant', 'Format: "add habit: Exercise daily" or "track habit: Read books weekly"');
    }
    return;
  }
  
  if (lower.includes('my habits') || lower.includes('list habits')) {
    listHabits();
    return;
  }
  
  if (lower.includes('check habit')) {
    if (claudeHabits.length === 0) {
      addClaudeMessage('assistant', 'No habits to check! Add one with "add habit: [name]"');
      return;
    }
    // Check the first habit for simplicity
    checkHabit(claudeHabits[0].id);
    return;
  }
  
  // ===== GOALS =====
  if (lower.includes('set goal') || lower.includes('add goal')) {
    const goalMatch = message.match(/(?:set|add) goal:?\s*(.+?)(?:\s+by\s+(.+))?$/i);
    if (goalMatch) {
      const title = goalMatch[1].trim();
      const deadline = goalMatch[2] || 'No deadline';
      addGoal(title, deadline);
    } else {
      addClaudeMessage('assistant', 'Format: "set goal: Learn Python by December 31"');
    }
    return;
  }
  
  // ===== CALENDAR =====
  if (lower.includes('add event') || lower.includes('schedule') || lower.includes('remind me')) {
    const eventMatch = message.match(/(?:add event|schedule|remind me)\s+(.+?)\s+(?:on|at|for)?\s*(.+)/i);
    
    if (eventMatch) {
      const title = eventMatch[1].trim();
      const dateTimeStr = eventMatch[2].trim();
      
      const date = parseNaturalDate(dateTimeStr) || new Date().toISOString().split('T')[0];
      const timeMatch = dateTimeStr.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i);
      const time = timeMatch ? `${timeMatch[1].padStart(2, '0')}:${timeMatch[2] || '00'}` : '12:00';
      
      addCalendarEvent(title, date, time);
    } else {
      addClaudeMessage('assistant', `To add an event, try:\n• "Add event Meeting tomorrow at 3pm"\n• "Schedule Team call on 2024-12-25 at 10:00"\n• "Remind me Workout today at 6pm"`);
    }
    return;
  }
  
  if (lower.includes('my calendar') || lower.includes('upcoming events') || lower.includes('what\'s scheduled')) {
    listUpcomingEvents();
    return;
  }
  
  // ===== EMAIL DRAFT =====
  if (lower.includes('draft email') || lower.includes('write email')) {
    const emailMatch = message.match(/(?:draft|write) email to (.+?)(?:\s+about\s+(.+?))?(?:\s+(professional|casual|formal))?$/i);
    if (emailMatch) {
      const recipient = emailMatch[1].trim();
      const subject = emailMatch[2] || 'No subject';
      const tone = emailMatch[3] || 'professional';
      draftEmail(recipient, subject, tone);
    } else {
      addClaudeMessage('assistant', 'Format: "draft email to John about Project Update professional"');
    }
    return;
  }
  
  // ===== POMODORO =====
  if (lower.includes('start pomodoro') || lower.includes('pomodoro timer')) {
    const durationMatch = message.match(/(\d+)\s*min/i);
    const duration = durationMatch ? parseInt(durationMatch[1]) : 25;
    startPomodoro(duration);
    return;
  }
  
  if (lower.includes('stop pomodoro')) {
    stopPomodoro();
    return;
  }
  
  // ===== FOCUS MODE =====
  if (lower.includes('focus mode') || lower.includes('start focus')) {
    toggleFocusMode();
    return;
  }
  
  // ===== CLIPBOARD =====
  if (lower.includes('clipboard history') || lower.includes('show clipboard')) {
    showClipboardHistory();
    return;
  }
  
  if (lower.includes('copy ')) {
    const textToCopy = message.replace(/copy\s+/i, '');
    copyToClipboard(textToCopy);
    return;
  }
  
  // ===== WRITING ASSISTANT =====
  if (lower.includes('improve') || lower.includes('fix grammar') || lower.includes('make professional')) {
    const mode = lower.includes('grammar') ? 'grammar' :
                 lower.includes('professional') ? 'professional' :
                 lower.includes('casual') ? 'casual' :
                 lower.includes('concise') ? 'concise' : 'grammar';
    
    const textMatch = message.match(/(?:improve|fix grammar for|make professional)\s+['""](.+)['""]|(?:improve|fix)\s+(.+)/i);
    if (textMatch) {
      const text = textMatch[1] || textMatch[2];
      improveWriting(text, mode);
    } else {
      addClaudeMessage('assistant', 'Format: "improve "your text here"" or "fix grammar for your text"');
    }
    return;
  }
  
  if (lower.includes('summarize')) {
    const textMatch = message.match(/summarize\s+['""](.+)['""]|summarize\s+(.+)/i);
    const length = lower.includes('short') ? 'short' : lower.includes('long') ? 'long' : 'medium';
    
    if (textMatch) {
      const text = textMatch[1] || textMatch[2];
      summarizeText(text, length);
    } else {
      addClaudeMessage('assistant', 'Format: "summarize "your long text here""');
    }
    return;
  }
  
  // ===== PERSONALITY & LANGUAGE =====
  if (lower.includes('change personality') || lower.includes('switch to')) {
    const modes = ['professional', 'casual', 'motivational', 'funny'];
    const mode = modes.find(m => lower.includes(m));
    if (mode) {
      changePersonality(mode);
    } else {
      addClaudeMessage('assistant', `Available personalities: ${modes.join(', ')}`);
    }
    return;
  }
  
  if (lower.includes('change language') || lower.includes('switch language')) {
    const langs = Object.keys(claudeLanguages);
    const lang = langs.find(l => lower.includes(l) || lower.includes(claudeLanguages[l].name.toLowerCase()));
    if (lang) {
      changeLanguage(lang);
    } else {
      addClaudeMessage('assistant', `Available languages: ${langs.map(l => `${claudeLanguages[l].flag} ${claudeLanguages[l].name}`).join(', ')}`);
    }
    return;
  }
  
  // ===== ANALYTICS =====
  if (lower.includes('dashboard') || lower.includes('my stats') || lower.includes('productivity')) {
    showProductivityDashboard();
    return;
  }
  
  // ===== Now handle intent-based responses =====
  switch(intent.type) {
    case 'greeting':
      const personality = claudePersonalities[claudeContext.personalityMode];
      const greeting = personality.greetings[Math.floor(Math.random() * personality.greetings.length)];
      addClaudeMessage('assistant', greeting);
      speak(greeting);
      
      if (claudeContext.commandCount === 1) {
        setTimeout(() => {
          addClaudeMessage('assistant', "💡 **Quick Tips:**\n• Say 'help' to see what I can do\n• 'search for [topic]' to search the web\n• 'add task: [task]' to create tasks\n• 'my dashboard' for productivity insights");
        }, 1500);
      }
      return;
      
    case 'thanks':
      const personality2 = claudePersonalities[claudeContext.personalityMode];
      const thanks = personality2.thanks[Math.floor(Math.random() * personality2.thanks.length)];
      addClaudeMessage('assistant', thanks);
      speak(thanks);
      return;
      
    case 'wellbeing':
      addClaudeMessage('assistant', "I'm doing great, thanks for asking! 😊 I'm here, energized, and ready to help you accomplish amazing things. How about you? How can I make your day better?");
      speak("I'm doing great! How can I help you today?");
      return;
      
    case 'joke':
      const personality3 = claudePersonalities[claudeContext.personalityMode];
      const joke = personality3.jokes?.[Math.floor(Math.random() * personality3.jokes.length)] || claudePersonalities.funny.greetings[0];
      addClaudeMessage('assistant', joke);
      speak(joke);
      setTimeout(() => {
        addClaudeMessage('assistant', "😄 Hope that made you smile! Want to hear another one or shall we get back to work?");
      }, 1500);
      return;
      
    case 'compliment':
      const personality4 = claudePersonalities[claudeContext.personalityMode];
      const compliment = personality4.thanks[Math.floor(Math.random() * personality4.thanks.length)];
      addClaudeMessage('assistant', compliment + " You're awesome too! 🌟");
      return;
      
    case 'open_command':
      handleOpenCommand(lower);
      return;
      
    case 'close_command':
      handleCloseCommand(lower);
      return;
      
    case 'system_command':
      handleSystemCommand(lower);
      return;
      
    case 'learning':
      handleLearning(message);
      return;
      
    case 'question':
      handleQuestion(message);
      return;
      
    default:
      handleGeneralQuery(message);
  }
}

// ===== HELPER FUNCTIONS =====
function handleOpenCommand(lower) {
  let appOpened = false;
  
  if (lower.includes('resume') || lower.includes('cv')) {
    openWindow('resume-win');
    addClaudeMessage('assistant', '✅ Opening your Resume. Looking good! Want me to help you update anything?');
    appOpened = true;
  } else if (lower.includes('project')) {
    openWindow('projects-win');
    addClaudeMessage('assistant', '✅ Opening Projects. Your portfolio is impressive! Which project would you like to work on?');
    appOpened = true;
  } else if (lower.includes('connect') || lower.includes('contact')) {
    openWindow('connect-win');
    addClaudeMessage('assistant', '✅ Opening Connect. Ready to network! Need help drafting a message?');
    appOpened = true;
  } else if (lower.includes('setting') || lower.includes('preference')) {
    openWindow('settings-win');
    addClaudeMessage('assistant', '✅ Opening Settings. Let\'s customize your experience! What would you like to change?');
    appOpened = true;
  } else if (lower.includes('inspire') || lower.includes('idea')) {
    openWindow('inspireboard-win');
    addClaudeMessage('assistant', '✅ Opening InspireBoard. Time to capture those brilliant ideas! 💡 What\'s inspiring you today?');
    appOpened = true;
  } else if (lower.includes('terminal') || lower.includes('shell') || lower.includes('command')) {
    openBirdShell();
    addClaudeMessage('assistant', '✅ Opening BirdShell Terminal. Feeling powerful? 💪 Let me know if you need help with commands!');
    appOpened = true;
  }
  
  if (!appOpened) {
    for (const [appKey, appData] of Object.entries(installedApps)) {
      if (lower.includes(appData.manifest.name.toLowerCase())) {
        openApp(appKey);
        addClaudeMessage('assistant', `✅ Opening ${appData.manifest.name}. Enjoy!`);
        appOpened = true;
        break;
      }
    }
  }
  
  if (!appOpened) {
    const suggestion = `I couldn't find that app. Available apps: Resume, Projects, Connect, Settings, InspireBoard, BirdShell${Object.keys(installedApps).length > 0 ? ', and ' + Object.values(installedApps).map(a => a.manifest.name).join(', ') : ''}. Which one would you like?`;
    addClaudeMessage('assistant', suggestion);
  }
}

function handleCloseCommand(lower) {
  if (lower.includes('all') || lower.includes('everything')) {
    const openWindows = Object.keys(windows);
    if (openWindows.length === 0) {
      addClaudeMessage('assistant', 'No windows are currently open. Clean desktop! 🎯');
      return;
    }
    
    openWindows.forEach(winId => closeWindow(winId));
    addClaudeMessage('assistant', `✅ Closed ${openWindows.length} window${openWindows.length > 1 ? 's' : ''}. All tidy now!`);
  } else {
    const wins = Object.keys(windows);
    if (wins.length === 0) {
      addClaudeMessage('assistant', 'No windows to close.');
      return;
    }
    
    wins.forEach(winId => minimizeWindow(winId));
    addClaudeMessage('assistant', `✅ Minimized all windows. Still running in the taskbar!`);
  }
}

function handleSystemCommand(lower) {
  if (lower.includes('theme') || lower.includes('dark') || lower.includes('light')) {
    toggleTheme();
    const currentTheme = document.body.classList.contains('dark-theme') ? 'dark' : 'light';
    addClaudeMessage('assistant', `✅ Switched to ${currentTheme} theme. Looking ${currentTheme === 'dark' ? 'sleek' : 'bright'}! ✨`);
  } else if (lower.includes('wallpaper') || lower.includes('background')) {
    cycleWallpaper();
    addClaudeMessage('assistant', '✅ Changed wallpaper. Fresh new look! Want me to cycle through more?');
  } else if (lower.includes('animation') || lower.includes('effect') || lower.includes('particle')) {
    addClaudeMessage('assistant', '🎨 To change animations, open Settings and go to "Background Animations". You can choose from snow, bubbles, stars, rain, and more! Want me to open Settings for you?');
  } else if (lower.includes('caption') || lower.includes('subtitle')) {
    toggleLiveCaptions();
    addClaudeMessage('assistant', '✅ Toggled Live Captions. You can now see real-time transcription of audio! 🎤');
  } else if (lower.includes('lock')) {
    lockScreen();
    addClaudeMessage('assistant', '🔒 Locking screen. Stay secure!');
  } else {
    addClaudeMessage('assistant', 'I can help with: theme, wallpaper, animations, captions, or locking. What would you like to change?');
  }
}

function handleLearning(message) {
  if (message.toLowerCase().startsWith('remember:') || message.toLowerCase().startsWith('learn:')) {
    const fact = message.split(':')[1].trim();
    const key = `learned_${Date.now()}`;
    claudeKnowledge[key] = {
      type: 'learned',
      content: fact,
      added: new Date().toISOString()
    };
    saveClaudeKnowledge();
    addClaudeMessage('assistant', `✅ Got it! I've learned: "${fact}". I'll remember this for next time!`);
  } else {
    addClaudeMessage('assistant', `I'm always learning! 🧠 If you have a correction or want to teach me something, just say "Remember: [your fact]" and I'll store it in my knowledge base. You can also upload .txt files for me to learn from!`);
  }
}

function handleQuestion(message) {
  const lower = message.toLowerCase();
  
  const knowledgeAnswer = searchKnowledge(message);
  if (knowledgeAnswer) {
    addClaudeMessage('assistant', knowledgeAnswer);
    speak(knowledgeAnswer.slice(0, 200));
    return;
  }
  
  const builtInAnswer = getBuiltInAnswer(lower);
  if (builtInAnswer) {
    addClaudeMessage('assistant', builtInAnswer);
    speak(builtInAnswer.slice(0, 200));
    return;
  }
  
  if (lower.includes('what can you do') || lower.includes('capabilities') || lower.includes('help') || lower === 'help') {
    const helpMessage = `${claudeIcons.lightbulb} **I'm Comfort Claude - Your AI Assistant!**\n\nHere's what I can do:\n\n**🔍 Search & Info:**\n• "search for [topic]" - Web search\n• "weather" - Current weather\n• "news about [topic]" - Latest news\n• "translate 'text' to [language]"\n• "define [word]" - Dictionary\n• "convert 100 USD to EUR"\n\n**📋 Productivity:**\n• "add task: [task]" - Task management\n• "add event [title] tomorrow at 3pm"\n• "start pomodoro" - Focus timer\n• "my dashboard" - Analytics\n• "screenshot" - Analyze screen\n\n**🎯 Habits & Goals:**\n• "add habit: [habit]"\n• "set goal: [goal] by [date]"\n• "check habit"\n\n**✏️ Writing:**\n• "improve '[text]'" - Grammar check\n• "summarize '[text]'"\n• "draft email to [person]"\n\n**⚙️ System:**\n• "change theme" - Toggle dark/light\n• "open [app]" - Launch apps\n• "focus mode" - Distraction-free\n\n**🗣️ Language:**\n• "change language to [language]"\n• "change personality to [mode]"\n\nJust ask me anything! 😊`;
    
    addClaudeMessage('assistant', helpMessage);
    return;
  }
  
  if (lower.includes('how many') && lower.includes('app')) {
    const installedCount = Object.keys(installedApps).length + 7;
    addClaudeMessage('assistant', `You currently have **${installedCount} apps** installed (7 built-in + ${Object.keys(installedApps).length} custom). Want to install more? Just drag .html or .baap files onto the desktop!`);
    return;
  }
  
  if (lower.includes('what time') || lower.includes('time is it')) {
    const now = new Date();
    const timeStr = now.toLocaleTimeString();
    addClaudeMessage('assistant', `It's currently **${timeStr}**. Time flies when you're being productive! ⏰`);
    speak(`It's ${timeStr}`);
    return;
  }
  
  askUserToTeach(message);
}

function handleGeneralQuery(message) {
  const knowledgeAnswer = searchKnowledge(message);
  if (knowledgeAnswer) {
    addClaudeMessage('assistant', knowledgeAnswer);
    return;
  }
  
  if (claudeConversationHistory.length > 2) {
    const lastMessages = claudeConversationHistory.slice(-3);
    const lastUserMessage = lastMessages.filter(m => m.role === 'user')[0];
    
    if (lastUserMessage && (message.toLowerCase().includes('yes') || message.toLowerCase().includes('yeah') || message.toLowerCase().includes('sure'))) {
      addClaudeMessage('assistant', "Great! Let me help you with that. What specifically would you like me to do?");
      return;
    }
  }
  
  const personality = claudePersonalities[claudeContext.personalityMode];
  const confusionMsg = `I'm not quite sure what you mean. Could you rephrase that? 🤔\n\n💡 Try:\n• "help" - See all commands\n• "search for [topic]"\n• "add task: [task]"\n• "my dashboard"`;
  
  addClaudeMessage('assistant', confusionMsg);
}

// Continue in next message with UI functions and initialization...// ===== UI HELPER FUNCTIONS =====

function showClaudeSettings() {
  const modal = document.getElementById('claude-settings-modal');
  modal.style.display = 'flex';
  
  // Load current settings
  document.getElementById('claude-language-select').value = claudeContext.language;
  document.getElementById('claude-username-input').value = claudeContext.userName;
  document.getElementById('claude-voice-checkbox').checked = claudeContext.voiceEnabled;
  
  // Highlight active personality
  document.querySelectorAll('.personality-btn').forEach(btn => {
    const mode = btn.getAttribute('data-mode');
    if (mode === claudeContext.personalityMode) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
}

function closeClaudeSettings() {
  document.getElementById('claude-settings-modal').style.display = 'none';
  saveClaudeKnowledge();
}

function updateUserName(name) {
  claudeContext.userName = name || 'User';
  saveClaudeKnowledge();
  addClaudeMessage('assistant', `Nice to meet you, ${claudeContext.userName}! 👋`);
}

function searchKnowledge(query) {
  const lower = query.toLowerCase();
  
  for (const [name, data] of Object.entries(claudeKnowledge)) {
    if (data.type === 'learned') {
      if (lower.includes(name.toLowerCase()) || data.content.toLowerCase().includes(lower.split(' ').slice(0, 3).join(' '))) {
        return `From what I've learned: ${data.content}`;
      }
    } else if (data.type === 'file') {
      const content = data.content.toLowerCase();
      const queryWords = lower.split(' ').filter(w => w.length > 3);
      
      const paragraphs = data.content.split('\n\n');
      const relevantParagraphs = paragraphs.filter(para => {
        const paraLower = para.toLowerCase();
        return queryWords.some(word => paraLower.includes(word));
      });
      
      if (relevantParagraphs.length > 0) {
        const answer = relevantParagraphs.slice(0, 2).join('\n\n');
        return `Based on "${name}":\n\n${answer.slice(0, 500)}${answer.length > 500 ? '...' : ''}`;
      }
    }
  }
  
  return null;
}

function getBuiltInAnswer(query) {
  const qa = {
    'what is bluebird': 'Bluebird OS is a modern web-based operating system interface created by Norbert. It features a desktop environment with windows, apps, an AI assistant (that\'s me!), and lots of cool features like animations, live captions, and more! 🐧',
    
    'who created': 'Bluebird OS was created by Norbert, founder of Bluebird - a company focused on web development and tech education in Uganda. Pretty cool, right? 🇺🇬',
    
    'how to install': 'You can install Bluebird OS as a PWA (Progressive Web App) by clicking "Install App" in the Start menu or Settings. You can also install custom apps by dragging .html or .baap files onto the desktop! 📱',
    
    'keyboard shortcut': 'Press Ctrl+Alt+T to open the terminal. You can also right-click the desktop for quick actions! ⌨️',
    
    'bluebird mission': 'Bluebird\'s mission is to deliver digital solutions and empower learners through accessible tech education across Africa. It\'s all about making technology accessible to everyone! 🌍'
  };
  
  for (const [key, answer] of Object.entries(qa)) {
    if (query.includes(key)) {
      return answer;
    }
  }
  
  return null;
}

function askUserToTeach(question) {
  const chat = document.getElementById('claude-chat');
  const teachDiv = document.createElement('div');
  teachDiv.className = 'claude-message assistant';
  
  teachDiv.innerHTML = `
    <div class="message-avatar">🤖</div>
    <div class="message-content">
      <strong>Comfort Claude</strong>
      <p>I don't know the answer to that yet, but I'd love to learn! 🧠 Would you like to teach me?</p>
      <div style="margin-top:0.8rem;">
        <textarea id="teach-answer" placeholder="Type the answer here..." style="width:100%; min-height:80px; padding:0.8rem; background:rgba(255,255,255,0.08); border:2px solid rgba(74,222,128,0.2); border-radius:8px; color:var(--text); resize:vertical; font-family:inherit; outline:none; font-size:0.9rem;"></textarea>
        <div style="display:flex; gap:0.5rem; margin-top:0.6rem;">
          <button onclick="learnAnswer('${question.replace(/'/g, "\\'")}', document.getElementById('teach-answer').value)" style="flex:1; padding:0.7rem 1.2rem; background:linear-gradient(135deg, var(--accent), #22c55e); color:#000; border:none; border-radius:8px; cursor:pointer; font-weight:600; transition:all 0.2s; box-shadow:0 4px 12px rgba(74,222,128,0.3);">
            ✅ Teach Me
          </button>
          <button onclick="cancelTeaching()" style="flex:1; padding:0.7rem 1.2rem; background:rgba(255,255,255,0.08); color:var(--text); border:1px solid rgba(255,255,255,0.2); border-radius:8px; cursor:pointer; font-weight:500; transition:all 0.2s;">
            Cancel
          </button>
        </div>
      </div>
    </div>
  `;
  
  chat.appendChild(teachDiv);
  chat.scrollTop = chat.scrollHeight;
}

function learnAnswer(question, answer) {
  if (!answer || !answer.trim()) {
    alert('Please provide an answer!');
    return;
  }
  
  const key = `learned_${Date.now()}`;
  claudeKnowledge[key] = {
    type: 'learned',
    question: question,
    answer: answer.trim(),
    added: new Date().toISOString()
  };
  
  saveClaudeKnowledge();
  
  const chat = document.getElementById('claude-chat');
  const lastMessage = chat.lastElementChild;
  if (lastMessage) lastMessage.remove();
  
  addClaudeMessage('assistant', `✅ Awesome! I've learned that. Thanks for teaching me! 🎓\n\nIf you ask me "${question}" again, I'll remember:\n"${answer.trim()}"\n\nI'm getting smarter because of you! 💡`);
  speak("Thank you for teaching me!");
}

function cancelTeaching() {
  const chat = document.getElementById('claude-chat');
  const lastMessage = chat.lastElementChild;
  if (lastMessage) lastMessage.remove();
  addClaudeMessage('assistant', 'No problem! Feel free to ask me something else or upload a knowledge file! 😊');
}

function uploadKnowledge(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  if (!file.name.endsWith('.txt')) {
    alert('Please upload a .txt file');
    return;
  }
  
  const reader = new FileReader();
  reader.onload = (e) => {
    const content = e.target.result;
    const fileName = file.name.replace('.txt', '');
    
    claudeKnowledge[fileName] = {
      content: content,
      type: 'file',
      added: new Date().toISOString()
    };
    
    saveClaudeKnowledge();
    updateKnowledgeDisplay();
    
    addClaudeMessage('assistant', `📁 Knowledge file "${fileName}" uploaded successfully! I can now answer questions based on this information. I've learned ${content.split('\n').length} lines of new knowledge!`);
    speak(`Knowledge file ${fileName} uploaded successfully`);
    
    document.getElementById('knowledge-status').textContent = `✅ Loaded: ${fileName}`;
    setTimeout(() => {
      document.getElementById('knowledge-status').textContent = '';
    }, 3000);
  };
  
  reader.readAsText(file);
}

function updateKnowledgeDisplay() {
  const container = document.getElementById('knowledge-files');
  container.innerHTML = '';
  
  for (const [name, data] of Object.entries(claudeKnowledge)) {
    if (data.type === 'file') {
      const chip = document.createElement('div');
      chip.className = 'knowledge-chip';
      chip.innerHTML = `
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
          <line x1="16" y1="13" x2="8" y2="13"/>
          <line x1="16" y1="17" x2="8" y2="17"/>
          <polyline points="10 9 9 9 8 9"/>
        </svg>
        <span>${name}</span>
        <button onclick="removeKnowledge('${name}')" title="Remove">×</button>
      `;
      container.appendChild(chip);
    }
  }
}

function removeKnowledge(name) {
  if (confirm(`Remove knowledge file "${name}"?`)) {
    delete claudeKnowledge[name];
    saveClaudeKnowledge();
    updateKnowledgeDisplay();
    addClaudeMessage('assistant', `Removed knowledge file "${name}". I've forgotten that information now.`);
  }
}

function addClaudeMessage(role, content) {
  const chat = document.getElementById('claude-chat');
  const messageDiv = document.createElement('div');
  messageDiv.className = `claude-message ${role}`;
  
  const avatar = role === 'user' ? '👤' : '🤖';
  const name = role === 'user' ? claudeContext.userName : 'Comfort Claude';
  
  messageDiv.innerHTML = `
    <div class="message-avatar">${avatar}</div>
    <div class="message-content">
      <strong>${name}</strong>
      <p>${content}</p>
    </div>
  `;
  
  chat.appendChild(messageDiv);
  chat.scrollTop = chat.scrollHeight;
  
  // Add to conversation history
  claudeConversationHistory.push({ 
    role, 
    content,
    timestamp: new Date().toISOString(),
    context: { ...claudeContext }
  });
  
  // Auto-speak assistant responses if voice enabled
  if (role === 'assistant' && claudeContext.voiceEnabled) {
    speak(content.slice(0, 200)); // Speak first 200 chars
  }
  
  saveClaudeKnowledge();
}

function sendToClaude() {
  const input = document.getElementById('claude-input');
  const message = input.value.trim();
  
  if (!message) return;
  
  addClaudeMessage('user', message);
  input.value = '';
  
  // Hide suggestions
  document.getElementById('claude-suggestions').style.display = 'none';
  
  // Update context
  claudeContext.commandCount++;
  claudeContext.lastCommand = message;
  
  // Process with a slight delay for better UX
  setTimeout(() => {
    processAdvancedCommand(message);
  }, 300);
}

function initSpeechRecognition() {
  if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = claudeLanguages[claudeContext.language].code;
    
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      document.getElementById('claude-input').value = transcript;
      document.getElementById('voice-status').innerHTML = `
        <span class="recording-dot"></span>
        <span>Heard: "${transcript}"</span>
      `;
      setTimeout(() => sendToClaude(), 500);
    };
    
    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      document.getElementById('voice-status').innerHTML = `
        <span>❌</span>
        <span>Error: ${event.error}</span>
      `;
      stopVoiceInput();
    };
    
    recognition.onend = () => {
      stopVoiceInput();
    };
  }
}

function toggleVoiceInput() {
  if (!recognition) {
    alert('Voice input not supported in this browser. Try Chrome or Edge.');
    return;
  }
  
  if (isListening) {
    stopVoiceInput();
  } else {
    startVoiceInput();
  }
}

function startVoiceInput() {
  isListening = true;
  document.getElementById('voice-btn').classList.add('recording');
  document.getElementById('voice-status').style.display = 'flex';
  document.getElementById('voice-status').innerHTML = `
    <span class="recording-dot"></span>
    <span>Listening...</span>
  `;
  recognition.start();
}

function stopVoiceInput() {
  isListening = false;
  document.getElementById('voice-btn').classList.remove('recording');
  if (recognition) {
    try { recognition.stop(); } catch(e) {}
  }
  setTimeout(() => {
    document.getElementById('voice-status').style.display = 'none';
  }, 3000);
}

function clearConversationHistory() {
  if (confirm('Clear all conversation history? This cannot be undone.')) {
    claudeConversationHistory = [];
    claudeContext = {
      lastCommand: null,
      lastApp: null,
      userMood: 'neutral',
      sessionStart: Date.now(),
      commandCount: 0,
      learningMode: true,
      language: claudeContext.language,
      voiceEnabled: claudeContext.voiceEnabled,
      personalityMode: claudeContext.personalityMode,
      userName: claudeContext.userName
    };
    
    saveClaudeKnowledge();
    
    const chat = document.getElementById('claude-chat');
    chat.innerHTML = '';
    
    addClaudeMessage('assistant', '🔄 Conversation history cleared! Fresh start! How can I help you?');
    addNotification('History Cleared', 'Comfort Claude conversation history has been reset', 'success', '✅');
  }
}

function exportConversationHistory() {
  if (claudeConversationHistory.length === 0) {
    alert('No conversation history to export');
    return;
  }
  
  const text = claudeConversationHistory.map(msg => {
    const date = new Date(msg.timestamp).toLocaleString();
    const role = msg.role === 'user' ? claudeContext.userName : 'Comfort Claude';
    return `[${date}] ${role}: ${msg.content}`;
  }).join('\n\n');
  
  const blob = new Blob([text], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `comfort-claude-conversation-${Date.now()}.txt`;
  a.click();
  URL.revokeObjectURL(url);
  
  addClaudeMessage('assistant', '💾 Conversation history exported! You can review our chat anytime.');
  addNotification('Export Complete', 'Conversation saved to file', 'success', '✅');
}

function showLearningStats() {
  const learnedCount = Object.values(claudeKnowledge).filter(k => k.type === 'learned').length;
  const fileCount = Object.values(claudeKnowledge).filter(k => k.type === 'file').length;
  const conversationCount = claudeConversationHistory.length;
  const sessionMinutes = Math.floor((Date.now() - claudeContext.sessionStart) / 60000);
  const tasksPending = claudeTasks.filter(t => !t.completed).length;
  const tasksCompleted = claudeTasks.filter(t => t.completed).length;
  
  const stats = `${claudeIcons.brain} **My Learning Stats:**\n\n🧠 **Knowledge:**\n   • Facts learned: ${learnedCount}\n   • Files uploaded: ${fileCount}\n   • Total knowledge items: ${learnedCount + fileCount}\n\n💬 **Conversations:**\n   • Messages: ${conversationCount}\n   • Commands executed: ${claudeContext.commandCount}\n   • Session time: ${sessionMinutes} min\n\n📋 **Tasks:**\n   • Pending: ${tasksPending}\n   • Completed: ${tasksCompleted}\n\n🎯 **Habits:**\n   • Tracked: ${claudeHabits.length}\n   • Active streaks: ${claudeHabits.filter(h => h.streak > 0).length}\n\n🎨 **Preferences:**\n   • Language: ${claudeLanguages[claudeContext.language].flag} ${claudeLanguages[claudeContext.language].name}\n   • Personality: ${claudeContext.personalityMode}\n   • Voice: ${claudeContext.voiceEnabled ? 'Enabled' : 'Disabled'}\n\n💡 **Fun Fact:** I'm getting smarter every day thanks to you! 🚀`;
  
  addClaudeMessage('assistant', stats);
}

// ===== INITIALIZATION =====
function initComfortClaude() {
  initSpeechRecognition();
  loadClaudeKnowledge();
  loadCalendar();
  
  // Welcome message with personality
  const timeOfDay = new Date().getHours();
  let greeting = 'Hello';
  
  if (timeOfDay < 12) greeting = 'Good morning';
  else if (timeOfDay < 18) greeting = 'Good afternoon';
  else greeting = 'Good evening';
  
  const userName = claudeContext.userName || 'there';
  const personality = claudePersonalities[claudeContext.personalityMode];
  
  setTimeout(() => {
    addClaudeMessage('assistant', `${greeting}, ${userName}! 👋\n\nI'm Comfort Claude, your AI-powered assistant. I'm here to help you be more productive, answer questions, and make Bluebird OS even better!\n\n💡 **Quick Start:**\n• Say "help" to see what I can do\n• Try "search for [topic]" to search the web\n• Use "add task: [task]" for to-do lists\n• Ask me anything!\n\nWhat can I help you with today?`);
    
    speak(`${greeting} ${userName}! I'm Comfort Claude. How can I help you today?`);
  }, 500);
  
  // Load voices for TTS
  if (synthesis) {
    synthesis.onvoiceschanged = () => {
      const voices = synthesis.getVoices();
      console.log(`Loaded ${voices.length} voices for TTS`);
    };
  }
}

// Update taskbar map
windowTaskbarMap['claude-win'] = { icon: '🤖', label: 'Comfort Claude' };

// Hook into window opening
const _originalOpenWindowForClaude = window.openWindow;
window.openWindow = function(id) {
  if (typeof _originalOpenWindowForClaude === 'function') {
    _originalOpenWindowForClaude(id);
  }
  
  if (id === 'claude-win') {
    setTimeout(() => initComfortClaude(), 100);
  }
};

// Expose all functions globally
window.showClaudeSettings = showClaudeSettings;
window.closeClaudeSettings = closeClaudeSettings;
window.updateUserName = updateUserName;
window.uploadKnowledge = uploadKnowledge;
window.removeKnowledge = removeKnowledge;
window.sendToClaude = sendToClaude;
window.toggleVoiceInput = toggleVoiceInput;
window.toggleVoiceOutput = toggleVoiceOutput;
window.learnAnswer = learnAnswer;
window.cancelTeaching = cancelTeaching;
window.clearConversationHistory = clearConversationHistory;
window.exportConversationHistory = exportConversationHistory;
window.showLearningStats = showLearningStats;
window.changePersonality = changePersonality;
window.changeLanguage = changeLanguage;
window.listTasks = listTasks;
window.listUpcomingEvents = listUpcomingEvents;
window.showProductivityDashboard = showProductivityDashboard;
window.toggleFocusMode = toggleFocusMode;
window.showClipboardHistory = showClipboardHistory;

// Auto-init on page load
setTimeout(() => {
  loadClaudeKnowledge();
  loadCalendar();
}, 1500);
