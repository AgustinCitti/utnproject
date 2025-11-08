<?php
/**
 * API para gestión de Usuarios Docente (Admin only)
 * Permite crear, leer, actualizar y eliminar usuarios
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Manejar preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/../config/database.php';

// Iniciar sesión para verificar permisos
session_start();

// Verificar que el usuario esté logueado y sea ADMIN
if (!isset($_SESSION['logged_in']) || $_SESSION['logged_in'] !== true) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'No autorizado. Debe iniciar sesión.']);
    exit;
}

// Verificar rol de administrador (case-insensitive)
$userRole = isset($_SESSION['user_role']) ? strtoupper(trim($_SESSION['user_role'])) : '';
if ($userRole !== 'ADMIN') {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Acceso denegado. Solo administradores pueden acceder.']);
    exit;
}

function respond($code, $data) {
    http_response_code($code);
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

function readJson() {
    $raw = file_get_contents('php://input');
    if (!$raw) return [];
    $decoded = json_decode($raw, true);
    return is_array($decoded) ? $decoded : [];
}

try {
    $pdo = new PDO(
        "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET,
        DB_USER,
        DB_PASS
    );
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);

    $method = $_SERVER['REQUEST_METHOD'];
    $id = isset($_GET['id']) ? (int)$_GET['id'] : null;

    switch ($method) {
        case 'GET':
            if ($id) {
                // Obtener un usuario específico
                $stmt = $pdo->prepare("SELECT ID_docente, Nombre_docente, Apellido_docente, Email_docente, google_id, oauth_provider, Avatar, DNI, Telefono, Direccion, Fecha_nacimiento, Especialidad, Titulo_academico, Fecha_registro, Ultimo_acceso, Estado, Tipo_usuario, Plan_usuario, Plan_actual_ID, Configuracion FROM Usuarios_docente WHERE ID_docente = ?");
                $stmt->execute([$id]);
                $user = $stmt->fetch();
                
                if (!$user) {
                    respond(404, ['success' => false, 'message' => 'Usuario no encontrado']);
                }
                
                // No devolver la contraseña
                respond(200, $user);
            } else {
                // Obtener todos los usuarios (sin contraseñas)
                $search = $_GET['search'] ?? '';
                $sql = "SELECT ID_docente, Nombre_docente, Apellido_docente, Email_docente, google_id, oauth_provider, Avatar, DNI, Telefono, Direccion, Fecha_nacimiento, Especialidad, Titulo_academico, Fecha_registro, Ultimo_acceso, Estado, Tipo_usuario, Plan_usuario, Plan_actual_ID, Configuracion FROM Usuarios_docente";
                
                $params = [];
                if ($search) {
                    $sql .= " WHERE Nombre_docente LIKE ? OR Apellido_docente LIKE ? OR Email_docente LIKE ? OR DNI LIKE ?";
                    $searchParam = "%{$search}%";
                    $params = [$searchParam, $searchParam, $searchParam, $searchParam];
                }
                
                $sql .= " ORDER BY Fecha_registro DESC";
                
                $stmt = $pdo->prepare($sql);
                $stmt->execute($params);
                $users = $stmt->fetchAll();
                
                respond(200, $users);
            }
            break;

        case 'POST':
            $body = readJson();
            
            // Validación de campos requeridos
            $required = ['Nombre_docente', 'Apellido_docente', 'Email_docente', 'password', 'Tipo_usuario', 'Estado'];
            foreach ($required as $field) {
                if (!isset($body[$field]) || $body[$field] === '') {
                    respond(400, ['success' => false, 'message' => "Campo requerido faltante: {$field}"]);
                }
            }
            
            // Validar email único
            $stmt = $pdo->prepare("SELECT ID_docente FROM Usuarios_docente WHERE Email_docente = ?");
            $stmt->execute([$body['Email_docente']]);
            if ($stmt->fetch()) {
                respond(400, ['success' => false, 'message' => 'El email ya está registrado']);
            }
            
            // Hash de contraseña
            $hashedPassword = password_hash($body['password'], PASSWORD_BCRYPT);
            
            // Preparar campos
            $fields = [
                'Nombre_docente' => $body['Nombre_docente'],
                'Apellido_docente' => $body['Apellido_docente'],
                'Email_docente' => $body['Email_docente'],
                'Contraseña' => $hashedPassword,
                'DNI' => $body['DNI'] ?? null,
                'Telefono' => $body['Telefono'] ?? null,
                'Direccion' => $body['Direccion'] ?? null,
                'Fecha_nacimiento' => $body['Fecha_nacimiento'] ?? null,
                'Especialidad' => $body['Especialidad'] ?? null,
                'Titulo_academico' => $body['Titulo_academico'] ?? null,
                'Tipo_usuario' => $body['Tipo_usuario'],
                'Estado' => $body['Estado'],
                'Plan_usuario' => $body['Plan_usuario'] ?? null,
                'Plan_actual_ID' => isset($body['Plan_actual_ID']) ? (int)$body['Plan_actual_ID'] : null,
                'Configuracion' => isset($body['Configuracion']) && $body['Configuracion'] !== '' ? $body['Configuracion'] : null
            ];
            
            $fieldNames = array_keys($fields);
            $placeholders = array_fill(0, count($fieldNames), '?');
            
            $sql = "INSERT INTO Usuarios_docente (" . implode(', ', $fieldNames) . ", Fecha_registro) VALUES (" . implode(', ', $placeholders) . ", NOW())";
            
            $stmt = $pdo->prepare($sql);
            $stmt->execute(array_values($fields));
            
            $newId = $pdo->lastInsertId();
            respond(201, ['success' => true, 'id' => $newId, 'message' => 'Usuario creado exitosamente']);
            break;

        case 'PUT':
            if (!$id) {
                respond(400, ['success' => false, 'message' => 'ID de usuario requerido']);
            }
            
            $body = readJson();
            
            // Verificar que el usuario existe
            $stmt = $pdo->prepare("SELECT ID_docente FROM Usuarios_docente WHERE ID_docente = ?");
            $stmt->execute([$id]);
            if (!$stmt->fetch()) {
                respond(404, ['success' => false, 'message' => 'Usuario no encontrado']);
            }
            
            // Validar email único (si se está cambiando)
            if (isset($body['Email_docente'])) {
                $stmt = $pdo->prepare("SELECT ID_docente FROM Usuarios_docente WHERE Email_docente = ? AND ID_docente != ?");
                $stmt->execute([$body['Email_docente'], $id]);
                if ($stmt->fetch()) {
                    respond(400, ['success' => false, 'message' => 'El email ya está registrado']);
                }
            }
            
            // Preparar campos actualizables
            $updatableFields = [
                'Nombre_docente', 'Apellido_docente', 'Email_docente', 'DNI', 'Telefono', 
                'Direccion', 'Fecha_nacimiento', 'Especialidad', 'Titulo_academico', 
                'Tipo_usuario', 'Estado', 'Plan_usuario', 'Plan_actual_ID', 'Configuracion'
            ];
            
            $sets = [];
            $params = [];
            
            foreach ($updatableFields as $field) {
                if (array_key_exists($field, $body)) {
                    $sets[] = "{$field} = ?";
                    $params[] = $body[$field] === '' ? null : $body[$field];
                }
            }
            
            // Actualizar contraseña si se proporciona
            if (isset($body['password']) && $body['password'] !== '') {
                $sets[] = "Contraseña = ?";
                $params[] = password_hash($body['password'], PASSWORD_BCRYPT);
            }
            
            // Actualizar último acceso
            $sets[] = "Ultimo_acceso = NOW()";
            
            if (empty($sets)) {
                respond(400, ['success' => false, 'message' => 'No hay campos para actualizar']);
            }
            
            $params[] = $id;
            $sql = "UPDATE Usuarios_docente SET " . implode(', ', $sets) . " WHERE ID_docente = ?";
            
            $stmt = $pdo->prepare($sql);
            $stmt->execute($params);
            
            respond(200, ['success' => true, 'id' => $id, 'message' => 'Usuario actualizado exitosamente']);
            break;

        case 'DELETE':
            if (!$id) {
                respond(400, ['success' => false, 'message' => 'ID de usuario requerido']);
            }
            
            // Verificar que el usuario existe
            $stmt = $pdo->prepare("SELECT ID_docente FROM Usuarios_docente WHERE ID_docente = ?");
            $stmt->execute([$id]);
            if (!$stmt->fetch()) {
                respond(404, ['success' => false, 'message' => 'Usuario no encontrado']);
            }
            
            // No permitir eliminar el propio usuario admin
            if ($id == $_SESSION['user_id']) {
                respond(400, ['success' => false, 'message' => 'No puede eliminar su propio usuario']);
            }
            
            // Eliminar usuario
            $stmt = $pdo->prepare("DELETE FROM Usuarios_docente WHERE ID_docente = ?");
            $stmt->execute([$id]);
            
            respond(200, ['success' => true, 'message' => 'Usuario eliminado exitosamente']);
            break;

        default:
            respond(405, ['success' => false, 'message' => 'Método no permitido']);
    }

} catch (PDOException $e) {
    respond(500, ['success' => false, 'message' => 'Error de base de datos: ' . $e->getMessage()]);
} catch (Exception $e) {
    respond(500, ['success' => false, 'message' => 'Error del servidor: ' . $e->getMessage()]);
}
?>

