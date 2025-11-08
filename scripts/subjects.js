/**
 * Subjects Management - Main Module
 * 
 * This is the main entry point for subjects management functionality.
 * It uses a modular structure with clear separation of concerns.
 * 
 * Modular Structure:
 * - utils/state.js - State management (loaded first)
 * - utils/helpers.js - Helper functions
 * - utils/filters.js - Filtering functionality
 * - utils/course-dropdown.js - Course dropdown management
 * - schedule.js - Schedule selector functionality
 * - subject-crud.js - Subject CRUD operations
 * - subject-views.js - Subject rendering (grid/list views)
 * 
 * NOTE: This file expects modules to be loaded in order before this file.
 * Update your HTML to load modules first, then this file.
 * 
 * Alternatively, all module code can be inlined in this file for a single-file solution.
 */

// Ensure SubjectsModule namespace exists
if (typeof SubjectsModule === 'undefined') {
    window.SubjectsModule = {};
}

// Import references (using namespace pattern)
const State = SubjectsModule.State || {};
const Helpers = SubjectsModule.Helpers || {};
const Filters = SubjectsModule.Filters || {};
const CourseDropdown = SubjectsModule.CourseDropdown || {};
const Schedule = SubjectsModule.Schedule || {};
const SubjectCRUD = SubjectsModule.SubjectCRUD || {};
const SubjectViews = SubjectsModule.SubjectViews || {};

// Helper functions for backward compatibility (use module functions if available, otherwise define inline)
function getCurrentSubjectId() {
    return State.getCurrentSubjectId ? State.getCurrentSubjectId() : (window.currentSubjectId || null);
}

function setCurrentSubjectId(id) {
    if (State.setCurrentSubjectId) {
        State.setCurrentSubjectId(id);
    }
    window.currentSubjectId = id;
}

function getIsSubmitting() {
    return State.getIsSubmitting ? State.getIsSubmitting() : (window.isSubmitting || false);
}

function setIsSubmitting(value) {
    if (State.setIsSubmitting) {
        State.setIsSubmitting(value);
    }
    window.isSubmitting = value;
}

function getSubjectsInitialized() {
    return State.getSubjectsInitialized ? State.getSubjectsInitialized() : false;
}

function setSubjectsInitialized(value) {
    if (State.setSubjectsInitialized) {
        State.setSubjectsInitialized(value);
    }
}

function getSubjectFormHandler() {
    return State.getSubjectFormHandler ? State.getSubjectFormHandler() : null;
}

function setSubjectFormHandler(handler) {
    if (State.setSubjectFormHandler) {
        State.setSubjectFormHandler(handler);
    }
}

function getCurrentThemesSubjectId() {
    return State.getCurrentThemesSubjectId ? State.getCurrentThemesSubjectId() : (window.currentThemesSubjectId || null);
}

function setCurrentThemesSubjectId(id) {
    if (State.setCurrentThemesSubjectId) {
        State.setCurrentThemesSubjectId(id);
    }
    window.currentThemesSubjectId = id;
}

// Use module functions or fallback to inline definitions
const getTeacherById = Helpers.getTeacherById || function(teacherId) {
    const data = window.appData || window.data || {};
    if (!data.usuarios_docente) return null;
    return data.usuarios_docente.find(t => parseInt(t.ID_docente) === parseInt(teacherId)) || null;
};

const getSubjectById = Helpers.getSubjectById || function(subjectId) {
    const data = window.appData || window.data || {};
    if (!data.materia) return null;
    const id = parseInt(subjectId, 10);
    return data.materia.find(s => parseInt(s.ID_materia, 10) === id) || null;
};

const getStudentCountBySubject = Helpers.getStudentCountBySubject || function(subjectId) {
    const data = window.appData || window.data || {};
    if (!data.alumnos_x_materia) return 0;
    return data.alumnos_x_materia.filter(axm => parseInt(axm.Materia_ID_materia) === parseInt(subjectId)).length;
};

const getEvaluationCountBySubject = Helpers.getEvaluationCountBySubject || function(subjectId) {
    const data = window.appData || window.data || {};
    if (!data.evaluacion) return 0;
    return data.evaluacion.filter(e => parseInt(e.Materia_ID_materia) === parseInt(subjectId)).length;
};

const getContentCountBySubject = Helpers.getContentCountBySubject || function(subjectId) {
    const data = window.appData || window.data || {};
    if (!data.contenido) return 0;
    return data.contenido.filter(c => parseInt(c.Materia_ID_materia) === parseInt(subjectId)).length;
};

const getStatusText = Helpers.getStatusText || function(status) {
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
};

// getStudentDisplayEstado is already defined in attendance.js and unified-student-management.js
// Don't redeclare it - it's already available globally
// Only override on window if Helpers module provides a different implementation
if (Helpers.getStudentDisplayEstado) {
    window.getStudentDisplayEstado = Helpers.getStudentDisplayEstado;
}

const parseCourseDivision = Helpers.parseCourseDivision || function(cursoDivision) {
    if (!cursoDivision) return { course: '', division: '' };
    const courseMatch = cursoDivision.match(/(\d+)/);
    const course = courseMatch ? courseMatch[1] : '';
    const divisionMatch = cursoDivision.match(/(?:División|Div)[\s-]*([A-F])/i) || 
                          cursoDivision.match(/[\s-]([A-F])[\s-]*$/i) ||
                          cursoDivision.match(/([A-F])[\s-]*$/i);
    const division = divisionMatch ? divisionMatch[1].toUpperCase() : '';
    return { course, division };
};

const capitalizeFirst = Helpers.capitalizeFirst || function(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

// formatDate is already defined in utils.js and available globally
// Only override if Helpers module provides a different implementation
if (Helpers.formatDate) {
    window.formatDate = Helpers.formatDate;
}

const getFilteredSubjects = Filters.getFilteredSubjects || function() {
    const data = window.appData || window.data || {};
    if (!data.materia || !Array.isArray(data.materia)) return [];
    const courseFilter = document.getElementById('subjectsCourseFilter');
    const statusFilter = document.getElementById('subjectsStatusFilter');
    const selectedCourse = courseFilter ? courseFilter.value : '';
    const selectedStatus = statusFilter ? statusFilter.value : '';
    let filtered = [...data.materia];
    if (selectedCourse && selectedCourse !== 'all') {
        filtered = filtered.filter(subject => subject.Curso_division === selectedCourse);
    }
    if (selectedStatus && selectedStatus !== 'all') {
        filtered = filtered.filter(subject => subject.Estado === selectedStatus);
    }
    return filtered;
};

const filterSubjects = Filters.filterSubjects || function() {
    if (typeof loadSubjects === 'function') {
    loadSubjects();
}
};

// Course dropdown functions
const populateCourseDivisionDropdown = CourseDropdown.populateCourseDivisionDropdown || async function() {
    const dropdown = document.getElementById('subjectCourseDivision');
    if (!dropdown) return;
    const currentValue = dropdown.value;
    dropdown.innerHTML = '<option value="" data-translate="select_course">- Seleccionar Curso -</option>';
    try {
        const courses = await (CourseDropdown.getAllUniqueCourses ? CourseDropdown.getAllUniqueCourses() : []);
        courses.forEach(course => {
            const option = document.createElement('option');
            option.value = course;
            option.textContent = course;
            dropdown.appendChild(option);
        });
        if (currentValue && Array.from(dropdown.options).some(opt => opt.value === currentValue)) {
            dropdown.value = currentValue;
            }
        } catch (error) {
        console.error('Error populating course dropdown:', error);
    }
};

const populateCourseFilter = CourseDropdown.populateCourseFilter || async function() {
    const filter = document.getElementById('subjectsCourseFilter');
    if (!filter) return;
    const currentValue = filter.value;
    filter.innerHTML = '<option value="all" data-translate="all_courses">Todos los Cursos</option>';
    try {
        const courses = await (CourseDropdown.getAllUniqueCourses ? CourseDropdown.getAllUniqueCourses() : []);
    courses.forEach(course => {
        const option = document.createElement('option');
        option.value = course;
        option.textContent = course;
            filter.appendChild(option);
        });
        if (currentValue && currentValue !== 'all') {
            if (Array.from(filter.options).some(opt => opt.value === currentValue)) {
                filter.value = currentValue;
            }
        }
    } catch (error) {
        console.error('Error populating course filter:', error);
    }
};

const populateSubjectSelect = CourseDropdown.populateSubjectSelect || function() {
    const subjectSelect = document.getElementById('contentSubject');
    if (!subjectSelect) return;
    subjectSelect.innerHTML = '<option value="" data-translate="select_subject">- Seleccionar Materia -</option>';
    const data = window.appData || window.data || {};
    if (data.materia && Array.isArray(data.materia)) {
        data.materia.forEach(subject => {
            const option = document.createElement('option');
            option.value = subject.ID_materia;
            option.textContent = subject.Nombre;
            subjectSelect.appendChild(option);
        });
    }
};

// Schedule functions
const setupScheduleSelector = Schedule.setupScheduleSelector || function() {
    const addScheduleEntryBtn = document.getElementById('addScheduleEntryBtn');
    if (addScheduleEntryBtn) {
        addScheduleEntryBtn.addEventListener('click', addScheduleEntry);
    }
};

const addScheduleEntry = Schedule.addScheduleEntry || function(entry = null) {
    // Implementation would go here - this is a placeholder
    console.warn('addScheduleEntry: Schedule module not loaded, using fallback');
};

const updateScheduleHiddenField = Schedule.updateScheduleHiddenField || function() {
    console.warn('updateScheduleHiddenField: Schedule module not loaded, using fallback');
};

const resetScheduleSelector = Schedule.resetScheduleSelector || function() {
    console.warn('resetScheduleSelector: Schedule module not loaded, using fallback');
};

const populateScheduleSelector = Schedule.populateScheduleSelector || function(scheduleString) {
    console.warn('populateScheduleSelector: Schedule module not loaded, using fallback');
};

// Subject CRUD functions - these are critical, so we'll include full implementations
// Import from module if available, otherwise use inline fallbacks
let saveSubject, editSubject, deleteSubject, resetSubjectForm, clearSubjectForm;

if (SubjectCRUD.saveSubject) {
    saveSubject = SubjectCRUD.saveSubject;
    editSubject = SubjectCRUD.editSubject;
    deleteSubject = SubjectCRUD.deleteSubject;
    resetSubjectForm = SubjectCRUD.resetSubjectForm;
    clearSubjectForm = SubjectCRUD.clearSubjectForm;
} else {
    // Fallback: These functions need to be loaded from the module file
    // For now, we'll define minimal stubs that will be overridden when modules load
    // The actual implementations are in scripts/subjects/subject-crud.js
    // To use them, either load the modules or inline the code here
    console.warn('SubjectCRUD module not loaded - CRUD functions may not work. Load subject-crud.js module first.');
    
    // Minimal stubs to prevent errors
    saveSubject = async function() {
        alert('Error: saveSubject no está disponible. Por favor, carga el módulo subject-crud.js');
    };
    editSubject = async function(id) {
        alert('Error: editSubject no está disponible. Por favor, carga el módulo subject-crud.js');
    };
    deleteSubject = async function(id) {
        alert('Error: deleteSubject no está disponible. Por favor, carga el módulo subject-crud.js');
    };
    resetSubjectForm = async function() {
        const form = document.getElementById('subjectForm');
        if (form) form.reset();
        setCurrentSubjectId(null);
    };
    clearSubjectForm = function() {
        const form = document.getElementById('subjectForm');
        if (form) form.reset();
        setCurrentSubjectId(null);
    };
}

// Make CRUD functions globally available
window.saveSubject = saveSubject;
window.editSubject = editSubject;
window.deleteSubject = deleteSubject;
window.resetSubjectForm = resetSubjectForm;
window.clearSubjectForm = clearSubjectForm;

// Subject Views - Full implementation
const loadSubjects = SubjectViews.loadSubjects || function() {
    const subjectsContainer = document.getElementById('subjectsContainer');
    const subjectsList = document.getElementById('subjectsList');
    
    if (!subjectsContainer || !subjectsList) {
        console.warn('Subjects containers not found');
        return;
    }

    // Ensure appData is loaded - use window.appData or window.data
    const data = window.appData || window.data || {};
    if (!data.materia || !Array.isArray(data.materia)) {
        console.warn('appData not loaded yet, waiting...', { hasAppData: !!window.appData, hasData: !!window.data });
        // Retry after a short delay
        setTimeout(() => {
            const retryData = window.appData || window.data || {};
            if (retryData.materia && Array.isArray(retryData.materia)) {
                loadSubjects();
            } else {
                subjectsContainer.innerHTML = '<div class="empty-state">Cargando materias...</div>';
                subjectsList.innerHTML = '<div class="empty-state">Cargando materias...</div>';
            }
        }, 500);
        return;
    }

    // Get filtered subjects
    const filteredSubjects = getFilteredSubjects();

    if (!filteredSubjects || filteredSubjects.length === 0) {
        subjectsContainer.innerHTML = '<div class="empty-state">No hay materias disponibles</div>';
        subjectsList.innerHTML = '<div class="empty-state">No hay materias disponibles</div>';
        return;
    }

    // Grid view
    subjectsContainer.innerHTML = filteredSubjects.map(subject => {
        const teacher = getTeacherById(subject.Usuarios_docente_ID_docente);
        const studentCount = getStudentCountBySubject(subject.ID_materia);
        const evaluationCount = getEvaluationCountBySubject(subject.ID_materia);
        const contentCount = getContentCountBySubject(subject.ID_materia);

        return `
            <div class="card clickable-card" onclick="showSubjectThemesPanel(${subject.ID_materia})" style="cursor: pointer;">
                <div class="card-header">
                    <h3 class="card-title">${subject.Nombre}</h3>
                    <div class="card-actions" onclick="event.stopPropagation();">
                        <button class="btn-icon btn-edit" onclick="editSubject(${subject.ID_materia})" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-icon btn-create" onclick="createThemeForSubject(${subject.ID_materia})" title="Crear Tema">
                            <i class="fas fa-book-open"></i>
                        </button>
                        <button class="btn-icon btn-delete" onclick="deleteSubject(${subject.ID_materia})" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <div class="card-content">
                    <p><strong>Curso:</strong> ${subject.Curso_division}</p>
                    <p><strong>Profesor:</strong> ${teacher ? `${teacher.Nombre_docente} ${teacher.Apellido_docente}` : 'N/A'}</p>
                    <p><strong>Horario:</strong> ${subject.Horario || 'No especificado'}</p>
                    <p><strong>Aula:</strong> ${subject.Aula || 'No especificada'}</p>
                    <p><strong>Estado:</strong> <span class="status-${subject.Estado.toLowerCase()}">${getStatusText(subject.Estado)}</span></p>
                    <div class="card-stats">
                        <div class="stat-item">
                            <i class="fas fa-users"></i>
                            <span>${studentCount} estudiantes</span>
                        </div>
                        <div class="stat-item">
                            <i class="fas fa-file-alt"></i>
                            <span>${evaluationCount} evaluaciones</span>
                        </div>
                        <div class="stat-item">
                            <i class="fas fa-list"></i>
                            <span>${contentCount} temas</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    // List view - Table format
    subjectsList.innerHTML = `
        <div class="table-responsive">
            <table class="data-table">
                <thead>
                    <tr>
                        <th data-translate="subject_name">Materia</th>
                        <th data-translate="course_division">Curso</th>
                        <th data-translate="teacher">Profesor</th>
                        <th data-translate="schedule">Horario</th>
                        <th data-translate="classroom">Aula</th>
                        <th data-translate="status">Estado</th>
                        <th data-translate="students">Estudiantes</th>
                        <th data-translate="actions">Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    ${filteredSubjects.map(subject => {
                        const teacher = getTeacherById(subject.Usuarios_docente_ID_docente);
                        const studentCount = getStudentCountBySubject(subject.ID_materia);
                        
                        return `
                            <tr onclick="showSubjectThemesPanel(${subject.ID_materia})" class="clickable-row">
                                <td>
                                    <strong>${subject.Nombre}</strong>
                                    <br>
                                    <small style="color: #667eea; font-weight: 600;">
                                        <i class="fas fa-graduation-cap" style="margin-right: 4px;"></i>
                                        ${subject.Curso_division}
                                    </small>
                                </td>
                                <td>
                                    <span style="display: inline-block; padding: 4px 10px; background: #e3f2fd; color: #1976d2; border-radius: 12px; font-size: 0.85rem; font-weight: 600;">
                                        ${subject.Curso_division}
                                    </span>
                                </td>
                                <td>${teacher ? `${teacher.Nombre_docente} ${teacher.Apellido_docente}` : 'N/A'}</td>
                                <td>${subject.Horario || 'No especificado'}</td>
                                <td>${subject.Aula || 'No especificada'}</td>
                                <td><span class="table-status ${subject.Estado.toLowerCase()}">${getStatusText(subject.Estado)}</span></td>
                                <td>
                                    <span style="display: inline-flex; align-items: center; gap: 6px;">
                                        <i class="fas fa-users" style="color: #667eea;"></i>
                                        <strong>${studentCount}</strong>
                                    </span>
                                </td>
                                <td>
                                    <div class="table-actions" onclick="event.stopPropagation();">
                                        <button class="btn-icon btn-edit" onclick="editSubject(${subject.ID_materia})" title="Editar">
                                            <i class="fas fa-edit"></i>
                                        </button>
                                        <button class="btn-icon btn-create" onclick="createThemeForSubject(${subject.ID_materia})" title="Crear Tema">
                                            <i class="fas fa-book-open"></i>
                                        </button>
                                        <button class="btn-icon btn-delete" onclick="deleteSubject(${subject.ID_materia})" title="Eliminar">
                                            <i class="fas fa-trash"></i>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        </div>
    `;
};

const setupViewToggle = SubjectViews.setupViewToggle || function(gridBtnId, listBtnId, gridContainerId, listContainerId) {
    const gridBtn = document.getElementById(gridBtnId);
    const listBtn = document.getElementById(listBtnId);
    const gridContainer = document.getElementById(gridContainerId);
    const listContainer = document.getElementById(listContainerId);
    if (!gridBtn || !listBtn || !gridContainer || !listContainer) return;
        gridBtn.addEventListener('click', () => {
            gridBtn.classList.add('active');
            listBtn.classList.remove('active');
            gridContainer.style.display = 'grid';
            listContainer.style.display = 'none';
        });
        listBtn.addEventListener('click', () => {
            listBtn.classList.add('active');
            gridBtn.classList.remove('active');
            gridContainer.style.display = 'none';
        listContainer.style.display = 'block';
    });
};

// Make functions globally available for backward compatibility
window.getTeacherById = getTeacherById;
window.getSubjectById = getSubjectById;
window.getStudentCountBySubject = getStudentCountBySubject;
window.getEvaluationCountBySubject = getEvaluationCountBySubject;
window.getContentCountBySubject = getContentCountBySubject;
window.getStatusText = getStatusText;
// getStudentDisplayEstado is already global from attendance.js/unified-student-management.js
// Only override if Helpers provides it
if (Helpers.getStudentDisplayEstado) {
    window.getStudentDisplayEstado = Helpers.getStudentDisplayEstado;
}
window.parseCourseDivision = parseCourseDivision;
window.capitalizeFirst = capitalizeFirst;
// formatDate is already global from utils.js, only set if Helpers provides it
if (Helpers.formatDate) {
    window.formatDate = Helpers.formatDate;
}
window.getFilteredSubjects = getFilteredSubjects;
window.filterSubjects = filterSubjects;
window.populateCourseDivisionDropdown = populateCourseDivisionDropdown;
window.populateCourseFilter = populateCourseFilter;
window.populateSubjectSelect = populateSubjectSelect;
window.setupScheduleSelector = setupScheduleSelector;
window.addScheduleEntry = addScheduleEntry;
window.updateScheduleHiddenField = updateScheduleHiddenField;
window.resetScheduleSelector = resetScheduleSelector;
window.populateScheduleSelector = populateScheduleSelector;
window.loadSubjects = loadSubjects;
window.setupViewToggle = setupViewToggle;

// Note: Due to the complexity and size of the original file (4410 lines),
// the following functions from the original file still need to be preserved:
// - Content/Themes management functions
// - Evaluations management functions  
// - CSV import/export functions
// - Student assignment functions
// - Subject details view functions
//
// These should be added back from the original file or modularized in future iterations.
// For now, this refactored version provides the core subject management functionality
// with a clear modular structure that can be extended.

/**
 * Initialize subjects module
 * Sets up event listeners and initializes the subjects view
 */
function initializeSubjects() {
    // Prevent multiple initializations
    if (getSubjectsInitialized()) {
        return;
    }
    
    const addSubjectBtn = document.getElementById('addSubjectBtn');
    const subjectModal = document.getElementById('subjectModal');
    const subjectForm = document.getElementById('subjectForm');
    const courseFilter = document.getElementById('subjectsCourseFilter');
    const statusFilter = document.getElementById('subjectsStatusFilter');
    const addContentBtn = document.getElementById('addContentBtn');
    const contentModal = document.getElementById('contentModal');
    const contentForm = document.getElementById('contentForm');

    // Helper function to setup and show modal
    async function setupAndShowModal(modalId) {
        const el = document.getElementById(modalId);
        if (!el) return false;
        
        // If it's the subject modal, populate course dropdown
        if (modalId === 'subjectModal') {
            await populateCourseDivisionDropdown();
            // Hide create new course section by default
            const createNewSection = document.getElementById('createNewCourseSection');
            if (createNewSection) createNewSection.style.display = 'none';
        }
        
        if (typeof setupModalHandlers === 'function') {
            setupModalHandlers(modalId);
        }
        
        if (typeof showModal === 'function') {
            showModal(modalId);
        } else {
            el.classList.add('active');
        }
        return true;
    }

    // Subject management (with safe fallback)
    if (addSubjectBtn) {
        addSubjectBtn.addEventListener('click', () => {
            try {
                // Verify modal exists - retry if necessary
                let modalElement = document.getElementById('subjectModal');
                
                if (!modalElement) {
                    // Try again after a short delay (in case DOM is updating)
                    setTimeout(async () => {
                        modalElement = document.getElementById('subjectModal');
                        if (!modalElement) {
                            alert('Error: No se encontró el formulario de materia. Por favor, recarga la página.');
                            return;
                        }
                        // If found on retry, proceed with opening
                        await setupAndShowModal('subjectModal');
                    }, 100);
                    return;
                }
                
                // Ensure modal handlers are set up (in case they were lost)
                if (typeof setupModalHandlers === 'function') {
                    setupModalHandlers('subjectModal');
                }
                
                // Open modal
                if (typeof showModal === 'function') {
                    showModal('subjectModal');
                } else {
                    modalElement.classList.add('active');
                }
                
                // Reset modal title to "Add Subject"
                const modalTitle = document.querySelector('#subjectModal .modal-header h3');
                if (modalTitle) {
                    modalTitle.textContent = 'Agregar Materia';
                    modalTitle.setAttribute('data-translate', 'add_subject');
                }
                
                // Clear form
                if (typeof resetSubjectForm === 'function') {
                    resetSubjectForm();
                }
            } catch (e) {
                alert('Error al abrir el formulario de materia: ' + e.message);
            }
        });
    }

    if (subjectForm) {
        // Remove previous listener if exists
        const previousHandler = getSubjectFormHandler();
        if (previousHandler) {
            subjectForm.removeEventListener('submit', previousHandler);
        }
        
        // Create new handler function
        const formHandler = (e) => {
            e.preventDefault();
            e.stopPropagation(); // Prevent propagation
            
            if (getIsSubmitting()) {
                return;
            }
            
            if (typeof saveSubject === 'function') {
                saveSubject().catch(err => {
                    alert(err.message || 'Error guardando la materia');
                });
            } else {
                alert('Error: Función saveSubject no está disponible');
            }
        };
        
        // Store handler reference
        setSubjectFormHandler(formHandler);
        
        // Add listener
        subjectForm.addEventListener('submit', formHandler);
        
        // Add validation for classroom (aula) field - only allow numbers
        const classroomInput = document.getElementById('subjectClassroom');
        if (classroomInput) {
            classroomInput.addEventListener('input', function(e) {
                // Remove any non-numeric characters
                this.value = this.value.replace(/[^0-9]/g, '');
            });
            
            // Prevent paste of non-numeric content
            classroomInput.addEventListener('paste', function(e) {
                e.preventDefault();
                const pastedText = (e.clipboardData || window.clipboardData).getData('text');
                const numericOnly = pastedText.replace(/[^0-9]/g, '');
                this.value = numericOnly;
            });
        }
    }
    
    setSubjectsInitialized(true);

    // Content management
    if (addContentBtn) {
        addContentBtn.addEventListener('click', () => {
            // Ensure subject field is visible and enabled when opened from content tab
            const contentSubject = document.getElementById('contentSubject');
            if (contentSubject) {
                contentSubject.style.display = '';
                const contentSubjectGroup = contentSubject.closest('.form-group');
                if (contentSubjectGroup) {
                    contentSubjectGroup.style.display = '';
                }
                if (contentSubject.options.length <= 1) {
                    populateSubjectSelect();
                }
                contentSubject.value = '';
            }
            // Update modal title
            const modalTitle = document.querySelector('#contentModal .modal-header h3');
            if (modalTitle) {
                modalTitle.textContent = 'Agregar Contenido';
                modalTitle.setAttribute('data-translate', 'add_content');
            }
            if (typeof showModal === 'function') {
                showModal('contentModal');
            }
            if (typeof clearContentForm === 'function') {
                clearContentForm();
            }
        });
    }

    if (contentForm) {
        contentForm.addEventListener('submit', (e) => {
            e.preventDefault();
            if (typeof saveContentFromModal === 'function') {
                saveContentFromModal();
            }
        });
    }

    // Filter functionality
    if (courseFilter) {
        courseFilter.addEventListener('change', () => {
            filterSubjects();
        });
    }

    if (statusFilter) {
        statusFilter.addEventListener('change', () => {
            filterSubjects();
        });
    }

    // View toggle functionality
    setupViewToggle('subjectsGridViewBtn', 'subjectsListViewBtn', 'subjectsContainer', 'subjectsList');

    // Modal close handlers
    if (typeof setupModalHandlers === 'function') {
        setupModalHandlers('subjectModal');
    }

    // Schedule selector: Day buttons event listeners
    setupScheduleSelector();

    // Load initial data - wait a bit to ensure appData is loaded
    setTimeout(() => {
        loadSubjects();
        populateSubjectSelect();
        populateCourseFilter();
        
        // Ensure correct initial view is displayed
        const gridBtn = document.getElementById('subjectsGridViewBtn');
        const listBtn = document.getElementById('subjectsListViewBtn');
        const subjectsContainer = document.getElementById('subjectsContainer');
        const subjectsList = document.getElementById('subjectsList');
        
        if (listBtn && listBtn.classList.contains('active')) {
            if (subjectsContainer) subjectsContainer.style.display = 'none';
            if (subjectsList) subjectsList.style.display = 'block';
        } else if (gridBtn && gridBtn.classList.contains('active')) {
            if (subjectsContainer) subjectsContainer.style.display = 'grid';
            if (subjectsList) subjectsList.style.display = 'none';
        } else {
            // Default to list view if no button is active
            if (listBtn) listBtn.classList.add('active');
            if (subjectsContainer) subjectsContainer.style.display = 'none';
            if (subjectsList) subjectsList.style.display = 'block';
        }
    }, 100);
}

window.initializeSubjects = initializeSubjects;

// ============================================================================
// Missing Functions - These need to be implemented or loaded from modules
// ============================================================================

/**
 * Show subject themes panel
 * Navigates to the materia-details section with tabs (temas, evaluaciones, estudiantes)
 * @param {number} subjectId - Subject ID
 */
window.showSubjectThemesPanel = function(subjectId) {
    if (!subjectId) {
        console.error('showSubjectThemesPanel: Subject ID is required');
        return;
    }
    
    const subject = getSubjectById(subjectId);
    if (!subject) {
        console.error('Subject not found:', subjectId);
        alert('No se encontró la materia seleccionada');
        return;
    }
    
    // Store current subject ID
    setCurrentThemesSubjectId(subjectId);
    
    // Navigate to materia-details section instead of opening modal
    if (typeof showSection === 'function') {
        showSection('materia-details');
    } else {
        // Fallback: hide all sections and show materia-details
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.remove('active');
            section.style.display = 'none';
        });
        const materiaDetailsSection = document.getElementById('materia-details');
        if (materiaDetailsSection) {
            materiaDetailsSection.classList.add('active');
            materiaDetailsSection.style.display = 'block';
        }
    }
    
    // Update title
    const titleElement = document.getElementById('materiaDetailsTitle');
    if (titleElement) {
        titleElement.textContent = subject.Nombre;
    }
    
    // Load themes for this subject
    loadSubjectThemesList(subjectId);
    
    // Setup tab handlers
    setupMateriaDetailsTabs(subjectId);
    
    // Setup back button
    const backBtn = document.getElementById('backToSubjectsFromDetailsBtn');
    if (backBtn) {
        backBtn.onclick = function() {
            if (typeof showSection === 'function') {
                showSection('subjects-management');
            } else {
                document.querySelectorAll('.content-section').forEach(section => {
                    section.classList.remove('active');
                    section.style.display = 'none';
                });
                const subjectsSection = document.getElementById('subjects-management');
                if (subjectsSection) {
                    subjectsSection.classList.add('active');
                    subjectsSection.style.display = 'block';
                }
            }
        };
    }
    
    // Ensure temas tab is active by default
    switchToTemasTab();
};

/**
 * Load themes list for a subject
 * @param {number} subjectId - Subject ID
 */
function loadSubjectThemesList(subjectId) {
    const themesList = document.getElementById('subjectThemesList');
    if (!themesList) return;
    
    // Ensure appData is available - use window.appData or window.data
    const data = window.appData || window.data || {};
    
    if (!data.contenido || !Array.isArray(data.contenido)) {
        themesList.innerHTML = '<div style="text-align: center; padding: 20px; color: var(--text-secondary);">Cargando temas...</div>';
        // Retry after a delay
        setTimeout(() => {
            const retryData = window.appData || window.data || {};
            if (retryData.contenido && Array.isArray(retryData.contenido)) {
                loadSubjectThemesList(subjectId);
            } else {
                themesList.innerHTML = '<div style="text-align: center; padding: 20px; color: var(--text-secondary);">No se pudo cargar los temas. Por favor, recarga la página.</div>';
            }
        }, 500);
        return;
    }
    
    // Get themes for this subject
    const themes = data.contenido
        .filter(c => {
            const materiaId = parseInt(c.Materia_ID_materia);
            const subjectIdNum = parseInt(subjectId);
            return materiaId === subjectIdNum;
        })
        .sort((a, b) => {
            const dateA = a.Fecha_creacion ? new Date(a.Fecha_creacion) : new Date(0);
            const dateB = b.Fecha_creacion ? new Date(b.Fecha_creacion) : new Date(0);
            return dateB - dateA;
        });
    
    console.log(`Loading themes for subject ${subjectId}: Found ${themes.length} themes`);
    
    if (themes.length > 0) {
        // Ensure tema_estudiante array exists
        const temaEstudiante = (data.tema_estudiante || []);
        
        themesList.innerHTML = themes.map(theme => {
            // Get students assigned to this tema
            const temaEstudianteRecords = temaEstudiante.filter(
                te => parseInt(te.Contenido_ID_contenido) === parseInt(theme.ID_contenido)
            );
            
            const studentsCount = temaEstudianteRecords.length;
            const uniqueId = `theme-${theme.ID_contenido}`;
            
            return `
                <div class="theme-card-collapsible" style="margin-bottom: 12px; border: 1px solid var(--border-color); border-radius: 8px; background: var(--card-bg); overflow: hidden;">
                    <div class="theme-card-header" onclick="toggleThemeCard('${uniqueId}')" style="padding: 14px 16px; cursor: pointer; display: flex; justify-content: space-between; align-items: center; background: var(--bg-secondary);">
                        <div style="flex: 1; display: flex; align-items: center; gap: 12px;">
                            <i class="fas fa-chevron-down theme-chevron" id="chevron-${uniqueId}" style="font-size: 0.85em; color: var(--text-secondary); transition: transform 0.3s ease; transform: rotate(-90deg);"></i>
                            <div style="flex: 1;">
                                <strong style="display: block; margin-bottom: 4px; color: var(--text-primary); font-size: 1em;">${theme.Tema || 'Sin título'}</strong>
                                <div style="display: flex; gap: 12px; align-items: center; flex-wrap: wrap;">
                                    <span class="status-badge status-${(theme.Estado || 'PENDIENTE').toLowerCase()}" style="font-size: 0.8em; padding: 3px 8px; border-radius: 10px;">
                                        ${getStatusText(theme.Estado || 'PENDIENTE')}
                                    </span>
                                    <span style="font-size: 0.85em; color: var(--text-secondary);">
                                        <i class="fas fa-users" style="margin-right: 4px;"></i>${studentsCount} estudiante${studentsCount !== 1 ? 's' : ''}
                                    </span>
                                    ${theme.Fecha_creacion ? `<small style="color: var(--text-secondary); font-size: 0.8em;">Creado: ${formatDate(theme.Fecha_creacion)}</small>` : ''}
                                </div>
                            </div>
                        </div>
                        <div style="display: flex; gap: 5px;" onclick="event.stopPropagation();">
                            ${typeof editContent === 'function' ? `
                            <button class="btn-icon btn-edit" onclick="editContent(${theme.ID_contenido})" title="Editar Tema" style="padding: 6px 8px;">
                                <i class="fas fa-edit" style="font-size: 0.9em;"></i>
                            </button>` : ''}
                            ${typeof deleteContent === 'function' ? `
                            <button class="btn-icon btn-delete" onclick="deleteContent(${theme.ID_contenido})" title="Eliminar Tema" style="padding: 6px 8px;">
                                <i class="fas fa-trash" style="font-size: 0.9em;"></i>
                            </button>` : ''}
                        </div>
                    </div>
                    <div class="theme-card-content" id="${uniqueId}" style="max-height: 0; overflow: hidden; transition: max-height 0.3s ease;">
                        <div style="padding: 16px; border-top: 1px solid var(--border-color); background: var(--card-bg);">
                            ${theme.Descripcion ? `<div style="font-size: 0.9em; color: var(--text-secondary); margin-bottom: 12px; padding-bottom: 12px; border-bottom: 1px solid var(--border-color);">${theme.Descripcion}</div>` : ''}
                        </div>
                    </div>
                </div>
            `;
        }).join('');
        
        // Setup collapsible cards
        setupCollapsibleThemeCards();
    } else {
        themesList.innerHTML = `
            <div style="text-align: center; padding: 40px 20px; color: var(--text-secondary, #999);">
                <i class="fas fa-book-open" style="font-size: 2.5em; margin-bottom: 15px; opacity: 0.3;"></i>
                <p>No hay temas registrados para esta materia</p>
                <button class="btn-primary" onclick="createThemeForSubject(${subjectId})" style="margin-top: 15px;">
                    <i class="fas fa-plus"></i> Crear Primer Tema
                </button>
            </div>
        `;
    }
}

/**
 * Setup materia details tab handlers
 * @param {number} subjectId - Subject ID
 */
function setupMateriaDetailsTabs(subjectId) {
    // Temas tab button
    const temasTabBtn = document.getElementById('temasTabBtn');
    if (temasTabBtn) {
        temasTabBtn.onclick = function() {
            switchToTemasTab();
        };
    }
    
    // Evaluaciones tab button
    const evaluacionesTabBtn = document.getElementById('evaluacionesTabBtn');
    if (evaluacionesTabBtn) {
        evaluacionesTabBtn.onclick = function() {
            switchToEvaluacionesTab(subjectId);
        };
    }
    
    // Estudiantes tab button
    const estudiantesTabBtn = document.getElementById('estudiantesTabBtn');
    if (estudiantesTabBtn) {
        estudiantesTabBtn.onclick = function() {
            switchToEstudiantesTab(subjectId);
        };
    }
    
    // Setup create theme button
    const showCreateBtn = document.getElementById('showCreateThemeFormBtn');
    if (showCreateBtn) {
        showCreateBtn.onclick = function() {
            createThemeForSubject(subjectId);
        };
    }
    
    // Setup import temas button
    const importTemasBtn = document.getElementById('importTemasBtn');
    if (importTemasBtn) {
        // Check if handler already attached
        if (importTemasBtn.dataset.handlerAttached === 'true') {
            return; // Already set up
        }
        
        importTemasBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            console.log('Import Temas button clicked, subjectId:', subjectId);
            
            // Store current subject ID for the import function
            const modal = document.getElementById('importTemasModal');
            if (!modal) {
                console.error('importTemasModal not found in DOM');
                return;
            }
            
            console.log('Opening importTemasModal');
            // Set subject ID in modal data attribute
            modal.dataset.subjectId = subjectId;
            
            // Force modal to be visible
            // First ensure display is not set to none
            if (modal.style.display === 'none') {
                modal.style.display = '';
            }
            
            // Add active class (CSS will handle display: block)
            modal.classList.add('active');
            
            // Also call showModal if available (it might do additional setup)
            if (typeof showModal === 'function') {
                showModal('importTemasModal');
            }
            
            // Double-check it's visible after a brief delay
            setTimeout(() => {
                const computed = window.getComputedStyle(modal);
                console.log('Modal state - display:', computed.display, 'opacity:', computed.opacity, 'has active class:', modal.classList.contains('active'));
                if (computed.display === 'none' || computed.opacity === '0') {
                    console.warn('Modal not visible, forcing display');
                    modal.style.display = 'block';
                    modal.style.opacity = '1';
                }
            }, 50);
            
            // Setup modal handlers
            if (typeof setupModalHandlers === 'function') {
                setupModalHandlers('importTemasModal');
            }
            
            // Ensure body scroll is disabled
            document.body.style.overflow = 'hidden';
        }, { once: false });
        
        // Mark as attached
        importTemasBtn.dataset.handlerAttached = 'true';
    } else {
        console.warn('importTemasBtn not found in DOM');
    }
    
    // Setup add student to materia button
    const addStudentToMateriaBtn = document.getElementById('addStudentToMateriaBtn');
    if (addStudentToMateriaBtn) {
        addStudentToMateriaBtn.onclick = function() {
            // Set flag so student modal knows which materia to pre-select
            window.createStudentForMateriaId = subjectId;
            
            // Open student modal directly without navigating away
            // The modal can be opened from any section
            if (typeof showModal === 'function') {
                showModal('studentModal');
            } else {
                const modal = document.getElementById('studentModal');
                if (modal) {
                    modal.classList.add('active');
                    modal.style.display = 'flex';
                }
            }
            
            // Setup modal handlers if needed
            if (typeof setupModalHandlers === 'function') {
                setupModalHandlers('studentModal');
            }
        };
    }
    
    // Setup import estudiantes button - use loadCourseDivisionModal
    const importEstudiantesBtn = document.getElementById('importEstudiantesBtn');
    if (importEstudiantesBtn) {
        importEstudiantesBtn.onclick = function() {
            // Store current subject ID for the import function
            const modal = document.getElementById('loadCourseDivisionModal');
            if (modal) {
                // Set subject ID in modal data attribute
                modal.dataset.subjectId = subjectId;
                
                // Get the subject to pre-select its course/division
                const subject = getSubjectById(subjectId);
                if (subject && subject.Curso_division) {
                    // Pre-select the course/division in the modal
                    const bulkCourseDivision = document.getElementById('bulkCourseDivision');
                    if (bulkCourseDivision) {
                        // Try to find and select the matching course
                        setTimeout(() => {
                            const options = bulkCourseDivision.querySelectorAll('option');
                            for (let option of options) {
                                if (option.value === subject.Curso_division || option.textContent.includes(subject.Curso_division)) {
                                    bulkCourseDivision.value = option.value;
                                    break;
                                }
                            }
                        }, 100);
                    }
                }
                
                // Open modal
                if (typeof showModal === 'function') {
                    showModal('loadCourseDivisionModal');
                } else {
                    modal.classList.add('active');
                }
                
                // Setup modal handlers
                if (typeof setupModalHandlers === 'function') {
                    setupModalHandlers('loadCourseDivisionModal');
                }
            }
        };
    }
    
    // Setup create evaluacion button
    const showCreateEvaluacionBtn = document.getElementById('showCreateEvaluacionFormBtn');
    if (showCreateEvaluacionBtn) {
        showCreateEvaluacionBtn.onclick = function() {
            showCreateEvaluacionForm(subjectId);
        };
    }
    
    // Setup import evaluaciones button - similar to loadCourseDivisionModal
    const importEvaluacionesBtn = document.getElementById('importEvaluacionesBtn');
    if (importEvaluacionesBtn) {
        importEvaluacionesBtn.onclick = function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            console.log('Import Evaluaciones button clicked (from setupMateriaDetailsTabs), subjectId:', subjectId);
            
            // Store current subject ID for the import function
            const modal = document.getElementById('importEvaluacionesModal');
            if (!modal) {
                console.error('importEvaluacionesModal not found in DOM');
                alert('Error: Modal de importación no encontrado');
                return;
            }
            
            // Set subject ID in modal data attribute
            modal.dataset.subjectId = subjectId;
            
            // Open modal using showModal function (same as loadCourseDivisionModal)
            try {
                if (typeof showModal === 'function') {
                    showModal('importEvaluacionesModal');
                } else {
                    // Fallback: manually show modal
                    modal.style.display = '';
                    modal.classList.add('active');
                }
                
                // Setup modal handlers
                if (typeof setupModalHandlers === 'function') {
                    setupModalHandlers('importEvaluacionesModal');
                }
                
                // Ensure body scroll is disabled
                document.body.style.overflow = 'hidden';
                
                console.log('Modal opened successfully');
            } catch (error) {
                console.error('Error opening modal:', error);
                alert('Error al abrir el modal de importación');
            }
        };
    }
    
    // Setup back to evaluaciones list button
    const backToEvaluacionesBtn = document.getElementById('backToEvaluacionesListBtn');
    if (backToEvaluacionesBtn) {
        backToEvaluacionesBtn.onclick = function() {
            const evaluacionesList = document.getElementById('subjectEvaluacionesList');
            const createEvaluacionFormView = document.getElementById('createEvaluacionFormView');
            if (evaluacionesList) evaluacionesList.style.display = 'block';
            if (createEvaluacionFormView) {
                createEvaluacionFormView.style.display = 'none';
            }
        };
    }
    
    // Setup evaluacion form submit handler
    const evaluacionForm = document.getElementById('evaluacionForm');
    if (evaluacionForm) {
        evaluacionForm.onsubmit = function(e) {
            e.preventDefault();
            if (typeof saveEvaluacion === 'function') {
                saveEvaluacion();
            } else {
                alert('Función saveEvaluacion no está disponible');
            }
        };
    }
}

/**
 * Switch to Temas tab
 */
function switchToTemasTab() {
    const temasTabBtn = document.getElementById('temasTabBtn');
    const evaluacionesTabBtn = document.getElementById('evaluacionesTabBtn');
    const estudiantesTabBtn = document.getElementById('estudiantesTabBtn');
    const temasTabContent = document.getElementById('temasTabContent');
    const evaluacionesTabContent = document.getElementById('evaluacionesTabContent');
    const estudiantesTabContent = document.getElementById('estudiantesTabContent');
    
    // Update tab buttons
    if (temasTabBtn) temasTabBtn.classList.add('active');
    if (evaluacionesTabBtn) evaluacionesTabBtn.classList.remove('active');
    if (estudiantesTabBtn) estudiantesTabBtn.classList.remove('active');
    
    // Update tab content
    if (temasTabContent) {
        temasTabContent.classList.add('active');
        temasTabContent.style.display = 'block';
    }
    if (evaluacionesTabContent) {
        evaluacionesTabContent.classList.remove('active');
        evaluacionesTabContent.style.display = 'none';
    }
    if (estudiantesTabContent) {
        estudiantesTabContent.classList.remove('active');
        estudiantesTabContent.style.display = 'none';
    }
    
    // Setup import temas button handler
    const subjectId = getCurrentThemesSubjectId();
    if (subjectId) {
        const importTemasBtn = document.getElementById('importTemasBtn');
        if (importTemasBtn) {
            // Remove existing onclick handler if any
            importTemasBtn.onclick = null;
            
            importTemasBtn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                console.log('Import Temas button clicked (from switchToTemasTab), subjectId:', subjectId);
                
                const modal = document.getElementById('importTemasModal');
                if (modal) {
                    modal.dataset.subjectId = subjectId;
                    
                    // Force modal to be visible
                    if (modal.style.display === 'none') {
                        modal.style.display = '';
                    }
                    
                    // Add active class (CSS will handle display: block)
                    modal.classList.add('active');
                    
                    // Also call showModal if available
                    if (typeof showModal === 'function') {
                        showModal('importTemasModal');
                    }
                    
                    if (typeof setupModalHandlers === 'function') {
                        setupModalHandlers('importTemasModal');
                    }
                    
                    // Ensure body scroll is disabled
                    document.body.style.overflow = 'hidden';
                    
                    // Double-check it's visible
                    setTimeout(() => {
                        const computed = window.getComputedStyle(modal);
                        if (computed.display === 'none' || computed.opacity === '0') {
                            modal.style.display = 'block';
                            modal.style.opacity = '1';
                        }
                    }, 50);
                } else {
                    console.error('importTemasModal not found in DOM');
                }
            }, { once: false });
        }
    }
}

/**
 * Switch to Evaluaciones tab
 * @param {number} subjectId - Subject ID
 */
function switchToEvaluacionesTab(subjectId) {
    const temasTabBtn = document.getElementById('temasTabBtn');
    const evaluacionesTabBtn = document.getElementById('evaluacionesTabBtn');
    const estudiantesTabBtn = document.getElementById('estudiantesTabBtn');
    const temasTabContent = document.getElementById('temasTabContent');
    const evaluacionesTabContent = document.getElementById('evaluacionesTabContent');
    const estudiantesTabContent = document.getElementById('estudiantesTabContent');
    
    // Update tab buttons
    if (temasTabBtn) temasTabBtn.classList.remove('active');
    if (evaluacionesTabBtn) evaluacionesTabBtn.classList.add('active');
    if (estudiantesTabBtn) estudiantesTabBtn.classList.remove('active');
    
    // Update tab content
    if (temasTabContent) {
        temasTabContent.classList.remove('active');
        temasTabContent.style.display = 'none';
    }
    if (evaluacionesTabContent) {
        evaluacionesTabContent.classList.add('active');
        evaluacionesTabContent.style.display = 'block';
    }
    if (estudiantesTabContent) {
        estudiantesTabContent.classList.remove('active');
        estudiantesTabContent.style.display = 'none';
    }
    
    // Load evaluaciones when switching to this tab
    if (subjectId && typeof loadSubjectEvaluaciones === 'function') {
        loadSubjectEvaluaciones(subjectId);
    }
    
    // Setup button handlers for this tab
    const showCreateEvaluacionBtn = document.getElementById('showCreateEvaluacionFormBtn');
    if (showCreateEvaluacionBtn) {
        showCreateEvaluacionBtn.onclick = function() {
            showCreateEvaluacionForm(subjectId);
        };
    }
    
    // Setup import evaluaciones button - similar to loadCourseDivisionModal
    const importEvaluacionesBtn = document.getElementById('importEvaluacionesBtn');
    if (importEvaluacionesBtn) {
        // Use onclick for simplicity (same pattern as other buttons)
        importEvaluacionesBtn.onclick = function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            console.log('Import Evaluaciones button clicked, subjectId:', subjectId);
            
            // Store current subject ID for the import function
            const modal = document.getElementById('importEvaluacionesModal');
            if (!modal) {
                console.error('importEvaluacionesModal not found in DOM');
                alert('Error: Modal de importación no encontrado');
                return;
            }
            
            // Set subject ID in modal data attribute
            modal.dataset.subjectId = subjectId;
            
            // Open modal using showModal function (same as loadCourseDivisionModal)
            try {
                if (typeof showModal === 'function') {
                    showModal('importEvaluacionesModal');
                } else {
                    // Fallback: manually show modal
                    modal.style.display = '';
                    modal.classList.add('active');
                }
                
                // Setup modal handlers
                if (typeof setupModalHandlers === 'function') {
                    setupModalHandlers('importEvaluacionesModal');
                }
                
                // Ensure body scroll is disabled
                document.body.style.overflow = 'hidden';
                
                console.log('Modal opened successfully');
            } catch (error) {
                console.error('Error opening modal:', error);
                alert('Error al abrir el modal de importación');
            }
        };
    } else {
        console.warn('importEvaluacionesBtn not found in DOM');
    }
    
    // Setup back to evaluaciones list button
    const backToEvaluacionesBtn = document.getElementById('backToEvaluacionesListBtn');
    if (backToEvaluacionesBtn) {
        backToEvaluacionesBtn.onclick = function() {
            const evaluacionesList = document.getElementById('subjectEvaluacionesList');
            const createEvaluacionFormView = document.getElementById('createEvaluacionFormView');
            if (evaluacionesList) evaluacionesList.style.display = 'block';
            if (createEvaluacionFormView) {
                createEvaluacionFormView.style.display = 'none';
            }
        };
    }
    
    // Setup evaluacion form submit handler
    const evaluacionForm = document.getElementById('evaluacionForm');
    if (evaluacionForm) {
        evaluacionForm.onsubmit = function(e) {
            e.preventDefault();
            if (typeof saveEvaluacion === 'function') {
                saveEvaluacion();
            } else {
                alert('Función saveEvaluacion no está disponible');
            }
        };
    }
}

/**
 * Switch to Estudiantes tab
 * @param {number} subjectId - Subject ID
 */
function switchToEstudiantesTab(subjectId) {
    const temasTabBtn = document.getElementById('temasTabBtn');
    const evaluacionesTabBtn = document.getElementById('evaluacionesTabBtn');
    const estudiantesTabBtn = document.getElementById('estudiantesTabBtn');
    const temasTabContent = document.getElementById('temasTabContent');
    const evaluacionesTabContent = document.getElementById('evaluacionesTabContent');
    const estudiantesTabContent = document.getElementById('estudiantesTabContent');
    
    // Update tab buttons
    if (temasTabBtn) temasTabBtn.classList.remove('active');
    if (evaluacionesTabBtn) evaluacionesTabBtn.classList.remove('active');
    if (estudiantesTabBtn) estudiantesTabBtn.classList.add('active');
    
    // Update tab content
    if (temasTabContent) {
        temasTabContent.classList.remove('active');
        temasTabContent.style.display = 'none';
    }
    if (evaluacionesTabContent) {
        evaluacionesTabContent.classList.remove('active');
        evaluacionesTabContent.style.display = 'none';
    }
    if (estudiantesTabContent) {
        estudiantesTabContent.classList.add('active');
        estudiantesTabContent.style.display = 'block';
    }
    
    // Load students when switching to this tab
    if (subjectId && typeof loadMateriaStudents === 'function') {
        loadMateriaStudents(subjectId);
    }
    
    // Setup add student button handler
    const addStudentToMateriaBtn = document.getElementById('addStudentToMateriaBtn');
    if (addStudentToMateriaBtn) {
        addStudentToMateriaBtn.onclick = function() {
            // Set flag so student modal knows which materia to pre-select
            window.createStudentForMateriaId = subjectId;
            
            // Open student modal directly without navigating away
            // The modal can be opened from any section
            if (typeof showModal === 'function') {
                showModal('studentModal');
            } else {
                const modal = document.getElementById('studentModal');
                if (modal) {
                    modal.classList.add('active');
                    modal.style.display = 'flex';
                }
            }
            
            // Setup modal handlers if needed
            if (typeof setupModalHandlers === 'function') {
                setupModalHandlers('studentModal');
            }
        };
    }
    
    // Setup import estudiantes button - use loadCourseDivisionModal
    const importEstudiantesBtn = document.getElementById('importEstudiantesBtn');
    if (importEstudiantesBtn) {
        importEstudiantesBtn.onclick = function() {
            // Store current subject ID for the import function
            const modal = document.getElementById('loadCourseDivisionModal');
            if (modal) {
                // Set subject ID in modal data attribute
                modal.dataset.subjectId = subjectId;
                
                // Get the subject to pre-select its course/division
                const subject = getSubjectById(subjectId);
                if (subject && subject.Curso_division) {
                    // Pre-select the course/division in the modal
                    const bulkCourseDivision = document.getElementById('bulkCourseDivision');
                    if (bulkCourseDivision) {
                        // Try to find and select the matching course
                        setTimeout(() => {
                            const options = bulkCourseDivision.querySelectorAll('option');
                            for (let option of options) {
                                if (option.value === subject.Curso_division || option.textContent.includes(subject.Curso_division)) {
                                    bulkCourseDivision.value = option.value;
                                    break;
                                }
                            }
                        }, 100);
                    }
                }
                
                // Open modal
                if (typeof showModal === 'function') {
                    showModal('loadCourseDivisionModal');
                } else {
                    modal.classList.add('active');
                }
                
                // Setup modal handlers
                if (typeof setupModalHandlers === 'function') {
                    setupModalHandlers('loadCourseDivisionModal');
                }
            }
        };
    }
}

/**
 * Setup collapsible theme cards
 */
function setupCollapsibleThemeCards() {
    const themeCards = document.querySelectorAll('.theme-card-content');
    themeCards.forEach(card => {
        card.style.maxHeight = '0px';
        card.classList.remove('expanded');
    });
}

/**
 * Toggle theme card expand/collapse
 * @param {string} cardId - Card ID
 */
window.toggleThemeCard = function(cardId) {
    const content = document.getElementById(cardId);
    const chevron = document.getElementById(`chevron-${cardId}`);
    if (!content) return;
    
    const isExpanded = content.classList.contains('expanded');
    
    if (isExpanded) {
        // Collapse
        content.style.maxHeight = '0px';
        content.classList.remove('expanded');
        if (chevron) {
            chevron.style.transform = 'rotate(-90deg)';
        }
    } else {
        // Expand
        const currentMaxHeight = content.style.maxHeight;
        content.style.maxHeight = 'none';
        const scrollHeight = content.scrollHeight;
        content.style.maxHeight = currentMaxHeight;
        
        // Force reflow
        content.offsetHeight;
        
        // Now animate to full height
        content.style.maxHeight = scrollHeight + 'px';
        content.classList.add('expanded');
        if (chevron) {
            chevron.style.transform = 'rotate(0deg)';
        }
        
        // After animation completes, set to none for dynamic content
        setTimeout(() => {
            if (content.classList.contains('expanded')) {
                content.style.maxHeight = 'none';
            }
        }, 300);
    }
};

/**
 * Create theme for subject - Opens modal dialog
 * @param {number} subjectId - Subject ID
 */
window.createThemeForSubject = function(subjectId) {
    if (!subjectId) {
        subjectId = getCurrentThemesSubjectId();
    }
    
    if (!subjectId) {
        alert('Error: ID de materia no válido');
        return;
    }
    
    const subject = getSubjectById(subjectId);
    if (!subject) {
        alert('Error: No se encontró la materia seleccionada');
        return;
    }
    
    // Store current subject ID
    setCurrentThemesSubjectId(subjectId);
    
    // Open content modal
    const modal = document.getElementById('contentModal');
    if (!modal) {
        alert('Error: Modal de contenido no encontrado');
        return;
    }
    
    // Update modal title
    const modalTitle = modal.querySelector('.modal-dialog-header h3');
    if (modalTitle) {
        modalTitle.textContent = 'Crear Tema';
        modalTitle.setAttribute('data-translate', 'add_content');
    }
    
    // Reset form
    const contentForm = document.getElementById('contentForm');
    if (contentForm) {
        contentForm.reset();
    }
    
    // Set subject in dropdown (hide it and pre-select)
    const contentSubject = document.getElementById('contentSubject');
    if (contentSubject) {
        // Hide the subject field since we already know which subject
        contentSubject.style.display = 'none';
        const subjectGroup = contentSubject.closest('.form-group');
        if (subjectGroup) {
            subjectGroup.style.display = 'none';
        }
        // Set the value
        contentSubject.value = subjectId;
    }
    
    // Set default status
    const contentStatus = document.getElementById('contentStatus');
    if (contentStatus) {
        contentStatus.value = 'PENDIENTE';
    }
    
    // Setup form submit handler
    if (contentForm) {
        // Remove previous handler
        const newForm = contentForm.cloneNode(true);
        contentForm.parentNode.replaceChild(newForm, contentForm);
        
        // Add new handler
        const newContentForm = document.getElementById('contentForm');
        newContentForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            if (typeof saveContentFromModal === 'function') {
                await saveContentFromModal();
                // Reload themes list after saving
                const currentId = getCurrentThemesSubjectId();
                if (currentId) {
                    loadSubjectThemesList(currentId);
                }
            } else {
                alert('Función saveContentFromModal no está disponible');
            }
        });
    }
    
    // Show modal
    if (typeof showModal === 'function') {
        showModal('contentModal');
    } else {
        modal.classList.add('active');
    }
};

/**
 * Close subject themes panel
 */
window.closeSubjectThemesPanel = function() {
    const panel = document.getElementById('subjectThemesPanel');
    if (panel) {
        panel.style.display = 'none';
    }
    const modal = document.getElementById('subjectThemesModal');
    if (modal) {
        if (typeof closeModal === 'function') {
            closeModal('subjectThemesModal');
        } else {
            modal.classList.remove('active');
        }
    }
    // Navigate back to subjects management
    if (typeof showSection === 'function') {
        showSection('subjects-management');
    }
};

/**
 * Load evaluaciones for a subject
 * @param {number} subjectId - Subject ID
 */
window.loadSubjectEvaluaciones = async function(subjectId) {
    const evaluacionesList = document.getElementById('subjectEvaluacionesList');
    if (!evaluacionesList) {
        console.error('subjectEvaluacionesList element not found');
        return;
    }
    
    // Show loading state
    evaluacionesList.innerHTML = '<div style="text-align: center; padding: 20px; color: var(--text-secondary);">Cargando evaluaciones...</div>';
    
    // Get evaluaciones from window.appData or window.data
    const data = window.appData || window.data || {};
    let evaluaciones = [];
    
    if (data.evaluacion && Array.isArray(data.evaluacion)) {
        evaluaciones = data.evaluacion
            .filter(e => {
                const materiaId = parseInt(e.Materia_ID_materia);
                const subjectIdNum = parseInt(subjectId);
                return materiaId === subjectIdNum;
            })
            .sort((a, b) => {
                const dateA = a.Fecha ? new Date(a.Fecha) : new Date(0);
                const dateB = b.Fecha ? new Date(b.Fecha) : new Date(0);
                return dateB - dateA;
            });
    }
    
    console.log(`Loading evaluaciones for subject ${subjectId}: Found ${evaluaciones.length} evaluaciones`);
    
    // Display evaluaciones
    if (evaluaciones.length > 0) {
        const tipoLabels = {
            'EXAMEN': 'Examen',
            'PARCIAL': 'Parcial',
            'TRABAJO_PRACTICO': 'Trabajo Práctico',
            'PROYECTO': 'Proyecto',
            'ORAL': 'Oral',
            'PRACTICO': 'Práctico'
        };
        
        const estadoLabels = {
            'PROGRAMADA': 'Programada',
            'EN_CURSO': 'En Curso',
            'FINALIZADA': 'Finalizada',
            'CANCELADA': 'Cancelada'
        };
        
        evaluacionesList.innerHTML = evaluaciones.map(eval => {
            const fecha = eval.Fecha ? formatDate(eval.Fecha) : 'Sin fecha';
            
            return `
                <div style="margin-bottom: 12px; border: 1px solid var(--border-color); border-radius: 8px; background: var(--card-bg); padding: 14px 16px;">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                        <div style="flex: 1;">
                            <strong style="display: block; margin-bottom: 6px; color: var(--text-primary); font-size: 1em;">${eval.Titulo || 'Sin título'}</strong>
                            ${eval.Descripcion ? `<p style="font-size: 0.9em; color: var(--text-secondary); margin: 6px 0;">${eval.Descripcion}</p>` : ''}
                            <div style="display: flex; gap: 12px; align-items: center; flex-wrap: wrap; margin-top: 8px;">
                                <span class="status-badge" style="font-size: 0.8em; padding: 3px 8px; border-radius: 10px; background: #667eea; color: white;">
                                    ${tipoLabels[eval.Tipo] || eval.Tipo}
                                </span>
                                <span class="status-badge status-${(eval.Estado || 'PROGRAMADA').toLowerCase()}" style="font-size: 0.8em; padding: 3px 8px; border-radius: 10px;">
                                    ${estadoLabels[eval.Estado] || eval.Estado}
                                </span>
                                <span style="font-size: 0.85em; color: var(--text-secondary);">
                                    <i class="fas fa-calendar" style="margin-right: 4px;"></i>${fecha}
                                </span>
                            </div>
                        </div>
                        <div style="display: flex; gap: 5px;" onclick="event.stopPropagation();">
                            ${typeof editEvaluacion === 'function' ? `
                            <button class="btn-icon btn-edit" onclick="editEvaluacion(${eval.ID_evaluacion})" title="Editar" style="padding: 6px 8px;">
                                <i class="fas fa-edit"></i>
                            </button>` : ''}
                            ${typeof deleteEvaluacion === 'function' ? `
                            <button class="btn-icon btn-delete" onclick="deleteEvaluacion(${eval.ID_evaluacion})" title="Eliminar" style="padding: 6px 8px;">
                                <i class="fas fa-trash"></i>
                            </button>` : ''}
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    } else {
        evaluacionesList.innerHTML = '<div style="text-align: center; padding: 40px 20px; color: var(--text-secondary, #999);">No hay evaluaciones registradas</div>';
    }
};

/**
 * Load students for a materia
 * @param {number} subjectId - Subject ID
 */
window.loadMateriaStudents = function(subjectId) {
    const studentsList = document.getElementById('materiaStudentsList');
    if (!studentsList) {
        console.error('materiaStudentsList element not found');
        return;
    }
    
    // Show loading state
    studentsList.innerHTML = '<div style="text-align: center; padding: 20px; color: var(--text-secondary);">Cargando estudiantes...</div>';
    
    // Get data from window.appData or window.data
    const data = window.appData || window.data || {};
    
    // Get students enrolled in this materia
    let enrolledStudents = [];
    
    if (data.alumnos_x_materia && Array.isArray(data.alumnos_x_materia) &&
        data.estudiante && Array.isArray(data.estudiante)) {
        
        const enrolledStudentIds = data.alumnos_x_materia
            .filter(axm => {
                const materiaId = parseInt(axm.Materia_ID_materia);
                const subjectIdNum = parseInt(subjectId);
                return materiaId === subjectIdNum;
            })
            .map(axm => parseInt(axm.Estudiante_ID_Estudiante));
        
        enrolledStudents = data.estudiante
            .filter(student => enrolledStudentIds.includes(parseInt(student.ID_Estudiante)))
            .sort((a, b) => {
                const lastNameA = (a.Apellido || '').toLowerCase();
                const lastNameB = (b.Apellido || '').toLowerCase();
                if (lastNameA !== lastNameB) {
                    return lastNameA.localeCompare(lastNameB);
                }
                return (a.Nombre || '').toLowerCase().localeCompare((b.Nombre || '').toLowerCase());
            });
    }
    
    console.log(`Loading students for subject ${subjectId}: Found ${enrolledStudents.length} students`);
    
    // Display students
    if (enrolledStudents.length > 0) {
        studentsList.innerHTML = `
            <table style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr style="background: var(--bg-secondary, #f5f5f5); border-bottom: 2px solid var(--border-color, #ddd);">
                        <th style="padding: 12px; text-align: left; font-weight: 600;">Estudiante</th>
                        <th style="padding: 12px; text-align: left; font-weight: 600;">ID</th>
                        <th style="padding: 12px; text-align: left; font-weight: 600;">Estado</th>
                    </tr>
                </thead>
                <tbody>
                    ${enrolledStudents.map(student => {
                        const displayEstado = typeof getStudentDisplayEstado === 'function' 
                            ? getStudentDisplayEstado(student) 
                            : (student.Estado || 'ACTIVO');
                        
                        return `
                            <tr>
                                <td style="padding: 12px; border-bottom: 1px solid var(--border-color, #ddd);">
                                    <strong>${student.Nombre} ${student.Apellido}</strong>
                                </td>
                                <td style="padding: 12px; border-bottom: 1px solid var(--border-color, #ddd);">
                                    ${student.ID_Estudiante || 'N/A'}
                                </td>
                                <td style="padding: 12px; border-bottom: 1px solid var(--border-color, #ddd);">
                                    <span class="status-badge status-${displayEstado.toLowerCase()}" style="font-size: 0.8em; padding: 3px 8px; border-radius: 10px;">
                                        ${displayEstado}
                                    </span>
                                </td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        `;
    } else {
        studentsList.innerHTML = '<div style="text-align: center; padding: 40px 20px; color: var(--text-secondary, #999);">No hay estudiantes inscritos en esta materia</div>';
    }
};

/**
 * Show create evaluacion form - Opens modal dialog
 * @param {number} subjectId - Subject ID
 */
window.showCreateEvaluacionForm = function(subjectId) {
    if (!subjectId) {
        subjectId = getCurrentThemesSubjectId();
    }
    
    if (!subjectId) {
        alert('Error: ID de materia no válido');
        return;
    }
    
    // Check if evaluacion modal exists, if not create it dynamically
    let modal = document.getElementById('evaluacionModal');
    if (!modal) {
        modal = createEvaluacionModal();
    }
    
    // Reset form
    const evaluacionForm = modal.querySelector('#evaluacionForm');
    if (evaluacionForm) {
        evaluacionForm.reset();
    }
    
    // Set subject ID in hidden field
    let evaluacionSubjectId = modal.querySelector('#evaluacionSubjectId');
    if (!evaluacionSubjectId) {
        // Create hidden input if it doesn't exist
        evaluacionSubjectId = document.createElement('input');
        evaluacionSubjectId.type = 'hidden';
        evaluacionSubjectId.id = 'evaluacionSubjectId';
        if (evaluacionForm) {
            evaluacionForm.insertBefore(evaluacionSubjectId, evaluacionForm.firstChild);
        }
    }
    evaluacionSubjectId.value = subjectId;
    
    // Set default values
    const evaluacionEstado = modal.querySelector('#evaluacionEstado');
    if (evaluacionEstado) {
        evaluacionEstado.value = 'PROGRAMADA';
    }
    
    const evaluacionPeso = modal.querySelector('#evaluacionPeso');
    if (evaluacionPeso) {
        evaluacionPeso.value = '1.00';
    }
    
    const evaluacionTipo = modal.querySelector('#evaluacionTipo');
    if (evaluacionTipo) {
        evaluacionTipo.value = 'EXAMEN';
    }
    
    // Set today's date as default
    const evaluacionFecha = modal.querySelector('#evaluacionFecha');
    if (evaluacionFecha) {
        const today = new Date().toISOString().split('T')[0];
        evaluacionFecha.value = today;
    }
    
    // Setup form submit handler
    if (evaluacionForm) {
        // Remove previous handler
        const newForm = evaluacionForm.cloneNode(true);
        evaluacionForm.parentNode.replaceChild(newForm, evaluacionForm);
        
        // Add new handler
        const newEvaluacionForm = modal.querySelector('#evaluacionForm');
        newEvaluacionForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            if (typeof saveEvaluacion === 'function') {
                await saveEvaluacion();
                // Reload evaluaciones list after saving
                const currentId = getCurrentThemesSubjectId();
                if (currentId) {
                    loadSubjectEvaluaciones(currentId);
                }
            } else {
                alert('Función saveEvaluacion no está disponible');
            }
        });
    }
    
    // Show modal
    if (typeof showModal === 'function') {
        showModal(modal.id);
    } else {
        modal.classList.add('active');
    }
};

/**
 * Create evaluacion modal dynamically if it doesn't exist
 */
function createEvaluacionModal() {
    // Check if it already exists
    let modal = document.getElementById('evaluacionModal');
    if (modal) return modal;
    
    // Create modal structure
    modal = document.createElement('div');
    modal.id = 'evaluacionModal';
    modal.className = 'modal-overlay';
    
    modal.innerHTML = `
        <div class="modal-dialog">
            <div class="modal-dialog-content">
                <div class="modal-dialog-header">
                    <h3 data-translate="add_evaluacion">Crear Evaluación</h3>
                    <button class="modal-dialog-close close-modal">&times;</button>
                </div>
                <form id="evaluacionForm" class="modal-dialog-body">
                    <input type="hidden" id="evaluacionSubjectId" value="">
                    <div class="form-group">
                        <label for="evaluacionTitulo" data-translate="title">Título</label>
                        <input type="text" id="evaluacionTitulo" required>
                    </div>
                    <div class="form-group">
                        <label for="evaluacionDescripcion" data-translate="description">Descripción</label>
                        <textarea id="evaluacionDescripcion" rows="3" placeholder="Descripción de la evaluación..."></textarea>
                    </div>
                    <div class="form-group">
                        <label for="evaluacionFecha" data-translate="date">Fecha</label>
                        <input type="date" id="evaluacionFecha" required>
                    </div>
                    <div class="form-group">
                        <label for="evaluacionTipo" data-translate="type">Tipo</label>
                        <select id="evaluacionTipo" required>
                            <option value="EXAMEN" data-translate="exam">Examen</option>
                            <option value="PARCIAL" data-translate="partial">Parcial</option>
                            <option value="TRABAJO_PRACTICO" data-translate="practical_work">Trabajo Práctico</option>
                            <option value="PROYECTO" data-translate="project">Proyecto</option>
                            <option value="ORAL" data-translate="oral">Oral</option>
                            <option value="PRACTICO" data-translate="practical">Práctico</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="evaluacionPeso" data-translate="weight">Peso</label>
                        <input type="number" id="evaluacionPeso" min="0" max="9.99" step="0.01" value="1.00" required>
                    </div>
                    <div class="form-group">
                        <label for="evaluacionEstado" data-translate="status">Estado</label>
                        <select id="evaluacionEstado">
                            <option value="PROGRAMADA" data-translate="scheduled">Programada</option>
                            <option value="EN_CURSO" data-translate="in_progress">En Curso</option>
                            <option value="FINALIZADA" data-translate="finished">Finalizada</option>
                            <option value="CANCELADA" data-translate="cancelled">Cancelada</option>
                        </select>
                    </div>
                    <div class="modal-dialog-footer">
                        <button type="button" class="btn-secondary close-modal" data-translate="cancel">Cancelar</button>
                        <button type="submit" class="btn-primary" data-translate="save">Guardar Evaluación</button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    // Append to body
    document.body.appendChild(modal);
    
    // Setup modal handlers
    if (typeof setupModalHandlers === 'function') {
        setupModalHandlers('evaluacionModal');
    }
    
    return modal;
}

/**
 * Save evaluacion
 */
window.saveEvaluacion = async function() {
    // Get modal
    const modal = document.getElementById('evaluacionModal');
    if (!modal) {
        alert('Error: Modal de evaluación no encontrado');
        return;
    }
    
    const subjectId = modal.querySelector('#evaluacionSubjectId')?.value;
    const titulo = modal.querySelector('#evaluacionTitulo')?.value.trim();
    const descripcion = modal.querySelector('#evaluacionDescripcion')?.value.trim();
    const fecha = modal.querySelector('#evaluacionFecha')?.value;
    const tipo = modal.querySelector('#evaluacionTipo')?.value;
    const peso = parseFloat(modal.querySelector('#evaluacionPeso')?.value || '1.00');
    const estado = modal.querySelector('#evaluacionEstado')?.value || 'PROGRAMADA';
    
    // Validation
    if (!subjectId || !titulo || !fecha || !tipo) {
        alert('Por favor, complete todos los campos requeridos (Título, Fecha, Tipo)');
        return;
    }
    
    const payload = {
        Titulo: titulo,
        Descripcion: descripcion || null,
        Fecha: fecha,
        Tipo: tipo,
        Peso: peso,
        Estado: estado,
        Materia_ID_materia: parseInt(subjectId)
    };
    
    try {
        const isInPages = window.location.pathname.includes('/pages/');
        const baseUrl = isInPages ? '../api' : 'api';
        
        const res = await fetch(`${baseUrl}/evaluacion.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(payload)
        });
        
        let data = {};
        const text = await res.text();
        try {
            data = JSON.parse(text);
        } catch (e) {
            throw new Error(`Error del servidor (${res.status})`);
        }
        
        if (!res.ok || data.success === false) {
            throw new Error(data.message || data.error || 'No se pudo crear la evaluación');
        }
        
        // Reload data
        if (typeof loadData === 'function') {
            await loadData();
        }
        
        // Close modal
        if (typeof closeModal === 'function') {
            closeModal(modal.id);
        } else {
            modal.classList.remove('active');
        }
        
        // Reload evaluaciones list
        if (subjectId) {
            loadSubjectEvaluaciones(subjectId);
        }
        
        // Show success message
        if (typeof showNotification === 'function') {
            showNotification('Evaluación creada correctamente', 'success');
        } else {
            alert('Evaluación creada correctamente');
        }
    } catch (err) {
        alert('Error: ' + (err.message || 'No se pudo crear la evaluación'));
    }
};

/**
 * Save unified content (theme)
 */
window.saveUnifiedContent = async function() {
    const subjectId = document.getElementById('unifiedContentSubjectId')?.value;
    const topic = document.getElementById('unifiedContentTopic')?.value.trim();
    const description = document.getElementById('unifiedContentDescription')?.value.trim();
    const status = document.getElementById('unifiedContentStatus')?.value || 'PENDIENTE';
    
    if (!subjectId || !topic) {
        alert('El tema es obligatorio');
        return;
    }
    
    const payload = {
        Tema: topic,
        Descripcion: description || null,
        Estado: status,
        Materia_ID_materia: parseInt(subjectId)
    };
    
    try {
        const isInPages = window.location.pathname.includes('/pages/');
        const baseUrl = isInPages ? '../api' : 'api';
        
        const res = await fetch(`${baseUrl}/contenido.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(payload)
        });
        
        let data = {};
        const text = await res.text();
        try {
            data = JSON.parse(text);
        } catch (e) {
            throw new Error(`Error del servidor (${res.status})`);
        }
        
        if (!res.ok) {
            throw new Error(data.message || 'No se pudo crear el tema');
        }
        
        // Reload data
        if (typeof loadData === 'function') await loadData();
        
        // Hide form, show list
        const themesList = document.getElementById('subjectThemesList');
        const createThemeFormView = document.getElementById('createThemeFormView');
        if (themesList) themesList.style.display = 'block';
        if (createThemeFormView) {
            createThemeFormView.style.display = 'none';
            createThemeFormView.classList.add('d-none');
        }
        
        // Reload themes list
        const currentId = getCurrentThemesSubjectId();
        if (currentId) {
            loadSubjectThemesList(currentId);
        }
        
        // Show success message
        if (typeof showNotification === 'function') {
            showNotification('Tema creado correctamente', 'success');
        } else {
            alert('Tema creado correctamente');
        }
    } catch (err) {
        alert('Error: ' + (err.message || 'No se pudo crear el tema'));
    }
};
