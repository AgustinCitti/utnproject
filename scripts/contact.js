/**
 * Contact Page JavaScript
 * Handles form submission, Google Maps integration, and user interactions
 */

// Global variables
let map;
let marker;
let contactForm;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeContactPage();
});

/**
 * Initialize contact page functionality
 */
function initializeContactPage() {
    // Initialize form
    contactForm = document.getElementById('contactForm');
    if (contactForm) {
        setupFormHandling();
    }
    
    // Initialize Google Maps
    if (typeof google !== 'undefined' && google.maps) {
        initMap();
    } else {
        // Show loading message if Google Maps API is not loaded
        const mapContainer = document.getElementById('googleMap');
        if (mapContainer) {
            mapContainer.classList.add('loading');
        }
    }
    
    // Setup form validation
    setupFormValidation();
    
    // Setup animations
    setupAnimations();
}

/**
 * Setup form handling and submission
 */
function setupFormHandling() {
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        handleFormSubmission();
    });
}

/**
 * Handle form submission with AJAX
 */
async function handleFormSubmission() {
    const submitBtn = contactForm.querySelector('.contact-submit');
    const originalText = submitBtn.innerHTML;
    
    // Show loading state
    submitBtn.classList.add('loading');
    submitBtn.disabled = true;
    
    // Hide any existing messages
    hideFormMessages();
    
    try {
        // Get form data
        const formData = new FormData(contactForm);
        
        // Add CSRF token if available
        const csrfToken = document.querySelector('meta[name="csrf-token"]');
        if (csrfToken) {
            formData.append('csrf_token', csrfToken.getAttribute('content'));
        }
        
        // Submit form
        const response = await fetch('contact_handler.php', {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        if (result.success) {
            showSuccessMessage(result.message);
            contactForm.reset();
        } else {
            showErrorMessage(result.message);
        }
        
    } catch (error) {
        console.error('Form submission error:', error);
        showErrorMessage('An error occurred while sending your message. Please try again.');
    } finally {
        // Reset button state
        submitBtn.classList.remove('loading');
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
    }
}

/**
 * Setup form validation
 */
function setupFormValidation() {
    const inputs = contactForm.querySelectorAll('input, select, textarea');
    
    inputs.forEach(input => {
        // Real-time validation
        input.addEventListener('blur', function() {
            validateField(this);
        });
        
        // Clear validation on input
        input.addEventListener('input', function() {
            clearFieldError(this);
        });
    });
}

/**
 * Validate individual field
 */
function validateField(field) {
    const value = field.value.trim();
    const fieldName = field.name;
    let isValid = true;
    let errorMessage = '';
    
    // Required field validation
    if (field.hasAttribute('required') && !value) {
        isValid = false;
        errorMessage = `${getFieldLabel(fieldName)} is required.`;
    }
    
    // Email validation
    if (fieldName === 'email' && value && !isValidEmail(value)) {
        isValid = false;
        errorMessage = 'Please enter a valid email address.';
    }
    
    // Phone validation
    if (fieldName === 'phone' && value && !isValidPhone(value)) {
        isValid = false;
        errorMessage = 'Please enter a valid phone number.';
    }
    
    // Message length validation
    if (fieldName === 'message' && value && value.length < 10) {
        isValid = false;
        errorMessage = 'Message must be at least 10 characters long.';
    }
    
    if (!isValid) {
        showFieldError(field, errorMessage);
    } else {
        clearFieldError(field);
    }
    
    return isValid;
}

/**
 * Validate entire form
 */
function validateForm() {
    const inputs = contactForm.querySelectorAll('input[required], select[required], textarea[required]');
    let isFormValid = true;
    
    inputs.forEach(input => {
        if (!validateField(input)) {
            isFormValid = false;
        }
    });
    
    return isFormValid;
}

/**
 * Show field error
 */
function showFieldError(field, message) {
    clearFieldError(field);
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'field-error';
    errorDiv.textContent = message;
    
    field.parentNode.appendChild(errorDiv);
    field.classList.add('error');
}

/**
 * Clear field error
 */
function clearFieldError(field) {
    const existingError = field.parentNode.querySelector('.field-error');
    if (existingError) {
        existingError.remove();
    }
    field.classList.remove('error');
}

/**
 * Get field label for error messages
 */
function getFieldLabel(fieldName) {
    const labels = {
        'firstName': 'First Name',
        'lastName': 'Last Name',
        'email': 'Email',
        'phone': 'Phone',
        'subject': 'Subject',
        'message': 'Message'
    };
    return labels[fieldName] || fieldName;
}

/**
 * Email validation
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Phone validation
 */
function isValidPhone(phone) {
    const phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,}$/;
    return phoneRegex.test(phone);
}

/**
 * Show success message
 */
function showSuccessMessage(message) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'form-message success show';
    messageDiv.innerHTML = `
        <i class="fas fa-check-circle"></i>
        <span>${message}</span>
    `;
    
    contactForm.insertBefore(messageDiv, contactForm.firstChild);
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        messageDiv.remove();
    }, 5000);
}

/**
 * Show error message
 */
function showErrorMessage(message) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'form-message error show';
    messageDiv.innerHTML = `
        <i class="fas fa-exclamation-circle"></i>
        <span>${message}</span>
    `;
    
    contactForm.insertBefore(messageDiv, contactForm.firstChild);
}

/**
 * Hide form messages
 */
function hideFormMessages() {
    const messages = contactForm.querySelectorAll('.form-message');
    messages.forEach(message => message.remove());
}

/**
 * Initialize Google Maps
 */
function initMap() {
    // Default location (Buenos Aires, Argentina)
    const defaultLocation = { lat: -34.6037, lng: -58.3816 };
    
    // Map options
    const mapOptions = {
        zoom: 15,
        center: defaultLocation,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        styles: [
            {
                featureType: 'poi',
                elementType: 'labels',
                stylers: [{ visibility: 'off' }]
            }
        ]
    };
    
    // Create map
    map = new google.maps.Map(document.getElementById('googleMap'), mapOptions);
    
    // Create marker
    marker = new google.maps.Marker({
        position: defaultLocation,
        map: map,
        title: 'EduSync Office',
        icon: {
            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="20" cy="20" r="18" fill="#667eea" stroke="#fff" stroke-width="2"/>
                    <path d="M20 8c-4.4 0-8 3.6-8 8 0 6 8 12 8 12s8-6 8-12c0-4.4-3.6-8-8-8zm0 11c-1.7 0-3-1.3-3-3s1.3-3 3-3 3 1.3 3 3-1.3 3-3 3z" fill="#fff"/>
                </svg>
            `),
            scaledSize: new google.maps.Size(40, 40),
            anchor: new google.maps.Point(20, 20)
        }
    });
    
    // Create info window
    const infoWindow = new google.maps.InfoWindow({
        content: `
            <div style="padding: 10px; max-width: 200px;">
                <h3 style="margin: 0 0 10px 0; color: #333;">EduSync Office</h3>
                <p style="margin: 0; color: #666; font-size: 14px;">
                    123 University Street<br>
                    Buenos Aires, Argentina<br>
                    CP 1000
                </p>
                <p style="margin: 10px 0 0 0; color: #667eea; font-size: 12px;">
                    <i class="fas fa-phone"></i> +54 11 1234-5678
                </p>
            </div>
        `
    });
    
    // Add click listener to marker
    marker.addListener('click', function() {
        infoWindow.open(map, marker);
    });
    
    // Remove loading class
    const mapContainer = document.getElementById('googleMap');
    if (mapContainer) {
        mapContainer.classList.remove('loading');
    }
}

/**
 * Setup page animations
 */
function setupAnimations() {
    // Animate elements on scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Observe elements for animation
    const animatedElements = document.querySelectorAll('.info-card, .contact-form-container, .map-container');
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
}

/**
 * Handle language change
 */
function handleLanguageChange() {
    const languageSelect = document.getElementById('languageSelect');
    if (languageSelect) {
        languageSelect.addEventListener('change', function() {
            const selectedLanguage = this.value;
            // Update page language (this would integrate with your translation system)
            updatePageLanguage(selectedLanguage);
        });
    }
}

/**
 * Update page language
 */
function updatePageLanguage(language) {
    // This would integrate with your existing translation system
    console.log('Language changed to:', language);
    // You can implement language switching logic here
}

/**
 * Handle mobile navigation
 */
function setupMobileNavigation() {
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');
    
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
        });
    }
}

// Initialize mobile navigation
document.addEventListener('DOMContentLoaded', function() {
    setupMobileNavigation();
    handleLanguageChange();
});

// Export functions for global access
window.initMap = initMap;
window.handleFormSubmission = handleFormSubmission;
