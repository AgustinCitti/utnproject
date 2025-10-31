// Global variables
let appData = {};
let currentSection = 'dashboard';
let currentLanguage = 'es'; // Default to Spanish

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

async function initializeApp() {
    console.log('initializeApp called');
    console.log('Available functions at start:', typeof initializeNavigation, typeof initializeLogin);
    
    // Initialize language system
    initializeLanguage();
    
    // Check authentication
    if (window.location.pathname.includes('index.html') || window.location.pathname === '/') {
        // Allow users to stay on landing page even if logged in
        // They can manually navigate to home.html if they want
        console.log('Landing page - user can stay here even if logged in');
        
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
        console.error('initializeNavigation function not found - checking window object');
        if (typeof window.initializeNavigation === 'function') {
            window.initializeNavigation();
        } else {
            console.error('initializeNavigation not found in window object either');
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
    
    // Update UI
    updateDashboard();
    updateNotificationCount();
}

// Data Management
async function loadData() {
    try {
        // Determinar la ruta base según desde dónde se carga
        const isInPages = window.location.pathname.includes('/pages/');
        const baseUrl = isInPages ? '../api' : 'api';
        const response = await fetch(`${baseUrl}/get_data.php`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        appData = await response.json();
        // También hacer data disponible globalmente para reports
        window.data = appData;
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
        // Also make empty data available globally
        window.data = appData;
    }
}

function saveData() {
    // In a real application, this would save to a database
    // For now, we'll just log the data
    console.log('Data saved:', appData);
}

// Utility function to clear authentication data
function clearAuthData() {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('username');
    console.log('Authentication data cleared');
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
