/**
 * Student Form Management Module
 * 
 * Handles form clearing, resetting, and initialization for student forms.
 */

/**
 * Clear the student form and reset all state
 */
function clearStudentForm() {
    const form = document.getElementById('studentForm');
    if (form) {
        form.reset();
    }
    
    if (typeof setEditingStudentId === 'function') {
        setEditingStudentId(null);
    }
    if (typeof clearSelectedSubjects === 'function') {
        clearSelectedSubjects();
    }
    if (typeof clearSelectedTopics === 'function') {
        clearSelectedTopics();
    }
    if (typeof clearSelectedIntensificacionThemes === 'function') {
        clearSelectedIntensificacionThemes();
    }
    
    // Render cleared selections
    if (typeof renderSelectedSubjects === 'function') {
        renderSelectedSubjects();
    }
    if (typeof renderSelectedTopics === 'function') {
        renderSelectedTopics();
    }
    
    // Reset event listener flags
    const subjectsSelect = document.getElementById('studentSubjects');
    if (subjectsSelect) {
        subjectsSelect._hasSubjectListener = false;
    }
    
    const topicsSelect = document.getElementById('studentTopics');
    if (topicsSelect) {
        topicsSelect._hasTopicListener = false;
    }
    
    // Repopulate dropdowns
    if (typeof populateStudentSubjectsSelect === 'function') {
        populateStudentSubjectsSelect();
    }
    if (typeof populateStudentTopicsSelect === 'function') {
        populateStudentTopicsSelect();
    }
    
    // Hide intensification themes selector
    const themesContainer = document.getElementById('intensificacionThemesContainer');
    if (themesContainer) {
        themesContainer.style.display = 'none';
    }
}

