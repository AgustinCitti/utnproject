// Unified Student Management - Combines Students, Grades, Attendance, and Exams

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

// Función para verificar si un estudiante es intensificador
// Usa la columna INTENSIFICA de la base de datos
function isStudentIntensificador(student) {
    if (!student) return false;
    
    // Verificar la columna INTENSIFICA directamente
    return student.INTENSIFICA === true || student.INTENSIFICA === 1 || student.INTENSIFICA === '1';
}

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

    // Matrix view button removed - functionality not working properly

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
    // Botón gradeStudentsBtn eliminado - ya no se necesita
    
    if (globalCreateExamBtn) {
        globalCreateExamBtn.addEventListener('click', () => {
            showExamModal();
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
    setupModalHandlers('studentDetailsModal');
    setupModalHandlers('exportDialogModal');
    
    // Grade marking functionality
    const gradeEvaluationSelect = document.getElementById('gradeEvaluation');
    const saveGradesBtn = document.getElementById('saveGradesBtn');
    const cancelGradesBtn = document.getElementById('cancelGradesBtn');
    const backToStudentsBtn = document.getElementById('backToStudentsBtn');
    
    if (gradeEvaluationSelect) {
        gradeEvaluationSelect.addEventListener('change', async () => {
            console.log('gradeEvaluationSelect change event triggered');
            await loadStudentsForGradeMarking();
        });
    } else {
        console.warn('initializeUnifiedStudentManagement: gradeEvaluationSelect not found');
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
            // Hide grade marking view first
            hideGradeMarkingView();
            // Then navigate to student-management section
            showSection('student-management', 'students');
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
    
    // Initialize export functionality
    initializeExportFunctionality();
}

function loadUnifiedStudentData() {
    const unifiedStudentCards = document.getElementById('unifiedStudentCards');
    const unifiedStudentList = document.getElementById('unifiedStudentList');
    
    if (!unifiedStudentCards || !unifiedStudentList) return;

    // Ensure appData is initialized
    if (!appData) appData = {};
    if (!Array.isArray(appData.estudiante)) appData.estudiante = [];
    if (!Array.isArray(appData.notas)) appData.notas = [];
    if (!Array.isArray(appData.asistencia)) appData.asistencia = [];
    if (!Array.isArray(appData.evaluacion)) appData.evaluacion = [];
    if (!Array.isArray(appData.materia)) appData.materia = [];

    const filteredStudents = getFilteredUnifiedStudents();
    
    // Show empty state if no students
    if (!filteredStudents || filteredStudents.length === 0) {
        unifiedStudentList.innerHTML = `
            <div class="no-data-message" style="text-align: center; padding: 40px; color: #666;">
                <i class="fas fa-users" style="font-size: 3em; margin-bottom: 20px; color: #ccc;"></i>
                <p style="font-size: 1.1em; margin-bottom: 10px;">No hay estudiantes disponibles</p>
                <p style="color: #999;">Agrega estudiantes o verifica los filtros aplicados.</p>
            </div>
        `;
        unifiedStudentCards.innerHTML = '';
        return;
    }

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
        
        const studentAttendance = (appData.asistencia || []).filter(a => a.Estudiante_ID_Estudiante === student.ID_Estudiante);
        
        // Calcular promedio (excluyendo ausentes) - formato decimal (0-10)
        const gradesForAverage = studentGrades.filter(g => parseFloat(g.Calificacion) > 0); // Excluir ausentes del promedio
        const averageGrade = gradesForAverage.length > 0 
            ? parseFloat((gradesForAverage.reduce((sum, g) => sum + parseFloat(g.Calificacion), 0) / gradesForAverage.length).toFixed(1))
            : 0;
        
        // Support both 'P' (new format) and 'Y' (old format for compatibility)
        const attendanceRate = studentAttendance.length > 0
            ? Math.round((studentAttendance.filter(a => a.Presente === 'P' || a.Presente === 'Y').length / studentAttendance.length) * 100)
            : 0;

        // Obtener las 3 calificaciones más recientes
        const recentGrades = studentGrades.slice(0, 3);
        const recentAttendance = studentAttendance.slice(-5).reverse();

        // Verificar si el estudiante es intensificador
        const isIntensificador = isStudentIntensificador(student);
        const cardClass = isIntensificador ? 'unified-student-card intensificador-card' : 'unified-student-card';
        const displayEstado = getStudentDisplayEstado(student);
        
        return `
            <div class="${cardClass}" onclick="showStudentDetail(${parseInt(student.ID_Estudiante)})" style="${isIntensificador ? 'background-color: #fff3e0; border-left: 4px solid #ff9800; cursor: pointer;' : 'cursor: pointer;'}">
                <div class="card-header">
                    <div class="student-avatar">
                        <i class="fas fa-user"></i>
                    </div>
                    <div class="student-info">
                        <h3 class="student-name">${student.Nombre} ${student.Apellido}${isIntensificador ? ' <span style="color: #ff9800; font-size: 0.8em;">(Intensificador)</span>' : ''}</h3>
                        <p class="student-id">ID: ${student.ID_Estudiante}</p>
                        <p class="student-course">Estudiante</p>
                    </div>
                    <div class="student-actions">
                        ${isIntensificador ? `
                            <button class="btn-icon btn-assign" onclick="event.stopPropagation(); assignThemesToIntensificador(${student.ID_Estudiante})" title="Asignar Temas de Intensificación">
                                <i class="fas fa-book-reader"></i>
                            </button>
                        ` : ''}
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
                            <span class="stat-value grade-${averageGrade >= 8.0 ? 'excellent' : averageGrade >= 6.0 ? 'good' : 'poor'}">${averageGrade.toFixed(1)}</span>
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
                                    const subject = (appData.materia || []).find(s => s.ID_materia === attendance.Materia_ID_materia);
                                    const shortDate = attendance.Fecha.split('-').slice(1).join('/');
                                    // Support both 'P' (new format) and 'Y' (old format for compatibility)
                                    const status = (attendance.Presente === 'P' || attendance.Presente === 'Y') ? 'present' : 
                                                  (attendance.Presente === 'A' || attendance.Presente === 'N') ? 'absent' : 
                                                  attendance.Presente === 'T' ? 'tardy' : 
                                                  attendance.Presente === 'J' ? 'justified' : 'unknown';
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
                        const studentAttendance = (appData.asistencia || []).filter(a => a.Estudiante_ID_Estudiante === student.ID_Estudiante);
                        
                        // Calcular promedio (excluyendo ausentes) - formato decimal (0-10)
                        const gradesForAverage = studentGrades.filter(g => parseFloat(g.Calificacion) > 0);
                        const averageGrade = gradesForAverage.length > 0 
                            ? parseFloat((gradesForAverage.reduce((sum, g) => sum + parseFloat(g.Calificacion), 0) / gradesForAverage.length).toFixed(1))
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

                        // Verificar si el estudiante es intensificador
                        const isIntensificador = isStudentIntensificador(student);
                        const rowStyle = isIntensificador ? 'background-color: #fff3e0; border-left: 3px solid #ff9800;' : '';
                        const displayEstado = getStudentDisplayEstado(student);
                        
                        return `
                            <tr onclick="showStudentDetail(${parseInt(student.ID_Estudiante)})" class="clickable-row" style="${rowStyle}; cursor: pointer;">
                                <td>
                                    <div class="student-cell">
                                        <div class="student-avatar-small">
                                            <i class="fas fa-user"></i>
                                        </div>
                                        <div class="student-info">
                                            <strong>${student.Nombre} ${student.Apellido}${isIntensificador ? ' <span style="color: #ff9800;">(Intensificador)</span>' : ''}</strong>
                                            <small>${student.ID_Estudiante}</small>
                                        </div>
                                    </div>
                                </td>
                                <td>Estudiante</td>
                                <td>
                                    <span class="table-status grade-${averageGrade >= 8.0 ? 'excellent' : averageGrade >= 6.0 ? 'good' : 'poor'}">
                                        ${averageGrade.toFixed(1)}
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
                                        ${isIntensificador ? `
                                            <button class="btn-icon btn-assign" onclick="event.stopPropagation(); assignThemesToIntensificador(${student.ID_Estudiante})" title="Asignar Temas de Intensificación">
                                                <i class="fas fa-book-reader"></i>
                                            </button>
                                        ` : ''}
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
    
    // Ensure appData arrays exist
    if (!appData) appData = {};
    if (!Array.isArray(appData.estudiante)) appData.estudiante = [];
    if (!Array.isArray(appData.materia)) appData.materia = [];
    if (!Array.isArray(appData.alumnos_x_materia)) appData.alumnos_x_materia = [];
    if (!Array.isArray(appData.tema_estudiante)) appData.tema_estudiante = [];
    
    // Start with all students enrolled in subjects taught by current teacher
    let filteredStudents = appData.estudiante || [];

    if (teacherId) {
        // Get subjects taught by current teacher
        let teacherSubjects = (appData.materia || []).filter(subject => subject.Usuarios_docente_ID_docente === teacherId);
        
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
        const enrolledStudentIds = (appData.alumnos_x_materia || [])
            .filter(enrollment => enrollment.Materia_ID_materia === subjectId)
            .map(enrollment => enrollment.Estudiante_ID_Estudiante);
        
        filteredStudents = filteredStudents.filter(student => 
            enrolledStudentIds.includes(student.ID_Estudiante)
        );
    }
    
    // Filter by tema_estudiante status (topic progress)
    if (selectedTopic) {
        const studentIdsWithTopicStatus = (appData.tema_estudiante || [])
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
                            <tr onclick="showStudentDetail(${parseInt(student.ID_Estudiante)})" class="clickable-row" style="cursor: pointer;">
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
    if (gridBtn) gridBtn.classList.add('active');
    if (listBtn) listBtn.classList.remove('active');
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
    if (gridBtn) gridBtn.classList.remove('active');
    if (listBtn) listBtn.classList.add('active');
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

// Función para actualizar el estado de un tema de intensificación
window.updateIntensificacionThemeStatus = async function(temaEstudianteId, nuevoEstado, studentId) {
    if (!temaEstudianteId || !nuevoEstado) {
        alert('Error: Datos incompletos');
        return;
    }
    
    try {
        // El endpoint espera el ID en la URL o en query string
        const response = await fetch(`../api/tema_estudiante.php?id=${temaEstudianteId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({
                Estado: nuevoEstado
                // La fecha de actualización se maneja automáticamente en el backend
            })
        });
        
        const result = await response.json();
        
        if (response.ok && result.success !== false) {
            // Recargar datos
            if (typeof loadData === 'function') {
                await loadData();
            }
            
            // Recargar el panel de detalles del estudiante
            if (typeof showStudentDetail === 'function') {
                showStudentDetail(studentId);
            }
            
            // Mostrar notificación
            const estadoTexto = nuevoEstado === 'COMPLETADO' ? 'Terminado' : nuevoEstado;
            if (typeof showNotification === 'function') {
                showNotification(`Tema marcado como ${estadoTexto}`, 'success');
            } else {
                alert(`Tema marcado como ${estadoTexto}`);
            }
        } else {
            alert('Error al actualizar el estado del tema: ' + (result.message || 'Error desconocido'));
        }
    } catch (error) {
        console.error('Error actualizando estado del tema:', error);
        alert('Error al conectar con el servidor');
    }
};

function showStudentDetail(studentId) {
    console.log('showStudentDetail called with studentId:', studentId);
    
    // Ensure function is accessible globally
    if (typeof studentId === 'undefined' || studentId === null) {
        console.error('showStudentDetail: studentId is required');
        return;
    }

    const studentIdNum = parseInt(studentId);
    console.log('Parsed studentIdNum:', studentIdNum);
    
    // Ensure appData exists
    if (!appData || !appData.estudiante || !Array.isArray(appData.estudiante)) {
        console.error('showStudentDetail: appData.estudiante is not available', appData);
        return;
    }

    console.log('Total students in appData:', appData.estudiante.length);

    // Find student - handle both string and number comparisons
    const student = appData.estudiante.find(s => {
        const studentIdValue = parseInt(s.ID_Estudiante);
        return studentIdValue === studentIdNum;
    });
    
    if (!student) {
        console.error('showStudentDetail: Student not found with ID:', studentIdNum);
        console.log('Available student IDs:', appData.estudiante.map(s => s.ID_Estudiante));
        return;
    }
    
    console.log('Student found:', student);
    // Verificar si el estudiante es intensificador usando la columna INTENSIFICA
    const isIntensificador = isStudentIntensificador(student);
    
    const studentAttendance = (appData.asistencia || []).filter(a => {
        const attendanceStudentId = parseInt(a.Estudiante_ID_Estudiante);
        return attendanceStudentId === studentIdNum;
    });
    const attendanceRate = studentAttendance.length > 0
        ? Math.round((studentAttendance.filter(a => a.Presente === 'Y').length / studentAttendance.length) * 100)
        : 0;

    // Get student grades
    const studentGrades = (appData.notas || []).filter(g => {
        const gradeStudentId = parseInt(g.Estudiante_ID_Estudiante);
        return gradeStudentId === studentIdNum;
    });
    
    const gradesForAverage = studentGrades.filter(g => parseFloat(g.Calificacion) > 0);
    const averageGrade = gradesForAverage.length > 0 
        ? parseFloat((gradesForAverage.reduce((sum, g) => sum + parseFloat(g.Calificacion), 0) / gradesForAverage.length).toFixed(1))
        : 0;

    // Get enrolled subjects
    const enrolledSubjects = (appData.alumnos_x_materia || [])
        .filter(axm => {
            const enrolledStudentId = parseInt(axm.Estudiante_ID_Estudiante);
            return enrolledStudentId === studentIdNum;
        })
        .map(axm => {
            const materia = (appData.materia || []).find(m => m.ID_materia === axm.Materia_ID_materia);
            return materia ? materia.Nombre : null;
        })
        .filter(Boolean);

    // Check if dark mode is active
    const isDarkMode = document.documentElement.getAttribute('data-theme') === 'dark';
    
    // Populate student basic info
    const studentInfoHtml = `
        <div class="info-item">
            <label class="info-label">Nombre Completo</label>
            <div class="info-value">${student.Nombre} ${student.Apellido}</div>
        </div>
        <div class="info-item">
            <label class="info-label">ID Estudiante</label>
            <div class="info-value">${student.ID_Estudiante}</div>
        </div>
        <div class="info-item">
            <label class="info-label">Estado</label>
            <div class="info-value">
                <span class="status-badge ${isIntensificador ? 'status-intensifica' : 'status-activo'}">
                    ${isIntensificador ? 'INTENSIFICA' : (getStudentDisplayEstado(student) || 'ACTIVO')}
                </span>
            </div>
        </div>
        <div class="info-item">
            <label class="info-label">Promedio</label>
            <div class="info-value grade-${averageGrade >= 8.0 ? 'excellent' : averageGrade >= 6.0 ? 'good' : 'poor'}">
                ${averageGrade.toFixed(1)}
            </div>
        </div>
        <div class="info-item">
            <label class="info-label">Asistencia</label>
            <div class="info-value attendance-${attendanceRate >= 80 ? 'good' : attendanceRate >= 60 ? 'warning' : 'poor'}">
                ${attendanceRate}%
            </div>
        </div>
        <div class="info-item">
            <label class="info-label">Materias Inscritas</label>
            <div class="info-value">
                ${enrolledSubjects.length > 0 ? enrolledSubjects.join(', ') : 'Sin materias asignadas'}
            </div>
        </div>
    `;

    const studentInfoElement = document.getElementById('studentDetailsInfo');
    if (studentInfoElement) {
        studentInfoElement.innerHTML = studentInfoHtml;
    }

    // Update modal title
    const modalTitle = document.getElementById('studentDetailsModalTitle');
    if (modalTitle) {
        modalTitle.textContent = `${student.Nombre} ${student.Apellido}${isIntensificador ? ' (Intensificador)' : ''}`;
    }

    // Populate tema_estudiante records
    populateStudentTemaEstudiante(studentIdNum);

    // Show modal
    console.log('Attempting to show modal...');
    const modal = document.getElementById('studentDetailsModal');
    if (!modal) {
        console.error('Modal element not found: studentDetailsModal');
        return;
    }
    
    if (typeof showModal === 'function') {
        console.log('Using showModal function');
        showModal('studentDetailsModal');
    } else {
        console.log('Using direct modal.classList.add');
        modal.classList.add('active');
        if (typeof setupModalHandlers === 'function') {
            setupModalHandlers('studentDetailsModal');
        }
    }
    
    console.log('Modal should be visible now');
}

function populateStudentTemaEstudiante(studentId) {
    const temaEstudianteList = document.getElementById('studentTemaEstudianteList');
    if (!temaEstudianteList) return;

    // Ensure arrays exist
    if (!appData.tema_estudiante || !Array.isArray(appData.tema_estudiante)) {
        appData.tema_estudiante = [];
    }
    if (!appData.contenido || !Array.isArray(appData.contenido)) {
        appData.contenido = [];
    }
    if (!appData.materia || !Array.isArray(appData.materia)) {
        appData.materia = [];
    }

    // Get all tema_estudiante records for this student
    const temas = appData.tema_estudiante
        .filter(te => parseInt(te.Estudiante_ID_Estudiante) === studentId)
        .map(te => {
            const contenido = appData.contenido.find(c => parseInt(c.ID_contenido) === parseInt(te.Contenido_ID_contenido));
            const materia = contenido ? appData.materia.find(m => parseInt(m.ID_materia) === parseInt(contenido.Materia_ID_materia)) : null;
            return { tema_estudiante: te, contenido, materia };
        })
        .filter(item => item.contenido)
        .sort((a, b) => {
            // Sort by update date (most recent first)
            const dateA = a.tema_estudiante.Fecha_actualizacion ? new Date(a.tema_estudiante.Fecha_actualizacion) : new Date(0);
            const dateB = b.tema_estudiante.Fecha_actualizacion ? new Date(b.tema_estudiante.Fecha_actualizacion) : new Date(0);
            return dateB - dateA;
        });

    if (temas.length === 0) {
        temaEstudianteList.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #999;">
                <i class="fas fa-book-open" style="font-size: 3em; margin-bottom: 15px; opacity: 0.3;"></i>
                <p style="font-size: 1.1em; margin-bottom: 5px;">No hay temas asignados</p>
                <p style="font-size: 0.9em; color: #bbb;">Este estudiante no tiene temas de estudiante registrados.</p>
            </div>
        `;
        return;
    }

    // Build HTML for tema_estudiante records
    const temasHtml = temas.map(item => {
        const { tema_estudiante, contenido, materia } = item;
        
        const estado = tema_estudiante.Estado || 'PENDIENTE';
        const observaciones = tema_estudiante.Observaciones || '';
        
        // Determine color based on status
        let estadoColor = '#ff9800'; // Orange (pending)
        let estadoBg = '#fff3e0';
        let estadoIcon = 'fa-clock';
        
        if (estado === 'COMPLETADO') {
            estadoColor = '#28a745';
            estadoBg = '#e8f5e9';
            estadoIcon = 'fa-check-circle';
        } else if (estado === 'EN_PROGRESO') {
            estadoColor = '#ffc107';
            estadoBg = '#fff9c4';
            estadoIcon = 'fa-spinner';
        } else if (estado === 'CANCELADO') {
            estadoColor = '#dc3545';
            estadoBg = '#ffebee';
            estadoIcon = 'fa-times-circle';
        }

        // Format date
        const fechaActualizacion = tema_estudiante.Fecha_actualizacion 
            ? new Date(tema_estudiante.Fecha_actualizacion).toLocaleDateString('es-ES', { 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric' 
            })
            : 'Sin fecha';

        // Determine status class for dark mode compatibility
        const statusClass = estado.toLowerCase().replace('_', '-');
        
        return `
            <div class="tema-estudiante-card tema-estado-${statusClass}" style="border-left: 4px solid ${estadoColor};">
                <div class="tema-estudiante-header">
                    <div class="tema-estudiante-content">
                        <h5 class="tema-estudiante-title">
                            ${contenido.Tema || 'Tema sin nombre'}
                        </h5>
                        ${materia ? `
                            <div class="tema-estudiante-materia">
                                <i class="fas fa-book"></i>
                                ${materia.Nombre}
                            </div>
                        ` : ''}
                        ${observaciones ? `
                            <div class="tema-estudiante-observaciones">
                                <i class="fas fa-comment"></i>
                                ${observaciones}
                            </div>
                        ` : ''}
                        <div class="tema-estudiante-fecha">
                            <i class="fas fa-calendar-alt"></i>
                            Última actualización: ${fechaActualizacion}
                        </div>
                    </div>
                    <div class="tema-estudiante-status">
                        <span class="status-badge status-${statusClass}" style="color: ${estadoColor};">
                            <i class="fas ${estadoIcon}"></i>
                            ${estado}
                        </span>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    temaEstudianteList.innerHTML = temasHtml;
}

// Make showStudentDetail globally accessible
window.showStudentDetail = showStudentDetail;

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
                            <tr onclick="viewExamNotes(${exam.ID_evaluacion})" class="clickable-row" style="cursor: pointer;">
                                <td><strong>${exam.Titulo}</strong></td>
                                <td>${subject ? subject.Nombre : 'Unknown'}</td>
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
// Guard to prevent recursive calls
let isShowingGradeMarkingView = false;
// Make guard globally accessible for navigation checks
window.isShowingGradeMarkingView = false;

async function showGradeMarkingView() {
    // Prevent recursive calls
    if (isShowingGradeMarkingView) {
        console.log('=== showGradeMarkingView: Already showing, skipping recursive call ===');
        return;
    }
    
    isShowingGradeMarkingView = true;
    window.isShowingGradeMarkingView = true;
    console.log('=== showGradeMarkingView START ===');
    
    // Check if we're already in the grade-marking section to avoid recursion
    const currentSectionValue = typeof currentSection !== 'undefined' ? currentSection : 
                                 (typeof window.currentSection !== 'undefined' ? window.currentSection : null);
    
    // Only call showSection if we're not already in grade-marking section
    if (currentSectionValue !== 'grade-marking') {
        showSection('grade-marking');
    }
    
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
        
        // Populate evaluation dropdown - wait for it to complete
        await populateEvaluationDropdown();
        
        console.log('=== showGradeMarkingView END ===');
    } else {
        console.error('showGradeMarkingView: gradeMarkingView element not found');
    }
    
    // Reset guard after completion (always reset, even on error)
    isShowingGradeMarkingView = false;
    window.isShowingGradeMarkingView = false;
}

/**
 * Helper function to normalize ID for comparison (handles string/number)
 */
function normalizeId(id) {
    if (id === null || id === undefined) return null;
    const num = parseInt(id);
    return isNaN(num) ? null : num;
}

/**
 * Find evaluation by ID - robust comparison with extensive debugging
 */
function findEvaluationById(evaluationId) {
    console.log('=== findEvaluationById START ===');
    console.log('Input evaluationId:', evaluationId, 'Type:', typeof evaluationId);
    
    // Check appData availability
    if (!appData) {
        console.error('findEvaluationById: appData is not available');
        console.log('Available globals:', {
            hasWindowAppData: !!window.appData,
            hasWindowData: !!window.data
        });
        // Try to get from window
        if (window.appData) {
            appData = window.appData;
        } else if (window.data) {
            appData = window.data;
        } else {
            return null;
        }
    }
    
    if (!appData.evaluacion) {
        console.error('findEvaluationById: appData.evaluacion is not available');
        console.log('appData keys:', Object.keys(appData));
        return null;
    }
    
    if (!Array.isArray(appData.evaluacion)) {
        console.error('findEvaluationById: appData.evaluacion is not an array', typeof appData.evaluacion);
        return null;
    }
    
    console.log('appData.evaluacion length:', appData.evaluacion.length);
    console.log('Sample evaluations:', appData.evaluacion.slice(0, 3).map(e => ({
        ID_evaluacion: e.ID_evaluacion,
        ID_type: typeof e.ID_evaluacion,
        Titulo: e.Titulo
    })));
    
    const targetId = normalizeId(evaluationId);
    console.log('Normalized targetId:', targetId);
    
    if (targetId === null) {
        console.error('findEvaluationById: Invalid evaluation ID after normalization', evaluationId);
        return null;
    }
    
    // Find evaluation - try multiple approaches
    let evaluation = null;
    
    // Method 1: Normalized comparison
    evaluation = appData.evaluacion.find(e => {
        if (!e || !e.ID_evaluacion) return false;
        const evalId = normalizeId(e.ID_evaluacion);
        return evalId !== null && evalId === targetId;
    });
    
    // Method 2: Direct comparison (if method 1 failed)
    if (!evaluation) {
        evaluation = appData.evaluacion.find(e => {
            if (!e || !e.ID_evaluacion) return false;
            return e.ID_evaluacion == targetId || 
                   String(e.ID_evaluacion) === String(targetId) ||
                   parseInt(e.ID_evaluacion) === targetId;
        });
    }
    
    // Method 3: Loose comparison
    if (!evaluation) {
        evaluation = appData.evaluacion.find(e => {
            if (!e || !e.ID_evaluacion) return false;
            return e.ID_evaluacion == evaluationId || 
                   String(e.ID_evaluacion) === String(evaluationId);
        });
    }
    
    if (evaluation) {
        console.log('findEvaluationById: FOUND evaluation', {
            ID: evaluation.ID_evaluacion,
            Titulo: evaluation.Titulo
        });
    } else {
        console.error('findEvaluationById: NOT FOUND', {
            searchedId: evaluationId,
            normalizedSearchedId: targetId,
            availableIds: appData.evaluacion.map(e => ({
                raw: e.ID_evaluacion,
                normalized: normalizeId(e.ID_evaluacion),
                type: typeof e.ID_evaluacion
            }))
        });
    }
    
    console.log('=== findEvaluationById END ===');
    return evaluation || null;
}

async function populateEvaluationDropdown() {
    console.log('=== populateEvaluationDropdown START ===');
    
    const evaluationSelect = document.getElementById('gradeEvaluation');
    if (!evaluationSelect) {
        console.error('populateEvaluationDropdown: evaluationSelect element not found');
        return;
    }
    
    // Clear existing options
    evaluationSelect.innerHTML = '<option value="" data-translate="select_evaluation">- Seleccionar Evaluación -</option>';
    
    // Ensure appData is loaded
    if (!appData || !appData.evaluacion) {
        console.log('populateEvaluationDropdown: appData not loaded, attempting to load...');
        if (typeof loadData === 'function') {
            await loadData();
        }
        
        // Try window globals
        if (!appData && window.appData) {
            appData = window.appData;
        } else if (!appData && window.data) {
            appData = window.data;
        }
        
        if (!appData || !appData.evaluacion) {
            console.error('populateEvaluationDropdown: appData still not available after reload attempt');
            evaluationSelect.innerHTML = '<option value="">Error: No se pudieron cargar las evaluaciones</option>';
            return;
        }
    }
    
    if (!Array.isArray(appData.evaluacion)) {
        console.error('populateEvaluationDropdown: appData.evaluacion is not an array', typeof appData.evaluacion);
        evaluationSelect.innerHTML = '<option value="">Error: Datos de evaluaciones inválidos</option>';
        return;
    }
    
    if (appData.evaluacion.length === 0) {
        console.warn('populateEvaluationDropdown: No evaluations available');
        evaluationSelect.innerHTML = '<option value="">No hay evaluaciones disponibles</option>';
        return;
    }
    
    console.log('populateEvaluationDropdown: Found', appData.evaluacion.length, 'evaluations');
    
    // Populate dropdown with evaluations
    let populatedCount = 0;
    appData.evaluacion.forEach(evaluation => {
        if (!evaluation || !evaluation.ID_evaluacion) {
            console.warn('populateEvaluationDropdown: Skipping invalid evaluation', evaluation);
            return;
        }
        
        const evaluationId = normalizeId(evaluation.ID_evaluacion);
        if (evaluationId === null) {
            console.warn('populateEvaluationDropdown: Skipping evaluation with invalid ID', evaluation);
            return;
        }
        
        // Find subject
        const subject = appData.materia && Array.isArray(appData.materia) 
            ? appData.materia.find(s => normalizeId(s.ID_materia) === normalizeId(evaluation.Materia_ID_materia))
            : null;
        
        const option = document.createElement('option');
        option.value = String(evaluationId); // Store as string for HTML
        option.textContent = `${evaluation.Titulo || 'Sin título'} - ${subject ? subject.Nombre : 'Materia desconocida'}`;
        option.dataset.evalId = String(evaluationId); // Also store in dataset for reference
        evaluationSelect.appendChild(option);
        populatedCount++;
    });
    
    console.log('populateEvaluationDropdown: Populated', populatedCount, 'evaluations');
    console.log('=== populateEvaluationDropdown END ===');
}

async function loadStudentsForGradeMarking() {
    console.log('=== loadStudentsForGradeMarking START ===');
    
    const evaluationSelect = document.getElementById('gradeEvaluation');
    const tableBody = document.getElementById('gradeTableBody');
    
    if (!evaluationSelect) {
        console.error('loadStudentsForGradeMarking: evaluationSelect not found');
        return;
    }
    
    if (!tableBody) {
        console.error('loadStudentsForGradeMarking: tableBody not found');
        return;
    }
    
    // Get selected value
    const selectedValue = evaluationSelect.value;
    console.log('Selected value from dropdown:', selectedValue);
    
    if (!selectedValue || selectedValue === '') {
        tableBody.innerHTML = '<tr><td colspan="5" class="text-center">Seleccione una evaluación para ver los estudiantes</td></tr>';
        return;
    }
    
    // Ensure appData is loaded
    if (!appData || !appData.evaluacion) {
        console.log('appData not loaded, attempting to load...');
        if (typeof loadData === 'function') {
            await loadData();
        }
        
        // Try window globals
        if (!appData && window.appData) {
            appData = window.appData;
        } else if (!appData && window.data) {
            appData = window.data;
        }
        
        if (!appData || !appData.evaluacion) {
            tableBody.innerHTML = '<tr><td colspan="5" class="text-center">Error: No se pudieron cargar los datos. Por favor, recargue la página.</td></tr>';
            console.error('loadStudentsForGradeMarking: appData still not available after reload attempt');
            return;
        }
    }
    
    // Find evaluation using our robust function
    const evaluation = findEvaluationById(selectedValue);
    
    if (!evaluation) {
        tableBody.innerHTML = '<tr><td colspan="5" class="text-center">Evaluación no encontrada. Verifique la consola para más detalles.</td></tr>';
        console.error('loadStudentsForGradeMarking: Evaluation not found', {
            selectedValue: selectedValue,
            normalizedId: normalizeId(selectedValue),
            availableEvaluations: appData && appData.evaluacion ? appData.evaluacion.map(e => ({
                ID: e.ID_evaluacion,
                ID_type: typeof e.ID_evaluacion,
                normalized: normalizeId(e.ID_evaluacion),
                Titulo: e.Titulo
            })) : 'appData.evaluacion not available'
        });
        return;
    }
    
    console.log('loadStudentsForGradeMarking: Found evaluation', {
        ID: evaluation.ID_evaluacion,
        Titulo: evaluation.Titulo
    });
    
    // Get students enrolled in this subject - use normalized IDs
    const normalizedMateriaId = normalizeId(evaluation.Materia_ID_materia);
    
    if (!appData.alumnos_x_materia || !Array.isArray(appData.alumnos_x_materia)) {
        tableBody.innerHTML = '<tr><td colspan="5" class="text-center">Error: No hay datos de inscripciones disponibles</td></tr>';
        return;
    }
    
    const enrolledStudentIds = appData.alumnos_x_materia
        .filter(enrollment => {
            const enrollmentMateriaId = normalizeId(enrollment.Materia_ID_materia);
            return enrollmentMateriaId !== null && enrollmentMateriaId === normalizedMateriaId;
        })
        .map(enrollment => normalizeId(enrollment.Estudiante_ID_Estudiante))
        .filter(id => id !== null);
    
    if (!appData.estudiante || !Array.isArray(appData.estudiante)) {
        tableBody.innerHTML = '<tr><td colspan="5" class="text-center">Error: No hay datos de estudiantes disponibles</td></tr>';
        return;
    }
    
    const enrolledStudents = appData.estudiante.filter(student => {
        const studentId = normalizeId(student.ID_Estudiante);
        return studentId !== null && enrolledStudentIds.includes(studentId);
    });
    
    if (enrolledStudents.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="5" class="text-center">No hay estudiantes inscritos en esta materia</td></tr>';
        return;
    }
    
    // Get normalized evaluation ID for comparison
    const normalizedEvalId = normalizeId(evaluation.ID_evaluacion);
    
    tableBody.innerHTML = enrolledStudents.map(student => {
        // Get existing grade for this student and evaluation - use normalized IDs
        const normalizedStudentId = normalizeId(student.ID_Estudiante);
        const existingGrade = appData.notas && Array.isArray(appData.notas) 
            ? appData.notas.find(grade => {
                const gradeStudentId = normalizeId(grade.Estudiante_ID_Estudiante);
                const gradeEvalId = normalizeId(grade.Evaluacion_ID_evaluacion);
                return gradeStudentId === normalizedStudentId && gradeEvalId === normalizedEvalId;
            })
            : null;
        
        // Check if student was absent (grade 0 with AUSENTE observation)
        const isAbsent = existingGrade && 
                        (existingGrade.Calificacion == 0 || existingGrade.Calificacion === 'AUSENTE') &&
                        (existingGrade.Observacion === 'AUSENTE' || !existingGrade.Observacion || existingGrade.Observacion.trim() === '');
        
        const currentGrade = existingGrade && !isAbsent ? existingGrade.Calificacion : '';
        const currentObservation = existingGrade ? (existingGrade.Observacion || '') : '';
        
        // Grade class based on 1-10 scale
        let gradeClass = '';
        if (currentGrade) {
            const gradeNum = parseFloat(currentGrade);
            if (gradeNum >= 8) gradeClass = 'excellent';
            else if (gradeNum >= 6) gradeClass = 'good';
            else if (gradeNum >= 1) gradeClass = 'poor';
        }
        
        const status = existingGrade ? 'graded' : 'pending';
        
        return `
            <tr data-student-id="${student.ID_Estudiante}">
                <td class="student-id">${student.ID_Estudiante}</td>
                <td class="student-name">${student.Apellido}, ${student.Nombre}</td>
                <td class="grade-cell">
                    <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
                        <input type="number" 
                               id="grade_${student.ID_Estudiante}"
                               class="grade-input ${gradeClass}" 
                               min="1" 
                               max="10" 
                               step="0.01"
                               value="${currentGrade}"
                               data-student-id="${student.ID_Estudiante}"
                               placeholder="1-10"
                               style="width: 80px;"
                               ${isAbsent ? 'disabled' : ''}>
                        <label style="display: flex; align-items: center; gap: 5px; font-size: 0.9em; white-space: nowrap;">
                            <input type="checkbox" 
                                   id="ausente_${student.ID_Estudiante}"
                                   class="ausente-checkbox"
                                   ${isAbsent ? 'checked' : ''}
                                   onchange="toggleAusenteGrade(${student.ID_Estudiante}, this.checked)">
                            Ausente
                        </label>
                    </div>
                </td>
                <td class="observation-cell">
                    <input type="text" 
                           id="observacion_${student.ID_Estudiante}"
                           class="observation-input"
                           value="${currentObservation}"
                           placeholder="Observaciones..."
                           style="width: 100%; padding: 5px; font-size: 0.9em;">
                </td>
                <td class="status-cell">
                    <span class="grade-status ${status}">${status === 'graded' ? 'Calificado' : 'Pendiente'}</span>
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
            const grade = parseFloat(this.value);
            this.classList.remove('excellent', 'good', 'poor');
            
            // Grade scale is 1-10, not 0-100
            if (grade >= 8) {
                this.classList.add('excellent');
            } else if (grade >= 6) {
                this.classList.add('good');
            } else if (grade >= 1) {
                this.classList.add('poor');
            }
        });
    });
}

// Make function globally available for onclick handlers
window.toggleAusenteGrade = function(studentId, isAusente) {
    const gradeInput = document.getElementById(`grade_${studentId}`);
    if (gradeInput) {
        gradeInput.disabled = isAusente;
        if (isAusente) {
            gradeInput.value = '';
            gradeInput.classList.remove('excellent', 'good', 'poor');
        }
    }
};

async function saveGradesBulk() {
    const evaluationSelect = document.getElementById('gradeEvaluation');
    const dateInput = document.getElementById('gradeDate');
    const notesInput = document.getElementById('gradeNotes');
    
    if (!evaluationSelect) {
        alert('Error: No se encontró el selector de evaluación.');
        return;
    }
    
    const selectedValue = evaluationSelect.value;
    
    if (!selectedValue || selectedValue === '') {
        alert('Por favor seleccione una evaluación.');
        return;
    }
    
    if (!dateInput || !dateInput.value) {
        alert('Por favor complete la fecha.');
        return;
    }
    
    // Find evaluation using our robust function
    const evaluation = findEvaluationById(selectedValue);
    
    if (!evaluation) {
        alert('Error: La evaluación seleccionada no se encontró. Por favor, recargue la página e intente nuevamente.');
        console.error('saveGradesBulk: Evaluation not found', {
            selectedValue: selectedValue,
            normalizedId: normalizeId(selectedValue),
            availableEvaluations: appData && appData.evaluacion ? appData.evaluacion.map(e => ({
                ID: e.ID_evaluacion,
                ID_type: typeof e.ID_evaluacion,
                normalized: normalizeId(e.ID_evaluacion),
                Titulo: e.Titulo
            })) : 'appData.evaluacion not available'
        });
        return;
    }
    
    // Get normalized evaluation ID for saving
    const selectedEvaluationId = normalizeId(selectedValue);
    const gradeDate = dateInput.value;
    const notes = notesInput ? notesInput.value : '';
    
    console.log('saveGradesBulk: Using evaluation', {
        ID: selectedEvaluationId,
        Titulo: evaluation.Titulo,
        Fecha: gradeDate
    });
    
    const tableRows = document.querySelectorAll('#gradeTableBody tr[data-student-id]');
    const notas = [];
    const errors = [];
    
    if (tableRows.length === 0) {
        alert('No hay estudiantes para calificar. Asegúrese de haber seleccionado una evaluación.');
        return;
    }
    
    tableRows.forEach(row => {
        const studentId = parseInt(row.dataset.studentId);
        if (isNaN(studentId) || studentId <= 0) {
            console.warn('Invalid student ID in row:', row);
            return;
        }
        
        const gradeInput = document.getElementById(`grade_${studentId}`);
        const ausenteCheckbox = document.getElementById(`ausente_${studentId}`);
        const observacionInput = document.getElementById(`observacion_${studentId}`);
        
        const esAusente = ausenteCheckbox ? ausenteCheckbox.checked : false;
        const gradeValue = gradeInput ? gradeInput.value.trim() : '';
        const observacion = observacionInput ? observacionInput.value.trim() : '';
        
        // Combine general notes with individual observation
        const finalObservacion = notes ? (notes + (observacion ? ' | ' + observacion : '')) : observacion;
        
        // Skip if no grade entered and not marked as absent
        if (!gradeValue && !esAusente) {
            return; // Skip rows without grade input and not absent
        }
        
        // Validate and prepare nota data
        if (esAusente) {
            // Student is absent
            const notaData = {
                Evaluacion_ID_evaluacion: selectedEvaluationId,
                Estudiante_ID_Estudiante: studentId,
                Calificacion: 'AUSENTE', // API will convert this to 0
                Fecha_calificacion: gradeDate,
                Observacion: finalObservacion || 'AUSENTE',
                Estado: 'DEFINITIVA'
            };
            notas.push(notaData);
        } else if (gradeValue) {
            // Student has a grade
            const grade = parseFloat(gradeValue);
            
            // Validate grade range (1-10)
            if (isNaN(grade) || grade < 1 || grade > 10) {
                errors.push(`Estudiante ${studentId}: Calificación inválida (debe ser entre 1 y 10)`);
                return;
            }
            
            const notaData = {
                Evaluacion_ID_evaluacion: selectedEvaluationId,
                Estudiante_ID_Estudiante: studentId,
                Calificacion: grade,
                Fecha_calificacion: gradeDate,
                Observacion: finalObservacion || null,
                Estado: 'DEFINITIVA'
            };
            
            notas.push(notaData);
        }
    });
    
    if (notas.length === 0 && errors.length === 0) {
        alert('No se guardaron calificaciones. Verifique que haya ingresado al menos una calificación válida (entre 1 y 10).');
        return;
    }
    
    if (errors.length > 0) {
        alert('Errores encontrados:\n\n' + errors.join('\n'));
        return;
    }
    
    // Save grades to API (like saveGrades in exams.js)
    const isInPages = window.location.pathname.includes('/pages/');
    const baseUrl = isInPages ? '../api' : 'api';
    
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
            // Reload data from server
            if (typeof loadData === 'function') {
                await loadData();
            }
            
            // Refresh the table
            loadStudentsForGradeMarking();
            
            // Reload student data to show updated grades
            if (typeof loadUnifiedStudentData === 'function') {
                loadUnifiedStudentData();
            }
            
            // Show success message
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

// Make function globally available
window.hideGradeMarkingView = hideGradeMarkingView;

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

// Export functionality for students and exams
function getCurrentTab() {
    const studentsTab = document.getElementById('studentsTab');
    const examsTab = document.getElementById('examsTab');
    
    if (studentsTab && studentsTab.classList.contains('active')) {
        return 'students';
    } else if (examsTab && examsTab.classList.contains('active')) {
        return 'exams';
    }
    
    // Fallback: check which tab content is visible
    const studentsTabContent = document.getElementById('studentsTabContent');
    const examsTabContent = document.getElementById('examsTabContent');
    
    if (studentsTabContent && studentsTabContent.classList.contains('active')) {
        return 'students';
    } else if (examsTabContent && examsTabContent.classList.contains('active')) {
        return 'exams';
    }
    
    return 'students'; // Default to students
}

function openExportDialog() {
    const currentTab = getCurrentTab();
    const exportDialogModal = document.getElementById('exportDialogModal');
    const exportDialogText = document.getElementById('exportDialogText');
    
    if (!exportDialogModal) return;
    
    // Clear context attribute (for students/exams)
    exportDialogModal.removeAttribute('data-export-context');
    
    // Update dialog text based on current tab
    if (currentTab === 'exams') {
        exportDialogText.innerHTML = '<span data-translate="select_export_format_exams">Seleccione el formato de exportación para los exámenes:</span>';
    } else {
        exportDialogText.innerHTML = '<span data-translate="select_export_format">Seleccione el formato de exportación:</span>';
    }
    
    // Show modal
    if (typeof showModal === 'function') {
        showModal('exportDialogModal');
    } else {
        exportDialogModal.classList.add('active');
    }
}

function exportStudentsAsCSV() {
    const students = getFilteredUnifiedStudents();
    
    if (!students || students.length === 0) {
        alert('No hay estudiantes para exportar.');
        return;
    }
    
    // Get additional data for export
    const appData = window.appData || {};
    const materia = appData.materia || [];
    const alumnos_x_materia = appData.alumnos_x_materia || [];
    const notas = appData.notas || [];
    const asistencia = appData.asistencia || [];
    
    // Prepare CSV data
    const headers = ['ID', 'Nombre', 'Apellido', 'Materias', 'Promedio', 'Asistencia (%)'];
    const rows = students.map(student => {
        // Get student's subjects
        const studentSubjects = alumnos_x_materia
            .filter(axm => axm.Estudiante_ID_Estudiante === student.ID_Estudiante)
            .map(axm => {
                const subject = materia.find(m => m.ID_materia === axm.Materia_ID_materia);
                return subject ? subject.Nombre : '';
            })
            .filter(s => s)
            .join('; ');
        
        // Calculate average grade
        const studentGrades = notas.filter(n => n.Estudiante_ID_Estudiante === student.ID_Estudiante);
        const average = studentGrades.length > 0
            ? (studentGrades.reduce((sum, n) => sum + parseFloat(n.Calificacion || 0), 0) / studentGrades.length).toFixed(2)
            : '0.00';
        
        // Calculate attendance percentage
        const studentAttendance = asistencia.filter(a => a.Estudiante_ID_Estudiante === student.ID_Estudiante);
        const presentCount = studentAttendance.filter(a => a.Presente === 'P' || a.Presente === 'Y').length;
        const attendanceRate = studentAttendance.length > 0
            ? ((presentCount / studentAttendance.length) * 100).toFixed(2)
            : '0.00';
        
        return [
            student.ID_Estudiante || '',
            student.Nombre || '',
            student.Apellido || '',
            studentSubjects || 'Sin materias',
            average,
            attendanceRate
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
    link.setAttribute('download', `estudiantes_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    // Close modal and show notification
    if (typeof showExportNotification === 'function') {
        showExportNotification('Lista de estudiantes exportada como CSV exitosamente!', 'success');
    } else {
        alert('Lista de estudiantes exportada como CSV exitosamente!');
    }
    
    const exportDialogModal = document.getElementById('exportDialogModal');
    if (exportDialogModal) {
        exportDialogModal.classList.remove('active');
    }
}

function exportStudentsAsDOC() {
    const students = getFilteredUnifiedStudents();
    
    if (!students || students.length === 0) {
        alert('No hay estudiantes para exportar.');
        return;
    }
    
    // Get additional data for export
    const appData = window.appData || {};
    const materia = appData.materia || [];
    const alumnos_x_materia = appData.alumnos_x_materia || [];
    const notas = appData.notas || [];
    const asistencia = appData.asistencia || [];
    
    // Create HTML content for Word document
    let htmlContent = `
        <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
        <head>
            <meta charset='utf-8'>
            <title>Lista de Estudiantes</title>
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
                <h1>Lista de Estudiantes</h1>
                <p class="date">Fecha de exportación: ${new Date().toLocaleDateString()}</p>
            </div>
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Nombre</th>
                        <th>Apellido</th>
                        <th>Materias</th>
                        <th>Promedio</th>
                        <th>Asistencia (%)</th>
                    </tr>
                </thead>
                <tbody>
    `;
    
    students.forEach(student => {
        // Get student's subjects
        const studentSubjects = alumnos_x_materia
            .filter(axm => axm.Estudiante_ID_Estudiante === student.ID_Estudiante)
            .map(axm => {
                const subject = materia.find(m => m.ID_materia === axm.Materia_ID_materia);
                return subject ? subject.Nombre : '';
            })
            .filter(s => s)
            .join(', ');
        
        // Calculate average grade
        const studentGrades = notas.filter(n => n.Estudiante_ID_Estudiante === student.ID_Estudiante);
        const average = studentGrades.length > 0
            ? (studentGrades.reduce((sum, n) => sum + parseFloat(n.Calificacion || 0), 0) / studentGrades.length).toFixed(2)
            : '0.00';
        
        // Calculate attendance percentage
        const studentAttendance = asistencia.filter(a => a.Estudiante_ID_Estudiante === student.ID_Estudiante);
        const presentCount = studentAttendance.filter(a => a.Presente === 'P' || a.Presente === 'Y').length;
        const attendanceRate = studentAttendance.length > 0
            ? ((presentCount / studentAttendance.length) * 100).toFixed(2)
            : '0.00';
        
        htmlContent += `
            <tr>
                <td>${student.ID_Estudiante || ''}</td>
                <td>${student.Nombre || ''}</td>
                <td>${student.Apellido || ''}</td>
                <td>${studentSubjects || 'Sin materias'}</td>
                <td>${average}</td>
                <td>${attendanceRate}%</td>
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
    link.setAttribute('download', `estudiantes_${new Date().toISOString().split('T')[0]}.doc`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    // Close modal and show notification
    if (typeof showExportNotification === 'function') {
        showExportNotification('Lista de estudiantes exportada como DOC exitosamente!', 'success');
    } else {
        alert('Lista de estudiantes exportada como DOC exitosamente!');
    }
    
    const exportDialogModal = document.getElementById('exportDialogModal');
    if (exportDialogModal) {
        exportDialogModal.classList.remove('active');
    }
}

function exportExamsAsCSV() {
    const exams = getFilteredExams();
    
    if (!exams || exams.length === 0) {
        alert('No hay exámenes para exportar.');
        return;
    }
    
    // Get additional data
    const appData = window.appData || {};
    const materia = appData.materia || [];
    
    // Prepare CSV data
    const headers = ['ID', 'Título', 'Materia', 'Fecha', 'Tipo', 'Descripción'];
    const rows = exams.map(exam => {
        const subject = materia.find(m => m.ID_materia === exam.Materia_ID_materia);
        
        return [
            exam.ID_evaluacion || '',
            exam.Titulo || '',
            subject ? subject.Nombre : 'Desconocida',
            exam.Fecha || '',
            exam.Tipo || '',
            (exam.Descripcion || '').replace(/\n/g, ' ')
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
    link.setAttribute('download', `examenes_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    // Close modal and show notification
    if (typeof showExportNotification === 'function') {
        showExportNotification('Lista de exámenes exportada como CSV exitosamente!', 'success');
    } else {
        alert('Lista de exámenes exportada como CSV exitosamente!');
    }
    
    const exportDialogModal = document.getElementById('exportDialogModal');
    if (exportDialogModal) {
        exportDialogModal.classList.remove('active');
    }
}

function exportExamsAsDOC() {
    const exams = getFilteredExams();
    
    if (!exams || exams.length === 0) {
        alert('No hay exámenes para exportar.');
        return;
    }
    
    // Get additional data
    const appData = window.appData || {};
    const materia = appData.materia || [];
    
    // Create HTML content for Word document
    let htmlContent = `
        <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
        <head>
            <meta charset='utf-8'>
            <title>Lista de Exámenes</title>
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
                <h1>Lista de Exámenes</h1>
                <p class="date">Fecha de exportación: ${new Date().toLocaleDateString()}</p>
            </div>
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Título</th>
                        <th>Materia</th>
                        <th>Fecha</th>
                        <th>Tipo</th>
                        <th>Descripción</th>
                    </tr>
                </thead>
                <tbody>
    `;
    
    exams.forEach(exam => {
        const subject = materia.find(m => m.ID_materia === exam.Materia_ID_materia);
        
        htmlContent += `
            <tr>
                <td>${exam.ID_evaluacion || ''}</td>
                <td>${exam.Titulo || ''}</td>
                <td>${subject ? subject.Nombre : 'Desconocida'}</td>
                <td>${exam.Fecha || ''}</td>
                <td>${exam.Tipo || ''}</td>
                <td>${(exam.Descripcion || '').replace(/\n/g, '<br>')}</td>
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
    link.setAttribute('download', `examenes_${new Date().toISOString().split('T')[0]}.doc`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    // Close modal and show notification
    if (typeof showExportNotification === 'function') {
        showExportNotification('Lista de exámenes exportada como DOC exitosamente!', 'success');
    } else {
        alert('Lista de exámenes exportada como DOC exitosamente!');
    }
    
    const exportDialogModal = document.getElementById('exportDialogModal');
    if (exportDialogModal) {
        exportDialogModal.classList.remove('active');
    }
}

// Initialize export functionality
function initializeExportFunctionality() {
    const exportListBtn = document.getElementById('exportListBtn');
    const exportCSVBtn = document.getElementById('exportCSVBtn');
    const exportDOCBtn = document.getElementById('exportDOCBtn');
    
    // Export button click handler
    if (exportListBtn) {
        exportListBtn.addEventListener('click', openExportDialog);
    }
    
    // CSV export button handler
    if (exportCSVBtn) {
        exportCSVBtn.addEventListener('click', () => {
            const exportDialogModal = document.getElementById('exportDialogModal');
            const context = exportDialogModal ? exportDialogModal.getAttribute('data-export-context') : null;
            
            if (context === 'subjects') {
                if (typeof exportSubjectsAsCSV === 'function') {
                    exportSubjectsAsCSV();
                }
            } else {
                const currentTab = getCurrentTab();
                if (currentTab === 'exams') {
                    exportExamsAsCSV();
                } else {
                    exportStudentsAsCSV();
                }
            }
        });
    }
    
    // DOC export button handler
    if (exportDOCBtn) {
        exportDOCBtn.addEventListener('click', () => {
            const exportDialogModal = document.getElementById('exportDialogModal');
            const context = exportDialogModal ? exportDialogModal.getAttribute('data-export-context') : null;
            
            if (context === 'subjects') {
                if (typeof exportSubjectsAsDOC === 'function') {
                    exportSubjectsAsDOC();
                }
            } else {
                const currentTab = getCurrentTab();
                if (currentTab === 'exams') {
                    exportExamsAsDOC();
                } else {
                    exportStudentsAsDOC();
                }
            }
        });
    }
}