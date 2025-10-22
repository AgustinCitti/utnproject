// Global variables
let appData = {};
let currentSection = 'dashboard';
let currentLanguage = 'es'; // Default to Spanish

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

async function initializeApp() {
    // Initialize language system
    initializeLanguage();
    
    // Check authentication
    if (window.location.pathname.includes('index.html') || window.location.pathname === '/') {
        if (localStorage.getItem('isLoggedIn') === 'true') {
            window.location.href = 'home.html';
        }
    } else if (window.location.pathname.includes('home.html')) {
        if (localStorage.getItem('isLoggedIn') !== 'true') {
            window.location.href = 'index.html';
            return;
        }
    }

    // Load data
    await loadData();
    
    // Initialize components
    initializeNavigation();
    initializeLogin();
    initializeDashboard();
    initializeUnifiedStudentManagement();
    initializeSubjects();
    initializeGrades();
    initializeNotifications();
    initializeReports();
    initializeAttendance();
    initializeViewToggles();
    
    // Update UI
    updateDashboard();
    updateNotificationCount();
}

// Data Management
async function loadData() {
    try {
        const response = await fetch('../data.json');
        appData = await response.json();
    } catch (error) {
        console.error('Error loading data:', error);
        // Initialize with empty data structure matching database schema
        appData = {
            usuarios_docente: [],
            materia: [],
            estudiante: [],
            alumnos_x_materia: [],
            evaluacion: [],
            notas: [],
            asistencia: [],
            contenido: [],
            tema_estudiante: [],
            archivos: [],
            recordatorio: [],
            notifications: []
        };
    }
}

function saveData() {
    // In a real application, this would save to a database
    // For now, we'll just log the data
    console.log('Data saved:', appData);
}

// Initialize the app when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
    // Check which page we're on
    console.log('Current pathname:', window.location.pathname);
    if (window.location.pathname.includes('index.html') || window.location.pathname === '/') {
        console.log('Initializing landing page');
        initializeLandingPage();
    } else if (window.location.pathname.includes('auth.html')) {
        console.log('Initializing auth page');
        initializeAuthPage();
    } else if (window.location.pathname.includes('login.html')) {
        console.log('Initializing login page');
        initializeLoginPage();
    } else if (window.location.pathname.includes('register.html')) {
        console.log('Initializing register page');
        initializeRegisterPage();
    } else {
        console.log('Initializing app');
        initializeApp();
    }
    });
} else {
    console.log('Current pathname (immediate):', window.location.pathname);
    if (window.location.pathname.includes('index.html') || window.location.pathname === '/') {
        console.log('Initializing landing page (immediate)');
        initializeLandingPage();
    } else if (window.location.pathname.includes('auth.html')) {
        console.log('Initializing auth page (immediate)');
        initializeAuthPage();
    } else if (window.location.pathname.includes('login.html')) {
        console.log('Initializing login page (immediate)');
        initializeLoginPage();
    } else if (window.location.pathname.includes('register.html')) {
        console.log('Initializing register page (immediate)');
        initializeRegisterPage();
    } else {
        console.log('Initializing app (immediate)');
        initializeApp();
    }
}
