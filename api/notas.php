<?php
// C:\xampp\htdocs\utnproject\api\notas.php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: http://localhost');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Headers: Content-Type, Authorization, Accept');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }

// Incluir configuración de base de datos
require_once __DIR__ . '/../config/database.php';

// Iniciar sesión para obtener el docente logueado
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

function validarEvaluacionDelDocente($db, $evaluacionId, $docenteId) {
	if (!$docenteId) return true; // Sin docente, permitir (admin)
	$stmt = $db->prepare("
		SELECT e.ID_evaluacion FROM Evaluacion e
		INNER JOIN Materia m ON e.Materia_ID_materia = m.ID_materia
		WHERE e.ID_evaluacion = ? AND m.Usuarios_docente_ID_docente = ?
	");
	$stmt->execute([$evaluacionId, $docenteId]);
	return $stmt->fetch() !== false;
}

try {
	$db = pdo();
	$method = $_SERVER['REQUEST_METHOD'];
	$id = isset($_GET['id']) ? (int)$_GET['id'] : null;
	
	// Obtener ID del docente logueado (si existe)
	$docente_id = isset($_SESSION['user_id']) ? (int)$_SESSION['user_id'] : null;

	switch ($method) {
		case 'GET':
			// Filtros opcionales: ?id=, ?evaluacionId=, ?estudianteId=
			if ($id) {
				// Si hay docente logueado, verificar que la nota pertenece a una de sus evaluaciones
				if ($docente_id) {
					$stmt = $db->prepare("
						SELECT n.* FROM Notas n
						INNER JOIN Evaluacion e ON n.Evaluacion_ID_evaluacion = e.ID_evaluacion
						INNER JOIN Materia m ON e.Materia_ID_materia = m.ID_materia
						WHERE n.ID_Nota = ? AND m.Usuarios_docente_ID_docente = ?
					");
					$stmt->execute([$id, $docente_id]);
				} else {
					$stmt = $db->prepare("SELECT * FROM Notas WHERE ID_Nota = ?");
					$stmt->execute([$id]);
				}
				$row = $stmt->fetch();
				if (!$row) respond(404, ['success'=>false,'message'=>'Nota no encontrada']);
				respond(200, $row);
			}
			
			$where = [];
			$params = [];
			
			// Si hay docente logueado, filtrar solo notas de sus evaluaciones
			if ($docente_id) {
				$sql = "SELECT n.* FROM Notas n
						INNER JOIN Evaluacion e ON n.Evaluacion_ID_evaluacion = e.ID_evaluacion
						INNER JOIN Materia m ON e.Materia_ID_materia = m.ID_materia
						WHERE m.Usuarios_docente_ID_docente = ?";
				$params[] = $docente_id;
				
				if (isset($_GET['evaluacionId'])) {
					$where[] = "n.Evaluacion_ID_evaluacion = ?";
					$params[] = (int)$_GET['evaluacionId'];
				}
				if (isset($_GET['estudianteId'])) {
					$where[] = "n.Estudiante_ID_Estudiante = ?";
					$params[] = (int)$_GET['estudianteId'];
				}
				
				if ($where) $sql .= " AND " . implode(' AND ', $where);
				$sql .= " ORDER BY n.Fecha_calificacion DESC, n.ID_Nota DESC";
			} else {
				// Sin docente logueado, mostrar todas (para admin)
				if (isset($_GET['evaluacionId'])) {
					$where[] = "Evaluacion_ID_evaluacion = ?";
					$params[] = (int)$_GET['evaluacionId'];
				}
				if (isset($_GET['estudianteId'])) {
					$where[] = "Estudiante_ID_Estudiante = ?";
					$params[] = (int)$_GET['estudianteId'];
				}
				
				$sql = "SELECT * FROM Notas";
				if ($where) $sql .= " WHERE " . implode(' AND ', $where);
				$sql .= " ORDER BY Fecha_calificacion DESC, ID_Nota DESC";
			}
			
			$stmt = $db->prepare($sql);
			$stmt->execute($params);
			respond(200, $stmt->fetchAll());
		
		case 'POST':
			$body = readJson();
			
			// Validación mínima
			if (!isset($body['Evaluacion_ID_evaluacion']) || !isset($body['Estudiante_ID_Estudiante'])) {
				respond(400, ['success'=>false,'message'=>'Faltan campos requeridos: Evaluacion_ID_evaluacion o Estudiante_ID_Estudiante']);
			}
			
			// Determinar si es ausente (puede venir como 'AUSENTE', null, vacío, o 1 con observación 'AUSENTE')
			$observacionEsAusente = isset($body['Observacion']) && strtoupper(trim($body['Observacion'])) === 'AUSENTE';
			$esAusente = (!isset($body['Calificacion']) || $body['Calificacion'] === 'AUSENTE' || $body['Calificacion'] === null || $body['Calificacion'] === '' || ($body['Calificacion'] == 1 && $observacionEsAusente));
			
			$Evaluacion_ID_evaluacion = (int)$body['Evaluacion_ID_evaluacion'];
			$Estudiante_ID_Estudiante = (int)$body['Estudiante_ID_Estudiante'];
			$Estado = isset($body['Estado']) ? $body['Estado'] : 'DEFINITIVA';
			$Peso = isset($body['Peso']) ? (float)$body['Peso'] : 1.00;
			
			// Validar que los IDs sean válidos
			if ($Evaluacion_ID_evaluacion <= 0 || $Estudiante_ID_Estudiante <= 0) {
				respond(400, ['success'=>false,'message'=>'IDs inválidos']);
			}
			
			// Manejar calificación: si es ausente, guardar 1, sino validar y usar el valor
			if ($esAusente) {
				$Calificacion = 1.00;
				// Si no hay observación, agregar "AUSENTE"
				$observacionText = isset($body['Observacion']) && $body['Observacion'] !== '' ? trim($body['Observacion']) : 'AUSENTE';
				$Observacion = $observacionText;
			} else {
				$Calificacion = (float)$body['Calificacion'];
				// Validar calificación (1.00 a 10.00)
				if ($Calificacion < 1 || $Calificacion > 10) {
					respond(400, ['success'=>false,'message'=>'La calificación debe estar entre 1.00 y 10.00']);
				}
				$Observacion = isset($body['Observacion']) && $body['Observacion'] !== '' ? trim($body['Observacion']) : null;
			}
			
			// Calcular estado automáticamente según la calificación
			// Si la nota es menor a 7 o ausente → DEBE
			// Si la nota es mayor o igual a 7 → APROBADO
			if ($esAusente || $Calificacion < 7) {
				$Estado = 'DEBE';
			} else {
				$Estado = 'APROBADO';
			}
			
			// Si el usuario envía un estado específico y está en los valores válidos, respetarlo
			// pero solo si no se calculó automáticamente
			if (isset($body['Estado']) && in_array($body['Estado'], ['TENTATIVA', 'DEFINITIVA', 'RECUPERATORIO', 'APROBADO', 'DEBE'])) {
				// Permitir que el usuario sobrescriba el estado calculado si es necesario
				// Por defecto, siempre calculamos automáticamente
			}
			
			// Validar peso (entre 0.00 y 9.99)
			if ($Peso < 0 || $Peso > 9.99) {
				respond(400, ['success'=>false,'message'=>'El peso debe estar entre 0.00 y 9.99']);
			}
			
			// Validar que la evaluación pertenezca al docente logueado
			if (!validarEvaluacionDelDocente($db, $Evaluacion_ID_evaluacion, $docente_id)) {
				respond(403, ['success'=>false,'message'=>'No tiene permiso para crear notas en esta evaluación']);
			}
			
			// Verificar si ya existe una nota para este estudiante y evaluación
			$stmt = $db->prepare("SELECT ID_Nota FROM Notas WHERE Estudiante_ID_Estudiante = ? AND Evaluacion_ID_evaluacion = ?");
			$stmt->execute([$Estudiante_ID_Estudiante, $Evaluacion_ID_evaluacion]);
			$existing = $stmt->fetch();
			
			if ($existing) {
				// Si existe, actualizar en lugar de crear nueva
				$notaId = $existing['ID_Nota'];
				$stmt = $db->prepare("UPDATE Notas SET Calificacion = ?, Observacion = ?, Estado = ?, Peso = ?, Fecha_calificacion = CURRENT_DATE WHERE ID_Nota = ?");
				$stmt->execute([$Calificacion, $Observacion, $Estado, $Peso, $notaId]);
				respond(200, ['success'=>true,'id'=>$notaId,'message'=>'Nota actualizada exitosamente']);
			} else {
				// Crear nueva nota
				try {
					$stmt = $db->prepare("INSERT INTO Notas (Calificacion, Observacion, Evaluacion_ID_evaluacion, Estudiante_ID_Estudiante, Estado, Peso) VALUES (?, ?, ?, ?, ?, ?)");
					$stmt->execute([$Calificacion, $Observacion, $Evaluacion_ID_evaluacion, $Estudiante_ID_Estudiante, $Estado, $Peso]);
					$newId = (int)$db->lastInsertId();
					
					if ($newId > 0) {
						respond(201, ['success'=>true,'id'=>$newId,'message'=>'Nota creada exitosamente']);
					} else {
						respond(500, ['success'=>false,'message'=>'Error al crear la nota']);
					}
				} catch (PDOException $e) {
					error_log("Error PDO al insertar nota: " . $e->getMessage());
					respond(500, ['success'=>false,'message'=>'Error al insertar en la base de datos: ' . $e->getMessage()]);
				}
			}

		case 'PUT':
			if (!$id) respond(400, ['success'=>false,'message'=>'Falta id']);
			
			// Validar que la nota pertenezca a una evaluación del docente logueado
			if ($docente_id) {
				$stmt = $db->prepare("
					SELECT n.ID_Nota FROM Notas n
					INNER JOIN Evaluacion e ON n.Evaluacion_ID_evaluacion = e.ID_evaluacion
					INNER JOIN Materia m ON e.Materia_ID_materia = m.ID_materia
					WHERE n.ID_Nota = ? AND m.Usuarios_docente_ID_docente = ?
				");
				$stmt->execute([$id, $docente_id]);
				if (!$stmt->fetch()) {
					respond(403, ['success'=>false,'message'=>'No tiene permiso para modificar esta nota']);
				}
			}
			
			$body = readJson();
			
			// Obtener observación actual de la base de datos si no viene en el body (para detectar ausente)
			$observacionActual = null;
			if (array_key_exists('Calificacion', $body) && !array_key_exists('Observacion', $body)) {
				$stmt = $db->prepare("SELECT Observacion FROM Notas WHERE ID_Nota = ?");
				$stmt->execute([$id]);
				$notaActual = $stmt->fetch();
				if ($notaActual) {
					$observacionActual = $notaActual['Observacion'];
				}
			}
			
			// Campos actualizables
			$fields = ['Calificacion', 'Observacion', 'Estado', 'Peso'];
			$sets = [];
			$params = [];
			
			// Variable para almacenar la calificación actualizada para calcular el estado
			$calificacionActualizada = null;
			$esAusenteActualizado = false;
			
			foreach ($fields as $f) {
				if (array_key_exists($f, $body)) {
					if ($f === 'Calificacion') {
						// Detectar ausente: puede venir como 'AUSENTE', null, vacío, o 1 con observación 'AUSENTE'
						$observacionEnBody = isset($body['Observacion']) ? $body['Observacion'] : $observacionActual;
						$observacionEsAusente = $observacionEnBody && strtoupper(trim($observacionEnBody)) === 'AUSENTE';
						$esAusenteActualizado = $body[$f] === 'AUSENTE' || $body[$f] === null || $body[$f] === '' || ($body[$f] == 1 && $observacionEsAusente);
						if ($esAusenteActualizado) {
							$calif = 1.00;
						} else {
							$calif = (float)$body[$f];
							if ($calif < 1 || $calif > 10) {
								respond(400, ['success'=>false,'message'=>'La calificación debe estar entre 1.00 y 10.00']);
							}
						}
						$calificacionActualizada = $calif;
						$sets[] = "$f = ?";
						$params[] = $calif;
					} else if ($f === 'Observacion') {
						$sets[] = "$f = ?";
						$params[] = $body[$f] === '' ? null : trim($body[$f]);
					} else if ($f === 'Estado') {
						$validEstados = ['TENTATIVA', 'DEFINITIVA', 'RECUPERATORIO', 'APROBADO', 'DEBE'];
						if (!in_array($body[$f], $validEstados)) {
							respond(400, ['success'=>false,'message'=>'Estado inválido']);
						}
						$sets[] = "$f = ?";
						$params[] = $body[$f];
					} else if ($f === 'Peso') {
						$peso = (float)$body[$f];
						if ($peso < 0 || $peso > 9.99) {
							respond(400, ['success'=>false,'message'=>'El peso debe estar entre 0.00 y 9.99']);
						}
						$sets[] = "$f = ?";
						$params[] = $peso;
					}
				}
			}
			
			// Si se actualizó la calificación, recalcular el estado automáticamente
			if ($calificacionActualizada !== null) {
				// Calcular estado automáticamente según la calificación
				if ($esAusenteActualizado || $calificacionActualizada < 7) {
					$nuevoEstado = 'DEBE';
				} else {
					$nuevoEstado = 'APROBADO';
				}
				
				// Solo actualizar el estado si no se especificó uno manualmente
				if (!isset($body['Estado'])) {
					$sets[] = "Estado = ?";
					$params[] = $nuevoEstado;
				}
			}
			
			if (!$sets) respond(400, ['success'=>false,'message'=>'Nada para actualizar']);
			
			// Actualizar fecha de calificación
			$sets[] = "Fecha_calificacion = CURRENT_DATE";
			$params[] = $id;
			$sql = "UPDATE Notas SET ".implode(', ', $sets)." WHERE ID_Nota = ?";
			$stmt = $db->prepare($sql);
			$stmt->execute($params);
			respond(200, ['success'=>true,'id'=>$id,'message'=>'Nota actualizada exitosamente']);

		case 'DELETE':
			$notaId = $id;
			$evaluacionId = isset($_GET['evaluacionId']) ? (int)$_GET['evaluacionId'] : null;
			$materiaId = isset($_GET['materiaId']) ? (int)$_GET['materiaId'] : null;
			$estudianteId = isset($_GET['estudianteId']) ? (int)$_GET['estudianteId'] : null;

			if ($notaId) {
				// Eliminación puntual por ID de nota
				if ($docente_id) {
					$stmt = $db->prepare("
						SELECT n.ID_Nota FROM Notas n
						INNER JOIN Evaluacion e ON n.Evaluacion_ID_evaluacion = e.ID_evaluacion
						INNER JOIN Materia m ON e.Materia_ID_materia = m.ID_materia
						WHERE n.ID_Nota = ? AND m.Usuarios_docente_ID_docente = ?
					");
					$stmt->execute([$notaId, $docente_id]);
					if (!$stmt->fetch()) {
						respond(403, ['success'=>false,'message'=>'No tiene permiso para eliminar esta nota']);
					}
				}

				$stmt = $db->prepare("DELETE FROM Notas WHERE ID_Nota = ?");
				$stmt->execute([$notaId]);
				respond(200, ['success'=>true,'message'=>'Nota eliminada exitosamente']);
			}

			if (!$evaluacionId && !$materiaId && !$estudianteId) {
				respond(400, ['success'=>false,'message'=>'Debe especificar id, evaluacionId, materiaId o estudianteId para eliminar notas']);
			}

			$params = [];
			$whereClauses = [];
			$permissionJoin = '';
			$permissionWhere = '';

			if ($materiaId) {
				$whereClauses[] = "e.Materia_ID_materia = ?";
				$params[] = $materiaId;
			}
			if ($evaluacionId) {
				$whereClauses[] = "n.Evaluacion_ID_evaluacion = ?";
				$params[] = $evaluacionId;
			}
			if ($estudianteId) {
				$whereClauses[] = "n.Estudiante_ID_Estudiante = ?";
				$params[] = $estudianteId;
			}

			if ($docente_id) {
				$permissionWhere = "m.Usuarios_docente_ID_docente = ?";
				$params[] = $docente_id;
			}

			$sql = "
				DELETE n FROM Notas n
				INNER JOIN Evaluacion e ON n.Evaluacion_ID_evaluacion = e.ID_evaluacion
				" . ($docente_id ? "INNER JOIN Materia m ON e.Materia_ID_materia = m.ID_materia" : "") . "
			";

			$whereParts = [];
			if (!empty($whereClauses)) {
				$whereParts[] = implode(' AND ', $whereClauses);
			}
			if ($permissionWhere) {
				$whereParts[] = $permissionWhere;
			}

			if (!empty($whereParts)) {
				$sql .= " WHERE " . implode(' AND ', $whereParts);
			}

			$stmt = $db->prepare($sql);
			$stmt->execute($params);
			respond(200, ['success'=>true,'deleted'=>$stmt->rowCount()]);

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

