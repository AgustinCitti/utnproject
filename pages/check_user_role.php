<?php
/**
 * Debug script to check user role in database
 * Usage: check_user_role.php?email=user@example.com
 */

header('Content-Type: application/json');
require_once __DIR__ . '/../config/database.php';

$email = $_GET['email'] ?? '';

if (empty($email)) {
    echo json_encode(['error' => 'Email parameter required']);
    exit;
}

try {
    $pdo = new PDO(
        "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET,
        DB_USER,
        DB_PASS
    );
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $stmt = $pdo->prepare("SELECT ID_docente, Nombre_docente, Apellido_docente, Email_docente, Tipo_usuario, Estado FROM Usuarios_docente WHERE Email_docente = ?");
    $stmt->execute([$email]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($user) {
        echo json_encode([
            'found' => true,
            'user' => [
                'id' => $user['ID_docente'],
                'name' => $user['Nombre_docente'] . ' ' . $user['Apellido_docente'],
                'email' => $user['Email_docente'],
                'tipo_usuario' => $user['Tipo_usuario'],
                'tipo_usuario_raw' => bin2hex($user['Tipo_usuario']), // Show any hidden characters
                'tipo_usuario_length' => strlen($user['Tipo_usuario']),
                'estado' => $user['Estado'],
                'is_admin' => strtoupper(trim($user['Tipo_usuario'])) === 'ADMIN'
            ]
        ], JSON_PRETTY_PRINT);
    } else {
        echo json_encode(['found' => false, 'message' => 'User not found']);
    }
} catch (PDOException $e) {
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}
?>

