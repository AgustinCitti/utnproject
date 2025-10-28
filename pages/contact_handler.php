<?php
/**
 * Contact Form Handler for EduSync
 * Handles form submission, email sending, and database storage
 */

// Start session for CSRF protection
session_start();

// Include master database and contact configuration
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/contact_config.php';

// CSRF token generation
if (!isset($_SESSION['csrf_token'])) {
    $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
}

// Function to sanitize input
function sanitize_input($data) {
    $data = trim($data);
    $data = stripslashes($data);
    $data = htmlspecialchars($data);
    return $data;
}

// Function to validate email
function validate_email($email) {
    return filter_var($email, FILTER_VALIDATE_EMAIL);
}

// Function to send email
function send_contact_email($to, $subject, $message) {
    $headers = "From: " . SITE_NAME . " <" . FROM_EMAIL . ">\r\n";
    $headers .= "Reply-To: " . FROM_EMAIL . "\r\n";
    $headers .= "Content-Type: text/html; charset=UTF-8\r\n";
    $headers .= "X-Mailer: PHP/" . phpversion();
    
    return mail($to, $subject, $message, $headers);
}

// Function to log contact message to database
function log_contact_message($pdo, $data) {
    try {
        $sql = "INSERT INTO contact_messages (
            first_name, 
            last_name, 
            email, 
            phone, 
            subject, 
            message, 
            newsletter_opt, 
            status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, 'new')";
        
        $stmt = $pdo->prepare($sql);
        return $stmt->execute([
            $data['firstName'],
            $data['lastName'],
            $data['email'],
            $data['phone'],
            $data['subject'],
            $data['message'],
            $data['newsletter'] ? 1 : 0
        ]);
    } catch (PDOException $e) {
        error_log("Database error: " . $e->getMessage());
        return false;
    }
}

// Function to send notification email to admin
function send_admin_notification($data) {
    $subject = "New Contact Form Submission - " . $data['subject'];
    
    $message = "
    <html>
    <head>
        <title>New Contact Form Submission</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #667eea; color: white; padding: 20px; text-align: center; }
            .content { background: #f8f9fa; padding: 20px; }
            .field { margin-bottom: 15px; }
            .label { font-weight: bold; color: #333; }
            .value { color: #666; }
            .footer { background: #333; color: white; padding: 15px; text-align: center; font-size: 12px; }
        </style>
    </head>
    <body>
        <div class='container'>
            <div class='header'>
                <h2>New Contact Form Submission</h2>
                <p>EduSync Contact System</p>
            </div>
            <div class='content'>
                <div class='field'>
                    <span class='label'>Name:</span>
                    <span class='value'>{$data['firstName']} {$data['lastName']}</span>
                </div>
                <div class='field'>
                    <span class='label'>Email:</span>
                    <span class='value'>{$data['email']}</span>
                </div>
                <div class='field'>
                    <span class='label'>Phone:</span>
                    <span class='value'>" . ($data['phone'] ?: 'Not provided') . "</span>
                </div>
                <div class='field'>
                    <span class='label'>Subject:</span>
                    <span class='value'>" . ucfirst($data['subject']) . "</span>
                </div>
                <div class='field'>
                    <span class='label'>Newsletter:</span>
                    <span class='value'>" . ($data['newsletter'] ? 'Yes' : 'No') . "</span>
                </div>
                <div class='field'>
                    <span class='label'>Message:</span>
                    <div class='value' style='background: white; padding: 15px; border-radius: 5px; margin-top: 10px;'>
                        " . nl2br(htmlspecialchars($data['message'])) . "
                    </div>
                </div>
            </div>
            <div class='footer'>
                <p>This message was sent from the EduSync contact form at " . date('Y-m-d H:i:s') . "</p>
            </div>
        </div>
    </body>
    </html>";
    
    return send_contact_email(ADMIN_EMAIL, $subject, $message);
}

// Function to send confirmation email to user
function send_user_confirmation($user_email, $user_name) {
    $subject = "Thank you for contacting EduSync";
    
    $message = "
    <html>
    <head>
        <title>Thank you for contacting EduSync</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #667eea; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { 
                display: inline-block; 
                background: #667eea; 
                color: white; 
                padding: 12px 25px; 
                text-decoration: none; 
                border-radius: 5px; 
                margin: 20px 0;
            }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        </style>
    </head>
    <body>
        <div class='container'>
            <div class='header'>
                <h2>Thank you for contacting EduSync!</h2>
            </div>
            <div class='content'>
                <p>Dear $user_name,</p>
                <p>Thank you for reaching out to us. We have received your message and will get back to you as soon as possible.</p>
                <p>Our team typically responds within 24 hours during business days.</p>
                <p>In the meantime, feel free to explore our platform and discover all the features EduSync has to offer.</p>
                <p>Best regards,<br>The EduSync Team</p>
            </div>
            <div class='footer'>
                <p>This is an automated message. Please do not reply to this email.</p>
                <p>© 2024 EduSync. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>";
    
    return send_contact_email($user_email, $subject, $message);
}

// Main processing logic
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $response = array();
    
    try {
        // Validate CSRF token
        if (!isset($_POST['csrf_token']) || $_POST['csrf_token'] !== $_SESSION['csrf_token']) {
            throw new Exception('Invalid security token. Please try again.');
        }
        
        // Sanitize and validate input
        $firstName = sanitize_input($_POST['firstName'] ?? '');
        $lastName = sanitize_input($_POST['lastName'] ?? '');
        $email = sanitize_input($_POST['email'] ?? '');
        $phone = sanitize_input($_POST['phone'] ?? '');
        $subject = sanitize_input($_POST['subject'] ?? '');
        $message = sanitize_input($_POST['message'] ?? '');
        $newsletter = isset($_POST['newsletter']) ? true : false;
        
        // Validation
        if (empty($firstName) || empty($lastName) || empty($email) || empty($subject) || empty($message)) {
            throw new Exception('All required fields must be filled.');
        }
        
        if (!validate_email($email)) {
            throw new Exception('Please enter a valid email address.');
        }
        
        if (!in_array($subject, ['general', 'technical', 'billing', 'feature', 'other'])) {
            throw new Exception('Please select a valid subject.');
        }
        
        if (strlen($message) < 10) {
            throw new Exception('Message must be at least 10 characters long.');
        }
        
        // Database connection
        try {
            $pdo = new PDO("mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET, DB_USER, DB_PASS);
            $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        } catch (PDOException $e) {
            throw new Exception('Database connection failed. Please try again later.');
        }
        
        // Prepare data for database and email
        $data = array(
            'firstName' => $firstName,
            'lastName' => $lastName,
            'email' => $email,
            'phone' => $phone,
            'subject' => $subject,
            'message' => $message,
            'newsletter' => $newsletter
        );
        
        // Log to database
        if (!log_contact_message($pdo, $data)) {
            throw new Exception('Failed to save message. Please try again.');
        }
        
        // Send emails
        $admin_sent = send_admin_notification($data);
        $user_sent = send_user_confirmation($email, $firstName);
        
        // Prepare response
        $response['success'] = true;
        $response['message'] = 'Thank you for your message! We will get back to you soon.';
        
        // Log email status
        if (!$admin_sent) {
            error_log("Failed to send admin notification email");
        }
        if (!$user_sent) {
            error_log("Failed to send user confirmation email");
        }
        
    } catch (Exception $e) {
        $response['success'] = false;
        $response['message'] = $e->getMessage();
    }
    
    // Return JSON response
    header('Content-Type: application/json');
    echo json_encode($response);
    exit;
}

// If not POST request, redirect to contact page
header('Location: contact.html');
exit;
?>
