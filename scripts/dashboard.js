// Dashboard System
function initializeDashboard() {
    initializeCalendar();
    loadUpcomingClasses();
    setupQuickActions();
    
    // Refresh upcoming classes every minute to keep them current
    setInterval(() => {
        loadUpcomingClasses();
        updateStats(); // Also update stats periodically
    }, 60000); // 60 seconds
    
    // Make loadUpcomingClasses globally accessible for testing
    window.loadUpcomingClasses = loadUpcomingClasses;
    
    // Test function to verify the logic
    window.testUpcomingClasses = function() {
        const now = new Date();
        loadUpcomingClasses();
    };
    
    // Additional test function to debug the specific issue
    window.debugClassFiltering = function() {
        // Debug functionality removed for security
    };
    
    // Test function for date formatting
    window.testDateFormatting = function() {
        // Debug functionality removed for security
    };
    
}

function updateDashboard() {
    updateStats();
    updateCalendar();
    loadUpcomingClasses();
    
    // Re-initialize calendar if dashboard is visible
    const dashboardSection = document.getElementById('dashboard');
    if (dashboardSection && dashboardSection.classList.contains('active')) {
        // Reset calendar initialization to allow re-render
        calendarInitialized = false;
        initializeCalendar();
    }
}

function updateStats() {
    const totalStudents = (appData.estudiante || []).length;
    const averageGrade = calculateAverageGrade();
    const attendanceRate = calculateAttendanceRate();
    const pendingNotifications = (appData.notifications || []).filter(n => !n.read).length;

    // Update KPI cards
    const totalStudentsEl = document.getElementById('totalStudents');
    if (totalStudentsEl) totalStudentsEl.textContent = totalStudents;
    
    const averageGradeEl = document.getElementById('averageGrade');
    if (averageGradeEl) averageGradeEl.textContent = `${averageGrade}%`;
    
    const attendanceRateEl = document.getElementById('attendanceRate');
    if (attendanceRateEl) attendanceRateEl.textContent = `${attendanceRate}%`;
    
    const pendingNotificationsEl = document.getElementById('pendingNotifications');
    if (pendingNotificationsEl) pendingNotificationsEl.textContent = pendingNotifications;

    // Update new KPI cards
    const pendingTasksEl = document.getElementById('pendingTasks');
    if (pendingTasksEl) {
        const pendingTasks = calculatePendingTasks();
        pendingTasksEl.textContent = pendingTasks;
    }

    const nextClassTimeEl = document.getElementById('nextClassTime');
    if (nextClassTimeEl) {
        const nextClass = getNextClassTime();
        nextClassTimeEl.textContent = nextClass;
    }
}

function calculatePendingTasks() {
    let pendingCount = 0;
    
    // Count pending evaluations that need grading
    const evaluations = appData.evaluacion || [];
    const currentUserId = localStorage.getItem('userId');
    
    if (currentUserId) {
        const userSubjects = (appData.materia || []).filter(m => 
            m.Usuarios_docente_ID_docente === parseInt(currentUserId)
        );
        const userSubjectIds = userSubjects.map(s => s.ID_materia);
        
        evaluations.forEach(eval => {
            if (userSubjectIds.includes(eval.Materia_ID_materia)) {
                // Check if there are students without grades for this evaluation
                const notes = appData.notas || [];
                const evaluationNotes = notes.filter(n => n.Evaluacion_ID_evaluacion === eval.ID_evaluacion);
                const students = (appData.estudiante || []).filter(e => {
                    const enrollments = appData.alumnos_x_materia || [];
                    return enrollments.some(enrollment => 
                        enrollment.Estudiante_ID_Estudiante === e.ID_Estudiante &&
                        enrollment.Materia_ID_materia === eval.Materia_ID_materia
                    );
                });
                
                if (evaluationNotes.length < students.length) {
                    pendingCount += (students.length - evaluationNotes.length);
                }
            }
        });
    }
    
    // Count pending topics (content that's not completed)
    const contenido = appData.contenido || [];
    if (currentUserId) {
        const userSubjects = (appData.materia || []).filter(m => 
            m.Usuarios_docente_ID_docente === parseInt(currentUserId)
        );
        const userSubjectIds = userSubjects.map(s => s.ID_materia);
        
        contenido.forEach(content => {
            if (userSubjectIds.includes(content.Materia_ID_materia) && 
                (content.Estado === 'PENDIENTE' || content.Estado === 'EN_PROGRESO')) {
                pendingCount++;
            }
        });
    }
    
    return pendingCount;
}

function getNextClassTime() {
    const nextClasses = getNextTwoClasses();
    if (nextClasses.length === 0) {
        return '--';
    }
    
    const nextClass = nextClasses[0];
    const today = new Date();
    const [year, month, day] = nextClass.date.split('-');
    const classDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    
    const dayNames = {
        es: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'],
        en: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    };
    
    if (classDate.toDateString() === today.toDateString()) {
        return `Hoy ${nextClass.time}`;
    }
    
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    
    if (classDate.toDateString() === tomorrow.toDateString()) {
        return `Mañana ${nextClass.time}`;
    }
    
    return `${dayNames[currentLanguage || 'es'][classDate.getDay()]} ${nextClass.time}`;
}

function setupQuickActions() {
    // Hero section buttons
    const quickCreateClassBtn = document.getElementById('quickCreateClassBtn');
    if (quickCreateClassBtn) {
        quickCreateClassBtn.addEventListener('click', () => {
            if (typeof showSection === 'function') {
                showSection('subjects-management');
            }
        });
    }

    const quickUploadMaterialBtn = document.getElementById('quickUploadMaterialBtn');
    if (quickUploadMaterialBtn) {
        quickUploadMaterialBtn.addEventListener('click', () => {
            if (typeof showSection === 'function') {
                showSection('subjects-management');
            }
        });
    }

    const quickViewReportsBtn = document.getElementById('quickViewReportsBtn');
    if (quickViewReportsBtn) {
        quickViewReportsBtn.addEventListener('click', () => {
            if (typeof showSection === 'function') {
                showSection('reports');
            }
        });
    }

    // Quick action buttons
    const quickActionButtons = document.querySelectorAll('.quick-action-btn');
    quickActionButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const action = btn.getAttribute('data-action');
            if (typeof showSection !== 'function') {
                console.error('showSection function not found');
                return;
            }
            switch(action) {
                case 'students':
                    // Navigate to student management with students subsection
                    showSection('student-management', 'students');
                    break;
                case 'attendance':
                    // Navigate to attendance section and show attendance view
                    showSection('attendance');
                    setTimeout(() => {
                        if (typeof showAttendanceView === 'function') {
                            showAttendanceView();
                        }
                    }, 100);
                    break;
                case 'grades':
                    // Navigate to grade marking section
                    showSection('grade-marking');
                    setTimeout(() => {
                        if (typeof showGradeMarkingView === 'function') {
                            showGradeMarkingView();
                        } else {
                            const gradeMarkingView = document.getElementById('gradeMarkingView');
                            if (gradeMarkingView) {
                                gradeMarkingView.style.display = 'block';
                            }
                        }
                    }, 100);
                    break;
                case 'subjects':
                    // Navigate to subjects management
                    showSection('subjects-management');
                    break;
            }
        });
    });

    // Calendar full view button
    const viewFullCalendarBtn = document.getElementById('viewFullCalendarBtn');
    if (viewFullCalendarBtn) {
        viewFullCalendarBtn.addEventListener('click', () => {
            // Navigate to calendar section
            if (typeof showSection === 'function') {
                showSection('calendar');
            }
        });
    }
}

function calculateAverageGrade() {
    if (!appData.notas || appData.notas.length === 0) return 0;
    const total = appData.notas.reduce((sum, grade) => sum + grade.Calificacion, 0);
    return Math.round(total / appData.notas.length);
}

function calculateAttendanceRate() {
    if (!appData.asistencia || appData.asistencia.length === 0) return 0;
    const presentCount = appData.asistencia.filter(a => a.Presente === 'Y').length;
    return Math.round((presentCount / appData.asistencia.length) * 100);
}

function loadUpcomingClasses() {
    const classesList = document.getElementById('classesList');
    if (!classesList) return;

    const nextClasses = getNextTwoClasses();
    
    if (nextClasses.length === 0) {
        classesList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-calendar-check"></i>
                <h3 data-translate="no_upcoming_classes">No hay clases próximas</h3>
                <p data-translate="no_classes_message">No hay clases programadas para los próximos días.</p>
            </div>
        `;
        return;
    }

    classesList.innerHTML = nextClasses.map(classInfo => {
        const evaluations = getEvaluationsForDate(classInfo.date);
        const hasEvaluations = evaluations.length > 0;
        
        return `
            <div class="class-item ${hasEvaluations ? 'has-evaluations' : ''}">
                <div class="class-header">
                    <div class="class-time">
                        <i class="fas fa-calendar-day"></i>
                        <span>${formatDate(classInfo.date)}</span>
                    </div>
                    <div class="class-schedule">
                        <i class="fas fa-clock"></i>
                        <span>${classInfo.time}</span>
                    </div>
                </div>
                <div class="class-details">
                    <h4>${classInfo.subjectName}</h4>
                    <p class="class-info">                    
                        <span class="classroom">• ${classInfo.classroom}</span>
                    </p>
                    ${hasEvaluations ? `
                        <div class="evaluations">
                            <div class="evaluation-header">
                                <i class="fas fa-clipboard-list"></i>
                                <span data-translate="evaluations_today">Evaluaciones hoy:</span>
                            </div>
                            ${evaluations.map(eval => `
                                <div class="evaluation-item">
                                    <span class="evaluation-title">${eval.Titulo}</span>
                                    <span class="evaluation-type">${getEvaluationTypeLabel(eval.Tipo)}</span>
                                </div>
                            `).join('')}
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }).join('');
}

function getNextTwoClasses() {
    const now = new Date();
    const subjects = appData.materia || [];
    const teachers = appData.usuarios_docente || [];
    const allClasses = [];

    // Get current user ID to filter subjects
    const currentUserId = localStorage.getItem('userId');
    if (!currentUserId) {
        return [];
    }

    subjects.forEach(subject => {
        if (!subject.Horario || subject.Estado !== 'ACTIVA') return;
        
        // Only show classes for subjects assigned to the current user
        if (subject.Usuarios_docente_ID_docente !== parseInt(currentUserId)) return;

        const schedule = parseSchedule(subject.Horario);
        if (!schedule) return;

        const teacher = teachers.find(t => t.ID_docente === subject.Usuarios_docente_ID_docente);
        const teacherName = teacher ? `${teacher.Nombre_docente} ${teacher.Apellido_docente}` : 'Profesor no asignado';

        // Look ahead for next 4 weeks
        for (let daysAhead = 0; daysAhead < 28; daysAhead++) {
            const checkDate = new Date(now);
            checkDate.setDate(now.getDate() + daysAhead);
            
            // Check if this day matches the schedule
            if (schedule.days.includes(checkDate.getDay())) {
                // Format date as YYYY-MM-DD using local timezone
                const year = checkDate.getFullYear();
                const month = String(checkDate.getMonth() + 1).padStart(2, '0');
                const day = String(checkDate.getDate()).padStart(2, '0');
                const dateStr = `${year}-${month}-${day}`;
                
                const [hours, minutes] = schedule.startTime.split(':');
                const classDateTime = new Date(checkDate.getFullYear(), checkDate.getMonth(), checkDate.getDate(), parseInt(hours), parseInt(minutes), 0);
                
                // Only include if class is in the future
                if (classDateTime > now) {
                    allClasses.push({
                        date: dateStr,
                        time: schedule.startTime,
                        subjectName: subject.Nombre,
                        teacherName: teacherName,
                        classroom: subject.Aula || 'Aula por asignar',
                        subjectId: subject.ID_materia,
                        dateTime: classDateTime
                    });
                }
            }
        }
    });

    // Sort by dateTime and take first 2
    return allClasses
        .sort((a, b) => a.dateTime - b.dateTime)
        .slice(0, 2)
        .map(({ dateTime, ...rest }) => rest); // Remove dateTime from result
}

function parseSchedule(horario) {
    if (!horario) return null;

    // Common patterns for schedule parsing (both Spanish and English)
    const patterns = [
        // Spanish: "Lunes y Miércoles 10:00-12:00"
        /(lunes|martes|miércoles|jueves|viernes|sábado|domingo)(?:\s+y\s+(lunes|martes|miércoles|jueves|viernes|sábado|domingo))?\s+(\d{1,2}):(\d{2})-(\d{1,2}):(\d{2})/i,
        // English: "Monday and Wednesday 10:00-12:00"
        /(monday|tuesday|wednesday|thursday|friday|saturday|sunday)(?:\s+and\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday))?\s+(\d{1,2}):(\d{2})-(\d{1,2}):(\d{2})/i,
        // Spanish: "Lunes, Miércoles 13:00-15:00"
        /(lunes|martes|miércoles|jueves|viernes|sábado|domingo)(?:,\s*(lunes|martes|miércoles|jueves|viernes|sábado|domingo))?\s+(\d{1,2}):(\d{2})-(\d{1,2}):(\d{2})/i,
        // English: "Monday, Wednesday 13:00-15:00"
        /(monday|tuesday|wednesday|thursday|friday|saturday|sunday)(?:,\s*(monday|tuesday|wednesday|thursday|friday|saturday|sunday))?\s+(\d{1,2}):(\d{2})-(\d{1,2}):(\d{2})/i,
        // Spanish: "Lunes 13hs"
        /(lunes|martes|miércoles|jueves|viernes|sábado|domingo)\s+(\d{1,2})hs/i,
        // English: "Monday 13hs"
        /(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\s+(\d{1,2})hs/i
    ];

    for (const pattern of patterns) {
        const match = horario.match(pattern);
        if (match) {
            const dayNames = {
                // Spanish
                'lunes': 1, 'martes': 2, 'miércoles': 3, 'jueves': 4, 
                'viernes': 5, 'sábado': 6, 'domingo': 0,
                // English
                'monday': 1, 'tuesday': 2, 'wednesday': 3, 'thursday': 4,
                'friday': 5, 'saturday': 6, 'sunday': 0
            };

            const day1 = dayNames[match[1].toLowerCase()];
            const day2 = match[2] ? dayNames[match[2].toLowerCase()] : null;

            if (pattern === patterns[4] || pattern === patterns[5]) {
                // Format: "Lunes 13hs" or "Monday 13hs"
                const hour = parseInt(match[2]);
                return {
                    days: [day1],
                    startTime: `${hour.toString().padStart(2, '0')}:00`,
                    endTime: `${(hour + 2).toString().padStart(2, '0')}:00`
                };
            } else {
                // Format with time range
                const startHour = parseInt(match[3]);
                const startMin = parseInt(match[4]);
                const endHour = parseInt(match[5]);
                const endMin = parseInt(match[6]);
                
                return {
                    days: day2 ? [day1, day2] : [day1],
                    startTime: `${startHour.toString().padStart(2, '0')}:${startMin.toString().padStart(2, '0')}`,
                    endTime: `${endHour.toString().padStart(2, '0')}:${endMin.toString().padStart(2, '0')}`
                };
            }
        }
    }

    return null;
}

function getNextClassOccurrences(schedule, fromDate, count) {
    const occurrences = [];
    const currentDate = new Date(fromDate);
    const now = new Date();
    
    
    
    // Look ahead up to 4 weeks to find next occurrences
    for (let week = 0; week < 4 && occurrences.length < count; week++) {
        for (let day = 0; day < 7; day++) {
            const checkDate = new Date(currentDate);
            checkDate.setDate(currentDate.getDate() + (week * 7) + day);
            
            if (schedule.days.includes(checkDate.getDay())) {
                const dateStr = checkDate.toISOString().split('T')[0];
                const timeStr = schedule.startTime;
                
                // Create a full datetime object for comparison using local timezone
                const [year, month, day] = dateStr.split('-');
                const [hours, minutes] = timeStr.split(':');
                const classDateTime = new Date(year, month - 1, day, hours, minutes, 0);
                
                
                // Only include future classes (considering both date and time)
                if (classDateTime > now) {
                    occurrences.push({
                        date: dateStr,
                        time: timeStr
                    });
                    
                    if (occurrences.length >= count) break;
                }
            }
        }
    }
    
    return occurrences;
}

function getEvaluationsForDate(date) {
    const evaluations = appData.evaluacion || [];
    return evaluations.filter(eval => eval.Fecha === date);
}

function formatDate(dateStr) {
    // Parse the date string as local date to avoid timezone issues
    const [year, month, day] = dateStr.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    
    // Reset time components to compare only dates
    const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const tomorrowDate = new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate());
    const classDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    
    const dayNames = {
        es: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
        en: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    };
    
    const monthNames = {
        es: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
             'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
        en: ['January', 'February', 'March', 'April', 'May', 'June',
             'July', 'August', 'September', 'October', 'November', 'December']
    };
    
    if (classDate.getTime() === todayDate.getTime()) {
        return currentLanguage === 'es' ? 'Hoy' : 'Today';
    } else if (classDate.getTime() === tomorrowDate.getTime()) {
        return currentLanguage === 'es' ? 'Mañana' : 'Tomorrow';
    } else {
        return `${dayNames[currentLanguage][date.getDay()]}, ${date.getDate()} ${monthNames[currentLanguage][date.getMonth()]}`;
    }
}

function getEvaluationTypeLabel(type) {
    const labels = {
        es: {
            'EXAMEN': 'Examen',
            'PARCIAL': 'Parcial',
            'TRABAJO_PRACTICO': 'Trabajo Práctico',
            'PROYECTO': 'Proyecto',
            'ORAL': 'Examen Oral',
            'PRACTICO': 'Examen Práctico'
        },
        en: {
            'EXAMEN': 'Exam',
            'PARCIAL': 'Midterm',
            'TRABAJO_PRACTICO': 'Assignment',
            'PROYECTO': 'Project',
            'ORAL': 'Oral Exam',
            'PRACTICO': 'Practical Exam'
        }
    };
    
    return labels[currentLanguage][type] || type;
}

// Calendar System
let calendarInitialized = false;
let currentView = 'month'; // 'month' or 'week'
let currentWeekStart = null;
let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();

function initializeCalendar() {
    const calendarGrid = document.getElementById('calendarGrid');
    
    // Reset initialization if calendar grid exists and is empty or if we're on dashboard
    if (calendarInitialized && calendarGrid && calendarGrid.children.length === 0) {
        calendarInitialized = false;
    }
    
    if (calendarInitialized) return;
    
    const currentMonthElement = document.getElementById('currentMonth');
    const prevMonthBtn = document.getElementById('prevMonth');
    const nextMonthBtn = document.getElementById('nextMonth');
    const toggleButtons = document.querySelectorAll('.toggle-btn');

    if (!currentMonthElement || !calendarGrid) return;

    // Check if this is the widget calendar (different structure)
    const isWidget = calendarGrid.classList.contains('calendar-widget-grid') || 
                     calendarGrid.closest('.calendar-widget');

    // Ensure the widget grid class is set
    if (isWidget && !calendarGrid.classList.contains('calendar-widget-grid')) {
        calendarGrid.classList.add('calendar-widget-grid');
    }

    calendarInitialized = true;
    // Use global variables for month and year
    
    // Initialize current week start (Monday of current week)
    const today = new Date();
    const dayOfWeek = today.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Adjust for Sunday = 0
    currentWeekStart = new Date(today);
    currentWeekStart.setDate(today.getDate() + mondayOffset);

    const monthNames = {
        es: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
             'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
        en: ['January', 'February', 'March', 'April', 'May', 'June',
             'July', 'August', 'September', 'October', 'November', 'December']
    };

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dayNamesShort = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

    // Store isWidget in a way that's accessible to nested functions
    const widgetMode = isWidget;

    function renderCalendar() {
        if (currentView === 'month') {
            renderMonthView();
        } else {
            renderWeekView();
        }
    }
    
    // Make renderCalendar globally accessible
    window.renderCalendar = renderCalendar;

    function renderMonthView() {
        currentMonthElement.textContent = `${monthNames[currentLanguage][currentMonth]} ${currentYear}`;
        calendarGrid.innerHTML = '';
        calendarGrid.classList.remove('week-view');

        // For widget calendar, use shorter day names
        const dayNamesForDisplay = widgetMode ? 
            (currentLanguage === 'es' ? ['D', 'L', 'M', 'X', 'J', 'V', 'S'] : ['S', 'M', 'T', 'W', 'T', 'F', 'S']) :
            dayNames;

        // Add day headers
        dayNamesForDisplay.forEach(day => {
            const dayHeader = document.createElement('div');
            dayHeader.className = 'calendar-day-header';
            dayHeader.textContent = day;
            calendarGrid.appendChild(dayHeader);
        });

        // Get first day of month and number of days
        const firstDay = new Date(currentYear, currentMonth, 1).getDay();
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
        const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

        // Add previous month's trailing days
        for (let i = firstDay - 1; i >= 0; i--) {
            const dayElement = document.createElement('div');
            dayElement.className = 'calendar-day other-month';
            const dayNumber = document.createElement('div');
            dayNumber.className = 'day-number';
            dayNumber.textContent = daysInPrevMonth - i;
            dayElement.appendChild(dayNumber);
            calendarGrid.appendChild(dayElement);
        }

        // Add current month's days
        for (let day = 1; day <= daysInMonth; day++) {
            const dayDate = new Date(currentYear, currentMonth, day);
            const dayElement = document.createElement('div');
            dayElement.className = 'calendar-day';
            
            // Add day number
            const dayNumber = document.createElement('div');
            dayNumber.className = 'day-number';
            dayNumber.textContent = day;
            dayElement.appendChild(dayNumber);
            
            // Get events for this day to show indicators
            const dayEvents = getEventsForDate(dayDate);
            
            if (widgetMode) {
                // In widget mode, show a small indicator dot if there are events
                if (dayEvents.length > 0) {
                    const indicator = document.createElement('div');
                    indicator.className = 'calendar-day-indicator';
                    indicator.style.cssText = 'width: 4px; height: 4px; background: #667eea; border-radius: 50%; position: absolute; bottom: 4px; left: 50%; transform: translateX(-50%);';
                    dayElement.style.position = 'relative';
                    dayElement.appendChild(indicator);
                    
                    // Add tooltip on hover
                    dayElement.title = `${dayEvents.length} evento(s)`;
                }
            } else {
                // Full calendar mode - show full event details
                const eventsContainer = document.createElement('div');
                eventsContainer.className = 'day-events';
                
                dayEvents.forEach(event => {
                    const eventElement = document.createElement('div');
                    let className = `event-item ${event.type}`;
                    
                    // Add special styling for recordatorios not belonging to user's subjects
                    if (event.type === 'recordatorio' && event.isUserSubject === false) {
                        className += ' other-subject';
                    }
                    
                    eventElement.className = className;
                    eventElement.innerHTML = `
                        <div class="event-time">${event.time}</div>
                        <div class="event-title">${event.title}</div>
                        <div class="event-type">${event.typeLabel}</div>
                        ${event.subject ? `<div class="event-subject">${event.subject}</div>` : ''}
                    `;
                    
                    // Add click interaction
                    eventElement.addEventListener('click', function() {
                        showEventDetails(event, dayDate);
                    });
                    
                    eventsContainer.appendChild(eventElement);
                });
                
                dayElement.appendChild(eventsContainer);
            }

            // Highlight today
            const today = new Date();
            if (currentYear === today.getFullYear() && 
                currentMonth === today.getMonth() && 
                day === today.getDate()) {
                dayElement.classList.add('today');
            }

            calendarGrid.appendChild(dayElement);
        }

        // Add next month's leading days
        const totalCells = calendarGrid.children.length - 7;
        const remainingCells = 42 - totalCells;
        for (let day = 1; day <= remainingCells; day++) {
            const dayElement = document.createElement('div');
            dayElement.className = 'calendar-day other-month';
            const dayNumber = document.createElement('div');
            dayNumber.className = 'day-number';
            dayNumber.textContent = day;
            dayElement.appendChild(dayNumber);
            calendarGrid.appendChild(dayElement);
        }
    }

    function renderWeekView() {
        const weekEnd = new Date(currentWeekStart);
        weekEnd.setDate(currentWeekStart.getDate() + 6);
        
        const weekStartMonth = currentWeekStart.getMonth();
        const weekStartYear = currentWeekStart.getFullYear();
        const weekEndMonth = weekEnd.getMonth();
        const weekEndYear = weekEnd.getFullYear();
        
        let headerText;
        if (weekStartMonth === weekEndMonth) {
            headerText = `${monthNames[currentLanguage][weekStartMonth]} ${weekStartYear}`;
        } else {
            headerText = `${monthNames[currentLanguage][weekStartMonth]} ${weekStartYear} - ${monthNames[currentLanguage][weekEndMonth]} ${weekEndYear}`;
        }
        
        currentMonthElement.textContent = headerText;
        calendarGrid.innerHTML = '';
        calendarGrid.classList.add('week-view');

        // Add day headers
        dayNamesShort.forEach(day => {
            const dayHeader = document.createElement('div');
            dayHeader.className = 'calendar-day-header';
            dayHeader.textContent = day;
            calendarGrid.appendChild(dayHeader);
        });

        // Add week days with events
        for (let i = 0; i < 7; i++) {
            const dayDate = new Date(currentWeekStart);
            dayDate.setDate(currentWeekStart.getDate() + i);
            
            const dayElement = document.createElement('div');
            dayElement.className = 'calendar-day';
            
            // Add day number
            const dayNumber = document.createElement('div');
            dayNumber.className = 'day-number';
            dayNumber.textContent = dayDate.getDate();
            dayElement.appendChild(dayNumber);
            
            // Add events container
            const eventsContainer = document.createElement('div');
            eventsContainer.className = 'day-events';
            
            // Get events for this day
            const dayEvents = getEventsForDate(dayDate);
            console.log(`Events for ${dayDate.toDateString()}:`, dayEvents);
            dayEvents.forEach(event => {
                const eventElement = document.createElement('div');
                let className = `event-item ${event.type}`;
                
                // Add special styling for recordatorios not belonging to user's subjects
                if (event.type === 'recordatorio' && event.isUserSubject === false) {
                    className += ' other-subject';
                }
                
                eventElement.className = className;
                eventElement.innerHTML = `
                    <div class="event-time">${event.time}</div>
                    <div class="event-title">${event.title}</div>
                    <div class="event-type">${event.typeLabel}</div>
                    ${event.subject ? `<div class="event-subject">${event.subject}</div>` : ''}
                `;
                
                // Add click interaction
                eventElement.addEventListener('click', function() {
                    showEventDetails(event, dayDate);
                });
                
                eventsContainer.appendChild(eventElement);
            });
            
            dayElement.appendChild(eventsContainer);

            // Highlight today
            const today = new Date();
            if (dayDate.toDateString() === today.toDateString()) {
                dayElement.classList.add('today');
            }

            calendarGrid.appendChild(dayElement);
        }
    }

    // Navigation button event listeners
    if (prevMonthBtn) {
        prevMonthBtn.addEventListener('click', function() {
            if (currentView === 'month') {
                currentMonth--;
                if (currentMonth < 0) {
                    currentMonth = 11;
                    currentYear--;
                }
            } else {
                // Week view: go to previous week
                currentWeekStart.setDate(currentWeekStart.getDate() - 7);
            }
            renderCalendar();
        });
    }

    if (nextMonthBtn) {
        nextMonthBtn.addEventListener('click', function() {
            if (currentView === 'month') {
                currentMonth++;
                if (currentMonth > 11) {
                    currentMonth = 0;
                    currentYear++;
                }
            } else {
                // Week view: go to next week
                currentWeekStart.setDate(currentWeekStart.getDate() + 7);
            }
            renderCalendar();
        });
    }

    // Toggle button event listeners
    toggleButtons.forEach(button => {
        button.addEventListener('click', function() {
            const view = this.getAttribute('data-view');
            
            // Update active button
            toggleButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // Update current view
            currentView = view;
            
            // If switching to week view, set current week start to current date
            if (view === 'week') {
                const today = new Date();
                const dayOfWeek = today.getDay();
                const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
                currentWeekStart = new Date(today);
                currentWeekStart.setDate(today.getDate() + mondayOffset);
            }
            
            renderCalendar();
        });
    });

    renderCalendar();
}

function getEventsForDate(date) {
    const events = [];
    const dateStr = formatDateForAPI(date);
    const currentUserId = localStorage.getItem('userId');
    
    if (!currentUserId) {
        return events;
    }
    
    // Get recordatorios for this date
    const recordatorios = appData.recordatorio || [];
    
    recordatorios.forEach(recordatorio => {
        if (recordatorio.Fecha === dateStr) {
            // Get the subject name
            const subject = appData.materia.find(m => m.ID_materia === recordatorio.Materia_ID_materia);
            const subjectName = subject ? subject.Nombre : 'Materia no encontrada';
            
            // Check if this recordatorio is for a subject taught by the current user
            const isUserSubject = subject && subject.Usuarios_docente_ID_docente === parseInt(currentUserId);
            
            // Always show recordatorios, but with different styling based on ownership
            events.push({
                type: 'recordatorio',
                typeLabel: 'Recordatorio',
                title: recordatorio.Descripcion,
                time: getTimeFromRecordatorio(recordatorio),
                priority: recordatorio.Prioridad,
                subject: subjectName,
                isUserSubject: isUserSubject,
                recordatorioType: recordatorio.Tipo
            });
        }
    });
    
    // Get classes for this date
    const subjects = appData.materia || [];
    subjects.forEach(subject => {
        if (subject.Usuarios_docente_ID_docente !== parseInt(currentUserId)) return;
        
        const schedule = parseSchedule(subject.Horario);
        if (!schedule) return;
        
        if (schedule.days.includes(date.getDay())) {
            events.push({
                type: 'clase',
                typeLabel: 'Clase',
                title: subject.Nombre,
                time: schedule.startTime,
                subject: subject.Nombre,
                classroom: subject.Aula || 'Aula por asignar'
            });
        }
    });
    
    // Get evaluations for this date
    const evaluaciones = appData.evaluacion || [];
    evaluaciones.forEach(evaluacion => {
        if (evaluacion.Fecha === dateStr) {
            const subject = appData.materia.find(m => m.ID_materia === evaluacion.Materia_ID_materia);
            const subjectName = subject ? subject.Nombre : 'Materia no encontrada';
            
            events.push({
                type: 'evaluacion',
                typeLabel: evaluacion.Tipo,
                title: evaluacion.Titulo,
                time: '09:00', // Default time for evaluations
                subject: subjectName
            });
        }
    });
    
    // Sort events by time
    return events.sort((a, b) => {
        const timeA = a.time || '00:00';
        const timeB = b.time || '00:00';
        return timeA.localeCompare(timeB);
    });
}

function formatDateForAPI(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function getTimeFromRecordatorio(recordatorio) {
    // For recordatorios, we'll use a default time based on priority
    const priorityTimes = {
        'ALTA': '08:00',
        'MEDIA': '10:00',
        'BAJA': '14:00'
    };
    return priorityTimes[recordatorio.Prioridad] || '09:00';
}

function showEventDetails(event, date) {
    const eventDetails = {
        recordatorio: () => {
            alert(`📝 Recordatorio\n\n${event.title}\n\n📅 Fecha: ${formatDate(date)}\n⏰ Hora: ${event.time}\n📚 Materia: ${event.subject}\n🎯 Prioridad: ${event.priority}`);
        },
        clase: () => {
            alert(`📚 Clase\n\n${event.title}\n\n📅 Fecha: ${formatDate(date)}\n⏰ Hora: ${event.time}\n🏫 Aula: ${event.classroom}`);
        },
        evaluacion: () => {
            alert(`📝 Evaluación\n\n${event.title}\n\n📅 Fecha: ${formatDate(date)}\n⏰ Hora: ${event.time}\n📚 Materia: ${event.subject}\n📋 Tipo: ${event.typeLabel}`);
        }
    };
    
    if (eventDetails[event.type]) {
        eventDetails[event.type]();
    }
}

function updateCalendar() {
    if (calendarInitialized) {
        initializeCalendar();
    }
}

// Debug function to test recordatorios
window.testRecordatorios = function() {
    console.log('=== RECORDATORIOS DEBUG ===');
    console.log('Available recordatorios:', appData.recordatorio);
    console.log('Current user ID from localStorage:', localStorage.getItem('userId'));
    console.log('Available subjects:', appData.materia);
    
    // Show which subjects belong to current user
    const currentUserId = localStorage.getItem('userId');
    const userSubjects = appData.materia.filter(m => m.Usuarios_docente_ID_docente === parseInt(currentUserId));
    console.log('User subjects:', userSubjects);
    
    // Test with a specific date that has recordatorios
    const testDate = new Date('2024-12-20');
    console.log('Testing with date:', testDate);
    const events = getEventsForDate(testDate);
    console.log('Events found:', events);
    
    // Test with another date
    const testDate2 = new Date('2024-12-25');
    console.log('Testing with date:', testDate2);
    const events2 = getEventsForDate(testDate2);
    console.log('Events found:', events2);
    
    // Show all recordatorios with their subject assignments
    console.log('All recordatorios with subjects:');
    appData.recordatorio.forEach(recordatorio => {
        const subject = appData.materia.find(m => m.ID_materia === recordatorio.Materia_ID_materia);
        console.log(`- ${recordatorio.Descripcion} (${recordatorio.Fecha}) -> Subject: ${subject?.Nombre} (Teacher: ${subject?.Usuarios_docente_ID_docente})`);
    });
    
    // Test the notifications system filtering
    console.log('=== NOTIFICATIONS SYSTEM TEST ===');
    if (typeof getRecordatoriosForDocente === 'function') {
        const notificationsRecordatorios = getRecordatoriosForDocente(parseInt(currentUserId));
        console.log('Recordatorios from notifications system:', notificationsRecordatorios);
    } else {
        console.log('getRecordatoriosForDocente function not available');
    }
};

// Function to navigate to a specific week with recordatorios
window.goToWeekWithRecordatorios = function() {
    // Set the calendar to show the week of December 20, 2024 (which has recordatorios)
    currentWeekStart = new Date('2024-12-16'); // Monday of that week
    currentView = 'week';
    
    // Update the toggle buttons
    const toggleButtons = document.querySelectorAll('.toggle-btn');
    toggleButtons.forEach(btn => btn.classList.remove('active'));
    const weekButton = document.querySelector('[data-view="week"]');
    if (weekButton) weekButton.classList.add('active');
    
    // Re-render the calendar
    renderCalendar();
    
};

// Simple test function to check recordatorios
window.testSimpleRecordatorios = function() {
    console.log('=== SIMPLE RECORDATORIOS TEST ===');
    console.log('All recordatorios in data:', appData.recordatorio);
    console.log('Current user ID:', localStorage.getItem('userId'));
    
    // Test date formatting
    const testDate = new Date('2024-12-20');
    const formattedDate = formatDateForAPI(testDate);
    console.log('Test date:', testDate, 'Formatted:', formattedDate);
    
    // Check if any recordatorios match this date
    const matchingRecordatorios = appData.recordatorio.filter(r => r.Fecha === formattedDate);
    console.log('Matching recordatorios for 2024-12-20:', matchingRecordatorios);
    
    // Test the getEventsForDate function directly
    const events = getEventsForDate(testDate);
    console.log('Events returned by getEventsForDate:', events);
};

// Function to test calendar with recordatorios
window.testCalendarWithRecordatorios = function() {
    console.log('=== CALENDAR RECORDATORIOS TEST ===');
    
    // Set user ID to 1 (Ana Martínez) for testing
    localStorage.setItem('userId', '1');
    console.log('Set user ID to 1 for testing');
    
    // Navigate to December 2024 where recordatorios exist
    currentMonth = 11; // December (0-indexed)
    currentYear = 2024;
    currentView = 'month';
    
    // Re-render calendar
    if (typeof renderCalendar === 'function') {
        renderCalendar();
    } else {
        // Re-initialize calendar
        calendarInitialized = false;
        initializeCalendar();
    }
    
    console.log('Calendar should now show December 2024 with recordatorios');
    console.log('Look for recordatorios on dates like 2024-12-20, 2024-12-21, etc.');
    
    // Test specific dates with recordatorios
    const testDates = [
        new Date('2024-12-20'),
        new Date('2024-12-21'),
        new Date('2024-12-22'),
        new Date('2024-12-24'),
        new Date('2024-12-25')
    ];
    
    testDates.forEach(date => {
        const events = getEventsForDate(date);
        console.log(`Events for ${date.toDateString()}:`, events);
    });
};

// Debug function to check recordatorios filtering
window.debugRecordatorios = function() {
    console.log('=== RECORDATORIOS DEBUG ===');
    console.log('Current user ID:', localStorage.getItem('userId'));
    console.log('All recordatorios:', appData.recordatorio);
    
    // Check which subjects belong to current user
    const currentUserId = parseInt(localStorage.getItem('userId'));
    const userSubjects = appData.materia.filter(m => m.Usuarios_docente_ID_docente === currentUserId);
    console.log('User subjects:', userSubjects);
    
    // Check recordatorios for December 20, 2024
    const testDate = new Date('2024-12-20');
    const dateStr = formatDateForAPI(testDate);
    console.log('Test date string:', dateStr);
    
    const matchingRecordatorios = appData.recordatorio.filter(r => r.Fecha === dateStr);
    console.log('Recordatorios for 2024-12-20:', matchingRecordatorios);
    
    // Check which subjects these recordatorios belong to
    matchingRecordatorios.forEach(recordatorio => {
        const subject = appData.materia.find(m => m.ID_materia === recordatorio.Materia_ID_materia);
        const isUserSubject = subject && subject.Usuarios_docente_ID_docente === currentUserId;
        console.log(`Recordatorio: ${recordatorio.Descripcion}`);
        console.log(`  Subject: ${subject?.Nombre} (ID: ${recordatorio.Materia_ID_materia})`);
        console.log(`  Teacher: ${subject?.Usuarios_docente_ID_docente}`);
        console.log(`  Is user's subject: ${isUserSubject}`);
    });
    
    // Test getEventsForDate function
    const events = getEventsForDate(testDate);
    console.log('Events returned by getEventsForDate:', events);
};

// Quick function to navigate to December 2024 and show recordatorios
window.showDecemberRecordatorios = function() {
    console.log('=== SHOWING DECEMBER 2024 RECORDATORIOS ===');
    
    // Set user ID to 1 (Ana Martínez)
    localStorage.setItem('userId', '1');
    
    // Navigate to December 2024
    currentMonth = 11; // December (0-indexed)
    currentYear = 2024;
    currentView = 'month';
    
    // Re-render calendar with new date
    renderCalendar();
    
    console.log('Calendar should now show December 2024');
    console.log('Look for recordatorios on these dates:');
    console.log('- Dec 20: "Revisar ejercicios de álgebra para la próxima clase"');
    console.log('- Dec 21: "Calificar exámenes de matemática"');
    console.log('- Dec 22: "Preparar material para laboratorio de física"');
    console.log('- Dec 24: "Reunión de coordinación académica"');
    console.log('- Dec 25: "Examen parcial de mecánica clásica"');
    console.log('- Dec 26: "Preparar presentación sobre genética"');
    console.log('- Dec 27: "Preparar material didáctico para física"');
    console.log('- Dec 28: "Entrega de informe de laboratorio de química"');
    console.log('- Dec 29: "Revisar protocolos de seguridad en laboratorio"');
    console.log('- Dec 30: "Examen final de biología"');
    console.log('- Dec 31: "Evento de cierre de año académico"');
};

// Function to navigate to a specific month and year
window.navigateToMonth = function(month, year) {
    currentMonth = month;
    currentYear = year;
    renderCalendar();
    console.log(`Navigated to ${month + 1}/${year}`);
};

// Simple function to test recordatorios display
window.testRecordatoriosDisplay = function() {
    console.log('=== TESTING RECORDATORIOS DISPLAY ===');
    
    // Set user ID
    localStorage.setItem('userId', '1');
    
    // Navigate to December 2024
    currentMonth = 11; // December
    currentYear = 2024;
    
    // Re-render calendar
    if (typeof renderCalendar === 'function') {
        renderCalendar();
    } else {
        console.log('renderCalendar function not available, re-initializing calendar');
        calendarInitialized = false;
        initializeCalendar();
    }
    
    // Test a specific date with recordatorios
    const testDate = new Date('2024-12-20');
    const events = getEventsForDate(testDate);
    console.log('Events for Dec 20, 2024:', events);
    
    console.log('Calendar should now show December 2024 with recordatorios');
};

// Function to navigate to January 2025 with new recordatorios
window.showJanuaryRecordatorios = function() {
    console.log('=== SHOWING JANUARY 2025 RECORDATORIOS ===');
    
    // Set user ID
    localStorage.setItem('userId', '1');
    
    // Navigate to January 2025
    currentMonth = 0; // January (0-indexed)
    currentYear = 2025;
    currentView = 'month';
    
    // Re-render calendar
    if (typeof renderCalendar === 'function') {
        renderCalendar();
    } else {
        console.log('renderCalendar function not available, re-initializing calendar');
        calendarInitialized = false;
        initializeCalendar();
    }
    
    console.log('Calendar should now show January 2025 with recordatorios');
    console.log('Look for recordatorios on these dates:');
    console.log('- Jan 15: "Revisar tareas de matemática para mañana"');
    console.log('- Jan 16: "Preparar experimento de física para la próxima clase"');
    console.log('- Jan 17: "Corregir exámenes de química"');
    console.log('- Jan 18: "Preparar material de biología celular"');
    console.log('- Jan 20: "Reunión de coordinación de materias"');
    console.log('- Jan 22: "Examen parcial de matemática"');
    console.log('- Jan 23: "Laboratorio de física - preparar equipos"');
    console.log('- Jan 24: "Entrega de informe de química"');
    console.log('- Jan 25: "Presentación de proyectos de biología"');
    console.log('- And many more throughout January...');
};

// Function to navigate to October 2025 with recordatorios
window.showOctoberRecordatorios = function() {
    console.log('=== SHOWING OCTOBER 2025 RECORDATORIOS ===');
    
    // Set user ID
    localStorage.setItem('userId', '1');
    
    // Navigate to October 2025
    currentMonth = 9; // October (0-indexed)
    currentYear = 2025;
    currentView = 'month';
    
    // Re-render calendar
    if (typeof renderCalendar === 'function') {
        renderCalendar();
    } else {
        console.log('renderCalendar function not available, re-initializing calendar');
        calendarInitialized = false;
        initializeCalendar();
    }
    
    console.log('Calendar should now show October 2025 with recordatorios');
    console.log('Look for recordatorios on these dates:');
    console.log('- Oct 5: "Preparar examen parcial de matemática"');
    console.log('- Oct 7: "Revisar ejercicios de física para la próxima clase"');
    console.log('- Oct 10: "Preparar material de laboratorio de química"');
    console.log('- Oct 12: "Corregir trabajos de biología"');
    console.log('- Oct 15: "Reunión de coordinación académica"');
    console.log('- Oct 18: "Examen parcial de física"');
    console.log('- Oct 20: "Entrega de informe de química"');
    console.log('- Oct 22: "Preparar presentación de biología"');
    console.log('- Oct 25: "Revisar ejercicios de álgebra"');
    console.log('- Oct 28: "Preparar experimento de física"');
    console.log('- Oct 30: "Calificar exámenes de química"');
};

// Function to navigate to November 2025 with recordatorios
window.showNovemberRecordatorios = function() {
    console.log('=== SHOWING NOVEMBER 2025 RECORDATORIOS ===');
    
    // Set user ID
    localStorage.setItem('userId', '1');
    
    // Navigate to November 2025
    currentMonth = 10; // November (0-indexed)
    currentYear = 2025;
    currentView = 'month';
    
    // Re-render calendar
    if (typeof renderCalendar === 'function') {
        renderCalendar();
    } else {
        console.log('renderCalendar function not available, re-initializing calendar');
        calendarInitialized = false;
        initializeCalendar();
    }
    
    console.log('Calendar should now show November 2025 with recordatorios');
    console.log('Look for recordatorios on these dates:');
    console.log('- Nov 2: "Preparar material de biología celular"');
    console.log('- Nov 5: "Revisar ejercicios de cálculo"');
    console.log('- Nov 8: "Laboratorio de física - preparar equipos"');
    console.log('- Nov 10: "Entrega de proyecto de química"');
    console.log('- Nov 12: "Examen final de biología"');
    console.log('- Nov 15: "Reunión de evaluación de materias"');
    console.log('- Nov 18: "Preparar examen final de matemática"');
    console.log('- Nov 20: "Revisar ejercicios de física"');
    console.log('- Nov 22: "Preparar material didáctico de química"');
    console.log('- Nov 25: "Actualizar bibliografía de biología"');
    console.log('- Nov 27: "Revisar ejercicios de álgebra avanzada"');
    console.log('- Nov 29: "Preparar examen final de física"');
};
