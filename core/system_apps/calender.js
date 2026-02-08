// ===== CALENDAR CONTROLLER =====
class CalendarController {
  constructor() {
    this.currentDate = new Date();
    this.selectedDate = new Date();
    this.events = this.loadEvents();
    this.viewMode = 'month'; // 'month' or 'week'
    
    this.init();
  }
  
  init() {
    this.renderCalendar();
    this.renderEvents();
  }
  
  loadEvents() {
    const saved = localStorage.getItem('calendar-events');
    return saved ? JSON.parse(saved) : {};
  }
  
  saveEvents() {
    localStorage.setItem('calendar-events', JSON.stringify(this.events));
  }
  
  renderCalendar() {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();
    
    // Update header
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                       'July', 'August', 'September', 'October', 'November', 'December'];
    document.getElementById('calendar-month-year').textContent = `${monthNames[month]} ${year}`;
    
    // Get first day of month and number of days
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();
    
    const daysContainer = document.getElementById('calendar-days');
    daysContainer.innerHTML = '';
    
    // Previous month days
    for (let i = firstDay - 1; i >= 0; i--) {
      const day = daysInPrevMonth - i;
      const dayEl = this.createDayElement(day, month - 1, year, true);
      daysContainer.appendChild(dayEl);
    }
    
    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const dayEl = this.createDayElement(day, month, year, false);
      daysContainer.appendChild(dayEl);
    }
    
    // Next month days
    const totalCells = daysContainer.children.length;
    const remainingCells = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
    
    for (let day = 1; day <= remainingCells; day++) {
      const dayEl = this.createDayElement(day, month + 1, year, true);
      daysContainer.appendChild(dayEl);
    }
  }
  
  createDayElement(day, month, year, isOtherMonth) {
    const dayEl = document.createElement('div');
    dayEl.className = 'calendar-day';
    dayEl.textContent = day;
    
    const date = new Date(year, month, day);
    const dateKey = this.getDateKey(date);
    
    if (isOtherMonth) {
      dayEl.classList.add('other-month');
    }
    
    // Check if today
    const today = new Date();
    if (date.toDateString() === today.toDateString()) {
      dayEl.classList.add('today');
    }
    
    // Check if selected
    if (date.toDateString() === this.selectedDate.toDateString()) {
      dayEl.classList.add('selected');
    }
    
    // Check if has events
    if (this.events[dateKey] && this.events[dateKey].length > 0) {
      dayEl.classList.add('has-events');
    }
    
    dayEl.onclick = () => {
      this.selectDate(date);
    };
    
    return dayEl;
  }
  
  selectDate(date) {
    this.selectedDate = date;
    this.renderCalendar();
    this.renderEvents();
  }
  
  renderEvents() {
    const dateKey = this.getDateKey(this.selectedDate);
    const eventsContainer = document.getElementById('calendar-events-list');
    const dayEvents = this.events[dateKey] || [];
    
    if (dayEvents.length === 0) {
      eventsContainer.innerHTML = '<div class="no-events">No events for selected date</div>';
      return;
    }
    
    // Sort events by time
    dayEvents.sort((a, b) => {
      if (!a.startTime) return 1;
      if (!b.startTime) return -1;
      return a.startTime.localeCompare(b.startTime);
    });
    
    eventsContainer.innerHTML = dayEvents.map(event => `
      <div class="event-item" style="border-left-color: ${event.color || '#3b82f6'}">
        ${event.startTime ? `<div class="event-time">${this.formatTime(event.startTime)} ${event.endTime ? '- ' + this.formatTime(event.endTime) : ''}</div>` : ''}
        <div class="event-title">${this.escapeHtml(event.title)}</div>
        ${event.description ? `<div class="event-description">${this.escapeHtml(event.description)}</div>` : ''}
      </div>
    `).join('');
  }
  
  formatTime(time) {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  }
  
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
  
  getDateKey(date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }
  
  previousMonth() {
    this.currentDate.setMonth(this.currentDate.getMonth() - 1);
    this.renderCalendar();
  }
  
  nextMonth() {
    this.currentDate.setMonth(this.currentDate.getMonth() + 1);
    this.renderCalendar();
  }
  
  goToToday() {
    this.currentDate = new Date();
    this.selectedDate = new Date();
    this.renderCalendar();
    this.renderEvents();
  }
  
  toggleView() {
    this.viewMode = this.viewMode === 'month' ? 'week' : 'month';
    document.getElementById('view-mode-text').textContent = this.viewMode === 'month' ? 'Month' : 'Week';
    // For now, just toggle the text. You can implement week view later
  }
  
  showAddEvent() {
    const modal = document.getElementById('add-event-modal');
    const dateInput = document.getElementById('event-date');
    
    // Set default date to selected date
    dateInput.value = this.getDateKey(this.selectedDate);
    
    modal.style.display = 'flex';
  }
  
  closeAddEvent() {
    const modal = document.getElementById('add-event-modal');
    modal.style.display = 'none';
    
    // Clear form
    document.getElementById('event-title').value = '';
    document.getElementById('event-date').value = '';
    document.getElementById('event-start-time').value = '';
    document.getElementById('event-end-time').value = '';
    document.getElementById('event-description').value = '';
    document.getElementById('event-color').value = '#3b82f6';
  }
  
  saveEvent() {
    const title = document.getElementById('event-title').value.trim();
    const date = document.getElementById('event-date').value;
    const startTime = document.getElementById('event-start-time').value;
    const endTime = document.getElementById('event-end-time').value;
    const description = document.getElementById('event-description').value.trim();
    const color = document.getElementById('event-color').value;
    
    if (!title || !date) {
      alert('Please enter a title and date');
      return;
    }
    
    const event = {
      id: Date.now(),
      title,
      startTime,
      endTime,
      description,
      color
    };
    
    if (!this.events[date]) {
      this.events[date] = [];
    }
    
    this.events[date].push(event);
    this.saveEvents();
    
    this.closeAddEvent();
    this.renderCalendar();
    this.renderEvents();
  }
}

// Initialize calendar controller
const calendarController = new CalendarController();

function toggleCalendar() {
  const panel = document.getElementById('calendar-panel');
  const volumePanel = document.getElementById('volume-panel');
  const wifiPanel = document.getElementById('wifi-panel');
  const settingsPanel = document.getElementById('taskbar-settings-panel');
  
  // Close other panels
  if (volumePanel) volumePanel.style.display = 'none';
  if (wifiPanel) wifiPanel.style.display = 'none';
  if (settingsPanel) settingsPanel.style.display = 'none';
  
  if (panel.style.display === 'none') {
    panel.style.display = 'block';
    calendarController.renderCalendar();
    calendarController.renderEvents();
  } else {
    panel.style.display = 'none';
  }
}

// Close modal when clicking outside
document.addEventListener('click', (e) => {
  const modal = document.getElementById('add-event-modal');
  if (modal && e.target === modal) {
    calendarController.closeAddEvent();
  }
  
  // Update existing close panels logic to include calendar
  const calendarPanel = document.getElementById('calendar-panel');
  const calendarBtn = document.querySelector('[onclick="toggleCalendar()"]');
  
  if (calendarPanel && calendarPanel.style.display !== 'none') {
    if (!calendarPanel.contains(e.target) && !calendarBtn?.contains(e.target)) {
      calendarPanel.style.display = 'none';
    }
  }
});