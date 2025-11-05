<?php
/**
 * API para gestión de Cursos
 * Permite crear, leer, actualizar y eliminar cursos/divisiones
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

require_once '../config/database.php';

// Manejar preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

function columnExists($db, $table, $column) {
    try {
        $stmt = $db->prepare("SELECT COUNT(*) as count FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?");
        $stmt->execute([$table, $column]);
        $result = $stmt->fetch();
        return $result && $result['count'] > 0;
    } catch (Exception $e) {
        return false;
    }
}

function tableExists($db, $table) {
    try {
        $stmt = $db->prepare("SELECT COUNT(*) as count FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?");
        $stmt->execute([$table]);
        $result = $stmt->fetch();
        return $result && $result['count'] > 0;
    } catch (Exception $e) {
        return false;
    }
}

$method = $_SERVER['REQUEST_METHOD'];
$id = isset($_GET['id']) ? (int)$_GET['id'] : null;

try {
    $db = new PDO(
        "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET,
        DB_USER,
        DB_PASS
    );
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $db->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
    
    switch ($method) {
        case 'GET':
            // Obtener ID del docente desde la sesión o token
            $userIdString = isset($_GET['userId']) ? $_GET['userId'] : null;
            if (!$userIdString) {
                // Intentar obtener del header Authorization
                $headers = getallheaders();
                if (isset($headers['Authorization'])) {
                    // Aquí podrías decodificar un token JWT si lo usas
                }
            }
            
            $teacherId = $userIdString ? (int)$userIdString : null;
            
            if ($id) {
                // Obtener un curso específico
                $stmt = $db->prepare("
                    SELECT ID_curso, Curso_division, Numero_curso, Division, Institucion,
                           Usuarios_docente_ID_docente, Estado, 
                           Fecha_creacion, Fecha_actualizacion
                    FROM Curso 
                    WHERE ID_curso = ?
                ");
                $stmt->execute([$id]);
                $curso = $stmt->fetch(PDO::FETCH_ASSOC);
                
                if (!$curso) {
                    http_response_code(404);
                    echo json_encode(['success' => false, 'message' => 'Curso no encontrado']);
                    exit;
                }
                
                echo json_encode(['success' => true, 'data' => $curso]);
            } else {
                // Obtener todos los cursos del docente
                if (!$teacherId) {
                    http_response_code(400);
                    echo json_encode(['success' => false, 'message' => 'ID de docente requerido']);
                    exit;
                }
                
                $estado = isset($_GET['estado']) ? $_GET['estado'] : null;
                
                $sql = "SELECT ID_curso, Curso_division, Numero_curso, Division, Institucion,
                               Usuarios_docente_ID_docente, Estado, 
                               Fecha_creacion, Fecha_actualizacion
                        FROM Curso 
                        WHERE Usuarios_docente_ID_docente = ?";
                $params = [$teacherId];
                
                if ($estado) {
                    $sql .= " AND Estado = ?";
                    $params[] = $estado;
                }
                
                $sql .= " ORDER BY Numero_curso, Division";
                
                $stmt = $db->prepare($sql);
                $stmt->execute($params);
                $cursos = $stmt->fetchAll(PDO::FETCH_ASSOC);
                
                echo json_encode(['success' => true, 'data' => $cursos]);
            }
            break;
            
        case 'POST':
            // Crear nuevo curso
            $body = json_decode(file_get_contents('php://input'), true);
            
            if (!$body) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Datos inválidos']);
                exit;
            }
            
            $teacherId = isset($body['Usuarios_docente_ID_docente']) ? (int)$body['Usuarios_docente_ID_docente'] : null;
            $numeroCurso = isset($body['Numero_curso']) ? (int)$body['Numero_curso'] : null;
            $division = isset($body['Division']) ? strtoupper(trim($body['Division'])) : null;
            $institucion = isset($body['Institucion']) ? trim($body['Institucion']) : null;
            
            if (!$teacherId || !$numeroCurso || !$division || !$institucion) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Faltan datos requeridos: Usuarios_docente_ID_docente, Numero_curso, Division, Institucion']);
                exit;
            }
            
            // Verificar que el docente existe en la base de datos
            $checkDocente = $db->prepare("SELECT ID_docente FROM Usuarios_docente WHERE ID_docente = ? AND Estado = 'ACTIVO'");
            $checkDocente->execute([$teacherId]);
            if (!$checkDocente->fetch()) {
                http_response_code(404);
                echo json_encode(['success' => false, 'message' => 'El docente especificado no existe o no está activo. Por favor, inicia sesión nuevamente.']);
                exit;
            }
            
            // Validar número de curso (1-7)
            if ($numeroCurso < 1 || $numeroCurso > 7) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'El número de curso debe estar entre 1 y 7']);
                exit;
            }
            
            // Validar división (A-F)
            if (!preg_match('/^[A-F]$/', $division)) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'La división debe ser una letra entre A y F']);
                exit;
            }
            
            // Construir Curso_division
            $cursoDivision = "{$numeroCurso}º Curso - División {$division}";

            // Verificar si la columna Escuela_ID existe
            $hasEscuelaId = columnExists($db, 'Curso', 'Escuela_ID');
            $hasEscuelaTable = tableExists($db, 'Escuela');
            
            // Gestión de la Escuela (solo si la tabla y columna existen)
            $escuelaId = null;
            if ($hasEscuelaId && $hasEscuelaTable && !empty($institucion)) {
                // Verificar si la escuela ya existe
                $escuelaStmt = $db->prepare("SELECT ID_escuela FROM Escuela WHERE Nombre = ?");
                $escuelaStmt->execute([$institucion]);
                $escuela = $escuelaStmt->fetch();

                if ($escuela) {
                    $escuelaId = $escuela['ID_escuela'];
                } else {
                    // Si no existe, crearla
                    $insertEscuelaStmt = $db->prepare("INSERT INTO Escuela (Nombre) VALUES (?)");
                    $insertEscuelaStmt->execute([$institucion]);
                    $escuelaId = $db->lastInsertId();
                }
            }
            
            // Verificar si ya existe (mismo curso, misma institución, mismo docente)
            $checkStmt = $db->prepare("
                SELECT ID_curso 
                FROM Curso 
                WHERE Curso_division = ? AND Institucion = ? AND Usuarios_docente_ID_docente = ?
            ");
            $checkStmt->execute([$cursoDivision, $institucion, $teacherId]);
            
            if ($checkStmt->fetch()) {
                http_response_code(409);
                echo json_encode([
                    'success' => false,
                    'message' => "Ya existe un curso '{$cursoDivision}' en la institución '{$institucion}' para este docente",
                    'error' => 'DUPLICATE_COURSE'
                ]);
                exit;
            }
            
            $estado = isset($body['Estado']) ? $body['Estado'] : 'ACTIVO';
            
            if ($hasEscuelaId) {
                $stmt = $db->prepare("
                    INSERT INTO Curso (Curso_division, Numero_curso, Division, Institucion, Escuela_ID, Usuarios_docente_ID_docente, Estado)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                ");
                $stmt->execute([$cursoDivision, $numeroCurso, $division, $institucion, $escuelaId, $teacherId, $estado]);
            } else {
                $stmt = $db->prepare("
                    INSERT INTO Curso (Curso_division, Numero_curso, Division, Institucion, Usuarios_docente_ID_docente, Estado)
                    VALUES (?, ?, ?, ?, ?, ?)
                ");
                $stmt->execute([$cursoDivision, $numeroCurso, $division, $institucion, $teacherId, $estado]);
            }
            
            $newId = (int)$db->lastInsertId();
            
            http_response_code(201);
            echo json_encode(['success' => true, 'id' => $newId, 'message' => 'Curso creado exitosamente']);
            break;
            
        case 'PUT':
            // Actualizar curso
            if (!$id) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'ID de curso requerido']);
                exit;
            }
            
            $body = json_decode(file_get_contents('php://input'), true);
            
            if (!$body) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Datos inválidos']);
                exit;
            }
            
            // Verificar que el curso existe y pertenece al docente
            $checkStmt = $db->prepare("SELECT Usuarios_docente_ID_docente FROM Curso WHERE ID_curso = ?");
            $checkStmt->execute([$id]);
            $curso = $checkStmt->fetch();
            
            if (!$curso) {
                http_response_code(404);
                echo json_encode(['success' => false, 'message' => 'Curso no encontrado']);
                exit;
            }
            
            $teacherId = isset($body['Usuarios_docente_ID_docente']) ? (int)$body['Usuarios_docente_ID_docente'] : $curso['Usuarios_docente_ID_docente'];
            
            // Verificar que el docente tiene permisos
            if ($curso['Usuarios_docente_ID_docente'] != $teacherId) {
                http_response_code(403);
                echo json_encode(['success' => false, 'message' => 'No tienes permisos para modificar este curso']);
                exit;
            }
            
            $updates = [];
            $params = [];
            
            if (isset($body['Numero_curso'])) {
                $numeroCurso = (int)$body['Numero_curso'];
                if ($numeroCurso >= 1 && $numeroCurso <= 7) {
                    $updates[] = "Numero_curso = ?";
                    $params[] = $numeroCurso;
                }
            }
            
            if (isset($body['Division'])) {
                $division = strtoupper(trim($body['Division']));
                if (preg_match('/^[A-F]$/', $division)) {
                    $updates[] = "Division = ?";
                    $params[] = $division;
                }
            }
            
            if (isset($body['Institucion'])) {
                $institucion = trim($body['Institucion']);
                if (!empty($institucion)) {
                    $updates[] = "Institucion = ?";
                    $params[] = $institucion;
                }
            }
            
            if (isset($body['Estado'])) {
                $estado = $body['Estado'];
                if (in_array($estado, ['ACTIVO', 'INACTIVO'])) {
                    $updates[] = "Estado = ?";
                    $params[] = $estado;
                }
            }
            
            if (empty($updates)) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'No hay campos válidos para actualizar']);
                exit;
            }
            
            // Recalcular Curso_division si cambió número o división
            if (isset($body['Numero_curso']) || isset($body['Division'])) {
                $getStmt = $db->prepare("SELECT Numero_curso, Division, Institucion FROM Curso WHERE ID_curso = ?");
                $getStmt->execute([$id]);
                $current = $getStmt->fetch();
                
                $newNumero = isset($body['Numero_curso']) ? (int)$body['Numero_curso'] : (int)$current['Numero_curso'];
                $newDivision = isset($body['Division']) ? strtoupper(trim($body['Division'])) : $current['Division'];
                $newInstitucion = isset($body['Institucion']) ? trim($body['Institucion']) : $current['Institucion'];
                $newCursoDivision = "{$newNumero}º Curso - División {$newDivision}";
                
                // Verificar duplicado (mismo curso, misma institución, mismo docente)
                $dupStmt = $db->prepare("
                    SELECT ID_curso FROM Curso 
                    WHERE Curso_division = ? AND Institucion = ? AND Usuarios_docente_ID_docente = ? AND ID_curso != ?
                ");
                $dupStmt->execute([$newCursoDivision, $newInstitucion, $teacherId, $id]);
                
                if ($dupStmt->fetch()) {
                    http_response_code(409);
                    echo json_encode(['success' => false, 'message' => 'Ya existe otro curso con este nombre']);
                    exit;
                }
                
                $updates[] = "Curso_division = ?";
                $params[] = $newCursoDivision;
            }
            
            $updates[] = "Fecha_actualizacion = CURRENT_TIMESTAMP";
            $params[] = $id;
            
            $sql = "UPDATE Curso SET " . implode(', ', $updates) . " WHERE ID_curso = ?";
            $stmt = $db->prepare($sql);
            $stmt->execute($params);
            
            echo json_encode(['success' => true, 'message' => 'Curso actualizado exitosamente']);
            break;
            
        case 'DELETE':
            // Eliminar curso
            if (!$id) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'ID de curso requerido']);
                exit;
            }
            
            $teacherId = isset($_GET['userId']) ? (int)$_GET['userId'] : null;
            
            if (!$teacherId) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'ID de docente requerido']);
                exit;
            }
            
            // Verificar que el curso existe y pertenece al docente
            $checkStmt = $db->prepare("SELECT Usuarios_docente_ID_docente FROM Curso WHERE ID_curso = ?");
            $checkStmt->execute([$id]);
            $curso = $checkStmt->fetch();
            
            if (!$curso) {
                http_response_code(404);
                echo json_encode(['success' => false, 'message' => 'Curso no encontrado']);
                exit;
            }
            
            if ($curso['Usuarios_docente_ID_docente'] != $teacherId) {
                http_response_code(403);
                echo json_encode(['success' => false, 'message' => 'No tienes permisos para eliminar este curso']);
                exit;
            }
            
            // Verificar si hay materias asociadas
            $materiasStmt = $db->prepare("
                SELECT COUNT(*) as count 
                FROM Materia 
                WHERE Curso_division = (SELECT Curso_division FROM Curso WHERE ID_curso = ?)
                  AND Usuarios_docente_ID_docente = ?
            ");
            $materiasStmt->execute([$id, $teacherId]);
            $materias = $materiasStmt->fetch();
            
            if ($materias['count'] > 0) {
                http_response_code(409);
                echo json_encode([
                    'success' => false,
                    'message' => "No se puede eliminar el curso porque tiene {$materias['count']} materia(s) asociada(s). Elimina primero las materias.",
                    'error' => 'HAS_SUBJECTS'
                ]);
                exit;
            }
            
            $stmt = $db->prepare("DELETE FROM Curso WHERE ID_curso = ?");
            $stmt->execute([$id]);
            
            echo json_encode(['success' => true, 'message' => 'Curso eliminado exitosamente']);
            break;
            
        default:
            http_response_code(405);
            echo json_encode(['success' => false, 'message' => 'Método no permitido']);
            break;
    }
    
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Error de base de datos: ' . $e->getMessage()]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
}

