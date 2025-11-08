/**
 * Course Dropdown Module
 * 
 * Handles population of course division dropdowns
 */

/**
 * Get all unique courses from subjects
 * @returns {Promise<Array>} Array of unique course divisions
 */
export async function getAllUniqueCourses() {
    try {
        // First try to get from appData
        if (appData && appData.materia && Array.isArray(appData.materia)) {
            const courses = [...new Set(appData.materia.map(m => m.Curso_division).filter(Boolean))];
            if (courses.length > 0) {
                return courses.sort();
            }
        }
        
        // If not in appData, fetch from API
        const isInPages = window.location.pathname.includes('/pages/');
        const baseUrl = isInPages ? '../api' : 'api';
        
        const response = await fetch(`${baseUrl}/materia.php`, {
            method: 'GET',
            credentials: 'include',
            headers: { 'Accept': 'application/json' }
        });
        
        if (response.ok) {
            const data = await response.json();
            const courses = [...new Set(data.map(m => m.Curso_division).filter(Boolean))];
            return courses.sort();
        }
        
        return [];
    } catch (error) {
        console.error('Error fetching courses:', error);
        return [];
    }
}

/**
 * Populate course division dropdown in subject form
 */
export async function populateCourseDivisionDropdown() {
    const dropdown = document.getElementById('subjectCourseDivision');
    if (!dropdown) return;
    
    // Save current selection
    const currentValue = dropdown.value;
    
    // Clear existing options (except the last one which is "Create new")
    const lastOption = dropdown.lastElementChild;
    const lastOptionValue = lastOption ? lastOption.value : null;
    
    dropdown.innerHTML = '<option value="" data-translate="select_course">- Seleccionar Curso -</option>';
    
    try {
        // Get unique courses
        const courses = await getAllUniqueCourses();
        
        // Add course options
        courses.forEach(course => {
            const option = document.createElement('option');
            option.value = course;
            option.textContent = course;
            dropdown.appendChild(option);
        });
        
        // Add "Create new" option if it existed before
        if (lastOptionValue === '__new__') {
            const newOption = document.createElement('option');
            newOption.value = '__new__';
            newOption.textContent = '+ Crear Nuevo Curso';
            dropdown.appendChild(newOption);
        }
        
        // Restore selection if it still exists
        if (currentValue && Array.from(dropdown.options).some(opt => opt.value === currentValue)) {
            dropdown.value = currentValue;
        }
    } catch (error) {
        console.error('Error populating course dropdown:', error);
    }
}

/**
 * Populate course filter dropdown
 */
export async function populateCourseFilter() {
    const filter = document.getElementById('subjectsCourseFilter');
    if (!filter) return;
    
    const currentValue = filter.value;
    filter.innerHTML = '<option value="all" data-translate="all_courses">Todos los Cursos</option>';
    
    try {
        const courses = await getAllUniqueCourses();
        
        courses.forEach(course => {
            const option = document.createElement('option');
            option.value = course;
            option.textContent = course;
            filter.appendChild(option);
        });
        
        // Restore selection if it still exists
        if (currentValue && currentValue !== 'all') {
            if (Array.from(filter.options).some(opt => opt.value === currentValue)) {
                filter.value = currentValue;
            }
        }
    } catch (error) {
        console.error('Error populating course filter:', error);
    }
}

/**
 * Populate subject select dropdown (for content form)
 */
export function populateSubjectSelect() {
    const subjectSelect = document.getElementById('contentSubject');
    if (!subjectSelect) return;

    subjectSelect.innerHTML = '<option value="" data-translate="select_subject">- Seleccionar Materia -</option>';
    
    if (appData && appData.materia) {
        appData.materia.forEach(subject => {
            const option = document.createElement('option');
            option.value = subject.ID_materia;
            option.textContent = subject.Nombre;
            subjectSelect.appendChild(option);
        });
    }
}

