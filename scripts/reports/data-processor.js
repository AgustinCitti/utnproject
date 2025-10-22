// Data Processing Component
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

// Export data processing functions
window.getGradesDistribution = getGradesDistribution;
window.getAttendanceTrends = getAttendanceTrends;
window.getStudentPerformance = getStudentPerformance;
window.getSubjectComparison = getSubjectComparison;
window.calculateAverageGrade = calculateAverageGrade;
window.calculateAttendanceRate = calculateAttendanceRate;
window.getPassingStudents = getPassingStudents;
