// Export Management Component
function exportReport(format) {
    if (format === 'pdf') {
        exportToPDF();
    } else if (format === 'excel') {
        exportToExcel();
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
        document.body.removeChild(loadingDiv);
        alert('Error generating PDF. Please try again.');
    });
}

function generatePDFContent() {
    const currentDate = new Date().toLocaleDateString();
    const totalStudents = window.data && window.data.estudiante ? window.data.estudiante.length : 0;
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
                <h2 style="color: #2d3748; border-bottom: 1px solid #e2e8f0; padding-bottom: 10px;">Estudiantes con Mejor Rendimiento</h2>
                <div style="margin-top: 20px;">
                    ${generateTopStudentsPDF()}
                </div>
            </div>

            <!-- Attendance Summary -->
            <div style="margin-bottom: 30px;">
                <h2 style="color: #2d3748; border-bottom: 1px solid #e2e8f0; padding-bottom: 10px;">Resumen de Asistencia</h2>
                <div style="margin-top: 20px;">
                    ${generateAttendancePDF()}
                </div>
            </div>

            <!-- Grades Distribution -->
            <div style="margin-bottom: 30px;">
                <h2 style="color: #2d3748; border-bottom: 1px solid #e2e8f0; padding-bottom: 10px;">Distribución de Calificaciones</h2>
                <div style="margin-top: 20px;">
                    ${generateGradesDistributionPDF()}
                </div>
            </div>

            <!-- Detailed Grades List -->
            <div style="margin-bottom: 30px;">
                <h2 style="color: #2d3748; border-bottom: 1px solid #e2e8f0; padding-bottom: 10px;">Lista Detallada de Notas</h2>
                <div style="margin-top: 20px;">
                    ${generateDetailedGradesPDF()}
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
    if (!window.data || !window.data.estudiante || !window.data.notas) {
        return '<p>No data available</p>';
    }

    const studentAverages = window.data.estudiante.map(student => {
        const studentGrades = window.data.notas.filter(nota => 
            nota.Estudiante_ID_Estudiante === student.ID_Estudiante
        );
        
        const average = studentGrades.length > 0 
            ? studentGrades.reduce((sum, nota) => sum + nota.Calificacion, 0) / studentGrades.length
            : 0;
        
        return {
            nombre: student.Nombre,
            apellido: student.Apellido,
            average: Math.round(average * 10) / 10,
            totalGrades: studentGrades.length
        };
    }).sort((a, b) => b.average - a.average).slice(0, 5);

    return `
        <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
            <thead>
                <tr style="background: #f7fafc;">
                    <th style="border: 1px solid #e2e8f0; padding: 12px; text-align: left;">Rank</th>
                    <th style="border: 1px solid #e2e8f0; padding: 12px; text-align: left;">Nombre</th>
                    <th style="border: 1px solid #e2e8f0; padding: 12px; text-align: left;">Apellido</th>
                    <th style="border: 1px solid #e2e8f0; padding: 12px; text-align: center;">Promedio</th>
                    <th style="border: 1px solid #e2e8f0; padding: 12px; text-align: center;">Total Notas</th>
                </tr>
            </thead>
            <tbody>
                ${studentAverages.map((student, index) => `
                    <tr>
                        <td style="border: 1px solid #e2e8f0; padding: 12px; text-align: center; font-weight: bold; color: #667eea;">${index + 1}</td>
                        <td style="border: 1px solid #e2e8f0; padding: 12px;">${student.nombre}</td>
                        <td style="border: 1px solid #e2e8f0; padding: 12px;">${student.apellido}</td>
                        <td style="border: 1px solid #e2e8f0; padding: 12px; text-align: center; font-weight: bold;">${student.average}/10</td>
                        <td style="border: 1px solid #e2e8f0; padding: 12px; text-align: center;">${student.totalGrades}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

function generateAttendancePDF() {
    if (!window.data || !window.data.estudiante || !window.data.asistencia) {
        return '<p>No data available</p>';
    }

    const attendanceStats = window.data.estudiante.map(student => {
        const studentAttendance = window.data.asistencia.filter(record => 
            record.Estudiante_ID_Estudiante === student.ID_Estudiante
        );
        
        // Support both 'P' (new format) and 'Y' (old format for compatibility)
        const presentCount = studentAttendance.filter(record => record.Presente === 'P' || record.Presente === 'Y').length;
        const attendanceRate = studentAttendance.length > 0 
            ? Math.round((presentCount / studentAttendance.length) * 100)
            : 0;
        
        return {
            nombre: student.Nombre,
            apellido: student.Apellido,
            attendanceRate,
            totalClasses: studentAttendance.length,
            presentCount
        };
    }).sort((a, b) => b.attendanceRate - a.attendanceRate);

    return `
        <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
            <thead>
                <tr style="background: #f7fafc;">
                    <th style="border: 1px solid #e2e8f0; padding: 12px; text-align: left;">Nombre</th>
                    <th style="border: 1px solid #e2e8f0; padding: 12px; text-align: left;">Apellido</th>
                    <th style="border: 1px solid #e2e8f0; padding: 12px; text-align: center;">Porcentaje Asistencia</th>
                    <th style="border: 1px solid #e2e8f0; padding: 12px; text-align: center;">Clases Presente</th>
                    <th style="border: 1px solid #e2e8f0; padding: 12px; text-align: center;">Total Clases</th>
                </tr>
            </thead>
            <tbody>
                ${attendanceStats.map(student => `
                    <tr>
                        <td style="border: 1px solid #e2e8f0; padding: 12px;">${student.nombre}</td>
                        <td style="border: 1px solid #e2e8f0; padding: 12px;">${student.apellido}</td>
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
    if (!window.data || !window.data.notas) {
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
        const count = window.data.notas.filter(nota => 
            nota.Calificacion > range.min && nota.Calificacion <= range.max
        ).length;
        return { range: range.label, count };
    });

    return `
        <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
            <thead>
                <tr style="background: #f7fafc;">
                    <th style="border: 1px solid #e2e8f0; padding: 12px; text-align: left;">Rango de Calificación</th>
                    <th style="border: 1px solid #e2e8f0; padding: 12px; text-align: center;">Cantidad de Estudiantes</th>
                    <th style="border: 1px solid #e2e8f0; padding: 12px; text-align: center;">Porcentaje</th>
                </tr>
            </thead>
            <tbody>
                ${distribution.map(item => {
                    const percentage = window.data.notas.length > 0 ? Math.round((item.count / window.data.notas.length) * 100) : 0;
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

function generateDetailedGradesPDF() {
    if (!window.data || !window.data.notas || !window.data.estudiante || !window.data.evaluacion || !window.data.materia) {
        return '<p>No hay datos disponibles</p>';
    }

    // Limitar a las primeras 50 notas para evitar PDFs muy largos
    const limitedNotes = window.data.notas.slice(0, 50).map(nota => {
        const student = window.data.estudiante.find(s => s.ID_Estudiante === nota.Estudiante_ID_Estudiante);
        const evaluacion = window.data.evaluacion.find(e => e.ID_evaluacion === nota.Evaluacion_ID_evaluacion);
        const materia = evaluacion ? window.data.materia.find(m => m.ID_materia === evaluacion.Materia_ID_materia) : null;
        
        return {
            nombre: student ? student.Nombre : '',
            apellido: student ? student.Apellido : '',
            materia: materia ? materia.Nombre : '',
            evaluacion: evaluacion ? evaluacion.Titulo : '',
            calificacion: (nota.Calificacion !== null && nota.Calificacion !== undefined && nota.Calificacion !== '') ? nota.Calificacion : '',
            fecha: nota.Fecha_calificacion || (evaluacion ? evaluacion.Fecha : '')
        };
    });

    return `
        <table style="width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 12px; font-family: Arial, sans-serif;">
            <thead>
                <tr style="background: #667eea; color: white;">
                    <th style="border: 1px solid #e2e8f0; padding: 12px; text-align: left; font-weight: bold;">Apellido</th>
                    <th style="border: 1px solid #e2e8f0; padding: 12px; text-align: left; font-weight: bold;">Nombre</th>
                    <th style="border: 1px solid #e2e8f0; padding: 12px; text-align: left; font-weight: bold;">Materia</th>
                    <th style="border: 1px solid #e2e8f0; padding: 12px; text-align: left; font-weight: bold;">Evaluación</th>
                    <th style="border: 1px solid #e2e8f0; padding: 12px; text-align: center; font-weight: bold; width: 100px;">Calificación</th>
                    <th style="border: 1px solid #e2e8f0; padding: 12px; text-align: center; font-weight: bold; width: 120px;">Fecha</th>
                </tr>
            </thead>
            <tbody>
                ${limitedNotes.map((nota, index) => `
                    <tr style="background: ${index % 2 === 0 ? '#ffffff' : '#f8f9fa'};">
                        <td style="border: 1px solid #e2e8f0; padding: 10px;">${nota.apellido || ''}</td>
                        <td style="border: 1px solid #e2e8f0; padding: 10px;">${nota.nombre || ''}</td>
                        <td style="border: 1px solid #e2e8f0; padding: 10px;">${nota.materia || ''}</td>
                        <td style="border: 1px solid #e2e8f0; padding: 10px;">${nota.evaluacion || ''}</td>
                        <td style="border: 1px solid #e2e8f0; padding: 10px; text-align: center; font-weight: ${nota.calificacion ? 'bold' : 'normal'}; color: ${nota.calificacion ? (nota.calificacion >= 8 ? '#43e97b' : nota.calificacion >= 6 ? '#ffce56' : '#ff6384') : '#999'};">
                            ${nota.calificacion || ''}
                        </td>
                        <td style="border: 1px solid #e2e8f0; padding: 10px; text-align: center;">${nota.fecha || ''}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
        ${window.data.notas.length > 50 ? `<p style="margin-top: 15px; color: #718096; font-size: 12px; text-align: center;">Mostrando las primeras 50 notas de ${window.data.notas.length} totales. Use la exportación Excel para ver todas las notas.</p>` : ''}
    `;
}

function exportToExcel() {
    const currentDate = new Date().toISOString().split('T')[0];
    
    // Obtener el filtro de materia seleccionado
    const globalSubjectFilter = document.getElementById('globalSubjectFilter');
    const materiaId = globalSubjectFilter ? globalSubjectFilter.value : 'all';
    
    // Obtener nombre de la materia para el nombre del archivo
    let materiaNombre = '';
    if (materiaId !== 'all' && materiaId) {
        const materia = window.data && window.data.materia 
            ? window.data.materia.find(m => parseInt(m.ID_materia, 10) === parseInt(materiaId, 10))
            : null;
        materiaNombre = materia ? `_${materia.Nombre.replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ]/g, '_')}` : '';
    }
    
    try {
        // Create Excel content for attendance data
        const attendanceExcel = generateAttendanceCSV(materiaId);
        downloadExcel(attendanceExcel, `lista_asistencia${materiaNombre}_${currentDate}.xls`);
        
        // Create Excel content for grades data
        const gradesExcel = generateGradesCSV(materiaId);
        downloadExcel(gradesExcel, `lista_notas${materiaNombre}_${currentDate}.xls`);
        
        // Show success notification
        showExportNotification('Archivos Excel descargados exitosamente!', 'success');
    } catch (error) {
        showExportNotification('Error al generar archivos Excel. Por favor, intente nuevamente.', 'error');
    }
}

function generateStudentsCSV() {
    if (!window.data || !window.data.estudiante || !window.data.notas) {
        return 'No data available';
    }

    const studentsData = window.data.estudiante.map(student => {
        const studentGrades = window.data.notas.filter(nota => 
            nota.Estudiante_ID_Estudiante === student.ID_Estudiante
        );
        
        const average = studentGrades.length > 0 
            ? studentGrades.reduce((sum, nota) => sum + nota.Calificacion, 0) / studentGrades.length
            : 0;
        
        const studentAttendance = window.data.asistencia ? window.data.asistencia.filter(record => 
            record.Estudiante_ID_Estudiante === student.ID_Estudiante
        ) : [];
        
        // Support both 'P' (new format) and 'Y' (old format for compatibility)
        const presentCount = studentAttendance.filter(record => record.Presente === 'P' || record.Presente === 'Y').length;
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

function generateAttendanceCSV(materiaId = 'all') {
    if (!window.data || !window.data.asistencia || !window.data.estudiante || !window.data.materia) {
        return 'No data available';
    }

    // Filtrar asistencia por materia si se especifica
    let asistenciaFiltrada = window.data.asistencia;
    if (materiaId !== 'all' && materiaId) {
        const materiaIdInt = parseInt(materiaId, 10);
        asistenciaFiltrada = window.data.asistencia.filter(a => 
            parseInt(a.Materia_ID_materia, 10) === materiaIdInt
        );
    }

    // Obtener todas las fechas únicas ordenadas de la asistencia filtrada
    const fechas = [...new Set(asistenciaFiltrada.map(a => a.Fecha))]
        .filter(f => f)
        .sort((a, b) => a.localeCompare(b));

    // Obtener estudiantes únicos que tienen asistencia en la materia filtrada
    const estudiantesIdsConAsistencia = [...new Set(asistenciaFiltrada.map(a => a.Estudiante_ID_Estudiante))];
    
    // Si hay filtro de materia, también filtrar estudiantes que están inscritos en esa materia
    let estudiantesFiltrados = window.data.estudiante.filter(e => 
        estudiantesIdsConAsistencia.includes(e.ID_Estudiante)
    );

    if (materiaId !== 'all' && materiaId) {
        const materiaIdInt = parseInt(materiaId, 10);
        // Obtener IDs de estudiantes inscritos en esta materia
        const estudiantesInscritos = (window.data.alumnos_x_materia || [])
            .filter(axm => parseInt(axm.Materia_ID_materia, 10) === materiaIdInt)
            .map(axm => axm.Estudiante_ID_Estudiante);
        
        estudiantesFiltrados = estudiantesFiltrados.filter(e => 
            estudiantesInscritos.includes(e.ID_Estudiante)
        );
    }

    // Ordenar estudiantes
    const estudiantes = estudiantesFiltrados.sort((a, b) => {
        // Ordenar por apellido, luego por nombre
        const apellidoCompare = (a.Apellido || '').localeCompare(b.Apellido || '');
        if (apellidoCompare !== 0) return apellidoCompare;
        return (a.Nombre || '').localeCompare(b.Nombre || '');
    });

    // Crear estructura: alumnos en filas, fechas en columnas
    const headers = ['Nombre del Alumno', ...fechas];
    const rows = estudiantes.map(student => {
        const nombreCompleto = `${student.Apellido || ''}, ${student.Nombre || ''}`.trim().replace(/^,\s*|,\s*$/g, '');
        const row = [
            nombreCompleto || 'Sin nombre',
            ...fechas.map(fecha => {
                // Buscar la asistencia de este estudiante para esta fecha en la materia filtrada
                const asistencia = asistenciaFiltrada.find(a => 
                    a.Estudiante_ID_Estudiante === student.ID_Estudiante && 
                    a.Fecha === fecha
                );
                
                // Si no hay registro, dejar campo vacío
                if (!asistencia || !asistencia.Presente) {
                    return '';
                }
                
                // Convertir el estado a formato legible (mayúscula inicial)
                const presente = asistencia.Presente;
                if (presente === 'P' || presente === 'Y') return 'Presente';
                if (presente === 'A' || presente === 'N') return 'Ausente';
                if (presente === 'J') return 'Justificado';
                if (presente === 'T') return 'Tarde';
                return '';
            })
        ];
        return row;
    });

    // Crear CSV con punto y coma como separador para mejor compatibilidad con Excel en español
    const separator = ';';
    const csvContent = [
        headers.map(h => `"${String(h).replace(/"/g, '""')}"`).join(separator),
        ...rows.map(row => 
            row.map(cell => {
                const value = cell === null || cell === undefined ? '' : String(cell);
                const stringValue = value.replace(/"/g, '""');
                // Siempre envolver en comillas para evitar problemas con Excel
                return `"${stringValue}"`;
            }).join(separator)
        )
    ].join('\r\n');

    return csvContent;
}

function generateGradesCSV(materiaId = 'all') {
    if (!window.data || !window.data.notas || !window.data.estudiante || !window.data.evaluacion || !window.data.materia) {
        return 'No data available';
    }

    // Filtrar evaluaciones por materia si se especifica
    let evaluacionesFiltradas = window.data.evaluacion;
    if (materiaId !== 'all' && materiaId) {
        const materiaIdInt = parseInt(materiaId, 10);
        evaluacionesFiltradas = window.data.evaluacion.filter(e => 
            parseInt(e.Materia_ID_materia, 10) === materiaIdInt
        );
    }

    // Obtener todas las evaluaciones únicas ordenadas (filtradas)
    const evaluaciones = [...new Set(evaluacionesFiltradas.map(e => e.ID_evaluacion))]
        .map(id => evaluacionesFiltradas.find(e => e.ID_evaluacion === id))
        .filter(e => e)
        .sort((a, b) => {
            // Ordenar por fecha si existe, sino por ID
            if (a.Fecha && b.Fecha) {
                return a.Fecha.localeCompare(b.Fecha);
            }
            return a.ID_evaluacion - b.ID_evaluacion;
        });

    // Obtener estudiantes únicos que tienen notas en las evaluaciones filtradas
    const notasFiltradas = materiaId !== 'all' && materiaId 
        ? window.data.notas.filter(n => {
            const evaluacion = evaluacionesFiltradas.find(e => e.ID_evaluacion === n.Evaluacion_ID_evaluacion);
            return evaluacion !== undefined;
        })
        : window.data.notas;

    const estudiantesIdsConNotas = [...new Set(notasFiltradas.map(n => n.Estudiante_ID_Estudiante))];
    
    // Si hay filtro de materia, también filtrar estudiantes que están inscritos en esa materia
    let estudiantesFiltrados = window.data.estudiante.filter(e => 
        estudiantesIdsConNotas.includes(e.ID_Estudiante)
    );

    if (materiaId !== 'all' && materiaId) {
        const materiaIdInt = parseInt(materiaId, 10);
        // Obtener IDs de estudiantes inscritos en esta materia
        const estudiantesInscritos = (window.data.alumnos_x_materia || [])
            .filter(axm => parseInt(axm.Materia_ID_materia, 10) === materiaIdInt)
            .map(axm => axm.Estudiante_ID_Estudiante);
        
        estudiantesFiltrados = estudiantesFiltrados.filter(e => 
            estudiantesInscritos.includes(e.ID_Estudiante)
        );
    }

    // Ordenar estudiantes
    const estudiantes = estudiantesFiltrados.sort((a, b) => {
        // Ordenar por apellido, luego por nombre
        const apellidoCompare = (a.Apellido || '').localeCompare(b.Apellido || '');
        if (apellidoCompare !== 0) return apellidoCompare;
        return (a.Nombre || '').localeCompare(b.Nombre || '');
    });

    // Crear estructura: alumnos en filas, evaluaciones en columnas
    // Primera columna: Nombre completo del alumno (Apellido, Nombre)
    const headers = ['Nombre del Alumno', ...evaluaciones.map(e => e.Titulo || 'Evaluación sin título')];
    const rows = estudiantes.map(student => {
        const nombreCompleto = `${student.Apellido || ''}, ${student.Nombre || ''}`.trim().replace(/^,\s*|,\s*$/g, '');
        const row = [
            nombreCompleto || 'Sin nombre',
            ...evaluaciones.map(evaluacion => {
                // Buscar la nota de este estudiante para esta evaluación (solo en evaluaciones filtradas)
                const nota = notasFiltradas.find(n => 
                    n.Estudiante_ID_Estudiante === student.ID_Estudiante && 
                    n.Evaluacion_ID_evaluacion === evaluacion.ID_evaluacion
                );
                
                // Si no hay calificación, dejar campo vacío
                if (!nota || nota.Calificacion === null || nota.Calificacion === undefined || nota.Calificacion === '') {
                    return '';
                }
                // Retornar solo el número de la calificación
                return nota.Calificacion;
            })
        ];
        return row;
    });

    // Crear CSV con punto y coma como separador para mejor compatibilidad con Excel en español
    const separator = ';';
    const csvContent = [
        headers.map(h => `"${String(h).replace(/"/g, '""')}"`).join(separator),
        ...rows.map(row => 
            row.map(cell => {
                const value = cell === null || cell === undefined ? '' : String(cell);
                const stringValue = value.replace(/"/g, '""');
                // Siempre envolver en comillas para evitar problemas con Excel
                return `"${stringValue}"`;
            }).join(separator)
        )
    ].join('\r\n');

    return csvContent;
}

function convertToCSV(data) {
    if (!data || data.length === 0) return '';
    
    const headers = Object.keys(data[0]);
    const csvContent = [
        headers.map(h => `"${h}"`).join(','),
        ...data.map(row => 
            headers.map(header => {
                const value = row[header];
                // Si el valor está vacío, null o undefined, retornar cadena vacía
                if (value === null || value === undefined || value === '') {
                    return '';
                }
                // Convertir a string y escapar comillas
                const stringValue = String(value).replace(/"/g, '""');
                // Si contiene comas, comillas o saltos de línea, envolver en comillas
                if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
                    return `"${stringValue}"`;
                }
                return stringValue;
            }).join(',')
        )
    ].join('\r\n'); // Usar \r\n para mejor compatibilidad con Excel
    
    return csvContent;
}

function downloadExcel(excelContent, filename) {
    // Agregar BOM UTF-8 para que Excel muestre correctamente los acentos
    // El BOM debe ser el primer byte del archivo
    const encoder = new TextEncoder();
    const bomBytes = new Uint8Array([0xEF, 0xBB, 0xBF]); // BOM UTF-8 en bytes
    const contentBytes = encoder.encode(excelContent);
    const finalContent = new Uint8Array(bomBytes.length + contentBytes.length);
    finalContent.set(bomBytes, 0);
    finalContent.set(contentBytes, bomBytes.length);
    
    // Usar tipo application/vnd.ms-excel para que Excel lo abra correctamente
    const blob = new Blob([finalContent], { type: 'application/vnd.ms-excel;charset=utf-8;' });
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

// Export individual reports (asistencia and notas)
function exportAttendanceOnly() {
    const currentDate = new Date().toISOString().split('T')[0];
    
    // Obtener el filtro de materia seleccionado
    const globalSubjectFilter = document.getElementById('globalSubjectFilter');
    const materiaId = globalSubjectFilter ? globalSubjectFilter.value : 'all';
    
    // Obtener nombre de la materia para el nombre del archivo
    let materiaNombre = '';
    if (materiaId !== 'all' && materiaId) {
        const materia = window.data && window.data.materia 
            ? window.data.materia.find(m => parseInt(m.ID_materia, 10) === parseInt(materiaId, 10))
            : null;
        materiaNombre = materia ? `_${materia.Nombre.replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ]/g, '_')}` : '';
    }
    
    try {
        const attendanceExcel = generateAttendanceCSV(materiaId);
        downloadExcel(attendanceExcel, `lista_asistencia${materiaNombre}_${currentDate}.xls`);
        showExportNotification('Lista de asistencia exportada exitosamente!', 'success');
    } catch (error) {
        showExportNotification('Error al exportar la lista de asistencia. Por favor, intente nuevamente.', 'error');
    }
}

function exportGradesOnly() {
    const currentDate = new Date().toISOString().split('T')[0];
    
    // Obtener el filtro de materia seleccionado
    const globalSubjectFilter = document.getElementById('globalSubjectFilter');
    const materiaId = globalSubjectFilter ? globalSubjectFilter.value : 'all';
    
    // Obtener nombre de la materia para el nombre del archivo
    let materiaNombre = '';
    if (materiaId !== 'all' && materiaId) {
        const materia = window.data && window.data.materia 
            ? window.data.materia.find(m => parseInt(m.ID_materia, 10) === parseInt(materiaId, 10))
            : null;
        materiaNombre = materia ? `_${materia.Nombre.replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ]/g, '_')}` : '';
    }
    
    try {
        const gradesExcel = generateGradesCSV(materiaId);
        downloadExcel(gradesExcel, `lista_notas${materiaNombre}_${currentDate}.xls`);
        showExportNotification('Lista de notas exportada exitosamente!', 'success');
    } catch (error) {
        showExportNotification('Error al exportar la lista de notas. Por favor, intente nuevamente.', 'error');
    }
}

function generateProgressReportCSV(materiaId = 'all') {
    if (!window.data || !window.data.notas || !window.data.estudiante || !window.data.evaluacion || !window.data.materia) {
        return 'No data available';
    }

    // Filtrar evaluaciones por materia si se especifica
    let evaluacionesFiltradas = window.data.evaluacion;
    if (materiaId !== 'all' && materiaId) {
        const materiaIdInt = parseInt(materiaId, 10);
        evaluacionesFiltradas = window.data.evaluacion.filter(e => 
            parseInt(e.Materia_ID_materia, 10) === materiaIdInt
        );
    }

    // Obtener estudiantes inscritos en la materia
    let estudiantesFiltrados = window.data.estudiante;
    if (materiaId !== 'all' && materiaId) {
        const materiaIdInt = parseInt(materiaId, 10);
        const estudiantesInscritos = (window.data.alumnos_x_materia || [])
            .filter(axm => parseInt(axm.Materia_ID_materia, 10) === materiaIdInt)
            .map(axm => axm.Estudiante_ID_Estudiante);
        
        estudiantesFiltrados = estudiantesFiltrados.filter(e => 
            estudiantesInscritos.includes(e.ID_Estudiante)
        );
    }

    // Ordenar estudiantes
    const estudiantes = estudiantesFiltrados.sort((a, b) => {
        const apellidoCompare = (a.Apellido || '').localeCompare(b.Apellido || '');
        if (apellidoCompare !== 0) return apellidoCompare;
        return (a.Nombre || '').localeCompare(b.Nombre || '');
    });

    // Función auxiliar para calcular promedio ponderado
    function calcularPromedio(estudianteId, cuatrimestre, etapa) {
        // Filtrar evaluaciones del cuatrimestre y etapa (ya filtradas por materia)
        const evaluacionesRelevantes = evaluacionesFiltradas.filter(e => 
            parseInt(e.periodo_cuatrimestre, 10) === cuatrimestre &&
            e.etapa_calculo === etapa
        );

        if (evaluacionesRelevantes.length === 0) {
            return ''; // No hay evaluaciones para este período
        }

        // Obtener IDs de evaluaciones relevantes para filtrar notas
        const evaluacionesIds = evaluacionesRelevantes.map(e => e.ID_evaluacion);

        // Obtener notas del estudiante para estas evaluaciones (solo de la materia filtrada)
        const notasRelevantes = window.data.notas.filter(n => {
            if (n.Estudiante_ID_Estudiante !== estudianteId) return false;
            if (!n.Calificacion || n.Calificacion === null || n.Calificacion === '') return false;
            
            // Verificar que la nota pertenezca a una de las evaluaciones filtradas
            return evaluacionesIds.includes(n.Evaluacion_ID_evaluacion);
        });

        if (notasRelevantes.length === 0) {
            return ''; // No hay notas
        }

        // Calcular promedio ponderado
        let sumaPonderada = 0;
        let sumaPesos = 0;

        notasRelevantes.forEach(nota => {
            const evaluacion = evaluacionesRelevantes.find(e => 
                e.ID_evaluacion === nota.Evaluacion_ID_evaluacion
            );
            
            if (evaluacion) {
                const calificacion = parseFloat(nota.Calificacion);
                const ponderacion = parseFloat(evaluacion.ponderacion || evaluacion.Peso || 1.0);
                
                if (!isNaN(calificacion) && calificacion > 0) {
                    sumaPonderada += calificacion * ponderacion;
                    sumaPesos += ponderacion;
                }
            }
        });

        if (sumaPesos === 0) {
            return '';
        }

        const promedio = sumaPonderada / sumaPesos;
        return promedio.toFixed(2);
    }

    // Crear estructura: estudiantes en filas, 4 columnas de promedios
    const headers = [
        'Estudiante',
        '1er Avance',
        '1er Informe',
        '2do Avance',
        '2do Informe'
    ];

    const rows = estudiantes.map(student => {
        const nombreCompleto = `${student.Apellido || ''}, ${student.Nombre || ''}`.trim().replace(/^,\s*|,\s*$/g, '');
        
        const avance1 = calcularPromedio(student.ID_Estudiante, 1, 'AVANCE');
        const informe1 = calcularPromedio(student.ID_Estudiante, 1, 'FINAL');
        const avance2 = calcularPromedio(student.ID_Estudiante, 2, 'AVANCE');
        const informe2 = calcularPromedio(student.ID_Estudiante, 2, 'FINAL');

        return [
            nombreCompleto || 'Sin nombre',
            avance1,
            informe1,
            avance2,
            informe2
        ];
    });

    // Crear Excel con punto y coma como separador
    const separator = ';';
    const csvContent = [
        headers.map(h => `"${String(h).replace(/"/g, '""')}"`).join(separator),
        ...rows.map(row => 
            row.map(cell => {
                const value = cell === null || cell === undefined ? '' : String(cell);
                const stringValue = value.replace(/"/g, '""');
                return `"${stringValue}"`;
            }).join(separator)
        )
    ].join('\r\n');

    return csvContent;
}

function exportProgressReport() {
    const currentDate = new Date().toISOString().split('T')[0];
    
    // Obtener el filtro de materia seleccionado
    const globalSubjectFilter = document.getElementById('globalSubjectFilter');
    const materiaId = globalSubjectFilter ? globalSubjectFilter.value : 'all';
    
    // Si no hay materia seleccionada, mostrar advertencia
    if (materiaId === 'all' || !materiaId) {
        const confirmar = confirm('Para exportar informes de avance, debe seleccionar una materia específica. ¿Desea exportar todas las materias por separado?');
        if (!confirmar) {
            return;
        }
        
        // Exportar todas las materias del docente por separado
        const materiasDocente = getCurrentUserSubjects();
        if (!materiasDocente || materiasDocente.length === 0) {
            showExportNotification('No se encontraron materias para exportar.', 'error');
            return;
        }
        
        let exportadas = 0;
        materiasDocente.forEach(materia => {
            try {
                const progressExcel = generateProgressReportCSV(materia.ID_materia);
                const materiaNombre = materia.Nombre.replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ]/g, '_');
                downloadExcel(progressExcel, `informes_avance_${materiaNombre}_${currentDate}.xls`);
                exportadas++;
            } catch (error) {
                console.error(`Error al exportar materia ${materia.Nombre}:`, error);
            }
        });
        
        if (exportadas > 0) {
            showExportNotification(`${exportadas} informe(s) de avance exportado(s) exitosamente!`, 'success');
        } else {
            showExportNotification('No se pudo exportar ningún informe de avance.', 'error');
        }
        return;
    }
    
    // Obtener nombre de la materia para el nombre del archivo
    const materia = window.data && window.data.materia 
        ? window.data.materia.find(m => parseInt(m.ID_materia, 10) === parseInt(materiaId, 10))
        : null;
    const materiaNombre = materia ? `_${materia.Nombre.replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ]/g, '_')}` : '';
    
    try {
        const progressExcel = generateProgressReportCSV(materiaId);
        downloadExcel(progressExcel, `informes_avance${materiaNombre}_${currentDate}.xls`);
        showExportNotification('Informe de avance exportado exitosamente!', 'success');
    } catch (error) {
        console.error('Error al exportar informe de avance:', error);
        showExportNotification('Error al exportar el informe de avance. Por favor, intente nuevamente.', 'error');
    }
}

// Export export management functions
window.exportReport = exportReport;
window.exportToPDF = exportToPDF;
window.exportToExcel = exportToExcel;
window.exportAttendanceOnly = exportAttendanceOnly;
window.exportGradesOnly = exportGradesOnly;
window.exportProgressReport = exportProgressReport;
window.printReport = printReport;
window.showExportNotification = showExportNotification;
