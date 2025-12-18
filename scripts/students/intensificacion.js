/**
 * Intensification Themes Module
 * 
 * Handles the selection and management of intensification themes for students
 * with the INTENSIFICA status. Includes functionality to create new themes
 * and assign them to students.
 */

/**
 * Toggle the intensification themes container visibility based on student status
 * Made globally accessible
 */
window.toggleIntensificacionThemes = function() {
    const studentStatus = document.getElementById('studentStatus');
    const themesContainer = document.getElementById('intensificacionThemesContainer');
    const topicsContainer = document.getElementById('studentTopicsContainer');
    
    if (!studentStatus) return;
    
    const isIntensifica = studentStatus.value === 'INTENSIFICA';
    
    // Toggle intensification themes container
    if (themesContainer) {
        if (isIntensifica) {
            themesContainer.style.display = 'block';
            loadIntensificacionThemes();
        } else {
            themesContainer.style.display = 'none';
            if (typeof clearSelectedIntensificacionThemes === 'function') {
                clearSelectedIntensificacionThemes();
            }
            renderIntensificacionThemes();
        }
    }
    
    // Hide topics selector dropdown when INTENSIFICA is selected
    // The intensification themes container (with checkboxes) is used instead
    if (topicsContainer) {
        // Always hide the dropdown selector - intensification uses the checkbox container instead
        topicsContainer.style.display = 'none';
        // Clear selected topics when hiding
        const topicsSelect = document.getElementById('studentTopics');
        if (topicsSelect) {
            topicsSelect.value = '';
        }
        const selectedTopicsContainer = document.getElementById('selectedTopicsContainer');
        if (selectedTopicsContainer) {
            selectedTopicsContainer.style.display = 'none';
            selectedTopicsContainer.innerHTML = '';
        }
        // Clear selected topics from memory if function exists
        if (typeof clearSelectedTopics === 'function') {
            clearSelectedTopics();
        }
    }
};

/**
 * Load available themes for intensification based on selected subjects
 */
function loadIntensificacionThemes() {
    const themesList = document.getElementById('intensificacionThemesList');
    if (!themesList) return;
    
    // Ensure data is available
    if (!appData.contenido || !Array.isArray(appData.contenido)) {
        appData.contenido = [];
    }
    if (!appData.materia || !Array.isArray(appData.materia)) {
        appData.materia = [];
    }
    
    // Get selected subjects
    const selectedSubjects = typeof getSelectedSubjects === 'function' ? getSelectedSubjects() : [];
    
    // Verify that there are selected subjects
    if (selectedSubjects.length === 0) {
        themesList.innerHTML = '<p style="color: #999; padding: 10px; text-align: center;">Primero selecciona las materias del estudiante.</p>';
        return;
    }
    
    // Get selected theme IDs - ensure they are all numbers for comparison
    const selectedThemeIdsRaw = typeof getSelectedIntensificacionThemes === 'function' ? getSelectedIntensificacionThemes() : [];
    const selectedThemeIds = selectedThemeIdsRaw.map(id => parseInt(id)).filter(id => !isNaN(id));
    
    console.log('loadIntensificacionThemes - Temas seleccionados:', selectedThemeIds);
    console.log('loadIntensificacionThemes - Materias seleccionadas:', selectedSubjects);
    
    // Render themes grouped by subject
    let htmlContent = '';
    
    selectedSubjects.forEach(subject => {
        const subjectId = parseInt(subject.id);
        const materia = appData.materia.find(m => parseInt(m.ID_materia) === subjectId);
        
        if (!materia) {
            console.warn('Materia no encontrada para ID:', subjectId);
            return;
        }
        
        // Get themes for this specific subject
        const temasDeMateria = (appData.contenido || []).filter(c => 
            parseInt(c.Materia_ID_materia) === subjectId
        );
        
        console.log(`Temas para materia ${materia.Nombre} (ID: ${subjectId}):`, temasDeMateria.length);
        
        htmlContent += `
            <div style="margin-bottom: 20px; padding: 12px; background: #fff; border-radius: 6px; border: 1px solid #e0e0e0;">
                <div style="font-weight: 600; color: #333; margin-bottom: 10px; font-size: 0.95em;">
                    <i class="fas fa-book" style="margin-right: 6px; color: #667eea;"></i>
                    ${materia.Nombre} ${materia.Curso_division ? `- ${materia.Curso_division}` : ''}
                </div>
        `;
        
        if (temasDeMateria.length > 0) {
            // Show existing themes with checkboxes
            temasDeMateria.forEach(contenido => {
                const contenidoId = parseInt(contenido.ID_contenido);
                const isSelected = selectedThemeIds.includes(contenidoId);
                
                console.log(`Tema ${contenido.Tema} (ID: ${contenidoId}) - Seleccionado:`, isSelected);
                
                htmlContent += `
                    <label style="display: flex; align-items: start; padding: 8px; cursor: pointer; margin-bottom: 5px; border-radius: 4px; ${isSelected ? 'background: #e8f5e9;' : 'background: #f9f9f9;'}">
                        <input type="checkbox" 
                               value="${contenido.ID_contenido}" 
                               ${isSelected ? 'checked' : ''}
                               onchange="toggleIntensificacionTheme(${contenido.ID_contenido}, this.checked)"
                               style="margin-right: 10px; margin-top: 3px;">
                        <div style="flex: 1;">
                            <div style="font-weight: 500; color: #333;">${contenido.Tema || 'Sin título'}</div>
                            ${contenido.Descripcion ? `<div style="font-size: 0.85em; color: #999; margin-top: 2px;">${contenido.Descripcion.substring(0, 50)}${contenido.Descripcion.length > 50 ? '...' : ''}</div>` : ''}
                        </div>
                    </label>
                `;
            });
        } else {
            // If no themes, show text box to create a new one
            htmlContent += `
                <div style="padding: 10px; background: #fff9e6; border: 1px dashed #ffc107; border-radius: 4px;">
                    <small style="display: block; color: #856404; margin-bottom: 8px;">
                        <i class="fas fa-info-circle" style="margin-right: 4px;"></i>
                        Esta materia no tiene temas. Agrega uno aquí:
                    </small>
                    <div style="display: flex; gap: 8px; align-items: flex-start;">
                        <input type="text" 
                               id="newThemeInput_${subjectId}" 
                               placeholder="Nombre del tema..." 
                               style="flex: 1; padding: 8px; border: 1px solid #ddd; border-radius: 4px; font-size: 0.9em;"
                               onkeypress="if(event.key === 'Enter') createIntensificacionTheme(${subjectId})">
                        <button type="button" 
                                onclick="createIntensificacionTheme(${subjectId})"
                                class="btn-primary" 
                                style="padding: 8px 12px; font-size: 0.85em; white-space: nowrap;">
                            <i class="fas fa-plus"></i> Crear
                        </button>
                    </div>
                </div>
            `;
        }
        
        htmlContent += `</div>`;
    });
    
    themesList.innerHTML = htmlContent;
}

/**
 * Create a new theme from the intensification form
 * Made globally accessible
 */
window.createIntensificacionTheme = async function(materiaId) {
    const input = document.getElementById(`newThemeInput_${materiaId}`);
    if (!input) return;
    
    const temaNombre = input.value.trim();
    if (!temaNombre) {
        alert('Por favor ingresa el nombre del tema');
        return;
    }
    
    try {
        // Create the theme in the database
        const response = await fetch('../api/contenido.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({
                Tema: temaNombre,
                Descripcion: '',
                Estado: 'PENDIENTE',
                Materia_ID_materia: materiaId
            })
        });
        
        const result = await response.json();
        
        if (response.ok && result.success !== false) {
            // Reload data
            if (typeof loadData === 'function') {
                await loadData();
            }
            
            // Reload themes list
            loadIntensificacionThemes();
            
            // Clear input
            input.value = '';
            
            // Automatically select the newly created theme
            if (result.id || result.data?.ID_contenido) {
                const nuevoTemaId = result.id || result.data.ID_contenido;
                if (typeof addSelectedIntensificacionTheme === 'function') {
                    addSelectedIntensificacionTheme(nuevoTemaId);
                }
                // Reload to show checkbox selected
                loadIntensificacionThemes();
            }
        } else {
            alert('Error al crear el tema: ' + (result.message || 'Error desconocido'));
        }
    } catch (error) {
        console.error('Error creando tema:', error);
        alert('Error al conectar con el servidor');
    }
};

/**
 * Create theme from the modal for assigning themes
 * Made globally accessible
 */
window.createIntensificacionThemeFromModal = async function(materiaId, studentId) {
    const input = document.getElementById(`newThemeModalInput_${materiaId}`);
    if (!input) return;
    
    const temaNombre = input.value.trim();
    if (!temaNombre) {
        alert('Por favor ingresa el nombre del tema');
        return;
    }
    
    try {
        // Create the theme in the database
        const response = await fetch('../api/contenido.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({
                Tema: temaNombre,
                Descripcion: '',
                Estado: 'PENDIENTE',
                Materia_ID_materia: materiaId
            })
        });
        
        const result = await response.json();
        
        if (response.ok && result.success !== false) {
            // Reload data
            if (typeof loadData === 'function') {
                await loadData();
            }
            
            // Reload the modal with new themes
            if (typeof assignThemesToIntensificador === 'function') {
                assignThemesToIntensificador(studentId);
            }
            
            // Automatically select the newly created theme
            if (result.id || result.data?.ID_contenido) {
                const nuevoTemaId = result.id || result.data.ID_contenido;
                if (typeof addSelectedIntensificacionTheme === 'function') {
                    addSelectedIntensificacionTheme(nuevoTemaId);
                }
                // Wait a bit and reload modal to show checkbox selected
                setTimeout(() => {
                    if (typeof assignThemesToIntensificador === 'function') {
                        assignThemesToIntensificador(studentId);
                    }
                }, 300);
            }
        } else {
            alert('Error al crear el tema: ' + (result.message || 'Error desconocido'));
        }
    } catch (error) {
        console.error('Error creando tema desde modal:', error);
        alert('Error al conectar con el servidor');
    }
};

/**
 * Toggle individual theme selection
 * Made globally accessible
 */
window.toggleIntensificacionTheme = function(contenidoId, isChecked) {
    // Normalizar el ID a número para consistencia
    const normalizedId = parseInt(contenidoId);
    if (isNaN(normalizedId)) {
        console.error('toggleIntensificacionTheme: ID inválido', contenidoId);
        return;
    }
    
    console.log('toggleIntensificacionTheme:', { contenidoId: normalizedId, isChecked });
    
    if (isChecked) {
        if (typeof addSelectedIntensificacionTheme === 'function') {
            addSelectedIntensificacionTheme(normalizedId);
        }
    } else {
        if (typeof removeSelectedIntensificacionTheme === 'function') {
            removeSelectedIntensificacionTheme(normalizedId);
        }
    }
    
    // Actualizar la vista visualmente recargando los temas
    // Esto asegura que los checkboxes reflejen el estado actual
    if (typeof loadIntensificacionThemes === 'function') {
        loadIntensificacionThemes();
    }
    
    // Log para debugging
    const currentThemes = typeof getSelectedIntensificacionThemes === 'function' ? getSelectedIntensificacionThemes() : [];
    console.log('Temas seleccionados después del cambio:', currentThemes);
};

/**
 * Render selected intensification themes (currently just a placeholder)
 */
function renderIntensificacionThemes() {
    // No need to show separate chips, checkboxes already show the state
    // But we can add a counter if necessary
}

/**
 * Assign themes to an intensifier student via modal
 * Made globally accessible
 */
window.assignThemesToIntensificador = async function(studentId) {
    if (!studentId) {
        alert('Error: ID de estudiante no válido');
        return;
    }
    
    const studentIdNum = parseInt(studentId);
    let student = appData.estudiante?.find(s => parseInt(s.ID_Estudiante) === studentIdNum);
    
    // Si no se encuentra en appData, recargar datos y luego obtenerlo desde la API
    if (!student) {
        console.warn('assignThemesToIntensificador: Estudiante no encontrado en appData, recargando datos...', studentIdNum);
        // Primero intentar recargar appData completo
        if (typeof loadData === 'function') {
            try {
                await loadData();
                // Buscar nuevamente después de recargar
                student = appData.estudiante?.find(s => parseInt(s.ID_Estudiante) === studentIdNum);
            } catch (error) {
                console.warn('assignThemesToIntensificador: Error al recargar datos:', error);
            }
        }
        
        // Si aún no se encuentra, obtenerlo directamente de la API
        if (!student) {
            console.warn('assignThemesToIntensificador: Estudiante aún no encontrado, obteniendo desde API...', studentIdNum);
            try {
                const isInPages = window.location.pathname.includes('/pages/');
                const baseUrl = isInPages ? '../api' : 'api';
                const response = await fetch(`${baseUrl}/estudiantes.php?id=${studentIdNum}`, {
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
                            parseInt(s.ID_Estudiante) === studentIdNum
                        );
                        if (existingIndex >= 0) {
                            appData.estudiante[existingIndex] = student;
                        } else {
                            appData.estudiante.push(student);
                        }
                    } else if (studentData.success === false) {
                        console.error('assignThemesToIntensificador: Error desde API:', studentData.message);
                        alert('Error: Estudiante no encontrado - ' + (studentData.message || 'El estudiante no existe en la base de datos'));
                        return;
                    } else {
                        console.error('assignThemesToIntensificador: Formato de respuesta inesperado:', studentData);
                        alert('Error: No se pudo cargar el estudiante - Formato de respuesta inesperado');
                        return;
                    }
                } else {
                    const errorData = await response.json().catch(() => ({}));
                    console.error('assignThemesToIntensificador: Error HTTP:', response.status, errorData);
                    alert('Error: No se pudo cargar el estudiante - ' + (errorData.message || `Error ${response.status}`));
                    return;
                }
            } catch (error) {
                console.error('assignThemesToIntensificador: Error al obtener estudiante desde API:', error);
                alert('Error: No se pudo cargar el estudiante - ' + (error.message || 'Error de conexión'));
                return;
            }
        }
    }
    
    if (!student) {
        console.error('assignThemesToIntensificador: No se pudo obtener el estudiante', studentIdNum);
        alert('Error: No se pudo cargar la información del estudiante');
        return;
    }
    
    // Verify that student is an intensifier using INTENSIFICA column
    // Check multiple possible formats: boolean true, number 1, string '1', string 'true'
    const esIntensificador = student.INTENSIFICA === true || 
                            student.INTENSIFICA === 1 || 
                            student.INTENSIFICA === '1' ||
                            student.INTENSIFICA === 'true' ||
                            String(student.INTENSIFICA).toLowerCase() === 'true';
    
    if (!esIntensificador) {
        console.warn('assignThemesToIntensificador: Estudiante no es intensificador', {
            studentId: studentIdNum,
            INTENSIFICA: student.INTENSIFICA,
            tipo: typeof student.INTENSIFICA
        });
        alert('Esta función solo está disponible para estudiantes intensificadores. El estudiante debe tener el estado "Intensifica" para poder asignarle temas.');
        return;
    }
    
    // Load available themes
    if (!appData.contenido || !Array.isArray(appData.contenido)) {
        appData.contenido = [];
    }
    if (!appData.materia || !Array.isArray(appData.materia)) {
        appData.materia = [];
    }
    
    // Get subjects the student is enrolled in
    if (!appData.alumnos_x_materia || !Array.isArray(appData.alumnos_x_materia)) {
        appData.alumnos_x_materia = [];
    }
    
    // Recargar alumnos_x_materia si está vacío o no existe
    if (!appData.alumnos_x_materia || appData.alumnos_x_materia.length === 0) {
        console.log('Recargando alumnos_x_materia...');
        try {
            if (typeof loadData === 'function') {
                await loadData();
            }
        } catch (error) {
            console.error('Error al recargar datos:', error);
        }
    }
    
    const materiasDelEstudiante = (appData.alumnos_x_materia || [])
        .filter(axm => parseInt(axm.Estudiante_ID_Estudiante) === studentIdNum)
        .map(axm => parseInt(axm.Materia_ID_materia));
    
    if (materiasDelEstudiante.length === 0) {
        alert('Este estudiante no está inscrito en ninguna materia. Por favor, primero asigna materias al estudiante desde el formulario de edición.');
        return;
    }
    
    // Get themes only from subjects the student is enrolled in
    const availableThemes = (appData.contenido || []).filter(c => 
        materiasDelEstudiante.includes(parseInt(c.Materia_ID_materia))
    );
    
    // Get already assigned themes
    if (!appData.tema_estudiante || !Array.isArray(appData.tema_estudiante)) {
        appData.tema_estudiante = [];
    }
    
    const assignedThemeIds = appData.tema_estudiante
        .filter(te => parseInt(te.Estudiante_ID_Estudiante) === parseInt(studentId))
        .map(te => parseInt(te.Contenido_ID_contenido));
    
    // Group themes by subject
    const temasPorMateria = {};
    materiasDelEstudiante.forEach(materiaId => {
        const materia = appData.materia.find(m => parseInt(m.ID_materia) === materiaId);
        if (materia) {
            const temas = availableThemes.filter(c => parseInt(c.Materia_ID_materia) === materiaId);
            temasPorMateria[materiaId] = {
                materia: materia,
                temas: temas
            };
        }
    });
    
    // Create modal content for theme selection, grouped by subject
    const modalContent = `
        <div style="padding: 20px;">
            <h3 style="margin-bottom: 15px;">Asignar Temas de Intensificación</h3>
            <p style="margin-bottom: 15px; color: #666;"><strong>Estudiante:</strong> ${student.Nombre} ${student.Apellido}</p>
            <div style="max-height: 400px; overflow-y: auto; border: 1px solid #ddd; border-radius: 4px; padding: 10px; background: #f9f9f9;">
                ${Object.keys(temasPorMateria).map(materiaId => {
                    const { materia, temas } = temasPorMateria[materiaId];
                    
                    let temasHTML = '';
                    
                    if (temas.length > 0) {
                        temasHTML = temas.map(contenido => {
                            const isAssigned = assignedThemeIds.includes(parseInt(contenido.ID_contenido));
                            
                            return `
                                <label style="display: flex; align-items: start; padding: 10px; cursor: pointer; margin-bottom: 8px; border-radius: 4px; ${isAssigned ? 'background: #e8f5e9;' : 'background: #fff;'} border: 1px solid #e0e0e0;">
                                    <input type="checkbox" 
                                           value="${contenido.ID_contenido}" 
                                           ${isAssigned ? 'checked' : ''}
                                           class="theme-checkbox-${studentId}"
                                           data-already-assigned="${isAssigned}"
                                           style="margin-right: 10px; margin-top: 3px;">
                                    <div style="flex: 1;">
                                        <div style="font-weight: 600; color: #333; margin-bottom: 4px;">${contenido.Tema || 'Sin título'}</div>
                                        ${contenido.Descripcion ? `<div style="font-size: 0.85em; color: #999; margin-top: 4px;">${contenido.Descripcion}</div>` : ''}
                                        ${isAssigned ? '<span style="color: #4caf50; font-size: 0.85em; margin-left: 10px;"><i class="fas fa-check-circle"></i> Ya asignado</span>' : ''}
                                    </div>
                                </label>
                            `;
                        }).join('');
                    } else {
                        // If subject has no themes, show text box to create one
                        temasHTML = `
                            <div style="padding: 10px; background: #fff9e6; border: 1px dashed #ffc107; border-radius: 4px;">
                                <small style="display: block; color: #856404; margin-bottom: 8px;">
                                    <i class="fas fa-info-circle" style="margin-right: 4px;"></i>
                                    Esta materia no tiene temas. Agrega uno aquí:
                                </small>
                                <div style="display: flex; gap: 8px; align-items: flex-start;">
                                    <input type="text" 
                                           id="newThemeModalInput_${materiaId}" 
                                           placeholder="Nombre del tema..." 
                                           style="flex: 1; padding: 8px; border: 1px solid #ddd; border-radius: 4px; font-size: 0.9em;"
                                           onkeypress="if(event.key === 'Enter') createIntensificacionThemeFromModal(${materiaId}, ${studentId})">
                                    <button type="button" 
                                            onclick="createIntensificacionThemeFromModal(${materiaId}, ${studentId})"
                                            class="btn-primary" 
                                            style="padding: 8px 12px; font-size: 0.85em; white-space: nowrap;">
                                        <i class="fas fa-plus"></i> Crear
                                    </button>
                                </div>
                            </div>
                        `;
                    }
                    
                    return `
                        <div style="margin-bottom: 20px; padding: 12px; background: #fff; border-radius: 6px; border: 1px solid #e0e0e0;">
                            <div style="font-weight: 600; color: #333; margin-bottom: 10px; font-size: 0.95em;">
                                <i class="fas fa-book" style="margin-right: 6px; color: #667eea;"></i>
                                ${materia.Nombre} ${materia.Curso_division ? `- ${materia.Curso_division}` : ''}
                            </div>
                            ${temasHTML}
                        </div>
                    `;
                }).join('')}
            </div>
            <div style="margin-top: 20px; display: flex; gap: 10px; justify-content: flex-end;">
                <button id="cancelAssignThemesBtn" class="btn-secondary" style="padding: 8px 16px;">Cancelar</button>
                <button id="saveAssignThemesBtn" class="btn-primary" style="padding: 8px 16px;">Guardar Asignaciones</button>
            </div>
        </div>
    `;
    
    // Create or update modal
    let modal = document.getElementById('assignThemesModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'assignThemesModal';
        modal.className = 'modal';
        document.body.appendChild(modal);
    }
    
    const modalWrapper = document.createElement('div');
    modalWrapper.className = 'modal-content';
    modalWrapper.innerHTML = `
        <div class="modal-header">
            <h3>Asignar Temas de Intensificación</h3>
            <button class="close-modal">&times;</button>
        </div>
        ${modalContent}
    `;
    
    modal.innerHTML = '';
    modal.appendChild(modalWrapper);
    
    // Setup modal handlers
    if (typeof setupModalHandlers === 'function') {
        setupModalHandlers('assignThemesModal');
    }
    
    // Setup event listeners
    const cancelBtn = modalWrapper.querySelector('#cancelAssignThemesBtn');
    const saveBtn = modalWrapper.querySelector('#saveAssignThemesBtn');
    
    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            if (typeof closeModal === 'function') {
                closeModal('assignThemesModal');
            } else {
                modal.classList.remove('active');
            }
        });
    }
    
    if (saveBtn) {
        saveBtn.addEventListener('click', async () => {
            try {
                // Obtener todos los checkboxes
                const checkboxes = modalWrapper.querySelectorAll(`.theme-checkbox-${studentId}`);
                
                // Obtener temas actualmente seleccionados (marcados)
                const selectedThemeIds = Array.from(checkboxes)
                    .filter(cb => cb.checked)
                    .map(cb => parseInt(cb.value))
                    .filter(id => !isNaN(id));
                
                // Obtener temas que estaban asignados previamente
                const alreadyAssignedIds = Array.from(checkboxes)
                    .filter(cb => cb.getAttribute('data-already-assigned') === 'true')
                    .map(cb => parseInt(cb.value))
                    .filter(id => !isNaN(id));
                
                console.log('=== GUARDANDO TEMAS DESDE MODAL ===');
                console.log('Temas seleccionados:', selectedThemeIds);
                console.log('Temas previamente asignados:', alreadyAssignedIds);
                
                // Identificar temas a agregar (están seleccionados pero no estaban asignados)
                const themesToAdd = selectedThemeIds.filter(id => !alreadyAssignedIds.includes(id));
                
                // Identificar temas a eliminar (estaban asignados pero no están seleccionados)
                const themesToRemove = alreadyAssignedIds.filter(id => !selectedThemeIds.includes(id));
                
                console.log('Temas a agregar:', themesToAdd);
                console.log('Temas a eliminar:', themesToRemove);
                
                // Si no hay cambios, informar al usuario
                if (themesToAdd.length === 0 && themesToRemove.length === 0) {
                    alert('No hay cambios para guardar.');
                    return;
                }
                
                // Disable button during save
                saveBtn.disabled = true;
                saveBtn.textContent = 'Guardando...';
                
                // Recargar datos si no están disponibles
                if (!appData.tema_estudiante || !Array.isArray(appData.tema_estudiante)) {
                    if (typeof loadData === 'function') {
                        await loadData();
                    }
                }
                
                // Eliminar temas que se desmarcaron
                if (themesToRemove.length > 0) {
                    console.log('Eliminando temas:', themesToRemove);
                    for (const contenidoId of themesToRemove) {
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
                            // Obtener la materia del contenido
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
                if (themesToAdd.length > 0) {
                    console.log('=== AGREGANDO TEMAS NUEVOS ===');
                    console.log('Temas a agregar:', themesToAdd);
                    console.log('Estudiante ID:', studentId);
                    
                    // Guardar en Tema_estudiante Y en Intensificacion
                    // saveThemesAssignment ya guarda en ambas tablas automáticamente
                    if (typeof saveThemesAssignment === 'function') {
                        console.log('Llamando a saveThemesAssignment para guardar temas...');
                        try {
                            await saveThemesAssignment(studentId, themesToAdd);
                            console.log('✅ saveThemesAssignment completado exitosamente');
                        } catch (saveErr) {
                            console.error('❌ Error en saveThemesAssignment:', saveErr);
                            console.error('Stack trace:', saveErr.stack);
                            alert('Error al guardar los temas. Por favor, intente nuevamente.');
                        }
                    } else {
                        console.error('❌ saveThemesAssignment no está disponible');
                        alert('Error: Función de guardado no disponible. Por favor, recargue la página.');
                        
                        // Si saveThemesAssignment no está disponible, guardar manualmente
                        for (const contenidoId of themesToAdd) {
                            try {
                                // Obtener la materia del contenido
                                const contenido = (appData.contenido || []).find(c => parseInt(c.ID_contenido) === contenidoId);
                                if (!contenido || !contenido.Materia_ID_materia) {
                                    console.error(`No se encontró la materia para el contenido ${contenidoId}`);
                                    continue;
                                }
                                
                                const materiaId = parseInt(contenido.Materia_ID_materia);
                                
                                // Crear registro en Intensificacion
                                const payload = {
                                    Estudiante_ID_Estudiante: parseInt(studentId),
                                    Materia_ID_materia: materiaId,
                                    Contenido_ID_contenido: contenidoId,
                                    Estado: 'PENDIENTE',
                                    Nota_objetivo: 6.00
                                };
                                
                                console.log('=== INTENTANDO GUARDAR EN INTENSIFICACION (fallback) ===');
                                console.log('Payload:', payload);
                                
                                // Determinar la ruta correcta de la API
                                const isInPages = window.location.pathname.includes('/pages/');
                                const apiUrl = isInPages ? '../api/intensificacion.php' : 'api/intensificacion.php';
                                
                                console.log('URL de API:', apiUrl);
                                
                                const res = await fetch(apiUrl, {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                                    credentials: 'include',
                                    body: JSON.stringify(payload)
                                });
                                
                                console.log('Response status:', res.status);
                                console.log('Response ok:', res.ok);
                                
                                let data = {};
                                try {
                                    data = await res.json();
                                } catch (jsonErr) {
                                    const text = await res.text();
                                    console.error('Error parsing JSON response:', text);
                                    data = {};
                                }
                                
                                console.log('Response data:', data);
                                
                                if (res.ok || res.status === 409) {
                                    // 409 significa que ya existe, lo cual está bien
                                    console.log(`✅ Intensificación guardada para contenido ${contenidoId}`);
                                } else {
                                    console.error(`❌ Error guardando intensificación para contenido ${contenidoId}:`, data.message || data.error || 'Error desconocido');
                                    console.error('Response completa:', data);
                                }
                            } catch (err) {
                                console.error(`❌ Excepción guardando intensificación para contenido ${contenidoId}:`, err);
                                console.error('Stack trace:', err.stack);
                            }
                        }
                    }
                }
                
                // Recargar datos después de guardar (solo si se hicieron cambios)
                if (themesToAdd.length > 0 || themesToRemove.length > 0) {
                    // Esperar un momento para que los cambios se guarden en la base de datos
                    await new Promise(resolve => setTimeout(resolve, 500));
                    
                    // Recargar datos después de guardar
                    if (typeof loadData === 'function') {
                        await loadData();
                    }
                    
                    // Esperar un momento más para que los datos se actualicen
                    await new Promise(resolve => setTimeout(resolve, 300));
                    
                    // Verificar si el estudiante aún tiene temas pendientes o en progreso
                    // SOLO si se eliminaron temas (no si solo se agregaron)
                    // Si no tiene ningún tema, cambiar su estado de INTENSIFICA a ACTIVO
                    if (themesToRemove.length > 0) {
                        const temasRestantes = (appData.tema_estudiante || [])
                            .filter(te => 
                                parseInt(te.Estudiante_ID_Estudiante) === parseInt(studentId) &&
                                (te.Estado === 'PENDIENTE' || te.Estado === 'EN_PROGRESO')
                            );
                        
                        console.log('Temas restantes para el estudiante:', temasRestantes.length);
                        console.log('Temas restantes detalle:', temasRestantes);
                        
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
                        } else {
                            console.log('El estudiante aún tiene temas pendientes, manteniendo como INTENSIFICA');
                        }
                    }
                }
                
                // Mostrar mensaje de éxito
                const addedMsg = themesToAdd.length > 0 ? `${themesToAdd.length} tema(s) agregado(s)` : '';
                const removedMsg = themesToRemove.length > 0 ? `${themesToRemove.length} tema(s) eliminado(s)` : '';
                const successMsg = [addedMsg, removedMsg].filter(m => m).join('. ');
                
                if (typeof showNotification === 'function') {
                    showNotification(successMsg || 'Cambios guardados correctamente', 'success');
                } else {
                    alert(successMsg || 'Cambios guardados correctamente');
                }
                
                if (typeof closeModal === 'function') {
                    closeModal('assignThemesModal');
                } else {
                    modal.classList.remove('active');
                }
                
                // Recargar la vista del estudiante si está abierta
                if (typeof showStudentDetail === 'function') {
                    setTimeout(() => {
                        showStudentDetail(parseInt(studentId));
                    }, 500);
                }
            } catch (error) {
                console.error('Error al guardar temas:', error);
                alert('Error al guardar los temas: ' + (error.message || 'Error desconocido'));
            } finally {
                // Re-enable button
                if (saveBtn) {
                    saveBtn.disabled = false;
                    saveBtn.textContent = 'Guardar Asignaciones';
                }
            }
        });
    }
    
    // Show modal
    if (typeof showModal === 'function') {
        showModal('assignThemesModal');
    } else {
        modal.classList.add('active');
    }
};


