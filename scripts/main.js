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
        // Allow users to stay on landing page even if logged in
        // They can manually navigate to home.html if they want
        
        // Update landing page based on login status
        updateLandingPageForLoginStatus();
    } else if (window.location.pathname.includes('home.html')) {
        if (localStorage.getItem('isLoggedIn') !== 'true') {
            window.location.href = 'index.html';
            return;
        }
    }

    // Load data
    await loadData();
    
    // Initialize components
    if (typeof initializeNavigation === 'function') {
        initializeNavigation();
    } else {
        if (typeof window.initializeNavigation === 'function') {
            window.initializeNavigation();
        }
    }
    initializeLogin();
    
    // Solo inicializar componentes si están disponibles (están en home.html, no en index.html)
    if (typeof initializeDashboard === 'function') {
        initializeDashboard();
    }
    if (typeof initializeUnifiedStudentManagement === 'function') {
        initializeUnifiedStudentManagement();
    }
    if (typeof initializeSubjects === 'function') {
        initializeSubjects();
    }
    if (typeof initializeGrades === 'function') {
        initializeGrades();
    }
    if (typeof initializeNotifications === 'function') {
        initializeNotifications();
    }
    if (typeof initializeReports === 'function') {
        initializeReports();
    }
    if (typeof initializeAttendance === 'function') {
        initializeAttendance();
    }
    if (typeof initializeViewToggles === 'function') {
        initializeViewToggles();
    }
    
    // Update UI (solo si las funciones existen)
    if (typeof updateDashboard === 'function') {
        updateDashboard();
    }
    if (typeof updateNotificationCount === 'function') {
        updateNotificationCount();
    }
    
    // Force refresh next class after a short delay to ensure data is fully loaded
    setTimeout(() => {
        if (typeof loadNextClass === 'function') {
            loadNextClass();
        }
        if (typeof updateStats === 'function') {
            updateStats(); // Also update the KPI card
        }
    }, 500);
}

// Data Management
async function loadData() {
    try {
        // Determinar la ruta base según desde dónde se carga
        const isInPages = window.location.pathname.includes('/pages/');
        const baseUrl = isInPages ? '../api' : 'api';
        const response = await fetch(`${baseUrl}/get_data.php`, {
            method: 'GET',
            credentials: 'include', // Include cookies/session for PHP session to work
            headers: {
                'Accept': 'application/json'
            }
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        appData = await response.json();
        // También hacer data disponible globalmente para reports
        window.data = appData;
    } catch (error) {
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
        // Also make empty data available globally
        window.data = appData;
    }
}

function saveData() {
    // In a real application, this would save to a database
}

// Utility function to clear authentication data
function clearAuthData() {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('username');
    window.location.reload();
}

// Make it available globally for debugging
window.clearAuthData = clearAuthData;

// Update landing page based on login status
function updateLandingPageForLoginStatus() {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const username = localStorage.getItem('username') || 'User';
    
    if (isLoggedIn) {
        // Update the hero section to show welcome message for logged-in users
        const heroTitle = document.querySelector('.hero-title');
        const heroButtons = document.querySelector('.hero-buttons');
        
        if (heroTitle) {
            heroTitle.textContent = `Welcome back, ${username}!`;
        }
        
        if (heroButtons) {
            heroButtons.innerHTML = `
                <button class="btn-primary btn-large" onclick="window.location.href='pages/home.html'" data-translate="go_to_dashboard">
                    <span>Go to Dashboard</span>
                    <i class="fas fa-arrow-right"></i>
                </button>
                <button class="btn-secondary btn-large" onclick="scrollToFeatures()" data-translate="learn_more">Discover</button>
            `;
        }
        
        // Update navigation to show logout option
        const navMenu = document.getElementById('navMenu');
        if (navMenu) {
            const loginBtn = navMenu.querySelector('.nav-login');
            const registerBtn = navMenu.querySelector('.nav-register');
            
            if (loginBtn) {
                loginBtn.innerHTML = `
                    <i class="fas fa-sign-out-alt"></i>
                    <span data-translate="logout">Logout</span>
                `;
                loginBtn.onclick = function() {
                    if (typeof logout === 'function') {
                        logout();
                    } else {
                        // Fallback if logout function is not available
                        localStorage.removeItem('isLoggedIn');
                        localStorage.removeItem('username');
                        window.location.href = '../index.html';
                    }
                };
            }
            
            if (registerBtn) {
                registerBtn.style.display = 'none';
            }
        }
    }
}

// Initialize the app when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
    // Check which page we're on
    if (window.location.pathname.includes('index.html') || window.location.pathname === '/') {
        initializeLandingPage();
    } else if (window.location.pathname.includes('auth.html')) {
        initializeAuthPage();
    } else if (window.location.pathname.includes('login.html')) {
        initializeLoginPage();
    } else if (window.location.pathname.includes('register.html')) {
        initializeRegisterPage();
    } else {
        initializeApp();
    }
    });
} else {
    if (window.location.pathname.includes('index.html') || window.location.pathname === '/') {
        initializeLandingPage();
    } else if (window.location.pathname.includes('auth.html')) {
        initializeAuthPage();
    } else if (window.location.pathname.includes('login.html')) {
        initializeLoginPage();
    } else if (window.location.pathname.includes('register.html')) {
        initializeRegisterPage();
    } else {
        initializeApp();
    }
}
