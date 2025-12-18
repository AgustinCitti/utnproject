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
    if (!appData || !appData.materia) return [];
    
    const courseFilter = document.getElementById('subjectsCourseFilter');
    const statusFilter = document.getElementById('subjectsStatusFilter');
    
    const selectedCourse = courseFilter ? courseFilter.value : '';
    const selectedStatus = statusFilter ? statusFilter.value : '';
    
    let filtered = [...appData.materia];
    
    // Filter by course
    if (selectedCourse && selectedCourse !== 'all') {
        filtered = filtered.filter(subject => subject.Curso_division === selectedCourse);
    }
    
    // Filter by status
    if (selectedStatus && selectedStatus !== 'all') {
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





