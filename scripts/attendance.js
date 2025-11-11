// Attendance Management

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
    
    // Attendance view filter - reload students when materia changes
    if (attendanceSubjectSelect) {
        attendanceSubjectSelect.addEventListener('change', () => {
            loadStudentsForAttendanceView();
        });
    }
    
    // Attendance date filter - reload students when date changes
    const attendanceDateInput = document.getElementById('attendanceDate');
    if (attendanceDateInput) {
        attendanceDateInput.addEventListener('change', () => {
            // Only reload if a materia is already selected
            if (attendanceSubjectSelect && attendanceSubjectSelect.value) {
                loadStudentsForAttendanceView();
            }
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
                        // Support both 'P' (new format) and 'Y' (old format for compatibility)
                        const statusText = (attendance.Presente === 'P' || attendance.Presente === 'Y') ? 'present' : 'absent';
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
    if (!subjectSelect) {
        console.warn('attendanceSubjectSelect element not found');
        return;
    }
    
    // Get current user ID
    const currentUserId = localStorage.getItem('userId');
    if (!currentUserId) {
        console.warn('No user ID found in localStorage');
        subjectSelect.innerHTML = '<option value="" data-translate="select_subject">- Seleccionar -</option>';
        return;
    }
    
    // Ensure appData.materia exists
    if (!appData || !appData.materia || !Array.isArray(appData.materia)) {
        console.warn('appData.materia is not available or not an array');
        subjectSelect.innerHTML = '<option value="" data-translate="select_subject">- Seleccionar -</option>';
        return;
    }
    
    // Get user's materias - filter by logged-in user's ID
    const userSubjects = appData.materia.filter(subject => 
        subject && subject.Usuarios_docente_ID_docente && 
        parseInt(subject.Usuarios_docente_ID_docente) === parseInt(currentUserId)
    );
    
    // Clear and populate subject filter
    subjectSelect.innerHTML = '<option value="" data-translate="select_subject">- Seleccionar -</option>';
    
    if (userSubjects.length === 0) {
        console.warn('No materias found for user ID:', currentUserId);
        const noMateriasOption = document.createElement('option');
        noMateriasOption.value = '';
        noMateriasOption.textContent = 'No hay materias disponibles';
        noMateriasOption.disabled = true;
        subjectSelect.appendChild(noMateriasOption);
        return;
    }
    
    userSubjects.forEach(subject => {
        const option = document.createElement('option');
        // Ensure ID_materia is converted to string for option value (HTML attributes are strings)
        option.value = String(subject.ID_materia || '');
        // Display materia name with curso and division info
        const displayText = subject.Curso_division 
            ? `${subject.Nombre} (${subject.Curso_division})`
            : subject.Nombre;
        option.textContent = displayText;
        subjectSelect.appendChild(option);
    });
}

function loadStudentsForAttendanceView() {
    const subjectSelect = document.getElementById('attendanceSubjectSelect');
    const tableBody = document.getElementById('attendanceTableBody');
    
    if (!subjectSelect || !tableBody) {
        console.warn('Required elements not found for loadStudentsForAttendanceView');
        return;
    }
    
    const selectedValue = subjectSelect.value;
    if (!selectedValue || selectedValue === '') {
        tableBody.innerHTML = '<tr><td colspan="6" class="text-center">Seleccione una materia para ver los estudiantes</td></tr>';
        return;
    }
    
    const selectedSubjectId = parseInt(selectedValue, 10);
    
    if (isNaN(selectedSubjectId)) {
        console.error('Invalid materia ID selected:', selectedValue);
        tableBody.innerHTML = '<tr><td colspan="6" class="text-center">Error: ID de materia inválido</td></tr>';
        return;
    }
    
    // Get current user ID and verify the materia belongs to the logged-in user
    const currentUserId = localStorage.getItem('userId');
    if (!currentUserId) {
        tableBody.innerHTML = '<tr><td colspan="6" class="text-center">No hay usuario logueado</td></tr>';
        return;
    }
    
    // Validate data structures exist
    if (!appData || !appData.materia || !Array.isArray(appData.materia)) {
        console.warn('appData.materia is not available or not an array');
        tableBody.innerHTML = '<tr><td colspan="6" class="text-center">Error: Datos no disponibles</td></tr>';
        return;
    }
    
    if (!appData.alumnos_x_materia || !Array.isArray(appData.alumnos_x_materia)) {
        console.warn('appData.alumnos_x_materia is not available or not an array');
        appData.alumnos_x_materia = [];
    }
    
    if (!appData.estudiante || !Array.isArray(appData.estudiante)) {
        console.warn('appData.estudiante is not available or not an array');
        appData.estudiante = [];
    }
    
    if (!appData.asistencia || !Array.isArray(appData.asistencia)) {
        appData.asistencia = [];
    }
    
    // Find the selected subject and verify it belongs to the logged-in user
    // Use parseInt on both sides to ensure proper comparison (ID_materia might be string or number)
    const subject = appData.materia.find(s => {
        if (!s || !s.ID_materia) return false;
        return parseInt(s.ID_materia, 10) === selectedSubjectId;
    });
    
    if (!subject) {
        console.warn('Materia not found:', {
            selectedSubjectId,
            selectedSubjectIdType: typeof selectedSubjectId,
            availableMaterias: appData.materia.map(m => ({
                id: m.ID_materia,
                idType: typeof m.ID_materia,
                nombre: m.Nombre,
                teacherId: m.Usuarios_docente_ID_docente
            })),
            currentUserId
        });
        tableBody.innerHTML = '<tr><td colspan="6" class="text-center">Materia no encontrada</td></tr>';
        return;
    }
    
    // Security check: Verify the materia belongs to the logged-in user
    const subjectTeacherId = subject.Usuarios_docente_ID_docente 
        ? parseInt(subject.Usuarios_docente_ID_docente, 10) 
        : null;
    const currentUserIdInt = parseInt(currentUserId, 10);
    
    if (!subjectTeacherId || subjectTeacherId !== currentUserIdInt) {
        console.warn('Attempted to access materia that does not belong to logged-in user', {
            subjectTeacherId,
            currentUserIdInt,
            subjectId: subject.ID_materia,
            subjectName: subject.Nombre
        });
        tableBody.innerHTML = '<tr><td colspan="6" class="text-center">No tiene permiso para acceder a esta materia</td></tr>';
        return;
    }
    
    // Get students enrolled in this subject using the alumnos_x_materia table
    const enrolledStudentIds = appData.alumnos_x_materia
        .filter(enrollment => 
            enrollment && 
            enrollment.Materia_ID_materia !== null && 
            enrollment.Materia_ID_materia !== undefined &&
            parseInt(enrollment.Materia_ID_materia, 10) === selectedSubjectId
        )
        .map(enrollment => enrollment.Estudiante_ID_Estudiante)
        .filter(id => id !== null && id !== undefined);
    
    // Filter students by enrolled IDs and ensure they exist in the estudiantes array
    let enrolledStudents = appData.estudiante.filter(student => 
        student && 
        student.ID_Estudiante && 
        enrolledStudentIds.includes(student.ID_Estudiante)
    );
    
    // Sort students by last name, then first name
    enrolledStudents.sort((a, b) => {
        const lastNameA = (a.Apellido || '').toLowerCase();
        const lastNameB = (b.Apellido || '').toLowerCase();
        if (lastNameA !== lastNameB) {
            return lastNameA.localeCompare(lastNameB);
        }
        const firstNameA = (a.Nombre || '').toLowerCase();
        const firstNameB = (b.Nombre || '').toLowerCase();
        return firstNameA.localeCompare(firstNameB);
    });
            
    if (enrolledStudents.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="6" class="text-center">No hay estudiantes inscritos en esta materia</td></tr>';
        return;
    }
    
    // Get attendance date
    const attendanceDateInput = document.getElementById('attendanceDate');
    const attendanceDate = attendanceDateInput ? attendanceDateInput.value : '';
    
    tableBody.innerHTML = enrolledStudents.map(student => {
        // Get existing attendance for this student, subject, and date
        const existingAttendance = attendanceDate 
            ? appData.asistencia.find(att => 
                att &&
                att.Estudiante_ID_Estudiante === student.ID_Estudiante && 
                att.Materia_ID_materia === selectedSubjectId && 
                att.Fecha === attendanceDate
            )
            : null;
        
        // Calculate total absences for this student in this materia
        const studentAbsences = appData.asistencia.filter(att => 
            att &&
            att.Estudiante_ID_Estudiante === student.ID_Estudiante && 
            att.Materia_ID_materia === selectedSubjectId && 
            (att.Presente === 'A' || att.Presente === 'N')
        ).length;
        
        // Calculate total attendance records for this student in this materia
        const totalAttendanceRecords = appData.asistencia.filter(att => 
            att &&
            att.Estudiante_ID_Estudiante === student.ID_Estudiante && 
            att.Materia_ID_materia === selectedSubjectId
        ).length;
        
        // Support both 'P' (new format) and 'Y' (old format for compatibility)
        const currentStatus = existingAttendance ? ((existingAttendance.Presente === 'P' || existingAttendance.Presente === 'Y') ? 'present' : 'absent') : '';
        
        return `
            <tr data-student-id="${student.ID_Estudiante}">
                <td class="student-id">${student.ID_Estudiante || ''}</td>
                <td class="student-name">${(student.Apellido || '')}, ${(student.Nombre || '')}</td>
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
                <td class="absences-count">${studentAbsences}/${totalAttendanceRecords}</td>
                <td class="student-status">
                    <span class="status-badge">${getStudentDisplayEstado(student)}</span>
                </td>
            </tr>
        `;
    }).join('');
    
    // Add event listeners to status buttons
    setupAttendanceStatusButtons();
}


function setupAttendanceStatusButtons() {
    const statusButtons = document.querySelectorAll('.status-btn');
    
    // Remove old event listeners by cloning and replacing
    statusButtons.forEach(button => {
        // Remove any existing listeners by replacing the button
        const newButton = button.cloneNode(true);
        button.parentNode.replaceChild(newButton, button);
    });
    
    // Re-query to get the new buttons
    const newStatusButtons = document.querySelectorAll('.status-btn');
    
    newStatusButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const studentId = parseInt(this.dataset.studentId);
            const status = this.dataset.status;
            const row = this.closest('tr');
            
            if (!row) {
                console.error('Could not find row for button:', this);
                return;
            }
            
            console.log(`Button clicked for student ${studentId}, status: ${status}`);
            
            // Remove active class from all buttons in this row
            row.querySelectorAll('.status-btn').forEach(btn => {
                btn.classList.remove('active');
                btn.removeAttribute('data-selected');
            });
            
            // Add active class to clicked button
            this.classList.add('active');
            this.setAttribute('data-selected', 'true');
            
            console.log(`Student ${studentId} marked as ${status}`, {
                activeButton: this,
                hasActiveClass: this.classList.contains('active'),
                rowButtons: row.querySelectorAll('.status-btn').length
            });
        });
    });
    
    console.log(`Setup ${newStatusButtons.length} attendance status buttons`);
}

async function saveAttendanceBulk() {
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
    const attendanceRecords = [];
    
    // Recopilar todos los registros de asistencia
    tableRows.forEach(row => {
        const studentId = parseInt(row.dataset.studentId);
        if (!studentId || isNaN(studentId)) {
            console.warn('Skipping row with invalid student ID:', row);
            return;
        }
        
        // Find which button is active (present or absent)
        const presentButton = row.querySelector('.status-btn.present-btn');
        const absentButton = row.querySelector('.status-btn.absent-btn');
        const activeButton = row.querySelector('.status-btn.active');
        
        // Determine the status
        // Database uses: P=Presente, A=Ausente, J=Justificado
        let presente = 'A'; // Default to absent
        if (activeButton) {
            const status = activeButton.dataset.status;
            if (status === 'present') {
                presente = 'P'; // P for Presente
            } else if (status === 'absent') {
                presente = 'A'; // A for Ausente
            }
        } else {
            // If no button is active, check if present button has active class (might be CSS issue)
            if (presentButton && presentButton.classList.contains('active')) {
                presente = 'P';
            } else if (absentButton && absentButton.classList.contains('active')) {
                presente = 'A';
            } else {
                // No button selected - skip this student (don't save unmarked attendance)
                console.log(`Skipping student ${studentId} - no attendance status selected`);
                return;
            }
        }
        
        console.log(`Saving attendance for student ${studentId}:`, {
            studentId: studentId,
            status: activeButton ? activeButton.dataset.status : 'none',
            presente: presente,
            hasActiveButton: !!activeButton
        });
        
        attendanceRecords.push({
            Estudiante_ID_Estudiante: studentId,
            Materia_ID_materia: selectedSubjectId,
            Fecha: date,
            Presente: presente,
            Observaciones: notes || null
        });
    });
    
    console.log('Total attendance records to save:', attendanceRecords.length, attendanceRecords);
    
    if (attendanceRecords.length === 0) {
        alert('Debe marcar al menos un estudiante (presente o ausente).');
        return;
    }
    
    // Determinar la URL base según desde dónde se carga
    const isInPages = window.location.pathname.includes('/pages/');
    const baseUrl = isInPages ? '../api' : 'api';
    
    try {
        let saved = 0;
        let failed = 0;
        
        // Guardar cada registro de asistencia
        console.log('Guardando asistencia - Total registros:', attendanceRecords.length);
        console.log('Registros a guardar:', attendanceRecords);
        
        for (const record of attendanceRecords) {
            try {
                console.log(`Enviando asistencia para estudiante ${record.Estudiante_ID_Estudiante}:`, record);
                
                const response = await fetch(`${baseUrl}/asistencia.php`, {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify(record)
                });
                
                console.log(`Response status para estudiante ${record.Estudiante_ID_Estudiante}:`, response.status);
                
                const result = await response.json();
                console.log(`Response result para estudiante ${record.Estudiante_ID_Estudiante}:`, result);
                
                if (response.ok && result.success !== false) {
                    saved++;
                    console.log(`✓ Asistencia guardada para estudiante ${record.Estudiante_ID_Estudiante}`);
                } else {
                    failed++;
                    console.error(`✗ Error guardando asistencia para estudiante ${record.Estudiante_ID_Estudiante}:`, result);
                    alert(`Error para estudiante ${record.Estudiante_ID_Estudiante}: ${result.message || 'Error desconocido'}`);
                }
            } catch (error) {
                failed++;
                console.error(`✗ Excepción guardando asistencia para estudiante ${record.Estudiante_ID_Estudiante}:`, error);
                alert(`Error de red para estudiante ${record.Estudiante_ID_Estudiante}: ${error.message}`);
            }
        }
        
        if (saved > 0) {
            // Recargar datos desde el servidor
            await loadData();
            
            // Repopulate materia select after data refresh
            populateAttendanceMateriaSelect();
            
            hideAttendanceView();
            loadAttendance();
            
            // Actualizar dashboard si existe la función
            if (typeof updateDashboard === 'function') {
                updateDashboard();
            }
            
            // Recargar vista de estudiantes si existe
            if (typeof loadUnifiedStudentData === 'function') {
                loadUnifiedStudentData();
            }
            
            // Refresh reports if currently visible
            const reportsSection = document.getElementById('reports');
            if (reportsSection && reportsSection.style.display !== 'none') {
                // Refresh reports charts with new data
                if (typeof refreshReports === 'function') {
                    refreshReports();
                } else if (typeof initializeCharts === 'function') {
                    initializeCharts();
                    if (typeof generateDetailedReports === 'function') {
                        generateDetailedReports();
                    }
                }
            }
            
            // Mostrar mensaje de éxito
            const message = failed > 0 
                ? `Se guardaron ${saved} registro(s) de asistencia. ${failed} fallaron.` 
                : `Se guardaron ${saved} registro(s) de asistencia exitosamente.`;
            
            if (typeof showNotification === 'function') {
                showNotification(message, 'success');
            } else {
                alert(message);
            }
        } else {
            throw new Error('No se pudo guardar ninguna asistencia');
        }
    } catch (error) {
        console.error('Error al guardar asistencia:', error);
        alert('Error al guardar la asistencia: ' + error.message);
    }
}

async function editAttendance(attendanceId) {
    // Buscar el registro de asistencia
    const attendance = appData.asistencia.find(a => a.ID_Asistencia === attendanceId);
    if (!attendance) {
        alert('Registro de asistencia no encontrado');
        return;
    }
    
    // Mostrar modal o formulario para editar
    const newPresente = prompt('Estado de asistencia (Y=Presente, N=Ausente, J=Justificado):', attendance.Presente || 'Y');
    if (newPresente === null) return;
    
    const newObservaciones = prompt('Observaciones:', attendance.Observaciones || '');
    if (newObservaciones === null) return;
    
    const isInPages = window.location.pathname.includes('/pages/');
    const baseUrl = isInPages ? '../api' : 'api';
    
    try {
        const response = await fetch(`${baseUrl}/asistencia.php?id=${attendanceId}`, {
            method: 'PUT',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                Presente: newPresente.toUpperCase(),
                Observaciones: newObservaciones
            })
        });
        
        const result = await response.json();
        
        if (response.ok && result.success !== false) {
            // Recargar datos desde el servidor
            await loadData();
            
            // Repopulate materia select after data refresh
            populateAttendanceMateriaSelect();
            
            loadAttendance();
            
            if (typeof showNotification === 'function') {
                showNotification('Asistencia actualizada exitosamente', 'success');
            } else {
                alert('Asistencia actualizada exitosamente');
            }
        } else {
            throw new Error(result.message || 'Error al actualizar la asistencia');
        }
    } catch (error) {
        console.error('Error al actualizar asistencia:', error);
        alert('Error al actualizar la asistencia: ' + error.message);
    }
}

async function deleteAttendance(attendanceId) {
    if (!confirm('¿Está seguro de que desea eliminar este registro de asistencia?')) {
        return;
    }
    
    const isInPages = window.location.pathname.includes('/pages/');
    const baseUrl = isInPages ? '../api' : 'api';
    
    try {
        const response = await fetch(`${baseUrl}/asistencia.php?id=${attendanceId}`, {
            method: 'DELETE',
            credentials: 'include',
            headers: {
                'Accept': 'application/json'
            }
        });
        
        const result = await response.json();
        
        if (response.ok && result.success !== false) {
            // Recargar datos desde el servidor
            await loadData();
            
            // Repopulate materia select after data refresh
            populateAttendanceMateriaSelect();
            
            loadAttendance();
            
            if (typeof updateDashboard === 'function') {
                updateDashboard();
            }
            
            if (typeof loadUnifiedStudentData === 'function') {
                loadUnifiedStudentData();
            }
            
            if (typeof showNotification === 'function') {
                showNotification('Asistencia eliminada exitosamente', 'success');
            } else {
                alert('Asistencia eliminada exitosamente');
            }
        } else {
            throw new Error(result.message || 'Error al eliminar la asistencia');
        }
    } catch (error) {
        console.error('Error al eliminar asistencia:', error);
        alert('Error al eliminar la asistencia: ' + error.message);
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
            // Support both 'P' (new format) and 'Y' (old format for compatibility)
            status: (att.Presente === 'P' || att.Presente === 'Y') ? 'present' : 'absent',
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