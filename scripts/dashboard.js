// Dashboard System
function initializeDashboard() {
    initializeCalendar();
    loadUnifiedNotifications();
    setupQuickActions();
    
    // Refresh unified notifications every minute to keep them current
    setInterval(() => {
        loadUnifiedNotifications();
        updateStats(); // Also update stats periodically
    }, 60000); // 60 seconds
    
    // Make functions globally accessible for testing
    window.loadLatestNotifications = loadLatestNotifications;
    window.loadUnifiedNotifications = loadUnifiedNotifications;
    window.loadNextClass = loadNextClass;
    window.getNextTwoClasses = getNextTwoClasses;
    window.debugNextClass = function() {
        // Debug functionality removed for security
    };
    
    // Function to navigate to attendance for a specific class
    window.navigateToAttendanceForClass = function(subjectId) {
        console.log('navigateToAttendanceForClass called with subjectId:', subjectId);
        
        // Navigate to attendance section
        if (typeof showSection === 'function') {
            console.log('Calling showSection("attendance")');
            showSection('attendance');
        } else {
            console.error('showSection function not found');
            // Fallback: manually show the section
            document.querySelectorAll('.content-section').forEach(section => {
                section.classList.remove('active');
            });
            const attendanceSection = document.getElementById('attendance');
            if (attendanceSection) {
                attendanceSection.classList.add('active');
                console.log('Manually activated attendance section');
            } else {
                console.error('Attendance section not found');
            }
        }
        
        // Wait a bit for the section to load, then show attendance view and select subject
        setTimeout(() => {
            console.log('Setting up attendance view for subject:', subjectId);
            
            // Show attendance view
            if (typeof showAttendanceView === 'function') {
                showAttendanceView();
                console.log('Called showAttendanceView()');
            } else {
                console.error('showAttendanceView function not found');
            }
            
            // Select the subject in the dropdown
            const attendanceSubjectSelect = document.getElementById('attendanceSubjectSelect');
            if (attendanceSubjectSelect) {
                attendanceSubjectSelect.value = subjectId;
                console.log('Set attendanceSubjectSelect value to:', subjectId);
                
                // Trigger change event to load students
                const changeEvent = new Event('change', { bubbles: true });
                attendanceSubjectSelect.dispatchEvent(changeEvent);
                
                // Also try calling loadStudentsForAttendanceView directly if available
                if (typeof loadStudentsForAttendanceView === 'function') {
                    loadStudentsForAttendanceView();
                    console.log('Called loadStudentsForAttendanceView()');
                }
            } else {
                console.error('attendanceSubjectSelect element not found');
            }
        }, 300);
    };
    
    // Test function to verify the logic
    window.testLatestNotifications = function() {
        const now = new Date();
        loadLatestNotifications();
    };
    
    // Additional test function to debug the specific issue
    window.debugClassFiltering = function() {
        // Debug functionality removed for security
    };
    
    // Test function for date formatting
    window.testDateFormatting = function() {
        // Debug functionality removed for security
    };
    
}

function updateDashboard() {
    updateStats();
    updateCalendar();
    loadUnifiedNotifications();
    
    // Re-initialize calendar if dashboard is visible
    const dashboardSection = document.getElementById('dashboard');
    if (dashboardSection && dashboardSection.classList.contains('active')) {
        // Reset calendar initialization to allow re-render
        calendarInitialized = false;
        initializeCalendar();
    }
}

function updateStats() {
    const totalStudents = (appData.estudiante || []).length;
    const averageGrade = calculateAverageGrade();
    const attendanceRate = calculateAttendanceRate();
    const pendingNotifications = (appData.notifications || []).filter(n => !n.read).length;

    // Update KPI cards
    const totalStudentsEl = document.getElementById('totalStudents');
    if (totalStudentsEl) totalStudentsEl.textContent = totalStudents;
    
    const averageGradeEl = document.getElementById('averageGrade');
    if (averageGradeEl) averageGradeEl.textContent = `${averageGrade}%`;
    
    const attendanceRateEl = document.getElementById('attendanceRate');
    if (attendanceRateEl) attendanceRateEl.textContent = `${attendanceRate}%`;
    
    const pendingNotificationsEl = document.getElementById('pendingNotifications');
    if (pendingNotificationsEl) pendingNotificationsEl.textContent = pendingNotifications;

    // Update new KPI cards
    const pendingTasksEl = document.getElementById('pendingTasks');
    if (pendingTasksEl) {
        const pendingTasks = calculatePendingTasks();
        pendingTasksEl.textContent = pendingTasks;
    }

    const nextClassTimeEl = document.getElementById('nextClassTime');
    if (nextClassTimeEl) {
        const nextClass = getNextClassTime();
        nextClassTimeEl.textContent = nextClass;
    }
}

function calculatePendingTasks() {
    let pendingCount = 0;
    
    // Count pending evaluations that need grading
    const evaluations = appData.evaluacion || [];
    const currentUserId = localStorage.getItem('userId');
    
    if (currentUserId) {
        const userSubjects = (appData.materia || []).filter(m => 
            m.Usuarios_docente_ID_docente === parseInt(currentUserId)
        );
        const userSubjectIds = userSubjects.map(s => s.ID_materia);
        
        evaluations.forEach(eval => {
            if (userSubjectIds.includes(eval.Materia_ID_materia)) {
                // Check if there are students without grades for this evaluation
                const notes = appData.notas || [];
                const evaluationNotes = notes.filter(n => n.Evaluacion_ID_evaluacion === eval.ID_evaluacion);
                const students = (appData.estudiante || []).filter(e => {
                    const enrollments = appData.alumnos_x_materia || [];
                    return enrollments.some(enrollment => 
                        enrollment.Estudiante_ID_Estudiante === e.ID_Estudiante &&
                        enrollment.Materia_ID_materia === eval.Materia_ID_materia
                    );
                });
                
                if (evaluationNotes.length < students.length) {
                    pendingCount += (students.length - evaluationNotes.length);
                }
            }
        });
    }
    
    // Count pending topics (content that's not completed)
    const contenido = appData.contenido || [];
    if (currentUserId) {
        const userSubjects = (appData.materia || []).filter(m => 
            m.Usuarios_docente_ID_docente === parseInt(currentUserId)
        );
        const userSubjectIds = userSubjects.map(s => s.ID_materia);
        
        contenido.forEach(content => {
            if (userSubjectIds.includes(content.Materia_ID_materia) && 
                (content.Estado === 'PENDIENTE' || content.Estado === 'EN_PROGRESO')) {
                pendingCount++;
            }
        });
    }
    
    return pendingCount;
}

function getNextClassTime() {
    const nextClasses = getNextTwoClasses();
    if (nextClasses.length === 0) {
        return '--';
    }
    
    const nextClass = nextClasses[0];
    const today = new Date();
    const [year, month, day] = nextClass.date.split('-');
    const classDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    
    const dayNames = {
        es: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'],
        en: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    };
    
    if (classDate.toDateString() === today.toDateString()) {
        return `Hoy ${nextClass.time}`;
    }
    
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    
    if (classDate.toDateString() === tomorrow.toDateString()) {
        return `Mañana ${nextClass.time}`;
    }
    
    return `${dayNames[currentLanguage || 'es'][classDate.getDay()]} ${nextClass.time}`;
}

function setupQuickActions() {
    // Hero section buttons
    const quickCreateClassBtn = document.getElementById('quickCreateClassBtn');
    if (quickCreateClassBtn) {
        quickCreateClassBtn.addEventListener('click', () => {
            if (typeof showSection === 'function') {
                showSection('subjects-management');
            }
        });
    }

    const quickUploadMaterialBtn = document.getElementById('quickUploadMaterialBtn');
    if (quickUploadMaterialBtn) {
        quickUploadMaterialBtn.addEventListener('click', () => {
            if (typeof showSection === 'function') {
                showSection('subjects-management');
            }
        });
    }

    const quickViewReportsBtn = document.getElementById('quickViewReportsBtn');
    if (quickViewReportsBtn) {
        quickViewReportsBtn.addEventListener('click', () => {
            if (typeof showSection === 'function') {
                showSection('reports');
            }
        });
    }

    // Quick action buttons
    const quickActionButtons = document.querySelectorAll('.quick-action-btn');
    quickActionButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const action = btn.getAttribute('data-action');
            const modalId = btn.getAttribute('data-modal');
            
            // If button has data-modal attribute, open the modal instead of navigating
            if (modalId) {
                if (typeof showModal === 'function') {
                    showModal(modalId);
                    
                    // Additional setup for specific modals
                    if (modalId === 'studentModal') {
                        // Clear form and populate subjects when opening student modal
                        if (typeof clearStudentForm === 'function') {
                            clearStudentForm();
                        } else {
                            const form = document.getElementById('studentForm');
                            if (form) form.reset();
                        }
                        // Populate subjects and topics will be handled by the showModal function
                    } else if (modalId === 'subjectModal') {
                        // Setup modal handlers first
                        if (typeof setupModalHandlers === 'function') {
                            setupModalHandlers(modalId);
                        }
                        
                        // Clear form when opening subject modal
                        if (typeof clearSubjectForm === 'function') {
                            clearSubjectForm();
                        } else {
                            const form = document.getElementById('subjectForm');
                            if (form) {
                                form.reset();
                                // Reset schedule fields
                                const selectedDaysContainer = document.getElementById('selectedDaysContainer');
                                if (selectedDaysContainer) {
                                    selectedDaysContainer.innerHTML = '';
                                }
                            }
                        }
                        
                        // Reset modal title to "Add Subject"
                        const modalTitle = document.querySelector('#subjectModal .modal-header h3');
                        if (modalTitle) {
                            modalTitle.setAttribute('data-translate', 'add_subject');
                            // Translation will be handled by the translation system
                        }
                    }
                } else {
                    // Fallback: try to show modal directly
                    const modal = document.getElementById(modalId);
                    if (modal) {
                        modal.classList.add('active');
                    }
                }
                return;
            }
            
            // For buttons without modal, navigate to sections (attendance, grades)
            if (typeof showSection !== 'function') {
                return;
            }
            switch(action) {
                case 'attendance':
                    // Navigate to attendance section and show attendance view
                    showSection('attendance');
                    setTimeout(() => {
                        if (typeof showAttendanceView === 'function') {
                            showAttendanceView();
                        }
                    }, 100);
                    break;
                case 'grades':
                    // Navigate to exams section (student-management with exams subsection)
                    showSection('student-management', 'exams');
                    setTimeout(() => {
                        // Ensure exams tab is active
                        const examsTab = document.getElementById('examsTab');
                        if (examsTab) {
                            examsTab.click();
                        }
                        // Load exams data
                        if (typeof loadExams === 'function') {
                            loadExams();
                        }
                        if (typeof loadUnifiedStudentData === 'function') {
                            loadUnifiedStudentData();
                        }
                    }, 100);
                    break;
            }
        });
    });

    // Calendar full view button
    const viewFullCalendarBtn = document.getElementById('viewFullCalendarBtn');
    if (viewFullCalendarBtn) {
        viewFullCalendarBtn.addEventListener('click', () => {
            // Navigate to calendar section
            if (typeof showSection === 'function') {
                showSection('calendar');
            }
        });
    }
}

function calculateAverageGrade() {
    if (!appData.notas || appData.notas.length === 0) return 0;
    const total = appData.notas.reduce((sum, grade) => sum + grade.Calificacion, 0);
    return Math.round(total / appData.notas.length);
}

function calculateAttendanceRate() {
    if (!appData.asistencia || appData.asistencia.length === 0) return 0;
    // Support both 'P' (new format) and 'Y' (old format for compatibility)
    const presentCount = appData.asistencia.filter(a => a.Presente === 'P' || a.Presente === 'Y').length;
    return Math.round((presentCount / appData.asistencia.length) * 100);
}

function loadLatestNotifications() {
    const classesList = document.getElementById('classesList');
    if (!classesList) return;

    // Check if appData is loaded
    if (!appData) {
        return;
    }

    // Get current user
    const currentUser = getCurrentUser();
    if (!currentUser) {
        classesList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-bell"></i>
                <h3 data-translate="no_notifications_message">No hay notificaciones recientes.</h3>
            </div>
        `;
        return;
    }

    // Get recordatorios for current docente's subjects
    let recordatorios = [];
    if (typeof getRecordatoriosForDocente === 'function') {
        recordatorios = getRecordatoriosForDocente(currentUser.ID_docente);
    } else if (appData.recordatorio && appData.materia) {
        // Fallback: implement the logic directly
        const docenteSubjects = appData.materia.filter(m => m.Usuarios_docente_ID_docente === currentUser.ID_docente);
        const subjectIds = docenteSubjects.map(s => s.ID_materia);
        recordatorios = appData.recordatorio.filter(r => subjectIds.includes(r.Materia_ID_materia));
    }

    // Get notifications for current user
    let notifications = [];
    if (appData.notifications && typeof shouldShowNotification === 'function') {
        notifications = appData.notifications.filter(n => shouldShowNotification(n, currentUser.ID_docente));
    } else if (appData.notifications) {
        // Fallback: filter notifications manually
        notifications = appData.notifications.filter(n => 
            n.Destinatario_tipo === 'TODOS' || 
            (n.Destinatario_tipo === 'DOCENTE' && n.Destinatario_id === currentUser.ID_docente)
        );
    }

    // Combine recordatorios and notifications into a unified array
    const allItems = [];
    
    // Add recordatorios
    recordatorios.forEach(recordatorio => {
        const subject = appData.materia ? appData.materia.find(m => m.ID_materia === recordatorio.Materia_ID_materia) : null;
        const subjectName = subject ? subject.Nombre : 'Materia no encontrada';
        
        // Use Fecha_creacion if available for sorting (creation date), otherwise use Fecha (reminder date)
        // For display, we'll use Fecha (the reminder date)
        const sortDateValue = recordatorio.Fecha_creacion || recordatorio.Fecha;
        const dateObj = sortDateValue ? new Date(sortDateValue) : new Date();
        
        allItems.push({
            type: 'recordatorio',
            id: recordatorio.ID_recordatorio,
            title: getRecordatorioTitleForDashboard(recordatorio),
            description: recordatorio.Descripcion,
            date: dateObj, // For sorting by creation/reminder date
            dateStr: recordatorio.Fecha, // For display (the actual reminder date)
            tipo: recordatorio.Tipo,
            prioridad: recordatorio.Prioridad,
            subjectName: subjectName,
            data: recordatorio
        });
    });
    
    // Add notifications
    notifications.forEach(notification => {
        const dateObj = notification.Fecha_creacion ? new Date(notification.Fecha_creacion) : new Date();
        
        allItems.push({
            type: 'notification',
            id: notification.ID_notificacion,
            title: notification.Titulo,
            description: notification.Mensaje,
            date: dateObj,
            tipo: notification.Tipo,
            estado: notification.Estado,
            data: notification
        });
    });

    // Sort by date (newest first) and take last 3
    allItems.sort((a, b) => b.date - a.date);
    const latestItems = allItems.slice(0, 3);

    if (latestItems.length === 0) {
        classesList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-bell"></i>
                <h3 data-translate="no_notifications_message">No hay notificaciones recientes.</h3>
            </div>
        `;
        return;
    }

    // Display the latest notifications
    classesList.innerHTML = latestItems.map(item => {
        // For recordatorios, use the reminder date (dateStr), for notifications use the creation date
        const displayDate = item.type === 'recordatorio' && item.dateStr ? 
            new Date(item.dateStr) : item.date;
        const formattedDate = formatNotificationDate(displayDate);
        const typeIcon = item.type === 'recordatorio' ? 'fa-calendar-check' : 'fa-bell';
        const typeColor = item.type === 'recordatorio' ? getRecordatorioTypeColor(item.tipo) : getNotificationTypeColor(item.tipo);
        
        return `
            <div class="class-item notification-item ${item.type}-item">
                <div class="class-header">
                    <div class="class-time" style="color: ${typeColor};">
                        <i class="fas ${typeIcon}"></i>
                        <span>${formattedDate}</span>
                    </div>
                    ${item.type === 'recordatorio' && item.prioridad ? `
                        <div class="priority-badge priority-${item.prioridad.toLowerCase()}">
                            ${item.prioridad}
                        </div>
                    ` : ''}
                </div>
                <div class="class-details">
                    <h4>${item.title}</h4>
                    <p class="class-info">${item.description}</p>
                    ${item.type === 'recordatorio' && item.subjectName ? `
                        <p class="class-info">
                            <span class="classroom">• ${item.subjectName}</span>
                        </p>
                    ` : ''}
                </div>
            </div>
        `;
    }).join('');
}

// Helper function to get recordatorio title for dashboard
function getRecordatorioTitleForDashboard(recordatorio) {
    if (typeof getRecordatorioTitle === 'function') {
        return getRecordatorioTitle(recordatorio);
    }
    const typeLabels = {
        'EXAMEN': 'Examen',
        'ENTREGA': 'Entrega',
        'CLASE': 'Clase',
        'REUNION': 'Reunión',
        'EVENTO': 'Evento'
    };
    const typeLabel = typeLabels[recordatorio.Tipo] || recordatorio.Tipo;
    return `${typeLabel}: ${recordatorio.Descripcion.substring(0, 50)}${recordatorio.Descripcion.length > 50 ? '...' : ''}`;
}

// Helper function to format notification date
function formatNotificationDate(date) {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    
    const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const tomorrowDate = new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate());
    const notificationDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    
    if (notificationDate.getTime() === todayDate.getTime()) {
        return currentLanguage === 'es' ? 'Hoy' : 'Today';
    } else if (notificationDate.getTime() === tomorrowDate.getTime()) {
        return currentLanguage === 'es' ? 'Mañana' : 'Tomorrow';
    } else {
        const dayNames = {
            es: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
            en: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
        };
        
        const monthNames = {
            es: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
            en: ['January', 'February', 'March', 'April', 'May', 'June',
                 'July', 'August', 'September', 'October', 'November', 'December']
        };
        
        const lang = currentLanguage || 'es';
        return `${dayNames[lang][date.getDay()]}, ${date.getDate()} ${monthNames[lang][date.getMonth()]}`;
    }
}

// Helper function to get recordatorio type color
function getRecordatorioTypeColor(tipo) {
    const colors = {
        'EXAMEN': '#ef4444',
        'ENTREGA': '#f59e0b',
        'REUNION': '#3b82f6',
        'CLASE': '#10b981',
        'EVENTO': '#8b5cf6'
    };
    return colors[tipo] || '#6b7280';
}

// Helper function to get notification type color
function getNotificationTypeColor(tipo) {
    const colors = {
        'INFO': '#3b82f6',
        'WARNING': '#f59e0b',
        'ERROR': '#ef4444',
        'SUCCESS': '#10b981'
    };
    return colors[tipo] || '#6b7280';
}

// Helper function to get current user (if not available from notifications.js)
function getCurrentUser() {
    // Try to use global getCurrentUser from notifications.js
    if (typeof window.getCurrentUser === 'function') {
        return window.getCurrentUser();
    }
    
    // Fallback implementation
    if (!appData || !appData.usuarios_docente) return null;
    
    // Get from localStorage
    const userId = localStorage.getItem('userId');
    if (userId) {
        return appData.usuarios_docente.find(u => u.ID_docente == userId);
    }
    
    // Try email from localStorage
    const email = localStorage.getItem('username');
    if (email) {
        return appData.usuarios_docente.find(u => u.Email_docente === email);
    }
    
    return null;
}

// Unified function to load notifications, recordatorios, and upcoming classes
function loadUnifiedNotifications() {
    const unifiedList = document.getElementById('unifiedNotificationsList');
    if (!unifiedList) {
        // Fallback: try the old IDs if unified ID doesn't exist
        loadLatestNotifications();
        loadNextClass();
        return;
    }

    // Check if appData is loaded
    if (!appData) {
        unifiedList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-bell"></i>
                <h3 data-translate="loading_data">Cargando datos...</h3>
            </div>
        `;
        return;
    }

    // Get current user
    const currentUser = getCurrentUser();
    if (!currentUser) {
        unifiedList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-bell"></i>
                <h3 data-translate="no_notifications_message">No hay notificaciones recientes.</h3>
            </div>
        `;
        return;
    }

    // Get recordatorios for current docente's subjects
    let recordatorios = [];
    if (typeof getRecordatoriosForDocente === 'function') {
        recordatorios = getRecordatoriosForDocente(currentUser.ID_docente);
    } else if (appData.recordatorio && appData.materia) {
        const docenteSubjects = appData.materia.filter(m => m.Usuarios_docente_ID_docente === currentUser.ID_docente);
        const subjectIds = docenteSubjects.map(s => s.ID_materia);
        recordatorios = appData.recordatorio.filter(r => subjectIds.includes(r.Materia_ID_materia));
    }

    // Get notifications for current user
    let notifications = [];
    if (appData.notifications && typeof shouldShowNotification === 'function') {
        notifications = appData.notifications.filter(n => shouldShowNotification(n, currentUser.ID_docente));
    } else if (appData.notifications) {
        notifications = appData.notifications.filter(n => 
            n.Destinatario_tipo === 'TODOS' || 
            (n.Destinatario_tipo === 'DOCENTE' && n.Destinatario_id === currentUser.ID_docente)
        );
    }

    // Get upcoming classes
    const upcomingClasses = typeof getNextTwoClasses === 'function' ? getNextTwoClasses() : [];

    // Combine all items into a unified array
    const allItems = [];
    
    // Add recordatorios
    recordatorios.forEach(recordatorio => {
        const subject = appData.materia ? appData.materia.find(m => m.ID_materia === recordatorio.Materia_ID_materia) : null;
        const subjectName = subject ? subject.Nombre : 'Materia no encontrada';
        
        const sortDateValue = recordatorio.Fecha_creacion || recordatorio.Fecha;
        const dateObj = sortDateValue ? new Date(sortDateValue) : new Date();
        
        allItems.push({
            type: 'recordatorio',
            id: recordatorio.ID_recordatorio,
            title: getRecordatorioTitleForDashboard(recordatorio),
            description: recordatorio.Descripcion,
            date: dateObj,
            dateStr: recordatorio.Fecha,
            tipo: recordatorio.Tipo,
            prioridad: recordatorio.Prioridad,
            subjectName: subjectName,
            data: recordatorio
        });
    });
    
    // Add notifications
    notifications.forEach(notification => {
        const dateObj = notification.Fecha_creacion ? new Date(notification.Fecha_creacion) : new Date();
        
        allItems.push({
            type: 'notification',
            id: notification.ID_notificacion,
            title: notification.Titulo,
            description: notification.Mensaje,
            date: dateObj,
            tipo: notification.Tipo,
            estado: notification.Estado,
            data: notification
        });
    });

    // Add upcoming classes and in-progress classes
    upcomingClasses.forEach((upcomingClass, index) => {
        // Recrear dateTime si no existe
        const [year, month, day] = upcomingClass.date.split('-');
        const [hours, minutes] = upcomingClass.time.split(':');
        const classDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), parseInt(hours), parseInt(minutes), 0);
        
        // Obtener evaluaciones para esta materia (mostrar todas las evaluaciones de la materia, no solo las del mismo día)
        let evaluations = [];
        const evalList = appData.evaluacion || [];
        const subjectIdNum = parseInt(upcomingClass.subjectId);
        
        // Filtrar por materia
        evaluations = evalList.filter(eval => {
            const evalMateriaId = parseInt(eval.Materia_ID_materia);
            return evalMateriaId === subjectIdNum;
        });
        
        // Opcionalmente, también buscar evaluaciones del mismo día si se desea
        // Por ahora mostramos todas las evaluaciones de la materia
        
        const isInProgress = upcomingClass.status === 'en_curso';
        const classLabel = isInProgress ? 'En Curso' : 'Próxima clase';
        
        allItems.push({
            type: 'upcoming_class',
            id: `class_${upcomingClass.subjectId}_${upcomingClass.date}_${upcomingClass.time}`,
            title: upcomingClass.subjectName,
            description: classLabel,
            date: classDate,
            dateStr: upcomingClass.date,
            time: upcomingClass.time,
            endTime: upcomingClass.endTime,
            classroom: upcomingClass.classroom,
            subjectId: upcomingClass.subjectId,
            evaluations: evaluations,
            status: upcomingClass.status || 'proxima',
            data: upcomingClass
        });
    });

    // Sort by priority: in-progress classes first, then upcoming classes, then past items
    const now = new Date();
    allItems.sort((a, b) => {
        // Priorizar clases en curso
        const aIsInProgress = a.type === 'upcoming_class' && a.status === 'en_curso';
        const bIsInProgress = b.type === 'upcoming_class' && b.status === 'en_curso';
        
        if (aIsInProgress && !bIsInProgress) return -1;
        if (!aIsInProgress && bIsInProgress) return 1;
        
        // Si ambas son en curso o ambas no lo son, verificar si son próximas
        const aIsUpcoming = a.type === 'upcoming_class' && a.status === 'proxima' && a.date > now;
        const bIsUpcoming = b.type === 'upcoming_class' && b.status === 'proxima' && b.date > now;
        
        if (aIsUpcoming && !bIsUpcoming) return -1;
        if (!aIsUpcoming && bIsUpcoming) return 1;
        
        // Ambos son del mismo tipo, ordenar por fecha
        return a.date - b.date;
    });

    // Display all items
    if (allItems.length === 0) {
        unifiedList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-bell"></i>
                <h3 data-translate="no_notifications_message">No hay notificaciones recientes.</h3>
                <p data-translate="no_items_message">No hay notificaciones, recordatorios ni clases próximas.</p>
            </div>
        `;
        return;
    }

    // Display unified list
    unifiedList.innerHTML = allItems.map(item => {
        if (item.type === 'upcoming_class') {
            // Format upcoming class or in-progress class
            const displayDate = item.dateStr ? formatDate(item.dateStr) : formatNotificationDate(item.date);
            // Verificar evaluaciones
            const evaluations = item.evaluations || [];
            const hasEvaluations = Array.isArray(evaluations) && evaluations.length > 0;
            const isInProgress = item.status === 'en_curso';
            
            // Color según el estado
            const statusColor = isInProgress ? '#f59e0b' : '#10b981'; // Naranja para en curso, verde para próxima
            const statusIcon = isInProgress ? 'fa-play-circle' : 'fa-calendar-day';
            const statusLabel = isInProgress ? 'En Curso' : 'Próxima';
            
            const cursorStyle = isInProgress && item.subjectId ? 'cursor: pointer;' : '';
            const dataSubjectId = isInProgress && item.subjectId ? `data-subject-id="${item.subjectId}"` : '';
            
            return `
                <div class="class-item upcoming-class-item ${hasEvaluations ? 'has-evaluations' : ''} ${isInProgress ? 'in-progress' : ''} ${isInProgress && item.subjectId ? 'clickable-class' : ''}" style="${cursorStyle}" ${dataSubjectId} ${isInProgress && item.subjectId ? 'title="Click para tomar asistencia"' : ''}>
                    <div class="class-header">
                        <div class="class-time" style="color: ${statusColor};">
                            <i class="fas ${statusIcon}"></i>
                            <span>${displayDate}</span>
                            ${isInProgress ? `<span class="status-badge" style="background: ${statusColor}; color: white; padding: 2px 8px; border-radius: 12px; font-size: 0.75em; margin-left: 8px;">${statusLabel}</span>` : ''}
                        </div>
                        ${item.time ? `
                            <div class="class-schedule">
                                <i class="fas fa-clock"></i>
                                <span>${item.time}${item.endTime ? ` - ${item.endTime}` : ''}</span>
                            </div>
                        ` : ''}
                    </div>
                    <div class="class-details">
                        <h4>${item.title}</h4>
                        <p class="class-info">
                            <span class="classroom">• ${item.classroom || 'Aula por asignar'}</span>
                            ${hasEvaluations ? `
                                ${evaluations.map(eval => `
                                    <span style="margin-left: 12px; color: #6b7280; font-size: 0.95em; font-weight: 500;">• Examen: <strong style="color: #111827; font-size: 1.05em;">${eval.Titulo || 'Sin título'}</strong></span>
                                `).join('')}
                            ` : ''}
                        </p>
                    </div>
                </div>
            `;
        } else {
            // Format notification or recordatorio
            const displayDate = item.type === 'recordatorio' && item.dateStr ? 
                new Date(item.dateStr) : item.date;
            const formattedDate = formatNotificationDate(displayDate);
            const typeIcon = item.type === 'recordatorio' ? 'fa-calendar-check' : 'fa-bell';
            const typeColor = item.type === 'recordatorio' ? getRecordatorioTypeColor(item.tipo) : getNotificationTypeColor(item.tipo);
            
            return `
                <div class="class-item notification-item ${item.type}-item">
                    <div class="class-header">
                        <div class="class-time" style="color: ${typeColor};">
                            <i class="fas ${typeIcon}"></i>
                            <span>${formattedDate}</span>
                        </div>
                        ${item.type === 'recordatorio' && item.prioridad ? `
                            <div class="priority-badge priority-${item.prioridad.toLowerCase()}">
                                ${item.prioridad}
                            </div>
                        ` : ''}
                    </div>
                    <div class="class-details">
                        <h4>${item.title}</h4>
                        <p class="class-info">${item.description}</p>
                        ${item.type === 'recordatorio' && item.subjectName ? `
                            <p class="class-info">
                                <span class="classroom">• ${item.subjectName}</span>
                            </p>
                        ` : ''}
                    </div>
                </div>
            `;
        }
    }).join('');
    
    // Add event listeners to clickable classes after rendering
    setTimeout(() => {
        const clickableClasses = unifiedList.querySelectorAll('.clickable-class');
        clickableClasses.forEach(element => {
            const subjectId = element.getAttribute('data-subject-id');
            if (subjectId) {
                // Remove existing listeners to avoid duplicates
                const newElement = element.cloneNode(true);
                element.parentNode.replaceChild(newElement, element);
                
                newElement.addEventListener('click', function(e) {
                    e.stopPropagation();
                    console.log('Click detected on class item with subjectId:', subjectId);
                    navigateToAttendanceForClass(parseInt(subjectId));
                });
            }
        });
    }, 100);
}

function loadNextClass() {
    const nextClassList = document.getElementById('nextClassList');
    if (!nextClassList) {
        return;
    }

    // Check if appData is loaded
    if (!appData) {
        nextClassList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-calendar-check"></i>
                <h3>Cargando datos...</h3>
            </div>
        `;
        return;
    }

    const nextClasses = getNextTwoClasses();
    
    if (nextClasses.length === 0) {
        nextClassList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-calendar-check"></i>
                <h3 data-translate="no_upcoming_classes">No hay clases próximas</h3>
                <p data-translate="no_classes_message">No hay clases programadas para los próximos días.</p>
            </div>
        `;
        return;
    }

    // Mostrar todas las clases (en curso y próximas, hasta 2)
    if (nextClasses.length === 0) {
        nextClassList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-calendar-check"></i>
                <h3 data-translate="no_upcoming_classes">No hay clases próximas</h3>
                <p data-translate="no_classes_message">No hay clases programadas para los próximos días.</p>
            </div>
        `;
        return;
    }

    nextClassList.innerHTML = nextClasses.map(nextClass => {
        const isInProgress = nextClass.status === 'en_curso';
        
        // Obtener todas las evaluaciones de la materia de esta clase
        const evalList = appData.evaluacion || [];
        const subjectIdNum = parseInt(nextClass.subjectId);
        const evaluations = evalList.filter(eval => {
            const evalMateriaId = parseInt(eval.Materia_ID_materia);
            return evalMateriaId === subjectIdNum;
        });
        
        const hasEvaluations = evaluations.length > 0;
        const statusColor = isInProgress ? '#f59e0b' : '#10b981';
        const statusIcon = isInProgress ? 'fa-play-circle' : 'fa-calendar-day';
        const statusLabel = isInProgress ? 'En Curso' : 'Próxima';
        
        const cursorStyle = isInProgress && nextClass.subjectId ? 'cursor: pointer; margin-bottom: 15px;' : 'margin-bottom: 15px;';
        const dataSubjectId = isInProgress && nextClass.subjectId ? `data-subject-id="${nextClass.subjectId}"` : '';
        
        return `
            <div class="class-item ${hasEvaluations ? 'has-evaluations' : ''} ${isInProgress ? 'in-progress' : ''} ${isInProgress && nextClass.subjectId ? 'clickable-class' : ''}" style="${cursorStyle}" ${dataSubjectId} ${isInProgress && nextClass.subjectId ? 'title="Click para tomar asistencia"' : ''}>
                <div class="class-header">
                    <div class="class-time" style="color: ${statusColor};">
                        <i class="fas ${statusIcon}"></i>
                        <span>${formatDate(nextClass.date)}</span>
                        ${isInProgress ? `<span class="status-badge" style="background: ${statusColor}; color: white; padding: 2px 8px; border-radius: 12px; font-size: 0.75em; margin-left: 8px;">${statusLabel}</span>` : ''}
                    </div>
                    <div class="class-schedule">
                        <i class="fas fa-clock"></i>
                        <span>${nextClass.time}${nextClass.endTime ? ` - ${nextClass.endTime}` : ''}</span>
                    </div>
                </div>
                <div class="class-details">
                    <h4>${nextClass.subjectName}</h4>
                    <p class="class-info">                    
                        <span class="classroom">• ${nextClass.classroom}</span>
                        ${hasEvaluations ? `
                            ${evaluations.map(eval => `
                                <span style="margin-left: 12px; color: #6b7280; font-size: 0.95em; font-weight: 500;">• Examen: <strong style="color: #111827; font-size: 1.05em;">${eval.Titulo || 'Sin título'}</strong></span>
                            `).join('')}
                        ` : ''}
                    </p>
                </div>
            </div>
        `;
    }).join('');
    
    // Add event listeners to clickable classes after rendering
    setTimeout(() => {
        const clickableClasses = nextClassList.querySelectorAll('.clickable-class');
        clickableClasses.forEach(element => {
            const subjectId = element.getAttribute('data-subject-id');
            if (subjectId) {
                element.addEventListener('click', function(e) {
                    e.stopPropagation();
                    console.log('Click detected on class item with subjectId:', subjectId);
                    navigateToAttendanceForClass(parseInt(subjectId));
                });
            }
        });
    }, 100);
}

function getNextTwoClasses() {
    const now = new Date();
    const subjects = appData.materia || [];
    const teachers = appData.usuarios_docente || [];
    const allClasses = [];
    const inProgressClasses = [];

    const currentUserId = localStorage.getItem('userId');
    if (!currentUserId) {
        return [];
    }

    subjects.forEach(subject => {
        const subjectTeacherId = parseInt(subject.Usuarios_docente_ID_docente);
        const userId = parseInt(currentUserId);
        const matches = subjectTeacherId === userId;
        
        if (!matches || !subject.Horario || subject.Estado !== 'ACTIVA') {
            return;
        }

        const schedule = parseSchedule(subject.Horario);
        if (!schedule) {
            return;
        }

        const teacher = teachers.find(t => t.ID_docente === subject.Usuarios_docente_ID_docente);
        const teacherName = teacher ? `${teacher.Nombre_docente} ${teacher.Apellido_docente}` : 'Profesor no asignado';

        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        if (schedule.days.includes(today.getDay())) {
            const year = today.getFullYear();
            const month = String(today.getMonth() + 1).padStart(2, '0');
            const day = String(today.getDate()).padStart(2, '0');
            const dateStr = `${year}-${month}-${day}`;
            if (isClassInProgress(dateStr, schedule.startTime, schedule.endTime)) {
                const [hours, minutes] = schedule.startTime.split(':');
                const classDateTime = new Date(today.getFullYear(), today.getMonth(), today.getDate(), parseInt(hours), parseInt(minutes), 0);
                
                inProgressClasses.push({
                    date: dateStr,
                    time: schedule.startTime,
                    endTime: schedule.endTime,
                    subjectName: subject.Nombre,
                    teacherName: teacherName,
                    classroom: subject.Aula || 'Aula por asignar',
                    subjectId: subject.ID_materia,
                    dateTime: classDateTime,
                    status: 'en_curso'
                });
            }
        }

        for (let daysAhead = 0; daysAhead < 56; daysAhead++) {
            const checkDate = new Date(now);
            checkDate.setDate(now.getDate() + daysAhead);
            
            if (schedule.days.includes(checkDate.getDay())) {
                const year = checkDate.getFullYear();
                const month = String(checkDate.getMonth() + 1).padStart(2, '0');
                const day = String(checkDate.getDate()).padStart(2, '0');
                const dateStr = `${year}-${month}-${day}`;
                
                const [hours, minutes] = schedule.startTime.split(':');
                const classDateTime = new Date(checkDate.getFullYear(), checkDate.getMonth(), checkDate.getDate(), parseInt(hours), parseInt(minutes), 0);
                
                if (classDateTime > now) {
                    const isToday = checkDate.getTime() === today.getTime();
                    const isInProgress = isToday && isClassInProgress(dateStr, schedule.startTime, schedule.endTime);
                    
                    if (!isInProgress) {
                        allClasses.push({
                            date: dateStr,
                            time: schedule.startTime,
                            endTime: schedule.endTime,
                            subjectName: subject.Nombre,
                            teacherName: teacherName,
                            classroom: subject.Aula || 'Aula por asignar',
                            subjectId: subject.ID_materia,
                            dateTime: classDateTime,
                            status: 'proxima'
                        });
                    }
                }
            }
        }
    });

    const combined = [
        ...inProgressClasses,
        ...allClasses
    ]
    .sort((a, b) => {
        const aInProgress = a.status === 'en_curso';
        const bInProgress = b.status === 'en_curso';
        if (aInProgress && !bInProgress) return -1;
        if (!aInProgress && bInProgress) return 1;
        return a.dateTime - b.dateTime;
    })
    .slice(0, 5);
    
    return combined.map(({ dateTime, ...rest }) => rest);
}

function parseSchedule(horario) {
    if (!horario) return null;

    const dayNames = {
        // Spanish
        'lunes': 1, 'martes': 2, 'miércoles': 3, 'jueves': 4, 
        'viernes': 5, 'sábado': 6, 'domingo': 0,
        // English
        'monday': 1, 'tuesday': 2, 'wednesday': 3, 'thursday': 4,
        'friday': 5, 'saturday': 6, 'sunday': 0
    };

    const lowerHorario = horario.toLowerCase();
    const days = [];
    
    // Extract all days (supports comma-separated, "y"/"and" separated, or single day)
    Object.keys(dayNames).forEach(day => {
        if (lowerHorario.includes(day)) {
            days.push(dayNames[day]);
        }
    });

    if (days.length === 0) return null;

    // Extract time range
    // Pattern 1: "HH:MM-HH:MM" format
    const timeRangePattern = /(\d{1,2}):(\d{2})\s*-\s*(\d{1,2}):(\d{2})/;
    const timeRangeMatch = horario.match(timeRangePattern);
    
    if (timeRangeMatch) {
        const startHour = parseInt(timeRangeMatch[1]);
        const startMin = parseInt(timeRangeMatch[2]);
        const endHour = parseInt(timeRangeMatch[3]);
        const endMin = parseInt(timeRangeMatch[4]);
        
        return {
            days: days,
            startTime: `${startHour.toString().padStart(2, '0')}:${startMin.toString().padStart(2, '0')}`,
            endTime: `${endHour.toString().padStart(2, '0')}:${endMin.toString().padStart(2, '0')}`
        };
    }

    // Pattern 2: "HHhs" format (e.g., "13hs")
    const hourPattern = /\s+(\d{1,2})hs/i;
    const hourMatch = horario.match(hourPattern);
    
    if (hourMatch) {
        const hour = parseInt(hourMatch[1]);
        return {
            days: days,
            startTime: `${hour.toString().padStart(2, '0')}:00`,
            endTime: `${(hour + 2).toString().padStart(2, '0')}:00`
        };
    }

    // Pattern 3: Single time "HH:MM" (assume 2 hour duration)
    const singleTimePattern = /\s+(\d{1,2}):(\d{2})/;
    const singleTimeMatch = horario.match(singleTimePattern);
    
    if (singleTimeMatch) {
        const startHour = parseInt(singleTimeMatch[1]);
        const startMin = parseInt(singleTimeMatch[2]);
        const endHour = startHour + 2;
        
        return {
            days: days,
            startTime: `${startHour.toString().padStart(2, '0')}:${startMin.toString().padStart(2, '0')}`,
            endTime: `${endHour.toString().padStart(2, '0')}:${startMin.toString().padStart(2, '0')}`
        };
    }

    // If no time found, return null
    return null;
}

// Make parseSchedule globally available for calendar.js
window.parseSchedule = parseSchedule;

function getNextClassOccurrences(schedule, fromDate, count) {
    const occurrences = [];
    const currentDate = new Date(fromDate);
    const now = new Date();
    
    
    
    // Look ahead up to 4 weeks to find next occurrences
    for (let week = 0; week < 4 && occurrences.length < count; week++) {
        for (let day = 0; day < 7; day++) {
            const checkDate = new Date(currentDate);
            checkDate.setDate(currentDate.getDate() + (week * 7) + day);
            
            if (schedule.days.includes(checkDate.getDay())) {
                const dateStr = checkDate.toISOString().split('T')[0];
                const timeStr = schedule.startTime;
                
                // Create a full datetime object for comparison using local timezone
                const [year, month, day] = dateStr.split('-');
                const [hours, minutes] = timeStr.split(':');
                const classDateTime = new Date(year, month - 1, day, hours, minutes, 0);
                
                
                // Only include future classes (considering both date and time)
                if (classDateTime > now) {
                    occurrences.push({
                        date: dateStr,
                        time: timeStr
                    });
                    
                    if (occurrences.length >= count) break;
                }
            }
        }
    }
    
    return occurrences;
}

function getEvaluationsForDate(date, subjectId = null) {
    const evaluations = appData.evaluacion || [];
    
    if (!evaluations || evaluations.length === 0) {
        return [];
    }
    
    // Normalizar la fecha para comparación (formato YYYY-MM-DD)
    const normalizedDate = date.includes('T') ? date.split('T')[0] : date.split(' ')[0];
    
    // Filtrar por fecha primero
    let filtered = evaluations.filter(eval => {
        // Normalizar la fecha de la evaluación también
        const evalDate = eval.Fecha ? (eval.Fecha.includes('T') ? eval.Fecha.split('T')[0] : eval.Fecha.split(' ')[0]) : null;
        return evalDate === normalizedDate;
    });
    
    // Si se proporciona subjectId, filtrar también por materia
    if (subjectId !== null && subjectId !== undefined) {
        filtered = filtered.filter(eval => {
            const evalMateriaId = parseInt(eval.Materia_ID_materia);
            const classSubjectId = parseInt(subjectId);
            return evalMateriaId === classSubjectId;
        });
    }
    
    return filtered;
}

// Función para verificar si una clase está "en curso" (dentro del rango horario actual)
function isClassInProgress(classDate, classStartTime, classEndTime) {
    const now = new Date();
    
    // Verificar que sea el mismo día
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    // Parsear la fecha de clase (formato YYYY-MM-DD)
    const [year, month, day] = classDate.split('-').map(Number);
    const classDay = new Date(year, month - 1, day);
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const classDayStart = new Date(classDay.getFullYear(), classDay.getMonth(), classDay.getDate());
    
    if (todayStart.getTime() !== classDayStart.getTime()) {
        return false;
    }
    
    // Obtener la hora actual
    const currentHours = now.getHours();
    const currentMinutes = now.getMinutes();
    const currentTime = currentHours * 60 + currentMinutes; // Convertir a minutos desde medianoche
    
    // Parsear hora de inicio y fin
    const [startHour, startMin] = classStartTime.split(':').map(Number);
    const [endHour, endMin] = classEndTime.split(':').map(Number);
    
    const startTime = startHour * 60 + startMin;
    const endTime = endHour * 60 + endMin;
    
    // Verificar si la hora actual está dentro del rango
    return currentTime >= startTime && currentTime <= endTime;
}

function formatDate(dateStr) {
    // Parse the date string as local date to avoid timezone issues
    const [year, month, day] = dateStr.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    
    // Reset time components to compare only dates
    const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const tomorrowDate = new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate());
    const classDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    
    const dayNames = {
        es: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
        en: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    };
    
    const monthNames = {
        es: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
             'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
        en: ['January', 'February', 'March', 'April', 'May', 'June',
             'July', 'August', 'September', 'October', 'November', 'December']
    };
    
    const lang = currentLanguage || 'es';
    
    if (classDate.getTime() === todayDate.getTime()) {
        return lang === 'es' ? 'Hoy' : 'Today';
    } else if (classDate.getTime() === tomorrowDate.getTime()) {
        return lang === 'es' ? 'Mañana' : 'Tomorrow';
    } else {
        return `${dayNames[lang][classDate.getDay()]}, ${classDate.getDate()} ${monthNames[lang][classDate.getMonth()]}`;
    }
}

function getEvaluationTypeLabel(type) {
    const labels = {
        es: {
            'EXAMEN': 'Examen',
            'PARCIAL': 'Parcial',
            'TRABAJO_PRACTICO': 'Trabajo Práctico',
            'PROYECTO': 'Proyecto',
            'ORAL': 'Examen Oral',
            'PRACTICO': 'Examen Práctico'
        },
        en: {
            'EXAMEN': 'Exam',
            'PARCIAL': 'Midterm',
            'TRABAJO_PRACTICO': 'Assignment',
            'PROYECTO': 'Project',
            'ORAL': 'Oral Exam',
            'PRACTICO': 'Practical Exam'
        }
    };
    
    return labels[currentLanguage][type] || type;
}

// Calendar System
let calendarInitialized = false;
let currentView = 'month'; // 'month' or 'week'
let currentWeekStart = null;
let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();

function initializeCalendar() {
    const calendarGrid = document.getElementById('calendarGrid');
    
    // Reset initialization if calendar grid exists and is empty or if we're on dashboard
    if (calendarInitialized && calendarGrid && calendarGrid.children.length === 0) {
        calendarInitialized = false;
    }
    
    if (calendarInitialized) return;
    
    const currentMonthElement = document.getElementById('currentMonth');
    const prevMonthBtn = document.getElementById('prevMonth');
    const nextMonthBtn = document.getElementById('nextMonth');
    const toggleButtons = document.querySelectorAll('.toggle-btn');

    if (!currentMonthElement || !calendarGrid) return;

    // Check if this is the widget calendar (different structure)
    const isWidget = calendarGrid.classList.contains('calendar-widget-grid') || 
                     calendarGrid.closest('.calendar-widget');

    // Ensure the widget grid class is set
    if (isWidget && !calendarGrid.classList.contains('calendar-widget-grid')) {
        calendarGrid.classList.add('calendar-widget-grid');
    }

    calendarInitialized = true;
    // Use global variables for month and year
    
    // Initialize current week start (Monday of current week)
    const today = new Date();
    const dayOfWeek = today.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Adjust for Sunday = 0
    currentWeekStart = new Date(today);
    currentWeekStart.setDate(today.getDate() + mondayOffset);

    const monthNames = {
        es: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
             'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
        en: ['January', 'February', 'March', 'April', 'May', 'June',
             'July', 'August', 'September', 'October', 'November', 'December']
    };

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dayNamesShort = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

    // Store isWidget in a way that's accessible to nested functions
    const widgetMode = isWidget;

    function renderCalendar() {
        if (currentView === 'month') {
            renderMonthView();
        } else {
            renderWeekView();
        }
    }
    
    // Make renderCalendar globally accessible
    window.renderCalendar = renderCalendar;

    function renderMonthView() {
        currentMonthElement.textContent = `${monthNames[currentLanguage][currentMonth]} ${currentYear}`;
        calendarGrid.innerHTML = '';
        calendarGrid.classList.remove('week-view');

        // For widget calendar, use shorter day names
        const dayNamesForDisplay = widgetMode ? 
            (currentLanguage === 'es' ? ['D', 'L', 'M', 'X', 'J', 'V', 'S'] : ['S', 'M', 'T', 'W', 'T', 'F', 'S']) :
            dayNames;

        // Add day headers
        dayNamesForDisplay.forEach(day => {
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
            const dayNumber = document.createElement('div');
            dayNumber.className = 'day-number';
            dayNumber.textContent = daysInPrevMonth - i;
            dayElement.appendChild(dayNumber);
            calendarGrid.appendChild(dayElement);
        }

        // Add current month's days
        for (let day = 1; day <= daysInMonth; day++) {
            const dayDate = new Date(currentYear, currentMonth, day);
            const dayElement = document.createElement('div');
            dayElement.className = 'calendar-day';
            
            // Add day number
            const dayNumber = document.createElement('div');
            dayNumber.className = 'day-number';
            dayNumber.textContent = day;
            dayElement.appendChild(dayNumber);
            
            // Get events for this day to show indicators
            const dayEvents = getEventsForDate(dayDate);
            
            if (widgetMode) {
                // In widget mode, show a small indicator dot if there are events
                if (dayEvents.length > 0) {
                    const indicator = document.createElement('div');
                    indicator.className = 'calendar-day-indicator';
                    indicator.style.cssText = 'width: 4px; height: 4px; background: #667eea; border-radius: 50%; position: absolute; bottom: 4px; left: 50%; transform: translateX(-50%);';
                    dayElement.style.position = 'relative';
                    dayElement.appendChild(indicator);
                    
                    // Add tooltip on hover
                    dayElement.title = `${dayEvents.length} evento(s)`;
                }
            } else {
                // Full calendar mode - show full event details
                const eventsContainer = document.createElement('div');
                eventsContainer.className = 'day-events';
                
                dayEvents.forEach(event => {
                    const eventElement = document.createElement('div');
                    let className = `event-item ${event.type}`;
                    
                    // Add special styling for recordatorios not belonging to user's subjects
                    if (event.type === 'recordatorio' && event.isUserSubject === false) {
                        className += ' other-subject';
                    }
                    
                    eventElement.className = className;
                    eventElement.innerHTML = `
                        <div class="event-time">${event.time}</div>
                        <div class="event-title">${event.title}</div>
                        <div class="event-type">${event.typeLabel}</div>
                        ${event.subject ? `<div class="event-subject">${event.subject}</div>` : ''}
                    `;
                    
                    // Add click interaction
                    eventElement.addEventListener('click', function() {
                        showEventDetails(event, dayDate);
                    });
                    
                    eventsContainer.appendChild(eventElement);
                });
                
                dayElement.appendChild(eventsContainer);
            }

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
            const dayNumber = document.createElement('div');
            dayNumber.className = 'day-number';
            dayNumber.textContent = day;
            dayElement.appendChild(dayNumber);
            calendarGrid.appendChild(dayElement);
        }
    }

    function renderWeekView() {
        const weekEnd = new Date(currentWeekStart);
        weekEnd.setDate(currentWeekStart.getDate() + 6);
        
        const weekStartMonth = currentWeekStart.getMonth();
        const weekStartYear = currentWeekStart.getFullYear();
        const weekEndMonth = weekEnd.getMonth();
        const weekEndYear = weekEnd.getFullYear();
        
        let headerText;
        if (weekStartMonth === weekEndMonth) {
            headerText = `${monthNames[currentLanguage][weekStartMonth]} ${weekStartYear}`;
        } else {
            headerText = `${monthNames[currentLanguage][weekStartMonth]} ${weekStartYear} - ${monthNames[currentLanguage][weekEndMonth]} ${weekEndYear}`;
        }
        
        currentMonthElement.textContent = headerText;
        calendarGrid.innerHTML = '';
        calendarGrid.classList.add('week-view');

        // Add day headers
        dayNamesShort.forEach(day => {
            const dayHeader = document.createElement('div');
            dayHeader.className = 'calendar-day-header';
            dayHeader.textContent = day;
            calendarGrid.appendChild(dayHeader);
        });

        // Add week days with events
        for (let i = 0; i < 7; i++) {
            const dayDate = new Date(currentWeekStart);
            dayDate.setDate(currentWeekStart.getDate() + i);
            
            const dayElement = document.createElement('div');
            dayElement.className = 'calendar-day';
            
            // Add day number
            const dayNumber = document.createElement('div');
            dayNumber.className = 'day-number';
            dayNumber.textContent = dayDate.getDate();
            dayElement.appendChild(dayNumber);
            
            // Add events container
            const eventsContainer = document.createElement('div');
            eventsContainer.className = 'day-events';
            
            // Get events for this day
            const dayEvents = getEventsForDate(dayDate);
            dayEvents.forEach(event => {
                const eventElement = document.createElement('div');
                let className = `event-item ${event.type}`;
                
                // Add special styling for recordatorios not belonging to user's subjects
                if (event.type === 'recordatorio' && event.isUserSubject === false) {
                    className += ' other-subject';
                }
                
                eventElement.className = className;
                eventElement.innerHTML = `
                    <div class="event-time">${event.time}</div>
                    <div class="event-title">${event.title}</div>
                    <div class="event-type">${event.typeLabel}</div>
                    ${event.subject ? `<div class="event-subject">${event.subject}</div>` : ''}
                `;
                
                // Add click interaction
                eventElement.addEventListener('click', function() {
                    showEventDetails(event, dayDate);
                });
                
                eventsContainer.appendChild(eventElement);
            });
            
            dayElement.appendChild(eventsContainer);

            // Highlight today
            const today = new Date();
            if (dayDate.toDateString() === today.toDateString()) {
                dayElement.classList.add('today');
            }

            calendarGrid.appendChild(dayElement);
        }
    }

    // Navigation button event listeners
    if (prevMonthBtn) {
        prevMonthBtn.addEventListener('click', function() {
            if (currentView === 'month') {
                currentMonth--;
                if (currentMonth < 0) {
                    currentMonth = 11;
                    currentYear--;
                }
            } else {
                // Week view: go to previous week
                currentWeekStart.setDate(currentWeekStart.getDate() - 7);
            }
            renderCalendar();
        });
    }

    if (nextMonthBtn) {
        nextMonthBtn.addEventListener('click', function() {
            if (currentView === 'month') {
                currentMonth++;
                if (currentMonth > 11) {
                    currentMonth = 0;
                    currentYear++;
                }
            } else {
                // Week view: go to next week
                currentWeekStart.setDate(currentWeekStart.getDate() + 7);
            }
            renderCalendar();
        });
    }

    // Toggle button event listeners
    toggleButtons.forEach(button => {
        button.addEventListener('click', function() {
            const view = this.getAttribute('data-view');
            
            // Update active button
            toggleButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // Update current view
            currentView = view;
            
            // If switching to week view, set current week start to current date
            if (view === 'week') {
                const today = new Date();
                const dayOfWeek = today.getDay();
                const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
                currentWeekStart = new Date(today);
                currentWeekStart.setDate(today.getDate() + mondayOffset);
            }
            
            renderCalendar();
        });
    });

    renderCalendar();
}

function getEventsForDate(date) {
    const events = [];
    const dateStr = formatDateForAPI(date);
    const currentUserId = localStorage.getItem('userId');
    
    if (!currentUserId) {
        return events;
    }
    
    // Get recordatorios for this date
    const recordatorios = appData.recordatorio || [];
    
    recordatorios.forEach(recordatorio => {
        if (recordatorio.Fecha === dateStr) {
            // Get the subject name
            const subject = appData.materia.find(m => m.ID_materia === recordatorio.Materia_ID_materia);
            const subjectName = subject ? subject.Nombre : 'Materia no encontrada';
            
            // Check if this recordatorio is for a subject taught by the current user
            const isUserSubject = subject && subject.Usuarios_docente_ID_docente === parseInt(currentUserId);
            
            // Always show recordatorios, but with different styling based on ownership
            events.push({
                type: 'recordatorio',
                typeLabel: 'Recordatorio',
                title: recordatorio.Descripcion,
                time: getTimeFromRecordatorio(recordatorio),
                priority: recordatorio.Prioridad,
                subject: subjectName,
                isUserSubject: isUserSubject,
                recordatorioType: recordatorio.Tipo
            });
        }
    });
    
    // Get classes for this date
    const subjects = appData.materia || [];
    subjects.forEach(subject => {
        if (subject.Usuarios_docente_ID_docente !== parseInt(currentUserId)) return;
        
        const schedule = parseSchedule(subject.Horario);
        if (!schedule) return;
        
        if (schedule.days.includes(date.getDay())) {
            events.push({
                type: 'clase',
                typeLabel: 'Clase',
                title: subject.Nombre,
                time: schedule.startTime,
                subject: subject.Nombre,
                classroom: subject.Aula || 'Aula por asignar'
            });
        }
    });
    
    // Get evaluations for this date
    const evaluaciones = appData.evaluacion || [];
    evaluaciones.forEach(evaluacion => {
        if (evaluacion.Fecha === dateStr) {
            const subject = appData.materia.find(m => m.ID_materia === evaluacion.Materia_ID_materia);
            const subjectName = subject ? subject.Nombre : 'Materia no encontrada';
            
            events.push({
                type: 'evaluacion',
                typeLabel: evaluacion.Tipo,
                title: evaluacion.Titulo,
                time: '09:00', // Default time for evaluations
                subject: subjectName
            });
        }
    });
    
    // Sort events by time
    return events.sort((a, b) => {
        const timeA = a.time || '00:00';
        const timeB = b.time || '00:00';
        return timeA.localeCompare(timeB);
    });
}

function formatDateForAPI(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function getTimeFromRecordatorio(recordatorio) {
    // For recordatorios, we'll use a default time based on priority
    const priorityTimes = {
        'ALTA': '08:00',
        'MEDIA': '10:00',
        'BAJA': '14:00'
    };
    return priorityTimes[recordatorio.Prioridad] || '09:00';
}

function showEventDetails(event, date) {
    const eventDetails = {
        recordatorio: () => {
            alert(`📝 Recordatorio\n\n${event.title}\n\n📅 Fecha: ${formatDate(date)}\n⏰ Hora: ${event.time}\n📚 Materia: ${event.subject}\n🎯 Prioridad: ${event.priority}`);
        },
        clase: () => {
            alert(`📚 Clase\n\n${event.title}\n\n📅 Fecha: ${formatDate(date)}\n⏰ Hora: ${event.time}\n🏫 Aula: ${event.classroom}`);
        },
        evaluacion: () => {
            alert(`📝 Evaluación\n\n${event.title}\n\n📅 Fecha: ${formatDate(date)}\n⏰ Hora: ${event.time}\n📚 Materia: ${event.subject}\n📋 Tipo: ${event.typeLabel}`);
        }
    };
    
    if (eventDetails[event.type]) {
        eventDetails[event.type]();
    }
}

function updateCalendar() {
    if (calendarInitialized) {
        initializeCalendar();
    }
}

// Debug function to test recordatorios
window.testRecordatorios = function() {
    const currentUserId = localStorage.getItem('userId');
    const userSubjects = appData.materia.filter(m => m.Usuarios_docente_ID_docente === parseInt(currentUserId));
    const testDate = new Date('2024-12-20');
    const events = getEventsForDate(testDate);
    const testDate2 = new Date('2024-12-25');
    const events2 = getEventsForDate(testDate2);
};

// Function to navigate to a specific week with recordatorios
window.goToWeekWithRecordatorios = function() {
    // Set the calendar to show the week of December 20, 2024 (which has recordatorios)
    currentWeekStart = new Date('2024-12-16'); // Monday of that week
    currentView = 'week';
    
    // Update the toggle buttons
    const toggleButtons = document.querySelectorAll('.toggle-btn');
    toggleButtons.forEach(btn => btn.classList.remove('active'));
    const weekButton = document.querySelector('[data-view="week"]');
    if (weekButton) weekButton.classList.add('active');
    
    // Re-render the calendar
    renderCalendar();
    
};

// Simple test function to check recordatorios
window.testSimpleRecordatorios = function() {
    const testDate = new Date('2024-12-20');
    const formattedDate = formatDateForAPI(testDate);
    const matchingRecordatorios = appData.recordatorio.filter(r => r.Fecha === formattedDate);
    const events = getEventsForDate(testDate);
};

// Function to test calendar with recordatorios
window.testCalendarWithRecordatorios = function() {
    localStorage.setItem('userId', '1');
    currentMonth = 11; // December (0-indexed)
    currentYear = 2024;
    currentView = 'month';
    
    if (typeof renderCalendar === 'function') {
        renderCalendar();
    } else {
        calendarInitialized = false;
        initializeCalendar();
    }
    
    const testDates = [
        new Date('2024-12-20'),
        new Date('2024-12-21'),
        new Date('2024-12-22'),
        new Date('2024-12-24'),
        new Date('2024-12-25')
    ];
    
    testDates.forEach(date => {
        const events = getEventsForDate(date);
    });
};

// Debug function to check recordatorios filtering
window.debugRecordatorios = function() {
    const currentUserId = parseInt(localStorage.getItem('userId'));
    const userSubjects = appData.materia.filter(m => m.Usuarios_docente_ID_docente === currentUserId);
    const testDate = new Date('2024-12-20');
    const dateStr = formatDateForAPI(testDate);
    const matchingRecordatorios = appData.recordatorio.filter(r => r.Fecha === dateStr);
    
    matchingRecordatorios.forEach(recordatorio => {
        const subject = appData.materia.find(m => m.ID_materia === recordatorio.Materia_ID_materia);
        const isUserSubject = subject && subject.Usuarios_docente_ID_docente === currentUserId;
    });
    
    const events = getEventsForDate(testDate);
};

// Quick function to navigate to December 2024 and show recordatorios
window.showDecemberRecordatorios = function() {
    localStorage.setItem('userId', '1');
    currentMonth = 11; // December (0-indexed)
    currentYear = 2024;
    currentView = 'month';
    renderCalendar();
};

// Function to navigate to a specific month and year
window.navigateToMonth = function(month, year) {
    currentMonth = month;
    currentYear = year;
    renderCalendar();
};

// Simple function to test recordatorios display
window.testRecordatoriosDisplay = function() {
    localStorage.setItem('userId', '1');
    currentMonth = 11; // December
    currentYear = 2024;
    
    if (typeof renderCalendar === 'function') {
        renderCalendar();
    } else {
        calendarInitialized = false;
        initializeCalendar();
    }
    
    const testDate = new Date('2024-12-20');
    const events = getEventsForDate(testDate);
};

// Function to navigate to January 2025 with new recordatorios
window.showJanuaryRecordatorios = function() {
    localStorage.setItem('userId', '1');
    currentMonth = 0; // January (0-indexed)
    currentYear = 2025;
    currentView = 'month';
    
    if (typeof renderCalendar === 'function') {
        renderCalendar();
    } else {
        calendarInitialized = false;
        initializeCalendar();
    }
};

// Function to navigate to October 2025 with recordatorios
window.showOctoberRecordatorios = function() {
    localStorage.setItem('userId', '1');
    currentMonth = 9; // October (0-indexed)
    currentYear = 2025;
    currentView = 'month';
    
    if (typeof renderCalendar === 'function') {
        renderCalendar();
    } else {
        calendarInitialized = false;
        initializeCalendar();
    }
};

// Function to navigate to November 2025 with recordatorios
window.showNovemberRecordatorios = function() {
    localStorage.setItem('userId', '1');
    currentMonth = 10; // November (0-indexed)
    currentYear = 2025;
    currentView = 'month';
    
    if (typeof renderCalendar === 'function') {
        renderCalendar();
    } else {
        calendarInitialized = false;
        initializeCalendar();
    }
};
