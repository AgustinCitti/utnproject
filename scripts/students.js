// Variable para almacenar el ID del estudiante que se está editando
let editingStudentId = null;

// Función para poblar el select de materias con las del docente actual
function populateStudentSubjectsSelect() {
    const subjectsSelect = document.getElementById('studentSubjects');
    if (!subjectsSelect) return;
    
    // Limpiar opciones actuales
    subjectsSelect.innerHTML = '';
    
    // Obtener ID del docente actual
    const currentUserId = parseInt(localStorage.getItem('userId') || '0');
    
    // Filtrar materias del docente actual
    const teacherSubjects = (appData.materia || []).filter(m => 
        m.Usuarios_docente_ID_docente === currentUserId && 
        (m.Estado === 'ACTIVA' || !m.Estado)
    );
    
    if (teacherSubjects.length === 0) {
        const option = document.createElement('option');
        option.value = '';
        option.textContent = 'No hay materias disponibles';
        option.disabled = true;
        subjectsSelect.appendChild(option);
    } else {
        teacherSubjects.forEach(subject => {
            const option = document.createElement('option');
            option.value = subject.ID_materia;
            option.textContent = `${subject.Nombre} - ${subject.Curso_division}`;
            subjectsSelect.appendChild(option);
        });
    }
}

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
            url = `${url}/${editingStudentId}`; // El endpoint lee el ID de la URL segmentada
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
            // Obtener el ID del estudiante (diferentes formas según la respuesta)
            let studentId = editingStudentId;
            if (!studentId) {
                // El endpoint devuelve { success: true, data: { ID_Estudiante: ... } }
                if (result.data && result.data.ID_Estudiante) {
                    studentId = result.data.ID_Estudiante;
                } else if (result.ID_Estudiante) {
                    studentId = result.ID_Estudiante;
                } else if (result.id) {
                    studentId = result.id;
                }
            }
            
            console.log('[students] ID del estudiante obtenido:', studentId);
            console.log('[students] Resultado completo del servidor:', result);
            console.log('[students] editingStudentId:', editingStudentId);
            
            // Guardar relaciones alumno-materia si hay materias seleccionadas
            const subjectsSelect = document.getElementById('studentSubjects');
            if (!subjectsSelect) {
                console.warn('[students] Campo studentSubjects no encontrado');
            } else if (!studentId) {
                console.error('[students] No se pudo obtener el ID del estudiante para guardar relaciones');
                alert('Estudiante guardado pero no se pudieron guardar las materias. ID no disponible.');
            } else {
                const selectedSubjects = Array.from(subjectsSelect.selectedOptions)
                    .map(opt => parseInt(opt.value))
                    .filter(id => !isNaN(id));
                
                console.log('[students] Materias seleccionadas:', selectedSubjects);
                
                if (selectedSubjects.length > 0) {
                    try {
                        // Si estamos editando, primero eliminar las relaciones existentes
                        if (editingStudentId) {
                            console.log('[students] Eliminando relaciones antiguas para estudiante:', studentId);
                            const deleteResponse = await fetch(`../api/alumnos_x_materia.php?estudianteId=${studentId}`, {
                                method: 'DELETE',
                                headers: { 'Content-Type': 'application/json' }
                            });
                            const deleteResult = await deleteResponse.json().catch(() => ({}));
                            console.log('[students] Resultado de eliminación:', deleteResult);
                        }
                        
                        // Crear nuevas relaciones
                        const relations = selectedSubjects.map(materiaId => ({
                            Materia_ID_materia: materiaId,
                            Estudiante_ID_Estudiante: studentId,
                            Estado: 'INSCRITO'
                        }));
                        
                        console.log('[students] Enviando relaciones:', relations);
                        
                        const relationsResponse = await fetch('../api/alumnos_x_materia.php', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(relations)
                        });
                        
                        const relationsText = await relationsResponse.text();
                        console.log('[students] Respuesta raw de relaciones:', relationsText);
                        
                        let relationsData = {};
                        try {
                            relationsData = JSON.parse(relationsText);
                            console.log('[students] Respuesta parseada de relaciones:', relationsData);
                        } catch (e) {
                            console.error('[students] Error parseando respuesta de relaciones:', e);
                        }
                        
                        if (!relationsResponse.ok) {
                            console.error('[students] Error al guardar relaciones:', relationsText);
                            alert('Estudiante guardado pero hubo un error al guardar las materias. Revisa la consola.');
                        } else {
                            console.log('[students] Relaciones guardadas exitosamente');
                        }
                    } catch (error) {
                        console.error('[students] Error al guardar relaciones:', error);
                        alert('Estudiante guardado pero hubo un error al guardar las materias: ' + error.message);
                    }
                } else {
                    console.log('[students] No hay materias seleccionadas para guardar');
                }
            }
            
            // Actualizar datos locales recargando desde el servidor
            console.log('[students] Recargando datos desde servidor...');
            await loadData();
            console.log('[students] Datos recargados. Estudiantes:', appData.estudiante?.length || 0);
            console.log('[students] Relaciones alumno-materia:', appData.alumnos_x_materia?.length || 0);
            
            // Cerrar modal y limpiar
            closeModal('studentModal');
            clearStudentForm();
            editingStudentId = null;
            
            // Recargar vistas con un pequeño delay para asegurar que los datos estén actualizados
            setTimeout(() => {
                if (typeof loadStudents === 'function') {
                    console.log('[students] Llamando loadStudents...');
                    loadStudents();
                }
                if (typeof loadUnifiedStudentData === 'function') {
                    console.log('[students] Llamando loadUnifiedStudentData...');
                    loadUnifiedStudentData();
                    console.log('[students] Estudiantes después de recargar:', appData.estudiante);
                }
                if (typeof loadStudentMatrix === 'function') {
                    const matrix = document.getElementById('unifiedStudentMatrix');
                    if (matrix && matrix.style.display !== 'none') {
                        console.log('[students] Llamando loadStudentMatrix...');
                        loadStudentMatrix();
                    }
                }
                if (typeof updateDashboard === 'function') {
                    updateDashboard();
                }
            }, 100);
            
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
    
    // Poblar materias y seleccionar las del estudiante
    populateStudentSubjectsSelect();
    
    // Obtener materias del estudiante
    const studentSubjects = (appData.alumnos_x_materia || [])
        .filter(axm => axm.Estudiante_ID_Estudiante === id)
        .map(axm => axm.Materia_ID_materia);
    
    const subjectsSelect = document.getElementById('studentSubjects');
    if (subjectsSelect) {
        Array.from(subjectsSelect.options).forEach(option => {
            option.selected = studentSubjects.includes(parseInt(option.value));
        });
    }

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
    populateStudentSubjectsSelect(); // Repoblar las materias
}

// Variable para trackear si los handlers ya fueron configurados
let noSubjectsModalHandlersSetup = false;

// Función para mostrar el modal de advertencia de "no subjects"
function showNoSubjectsModal() {
    const modal = document.getElementById('noSubjectsModal');
    if (!modal) {
        console.error('[students] Modal noSubjectsModal no encontrado');
        // Fallback a alert si el modal no existe
        alert('No tienes materias creadas todavía. Por favor, crea una materia primero desde la sección de "Gestión de Materias" antes de agregar estudiantes.');
        return;
    }
    
    // Configurar handlers solo la primera vez
    if (!noSubjectsModalHandlersSetup) {
        setupNoSubjectsModalHandlers();
        noSubjectsModalHandlersSetup = true;
    }
    
    // Mostrar el modal
    if (typeof showModal === 'function') {
        showModal('noSubjectsModal');
    } else {
        modal.classList.add('active');
    }
}

// Configurar handlers del modal de "no subjects"
function setupNoSubjectsModalHandlers() {
    const modal = document.getElementById('noSubjectsModal');
    if (!modal) return;
    
    // Usar la función setupModalHandlers para los botones de cerrar
    if (typeof setupModalHandlers === 'function') {
        setupModalHandlers('noSubjectsModal');
    }
    
    // Handler personalizado para el botón de ir a materias
    const goToSubjectsBtn = document.getElementById('goToSubjectsBtn');
    if (goToSubjectsBtn) {
        goToSubjectsBtn.addEventListener('click', () => {
            // Cerrar el modal
            closeModal('noSubjectsModal');
            
            // Navegar a la sección de materias
            if (typeof showSection === 'function') {
                showSection('subjects-management');
            } else {
                // Fallback: intentar cambiar la sección manualmente
                const subjectsSection = document.querySelector('a[data-section="subjects-management"]');
                if (subjectsSection) {
                    subjectsSection.click();
                }
            }
        });
    }
}


const originalShowModal = window.showModal;
window.showModal = function(modalId) {
    if (modalId === 'studentModal') {
        // Verificar si el usuario tiene materias antes de abrir el modal
        const currentUserId = parseInt(localStorage.getItem('userId') || '0');
        const teacherSubjects = (appData.materia || []).filter(m => 
            m.Usuarios_docente_ID_docente === currentUserId && 
            (m.Estado === 'ACTIVA' || !m.Estado)
        );
        
        if (teacherSubjects.length === 0) {
            // Mostrar modal de advertencia en lugar de alert
            showNoSubjectsModal();
            return; // No abrir el modal de estudiante
        }
    }
    
    originalShowModal(modalId);
    
    if (modalId === 'studentModal') {
        // Poblar materias cuando se abre el modal
        populateStudentSubjectsSelect();
        
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