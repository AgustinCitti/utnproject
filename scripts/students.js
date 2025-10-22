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
                <h3 class="card-title">${student.Nombre} ${student.Apellido}</h3>
                <div class="card-actions">
                    <button class="btn-icon btn-edit" onclick="editStudent(${student.ID_Estudiante})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon btn-delete" onclick="deleteStudent(${student.ID_Estudiante})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            <div class="card-content">
                <p><strong>Email:</strong> ${student.Email}</p>
                <p><strong>Student ID:</strong> ${student.ID_Estudiante}</p>
                <p><strong>Birth Date:</strong> ${student.Fecha_nacimiento}</p>
                <p><strong>Status:</strong> <span class="status-${student.Estado.toLowerCase()}">${student.Estado}</span></p>
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
                            <td><strong>${student.Nombre} ${student.Apellido}</strong></td>
                            <td title="${student.Email}">${student.Email.length > 15 ? student.Email.substring(0, 15) + '...' : student.Email}</td>
                            <td>${student.ID_Estudiante}</td>
                            <td>${student.Fecha_nacimiento}</td>
                            <td><span class="table-status ${student.Estado.toLowerCase()}">${student.Estado}</span></td>
                            <td>
                                <div class="table-actions">
                                    <button class="btn-icon btn-edit" onclick="editStudent(${student.ID_Estudiante})" title="Edit">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button class="btn-icon btn-delete" onclick="deleteStudent(${student.ID_Estudiante})" title="Delete">
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
        ID_Estudiante: Date.now(),
        Nombre: formData.firstName,
        Apellido: formData.lastName,
        Email: formData.email,
        Fecha_nacimiento: new Date().toISOString().split('T')[0],
        Estado: 'ACTIVO'
    };

    appData.estudiante.push(newStudent);
    saveData();
    closeModal('studentModal');
    loadStudents();
    updateDashboard();
}

function editStudent(id) {
    const student = appData.estudiante.find(s => s.ID_Estudiante === id);
    if (!student) return;

    document.getElementById('studentFirstName').value = student.Nombre;
    document.getElementById('studentLastName').value = student.Apellido;
    document.getElementById('studentEmail').value = student.Email;
    document.getElementById('studentCourse').value = student.Fecha_nacimiento;

    showModal('studentModal');
}

function deleteStudent(id) {
    if (confirm('Are you sure you want to delete this student?')) {
        appData.estudiante = appData.estudiante.filter(s => s.ID_Estudiante !== id);
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
        return appData.estudiante;
    }
    
    return appData.estudiante.filter(student => student.Fecha_nacimiento === selectedCourse);
}

function filterStudentsByCourse() {
    loadStudents();
}
