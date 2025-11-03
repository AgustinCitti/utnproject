<?php
/**
 * API endpoint para el formulario de contacto.
 * - Respeta el patrón del proyecto: header JSON, método POST, validaciones, PDO prepared statements,
 *   respuestas uniformes { success, message, data? } y logging de errores.
 * - Soporta tanto envíos application/x-www-form-urlencoded (form submit) como JSON (AJAX).
 */

header('Content-Type: application/json');

// Solo permitir POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'método no permitido.']);
    exit;
}

// config y utilidades del proyecto
require_once __DIR__ . '/../config/database.php';
// contact_config.php define ADMIN_EMAIL, SITE_NAME, FROM_EMAIL en este repo (si existe)
if (file_exists(__DIR__ . '/../config/contact_config.php')) {
    require_once __DIR__ . '/../config/contact_config.php';
}

// leer payload: preferir JSON pero aceptar form-data
$raw = file_get_contents('php://input');
$input = json_decode($raw, true);
if (!is_array($input)) {
    $input = $_POST; // fallback cuando el form envía application/x-www-form-urlencoded
}

// Debug logging
error_log('Contact form input: ' . print_r($input, true));
error_log('POST data: ' . print_r($_POST, true));
error_log('Raw input: ' . $raw);

function sanitize_input($data) {
    $data = trim((string)$data);
    $data = stripslashes($data);
    $data = htmlspecialchars($data, ENT_QUOTES, 'UTF-8');
    return $data;
}

function validate_email($email) {
    return filter_var($email, FILTER_VALIDATE_EMAIL);
}

function send_contact_email($to, $subject, $message) {
    $from = defined('FROM_EMAIL') ? FROM_EMAIL : 'noreply@example.com';
    $site = defined('SITE_NAME') ? SITE_NAME : 'Website';
    $headers = "From: {$site} <{$from}>\r\n";
    $headers .= "Reply-To: {$from}\r\n";
    $headers .= "Content-Type: text/html; charset=UTF-8\r\n";
    $headers .= "X-Mailer: PHP/" . phpversion();
    // usar @mail para que no rompa el flujo; logueamos en caso de fallo
    return @mail($to, $subject, $message, $headers);
}

function send_admin_notification($data) {
    $subject = 'Nuevo mensaje de contacto - ' . ($data['subject'] ?? 'Contacto');
    $message = "<html><head><meta charset=\"utf-8\"></head><body>";
    $message .= "<h2>Nuevo mensaje recibido</h2>";
    $message .= "<p><strong>Nombre:</strong> " . htmlspecialchars(($data['firstName'] ?? '') . ' ' . ($data['lastName'] ?? '')) . "</p>";
    $message .= "<p><strong>Email:</strong> " . htmlspecialchars($data['email'] ?? '') . "</p>";
    $message .= "<p><strong>Teléfono:</strong> " . htmlspecialchars($data['phone'] ?? 'No proporcionado') . "</p>";
    $message .= "<p><strong>Asunto:</strong> " . htmlspecialchars($data['subject'] ?? '') . "</p>";
    $message .= "<p><strong>Mensaje:</strong><br/>" . nl2br(htmlspecialchars($data['message'] ?? '')) . "</p>";
    $message .= "<p>Enviado el " . date('Y-m-d H:i:s') . "</p>";
    $message .= "</body></html>";

    if (defined('ADMIN_EMAIL')) {
        $sent = send_contact_email(ADMIN_EMAIL, $subject, $message);
        if (!$sent) error_log('contact api: fallo al enviar email al admin');
        return $sent;
    }
    return false;
}

function send_user_confirmation($user_email, $user_name) {
    $subject = 'Gracias por contactarnos';
    $message = "<html><head><meta charset=\"utf-8\"></head><body>";
    $message .= "<h2>Gracias, " . htmlspecialchars($user_name) . "</h2>";
    $message .= "<p>Hemos recibido tu mensaje y te responderemos a la brevedad.</p>";
    $message .= "</body></html>";
    $sent = send_contact_email($user_email, $subject, $message);
    if (!$sent) error_log('contact api: fallo al enviar email de confirmacion al usuario');
    return $sent;
}

try {
    // sanitizar entradas según front
    $firstName = sanitize_input($input['firstName'] ?? '');
    $lastName = sanitize_input($input['lastName'] ?? '');
    $email = sanitize_input($input['email'] ?? '');
    $phone = sanitize_input($input['phone'] ?? '');
    $message = sanitize_input($input['message'] ?? '');
    // Validar y normalizar el subject para que coincida con los valores ENUM permitidos
    $subject = strtolower(sanitize_input($input['subject'] ?? 'general'));
    // Asegurarse de que el subject sea uno de los valores permitidos
    $allowed_subjects = ['general', 'technical', 'billing', 'feature', 'other'];
    if (!in_array($subject, $allowed_subjects)) {
        $subject = 'general'; // Valor por defecto si no es válido
    }
    $newsletter = isset($input['newsletter']) ? (int)$input['newsletter'] : 0;

    // validaciones básicas (siguiendo el patrón detectado)
    if (empty($firstName) || empty($lastName) || empty($email) || empty($message)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Todos los campos obligatorios deben completarse.']);
        exit;
    }

    if (!validate_email($email)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Ingresá un correo electrónico válido.']);
        exit;
    }

    if (strlen($message) < 10) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'El mensaje debe tener al menos 10 caracteres.']);
        exit;
    }

    // conexión PDO (usar config/database.php del repo)
    try {
        $pdo = new PDO("mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET, DB_USER, DB_PASS);
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    } catch (PDOException $e) {
        error_log('contact api - db connect error: ' . $e->getMessage());
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Error al conectar con la base de datos.']);
        exit;
    }

    // insertar mensaje a la tabla contact_messages (según database/contact_messages_table.sql)
    $sql = "INSERT INTO contact_messages (first_name, last_name, email, phone, subject, message, newsletter_opt, status) VALUES (?, ?, ?, ?, ?, ?, ?, 'new')";
    $stmt = $pdo->prepare($sql);
    $ok = $stmt->execute([$firstName, $lastName, $email, $phone, $subject, $message, $newsletter]);

    if (!$ok) {
        throw new Exception('No se pudo guardar el mensaje.');
    }

    // notificaciones (no bloqueantes para la respuesta)
    send_admin_notification(['firstName' => $firstName, 'lastName' => $lastName, 'email' => $email, 'phone' => $phone, 'subject' => $subject, 'message' => $message]);
    send_user_confirmation($email, $firstName);

    http_response_code(201);
    echo json_encode(['success' => true, 'message' => '¡Gracias por tu mensaje! Te responderemos pronto.']);
    exit;

} catch (Exception $e) {
    error_log('contact api error: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Ocurrió un error interno.']);
    exit;
}

?>