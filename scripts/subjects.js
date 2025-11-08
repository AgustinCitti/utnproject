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
            
            // Get student information for each tema_estudiante record
            const estudiantes = (data.estudiante || []);
            const studentStates = temaEstudianteRecords.map(te => {
                const student = estudiantes.find(e => parseInt(e.ID_Estudiante) === parseInt(te.Estudiante_ID_Estudiante));
                return {
                    temaEstudiante: te,
                    student: student
                };
            }).sort((a, b) => {
                // Sort by student last name
                const lastNameA = (a.student?.Apellido || '').toLowerCase();
                const lastNameB = (b.student?.Apellido || '').toLowerCase();
                if (lastNameA !== lastNameB) {
                    return lastNameA.localeCompare(lastNameB);
                }
                return (a.student?.Nombre || '').toLowerCase().localeCompare((b.student?.Nombre || '').toLowerCase());
            });
            
            // Border colors based on tema estado
            const temaEstado = theme.Estado || 'PENDIENTE';
            const temaBorderColors = {
                'PENDIENTE': '#ffc107',      // Yellow
                'EN_PROGRESO': '#17a2b8',    // Blue
                'COMPLETADO': '#28a745',     // Green
                'CANCELADO': '#dc3545'       // Red
            };
            const temaBorderColor = temaBorderColors[temaEstado] || '#ddd';
            
            return `
                <div class="theme-card" data-tema-id="${theme.ID_contenido}" data-estado="${temaEstado}" style="margin-bottom: 12px; border: 2px solid ${temaBorderColor}; border-radius: 8px; background: var(--card-bg); overflow: hidden;">
                    <div class="theme-card-header" style="padding: 14px 16px; display: flex; justify-content: space-between; align-items: center; background: var(--bg-secondary);">
                        <div style="flex: 1;">
                            <strong style="display: block; margin-bottom: 4px; color: var(--text-primary); font-size: 1em;">${theme.Tema || 'Sin título'}</strong>
                            <div style="display: flex; gap: 12px; align-items: center; flex-wrap: wrap;">
                                <select class="tema-estado-selector" data-tema-id="${theme.ID_contenido}" 
                                        style="padding: 4px 8px; border: 1px solid var(--border-color); border-radius: 4px; font-size: 0.85em; background: var(--card-bg); color: var(--text-primary); cursor: pointer; font-weight: 500;">
                                    <option value="PENDIENTE" ${temaEstado === 'PENDIENTE' ? 'selected' : ''}>PENDIENTE</option>
                                    <option value="EN_PROGRESO" ${temaEstado === 'EN_PROGRESO' ? 'selected' : ''}>EN_PROGRESO</option>
                                    <option value="COMPLETADO" ${temaEstado === 'COMPLETADO' ? 'selected' : ''}>COMPLETADO</option>
                                    <option value="CANCELADO" ${temaEstado === 'CANCELADO' ? 'selected' : ''}>CANCELADO</option>
                                </select>
                                <span style="font-size: 0.85em; color: var(--text-secondary);">
                                    <i class="fas fa-users" style="margin-right: 4px;"></i>${studentsCount} estudiante${studentsCount !== 1 ? 's' : ''}
                                </span>
                                ${theme.Fecha_creacion ? `<small style="color: var(--text-secondary); font-size: 0.8em;">Creado: ${formatDate(theme.Fecha_creacion)}</small>` : ''}
                            </div>
                            ${theme.Descripcion ? `<div style="font-size: 0.9em; color: var(--text-secondary); margin-top: 8px; padding-top: 8px; border-top: 1px solid var(--border-color);">${theme.Descripcion}</div>` : ''}
                        </div>
                        <div style="display: flex; gap: 5px;">
                            <button class="btn-icon btn-view" onclick="showTemaStudentStatesDialog(${theme.ID_contenido}, '${theme.Tema || 'Sin título'}')" title="Ver Estados de Estudiantes" style="padding: 6px 8px;">
                                <i class="fas fa-eye" style="font-size: 0.9em;"></i>
                            </button>
                            <button class="btn-icon btn-edit" onclick="window.editContent(${theme.ID_contenido})" title="Editar Tema" style="padding: 6px 8px;">
                                <i class="fas fa-edit" style="font-size: 0.9em;"></i>
                            </button>
                            <button class="btn-icon btn-delete" onclick="window.deleteContent(${theme.ID_contenido})" title="Eliminar Tema" style="padding: 6px 8px;">
                                <i class="fas fa-trash" style="font-size: 0.9em;"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
        
        // Setup real-time tema estado selectors
        const temaEstadoSelectors = themesList.querySelectorAll('.tema-estado-selector');
        temaEstadoSelectors.forEach(selector => {
            selector.addEventListener('change', async function() {
                const temaId = parseInt(this.dataset.temaId);
                const newEstado = this.value;
                
                if (!temaId) {
                    console.error('Error: temaId no válido');
                    return;
                }
                
                try {
                    // Update tema estado in real-time
                    const response = await fetch(`../api/contenido.php?id=${temaId}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                        credentials: 'include',
                        body: JSON.stringify({
                            Estado: newEstado
                        })
                    });
                    
                    if (!response.ok) {
                        const errorData = await response.json().catch(() => ({}));
                        throw new Error(errorData.message || 'Error al actualizar el estado');
                    }
                    
                    // Update border color based on new estado
                    const borderColors = {
                        'PENDIENTE': '#ffc107',      // Yellow
                        'EN_PROGRESO': '#17a2b8',    // Blue
                        'COMPLETADO': '#28a745',     // Green
                        'CANCELADO': '#dc3545'       // Red
                    };
                    const newBorderColor = borderColors[newEstado] || '#ddd';
                    
                    const themeCard = this.closest('.theme-card');
                    if (themeCard) {
                        themeCard.style.borderColor = newBorderColor;
                        themeCard.setAttribute('data-estado', newEstado);
                    }
                    
                    // Show success feedback
                    const originalBorderColor = this.style.borderColor || 'var(--border-color)';
                    this.style.borderColor = '#28a745';
                    setTimeout(() => {
                        this.style.borderColor = originalBorderColor;
                    }, 1000);
                    
                    // Reload app data to reflect changes
                    if (typeof loadAppData === 'function') {
                        await loadAppData();
                    } else if (typeof refreshAppData === 'function') {
                        await refreshAppData();
                    } else if (typeof loadData === 'function') {
                        await loadData();
                    }
                } catch (error) {
                    console.error('Error updating tema estado:', error);
                    // Revert selection on error
                    this.value = this.dataset.originalValue || 'PENDIENTE';
                    alert(`Error al actualizar el estado: ${error.message}`);
                }
            });
            
            // Store original value for error recovery
            selector.dataset.originalValue = selector.value;
        });
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
 * Show dialog with student states for a tema
 * @param {number} contenidoId - Contenido ID
 * @param {string} temaNombre - Tema name
 */
window.showTemaStudentStatesDialog = function(contenidoId, temaNombre) {
    if (!contenidoId) {
        console.error('showTemaStudentStatesDialog: contenidoId no válido');
        return;
    }
    
    // Get data
    const data = window.appData || window.data || {};
    
    // Get tema_estudiante records for this tema
    const temaEstudianteRecords = (data.tema_estudiante || []).filter(
        te => parseInt(te.Contenido_ID_contenido) === parseInt(contenidoId)
    );
    
    // Get student information
    const estudiantes = (data.estudiante || []);
    const studentStates = temaEstudianteRecords.map(te => {
        const student = estudiantes.find(e => parseInt(e.ID_Estudiante) === parseInt(te.Estudiante_ID_Estudiante));
        return {
            temaEstudiante: te,
            student: student
        };
    }).sort((a, b) => {
        // Sort by student last name
        const lastNameA = (a.student?.Apellido || '').toLowerCase();
        const lastNameB = (b.student?.Apellido || '').toLowerCase();
        if (lastNameA !== lastNameB) {
            return lastNameA.localeCompare(lastNameB);
        }
        return (a.student?.Nombre || '').toLowerCase().localeCompare((b.student?.Nombre || '').toLowerCase());
    });
    
    // Create modal HTML
    const modalHTML = `
        <div class="modal-overlay" id="temaStudentStatesModal">
            <div class="modal-dialog" style="max-width: 900px;">
                <div class="modal-dialog-content">
                    <div class="modal-dialog-header">
                        <h3>Estados de Estudiantes - ${temaNombre}</h3>
                        <button class="modal-dialog-close close-modal">&times;</button>
                    </div>
                    <div class="modal-dialog-body">
                        ${studentStates.length > 0 ? `
                            <div style="display: flex; flex-direction: column; gap: 12px;">
                                ${studentStates.map(({ temaEstudiante: te, student }) => {
                                    const estado = te.Estado || 'PENDIENTE';
                                    const fechaActualizacion = te.Fecha_actualizacion || '';
                                    const observaciones = te.Observaciones || '';
                                    const studentName = student ? `${student.Nombre} ${student.Apellido}` : `ID: ${te.Estudiante_ID_Estudiante}`;
                                    const temaEstId = te.ID_Tema_estudiante;
                                    
                                    // Border colors based on estado
                                    const borderColors = {
                                        'PENDIENTE': '#ffc107',      // Yellow
                                        'EN_PROGRESO': '#17a2b8',    // Blue
                                        'COMPLETADO': '#28a745',     // Green
                                        'CANCELADO': '#dc3545'       // Red
                                    };
                                    const borderColor = borderColors[estado] || '#ddd';
                                    
                                    return `
                                        <div class="student-state-item" data-tema-est-id="${temaEstId}" data-estado="${estado}" style="border: 2px solid ${borderColor}; border-radius: 6px; padding: 12px; background: var(--card-bg);">
                                            <div style="display: grid; grid-template-columns: 2fr 1.5fr 1fr; gap: 12px; align-items: center; margin-bottom: 10px;">
                                                <div style="color: var(--text-primary);">
                                                    <strong style="font-size: 0.95em;">${studentName}</strong>
                                                </div>
                                                <div>
                                                    <select class="estado-selector" data-tema-est-id="${temaEstId}" 
                                                            style="width: 100%; padding: 6px 8px; border: 1px solid var(--border-color); border-radius: 4px; font-size: 0.9em; background: var(--card-bg); color: var(--text-primary); cursor: pointer;">
                                                        <option value="PENDIENTE" ${estado === 'PENDIENTE' ? 'selected' : ''}>PENDIENTE</option>
                                                        <option value="EN_PROGRESO" ${estado === 'EN_PROGRESO' ? 'selected' : ''}>EN_PROGRESO</option>
                                                        <option value="COMPLETADO" ${estado === 'COMPLETADO' ? 'selected' : ''}>COMPLETADO</option>
                                                        <option value="CANCELADO" ${estado === 'CANCELADO' ? 'selected' : ''}>CANCELADO</option>
                                                    </select>
                                                </div>
                                                <div data-fecha-display style="color: var(--text-secondary); font-size: 0.85em;">
                                                    ${fechaActualizacion ? formatDate(fechaActualizacion) : '-'}
                                                </div>
                                            </div>
                                            <div style="padding-top: 10px; border-top: 1px solid var(--border-color);">
                                                <label style="display: block; margin-bottom: 5px; font-weight: 500; color: var(--text-primary); font-size: 0.85em;">Observaciones</label>
                                                <textarea class="observaciones-editor" data-tema-est-id="${temaEstId}" 
                                                          rows="2"
                                                          placeholder="Ingresa observaciones..."
                                                          style="width: 100%; padding: 8px; border: 1px solid var(--border-color); border-radius: 4px; font-size: 0.9em; resize: vertical; font-family: inherit; background: var(--card-bg); color: var(--text-primary); min-height: 50px;">${observaciones || ''}</textarea>
                                            </div>
                                        </div>
                                    `;
                                }).join('')}
                            </div>
                        ` : `
                            <div style="text-align: center; padding: 40px 20px; color: var(--text-secondary);">
                                <i class="fas fa-user-slash" style="font-size: 2.5em; margin-bottom: 15px; opacity: 0.3; display: block;"></i>
                                <p>No hay estudiantes asignados a este tema</p>
                            </div>
                        `}
                    </div>
                    <div class="modal-dialog-footer">
                        <button type="button" class="btn-secondary close-modal">Cerrar</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Remove existing modal if present
    const existingModal = document.getElementById('temaStudentStatesModal');
    if (existingModal) {
        existingModal.remove();
    }
    
    // Add modal to body
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Setup modal handlers
    const modal = document.getElementById('temaStudentStatesModal');
    if (typeof setupModalHandlers === 'function') {
        setupModalHandlers('temaStudentStatesModal');
    } else {
        // Fallback modal handlers
        const closeButtons = modal.querySelectorAll('.close-modal');
        closeButtons.forEach(btn => {
            btn.onclick = () => {
                modal.remove();
            };
        });
        
        // Close on overlay click
        modal.onclick = (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        };
    }
    
    // Setup real-time estado selectors
    const estadoSelectors = modal.querySelectorAll('.estado-selector');
    estadoSelectors.forEach(selector => {
        selector.addEventListener('change', async function() {
            const temaEstId = parseInt(this.dataset.temaEstId);
            const newEstado = this.value;
            
            if (!temaEstId) {
                console.error('Error: temaEstId no válido');
                return;
            }
            
            try {
                // Update estado in real-time
                const response = await fetch(`../api/tema_estudiante.php?id=${temaEstId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({
                        Estado: newEstado
                    })
                });
                
                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(errorData.message || 'Error al actualizar el estado');
                }
                
                // Update fecha actualización display (API sets it to CURRENT_DATE automatically)
                const studentItem = this.closest('.student-state-item');
                const fechaDisplay = studentItem.querySelector('[data-fecha-display]');
                if (fechaDisplay) {
                    const today = new Date();
                    const todayStr = today.toISOString().split('T')[0];
                    fechaDisplay.textContent = formatDate(todayStr);
                }
                
                // Update border color based on new estado
                const borderColors = {
                    'PENDIENTE': '#ffc107',      // Yellow
                    'EN_PROGRESO': '#17a2b8',    // Blue
                    'COMPLETADO': '#28a745',     // Green
                    'CANCELADO': '#dc3545'       // Red
                };
                const newBorderColor = borderColors[newEstado] || '#ddd';
                if (studentItem) {
                    studentItem.style.borderColor = newBorderColor;
                    studentItem.setAttribute('data-estado', newEstado);
                }
                
                // Show success feedback on selector
                this.style.borderColor = '#28a745';
                setTimeout(() => {
                    this.style.borderColor = '';
                }, 1000);
                
                // Reload app data to reflect changes
                if (typeof loadAppData === 'function') {
                    await loadAppData();
                } else if (typeof refreshAppData === 'function') {
                    await refreshAppData();
                } else if (typeof loadData === 'function') {
                    await loadData();
                }
            } catch (error) {
                console.error('Error updating estado:', error);
                // Revert selection on error
                this.value = this.dataset.originalValue || 'PENDIENTE';
                alert(`Error al actualizar el estado: ${error.message}`);
            }
        });
        
        // Store original value for error recovery
        selector.dataset.originalValue = selector.value;
    });
    
    // Setup real-time observaciones editors
    const observacionesEditors = modal.querySelectorAll('.observaciones-editor');
    observacionesEditors.forEach(textarea => {
        const originalValue = textarea.value;
        textarea.dataset.originalValue = originalValue;
        
        // Update on blur (when user leaves the field)
        textarea.addEventListener('blur', async function() {
            const temaEstId = parseInt(this.dataset.temaEstId);
            const newObservaciones = this.value.trim();
            const currentOriginalValue = this.dataset.originalValue || '';
            
            if (!temaEstId) {
                console.error('Error: temaEstId no válido');
                return;
            }
            
            // Only update if value changed
            if (newObservaciones === currentOriginalValue) {
                return;
            }
            
            try {
                // Update observaciones
                const response = await fetch(`../api/tema_estudiante.php?id=${temaEstId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({
                        Observaciones: newObservaciones || null
                    })
                });
                
                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(errorData.message || 'Error al actualizar las observaciones');
                }
                
                // Update fecha actualización display
                const studentItem = this.closest('.student-state-item');
                const fechaDisplay = studentItem.querySelector('[data-fecha-display]');
                if (fechaDisplay) {
                    const today = new Date();
                    const todayStr = today.toISOString().split('T')[0];
                    fechaDisplay.textContent = formatDate(todayStr);
                }
                
                // Show success feedback
                this.style.borderColor = '#28a745';
                setTimeout(() => {
                    this.style.borderColor = '';
                }, 1000);
                
                // Update original value
                this.dataset.originalValue = newObservaciones;
                
                // Reload app data to reflect changes
                if (typeof loadAppData === 'function') {
                    await loadAppData();
                } else if (typeof refreshAppData === 'function') {
                    await refreshAppData();
                } else if (typeof loadData === 'function') {
                    await loadData();
                }
            } catch (error) {
                console.error('Error updating observaciones:', error);
                // Revert on error
                this.value = this.dataset.originalValue || '';
                alert(`Error al actualizar las observaciones: ${error.message}`);
            }
        });
        
        // Optional: Update on Enter key (Ctrl+Enter or Shift+Enter to save)
        textarea.addEventListener('keydown', function(e) {
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                e.preventDefault();
                this.blur(); // Trigger blur event to save
            }
        });
    });
    
    // Show modal
    if (typeof showModal === 'function') {
        showModal('temaStudentStatesModal');
    } else {
        modal.classList.add('active');
    }
};

/**
 * Edit contenido (tema)
 * @param {number} contenidoId - Contenido ID
 */
window.editContent = async function(contenidoId) {
    if (!contenidoId) {
        alert('Error: ID de tema no válido');
        return;
    }
    
    try {
        // Fetch tema data
        const response = await fetch(`../api/contenido.php?id=${contenidoId}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include'
        });
        
        if (!response.ok) {
            throw new Error('Error al cargar el tema');
        }
        
        const tema = await response.json();
        
        // Get current subject ID from the detail view
        const subjectId = getCurrentThemesSubjectId() || tema.Materia_ID_materia;
        if (!subjectId) {
            alert('Error: No se pudo determinar la materia');
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
            modalTitle.textContent = 'Editar Tema';
        }
        
        // Populate form with tema data
        const contentForm = document.getElementById('contentForm');
        if (contentForm) {
            // Remove previous handler
            const newForm = contentForm.cloneNode(true);
            contentForm.parentNode.replaceChild(newForm, contentForm);
            
            // Get form fields
            const contentTema = document.getElementById('contentTema');
            const contentDescripcion = document.getElementById('contentDescripcion');
            const contentStatus = document.getElementById('contentStatus');
            const contentSubject = document.getElementById('contentSubject');
            
            // Populate fields
            if (contentTema) contentTema.value = tema.Tema || '';
            if (contentDescripcion) contentDescripcion.value = tema.Descripcion || '';
            if (contentStatus) contentStatus.value = tema.Estado || 'PENDIENTE';
            if (contentSubject) {
                contentSubject.value = subjectId;
                // Hide the subject field since we already know which subject
                contentSubject.style.display = 'none';
                const subjectGroup = contentSubject.closest('.form-group');
                if (subjectGroup) {
                    subjectGroup.style.display = 'none';
                }
            }
            
            // Store tema ID for update
            if (contentForm) {
                contentForm.dataset.editId = contenidoId;
            }
            
            // Add new submit handler
            const newContentForm = document.getElementById('contentForm');
            newContentForm.addEventListener('submit', async function(e) {
                e.preventDefault();
                if (typeof saveContentFromModal === 'function') {
                    await saveContentFromModal(contenidoId);
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
    } catch (error) {
        console.error('Error editing content:', error);
        alert(`Error al editar el tema: ${error.message}`);
    }
};

/**
 * Delete contenido (tema)
 * @param {number} contenidoId - Contenido ID
 */
window.deleteContent = async function(contenidoId) {
    if (!contenidoId) {
        alert('Error: ID de tema no válido');
        return;
    }
    
    if (!confirm('¿Estás seguro de que deseas eliminar este tema?\n\nEsta acción eliminará el tema y todas sus relaciones con estudiantes.')) {
        return;
    }
    
    try {
        const response = await fetch(`../api/contenido.php?id=${contenidoId}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include'
        });
        
        const result = await response.json().catch(() => ({}));
        
        if (response.ok && result.success) {
            // Show success message
            if (typeof showNotification === 'function') {
                showNotification('Tema eliminado exitosamente', 'success');
            } else {
                alert('Tema eliminado exitosamente');
            }
            
            // Reload app data
            if (typeof loadAppData === 'function') {
                await loadAppData();
            } else if (typeof refreshAppData === 'function') {
                await refreshAppData();
            } else if (typeof loadData === 'function') {
                await loadData();
            }
            
            // Reload themes list
            const subjectId = getCurrentThemesSubjectId();
            if (subjectId && typeof loadSubjectThemesList === 'function') {
                loadSubjectThemesList(subjectId);
            }
        } else {
            throw new Error(result.message || 'Error al eliminar el tema');
        }
    } catch (error) {
        console.error('Error deleting content:', error);
        alert(`Error al eliminar el tema: ${error.message}`);
    }
};

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
            
            // Ensure modal is at body level (not inside a clipped container)
            if (modal.parentElement !== document.body) {
                document.body.appendChild(modal);
            }
            
            // Remove any inline styles that might be hiding it
            modal.style.display = '';
            modal.style.opacity = '';
            modal.style.visibility = '';
            modal.style.position = 'fixed';
            modal.style.top = '0';
            modal.style.left = '0';
            modal.style.width = '100%';
            modal.style.height = '100%';
            modal.style.zIndex = '2000';
            
            // Add active class (CSS will handle display: block and slide animation)
            modal.classList.add('active');
            
            // Also call showModal if available (it might do additional setup)
            if (typeof showModal === 'function') {
                showModal('importTemasModal');
            }
            
            // Setup modal handlers
            if (typeof setupModalHandlers === 'function') {
                setupModalHandlers('importTemasModal');
            }
            
            // Ensure body scroll is disabled
            document.body.style.overflow = 'hidden';
            
            // Double-check it's visible after a brief delay and log detailed state
            setTimeout(() => {
                const computed = window.getComputedStyle(modal);
                const dialog = modal.querySelector('.modal-dialog');
                const dialogComputed = dialog ? window.getComputedStyle(dialog) : null;
                
                console.log('Modal state - display:', computed.display, 'opacity:', computed.opacity, 'visibility:', computed.visibility, 'z-index:', computed.zIndex, 'has active class:', modal.classList.contains('active'));
                if (dialogComputed) {
                    console.log('Dialog state - right:', dialogComputed.right, 'display:', dialogComputed.display, 'z-index:', dialogComputed.zIndex);
                }
                
                // Force visibility if needed
                if (computed.display === 'none') {
                    console.warn('Modal display is none, forcing block');
                    modal.style.display = 'block';
                }
                if (computed.opacity === '0') {
                    console.warn('Modal opacity is 0, forcing 1');
                    modal.style.opacity = '1';
                }
                if (computed.visibility === 'hidden') {
                    console.warn('Modal visibility is hidden, forcing visible');
                    modal.style.visibility = 'visible';
                }
                
                // Ensure dialog is visible
                if (dialog) {
                    if (dialogComputed && dialogComputed.display === 'none') {
                        dialog.style.display = 'flex';
                    }
                }
            }, 100);
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
            
            // Ensure modal is at body level (not inside a clipped container)
            if (modal.parentElement !== document.body) {
                document.body.appendChild(modal);
            }
            
            // Remove any inline styles that might be hiding it
            modal.style.display = '';
            modal.style.opacity = '';
            modal.style.visibility = '';
            modal.style.position = 'fixed';
            modal.style.top = '0';
            modal.style.left = '0';
            modal.style.width = '100%';
            modal.style.height = '100%';
            modal.style.zIndex = '2000';
            
            // Add active class (CSS will handle display: block and slide animation)
            modal.classList.add('active');
            
            // Also call showModal if available
            if (typeof showModal === 'function') {
                showModal('importEvaluacionesModal');
            }
            
            // Setup modal handlers
            if (typeof setupModalHandlers === 'function') {
                setupModalHandlers('importEvaluacionesModal');
            }
            
            // Ensure body scroll is disabled
            document.body.style.overflow = 'hidden';
            
            // Double-check it's visible after a brief delay
            setTimeout(() => {
                const computed = window.getComputedStyle(modal);
                const dialog = modal.querySelector('.modal-dialog');
                const dialogComputed = dialog ? window.getComputedStyle(dialog) : null;
                
                console.log('Evaluaciones Modal state - display:', computed.display, 'opacity:', computed.opacity, 'has active class:', modal.classList.contains('active'));
                if (dialogComputed) {
                    console.log('Dialog state - right:', dialogComputed.right, 'display:', dialogComputed.display);
                }
                
                // Force visibility if needed
                if (computed.display === 'none') {
                    modal.style.display = 'block';
                }
                if (computed.opacity === '0') {
                    modal.style.opacity = '1';
                }
                if (dialog && dialogComputed && dialogComputed.display === 'none') {
                    dialog.style.display = 'flex';
                }
            }, 100);
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
                    
                    // Ensure modal is at body level (not inside a clipped container)
                    if (modal.parentElement !== document.body) {
                        document.body.appendChild(modal);
                    }
                    
                    // Remove any inline styles that might be hiding it
                    modal.style.display = '';
                    modal.style.opacity = '';
                    modal.style.visibility = '';
                    modal.style.position = 'fixed';
                    modal.style.top = '0';
                    modal.style.left = '0';
                    modal.style.width = '100%';
                    modal.style.height = '100%';
                    modal.style.zIndex = '2000';
                    
                    // Add active class (CSS will handle display: block and slide animation)
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
                    
                    // Double-check it's visible after a brief delay
                    setTimeout(() => {
                        const computed = window.getComputedStyle(modal);
                        const dialog = modal.querySelector('.modal-dialog');
                        const dialogComputed = dialog ? window.getComputedStyle(dialog) : null;
                        
                        console.log('Modal state (from switchToTemasTab) - display:', computed.display, 'opacity:', computed.opacity, 'has active class:', modal.classList.contains('active'));
                        if (dialogComputed) {
                            console.log('Dialog state - right:', dialogComputed.right, 'display:', dialogComputed.display);
                        }
                        
                        // Force visibility if needed
                        if (computed.display === 'none') {
                            modal.style.display = 'block';
                        }
                        if (computed.opacity === '0') {
                            modal.style.opacity = '1';
                        }
                        if (dialog && dialogComputed && dialogComputed.display === 'none') {
                            dialog.style.display = 'flex';
                        }
                    }, 100);
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
            
            // Ensure modal is at body level (not inside a clipped container)
            if (modal.parentElement !== document.body) {
                document.body.appendChild(modal);
            }
            
            // Remove any inline styles that might be hiding it
            modal.style.display = '';
            modal.style.opacity = '';
            modal.style.visibility = '';
            modal.style.position = 'fixed';
            modal.style.top = '0';
            modal.style.left = '0';
            modal.style.width = '100%';
            modal.style.height = '100%';
            modal.style.zIndex = '2000';
            
            // Add active class (CSS will handle display: block and slide animation)
            modal.classList.add('active');
            
            // Also call showModal if available
            if (typeof showModal === 'function') {
                showModal('importEvaluacionesModal');
            }
            
            // Setup modal handlers
            if (typeof setupModalHandlers === 'function') {
                setupModalHandlers('importEvaluacionesModal');
            }
            
            // Ensure body scroll is disabled
            document.body.style.overflow = 'hidden';
            
            // Double-check it's visible after a brief delay
            setTimeout(() => {
                const computed = window.getComputedStyle(modal);
                const dialog = modal.querySelector('.modal-dialog');
                const dialogComputed = dialog ? window.getComputedStyle(dialog) : null;
                
                console.log('Evaluaciones Modal state - display:', computed.display, 'opacity:', computed.opacity, 'has active class:', modal.classList.contains('active'));
                if (dialogComputed) {
                    console.log('Dialog state - right:', dialogComputed.right, 'display:', dialogComputed.display);
                }
                
                // Force visibility if needed
                if (computed.display === 'none') {
                    modal.style.display = 'block';
                }
                if (computed.opacity === '0') {
                    modal.style.opacity = '1';
                }
                if (dialog && dialogComputed && dialogComputed.display === 'none') {
                    dialog.style.display = 'flex';
                }
            }, 100);
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
            const estado = eval.Estado || 'PROGRAMADA';
            
            // Border colors based on evaluacion estado
            const evaluacionBorderColors = {
                'PROGRAMADA': '#ffc107',      // Yellow
                'EN_CURSO': '#17a2b8',        // Blue
                'FINALIZADA': '#28a745',      // Green
                'CANCELADA': '#dc3545'        // Red
            };
            const evaluacionBorderColor = evaluacionBorderColors[estado] || '#ddd';
            
            return `
                <div class="evaluacion-card" data-evaluacion-id="${eval.ID_evaluacion}" data-estado="${estado}" style="margin-bottom: 12px; border: 2px solid ${evaluacionBorderColor}; border-radius: 8px; background: var(--card-bg); padding: 14px 16px;">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                        <div style="flex: 1;">
                            <strong style="display: block; margin-bottom: 6px; color: var(--text-primary); font-size: 1em;">${eval.Titulo || 'Sin título'}</strong>
                            ${eval.Descripcion ? `<p style="font-size: 0.9em; color: var(--text-secondary); margin: 6px 0;">${eval.Descripcion}</p>` : ''}
                            <div style="display: flex; gap: 12px; align-items: center; flex-wrap: wrap; margin-top: 8px;">
                                <span class="status-badge" style="font-size: 0.8em; padding: 3px 8px; border-radius: 10px; background: #667eea; color: white;">
                                    ${tipoLabels[eval.Tipo] || eval.Tipo}
                                </span>
                                <select class="evaluacion-estado-selector" data-evaluacion-id="${eval.ID_evaluacion}" 
                                        style="padding: 4px 8px; border: 1px solid var(--border-color); border-radius: 4px; font-size: 0.85em; background: var(--card-bg); color: var(--text-primary); cursor: pointer; font-weight: 500;">
                                    <option value="PROGRAMADA" ${estado === 'PROGRAMADA' ? 'selected' : ''}>PROGRAMADA</option>
                                    <option value="EN_CURSO" ${estado === 'EN_CURSO' ? 'selected' : ''}>EN_CURSO</option>
                                    <option value="FINALIZADA" ${estado === 'FINALIZADA' ? 'selected' : ''}>FINALIZADA</option>
                                    <option value="CANCELADA" ${estado === 'CANCELADA' ? 'selected' : ''}>CANCELADA</option>
                                </select>
                                <span style="font-size: 0.85em; color: var(--text-secondary);">
                                    <i class="fas fa-calendar" style="margin-right: 4px;"></i>${fecha}
                                </span>
                            </div>
                        </div>
                        <div style="display: flex; gap: 5px;" onclick="event.stopPropagation();">
                            <button class="btn-icon btn-grade" onclick="showGradeStudentsDialog(${eval.ID_evaluacion}, ${subjectId})" title="Calificar Estudiantes" style="padding: 6px 8px;">
                                <i class="fas fa-clipboard-check" style="font-size: 0.9em;"></i>
                            </button>
                            <button class="btn-icon btn-edit" onclick="window.editEvaluacion(${eval.ID_evaluacion})" title="Editar Evaluación" style="padding: 6px 8px;">
                                <i class="fas fa-edit" style="font-size: 0.9em;"></i>
                            </button>
                            <button class="btn-icon btn-delete" onclick="window.deleteEvaluacion(${eval.ID_evaluacion})" title="Eliminar Evaluación" style="padding: 6px 8px;">
                                <i class="fas fa-trash" style="font-size: 0.9em;"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
        
        // Setup real-time evaluacion estado selectors
        const evaluacionEstadoSelectors = evaluacionesList.querySelectorAll('.evaluacion-estado-selector');
        evaluacionEstadoSelectors.forEach(selector => {
            selector.addEventListener('change', async function() {
                const evaluacionId = parseInt(this.dataset.evaluacionId);
                const newEstado = this.value;
                
                if (!evaluacionId) {
                    console.error('Error: evaluacionId no válido');
                    return;
                }
                
                try {
                    // Update evaluacion estado in real-time
                    const response = await fetch(`../api/evaluacion.php?id=${evaluacionId}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                        credentials: 'include',
                        body: JSON.stringify({
                            Estado: newEstado
                        })
                    });
                    
                    if (!response.ok) {
                        const errorData = await response.json().catch(() => ({}));
                        throw new Error(errorData.message || 'Error al actualizar el estado');
                    }
                    
                    // Update border color based on new estado
                    const borderColors = {
                        'PROGRAMADA': '#ffc107',      // Yellow
                        'EN_CURSO': '#17a2b8',        // Blue
                        'FINALIZADA': '#28a745',      // Green
                        'CANCELADA': '#dc3545'        // Red
                    };
                    const newBorderColor = borderColors[newEstado] || '#ddd';
                    
                    const evaluacionCard = this.closest('.evaluacion-card');
                    if (evaluacionCard) {
                        evaluacionCard.style.borderColor = newBorderColor;
                        evaluacionCard.setAttribute('data-estado', newEstado);
                    }
                    
                    // Show success feedback
                    const originalBorderColor = this.style.borderColor || 'var(--border-color)';
                    this.style.borderColor = '#28a745';
                    setTimeout(() => {
                        this.style.borderColor = originalBorderColor;
                    }, 1000);
                    
                    // Reload app data to reflect changes
                    if (typeof loadAppData === 'function') {
                        await loadAppData();
                    } else if (typeof refreshAppData === 'function') {
                        await refreshAppData();
                    } else if (typeof loadData === 'function') {
                        await loadData();
                    }
                } catch (error) {
                    console.error('Error updating evaluacion estado:', error);
                    // Revert selection on error
                    this.value = this.dataset.originalValue || 'PROGRAMADA';
                    alert(`Error al actualizar el estado: ${error.message}`);
                }
            });
            
            // Store original value for error recovery
            selector.dataset.originalValue = selector.value;
        });
    } else {
        evaluacionesList.innerHTML = '<div style="text-align: center; padding: 40px 20px; color: var(--text-secondary, #999);">No hay evaluaciones registradas</div>';
    }
};

/**
 * Edit evaluacion
 * @param {number} evaluacionId - Evaluacion ID
 */
window.editEvaluacion = async function(evaluacionId) {
    if (!evaluacionId) {
        alert('Error: ID de evaluación no válido');
        return;
    }
    
    try {
        // Fetch evaluacion data
        const response = await fetch(`../api/evaluacion.php?id=${evaluacionId}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include'
        });
        
        if (!response.ok) {
            throw new Error('Error al cargar la evaluación');
        }
        
        const evaluacion = await response.json();
        
        // Use existing editExam function if available
        if (typeof editExam === 'function') {
            editExam(evaluacionId);
        } else if (typeof window.editExam === 'function') {
            window.editExam(evaluacionId);
        } else {
            alert('Error: Función de edición no disponible');
        }
    } catch (error) {
        console.error('Error editing evaluacion:', error);
        alert(`Error al editar la evaluación: ${error.message}`);
    }
};

/**
 * Delete evaluacion
 * @param {number} evaluacionId - Evaluacion ID
 */
window.deleteEvaluacion = async function(evaluacionId) {
    if (!evaluacionId) {
        alert('Error: ID de evaluación no válido');
        return;
    }
    
    try {
        // Fetch evaluacion data for confirmation
        const response = await fetch(`../api/evaluacion.php?id=${evaluacionId}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include'
        });
        
        if (!response.ok) {
            throw new Error('Error al cargar la evaluación');
        }
        
        const evaluacion = await response.json();
        
        if (!confirm(`¿Está seguro de que desea eliminar la evaluación "${evaluacion.Titulo}"?`)) {
            return;
        }
        
        // Delete evaluacion
        const deleteResponse = await fetch(`../api/evaluacion.php?id=${evaluacionId}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include'
        });
        
        if (!deleteResponse.ok) {
            const errorData = await deleteResponse.json().catch(() => ({}));
            throw new Error(errorData.message || 'Error al eliminar la evaluación');
        }
        
        // Reload app data and evaluaciones list
        if (typeof loadAppData === 'function') {
            await loadAppData();
        } else if (typeof refreshAppData === 'function') {
            await refreshAppData();
        } else if (typeof loadData === 'function') {
            await loadData();
        }
        
        // Reload evaluaciones list
        const subjectId = getCurrentThemesSubjectId();
        if (subjectId) {
            loadMateriaEvaluaciones(subjectId);
        }
        
        alert('Evaluación eliminada exitosamente');
    } catch (error) {
        console.error('Error deleting evaluacion:', error);
        alert(`Error al eliminar la evaluación: ${error.message}`);
    }
};

/**
 * Show dialog to grade students for an evaluacion
 * @param {number} evaluacionId - Evaluacion ID
 * @param {number} materiaId - Materia ID
 */
window.showGradeStudentsDialog = async function(evaluacionId, materiaId) {
    if (!evaluacionId || !materiaId) {
        alert('Error: ID de evaluación o materia no válido');
        return;
    }
    
    try {
        // Get data
        const data = window.appData || window.data || {};
        
        // Get evaluacion
        const evaluacion = data.evaluacion?.find(e => parseInt(e.ID_evaluacion) === parseInt(evaluacionId));
        if (!evaluacion) {
            alert('Error: Evaluación no encontrada');
            return;
        }
        
        // Get materia
        const materia = data.materia?.find(m => parseInt(m.ID_materia) === parseInt(materiaId));
        if (!materia) {
            alert('Error: Materia no encontrada');
            return;
        }
        
        // Get students enrolled in this materia
        const alumnosXMateria = data.alumnos_x_materia || [];
        const estudiantesIds = alumnosXMateria
            .filter(axm => parseInt(axm.Materia_ID_materia) === parseInt(materiaId))
            .map(axm => parseInt(axm.Estudiante_ID_Estudiante));
        
        const estudiantes = (data.estudiante || [])
            .filter(e => estudiantesIds.includes(parseInt(e.ID_Estudiante)))
            .sort((a, b) => {
                const lastNameA = (a.Apellido || '').toLowerCase();
                const lastNameB = (b.Apellido || '').toLowerCase();
                if (lastNameA !== lastNameB) {
                    return lastNameA.localeCompare(lastNameB);
                }
                return (a.Nombre || '').toLowerCase().localeCompare((b.Nombre || '').toLowerCase());
            });
        
        // Get existing notas for this evaluacion
        const notas = (data.notas || [])
            .filter(n => parseInt(n.Evaluacion_ID_evaluacion) === parseInt(evaluacionId));
        
        const notasMap = {};
        notas.forEach(nota => {
            notasMap[parseInt(nota.Estudiante_ID_Estudiante)] = nota;
        });
        
        // Create modal HTML
        const modalHTML = `
            <div class="modal-overlay" id="gradeStudentsModal">
                <div class="modal-dialog" style="max-width: 900px;">
                    <div class="modal-dialog-content">
                        <div class="modal-dialog-header">
                            <h3>Calificar Estudiantes - ${evaluacion.Titulo || 'Sin título'}</h3>
                            <button class="modal-dialog-close close-modal">&times;</button>
                        </div>
                        <div class="modal-dialog-body">
                            <div style="margin-bottom: 15px;">
                                <p><strong>Materia:</strong> ${materia.Nombre}</p>
                                <p><strong>Fecha:</strong> ${evaluacion.Fecha ? formatDate(evaluacion.Fecha) : 'Sin fecha'}</p>
                                <p><strong>Tipo:</strong> ${evaluacion.Tipo || 'N/A'}</p>
                            </div>
                            ${estudiantes.length > 0 ? `
                                <div style="max-height: 500px; overflow-y: auto;">
                                    <table style="width: 100%; border-collapse: collapse;">
                                        <thead>
                                            <tr style="background: var(--bg-secondary); border-bottom: 2px solid var(--border-color); position: sticky; top: 0; z-index: 10;">
                                                <th style="padding: 12px; text-align: left; font-weight: 600; color: var(--text-primary); font-size: 0.85em;">Estudiante</th>
                                                <th style="padding: 12px; text-align: left; font-weight: 600; color: var(--text-primary); font-size: 0.85em;">Calificación</th>
                                                <th style="padding: 12px; text-align: left; font-weight: 600; color: var(--text-primary); font-size: 0.85em;">Observaciones</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            ${estudiantes.map((estudiante) => {
                                                const nota = notasMap[parseInt(estudiante.ID_Estudiante)];
                                                const notaId = nota ? nota.ID_Nota : null;
                                                const calificacion = nota ? (nota.Calificacion === 0 && nota.Observacion === 'AUSENTE' ? '' : nota.Calificacion) : '';
                                                const observacion = nota ? (nota.Observacion || '') : '';
                                                const esAusente = nota && (nota.Calificacion === 0 || nota.Calificacion === 'AUSENTE') && nota.Observacion === 'AUSENTE';
                                                
                                                return `
                                                    <tr style="border-bottom: 1px solid var(--border-color);">
                                                        <td style="padding: 12px; color: var(--text-primary);">
                                                            <strong>${estudiante.Nombre} ${estudiante.Apellido}</strong>
                                                        </td>
                                                        <td style="padding: 12px;">
                                                            <div style="display: flex; gap: 8px; align-items: center;">
                                                                <input type="number" 
                                                                       class="nota-calificacion" 
                                                                       data-estudiante-id="${estudiante.ID_Estudiante}" 
                                                                       data-nota-id="${notaId || ''}"
                                                                       data-evaluacion-id="${evaluacionId}"
                                                                       min="1" 
                                                                       max="10" 
                                                                       step="0.01"
                                                                       value="${calificacion}"
                                                                       placeholder="1-10"
                                                                       style="width: 80px; padding: 6px 8px; border: 1px solid var(--border-color); border-radius: 4px; font-size: 0.9em; background: var(--card-bg); color: var(--text-primary);"
                                                                       ${esAusente ? 'disabled' : ''}>
                                                                <label style="display: flex; align-items: center; gap: 5px; font-size: 0.85em; color: var(--text-secondary); cursor: pointer;">
                                                                    <input type="checkbox" 
                                                                           class="nota-ausente" 
                                                                           data-estudiante-id="${estudiante.ID_Estudiante}"
                                                                           ${esAusente ? 'checked' : ''}>
                                                                    Ausente
                                                                </label>
                                                            </div>
                                                        </td>
                                                        <td style="padding: 12px;">
                                                            <input type="text" 
                                                                   class="nota-observacion" 
                                                                   data-estudiante-id="${estudiante.ID_Estudiante}"
                                                                   value="${observacion && !esAusente ? observacion : ''}"
                                                                   placeholder="Observaciones..."
                                                                   style="width: 100%; padding: 6px 8px; border: 1px solid var(--border-color); border-radius: 4px; font-size: 0.9em; background: var(--card-bg); color: var(--text-primary);"
                                                                   ${esAusente ? 'disabled' : ''}>
                                                        </td>
                                                    </tr>
                                                `;
                                            }).join('')}
                                        </tbody>
                                    </table>
                                </div>
                            ` : `
                                <div style="text-align: center; padding: 40px 20px; color: var(--text-secondary);">
                                    <i class="fas fa-user-slash" style="font-size: 2.5em; margin-bottom: 15px; opacity: 0.3; display: block;"></i>
                                    <p>No hay estudiantes inscritos en esta materia</p>
                                </div>
                            `}
                        </div>
                        <div class="modal-dialog-footer">
                            <button type="button" class="btn-secondary close-modal">Cerrar</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Remove existing modal if present
        const existingModal = document.getElementById('gradeStudentsModal');
        if (existingModal) {
            existingModal.remove();
        }
        
        // Add modal to body
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // Setup modal handlers
        const modal = document.getElementById('gradeStudentsModal');
        if (typeof setupModalHandlers === 'function') {
            setupModalHandlers('gradeStudentsModal');
        } else {
            const closeButtons = modal.querySelectorAll('.close-modal');
            closeButtons.forEach(btn => {
                btn.onclick = () => modal.remove();
            });
            modal.onclick = (e) => {
                if (e.target === modal) modal.remove();
            };
        }
        
        // Setup real-time nota editors
        if (estudiantes.length > 0) {
            setupGradeStudentsRealTimeEditors(modal, evaluacionId);
        }
        
        // Show modal
        if (typeof showModal === 'function') {
            showModal('gradeStudentsModal');
        } else {
            modal.classList.add('active');
        }
    } catch (error) {
        console.error('Error showing grade students dialog:', error);
        alert(`Error al abrir el diálogo de calificación: ${error.message}`);
    }
};

/**
 * Setup real-time editors for grade students dialog
 * @param {HTMLElement} modal - Modal element
 * @param {number} evaluacionId - Evaluacion ID
 */
function setupGradeStudentsRealTimeEditors(modal, evaluacionId) {
    // Setup calificacion inputs
    const calificacionInputs = modal.querySelectorAll('.nota-calificacion');
    calificacionInputs.forEach(input => {
        let updateTimeout = null;
        const originalValue = input.value;
        
        input.addEventListener('blur', async function() {
            clearTimeout(updateTimeout);
            const estudianteId = parseInt(this.dataset.estudianteId);
            const notaId = this.dataset.notaId || null;
            const calificacion = this.value.trim();
            const ausenteCheckbox = modal.querySelector(`.nota-ausente[data-estudiante-id="${estudianteId}"]`);
            const esAusente = ausenteCheckbox ? ausenteCheckbox.checked : false;
            
            if (!estudianteId) return;
            
            // Skip if ausente is checked
            if (esAusente) return;
            
            // Only update if value changed and is valid
            if (calificacion === originalValue && !calificacion) return;
            
            if (calificacion && (parseFloat(calificacion) < 1 || parseFloat(calificacion) > 10)) {
                alert('La calificación debe estar entre 1 y 10');
                this.value = originalValue;
                return;
            }
            
            try {
                const payload = {
                    Evaluacion_ID_evaluacion: parseInt(evaluacionId),
                    Estudiante_ID_Estudiante: estudianteId,
                    Calificacion: calificacion ? parseFloat(calificacion) : null,
                    Observacion: null,
                    Estado: 'DEFINITIVA'
                };
                
                let response;
                if (notaId) {
                    // Update existing nota
                    response = await fetch(`../api/notas.php?id=${notaId}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                        credentials: 'include',
                        body: JSON.stringify(payload)
                    });
                } else {
                    // Create new nota
                    response = await fetch(`../api/notas.php`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                        credentials: 'include',
                        body: JSON.stringify(payload)
                    });
                }
                
                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(errorData.message || 'Error al guardar la calificación');
                }
                
                const result = await response.json();
                if (result.id) {
                    this.dataset.notaId = result.id;
                }
                
                // Show success feedback
                this.style.borderColor = '#28a745';
                setTimeout(() => {
                    this.style.borderColor = '';
                }, 1000);
                
                // Reload app data
                if (typeof loadAppData === 'function') {
                    await loadAppData();
                } else if (typeof refreshAppData === 'function') {
                    await refreshAppData();
                } else if (typeof loadData === 'function') {
                    await loadData();
                }
            } catch (error) {
                console.error('Error saving calificacion:', error);
                this.value = originalValue;
                alert(`Error al guardar la calificación: ${error.message}`);
            }
        });
    });
    
    // Setup ausente checkboxes
    const ausenteCheckboxes = modal.querySelectorAll('.nota-ausente');
    ausenteCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', async function() {
            const estudianteId = parseInt(this.dataset.estudianteId);
            const calificacionInput = modal.querySelector(`.nota-calificacion[data-estudiante-id="${estudianteId}"]`);
            const observacionInput = modal.querySelector(`.nota-observacion[data-estudiante-id="${estudianteId}"]`);
            const notaId = calificacionInput ? calificacionInput.dataset.notaId : null;
            const esAusente = this.checked;
            
            if (!estudianteId) return;
            
            // Enable/disable inputs
            if (calificacionInput) {
                calificacionInput.disabled = esAusente;
                if (esAusente) calificacionInput.value = '';
            }
            if (observacionInput) {
                observacionInput.disabled = esAusente;
                if (esAusente) observacionInput.value = '';
            }
            
            try {
                const payload = {
                    Evaluacion_ID_evaluacion: parseInt(evaluacionId),
                    Estudiante_ID_Estudiante: estudianteId,
                    Calificacion: esAusente ? 0 : null,
                    Observacion: esAusente ? 'AUSENTE' : null,
                    Estado: 'DEFINITIVA'
                };
                
                let response;
                if (notaId) {
                    // Update existing nota
                    response = await fetch(`../api/notas.php?id=${notaId}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                        credentials: 'include',
                        body: JSON.stringify(payload)
                    });
                } else {
                    // Create new nota
                    response = await fetch(`../api/notas.php`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                        credentials: 'include',
                        body: JSON.stringify(payload)
                    });
                }
                
                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(errorData.message || 'Error al guardar el estado de ausente');
                }
                
                const result = await response.json();
                if (result.id && calificacionInput) {
                    calificacionInput.dataset.notaId = result.id;
                }
                
                // Reload app data
                if (typeof loadAppData === 'function') {
                    await loadAppData();
                } else if (typeof refreshAppData === 'function') {
                    await refreshAppData();
                } else if (typeof loadData === 'function') {
                    await loadData();
                }
            } catch (error) {
                console.error('Error saving ausente:', error);
                this.checked = !esAusente;
                alert(`Error al guardar el estado: ${error.message}`);
            }
        });
    });
    
    // Setup observacion inputs
    const observacionInputs = modal.querySelectorAll('.nota-observacion');
    observacionInputs.forEach(input => {
        let updateTimeout = null;
        const originalValue = input.value;
        
        input.addEventListener('blur', async function() {
            clearTimeout(updateTimeout);
            const estudianteId = parseInt(this.dataset.estudianteId);
            const calificacionInput = modal.querySelector(`.nota-calificacion[data-estudiante-id="${estudianteId}"]`);
            const notaId = calificacionInput ? calificacionInput.dataset.notaId : null;
            const observacion = this.value.trim();
            const ausenteCheckbox = modal.querySelector(`.nota-ausente[data-estudiante-id="${estudianteId}"]`);
            const esAusente = ausenteCheckbox ? ausenteCheckbox.checked : false;
            
            if (!estudianteId || esAusente) return;
            
            // Only update if value changed
            if (observacion === originalValue) return;
            
            try {
                const calificacion = calificacionInput ? parseFloat(calificacionInput.value) : null;
                
                const payload = {
                    Evaluacion_ID_evaluacion: parseInt(evaluacionId),
                    Estudiante_ID_Estudiante: estudianteId,
                    Calificacion: calificacion || null,
                    Observacion: observacion || null,
                    Estado: 'DEFINITIVA'
                };
                
                let response;
                if (notaId) {
                    // Update existing nota
                    response = await fetch(`../api/notas.php?id=${notaId}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                        credentials: 'include',
                        body: JSON.stringify(payload)
                    });
                } else {
                    // Create new nota
                    response = await fetch(`../api/notas.php`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                        credentials: 'include',
                        body: JSON.stringify(payload)
                    });
                }
                
                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(errorData.message || 'Error al guardar las observaciones');
                }
                
                const result = await response.json();
                if (result.id && calificacionInput) {
                    calificacionInput.dataset.notaId = result.id;
                }
                
                // Show success feedback
                this.style.borderColor = '#28a745';
                setTimeout(() => {
                    this.style.borderColor = '';
                }, 1000);
                
                // Reload app data
                if (typeof loadAppData === 'function') {
                    await loadAppData();
                } else if (typeof refreshAppData === 'function') {
                    await refreshAppData();
                } else if (typeof loadData === 'function') {
                    await loadData();
                }
            } catch (error) {
                console.error('Error saving observacion:', error);
                this.value = originalValue;
                alert(`Error al guardar las observaciones: ${error.message}`);
            }
        });
    });
}

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
                        <th style="padding: 12px; text-align: center; font-weight: 600;">Acciones</th>
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
                                <td style="padding: 12px; border-bottom: 1px solid var(--border-color, #ddd); text-align: center;">
                                    <div style="display: flex; gap: 5px; justify-content: center; align-items: center;" onclick="event.stopPropagation();">
                                        <button 
                                            class="btn-icon btn-edit" 
                                            onclick="window.editStudent(${student.ID_Estudiante})" 
                                            title="Editar Estudiante"
                                            style="padding: 6px 8px;">
                                            <i class="fas fa-edit" style="font-size: 0.9em;"></i>
                                        </button>
                                        <button 
                                            class="btn-icon btn-assign" 
                                            onclick="window.showAssignTemaDialog(${student.ID_Estudiante}, ${subjectId})" 
                                            title="Asignar Temas"
                                            style="padding: 6px 8px;">
                                            <i class="fas fa-book" style="font-size: 0.9em;"></i>
                                        </button>
                                        <button 
                                            class="btn-icon btn-delete" 
                                            onclick="window.removeStudentFromMateria(${student.ID_Estudiante}, ${subjectId})" 
                                            title="Eliminar de esta Materia"
                                            style="padding: 6px 8px;">
                                            <i class="fas fa-trash" style="font-size: 0.9em;"></i>
                                        </button>
                                    </div>
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
 * Remove a student from a materia (subject)
 * @param {number} studentId - Student ID
 * @param {number} subjectId - Subject ID
 */
window.removeStudentFromMateria = async function(studentId, subjectId) {
    if (!studentId || !subjectId) {
        console.error('removeStudentFromMateria: IDs no válidos', { studentId, subjectId });
        alert('Error: IDs no válidos');
        return;
    }

    // Get student name for confirmation message
    const data = window.appData || window.data || {};
    const student = data.estudiante && Array.isArray(data.estudiante) 
        ? data.estudiante.find(s => parseInt(s.ID_Estudiante) === parseInt(studentId))
        : null;
    
    const studentName = student ? `${student.Nombre} ${student.Apellido}` : 'este estudiante';
    
    // Confirm deletion
    if (!confirm(`¿Estás seguro de que deseas eliminar a ${studentName} de esta materia?\n\nEsta acción solo eliminará la inscripción del estudiante en esta materia, no eliminará al estudiante del sistema.`)) {
        return;
    }

    try {
        // Call API to remove student from subject
        const response = await fetch(`../api/alumnos_x_materia.php?estudianteId=${studentId}&materiaId=${subjectId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include'
        });

        // Check if response is JSON
        let result;
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            result = await response.json();
        } else {
            const text = await response.text();
            console.error('Respuesta no JSON:', text);
            throw new Error('Respuesta del servidor no válida');
        }

        if (response.ok && result.success) {
            // Show success message
            alert(`Estudiante eliminado de la materia exitosamente.`);
            
            // Reload app data to reflect changes
            if (typeof loadAppData === 'function') {
                await loadAppData();
            } else if (typeof refreshAppData === 'function') {
                await refreshAppData();
            }
            
            // Reload the student list for this subject
            if (typeof window.loadMateriaStudents === 'function') {
                window.loadMateriaStudents(subjectId);
            }
        } else {
            throw new Error(result.message || 'Error al eliminar el estudiante de la materia');
        }
    } catch (error) {
        console.error('Error removing student from materia:', error);
        alert(`Error al eliminar el estudiante de la materia: ${error.message}`);
    }
};

/**
 * Show dialog to assign temas to a student for a specific materia
 * @param {number} studentId - Student ID
 * @param {number} subjectId - Subject ID
 */
window.showAssignTemaDialog = function(studentId, subjectId) {
    if (!studentId || !subjectId) {
        console.error('showAssignTemaDialog: IDs no válidos', { studentId, subjectId });
        alert('Error: IDs no válidos');
        return;
    }

    // Get data
    const data = window.appData || window.data || {};
    
    // Get student info
    const student = data.estudiante && Array.isArray(data.estudiante) 
        ? data.estudiante.find(s => parseInt(s.ID_Estudiante) === parseInt(studentId))
        : null;
    
    if (!student) {
        alert('Estudiante no encontrado');
        return;
    }
    
    // Get materia info
    const materia = data.materia && Array.isArray(data.materia)
        ? data.materia.find(m => parseInt(m.ID_materia) === parseInt(subjectId))
        : null;
    
    if (!materia) {
        alert('Materia no encontrada');
        return;
    }
    
    // Get temas from this materia
    const temas = data.contenido && Array.isArray(data.contenido)
        ? data.contenido.filter(c => parseInt(c.Materia_ID_materia) === parseInt(subjectId))
        : [];
    
    // Get tema_estudiante records for this student
    const temaEstudianteRecords = data.tema_estudiante && Array.isArray(data.tema_estudiante)
        ? data.tema_estudiante.filter(te => parseInt(te.Estudiante_ID_Estudiante) === parseInt(studentId))
        : [];
    
    // Create a map of contenido_id => tema_estudiante record
    const temaEstudianteMap = {};
    temaEstudianteRecords.forEach(te => {
        const contenidoId = parseInt(te.Contenido_ID_contenido);
        temaEstudianteMap[contenidoId] = te;
    });
    
    // Create modal HTML
    const modalHTML = `
        <div class="modal-overlay" id="assignTemaModal">
            <div class="modal-dialog" style="max-width: 800px;">
                <div class="modal-dialog-content">
                    <div class="modal-dialog-header">
                        <h3>Gestionar Temas de ${student.Nombre} ${student.Apellido}</h3>
                        <button class="modal-dialog-close close-modal">&times;</button>
                    </div>
                    <div class="modal-dialog-body">
                        <div style="margin-bottom: 15px;">
                            <p><strong>Materia:</strong> ${materia.Nombre}</p>
                            <p style="color: #666; font-size: 0.9em; margin-top: 5px;">
                                Asigna temas y gestiona su estado, observaciones y fecha de actualización.
                            </p>
                        </div>
                        ${temas.length > 0 ? `
                            <div style="max-height: 500px; overflow-y: auto; border: 1px solid var(--border-color, #ddd); border-radius: 4px; padding: 15px;">
                                ${temas.map((tema, index) => {
                                    const contenidoId = parseInt(tema.ID_contenido);
                                    const temaEstudiante = temaEstudianteMap[contenidoId];
                                    const isAssigned = !!temaEstudiante;
                                    const temaEstId = temaEstudiante ? temaEstudiante.ID_Tema_estudiante : null;
                                    const estado = temaEstudiante ? (temaEstudiante.Estado || 'PENDIENTE') : 'PENDIENTE';
                                    const observaciones = temaEstudiante ? (temaEstudiante.Observaciones || '') : '';
                                    const fechaActualizacion = temaEstudiante ? (temaEstudiante.Fecha_actualizacion || '') : '';
                                    
                                    return `
                                        <div class="tema-item" data-contenido-id="${contenidoId}" data-tema-est-id="${temaEstId || ''}" 
                                             style="padding: 15px; margin-bottom: 15px; border-bottom: 1px solid var(--border-color, #ddd);">
                                            <div style="display: flex; align-items: center; justify-content: space-between; cursor: pointer; margin-bottom: 0;" 
                                                 onclick="toggleTemaCollapse(${contenidoId})">
                                                <div style="flex: 1;">
                                                    <div style="font-weight: 600; color: var(--text-primary, #333); font-size: 1.05em; margin-bottom: 5px;">
                                                        ${tema.Tema || 'Sin título'}
                                                    </div>
                                                    ${tema.Descripcion ? `<div style="font-size: 0.9em; color: var(--text-secondary, #666); margin-bottom: 10px;">${tema.Descripcion}</div>` : ''}
                                                </div>
                                                <button type="button" 
                                                        class="tema-toggle-btn" 
                                                        data-contenido-id="${contenidoId}"
                                                        style="background: none; border: none; cursor: pointer; padding: 5px; color: var(--text-primary, #333); font-size: 1.2em; transition: transform 0.3s ease;"
                                                        onclick="event.stopPropagation(); toggleTemaCollapse(${contenidoId})">
                                                    <i class="fas fa-chevron-down tema-chevron" data-contenido-id="${contenidoId}" style="transition: transform 0.3s ease;"></i>
                                                </button>
                                            </div>
                                            <div class="tema-fields" data-contenido-id="${contenidoId}" style="display: none; margin-top: 15px; padding-top: 15px; border-top: 1px solid var(--border-color, #ddd);">
                                                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;">
                                                    <div class="form-group">
                                                        <label style="display: block; margin-bottom: 5px; font-weight: 500; color: var(--text-primary, #333); font-size: 0.9em;">
                                                            Estado
                                                        </label>
                                                        <select class="tema-estado" data-contenido-id="${contenidoId}" 
                                                                style="width: 100%; padding: 8px; border: 1px solid var(--border-color, #ddd); border-radius: 4px; font-size: 0.9em; background: var(--card-bg, #fff); color: var(--text-primary, #333);">
                                                            <option value="PENDIENTE" ${estado === 'PENDIENTE' ? 'selected' : ''}>PENDIENTE</option>
                                                            <option value="EN_PROGRESO" ${estado === 'EN_PROGRESO' ? 'selected' : ''}>EN_PROGRESO</option>
                                                            <option value="COMPLETADO" ${estado === 'COMPLETADO' ? 'selected' : ''}>COMPLETADO</option>
                                                            <option value="CANCELADO" ${estado === 'CANCELADO' ? 'selected' : ''}>CANCELADO</option>
                                                        </select>
                                                    </div>
                                                    <div class="form-group">
                                                        <label style="display: block; margin-bottom: 5px; font-weight: 500; color: var(--text-primary, #333); font-size: 0.9em;">
                                                            Fecha de Actualización
                                                        </label>
                                                        <input type="date" 
                                                               class="tema-fecha" 
                                                               data-contenido-id="${contenidoId}"
                                                               value="${fechaActualizacion}"
                                                               readonly
                                                               style="width: 100%; padding: 8px; border: 1px solid var(--border-color, #ddd); border-radius: 4px; font-size: 0.9em; background: var(--bg-secondary, #f5f5f5); color: var(--text-primary, #333); cursor: not-allowed;"
                                                               title="La fecha se actualiza automáticamente al guardar">
                                                    </div>
                                                </div>
                                                <div class="form-group">
                                                    <label style="display: block; margin-bottom: 5px; font-weight: 500; color: var(--text-primary, #333); font-size: 0.9em;">
                                                        Observaciones
                                                    </label>
                                                    <textarea class="tema-observaciones" 
                                                              data-contenido-id="${contenidoId}"
                                                              rows="3"
                                                              placeholder="Ingresa observaciones sobre este tema..."
                                                              style="width: 100%; padding: 8px; border: 1px solid var(--border-color, #ddd); border-radius: 4px; font-size: 0.9em; resize: vertical; font-family: inherit; background: var(--card-bg, #fff); color: var(--text-primary, #333);">${observaciones}</textarea>
                                                </div>
                                                ${temaEstId ? `<input type="hidden" class="tema-est-id" data-contenido-id="${contenidoId}" value="${temaEstId}">` : ''}
                                            </div>
                                        </div>
                                    `;
                                }).join('')}
                            </div>
                        ` : `
                            <div style="text-align: center; padding: 40px 20px; color: var(--text-secondary, #999);">
                                <i class="fas fa-book" style="font-size: 2em; margin-bottom: 10px; display: block; color: var(--text-secondary, #999);"></i>
                                <p style="color: var(--text-secondary, #999);">Esta materia no tiene temas disponibles.</p>
                                <p style="font-size: 0.9em; margin-top: 5px; color: var(--text-secondary, #999);">Agrega temas a la materia primero.</p>
                            </div>
                        `}
                    </div>
                    <div class="modal-dialog-footer">
                        <button type="button" class="btn-secondary close-modal">Cancelar</button>
                        <button type="button" class="btn-primary" id="saveTemaAssignmentsBtn" ${temas.length === 0 ? 'disabled' : ''}>Guardar Cambios</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Remove existing modal if present
    const existingModal = document.getElementById('assignTemaModal');
    if (existingModal) {
        existingModal.remove();
    }
    
    // Add modal to body
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Setup modal handlers
    const modal = document.getElementById('assignTemaModal');
    if (typeof setupModalHandlers === 'function') {
        setupModalHandlers('assignTemaModal');
    } else {
        // Fallback modal handlers
        const closeButtons = modal.querySelectorAll('.close-modal');
        closeButtons.forEach(btn => {
            btn.onclick = () => {
                modal.remove();
            };
        });
        
        // Close on overlay click
        modal.onclick = (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        };
    }
    
    // Add collapse/expand function for tema items
    window.toggleTemaCollapse = function(contenidoId) {
        const fieldsContainer = modal.querySelector(`.tema-fields[data-contenido-id="${contenidoId}"]`);
        const chevron = modal.querySelector(`.tema-chevron[data-contenido-id="${contenidoId}"]`);
        
        if (fieldsContainer && chevron) {
            const isVisible = fieldsContainer.style.display !== 'none';
            
            if (isVisible) {
                fieldsContainer.style.display = 'none';
                chevron.style.transform = 'rotate(0deg)';
            } else {
                fieldsContainer.style.display = 'block';
                chevron.style.transform = 'rotate(180deg)';
            }
        }
    };
    
    // Setup save button
    const saveBtn = document.getElementById('saveTemaAssignmentsBtn');
    if (saveBtn) {
        saveBtn.onclick = async () => {
            try {
                // Get all temas (all are assigned since student is in materia)
                const allTemaItems = modal.querySelectorAll('.tema-item');
                const allContenidoIds = Array.from(allTemaItems).map(item => parseInt(item.dataset.contenidoId));
                
                // Get previously assigned tema_estudiante records for this student
                const currentData = window.appData || window.data || {};
                const previousTemaEstudiante = currentData.tema_estudiante && Array.isArray(currentData.tema_estudiante)
                    ? currentData.tema_estudiante.filter(te => parseInt(te.Estudiante_ID_Estudiante) === parseInt(studentId))
                    : [];
                
                // Process each tema
                for (const contenidoId of allContenidoIds) {
                    // Get form values
                    const estadoSelect = modal.querySelector(`.tema-estado[data-contenido-id="${contenidoId}"]`);
                    const observacionesTextarea = modal.querySelector(`.tema-observaciones[data-contenido-id="${contenidoId}"]`);
                    const temaEstIdInput = modal.querySelector(`.tema-est-id[data-contenido-id="${contenidoId}"]`);
                    
                    const estado = estadoSelect ? estadoSelect.value : 'PENDIENTE';
                    const observaciones = observacionesTextarea ? observacionesTextarea.value.trim() : '';
                    const temaEstId = temaEstIdInput ? parseInt(temaEstIdInput.value) : null;
                    // Note: Fecha_actualizacion is automatically set to CURRENT_DATE by the API on update
                    
                    // Check if tema_estudiante record already exists
                    const existingRecord = previousTemaEstudiante.find(te => parseInt(te.Contenido_ID_contenido) === contenidoId);
                    
                    if (existingRecord && temaEstId) {
                        // Update existing record
                        try {
                            const updatePayload = {
                                Estado: estado,
                                Observaciones: observaciones || null
                            };
                            
                            const res = await fetch(`../api/tema_estudiante.php?id=${temaEstId}`, {
                                method: 'PUT',
                                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                                credentials: 'include',
                                body: JSON.stringify(updatePayload)
                            });
                            
                            if (!res.ok) {
                                const errorData = await res.json().catch(() => ({}));
                                console.error(`Error updating tema_estudiante ${temaEstId}:`, errorData.message);
                                throw new Error(`Error actualizando tema: ${errorData.message || 'Error desconocido'}`);
                            }
                        } catch (err) {
                            console.error(`Error updating tema_estudiante ${temaEstId}:`, err);
                            throw err;
                        }
                    } else {
                        // Create new record
                        try {
                            const createPayload = {
                                Contenido_ID_contenido: contenidoId,
                                Estudiante_ID_Estudiante: studentId,
                                Estado: estado,
                                Observaciones: observaciones || null
                            };
                            
                            const res = await fetch('../api/tema_estudiante.php', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                                credentials: 'include',
                                body: JSON.stringify(createPayload)
                            });
                            
                            if (!res.ok && res.status !== 409) {
                                const errorData = await res.json().catch(() => ({}));
                                console.error(`Error creating tema_estudiante for contenido ${contenidoId}:`, errorData.message);
                                throw new Error(`Error creando tema: ${errorData.message || 'Error desconocido'}`);
                            }
                        } catch (err) {
                            console.error(`Error creating tema_estudiante for contenido ${contenidoId}:`, err);
                            throw err;
                        }
                    }
                }
                
                // Ensure all temas from this materia have tema_estudiante records
                // If any tema doesn't have a record yet, create it with default values
                for (const contenidoId of allContenidoIds) {
                    const existingRecord = previousTemaEstudiante.find(te => parseInt(te.Contenido_ID_contenido) === contenidoId);
                    const temaEstIdInput = modal.querySelector(`.tema-est-id[data-contenido-id="${contenidoId}"]`);
                    
                    // If no record exists and wasn't created above, create it now
                    if (!existingRecord && !temaEstIdInput) {
                        try {
                            const estadoSelect = modal.querySelector(`.tema-estado[data-contenido-id="${contenidoId}"]`);
                            const observacionesTextarea = modal.querySelector(`.tema-observaciones[data-contenido-id="${contenidoId}"]`);
                            
                            const estado = estadoSelect ? estadoSelect.value : 'PENDIENTE';
                            const observaciones = observacionesTextarea ? observacionesTextarea.value.trim() : '';
                            
                            const createPayload = {
                                Contenido_ID_contenido: contenidoId,
                                Estudiante_ID_Estudiante: studentId,
                                Estado: estado,
                                Observaciones: observaciones || null
                            };
                            
                            const res = await fetch('../api/tema_estudiante.php', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                                credentials: 'include',
                                body: JSON.stringify(createPayload)
                            });
                            
                            if (!res.ok && res.status !== 409) {
                                const errorData = await res.json().catch(() => ({}));
                                console.error(`Error creating tema_estudiante for contenido ${contenidoId}:`, errorData.message);
                            }
                        } catch (err) {
                            console.error(`Error creating tema_estudiante for contenido ${contenidoId}:`, err);
                        }
                    }
                }
                
                // Reload data
                if (typeof loadAppData === 'function') {
                    await loadAppData();
                } else if (typeof refreshAppData === 'function') {
                    await refreshAppData();
                } else if (typeof loadData === 'function') {
                    await loadData();
                }
                
                // Close modal
                modal.remove();
                
                // Show success message
                if (typeof showNotification === 'function') {
                    showNotification(`Temas gestionados correctamente`, 'success');
                } else {
                    alert('Temas gestionados correctamente');
                }
                
                // Reload student list if function exists
                if (typeof window.loadMateriaStudents === 'function') {
                    window.loadMateriaStudents(subjectId);
                }
            } catch (error) {
                console.error('Error saving tema assignments:', error);
                alert(`Error al guardar las asignaciones: ${error.message}`);
            }
        };
    }
    
    // Show modal
    if (typeof showModal === 'function') {
        showModal('assignTemaModal');
    } else {
        modal.classList.add('active');
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

// ============================================================================
// Bulk Upload Temas Functions
// ============================================================================

/**
 * Parse CSV file for temas (topics)
 */
function parseBulkTemasCSV(file, callback) {
    const reader = new FileReader();
    reader.onload = function(e) {
        const text = e.target.result;
        const lines = text.split('\n').filter(line => line.trim());
        
        if (lines.length === 0) {
            callback([]);
            return;
        }
        
        // Detectar delimitador (coma o punto y coma)
        const delimiter = text.includes(';') ? ';' : ',';
        
        // Parsear headers
        const headers = lines[0].split(delimiter).map(h => h.trim().replace(/^"|"$/g, ''));
        
        // Buscar columnas de Tema y Descripción (case-insensitive)
        const temaIndex = headers.findIndex(h => 
            h.toLowerCase() === 'tema' || h.toLowerCase() === 'topic' || 
            h.toLowerCase() === 'título' || h.toLowerCase() === 'title'
        );
        const descripcionIndex = headers.findIndex(h => 
            h.toLowerCase() === 'descripción' || h.toLowerCase() === 'descripcion' ||
            h.toLowerCase() === 'description' || h.toLowerCase() === 'desc'
        );
        
        // Si no encontramos las columnas, intentar con el orden
        let temaCol = temaIndex >= 0 ? temaIndex : 0;
        let descripcionCol = descripcionIndex >= 0 ? descripcionIndex : 1;
        
        const temas = [];
        
        // Procesar filas (saltar header)
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;
            
            // Parsear línea considerando comillas
            const values = [];
            let current = '';
            let inQuotes = false;
            
            for (let j = 0; j < line.length; j++) {
                const char = line[j];
                if (char === '"') {
                    inQuotes = !inQuotes;
                } else if ((char === delimiter || char === ',') && !inQuotes) {
                    values.push(current.trim());
                    current = '';
                } else {
                    current += char;
                }
            }
            values.push(current.trim()); // Último valor
            
            const tema = values[temaCol] || '';
            const descripcion = values[descripcionCol] || '';
            
            if (tema) {
                temas.push({
                    Tema: tema.replace(/^"|"$/g, ''),
                    Descripcion: descripcion.replace(/^"|"$/g, '') || null,
                    isValid: tema.trim().length > 0
                });
            }
        }
        
        callback(temas);
    };
    
    reader.onerror = function() {
        callback([]);
    };
    
    reader.readAsText(file);
}

/**
 * Setup CSV upload handlers for temas
 */
function setupBulkTemasCsvUploadHandlers() {
    const uploadArea = document.getElementById('bulkTemasCsvUploadArea');
    const fileInput = document.getElementById('bulkTemasFileInput');
    const fileInfo = document.getElementById('bulkTemasCsvFileInfo');
    const fileName = document.getElementById('bulkTemasCsvFileName');
    const fileSize = document.getElementById('bulkTemasCsvFileSize');
    const removeFileBtn = document.getElementById('bulkTemasCsvRemoveFile');
    const previewDiv = document.getElementById('bulkTemasCsvPreview');
    const previewContent = document.getElementById('bulkTemasCsvPreviewContent');
    const previewTotal = document.getElementById('bulkTemasCsvPreviewTotal');
    
    if (!uploadArea || !fileInput) return;
    
    // Función para procesar archivo seleccionado
    const processFile = (file) => {
        if (!file) return;
        
        // Validar tipo de archivo
        const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
        if (fileExtension === '.xlsx') {
            alert('Por favor exporta tu archivo Excel como CSV primero. En Excel: Archivo > Guardar como > Formato CSV (delimitado por comas).');
            return;
        }
        if (fileExtension !== '.csv') {
            alert('Por favor selecciona un archivo CSV (.csv)');
            return;
        }
        
        // Mostrar información del archivo
        fileName.textContent = file.name;
        fileSize.textContent = (file.size / 1024).toFixed(2) + ' KB';
        fileInfo.style.display = 'block';
        
        // Parsear CSV
        parseBulkTemasCSV(file, function(temas) {
            if (temas.length === 0) {
                alert('El archivo CSV está vacío o no tiene el formato correcto');
                fileInput.value = '';
                fileInfo.style.display = 'none';
                previewDiv.style.display = 'none';
                return;
            }
            
            // Guardar datos parseados
            fileInput._parsedData = temas;
            
            // Mostrar preview
            previewDiv.style.display = 'block';
            const previewRows = temas.slice(0, 5);
            previewContent.innerHTML = `
                <table style="width: 100%; border-collapse: collapse; font-size: 0.9em;">
                    <thead>
                        <tr style="background: #f0f0f0;">
                            <th style="padding: 8px; text-align: left; border: 1px solid #ddd;">Tema</th>
                            <th style="padding: 8px; text-align: left; border: 1px solid #ddd;">Descripción</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${previewRows.map(row => `
                            <tr>
                                <td style="padding: 8px; border: 1px solid #ddd;">${row.Tema || ''}</td>
                                <td style="padding: 8px; border: 1px solid #ddd;">${row.Descripcion || ''}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                ${temas.length > 5 ? `<p style="margin-top: 8px; color: #666;">... y ${temas.length - 5} más</p>` : ''}
            `;
            previewTotal.textContent = `Total: ${temas.length} tema(s)`;
        });
    };
    
    // Handler para selección de archivo
    fileInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        processFile(file);
    });
    
    // Handlers para drag-and-drop
    uploadArea.addEventListener('dragover', function(e) {
        e.preventDefault();
        e.stopPropagation();
        uploadArea.classList.add('drag-over');
    });
    
    uploadArea.addEventListener('dragleave', function(e) {
        e.preventDefault();
        e.stopPropagation();
        uploadArea.classList.remove('drag-over');
    });
    
    uploadArea.addEventListener('drop', function(e) {
        e.preventDefault();
        e.stopPropagation();
        uploadArea.classList.remove('drag-over');
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            fileInput.files = files;
            processFile(files[0]);
        }
    });
    
    // Handler para remover archivo
    if (removeFileBtn) {
        removeFileBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            fileInput.value = '';
            fileInput._parsedData = null;
            fileInfo.style.display = 'none';
            previewDiv.style.display = 'none';
        });
    }
}

/**
 * Toggle between CSV upload and manual table mode for temas
 */
window.toggleBulkTemasInputMode = function() {
    const textareaMode = document.getElementById('bulkTemasTextareaMode');
    const tableMode = document.getElementById('bulkTemasTableMode');
    const toggleBtn = document.getElementById('toggleTemasInputModeBtn');
    
    if (!textareaMode || !tableMode) return;
    
    const isTableMode = tableMode.style.display !== 'none';
    
    if (isTableMode) {
        // Switch to CSV mode
        tableMode.style.display = 'none';
        textareaMode.style.display = 'block';
        if (toggleBtn) {
            toggleBtn.innerHTML = '<i class="fas fa-table"></i> Modo Tabla Manual';
        }
    } else {
        // Switch to table mode
        textareaMode.style.display = 'none';
        tableMode.style.display = 'block';
        if (toggleBtn) {
            toggleBtn.innerHTML = '<i class="fas fa-file-csv"></i> Modo CSV';
        }
        // Initialize delete button visibility
        if (typeof updateTemaDeleteButtonsVisibility === 'function') {
            updateTemaDeleteButtonsVisibility();
        }
    }
};

// Manual table mode for temas
let manualTemaRowCounter = 0;

/**
 * Add a new row to the manual temas table
 */
window.addManualTemaRow = function() {
    const tbody = document.getElementById('bulkManualTemasTableBody');
    if (!tbody) return;
    
    manualTemaRowCounter++;
    const newRow = document.createElement('tr');
    newRow.innerHTML = `
        <td><input type="text" id="manualTema_${manualTemaRowCounter}" class="manual-tema-input" placeholder="Tema" style="width: 100%; padding: 6px;"></td>
        <td><input type="text" id="manualDescripcion_${manualTemaRowCounter}" class="manual-tema-input" placeholder="Descripción (opcional)" style="width: 100%; padding: 6px;"></td>
        <td>
            <div style="display: flex; gap: 4px; align-items: center;">
                <button type="button" class="btn-icon btn-primary" onclick="addManualTemaRow(); return false;" title="Agregar siguiente tema">
                    <i class="fas fa-plus"></i>
                </button>
                <button type="button" class="btn-icon btn-delete" onclick="removeManualTemaRow(this); return false;" title="Eliminar tema">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </td>
    `;
    tbody.appendChild(newRow);
    
    // Update delete button visibility
    updateTemaDeleteButtonsVisibility();
    
    // Focus on the new tema input
    const newTemaInput = document.getElementById(`manualTema_${manualTemaRowCounter}`);
    if (newTemaInput) {
        newTemaInput.focus();
    }
    
    // Setup Enter key handler for description field
    const descInput = document.getElementById(`manualDescripcion_${manualTemaRowCounter}`);
    if (descInput) {
        descInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                addManualTemaRow();
            }
        });
    }
};

/**
 * Remove a specific row from manual temas table
 */
window.removeManualTemaRow = function(button) {
    const tbody = document.getElementById('bulkManualTemasTableBody');
    if (!tbody || !button) return;
    
    const row = button.closest('tr');
    if (!row) return;
    
    // Keep at least one row
    if (tbody.children.length <= 1) {
        alert('Debe haber al menos una fila');
        return;
    }
    
    tbody.removeChild(row);
    manualTemaRowCounter = Math.max(0, manualTemaRowCounter - 1);
    
    // Update delete button visibility
    updateTemaDeleteButtonsVisibility();
};

/**
 * Update delete button visibility for temas
 */
function updateTemaDeleteButtonsVisibility() {
    const tbody = document.getElementById('bulkManualTemasTableBody');
    if (!tbody) return;
    
    const rows = tbody.querySelectorAll('tr');
    rows.forEach((row, index) => {
        const deleteBtn = row.querySelector('.btn-delete');
        if (deleteBtn) {
            // Show delete button if there's more than one row, hide for the first row
            deleteBtn.style.display = rows.length > 1 ? '' : 'none';
        }
    });
}

/**
 * Collect temas from manual table
 */
function collectManualTemasFromTable() {
    const tbody = document.getElementById('bulkManualTemasTableBody');
    if (!tbody) return [];
    
    const temas = [];
    const rows = tbody.querySelectorAll('tr');
    
    rows.forEach(row => {
        const temaInput = row.querySelector('input[id^="manualTema_"]');
        const descInput = row.querySelector('input[id^="manualDescripcion_"]');
        
        const tema = temaInput ? temaInput.value.trim() : '';
        const descripcion = descInput ? descInput.value.trim() : '';
        
        if (tema) {
            temas.push({
                Tema: tema,
                Descripcion: descripcion || null,
                isValid: true
            });
        }
    });
    
    return temas;
}

/**
 * Process bulk temas upload
 */
window.processBulkTemas = async function() {
    const temasFileInput = document.getElementById('bulkTemasFileInput');
    const statusSelect = document.getElementById('bulkTemaStatus');
    
    if (!temasFileInput || !statusSelect) {
        alert('Error: No se encontraron los campos del formulario');
        return;
    }
    
    // Get subject ID from modal or context
    const modal = document.getElementById('importTemasModal');
    let subjectId = null;
    
    if (modal && modal.dataset.subjectId) {
        subjectId = parseInt(modal.dataset.subjectId);
    } else if (typeof getCurrentThemesSubjectId === 'function') {
        subjectId = getCurrentThemesSubjectId();
    }
    
    if (!subjectId) {
        alert('Error: No se pudo determinar la materia. Por favor, intente nuevamente.');
        return;
    }
    
    const defaultStatus = statusSelect.value;
    
    // Determinar modo de entrada
    const tableMode = document.getElementById('bulkTemasTableMode');
    const isTableMode = tableMode && tableMode.style.display !== 'none';
    
    let temas = [];
    if (isTableMode) {
        // Leer de la tabla manual
        temas = collectManualTemasFromTable();
        if (temas.length === 0) {
            alert('Por favor ingresa al menos un tema en la tabla');
            return;
        }
    } else {
        // Parsear del archivo CSV
        const file = temasFileInput.files[0];
        if (!file) {
            alert('Por favor selecciona un archivo CSV o usa el modo tabla manual');
            return;
        }
        
        // Usar los datos ya parseados si están disponibles
        if (temasFileInput._parsedData) {
            temas = temasFileInput._parsedData;
        } else {
            alert('Error: No se pudo leer el archivo. Por favor, vuelve a seleccionarlo.');
            return;
        }
    }
    
    if (temas.length === 0) {
        alert('No se pudieron parsear temas de la lista. Verifica el formato.');
        return;
    }
    
    // Filtrar temas válidos
    const validTemas = temas.filter(t => t.isValid);
    
    if (validTemas.length === 0) {
        alert('No se encontraron temas válidos. Verifica el formato (Tema, Descripción opcional)');
        return;
    }
    
    // Confirmar antes de proceder
    const confirmMessage = `¿Deseas crear ${validTemas.length} tema(s) para esta materia?`;
    if (!confirm(confirmMessage)) {
        return;
    }
    
    // Procesar temas uno por uno
    let successCount = 0;
    let errorCount = 0;
    const errors = [];
    
    // Mostrar indicador de progreso
    const submitBtn = document.querySelector('#bulkTemasForm button[onclick*="processBulkTemas"]');
    const originalBtnText = submitBtn ? submitBtn.textContent : '';
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = `Procesando... (0/${validTemas.length})`;
    }
    
    try {
        const isInPages = window.location.pathname.includes('/pages/');
        const baseUrl = isInPages ? '../api' : 'api';
        
        for (let i = 0; i < validTemas.length; i++) {
            const tema = validTemas[i];
            
            // Actualizar progreso
            if (submitBtn) {
                submitBtn.textContent = `Procesando... (${i + 1}/${validTemas.length})`;
            }
            
            try {
                const payload = {
                    Tema: tema.Tema,
                    Descripcion: tema.Descripcion || null,
                    Estado: defaultStatus,
                    Materia_ID_materia: subjectId
                };
                
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
                
                successCount++;
            } catch (err) {
                errorCount++;
                errors.push(`${tema.Tema}: ${err.message || 'Error desconocido'}`);
                console.error(`Error procesando ${tema.Tema}:`, err);
            }
        }
        
        // Recargar datos
        if (typeof loadData === 'function') {
            await loadData();
        }
        
        // Reload themes list
        const currentId = getCurrentThemesSubjectId();
        if (currentId) {
            loadSubjectThemesList(currentId);
        }
        
        // Cerrar modal
        if (typeof closeModal === 'function') {
            closeModal('importTemasModal');
        } else {
            const modal = document.getElementById('importTemasModal');
            if (modal) modal.classList.remove('active');
        }
        
        // Reset form
        const form = document.getElementById('bulkTemasForm');
        if (form) {
            form.reset();
            const fileInput = document.getElementById('bulkTemasFileInput');
            if (fileInput) {
                fileInput.value = '';
                fileInput._parsedData = null;
            }
            const fileInfo = document.getElementById('bulkTemasCsvFileInfo');
            const previewDiv = document.getElementById('bulkTemasCsvPreview');
            if (fileInfo) fileInfo.style.display = 'none';
            if (previewDiv) previewDiv.style.display = 'none';
            manualTemaRowCounter = 0;
        }
        
        // Mostrar resultado
        let message = `Se crearon ${successCount} tema(s) correctamente.`;
        if (errorCount > 0) {
            message += `\n\nHubo ${errorCount} error(es):\n${errors.slice(0, 5).join('\n')}${errors.length > 5 ? '\n...' : ''}`;
        }
        
        if (typeof showNotification === 'function') {
            showNotification(message, errorCount > 0 ? 'warning' : 'success');
        } else {
            alert(message);
        }
        
    } catch (err) {
        alert('Error al procesar la carga masiva: ' + (err.message || 'Error desconocido'));
    } finally {
        // Restaurar botón
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = originalBtnText || 'Cargar Temas';
        }
    }
};

// Initialize bulk temas upload handlers when modal is opened
document.addEventListener('DOMContentLoaded', function() {
    // Setup CSV upload handlers when import temas modal is shown
    const importTemasModal = document.getElementById('importTemasModal');
    if (importTemasModal) {
        // Setup handlers when modal opens
        const setupHandlers = () => {
            setupBulkTemasCsvUploadHandlers();
            
            // Setup Enter key handlers for manual table inputs
            const temaInputs = document.querySelectorAll('.manual-tema-input');
            temaInputs.forEach(input => {
                if (!input.dataset.enterHandler) {
                    input.addEventListener('keypress', function(e) {
                        if (e.key === 'Enter') {
                            e.preventDefault();
                            const isDesc = input.id.includes('manualDescripcion_');
                            if (isDesc) {
                                addManualTemaRow();
                            } else {
                                // Focus next field (description)
                                const row = input.closest('tr');
                                const descInput = row.querySelector('input[id^="manualDescripcion_"]');
                                if (descInput) {
                                    descInput.focus();
                                } else {
                                    addManualTemaRow();
                                }
                            }
                        }
                    });
                    input.dataset.enterHandler = 'true';
                }
            });
        };
        
        // Use MutationObserver to detect when modal becomes active
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                    const modal = mutation.target;
                    if (modal.classList.contains('active') && modal.id === 'importTemasModal') {
                        setTimeout(setupHandlers, 100);
                    }
                }
            });
        });
        
        observer.observe(importTemasModal, {
            attributes: true,
            attributeFilter: ['class']
        });
        
        // Also setup on initial load if modal is already active
        if (importTemasModal.classList.contains('active')) {
            setTimeout(setupHandlers, 100);
        }
    }
});

// ============================================================================
// Bulk Upload Evaluaciones Functions
// ============================================================================

/**
 * Parse CSV file for evaluaciones
 */
function parseBulkEvaluacionesCSV(file, callback) {
    const reader = new FileReader();
    reader.onload = function(e) {
        const text = e.target.result;
        const lines = text.split('\n').filter(line => line.trim());
        
        if (lines.length === 0) {
            callback([]);
            return;
        }
        
        // Detectar delimitador (coma o punto y coma)
        const delimiter = text.includes(';') ? ';' : ',';
        
        // Parsear headers
        const headers = lines[0].split(delimiter).map(h => h.trim().replace(/^"|"$/g, '').toLowerCase());
        
        // Buscar columnas (case-insensitive)
        const tituloIndex = headers.findIndex(h => 
            h === 'título' || h === 'titulo' || h === 'title'
        );
        const descripcionIndex = headers.findIndex(h => 
            h === 'descripción' || h === 'descripcion' || h === 'description' || h === 'desc'
        );
        const fechaIndex = headers.findIndex(h => 
            h === 'fecha' || h === 'date'
        );
        const tipoIndex = headers.findIndex(h => 
            h === 'tipo' || h === 'type'
        );
        const pesoIndex = headers.findIndex(h => 
            h === 'peso' || h === 'weight'
        );
        const estadoIndex = headers.findIndex(h => 
            h === 'estado' || h === 'status' || h === 'state'
        );
        
        // Si no encontramos las columnas, usar orden por defecto
        let tituloCol = tituloIndex >= 0 ? tituloIndex : 0;
        let descripcionCol = descripcionIndex >= 0 ? descripcionIndex : 1;
        let fechaCol = fechaIndex >= 0 ? fechaIndex : 2;
        let tipoCol = tipoIndex >= 0 ? tipoIndex : 3;
        let pesoCol = pesoIndex >= 0 ? pesoIndex : 4;
        let estadoCol = estadoIndex >= 0 ? estadoIndex : 5;
        
        const evaluaciones = [];
        
        // Procesar filas (saltar header)
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;
            
            // Parsear línea considerando comillas
            const values = [];
            let current = '';
            let inQuotes = false;
            
            for (let j = 0; j < line.length; j++) {
                const char = line[j];
                if (char === '"') {
                    inQuotes = !inQuotes;
                } else if ((char === delimiter || char === ',') && !inQuotes) {
                    values.push(current.trim());
                    current = '';
                } else {
                    current += char;
                }
            }
            values.push(current.trim()); // Último valor
            
            const titulo = values[tituloCol] || '';
            const descripcion = values[descripcionCol] || '';
            const fecha = values[fechaCol] || '';
            const tipo = values[tipoCol] || '';
            const peso = values[pesoCol] || '';
            const estado = values[estadoCol] || '';
            
            if (titulo && fecha && tipo) {
                evaluaciones.push({
                    Titulo: titulo.replace(/^"|"$/g, ''),
                    Descripcion: descripcion.replace(/^"|"$/g, '') || null,
                    Fecha: fecha.replace(/^"|"$/g, ''),
                    Tipo: tipo.replace(/^"|"$/g, '').toUpperCase(),
                    Peso: peso ? parseFloat(peso.replace(/^"|"$/g, '')) || 1.0 : 1.0,
                    Estado: estado.replace(/^"|"$/g, '').toUpperCase() || 'PROGRAMADA',
                    isValid: titulo.trim().length > 0 && fecha.trim().length > 0 && tipo.trim().length > 0
                });
            }
        }
        
        callback(evaluaciones);
    };
    
    reader.onerror = function() {
        callback([]);
    };
    
    reader.readAsText(file);
}

/**
 * Setup CSV upload handlers for evaluaciones
 */
function setupBulkEvaluacionesCsvUploadHandlers() {
    const uploadArea = document.getElementById('bulkEvaluacionesCsvUploadArea');
    const fileInput = document.getElementById('bulkEvaluacionesFileInput');
    const fileInfo = document.getElementById('bulkEvaluacionesCsvFileInfo');
    const fileName = document.getElementById('bulkEvaluacionesCsvFileName');
    const fileSize = document.getElementById('bulkEvaluacionesCsvFileSize');
    const removeFileBtn = document.getElementById('bulkEvaluacionesCsvRemoveFile');
    const previewDiv = document.getElementById('bulkEvaluacionesCsvPreview');
    const previewContent = document.getElementById('bulkEvaluacionesCsvPreviewContent');
    const previewTotal = document.getElementById('bulkEvaluacionesCsvPreviewTotal');
    
    if (!uploadArea || !fileInput) return;
    
    // Función para procesar archivo seleccionado
    const processFile = (file) => {
        if (!file) return;
        
        // Validar tipo de archivo
        const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
        if (fileExtension === '.xlsx') {
            alert('Por favor exporta tu archivo Excel como CSV primero. En Excel: Archivo > Guardar como > Formato CSV (delimitado por comas).');
            return;
        }
        if (fileExtension !== '.csv') {
            alert('Por favor selecciona un archivo CSV (.csv)');
            return;
        }
        
        // Mostrar información del archivo
        fileName.textContent = file.name;
        fileSize.textContent = (file.size / 1024).toFixed(2) + ' KB';
        fileInfo.style.display = 'block';
        
        // Parsear CSV
        parseBulkEvaluacionesCSV(file, function(evaluaciones) {
            if (evaluaciones.length === 0) {
                alert('El archivo CSV está vacío o no tiene el formato correcto');
                fileInput.value = '';
                fileInfo.style.display = 'none';
                previewDiv.style.display = 'none';
                return;
            }
            
            // Guardar datos parseados
            fileInput._parsedData = evaluaciones;
            
            // Mostrar preview
            previewDiv.style.display = 'block';
            const previewRows = evaluaciones.slice(0, 5);
            previewContent.innerHTML = `
                <table style="width: 100%; border-collapse: collapse; font-size: 0.9em;">
                    <thead>
                        <tr style="background: #f0f0f0;">
                            <th style="padding: 8px; text-align: left; border: 1px solid #ddd;">Título</th>
                            <th style="padding: 8px; text-align: left; border: 1px solid #ddd;">Fecha</th>
                            <th style="padding: 8px; text-align: left; border: 1px solid #ddd;">Tipo</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${previewRows.map(row => `
                            <tr>
                                <td style="padding: 8px; border: 1px solid #ddd;">${row.Titulo || ''}</td>
                                <td style="padding: 8px; border: 1px solid #ddd;">${row.Fecha || ''}</td>
                                <td style="padding: 8px; border: 1px solid #ddd;">${row.Tipo || ''}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                ${evaluaciones.length > 5 ? `<p style="margin-top: 8px; color: #666;">... y ${evaluaciones.length - 5} más</p>` : ''}
            `;
            previewTotal.textContent = `Total: ${evaluaciones.length} evaluación(es)`;
        });
    };
    
    // Handler para selección de archivo
    fileInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        processFile(file);
    });
    
    // Handlers para drag-and-drop
    uploadArea.addEventListener('dragover', function(e) {
        e.preventDefault();
        e.stopPropagation();
        uploadArea.classList.add('drag-over');
    });
    
    uploadArea.addEventListener('dragleave', function(e) {
        e.preventDefault();
        e.stopPropagation();
        uploadArea.classList.remove('drag-over');
    });
    
    uploadArea.addEventListener('drop', function(e) {
        e.preventDefault();
        e.stopPropagation();
        uploadArea.classList.remove('drag-over');
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            fileInput.files = files;
            processFile(files[0]);
        }
    });
    
    // Handler para remover archivo
    if (removeFileBtn) {
        removeFileBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            fileInput.value = '';
            fileInput._parsedData = null;
            fileInfo.style.display = 'none';
            previewDiv.style.display = 'none';
        });
    }
}

/**
 * Toggle between CSV upload and manual table mode for evaluaciones
 */
window.toggleBulkEvaluacionesInputMode = function() {
    const textareaMode = document.getElementById('bulkEvaluacionesTextareaMode');
    const tableMode = document.getElementById('bulkEvaluacionesTableMode');
    const toggleBtn = document.getElementById('toggleEvaluacionesInputModeBtn');
    
    if (!textareaMode || !tableMode) return;
    
    const isTableMode = tableMode.style.display !== 'none';
    
    if (isTableMode) {
        // Switch to CSV mode
        tableMode.style.display = 'none';
        textareaMode.style.display = 'block';
        if (toggleBtn) {
            toggleBtn.innerHTML = '<i class="fas fa-table"></i> Modo Tabla Manual';
        }
    } else {
        // Switch to table mode
        textareaMode.style.display = 'none';
        tableMode.style.display = 'block';
        if (toggleBtn) {
            toggleBtn.innerHTML = '<i class="fas fa-file-csv"></i> Modo CSV';
        }
        // Initialize delete button visibility
        if (typeof updateEvaluacionDeleteButtonsVisibility === 'function') {
            updateEvaluacionDeleteButtonsVisibility();
        }
    }
};

// Manual table mode for evaluaciones
let manualEvaluacionRowCounter = 0;

/**
 * Add a new row to the manual evaluaciones table
 */
window.addManualEvaluacionRow = function() {
    const tbody = document.getElementById('bulkManualEvaluacionesTableBody');
    if (!tbody) return;
    
    manualEvaluacionRowCounter++;
    
    // Create first row (Título and Descripción)
    const row1 = document.createElement('tr');
    row1.innerHTML = `
        <td style="width: 50%;"><input type="text" id="manualTitulo_${manualEvaluacionRowCounter}" class="manual-evaluacion-input" placeholder="Título" style="width: 100%; padding: 6px;"></td>
        <td style="width: 50%;"><input type="text" id="manualDescripcionEval_${manualEvaluacionRowCounter}" class="manual-evaluacion-input" placeholder="Descripción (opcional)" style="width: 100%; padding: 6px;"></td>
    `;
    tbody.appendChild(row1);
    
    // Create second row (Fecha, Tipo, and Acción)
    const row2 = document.createElement('tr');
    row2.innerHTML = `
        <td style="width: 50%;"><input type="date" id="manualFecha_${manualEvaluacionRowCounter}" class="manual-evaluacion-input" style="width: 100%; padding: 6px;"></td>
        <td style="width: 50%;">
            <select id="manualTipo_${manualEvaluacionRowCounter}" class="manual-evaluacion-input" style="width: 100%; padding: 6px;">
                <option value="EXAMEN">Examen</option>
                <option value="PARCIAL">Parcial</option>
                <option value="TRABAJO_PRACTICO">Trabajo Práctico</option>
                <option value="PROYECTO">Proyecto</option>
                <option value="ORAL">Oral</option>
                <option value="PRACTICO">Práctico</option>
            </select>
        </td>
        <td style="width: 80px;">
            <div style="display: flex; gap: 4px; align-items: center;">
                <button type="button" class="btn-icon btn-primary" onclick="addManualEvaluacionRow(); return false;" title="Agregar siguiente evaluación">
                    <i class="fas fa-plus"></i>
                </button>
                <button type="button" class="btn-icon btn-delete" onclick="removeManualEvaluacionRow(this); return false;" title="Eliminar evaluación">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </td>
    `;
    tbody.appendChild(row2);
    
    // Update delete button visibility
    updateEvaluacionDeleteButtonsVisibility();
    
    // Focus on the new titulo input
    const newTituloInput = document.getElementById(`manualTitulo_${manualEvaluacionRowCounter}`);
    if (newTituloInput) {
        newTituloInput.focus();
    }
    
    // Setup Enter key handlers for all fields in the new rows
    const descInput = document.getElementById(`manualDescripcionEval_${manualEvaluacionRowCounter}`);
    const fechaInput = document.getElementById(`manualFecha_${manualEvaluacionRowCounter}`);
    const tipoInput = document.getElementById(`manualTipo_${manualEvaluacionRowCounter}`);
    
    // Título -> Descripción (same row)
    if (newTituloInput) {
        newTituloInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                if (descInput) {
                    descInput.focus();
                }
            }
        });
    }
    
    // Descripción -> Fecha (next row)
    if (descInput) {
        descInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                if (fechaInput) {
                    fechaInput.focus();
                }
            }
        });
    }
    
    // Fecha -> Tipo (same row)
    if (fechaInput) {
        fechaInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                if (tipoInput) {
                    tipoInput.focus();
                }
            }
        });
    }
    
    // Tipo -> Add new row
    if (tipoInput) {
        tipoInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                addManualEvaluacionRow();
            }
        });
    }
};

/**
 * Remove a specific evaluacion from manual evaluaciones table
 */
window.removeManualEvaluacionRow = function(button) {
    const tbody = document.getElementById('bulkManualEvaluacionesTableBody');
    if (!tbody || !button) return;
    
    // Find the row containing the button (should be the second row of the evaluacion)
    const row2 = button.closest('tr');
    if (!row2) return;
    
    // Find the first row (Título and Descripción) - it's the previous sibling
    const row1 = row2.previousElementSibling;
    if (!row1) return;
    
    // Keep at least one evaluacion (2 rows)
    if (tbody.children.length <= 2) {
        alert('Debe haber al menos una evaluación');
        return;
    }
    
    // Remove both rows (one evaluacion = 2 rows)
    tbody.removeChild(row2); // Remove second row
    tbody.removeChild(row1); // Remove first row
    manualEvaluacionRowCounter = Math.max(0, manualEvaluacionRowCounter - 1);
    
    // Update delete button visibility
    updateEvaluacionDeleteButtonsVisibility();
};

/**
 * Update delete button visibility for evaluaciones
 */
function updateEvaluacionDeleteButtonsVisibility() {
    const tbody = document.getElementById('bulkManualEvaluacionesTableBody');
    if (!tbody) return;
    
    const rows = tbody.querySelectorAll('tr');
    // Each evaluacion has 2 rows, so count evaluaciones
    const evaluacionCount = rows.length / 2;
    
    // Process rows in pairs
    for (let i = 0; i < rows.length; i += 2) {
        if (i + 1 < rows.length) {
            const row2 = rows[i + 1]; // Second row has the action buttons
            const deleteBtn = row2.querySelector('.btn-delete');
            if (deleteBtn) {
                // Show delete button if there's more than one evaluacion, hide for the first one
                deleteBtn.style.display = evaluacionCount > 1 ? '' : 'none';
            }
        }
    }
}

/**
 * Collect evaluaciones from manual table
 */
function collectManualEvaluacionesFromTable() {
    const tbody = document.getElementById('bulkManualEvaluacionesTableBody');
    if (!tbody) return [];
    
    // Get default values from form
    const pesoInput = document.getElementById('bulkEvaluacionPeso');
    const estadoSelect = document.getElementById('bulkEvaluacionEstado');
    const defaultPeso = pesoInput ? parseFloat(pesoInput.value) || 1.0 : 1.0;
    const defaultEstado = estadoSelect ? estadoSelect.value : 'PROGRAMADA';
    
    const evaluaciones = [];
    const rows = tbody.querySelectorAll('tr');
    
    // Process rows in pairs (each evaluacion has 2 rows)
    for (let i = 0; i < rows.length; i += 2) {
        if (i + 1 >= rows.length) break; // Need both rows
        
        const row1 = rows[i]; // Título and Descripción row
        const row2 = rows[i + 1]; // Fecha, Tipo, and Acción row
        
        const tituloInput = row1.querySelector('input[id^="manualTitulo_"]');
        const descInput = row1.querySelector('input[id^="manualDescripcionEval_"]');
        const fechaInput = row2.querySelector('input[id^="manualFecha_"]');
        const tipoInput = row2.querySelector('select[id^="manualTipo_"]');
        
        const titulo = tituloInput ? tituloInput.value.trim() : '';
        const descripcion = descInput ? descInput.value.trim() : '';
        const fecha = fechaInput ? fechaInput.value.trim() : '';
        const tipo = tipoInput ? tipoInput.value.trim() : '';
        
        if (titulo && fecha && tipo) {
            evaluaciones.push({
                Titulo: titulo,
                Descripcion: descripcion || null,
                Fecha: fecha,
                Tipo: tipo.toUpperCase(),
                Peso: defaultPeso,
                Estado: defaultEstado,
                isValid: true
            });
        }
    }
    
    return evaluaciones;
}

/**
 * Process bulk evaluaciones upload
 */
window.processBulkEvaluaciones = async function() {
    const evaluacionesFileInput = document.getElementById('bulkEvaluacionesFileInput');
    const pesoInput = document.getElementById('bulkEvaluacionPeso');
    const estadoSelect = document.getElementById('bulkEvaluacionEstado');
    
    if (!evaluacionesFileInput || !pesoInput || !estadoSelect) {
        alert('Error: No se encontraron los campos del formulario');
        return;
    }
    
    // Get subject ID from modal or context
    const modal = document.getElementById('importEvaluacionesModal');
    let subjectId = null;
    
    if (modal && modal.dataset.subjectId) {
        subjectId = parseInt(modal.dataset.subjectId);
    } else if (typeof getCurrentThemesSubjectId === 'function') {
        subjectId = getCurrentThemesSubjectId();
    }
    
    if (!subjectId) {
        alert('Error: No se pudo determinar la materia. Por favor, intente nuevamente.');
        return;
    }
    
    const defaultPeso = parseFloat(pesoInput.value) || 1.0;
    const defaultEstado = estadoSelect.value;
    
    // Determinar modo de entrada
    const tableMode = document.getElementById('bulkEvaluacionesTableMode');
    const isTableMode = tableMode && tableMode.style.display !== 'none';
    
    let evaluaciones = [];
    if (isTableMode) {
        // Leer de la tabla manual
        evaluaciones = collectManualEvaluacionesFromTable();
        if (evaluaciones.length === 0) {
            alert('Por favor ingresa al menos una evaluación en la tabla');
            return;
        }
    } else {
        // Parsear del archivo CSV
        const file = evaluacionesFileInput.files[0];
        if (!file) {
            alert('Por favor selecciona un archivo CSV o usa el modo tabla manual');
            return;
        }
        
        // Usar los datos ya parseados si están disponibles
        if (evaluacionesFileInput._parsedData) {
            evaluaciones = evaluacionesFileInput._parsedData;
        } else {
            alert('Error: No se pudo leer el archivo. Por favor, vuelve a seleccionarlo.');
            return;
        }
    }
    
    if (evaluaciones.length === 0) {
        alert('No se pudieron parsear evaluaciones de la lista. Verifica el formato.');
        return;
    }
    
    // Filtrar evaluaciones válidas
    const validEvaluaciones = evaluaciones.filter(e => e.isValid);
    
    if (validEvaluaciones.length === 0) {
        alert('No se encontraron evaluaciones válidas. Verifica el formato (Título, Fecha, Tipo son obligatorios)');
        return;
    }
    
    // Confirmar antes de proceder
    const confirmMessage = `¿Deseas crear ${validEvaluaciones.length} evaluación(es) para esta materia?`;
    if (!confirm(confirmMessage)) {
        return;
    }
    
    // Procesar evaluaciones una por una
    let successCount = 0;
    let errorCount = 0;
    const errors = [];
    
    // Mostrar indicador de progreso
    const submitBtn = document.querySelector('#bulkEvaluacionesForm button[onclick*="processBulkEvaluaciones"]');
    const originalBtnText = submitBtn ? submitBtn.textContent : '';
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = `Procesando... (0/${validEvaluaciones.length})`;
    }
    
    try {
        const isInPages = window.location.pathname.includes('/pages/');
        const baseUrl = isInPages ? '../api' : 'api';
        
        for (let i = 0; i < validEvaluaciones.length; i++) {
            const evaluacion = validEvaluaciones[i];
            
            // Actualizar progreso
            if (submitBtn) {
                submitBtn.textContent = `Procesando... (${i + 1}/${validEvaluaciones.length})`;
            }
            
            try {
                const payload = {
                    Titulo: evaluacion.Titulo,
                    Descripcion: evaluacion.Descripcion || null,
                    Fecha: evaluacion.Fecha,
                    Tipo: evaluacion.Tipo,
                    Peso: evaluacion.Peso || defaultPeso,
                    Estado: evaluacion.Estado || defaultEstado,
                    Materia_ID_materia: subjectId
                };
                
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
                
                if (!res.ok) {
                    throw new Error(data.message || 'No se pudo crear la evaluación');
                }
                
                successCount++;
            } catch (err) {
                errorCount++;
                errors.push(`${evaluacion.Titulo}: ${err.message || 'Error desconocido'}`);
                console.error(`Error procesando ${evaluacion.Titulo}:`, err);
            }
        }
        
        // Recargar datos
        if (typeof loadData === 'function') {
            await loadData();
        }
        
        // Reload evaluaciones list
        const currentId = getCurrentThemesSubjectId();
        if (currentId && typeof loadSubjectEvaluaciones === 'function') {
            loadSubjectEvaluaciones(currentId);
        }
        
        // Cerrar modal
        if (typeof closeModal === 'function') {
            closeModal('importEvaluacionesModal');
        } else {
            const modal = document.getElementById('importEvaluacionesModal');
            if (modal) modal.classList.remove('active');
        }
        
        // Reset form
        const form = document.getElementById('bulkEvaluacionesForm');
        if (form) {
            form.reset();
            const fileInput = document.getElementById('bulkEvaluacionesFileInput');
            if (fileInput) {
                fileInput.value = '';
                fileInput._parsedData = null;
            }
            const fileInfo = document.getElementById('bulkEvaluacionesCsvFileInfo');
            const previewDiv = document.getElementById('bulkEvaluacionesCsvPreview');
            if (fileInfo) fileInfo.style.display = 'none';
            if (previewDiv) previewDiv.style.display = 'none';
            manualEvaluacionRowCounter = 0;
        }
        
        // Mostrar resultado
        let message = `Se crearon ${successCount} evaluación(es) correctamente.`;
        if (errorCount > 0) {
            message += `\n\nHubo ${errorCount} error(es):\n${errors.slice(0, 5).join('\n')}${errors.length > 5 ? '\n...' : ''}`;
        }
        
        if (typeof showNotification === 'function') {
            showNotification(message, errorCount > 0 ? 'warning' : 'success');
        } else {
            alert(message);
        }
        
    } catch (err) {
        alert('Error al procesar la carga masiva: ' + (err.message || 'Error desconocido'));
    } finally {
        // Restaurar botón
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = originalBtnText || 'Cargar Evaluaciones';
        }
    }
};

// Initialize bulk evaluaciones upload handlers when modal is opened
document.addEventListener('DOMContentLoaded', function() {
    // Setup CSV upload handlers when import evaluaciones modal is shown
    const importEvaluacionesModal = document.getElementById('importEvaluacionesModal');
    if (importEvaluacionesModal) {
        // Setup handlers when modal opens
        const setupHandlers = () => {
            setupBulkEvaluacionesCsvUploadHandlers();
            
            // Setup Enter key handlers for manual table inputs
            const evaluacionInputs = document.querySelectorAll('.manual-evaluacion-input');
            evaluacionInputs.forEach(input => {
                if (!input.dataset.enterHandler) {
                    input.addEventListener('keypress', function(e) {
                        if (e.key === 'Enter') {
                            e.preventDefault();
                            const isTipo = input.tagName === 'SELECT' || input.id.includes('manualTipo_');
                            if (isTipo) {
                                addManualEvaluacionRow();
                            } else {
                                // Focus next field based on current field
                                const row = input.closest('tr');
                                let nextInput = null;
                                
                                if (input.id.includes('manualTitulo_')) {
                                    // From Título, go to Descripción (same row)
                                    nextInput = row.querySelector('input[id^="manualDescripcionEval_"]');
                                } else if (input.id.includes('manualDescripcionEval_')) {
                                    // From Descripción, go to Fecha (next row)
                                    const nextRow = row.nextElementSibling;
                                    if (nextRow) {
                                        nextInput = nextRow.querySelector('input[id^="manualFecha_"]');
                                    }
                                } else if (input.id.includes('manualFecha_')) {
                                    // From Fecha, go to Tipo (same row)
                                    nextInput = row.querySelector('select[id^="manualTipo_"]');
                                }
                                
                                if (nextInput) {
                                    nextInput.focus();
                                } else {
                                    addManualEvaluacionRow();
                                }
                            }
                        }
                    });
                    input.dataset.enterHandler = 'true';
                }
            });
        };
        
        // Use MutationObserver to detect when modal becomes active
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                    const modal = mutation.target;
                    if (modal.classList.contains('active') && modal.id === 'importEvaluacionesModal') {
                        setTimeout(setupHandlers, 100);
                    }
                }
            });
        });
        
        observer.observe(importEvaluacionesModal, {
            attributes: true,
            attributeFilter: ['class']
        });
        
        // Also setup on initial load if modal is already active
        if (importEvaluacionesModal.classList.contains('active')) {
            setTimeout(setupHandlers, 100);
        }
    }
});
