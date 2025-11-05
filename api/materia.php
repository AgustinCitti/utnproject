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
			if (isset($_GET['docenteId'])) { $where[] = "Usuarios_docente_ID_docente = ?"; $params[] = (int)$_GET['docenteId']; }
			if (isset($_GET['estado'])) { $where[] = "Estado = ?"; $params[] = $_GET['estado']; }
			$sql = "SELECT * FROM Materia";
			if ($where) $sql .= " WHERE " . implode(' AND ', $where);
			$stmt = $db->prepare($sql);
			$stmt->execute($params);
			respond(200, $stmt->fetchAll());
		
		case 'POST':
			$body = readJson();
			// Validación mínima
			$required = ['Nombre','Curso_division','Usuarios_docente_ID_docente','Estado'];
			foreach ($required as $k) {
				if (!isset($body[$k]) || $body[$k]==='') respond(400, ['success'=>false,'message'=>"Falta campo: $k"]);
			}
			$Nombre = $body['Nombre'];
			$Curso_division = $body['Curso_division'];
			$DocenteId = (int)$body['Usuarios_docente_ID_docente'];
			$Estado = $body['Estado'];
			$Horario = isset($body['Horario']) && $body['Horario'] !== '' ? $body['Horario'] : null;
			$Aula = isset($body['Aula']) && $body['Aula'] !== '' ? $body['Aula'] : null;
			$Descripcion = isset($body['Descripcion']) && $body['Descripcion'] !== '' ? $body['Descripcion'] : null;
			// Validar que el docente ID sea válido
			if ($DocenteId <= 0) {
				respond(400, ['success'=>false,'message'=>'ID de docente inválido']);
			}
			
			// Verificar que el docente existe en la base de datos
			$checkDocente = $db->prepare("SELECT ID_docente FROM Usuarios_docente WHERE ID_docente = ? AND Estado = 'ACTIVO'");
			$checkDocente->execute([$DocenteId]);
			if (!$checkDocente->fetch()) {
				respond(404, ['success'=>false,'message'=>'El docente especificado no existe o no está activo. Por favor, inicia sesión nuevamente.']);
			}

			// Obtener Escuela_ID del curso
			$cursoStmt = $db->prepare("SELECT Escuela_ID FROM Curso WHERE Curso_division = ? AND Usuarios_docente_ID_docente = ?");
			$cursoStmt->execute([$Curso_division, $DocenteId]);
			$curso = $cursoStmt->fetch();
			$Escuela_ID = $curso ? $curso['Escuela_ID'] : null;

			// Verificar si ya existe una materia con el mismo nombre, curso y docente (previene duplicados)
			$checkStmt = $db->prepare("
				SELECT ID_materia, Nombre, Curso_division 
				FROM Materia 
				WHERE Nombre = ? AND Curso_division = ? AND Usuarios_docente_ID_docente = ?
				AND (Escuela_ID = ? OR (Escuela_ID IS NULL AND ? IS NULL))
			");
			$checkStmt->execute([$Nombre, $Curso_division, $DocenteId, $Escuela_ID, $Escuela_ID]);
			$existing = $checkStmt->fetch();
			
			if ($existing) {
				respond(409, [
					'success'=>false,
					'message'=>"Ya existe una materia '{$Nombre}' con el curso '{$Curso_division}'. No se puede duplicar la misma materia y curso. Puedes crear la misma materia en un curso diferente.",
					'error'=>'DUPLICATE_SUBJECT_COURSE'
				]);
			}

			$stmt = $db->prepare("INSERT INTO Materia (Nombre, Curso_division, Usuarios_docente_ID_docente, Estado, Horario, Aula, Descripcion, Escuela_ID) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
			$stmt->execute([$Nombre, $Curso_division, $DocenteId, $Estado, $Horario, $Aula, $Descripcion, $Escuela_ID]);
			$newId = (int)$db->lastInsertId();
			
			// Create automatic recordatorios for classes if horario is provided
			if ($Horario && $Estado === 'ACTIVA') {
				createRecordatoriosForClasses($db, $newId, $Nombre, $Horario);
			}
			
			respond(201, ['success'=>true,'id'=>$newId]);

		case 'PUT':
			if (!$id) respond(400, ['success'=>false,'message'=>'Falta id']);
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
					$sets[] = "$f = ?";
					$params[] = $body[$f] === '' ? null : $body[$f];
				}
			}

			// Si se actualiza Curso_division, también actualizar Escuela_ID
			if (isset($body['Curso_division'])) {
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
			$stmt = $db->prepare("DELETE FROM Materia WHERE ID_materia = ?");
			$stmt->execute([$id]);
			respond(200, ['success'=>true]);

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