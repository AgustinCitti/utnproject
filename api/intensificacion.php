<?php
// C:\xampp\htdocs\utnproject\api\intensificacion.php
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
	$stmt = $db->prepare("
		SELECT ID_materia FROM Materia
		WHERE ID_materia = ? AND Usuarios_docente_ID_docente = ?
	");
	$stmt->execute([$materiaId, $docenteId]);
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
			// Filtros opcionales: ?id=, ?contenidoId=, ?estudianteId=, ?materiaId=
			if ($id) {
				// Si hay docente logueado, verificar que la intensificación pertenece a una de sus materias
				if ($docente_id) {
					$stmt = $db->prepare("
						SELECT i.* FROM Intensificacion i
						INNER JOIN Materia m ON i.Materia_ID_materia = m.ID_materia
						WHERE i.ID_intensificacion = ? AND m.Usuarios_docente_ID_docente = ?
					");
					$stmt->execute([$id, $docente_id]);
				} else {
					$stmt = $db->prepare("SELECT * FROM Intensificacion WHERE ID_intensificacion = ?");
					$stmt->execute([$id]);
				}
				$row = $stmt->fetch();
				if (!$row) respond(404, ['success'=>false,'message'=>'Registro no encontrado']);
				respond(200, $row);
			}
			$where = [];
			$params = [];
			
			// Si hay docente logueado, filtrar solo intensificaciones de sus materias
			if ($docente_id) {
				$sql = "SELECT i.* FROM Intensificacion i
						INNER JOIN Materia m ON i.Materia_ID_materia = m.ID_materia
						WHERE m.Usuarios_docente_ID_docente = ?";
				$params[] = $docente_id;
				
				if (isset($_GET['contenidoId'])) { 
					$where[] = "i.Contenido_ID_contenido = ?"; 
					$params[] = (int)$_GET['contenidoId']; 
				}
				if (isset($_GET['estudianteId'])) { 
					$where[] = "i.Estudiante_ID_Estudiante = ?"; 
					$params[] = (int)$_GET['estudianteId']; 
				}
				if (isset($_GET['materiaId'])) { 
					$where[] = "i.Materia_ID_materia = ?"; 
					$params[] = (int)$_GET['materiaId']; 
				}
				
				if ($where) $sql .= " AND " . implode(' AND ', $where);
				$sql .= " ORDER BY i.Fecha_asignacion DESC, i.ID_intensificacion DESC";
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
				if (isset($_GET['materiaId'])) { 
					$where[] = "Materia_ID_materia = ?"; 
					$params[] = (int)$_GET['materiaId']; 
				}
				$sql = "SELECT * FROM Intensificacion";
				if ($where) $sql .= " WHERE " . implode(' AND ', $where);
				$sql .= " ORDER BY Fecha_asignacion DESC, ID_intensificacion DESC";
			}
			$stmt = $db->prepare($sql);
			$stmt->execute($params);
			respond(200, $stmt->fetchAll());
		
		case 'POST':
			$body = readJson();
			// Validación mínima
			$required = ['Estudiante_ID_Estudiante', 'Materia_ID_materia'];
			foreach ($required as $k) {
				if (!isset($body[$k]) || $body[$k]==='') respond(400, ['success'=>false,'message'=>"Falta campo: $k"]);
			}
			$Estudiante_ID_Estudiante = (int)$body['Estudiante_ID_Estudiante'];
			$Materia_ID_materia = (int)$body['Materia_ID_materia'];
			$Contenido_ID_contenido = isset($body['Contenido_ID_contenido']) && $body['Contenido_ID_contenido'] !== '' ? (int)$body['Contenido_ID_contenido'] : null;
			$Estado = isset($body['Estado']) ? $body['Estado'] : 'PENDIENTE';
			$Nota_objetivo = isset($body['Nota_objetivo']) && $body['Nota_objetivo'] !== '' ? (float)$body['Nota_objetivo'] : 6.00;
			$Nota_obtenida = isset($body['Nota_obtenida']) && $body['Nota_obtenida'] !== '' ? (float)$body['Nota_obtenida'] : null;
			$Fecha_asignacion = isset($body['Fecha_asignacion']) && $body['Fecha_asignacion'] !== '' ? $body['Fecha_asignacion'] : date('Y-m-d');
			$Fecha_resolucion = isset($body['Fecha_resolucion']) && $body['Fecha_resolucion'] !== '' ? $body['Fecha_resolucion'] : null;
			$Observaciones = isset($body['Observaciones']) && $body['Observaciones'] !== '' ? trim($body['Observaciones']) : null;

			// Validar que los IDs sean válidos
			if ($Estudiante_ID_Estudiante <= 0 || $Materia_ID_materia <= 0) {
				respond(400, ['success'=>false,'message'=>'IDs inválidos']);
			}

			// Validar que la materia pertenezca al docente logueado
			if (!validarMateriaDelDocente($db, $Materia_ID_materia, $docente_id)) {
				respond(403, ['success'=>false,'message'=>'No tiene permiso para asignar esta intensificación']);
			}

			// Validar estado
			$validEstados = ['PENDIENTE', 'EN_CURSO', 'APROBADO', 'NO_APROBADO'];
			if (!in_array($Estado, $validEstados)) {
				$Estado = 'PENDIENTE';
			}

			// Validar nota objetivo (debe estar entre 0 y 10)
			if ($Nota_objetivo < 0 || $Nota_objetivo > 10) {
				respond(400, ['success'=>false,'message'=>'Nota objetivo debe estar entre 0 y 10']);
			}

			// Validar nota obtenida si está presente
			if ($Nota_obtenida !== null && ($Nota_obtenida < 0 || $Nota_obtenida > 10)) {
				respond(400, ['success'=>false,'message'=>'Nota obtenida debe estar entre 0 y 10']);
			}

			// Verificar si ya existe un registro para esta combinación única
			$stmt = $db->prepare("
				SELECT ID_intensificacion FROM Intensificacion 
				WHERE Estudiante_ID_Estudiante = ? 
				AND Materia_ID_materia = ? 
				AND (Contenido_ID_contenido = ? OR (Contenido_ID_contenido IS NULL AND ? IS NULL))
			");
			$stmt->execute([$Estudiante_ID_Estudiante, $Materia_ID_materia, $Contenido_ID_contenido, $Contenido_ID_contenido]);
			$existing = $stmt->fetch();
			
			if ($existing) {
				respond(409, ['success'=>false,'message'=>'Ya existe una intensificación para esta combinación']);
			}

			$stmt = $db->prepare("
				INSERT INTO Intensificacion 
				(Estudiante_ID_Estudiante, Materia_ID_materia, Contenido_ID_contenido, Estado, Nota_objetivo, Nota_obtenida, Fecha_asignacion, Fecha_resolucion, Observaciones) 
				VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
			");
			$stmt->execute([
				$Estudiante_ID_Estudiante, 
				$Materia_ID_materia, 
				$Contenido_ID_contenido, 
				$Estado, 
				$Nota_objetivo, 
				$Nota_obtenida, 
				$Fecha_asignacion, 
				$Fecha_resolucion, 
				$Observaciones
			]);
			$newId = (int)$db->lastInsertId();
			respond(201, ['success'=>true,'id'=>$newId]);

		case 'PUT':
			if (!$id) respond(400, ['success'=>false,'message'=>'Falta id']);
			
			// Validar que la intensificación pertenezca a una materia del docente logueado
			if ($docente_id) {
				$stmt = $db->prepare("
					SELECT i.ID_intensificacion FROM Intensificacion i
					INNER JOIN Materia m ON i.Materia_ID_materia = m.ID_materia
					WHERE i.ID_intensificacion = ? AND m.Usuarios_docente_ID_docente = ?
				");
				$stmt->execute([$id, $docente_id]);
				if (!$stmt->fetch()) {
					respond(403, ['success'=>false,'message'=>'No tiene permiso para modificar este registro']);
				}
			}
			
			$body = readJson();
			// Campos actualizables
			$sets = [];
			$params = [];
			
			// Validar estado si viene en el body
			if (isset($body['Estado'])) {
				$validEstados = ['PENDIENTE', 'EN_CURSO', 'APROBADO', 'NO_APROBADO'];
				if (in_array($body['Estado'], $validEstados)) {
					$sets[] = "Estado = ?";
					$params[] = $body['Estado'];
				} else {
					respond(400, ['success'=>false,'message'=>'Estado inválido. Debe ser: PENDIENTE, EN_CURSO, APROBADO o NO_APROBADO']);
				}
			}
			
			// Actualizar Contenido_ID_contenido si viene
			if (array_key_exists('Contenido_ID_contenido', $body)) {
				$sets[] = "Contenido_ID_contenido = ?";
				$params[] = $body['Contenido_ID_contenido'] === '' || $body['Contenido_ID_contenido'] === null ? null : (int)$body['Contenido_ID_contenido'];
			}
			
			// Actualizar Nota_objetivo si viene
			if (array_key_exists('Nota_objetivo', $body) && $body['Nota_objetivo'] !== '') {
				$notaObj = (float)$body['Nota_objetivo'];
				if ($notaObj < 0 || $notaObj > 10) {
					respond(400, ['success'=>false,'message'=>'Nota objetivo debe estar entre 0 y 10']);
				}
				$sets[] = "Nota_objetivo = ?";
				$params[] = $notaObj;
			}
			
			// Actualizar Nota_obtenida si viene
			if (array_key_exists('Nota_obtenida', $body)) {
				if ($body['Nota_obtenida'] === '' || $body['Nota_obtenida'] === null) {
					$sets[] = "Nota_obtenida = NULL";
				} else {
					$notaObt = (float)$body['Nota_obtenida'];
					if ($notaObt < 0 || $notaObt > 10) {
						respond(400, ['success'=>false,'message'=>'Nota obtenida debe estar entre 0 y 10']);
					}
					$sets[] = "Nota_obtenida = ?";
					$params[] = $notaObt;
				}
			}
			
			// Actualizar Fecha_asignacion si viene
			if (array_key_exists('Fecha_asignacion', $body) && $body['Fecha_asignacion'] !== '') {
				$sets[] = "Fecha_asignacion = ?";
				$params[] = $body['Fecha_asignacion'];
			}
			
			// Actualizar Fecha_resolucion si viene
			if (array_key_exists('Fecha_resolucion', $body)) {
				if ($body['Fecha_resolucion'] === '' || $body['Fecha_resolucion'] === null) {
					$sets[] = "Fecha_resolucion = NULL";
				} else {
					$sets[] = "Fecha_resolucion = ?";
					$params[] = $body['Fecha_resolucion'];
				}
			}
			
			// Actualizar Observaciones si viene
			if (array_key_exists('Observaciones', $body)) {
				$sets[] = "Observaciones = ?";
				$params[] = $body['Observaciones'] === '' ? null : trim($body['Observaciones']);
			}
			
			if (!$sets) respond(400, ['success'=>false,'message'=>'Nada para actualizar']);
			
			$params[] = $id;
			$sql = "UPDATE Intensificacion SET ".implode(', ', $sets)." WHERE ID_intensificacion = ?";
			$stmt = $db->prepare($sql);
			$stmt->execute($params);
			respond(200, ['success'=>true,'id'=>$id]);

		case 'DELETE':
			if (!$id) respond(400, ['success'=>false,'message'=>'Falta id']);
			
			// Validar que la intensificación pertenezca a una materia del docente logueado
			if ($docente_id) {
				$stmt = $db->prepare("
					SELECT i.ID_intensificacion FROM Intensificacion i
					INNER JOIN Materia m ON i.Materia_ID_materia = m.ID_materia
					WHERE i.ID_intensificacion = ? AND m.Usuarios_docente_ID_docente = ?
				");
				$stmt->execute([$id, $docente_id]);
				if (!$stmt->fetch()) {
					respond(403, ['success'=>false,'message'=>'No tiene permiso para eliminar este registro']);
				}
			}
			
			$stmt = $db->prepare("DELETE FROM Intensificacion WHERE ID_intensificacion = ?");
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

