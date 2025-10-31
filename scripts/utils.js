// Modal Management
function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        // Ensure the modal is visible
        modal.style.display = '';
        modal.classList.add('active');
        console.log('[showModal] Modal', modalId, 'mostrado. Clase active agregada.');
        
        // Ensure modal handlers are set up
        if (typeof setupModalHandlers === 'function') {
            setupModalHandlers(modalId);
        }
    } else {
        console.error('[showModal] Modal con ID', modalId, 'no encontrado en el DOM');
        console.error('[showModal] Document body:', document.body);
        console.error('[showModal] Available modals:', document.querySelectorAll('.modal'));
    }
}

function closeModal(modal) {
    let modalElement = null;
    
    if (typeof modal === 'string') {
        modalElement = document.getElementById(modal);
    } else if (modal) {
        modalElement = modal;
    }
    
    if (modalElement) {
        // Just hide the modal instead of removing it from DOM
        modalElement.classList.remove('active');
        console.log('[closeModal] Modal closed, element still in DOM:', document.getElementById(modalElement.id) !== null);
    } else {
        console.error('[closeModal] Modal element not found');
    }
}

// Store modal handlers to prevent duplicates - using WeakMap to avoid memory leaks
const modalHandlers = new WeakMap();

function setupModalHandlers(modalId) {
    const modal = typeof modalId === 'string' ? document.getElementById(modalId) : modalId;
    if (!modal) {
        console.error('[setupModalHandlers] Modal not found:', modalId);
        return;
    }

    // Check if handlers are already set up for this modal instance
    if (modalHandlers.has(modal)) {
        console.log('[setupModalHandlers] Handlers already set up for modal:', modalId);
        return; // Don't add duplicate handlers
    }

    // Create new handlers
    const closeBtnElements = modal.querySelectorAll('.close-modal');
    
    // Handler function for backdrop clicks (closing when clicking outside)
    const backdropHandler = (e) => {
        // Only close if clicking directly on the modal backdrop (not on modal-content or its children)
        if (e.target === modal) {
            closeModal(modal);
        }
    };
    
    const buttonHandlers = [];
    
    // Setup close button handlers
    closeBtnElements.forEach(button => {
        const handler = (e) => {
            e.preventDefault();
            e.stopPropagation();
            closeModal(modal);
        };
        button.addEventListener('click', handler);
        buttonHandlers.push({ button, handler });
    });

    // Setup backdrop click handler
    modal.addEventListener('click', backdropHandler);
    
    // Store handlers for reference (though we won't remove them since modal shouldn't be removed)
    modalHandlers.set(modal, { closeButtons: buttonHandlers, backdropHandler });
    
    console.log('[setupModalHandlers] Handlers set up for modal:', modalId);
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
