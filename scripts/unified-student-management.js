// Unified Student Management - Combines Students, Grades, and Attendance
function initializeUnifiedStudentManagement() {
    const addStudentBtn = document.getElementById('addStudentBtn');
    const addGradeBtn = document.getElementById('addGradeBtn');
    const markAttendanceBtn = document.getElementById('markAttendanceBtn');
    const unifiedCourseFilter = document.getElementById('unifiedCourseFilter');
    const unifiedSubjectFilter = document.getElementById('unifiedSubjectFilter');
    const unifiedGridViewBtn = document.getElementById('unifiedGridViewBtn');
    const unifiedListViewBtn = document.getElementById('unifiedListViewBtn');
    const closeStudentDetail = document.getElementById('closeStudentDetail');

    // Event listeners for action buttons
    if (addStudentBtn) {
        addStudentBtn.addEventListener('click', () => {
            showModal('studentModal');
            clearStudentForm();
        });
    }

    if (addGradeBtn) {
        addGradeBtn.addEventListener('click', () => {
            showModal('gradeModal');
            setTimeout(() => {
                populateGradeForm();
            }, 100);
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

    // Modal handlers
    setupModalHandlers('studentModal');
    setupModalHandlers('gradeModal');

    // Initialize data
    populateSubjectFilter();
    loadUnifiedStudentData();
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
    const courseFilter = document.getElementById('unifiedCourseFilter');
    const subjectFilter = document.getElementById('unifiedSubjectFilter');
    const selectedCourse = courseFilter ? courseFilter.value : '';
    const selectedSubject = subjectFilter ? subjectFilter.value : '';
    
    let filteredStudents = appData.estudiante;
    
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
