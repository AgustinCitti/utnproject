// Chart Management Component
let reportsCharts = {};

function initializeCharts() {
    // Destroy existing charts first to prevent canvas reuse errors
    destroyAllCharts();
    
    // Initialize all charts with default 'all' filter
    createGradesChart('all');
    createAttendanceChart('all');
    createPerformanceChart('all');
    createSubjectChart();
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

function createPerformanceChart(studentId = 'all') {
    const ctx = document.getElementById('performanceChart');
    if (!ctx) return;

    // Destroy existing chart if it exists
    if (reportsCharts.performance) {
        reportsCharts.performance.destroy();
        reportsCharts.performance = null;
    }

    const performanceData = getStudentPerformance(studentId);
    
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
function updateGradesChart() {
    const filter = document.getElementById('gradesSubjectFilter');
    const subjectId = filter ? filter.value : 'all';
    
    console.log('Updating grades chart with subject filter:', subjectId);
    
    // Destroy and recreate chart to ensure proper updates
    if (reportsCharts.grades) {
        reportsCharts.grades.destroy();
        reportsCharts.grades = null;
    }
    createGradesChart(subjectId);
}

function updateAttendanceChart() {
    const filter = document.getElementById('attendanceSubjectFilter');
    const subjectId = filter ? filter.value : 'all';
    
    console.log('Updating attendance chart with subject filter:', subjectId);
    
    // Destroy and recreate chart to ensure proper updates
    if (reportsCharts.attendance) {
        reportsCharts.attendance.destroy();
        reportsCharts.attendance = null;
    }
    createAttendanceChart(subjectId);
}

function updatePerformanceChart() {
    const filter = document.getElementById('performanceStudentFilter');
    const studentId = filter ? filter.value : 'all';
    
    console.log('Updating performance chart with student filter:', studentId);
    
    // Destroy and recreate chart to ensure proper updates
    if (reportsCharts.performance) {
        reportsCharts.performance.destroy();
        reportsCharts.performance = null;
    }
    createPerformanceChart(studentId);
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
