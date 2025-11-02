// Exam Management
function initializeExams() {
    const createExamBtn = document.getElementById('createExamBtn');
    const backToExamsBtn = document.getElementById('backToExamsBtn');
    
    if (createExamBtn) {
        createExamBtn.addEventListener('click', () => {
            showExamModal(); // Sin ID = crear nueva
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
    
    let filteredExams = appData.evaluacion || [];
    
    // Filter by current teacher's subjects first
    if (teacherId) {
        let teacherSubjects = appData.materia.filter(subject => subject.Usuarios_docente_ID_docente === teacherId);
        
        // Filter by course/division if selected
        if (selectedCourse) {
            teacherSubjects = teacherSubjects.filter(subject => subject.Curso_division === selectedCourse);
        }
        
        const teacherSubjectIds = teacherSubjects.map(subject => subject.ID_materia);
        filteredExams = filteredExams.filter(exam => teacherSubjectIds.includes(exam.Materia_ID_materia));
    }
    
    // Filter by subject
    if (selectedSubject) {
        const subjectId = parseInt(selectedSubject);
        filteredExams = filteredExams.filter(exam => exam.Materia_ID_materia === subjectId);
    }
    
    // Filter by date
    if (selectedDate) {
        const today = new Date();
        const todayStr = today.toISOString().split('T')[0];
        
        filteredExams = filteredExams.filter(exam => {
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
        return `
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">${exam.Titulo}</h3>
                    <div class="card-actions">
                        <button class="btn-icon btn-grade" onclick="gradeExam(${exam.ID_evaluacion})" title="Calificar Estudiantes">
                            <i class="fas fa-clipboard-check"></i>
                        </button>
                        <button class="btn-icon btn-view" onclick="viewExamNotes(${exam.ID_evaluacion})" title="Ver Notas">
                            <i class="fas fa-eye"></i>
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
                        <th>Title</th>
                        <th>Subject</th>
                        <th>Type</th>
                        <th>Date</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${filteredExams.map(exam => {
                        const subject = appData.materia.find(s => s.ID_materia === exam.Materia_ID_materia);
                        const shortDate = exam.Fecha.split('-').slice(1).join('/');
                        return `
                            <tr>
                                <td><strong>${exam.Titulo}</strong></td>
                                <td>${subject ? subject.Nombre : 'Unknown'}</td>
                                <td>${exam.Tipo}</td>
                                <td>${shortDate}</td>
                                <td>${exam.Estado}</td>
                                <td>
                                    <div class="table-actions">
                                        <button class="btn-icon btn-grade" onclick="gradeExam(${exam.ID_evaluacion})" title="Calificar Estudiantes">
                                            <i class="fas fa-clipboard-check"></i>
                                        </button>
                                        <button class="btn-icon btn-view" onclick="viewExamNotes(${exam.ID_evaluacion})" title="Ver Notas">
                                            <i class="fas fa-eye"></i>
                                        </button>
                                        <button class="btn-icon btn-edit" onclick="editExam(${exam.ID_evaluacion})" title="Edit">
                                            <i class="fas fa-edit"></i>
                                        </button>
                                        <button class="btn-icon btn-delete" onclick="deleteExam(${exam.ID_evaluacion})" title="Delete">
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

function showExamModal(examId = null) {
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.id = 'examModal';
    if (examId) {
        modal.dataset.examId = examId;
    }
    
    // Obtener materias del docente actual
    const currentUserId = localStorage.getItem('userId');
    const teacherId = currentUserId ? parseInt(currentUserId) : null;
    let teacherSubjects = appData.materia || [];
    
    if (teacherId) {
        teacherSubjects = teacherSubjects.filter(s => s.Usuarios_docente_ID_docente === teacherId);
    }
    
    const exam = examId ? appData.evaluacion.find(e => e.ID_evaluacion === examId) : null;
    const isEdit = !!exam;
    
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>${isEdit ? 'Editar Evaluación' : 'Crear Evaluación'}</h3>
                <button class="close-modal">&times;</button>
            </div>
            <form class="modal-form" id="examForm" onsubmit="saveExam(event); return false;">
                <div class="form-group">
                    <label for="examTitle">Título *</label>
                    <input type="text" id="examTitle" name="examTitle" required value="${exam ? exam.Titulo : ''}" autocomplete="off">
                </div>
                <div class="form-group">
                    <label for="examSubject">Materia *</label>
                    <select id="examSubject" name="examSubject" required>
                        <option value="">Seleccione una materia</option>
                        ${teacherSubjects.map(s => 
                            `<option value="${s.ID_materia}" ${exam && exam.Materia_ID_materia === s.ID_materia ? 'selected' : ''}>${s.Nombre}</option>`
                        ).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label for="examDate">Fecha *</label>
                    <input type="date" id="examDate" name="examDate" required value="${exam ? exam.Fecha : ''}">
                </div>
                <div class="form-group">
                    <label for="examType">Tipo *</label>
                    <select id="examType" name="examType" required>
                        <option value="">Seleccione un tipo</option>
                        <option value="EXAMEN" ${exam && exam.Tipo === 'EXAMEN' ? 'selected' : ''}>Examen</option>
                        <option value="PARCIAL" ${exam && exam.Tipo === 'PARCIAL' ? 'selected' : ''}>Parcial</option>
                        <option value="TRABAJO_PRACTICO" ${exam && exam.Tipo === 'TRABAJO_PRACTICO' ? 'selected' : ''}>Trabajo Práctico</option>
                        <option value="PROYECTO" ${exam && exam.Tipo === 'PROYECTO' ? 'selected' : ''}>Proyecto</option>
                        <option value="ORAL" ${exam && exam.Tipo === 'ORAL' ? 'selected' : ''}>Oral</option>
                        <option value="PRACTICO" ${exam && exam.Tipo === 'PRACTICO' ? 'selected' : ''}>Práctico</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="examPeso">Peso (0.00 - 9.99)</label>
                    <input type="number" id="examPeso" name="examPeso" step="0.01" min="0" max="9.99" value="${exam ? exam.Peso || 1.00 : 1.00}">
                </div>
                <div class="form-group">
                    <label for="examEstado">Estado</label>
                    <select id="examEstado" name="examEstado">
                        <option value="PROGRAMADA" ${exam && exam.Estado === 'PROGRAMADA' ? 'selected' : ''}>Programada</option>
                        <option value="EN_CURSO" ${exam && exam.Estado === 'EN_CURSO' ? 'selected' : ''}>En Curso</option>
                        <option value="FINALIZADA" ${exam && exam.Estado === 'FINALIZADA' ? 'selected' : ''}>Finalizada</option>
                        <option value="CANCELADA" ${exam && exam.Estado === 'CANCELADA' ? 'selected' : ''}>Cancelada</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="examDescription">Descripción</label>
                    <textarea id="examDescription" name="examDescription">${exam ? (exam.Descripcion || '') : ''}</textarea>
                </div>
                <div class="form-actions">
                    <button type="button" class="btn-secondary close-modal">Cancelar</button>
                    <button type="submit" class="btn-primary">${isEdit ? 'Actualizar' : 'Crear'} Evaluación</button>
                </div>
            </form>
        </div>
    `;
    
    document.body.appendChild(modal);
    if (typeof setupModalHandlers === 'function') {
    setupModalHandlers(modal);
    } else {
        // Fallback si no existe setupModalHandlers
        modal.querySelector('.close-modal').addEventListener('click', () => {
            modal.remove();
        });
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }
}

async function saveExam(event) {
    event.preventDefault();
    event.stopPropagation();
    
    const isInPages = window.location.pathname.includes('/pages/');
    const baseUrl = isInPages ? '../api' : 'api';
    
    // Obtener el formulario desde el evento
    const form = event.target;
    if (!form || form.tagName !== 'FORM') {
        console.error('El evento no viene de un formulario:', event.target);
        alert('Error: No se pudo encontrar el formulario.');
        return;
    }
    
    // Obtener valores usando FormData (más confiable)
    const formData = new FormData(form);
    
    // También obtener directamente de los elementos usando el formulario como contexto
    const titulo = (form.querySelector('#examTitle')?.value || '').trim();
    const materiaValue = form.querySelector('#examSubject')?.value || '';
    const materiaId = materiaValue && !isNaN(parseInt(materiaValue)) ? parseInt(materiaValue) : 0;
    const fecha = form.querySelector('#examDate')?.value || '';
    const tipo = (form.querySelector('#examType')?.value || '').trim().toUpperCase();
    const descripcion = (form.querySelector('#examDescription')?.value || '').trim() || null;
    const peso = parseFloat(form.querySelector('#examPeso')?.value || '1.00') || 1.00;
    const estado = form.querySelector('#examEstado')?.value || 'PROGRAMADA';
    
    // Debug: Mostrar valores capturados
    console.log('=== DEBUG VALIDACIÓN FORMULARIO ===');
    console.log('Form encontrado:', !!form);
    console.log('Valores capturados:', {
        titulo: titulo,
        materiaValue: materiaValue,
        materiaId: materiaId,
        fecha: fecha,
        tipo: tipo,
        descripcion: descripcion,
        peso: peso,
        estado: estado
    });
    
    // Verificar elementos directamente
    const titleEl = form.querySelector('#examTitle');
    const subjectEl = form.querySelector('#examSubject');
    const dateEl = form.querySelector('#examDate');
    const typeEl = form.querySelector('#examType');
    
    console.log('Elementos encontrados en form:', {
        titleEl: !!titleEl,
        'titleEl.value': titleEl?.value,
        subjectEl: !!subjectEl,
        'subjectEl.value': subjectEl?.value,
        dateEl: !!dateEl,
        'dateEl.value': dateEl?.value,
        typeEl: !!typeEl,
        'typeEl.value': typeEl?.value
    });
    console.log('===================================');
    
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
    
    if (missingFields.length > 0) {
        const message = 'Por favor, complete todos los campos requeridos:\n\n' + 
                       missingFields.map((field, idx) => `• ${field}: ${errors[idx] || 'Campo requerido'}`).join('\n') +
                       '\n\nNOTA: Si completó los campos, puede ser un problema técnico. Verifique la consola para más detalles.';
        alert(message);
        console.error('Campos faltantes:', missingFields);
        console.error('Valores actuales:', {
            titulo: titulo,
            materia: materiaValue,
            fecha: fecha,
            tipo: tipo
        });
        console.error('FormData entries:', Array.from(formData.entries()));
        return;
    }
    
    // Construir objeto con datos validados
    const examData = {
        Titulo: titulo,
        Materia_ID_materia: materiaId,
        Fecha: fecha,
        Tipo: tipo,
        Descripcion: descripcion,
        Peso: peso,
        Estado: estado
    };
    
    console.log('Datos finales a enviar:', examData);
    
    // Determinar si es crear o actualizar
    const existingExamId = document.getElementById('examModal').dataset.examId;
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
        
        // Log para debug
        console.log('Response status:', response.status);
        console.log('Response result:', result);
        
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
            console.error('Error del servidor:', result);
            throw new Error(errorMsg);
        }
    } catch (error) {
        console.error('Error al guardar evaluación:', error);
        alert('Error: ' + error.message + '\n\nPor favor, verifique la consola para más detalles.');
    }
}

function editExam(id) {
    const exam = appData.evaluacion.find(e => e.ID_evaluacion === id);
    if (!exam) {
        alert('Evaluación no encontrada.');
        return;
    }
    
    showExamModal(id);
}

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
        console.error('Error al eliminar evaluación:', error);
        alert(error.message || 'Error al eliminar la evaluación. Por favor, intente nuevamente.');
    }
}

function gradeExam(examId) {
    const exam = appData.evaluacion.find(e => e.ID_evaluacion === examId);
    if (!exam) {
        alert('Evaluación no encontrada.');
        return;
    }
    
    // Obtener la materia
    const materia = appData.materia.find(m => m.ID_materia === exam.Materia_ID_materia);
    if (!materia) {
        alert('Materia no encontrada.');
        return;
    }
    
    // Obtener estudiantes inscritos en esta materia
    const estudiantesInscritos = appData.alumnos_x_materia
        .filter(axm => axm.Materia_ID_materia === exam.Materia_ID_materia)
        .map(axm => {
            const estudiante = appData.estudiante.find(e => e.ID_Estudiante === axm.Estudiante_ID_Estudiante);
            return estudiante;
        })
        .filter(e => e !== undefined);
    
    if (estudiantesInscritos.length === 0) {
        alert('No hay estudiantes inscritos en esta materia.');
        return;
    }
    
    // Obtener notas existentes para esta evaluación
    const notasExistentes = appData.notas.filter(n => n.Evaluacion_ID_evaluacion === examId);
    
    // Crear modal de calificación
    showGradeModal(exam, materia, estudiantesInscritos, notasExistentes);
}

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
        <div class="modal-content" style="max-width: 900px; max-height: 90vh; overflow-y: auto;">
            <div class="modal-header">
                <h3>Calificar Estudiantes - ${exam.Titulo}</h3>
                <button class="close-modal">&times;</button>
            </div>
            <div class="modal-body">
                <div style="margin-bottom: 20px; padding: 15px; background: #f5f5f5; border-radius: 8px;">
                    <p><strong>Materia:</strong> ${materia.Nombre}</p>
                    <p><strong>Fecha:</strong> ${exam.Fecha}</p>
                    <p><strong>Tipo:</strong> ${exam.Tipo}</p>
                </div>
                
                <form id="gradeForm" onsubmit="saveGrades(event, ${exam.ID_evaluacion})">
                    <div class="table-responsive">
                        <table class="data-table" style="width: 100%;">
                            <thead>
                                <tr>
                                    <th style="width: 50px;">#</th>
                                    <th>Estudiante</th>
                                    <th style="width: 150px;">Calificación</th>
                                    <th style="width: 120px;">Estado</th>
                                    <th style="width: 200px;">Observaciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${estudiantes.map((estudiante, index) => {
                                    const notaExistente = notasMap[estudiante.ID_Estudiante];
                                    const calificacion = notaExistente ? notaExistente.Calificacion : '';
                                    // Detectar ausente: calificación 0 y observación contiene "AUSENTE" o es null/empty
                                    const esAusente = notaExistente && notaExistente.Calificacion == 0 && 
                                                     (notaExistente.Observacion === 'AUSENTE' || 
                                                      !notaExistente.Observacion || 
                                                      notaExistente.Observacion.trim() === '');
                                    const observacion = notaExistente ? (notaExistente.Observacion || '') : '';
                                    
                                    return `
                                        <tr data-student-id="${estudiante.ID_Estudiante}">
                                            <td>${index + 1}</td>
                                            <td><strong>${estudiante.Apellido}, ${estudiante.Nombre}</strong></td>
                                            <td>
                                                <div style="display: flex; gap: 5px; align-items: center;">
                                                    <input type="number" 
                                                           id="grade_${estudiante.ID_Estudiante}"
                                                           name="grade_${estudiante.ID_Estudiante}"
                                                           class="grade-input" 
                                                           min="1" 
                                                           max="10" 
                                                           step="0.01" 
                                                           value="${calificacion && calificacion > 0 ? calificacion : ''}"
                                                           placeholder="1-10"
                                                           style="width: 80px; padding: 5px;"
                                                           ${esAusente ? 'disabled' : ''}>
                                                    <label style="display: flex; align-items: center; gap: 5px; font-size: 12px; white-space: nowrap;">
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
                                                       placeholder="Observaciones..."
                                                       style="width: 100%; padding: 5px;">
                                            </td>
                                        </tr>
                                    `;
                                }).join('')}
                            </tbody>
                        </table>
                    </div>
                    <div class="form-actions" style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd;">
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
                Calificacion: esAusente ? 'AUSENTE' : parseFloat(calificacion),
                Observacion: observacion || null,
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
                    console.error(`Error guardando nota para estudiante ${nota.Estudiante_ID_Estudiante}:`, result);
                }
            } catch (error) {
                failed++;
                console.error(`Error guardando nota para estudiante ${nota.Estudiante_ID_Estudiante}:`, error);
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
        console.error('Error al guardar calificaciones:', error);
        alert('Error al guardar las calificaciones. Por favor, intente nuevamente.');
    }
}

function viewExamNotes(examId) {
    // Store the current exam ID for the notes view
    window.currentExamId = examId;
    
    // Hide exams tab content and show exam notes tab content
    const examsTabContent = document.getElementById('examsTabContent');
    const examNotesTabContent = document.getElementById('examNotesTabContent');
    
    if (examsTabContent) examsTabContent.style.display = 'none';
    if (examNotesTabContent) examNotesTabContent.style.display = 'block';
    
    // Hide exam control buttons
    hideExamControls();
    
    // Load the exam notes view
    loadExamNotesView(examId);
}

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
    const exam = appData.evaluacion.find(e => e.ID_evaluacion === examId);
    if (!exam) return;

    // Get all notes for this exam
    const examNotes = appData.notas.filter(note => note.Evaluacion_ID_evaluacion === examId);
    
    // Get subject information
    const subject = appData.materia.find(s => s.ID_materia === exam.Materia_ID_materia);
    
    // Update the exam notes title and subtitle
    const examNotesTitle = document.getElementById('examNotesTitle');
    const examNotesSubtitle = document.getElementById('examNotesSubtitle');
    
    if (examNotesTitle) {
        examNotesTitle.textContent = `Exam Notes - ${exam.Titulo}`;
    }
    
    if (examNotesSubtitle) {
        examNotesSubtitle.textContent = `${subject ? subject.Nombre : 'Unknown Subject'} • ${exam.Fecha} • ${exam.Tipo}`;
    }
    
    // Load exam info summary
    loadExamInfoSummary(exam, subject, examNotes.length);
    
    // Load notes list
    loadNotesList(examNotes);
    
    // Setup export button
    setupExportButton(examId, examNotes.length);
}

function loadExamInfoSummary(exam, subject, notesCount) {
    const examInfoSummary = document.getElementById('examInfoSummary');
    if (!examInfoSummary) return;
    
    examInfoSummary.innerHTML = `
        <div class="exam-summary">
            <div class="summary-item">
                <span class="summary-label">Subject:</span>
                <span class="summary-value">${subject ? subject.Nombre : 'Unknown Subject'}</span>
            </div>
            <div class="summary-item">
                <span class="summary-label">Date:</span>
                <span class="summary-value">${exam.Fecha}</span>
            </div>
            <div class="summary-item">
                <span class="summary-label">Type:</span>
                <span class="summary-value">${exam.Tipo}</span>
            </div>
            <div class="summary-item">
                <span class="summary-label">Status:</span>
                <span class="summary-value status-${exam.Estado.toLowerCase()}">${exam.Estado}</span>
            </div>
            <div class="summary-item">
                <span class="summary-label">Total Notes:</span>
                <span class="summary-value">${notesCount}</span>
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
            <div class="table-responsive">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Student</th>
                            <th>Grade</th>
                            <th>Date</th>
                            <th>Status</th>
                            <th>Observations</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${examNotes.map(note => {
                            const student = appData.estudiante.find(s => s.ID_Estudiante === note.Estudiante_ID_Estudiante);
                            return `
                                <tr>
                                    <td><strong>${student ? `${student.Nombre} ${student.Apellido}` : 'Unknown Student'}</strong></td>
                                    <td class="grade-cell ${getGradeClass(note.Calificacion)}">${note.Calificacion}</td>
                                    <td>${note.Fecha_calificacion}</td>
                                    <td><span class="status-badge status-${note.Estado.toLowerCase()}">${note.Estado}</span></td>
                                    <td>${note.Observacion || 'No observations'}</td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        `;
    } else {
        // Show empty state
        notesList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-clipboard-list"></i>
                <h3>No Notes Recorded</h3>
                <p>No notes have been recorded for this exam yet.</p>
                <button class="btn-primary" onclick="goToGradeStudents()">
                    <i class="fas fa-graduation-cap"></i>
                    Start Grading Students
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

function goToGradeStudents() {
    // This would navigate to the grade students section
    // For now, just show an alert
    alert('Grade students functionality would be implemented here.');
}

function backToExams() {
    // Hide exam notes tab content and show exams tab content
    const examsTabContent = document.getElementById('examsTabContent');
    const examNotesTabContent = document.getElementById('examNotesTabContent');
    
    if (examNotesTabContent) examNotesTabContent.style.display = 'none';
    if (examsTabContent) examsTabContent.style.display = 'block';
    
    // Show exam control buttons again
    showExamControls();
    
    // Clear the current exam ID
    window.currentExamId = null;
}

function getGradeClass(grade) {
    if (grade >= 8) return 'excellent';
    if (grade >= 6) return 'good';
    if (grade >= 4) return 'average';
    return 'poor';
}

function exportExamNotes(examId) {
    const exam = appData.evaluacion.find(e => e.ID_evaluacion === examId);
    const examNotes = appData.notas.filter(note => note.Evaluacion_ID_evaluacion === examId);
    const subject = appData.materia.find(s => s.ID_materia === exam.Materia_ID_materia);
    
    if (examNotes.length === 0) {
        alert('No notes to export for this exam.');
        return;
    }
    
    // Create CSV content
    let csvContent = `Exam Notes Export\n`;
    csvContent += `Exam: ${exam.Titulo}\n`;
    csvContent += `Subject: ${subject ? subject.Nombre : 'Unknown'}\n`;
    csvContent += `Date: ${exam.Fecha}\n\n`;
    csvContent += `Student,Grade,Date,Status,Observations\n`;
    
    examNotes.forEach(note => {
        const student = appData.estudiante.find(s => s.ID_Estudiante === note.Estudiante_ID_Estudiante);
        const studentName = student ? `${student.Nombre} ${student.Apellido}` : 'Unknown Student';
        csvContent += `"${studentName}",${note.Calificacion},"${note.Fecha_calificacion}","${note.Estado}","${note.Observacion || ''}"\n`;
    });
    
    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `exam_notes_${exam.Titulo.replace(/[^a-zA-Z0-9]/g, '_')}_${exam.Fecha}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
