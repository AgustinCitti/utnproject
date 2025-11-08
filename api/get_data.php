<?php


header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');

// Incluir configuración de base de datos
require_once __DIR__ . '/../config/database.php';

// Iniciar sesión para obtener el usuario actual
session_start();

try {
    // Crear conexión PDO
    $pdo = new PDO(
        "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET,
        DB_USER,
        DB_PASS
    );
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Obtener ID del docente logueado (si existe)
    $docente_id = $_SESSION['user_id'] ?? null;

    // 1. OBTENER DOCENTES
    $stmt = $pdo->query("SELECT * FROM Usuarios_docente");
    $usuarios_docente = $stmt->fetchAll(PDO::FETCH_ASSOC);
    // Eliminar contraseñas por seguridad
    foreach ($usuarios_docente as &$docente) {
        unset($docente['Contraseña']);
    }

    // 2. OBTENER ESTUDIANTES
    // Si hay docente logueado, filtrar solo estudiantes de sus materias
    // Verificar si la columna INTENSIFICA existe antes de usarla
    try {
        // Intentar verificar si la columna INTENSIFICA existe
        $stmtCheck = $pdo->query("SHOW COLUMNS FROM Estudiante LIKE 'INTENSIFICA'");
        $hasIntensificaColumn = $stmtCheck->rowCount() > 0;
    } catch (Exception $e) {
        $hasIntensificaColumn = false;
    }
    
    if ($docente_id) {
        if ($hasIntensificaColumn) {
            // Usar la columna INTENSIFICA
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
            // Fallback: usar lógica anterior con temas asignados
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
    } else {
        if ($hasIntensificaColumn) {
            // Usar la columna INTENSIFICA
            $stmt = $pdo->query("
                SELECT DISTINCT e.* FROM Estudiante e
                WHERE e.Estado != 'INACTIVO' 
                   OR e.INTENSIFICA = TRUE
                ORDER BY e.Apellido, e.Nombre
            ");
        } else {
            // Fallback: usar lógica anterior con temas asignados
            $stmt = $pdo->query("
                SELECT DISTINCT e.* FROM Estudiante e
                LEFT JOIN Tema_estudiante te ON e.ID_Estudiante = te.Estudiante_ID_Estudiante
                WHERE e.Estado != 'INACTIVO' 
                   OR (e.Estado = 'INACTIVO' AND te.ID_Tema_estudiante IS NOT NULL)
                ORDER BY e.Apellido, e.Nombre
            ");
        }
    }
    
    try {
        $estudiante = $stmt->fetchAll(PDO::FETCH_ASSOC);
    } catch (PDOException $e) {
        error_log("Error obteniendo estudiantes: " . $e->getMessage());
        // Si falla, intentar query simple sin filtros complejos
        if ($docente_id) {
            try {
                $stmt = $pdo->prepare("
                    SELECT DISTINCT e.* FROM Estudiante e
                    INNER JOIN Alumnos_X_Materia axm ON e.ID_Estudiante = axm.Estudiante_ID_Estudiante
                    INNER JOIN Materia m ON axm.Materia_ID_materia = m.ID_materia
                    WHERE m.Usuarios_docente_ID_docente = ?
                    ORDER BY e.Apellido, e.Nombre
                ");
                $stmt->execute([$docente_id]);
                $estudiante = $stmt->fetchAll(PDO::FETCH_ASSOC);
            } catch (PDOException $e2) {
                error_log("Error en query fallback: " . $e2->getMessage());
                $estudiante = [];
            }
        } else {
            try {
                $stmt = $pdo->query("SELECT * FROM Estudiante ORDER BY Apellido, Nombre");
                $estudiante = $stmt->fetchAll(PDO::FETCH_ASSOC);
            } catch (PDOException $e2) {
                error_log("Error en query fallback: " . $e2->getMessage());
                $estudiante = [];
            }
        }
    }

    // 3. OBTENER MATERIAS
    // Si hay docente logueado, filtrar por sus materias
    if ($docente_id) {
        $stmt = $pdo->prepare("SELECT * FROM Materia WHERE Usuarios_docente_ID_docente = ?");
        $stmt->execute([$docente_id]);
    } else {
        $stmt = $pdo->query("SELECT * FROM Materia");
    }
    $materia = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // 4. OBTENER INSCRIPCIONES (Alumnos_X_Materia)
    // Si hay docente logueado, filtrar solo inscripciones de sus materias
    if ($docente_id) {
        $stmt = $pdo->prepare("
            SELECT axm.* FROM Alumnos_X_Materia axm
            INNER JOIN Materia m ON axm.Materia_ID_materia = m.ID_materia
            WHERE m.Usuarios_docente_ID_docente = ?
            ORDER BY axm.Fecha_inscripcion DESC
        ");
        $stmt->execute([$docente_id]);
    } else {
        $stmt = $pdo->query("SELECT * FROM Alumnos_X_Materia ORDER BY Fecha_inscripcion DESC");
    }
    $alumnos_x_materia = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // 5. OBTENER CONTENIDO
    if ($docente_id) {
        $stmt = $pdo->prepare("
            SELECT c.* FROM Contenido c
            INNER JOIN Materia m ON c.Materia_ID_materia = m.ID_materia
            WHERE m.Usuarios_docente_ID_docente = ?
        ");
        $stmt->execute([$docente_id]);
    } else {
        $stmt = $pdo->query("SELECT * FROM Contenido");
    }
    $contenido = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // 6. OBTENER TEMA_ESTUDIANTE
    // Si hay docente logueado, filtrar solo temas de estudiantes en sus materias
    if ($docente_id) {
        $stmt = $pdo->prepare("
            SELECT te.* FROM Tema_estudiante te
            INNER JOIN Contenido c ON te.Contenido_ID_contenido = c.ID_contenido
            INNER JOIN Materia m ON c.Materia_ID_materia = m.ID_materia
            WHERE m.Usuarios_docente_ID_docente = ?
            ORDER BY te.Fecha_actualizacion DESC, te.ID_Tema_estudiante DESC
        ");
        $stmt->execute([$docente_id]);
    } else {
        $stmt = $pdo->query("SELECT * FROM Tema_estudiante ORDER BY Fecha_actualizacion DESC, ID_Tema_estudiante DESC");
    }
    $tema_estudiante = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // 7. OBTENER EVALUACIONES
    if ($docente_id) {
        $stmt = $pdo->prepare("
            SELECT e.* FROM Evaluacion e
            INNER JOIN Materia m ON e.Materia_ID_materia = m.ID_materia
            WHERE m.Usuarios_docente_ID_docente = ?
        ");
        $stmt->execute([$docente_id]);
    } else {
        $stmt = $pdo->query("SELECT * FROM Evaluacion");
    }
    $evaluacion = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // 8. OBTENER NOTAS
    if ($docente_id) {
        $stmt = $pdo->prepare("
            SELECT n.* FROM Notas n
            INNER JOIN Evaluacion ev ON n.Evaluacion_ID_evaluacion = ev.ID_evaluacion
            INNER JOIN Materia m ON ev.Materia_ID_materia = m.ID_materia
            WHERE m.Usuarios_docente_ID_docente = ?
            ORDER BY n.Fecha_calificacion DESC, n.Fecha_registro DESC, n.ID_Nota DESC
        ");
        $stmt->execute([$docente_id]);
    } else {
        $stmt = $pdo->query("SELECT * FROM Notas ORDER BY Fecha_calificacion DESC, Fecha_registro DESC, ID_Nota DESC");
    }
    $notas = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // 9. OBTENER ASISTENCIA
    if ($docente_id) {
        $stmt = $pdo->prepare("
            SELECT a.* FROM Asistencia a
            INNER JOIN Materia m ON a.Materia_ID_materia = m.ID_materia
            WHERE m.Usuarios_docente_ID_docente = ?
        ");
        $stmt->execute([$docente_id]);
    } else {
        $stmt = $pdo->query("SELECT * FROM Asistencia");
    }
    $asistencia = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // 10. OBTENER ARCHIVOS
    if ($docente_id) {
        $stmt = $pdo->prepare("
            SELECT ar.* FROM Archivos ar
            INNER JOIN Materia m ON ar.Materia_ID_materia = m.ID_materia
            WHERE m.Usuarios_docente_ID_docente = ?
        ");
        $stmt->execute([$docente_id]);
    } else {
        $stmt = $pdo->query("SELECT * FROM Archivos");
    }
    $archivos = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // 11. OBTENER RECORDATORIOS
    if ($docente_id) {
        $stmt = $pdo->prepare("
            SELECT r.* FROM Recordatorio r
            INNER JOIN Materia m ON r.Materia_ID_materia = m.ID_materia
            WHERE m.Usuarios_docente_ID_docente = ?
        ");
        $stmt->execute([$docente_id]);
    } else {
        $stmt = $pdo->query("SELECT * FROM Recordatorio");
    }
    $recordatorio = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // 12. OBTENER NOTIFICACIONES
    if ($docente_id) {
        $stmt = $pdo->prepare("
            SELECT * FROM Notificaciones 
            WHERE Destinatario_tipo = 'DOCENTE' AND Destinatario_id = ?
            OR Destinatario_tipo = 'TODOS'
            ORDER BY Fecha_creacion DESC
        ");
        $stmt->execute([$docente_id]);
    } else {
        $stmt = $pdo->query("SELECT * FROM Notificaciones ORDER BY Fecha_creacion DESC");
    }
    $notifications = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // 13. OBTENER INTENSIFICACION
    // Si hay docente logueado, filtrar solo intensificaciones de sus materias
    try {
        if ($docente_id) {
            $stmt = $pdo->prepare("
                SELECT i.* FROM Intensificacion i
                INNER JOIN Materia m ON i.Materia_ID_materia = m.ID_materia
                WHERE m.Usuarios_docente_ID_docente = ?
                ORDER BY i.Fecha_asignacion DESC, i.ID_intensificacion DESC
            ");
            $stmt->execute([$docente_id]);
        } else {
            $stmt = $pdo->query("SELECT * FROM Intensificacion ORDER BY Fecha_asignacion DESC, ID_intensificacion DESC");
        }
        $intensificacion = $stmt->fetchAll(PDO::FETCH_ASSOC);
    } catch (PDOException $e) {
        // Si la tabla no existe, retornar array vacío
        error_log("Error obteniendo intensificacion: " . $e->getMessage());
        $intensificacion = [];
    }

    // Formatear las fechas para JavaScript
    function formatDateForJS($date) {
        if (!$date || $date === '0000-00-00') return null;
        return $date;
    }

    // Convertir fechas en formato compatible
    foreach ($estudiante as &$est) {
        if (isset($est['Fecha_nacimiento'])) {
            $est['Fecha_nacimiento'] = formatDateForJS($est['Fecha_nacimiento']);
        }
    }

    // Preparar respuesta en el formato esperado por el frontend
    $response = [
        'usuarios_docente' => $usuarios_docente,
        'estudiante' => $estudiante,
        'materia' => $materia,
        'alumnos_x_materia' => $alumnos_x_materia,
        'contenido' => $contenido,
        'tema_estudiante' => $tema_estudiante,
        'evaluacion' => $evaluacion,
        'notas' => $notas,
        'asistencia' => $asistencia,
        'archivos' => $archivos,
        'recordatorio' => $recordatorio,
        'notifications' => $notifications,
        'intensificacion' => $intensificacion ?? []
    ];

    // Responder con éxito
    http_response_code(200);
    echo json_encode($response, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);

} catch (PDOException $e) {
    // Error de base de datos
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error al obtener los datos de la base de datos.',
        'error' => $e->getMessage()
    ]);
} catch (Exception $e) {
    // Error general
    error_log("Error en get_data.php: " . $e->getMessage());
    error_log("Stack trace: " . $e->getTraceAsString());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error inesperado.',
        'error' => $e->getMessage(),
        'details' => $e->getFile() . ':' . $e->getLine()
    ], JSON_UNESCAPED_UNICODE);
}
?>