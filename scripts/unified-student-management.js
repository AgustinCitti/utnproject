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
            showAttendanceModal();
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
        const studentGrades = appData.grades.filter(g => g.studentId === student.id);
        const studentAttendance = appData.attendance.filter(a => a.studentId === student.id);
        
        const averageGrade = studentGrades.length > 0 
            ? Math.round(studentGrades.reduce((sum, g) => sum + g.grade, 0) / studentGrades.length)
            : 0;
        
        const attendanceRate = studentAttendance.length > 0
            ? Math.round((studentAttendance.filter(a => a.status === 'present').length / studentAttendance.length) * 100)
            : 0;

        const recentGrades = studentGrades.slice(-3).reverse();
        const recentAttendance = studentAttendance.slice(-5).reverse();

        return `
            <div class="unified-student-card" onclick="showStudentDetail(${student.id})">
                <div class="card-header">
                    <div class="student-avatar">
                        <i class="fas fa-user"></i>
                    </div>
                    <div class="student-info">
                        <h3 class="student-name">${student.firstName} ${student.lastName}</h3>
                        <p class="student-id">ID: ${student.studentId}</p>
                        <p class="student-course">${student.course}</p>
                    </div>
                    <div class="student-actions">
                        <button class="btn-icon btn-edit" onclick="event.stopPropagation(); editStudent(${student.id})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-icon btn-delete" onclick="event.stopPropagation(); deleteStudent(${student.id})">
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
                                    const subject = appData.subjects.find(s => s.id === grade.subjectId);
                                    return `
                                        <div class="activity-item">
                                            <span class="activity-subject">${subject ? subject.name : 'Unknown'}</span>
                                            <span class="activity-grade grade-${grade.grade >= 80 ? 'excellent' : grade.grade >= 60 ? 'good' : 'poor'}">${grade.grade}</span>
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
                                    const subject = appData.subjects.find(s => s.id === attendance.subjectId);
                                    const shortDate = attendance.date.split('-').slice(1).join('/');
                                    return `
                                        <div class="activity-item">
                                            <span class="activity-date">${shortDate}</span>
                                            <span class="activity-status status-${attendance.status}">${attendance.status}</span>
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
                        const studentGrades = appData.grades.filter(g => g.studentId === student.id);
                        const studentAttendance = appData.attendance.filter(a => a.studentId === student.id);
                        
                        const averageGrade = studentGrades.length > 0 
                            ? Math.round(studentGrades.reduce((sum, g) => sum + g.grade, 0) / studentGrades.length)
                            : 0;
                        
                        const attendanceRate = studentAttendance.length > 0
                            ? Math.round((studentAttendance.filter(a => a.status === 'present').length / studentAttendance.length) * 100)
                            : 0;

                        const lastGrade = studentGrades.sort((a, b) => new Date(b.date) - new Date(a.date))[0];
                        const lastAttendance = studentAttendance.sort((a, b) => new Date(b.date) - new Date(a.date))[0];
                        
                        let lastActivity = 'Sin actividad';
                        let lastActivityDate = '';
                        
                        if (lastGrade && lastAttendance) {
                            const gradeDate = new Date(lastGrade.date);
                            const attendanceDate = new Date(lastAttendance.date);
                            if (gradeDate > attendanceDate) {
                                lastActivity = 'Calificación';
                                lastActivityDate = lastGrade.date;
                            } else {
                                lastActivity = 'Asistencia';
                                lastActivityDate = lastAttendance.date;
                            }
                        } else if (lastGrade) {
                            lastActivity = 'Calificación';
                            lastActivityDate = lastGrade.date;
                        } else if (lastAttendance) {
                            lastActivity = 'Asistencia';
                            lastActivityDate = lastAttendance.date;
                        }

                        return `
                            <tr onclick="showStudentDetail(${student.id})" class="clickable-row">
                                <td>
                                    <div class="student-cell">
                                        <div class="student-avatar-small">
                                            <i class="fas fa-user"></i>
                                        </div>
                                        <div class="student-info">
                                            <strong>${student.firstName} ${student.lastName}</strong>
                                            <small>${student.studentId}</small>
                                        </div>
                                    </div>
                                </td>
                                <td>${student.course}</td>
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
                                        <button class="btn-icon btn-edit" onclick="event.stopPropagation(); editStudent(${student.id})" title="Editar">
                                            <i class="fas fa-edit"></i>
                                        </button>
                                        <button class="btn-icon btn-delete" onclick="event.stopPropagation(); deleteStudent(${student.id})" title="Eliminar">
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
    
    let filteredStudents = appData.students;
    
    // Filter by course
    if (selectedCourse) {
        filteredStudents = filteredStudents.filter(student => student.course === selectedCourse);
    }
    
    // Filter by subject (students who have grades or attendance in this subject)
    if (selectedSubject) {
        const subjectId = parseInt(selectedSubject);
        filteredStudents = filteredStudents.filter(student => {
            const hasGrades = appData.grades.some(g => g.studentId === student.id && g.subjectId === subjectId);
            const hasAttendance = appData.attendance.some(a => a.studentId === student.id && a.subjectId === subjectId);
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
        ${appData.subjects.map(subject => 
            `<option value="${subject.id}">${subject.name}</option>`
        ).join('')}
    `;
}

function showStudentDetail(studentId) {
    const student = appData.students.find(s => s.id === studentId);
    if (!student) return;

    const studentGrades = appData.grades.filter(g => g.studentId === studentId);
    const studentAttendance = appData.attendance.filter(a => a.studentId === studentId);
    
    const averageGrade = studentGrades.length > 0 
        ? Math.round(studentGrades.reduce((sum, g) => sum + g.grade, 0) / studentGrades.length)
        : 0;
    
    const attendanceRate = studentAttendance.length > 0
        ? Math.round((studentAttendance.filter(a => a.status === 'present').length / studentAttendance.length) * 100)
        : 0;

    // Update panel content
    document.getElementById('selectedStudentName').textContent = `${student.firstName} ${student.lastName}`;
    document.getElementById('studentAverage').textContent = `${averageGrade}%`;
    document.getElementById('studentAttendance').textContent = `${attendanceRate}%`;
    document.getElementById('studentTotalGrades').textContent = studentGrades.length;

    // Recent grades
    const recentGrades = studentGrades.slice(-5).reverse();
    document.getElementById('studentRecentGrades').innerHTML = recentGrades.map(grade => {
        const subject = appData.subjects.find(s => s.id === grade.subjectId);
        return `
            <div class="grade-item">
                <span class="grade-subject">${subject ? subject.name : 'Unknown'}</span>
                <span class="grade-value grade-${grade.grade >= 80 ? 'excellent' : grade.grade >= 60 ? 'good' : 'poor'}">${grade.grade}</span>
                <span class="grade-date">${grade.date}</span>
            </div>
        `;
    }).join('') || '<p class="no-data">Sin calificaciones</p>';

    // Attendance history
    const recentAttendance = studentAttendance.slice(-10).reverse();
    document.getElementById('studentAttendanceHistory').innerHTML = recentAttendance.map(attendance => {
        const subject = appData.subjects.find(s => s.id === attendance.subjectId);
        return `
            <div class="attendance-item">
                <span class="attendance-date">${attendance.date}</span>
                <span class="attendance-subject">${subject ? subject.name : 'Unknown'}</span>
                <span class="attendance-status status-${attendance.status}">${attendance.status}</span>
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
