<?php
/*
 * API: Notificaciones
 * - GET: listar notificaciones (filtrado por sesión si hay usuario)
 * - POST: crear notificación
 * - PATCH/PUT: actualizar estado (marcar leída/archivar)
 * - DELETE: eliminar notificación
 * Sigue el patrón del proyecto: header JSON, PDO, prepared statements, respuestas uniformes.
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// manejar preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

require_once __DIR__ . '/../config/database.php';
session_start();

function respond($code, $payload) {
    http_response_code($code);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE);
    exit;
}

function get_json_input() {
    $raw = file_get_contents('php://input');
    $data = json_decode($raw, true);
    if (json_last_error() !== JSON_ERROR_NONE) return null;
    return $data;
}

try {
    // crear conexión PDO
    $pdo = new PDO("mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET, DB_USER, DB_PASS);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $method = $_SERVER['REQUEST_METHOD'];

    if ($method === 'GET') {
        // listar notificaciones; si hay usuario en sesión, filtrar por docente
        $docente_id = $_SESSION['user_id'] ?? null;

        if ($docente_id) {
            $sql = "SELECT * FROM Notificaciones WHERE (Destinatario_tipo = 'DOCENTE' AND Destinatario_id = ?) OR Destinatario_tipo = 'TODOS' ORDER BY Fecha_creacion DESC";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([$docente_id]);
        } else {
            $stmt = $pdo->query("SELECT * FROM Notificaciones ORDER BY Fecha_creacion DESC");
        }

        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
        respond(200, ['success' => true, 'notifications' => $rows]);

    } elseif ($method === 'POST') {
        // crear nueva notificación (espera JSON o form-data)
        $input = get_json_input();
        if (!is_array($input)) {
            $input = $_POST;
        }

        $title = trim($input['title'] ?? $input['Titulo'] ?? '');
        $message = trim($input['message'] ?? $input['Mensaje'] ?? '');
        $type = strtoupper(trim($input['type'] ?? $input['Tipo'] ?? 'INFO'));
        $dest_type = strtoupper(trim($input['destinatario_tipo'] ?? $input['Destinatario_tipo'] ?? 'TODOS'));
        $dest_id = isset($input['destinatario_id']) ? (int)$input['destinatario_id'] : (isset($input['Destinatario_id']) ? (int)$input['Destinatario_id'] : null);

        // validaciones básicas
        if (empty($title) || empty($message)) {
            respond(400, ['success' => false, 'message' => 'Titulo y mensaje son requeridos.']);
        }

        $allowedTypes = ['INFO','WARNING','ERROR','SUCCESS'];
        if (!in_array($type, $allowedTypes)) $type = 'INFO';

        $allowedDest = ['DOCENTE','ESTUDIANTE','TODOS'];
        if (!in_array($dest_type, $allowedDest)) $dest_type = 'TODOS';

        $sql = "INSERT INTO Notificaciones (Titulo, Mensaje, Tipo, Destinatario_tipo, Destinatario_id) VALUES (?, ?, ?, ?, ?)";
        $stmt = $pdo->prepare($sql);
        $ok = $stmt->execute([$title, $message, $type, $dest_type, $dest_id]);

        if ($ok) {
            $id = $pdo->lastInsertId();
            respond(201, ['success' => true, 'message' => 'Notificación creada.', 'id' => (int)$id]);
        } else {
            respond(500, ['success' => false, 'message' => 'No se pudo crear la notificación.']);
        }

    } elseif ($method === 'PATCH' || $method === 'PUT') {
        // actualizar estado / marcar leída
        $input = get_json_input();
        if (!is_array($input)) respond(400, ['success' => false, 'message' => 'Payload inválido (JSON).']);

        $id = isset($input['id']) ? (int)$input['id'] : null;
        $action = $input['action'] ?? null; // 'mark_read', 'mark_unread', 'archive'

        if (!$id || !$action) respond(400, ['success' => false, 'message' => 'Se requiere id y action.']);

        if ($action === 'mark_read') {
            $sql = "UPDATE Notificaciones SET Estado = 'LEIDA', Fecha_leida = CURRENT_TIMESTAMP WHERE ID_notificacion = ?";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([$id]);
            respond(200, ['success' => true, 'message' => 'Notificación marcada como leída.']);

        } elseif ($action === 'mark_unread') {
            $sql = "UPDATE Notificaciones SET Estado = 'NO_LEIDA', Fecha_leida = NULL WHERE ID_notificacion = ?";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([$id]);
            respond(200, ['success' => true, 'message' => 'Notificación marcada como no leída.']);

        } elseif ($action === 'archive') {
            $sql = "UPDATE Notificaciones SET Estado = 'ARCHIVADA' WHERE ID_notificacion = ?";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([$id]);
            respond(200, ['success' => true, 'message' => 'Notificación archivada.']);

        } else {
            respond(400, ['success' => false, 'message' => 'Action desconocida.']);
        }

    } elseif ($method === 'DELETE') {
        // eliminar notificación (espera JSON con id)
        $input = get_json_input();
        if (!is_array($input)) respond(400, ['success' => false, 'message' => 'Payload inválido (JSON).']);

        $id = isset($input['id']) ? (int)$input['id'] : null;
        if (!$id) respond(400, ['success' => false, 'message' => 'Se requiere id para eliminar.']);

        $stmt = $pdo->prepare("DELETE FROM Notificaciones WHERE ID_notificacion = ?");
        $stmt->execute([$id]);
        respond(200, ['success' => true, 'message' => 'Notificación eliminada.']);

    } else {
        respond(405, ['success' => false, 'message' => 'Método no permitido.']);
    }

} catch (PDOException $e) {
    error_log('notifications api db error: ' . $e->getMessage());
    respond(500, ['success' => false, 'message' => 'Error interno de la base de datos.']);
} catch (Exception $e) {
    error_log('notifications api error: ' . $e->getMessage());
    respond(500, ['success' => false, 'message' => 'Error interno.']);
}

?>
