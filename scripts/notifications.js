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
    
    // Update mobile notification badge
    const mobileBadge = document.getElementById('notificationCount');
    if (mobileBadge) {
        mobileBadge.textContent = count;
        mobileBadge.style.display = count > 0 ? 'inline' : 'none';
    }
    
    // Update desktop notification badge
    const desktopBadge = document.getElementById('desktopNotificationCount');
    if (desktopBadge) {
        desktopBadge.textContent = count;
        desktopBadge.style.display = count > 0 ? 'inline' : 'none';
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
