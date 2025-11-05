<?php
// --- 1. configuración inicial ---
header('Content-Type: application/json');
session_start();
require_once __DIR__ . '/../config/database.php';

// --- 2. validación del método de solicitud ---
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'método no permitido.']);
    exit;
}

// --- 3. obtener y limpiar los datos del input ---
$data = json_decode(file_get_contents('php://input'), true);
$email = $data['email'] ?? '';
$password = $data['password'] ?? '';

// --- 4. validación de datos ---
if (empty($email) || empty($password)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'el email y la contraseña son obligatorios.']);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'formato de email inválido.']);
    exit;
}

// --- validación de email de Google ---
if (preg_match('/@gmail\\.com$/i', $email)) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'parece que estás usando una cuenta de google. por favor, utiliza el botón "iniciar sesión con google".',
        'google_login_required' => true
    ]);
    exit;
}

// --- 5. conexión con la base de datos y verificación del usuario ---
try {
    $pdo = new PDO(
        "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET,
        DB_USER,
        DB_PASS
    );
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $stmt = $pdo->prepare("SELECT * FROM Usuarios_docente WHERE Email_docente = ?");
    $stmt->execute([$email]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($user && password_verify($password, $user['Contraseña'])) {
        session_regenerate_id(true);
        $_SESSION['user_id'] = $user['ID_docente'];
        $_SESSION['user_name'] = $user['Nombre_docente'];
        $_SESSION['user_lastname'] = $user['Apellido_docente'];
        $_SESSION['user_email'] = $user['Email_docente'];
        $_SESSION['user_role'] = $user['Tipo_usuario'];
        $_SESSION['logged_in'] = true;

        $userData = [
            'id' => $user['ID_docente'],
            'name' => $user['Nombre_docente'] . ' ' . $user['Apellido_docente'],
            'email' => $user['Email_docente'],
            'role' => $user['Tipo_usuario']
        ];

        http_response_code(200);
        echo json_encode(['success' => true, 'message' => 'inicio de sesión exitoso.', 'user' => $userData]);
    } else {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'email o contraseña incorrectos.']);
    }

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'error interno del servidor.']);
}
?>

