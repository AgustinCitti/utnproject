// Notifications Management
function initializeNotifications() {
    const markAllReadBtn = document.getElementById('markAllReadBtn');
    
    if (markAllReadBtn) {
        markAllReadBtn.addEventListener('click', () => {
            markAllNotificationsRead();
        });
    }
    
    // Load recordatorios for docente
    loadRecordatorios();
}

function loadNotifications() {
    const notificationsContainer = document.getElementById('notificationsContainer');
    const notificationsList = document.getElementById('notificationsList');
    
    if (!notificationsContainer || !notificationsList) return;

    // Check if appData is loaded
    if (!appData) {
        console.error('appData is not loaded');
        return;
    }

    // Get current docente user
    const currentUser = getCurrentUser();
    if (!currentUser) {
        console.log('No current user found');
        return;
    }

    // Get recordatorios for current docente's subjects
    const recordatorios = getRecordatoriosForDocente(currentUser.ID_docente);
    
    // Initialize notifications array if it doesn't exist
    if (!appData.notifications) {
        appData.notifications = [];
    }
    
    // Combine regular notifications with recordatorios
    const allNotifications = [
        ...(appData.notifications || []).map(n => ({ ...n, type: 'notification' })),
        ...recordatorios.map(r => ({
            id: `recordatorio_${r.ID_recordatorio}`,
            title: getRecordatorioTitle(r),
            message: r.Descripcion,
            date: formatRecordatorioDate(r.Fecha),
            read: false,
            type: 'recordatorio',
            recordatorio: r
        }))
    ];

    // Grid view - Modern design
    if (allNotifications.length === 0) {
        notificationsContainer.innerHTML = `
            <div class="notifications-empty">
                <i class="fas fa-bell-slash"></i>
                <h3>No notifications</h3>
                <p>You're all caught up! No new notifications at the moment.</p>
            </div>
        `;
    } else {
        notificationsContainer.innerHTML = allNotifications.map(notification => `
            <div class="notification-card ${notification.read ? 'read' : 'unread'} ${notification.type}">
                <div class="notification-header">
                    <h3 class="notification-title">
                        ${notification.type === 'recordatorio' ? '<i class="fas fa-bell"></i>' : '<i class="fas fa-info-circle"></i>'}
                        ${notification.title}
                    </h3>
                    <div class="notification-meta">
                        <span class="notification-date">${notification.date}</span>
                        ${notification.type === 'recordatorio' ? `<span class="priority-badge ${notification.recordatorio.Prioridad.toLowerCase()}">${notification.recordatorio.Prioridad}</span>` : ''}
                    </div>
                </div>
                <div class="notification-content">
                    <p class="notification-message">${notification.message}</p>
                    ${notification.type === 'recordatorio' ? `
                        <div class="recordatorio-details">
                            <span class="recordatorio-type">${getRecordatorioTypeLabel(notification.recordatorio.Tipo)}</span>
                            <span class="recordatorio-subject">${getSubjectName(notification.recordatorio.Materia_ID_materia)}</span>
                        </div>
                    ` : ''}
                </div>
                <div class="notification-actions">
                    ${!notification.read ? `<button class="btn btn-sm btn-success" onclick="markNotificationRead('${notification.id}')" title="Mark as Read">
                        <i class="fas fa-check"></i> Mark as Read
                    </button>` : ''}
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteNotification('${notification.id}')" title="Delete">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                    ${notification.type === 'recordatorio' ? `<button class="btn btn-sm btn-outline-primary" onclick="viewRecordatorio('${notification.recordatorio.ID_recordatorio}')" title="View Details">
                        <i class="fas fa-eye"></i> View Details
                    </button>` : ''}
                </div>
            </div>
        `).join('');
    }

    // List view - Modern table format
    if (allNotifications.length === 0) {
        notificationsList.innerHTML = `
            <div class="notifications-empty">
                <i class="fas fa-bell-slash"></i>
                <h3>No notifications</h3>
                <p>You're all caught up! No new notifications at the moment.</p>
            </div>
        `;
    } else {
        notificationsList.innerHTML = `
            <table>
                <thead>
                    <tr>
                        <th>Type</th>
                        <th>Title</th>
                        <th>Message</th>
                        <th>Date</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${allNotifications.map(notification => {
                        const shortDate = notification.date.split('-').slice(1).join('/');
                        const shortMessage = notification.message.length > 30 ? notification.message.substring(0, 30) + '...' : notification.message;
                        return `
                            <tr class="${notification.read ? 'read' : 'unread'} ${notification.type}">
                                <td>
                                    ${notification.type === 'recordatorio' ? 
                                        `<span class="type-badge recordatorio"><i class="fas fa-bell"></i> Recordatorio</span>` : 
                                        `<span class="type-badge notification"><i class="fas fa-info-circle"></i> Notification</span>`
                                    }
                                </td>
                                <td><strong>${notification.title}</strong></td>
                                <td title="${notification.message}">${shortMessage}</td>
                                <td>${shortDate}</td>
                                <td><span class="table-status ${notification.read ? 'read' : 'unread'}">${notification.read ? 'Read' : 'Unread'}</span></td>
                                <td>
                                    <div class="table-actions">
                                        ${!notification.read ? `<button class="btn btn-sm btn-success" onclick="markNotificationRead('${notification.id}')" title="Mark as Read">
                                            <i class="fas fa-check"></i>
                                        </button>` : ''}
                                        <button class="btn btn-sm btn-outline-danger" onclick="deleteNotification('${notification.id}')" title="Delete">
                                            <i class="fas fa-trash"></i>
                                        </button>
                                        ${notification.type === 'recordatorio' ? `<button class="btn btn-sm btn-outline-primary" onclick="viewRecordatorio('${notification.recordatorio.ID_recordatorio}')" title="View Details">
                                            <i class="fas fa-eye"></i>
                                        </button>` : ''}
                                    </div>
                                </td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        `;
    }
}

function updateNotificationCount() {
    // Check if appData is loaded
    if (!appData) {
        console.error('appData is not loaded');
        return;
    }
    
    // Get current docente user
    const currentUser = getCurrentUser();
    if (!currentUser) return;
    
    // Get recordatorios for current docente's subjects
    const recordatorios = getRecordatoriosForDocente(currentUser.ID_docente);
    
    // Initialize notifications array if it doesn't exist
    if (!appData.notifications) {
        appData.notifications = [];
    }
    
    // Count unread notifications and recordatorios
    const notificationCount = (appData.notifications || []).filter(n => !n.read).length;
    const recordatorioCount = recordatorios.filter(r => r.Estado === 'PENDIENTE').length;
    const totalCount = notificationCount + recordatorioCount;
    
    // Update notification count in header
    const notificationCountElement = document.getElementById('notificationCount');
    if (notificationCountElement) {
        notificationCountElement.textContent = totalCount;
        notificationCountElement.style.display = totalCount > 0 ? 'inline' : 'none';
    }
    
    // Update mobile notification badge
    const mobileBadge = document.getElementById('mobileNotificationCount');
    if (mobileBadge) {
        mobileBadge.textContent = totalCount;
        mobileBadge.style.display = totalCount > 0 ? 'inline' : 'none';
    }
    
    // Update desktop notification badge
    const desktopBadge = document.getElementById('desktopNotificationCount');
    if (desktopBadge) {
        desktopBadge.textContent = totalCount;
        desktopBadge.style.display = totalCount > 0 ? 'inline' : 'none';
    }
}

function markNotificationRead(id) {
    if (!appData) {
        console.error('appData is not loaded');
        return;
    }
    
    if (id.startsWith('recordatorio_')) {
        // Handle recordatorio - mark as completed
        const recordatorioId = parseInt(id.replace('recordatorio_', ''));
        const recordatorio = appData.recordatorio.find(r => r.ID_recordatorio === recordatorioId);
        if (recordatorio) {
            recordatorio.Estado = 'COMPLETADO';
            saveData();
            loadNotifications();
            updateNotificationCount();
        }
    } else {
        // Handle regular notification
        if (!appData.notifications) {
            appData.notifications = [];
        }
        const notification = appData.notifications.find(n => n.id === id);
        if (notification) {
            notification.read = true;
            saveData();
            loadNotifications();
            updateNotificationCount();
        }
    }
}

function markAllNotificationsRead() {
    if (!appData) {
        console.error('appData is not loaded');
        return;
    }
    
    if (!appData.notifications) {
        appData.notifications = [];
    }
    
    appData.notifications.forEach(n => n.read = true);
    saveData();
    loadNotifications();
    updateNotificationCount();
}

function deleteNotification(id) {
    if (!appData) {
        console.error('appData is not loaded');
        return;
    }
    
    if (confirm('Are you sure you want to delete this notification?')) {
        if (id.startsWith('recordatorio_')) {
            // Handle recordatorio deletion
            const recordatorioId = parseInt(id.replace('recordatorio_', ''));
            appData.recordatorio = appData.recordatorio.filter(r => r.ID_recordatorio !== recordatorioId);
        } else {
            // Handle regular notification deletion
            if (!appData.notifications) {
                appData.notifications = [];
            }
            appData.notifications = appData.notifications.filter(n => n.id !== id);
        }
        saveData();
        loadNotifications();
        updateNotificationCount();
    }
}

// Helper functions for recordatorios
function getCurrentUser() {
    // Get current user from localStorage and match with docente data
    const username = localStorage.getItem('username');
    if (!username) return null;
    
    // Try to find docente by email first
    let docente = appData.usuarios_docente.find(d => d.Email_docente === username);
    
    // If not found by email, try to find by name or ID
    if (!docente) {
        // Try to find by name (for cases where username might be "Luis" or "Ana")
        docente = appData.usuarios_docente.find(d => 
            d.Nombre_docente.toLowerCase() === username.toLowerCase() ||
            d.Apellido_docente.toLowerCase() === username.toLowerCase() ||
            `${d.Nombre_docente} ${d.Apellido_docente}`.toLowerCase() === username.toLowerCase()
        );
    }
    
    // If still not found, try to find by ID (for cases where username might be "2")
    if (!docente && !isNaN(username)) {
        docente = appData.usuarios_docente.find(d => d.ID_docente === parseInt(username));
    }
    
    // Debug logging
    console.log('getCurrentUser - username:', username);
    console.log('getCurrentUser - found docente:', docente);
    
    return docente || null;
}

function loadRecordatorios() {
    // This function is called during initialization
    // The actual loading is done in loadNotifications()
}

function getRecordatoriosForDocente(docenteId) {
    // Check if appData is loaded
    if (!appData) {
        console.error('appData is not loaded');
        return [];
    }
    
    // Check if required data exists
    if (!appData.materia) {
        console.error('appData.materia is not loaded');
        return [];
    }
    
    if (!appData.recordatorio) {
        console.error('appData.recordatorio is not loaded');
        return [];
    }
    
    // Get subjects taught by this docente
    const docenteSubjects = appData.materia.filter(m => m.Usuarios_docente_ID_docente === docenteId);
    const subjectIds = docenteSubjects.map(s => s.ID_materia);
    
    // Debug logging
    console.log('getRecordatoriosForDocente - docenteId:', docenteId);
    console.log('getRecordatoriosForDocente - docenteSubjects:', docenteSubjects);
    console.log('getRecordatoriosForDocente - subjectIds:', subjectIds);
    
    // Get recordatorios for these subjects
    const recordatorios = appData.recordatorio.filter(r => subjectIds.includes(r.Materia_ID_materia));
    console.log('getRecordatoriosForDocente - found recordatorios:', recordatorios);
    
    return recordatorios;
}

function getRecordatorioTitle(recordatorio) {
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

function formatRecordatorioDate(dateStr) {
    const date = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    
    // Reset time components to compare only dates
    const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const tomorrowDate = new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate());
    const recordatorioDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    
    if (recordatorioDate.getTime() === todayDate.getTime()) {
        return currentLanguage === 'es' ? 'Hoy' : 'Today';
    } else if (recordatorioDate.getTime() === tomorrowDate.getTime()) {
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
        
        return `${dayNames[currentLanguage][date.getDay()]}, ${date.getDate()} ${monthNames[currentLanguage][date.getMonth()]}`;
    }
}

function getRecordatorioTypeLabel(type) {
    const labels = {
        es: {
            'EXAMEN': 'Examen',
            'ENTREGA': 'Entrega',
            'CLASE': 'Clase',
            'REUNION': 'Reunión',
            'EVENTO': 'Evento'
        },
        en: {
            'EXAMEN': 'Exam',
            'ENTREGA': 'Assignment',
            'CLASE': 'Class',
            'REUNION': 'Meeting',
            'EVENTO': 'Event'
        }
    };
    
    return labels[currentLanguage][type] || type;
}

function getSubjectName(subjectId) {
    const subject = appData.materia.find(m => m.ID_materia === subjectId);
    return subject ? subject.Nombre : 'Materia no encontrada';
}

// Debug function to test recordatorios
function debugRecordatorios() {
    console.log('=== DEBUGGING RECORDATORIOS ===');
    
    // Check current user
    const currentUser = getCurrentUser();
    console.log('Current user:', currentUser);
    
    if (!currentUser) {
        console.log('No current user found. Check localStorage username:', localStorage.getItem('username'));
        console.log('Available docentes:', appData.usuarios_docente);
        return;
    }
    
    // Check subjects for this docente
    const subjects = appData.materia.filter(m => m.Usuarios_docente_ID_docente === currentUser.ID_docente);
    console.log('Subjects for docente', currentUser.ID_docente, ':', subjects);
    
    // Check recordatorios
    const recordatorios = getRecordatoriosForDocente(currentUser.ID_docente);
    console.log('Recordatorios for docente', currentUser.ID_docente, ':', recordatorios);
    
    // Check all recordatorios
    console.log('All recordatorios:', appData.recordatorio);
    
    return {
        currentUser,
        subjects,
        recordatorios
    };
}

// Function to view recordatorio details
function viewRecordatorio(recordatorioId) {
    // Find the recordatorio in the data
    const recordatorio = appData.recordatorio.find(r => r.ID_recordatorio == recordatorioId);
    if (!recordatorio) {
        console.error('Recordatorio not found:', recordatorioId);
        return;
    }
    
    // Get subject name
    const subject = appData.materia.find(m => m.ID_materia == recordatorio.Materia_ID_materia);
    const subjectName = subject ? subject.Nombre : 'Unknown Subject';
    
    // Create modal content
    const modalContent = `
        <div class="modal-header">
            <h3><i class="fas fa-bell"></i> Recordatorio Details</h3>
            <button class="close-modal" onclick="closeModal()">&times;</button>
        </div>
        <div class="modal-body">
            <div class="recordatorio-detail">
                <div class="detail-row">
                    <label>Título:</label>
                    <span>${recordatorio.Titulo}</span>
                </div>
                <div class="detail-row">
                    <label>Descripción:</label>
                    <span>${recordatorio.Descripcion}</span>
                </div>
                <div class="detail-row">
                    <label>Materia:</label>
                    <span>${subjectName}</span>
                </div>
                <div class="detail-row">
                    <label>Tipo:</label>
                    <span class="type-badge ${recordatorio.Tipo.toLowerCase()}">${getRecordatorioTypeLabel(recordatorio.Tipo)}</span>
                </div>
                <div class="detail-row">
                    <label>Prioridad:</label>
                    <span class="priority-badge ${recordatorio.Prioridad.toLowerCase()}">${recordatorio.Prioridad}</span>
                </div>
                <div class="detail-row">
                    <label>Fecha de Vencimiento:</label>
                    <span>${recordatorio.Fecha_vencimiento}</span>
                </div>
            </div>
        </div>
        <div class="modal-footer">
            <button class="btn btn-secondary" onclick="closeModal()">Close</button>
        </div>
    `;
    
    // Show modal
    showModal(modalContent);
}

// Make debug function globally accessible
window.debugRecordatorios = debugRecordatorios;
