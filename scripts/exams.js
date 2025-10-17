// Exam Management
function initializeExams() {
    const createExamBtn = document.getElementById('createExamBtn');
    
    if (createExamBtn) {
        createExamBtn.addEventListener('click', () => {
            showExamModal();
        });
    }
}

function loadExams() {
    const examsContainer = document.getElementById('examsContainer');
    const examsList = document.getElementById('examsList');
    
    if (!examsContainer || !examsList) return;

    // Grid view
    examsContainer.innerHTML = appData.exams.map(exam => {
        const subject = appData.subjects.find(s => s.id === exam.subjectId);
        return `
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">${exam.title}</h3>
                    <div class="card-actions">
                        <button class="btn-icon btn-edit" onclick="editExam(${exam.id})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-icon btn-delete" onclick="deleteExam(${exam.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <div class="card-content">
                    <p><strong>Subject:</strong> ${subject ? subject.name : 'Unknown Subject'}</p>
                    <p><strong>Date:</strong> ${exam.date}</p>
                    <p><strong>Duration:</strong> ${exam.duration} minutes</p>
                    <p><strong>Type:</strong> ${exam.type}</p>
                    <p><strong>Total Points:</strong> ${exam.totalPoints}</p>
                    <p><strong>Description:</strong> ${exam.description}</p>
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
                        <th>Duration</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${appData.exams.map(exam => {
                        const subject = appData.subjects.find(s => s.id === exam.subjectId);
                        const shortDate = exam.date.split('-').slice(1).join('/');
                        return `
                            <tr>
                                <td><strong>${exam.title}</strong></td>
                                <td>${subject ? subject.name : 'Unknown'}</td>
                                <td>${exam.type}</td>
                                <td>${shortDate}</td>
                                <td>${exam.duration}m</td>
                                <td>
                                    <div class="table-actions">
                                        <button class="btn-icon btn-edit" onclick="editExam(${exam.id})" title="Edit">
                                            <i class="fas fa-edit"></i>
                                        </button>
                                        <button class="btn-icon btn-delete" onclick="deleteExam(${exam.id})" title="Delete">
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
                        ${appData.subjects.map(s => `<option value="${s.id}">${s.name}</option>`).join('')}
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
        id: Date.now(),
        title: document.getElementById('examTitle').value,
        subjectId: parseInt(document.getElementById('examSubject').value),
        date: document.getElementById('examDate').value,
        duration: parseInt(document.getElementById('examDuration').value),
        type: document.getElementById('examType').value,
        description: document.getElementById('examDescription').value,
        questions: [],
        totalPoints: 100
    };
    
    appData.exams.push(newExam);
    saveData();
    closeModal(document.querySelector('.modal'));
    loadExams();
}

function editExam(id) {
    const exam = appData.exams.find(e => e.id === id);
    if (!exam) return;

    showExamModal();
    
    // Populate form with existing data
    document.getElementById('examTitle').value = exam.title;
    document.getElementById('examSubject').value = exam.subjectId;
    document.getElementById('examDate').value = exam.date;
    document.getElementById('examDuration').value = exam.duration;
    document.getElementById('examType').value = exam.type;
    document.getElementById('examDescription').value = exam.description;
}

function deleteExam(id) {
    if (confirm('Are you sure you want to delete this exam?')) {
        appData.exams = appData.exams.filter(e => e.id !== id);
        saveData();
        loadExams();
    }
}
