<?php
// C:\xampp\htdocs\utnproject\api\contenido.php
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

try {
	$db = pdo();
	$method = $_SERVER['REQUEST_METHOD'];
	$id = isset($_GET['id']) ? (int)$_GET['id'] : null;

	switch ($method) {
		case 'GET':
			// Filtros opcionales: ?id=, ?materiaId=
			if ($id) {
				$stmt = $db->prepare("SELECT * FROM Contenido WHERE ID_contenido = ?");
				$stmt->execute([$id]);
				$row = $stmt->fetch();
				if (!$row) respond(404, ['success'=>false,'message'=>'Contenido no encontrado']);
				respond(200, $row);
			}
			$where = [];
			$params = [];
			if (isset($_GET['materiaId'])) { 
				$where[] = "Materia_ID_materia = ?"; 
				$params[] = (int)$_GET['materiaId']; 
			}
			$sql = "SELECT * FROM Contenido";
			if ($where) $sql .= " WHERE " . implode(' AND ', $where);
			$sql .= " ORDER BY Fecha_creacion DESC, ID_contenido DESC";
			$stmt = $db->prepare($sql);
			$stmt->execute($params);
			respond(200, $stmt->fetchAll());
		
		case 'POST':
			$body = readJson();
			// Validación mínima
			$required = ['Tema','Materia_ID_materia'];
			foreach ($required as $k) {
				if (!isset($body[$k]) || $body[$k]==='') respond(400, ['success'=>false,'message'=>"Falta campo: $k"]);
			}
			$Tema = trim($body['Tema']);
			$Materia_ID_materia = (int)$body['Materia_ID_materia'];
			$Descripcion = isset($body['Descripcion']) && $body['Descripcion'] !== '' ? trim($body['Descripcion']) : null;
			$Estado = isset($body['Estado']) ? $body['Estado'] : 'PENDIENTE';

			// Validar que el materia ID sea válido
			if ($Materia_ID_materia <= 0) {
				respond(400, ['success'=>false,'message'=>'ID de materia inválido']);
			}

			// Validar que el tema no esté vacío
			if (empty($Tema)) {
				respond(400, ['success'=>false,'message'=>'El tema no puede estar vacío']);
			}

			// Validar estado
			$validEstados = ['PENDIENTE', 'EN_PROGRESO', 'COMPLETADO', 'CANCELADO'];
			if (!in_array($Estado, $validEstados)) {
				$Estado = 'PENDIENTE';
			}

			$stmt = $db->prepare("INSERT INTO Contenido (Tema, Descripcion, Estado, Materia_ID_materia) VALUES (?, ?, ?, ?)");
			$stmt->execute([$Tema, $Descripcion, $Estado, $Materia_ID_materia]);
			$newId = (int)$db->lastInsertId();
			respond(201, ['success'=>true,'id'=>$newId]);

		case 'PUT':
			if (!$id) respond(400, ['success'=>false,'message'=>'Falta id']);
			$body = readJson();
			// Campos actualizables
			$fields = ['Tema','Descripcion','Estado'];
			$sets = [];
			$params = [];
			foreach ($fields as $f) {
				if (array_key_exists($f, $body)) {
					if ($f === 'Descripcion') {
						$sets[] = "$f = ?";
						$params[] = $body[$f] === '' ? null : trim($body[$f]);
					} else if ($f === 'Tema') {
						$sets[] = "$f = ?";
						$params[] = trim($body[$f]);
					} else {
						$sets[] = "$f = ?";
						$params[] = $body[$f];
					}
				}
			}
			if (!$sets) respond(400, ['success'=>false,'message'=>'Nada para actualizar']);
			
			// Agregar fecha de actualización
			$sets[] = "Fecha_actualizacion = CURRENT_DATE";
			$params[] = $id;
			$sql = "UPDATE Contenido SET ".implode(', ', $sets)." WHERE ID_contenido = ?";
			$stmt = $db->prepare($sql);
			$stmt->execute($params);
			respond(200, ['success'=>true,'id'=>$id]);

		case 'DELETE':
			if (!$id) respond(400, ['success'=>false,'message'=>'Falta id']);
			$stmt = $db->prepare("DELETE FROM Contenido WHERE ID_contenido = ?");
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

