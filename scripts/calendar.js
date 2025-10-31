// Calendar Page System
let calendarPageInitialized = false;
let calendarCurrentView = 'week'; // 'week' or 'month'
let calendarCurrentDate = new Date();
let calendarWeekStart = null;

// Reset initialization when navigating away
function resetCalendarPage() {
    calendarPageInitialized = false;
}

// Time slots for week view (8 AM to 10 PM)
const TIME_SLOTS = [];
for (let hour = 8; hour <= 22; hour++) {
    TIME_SLOTS.push(`${hour.toString().padStart(2, '0')}:00`);
    TIME_SLOTS.push(`${hour.toString().padStart(2, '0')}:30`);
}

function initializeCalendarPage() {
    const calendarSection = document.getElementById('calendar');
    if (!calendarSection || !calendarSection.classList.contains('active')) {
        calendarPageInitialized = false;
        return;
    }
    
    if (calendarPageInitialized) {
        // Already initialized, just render
        renderCalendarView();
        return;
    }
    
    calendarPageInitialized = true;
    
    // Initialize week start (Monday of current week)
    const today = new Date();
    const dayOfWeek = today.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    calendarWeekStart = new Date(today);
    calendarWeekStart.setDate(today.getDate() + mondayOffset);
    calendarCurrentDate = new Date(calendarWeekStart);
    
    setupCalendarEventListeners();
    renderCalendarView();
}

function setupCalendarEventListeners() {
    // View toggle buttons
    const weekBtn = document.getElementById('calendarWeekBtn');
    const monthBtn = document.getElementById('calendarMonthBtn');
    
    if (weekBtn) {
        weekBtn.addEventListener('click', () => {
            calendarCurrentView = 'week';
            updateViewButtons();
            renderCalendarView();
        });
    }
    
    if (monthBtn) {
        monthBtn.addEventListener('click', () => {
            calendarCurrentView = 'month';
            updateViewButtons();
            renderCalendarView();
        });
    }
    
    // Navigation buttons
    const prevBtn = document.getElementById('calendarPrevBtn');
    const nextBtn = document.getElementById('calendarNextBtn');
    const todayBtn = document.getElementById('calendarTodayBtn');
    
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            navigateCalendar(-1);
        });
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            navigateCalendar(1);
        });
    }
    
    if (todayBtn) {
        todayBtn.addEventListener('click', () => {
            goToToday();
        });
    }
}

function updateViewButtons() {
    const weekBtn = document.getElementById('calendarWeekBtn');
    const monthBtn = document.getElementById('calendarMonthBtn');
    
    if (weekBtn && monthBtn) {
        if (calendarCurrentView === 'week') {
            weekBtn.classList.add('active');
            monthBtn.classList.remove('active');
        } else {
            weekBtn.classList.remove('active');
            monthBtn.classList.add('active');
        }
    }
}

function navigateCalendar(direction) {
    if (calendarCurrentView === 'week') {
        calendarWeekStart.setDate(calendarWeekStart.getDate() + (direction * 7));
        calendarCurrentDate = new Date(calendarWeekStart);
    } else {
        calendarCurrentDate.setMonth(calendarCurrentDate.getMonth() + direction);
    }
    renderCalendarView();
}

function goToToday() {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    calendarWeekStart = new Date(today);
    calendarWeekStart.setDate(today.getDate() + mondayOffset);
    calendarCurrentDate = new Date(today);
    renderCalendarView();
}

function renderCalendarView() {
    updateDateRange();
    
    if (calendarCurrentView === 'week') {
        renderWeekView();
    } else {
        renderMonthView();
    }
}

function updateDateRange() {
    const dateRangeElement = document.getElementById('currentDateRange');
    if (!dateRangeElement) return;
    
    if (calendarCurrentView === 'week') {
        const weekEnd = new Date(calendarWeekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);
        
        const options = { month: 'short', day: 'numeric', year: 'numeric' };
        const startStr = calendarWeekStart.toLocaleDateString('en-US', options);
        const endStr = weekEnd.toLocaleDateString('en-US', options);
        dateRangeElement.textContent = `${startStr} - ${endStr}`;
    } else {
        const options = { month: 'long', year: 'numeric' };
        dateRangeElement.textContent = calendarCurrentDate.toLocaleDateString('en-US', options);
    }
}

function renderWeekView() {
    const weekView = document.getElementById('calendarWeekView');
    const monthView = document.getElementById('calendarMonthView');
    
    if (weekView) weekView.style.display = 'flex';
    if (monthView) monthView.style.display = 'none';
    
    // Render time slots
    renderTimeSlots();
    
    // Render days header
    renderDaysHeader();
    
    // Render days grid
    renderDaysGrid();
}

function renderTimeSlots() {
    const timeSlotsContainer = document.getElementById('timeSlots');
    if (!timeSlotsContainer) return;
    
    timeSlotsContainer.innerHTML = '';
    
    TIME_SLOTS.forEach(time => {
        const timeSlot = document.createElement('div');
        timeSlot.className = 'time-slot';
        timeSlot.textContent = formatTimeSlot(time);
        timeSlotsContainer.appendChild(timeSlot);
    });
}

function formatTimeSlot(time) {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    
    if (hour === 0) return '12:00 AM';
    if (hour < 12) return `${hour}:${minutes} AM`;
    if (hour === 12) return `12:${minutes} PM`;
    return `${hour - 12}:${minutes} PM`;
}

function renderDaysHeader() {
    const daysHeader = document.getElementById('calendarDaysHeader');
    if (!daysHeader) return;
    
    daysHeader.innerHTML = '';
    
    const days = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
    
    for (let i = 0; i < 7; i++) {
        const date = new Date(calendarWeekStart);
        date.setDate(date.getDate() + i);
        
        const dayHeader = document.createElement('div');
        dayHeader.className = 'calendar-day-header-item';
        
        const dayName = document.createElement('div');
        dayName.className = 'day-name';
        dayName.textContent = days[i];
        
        const dayNumber = document.createElement('div');
        dayNumber.className = 'day-number';
        dayNumber.textContent = date.getDate();
        
        // Highlight today
        const today = new Date();
        if (date.toDateString() === today.toDateString()) {
            dayHeader.classList.add('today');
        }
        
        dayHeader.appendChild(dayName);
        dayHeader.appendChild(dayNumber);
        daysHeader.appendChild(dayHeader);
    }
}

function renderDaysGrid() {
    const daysGrid = document.getElementById('calendarDaysGrid');
    if (!daysGrid) return;
    
    daysGrid.innerHTML = '';
    
    // Create grid: 7 days x time slots
    for (let i = 0; i < TIME_SLOTS.length; i++) {
        const timeSlot = TIME_SLOTS[i];
        
        for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
            const date = new Date(calendarWeekStart);
            date.setDate(calendarWeekStart.getDate() + dayIndex);
            
            const cell = document.createElement('div');
            cell.className = 'calendar-cell';
            cell.dataset.date = formatDateForCell(date);
            cell.dataset.time = timeSlot;
            
            // Add current time indicator
            if (isCurrentTime(date, timeSlot)) {
                const indicator = document.createElement('div');
                indicator.className = 'current-time-indicator';
                cell.appendChild(indicator);
            }
            
            daysGrid.appendChild(cell);
        }
    }
    
    // Render events after grid is created
    renderEvents();
}

function renderEvents() {
    if (!appData) return;
    
    // Get all events (notifications and recordatorios)
    const events = getAllEvents();
    
    events.forEach(event => {
        const eventDate = new Date(event.date);
        const eventDayIndex = getDayIndexInWeek(eventDate);
        
        if (eventDayIndex === -1) return; // Event not in current week
        
        // Find the cell for this event
        const timeSlot = findTimeSlotForEvent(event);
        const cells = document.querySelectorAll(`[data-date="${formatDateForCell(eventDate)}"]`);
        const cell = Array.from(cells).find(c => {
            const cellTime = c.dataset.time;
            return cellTime === timeSlot;
        });
        
        if (!cell) return;
        
        // Create event element
        const eventElement = document.createElement('div');
        eventElement.className = `calendar-event event-${event.type}`;
        eventElement.style.backgroundColor = getEventColor(event);
        
        const eventTime = document.createElement('div');
        eventTime.className = 'event-time';
        eventTime.textContent = formatEventTime(event);
        
        const eventTitle = document.createElement('div');
        eventTitle.className = 'event-title';
        eventTitle.textContent = event.title;
        
        const eventMeta = document.createElement('div');
        eventMeta.className = 'event-meta';
        eventMeta.innerHTML = getEventMeta(event);
        
        eventElement.appendChild(eventTime);
        eventElement.appendChild(eventTitle);
        eventElement.appendChild(eventMeta);
        
        // Add click handler
        eventElement.addEventListener('click', () => {
            showEventDetails(event);
        });
        
        cell.appendChild(eventElement);
    });
}

function getAllEvents() {
    const events = [];
    
    // Get current user
    const currentUser = getCurrentUserForCalendar();
    if (!currentUser) return events;
    
    // Get notifications
    if (appData.notifications) {
        appData.notifications.forEach(notif => {
            if (shouldShowNotification(notif, currentUser.ID_docente)) {
                events.push({
                    id: `notif_${notif.ID_notificacion}`,
                    type: 'notification',
                    title: notif.Titulo,
                    description: notif.Mensaje,
                    date: new Date(notif.Fecha_creacion),
                    notification: notif
                });
            }
        });
    }
    
    // Get recordatorios for current user's subjects
    if (appData.recordatorio && appData.materia) {
        const userSubjects = appData.materia.filter(m => 
            m.Usuarios_docente_ID_docente === currentUser.ID_docente
        );
        const subjectIds = userSubjects.map(s => s.ID_materia);
        
        appData.recordatorio.forEach(recordatorio => {
            if (subjectIds.includes(recordatorio.Materia_ID_materia)) {
                const materia = appData.materia.find(m => 
                    m.ID_materia === recordatorio.Materia_ID_materia
                );
                
                events.push({
                    id: `rec_${recordatorio.ID_recordatorio}`,
                    type: 'recordatorio',
                    title: getRecordatorioTitle(recordatorio),
                    description: recordatorio.Descripcion,
                    date: new Date(recordatorio.Fecha),
                    tipo: recordatorio.Tipo,
                    prioridad: recordatorio.Prioridad,
                    materia: materia ? materia.Nombre_materia : 'Unknown',
                    recordatorio: recordatorio
                });
            }
        });
    }
    
    return events;
}

function shouldShowNotification(notif, docenteId) {
    return notif.Destinatario_tipo === 'TODOS' || 
           (notif.Destinatario_tipo === 'DOCENTE' && notif.Destinatario_id === docenteId);
}

// Use getCurrentUser from notifications.js if available, otherwise define it here
function getCurrentUserForCalendar() {
    // Try to use global getCurrentUser from notifications.js
    if (typeof getCurrentUser === 'function') {
        return getCurrentUser();
    }
    
    // Fallback implementation
    if (!appData || !appData.usuarios_docente) return null;
    
    // Get from session storage or find first user (for demo)
    const userId = sessionStorage.getItem('user_id');
    if (userId) {
        return appData.usuarios_docente.find(u => u.ID_docente == userId);
    }
    
    return appData.usuarios_docente[0] || null;
}

function getRecordatorioTitle(recordatorio) {
    const typeLabels = {
        'EXAMEN': 'Examen',
        'ENTREGA': 'Entrega',
        'REUNION': 'Reunión',
        'CLASE': 'Clase',
        'EVENTO': 'Evento'
    };
    
    return typeLabels[recordatorio.Tipo] || recordatorio.Tipo;
}

function getDayIndexInWeek(date) {
    const weekStart = new Date(calendarWeekStart);
    const weekEnd = new Date(calendarWeekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    
    if (date < weekStart || date > weekEnd) return -1;
    
    const dayDiff = Math.floor((date - weekStart) / (1000 * 60 * 60 * 24));
    return dayDiff;
}

function findTimeSlotForEvent(event) {
    // For now, use 9:00 AM as default, or parse from event if available
    const hour = event.date.getHours();
    const minute = event.date.getMinutes();
    
    const timeStr = `${hour.toString().padStart(2, '0')}:${minute < 30 ? '00' : '30'}`;
    
    // Find closest time slot
    const index = TIME_SLOTS.findIndex(slot => slot >= timeStr);
    return TIME_SLOTS[index] || TIME_SLOTS[0];
}

function formatDateForCell(date) {
    return date.toISOString().split('T')[0];
}

function formatEventTime(event) {
    const date = event.date;
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
}

function getEventColor(event) {
    if (event.type === 'notification') {
        const tipoColors = {
            'INFO': '#3b82f6',
            'WARNING': '#f59e0b',
            'ERROR': '#ef4444',
            'SUCCESS': '#10b981'
        };
        return tipoColors[event.notification.Tipo] || '#6b7280';
    } else if (event.type === 'recordatorio') {
        const tipoColors = {
            'EXAMEN': '#ef4444',
            'ENTREGA': '#f59e0b',
            'REUNION': '#3b82f6',
            'CLASE': '#10b981',
            'EVENTO': '#8b5cf6'
        };
        return tipoColors[event.tipo] || '#6b7280';
    }
    return '#6b7280';
}

function getEventMeta(event) {
    if (event.type === 'recordatorio') {
        return `<i class="fas fa-book"></i> ${event.materia}`;
    }
    return `<i class="fas fa-bell"></i> Notification`;
}

function isCurrentTime(date, timeSlot) {
    const now = new Date();
    const [hours, minutes] = timeSlot.split(':').map(Number);
    
    return date.toDateString() === now.toDateString() &&
           now.getHours() === hours &&
           Math.abs(now.getMinutes() - minutes) <= 5;
}

function renderMonthView() {
    const weekView = document.getElementById('calendarWeekView');
    const monthView = document.getElementById('calendarMonthView');
    
    if (weekView) weekView.style.display = 'none';
    if (monthView) monthView.style.display = 'block';
    
    const monthGrid = document.getElementById('calendarMonthGrid');
    if (!monthGrid) return;
    
    monthGrid.innerHTML = '';
    
    // Get first day of month
    const firstDay = new Date(calendarCurrentDate.getFullYear(), calendarCurrentDate.getMonth(), 1);
    const lastDay = new Date(calendarCurrentDate.getFullYear(), calendarCurrentDate.getMonth() + 1, 0);
    
    // Start from Monday of the week containing first day
    const startDate = new Date(firstDay);
    const dayOfWeek = firstDay.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    startDate.setDate(firstDay.getDate() + mondayOffset);
    
    // Render day headers
    const dayHeaders = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
    dayHeaders.forEach(day => {
        const header = document.createElement('div');
        header.className = 'month-day-header';
        header.textContent = day;
        monthGrid.appendChild(header);
    });
    
    // Render days
    const currentDate = new Date(startDate);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 41); // 6 weeks
    
    while (currentDate <= endDate) {
        const dayCell = document.createElement('div');
        dayCell.className = 'month-day-cell';
        
        const isCurrentMonth = currentDate.getMonth() === calendarCurrentDate.getMonth();
        if (!isCurrentMonth) {
            dayCell.classList.add('other-month');
        }
        
        const dayNumber = document.createElement('div');
        dayNumber.className = 'day-number';
        dayNumber.textContent = currentDate.getDate();
        dayCell.appendChild(dayNumber);
        
        // Add events for this day
        const dayEvents = getEventsForDate(currentDate);
        if (dayEvents.length > 0) {
            const eventsContainer = document.createElement('div');
            eventsContainer.className = 'month-day-events';
            
            dayEvents.slice(0, 3).forEach(event => {
                const eventDot = document.createElement('div');
                eventDot.className = 'month-event-dot';
                eventDot.style.backgroundColor = getEventColor(event);
                eventDot.title = event.title;
                eventsContainer.appendChild(eventDot);
            });
            
            if (dayEvents.length > 3) {
                const moreIndicator = document.createElement('div');
                moreIndicator.className = 'more-events';
                moreIndicator.textContent = `+${dayEvents.length - 3}`;
                eventsContainer.appendChild(moreIndicator);
            }
            
            dayCell.appendChild(eventsContainer);
        }
        
        // Highlight today
        const today = new Date();
        if (currentDate.toDateString() === today.toDateString()) {
            dayCell.classList.add('today');
        }
        
        monthGrid.appendChild(dayCell);
        
        currentDate.setDate(currentDate.getDate() + 1);
    }
}

function getEventsForDate(date) {
    const events = getAllEvents();
    return events.filter(event => {
        const eventDate = new Date(event.date);
        return eventDate.toDateString() === date.toDateString();
    });
}

function showEventDetails(event) {
    // Create a simple modal or alert for now
    let message = `Title: ${event.title}\n\n`;
    message += `Description: ${event.description}\n\n`;
    message += `Date: ${event.date.toLocaleString()}\n\n`;
    
    if (event.type === 'recordatorio') {
        message += `Type: ${event.tipo}\n`;
        message += `Priority: ${event.prioridad}\n`;
        message += `Subject: ${event.materia}\n`;
    } else {
        message += `Type: ${event.notification.Tipo}\n`;
    }
    
    alert(message);
    // TODO: Replace with a proper modal
}

// Make functions globally available
window.initializeCalendarPage = initializeCalendarPage;
window.resetCalendarPage = resetCalendarPage;

