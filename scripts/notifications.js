// Global variables and config
const NOTIFICATION_SYNC_INTERVAL = 30000; // 30 seconds
let lastSyncTimestamp = 0;

// Sync notifications from server
async function syncNotifications() {
    try {
        const now = Date.now();
        // Don't sync if less than interval has passed
        if (now - lastSyncTimestamp < NOTIFICATION_SYNC_INTERVAL) {
            return;
        }
        lastSyncTimestamp = now;

        const baseUrl = window.location.pathname.includes('/pages/') ? '../api' : 'api';
        const response = await fetch(`${baseUrl}/notifications.php`);
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
        console.error('Error syncing notifications:', err);
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
    
    // Load recordatorios for docente
    loadRecordatorios();
    
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
    
    // Format notifications properly and filter for system notifications only
    const formattedNotifications = (appData.notifications || [])
        .filter(n => n.Tipo === 'SISTEMA') // Solo mostrar notificaciones del sistema
        .map(n => ({
            id: n.ID_notificacion,
            title: n.Titulo,
            message: n.Mensaje,
            date: new Date(n.Fecha_creacion).toLocaleDateString(),
            read: n.Estado === 'LEIDA',
            type: 'notification',
            notification: n
        }));
    
    // Combine regular notifications with recordatorios
    const now = new Date();
    const upcomingRecordatorios = recordatorios
        .map(r => ({
            raw: r,
            dateObj: r.Fecha ? new Date(r.Fecha) : null
        }))
        .filter(item => item.dateObj && item.dateObj >= now)
        .sort((a, b) => a.dateObj - b.dateObj)
        .slice(0, 2)
        .map(item => ({
            id: `recordatorio_${item.raw.ID_recordatorio}`,
            title: getRecordatorioTitle(item.raw),
            message: item.raw.Descripcion,
            date: formatRecordatorioDate(item.raw.Fecha),
            read: item.raw.Estado === 'COMPLETADO',
            type: 'recordatorio',
            recordatorio: item.raw,
            dateObj: item.dateObj
        }));

    const upcomingNotifications = formattedNotifications
        .map(n => ({
            ...n,
            dateObj: n.notification && n.notification.Fecha_creacion ? new Date(n.notification.Fecha_creacion) : new Date()
        }))
        .filter(item => item.dateObj && item.dateObj >= now)
        .sort((a, b) => b.dateObj - a.dateObj);

    const combinedNotifications = [
        ...upcomingNotifications,
        ...upcomingRecordatorios
    ].sort((a, b) => {
        // Sort by read status first (unread first), then by date
        if (a.read !== b.read) {
            return a.read ? 1 : -1; // Unread notifications come first
        }
        return a.dateObj - b.dateObj;
    })
     .slice(0, 2)
     .map(({ dateObj, ...rest }) => rest);

    const allNotifications = combinedNotifications;

    // Grid view - Modern design
    if (allNotifications.length === 0) {
        notificationsContainer.innerHTML = `
            <div class="notifications-empty">
                <i class="fas fa-bell-slash"></i>
                <h3>No hay notificaciones del sistema</h3>
                <p>No hay actualizaciones o mensajes del sistema en este momento.</p>
            </div>
        `;
    } else {
        notificationsContainer.innerHTML = allNotifications.map(notification => {
            // Only apply priority class if notification is unread
            const priorityClass = !notification.read && notification.type === 'recordatorio' && notification.recordatorio 
                ? `priority-${notification.recordatorio.Prioridad.toLowerCase()}` 
                : '';
            return `
            <div class="notification-card ${notification.read ? 'read' : 'unread'} ${notification.type} ${priorityClass}" data-notification-id="${notification.id}">
                <h3 class="notification-title">
                    ${notification.type === 'recordatorio' ? '<i class="fas fa-bell"></i>' : '<i class="fas fa-info-circle"></i>'}
                    ${notification.title}
                </h3>
                <div class="notification-meta">
                    <span class="notification-date">${notification.date}</span>
                    ${!notification.read && notification.type === 'recordatorio' && notification.recordatorio ? 
                        `<span class="priority-badge ${notification.recordatorio.Prioridad.toLowerCase()}">${notification.recordatorio.Prioridad}</span>` : ''}
                </div>
                <p class="notification-message">${notification.message}</p>
                ${notification.type === 'recordatorio' && notification.recordatorio ? `
                    <span class="recordatorio-type">${getCursoDivision(notification.recordatorio.Materia_ID_materia)}</span>
                    <span class="recordatorio-subject">${getSubjectName(notification.recordatorio.Materia_ID_materia)}</span>
                ` : ''}
                <div class="notification-actions">
                    ${!notification.read ? `<button class="btn btn-sm btn-success" onclick="markNotificationRead('${notification.id}')" title="Marcar como leído">
                        <i class="fas fa-check"></i> Marcar como leído
                    </button>` : ''}
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteNotification('${notification.id}')" title="Eliminar">
                        <i class="fas fa-trash"></i> Eliminar
                    </button>
                </div>
            </div>
        `;
        }).join('');
    }

    // List view - Modern table format
    if (allNotifications.length === 0) {
        notificationsList.innerHTML = `
            <div class="notifications-empty">
                <i class="fas fa-bell-slash"></i>
                <h3>No hay notificaciones</h3>
                <p>¡Estás al día! No hay notificaciones nuevas.</p>
            </div>
        `;
    } else {
        notificationsList.innerHTML = `
            <table>
                <thead>
                    <tr>
                        <th>Curso</th>
                        <th>Título</th>
                        <th>Mensaje</th>
                        <th>Fecha</th>
                        <th>Prioridad</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    ${allNotifications.map(notification => {
                        const shortMessage = notification.message.length > 30 ? notification.message.substring(0, 30) + '...' : notification.message;
                        // Only apply priority class if notification is unread
                        const priorityClass = !notification.read && notification.type === 'recordatorio' && notification.recordatorio 
                            ? `priority-${notification.recordatorio.Prioridad.toLowerCase()}` 
                            : '';
                        return `
                            <tr class="${notification.read ? 'read' : 'unread'} ${notification.type} ${priorityClass}" data-notification-id="${notification.id}">
                                <td>
                                    ${notification.type === 'recordatorio' && notification.recordatorio ? 
                                        `<span class="recordatorio-type">${getCursoDivision(notification.recordatorio.Materia_ID_materia)}</span>` : 
                                        `<span class="type-badge notification"><i class="fas fa-info-circle"></i> Notificación</span>`
                                    }
                                </td>
                                <td><strong>${notification.title}</strong></td>
                                <td title="${notification.message}">${shortMessage}</td>
                                <td>${notification.date}</td>
                                <td>
                                    ${!notification.read && notification.type === 'recordatorio' && notification.recordatorio ? 
                                        `<span class="priority-badge ${notification.recordatorio.Prioridad.toLowerCase()}">${notification.recordatorio.Prioridad}</span>` : 
                                        `<span class="table-status ${notification.read ? 'read' : 'unread'}">${notification.read ? 'Leído' : 'No leído'}</span>`
                                    }
                                </td>
                                <td>
                                    <div class="table-actions">
                                        ${!notification.read ? `<button class="btn btn-sm btn-success" onclick="markNotificationRead('${notification.id}')" title="Marcar como leído">
                                            <i class="fas fa-check"></i>
                                        </button>` : ''}
                                        <button class="btn btn-sm btn-outline-danger" onclick="deleteNotification('${notification.id}')" title="Eliminar">
                                            <i class="fas fa-trash"></i>
                                        </button>
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
    // BADGE DESHABILITADO: Siempre ocultar el badge de notificaciones
    // Update notification count in header
    const notificationCountElement = document.getElementById('notificationCount');
    if (notificationCountElement) {
        notificationCountElement.textContent = '';
        notificationCountElement.style.display = 'none';
    }
    
    // Update mobile notification badge
    const mobileBadge = document.getElementById('mobileNotificationCount');
    if (mobileBadge) {
        mobileBadge.textContent = '';
        mobileBadge.style.display = 'none';
    }
    
    // Update desktop notification badge
    const desktopBadge = document.getElementById('desktopNotificationCount');
    if (desktopBadge) {
        desktopBadge.textContent = '';
        desktopBadge.style.display = 'none';
    }
}

function markNotificationRead(id) {
    if (!appData) {
        return;
    }
    
    // Find the card/row element
    const cardElement = document.querySelector(`[data-notification-id="${id}"]`);
    
    if (!cardElement) {
        console.error('Card element not found for notification:', id);
        return;
    }
    
    if (id.startsWith('recordatorio_')) {
        // Handle recordatorio - mark as completed via API
        const recordatorioId = parseInt(id.replace('recordatorio_', ''));
        const baseUrl = window.location.pathname.includes('/pages/') ? '../api' : 'api';
        
        // Call API to update recordatorio status
        fetch(`${baseUrl}/recordatorio.php?id=${recordatorioId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ Estado: 'COMPLETADO' })
        })
        .then(r => r.json())
        .then(resp => {
            if (resp && resp.success) {
                // Update local data
                const recordatorio = appData.recordatorio.find(r => r.ID_recordatorio === recordatorioId);
                if (recordatorio) {
                    recordatorio.Estado = 'COMPLETADO';
                }
                saveData();
                updateNotificationCount();
                
                // Animate and move card to end in real-time
                moveCardToEnd(cardElement, id);
                
                if (window.toast) {
                    window.toast.success('Recordatorio marcado como completado');
                }
            } else {
                console.error('Failed to mark recordatorio as completed:', resp);
                alert('No se pudo marcar el recordatorio como completado. Por favor, intente nuevamente.');
            }
        })
        .catch(err => {
            console.error('Error marking recordatorio as completed:', err);
            alert('Error al marcar el recordatorio como completado. Por favor, intente nuevamente.');
        });
    } else {
        // Handle regular notification
        const idNotificacion = parseInt(id) || id;
        const baseUrl = window.location.pathname.includes('/pages/') ? '../api' : 'api';
        
        // call API to mark as read
        fetch(`${baseUrl}/notifications.php`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: idNotificacion, action: 'mark_read' })
        })
        .then(r => r.json())
        .then(resp => {
            if (resp && resp.success) {
                const notification = appData.notifications.find(n => n.ID_notificacion === idNotificacion);
                if (notification) {
                    notification.Estado = 'LEIDA';
                    notification.Fecha_leida = new Date().toISOString();
                }
                saveData();
                updateNotificationCount();
                
                // Animate and move card to end in real-time
                moveCardToEnd(cardElement, id);
                
                if (window.toast) {
                    window.toast.success('Notificación marcada como leída');
                }
            } else {
                console.error('Failed to mark notification read:', resp);
                alert('No se pudo marcar la notificación como leída. Por favor, intente nuevamente.');
            }
        })
        .catch(err => {
            console.error('Error marking notification read:', err);
            alert('Error al marcar la notificación como leída. Por favor, intente nuevamente.');
        });
    }
}

function moveCardToEnd(cardElement, id) {
    // Apply read styles immediately
    cardElement.classList.remove('unread', 'priority-alta', 'priority-media', 'priority-baja');
    cardElement.classList.add('read');
    
    // Remove priority badge if exists
    const priorityBadge = cardElement.querySelector('.priority-badge');
    if (priorityBadge) {
        priorityBadge.style.display = 'none';
    }
    
    // Remove "Mark as read" button
    const markReadBtn = cardElement.querySelector('.btn-success');
    if (markReadBtn) {
        markReadBtn.style.display = 'none';
    }
    
    // Get parent container
    const parent = cardElement.parentElement;
    
    // Animate fade and shrink
    cardElement.style.transition = 'all 0.4s ease';
    cardElement.style.opacity = '0';
    cardElement.style.transform = 'scale(0.9)';
    
    setTimeout(() => {
        // Remove from current position
        cardElement.remove();
        
        // Re-append to end
        parent.appendChild(cardElement);
        
        // Reset transform and fade back in with new gray style
        cardElement.style.transform = 'scale(1)';
        cardElement.style.opacity = '1';
    }, 400);
}

function markAllNotificationsRead() {
    if (!appData || !appData.notifications) {
        return;
    }
    
    const baseUrl = window.location.pathname.includes('/pages/') ? '../api' : 'api';
    
    // mark each notification via API and update local state
    const promises = appData.notifications
        .filter(n => n.Estado !== 'LEIDA')
        .map(n => {
            return fetch(`${baseUrl}/notifications.php`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: n.ID_notificacion, action: 'mark_read' })
            })
            .then(r => r.json())
            .catch(() => null);
        });

    Promise.all(promises).then(() => {
        // Update all notifications to read state
        appData.notifications.forEach(n => {
            n.Estado = 'LEIDA';
            n.Fecha_leida = new Date().toISOString();
        });
        saveData();
        loadNotifications();
        updateNotificationCount();
    });
}

function deleteNotification(id) {
    if (!appData) {
        return;
    }
    
    if (confirm('¿Está seguro de que desea eliminar esta notificación?')) {
        // Find the card/row element
        const cardElement = document.querySelector(`[data-notification-id="${id}"]`);
        
        if (!cardElement) {
            console.error('Card element not found for notification:', id);
            return;
        }
        
        // Animate card removal FIRST (instant visual feedback)
        cardElement.style.transition = 'all 0.3s ease';
        cardElement.style.opacity = '0';
        cardElement.style.transform = 'translateX(100%)';
        cardElement.style.height = cardElement.offsetHeight + 'px';
        
        // After fade animation, collapse the height
        setTimeout(() => {
            cardElement.style.height = '0';
            cardElement.style.margin = '0';
            cardElement.style.padding = '0';
            cardElement.style.overflow = 'hidden';
        }, 300);
        
        // Remove from DOM after animations complete
        setTimeout(() => {
            cardElement.remove();
        }, 600);
        
        // Then perform API call in background
        performDelete(id);
    }
}

function performDelete(id) {
    if (id.startsWith('recordatorio_')) {
        // Handle recordatorio deletion via API
        const recordatorioId = parseInt(id.replace('recordatorio_', ''));
        const baseUrl = window.location.pathname.includes('/pages/') ? '../api' : 'api';
        
        // Call API to delete recordatorio
        fetch(`${baseUrl}/recordatorio.php?id=${recordatorioId}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' }
        })
        .then(r => r.json())
        .then(resp => {
            if (resp && resp.success) {
                // Update local data
                appData.recordatorio = appData.recordatorio.filter(r => r.ID_recordatorio !== recordatorioId);
                saveData();
                updateNotificationCount();
                
                if (window.toast) {
                    window.toast.success('Recordatorio eliminado correctamente');
                }
            } else {
                console.error('Failed to delete recordatorio:', resp);
                // Since card is already removed, show toast and reload to restore if needed
                if (window.toast) {
                    window.toast.error('Error al eliminar el recordatorio');
                }
                setTimeout(() => loadNotifications(), 1000);
            }
        })
        .catch(err => {
            console.error('Error deleting recordatorio:', err);
            if (window.toast) {
                window.toast.error('Error al eliminar el recordatorio');
            }
            setTimeout(() => loadNotifications(), 1000);
        });
    } else {
        // Handle regular notification deletion via API
        const idNotificacion = parseInt(id) || id;
        const baseUrl = window.location.pathname.includes('/pages/') ? '../api' : 'api';
        
        fetch(`${baseUrl}/notifications.php`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: idNotificacion })
        })
        .then(r => r.json())
        .then(resp => {
            if (resp && resp.success) {
                appData.notifications = appData.notifications.filter(n => n.ID_notificacion !== idNotificacion);
                saveData();
                updateNotificationCount();
                
                if (window.toast) {
                    window.toast.success('Notificación eliminada correctamente');
                }
            } else {
                console.error('Failed to delete notification:', resp);
                // Since card is already removed, show toast and reload to restore if needed
                if (window.toast) {
                    window.toast.error('Error al eliminar la notificación');
                }
                setTimeout(() => loadNotifications(), 1000);
            }
        })
        .catch(err => {
            console.error('Error deleting notification:', err);
            if (window.toast) {
                window.toast.error('Error al eliminar la notificación');
            }
            setTimeout(() => loadNotifications(), 1000);
        });
    }
}

// Helper functions for recordatorios
function getCurrentUser() {
    // Get current user from localStorage and match with docente data
    const username = localStorage.getItem('username');
    if (!username) return null;
    
    // Ensure appData is loaded (check both local and global)
    const data = appData || window.appData;
    if (!data || !data.usuarios_docente || !Array.isArray(data.usuarios_docente)) {
        return null;
    }
    
    // Try to find docente by email first
    let docente = data.usuarios_docente.find(d => d.Email_docente === username);
    
    // If not found by email, try to find by name or ID
    if (!docente) {
        // Try to find by name (for cases where username might be "Luis" or "Ana")
        docente = data.usuarios_docente.find(d => 
            d.Nombre_docente.toLowerCase() === username.toLowerCase() ||
            d.Apellido_docente.toLowerCase() === username.toLowerCase() ||
            `${d.Nombre_docente} ${d.Apellido_docente}`.toLowerCase() === username.toLowerCase()
        );
    }
    
    // If still not found, try to find by ID (for cases where username might be "2")
    if (!docente && !isNaN(username)) {
        docente = data.usuarios_docente.find(d => d.ID_docente === parseInt(username));
    }
    
    return docente || null;
}

function loadRecordatorios() {
    // This function is called during initialization
    // The actual loading is done in loadNotifications()
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
    
    // Get recordatorios for these subjects
    const recordatorios = appData.recordatorio.filter(r => subjectIds.includes(r.Materia_ID_materia));
    
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

function getCursoDivision(subjectId) {
    const subject = appData.materia.find(m => m.ID_materia === subjectId);
    if (!subject || !subject.Curso_division) {
        return 'N/A';
    }
    
    // Parse Curso_division format like "1º Curso - División A" to "1 A"
    const cursoDivision = subject.Curso_division;
    const courseMatch = cursoDivision.match(/(\d+)/);
    const divisionMatch = cursoDivision.match(/(?:División|Div)[\s-]*([A-F])/i) || 
                          cursoDivision.match(/[\s-]([A-F])[\s-]*$/i) ||
                          cursoDivision.match(/([A-F])[\s-]*$/i);
    
    const course = courseMatch ? courseMatch[1] : '';
    const division = divisionMatch ? divisionMatch[1].toUpperCase() : '';
    
    return course && division ? `${course} ${division}` : cursoDivision;
}

// Function to view recordatorio details
function viewRecordatorio(recordatorioId) {
    // Find the recordatorio in the data
    const recordatorio = appData.recordatorio.find(r => r.ID_recordatorio == recordatorioId);
    if (!recordatorio) {
        return;
    }
    
    // Get subject name
    const subject = appData.materia.find(m => m.ID_materia == recordatorio.Materia_ID_materia);
    const subjectName = subject ? subject.Nombre : 'Materia desconocida';
    
    // Create modal content
    const modalContent = `
        <div class="modal-header">
            <h3><i class="fas fa-bell"></i> Detalles del Recordatorio</h3>
            <button class="close-modal" onclick="closeModal()">&times;</button>
        </div>
        <div class="modal-body">
            <div class="recordatorio-detail">
                <div class="detail-row">
                    <label>Título:</label>
                    <span>${recordatorio.Titulo || getRecordatorioTitle(recordatorio)}</span>
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
                    <span>${formatRecordatorioDate(recordatorio.Fecha)}</span>
                </div>
            </div>
        </div>
        <div class="modal-footer">
            <button class="btn btn-secondary" onclick="closeModal()">Cerrar</button>
        </div>
    `;
    
    // Show modal
    showModal(modalContent);
}

// Make debug function globally accessible
window.debugRecordatorios = debugRecordatorios;