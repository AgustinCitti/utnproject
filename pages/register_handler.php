<?php
header('Content-Type: application/json');

// incluyo la config central de la base de datos
require_once __DIR__ . '/../config/database.php';

// solo se permite el método post
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405); // método no permitido
    echo json_encode(['success' => false, 'message' => 'método no permitido.']);
    exit;
}

// obtengo los datos que vienen del body (en formato json desde js)
$data = json_decode(file_get_contents('php://input'), true);

$firstName = $data['firstName'] ?? '';
$lastName = $data['lastName'] ?? '';
$email = $data['email'] ?? '';
$password = $data['password'] ?? '';
$confirmPassword = $data['confirmPassword'] ?? '';

// --- validaciones básicas ---
if (empty($firstName) || empty($lastName) || empty($email) || empty($password)) {
    http_response_code(400); // error de solicitud
    echo json_encode(['success' => false, 'message' => 'todos los campos son obligatorios.']);
    exit;
}

if ($password !== $confirmPassword) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'las contraseñas no coinciden.']);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'el formato del correo electrónico no es válido.']);
    exit;
}

if (strlen($password) < 8) { // chequeo que la contraseña tenga al menos 8 caracteres
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'la contraseña debe tener al menos 8 caracteres.']);
    exit;
}

// --- conexión y consultas a la base de datos ---
try {
    $pdo = new PDO("mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET, DB_USER, DB_PASS);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // 1. verifico si el mail ya está registrado
    $stmt = $pdo->prepare("SELECT 1 FROM Usuarios_docente WHERE Email_docente = ?");
    $stmt->execute([$email]);
    if ($stmt->fetch()) {
        http_response_code(409); // conflicto
        echo json_encode(['success' => false, 'message' => 'el correo electrónico ya está registrado.']);
        exit;
    }

    // 2. encripto la contraseña antes de guardarla
    $hashedPassword = password_hash($password, PASSWORD_DEFAULT);

    // 3. inserto el nuevo usuario
    $sql = "INSERT INTO Usuarios_docente (Nombre_docente, Apellido_docente, Email_docente, Contraseña) VALUES (?, ?, ?, ?)";
    $stmt = $pdo->prepare($sql);
    
    if ($stmt->execute([$firstName, $lastName, $email, $hashedPassword])) {
        // si todo sale bien
        http_response_code(201); // creado
        echo json_encode(['success' => true, 'message' => '¡registro exitoso! ahora puedes iniciar sesión.']);
    } else {
        throw new Exception("no se pudo ejecutar la inserción del usuario.");
    }

} catch (PDOException $e) {
    http_response_code(500); // error interno del servidor
    echo json_encode(['success' => false, 'message' => 'error interno del servidor. por favor, intente más tarde.']);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'ocurrió un error inesperado.']);
}
?>

