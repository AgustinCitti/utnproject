// Dashboard System
function initializeDashboard() {
    initializeCalendar();
    loadUpcomingClasses();
}

function updateDashboard() {
    updateStats();
    updateCalendar();
    loadUpcomingClasses();
}

function updateStats() {
    const totalStudents = (appData.estudiante || []).length;
    const averageGrade = calculateAverageGrade();
    const attendanceRate = calculateAttendanceRate();
    const pendingNotifications = (appData.notifications || []).filter(n => !n.read).length;

    // Update elements only if they exist on the current page
    const totalStudentsEl = document.getElementById('totalStudents');
    if (totalStudentsEl) totalStudentsEl.textContent = totalStudents;
    
    const averageGradeEl = document.getElementById('averageGrade');
    if (averageGradeEl) averageGradeEl.textContent = `${averageGrade}%`;
    
    const attendanceRateEl = document.getElementById('attendanceRate');
    if (attendanceRateEl) attendanceRateEl.textContent = `${attendanceRate}%`;
    
    const pendingNotificationsEl = document.getElementById('pendingNotifications');
    if (pendingNotificationsEl) pendingNotificationsEl.textContent = pendingNotifications;
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
                <i class="fas fa-calendar-alt"></i>
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
                        <i class="fas fa-chalkboard-teacher"></i>
                        ${classInfo.teacherName}
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
    const today = new Date();
    const subjects = appData.materia || [];
    const teachers = appData.usuarios_docente || [];
    const nextClasses = [];

    subjects.forEach(subject => {
        if (!subject.Horario || subject.Estado !== 'ACTIVA') return;

        const schedule = parseSchedule(subject.Horario);
        if (!schedule) return;

        const teacher = teachers.find(t => t.ID_docente === subject.Usuarios_docente_ID_docente);
        const teacherName = teacher ? `${teacher.Nombre_docente} ${teacher.Apellido_docente}` : 'Profesor no asignado';

        // Find next 2 occurrences of this class
        const classOccurrences = getNextClassOccurrences(schedule, today, 2);
        
        classOccurrences.forEach(occurrence => {
            nextClasses.push({
                date: occurrence.date,
                time: occurrence.time,
                subjectName: subject.Nombre,
                teacherName: teacherName,
                classroom: subject.Aula || 'Aula por asignar',
                subjectId: subject.ID_materia
            });
        });
    });

    // Sort by date and time, then take first 2
    return nextClasses
        .sort((a, b) => {
            const dateA = new Date(`${a.date} ${a.time}`);
            const dateB = new Date(`${b.date} ${b.time}`);
            return dateA - dateB;
        })
        .slice(0, 2);
}

function parseSchedule(horario) {
    if (!horario) return null;

    // Common patterns for schedule parsing
    const patterns = [
        // "Lunes y Miércoles 10:00-12:00"
        /(lunes|martes|miércoles|jueves|viernes|sábado|domingo)(?:\s+y\s+(lunes|martes|miércoles|jueves|viernes|sábado|domingo))?\s+(\d{1,2}):(\d{2})-(\d{1,2}):(\d{2})/i,
        // "Lunes, Miércoles 13:00-15:00"
        /(lunes|martes|miércoles|jueves|viernes|sábado|domingo)(?:,\s*(lunes|martes|miércoles|jueves|viernes|sábado|domingo))?\s+(\d{1,2}):(\d{2})-(\d{1,2}):(\d{2})/i,
        // "Lunes 13hs"
        /(lunes|martes|miércoles|jueves|viernes|sábado|domingo)\s+(\d{1,2})hs/i
    ];

    for (const pattern of patterns) {
        const match = horario.match(pattern);
        if (match) {
            const dayNames = {
                'lunes': 1, 'martes': 2, 'miércoles': 3, 'jueves': 4, 
                'viernes': 5, 'sábado': 6, 'domingo': 0
            };

            const day1 = dayNames[match[1].toLowerCase()];
            const day2 = match[2] ? dayNames[match[2].toLowerCase()] : null;

            if (pattern === patterns[2]) {
                // Format: "Lunes 13hs"
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
    
    // Look ahead up to 4 weeks to find next occurrences
    for (let week = 0; week < 4 && occurrences.length < count; week++) {
        for (let day = 0; day < 7; day++) {
            const checkDate = new Date(currentDate);
            checkDate.setDate(currentDate.getDate() + (week * 7) + day);
            
            if (schedule.days.includes(checkDate.getDay())) {
                const dateStr = checkDate.toISOString().split('T')[0];
                const timeStr = schedule.startTime;
                
                // Only include future dates
                if (checkDate >= fromDate) {
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
    const date = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    
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
    
    if (date.toDateString() === today.toDateString()) {
        return currentLanguage === 'es' ? 'Hoy' : 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
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

function initializeCalendar() {
    if (calendarInitialized) return;
    
    const currentMonthElement = document.getElementById('currentMonth');
    const calendarGrid = document.getElementById('calendarGrid');
    const prevMonthBtn = document.getElementById('prevMonth');
    const nextMonthBtn = document.getElementById('nextMonth');

    if (!currentMonthElement || !calendarGrid) return;

    calendarInitialized = true;
    let currentDate = new Date();
    let currentMonth = currentDate.getMonth();
    let currentYear = currentDate.getFullYear();

    const monthNames = {
        es: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
             'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
        en: ['January', 'February', 'March', 'April', 'May', 'June',
             'July', 'August', 'September', 'October', 'November', 'December']
    };

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    function renderCalendar() {
        currentMonthElement.textContent = `${monthNames[currentLanguage][currentMonth]} ${currentYear}`;
        calendarGrid.innerHTML = '';

        // Add day headers
        dayNames.forEach(day => {
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
            dayElement.textContent = daysInPrevMonth - i;
            calendarGrid.appendChild(dayElement);
        }

        // Add current month's days
        for (let day = 1; day <= daysInMonth; day++) {
            const dayElement = document.createElement('div');
            dayElement.className = 'calendar-day';
            dayElement.textContent = day;

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
            dayElement.textContent = day;
            calendarGrid.appendChild(dayElement);
        }
    }

    if (prevMonthBtn) {
        prevMonthBtn.addEventListener('click', function() {
            currentMonth--;
            if (currentMonth < 0) {
                currentMonth = 11;
                currentYear--;
            }
            renderCalendar();
        });
    }

    if (nextMonthBtn) {
        nextMonthBtn.addEventListener('click', function() {
            currentMonth++;
            if (currentMonth > 11) {
                currentMonth = 0;
                currentYear++;
            }
            renderCalendar();
        });
    }

    renderCalendar();
}

function updateCalendar() {
    if (calendarInitialized) {
        initializeCalendar();
    }
}
