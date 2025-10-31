// Main Reports Management - Coordinates all report components
// This file serves as the main entry point for the reports functionality

// Import all report components
// Note: In a real application, you would use ES6 modules or a bundler
// For now, we'll assume the components are loaded via script tags in the HTML

function initializeReports() {
    // Initialize reports functionality
    loadReports();
}

function loadReports() {
    const reportsContainer = document.getElementById('reportsContainer');
    if (!reportsContainer) return;

    reportsContainer.innerHTML = `
        <div class="reports-dashboard">
            <!-- Summary Cards -->
            <div class="reports-summary">
                <div class="summary-card">
                    <div class="summary-icon">
                        <i class="fas fa-users"></i>
                    </div>
                    <div class="summary-content">
                        <h3>${getCurrentUserStudents().length}</h3>
                        <p>Total Students</p>
                    </div>
                </div>
                <div class="summary-card">
                    <div class="summary-icon">
                        <i class="fas fa-chart-line"></i>
                    </div>
                    <div class="summary-content">
                        <h3>${calculateAverageGrade()}%</h3>
                        <p>Average Grade</p>
                    </div>
                </div>
                <div class="summary-card">
                    <div class="summary-icon">
                        <i class="fas fa-calendar-check"></i>
                    </div>
                    <div class="summary-content">
                        <h3>${calculateAttendanceRate()}%</h3>
                        <p>Attendance Rate</p>
                    </div>
                </div>
                <div class="summary-card">
                    <div class="summary-icon">
                        <i class="fas fa-graduation-cap"></i>
                    </div>
                    <div class="summary-content">
                        <h3>${getPassingStudents()}%</h3>
                        <p>Passing Rate</p>
                    </div>
                </div>
            </div>

            <!-- Charts Section -->
            <div class="charts-grid">
                <!-- Grades Distribution Chart -->
                <div class="chart-card">
                    <div class="chart-header">
                        <h3>Grades Distribution</h3>
                        <div class="chart-controls">
                            <select id="gradesSubjectFilter" onchange="updateGradesChart()">
                                <option value="all">All Subjects</option>
                            </select>
                        </div>
                    </div>
                    <div class="chart-container">
                        <canvas id="gradesChart"></canvas>
                    </div>
                </div>

                <!-- Attendance Trends Chart -->
                <div class="chart-card">
                    <div class="chart-header">
                        <h3>Attendance Trends</h3>
                        <div class="chart-controls">
                            <select id="attendanceSubjectFilter" onchange="updateAttendanceChart()">
                                <option value="all">All Subjects</option>
                            </select>
                        </div>
                    </div>
                    <div class="chart-container">
                        <canvas id="attendanceChart"></canvas>
                    </div>
                </div>

                <!-- Student Performance Chart -->
                <div class="chart-card">
                    <div class="chart-header">
                        <h3>Student Performance</h3>
                        <div class="chart-controls">
                            <select id="performanceStudentFilter" onchange="updatePerformanceChart()">
                                <option value="all">All Students</option>
                            </select>
                        </div>
                    </div>
                    <div class="chart-container">
                        <canvas id="performanceChart"></canvas>
                    </div>
                </div>

                <!-- Subject Comparison Chart -->
                <div class="chart-card">
                    <div class="chart-header">
                        <h3>Subject Comparison</h3>
                    </div>
                    <div class="chart-container">
                        <canvas id="subjectChart"></canvas>
                    </div>
                </div>
            </div>

            <!-- Detailed Reports -->
            <div class="detailed-reports">
                <div class="report-card">
                    <div class="report-header">
                        <h3>Top Performing Students</h3>
                    </div>
                    <div class="report-content" id="topStudentsReport">
                        <!-- Will be populated by JavaScript -->
                    </div>
            </div>

                <div class="report-card">
                    <div class="report-header">
                        <h3>Attendance Summary</h3>
                    </div>
                    <div class="report-content" id="attendanceReport">
                        <!-- Will be populated by JavaScript -->
                    </div>
                    </div>
                </div>

            <!-- Export Actions -->
                <div class="report-actions">
                <button class="btn-primary" onclick="exportReport('pdf')" title="Download comprehensive PDF report">
                    <i class="fas fa-file-pdf"></i> Export PDF
                </button>
                <button class="btn-secondary" onclick="exportReport('excel')" title="Download CSV files for data analysis">
                    <i class="fas fa-file-csv"></i> Export CSV
                </button>
                <button class="btn-secondary" onclick="printReport()" title="Print the current report">
                    <i class="fas fa-print"></i> Print Report
                    </button>
                </div>
        </div>
    `;

    // Initialize charts after DOM is updated and data is loaded
    setTimeout(() => {
        // Check if data is available before initializing charts
        if (window.data && Object.keys(window.data).length > 0) {
            initializeCharts();
            populateFilters();
            generateDetailedReports();
        } else {
            setTimeout(() => {
                if (window.data && Object.keys(window.data).length > 0) {
                    initializeCharts();
                    populateFilters();
                    generateDetailedReports();
                } else {
                }
            }, 500);
        }
    }, 100);
}


// Manual refresh function for debugging
function refreshReports() {
    if (window.data && Object.keys(window.data).length > 0) {
        initializeCharts();
        populateFilters();
        generateDetailedReports();
    } else {
    }
}

// Export main functions
window.initializeReports = initializeReports;
window.loadReports = loadReports;
window.refreshReports = refreshReports;