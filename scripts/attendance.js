// Attendance Management
function initializeAttendance() {
    const markAttendanceBtn = document.getElementById('markAttendanceBtn');
    const attendanceTeacherFilter = document.getElementById('attendanceTeacherFilter');
    const attendanceCourseFilter = document.getElementById('attendanceCourseFilter');
    const attendanceSubjectFilter = document.getElementById('attendanceSubjectFilter');
    const attendanceCourseSelect = document.getElementById('attendanceCourseSelect');
    const attendanceSubjectSelect = document.getElementById('attendanceSubjectSelect');
    const saveAttendanceBtn = document.getElementById('saveAttendanceBtn');
    const cancelAttendanceBtn = document.getElementById('cancelAttendanceBtn');
    
    if (markAttendanceBtn) {
        markAttendanceBtn.addEventListener('click', () => {
            showAttendanceView();
        });
    }
    
    // Main attendance section filters
    if (attendanceTeacherFilter) {
        attendanceTeacherFilter.addEventListener('change', () => {
            filterAttendanceByTeacher();
        });
    }
    
    if (attendanceCourseFilter) {
        attendanceCourseFilter.addEventListener('change', () => {
            updateSubjectFilter();
        });
    }
    
    if (attendanceSubjectFilter) {
        attendanceSubjectFilter.addEventListener('change', () => {
            loadStudentsForAttendance();
        });
    }
    
    // Attendance view filters
    if (attendanceCourseSelect) {
        attendanceCourseSelect.addEventListener('change', () => {
            updateAttendanceSubjectFilter();
        });
    }
    
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
    
    if (cancelAttendanceBtn) {
        cancelAttendanceBtn.addEventListener('click', () => {
            hideAttendanceView();
        });
    }
    
    // Initialize teacher filter
    populateAttendanceTeacherFilter();
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
        document.getElementById('attendanceCourseSelect').value = '';
        document.getElementById('attendanceSubjectSelect').value = '';
        document.getElementById('attendanceSubjectSelect').disabled = true;
        
        // Clear student table
        const tableBody = document.getElementById('attendanceTableBody');
        if (tableBody) {
            tableBody.innerHTML = '<tr><td colspan="6" class="text-center">Seleccione un curso y materia para ver los estudiantes</td></tr>';
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

function updateSubjectFilter() {
    const courseFilter = document.getElementById('attendanceCourseFilter');
    const subjectFilter = document.getElementById('attendanceSubjectFilter');
    
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

function updateAttendanceSubjectFilter() {
    const courseSelect = document.getElementById('attendanceCourseSelect');
    const subjectSelect = document.getElementById('attendanceSubjectSelect');
    
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
}

function loadStudentsForAttendanceView() {
    const courseSelect = document.getElementById('attendanceCourseSelect');
    const subjectSelect = document.getElementById('attendanceSubjectSelect');
    const tableBody = document.getElementById('attendanceTableBody');
    
    if (!courseSelect || !subjectSelect || !tableBody) return;
    
    const selectedCourse = courseSelect.value;
    const selectedSubjectId = parseInt(subjectSelect.value);
    
    if (!selectedCourse || !selectedSubjectId) {
        alert('Por favor seleccione un curso y una materia.');
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

function loadStudentsForAttendance() {
    const courseFilter = document.getElementById('attendanceCourseFilter');
    const subjectFilter = document.getElementById('attendanceSubjectFilter');
    const tableBody = document.getElementById('attendanceTableBody');
    
    if (!courseFilter || !subjectFilter || !tableBody) return;
    
    const selectedCourse = courseFilter.value;
    const selectedSubjectId = parseInt(subjectFilter.value);
    
    if (!selectedCourse || !selectedSubjectId) {
        tableBody.innerHTML = '<tr><td colspan="8" class="text-center">Seleccione un curso y materia para ver los estudiantes</td></tr>';
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
        tableBody.innerHTML = '<tr><td colspan="6" class="text-center">No hay estudiantes en este curso</td></tr>';
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
    const courseSelect = document.getElementById('attendanceCourseSelect');
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

// Teacher filtering functions for attendance
function populateAttendanceTeacherFilter() {
    const teacherFilter = document.getElementById('attendanceTeacherFilter');
    if (!teacherFilter) return;

    // Get current user ID from localStorage
    const currentUserId = localStorage.getItem('userId');
    
    // Clear existing options except the first one
    teacherFilter.innerHTML = '<option value="" data-translate="all_teachers">Todos los Profesores</option>';
    
    // Add all teachers to the filter
    if (appData.usuarios_docente) {
        appData.usuarios_docente.forEach(teacher => {
            const option = document.createElement('option');
            option.value = teacher.ID_docente;
            option.textContent = `${teacher.Nombre_docente} ${teacher.Apellido_docente}`;
            teacherFilter.appendChild(option);
        });
    }
    
    // If current user is a teacher, set the filter to show only their attendance by default
    if (currentUserId) {
        teacherFilter.value = currentUserId;
        // Trigger filter update
        filterAttendanceByTeacher();
    }
}

function getFilteredAttendance() {
    const teacherFilter = document.getElementById('attendanceTeacherFilter');
    const selectedTeacher = teacherFilter ? teacherFilter.value : '';
    
    let filteredAttendance = appData.asistencia || [];
    
    // Filter by teacher (attendance for subjects taught by this teacher)
    if (selectedTeacher) {
        const teacherId = parseInt(selectedTeacher);
        const teacherSubjects = appData.materia.filter(subject => subject.Usuarios_docente_ID_docente === teacherId);
        const teacherSubjectIds = teacherSubjects.map(subject => subject.ID_materia);
        
        filteredAttendance = filteredAttendance.filter(attendance => 
            teacherSubjectIds.includes(attendance.Materia_ID_materia)
        );
    }
    
    return filteredAttendance;
}

function filterAttendanceByTeacher() {
    loadAttendance();
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