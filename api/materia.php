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

			$stmt = $db->prepare("INSERT INTO Materia (Nombre, Curso_division, Usuarios_docente_ID_docente, Estado, Horario, Aula, Descripcion) VALUES (?, ?, ?, ?, ?, ?, ?)");
			$stmt->execute([$Nombre, $Curso_division, $DocenteId, $Estado, $Horario, $Aula, $Descripcion]);
			$newId = (int)$db->lastInsertId();
			respond(201, ['success'=>true,'id'=>$newId]);

		case 'PUT':
			if (!$id) respond(400, ['success'=>false,'message'=>'Falta id']);
			$body = readJson();
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
			if (!$sets) respond(400, ['success'=>false,'message'=>'Nada para actualizar']);
			$params[] = $id;
			$sql = "UPDATE Materia SET ".implode(', ', $sets)." WHERE ID_materia = ?";
			$stmt = $db->prepare($sql);
			$stmt->execute($params);
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