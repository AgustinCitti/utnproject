// Data Processing Component

// Helper functions to get current user and filter data
function getCurrentUserId() {
    const userId = localStorage.getItem('userId');
    return userId ? parseInt(userId) : null;
}

function getCurrentUserSubjects() {
    const userId = getCurrentUserId();
    if (!userId || !window.data || !window.data.materia) {
        return [];
    }
    
    // Ensure both values are compared as integers to avoid type mismatch issues
    const userIdInt = parseInt(userId, 10);
    const subjects = window.data.materia.filter(subject => {
        const subjectTeacherId = parseInt(subject.Usuarios_docente_ID_docente, 10);
        return subjectTeacherId === userIdInt;
    });
    
    return subjects;
}

function getCurrentUserStudents() {
    const userId = getCurrentUserId();
    if (!userId || !window.data || !window.data.estudiante) return [];
    
    const userSubjects = getCurrentUserSubjects();
    const userSubjectIds = userSubjects.map(subject => parseInt(subject.ID_materia, 10));
    
    // Get students enrolled in user's subjects
    const enrolledStudentIds = window.data.alumnos_x_materia
        .filter(enrollment => userSubjectIds.includes(parseInt(enrollment.Materia_ID_materia, 10)))
        .map(enrollment => parseInt(enrollment.Estudiante_ID_Estudiante, 10));
    
    return window.data.estudiante.filter(student => 
        enrolledStudentIds.includes(parseInt(student.ID_Estudiante, 10))
    );
}

function getCurrentUserGrades() {
    const userId = getCurrentUserId();
    if (!userId || !window.data || !window.data.notas) return [];
    
    const userSubjects = getCurrentUserSubjects();
    const userSubjectIds = userSubjects.map(subject => parseInt(subject.ID_materia, 10));
    
    // Get evaluations for user's subjects
    const userEvaluations = window.data.evaluacion.filter(evaluation => 
        userSubjectIds.includes(parseInt(evaluation.Materia_ID_materia, 10))
    );
    const userEvaluationIds = userEvaluations.map(evaluation => parseInt(evaluation.ID_evaluacion, 10));
    
    // Get grades for these evaluations
    return window.data.notas.filter(nota => 
        userEvaluationIds.includes(parseInt(nota.Evaluacion_ID_evaluacion, 10))
    );
}

function getCurrentUserAttendance() {
    const userId = getCurrentUserId();
    if (!userId || !window.data || !window.data.asistencia) {
        console.warn('getCurrentUserAttendance: Missing prerequisites', {
            userId: userId,
            hasData: !!window.data,
            hasAsistencia: window.data && !!window.data.asistencia
        });
        return [];
    }
    
    const userSubjects = getCurrentUserSubjects();
    const userSubjectIds = userSubjects.map(subject => parseInt(subject.ID_materia, 10));
    
    const filtered = window.data.asistencia.filter(attendance => 
        userSubjectIds.includes(parseInt(attendance.Materia_ID_materia, 10))
    );
    
    return filtered;
}

function getGradesDistribution(subjectId = 'all') {
    if (!window.data || !window.data.notas) {
        return { labels: [], data: [] };
    }

    // Use current user's grades data
    let filteredGrades = getCurrentUserGrades();
    
    // Filter by subject if specified
    if (subjectId !== 'all') {
        const targetSubjectId = parseInt(subjectId, 10);
        const subjectEvaluations = window.data.evaluacion.filter(eval => 
            parseInt(eval.Materia_ID_materia, 10) === targetSubjectId
        );
        const subjectEvaluationIds = subjectEvaluations.map(eval => parseInt(eval.ID_evaluacion, 10));
        
        filteredGrades = filteredGrades.filter(nota => 
            subjectEvaluationIds.includes(parseInt(nota.Evaluacion_ID_evaluacion, 10))
        );
    }

    const gradeRanges = [
        { label: '0-2', min: 0, max: 2 },
        { label: '2-4', min: 2, max: 4 },
        { label: '4-6', min: 4, max: 6 },
        { label: '6-8', min: 6, max: 8 },
        { label: '8-10', min: 8, max: 10 }
    ];

    const distribution = gradeRanges.map(range => {
        const count = filteredGrades.filter(nota => 
            nota.Calificacion > range.min && nota.Calificacion <= range.max
        ).length;
        return count;
    });

    return {
        labels: gradeRanges.map(range => range.label),
        data: distribution
    };
}

function getAttendanceTrends(subjectId = 'all') {
    if (!window.data || !window.data.asistencia) {
        console.warn('getAttendanceTrends: No data or asistencia array available', {
            hasData: !!window.data,
            hasAsistencia: window.data && !!window.data.asistencia
        });
        return { labels: [], data: [] };
    }

    // Use current user's attendance data
    let filteredAttendance = getCurrentUserAttendance();
    
    // Filter by subject if specified
    if (subjectId !== 'all') {
        const targetSubjectId = parseInt(subjectId, 10);
        filteredAttendance = filteredAttendance.filter(record => 
            parseInt(record.Materia_ID_materia, 10) === targetSubjectId
        );
    }

    if (filteredAttendance.length === 0) {
        // Only log in debug mode to reduce console noise
        if (window.DEBUG_MODE) {
            console.warn('getAttendanceTrends: No attendance records after filtering');
        }
        return { labels: [], data: [] };
    }

    // Group attendance by month
    const monthlyAttendance = {};
    filteredAttendance.forEach(record => {
        // Skip records with NULL or empty Presente (invalid attendance records)
        if (!record.Presente || record.Presente === null || record.Presente === '') {
            console.warn('getAttendanceTrends: Skipping record with NULL or empty Presente', record);
            return; // Skip invalid attendance records
        }
        
        // Handle date parsing more robustly
        let date;
        if (record.Fecha) {
            // If Fecha is already a string in YYYY-MM-DD format, parse it directly
            if (typeof record.Fecha === 'string' && record.Fecha.match(/^\d{4}-\d{2}-\d{2}$/)) {
                const [year, month, day] = record.Fecha.split('-').map(Number);
                date = new Date(year, month - 1, day); // month is 0-indexed in Date
            } else {
                date = new Date(record.Fecha);
            }
        } else {
            console.warn('getAttendanceTrends: Record missing Fecha field', record);
            return; // Skip records without dates
        }
        
        // Check if date is valid
        if (isNaN(date.getTime())) {
            console.warn('getAttendanceTrends: Invalid date for record', record.Fecha, record);
            return; // Skip invalid dates
        }
        
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        
        if (!monthlyAttendance[monthKey]) {
            monthlyAttendance[monthKey] = { total: 0, present: 0 };
        }
        
        monthlyAttendance[monthKey].total++;
        // Check for present values: 'P' (new format) or 'Y' (old format for compatibility)
        // Also handle uppercase/lowercase variations
        const presente = String(record.Presente).toUpperCase();
        if (presente === 'P' || presente === 'Y') {
            monthlyAttendance[monthKey].present++;
        }
    });

    const labels = Object.keys(monthlyAttendance).sort();
    const data = labels.map(month => {
        const stats = monthlyAttendance[month];
        // Calculate percentage, avoiding division by zero
        const percentage = stats.total > 0 ? Math.round((stats.present / stats.total) * 100) : 0;
        return percentage;
    });
    
    // Format labels for better display (e.g., "2024-11" -> "Nov 2024")
    const formattedLabels = labels.map(month => {
        const [year, monthNum] = month.split('-');
        const date = new Date(parseInt(year), parseInt(monthNum) - 1, 1);
        const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
        return `${monthNames[date.getMonth()]} ${year}`;
    });
    
    return { labels: formattedLabels, data };
}

function getStudentPerformance(studentId = 'all', subjectId = 'all') {
    if (!window.data || !window.data.estudiante || !window.data.notas) {
        return { labels: [], datasets: [] };
    }

    // Use current user's subjects and students data
    let teacherSubjects = getCurrentUserSubjects();
    let teacherStudents = getCurrentUserStudents();
    
    // Filter by specific subject if specified
    if (subjectId !== 'all') {
        const targetSubjectId = parseInt(subjectId, 10);
        teacherSubjects = teacherSubjects.filter(materia => 
            parseInt(materia.ID_materia, 10) === targetSubjectId
        );
    }
    
    // Filter by specific student if specified
    if (studentId !== 'all') {
        teacherStudents = teacherStudents.filter(student => 
            student.ID_Estudiante === parseInt(studentId)
        );
    }
    
    const labels = teacherSubjects.map(materia => materia.Nombre);
    
    const datasets = teacherStudents.slice(0, 3).map((student, index) => {
        const studentGrades = window.data.notas.filter(nota => 
            parseInt(nota.Estudiante_ID_Estudiante, 10) === parseInt(student.ID_Estudiante, 10)
        );
        
        const data = teacherSubjects.map(materia => {
            const materiaGrades = studentGrades.filter(nota => {
                const evaluacion = window.data.evaluacion.find(eval => 
                    parseInt(eval.ID_evaluacion, 10) === parseInt(nota.Evaluacion_ID_evaluacion, 10)
                );
                return evaluacion && parseInt(evaluacion.Materia_ID_materia, 10) === parseInt(materia.ID_materia, 10);
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
    if (!window.data || !window.data.materia || !window.data.notas) {
        return { labels: [], data: [] };
    }

    // Use current user's subjects data
    const teacherSubjects = getCurrentUserSubjects();

    const subjectStats = teacherSubjects.map(materia => {
        const materiaEvaluaciones = window.data.evaluacion.filter(eval => 
            parseInt(eval.Materia_ID_materia, 10) === parseInt(materia.ID_materia, 10)
        );
        
        const materiaNotas = window.data.notas.filter(nota => 
            materiaEvaluaciones.some(eval => parseInt(eval.ID_evaluacion, 10) === parseInt(nota.Evaluacion_ID_evaluacion, 10))
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

function calculateAverageGrade(subjectId = 'all') {
    if (!window.data || !window.data.notas || window.data.notas.length === 0) {
        return 0;
    }
    
    // Use current user's grades data
    let filteredGrades = getCurrentUserGrades();
    
    // Filter by subject if specified
    if (subjectId !== 'all') {
        const targetSubjectId = parseInt(subjectId, 10);
        const subjectEvaluations = window.data.evaluacion.filter(eval => 
            parseInt(eval.Materia_ID_materia, 10) === targetSubjectId
        );
        const subjectEvaluationIds = subjectEvaluations.map(eval => parseInt(eval.ID_evaluacion, 10));
        
        filteredGrades = filteredGrades.filter(nota => 
            subjectEvaluationIds.includes(parseInt(nota.Evaluacion_ID_evaluacion, 10))
        );
    }
    
    if (filteredGrades.length === 0) {
        return 0;
    }
    
    const totalGrades = filteredGrades.reduce((sum, nota) => sum + nota.Calificacion, 0);
    const average = totalGrades / filteredGrades.length;
    return Math.round(average * 10) / 10;
}

function calculateAttendanceRate(subjectId = 'all') {
    if (!window.data || !window.data.asistencia || window.data.asistencia.length === 0) {
        return 0;
    }
    
    // Use current user's attendance data
    let filteredAttendance = getCurrentUserAttendance();
    
    // Filter by subject if specified
    if (subjectId !== 'all') {
        const targetSubjectId = parseInt(subjectId, 10);
        filteredAttendance = filteredAttendance.filter(record => 
            parseInt(record.Materia_ID_materia, 10) === targetSubjectId
        );
    }
    
    if (filteredAttendance.length === 0) {
        return 0;
    }
    
    const totalRecords = filteredAttendance.length;
    // Support both 'P' (new format) and 'Y' (old format for compatibility)
    const presentRecords = filteredAttendance.filter(record => record.Presente === 'P' || record.Presente === 'Y').length;
    const attendanceRate = (presentRecords / totalRecords) * 100;
    return Math.round(attendanceRate);
}

function getPassingStudents(subjectId = 'all') {
    if (!window.data || !window.data.estudiante || !window.data.notas) {
        return 0;
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
    
    const passingStudents = teacherStudents.filter(student => {
        const studentGrades = filteredGrades.filter(nota => 
            parseInt(nota.Estudiante_ID_Estudiante, 10) === parseInt(student.ID_Estudiante, 10)
        );
        
        if (studentGrades.length === 0) return false;
        
        const average = studentGrades.reduce((sum, nota) => sum + nota.Calificacion, 0) / studentGrades.length;
        return average >= 6; // Passing grade is 6
    }).length;
    
    const totalStudents = teacherStudents.length;
    return totalStudents > 0 ? Math.round((passingStudents / totalStudents) * 100) : 0;
}


// Export data processing functions
window.getGradesDistribution = getGradesDistribution;
window.getAttendanceTrends = getAttendanceTrends;
window.getStudentPerformance = getStudentPerformance;
window.getSubjectComparison = getSubjectComparison;
window.calculateAverageGrade = calculateAverageGrade;
window.calculateAttendanceRate = calculateAttendanceRate;
window.getPassingStudents = getPassingStudents;

// Export helper functions for user filtering
window.getCurrentUserId = getCurrentUserId;
window.getCurrentUserSubjects = getCurrentUserSubjects;
window.getCurrentUserStudents = getCurrentUserStudents;
window.getCurrentUserGrades = getCurrentUserGrades;
window.getCurrentUserAttendance = getCurrentUserAttendance;
