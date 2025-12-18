/**
 * Student Modals Module
 * 
 * Handles modal display and management for student-related operations,
 * including the "no subjects" warning modal and student form modal initialization.
 */

// Variable to track if handlers have been set up
let noSubjectsModalHandlersSetup = false;

/**
 * Show the "no subjects" warning modal
 */
function showNoSubjectsModal() {
    // Try to find the modal, with retries if not immediately available
    let modal = document.getElementById('noSubjectsModal');
    
    if (!modal) {
        // Wait a bit and retry (could be a DOM loading timing issue)
        setTimeout(() => {
            modal = document.getElementById('noSubjectsModal');
            if (modal) {
                showNoSubjectsModalInternal(modal);
            } else {
                // Only as last resort, use alert if after waiting it still doesn't exist
                alert('No tienes materias creadas todavía. Por favor, crea una materia primero desde la sección de "Gestión de Materias" antes de agregar estudiantes.');
            }
        }, 100);
        return;
    }
    
    showNoSubjectsModalInternal(modal);
}

/**
 * Internal function to show the no subjects modal
 * @param {HTMLElement} modal - The modal element
 */
function showNoSubjectsModalInternal(modal) {
    // Setup handlers only the first time
    if (!noSubjectsModalHandlersSetup) {
        setupNoSubjectsModalHandlers();
        noSubjectsModalHandlersSetup = true;
    }
    
    // Show the modal
    if (typeof showModal === 'function') {
        showModal('noSubjectsModal');
    } else {
        modal.classList.add('active');
    }
}

/**
 * Setup handlers for the "no subjects" modal
 */
function setupNoSubjectsModalHandlers() {
    const modal = document.getElementById('noSubjectsModal');
    if (!modal) return;
    
    // Use setupModalHandlers for close buttons
    if (typeof setupModalHandlers === 'function') {
        setupModalHandlers('noSubjectsModal');
    }
    
    // Custom handler for "go to subjects" button
    const goToSubjectsBtn = document.getElementById('goToSubjectsBtn');
    if (goToSubjectsBtn) {
        goToSubjectsBtn.addEventListener('click', () => {
            // Close the modal
            if (typeof closeModal === 'function') {
                closeModal('noSubjectsModal');
            }
            
            // Navigate to subjects section
            if (typeof showSection === 'function') {
                showSection('subjects-management');
            } else {
                // Fallback: try to change section manually
                const subjectsSection = document.querySelector('a[data-section="subjects-management"]');
                if (subjectsSection) {
                    subjectsSection.click();
                }
            }
        });
    }
}

/**
 * Override showModal to add validation for student modal
 * This wraps the original showModal function to add pre-checks
 */
function initializeStudentModalOverride() {
    // Save reference to original showModal before overriding
    const originalShowModal = typeof window.showModal === 'function' ? window.showModal : null;
    
    window.showModal = function(modalId) {
        if (modalId === 'studentModal') {
            // Verify if user has subjects before opening modal
            // API already filters subjects by logged-in teacher, so we only check for active subjects
            // State can be 'ACTIVA', 'INACTIVA', 'FINALIZADA', or null/undefined (assume active by default)
            const teacherSubjects = (appData.materia || []).filter(m => 
                !m.Estado || m.Estado === 'ACTIVA'
            );
            
            if (teacherSubjects.length === 0) {
                // Show warning modal instead of alert
                showNoSubjectsModal();
                return; // Don't open student modal
            }
        }
        
        // Call original function if it exists
        if (originalShowModal && typeof originalShowModal === 'function') {
            originalShowModal(modalId);
        } else {
            // Fallback if original doesn't exist
            const modal = document.getElementById(modalId);
            if (modal) {
                modal.classList.add('active');
            }
        }
        
        if (modalId === 'studentModal') {
            // Populate dropdowns when modal opens
            if (typeof populateStudentSubjectsSelect === 'function') {
                populateStudentSubjectsSelect();
            }
            
            // Initialize topics container visibility based on status
            // This ensures the topics dropdown is hidden by default for new students
            setTimeout(() => {
                if (typeof toggleIntensificacionThemes === 'function') {
                    toggleIntensificacionThemes();
                }
            }, 50);
            
            // Check if we're creating a student for a specific materia
            // This flag is set when clicking "Add Student" from materia details
            if (window.createStudentForMateriaId) {
                const materiaIdToUse = window.createStudentForMateriaId;
                // Clear the flag immediately to avoid reuse
                window.createStudentForMateriaId = null;
                
                setTimeout(() => {
                    if (typeof preSelectMateriaForNewStudent === 'function') {
                        preSelectMateriaForNewStudent(materiaIdToUse);
                    }
                }, 200);
            }
            
            // Setup form submit handler
            setTimeout(() => {
                const submitBtn = document.querySelector('#studentForm button[type="submit"]');
                if (submitBtn) {
                    submitBtn.onclick = function(e) {
                        e.preventDefault();
                        e.stopPropagation();
                        if (typeof saveStudent === 'function') {
                            saveStudent();
                        }
                        return false;
                    };
                }
            }, 100);
        }
    };
}

