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
    
    if (!studentStatus || !themesContainer) return;
    
    if (studentStatus.value === 'INTENSIFICA') {
        themesContainer.style.display = 'block';
        loadIntensificacionThemes();
    } else {
        themesContainer.style.display = 'none';
        if (typeof clearSelectedIntensificacionThemes === 'function') {
            clearSelectedIntensificacionThemes();
        }
        renderIntensificacionThemes();
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
    
    // Get selected theme IDs
    const selectedThemeIds = typeof getSelectedIntensificacionThemes === 'function' ? getSelectedIntensificacionThemes() : [];
    
    // Render themes grouped by subject
    let htmlContent = '';
    
    selectedSubjects.forEach(subject => {
        const subjectId = parseInt(subject.id);
        const materia = appData.materia.find(m => parseInt(m.ID_materia) === subjectId);
        
        if (!materia) return;
        
        // Get themes for this specific subject
        const temasDeMateria = appData.contenido.filter(c => 
            parseInt(c.Materia_ID_materia) === subjectId
        );
        
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
                const isSelected = selectedThemeIds.includes(contenido.ID_contenido);
                
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
    if (isChecked) {
        if (typeof addSelectedIntensificacionTheme === 'function') {
            addSelectedIntensificacionTheme(contenidoId);
        }
    } else {
        if (typeof removeSelectedIntensificacionTheme === 'function') {
            removeSelectedIntensificacionTheme(contenidoId);
        }
    }
    renderIntensificacionThemes();
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
window.assignThemesToIntensificador = function(studentId) {
    if (!studentId) {
        alert('Error: ID de estudiante no válido');
        return;
    }
    
    const student = appData.estudiante.find(s => s.ID_Estudiante === studentId);
    if (!student) {
        alert('Error: Estudiante no encontrado');
        return;
    }
    
    // Verify that student is an intensifier using INTENSIFICA column
    const esIntensificador = student.INTENSIFICA === true || 
                            student.INTENSIFICA === 1 || 
                            student.INTENSIFICA === '1';
    if (!esIntensificador) {
        alert('Esta función solo está disponible para estudiantes intensificadores');
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
    
    const studentIdNum = parseInt(studentId);
    const materiasDelEstudiante = appData.alumnos_x_materia
        .filter(axm => parseInt(axm.Estudiante_ID_Estudiante) === studentIdNum)
        .map(axm => parseInt(axm.Materia_ID_materia));
    
    if (materiasDelEstudiante.length === 0) {
        alert('Este estudiante no está inscrito en ninguna materia. Por favor, primero asigna materias al estudiante.');
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
                            const isAssigned = assignedThemeIds.includes(contenido.ID_contenido);
                            
                            return `
                                <label style="display: flex; align-items: start; padding: 10px; cursor: pointer; margin-bottom: 8px; border-radius: 4px; ${isAssigned ? 'background: #e8f5e9;' : 'background: #fff;'} border: 1px solid #e0e0e0;">
                                    <input type="checkbox" 
                                           value="${contenido.ID_contenido}" 
                                           ${isAssigned ? 'checked disabled' : ''}
                                           class="theme-checkbox-${studentId}"
                                           style="margin-right: 10px; margin-top: 3px;">
                                    <div style="flex: 1;">
                                        <div style="font-weight: 600; color: #333; margin-bottom: 4px;">${contenido.Tema || 'Sin título'}</div>
                                        ${contenido.Descripcion ? `<div style="font-size: 0.85em; color: #999; margin-top: 4px;">${contenido.Descripcion}</div>` : ''}
                                        ${isAssigned ? '<span style="color: #4caf50; font-size: 0.85em; margin-left: 10px;">(Ya asignado)</span>' : ''}
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
            const checkboxes = modalWrapper.querySelectorAll(`.theme-checkbox-${studentId}:not(:disabled)`);
            const selectedThemeIds = Array.from(checkboxes)
                .filter(cb => cb.checked)
                .map(cb => parseInt(cb.value));
            
            if (typeof saveThemesAssignment === 'function') {
                await saveThemesAssignment(studentId, selectedThemeIds);
            }
            if (typeof closeModal === 'function') {
                closeModal('assignThemesModal');
            } else {
                modal.classList.remove('active');
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

