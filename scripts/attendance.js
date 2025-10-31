// Attendance Management
function initializeAttendance() {
    const markAttendanceBtn = document.getElementById('markAttendanceBtn');
    const attendanceSubjectSelect = document.getElementById('attendanceSubjectSelect');
    const saveAttendanceBtn = document.getElementById('saveAttendanceBtn');
    const cancelAttendanceBtn = document.getElementById('cancelAttendanceBtn');
    const backAttendanceBtn = document.getElementById('backAttendanceBtn');
    
    if (markAttendanceBtn) {
        markAttendanceBtn.addEventListener('click', () => {
            showAttendanceView();
        });
    }
    
    // Attendance view filter
    if (attendanceSubjectSelect) {
        attendanceSubjectSelect.addEventListener('change', () => {
            loadStudentsForAttendanceView();
        });
    }
    
    if (saveAttendanceBtn) {
        saveAttendanceBtn.addEventListener('click', () => {
            saveAttendanceBulk();
        });
    }
    
    // Cancel button in the form (just hides the attendance view)
    if (cancelAttendanceBtn) {
        cancelAttendanceBtn.addEventListener('click', () => {
            hideAttendanceView();
        });
    }
    
    // Back button in header (navigates to student-management)
    if (backAttendanceBtn) {
        backAttendanceBtn.addEventListener('click', (e) => {
            e.preventDefault();
            // Navigate back to student-management section
            if (typeof window.showSection === 'function') {
                window.showSection('student-management', 'students');
            } else if (typeof showSection === 'function') {
                showSection('student-management', 'students');
            } else {
                // Fallback: direct navigation
                document.querySelectorAll('.content-section').forEach(section => {
                    section.classList.remove('active');
                });
                const studentSection = document.getElementById('student-management');
                if (studentSection) {
                    studentSection.classList.add('active');
                    // Also show students tab
                    const studentsContent = document.getElementById('studentsTabContent');
                    const examsContent = document.getElementById('examsTabContent');
                    if (studentsContent) studentsContent.classList.add('active');
                    if (examsContent) examsContent.classList.remove('active');
                    // Update tab buttons
                    const studentsTab = document.getElementById('studentsTab');
                    const examsTab = document.getElementById('examsTab');
                    if (studentsTab) studentsTab.classList.add('active');
                    if (examsTab) examsTab.classList.remove('active');
                    // Show/hide appropriate buttons
                    document.querySelectorAll('.students-only').forEach(btn => btn.style.display = 'flex');
                    document.querySelectorAll('.exams-only').forEach(btn => btn.style.display = 'none');
                    // Load student data
                    if (typeof loadUnifiedStudentData === 'function') {
                        loadUnifiedStudentData();
                    }
                }
            }
        });
    }
}

function loadAttendance() {
    const attendanceList = document.getElementById('attendanceList');
    
    if (!attendanceList) return;

    // Load attendance records
    attendanceList.innerHTML = `
        <div class="table-responsive">
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Estudiante</th>
                        <th>Materia</th>
                        <th>Fecha</th>
                        <th>Estado</th>
                        <th>Modalidad</th>
                        <th>Observaciones</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    ${appData.asistencia.map(attendance => {
                        const student = appData.estudiante.find(s => s.ID_Estudiante === attendance.Estudiante_ID_Estudiante);
                        const subject = appData.materia.find(s => s.ID_materia === attendance.Materia_ID_materia);
                        const shortDate = attendance.Fecha.split('-').slice(1).join('/');
                        const statusText = attendance.Presente === 'Y' ? 'present' : 'absent';
                        return `
                            <tr>
                                <td><strong>${student ? student.Apellido + ', ' + student.Nombre : 'Unknown'}</strong></td>
                                <td>${subject ? subject.Nombre : 'Unknown'}</td>
                                <td>${shortDate}</td>
                                <td><span class="table-status ${statusText}">${statusText}</span></td>
                                <td>N/A</td>
                                <td>${attendance.Observaciones || ''}</td>
                                <td>
                                    <div class="table-actions">
                                        <button class="btn-icon btn-edit" onclick="editAttendance(${attendance.id})" title="Edit">
                                            <i class="fas fa-edit"></i>
                                        </button>
                                        <button class="btn-icon btn-delete" onclick="deleteAttendance(${attendance.id})" title="Delete">
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

function showAttendanceView() {
    const attendanceView = document.getElementById('attendanceView');
    const attendanceList = document.getElementById('attendanceList');
    
    if (attendanceView) {
        attendanceView.style.display = 'block';
        attendanceList.style.display = 'none';
        
        // Set current date
        const dateInput = document.getElementById('attendanceDate');
        if (dateInput) {
            dateInput.value = new Date().toISOString().split('T')[0];
        }
        
        // Reset form
        document.getElementById('attendanceNotes').value = '';
        document.getElementById('attendanceSubjectSelect').value = '';
        
        // Populate materias from logged-in user
        populateAttendanceMateriaSelect();
        
        // Clear student table
        const tableBody = document.getElementById('attendanceTableBody');
        if (tableBody) {
            tableBody.innerHTML = '<tr><td colspan="6" class="text-center">Seleccione una materia para ver los estudiantes</td></tr>';
        }
    }
}

function hideAttendanceView() {
    const attendanceView = document.getElementById('attendanceView');
    const attendanceList = document.getElementById('attendanceList');
    
    if (attendanceView) {
        attendanceView.style.display = 'none';
        attendanceList.style.display = 'block';
    }
}

// Populate materia select with logged-in user's materias
function populateAttendanceMateriaSelect() {
    const subjectSelect = document.getElementById('attendanceSubjectSelect');
    if (!subjectSelect) return;
    
    // Get current user ID
    const currentUserId = localStorage.getItem('userId');
    if (!currentUserId) {
        subjectSelect.innerHTML = '<option value="" data-translate="select_subject">- Seleccionar -</option>';
        return;
    }
    
    // Get user's materias
    const userSubjects = appData.materia.filter(subject => 
        subject.Usuarios_docente_ID_docente === parseInt(currentUserId)
    );
    
    // Clear and populate subject filter
    subjectSelect.innerHTML = '<option value="" data-translate="select_subject">- Seleccionar -</option>';
    
    userSubjects.forEach(subject => {
        const option = document.createElement('option');
        option.value = subject.ID_materia;
        // Display materia name with curso and division info
        option.textContent = `${subject.Nombre} (${subject.Curso_division || ''})`;
        subjectSelect.appendChild(option);
    });
}

function loadStudentsForAttendanceView() {
    const subjectSelect = document.getElementById('attendanceSubjectSelect');
    const tableBody = document.getElementById('attendanceTableBody');
    
    if (!subjectSelect || !tableBody) return;
    
    const selectedSubjectId = parseInt(subjectSelect.value);
    
    if (!selectedSubjectId) {
        tableBody.innerHTML = '<tr><td colspan="6" class="text-center">Seleccione una materia para ver los estudiantes</td></tr>';
        return;
    }
    
    const subject = appData.materia.find(s => s.ID_materia === selectedSubjectId);
    if (!subject) {
        tableBody.innerHTML = '<tr><td colspan="6" class="text-center">Materia no encontrada</td></tr>';
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
        tableBody.innerHTML = '<tr><td colspan="6" class="text-center">No hay estudiantes inscritos en esta materia</td></tr>';
        return;
    }
    
    tableBody.innerHTML = enrolledStudents.map(student => {
        // Get existing attendance for this student, subject, and date
        const attendanceDate = document.getElementById('attendanceDate').value;
        const existingAttendance = appData.asistencia.find(att => 
            att.Estudiante_ID_Estudiante === student.ID_Estudiante && 
            att.Materia_ID_materia === selectedSubjectId && 
            att.Fecha === attendanceDate
        );
        
        // Calculate absences for this student
        const studentAbsences = appData.asistencia.filter(att => 
            att.Estudiante_ID_Estudiante === student.ID_Estudiante && 
            att.Materia_ID_materia === selectedSubjectId && 
            att.Presente === 'N'
        ).length;
        
        const currentStatus = existingAttendance ? (existingAttendance.Presente === 'Y' ? 'present' : 'absent') : '';
        
        return `
            <tr data-student-id="${student.ID_Estudiante}">
                <td class="student-id">${student.ID_Estudiante}</td>
                <td class="student-name">${student.Apellido}, ${student.Nombre}</td>
                <td class="status-cell">
                    <button class="status-btn present-btn ${currentStatus === 'present' ? 'active' : ''}" 
                            data-status="present" data-student-id="${student.ID_Estudiante}">
                        <i class="fas fa-check"></i>
                    </button>
                </td>
                <td class="status-cell">
                    <button class="status-btn absent-btn ${currentStatus === 'absent' ? 'active' : ''}" 
                            data-status="absent" data-student-id="${student.ID_Estudiante}">
                        <i class="fas fa-times"></i>
                    </button>
                </td>
                <td class="absences-count">${studentAbsences}/0</td>
                <td class="student-status">
                    <span class="status-badge habilitado">[Habilitado]</span>
                </td>
            </tr>
        `;
    }).join('');
    
    // Add event listeners to status buttons
    setupAttendanceStatusButtons();
}


function setupAttendanceStatusButtons() {
    const statusButtons = document.querySelectorAll('.status-btn');
    
    statusButtons.forEach(button => {
        button.addEventListener('click', function() {
            const studentId = parseInt(this.dataset.studentId);
            const status = this.dataset.status;
            const row = this.closest('tr');
            
            // Remove active class from all buttons in this row
            row.querySelectorAll('.status-btn').forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            this.classList.add('active');
            
            // Store the attendance status in the button's data attribute
            this.dataset.selected = 'true';
        });
    });
}

function saveAttendanceBulk() {
    const date = document.getElementById('attendanceDate').value;
    const subjectSelect = document.getElementById('attendanceSubjectSelect');
    const notes = document.getElementById('attendanceNotes').value;
    
    const selectedSubjectId = parseInt(subjectSelect.value);
    
    // Validation
    if (!date || !selectedSubjectId) {
        alert('Por favor complete todos los campos requeridos.');
        return;
    }
    
    const tableRows = document.querySelectorAll('#attendanceTableBody tr');
    let attendanceRecords = [];
    
    tableRows.forEach(row => {
        const studentId = parseInt(row.dataset.studentId);
        const activeButton = row.querySelector('.status-btn.active');
        
        if (activeButton) {
            const status = activeButton.dataset.status;
            
            // Convert status to database format (only Y/N according to schema)
            let presente = 'N';
            if (status === 'present') presente = 'Y';
            
            // Check if attendance already exists
            const existingIndex = appData.asistencia.findIndex(att => 
                att.Estudiante_ID_Estudiante === studentId && 
                att.Materia_ID_materia === selectedSubjectId && 
                att.Fecha === date
            );
    
            const attendanceRecord = {
                ID_Asistencia: existingIndex >= 0 ? appData.asistencia[existingIndex].ID_Asistencia : Date.now(),
                Estudiante_ID_Estudiante: studentId,
                Materia_ID_materia: selectedSubjectId,
                Fecha: date,
                Presente: presente,
                Observaciones: notes || ''
            };
        
            if (existingIndex >= 0) {
                appData.asistencia[existingIndex] = attendanceRecord;
            } else {
                appData.asistencia.push(attendanceRecord);
            }
        }
    });
    
    saveData();
    hideAttendanceView();
    loadAttendance();
    updateDashboard();
    
    // Show success message
    showNotification('Asistencia guardada exitosamente', 'success');
}

function editAttendance(attendanceId) {
    // Implementation for editing attendance
    console.log('Edit attendance:', attendanceId);
}

function deleteAttendance(attendanceId) {
    if (confirm('¿Está seguro de que desea eliminar este registro de asistencia?')) {
        appData.asistencia = appData.asistencia.filter(att => att.ID_Asistencia !== attendanceId);
        saveData();
        loadAttendance();
        updateDashboard();
    }
}

function loadAttendance() {
    const attendanceList = document.getElementById('attendanceList');
    
    if (!attendanceList) return;

    // Clear previous content
    attendanceList.innerHTML = '';

    // Get filtered attendance records
    const filteredAttendance = getFilteredAttendance();

    // Group attendance by date and subject for a more organized view
    const groupedAttendance = filteredAttendance.reduce((acc, att) => {
        const key = `${att.Fecha}-${att.Materia_ID_materia}`;
        if (!acc[key]) {
            acc[key] = {
                date: att.Fecha,
                subject: appData.materia.find(s => s.ID_materia === att.Materia_ID_materia)?.Nombre || 'Unknown Subject',
                students: []
            };
        }
        
        const student = appData.estudiante.find(s => s.ID_Estudiante === att.Estudiante_ID_Estudiante);
        const studentName = student ? `${student.Nombre} ${student.Apellido}` : 'Unknown Student';
        
        acc[key].students.push({
            studentName: studentName,
            status: att.Presente === 'Y' ? 'present' : 'absent',
            observaciones: att.Observaciones
        });
        return acc;
    }, {});

    if (Object.keys(groupedAttendance).length === 0) {
        attendanceList.innerHTML = '<p data-translate="no_attendance_records">No hay registros de asistencia.</p>';
        return;
    }

    // Render grouped attendance
    for (const key in groupedAttendance) {
        const group = groupedAttendance[key];
        const attendanceCard = document.createElement('div');
        attendanceCard.className = 'card attendance-summary-card';
        attendanceCard.innerHTML = `
            <div class="card-header">
                <h3 class="card-title">${group.subject} - ${group.date}</h3>
            </div>
            <div class="card-content">
                <p><strong>Estudiantes:</strong></p>
                <ul>
                    ${group.students.map(s => `
                        <li>
                            ${s.studentName}: <span class="status-badge ${s.status}">${s.status}</span>
                            ${s.observaciones ? `<br><small>Obs: ${s.observaciones}</small>` : ''}
                        </li>
                    `).join('')}
                </ul>
            </div>
        `;
        attendanceList.appendChild(attendanceCard);
    }
}

// Get filtered attendance for logged-in user
function getFilteredAttendance() {
    // Get current user ID
    const currentUserId = localStorage.getItem('userId');
    if (!currentUserId) {
        return [];
    }
    
    let filteredAttendance = appData.asistencia || [];
    
    // Filter by logged-in teacher (attendance for subjects taught by this teacher)
    const teacherId = parseInt(currentUserId);
    const teacherSubjects = appData.materia.filter(subject => 
        subject.Usuarios_docente_ID_docente === teacherId
    );
    const teacherSubjectIds = teacherSubjects.map(subject => subject.ID_materia);
    
    filteredAttendance = filteredAttendance.filter(attendance => 
        teacherSubjectIds.includes(attendance.Materia_ID_materia)
    );
    
    return filteredAttendance;
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        </div>
    `;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Show notification
    setTimeout(() => notification.classList.add('show'), 100);
    
    // Remove notification after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}