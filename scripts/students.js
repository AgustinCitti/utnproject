// Variable para almacenar el ID del estudiante que se está editando
let editingStudentId = null;
// Lista de materias seleccionadas para el estudiante
let selectedSubjectsList = [];
// Lista de temas seleccionados para asignar al estudiante
let selectedTopicsList = [];

// Función para poblar el select de materias con las del docente actual
function populateStudentSubjectsSelect() {
    const subjectsSelect = document.getElementById('studentSubjects');
    if (!subjectsSelect) return;
    
    // Obtener materias ya seleccionadas (para no mostrarlas en el dropdown)
    const selectedSubjectIds = selectedSubjectsList.map(s => s.id);
    
    // Limpiar opciones actuales excepto la primera
    subjectsSelect.innerHTML = '<option value="" data-translate="select_subject">- Seleccionar Materia -</option>';
    
    // El API ya filtra las materias por el docente logueado, así que solo filtramos por estado activo
    // Estado puede ser 'ACTIVA', 'INACTIVA', 'FINALIZADA', o null/undefined (en cuyo caso asumimos activa por defecto)
    const teacherSubjects = (appData.materia || []).filter(m => 
        (!m.Estado || m.Estado === 'ACTIVA') && !selectedSubjectIds.includes(m.ID_materia)
    );
    
    if (teacherSubjects.length === 0 && selectedSubjectsList.length === 0) {
        const option = document.createElement('option');
        option.value = '';
        option.textContent = 'No hay materias disponibles';
        option.disabled = true;
        subjectsSelect.appendChild(option);
    } else {
        teacherSubjects.forEach(subject => {
            const option = document.createElement('option');
            option.value = subject.ID_materia;
            option.textContent = `${subject.Nombre} - ${subject.Curso_division}`;
            subjectsSelect.appendChild(option);
        });
    }
    
    // Agregar event listener para cuando se selecciona una materia
    // Use a wrapper to ensure we only have one listener
    if (!subjectsSelect._hasSubjectListener) {
        subjectsSelect.addEventListener('change', handleSubjectSelection);
        subjectsSelect._hasSubjectListener = true;
    }
}

function handleSubjectSelection() {
    const subjectsSelect = document.getElementById('studentSubjects');
    const selectedValue = subjectsSelect.value;
    
    console.log('handleSubjectSelection called with value:', selectedValue);
    
    if (!selectedValue) {
        console.log('No value selected, returning');
        return;
    }
    
    // Encontrar la materia seleccionada
    const subject = appData.materia.find(m => parseInt(m.ID_materia) === parseInt(selectedValue));
    if (!subject) {
        console.error('Subject not found for ID:', selectedValue);
        return;
    }
    
    console.log('Found subject:', subject);
    
    // Agregar a la lista de seleccionadas si no está ya
    if (!selectedSubjectsList.some(s => parseInt(s.id) === parseInt(subject.ID_materia))) {
        selectedSubjectsList.push({
            id: parseInt(subject.ID_materia),
            name: subject.Nombre,
            curso: subject.Curso_division
        });
        console.log('Added subject to list. Current list:', selectedSubjectsList);
    } else {
        console.log('Subject already in list');
    }
    
    // Renderizar las materias seleccionadas
    renderSelectedSubjects();
    
    // Repoblar el dropdown (sin las ya seleccionadas)
    populateStudentSubjectsSelect();
    
    // Resetear el dropdown
    subjectsSelect.value = '';
    
    // Recargar el selector de temas ya que las materias cambiaron
    populateStudentTopicsSelect();
    
    // Si está activo el selector de temas de intensificación, recargar temas
    const studentStatus = document.getElementById('studentStatus');
    const themesContainer = document.getElementById('intensificacionThemesContainer');
    if (studentStatus && themesContainer && studentStatus.value === 'INTENSIFICA' && themesContainer.style.display !== 'none') {
        loadIntensificacionThemes();
    }
}

function renderSelectedSubjects() {
    const container = document.getElementById('selectedSubjectsContainer');
    if (!container) return;
    
    if (selectedSubjectsList.length === 0) {
        container.style.display = 'none';
        return;
    }
    
    container.style.display = 'block';
    container.innerHTML = selectedSubjectsList.map((subject, index) => `
        <span class="subject-chip" data-subject-id="${subject.id}">
            ${subject.name} - ${subject.curso}
            <button type="button" class="remove-subject-btn" onclick="removeSubject(${index})" title="Eliminar">
                <i class="fas fa-times"></i>
            </button>
        </span>
    `).join('');
}

function removeSubject(index) {
    selectedSubjectsList.splice(index, 1);
    renderSelectedSubjects();
    populateStudentSubjectsSelect();
    
    // Recargar el selector de temas ya que las materias cambiaron
    populateStudentTopicsSelect();
    
    // Remover temas que pertenecen a la materia eliminada
    if (selectedSubjectsList.length > 0) {
        const remainingSubjectIds = selectedSubjectsList.map(s => parseInt(s.id));
        selectedTopicsList = selectedTopicsList.filter(topic => {
            const topicSubjectId = parseInt(topic.subjectId);
            return remainingSubjectIds.includes(topicSubjectId);
        });
        renderSelectedTopics();
    } else {
        selectedTopicsList = [];
        renderSelectedTopics();
    }
}

// Make removeSubject globally accessible
window.removeSubject = removeSubject;

// Función para poblar el select de temas basado en las materias seleccionadas
function populateStudentTopicsSelect() {
    const topicsSelect = document.getElementById('studentTopics');
    if (!topicsSelect) return;
    
    // Limpiar opciones actuales
    topicsSelect.innerHTML = '<option value="" data-translate="select_topic">- Seleccionar Tema -</option>';
    
    // Si no hay materias seleccionadas, no mostrar temas
    if (selectedSubjectsList.length === 0) {
        const option = document.createElement('option');
        option.value = '';
        option.textContent = 'Primero selecciona materias';
        option.disabled = true;
        topicsSelect.appendChild(option);
        return;
    }
    
    // Asegurar que appData.contenido esté disponible
    if (!appData.contenido || !Array.isArray(appData.contenido)) {
        const option = document.createElement('option');
        option.value = '';
        option.textContent = 'Cargando temas...';
        option.disabled = true;
        topicsSelect.appendChild(option);
        return;
    }
    
    // Obtener IDs de las materias seleccionadas
    const selectedSubjectIds = selectedSubjectsList.map(s => parseInt(s.id));
    
    // Obtener temas ya seleccionados (para no mostrarlos en el dropdown)
    const selectedTopicIds = selectedTopicsList.map(t => t.id);
    
    // Obtener todos los contenidos de las materias seleccionadas
    const availableTopics = appData.contenido.filter(c => {
        const materiaId = parseInt(c.Materia_ID_materia);
        const contenidoId = parseInt(c.ID_contenido);
        return selectedSubjectIds.includes(materiaId) && !selectedTopicIds.includes(contenidoId);
    });
    
    if (availableTopics.length === 0) {
        const option = document.createElement('option');
        option.value = '';
        option.textContent = 'No hay temas disponibles';
        option.disabled = true;
        topicsSelect.appendChild(option);
        return;
    }
    
    // Agrupar temas por materia para mejor organización
    const topicsBySubject = {};
    availableTopics.forEach(topic => {
        const materiaId = parseInt(topic.Materia_ID_materia);
        if (!topicsBySubject[materiaId]) {
            const materia = appData.materia.find(m => parseInt(m.ID_materia) === materiaId);
            topicsBySubject[materiaId] = {
                materia: materia,
                topics: []
            };
        }
        topicsBySubject[materiaId].topics.push(topic);
    });
    
    // Agregar opciones agrupadas por materia
    selectedSubjectsList.forEach(subject => {
        const subjectId = parseInt(subject.id);
        const subjectData = topicsBySubject[subjectId];
        
        if (subjectData && subjectData.topics.length > 0) {
            // Agregar un optgroup para esta materia
            const optgroup = document.createElement('optgroup');
            optgroup.label = `${subject.name} - ${subject.curso}`;
            
            subjectData.topics.forEach(topic => {
                const option = document.createElement('option');
                option.value = topic.ID_contenido;
                option.textContent = topic.Tema || 'Sin título';
                option.dataset.subjectId = subjectId;
                optgroup.appendChild(option);
            });
            
            topicsSelect.appendChild(optgroup);
        }
    });
    
    // Agregar event listener para cuando se selecciona un tema
    if (!topicsSelect._hasTopicListener) {
        topicsSelect.addEventListener('change', handleTopicSelection);
        topicsSelect._hasTopicListener = true;
    }
}

function handleTopicSelection() {
    const topicsSelect = document.getElementById('studentTopics');
    const selectedValue = topicsSelect.value;
    
    if (!selectedValue) {
        return;
    }
    
    // Encontrar el tema seleccionado
    const topic = appData.contenido.find(c => parseInt(c.ID_contenido) === parseInt(selectedValue));
    if (!topic) {
        console.error('Topic not found for ID:', selectedValue);
        return;
    }
    
    // Encontrar la materia del tema
    const materiaId = parseInt(topic.Materia_ID_materia);
    const subject = selectedSubjectsList.find(s => parseInt(s.id) === materiaId);
    
    if (!subject) {
        console.error('Subject not found for topic:', topic);
        return;
    }
    
    // Agregar a la lista de seleccionados si no está ya
    if (!selectedTopicsList.some(t => parseInt(t.id) === parseInt(topic.ID_contenido))) {
        selectedTopicsList.push({
            id: parseInt(topic.ID_contenido),
            name: topic.Tema || 'Sin título',
            subjectId: materiaId,
            subjectName: subject.name
        });
    }
    
    // Renderizar los temas seleccionados
    renderSelectedTopics();
    
    // Repoblar el dropdown (sin los ya seleccionados)
    populateStudentTopicsSelect();
    
    // Resetear el dropdown
    topicsSelect.value = '';
}

function renderSelectedTopics() {
    const container = document.getElementById('selectedTopicsContainer');
    if (!container) return;
    
    if (selectedTopicsList.length === 0) {
        container.style.display = 'none';
        return;
    }
    
    container.style.display = 'block';
    container.innerHTML = selectedTopicsList.map((topic, index) => `
        <span class="subject-chip" data-topic-id="${topic.id}">
            ${topic.name} <span style="color: #999; font-size: 0.9em;">(${topic.subjectName})</span>
            <button type="button" class="remove-subject-btn" onclick="removeTopic(${index})" title="Eliminar">
                <i class="fas fa-times"></i>
            </button>
        </span>
    `).join('');
}

function removeTopic(index) {
    selectedTopicsList.splice(index, 1);
    renderSelectedTopics();
    populateStudentTopicsSelect();
}

// Make removeTopic globally accessible
window.removeTopic = removeTopic;

// Lista de temas seleccionados para intensificación
let selectedIntensificacionThemes = [];

// Función para mostrar/ocultar selector de temas según el estado
window.toggleIntensificacionThemes = function() {
    const studentStatus = document.getElementById('studentStatus');
    const themesContainer = document.getElementById('intensificacionThemesContainer');
    
    if (!studentStatus || !themesContainer) return;
    
    if (studentStatus.value === 'INTENSIFICA') {
        themesContainer.style.display = 'block';
        loadIntensificacionThemes();
    } else {
        themesContainer.style.display = 'none';
        selectedIntensificacionThemes = [];
        renderIntensificacionThemes();
    }
};

// Función para cargar los temas disponibles para intensificación
// Solo muestra temas de las materias seleccionadas en el formulario
function loadIntensificacionThemes() {
    const themesList = document.getElementById('intensificacionThemesList');
    if (!themesList) return;
    
    // Asegurar que los datos estén disponibles
    if (!appData.contenido || !Array.isArray(appData.contenido)) {
        appData.contenido = [];
    }
    if (!appData.materia || !Array.isArray(appData.materia)) {
        appData.materia = [];
    }
    
    // Verificar que haya materias seleccionadas
    if (selectedSubjectsList.length === 0) {
        themesList.innerHTML = '<p style="color: #999; padding: 10px; text-align: center;">Primero selecciona las materias del estudiante.</p>';
        return;
    }
    
    // Obtener IDs de las materias seleccionadas
    const selectedSubjectIds = selectedSubjectsList.map(s => parseInt(s.id));
    
    // Renderizar temas agrupados por materia
    let htmlContent = '';
    
    selectedSubjectsList.forEach(subject => {
        const subjectId = parseInt(subject.id);
        const materia = appData.materia.find(m => parseInt(m.ID_materia) === subjectId);
        
        if (!materia) return;
        
        // Obtener temas de esta materia específica
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
            // Mostrar temas existentes con checkboxes
            temasDeMateria.forEach(contenido => {
                const isSelected = selectedIntensificacionThemes.includes(contenido.ID_contenido);
                
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
            // Si no hay temas, mostrar text box para crear uno nuevo
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

// Función para crear un tema nuevo desde el formulario de intensificación
window.createIntensificacionTheme = async function(materiaId) {
    const input = document.getElementById(`newThemeInput_${materiaId}`);
    if (!input) return;
    
    const temaNombre = input.value.trim();
    if (!temaNombre) {
        alert('Por favor ingresa el nombre del tema');
        return;
    }
    
    try {
        // Crear el tema en la BD
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
            // Recargar datos
            if (typeof loadData === 'function') {
                await loadData();
            }
            
            // Recargar la lista de temas
            loadIntensificacionThemes();
            
            // Limpiar el input
            input.value = '';
            
            // Seleccionar automáticamente el tema recién creado
            if (result.id || result.data?.ID_contenido) {
                const nuevoTemaId = result.id || result.data.ID_contenido;
                if (!selectedIntensificacionThemes.includes(nuevoTemaId)) {
                    selectedIntensificacionThemes.push(nuevoTemaId);
                }
                // Recargar para mostrar el checkbox seleccionado
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

// Función para crear tema desde el modal de asignación de temas
window.createIntensificacionThemeFromModal = async function(materiaId, studentId) {
    const input = document.getElementById(`newThemeModalInput_${materiaId}`);
    if (!input) return;
    
    const temaNombre = input.value.trim();
    if (!temaNombre) {
        alert('Por favor ingresa el nombre del tema');
        return;
    }
    
    try {
        // Crear el tema en la BD
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
            // Recargar datos
            if (typeof loadData === 'function') {
                await loadData();
            }
            
            // Recargar el modal con los nuevos temas
            assignThemesToIntensificador(studentId);
            
            // Seleccionar automáticamente el tema recién creado
            if (result.id || result.data?.ID_contenido) {
                const nuevoTemaId = result.id || result.data.ID_contenido;
                if (!selectedIntensificacionThemes.includes(nuevoTemaId)) {
                    selectedIntensificacionThemes.push(nuevoTemaId);
                }
                // Esperar un poco y recargar el modal para mostrar el checkbox seleccionado
                setTimeout(() => {
                    assignThemesToIntensificador(studentId);
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

// Función para toggle de tema individual
window.toggleIntensificacionTheme = function(contenidoId, isChecked) {
    if (isChecked) {
        if (!selectedIntensificacionThemes.includes(contenidoId)) {
            selectedIntensificacionThemes.push(contenidoId);
        }
    } else {
        selectedIntensificacionThemes = selectedIntensificacionThemes.filter(id => id !== contenidoId);
    }
    renderIntensificacionThemes();
};

// Función para renderizar los temas seleccionados (chips)
function renderIntensificacionThemes() {
    // No necesitamos mostrar chips separados, los checkboxes ya muestran el estado
    // Pero podemos agregar un contador si es necesario
}

// Función para asignar temas a un estudiante intensificador
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
    
    // Verificar que es intensificador (INACTIVO en la BD)
    const estado = (student.Estado || '').toUpperCase();
    if (estado !== 'INACTIVO') {
        alert('Esta función solo está disponible para estudiantes intensificadores');
        return;
    }
    
    // Cargar temas disponibles
    if (!appData.contenido || !Array.isArray(appData.contenido)) {
        appData.contenido = [];
    }
    if (!appData.materia || !Array.isArray(appData.materia)) {
        appData.materia = [];
    }
    
    // Obtener las materias en las que el estudiante está inscrito
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
    
    // Obtener temas solo de las materias que el estudiante cursa
    const availableThemes = (appData.contenido || []).filter(c => 
        materiasDelEstudiante.includes(parseInt(c.Materia_ID_materia))
    );
    
    // No retornar aquí - mostrar todas las materias del estudiante, incluso sin temas
    // para permitir crear temas directamente desde el modal
    
    // Obtener temas ya asignados al estudiante
    if (!appData.tema_estudiante || !Array.isArray(appData.tema_estudiante)) {
        appData.tema_estudiante = [];
    }
    
    const assignedThemeIds = appData.tema_estudiante
        .filter(te => parseInt(te.Estudiante_ID_Estudiante) === parseInt(studentId))
        .map(te => parseInt(te.Contenido_ID_contenido));
    
    // Agrupar temas por materia
    const temasPorMateria = {};
    materiasDelEstudiante.forEach(materiaId => {
        const materia = appData.materia.find(m => parseInt(m.ID_materia) === materiaId);
        if (materia) {
            const temas = availableThemes.filter(c => parseInt(c.Materia_ID_materia) === materiaId);
            if (temas.length > 0 || true) { // Mostrar todas las materias, incluso sin temas
                temasPorMateria[materiaId] = {
                    materia: materia,
                    temas: temas
                };
            }
        }
    });
    
    // Crear modal para seleccionar temas, agrupados por materia
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
                        // Si la materia no tiene temas, mostrar text box para crear uno
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
    
    // Crear o actualizar modal
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
            
            await saveThemesAssignment(studentId, selectedThemeIds);
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

// Función para guardar las asignaciones de temas
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

// Función para crear tema_estudiante records para todos los contenidos de las materias seleccionadas
async function createTemaEstudianteForSubjects(studentId, subjectIds) {
    try {
        // Asegurar que appData.contenido esté disponible
        if (!appData.contenido || !Array.isArray(appData.contenido)) {
            console.warn('appData.contenido no disponible, recargando datos...');
            if (typeof loadData === 'function') {
                await loadData();
            }
            // Si aún no está disponible después de recargar, retornar
            if (!appData.contenido || !Array.isArray(appData.contenido)) {
                console.error('No se pudieron cargar los contenidos');
                return;
            }
        }
        
        // Obtener todos los contenidos (temas) de las materias seleccionadas
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
        
        // Crear tema_estudiante para cada contenido
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
                    // Si ya existe (409), contar como éxito ya que el registro ya está creado
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

// Función actualizada para GUARDAR/CREAR estudiante
async function saveStudent() {
    const studentStatus = document.getElementById('studentStatus');
    const estadoSeleccionado = studentStatus ? studentStatus.value : 'ACTIVO';
    
    // Ahora el backend maneja INTENSIFICA directamente usando la columna INTENSIFICA
    const formData = {
        Nombre: document.getElementById('studentFirstName').value,
        Apellido: document.getElementById('studentLastName').value,
        Email: document.getElementById('studentEmail').value || null,
        Fecha_nacimiento: null, // Fecha de nacimiento no se captura en el formulario
        Estado: estadoSeleccionado  // Enviar 'INTENSIFICA', 'ACTIVO' o 'INACTIVO' directamente
    };

    // Validación
    if (!formData.Nombre || !formData.Apellido) {
        alert('El nombre y apellido son obligatorios.');
        return;
    }
    try {
        let response;
        let url = '../api/estudiantes.php';  
        let method = 'POST';
        let body = JSON.stringify(formData);

        // Si estamos editando, usar PUT
        if (editingStudentId) {
            url = `${url}?id=${editingStudentId}`; // Usar query string para compatibilidad con diferentes estructuras de URL
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
            // Obtener el ID del estudiante (diferentes formas según la respuesta)
            let studentId = editingStudentId;
            if (!studentId) {
                // El endpoint devuelve { success: true, data: { ID_Estudiante: ... } }
                if (result.data && result.data.ID_Estudiante) {
                    studentId = result.data.ID_Estudiante;
                } else if (result.ID_Estudiante) {
                    studentId = result.ID_Estudiante;
                } else if (result.id) {
                    studentId = result.id;
                }
            }
            
            
            // Guardar relaciones alumno-materia si hay materias seleccionadas
            // Y guardar temas de intensificación si es intensificador
            if (!studentId) {
                alert('Estudiante guardado pero no se pudieron guardar las materias. ID no disponible.');
                console.error('Student ID not available:', result);
            } else {
                const selectedSubjects = selectedSubjectsList.map(s => s.id);
                
                console.log('Saving student enrollments:', {
                    studentId: studentId,
                    selectedSubjects: selectedSubjects,
                    selectedSubjectsList: selectedSubjectsList
                });
                
                // Guardar temas de intensificación si es INTENSIFICA
                if (estadoSeleccionado === 'INTENSIFICA' && selectedIntensificacionThemes.length > 0) {
                    try {
                        await saveThemesAssignment(studentId, selectedIntensificacionThemes);
                        // Limpiar después de guardar
                        selectedIntensificacionThemes = [];
                    } catch (err) {
                        console.error('Error guardando temas de intensificación:', err);
                        alert('Estudiante guardado pero hubo un error al asignar los temas de intensificación.');
                    }
                }
                
                // Guardar temas manualmente seleccionados (guardar flag antes de limpiar)
                const hasManualTopics = selectedTopicsList.length > 0;
                if (hasManualTopics) {
                    try {
                        const selectedTopicIds = selectedTopicsList.map(t => t.id);
                        await saveThemesAssignment(studentId, selectedTopicIds);
                        console.log('Temas manualmente seleccionados guardados:', selectedTopicIds);
                    } catch (err) {
                        console.error('Error guardando temas seleccionados:', err);
                        alert('Estudiante guardado pero hubo un error al asignar los temas seleccionados.');
                    }
                }
                
                if (selectedSubjects.length > 0) {
                    try {
                        // Si estamos editando, primero eliminar las relaciones existentes
                        if (editingStudentId) {
                            const deleteResponse = await fetch(`../api/alumnos_x_materia.php?estudianteId=${studentId}`, {
                                method: 'DELETE',
                                headers: { 'Content-Type': 'application/json' }
                            });
                            const deleteResult = await deleteResponse.json().catch(() => ({}));
                            console.log('Deleted existing enrollments:', deleteResult);
                        }
                        
                        // Crear nuevas relaciones
                        const relations = selectedSubjects.map(materiaId => ({
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
                            
                            // Crear tema_estudiante records para todos los contenidos de las materias seleccionadas
                            // Solo si no se han seleccionado temas manualmente (para evitar duplicados)
                            if (!hasManualTopics) {
                                try {
                                    await createTemaEstudianteForSubjects(studentId, selectedSubjects);
                                } catch (err) {
                                    console.error('Error creando tema_estudiante records:', err);
                                    // No mostrar alerta al usuario, solo loguear el error
                                    // Los tema_estudiante se pueden crear manualmente después si es necesario
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
            
            // Limpiar listas después de guardar exitosamente
            selectedTopicsList = [];
            selectedIntensificacionThemes = [];
            
            // Actualizar datos locales recargando desde el servidor
            await loadData();
            
            // Cerrar modal y limpiar
            closeModal('studentModal');
            clearStudentForm();
            editingStudentId = null;
            
            // Recargar vistas con un pequeño delay para asegurar que los datos estén actualizados
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
            }, 100);
            
            // Mostrar notificación
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

// Función actualizada para EDITAR estudiante
// Hacer la función globalmente accesible
window.editStudent = function(id) {
    // Convertir ID a número para comparación consistente
    const studentId = parseInt(id);
    
    if (!id || isNaN(studentId)) {
        console.error('editStudent: ID no válido', id);
        alert('Error: ID de estudiante no válido');
        return;
    }

    // Buscar estudiante - manejar tanto string como número
    const student = appData.estudiante.find(s => 
        parseInt(s.ID_Estudiante) === studentId
    );
    
    if (!student) {
        console.error('editStudent: Estudiante no encontrado', studentId, appData.estudiante);
        alert('Estudiante no encontrado');
        return;
    }

    // Guardar ID para el modo edición
    editingStudentId = studentId;

    // Llenar formulario con datos del estudiante
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
    
    // Establecer estado basado en la columna INTENSIFICA de la BD
    const studentStatus = document.getElementById('studentStatus');
    if (studentStatus) {
        // Usar la columna INTENSIFICA para determinar el estado a mostrar
        const esIntensifica = student.INTENSIFICA === true || student.INTENSIFICA === 1 || student.INTENSIFICA === '1';
        
        if (esIntensifica) {
            studentStatus.value = 'INTENSIFICA';
            // Mostrar selector de temas y cargar temas asignados
            const themesContainer = document.getElementById('intensificacionThemesContainer');
            if (themesContainer) {
                themesContainer.style.display = 'block';
                // Cargar temas ya asignados al estudiante
                selectedIntensificacionThemes = appData.tema_estudiante && Array.isArray(appData.tema_estudiante)
                    ? appData.tema_estudiante
                        .filter(te => parseInt(te.Estudiante_ID_Estudiante) === studentId)
                        .map(te => parseInt(te.Contenido_ID_contenido))
                    : [];
                if (typeof loadIntensificacionThemes === 'function') {
                    loadIntensificacionThemes();
                }
            }
        } else {
            // ACTIVO o INACTIVO (no intensificador)
            const estado = (student.Estado || '').toUpperCase();
            studentStatus.value = estado === 'ACTIVO' ? 'ACTIVO' : 'INACTIVO';
            // Ocultar selector de temas
            const themesContainer = document.getElementById('intensificacionThemesContainer');
            if (themesContainer) {
                themesContainer.style.display = 'none';
            }
            selectedIntensificacionThemes = [];
        }
    }
    
    // Limpiar y poblar materias seleccionadas
    selectedSubjectsList = [];
    
    // Obtener materias del estudiante
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
    
    selectedSubjectsList = studentSubjects;
    
    // Renderizar materias seleccionadas
    if (typeof renderSelectedSubjects === 'function') {
        renderSelectedSubjects();
    }
    
    // Poblar el dropdown con las materias disponibles
    populateStudentSubjectsSelect();
    
    // Cargar temas ya asignados al estudiante
    selectedTopicsList = [];
    if (appData.tema_estudiante && Array.isArray(appData.tema_estudiante)) {
        const assignedTopics = appData.tema_estudiante
            .filter(te => parseInt(te.Estudiante_ID_Estudiante) === studentId)
            .map(te => {
                const contenido = appData.contenido.find(c => parseInt(c.ID_contenido) === parseInt(te.Contenido_ID_contenido));
                if (contenido) {
                    const materiaId = parseInt(contenido.Materia_ID_materia);
                    const subject = selectedSubjectsList.find(s => parseInt(s.id) === materiaId);
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
        
        selectedTopicsList = assignedTopics;
    }
    
    // Renderizar temas seleccionados
    renderSelectedTopics();
    
    // Poblar el selector de temas
    populateStudentTopicsSelect();

    // Usar setTimeout para asegurar que el modal se abra correctamente
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
}

// Función actualizada para ELIMINAR estudiante
// Hacer la función globalmente accesible
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

        // Verificar si la respuesta es JSON
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
            // Actualizar datos locales
            if (typeof loadData === 'function') {
                await loadData();
            }
            
            // Recargar vista
            if (typeof loadStudents === 'function') {
                loadStudents();
            }
            if (typeof loadUnifiedStudentData === 'function') {
                loadUnifiedStudentData();
            }
            if (typeof updateDashboard === 'function') {
                updateDashboard();
            }
            
            // Mostrar notificación
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

function clearStudentForm() {
    document.getElementById('studentForm').reset();
    editingStudentId = null;
    selectedSubjectsList = [];
    selectedIntensificacionThemes = [];
    selectedTopicsList = [];
    renderSelectedSubjects();
    renderSelectedTopics();
    
    // Reset the event listener flags
    const subjectsSelect = document.getElementById('studentSubjects');
    if (subjectsSelect) {
        subjectsSelect._hasSubjectListener = false;
    }
    
    const topicsSelect = document.getElementById('studentTopics');
    if (topicsSelect) {
        topicsSelect._hasTopicListener = false;
    }
    
    populateStudentSubjectsSelect(); // Repoblar las materias
    populateStudentTopicsSelect(); // Repoblar los temas
    
    // Ocultar selector de temas de intensificación
    const themesContainer = document.getElementById('intensificacionThemesContainer');
    if (themesContainer) {
        themesContainer.style.display = 'none';
    }
}

// Variable para trackear si los handlers ya fueron configurados
let noSubjectsModalHandlersSetup = false;

// Función para mostrar el modal de advertencia de "no subjects"
function showNoSubjectsModal() {
    // Intentar encontrar el modal, con reintentos si no está disponible inmediatamente
    let modal = document.getElementById('noSubjectsModal');
    
    if (!modal) {
        // Esperar un poco y reintentar (puede ser un problema de timing de carga del DOM)
        setTimeout(() => {
            modal = document.getElementById('noSubjectsModal');
            if (modal) {
                showNoSubjectsModalInternal(modal);
            } else {
                // Solo como último recurso, usar alert si después de esperar tampoco existe
                alert('No tienes materias creadas todavía. Por favor, crea una materia primero desde la sección de "Gestión de Materias" antes de agregar estudiantes.');
            }
        }, 100);
        return;
    }
    
    showNoSubjectsModalInternal(modal);
}

function showNoSubjectsModalInternal(modal) {
    // Configurar handlers solo la primera vez
    if (!noSubjectsModalHandlersSetup) {
        setupNoSubjectsModalHandlers();
        noSubjectsModalHandlersSetup = true;
    }
    
    // Mostrar el modal
    if (typeof showModal === 'function') {
        showModal('noSubjectsModal');
    } else {
        modal.classList.add('active');
    }
}

// Configurar handlers del modal de "no subjects"
function setupNoSubjectsModalHandlers() {
    const modal = document.getElementById('noSubjectsModal');
    if (!modal) return;
    
    // Usar la función setupModalHandlers para los botones de cerrar
    if (typeof setupModalHandlers === 'function') {
        setupModalHandlers('noSubjectsModal');
    }
    
    // Handler personalizado para el botón de ir a materias
    const goToSubjectsBtn = document.getElementById('goToSubjectsBtn');
    if (goToSubjectsBtn) {
        goToSubjectsBtn.addEventListener('click', () => {
            // Cerrar el modal
            closeModal('noSubjectsModal');
            
            // Navegar a la sección de materias
            if (typeof showSection === 'function') {
                showSection('subjects-management');
            } else {
                // Fallback: intentar cambiar la sección manualmente
                const subjectsSection = document.querySelector('a[data-section="subjects-management"]');
                if (subjectsSection) {
                    subjectsSection.click();
                }
            }
        });
    }
}


// Guardar referencia a la función showModal original antes de sobrescribirla
const originalShowModal = typeof window.showModal === 'function' ? window.showModal : null;
window.showModal = function(modalId) {
    if (modalId === 'studentModal') {
        // Verificar si el usuario tiene materias antes de abrir el modal
        // El API ya filtra las materias por el docente logueado, así que solo verificamos si hay materias activas
        // Estado puede ser 'ACTIVA', 'INACTIVA', 'FINALIZADA', o null/undefined (en cuyo caso asumimos activa por defecto)
        const teacherSubjects = (appData.materia || []).filter(m => 
            !m.Estado || m.Estado === 'ACTIVA'
        );
        
        if (teacherSubjects.length === 0) {
            // Mostrar modal de advertencia en lugar de alert
            showNoSubjectsModal();
            return; // No abrir el modal de estudiante
        }
    }
    
    // Llamar a la función original si existe
    if (originalShowModal && typeof originalShowModal === 'function') {
        originalShowModal(modalId);
    } else {
        // Fallback si no existe la función original
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('active');
        }
    }
    
    if (modalId === 'studentModal') {
        // Poblar materias cuando se abre el modal
        populateStudentSubjectsSelect();
        // Poblar temas cuando se abre el modal
        populateStudentTopicsSelect();
        
        setTimeout(() => {
            const submitBtn = document.querySelector('#studentForm button[type="submit"]');
            if (submitBtn) {
                submitBtn.onclick = function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    saveStudent();
                    return false;
                };
            }
        }, 100);
    }
};