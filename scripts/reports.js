// Reports Management with Charts
let reportsCharts = {};

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

function initializeCharts() {
    // Destroy existing charts first to prevent canvas reuse errors
    destroyAllCharts();
    
    // Initialize all charts
    createGradesChart();
    createAttendanceChart();
    createPerformanceChart();
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

function createGradesChart() {
    const ctx = document.getElementById('gradesChart');
    if (!ctx) return;

    // Destroy existing chart if it exists
    if (reportsCharts.grades) {
        reportsCharts.grades.destroy();
        reportsCharts.grades = null;
    }

    const gradesData = getGradesDistribution();
    
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

function createAttendanceChart() {
    const ctx = document.getElementById('attendanceChart');
    if (!ctx) return;

    // Destroy existing chart if it exists
    if (reportsCharts.attendance) {
        reportsCharts.attendance.destroy();
        reportsCharts.attendance = null;
    }

    const attendanceData = getAttendanceTrends();
    
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

function createPerformanceChart() {
    const ctx = document.getElementById('performanceChart');
    if (!ctx) return;

    // Destroy existing chart if it exists
    if (reportsCharts.performance) {
        reportsCharts.performance.destroy();
        reportsCharts.performance = null;
    }

    const performanceData = getStudentPerformance();
    
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

// Data processing functions
function getGradesDistribution() {
    if (!appData || !appData.notas) {
        return { labels: [], data: [] };
    }

    const gradeRanges = [
        { label: '0-2', min: 0, max: 2 },
        { label: '2-4', min: 2, max: 4 },
        { label: '4-6', min: 4, max: 6 },
        { label: '6-8', min: 6, max: 8 },
        { label: '8-10', min: 8, max: 10 }
    ];

    const distribution = gradeRanges.map(range => {
        const count = appData.notas.filter(nota => 
            nota.Calificacion > range.min && nota.Calificacion <= range.max
        ).length;
        return count;
    });

    return {
        labels: gradeRanges.map(range => range.label),
        data: distribution
    };
}

function getAttendanceTrends() {
    if (!appData || !appData.asistencia) {
        return { labels: [], data: [] };
    }

    // Group attendance by month
    const monthlyAttendance = {};
    appData.asistencia.forEach(record => {
        const date = new Date(record.Fecha);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        
        if (!monthlyAttendance[monthKey]) {
            monthlyAttendance[monthKey] = { total: 0, present: 0 };
        }
        
        monthlyAttendance[monthKey].total++;
        if (record.Presente === 'Y') {
            monthlyAttendance[monthKey].present++;
        }
    });

    const labels = Object.keys(monthlyAttendance).sort();
    const data = labels.map(month => {
        const stats = monthlyAttendance[month];
        return Math.round((stats.present / stats.total) * 100);
    });

    return { labels, data };
}

function getStudentPerformance() {
    if (!appData || !appData.estudiante || !appData.notas) {
        return { labels: [], datasets: [] };
    }

    const subjects = appData.materia || [];
    const labels = subjects.map(materia => materia.Nombre);
    
    const datasets = appData.estudiante.slice(0, 3).map((student, index) => {
        const studentGrades = appData.notas.filter(nota => 
            nota.Estudiante_ID_Estudiante === student.ID_Estudiante
        );
        
        const data = subjects.map(materia => {
            const materiaGrades = studentGrades.filter(nota => {
                const evaluacion = appData.evaluacion.find(eval => eval.ID_evaluacion === nota.Evaluacion_ID_evaluacion);
                return evaluacion && evaluacion.Materia_ID_materia === materia.ID_materia;
            });
            
            if (materiaGrades.length === 0) return 0;
            const average = materiaGrades.reduce((sum, nota) => sum + nota.Calificacion, 0) / materiaGrades.length;
            return Math.round(average * 10) / 10;
        });

        return {
            label: `${student.Nombre} ${student.Apellido}`,
            data: data,
            borderColor: ['#ff6384', '#36a2eb', '#ffce56'][index],
            backgroundColor: ['rgba(255, 99, 132, 0.2)', 'rgba(54, 162, 235, 0.2)', 'rgba(255, 206, 86, 0.2)'][index],
            tension: 0.4
        };
    });

    return { labels, datasets };
}

function getSubjectComparison() {
    if (!appData || !appData.materia || !appData.notas) {
        return { labels: [], data: [] };
    }

    const subjectStats = appData.materia.map(materia => {
        const materiaEvaluaciones = appData.evaluacion.filter(eval => 
            eval.Materia_ID_materia === materia.ID_materia
        );
        
        const materiaNotas = appData.notas.filter(nota => 
            materiaEvaluaciones.some(eval => eval.ID_evaluacion === nota.Evaluacion_ID_evaluacion)
        );
        
        const averageGrade = materiaNotas.length > 0 
            ? materiaNotas.reduce((sum, nota) => sum + nota.Calificacion, 0) / materiaNotas.length
            : 0;
        
        return {
            name: materia.Nombre,
            average: Math.round(averageGrade * 10) / 10
        };
    });

    return {
        labels: subjectStats.map(stat => stat.name),
        data: subjectStats.map(stat => stat.average)
    };
}

function populateFilters() {
    // Populate subject filters
    const gradesFilter = document.getElementById('gradesSubjectFilter');
    const attendanceFilter = document.getElementById('attendanceSubjectFilter');
    
    if (appData && appData.materia) {
        appData.materia.forEach(materia => {
            const option = document.createElement('option');
            option.value = materia.ID_materia;
            option.textContent = materia.Nombre;
            
            if (gradesFilter) gradesFilter.appendChild(option.cloneNode(true));
            if (attendanceFilter) attendanceFilter.appendChild(option.cloneNode(true));
        });
    }

    // Populate student filter
    const studentFilter = document.getElementById('performanceStudentFilter');
    if (appData && appData.estudiante && studentFilter) {
        appData.estudiante.forEach(student => {
            const option = document.createElement('option');
            option.value = student.ID_Estudiante;
            option.textContent = `${student.Nombre} ${student.Apellido}`;
            studentFilter.appendChild(option);
        });
    }
}

function generateDetailedReports() {
    generateTopStudentsReport();
    generateAttendanceReport();
}

function generateTopStudentsReport() {
    const container = document.getElementById('topStudentsReport');
    if (!container) return;

    if (!appData || !appData.estudiante || !appData.notas) {
        container.innerHTML = '<p>No data available</p>';
        return;
    }

    const studentAverages = appData.estudiante.map(student => {
        const studentGrades = appData.notas.filter(nota => 
            nota.Estudiante_ID_Estudiante === student.ID_Estudiante
        );
        
        const average = studentGrades.length > 0 
            ? studentGrades.reduce((sum, nota) => sum + nota.Calificacion, 0) / studentGrades.length
            : 0;
        
        return {
            name: `${student.Nombre} ${student.Apellido}`,
            average: Math.round(average * 10) / 10,
            totalGrades: studentGrades.length
        };
    }).sort((a, b) => b.average - a.average).slice(0, 5);

    container.innerHTML = `
        <div class="top-students-list">
            ${studentAverages.map((student, index) => `
                <div class="student-rank">
                    <div class="rank-number">${index + 1}</div>
                    <div class="student-info">
                        <div class="student-name">${student.name}</div>
                        <div class="student-average">Average: ${student.average}/10</div>
                    </div>
                    <div class="student-grades-count">${student.totalGrades} grades</div>
                </div>
            `).join('')}
        </div>
    `;
}

function generateAttendanceReport() {
    const container = document.getElementById('attendanceReport');
    if (!container) return;

    if (!appData || !appData.estudiante || !appData.asistencia) {
        container.innerHTML = '<p>No data available</p>';
        return;
    }

    const attendanceStats = appData.estudiante.map(student => {
        const studentAttendance = appData.asistencia.filter(record => 
            record.Estudiante_ID_Estudiante === student.ID_Estudiante
        );
        
        const presentCount = studentAttendance.filter(record => record.Presente === 'Y').length;
        const attendanceRate = studentAttendance.length > 0 
            ? Math.round((presentCount / studentAttendance.length) * 100)
            : 0;
        
        return {
            name: `${student.Nombre} ${student.Apellido}`,
            attendanceRate,
            totalClasses: studentAttendance.length,
            presentCount
        };
    }).sort((a, b) => b.attendanceRate - a.attendanceRate);

    container.innerHTML = `
        <div class="attendance-stats">
            ${attendanceStats.map(student => `
                <div class="attendance-item">
                    <div class="student-name">${student.name}</div>
                    <div class="attendance-bar">
                        <div class="attendance-fill" style="width: ${student.attendanceRate}%"></div>
                    </div>
                    <div class="attendance-percentage">${student.attendanceRate}%</div>
                    <div class="attendance-details">${student.presentCount}/${student.totalClasses} classes</div>
                </div>
            `).join('')}
        </div>
    `;
}

// Chart update functions
function updateGradesChart() {
    const filter = document.getElementById('gradesSubjectFilter');
    const subjectId = filter ? filter.value : 'all';
    
    // Destroy and recreate chart to ensure proper updates
    if (reportsCharts.grades) {
        reportsCharts.grades.destroy();
        reportsCharts.grades = null;
    }
    createGradesChart();
}

function updateAttendanceChart() {
    const filter = document.getElementById('attendanceSubjectFilter');
    const subjectId = filter ? filter.value : 'all';
    
    // Destroy and recreate chart to ensure proper updates
    if (reportsCharts.attendance) {
        reportsCharts.attendance.destroy();
        reportsCharts.attendance = null;
    }
    createAttendanceChart();
}

function updatePerformanceChart() {
    const filter = document.getElementById('performanceStudentFilter');
    const studentId = filter ? filter.value : 'all';
    
    // Destroy and recreate chart to ensure proper updates
    if (reportsCharts.performance) {
        reportsCharts.performance.destroy();
        reportsCharts.performance = null;
    }
    createPerformanceChart();
}

// Export functions
function exportReport(format) {
    if (format === 'pdf') {
        exportToPDF();
    } else if (format === 'excel') {
        exportToCSV();
    }
}

function exportToPDF() {
    // Show loading indicator
    const loadingDiv = document.createElement('div');
    loadingDiv.innerHTML = `
        <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 9999; display: flex; align-items: center; justify-content: center;">
            <div style="background: white; padding: 2rem; border-radius: 8px; text-align: center;">
                <i class="fas fa-spinner fa-spin" style="font-size: 2rem; color: #667eea; margin-bottom: 1rem;"></i>
                <p>Generating PDF report...</p>
            </div>
        </div>
    `;
    document.body.appendChild(loadingDiv);

    // Create a temporary container for the report
    const reportContainer = document.createElement('div');
    reportContainer.style.position = 'absolute';
    reportContainer.style.left = '-9999px';
    reportContainer.style.top = '0';
    reportContainer.style.width = '800px';
    reportContainer.style.background = 'white';
    reportContainer.style.padding = '20px';
    reportContainer.style.fontFamily = 'Arial, sans-serif';
    
    // Generate report content
    const reportContent = generatePDFContent();
    reportContainer.innerHTML = reportContent;
    document.body.appendChild(reportContainer);

    // Convert to canvas and then to PDF
    html2canvas(reportContainer, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
    }).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF('p', 'mm', 'a4');
        
        const imgWidth = 210;
        const pageHeight = 295;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        let heightLeft = imgHeight;
        
        let position = 0;
        
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
        
        while (heightLeft >= 0) {
            position = heightLeft - imgHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
        }
        
        // Save the PDF
        const fileName = `EduSync_Report_${new Date().toISOString().split('T')[0]}.pdf`;
        pdf.save(fileName);
        
        // Show success notification
        showExportNotification('PDF report generated successfully!', 'success');
        
        // Clean up
        document.body.removeChild(reportContainer);
        document.body.removeChild(loadingDiv);
    }).catch(error => {
        console.error('Error generating PDF:', error);
        document.body.removeChild(loadingDiv);
        alert('Error generating PDF. Please try again.');
    });
}

function generatePDFContent() {
    const currentDate = new Date().toLocaleDateString();
    const totalStudents = appData.estudiante ? appData.estudiante.length : 0;
    const averageGrade = calculateAverageGrade();
    const attendanceRate = calculateAttendanceRate();
    const passingRate = getPassingStudents();

    return `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <!-- Header -->
            <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #667eea; padding-bottom: 20px;">
                <h1 style="color: #667eea; margin: 0; font-size: 28px;">EduSync Academic Report</h1>
                <p style="margin: 5px 0; color: #666; font-size: 16px;">Generated on ${currentDate}</p>
            </div>

            <!-- Summary Statistics -->
            <div style="margin-bottom: 30px;">
                <h2 style="color: #2d3748; border-bottom: 1px solid #e2e8f0; padding-bottom: 10px;">Summary Statistics</h2>
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin-top: 20px;">
                    <div style="background: #f7fafc; padding: 15px; border-radius: 8px; border-left: 4px solid #667eea;">
                        <h3 style="margin: 0; color: #2d3748; font-size: 24px;">${totalStudents}</h3>
                        <p style="margin: 5px 0 0 0; color: #718096;">Total Students</p>
                    </div>
                    <div style="background: #f7fafc; padding: 15px; border-radius: 8px; border-left: 4px solid #f093fb;">
                        <h3 style="margin: 0; color: #2d3748; font-size: 24px;">${averageGrade}%</h3>
                        <p style="margin: 5px 0 0 0; color: #718096;">Average Grade</p>
                    </div>
                    <div style="background: #f7fafc; padding: 15px; border-radius: 8px; border-left: 4px solid #4facfe;">
                        <h3 style="margin: 0; color: #2d3748; font-size: 24px;">${attendanceRate}%</h3>
                        <p style="margin: 5px 0 0 0; color: #718096;">Attendance Rate</p>
                    </div>
                    <div style="background: #f7fafc; padding: 15px; border-radius: 8px; border-left: 4px solid #43e97b;">
                        <h3 style="margin: 0; color: #2d3748; font-size: 24px;">${passingRate}%</h3>
                        <p style="margin: 5px 0 0 0; color: #718096;">Passing Rate</p>
                    </div>
                </div>
            </div>

            <!-- Top Performing Students -->
            <div style="margin-bottom: 30px;">
                <h2 style="color: #2d3748; border-bottom: 1px solid #e2e8f0; padding-bottom: 10px;">Top Performing Students</h2>
                <div style="margin-top: 20px;">
                    ${generateTopStudentsPDF()}
                </div>
            </div>

            <!-- Attendance Summary -->
            <div style="margin-bottom: 30px;">
                <h2 style="color: #2d3748; border-bottom: 1px solid #e2e8f0; padding-bottom: 10px;">Attendance Summary</h2>
                <div style="margin-top: 20px;">
                    ${generateAttendancePDF()}
                </div>
            </div>

            <!-- Grades Distribution -->
            <div style="margin-bottom: 30px;">
                <h2 style="color: #2d3748; border-bottom: 1px solid #e2e8f0; padding-bottom: 10px;">Grades Distribution</h2>
                <div style="margin-top: 20px;">
                    ${generateGradesDistributionPDF()}
                </div>
            </div>

            <!-- Footer -->
            <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center; color: #718096; font-size: 12px;">
                <p>This report was generated by EduSync Academic Management System</p>
                <p>For more information, contact your system administrator</p>
            </div>
        </div>
    `;
}

function generateTopStudentsPDF() {
    if (!appData || !appData.estudiante || !appData.notas) {
        return '<p>No data available</p>';
    }

    const studentAverages = appData.estudiante.map(student => {
        const studentGrades = appData.notas.filter(nota => 
            nota.Estudiante_ID_Estudiante === student.ID_Estudiante
        );
        
        const average = studentGrades.length > 0 
            ? studentGrades.reduce((sum, nota) => sum + nota.Calificacion, 0) / studentGrades.length
            : 0;
        
        return {
            name: `${student.Nombre} ${student.Apellido}`,
            average: Math.round(average * 10) / 10,
            totalGrades: studentGrades.length
        };
    }).sort((a, b) => b.average - a.average).slice(0, 5);

    return `
        <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
            <thead>
                <tr style="background: #f7fafc;">
                    <th style="border: 1px solid #e2e8f0; padding: 12px; text-align: left;">Rank</th>
                    <th style="border: 1px solid #e2e8f0; padding: 12px; text-align: left;">Student Name</th>
                    <th style="border: 1px solid #e2e8f0; padding: 12px; text-align: center;">Average Grade</th>
                    <th style="border: 1px solid #e2e8f0; padding: 12px; text-align: center;">Total Grades</th>
                </tr>
            </thead>
            <tbody>
                ${studentAverages.map((student, index) => `
                    <tr>
                        <td style="border: 1px solid #e2e8f0; padding: 12px; text-align: center; font-weight: bold; color: #667eea;">${index + 1}</td>
                        <td style="border: 1px solid #e2e8f0; padding: 12px;">${student.name}</td>
                        <td style="border: 1px solid #e2e8f0; padding: 12px; text-align: center; font-weight: bold;">${student.average}/10</td>
                        <td style="border: 1px solid #e2e8f0; padding: 12px; text-align: center;">${student.totalGrades}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

function generateAttendancePDF() {
    if (!appData || !appData.estudiante || !appData.asistencia) {
        return '<p>No data available</p>';
    }

    const attendanceStats = appData.estudiante.map(student => {
        const studentAttendance = appData.asistencia.filter(record => 
            record.Estudiante_ID_Estudiante === student.ID_Estudiante
        );
        
        const presentCount = studentAttendance.filter(record => record.Presente === 'Y').length;
        const attendanceRate = studentAttendance.length > 0 
            ? Math.round((presentCount / studentAttendance.length) * 100)
            : 0;
        
        return {
            name: `${student.Nombre} ${student.Apellido}`,
            attendanceRate,
            totalClasses: studentAttendance.length,
            presentCount
        };
    }).sort((a, b) => b.attendanceRate - a.attendanceRate);

    return `
        <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
            <thead>
                <tr style="background: #f7fafc;">
                    <th style="border: 1px solid #e2e8f0; padding: 12px; text-align: left;">Student Name</th>
                    <th style="border: 1px solid #e2e8f0; padding: 12px; text-align: center;">Attendance Rate</th>
                    <th style="border: 1px solid #e2e8f0; padding: 12px; text-align: center;">Present Classes</th>
                    <th style="border: 1px solid #e2e8f0; padding: 12px; text-align: center;">Total Classes</th>
                </tr>
            </thead>
            <tbody>
                ${attendanceStats.map(student => `
                    <tr>
                        <td style="border: 1px solid #e2e8f0; padding: 12px;">${student.name}</td>
                        <td style="border: 1px solid #e2e8f0; padding: 12px; text-align: center; font-weight: bold; color: ${student.attendanceRate >= 80 ? '#43e97b' : student.attendanceRate >= 60 ? '#ffce56' : '#ff6384'};">${student.attendanceRate}%</td>
                        <td style="border: 1px solid #e2e8f0; padding: 12px; text-align: center;">${student.presentCount}</td>
                        <td style="border: 1px solid #e2e8f0; padding: 12px; text-align: center;">${student.totalClasses}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

function generateGradesDistributionPDF() {
    if (!appData || !appData.notas) {
        return '<p>No data available</p>';
    }

    const gradeRanges = [
        { label: '0-2', min: 0, max: 2 },
        { label: '2-4', min: 2, max: 4 },
        { label: '4-6', min: 4, max: 6 },
        { label: '6-8', min: 6, max: 8 },
        { label: '8-10', min: 8, max: 10 }
    ];

    const distribution = gradeRanges.map(range => {
        const count = appData.notas.filter(nota => 
            nota.Calificacion > range.min && nota.Calificacion <= range.max
        ).length;
        return { range: range.label, count };
    });

    return `
        <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
            <thead>
                <tr style="background: #f7fafc;">
                    <th style="border: 1px solid #e2e8f0; padding: 12px; text-align: left;">Grade Range</th>
                    <th style="border: 1px solid #e2e8f0; padding: 12px; text-align: center;">Number of Students</th>
                    <th style="border: 1px solid #e2e8f0; padding: 12px; text-align: center;">Percentage</th>
                </tr>
            </thead>
            <tbody>
                ${distribution.map(item => {
                    const percentage = appData.notas.length > 0 ? Math.round((item.count / appData.notas.length) * 100) : 0;
                    return `
                        <tr>
                            <td style="border: 1px solid #e2e8f0; padding: 12px; font-weight: bold;">${item.range}</td>
                            <td style="border: 1px solid #e2e8f0; padding: 12px; text-align: center;">${item.count}</td>
                            <td style="border: 1px solid #e2e8f0; padding: 12px; text-align: center;">${percentage}%</td>
                        </tr>
                    `;
                }).join('')}
            </tbody>
        </table>
    `;
}

function exportToCSV() {
    const currentDate = new Date().toISOString().split('T')[0];
    
    try {
        // Create CSV content for students data
        const studentsCSV = generateStudentsCSV();
        downloadCSV(studentsCSV, `students_report_${currentDate}.csv`);
        
        // Create CSV content for attendance data
        const attendanceCSV = generateAttendanceCSV();
        downloadCSV(attendanceCSV, `attendance_report_${currentDate}.csv`);
        
        // Create CSV content for grades data
        const gradesCSV = generateGradesCSV();
        downloadCSV(gradesCSV, `grades_report_${currentDate}.csv`);
        
        // Show success notification
        showExportNotification('CSV files downloaded successfully!', 'success');
    } catch (error) {
        console.error('Error generating CSV:', error);
        showExportNotification('Error generating CSV files. Please try again.', 'error');
    }
}

function generateStudentsCSV() {
    if (!appData || !appData.estudiante || !appData.notas) {
        return 'No data available';
    }

    const studentsData = appData.estudiante.map(student => {
        const studentGrades = appData.notas.filter(nota => 
            nota.Estudiante_ID_Estudiante === student.ID_Estudiante
        );
        
        const average = studentGrades.length > 0 
            ? studentGrades.reduce((sum, nota) => sum + nota.Calificacion, 0) / studentGrades.length
            : 0;
        
        const studentAttendance = appData.asistencia ? appData.asistencia.filter(record => 
            record.Estudiante_ID_Estudiante === student.ID_Estudiante
        ) : [];
        
        const presentCount = studentAttendance.filter(record => record.Presente === 'Y').length;
        const attendanceRate = studentAttendance.length > 0 
            ? Math.round((presentCount / studentAttendance.length) * 100)
            : 0;
        
        return {
            'Student ID': student.ID_Estudiante,
            'First Name': student.Nombre,
            'Last Name': student.Apellido,
            'Average Grade': Math.round(average * 10) / 10,
            'Total Grades': studentGrades.length,
            'Attendance Rate (%)': attendanceRate,
            'Present Classes': presentCount,
            'Total Classes': studentAttendance.length
        };
    });

    return convertToCSV(studentsData);
}

function generateAttendanceCSV() {
    if (!appData || !appData.asistencia || !appData.estudiante || !appData.materia) {
        return 'No data available';
    }

    const attendanceData = appData.asistencia.map(record => {
        const student = appData.estudiante.find(s => s.ID_Estudiante === record.Estudiante_ID_Estudiante);
        const materia = appData.materia.find(m => m.ID_materia === record.Materia_ID_materia);
        
        return {
            'Date': record.Fecha,
            'Student Name': student ? `${student.Nombre} ${student.Apellido}` : 'Unknown',
            'Subject': materia ? materia.Nombre : 'Unknown',
            'Status': record.Presente === 'Y' ? 'Present' : record.Presente === 'N' ? 'Absent' : record.Presente === 'T' ? 'Late' : 'Unknown',
            'Notes': record.Observaciones || ''
        };
    });

    return convertToCSV(attendanceData);
}

function generateGradesCSV() {
    if (!appData || !appData.notas || !appData.estudiante || !appData.evaluacion || !appData.materia) {
        return 'No data available';
    }

    const gradesData = appData.notas.map(nota => {
        const student = appData.estudiante.find(s => s.ID_Estudiante === nota.Estudiante_ID_Estudiante);
        const evaluacion = appData.evaluacion.find(e => e.ID_evaluacion === nota.Evaluacion_ID_evaluacion);
        const materia = evaluacion ? appData.materia.find(m => m.ID_materia === evaluacion.Materia_ID_materia) : null;
        
        return {
            'Student Name': student ? `${student.Nombre} ${student.Apellido}` : 'Unknown',
            'Subject': materia ? materia.Nombre : 'Unknown',
            'Evaluation': evaluacion ? evaluacion.Titulo : 'Unknown',
            'Grade': nota.Calificacion,
            'Date': nota.Fecha_calificacion,
            'Status': nota.Estado,
            'Notes': nota.Observacion || ''
        };
    });

    return convertToCSV(gradesData);
}

function convertToCSV(data) {
    if (!data || data.length === 0) return '';
    
    const headers = Object.keys(data[0]);
    const csvContent = [
        headers.join(','),
        ...data.map(row => 
            headers.map(header => {
                const value = row[header];
                // Escape commas and quotes in CSV
                if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
                    return `"${value.replace(/"/g, '""')}"`;
                }
                return value;
            }).join(',')
        )
    ].join('\n');
    
    return csvContent;
}

function downloadCSV(csvContent, filename) {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }
}

function printReport() {
    // Create a print-friendly version
    const printWindow = window.open('', '_blank');
    const currentDate = new Date().toLocaleDateString();
    
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>EduSync Academic Report</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
                .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #667eea; padding-bottom: 20px; }
                .section { margin-bottom: 30px; }
                .section h2 { color: #2d3748; border-bottom: 1px solid #e2e8f0; padding-bottom: 10px; }
                table { width: 100%; border-collapse: collapse; margin-top: 10px; }
                th, td { border: 1px solid #e2e8f0; padding: 12px; text-align: left; }
                th { background: #f7fafc; font-weight: bold; }
                .stats-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin: 20px 0; }
                .stat-card { background: #f7fafc; padding: 15px; border-radius: 8px; border-left: 4px solid #667eea; }
                @media print { body { margin: 0; } }
            </style>
        </head>
        <body>
            ${generatePDFContent()}
        </body>
        </html>
    `);
    
    printWindow.document.close();
    printWindow.focus();
    
    // Wait for content to load, then print
    setTimeout(() => {
        printWindow.print();
        printWindow.close();
    }, 500);
}

// Notification system for exports
function showExportNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.export-notification');
    existingNotifications.forEach(notification => notification.remove());
    
    const notification = document.createElement('div');
    notification.className = `export-notification export-notification-${type}`;
    notification.innerHTML = `
        <div style="
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#43e97b' : type === 'error' ? '#ff6384' : '#36a2eb'};
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000;
            display: flex;
            align-items: center;
            gap: 10px;
            font-weight: 500;
            max-width: 300px;
            animation: slideInRight 0.3s ease;
        ">
            <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
            <span>${message}</span>
            <button onclick="this.parentElement.parentElement.remove()" style="
                background: none;
                border: none;
                color: white;
                cursor: pointer;
                margin-left: 10px;
                font-size: 16px;
            ">&times;</button>
        </div>
    `;
    
    // Add animation styles if not already present
    if (!document.querySelector('#export-notification-styles')) {
        const style = document.createElement('style');
        style.id = 'export-notification-styles';
        style.textContent = `
            @keyframes slideInRight {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOutRight {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }
    
    document.body.appendChild(notification);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                if (notification.parentElement) {
                    notification.remove();
                }
            }, 300);
        }
    }, 5000);
}

// Utility functions
function calculateAverageGrade() {
    if (!appData || !appData.notas || appData.notas.length === 0) {
        return 0;
    }
    
    const totalGrades = appData.notas.reduce((sum, nota) => sum + nota.Calificacion, 0);
    const average = totalGrades / appData.notas.length;
    return Math.round(average * 10) / 10;
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

function getPassingStudents() {
    if (!appData || !appData.estudiante || !appData.notas) {
        return 0;
    }
    
    const passingStudents = appData.estudiante.filter(student => {
        const studentGrades = appData.notas.filter(nota => 
            nota.Estudiante_ID_Estudiante === student.ID_Estudiante
        );
        
        if (studentGrades.length === 0) return false;
        
        const average = studentGrades.reduce((sum, nota) => sum + nota.Calificacion, 0) / studentGrades.length;
        return average >= 6; // Passing grade is 6
    }).length;
    
    const totalStudents = appData.estudiante.length;
    return totalStudents > 0 ? Math.round((passingStudents / totalStudents) * 100) : 0;
}
