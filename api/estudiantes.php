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
            
            // Verificar si la columna INTENSIFICA existe
            try {
                $stmtCheck = $pdo->query("SHOW COLUMNS FROM Estudiante LIKE 'INTENSIFICA'");
                $hasIntensificaColumn = $stmtCheck->rowCount() > 0;
            } catch (Exception $e) {
                $hasIntensificaColumn = false;
            }
            
            if ($docente_id) {
                // Filtrar por docente y opcionalmente por estado
                if ($estado) {
                    if ($hasIntensificaColumn) {
                        $stmt = $pdo->prepare("
                            SELECT DISTINCT e.* FROM Estudiante e
                            INNER JOIN Alumnos_X_Materia axm ON e.ID_Estudiante = axm.Estudiante_ID_Estudiante
                            INNER JOIN Materia m ON axm.Materia_ID_materia = m.ID_materia
                            WHERE m.Usuarios_docente_ID_docente = ? 
                              AND e.Estado = ?
                              AND (
                                  e.Estado != 'INACTIVO' 
                                  OR e.INTENSIFICA = TRUE
                              )
                            ORDER BY e.Apellido, e.Nombre
                        ");
                    } else {
                        $stmt = $pdo->prepare("
                            SELECT DISTINCT e.* FROM Estudiante e
                            INNER JOIN Alumnos_X_Materia axm ON e.ID_Estudiante = axm.Estudiante_ID_Estudiante
                            INNER JOIN Materia m ON axm.Materia_ID_materia = m.ID_materia
                            LEFT JOIN Tema_estudiante te ON e.ID_Estudiante = te.Estudiante_ID_Estudiante
                            WHERE m.Usuarios_docente_ID_docente = ? 
                              AND e.Estado = ?
                              AND (
                                  e.Estado != 'INACTIVO' 
                                  OR (e.Estado = 'INACTIVO' AND te.ID_Tema_estudiante IS NOT NULL)
                              )
                            ORDER BY e.Apellido, e.Nombre
                        ");
                    }
                    $stmt->execute([$docente_id, $estado]);
                } else {
                    if ($hasIntensificaColumn) {
                        $stmt = $pdo->prepare("
                            SELECT DISTINCT e.* FROM Estudiante e
                            INNER JOIN Alumnos_X_Materia axm ON e.ID_Estudiante = axm.Estudiante_ID_Estudiante
                            INNER JOIN Materia m ON axm.Materia_ID_materia = m.ID_materia
                            WHERE m.Usuarios_docente_ID_docente = ?
                              AND (
                                  e.Estado != 'INACTIVO' 
                                  OR e.INTENSIFICA = TRUE
                              )
                            ORDER BY e.Apellido, e.Nombre
                        ");
                    } else {
                        $stmt = $pdo->prepare("
                            SELECT DISTINCT e.* FROM Estudiante e
                            INNER JOIN Alumnos_X_Materia axm ON e.ID_Estudiante = axm.Estudiante_ID_Estudiante
                            INNER JOIN Materia m ON axm.Materia_ID_materia = m.ID_materia
                            LEFT JOIN Tema_estudiante te ON e.ID_Estudiante = te.Estudiante_ID_Estudiante
                            WHERE m.Usuarios_docente_ID_docente = ?
                              AND (
                                  e.Estado != 'INACTIVO' 
                                  OR (e.Estado = 'INACTIVO' AND te.ID_Tema_estudiante IS NOT NULL)
                              )
                            ORDER BY e.Apellido, e.Nombre
                        ");
                    }
                    $stmt->execute([$docente_id]);
                }
            } else {
                // Sin docente logueado: excluir INACTIVO sin temas (no intensificadores)
                if ($estado) {
                    if ($hasIntensificaColumn) {
                        $stmt = $pdo->prepare("
                            SELECT DISTINCT e.* FROM Estudiante e
                            WHERE e.Estado = ?
                              AND (
                                  e.Estado != 'INACTIVO' 
                                  OR e.INTENSIFICA = TRUE
                              )
                            ORDER BY e.Apellido, e.Nombre
                        ");
                    } else {
                        $stmt = $pdo->prepare("
                            SELECT DISTINCT e.* FROM Estudiante e
                            LEFT JOIN Tema_estudiante te ON e.ID_Estudiante = te.Estudiante_ID_Estudiante
                            WHERE e.Estado = ?
                              AND (
                                  e.Estado != 'INACTIVO' 
                                  OR (e.Estado = 'INACTIVO' AND te.ID_Tema_estudiante IS NOT NULL)
                              )
                            ORDER BY e.Apellido, e.Nombre
                        ");
                    }
                    $stmt->execute([$estado]);
                } else {
                    if ($hasIntensificaColumn) {
                        $stmt = $pdo->query("
                            SELECT DISTINCT e.* FROM Estudiante e
                            WHERE e.Estado != 'INACTIVO' 
                               OR e.INTENSIFICA = TRUE
                            ORDER BY e.Apellido, e.Nombre
                        ");
                    } else {
                        $stmt = $pdo->query("
                            SELECT DISTINCT e.* FROM Estudiante e
                            LEFT JOIN Tema_estudiante te ON e.ID_Estudiante = te.Estudiante_ID_Estudiante
                            WHERE e.Estado != 'INACTIVO' 
                               OR (e.Estado = 'INACTIVO' AND te.ID_Tema_estudiante IS NOT NULL)
                            ORDER BY e.Apellido, e.Nombre
                        ");
                    }
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
        // Verificar si la columna INTENSIFICA existe
        try {
            $stmtCheck = $pdo->query("SHOW COLUMNS FROM Estudiante LIKE 'INTENSIFICA'");
            $hasIntensificaColumn = $stmtCheck->rowCount() > 0;
        } catch (Exception $e) {
            $hasIntensificaColumn = false;
        }
        
        // Si es INTENSIFICA, marcar la columna INTENSIFICA=TRUE y Estado='ACTIVO'
        // ACTIVO e INACTIVO se guardan directamente con INTENSIFICA=FALSE
        $estadoInput = $data['Estado'] ?? null;
        $esIntensifica = ($estadoInput === 'INTENSIFICA');
        $estadoParaBD = $esIntensifica ? 'ACTIVO' : ($estadoInput ?? 'ACTIVO');
        
        if ($hasIntensificaColumn) {
            $sql = "INSERT INTO Estudiante (Apellido, Nombre, Email, Fecha_nacimiento, Estado, INTENSIFICA) 
                    VALUES (?, ?, ?, ?, ?, ?)";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([
                $data['Apellido'],
                $data['Nombre'],
                $data['Email'] ?? null,
                $data['Fecha_nacimiento'] ?? null,
                $estadoParaBD,
                $esIntensifica ? 1 : 0  // BOOLEAN en MySQL: 1 = TRUE, 0 = FALSE
            ]);
        } else {
            // Fallback: usar lógica anterior (guardar como INACTIVO si es INTENSIFICA)
            $estadoParaBD = $esIntensifica ? 'INACTIVO' : ($estadoInput ?? 'ACTIVO');
            $sql = "INSERT INTO Estudiante (Apellido, Nombre, Email, Fecha_nacimiento, Estado) 
                    VALUES (?, ?, ?, ?, ?)";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([
                $data['Apellido'],
                $data['Nombre'],
                $data['Email'] ?? null,
                $data['Fecha_nacimiento'] ?? null,
                $estadoParaBD
            ]);
        }

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

        // Verificar si la columna INTENSIFICA existe
        try {
            $stmtCheck = $pdo->query("SHOW COLUMNS FROM Estudiante LIKE 'INTENSIFICA'");
            $hasIntensificaColumn = $stmtCheck->rowCount() > 0;
        } catch (Exception $e) {
            $hasIntensificaColumn = false;
        }
        
        // Actualizar solo los campos proporcionados
        $camposPermitidos = ['Nombre', 'Apellido', 'Email', 'Fecha_nacimiento', 'Estado'];
        $updates = [];
        $valores = [];
        $intensificaValue = null;

        foreach ($camposPermitidos as $campo) {
            if (isset($data[$campo])) {
                if ($campo === 'Estado') {
                    // Si es INTENSIFICA, marcar INTENSIFICA=TRUE y Estado='ACTIVO'
                    // ACTIVO e INACTIVO se guardan directamente con INTENSIFICA=FALSE
                    $estadoInput = $data[$campo];
                    $esIntensifica = ($estadoInput === 'INTENSIFICA');
                    
                    if ($hasIntensificaColumn) {
                        $estadoValor = $esIntensifica ? 'ACTIVO' : $estadoInput;
                        $intensificaValue = $esIntensifica ? 1 : 0;  // BOOLEAN en MySQL
                    } else {
                        // Fallback: usar lógica anterior
                        $estadoValor = $esIntensifica ? 'INACTIVO' : $estadoInput;
                    }
                    
                    $updates[] = "$campo = ?";
                    $valores[] = $estadoValor;
                } else {
                    $updates[] = "$campo = ?";
                    $valores[] = $data[$campo];
                }
            }
        }
        
        // Si se actualizó el estado a INTENSIFICA o desde INTENSIFICA, actualizar la columna INTENSIFICA
        if ($intensificaValue !== null && $hasIntensificaColumn) {
            $updates[] = "INTENSIFICA = ?";
            $valores[] = $intensificaValue;
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

        // Verificar que el estudiante existe y pertenece al docente actual
        if ($docente_id) {
            // Verificar que el estudiante está asociado a alguna materia del docente
            $stmt = $pdo->prepare("
                SELECT e.* FROM Estudiante e
                INNER JOIN Alumnos_X_Materia axm ON e.ID_Estudiante = axm.Estudiante_ID_Estudiante
                INNER JOIN Materia m ON axm.Materia_ID_materia = m.ID_materia
                WHERE e.ID_Estudiante = ? AND m.Usuarios_docente_ID_docente = ?
                LIMIT 1
            ");
            $stmt->execute([$id, $docente_id]);
            $estudiante = $stmt->fetch(PDO::FETCH_ASSOC);
        } else {
            // Si no hay docente logueado, verificar solo existencia (solo para desarrollo)
            $stmt = $pdo->prepare("SELECT * FROM Estudiante WHERE ID_Estudiante = ?");
            $stmt->execute([$id]);
            $estudiante = $stmt->fetch(PDO::FETCH_ASSOC);
        }

        if (!$estudiante) {
            http_response_code(404);
            echo json_encode([
                'success' => false,
                'message' => 'Estudiante no encontrado o no tienes permiso para eliminarlo.'
            ], JSON_UNESCAPED_UNICODE);
            exit;
        }

        // Eliminar todas las relaciones primero, luego eliminar el estudiante
        try {
            // Iniciar transacción para asegurar que todas las eliminaciones se completen
            $pdo->beginTransaction();
            
            // 1. Eliminar temas del estudiante
            $stmt = $pdo->prepare("DELETE FROM Tema_estudiante WHERE Estudiante_ID_Estudiante = ?");
            $stmt->execute([$id]);
            
            // 2. Eliminar notas del estudiante
            $stmt = $pdo->prepare("DELETE FROM Notas WHERE Estudiante_ID_Estudiante = ?");
            $stmt->execute([$id]);
            
            // 3. Eliminar asistencia del estudiante
            $stmt = $pdo->prepare("DELETE FROM Asistencia WHERE Estudiante_ID_Estudiante = ?");
            $stmt->execute([$id]);
            
            // 4. Eliminar relaciones materia-estudiante
            $stmt = $pdo->prepare("DELETE FROM Alumnos_X_Materia WHERE Estudiante_ID_Estudiante = ?");
            $stmt->execute([$id]);
            
            // 5. Finalmente, eliminar el estudiante
            $stmt = $pdo->prepare("DELETE FROM Estudiante WHERE ID_Estudiante = ?");
            $stmt->execute([$id]);
            
            // Confirmar todas las eliminaciones
            $pdo->commit();
            
            http_response_code(200);
            echo json_encode([
                'success' => true,
                'message' => 'Estudiante y todas sus relaciones eliminadas exitosamente.'
            ], JSON_UNESCAPED_UNICODE);
            
        } catch (PDOException $e) {
            // Revertir en caso de error
            $pdo->rollBack();
            error_log("Error al eliminar estudiante y relaciones: " . $e->getMessage());
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Error al eliminar el estudiante: ' . $e->getMessage()
            ], JSON_UNESCAPED_UNICODE);
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