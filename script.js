// Global variables
let appData = {};
let currentSection = 'dashboard';
let currentLanguage = 'es'; // Default to Spanish

// Translation system
const translations = {
    es: {
        // Landing page
        hero_title: "Transforma tu Gestión Académica",
        hero_subtitle: "EduSync es un sistema integral de gestión académica diseñado para ahorrar a los profesores más del 30% de su tiempo en tareas administrativas.",
        get_started: "Comenzar",
        learn_more: "Saber Más",
        features_title: "Características Principales",
        student_management: "Gestión de Estudiantes",
        student_management_desc: "Registro completo de estudiantes, seguimiento de matrículas y gestión de registros académicos.",
        grade_tracking: "Seguimiento de Calificaciones",
        grade_tracking_desc: "Cálculos automáticos de calificaciones, análisis de rendimiento e informes completos.",
        attendance: "Seguimiento de Asistencia",
        attendance_desc: "Monitoreo de asistencia en tiempo real con seguimiento de estado y cálculos de porcentaje.",
        exam_repository: "Repositorio de Exámenes",
        exam_repository_desc: "Gestión centralizada de exámenes con plantillas reutilizables y bancos de preguntas.",
        notifications: "Notificaciones",
        notifications_desc: "Sistema de comunicación integrado para profesores y estudiantes con actualizaciones en tiempo real.",
        mobile_first: "Diseño Mobile-First",
        mobile_first_desc: "Diseño responsivo optimizado para dispositivos móviles con interfaz táctil.",
        about_title: "Acerca de EduSync",
        about_desc: "EduSync es un sistema integral de gestión académica diseñado para optimizar la administración educativa y ahorrar a los profesores más del 30% de su tiempo en tareas administrativas.",
        time_saved: "Tiempo Ahorrado",
        mobile_optimized: "Optimizado para Móviles",
        accessibility: "Accesibilidad",
        registration_title: "¿Listo para Comenzar?",
        registration_desc: "Únete a miles de educadores que ya han transformado su gestión académica con EduSync.",
        teacher_registration: "Registro de Profesores",
        teacher_registration_desc: "Accede a la plataforma completa de EduSync con todas las características y capacidades.",
        general_user: "Usuario General",
        general_user_desc: "Regístrate como usuario general para acceder a características básicas e información.",
        login_now: "Iniciar Sesión Ahora",
        register_now: "Registrarse Ahora",
        login_title: "Iniciar Sesión en EduSync",
        registration_modal_title: "Registrarse como Usuario General",
        institution: "Institución",
        role: "Rol",
        teacher: "Profesor",
        administrator: "Administrador",
        student: "Estudiante",
        parent: "Padre/Madre",
        register: "Registrarse",
        features: "Características",
        about: "Acerca de",
        contact: "Contacto",
        login: "Iniciar Sesión",
        register: "Registrarse",
        
        // Login page
        welcome_back: "Bienvenido de Nuevo",
        sign_in_message: "Inicia sesión en tu cuenta",
        username: "Usuario",
        password: "Contraseña",
        sign_in: "Iniciar Sesión",
        login_note: "Por ahora, puedes iniciar sesión con cualquier usuario y contraseña",
        login_subtitle: "Inicia sesión en tu cuenta de EduSync",
        remember_me: "Recordarme",
        forgot_password: "¿Olvidaste tu contraseña?",
        continue_with_google: "Continuar con Google",
        continue_with_microsoft: "Continuar con Microsoft",
        or: "o",
        no_account: "¿No tienes una cuenta?",
        register_now: "Regístrate ahora",
        login_illustration_title: "Transforma tu Enseñanza",
        login_illustration_desc: "Únete a miles de educadores que ya han optimizado su gestión académica con EduSync.",
        save_time: "Ahorra 30% de tu tiempo",
        mobile_optimized: "Optimizado para móviles",
        secure_platform: "Plataforma segura",
        join_edusync: "Únete a EduSync",
        register_subtitle: "Crea tu cuenta para comenzar",
        select_role: "Selecciona tu rol",
        confirm_password: "Confirmar Contraseña",
        agree_terms: "Acepto los <a href='#' class='terms-link'>Términos de Servicio</a> y la <a href='#' class='terms-link'>Política de Privacidad</a>",
        create_account: "Crear Cuenta",
        already_have_account: "¿Ya tienes una cuenta?",
        register_illustration_title: "Únete a Nuestra Comunidad",
        register_illustration_desc: "Forma parte de una comunidad en crecimiento de educadores que están transformando la gestión académica.",
        save_time_benefit: "Ahorra Tiempo",
        save_time_desc: "Reduce las tareas administrativas en un 30%",
        mobile_access_benefit: "Acceso Móvil",
        mobile_access_desc: "Accede a tus datos en cualquier lugar, en cualquier momento",
        secure_data_benefit: "Datos Seguros",
        secure_data_desc: "Tu información está protegida y es segura",
        home: "Inicio",
        auth_illustration_title: "Transforma tu Gestión Académica",
        auth_illustration_desc: "Únete a miles de educadores que ya han optimizado su gestión académica con EduSync.",
        
        // Navigation
        dashboard: "Panel de Control",
        students: "Estudiantes",
        grades: "Calificaciones",
        attendance: "Asistencia",
        exams: "Exámenes",
        repository: "Repositorio",
        notifications: "Notificaciones",
        reports: "Reportes",
        language: "Idioma",
        
        // Dashboard
        total_students: "Total Estudiantes",
        average_grade: "Promedio de Calificaciones",
        attendance_rate: "Tasa de Asistencia",
        calendar: "Calendario",
        upcoming_classes: "Próximas Clases",
        welcome_user: "¡Bienvenido, Usuario!",
        
        // Sections
        student_management: "Gestión de Estudiantes",
        grade_management: "Gestión de Calificaciones",
        attendance_tracking: "Seguimiento de Asistencia",
        exam_repository: "Repositorio de Exámenes",
        academic_repository: "Repositorio Académico",
        reports_analytics: "Reportes y Análisis",
        
        // Actions
        add_student: "Agregar Estudiante",
        add_grade: "Agregar Calificación",
        mark_attendance: "Marcar Asistencia",
        create_exam: "Crear Examen",
        upload_file: "Subir Archivo",
        mark_all_read: "Marcar Todo como Leído",
        
        // Forms
        add_edit_student: "Agregar/Editar Estudiante",
        first_name: "Nombre",
        last_name: "Apellido",
        email: "Correo Electrónico",
        grade: "Grado",
        student: "Estudiante",
        subject: "Materia",
        grade_value: "Calificación (0-100)",
        type: "Tipo",
        description: "Descripción",
        cancel: "Cancelar",
        save_student: "Guardar Estudiante",
        save_grade: "Guardar Calificación",
        
        // Grade options
        "9th_grade": "9º Grado",
        "10th_grade": "10º Grado",
        "11th_grade": "11º Grado",
        "12th_grade": "12º Grado",
        exam: "Examen",
        homework: "Tarea",
        lab: "Laboratorio",
        project: "Proyecto",
        
        // Months
        january: "Enero",
        february: "Febrero",
        march: "Marzo",
        april: "Abril",
        may: "Mayo",
        june: "Junio",
        july: "Julio",
        august: "Agosto",
        september: "Septiembre",
        october: "Octubre",
        november: "Noviembre",
        december: "Diciembre"
    },
    en: {
        // Landing page
        hero_title: "Transform Your Academic Management",
        hero_subtitle: "EduSync is a comprehensive academic management system designed to save teachers more than 30% of their time on administrative tasks.",
        get_started: "Get Started",
        learn_more: "Learn More",
        features_title: "Key Features",
        student_management: "Student Management",
        student_management_desc: "Complete student registration, enrollment tracking, and academic record management.",
        grade_tracking: "Grade Tracking",
        grade_tracking_desc: "Automated grade calculations, performance analytics, and comprehensive reporting.",
        attendance: "Attendance Tracking",
        attendance_desc: "Real-time attendance monitoring with status tracking and percentage calculations.",
        exam_repository: "Exam Repository",
        exam_repository_desc: "Centralized exam management with reusable templates and question banks.",
        notifications: "Notifications",
        notifications_desc: "Built-in communication system for teachers and students with real-time updates.",
        mobile_first: "Mobile-First Design",
        mobile_first_desc: "Responsive design optimized for mobile devices with touch-friendly interface.",
        about_title: "About EduSync",
        about_desc: "EduSync is a comprehensive academic management system designed to streamline educational administration and save teachers more than 30% of their time on administrative tasks.",
        time_saved: "Time Saved",
        mobile_optimized: "Mobile Optimized",
        accessibility: "Accessibility",
        registration_title: "Ready to Get Started?",
        registration_desc: "Join thousands of educators who have already transformed their academic management with EduSync.",
        teacher_registration: "Teacher Registration",
        teacher_registration_desc: "Access the full EduSync platform with all features and capabilities.",
        general_user: "General User",
        general_user_desc: "Register as a general user to access basic features and information.",
        login_now: "Login Now",
        register_now: "Register Now",
        login_title: "Login to EduSync",
        registration_modal_title: "Register as General User",
        institution: "Institution",
        role: "Role",
        teacher: "Teacher",
        administrator: "Administrator",
        student: "Student",
        parent: "Parent",
        register: "Register",
        features: "Features",
        about: "About",
        contact: "Contact",
        login: "Login",
        register: "Register",
        
        // Login page
        welcome_back: "Welcome Back",
        sign_in_message: "Sign in to your account",
        username: "Username",
        password: "Password",
        sign_in: "Sign In",
        login_note: "For now, you can login with any username and password",
        login_subtitle: "Sign in to your EduSync account",
        remember_me: "Remember me",
        forgot_password: "Forgot password?",
        continue_with_google: "Continue with Google",
        continue_with_microsoft: "Continue with Microsoft",
        or: "or",
        no_account: "Don't have an account?",
        register_now: "Register now",
        login_illustration_title: "Transform Your Teaching",
        login_illustration_desc: "Join thousands of educators who have already streamlined their academic management with EduSync.",
        save_time: "Save 30% of your time",
        mobile_optimized: "Mobile-optimized",
        secure_platform: "Secure platform",
        join_edusync: "Join EduSync",
        register_subtitle: "Create your account to get started",
        select_role: "Select your role",
        confirm_password: "Confirm Password",
        agree_terms: "I agree to the <a href='#' class='terms-link'>Terms of Service</a> and <a href='#' class='terms-link'>Privacy Policy</a>",
        create_account: "Create Account",
        already_have_account: "Already have an account?",
        register_illustration_title: "Join Our Community",
        register_illustration_desc: "Become part of a growing community of educators who are transforming academic management.",
        save_time_benefit: "Save Time",
        save_time_desc: "Reduce administrative tasks by 30%",
        mobile_access_benefit: "Mobile Access",
        mobile_access_desc: "Access your data anywhere, anytime",
        secure_data_benefit: "Secure Data",
        secure_data_desc: "Your information is protected and secure",
        home: "Home",
        auth_illustration_title: "Transform Your Academic Management",
        auth_illustration_desc: "Join thousands of educators who have already streamlined their academic management with EduSync.",
        
        // Navigation
        dashboard: "Dashboard",
        students: "Students",
        grades: "Grades",
        attendance: "Attendance",
        exams: "Exams",
        repository: "Repository",
        notifications: "Notifications",
        reports: "Reports",
        language: "Language",
        
        // Dashboard
        total_students: "Total Students",
        average_grade: "Average Grade",
        attendance_rate: "Attendance Rate",
        calendar: "Calendar",
        upcoming_classes: "Upcoming Classes",
        welcome_user: "Welcome, User!",
        
        // Sections
        student_management: "Student Management",
        grade_management: "Grade Management",
        attendance_tracking: "Attendance Tracking",
        exam_repository: "Exam Repository",
        academic_repository: "Academic Repository",
        reports_analytics: "Reports & Analytics",
        
        // Actions
        add_student: "Add Student",
        add_grade: "Add Grade",
        mark_attendance: "Mark Attendance",
        create_exam: "Create Exam",
        upload_file: "Upload File",
        mark_all_read: "Mark All Read",
        
        // Forms
        add_edit_student: "Add/Edit Student",
        first_name: "First Name",
        last_name: "Last Name",
        email: "Email",
        grade: "Grade",
        student: "Student",
        subject: "Subject",
        grade_value: "Grade (0-100)",
        type: "Type",
        description: "Description",
        cancel: "Cancel",
        save_student: "Save Student",
        save_grade: "Save Grade",
        
        // Grade options
        "9th_grade": "9th Grade",
        "10th_grade": "10th Grade",
        "11th_grade": "11th Grade",
        "12th_grade": "12th Grade",
        exam: "Exam",
        homework: "Homework",
        lab: "Lab",
        project: "Project",
        
        // Months
        january: "January",
        february: "February",
        march: "March",
        april: "April",
        may: "May",
        june: "June",
        july: "July",
        august: "August",
        september: "September",
        october: "October",
        november: "November",
        december: "December"
    }
};

// Translation functions
function translatePage(language) {
    currentLanguage = language;
    document.documentElement.lang = language;
    
    // Update all elements with data-translate attribute
    const elements = document.querySelectorAll('[data-translate]');
    elements.forEach(element => {
        const key = element.getAttribute('data-translate');
        if (translations[language] && translations[language][key]) {
            element.textContent = translations[language][key];
        }
    });
    
    // Update month names in calendar
    updateCalendarMonths(language);
    
    // Save language preference
    localStorage.setItem('language', language);
}

function updateCalendarMonths(language) {
    const monthNames = {
        es: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
             'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
        en: ['January', 'February', 'March', 'April', 'May', 'June',
             'July', 'August', 'September', 'October', 'November', 'December']
    };
    
    // Update calendar if it exists
    if (window.calendarInitialized) {
        // This will be handled in the calendar initialization
    }
}

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
    initializeStudents();
    initializeGrades();
    initializeAttendance();
    initializeExams();
    initializeRepository();
    initializeNotifications();
    initializeReports();
    initializeViewToggles();
    
    // Update UI
    updateDashboard();
    updateNotificationCount();
}

// Language initialization
function initializeLanguage() {
    // Get saved language or default to Spanish
    const savedLanguage = localStorage.getItem('language') || 'es';
    currentLanguage = savedLanguage;
    
    // Set up language selector
    const languageSelect = document.getElementById('languageSelect');
    if (languageSelect) {
        languageSelect.value = savedLanguage;
        languageSelect.addEventListener('change', function() {
            translatePage(this.value);
        });
    }
    
    // Apply translations
    translatePage(savedLanguage);
}

// Data Management
async function loadData() {
    try {
        const response = await fetch('data.json');
        appData = await response.json();
    } catch (error) {
        console.error('Error loading data:', error);
        // Initialize with empty data structure
        appData = {
            students: [],
            teachers: [],
            subjects: [],
            grades: [],
            attendance: [],
            exams: [],
            notifications: [],
            classes: []
        };
    }
}

function saveData() {
    // In a real application, this would save to a database
    // For now, we'll just log the data
    console.log('Data saved:', appData);
}

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

// Login System
function initializeLogin() {
    const loginForm = document.getElementById('loginForm');
    const logoutBtn = document.getElementById('logoutBtn');
    const welcomeUser = document.getElementById('welcomeUser');

    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            
            if (username && password) {
                localStorage.setItem('isLoggedIn', 'true');
                localStorage.setItem('username', username);
                window.location.href = 'home.html';
            } else {
                alert('Please enter both username and password');
            }
        });
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            localStorage.removeItem('isLoggedIn');
            localStorage.removeItem('username');
            window.location.href = 'index.html';
        });
    }

    if (welcomeUser) {
        const username = localStorage.getItem('username') || 'User';
        welcomeUser.textContent = `Welcome, ${username}!`;
    }
}

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

// Student Management
function initializeStudents() {
    const addStudentBtn = document.getElementById('addStudentBtn');
    const studentModal = document.getElementById('studentModal');
    const studentForm = document.getElementById('studentForm');

    if (addStudentBtn) {
        addStudentBtn.addEventListener('click', () => {
            showModal('studentModal');
            clearStudentForm();
        });
    }

    if (studentForm) {
        studentForm.addEventListener('submit', (e) => {
            e.preventDefault();
            saveStudent();
        });
    }

    // Modal close handlers
    setupModalHandlers('studentModal');
}

function loadStudents() {
    const studentsGrid = document.getElementById('studentsGrid');
    const studentsList = document.getElementById('studentsList');
    
    if (!studentsGrid || !studentsList) return;

    // Grid view
    studentsGrid.innerHTML = appData.students.map(student => `
        <div class="card">
            <div class="card-header">
                <h3 class="card-title">${student.firstName} ${student.lastName}</h3>
                <div class="card-actions">
                    <button class="btn-icon btn-edit" onclick="editStudent(${student.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon btn-delete" onclick="deleteStudent(${student.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            <div class="card-content">
                <p><strong>Email:</strong> ${student.email}</p>
                <p><strong>Student ID:</strong> ${student.studentId}</p>
                <p><strong>Grade:</strong> ${student.grade}</p>
                <p><strong>Status:</strong> <span class="status-${student.status}">${student.status}</span></p>
            </div>
        </div>
    `).join('');

    // List view - Table format
    studentsList.innerHTML = `
        <div class="table-responsive">
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>ID</th>
                        <th>Grade</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${appData.students.map(student => `
                        <tr>
                            <td><strong>${student.firstName} ${student.lastName}</strong></td>
                            <td title="${student.email}">${student.email.length > 15 ? student.email.substring(0, 15) + '...' : student.email}</td>
                            <td>${student.studentId}</td>
                            <td>${student.grade}</td>
                            <td><span class="table-status ${student.status}">${student.status}</span></td>
                            <td>
                                <div class="table-actions">
                                    <button class="btn-icon btn-edit" onclick="editStudent(${student.id})" title="Edit">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button class="btn-icon btn-delete" onclick="deleteStudent(${student.id})" title="Delete">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

function saveStudent() {
    const formData = {
        firstName: document.getElementById('studentFirstName').value,
        lastName: document.getElementById('studentLastName').value,
        email: document.getElementById('studentEmail').value,
        grade: document.getElementById('studentGrade').value
    };

    const newStudent = {
        id: Date.now(),
        ...formData,
        studentId: `STU${String(Date.now()).slice(-3)}`,
        subjects: [],
        enrollmentDate: new Date().toISOString().split('T')[0],
        status: 'active'
    };

    appData.students.push(newStudent);
    saveData();
    closeModal('studentModal');
    loadStudents();
    updateDashboard();
}

function editStudent(id) {
    const student = appData.students.find(s => s.id === id);
    if (!student) return;

    document.getElementById('studentFirstName').value = student.firstName;
    document.getElementById('studentLastName').value = student.lastName;
    document.getElementById('studentEmail').value = student.email;
    document.getElementById('studentGrade').value = student.grade;

    showModal('studentModal');
}

function deleteStudent(id) {
    if (confirm('Are you sure you want to delete this student?')) {
        appData.students = appData.students.filter(s => s.id !== id);
        saveData();
        loadStudents();
        updateDashboard();
    }
}

function clearStudentForm() {
    document.getElementById('studentForm').reset();
}

// Grade Management
function initializeGrades() {
    const addGradeBtn = document.getElementById('addGradeBtn');
    const gradeModal = document.getElementById('gradeModal');
    const gradeForm = document.getElementById('gradeForm');

    if (addGradeBtn) {
        addGradeBtn.addEventListener('click', () => {
            showModal('gradeModal');
            populateGradeForm();
        });
    }

    if (gradeForm) {
        gradeForm.addEventListener('submit', (e) => {
            e.preventDefault();
            saveGrade();
        });
    }

    setupModalHandlers('gradeModal');
}

function loadGrades() {
    const gradesContainer = document.getElementById('gradesContainer');
    const gradesList = document.getElementById('gradesList');
    
    if (!gradesContainer || !gradesList) return;

    // Grid view
    gradesContainer.innerHTML = appData.grades.map(grade => {
        const student = appData.students.find(s => s.id === grade.studentId);
        const subject = appData.subjects.find(s => s.id === grade.subjectId);
        return `
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">${student ? student.firstName + ' ' + student.lastName : 'Unknown Student'}</h3>
                    <div class="card-actions">
                        <button class="btn-icon btn-edit" onclick="editGrade(${grade.id})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-icon btn-delete" onclick="deleteGrade(${grade.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <div class="card-content">
                    <p><strong>Subject:</strong> ${subject ? subject.name : 'Unknown Subject'}</p>
                    <p><strong>Grade:</strong> ${grade.grade}/100</p>
                    <p><strong>Type:</strong> ${grade.type}</p>
                    <p><strong>Date:</strong> ${grade.date}</p>
                    ${grade.description ? `<p><strong>Description:</strong> ${grade.description}</p>` : ''}
                </div>
            </div>
        `;
    }).join('');

    // List view - Table format
    gradesList.innerHTML = `
        <div class="table-responsive">
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Student</th>
                        <th>Subject</th>
                        <th>Grade</th>
                        <th>Type</th>
                        <th>Date</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${appData.grades.map(grade => {
                        const student = appData.students.find(s => s.id === grade.studentId);
                        const subject = appData.subjects.find(s => s.id === grade.subjectId);
                        const gradeClass = grade.grade >= 80 ? 'grade-excellent' : grade.grade >= 60 ? 'grade-good' : 'grade-poor';
                        const shortDate = grade.date.split('-').slice(1).join('/');
                        return `
                            <tr>
                                <td><strong>${student ? student.firstName + ' ' + student.lastName : 'Unknown'}</strong></td>
                                <td>${subject ? subject.name : 'Unknown'}</td>
                                <td><span class="table-status ${gradeClass}">${grade.grade}</span></td>
                                <td>${grade.type}</td>
                                <td>${shortDate}</td>
                                <td>
                                    <div class="table-actions">
                                        <button class="btn-icon btn-edit" onclick="editGrade(${grade.id})" title="Edit">
                                            <i class="fas fa-edit"></i>
                                        </button>
                                        <button class="btn-icon btn-delete" onclick="deleteGrade(${grade.id})" title="Delete">
                                            <i class="fas fa-trash"></i>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        </div>
    `;
}

function populateGradeForm() {
    const studentSelect = document.getElementById('gradeStudent');
    const subjectSelect = document.getElementById('gradeSubject');

    // Populate students
    studentSelect.innerHTML = appData.students.map(student => 
        `<option value="${student.id}">${student.firstName} ${student.lastName}</option>`
    ).join('');

    // Populate subjects
    subjectSelect.innerHTML = appData.subjects.map(subject => 
        `<option value="${subject.id}">${subject.name}</option>`
    ).join('');
}

function saveGrade() {
    const formData = {
        studentId: parseInt(document.getElementById('gradeStudent').value),
        subjectId: parseInt(document.getElementById('gradeSubject').value),
        grade: parseInt(document.getElementById('gradeValue').value),
        type: document.getElementById('gradeType').value,
        description: document.getElementById('gradeDescription').value
    };

    const newGrade = {
        id: Date.now(),
        ...formData,
        date: new Date().toISOString().split('T')[0]
    };

    appData.grades.push(newGrade);
    saveData();
    closeModal('gradeModal');
    loadGrades();
    updateDashboard();
}

function editGrade(id) {
    const grade = appData.grades.find(g => g.id === id);
    if (!grade) return;

    populateGradeForm();
    document.getElementById('gradeStudent').value = grade.studentId;
    document.getElementById('gradeSubject').value = grade.subjectId;
    document.getElementById('gradeValue').value = grade.grade;
    document.getElementById('gradeType').value = grade.type;
    document.getElementById('gradeDescription').value = grade.description || '';

    showModal('gradeModal');
}

function deleteGrade(id) {
    if (confirm('Are you sure you want to delete this grade?')) {
        appData.grades = appData.grades.filter(g => g.id !== id);
        saveData();
        loadGrades();
        updateDashboard();
    }
}

// Attendance Management
function initializeAttendance() {
    const markAttendanceBtn = document.getElementById('markAttendanceBtn');
    
    if (markAttendanceBtn) {
        markAttendanceBtn.addEventListener('click', () => {
            showAttendanceModal();
        });
    }
}

function loadAttendance() {
    const attendanceContainer = document.getElementById('attendanceContainer');
    const attendanceList = document.getElementById('attendanceList');
    
    if (!attendanceContainer || !attendanceList) return;

    // Grid view
    attendanceContainer.innerHTML = appData.attendance.map(attendance => {
        const student = appData.students.find(s => s.id === attendance.studentId);
        const subject = appData.subjects.find(s => s.id === attendance.subjectId);
        return `
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">${student ? student.firstName + ' ' + student.lastName : 'Unknown Student'}</h3>
                    <span class="status-${attendance.status}">${attendance.status}</span>
                </div>
                <div class="card-content">
                    <p><strong>Subject:</strong> ${subject ? subject.name : 'Unknown Subject'}</p>
                    <p><strong>Date:</strong> ${attendance.date}</p>
                    ${attendance.notes ? `<p><strong>Notes:</strong> ${attendance.notes}</p>` : ''}
                </div>
            </div>
        `;
    }).join('');

    // List view - Table format
    attendanceList.innerHTML = `
        <div class="table-responsive">
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Student</th>
                        <th>Subject</th>
                        <th>Date</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${appData.attendance.map(attendance => {
                        const student = appData.students.find(s => s.id === attendance.studentId);
                        const subject = appData.subjects.find(s => s.id === attendance.subjectId);
                        const shortDate = attendance.date.split('-').slice(1).join('/');
                        return `
                            <tr>
                                <td><strong>${student ? student.firstName + ' ' + student.lastName : 'Unknown'}</strong></td>
                                <td>${subject ? subject.name : 'Unknown'}</td>
                                <td>${shortDate}</td>
                                <td><span class="table-status ${attendance.status}">${attendance.status}</span></td>
                                <td>
                                    <div class="table-actions">
                                        <button class="btn-icon btn-edit" title="Edit">
                                            <i class="fas fa-edit"></i>
                                        </button>
                                        <button class="btn-icon btn-delete" title="Delete">
                                            <i class="fas fa-trash"></i>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        </div>
    `;
}

function showAttendanceModal() {
    // Create a simple attendance marking interface
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Mark Attendance</h3>
                <button class="close-modal">&times;</button>
            </div>
            <div class="modal-form">
                <div class="form-group">
                    <label for="attendanceDate">Date</label>
                    <input type="date" id="attendanceDate" value="${new Date().toISOString().split('T')[0]}">
                </div>
                <div class="form-group">
                    <label for="attendanceSubject">Subject</label>
                    <select id="attendanceSubject">
                        ${appData.subjects.map(s => `<option value="${s.id}">${s.name}</option>`).join('')}
                    </select>
                </div>
                <div class="attendance-list">
                    ${appData.students.map(student => `
                        <div class="attendance-item">
                            <span>${student.firstName} ${student.lastName}</span>
                            <select class="attendance-status" data-student-id="${student.id}">
                                <option value="present">Present</option>
                                <option value="absent">Absent</option>
                                <option value="late">Late</option>
                            </select>
                        </div>
                    `).join('')}
                </div>
                <div class="form-actions">
                    <button type="button" class="btn-secondary close-modal">Cancel</button>
                    <button type="button" class="btn-primary" onclick="saveAttendance()">Save Attendance</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    setupModalHandlers(modal);
}

function saveAttendance() {
    const date = document.getElementById('attendanceDate').value;
    const subjectId = parseInt(document.getElementById('attendanceSubject').value);
    const statusElements = document.querySelectorAll('.attendance-status');
    
    statusElements.forEach(element => {
        const studentId = parseInt(element.dataset.studentId);
        const status = element.value;
        
        const newAttendance = {
            id: Date.now() + Math.random(),
            studentId,
            subjectId,
            date,
            status,
            notes: ''
        };
        
        appData.attendance.push(newAttendance);
    });
    
    saveData();
    closeModal(document.querySelector('.modal'));
    loadAttendance();
    updateDashboard();
}

// Exam Management
function initializeExams() {
    const createExamBtn = document.getElementById('createExamBtn');
    
    if (createExamBtn) {
        createExamBtn.addEventListener('click', () => {
            showExamModal();
        });
    }
}

function loadExams() {
    const examsContainer = document.getElementById('examsContainer');
    const examsList = document.getElementById('examsList');
    
    if (!examsContainer || !examsList) return;

    // Grid view
    examsContainer.innerHTML = appData.exams.map(exam => {
        const subject = appData.subjects.find(s => s.id === exam.subjectId);
        return `
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">${exam.title}</h3>
                    <div class="card-actions">
                        <button class="btn-icon btn-edit" onclick="editExam(${exam.id})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-icon btn-delete" onclick="deleteExam(${exam.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <div class="card-content">
                    <p><strong>Subject:</strong> ${subject ? subject.name : 'Unknown Subject'}</p>
                    <p><strong>Date:</strong> ${exam.date}</p>
                    <p><strong>Duration:</strong> ${exam.duration} minutes</p>
                    <p><strong>Type:</strong> ${exam.type}</p>
                    <p><strong>Total Points:</strong> ${exam.totalPoints}</p>
                    <p><strong>Description:</strong> ${exam.description}</p>
                </div>
            </div>
        `;
    }).join('');

    // List view - Table format
    examsList.innerHTML = `
        <div class="table-responsive">
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Title</th>
                        <th>Subject</th>
                        <th>Type</th>
                        <th>Date</th>
                        <th>Duration</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${appData.exams.map(exam => {
                        const subject = appData.subjects.find(s => s.id === exam.subjectId);
                        const shortDate = exam.date.split('-').slice(1).join('/');
                        return `
                            <tr>
                                <td><strong>${exam.title}</strong></td>
                                <td>${subject ? subject.name : 'Unknown'}</td>
                                <td>${exam.type}</td>
                                <td>${shortDate}</td>
                                <td>${exam.duration}m</td>
                                <td>
                                    <div class="table-actions">
                                        <button class="btn-icon btn-edit" onclick="editExam(${exam.id})" title="Edit">
                                            <i class="fas fa-edit"></i>
                                        </button>
                                        <button class="btn-icon btn-delete" onclick="deleteExam(${exam.id})" title="Delete">
                                            <i class="fas fa-trash"></i>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        </div>
    `;
}

function showExamModal() {
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Create Exam</h3>
                <button class="close-modal">&times;</button>
            </div>
            <form class="modal-form" onsubmit="saveExam(event)">
                <div class="form-group">
                    <label for="examTitle">Title</label>
                    <input type="text" id="examTitle" required>
                </div>
                <div class="form-group">
                    <label for="examSubject">Subject</label>
                    <select id="examSubject" required>
                        ${appData.subjects.map(s => `<option value="${s.id}">${s.name}</option>`).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label for="examDate">Date</label>
                    <input type="date" id="examDate" required>
                </div>
                <div class="form-group">
                    <label for="examDuration">Duration (minutes)</label>
                    <input type="number" id="examDuration" required>
                </div>
                <div class="form-group">
                    <label for="examType">Type</label>
                    <select id="examType" required>
                        <option value="written">Written</option>
                        <option value="practical">Practical</option>
                        <option value="oral">Oral</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="examDescription">Description</label>
                    <textarea id="examDescription"></textarea>
                </div>
                <div class="form-actions">
                    <button type="button" class="btn-secondary close-modal">Cancel</button>
                    <button type="submit" class="btn-primary">Save Exam</button>
                </div>
            </form>
        </div>
    `;
    
    document.body.appendChild(modal);
    setupModalHandlers(modal);
}

function saveExam(event) {
    event.preventDefault();
    
    const newExam = {
        id: Date.now(),
        title: document.getElementById('examTitle').value,
        subjectId: parseInt(document.getElementById('examSubject').value),
        date: document.getElementById('examDate').value,
        duration: parseInt(document.getElementById('examDuration').value),
        type: document.getElementById('examType').value,
        description: document.getElementById('examDescription').value,
        questions: [],
        totalPoints: 100
    };
    
    appData.exams.push(newExam);
    saveData();
    closeModal(document.querySelector('.modal'));
    loadExams();
}

// Repository Management
function initializeRepository() {
    const uploadFileBtn = document.getElementById('uploadFileBtn');
    
    if (uploadFileBtn) {
        uploadFileBtn.addEventListener('click', () => {
            showFileUploadModal();
        });
    }
}

function loadRepository() {
    const repositoryContainer = document.getElementById('repositoryContainer');
    const repositoryList = document.getElementById('repositoryList');
    
    if (!repositoryContainer || !repositoryList) return;

    // Mock repository files
    const repositoryFiles = [
        { name: 'Math_Exam_2024.pdf', type: 'PDF', size: '2.3 MB', date: '2024-01-15' },
        { name: 'Physics_Lab_Report.docx', type: 'Word', size: '1.8 MB', date: '2024-01-12' },
        { name: 'Chemistry_Notes.pdf', type: 'PDF', size: '3.1 MB', date: '2024-01-10' }
    ];

    // Grid view
    repositoryContainer.innerHTML = repositoryFiles.map(file => `
        <div class="card">
            <div class="card-header">
                <h3 class="card-title">${file.name}</h3>
                <div class="card-actions">
                    <button class="btn-icon">
                        <i class="fas fa-download"></i>
                    </button>
                    <button class="btn-icon btn-delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            <div class="card-content">
                <p><strong>Type:</strong> ${file.type}</p>
                <p><strong>Size:</strong> ${file.size}</p>
                <p><strong>Date:</strong> ${file.date}</p>
            </div>
        </div>
    `).join('');

    // List view - Table format
    repositoryList.innerHTML = `
        <div class="table-responsive">
            <table class="data-table">
                <thead>
                    <tr>
                        <th>File Name</th>
                        <th>Type</th>
                        <th>Size</th>
                        <th>Date</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${repositoryFiles.map(file => {
                        const shortDate = file.date.split('-').slice(1).join('/');
                        const shortName = file.name.length > 20 ? file.name.substring(0, 20) + '...' : file.name;
                        return `
                            <tr>
                                <td><strong title="${file.name}">${shortName}</strong></td>
                                <td><span class="table-status" style="background: #f8f9fa; color: #6c757d;">${file.type}</span></td>
                                <td>${file.size}</td>
                                <td>${shortDate}</td>
                                <td>
                                    <div class="table-actions">
                                        <button class="btn-icon" title="Download">
                                            <i class="fas fa-download"></i>
                                        </button>
                                        <button class="btn-icon btn-delete" title="Delete">
                                            <i class="fas fa-trash"></i>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        </div>
    `;
}

function showFileUploadModal() {
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Upload File</h3>
                <button class="close-modal">&times;</button>
            </div>
            <div class="modal-form">
                <div class="form-group">
                    <label for="fileInput">Select File</label>
                    <input type="file" id="fileInput" accept=".pdf,.doc,.docx,.txt">
                </div>
                <div class="form-group">
                    <label for="fileDescription">Description</label>
                    <input type="text" id="fileDescription" placeholder="Optional description">
                </div>
                <div class="form-actions">
                    <button type="button" class="btn-secondary close-modal">Cancel</button>
                    <button type="button" class="btn-primary" onclick="uploadFile()">Upload</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    setupModalHandlers(modal);
}

function uploadFile() {
    const fileInput = document.getElementById('fileInput');
    const description = document.getElementById('fileDescription').value;
    
    if (fileInput.files.length > 0) {
        const file = fileInput.files[0];
        alert(`File "${file.name}" uploaded successfully!`);
        closeModal(document.querySelector('.modal'));
        loadRepository();
    } else {
        alert('Please select a file to upload.');
    }
}

// Notifications Management
function initializeNotifications() {
    const markAllReadBtn = document.getElementById('markAllReadBtn');
    
    if (markAllReadBtn) {
        markAllReadBtn.addEventListener('click', () => {
            markAllNotificationsRead();
        });
    }
}

function loadNotifications() {
    const notificationsContainer = document.getElementById('notificationsContainer');
    const notificationsList = document.getElementById('notificationsList');
    
    if (!notificationsContainer || !notificationsList) return;

    // Grid view
    notificationsContainer.innerHTML = appData.notifications.map(notification => `
        <div class="card ${notification.read ? 'read' : 'unread'}">
            <div class="card-header">
                <h3 class="card-title">${notification.title}</h3>
                <span class="notification-date">${notification.date}</span>
            </div>
            <div class="card-content">
                <p>${notification.message}</p>
                <div class="notification-actions">
                    ${!notification.read ? `<button class="btn-icon" onclick="markNotificationRead(${notification.id})">
                        <i class="fas fa-check"></i> Mark as Read
                    </button>` : ''}
                    <button class="btn-icon btn-delete" onclick="deleteNotification(${notification.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        </div>
    `).join('');

    // List view - Table format
    notificationsList.innerHTML = `
        <div class="table-responsive">
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Title</th>
                        <th>Message</th>
                        <th>Date</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${appData.notifications.map(notification => {
                        const shortDate = notification.date.split('-').slice(1).join('/');
                        const shortMessage = notification.message.length > 25 ? notification.message.substring(0, 25) + '...' : notification.message;
                        return `
                            <tr class="${notification.read ? 'read' : 'unread'}">
                                <td><strong>${notification.title}</strong></td>
                                <td title="${notification.message}">${shortMessage}</td>
                                <td>${shortDate}</td>
                                <td><span class="table-status ${notification.read ? 'read' : 'unread'}">${notification.read ? 'Read' : 'Unread'}</span></td>
                                <td>
                                    <div class="table-actions">
                                        ${!notification.read ? `<button class="btn-icon" onclick="markNotificationRead(${notification.id})" title="Mark as Read">
                                            <i class="fas fa-check"></i>
                                        </button>` : ''}
                                        <button class="btn-icon btn-delete" onclick="deleteNotification(${notification.id})" title="Delete">
                                            <i class="fas fa-trash"></i>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        </div>
    `;
}

function updateNotificationCount() {
    const count = appData.notifications.filter(n => !n.read).length;
    const badge = document.getElementById('notificationCount');
    if (badge) {
        badge.textContent = count;
        badge.style.display = count > 0 ? 'inline' : 'none';
    }
}

function markNotificationRead(id) {
    const notification = appData.notifications.find(n => n.id === id);
    if (notification) {
        notification.read = true;
        saveData();
        loadNotifications();
        updateNotificationCount();
    }
}

function markAllNotificationsRead() {
    appData.notifications.forEach(n => n.read = true);
    saveData();
    loadNotifications();
    updateNotificationCount();
}

function deleteNotification(id) {
    if (confirm('Are you sure you want to delete this notification?')) {
        appData.notifications = appData.notifications.filter(n => n.id !== id);
        saveData();
        loadNotifications();
        updateNotificationCount();
    }
}

// Reports Management
function initializeReports() {
    // Initialize reports functionality
}

function loadReports() {
    const reportsContainer = document.getElementById('reportsContainer');
    if (!reportsContainer) return;

    reportsContainer.innerHTML = `
        <div class="card">
            <div class="card-header">
                <h3 class="card-title">Academic Performance Report</h3>
            </div>
            <div class="card-content">
                <div class="report-stats">
                    <div class="stat-item">
                        <span class="stat-label">Total Students:</span>
                        <span class="stat-value">${appData.students.length}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Average Grade:</span>
                        <span class="stat-value">${calculateAverageGrade()}%</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Attendance Rate:</span>
                        <span class="stat-value">${calculateAttendanceRate()}%</span>
                    </div>
                </div>
                <div class="report-actions">
                    <button class="btn-primary" onclick="generateReport()">
                        <i class="fas fa-download"></i> Generate Report
                    </button>
                </div>
            </div>
        </div>
    `;
}

function generateReport() {
    alert('Report generated successfully! This would typically download a PDF or Excel file.');
}

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

// Landing Page Functions
function scrollToLogin() {
    showLoginModal();
}

function scrollToFeatures() {
    document.getElementById('features').scrollIntoView({ behavior: 'smooth' });
}

function showLoginModal() {
    const modal = document.getElementById('loginModal');
    if (modal) {
        modal.classList.add('active');
        setupModalHandlers('loginModal');
    }
}

function showRegistrationModal() {
    const modal = document.getElementById('registrationModal');
    if (modal) {
        modal.classList.add('active');
        setupModalHandlers('registrationModal');
    }
}

// Landing page navigation
function initializeLandingPage() {
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');
    
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
        });
    }
    
    // Smooth scrolling for navigation links
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({ behavior: 'smooth' });
            }
            navMenu.classList.remove('active');
        });
    });
    
    // Registration form handling
    const registrationForm = document.getElementById('registrationForm');
    if (registrationForm) {
        registrationForm.addEventListener('submit', (e) => {
            e.preventDefault();
            handleRegistration();
        });
    }
    
    // Login form handling
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            handleLogin();
        });
    }
}

function handleRegistration() {
    const formData = {
        firstName: document.getElementById('regFirstName').value,
        lastName: document.getElementById('regLastName').value,
        email: document.getElementById('regEmail').value,
        institution: document.getElementById('regInstitution').value,
        role: document.getElementById('regRole').value
    };
    
    // In a real application, this would send data to a server
    console.log('Registration data:', formData);
    alert('Registration submitted successfully! You will be contacted soon.');
    closeModal('registrationModal');
    
    // Clear form
    document.getElementById('registrationForm').reset();
}

function handleLogin() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    if (username && password) {
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('username', username);
        window.location.href = 'home.html';
    } else {
        alert('Please enter both username and password');
    }
}

// Login Page Initialization
function initializeLoginPage() {
    // Initialize language system
    initializeLanguage();
    
    // Login form handling
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            handleLogin();
        });
    }
    
    // Social login buttons (placeholder functionality)
    const googleBtn = document.querySelector('.google-btn');
    const microsoftBtn = document.querySelector('.microsoft-btn');
    
    if (googleBtn) {
        googleBtn.addEventListener('click', () => {
            alert('Google login integration would be implemented here');
        });
    }
    
    if (microsoftBtn) {
        microsoftBtn.addEventListener('click', () => {
            alert('Microsoft login integration would be implemented here');
        });
    }
}

// Register Page Initialization
function initializeRegisterPage() {
    // Initialize language system
    initializeLanguage();
    
    // Registration form handling
    const registrationForm = document.getElementById('registrationForm');
    if (registrationForm) {
        registrationForm.addEventListener('submit', (e) => {
            e.preventDefault();
            handleRegistration();
        });
    }
    
    // Social login buttons (placeholder functionality)
    const googleBtn = document.querySelector('.google-btn');
    const microsoftBtn = document.querySelector('.microsoft-btn');
    
    if (googleBtn) {
        googleBtn.addEventListener('click', () => {
            alert('Google registration integration would be implemented here');
        });
    }
    
    if (microsoftBtn) {
        microsoftBtn.addEventListener('click', () => {
            alert('Microsoft registration integration would be implemented here');
        });
    }
}

// Auth Page Initialization
function initializeAuthPage() {
    // Initialize language system
    initializeLanguage();
    
    // Login form handling
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            handleLogin();
        });
    }
    
    // Registration form handling
    const registrationForm = document.getElementById('registrationForm');
    if (registrationForm) {
        registrationForm.addEventListener('submit', (e) => {
            e.preventDefault();
            handleRegistration();
        });
    }
    
    // Social login buttons (placeholder functionality)
    const googleBtns = document.querySelectorAll('.google-btn');
    const microsoftBtns = document.querySelectorAll('.microsoft-btn');
    
    googleBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            alert('Google login integration would be implemented here');
        });
    });
    
    microsoftBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            alert('Microsoft login integration would be implemented here');
        });
    });
}

// Form switching functions
function switchToRegister() {
    console.log('Switching to register form...');
    const loginCard = document.getElementById('loginCard');
    const registerCard = document.getElementById('registerCard');
    const loginTab = document.getElementById('loginTab');
    const registerTab = document.getElementById('registerTab');
    
    if (loginCard && registerCard) {
        console.log('Cards found, starting animation...');
        
        // Update tab buttons
        if (loginTab && registerTab) {
            loginTab.classList.remove('active');
            registerTab.classList.add('active');
        }
        
        // Add slide-out animation to login card
        loginCard.classList.add('slide-out');
        
        // After animation, hide login and show register
        setTimeout(() => {
            loginCard.classList.remove('active', 'slide-out');
            registerCard.classList.add('active', 'slide-in');
            console.log('Animation complete - showing register form');
        }, 250);
    } else {
        console.error('Cards not found:', { loginCard, registerCard });
    }
}

function switchToLogin() {
    console.log('Switching to login form...');
    const loginCard = document.getElementById('loginCard');
    const registerCard = document.getElementById('registerCard');
    const loginTab = document.getElementById('loginTab');
    const registerTab = document.getElementById('registerTab');
    
    if (loginCard && registerCard) {
        console.log('Cards found, starting animation...');
        
        // Update tab buttons
        if (loginTab && registerTab) {
            registerTab.classList.remove('active');
            loginTab.classList.add('active');
        }
        
        // Add slide-out animation to register card
        registerCard.classList.add('slide-out');
        
        // After animation, hide register and show login
        setTimeout(() => {
            registerCard.classList.remove('active', 'slide-in', 'slide-out');
            loginCard.classList.add('active');
            console.log('Animation complete - showing login form');
        }, 250);
    } else {
        console.error('Cards not found:', { loginCard, registerCard });
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
