// Data Processing Component

// Helper functions to get current user and filter data
function getCurrentUserId() {
    const userId = localStorage.getItem('userId');
    return userId ? parseInt(userId) : null;
}

function getCurrentUserSubjects() {
    const userId = getCurrentUserId();
    if (!userId || !window.data || !window.data.materia) return [];
    
    return window.data.materia.filter(subject => 
        subject.Usuarios_docente_ID_docente === userId
    );
}

function getCurrentUserStudents() {
    const userId = getCurrentUserId();
    if (!userId || !window.data || !window.data.estudiante) return [];
    
    const userSubjects = getCurrentUserSubjects();
    const userSubjectIds = userSubjects.map(subject => subject.ID_materia);
    
    // Get students enrolled in user's subjects
    const enrolledStudentIds = window.data.alumnos_x_materia
        .filter(enrollment => userSubjectIds.includes(enrollment.Materia_ID_materia))
        .map(enrollment => enrollment.Estudiante_ID_Estudiante);
    
    return window.data.estudiante.filter(student => 
        enrolledStudentIds.includes(student.ID_Estudiante)
    );
}

function getCurrentUserGrades() {
    const userId = getCurrentUserId();
    if (!userId || !window.data || !window.data.notas) return [];
    
    const userSubjects = getCurrentUserSubjects();
    const userSubjectIds = userSubjects.map(subject => subject.ID_materia);
    
    // Get evaluations for user's subjects
    const userEvaluations = window.data.evaluacion.filter(evaluation => 
        userSubjectIds.includes(evaluation.Materia_ID_materia)
    );
    const userEvaluationIds = userEvaluations.map(evaluation => evaluation.ID_evaluacion);
    
    // Get grades for these evaluations
    return window.data.notas.filter(nota => 
        userEvaluationIds.includes(nota.Evaluacion_ID_evaluacion)
    );
}

function getCurrentUserAttendance() {
    const userId = getCurrentUserId();
    if (!userId || !window.data || !window.data.asistencia) return [];
    
    const userSubjects = getCurrentUserSubjects();
    const userSubjectIds = userSubjects.map(subject => subject.ID_materia);
    
    return window.data.asistencia.filter(attendance => 
        userSubjectIds.includes(attendance.Materia_ID_materia)
    );
}

function getGradesDistribution(subjectId = 'all') {
    if (!window.data || !window.data.notas) {
        console.warn('getGradesDistribution: No data available', { data: window.data, notas: window.data?.notas });
        return { labels: [], data: [] };
    }

    console.log('getGradesDistribution called with subjectId:', subjectId);

    // Use current user's grades data
    let filteredGrades = getCurrentUserGrades();
    console.log('Initial filtered grades count:', filteredGrades.length);
    
    // Filter by subject if specified
    if (subjectId !== 'all') {
        const subjectEvaluations = window.data.evaluacion.filter(eval => 
            eval.Materia_ID_materia === parseInt(subjectId)
        );
        const subjectEvaluationIds = subjectEvaluations.map(eval => eval.ID_evaluacion);
        
        filteredGrades = filteredGrades.filter(nota => 
            subjectEvaluationIds.includes(nota.Evaluacion_ID_evaluacion)
        );
        console.log('After subject filter, grades count:', filteredGrades.length);
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
        console.warn('getAttendanceTrends: No data available', { data: window.data, asistencia: window.data?.asistencia });
        return { labels: [], data: [] };
    }

    // Use current user's attendance data
    let filteredAttendance = getCurrentUserAttendance();
    
    // Filter by subject if specified
    if (subjectId !== 'all') {
        filteredAttendance = filteredAttendance.filter(record => 
            record.Materia_ID_materia === parseInt(subjectId)
        );
    }

    // Group attendance by month
    const monthlyAttendance = {};
    filteredAttendance.forEach(record => {
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

function getStudentPerformance(studentId = 'all') {
    if (!window.data || !window.data.estudiante || !window.data.notas) {
        return { labels: [], datasets: [] };
    }

    // Use current user's subjects and students data
    const teacherSubjects = getCurrentUserSubjects();
    let teacherStudents = getCurrentUserStudents();
    
    // Filter by specific student if specified
    if (studentId !== 'all') {
        teacherStudents = teacherStudents.filter(student => 
            student.ID_Estudiante === parseInt(studentId)
        );
    }
    
    const labels = teacherSubjects.map(materia => materia.Nombre);
    
    const datasets = teacherStudents.slice(0, 3).map((student, index) => {
        const studentGrades = window.data.notas.filter(nota => 
            nota.Estudiante_ID_Estudiante === student.ID_Estudiante
        );
        
        const data = teacherSubjects.map(materia => {
            const materiaGrades = studentGrades.filter(nota => {
                const evaluacion = window.data.evaluacion.find(eval => eval.ID_evaluacion === nota.Evaluacion_ID_evaluacion);
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
    if (!window.data || !window.data.materia || !window.data.notas) {
        return { labels: [], data: [] };
    }

    // Use current user's subjects data
    const teacherSubjects = getCurrentUserSubjects();

    const subjectStats = teacherSubjects.map(materia => {
        const materiaEvaluaciones = window.data.evaluacion.filter(eval => 
            eval.Materia_ID_materia === materia.ID_materia
        );
        
        const materiaNotas = window.data.notas.filter(nota => 
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

function calculateAverageGrade() {
    if (!window.data || !window.data.notas || window.data.notas.length === 0) {
        console.warn('calculateAverageGrade: No data available', { data: window.data, notas: window.data?.notas });
        return 0;
    }
    
    // Use current user's grades data
    const filteredGrades = getCurrentUserGrades();
    
    if (filteredGrades.length === 0) {
        return 0;
    }
    
    const totalGrades = filteredGrades.reduce((sum, nota) => sum + nota.Calificacion, 0);
    const average = totalGrades / filteredGrades.length;
    return Math.round(average * 10) / 10;
}

function calculateAttendanceRate() {
    if (!window.data || !window.data.asistencia || window.data.asistencia.length === 0) {
        console.warn('calculateAttendanceRate: No data available', { data: window.data, asistencia: window.data?.asistencia });
        return 0;
    }
    
    // Use current user's attendance data
    const filteredAttendance = getCurrentUserAttendance();
    
    if (filteredAttendance.length === 0) {
        return 0;
    }
    
    const totalRecords = filteredAttendance.length;
    const presentRecords = filteredAttendance.filter(record => record.Presente === 'Y').length;
    const attendanceRate = (presentRecords / totalRecords) * 100;
    return Math.round(attendanceRate);
}

function getPassingStudents() {
    if (!window.data || !window.data.estudiante || !window.data.notas) {
        return 0;
    }
    
    // Use current user's students and grades data
    const teacherStudents = getCurrentUserStudents();
    const filteredGrades = getCurrentUserGrades();
    
    const passingStudents = teacherStudents.filter(student => {
        const studentGrades = filteredGrades.filter(nota => 
            nota.Estudiante_ID_Estudiante === student.ID_Estudiante
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
