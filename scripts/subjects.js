// Subjects Management
let currentSubjectId = null;
let currentContentId = null;

function initializeSubjects() {
    const addSubjectBtn = document.getElementById('addSubjectBtn');
    const subjectModal = document.getElementById('subjectModal');
    const subjectForm = document.getElementById('subjectForm');
    const courseFilter = document.getElementById('courseFilter');
    const statusFilter = document.getElementById('statusFilter');
    const addContentBtn = document.getElementById('addContentBtn');
    const contentModal = document.getElementById('contentModal');
    const contentForm = document.getElementById('contentForm');

    // Subject management
    if (addSubjectBtn) {
        addSubjectBtn.addEventListener('click', () => {
            showModal('subjectModal');
            clearSubjectForm();
        });
    }

    if (subjectForm) {
        subjectForm.addEventListener('submit', (e) => {
            e.preventDefault();
            saveSubject();
        });
    }

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
    setupViewToggle('subjectsGridViewBtn', 'subjectsListViewBtn', 'subjectsCards', 'subjectsList');

    // Modal close handlers
    setupModalHandlers('subjectModal');

    // Load initial data
    loadSubjects();
    populateTeacherSelect();
    populateSubjectSelect();
}


function loadSubjects() {
    const subjectsCards = document.getElementById('subjectsCards');
    const subjectsList = document.getElementById('subjectsList');
    
    if (!subjectsCards || !subjectsList) return;

    // Get filtered subjects
    const filteredSubjects = getFilteredSubjects();

    // Grid view
    subjectsCards.innerHTML = filteredSubjects.map(subject => {
        const teacher = getTeacherById(subject.Usuarios_docente_ID_docente);
        const studentCount = getStudentCountBySubject(subject.ID_materia);
        const evaluationCount = getEvaluationCountBySubject(subject.ID_materia);
        const contentCount = getContentCountBySubject(subject.ID_materia);

        return `
            <div class="card" onclick="showSubjectDetail(${subject.ID_materia})">
                <div class="card-header">
                    <h3 class="card-title">${subject.Nombre}</h3>
                    <div class="card-actions">
                        <button class="btn-icon btn-edit" onclick="event.stopPropagation(); editSubject(${subject.ID_materia})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-icon btn-delete" onclick="event.stopPropagation(); deleteSubject(${subject.ID_materia})">
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
                            <tr onclick="showSubjectDetail(${subject.ID_materia})">
                                <td><strong>${subject.Nombre}</strong></td>
                                <td>${subject.Curso_division}</td>
                                <td>${teacher ? `${teacher.Nombre_docente} ${teacher.Apellido_docente}` : 'N/A'}</td>
                                <td>${subject.Horario || 'No especificado'}</td>
                                <td>${subject.Aula || 'No especificada'}</td>
                                <td><span class="table-status ${subject.Estado.toLowerCase()}">${getStatusText(subject.Estado)}</span></td>
                                <td>${studentCount}</td>
                                <td>
                                    <div class="table-actions">
                                        <button class="btn-icon btn-edit" onclick="event.stopPropagation(); editSubject(${subject.ID_materia})" title="Editar">
                                            <i class="fas fa-edit"></i>
                                        </button>
                                        <button class="btn-icon btn-delete" onclick="event.stopPropagation(); deleteSubject(${subject.ID_materia})" title="Eliminar">
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


function saveSubject() {
    const formData = {
        name: document.getElementById('subjectName').value,
        course: document.getElementById('subjectCourse').value,
        description: document.getElementById('subjectDescription').value,
        schedule: document.getElementById('subjectSchedule').value,
        classroom: document.getElementById('subjectClassroom').value,
        teacher: document.getElementById('subjectTeacher').value,
        status: document.getElementById('subjectStatus').value
    };

    const subjectData = {
        ID_materia: currentSubjectId || Date.now(),
        Nombre: formData.name,
        Curso_division: formData.course,
        Descripcion: formData.description,
        Horario: formData.schedule,
        Aula: formData.classroom,
        Usuarios_docente_ID_docente: parseInt(formData.teacher),
        Estado: formData.status,
        Fecha_creacion: new Date().toISOString().split('T')[0]
    };

    if (currentSubjectId) {
        // Update existing subject
        const index = appData.materia.findIndex(s => s.ID_materia === currentSubjectId);
        if (index !== -1) {
            appData.materia[index] = subjectData;
        }
    } else {
        // Add new subject
        appData.materia.push(subjectData);
    }

    saveData();
    closeModal('subjectModal');
    loadSubjects();
    updateDashboard();
    currentSubjectId = null;
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


function deleteSubject(id) {
    if (confirm('¿Estás seguro de que quieres eliminar esta materia?')) {
        appData.materia = appData.materia.filter(s => s.ID_materia !== id);
        // Also remove related data
        appData.alumnos_x_materia = appData.alumnos_x_materia.filter(axm => axm.Materia_ID_materia !== id);
        appData.contenido = appData.contenido.filter(c => c.Materia_ID_materia !== id);
        appData.evaluacion = appData.evaluacion.filter(e => e.Materia_ID_materia !== id);
        appData.asistencia = appData.asistencia.filter(a => a.Materia_ID_materia !== id);
        
        saveData();
        loadSubjects();
        loadContent();
        updateDashboard();
    }
}


function clearSubjectForm() {
    document.getElementById('subjectForm').reset();
    currentSubjectId = null;
}


// Filter functions
function getFilteredSubjects() {
    const courseFilter = document.getElementById('courseFilter');
    const statusFilter = document.getElementById('statusFilter');
    const selectedCourse = courseFilter ? courseFilter.value : '';
    const selectedStatus = statusFilter ? statusFilter.value : '';
    
    let subjects = appData.materia || [];
    
    if (selectedCourse) {
        subjects = subjects.filter(subject => 
            subject.Curso_division.toLowerCase().includes(selectedCourse.toLowerCase())
        );
    }
    
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

// Event listeners for detail panel
document.addEventListener('DOMContentLoaded', function() {
    const closeSubjectDetailBtn = document.getElementById('closeSubjectDetail');
    if (closeSubjectDetailBtn) {
        closeSubjectDetailBtn.addEventListener('click', closeSubjectDetail);
    }
});

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
