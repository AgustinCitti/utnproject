<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');

// Incluir configuración de base de datos
require_once __DIR__ . '/../config/database.php';

// Iniciar sesión para verificar permisos
session_start();

try {
    // Verificar que el usuario es admin (opcional, pero recomendado)
    // Puedes agregar validación de sesión aquí si es necesario
    
    // Crear conexión PDO
    $pdo = new PDO(
        "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET,
        DB_USER,
        DB_PASS
    );
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Obtener estadísticas generales (solo números, sin datos confidenciales)
    $stats = [];

    // Helper function to safely execute queries
    function safeQuery($pdo, $query, $default = 0) {
        try {
            $stmt = $pdo->query($query);
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            return $result ? (int)($result['total'] ?? $result['count'] ?? $default) : $default;
        } catch (Exception $e) {
            error_log("Query failed: $query - " . $e->getMessage());
            return $default;
        }
    }

    // 1. Estadísticas de usuarios (docentes)
    $stats['total_users'] = safeQuery($pdo, "SELECT COUNT(*) as total FROM Usuarios_docente");
    $stats['active_users'] = safeQuery($pdo, "SELECT COUNT(*) as total FROM Usuarios_docente WHERE Estado = 'ACTIVO'");
    $stats['inactive_users'] = safeQuery($pdo, "SELECT COUNT(*) as total FROM Usuarios_docente WHERE Estado = 'INACTIVO'");
    
    // Desglose por tipo de usuario
    $stats['users_by_type'] = [];
    try {
        $stmt = $pdo->query("SELECT Tipo_usuario, COUNT(*) as count FROM Usuarios_docente GROUP BY Tipo_usuario");
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $stats['users_by_type'][$row['Tipo_usuario']] = (int)$row['count'];
        }
    } catch (Exception $e) {
        error_log("Error getting users by type: " . $e->getMessage());
    }

    // 2. Estadísticas de estudiantes
    $stats['total_students'] = safeQuery($pdo, "SELECT COUNT(*) as total FROM Estudiante");
    $stats['active_students'] = safeQuery($pdo, "SELECT COUNT(*) as total FROM Estudiante WHERE Estado = 'ACTIVO'");
    $stats['inactive_students'] = safeQuery($pdo, "SELECT COUNT(*) as total FROM Estudiante WHERE Estado = 'INACTIVO'");

    // 3. Estadísticas de materias
    $stats['total_subjects'] = safeQuery($pdo, "SELECT COUNT(*) as total FROM Materia");
    $stats['active_subjects'] = safeQuery($pdo, "SELECT COUNT(*) as total FROM Materia WHERE Estado = 'ACTIVA'");
    $stats['inactive_subjects'] = safeQuery($pdo, "SELECT COUNT(*) as total FROM Materia WHERE Estado = 'INACTIVA'");

    // 4. Estadísticas de evaluaciones
    $stats['total_evaluations'] = safeQuery($pdo, "SELECT COUNT(*) as total FROM Evaluacion");
    $stats['scheduled_evaluations'] = safeQuery($pdo, "SELECT COUNT(*) as total FROM Evaluacion WHERE Estado = 'PROGRAMADA'");
    $stats['completed_evaluations'] = safeQuery($pdo, "SELECT COUNT(*) as total FROM Evaluacion WHERE Estado = 'REALIZADA'");

    // 5. Estadísticas de notas
    $stats['total_grades'] = safeQuery($pdo, "SELECT COUNT(*) as total FROM Notas");
    
    // Promedio general de calificaciones
    try {
        $stmt = $pdo->query("SELECT AVG(Calificacion) as avg FROM Notas WHERE Estado = 'DEFINITIVA'");
        $avgResult = $stmt->fetch(PDO::FETCH_ASSOC);
        $stats['average_grade'] = $avgResult['avg'] ? round((float)$avgResult['avg'], 2) : 0;
    } catch (Exception $e) {
        error_log("Error getting average grade: " . $e->getMessage());
        $stats['average_grade'] = 0;
    }
    
    // Notas aprobadas vs desaprobadas
    $stats['passed_grades'] = safeQuery($pdo, "SELECT COUNT(*) as total FROM Notas WHERE Calificacion >= 6 AND Estado = 'DEFINITIVA'");
    $stats['failed_grades'] = safeQuery($pdo, "SELECT COUNT(*) as total FROM Notas WHERE Calificacion < 6 AND Estado = 'DEFINITIVA'");

    // 6. Estadísticas de asistencia
    $stats['total_attendance_records'] = safeQuery($pdo, "SELECT COUNT(*) as total FROM Asistencia");
    $stats['present_records'] = safeQuery($pdo, "SELECT COUNT(*) as total FROM Asistencia WHERE Presente = 'Y'");
    $stats['absent_records'] = safeQuery($pdo, "SELECT COUNT(*) as total FROM Asistencia WHERE Presente = 'N'");
    $stats['attendance_today'] = safeQuery($pdo, "SELECT COUNT(*) as total FROM Asistencia WHERE Fecha = CURDATE()");

    // 7. Estadísticas de contenido
    $stats['total_content'] = safeQuery($pdo, "SELECT COUNT(*) as total FROM Contenido");
    $stats['completed_content'] = safeQuery($pdo, "SELECT COUNT(*) as total FROM Contenido WHERE Estado = 'COMPLETADO'");
    $stats['pending_content'] = safeQuery($pdo, "SELECT COUNT(*) as total FROM Contenido WHERE Estado = 'PENDIENTE'");

    // 8. Estadísticas de tema_estudiante
    $stats['total_student_topics'] = safeQuery($pdo, "SELECT COUNT(*) as total FROM Tema_estudiante");
    $stats['approved_topics'] = safeQuery($pdo, "SELECT COUNT(*) as total FROM Tema_estudiante WHERE Estado = 'APROBADO'");
    $stats['failed_topics'] = safeQuery($pdo, "SELECT COUNT(*) as total FROM Tema_estudiante WHERE Estado = 'DESAPROBADO'");
    $stats['pending_topics'] = safeQuery($pdo, "SELECT COUNT(*) as total FROM Tema_estudiante WHERE Estado = 'PENDIENTE'");

    // 9. Estadísticas de archivos
    $stats['total_files'] = safeQuery($pdo, "SELECT COUNT(*) as total FROM Archivos");

    // 10. Estadísticas de recordatorios
    $stats['total_reminders'] = safeQuery($pdo, "SELECT COUNT(*) as total FROM Recordatorio");

    // 11. Estadísticas de notificaciones
    $stats['total_notifications'] = safeQuery($pdo, "SELECT COUNT(*) as total FROM Notificaciones");
    $stats['unread_notifications'] = safeQuery($pdo, "SELECT COUNT(*) as total FROM Notificaciones WHERE Estado = 'NO_LEIDA'");
    $stats['read_notifications'] = safeQuery($pdo, "SELECT COUNT(*) as total FROM Notificaciones WHERE Estado = 'LEIDA'");

    // 12. Estadísticas de inscripciones
    $stats['total_enrollments'] = safeQuery($pdo, "SELECT COUNT(*) as total FROM Alumnos_X_Materia");

    // Responder con éxito
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'stats' => $stats
    ], JSON_UNESCAPED_UNICODE);

} catch (PDOException $e) {
    // Error de base de datos
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error al obtener estadísticas.',
        'error' => $e->getMessage()
    ]);
} catch (Exception $e) {
    // Error general
    error_log("Error en admin_stats.php: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error inesperado.',
        'error' => $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}
?>

