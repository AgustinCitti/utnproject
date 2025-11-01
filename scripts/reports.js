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

    // Get current data for stats
    const totalStudents = getCurrentUserStudents().length;
    const averageGrade = calculateAverageGrade();
    const attendanceRate = calculateAttendanceRate();
    const passingRate = getPassingStudents();

    reportsContainer.innerHTML = `
        <div class="reports-dashboard">
            <!-- Section Header -->
            <div class="section-header">
                <h2 data-translate="reports">Reportes</h2>
                <div class="section-actions">
                    <div class="report-actions">
                        <button class="btn-primary" onclick="exportReport('pdf')" title="Download comprehensive PDF report">
                            <i class="fas fa-file-pdf"></i> 
                            <span data-translate="export_pdf">Exportar PDF</span>
                        </button>
                        <button class="btn-secondary" onclick="exportReport('excel')" title="Download CSV files for data analysis">
                            <i class="fas fa-file-csv"></i> 
                            <span data-translate="export_csv">Exportar CSV</span>
                        </button>
                        <button class="btn-secondary" onclick="printReport()" title="Print the current report">
                            <i class="fas fa-print"></i> 
                            <span data-translate="print_report">Imprimir</span>
                        </button>
                    </div>
                </div>
            </div>

            <!-- KPI Cards (matching dashboard style) -->
            <div class="dashboard-kpis">
                <div class="kpi-card kpi-students">
                    <div class="kpi-icon">
                        <i class="fas fa-users"></i>
                    </div>
                    <div class="kpi-content">
                        <div class="kpi-value" id="reportsTotalStudents">${totalStudents}</div>
                        <div class="kpi-label" data-translate="students">Estudiantes</div>
                    </div>
                </div>
                <div class="kpi-card kpi-attendance">
                    <div class="kpi-icon">
                        <i class="fas fa-chart-line"></i>
                    </div>
                    <div class="kpi-content">
                        <div class="kpi-value" id="reportsAverageGrade">${averageGrade.toFixed(1)}</div>
                        <div class="kpi-label" data-translate="average_grade">Promedio General</div>
                    </div>
                </div>
                <div class="kpi-card kpi-tasks">
                    <div class="kpi-icon">
                        <i class="fas fa-calendar-check"></i>
                    </div>
                    <div class="kpi-content">
                        <div class="kpi-value" id="reportsAttendanceRate">${attendanceRate}%</div>
                        <div class="kpi-label" data-translate="attendance_rate">Asistencia</div>
                    </div>
                </div>
                <div class="kpi-card kpi-next-class">
                    <div class="kpi-icon">
                        <i class="fas fa-graduation-cap"></i>
                    </div>
                    <div class="kpi-content">
                        <div class="kpi-value" id="reportsPassingRate">${passingRate}%</div>
                        <div class="kpi-label" data-translate="passing_rate">Tasa de Aprobación</div>
                    </div>
                </div>
            </div>

            <!-- Charts Section -->
            <div class="charts-grid">
                <!-- Grades Distribution Chart -->
                <div class="chart-card">
                    <div class="chart-header">
                        <h3>Distribución de Calificaciones</h3>
                        <div class="chart-controls">
                            <select id="gradesSubjectFilter" onchange="updateGradesChart()">
                                <option value="all">Todas las Materias</option>
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
                        <h3>Tendencias de Asistencia</h3>
                        <div class="chart-controls">
                            <select id="attendanceSubjectFilter" onchange="updateAttendanceChart()">
                                <option value="all">Todas las Materias</option>
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
                        <h3>Rendimiento de Estudiantes</h3>
                        <div class="chart-controls">
                            <select id="performanceStudentFilter" onchange="updatePerformanceChart()">
                                <option value="all">Todos los Estudiantes</option>
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
                        <h3>Comparación de Materias</h3>
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
                        <h3>Estudiantes con Mejor Rendimiento</h3>
                    </div>
                    <div class="report-content" id="topStudentsReport">
                        <!-- Will be populated by JavaScript -->
                    </div>
            </div>

                <div class="report-card">
                    <div class="report-header">
                        <h3>Resumen de Asistencia</h3>
                    </div>
                    <div class="report-content" id="attendanceReport">
                        <!-- Will be populated by JavaScript -->
                    </div>
                    </div>
                </div>

        </div>
    `;

    // Initialize charts after DOM is updated and data is loaded
    // Use a more robust data checking approach
    let initAttempts = 0;
    const maxAttempts = 10;
    
    function initializeReportsContent() {
        initAttempts++;
        
        if (!window.data) {
            console.log(`Reports initialization attempt ${initAttempts}: Waiting for window.data...`);
            if (initAttempts < maxAttempts) {
                setTimeout(initializeReportsContent, 300);
            } else {
                console.error('Reports: Max attempts reached, window.data not available');
            }
            return;
        }

        // Check if we have the essential data arrays
        const hasData = window.data.materia && window.data.estudiante && 
                       Array.isArray(window.data.materia) && Array.isArray(window.data.estudiante);
        
        if (!hasData) {
            console.log(`Reports initialization attempt ${initAttempts}: Data arrays not ready yet`, {
                hasMateria: !!window.data.materia,
                hasEstudiante: !!window.data.estudiante,
                materiaIsArray: Array.isArray(window.data.materia),
                estudianteIsArray: Array.isArray(window.data.estudiante)
            });
            if (initAttempts < maxAttempts) {
                setTimeout(initializeReportsContent, 300);
            } else {
                console.error('Reports: Max attempts reached, data arrays not available');
            }
            return;
        }

        // Log current user info for debugging
        const userId = getCurrentUserId();
        const userSubjects = getCurrentUserSubjects();
        console.log('Reports: Initializing with data', {
            userId,
            totalSubjects: window.data.materia.length,
            userSubjectsCount: userSubjects.length,
            userSubjects: userSubjects.map(m => m.Nombre)
        });

        // Data is ready, initialize components
        try {
            if (typeof initializeCharts === 'function') {
                initializeCharts();
            }
            if (typeof populateFilters === 'function') {
                populateFilters();
            }
            if (typeof generateDetailedReports === 'function') {
                generateDetailedReports();
            }
            
            // Update KPI values with fresh data
            updateReportsKPIs();
            
            console.log('Reports: Successfully initialized');
        } catch (error) {
            console.error('Error initializing reports:', error);
        }
    }

    // Start initialization after a short delay to ensure DOM is ready
    setTimeout(initializeReportsContent, 200);
}

// Update KPI values with current data
function updateReportsKPIs() {
    const totalStudentsEl = document.getElementById('reportsTotalStudents');
    const averageGradeEl = document.getElementById('reportsAverageGrade');
    const attendanceRateEl = document.getElementById('reportsAttendanceRate');
    const passingRateEl = document.getElementById('reportsPassingRate');

    if (totalStudentsEl) {
        const students = getCurrentUserStudents();
        totalStudentsEl.textContent = students.length;
    }

    if (averageGradeEl) {
        const avg = calculateAverageGrade();
        averageGradeEl.textContent = avg.toFixed(1);
    }

    if (attendanceRateEl) {
        const rate = calculateAttendanceRate();
        attendanceRateEl.textContent = rate + '%';
    }

    if (passingRateEl) {
        const rate = getPassingStudents();
        passingRateEl.textContent = rate + '%';
    }
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
window.updateReportsKPIs = updateReportsKPIs;