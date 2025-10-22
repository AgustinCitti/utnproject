// Grade Management
function initializeGrades() {
    const addGradeBtn = document.getElementById('addGradeBtn');
    const gradeModal = document.getElementById('gradeModal');
    const gradeForm = document.getElementById('gradeForm');
    const courseFilter = document.getElementById('courseFilter');
    const markGradesBtn = document.getElementById('markGradesBtn');
    const gradeMarkingCourseFilter = document.getElementById('gradeMarkingCourseFilter');
    const gradeMarkingSubjectFilter = document.getElementById('gradeMarkingSubjectFilter');
    const gradeMarkingCourseSelect = document.getElementById('gradeMarkingCourseSelect');
    const gradeMarkingSubjectSelect = document.getElementById('gradeMarkingSubjectSelect');
    const gradeMarkingExamSelect = document.getElementById('gradeMarkingExamSelect');
    const saveGradeMarkingBtn = document.getElementById('saveGradeMarkingBtn');
    const cancelGradeMarkingBtn = document.getElementById('cancelGradeMarkingBtn');

    if (addGradeBtn) {
        addGradeBtn.addEventListener('click', () => {
            // Navigate to grade marking section and show the grade marking view
            showSection('grade-marking');
            setTimeout(() => {
                showGradeMarkingView();
            }, 100);
        });
    }

    if (gradeForm) {
        gradeForm.addEventListener('submit', (e) => {
            e.preventDefault();
            saveGrade();
        });
    }

    // Course filter functionality
    if (courseFilter) {
        courseFilter.addEventListener('change', () => {
            filterGradesByCourse();
        });
    }

    // Grade marking functionality
    if (markGradesBtn) {
        markGradesBtn.addEventListener('click', () => {
            showGradeMarkingView();
        });
    }

    // Grade marking filters
    if (gradeMarkingCourseFilter) {
        gradeMarkingCourseFilter.addEventListener('change', () => {
            updateGradeMarkingSubjectFilter();
        });
    }

    if (gradeMarkingSubjectFilter) {
        gradeMarkingSubjectFilter.addEventListener('change', () => {
            loadGradeMarkingRecords();
        });
    }

    // Grade marking view filters
    if (gradeMarkingCourseSelect) {
        gradeMarkingCourseSelect.addEventListener('change', () => {
            updateGradeMarkingSubjectSelect();
        });
    }

    if (gradeMarkingSubjectSelect) {
        gradeMarkingSubjectSelect.addEventListener('change', () => {
            updateGradeMarkingExamSelect();
        });
    }

    if (gradeMarkingExamSelect) {
        gradeMarkingExamSelect.addEventListener('change', () => {
            loadStudentsForGradeMarking();
        });
    }

    if (saveGradeMarkingBtn) {
        saveGradeMarkingBtn.addEventListener('click', () => {
            saveGradeMarkingBulk();
        });
    }

    if (cancelGradeMarkingBtn) {
        cancelGradeMarkingBtn.addEventListener('click', () => {
            hideGradeMarkingView();
        });
    }

    setupModalHandlers('gradeModal');
}

function loadGrades() {
    const gradesContainer = document.getElementById('gradesContainer');
    const gradesList = document.getElementById('gradesList');
    
    if (!gradesContainer || !gradesList) return;

    // Get filtered grades
    const filteredGrades = getFilteredGrades();

    // Grid view
    gradesContainer.innerHTML = filteredGrades.map(grade => {
        const student = appData.estudiante.find(s => s.ID_Estudiante === grade.studentId);
        const subject = appData.materia.find(s => s.ID_materia === grade.subjectId);
        return `
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">${student ? student.Nombre + ' ' + student.Apellido : 'Unknown Student'}</h3>
                    <div class="card-actions">
                        <button class="btn-icon btn-edit" onclick="editGrade(${grade.id})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-icon btn-delete" onclick="deleteGrade(${grade.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <div class="card-content">
                    <p><strong>Subject:</strong> ${subject ? subject.Nombre : 'Unknown Subject'}</p>
                    <p><strong>Grade:</strong> ${grade.grade}/100</p>
                    <p><strong>Type:</strong> ${grade.type}</p>
                    <p><strong>Date:</strong> ${grade.date}</p>
                    ${grade.description ? `<p><strong>Description:</strong> ${grade.description}</p>` : ''}
                </div>
            </div>
        `;
    }).join('');

    // List view - Table format
    gradesList.innerHTML = `
        <div class="table-responsive">
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Student</th>
                        <th>Subject</th>
                        <th>Grade</th>
                        <th>Type</th>
                        <th>Date</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${filteredGrades.map(grade => {
                        const student = appData.estudiante.find(s => s.ID_Estudiante === grade.studentId);
                        const subject = appData.materia.find(s => s.ID_materia === grade.subjectId);
                        const gradeClass = grade.grade >= 80 ? 'grade-excellent' : grade.grade >= 60 ? 'grade-good' : 'grade-poor';
                        const shortDate = grade.date.split('-').slice(1).join('/');
                        return `
                            <tr>
                                <td><strong>${student ? student.Nombre + ' ' + student.Apellido : 'Unknown'}</strong></td>
                                <td>${subject ? subject.Nombre : 'Unknown'}</td>
                                <td><span class="table-status ${gradeClass}">${grade.grade}</span></td>
                                <td>${grade.type}</td>
                                <td>${shortDate}</td>
                                <td>
                                    <div class="table-actions">
                                        <button class="btn-icon btn-edit" onclick="editGrade(${grade.id})" title="Edit">
                                            <i class="fas fa-edit"></i>
                                        </button>
                                        <button class="btn-icon btn-delete" onclick="deleteGrade(${grade.id})" title="Delete">
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

function populateGradeForm() {
    const studentSelect = document.getElementById('gradeStudent');
    const subjectSelect = document.getElementById('gradeSubject');
    const courseFilter = document.getElementById('courseFilter');

    // Check if elements exist
    if (!studentSelect || !subjectSelect) {
        console.error('Grade form elements not found');
        return;
    }

    // Check if data is loaded
    if (!appData || !appData.estudiante || !appData.materia) {
        console.error('App data not loaded');
        return;
    }

    // Populate students
    studentSelect.innerHTML = appData.estudiante.map(student => 
        `<option value="${student.ID_Estudiante}">${student.Nombre} ${student.Apellido}</option>`
    ).join('');

    // Populate subjects
    subjectSelect.innerHTML = appData.materia.map(subject => 
        `<option value="${subject.ID_materia}">${subject.Nombre}</option>`
    ).join('');

    // Populate course filter
    if (courseFilter) {
        courseFilter.innerHTML = `
            <option value="" data-translate="all_courses">Todos los Cursos</option>
            ${appData.materia.map(subject => 
                `<option value="${subject.ID_materia}">${subject.Nombre}</option>`
            ).join('')}
        `;
    }
}

function saveGrade() {
    const formData = {
        studentId: parseInt(document.getElementById('gradeStudent').value),
        subjectId: parseInt(document.getElementById('gradeSubject').value),
        grade: parseInt(document.getElementById('gradeValue').value),
        type: document.getElementById('gradeType').value,
        description: document.getElementById('gradeDescription').value
    };

    const newGrade = {
        id: Date.now(),
        ...formData,
        date: new Date().toISOString().split('T')[0]
    };

    appData.grades.push(newGrade);
    saveData();
    closeModal('gradeModal');
    loadGrades();
    updateDashboard();
}

function editGrade(id) {
    const grade = appData.grades.find(g => g.id === id);
    if (!grade) return;

    showModal('gradeModal');
    // Use setTimeout to ensure modal is rendered before populating
    setTimeout(() => {
        populateGradeForm();
        document.getElementById('gradeStudent').value = grade.studentId;
        document.getElementById('gradeSubject').value = grade.subjectId;
        document.getElementById('gradeValue').value = grade.grade;
        document.getElementById('gradeType').value = grade.type;
        document.getElementById('gradeDescription').value = grade.description || '';
    }, 100);
}

function deleteGrade(id) {
    if (confirm('Are you sure you want to delete this grade?')) {
        appData.grades = appData.grades.filter(g => g.id !== id);
        saveData();
        loadGrades();
        updateDashboard();
    }
}

// Course filtering functions
function getFilteredGrades() {
    const courseFilter = document.getElementById('courseFilter');
    const selectedCourse = courseFilter ? courseFilter.value : '';
    
    if (!selectedCourse) {
        return appData.grades;
    }
    
    return appData.grades.filter(grade => grade.subjectId === parseInt(selectedCourse));
}

function filterGradesByCourse() {
    loadGrades();
}

// Grade Marking Functions
function showGradeMarkingView() {
    const gradeMarkingView = document.getElementById('gradeMarkingView');
    const gradeMarkingList = document.getElementById('gradeMarkingList');
    
    if (gradeMarkingView) {
        gradeMarkingView.style.display = 'block';
        gradeMarkingList.style.display = 'none';
        
        // Reset form
        document.getElementById('gradeMarkingNotes').value = '';
        document.getElementById('gradeMarkingCourseSelect').value = '';
        document.getElementById('gradeMarkingSubjectSelect').value = '';
        document.getElementById('gradeMarkingSubjectSelect').disabled = true;
        document.getElementById('gradeMarkingExamSelect').value = '';
        document.getElementById('gradeMarkingExamSelect').disabled = true;
        
        // Clear student table
        const tableBody = document.getElementById('gradeMarkingTableBody');
        if (tableBody) {
            tableBody.innerHTML = '<tr><td colspan="4" class="text-center">Seleccione un curso, materia y evaluación para ver los estudiantes</td></tr>';
        }
    }
}

function hideGradeMarkingView() {
    const gradeMarkingView = document.getElementById('gradeMarkingView');
    const gradeMarkingList = document.getElementById('gradeMarkingList');
    
    if (gradeMarkingView) {
        gradeMarkingView.style.display = 'none';
        gradeMarkingList.style.display = 'block';
    }
}

function updateGradeMarkingSubjectFilter() {
    const courseFilter = document.getElementById('gradeMarkingCourseFilter');
    const subjectFilter = document.getElementById('gradeMarkingSubjectFilter');
    
    if (!courseFilter || !subjectFilter) return;
    
    const selectedCourse = courseFilter.value;
    
    // Clear and populate subject filter
    subjectFilter.innerHTML = '<option value="" data-translate="all_subjects">Todas las Materias</option>';
    
    if (selectedCourse) {
        // Create a mapping between course values and curso_division patterns
        const courseMapping = {
            '9th': '9º Curso',
            '10th': '10º Curso',
            '11th': '11º Curso',
            '12th': '12º Curso'
        };
        
        const coursePattern = courseMapping[selectedCourse];
        
        // Filter subjects by course using the Curso_division field
        const courseSubjects = appData.materia.filter(subject => 
            subject.Curso_division.includes(coursePattern)
        );
        
        courseSubjects.forEach(subject => {
            const option = document.createElement('option');
            option.value = subject.ID_materia;
            option.textContent = subject.Nombre;
            subjectFilter.appendChild(option);
        });
    }
}

function updateGradeMarkingSubjectSelect() {
    const courseSelect = document.getElementById('gradeMarkingCourseSelect');
    const subjectSelect = document.getElementById('gradeMarkingSubjectSelect');
    
    if (!courseSelect || !subjectSelect) return;
    
    const selectedCourse = courseSelect.value;
    
    // Clear and populate subject filter
    subjectSelect.innerHTML = '<option value="" data-translate="select_subject">- Seleccionar -</option>';
    
    if (selectedCourse) {
        subjectSelect.disabled = false;
        
        // Create a mapping between course values and curso_division patterns
        const courseMapping = {
            '9th': '9º Curso',
            '10th': '10º Curso',
            '11th': '11º Curso',
            '12th': '12º Curso'
        };
        
        const coursePattern = courseMapping[selectedCourse];
        
        // Filter subjects by course using the Curso_division field
        const courseSubjects = appData.materia.filter(subject => 
            subject.Curso_division.includes(coursePattern)
        );
        
        courseSubjects.forEach(subject => {
            const option = document.createElement('option');
            option.value = subject.ID_materia;
            option.textContent = subject.Nombre;
            subjectSelect.appendChild(option);
        });
    } else {
        subjectSelect.disabled = true;
    }
    
    // Reset exam select
    const examSelect = document.getElementById('gradeMarkingExamSelect');
    if (examSelect) {
        examSelect.innerHTML = '<option value="" data-translate="select_exam">- Seleccionar -</option>';
        examSelect.disabled = true;
    }
}

function updateGradeMarkingExamSelect() {
    const subjectSelect = document.getElementById('gradeMarkingSubjectSelect');
    const examSelect = document.getElementById('gradeMarkingExamSelect');
    
    if (!subjectSelect || !examSelect) return;
    
    const selectedSubjectId = parseInt(subjectSelect.value);
    
    // Clear and populate exam filter
    examSelect.innerHTML = '<option value="" data-translate="select_exam">- Seleccionar -</option>';
    
    if (selectedSubjectId) {
        examSelect.disabled = false;
        
        // Filter evaluations by subject
        const subjectEvaluations = appData.evaluacion.filter(evaluation => 
            evaluation.Materia_ID_materia === selectedSubjectId
        );
        
        subjectEvaluations.forEach(evaluation => {
            const option = document.createElement('option');
            option.value = evaluation.ID_evaluacion;
            option.textContent = `${evaluation.Titulo} (${evaluation.Tipo})`;
            examSelect.appendChild(option);
        });
    } else {
        examSelect.disabled = true;
    }
}

function loadStudentsForGradeMarking() {
    const courseSelect = document.getElementById('gradeMarkingCourseSelect');
    const subjectSelect = document.getElementById('gradeMarkingSubjectSelect');
    const examSelect = document.getElementById('gradeMarkingExamSelect');
    const tableBody = document.getElementById('gradeMarkingTableBody');
    
    if (!courseSelect || !subjectSelect || !examSelect || !tableBody) return;
    
    const selectedCourse = courseSelect.value;
    const selectedSubjectId = parseInt(subjectSelect.value);
    const selectedExamId = parseInt(examSelect.value);
    
    if (!selectedCourse || !selectedSubjectId || !selectedExamId) {
        alert('Por favor seleccione un curso, materia y evaluación.');
        return;
    }
    
    const subject = appData.materia.find(s => s.ID_materia === selectedSubjectId);
    const exam = appData.evaluacion.find(e => e.ID_evaluacion === selectedExamId);
    
    if (!subject || !exam) {
        tableBody.innerHTML = '<tr><td colspan="4" class="text-center">Materia o evaluación no encontrada</td></tr>';
        return;
    }
    
    // Get students enrolled in this subject using the alumnos_x_materia table
    const enrolledStudentIds = appData.alumnos_x_materia
        .filter(enrollment => enrollment.Materia_ID_materia === selectedSubjectId)
        .map(enrollment => enrollment.Estudiante_ID_Estudiante);
    
    const enrolledStudents = appData.estudiante.filter(student => 
        enrolledStudentIds.includes(student.ID_Estudiante)
    );
    
    if (enrolledStudents.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="4" class="text-center">No hay estudiantes inscritos en esta materia</td></tr>';
        return;
    }
    
    tableBody.innerHTML = enrolledStudents.map(student => {
        // Get existing grade for this student and exam
        const existingGrade = appData.notas.find(grade => 
            grade.Estudiante_ID_Estudiante === student.ID_Estudiante && 
            grade.Evaluacion_ID_evaluacion === selectedExamId
        );
        
        const currentGrade = existingGrade ? existingGrade.Calificacion : '';
        
        return `
            <tr data-student-id="${student.ID_Estudiante}">
                <td class="student-id">${student.ID_Estudiante}</td>
                <td class="student-name">${student.Apellido}, ${student.Nombre}</td>
                <td class="grade-cell">
                    <input type="number" 
                           class="grade-input" 
                           min="0" 
                           max="10" 
                           step="0.1" 
                           value="${currentGrade}"
                           data-student-id="${student.ID_Estudiante}"
                           placeholder="0.0">
                </td>
                <td class="student-status">
                    <span class="status-badge ${existingGrade ? 'graded' : 'pending'}">
                        ${existingGrade ? 'Calificado' : 'Pendiente'}
                    </span>
                </td>
            </tr>
        `;
    }).join('');
}

function saveGradeMarkingBulk() {
    const courseSelect = document.getElementById('gradeMarkingCourseSelect');
    const subjectSelect = document.getElementById('gradeMarkingSubjectSelect');
    const examSelect = document.getElementById('gradeMarkingExamSelect');
    const notes = document.getElementById('gradeMarkingNotes').value;
    
    const selectedSubjectId = parseInt(subjectSelect.value);
    const selectedExamId = parseInt(examSelect.value);
    
    // Validation
    if (!selectedSubjectId || !selectedExamId) {
        alert('Por favor complete todos los campos requeridos.');
        return;
    }
    
    const tableRows = document.querySelectorAll('#gradeMarkingTableBody tr');
    let gradesSaved = 0;
    
    tableRows.forEach(row => {
        const studentId = parseInt(row.dataset.studentId);
        const gradeInput = row.querySelector('.grade-input');
        
        if (gradeInput && gradeInput.value !== '') {
            const grade = parseFloat(gradeInput.value);
            
            if (grade >= 0 && grade <= 10) {
                // Check if grade already exists
                const existingIndex = appData.notas.findIndex(gradeRecord => 
                    gradeRecord.Estudiante_ID_Estudiante === studentId && 
                    gradeRecord.Evaluacion_ID_evaluacion === selectedExamId
                );
                
                const gradeRecord = {
                    ID_Nota: existingIndex >= 0 ? appData.notas[existingIndex].ID_Nota : Date.now(),
                    Calificacion: grade,
                    Observacion: notes || '',
                    Fecha_calificacion: new Date().toISOString().split('T')[0],
                    Evaluacion_ID_evaluacion: selectedExamId,
                    Estudiante_ID_Estudiante: studentId,
                    Estado: 'DEFINITIVA'
                };
                
                if (existingIndex >= 0) {
                    appData.notas[existingIndex] = gradeRecord;
                } else {
                    appData.notas.push(gradeRecord);
                }
                
                gradesSaved++;
            }
        }
    });
    
    if (gradesSaved > 0) {
        saveData();
        hideGradeMarkingView();
        loadGradeMarkingRecords();
        updateDashboard();
        
        // Show success message
        showNotification(`Se guardaron ${gradesSaved} calificaciones exitosamente`, 'success');
    } else {
        alert('No se guardaron calificaciones. Verifique que haya ingresado al menos una calificación válida.');
    }
}

function loadGradeMarkingRecords() {
    const gradeMarkingList = document.getElementById('gradeMarkingList');
    
    if (!gradeMarkingList) return;

    // Clear previous content
    gradeMarkingList.innerHTML = '';

    // Group grades by exam for a more organized view
    const groupedGrades = appData.notas.reduce((acc, grade) => {
        const exam = appData.evaluacion.find(e => e.ID_evaluacion === grade.Evaluacion_ID_evaluacion);
        const subject = appData.materia.find(s => s.ID_materia === exam?.Materia_ID_materia);
        const student = appData.estudiante.find(s => s.ID_Estudiante === grade.Estudiante_ID_Estudiante);
        
        if (!exam || !subject || !student) return acc;
        
        const key = `${exam.ID_evaluacion}-${subject.ID_materia}`;
        if (!acc[key]) {
            acc[key] = {
                exam: exam,
                subject: subject,
                grades: []
            };
        }
        
        acc[key].grades.push({
            student: student,
            grade: grade
        });
        return acc;
    }, {});

    if (Object.keys(groupedGrades).length === 0) {
        gradeMarkingList.innerHTML = '<p data-translate="no_grade_records">No hay registros de calificaciones.</p>';
        return;
    }

    // Render grouped grades
    for (const key in groupedGrades) {
        const group = groupedGrades[key];
        const gradeCard = document.createElement('div');
        gradeCard.className = 'card grade-summary-card';
        gradeCard.innerHTML = `
            <div class="card-header">
                <h3 class="card-title">${group.subject.Nombre} - ${group.exam.Titulo}</h3>
                <span class="exam-type">${group.exam.Tipo}</span>
            </div>
            <div class="card-content">
                <p><strong>Fecha:</strong> ${group.exam.Fecha}</p>
                <p><strong>Calificaciones:</strong></p>
                <ul>
                    ${group.grades.map(g => `
                        <li>
                            ${g.student.Apellido}, ${g.student.Nombre}: 
                            <span class="grade-badge ${g.grade.Calificacion >= 7 ? 'excellent' : g.grade.Calificacion >= 4 ? 'good' : 'poor'}">
                                ${g.grade.Calificacion}
                            </span>
                            ${g.grade.Observacion ? `<br><small>Obs: ${g.grade.Observacion}</small>` : ''}
                        </li>
                    `).join('')}
                </ul>
            </div>
        `;
        gradeMarkingList.appendChild(gradeCard);
    }
}
