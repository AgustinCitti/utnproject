<?php 
// inicio de sesión para la protección csrf
session_start();

// incluyo la base de datos y la config del formulario de contacto
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/contact_config.php';

// genero el token csrf si no existe
if (!isset($_SESSION['csrf_token'])) {
    $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
}

// función para limpiar los datos del formulario
function sanitize_input($data) {
    $data = trim($data);
    $data = stripslashes($data);
    $data = htmlspecialchars($data);
    return $data;
}

// función para validar el formato del mail
function validate_email($email) {
    return filter_var($email, FILTER_VALIDATE_EMAIL);
}

// función para mandar el mail de contacto
function send_contact_email($to, $subject, $message) {
    $headers = "From: " . SITE_NAME . " <" . FROM_EMAIL . ">\r\n";
    $headers .= "Reply-To: " . FROM_EMAIL . "\r\n";
    $headers .= "Content-Type: text/html; charset=UTF-8\r\n";
    $headers .= "X-Mailer: PHP/" . phpversion();
    
    return mail($to, $subject, $message, $headers);
}

// función para guardar el mensaje en la base de datos
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
        error_log("error en la base de datos: " . $e->getMessage());
        return false;
    }
}

// función para mandar un mail al admin con los datos del contacto
function send_admin_notification($data) {
    $subject = "nuevo mensaje del formulario de contacto - " . $data['subject'];
    
    $message = "
    <html>
    <head>
        <title>nuevo mensaje del formulario</title>
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
                <h2>nuevo mensaje recibido</h2>
                <p>sistema de contacto edusync</p>
            </div>
            <div class='content'>
                <div class='field'>
                    <span class='label'>nombre:</span>
                    <span class='value'>{$data['firstName']} {$data['lastName']}</span>
                </div>
                <div class='field'>
                    <span class='label'>email:</span>
                    <span class='value'>{$data['email']}</span>
                </div>
                <div class='field'>
                    <span class='label'>teléfono:</span>
                    <span class='value'>" . ($data['phone'] ?: 'no proporcionado') . "</span>
                </div>
                <div class='field'>
                    <span class='label'>asunto:</span>
                    <span class='value'>" . ucfirst($data['subject']) . "</span>
                </div>
                <div class='field'>
                    <span class='label'>newsletter:</span>
                    <span class='value'>" . ($data['newsletter'] ? 'sí' : 'no') . "</span>
                </div>
                <div class='field'>
                    <span class='label'>mensaje:</span>
                    <div class='value' style='background: white; padding: 15px; border-radius: 5px; margin-top: 10px;'>
                        " . nl2br(htmlspecialchars($data['message'])) . "
                    </div>
                </div>
            </div>
            <div class='footer'>
                <p>este mensaje fue enviado desde el formulario de contacto de edusync el " . date('Y-m-d H:i:s') . "</p>
            </div>
        </div>
    </body>
    </html>";
    
    return send_contact_email(ADMIN_EMAIL, $subject, $message);
}

// función para mandar el mail de confirmación al usuario
function send_user_confirmation($user_email, $user_name) {
    $subject = "gracias por contactar con edusync";
    
    $message = "
    <html>
    <head>
        <title>gracias por tu mensaje</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #667eea; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        </style>
    </head>
    <body>
        <div class='container'>
            <div class='header'>
                <h2>¡gracias por contactarnos, $user_name!</h2>
            </div>
            <div class='content'>
                <p>hola $user_name,</p>
                <p>recibimos tu mensaje y te responderemos lo antes posible.</p>
                <p>nuestro equipo suele contestar dentro de las 24 horas hábiles.</p>
                <p>mientras tanto, podés seguir explorando nuestra plataforma y conocer todo lo que ofrece edusync.</p>
                <p>saludos,<br>el equipo de edusync</p>
            </div>
            <div class='footer'>
                <p>este es un mensaje automático, por favor no respondas.</p>
                <p>© 2024 edusync. todos los derechos reservados.</p>
            </div>
        </div>
    </body>
    </html>";
    
    return send_contact_email($user_email, $subject, $message);
}

// lógica principal del formulario
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $response = array();
    
    try {
        // valido el token csrf
        if (!isset($_POST['csrf_token']) || $_POST['csrf_token'] !== $_SESSION['csrf_token']) {
            throw new Exception('token de seguridad inválido, por favor intentá de nuevo.');
        }
        
        // limpio y valido los datos
        $firstName = sanitize_input($_POST['firstName'] ?? '');
        $lastName = sanitize_input($_POST['lastName'] ?? '');
        $email = sanitize_input($_POST['email'] ?? '');
        $phone = sanitize_input($_POST['phone'] ?? '');
        $subject = sanitize_input($_POST['subject'] ?? '');
        $message = sanitize_input($_POST['message'] ?? '');
        $newsletter = isset($_POST['newsletter']) ? true : false;
        
        // chequeos básicos
        if (empty($firstName) || empty($lastName) || empty($email) || empty($subject) || empty($message)) {
            throw new Exception('todos los campos obligatorios deben completarse.');
        }
        
        if (!validate_email($email)) {
            throw new Exception('ingresá un correo electrónico válido.');
        }
        
        if (!in_array($subject, ['general', 'technical', 'billing', 'feature', 'other'])) {
            throw new Exception('seleccioná un asunto válido.');
        }
        
        if (strlen($message) < 10) {
            throw new Exception('el mensaje debe tener al menos 10 caracteres.');
        }
        
        // me conecto a la base de datos
        try {
            $pdo = new PDO("mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET, DB_USER, DB_PASS);
            $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        } catch (PDOException $e) {
            throw new Exception('error al conectar con la base de datos. intentá más tarde.');
        }
        
        // preparo los datos para la base y el mail
        $data = array(
            'firstName' => $firstName,
            'lastName' => $lastName,
            'email' => $email,
            'phone' => $phone,
            'subject' => $subject,
            'message' => $message,
            'newsletter' => $newsletter
        );
        
        // guardo el mensaje en la base
        if (!log_contact_message($pdo, $data)) {
            throw new Exception('no se pudo guardar el mensaje, intentá de nuevo.');
        }
        
        // envío los mails
        $admin_sent = send_admin_notification($data);
        $user_sent = send_user_confirmation($email, $firstName);
        
        // respuesta final
        $response['success'] = true;
        $response['message'] = '¡gracias por tu mensaje! te responderemos pronto.';
        
        // registro de errores de mail (si fallan)
        if (!$admin_sent) {
            error_log("no se pudo enviar el mail al admin");
        }
        if (!$user_sent) {
            error_log("no se pudo enviar el mail al usuario");
        }
        
    } catch (Exception $e) {
        $response['success'] = false;
        $response['message'] = $e->getMessage();
    }
    
    // devuelvo la respuesta en json
    header('Content-Type: application/json');
    echo json_encode($response);
    exit;
}

// si no es un post, redirijo al formulario de contacto
header('Location: contact.html');
exit;
?>
