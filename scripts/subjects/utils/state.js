/**
 * State Management Module
 * 
 * Manages global state for the subjects module including:
 * - Current subject ID being edited
 * - Submission flags to prevent double submissions
 * - Initialization flags
 * - Current themes subject ID
 */

// Create namespace if it doesn't exist
if (typeof SubjectsModule === 'undefined') {
    window.SubjectsModule = {};
}

// Global state variables (private to this module)
let currentSubjectId = null;
let isSubmitting = false; // Flag to prevent double submit
let subjectsInitialized = false; // Flag to prevent multiple initializations
let subjectFormHandler = null; // Reference to form handler
let currentThemesSubjectId = null; // Store current subject ID for themes modal

/**
 * State Management API
 */
SubjectsModule.State = {
    /**
     * Get the current subject ID being edited
     * @returns {number|null} Current subject ID or null
     */
    getCurrentSubjectId: function() {
        return currentSubjectId;
    },

    /**
     * Set the current subject ID being edited
     * @param {number|null} id - Subject ID to set
     */
    setCurrentSubjectId: function(id) {
        currentSubjectId = id;
    },

    /**
     * Check if a form is currently being submitted
     * @returns {boolean} True if submitting, false otherwise
     */
    getIsSubmitting: function() {
        return isSubmitting;
    },

    /**
     * Set the submission flag
     * @param {boolean} value - Submission state
     */
    setIsSubmitting: function(value) {
        isSubmitting = value;
    },

    /**
     * Check if subjects module has been initialized
     * @returns {boolean} True if initialized, false otherwise
     */
    getSubjectsInitialized: function() {
        return subjectsInitialized;
    },

    /**
     * Set the initialization flag
     * @param {boolean} value - Initialization state
     */
    setSubjectsInitialized: function(value) {
        subjectsInitialized = value;
    },

    /**
     * Get the current form handler reference
     * @returns {Function|null} Form handler function or null
     */
    getSubjectFormHandler: function() {
        return subjectFormHandler;
    },

    /**
     * Set the form handler reference
     * @param {Function|null} handler - Form handler function
     */
    setSubjectFormHandler: function(handler) {
        subjectFormHandler = handler;
    },

    /**
     * Get the current themes subject ID
     * @returns {number|null} Current themes subject ID or null
     */
    getCurrentThemesSubjectId: function() {
        return currentThemesSubjectId;
    },

    /**
     * Set the current themes subject ID
     * @param {number|null} id - Subject ID for themes modal
     */
    setCurrentThemesSubjectId: function(id) {
        currentThemesSubjectId = id;
        // Make it globally accessible for student creation callback
        window.currentThemesSubjectId = id;
    }
};

