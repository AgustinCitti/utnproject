// Admin Dashboard - User Management
let allUsers = [];
let currentEditId = null;

// Check authentication on page load
document.addEventListener('DOMContentLoaded', async function() {
    // First, try to sync session if coming from OAuth
    await syncSession();
    
    checkAdminAuth();
    loadUsers();
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
    showMessage('Usuarios actualizados', 'success');
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

