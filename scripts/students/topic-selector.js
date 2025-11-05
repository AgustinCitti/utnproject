/**
 * Topic Selector Module
 * 
 * Handles topic selection based on selected subjects, rendering of selected topics,
 * and managing topic-student relationships.
 */

/**
 * Populate the topic select dropdown with topics from selected subjects
 */
function populateStudentTopicsSelect() {
    const topicsSelect = document.getElementById('studentTopics');
    if (!topicsSelect) return;
    
    // Clear current options
    topicsSelect.innerHTML = '<option value="" data-translate="select_topic">- Seleccionar Tema -</option>';
    
    // Get selected subjects
    const selectedSubjects = typeof getSelectedSubjects === 'function' ? getSelectedSubjects() : [];
    
    // If no subjects selected, show message
    if (selectedSubjects.length === 0) {
        const option = document.createElement('option');
        option.value = '';
        option.textContent = 'Primero selecciona materias';
        option.disabled = true;
        topicsSelect.appendChild(option);
        return;
    }
    
    // Ensure appData.contenido is available
    if (!appData.contenido || !Array.isArray(appData.contenido)) {
        const option = document.createElement('option');
        option.value = '';
        option.textContent = 'Cargando temas...';
        option.disabled = true;
        topicsSelect.appendChild(option);
        return;
    }
    
    // Get IDs of selected subjects
    const selectedSubjectIds = selectedSubjects.map(s => parseInt(s.id));
    
    // Get already selected topics (to exclude from dropdown)
    const selectedTopics = typeof getSelectedTopics === 'function' ? getSelectedTopics() : [];
    const selectedTopicIds = selectedTopics.map(t => t.id);
    
    // Get all topics from selected subjects
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
    
    // Group topics by subject for better organization
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
    
    // Add grouped options by subject
    selectedSubjects.forEach(subject => {
        const subjectId = parseInt(subject.id);
        const subjectData = topicsBySubject[subjectId];
        
        if (subjectData && subjectData.topics.length > 0) {
            // Add an optgroup for this subject
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
    
    // Add event listener for topic selection (only once)
    if (!topicsSelect._hasTopicListener) {
        topicsSelect.addEventListener('change', handleTopicSelection);
        topicsSelect._hasTopicListener = true;
    }
}

/**
 * Handle topic selection from dropdown
 */
function handleTopicSelection() {
    const topicsSelect = document.getElementById('studentTopics');
    const selectedValue = topicsSelect.value;
    
    if (!selectedValue) {
        return;
    }
    
    // Find the selected topic
    const topic = appData.contenido.find(c => parseInt(c.ID_contenido) === parseInt(selectedValue));
    if (!topic) {
        console.error('Topic not found for ID:', selectedValue);
        return;
    }
    
    // Find the subject of the topic
    const materiaId = parseInt(topic.Materia_ID_materia);
    const selectedSubjects = typeof getSelectedSubjects === 'function' ? getSelectedSubjects() : [];
    const subject = selectedSubjects.find(s => parseInt(s.id) === materiaId);
    
    if (!subject) {
        console.error('Subject not found for topic:', topic);
        return;
    }
    
    // Add to selected list if not already present
    if (typeof addSelectedTopic === 'function') {
        addSelectedTopic({
            id: parseInt(topic.ID_contenido),
            name: topic.Tema || 'Sin título',
            subjectId: materiaId,
            subjectName: subject.name
        });
    }
    
    // Render selected topics
    renderSelectedTopics();
    
    // Repopulate dropdown (without already selected topics)
    populateStudentTopicsSelect();
    
    // Reset dropdown
    topicsSelect.value = '';
}

/**
 * Render selected topics as chips with remove buttons
 */
function renderSelectedTopics() {
    const container = document.getElementById('selectedTopicsContainer');
    if (!container) return;
    
    const selectedTopics = typeof getSelectedTopics === 'function' ? getSelectedTopics() : [];
    
    if (selectedTopics.length === 0) {
        container.style.display = 'none';
        return;
    }
    
    container.style.display = 'block';
    container.innerHTML = selectedTopics.map((topic, index) => `
        <span class="subject-chip" data-topic-id="${topic.id}">
            ${topic.name} <span style="color: #999; font-size: 0.9em;">(${topic.subjectName})</span>
            <button type="button" class="remove-subject-btn" onclick="removeTopic(${index})" title="Eliminar">
                <i class="fas fa-times"></i>
            </button>
        </span>
    `).join('');
}

/**
 * Remove a topic from the selected list
 * Made globally accessible for onclick handlers
 */
window.removeTopic = function(index) {
    if (typeof removeSelectedTopic === 'function') {
        removeSelectedTopic(index);
    }
    
    renderSelectedTopics();
    populateStudentTopicsSelect();
};

