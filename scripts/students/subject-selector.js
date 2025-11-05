/**
 * Subject Selector Module
 * 
 * Handles subject selection, rendering of selected subjects as chips,
 * and integration with course and topic selection.
 */

/**
 * Populate the subject select dropdown with available subjects from the current teacher
 */
function populateStudentSubjectsSelect() {
    const subjectsSelect = document.getElementById('studentSubjects');
    if (!subjectsSelect) return;
    
    // Get already selected subjects (to exclude from dropdown)
    const selectedSubjects = typeof getSelectedSubjects === 'function' ? getSelectedSubjects() : [];
    const selectedSubjectIds = selectedSubjects.map(s => s.id);
    
    // Clear current options except the first one
    subjectsSelect.innerHTML = '<option value="" data-translate="select_subject">- Seleccionar Materia -</option>';
    
    // Filter subjects: only active subjects not already selected
    const teacherSubjects = (appData.materia || []).filter(m => 
        (!m.Estado || m.Estado === 'ACTIVA') && !selectedSubjectIds.includes(m.ID_materia)
    );
    
    if (teacherSubjects.length === 0 && selectedSubjects.length === 0) {
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
    
    // Add event listener for subject selection (only once)
    if (!subjectsSelect._hasSubjectListener) {
        subjectsSelect.addEventListener('change', handleSubjectSelection);
        subjectsSelect._hasSubjectListener = true;
    }
}

/**
 * Handle subject selection from dropdown
 */
function handleSubjectSelection() {
    const subjectsSelect = document.getElementById('studentSubjects');
    const selectedValue = subjectsSelect.value;
    
    if (!selectedValue) {
        return;
    }
    
    // Find the selected subject
    const subject = appData.materia.find(m => parseInt(m.ID_materia) === parseInt(selectedValue));
    if (!subject) {
        console.error('Subject not found for ID:', selectedValue);
        return;
    }
    
    // Add to selected list if not already present
    if (typeof addSelectedSubject === 'function') {
        addSelectedSubject({
            id: parseInt(subject.ID_materia),
            name: subject.Nombre,
            curso: subject.Curso_division
        });
    }
    
    // Render selected subjects
    renderSelectedSubjects();
    
    // Repopulate dropdown (without already selected subjects)
    populateStudentSubjectsSelect();
    
    // Reset dropdown
    subjectsSelect.value = '';
    
    // Reload topic selector since subjects changed
    if (typeof populateStudentTopicsSelect === 'function') {
        populateStudentTopicsSelect();
    }
    
    // If intensification themes selector is active, reload themes
    const studentStatus = document.getElementById('studentStatus');
    const themesContainer = document.getElementById('intensificacionThemesContainer');
    if (studentStatus && themesContainer && 
        studentStatus.value === 'INTENSIFICA' && 
        themesContainer.style.display !== 'none') {
        if (typeof loadIntensificacionThemes === 'function') {
            loadIntensificacionThemes();
        }
    }
}

/**
 * Render selected subjects as chips with remove buttons
 */
function renderSelectedSubjects() {
    const container = document.getElementById('selectedSubjectsContainer');
    if (!container) return;
    
    const selectedSubjects = typeof getSelectedSubjects === 'function' ? getSelectedSubjects() : [];
    
    if (selectedSubjects.length === 0) {
        container.style.display = 'none';
        return;
    }
    
    container.style.display = 'block';
    container.innerHTML = selectedSubjects.map((subject, index) => `
        <span class="subject-chip" data-subject-id="${subject.id}">
            ${subject.name} - ${subject.curso}
            <button type="button" class="remove-subject-btn" onclick="removeSubject(${index})" title="Eliminar">
                <i class="fas fa-times"></i>
            </button>
        </span>
    `).join('');
}

/**
 * Remove a subject from the selected list
 * Made globally accessible for onclick handlers
 */
window.removeSubject = function(index) {
    if (typeof removeSelectedSubject === 'function') {
        removeSelectedSubject(index);
    }
    
    renderSelectedSubjects();
    populateStudentSubjectsSelect();
    
    // Reload topic selector since subjects changed
    if (typeof populateStudentTopicsSelect === 'function') {
        populateStudentTopicsSelect();
    }
    
    // Remove topics that belong to the removed subject
    const selectedSubjects = typeof getSelectedSubjects === 'function' ? getSelectedSubjects() : [];
    if (selectedSubjects.length > 0) {
        const remainingSubjectIds = selectedSubjects.map(s => parseInt(s.id));
        const selectedTopics = typeof getSelectedTopics === 'function' ? getSelectedTopics() : [];
        const filteredTopics = selectedTopics.filter(topic => {
            const topicSubjectId = parseInt(topic.subjectId);
            return remainingSubjectIds.includes(topicSubjectId);
        });
        
        if (typeof setSelectedTopics === 'function') {
            setSelectedTopics(filteredTopics);
        }
        
        if (typeof renderSelectedTopics === 'function') {
            renderSelectedTopics();
        }
    } else {
        if (typeof setSelectedTopics === 'function') {
            setSelectedTopics([]);
        }
        if (typeof renderSelectedTopics === 'function') {
            renderSelectedTopics();
        }
    }
};

/**
 * Pre-select a subject when creating a student from subject details
 * Made globally accessible for cross-module calls
 */
window.preSelectMateriaForNewStudent = function(materiaId) {
    if (!materiaId || !appData || !appData.materia) return;
    
    const materia = appData.materia.find(m => parseInt(m.ID_materia) === parseInt(materiaId));
    if (!materia) return;
    
    // Clear existing selections first
    if (typeof clearSelectedSubjects === 'function') {
        clearSelectedSubjects();
    }
    
    // Add the materia to selected list
    const newSubject = {
        id: parseInt(materia.ID_materia),
        name: materia.Nombre,
        curso: materia.Curso_division || ''
    };
    
    if (typeof setSelectedSubjects === 'function') {
        setSelectedSubjects([newSubject]);
    }
    
    // Render selected subjects
    renderSelectedSubjects();
    
    // If the materia has a curso_division, set it in the course select
    if (materia.Curso_division) {
        const courseSelect = document.getElementById('studentCourse');
        if (courseSelect) {
            courseSelect.value = materia.Curso_division;
        }
    }
    
    // Repopulate the subjects select to remove the selected one
    populateStudentSubjectsSelect();
    
    // Repopulate topics for the selected materia
    if (typeof populateStudentTopicsSelect === 'function') {
        populateStudentTopicsSelect();
    }
};

