<?php
// C:\xampp\htdocs\utnproject\api\tema_estudiante.php
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

function validarContenidoDelDocente($db, $contenidoId, $docenteId) {
	if (!$docenteId) return true; // Sin docente, permitir (admin)
	$stmt = $db->prepare("
		SELECT c.ID_contenido FROM Contenido c
		INNER JOIN Materia m ON c.Materia_ID_materia = m.ID_materia
		WHERE c.ID_contenido = ? AND m.Usuarios_docente_ID_docente = ?
	");
	$stmt->execute([$contenidoId, $docenteId]);
	return $stmt->fetch() !== false;
}

try {
	$db = pdo();
	$method = $_SERVER['REQUEST_METHOD'];
	$id = isset($_GET['id']) ? (int)$_GET['id'] : null;
	
	// Obtener ID del docente logueado (si existe)
	$docente_id = $_SESSION['user_id'] ?? null;

	switch ($method) {
		case 'GET':
			// Filtros opcionales: ?id=, ?contenidoId=, ?estudianteId=
			if ($id) {
				// Si hay docente logueado, verificar que el tema pertenece a una de sus materias
				if ($docente_id) {
					$stmt = $db->prepare("
						SELECT te.* FROM Tema_estudiante te
						INNER JOIN Contenido c ON te.Contenido_ID_contenido = c.ID_contenido
						INNER JOIN Materia m ON c.Materia_ID_materia = m.ID_materia
						WHERE te.ID_Tema_estudiante = ? AND m.Usuarios_docente_ID_docente = ?
					");
					$stmt->execute([$id, $docente_id]);
				} else {
					$stmt = $db->prepare("SELECT * FROM Tema_estudiante WHERE ID_Tema_estudiante = ?");
					$stmt->execute([$id]);
				}
				$row = $stmt->fetch();
				if (!$row) respond(404, ['success'=>false,'message'=>'Registro no encontrado']);
				respond(200, $row);
			}
			$where = [];
			$params = [];
			
			// Si hay docente logueado, filtrar solo temas de estudiantes en sus materias
			if ($docente_id) {
				$sql = "SELECT te.* FROM Tema_estudiante te
						INNER JOIN Contenido c ON te.Contenido_ID_contenido = c.ID_contenido
						INNER JOIN Materia m ON c.Materia_ID_materia = m.ID_materia
						WHERE m.Usuarios_docente_ID_docente = ?";
				$params[] = $docente_id;
				
				if (isset($_GET['contenidoId'])) { 
					$where[] = "te.Contenido_ID_contenido = ?"; 
					$params[] = (int)$_GET['contenidoId']; 
				}
				if (isset($_GET['estudianteId'])) { 
					$where[] = "te.Estudiante_ID_Estudiante = ?"; 
					$params[] = (int)$_GET['estudianteId']; 
				}
				
				if ($where) $sql .= " AND " . implode(' AND ', $where);
				$sql .= " ORDER BY te.Fecha_actualizacion DESC, te.ID_Tema_estudiante DESC";
			} else {
				// Sin docente logueado, mostrar todos (para admin)
				if (isset($_GET['contenidoId'])) { 
					$where[] = "Contenido_ID_contenido = ?"; 
					$params[] = (int)$_GET['contenidoId']; 
				}
				if (isset($_GET['estudianteId'])) { 
					$where[] = "Estudiante_ID_Estudiante = ?"; 
					$params[] = (int)$_GET['estudianteId']; 
				}
				$sql = "SELECT * FROM Tema_estudiante";
				if ($where) $sql .= " WHERE " . implode(' AND ', $where);
				$sql .= " ORDER BY Fecha_actualizacion DESC, ID_Tema_estudiante DESC";
			}
			$stmt = $db->prepare($sql);
			$stmt->execute($params);
			respond(200, $stmt->fetchAll());
		
		case 'POST':
			$body = readJson();
			// Validación mínima
			$required = ['Contenido_ID_contenido','Estudiante_ID_Estudiante'];
			foreach ($required as $k) {
				if (!isset($body[$k]) || $body[$k]==='') respond(400, ['success'=>false,'message'=>"Falta campo: $k"]);
			}
			$Contenido_ID_contenido = (int)$body['Contenido_ID_contenido'];
			$Estudiante_ID_Estudiante = (int)$body['Estudiante_ID_Estudiante'];
			$Estado = isset($body['Estado']) ? $body['Estado'] : 'PENDIENTE';
			$Observaciones = isset($body['Observaciones']) && $body['Observaciones'] !== '' ? trim($body['Observaciones']) : null;

			// Validar que los IDs sean válidos
			if ($Contenido_ID_contenido <= 0 || $Estudiante_ID_Estudiante <= 0) {
				respond(400, ['success'=>false,'message'=>'IDs inválidos']);
			}

			// Validar que el contenido pertenezca a una materia del docente logueado
			if (!validarContenidoDelDocente($db, $Contenido_ID_contenido, $docente_id)) {
				respond(403, ['success'=>false,'message'=>'No tiene permiso para asignar este contenido']);
			}

			// Validar estado
			$validEstados = ['PENDIENTE', 'EN_PROGRESO', 'COMPLETADO', 'CANCELADO'];
			if (!in_array($Estado, $validEstados)) {
				$Estado = 'PENDIENTE';
			}

			// Verificar si ya existe un registro para este contenido y estudiante
			$stmt = $db->prepare("SELECT ID_Tema_estudiante FROM Tema_estudiante WHERE Contenido_ID_contenido = ? AND Estudiante_ID_Estudiante = ?");
			$stmt->execute([$Contenido_ID_contenido, $Estudiante_ID_Estudiante]);
			$existing = $stmt->fetch();
			
			if ($existing) {
				respond(409, ['success'=>false,'message'=>'Este estudiante ya está asignado a este contenido']);
			}

			$stmt = $db->prepare("INSERT INTO Tema_estudiante (Contenido_ID_contenido, Estudiante_ID_Estudiante, Estado, Observaciones) VALUES (?, ?, ?, ?)");
			$stmt->execute([$Contenido_ID_contenido, $Estudiante_ID_Estudiante, $Estado, $Observaciones]);
			$newId = (int)$db->lastInsertId();
			respond(201, ['success'=>true,'id'=>$newId]);

		case 'PUT':
			if (!$id) respond(400, ['success'=>false,'message'=>'Falta id']);
			
			// Validar que el tema pertenezca a una materia del docente logueado
			if ($docente_id) {
				$stmt = $db->prepare("
					SELECT te.ID_Tema_estudiante FROM Tema_estudiante te
					INNER JOIN Contenido c ON te.Contenido_ID_contenido = c.ID_contenido
					INNER JOIN Materia m ON c.Materia_ID_materia = m.ID_materia
					WHERE te.ID_Tema_estudiante = ? AND m.Usuarios_docente_ID_docente = ?
				");
				$stmt->execute([$id, $docente_id]);
				if (!$stmt->fetch()) {
					respond(403, ['success'=>false,'message'=>'No tiene permiso para modificar este registro']);
				}
			}
			
			$body = readJson();
			// Campos actualizables
			$fields = ['Estado','Observaciones'];
			$sets = [];
			$params = [];
			
			// Validar estado si viene en el body
			if (isset($body['Estado'])) {
				$validEstados = ['PENDIENTE', 'EN_PROGRESO', 'COMPLETADO', 'CANCELADO'];
				if (in_array($body['Estado'], $validEstados)) {
					$sets[] = "Estado = ?";
					$params[] = $body['Estado'];
				} else {
					respond(400, ['success'=>false,'message'=>'Estado inválido. Debe ser: PENDIENTE, EN_PROGRESO, COMPLETADO o CANCELADO']);
				}
			}
			
			foreach ($fields as $f) {
				if (array_key_exists($f, $body) && $f !== 'Estado') {
					if ($f === 'Observaciones') {
						$sets[] = "$f = ?";
						$params[] = $body[$f] === '' ? null : trim($body[$f]);
					}
				}
			}
			if (!$sets) respond(400, ['success'=>false,'message'=>'Nada para actualizar']);
			
			// Agregar fecha de actualización
			$sets[] = "Fecha_actualizacion = CURRENT_DATE";
			$params[] = $id;
			$sql = "UPDATE Tema_estudiante SET ".implode(', ', $sets)." WHERE ID_Tema_estudiante = ?";
			$stmt = $db->prepare($sql);
			$stmt->execute($params);
			respond(200, ['success'=>true,'id'=>$id]);

		case 'DELETE':
			if (!$id) respond(400, ['success'=>false,'message'=>'Falta id']);
			
			// Validar que el tema pertenezca a una materia del docente logueado
			if ($docente_id) {
				$stmt = $db->prepare("
					SELECT te.ID_Tema_estudiante FROM Tema_estudiante te
					INNER JOIN Contenido c ON te.Contenido_ID_contenido = c.ID_contenido
					INNER JOIN Materia m ON c.Materia_ID_materia = m.ID_materia
					WHERE te.ID_Tema_estudiante = ? AND m.Usuarios_docente_ID_docente = ?
				");
				$stmt->execute([$id, $docente_id]);
				if (!$stmt->fetch()) {
					respond(403, ['success'=>false,'message'=>'No tiene permiso para eliminar este registro']);
				}
			}
			
			$stmt = $db->prepare("DELETE FROM Tema_estudiante WHERE ID_Tema_estudiante = ?");
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

