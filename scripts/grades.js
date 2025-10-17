// Grade Management
function initializeGrades() {
    const addGradeBtn = document.getElementById('addGradeBtn');
    const gradeModal = document.getElementById('gradeModal');
    const gradeForm = document.getElementById('gradeForm');

    if (addGradeBtn) {
        addGradeBtn.addEventListener('click', () => {
            showModal('gradeModal');
            populateGradeForm();
        });
    }

    if (gradeForm) {
        gradeForm.addEventListener('submit', (e) => {
            e.preventDefault();
            saveGrade();
        });
    }

    setupModalHandlers('gradeModal');
}

function loadGrades() {
    const gradesContainer = document.getElementById('gradesContainer');
    const gradesList = document.getElementById('gradesList');
    
    if (!gradesContainer || !gradesList) return;

    // Grid view
    gradesContainer.innerHTML = appData.grades.map(grade => {
        const student = appData.students.find(s => s.id === grade.studentId);
        const subject = appData.subjects.find(s => s.id === grade.subjectId);
        return `
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">${student ? student.firstName + ' ' + student.lastName : 'Unknown Student'}</h3>
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
                    <p><strong>Subject:</strong> ${subject ? subject.name : 'Unknown Subject'}</p>
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
                    ${appData.grades.map(grade => {
                        const student = appData.students.find(s => s.id === grade.studentId);
                        const subject = appData.subjects.find(s => s.id === grade.subjectId);
                        const gradeClass = grade.grade >= 80 ? 'grade-excellent' : grade.grade >= 60 ? 'grade-good' : 'grade-poor';
                        const shortDate = grade.date.split('-').slice(1).join('/');
                        return `
                            <tr>
                                <td><strong>${student ? student.firstName + ' ' + student.lastName : 'Unknown'}</strong></td>
                                <td>${subject ? subject.name : 'Unknown'}</td>
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

    // Populate students
    studentSelect.innerHTML = appData.students.map(student => 
        `<option value="${student.id}">${student.firstName} ${student.lastName}</option>`
    ).join('');

    // Populate subjects
    subjectSelect.innerHTML = appData.subjects.map(subject => 
        `<option value="${subject.id}">${subject.name}</option>`
    ).join('');
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

    populateGradeForm();
    document.getElementById('gradeStudent').value = grade.studentId;
    document.getElementById('gradeSubject').value = grade.subjectId;
    document.getElementById('gradeValue').value = grade.grade;
    document.getElementById('gradeType').value = grade.type;
    document.getElementById('gradeDescription').value = grade.description || '';

    showModal('gradeModal');
}

function deleteGrade(id) {
    if (confirm('Are you sure you want to delete this grade?')) {
        appData.grades = appData.grades.filter(g => g.id !== id);
        saveData();
        loadGrades();
        updateDashboard();
    }
}
