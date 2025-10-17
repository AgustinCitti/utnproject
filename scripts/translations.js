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
