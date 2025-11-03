// Report Generation Component
function generateDetailedReports() {
    generateTopStudentsReport();
    generateAttendanceReport();
}

function generateTopStudentsReport() {
    const container = document.getElementById('topStudentsReport');
    if (!container) return;

    if (!window.data || !window.data.estudiante || !window.data.notas) {
        container.innerHTML = '<p>No data available</p>';
        return;
    }

    // Use current user's students and grades data
    const teacherStudents = getCurrentUserStudents();
    const filteredGrades = getCurrentUserGrades();

    const studentAverages = teacherStudents.map(student => {
        const studentGrades = filteredGrades.filter(nota => 
            parseInt(nota.Estudiante_ID_Estudiante, 10) === parseInt(student.ID_Estudiante, 10)
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

    if (!window.data || !window.data.estudiante || !window.data.asistencia) {
        container.innerHTML = '<p>No data available</p>';
        return;
    }

    // Use current user's students and attendance data
    const teacherStudents = getCurrentUserStudents();
    const filteredAttendance = getCurrentUserAttendance();

    const attendanceStats = teacherStudents.map(student => {
        const studentAttendance = filteredAttendance.filter(record => 
            parseInt(record.Estudiante_ID_Estudiante, 10) === parseInt(student.ID_Estudiante, 10)
        );
        
        // Support both 'P' (new format) and 'Y' (old format for compatibility)
        const presentCount = studentAttendance.filter(record => record.Presente === 'P' || record.Presente === 'Y').length;
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

function populateFilters() {
    // Populate subject filters with current user's subjects
    const gradesFilter = document.getElementById('gradesSubjectFilter');
    const attendanceFilter = document.getElementById('attendanceSubjectFilter');
    
    // Get current user's subjects
    const userSubjects = getCurrentUserSubjects();
    
    if (userSubjects.length > 0) {
        userSubjects.forEach(materia => {
            const option = document.createElement('option');
            option.value = materia.ID_materia;
            option.textContent = materia.Nombre;
            
            if (gradesFilter) {
                // Check if option already exists to avoid duplicates
                const existingOption = Array.from(gradesFilter.options).find(
                    opt => opt.value === String(materia.ID_materia)
                );
                if (!existingOption) {
                    gradesFilter.appendChild(option.cloneNode(true));
                }
            }
            if (attendanceFilter) {
                // Check if option already exists to avoid duplicates
                const existingOption = Array.from(attendanceFilter.options).find(
                    opt => opt.value === String(materia.ID_materia)
                );
                if (!existingOption) {
                    attendanceFilter.appendChild(option.cloneNode(true));
                }
            }
        });
    } else {
        console.warn('populateFilters: No subjects found for current user');
    }

    // Populate student filter with current user's students
    const studentFilter = document.getElementById('performanceStudentFilter');
    const userStudents = getCurrentUserStudents();
    if (userStudents.length > 0 && studentFilter) {
        userStudents.forEach(student => {
            const option = document.createElement('option');
            option.value = student.ID_Estudiante;
            option.textContent = `${student.Nombre} ${student.Apellido}`;
            studentFilter.appendChild(option);
        });
    }
}

// Export report generation functions
window.generateDetailedReports = generateDetailedReports;
window.generateTopStudentsReport = generateTopStudentsReport;
window.generateAttendanceReport = generateAttendanceReport;
window.populateFilters = populateFilters;
