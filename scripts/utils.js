// Modal Management
function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        // Ensure the modal is visible
        modal.style.display = '';
        modal.classList.add('active');
        // Ensure modal handlers are set up
        if (typeof setupModalHandlers === 'function') {
            setupModalHandlers(modalId);
        }
        // Also ensure direct close button handlers are set up as fallback
        setupDirectCloseHandlers(modal);
    }
}

// Fallback direct close button handlers
function setupDirectCloseHandlers(modal) {
    if (!modal) return;
    
    const closeButtons = modal.querySelectorAll('.close-modal');
    closeButtons.forEach(button => {
        // Remove existing listeners by adding a new one with once option or checking if already set
        const existingHandler = button.getAttribute('data-close-handler-set');
        if (!existingHandler) {
            const handler = function(e) {
                e.preventDefault();
                e.stopPropagation();
                if (modal && modal.id) {
                    closeModal(modal.id);
                }
            };
            button.addEventListener('click', handler);
            button.setAttribute('data-close-handler-set', 'true');
        }
    });
}

function closeModal(modal) {
    let modalElement = null;
    
    if (typeof modal === 'string') {
        modalElement = document.getElementById(modal);
    } else if (modal) {
        modalElement = modal;
    }
    
    if (modalElement) {
        // Just hide the modal instead of removing it from DOM
        modalElement.classList.remove('active');
        // Restore body scroll when modal is closed
        document.body.style.overflow = '';
    }
}

// Store modal handlers to prevent duplicates - using WeakMap to avoid memory leaks
const modalHandlers = new WeakMap();

function setupModalHandlers(modalId) {
    const modal = typeof modalId === 'string' ? document.getElementById(modalId) : modalId;
    if (!modal) {
        return;
    }

    // Check if handlers are already set up for this modal instance
    if (modalHandlers.has(modal)) {
        return; // Don't add duplicate handlers
    }

    // Create new handlers
    const closeBtnElements = modal.querySelectorAll('.close-modal');
    
    // Handler function for backdrop clicks (closing when clicking outside)
    const backdropHandler = (e) => {
        // Only close if clicking directly on the modal backdrop (not on modal-content or its children)
        if (e.target === modal) {
            closeModal(modal);
        }
    };
    
    const buttonHandlers = [];
    
    // Setup close button handlers
    closeBtnElements.forEach(button => {
        const handler = (e) => {
            e.preventDefault();
            e.stopPropagation();
            closeModal(modal);
        };
        button.addEventListener('click', handler);
        buttonHandlers.push({ button, handler });
    });

    // Setup backdrop click handler
    modal.addEventListener('click', backdropHandler);
    
    // Store handlers for reference (though we won't remove them since modal shouldn't be removed)
    modalHandlers.set(modal, { closeButtons: buttonHandlers, backdropHandler });
}

// Utility Functions
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function formatTime(timeString) {
    return timeString;
}

// View Toggle System
function initializeViewToggles() {
    // Students view toggle
    const studentsGridViewBtn = document.getElementById('studentsGridViewBtn');
    const studentsListViewBtn = document.getElementById('studentsListViewBtn');
    
    if (studentsGridViewBtn && studentsListViewBtn) {
        studentsGridViewBtn.addEventListener('click', () => toggleView('students', 'grid'));
        studentsListViewBtn.addEventListener('click', () => toggleView('students', 'list'));
    }

    // Grades view toggle
    const gradesGridViewBtn = document.getElementById('gradesGridViewBtn');
    const gradesListViewBtn = document.getElementById('gradesListViewBtn');
    
    if (gradesGridViewBtn && gradesListViewBtn) {
        gradesGridViewBtn.addEventListener('click', () => toggleView('grades', 'grid'));
        gradesListViewBtn.addEventListener('click', () => toggleView('grades', 'list'));
    }

    // Attendance view toggle
    const attendanceGridViewBtn = document.getElementById('attendanceGridViewBtn');
    const attendanceListViewBtn = document.getElementById('attendanceListViewBtn');
    
    if (attendanceGridViewBtn && attendanceListViewBtn) {
        attendanceGridViewBtn.addEventListener('click', () => toggleView('attendance', 'grid'));
        attendanceListViewBtn.addEventListener('click', () => toggleView('attendance', 'list'));
    }

    // Exams view toggle
    const examsGridViewBtn = document.getElementById('examsGridViewBtn');
    const examsListViewBtn = document.getElementById('examsListViewBtn');
    
    if (examsGridViewBtn && examsListViewBtn) {
        examsGridViewBtn.addEventListener('click', () => toggleView('exams', 'grid'));
        examsListViewBtn.addEventListener('click', () => toggleView('exams', 'list'));
    }


    // Notifications view toggle
    const notificationsGridViewBtn = document.getElementById('notificationsGridViewBtn');
    const notificationsListViewBtn = document.getElementById('notificationsListViewBtn');
    
    if (notificationsGridViewBtn && notificationsListViewBtn) {
        notificationsGridViewBtn.addEventListener('click', () => toggleView('notifications', 'grid'));
        notificationsListViewBtn.addEventListener('click', () => toggleView('notifications', 'list'));
    }
}

function toggleView(section, view) {
    const gridView = document.getElementById(`${section}Grid`) || document.getElementById(`${section}Container`);
    const listView = document.getElementById(`${section}List`);
    const gridBtn = document.getElementById(`${section}GridViewBtn`);
    const listBtn = document.getElementById(`${section}ListViewBtn`);

    if (view === 'grid') {
        if (gridView) gridView.style.display = 'grid';
        if (listView) listView.style.display = 'none';
        if (gridBtn) gridBtn.classList.add('active');
        if (listBtn) listBtn.classList.remove('active');
    } else {
        if (gridView) gridView.style.display = 'none';
        if (listView) listView.style.display = 'block';
        if (gridBtn) gridBtn.classList.remove('active');
        if (listBtn) listBtn.classList.add('active');
    }
}

/**
 * Fancy Confirmation Dialog
 * Simple but elegant confirmation dialog replacement for browser confirm()
 * @param {string} message - The message to display
 * @param {string} title - Optional title (default: 'Confirmar')
 * @returns {Promise<boolean>} - Promise that resolves to true if confirmed, false if cancelled
 */
function fancyConfirm(message, title = 'Confirmar') {
    return new Promise((resolve) => {
        // Create overlay
        const overlay = document.createElement('div');
        overlay.className = 'fancy-confirm-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            backdrop-filter: blur(4px);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            animation: fadeIn 0.2s ease-out;
        `;

        // Create dialog
        const dialog = document.createElement('div');
        dialog.className = 'fancy-confirm-dialog';
        dialog.style.cssText = `
            background: white;
            border-radius: 16px;
            padding: 0;
            max-width: 450px;
            width: 90%;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            animation: slideUp 0.3s ease-out;
            overflow: hidden;
        `;

        // Create content
        dialog.innerHTML = `
            <div style="padding: 2rem;">
                <div style="text-align: center; margin-bottom: 1.5rem;">
                    <div style="
                        width: 64px;
                        height: 64px;
                        margin: 0 auto 1rem;
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        border-radius: 50%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
                    ">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M11.07 12.85c.77-1.39 2.25-2.21 3.11-3.44.91-1.29.4-3.7-2.18-3.7-1.69 0-2.52 1.28-2.87 2.34L6.54 6.96C7.25 4.83 9.18 3 11.99 3c2.35 0 3.96 1.07 4.78 2.41.7 1.15 1.11 3.3.03 4.9-1.2 1.77-2.35 2.31-2.97 3.45-.25.46-.35.76-.35 2.24h-2.89c-.01-.78-.13-2.05.48-3.15zM14 20c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2z" fill="white"/>
                        </svg>
                    </div>
                    <h3 style="
                        margin: 0 0 0.75rem;
                        font-size: 1.5rem;
                        font-weight: 600;
                        color: #1a1a1a;
                    ">${title}</h3>
                    <p style="
                        margin: 0;
                        font-size: 1rem;
                        color: #666;
                        line-height: 1.5;
                    ">${message}</p>
                </div>
                <div style="
                    display: flex;
                    gap: 0.75rem;
                    justify-content: center;
                ">
                    <button class="fancy-confirm-btn fancy-confirm-cancel btn btn-secondary" style="
                        flex: 1;
                        padding: 0.75rem 1.5rem;
                        font-size: 0.95rem;
                    ">
                        Cancelar
                    </button>
                    <button class="fancy-confirm-btn fancy-confirm-ok btn btn-primary" style="
                        flex: 1;
                        padding: 0.75rem 1.5rem;
                        font-size: 0.95rem;
                    ">
                        Confirmar
                    </button>
                </div>
            </div>
        `;

        // Add animations
        const style = document.createElement('style');
        style.textContent = `
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            @keyframes slideUp {
                from {
                    opacity: 0;
                    transform: translateY(20px) scale(0.95);
                }
                to {
                    opacity: 1;
                    transform: translateY(0) scale(1);
                }
            }
            .fancy-confirm-btn {
                transition: all 0.2s ease;
            }
            .fancy-confirm-btn:hover {
                transform: translateY(-2px);
            }
            .fancy-confirm-btn:active {
                transform: translateY(0);
            }
        `;
        document.head.appendChild(style);

        // Append to body
        overlay.appendChild(dialog);
        document.body.appendChild(overlay);

        // Handle clicks
        const handleConfirm = () => {
            overlay.style.animation = 'fadeIn 0.2s ease-out reverse';
            setTimeout(() => {
                document.body.removeChild(overlay);
                document.head.removeChild(style);
            }, 200);
            resolve(true);
        };

        const handleCancel = () => {
            overlay.style.animation = 'fadeIn 0.2s ease-out reverse';
            setTimeout(() => {
                document.body.removeChild(overlay);
                document.head.removeChild(style);
            }, 200);
            resolve(false);
        };

        dialog.querySelector('.fancy-confirm-ok').addEventListener('click', handleConfirm);
        dialog.querySelector('.fancy-confirm-cancel').addEventListener('click', handleCancel);

        // Close on overlay click
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                handleCancel();
            }
        });

        // Close on Escape key
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                handleCancel();
                document.removeEventListener('keydown', handleEscape);
            }
        };
        document.addEventListener('keydown', handleEscape);
    });
}

// Expose to global scope
window.fancyConfirm = fancyConfirm;
