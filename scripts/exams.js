// Exam Management
function initializeExams() {
    const createExamBtn = document.getElementById('createExamBtn');
    const backToExamsBtn = document.getElementById('backToExamsBtn');
    
    if (createExamBtn) {
        createExamBtn.addEventListener('click', () => {
            showExamModal();
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
                        <button class="btn-icon btn-view" onclick="viewExamNotes(${exam.ID_evaluacion})" title="View Notes">
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
                                        <button class="btn-icon btn-view" onclick="viewExamNotes(${exam.ID_evaluacion})" title="View Notes">
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
