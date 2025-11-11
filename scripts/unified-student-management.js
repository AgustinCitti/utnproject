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

    const loadCourseDivisionBtn = document.getElementById('loadCourseDivisionBtn');
    if (loadCourseDivisionBtn) {
        loadCourseDivisionBtn.addEventListener('click', () => {
            try {
                if (typeof showModal === 'function') {
                    showModal('loadCourseDivisionModal');
                } else {
                    const modal = document.getElementById('loadCourseDivisionModal');
                    if (modal) {
                        modal.classList.add('active');
                    }
                }
                // Resetear contador de filas manuales
                manualStudentRowCounter = 0;
                // Limpiar tabla manual si existe
                const tbody = document.getElementById('bulkManualStudentsTableBody');
                if (tbody) {
                    tbody.innerHTML = '';
                }
                // Asegurar que esté en modo CSV upload por defecto
                const textareaMode = document.getElementById('bulkTextareaMode');
                const tableMode = document.getElementById('bulkTableMode');
                const toggleBtn = document.getElementById('toggleInputModeBtn');
                if (textareaMode && tableMode && toggleBtn) {
                    textareaMode.style.display = 'block';
                    tableMode.style.display = 'none';
                    toggleBtn.innerHTML = '<i class="fas fa-table"></i> Modo Tabla Manual';
                
                    // Inicializar handlers de drag-and-drop y file upload
                    setupBulkCsvUploadHandlers();
                }
                // Poblar el dropdown de cursos (async)
                populateBulkCourseDivisionDropdown().catch(err => console.error('Error al poblar dropdown:', err));
                // Limpiar el formulario
                const form = document.getElementById('loadCourseDivisionForm');
                if (form) form.reset();
                // Limpiar archivo CSV si existe
                const fileInput = document.getElementById('bulkStudentsFileInput');
                if (fileInput) {
                    fileInput.value = '';
                    fileInput._parsedData = null;
                }
                const fileInfo = document.getElementById('bulkCsvFileInfo');
                const previewDiv = document.getElementById('bulkCsvPreview');
                if (fileInfo) fileInfo.style.display = 'none';
                if (previewDiv) previewDiv.style.display = 'none';
            } catch (e) {
                alert('Error al abrir el formulario de carga masiva');
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
    setupModalHandlers('loadCourseDivisionModal');
    
    // Grade marking functionality
    const gradeEvaluationSelect = document.getElementById('gradeEvaluation');
    const saveGradesBtn = document.getElementById('saveGradesBtn');
    const cancelGradesBtn = document.getElementById('cancelGradesBtn');
    const backToStudentsBtn = document.getElementById('backToStudentsBtn');
    
    if (gradeEvaluationSelect) {
        gradeEvaluationSelect.addEventListener('change', async () => {
            await loadStudentsForGradeMarking();
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
            // Hide grade marking view
            if (typeof hideGradeMarkingView === 'function') {
                hideGradeMarkingView();
            }
            // Hide exam notes tab if visible
            const examNotesTabContent = document.getElementById('examNotesTabContent');
            if (examNotesTabContent) {
                examNotesTabContent.style.display = 'none';
            }
            // Navigate to student-management section
            showSection('student-management');
            // Directly switch to exams tab (same as handleStudentManagementSubsection('exams'))
            setTimeout(() => {
                // Hide students tab content explicitly
                const studentsTabContent = document.getElementById('studentsTabContent');
                if (studentsTabContent) {
                    studentsTabContent.classList.remove('active');
                    studentsTabContent.style.display = 'none';
                }
                // Hide all tab content
                document.querySelectorAll('.tab-content').forEach(content => {
                    content.classList.remove('active');
                });
                // Remove active class from all tab buttons
                document.querySelectorAll('.tab-btn').forEach(btn => {
                    btn.classList.remove('active');
                });
                // Deactivate students tab button
                const studentsTab = document.getElementById('studentsTab');
                if (studentsTab) {
                    studentsTab.classList.remove('active');
                }
                // Show exams tab content
                const examsContent = document.getElementById('examsTabContent');
                if (examsContent) {
                    examsContent.classList.add('active');
                    examsContent.style.display = 'block';
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
    
    // Grid view - Student cards with integrated data
    if (!filteredStudents || filteredStudents.length === 0) {
        unifiedStudentCards.innerHTML = '';
    } else {
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
    }

    // List view - Detailed table (always render headers, even when empty)
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
                    ${(!filteredStudents || filteredStudents.length === 0) ? '' : filteredStudents.map(student => {
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
                            ? Math.round((studentAttendance.filter(a => a.Presente === 'P' || a.Presente === 'Y').length / studentAttendance.length) * 100)
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
    // Ensure function is accessible globally
    if (typeof studentId === 'undefined' || studentId === null) {
        return;
    }

    const studentIdNum = parseInt(studentId);
    
    // Ensure appData exists
    if (!appData || !appData.estudiante || !Array.isArray(appData.estudiante)) {
        return;
    }

    // Find student - handle both string and number comparisons
    const student = appData.estudiante.find(s => {
        const studentIdValue = parseInt(s.ID_Estudiante);
        return studentIdValue === studentIdNum;
    });
    
    if (!student) {
        return;
    }
    // Verificar si el estudiante es intensificador usando la columna INTENSIFICA
    const isIntensificador = isStudentIntensificador(student);
    
    const studentAttendance = (appData.asistencia || []).filter(a => {
        const attendanceStudentId = parseInt(a.Estudiante_ID_Estudiante);
        return attendanceStudentId === studentIdNum;
    });
    const attendanceRate = studentAttendance.length > 0
        ? Math.round((studentAttendance.filter(a => a.Presente === 'P' || a.Presente === 'Y').length / studentAttendance.length) * 100)
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
    const modal = document.getElementById('studentDetailsModal');
    if (!modal) {
        return;
    }
    
    if (typeof showModal === 'function') {
        showModal('studentDetailsModal');
    } else {
        modal.classList.add('active');
        if (typeof setupModalHandlers === 'function') {
            setupModalHandlers('studentDetailsModal');
        }
    }
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
                        <th data-translate="title">Título</th>
                        <th data-translate="subject">Materia</th>
                        <th data-translate="type">Tipo</th>
                        <th data-translate="date">Fecha</th>
                        <th data-translate="status">Estado</th>
                        <th data-translate="actions">Acciones</th>
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
    
    // Get teacher's subjects
    let teacherSubjects = [];
    if (appData && appData.materia && Array.isArray(appData.materia)) {
        if (currentUserId) {
            teacherSubjects = appData.materia.filter(subject => 
                subject && 
                subject.Usuarios_docente_ID_docente && 
                parseInt(subject.Usuarios_docente_ID_docente) === parseInt(currentUserId) &&
                (!subject.Estado || subject.Estado === 'ACTIVA')
            );
        } else {
            teacherSubjects = appData.materia.filter(m => 
                !m.Estado || m.Estado === 'ACTIVA'
            );
        }
    }
    
    const exam = examId ? (appData.evaluacion || []).find(e => {
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
    
    // Add modal to body
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
    
    // Setup close handlers
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
    
    // Setup modal handlers if function exists
    if (typeof setupModalHandlers === 'function') {
        setupModalHandlers('examModal');
    }
    
    // Show modal
    if (typeof showModal === 'function') {
        showModal('examModal');
    } else {
        modal.classList.add('active');
    }
}

// Make showExamModal globally available
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
    
    // Obtener valores del formulario
    const titulo = (form.querySelector('#examTitle')?.value || '').trim();
    const materiaValue = form.querySelector('#examSubject')?.value || '';
    const materiaId = materiaValue && !isNaN(parseInt(materiaValue)) ? parseInt(materiaValue) : 0;
    const fecha = form.querySelector('#examDate')?.value || '';
    const tipo = (form.querySelector('#examType')?.value || '').trim().toUpperCase();
    const descripcion = (form.querySelector('#examDescription')?.value || '').trim() || null;
    const peso = parseFloat(form.querySelector('#examPeso')?.value || '1.00') || 1.00;
    const estado = form.querySelector('#examEstado')?.value || 'PROGRAMADA';
    
    // Validar campos requeridos
    const missingFields = [];
    const errors = [];
    
    if (!titulo || titulo.length === 0) {
        missingFields.push('Título');
        errors.push('El título está vacío');
    }
    
    if (!materiaValue || materiaValue === '' || materiaValue === '0' || isNaN(materiaId) || materiaId <= 0) {
        missingFields.push('Materia');
        errors.push('Debe seleccionar una materia válida');
    }
    
    if (!fecha || fecha.trim() === '') {
        missingFields.push('Fecha');
        errors.push('La fecha está vacía');
    }
    
    if (!tipo || tipo.trim() === '') {
        missingFields.push('Tipo');
        errors.push('Debe seleccionar un tipo de evaluación');
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
            if (typeof loadData === 'function') {
                await loadData();
            }
            
            // Cerrar modal
            const modal = document.getElementById('examModal');
            if (modal) {
                if (typeof closeModal === 'function') {
                    closeModal('examModal');
                } else {
                    modal.classList.remove('active');
                }
                setTimeout(() => {
                    if (modal && modal.parentNode) {
                        modal.remove();
                    }
                }, 300);
            }
            
            // Recargar exámenes si la función existe
            if (typeof loadExams === 'function') {
                loadExams();
            }
            
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
        console.error('Error saving exam:', error);
        alert(error.message || 'Error al guardar la evaluación. Por favor, intente nuevamente.');
    }
}

// Make saveExam globally available
window.saveExam = saveExam;

async function editExam(id) {
    const exam = (appData.evaluacion || []).find(e => e.ID_evaluacion === id);
    if (!exam) {
        alert('Evaluación no encontrada.');
        return;
    }
    
    await showExamModal(id);
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
        return;
    }
    
    isShowingGradeMarkingView = true;
    window.isShowingGradeMarkingView = true;
    
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
 * Find evaluation by ID - robust comparison
 */
function findEvaluationById(evaluationId) {
    // Check appData availability
    if (!appData) {
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
        return null;
    }
    
    if (!Array.isArray(appData.evaluacion)) {
        return null;
    }
    
    const targetId = normalizeId(evaluationId);
    
    if (targetId === null) {
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
    
    return evaluation || null;
}

async function populateEvaluationDropdown() {
    const evaluationSelect = document.getElementById('gradeEvaluation');
    if (!evaluationSelect) {
        return;
    }
    
    // Clear existing options
    evaluationSelect.innerHTML = '<option value="" data-translate="select_evaluation">- Seleccionar Evaluación -</option>';
    
    // Ensure appData is loaded
    if (!appData || !appData.evaluacion) {
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
            evaluationSelect.innerHTML = '<option value="">Error: No se pudieron cargar las evaluaciones</option>';
            return;
        }
    }
    
    if (!Array.isArray(appData.evaluacion)) {
        evaluationSelect.innerHTML = '<option value="">Error: Datos de evaluaciones inválidos</option>';
        return;
    }
    
    if (appData.evaluacion.length === 0) {
        evaluationSelect.innerHTML = '<option value="">No hay evaluaciones disponibles</option>';
        return;
    }
    
    // Populate dropdown with evaluations
    let populatedCount = 0;
    appData.evaluacion.forEach(evaluation => {
        if (!evaluation || !evaluation.ID_evaluacion) {
            return;
        }
        
        const evaluationId = normalizeId(evaluation.ID_evaluacion);
        if (evaluationId === null) {
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
    
    // Automatically select the first evaluation if available
    if (populatedCount > 0 && evaluationSelect.options.length > 1) {
        // Select the first evaluation (skip the empty placeholder option)
        evaluationSelect.value = evaluationSelect.options[1].value;
        
        // Trigger change event to load students automatically
        evaluationSelect.dispatchEvent(new Event('change'));
    }
}

async function loadStudentsForGradeMarking() {
    const evaluationSelect = document.getElementById('gradeEvaluation');
    const tableBody = document.getElementById('gradeTableBody');
    
    if (!evaluationSelect) {
        return;
    }
    
    if (!tableBody) {
        return;
    }
    
    // Get selected value
    const selectedValue = evaluationSelect.value;
    
    if (!selectedValue || selectedValue === '') {
        tableBody.innerHTML = '<tr><td colspan="5" class="text-center">Seleccione una evaluación para ver los estudiantes</td></tr>';
        return;
    }
    
    // Ensure appData is loaded
    if (!appData || !appData.evaluacion) {
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
            return;
        }
    }
    
    // Find evaluation using our robust function
    const evaluation = findEvaluationById(selectedValue);
    
    if (!evaluation) {
        tableBody.innerHTML = '<tr><td colspan="5" class="text-center">Evaluación no encontrada</td></tr>';
        return;
    }
    
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
        const applyStyles = () => {
            const grade = parseFloat(input.value);
            input.classList.remove('excellent', 'good', 'poor');
            if (isNaN(grade)) return;
            if (grade >= 8) {
                input.classList.add('excellent');
            } else if (grade >= 6) {
                input.classList.add('good');
            } else if (grade >= 1) {
                input.classList.add('poor');
            }
        };

        const clampValue = () => {
            if (input.disabled) return;
            let value = input.value;
            if (value === '' || value === null) {
                input.classList.remove('excellent', 'good', 'poor');
                return;
            }

            let numericValue = parseFloat(value);
            if (isNaN(numericValue)) {
                input.value = '';
                input.classList.remove('excellent', 'good', 'poor');
                return;
            }

            const minAttr = input.getAttribute('min');
            const maxAttr = input.getAttribute('max');
            const min = minAttr !== null ? parseFloat(minAttr) : null;
            const max = maxAttr !== null ? parseFloat(maxAttr) : null;

            if (max !== null && numericValue > max) {
                numericValue = max;
            }
            if (min !== null && numericValue < min) {
                numericValue = min;
            }

            // Maintain decimals if step allows
            const stepAttr = input.getAttribute('step');
            if (stepAttr && stepAttr.indexOf('.') >= 0) {
                const decimals = stepAttr.split('.')[1].length;
                input.value = numericValue.toFixed(decimals);
            } else {
                input.value = String(numericValue);
            }

            applyStyles();
        };

        input.addEventListener('input', function() {
            clampValue();
        });

        input.addEventListener('blur', clampValue);

        // Apply initial styles
        applyStyles();
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
                }
            } catch (error) {
                failed++;
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
// saveExam function is defined above - this duplicate is removed

async function editExam(id) {
    const exam = (appData.evaluacion || []).find(e => e.ID_evaluacion === id);
    if (!exam) {
        alert('Evaluación no encontrada.');
        return;
    }
    
    await showExamModal(id);
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

function exportStudentsAsExcel() {
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
    
    // Create Excel content (usando punto y coma como separador para Excel)
    const separator = ';';
    const csvContent = [
        headers.map(h => `"${String(h).replace(/"/g, '""')}"`).join(separator),
        ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(separator))
    ].join('\r\n');
    
    // Download Excel with BOM UTF-8 for proper accents
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
    link.setAttribute('download', `estudiantes_${new Date().toISOString().split('T')[0]}.xls`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    // Close modal and show notification
    if (typeof showExportNotification === 'function') {
        showExportNotification('Lista de estudiantes exportada como Excel exitosamente!', 'success');
    } else {
        alert('Lista de estudiantes exportada como Excel exitosamente!');
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
                body { font-family: Arial, sans-serif; margin: 30px; line-height: 1.6; }
                h1 { color: #667eea; text-align: center; margin-bottom: 10px; font-size: 24px; }
                table { width: 100%; border-collapse: collapse; margin-top: 25px; border: 2px solid #667eea; }
                th { background-color: #667eea; color: white; padding: 14px 12px; text-align: left; border: 1px solid #5568d3; font-weight: bold; font-size: 13px; }
                td { padding: 12px; border: 1px solid #e2e8f0; font-size: 12px; }
                tr:nth-child(even) { background-color: #f8f9fa; }
                tr:nth-child(odd) { background-color: #ffffff; }
                .header { margin-bottom: 25px; padding-bottom: 15px; border-bottom: 2px solid #667eea; }
                .date { color: #666; font-size: 14px; text-align: center; }
                .empty-cell { color: #999; font-style: italic; }
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
        
        // Calculate average grade - solo si hay calificaciones válidas
        const studentGrades = notas.filter(n => n.Estudiante_ID_Estudiante === student.ID_Estudiante && n.Calificacion !== null && n.Calificacion !== undefined && n.Calificacion !== '');
        const average = studentGrades.length > 0
            ? (studentGrades.reduce((sum, n) => sum + parseFloat(n.Calificacion || 0), 0) / studentGrades.length).toFixed(2)
            : '';
        
        // Calculate attendance percentage
        const studentAttendance = asistencia.filter(a => a.Estudiante_ID_Estudiante === student.ID_Estudiante);
        const presentCount = studentAttendance.filter(a => a.Presente === 'P' || a.Presente === 'Y').length;
        const attendanceRate = studentAttendance.length > 0
            ? ((presentCount / studentAttendance.length) * 100).toFixed(2)
            : '';
        
        htmlContent += `
            <tr>
                <td>${student.ID_Estudiante || ''}</td>
                <td>${student.Nombre || ''}</td>
                <td>${student.Apellido || ''}</td>
                <td>${studentSubjects || 'Sin materias'}</td>
                <td class="${average ? '' : 'empty-cell'}">${average || ''}</td>
                <td class="${attendanceRate ? '' : 'empty-cell'}">${attendanceRate ? attendanceRate + '%' : ''}</td>
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

function exportExamsAsExcel() {
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
    
    // Create Excel content (usando punto y coma como separador para Excel)
    const separator = ';';
    const csvContent = [
        headers.map(h => `"${String(h).replace(/"/g, '""')}"`).join(separator),
        ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(separator))
    ].join('\r\n');
    
    // Download Excel with BOM UTF-8 for proper accents
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
    link.setAttribute('download', `examenes_${new Date().toISOString().split('T')[0]}.xls`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    // Close modal and show notification
    if (typeof showExportNotification === 'function') {
        showExportNotification('Lista de exámenes exportada como Excel exitosamente!', 'success');
    } else {
        alert('Lista de exámenes exportada como Excel exitosamente!');
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
    
    // Excel export button handler
    const exportExcelBtn = document.getElementById('exportExcelBtn');
    if (exportExcelBtn) {
        exportExcelBtn.addEventListener('click', () => {
            const exportDialogModal = document.getElementById('exportDialogModal');
            const context = exportDialogModal ? exportDialogModal.getAttribute('data-export-context') : null;
            
            if (context === 'subjects') {
                if (typeof exportSubjectsAsExcel === 'function') {
                    exportSubjectsAsExcel();
                } else if (typeof exportSubjectsAsCSV === 'function') {
                    exportSubjectsAsCSV();
                }
            } else {
                const currentTab = getCurrentTab();
                if (currentTab === 'exams') {
                    exportExamsAsExcel();
                } else {
                    exportStudentsAsExcel();
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

// ============================================================================
// BULK STUDENT LOADING - Carga masiva de alumnos por curso/división
// ============================================================================

// Función para poblar el dropdown de cursos en el modal de carga masiva
async function populateBulkCourseDivisionDropdown() {
    const courseSelect = document.getElementById('bulkCourseDivision');
    if (!courseSelect) return;
    
    // Obtener el ID del docente actual
    const userIdString = localStorage.getItem('userId');
    const teacherId = userIdString ? parseInt(userIdString, 10) : null;
    
    if (!teacherId) {
        courseSelect.innerHTML = '<option value="">- Seleccionar Curso -</option>';
        return;
    }
    
    const uniqueCourses = [];
    
    // Primero, obtener cursos de la tabla Curso desde la API
    try {
        const response = await fetch(`api/curso.php?userId=${userIdString}`);
        const result = await response.json();
        if (result.success && result.data && Array.isArray(result.data)) {
            result.data.forEach(c => {
                if (c.Curso_division && c.Estado === 'ACTIVO' && !uniqueCourses.includes(c.Curso_division)) {
                    uniqueCourses.push(c.Curso_division);
                }
            });
        }
    } catch (error) {
        console.warn('Error al cargar cursos desde API:', error);
        // Si falla, intentar usar la función getAvailableCourses si existe
        if (typeof getAvailableCourses === 'function') {
            const cursosFromTable = getAvailableCourses();
            cursosFromTable.forEach(c => {
                if (c.Curso_division && !uniqueCourses.includes(c.Curso_division)) {
                    uniqueCourses.push(c.Curso_division);
                }
            });
        }
    }
    
    // Luego, obtener cursos de Materia (para compatibilidad con datos existentes)
    const teacherSubjects = (appData.materia || []).filter(m => 
        m.Usuarios_docente_ID_docente === teacherId && 
        (!m.Estado || m.Estado === 'ACTIVA')
    );
    
    teacherSubjects.forEach(s => {
        if (s.Curso_division && s.Curso_division.trim() !== '' && s.Curso_division !== 'Sin asignar' && !uniqueCourses.includes(s.Curso_division)) {
            uniqueCourses.push(s.Curso_division);
        }
    });
    
    // Limpiar opciones actuales
    courseSelect.innerHTML = '<option value="">- Seleccionar Curso -</option>';
    
    // Ordenar y agregar cursos
    uniqueCourses.sort().forEach(course => {
        const option = document.createElement('option');
        option.value = course;
        option.textContent = course;
        courseSelect.appendChild(option);
    });

    // Agregar opción para crear uno nuevo
    const newOpt = document.createElement('option');
    newOpt.value = '__new__';
    newOpt.textContent = '+ Crear Nuevo Curso';
    courseSelect.appendChild(newOpt);

    // Mostrar/ocultar sección de creación
    const createSection = document.getElementById('bulkCreateNewCourseSection');
    courseSelect.onchange = () => {
        if (!createSection) return;
        createSection.style.display = courseSelect.value === '__new__' ? 'block' : 'none';
    };
}

// Función para parsear archivo CSV
function parseBulkStudentsCSV(file, callback) {
    const reader = new FileReader();
    reader.onload = function(e) {
        const text = e.target.result;
        const lines = text.split('\n').filter(line => line.trim());
        
        if (lines.length === 0) {
            callback([]);
            return;
        }
        
        // Detectar delimitador (coma o punto y coma)
        const delimiter = text.includes(';') ? ';' : ',';
        
        // Parsear headers
        const headers = lines[0].split(delimiter).map(h => h.trim().replace(/^"|"$/g, ''));
        
        // Buscar columnas de Nombre y Apellido (case-insensitive)
        const nombreIndex = headers.findIndex(h => 
            h.toLowerCase() === 'nombre' || h.toLowerCase() === 'name'
        );
        const apellidoIndex = headers.findIndex(h => 
            h.toLowerCase() === 'apellido' || h.toLowerCase() === 'lastname' || 
            h.toLowerCase() === 'last_name' || h.toLowerCase() === 'surname'
        );
        
        // Si no encontramos las columnas, intentar con el orden
        let nombreCol = nombreIndex >= 0 ? nombreIndex : 0;
        let apellidoCol = apellidoIndex >= 0 ? apellidoIndex : 1;
        
        // Si hay solo una columna, asumimos que es "Apellido, Nombre" o "Nombre Apellido"
        if (headers.length === 1 && nombreIndex < 0 && apellidoIndex < 0) {
            nombreCol = 0;
            apellidoCol = 0;
        }
        
        const students = [];
        
        // Parsear filas (saltar header)
        for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(delimiter).map(v => v.trim().replace(/^"|"$/g, ''));
            
            if (values.length === 0 || !values.some(v => v)) {
                continue;
            }
            
            let nombre = '';
            let apellido = '';
            
            if (nombreCol === apellidoCol && headers.length === 1) {
                // Caso especial: una sola columna con "Apellido, Nombre" o "Nombre Apellido"
                const value = values[0] || '';
                if (value.includes(',')) {
                    const parts = value.split(',').map(p => p.trim());
                    apellido = parts[0] || '';
                    nombre = parts.slice(1).join(' ') || '';
                } else {
                    const parts = value.split(/\s+/).filter(p => p);
                    if (parts.length >= 2) {
                        apellido = parts[0];
                        nombre = parts.slice(1).join(' ');
                    } else {
                        apellido = value;
                    }
                }
            } else {
                // Columnas separadas
                nombre = (values[nombreCol] || '').trim();
                apellido = (values[apellidoCol] || '').trim();
                
                // Si el orden está al revés (Apellido, Nombre), intercambiar
                if (!nombre && !apellido && values.length >= 2) {
                    // Intentar ambos órdenes
                    nombre = values[0] || '';
                    apellido = values[1] || '';
                }
            }
            
            if (nombre || apellido) {
                students.push({
                    Nombre: nombre || '',
                    Apellido: apellido || nombre || '',
                    isValid: !!(nombre && apellido) || apellido.length > 0
                });
            }
        }
        
        callback(students);
    };
    
    reader.onerror = function() {
        callback([]);
    };
    
    reader.readAsText(file);
}

// Función para parsear nombres de alumnos desde el textarea (mantener para compatibilidad)
function parseStudentNames(text) {
    if (!text || !text.trim()) {
        return [];
    }
    
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    const students = [];
    
    lines.forEach(line => {
        // Intentar diferentes formatos:
        // 1. "Apellido, Nombre" (coma)
        // 2. "Apellido\tNombre" (tabulación)
        // 3. "Nombre Apellido" o "Apellido Nombre" (sin coma)
        
        let apellido = '';
        let nombre = '';
        
        // Formato con coma: "Apellido, Nombre"
        if (line.includes(',')) {
            const parts = line.split(',').map(p => p.trim()).filter(p => p.length > 0);
            if (parts.length >= 2) {
                apellido = parts[0];
                nombre = parts.slice(1).join(' '); // Por si hay múltiples nombres
            } else if (parts.length === 1) {
                // Solo hay un valor antes de la coma
                apellido = parts[0];
            }
        }
        // Formato con tabulación: "Apellido\tNombre"
        else if (line.includes('\t')) {
            const parts = line.split('\t').map(p => p.trim()).filter(p => p.length > 0);
            if (parts.length >= 2) {
                apellido = parts[0];
                nombre = parts.slice(1).join(' ');
            }
        }
        // Formato simple: sin coma/tab
        // Estrategia mejorada: para listas de 30-40 alumnos, asumimos que el formato más común es "Apellido Nombre"
        // Si la línea tiene 2 palabras, primera = apellido, segunda = nombre
        // Si tiene 3+ palabras, primera = apellido, resto = nombre (puede tener nombres compuestos)
        else {
            const parts = line.split(/\s+/).filter(p => p.length > 0);
            if (parts.length >= 2) {
                // Primera palabra = apellido, resto = nombre
                apellido = parts[0];
                nombre = parts.slice(1).join(' ');
            } else if (parts.length === 1) {
                // Solo hay un valor, lo tratamos como apellido
                apellido = parts[0];
            }
        }
        
        if (apellido || nombre) {
            students.push({
                Apellido: apellido || '',
                Nombre: nombre || apellido || '',
                isValid: !!(apellido && nombre) || apellido.length > 0
            });
        }
    });
    
    return students;
}

// Función para procesar la carga masiva de alumnos
async function processBulkStudents() {
    const courseDivisionSelect = document.getElementById('bulkCourseDivision');
    const studentsFileInput = document.getElementById('bulkStudentsFileInput');
    const statusSelect = document.getElementById('bulkStudentStatus');
    const bulkModal = document.getElementById('loadCourseDivisionModal');
    
    if (!courseDivisionSelect || !studentsFileInput || !statusSelect) {
        alert('Error: No se encontraron los campos del formulario');
        return;
    }
    
    let courseDivision = courseDivisionSelect.value.trim();
    if (courseDivision === '__new__') {
        const n = (document.getElementById('bulkCourseNumber') || {}).value || '';
        const d = (document.getElementById('bulkDivisionLetter') || {}).value || '';
        if (!n || !d) {
            alert('Completá Curso y División para crear el curso');
            return;
        }
        courseDivision = `${n}º Curso - División ${d}`;
    }
    const defaultStatus = statusSelect.value;
    
    // Validaciones
    if (!courseDivision) {
        alert('Por favor selecciona un curso/división');
        return;
    }
    
    // Determinar modo de entrada
    const tableMode = document.getElementById('bulkTableMode');
    const isTableMode = tableMode && tableMode.style.display !== 'none';
    
    let students = [];
    if (isTableMode) {
        // Leer de la tabla manual
        students = collectManualStudentsFromTable();
        if (students.length === 0) {
            alert('Por favor ingresa al menos un alumno en la tabla');
            return;
        }
    } else {
        // Parsear del archivo CSV
        const file = studentsFileInput.files[0];
        if (!file) {
            alert('Por favor selecciona un archivo CSV');
            return;
        }
        
        const parsed = await new Promise((resolve) => {
            if (!file) {
                resolve([]);
                return;
            }
            parseBulkStudentsCSV(file, resolve);
        });
        
        if (!Array.isArray(parsed) || parsed.length === 0) {
            alert('El archivo CSV está vacío o no se pudo leer. Verifica el formato e inténtalo nuevamente.');
            return;
        }
        
        students = parsed;
        studentsFileInput._parsedData = parsed;
    }
    
    if (students.length === 0) {
        alert('No se pudieron parsear alumnos de la lista. Verifica el formato.');
        return;
    }
    
    // Filtrar estudiantes válidos
    const validStudents = students.filter(s => s.isValid);
    
    if (validStudents.length === 0) {
        alert('No se encontraron alumnos válidos. Verifica el formato (Apellido, Nombre o Nombre Apellido)');
        return;
    }
    
    // Confirmar antes de proceder
    const confirmMessage = `¿Deseas crear ${validStudents.length} alumno(s) para el curso "${courseDivision}"?`;
    if (!confirm(confirmMessage)) {
        return;
    }
    
    // Obtener el ID del docente actual
    const userIdString = localStorage.getItem('userId');
    const teacherId = userIdString ? parseInt(userIdString, 10) : null;
    
    if (!teacherId) {
        alert('Error: No se encontró el ID de usuario');
        return;
    }
    
    // Obtener todas las materias del curso seleccionado para este docente
    let courseSubjects = (appData.materia || []).filter(m => 
        m.Usuarios_docente_ID_docente === teacherId &&
        m.Curso_division === courseDivision &&
        (!m.Estado || m.Estado === 'ACTIVA')
    );

    const targetSubjectId = bulkModal && bulkModal.dataset.subjectId
        ? parseInt(bulkModal.dataset.subjectId, 10)
        : null;
    if (targetSubjectId) {
        const targetSubject = (appData.materia || []).find(m => parseInt(m.ID_materia, 10) === targetSubjectId);
        if (targetSubject) {
            courseSubjects = [targetSubject];
        }
    }
    
    if (courseSubjects.length === 0) {
        alert(`No hay materias activas para el curso "${courseDivision}". Por favor crea al menos una materia para este curso primero.`);
        return;
    }
    
    const subjectIds = courseSubjects.map(s => parseInt(s.ID_materia));
    
    // Procesar estudiantes uno por uno
    let successCount = 0;
    let errorCount = 0;
    const errors = [];
    
    // Mostrar indicador de progreso
    const submitBtn = document.querySelector('#loadCourseDivisionForm button[type="button"][onclick*="processBulkStudents"]');
    const originalBtnText = submitBtn ? submitBtn.textContent : '';
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = `Procesando... (0/${validStudents.length})`;
    }
    
    try {
        for (let i = 0; i < validStudents.length; i++) {
            const student = validStudents[i];
            
            // Actualizar progreso
            if (submitBtn) {
                submitBtn.textContent = `Procesando... (${i + 1}/${validStudents.length})`;
            }
            
            try {
                // Crear el estudiante
                const studentData = {
                    Nombre: student.Nombre,
                    Apellido: student.Apellido,
                    Email: null,
                    Fecha_nacimiento: null,
                    Estado: defaultStatus
                };
                
                const createResponse = await fetch('../api/estudiantes.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify(studentData)
                });
                
                const createResult = await createResponse.json().catch(() => ({}));
                
                if (!createResponse.ok || createResult.success === false) {
                    throw new Error(createResult.message || 'Error al crear estudiante');
                }
                
                // Obtener el ID del estudiante creado
                let studentId = null;
                if (createResult.data && createResult.data.ID_Estudiante) {
                    studentId = createResult.data.ID_Estudiante;
                } else if (createResult.ID_Estudiante) {
                    studentId = createResult.ID_Estudiante;
                } else if (createResult.id) {
                    studentId = createResult.id;
                }
                
                if (!studentId) {
                    throw new Error('No se pudo obtener el ID del estudiante creado');
                }
                
                // Asignar el estudiante a todas las materias del curso
                const enrollmentRelations = subjectIds.map(materiaId => ({
                    Materia_ID_materia: materiaId,
                    Estudiante_ID_Estudiante: studentId,
                    Estado: 'INSCRITO'
                }));
                
                const enrollmentResponse = await fetch('../api/alumnos_x_materia.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify(enrollmentRelations)
                });
                
                const enrollmentResult = await enrollmentResponse.json().catch(() => ({}));
                
                if (!enrollmentResponse.ok && enrollmentResponse.status !== 207) {
                    // 207 es "Multi-Status" - algunos pueden haber fallado, pero otros pueden haber funcionado
                    console.warn(`Error asignando materias a ${student.Nombre} ${student.Apellido}:`, enrollmentResult.message);
                }
                
                successCount++;
            } catch (err) {
                errorCount++;
                errors.push(`${student.Nombre} ${student.Apellido}: ${err.message || 'Error desconocido'}`);
                console.error(`Error procesando ${student.Nombre} ${student.Apellido}:`, err);
            }
        }
        
        // Recargar datos
        if (typeof loadData === 'function') {
            await loadData();
        }
        
        // Recargar vista de estudiantes
        if (typeof loadUnifiedStudentData === 'function') {
            loadUnifiedStudentData();
        }
        
        // Cerrar modal
        if (typeof closeModal === 'function') {
            closeModal('loadCourseDivisionModal');
        } else {
            const modal = document.getElementById('loadCourseDivisionModal');
            if (modal) modal.classList.remove('active');
        }
        
        // Mostrar resultado
        let message = `Se crearon ${successCount} alumno(s) correctamente.`;
        if (errorCount > 0) {
            message += `\n\nHubo ${errorCount} error(es):\n${errors.slice(0, 5).join('\n')}${errors.length > 5 ? '\n...' : ''}`;
        }
        
        if (typeof showNotification === 'function') {
            showNotification(message, errorCount > 0 ? 'warning' : 'success');
        } else {
            alert(message);
        }
        
    } catch (err) {
        alert('Error al procesar la carga masiva: ' + (err.message || 'Error desconocido'));
    } finally {
        // Restaurar botón
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = originalBtnText || 'Cargar Alumnos';
        }
        if (bulkModal && bulkModal.dataset) {
            delete bulkModal.dataset.subjectId;
        }
    }
}

// Hacer la función globalmente accesible
window.processBulkStudents = processBulkStudents;

// ---------------------------------------------------------------------------
// Modo tabla manual para alumnos
// ---------------------------------------------------------------------------

let manualStudentRowCounter = 0;

// Función para configurar handlers de drag-and-drop y file upload para CSV
function setupBulkCsvUploadHandlers() {
    const uploadArea = document.getElementById('bulkCsvUploadArea');
    const fileInput = document.getElementById('bulkStudentsFileInput');
    const fileInfo = document.getElementById('bulkCsvFileInfo');
    const fileName = document.getElementById('bulkCsvFileName');
    const fileSize = document.getElementById('bulkCsvFileSize');
    const removeFileBtn = document.getElementById('bulkCsvRemoveFile');
    const previewDiv = document.getElementById('bulkCsvPreview');
    const previewContent = document.getElementById('bulkCsvPreviewContent');
    const previewTotal = document.getElementById('bulkCsvPreviewTotal');
    
    if (!uploadArea || !fileInput) return;
    
    // Función para procesar archivo seleccionado
    const processFile = (file) => {
        if (!file) return;
        
        // Validar tipo de archivo
        const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
        if (fileExtension === '.xlsx') {
            alert('Por favor exporta tu archivo Excel como CSV primero. En Excel: Archivo > Guardar como > Formato CSV (delimitado por comas).');
            return;
        }
        if (fileExtension !== '.csv') {
            alert('Por favor selecciona un archivo CSV (.csv)');
            return;
        }
        
        // Mostrar información del archivo
        fileName.textContent = file.name;
        fileSize.textContent = (file.size / 1024).toFixed(2) + ' KB';
        fileInfo.style.display = 'block';
        
        // Parsear CSV
        parseBulkStudentsCSV(file, function(students) {
            if (students.length === 0) {
                alert('El archivo CSV está vacío o no tiene el formato correcto');
                fileInput.value = '';
                fileInfo.style.display = 'none';
                previewDiv.style.display = 'none';
                return;
            }
            
            // Guardar datos parseados
            fileInput._parsedData = students;
            
            // Mostrar preview
            previewDiv.style.display = 'block';
            const previewRows = students.slice(0, 5);
            previewContent.innerHTML = `
                <table style="width: 100%; border-collapse: collapse; font-size: 0.9em;">
                    <thead>
                        <tr style="background: #f0f0f0;">
                            <th style="padding: 8px; text-align: left; border: 1px solid #ddd;">Nombre</th>
                            <th style="padding: 8px; text-align: left; border: 1px solid #ddd;">Apellido</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${previewRows.map(row => `
                            <tr>
                                <td style="padding: 8px; border: 1px solid #ddd;">${row.Nombre || ''}</td>
                                <td style="padding: 8px; border: 1px solid #ddd;">${row.Apellido || ''}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                ${students.length > 5 ? `<p style="margin-top: 8px; color: #666;">... y ${students.length - 5} más</p>` : ''}
            `;
            previewTotal.textContent = `Total: ${students.length} estudiante(s)`;
        });
    };
    
    // Handler para selección de archivo
    fileInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        processFile(file);
    });
    
    // Handlers para drag-and-drop
    uploadArea.addEventListener('dragover', function(e) {
        e.preventDefault();
        e.stopPropagation();
        uploadArea.classList.add('drag-over');
    });
    
    uploadArea.addEventListener('dragleave', function(e) {
        e.preventDefault();
        e.stopPropagation();
        uploadArea.classList.remove('drag-over');
    });
    
    uploadArea.addEventListener('drop', function(e) {
        e.preventDefault();
        e.stopPropagation();
        uploadArea.classList.remove('drag-over');
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            fileInput.files = files;
            processFile(files[0]);
        }
    });
    
    // Handler para remover archivo
    if (removeFileBtn) {
        removeFileBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            fileInput.value = '';
            fileInput._parsedData = null;
            fileInfo.style.display = 'none';
            previewDiv.style.display = 'none';
        });
    }
}

// Función para alternar entre modo CSV upload y tabla manual
window.toggleBulkInputMode = function() {
    const textareaMode = document.getElementById('bulkTextareaMode');
    const tableMode = document.getElementById('bulkTableMode');
    const toggleBtn = document.getElementById('toggleInputModeBtn');
    
    if (!textareaMode || !tableMode || !toggleBtn) return;
    
    const isTableMode = tableMode.style.display !== 'none';
    
    if (isTableMode) {
        // Cambiar a modo CSV upload
        textareaMode.style.display = 'block';
        tableMode.style.display = 'none';
        toggleBtn.innerHTML = '<i class="fas fa-table"></i> Modo Tabla Manual';
        // Configurar handlers si no están configurados
        setupBulkCsvUploadHandlers();
    } else {
        // Cambiar a modo tabla
        textareaMode.style.display = 'none';
        tableMode.style.display = 'block';
        toggleBtn.innerHTML = '<i class="fas fa-file-csv"></i> Modo Excel';
        // Initialize delete button visibility
        if (typeof updateStudentDeleteButtonsVisibility === 'function') {
            updateStudentDeleteButtonsVisibility();
        }
        
        // Inicializar la tabla si está vacía
        const tbody = document.getElementById('bulkManualStudentsTableBody');
        if (tbody && tbody.children.length === 0) {
            addManualStudentRow();
        }
    }
};

// Función para agregar una nueva fila en la tabla manual
window.addManualStudentRow = function() {
    const tbody = document.getElementById('bulkManualStudentsTableBody');
    if (!tbody) return;
    
    manualStudentRowCounter++;
    const rowId = manualStudentRowCounter;
    
    const newRow = document.createElement('tr');
    newRow.innerHTML = `
        <td>
            <input type="text" 
                   id="manualApellido_${rowId}" 
                   class="manual-student-input" 
                   placeholder="Apellido" 
                   style="width: 100%; padding: 6px;">
        </td>
        <td>
            <input type="text" 
                   id="manualNombre_${rowId}" 
                   class="manual-student-input" 
                   placeholder="Nombre" 
                   style="width: 100%; padding: 6px;"
                   onkeypress="if(event.key === 'Enter') { event.preventDefault(); const nextRowId = ${rowId} + 1; addManualStudentRow(); setTimeout(() => { const nextInput = document.getElementById('manualApellido_' + nextRowId); if(nextInput) nextInput.focus(); }, 100); }">
        </td>
        <td>
            <div style="display: flex; gap: 4px; align-items: center;">
                <button type="button" 
                        class="btn-icon btn-primary" 
                        onclick="addManualStudentRow(); return false;" 
                        title="Agregar siguiente alumno">
                    <i class="fas fa-plus"></i>
                </button>
                <button type="button" 
                        class="btn-icon btn-delete" 
                        onclick="removeManualStudentRow(this); return false;" 
                        title="Eliminar alumno">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </td>
    `;
    
    tbody.appendChild(newRow);
    
    // Update delete button visibility
    updateStudentDeleteButtonsVisibility();
    
    // Enfocar el campo de apellido de la nueva fila
    setTimeout(() => {
        const apellidoInput = document.getElementById(`manualApellido_${rowId}`);
        if (apellidoInput) apellidoInput.focus();
    }, 50);
};

// Función para eliminar una fila específica
window.removeManualStudentRow = function(button) {
    const tbody = document.getElementById('bulkManualStudentsTableBody');
    if (!tbody || !button) return;
    
    const row = button.closest('tr');
    if (!row) return;
    
    // Keep at least one row
    if (tbody.children.length <= 1) {
        alert('Debe haber al menos una fila');
        return;
    }
    
    tbody.removeChild(row);
    
    // Update delete button visibility - show delete buttons if more than one row
    updateStudentDeleteButtonsVisibility();
};

// Update delete button visibility for students
function updateStudentDeleteButtonsVisibility() {
    const tbody = document.getElementById('bulkManualStudentsTableBody');
    if (!tbody) return;
    
    const rows = tbody.querySelectorAll('tr');
    rows.forEach((row, index) => {
        const deleteBtn = row.querySelector('.btn-delete');
        if (deleteBtn) {
            // Show delete button if there's more than one row, hide for the first row
            deleteBtn.style.display = rows.length > 1 ? '' : 'none';
        }
    });
}

// Función para recolectar estudiantes de la tabla manual
function collectManualStudentsFromTable() {
    const tbody = document.getElementById('bulkManualStudentsTableBody');
    if (!tbody) return [];
    
    const students = [];
    const rows = Array.from(tbody.querySelectorAll('tr'));
    
    rows.forEach(row => {
        const apellidoInput = row.querySelector('input[id^="manualApellido_"]');
        const nombreInput = row.querySelector('input[id^="manualNombre_"]');
        
        const apellido = apellidoInput ? apellidoInput.value.trim() : '';
        const nombre = nombreInput ? nombreInput.value.trim() : '';
        
        if (apellido || nombre) {
            students.push({
                Apellido: apellido || '',
                Nombre: nombre || '',
                isValid: !!(apellido && nombre)
            });
        }
    });
    
    return students;
}