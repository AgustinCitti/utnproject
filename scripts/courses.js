/**
 * Gestión de Cursos/Divisiones
 * Permite crear, editar y eliminar cursos antes de asignar materias
 */

let coursesData = [];

// Inicializar gestión de cursos
function initializeCourses() {
    const addCourseBtn = document.getElementById('addCourseBtn');
    if (addCourseBtn) {
        addCourseBtn.addEventListener('click', () => {
            openCourseModal();
        });
    }
    
    // Setup modal handlers
    setupModalHandlers('courseModal');
    
    // Preview del nombre del curso
    const courseNumber = document.getElementById('courseNumber');
    const courseDivision = document.getElementById('courseDivision');
    const courseInstitucion = document.getElementById('courseInstitucion');
    
    if (courseNumber && courseDivision) {
        const updatePreview = () => {
            const preview = document.getElementById('coursePreview');
            if (preview) {
                const num = courseNumber.value;
                const div = courseDivision.value;
                const inst = courseInstitucion ? courseInstitucion.value : '';
                if (num && div) {
                    preview.textContent = `${num}º Curso - División ${div}${inst ? ' - ' + inst : ''}`;
                } else {
                    preview.textContent = '-';
                }
            }
        };
        
        courseNumber.addEventListener('change', updatePreview);
        courseDivision.addEventListener('change', updatePreview);
        if (courseInstitucion) {
            courseInstitucion.addEventListener('input', updatePreview);
        }
    }
    
    // Cargar cursos al inicializar
    loadCourses();
}

// Cargar cursos del docente
async function loadCourses() {
    const userIdString = localStorage.getItem('userId');
    if (!userIdString) {
        console.error('No se encontró ID de usuario');
        return;
    }
    
    try {
        const response = await fetch(`api/curso.php?userId=${userIdString}`);
        const result = await response.json();
        
        if (result.success && result.data) {
            coursesData = result.data;
            renderCourses();
        } else {
            console.error('Error cargando cursos:', result.message);
            coursesData = [];
            renderCourses();
        }
    } catch (error) {
        console.error('Error al cargar cursos:', error);
        coursesData = [];
        renderCourses();
    }
}

// Renderizar lista de cursos
function renderCourses() {
    const coursesList = document.getElementById('coursesList');
    if (!coursesList) return;
    
    if (coursesData.length === 0) {
        coursesList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-graduation-cap"></i>
                <p>No hay cursos creados. Crea tu primer curso para comenzar.</p>
            </div>
        `;
        return;
    }
    
    coursesList.innerHTML = coursesData.map(course => `
        <div class="course-card" data-course-id="${course.ID_curso}">
            <div class="course-card-header">
                <h3>${course.Curso_division}</h3>
                <span class="course-status ${course.Estado.toLowerCase()}">${course.Estado}</span>
            </div>
            <div class="course-card-body">
                <p><strong>Curso:</strong> ${course.Numero_curso}º</p>
                <p><strong>División:</strong> ${course.Division}</p>
                <p><strong>Institución:</strong> ${course.Institucion || 'Sin especificar'}</p>
                <p><strong>Creado:</strong> ${new Date(course.Fecha_creacion).toLocaleDateString('es-AR')}</p>
            </div>
            <div class="course-card-actions">
                <button class="btn-icon btn-primary" onclick="editCourse(${course.ID_curso})" title="Editar">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-icon btn-danger" onclick="deleteCourse(${course.ID_curso})" title="Eliminar">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
}

// Abrir modal para crear curso
function openCourseModal(courseId = null) {
    const modal = document.getElementById('courseModal');
    const title = document.getElementById('courseModalTitle');
    const form = document.getElementById('courseForm');
    
    if (!modal || !form) {
        console.error('No se encontró el modal o el formulario de curso');
        return;
    }
    
    // Asegurar que el campo de institución esté visible
    const instInput = document.getElementById('courseInstitucion');
    if (instInput) {
        instInput.style.display = '';
        instInput.style.visibility = 'visible';
        const instGroup = instInput.closest('.form-group');
        if (instGroup) {
            instGroup.style.display = '';
            instGroup.style.visibility = 'visible';
        }
    }
    
    // Resetear formulario
    form.reset();
    document.getElementById('courseId').value = '';
    document.getElementById('coursePreview').textContent = '-';
    
    if (courseId) {
        // Modo edición
        const course = coursesData.find(c => c.ID_curso === courseId);
        if (course) {
            document.getElementById('courseId').value = course.ID_curso;
            document.getElementById('courseNumber').value = course.Numero_curso;
            document.getElementById('courseDivision').value = course.Division;
            if (instInput) instInput.value = course.Institucion || '';
            document.getElementById('courseStatus').value = course.Estado;
            if (title) title.textContent = 'Editar Curso';
            updateCoursePreview();
        }
    } else {
        // Modo creación - asegurar que el campo esté vacío y visible
        if (instInput) instInput.value = '';
        if (title) title.textContent = 'Agregar Curso';
    }
    
    if (typeof showModal === 'function') {
        showModal('courseModal');
    } else {
        modal.classList.add('active');
    }
}

// Actualizar preview del curso
function updateCoursePreview() {
    const num = document.getElementById('courseNumber')?.value;
    const div = document.getElementById('courseDivision')?.value;
    const inst = document.getElementById('courseInstitucion')?.value;
    const preview = document.getElementById('coursePreview');
    
    if (preview) {
        if (num && div) {
            preview.textContent = `${num}º Curso - División ${div}${inst ? ' - ' + inst : ''}`;
        } else {
            preview.textContent = '-';
        }
    }
}

// Guardar curso (crear o actualizar)
async function saveCourse() {
    const courseId = document.getElementById('courseId')?.value;
    const courseNumber = document.getElementById('courseNumber')?.value;
    const courseDivision = document.getElementById('courseDivision')?.value;
    const courseInstitucion = document.getElementById('courseInstitucion')?.value?.trim();
    const courseStatus = document.getElementById('courseStatus')?.value;
    
    if (!courseNumber || !courseDivision || !courseInstitucion) {
        alert('Por favor completa Curso, División e Institución');
        return;
    }
    
    const userIdString = localStorage.getItem('userId');
    if (!userIdString) {
        alert('Error: No se encontró el ID de usuario');
        return;
    }
    
    const teacherId = parseInt(userIdString, 10);
    
    const payload = {
        Numero_curso: parseInt(courseNumber, 10),
        Division: courseDivision,
        Institucion: courseInstitucion,
        Estado: courseStatus || 'ACTIVO',
        Usuarios_docente_ID_docente: teacherId
    };
    
    try {
        let response;
        
        if (courseId) {
            // Actualizar
            payload.ID_curso = parseInt(courseId, 10);
            response = await fetch(`api/curso.php?id=${courseId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });
        } else {
            // Crear
            response = await fetch('api/curso.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });
        }
        
        // Verificar si la respuesta es JSON válido
        let result;
        try {
            const responseText = await response.text();
            result = JSON.parse(responseText);
        } catch (parseError) {
            console.error('Error al parsear respuesta:', parseError);
            alert('Error: El servidor devolvió una respuesta inválida. Por favor, verifica que el docente existe en la base de datos.');
            return;
        }
        
        if (result.success) {
            // Recargar cursos
            await loadCourses();
            
            // Cerrar modal
            if (typeof closeModal === 'function') {
                closeModal('courseModal');
            } else {
                const modal = document.getElementById('courseModal');
                if (modal) modal.classList.remove('active');
            }
            
            // Notificar éxito
            if (typeof showNotification === 'function') {
                showNotification(
                    courseId ? 'Curso actualizado exitosamente' : 'Curso creado exitosamente',
                    'success'
                );
            } else {
                alert(courseId ? 'Curso actualizado exitosamente' : 'Curso creado exitosamente');
            }
            
            // Recargar cursos para actualizar la lista
            await loadCourses();
            
            // Actualizar dropdowns en otras secciones (async)
            if (typeof populateCourseDivisionDropdown === 'function') {
                await populateCourseDivisionDropdown();
            }
            if (typeof populateBulkCourseDivisionDropdown === 'function') {
                populateBulkCourseDivisionDropdown().catch(err => console.error('Error al poblar dropdown:', err));
            }
            // Recargar filtros de gestión de estudiantes
            if (typeof populateUnifiedCourseFilter === 'function') {
                await populateUnifiedCourseFilter();
            }
            if (typeof populateExamsCourseFilter === 'function') {
                populateExamsCourseFilter();
            }
        } else {
            const errorMsg = result.message || 'Error al guardar el curso';
            if (errorMsg.includes('docente') || errorMsg.includes('no existe') || errorMsg.includes('no está activo')) {
                alert(errorMsg + '\n\nPor favor, cierra sesión e inicia sesión nuevamente para obtener un ID de docente válido.');
            } else {
                alert(errorMsg);
            }
        }
    } catch (error) {
        console.error('Error al guardar curso:', error);
        const errorMessage = error.message || 'Error desconocido';
        if (errorMessage.includes('Unexpected token') || errorMessage.includes('JSON')) {
            alert('Error: El servidor devolvió una respuesta inválida. Esto puede indicar que el docente no existe en la base de datos. Por favor, verifica tu sesión.');
        } else {
            alert('Error al guardar el curso: ' + errorMessage);
        }
    }
}

// Editar curso
window.editCourse = function(courseId) {
    openCourseModal(courseId);
};

// Eliminar curso
async function deleteCourse(courseId) {
    if (!confirm('¿Estás seguro de que deseas eliminar este curso? Esta acción no se puede deshacer.')) {
        return;
    }
    
    const userIdString = localStorage.getItem('userId');
    if (!userIdString) {
        alert('Error: No se encontró el ID de usuario');
        return;
    }
    
    try {
        const response = await fetch(`api/curso.php?id=${courseId}&userId=${userIdString}`, {
            method: 'DELETE'
        });
        
        const result = await response.json();
        
        if (result.success) {
            // Recargar cursos
            await loadCourses();
            
            // Notificar éxito
            if (typeof showNotification === 'function') {
                showNotification('Curso eliminado exitosamente', 'success');
            } else {
                alert('Curso eliminado exitosamente');
            }
            
            // Actualizar dropdowns
            if (typeof populateCourseDivisionDropdown === 'function') {
                await populateCourseDivisionDropdown();
            }
            if (typeof populateBulkCourseDivisionDropdown === 'function') {
                populateBulkCourseDivisionDropdown().catch(err => console.error('Error al poblar dropdown:', err));
            }
            // Recargar filtros de gestión de estudiantes
            if (typeof populateUnifiedCourseFilter === 'function') {
                await populateUnifiedCourseFilter();
            }
            if (typeof populateExamsCourseFilter === 'function') {
                populateExamsCourseFilter();
            }
        } else {
            if (result.error === 'HAS_SUBJECTS') {
                alert(result.message || 'No se puede eliminar el curso porque tiene materias asociadas');
            } else {
                alert(result.message || 'Error al eliminar el curso');
            }
        }
    } catch (error) {
        console.error('Error al eliminar curso:', error);
        alert('Error al eliminar el curso: ' + error.message);
    }
}

window.deleteCourse = deleteCourse;

// Función para obtener cursos disponibles (para usar en otras secciones)
function getAvailableCourses() {
    return coursesData.filter(c => c.Estado === 'ACTIVO');
}

// Hacer funciones globales
window.saveCourse = saveCourse;
window.openCourseModal = openCourseModal;

