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
    async function setupAndShowModal(modalId) {
        const el = document.getElementById(modalId);
        if (!el) return false;
        
        // Si es el modal de materias, poblar el desplegable de cursos
        if (modalId === 'subjectModal') {
            await populateCourseDivisionDropdown();
            // Ocultar sección de crear nuevo curso por defecto
            const createNewSection = document.getElementById('createNewCourseSection');
            if (createNewSection) createNewSection.style.display = 'none';
        }
        
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
                    setTimeout(async () => {
                        modalElement = document.getElementById('subjectModal');
                        if (!modalElement) {
                            alert('Error: No se encontró el formulario de materia. Por favor, recarga la página.');
                            return;
                        }
                        // If found on retry, proceed with opening
                        await setupAndShowModal('subjectModal');
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
                resetSubjectForm();
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
                                <td>
                                    <strong>${subject.Nombre}</strong>
                                    <br>
                                    <small style="color: #667eea; font-weight: 600;">
                                        <i class="fas fa-graduation-cap" style="margin-right: 4px;"></i>
                                        ${subject.Curso_division}
                                    </small>
                                </td>
                                <td>
                                    <span style="display: inline-block; padding: 4px 10px; background: #e3f2fd; color: #1976d2; border-radius: 12px; font-size: 0.85rem; font-weight: 600;">
                                        ${subject.Curso_division}
                                    </span>
                                </td>
                                <td>${teacher ? `${teacher.Nombre_docente} ${teacher.Apellido_docente}` : 'N/A'}</td>
                                <td>${subject.Horario || 'No especificado'}</td>
                                <td>${subject.Aula || 'No especificada'}</td>
                                <td><span class="table-status ${subject.Estado.toLowerCase()}">${getStatusText(subject.Estado)}</span></td>
                                <td>
                                    <span style="display: inline-flex; align-items: center; gap: 6px;">
                                        <i class="fas fa-users" style="color: #667eea;"></i>
                                        <strong>${studentCount}</strong>
                                    </span>
                                </td>
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

	// Obtener curso_division del desplegable
	const cursoDivisionSelect = document.getElementById('subjectCourseDivision');
	const curso_division = cursoDivisionSelect ? cursoDivisionSelect.value : '';
	
	// Si se seleccionó "crear nuevo", obtener los valores de curso, división e institución
	let finalCursoDivision = curso_division;
	if (curso_division === '__new__') {
		const courseValue = document.getElementById('subjectCourse').value;
		const divisionValue = document.getElementById('subjectDivision').value;
		const institucionValue = document.getElementById('subjectInstitucion')?.value?.trim();
		if (courseValue && divisionValue) {
			finalCursoDivision = `${courseValue}º Curso - División ${divisionValue}`;
			// Si se proporciona institución, también crear el curso en la tabla Curso
			if (institucionValue) {
				// Crear curso en la tabla Curso
				try {
					const cursoPayload = {
						Numero_curso: parseInt(courseValue, 10),
						Division: divisionValue,
						Institucion: institucionValue,
						Usuarios_docente_ID_docente: teacherId,
						Estado: 'ACTIVO'
					};
					const cursoResponse = await fetch('api/curso.php', {
						method: 'POST',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify(cursoPayload)
					});
					const cursoResult = await cursoResponse.json();
					if (!cursoResult.success && cursoResult.error !== 'DUPLICATE_COURSE') {
						console.warn('No se pudo crear el curso automáticamente:', cursoResult.message);
					}
				} catch (err) {
					console.warn('Error al crear curso automáticamente:', err);
				}
			}
		} else {
			alert('Completá Curso y División para crear un nuevo curso.');
			return;
		}
	}

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
		Curso_division: finalCursoDivision,
		Usuarios_docente_ID_docente: teacherId,
		Estado: document.getElementById('subjectStatus').value,
		Horario: (document.getElementById('subjectSchedule').value || '').trim() || null,
		Aula: aulaNumber ? aulaNumber.toString() : null,
		Descripcion: (document.getElementById('subjectDescription').value || '').trim() || null
	};

	// Validación mejorada - permitir crear materia solo con nombre
	if (!payload.Nombre) {
		alert('El nombre de la materia es obligatorio.');
		return;
	}
	
	// Si no hay curso, permitir crear la materia sin curso (puede asignarse después)
	if (!finalCursoDivision) {
		const confirmar = confirm('¿Deseas crear la materia sin asignarle un curso? Podrás asignarlo después.');
		if (!confirmar) {
			return;
		}
		// Asignar un valor temporal para evitar errores en la base de datos
		payload.Curso_division = 'Sin asignar';
	}
	
	// Validar que el teacherId es válido
	if (!payload.Usuarios_docente_ID_docente || payload.Usuarios_docente_ID_docente <= 0) {
		alert('Error: ID de profesor inválido. Por favor, inicia sesión nuevamente.');
		return;
	}

	// Validar que no exista una materia con el mismo nombre y curso para este docente
	if (!currentSubjectId) {
		const existingSubject = window.appData?.materia?.find(m => 
			m.Nombre === payload.Nombre && 
			m.Curso_division === finalCursoDivision &&
			m.Usuarios_docente_ID_docente === teacherId
		);
		
		if (existingSubject) {
			alert(`Ya existe una materia "${payload.Nombre}" con el curso "${finalCursoDivision}". No se puede duplicar la misma materia y curso. Puedes crear la misma materia en un curso diferente (ej: ${payload.Nombre} en otro curso).`);
			return;
		}
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
		
		let res, data;
		let newSubjectId = null;
		
		if (currentSubjectId) {
			// UPDATE con PUT
			res = await fetch(`../api/materia.php?id=${currentSubjectId}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
				credentials: 'include',
				body: JSON.stringify(payload)
			});
			data = await res.json().catch(() => ({}));
			if (!res.ok) throw new Error(data.message || 'No se pudo actualizar la materia');
		} else {
			// CREATE con POST
			res = await fetch('../api/materia.php', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
				credentials: 'include',
				body: JSON.stringify(payload)
			});
			
			const text = await res.text();
			try {
				data = JSON.parse(text);
			} catch (e) {
				throw new Error(`Error del servidor (${res.status})`);
			}
			
			if (!res.ok) {
				let errorMsg = data.message || 'No se pudo crear la materia';
				if (data.error === 'DUPLICATE_SUBJECT_COURSE') {
					errorMsg = data.message || 'Ya existe una materia con este nombre y curso. No se puede duplicar la misma materia y curso.';
				} else if (data.error) {
					errorMsg = `${data.message || 'Error'}: ${data.error}`;
				}
				throw new Error(errorMsg);
			}
			
			// Si es una materia nueva, guardar el ID antes de recargar
			if (res.ok && data.success !== false) {
				// El endpoint devuelve { success: true, id: ... }
				newSubjectId = data.id || data.ID_materia || null;
			}
		}
		
		if (typeof loadData === 'function') await loadData(); // recarga desde backend
		
		closeModal('subjectModal');
		loadSubjects();
		populateCourseFilter();
		// Repoblar el desplegable de cursos con los nuevos cursos
		if (typeof populateCourseDivisionDropdown === 'function') {
			await populateCourseDivisionDropdown();
		}
		if (typeof populateSubjectFilter === 'function') populateSubjectFilter();
		if (typeof populateExamsSubjectFilter === 'function') populateExamsSubjectFilter();
		if (typeof populateUnifiedCourseFilter === 'function') populateUnifiedCourseFilter();
		if (typeof loadUnifiedStudentData === 'function') loadUnifiedStudentData();
		updateDashboard();
		
		// Si es una materia nueva, preguntar si quiere asignar estudiantes
		if (newSubjectId) {
			const assignStudents = confirm('¿Deseas asignar estudiantes a esta materia ahora?');
			if (assignStudents) {
				await assignStudentsToSubject(newSubjectId, finalCursoDivision);
			}
		}
		
		currentSubjectId = null;
		// Resetear formulario
		resetSubjectForm();
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
// Función para resetear el formulario de materias
async function resetSubjectForm() {
    const form = document.getElementById('subjectForm');
    if (form) form.reset();
    
    // Ocultar sección de crear nuevo curso
    const createNewSection = document.getElementById('createNewCourseSection');
    if (createNewSection) createNewSection.style.display = 'none';
    
    // Limpiar campos de curso y división
    const courseSelect = document.getElementById('subjectCourse');
    const divisionSelect = document.getElementById('subjectDivision');
    if (courseSelect) courseSelect.value = '';
    if (divisionSelect) divisionSelect.value = '';
    
    // Repoblar el desplegable de cursos
    await populateCourseDivisionDropdown();
    
    // Resetear título del modal
    const modalTitle = document.querySelector('#subjectModal .modal-header h3');
    if (modalTitle) {
        modalTitle.textContent = 'Agregar Materia';
        modalTitle.setAttribute('data-translate', 'add_subject');
    }
    
    currentSubjectId = null;
}

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
        
        // Poblar el desplegable de curso_division y seleccionar el curso actual
        await populateCourseDivisionDropdown();
        const courseDivisionSelect = document.getElementById('subjectCourseDivision');
        if (courseDivisionSelect && subject.Curso_division) {
            // Verificar si el curso existe en el desplegable
            const courseExists = Array.from(courseDivisionSelect.options).some(opt => opt.value === subject.Curso_division);
            if (courseExists) {
                courseDivisionSelect.value = subject.Curso_division;
            } else {
                // Si no existe, agregarlo temporalmente
                const option = document.createElement('option');
                option.value = subject.Curso_division;
                option.textContent = subject.Curso_division;
                courseDivisionSelect.insertBefore(option, courseDivisionSelect.lastChild);
                courseDivisionSelect.value = subject.Curso_division;
            }
        }
        
        // Si el curso no está en la lista, mostrar la sección de crear nuevo
        const createNewSection = document.getElementById('createNewCourseSection');
        if (createNewSection && !courseDivisionSelect.value) {
            createNewSection.style.display = 'block';
            // Parsear curso_division para separar curso y división
            const { course, division } = parseCourseDivision(subject.Curso_division);
            const courseSelect = document.getElementById('subjectCourse');
            const divisionSelect = document.getElementById('subjectDivision');
            if (courseSelect && course) courseSelect.value = course;
            if (divisionSelect && division) divisionSelect.value = division;
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
    
    // Navigate to materia-details section instead of opening modal
    if (typeof showSection === 'function') {
        showSection('materia-details');
    } else {
        // Fallback: hide all sections and show materia-details
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.remove('active');
        });
        const materiaDetailsSection = document.getElementById('materia-details');
        if (materiaDetailsSection) {
            materiaDetailsSection.classList.add('active');
        }
    }
    
    // Update title
    const titleElement = document.getElementById('materiaDetailsTitle');
    if (titleElement) {
        titleElement.textContent = subject.Nombre;
    }
    
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
    
    // Show list view, hide form view
    const createThemeFormView = document.getElementById('createThemeFormView');
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
    
    // Ensure temas tab is active by default
    switchToTemasTab();
    
    // Setup event handlers
    setupUnifiedThemesModalHandlers();
    setupMateriaDetailsHandlers();
    
    // Load evaluaciones (will be shown when evaluaciones tab is clicked)
    // We don't load it immediately to improve performance
};

// Function to load evaluaciones for a subject
async function loadSubjectEvaluaciones(subjectId) {
    const evaluacionesList = document.getElementById('subjectEvaluacionesList');
    if (!evaluacionesList) {
        console.error('subjectEvaluacionesList element not found');
        return;
    }
    
    // Show loading state
    evaluacionesList.innerHTML = '<div style="text-align: center; padding: 20px; color: var(--text-secondary);">Cargando evaluaciones...</div>';
    
    // Get evaluaciones from appData or fetch from API
    let evaluaciones = [];
    
    // Ensure appData is available
    if (!appData && window.appData) {
        appData = window.appData;
    } else if (!appData && window.data) {
        appData = window.data;
    }
    
    if (appData && appData.evaluacion && Array.isArray(appData.evaluacion)) {
        evaluaciones = appData.evaluacion
            .filter(e => {
                const materiaId = parseInt(e.Materia_ID_materia);
                const subjectIdNum = parseInt(subjectId);
                return materiaId === subjectIdNum;
            })
            .sort((a, b) => {
                const dateA = a.Fecha ? new Date(a.Fecha) : new Date(0);
                const dateB = b.Fecha ? new Date(b.Fecha) : new Date(0);
                return dateB - dateA;
            });
        
        console.log(`Found ${evaluaciones.length} evaluaciones for subject ${subjectId} from appData`);
    } else {
        // Fetch from API if not in appData
        try {
            const isInPages = window.location.pathname.includes('/pages/');
            const baseUrl = isInPages ? '../api' : 'api';
            const response = await fetch(`${baseUrl}/evaluacion.php?materiaId=${subjectId}`);
            if (response.ok) {
                const data = await response.json();
                evaluaciones = Array.isArray(data) ? data : [];
                console.log(`Fetched ${evaluaciones.length} evaluaciones from API for subject ${subjectId}`);
            } else {
                console.error('Failed to fetch evaluaciones:', response.status, response.statusText);
            }
        } catch (error) {
            console.error('Error loading evaluaciones:', error);
        }
    }
    
    // Display evaluaciones
    if (evaluaciones.length > 0) {
        evaluacionesList.innerHTML = evaluaciones.map(eval => {
            const tipoLabels = {
                'EXAMEN': 'Examen',
                'PARCIAL': 'Parcial',
                'TRABAJO_PRACTICO': 'Trabajo Práctico',
                'PROYECTO': 'Proyecto',
                'ORAL': 'Oral',
                'PRACTICO': 'Práctico'
            };
            
            const estadoLabels = {
                'PROGRAMADA': 'Programada',
                'EN_CURSO': 'En Curso',
                'FINALIZADA': 'Finalizada',
                'CANCELADA': 'Cancelada'
            };
            
            const fecha = eval.Fecha ? new Date(eval.Fecha).toLocaleDateString('es-ES') : 'Sin fecha';
            
            return `
                <div style="margin-bottom: 12px; border: 1px solid var(--border-color); border-radius: 8px; background: var(--card-bg); padding: 14px 16px;">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
                        <div style="flex: 1;">
                            <strong style="display: block; margin-bottom: 6px; color: var(--text-primary); font-size: 1em;">${eval.Titulo || 'Sin título'}</strong>
                            ${eval.Descripcion ? `<p style="font-size: 0.9em; color: var(--text-secondary); margin: 6px 0;">${eval.Descripcion}</p>` : ''}
                            <div style="display: flex; gap: 12px; align-items: center; flex-wrap: wrap; margin-top: 8px;">
                                <span class="status-badge" style="font-size: 0.8em; padding: 3px 8px; border-radius: 10px; background: #667eea; color: white;">
                                    ${tipoLabels[eval.Tipo] || eval.Tipo}
                                </span>
                                <span class="status-badge status-${(eval.Estado || 'PROGRAMADA').toLowerCase()}" style="font-size: 0.8em; padding: 3px 8px; border-radius: 10px;">
                                    ${estadoLabels[eval.Estado] || eval.Estado}
                                </span>
                                <span style="font-size: 0.85em; color: var(--text-secondary);">
                                    <i class="fas fa-calendar" style="margin-right: 4px;"></i>${fecha}
                                </span>
                                ${eval.Peso ? `<span style="font-size: 0.85em; color: var(--text-secondary);">
                                    <i class="fas fa-weight" style="margin-right: 4px;"></i>Peso: ${eval.Peso}
                                </span>` : ''}
                            </div>
                        </div>
                        <div style="display: flex; gap: 5px;" onclick="event.stopPropagation();">
                            <button class="btn-icon btn-edit" onclick="editEvaluacion(${eval.ID_evaluacion})" title="Editar Evaluación" style="padding: 6px 8px;">
                                <i class="fas fa-edit" style="font-size: 0.9em;"></i>
                            </button>
                            <button class="btn-icon btn-delete" onclick="deleteEvaluacion(${eval.ID_evaluacion})" title="Eliminar Evaluación" style="padding: 6px 8px;">
                                <i class="fas fa-trash" style="font-size: 0.9em;"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    } else {
        evaluacionesList.innerHTML = `
            <div style="text-align: center; padding: 40px 20px; color: var(--text-secondary, #999);">
                <i class="fas fa-clipboard-list" style="font-size: 2.5em; margin-bottom: 15px; opacity: 0.3;"></i>
                <p>No hay evaluaciones registradas para esta materia</p>
                <button class="btn-primary" onclick="showCreateEvaluacionForm(${subjectId})" style="margin-top: 15px;">
                    <i class="fas fa-plus"></i> Crear Primera Evaluación
                </button>
            </div>
        `;
    }
}

// Setup handlers for materia details view
function setupMateriaDetailsHandlers() {
    // Tab switching functionality
    const temasTabBtn = document.getElementById('temasTabBtn');
    const evaluacionesTabBtn = document.getElementById('evaluacionesTabBtn');
    const temasTabContent = document.getElementById('temasTabContent');
    const evaluacionesTabContent = document.getElementById('evaluacionesTabContent');
    
    // Temas tab button
    if (temasTabBtn) {
        temasTabBtn.onclick = function() {
            switchToTemasTab();
        };
    }
    
    // Evaluaciones tab button
    if (evaluacionesTabBtn) {
        evaluacionesTabBtn.onclick = function() {
            switchToEvaluacionesTab();
        };
    }
    
    // Back to subjects button
    const backBtn = document.getElementById('backToSubjectsFromDetailsBtn');
    if (backBtn) {
        backBtn.onclick = function() {
            if (typeof showSection === 'function') {
                showSection('subjects-management');
            }
        };
    }
    
    // Show create evaluacion form button
    const showCreateEvaluacionBtn = document.getElementById('showCreateEvaluacionFormBtn');
    if (showCreateEvaluacionBtn) {
        showCreateEvaluacionBtn.onclick = function() {
            if (currentThemesSubjectId) {
                showCreateEvaluacionForm(currentThemesSubjectId);
            }
        };
    }
    
    // Back to evaluaciones list button
    const backToEvaluacionesBtn = document.getElementById('backToEvaluacionesListBtn');
    if (backToEvaluacionesBtn) {
        backToEvaluacionesBtn.onclick = function() {
            if (currentThemesSubjectId) {
                loadSubjectEvaluaciones(currentThemesSubjectId);
                const formView = document.getElementById('createEvaluacionFormView');
                if (formView) formView.style.display = 'none';
            }
        };
    }
    
    // Cancel create evaluacion button
    const cancelEvaluacionBtn = document.getElementById('cancelCreateEvaluacionBtn');
    if (cancelEvaluacionBtn) {
        cancelEvaluacionBtn.onclick = function() {
            if (currentThemesSubjectId) {
                loadSubjectEvaluaciones(currentThemesSubjectId);
                const formView = document.getElementById('createEvaluacionFormView');
                if (formView) formView.style.display = 'none';
            }
        };
    }
    
    // Evaluacion form submit handler
    const evaluacionForm = document.getElementById('evaluacionForm');
    if (evaluacionForm) {
        evaluacionForm.onsubmit = function(e) {
            e.preventDefault();
            saveEvaluacion();
        };
    }
}

// Switch to Temas tab
function switchToTemasTab() {
    const temasTabBtn = document.getElementById('temasTabBtn');
    const evaluacionesTabBtn = document.getElementById('evaluacionesTabBtn');
    const temasTabContent = document.getElementById('temasTabContent');
    const evaluacionesTabContent = document.getElementById('evaluacionesTabContent');
    
    // Update tab buttons
    if (temasTabBtn) temasTabBtn.classList.add('active');
    if (evaluacionesTabBtn) evaluacionesTabBtn.classList.remove('active');
    
    // Update tab content
    if (temasTabContent) {
        temasTabContent.classList.add('active');
        temasTabContent.style.display = 'block';
    }
    if (evaluacionesTabContent) {
        evaluacionesTabContent.classList.remove('active');
        evaluacionesTabContent.style.display = 'none';
    }
}

// Switch to Evaluaciones tab
function switchToEvaluacionesTab() {
    const temasTabBtn = document.getElementById('temasTabBtn');
    const evaluacionesTabBtn = document.getElementById('evaluacionesTabBtn');
    const temasTabContent = document.getElementById('temasTabContent');
    const evaluacionesTabContent = document.getElementById('evaluacionesTabContent');
    
    // Update tab buttons
    if (temasTabBtn) temasTabBtn.classList.remove('active');
    if (evaluacionesTabBtn) evaluacionesTabBtn.classList.add('active');
    
    // Update tab content
    if (temasTabContent) {
        temasTabContent.classList.remove('active');
        temasTabContent.style.display = 'none';
    }
    if (evaluacionesTabContent) {
        evaluacionesTabContent.classList.add('active');
        evaluacionesTabContent.style.display = 'block';
    }
    
    // Always load evaluaciones when switching to this tab
    if (currentThemesSubjectId) {
        loadSubjectEvaluaciones(currentThemesSubjectId);
    }
}

// Show create evaluacion form
window.showCreateEvaluacionForm = function(subjectId) {
    if (!subjectId && currentThemesSubjectId) {
        subjectId = currentThemesSubjectId;
    }
    
    const formView = document.getElementById('createEvaluacionFormView');
    const subjectIdInput = document.getElementById('evaluacionSubjectId');
    
    if (formView && subjectIdInput) {
        subjectIdInput.value = subjectId;
        formView.style.display = 'block';
        
        // Reset form
        document.getElementById('evaluacionTitulo').value = '';
        document.getElementById('evaluacionDescripcion').value = '';
        document.getElementById('evaluacionFecha').value = '';
        document.getElementById('evaluacionTipo').value = 'EXAMEN';
        document.getElementById('evaluacionPeso').value = '1.00';
        document.getElementById('evaluacionEstado').value = 'PROGRAMADA';
    }
}

// Save evaluacion
async function saveEvaluacion() {
    const subjectId = document.getElementById('evaluacionSubjectId').value;
    const titulo = document.getElementById('evaluacionTitulo').value;
    const descripcion = document.getElementById('evaluacionDescripcion').value;
    const fecha = document.getElementById('evaluacionFecha').value;
    const tipo = document.getElementById('evaluacionTipo').value;
    const peso = document.getElementById('evaluacionPeso').value;
    const estado = document.getElementById('evaluacionEstado').value;
    
    if (!subjectId || !titulo || !fecha || !tipo) {
        alert('Por favor complete todos los campos requeridos');
        return;
    }
    
    try {
        const response = await fetch('api/evaluacion.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                Titulo: titulo,
                Descripcion: descripcion,
                Fecha: fecha,
                Tipo: tipo,
                Peso: parseFloat(peso),
                Estado: estado,
                Materia_ID_materia: parseInt(subjectId)
            })
        });
        
        if (response.ok) {
            const data = await response.json();
            // Reload evaluaciones
            if (typeof loadData === 'function') {
                await loadData();
            }
            await loadSubjectEvaluaciones(subjectId);
            
            // Hide form
            const formView = document.getElementById('createEvaluacionFormView');
            if (formView) formView.style.display = 'none';
            
            if (typeof showNotification === 'function') {
                showNotification('Evaluación creada correctamente', 'success');
            } else {
                alert('Evaluación creada correctamente');
            }
        } else {
            const error = await response.json();
            throw new Error(error.message || 'Error al crear la evaluación');
        }
    } catch (err) {
        alert('Error: ' + (err.message || 'No se pudo crear la evaluación'));
    }
}

// Edit evaluacion (placeholder)
window.editEvaluacion = function(evaluacionId) {
    alert('Función de edición de evaluaciones en desarrollo');
}

// Delete evaluacion (placeholder)
window.deleteEvaluacion = function(evaluacionId) {
    if (confirm('¿Está seguro de que desea eliminar esta evaluación?')) {
        // TODO: Implement delete functionality
        alert('Función de eliminación de evaluaciones en desarrollo');
    }
}

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
// Función para obtener todos los cursos únicos de las materias existentes
async function getAllUniqueCourses() {
    const courses = [];
    
    // Primero, obtener cursos de la tabla Curso desde la API
    const userIdString = localStorage.getItem('userId');
    if (userIdString) {
        try {
            const response = await fetch(`api/curso.php?userId=${userIdString}`);
            const result = await response.json();
            if (result.success && result.data && Array.isArray(result.data)) {
                result.data.forEach(c => {
                    if (c.Curso_division && c.Estado === 'ACTIVO' && !courses.includes(c.Curso_division)) {
                        courses.push(c.Curso_division);
                    }
                });
            }
        } catch (error) {
            console.warn('Error al cargar cursos desde API:', error);
            // Si falla, intentar usar la función getAvailableCourses si existe
            if (typeof getAvailableCourses === 'function') {
                const cursosFromTable = getAvailableCourses();
                cursosFromTable.forEach(c => {
                    if (c.Curso_division && !courses.includes(c.Curso_division)) {
                        courses.push(c.Curso_division);
                    }
                });
            }
        }
    }
    
    // Luego, obtener cursos de Materia (para compatibilidad con datos existentes)
    if (window.appData && window.appData.materia && Array.isArray(window.appData.materia)) {
        window.appData.materia.forEach(m => {
            if (m.Curso_division && m.Curso_division.trim() !== '' && m.Curso_division !== 'Sin asignar' && !courses.includes(m.Curso_division)) {
                courses.push(m.Curso_division);
            }
        });
    }
    
    return courses.sort();
}

// Función para poblar el desplegable de cursos en el modal de materias
async function populateCourseDivisionDropdown() {
    const select = document.getElementById('subjectCourseDivision');
    if (!select) return;
    
    // Limpiar el select primero
    select.innerHTML = '<option value="">- Seleccionar Curso -</option>';
    
    // Obtener cursos únicos (ahora es async)
    const courses = await getAllUniqueCourses();
    
    // Agregar cursos existentes
    courses.forEach(course => {
        const option = document.createElement('option');
        option.value = course;
        option.textContent = course;
        select.appendChild(option);
    });
    
    // Agregar opción para crear nuevo curso
    const newOption = document.createElement('option');
    newOption.value = '__new__';
    newOption.textContent = '+ Crear Nuevo Curso';
    select.appendChild(newOption);
    
    // Agregar evento para mostrar/ocultar campos de creación
    select.addEventListener('change', function() {
        const createNewSection = document.getElementById('createNewCourseSection');
        const courseSelect = document.getElementById('subjectCourse');
        const divisionSelect = document.getElementById('subjectDivision');
        
        if (this.value === '__new__') {
            if (createNewSection) createNewSection.style.display = 'block';
            if (courseSelect) courseSelect.required = true;
            if (divisionSelect) divisionSelect.required = true;
        } else {
            if (createNewSection) createNewSection.style.display = 'none';
            if (courseSelect) courseSelect.required = false;
            if (divisionSelect) divisionSelect.required = false;
        }
    });
}

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
                <div class="card-header" style="display: flex; justify-content: space-between; align-items: center;">
                    <h4>
                        <i class="fas fa-users"></i> 
                        Estudiantes del Curso: <span style="color: #667eea; font-weight: 600;">${subject.Curso_division}</span>
                        <span style="font-size: 0.9em; color: #666; margin-left: 8px;">(${students.length} inscritos)</span>
                    </h4>
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
                    ` : '<p class="empty-state">No hay estudiantes inscritos en este curso. Puedes asignar estudiantes desde la sección de Gestión de Estudiantes.</p>'}
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

// Export functionality for subjects
function openSubjectsExportDialog() {
    const exportDialogModal = document.getElementById('exportDialogModal');
    const exportDialogText = document.getElementById('exportDialogText');
    
    if (!exportDialogModal) return;
    
    // Update dialog text for subjects
    exportDialogText.innerHTML = '<span data-translate="select_export_format_subjects">Seleccione el formato de exportación para las materias:</span>';
    
    // Set context to subjects
    exportDialogModal.setAttribute('data-export-context', 'subjects');
    
    // Show modal
    if (typeof showModal === 'function') {
        showModal('exportDialogModal');
    } else {
        exportDialogModal.classList.add('active');
    }
}

function exportSubjectsAsCSV() {
    const subjects = getFilteredSubjects();
    
    if (!subjects || subjects.length === 0) {
        alert('No hay materias para exportar.');
        return;
    }
    
    // Prepare CSV data
    const headers = ['ID', 'Nombre', 'Curso', 'Profesor', 'Horario', 'Aula', 'Estado', 'Estudiantes'];
    const rows = subjects.map(subject => {
        const teacher = getTeacherById(subject.Usuarios_docente_ID_docente);
        const studentCount = getStudentCountBySubject(subject.ID_materia);
        
        return [
            subject.ID_materia || '',
            subject.Nombre || '',
            subject.Curso_division || '',
            teacher ? `${teacher.Nombre_docente} ${teacher.Apellido_docente}` : 'N/A',
            subject.Horario || 'No especificado',
            subject.Aula || 'No especificada',
            getStatusText(subject.Estado),
            studentCount
        ];
    });
    
    // Create CSV content
    const csvContent = [
        headers.map(h => `"${h}"`).join(','),
        ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n');
    
    // Download CSV
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `materias_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    // Close modal and show notification
    if (typeof showExportNotification === 'function') {
        showExportNotification('Lista de materias exportada como CSV exitosamente!', 'success');
    } else {
        alert('Lista de materias exportada como CSV exitosamente!');
    }
    
    const exportDialogModal = document.getElementById('exportDialogModal');
    if (exportDialogModal) {
        exportDialogModal.classList.remove('active');
    }
}

function exportSubjectsAsDOC() {
    const subjects = getFilteredSubjects();
    
    if (!subjects || subjects.length === 0) {
        alert('No hay materias para exportar.');
        return;
    }
    
    // Create HTML content for Word document
    let htmlContent = `
        <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
        <head>
            <meta charset='utf-8'>
            <title>Lista de Materias</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                h1 { color: #667eea; text-align: center; }
                table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                th { background-color: #667eea; color: white; padding: 12px; text-align: left; border: 1px solid #ddd; }
                td { padding: 10px; border: 1px solid #ddd; }
                tr:nth-child(even) { background-color: #f9f9f9; }
                .header { margin-bottom: 20px; }
                .date { color: #666; font-size: 14px; }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>Lista de Materias</h1>
                <p class="date">Fecha de exportación: ${new Date().toLocaleDateString()}</p>
            </div>
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Nombre</th>
                        <th>Curso</th>
                        <th>Profesor</th>
                        <th>Horario</th>
                        <th>Aula</th>
                        <th>Estado</th>
                        <th>Estudiantes</th>
                    </tr>
                </thead>
                <tbody>
    `;
    
    subjects.forEach(subject => {
        const teacher = getTeacherById(subject.Usuarios_docente_ID_docente);
        const studentCount = getStudentCountBySubject(subject.ID_materia);
        
        htmlContent += `
            <tr>
                <td>${subject.ID_materia || ''}</td>
                <td>${subject.Nombre || ''}</td>
                <td>${subject.Curso_division || ''}</td>
                <td>${teacher ? `${teacher.Nombre_docente} ${teacher.Apellido_docente}` : 'N/A'}</td>
                <td>${subject.Horario || 'No especificado'}</td>
                <td>${subject.Aula || 'No especificada'}</td>
                <td>${getStatusText(subject.Estado)}</td>
                <td>${studentCount}</td>
            </tr>
        `;
    });
    
    htmlContent += `
                </tbody>
            </table>
        </body>
        </html>
    `;
    
    // Create blob and download
    const blob = new Blob(['\ufeff' + htmlContent], { type: 'application/msword' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `materias_${new Date().toISOString().split('T')[0]}.doc`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    // Close modal and show notification
    if (typeof showExportNotification === 'function') {
        showExportNotification('Lista de materias exportada como DOC exitosamente!', 'success');
    } else {
        alert('Lista de materias exportada como DOC exitosamente!');
    }
    
    const exportDialogModal = document.getElementById('exportDialogModal');
    if (exportDialogModal) {
        exportDialogModal.classList.remove('active');
    }
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

// Función para asignar estudiantes a una materia
async function assignStudentsToSubject(subjectId, cursoDivision) {
    if (!subjectId) {
        alert('Error: Falta el ID de la materia');
        return;
    }
    
    // Obtener el ID del docente actual
    const userIdString = localStorage.getItem('userId');
    if (!userIdString) {
        alert('Error: No se encontró el ID de usuario');
        return;
    }
    const teacherId = parseInt(userIdString, 10);
    
    // Obtener todos los estudiantes que no están ya asignados a esta materia
    const enrolledStudentIds = (appData.alumnos_x_materia || [])
        .filter(axm => axm.Materia_ID_materia === subjectId)
        .map(axm => axm.Estudiante_ID_Estudiante);
    
    // Si hay curso_division, filtrar estudiantes que ya están en otras materias de ese curso
    // Esto permite asignar estudiantes que ya están en el mismo curso
    let availableStudents = (appData.estudiante || []).filter(student => 
        !enrolledStudentIds.includes(student.ID_Estudiante)
    );
    
    if (availableStudents.length === 0) {
        alert('No hay estudiantes disponibles para asignar. Todos los estudiantes ya están asignados a esta materia.');
        return;
    }
    
    // Crear modal content con checkboxes para estudiantes
    const modalContent = `
        <div style="padding: 20px;">
            <h3 style="margin-bottom: 15px;">Asignar Estudiantes a la Materia</h3>
            <p style="margin-bottom: 15px; color: #666;">
                <strong>Curso:</strong> ${cursoDivision || 'N/A'}
            </p>
            <div style="max-height: 400px; overflow-y: auto; border: 1px solid #ddd; border-radius: 4px; padding: 10px;">
                ${availableStudents.map(student => `
                    <label style="display: flex; align-items: center; padding: 8px; cursor: pointer;">
                        <input type="checkbox" 
                               value="${student.ID_Estudiante}" 
                               class="student-checkbox-subject-${subjectId}"
                               style="margin-right: 10px;">
                        <span style="flex: 1;">${student.Nombre} ${student.Apellido}</span>
                        <span style="color: #666; font-size: 0.9em;">${student.Email || 'Sin email'}</span>
                    </label>
                `).join('')}
            </div>
            <div style="margin-top: 20px; display: flex; gap: 10px; justify-content: flex-end;">
                <button id="cancelAssignSubjectBtn" class="btn-secondary" style="padding: 8px 16px;">Cancelar</button>
                <button id="saveAssignSubjectBtn" class="btn-primary" style="padding: 8px 16px;">Guardar Asignaciones</button>
            </div>
        </div>
    `;
    
    // Create or update modal
    let modal = document.getElementById('assignStudentsToSubjectModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'assignStudentsToSubjectModal';
        modal.className = 'modal';
        document.body.appendChild(modal);
    }
    
    const modalWrapper = document.createElement('div');
    modalWrapper.className = 'modal-content';
    modalWrapper.innerHTML = `
        <div class="modal-header">
            <h3>Asignar Estudiantes a la Materia</h3>
            <button class="close-modal">&times;</button>
        </div>
        ${modalContent}
    `;
    
    modal.innerHTML = '';
    modal.appendChild(modalWrapper);
    
    // Setup modal handlers
    setupModalHandlers('assignStudentsToSubjectModal');
    
    // Setup event listeners
    const cancelBtn = modalWrapper.querySelector('#cancelAssignSubjectBtn');
    const saveBtn = modalWrapper.querySelector('#saveAssignSubjectBtn');
    
    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            closeModal('assignStudentsToSubjectModal');
        });
    }
    
    if (saveBtn) {
        saveBtn.addEventListener('click', async () => {
            const checkboxes = modalWrapper.querySelectorAll(`.student-checkbox-subject-${subjectId}`);
            const selectedStudentIds = Array.from(checkboxes)
                .filter(cb => cb.checked)
                .map(cb => parseInt(cb.value));
            
            if (selectedStudentIds.length === 0) {
                alert('Selecciona al menos un estudiante');
                return;
            }
            
            // Save assignments
            await saveStudentsToSubject(subjectId, selectedStudentIds);
            closeModal('assignStudentsToSubjectModal');
        });
    }
    
    // Show modal
    showModal('assignStudentsToSubjectModal');
}

// Función para guardar estudiantes en una materia
async function saveStudentsToSubject(subjectId, studentIds) {
    try {
        let successCount = 0;
        let errorCount = 0;
        
        for (const estudianteId of studentIds) {
            try {
                const payload = [{
                    Materia_ID_materia: subjectId,
                    Estudiante_ID_Estudiante: estudianteId,
                    Estado: 'INSCRITO'
                }];
                
                const res = await fetch('../api/alumnos_x_materia.php', {
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
        
        // Reload subjects view
        if (typeof loadSubjects === 'function') loadSubjects();
        
        if (errorCount === 0) {
            if (typeof showNotification === 'function') {
                showNotification(`Se asignaron ${successCount} estudiante(s) correctamente`, 'success');
            } else {
                alert(`Se asignaron ${successCount} estudiante(s) correctamente`);
            }
        } else {
            alert(`Se asignaron ${successCount} estudiante(s). ${errorCount} error(es).`);
        }
    } catch (err) {
        alert('Error al guardar las asignaciones: ' + (err.message || 'Error desconocido'));
    }
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
        exportBtn.addEventListener('click', openSubjectsExportDialog);
    }
});
