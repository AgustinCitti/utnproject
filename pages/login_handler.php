<?php
// --- 1. Setup and Configuration ---
header('Content-Type: application/json');

// Start session management
session_start();

// Include the central database configuration
require_once __DIR__ . '/../config/database.php';

// --- 2. Request Method Validation ---
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405); // Method Not Allowed
    echo json_encode(['success' => false, 'message' => 'Método no permitido.']);
    exit;
}

// --- 3. Get and Sanitize Input ---
$data = json_decode(file_get_contents('php://input'), true);
$email = $data['email'] ?? '';
$password = $data['password'] ?? '';

// --- 4. Input Validation ---
if (empty($email) || empty($password)) {
    http_response_code(400); // Bad Request
    echo json_encode(['success' => false, 'message' => 'El email y la contraseña son obligatorios.']);
    exit;
}

// --- 5. Database and Authentication Logic ---
try {
    $pdo = new PDO("mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET, DB_USER, DB_PASS);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Find the user by email
    $stmt = $pdo->prepare("SELECT * FROM Usuarios_docente WHERE Email_docente = ?");
    $stmt->execute([$email]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    // Verify user and password
    if ($user && password_verify($password, $user['Contraseña'])) {
        // Password is correct, login successful
        
        // Regenerate session ID for security
        session_regenerate_id(true);

        // Store user data in the session
        $_SESSION['user_id'] = $user['ID_docente'];
        $_SESSION['user_name'] = $user['Nombre_docente'];
        $_SESSION['user_lastname'] = $user['Apellido_docente'];
        $_SESSION['user_email'] = $user['Email_docente'];
        $_SESSION['user_role'] = $user['Tipo_usuario'];
        $_SESSION['logged_in'] = true;

        // Prepare user data to send back to the client
        $userData = [
            'id' => $user['ID_docente'],
            'name' => $user['Nombre_docente'] . ' ' . $user['Apellido_docente'],
            'email' => $user['Email_docente'],
            'role' => $user['Tipo_usuario']
        ];

        http_response_code(200); // OK
        echo json_encode(['success' => true, 'message' => 'Inicio de sesión exitoso.', 'user' => $userData]);

    } else {
        // Invalid credentials
        http_response_code(401); // Unauthorized
        echo json_encode(['success' => false, 'message' => 'Email o contraseña incorrectos.']);
    }

} catch (PDOException $e) {
    // Log the real error in a production environment
    // error_log('Login handler DB error: ' . $e->getMessage());
    http_response_code(500); // Internal Server Error
    echo json_encode(['success' => false, 'message' => 'Error interno del servidor.']);
}
?>