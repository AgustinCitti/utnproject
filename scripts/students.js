// Variable para almacenar el ID del estudiante que se está editando
let editingStudentId = null;
// Lista de materias seleccionadas para el estudiante
let selectedSubjectsList = [];

// Función para poblar el select de materias con las del docente actual
function populateStudentSubjectsSelect() {
    const subjectsSelect = document.getElementById('studentSubjects');
    if (!subjectsSelect) return;
    
    // Obtener materias ya seleccionadas (para no mostrarlas en el dropdown)
    const selectedSubjectIds = selectedSubjectsList.map(s => s.id);
    
    // Limpiar opciones actuales excepto la primera
    subjectsSelect.innerHTML = '<option value="" data-translate="select_subject">- Seleccionar Materia -</option>';
    
    // El API ya filtra las materias por el docente logueado, así que solo filtramos por estado activo
    // Estado puede ser 'ACTIVA', 'INACTIVA', 'FINALIZADA', o null/undefined (en cuyo caso asumimos activa por defecto)
    const teacherSubjects = (appData.materia || []).filter(m => 
        (!m.Estado || m.Estado === 'ACTIVA') && !selectedSubjectIds.includes(m.ID_materia)
    );
    
    if (teacherSubjects.length === 0 && selectedSubjectsList.length === 0) {
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
    
    // Agregar event listener para cuando se selecciona una materia
    subjectsSelect.removeEventListener('change', handleSubjectSelection);
    subjectsSelect.addEventListener('change', handleSubjectSelection);
}

function handleSubjectSelection() {
    const subjectsSelect = document.getElementById('studentSubjects');
    const selectedValue = subjectsSelect.value;
    
    if (!selectedValue) return;
    
    // Encontrar la materia seleccionada
    const subject = appData.materia.find(m => m.ID_materia === parseInt(selectedValue));
    if (!subject) return;
    
    // Agregar a la lista de seleccionadas si no está ya
    if (!selectedSubjectsList.some(s => s.id === subject.ID_materia)) {
        selectedSubjectsList.push({
            id: subject.ID_materia,
            name: subject.Nombre,
            curso: subject.Curso_division
        });
    }
    
    // Renderizar las materias seleccionadas
    renderSelectedSubjects();
    
    // Repoblar el dropdown (sin las ya seleccionadas)
    populateStudentSubjectsSelect();
    
    // Resetear el dropdown
    subjectsSelect.value = '';
}

function renderSelectedSubjects() {
    const container = document.getElementById('selectedSubjectsContainer');
    if (!container) return;
    
    if (selectedSubjectsList.length === 0) {
        container.style.display = 'none';
        return;
    }
    
    container.style.display = 'block';
    container.innerHTML = selectedSubjectsList.map((subject, index) => `
        <span class="subject-chip" data-subject-id="${subject.id}">
            ${subject.name} - ${subject.curso}
            <button type="button" class="remove-subject-btn" onclick="removeSubject(${index})" title="Eliminar">
                <i class="fas fa-times"></i>
            </button>
        </span>
    `).join('');
}

function removeSubject(index) {
    selectedSubjectsList.splice(index, 1);
    renderSelectedSubjects();
    populateStudentSubjectsSelect();
}

// Make removeSubject globally accessible
window.removeSubject = removeSubject;

// Función actualizada para GUARDAR/CREAR estudiante
async function saveStudent() {
    const formData = {
        Nombre: document.getElementById('studentFirstName').value,
        Apellido: document.getElementById('studentLastName').value,
        Email: document.getElementById('studentEmail').value || null,
        Fecha_nacimiento: null, // Fecha de nacimiento no se captura en el formulario
        Estado: 'ACTIVO'
    };

    // Validación
    if (!formData.Nombre || !formData.Apellido) {
        alert('El nombre y apellido son obligatorios.');
        return;
    }
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

        response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: body
        });
        const result = await response.json();

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
            
            
            // Guardar relaciones alumno-materia si hay materias seleccionadas
            if (!studentId) {
                alert('Estudiante guardado pero no se pudieron guardar las materias. ID no disponible.');
            } else {
                const selectedSubjects = selectedSubjectsList.map(s => s.id);
                
                if (selectedSubjects.length > 0) {
                    try {
                        // Si estamos editando, primero eliminar las relaciones existentes
                        if (editingStudentId) {
                            const deleteResponse = await fetch(`../api/alumnos_x_materia.php?estudianteId=${studentId}`, {
                                method: 'DELETE',
                                headers: { 'Content-Type': 'application/json' }
                            });
                            const deleteResult = await deleteResponse.json().catch(() => ({}));
                        }
                        
                        // Crear nuevas relaciones
                        const relations = selectedSubjects.map(materiaId => ({
                            Materia_ID_materia: materiaId,
                            Estudiante_ID_Estudiante: studentId,
                            Estado: 'INSCRITO'
                        }));
                        
                        
                        const relationsResponse = await fetch('../api/alumnos_x_materia.php', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(relations)
                        });
                        
                        const relationsText = await relationsResponse.text();
                        
                        let relationsData = {};
                        try {
                            relationsData = JSON.parse(relationsText);
                        } catch (e) {
                            // Error parsing response - silently continue
                        }
                        
                        if (!relationsResponse.ok) {
                            alert('Estudiante guardado pero hubo un error al guardar las materias. Revisa la consola.');
                        } else {
                        }
                    } catch (error) {
                        alert('Estudiante guardado pero hubo un error al guardar las materias: ' + error.message);
                    }
                }
            }
            
            // Actualizar datos locales recargando desde el servidor
            await loadData();
            
            // Cerrar modal y limpiar
            closeModal('studentModal');
            clearStudentForm();
            editingStudentId = null;
            
            // Recargar vistas con un pequeño delay para asegurar que los datos estén actualizados
            setTimeout(() => {
                if (typeof loadStudents === 'function') {
                    loadStudents();
                }
                if (typeof loadUnifiedStudentData === 'function') {
                    loadUnifiedStudentData();
                }
                if (typeof loadStudentMatrix === 'function') {
                    const matrix = document.getElementById('unifiedStudentMatrix');
                    if (matrix && matrix.style.display !== 'none') {
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
    
    // Limpiar y poblar materias seleccionadas
    selectedSubjectsList = [];
    
    // Obtener materias del estudiante
    const studentSubjects = (appData.alumnos_x_materia || [])
        .filter(axm => axm.Estudiante_ID_Estudiante === id)
        .map(axm => {
            const subject = appData.materia.find(m => m.ID_materia === axm.Materia_ID_materia);
            if (subject) {
                return {
                    id: subject.ID_materia,
                    name: subject.Nombre,
                    curso: subject.Curso_division
                };
            }
            return null;
        })
        .filter(s => s !== null);
    
    selectedSubjectsList = studentSubjects;
    
    // Renderizar materias seleccionadas
    renderSelectedSubjects();
    
    // Poblar el dropdown con las materias disponibles
    populateStudentSubjectsSelect();

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
        alert('Error al conectar con el servidor');
    }
}

function clearStudentForm() {
    document.getElementById('studentForm').reset();
    editingStudentId = null;
    selectedSubjectsList = [];
    renderSelectedSubjects();
    populateStudentSubjectsSelect(); // Repoblar las materias
}

// Variable para trackear si los handlers ya fueron configurados
let noSubjectsModalHandlersSetup = false;

// Función para mostrar el modal de advertencia de "no subjects"
function showNoSubjectsModal() {
    // Intentar encontrar el modal, con reintentos si no está disponible inmediatamente
    let modal = document.getElementById('noSubjectsModal');
    
    if (!modal) {
        // Esperar un poco y reintentar (puede ser un problema de timing de carga del DOM)
        setTimeout(() => {
            modal = document.getElementById('noSubjectsModal');
            if (modal) {
                showNoSubjectsModalInternal(modal);
            } else {
                // Solo como último recurso, usar alert si después de esperar tampoco existe
                alert('No tienes materias creadas todavía. Por favor, crea una materia primero desde la sección de "Gestión de Materias" antes de agregar estudiantes.');
            }
        }, 100);
        return;
    }
    
    showNoSubjectsModalInternal(modal);
}

function showNoSubjectsModalInternal(modal) {
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


// Guardar referencia a la función showModal original antes de sobrescribirla
const originalShowModal = typeof window.showModal === 'function' ? window.showModal : null;
window.showModal = function(modalId) {
    if (modalId === 'studentModal') {
        // Verificar si el usuario tiene materias antes de abrir el modal
        // El API ya filtra las materias por el docente logueado, así que solo verificamos si hay materias activas
        // Estado puede ser 'ACTIVA', 'INACTIVA', 'FINALIZADA', o null/undefined (en cuyo caso asumimos activa por defecto)
        const teacherSubjects = (appData.materia || []).filter(m => 
            !m.Estado || m.Estado === 'ACTIVA'
        );
        
        if (teacherSubjects.length === 0) {
            // Mostrar modal de advertencia en lugar de alert
            showNoSubjectsModal();
            return; // No abrir el modal de estudiante
        }
    }
    
    // Llamar a la función original si existe
    if (originalShowModal && typeof originalShowModal === 'function') {
        originalShowModal(modalId);
    } else {
        // Fallback si no existe la función original
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('active');
        }
    }
    
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