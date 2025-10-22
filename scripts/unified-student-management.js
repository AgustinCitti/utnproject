// Unified Student Management - Combines Students, Grades, Attendance, and Exams
function initializeUnifiedStudentManagement() {
    const addStudentBtn = document.getElementById('addStudentBtn');
    const markAttendanceBtn = document.getElementById('markAttendanceBtn');
    const unifiedTeacherFilter = document.getElementById('unifiedTeacherFilter');
    const unifiedCourseFilter = document.getElementById('unifiedCourseFilter');
    const unifiedSubjectFilter = document.getElementById('unifiedSubjectFilter');
    const unifiedGridViewBtn = document.getElementById('unifiedGridViewBtn');
    const unifiedListViewBtn = document.getElementById('unifiedListViewBtn');
    const closeStudentDetail = document.getElementById('closeStudentDetail');
    
    // Tab navigation elements
    const studentsTab = document.getElementById('studentsTab');
    const examsTab = document.getElementById('examsTab');
    const studentsTabContent = document.getElementById('studentsTabContent');
    const examsTabContent = document.getElementById('examsTabContent');
    
    // Exams elements
    const examsGridViewBtn = document.getElementById('examsGridViewBtn');
    const examsListViewBtn = document.getElementById('examsListViewBtn');

    // Event listeners for action buttons
    if (addStudentBtn) {
        addStudentBtn.addEventListener('click', () => {
            showModal('studentModal');
            clearStudentForm();
        });
    }

    if (markAttendanceBtn) {
        markAttendanceBtn.addEventListener('click', () => {
            // Navigate to attendance section
            showSection('attendance');
            showAttendanceView();
        });
    }

    // Filter functionality
    if (unifiedTeacherFilter) {
        unifiedTeacherFilter.addEventListener('change', () => {
            filterUnifiedData();
        });
    }

    if (unifiedCourseFilter) {
        unifiedCourseFilter.addEventListener('change', () => {
            filterUnifiedData();
        });
    }

    if (unifiedSubjectFilter) {
        unifiedSubjectFilter.addEventListener('change', () => {
            filterUnifiedData();
        });
    }

    // View toggle functionality
    if (unifiedGridViewBtn) {
        unifiedGridViewBtn.addEventListener('click', () => {
            switchToGridView();
        });
    }

    if (unifiedListViewBtn) {
        unifiedListViewBtn.addEventListener('click', () => {
            switchToListView();
        });
    }

    // Close student detail panel
    if (closeStudentDetail) {
        closeStudentDetail.addEventListener('click', () => {
            closeStudentDetailPanel();
        });
    }

    // Tab navigation functionality
    if (studentsTab) {
        studentsTab.addEventListener('click', () => {
            switchToStudentsTab();
        });
    }

    if (examsTab) {
        examsTab.addEventListener('click', () => {
            switchToExamsTab();
        });
    }

    // Exams functionality (now using global action buttons)
    const globalCreateExamBtn = document.getElementById('createExamBtn');
    const globalGradeStudentsBtn = document.getElementById('gradeStudentsBtn');
    
    if (globalCreateExamBtn) {
        globalCreateExamBtn.addEventListener('click', () => {
            showExamModal();
        });
    }

    if (globalGradeStudentsBtn) {
        globalGradeStudentsBtn.addEventListener('click', () => {
            // Navigate to grade marking section and show the grade marking view
            showSection('student-management');
            setTimeout(() => {
                showGradeMarkingView();
            }, 100);
        });
    }

    // Exams view toggle functionality
    if (examsGridViewBtn) {
        examsGridViewBtn.addEventListener('click', () => {
            switchToExamsGridView();
        });
    }

    if (examsListViewBtn) {
        examsListViewBtn.addEventListener('click', () => {
            switchToExamsListView();
        });
    }

    // Modal handlers
    setupModalHandlers('studentModal');
    
    // Grade marking functionality
    const gradeEvaluationSelect = document.getElementById('gradeEvaluation');
    const saveGradesBtn = document.getElementById('saveGradesBtn');
    const cancelGradesBtn = document.getElementById('cancelGradesBtn');
    const backToStudentsBtn = document.getElementById('backToStudentsBtn');
    
    if (gradeEvaluationSelect) {
        gradeEvaluationSelect.addEventListener('change', () => {
            loadStudentsForGradeMarking();
        });
    }
    
    if (saveGradesBtn) {
        saveGradesBtn.addEventListener('click', () => {
            saveGradesBulk();
        });
    }
    
    if (cancelGradesBtn) {
        cancelGradesBtn.addEventListener('click', () => {
            hideGradeMarkingView();
        });
    }
    
    if (backToStudentsBtn) {
        backToStudentsBtn.addEventListener('click', () => {
            showSection('student-management');
        });
    }

    // Initialize data
    populateSubjectFilter();
    populateUnifiedTeacherFilter();
    loadUnifiedStudentData();
    loadExams();
    
    // Set initial button visibility (students tab is active by default)
    document.querySelectorAll('.students-only').forEach(btn => btn.style.display = 'flex');
    document.querySelectorAll('.exams-only').forEach(btn => btn.style.display = 'none');
    
    // Set list view as default
    switchToListView();
    
    // Set exams list view as default
    switchToExamsListView();
}

function loadUnifiedStudentData() {
    const unifiedStudentCards = document.getElementById('unifiedStudentCards');
    const unifiedStudentList = document.getElementById('unifiedStudentList');
    
    if (!unifiedStudentCards || !unifiedStudentList) return;

    const filteredStudents = getFilteredUnifiedStudents();

    // Grid view - Student cards with integrated data
    unifiedStudentCards.innerHTML = filteredStudents.map(student => {
        const studentGrades = appData.notas.filter(g => g.Estudiante_ID_Estudiante === student.ID_Estudiante);
        const studentAttendance = appData.asistencia.filter(a => a.Estudiante_ID_Estudiante === student.ID_Estudiante);
        
        const averageGrade = studentGrades.length > 0 
            ? Math.round(studentGrades.reduce((sum, g) => sum + g.Calificacion, 0) / studentGrades.length)
            : 0;
        
        const attendanceRate = studentAttendance.length > 0
            ? Math.round((studentAttendance.filter(a => a.Presente === 'Y').length / studentAttendance.length) * 100)
            : 0;

        const recentGrades = studentGrades.slice(-3).reverse();
        const recentAttendance = studentAttendance.slice(-5).reverse();

        return `
            <div class="unified-student-card" onclick="showStudentDetail(${student.ID_Estudiante})">
                <div class="card-header">
                    <div class="student-avatar">
                        <i class="fas fa-user"></i>
                    </div>
                    <div class="student-info">
                        <h3 class="student-name">${student.Nombre} ${student.Apellido}</h3>
                        <p class="student-id">ID: ${student.ID_Estudiante}</p>
                        <p class="student-course">Estudiante</p>
                    </div>
                    <div class="student-actions">
                        <button class="btn-icon btn-edit" onclick="event.stopPropagation(); editStudent(${student.ID_Estudiante})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-icon btn-delete" onclick="event.stopPropagation(); deleteStudent(${student.ID_Estudiante})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <div class="card-content">
                    <div class="student-stats">
                        <div class="stat-item">
                            <span class="stat-label">Promedio</span>
                            <span class="stat-value grade-${averageGrade >= 80 ? 'excellent' : averageGrade >= 60 ? 'good' : 'poor'}">${averageGrade}%</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">Asistencia</span>
                            <span class="stat-value attendance-${attendanceRate >= 80 ? 'good' : attendanceRate >= 60 ? 'warning' : 'poor'}">${attendanceRate}%</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">Calificaciones</span>
                            <span class="stat-value">${studentGrades.length}</span>
                        </div>
                    </div>
                    <div class="recent-activity">
                        <div class="activity-section">
                            <h4>Calificaciones Recientes</h4>
                            <div class="activity-list">
                                ${recentGrades.map(grade => {
                                    const evaluation = appData.evaluacion.find(e => e.ID_evaluacion === grade.Evaluacion_ID_evaluacion);
                                    return `
                                        <div class="activity-item">
                                            <span class="activity-subject">${evaluation ? evaluation.Titulo : 'Unknown'}</span>
                                            <span class="activity-grade grade-${grade.Calificacion >= 8 ? 'excellent' : grade.Calificacion >= 6 ? 'good' : 'poor'}">${grade.Calificacion}</span>
                                        </div>
                                    `;
                                }).join('')}
                                ${recentGrades.length === 0 ? '<p class="no-data">Sin calificaciones</p>' : ''}
                            </div>
                        </div>
                        <div class="activity-section">
                            <h4>Asistencia Reciente</h4>
                            <div class="activity-list">
                                ${recentAttendance.map(attendance => {
                                    const subject = appData.materia.find(s => s.ID_materia === attendance.Materia_ID_materia);
                                    const shortDate = attendance.Fecha.split('-').slice(1).join('/');
                                    const status = attendance.Presente === 'Y' ? 'present' : attendance.Presente === 'N' ? 'absent' : attendance.Presente === 'T' ? 'tardy' : 'justified';
                                    return `
                                        <div class="activity-item">
                                            <span class="activity-date">${shortDate}</span>
                                            <span class="activity-status status-${status}">${status}</span>
                                        </div>
                                    `;
                                }).join('')}
                                ${recentAttendance.length === 0 ? '<p class="no-data">Sin registros</p>' : ''}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    // List view - Detailed table
    unifiedStudentList.innerHTML = `
        <div class="table-responsive">
            <table class="data-table unified-table">
                <thead>
                    <tr>
                        <th>Estudiante</th>
                        <th>Curso</th>
                        <th>Promedio</th>
                        <th>Asistencia</th>
                        <th>Calificaciones</th>
                        <th>Última Actividad</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    ${filteredStudents.map(student => {
                        const studentGrades = appData.notas.filter(g => g.Estudiante_ID_Estudiante === student.ID_Estudiante);
                        const studentAttendance = appData.asistencia.filter(a => a.Estudiante_ID_Estudiante === student.ID_Estudiante);
                        
                        const averageGrade = studentGrades.length > 0 
                            ? Math.round(studentGrades.reduce((sum, g) => sum + g.Calificacion, 0) / studentGrades.length)
                            : 0;
                        
                        const attendanceRate = studentAttendance.length > 0
                            ? Math.round((studentAttendance.filter(a => a.Presente === 'Y').length / studentAttendance.length) * 100)
                            : 0;

                        const lastGrade = studentGrades.sort((a, b) => new Date(b.Fecha_calificacion) - new Date(a.Fecha_calificacion))[0];
                        const lastAttendance = studentAttendance.sort((a, b) => new Date(b.Fecha) - new Date(a.Fecha))[0];
                        
                        let lastActivity = 'Sin actividad';
                        let lastActivityDate = '';
                        
                        if (lastGrade && lastAttendance) {
                            const gradeDate = new Date(lastGrade.Fecha_calificacion);
                            const attendanceDate = new Date(lastAttendance.Fecha);
                            if (gradeDate > attendanceDate) {
                                lastActivity = 'Calificación';
                                lastActivityDate = lastGrade.Fecha_calificacion;
                            } else {
                                lastActivity = 'Asistencia';
                                lastActivityDate = lastAttendance.Fecha;
                            }
                        } else if (lastGrade) {
                            lastActivity = 'Calificación';
                            lastActivityDate = lastGrade.Fecha_calificacion;
                        } else if (lastAttendance) {
                            lastActivity = 'Asistencia';
                            lastActivityDate = lastAttendance.Fecha;
                        }

                        return `
                            <tr onclick="showStudentDetail(${student.ID_Estudiante})" class="clickable-row">
                                <td>
                                    <div class="student-cell">
                                        <div class="student-avatar-small">
                                            <i class="fas fa-user"></i>
                                        </div>
                                        <div class="student-info">
                                            <strong>${student.Nombre} ${student.Apellido}</strong>
                                            <small>${student.ID_Estudiante}</small>
                                        </div>
                                    </div>
                                </td>
                                <td>Estudiante</td>
                                <td>
                                    <span class="table-status grade-${averageGrade >= 80 ? 'excellent' : averageGrade >= 60 ? 'good' : 'poor'}">
                                        ${averageGrade}%
                                    </span>
                                </td>
                                <td>
                                    <span class="table-status attendance-${attendanceRate >= 80 ? 'good' : attendanceRate >= 60 ? 'warning' : 'poor'}">
                                        ${attendanceRate}%
                                    </span>
                                </td>
                                <td>${studentGrades.length}</td>
                                <td>
                                    <div class="last-activity">
                                        <span class="activity-type">${lastActivity}</span>
                                        <small>${lastActivityDate}</small>
                                    </div>
                                </td>
                                <td>
                                    <div class="table-actions">
                                        <button class="btn-icon btn-edit" onclick="event.stopPropagation(); editStudent(${student.ID_Estudiante})" title="Editar">
                                            <i class="fas fa-edit"></i>
                                        </button>
                                        <button class="btn-icon btn-delete" onclick="event.stopPropagation(); deleteStudent(${student.ID_Estudiante})" title="Eliminar">
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

function getFilteredUnifiedStudents() {
    const teacherFilter = document.getElementById('unifiedTeacherFilter');
    const courseFilter = document.getElementById('unifiedCourseFilter');
    const subjectFilter = document.getElementById('unifiedSubjectFilter');
    const selectedTeacher = teacherFilter ? teacherFilter.value : '';
    const selectedCourse = courseFilter ? courseFilter.value : '';
    const selectedSubject = subjectFilter ? subjectFilter.value : '';
    
    let filteredStudents = appData.estudiante;
    
    // Filter by teacher (students enrolled in subjects taught by this teacher)
    if (selectedTeacher) {
        const teacherId = parseInt(selectedTeacher);
        const teacherSubjects = appData.materia.filter(subject => subject.Usuarios_docente_ID_docente === teacherId);
        const teacherSubjectIds = teacherSubjects.map(subject => subject.ID_materia);
        
        // Get students enrolled in these subjects
        const enrolledStudentIds = appData.alumnos_x_materia
            .filter(enrollment => teacherSubjectIds.includes(enrollment.Materia_ID_materia))
            .map(enrollment => enrollment.Estudiante_ID_Estudiante);
        
        filteredStudents = filteredStudents.filter(student => 
            enrolledStudentIds.includes(student.ID_Estudiante)
        );
    }
    
    // Filter by course (if needed - for now show all students)
    // Note: Course filtering would need to be implemented based on enrollment
    
    // Filter by subject (students who have grades or attendance in this subject)
    if (selectedSubject) {
        const subjectId = parseInt(selectedSubject);
        filteredStudents = filteredStudents.filter(student => {
            const hasGrades = appData.notas.some(g => g.Estudiante_ID_Estudiante === student.ID_Estudiante && g.Evaluacion_ID_evaluacion && appData.evaluacion.find(e => e.ID_evaluacion === g.Evaluacion_ID_evaluacion && e.Materia_ID_materia === subjectId));
            const hasAttendance = appData.asistencia.some(a => a.Estudiante_ID_Estudiante === student.ID_Estudiante && a.Materia_ID_materia === subjectId);
            return hasGrades || hasAttendance;
        });
    }
    
    return filteredStudents;
}

function filterUnifiedData() {
    loadUnifiedStudentData();
}

function switchToGridView() {
    document.getElementById('unifiedStudentCards').style.display = 'grid';
    document.getElementById('unifiedStudentList').style.display = 'none';
    document.getElementById('unifiedGridViewBtn').classList.add('active');
    document.getElementById('unifiedListViewBtn').classList.remove('active');
}

function switchToListView() {
    document.getElementById('unifiedStudentCards').style.display = 'none';
    document.getElementById('unifiedStudentList').style.display = 'block';
    document.getElementById('unifiedGridViewBtn').classList.remove('active');
    document.getElementById('unifiedListViewBtn').classList.add('active');
}

function populateSubjectFilter() {
    const subjectFilter = document.getElementById('unifiedSubjectFilter');
    if (!subjectFilter) return;

    subjectFilter.innerHTML = `
        <option value="" data-translate="all_subjects">Todas las Materias</option>
        ${appData.materia.map(subject => 
            `<option value="${subject.ID_materia}">${subject.Nombre}</option>`
        ).join('')}
    `;
}

function showStudentDetail(studentId) {
    const student = appData.estudiante.find(s => s.ID_Estudiante === studentId);
    if (!student) return;

    const studentGrades = appData.notas.filter(g => g.Estudiante_ID_Estudiante === studentId);
    const studentAttendance = appData.asistencia.filter(a => a.Estudiante_ID_Estudiante === studentId);
    
    const averageGrade = studentGrades.length > 0 
        ? Math.round(studentGrades.reduce((sum, g) => sum + g.Calificacion, 0) / studentGrades.length)
        : 0;
    
    const attendanceRate = studentAttendance.length > 0
        ? Math.round((studentAttendance.filter(a => a.Presente === 'Y').length / studentAttendance.length) * 100)
        : 0;

    // Update panel content
    document.getElementById('selectedStudentName').textContent = `${student.Nombre} ${student.Apellido}`;
    document.getElementById('studentAverage').textContent = `${averageGrade}%`;
    document.getElementById('studentAttendance').textContent = `${attendanceRate}%`;
    document.getElementById('studentTotalGrades').textContent = studentGrades.length;

    // Recent grades
    const recentGrades = studentGrades.slice(-5).reverse();
    document.getElementById('studentRecentGrades').innerHTML = recentGrades.map(grade => {
        const evaluation = appData.evaluacion.find(e => e.ID_evaluacion === grade.Evaluacion_ID_evaluacion);
        return `
            <div class="grade-item">
                <span class="grade-subject">${evaluation ? evaluation.Titulo : 'Unknown'}</span>
                <span class="grade-value grade-${grade.Calificacion >= 8 ? 'excellent' : grade.Calificacion >= 6 ? 'good' : 'poor'}">${grade.Calificacion}</span>
                <span class="grade-date">${grade.Fecha_calificacion}</span>
            </div>
        `;
    }).join('') || '<p class="no-data">Sin calificaciones</p>';

    // Attendance history
    const recentAttendance = studentAttendance.slice(-10).reverse();
    document.getElementById('studentAttendanceHistory').innerHTML = recentAttendance.map(attendance => {
        const subject = appData.materia.find(s => s.ID_materia === attendance.Materia_ID_materia);
        const status = attendance.Presente === 'Y' ? 'present' : attendance.Presente === 'N' ? 'absent' : attendance.Presente === 'T' ? 'tardy' : 'justified';
        return `
            <div class="attendance-item">
                <span class="attendance-date">${attendance.Fecha}</span>
                <span class="attendance-subject">${subject ? subject.Nombre : 'Unknown'}</span>
                <span class="attendance-status status-${status}">${status}</span>
            </div>
        `;
    }).join('') || '<p class="no-data">Sin registros de asistencia</p>';

    // Show panel
    document.getElementById('studentDetailPanel').style.display = 'block';
}

function closeStudentDetailPanel() {
    document.getElementById('studentDetailPanel').style.display = 'none';
}

// Reuse existing functions from students.js, grades.js, and attendance.js
// These functions are already defined in the original files and will be available globally

// Tab switching functions
function switchToStudentsTab() {
    document.getElementById('studentsTab').classList.add('active');
    document.getElementById('examsTab').classList.remove('active');
    document.getElementById('studentsTabContent').classList.add('active');
    document.getElementById('examsTabContent').classList.remove('active');
    
    // Show/hide appropriate action buttons
    document.querySelectorAll('.students-only').forEach(btn => btn.style.display = 'flex');
    document.querySelectorAll('.exams-only').forEach(btn => btn.style.display = 'none');
}

function switchToExamsTab() {
    document.getElementById('studentsTab').classList.remove('active');
    document.getElementById('examsTab').classList.add('active');
    document.getElementById('studentsTabContent').classList.remove('active');
    document.getElementById('examsTabContent').classList.add('active');
    
    // Show/hide appropriate action buttons
    document.querySelectorAll('.students-only').forEach(btn => btn.style.display = 'none');
    document.querySelectorAll('.exams-only').forEach(btn => btn.style.display = 'flex');
}

// Exams functionality
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

function showExamModal() {
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Create Exam</h3>
                <button class="close-modal">&times;</button>
            </div>
            <form class="modal-form" onsubmit="saveExam(event)">
                <div class="form-group">
                    <label for="examTitle">Title</label>
                    <input type="text" id="examTitle" required>
                </div>
                <div class="form-group">
                    <label for="examSubject">Subject</label>
                    <select id="examSubject" required>
                        ${appData.materia.map(s => `<option value="${s.ID_materia}">${s.Nombre}</option>`).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label for="examDate">Date</label>
                    <input type="date" id="examDate" required>
                </div>
                <div class="form-group">
                    <label for="examDuration">Duration (minutes)</label>
                    <input type="number" id="examDuration" required>
                </div>
                <div class="form-group">
                    <label for="examType">Type</label>
                    <select id="examType" required>
                        <option value="written">Written</option>
                        <option value="practical">Practical</option>
                        <option value="oral">Oral</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="examDescription">Description</label>
                    <textarea id="examDescription"></textarea>
                </div>
                <div class="form-actions">
                    <button type="button" class="btn-secondary close-modal">Cancel</button>
                    <button type="submit" class="btn-primary">Save Exam</button>
                </div>
            </form>
        </div>
    `;
    
    document.body.appendChild(modal);
    setupModalHandlers(modal);
}

function saveExam(event) {
    event.preventDefault();
    
    const newExam = {
        ID_evaluacion: Date.now(),
        Titulo: document.getElementById('examTitle').value,
        Materia_ID_materia: parseInt(document.getElementById('examSubject').value),
        Fecha: document.getElementById('examDate').value,
        Tipo: document.getElementById('examType').value,
        Descripcion: document.getElementById('examDescription').value,
        Estado: 'PROGRAMADA'
    };
    
    appData.evaluacion.push(newExam);
    saveData();
    closeModal(document.querySelector('.modal'));
    loadExams();
}

function editExam(id) {
    const exam = appData.evaluacion.find(e => e.ID_evaluacion === id);
    if (!exam) return;

    showExamModal();
    
    // Populate form with existing data
    document.getElementById('examTitle').value = exam.Titulo;
    document.getElementById('examSubject').value = exam.Materia_ID_materia;
    document.getElementById('examDate').value = exam.Fecha;
    document.getElementById('examType').value = exam.Tipo;
    document.getElementById('examDescription').value = exam.Descripcion || '';
}

function deleteExam(id) {
    if (confirm('Are you sure you want to delete this exam?')) {
        appData.evaluacion = appData.evaluacion.filter(e => e.ID_evaluacion !== id);
        saveData();
        loadExams();
    }
}

function switchToExamsGridView() {
    document.getElementById('examsContainer').style.display = 'grid';
    document.getElementById('examsList').style.display = 'none';
    document.getElementById('examsGridViewBtn').classList.add('active');
    document.getElementById('examsListViewBtn').classList.remove('active');
}

function switchToExamsListView() {
    document.getElementById('examsContainer').style.display = 'none';
    document.getElementById('examsList').style.display = 'block';
    document.getElementById('examsGridViewBtn').classList.remove('active');
    document.getElementById('examsListViewBtn').classList.add('active');
}

// Grade Marking Functions
function showGradeMarkingView() {
    // Navigate to grade marking section and show the grade marking view
    showSection('grade-marking');
    
    const gradeMarkingView = document.getElementById('gradeMarkingView');
    const gradeMarkingList = document.getElementById('gradeMarkingList');
    
    if (gradeMarkingView) {
        gradeMarkingView.style.display = 'block';
        if (gradeMarkingList) {
            gradeMarkingList.style.display = 'none';
        }
        
        // Set current date
        const dateInput = document.getElementById('gradeDate');
        if (dateInput) {
            dateInput.value = new Date().toISOString().split('T')[0];
        }
        
        // Reset form
        const notesInput = document.getElementById('gradeNotes');
        if (notesInput) {
            notesInput.value = '';
        }
        
        const evaluationSelect = document.getElementById('gradeEvaluation');
        if (evaluationSelect) {
            evaluationSelect.value = '';
        }
        
        // Clear student table
        const tableBody = document.getElementById('gradeTableBody');
        if (tableBody) {
            tableBody.innerHTML = '<tr><td colspan="5" class="text-center">Seleccione una evaluación para ver los estudiantes</td></tr>';
        }
        
        // Populate evaluation dropdown
        populateEvaluationDropdown();
    }
}

function populateEvaluationDropdown() {
    const evaluationSelect = document.getElementById('gradeEvaluation');
    if (!evaluationSelect) return;
    
    evaluationSelect.innerHTML = '<option value="" data-translate="select_evaluation">- Seleccionar Evaluación -</option>';
    
    appData.evaluacion.forEach(evaluation => {
        const subject = appData.materia.find(s => s.ID_materia === evaluation.Materia_ID_materia);
        const option = document.createElement('option');
        option.value = evaluation.ID_evaluacion;
        option.textContent = `${evaluation.Titulo} - ${subject ? subject.Nombre : 'Unknown Subject'}`;
        evaluationSelect.appendChild(option);
    });
}

function loadStudentsForGradeMarking() {
    const evaluationSelect = document.getElementById('gradeEvaluation');
    const tableBody = document.getElementById('gradeTableBody');
    
    if (!evaluationSelect || !tableBody) return;
    
    const selectedEvaluationId = parseInt(evaluationSelect.value);
    
    if (!selectedEvaluationId) {
        tableBody.innerHTML = '<tr><td colspan="5" class="text-center">Seleccione una evaluación para ver los estudiantes</td></tr>';
        return;
    }
    
    const evaluation = appData.evaluacion.find(e => e.ID_evaluacion === selectedEvaluationId);
    if (!evaluation) {
        tableBody.innerHTML = '<tr><td colspan="5" class="text-center">Evaluación no encontrada</td></tr>';
        return;
    }
    
    // Get students enrolled in this subject
    const enrolledStudentIds = appData.alumnos_x_materia
        .filter(enrollment => enrollment.Materia_ID_materia === evaluation.Materia_ID_materia)
        .map(enrollment => enrollment.Estudiante_ID_Estudiante);
    
    const enrolledStudents = appData.estudiante.filter(student => 
        enrolledStudentIds.includes(student.ID_Estudiante)
    );
    
    if (enrolledStudents.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="5" class="text-center">No hay estudiantes inscritos en esta materia</td></tr>';
        return;
    }
    
    tableBody.innerHTML = enrolledStudents.map(student => {
        // Get existing grade for this student and evaluation
        const existingGrade = appData.notas.find(grade => 
            grade.Estudiante_ID_Estudiante === student.ID_Estudiante && 
            grade.Evaluacion_ID_evaluacion === selectedEvaluationId
        );
        
        const currentGrade = existingGrade ? existingGrade.Calificacion : '';
        const gradeClass = currentGrade >= 80 ? 'excellent' : currentGrade >= 60 ? 'good' : currentGrade > 0 ? 'poor' : '';
        const status = existingGrade ? 'graded' : 'pending';
        
        return `
            <tr data-student-id="${student.ID_Estudiante}">
                <td class="student-id">${student.ID_Estudiante}</td>
                <td class="student-name">${student.Apellido}, ${student.Nombre}</td>
                <td class="grade-cell">
                    <input type="number" 
                           class="grade-input ${gradeClass}" 
                           min="0" 
                           max="100" 
                           value="${currentGrade}"
                           data-student-id="${student.ID_Estudiante}"
                           placeholder="0-100">
                </td>
                <td class="status-cell">
                    <span class="grade-status ${status}">${status === 'graded' ? 'Calificado' : 'Pendiente'}</span>
                </td>
                <td class="actions-cell">
                    <button class="btn-icon btn-edit" onclick="editStudentGrade(${student.ID_Estudiante})" title="Editar">
                        <i class="fas fa-edit"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
    
    // Add event listeners to grade inputs
    setupGradeInputListeners();
}

function setupGradeInputListeners() {
    const gradeInputs = document.querySelectorAll('.grade-input');
    
    gradeInputs.forEach(input => {
        input.addEventListener('input', function() {
            const grade = parseInt(this.value);
            this.classList.remove('excellent', 'good', 'poor');
            
            if (grade >= 80) {
                this.classList.add('excellent');
            } else if (grade >= 60) {
                this.classList.add('good');
            } else if (grade > 0) {
                this.classList.add('poor');
            }
        });
    });
}

function saveGradesBulk() {
    const evaluationSelect = document.getElementById('gradeEvaluation');
    const dateInput = document.getElementById('gradeDate');
    const notesInput = document.getElementById('gradeNotes');
    
    const selectedEvaluationId = parseInt(evaluationSelect.value);
    const gradeDate = dateInput.value;
    const notes = notesInput.value;
    
    // Validation
    if (!selectedEvaluationId || !gradeDate) {
        alert('Por favor complete todos los campos requeridos.');
        return;
    }
    
    const tableRows = document.querySelectorAll('#gradeTableBody tr[data-student-id]');
    let gradesSaved = 0;
    
    tableRows.forEach(row => {
        const studentId = parseInt(row.dataset.studentId);
        const gradeInput = row.querySelector('.grade-input');
        const grade = parseInt(gradeInput.value);
        
        if (grade >= 0 && grade <= 100) {
            // Check if grade already exists
            const existingIndex = appData.notas.findIndex(grade => 
                grade.Estudiante_ID_Estudiante === studentId && 
                grade.Evaluacion_ID_evaluacion === selectedEvaluationId
            );
            
            const gradeRecord = {
                ID_Nota: existingIndex >= 0 ? appData.notas[existingIndex].ID_Nota : Date.now(),
                Estudiante_ID_Estudiante: studentId,
                Evaluacion_ID_evaluacion: selectedEvaluationId,
                Calificacion: grade,
                Fecha_calificacion: gradeDate,
                Observacion: notes || ''
            };
            
            if (existingIndex >= 0) {
                appData.notas[existingIndex] = gradeRecord;
            } else {
                appData.notas.push(gradeRecord);
            }
            
            gradesSaved++;
        }
    });
    
    if (gradesSaved > 0) {
        saveData();
        showNotification(`${gradesSaved} calificaciones guardadas exitosamente`, 'success');
        loadStudentsForGradeMarking(); // Refresh the table
    } else {
        alert('No se guardaron calificaciones. Verifique que las calificaciones estén entre 0 y 100.');
    }
}

function hideGradeMarkingView() {
    const gradeMarkingView = document.getElementById('gradeMarkingView');
    const gradeMarkingList = document.getElementById('gradeMarkingList');
    
    if (gradeMarkingView) {
        gradeMarkingView.style.display = 'none';
        if (gradeMarkingList) {
            gradeMarkingList.style.display = 'block';
        }
    }
}

// Override the original load functions to use unified data
function loadStudents() {
    loadUnifiedStudentData();
}

function loadGrades() {
    loadUnifiedStudentData();
}

function loadAttendance() {
    loadUnifiedStudentData();
}

// Populate teacher filter dropdown for unified student management
function populateUnifiedTeacherFilter() {
    const teacherFilter = document.getElementById('unifiedTeacherFilter');
    if (!teacherFilter) return;

    // Get current user ID from localStorage
    const currentUserId = localStorage.getItem('userId');
    
    // Clear existing options except the first one
    teacherFilter.innerHTML = '<option value="" data-translate="all_teachers">Todos los Profesores</option>';
    
    // Add all teachers to the filter
    if (appData.usuarios_docente) {
        appData.usuarios_docente.forEach(teacher => {
            const option = document.createElement('option');
            option.value = teacher.ID_docente;
            option.textContent = `${teacher.Nombre_docente} ${teacher.Apellido_docente}`;
            teacherFilter.appendChild(option);
        });
    }
    
    // If current user is a teacher, set the filter to show only their students by default
    if (currentUserId) {
        teacherFilter.value = currentUserId;
        // Trigger filter update
        filterUnifiedData();
    }
}

// Get filtered exams based on teacher filter
function getFilteredExams() {
    const teacherFilter = document.getElementById('unifiedTeacherFilter');
    const selectedTeacher = teacherFilter ? teacherFilter.value : '';
    
    let filteredExams = appData.evaluacion || [];
    
    // Filter by teacher (exams for subjects taught by this teacher)
    if (selectedTeacher) {
        const teacherId = parseInt(selectedTeacher);
        const teacherSubjects = appData.materia.filter(subject => subject.Usuarios_docente_ID_docente === teacherId);
        const teacherSubjectIds = teacherSubjects.map(subject => subject.ID_materia);
        
        filteredExams = filteredExams.filter(exam => 
            teacherSubjectIds.includes(exam.Materia_ID_materia)
        );
    }
    
    return filteredExams;
}
