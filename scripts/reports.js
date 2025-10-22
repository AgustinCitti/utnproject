// Reports Management
function initializeReports() {
    // Initialize reports functionality
}

function loadReports() {
    const reportsContainer = document.getElementById('reportsContainer');
    if (!reportsContainer) return;

    reportsContainer.innerHTML = `
        <div class="card">
            <div class="card-header">
                <h3 class="card-title">Academic Performance Report</h3>
            </div>
            <div class="card-content">
                <div class="report-stats">
                    <div class="stat-item">
                        <span class="stat-label">Total Students:</span>
                        <span class="stat-value">${appData.estudiante ? appData.estudiante.length : 0}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Average Grade:</span>
                        <span class="stat-value">${calculateAverageGrade()}%</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Attendance Rate:</span>
                        <span class="stat-value">${calculateAttendanceRate()}%</span>
                    </div>
                </div>
                <div class="report-actions">
                    <button class="btn-primary" onclick="generateReport()">
                        <i class="fas fa-download"></i> Generate Report
                    </button>
                </div>
            </div>
        </div>
    `;
}

function generateReport() {
    alert('Report generated successfully! This would typically download a PDF or Excel file.');
}

function calculateAverageGrade() {
    if (!appData || !appData.notas || appData.notas.length === 0) {
        return 0;
    }
    
    const totalGrades = appData.notas.reduce((sum, nota) => sum + nota.Calificacion, 0);
    const average = totalGrades / appData.notas.length;
    return Math.round(average * 10) / 10; // Round to 1 decimal place
}

function calculateAttendanceRate() {
    if (!appData || !appData.asistencia || appData.asistencia.length === 0) {
        return 0;
    }
    
    const totalRecords = appData.asistencia.length;
    const presentRecords = appData.asistencia.filter(record => record.Presente === 'Y').length;
    const attendanceRate = (presentRecords / totalRecords) * 100;
    return Math.round(attendanceRate);
}
