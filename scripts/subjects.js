// Subjects Management

// Función para obtener el estado a mostrar del estudiante
// Usa la columna INTENSIFICA de la base de datos
function getStudentDisplayEstado(student) {
    if (!student) return 'ACTIVO';
    
    // Verificar la columna INTENSIFICA directamente
    const esIntensifica = student.INTENSIFICA === true || student.INTENSIFICA === 1 || student.INTENSIFICA === '1';
    
    if (esIntensifica) {
        return 'INTENSIFICA';
    }
    
    // Retornar el estado tal cual si no es intensificador
    const estado = (student.Estado || '').toUpperCase();
    return estado === 'ACTIVO' ? 'ACTIVO' : (estado === 'INACTIVO' ? 'INACTIVO' : estado);
}

let currentSubjectId = null;
let isSubmitting = false; // Flag para prevenir doble submit
let subjectsInitialized = false; // Flag para prevenir múltiples inicializaciones
let subjectFormHandler = null; // Referencia al manejador del formulario
let currentThemesSubjectId = null; // Store current subject ID for themes modal

function initializeSubjects() {
    // Prevenir múltiples inicializaciones
    if (subjectsInitialized) {
        return;
    }
    const addSubjectBtn = document.getElementById('addSubjectBtn');
    const subjectModal = document.getElementById('subjectModal');
    const subjectForm = document.getElementById('subjectForm');
    const courseFilter = document.getElementById('subjectsCourseFilter');
    const statusFilter = document.getElementById('subjectsStatusFilter');
    const addContentBtn = document.getElementById('addContentBtn');
    const contentModal = document.getElementById('contentModal');
    const contentForm = document.getElementById('contentForm');

    // Helper function to setup and show modal
    function setupAndShowModal(modalId) {
        const el = document.getElementById(modalId);
        if (!el) return false;
        
        if (typeof setupModalHandlers === 'function') {
            setupModalHandlers(modalId);
        }
        
        if (typeof showModal === 'function') {
            showModal(modalId);
        } else {
            el.classList.add('active');
        }
        return true;
    }

    // Subject management (con fallback seguro)
    if (addSubjectBtn) {
        addSubjectBtn.addEventListener('click', () => {
            try {
                // Verificar que el modal existe - verificar múltiples veces si es necesario
                let modalElement = document.getElementById('subjectModal');
                
                if (!modalElement) {
                    // Try again after a short delay (in case DOM is updating)
                    setTimeout(() => {
                        modalElement = document.getElementById('subjectModal');
                        if (!modalElement) {
                            alert('Error: No se encontró el formulario de materia. Por favor, recarga la página.');
                            return;
                        }
                        // If found on retry, proceed with opening
                        setupAndShowModal('subjectModal');
                    }, 100);
                    return;
                }
                
                // Ensure modal handlers are set up (in case they were lost)
                if (typeof setupModalHandlers === 'function') {
                    setupModalHandlers('subjectModal');
                }
                
                // Abrir el modal
                if (typeof showModal === 'function') {
                    showModal('subjectModal');
                } else {
                    modalElement.classList.add('active');
                }
                
                // Reset modal title to "Add Subject"
                const modalTitle = document.querySelector('#subjectModal .modal-header h3');
                if (modalTitle) {
                    modalTitle.textContent = 'Agregar Materia';
                    modalTitle.setAttribute('data-translate', 'add_subject');
                }
                
                // Limpiar el formulario
                if (typeof clearSubjectForm === 'function') {
                    clearSubjectForm();
                } else {
                    const form = document.getElementById('subjectForm');
                    if (form) {
                        form.reset();
                    }
                    currentSubjectId = null;
                }
            } catch (e) {
                alert('Error al abrir el formulario de materia: ' + e.message);
            }
        });
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
                return;
            }
            
            saveSubject().catch(err => {
                alert(err.message || 'Error guardando la materia');
            });
        };
        
        // Agregar el listener
        subjectForm.addEventListener('submit', subjectFormHandler);
        
        // Add validation for classroom (aula) field - only allow numbers
        const classroomInput = document.getElementById('subjectClassroom');
        if (classroomInput) {
            classroomInput.addEventListener('input', function(e) {
                // Remove any non-numeric characters
                this.value = this.value.replace(/[^0-9]/g, '');
            });
            
            // Prevent paste of non-numeric content
            classroomInput.addEventListener('paste', function(e) {
                e.preventDefault();
                const pastedText = (e.clipboardData || window.clipboardData).getData('text');
                const numericOnly = pastedText.replace(/[^0-9]/g, '');
                this.value = numericOnly;
            });
        }
    }
    
    subjectsInitialized = true;

    // Content management
    if (addContentBtn) {
        addContentBtn.addEventListener('click', () => {
            // Asegurar que el campo de materia esté visible y habilitado cuando se abre desde la pestaña de contenido
            const contentSubject = document.getElementById('contentSubject');
            if (contentSubject) {
                contentSubject.style.display = '';
                const contentSubjectGroup = contentSubject.closest('.form-group');
                if (contentSubjectGroup) {
                    contentSubjectGroup.style.display = '';
                }
                if (contentSubject.options.length <= 1) {
                    populateSubjectSelect();
                }
                contentSubject.value = '';
            }
            // Actualizar el título del modal
            const modalTitle = document.querySelector('#contentModal .modal-header h3');
            if (modalTitle) {
                modalTitle.textContent = 'Agregar Contenido';
                modalTitle.setAttribute('data-translate', 'add_content');
            }
            showModal('contentModal');
            clearContentForm();
        });
    }

    if (contentForm) {
        contentForm.addEventListener('submit', (e) => {
            e.preventDefault();
            saveContentFromModal();
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

    // Schedule selector: Day buttons event listeners
    setupScheduleSelector();

    // Load initial data
    loadSubjects();
    populateSubjectSelect();
    populateCourseFilter();
    
    // Ensure correct initial view is displayed
    const gridBtn = document.getElementById('subjectsGridViewBtn');
    const listBtn = document.getElementById('subjectsListViewBtn');
    const subjectsContainer = document.getElementById('subjectsContainer');
    const subjectsList = document.getElementById('subjectsList');
    
    if (listBtn && listBtn.classList.contains('active')) {
        if (subjectsContainer) subjectsContainer.style.display = 'none';
        if (subjectsList) subjectsList.style.display = 'block';
    } else if (gridBtn && gridBtn.classList.contains('active')) {
        if (subjectsContainer) subjectsContainer.style.display = 'grid';
        if (subjectsList) subjectsList.style.display = 'none';
    } else {
        // Default to list view if no button is active
        if (listBtn) listBtn.classList.add('active');
        if (subjectsContainer) subjectsContainer.style.display = 'none';
        if (subjectsList) subjectsList.style.display = 'block';
    }
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
            <div class="card clickable-card" onclick="showSubjectThemesPanel(${subject.ID_materia})" style="cursor: pointer;">
                <div class="card-header">
                    <h3 class="card-title">${subject.Nombre}</h3>
                    <div class="card-actions" onclick="event.stopPropagation();">
                        <button class="btn-icon btn-edit" onclick="editSubject(${subject.ID_materia})" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-icon btn-create" onclick="createThemeForSubject(${subject.ID_materia})" title="Crear Tema">
                            <i class="fas fa-book-open"></i>
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
                            <span>${contentCount} temas</span>
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
                            <tr onclick="showSubjectThemesPanel(${subject.ID_materia})" class="clickable-row">
                                <td><strong>${subject.Nombre}</strong></td>
                                <td>${subject.Curso_division}</td>
                                <td>${teacher ? `${teacher.Nombre_docente} ${teacher.Apellido_docente}` : 'N/A'}</td>
                                <td>${subject.Horario || 'No especificado'}</td>
                                <td>${subject.Aula || 'No especificada'}</td>
                                <td><span class="table-status ${subject.Estado.toLowerCase()}">${getStatusText(subject.Estado)}</span></td>
                                <td>${studentCount}</td>
                                <td>
                                    <div class="table-actions" onclick="event.stopPropagation();">
                                        <button class="btn-icon btn-edit" onclick="editSubject(${subject.ID_materia})" title="Editar">
                                            <i class="fas fa-edit"></i>
                                        </button>
                                        <button class="btn-icon btn-create" onclick="createThemeForSubject(${subject.ID_materia})" title="Crear Tema">
                                            <i class="fas fa-book-open"></i>
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
	// Always use the logged-in user as the professor
	const userIdString = localStorage.getItem('userId');
	if (!userIdString) {
		alert('Error: No se encontró el ID de usuario. Por favor, inicia sesión nuevamente.');
		return;
	}
	
	const teacherId = parseInt(userIdString, 10);
	
	if (!teacherId || isNaN(teacherId) || teacherId <= 0) {
		alert('Error: ID de usuario inválido. Por favor, inicia sesión nuevamente.');
		return;
	}

	// Obtener curso y división por separado
	const courseValue = document.getElementById('subjectCourse').value;
	const divisionValue = document.getElementById('subjectDivision').value;
	
	// Combinar curso y división en el formato esperado
	const curso_division = courseValue && divisionValue 
		? `${courseValue}º Curso - División ${divisionValue}`
		: '';

	// Update schedule hidden field before submitting
	updateScheduleHiddenField();

	const classroomValue = document.getElementById('subjectClassroom').value.trim();
	const aulaNumber = classroomValue ? parseInt(classroomValue, 10) : null;
	
	// Validate aula field - must be a positive number if provided
	if (classroomValue && (isNaN(aulaNumber) || aulaNumber <= 0)) {
		alert('El campo Aula debe contener solo números positivos.');
		return;
	}

	const payload = {
		Nombre: document.getElementById('subjectName').value.trim(),
		Curso_division: curso_division,
		Usuarios_docente_ID_docente: teacherId,
		Estado: document.getElementById('subjectStatus').value,
		Horario: (document.getElementById('subjectSchedule').value || '').trim() || null,
		Aula: aulaNumber ? aulaNumber.toString() : null,
		Descripcion: (document.getElementById('subjectDescription').value || '').trim() || null
	};

	// Validación mejorada
	if (!payload.Nombre || !curso_division) {
		alert('Completá Nombre, Curso y División.');
		return;
	}
	
	// Validar que el teacherId es válido
	if (!payload.Usuarios_docente_ID_docente || payload.Usuarios_docente_ID_docente <= 0) {
		alert('Error: ID de profesor inválido. Por favor, inicia sesión nuevamente.');
		return;
	}

	// Prevenir doble submit
	if (isSubmitting) {
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
			const res = await fetch('../api/materia.php', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
				credentials: 'include',
				body: JSON.stringify(payload)
			});
			
			let data = {};
			const text = await res.text();
			try {
				data = JSON.parse(text);
			} catch (e) {
				throw new Error(`Error del servidor (${res.status})`);
			}
			
			if (!res.ok) {
				const errorMsg = data.error ? `${data.message || 'Error'}: ${data.error}` : (data.message || 'No se pudo crear la materia');
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
		const errorMsg = err.message || 'Error al guardar la materia';
		alert(`Error: ${errorMsg}`);
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


// Función helper para parsear curso_division y extraer curso y división
function parseCourseDivision(cursoDivision) {
    if (!cursoDivision) return { course: '', division: '' };
    
    // Intentar diferentes formatos: "10º Curso - División A", "10 - A", "10º-A", etc.
    // Buscar el número del curso (puede estar al inicio)
    const courseMatch = cursoDivision.match(/(\d+)/);
    const course = courseMatch ? courseMatch[1] : '';
    
    // Buscar la letra de la división (A-F, puede estar después de "División", "Div", o al final)
    const divisionMatch = cursoDivision.match(/(?:División|Div)[\s-]*([A-F])/i) || 
                          cursoDivision.match(/[\s-]([A-F])[\s-]*$/i) ||
                          cursoDivision.match(/([A-F])[\s-]*$/i);
    const division = divisionMatch ? divisionMatch[1].toUpperCase() : '';
    
    return { course, division };
}

window.editSubject = async function(id) {
    try {
        // Ensure appData is loaded
        if (!appData || !appData.materia || !Array.isArray(appData.materia)) {
            console.log('appData not loaded, loading data...');
            if (typeof loadData === 'function') {
                await loadData();
            }
        }

        // Use getSubjectById helper which handles type conversion properly
        let subject = null;
        if (typeof getSubjectById === 'function') {
            subject = getSubjectById(id);
        } else {
            // Fallback: direct search with type conversion
            const subjectId = parseInt(id, 10);
            subject = (appData.materia || []).find(s => parseInt(s.ID_materia, 10) === subjectId);
        }

        // If still not found, try fetching from API as fallback
        if (!subject) {
            console.log('Subject not found in appData, fetching from API...');
            try {
                const isInPages = window.location.pathname.includes('/pages/');
                const baseUrl = isInPages ? '../api' : 'api';
                const response = await fetch(`${baseUrl}/materia.php?id=${id}`, {
                    method: 'GET',
                    credentials: 'include',
                    headers: { 'Accept': 'application/json' }
                });
                
                if (response.ok) {
                    const data = await response.json();
                    // API returns the subject object directly when fetching by ID
                    if (data && (data.ID_materia || data.id_materia)) {
                        subject = data;
                        // Normalize ID field name
                        if (!subject.ID_materia && subject.id_materia) {
                            subject.ID_materia = subject.id_materia;
                        }
                        // Add to appData for future use
                        if (appData && appData.materia) {
                            const existingIndex = appData.materia.findIndex(s => parseInt(s.ID_materia, 10) === parseInt(id, 10));
                            if (existingIndex >= 0) {
                                appData.materia[existingIndex] = subject;
                            } else {
                                appData.materia.push(subject);
                            }
                        }
                    }
                } else {
                    console.warn('API returned error status:', response.status);
                }
            } catch (apiError) {
                console.error('Error fetching subject from API:', apiError);
            }
        }

        if (!subject) {
            console.error('Subject not found:', id);
            alert('No se pudo encontrar la materia. Por favor, recarga la página.');
            return;
        }

        currentSubjectId = parseInt(id, 10);
        
        // Populate form fields safely
        const subjectNameEl = document.getElementById('subjectName');
        if (subjectNameEl) {
            subjectNameEl.value = subject.Nombre || '';
        }
        
        // Parsear curso_division para separar curso y división
        const { course, division } = parseCourseDivision(subject.Curso_division);
        const courseSelect = document.getElementById('subjectCourse');
        const divisionSelect = document.getElementById('subjectDivision');
        
        if (courseSelect && course) {
            courseSelect.value = course;
        }
        if (divisionSelect && division) {
            divisionSelect.value = division;
        }
        
        const subjectDescriptionEl = document.getElementById('subjectDescription');
        if (subjectDescriptionEl) {
            subjectDescriptionEl.value = subject.Descripcion || '';
        }
        
        const subjectClassroomEl = document.getElementById('subjectClassroom');
        if (subjectClassroomEl) {
            subjectClassroomEl.value = subject.Aula || '';
        }
        
        // Note: Teacher is always the logged-in user, so we don't set it in edit mode
        const subjectStatusEl = document.getElementById('subjectStatus');
        if (subjectStatusEl) {
            subjectStatusEl.value = subject.Estado || '';
        }

        // Populate schedule selector
        if (subject.Horario) {
            if (typeof populateScheduleSelector === 'function') {
                populateScheduleSelector(subject.Horario);
            }
        } else {
            if (typeof resetScheduleSelector === 'function') {
                resetScheduleSelector();
            }
        }

        // Update modal title to indicate edit mode
        const modalTitle = document.querySelector('#subjectModal .modal-header h3');
        if (modalTitle) {
            modalTitle.textContent = 'Editar Materia';
            modalTitle.setAttribute('data-translate', 'edit_subject');
        }

        // Show the modal
        if (typeof showModal === 'function') {
            showModal('subjectModal');
        } else {
            const modal = document.getElementById('subjectModal');
            if (modal) {
                modal.style.display = '';
                modal.classList.add('active');
                if (typeof setupModalHandlers === 'function') {
                    setupModalHandlers('subjectModal');
                }
            }
        }
    } catch (error) {
        console.error('Error in editSubject:', error);
        alert('Error al abrir el formulario de edición. Por favor, intente nuevamente.');
    }
}


// Función para mostrar el formulario de crear tema en el modal unificado
window.showCreateThemeForm = function(subjectId) {
    if (!subjectId) {
        subjectId = currentThemesSubjectId;
    }
    
    if (!subjectId) {
        alert('Error: ID de materia no válido');
        return;
    }
    
    const subject = getSubjectById(subjectId);
    if (!subject) {
        alert('Error: No se encontró la materia seleccionada');
        return;
    }
    
    // Store current subject ID
    currentThemesSubjectId = subjectId;
    
    // Update modal title
    const modalTitle = document.getElementById('selectedSubjectName');
    if (modalTitle) {
        modalTitle.textContent = subject.Nombre;
    }
    
    // Show form view, hide list view
    const themesListView = document.getElementById('themesListView');
    const createThemeFormView = document.getElementById('createThemeFormView');
    if (themesListView) themesListView.style.display = 'none';
    if (createThemeFormView) createThemeFormView.style.display = 'block';
    
    // Reset form
    const unifiedForm = document.getElementById('unifiedContentForm');
    if (unifiedForm) {
        unifiedForm.reset();
    }
    
    // Set subject ID in hidden field
    const unifiedSubjectId = document.getElementById('unifiedContentSubjectId');
    if (unifiedSubjectId) {
        unifiedSubjectId.value = subjectId;
    }
    
    // Set default status
    const unifiedStatus = document.getElementById('unifiedContentStatus');
    if (unifiedStatus) {
        unifiedStatus.value = 'PENDIENTE';
    }
    
    // Show modal if not already visible
    const modal = document.getElementById('subjectThemesModal');
    if (modal && !modal.classList.contains('active')) {
        if (typeof showModal === 'function') {
            showModal('subjectThemesModal');
        } else {
            modal.classList.add('active');
            if (typeof setupModalHandlers === 'function') {
                setupModalHandlers('subjectThemesModal');
            }
        }
    }
    
    // Setup event handlers
    setupUnifiedThemesModalHandlers();
};

// Función para crear tema desde las acciones de materias (mantiene compatibilidad)
window.createThemeForSubject = function(subjectId) {
    // If modal is already open, just show the form
    const modal = document.getElementById('subjectThemesModal');
    if (modal && modal.classList.contains('active')) {
        showCreateThemeForm(subjectId);
    } else {
        // Otherwise, open the modal with themes list first, then show form
        showSubjectThemesPanel(subjectId);
        // Small delay to ensure modal is rendered
        setTimeout(() => {
            showCreateThemeForm(subjectId);
        }, 100);
    }
};

// Función para volver a la lista de temas
window.backToThemesList = function() {
    if (!currentThemesSubjectId) {
        return;
    }
    
    // Show list view, hide form view
    const themesListView = document.getElementById('themesListView');
    const createThemeFormView = document.getElementById('createThemeFormView');
    if (themesListView) themesListView.style.display = 'block';
    if (createThemeFormView) createThemeFormView.style.display = 'none';
    
    // Reload themes list
    showSubjectThemesPanel(currentThemesSubjectId);
};

// Setup event handlers for unified themes modal
function setupUnifiedThemesModalHandlers() {
    // Show create form button
    const showCreateBtn = document.getElementById('showCreateThemeFormBtn');
    if (showCreateBtn) {
        showCreateBtn.onclick = function() {
            if (currentThemesSubjectId) {
                showCreateThemeForm(currentThemesSubjectId);
            }
        };
    }
    
    // Back to list button
    const backBtn = document.getElementById('backToThemesListBtn');
    if (backBtn) {
        backBtn.onclick = backToThemesList;
    }
    
    // Cancel button
    const cancelBtn = document.getElementById('cancelCreateThemeBtn');
    if (cancelBtn) {
        cancelBtn.onclick = backToThemesList;
    }
    
    // Form submit handler
    const unifiedForm = document.getElementById('unifiedContentForm');
    if (unifiedForm) {
        unifiedForm.onsubmit = function(e) {
            e.preventDefault();
            saveUnifiedContent();
        };
    }
}

// Función para guardar contenido desde el formulario unificado
async function saveUnifiedContent() {
    const unifiedSubjectId = document.getElementById('unifiedContentSubjectId');
    const unifiedTopic = document.getElementById('unifiedContentTopic');
    const unifiedDescription = document.getElementById('unifiedContentDescription');
    const unifiedStatus = document.getElementById('unifiedContentStatus');
    
    if (!unifiedSubjectId || !unifiedTopic) {
        alert('Error: No se encontraron los campos del formulario');
        return;
    }
    
    const subjectId = parseInt(unifiedSubjectId.value);
    const topic = unifiedTopic.value.trim();
    const description = unifiedDescription ? unifiedDescription.value.trim() : '';
    const status = unifiedStatus ? unifiedStatus.value : 'PENDIENTE';
    
    if (!subjectId || subjectId <= 0) {
        alert('Error: ID de materia no válido');
        return;
    }
    
    if (!topic) {
        alert('El tema es obligatorio');
        return;
    }
    
    const payload = {
        Tema: topic,
        Descripcion: description || null,
        Estado: status || 'PENDIENTE',
        Materia_ID_materia: subjectId
    };
    
    try {
        const res = await fetch('../api/contenido.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(payload)
        });
        
        let data = {};
        const text = await res.text();
        try {
            data = JSON.parse(text);
        } catch (e) {
            throw new Error(`Error del servidor (${res.status})`);
        }
        
        if (!res.ok) {
            const errorMsg = data.error ? `${data.message || 'Error'}: ${data.error}` : (data.message || 'No se pudo crear el tema');
            throw new Error(errorMsg);
        }
        
        // Reload data from backend
        if (typeof loadData === 'function') await loadData();
        
        // Reload themes list and go back to list view
        if (currentThemesSubjectId) {
            showSubjectThemesPanel(currentThemesSubjectId);
        }
        
        // Show success message
        if (typeof showNotification === 'function') {
            showNotification('Tema creado correctamente', 'success');
        } else {
            alert('Tema creado correctamente');
        }
    } catch (err) {
        alert('Error: ' + (err.message || 'No se pudo crear el tema'));
    }
}

// Función para mostrar el modal de temas de una materia
window.showSubjectThemesPanel = function(subjectId) {
    const subject = getSubjectById(subjectId);
    if (!subject) {
        console.error('Materia no encontrada para ID:', subjectId);
        return;
    }
    
    // Store current subject ID
    currentThemesSubjectId = subjectId;
    
    // Obtener los temas de esta materia
    if (!appData.contenido || !Array.isArray(appData.contenido)) {
        appData.contenido = [];
    }
    
    const themes = appData.contenido
        .filter(c => parseInt(c.Materia_ID_materia) === parseInt(subjectId))
        .sort((a, b) => {
            // Ordenar por fecha de creación (más reciente primero)
            const dateA = a.Fecha_creacion ? new Date(a.Fecha_creacion) : new Date(0);
            const dateB = b.Fecha_creacion ? new Date(b.Fecha_creacion) : new Date(0);
            return dateB - dateA;
        });
    
    // Actualizar el modal
    const modal = document.getElementById('subjectThemesModal');
    if (!modal) {
        console.error('No se encontró el modal subjectThemesModal');
        return;
    }
    
    // Actualizar título
    const modalTitle = document.getElementById('selectedSubjectName');
    if (modalTitle) {
        modalTitle.textContent = subject.Nombre;
    }
    
    // Show list view, hide form view
    const themesListView = document.getElementById('themesListView');
    const createThemeFormView = document.getElementById('createThemeFormView');
    if (themesListView) themesListView.style.display = 'block';
    if (createThemeFormView) createThemeFormView.style.display = 'none';
    
    // Ensure tema_estudiante array exists
    if (!appData.tema_estudiante || !Array.isArray(appData.tema_estudiante)) {
        appData.tema_estudiante = [];
    }
    
    // Ensure estudiante array exists
    if (!appData.estudiante || !Array.isArray(appData.estudiante)) {
        appData.estudiante = [];
    }
    
    // Mostrar lista de temas
    const themesList = document.getElementById('subjectThemesList');
    if (themesList) {
        if (themes.length > 0) {
            themesList.innerHTML = themes.map(theme => {
                // Get students assigned to this tema (contenido)
                const temaEstudianteRecords = appData.tema_estudiante.filter(
                    te => parseInt(te.Contenido_ID_contenido) === parseInt(theme.ID_contenido)
                );
                
                // Get student details for each tema_estudiante record
                const assignedStudents = temaEstudianteRecords.map(te => {
                    const student = appData.estudiante.find(
                        e => parseInt(e.ID_Estudiante) === parseInt(te.Estudiante_ID_Estudiante)
                    );
                    return student ? { ...te, student } : null;
                }).filter(Boolean);
                
                const uniqueId = `theme-${theme.ID_contenido}`;
                const studentsCount = assignedStudents.length;
                
                return `
                    <div class="theme-card-collapsible" style="margin-bottom: 12px; border: 1px solid var(--border-color); border-radius: 8px; background: var(--card-bg); overflow: hidden; transition: all 0.3s ease;">
                        <div class="theme-card-header" onclick="toggleThemeCard('${uniqueId}')" style="padding: 14px 16px; cursor: pointer; display: flex; justify-content: space-between; align-items: center; background: var(--bg-secondary); transition: background 0.2s ease;">
                            <div style="flex: 1; display: flex; align-items: center; gap: 12px;">
                                <i class="fas fa-chevron-down theme-chevron" id="chevron-${uniqueId}" style="font-size: 0.85em; color: var(--text-secondary); transition: transform 0.3s ease; transform: rotate(-90deg);"></i>
                                <div style="flex: 1;">
                                    <strong style="display: block; margin-bottom: 4px; color: var(--text-primary); font-size: 1em;">${theme.Tema || 'Sin título'}</strong>
                                    <div style="display: flex; gap: 12px; align-items: center; flex-wrap: wrap;">
                                        <span class="status-badge status-${(theme.Estado || 'PENDIENTE').toLowerCase()}" style="font-size: 0.8em; padding: 3px 8px; border-radius: 10px;">
                                            ${getStatusText(theme.Estado || 'PENDIENTE')}
                                        </span>
                                        <span style="font-size: 0.85em; color: var(--text-secondary);">
                                            <i class="fas fa-users" style="margin-right: 4px;"></i>${studentsCount} estudiante${studentsCount !== 1 ? 's' : ''}
                                        </span>
                                        ${theme.Fecha_creacion ? `<small style="color: var(--text-secondary); font-size: 0.8em;">Creado: ${new Date(theme.Fecha_creacion).toLocaleDateString('es-ES')}</small>` : ''}
                                    </div>
                                </div>
                            </div>
                            <div style="display: flex; gap: 5px;" onclick="event.stopPropagation();">
                                <button class="btn-icon btn-edit" onclick="editContent(${theme.ID_contenido})" title="Editar Tema" style="padding: 6px 8px;">
                                    <i class="fas fa-edit" style="font-size: 0.9em;"></i>
                                </button>
                                <button class="btn-icon btn-delete" onclick="deleteContent(${theme.ID_contenido})" title="Eliminar Tema" style="padding: 6px 8px;">
                                    <i class="fas fa-trash" style="font-size: 0.9em;"></i>
                                </button>
                            </div>
                        </div>
                        <div class="theme-card-content" id="${uniqueId}" style="max-height: 0; overflow: hidden; transition: max-height 0.3s ease;">
                            <div style="padding: 16px; border-top: 1px solid var(--border-color); background: var(--card-bg);">
                                ${theme.Descripcion ? `<div style="font-size: 0.9em; color: var(--text-secondary); margin-bottom: 12px; padding-bottom: 12px; border-bottom: 1px solid var(--border-color);">${theme.Descripcion}</div>` : ''}
                                <div style="margin-top: ${theme.Descripcion ? '0' : '0'}">
                                    <div style="font-size: 0.9em; font-weight: 600; color: var(--text-primary); margin-bottom: 10px; display: flex; align-items: center; gap: 6px;">
                                        <i class="fas fa-user-graduate" style="color: #667eea;"></i>
                                        Estudiantes Asignados (${studentsCount})
                                    </div>
                                    ${assignedStudents.length > 0 ? `
                                        <div style="display: flex; flex-direction: column; gap: 8px;">
                                            ${assignedStudents.map(te => `
                                                <div class="student-assignment-card" style="display: flex; align-items: center; justify-content: space-between; padding: 10px 12px; background: var(--bg-secondary); border-radius: 6px; border-left: 3px solid #667eea;">
                                                    <div style="flex: 1;">
                                                        <div style="font-weight: 500; color: var(--text-primary); margin-bottom: 4px;">
                                                            ${te.student.Nombre} ${te.student.Apellido}
                                                        </div>
                                                        <div style="display: flex; gap: 10px; align-items: center;">
                                                            <span class="status-badge status-${(te.Estado || 'PENDIENTE').toLowerCase()}" style="font-size: 0.75em; padding: 2px 8px; border-radius: 8px;">
                                                                ${getStatusText(te.Estado || 'PENDIENTE')}
                                                            </span>
                                                            ${te.Fecha_actualizacion ? `<small style="color: var(--text-secondary); font-size: 0.75em;">Actualizado: ${new Date(te.Fecha_actualizacion).toLocaleDateString('es-ES')}</small>` : ''}
                                                        </div>
                                                        ${te.Observaciones ? `<div style="font-size: 0.8em; color: var(--text-secondary); margin-top: 4px; font-style: italic;">${te.Observaciones}</div>` : ''}
                                                    </div>
                                                </div>
                                            `).join('')}
                                        </div>
                                    ` : `
                                        <div style="text-align: center; padding: 20px; color: var(--text-secondary); font-size: 0.9em;">
                                            <i class="fas fa-user-slash" style="font-size: 1.5em; margin-bottom: 8px; opacity: 0.5;"></i>
                                            <p style="margin: 0;">No hay estudiantes asignados a este tema</p>
                                        </div>
                                    `}
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');
            
            // After rendering, setup click handlers for collapsible cards
            setupCollapsibleThemeCards();
        } else {
            themesList.innerHTML = `
                <div style="text-align: center; padding: 40px 20px; color: var(--text-secondary, #999);">
                    <i class="fas fa-book-open" style="font-size: 2.5em; margin-bottom: 15px; opacity: 0.3;"></i>
                    <p>No hay temas registrados para esta materia</p>
                    <button class="btn-primary" onclick="showCreateThemeForm(${subjectId})" style="margin-top: 15px;">
                        <i class="fas fa-plus"></i> Crear Primer Tema
                    </button>
                </div>
            `;
        }
    }
    
    // Mostrar el modal usando la función showModal
    if (typeof showModal === 'function') {
        showModal('subjectThemesModal');
    } else {
        // Fallback si showModal no está disponible
        modal.classList.add('active');
        if (typeof setupModalHandlers === 'function') {
            setupModalHandlers('subjectThemesModal');
        }
    }
    
    // Setup event handlers for the modal buttons
    setupUnifiedThemesModalHandlers();
};

// Function to toggle collapsible theme cards
window.toggleThemeCard = function(uniqueId) {
    const content = document.getElementById(uniqueId);
    const chevron = document.getElementById(`chevron-${uniqueId}`);
    
    if (!content) return;
    
    // Check if currently expanded
    const isExpanded = content.classList.contains('expanded');
    
    if (isExpanded) {
        // Collapse
        content.style.maxHeight = '0px';
        content.classList.remove('expanded');
        if (chevron) {
            chevron.style.transform = 'rotate(-90deg)';
        }
    } else {
        // Expand - temporarily set to auto to measure, then animate
        const currentMaxHeight = content.style.maxHeight;
        content.style.maxHeight = 'none';
        const scrollHeight = content.scrollHeight;
        content.style.maxHeight = currentMaxHeight;
        
        // Force reflow
        content.offsetHeight;
        
        // Now animate to full height
        content.style.maxHeight = scrollHeight + 'px';
        content.classList.add('expanded');
        if (chevron) {
            chevron.style.transform = 'rotate(0deg)';
        }
        
        // After animation completes, set to none for dynamic content
        setTimeout(() => {
            if (content.classList.contains('expanded')) {
                content.style.maxHeight = 'none';
            }
        }, 300);
    }
};

// Function to setup collapsible theme cards (initialize state)
function setupCollapsibleThemeCards() {
    // All cards start collapsed by default
    const themeCards = document.querySelectorAll('.theme-card-content');
    themeCards.forEach(card => {
        card.style.maxHeight = '0px';
        card.classList.remove('expanded');
    });
}

// Función para cerrar el modal de temas (disponible globalmente)
window.closeSubjectThemesPanel = function() {
    const modal = document.getElementById('subjectThemesModal');
    if (modal) {
        if (typeof closeModal === 'function') {
            closeModal(modal);
        } else {
            modal.classList.remove('active');
        }
    }
};

window.deleteSubject = async function(id) {
    if (!confirm('¿Estás seguro de que quieres eliminar esta materia?')) {
        return;
    }
    
    try {
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
        alert(err.message || 'Error al eliminar la materia');
    }
}


function clearSubjectForm() {
    const form = document.getElementById('subjectForm');
    if (form) {
        form.reset();
    }
    // Reset schedule selector
    resetScheduleSelector();
    currentSubjectId = null;
    
    // Reset modal title to "Add Subject"
    const modalTitle = document.querySelector('#subjectModal .modal-header h3');
    if (modalTitle) {
        modalTitle.textContent = 'Agregar Materia';
        modalTitle.setAttribute('data-translate', 'add_subject');
    }
}

// Schedule Selector Functions
let selectedDaysList = []; // Array to store selected days

function setupScheduleSelector() {
    // Add day button event listener
    const addDayBtn = document.getElementById('addDayBtn');
    if (addDayBtn) {
        addDayBtn.addEventListener('click', addSelectedDay);
    }

    // Time selectors event listeners
    const startHourSelect = document.getElementById('subjectScheduleHour');
    const endHourSelect = document.getElementById('subjectScheduleEndHour');
    
    if (startHourSelect) {
        startHourSelect.addEventListener('change', updateScheduleHiddenField);
    }
    if (endHourSelect) {
        endHourSelect.addEventListener('change', updateScheduleHiddenField);
    }
}

function addSelectedDay() {
    const daySelect = document.getElementById('subjectScheduleDays');
    if (!daySelect || !daySelect.value) {
        return; // No day selected
    }

    const selectedDay = daySelect.value.toLowerCase();
    
    // Check if day is already selected
    if (selectedDaysList.includes(selectedDay)) {
        return; // Already added
    }

    // Add to selected days list
    selectedDaysList.push(selectedDay);
    
    // Render selected days
    renderSelectedDays();
    
    // Update schedule
    updateScheduleHiddenField();
    
    // Reset dropdown to first option
    daySelect.value = '';
}

function removeSelectedDay(dayToRemove) {
    selectedDaysList = selectedDaysList.filter(day => day !== dayToRemove);
    renderSelectedDays();
    updateScheduleHiddenField();
}

function renderSelectedDays() {
    const container = document.getElementById('selectedDaysContainer');
    if (!container) return;

    if (selectedDaysList.length === 0) {
        container.innerHTML = '';
        return;
    }

    container.innerHTML = selectedDaysList.map(day => {
        const dayName = day.charAt(0).toUpperCase() + day.slice(1);
        return `
            <div class="day-chip" data-day="${day}">
                <span>${dayName}</span>
                <button type="button" class="remove-day-btn" data-day="${day}" title="Eliminar ${dayName}">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
    }).join('');
    
    // Attach event listeners to remove buttons
    container.querySelectorAll('.remove-day-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const dayToRemove = this.getAttribute('data-day');
            removeSelectedDay(dayToRemove);
        });
    });
}

function updateScheduleHiddenField() {
    // Get selected days (capitalize first letter)
    const selectedDays = selectedDaysList.map(day => 
        day.charAt(0).toUpperCase() + day.slice(1)
    );

    // Get time values
    const startHour = document.getElementById('subjectScheduleHour')?.value || '';
    const endHour = document.getElementById('subjectScheduleEndHour')?.value || '';

    // Build schedule string
    let scheduleString = '';
    
    if (selectedDays.length > 0) {
        scheduleString = selectedDays.join(', ');
    }
    
    if (startHour && endHour) {
        if (scheduleString) {
            scheduleString += ` ${startHour}-${endHour}`;
        } else {
            scheduleString = `${startHour}-${endHour}`;
        }
    } else if (startHour) {
        if (scheduleString) {
            scheduleString += ` ${startHour}`;
        } else {
            scheduleString = startHour;
        }
    }

    // Update hidden field
    const hiddenField = document.getElementById('subjectSchedule');
    if (hiddenField) {
        hiddenField.value = scheduleString || '';
    }
}

function resetScheduleSelector() {
    // Clear selected days list
    selectedDaysList = [];
    
    // Clear day select dropdown
    const daySelect = document.getElementById('subjectScheduleDays');
    if (daySelect) {
        daySelect.value = '';
    }
    
    // Clear selected days display
    renderSelectedDays();

    // Reset time selects
    const startHourSelect = document.getElementById('subjectScheduleHour');
    const endHourSelect = document.getElementById('subjectScheduleEndHour');
    
    if (startHourSelect) startHourSelect.value = '';
    if (endHourSelect) endHourSelect.value = '';
    
    // Clear hidden field
    const hiddenField = document.getElementById('subjectSchedule');
    if (hiddenField) hiddenField.value = '';
}

function parseScheduleString(scheduleString) {
    if (!scheduleString) {
        return { days: [], startHour: '', endHour: '' };
    }

    const lowerSchedule = scheduleString.toLowerCase();
    const days = [];
    const dayNames = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'];

    // Extract days
    dayNames.forEach(day => {
        if (lowerSchedule.includes(day)) {
            days.push(day);
        }
    });

    // Extract time range (format: HH:MM-HH:MM or just HH:MM)
    const timeRegex = /(\d{1,2}:\d{2})(?:\s*-\s*(\d{1,2}:\d{2}))?/;
    const timeMatch = scheduleString.match(timeRegex);
    
    let startHour = '';
    let endHour = '';
    
    if (timeMatch) {
        startHour = timeMatch[1];
        endHour = timeMatch[2] || '';
    }

    return { days, startHour, endHour };
}

function populateScheduleSelector(scheduleString) {
    const { days, startHour, endHour } = parseScheduleString(scheduleString);

    // Populate selected days list
    selectedDaysList = [...days];
    
    // Render selected days
    renderSelectedDays();

    // Set time selects
    const startHourSelect = document.getElementById('subjectScheduleHour');
    const endHourSelect = document.getElementById('subjectScheduleEndHour');
    
    if (startHourSelect && startHour) {
        startHourSelect.value = startHour;
    }
    if (endHourSelect && endHour) {
        endHourSelect.value = endHour;
    }

    // Update hidden field
    updateScheduleHiddenField();
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
        const teacherId = parseInt(currentUserId, 10);
        subjects = subjects.filter(subject => {
            // Ensure both values are integers for comparison
            const subjectTeacherId = parseInt(subject.Usuarios_docente_ID_docente, 10);
            return subjectTeacherId === teacherId;
        });
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
    if (!appData || !appData.usuarios_docente || !Array.isArray(appData.usuarios_docente)) {
        return null;
    }
    const id = parseInt(teacherId, 10);
    return appData.usuarios_docente.find(t => parseInt(t.ID_docente, 10) === id);
}

function getSubjectById(subjectId) {
    if (!appData || !appData.materia || !Array.isArray(appData.materia)) {
        console.error('appData.materia is not available or is not an array');
        return null;
    }
    // Convert both to numbers for proper comparison
    const id = parseInt(subjectId, 10);
    return appData.materia.find(s => parseInt(s.ID_materia, 10) === id);
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
    const teacherId = parseInt(currentUserId, 10);
    const userSubjects = appData.materia.filter(subject => {
        const subjectTeacherId = parseInt(subject.Usuarios_docente_ID_docente, 10);
        return subjectTeacherId === teacherId;
    });

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

// populateTeacherSelect() function removed - professor is now always the logged-in user

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

async function viewSubjectDetails(subjectId) {
    // Store the current subject ID for the details view
    window.currentSubjectId = subjectId;
    
    // Ensure data is loaded before showing details
    if (!appData || !appData.materia || !Array.isArray(appData.materia)) {
        console.log('Data not loaded, attempting to load...');
        if (typeof loadData === 'function') {
            await loadData();
        }
    }
    
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
    // Ensure appData is loaded
    if (!appData || typeof appData !== 'object') {
        console.error('appData is not loaded');
        alert('Error: Los datos no están cargados. Por favor, recarga la página.');
        return;
    }

    const subject = getSubjectById(subjectId);
    if (!subject) {
        console.error(`Subject with ID ${subjectId} not found`);
        alert(`Error: No se encontró la materia con ID ${subjectId}.`);
        return;
    }

    // Ensure required arrays exist
    if (!Array.isArray(appData.alumnos_x_materia)) appData.alumnos_x_materia = [];
    if (!Array.isArray(appData.estudiante)) appData.estudiante = [];
    if (!Array.isArray(appData.evaluacion)) appData.evaluacion = [];
    if (!Array.isArray(appData.contenido)) appData.contenido = [];

    const teacher = getTeacherById(subject.Usuarios_docente_ID_docente);
    const enrolledStudents = appData.alumnos_x_materia.filter(axm => axm.Materia_ID_materia === subjectId);
    const students = enrolledStudents.map(axm => 
        appData.estudiante.find(e => e.ID_Estudiante === axm.Estudiante_ID_Estudiante)
    ).filter(Boolean);
    
    const evaluations = appData.evaluacion.filter(e => e.Materia_ID_materia === subjectId);
    const content = appData.contenido.filter(c => c.Materia_ID_materia === subjectId);

    // Update title
    const titleElement = document.getElementById('subjectDetailsTitle');
    if (titleElement) {
        titleElement.textContent = subject.Nombre;
    }

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
                                    <span class="student-status">${getStudentDisplayEstado(student) || 'Activo'}</span>
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
        return;
    }
    
    // Ensure tema_estudiante array exists
    if (!Array.isArray(appData.tema_estudiante)) {
        appData.tema_estudiante = [];
    }
    
    // Get enrolled students for this subject
    const enrolledStudents = appData.alumnos_x_materia.filter(axm => axm.Materia_ID_materia === subjectId);
    const students = enrolledStudents.map(axm => 
        appData.estudiante.find(e => e.ID_Estudiante === axm.Estudiante_ID_Estudiante)
    ).filter(Boolean);
    
    if (content.length > 0) {
        contentListContainer.innerHTML = content.map(item => {
            // Get students assigned to this contenido for recuperatorios
            const assignedStudents = appData.tema_estudiante
                .filter(te => te.Contenido_ID_contenido === item.ID_contenido)
                .map(te => {
                    const student = appData.estudiante.find(e => e.ID_Estudiante === te.Estudiante_ID_Estudiante);
                    return student ? { ...te, student } : null;
                })
                .filter(Boolean);
            
            return `
            <div class="content-item">
                <div class="content-info">
                    <span class="content-topic">${item.Tema}</span>
                    <span class="content-description">${item.Descripcion || 'Sin descripción'}</span>
                    ${assignedStudents.length > 0 ? `
                        <div class="assigned-students-list" style="margin-top: 10px;">
                            <strong style="font-size: 0.9em; color: #666;">Estudiantes asignados para recuperatorio (${assignedStudents.length}):</strong>
                            <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-top: 8px;">
                                ${assignedStudents.map(te => `
                                    <span class="student-assignment-badge" style="display: inline-flex; align-items: center; gap: 5px; padding: 4px 10px; background: #e3f2fd; border-radius: 12px; font-size: 0.85em;">
                                        <span>${te.student.Nombre} ${te.student.Apellido}</span>
                                        <span class="status-badge status-${te.Estado.toLowerCase()}" style="font-size: 0.8em; padding: 2px 6px;">${getStatusText(te.Estado)}</span>
                                        <button class="btn-icon-small" onclick="removeStudentFromContent(${te.ID_Tema_estudiante}, ${item.ID_contenido})" title="Quitar asignación" style="margin-left: 5px; padding: 2px 4px; border: none; background: transparent; cursor: pointer; color: #666;">
                                            <i class="fas fa-times"></i>
                                        </button>
                                    </span>
                                `).join('')}
                            </div>
                        </div>
                    ` : `
                        <div style="margin-top: 10px; font-size: 0.9em; color: #999;">No hay estudiantes asignados</div>
                    `}
                </div>
                <div class="content-actions">
                    <select class="content-status-selector" onchange="changeContentStatus(${item.ID_contenido}, this.value)" title="Cambiar Estado">
                        <option value="PENDIENTE" ${item.Estado === 'PENDIENTE' ? 'selected' : ''}>Pendiente</option>
                        <option value="EN_PROGRESO" ${item.Estado === 'EN_PROGRESO' ? 'selected' : ''}>En Progreso</option>
                        <option value="COMPLETADO" ${item.Estado === 'COMPLETADO' ? 'selected' : ''}>Completado</option>
                        <option value="CANCELADO" ${item.Estado === 'CANCELADO' ? 'selected' : ''}>Cancelado</option>
                    </select>
                    <div class="content-action-buttons">
                        <button class="btn-icon btn-secondary" onclick="assignStudentsToContent(${item.ID_contenido}, ${subjectId})" title="Asignar Estudiantes para Recuperatorio">
                            <i class="fas fa-user-plus"></i>
                        </button>
                        <button class="btn-icon btn-edit" onclick="editContent(${item.ID_contenido})" title="Editar Contenido">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-icon btn-delete" onclick="deleteContent(${item.ID_contenido})" title="Eliminar Contenido">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
        }).join('');
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
            <span class="student-status">${getStudentDisplayEstado(student)}</span>
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
    
    // Add content button - use contentEditModal for both add and edit
    const addContentBtn = document.getElementById('addContentBtn');
    if (addContentBtn) {
        addContentBtn.addEventListener('click', () => {
            if (!window.currentSubjectId) {
                alert('Por favor, selecciona una materia primero');
                return;
            }
            // Reset to add mode
            currentContentId = null;
            clearContentForm();
            // Update modal title
            const modalTitle = document.querySelector('#contentEditModal .modal-header h3');
            if (modalTitle) {
                modalTitle.textContent = 'Agregar Contenido';
                const translateAttr = modalTitle.getAttribute('data-translate');
                if (translateAttr) {
                    // Restore translation attribute if needed
                    modalTitle.setAttribute('data-translate', 'add_content');
                }
            }
            showModal('contentEditModal');
        });
    }
    
    // Content edit form - handles both add and edit
    const contentEditForm = document.getElementById('contentEditForm');
    if (contentEditForm) {
        contentEditForm.addEventListener('submit', (e) => {
            e.preventDefault();
            if (currentContentId) {
                saveContentEdit();
            } else {
                saveContent();
            }
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

function clearContentForm() {
    // Limpiar campos del modal de contenido (contentModal)
    const contentTopic = document.getElementById('contentTopic');
    const contentDescription = document.getElementById('contentDescription');
    const contentStatus = document.getElementById('contentStatus');
    
    if (contentTopic) contentTopic.value = '';
    if (contentDescription) contentDescription.value = '';
    if (contentStatus) contentStatus.value = 'PENDIENTE';
    
    // Limpiar campos del modal de edición de contenido (contentEditModal)
    const editContentTopic = document.getElementById('editContentTopic');
    const editContentDescription = document.getElementById('editContentDescription');
    const editContentStatus = document.getElementById('editContentStatus');
    
    if (editContentTopic) editContentTopic.value = '';
    if (editContentDescription) editContentDescription.value = '';
    if (editContentStatus) editContentStatus.value = 'PENDIENTE';
}

// Función para guardar contenido desde el modal de contenido (contenidoModal)
async function saveContentFromModal() {
    const contentSubject = document.getElementById('contentSubject');
    const contentTopic = document.getElementById('contentTopic');
    const contentDescription = document.getElementById('contentDescription');
    const contentStatus = document.getElementById('contentStatus');
    
    if (!contentSubject || !contentTopic) {
        alert('Error: No se encontraron los campos del formulario');
        return;
    }
    
    const subjectId = parseInt(contentSubject.value);
    const topic = contentTopic.value.trim();
    const description = contentDescription ? contentDescription.value.trim() : '';
    const status = contentStatus ? contentStatus.value : 'PENDIENTE';
    
    if (!subjectId || subjectId <= 0) {
        alert('Por favor, selecciona una materia');
        return;
    }
    
    if (!topic) {
        alert('El tema es obligatorio');
        return;
    }
    
    const payload = {
        Tema: topic,
        Descripcion: description || null,
        Estado: status || 'PENDIENTE',
        Materia_ID_materia: subjectId
    };
    
    try {
        const res = await fetch('../api/contenido.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(payload)
        });
        
        let data = {};
        const text = await res.text();
        try {
            data = JSON.parse(text);
        } catch (e) {
            throw new Error(`Error del servidor (${res.status})`);
        }
        
        if (!res.ok) {
            const errorMsg = data.error ? `${data.message || 'Error'}: ${data.error}` : (data.message || 'No se pudo crear el tema');
            throw new Error(errorMsg);
        }
        
        // Reload data from backend
        if (typeof loadData === 'function') await loadData();
        
        // Close modal
        if (typeof closeModal === 'function') {
            closeModal('contentModal');
        } else {
            const modal = document.getElementById('contentModal');
            if (modal) {
                modal.classList.remove('active');
            }
        }
        
        // Re-mostrar el campo de materia si estaba oculto
        if (contentSubject) {
            contentSubject.style.display = '';
            const contentSubjectGroup = contentSubject.closest('.form-group');
            if (contentSubjectGroup) {
                contentSubjectGroup.style.display = '';
            }
        }
        
        // Recargar la vista de materias para mostrar el nuevo tema
        loadSubjects();
        
        // Si el modal de temas está abierto, actualizarlo
        const themesModal = document.getElementById('subjectThemesModal');
        if (themesModal && themesModal.classList.contains('active')) {
            // Recargar el modal con los nuevos temas y volver a la lista
            if (typeof showSubjectThemesPanel === 'function') {
                showSubjectThemesPanel(subjectId);
            }
        }
        
        // Si estamos en la vista de detalles de la materia, recargar esa vista también
        if (window.currentSubjectId === subjectId || contentSubject.value == subjectId) {
            const content = appData.contenido.filter(c => c.Materia_ID_materia === subjectId);
            if (typeof loadSubjectContentTab === 'function') {
                loadSubjectContentTab(subjectId, content);
            }
        }
        
        // Show success message
        if (typeof showNotification === 'function') {
            showNotification('Tema creado correctamente', 'success');
        } else {
            alert('Tema creado correctamente');
        }
    } catch (err) {
        alert('Error: ' + (err.message || 'No se pudo crear el tema'));
    }
}

async function saveContent() {
    if (!window.currentSubjectId) {
        alert('Error: No se encontró la materia seleccionada');
        return;
    }
    
    const topic = document.getElementById('editContentTopic').value.trim();
    const description = document.getElementById('editContentDescription').value.trim();
    const status = document.getElementById('editContentStatus').value;
    
    if (!topic) {
        alert('El tema es obligatorio');
        return;
    }
    
    const payload = {
        Tema: topic,
        Descripcion: description || null,
        Estado: status || 'PENDIENTE',
        Materia_ID_materia: window.currentSubjectId
    };
    
    try {
        const res = await fetch('../api/contenido.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(payload)
        });
        
        let data = {};
        const text = await res.text();
        try {
            data = JSON.parse(text);
        } catch (e) {
            throw new Error(`Error del servidor (${res.status})`);
        }
        
        if (!res.ok) {
            const errorMsg = data.error ? `${data.message || 'Error'}: ${data.error}` : (data.message || 'No se pudo crear el contenido');
            throw new Error(errorMsg);
        }
        
        // Reload data from backend
        if (typeof loadData === 'function') await loadData();
        
        // Close modal
        closeModal('contentEditModal');
        
        // Reload the content tab to show new content
        if (window.currentSubjectId) {
            const content = appData.contenido.filter(c => c.Materia_ID_materia === window.currentSubjectId);
            loadSubjectContentTab(window.currentSubjectId, content);
        }
        
        // Show success message
        showNotification('Contenido creado correctamente', 'success');
        
        currentContentId = null;
    } catch (err) {
        alert('Error: ' + (err.message || 'No se pudo crear el contenido'));
    }
}

function editContent(contentId) {
    const content = appData.contenido.find(c => c.ID_contenido === contentId);
    if (!content) return;
    
    currentContentId = contentId;
    
    // Populate modal with current content data
    document.getElementById('editContentTopic').value = content.Tema;
    document.getElementById('editContentDescription').value = content.Descripcion || '';
    document.getElementById('editContentStatus').value = content.Estado;
    
    // Update modal title for edit mode
    const modalTitle = document.querySelector('#contentEditModal .modal-header h3');
    if (modalTitle) {
        modalTitle.textContent = 'Editar Contenido';
        modalTitle.setAttribute('data-translate', 'edit_content');
    }
    
    // Show modal
    showModal('contentEditModal');
}

async function saveContentEdit() {
    if (!currentContentId) return;
    
    const topic = document.getElementById('editContentTopic').value.trim();
    const description = document.getElementById('editContentDescription').value.trim();
    const status = document.getElementById('editContentStatus').value;
    
    if (!topic) {
        alert('El tema es obligatorio');
        return;
    }
    
    const payload = {
        Tema: topic,
        Descripcion: description || null,
        Estado: status
    };
    
    try {
        const res = await fetch(`../api/contenido.php?id=${currentContentId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(payload)
        });
        
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
            throw new Error(data.message || 'No se pudo actualizar el contenido');
        }
        
        // Reload data from backend
        if (typeof loadData === 'function') await loadData();
        
        // Si el panel de temas está abierto, actualizarlo
        const themesPanel = document.getElementById('subjectThemesPanel');
        if (themesPanel && themesPanel.style.display === 'block') {
            const updatedContent = appData.contenido.find(c => c.ID_contenido === currentContentId);
            if (updatedContent && typeof showSubjectThemesPanel === 'function') {
                showSubjectThemesPanel(updatedContent.Materia_ID_materia);
            }
        }
        
        // Close modal
        closeModal('contentEditModal');
        
        // Reload the content tab to show updated content
        if (window.currentSubjectId) {
            const content = appData.contenido.filter(c => c.Materia_ID_materia === window.currentSubjectId);
            loadSubjectContentTab(window.currentSubjectId, content);
        }
        
        // Recargar la vista de materias
        loadSubjects();
        
        // Show success message
        showNotification('Contenido actualizado correctamente', 'success');
        
        currentContentId = null;
    } catch (err) {
        alert('Error: ' + (err.message || 'No se pudo actualizar el contenido'));
    }
}

async function deleteContent(contentId) {
    const content = appData.contenido.find(c => c.ID_contenido === contentId);
    if (!content) return;
    
    if (confirm(`¿Estás seguro de que quieres eliminar el contenido "${content.Tema}"?`)) {
        try {
            const res = await fetch(`../api/contenido.php?id=${contentId}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                credentials: 'include'
            });
            
            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
                throw new Error(data.message || 'No se pudo eliminar el contenido');
            }
            
            // Reload data from backend
            if (typeof loadData === 'function') await loadData();
            
            // Si el panel de temas está abierto, actualizarlo
            const themesPanel = document.getElementById('subjectThemesPanel');
            if (themesPanel && themesPanel.style.display === 'block') {
                const deletedContent = appData.contenido.find(c => c.ID_contenido === contentId);
                if (deletedContent && typeof showSubjectThemesPanel === 'function') {
                    showSubjectThemesPanel(deletedContent.Materia_ID_materia);
                } else {
                    // Si no encontramos el contenido, recargar el panel con la materia actual
                    // Buscar en el panel actual qué materia está abierta
                    const panelTitle = document.getElementById('selectedSubjectName');
                    if (panelTitle) {
                        const subjectName = panelTitle.textContent;
                        const subject = appData.materia.find(s => s.Nombre === subjectName);
                        if (subject && typeof showSubjectThemesPanel === 'function') {
                            showSubjectThemesPanel(subject.ID_materia);
                        }
                    }
                }
            }
            
            // Reload the content tab to show updated content
            if (window.currentSubjectId) {
                const content = appData.contenido.filter(c => c.Materia_ID_materia === window.currentSubjectId);
                loadSubjectContentTab(window.currentSubjectId, content);
            }
            
            // Recargar la vista de materias
            loadSubjects();
            
            // Show success message
            showNotification('Contenido eliminado correctamente', 'success');
        } catch (err) {
            alert('Error: ' + (err.message || 'No se pudo eliminar el contenido'));
        }
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

// Functions for assigning students to contenido (recuperatorios)
async function assignStudentsToContent(contenidoId, subjectId) {
    if (!contenidoId || !subjectId) {
        alert('Error: Faltan parámetros necesarios');
        return;
    }
    
    // Ensure tema_estudiante array exists
    if (!Array.isArray(appData.tema_estudiante)) {
        appData.tema_estudiante = [];
    }
    
    // Get enrolled students for this subject
    const enrolledStudents = appData.alumnos_x_materia.filter(axm => axm.Materia_ID_materia === subjectId);
    const students = enrolledStudents.map(axm => 
        appData.estudiante.find(e => e.ID_Estudiante === axm.Estudiante_ID_Estudiante)
    ).filter(Boolean);
    
    if (students.length === 0) {
        alert('No hay estudiantes inscritos en esta materia');
        return;
    }
    
    // Get already assigned students
    const assignedStudentIds = appData.tema_estudiante
        .filter(te => te.Contenido_ID_contenido === contenidoId)
        .map(te => te.Estudiante_ID_Estudiante);
    
    // Create modal content with checkboxes for students
    const content = appData.contenido.find(c => c.ID_contenido === contenidoId);
    const modalContent = `
        <div style="padding: 20px;">
            <h3 style="margin-bottom: 15px;">Asignar Estudiantes para Recuperatorio</h3>
            <p style="margin-bottom: 15px; color: #666;"><strong>Contenido:</strong> ${content ? content.Tema : 'N/A'}</p>
            <div style="max-height: 400px; overflow-y: auto; border: 1px solid #ddd; border-radius: 4px; padding: 10px;">
                ${students.map(student => {
                    const isAssigned = assignedStudentIds.includes(student.ID_Estudiante);
                    return `
                        <label style="display: flex; align-items: center; padding: 8px; cursor: pointer; ${isAssigned ? 'background: #e8f5e9;' : ''}">
                            <input type="checkbox" 
                                   value="${student.ID_Estudiante}" 
                                   ${isAssigned ? 'checked disabled' : ''}
                                   class="student-checkbox-${contenidoId}"
                                   style="margin-right: 10px;">
                            <span style="flex: 1;">${student.Nombre} ${student.Apellido}</span>
                            ${isAssigned ? '<span style="color: #4caf50; font-size: 0.9em;">(Ya asignado)</span>' : ''}
                        </label>
                    `;
                }).join('')}
            </div>
            <div style="margin-top: 20px; display: flex; gap: 10px; justify-content: flex-end;">
                <button id="cancelAssignBtn" class="btn-secondary" style="padding: 8px 16px;">Cancelar</button>
                <button id="saveAssignBtn" class="btn-primary" style="padding: 8px 16px;">Guardar Asignaciones</button>
            </div>
        </div>
    `;
    
    // Create or update modal
    let modal = document.getElementById('assignStudentsModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'assignStudentsModal';
        modal.className = 'modal';
        document.body.appendChild(modal);
    }
    
    const modalWrapper = document.createElement('div');
    modalWrapper.className = 'modal-content';
    modalWrapper.innerHTML = `
        <div class="modal-header">
            <h3>Asignar Estudiantes</h3>
            <button class="close-modal">&times;</button>
        </div>
        ${modalContent}
    `;
    
    modal.innerHTML = '';
    modal.appendChild(modalWrapper);
    
    // Setup modal handlers
    setupModalHandlers('assignStudentsModal');
    
    // Setup event listeners
    const cancelBtn = modalWrapper.querySelector('#cancelAssignBtn');
    const saveBtn = modalWrapper.querySelector('#saveAssignBtn');
    
    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            closeModal('assignStudentsModal');
        });
    }
    
    if (saveBtn) {
        saveBtn.addEventListener('click', async () => {
            const checkboxes = modalWrapper.querySelectorAll(`.student-checkbox-${contenidoId}:not(:disabled)`);
            const selectedStudentIds = Array.from(checkboxes)
                .filter(cb => cb.checked)
                .map(cb => parseInt(cb.value));
            
            if (selectedStudentIds.length === 0) {
                alert('Selecciona al menos un estudiante');
                return;
            }
            
            // Save assignments
            await saveStudentAssignments(contenidoId, selectedStudentIds);
            closeModal('assignStudentsModal');
        });
    }
    
    // Show modal
    showModal('assignStudentsModal');
}

async function saveStudentAssignments(contenidoId, studentIds) {
    try {
        let successCount = 0;
        let errorCount = 0;
        
        for (const estudianteId of studentIds) {
            try {
                const payload = {
                    Contenido_ID_contenido: contenidoId,
                    Estudiante_ID_Estudiante: estudianteId,
                    Estado: 'PENDIENTE'
                };
                
                const res = await fetch('../api/tema_estudiante.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify(payload)
                });
                
                const data = await res.json().catch(() => ({}));
                
                if (res.ok) {
                    successCount++;
                } else {
                    // Check if it's a conflict (already assigned)
                    if (res.status === 409) {
                        successCount++; // Already assigned, count as success
                    } else {
                        errorCount++;
                        console.error(`Error assigning student ${estudianteId}:`, data.message);
                    }
                }
            } catch (err) {
                errorCount++;
                console.error(`Error assigning student ${estudianteId}:`, err);
            }
        }
        
        // Reload data from backend
        if (typeof loadData === 'function') await loadData();
        
        // Reload the content tab to show updated assignments
        if (window.currentSubjectId) {
            const content = appData.contenido.filter(c => c.Materia_ID_materia === window.currentSubjectId);
            loadSubjectContentTab(window.currentSubjectId, content);
        }
        
        if (errorCount === 0) {
            showNotification(`Se asignaron ${successCount} estudiante(s) correctamente`, 'success');
        } else {
            alert(`Se asignaron ${successCount} estudiante(s). ${errorCount} error(es).`);
        }
    } catch (err) {
        alert('Error al guardar las asignaciones: ' + (err.message || 'Error desconocido'));
    }
}

async function removeStudentFromContent(temaEstudianteId, contenidoId) {
    if (!confirm('¿Estás seguro de que quieres quitar esta asignación?')) {
        return;
    }
    
    try {
        const res = await fetch(`../api/tema_estudiante.php?id=${temaEstudianteId}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            credentials: 'include'
        });
        
        const data = await res.json().catch(() => ({}));
        
        if (!res.ok) {
            throw new Error(data.message || 'No se pudo quitar la asignación');
        }
        
        // Reload data from backend
        if (typeof loadData === 'function') await loadData();
        
        // Reload the content tab to show updated assignments
        if (window.currentSubjectId) {
            const content = appData.contenido.filter(c => c.Materia_ID_materia === window.currentSubjectId);
            loadSubjectContentTab(window.currentSubjectId, content);
        }
        
        showNotification('Asignación eliminada correctamente', 'success');
    } catch (err) {
        alert('Error: ' + (err.message || 'No se pudo quitar la asignación'));
    }
}

// Initialize export button
document.addEventListener('DOMContentLoaded', function() {
    const exportBtn = document.getElementById('exportSubjectsBtn');
    if (exportBtn) {
        exportBtn.addEventListener('click', exportSubjects);
    }
});
