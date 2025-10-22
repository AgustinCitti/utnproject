// Login System
function initializeLogin() {
    const loginForm = document.getElementById('loginForm');
    const logoutBtn = document.getElementById('logoutBtn');
    const welcomeUser = document.getElementById('welcomeUser');

    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            
            if (username && password) {
                localStorage.setItem('isLoggedIn', 'true');
                localStorage.setItem('username', username);
                window.location.href = '../pages/home.html';
            } else {
                alert('Please enter both username and password');
            }
        });
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            localStorage.removeItem('isLoggedIn');
            localStorage.removeItem('username');
            window.location.href = '../index.html';
        });
    }

    if (welcomeUser) {
        const username = localStorage.getItem('username') || 'User';
        welcomeUser.textContent = `Welcome, ${username}!`;
    }
}

// Landing Page Functions
function scrollToLogin() {
    window.location.href = '../pages/login.html';
}

function scrollToFeatures() {
    document.getElementById('features').scrollIntoView({ behavior: 'smooth' });
}


// Landing page navigation
function initializeLandingPage() {
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');
    
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
        });
    }
    
    // Smooth scrolling for navigation links
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({ behavior: 'smooth' });
            }
            navMenu.classList.remove('active');
        });
    });
    
    // Registration form handling
    const registrationForm = document.getElementById('registrationForm');
    if (registrationForm) {
        registrationForm.addEventListener('submit', (e) => {
            e.preventDefault();
            handleRegistration();
        });
    }
    
    // Login form handling
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            handleLogin();
        });
    }
}

function handleRegistration() {
    console.log('handleRegistration called');
    const formData = {
        firstName: document.getElementById('regFirstName').value,
        lastName: document.getElementById('regLastName').value,
        email: document.getElementById('regEmail').value,
        institution: document.getElementById('regInstitution').value,
        role: document.getElementById('regRole').value
    };
    
    console.log('Registration data:', formData);
    
    // In a real application, this would send data to a server
    alert('Registration submitted successfully! You will be contacted soon.');
    
    // Clear form
    const form = document.getElementById('registrationForm');
    if (form) {
        form.reset();
        console.log('Registration form reset');
    }
}

function handleLogin() {
    console.log('handleLogin called');
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    console.log('Username:', username, 'Password:', password ? '[hidden]' : '[empty]');
    
    if (username && password) {
        console.log('Login successful, redirecting to home.html');
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('username', username);
        window.location.href = '../pages/home.html';
    } else {
        console.log('Login failed - missing credentials');
        alert('Please enter both username and password');
    }
}

// Login Page Initialization
function initializeLoginPage() {
    console.log('Initializing login page...');
    // Initialize language system
    initializeLanguage();
    
    // Login form handling
    const loginForm = document.getElementById('loginForm');
    console.log('Login form found:', !!loginForm);
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            console.log('Login form submitted');
            e.preventDefault();
            handleLogin();
        });
        console.log('Login form event listener attached');
    }
    
    // Social login buttons (placeholder functionality)
    const googleBtn = document.querySelector('.google-btn');
    const microsoftBtn = document.querySelector('.microsoft-btn');
    
    if (googleBtn) {
        googleBtn.addEventListener('click', () => {
            alert('Google login integration would be implemented here');
        });
    }
    
    if (microsoftBtn) {
        microsoftBtn.addEventListener('click', () => {
            alert('Microsoft login integration would be implemented here');
        });
    }
}

// Register Page Initialization
function initializeRegisterPage() {
    console.log('Initializing register page...');
    // Initialize language system
    initializeLanguage();
    
    // Registration form handling
    const registrationForm = document.getElementById('registrationForm');
    console.log('Registration form found:', !!registrationForm);
    if (registrationForm) {
        registrationForm.addEventListener('submit', (e) => {
            console.log('Registration form submitted');
            e.preventDefault();
            handleRegistration();
        });
        console.log('Registration form event listener attached');
    }
    
    // Social login buttons (placeholder functionality)
    const googleBtn = document.querySelector('.google-btn');
    const microsoftBtn = document.querySelector('.microsoft-btn');
    
    if (googleBtn) {
        googleBtn.addEventListener('click', () => {
            alert('Google registration integration would be implemented here');
        });
    }
    
    if (microsoftBtn) {
        microsoftBtn.addEventListener('click', () => {
            alert('Microsoft registration integration would be implemented here');
        });
    }
}

// Auth Page Initialization
function initializeAuthPage() {
    console.log('Initializing auth page...');
    // Initialize language system
    initializeLanguage();
    
    // Initialize swipe form functionality
    initializeSwipeForm();
    
    // Login form handling
    const loginForm = document.getElementById('loginForm');
    console.log('Auth page login form found:', !!loginForm);
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            console.log('Auth page login form submitted');
            e.preventDefault();
            handleLogin();
        });
        console.log('Auth page login form event listener attached');
    }
    
    // Registration form handling
    const registrationForm = document.getElementById('registrationForm');
    console.log('Auth page registration form found:', !!registrationForm);
    if (registrationForm) {
        registrationForm.addEventListener('submit', (e) => {
            console.log('Auth page registration form submitted');
            e.preventDefault();
            handleRegistration();
        });
        console.log('Auth page registration form event listener attached');
    }
    
    // Social login buttons (placeholder functionality)
    const googleBtns = document.querySelectorAll('.google-btn');
    const microsoftBtns = document.querySelectorAll('.microsoft-btn');
    
    googleBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            alert('Google login integration would be implemented here');
        });
    });
    
    microsoftBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            alert('Microsoft login integration would be implemented here');
        });
    });
}

// Swipe Form Functionality
function initializeSwipeForm() {
    const formsSlider = document.getElementById('formsSlider');
    const loginTab = document.getElementById('loginTab');
    const registerTab = document.getElementById('registerTab');
    const loginCard = document.getElementById('loginCard');
    const registerCard = document.getElementById('registerCard');
    const indicators = document.querySelectorAll('.indicator');
    
    let currentForm = 'login';
    let isTransitioning = false;
    
    // Tab switching
    if (loginTab) {
        loginTab.addEventListener('click', () => {
            if (!isTransitioning && currentForm !== 'login') {
                switchToForm('login');
            }
        });
    }
    
    if (registerTab) {
        registerTab.addEventListener('click', () => {
            if (!isTransitioning && currentForm !== 'register') {
                switchToForm('register');
            }
        });
    }
    
    // Indicator clicking
    indicators.forEach((indicator, index) => {
        indicator.addEventListener('click', () => {
            const targetForm = index === 0 ? 'login' : 'register';
            if (!isTransitioning && currentForm !== targetForm) {
                switchToForm(targetForm);
            }
        });
    });
    
    // Touch/Swipe gestures
    if (formsSlider) {
        let startX = 0;
        let startY = 0;
        let currentX = 0;
        let currentY = 0;
        let isDragging = false;
        let swipeThreshold = 50;
        
        // Touch events
        formsSlider.addEventListener('touchstart', handleTouchStart, { passive: false });
        formsSlider.addEventListener('touchmove', handleTouchMove, { passive: false });
        formsSlider.addEventListener('touchend', handleTouchEnd, { passive: false });
        
        // Mouse events for desktop - only on the slider container, not form content
        formsSlider.addEventListener('mousedown', handleMouseDown);
        formsSlider.addEventListener('mousemove', handleMouseMove);
        formsSlider.addEventListener('mouseup', handleMouseUp);
        formsSlider.addEventListener('mouseleave', handleMouseUp);
        
        // Prevent form switching when clicking on form elements
        const formElements = formsSlider.querySelectorAll('input, button, select, textarea, label');
        formElements.forEach(element => {
            element.addEventListener('mousedown', (e) => {
                e.stopPropagation();
            });
            element.addEventListener('touchstart', (e) => {
                e.stopPropagation();
            });
        });
        
        function handleTouchStart(e) {
            if (isTransitioning) return;
            
            // Don't start drag if touching form elements
            if (e.target.closest('input, button, select, textarea, label, .form-group, .input-wrapper')) {
                return;
            }
            
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
            isDragging = true;
            formsSlider.classList.add('swiping');
        }
        
        function handleTouchMove(e) {
            if (!isDragging || isTransitioning) return;
            
            currentX = e.touches[0].clientX;
            currentY = e.touches[0].clientY;
            
            const deltaX = currentX - startX;
            const deltaY = Math.abs(currentY - startY);
            
            // Only process horizontal swipes
            if (Math.abs(deltaX) > deltaY) {
                e.preventDefault();
                
                // Visual feedback during swipe
                const progress = Math.min(Math.abs(deltaX) / 200, 1);
                if (deltaX > 0 && currentForm === 'register') {
                    // Swiping right to go to login
                    updateSwipeProgress(progress, 'right');
                } else if (deltaX < 0 && currentForm === 'login') {
                    // Swiping left to go to register
                    updateSwipeProgress(progress, 'left');
                }
            }
        }
        
        function handleTouchEnd(e) {
            if (!isDragging || isTransitioning) return;
            
            const deltaX = currentX - startX;
            const deltaY = Math.abs(currentY - startY);
            
            formsSlider.classList.remove('swiping');
            isDragging = false;
            
            // Only process horizontal swipes
            if (Math.abs(deltaX) > deltaY && Math.abs(deltaX) > swipeThreshold) {
                if (deltaX > 0 && currentForm === 'register') {
                    // Swipe right to login
                    switchToForm('login');
                } else if (deltaX < 0 && currentForm === 'login') {
                    // Swipe left to register
                    switchToForm('register');
                }
            } else {
                // Reset visual feedback
                resetSwipeProgress();
            }
        }
        
        function handleMouseDown(e) {
            if (isTransitioning) return;
            
            // Don't start drag if clicking on form elements
            if (e.target.closest('input, button, select, textarea, label, .form-group, .input-wrapper')) {
                return;
            }
            
            startX = e.clientX;
            startY = e.clientY;
            isDragging = true;
            formsSlider.classList.add('swiping');
            e.preventDefault();
        }
        
        function handleMouseMove(e) {
            if (!isDragging || isTransitioning) return;
            
            currentX = e.clientX;
            currentY = e.clientY;
            
            const deltaX = currentX - startX;
            const deltaY = Math.abs(currentY - startY);
            
            // Only process horizontal swipes
            if (Math.abs(deltaX) > deltaY) {
                e.preventDefault();
                
                // Visual feedback during swipe
                const progress = Math.min(Math.abs(deltaX) / 200, 1);
                if (deltaX > 0 && currentForm === 'register') {
                    updateSwipeProgress(progress, 'right');
                } else if (deltaX < 0 && currentForm === 'login') {
                    updateSwipeProgress(progress, 'left');
                }
            }
        }
        
        function handleMouseUp(e) {
            if (!isDragging || isTransitioning) return;
            
            const deltaX = currentX - startX;
            const deltaY = Math.abs(currentY - startY);
            
            formsSlider.classList.remove('swiping');
            isDragging = false;
            
            // Only process horizontal swipes
            if (Math.abs(deltaX) > deltaY && Math.abs(deltaX) > swipeThreshold) {
                if (deltaX > 0 && currentForm === 'register') {
                    switchToForm('login');
                } else if (deltaX < 0 && currentForm === 'login') {
                    switchToForm('register');
                }
            } else {
                resetSwipeProgress();
            }
        }
    }
    
    function switchToForm(targetForm) {
        if (isTransitioning || currentForm === targetForm) return;
        
        isTransitioning = true;
        const direction = targetForm === 'login' ? 'right' : 'left';
        
        // Update tabs
        if (loginTab && registerTab) {
            loginTab.classList.toggle('active', targetForm === 'login');
            registerTab.classList.toggle('active', targetForm === 'register');
        }
        
        // Update indicators
        indicators.forEach((indicator, index) => {
            const isActive = (index === 0 && targetForm === 'login') || (index === 1 && targetForm === 'register');
            indicator.classList.toggle('active', isActive);
        });
        
        // Animate form transition
        if (targetForm === 'login') {
            // Switching to login
            if (registerCard) {
                registerCard.classList.add('slide-out-left');
            }
            setTimeout(() => {
                if (loginCard) {
                    loginCard.classList.remove('slide-out-right');
                    loginCard.classList.add('active', 'slide-in-right');
                }
                if (registerCard) {
                    registerCard.classList.remove('active', 'slide-in-left');
                }
                setTimeout(() => {
                    if (loginCard) {
                        loginCard.classList.remove('slide-in-right');
                    }
                    if (registerCard) {
                        registerCard.classList.remove('slide-out-left');
                    }
                    isTransitioning = false;
                }, 400);
            }, 50);
        } else {
            // Switching to register
            if (loginCard) {
                loginCard.classList.add('slide-out-right');
            }
            setTimeout(() => {
                if (registerCard) {
                    registerCard.classList.remove('slide-out-left');
                    registerCard.classList.add('active', 'slide-in-left');
                }
                if (loginCard) {
                    loginCard.classList.remove('active', 'slide-in-right');
                }
                setTimeout(() => {
                    if (registerCard) {
                        registerCard.classList.remove('slide-in-left');
                    }
                    if (loginCard) {
                        loginCard.classList.remove('slide-out-right');
                    }
                    isTransitioning = false;
                }, 400);
            }, 50);
        }
        
        currentForm = targetForm;
    }
    
    function updateSwipeProgress(progress, direction) {
        // Add visual feedback during swipe
        const activeCard = currentForm === 'login' ? loginCard : registerCard;
        if (activeCard) {
            const opacity = 1 - (progress * 0.3);
            const scale = 1 - (progress * 0.05);
            activeCard.style.opacity = opacity;
            activeCard.style.transform = `translateX(${direction === 'left' ? -progress * 20 : progress * 20}px) scale(${scale})`;
        }
    }
    
    function resetSwipeProgress() {
        const activeCard = currentForm === 'login' ? loginCard : registerCard;
        if (activeCard) {
            activeCard.style.opacity = '';
            activeCard.style.transform = '';
        }
    }
}

// Legacy form switching functions (kept for backward compatibility)
function switchToRegister() {
    // This function is now handled by the swipe form functionality
    console.log('Legacy switchToRegister called - using new swipe functionality');
}

function switchToLogin() {
    // This function is now handled by the swipe form functionality
    console.log('Legacy switchToLogin called - using new swipe functionality');
}
