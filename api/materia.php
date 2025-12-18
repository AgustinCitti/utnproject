<?php
// C:\xampp\htdocs\utnproject\api\materia.php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: http://localhost');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Headers: Content-Type, Authorization, Accept');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }

// Incluir configuración de base de datos
require_once __DIR__ . '/../config/database.php';

session_start();

function respond($code, $data) { http_response_code($code); echo json_encode($data); exit; }

function pdo() {
	try {
		$pdo = new PDO(
			"mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET,
			DB_USER,
			DB_PASS
		);
		$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
		$pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
		return $pdo;
	} catch (PDOException $e) {
		throw new Exception("Error de conexión a BD: " . $e->getMessage());
	}
}

function readJson() {
	$raw = file_get_contents('php://input');
	if (!$raw) return [];
	$decoded = json_decode($raw, true);
	return is_array($decoded) ? $decoded : [];
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

function parseHorario($horario) {
	// Parse schedule string like "Lunes 09:00-11:00, Miércoles 14:00-16:00"
	if (!$horario) return null;
	
	$daysMap = [
		'lunes' => 1, 'martes' => 2, 'miércoles' => 3, 'miercoles' => 3,
		'jueves' => 4, 'viernes' => 5, 'sábado' => 6, 'sabado' => 6, 'domingo' => 0
	];
	
	$schedule = [];
	$parts = explode(',', $horario);
	
	foreach ($parts as $part) {
		$part = trim($part);
		if (preg_match('/(\w+)\s+(\d{2}:\d{2})-(\d{2}:\d{2})/i', $part, $matches)) {
			$dayName = strtolower($matches[1]);
			$startTime = $matches[2];
			$endTime = $matches[3];
			
			if (isset($daysMap[$dayName])) {
				$schedule[] = [
					'day' => $daysMap[$dayName],
					'start' => $startTime,
					'end' => $endTime
				];
			}
		}
	}
	
	return count($schedule) > 0 ? $schedule : null;
}

function createRecordatoriosForClasses($db, $materiaId, $materiaNombre, $horario) {
	try {
		$schedule = parseHorario($horario);
		if (!$schedule) {
			return; // No valid schedule
		}
		
		$hoy = new DateTime();
		$hoy->setTime(0, 0, 0);
		
		// Create recordatorios for the next 4 weeks (up to 28 days ahead)
		for ($daysAhead = 0; $daysAhead < 28; $daysAhead++) {
			$checkDate = clone $hoy;
			$checkDate->modify("+{$daysAhead} days");
			$dayOfWeek = (int)$checkDate->format('w'); // 0 = Sunday, 1 = Monday, etc.
			
			// Check if this day matches any scheduled class
			foreach ($schedule as $classTime) {
				if ($classTime['day'] === $dayOfWeek) {
					// Create a recordatorio for this class, 1 day before
					$reminderDate = clone $checkDate;
					$reminderDate->modify('-1 day');
					
					// Only create if reminder date is today or in the future
					if ($reminderDate >= $hoy) {
						$reminderDateStr = $reminderDate->format('Y-m-d');
						$classDateStr = $checkDate->format('Y-m-d');
						
						$descripcion = "Recordatorio: Clase de {$materiaNombre} mañana ({$classDateStr})";
						
						// Check if recordatorio already exists
						$stmt = $db->prepare("
							SELECT ID_recordatorio FROM Recordatorio 
							WHERE Descripcion = ? AND Fecha = ? AND Materia_ID_materia = ? AND Tipo = 'CLASE'
						");
						$stmt->execute([$descripcion, $reminderDateStr, $materiaId]);
						
						if (!$stmt->fetch()) {
							// Insert new recordatorio
							$stmt = $db->prepare("
								INSERT INTO Recordatorio (Descripcion, Fecha, Tipo, Prioridad, Materia_ID_materia, Estado) 
								VALUES (?, ?, 'CLASE', 'MEDIA', ?, 'PENDIENTE')
							");
							$stmt->execute([$descripcion, $reminderDateStr, $materiaId]);
							error_log("Recordatorio de clase creado automáticamente para materia ID: {$materiaId}, Fecha: {$reminderDateStr}");
						}
					}
				}
			}
		}
	} catch (Exception $e) {
		error_log("Error creando recordatorios automáticos para clases: " . $e->getMessage());
		// Don't fail materia creation if recordatorio creation fails
	}
}

try {
	$db = pdo();
	$method = $_SERVER['REQUEST_METHOD'];
	$id = isset($_GET['id']) ? (int)$_GET['id'] : null;

	// --- Autenticación y Autorización Basada en Sesión ---
	if (!isset($_SESSION['logged_in']) || $_SESSION['logged_in'] !== true) {
		respond(401, ['success' => false, 'message' => 'No autorizado. Debes iniciar sesión.']);
	}
	$loggedInUserId = (int)($_SESSION['user_id'] ?? 0);
	$loggedInUserRole = $_SESSION['user_role'] ?? '';
	// --- Fin de Autenticación ---

	switch ($method) {
		case 'GET':
			// Filtros opcionales: ?id=, ?docenteId=, ?estado=
			if ($id) {
				$stmt = $db->prepare("SELECT * FROM Materia WHERE ID_materia = ?");
				$stmt->execute([$id]);
				$row = $stmt->fetch();
				if (!$row) respond(404, ['success'=>false,'message'=>'Materia no encontrada']);
				respond(200, $row);
			}
			$where = [];
			$params = [];

			// Prioridad 1: Filtro explícito en la URL
			if (isset($_GET['docenteId'])) {
				$where[] = "Usuarios_docente_ID_docente = ?";
				$params[] = (int)$_GET['docenteId'];
			}
			// Prioridad 2: Si no hay filtro explícito, y el usuario es un profesor, filtrar por su propio ID
			else if ($loggedInUserRole === 'PROFESOR') {
				$where[] = "Usuarios_docente_ID_docente = ?";
				$params[] = $loggedInUserId;
			}
			// Si es ADMIN y no hay filtro en URL, no se aplica filtro de docente (ve todo)

			if (isset($_GET['estado'])) {
				$where[] = "Estado = ?";
				$params[] = $_GET['estado'];
			}
			
			$sql = "SELECT * FROM Materia";
			if ($where) $sql .= " WHERE " . implode(' AND ', $where);
			
			$stmt = $db->prepare($sql);
			$stmt->execute($params);
			respond(200, $stmt->fetchAll());
		
		case 'POST':
			// Autorización: Solo los profesores pueden crear materias.
			if ($loggedInUserRole !== 'PROFESOR') {
				respond(403, ['success' => false, 'message' => 'Acceso denegado. Solo los profesores pueden crear materias.']);
			}
			$DocenteId = $loggedInUserId; // Usar el ID del docente de la sesión.

			$body = readJson();
			// Validación mínima
			$required = ['Nombre','Curso_division','Estado'];
			foreach ($required as $k) {
				if (!isset($body[$k]) || $body[$k]==='') respond(400, ['success'=>false,'message'=>"Falta campo: $k"]);
			}
			$Nombre = $body['Nombre'];
			$Curso_division = $body['Curso_division'];
			$Estado = $body['Estado'];
			$Horario = isset($body['Horario']) && $body['Horario'] !== '' ? $body['Horario'] : null;
			$Aula = isset($body['Aula']) && $body['Aula'] !== '' ? $body['Aula'] : null;
			$Descripcion = isset($body['Descripcion']) && $body['Descripcion'] !== '' ? $body['Descripcion'] : null;
			
			// La validación del docente ya se hizo con la sesión, no es necesario volver a consultar.

			// Verificar si la columna Escuela_ID existe
			$hasEscuelaId = columnExists($db, 'Materia', 'Escuela_ID');
			$hasEscuelaIdInCurso = columnExists($db, 'Curso', 'Escuela_ID');
			
			// Obtener Escuela_ID del curso si la columna existe
			$Escuela_ID = null;
			if ($hasEscuelaIdInCurso) {
				$cursoStmt = $db->prepare("SELECT Escuela_ID FROM Curso WHERE Curso_division = ? AND Usuarios_docente_ID_docente = ?");
				$cursoStmt->execute([$Curso_division, $DocenteId]);
				$curso = $cursoStmt->fetch();
				$Escuela_ID = $curso ? $curso['Escuela_ID'] : null;
			}

			// Verificar si ya existe una materia con el mismo nombre, curso y docente (previene duplicados)
			if ($hasEscuelaId) {
				$checkStmt = $db->prepare("
					SELECT ID_materia, Nombre, Curso_division 
					FROM Materia 
					WHERE Nombre = ? AND Curso_division = ? AND Usuarios_docente_ID_docente = ?
					AND (Escuela_ID = ? OR (Escuela_ID IS NULL AND ? IS NULL))
				");
				$checkStmt->execute([$Nombre, $Curso_division, $DocenteId, $Escuela_ID, $Escuela_ID]);
			} else {
				$checkStmt = $db->prepare("
					SELECT ID_materia, Nombre, Curso_division 
					FROM Materia 
					WHERE Nombre = ? AND Curso_division = ? AND Usuarios_docente_ID_docente = ?
				");
				$checkStmt->execute([$Nombre, $Curso_division, $DocenteId]);
			}
			$existing = $checkStmt->fetch();
			
			if ($existing) {
				respond(409, [
					'success'=>false,
					'message'=>"Ya existe una materia '{$Nombre}' con el curso '{$Curso_division}'. No se puede duplicar la misma materia y curso. Puedes crear la misma materia en un curso diferente.",
					'error'=>'DUPLICATE_SUBJECT_COURSE'
				]);
			}

			if ($hasEscuelaId) {
				$stmt = $db->prepare("INSERT INTO Materia (Nombre, Curso_division, Usuarios_docente_ID_docente, Estado, Horario, Aula, Descripcion, Escuela_ID) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
				$stmt->execute([$Nombre, $Curso_division, $DocenteId, $Estado, $Horario, $Aula, $Descripcion, $Escuela_ID]);
			} else {
				$stmt = $db->prepare("INSERT INTO Materia (Nombre, Curso_division, Usuarios_docente_ID_docente, Estado, Horario, Aula, Descripcion) VALUES (?, ?, ?, ?, ?, ?, ?)");
				$stmt->execute([$Nombre, $Curso_division, $DocenteId, $Estado, $Horario, $Aula, $Descripcion]);
			}
			$newId = (int)$db->lastInsertId();
			
			// Create automatic recordatorios for classes if horario is provided
			if ($Horario && $Estado === 'ACTIVA') {
				createRecordatoriosForClasses($db, $newId, $Nombre, $Horario);
			}
			
			respond(201, ['success'=>true,'id'=>$newId]);

		case 'PUT':
			if (!$id) respond(400, ['success'=>false,'message'=>'Falta id']);
			
			// Autorización: Solo el profesor de la materia o un admin pueden editar.
			$stmt = $db->prepare("SELECT Usuarios_docente_ID_docente FROM Materia WHERE ID_materia = ?");
			$stmt->execute([$id]);
			$materia = $stmt->fetch();
			if (!$materia) {
				respond(404, ['success' => false, 'message' => 'Materia no encontrada.']);
			}
			if ($loggedInUserRole !== 'ADMIN' && $materia['Usuarios_docente_ID_docente'] != $loggedInUserId) {
				respond(403, ['success' => false, 'message' => 'Acceso denegado. No tienes permiso para editar esta materia.']);
			}

			$body = readJson();
			
			// Get current materia data
			$stmt = $db->prepare("SELECT Nombre, Horario, Estado, Curso_division, Usuarios_docente_ID_docente FROM Materia WHERE ID_materia = ?");
			$stmt->execute([$id]);
			$currentMateria = $stmt->fetch();
			
			// Campos actualizables
			$fields = ['Nombre','Curso_division','Usuarios_docente_ID_docente','Estado','Horario','Aula','Descripcion'];
			$sets = [];
			$params = [];
			foreach ($fields as $f) {
				if (array_key_exists($f, $body)) {
					// Un admin puede cambiar el docente, el profesor no.
					if ($f === 'Usuarios_docente_ID_docente' && $loggedInUserRole !== 'ADMIN') continue;
					$sets[] = "$f = ?";
					$params[] = $body[$f] === '' ? null : $body[$f];
				}
			}

			// Si se actualiza Curso_division, también actualizar Escuela_ID (si la columna existe)
			$hasEscuelaId = columnExists($db, 'Materia', 'Escuela_ID');
			$hasEscuelaIdInCurso = columnExists($db, 'Curso', 'Escuela_ID');
			
			if (isset($body['Curso_division']) && $hasEscuelaId && $hasEscuelaIdInCurso) {
				$DocenteId = isset($body['Usuarios_docente_ID_docente']) ? (int)$body['Usuarios_docente_ID_docente'] : $currentMateria['Usuarios_docente_ID_docente'];
				$cursoStmt = $db->prepare("SELECT Escuela_ID FROM Curso WHERE Curso_division = ? AND Usuarios_docente_ID_docente = ?");
				$cursoStmt->execute([$body['Curso_division'], $DocenteId]);
				$curso = $cursoStmt->fetch();
				$Escuela_ID = $curso ? $curso['Escuela_ID'] : null;
				$sets[] = "Escuela_ID = ?";
				$params[] = $Escuela_ID;
			}

			if (!$sets) respond(400, ['success'=>false,'message'=>'Nada para actualizar']);
			$params[] = $id;
			$sql = "UPDATE Materia SET ".implode(', ', $sets)." WHERE ID_materia = ?";
			$stmt = $db->prepare($sql);
			$stmt->execute($params);
			
			// If Horario or Estado changed, update recordatorios
			$newHorario = isset($body['Horario']) ? $body['Horario'] : $currentMateria['Horario'];
			$newEstado = isset($body['Estado']) ? $body['Estado'] : $currentMateria['Estado'];
			$newNombre = isset($body['Nombre']) ? $body['Nombre'] : $currentMateria['Nombre'];
			
			// Delete old class recordatorios if schedule changed
			if (isset($body['Horario']) && $body['Horario'] !== $currentMateria['Horario']) {
				$stmt = $db->prepare("
					DELETE FROM Recordatorio 
					WHERE Materia_ID_materia = ? AND Tipo = 'CLASE' AND Descripcion LIKE ?
				");
				$stmt->execute([$id, "%{$currentMateria['Nombre']}%"]);
			}
			
			// Create new recordatorios if horario is provided and materia is active
			if ($newHorario && $newEstado === 'ACTIVA') {
				createRecordatoriosForClasses($db, $id, $newNombre, $newHorario);
			}
			
			respond(200, ['success'=>true,'id'=>$id]);

		case 'DELETE':
			if (!$id) respond(400, ['success'=>false,'message'=>'Falta id']);

			// Autorización: Solo el profesor de la materia o un admin pueden eliminar.
			// Obtener información de la materia antes de eliminarla (incluyendo Curso_division para verificar si eliminar el curso)
			$stmt = $db->prepare("SELECT Usuarios_docente_ID_docente, Curso_division FROM Materia WHERE ID_materia = ?");
			$stmt->execute([$id]);
			$materia = $stmt->fetch();
			if (!$materia) {
				respond(404, ['success' => false, 'message' => 'Materia no encontrada.']);
			}
			if ($loggedInUserRole !== 'ADMIN' && $materia['Usuarios_docente_ID_docente'] != $loggedInUserId) {
				respond(403, ['success' => false, 'message' => 'Acceso denegado. No tienes permiso para eliminar esta materia.']);
			}
			
			// Guardar información del curso para verificar después de eliminar la materia
			$cursoDivision = $materia['Curso_division'];
			$docenteId = (int)$materia['Usuarios_docente_ID_docente'];
			
			try {
				$db->beginTransaction();

				$deletedEvaluaciones = 0;
				$deletedNotas = 0;
				$deletedContenidos = 0;
				$deletedTemas = 0;
				$deletedAsistencias = 0;
				$deletedArchivos = 0;
				$deletedRecordatorios = 0;
				$deletedIntensificacion = 0;
				$deletedEnrollments = 0;
				$deletedStudents = 0;

				// Delete notas associated to evaluaciones of this materia
				$stmt = $db->prepare("SELECT ID_evaluacion FROM Evaluacion WHERE Materia_ID_materia = ?");
				$stmt->execute([$id]);
				$evaluacionIds = $stmt->fetchAll(PDO::FETCH_COLUMN);

				if (!empty($evaluacionIds)) {
					$placeholders = implode(',', array_fill(0, count($evaluacionIds), '?'));
					$stmt = $db->prepare("DELETE FROM Notas WHERE Evaluacion_ID_evaluacion IN ($placeholders)");
					$stmt->execute($evaluacionIds);
					$deletedNotas = $stmt->rowCount();

					$stmt = $db->prepare("DELETE FROM Evaluacion WHERE ID_evaluacion IN ($placeholders)");
					$stmt->execute($evaluacionIds);
					$deletedEvaluaciones = $stmt->rowCount();
				}

				// Delete temas_estudiante linked to contenidos of this materia
				$stmt = $db->prepare("SELECT ID_contenido FROM Contenido WHERE Materia_ID_materia = ?");
				$stmt->execute([$id]);
				$contenidoIds = $stmt->fetchAll(PDO::FETCH_COLUMN);

				if (!empty($contenidoIds) && columnExists($db, 'Tema_estudiante', 'Contenido_ID_contenido')) {
					$placeholders = implode(',', array_fill(0, count($contenidoIds), '?'));
					$stmt = $db->prepare("DELETE FROM Tema_estudiante WHERE Contenido_ID_contenido IN ($placeholders)");
					$stmt->execute($contenidoIds);
					$deletedTemas = $stmt->rowCount();
				}

				if (!empty($contenidoIds)) {
					$placeholders = implode(',', array_fill(0, count($contenidoIds), '?'));
					$stmt = $db->prepare("DELETE FROM Contenido WHERE ID_contenido IN ($placeholders)");
					$stmt->execute($contenidoIds);
					$deletedContenidos = $stmt->rowCount();
				}

				// Delete intensificacion records if table exists
				if (columnExists($db, 'Intensificacion', 'Materia_ID_materia')) {
					$stmt = $db->prepare("DELETE FROM Intensificacion WHERE Materia_ID_materia = ?");
					$stmt->execute([$id]);
					$deletedIntensificacion = $stmt->rowCount();
				}

				// Delete asistencia, archivos, recordatorios linked to materia
				$stmt = $db->prepare("DELETE FROM Asistencia WHERE Materia_ID_materia = ?");
				$stmt->execute([$id]);
				$deletedAsistencias = $stmt->rowCount();

				$stmt = $db->prepare("DELETE FROM Archivos WHERE Materia_ID_materia = ?");
				$stmt->execute([$id]);
				$deletedArchivos = $stmt->rowCount();

				$stmt = $db->prepare("DELETE FROM Recordatorio WHERE Materia_ID_materia = ?");
				$stmt->execute([$id]);
				$deletedRecordatorios = $stmt->rowCount();

				// Collect students enrolled in this materia
				$stmt = $db->prepare("SELECT DISTINCT Estudiante_ID_Estudiante FROM Alumnos_X_Materia WHERE Materia_ID_materia = ?");
				$stmt->execute([$id]);
				$studentIds = $stmt->fetchAll(PDO::FETCH_COLUMN);

				// Delete enrollments for this materia
				$stmt = $db->prepare("DELETE FROM Alumnos_X_Materia WHERE Materia_ID_materia = ?");
				$stmt->execute([$id]);
				$deletedEnrollments = $stmt->rowCount();

				$studentsToDelete = [];
				if (!empty($studentIds)) {
					$countStmt = $db->prepare("SELECT COUNT(*) AS total FROM Alumnos_X_Materia WHERE Estudiante_ID_Estudiante = ?");
					foreach ($studentIds as $studentId) {
						$countStmt->execute([$studentId]);
						$total = (int)($countStmt->fetch()['total'] ?? 0);
						if ($total === 0) {
							$studentsToDelete[] = (int)$studentId;
						}
					}
				}

				if (!empty($studentsToDelete)) {
					$placeholders = implode(',', array_fill(0, count($studentsToDelete), '?'));

					// Clean up any tema_estudiante rows tied directly to the student (if column exists)
					if (columnExists($db, 'Tema_estudiante', 'Estudiante_ID_Estudiante')) {
						$stmt = $db->prepare("DELETE FROM Tema_estudiante WHERE Estudiante_ID_Estudiante IN ($placeholders)");
						$stmt->execute($studentsToDelete);
					}

					// Clean up asistencia rows for the student (should already be gone, but to ensure)
					$stmt = $db->prepare("DELETE FROM Asistencia WHERE Estudiante_ID_Estudiante IN ($placeholders)");
					$stmt->execute($studentsToDelete);

					// Clean up notas for the student (should already be deleted via evaluaciones)
					$stmt = $db->prepare("DELETE FROM Notas WHERE Estudiante_ID_Estudiante IN ($placeholders)");
					$stmt->execute($studentsToDelete);

					$stmt = $db->prepare("DELETE FROM Estudiante WHERE ID_Estudiante IN ($placeholders)");
					$stmt->execute($studentsToDelete);
					$deletedStudents = $stmt->rowCount();
				}

				// Finally delete the materia
				$stmt = $db->prepare("DELETE FROM Materia WHERE ID_materia = ?");
				$stmt->execute([$id]);
				$deletedMateria = $stmt->rowCount();

				// Verify that the materia was actually deleted
				if ($deletedMateria === 0) {
					throw new Exception("No se pudo eliminar la materia. La materia no existe o ya fue eliminada.");
				}

				// Check if the curso should be deleted (if no more materias exist for this curso_division and docente)
				// This must be done BEFORE commit to ensure it's part of the same transaction
				$deletedCurso = 0;
				if ($cursoDivision && $cursoDivision !== 'Sin asignar') {
					// Check if there are any remaining materias with this curso_division and docente
					$remainingMateriasStmt = $db->prepare("
						SELECT COUNT(*) as count 
						FROM Materia 
						WHERE Curso_division = ? 
						  AND Usuarios_docente_ID_docente = ?
					");
					$remainingMateriasStmt->execute([$cursoDivision, $docenteId]);
					$remainingMaterias = $remainingMateriasStmt->fetch();
					
					// If no materias remain, delete the curso
					if ($remainingMaterias && (int)$remainingMaterias['count'] === 0) {
						// Check if table Curso exists
						$cursoTableExists = false;
						try {
							$checkTableStmt = $db->query("SELECT COUNT(*) as count FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'Curso'");
							$tableCheck = $checkTableStmt->fetch();
							$cursoTableExists = $tableCheck && $tableCheck['count'] > 0;
						} catch (Exception $e) {
							// Table doesn't exist, skip curso deletion
							$cursoTableExists = false;
						}
						
						if ($cursoTableExists) {
							// Find the curso by Curso_division and docente
							$findCursoStmt = $db->prepare("
								SELECT ID_curso 
								FROM Curso 
								WHERE Curso_division = ? 
								  AND Usuarios_docente_ID_docente = ?
								LIMIT 1
							");
							$findCursoStmt->execute([$cursoDivision, $docenteId]);
							$cursoToDelete = $findCursoStmt->fetch();
							
							if ($cursoToDelete) {
								$cursoId = (int)$cursoToDelete['ID_curso'];
								$deleteCursoStmt = $db->prepare("DELETE FROM Curso WHERE ID_curso = ?");
								$deleteCursoStmt->execute([$cursoId]);
								$deletedCurso = $deleteCursoStmt->rowCount();
								
								if ($deletedCurso > 0) {
									error_log("Curso {$cursoId} ({$cursoDivision}) eliminado automáticamente porque no quedan materias asociadas.");
								}
							}
						}
					}
				}

				// Commit the transaction
				$db->commit();

				// Verify deletion after commit
				$verifyStmt = $db->prepare("SELECT COUNT(*) as count FROM Materia WHERE ID_materia = ?");
				$verifyStmt->execute([$id]);
				$verifyResult = $verifyStmt->fetch();
				
				if ($verifyResult && $verifyResult['count'] > 0) {
					error_log("ADVERTENCIA: La materia {$id} aún existe después del commit. Posible problema de transacción.");
					throw new Exception("La materia no se eliminó correctamente de la base de datos.");
				}

				$responseMessage = 'Materia eliminada correctamente';
				if ($deletedCurso > 0) {
					$responseMessage .= '. El curso asociado también fue eliminado automáticamente porque no quedaban materias.';
				}

				respond(200, [
					'success' => true,
					'message' => $responseMessage,
					'deleted_nivel' => [
						'materia' => $deletedMateria,
						'curso' => $deletedCurso,
						'evaluaciones' => $deletedEvaluaciones,
						'notas' => $deletedNotas,
						'contenidos' => $deletedContenidos,
						'tema_estudiante' => $deletedTemas,
						'intensificacion' => $deletedIntensificacion,
						'asistencia' => $deletedAsistencias,
						'archivos' => $deletedArchivos,
						'recordatorios' => $deletedRecordatorios,
						'alumnos_x_materia' => $deletedEnrollments,
						'estudiantes' => $deletedStudents
					]
				]);
			} catch (Throwable $deleteError) {
				if ($db->inTransaction()) {
					$db->rollBack();
				}
				error_log("Error eliminando materia {$id}: " . $deleteError->getMessage() . " | Trace: " . $deleteError->getTraceAsString());
				respond(500, [
					'success' => false,
					'message' => 'Error al eliminar la materia: ' . $deleteError->getMessage(),
					'error' => $deleteError->getMessage()
				]);
			}

		default:
			respond(405, ['success'=>false,'message'=>'Método no permitido']);
	}

} catch (Throwable $e) {
	// En desarrollo, mostrar el error completo. En producción, ocultar detalles.
	$errorDetails = [
		'success' => false,
		'message' => 'Error del servidor',
		'error' => $e->getMessage(),
		'file' => $e->getFile(),
		'line' => $e->getLine()
	];
	respond(500, $errorDetails);
}