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
    
    // Initialize week start (Monday of current week)
    const today = new Date();
    const dayOfWeek = today.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    calendarWeekStart = new Date(today);
    calendarWeekStart.setDate(today.getDate() + mondayOffset);
    calendarCurrentDate = new Date(calendarWeekStart);
    
    if (!calendarPageInitialized) {
        calendarPageInitialized = true;
        setupCalendarEventListeners();
    }
    
    // Always re-render to ensure language is correct
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
    
    // Get current language - always default to Spanish unless explicitly English
    let lang = 'es'; // Default to Spanish
    try {
        const storedLang = localStorage.getItem('language');
        if (storedLang === 'en') {
            lang = 'en';
        } else {
            // Check global variables as fallback, but still default to Spanish
            const globalLang = (typeof window !== 'undefined' && window.currentLanguage) || 
                             (typeof currentLanguage !== 'undefined' ? currentLanguage : null);
            if (globalLang === 'en') {
                lang = 'en';
            }
        }
    } catch (e) {
        // If localStorage fails, default to Spanish
        lang = 'es';
    }
    const locale = lang === 'en' ? 'en-US' : 'es-ES';
    
    if (calendarCurrentView === 'week') {
        // Initialize calendarWeekStart if it's null
        if (!calendarWeekStart) {
            const today = new Date();
            const dayOfWeek = today.getDay();
            const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
            calendarWeekStart = new Date(today);
            calendarWeekStart.setDate(today.getDate() + mondayOffset);
        }
        
        const weekEnd = new Date(calendarWeekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);
        
        const options = { month: 'short', day: 'numeric', year: 'numeric' };
        const startStr = calendarWeekStart.toLocaleDateString(locale, options);
        const endStr = weekEnd.toLocaleDateString(locale, options);
        dateRangeElement.textContent = `${startStr} - ${endStr}`;
    } else {
        const options = { month: 'long', year: 'numeric' };
        dateRangeElement.textContent = calendarCurrentDate.toLocaleDateString(locale, options);
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
    
    // Initialize calendarWeekStart if it's null
    if (!calendarWeekStart) {
        const today = new Date();
        const dayOfWeek = today.getDay();
        const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
        calendarWeekStart = new Date(today);
        calendarWeekStart.setDate(today.getDate() + mondayOffset);
    }
    
    daysHeader.innerHTML = '';
    
    // Get current language - always default to Spanish unless explicitly English
    let lang = 'es'; // Default to Spanish
    try {
        const storedLang = localStorage.getItem('language');
        if (storedLang === 'en') {
            lang = 'en';
        } else {
            // Check global variables as fallback, but still default to Spanish
            const globalLang = (typeof window !== 'undefined' && window.currentLanguage) || 
                             (typeof currentLanguage !== 'undefined' ? currentLanguage : null);
            if (globalLang === 'en') {
                lang = 'en';
            }
        }
    } catch (e) {
        // If localStorage fails, default to Spanish
        lang = 'es';
    }
    
    // Day names in Spanish and English (abbreviated for week view)
    const dayNames = {
        es: ['LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB', 'DOM'],
        en: ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']
    };
    
    // TEMPORARILY FORCE SPANISH FOR TESTING - remove this after verification
    const days = dayNames['es']; // Always use Spanish for now
    
    // Debug: log what we're using
    console.log('Calendar language:', lang, 'Using days:', days);
    
    for (let i = 0; i < 7; i++) {
        const date = new Date(calendarWeekStart);
        date.setDate(date.getDate() + i);
        
        const dayHeader = document.createElement('div');
        dayHeader.className = 'calendar-day-header-item';
        
        const dayName = document.createElement('div');
        dayName.className = 'day-name';
        // Force Spanish day name
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
    
    // Initialize calendarWeekStart if it's null
    if (!calendarWeekStart) {
        const today = new Date();
        const dayOfWeek = today.getDay();
        const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
        calendarWeekStart = new Date(today);
        calendarWeekStart.setDate(today.getDate() + mondayOffset);
    }
    
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
    if (!appData) {
        return;
    }
    
    if (!appData.materia || !appData.usuarios_docente) {
        return;
    }
    
    // Get all events (notifications, exams, and recordatorios)
    const events = getAllEvents();
    
    if (events.length === 0) {
        return;
    }
    
    events.forEach(event => {
        try {
            const eventDate = new Date(event.date);
            if (isNaN(eventDate.getTime())) {
                return;
            }
            
            const eventDayIndex = getDayIndexInWeek(eventDate);
            
            if (eventDayIndex === -1) {
                return; // Event not in current week
            }
            
            // Find the cell for this event
            const timeSlot = findTimeSlotForEvent(event);
            const formattedDate = formatDateForCell(eventDate);
            
            const cells = document.querySelectorAll(`[data-date="${formattedDate}"]`);
            
            const cell = Array.from(cells).find(c => {
                const cellTime = c.dataset.time;
                return cellTime === timeSlot;
            });
            
            if (!cell) {
                return;
            }
            
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
        } catch (error) {
            // Error rendering event - silently continue
        }
    });
}

function getAllEvents() {
    const events = [];
    
    // Get current user
    const currentUser = getCurrentUserForCalendar();
    if (!currentUser) {
        return events;
    }
    
    // Get user's subjects
    let userSubjects = [];
    let subjectIds = [];
    
    if (appData.materia) {
        userSubjects = appData.materia.filter(m => 
            m.Usuarios_docente_ID_docente === currentUser.ID_docente || 
            m.Usuarios_docente_ID_docente == currentUser.ID_docente ||
            parseInt(m.Usuarios_docente_ID_docente) === parseInt(currentUser.ID_docente)
        );
        subjectIds = userSubjects.map(s => s.ID_materia);
    }
    
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
    
    // Get exams (evaluaciones) for current user's subjects
    if (appData.evaluacion && appData.materia && subjectIds.length > 0) {
        
        appData.evaluacion.forEach(evaluacion => {
            const examMateriaId = evaluacion.Materia_ID_materia;
            const matches = subjectIds.includes(examMateriaId) || 
                           subjectIds.includes(parseInt(examMateriaId)) ||
                           subjectIds.includes(String(examMateriaId));
            
            if (matches) {
                const materia = appData.materia.find(m => 
                    m.ID_materia === evaluacion.Materia_ID_materia
                );
                
                // Parse date - handle both date-only and datetime formats
                let examDate = new Date(evaluacion.Fecha);
                if (isNaN(examDate.getTime())) {
                    // If invalid date, try adding time
                    examDate = new Date(evaluacion.Fecha + ' 09:00:00');
                }
                
                events.push({
                    id: `exam_${evaluacion.ID_evaluacion}`,
                    type: 'exam',
                    title: evaluacion.Titulo || 'Examen',
                    description: evaluacion.Descripcion || `Examen de ${materia ? materia.Nombre : 'Materia'}`,
                    date: examDate,
                    tipo: evaluacion.Tipo || 'EXAMEN',
                    materia: materia ? materia.Nombre : 'Unknown',
                    evaluacion: evaluacion
                });
            }
        });
    }
    
    // Get classes (materias) for current user - parse schedule from Horario field
    // Try to get parseSchedule from dashboard.js
    const parseScheduleFunc = typeof parseSchedule === 'function' ? parseSchedule : 
                               (typeof window.parseSchedule === 'function' ? window.parseSchedule : null);
    
    if (appData.materia && subjectIds.length > 0 && parseScheduleFunc) {
        userSubjects.forEach(subject => {
            if (!subject.Horario || subject.Estado !== 'ACTIVA') {
                return;
            }
            
            const schedule = parseScheduleFunc(subject.Horario);
            if (!schedule) {
                return;
            }
            
            // Generate class events for the current week (for week view) or month (for month view)
            let viewStart, viewEnd;
            
            if (calendarCurrentView === 'week') {
                // Initialize calendarWeekStart if it's null
                if (!calendarWeekStart) {
                    const today = new Date();
                    const dayOfWeek = today.getDay();
                    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
                    calendarWeekStart = new Date(today);
                    calendarWeekStart.setDate(today.getDate() + mondayOffset);
                }
                viewStart = new Date(calendarWeekStart);
                viewEnd = new Date(calendarWeekStart.getTime() + 6 * 24 * 60 * 60 * 1000);
            } else {
                viewStart = new Date(calendarCurrentDate.getFullYear(), calendarCurrentDate.getMonth(), 1);
                viewEnd = new Date(calendarCurrentDate.getFullYear(), calendarCurrentDate.getMonth() + 1, 0);
            }
            
            let classCount = 0;
            // Generate classes for the view period
            for (let d = new Date(viewStart); d <= viewEnd; d.setDate(d.getDate() + 1)) {
                if (schedule.days.includes(d.getDay())) {
                    const [hours, minutes] = schedule.startTime.split(':');
                    const classDate = new Date(d.getFullYear(), d.getMonth(), d.getDate(), parseInt(hours), parseInt(minutes), 0);
                    
                    events.push({
                        id: `class_${subject.ID_materia}_${classDate.toISOString()}`,
                        type: 'class',
                        title: subject.Nombre,
                        description: `Clase de ${subject.Nombre}`,
                        date: classDate,
                        tipo: 'CLASE',
                        materia: subject.Nombre,
                        aula: subject.Aula || 'Aula por asignar',
                        horario: subject.Horario,
                        subject: subject
                    });
                    classCount++;
                }
            }
        });
    }
    
    // Get recordatorios for current user's subjects
    if (appData.recordatorio && appData.materia && subjectIds.length > 0) {
        
        appData.recordatorio.forEach(recordatorio => {
            const recMateriaId = recordatorio.Materia_ID_materia;
            const matches = subjectIds.includes(recMateriaId) || 
                           subjectIds.includes(parseInt(recMateriaId)) ||
                           subjectIds.includes(String(recMateriaId));
            
            if (matches) {
                const materia = appData.materia.find(m => 
                    m.ID_materia === recordatorio.Materia_ID_materia
                );
                
                // Parse date - handle both date-only and datetime formats
                let reminderDate = new Date(recordatorio.Fecha);
                if (isNaN(reminderDate.getTime())) {
                    // If invalid date, try adding time
                    reminderDate = new Date(recordatorio.Fecha + ' 09:00:00');
                }
                
                events.push({
                    id: `rec_${recordatorio.ID_recordatorio}`,
                    type: 'recordatorio',
                    title: getRecordatorioTitle(recordatorio),
                    description: recordatorio.Descripcion,
                    date: reminderDate,
                    tipo: recordatorio.Tipo,
                    prioridad: recordatorio.Prioridad,
                    materia: materia ? materia.Nombre : 'Unknown',
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
    // Try to use global getCurrentUser from notifications.js or dashboard.js
    if (typeof getCurrentUser === 'function') {
        const user = getCurrentUser();
        if (user) return user;
    }
    
    // Fallback implementation
    if (!appData || !appData.usuarios_docente) {
        return null;
    }
    
    // Get from localStorage (where login stores it)
    const userId = localStorage.getItem('userId');
    if (userId) {
        const user = appData.usuarios_docente.find(u => u.ID_docente == userId || u.ID_docente == parseInt(userId));
        if (user) {
            return user;
        }
    }
    
    // Try email from localStorage as fallback
    const email = localStorage.getItem('userEmail') || localStorage.getItem('username');
    if (email) {
        const user = appData.usuarios_docente.find(u => u.Email_docente === email);
        if (user) {
            return user;
        }
    }
    
    return null;
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
    if (!calendarWeekStart) return -1;
    
    const weekStart = new Date(calendarWeekStart);
    weekStart.setHours(0, 0, 0, 0); // Start of day
    
    const weekEnd = new Date(calendarWeekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999); // End of day
    
    const eventDate = new Date(date);
    eventDate.setHours(0, 0, 0, 0); // Compare only dates, not times
    
    if (eventDate < weekStart || eventDate > weekEnd) return -1;
    
    const dayDiff = Math.floor((eventDate - weekStart) / (1000 * 60 * 60 * 24));
    return dayDiff;
}

function findTimeSlotForEvent(event) {
    // Parse time from event date
    const hour = event.date.getHours();
    const minute = event.date.getMinutes();
    
    // Round to nearest 30-minute slot
    const roundedMinute = minute < 30 ? 0 : 30;
    const timeStr = `${hour.toString().padStart(2, '0')}:${roundedMinute.toString().padStart(2, '0')}`;
    
    // Find exact match first, then closest
    const exactMatch = TIME_SLOTS.find(slot => slot === timeStr);
    if (exactMatch) {
        return exactMatch;
    }
    
    // Find closest time slot
    const index = TIME_SLOTS.findIndex(slot => slot >= timeStr);
    const slot = TIME_SLOTS[index] || TIME_SLOTS[0];
    return slot;
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
    } else if (event.type === 'exam') {
        // Exams are always red/important
        return '#dc2626'; // Red color for exams
    } else if (event.type === 'class') {
        // Regular classes are green
        return '#10b981'; // Green color for classes
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
    if (event.type === 'exam') {
        return `<i class="fas fa-clipboard-list"></i> ${event.materia}`;
    } else if (event.type === 'class') {
        return `<i class="fas fa-chalkboard-teacher"></i> ${event.aula || ''}`;
    } else if (event.type === 'recordatorio') {
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
    
    // Get current language - always default to Spanish unless explicitly English
    let lang = 'es'; // Default to Spanish
    try {
        const storedLang = localStorage.getItem('language');
        if (storedLang === 'en') {
            lang = 'en';
        } else {
            // Check global variables as fallback, but still default to Spanish
            const globalLang = (typeof window !== 'undefined' && window.currentLanguage) || 
                             (typeof currentLanguage !== 'undefined' ? currentLanguage : null);
            if (globalLang === 'en') {
                lang = 'en';
            }
        }
    } catch (e) {
        // If localStorage fails, default to Spanish
        lang = 'es';
    }
    
    // Day names in Spanish and English (abbreviated for month view)
    const dayNames = {
        es: ['LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB', 'DOM'],
        en: ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']
    };
    
    // TEMPORARILY FORCE SPANISH FOR TESTING - remove this after verification
    const dayHeaders = dayNames['es']; // Always use Spanish for now
    
    // Render day headers
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
            
            // Show up to 3 events with details
            dayEvents.slice(0, 3).forEach(event => {
                const eventItem = document.createElement('div');
                eventItem.className = `month-event-item event-${event.type}`;
                const color = getEventColor(event);
                eventItem.style.borderLeftColor = color;
                // Convert hex to rgba with opacity
                const rgb = hexToRgb(color);
                if (rgb) {
                    eventItem.style.backgroundColor = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.1)`;
                }
                
                // Add click handler
                eventItem.addEventListener('click', (e) => {
                    e.stopPropagation();
                    showEventDetails(event);
                });
                
                const eventTime = document.createElement('div');
                eventTime.className = 'month-event-time';
                eventTime.textContent = formatEventTime(event);
                
                const eventTitle = document.createElement('div');
                eventTitle.className = 'month-event-title';
                eventTitle.textContent = event.title;
                eventTitle.title = event.title; // Tooltip for full text
                
                eventItem.appendChild(eventTime);
                eventItem.appendChild(eventTitle);
                eventsContainer.appendChild(eventItem);
            });
            
            // Show indicator if there are more events
            if (dayEvents.length > 3) {
                const moreIndicator = document.createElement('div');
                moreIndicator.className = 'more-events';
                moreIndicator.textContent = `+${dayEvents.length - 3} más`;
                moreIndicator.title = `${dayEvents.length - 3} eventos adicionales`;
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
    
    // Normalize both dates to compare only the date part (ignore time)
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);
    
    return events.filter(event => {
        const eventDate = new Date(event.date);
        eventDate.setHours(0, 0, 0, 0);
        
        return eventDate.getTime() === targetDate.getTime();
    });
}

function showEventDetails(event) {
    const modal = document.getElementById('eventDetailsModal');
    if (!modal) {
        // Fallback to alert if modal doesn't exist
        alert(`Event: ${event.title}\nDate: ${event.date.toLocaleString()}`);
        return;
    }
    
    // Set icon and color based on event type
    const iconElement = document.getElementById('eventModalIcon');
    const headerElement = document.getElementById('eventModalHeader');
    const titleElement = document.getElementById('eventModalTitle');
    const subtitleElement = document.getElementById('eventModalSubtitle');
    const bodyElement = document.getElementById('eventModalBody');
    
    if (!iconElement || !headerElement || !titleElement || !subtitleElement || !bodyElement) {
        return;
    }
    
    // Set icon and header color
    let iconClass = 'fas fa-calendar-day';
    let headerGradient = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    
    if (event.type === 'exam') {
        iconClass = 'fas fa-clipboard-list';
        headerGradient = 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)';
    } else if (event.type === 'class') {
        iconClass = 'fas fa-chalkboard-teacher';
        headerGradient = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
    } else if (event.type === 'recordatorio') {
        iconClass = 'fas fa-book';
        headerGradient = 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)';
    } else if (event.type === 'notification') {
        iconClass = 'fas fa-bell';
        headerGradient = 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)';
    }
    
    // Update header
    headerElement.style.background = headerGradient;
    iconElement.innerHTML = `<i class="${iconClass}"></i>`;
    titleElement.textContent = event.title;
    
    // Format date
    const eventDate = new Date(event.date);
    const dateStr = eventDate.toLocaleDateString('es-ES', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
    const timeStr = eventDate.toLocaleTimeString('es-ES', { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
    subtitleElement.textContent = `${dateStr} a las ${timeStr}`;
    
    // Build body content
    let bodyHTML = '';
    
    // Description
    if (event.description) {
        bodyHTML += `
            <div class="event-detail-item">
                <div class="event-detail-label">
                    <i class="fas fa-align-left"></i> Descripción
                </div>
                <div class="event-detail-value">${event.description}</div>
            </div>
        `;
    }
    
    // Type-specific information
    if (event.type === 'exam') {
        bodyHTML += `
            <div class="event-detail-item">
                <div class="event-detail-label">
                    <i class="fas fa-tag"></i> Tipo
                </div>
                <div class="event-detail-value">${event.tipo || 'Examen'}</div>
            </div>
            <div class="event-detail-item">
                <div class="event-detail-label">
                    <i class="fas fa-book"></i> Materia
                </div>
                <div class="event-detail-value">${event.materia || 'N/A'}</div>
            </div>
        `;
        if (event.evaluacion && event.evaluacion.Descripcion) {
            bodyHTML += `
                <div class="event-detail-item">
                    <div class="event-detail-label">
                        <i class="fas fa-info-circle"></i> Detalles
                    </div>
                    <div class="event-detail-value">${event.evaluacion.Descripcion}</div>
                </div>
            `;
        }
    } else if (event.type === 'class') {
        bodyHTML += `
            <div class="event-detail-item">
                <div class="event-detail-label">
                    <i class="fas fa-book"></i> Materia
                </div>
                <div class="event-detail-value">${event.materia || 'N/A'}</div>
            </div>
            <div class="event-detail-item">
                <div class="event-detail-label">
                    <i class="fas fa-door-open"></i> Aula
                </div>
                <div class="event-detail-value">${event.aula || 'Aula por asignar'}</div>
            </div>
            <div class="event-detail-item">
                <div class="event-detail-label">
                    <i class="fas fa-clock"></i> Horario
                </div>
                <div class="event-detail-value">${event.horario || 'N/A'}</div>
            </div>
        `;
    } else if (event.type === 'recordatorio') {
        bodyHTML += `
            <div class="event-detail-item">
                <div class="event-detail-label">
                    <i class="fas fa-tag"></i> Tipo
                </div>
                <div class="event-detail-value">${event.tipo || 'Recordatorio'}</div>
            </div>
            <div class="event-detail-item">
                <div class="event-detail-label">
                    <i class="fas fa-book"></i> Materia
                </div>
                <div class="event-detail-value">${event.materia || 'N/A'}</div>
            </div>
            <div class="event-detail-item">
                <div class="event-detail-label">
                    <i class="fas fa-star"></i> Prioridad
                </div>
                <div class="event-detail-value">${event.prioridad || 'Normal'}</div>
            </div>
        `;
    } else if (event.type === 'notification') {
        bodyHTML += `
            <div class="event-detail-item">
                <div class="event-detail-label">
                    <i class="fas fa-tag"></i> Tipo
                </div>
                <div class="event-detail-value">${event.notification.Tipo || 'Notificación'}</div>
            </div>
            <div class="event-detail-item">
                <div class="event-detail-label">
                    <i class="fas fa-info-circle"></i> Estado
                </div>
                <div class="event-detail-value">${event.notification.Estado || 'No leída'}</div>
            </div>
        `;
    }
    
    bodyElement.innerHTML = bodyHTML || '<p>No hay información adicional disponible.</p>';
    
    // Show modal
    if (typeof showModal === 'function') {
        showModal('eventDetailsModal');
    } else if (typeof setupModalHandlers === 'function') {
        modal.classList.add('active');
        setupModalHandlers('eventDetailsModal');
    } else {
        modal.classList.add('active');
    }
}

// Helper function to convert hex to RGB
function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

// Make functions globally available
window.initializeCalendarPage = initializeCalendarPage;
window.resetCalendarPage = resetCalendarPage;
window.renderCalendarView = renderCalendarView;

