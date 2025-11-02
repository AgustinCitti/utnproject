<?php
/**
 * EduSync - API CRUD para Estudiantes
 * Maneja operaciones: GET, POST, PUT, DELETE
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Manejar preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Incluir configuración de base de datos
require_once __DIR__ . '/../config/database.php';

// Iniciar sesión
session_start();

// Obtener ID del docente logueado (si existe)
$docente_id = $_SESSION['user_id'] ?? null;

// Obtener método HTTP
$method = $_SERVER['REQUEST_METHOD'];

// Obtener el ID de la URL si existe
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$uriSegments = explode('/', trim($uri, '/'));
$id = isset($uriSegments[2]) && is_numeric($uriSegments[2]) ? (int)$uriSegments[2] : null;
// Fallback: aceptar ?id= en query string para compatibilidad
if (!$id && isset($_GET['id']) && is_numeric($_GET['id'])) {
    $id = (int)$_GET['id'];
}

try {
    // Crear conexión PDO
    $pdo = new PDO(
        "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET,
        DB_USER,
        DB_PASS
    );
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // ============================================
    // GET - Obtener estudiantes
    // ============================================
    if ($method === 'GET') {
        if ($id) {
            // Obtener un estudiante específico
            $stmt = $pdo->prepare("SELECT * FROM Estudiante WHERE ID_Estudiante = ?");
            $stmt->execute([$id]);
            $estudiante = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if ($estudiante) {
                http_response_code(200);
                echo json_encode($estudiante, JSON_UNESCAPED_UNICODE);
            } else {
                http_response_code(404);
                echo json_encode([
                    'success' => false,
                    'message' => 'Estudiante no encontrado.'
                ]);
            }
        } else {
            // Obtener todos los estudiantes (opcional: filtrar por estado)
            // Si hay docente logueado, filtrar solo estudiantes de sus materias
            $estado = $_GET['estado'] ?? null;
            
            if ($docente_id) {
                // Filtrar por docente y opcionalmente por estado
                if ($estado) {
                    $stmt = $pdo->prepare("
                        SELECT DISTINCT e.* FROM Estudiante e
                        INNER JOIN Alumnos_X_Materia axm ON e.ID_Estudiante = axm.Estudiante_ID_Estudiante
                        INNER JOIN Materia m ON axm.Materia_ID_materia = m.ID_materia
                        WHERE m.Usuarios_docente_ID_docente = ? AND e.Estado = ?
                        ORDER BY e.Apellido, e.Nombre
                    ");
                    $stmt->execute([$docente_id, $estado]);
                } else {
                    $stmt = $pdo->prepare("
                        SELECT DISTINCT e.* FROM Estudiante e
                        INNER JOIN Alumnos_X_Materia axm ON e.ID_Estudiante = axm.Estudiante_ID_Estudiante
                        INNER JOIN Materia m ON axm.Materia_ID_materia = m.ID_materia
                        WHERE m.Usuarios_docente_ID_docente = ?
                        ORDER BY e.Apellido, e.Nombre
                    ");
                    $stmt->execute([$docente_id]);
                }
            } else {
                // Sin docente logueado, mostrar todos (para admin)
                if ($estado) {
                    $stmt = $pdo->prepare("SELECT * FROM Estudiante WHERE Estado = ? ORDER BY Apellido, Nombre");
                    $stmt->execute([$estado]);
                } else {
                    $stmt = $pdo->query("SELECT * FROM Estudiante ORDER BY Apellido, Nombre");
                }
            }
            
            $estudiantes = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            http_response_code(200);
            echo json_encode($estudiantes, JSON_UNESCAPED_UNICODE);
        }
    }

    // ============================================
    // POST - Crear nuevo estudiante
    // ============================================
    elseif ($method === 'POST') {
        $data = json_decode(file_get_contents('php://input'), true);
        
        // Validar campos obligatorios
        if (empty($data['Nombre']) || empty($data['Apellido'])) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'El nombre y apellido son obligatorios.'
            ]);
            exit;
        }

        // Validar email si se proporciona
        if (!empty($data['Email']) && !filter_var($data['Email'], FILTER_VALIDATE_EMAIL)) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'El formato del email no es válido.'
            ]);
            exit;
        }

        // Verificar si el email ya existe
        if (!empty($data['Email'])) {
            $stmt = $pdo->prepare("SELECT ID_Estudiante FROM Estudiante WHERE Email = ?");
            $stmt->execute([$data['Email']]);
            if ($stmt->fetch()) {
                http_response_code(409);
                echo json_encode([
                    'success' => false,
                    'message' => 'El email ya está registrado.'
                ]);
                exit;
            }
        }

        // Insertar nuevo estudiante
        $sql = "INSERT INTO Estudiante (Apellido, Nombre, Email, Fecha_nacimiento, Estado) 
                VALUES (?, ?, ?, ?, ?)";
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            
            $data['Apellido'],
            $data['Nombre'],
            $data['Email'] ?? null,
            $data['Fecha_nacimiento'] ?? null,
            $data['Estado'] ?? 'ACTIVO'
        ]);

        $estudianteId = $pdo->lastInsertId();

        // Obtener el estudiante creado
        $stmt = $pdo->prepare("SELECT * FROM Estudiante WHERE ID_Estudiante = ?");
        $stmt->execute([$estudianteId]);
        $estudiante = $stmt->fetch(PDO::FETCH_ASSOC);

        http_response_code(201);
        echo json_encode([
            'success' => true,
            'message' => 'Estudiante creado exitosamente.',
            'data' => $estudiante
        ], JSON_UNESCAPED_UNICODE);
    }

    // ============================================
    // PUT - Actualizar estudiante existente
    // ============================================
    elseif ($method === 'PUT') {
        if (!$id) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'ID de estudiante es requerido.'
            ]);
            exit;
        }

        $data = json_decode(file_get_contents('php://input'), true);

        // Verificar que el estudiante existe
        $stmt = $pdo->prepare("SELECT * FROM Estudiante WHERE ID_Estudiante = ?");
        $stmt->execute([$id]);
        $estudianteExistente = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$estudianteExistente) {
            http_response_code(404);
            echo json_encode([
                'success' => false,
                'message' => 'Estudiante no encontrado.'
            ]);
            exit;
        }

        // Validar email si se proporciona
        if (!empty($data['Email']) && !filter_var($data['Email'], FILTER_VALIDATE_EMAIL)) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'El formato del email no es válido.'
            ]);
            exit;
        }

        // Verificar si el email ya existe en otro estudiante
        if (!empty($data['Email']) && $data['Email'] !== $estudianteExistente['Email']) {
            $stmt = $pdo->prepare("SELECT ID_Estudiante FROM Estudiante WHERE Email = ? AND ID_Estudiante != ?");
            $stmt->execute([$data['Email'], $id]);
            if ($stmt->fetch()) {
                http_response_code(409);
                echo json_encode([
                    'success' => false,
                    'message' => 'El email ya está registrado por otro estudiante.'
                ]);
                exit;
            }
        }

        // Actualizar solo los campos proporcionados
        $camposPermitidos = ['Nombre', 'Apellido', 'Email', 'Fecha_nacimiento', 'Estado'];
        $updates = [];
        $valores = [];

        foreach ($camposPermitidos as $campo) {
            if (isset($data[$campo])) {
                $updates[] = "$campo = ?";
                $valores[] = $data[$campo];
            }
        }

        if (empty($updates)) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'No hay campos para actualizar.'
            ]);
            exit;
        }

        $valores[] = $id;
        $sql = "UPDATE Estudiante SET " . implode(', ', $updates) . " WHERE ID_Estudiante = ?";
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute($valores);

        // Obtener el estudiante actualizado
        $stmt = $pdo->prepare("SELECT * FROM Estudiante WHERE ID_Estudiante = ?");
        $stmt->execute([$id]);
        $estudiante = $stmt->fetch(PDO::FETCH_ASSOC);

        http_response_code(200);
        echo json_encode([
            'success' => true,
            'message' => 'Estudiante actualizado exitosamente.',
            'data' => $estudiante
        ], JSON_UNESCAPED_UNICODE);
    }

    // ============================================
    // DELETE - Eliminar estudiante
    // ============================================
    elseif ($method === 'DELETE') {
        if (!$id) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'ID de estudiante es requerido.'
            ]);
            exit;
        }

        // Verificar que el estudiante existe
        $stmt = $pdo->prepare("SELECT * FROM Estudiante WHERE ID_Estudiante = ?");
        $stmt->execute([$id]);
        $estudiante = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$estudiante) {
            http_response_code(404);
            echo json_encode([
                'success' => false,
                'message' => 'Estudiante no encontrado.'
            ]);
            exit;
        }

        // Verificar si tiene registros relacionados
        $stmt = $pdo->prepare("SELECT COUNT(*) as total FROM Alumnos_X_Materia WHERE Estudiante_ID_Estudiante = ?");
        $stmt->execute([$id]);
        $tieneMaterias = $stmt->fetch(PDO::FETCH_ASSOC)['total'] > 0;

        if ($tieneMaterias) {
            // En lugar de eliminar, cambiar estado a INACTIVO
            $stmt = $pdo->prepare("UPDATE Estudiante SET Estado = 'INACTIVO' WHERE ID_Estudiante = ?");
            $stmt->execute([$id]);
            
            http_response_code(200);
            echo json_encode([
                'success' => true,
                'message' => 'Estudiante marcado como inactivo (tiene materias relacionadas).'
            ]);
        } else {
            // Eliminar completamente
            $stmt = $pdo->prepare("DELETE FROM Estudiante WHERE ID_Estudiante = ?");
            $stmt->execute([$id]);
            
            http_response_code(200);
            echo json_encode([
                'success' => true,
                'message' => 'Estudiante eliminado exitosamente.'
            ]);
        }
    }

    else {
        http_response_code(405);
        echo json_encode([
            'success' => false,
            'message' => 'Método no permitido.'
        ]);
    }

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error en la base de datos.',
        'error' => $e->getMessage()
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error inesperado.',
        'error' => $e->getMessage()
    ]);
}
?>