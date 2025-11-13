/**
 * Student CRUD Operations Module
 * 
 * Handles Create, Read, Update, and Delete operations for students.
 * Includes student enrollment management and theme assignment.
 */

/**
 * Save theme assignments for a student
 * @param {number} studentId - The student ID
 * @param {Array<number>} themeIds - Array of theme IDs to assign
 */
async function saveThemesAssignment(studentId, themeIds) {
    try {
        let successCount = 0;
        let errorCount = 0;
        
        for (const contenidoId of themeIds) {
            try {
                // Guardar en Tema_estudiante
                const payload = {
                    Contenido_ID_contenido: contenidoId,
                    Estudiante_ID_Estudiante: studentId,
                    Estado: 'PENDIENTE'
                };
                
                const res = await fetch('../api/tema_estudiante.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify(payload)
                });
                
                const data = await res.json().catch(() => ({}));
                
                if (res.ok) {
                    successCount++;
                } else {
                    // Check if it's a conflict (already assigned)
                    if (res.status === 409) {
                        successCount++; // Already assigned, count as success
                    } else {
                        errorCount++;
                        console.error(`Error assigning theme ${contenidoId}:`, data.message);
                    }
                }
                
                // También guardar en Intensificacion
                try {
                    // Obtener la materia del contenido
                    const contenido = (appData.contenido || []).find(c => parseInt(c.ID_contenido) === parseInt(contenidoId));
                    if (contenido && contenido.Materia_ID_materia) {
                        const materiaId = parseInt(contenido.Materia_ID_materia);
                        
                        const intensificacionPayload = {
                            Estudiante_ID_Estudiante: parseInt(studentId),
                            Materia_ID_materia: materiaId,
                            Contenido_ID_contenido: parseInt(contenidoId),
                            Estado: 'PENDIENTE',
                            Nota_objetivo: 6.00
                        };
                        
                        console.log('=== INTENTANDO GUARDAR EN INTENSIFICACION (saveThemesAssignment) ===');
                        console.log('Payload:', intensificacionPayload);
                        
                        // Determinar la ruta correcta de la API
                        const isInPages = window.location.pathname.includes('/pages/');
                        const apiUrl = isInPages ? '../api/intensificacion.php' : 'api/intensificacion.php';
                        
                        console.log('URL de API:', apiUrl);
                        
                        const intensificacionRes = await fetch(apiUrl, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                            credentials: 'include',
                            body: JSON.stringify(intensificacionPayload)
                        });
                        
                        console.log('Response status:', intensificacionRes.status);
                        console.log('Response ok:', intensificacionRes.ok);
                        
                        const intensificacionData = await intensificacionRes.json().catch(async () => {
                            const text = await intensificacionRes.text();
                            console.error('Error parsing JSON response:', text);
                            return {};
                        });
                        
                        console.log('Response data:', intensificacionData);
                        
                        if (intensificacionRes.ok || intensificacionRes.status === 409) {
                            // 409 significa que ya existe, lo cual está bien
                            console.log(`✅ Intensificación guardada para contenido ${contenidoId}`);
                        } else {
                            console.error(`❌ Error guardando intensificación para contenido ${contenidoId}:`, intensificacionData.message || intensificacionData.error || 'Error desconocido');
                            console.error('Response completa:', intensificacionData);
                        }
                    } else {
                        console.warn(`No se encontró contenido o materia para contenidoId ${contenidoId}`);
                    }
                } catch (intensificacionErr) {
                    console.error(`❌ Excepción guardando intensificación para contenido ${contenidoId}:`, intensificacionErr);
                    console.error('Stack trace:', intensificacionErr.stack);
                    // No incrementar errorCount aquí para no afectar el conteo principal
                }
            } catch (err) {
                errorCount++;
                console.error(`Error assigning theme ${contenidoId}:`, err);
            }
        }
        
        // Reload data from backend
        if (typeof loadData === 'function') await loadData();
        
        // Reload student data
        if (typeof loadUnifiedStudentData === 'function') {
            loadUnifiedStudentData();
        }
        
        // If panel is open, refresh it
        const panel = document.getElementById('studentDetailPanel');
        if (panel && panel.style.display === 'block') {
            const currentStudentId = panel.getAttribute('data-student-id');
            if (currentStudentId && typeof showStudentDetail === 'function') {
                showStudentDetail(parseInt(currentStudentId));
            }
        }
        
        if (errorCount === 0) {
            if (typeof showNotification === 'function') {
                showNotification(`Se asignaron ${successCount} tema(s) correctamente`, 'success');
            } else {
                alert(`Se asignaron ${successCount} tema(s) correctamente`);
            }
        } else {
            alert(`Se asignaron ${successCount} tema(s). ${errorCount} error(es).`);
        }
    } catch (err) {
        alert('Error al guardar las asignaciones: ' + (err.message || 'Error desconocido'));
    }
}

/**
 * Create tema_estudiante records for all contents of selected subjects
 * @param {number} studentId - The student ID
 * @param {Array<number>} subjectIds - Array of subject IDs
 * @returns {Promise<Object>} Object with successCount, skippedCount, and errorCount
 */
async function createTemaEstudianteForSubjects(studentId, subjectIds) {
    try {
        // Ensure appData.contenido is available
        if (!appData.contenido || !Array.isArray(appData.contenido)) {
            console.warn('appData.contenido no disponible, recargando datos...');
            if (typeof loadData === 'function') {
                await loadData();
            }
            // If still not available after reloading, return
            if (!appData.contenido || !Array.isArray(appData.contenido)) {
                console.error('No se pudieron cargar los contenidos');
                return;
            }
        }
        
        // Get all contents (themes) from selected subjects
        const subjectIdsNum = subjectIds.map(id => parseInt(id));
        const contenidos = appData.contenido.filter(c => 
            subjectIdsNum.includes(parseInt(c.Materia_ID_materia))
        );
        
        if (contenidos.length === 0) {
            console.log('No hay contenidos para las materias seleccionadas');
            return;
        }
        
        console.log(`Creando tema_estudiante para ${contenidos.length} contenido(s) del estudiante ${studentId}`);
        
        let successCount = 0;
        let errorCount = 0;
        let skippedCount = 0;
        
        // Create tema_estudiante for each content
        for (const contenido of contenidos) {
            try {
                const payload = {
                    Contenido_ID_contenido: parseInt(contenido.ID_contenido),
                    Estudiante_ID_Estudiante: parseInt(studentId),
                    Estado: 'PENDIENTE',
                    Observaciones: null
                };
                
                const res = await fetch('../api/tema_estudiante.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify(payload)
                });
                
                const data = await res.json().catch(() => ({}));
                
                if (res.ok) {
                    successCount++;
                } else {
                    // If already exists (409), count as success since record is already created
                    if (res.status === 409) {
                        skippedCount++;
                    } else {
                        errorCount++;
                        console.error(`Error creando tema_estudiante para contenido ${contenido.ID_contenido}:`, data.message || 'Error desconocido');
                    }
                }
            } catch (err) {
                errorCount++;
                console.error(`Error creando tema_estudiante para contenido ${contenido.ID_contenido}:`, err);
            }
        }
        
        console.log(`Tema_estudiante creados: ${successCount} nuevos, ${skippedCount} ya existían, ${errorCount} errores`);
        
        if (errorCount > 0) {
            console.warn(`Hubo ${errorCount} error(es) al crear algunos tema_estudiante`);
        }
        
        return { successCount, skippedCount, errorCount };
    } catch (err) {
        console.error('Error en createTemaEstudianteForSubjects:', err);
        throw err;
    }
}

/**
 * Save or create a student
 */
async function saveStudent() {
    const studentStatus = document.getElementById('studentStatus');
    const estadoSeleccionado = studentStatus ? studentStatus.value : 'ACTIVO';
    
    // Backend handles INTENSIFICA directly using the INTENSIFICA column
    const formData = {
        Nombre: document.getElementById('studentFirstName').value,
        Apellido: document.getElementById('studentLastName').value,
        Email: document.getElementById('studentEmail').value || null,
        Fecha_nacimiento: null, // Birth date not captured in form
        Estado: estadoSeleccionado  // Send 'INTENSIFICA', 'ACTIVO' or 'INACTIVO' directly
    };

    // Validation
    if (!formData.Nombre || !formData.Apellido) {
        alert('El nombre y apellido son obligatorios.');
        return;
    }
    
    // Validar que se hayan seleccionado materias
    const selectedSubjects = typeof getSelectedSubjects === 'function' ? getSelectedSubjects() : [];
    if (selectedSubjects.length === 0) {
        alert('Debe seleccionar al menos una materia para el estudiante.');
        const subjectSelect = document.getElementById('studentSubjects');
        if (subjectSelect) {
            subjectSelect.focus();
        }
        return;
    }
    
    // Determinar el curso basado en las materias seleccionadas
    // Si todas las materias pertenecen al mismo curso, asignar ese curso
    const userIdString = localStorage.getItem('userId');
    const teacherId = userIdString ? parseInt(userIdString, 10) : null;
    
    if (teacherId && appData.materia && Array.isArray(appData.materia)) {
        const materiasSeleccionadas = appData.materia.filter(m => 
            selectedSubjects.some(s => parseInt(s.id) === parseInt(m.ID_materia)) &&
            m.Usuarios_docente_ID_docente === teacherId
        );
        
        if (materiasSeleccionadas.length > 0) {
            // Obtener los cursos únicos de las materias seleccionadas
            const cursosUnicos = [...new Set(materiasSeleccionadas.map(m => m.Curso_division).filter(Boolean))];
            
            // Si todas las materias pertenecen al mismo curso, buscar el ID del curso
            if (cursosUnicos.length === 1) {
                const cursoDivision = cursosUnicos[0];
                
                // Buscar el curso en la tabla Curso
                try {
                    const cursoResponse = await fetch(`api/curso.php?userId=${userIdString}&estado=ACTIVO`);
                    const cursoResult = await cursoResponse.json();
                    
                    if (cursoResult.success && cursoResult.data && Array.isArray(cursoResult.data)) {
                        const curso = cursoResult.data.find(c => 
                            c.Curso_division === cursoDivision &&
                            c.Usuarios_docente_ID_docente === teacherId
                        );
                        
                        if (curso && curso.ID_curso) {
                            formData.Curso_ID_curso = parseInt(curso.ID_curso);
                            console.log('Curso asignado al estudiante:', curso.ID_curso, cursoDivision);
                        }
                    }
                } catch (error) {
                    console.warn('Error al obtener curso para asignar al estudiante:', error);
                }
            }
        }
    }
    
    try {
        let response;
        let url = '../api/estudiantes.php';  
        let method = 'POST';
        let body = JSON.stringify(formData);

        // If editing, use PUT
        const editingStudentId = typeof getEditingStudentId === 'function' ? getEditingStudentId() : null;
        
        if (editingStudentId) {
            url = `${url}?id=${editingStudentId}`;
            method = 'PUT';
        }

        response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: body
        });
        
        let result;
        try {
            result = await response.json();
        } catch (e) {
            console.error('Error parsing response:', e);
            const text = await response.text();
            console.error('Response text:', text);
            alert('Error al guardar el estudiante: Respuesta inválida del servidor');
            return;
        }

        if (response.ok && result.success !== false) {
            // Get student ID (different formats depending on response)
            let studentId = editingStudentId;
            if (!studentId) {
                // Endpoint returns { success: true, data: { ID_Estudiante: ... } }
                if (result.data && result.data.ID_Estudiante) {
                    studentId = result.data.ID_Estudiante;
                } else if (result.ID_Estudiante) {
                    studentId = result.ID_Estudiante;
                } else if (result.id) {
                    studentId = result.id;
                }
            }
            
            // Save student-subject relationships and intensification themes
            if (!studentId) {
                alert('Estudiante guardado pero no se pudieron guardar las materias. ID no disponible.');
                console.error('Student ID not available:', result);
            } else {
                const selectedSubjects = typeof getSelectedSubjects === 'function' ? getSelectedSubjects() : [];
                const selectedSubjectIds = selectedSubjects.map(s => s.id);
                
                console.log('Saving student enrollments:', {
                    studentId: studentId,
                    selectedSubjects: selectedSubjectIds,
                    selectedSubjectsList: selectedSubjects
                });
                
                // Save intensification themes if INTENSIFICA
                const selectedIntensificacionThemes = typeof getSelectedIntensificacionThemes === 'function' ? getSelectedIntensificacionThemes() : [];
                console.log('=== GUARDANDO TEMAS DE INTENSIFICACIÓN ===');
                console.log('Estado seleccionado:', estadoSeleccionado);
                console.log('Temas de intensificación seleccionados para guardar:', selectedIntensificacionThemes);
                console.log('Tipo de temas:', typeof selectedIntensificacionThemes, Array.isArray(selectedIntensificacionThemes));
                
                if (estadoSeleccionado === 'INTENSIFICA') {
                    try {
                        // Si estamos editando, actualizar los temas (agregar nuevos y eliminar los que se quitaron)
                        if (editingStudentId) {
                            console.log('Editando estudiante intensificador - actualizando temas de intensificación');
                            
                            // Obtener temas actualmente asignados al estudiante
                            if (!appData.tema_estudiante || !Array.isArray(appData.tema_estudiante)) {
                                // Recargar datos si no están disponibles
                                if (typeof loadData === 'function') {
                                    await loadData();
                                }
                            }
                            
                            // Normalizar IDs para comparación (asegurar que todos sean números)
                            const temasActuales = (appData.tema_estudiante || [])
                                .filter(te => parseInt(te.Estudiante_ID_Estudiante) === parseInt(studentId))
                                .map(te => parseInt(te.Contenido_ID_contenido))
                                .filter(id => !isNaN(id));
                            
                            const selectedThemesNormalized = selectedIntensificacionThemes
                                .map(id => parseInt(id))
                                .filter(id => !isNaN(id));
                            
                            console.log('Temas actualmente asignados:', temasActuales);
                            console.log('Temas seleccionados (normalizados):', selectedThemesNormalized);
                            
                            // Identificar temas a eliminar (están en actuales pero no en seleccionados)
                            const temasAEliminar = temasActuales.filter(id => !selectedThemesNormalized.includes(id));
                            
                            // Identificar temas a agregar (están en seleccionados pero no en actuales)
                            const temasAAgregar = selectedThemesNormalized.filter(id => !temasActuales.includes(id));
                            
                            console.log('Temas a eliminar:', temasAEliminar);
                            console.log('Temas a agregar:', temasAAgregar);
                            
                            // Eliminar temas que se quitaron
                            if (temasAEliminar.length > 0) {
                                for (const contenidoId of temasAEliminar) {
                                    try {
                                        // Eliminar de Tema_estudiante
                                        const temaEstudiante = (appData.tema_estudiante || []).find(te => 
                                            parseInt(te.Estudiante_ID_Estudiante) === parseInt(studentId) &&
                                            parseInt(te.Contenido_ID_contenido) === contenidoId
                                        );
                                        
                                        if (temaEstudiante && temaEstudiante.ID_Tema_estudiante) {
                                            const deleteResponse = await fetch(`../api/tema_estudiante.php?id=${temaEstudiante.ID_Tema_estudiante}`, {
                                                method: 'DELETE',
                                                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                                                credentials: 'include'
                                            });
                                            
                                            if (deleteResponse.ok) {
                                                console.log(`Tema_estudiante ${contenidoId} eliminado correctamente`);
                                            } else {
                                                console.error(`Error al eliminar tema_estudiante ${contenidoId}`);
                                            }
                                        }
                                        
                                        // Eliminar de Intensificacion
                                        const contenido = (appData.contenido || []).find(c => parseInt(c.ID_contenido) === contenidoId);
                                        if (contenido && contenido.Materia_ID_materia) {
                                            const materiaId = parseInt(contenido.Materia_ID_materia);
                                            
                                            // Buscar el registro de intensificación
                                            const intensificacionResponse = await fetch(`../api/intensificacion.php?estudianteId=${studentId}&materiaId=${materiaId}&contenidoId=${contenidoId}`, {
                                                method: 'GET',
                                                headers: { 'Accept': 'application/json' },
                                                credentials: 'include'
                                            });
                                            
                                            const intensificaciones = await intensificacionResponse.json().catch(() => []);
                                            
                                            if (Array.isArray(intensificaciones) && intensificaciones.length > 0) {
                                                const intensificacion = intensificaciones.find(i => 
                                                    parseInt(i.Estudiante_ID_Estudiante) === parseInt(studentId) &&
                                                    parseInt(i.Materia_ID_materia) === materiaId &&
                                                    parseInt(i.Contenido_ID_contenido) === contenidoId
                                                );
                                                
                                                if (intensificacion && intensificacion.ID_intensificacion) {
                                                    const deleteIntensificacionResponse = await fetch(`../api/intensificacion.php?id=${intensificacion.ID_intensificacion}`, {
                                                        method: 'DELETE',
                                                        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                                                        credentials: 'include'
                                                    });
                                                    
                                                    if (deleteIntensificacionResponse.ok) {
                                                        console.log(`Intensificación ${contenidoId} eliminada correctamente`);
                                                    } else {
                                                        console.error(`Error al eliminar intensificación ${contenidoId}`);
                                                    }
                                                }
                                            }
                                        }
                                    } catch (err) {
                                        console.error(`Error eliminando tema ${contenidoId}:`, err);
                                    }
                                }
                            }
                            
                            // Agregar temas nuevos
                            if (temasAAgregar.length > 0) {
                                console.log('Agregando nuevos temas de intensificación:', temasAAgregar);
                                await saveThemesAssignment(studentId, temasAAgregar);
                            }
                            
                            // Si no hay temas seleccionados y había temas asignados, eliminarlos todos
                            if (selectedIntensificacionThemes.length === 0 && temasActuales.length > 0) {
                                console.log('No hay temas seleccionados - eliminando todos los temas asignados');
                                for (const contenidoId of temasActuales) {
                                    try {
                                        const temaEstudiante = (appData.tema_estudiante || []).find(te => 
                                            parseInt(te.Estudiante_ID_Estudiante) === parseInt(studentId) &&
                                            parseInt(te.Contenido_ID_contenido) === contenidoId
                                        );
                                        
                                        if (temaEstudiante && temaEstudiante.ID_Tema_estudiante) {
                                            const deleteResponse = await fetch(`../api/tema_estudiante.php?id=${temaEstudiante.ID_Tema_estudiante}`, {
                                                method: 'DELETE',
                                                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                                                credentials: 'include'
                                            });
                                            
                                            if (deleteResponse.ok) {
                                                console.log(`Tema ${contenidoId} eliminado correctamente`);
                                            }
                                        }
                                    } catch (err) {
                                        console.error(`Error eliminando tema ${contenidoId}:`, err);
                                    }
                                }
                            }
                            
                            // Recargar datos después de actualizar temas
                            if (typeof loadData === 'function') {
                                await loadData();
                            }
                            
                            // Verificar si el estudiante aún tiene temas pendientes o en progreso
                            // Si no tiene ningún tema, cambiar su estado de INTENSIFICA a ACTIVO
                            const temasRestantes = (appData.tema_estudiante || [])
                                .filter(te => 
                                    parseInt(te.Estudiante_ID_Estudiante) === parseInt(studentId) &&
                                    (te.Estado === 'PENDIENTE' || te.Estado === 'EN_PROGRESO')
                                );
                            
                            console.log('Temas restantes para el estudiante:', temasRestantes.length);
                            
                            if (temasRestantes.length === 0) {
                                // No tiene temas pendientes o en progreso, cambiar a ACTIVO
                                console.log('El estudiante no tiene temas pendientes, cambiando a ACTIVO');
                                
                                try {
                                    // Determinar la ruta correcta de la API
                                    const isInPages = window.location.pathname.includes('/pages/');
                                    const apiUrl = isInPages ? '../api/estudiantes.php' : 'api/estudiantes.php';
                                    
                                    const updateResponse = await fetch(`${apiUrl}?id=${studentId}`, {
                                        method: 'PUT',
                                        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                                        credentials: 'include',
                                        body: JSON.stringify({
                                            Estado: 'ACTIVO',
                                            INTENSIFICA: false
                                        })
                                    });
                                    
                                    if (updateResponse.ok) {
                                        console.log('Estudiante actualizado a ACTIVO correctamente');
                                        // Recargar datos para reflejar el cambio
                                        if (typeof loadData === 'function') {
                                            await loadData();
                                        }
                                        
                                        // Recargar la vista de estudiantes para actualizar el estilo visual
                                        if (typeof loadUnifiedStudentData === 'function') {
                                            await loadUnifiedStudentData();
                                        }
                                    } else {
                                        const updateData = await updateResponse.json().catch(() => ({}));
                                        console.error('Error actualizando estudiante:', updateData.message || 'Error desconocido');
                                    }
                                } catch (updateErr) {
                                    console.error('Error al actualizar estado del estudiante:', updateErr);
                                }
                            }
                            
                            console.log('Temas de intensificación actualizados exitosamente');
                        } else {
                            // Si es un estudiante nuevo, solo agregar los temas seleccionados
                            if (selectedIntensificacionThemes.length > 0) {
                                console.log('Guardando temas de intensificación para estudiante nuevo:', studentId);
                                await saveThemesAssignment(studentId, selectedIntensificacionThemes);
                                console.log('Temas de intensificación guardados exitosamente');
                            }
                        }
                    } catch (err) {
                        console.error('Error guardando temas de intensificación:', err);
                        alert('Estudiante guardado pero hubo un error al asignar los temas de intensificación.');
                    }
                } else {
                    // Si el estudiante ya no es intensificador, eliminar todos sus temas de intensificación
                    if (editingStudentId) {
                        try {
                            if (!appData.tema_estudiante || !Array.isArray(appData.tema_estudiante)) {
                                if (typeof loadData === 'function') {
                                    await loadData();
                                }
                            }
                            
                            const temasActuales = (appData.tema_estudiante || [])
                                .filter(te => parseInt(te.Estudiante_ID_Estudiante) === parseInt(studentId))
                                .map(te => ({
                                    id: te.ID_Tema_estudiante,
                                    contenidoId: parseInt(te.Contenido_ID_contenido)
                                }));
                            
                            if (temasActuales.length > 0) {
                                console.log('Estudiante ya no es intensificador - eliminando temas asignados');
                                for (const tema of temasActuales) {
                                    try {
                                        await fetch(`../api/tema_estudiante.php?id=${tema.id}`, {
                                            method: 'DELETE',
                                            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                                            credentials: 'include'
                                        });
                                    } catch (err) {
                                        console.error(`Error eliminando tema ${tema.id}:`, err);
                                    }
                                }
                            }
                        } catch (err) {
                            console.error('Error eliminando temas de intensificación:', err);
                        }
                    }
                }
                
                // Save manually selected topics (only for non-intensificador students)
                // Para estudiantes intensificadores, los temas se manejan en la sección de temas de intensificación
                const selectedTopics = typeof getSelectedTopics === 'function' ? getSelectedTopics() : [];
                const hasManualTopics = selectedTopics.length > 0;
                
                if (selectedSubjectIds.length > 0) {
                    try {
                        // If editing, first delete existing relationships
                        if (editingStudentId) {
                            const deleteResponse = await fetch(`../api/alumnos_x_materia.php?estudianteId=${studentId}`, {
                                method: 'DELETE',
                                headers: { 'Content-Type': 'application/json' }
                            });
                            const deleteResult = await deleteResponse.json().catch(() => ({}));
                            console.log('Deleted existing enrollments:', deleteResult);
                        }
                        
                        // Create new relationships
                        const relations = selectedSubjectIds.map(materiaId => ({
                            Materia_ID_materia: parseInt(materiaId),
                            Estudiante_ID_Estudiante: parseInt(studentId),
                            Estado: 'INSCRITO'
                        }));
                        
                        console.log('Sending enrollment relations:', relations);
                        
                        const relationsResponse = await fetch('../api/alumnos_x_materia.php', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(relations)
                        });
                        
                        const relationsText = await relationsResponse.text();
                        console.log('Enrollment API response status:', relationsResponse.status);
                        console.log('Enrollment API response text:', relationsText);
                        
                        let relationsData = {};
                        try {
                            relationsData = JSON.parse(relationsText);
                            console.log('Enrollment API response data:', relationsData);
                        } catch (e) {
                            console.error('Error parsing enrollment response:', e, relationsText);
                        }
                        
                        if (!relationsResponse.ok) {
                            const errorMsg = relationsData.message || relationsText || 'Error desconocido';
                            console.error('Error saving enrollments:', errorMsg);
                            alert('Estudiante guardado pero hubo un error al guardar las materias: ' + errorMsg);
                        } else {
                            console.log('Enrollments saved successfully:', relationsData);
                            
                            // NO crear tema_estudiante automáticamente para estudiantes intensificadores
                            // Los temas de intensificación deben ser seleccionados manualmente por el usuario
                            // y se guardan en la sección de temas de intensificación arriba
                            if (estadoSeleccionado === 'INTENSIFICA') {
                                console.log('Estudiante intensificador - los temas se asignan manualmente desde el selector de temas de intensificación');
                                // Los temas de intensificación ya se guardaron arriba en la sección correspondiente
                            } else if (hasManualTopics) {
                                // Para estudiantes NO intensificadores, guardar temas manualmente seleccionados
                                try {
                                    const selectedTopicIds = selectedTopics.map(t => t.id);
                                    await saveThemesAssignment(studentId, selectedTopicIds);
                                    console.log('Temas manualmente seleccionados guardados:', selectedTopicIds);
                                } catch (err) {
                                    console.error('Error guardando temas seleccionados:', err);
                                }
                            } else {
                                // Solo para estudiantes NO intensificadores, crear tema_estudiante automáticamente
                                // si no hay temas manualmente seleccionados
                                try {
                                    await createTemaEstudianteForSubjects(studentId, selectedSubjectIds);
                                } catch (err) {
                                    console.error('Error creando tema_estudiante records:', err);
                                }
                            }
                        }
                    } catch (error) {
                        console.error('Exception saving enrollments:', error);
                        alert('Estudiante guardado pero hubo un error al guardar las materias: ' + error.message);
                    }
                } else {
                    console.warn('No subjects selected for student:', studentId);
                }
            }
            
            // Update local data by reloading from server FIRST
            // This ensures the newly created/updated student is available in appData
            // and tema_estudiante data is up to date
            try {
                await loadData();
                console.log('Datos recargados después de guardar estudiante');
            } catch (error) {
                console.error('Error al recargar datos después de guardar estudiante:', error);
            }
            
            // Clear lists after successful save and data reload
            // This ensures we don't lose data before it's saved
            if (typeof clearSelectedTopics === 'function') {
                clearSelectedTopics();
            }
            // Only clear intensification themes if we're not editing an intensifier
            // (they should persist if editing an intensifier student)
            const studentStatus = document.getElementById('studentStatus');
            if (studentStatus && studentStatus.value !== 'INTENSIFICA') {
                if (typeof clearSelectedIntensificacionThemes === 'function') {
                    clearSelectedIntensificacionThemes();
                }
            }
            
            // Close modal and clear
            if (typeof closeModal === 'function') {
                closeModal('studentModal');
            }
            if (typeof clearStudentForm === 'function') {
                clearStudentForm();
            }
            
            if (typeof setEditingStudentId === 'function') {
                setEditingStudentId(null);
            }
            
            // Reload views with a small delay to ensure data is updated
            setTimeout(() => {
                if (typeof loadStudents === 'function') {
                    loadStudents();
                }
                if (typeof loadUnifiedStudentData === 'function') {
                    loadUnifiedStudentData();
                }
                if (typeof loadStudentMatrix === 'function') {
                    const matrix = document.getElementById('unifiedStudentMatrix');
                    if (matrix && matrix.style.display !== 'none') {
                        loadStudentMatrix();
                    }
                }
                if (typeof updateDashboard === 'function') {
                    updateDashboard();
                }
                
                // If we created a student from materia details view, reload the students list
                if (window.currentThemesSubjectId && typeof loadMateriaStudents === 'function') {
                    loadMateriaStudents(window.currentThemesSubjectId);
                }
            }, 100);
            
            // Show notification
            if (typeof showNotification === 'function') {
                showNotification(
                    editingStudentId ? 'Estudiante actualizado exitosamente' : 'Estudiante creado exitosamente',
                    'success'
                );
            }
        } else {
            const errorMsg = result.message || result.error || 'Error al guardar el estudiante';
            console.error('Error saving student:', {
                status: response.status,
                statusText: response.statusText,
                result: result
            });
            alert(`Error al guardar el estudiante: ${errorMsg}`);
        }
    } catch (error) {
        alert('Error al conectar con el servidor');
    }
}

/**
 * Edit a student - populate form with student data
 * Made globally accessible
 */
window.editStudent = async function(id) {
    // Convert ID to number for consistent comparison
    const studentId = parseInt(id);
    
    if (!id || isNaN(studentId)) {
        console.error('editStudent: ID no válido', id);
        alert('Error: ID de estudiante no válido');
        return;
    }

    // Find student - handle both string and number
    let student = appData.estudiante?.find(s => 
        parseInt(s.ID_Estudiante) === studentId
    );
    
    // Si no se encuentra en appData, recargar datos y luego obtenerlo desde la API
    if (!student) {
        console.warn('editStudent: Estudiante no encontrado en appData, recargando datos...', studentId);
        // Primero intentar recargar appData completo
        if (typeof loadData === 'function') {
            try {
                await loadData();
                // Buscar nuevamente después de recargar
                student = appData.estudiante?.find(s => 
                    parseInt(s.ID_Estudiante) === studentId
                );
            } catch (error) {
                console.warn('editStudent: Error al recargar datos:', error);
            }
        }
        
        // Si aún no se encuentra, obtenerlo directamente de la API
        if (!student) {
            console.warn('editStudent: Estudiante aún no encontrado, obteniendo desde API...', studentId);
            try {
                const isInPages = window.location.pathname.includes('/pages/');
                const baseUrl = isInPages ? '../api' : 'api';
                const response = await fetch(`${baseUrl}/estudiantes.php?id=${studentId}`, {
                    method: 'GET',
                    credentials: 'include',
                    headers: { 'Accept': 'application/json' }
                });
                
                if (response.ok) {
                    const studentData = await response.json();
                    // Si la respuesta es un objeto con el estudiante directamente
                    if (studentData.ID_Estudiante) {
                        student = studentData;
                        // Actualizar appData con el estudiante obtenido
                        if (!appData.estudiante) {
                            appData.estudiante = [];
                        }
                        // Verificar si ya existe en appData y actualizarlo, o agregarlo
                        const existingIndex = appData.estudiante.findIndex(s => 
                            parseInt(s.ID_Estudiante) === studentId
                        );
                        if (existingIndex >= 0) {
                            appData.estudiante[existingIndex] = student;
                        } else {
                            appData.estudiante.push(student);
                        }
                    } else if (studentData.success === false) {
                        console.error('editStudent: Error desde API:', studentData.message);
                        alert('Estudiante no encontrado: ' + (studentData.message || 'El estudiante no existe en la base de datos'));
                        return;
                    } else {
                        console.error('editStudent: Formato de respuesta inesperado:', studentData);
                        alert('Error al cargar el estudiante: Formato de respuesta inesperado');
                        return;
                    }
                } else {
                    const errorData = await response.json().catch(() => ({}));
                    console.error('editStudent: Error HTTP:', response.status, errorData);
                    alert('Error al cargar el estudiante: ' + (errorData.message || `Error ${response.status}`));
                    return;
                }
            } catch (error) {
                console.error('editStudent: Error al obtener estudiante desde API:', error);
                alert('Error al cargar el estudiante: ' + (error.message || 'Error de conexión'));
                return;
            }
        }
    }
    
    if (!student) {
        console.error('editStudent: No se pudo obtener el estudiante', studentId);
        alert('No se pudo cargar la información del estudiante');
        return;
    }

    // Save ID for edit mode
    if (typeof setEditingStudentId === 'function') {
        setEditingStudentId(studentId);
    }

    // Fill form with student data
    const firstNameInput = document.getElementById('studentFirstName');
    const lastNameInput = document.getElementById('studentLastName');
    const emailInput = document.getElementById('studentEmail');
    
    if (!firstNameInput || !lastNameInput) {
        console.error('editStudent: Campos del formulario no encontrados');
        alert('Error: No se pudo encontrar el formulario');
        return;
    }
    
    firstNameInput.value = student.Nombre || '';
    lastNameInput.value = student.Apellido || '';
    if (emailInput) {
        emailInput.value = student.Email || '';
    }
    
    // Set status based on INTENSIFICA column from database
    const studentStatus = document.getElementById('studentStatus');
    if (studentStatus) {
        // Use INTENSIFICA column to determine status to show
        const esIntensifica = student.INTENSIFICA === true || 
                             student.INTENSIFICA === 1 || 
                             student.INTENSIFICA === '1';
        
        if (esIntensifica) {
            studentStatus.value = 'INTENSIFICA';
            // Show theme selector and load assigned themes
            const themesContainer = document.getElementById('intensificacionThemesContainer');
            if (themesContainer) {
                themesContainer.style.display = 'block';
                // Load themes already assigned to student
                // First ensure tema_estudiante data is loaded
                if (!appData.tema_estudiante || !Array.isArray(appData.tema_estudiante)) {
                    console.log('tema_estudiante no disponible, recargando datos...');
                    try {
                        if (typeof loadData === 'function') {
                            await loadData();
                        }
                    } catch (error) {
                        console.error('Error al recargar tema_estudiante:', error);
                    }
                }
                
                const assignedThemeIds = appData.tema_estudiante && Array.isArray(appData.tema_estudiante)
                    ? appData.tema_estudiante
                        .filter(te => parseInt(te.Estudiante_ID_Estudiante) === studentId)
                        .map(te => parseInt(te.Contenido_ID_contenido))
                        .filter(id => !isNaN(id))
                    : [];
                
                console.log('Temas asignados al estudiante:', assignedThemeIds);
                
                if (typeof setSelectedIntensificacionThemes === 'function') {
                    setSelectedIntensificacionThemes(assignedThemeIds);
                }
                
                // Wait a bit to ensure state is set before loading themes
                setTimeout(() => {
                    if (typeof loadIntensificacionThemes === 'function') {
                        loadIntensificacionThemes();
                    }
                }, 100);
            }
        } else {
            // ACTIVO or INACTIVO (not intensifier)
            const estado = (student.Estado || '').toUpperCase();
            studentStatus.value = estado === 'ACTIVO' ? 'ACTIVO' : 'INACTIVO';
            // Hide theme selector
            const themesContainer = document.getElementById('intensificacionThemesContainer');
            if (themesContainer) {
                themesContainer.style.display = 'none';
            }
            if (typeof setSelectedIntensificacionThemes === 'function') {
                setSelectedIntensificacionThemes([]);
            }
        }
        
        // Toggle topics dropdown visibility based on status
        // This ensures the topics dropdown is shown/hidden correctly
        setTimeout(() => {
            if (typeof toggleIntensificacionThemes === 'function') {
                toggleIntensificacionThemes();
            }
        }, 50);
    }
    
    // Clear and populate selected subjects
    if (typeof clearSelectedSubjects === 'function') {
        clearSelectedSubjects();
    }
    
    // Get student subjects
    const studentSubjects = (appData.alumnos_x_materia || [])
        .filter(axm => parseInt(axm.Estudiante_ID_Estudiante) === studentId)
        .map(axm => {
            const subject = appData.materia.find(m => m.ID_materia === axm.Materia_ID_materia);
            if (subject) {
                return {
                    id: subject.ID_materia,
                    name: subject.Nombre,
                    curso: subject.Curso_division
                };
            }
            return null;
        })
        .filter(s => s !== null);
    
    if (typeof setSelectedSubjects === 'function') {
        setSelectedSubjects(studentSubjects);
    }
    
    // Render selected subjects
    if (typeof renderSelectedSubjects === 'function') {
        renderSelectedSubjects();
    }
    
    // Populate dropdowns with available subjects
    if (typeof populateStudentSubjectsSelect === 'function') {
        populateStudentSubjectsSelect();
    }
    
    // Load topics already assigned to student
    if (typeof clearSelectedTopics === 'function') {
        clearSelectedTopics();
    }
    if (appData.tema_estudiante && Array.isArray(appData.tema_estudiante)) {
        const assignedTopics = appData.tema_estudiante
            .filter(te => parseInt(te.Estudiante_ID_Estudiante) === studentId)
            .map(te => {
                const contenido = appData.contenido.find(c => parseInt(c.ID_contenido) === parseInt(te.Contenido_ID_contenido));
                if (contenido) {
                    const materiaId = parseInt(contenido.Materia_ID_materia);
                    const subject = studentSubjects.find(s => parseInt(s.id) === materiaId);
                    if (subject) {
                        return {
                            id: parseInt(contenido.ID_contenido),
                            name: contenido.Tema || 'Sin título',
                            subjectId: materiaId,
                            subjectName: subject.name
                        };
                    }
                }
                return null;
            })
            .filter(t => t !== null);
        
        if (typeof setSelectedTopics === 'function') {
            setSelectedTopics(assignedTopics);
        }
    }
    
    // Render selected topics
    if (typeof renderSelectedTopics === 'function') {
        renderSelectedTopics();
    }
    
    // Populate topic selector
    if (typeof populateStudentTopicsSelect === 'function') {
        populateStudentTopicsSelect();
    }

    // Use setTimeout to ensure modal opens correctly
    setTimeout(() => {
        if (typeof showModal === 'function') {
            showModal('studentModal');
        } else {
            const modal = document.getElementById('studentModal');
            if (modal) {
                modal.classList.add('active');
            }
        }
    }, 50);
};

/**
 * Delete a student
 * Made globally accessible
 */
window.deleteStudent = async function(id) {
    if (!id) {
        console.error('deleteStudent: ID no proporcionado');
        alert('Error: ID de estudiante no válido');
        return;
    }

    if (!confirm('¿Estás seguro de que deseas eliminar este estudiante?')) {
        return;
    }

    try {
        const response = await fetch(`../api/estudiantes.php?id=${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include'
        });

        // Verify if response is JSON
        let result;
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            result = await response.json();
        } else {
            const text = await response.text();
            console.error('Respuesta no JSON:', text);
            throw new Error('Respuesta del servidor no válida');
        }

        if (response.ok && result.success) {
            // Update local data
            if (typeof loadData === 'function') {
                await loadData();
            }
            
            // Reload view
            if (typeof loadStudents === 'function') {
                loadStudents();
            }
            if (typeof loadUnifiedStudentData === 'function') {
                loadUnifiedStudentData();
            }
            if (typeof updateDashboard === 'function') {
                updateDashboard();
            }
            
            // Show notification
            if (typeof showNotification === 'function') {
                showNotification(result.message || 'Estudiante eliminado exitosamente', 'success');
            } else {
                alert(result.message || 'Estudiante eliminado exitosamente');
            }
        } else {
            const errorMsg = result.message || 'Error al eliminar el estudiante';
            console.error('Error al eliminar estudiante:', errorMsg);
            alert(errorMsg);
        }
    } catch (error) {
        console.error('Error en deleteStudent:', error);
        alert('Error al conectar con el servidor: ' + (error.message || 'Error desconocido'));
    }
};

