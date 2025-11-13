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
                if (estadoSeleccionado === 'INTENSIFICA' && selectedIntensificacionThemes.length > 0) {
                    try {
                        await saveThemesAssignment(studentId, selectedIntensificacionThemes);
                        // Clear after saving
                        if (typeof clearSelectedIntensificacionThemes === 'function') {
                            clearSelectedIntensificacionThemes();
                        }
                    } catch (err) {
                        console.error('Error guardando temas de intensificación:', err);
                        alert('Estudiante guardado pero hubo un error al asignar los temas de intensificación.');
                    }
                }
                
                // Save manually selected topics (save flag before clearing)
                const selectedTopics = typeof getSelectedTopics === 'function' ? getSelectedTopics() : [];
                const hasManualTopics = selectedTopics.length > 0;
                if (hasManualTopics) {
                    try {
                        const selectedTopicIds = selectedTopics.map(t => t.id);
                        await saveThemesAssignment(studentId, selectedTopicIds);
                        console.log('Temas manualmente seleccionados guardados:', selectedTopicIds);
                    } catch (err) {
                        console.error('Error guardando temas seleccionados:', err);
                        alert('Estudiante guardado pero hubo un error al asignar los temas seleccionados.');
                    }
                }
                
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
                            
                            // Create tema_estudiante records for all contents of selected subjects
                            // Only if topics haven't been manually selected (to avoid duplicates)
                            if (!hasManualTopics) {
                                try {
                                    await createTemaEstudianteForSubjects(studentId, selectedSubjectIds);
                                } catch (err) {
                                    console.error('Error creando tema_estudiante records:', err);
                                    // Don't show alert to user, just log the error
                                    // tema_estudiante can be created manually later if needed
                                }
                            } else {
                                console.log('Temas manualmente seleccionados, omitiendo creación automática de todos los temas');
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
            
            // Clear lists after successful save
            if (typeof clearSelectedTopics === 'function') {
                clearSelectedTopics();
            }
            if (typeof clearSelectedIntensificacionThemes === 'function') {
                clearSelectedIntensificacionThemes();
            }
            
            // Update local data by reloading from server
            await loadData();
            
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
window.editStudent = function(id) {
    // Convert ID to number for consistent comparison
    const studentId = parseInt(id);
    
    if (!id || isNaN(studentId)) {
        console.error('editStudent: ID no válido', id);
        alert('Error: ID de estudiante no válido');
        return;
    }

    // Find student - handle both string and number
    const student = appData.estudiante.find(s => 
        parseInt(s.ID_Estudiante) === studentId
    );
    
    if (!student) {
        console.error('editStudent: Estudiante no encontrado', studentId, appData.estudiante);
        alert('Estudiante no encontrado');
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
                const assignedThemeIds = appData.tema_estudiante && Array.isArray(appData.tema_estudiante)
                    ? appData.tema_estudiante
                        .filter(te => parseInt(te.Estudiante_ID_Estudiante) === studentId)
                        .map(te => parseInt(te.Contenido_ID_contenido))
                    : [];
                
                if (typeof setSelectedIntensificacionThemes === 'function') {
                    setSelectedIntensificacionThemes(assignedThemeIds);
                }
                if (typeof loadIntensificacionThemes === 'function') {
                    loadIntensificacionThemes();
                }
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
    
    // If all subjects belong to the same course, set course in select
    if (studentSubjects.length > 0) {
        const uniqueCourses = [...new Set(studentSubjects.map(s => s.curso).filter(Boolean))];
        if (uniqueCourses.length === 1) {
            const courseSelect = document.getElementById('studentCourse');
            if (courseSelect) {
                courseSelect.value = uniqueCourses[0];
            }
        }
    }
    
    // Populate dropdowns with available subjects
    if (typeof populateStudentCourseSelect === 'function') {
        populateStudentCourseSelect();
    }
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

