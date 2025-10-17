// Repository Management
function initializeRepository() {
    const uploadFileBtn = document.getElementById('uploadFileBtn');
    
    if (uploadFileBtn) {
        uploadFileBtn.addEventListener('click', () => {
            showFileUploadModal();
        });
    }
}

function loadRepository() {
    const repositoryContainer = document.getElementById('repositoryContainer');
    const repositoryList = document.getElementById('repositoryList');
    
    if (!repositoryContainer || !repositoryList) return;

    // Mock repository files
    const repositoryFiles = [
        { name: 'Math_Exam_2024.pdf', type: 'PDF', size: '2.3 MB', date: '2024-01-15' },
        { name: 'Physics_Lab_Report.docx', type: 'Word', size: '1.8 MB', date: '2024-01-12' },
        { name: 'Chemistry_Notes.pdf', type: 'PDF', size: '3.1 MB', date: '2024-01-10' }
    ];

    // Grid view
    repositoryContainer.innerHTML = repositoryFiles.map(file => `
        <div class="card">
            <div class="card-header">
                <h3 class="card-title">${file.name}</h3>
                <div class="card-actions">
                    <button class="btn-icon">
                        <i class="fas fa-download"></i>
                    </button>
                    <button class="btn-icon btn-delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            <div class="card-content">
                <p><strong>Type:</strong> ${file.type}</p>
                <p><strong>Size:</strong> ${file.size}</p>
                <p><strong>Date:</strong> ${file.date}</p>
            </div>
        </div>
    `).join('');

    // List view - Table format
    repositoryList.innerHTML = `
        <div class="table-responsive">
            <table class="data-table">
                <thead>
                    <tr>
                        <th>File Name</th>
                        <th>Type</th>
                        <th>Size</th>
                        <th>Date</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${repositoryFiles.map(file => {
                        const shortDate = file.date.split('-').slice(1).join('/');
                        const shortName = file.name.length > 20 ? file.name.substring(0, 20) + '...' : file.name;
                        return `
                            <tr>
                                <td><strong title="${file.name}">${shortName}</strong></td>
                                <td><span class="table-status" style="background: #f8f9fa; color: #6c757d;">${file.type}</span></td>
                                <td>${file.size}</td>
                                <td>${shortDate}</td>
                                <td>
                                    <div class="table-actions">
                                        <button class="btn-icon" title="Download">
                                            <i class="fas fa-download"></i>
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

function showFileUploadModal() {
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Upload File</h3>
                <button class="close-modal">&times;</button>
            </div>
            <div class="modal-form">
                <div class="form-group">
                    <label for="fileInput">Select File</label>
                    <input type="file" id="fileInput" accept=".pdf,.doc,.docx,.txt">
                </div>
                <div class="form-group">
                    <label for="fileDescription">Description</label>
                    <input type="text" id="fileDescription" placeholder="Optional description">
                </div>
                <div class="form-actions">
                    <button type="button" class="btn-secondary close-modal">Cancel</button>
                    <button type="button" class="btn-primary" onclick="uploadFile()">Upload</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    setupModalHandlers(modal);
}

function uploadFile() {
    const fileInput = document.getElementById('fileInput');
    const description = document.getElementById('fileDescription').value;
    
    if (fileInput.files.length > 0) {
        const file = fileInput.files[0];
        alert(`File "${file.name}" uploaded successfully!`);
        closeModal(document.querySelector('.modal'));
        loadRepository();
    } else {
        alert('Please select a file to upload.');
    }
}
