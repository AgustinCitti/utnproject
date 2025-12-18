<?php
/**
 * Script para actualizar un usuario a PREMIUM
 * Uso: POST con JSON {"user_id": 1} o {"email": "usuario@ejemplo.com"}
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Manejar preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/../config/database.php';

// Solo permitir POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Método no permitido. Use POST.']);
    exit;
}

// Iniciar sesión para verificar permisos (opcional, puede comentarse para uso directo)
session_start();

// Verificar que el usuario esté logueado y sea ADMIN (opcional)
// Puedes comentar estas líneas si quieres permitir actualizaciones sin autenticación
if (!isset($_SESSION['logged_in']) || $_SESSION['logged_in'] !== true) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'No autorizado. Debe iniciar sesión.']);
    exit;
}

$userRole = isset($_SESSION['user_role']) ? strtoupper(trim($_SESSION['user_role'])) : '';
if ($userRole !== 'ADMIN') {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Acceso denegado. Solo administradores pueden acceder.']);
    exit;
}

try {
    $pdo = new PDO(
        "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET,
        DB_USER,
        DB_PASS
    );
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);

    // Leer datos JSON
    $raw = file_get_contents('php://input');
    $data = json_decode($raw, true);
    
    if (!$data) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Datos JSON inválidos']);
        exit;
    }

    $user_id = isset($data['user_id']) ? (int)$data['user_id'] : null;
    $email = isset($data['email']) ? trim($data['email']) : null;

    if (!$user_id && !$email) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Debe proporcionar user_id o email']);
        exit;
    }

    // Buscar usuario
    if ($user_id) {
        $stmt = $pdo->prepare("SELECT ID_docente, Nombre_docente, Apellido_docente, Email_docente, Plan_usuario FROM Usuarios_docente WHERE ID_docente = ?");
        $stmt->execute([$user_id]);
    } else {
        $stmt = $pdo->prepare("SELECT ID_docente, Nombre_docente, Apellido_docente, Email_docente, Plan_usuario FROM Usuarios_docente WHERE Email_docente = ?");
        $stmt->execute([$email]);
    }

    $user = $stmt->fetch();
    
    if (!$user) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Usuario no encontrado']);
        exit;
    }

    // Actualizar a PREMIUM
    $updateStmt = $pdo->prepare("UPDATE Usuarios_docente SET Plan_usuario = 'PREMIUM' WHERE ID_docente = ?");
    $updateStmt->execute([$user['ID_docente']]);

    http_response_code(200);
    echo json_encode([
        'success' => true,
        'message' => 'Usuario actualizado a PREMIUM exitosamente',
        'user' => [
            'id' => $user['ID_docente'],
            'nombre' => $user['Nombre_docente'],
            'apellido' => $user['Apellido_docente'],
            'email' => $user['Email_docente'],
            'plan_anterior' => $user['Plan_usuario'],
            'plan_actual' => 'PREMIUM'
        ]
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Error de base de datos: ' . $e->getMessage()]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Error del servidor: ' . $e->getMessage()]);
}
?>

