/**
 * Helper Functions Module
 * 
 * Provides utility functions for:
 * - Data retrieval and filtering
 * - Status text formatting
 * - Student display state calculation
 * - Course division parsing
 */

// Ensure SubjectsModule namespace exists
if (typeof SubjectsModule === 'undefined') {
    window.SubjectsModule = {};
}

SubjectsModule.Helpers = {
    /**
     * Get teacher information by ID
     * @param {number} teacherId - Teacher ID
     * @returns {Object|null} Teacher object or null if not found
     */
    getTeacherById: function(teacherId) {
        if (!window.appData || !window.appData.usuarios_docente) return null;
        return window.appData.usuarios_docente.find(t => parseInt(t.ID_docente) === parseInt(teacherId)) || null;
    },

    /**
     * Get subject information by ID
     * @param {number} subjectId - Subject ID
     * @returns {Object|null} Subject object or null if not found
     */
    getSubjectById: function(subjectId) {
        if (!window.appData || !window.appData.materia) return null;
        const id = parseInt(subjectId, 10);
        return window.appData.materia.find(s => parseInt(s.ID_materia, 10) === id) || null;
    },

    /**
     * Get student count for a specific subject
     * @param {number} subjectId - Subject ID
     * @returns {number} Number of students enrolled in the subject
     */
    getStudentCountBySubject: function(subjectId) {
        if (!window.appData || !window.appData.alumnos_x_materia) return 0;
        return window.appData.alumnos_x_materia.filter(axm => parseInt(axm.Materia_ID_materia) === parseInt(subjectId)).length;
    },

    /**
     * Get evaluation count for a specific subject
     * @param {number} subjectId - Subject ID
     * @returns {number} Number of evaluations for the subject
     */
    getEvaluationCountBySubject: function(subjectId) {
        if (!window.appData || !window.appData.evaluacion) return 0;
        return window.appData.evaluacion.filter(e => parseInt(e.Materia_ID_materia) === parseInt(subjectId)).length;
    },

    /**
     * Get content count for a specific subject
     * @param {number} subjectId - Subject ID
     * @returns {number} Number of content items for the subject
     */
    getContentCountBySubject: function(subjectId) {
        if (!window.appData || !window.appData.contenido) return 0;
        return window.appData.contenido.filter(c => parseInt(c.Materia_ID_materia) === parseInt(subjectId)).length;
    },

    /**
     * Get formatted status text
     * @param {string} status - Status code
     * @returns {string} Formatted status text
     */
    getStatusText: function(status) {
        const statusMap = {
            'ACTIVA': 'Activa',
            'INACTIVA': 'Inactiva',
            'FINALIZADA': 'Finalizada',
            'PENDIENTE': 'Pendiente',
            'EN_PROGRESO': 'En Progreso',
            'COMPLETADO': 'Completado',
            'CANCELADO': 'Cancelado'
        };
        return statusMap[status] || status;
    },

    /**
     * Get student display estado (status)
     * Uses the INTENSIFICA column from the database
     * @param {Object} student - Student object
     * @returns {string} Display status (ACTIVO, INACTIVO, or INTENSIFICA)
     */
    getStudentDisplayEstado: function(student) {
        if (!student) return 'ACTIVO';
        
        // Check INTENSIFICA column directly
        const esIntensifica = student.INTENSIFICA === true || student.INTENSIFICA === 1 || student.INTENSIFICA === '1';
        
        if (esIntensifica) {
            return 'INTENSIFICA';
        }
        
        // Return status as-is if not intensificador
        const estado = (student.Estado || '').toUpperCase();
        return estado === 'ACTIVO' ? 'ACTIVO' : (estado === 'INACTIVO' ? 'INACTIVO' : estado);
    },

    /**
     * Parse course division string to extract course and division
     * Handles formats like: "10º Curso - División A", "10 - A", "10º-A", etc.
     * @param {string} cursoDivision - Course division string
     * @returns {Object} Object with course and division properties
     */
    parseCourseDivision: function(cursoDivision) {
        if (!cursoDivision) return { course: '', division: '' };
        
        // Try to find course number (can be at the start)
        const courseMatch = cursoDivision.match(/(\d+)/);
        const course = courseMatch ? courseMatch[1] : '';
        
        // Try to find division letter (A-F, can be after "División", "Div", or at the end)
        const divisionMatch = cursoDivision.match(/(?:División|Div)[\s-]*([A-F])/i) || 
                              cursoDivision.match(/[\s-]([A-F])[\s-]*$/i) ||
                              cursoDivision.match(/([A-F])[\s-]*$/i);
        const division = divisionMatch ? divisionMatch[1].toUpperCase() : '';
        
        return { course, division };
    },

    /**
     * Capitalize first letter of a string
     * @param {string} str - String to capitalize
     * @returns {string} Capitalized string
     */
    capitalizeFirst: function(str) {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    },

    /**
     * Format date string for display
     * @param {string} dateString - Date string to format
     * @returns {string} Formatted date string
     */
    formatDate: function(dateString) {
        if (!dateString) return '';
        try {
            return new Date(dateString).toLocaleDateString('es-ES');
        } catch (e) {
            return dateString;
        }
    }
};
