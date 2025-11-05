/**
 * Modal Helper - Unified Modal Management
 * Updates all modals to use the new side dialog structure
 */

// Function to open a modal
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
        // Prevent body scroll when modal is open
        document.body.style.overflow = 'hidden';
    }
}

// Function to close a modal
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
        // Restore body scroll
        document.body.style.overflow = '';
    }
}

// Close modal when clicking overlay
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('modal-overlay')) {
        const modalId = e.target.id;
        closeModal(modalId);
    }
});

// Close modal when clicking close button
document.addEventListener('click', function(e) {
    // Check if the clicked element is a close button or inside one
    const closeButton = e.target.closest('.close-modal');
    if (closeButton) {
        e.preventDefault();
        e.stopPropagation();
        const modal = closeButton.closest('.modal-overlay');
        if (modal && modal.id) {
            closeModal(modal.id);
        }
    }
}, true); // Use capture phase to ensure we catch the event early

// Close modal with Escape key
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        const openModals = document.querySelectorAll('.modal-overlay.active');
        openModals.forEach(modal => {
            closeModal(modal.id);
        });
    }
});

// Update existing modal open/close functions
// This will override any existing modal functions
if (typeof window.openModal === 'undefined') {
    window.openModal = openModal;
}

if (typeof window.closeModal === 'undefined') {
    window.closeModal = closeModal;
}

// Initialize all modal handlers on page load
function initializeAllModalHandlers() {
    // Find all modals with close buttons
    const allModals = document.querySelectorAll('.modal-overlay');
    allModals.forEach(modal => {
        const closeButtons = modal.querySelectorAll('.close-modal');
        closeButtons.forEach(button => {
            // Check if handler already set
            if (!button.hasAttribute('data-modal-handler-set')) {
                // Add click handler
                button.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    const targetModal = button.closest('.modal-overlay');
                    if (targetModal && targetModal.id) {
                        closeModal(targetModal.id);
                    }
                });
                button.setAttribute('data-modal-handler-set', 'true');
            }
        });
    });
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeAllModalHandlers);
} else {
    // DOM is already loaded
    initializeAllModalHandlers();
}

