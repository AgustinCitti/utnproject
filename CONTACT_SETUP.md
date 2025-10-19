# EduSync Contact System Setup Guide

This guide will help you set up the contact system for EduSync, including the contact page, Google Maps integration, email functionality, and database storage.

## 📋 Prerequisites

- XAMPP or similar local server environment
- PHP 7.4 or higher
- MySQL 5.7 or higher
- Google Maps API key
- SMTP server configuration (for email sending)

## 🚀 Installation Steps

### 1. Database Setup

1. **Import the contact messages table:**
   ```sql
   -- Run the SQL script to create the contact_messages table
   source database/contact_messages_table.sql;
   ```

2. **Verify the table was created:**
   ```sql
   USE edusync;
   SHOW TABLES LIKE 'contact_messages';
   DESCRIBE contact_messages;
   ```

### 2. Configuration Setup

1. **Update database credentials in `pages/contact_handler.php`:**
   ```php
   $host = 'localhost';
   $dbname = 'edusync';
   $username = 'your_username';
   $password = 'your_password';
   ```

2. **Update email configuration in `pages/contact_handler.php`:**
   ```php
   $admin_email = 'admin@yourdomain.com';
   $from_email = 'noreply@yourdomain.com';
   $site_name = 'Your Site Name';
   ```

3. **Configure Google Maps API:**
   - Get a Google Maps API key from [Google Cloud Console](https://console.cloud.google.com/)
   - Enable the Maps JavaScript API
   - Update the API key in `pages/contact.html`:
   ```html
   <script async defer 
       src="https://maps.googleapis.com/maps/api/js?key=YOUR_ACTUAL_API_KEY&callback=initMap">
   </script>
   ```

### 3. File Permissions

Ensure the following directories have write permissions:
```bash
chmod 755 logs/
chmod 755 config/
```

### 4. Email Configuration

#### Option A: Using PHP's mail() function (Basic)
The system is configured to use PHP's built-in `mail()` function by default.

#### Option B: Using SMTP (Recommended for production)
Update `pages/contact_handler.php` to use PHPMailer or similar:

```php
// Add PHPMailer
require_once 'vendor/autoload.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;

function send_contact_email_smtp($to, $subject, $message, $from_name, $from_email) {
    $mail = new PHPMailer(true);
    
    try {
        $mail->isSMTP();
        $mail->Host = 'smtp.gmail.com';
        $mail->SMTPAuth = true;
        $mail->Username = 'your-email@gmail.com';
        $mail->Password = 'your-app-password';
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Port = 587;
        
        $mail->setFrom($from_email, $from_name);
        $mail->addAddress($to);
        
        $mail->isHTML(true);
        $mail->Subject = $subject;
        $mail->Body = $message;
        
        return $mail->send();
    } catch (Exception $e) {
        return false;
    }
}
```

## 🎨 Customization

### 1. Styling
- Edit `styles/contact.css` to customize the appearance
- Modify colors, fonts, and layout as needed
- The design is fully responsive

### 2. Form Fields
- Add/remove form fields in `pages/contact.html`
- Update validation in `scripts/contact.js`
- Modify database schema if needed

### 3. Email Templates
- Customize email templates in `pages/contact_handler.php`
- Create HTML email templates for better formatting

### 4. Map Location
- Update coordinates in `scripts/contact.js`:
```javascript
const defaultLocation = { lat: YOUR_LATITUDE, lng: YOUR_LONGITUDE };
```

## 🔧 Testing

### 1. Test the Contact Form
1. Navigate to `pages/contact.html`
2. Fill out the form with test data
3. Submit and verify:
   - Success message appears
   - Email is sent to admin
   - Confirmation email sent to user
   - Data is stored in database

### 2. Test Google Maps
1. Verify the map loads correctly
2. Check that the marker appears at the correct location
3. Test the info window functionality

### 3. Test Database Storage
```sql
SELECT * FROM contact_messages ORDER BY created_at DESC LIMIT 5;
```

## 🛠️ Troubleshooting

### Common Issues

1. **Form submission not working:**
   - Check PHP error logs
   - Verify database connection
   - Ensure CSRF token is working

2. **Google Maps not loading:**
   - Verify API key is correct
   - Check browser console for errors
   - Ensure Maps JavaScript API is enabled

3. **Emails not sending:**
   - Check SMTP configuration
   - Verify email server settings
   - Check spam folder

4. **Database errors:**
   - Verify table exists
   - Check user permissions
   - Review connection parameters

### Debug Mode

Enable debug mode in `pages/contact_handler.php`:
```php
// Add at the top of the file
error_reporting(E_ALL);
ini_set('display_errors', 1);
```

## 📊 Features

### Contact Form Features
- ✅ Responsive design
- ✅ Real-time validation
- ✅ CSRF protection
- ✅ Email notifications
- ✅ Database storage
- ✅ Google Maps integration
- ✅ Multi-language support
- ✅ Accessibility features

### Admin Features
- ✅ Message management
- ✅ Status tracking
- ✅ Statistics dashboard
- ✅ Email notifications
- ✅ Search and filtering

### Security Features
- ✅ CSRF token protection
- ✅ Input sanitization
- ✅ SQL injection prevention
- ✅ Rate limiting (configurable)
- ✅ XSS protection

## 📈 Analytics

The system includes built-in analytics:
- Message statistics
- Response time tracking
- Newsletter subscriptions
- Popular subjects

Access analytics via the database views:
```sql
SELECT * FROM contact_message_stats;
SELECT * FROM recent_contact_messages;
```

## 🔄 Maintenance

### Regular Tasks
1. **Monitor email delivery**
2. **Check database size**
3. **Review error logs**
4. **Update API keys**
5. **Backup contact data**

### Database Maintenance
```sql
-- Clean old messages (older than 1 year)
DELETE FROM contact_messages 
WHERE created_at < DATE_SUB(NOW(), INTERVAL 1 YEAR);

-- Optimize table
OPTIMIZE TABLE contact_messages;
```

## 📞 Support

For technical support:
- Check the error logs
- Review the configuration
- Test with minimal setup
- Contact system administrator

## 📝 License

This contact system is part of the EduSync project and follows the same licensing terms.

---

**Note:** Remember to replace placeholder values with your actual configuration before deploying to production.
