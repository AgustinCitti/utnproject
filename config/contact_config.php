<?php
/**
 * Contact System Configuration
 * Centralized configuration for the contact form system
 */

// Database Configuration
define('DB_HOST', 'localhost');
define('DB_NAME', 'edusync');
define('DB_USER', 'root');
define('DB_PASS', '');

// Email Configuration
define('ADMIN_EMAIL', 'admin@edusync.edu.ar');
define('FROM_EMAIL', 'noreply@edusync.edu.ar');
define('SITE_NAME', 'EduSync');
define('SITE_URL', 'https://edusync.edu.ar');

// Contact Form Configuration
define('MAX_MESSAGE_LENGTH', 2000);
define('MIN_MESSAGE_LENGTH', 10);
define('MAX_NAME_LENGTH', 50);
define('MAX_EMAIL_LENGTH', 100);
define('MAX_PHONE_LENGTH', 20);

// Google Maps Configuration
define('GOOGLE_MAPS_API_KEY', 'YOUR_GOOGLE_MAPS_API_KEY');
define('DEFAULT_LATITUDE', -34.6037);
define('DEFAULT_LONGITUDE', -58.3816);
define('DEFAULT_ZOOM', 15);

// Security Configuration
define('CSRF_TOKEN_LIFETIME', 3600); // 1 hour
define('MAX_SUBMISSIONS_PER_HOUR', 5);
define('MAX_SUBMISSIONS_PER_DAY', 20);

// Email Templates
define('ADMIN_EMAIL_TEMPLATE', 'templates/admin_notification.html');
define('USER_EMAIL_TEMPLATE', 'templates/user_confirmation.html');

// File Upload Configuration (if needed for attachments)
define('UPLOAD_MAX_SIZE', 5 * 1024 * 1024); // 5MB
define('ALLOWED_FILE_TYPES', ['pdf', 'doc', 'docx', 'txt', 'jpg', 'png']);

// Notification Settings
define('SEND_ADMIN_NOTIFICATION', true);
define('SEND_USER_CONFIRMATION', true);
define('SEND_SMS_NOTIFICATION', false);

// Logging Configuration
define('LOG_CONTACT_SUBMISSIONS', true);
define('LOG_EMAIL_FAILURES', true);
define('LOG_FILE_PATH', 'logs/contact_system.log');

// Rate Limiting Configuration
define('ENABLE_RATE_LIMITING', true);
define('RATE_LIMIT_WINDOW', 3600); // 1 hour in seconds
define('RATE_LIMIT_MAX_ATTEMPTS', 5);

// Validation Rules
$validation_rules = [
    'firstName' => [
        'required' => true,
        'min_length' => 2,
        'max_length' => 50,
        'pattern' => '/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/'
    ],
    'lastName' => [
        'required' => true,
        'min_length' => 2,
        'max_length' => 50,
        'pattern' => '/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/'
    ],
    'email' => [
        'required' => true,
        'max_length' => 100,
        'pattern' => '/^[^\s@]+@[^\s@]+\.[^\s@]+$/'
    ],
    'phone' => [
        'required' => false,
        'max_length' => 20,
        'pattern' => '/^[\+]?[0-9\s\-\(\)]{10,}$/'
    ],
    'subject' => [
        'required' => true,
        'allowed_values' => ['general', 'technical', 'billing', 'feature', 'other']
    ],
    'message' => [
        'required' => true,
        'min_length' => 10,
        'max_length' => 2000
    ]
];

// Subject Options
$subject_options = [
    'general' => 'General Inquiry',
    'technical' => 'Technical Support',
    'billing' => 'Billing Question',
    'feature' => 'Feature Request',
    'other' => 'Other'
];

// Status Options
$status_options = [
    'new' => 'New',
    'read' => 'Read',
    'replied' => 'Replied',
    'closed' => 'Closed'
];

// Business Hours
$business_hours = [
    'monday' => '9:00 AM - 6:00 PM',
    'tuesday' => '9:00 AM - 6:00 PM',
    'wednesday' => '9:00 AM - 6:00 PM',
    'thursday' => '9:00 AM - 6:00 PM',
    'friday' => '9:00 AM - 6:00 PM',
    'saturday' => '10:00 AM - 2:00 PM',
    'sunday' => 'Closed'
];

// Contact Information
$contact_info = [
    'address' => [
        'street' => '123 University Street',
        'city' => 'Buenos Aires',
        'state' => 'Buenos Aires',
        'country' => 'Argentina',
        'postal_code' => 'CP 1000'
    ],
    'phone' => '+54 11 1234-5678',
    'email' => 'contact@edusync.edu.ar',
    'website' => 'https://edusync.edu.ar'
];

// Social Media Links
$social_links = [
    'facebook' => 'https://facebook.com/edusync',
    'twitter' => 'https://twitter.com/edusync',
    'linkedin' => 'https://linkedin.com/company/edusync',
    'instagram' => 'https://instagram.com/edusync'
];

// Export configuration as constants
define('VALIDATION_RULES', $validation_rules);
define('SUBJECT_OPTIONS', $subject_options);
define('STATUS_OPTIONS', $status_options);
define('BUSINESS_HOURS', $business_hours);
define('CONTACT_INFO', $contact_info);
define('SOCIAL_LINKS', $social_links);

// Helper function to get configuration
function getContactConfig($key = null) {
    global $validation_rules, $subject_options, $status_options, 
           $business_hours, $contact_info, $social_links;
    
    $config = [
        'validation_rules' => $validation_rules,
        'subject_options' => $subject_options,
        'status_options' => $status_options,
        'business_hours' => $business_hours,
        'contact_info' => $contact_info,
        'social_links' => $social_links
    ];
    
    if ($key === null) {
        return $config;
    }
    
    return isset($config[$key]) ? $config[$key] : null;
}

// Helper function to validate configuration
function validateContactConfig() {
    $errors = [];
    
    // Check database configuration
    if (empty(DB_HOST) || empty(DB_NAME) || empty(DB_USER)) {
        $errors[] = 'Database configuration is incomplete';
    }
    
    // Check email configuration
    if (empty(ADMIN_EMAIL) || empty(FROM_EMAIL)) {
        $errors[] = 'Email configuration is incomplete';
    }
    
    // Check Google Maps API key
    if (empty(GOOGLE_MAPS_API_KEY) || GOOGLE_MAPS_API_KEY === 'YOUR_GOOGLE_MAPS_API_KEY') {
        $errors[] = 'Google Maps API key is not configured';
    }
    
    return $errors;
}

// Initialize configuration validation
$config_errors = validateContactConfig();
if (!empty($config_errors)) {
    error_log('Contact system configuration errors: ' . implode(', ', $config_errors));
}
?>
