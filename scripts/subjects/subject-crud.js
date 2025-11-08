/**
 * Subject CRUD Module
 * 
 * Handles Create, Read, Update, Delete operations for subjects:
 * - Save subject (create/update)
 * - Edit subject
 * - Delete subject
 * - Form management and validation
 */

import { 
    getCurrentSubjectId, 
    setCurrentSubjectId, 
    getIsSubmitting, 
    setIsSubmitting 
} from './utils/state.js';
import { parseCourseDivision, getSubjectById } from './utils/helpers.js';
import { populateCourseDivisionDropdown } from './utils/course-dropdown.js';
import { 
    updateScheduleHiddenField, 
    resetScheduleSelector, 
    addScheduleEntry,
    populateScheduleSelector 
} from './schedule.js';

/**
 * Save subject (create or update)
 */
export async function saveSubject() {
    // Always use the logged-in user as the professor
    const userIdString = localStorage.getItem('userId');
    if (!userIdString) {
        alert('Error: No se encontró el ID de usuario. Por favor, inicia sesión nuevamente.');
        return;
    }
    
    const teacherId = parseInt(userIdString, 10);
    
    if (!teacherId || isNaN(teacherId) || teacherId <= 0) {
        alert('Error: ID de usuario inválido. Por favor, inicia sesión nuevamente.');
        return;
    }

    // Get curso_division from dropdown
    const cursoDivisionSelect = document.getElementById('subjectCourseDivision');
    const curso_division = cursoDivisionSelect ? cursoDivisionSelect.value : '';
    
    // If "create new" was selected, get course, division, and institution values
    let finalCursoDivision = curso_division;
    if (curso_division === '__new__') {
        const courseValue = document.getElementById('subjectCourse').value;
        const divisionValue = document.getElementById('subjectDivision').value;
        const institucionValue = document.getElementById('subjectInstitucion')?.value?.trim();
        if (courseValue && divisionValue) {
            finalCursoDivision = `${courseValue}º Curso - División ${divisionValue}`;
            // If institution is provided, also create the course in the Curso table
            if (institucionValue) {
                // Create course in Curso table
                try {
                    const cursoPayload = {
                        Numero_curso: parseInt(courseValue, 10),
                        Division: divisionValue,
                        Institucion: institucionValue,
                        Usuarios_docente_ID_docente: teacherId,
                        Estado: 'ACTIVO'
                    };
                    const isInPages = window.location.pathname.includes('/pages/');
                    const baseUrl = isInPages ? '../api' : 'api';
                    const cursoResponse = await fetch(`${baseUrl}/curso.php`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(cursoPayload)
                    });
                    const cursoResult = await cursoResponse.json();
                    if (!cursoResult.success && cursoResult.error !== 'DUPLICATE_COURSE') {
                        console.warn('No se pudo crear el curso automáticamente:', cursoResult.message);
                    }
                } catch (err) {
                    console.warn('Error al crear curso automáticamente:', err);
                }
            }
        } else {
            alert('Completá Curso y División para crear un nuevo curso.');
            return;
        }
    }

    // Update schedule hidden field before submitting
    updateScheduleHiddenField();

    const classroomValue = document.getElementById('subjectClassroom').value.trim();
    const aulaNumber = classroomValue ? parseInt(classroomValue, 10) : null;
    
    // Validate aula field - must be a positive number if provided
    if (classroomValue && (isNaN(aulaNumber) || aulaNumber <= 0)) {
        alert('El campo Aula debe contener solo números positivos.');
        return;
    }

    const payload = {
        Nombre: document.getElementById('subjectName').value.trim(),
        Curso_division: finalCursoDivision,
        Usuarios_docente_ID_docente: teacherId,
        Estado: document.getElementById('subjectStatus').value,
        Horario: (document.getElementById('subjectSchedule').value || '').trim() || null,
        Aula: aulaNumber ? aulaNumber.toString() : null,
        Descripcion: (document.getElementById('subjectDescription').value || '').trim() || null
    };

    // Improved validation - allow creating subject with only name
    if (!payload.Nombre) {
        alert('El nombre de la materia es obligatorio.');
        return;
    }
    
    // If no course, allow creating subject without course (can be assigned later)
    if (!finalCursoDivision) {
        const confirmar = confirm('¿Deseas crear la materia sin asignarle un curso? Podrás asignarlo después.');
        if (!confirmar) {
            return;
        }
        // Assign temporary value to avoid database errors
        payload.Curso_division = 'Sin asignar';
    }
    
    // Validate that teacherId is valid
    if (!payload.Usuarios_docente_ID_docente || payload.Usuarios_docente_ID_docente <= 0) {
        alert('Error: ID de profesor inválido. Por favor, inicia sesión nuevamente.');
        return;
    }

    // Validate that subject with same name and course doesn't exist for this teacher
    const currentSubjectId = getCurrentSubjectId();
    if (!currentSubjectId) {
        const existingSubject = window.appData?.materia?.find(m => 
            m.Nombre === payload.Nombre && 
            m.Curso_division === finalCursoDivision &&
            m.Usuarios_docente_ID_docente === teacherId
        );
        
        if (existingSubject) {
            alert(`Ya existe una materia "${payload.Nombre}" con el curso "${finalCursoDivision}". No se puede duplicar la misma materia y curso. Puedes crear la misma materia en un curso diferente (ej: ${payload.Nombre} en otro curso).`);
            return;
        }
    }

    // Prevent double submit
    if (getIsSubmitting()) {
        return;
    }

    setIsSubmitting(true);
    const submitBtn = document.querySelector('#subjectForm button[type="submit"]');
    const originalBtnText = submitBtn ? submitBtn.textContent : '';
    
    try {
        // Disable button during process
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Guardando...';
        }
        
        let res, data;
        let newSubjectId = null;
        
        const isInPages = window.location.pathname.includes('/pages/');
        const baseUrl = isInPages ? '../api' : 'api';
        
        if (currentSubjectId) {
            // UPDATE with PUT
            res = await fetch(`${baseUrl}/materia.php?id=${currentSubjectId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(payload)
            });
            data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data.message || 'No se pudo actualizar la materia');
        } else {
            // CREATE with POST
            res = await fetch(`${baseUrl}/materia.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(payload)
            });
            
            const text = await res.text();
            try {
                data = JSON.parse(text);
            } catch (e) {
                throw new Error(`Error del servidor (${res.status})`);
            }
            
            if (!res.ok) {
                let errorMsg = data.message || 'No se pudo crear la materia';
                if (data.error === 'DUPLICATE_SUBJECT_COURSE') {
                    errorMsg = data.message || 'Ya existe una materia con este nombre y curso. No se puede duplicar la misma materia y curso.';
                } else if (data.error) {
                    errorMsg = `${data.message || 'Error'}: ${data.error}`;
                }
                throw new Error(errorMsg);
            }
            
            // If it's a new subject, save the ID before reloading
            if (res.ok && data.success !== false) {
                // Endpoint returns { success: true, id: ... }
                newSubjectId = data.id || data.ID_materia || null;
            }
        }
        
        if (typeof loadData === 'function') await loadData(); // reload from backend
        
        if (typeof closeModal === 'function') {
            closeModal('subjectModal');
        }
        
        if (typeof loadSubjects === 'function') loadSubjects();
        if (typeof populateCourseFilter === 'function') populateCourseFilter();
        
        // Repopulate course dropdown with new courses
        await populateCourseDivisionDropdown();
        
        if (typeof populateSubjectFilter === 'function') populateSubjectFilter();
        if (typeof populateExamsSubjectFilter === 'function') populateExamsSubjectFilter();
        if (typeof populateUnifiedCourseFilter === 'function') populateUnifiedCourseFilter();
        if (typeof loadUnifiedStudentData === 'function') loadUnifiedStudentData();
        if (typeof updateDashboard === 'function') updateDashboard();
        
        // If it's a new subject, ask if user wants to assign students
        if (newSubjectId) {
            const assignStudents = typeof fancyConfirm === 'function' 
                ? await fancyConfirm('¿Deseas asignar estudiantes a esta materia ahora?', 'Asignar Estudiantes')
                : confirm('¿Deseas asignar estudiantes a esta materia ahora?');
            if (assignStudents) {
                if (typeof assignStudentsToSubject === 'function') {
                    await assignStudentsToSubject(newSubjectId, finalCursoDivision);
                }
            }
        }
        
        setCurrentSubjectId(null);
        // Reset form
        resetSubjectForm();
        alert('Materia guardada correctamente');
    } catch (err) {
        const errorMsg = err.message || 'Error al guardar la materia';
        alert(`Error: ${errorMsg}`);
    } finally {
        // Re-enable button and flag
        setIsSubmitting(false);
        const submitBtn = document.querySelector('#subjectForm button[type="submit"]');
        if (submitBtn) {
            submitBtn.disabled = false;
            if (originalBtnText) submitBtn.textContent = originalBtnText;
        }
    }
}

/**
 * Reset subject form to initial state
 */
export async function resetSubjectForm() {
    const form = document.getElementById('subjectForm');
    if (form) form.reset();
    
    // Hide create new course section
    const createNewSection = document.getElementById('createNewCourseSection');
    if (createNewSection) createNewSection.style.display = 'none';
    
    // Clear course and division fields
    const courseSelect = document.getElementById('subjectCourse');
    const divisionSelect = document.getElementById('subjectDivision');
    if (courseSelect) courseSelect.value = '';
    if (divisionSelect) divisionSelect.value = '';
    
    // Repopulate course dropdown
    await populateCourseDivisionDropdown();
    
    // Reset schedule selector
    resetScheduleSelector();
    addScheduleEntry(); // Add one empty entry after reset
    
    // Reset modal title
    const modalTitle = document.querySelector('#subjectModal .modal-header h3');
    if (modalTitle) {
        modalTitle.textContent = 'Agregar Materia';
        modalTitle.setAttribute('data-translate', 'add_subject');
    }
    
    setCurrentSubjectId(null);
}

/**
 * Clear subject form (simpler version)
 */
export function clearSubjectForm() {
    const form = document.getElementById('subjectForm');
    if (form) {
        form.reset();
    }
    // Reset schedule selector
    resetScheduleSelector();
    setCurrentSubjectId(null);
    
    // Reset modal title to "Add Subject"
    const modalTitle = document.querySelector('#subjectModal .modal-header h3');
    if (modalTitle) {
        modalTitle.textContent = 'Agregar Materia';
        modalTitle.setAttribute('data-translate', 'add_subject');
    }
}

/**
 * Edit subject - populate form with subject data
 * @param {number} id - Subject ID to edit
 */
export async function editSubject(id) {
    try {
        // Ensure appData is loaded
        if (!appData || !appData.materia || !Array.isArray(appData.materia)) {
            console.log('appData not loaded, loading data...');
            if (typeof loadData === 'function') {
                await loadData();
            }
        }

        // Use getSubjectById helper which handles type conversion properly
        let subject = getSubjectById(id);

        // If still not found, try fetching from API as fallback
        if (!subject) {
            console.log('Subject not found in appData, fetching from API...');
            try {
                const isInPages = window.location.pathname.includes('/pages/');
                const baseUrl = isInPages ? '../api' : 'api';
                const response = await fetch(`${baseUrl}/materia.php?id=${id}`, {
                    method: 'GET',
                    credentials: 'include',
                    headers: { 'Accept': 'application/json' }
                });
                
                if (response.ok) {
                    const data = await response.json();
                    // API returns the subject object directly when fetching by ID
                    if (data && (data.ID_materia || data.id_materia)) {
                        subject = data;
                        // Normalize ID field name
                        if (!subject.ID_materia && subject.id_materia) {
                            subject.ID_materia = subject.id_materia;
                        }
                        // Add to appData for future use
                        if (appData && appData.materia) {
                            const existingIndex = appData.materia.findIndex(s => parseInt(s.ID_materia, 10) === parseInt(id, 10));
                            if (existingIndex >= 0) {
                                appData.materia[existingIndex] = subject;
                            } else {
                                appData.materia.push(subject);
                            }
                        }
                    }
                } else {
                    console.warn('API returned error status:', response.status);
                }
            } catch (apiError) {
                console.error('Error fetching subject from API:', apiError);
            }
        }

        if (!subject) {
            console.error('Subject not found:', id);
            alert('No se pudo encontrar la materia. Por favor, recarga la página.');
            return;
        }

        setCurrentSubjectId(parseInt(id, 10));
        
        // Populate form fields safely
        const subjectNameEl = document.getElementById('subjectName');
        if (subjectNameEl) {
            subjectNameEl.value = subject.Nombre || '';
        }
        
        // Populate course_division dropdown and select current course
        await populateCourseDivisionDropdown();
        const courseDivisionSelect = document.getElementById('subjectCourseDivision');
        if (courseDivisionSelect && subject.Curso_division) {
            // Check if course exists in dropdown
            const courseExists = Array.from(courseDivisionSelect.options).some(opt => opt.value === subject.Curso_division);
            if (courseExists) {
                courseDivisionSelect.value = subject.Curso_division;
            } else {
                // If it doesn't exist, add it temporarily
                const option = document.createElement('option');
                option.value = subject.Curso_division;
                option.textContent = subject.Curso_division;
                courseDivisionSelect.insertBefore(option, courseDivisionSelect.lastChild);
                courseDivisionSelect.value = subject.Curso_division;
            }
        }
        
        // If course is not in list, show create new section
        const createNewSection = document.getElementById('createNewCourseSection');
        if (createNewSection && !courseDivisionSelect.value) {
            createNewSection.style.display = 'block';
            // Parse curso_division to separate course and division
            const { course, division } = parseCourseDivision(subject.Curso_division);
            const courseSelect = document.getElementById('subjectCourse');
            const divisionSelect = document.getElementById('subjectDivision');
            if (courseSelect && course) courseSelect.value = course;
            if (divisionSelect && division) divisionSelect.value = division;
        }
        
        const subjectDescriptionEl = document.getElementById('subjectDescription');
        if (subjectDescriptionEl) {
            subjectDescriptionEl.value = subject.Descripcion || '';
        }
        
        const subjectClassroomEl = document.getElementById('subjectClassroom');
        if (subjectClassroomEl) {
            subjectClassroomEl.value = subject.Aula || '';
        }
        
        // Note: Teacher is always the logged-in user, so we don't set it in edit mode
        const subjectStatusEl = document.getElementById('subjectStatus');
        if (subjectStatusEl) {
            subjectStatusEl.value = subject.Estado || '';
        }

        // Populate schedule selector
        if (subject.Horario) {
            populateScheduleSelector(subject.Horario);
        } else {
            resetScheduleSelector();
        }

        // Update modal title to indicate edit mode
        const modalTitle = document.querySelector('#subjectModal .modal-header h3');
        if (modalTitle) {
            modalTitle.textContent = 'Editar Materia';
            modalTitle.setAttribute('data-translate', 'edit_subject');
        }

        // Show the modal
        if (typeof showModal === 'function') {
            showModal('subjectModal');
        } else {
            const modal = document.getElementById('subjectModal');
            if (modal) {
                modal.style.display = '';
                modal.classList.add('active');
                if (typeof setupModalHandlers === 'function') {
                    setupModalHandlers('subjectModal');
                }
            }
        }
    } catch (error) {
        console.error('Error in editSubject:', error);
        alert('Error al abrir el formulario de edición. Por favor, intente nuevamente.');
    }
}

/**
 * Delete subject
 * @param {number} id - Subject ID to delete
 */
export async function deleteSubject(id) {
    if (!confirm('¿Estás seguro de que quieres eliminar esta materia?')) {
        return;
    }
    
    try {
        const isInPages = window.location.pathname.includes('/pages/');
        const baseUrl = isInPages ? '../api' : 'api';
        
        const res = await fetch(`${baseUrl}/materia.php?id=${id}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            credentials: 'include'
        });
        
        const text = await res.text();
        let data = {};
        try {
            data = JSON.parse(text);
        } catch (e) {
            throw new Error(`Error del servidor (${res.status})`);
        }
        
        if (!res.ok) {
            throw new Error(data.message || 'No se pudo eliminar la materia');
        }
        
        // Reload data from backend
        if (typeof loadData === 'function') {
            await loadData();
        }
        
        // Update UI
        if (typeof loadSubjects === 'function') loadSubjects();
        if (typeof populateCourseFilter === 'function') populateCourseFilter();
        if (typeof populateSubjectFilter === 'function') populateSubjectFilter();
        if (typeof populateExamsSubjectFilter === 'function') populateExamsSubjectFilter();
        if (typeof populateUnifiedCourseFilter === 'function') populateUnifiedCourseFilter();
        if (typeof loadUnifiedStudentData === 'function') loadUnifiedStudentData();
        if (typeof updateDashboard === 'function') updateDashboard();
        
        alert('Materia eliminada correctamente');
    } catch (err) {
        alert(err.message || 'Error al eliminar la materia');
    }
}

// Make functions globally available for onclick handlers
window.editSubject = editSubject;
window.deleteSubject = deleteSubject;

