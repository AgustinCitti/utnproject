// Variable para almacenar el ID del estudiante que se está editando
let editingStudentId = null;

// Función actualizada para GUARDAR/CREAR estudiante
async function saveStudent() {
    const formData = {
        Nombre: document.getElementById('studentFirstName').value,
        Apellido: document.getElementById('studentLastName').value,
        Email: document.getElementById('studentEmail').value || null,
        Fecha_nacimiento: document.getElementById('studentCourse').value || null,
        Estado: 'ACTIVO'
    };

    // Validación
    if (!formData.Nombre || !formData.Apellido) {
        alert('El nombre y apellido son obligatorios.');
        return;
    }
    console.log('Datos a enviar:', formData);
    try {
        let response;
        let url = '../api/estudiantes.php';  
        let method = 'POST';
        let body = JSON.stringify(formData);

        // Si estamos editando, usar PUT
        if (editingStudentId) {
            url += `?id=${editingStudentId}`;
            method = 'PUT';
        }
        console.log('URL:', url, 'Method:', method);

        response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: body
        });
        console.log('Response status:', response.status); 
        const result = await response.json();
        console.log('Response data:', result);

        if (response.ok && result.success !== false) {
            // Actualizar datos locales recargando desde el servidor
            await loadData();
            
            // Cerrar modal y limpiar
            closeModal('studentModal');
            clearStudentForm();
            editingStudentId = null;
            
            // Recargar vista
            if (typeof loadStudents === 'function') {
                loadStudents();
            }
            if (typeof loadUnifiedStudentData === 'function') {
                loadUnifiedStudentData();
                console.log('Estudiantes después de recargar:', appData.estudiante);
            }
            if (typeof updateDashboard === 'function') {
                updateDashboard();
            }
            
            // Mostrar notificación
            if (typeof showNotification === 'function') {
                showNotification(
                    editingStudentId ? 'Estudiante actualizado exitosamente' : 'Estudiante creado exitosamente',
                    'success'
                );
            }
        } else {
            alert(result.message || 'Error al guardar el estudiante');
        }
    } catch (error) {
        console.error('Error al guardar estudiante:', error);
        alert('Error al conectar con el servidor');
    }
}

// Función actualizada para EDITAR estudiante
function editStudent(id) {
    const student = appData.estudiante.find(s => s.ID_Estudiante === id);
    if (!student) {
        alert('Estudiante no encontrado');
        return;
    }

    // Guardar ID para el modo edición
    editingStudentId = id;

    // Llenar formulario con datos del estudiante
    document.getElementById('studentFirstName').value = student.Nombre || '';
    document.getElementById('studentLastName').value = student.Apellido || '';
    document.getElementById('studentEmail').value = student.Email || '';
    document.getElementById('studentCourse').value = student.Fecha_nacimiento || '';

    showModal('studentModal');
}

// Función actualizada para ELIMINAR estudiante
async function deleteStudent(id) {
    if (!confirm('¿Estás seguro de que deseas eliminar este estudiante?')) {
        return;
    }

    try {
        const response = await fetch(`../api/estudiantes.php?id=${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const result = await response.json();

        if (response.ok && result.success) {
            // Actualizar datos locales
            await loadData();
            
            // Recargar vista
            if (typeof loadStudents === 'function') {
                loadStudents();
            }
            if (typeof loadUnifiedStudentData === 'function') {
                loadUnifiedStudentData();
            }
            if (typeof updateDashboard === 'function') {
                updateDashboard();
            }
            
            // Mostrar notificación
            if (typeof showNotification === 'function') {
                showNotification('Estudiante eliminado exitosamente', 'success');
            }
        } else {
            alert(result.message || 'Error al eliminar el estudiante');
        }
    } catch (error) {
        console.error('Error al eliminar estudiante:', error);
        alert('Error al conectar con el servidor');
    }
}

function clearStudentForm() {
    document.getElementById('studentForm').reset();
    editingStudentId = null;
}


const originalShowModal = window.showModal;
window.showModal = function(modalId) {
    originalShowModal(modalId);
    
    if (modalId === 'studentModal') {
        setTimeout(() => {
            const submitBtn = document.querySelector('#studentForm button[type="submit"]');
            if (submitBtn) {
                submitBtn.onclick = function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    saveStudent();
                    return false;
                };
            }
        }, 100);
    }
};