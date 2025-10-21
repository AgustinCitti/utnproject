/**
 * Contact Page JavaScript
 * Handles form submission, Mapbox integration, and user interactions
 */

// Global variables
let map;
let contactForm;

/**
 * Get translated text for the current language
 */
function getTranslatedText(key) {
    const currentLanguage = localStorage.getItem('language') || 'es';
    if (typeof translations !== 'undefined' && translations[currentLanguage] && translations[currentLanguage][key]) {
        return translations[currentLanguage][key];
    }
    // Fallback to English if translation not found
    if (translations && translations['en'] && translations['en'][key]) {
        return translations['en'][key];
    }
    // Final fallback to key itself
    return key;
}

// Mapbox configuration
const MAPBOX_ACCESS_TOKEN = 'pk.eyJ1IjoiYnJld2FwcCIsImEiOiJjbWR3NmpiOWYxejd4MmtvaHUzZHVjdnZ1In0.R8JCFitenAT9HVy9t5vhBw';

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeContactPage();
    // Initialize language system if available
    if (typeof initializeLanguage === 'function') {
        initializeLanguage();
    }
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
    
    // Initialize Mapbox
    if (typeof mapboxgl !== 'undefined') {
        mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN;
        initMap();
    } else {
        // Show loading message if Mapbox GL JS is not loaded
        const mapContainer = document.getElementById('googleMap');
        if (mapContainer) {
            mapContainer.classList.add('loading');
        }
    }
    
    // Setup form validation
    setupFormValidation();
    
    // Setup animations
    setupAnimations();
    
    // Initialize form placeholders
    updateFormPlaceholders();
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
            showSuccessMessage(result.message || getTranslatedText('form_success_message'));
            contactForm.reset();
        } else {
            showErrorMessage(result.message || getTranslatedText('form_error_message'));
        }
        
    } catch (error) {
        console.error('Form submission error:', error);
        showErrorMessage(getTranslatedText('form_error_message'));
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
        errorMessage = getTranslatedText('form_required_field');
    }
    
    // Email validation
    if (fieldName === 'email' && value && !isValidEmail(value)) {
        isValid = false;
        errorMessage = getTranslatedText('form_valid_email');
    }
    
    // Phone validation
    if (fieldName === 'phone' && value && !isValidPhone(value)) {
        isValid = false;
        errorMessage = getTranslatedText('form_valid_phone');
    }
    
    // Message length validation
    if (fieldName === 'message' && value && value.length < 10) {
        isValid = false;
        errorMessage = getTranslatedText('form_message_length');
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
 * Initialize Mapbox Map
 */
function initMap() {
    // Default location (Buenos Aires, Argentina)
    const defaultLocation = [-58.3816, -34.6037]; // [lng, lat] for Mapbox
    
    // Create map
    map = new mapboxgl.Map({
        container: 'googleMap', // Using existing container ID
        style: 'mapbox://styles/mapbox/streets-v12',
        center: defaultLocation,
        zoom: 15
    });
    
    // Add navigation controls
    map.addControl(new mapboxgl.NavigationControl());
    
    // Add geolocate control
    map.addControl(new mapboxgl.GeolocateControl({
        positionOptions: {
            enableHighAccuracy: true
        },
        trackUserLocation: true,
        showUserHeading: true
    }));
    
    // Create a custom marker element
    const markerElement = document.createElement('div');
    markerElement.className = 'custom-marker';
    markerElement.innerHTML = `
        <div style="
            width: 40px;
            height: 40px;
            background: #667eea;
            border: 2px solid #fff;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        ">
            <i class="fas fa-map-marker-alt" style="color: #fff; font-size: 18px;"></i>
        </div>
    `;
    
    // Create marker
    const marker = new mapboxgl.Marker(markerElement)
        .setLngLat(defaultLocation)
        .addTo(map);
    
    // Create popup
    const popup = new mapboxgl.Popup({
        offset: 25,
        closeButton: true,
        closeOnClick: false
    }).setHTML(`
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
    `);
    
    // Add popup to marker
    marker.setPopup(popup);
    
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
            // Update page language
            updatePageLanguage(selectedLanguage);
            // Update form placeholders
            updateFormPlaceholders(selectedLanguage);
        });
    }
}

/**
 * Update page language
 */
function updatePageLanguage(language) {
    // Update form placeholders
    updateFormPlaceholders(language);
    console.log('Language changed to:', language);
}

/**
 * Update form placeholders based on language
 */
function updateFormPlaceholders(language) {
    const currentLanguage = language || localStorage.getItem('language') || 'es';
    
    // Update input placeholders
    const firstNameInput = document.getElementById('firstName');
    const lastNameInput = document.getElementById('lastName');
    const emailInput = document.getElementById('email');
    const phoneInput = document.getElementById('phone');
    const messageInput = document.getElementById('message');
    
    if (firstNameInput) {
        firstNameInput.placeholder = getTranslatedText('first_name');
    }
    if (lastNameInput) {
        lastNameInput.placeholder = getTranslatedText('last_name');
    }
    if (emailInput) {
        emailInput.placeholder = getTranslatedText('email');
    }
    if (phoneInput) {
        phoneInput.placeholder = getTranslatedText('phone');
    }
    if (messageInput) {
        messageInput.placeholder = getTranslatedText('message');
    }
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
