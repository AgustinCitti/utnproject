// Navigation System
function initializeNavigation() {
    const menuToggle = document.getElementById('menuToggle');
    const navOverlay = document.getElementById('navOverlay');
    const closeNav = document.getElementById('closeNav');
    const navItems = document.querySelectorAll('.nav-item');

    // Toggle mobile navigation
    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            navOverlay.classList.add('active');
        });
    }

    if (closeNav) {
        closeNav.addEventListener('click', () => {
            navOverlay.classList.remove('active');
        });
    }

    // Close nav when clicking overlay
    if (navOverlay) {
        navOverlay.addEventListener('click', (e) => {
            if (e.target === navOverlay) {
                navOverlay.classList.remove('active');
            }
        });
    }

    // Handle navigation
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const section = item.dataset.section;
            showSection(section);
            navOverlay.classList.remove('active');
        });
    });
}

function showSection(sectionName) {
    // Hide all sections
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });

    // Show selected section
    const targetSection = document.getElementById(sectionName);
    if (targetSection) {
        targetSection.classList.add('active');
    }

    // Update navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    
    const activeNavItem = document.querySelector(`[data-section="${sectionName}"]`);
    if (activeNavItem) {
        activeNavItem.classList.add('active');
    }

    currentSection = sectionName;

    // Load section-specific data
    switch (sectionName) {
        case 'dashboard':
            updateDashboard();
            break;
        case 'students':
            loadStudents();
            break;
        case 'grades':
            loadGrades();
            break;
        case 'attendance':
            loadAttendance();
            break;
        case 'exams':
            loadExams();
            break;
        case 'repository':
            loadRepository();
            break;
        case 'notifications':
            loadNotifications();
            break;
        case 'reports':
            loadReports();
            break;
    }
}
