// Main Reports Management - Coordinates all report components
// This file serves as the main entry point for the reports functionality

// Import all report components
// Note: In a real application, you would use ES6 modules or a bundler
// For now, we'll assume the components are loaded via script tags in the HTML

function initializeReports() {
    // Initialize reports functionality
    loadReports();
    populateReportsTeacherFilter();
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
                        <h3>${appData.estudiante ? appData.estudiante.length : 0}</h3>
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

    // Initialize charts after DOM is updated
    setTimeout(() => {
        initializeCharts();
        populateFilters();
        generateDetailedReports();
    }, 100);
}

// Teacher filtering functions for reports
function populateReportsTeacherFilter() {
    const teacherFilter = document.getElementById('reportsTeacherFilter');
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
    
    // Add event listener for teacher filter changes
    teacherFilter.addEventListener('change', () => {
        filterReportsByTeacher();
    });
    
    // If current user is a teacher, set the filter to show only their data by default
    if (currentUserId) {
        teacherFilter.value = currentUserId;
        // Trigger filter update
        filterReportsByTeacher();
    }
}

function filterReportsByTeacher() {
    const teacherFilter = document.getElementById('reportsTeacherFilter');
    const selectedTeacher = teacherFilter ? teacherFilter.value : '';
    
    // Update all chart filters to only show data for the selected teacher's subjects
    if (selectedTeacher) {
        const teacherId = parseInt(selectedTeacher);
        const teacherSubjects = appData.materia.filter(subject => subject.Usuarios_docente_ID_docente === teacherId);
        const teacherSubjectIds = teacherSubjects.map(subject => subject.ID_materia);
        
        // Update subject filters in charts to only show teacher's subjects
        updateChartFilters(teacherSubjectIds);
    } else {
        // Show all subjects if no teacher is selected
        updateChartFilters([]);
    }
    
    // Refresh all charts and reports
    if (typeof updateGradesChart === 'function') updateGradesChart();
    if (typeof updateAttendanceChart === 'function') updateAttendanceChart();
    if (typeof updatePerformanceChart === 'function') updatePerformanceChart();
    if (typeof generateDetailedReports === 'function') generateDetailedReports();
}

function updateChartFilters(teacherSubjectIds) {
    // Update grades subject filter
    const gradesFilter = document.getElementById('gradesSubjectFilter');
    if (gradesFilter) {
        gradesFilter.innerHTML = '<option value="all">All Subjects</option>';
        if (teacherSubjectIds.length > 0) {
            const teacherSubjects = appData.materia.filter(subject => teacherSubjectIds.includes(subject.ID_materia));
            teacherSubjects.forEach(subject => {
                const option = document.createElement('option');
                option.value = subject.ID_materia;
                option.textContent = subject.Nombre;
                gradesFilter.appendChild(option);
            });
        }
    }
    
    // Update attendance subject filter
    const attendanceFilter = document.getElementById('attendanceSubjectFilter');
    if (attendanceFilter) {
        attendanceFilter.innerHTML = '<option value="all">All Subjects</option>';
        if (teacherSubjectIds.length > 0) {
            const teacherSubjects = appData.materia.filter(subject => teacherSubjectIds.includes(subject.ID_materia));
            teacherSubjects.forEach(subject => {
                const option = document.createElement('option');
                option.value = subject.ID_materia;
                option.textContent = subject.Nombre;
                attendanceFilter.appendChild(option);
            });
        }
    }
}

// Export main functions
window.initializeReports = initializeReports;
window.loadReports = loadReports;