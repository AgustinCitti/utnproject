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
    const totalStudents = appData.students.length;
    const averageGrade = calculateAverageGrade();
    const attendanceRate = calculateAttendanceRate();
    const pendingNotifications = appData.notifications.filter(n => !n.read).length;

    document.getElementById('totalStudents').textContent = totalStudents;
    document.getElementById('averageGrade').textContent = `${averageGrade}%`;
    document.getElementById('attendanceRate').textContent = `${attendanceRate}%`;
    document.getElementById('pendingNotifications').textContent = pendingNotifications;
}

function calculateAverageGrade() {
    if (appData.grades.length === 0) return 0;
    const total = appData.grades.reduce((sum, grade) => sum + grade.grade, 0);
    return Math.round(total / appData.grades.length);
}

function calculateAttendanceRate() {
    if (appData.attendance.length === 0) return 0;
    const presentCount = appData.attendance.filter(a => a.status === 'present').length;
    return Math.round((presentCount / appData.attendance.length) * 100);
}

function loadUpcomingClasses() {
    const classesList = document.getElementById('classesList');
    if (!classesList) return;

    const today = new Date();
    const upcomingClasses = appData.classes
        .filter(cls => new Date(cls.date) >= today)
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .slice(0, 5);

    if (upcomingClasses.length === 0) {
        classesList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-calendar-alt"></i>
                <h3>No Upcoming Classes</h3>
                <p>No classes scheduled for the upcoming days.</p>
            </div>
        `;
            return;
        }

    classesList.innerHTML = upcomingClasses.map(cls => {
        const subject = appData.subjects.find(s => s.id === cls.subjectId);
        const teacher = appData.teachers.find(t => t.id === cls.teacherId);
        return `
            <div class="class-item">
                <div class="class-time">${cls.time}</div>
                <div class="class-details">
                    <h4>${subject ? subject.name : 'Unknown Subject'}</h4>
                    <p>${cls.room} • ${teacher ? teacher.firstName + ' ' + teacher.lastName : 'Unknown Teacher'}</p>
                </div>
            </div>
        `;
    }).join('');
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
