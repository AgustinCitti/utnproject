// Navigation System
function initializeNavigation() {
    const menuToggle = document.getElementById('menuToggle');
    const navOverlay = document.getElementById('navOverlay');
    const closeNav = document.getElementById('closeNav');
    const navItems = document.querySelectorAll('.nav-item');
    const desktopNavItems = document.querySelectorAll('.desktop-nav .nav-link');

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

    // Handle mobile navigation
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const section = item.dataset.section;
            showSection(section);
            navOverlay.classList.remove('active');
        });
    });

    // Handle desktop navigation
    desktopNavItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const section = item.dataset.section;
            showSection(section);
        });
    });

    // Handle desktop language selector
    const desktopLanguageSelect = document.getElementById('desktopLanguageSelect');
    const mobileLanguageSelect = document.getElementById('languageSelect');
    
    if (desktopLanguageSelect && mobileLanguageSelect) {
        // Sync language selectors
        desktopLanguageSelect.addEventListener('change', (e) => {
            mobileLanguageSelect.value = e.target.value;
            if (typeof changeLanguage === 'function') {
                changeLanguage(e.target.value);
            }
        });
        
        mobileLanguageSelect.addEventListener('change', (e) => {
            desktopLanguageSelect.value = e.target.value;
            if (typeof changeLanguage === 'function') {
                changeLanguage(e.target.value);
            }
        });
    }

    // Handle desktop logout
    const desktopLogoutBtn = document.getElementById('desktopLogoutBtn');
    const mobileLogoutBtn = document.getElementById('logoutBtn');
    
    if (desktopLogoutBtn && mobileLogoutBtn) {
        desktopLogoutBtn.addEventListener('click', () => {
            if (typeof logout === 'function') {
                logout();
            }
        });
    }
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

    // Update navigation (both mobile and desktop)
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    
    document.querySelectorAll('.desktop-nav .nav-link').forEach(item => {
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
        case 'student-management':
            loadUnifiedStudentData();
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
        case 'attendance':
            loadAttendance();
            break;
    }
}
