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
            // Only prevent default for single-page navigation links (those with data-section)
            if (item.dataset.section) {
                e.preventDefault();
                const section = item.dataset.section;
                showSection(section);
                navOverlay.classList.remove('active');
            }
            // Allow external links to navigate normally
        });
    });

    // Handle desktop navigation
    desktopNavItems.forEach(item => {
        item.addEventListener('click', (e) => {
            // Only prevent default for single-page navigation links (those with data-section)
            if (item.dataset.section) {
                e.preventDefault();
                const section = item.dataset.section;
                const subsection = item.dataset.subsection;
                showSection(section, subsection);
            }
            // Allow external links to navigate normally
        });
    });

    // Handle dropdown navigation
    const dropdownItems = document.querySelectorAll('.dropdown-item');
    dropdownItems.forEach(item => {
        item.addEventListener('click', (e) => {
            // Only prevent default for single-page navigation links (those with data-section)
            if (item.dataset.section) {
                e.preventDefault();
                const section = item.dataset.section;
                const subsection = item.dataset.subsection;
                showSection(section, subsection);
            }
            // Allow external links to navigate normally
        });
    });

    // Handle desktop language selector
    const desktopLanguageSelect = document.getElementById('desktopLanguageSelect');
    const mobileLanguageSelect = document.getElementById('languageSelect');
    const desktopLanguageToggle = document.getElementById('desktopLanguageToggle');
    const languageCode = document.getElementById('languageCode');
    
    // Initialize language code display
    if (languageCode) {
        const currentLang = desktopLanguageSelect ? desktopLanguageSelect.value : 'es';
        languageCode.textContent = currentLang.toUpperCase();
    }
    
    if (desktopLanguageSelect && mobileLanguageSelect) {
        // Sync language selectors
        desktopLanguageSelect.addEventListener('change', (e) => {
            mobileLanguageSelect.value = e.target.value;
            if (languageCode) {
                languageCode.textContent = e.target.value.toUpperCase();
            }
            if (typeof translatePage === 'function') {
                translatePage(e.target.value);
            }
        });
        
        mobileLanguageSelect.addEventListener('change', (e) => {
            desktopLanguageSelect.value = e.target.value;
            if (languageCode) {
                languageCode.textContent = e.target.value.toUpperCase();
            }
            if (typeof translatePage === 'function') {
                translatePage(e.target.value);
            }
        });
    }
    
    // Handle language dropdown options
    const languageOptions = document.querySelectorAll('.language-option');
    languageOptions.forEach(option => {
        option.addEventListener('click', () => {
            const selectedLang = option.dataset.lang;
            
            // Update language selectors
            desktopLanguageSelect.value = selectedLang;
            mobileLanguageSelect.value = selectedLang;
            
            // Update language code display
            if (languageCode) {
                languageCode.textContent = selectedLang.toUpperCase();
            }
            
            // Update active state
            languageOptions.forEach(opt => opt.classList.remove('active'));
            option.classList.add('active');
            
            // Change language
            if (typeof translatePage === 'function') {
                translatePage(selectedLang);
            }
        });
    });
    
    // Initialize active language option
    if (languageOptions.length > 0) {
        const currentLang = desktopLanguageSelect ? desktopLanguageSelect.value : 'es';
        const activeOption = document.querySelector(`[data-lang="${currentLang}"]`);
        if (activeOption) {
            activeOption.classList.add('active');
        }
    }

    // Handle desktop logout
    const desktopLogoutBtn = document.getElementById('desktopLogoutBtn');
    const mobileLogoutBtn = document.getElementById('logoutBtn');
    
    if (desktopLogoutBtn) {
        desktopLogoutBtn.addEventListener('click', () => {
            if (typeof logout === 'function') {
                logout();
            } else {
                console.error('Logout function not found');
            }
        });
    }
    
    if (mobileLogoutBtn) {
        mobileLogoutBtn.addEventListener('click', () => {
            if (typeof logout === 'function') {
                logout();
            } else {
                console.error('Logout function not found');
            }
        });
    }
}

function showSection(sectionName, subsection = null) {
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
    
    document.querySelectorAll('.dropdown-item').forEach(item => {
        item.classList.remove('active');
    });
    
    const activeNavItem = document.querySelector(`[data-section="${sectionName}"]`);
    if (activeNavItem) {
        activeNavItem.classList.add('active');
    }

    // Handle subsection for student management
    if (sectionName === 'student-management' && subsection) {
        handleStudentManagementSubsection(subsection);
    }

    currentSection = sectionName;

    // Load section-specific data
    switch (sectionName) {
        case 'dashboard':
            updateDashboard();
            break;
        case 'student-management':
            if (typeof loadUnifiedStudentData === 'function') {
                loadUnifiedStudentData();
            }
            if (typeof loadExams === 'function') {
                loadExams();
            }
            break;
        case 'notifications':
            loadNotifications();
            break;
        case 'reports':
            loadReports();
            break;
    }
}
function handleStudentManagementSubsection(subsection) {
    // Hide all tab content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    // Remove active class from all tab buttons (for mobile compatibility)
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show the selected subsection content and update button visibility
    if (subsection === 'students') {
        const studentsContent = document.getElementById('studentsTabContent');
        if (studentsContent) {
            studentsContent.classList.add('active');
        }
        // Update mobile tab button if it exists
        const studentsTab = document.getElementById('studentsTab');
        if (studentsTab) {
            studentsTab.classList.add('active');
        }
        // Show/hide appropriate action buttons for students
        document.querySelectorAll('.students-only').forEach(btn => btn.style.display = 'flex');
        document.querySelectorAll('.exams-only').forEach(btn => btn.style.display = 'none');
    } else if (subsection === 'exams') {
        const examsContent = document.getElementById('examsTabContent');
        if (examsContent) {
            examsContent.classList.add('active');
        }
        // Update mobile tab button if it exists
        const examsTab = document.getElementById('examsTab');
        if (examsTab) {
            examsTab.classList.add('active');
        }
        // Show/hide appropriate action buttons for exams
        document.querySelectorAll('.students-only').forEach(btn => btn.style.display = 'none');
        document.querySelectorAll('.exams-only').forEach(btn => btn.style.display = 'flex');
    }
    
    // Update dropdown active state
    document.querySelectorAll('.dropdown-item').forEach(item => {
        item.classList.remove('active');
    });
    
    const activeDropdownItem = document.querySelector(`[data-subsection="${subsection}"]`);
    if (activeDropdownItem) {
        activeDropdownItem.classList.add('active');
    }
}

// Make functions globally available
window.initializeNavigation = initializeNavigation;
window.showSection = showSection;
