// Attendance Management
function initializeAttendance() {
    const markAttendanceBtn = document.getElementById('markAttendanceBtn');
    
    if (markAttendanceBtn) {
        markAttendanceBtn.addEventListener('click', () => {
            showAttendanceModal();
        });
    }
}

function loadAttendance() {
    const attendanceContainer = document.getElementById('attendanceContainer');
    const attendanceList = document.getElementById('attendanceList');
    
    if (!attendanceContainer || !attendanceList) return;

    // Grid view
    attendanceContainer.innerHTML = appData.attendance.map(attendance => {
        const student = appData.students.find(s => s.id === attendance.studentId);
        const subject = appData.subjects.find(s => s.id === attendance.subjectId);
        return `
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">${student ? student.firstName + ' ' + student.lastName : 'Unknown Student'}</h3>
                    <span class="status-${attendance.status}">${attendance.status}</span>
                </div>
                <div class="card-content">
                    <p><strong>Subject:</strong> ${subject ? subject.name : 'Unknown Subject'}</p>
                    <p><strong>Date:</strong> ${attendance.date}</p>
                    ${attendance.notes ? `<p><strong>Notes:</strong> ${attendance.notes}</p>` : ''}
                </div>
            </div>
        `;
    }).join('');

    // List view - Table format
    attendanceList.innerHTML = `
        <div class="table-responsive">
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Student</th>
                        <th>Subject</th>
                        <th>Date</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${appData.attendance.map(attendance => {
                        const student = appData.students.find(s => s.id === attendance.studentId);
                        const subject = appData.subjects.find(s => s.id === attendance.subjectId);
                        const shortDate = attendance.date.split('-').slice(1).join('/');
                        return `
                            <tr>
                                <td><strong>${student ? student.firstName + ' ' + student.lastName : 'Unknown'}</strong></td>
                                <td>${subject ? subject.name : 'Unknown'}</td>
                                <td>${shortDate}</td>
                                <td><span class="table-status ${attendance.status}">${attendance.status}</span></td>
                                <td>
                                    <div class="table-actions">
                                        <button class="btn-icon btn-edit" title="Edit">
                                            <i class="fas fa-edit"></i>
                                        </button>
                                        <button class="btn-icon btn-delete" title="Delete">
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

function showAttendanceModal() {
    // Create a simple attendance marking interface
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Mark Attendance</h3>
                <button class="close-modal">&times;</button>
            </div>
            <div class="modal-form">
                <div class="form-group">
                    <label for="attendanceDate">Date</label>
                    <input type="date" id="attendanceDate" value="${new Date().toISOString().split('T')[0]}">
                </div>
                <div class="form-group">
                    <label for="attendanceSubject">Course/Subject *</label>
                    <select id="attendanceSubject" required>
                        <option value="">Select a course...</option>
                        ${appData.subjects.map(s => `<option value="${s.id}">${s.name}</option>`).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label for="attendanceStudent">Student *</label>
                    <select id="attendanceStudent" required disabled>
                        <option value="">First select a course...</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="attendanceStatus">Attendance Status *</label>
                    <select id="attendanceStatus" required disabled>
                        <option value="">Select student first...</option>
                        <option value="present">Present</option>
                        <option value="absent">Absent</option>
                        <option value="late">Late</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="attendanceNotes">Notes (Optional)</label>
                    <textarea id="attendanceNotes" placeholder="Add any notes about the attendance..."></textarea>
                </div>
                <div class="form-actions">
                    <button type="button" class="btn-secondary close-modal">Cancel</button>
                    <button type="button" class="btn-primary" onclick="saveAttendance()" disabled id="saveAttendanceBtn">Save Attendance</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    setupModalHandlers(modal);
    setupAttendanceModalHandlers();
}

function setupAttendanceModalHandlers() {
    const subjectSelect = document.getElementById('attendanceSubject');
    const studentSelect = document.getElementById('attendanceStudent');
    const statusSelect = document.getElementById('attendanceStatus');
    const saveBtn = document.getElementById('saveAttendanceBtn');
    
    // Handle course selection
    subjectSelect.addEventListener('change', function() {
        const selectedSubjectId = parseInt(this.value);
        
        if (selectedSubjectId) {
            // Enable student selection and populate with students enrolled in this course
            studentSelect.disabled = false;
            studentSelect.innerHTML = '<option value="">Select a student...</option>';
            
            // Get students enrolled in this subject
            const enrolledStudents = appData.students.filter(student => 
                student.subjects && student.subjects.includes(
                    appData.subjects.find(s => s.id === selectedSubjectId)?.name
                )
            );
            
            enrolledStudents.forEach(student => {
                const option = document.createElement('option');
                option.value = student.id;
                option.textContent = `${student.firstName} ${student.lastName}`;
                studentSelect.appendChild(option);
            });
            
            if (enrolledStudents.length === 0) {
                studentSelect.innerHTML = '<option value="">No students enrolled in this course</option>';
                studentSelect.disabled = true;
            }
        } else {
            // Reset student selection
            studentSelect.disabled = true;
            studentSelect.innerHTML = '<option value="">First select a course...</option>';
            statusSelect.disabled = true;
            statusSelect.innerHTML = '<option value="">Select student first...</option>';
            saveBtn.disabled = true;
        }
    });
    
    // Handle student selection
    studentSelect.addEventListener('change', function() {
        const selectedStudentId = parseInt(this.value);
        
        if (selectedStudentId) {
            statusSelect.disabled = false;
            statusSelect.innerHTML = `
                <option value="">Select status...</option>
                <option value="present">Present</option>
                <option value="absent">Absent</option>
                <option value="late">Late</option>
            `;
        } else {
            statusSelect.disabled = true;
            statusSelect.innerHTML = '<option value="">Select student first...</option>';
            saveBtn.disabled = true;
        }
    });
    
    // Handle status selection
    statusSelect.addEventListener('change', function() {
        const selectedStatus = this.value;
        
        if (selectedStatus) {
            saveBtn.disabled = false;
        } else {
            saveBtn.disabled = true;
        }
    });
}

function saveAttendance() {
    const date = document.getElementById('attendanceDate').value;
    const subjectId = parseInt(document.getElementById('attendanceSubject').value);
    const studentId = parseInt(document.getElementById('attendanceStudent').value);
    const status = document.getElementById('attendanceStatus').value;
    const notes = document.getElementById('attendanceNotes').value;
    
    // Validation
    if (!date || !subjectId || !studentId || !status) {
        alert('Please fill in all required fields.');
        return;
    }
    
    // Check if attendance already exists for this student, subject, and date
    const existingAttendance = appData.attendance.find(att => 
        att.studentId === studentId && 
        att.subjectId === subjectId && 
        att.date === date
    );
    
    if (existingAttendance) {
        if (confirm('Attendance already exists for this student, subject, and date. Do you want to update it?')) {
            existingAttendance.status = status;
            existingAttendance.notes = notes;
        } else {
            return;
        }
    } else {
        const newAttendance = {
            id: Date.now() + Math.random(),
            studentId,
            subjectId,
            date,
            status,
            notes: notes || ''
        };
        
        appData.attendance.push(newAttendance);
    }
    
    saveData();
    closeModal(document.querySelector('.modal'));
    loadAttendance();
    updateDashboard();
}
