<?php
// C:\xampp\htdocs\utnproject\api\evaluacion.php
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

function validarMateriaDelDocente($db, $materiaId, $docenteId) {
	if (!$docenteId) return true; // Sin docente, permitir (admin)
	try {
		$stmt = $db->prepare("SELECT ID_materia FROM Materia WHERE ID_materia = ? AND Usuarios_docente_ID_docente = ?");
		$stmt->execute([$materiaId, $docenteId]);
		$result = $stmt->fetch();
		return $result !== false;
	} catch (PDOException $e) {
		error_log("Error validando materia del docente: " . $e->getMessage());
		return false;
	}
}

function validarContenidoDeMateria($db, $contenidoId, $materiaId) {
	if (!$contenidoId || !$materiaId) {
		return false;
	}
	try {
		$stmt = $db->prepare("SELECT ID_contenido FROM Contenido WHERE ID_contenido = ? AND Materia_ID_materia = ?");
		$stmt->execute([$contenidoId, $materiaId]);
		return (bool)$stmt->fetch();
	} catch (PDOException $e) {
		error_log("Error validando contenido de la materia: " . $e->getMessage());
		return false;
	}
}

function createRecordatoriosForEvaluacion($db, $evaluacionId, $titulo, $fechaEvaluacion, $materiaId, $tipoEvaluacion) {
	try {
		// Convert evaluacion date to DateTime
		$fechaEval = new DateTime($fechaEvaluacion);
		$hoy = new DateTime();
		
		// Only create recordatorios if evaluacion is in the future
		if ($fechaEval <= $hoy) {
			return;
		}
		
		// Create recordatorios 1 day and 3 days before the evaluacion
		$diasAntes = [1, 3];
		
		foreach ($diasAntes as $dias) {
			$fechaRecordatorio = clone $fechaEval;
			$fechaRecordatorio->modify("-{$dias} days");
			
			// Only create if the reminder date is in the future
			if ($fechaRecordatorio <= $hoy) {
				continue;
			}
			
			$fechaRecordatorioStr = $fechaRecordatorio->format('Y-m-d');
			
			// Determine priority based on days before
			$prioridad = $dias == 1 ? 'ALTA' : 'MEDIA';
			
			// Determine recordatorio type based on evaluacion type
			$tipoRecordatorio = 'EXAMEN';
			if (in_array($tipoEvaluacion, ['TRABAJO_PRACTICO', 'PROYECTO'])) {
				$tipoRecordatorio = 'ENTREGA';
			}
			
			// Create description
			$descripcion = "Recordatorio: {$titulo} en {$dias} día" . ($dias > 1 ? 's' : '');
			
			// Check if recordatorio already exists
			$stmt = $db->prepare("
				SELECT ID_recordatorio FROM Recordatorio 
				WHERE Descripcion = ? AND Fecha = ? AND Materia_ID_materia = ? AND Tipo = ?
			");
			$stmt->execute([$descripcion, $fechaRecordatorioStr, $materiaId, $tipoRecordatorio]);
			
			if (!$stmt->fetch()) {
				// Insert new recordatorio
				$stmt = $db->prepare("
					INSERT INTO Recordatorio (Descripcion, Fecha, Tipo, Prioridad, Materia_ID_materia, Estado) 
					VALUES (?, ?, ?, ?, ?, 'PENDIENTE')
				");
				$stmt->execute([$descripcion, $fechaRecordatorioStr, $tipoRecordatorio, $prioridad, $materiaId]);
				error_log("Recordatorio creado automáticamente para evaluación ID: {$evaluacionId}, Fecha: {$fechaRecordatorioStr}");
			}
		}
	} catch (Exception $e) {
		error_log("Error creando recordatorios automáticos para evaluación: " . $e->getMessage());
		// Don't fail the evaluacion creation if recordatorio creation fails
	}
}

try {
	$db = pdo();
	$method = $_SERVER['REQUEST_METHOD'];
	$id = isset($_GET['id']) ? (int)$_GET['id'] : null;
	
	// Obtener ID del docente logueado (si existe)
	$docente_id = isset($_SESSION['user_id']) ? (int)$_SESSION['user_id'] : null;
	
	// Debug: Log para desarrollo (remover en producción)
	if (defined('APP_DEBUG') && APP_DEBUG) {
		error_log("Evaluacion API - Method: $method, Docente ID: " . ($docente_id ?? 'null'));
	}

	switch ($method) {
		case 'GET':
			// Filtros opcionales: ?id=, ?materiaId=, ?tipo=, ?estado=
			if ($id) {
				// Si hay docente logueado, verificar que la evaluación pertenece a una de sus materias
				if ($docente_id) {
					$stmt = $db->prepare("
						SELECT e.* FROM Evaluacion e
						INNER JOIN Materia m ON e.Materia_ID_materia = m.ID_materia
						WHERE e.ID_evaluacion = ? AND m.Usuarios_docente_ID_docente = ?
					");
					$stmt->execute([$id, $docente_id]);
				} else {
					$stmt = $db->prepare("SELECT * FROM Evaluacion WHERE ID_evaluacion = ?");
					$stmt->execute([$id]);
				}
				$row = $stmt->fetch();
				if (!$row) respond(404, ['success'=>false,'message'=>'Evaluación no encontrada']);
				respond(200, $row);
			}
			
			$where = [];
			$params = [];
			
			// Si hay docente logueado, filtrar solo evaluaciones de sus materias
			if ($docente_id) {
				$sql = "SELECT e.* FROM Evaluacion e
						INNER JOIN Materia m ON e.Materia_ID_materia = m.ID_materia
						WHERE m.Usuarios_docente_ID_docente = ?";
				$params[] = $docente_id;
				
				if (isset($_GET['materiaId'])) {
					$where[] = "e.Materia_ID_materia = ?";
					$params[] = (int)$_GET['materiaId'];
				}
				if (isset($_GET['tipo'])) {
					$where[] = "e.Tipo = ?";
					$params[] = $_GET['tipo'];
				}
				if (isset($_GET['estado'])) {
					$where[] = "e.Estado = ?";
					$params[] = $_GET['estado'];
				}
				
				if ($where) $sql .= " AND " . implode(' AND ', $where);
				$sql .= " ORDER BY e.Fecha DESC, e.ID_evaluacion DESC";
			} else {
				// Sin docente logueado, mostrar todas (para admin)
				if (isset($_GET['materiaId'])) {
					$where[] = "Materia_ID_materia = ?";
					$params[] = (int)$_GET['materiaId'];
				}
				if (isset($_GET['tipo'])) {
					$where[] = "Tipo = ?";
					$params[] = $_GET['tipo'];
				}
				if (isset($_GET['estado'])) {
					$where[] = "Estado = ?";
					$params[] = $_GET['estado'];
				}
				
				$sql = "SELECT * FROM Evaluacion";
				if ($where) $sql .= " WHERE " . implode(' AND ', $where);
				$sql .= " ORDER BY Fecha DESC, ID_evaluacion DESC";
			}
			
			$stmt = $db->prepare($sql);
			$stmt->execute($params);
			respond(200, $stmt->fetchAll());
		
		case 'POST':
			$body = readJson();
			
			// Debug: Log para desarrollo
			if (defined('APP_DEBUG') && APP_DEBUG) {
				error_log("POST Evaluacion - Body recibido: " . json_encode($body));
				error_log("POST Evaluacion - Docente ID: " . ($docente_id ?? 'null'));
			}
			
			// Validación mínima
			$required = ['Titulo', 'Fecha', 'Tipo', 'Materia_ID_materia', 'Contenido_ID_contenido'];
			foreach ($required as $k) {
				if (!isset($body[$k]) || $body[$k]==='') {
					respond(400, ['success'=>false,'message'=>"Falta campo requerido: $k", 'received'=>array_keys($body)]);
				}
			}
			
			$Titulo = trim($body['Titulo']);
			$Fecha = $body['Fecha'];
			$Tipo = $body['Tipo'];
			$Materia_ID_materia = (int)$body['Materia_ID_materia'];
			$Contenido_ID_contenido = isset($body['Contenido_ID_contenido']) ? (int)$body['Contenido_ID_contenido'] : 0;
			$Descripcion = isset($body['Descripcion']) && $body['Descripcion'] !== '' ? trim($body['Descripcion']) : null;
			$Peso = isset($body['Peso']) ? (float)$body['Peso'] : 1.00;
			$Estado = isset($body['Estado']) ? $body['Estado'] : 'PROGRAMADA';
			
			// Validar que los IDs sean válidos
			if ($Materia_ID_materia <= 0) {
				respond(400, ['success'=>false,'message'=>'ID de materia inválido']);
			}
			if ($Contenido_ID_contenido <= 0) {
				respond(400, ['success'=>false,'message'=>'Debe seleccionar un tema válido para la evaluación']);
			}
			
			// Validar que el título no esté vacío
			if (empty($Titulo)) {
				respond(400, ['success'=>false,'message'=>'El título no puede estar vacío']);
			}
			
			// Validar tipo
			$validTipos = ['EXAMEN', 'PARCIAL', 'TRABAJO_PRACTICO', 'PROYECTO', 'ORAL', 'PRACTICO'];
			if (!in_array($Tipo, $validTipos)) {
				respond(400, ['success'=>false,'message'=>'Tipo de evaluación inválido. Tipos válidos: ' . implode(', ', $validTipos)]);
			}
			
			// Validar estado
			$validEstados = ['PROGRAMADA', 'EN_CURSO', 'FINALIZADA', 'CANCELADA'];
			if (!in_array($Estado, $validEstados)) {
				$Estado = 'PROGRAMADA';
			}
			
			// Validar peso (entre 0.00 y 9.99)
			if ($Peso < 0 || $Peso > 9.99) {
				respond(400, ['success'=>false,'message'=>'El peso debe estar entre 0.00 y 9.99']);
			}
			
			// Validar formato de fecha
			if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $Fecha)) {
				respond(400, ['success'=>false,'message'=>'Formato de fecha inválido. Use YYYY-MM-DD']);
			}
			
			// Validar que la materia pertenezca al docente logueado (solo si hay docente logueado)
			if ($docente_id) {
				$materiaValida = validarMateriaDelDocente($db, $Materia_ID_materia, $docente_id);
				if (!$materiaValida) {
					// Log para debug
					error_log("Validación fallida - Materia ID: $Materia_ID_materia, Docente ID: $docente_id");
					respond(403, ['success'=>false,'message'=>'No tiene permiso para crear evaluaciones en esta materia. Materia ID: ' . $Materia_ID_materia . ', Docente ID: ' . $docente_id]);
				}
			} else {
				// Si no hay docente logueado, verificar que la materia exista
				$stmt = $db->prepare("SELECT ID_materia FROM Materia WHERE ID_materia = ?");
				$stmt->execute([$Materia_ID_materia]);
				if (!$stmt->fetch()) {
					respond(400, ['success'=>false,'message'=>'La materia especificada no existe']);
				}
			}
			
			// Validar que el contenido pertenezca a la materia seleccionada
			if (!validarContenidoDeMateria($db, $Contenido_ID_contenido, $Materia_ID_materia)) {
				respond(400, ['success'=>false,'message'=>'El tema seleccionado no pertenece a la materia indicada o no existe']);
			}
			
			try {
				$stmt = $db->prepare("INSERT INTO Evaluacion (Titulo, Descripcion, Fecha, Tipo, Peso, Materia_ID_materia, Contenido_ID_contenido, Estado) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
				$resultado = $stmt->execute([$Titulo, $Descripcion, $Fecha, $Tipo, $Peso, $Materia_ID_materia, $Contenido_ID_contenido, $Estado]);
				
				if (!$resultado) {
					respond(500, ['success'=>false,'message'=>'Error al ejecutar la consulta INSERT']);
				}
				
				$newId = (int)$db->lastInsertId();
				
				if ($newId > 0) {
					error_log("Evaluación creada exitosamente - ID: $newId, Materia: $Materia_ID_materia");
					
					// Create automatic recordatorios for this evaluacion
					createRecordatoriosForEvaluacion($db, $newId, $Titulo, $Fecha, $Materia_ID_materia, $Tipo);
					
					respond(201, ['success'=>true,'id'=>$newId,'message'=>'Evaluación creada exitosamente']);
				} else {
					error_log("Error: lastInsertId() retornó 0 o false");
					respond(500, ['success'=>false,'message'=>'Error al crear la evaluación. No se pudo obtener el ID generado.']);
				}
			} catch (PDOException $e) {
				error_log("Error PDO al insertar evaluación: " . $e->getMessage());
				respond(500, ['success'=>false,'message'=>'Error al insertar en la base de datos: ' . $e->getMessage()]);
			}

		case 'PUT':
			if (!$id) respond(400, ['success'=>false,'message'=>'Falta id']);
			
			// Validar que la evaluación pertenezca a una materia del docente logueado
			if ($docente_id) {
				$stmt = $db->prepare("
					SELECT e.ID_evaluacion FROM Evaluacion e
					INNER JOIN Materia m ON e.Materia_ID_materia = m.ID_materia
					WHERE e.ID_evaluacion = ? AND m.Usuarios_docente_ID_docente = ?
				");
				$stmt->execute([$id, $docente_id]);
				if (!$stmt->fetch()) {
					respond(403, ['success'=>false,'message'=>'No tiene permiso para modificar esta evaluación']);
				}
			}
			
			$body = readJson();
			
			// Campos actualizables
			$fields = ['Titulo', 'Descripcion', 'Fecha', 'Tipo', 'Peso', 'Estado', 'Contenido_ID_contenido'];
			$sets = [];
			$params = [];

			// Obtener datos actuales de la evaluación (incluye materia y contenido actual)
			$stmt = $db->prepare("SELECT Titulo, Fecha, Tipo, Materia_ID_materia, Contenido_ID_contenido FROM Evaluacion WHERE ID_evaluacion = ?");
			$stmt->execute([$id]);
			$currentEval = $stmt->fetch();
			
			if (!$currentEval) {
				respond(404, ['success'=>false,'message'=>'Evaluación no encontrada']);
			}
			
			foreach ($fields as $f) {
				if (array_key_exists($f, $body)) {
					if ($f === 'Descripcion') {
						$sets[] = "$f = ?";
						$params[] = $body[$f] === '' ? null : trim($body[$f]);
					} else if ($f === 'Titulo') {
						$sets[] = "$f = ?";
						$params[] = trim($body[$f]);
					} else if ($f === 'Fecha') {
						// Validar formato de fecha
						if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $body[$f])) {
							respond(400, ['success'=>false,'message'=>'Formato de fecha inválido. Use YYYY-MM-DD']);
						}
						$sets[] = "$f = ?";
						$params[] = $body[$f];
					} else if ($f === 'Tipo') {
						$validTipos = ['EXAMEN', 'PARCIAL', 'TRABAJO_PRACTICO', 'PROYECTO', 'ORAL', 'PRACTICO'];
						if (!in_array($body[$f], $validTipos)) {
							respond(400, ['success'=>false,'message'=>'Tipo de evaluación inválido']);
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
					} else if ($f === 'Estado') {
						$validEstados = ['PROGRAMADA', 'EN_CURSO', 'FINALIZADA', 'CANCELADA'];
						if (!in_array($body[$f], $validEstados)) {
							respond(400, ['success'=>false,'message'=>'Estado inválido']);
						}
						$sets[] = "$f = ?";
						$params[] = $body[$f];
					} else if ($f === 'Contenido_ID_contenido') {
						if ($body[$f] === null || $body[$f] === '') {
							respond(400, ['success'=>false,'message'=>'Debe seleccionar un tema válido para la evaluación']);
						}
						$contenidoId = (int)$body[$f];
						if ($contenidoId <= 0) {
							respond(400, ['success'=>false,'message'=>'Debe seleccionar un tema válido para la evaluación']);
						}
						if (!validarContenidoDeMateria($db, $contenidoId, $currentEval['Materia_ID_materia'])) {
							respond(400, ['success'=>false,'message'=>'El tema seleccionado no pertenece a la materia indicada o no existe']);
						}
						$sets[] = "$f = ?";
						$params[] = $contenidoId;
					} else {
						$sets[] = "$f = ?";
						$params[] = $body[$f];
					}
				}
			}
			
			if (!$sets) respond(400, ['success'=>false,'message'=>'Nada para actualizar']);
			
			$params[] = $id;
			$sql = "UPDATE Evaluacion SET ".implode(', ', $sets)." WHERE ID_evaluacion = ?";
			$stmt = $db->prepare($sql);
			$stmt->execute($params);
			
			// If fecha or titulo changed, update/create recordatorios
			if (isset($body['Fecha']) || isset($body['Titulo'])) {
				$newFecha = isset($body['Fecha']) ? $body['Fecha'] : $currentEval['Fecha'];
				$newTitulo = isset($body['Titulo']) ? trim($body['Titulo']) : $currentEval['Titulo'];
				$newTipo = isset($body['Tipo']) ? $body['Tipo'] : $currentEval['Tipo'];
				
				// Delete old recordatorios for this evaluacion and create new ones
				$stmt = $db->prepare("
					DELETE FROM Recordatorio 
					WHERE Materia_ID_materia = ? AND Descripcion LIKE ? AND Tipo IN ('EXAMEN', 'ENTREGA')
				");
				$stmt->execute([$currentEval['Materia_ID_materia'], "%{$currentEval['Titulo']}%"]);
				
				// Create new recordatorios
				createRecordatoriosForEvaluacion($db, $id, $newTitulo, $newFecha, $currentEval['Materia_ID_materia'], $newTipo);
			}
			
			respond(200, ['success'=>true,'id'=>$id,'message'=>'Evaluación actualizada exitosamente']);

		case 'DELETE':
			if (!$id) respond(400, ['success'=>false,'message'=>'Falta id']);
			
			// Validar que la evaluación pertenezca a una materia del docente logueado
			if ($docente_id) {
				$stmt = $db->prepare("
					SELECT e.ID_evaluacion FROM Evaluacion e
					INNER JOIN Materia m ON e.Materia_ID_materia = m.ID_materia
					WHERE e.ID_evaluacion = ? AND m.Usuarios_docente_ID_docente = ?
				");
				$stmt->execute([$id, $docente_id]);
				if (!$stmt->fetch()) {
					respond(403, ['success'=>false,'message'=>'No tiene permiso para eliminar esta evaluación']);
				}
			}
			
			// Verificar si tiene notas asociadas (opcional: prevenir eliminación si hay notas)
			$stmt = $db->prepare("SELECT COUNT(*) as total FROM Notas WHERE Evaluacion_ID_evaluacion = ?");
			$stmt->execute([$id]);
			$tieneNotas = $stmt->fetch()['total'] > 0;
			
			if ($tieneNotas) {
				// Opción 1: No permitir eliminación si hay notas
				respond(409, ['success'=>false,'message'=>'No se puede eliminar la evaluación porque tiene notas asociadas']);
				
				// Opción 2: Eliminar en cascada (descomentar si se prefiere)
				// $stmt = $db->prepare("DELETE FROM Notas WHERE Evaluacion_ID_evaluacion = ?");
				// $stmt->execute([$id]);
			}
			
			$stmt = $db->prepare("DELETE FROM Evaluacion WHERE ID_evaluacion = ?");
			$stmt->execute([$id]);
			respond(200, ['success'=>true,'message'=>'Evaluación eliminada exitosamente']);

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

