// Modal Management
function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
    }
}

function closeModal(modal) {
    if (typeof modal === 'string') {
        const modalElement = document.getElementById(modal);
        if (modalElement) {
            modalElement.classList.remove('active');
        }
    } else if (modal) {
        modal.remove();
    }
}

function setupModalHandlers(modalId) {
    const modal = typeof modalId === 'string' ? document.getElementById(modalId) : modalId;
    if (!modal) return;

    const closeButtons = modal.querySelectorAll('.close-modal');
    closeButtons.forEach(button => {
        button.addEventListener('click', () => {
            closeModal(modal);
        });
    });

    // Close modal when clicking outside
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal(modal);
        }
    });
}

// Utility Functions
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function formatTime(timeString) {
    return timeString;
}

// View Toggle System
function initializeViewToggles() {
    // Students view toggle
    const studentsGridViewBtn = document.getElementById('studentsGridViewBtn');
    const studentsListViewBtn = document.getElementById('studentsListViewBtn');
    
    if (studentsGridViewBtn && studentsListViewBtn) {
        studentsGridViewBtn.addEventListener('click', () => toggleView('students', 'grid'));
        studentsListViewBtn.addEventListener('click', () => toggleView('students', 'list'));
    }

    // Grades view toggle
    const gradesGridViewBtn = document.getElementById('gradesGridViewBtn');
    const gradesListViewBtn = document.getElementById('gradesListViewBtn');
    
    if (gradesGridViewBtn && gradesListViewBtn) {
        gradesGridViewBtn.addEventListener('click', () => toggleView('grades', 'grid'));
        gradesListViewBtn.addEventListener('click', () => toggleView('grades', 'list'));
    }

    // Attendance view toggle
    const attendanceGridViewBtn = document.getElementById('attendanceGridViewBtn');
    const attendanceListViewBtn = document.getElementById('attendanceListViewBtn');
    
    if (attendanceGridViewBtn && attendanceListViewBtn) {
        attendanceGridViewBtn.addEventListener('click', () => toggleView('attendance', 'grid'));
        attendanceListViewBtn.addEventListener('click', () => toggleView('attendance', 'list'));
    }

    // Exams view toggle
    const examsGridViewBtn = document.getElementById('examsGridViewBtn');
    const examsListViewBtn = document.getElementById('examsListViewBtn');
    
    if (examsGridViewBtn && examsListViewBtn) {
        examsGridViewBtn.addEventListener('click', () => toggleView('exams', 'grid'));
        examsListViewBtn.addEventListener('click', () => toggleView('exams', 'list'));
    }

    // Repository view toggle
    const repositoryGridViewBtn = document.getElementById('repositoryGridViewBtn');
    const repositoryListViewBtn = document.getElementById('repositoryListViewBtn');
    
    if (repositoryGridViewBtn && repositoryListViewBtn) {
        repositoryGridViewBtn.addEventListener('click', () => toggleView('repository', 'grid'));
        repositoryListViewBtn.addEventListener('click', () => toggleView('repository', 'list'));
    }

    // Notifications view toggle
    const notificationsGridViewBtn = document.getElementById('notificationsGridViewBtn');
    const notificationsListViewBtn = document.getElementById('notificationsListViewBtn');
    
    if (notificationsGridViewBtn && notificationsListViewBtn) {
        notificationsGridViewBtn.addEventListener('click', () => toggleView('notifications', 'grid'));
        notificationsListViewBtn.addEventListener('click', () => toggleView('notifications', 'list'));
    }
}

function toggleView(section, view) {
    const gridView = document.getElementById(`${section}Grid`) || document.getElementById(`${section}Container`);
    const listView = document.getElementById(`${section}List`);
    const gridBtn = document.getElementById(`${section}GridViewBtn`);
    const listBtn = document.getElementById(`${section}ListViewBtn`);

    if (view === 'grid') {
        if (gridView) gridView.style.display = 'grid';
        if (listView) listView.style.display = 'none';
        if (gridBtn) gridBtn.classList.add('active');
        if (listBtn) listBtn.classList.remove('active');
    } else {
        if (gridView) gridView.style.display = 'none';
        if (listView) listView.style.display = 'block';
        if (gridBtn) gridBtn.classList.remove('active');
        if (listBtn) listBtn.classList.add('active');
    }
}
