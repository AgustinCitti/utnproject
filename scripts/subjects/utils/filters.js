/**
 * Filtering Module
 * 
 * Handles filtering of subjects by course and status
 */

/**
 * Get filtered subjects based on current filter selections
 * @returns {Array} Filtered array of subjects
 */
export function getFilteredSubjects() {
    // Ensure appData is available - use window.appData or window.data as fallback
    const data = appData || window.appData || window.data || {};
    if (!data.materia || !Array.isArray(data.materia)) {
        console.warn('getFilteredSubjects: No materia data available');
        return [];
    }
    
    // Get current user ID from localStorage
    const currentUserId = localStorage.getItem('userId');
    
    // Filter by current teacher's subjects first
    let filtered = [...data.materia];
    
    // Only filter by user if we have a valid userId
    if (currentUserId) {
        const teacherId = parseInt(currentUserId);
        if (!isNaN(teacherId)) {
            const beforeFilter = filtered.length;
            filtered = filtered.filter(subject => {
                if (!subject || !subject.Usuarios_docente_ID_docente) return false;
                const subjectTeacherId = parseInt(subject.Usuarios_docente_ID_docente);
                return !isNaN(subjectTeacherId) && subjectTeacherId === teacherId;
            });
            console.log(`getFilteredSubjects: Filtered from ${beforeFilter} to ${filtered.length} subjects for teacher ${teacherId}`);
            
            // If filtering removed all subjects, show all subjects as fallback (for debugging)
            if (filtered.length === 0 && beforeFilter > 0) {
                console.warn('getFilteredSubjects: No subjects found for current user, showing all subjects as fallback');
                filtered = [...data.materia];
            }
        }
    } else {
        console.warn('getFilteredSubjects: No userId in localStorage, showing all subjects');
    }
    
    const courseFilter = document.getElementById('subjectsCourseFilter');
    const statusFilter = document.getElementById('subjectsStatusFilter');
    
    const selectedCourse = courseFilter ? courseFilter.value : '';
    const selectedStatus = statusFilter ? statusFilter.value : '';
    
    // Filter by course
    if (selectedCourse && selectedCourse !== 'all' && selectedCourse !== '') {
        filtered = filtered.filter(subject => subject.Curso_division === selectedCourse);
    }
    
    // Filter by status
    if (selectedStatus && selectedStatus !== 'all' && selectedStatus !== '') {
        filtered = filtered.filter(subject => subject.Estado === selectedStatus);
    }
    
    return filtered;
}

/**
 * Apply filters and reload subjects display
 */
export function filterSubjects() {
    // This will trigger a reload of the subjects display
    // The actual rendering is handled by the views module
    if (typeof loadSubjects === 'function') {
        loadSubjects();
    }
}





