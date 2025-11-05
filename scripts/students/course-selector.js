/**
 * Course Selector Module
 * 
 * Handles the course selection dropdown and its interaction with subject selection.
 * When a course is selected, it automatically selects all subjects belonging to that course.
 */

/**
 * Populate the course select dropdown with available courses from the teacher's subjects
 */
function populateStudentCourseSelect() {
    const courseSelect = document.getElementById('studentCourse');
    if (!courseSelect) return;
    
    // Get current teacher ID
    const userIdString = localStorage.getItem('userId');
    const teacherId = userIdString ? parseInt(userIdString, 10) : null;
    
    if (!teacherId) {
        courseSelect.innerHTML = '<option value="">- Seleccionar Curso (Opcional) -</option>';
        return;
    }
    
    // Get all unique curso_division values from teacher's subjects
    const teacherSubjects = (appData.materia || []).filter(m => 
        m.Usuarios_docente_ID_docente === teacherId && 
        (!m.Estado || m.Estado === 'ACTIVA')
    );
    
    const uniqueCourses = [...new Set(teacherSubjects.map(s => s.Curso_division).filter(Boolean))].sort();
    
    // Clear current options
    courseSelect.innerHTML = '<option value="">- Seleccionar Curso (Opcional) -</option>';
    
    // Add course options
    uniqueCourses.forEach(course => {
        const option = document.createElement('option');
        option.value = course;
        option.textContent = course;
        courseSelect.appendChild(option);
    });
    
    // Add event listener for course selection (only once)
    if (!courseSelect._hasCourseListener) {
        courseSelect.addEventListener('change', handleCourseSelection);
        courseSelect._hasCourseListener = true;
    }
}

/**
 * Handle course selection - automatically select all subjects for the selected course
 */
function handleCourseSelection() {
    const courseSelect = document.getElementById('studentCourse');
    const selectedCourse = courseSelect ? courseSelect.value : '';
    
    if (!selectedCourse) {
        return;
    }
    
    // Get current teacher ID
    const userIdString = localStorage.getItem('userId');
    const teacherId = userIdString ? parseInt(userIdString, 10) : null;
    
    if (!teacherId) {
        alert('Error: No se encontró el ID de usuario');
        return;
    }
    
    // Clear previously selected subjects
    if (typeof clearSelectedSubjects === 'function') {
        clearSelectedSubjects();
    }
    
    // Get all subjects for the selected course
    const courseSubjects = (appData.materia || []).filter(m => 
        m.Usuarios_docente_ID_docente === teacherId &&
        m.Curso_division === selectedCourse &&
        (!m.Estado || m.Estado === 'ACTIVA')
    );
    
    if (courseSubjects.length === 0) {
        alert('No hay materias disponibles para este curso');
        return;
    }
    
    // Add all course subjects to selected list
    const newSubjects = [];
    courseSubjects.forEach(subject => {
        if (!newSubjects.some(s => parseInt(s.id) === parseInt(subject.ID_materia))) {
            newSubjects.push({
                id: parseInt(subject.ID_materia),
                name: subject.Nombre,
                curso: subject.Curso_division
            });
        }
    });
    
    if (typeof setSelectedSubjects === 'function') {
        setSelectedSubjects(newSubjects);
    }
    
    // Render selected subjects
    if (typeof renderSelectedSubjects === 'function') {
        renderSelectedSubjects();
    }
    
    // Repopulate subject dropdown
    if (typeof populateStudentSubjectsSelect === 'function') {
        populateStudentSubjectsSelect();
    }
    
    // Reload topic selector
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

