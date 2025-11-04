// Chart Management Component
let reportsCharts = {};

function initializeCharts() {
    // Destroy existing charts first to prevent canvas reuse errors
    destroyAllCharts();
    
    // CRITICAL: Remove any filters that might exist in chart headers
    document.querySelectorAll('.chart-header select, .chart-card select, .chart-header .filter-select').forEach(select => {
        select.remove();
    });
    
    // Get subject filter value from global filter (default to 'all')
    const globalFilter = document.getElementById('globalSubjectFilter');
    const subjectId = globalFilter ? globalFilter.value : 'all';
    
    // Initialize all charts with the selected subject filter from global filter
    createGradesChart(subjectId);
    createAttendanceChart(subjectId);
    createPerformanceChart(subjectId);
    createSubjectChart();
    
    // Double-check: Remove any filters that might have been added during chart creation
    setTimeout(() => {
        document.querySelectorAll('.chart-header select, .chart-card select, .chart-header .filter-select').forEach(select => {
            select.remove();
        });
    }, 100);
}

function destroyAllCharts() {
    // Destroy all existing charts to prevent canvas reuse errors
    if (reportsCharts.grades) {
        reportsCharts.grades.destroy();
        reportsCharts.grades = null;
    }
    if (reportsCharts.attendance) {
        reportsCharts.attendance.destroy();
        reportsCharts.attendance = null;
    }
    if (reportsCharts.performance) {
        reportsCharts.performance.destroy();
        reportsCharts.performance = null;
    }
    if (reportsCharts.subject) {
        reportsCharts.subject.destroy();
        reportsCharts.subject = null;
    }
}

function createGradesChart(subjectId = 'all') {
    const ctx = document.getElementById('gradesChart');
    if (!ctx) return;

    // Destroy existing chart if it exists
    if (reportsCharts.grades) {
        reportsCharts.grades.destroy();
        reportsCharts.grades = null;
    }

    const gradesData = getGradesDistribution(subjectId);
    
    // Handle empty data - show message but keep canvas structure
    if (!gradesData || !gradesData.labels || gradesData.labels.length === 0 || 
        !gradesData.data || gradesData.data.every(val => val === 0)) {
        // Remove any existing overlay
        const container = ctx.parentElement;
        const existingOverlay = container.querySelector('.chart-empty-message');
        if (existingOverlay) existingOverlay.remove();
        
        // Create overlay message
        const overlay = document.createElement('div');
        overlay.className = 'chart-empty-message';
        overlay.style.cssText = 'position: absolute; top: 0; left: 0; right: 0; bottom: 0; display: flex; align-items: center; justify-content: center; background: rgba(255,255,255,0.9); z-index: 10; color: #666;';
        overlay.innerHTML = '<p>No hay datos de calificaciones disponibles</p>';
        container.style.position = 'relative';
        container.appendChild(overlay);
        return;
    }
    
    // Remove empty message if data is now available
    const container = ctx.parentElement;
    const existingOverlay = container.querySelector('.chart-empty-message');
    if (existingOverlay) existingOverlay.remove();
    
    reportsCharts.grades = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: gradesData.labels,
            datasets: [{
                label: 'Number of Students',
                data: gradesData.data,
                backgroundColor: [
                    '#ff6384',
                    '#36a2eb',
                    '#ffce56',
                    '#4bc0c0',
                    '#9966ff',
                    '#ff9f40'
                ],
                borderColor: [
                    '#ff6384',
                    '#36a2eb',
                    '#ffce56',
                    '#4bc0c0',
                    '#9966ff',
                    '#ff9f40'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            }
        }
    });
}

function createAttendanceChart(subjectId = 'all') {
    const ctx = document.getElementById('attendanceChart');
    if (!ctx) return;

    // Destroy existing chart if it exists
    if (reportsCharts.attendance) {
        reportsCharts.attendance.destroy();
        reportsCharts.attendance = null;
    }

    const attendanceData = getAttendanceTrends(subjectId);
    
    // Handle empty data - show message but keep canvas structure
    if (!attendanceData || !attendanceData.labels || attendanceData.labels.length === 0) {
        // Remove any existing overlay
        const container = ctx.parentElement;
        const existingOverlay = container.querySelector('.chart-empty-message');
        if (existingOverlay) existingOverlay.remove();
        
        // Create overlay message
        const overlay = document.createElement('div');
        overlay.className = 'chart-empty-message';
        overlay.style.cssText = 'position: absolute; top: 0; left: 0; right: 0; bottom: 0; display: flex; align-items: center; justify-content: center; background: rgba(255,255,255,0.9); z-index: 10; color: #666;';
        overlay.innerHTML = '<p>No hay datos de asistencia disponibles</p>';
        container.style.position = 'relative';
        container.appendChild(overlay);
        return;
    }
    
    // Remove empty message if data is now available
    const container = ctx.parentElement;
    const existingOverlay = container.querySelector('.chart-empty-message');
    if (existingOverlay) existingOverlay.remove();
    
    reportsCharts.attendance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: attendanceData.labels,
            datasets: [{
                label: 'Attendance Rate (%)',
                data: attendanceData.data,
                borderColor: '#36a2eb',
                backgroundColor: 'rgba(54, 162, 235, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                        callback: function(value) {
                            return value + '%';
                        }
                    }
                }
            }
        }
    });
}

function createPerformanceChart(subjectId = 'all') {
    const ctx = document.getElementById('performanceChart');
    if (!ctx) return;

    // Destroy existing chart if it exists
    if (reportsCharts.performance) {
        reportsCharts.performance.destroy();
        reportsCharts.performance = null;
    }

    // Get performance data filtered by subject (if subjectId is provided and not 'all')
    // For 'all', we show all students across all subjects
    const performanceData = getStudentPerformance('all', subjectId);
    
    // Handle empty data - show message but keep canvas structure
    if (!performanceData || !performanceData.labels || performanceData.labels.length === 0 || 
        !performanceData.datasets || performanceData.datasets.length === 0) {
        // Remove any existing overlay
        const container = ctx.parentElement;
        const existingOverlay = container.querySelector('.chart-empty-message');
        if (existingOverlay) existingOverlay.remove();
        
        // Create overlay message
        const overlay = document.createElement('div');
        overlay.className = 'chart-empty-message';
        overlay.style.cssText = 'position: absolute; top: 0; left: 0; right: 0; bottom: 0; display: flex; align-items: center; justify-content: center; background: rgba(255,255,255,0.9); z-index: 10; color: #666;';
        overlay.innerHTML = '<p>No hay datos de rendimiento disponibles</p>';
        container.style.position = 'relative';
        container.appendChild(overlay);
        return;
    }
    
    // Remove empty message if data is now available
    const container = ctx.parentElement;
    const existingOverlay = container.querySelector('.chart-empty-message');
    if (existingOverlay) existingOverlay.remove();
    
    reportsCharts.performance = new Chart(ctx, {
        type: 'radar',
        data: {
            labels: performanceData.labels,
            datasets: performanceData.datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top'
                }
            },
            scales: {
                r: {
                    beginAtZero: true,
                    max: 10
                }
            }
        }
    });
}

function createSubjectChart() {
    const ctx = document.getElementById('subjectChart');
    if (!ctx) return;

    // Destroy existing chart if it exists
    if (reportsCharts.subject) {
        reportsCharts.subject.destroy();
        reportsCharts.subject = null;
    }

    const subjectData = getSubjectComparison();
    
    // Handle empty data - show message but keep canvas structure
    if (!subjectData || !subjectData.labels || subjectData.labels.length === 0) {
        // Remove any existing overlay
        const container = ctx.parentElement;
        const existingOverlay = container.querySelector('.chart-empty-message');
        if (existingOverlay) existingOverlay.remove();
        
        // Create overlay message
        const overlay = document.createElement('div');
        overlay.className = 'chart-empty-message';
        overlay.style.cssText = 'position: absolute; top: 0; left: 0; right: 0; bottom: 0; display: flex; align-items: center; justify-content: center; background: rgba(255,255,255,0.9); z-index: 10; color: #666;';
        overlay.innerHTML = '<p>No hay datos de materias disponibles</p>';
        container.style.position = 'relative';
        container.appendChild(overlay);
        return;
    }
    
    // Remove empty message if data is now available
    const container = ctx.parentElement;
    const existingOverlay = container.querySelector('.chart-empty-message');
    if (existingOverlay) existingOverlay.remove();
    
    reportsCharts.subject = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: subjectData.labels,
            datasets: [{
                data: subjectData.data,
                backgroundColor: [
                    '#ff6384',
                    '#36a2eb',
                    '#ffce56',
                    '#4bc0c0',
                    '#9966ff'
                ],
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

// Chart update functions
function updateGradesChart(subjectId = null) {
    // If subjectId is not provided, get it from the global filter
    if (subjectId === null) {
        const filter = document.getElementById('globalSubjectFilter');
        subjectId = filter ? filter.value : 'all';
    }
    
    // Destroy and recreate chart to ensure proper updates
    if (reportsCharts.grades) {
        reportsCharts.grades.destroy();
        reportsCharts.grades = null;
    }
    createGradesChart(subjectId);
}

function updateAttendanceChart(subjectId = null) {
    // If subjectId is not provided, get it from the global filter
    if (subjectId === null) {
        const filter = document.getElementById('globalSubjectFilter');
        subjectId = filter ? filter.value : 'all';
    }
    
    // Destroy and recreate chart to ensure proper updates
    if (reportsCharts.attendance) {
        reportsCharts.attendance.destroy();
        reportsCharts.attendance = null;
    }
    createAttendanceChart(subjectId);
}

function updatePerformanceChart(subjectId = null) {
    // If subjectId is not provided, get it from the global filter
    if (subjectId === null) {
        const filter = document.getElementById('globalSubjectFilter');
        subjectId = filter ? filter.value : 'all';
    }
    
    // Destroy and recreate chart to ensure proper updates
    if (reportsCharts.performance) {
        reportsCharts.performance.destroy();
        reportsCharts.performance = null;
    }
    createPerformanceChart(subjectId);
}

// Update all charts with the selected subject from global filter
function updateAllCharts() {
    const filter = document.getElementById('globalSubjectFilter');
    const subjectId = filter ? filter.value : 'all';
    
    // Update all charts with the selected subject filter
    updateGradesChart(subjectId);
    updateAttendanceChart(subjectId);
    updatePerformanceChart(subjectId);
    
    // Subject comparison chart shows all subjects (comparison view)
    createSubjectChart();
    
    // Update KPIs and detailed reports with the selected subject filter
    updateReportsKPIs(subjectId);
    if (typeof generateDetailedReports === 'function') {
        generateDetailedReports(subjectId);
    }
}

// Export chart manager functions
window.reportsCharts = reportsCharts;
window.initializeCharts = initializeCharts;
window.destroyAllCharts = destroyAllCharts;
window.createGradesChart = createGradesChart;
window.createAttendanceChart = createAttendanceChart;
window.createPerformanceChart = createPerformanceChart;
window.createSubjectChart = createSubjectChart;
window.updateGradesChart = updateGradesChart;
window.updateAttendanceChart = updateAttendanceChart;
window.updatePerformanceChart = updatePerformanceChart;
window.updateAllCharts = updateAllCharts;
