/**
 * Student Management Module - Main Entry Point
 * 
 * This module initializes and coordinates all student management sub-modules.
 * It sets up the global StudentState object and ensures all components are properly initialized.
 */

// Initialize StudentState namespace
window.StudentState = {
    // State getters
    getEditingStudentId: () => {
        // Imported from state.js
        return typeof getEditingStudentId === 'function' ? getEditingStudentId() : null;
    },
    getSelectedSubjects: () => {
        return typeof getSelectedSubjects === 'function' ? getSelectedSubjects() : [];
    },
    getSelectedTopics: () => {
        return typeof getSelectedTopics === 'function' ? getSelectedTopics() : [];
    },
    getSelectedIntensificacionThemes: () => {
        return typeof getSelectedIntensificacionThemes === 'function' ? getSelectedIntensificacionThemes() : [];
    },
    
    // State setters
    setEditingStudentId: (id) => {
        if (typeof setEditingStudentId === 'function') {
            setEditingStudentId(id);
        }
    },
    setSelectedSubjects: (subjects) => {
        if (typeof setSelectedSubjects === 'function') {
            setSelectedSubjects(subjects);
        }
    },
    setSelectedTopics: (topics) => {
        if (typeof setSelectedTopics === 'function') {
            setSelectedTopics(topics);
        }
    },
    setSelectedIntensificacionThemes: (themes) => {
        if (typeof setSelectedIntensificacionThemes === 'function') {
            setSelectedIntensificacionThemes(themes);
        }
    },
    
    // State modifiers
    addSelectedSubject: (subject) => {
        if (typeof addSelectedSubject === 'function') {
            addSelectedSubject(subject);
        }
    },
    removeSelectedSubject: (index) => {
        if (typeof removeSelectedSubject === 'function') {
            removeSelectedSubject(index);
        }
    },
    clearSelectedSubjects: () => {
        if (typeof clearSelectedSubjects === 'function') {
            clearSelectedSubjects();
        }
    },
    
    addSelectedTopic: (topic) => {
        if (typeof addSelectedTopic === 'function') {
            addSelectedTopic(topic);
        }
    },
    removeSelectedTopic: (index) => {
        if (typeof removeSelectedTopic === 'function') {
            removeSelectedTopic(index);
        }
    },
    clearSelectedTopics: () => {
        if (typeof clearSelectedTopics === 'function') {
            clearSelectedTopics();
        }
    },
    
    addSelectedIntensificacionTheme: (themeId) => {
        if (typeof addSelectedIntensificacionTheme === 'function') {
            addSelectedIntensificacionTheme(themeId);
        }
    },
    removeSelectedIntensificacionTheme: (themeId) => {
        if (typeof removeSelectedIntensificacionTheme === 'function') {
            removeSelectedIntensificacionTheme(themeId);
        }
    },
    clearSelectedIntensificacionThemes: () => {
        if (typeof clearSelectedIntensificacionThemes === 'function') {
            clearSelectedIntensificacionThemes();
        }
    },
    
    // Clear all state
    clearAll: () => {
        if (typeof clearAllStudentState === 'function') {
            clearAllStudentState();
        }
    }
};

// Initialize modal override when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        if (typeof initializeStudentModalOverride === 'function') {
            initializeStudentModalOverride();
        }
    });
} else {
    // DOM already loaded
    if (typeof initializeStudentModalOverride === 'function') {
        initializeStudentModalOverride();
    }
}

