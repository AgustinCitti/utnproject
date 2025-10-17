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
                    <label for="attendanceSubject">Subject</label>
                    <select id="attendanceSubject">
                        ${appData.subjects.map(s => `<option value="${s.id}">${s.name}</option>`).join('')}
                    </select>
                </div>
                <div class="attendance-list">
                    ${appData.students.map(student => `
                        <div class="attendance-item">
                            <span>${student.firstName} ${student.lastName}</span>
                            <select class="attendance-status" data-student-id="${student.id}">
                                <option value="present">Present</option>
                                <option value="absent">Absent</option>
                                <option value="late">Late</option>
                            </select>
                        </div>
                    `).join('')}
                </div>
                <div class="form-actions">
                    <button type="button" class="btn-secondary close-modal">Cancel</button>
                    <button type="button" class="btn-primary" onclick="saveAttendance()">Save Attendance</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    setupModalHandlers(modal);
}

function saveAttendance() {
    const date = document.getElementById('attendanceDate').value;
    const subjectId = parseInt(document.getElementById('attendanceSubject').value);
    const statusElements = document.querySelectorAll('.attendance-status');
    
    statusElements.forEach(element => {
        const studentId = parseInt(element.dataset.studentId);
        const status = element.value;
        
        const newAttendance = {
            id: Date.now() + Math.random(),
            studentId,
            subjectId,
            date,
            status,
            notes: ''
        };
        
        appData.attendance.push(newAttendance);
    });
    
    saveData();
    closeModal(document.querySelector('.modal'));
    loadAttendance();
    updateDashboard();
}
