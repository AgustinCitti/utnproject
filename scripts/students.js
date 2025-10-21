// Student Management
function initializeStudents() {
    const addStudentBtn = document.getElementById('addStudentBtn');
    const studentModal = document.getElementById('studentModal');
    const studentForm = document.getElementById('studentForm');
    const courseFilter = document.getElementById('courseFilter');

    if (addStudentBtn) {
        addStudentBtn.addEventListener('click', () => {
            showModal('studentModal');
            clearStudentForm();
        });
    }

    if (studentForm) {
        studentForm.addEventListener('submit', (e) => {
            e.preventDefault();
            saveStudent();
        });
    }

    // Course filter functionality
    if (courseFilter) {
        courseFilter.addEventListener('change', () => {
            filterStudentsByCourse();
        });
    }

    // Modal close handlers
    setupModalHandlers('studentModal');
}

function loadStudents() {
    const studentsGrid = document.getElementById('studentsGrid');
    const studentsList = document.getElementById('studentsList');
    
    if (!studentsGrid || !studentsList) return;

    // Get filtered students
    const filteredStudents = getFilteredStudents();

    // Grid view
    studentsGrid.innerHTML = filteredStudents.map(student => `
        <div class="card">
            <div class="card-header">
                <h3 class="card-title">${student.firstName} ${student.lastName}</h3>
                <div class="card-actions">
                    <button class="btn-icon btn-edit" onclick="editStudent(${student.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon btn-delete" onclick="deleteStudent(${student.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            <div class="card-content">
                <p><strong>Email:</strong> ${student.email}</p>
                <p><strong>Student ID:</strong> ${student.studentId}</p>
                <p><strong>Course:</strong> ${student.course}</p>
                <p><strong>Status:</strong> <span class="status-${student.status}">${student.status}</span></p>
            </div>
        </div>
    `).join('');

    // List view - Table format
    studentsList.innerHTML = `
        <div class="table-responsive">
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>ID</th>
                        <th>Course</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${filteredStudents.map(student => `
                        <tr>
                            <td><strong>${student.firstName} ${student.lastName}</strong></td>
                            <td title="${student.email}">${student.email.length > 15 ? student.email.substring(0, 15) + '...' : student.email}</td>
                            <td>${student.studentId}</td>
                            <td>${student.course}</td>
                            <td><span class="table-status ${student.status}">${student.status}</span></td>
                            <td>
                                <div class="table-actions">
                                    <button class="btn-icon btn-edit" onclick="editStudent(${student.id})" title="Edit">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button class="btn-icon btn-delete" onclick="deleteStudent(${student.id})" title="Delete">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

function saveStudent() {
    const formData = {
        firstName: document.getElementById('studentFirstName').value,
        lastName: document.getElementById('studentLastName').value,
        email: document.getElementById('studentEmail').value,
        course: document.getElementById('studentCourse').value
    };

    const newStudent = {
        id: Date.now(),
        ...formData,
        studentId: `STU${String(Date.now()).slice(-3)}`,
        subjects: [],
        enrollmentDate: new Date().toISOString().split('T')[0],
        status: 'active'
    };

    appData.students.push(newStudent);
    saveData();
    closeModal('studentModal');
    loadStudents();
    updateDashboard();
}

function editStudent(id) {
    const student = appData.students.find(s => s.id === id);
    if (!student) return;

    document.getElementById('studentFirstName').value = student.firstName;
    document.getElementById('studentLastName').value = student.lastName;
    document.getElementById('studentEmail').value = student.email;
    document.getElementById('studentCourse').value = student.course;

    showModal('studentModal');
}

function deleteStudent(id) {
    if (confirm('Are you sure you want to delete this student?')) {
        appData.students = appData.students.filter(s => s.id !== id);
        saveData();
        loadStudents();
        updateDashboard();
    }
}

function clearStudentForm() {
    document.getElementById('studentForm').reset();
}

// Course filtering functions
function getFilteredStudents() {
    const courseFilter = document.getElementById('courseFilter');
    const selectedCourse = courseFilter ? courseFilter.value : '';
    
    if (!selectedCourse) {
        return appData.students;
    }
    
    return appData.students.filter(student => student.course === selectedCourse);
}

function filterStudentsByCourse() {
    loadStudents();
}
