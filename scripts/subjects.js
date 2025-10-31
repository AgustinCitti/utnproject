// Subjects Management
let currentSubjectId = null;
let isSubmitting = false; // Flag para prevenir doble submit
let subjectsInitialized = false; // Flag para prevenir múltiples inicializaciones
let subjectFormHandler = null; // Referencia al manejador del formulario

function initializeSubjects() {
    // Prevenir múltiples inicializaciones
    if (subjectsInitialized) {
        console.log('[subjects] Ya inicializado, omitiendo...');
        return;
    }
    console.log('[subjects] Inicializando gestión de materias...');
    const addSubjectBtn = document.getElementById('addSubjectBtn');
    console.log('[subjects] addSubjectBtn encontrado:', !!addSubjectBtn);
    const subjectModal = document.getElementById('subjectModal');
    const subjectForm = document.getElementById('subjectForm');
    const courseFilter = document.getElementById('subjectsCourseFilter');
    const statusFilter = document.getElementById('subjectsStatusFilter');
    const addContentBtn = document.getElementById('addContentBtn');
    const contentModal = document.getElementById('contentModal');
    const contentForm = document.getElementById('contentForm');

    // Subject management (con fallback seguro)
    if (addSubjectBtn) {
        addSubjectBtn.addEventListener('click', () => {
            try {
                console.log('[subjects] Botón agregar materia clickeado');
                if (typeof showModal === 'function') {
                    showModal('subjectModal');
                } else {
                    const el = document.getElementById('subjectModal');
                    if (el) {
                        el.classList.add('active');
                        console.log('[subjects] Modal abierto manualmente');
                    } else {
                        console.error('[subjects] Modal subjectModal no encontrado');
                    }
                }
                if (typeof clearSubjectForm === 'function') {
                    clearSubjectForm();
                } else {
                    const form = document.getElementById('subjectForm');
                    if (form) form.reset();
                    currentSubjectId = null;
                }
            } catch (e) {
                console.error('[subjects] Error al abrir modal de materia:', e);
                alert('Error al abrir el formulario de materia');
            }
        });
    } else {
        console.warn('[subjects] Botón addSubjectBtn no encontrado en el DOM');
    }

    if (subjectForm) {
        // Remover listener anterior si existe
        if (subjectFormHandler) {
            subjectForm.removeEventListener('submit', subjectFormHandler);
        }
        
        // Crear nueva función manejadora
        subjectFormHandler = (e) => {
            e.preventDefault();
            e.stopPropagation(); // Prevenir propagación
            
            if (isSubmitting) {
                console.warn('[subjects] Submit ya en proceso, ignorando...');
                return;
            }
            
            saveSubject().catch(err => {
                console.error('[subjects] saveSubject error:', err);
                alert(err.message || 'Error guardando la materia');
            });
        };
        
        // Agregar el listener
        subjectForm.addEventListener('submit', subjectFormHandler);
    }
    
    subjectsInitialized = true;

    // Content management
    if (addContentBtn) {
        addContentBtn.addEventListener('click', () => {
            showModal('contentModal');
            clearContentForm();
        });
    }

    if (contentForm) {
        contentForm.addEventListener('submit', (e) => {
            e.preventDefault();
            saveContent();
        });
    }

    // Filter functionality
    if (courseFilter) {
        courseFilter.addEventListener('change', () => {
            filterSubjects();
        });
    }

    if (statusFilter) {
        statusFilter.addEventListener('change', () => {
            filterSubjects();
        });
    }

    // View toggle functionality
    setupViewToggle('subjectsGridViewBtn', 'subjectsListViewBtn', 'subjectsContainer', 'subjectsList');

    // Modal close handlers
    setupModalHandlers('subjectModal');

    // Load initial data
    loadSubjects();
    populateTeacherSelect();
    populateSubjectSelect();
    populateCourseFilter();
}

function loadSubjects() {
    const subjectsContainer = document.getElementById('subjectsContainer');
    const subjectsList = document.getElementById('subjectsList');
    
    if (!subjectsContainer || !subjectsList) return;

    // Get filtered subjects
    const filteredSubjects = getFilteredSubjects();

    // Grid view
    subjectsContainer.innerHTML = filteredSubjects.map(subject => {
        const teacher = getTeacherById(subject.Usuarios_docente_ID_docente);
        const studentCount = getStudentCountBySubject(subject.ID_materia);
        const evaluationCount = getEvaluationCountBySubject(subject.ID_materia);
        const contentCount = getContentCountBySubject(subject.ID_materia);

        return `
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">${subject.Nombre}</h3>
                    <div class="card-actions">
                        <button class="btn-icon btn-view" onclick="viewSubjectDetails(${subject.ID_materia})" title="View Details">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn-icon btn-edit" onclick="editSubject(${subject.ID_materia})" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-icon btn-delete" onclick="deleteSubject(${subject.ID_materia})" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <div class="card-content">
                    <p><strong>Curso:</strong> ${subject.Curso_division}</p>
                    <p><strong>Profesor:</strong> ${teacher ? `${teacher.Nombre_docente} ${teacher.Apellido_docente}` : 'N/A'}</p>
                    <p><strong>Horario:</strong> ${subject.Horario || 'No especificado'}</p>
                    <p><strong>Aula:</strong> ${subject.Aula || 'No especificada'}</p>
                    <p><strong>Estado:</strong> <span class="status-${subject.Estado.toLowerCase()}">${getStatusText(subject.Estado)}</span></p>
                    <div class="card-stats">
                        <div class="stat-item">
                            <i class="fas fa-users"></i>
                            <span>${studentCount} estudiantes</span>
                        </div>
                        <div class="stat-item">
                            <i class="fas fa-file-alt"></i>
                            <span>${evaluationCount} evaluaciones</span>
                        </div>
                        <div class="stat-item">
                            <i class="fas fa-list"></i>
                            <span>${contentCount} contenidos</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    // List view - Table format
    subjectsList.innerHTML = `
        <div class="table-responsive">
            <table class="data-table">
                <thead>
                    <tr>
                        <th data-translate="subject_name">Materia</th>
                        <th data-translate="course_division">Curso</th>
                        <th data-translate="teacher">Profesor</th>
                        <th data-translate="schedule">Horario</th>
                        <th data-translate="classroom">Aula</th>
                        <th data-translate="status">Estado</th>
                        <th data-translate="students">Estudiantes</th>
                        <th data-translate="actions">Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    ${filteredSubjects.map(subject => {
                        const teacher = getTeacherById(subject.Usuarios_docente_ID_docente);
                        const studentCount = getStudentCountBySubject(subject.ID_materia);
                        
                        return `
                            <tr>
                                <td><strong>${subject.Nombre}</strong></td>
                                <td>${subject.Curso_division}</td>
                                <td>${teacher ? `${teacher.Nombre_docente} ${teacher.Apellido_docente}` : 'N/A'}</td>
                                <td>${subject.Horario || 'No especificado'}</td>
                                <td>${subject.Aula || 'No especificada'}</td>
                                <td><span class="table-status ${subject.Estado.toLowerCase()}">${getStatusText(subject.Estado)}</span></td>
                                <td>${studentCount}</td>
                                <td>
                                    <div class="table-actions">
                                        <button class="btn-icon btn-view" onclick="viewSubjectDetails(${subject.ID_materia})" title="View Details">
                                            <i class="fas fa-eye"></i>
                                        </button>
                                        <button class="btn-icon btn-edit" onclick="editSubject(${subject.ID_materia})" title="Editar">
                                            <i class="fas fa-edit"></i>
                                        </button>
                                        <button class="btn-icon btn-delete" onclick="deleteSubject(${subject.ID_materia})" title="Eliminar">
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


async function saveSubject() {
	const teacherEl = document.getElementById('subjectTeacher');
	const teacherId = teacherEl && teacherEl.value ? parseInt(teacherEl.value) : parseInt(localStorage.getItem('userId') || '0');

	const payload = {
		Nombre: document.getElementById('subjectName').value.trim(),
		Curso_division: document.getElementById('subjectCourse').value.trim(),
		Usuarios_docente_ID_docente: teacherId,
		Estado: document.getElementById('subjectStatus').value,
		Horario: (document.getElementById('subjectSchedule').value || '').trim() || null,
		Aula: (document.getElementById('subjectClassroom').value || '').trim() || null,
		Descripcion: (document.getElementById('subjectDescription').value || '').trim() || null
	};

	if (!payload.Nombre || !payload.Curso_division || !payload.Usuarios_docente_ID_docente) {
		alert('Completá Nombre, Curso y Profesor.');
		return;
	}

	// Prevenir doble submit
	if (isSubmitting) {
		console.warn('[subjects] Ya hay un submit en proceso, ignorando...');
		return;
	}

	isSubmitting = true;
	const submitBtn = document.querySelector('#subjectForm button[type="submit"]');
	const originalBtnText = submitBtn ? submitBtn.textContent : '';
	
	try {
		// Deshabilitar botón durante el proceso
		if (submitBtn) {
			submitBtn.disabled = true;
			submitBtn.textContent = 'Guardando...';
		}
		if (currentSubjectId) {
			// UPDATE con PUT
			const res = await fetch(`../api/materia.php?id=${currentSubjectId}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
				credentials: 'include',
				body: JSON.stringify(payload)
			});
			const data = await res.json().catch(() => ({}));
			if (!res.ok) throw new Error(data.message || 'No se pudo actualizar la materia');
		} else {
			// CREATE con POST
			console.log('[subjects] Enviando payload:', payload);
			const res = await fetch('../api/materia.php', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
				credentials: 'include',
				body: JSON.stringify(payload)
			});
			
			let data = {};
			const text = await res.text();
			console.log('[subjects] Respuesta raw del servidor:', text);
			try {
				data = JSON.parse(text);
				console.log('[subjects] Respuesta parseada:', data);
			} catch (e) {
				console.error('[subjects] Error parseando JSON:', e);
				console.error('[subjects] Texto recibido:', text);
				throw new Error(`Error del servidor (${res.status}): ${text.substring(0, 200)}`);
			}
			
			if (!res.ok) {
				const errorMsg = data.error ? `${data.message || 'Error'}: ${data.error}` : (data.message || 'No se pudo crear la materia');
				console.error('[subjects] Error completo:', { status: res.status, data, file: data.file, line: data.line });
				throw new Error(errorMsg);
			}
		}

		if (typeof loadData === 'function') await loadData(); // recarga desde backend
		closeModal('subjectModal');
		loadSubjects();
		populateCourseFilter();
		if (typeof populateSubjectFilter === 'function') populateSubjectFilter();
		if (typeof populateExamsSubjectFilter === 'function') populateExamsSubjectFilter();
		if (typeof populateUnifiedCourseFilter === 'function') populateUnifiedCourseFilter();
		if (typeof loadUnifiedStudentData === 'function') loadUnifiedStudentData();
		updateDashboard();
		currentSubjectId = null;
		alert('Materia guardada correctamente');
	} catch (err) {
		console.error('[subjects] saveSubject error completo:', err);
		console.error('[subjects] Stack trace:', err.stack);
		const errorMsg = err.message || 'Error al guardar la materia';
		alert(`Error: ${errorMsg}\n\nRevisa la consola para más detalles.`);
	} finally {
		// Rehabilitar botón y flag
		isSubmitting = false;
		const submitBtn = document.querySelector('#subjectForm button[type="submit"]');
		if (submitBtn) {
			submitBtn.disabled = false;
			if (originalBtnText) submitBtn.textContent = originalBtnText;
		}
	}
}


function editSubject(id) {
    const subject = appData.materia.find(s => s.ID_materia === id);
    if (!subject) return;

    currentSubjectId = id;
    document.getElementById('subjectName').value = subject.Nombre;
    document.getElementById('subjectCourse').value = subject.Curso_division;
    document.getElementById('subjectDescription').value = subject.Descripcion || '';
    document.getElementById('subjectSchedule').value = subject.Horario || '';
    document.getElementById('subjectClassroom').value = subject.Aula || '';
    document.getElementById('subjectTeacher').value = subject.Usuarios_docente_ID_docente;
    document.getElementById('subjectStatus').value = subject.Estado;

    showModal('subjectModal');
}


async function deleteSubject(id) {
    if (!confirm('¿Estás seguro de que quieres eliminar esta materia?')) {
        return;
    }
    
    try {
        console.log('[subjects] Eliminando materia ID:', id);
        const res = await fetch(`../api/materia.php?id=${id}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            credentials: 'include'
        });
        
        const text = await res.text();
        let data = {};
        try {
            data = JSON.parse(text);
        } catch (e) {
            console.error('[subjects] Error parseando respuesta:', text);
            throw new Error(`Error del servidor (${res.status})`);
        }
        
        if (!res.ok) {
            throw new Error(data.message || 'No se pudo eliminar la materia');
        }
        
        // Recargar datos desde el backend
        if (typeof loadData === 'function') {
            await loadData();
        }
        
        // Actualizar UI
        loadSubjects();
        populateCourseFilter();
        if (typeof populateSubjectFilter === 'function') populateSubjectFilter();
        if (typeof populateExamsSubjectFilter === 'function') populateExamsSubjectFilter();
        if (typeof populateUnifiedCourseFilter === 'function') populateUnifiedCourseFilter();
        if (typeof loadUnifiedStudentData === 'function') loadUnifiedStudentData();
        if (typeof updateDashboard === 'function') updateDashboard();
        
        alert('Materia eliminada correctamente');
    } catch (err) {
        console.error('[subjects] Error al eliminar materia:', err);
        alert(err.message || 'Error al eliminar la materia');
    }
}


function clearSubjectForm() {
    document.getElementById('subjectForm').reset();
    currentSubjectId = null;
}


// Filter functions
function getFilteredSubjects() {
    const courseFilter = document.getElementById('subjectsCourseFilter');
    const statusFilter = document.getElementById('subjectsStatusFilter');
    const selectedCourse = courseFilter ? courseFilter.value : '';
    const selectedStatus = statusFilter ? statusFilter.value : '';
    
    // Get current user ID to filter only their subjects
    const currentUserId = localStorage.getItem('userId');
    let subjects = appData.materia || [];
    
    // Filter by current teacher (only show subjects taught by current user)
    if (currentUserId) {
        subjects = subjects.filter(subject => 
            subject.Usuarios_docente_ID_docente === parseInt(currentUserId)
        );
    }
    
    // Filter by course/division
    if (selectedCourse) {
        subjects = subjects.filter(subject => 
            subject.Curso_division === selectedCourse
        );
    }
    
    // Filter by status
    if (selectedStatus) {
        subjects = subjects.filter(subject => subject.Estado === selectedStatus);
    }
    
    return subjects;
}

function filterSubjects() {
    loadSubjects();
}

// Helper functions
function getTeacherById(teacherId) {
    return appData.usuarios_docente.find(t => t.ID_docente === teacherId);
}

function getSubjectById(subjectId) {
    return appData.materia.find(s => s.ID_materia === subjectId);
}


function getStudentCountBySubject(subjectId) {
    return appData.alumnos_x_materia.filter(axm => axm.Materia_ID_materia === subjectId).length;
}

// Populate course filter with user's subjects course divisions
function populateCourseFilter() {
    const courseFilter = document.getElementById('subjectsCourseFilter');
    if (!courseFilter) return;

    // Get current user ID
    const currentUserId = localStorage.getItem('userId');
    if (!currentUserId) return;

    // Get user's subjects
    const userSubjects = appData.materia.filter(subject => 
        subject.Usuarios_docente_ID_docente === parseInt(currentUserId)
    );

    // Get unique course divisions from user's subjects
    const courseDivisions = [...new Set(userSubjects.map(subject => subject.Curso_division))];
    
    // Clear existing options except the first one
    courseFilter.innerHTML = '<option value="" data-translate="all_courses">Todos los Cursos</option>';
    
    // Add course division options
    courseDivisions.forEach(division => {
        const option = document.createElement('option');
        option.value = division;
        option.textContent = division;
        courseFilter.appendChild(option);
    });
}

function getEvaluationCountBySubject(subjectId) {
    return appData.evaluacion.filter(e => e.Materia_ID_materia === subjectId).length;
}

function getContentCountBySubject(subjectId) {
    return appData.contenido.filter(c => c.Materia_ID_materia === subjectId).length;
}


function getStatusText(status) {
    const statusMap = {
        'ACTIVA': 'Activa',
        'INACTIVA': 'Inactiva',
        'FINALIZADA': 'Finalizada',
        'PENDIENTE': 'Pendiente',
        'EN_PROGRESO': 'En Progreso',
        'COMPLETADO': 'Completado',
        'CANCELADO': 'Cancelado'
    };
    return statusMap[status] || status;
}

function populateTeacherSelect() {
    const teacherSelect = document.getElementById('subjectTeacher');
    if (!teacherSelect) return;

    teacherSelect.innerHTML = '<option value="" data-translate="select_teacher">- Seleccionar Profesor -</option>';
    
    appData.usuarios_docente.forEach(teacher => {
        const option = document.createElement('option');
        option.value = teacher.ID_docente;
        option.textContent = `${teacher.Nombre_docente} ${teacher.Apellido_docente}`;
        teacherSelect.appendChild(option);
    });
}

function populateSubjectSelect() {
    const subjectSelect = document.getElementById('contentSubject');
    if (!subjectSelect) return;

    subjectSelect.innerHTML = '<option value="" data-translate="select_subject">- Seleccionar Materia -</option>';
    
    appData.materia.forEach(subject => {
        const option = document.createElement('option');
        option.value = subject.ID_materia;
        option.textContent = subject.Nombre;
        subjectSelect.appendChild(option);
    });
}

function viewSubjectDetails(subjectId) {
    // Store the current subject ID for the details view
    window.currentSubjectId = subjectId;
    
    // Hide subjects content and show subject details view
    const subjectsContainer = document.getElementById('subjectsContainer');
    const subjectsList = document.getElementById('subjectsList');
    const subjectDetailsView = document.getElementById('subjectDetailsView');
    const sectionHeader = document.querySelector('#subjects-management .section-header');
    
    if (subjectsContainer) subjectsContainer.style.display = 'none';
    if (subjectsList) subjectsList.style.display = 'none';
    if (sectionHeader) sectionHeader.style.display = 'none';
    if (subjectDetailsView) subjectDetailsView.style.display = 'block';
    
    // Load the subject details view
    loadSubjectDetailsView(subjectId);
}

function backToSubjects() {
    // Show subjects content and hide subject details view
    const subjectsContainer = document.getElementById('subjectsContainer');
    const subjectsList = document.getElementById('subjectsList');
    const subjectDetailsView = document.getElementById('subjectDetailsView');
    const sectionHeader = document.querySelector('#subjects-management .section-header');
    
    if (subjectDetailsView) subjectDetailsView.style.display = 'none';
    if (sectionHeader) sectionHeader.style.display = 'flex';
    
    // Show the appropriate view based on current toggle state
    const gridBtn = document.getElementById('subjectsGridViewBtn');
    const listBtn = document.getElementById('subjectsListViewBtn');
    
    if (gridBtn && gridBtn.classList.contains('active')) {
        if (subjectsContainer) subjectsContainer.style.display = 'grid';
        if (subjectsList) subjectsList.style.display = 'none';
    } else {
        if (subjectsContainer) subjectsContainer.style.display = 'none';
        if (subjectsList) subjectsList.style.display = 'block';
    }
}

function loadSubjectDetailsView(subjectId) {
    const subject = getSubjectById(subjectId);
    if (!subject) return;

    const teacher = getTeacherById(subject.Usuarios_docente_ID_docente);
    const enrolledStudents = appData.alumnos_x_materia.filter(axm => axm.Materia_ID_materia === subjectId);
    const students = enrolledStudents.map(axm => 
        appData.estudiante.find(e => e.ID_Estudiante === axm.Estudiante_ID_Estudiante)
    ).filter(Boolean);
    
    const evaluations = appData.evaluacion.filter(e => e.Materia_ID_materia === subjectId);
    const content = appData.contenido.filter(c => c.Materia_ID_materia === subjectId);

    // Update title
    document.getElementById('subjectDetailsTitle').textContent = subject.Nombre;

    // Load details tab content
    loadSubjectDetailsTab(subject, teacher, students, evaluations);
    
    // Load content tab
    loadSubjectContentTab(subjectId, content);
}

function loadSubjectDetailsTab(subject, teacher, students, evaluations) {
    // Subject info summary
    const subjectInfoSummary = document.getElementById('subjectInfoSummary');
    if (!subjectInfoSummary) {
        console.error('subjectInfoSummary element not found');
        return;
    }
    
    subjectInfoSummary.innerHTML = `
        <div class="info-card">
            <div class="info-header">
                <h3>${subject.Nombre}</h3>
                <span class="status-badge status-${subject.Estado.toLowerCase()}">${getStatusText(subject.Estado)}</span>
            </div>
            <div class="info-content">
                <div class="info-row">
                    <span class="info-label">Curso:</span>
                    <span class="info-value">${subject.Curso_division}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Profesor:</span>
                    <span class="info-value">${teacher ? `${teacher.Nombre_docente} ${teacher.Apellido_docente}` : 'N/A'}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Horario:</span>
                    <span class="info-value">${subject.Horario || 'No especificado'}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Aula:</span>
                    <span class="info-value">${subject.Aula || 'No especificada'}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Descripción:</span>
                    <span class="info-value">${subject.Descripcion || 'Sin descripción'}</span>
                </div>
            </div>
        </div>
    `;

    // Subject details content
    const subjectDetailsContent = document.getElementById('subjectDetailsContent');
    if (!subjectDetailsContent) {
        console.error('subjectDetailsContent element not found');
        return;
    }
    
    subjectDetailsContent.innerHTML = `
        <div class="details-grid">
            <div class="details-card">
                <div class="card-header">
                    <h4><i class="fas fa-users"></i> Estudiantes Inscritos (${students.length})</h4>
                </div>
                <div class="card-content">
                    ${students.length > 0 ? `
                        <div class="students-list">
                            ${students.map(student => `
                                <div class="student-item">
                                    <span class="student-name">${student.Nombre} ${student.Apellido}</span>
                                    <span class="student-status">${student.Estado || 'Activo'}</span>
                                </div>
                            `).join('')}
                        </div>
                    ` : '<p class="empty-state">No hay estudiantes inscritos</p>'}
                </div>
            </div>
            
            <div class="details-card">
                <div class="card-header">
                    <h4><i class="fas fa-file-alt"></i> Evaluaciones (${evaluations.length})</h4>
                </div>
                <div class="card-content">
                    ${evaluations.length > 0 ? `
                        <div class="evaluations-list">
                            ${evaluations.map(evaluation => `
                                <div class="evaluation-item">
                                    <span class="evaluation-title">${evaluation.Titulo}</span>
                                    <span class="evaluation-date">${evaluation.Fecha}</span>
                                    <span class="evaluation-type">${evaluation.Tipo}</span>
                                </div>
                            `).join('')}
                        </div>
                    ` : '<p class="empty-state">No hay evaluaciones registradas</p>'}
                </div>
            </div>
        </div>
    `;
}

function loadSubjectContentTab(subjectId, content) {
    const contentListContainer = document.getElementById('subjectContentList');
    if (!contentListContainer) {
        console.error('subjectContentList element not found');
        return;
    }
    
    if (content.length > 0) {
        contentListContainer.innerHTML = content.map(item => `
            <div class="content-item">
                <div class="content-info">
                    <span class="content-topic">${item.Tema}</span>
                    <span class="content-description">${item.Descripcion || 'Sin descripción'}</span>
                </div>
                <div class="content-actions">
                    <select class="content-status-selector" onchange="changeContentStatus(${item.ID_contenido}, this.value)" title="Cambiar Estado">
                        <option value="PENDIENTE" ${item.Estado === 'PENDIENTE' ? 'selected' : ''}>Pendiente</option>
                        <option value="EN_PROGRESO" ${item.Estado === 'EN_PROGRESO' ? 'selected' : ''}>En Progreso</option>
                        <option value="COMPLETADO" ${item.Estado === 'COMPLETADO' ? 'selected' : ''}>Completado</option>
                        <option value="CANCELADO" ${item.Estado === 'CANCELADO' ? 'selected' : ''}>Cancelado</option>
                    </select>
                    <div class="content-action-buttons">
                        <button class="btn-icon btn-edit" onclick="editContent(${item.ID_contenido})" title="Editar Contenido">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-icon btn-delete" onclick="deleteContent(${item.ID_contenido})" title="Eliminar Contenido">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    } else {
        contentListContainer.innerHTML = '<p class="empty-state">No hay contenidos registrados para esta materia</p>';
    }
}

function showSubjectDetail(subjectId) {
    const subject = getSubjectById(subjectId);
    if (!subject) return;

    const teacher = getTeacherById(subject.Usuarios_docente_ID_docente);
    const enrolledStudents = appData.alumnos_x_materia.filter(axm => axm.Materia_ID_materia === subjectId);
    const students = enrolledStudents.map(axm => 
        appData.estudiante.find(e => e.ID_Estudiante === axm.Estudiante_ID_Estudiante)
    ).filter(Boolean);

    // Update panel content
    document.getElementById('selectedSubjectName').textContent = subject.Nombre;
    document.getElementById('subjectStudents').textContent = students.length;
    document.getElementById('subjectEvaluations').textContent = getEvaluationCountBySubject(subjectId);
    document.getElementById('subjectContent').textContent = getContentCountBySubject(subjectId);

    // Subject info
    document.getElementById('subjectInfo').innerHTML = `
        <div class="info-item">
            <strong>Curso:</strong> ${subject.Curso_division}
        </div>
        <div class="info-item">
            <strong>Profesor:</strong> ${teacher ? `${teacher.Nombre_docente} ${teacher.Apellido_docente}` : 'N/A'}
        </div>
        <div class="info-item">
            <strong>Horario:</strong> ${subject.Horario || 'No especificado'}
        </div>
        <div class="info-item">
            <strong>Aula:</strong> ${subject.Aula || 'No especificada'}
        </div>
        <div class="info-item">
            <strong>Estado:</strong> <span class="status-${subject.Estado.toLowerCase()}">${getStatusText(subject.Estado)}</span>
        </div>
        <div class="info-item">
            <strong>Descripción:</strong> ${subject.Descripcion || 'Sin descripción'}
        </div>
    `;

    // Enrolled students
    document.getElementById('subjectEnrolledStudents').innerHTML = students.map(student => `
        <div class="student-item">
            <span class="student-name">${student.Nombre} ${student.Apellido}</span>
            <span class="student-status">${student.Estado}</span>
        </div>
    `).join('') || '<p>No hay estudiantes inscritos</p>';

    // Show panel
    document.getElementById('subjectDetailPanel').style.display = 'block';
}

function closeSubjectDetail() {
    document.getElementById('subjectDetailPanel').style.display = 'none';
}

// View toggle functionality
function setupViewToggle(gridBtnId, listBtnId, gridContainerId, listContainerId) {
    const gridBtn = document.getElementById(gridBtnId);
    const listBtn = document.getElementById(listBtnId);
    const gridContainer = document.getElementById(gridContainerId);
    const listContainer = document.getElementById(listContainerId);

    if (gridBtn && listBtn && gridContainer && listContainer) {
        gridBtn.addEventListener('click', () => {
            gridBtn.classList.add('active');
            listBtn.classList.remove('active');
            gridContainer.style.display = 'grid';
            listContainer.style.display = 'none';
        });

        listBtn.addEventListener('click', () => {
            listBtn.classList.add('active');
            gridBtn.classList.remove('active');
            listContainer.style.display = 'block';
            gridContainer.style.display = 'none';
        });
    }
}

// Tab toggle functionality

// Tab switching functionality for subject details
function switchSubjectDetailsTab(tabName) {
    const detailsTab = document.getElementById('subjectDetailsTab');
    const contentTab = document.getElementById('subjectContentTab');
    const detailsContent = document.getElementById('subjectDetailsTabContent');
    const contentTabContent = document.getElementById('subjectContentTabContent');
    
    if (tabName === 'details') {
        detailsTab.classList.add('active');
        contentTab.classList.remove('active');
        detailsContent.classList.add('active');
        contentTabContent.classList.remove('active');
    } else if (tabName === 'content') {
        contentTab.classList.add('active');
        detailsTab.classList.remove('active');
        contentTabContent.classList.add('active');
        detailsContent.classList.remove('active');
    }
}

// Event listeners for detail panel
document.addEventListener('DOMContentLoaded', function() {
    const closeSubjectDetailBtn = document.getElementById('closeSubjectDetail');
    if (closeSubjectDetailBtn) {
        closeSubjectDetailBtn.addEventListener('click', closeSubjectDetail);
    }
    
    // Back to subjects button
    const backToSubjectsBtn = document.getElementById('backToSubjectsBtn');
    if (backToSubjectsBtn) {
        backToSubjectsBtn.addEventListener('click', backToSubjects);
    }
    
    // Subject details tab buttons
    const subjectDetailsTab = document.getElementById('subjectDetailsTab');
    const subjectContentTab = document.getElementById('subjectContentTab');
    
    if (subjectDetailsTab) {
        subjectDetailsTab.addEventListener('click', () => {
            switchSubjectDetailsTab('details');
        });
    }
    
    if (subjectContentTab) {
        subjectContentTab.addEventListener('click', () => {
            switchSubjectDetailsTab('content');
        });
    }
    
    // Add content button
    const addContentBtn = document.getElementById('addContentBtn');
    if (addContentBtn) {
        addContentBtn.addEventListener('click', () => {
            // For now, just show an alert. You can implement a modal later
            alert('Función de agregar contenido próximamente disponible');
        });
    }
    
    // Content edit form
    const contentEditForm = document.getElementById('contentEditForm');
    if (contentEditForm) {
        contentEditForm.addEventListener('submit', (e) => {
            e.preventDefault();
            saveContentEdit();
        });
    }
    
    // Modal close handlers
    setupModalHandlers('contentEditModal');
});

// Content Status Functions
let currentContentId = null;

function changeContentStatus(contentId, newStatus) {
    // Update content status
    const contentIndex = appData.contenido.findIndex(c => c.ID_contenido === contentId);
    if (contentIndex !== -1) {
        appData.contenido[contentIndex].Estado = newStatus;
        appData.contenido[contentIndex].Fecha_actualizacion = new Date().toISOString().split('T')[0];
    }
    
    // Update tema_estudiante records for this content
    const temaEstudianteRecords = appData.tema_estudiante.filter(te => te.Contenido_ID_contenido === contentId);
    temaEstudianteRecords.forEach(te => {
        te.Estado = newStatus;
        te.Fecha_actualizacion = new Date().toISOString().split('T')[0];
    });
    
    // Save data
    saveData();
    
    // Show success message
    showNotification(`Estado actualizado a: ${getStatusText(newStatus)}`, 'success');
}

function editContent(contentId) {
    const content = appData.contenido.find(c => c.ID_contenido === contentId);
    if (!content) return;
    
    currentContentId = contentId;
    
    // Populate modal with current content data
    document.getElementById('editContentTopic').value = content.Tema;
    document.getElementById('editContentDescription').value = content.Descripcion || '';
    document.getElementById('editContentStatus').value = content.Estado;
    
    // Show modal
    showModal('contentEditModal');
}

function saveContentEdit() {
    if (!currentContentId) return;
    
    const topic = document.getElementById('editContentTopic').value;
    const description = document.getElementById('editContentDescription').value;
    const status = document.getElementById('editContentStatus').value;
    
    // Update content
    const contentIndex = appData.contenido.findIndex(c => c.ID_contenido === currentContentId);
    if (contentIndex !== -1) {
        appData.contenido[contentIndex].Tema = topic;
        appData.contenido[contentIndex].Descripcion = description;
        appData.contenido[contentIndex].Estado = status;
        appData.contenido[contentIndex].Fecha_actualizacion = new Date().toISOString().split('T')[0];
    }
    
    // Update tema_estudiante records for this content
    const temaEstudianteRecords = appData.tema_estudiante.filter(te => te.Contenido_ID_contenido === currentContentId);
    temaEstudianteRecords.forEach(te => {
        te.Estado = status;
        te.Fecha_actualizacion = new Date().toISOString().split('T')[0];
    });
    
    // Save data
    saveData();
    
    // Close modal
    closeModal('contentEditModal');
    
    // Reload the content tab to show updated content
    if (window.currentSubjectId) {
        const content = appData.contenido.filter(c => c.Materia_ID_materia === window.currentSubjectId);
        loadSubjectContentTab(window.currentSubjectId, content);
    }
    
    // Show success message
    showNotification('Contenido actualizado correctamente', 'success');
    
    currentContentId = null;
}

function deleteContent(contentId) {
    const content = appData.contenido.find(c => c.ID_contenido === contentId);
    if (!content) return;
    
    if (confirm(`¿Estás seguro de que quieres eliminar el contenido "${content.Tema}"?`)) {
        // Remove content
        appData.contenido = appData.contenido.filter(c => c.ID_contenido !== contentId);
        
        // Remove related tema_estudiante records
        appData.tema_estudiante = appData.tema_estudiante.filter(te => te.Contenido_ID_contenido !== contentId);
        
        // Save data
        saveData();
        
        // Reload the content tab to show updated content
        if (window.currentSubjectId) {
            const content = appData.contenido.filter(c => c.Materia_ID_materia === window.currentSubjectId);
            loadSubjectContentTab(window.currentSubjectId, content);
        }
        
        // Show success message
        showNotification('Contenido eliminado correctamente', 'success');
    }
}


// Content Progress Functions

function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES');
}

// Export functionality
function exportSubjects() {
    const subjects = getFilteredSubjects();
    const csvContent = [
        ['Nombre', 'Curso', 'Profesor', 'Horario', 'Aula', 'Estado', 'Estudiantes'],
        ...subjects.map(subject => {
            const teacher = getTeacherById(subject.Usuarios_docente_ID_docente);
            const studentCount = getStudentCountBySubject(subject.ID_materia);
            return [
                subject.Nombre,
                subject.Curso_division,
                teacher ? `${teacher.Nombre_docente} ${teacher.Apellido_docente}` : 'N/A',
                subject.Horario || 'No especificado',
                subject.Aula || 'No especificada',
                getStatusText(subject.Estado),
                studentCount
            ];
        })
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'materias.csv';
    a.click();
    window.URL.revokeObjectURL(url);
}

// Initialize export button
document.addEventListener('DOMContentLoaded', function() {
    const exportBtn = document.getElementById('exportSubjectsBtn');
    if (exportBtn) {
        exportBtn.addEventListener('click', exportSubjects);
    }
});
