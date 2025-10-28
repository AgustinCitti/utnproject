<?php
header('Content-Type: application/json');

// include the central database configuration
require_once __DIR__ . '/../config/database.php';

// only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405); // Method Not Allowed
    echo json_encode(['success' => false, 'message' => 'Método no permitido.']);
    exit;
}

// get data from the request body (assuming JSON is sent from JS)
$data = json_decode(file_get_contents('php://input'), true);

$firstName = $data['firstName'] ?? '';
$lastName = $data['lastName'] ?? '';
$email = $data['email'] ?? '';
$password = $data['password'] ?? '';
$confirmPassword = $data['confirmPassword'] ?? '';

// --- basic validation ---
if (empty($firstName) || empty($lastName) || empty($email) || empty($password)) {
    http_response_code(400); // bad Request
    echo json_encode(['success' => false, 'message' => 'Todos los campos son obligatorios.']);
    exit;
}

if ($password !== $confirmPassword) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Las contraseñas no coinciden.']);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'El formato del correo electrónico no es válido.']);
    exit;
}

if (strlen($password) < 8) { // add a password length check
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'La contraseña debe tener al menos 8 caracteres.']);
    exit;
}

// --- database ---
try {
    $pdo = new PDO("mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET, DB_USER, DB_PASS);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // 1. check if email already exists
    $stmt = $pdo->prepare("SELECT 1 FROM Usuarios_docente WHERE Email_docente = ?");
    $stmt->execute([$email]);
    if ($stmt->fetch()) {
        http_response_code(409); // Conflict
        echo json_encode(['success' => false, 'message' => 'El correo electrónico ya está registrado.']);
        exit;
    }

    // 2. hash the password
    $hashedPassword = password_hash($password, PASSWORD_DEFAULT);

    // 3. insert the new user
    $sql = "INSERT INTO Usuarios_docente (Nombre_docente, Apellido_docente, Email_docente, Contraseña) VALUES (?, ?, ?, ?)";
    $stmt = $pdo->prepare($sql);
    
    if ($stmt->execute([$firstName, $lastName, $email, $hashedPassword])) {
        // success
        http_response_code(201); // created
        echo json_encode(['success' => true, 'message' => '¡Registro exitoso! Ahora puedes iniciar sesión.']);
    } else {
        throw new Exception("No se pudo ejecutar la inserción del usuario.");
    }

} catch (PDOException $e) {
    http_response_code(500); // internal Server Error
    echo json_encode(['success' => false, 'message' => 'Error interno del servidor. Por favor, intente más tarde.']);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Ocurrió un error inesperado.']);
}
?>
