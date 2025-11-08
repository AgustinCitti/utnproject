// Admin Dashboard - User Management
let allUsers = [];
let currentEditId = null;

// Check authentication on page load
document.addEventListener('DOMContentLoaded', async function() {
    // First, try to sync session if coming from OAuth
    await syncSession();
    
    checkAdminAuth();
    loadUsers();
    loadStats();
    setupEventListeners();
    
    // Set admin name
    const adminName = localStorage.getItem('username') || 'Admin';
    document.getElementById('adminUserName').textContent = adminName;
});

// Sync PHP session to localStorage (for OAuth users)
async function syncSession() {
    try {
        const response = await fetch('../api/session_sync.php');
        const result = await response.json();
        
        if (result.success && result.isLoggedIn && result.user) {
            // Sync session data to localStorage
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('username', result.user.name);
            localStorage.setItem('userEmail', result.user.email);
            localStorage.setItem('userRole', result.user.role);
            localStorage.setItem('userId', result.user.id);
        }
    } catch (error) {
        // If session sync fails, continue with existing localStorage check
        console.log('Session sync failed, using localStorage:', error);
    }
}

// Check if user is logged in and is ADMIN
function checkAdminAuth() {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const userRole = (localStorage.getItem('userRole') || '').toUpperCase().trim();
    
    console.log('Admin dashboard auth check - isLoggedIn:', isLoggedIn, 'userRole:', userRole);
    
    if (!isLoggedIn || userRole !== 'ADMIN') {
        // Redirect to login
        alert('Acceso denegado. Solo administradores pueden acceder a esta página.');
        window.location.href = 'login.html';
        return;
    }
}

// Setup event listeners
function setupEventListeners() {
    const userForm = document.getElementById('userForm');
    if (userForm) {
        userForm.addEventListener('submit', handleUserFormSubmit);
    }
    
    // Close modal on outside click (overlay click)
    const modal = document.getElementById('userModal');
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeUserModal();
            }
        });
    }
    
    // Toggle password required indicator
    const userIdInput = document.getElementById('userId');
    const passwordInput = document.getElementById('password');
    const passwordRequired = document.getElementById('passwordRequired');
    
    if (userIdInput && passwordInput && passwordRequired) {
        userIdInput.addEventListener('change', function() {
            if (this.value) {
                passwordRequired.style.display = 'none';
                passwordInput.removeAttribute('required');
            } else {
                passwordRequired.style.display = 'inline';
                passwordInput.setAttribute('required', 'required');
            }
        });
    }
}

// Load all users
async function loadUsers() {
    const loadingEl = document.getElementById('usersTableLoading');
    const tableEl = document.getElementById('usersTable');
    const tbodyEl = document.getElementById('usersTableBody');
    
    try {
        loadingEl.style.display = 'block';
        tableEl.style.display = 'none';
        
        const response = await fetch('../api/usuarios_docente.php');
        const result = await response.json();
        
        if (response.ok && Array.isArray(result)) {
            allUsers = result;
            renderUsers(allUsers);
            loadingEl.style.display = 'none';
            tableEl.style.display = 'table';
        } else {
            showMessage('Error al cargar usuarios: ' + (result.message || 'Error desconocido'), 'error');
            loadingEl.style.display = 'none';
        }
    } catch (error) {
        showMessage('Error de conexión: ' + error.message, 'error');
        loadingEl.style.display = 'none';
    }
}

// Render users table
function renderUsers(users) {
    const tbodyEl = document.getElementById('usersTableBody');
    tbodyEl.innerHTML = '';
    
    if (users.length === 0) {
        tbodyEl.innerHTML = '<tr><td colspan="12" style="text-align: center; padding: 2rem;">No se encontraron usuarios</td></tr>';
        return;
    }
    
    users.forEach(user => {
        const row = document.createElement('tr');
        
        const statusClass = user.Estado === 'ACTIVO' ? 'status-activo' : 'status-inactivo';
        const lastAccess = user.Ultimo_acceso ? new Date(user.Ultimo_acceso).toLocaleDateString() : 'Nunca';
        
        row.innerHTML = `
            <td>${user.ID_docente}</td>
            <td>${user.Nombre_docente || '-'}</td>
            <td>${user.Apellido_docente || '-'}</td>
            <td>${user.Email_docente || '-'}</td>
            <td>${user.DNI || '-'}</td>
            <td>${user.Telefono || '-'}</td>
            <td>${user.Especialidad || '-'}</td>
            <td>${user.Titulo_academico || '-'}</td>
            <td><span class="role-badge">${user.Tipo_usuario || '-'}</span></td>
            <td><span class="status-badge ${statusClass}">${user.Estado || '-'}</span></td>
            <td>${lastAccess}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn-icon btn-edit" onclick="editUser(${user.ID_docente})" title="Editar">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon btn-copy" onclick="copyUserData(${user.ID_docente})" title="Copiar">
                        <i class="fas fa-copy"></i>
                    </button>
                    <button class="btn-icon btn-delete" onclick="deleteUser(${user.ID_docente})" title="Borrar">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        
        tbodyEl.appendChild(row);
    });
}

// Filter users
function filterUsers() {
    const searchInput = document.getElementById('searchInput');
    const searchTerm = searchInput.value.toLowerCase().trim();
    
    if (!searchTerm) {
        renderUsers(allUsers);
        return;
    }
    
    const filtered = allUsers.filter(user => {
        const name = (user.Nombre_docente || '').toLowerCase();
        const lastName = (user.Apellido_docente || '').toLowerCase();
        const email = (user.Email_docente || '').toLowerCase();
        const dni = (user.DNI || '').toLowerCase();
        
        return name.includes(searchTerm) || 
               lastName.includes(searchTerm) || 
               email.includes(searchTerm) || 
               dni.includes(searchTerm);
    });
    
    renderUsers(filtered);
}

// Refresh users
function refreshUsers() {
    loadUsers();
    loadStats();
    showMessage('Datos actualizados', 'success');
}

// Open add user modal
function openAddUserModal() {
    currentEditId = null;
    document.getElementById('modalTitle').textContent = 'Add New User';
    document.getElementById('userForm').reset();
    document.getElementById('userId').value = '';
    document.getElementById('passwordRequired').style.display = 'inline';
    document.getElementById('password').setAttribute('required', 'required');
    document.getElementById('userModal').classList.add('active');
}

// Close user modal
function closeUserModal() {
    document.getElementById('userModal').classList.remove('active');
    currentEditId = null;
    document.getElementById('userForm').reset();
}

// Edit user
async function editUser(userId) {
    try {
        const response = await fetch(`../api/usuarios_docente.php?id=${userId}`);
        const user = await response.json();
        
        if (response.ok) {
            currentEditId = userId;
            document.getElementById('modalTitle').textContent = 'Edit User';
            document.getElementById('userId').value = user.ID_docente;
            document.getElementById('nombre').value = user.Nombre_docente || '';
            document.getElementById('apellido').value = user.Apellido_docente || '';
            document.getElementById('email').value = user.Email_docente || '';
            document.getElementById('dni').value = user.DNI || '';
            document.getElementById('telefono').value = user.Telefono || '';
            document.getElementById('direccion').value = user.Direccion || '';
            document.getElementById('fecha_nacimiento').value = user.Fecha_nacimiento || '';
            document.getElementById('especialidad').value = user.Especialidad || '';
            document.getElementById('titulo_academico').value = user.Titulo_academico || '';
            document.getElementById('tipo_usuario').value = user.Tipo_usuario || 'PROFESOR';
            document.getElementById('estado').value = user.Estado || 'ACTIVO';
            document.getElementById('plan_usuario').value = user.Plan_usuario || '';
            document.getElementById('configuracion').value = user.Configuracion || '';
            
            // Password not required when editing
            document.getElementById('passwordRequired').style.display = 'none';
            document.getElementById('password').removeAttribute('required');
            document.getElementById('password').value = '';
            
            document.getElementById('userModal').classList.add('active');
        } else {
            showMessage('Error al cargar usuario: ' + (user.message || 'Error desconocido'), 'error');
        }
    } catch (error) {
        showMessage('Error de conexión: ' + error.message, 'error');
    }
}

// Copy user data
function copyUserData(userId) {
    const user = allUsers.find(u => u.ID_docente === userId);
    if (!user) return;
    
    const userData = {
        ID_docente: user.ID_docente,
        Nombre_docente: user.Nombre_docente,
        Apellido_docente: user.Apellido_docente,
        Email_docente: user.Email_docente,
        DNI: user.DNI,
        Telefono: user.Telefono,
        Direccion: user.Direccion,
        Fecha_nacimiento: user.Fecha_nacimiento,
        Especialidad: user.Especialidad,
        Titulo_academico: user.Titulo_academico,
        Tipo_usuario: user.Tipo_usuario,
        Estado: user.Estado,
        Plan_usuario: user.Plan_usuario,
        Configuracion: user.Configuracion
    };
    
    const text = JSON.stringify(userData, null, 2);
    navigator.clipboard.writeText(text).then(() => {
        showMessage('Datos del usuario copiados al portapapeles', 'success');
    }).catch(() => {
        showMessage('Error al copiar datos', 'error');
    });
}

// Delete user
async function deleteUser(userId) {
    const user = allUsers.find(u => u.ID_docente === userId);
    if (!user) return;
    
    if (!confirm(`¿Está seguro de eliminar al usuario ${user.Nombre_docente} ${user.Apellido_docente} (${user.Email_docente})?`)) {
        return;
    }
    
    try {
        const response = await fetch(`../api/usuarios_docente.php?id=${userId}`, {
            method: 'DELETE'
        });
        
        const result = await response.json();
        
        if (response.ok && result.success) {
            showMessage('Usuario eliminado exitosamente', 'success');
            loadUsers();
        } else {
            showMessage('Error al eliminar usuario: ' + (result.message || 'Error desconocido'), 'error');
        }
    } catch (error) {
        showMessage('Error de conexión: ' + error.message, 'error');
    }
}

// Handle form submit
async function handleUserFormSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const userId = formData.get('userId');
    const isEdit = userId && userId !== '';
    
    // Build request body
    const body = {
        Nombre_docente: formData.get('nombre'),
        Apellido_docente: formData.get('apellido'),
        Email_docente: formData.get('email'),
        DNI: formData.get('dni') || null,
        Telefono: formData.get('telefono') || null,
        Direccion: formData.get('direccion') || null,
        Fecha_nacimiento: formData.get('fecha_nacimiento') || null,
        Especialidad: formData.get('especialidad') || null,
        Titulo_academico: formData.get('titulo_academico') || null,
        Tipo_usuario: formData.get('tipo_usuario'),
        Estado: formData.get('estado'),
        Plan_usuario: formData.get('plan_usuario') || null,
        Configuracion: formData.get('configuracion') || null
    };
    
    // Add password only if provided
    const password = formData.get('password');
    if (password && password !== '') {
        body.password = password;
    } else if (!isEdit) {
        showMessage('La contraseña es requerida para nuevos usuarios', 'error');
        return;
    }
    
    try {
        const url = isEdit 
            ? `../api/usuarios_docente.php?id=${userId}`
            : '../api/usuarios_docente.php';
        
        const response = await fetch(url, {
            method: isEdit ? 'PUT' : 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });
        
        const result = await response.json();
        
        if (response.ok && result.success) {
            showMessage(result.message || (isEdit ? 'Usuario actualizado exitosamente' : 'Usuario creado exitosamente'), 'success');
            closeUserModal();
            loadUsers();
        } else {
            showMessage('Error: ' + (result.message || 'Error desconocido'), 'error');
        }
    } catch (error) {
        showMessage('Error de conexión: ' + error.message, 'error');
    }
}

// Show message
function showMessage(message, type) {
    const container = document.getElementById('messageContainer');
    const messageEl = document.createElement('div');
    messageEl.className = type === 'error' ? 'error-message' : 'success-message';
    messageEl.textContent = message;
    
    container.innerHTML = '';
    container.appendChild(messageEl);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (messageEl.parentNode) {
            messageEl.remove();
        }
    }, 5000);
}

// Chart instances storage
let adminCharts = {};

// Switch between main tabs (Users/Stats)
function switchMainTab(tabName, buttonElement) {
    // Update tab buttons
    document.querySelectorAll('.main-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    if (buttonElement) {
        buttonElement.classList.add('active');
    } else {
        // Fallback: find by data attribute
        const tab = document.querySelector(`.main-tab[data-tab="${tabName}"]`);
        if (tab) tab.classList.add('active');
    }
    
    // Update tab content
    document.querySelectorAll('.main-tab-content').forEach(content => {
        content.classList.remove('active');
    });
    const targetTab = document.getElementById(tabName + 'Tab');
    if (targetTab) {
        targetTab.classList.add('active');
    }
    
    // If switching to stats tab, load stats if not already loaded
    if (tabName === 'stats') {
        const containerEl = document.getElementById('statsContainer');
        if (containerEl && containerEl.style.display === 'none') {
            loadStats();
        }
    }
}

// Load and display statistics
async function loadStats() {
    const loadingEl = document.getElementById('statsLoading');
    const containerEl = document.getElementById('statsContainer');
    
    try {
        loadingEl.style.display = 'block';
        containerEl.style.display = 'none';
        
        const response = await fetch('../api/admin_stats.php');
        const result = await response.json();
        
        if (response.ok && result.success && result.stats) {
            // Destroy existing charts
            destroyAllCharts();
            
            // Create all charts
            createAllCharts(result.stats);
            
            loadingEl.style.display = 'none';
            containerEl.style.display = 'block';
        } else {
            showMessage('Error al cargar estadísticas: ' + (result.message || 'Error desconocido'), 'error');
            loadingEl.style.display = 'none';
        }
    } catch (error) {
        console.error('Error loading stats:', error);
        loadingEl.style.display = 'none';
        // Don't show error message for stats, just log it
    }
}

// Destroy all charts
function destroyAllCharts() {
    Object.keys(adminCharts).forEach(chartId => {
        if (adminCharts[chartId]) {
            adminCharts[chartId].destroy();
            delete adminCharts[chartId];
        }
    });
}

// Create all charts
function createAllCharts(stats) {
    createUsersStudentsChart(stats);
    createUsersByTypeChart(stats);
    createSubjectsChart(stats);
    createEnrollmentsChart(stats);
    createGradesPerformanceChart(stats);
    createEvaluationsChart(stats);
    createAttendanceChart(stats);
    createContentChart(stats);
    createStudentTopicsChart(stats);
    createNotificationsChart(stats);
}

// Chart creation functions
function createUsersStudentsChart(stats) {
    const ctx = document.getElementById('usersStudentsChart');
    if (!ctx) return;
    
    if (adminCharts.usersStudents) {
        adminCharts.usersStudents.destroy();
    }
    
    adminCharts.usersStudents = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Usuarios', 'Estudiantes'],
            datasets: [
                {
                    label: 'Activos',
                    data: [stats.active_users || 0, stats.active_students || 0],
                    backgroundColor: '#4bc0c0',
                    borderColor: '#4bc0c0',
                    borderWidth: 1
                },
                {
                    label: 'Inactivos',
                    data: [stats.inactive_users || 0, stats.inactive_students || 0],
                    backgroundColor: '#ff6384',
                    borderColor: '#ff6384',
                    borderWidth: 1
                },
                {
                    label: 'Total',
                    data: [stats.total_users || 0, stats.total_students || 0],
                    backgroundColor: '#667eea',
                    borderColor: '#667eea',
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                },
                title: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            }
        }
    });
}

function createUsersByTypeChart(stats) {
    const ctx = document.getElementById('usersByTypeChart');
    if (!ctx) return;
    
    if (adminCharts.usersByType) {
        adminCharts.usersByType.destroy();
    }
    
    const usersByType = stats.users_by_type || {};
    const labels = Object.keys(usersByType);
    const data = Object.values(usersByType);
    
    adminCharts.usersByType = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels.length > 0 ? labels : ['Sin datos'],
            datasets: [{
                data: data.length > 0 ? data : [0],
                backgroundColor: [
                    '#667eea',
                    '#4bc0c0',
                    '#ffce56',
                    '#ff6384',
                    '#36a2eb',
                    '#9966ff'
                ],
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'bottom'
                }
            }
        }
    });
}

function createSubjectsChart(stats) {
    const ctx = document.getElementById('subjectsChart');
    if (!ctx) return;
    
    if (adminCharts.subjects) {
        adminCharts.subjects.destroy();
    }
    
    adminCharts.subjects = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['Activas', 'Inactivas'],
            datasets: [{
                data: [stats.active_subjects || 0, stats.inactive_subjects || 0],
                backgroundColor: ['#4bc0c0', '#ff6384'],
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'bottom'
                }
            }
        }
    });
}

function createEnrollmentsChart(stats) {
    const ctx = document.getElementById('enrollmentsChart');
    if (!ctx) return;
    
    if (adminCharts.enrollments) {
        adminCharts.enrollments.destroy();
    }
    
    adminCharts.enrollments = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Inscripciones Totales'],
            datasets: [{
                label: 'Total de Inscripciones',
                data: [stats.total_enrollments || 0],
                borderColor: '#667eea',
                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

function createGradesPerformanceChart(stats) {
    const ctx = document.getElementById('gradesPerformanceChart');
    if (!ctx) return;
    
    if (adminCharts.gradesPerformance) {
        adminCharts.gradesPerformance.destroy();
    }
    
    const passed = stats.passed_grades || 0;
    const failed = stats.failed_grades || 0;
    const total = passed + failed;
    const passRate = total > 0 ? ((passed / total) * 100).toFixed(1) : 0;
    
    adminCharts.gradesPerformance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Aprobadas', 'Desaprobadas', 'Promedio General'],
            datasets: [{
                label: 'Cantidad',
                data: [passed, failed, stats.average_grade || 0],
                backgroundColor: ['#4bc0c0', '#ff6384', '#ffce56'],
                borderColor: ['#4bc0c0', '#ff6384', '#ffce56'],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            if (context.label === 'Promedio General') {
                                return 'Promedio: ' + context.parsed.y.toFixed(2);
                            }
                            return context.label + ': ' + context.parsed.y;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

function createEvaluationsChart(stats) {
    const ctx = document.getElementById('evaluationsChart');
    if (!ctx) return;
    
    if (adminCharts.evaluations) {
        adminCharts.evaluations.destroy();
    }
    
    adminCharts.evaluations = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Completadas', 'Programadas'],
            datasets: [{
                data: [stats.completed_evaluations || 0, stats.scheduled_evaluations || 0],
                backgroundColor: ['#4bc0c0', '#ffce56'],
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'bottom'
                }
            }
        }
    });
}

function createAttendanceChart(stats) {
    const ctx = document.getElementById('attendanceChart');
    if (!ctx) return;
    
    if (adminCharts.attendance) {
        adminCharts.attendance.destroy();
    }
    
    adminCharts.attendance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Presentes', 'Ausentes', 'Hoy'],
            datasets: [{
                label: 'Registros',
                data: [
                    stats.present_records || 0,
                    stats.absent_records || 0,
                    stats.attendance_today || 0
                ],
                backgroundColor: ['#4bc0c0', '#ff6384', '#ffce56'],
                borderColor: ['#4bc0c0', '#ff6384', '#ffce56'],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            }
        }
    });
}

function createContentChart(stats) {
    const ctx = document.getElementById('contentChart');
    if (!ctx) return;
    
    if (adminCharts.content) {
        adminCharts.content.destroy();
    }
    
    adminCharts.content = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['Completados', 'Pendientes'],
            datasets: [{
                data: [stats.completed_content || 0, stats.pending_content || 0],
                backgroundColor: ['#4bc0c0', '#ffce56'],
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'bottom'
                }
            }
        }
    });
}

function createStudentTopicsChart(stats) {
    const ctx = document.getElementById('studentTopicsChart');
    if (!ctx) return;
    
    if (adminCharts.studentTopics) {
        adminCharts.studentTopics.destroy();
    }
    
    adminCharts.studentTopics = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Aprobados', 'Desaprobados', 'Pendientes'],
            datasets: [{
                data: [
                    stats.approved_topics || 0,
                    stats.failed_topics || 0,
                    stats.pending_topics || 0
                ],
                backgroundColor: ['#4bc0c0', '#ff6384', '#ffce56'],
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'bottom'
                }
            }
        }
    });
}

function createNotificationsChart(stats) {
    const ctx = document.getElementById('notificationsChart');
    if (!ctx) return;
    
    if (adminCharts.notifications) {
        adminCharts.notifications.destroy();
    }
    
    adminCharts.notifications = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Leídas', 'No Leídas', 'Total'],
            datasets: [{
                label: 'Notificaciones',
                data: [
                    stats.read_notifications || 0,
                    stats.unread_notifications || 0,
                    stats.total_notifications || 0
                ],
                backgroundColor: ['#4bc0c0', '#ff6384', '#667eea'],
                borderColor: ['#4bc0c0', '#ff6384', '#667eea'],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            }
        }
    });
}


// Logout function
function logout() {
    if (confirm('¿Está seguro de cerrar sesión?')) {
        // Clear all authentication data
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('username');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userRole');
        localStorage.removeItem('userId');
        localStorage.removeItem('userSpecialty');
        
        // Redirect to login
        window.location.href = 'login.html';
    }
}

