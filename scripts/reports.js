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
        <div class="reports-dashboard p-4 w-full max-w-full box-border">
            <!-- Report Controls - Full Width, No Background -->
            <div class="report-actions w-full mt-4 mb-6">
                <div class="d-flex gap-4 justify-start flex-wrap items-center w-full">
                    <select id="globalSubjectFilter" onchange="updateAllCharts()" class="filter-select" title="Este filtro afecta TODOS los gráficos y reportes simultáneamente">
                        <option value="all">Todas las Materias</option>
                    </select>
                    <button class="btn btn-primary" onclick="exportReport('pdf')" title="Download comprehensive PDF report">
                        <i class="fas fa-file-pdf"></i> 
                        <span data-translate="export_pdf">Exportar PDF</span>
                    </button>
                    <button class="btn btn-secondary" onclick="exportReport('excel')" title="Descargar archivos Excel para análisis de datos">
                        <i class="fas fa-file-excel"></i> 
                        <span>Exportar Excel</span>
                    </button>
                    <button class="btn btn-secondary" onclick="exportAttendanceOnly()" title="Exportar solo lista de asistencia">
                        <i class="fas fa-calendar-check"></i> 
                        <span>Exportar Asistencia</span>
                    </button>
                    <button class="btn btn-secondary" onclick="exportGradesOnly()" title="Exportar solo lista de notas">
                        <i class="fas fa-graduation-cap"></i> 
                        <span>Exportar Notas</span>
                    </button>
                    <button class="btn btn-secondary" onclick="exportProgressReport()" title="Exportar informes de avance por cuatrimestre">
                        <i class="fas fa-chart-line"></i> 
                        <span>Exportar Informes de Avance</span>
                    </button>
                    <button class="btn btn-secondary" onclick="printReport()" title="Print the current report">
                        <i class="fas fa-print"></i> 
                        <span data-translate="print_report">Imprimir</span>
                    </button>
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

            <!-- Charts Section - NO INDIVIDUAL FILTERS HERE -->
            <div class="charts-grid d-grid grid-cols-auto grid-gap-6 mb-8 w-full max-w-full">
                <!-- Grades Distribution Chart -->
                <div class="chart-card bg-white rounded-lg shadow overflow-hidden">
                    <div class="chart-header d-flex justify-between items-center px-6 py-4 border-b border-gray">
                        <h3 class="text-lg font-semibold text-dark m-0">Distribución de Calificaciones</h3>
                    </div>
                    <div class="chart-container p-4 position-relative" style="height: 300px;">
                        <canvas id="gradesChart"></canvas>
                    </div>
                </div>

                <!-- Attendance Trends Chart -->
                <div class="chart-card bg-white rounded-lg shadow overflow-hidden">
                    <div class="chart-header d-flex justify-between items-center px-6 py-4 border-b border-gray">
                        <h3 class="text-lg font-semibold text-dark m-0">Tendencias de Asistencia</h3>
                    </div>
                    <div class="chart-container p-4 position-relative" style="height: 300px;">
                        <canvas id="attendanceChart"></canvas>
                    </div>
                </div>

                <!-- Student Performance Chart -->
                <div class="chart-card bg-white rounded-lg shadow overflow-hidden">
                    <div class="chart-header d-flex justify-between items-center px-6 py-4 border-b border-gray">
                        <h3 class="text-lg font-semibold text-dark m-0">Rendimiento de Estudiantes</h3>
                    </div>
                    <div class="chart-container p-4 position-relative" style="height: 300px;">
                        <canvas id="performanceChart"></canvas>
                    </div>
                </div>

                <!-- Subject Comparison Chart -->
                <div class="chart-card bg-white rounded-lg shadow overflow-hidden">
                    <div class="chart-header d-flex justify-between items-center px-6 py-4 border-b border-gray">
                        <h3 class="text-lg font-semibold text-dark m-0">Comparación de Materias</h3>
                    </div>
                    <div class="chart-container p-4 position-relative" style="height: 300px;">
                        <canvas id="subjectChart"></canvas>
                    </div>
                </div>
            </div>

            <!-- Detailed Reports -->
            <div class="detailed-reports d-grid grid-cols-auto grid-gap-6 mb-8 w-full max-w-full">
                <div class="report-card bg-white rounded-lg shadow overflow-hidden">
                    <div class="report-header px-6 py-4 border-b border-gray bg-light">
                        <h3 class="text-lg font-semibold text-dark m-0">Estudiantes con Mejor Rendimiento</h3>
                    </div>
                    <div class="report-content p-6" id="topStudentsReport">
                        <!-- Will be populated by JavaScript -->
                    </div>
                </div>

                <div class="report-card bg-white rounded-lg shadow overflow-hidden">
                    <div class="report-header px-6 py-4 border-b border-gray bg-light">
                        <h3 class="text-lg font-semibold text-dark m-0">Resumen de Asistencia</h3>
                    </div>
                    <div class="report-content p-6" id="attendanceReport">
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
            if (initAttempts < maxAttempts) {
                setTimeout(initializeReportsContent, 300);
            } else {
                console.error('Reports: Max attempts reached, window.data not available');
            }
            return;
        }

        // Check if we have the essential data arrays
        const hasData = window.data.materia && window.data.estudiante && window.data.asistencia &&
                       Array.isArray(window.data.materia) && Array.isArray(window.data.estudiante) && Array.isArray(window.data.asistencia);
        
        if (!hasData) {
            if (initAttempts < maxAttempts) {
                setTimeout(initializeReportsContent, 300);
            } else {
                console.error('Reports: Max attempts reached, data arrays not available', {
                    hasMateria: !!window.data.materia,
                    hasEstudiante: !!window.data.estudiante,
                    hasAsistencia: !!window.data.asistencia
                });
            }
            return;
        }

        // Data is ready, initialize components
        try {
            // Ensure filter is visible and remove any individual chart filters
            const globalFilter = document.getElementById('globalSubjectFilter');
            if (!globalFilter) {
                console.error('Reports: globalSubjectFilter not found in DOM');
            } else {
                console.log('Reports: globalSubjectFilter found and ready');
            }
            
            // CRITICAL: Remove any filters that might have been added to chart headers
            document.querySelectorAll('.chart-header select, .chart-card select').forEach(select => {
                select.remove();
            });
            
            if (typeof initializeCharts === 'function') {
                initializeCharts();
            }
            if (typeof populateFilters === 'function') {
                populateFilters();
            }
            // Get current filter value
            const subjectId = globalFilter ? globalFilter.value : 'all';
            
            if (typeof generateDetailedReports === 'function') {
                generateDetailedReports(subjectId);
            }
            
            // Update KPI values with fresh data using current filter
            updateReportsKPIs(subjectId);
        } catch (error) {
            console.error('Error initializing reports:', error);
        }
    }

    // Start initialization after a short delay to ensure DOM is ready
    setTimeout(initializeReportsContent, 200);
}

// Update KPI values with current data, optionally filtered by subject
function updateReportsKPIs(subjectId = 'all') {
    const totalStudentsEl = document.getElementById('reportsTotalStudents');
    const averageGradeEl = document.getElementById('reportsAverageGrade');
    const attendanceRateEl = document.getElementById('reportsAttendanceRate');
    const passingRateEl = document.getElementById('reportsPassingRate');

    if (totalStudentsEl) {
        const students = getCurrentUserStudents();
        // Filter students by subject if needed
        let filteredStudents = students;
        if (subjectId !== 'all') {
            const targetSubjectId = parseInt(subjectId, 10);
            const userSubjects = getCurrentUserSubjects();
            const subjectStudents = window.data.alumnos_x_materia
                .filter(enrollment => parseInt(enrollment.Materia_ID_materia, 10) === targetSubjectId)
                .map(enrollment => parseInt(enrollment.Estudiante_ID_Estudiante, 10));
            filteredStudents = students.filter(student => 
                subjectStudents.includes(parseInt(student.ID_Estudiante, 10))
            );
        }
        totalStudentsEl.textContent = filteredStudents.length;
    }

    if (averageGradeEl) {
        const avg = calculateAverageGrade(subjectId);
        averageGradeEl.textContent = avg.toFixed(1);
    }

    if (attendanceRateEl) {
        const rate = calculateAttendanceRate(subjectId);
        attendanceRateEl.textContent = rate + '%';
    }

    if (passingRateEl) {
        const rate = getPassingStudents(subjectId);
        passingRateEl.textContent = rate + '%';
    }
}


// Manual refresh function for debugging
function refreshReports() {
    if (window.data && Object.keys(window.data).length > 0) {
        initializeCharts();
        populateFilters();
        generateDetailedReports();
    }
}

// Export main functions
window.initializeReports = initializeReports;
window.loadReports = loadReports;
window.refreshReports = refreshReports;
window.updateReportsKPIs = updateReportsKPIs;
