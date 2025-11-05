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
    if (e.target.classList.contains('close-modal') || e.target.closest('.close-modal')) {
        const modal = e.target.closest('.modal-overlay');
        if (modal) {
            closeModal(modal.id);
        }
    }
});

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

