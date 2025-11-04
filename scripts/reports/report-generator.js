// Report Generation Component
function generateDetailedReports(subjectId = 'all') {
    generateTopStudentsReport(subjectId);
    generateAttendanceReport(subjectId);
}

function generateTopStudentsReport(subjectId = 'all') {
    const container = document.getElementById('topStudentsReport');
    if (!container) return;

    if (!window.data || !window.data.estudiante || !window.data.notas) {
        container.innerHTML = '<p>No data available</p>';
        return;
    }

    // Use current user's students and grades data
    let teacherStudents = getCurrentUserStudents();
    let filteredGrades = getCurrentUserGrades();
    
    // Filter by subject if specified
    if (subjectId !== 'all') {
        const targetSubjectId = parseInt(subjectId, 10);
        // Filter students enrolled in this subject
        const subjectStudents = window.data.alumnos_x_materia
            .filter(enrollment => parseInt(enrollment.Materia_ID_materia, 10) === targetSubjectId)
            .map(enrollment => parseInt(enrollment.Estudiante_ID_Estudiante, 10));
        teacherStudents = teacherStudents.filter(student => 
            subjectStudents.includes(parseInt(student.ID_Estudiante, 10))
        );
        
        // Filter grades for this subject
        const subjectEvaluations = window.data.evaluacion.filter(eval => 
            parseInt(eval.Materia_ID_materia, 10) === targetSubjectId
        );
        const subjectEvaluationIds = subjectEvaluations.map(eval => parseInt(eval.ID_evaluacion, 10));
        filteredGrades = filteredGrades.filter(nota => 
            subjectEvaluationIds.includes(parseInt(nota.Evaluacion_ID_evaluacion, 10))
        );
    }

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

function generateAttendanceReport(subjectId = 'all') {
    const container = document.getElementById('attendanceReport');
    if (!container) return;

    if (!window.data || !window.data.estudiante || !window.data.asistencia) {
        container.innerHTML = '<p>No data available</p>';
        return;
    }

    // Use current user's students and attendance data
    let teacherStudents = getCurrentUserStudents();
    let filteredAttendance = getCurrentUserAttendance();
    
    // Filter by subject if specified
    if (subjectId !== 'all') {
        const targetSubjectId = parseInt(subjectId, 10);
        // Filter students enrolled in this subject
        const subjectStudents = window.data.alumnos_x_materia
            .filter(enrollment => parseInt(enrollment.Materia_ID_materia, 10) === targetSubjectId)
            .map(enrollment => parseInt(enrollment.Estudiante_ID_Estudiante, 10));
        teacherStudents = teacherStudents.filter(student => 
            subjectStudents.includes(parseInt(student.ID_Estudiante, 10))
        );
        
        // Filter attendance for this subject
        filteredAttendance = filteredAttendance.filter(record => 
            parseInt(record.Materia_ID_materia, 10) === targetSubjectId
        );
    }

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
    // Populate global subject filter with current user's subjects
    const globalFilter = document.getElementById('globalSubjectFilter');
    
    // Get current user's subjects
    const userSubjects = getCurrentUserSubjects();
    
    if (globalFilter && userSubjects.length > 0) {
        userSubjects.forEach(materia => {
            // Check if option already exists to avoid duplicates
            const existingOption = Array.from(globalFilter.options).find(
                opt => opt.value === String(materia.ID_materia)
            );
            if (!existingOption) {
                const option = document.createElement('option');
                option.value = materia.ID_materia;
                option.textContent = materia.Nombre;
                globalFilter.appendChild(option);
            }
        });
    } else if (userSubjects.length === 0) {
        console.warn('populateFilters: No subjects found for current user');
    }
}

// Export report generation functions
window.generateDetailedReports = generateDetailedReports;
window.generateTopStudentsReport = generateTopStudentsReport;
window.generateAttendanceReport = generateAttendanceReport;
window.populateFilters = populateFilters;
