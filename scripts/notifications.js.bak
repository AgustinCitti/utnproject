// Global variables and config
const NOTIFICATION_SYNC_INTERVAL = 30000; // 30 seconds
let lastSyncTimestamp = 0;

// Helper function to get the correct API base URL
function getApiBaseUrl() {
    const isInPages = window.location.pathname.includes('/pages/');
    return isInPages ? '../api' : 'api';
}

// Sync notifications from server
async function syncNotifications() {
    try {
        const now = Date.now();
        // Don't sync if less than interval has passed
        if (now - lastSyncTimestamp < NOTIFICATION_SYNC_INTERVAL) {
            return;
        }
        lastSyncTimestamp = now;

        const response = await fetch(`${getApiBaseUrl()}/notifications.php`, {
            credentials: 'include'
        });
        const data = await response.json();
        
        if (data && data.success && data.notifications) {
            // Update local notifications
            if (!appData) appData = {};
            appData.notifications = data.notifications;
            saveData();
            
            // Only reload UI if we're on a page with notifications
            const hasNotificationUI = document.getElementById('notificationsContainer') 
                                 || document.getElementById('notificationsList');
            if (hasNotificationUI) {
                loadNotifications();
                updateNotificationCount();
            }
        }
    } catch (err) {
        // Error syncing notifications - silently handled
    }
}

// Start periodic sync when document loads
document.addEventListener('DOMContentLoaded', () => {
    syncNotifications();
    setInterval(syncNotifications, NOTIFICATION_SYNC_INTERVAL);
});

// Notifications Management
async function initializeNotifications() {
    const markAllReadBtn = document.getElementById('markAllReadBtn');
    
    if (markAllReadBtn) {
        markAllReadBtn.addEventListener('click', () => {
            markAllNotificationsRead();
        });
    }
    
    // Initial sync of notifications from server
    await syncNotifications();
    
    // Load recordatorios for docente from API
    await loadRecordatorios();
    
    // Update notification counts
    updateNotificationCount();
}

async function loadNotifications() {
    const notificationsContainer = document.getElementById('notificationsContainer');
    const notificationsList = document.getElementById('notificationsList');
    
    if (!notificationsContainer || !notificationsList) return;

    // Check if appData is loaded
    if (!appData) {
        return;
    }

    // If notifications are not present locally or it's been a while since last sync, sync from server
    const now = Date.now();
    if (!appData.notifications || (now - lastSyncTimestamp >= NOTIFICATION_SYNC_INTERVAL)) {
        // Trigger a sync and wait for it
        await syncNotifications();
        // If still no notifications after sync, return
        if (!appData.notifications) {
            return;
        }
    }
    
    // Reload recordatorios from API to ensure we have the latest data
    await loadRecordatorios();

    // Get current docente user
    const currentUser = getCurrentUser();
    if (!currentUser) {
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
            fecha: r.Fecha,
            fecha_creacion: r.Fecha_creacion,
            read: r.Estado === 'COMPLETADO',
            type: 'recordatorio',
            recordatorio: r
        }))
    ];

    // Grid view - Modern design
    if (allNotifications.length === 0) {
        const lang = currentLanguage || 'es';
        notificationsContainer.innerHTML = `
            <div class="notifications-empty">
                <i class="fas fa-bell-slash"></i>
                <h3>${translations[lang].no_notifications}</h3>
                <p>${translations[lang].all_caught_up}</p>
            </div>
        `;
    } else {
        const lang = currentLanguage || 'es';
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
                            <div class="recordatorio-meta">
                                <span class="recordatorio-type"><i class="fas fa-tag"></i> ${getRecordatorioTypeLabel(notification.recordatorio.Tipo)}</span>
                                <span class="recordatorio-subject"><i class="fas fa-book"></i> ${getSubjectName(notification.recordatorio.Materia_ID_materia)}</span>
                            </div>
                            ${notification.fecha_creacion ? `<div class="recordatorio-created"><i class="fas fa-calendar-plus"></i> Creado: ${new Date(notification.fecha_creacion).toLocaleDateString()}</div>` : ''}
                        </div>
                    ` : ''}
                </div>
                <div class="notification-actions">
                    ${!notification.read ? `<button class="btn btn-sm btn-success" onclick="markNotificationRead('${notification.id}')" title="${translations[lang].mark_as_read}">
                        <i class="fas fa-check"></i> ${translations[lang].mark_as_read}
                    </button>` : ''}
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteNotification('${notification.id}')" title="${translations[lang].delete}">
                        <i class="fas fa-trash"></i> ${translations[lang].delete}
                    </button>
                    ${notification.type === 'recordatorio' ? `<button class="btn btn-sm btn-outline-primary" onclick="viewRecordatorio('${notification.recordatorio.ID_recordatorio}')" title="${translations[lang].view_details}">
                        <i class="fas fa-eye"></i> ${translations[lang].view_details}
                    </button>` : ''}
                </div>
            </div>
        `).join('');
    }

    // List view - Modern table format with all recordatorio fields
    const lang = currentLanguage || 'es';
    if (allNotifications.length === 0) {
        notificationsList.innerHTML = `
            <div class="notifications-empty">
                <i class="fas fa-bell-slash"></i>
                <h3>${translations[lang].no_notifications}</h3>
                <p>${translations[lang].all_caught_up}</p>
            </div>
        `;
    } else {
        notificationsList.innerHTML = `
            <table>
                <thead>
                    <tr>
                        <th>${translations[lang].notification_type || 'Tipo'}</th>
                        <th>${translations[lang].notification_title || 'Título'}</th>
                        <th>${translations[lang].notification_message || 'Descripción'}</th>
                        <th>${translations[lang].notification_date || 'Fecha'}</th>
                        <th>Prioridad</th>
                        <th>${translations[lang].notification_status || 'Estado'}</th>
                        <th>Fecha Creación</th>
                        <th>${translations[lang].notification_actions || 'Acciones'}</th>
                    </tr>
                </thead>
                <tbody>
                    ${allNotifications.map(notification => {
                        const shortDate = notification.fecha ? new Date(notification.fecha).toLocaleDateString() : notification.date;
                        const shortMessage = notification.message && notification.message.length > 50 ? notification.message.substring(0, 50) + '...' : (notification.message || '');
                        const prioridad = notification.recordatorio ? notification.recordatorio.Prioridad : '';
                        const fechaCreacion = notification.fecha_creacion ? new Date(notification.fecha_creacion).toLocaleDateString() : '';
                        const tipo = notification.recordatorio ? notification.recordatorio.Tipo : '';
                        const estado = notification.recordatorio ? notification.recordatorio.Estado : (notification.read ? 'COMPLETADO' : 'PENDIENTE');
                        
                        return `
                            <tr class="${notification.read ? 'read' : 'unread'} ${notification.type}">
                                <td>
                                    ${notification.type === 'recordatorio' ? 
                                        `<span class="type-badge recordatorio"><i class="fas fa-bell"></i> ${tipo || 'Recordatorio'}</span>` : 
                                        `<span class="type-badge notification"><i class="fas fa-info-circle"></i> ${translations[lang].notification_type_label || 'Notificación'}</span>`
                                    }
                                </td>
                                <td><strong>${notification.title}</strong></td>
                                <td title="${notification.message || ''}">${shortMessage}</td>
                                <td>${shortDate}</td>
                                <td>${prioridad ? `<span class="priority-badge ${prioridad.toLowerCase()}">${prioridad}</span>` : '-'}</td>
                                <td><span class="table-status ${estado === 'COMPLETADO' || notification.read ? 'read' : 'unread'}">${estado || (notification.read ? translations[lang].read_status : translations[lang].unread_status)}</span></td>
                                <td>${fechaCreacion || '-'}</td>
                                <td>
                                    <div class="table-actions">
                                        ${!notification.read && estado !== 'COMPLETADO' ? `<button class="btn btn-sm btn-success" onclick="markNotificationRead('${notification.id}')" title="${translations[lang].mark_as_read || 'Marcar como leído'}">
                                            <i class="fas fa-check"></i>
                                        </button>` : ''}
                                        <button class="btn btn-sm btn-outline-danger" onclick="deleteNotification('${notification.id}')" title="${translations[lang].delete || 'Eliminar'}">
                                            <i class="fas fa-trash"></i>
                                        </button>
                                        ${notification.type === 'recordatorio' ? `<button class="btn btn-sm btn-outline-primary" onclick="viewRecordatorio('${notification.recordatorio.ID_recordatorio}')" title="${translations[lang].view_details || 'Ver detalles'}">
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
        return;
    }
    
    if (id.startsWith('recordatorio_')) {
        // Handle recordatorio - mark as completed via API
        const recordatorioId = parseInt(id.replace('recordatorio_', ''));
        fetch(`${getApiBaseUrl()}/recordatorio.php?id=${recordatorioId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ Estado: 'COMPLETADO' })
        })
        .then(r => r.json())
        .then(resp => {
            if (resp && resp.success) {
                // Update local data
                if (!appData.recordatorio || !Array.isArray(appData.recordatorio)) {
                    appData.recordatorio = [];
                }
                const recordatorio = appData.recordatorio.find(r => r.ID_recordatorio === recordatorioId);
                if (recordatorio) {
                    recordatorio.Estado = 'COMPLETADO';
                }
                saveData();
                loadNotifications();
                updateNotificationCount();
            } else {
                console.error('Failed to mark recordatorio as completed', resp);
            }
        })
        .catch(err => console.error('Error marking recordatorio as completed', err));
    } else {
        // Handle regular notification
        if (!appData.notifications) {
            appData.notifications = [];
        }
        // call API to mark as read
        fetch(`${getApiBaseUrl()}/notifications.php`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ id: id, action: 'mark_read' })
        })
        .then(r => r.json())
        .then(resp => {
            if (resp && resp.success) {
                const notification = appData.notifications.find(n => n.id === id);
                if (notification) notification.read = true;
                saveData();
                loadNotifications();
                updateNotificationCount();
            } else {
                console.error('Failed to mark notification read', resp);
            }
        })
        .catch(err => console.error('Error marking notification read', err));
    }
}

function markAllNotificationsRead() {
    if (!appData) {
        return;
    }
    
    if (!appData.notifications) {
        appData.notifications = [];
    }
    // mark each notification via API and update local state
    const promises = appData.notifications.map(n => {
        if (n.read) return Promise.resolve();
        return fetch(`${getApiBaseUrl()}/notifications.php`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ id: n.id, action: 'mark_read' })
        }).then(r => r.json()).catch(() => null);
    });

    Promise.all(promises).then(() => {
        appData.notifications.forEach(n => n.read = true);
        saveData();
        loadNotifications();
        updateNotificationCount();
    });
}

function deleteNotification(id) {
    if (!appData) {
        return;
    }
    
    const lang = currentLanguage || 'es';
    if (confirm(translations[lang].delete_notification_confirm || '¿Está seguro de que desea eliminar esta notificación?')) {
        if (id.startsWith('recordatorio_')) {
            // Handle recordatorio deletion via API
            const recordatorioId = parseInt(id.replace('recordatorio_', ''));
            fetch(`${getApiBaseUrl()}/recordatorio.php?id=${recordatorioId}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include'
            })
            .then(r => r.json())
            .then(resp => {
                if (resp && resp.success) {
                    // Update local data
                    if (!appData.recordatorio || !Array.isArray(appData.recordatorio)) {
                        appData.recordatorio = [];
                    }
                    appData.recordatorio = appData.recordatorio.filter(r => r.ID_recordatorio !== recordatorioId);
                    saveData();
                    loadNotifications();
                    updateNotificationCount();
                } else {
                    console.error('Failed to delete recordatorio', resp);
                    alert('Error al eliminar el recordatorio');
                }
            })
            .catch(err => {
                console.error('Error deleting recordatorio', err);
                alert('Error al eliminar el recordatorio');
            });
            return; // Exit early for recordatorio deletion
        } else {
            // Handle regular notification deletion via API
            fetch(`${getApiBaseUrl()}/notifications.php`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ id: id })
            }).then(r => r.json()).then(resp => {
                if (resp && resp.success) {
                    if (!appData.notifications) appData.notifications = [];
                    appData.notifications = appData.notifications.filter(n => n.id !== id);
                    saveData();
                    loadNotifications();
                    updateNotificationCount();
                } else {
                    console.error('Failed to delete notification', resp);
                }
            }).catch(err => console.error('Error deleting notification', err));
        }
    }
}

// Helper functions for recordatorios
function getCurrentUser() {
    // Check if appData is loaded
    if (!appData) {
        return null;
    }
    
    // Check if usuarios_docente array exists
    if (!appData.usuarios_docente || !Array.isArray(appData.usuarios_docente)) {
        return null;
    }
    
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
    
    return docente || null;
}

async function loadRecordatorios() {
    // Fetch recordatorios from API
    try {
        const response = await fetch(`${getApiBaseUrl()}/recordatorio.php`, {
            credentials: 'include'
        });
        const data = await response.json();
        
        if (Array.isArray(data)) {
            // Update appData with fresh recordatorios
            if (!appData) appData = {};
            appData.recordatorio = data;
            saveData();
        }
    } catch (err) {
        console.error('Error loading recordatorios:', err);
        // Fallback to local data if API fails
    }
}

function getRecordatoriosForDocente(docenteId) {
    // Check if appData is loaded
    if (!appData) {
        return [];
    }
    
    // Check if required data exists
    if (!appData.materia) {
        return [];
    }
    
    if (!appData.recordatorio) {
        return [];
    }
    
    // Get subjects taught by this docente
    const docenteSubjects = appData.materia.filter(m => m.Usuarios_docente_ID_docente === docenteId);
    const subjectIds = docenteSubjects.map(s => s.ID_materia);
    
    // Get recordatorios for these subjects (filter by PENDIENTE status)
    const recordatorios = appData.recordatorio.filter(r => 
        subjectIds.includes(r.Materia_ID_materia) && 
        (r.Estado === 'PENDIENTE' || !r.Estado)
    );
    
    // Sort by date (upcoming first)
    recordatorios.sort((a, b) => {
        const dateA = new Date(a.Fecha);
        const dateB = new Date(b.Fecha);
        return dateA - dateB;
    });
    
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
    if (!appData || !appData.materia || !Array.isArray(appData.materia)) {
        return 'Materia no encontrada';
    }
    const subject = appData.materia.find(m => m.ID_materia === subjectId);
    return subject ? subject.Nombre : 'Materia no encontrada';
}

// Debug function to test recordatorios
function debugRecordatorios() {
    // Check current user
    const currentUser = getCurrentUser();
    
    if (!currentUser) {
        return;
    }
    
    // Check subjects for this docente
    const subjects = appData.materia.filter(m => m.Usuarios_docente_ID_docente === currentUser.ID_docente);
    
    // Check recordatorios
    const recordatorios = getRecordatoriosForDocente(currentUser.ID_docente);
    
    return {
        currentUser,
        subjects,
        recordatorios
    };
}

// Function to view recordatorio details
function viewRecordatorio(recordatorioId) {
    // Check if appData is loaded
    if (!appData || !appData.recordatorio || !Array.isArray(appData.recordatorio)) {
        return;
    }
    
    // Find the recordatorio in the data
    const recordatorio = appData.recordatorio.find(r => r.ID_recordatorio == recordatorioId);
    if (!recordatorio) {
        return;
    }
    
    // Get subject name
    const subject = appData.materia && Array.isArray(appData.materia) 
        ? appData.materia.find(m => m.ID_materia == recordatorio.Materia_ID_materia)
        : null;
    const subjectName = subject ? subject.Nombre : 'Unknown Subject';
    
    // Create modal content
    const lang = currentLanguage || 'es';
    const modalContent = `
        <div class="modal-header">
            <h3><i class="fas fa-bell"></i> ${translations[lang].recordatorio_details}</h3>
            <button class="close-modal" onclick="closeModal()">&times;</button>
        </div>
        <div class="modal-body">
            <div class="recordatorio-detail">
                <div class="detail-row">
                    <label>${translations[lang].recordatorio_title_label}</label>
                    <span>${recordatorio.Titulo}</span>
                </div>
                <div class="detail-row">
                    <label>${translations[lang].recordatorio_description_label}</label>
                    <span>${recordatorio.Descripcion}</span>
                </div>
                <div class="detail-row">
                    <label>${translations[lang].recordatorio_subject_label}</label>
                    <span>${subjectName}</span>
                </div>
                <div class="detail-row">
                    <label>${translations[lang].recordatorio_type_label}</label>
                    <span class="type-badge ${recordatorio.Tipo.toLowerCase()}">${getRecordatorioTypeLabel(recordatorio.Tipo)}</span>
                </div>
                <div class="detail-row">
                    <label>${translations[lang].recordatorio_priority_label}</label>
                    <span class="priority-badge ${recordatorio.Prioridad.toLowerCase()}">${recordatorio.Prioridad}</span>
                </div>
                <div class="detail-row">
                    <label>${translations[lang].recordatorio_due_date_label}</label>
                    <span>${recordatorio.Fecha_vencimiento}</span>
                </div>
            </div>
        </div>
        <div class="modal-footer">
            <button class="btn btn-secondary" onclick="closeModal()">${translations[lang].close}</button>
        </div>
    `;
    
    // Show modal
    showModal(modalContent);
}

// Make debug function globally accessible
window.debugRecordatorios = debugRecordatorios;
