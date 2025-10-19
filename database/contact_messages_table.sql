-- =====================================================
-- Contact Messages Table for EduSync
-- =====================================================

USE edusync;

-- Create contact messages table
CREATE TABLE IF NOT EXISTS contact_messages (
    ID_message INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    subject ENUM('general', 'technical', 'billing', 'feature', 'other') NOT NULL,
    message TEXT NOT NULL,
    newsletter_opt BOOLEAN DEFAULT FALSE,
    status ENUM('new', 'read', 'replied', 'closed') DEFAULT 'new',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    admin_notes TEXT,
    replied_at TIMESTAMP NULL,
    replied_by INT NULL,
    -- Indexes for better performance
    INDEX idx_email (email),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at),
    INDEX idx_subject (subject),
    -- Foreign key to admin user who replied (optional)
    CONSTRAINT fk_contact_replied_by FOREIGN KEY (replied_by) 
        REFERENCES Usuarios_docente(ID_docente) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert sample contact messages for testing
INSERT INTO contact_messages (
    first_name, 
    last_name, 
    email, 
    phone, 
    subject, 
    message, 
    newsletter_opt, 
    status
) VALUES 
(
    'Juan', 
    'Pérez', 
    'juan.perez@email.com', 
    '+54 11 1234-5678', 
    'general', 
    'I would like to know more about EduSync features and pricing options.', 
    TRUE, 
    'new'
),
(
    'María', 
    'González', 
    'maria.gonzalez@school.edu', 
    '+54 11 2345-6789', 
    'technical', 
    'I am having trouble logging into my account. Can you help me reset my password?', 
    FALSE, 
    'read'
),
(
    'Carlos', 
    'Rodríguez', 
    'carlos.rodriguez@university.edu', 
    '+54 11 3456-7890', 
    'feature', 
    'It would be great to have a mobile app for students to check their grades on the go.', 
    TRUE, 
    'replied'
);

-- Create a view for contact message statistics
CREATE VIEW contact_message_stats AS
SELECT 
    COUNT(*) as total_messages,
    COUNT(CASE WHEN status = 'new' THEN 1 END) as new_messages,
    COUNT(CASE WHEN status = 'read' THEN 1 END) as read_messages,
    COUNT(CASE WHEN status = 'replied' THEN 1 END) as replied_messages,
    COUNT(CASE WHEN status = 'closed' THEN 1 END) as closed_messages,
    COUNT(CASE WHEN newsletter_opt = TRUE THEN 1 END) as newsletter_subscribers,
    COUNT(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 7 DAYS) THEN 1 END) as messages_last_week,
    COUNT(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 30 DAYS) THEN 1 END) as messages_last_month
FROM contact_messages;

-- Create a view for recent contact messages
CREATE VIEW recent_contact_messages AS
SELECT 
    ID_message,
    CONCAT(first_name, ' ', last_name) as full_name,
    email,
    phone,
    subject,
    LEFT(message, 100) as message_preview,
    newsletter_opt,
    status,
    created_at,
    updated_at,
    admin_notes,
    replied_at,
    replied_by
FROM contact_messages
ORDER BY created_at DESC;

-- Create a stored procedure to get contact messages by status
DELIMITER //
CREATE PROCEDURE get_contact_messages_by_status(
    IN p_status VARCHAR(20)
)
BEGIN
    SELECT 
        ID_message,
        CONCAT(first_name, ' ', last_name) as full_name,
        email,
        phone,
        subject,
        message,
        newsletter_opt,
        status,
        created_at,
        updated_at,
        admin_notes,
        replied_at,
        replied_by
    FROM contact_messages
    WHERE status = p_status
    ORDER BY created_at DESC;
END //

-- Create a stored procedure to update contact message status
CREATE PROCEDURE update_contact_message_status(
    IN p_message_id INT,
    IN p_status VARCHAR(20),
    IN p_admin_notes TEXT,
    IN p_replied_by INT
)
BEGIN
    UPDATE contact_messages 
    SET 
        status = p_status,
        admin_notes = p_admin_notes,
        replied_by = p_replied_by,
        replied_at = CASE 
            WHEN p_status = 'replied' THEN CURRENT_TIMESTAMP 
            ELSE replied_at 
        END,
        updated_at = CURRENT_TIMESTAMP
    WHERE ID_message = p_message_id;
END //

-- Create a stored procedure to get contact message statistics
CREATE PROCEDURE get_contact_statistics()
BEGIN
    SELECT 
        COUNT(*) as total_messages,
        COUNT(CASE WHEN status = 'new' THEN 1 END) as new_messages,
        COUNT(CASE WHEN status = 'read' THEN 1 END) as read_messages,
        COUNT(CASE WHEN status = 'replied' THEN 1 END) as replied_messages,
        COUNT(CASE WHEN status = 'closed' THEN 1 END) as closed_messages,
        COUNT(CASE WHEN newsletter_opt = TRUE THEN 1 END) as newsletter_subscribers,
        COUNT(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 7 DAYS) THEN 1 END) as messages_last_week,
        COUNT(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 30 DAYS) THEN 1 END) as messages_last_month,
        AVG(CASE 
            WHEN status = 'replied' AND replied_at IS NOT NULL 
            THEN TIMESTAMPDIFF(HOUR, created_at, replied_at) 
        END) as avg_response_time_hours
    FROM contact_messages;
END //

DELIMITER ;

-- Create an index for better performance on status and date queries
CREATE INDEX idx_status_created ON contact_messages(status, created_at);

-- Create a trigger to automatically update the updated_at timestamp
DELIMITER //
CREATE TRIGGER trg_contact_messages_update
    BEFORE UPDATE ON contact_messages
    FOR EACH ROW
BEGIN
    SET NEW.updated_at = CURRENT_TIMESTAMP;
END //
DELIMITER ;

-- =====================================================
-- COMMENTS AND DOCUMENTATION
-- =====================================================

/*
CONTACT MESSAGES TABLE FEATURES:

1. **Primary Fields:**
   - ID_message: Auto-increment primary key
   - first_name, last_name: Contact person details
   - email: Contact email (required)
   - phone: Optional phone number
   - subject: Categorized inquiry type
   - message: The actual message content
   - newsletter_opt: Newsletter subscription preference

2. **Status Management:**
   - new: Just received, not yet read
   - read: Admin has read the message
   - replied: Admin has responded
   - closed: Issue resolved or closed

3. **Tracking Fields:**
   - created_at: When the message was received
   - updated_at: Last modification timestamp
   - replied_at: When admin replied
   - replied_by: Which admin replied
   - admin_notes: Internal notes for admin use

4. **Performance Optimizations:**
   - Indexes on frequently queried fields
   - Foreign key relationship with admin users
   - Views for common queries
   - Stored procedures for complex operations

5. **Use Cases:**
   - Store all contact form submissions
   - Track message status and responses
   - Generate statistics and reports
   - Manage admin workflow
   - Newsletter subscription tracking

6. **Integration:**
   - Links to existing admin users table
   - Compatible with existing EduSync database
   - UTF-8 support for international messages
   - InnoDB engine for better performance

SETUP INSTRUCTIONS:
1. Run this script in your MySQL database
2. Update the contact form action to point to contact_handler.php
3. Configure email settings in the PHP handler
4. Set up Google Maps API key for the map functionality
*/
