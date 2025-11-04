<?php
// C:\xampp\htdocs\utnproject\api\recordatorio.php
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

function respond($code, $data) { http_response_code($code); echo json_encode($data, JSON_UNESCAPED_UNICODE); exit; }

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

try {
	$db = pdo();
	$method = $_SERVER['REQUEST_METHOD'];
	$id = isset($_GET['id']) ? (int)$_GET['id'] : null;
	
	// Obtener ID del docente logueado (si existe)
	$docente_id = isset($_SESSION['user_id']) ? (int)$_SESSION['user_id'] : null;
	
	switch ($method) {
		case 'GET':
			// Filtros opcionales: ?id=, ?materiaId=, ?tipo=, ?estado=, ?prioridad=
			if ($id) {
				// Si hay docente logueado, verificar que el recordatorio pertenece a una de sus materias
				if ($docente_id) {
					$stmt = $db->prepare("
						SELECT r.* FROM Recordatorio r
						INNER JOIN Materia m ON r.Materia_ID_materia = m.ID_materia
						WHERE r.ID_recordatorio = ? AND m.Usuarios_docente_ID_docente = ?
					");
					$stmt->execute([$id, $docente_id]);
				} else {
					$stmt = $db->prepare("SELECT * FROM Recordatorio WHERE ID_recordatorio = ?");
					$stmt->execute([$id]);
				}
				$row = $stmt->fetch();
				if (!$row) respond(404, ['success'=>false,'message'=>'Recordatorio no encontrado']);
				respond(200, $row);
			}
			
			$where = [];
			$params = [];
			
			// Si hay docente logueado, filtrar solo recordatorios de sus materias
			if ($docente_id) {
				$sql = "SELECT r.* FROM Recordatorio r
						INNER JOIN Materia m ON r.Materia_ID_materia = m.ID_materia
						WHERE m.Usuarios_docente_ID_docente = ?";
				$params[] = $docente_id;
				
				if (isset($_GET['materiaId'])) {
					$where[] = "r.Materia_ID_materia = ?";
					$params[] = (int)$_GET['materiaId'];
				}
				if (isset($_GET['tipo'])) {
					$where[] = "r.Tipo = ?";
					$params[] = $_GET['tipo'];
				}
				if (isset($_GET['estado'])) {
					$where[] = "r.Estado = ?";
					$params[] = $_GET['estado'];
				}
				if (isset($_GET['prioridad'])) {
					$where[] = "r.Prioridad = ?";
					$params[] = $_GET['prioridad'];
				}
				
				if ($where) $sql .= " AND " . implode(' AND ', $where);
				$sql .= " ORDER BY r.Fecha ASC, r.Prioridad DESC, r.ID_recordatorio DESC";
			} else {
				// Sin docente logueado, mostrar todos (para admin)
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
				if (isset($_GET['prioridad'])) {
					$where[] = "Prioridad = ?";
					$params[] = $_GET['prioridad'];
				}
				
				$sql = "SELECT * FROM Recordatorio";
				if ($where) $sql .= " WHERE " . implode(' AND ', $where);
				$sql .= " ORDER BY Fecha ASC, Prioridad DESC, ID_recordatorio DESC";
			}
			
			$stmt = $db->prepare($sql);
			$stmt->execute($params);
			respond(200, $stmt->fetchAll());
		
		case 'POST':
			$body = readJson();
			
			// Validación mínima
			$required = ['Descripcion', 'Fecha', 'Tipo', 'Materia_ID_materia'];
			foreach ($required as $k) {
				if (!isset($body[$k]) || $body[$k]==='') {
					respond(400, ['success'=>false,'message'=>"Falta campo requerido: $k", 'received'=>array_keys($body)]);
				}
			}
			
			$Descripcion = trim($body['Descripcion']);
			$Fecha = $body['Fecha'];
			$Tipo = $body['Tipo'];
			$Materia_ID_materia = (int)$body['Materia_ID_materia'];
			$Prioridad = isset($body['Prioridad']) ? $body['Prioridad'] : 'MEDIA';
			$Estado = isset($body['Estado']) ? $body['Estado'] : 'PENDIENTE';
			
			// Validar que los IDs sean válidos
			if ($Materia_ID_materia <= 0) {
				respond(400, ['success'=>false,'message'=>'ID de materia inválido']);
			}
			
			// Validar que la descripción no esté vacía
			if (empty($Descripcion)) {
				respond(400, ['success'=>false,'message'=>'La descripción no puede estar vacía']);
			}
			
			// Validar tipo
			$validTipos = ['EXAMEN', 'ENTREGA', 'REUNION', 'CLASE', 'EVENTO'];
			if (!in_array($Tipo, $validTipos)) {
				respond(400, ['success'=>false,'message'=>'Tipo de recordatorio inválido. Tipos válidos: ' . implode(', ', $validTipos)]);
			}
			
			// Validar prioridad
			$validPrioridades = ['ALTA', 'MEDIA', 'BAJA'];
			if (!in_array($Prioridad, $validPrioridades)) {
				$Prioridad = 'MEDIA';
			}
			
			// Validar estado
			$validEstados = ['PENDIENTE', 'COMPLETADO', 'CANCELADO'];
			if (!in_array($Estado, $validEstados)) {
				$Estado = 'PENDIENTE';
			}
			
			// Validar formato de fecha
			if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $Fecha)) {
				respond(400, ['success'=>false,'message'=>'Formato de fecha inválido. Use YYYY-MM-DD']);
			}
			
			// Validar que la materia pertenezca al docente logueado (solo si hay docente logueado)
			if ($docente_id) {
				$materiaValida = validarMateriaDelDocente($db, $Materia_ID_materia, $docente_id);
				if (!$materiaValida) {
					respond(403, ['success'=>false,'message'=>'No tiene permiso para crear recordatorios en esta materia.']);
				}
			} else {
				// Si no hay docente logueado, verificar que la materia exista
				$stmt = $db->prepare("SELECT ID_materia FROM Materia WHERE ID_materia = ?");
				$stmt->execute([$Materia_ID_materia]);
				if (!$stmt->fetch()) {
					respond(400, ['success'=>false,'message'=>'La materia especificada no existe']);
				}
			}
			
			// Verificar si ya existe un recordatorio similar para evitar duplicados
			$stmt = $db->prepare("
				SELECT ID_recordatorio FROM Recordatorio 
				WHERE Descripcion = ? AND Fecha = ? AND Materia_ID_materia = ? AND Tipo = ?
			");
			$stmt->execute([$Descripcion, $Fecha, $Materia_ID_materia, $Tipo]);
			if ($stmt->fetch()) {
				respond(409, ['success'=>false,'message'=>'Ya existe un recordatorio similar para esta fecha y materia']);
			}
			
			try {
				$stmt = $db->prepare("INSERT INTO Recordatorio (Descripcion, Fecha, Tipo, Prioridad, Materia_ID_materia, Estado) VALUES (?, ?, ?, ?, ?, ?)");
				$resultado = $stmt->execute([$Descripcion, $Fecha, $Tipo, $Prioridad, $Materia_ID_materia, $Estado]);
				
				if (!$resultado) {
					respond(500, ['success'=>false,'message'=>'Error al ejecutar la consulta INSERT']);
				}
				
				$newId = (int)$db->lastInsertId();
				
				if ($newId > 0) {
					error_log("Recordatorio creado exitosamente - ID: $newId, Materia: $Materia_ID_materia");
					respond(201, ['success'=>true,'id'=>$newId,'message'=>'Recordatorio creado exitosamente']);
				} else {
					error_log("Error: lastInsertId() retornó 0 o false");
					respond(500, ['success'=>false,'message'=>'Error al crear el recordatorio. No se pudo obtener el ID generado.']);
				}
			} catch (PDOException $e) {
				error_log("Error PDO al insertar recordatorio: " . $e->getMessage());
				respond(500, ['success'=>false,'message'=>'Error al insertar en la base de datos: ' . $e->getMessage()]);
			}

		case 'PUT':
			if (!$id) respond(400, ['success'=>false,'message'=>'Falta id']);
			
			// Validar que el recordatorio pertenezca a una materia del docente logueado
			if ($docente_id) {
				$stmt = $db->prepare("
					SELECT r.ID_recordatorio FROM Recordatorio r
					INNER JOIN Materia m ON r.Materia_ID_materia = m.ID_materia
					WHERE r.ID_recordatorio = ? AND m.Usuarios_docente_ID_docente = ?
				");
				$stmt->execute([$id, $docente_id]);
				if (!$stmt->fetch()) {
					respond(403, ['success'=>false,'message'=>'No tiene permiso para modificar este recordatorio']);
				}
			}
			
			$body = readJson();
			
			// Campos actualizables
			$fields = ['Descripcion', 'Fecha', 'Tipo', 'Prioridad', 'Estado'];
			$sets = [];
			$params = [];
			
			foreach ($fields as $f) {
				if (array_key_exists($f, $body)) {
					if ($f === 'Descripcion') {
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
						$validTipos = ['EXAMEN', 'ENTREGA', 'REUNION', 'CLASE', 'EVENTO'];
						if (!in_array($body[$f], $validTipos)) {
							respond(400, ['success'=>false,'message'=>'Tipo de recordatorio inválido']);
						}
						$sets[] = "$f = ?";
						$params[] = $body[$f];
					} else if ($f === 'Prioridad') {
						$validPrioridades = ['ALTA', 'MEDIA', 'BAJA'];
						if (!in_array($body[$f], $validPrioridades)) {
							respond(400, ['success'=>false,'message'=>'Prioridad inválida']);
						}
						$sets[] = "$f = ?";
						$params[] = $body[$f];
					} else if ($f === 'Estado') {
						$validEstados = ['PENDIENTE', 'COMPLETADO', 'CANCELADO'];
						if (!in_array($body[$f], $validEstados)) {
							respond(400, ['success'=>false,'message'=>'Estado inválido']);
						}
						$sets[] = "$f = ?";
						$params[] = $body[$f];
					} else {
						$sets[] = "$f = ?";
						$params[] = $body[$f];
					}
				}
			}
			
			if (!$sets) respond(400, ['success'=>false,'message'=>'Nada para actualizar']);
			
			$params[] = $id;
			$sql = "UPDATE Recordatorio SET ".implode(', ', $sets)." WHERE ID_recordatorio = ?";
			$stmt = $db->prepare($sql);
			$stmt->execute($params);
			respond(200, ['success'=>true,'id'=>$id,'message'=>'Recordatorio actualizado exitosamente']);

		case 'DELETE':
			if (!$id) respond(400, ['success'=>false,'message'=>'Falta id']);
			
			// Validar que el recordatorio pertenezca a una materia del docente logueado
			if ($docente_id) {
				$stmt = $db->prepare("
					SELECT r.ID_recordatorio FROM Recordatorio r
					INNER JOIN Materia m ON r.Materia_ID_materia = m.ID_materia
					WHERE r.ID_recordatorio = ? AND m.Usuarios_docente_ID_docente = ?
				");
				$stmt->execute([$id, $docente_id]);
				if (!$stmt->fetch()) {
					respond(403, ['success'=>false,'message'=>'No tiene permiso para eliminar este recordatorio']);
				}
			}
			
			$stmt = $db->prepare("DELETE FROM Recordatorio WHERE ID_recordatorio = ?");
			$stmt->execute([$id]);
			respond(200, ['success'=>true,'message'=>'Recordatorio eliminado exitosamente']);

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

