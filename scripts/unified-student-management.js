// Unified Student Management - Combines Students, Grades, Attendance, and Exams
function initializeUnifiedStudentManagement() {
    const addStudentBtn = document.getElementById('addStudentBtn');
    const markAttendanceBtn = document.getElementById('markAttendanceBtn');
    const unifiedSubjectFilter = document.getElementById('unifiedSubjectFilter');
    const unifiedCourseFilter = document.getElementById('unifiedCourseFilter');
    const unifiedTopicFilter = document.getElementById('unifiedTopicFilter');
    const unifiedGridViewBtn = document.getElementById('unifiedGridViewBtn');
    const unifiedListViewBtn = document.getElementById('unifiedListViewBtn');
    const unifiedMatrixViewBtn = document.getElementById('unifiedMatrixViewBtn');
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
            try {
                if (typeof showModal === 'function') {
                    showModal('studentModal');
                } else {
                    const modal = document.getElementById('studentModal');
                    if (modal) {
                        modal.classList.add('active');
                    }
                }
                if (typeof clearStudentForm === 'function') {
                    clearStudentForm();
                } else {
                    const form = document.getElementById('studentForm');
                    if (form) form.reset();
                }
            } catch (e) {
                alert('Error al abrir el formulario de estudiante');
            }
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
    if (unifiedSubjectFilter) {
        unifiedSubjectFilter.addEventListener('change', () => {
            filterUnifiedData();
        });
    }

    if (unifiedCourseFilter) {
        unifiedCourseFilter.addEventListener('change', () => {
            filterUnifiedData();
        });
    }

    if (unifiedTopicFilter) {
        unifiedTopicFilter.addEventListener('change', () => {
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

    if (unifiedMatrixViewBtn) {
        unifiedMatrixViewBtn.addEventListener('click', () => {
            switchToMatrixView();
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

    // Exams filter functionality
    const examsSubjectFilter = document.getElementById('examsSubjectFilter');
    const examsCourseFilter = document.getElementById('examsCourseFilter');
    const examsDateFilter = document.getElementById('examsDateFilter');
    
    if (examsSubjectFilter) {
        examsSubjectFilter.addEventListener('change', () => {
            loadExams();
        });
    }

    if (examsCourseFilter) {
        examsCourseFilter.addEventListener('change', () => {
            loadExams();
        });
    }

    if (examsDateFilter) {
        examsDateFilter.addEventListener('change', () => {
            loadExams();
        });
    }

    // Exams view toggle functionality - using main toggle buttons
    // The main toggle buttons (unifiedGridViewBtn, unifiedListViewBtn) will handle both students and exams

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
    populateUnifiedCourseFilter();
    populateExamsSubjectFilter();
    populateExamsCourseFilter();
    loadUnifiedStudentData();
    loadExams();
    
    // Set initial button visibility (students tab is active by default)
    document.querySelectorAll('.students-only').forEach(btn => btn.style.display = 'flex');
    document.querySelectorAll('.exams-only').forEach(btn => btn.style.display = 'none');
    
    // Set list view as default
    switchToListView();
}

function loadUnifiedStudentData() {
    const unifiedStudentCards = document.getElementById('unifiedStudentCards');
    const unifiedStudentList = document.getElementById('unifiedStudentList');
    
    if (!unifiedStudentCards || !unifiedStudentList) return;

    const filteredStudents = getFilteredUnifiedStudents();

    // Grid view - Student cards with integrated data
    unifiedStudentCards.innerHTML = filteredStudents.map(student => {
        // Obtener notas del estudiante y ordenarlas por fecha más reciente
        const studentIdNum = parseInt(student.ID_Estudiante);
        
        // Verificar que appData.notas existe
        if (!appData.notas || !Array.isArray(appData.notas)) {
            appData.notas = [];
        }
        
        const studentGrades = appData.notas
            .filter(g => {
                const gradeStudentId = parseInt(g.Estudiante_ID_Estudiante);
                return gradeStudentId === studentIdNum;
            })
            .sort((a, b) => {
                // Ordenar por fecha de calificación (más reciente primero)
                const dateA = a.Fecha_calificacion ? new Date(a.Fecha_calificacion) : 
                              (a.Fecha_registro ? new Date(a.Fecha_registro) : new Date(0));
                const dateB = b.Fecha_calificacion ? new Date(b.Fecha_calificacion) : 
                              (b.Fecha_registro ? new Date(b.Fecha_registro) : new Date(0));
                return dateB - dateA;
            });
        
        const studentAttendance = appData.asistencia.filter(a => a.Estudiante_ID_Estudiante === student.ID_Estudiante);
        
        // Calcular promedio (excluyendo ausentes si se desea, o incluyéndolos como 0)
        const gradesForAverage = studentGrades.filter(g => g.Calificacion > 0); // Excluir ausentes del promedio
        const averageGrade = gradesForAverage.length > 0 
            ? Math.round(gradesForAverage.reduce((sum, g) => sum + parseFloat(g.Calificacion), 0) / gradesForAverage.length * 10)
            : 0;
        
        const attendanceRate = studentAttendance.length > 0
            ? Math.round((studentAttendance.filter(a => a.Presente === 'Y').length / studentAttendance.length) * 100)
            : 0;

        // Obtener las 3 calificaciones más recientes
        const recentGrades = studentGrades.slice(0, 3);
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
                                    const evaluacionId = parseInt(grade.Evaluacion_ID_evaluacion);
                                    const evaluation = appData.evaluacion ? appData.evaluacion.find(e => parseInt(e.ID_evaluacion) === evaluacionId) : null;
                                    const materia = evaluation && appData.materia ? appData.materia.find(m => parseInt(m.ID_materia) === parseInt(evaluation.Materia_ID_materia)) : null;
                                    const calificacion = parseFloat(grade.Calificacion) || 0;
                                    const esAusente = calificacion === 0 && (
                                        (grade.Observacion && grade.Observacion.toUpperCase().includes('AUSENTE')) || 
                                        !grade.Observacion || 
                                        grade.Observacion.trim() === ''
                                    );
                                    const fecha = grade.Fecha_calificacion || grade.Fecha_registro || '';
                                    const fechaShort = fecha ? (fecha.split(' ')[0] || fecha.split('T')[0]).split('-').slice(1).join('/') : '';
                                    
                                    return `
                                        <div class="activity-item">
                                            <div style="flex: 1;">
                                                <div class="activity-subject">${evaluation ? evaluation.Titulo : 'Unknown'}</div>
                                                ${materia ? `<div style="font-size: 0.75em; color: #666;">${materia.Nombre}</div>` : ''}
                                                ${fechaShort ? `<div style="font-size: 0.7em; color: #999;">${fechaShort}</div>` : ''}
                                            </div>
                                            <span class="activity-grade ${esAusente ? 'status-absent' : calificacion >= 8 ? 'grade-excellent' : calificacion >= 6 ? 'grade-good' : 'grade-poor'}">
                                                ${esAusente ? 'Ausente' : calificacion.toFixed(2)}
                                            </span>
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
                        // Obtener notas del estudiante ordenadas por fecha más reciente
                        const studentIdNum = parseInt(student.ID_Estudiante);
                        
                        // Verificar que appData.notas existe
                        if (!appData.notas || !Array.isArray(appData.notas)) {
                            appData.notas = [];
                        }
                        
                        const studentGrades = appData.notas
                            .filter(g => {
                                const gradeStudentId = parseInt(g.Estudiante_ID_Estudiante);
                                return gradeStudentId === studentIdNum;
                            })
                            .sort((a, b) => {
                                const dateA = a.Fecha_calificacion ? new Date(a.Fecha_calificacion) : 
                                              (a.Fecha_registro ? new Date(a.Fecha_registro) : new Date(0));
                                const dateB = b.Fecha_calificacion ? new Date(b.Fecha_calificacion) : 
                                              (b.Fecha_registro ? new Date(b.Fecha_registro) : new Date(0));
                                return dateB - dateA;
                            });
                        const studentAttendance = appData.asistencia.filter(a => a.Estudiante_ID_Estudiante === student.ID_Estudiante);
                        
                        // Calcular promedio (excluyendo ausentes)
                        const gradesForAverage = studentGrades.filter(g => parseFloat(g.Calificacion) > 0);
                        const averageGrade = gradesForAverage.length > 0 
                            ? Math.round(gradesForAverage.reduce((sum, g) => sum + parseFloat(g.Calificacion), 0) / gradesForAverage.length * 10)
                            : 0;
                        
                        const attendanceRate = studentAttendance.length > 0
                            ? Math.round((studentAttendance.filter(a => a.Presente === 'Y').length / studentAttendance.length) * 100)
                            : 0;

                        const lastGrade = studentGrades[0]; // Ya está ordenado, tomar el primero
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
    const subjectFilter = document.getElementById('unifiedSubjectFilter');
    const courseFilter = document.getElementById('unifiedCourseFilter');
    const topicFilter = document.getElementById('unifiedTopicFilter');
    const selectedSubject = subjectFilter ? subjectFilter.value : '';
    const selectedCourse = courseFilter ? courseFilter.value : '';
    const selectedTopic = topicFilter ? topicFilter.value : '';
    
    // Get current teacher ID
    const currentUserId = localStorage.getItem('userId');
    const teacherId = currentUserId ? parseInt(currentUserId) : null;
    
    // Start with all students enrolled in subjects taught by current teacher
    let filteredStudents = appData.estudiante;

    if (teacherId) {
        // Get subjects taught by current teacher
        let teacherSubjects = appData.materia.filter(subject => subject.Usuarios_docente_ID_docente === teacherId);
        
        // Si el profesor tiene materias, mostrar estudiantes inscritos en esas materias
        // PERO también mostrar estudiantes que no tienen materias asignadas aún
        if (teacherSubjects.length > 0) {
            // Filter by course/division if selected
            if (selectedCourse) {
                teacherSubjects = teacherSubjects.filter(subject => subject.Curso_division === selectedCourse);
            }
            
            const teacherSubjectIds = teacherSubjects.map(subject => subject.ID_materia);
            
            // Get students enrolled in these subjects
            const enrolledStudentIds = new Set();
            (appData.alumnos_x_materia || []).forEach(enrollment => {
                if (teacherSubjectIds.includes(enrollment.Materia_ID_materia)) {
                    enrolledStudentIds.add(enrollment.Estudiante_ID_Estudiante);
                }
            });
            
            // Mostrar estudiantes inscritos en materias del docente
            // Y también estudiantes que NO tienen ninguna materia asignada (recién creados)
            const studentsWithoutSubjects = (appData.estudiante || []).filter(student => {
                const hasAnyEnrollment = (appData.alumnos_x_materia || []).some(
                    axm => axm.Estudiante_ID_Estudiante === student.ID_Estudiante
                );
                return !hasAnyEnrollment;
            });
            
            const enrolledStudentsArray = Array.from(enrolledStudentIds);
            filteredStudents = filteredStudents.filter(student => 
                enrolledStudentsArray.includes(student.ID_Estudiante) || 
                studentsWithoutSubjects.some(s => s.ID_Estudiante === student.ID_Estudiante)
            );
        }
        // Si el profesor NO tiene materias, mostrar TODOS los estudiantes
    }
    
    // Filter by subject (students enrolled in this subject)
    if (selectedSubject) {
        const subjectId = parseInt(selectedSubject);
        const enrolledStudentIds = appData.alumnos_x_materia
            .filter(enrollment => enrollment.Materia_ID_materia === subjectId)
            .map(enrollment => enrollment.Estudiante_ID_Estudiante);
        
        filteredStudents = filteredStudents.filter(student => 
            enrolledStudentIds.includes(student.ID_Estudiante)
        );
    }
    
    // Filter by tema_estudiante status (topic progress)
    if (selectedTopic) {
        const studentIdsWithTopicStatus = appData.tema_estudiante
            .filter(tema => tema.Estado === selectedTopic)
            .map(tema => tema.Estudiante_ID_Estudiante);
        
        filteredStudents = filteredStudents.filter(student => 
            studentIdsWithTopicStatus.includes(student.ID_Estudiante)
        );
    }
    
    return filteredStudents;
}
 

function filterUnifiedData() {
    loadUnifiedStudentData();
    // También actualizar la matriz si está visible
    const studentMatrix = document.getElementById('unifiedStudentMatrix');
    if (studentMatrix && studentMatrix.style.display !== 'none') {
        loadStudentMatrix();
    }
}

function loadStudentMatrix() {
    const matrixContainer = document.getElementById('unifiedStudentMatrix');
    if (!matrixContainer) return;

    // Obtener ID del docente actual
    const currentUserId = localStorage.getItem('userId');
    const teacherId = currentUserId ? parseInt(currentUserId) : null;

    if (!teacherId) {
        matrixContainer.innerHTML = '<p class="no-data">No hay docente logueado</p>';
        return;
    }

    // Filtrar materias del docente actual
    const teacherSubjects = (appData.materia || []).filter(m => 
        m.Usuarios_docente_ID_docente === teacherId && 
        (m.Estado === 'ACTIVA' || !m.Estado)
    );

    if (teacherSubjects.length === 0) {
        matrixContainer.innerHTML = '<p class="no-data">No hay materias disponibles. Creá materias primero.</p>';
        return;
    }

    // Obtener estudiantes (filtrar por los inscritos en las materias del docente)
    const enrolledStudentIds = new Set();
    (appData.alumnos_x_materia || []).forEach(enrollment => {
        if (teacherSubjects.some(s => s.ID_materia === enrollment.Materia_ID_materia)) {
            enrolledStudentIds.add(enrollment.Estudiante_ID_Estudiante);
        }
    });

    let filteredStudents = (appData.estudiante || []).filter(student => 
        enrolledStudentIds.has(student.ID_Estudiante)
    );

    // Aplicar filtros adicionales si existen
    const subjectFilter = document.getElementById('unifiedSubjectFilter');
    const courseFilter = document.getElementById('unifiedCourseFilter');
    
    if (subjectFilter && subjectFilter.value) {
        const selectedSubjectId = parseInt(subjectFilter.value);
        const studentIdsInSubject = (appData.alumnos_x_materia || [])
            .filter(axm => axm.Materia_ID_materia === selectedSubjectId)
            .map(axm => axm.Estudiante_ID_Estudiante);
        filteredStudents = filteredStudents.filter(s => 
            studentIdsInSubject.includes(s.ID_Estudiante)
        );
    }

    if (courseFilter && courseFilter.value) {
        const selectedCourse = courseFilter.value;
        const subjectIdsInCourse = teacherSubjects
            .filter(s => s.Curso_division === selectedCourse)
            .map(s => s.ID_materia);
        const studentIdsInCourse = (appData.alumnos_x_materia || [])
            .filter(axm => subjectIdsInCourse.includes(axm.Materia_ID_materia))
            .map(axm => axm.Estudiante_ID_Estudiante);
        filteredStudents = filteredStudents.filter(s => 
            studentIdsInCourse.includes(s.ID_Estudiante)
        );
    }

    // Crear mapa de inscripciones para acceso rápido
    const enrollmentMap = new Map();
    (appData.alumnos_x_materia || []).forEach(axm => {
        const key = `${axm.Estudiante_ID_Estudiante}-${axm.Materia_ID_materia}`;
        enrollmentMap.set(key, axm);
    });

    // Crear la tabla
    matrixContainer.innerHTML = `
        <div class="matrix-container">
            <div class="table-responsive">
                <table class="data-table matrix-table" style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr>
                            <th style="position: sticky; left: 0; background: #fff; z-index: 10; border: 1px solid #ddd; padding: 12px;">
                                <strong>Estudiante</strong>
                            </th>
                            ${teacherSubjects.map(subject => `
                                <th style="border: 1px solid #ddd; padding: 12px; text-align: center; min-width: 120px;">
                                    <div>${subject.Nombre}</div>
                                    <small style="color: #666; font-size: 0.85em;">${subject.Curso_division}</small>
                                </th>
                            `).join('')}
                        </tr>
                    </thead>
                    <tbody>
                        ${filteredStudents.length === 0 ? `
                            <tr>
                                <td colspan="${teacherSubjects.length + 1}" style="text-align: center; padding: 40px; color: #999;">
                                    No hay estudiantes inscritos
                                </td>
                            </tr>
                        ` : filteredStudents.map(student => `
                            <tr>
                                <td style="position: sticky; left: 0; background: #fff; z-index: 9; border: 1px solid #ddd; padding: 12px; font-weight: 500;">
                                    <strong>${student.Nombre} ${student.Apellido}</strong>
                                </td>
                                ${teacherSubjects.map(subject => {
                                    const key = `${student.ID_Estudiante}-${subject.ID_materia}`;
                                    const isEnrolled = enrollmentMap.has(key);
                                    const enrollment = enrollmentMap.get(key);
                                    return `
                                        <td style="border: 1px solid #ddd; padding: 12px; text-align: center; background: ${isEnrolled ? '#e8f5e9' : '#ffebee'};">
                                            ${isEnrolled ? `
                                                <span style="color: #2e7d32; font-size: 1.2em; font-weight: bold;">✓</span>
                                                <div style="font-size: 0.75em; color: #666; margin-top: 4px;">
                                                    ${enrollment.Estado || 'INSCRITO'}
                                                </div>
                                            ` : `
                                                <span style="color: #c62828; font-size: 1.2em;">✗</span>
                                            `}
                                        </td>
                                    `;
                                }).join('')}
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

function switchToGridView() {
    // Handle students view
    const studentCards = document.getElementById('unifiedStudentCards');
    const studentList = document.getElementById('unifiedStudentList');
    const studentMatrix = document.getElementById('unifiedStudentMatrix');
    if (studentCards && studentList && studentMatrix) {
        studentCards.style.display = 'grid';
        studentList.style.display = 'none';
        studentMatrix.style.display = 'none';
    }
    
    // Handle exams view
    const examsContainer = document.getElementById('examsContainer');
    const examsList = document.getElementById('examsList');
    if (examsContainer && examsList) {
        examsContainer.style.display = 'grid';
        examsList.style.display = 'none';
    }
    
    const gridBtn = document.getElementById('unifiedGridViewBtn');
    const listBtn = document.getElementById('unifiedListViewBtn');
    const matrixBtn = document.getElementById('unifiedMatrixViewBtn');
    if (gridBtn) gridBtn.classList.add('active');
    if (listBtn) listBtn.classList.remove('active');
    if (matrixBtn) matrixBtn.classList.remove('active');
}

function switchToListView() {
    // Handle students view
    const studentCards = document.getElementById('unifiedStudentCards');
    const studentList = document.getElementById('unifiedStudentList');
    const studentMatrix = document.getElementById('unifiedStudentMatrix');
    if (studentCards && studentList && studentMatrix) {
        studentCards.style.display = 'none';
        studentList.style.display = 'block';
        studentMatrix.style.display = 'none';
    }
    
    // Handle exams view
    const examsContainer = document.getElementById('examsContainer');
    const examsList = document.getElementById('examsList');
    if (examsContainer && examsList) {
        examsContainer.style.display = 'none';
        examsList.style.display = 'block';
    }
    
    const gridBtn = document.getElementById('unifiedGridViewBtn');
    const listBtn = document.getElementById('unifiedListViewBtn');
    const matrixBtn = document.getElementById('unifiedMatrixViewBtn');
    if (gridBtn) gridBtn.classList.remove('active');
    if (listBtn) listBtn.classList.add('active');
    if (matrixBtn) matrixBtn.classList.remove('active');
}

function switchToMatrixView() {
    // Handle students view
    const studentCards = document.getElementById('unifiedStudentCards');
    const studentList = document.getElementById('unifiedStudentList');
    const studentMatrix = document.getElementById('unifiedStudentMatrix');
    if (studentCards && studentList && studentMatrix) {
        studentCards.style.display = 'none';
        studentList.style.display = 'none';
        studentMatrix.style.display = 'block';
        loadStudentMatrix();
    }
    
    const gridBtn = document.getElementById('unifiedGridViewBtn');
    const listBtn = document.getElementById('unifiedListViewBtn');
    const matrixBtn = document.getElementById('unifiedMatrixViewBtn');
    if (gridBtn) gridBtn.classList.remove('active');
    if (listBtn) listBtn.classList.remove('active');
    if (matrixBtn) matrixBtn.classList.add('active');
}

function populateSubjectFilter() {
    const subjectFilter = document.getElementById('unifiedSubjectFilter');
    if (!subjectFilter) return;

    // Get current user ID from localStorage
    const currentUserId = localStorage.getItem('userId');
    
    // Filter subjects by current teacher if available
    let subjectsToShow = appData.materia;
    if (currentUserId) {
        const teacherId = parseInt(currentUserId);
        subjectsToShow = appData.materia.filter(subject => subject.Usuarios_docente_ID_docente === teacherId);
    }

    subjectFilter.innerHTML = `
        <option value="" data-translate="all_subjects">Todas las Materias</option>
        ${subjectsToShow.map(subject => 
            `<option value="${subject.ID_materia}">${subject.Nombre}</option>`
        ).join('')}
    `;
}

function populateUnifiedCourseFilter() {
    const courseFilter = document.getElementById('unifiedCourseFilter');
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

function populateExamsCourseFilter() {
    const courseFilter = document.getElementById('examsCourseFilter');
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

function populateExamsSubjectFilter() {
    const examsSubjectFilter = document.getElementById('examsSubjectFilter');
    if (!examsSubjectFilter) return;

    // Get current user ID from localStorage
    const currentUserId = localStorage.getItem('userId');
    
    // Filter subjects by current teacher if available
    let subjectsToShow = appData.materia;
    if (currentUserId) {
        const teacherId = parseInt(currentUserId);
        subjectsToShow = appData.materia.filter(subject => subject.Usuarios_docente_ID_docente === teacherId);
    }

    examsSubjectFilter.innerHTML = `
        <option value="" data-translate="all_subjects">Todas las Materias</option>
        ${subjectsToShow.map(subject => 
            `<option value="${subject.ID_materia}">${subject.Nombre}</option>`
        ).join('')}
    `;
}

function showStudentDetail(studentId) {
    const student = appData.estudiante.find(s => s.ID_Estudiante === studentId);
    if (!student) return;

    // Obtener notas del estudiante y ordenarlas por fecha más reciente
    // Asegurar que ambos valores sean del mismo tipo para la comparación
    const studentIdNum = parseInt(studentId);
    
    // Verificar que appData.notas existe y es un array
    if (!appData.notas || !Array.isArray(appData.notas)) {
        console.warn('appData.notas no está disponible o no es un array');
        appData.notas = [];
    }
    
    const studentGrades = appData.notas
        .filter(g => {
            const gradeStudentId = parseInt(g.Estudiante_ID_Estudiante);
            return gradeStudentId === studentIdNum;
        })
        .sort((a, b) => {
            // Ordenar por fecha de calificación (más reciente primero)
            const dateA = a.Fecha_calificacion ? new Date(a.Fecha_calificacion) : 
                          (a.Fecha_registro ? new Date(a.Fecha_registro) : new Date(0));
            const dateB = b.Fecha_calificacion ? new Date(b.Fecha_calificacion) : 
                          (b.Fecha_registro ? new Date(b.Fecha_registro) : new Date(0));
            return dateB - dateA;
        });
    
    const studentAttendance = appData.asistencia.filter(a => a.Estudiante_ID_Estudiante === studentId);
    
    // Calcular promedio (excluyendo ausentes)
    const gradesForAverage = studentGrades.filter(g => parseFloat(g.Calificacion) > 0);
    const averageGrade = gradesForAverage.length > 0 
        ? Math.round(gradesForAverage.reduce((sum, g) => sum + parseFloat(g.Calificacion), 0) / gradesForAverage.length * 10)
        : 0;
    
    const attendanceRate = studentAttendance.length > 0
        ? Math.round((studentAttendance.filter(a => a.Presente === 'Y').length / studentAttendance.length) * 100)
        : 0;

    // Update panel content
    document.getElementById('selectedStudentName').textContent = `${student.Nombre} ${student.Apellido}`;
    
    // Mostrar porcentaje de asistencias
    const attendanceElement = document.getElementById('studentAttendance');
    if (attendanceElement) {
        attendanceElement.textContent = `${attendanceRate}%`;
        // Cambiar color según el porcentaje
        if (attendanceRate >= 80) {
            attendanceElement.style.color = '#28a745';
        } else if (attendanceRate >= 60) {
            attendanceElement.style.color = '#ffc107';
        } else {
            attendanceElement.style.color = '#dc3545';
        }
    }

    // Mostrar todas las calificaciones (nombre del examen + nota en la misma línea)
    const recentGradesElement = document.getElementById('studentRecentGrades');
    if (!recentGradesElement) {
        console.error('studentRecentGrades element not found!');
        return;
    }
    
    // Verificar que appData.evaluacion y appData.materia existen
    if (!appData.evaluacion || !Array.isArray(appData.evaluacion)) {
        appData.evaluacion = [];
    }
    if (!appData.materia || !Array.isArray(appData.materia)) {
        appData.materia = [];
    }
    
    if (studentGrades.length > 0) {
        const htmlContent = studentGrades.map(grade => {
            // Asegurar comparación de tipos correcta
            const evaluacionId = parseInt(grade.Evaluacion_ID_evaluacion);
            const evaluation = appData.evaluacion.find(e => parseInt(e.ID_evaluacion) === evaluacionId);
            const calificacion = parseFloat(grade.Calificacion) || 0;
            const esAusente = calificacion === 0 && (
                (grade.Observacion && grade.Observacion.toUpperCase().includes('AUSENTE')) || 
                !grade.Observacion || 
                (grade.Observacion && grade.Observacion.trim() === '')
            );
            
            // Determinar color según calificación
            let notaColor = '#dc3545'; // Rojo por defecto
            let notaBg = '#ffebee';
            if (esAusente) {
                notaColor = '#dc3545';
                notaBg = '#fee';
            } else if (calificacion >= 8) {
                notaColor = '#28a745';
                notaBg = '#e8f5e9';
            } else if (calificacion >= 6) {
                notaColor = '#ffc107';
                notaBg = '#fff3e0';
            }
            
            return `
                <div style="display: flex; align-items: center; justify-content: space-between; padding: 10px; background: #f8f9fa; border-radius: 6px; border-left: 3px solid ${notaColor};">
                    <span style="font-weight: 500; color: #333; flex: 1;">
                        ${evaluation ? evaluation.Titulo : 'Evaluación no encontrada'}
                    </span>
                    <span style="font-weight: 700; font-size: 1.1em; color: ${notaColor}; background: ${notaBg}; padding: 4px 10px; border-radius: 4px; min-width: 60px; text-align: center;">
                        ${esAusente ? 'Ausente' : calificacion.toFixed(2)}
                    </span>
                </div>
            `;
        }).join('');
        
        recentGradesElement.innerHTML = htmlContent;
    } else {
        recentGradesElement.innerHTML = '<p style="color: #999; text-align: center; padding: 20px;">Sin calificaciones</p>';
    }

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
    
    // Show/hide appropriate action buttons and filters
    document.querySelectorAll('.students-only').forEach(btn => btn.style.display = 'flex');
    document.querySelectorAll('.exams-only').forEach(btn => btn.style.display = 'none');
}

function switchToExamsTab() {
    document.getElementById('studentsTab').classList.remove('active');
    document.getElementById('examsTab').classList.add('active');
    document.getElementById('studentsTabContent').classList.remove('active');
    document.getElementById('examsTabContent').classList.add('active');
    
    // Show/hide appropriate action buttons and filters
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

// Removed duplicate exam toggle functions - now using unified toggle functions

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
            const examDate = new Date(exam.Fecha + 'T00:00:00');
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

// Funciones de manejo de exámenes (fuera de getFilteredExams)
function saveExam(event) {
    event.preventDefault();
    
    const payload = {
        Titulo: document.getElementById('examTitle').value,
        Materia_ID_materia: parseInt(document.getElementById('examSubject').value),
        Fecha: document.getElementById('examDate').value,
        Tipo: document.getElementById('examType').value,
        Descripcion: document.getElementById('examDescription').value || '',
        Estado: 'PROGRAMADA'
    };
    
    if (typeof API !== 'undefined' && typeof API.createEvaluacion === 'function') {
        API.createEvaluacion(payload).then(async () => {
            closeModal(document.querySelector('.modal'));
            if (typeof hydrateAppData === 'function') await hydrateAppData();
            loadExams();
        }).catch(err => alert(err.message || 'No se pudo guardar la evaluación.'));
    } else {
        alert('Sistema de API no disponible');
    }
}

function editExam(id) {
    const exam = appData.evaluacion.find(e => e.ID_evaluacion === id);
    if (!exam) return;
    
    showExamModal();
    document.getElementById('examTitle').value = exam.Titulo;
    document.getElementById('examSubject').value = exam.Materia_ID_materia;
    document.getElementById('examDate').value = exam.Fecha;
    document.getElementById('examType').value = exam.Tipo;
    document.getElementById('examDescription').value = exam.Descripcion || '';
    
    const form = document.querySelector('.modal form');
    if (form) {
        form.onsubmit = (e) => {
            e.preventDefault();
            const payload = {
                Titulo: document.getElementById('examTitle').value,
                Materia_ID_materia: parseInt(document.getElementById('examSubject').value),
                Fecha: document.getElementById('examDate').value,
                Tipo: document.getElementById('examType').value,
                Descripcion: document.getElementById('examDescription').value || '',
                Estado: exam.Estado || 'PROGRAMADA'
            };
            if (typeof API !== 'undefined' && typeof API.updateEvaluacion === 'function') {
                API.updateEvaluacion(id, payload).then(async () => {
                    closeModal(document.querySelector('.modal'));
                    if (typeof hydrateAppData === 'function') await hydrateAppData();
                    loadExams();
                }).catch(err => alert(err.message || 'No se pudo actualizar la evaluación.'));
            }
        };
    }
}

function deleteExam(id) {
    if (!confirm('¿Eliminar esta evaluación?')) return;
    if (typeof API !== 'undefined' && typeof API.deleteEvaluacion === 'function') {
        API.deleteEvaluacion(id).then(async () => {
            if (typeof hydrateAppData === 'function') await hydrateAppData();
            loadExams();
        }).catch(err => alert(err.message || 'No se pudo eliminar la evaluación.'));
    }
}