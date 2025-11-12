// Exam Management
function initializeExams() {
    const createExamBtn = document.getElementById('createExamBtn');
    const backToExamsBtn = document.getElementById('backToExamsBtn');
    
    if (createExamBtn) {
        createExamBtn.addEventListener('click', async () => {
            await showExamModal(); // Sin ID = crear nueva
        });
    }
    
    if (backToExamsBtn) {
        backToExamsBtn.addEventListener('click', () => {
            backToExams();
        });
    }
}

// Get filtered exams by subject, course, and date
function getFilteredExams() {
    const examsSubjectFilter = document.getElementById('examsSubjectFilter');
    const examsCourseFilter = document.getElementById('examsCourseFilter');
    const examsDateFilter = document.getElementById('examsDateFilter');
    const selectedSubject = examsSubjectFilter ? examsSubjectFilter.value : '';
    const selectedCourse = examsCourseFilter ? examsCourseFilter.value : '';
    const selectedDate = examsDateFilter ? examsDateFilter.value : '';
    
    // Get current teacher ID
    const currentUserId = localStorage.getItem('userId');
    const teacherId = currentUserId ? parseInt(currentUserId) : null;
    
    // Ensure appData.evaluacion exists and is an array
    if (!appData || !appData.evaluacion || !Array.isArray(appData.evaluacion)) {
        return [];
    }
    
    let filteredExams = appData.evaluacion || [];
    
    // Filter by current teacher's subjects first
    // Note: The API already filters evaluations by teacher ID, so this is an additional filter
    // to ensure consistency and handle edge cases
    if (teacherId) {
        // Ensure appData.materia exists and is an array
        if (!appData.materia || !Array.isArray(appData.materia)) {
            // Since API already filtered, still show available evaluations
            // Don't return empty array here
        } else {
            // Use loose equality to handle type mismatches (string vs number)
            let teacherSubjects = appData.materia.filter(subject => {
                const subjectTeacherId = subject.Usuarios_docente_ID_docente;
                // Convert both to numbers for comparison
                return subjectTeacherId && parseInt(subjectTeacherId) === teacherId;
            });
            
            // Filter by course/division if selected
            if (selectedCourse) {
                teacherSubjects = teacherSubjects.filter(subject => subject.Curso_division === selectedCourse);
            }
            
            // Convert subject IDs to numbers for comparison
            const teacherSubjectIds = teacherSubjects.map(subject => parseInt(subject.ID_materia));
            
            // Only filter if we found subjects - otherwise trust API filtering
            if (teacherSubjectIds.length > 0) {
                // Filter exams by teacher's subject IDs, using loose comparison
                filteredExams = filteredExams.filter(exam => {
                    const examMateriaId = exam.Materia_ID_materia;
                    // Convert to number and check if it's in the teacher's subjects
                    return examMateriaId && teacherSubjectIds.includes(parseInt(examMateriaId));
                });
            }
            // If no subjects found but teacherId exists, trust the API filtering and show all
        }
    }
    
    // Filter by subject
    if (selectedSubject) {
        const subjectId = parseInt(selectedSubject);
        filteredExams = filteredExams.filter(exam => {
            const examMateriaId = exam.Materia_ID_materia;
            return examMateriaId && parseInt(examMateriaId) === subjectId;
        });
    }
    
    // Filter by date
    if (selectedDate) {
        const today = new Date();
        const todayStr = today.toISOString().split('T')[0];
        
        filteredExams = filteredExams.filter(exam => {
            if (!exam.Fecha) return false;
            
            const examDate = new Date(exam.Fecha + 'T00:00:00'); // Ensure consistent timezone
            const todayDate = new Date(todayStr + 'T00:00:00');
            
            switch (selectedDate) {
                case 'today':
                    return exam.Fecha === todayStr;
                case 'this_week':
                    const weekStart = new Date(today);
                    weekStart.setDate(today.getDate() - today.getDay());
                    weekStart.setHours(0, 0, 0, 0);
                    const weekEnd = new Date(weekStart);
                    weekEnd.setDate(weekStart.getDate() + 6);
                    weekEnd.setHours(23, 59, 59, 999);
                    return examDate >= weekStart && examDate <= weekEnd;
                case 'this_month':
                    return examDate.getMonth() === today.getMonth() && examDate.getFullYear() === today.getFullYear();
                case 'upcoming':
                    return examDate >= todayDate;
                case 'past':
                    return examDate < todayDate;
                default:
                    return true;
            }
        });
    }
    
    return filteredExams;
}

function loadExams() {
    const examsContainer = document.getElementById('examsContainer');
    const examsList = document.getElementById('examsList');
    
    if (!examsContainer || !examsList) return;

    // Get filtered exams
    const filteredExams = getFilteredExams();

    // Grid view
    examsContainer.innerHTML = filteredExams.map(exam => {
        const subject = appData.materia.find(s => s.ID_materia === exam.Materia_ID_materia);
        const topic = appData.contenido ? appData.contenido.find(t => parseInt(t.ID_contenido) === parseInt(exam.Contenido_ID_contenido)) : null;
        return `
            <div class="card" onclick="viewExamNotes(${exam.ID_evaluacion})" style="cursor: pointer;">
                <div class="card-header">
                    <h3 class="card-title">${exam.Titulo}</h3>
                    <div class="card-actions" onclick="event.stopPropagation();">
                        <button class="btn-icon btn-grade" onclick="gradeExam(${exam.ID_evaluacion})" title="Calificar Estudiantes">
                            <i class="fas fa-clipboard-check"></i>
                        </button>
                        <button class="btn-icon btn-edit" onclick="editExam(${exam.ID_evaluacion})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-icon btn-delete" onclick="deleteExam(${exam.ID_evaluacion})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <div class="card-content">
                    <p><strong>Subject:</strong> ${subject ? subject.Nombre : 'Unknown Subject'}</p>
                    <p><strong>Tema:</strong> ${topic ? topic.Tema : 'Sin tema asignado'}</p>
                    <p><strong>Date:</strong> ${exam.Fecha}</p>
                    <p><strong>Type:</strong> ${exam.Tipo}</p>
                    <p><strong>Status:</strong> ${exam.Estado}</p>
                    <p><strong>Description:</strong> ${exam.Descripcion || 'No description'}</p>
                </div>
            </div>
        `;
    }).join('');

    // List view - Table format
    examsList.innerHTML = `
        <div class="table-responsive">
            <table class="data-table">
                <thead>
                    <tr>
                        <th data-translate="title">Título</th>
                        <th data-translate="subject">Materia</th>
                        <th data-translate="topic">Tema</th>
                        <th data-translate="type">Tipo</th>
                        <th data-translate="date">Fecha</th>
                        <th data-translate="status">Estado</th>
                        <th data-translate="actions">Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    ${filteredExams.map(exam => {
                        const subject = appData.materia.find(s => s.ID_materia === exam.Materia_ID_materia);
                        const topic = appData.contenido ? appData.contenido.find(t => parseInt(t.ID_contenido) === parseInt(exam.Contenido_ID_contenido)) : null;
                        const shortDate = exam.Fecha.split('-').slice(1).join('/');
                        return `
                            <tr onclick="viewExamNotes(${exam.ID_evaluacion})" class="clickable-row" style="cursor: pointer;">
                                <td><strong>${exam.Titulo}</strong></td>
                                <td>${subject ? subject.Nombre : 'Unknown'}</td>
                                <td>${topic ? topic.Tema : 'Sin tema'}</td>
                                <td>${exam.Tipo}</td>
                                <td>${shortDate}</td>
                                <td>${exam.Estado}</td>
                                <td>
                                    <div class="table-actions">
                                        <button class="btn-icon btn-grade" onclick="event.stopPropagation(); gradeExam(${exam.ID_evaluacion})" title="Calificar Estudiantes">
                                            <i class="fas fa-clipboard-check"></i>
                                        </button>
                                        <button class="btn-icon btn-edit" onclick="event.stopPropagation(); editExam(${exam.ID_evaluacion})" title="Edit">
                                            <i class="fas fa-edit"></i>
                                        </button>
                                        <button class="btn-icon btn-delete" onclick="event.stopPropagation(); deleteExam(${exam.ID_evaluacion})" title="Delete">
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
    
    // Apply translations to the newly rendered table headers
    if (typeof translatePage === 'function' && typeof window.currentLanguage !== 'undefined') {
        translatePage(window.currentLanguage);
    } else if (typeof translatePage === 'function' && typeof currentLanguage !== 'undefined') {
        translatePage(currentLanguage);
    }
}

async function showExamModal(examId = null) {
    // Ensure appData is loaded
    if (!appData || !appData.materia || !Array.isArray(appData.materia)) {
        if (typeof loadData === 'function') {
            await loadData();
        }
    }
    
    // Get current user ID
    const currentUserId = localStorage.getItem('userId');
    
    // Remove existing modal if present
    const existingModal = document.getElementById('examModal');
    if (existingModal) {
        existingModal.remove();
    }
    
    // Obtener materias del docente actual
    // Similar al patrón usado en populateAttendanceMateriaSelect()
    let teacherSubjects = [];
    if (appData && appData.materia && Array.isArray(appData.materia)) {
        if (currentUserId) {
            // Filter by teacher ID (as fallback, even though API should filter)
            teacherSubjects = appData.materia.filter(subject => 
                subject && 
                subject.Usuarios_docente_ID_docente && 
                parseInt(subject.Usuarios_docente_ID_docente) === parseInt(currentUserId) &&
                (!subject.Estado || subject.Estado === 'ACTIVA')
            );
        } else {
            // No user ID, show all active subjects (shouldn't happen in normal flow)
            teacherSubjects = appData.materia.filter(m => 
                !m.Estado || m.Estado === 'ACTIVA'
            );
        }
    }
    
    const exam = examId ? appData.evaluacion.find(e => {
        const evalId = parseInt(e.ID_evaluacion);
        const searchId = parseInt(examId);
        return evalId === searchId || e.ID_evaluacion == examId;
    }) : null;
    const isEdit = !!exam;
    
    // Build subject options HTML
    let subjectOptionsHTML = '<option value="">Seleccione una materia</option>';
    if (teacherSubjects.length === 0) {
        subjectOptionsHTML += '<option value="" disabled>No hay materias disponibles. Cree una materia primero.</option>';
    } else {
        teacherSubjects.forEach(s => {
            const selected = exam && exam.Materia_ID_materia === s.ID_materia ? 'selected' : '';
            const displayText = s.Curso_division ? `${s.Nombre} - ${s.Curso_division}` : s.Nombre;
            subjectOptionsHTML += `<option value="${s.ID_materia}" ${selected}>${displayText}</option>`;
        });
    }
    
    // Escape HTML for form values
    const escapeHtml = (text) => {
        if (!text) return '';
        return String(text)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    };
    
    const modalHTML = `
        <div class="modal-overlay" id="examModal">
            <div class="modal-dialog">
                <div class="modal-dialog-content">
                    <div class="modal-dialog-header">
                        <h3>${isEdit ? 'Editar Evaluación' : 'Crear Evaluación'}</h3>
                        <button class="modal-dialog-close close-modal">&times;</button>
                    </div>
                    <div class="modal-dialog-body">
                        <form id="examForm" onsubmit="saveExam(event); return false;">
                            <div class="form-group">
                                <label for="examTitle" style="display: block; margin-bottom: 5px; font-weight: 500; color: var(--text-primary);">Título *</label>
                                <input type="text" id="examTitle" name="examTitle" required value="${escapeHtml(exam ? exam.Titulo : '')}" autocomplete="off" style="width: 100%; padding: 8px; border: 1px solid var(--border-color); border-radius: 4px; font-size: 0.9em; background: var(--card-bg); color: var(--text-primary);">
                            </div>
                            <div class="form-group" style="margin-top: 15px;">
                                <label for="examSubject" style="display: block; margin-bottom: 5px; font-weight: 500; color: var(--text-primary);">Materia *</label>
                                <select id="examSubject" name="examSubject" required style="width: 100%; padding: 8px; border: 1px solid var(--border-color); border-radius: 4px; font-size: 0.9em; background: var(--card-bg); color: var(--text-primary);">
                                    ${subjectOptionsHTML}
                                </select>
                            </div>
                            <div class="form-group" style="margin-top: 15px;">
                                <label for="examTopic" style="display: block; margin-bottom: 5px; font-weight: 500; color: var(--text-primary);">Tema *</label>
                                <select id="examTopic" name="examTopic" required style="width: 100%; padding: 8px; border: 1px solid var(--border-color); border-radius: 4px; font-size: 0.9em; background: var(--card-bg); color: var(--text-primary);">
                                    <option value="">Seleccione una materia primero</option>
                                </select>
                                <small id="examTopicHelper" style="display:block; margin-top: 6px; color: var(--text-secondary); font-size: 0.8em;">Seleccione una materia para ver los temas disponibles.</small>
                            </div>
                            <div class="form-group" style="margin-top: 15px;">
                                <label for="examDate" style="display: block; margin-bottom: 5px; font-weight: 500; color: var(--text-primary);">Fecha *</label>
                                <input type="date" id="examDate" name="examDate" required value="${exam ? exam.Fecha : ''}" style="width: 100%; padding: 8px; border: 1px solid var(--border-color); border-radius: 4px; font-size: 0.9em; background: var(--card-bg); color: var(--text-primary);">
                            </div>
                            <div class="form-group" style="margin-top: 15px;">
                                <label for="examType" style="display: block; margin-bottom: 5px; font-weight: 500; color: var(--text-primary);">Tipo *</label>
                                <select id="examType" name="examType" required style="width: 100%; padding: 8px; border: 1px solid var(--border-color); border-radius: 4px; font-size: 0.9em; background: var(--card-bg); color: var(--text-primary);">
                                    <option value="">Seleccione un tipo</option>
                                    <option value="EXAMEN" ${exam && exam.Tipo === 'EXAMEN' ? 'selected' : ''}>Examen</option>
                                    <option value="PARCIAL" ${exam && exam.Tipo === 'PARCIAL' ? 'selected' : ''}>Parcial</option>
                                    <option value="TRABAJO_PRACTICO" ${exam && exam.Tipo === 'TRABAJO_PRACTICO' ? 'selected' : ''}>Trabajo Práctico</option>
                                    <option value="PROYECTO" ${exam && exam.Tipo === 'PROYECTO' ? 'selected' : ''}>Proyecto</option>
                                    <option value="ORAL" ${exam && exam.Tipo === 'ORAL' ? 'selected' : ''}>Oral</option>
                                    <option value="PRACTICO" ${exam && exam.Tipo === 'PRACTICO' ? 'selected' : ''}>Práctico</option>
                                </select>
                            </div>
                            <div class="form-group" style="margin-top: 15px;">
                                <label for="examPeso" style="display: block; margin-bottom: 5px; font-weight: 500; color: var(--text-primary);">Peso (0.00 - 9.99)</label>
                                <input type="number" id="examPeso" name="examPeso" step="0.01" min="0" max="9.99" value="${exam ? exam.Peso || 1.00 : 1.00}" style="width: 100%; padding: 8px; border: 1px solid var(--border-color); border-radius: 4px; font-size: 0.9em; background: var(--card-bg); color: var(--text-primary);">
                            </div>
                            <div class="form-group" style="margin-top: 15px;">
                                <label for="examEstado" style="display: block; margin-bottom: 5px; font-weight: 500; color: var(--text-primary);">Estado</label>
                                <select id="examEstado" name="examEstado" style="width: 100%; padding: 8px; border: 1px solid var(--border-color); border-radius: 4px; font-size: 0.9em; background: var(--card-bg); color: var(--text-primary);">
                                    <option value="PROGRAMADA" ${exam && exam.Estado === 'PROGRAMADA' ? 'selected' : ''}>Programada</option>
                                    <option value="EN_CURSO" ${exam && exam.Estado === 'EN_CURSO' ? 'selected' : ''}>En Curso</option>
                                    <option value="FINALIZADA" ${exam && exam.Estado === 'FINALIZADA' ? 'selected' : ''}>Finalizada</option>
                                    <option value="CANCELADA" ${exam && exam.Estado === 'CANCELADA' ? 'selected' : ''}>Cancelada</option>
                                </select>
                            </div>
                            <div class="form-group" style="margin-top: 15px;">
                                <label for="examDescription" style="display: block; margin-bottom: 5px; font-weight: 500; color: var(--text-primary);">Descripción</label>
                                <textarea id="examDescription" name="examDescription" rows="3" style="width: 100%; padding: 8px; border: 1px solid var(--border-color); border-radius: 4px; font-size: 0.9em; resize: vertical; font-family: inherit; background: var(--card-bg); color: var(--text-primary);">${escapeHtml(exam ? exam.Descripcion : '')}</textarea>
                            </div>
                            ${examId ? `<input type="hidden" id="examId" value="${examId}">` : ''}
                        </form>
                    </div>
                    <div class="modal-dialog-footer">
                        <button type="button" class="btn-secondary close-modal">Cancelar</button>
                        <button type="submit" form="examForm" class="btn-primary">${isEdit ? 'Actualizar' : 'Crear'} Evaluación</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Add modal to body (existing modal already removed above)
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Get modal element
    const modal = document.getElementById('examModal');
    if (!modal) {
        console.error('Error: No se pudo crear el modal');
        return;
    }
    
    // Set examId in dataset if editing
    if (examId) {
        modal.dataset.examId = examId;
    }
    
    // Setup modal handlers - use the same pattern as working dialogs
    if (typeof setupModalHandlers === 'function') {
        setupModalHandlers('examModal');
    } else {
        // Fallback modal handlers
        const closeButtons = modal.querySelectorAll('.close-modal');
        closeButtons.forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                if (typeof closeModal === 'function') {
                    closeModal('examModal');
                } else {
                    modal.classList.remove('active');
                }
                // Remove modal after animation
                setTimeout(() => {
                    if (modal && modal.parentNode) {
                        modal.remove();
                    }
                }, 300);
            });
        });
        
        // Close on overlay click
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                if (typeof closeModal === 'function') {
                    closeModal('examModal');
                } else {
                    modal.classList.remove('active');
                }
                // Remove modal after animation
                setTimeout(() => {
                    if (modal && modal.parentNode) {
                        modal.remove();
                    }
                }, 300);
            }
        });
    }
    
    // Show modal - use showModal function if available
    if (typeof showModal === 'function') {
        showModal('examModal');
    } else {
        // Fallback: manually add active class
        modal.classList.add('active');
    }

    const subjectSelect = modal.querySelector('#examSubject');
    const topicSelect = modal.querySelector('#examTopic');
    const topicHelper = modal.querySelector('#examTopicHelper');
    const submitBtn = modal.querySelector('button[type="submit"]');
    const preselectedTopicId = exam && exam.Contenido_ID_contenido ? String(exam.Contenido_ID_contenido) : '';

    const getTopicsForSubject = (subjectId) => {
        if (!subjectId || !appData || !Array.isArray(appData.contenido)) {
            return [];
        }
        const normalizedSubjectId = parseInt(subjectId);
        if (isNaN(normalizedSubjectId)) {
            return [];
        }
        return appData.contenido.filter(topic => {
            if (!topic) return false;
            const topicMateriaId = topic.Materia_ID_materia !== undefined ? parseInt(topic.Materia_ID_materia) : null;
            return topicMateriaId === normalizedSubjectId;
        });
    };

    const getBaseApiUrl = () => window.location.pathname.includes('/pages/') ? '../api' : 'api';

    const fetchTopicsForSubject = async (subjectId) => {
        const normalizedSubjectId = subjectId ? parseInt(subjectId) : NaN;
        if (!subjectId || isNaN(normalizedSubjectId)) {
            return [];
        }
        try {
            const response = await fetch(`${getBaseApiUrl()}/contenido.php?materiaId=${normalizedSubjectId}`, {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Accept': 'application/json'
                }
            });
            if (!response.ok) {
                return [];
            }
            const freshTopics = await response.json();
            if (!appData || typeof appData !== 'object') {
                appData = {};
            }
            if (!Array.isArray(appData.contenido)) {
                appData.contenido = [];
            }
            appData.contenido = appData.contenido.filter(topic => parseInt(topic.Materia_ID_materia) !== normalizedSubjectId);
            if (Array.isArray(freshTopics)) {
                appData.contenido.push(...freshTopics);
            }
            return Array.isArray(freshTopics) ? freshTopics : [];
        } catch (error) {
            console.error('Error fetching topics for subject', subjectId, error);
            return [];
        }
    };

    const updateTopicOptions = async (subjectId, selectedTopicId = '') => {
        if (!topicSelect) return false;

        const normalizedSubjectId = subjectId ? parseInt(subjectId) : NaN;
        let topics = (!subjectId || isNaN(normalizedSubjectId)) ? [] : getTopicsForSubject(subjectId);

        if (!subjectId || isNaN(normalizedSubjectId)) {
            topicSelect.innerHTML = '<option value="" disabled>Seleccione una materia primero</option>';
            topicSelect.disabled = true;
            if (topicHelper) {
                topicHelper.textContent = 'Seleccione una materia para ver los temas disponibles.';
            }
            return false;
        }

        if (!appData || !Array.isArray(appData.contenido)) {
            topicSelect.innerHTML = '<option value="" disabled>Cargando temas...</option>';
            topicSelect.disabled = true;
            if (topicHelper) {
                topicHelper.textContent = 'Cargando temas...';
            }
            topics = await fetchTopicsForSubject(subjectId);
        } else if (!topics || topics.length === 0) {
            topics = await fetchTopicsForSubject(subjectId);
        }

        if (!topics || topics.length === 0) {
            topicSelect.innerHTML = '<option value="" disabled>No hay temas disponibles. Cree un tema primero.</option>';
            topicSelect.disabled = true;
            if (topicHelper) {
                topicHelper.textContent = 'No hay temas disponibles para esta materia. Cree un tema antes de crear la evaluación.';
            }
            return false;
        }

        const selectionPlaceholder = '<option value="">Seleccione un tema</option>';
        topicSelect.innerHTML = selectionPlaceholder;
        topics.forEach(topic => {
            const option = document.createElement('option');
            option.value = topic.ID_contenido;
            option.textContent = topic.Tema || 'Tema sin título';
            topicSelect.appendChild(option);
        });
        topicSelect.disabled = false;

        const normalizedSelectedTopicId = selectedTopicId ? String(selectedTopicId) : '';
        if (normalizedSelectedTopicId && topics.some(t => String(t.ID_contenido) === normalizedSelectedTopicId)) {
            topicSelect.value = normalizedSelectedTopicId;
        } else if (topics.length === 1) {
            topicSelect.value = String(topics[0].ID_contenido);
        } else {
            topicSelect.value = '';
        }

        if (topicHelper) {
            topicHelper.textContent = 'Seleccione el tema principal de la evaluación.';
        }

        return true;
    };

    if (subjectSelect) {
        const initialSubjectId = subjectSelect.value;
        updateTopicOptions(initialSubjectId, preselectedTopicId).then(hasTopics => {
            if (submitBtn) {
                submitBtn.disabled = !hasTopics;
            }
        });

        subjectSelect.addEventListener('change', async (event) => {
            const selectedSubjectId = event.target.value;
            const topicsAvailable = await updateTopicOptions(selectedSubjectId);
            if (submitBtn) {
                submitBtn.disabled = !topicsAvailable;
            }
        });
    }

    if (!subjectSelect && submitBtn) {
        submitBtn.disabled = true;
    }
}

// Make showExamModal globally available to prevent conflicts
window.showExamModal = showExamModal;

async function saveExam(event) {
    event.preventDefault();
    event.stopPropagation();
    
    const isInPages = window.location.pathname.includes('/pages/');
    const baseUrl = isInPages ? '../api' : 'api';
    
    // Obtener el formulario desde el evento
    const form = event.target;
    if (!form || form.tagName !== 'FORM') {
        alert('Error: No se pudo encontrar el formulario.');
        return;
    }
    
    // Obtener referencias directas a los campos
    const titleEl = form.querySelector('#examTitle');
    const subjectEl = form.querySelector('#examSubject');
    const dateEl = form.querySelector('#examDate');
    const typeEl = form.querySelector('#examType');
    const topicEl = form.querySelector('#examTopic');
    
    // Obtener valores usando el formulario como contexto
    const titulo = (titleEl?.value || '').trim();
    const materiaValue = subjectEl?.value || '';
    const materiaId = materiaValue && !isNaN(parseInt(materiaValue)) ? parseInt(materiaValue) : 0;
    const fecha = dateEl?.value || '';
    const tipo = (typeEl?.value || '').trim().toUpperCase();
    const topicValue = topicEl?.value || '';
    const contenidoId = topicValue && !isNaN(parseInt(topicValue)) ? parseInt(topicValue) : 0;
    const descripcion = (form.querySelector('#examDescription')?.value || '').trim() || null;
    const peso = parseFloat(form.querySelector('#examPeso')?.value || '1.00') || 1.00;
    const estado = form.querySelector('#examEstado')?.value || 'PROGRAMADA';
    
    // Validar campos requeridos
    const missingFields = [];
    const errors = [];
    
    // Validar Título
    if (!titulo || titulo.length === 0) {
        missingFields.push('Título');
        errors.push('El título está vacío');
        if (titleEl) titleEl.focus();
    }
    
    // Validar Materia
    if (!materiaValue || materiaValue === '' || materiaValue === '0' || isNaN(materiaId) || materiaId <= 0) {
        missingFields.push('Materia');
        errors.push('Debe seleccionar una materia válida (valor recibido: "' + materiaValue + '")');
        if (subjectEl) subjectEl.focus();
    }
    
    // Validar Fecha
    if (!fecha || fecha.trim() === '') {
        missingFields.push('Fecha');
        errors.push('La fecha está vacía');
        if (dateEl) dateEl.focus();
    }
    
    // Validar Tipo
    if (!tipo || tipo.trim() === '') {
        missingFields.push('Tipo');
        errors.push('Debe seleccionar un tipo de evaluación');
        if (typeEl) typeEl.focus();
    }

    // Validar Tema
    if (!contenidoId || contenidoId <= 0) {
        missingFields.push('Tema');
        errors.push('Debe seleccionar un tema válido para la evaluación');
        if (topicEl) topicEl.focus();
    }
    
    if (missingFields.length > 0) {
        const message = 'Por favor, complete todos los campos requeridos:\n\n' + 
                       missingFields.map((field, idx) => `• ${field}: ${errors[idx] || 'Campo requerido'}`).join('\n');
        alert(message);
        return;
    }
    
    // Construir objeto con datos validados
    const examData = {
        Titulo: titulo,
        Materia_ID_materia: materiaId,
        Contenido_ID_contenido: contenidoId,
        Fecha: fecha,
        Tipo: tipo,
        Descripcion: descripcion,
        Peso: peso,
        Estado: estado
    };
    
    // Determinar si es crear o actualizar
    const examModal = document.getElementById('examModal');
    const existingExamId = examModal ? (examModal.dataset.examId || document.getElementById('examId')?.value) : null;
    const isEdit = existingExamId && !isNaN(parseInt(existingExamId));
    const url = isEdit ? `${baseUrl}/evaluacion.php?id=${existingExamId}` : `${baseUrl}/evaluacion.php`;
    const method = isEdit ? 'PUT' : 'POST';
    
    try {
        const response = await fetch(url, {
            method: method,
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(examData)
        });
        
        const result = await response.json();
        
        if (response.ok && (result.success !== false && result.id)) {
            // Recargar datos desde el servidor
            await loadData();
            
            // Cerrar modal
            const modal = document.getElementById('examModal');
            if (modal) {
                modal.remove();
            }
            
    loadExams();
            
            // Mostrar mensaje de éxito
            if (typeof showNotification === 'function') {
                showNotification(isEdit ? 'Evaluación actualizada exitosamente' : 'Evaluación creada exitosamente', 'success');
            } else {
                alert(isEdit ? 'Evaluación actualizada exitosamente' : 'Evaluación creada exitosamente');
            }
        } else {
            const errorMsg = result.message || result.error || 'Error al guardar la evaluación';
            throw new Error(errorMsg);
        }
    } catch (error) {
        alert('Error: ' + error.message);
    }
}

async function editExam(id) {
    const exam = appData.evaluacion.find(e => e.ID_evaluacion === id);
    if (!exam) {
        alert('Evaluación no encontrada.');
        return;
    }
    
    await showExamModal(id);
}

// Make editExam globally available and ensure it uses the correct showExamModal
window.editExam = editExam;

async function deleteExam(id) {
    const exam = appData.evaluacion.find(e => e.ID_evaluacion === id);
    if (!exam) {
        alert('Evaluación no encontrada.');
        return;
    }
    
    if (!confirm(`¿Está seguro de que desea eliminar la evaluación "${exam.Titulo}"?`)) {
        return;
    }
    
    const isInPages = window.location.pathname.includes('/pages/');
    const baseUrl = isInPages ? '../api' : 'api';
    
    try {
        const response = await fetch(`${baseUrl}/evaluacion.php?id=${id}`, {
            method: 'DELETE',
            credentials: 'include',
            headers: {
                'Accept': 'application/json'
            }
        });
        
        const result = await response.json();
        
        if (response.ok && result.success !== false) {
            // Recargar datos desde el servidor
            await loadData();
            loadExams();
            
            // Mostrar mensaje de éxito
            if (typeof showNotification === 'function') {
                showNotification('Evaluación eliminada exitosamente', 'success');
            }
        } else {
            throw new Error(result.message || 'Error al eliminar la evaluación');
        }
    } catch (error) {
        alert(error.message || 'Error al eliminar la evaluación. Por favor, intente nuevamente.');
    }
}

// Make gradeExam globally available
window.gradeExam = function(examId) {
    // Ensure appData is available
    if (!appData) {
        if (window.appData) {
            appData = window.appData;
        } else if (window.data) {
            appData = window.data;
        } else {
            alert('Error: Los datos no están cargados. Por favor, recargue la página.');
            return;
        }
    }
    
    // Normalize ID for lookup
    const normalizedId = parseInt(examId);
    if (isNaN(normalizedId)) {
        alert('Error: ID de evaluación inválido.');
        return;
    }
    
    // Find evaluation using normalized ID
    const exam = appData.evaluacion.find(e => {
        const evalId = parseInt(e.ID_evaluacion);
        return evalId === normalizedId;
    });
    
    if (!exam) {
        alert('Evaluación no encontrada.');
        return;
    }
    
    // Obtener la materia
    const materiaId = parseInt(exam.Materia_ID_materia);
    const materia = appData.materia.find(m => {
        const mId = parseInt(m.ID_materia);
        return mId === materiaId;
    });
    
    if (!materia) {
        alert('Materia no encontrada.');
        return;
    }
    
    // Open the grade marking view directly (calificar estudiantes)
    if (typeof openGradeMarkingForExam === 'function') {
        openGradeMarkingForExam(normalizedId);
    } else if (typeof window.openGradeMarkingForExam === 'function') {
        window.openGradeMarkingForExam(normalizedId);
    } else {
        alert('Error: No se pudo abrir la vista de calificación. Por favor, recargue la página.');
    }
};

function showGradeModal(exam, materia, estudiantes, notasExistentes) {
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.id = 'gradeModal';
    
    // Crear mapa de notas por estudiante para fácil acceso
    const notasMap = {};
    notasExistentes.forEach(nota => {
        notasMap[nota.Estudiante_ID_Estudiante] = nota;
    });
    
    modal.innerHTML = `
        <div class="modal-content grade-modal-content">
            <div class="modal-header">
                <h3>Calificar Estudiantes - ${exam.Titulo}</h3>
                <button class="close-modal">&times;</button>
            </div>
            <div class="modal-body">
                <div class="grade-modal-info">
                    <p><strong>Materia:</strong> ${materia.Nombre}</p>
                    <p><strong>Fecha:</strong> ${exam.Fecha}</p>
                    <p><strong>Tipo:</strong> ${exam.Tipo}</p>
                </div>
                
                <form id="gradeForm" onsubmit="saveGrades(event, ${exam.ID_evaluacion})">
                    <div class="table-responsive">
                        <table class="data-table grade-modal-table">
                            <thead>
                                <tr>
                                    <th class="col-number">#</th>
                                    <th>Estudiante</th>
                                    <th class="col-grade">Calificación</th>
                                    <th class="col-status">Estado</th>
                                    <th class="col-observations">Observaciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${estudiantes.map((estudiante, index) => {
                                    const notaExistente = notasMap[estudiante.ID_Estudiante];
                                    const calificacion = notaExistente ? notaExistente.Calificacion : '';
                                    // Detectar ausente: calificación 0 o 1 con observación "AUSENTE" o es null/empty
                                    const esAusente = notaExistente && (notaExistente.Calificacion == 0 || notaExistente.Calificacion == 1) && 
                                                     (notaExistente.Observacion === 'AUSENTE' || 
                                                      !notaExistente.Observacion || 
                                                      notaExistente.Observacion.trim() === '');
                                    const observacion = notaExistente ? (notaExistente.Observacion || '') : '';
                                    
                                    return `
                                        <tr data-student-id="${estudiante.ID_Estudiante}">
                                            <td>${index + 1}</td>
                                            <td><strong>${estudiante.Apellido}, ${estudiante.Nombre}</strong></td>
                                            <td>
                                                <div class="grade-input-wrapper">
                                                    <input type="number" 
                                                           id="grade_${estudiante.ID_Estudiante}"
                                                           name="grade_${estudiante.ID_Estudiante}"
                                                           class="grade-input" 
                                                           min="1" 
                                                           max="10" 
                                                           step="0.01" 
                                                           value="${calificacion && calificacion > 0 ? calificacion : ''}"
                                                           placeholder="1-10"
                                                           ${esAusente ? 'disabled' : ''}>
                                                    <label class="ausente-label">
                                                        <input type="checkbox" 
                                                               id="ausente_${estudiante.ID_Estudiante}"
                                                               name="ausente_${estudiante.ID_Estudiante}"
                                                               class="ausente-checkbox"
                                                               ${esAusente ? 'checked' : ''}
                                                               onchange="toggleAusente(${estudiante.ID_Estudiante}, this.checked)">
                                                        Ausente
                                                    </label>
                                                </div>
                                            </td>
                                            <td>
                                                <span class="status-badge ${notaExistente ? 'graded' : 'pending'}">
                                                    ${notaExistente ? 'Calificado' : 'Pendiente'}
                                                </span>
                                            </td>
                                            <td>
                                                <input type="text" 
                                                       id="observacion_${estudiante.ID_Estudiante}"
                                                       name="observacion_${estudiante.ID_Estudiante}"
                                                       class="observacion-input"
                                                       value="${observacion}"
                                                       placeholder="Observaciones...">
                                            </td>
                                        </tr>
                                    `;
                                }).join('')}
                            </tbody>
                        </table>
                    </div>
                    <div class="form-actions">
                        <button type="button" class="btn-secondary close-modal">Cancelar</button>
                        <button type="submit" class="btn-primary">
                            <i class="fas fa-save"></i> Guardar Calificaciones
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Setup modal handlers
    if (typeof setupModalHandlers === 'function') {
        setupModalHandlers(modal);
    } else {
        modal.querySelector('.close-modal').addEventListener('click', () => {
            modal.remove();
        });
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    enforceExamGradeLimits(modal.querySelectorAll('.grade-input'));
}

function toggleAusente(studentId, isAusente) {
    const gradeInput = document.getElementById(`grade_${studentId}`);
    if (gradeInput) {
        gradeInput.disabled = isAusente;
        if (isAusente) {
            gradeInput.value = '';
        }
    }
}

async function saveGrades(event, examId) {
    event.preventDefault();
    
    const isInPages = window.location.pathname.includes('/pages/');
    const baseUrl = isInPages ? '../api' : 'api';
    
    const form = event.target;
    const rows = form.querySelectorAll('tbody tr[data-student-id]');
    
    const notas = [];
    const errors = [];
    
    rows.forEach(row => {
        const studentId = parseInt(row.dataset.studentId);
        const gradeInput = document.getElementById(`grade_${studentId}`);
        const ausenteCheckbox = document.getElementById(`ausente_${studentId}`);
        const observacionInput = document.getElementById(`observacion_${studentId}`);
        
        const esAusente = ausenteCheckbox ? ausenteCheckbox.checked : false;
        const calificacion = gradeInput ? gradeInput.value.trim() : '';
        const observacion = observacionInput ? observacionInput.value.trim() : null;
        
        // Solo agregar si hay calificación o está marcado como ausente
        if (calificacion || esAusente) {
            const notaData = {
                Evaluacion_ID_evaluacion: examId,
                Estudiante_ID_Estudiante: studentId,
                Calificacion: esAusente ? 1 : parseFloat(calificacion),
                Observacion: esAusente ? 'AUSENTE' : (observacion || null),
                Estado: 'DEFINITIVA'
            };
            
            // Validar calificación si no es ausente
            if (!esAusente) {
                const calif = parseFloat(calificacion);
                if (isNaN(calif) || calif < 1 || calif > 10) {
                    errors.push(`Estudiante ${studentId}: Calificación inválida (debe ser entre 1 y 10)`);
                    return;
                }
            }
            
            notas.push(notaData);
        }
    });
    
    if (notas.length === 0 && errors.length === 0) {
        alert('Debe ingresar al menos una calificación o marcar al menos un estudiante como ausente.');
        return;
    }
    
    if (errors.length > 0) {
        alert('Errores encontrados:\n\n' + errors.join('\n'));
        return;
    }
    
    // Guardar notas (puede ser múltiple)
    try {
        let saved = 0;
        let failed = 0;
        
        for (const nota of notas) {
            try {
                const response = await fetch(`${baseUrl}/notas.php`, {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify(nota)
                });
                
                const result = await response.json();
                
                if (response.ok && result.success !== false) {
                    saved++;
                } else {
                    failed++;
                }
            } catch (error) {
                failed++;
            }
        }
        
        if (saved > 0) {
            // Recargar datos
            await loadData();
            
            // Cerrar modal
            const modal = document.getElementById('gradeModal');
            if (modal) {
                modal.remove();
            }
            
            // Recargar exámenes
        loadExams();
            
            // Recargar vista de estudiantes para mostrar calificaciones recientes actualizadas
            if (typeof loadUnifiedStudentData === 'function') {
                loadUnifiedStudentData();
            }
            
            // Mostrar mensaje de éxito
            const message = failed > 0 
                ? `Se guardaron ${saved} calificación(es). ${failed} fallaron.` 
                : `Se guardaron ${saved} calificación(es) exitosamente.`;
            
            if (typeof showNotification === 'function') {
                showNotification(message, saved === notas.length ? 'success' : 'warning');
            } else {
                alert(message);
            }
        } else {
            alert('No se pudo guardar ninguna calificación. Por favor, intente nuevamente.');
        }
    } catch (error) {
        alert('Error al guardar las calificaciones. Por favor, intente nuevamente.');
    }
}

function enforceExamGradeLimits(inputs) {
    if (!inputs) return;

    const clamp = (input) => {
        if (!input || input.disabled) return;
        const raw = input.value;
        if (raw === '' || raw === null) {
            return;
        }
        let value = parseFloat(raw);
        if (isNaN(value)) {
            input.value = '';
            return;
        }
        const minAttr = input.getAttribute('min');
        const maxAttr = input.getAttribute('max');
        const min = minAttr !== null ? parseFloat(minAttr) : null;
        const max = maxAttr !== null ? parseFloat(maxAttr) : null;
        if (max !== null && value > max) value = max;
        if (min !== null && value < min) value = min;
        const stepAttr = input.getAttribute('step');
        if (stepAttr && stepAttr.indexOf('.') >= 0) {
            const decimals = stepAttr.split('.')[1].length;
            input.value = value.toFixed(decimals);
        } else {
            input.value = String(value);
        }
    };

    inputs.forEach(input => {
        input.addEventListener('input', () => clamp(input));
        input.addEventListener('blur', () => clamp(input));
    });
}

// Make viewExamNotes globally available
window.viewExamNotes = function(examId) {
    try {
        // Store the current exam ID for the notes view
        window.currentExamId = examId;
        
        // Hide exams tab content and show exam notes tab content
        const examsTabContent = document.getElementById('examsTabContent');
        const examNotesTabContent = document.getElementById('examNotesTabContent');
        
        if (!examsTabContent || !examNotesTabContent) {
            alert('Error: No se encontraron los elementos necesarios. Por favor, recargue la página.');
            return;
        }
        
        examsTabContent.style.display = 'none';
        examNotesTabContent.style.display = 'block';
        
        // Hide exam control buttons
        hideExamControls();
        
        // Load the exam notes view
        loadExamNotesView(examId);
    } catch (error) {
        alert('Error al cargar las notas del examen: ' + error.message);
        // Try to restore UI
        const examsTabContent = document.getElementById('examsTabContent');
        if (examsTabContent) {
            examsTabContent.style.display = 'block';
        }
        showExamControls();
    }
};

function hideExamControls() {
    // Hide the exam view controls (grid/list toggle)
    const examsViewControls = document.querySelector('.exams-view-controls');
    if (examsViewControls) {
        examsViewControls.style.display = 'none';
    }
    
    // Hide student management section header (filters, buttons, etc.)
    const sectionHeader = document.querySelector('#student-management .section-header');
    if (sectionHeader) {
        sectionHeader.style.display = 'none';
    }
    
    // Hide tab navigation
    const tabNavigation = document.querySelector('.tab-navigation');
    if (tabNavigation) {
        tabNavigation.style.display = 'none';
    }
    
    // Hide students tab content
    const studentsTabContent = document.getElementById('studentsTabContent');
    if (studentsTabContent) {
        studentsTabContent.style.display = 'none';
    }
}

function showExamControls() {
    // Show the exam view controls (grid/list toggle)
    const examsViewControls = document.querySelector('.exams-view-controls');
    if (examsViewControls) {
        examsViewControls.style.display = 'block';
    }
    
    // Show student management section header
    const sectionHeader = document.querySelector('#student-management .section-header');
    if (sectionHeader) {
        sectionHeader.style.display = 'flex';
    }
    
    // Show tab navigation
    const tabNavigation = document.querySelector('.tab-navigation');
    if (tabNavigation) {
        tabNavigation.style.display = 'flex';
    }
    
    // Show students tab content
    const studentsTabContent = document.getElementById('studentsTabContent');
    if (studentsTabContent) {
        studentsTabContent.style.display = 'block';
    }
}

function loadExamNotesView(examId) {
    // Ensure appData is available
    if (!appData) {
        if (window.appData) {
            appData = window.appData;
        } else if (window.data) {
            appData = window.data;
        } else {
            const notesList = document.getElementById('notesList');
            if (notesList) {
                notesList.innerHTML = '<div class="empty-state"><p>Error: No se pudieron cargar los datos.</p></div>';
            }
            return;
        }
    }
    
    // Normalize ID for lookup
    const normalizedId = parseInt(examId);
    if (isNaN(normalizedId)) {
        return;
    }
    
    // Find evaluation using normalized ID
    const exam = appData.evaluacion.find(e => {
        const evalId = parseInt(e.ID_evaluacion);
        return evalId === normalizedId;
    });
    
    if (!exam) {
        const notesList = document.getElementById('notesList');
        if (notesList) {
            notesList.innerHTML = '<div class="empty-state"><p>Evaluación no encontrada.</p></div>';
        }
        return;
    }

    // Get all notes for this exam using normalized ID
    const examNotes = appData.notas.filter(note => {
        const noteEvalId = parseInt(note.Evaluacion_ID_evaluacion);
        return noteEvalId === normalizedId;
    });
    
    // Get subject information
    const materiaId = parseInt(exam.Materia_ID_materia);
    const subject = appData.materia.find(s => {
        const sId = parseInt(s.ID_materia);
        return sId === materiaId;
    });
    
    // Load exam info summary first (this will show the exam details)
    loadExamInfoSummary(exam, subject, examNotes.length);
    
    // Load notes list
    loadNotesList(examNotes);
    
    // Setup export button
    setupExportButton(examId, examNotes.length);
    
    // Ensure back button event listener is set up (in case it wasn't initialized)
    const backToExamsBtn = document.getElementById('backToExamsBtn');
    if (backToExamsBtn) {
        // Remove any existing listeners by cloning and replacing
        const newBtn = backToExamsBtn.cloneNode(true);
        backToExamsBtn.parentNode.replaceChild(newBtn, backToExamsBtn);
        
        // Add event listener
        newBtn.addEventListener('click', (e) => {
            e.preventDefault();
            backToExams();
        });
    }
}

function loadExamInfoSummary(exam, subject, notesCount) {
    const examInfoSummary = document.getElementById('examInfoSummary');
    if (!examInfoSummary) return;

    const topic = appData && appData.contenido
        ? appData.contenido.find(t => parseInt(t.ID_contenido) === parseInt(exam.Contenido_ID_contenido))
        : null;

    examInfoSummary.innerHTML = `
        <h3 class="exam-summary-title">${exam.Titulo || 'Evaluación'}</h3>
        <div class="exam-summary-grid">
            <div class="summary-item">
                <span class="summary-label">Materia:</span>
                <span class="summary-value">${subject ? subject.Nombre : 'Materia desconocida'}</span>
            </div>
            <div class="summary-item">
                <span class="summary-label">Tema:</span>
                <span class="summary-value">${topic ? topic.Tema : 'Sin tema asignado'}</span>
            </div>
            <div class="summary-item">
                <span class="summary-label">Fecha:</span>
                <span class="summary-value">${exam.Fecha || 'N/A'}</span>
            </div>
            <div class="summary-item">
                <span class="summary-label">Tipo:</span>
                <span class="summary-value">${exam.Tipo || 'N/A'}</span>
            </div>
            <div class="summary-item">
                <span class="summary-label">Estado:</span>
                <span class="summary-value status-${exam.Estado ? exam.Estado.toLowerCase() : 'programada'}">${exam.Estado || 'PROGRAMADA'}</span>
            </div>
            <div class="summary-item">
                <span class="summary-label">Total de Calificaciones:</span>
                <span class="summary-value summary-value-bold">${notesCount}</span>
            </div>
        </div>
    `;
}

function loadNotesList(examNotes) {
    const notesList = document.getElementById('notesList');
    if (!notesList) return;
    
    if (examNotes.length > 0) {
        // Load notes table using the same pattern as exams list
        notesList.innerHTML = `
            <div style="margin-bottom: 20px;">
                <button class="btn-primary" onclick="window.openGradeMarkingForExam(window.currentExamId)" style="padding: 10px 20px;">
                    <i class="fas fa-plus"></i>
                    Agregar/Editar Calificaciones
                </button>
            </div>
            <div class="table-responsive">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Estudiante</th>
                            <th>Calificación</th>
                            <th>Fecha</th>
                            <th>Estado</th>
                            <th>Observaciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${examNotes.map(note => {
                            const studentId = parseInt(note.Estudiante_ID_Estudiante);
                            const student = appData.estudiante.find(s => {
                                const sId = parseInt(s.ID_Estudiante);
                                return sId === studentId;
                            });
                            const gradeValue = note.Calificacion;
                            const isAbsent = ((gradeValue == 0 || gradeValue == 1) && note.Observacion === 'AUSENTE') || gradeValue === 'AUSENTE';
                            const gradeDisplay = isAbsent ? 'Ausente' : gradeValue;
                            return `
                                <tr>
                                    <td><strong>${student ? `${student.Apellido}, ${student.Nombre}` : 'Estudiante desconocido'}</strong></td>
                                    <td class="grade-cell ${getGradeClass(note.Calificacion)}">${gradeDisplay}</td>
                                    <td>${note.Fecha_calificacion || 'N/A'}</td>
                                    <td><span class="status-badge status-${note.Estado ? note.Estado.toLowerCase() : 'definitiva'}">${note.Estado || 'DEFINITIVA'}</span></td>
                                    <td>${note.Observacion || 'Sin observaciones'}</td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        `;
    } else {
        // Show only the button to open grade marking modal (replacing empty state message)
        notesList.innerHTML = `
            <div style="text-align: center; padding: 40px;">
                <button class="btn-primary" onclick="window.openGradeMarkingForExam(window.currentExamId)" style="padding: 12px 24px; font-size: 1rem;">
                    <i class="fas fa-clipboard-check"></i>
                    Calificar Estudiantes
                </button>
            </div>
        `;
    }
}

function setupExportButton(examId, notesCount) {
    const exportBtn = document.getElementById('exportExamNotesBtn');
    if (!exportBtn) return;
    
    if (notesCount > 0) {
        exportBtn.style.display = 'flex';
        exportBtn.onclick = () => exportExamNotes(examId);
    } else {
        exportBtn.style.display = 'none';
    }
}

// Function to open grade marking view with a specific evaluation pre-selected
window.openGradeMarkingForExam = async function(examId) {
    if (!examId) {
        examId = window.currentExamId;
    }
    
    if (!examId) {
        alert('Error: No se pudo identificar la evaluación.');
        return;
    }
    
    // First, go back to exams view to show the grade marking section
    const examsTabContent = document.getElementById('examsTabContent');
    const examNotesTabContent = document.getElementById('examNotesTabContent');
    
    if (examNotesTabContent) {
        examNotesTabContent.style.display = 'none';
    }
    if (examsTabContent) {
        examsTabContent.style.display = 'block';
    }
    
    // Show exam controls
    showExamControls();
    
    // Navigate to grade marking section
    if (typeof showSection === 'function') {
        showSection('grade-marking');
    }
    
    // Wait a bit for the section to be visible, then show the grade marking view
    setTimeout(async () => {
        // Show grade marking view
        if (typeof showGradeMarkingView === 'function') {
            await showGradeMarkingView();
        }
        
        // Pre-select the evaluation in the dropdown
        const evaluationSelect = document.getElementById('gradeEvaluation');
        if (evaluationSelect) {
            const normalizedExamId = parseInt(examId);
            // Wait for dropdown to be populated
            let attempts = 0;
            const checkDropdown = setInterval(() => {
                attempts++;
                if (evaluationSelect.options.length > 1 || attempts > 10) {
                    clearInterval(checkDropdown);
                    // Find the option with matching value
                    for (let option of evaluationSelect.options) {
                        const optionValue = parseInt(option.value);
                        if (optionValue === normalizedExamId) {
                            evaluationSelect.value = option.value;
                            // Trigger change event to load students
                            evaluationSelect.dispatchEvent(new Event('change'));
                            break;
                        }
                    }
                }
            }, 100);
        }
    }, 300);
};

function backToExams() {
    // Hide exam notes tab content
    const examNotesTabContent = document.getElementById('examNotesTabContent');
    if (examNotesTabContent) {
        examNotesTabContent.style.display = 'none';
    }
    
    // Navigate to student-management section
    if (typeof showSection === 'function') {
        showSection('student-management', 'exams');
    } else {
        // Fallback: manually show the section
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.remove('active');
        });
        const studentSection = document.getElementById('student-management');
        if (studentSection) {
            studentSection.classList.add('active');
        }
    }
    
    // Explicitly hide students tab and show exams tab
    setTimeout(() => {
        // Hide students tab content explicitly
        const studentsTabContent = document.getElementById('studentsTabContent');
        if (studentsTabContent) {
            studentsTabContent.classList.remove('active');
            studentsTabContent.style.display = 'none';
        }
        
        // Deactivate students tab button
        const studentsTab = document.getElementById('studentsTab');
        if (studentsTab) {
            studentsTab.classList.remove('active');
        }
        
        // Show exams tab content
        const examsTabContent = document.getElementById('examsTabContent');
        if (examsTabContent) {
            examsTabContent.classList.add('active');
            examsTabContent.style.display = 'block';
        }
        
        // Activate exams tab button
        const examsTab = document.getElementById('examsTab');
        if (examsTab) {
            examsTab.classList.add('active');
        }
        
        // Show/hide appropriate action buttons
        document.querySelectorAll('.students-only').forEach(btn => btn.style.display = 'none');
        document.querySelectorAll('.exams-only').forEach(btn => btn.style.display = 'flex');
    }, 50);
    
    // Show exam control buttons again
    if (typeof showExamControls === 'function') {
        showExamControls();
    }
    
    // Clear the current exam ID
    window.currentExamId = null;
}

// Make function globally available
window.backToExams = backToExams;

function getGradeClass(grade) {
    if (grade >= 8) return 'excellent';
    if (grade >= 6) return 'good';
    if (grade >= 4) return 'average';
    return 'poor';
}

function exportExamNotes(examId) {
    const exam = appData.evaluacion.find(e => e.ID_evaluacion === examId);
    
    if (!exam) {
        alert('Exam not found.');
        return;
    }
    
    const examNotes = appData.notas.filter(note => note.Evaluacion_ID_evaluacion === examId);
    const subject = appData.materia.find(s => s.ID_materia === exam.Materia_ID_materia);
    
    if (examNotes.length === 0) {
        alert('No notes to export for this exam.');
        return;
    }
    
    // Create Excel content with proper headers in Spanish (usando punto y coma como separador)
    const separator = ';';
    let csvContent = `"Apellido"${separator}"Nombre"${separator}"Calificación"${separator}"Fecha"${separator}"Estado"${separator}"Observaciones"\n`;
    
    examNotes.forEach(note => {
        const student = appData.estudiante.find(s => s.ID_Estudiante === note.Estudiante_ID_Estudiante);
        const apellido = student ? student.Apellido : '';
        const nombre = student ? student.Nombre : '';
        // Si no hay calificación, dejar campo vacío
        const calificacion = (note.Calificacion !== null && note.Calificacion !== undefined && note.Calificacion !== '') 
            ? note.Calificacion 
            : '';
        const fecha = note.Fecha_calificacion || '';
        const estado = note.Estado || '';
        const observaciones = (note.Observacion || '').replace(/"/g, '""');
        
        csvContent += `"${apellido}"${separator}"${nombre}"${separator}"${calificacion}"${separator}"${fecha}"${separator}"${estado}"${separator}"${observaciones}"\n`;
    });
    
    // Create and download file with BOM UTF-8 for proper accents as Excel
    const encoder = new TextEncoder();
    const bomBytes = new Uint8Array([0xEF, 0xBB, 0xBF]);
    const contentBytes = encoder.encode(csvContent);
    const finalContent = new Uint8Array(bomBytes.length + contentBytes.length);
    finalContent.set(bomBytes, 0);
    finalContent.set(contentBytes, bomBytes.length);
    
    const blob = new Blob([finalContent], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    const safeTitle = exam.Titulo.replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ]/g, '_');
    link.setAttribute('download', `notas_examen_${safeTitle}_${exam.Fecha}.xls`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
