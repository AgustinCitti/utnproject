/**
 * Student Management State Module
 * 
 * Manages global state for student management operations including:
 * - Currently editing student ID
 * - Selected subjects list
 * - Selected topics list
 * - Selected intensification themes
 */

// Current student being edited
let editingStudentId = null;

// List of selected subjects for the student
let selectedSubjectsList = [];

// List of selected topics to assign to the student
let selectedTopicsList = [];

// List of selected intensification themes
let selectedIntensificacionThemes = [];

/**
 * Get the current editing student ID
 * @returns {number|null} The student ID being edited, or null if not editing
 */
function getEditingStudentId() {
    return editingStudentId;
}

/**
 * Set the current editing student ID
 * @param {number|null} id - The student ID to set, or null to clear
 */
function setEditingStudentId(id) {
    editingStudentId = id;
}

/**
 * Get the list of selected subjects
 * @returns {Array} Array of selected subject objects
 */
function getSelectedSubjects() {
    return selectedSubjectsList;
}

/**
 * Set the list of selected subjects
 * @param {Array} subjects - Array of subject objects
 */
function setSelectedSubjects(subjects) {
    selectedSubjectsList = Array.isArray(subjects) ? subjects : [];
}

/**
 * Add a subject to the selected list
 * @param {Object} subject - Subject object with id, name, and curso properties
 */
function addSelectedSubject(subject) {
    if (!selectedSubjectsList.some(s => parseInt(s.id) === parseInt(subject.id))) {
        selectedSubjectsList.push(subject);
    }
}

/**
 * Remove a subject from the selected list by index
 * @param {number} index - Index of the subject to remove
 */
function removeSelectedSubject(index) {
    if (index >= 0 && index < selectedSubjectsList.length) {
        selectedSubjectsList.splice(index, 1);
    }
}

/**
 * Clear all selected subjects
 */
function clearSelectedSubjects() {
    selectedSubjectsList = [];
}

/**
 * Get the list of selected topics
 * @returns {Array} Array of selected topic objects
 */
function getSelectedTopics() {
    return selectedTopicsList;
}

/**
 * Set the list of selected topics
 * @param {Array} topics - Array of topic objects
 */
function setSelectedTopics(topics) {
    selectedTopicsList = Array.isArray(topics) ? topics : [];
}

/**
 * Add a topic to the selected list
 * @param {Object} topic - Topic object with id, name, subjectId, and subjectName properties
 */
function addSelectedTopic(topic) {
    if (!selectedTopicsList.some(t => parseInt(t.id) === parseInt(topic.id))) {
        selectedTopicsList.push(topic);
    }
}

/**
 * Remove a topic from the selected list by index
 * @param {number} index - Index of the topic to remove
 */
function removeSelectedTopic(index) {
    if (index >= 0 && index < selectedTopicsList.length) {
        selectedTopicsList.splice(index, 1);
    }
}

/**
 * Clear all selected topics
 */
function clearSelectedTopics() {
    selectedTopicsList = [];
}

/**
 * Get the list of selected intensification themes
 * @returns {Array} Array of selected theme IDs
 */
function getSelectedIntensificacionThemes() {
    return selectedIntensificacionThemes;
}

/**
 * Set the list of selected intensification themes
 * @param {Array} themes - Array of theme IDs
 */
function setSelectedIntensificacionThemes(themes) {
    selectedIntensificacionThemes = Array.isArray(themes) ? themes : [];
}

/**
 * Add a theme to the selected intensification themes
 * @param {number} themeId - The theme ID to add
 */
function addSelectedIntensificacionTheme(themeId) {
    if (!selectedIntensificacionThemes.includes(themeId)) {
        selectedIntensificacionThemes.push(themeId);
    }
}

/**
 * Remove a theme from the selected intensification themes
 * @param {number} themeId - The theme ID to remove
 */
function removeSelectedIntensificacionTheme(themeId) {
    selectedIntensificacionThemes = selectedIntensificacionThemes.filter(id => id !== themeId);
}

/**
 * Clear all selected intensification themes
 */
function clearSelectedIntensificacionThemes() {
    selectedIntensificacionThemes = [];
}

/**
 * Clear all student-related state
 */
function clearAllStudentState() {
    editingStudentId = null;
    selectedSubjectsList = [];
    selectedTopicsList = [];
    selectedIntensificacionThemes = [];
}

// Make all functions globally accessible for backward compatibility
// These are also available through window.StudentState namespace
window.getEditingStudentId = getEditingStudentId;
window.setEditingStudentId = setEditingStudentId;
window.getSelectedSubjects = getSelectedSubjects;
window.setSelectedSubjects = setSelectedSubjects;
window.addSelectedSubject = addSelectedSubject;
window.removeSelectedSubject = removeSelectedSubject;
window.clearSelectedSubjects = clearSelectedSubjects;
window.getSelectedTopics = getSelectedTopics;
window.setSelectedTopics = setSelectedTopics;
window.addSelectedTopic = addSelectedTopic;
window.removeSelectedTopic = removeSelectedTopic;
window.clearSelectedTopics = clearSelectedTopics;
window.getSelectedIntensificacionThemes = getSelectedIntensificacionThemes;
window.setSelectedIntensificacionThemes = setSelectedIntensificacionThemes;
window.addSelectedIntensificacionTheme = addSelectedIntensificacionTheme;
window.removeSelectedIntensificacionTheme = removeSelectedIntensificacionTheme;
window.clearSelectedIntensificacionThemes = clearSelectedIntensificacionThemes;
window.clearAllStudentState = clearAllStudentState;

