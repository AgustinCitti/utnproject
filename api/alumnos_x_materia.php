<?php
// C:\xampp\htdocs\utnproject\api\alumnos_x_materia.php
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

	switch ($method) {
		case 'GET':
			// Filtros opcionales: ?estudianteId=, ?materiaId=
			$where = [];
			$params = [];
			
			if (isset($_GET['estudianteId'])) {
				$where[] = "Estudiante_ID_Estudiante = ?";
				$params[] = (int)$_GET['estudianteId'];
			}
			if (isset($_GET['materiaId'])) {
				$where[] = "Materia_ID_materia = ?";
				$params[] = (int)$_GET['materiaId'];
			}
			
			$sql = "SELECT * FROM Alumnos_X_Materia";
			if ($where) $sql .= " WHERE " . implode(' AND ', $where);
			$sql .= " ORDER BY Fecha_inscripcion DESC";
			
			$stmt = $db->prepare($sql);
			$stmt->execute($params);
			respond(200, $stmt->fetchAll());
		
		case 'POST':
			$body = readJson();
			
			// Log para debug
			error_log("alumnos_x_materia POST recibido: " . json_encode($body));
			
			if (empty($body)) {
				respond(400, ['success' => false, 'message' => 'Body vacío']);
			}
			
			// Puede ser un solo registro o múltiples
			if (isset($body[0]) && is_array($body[0])) {
				// Múltiples inserciones (array de objetos)
				$inserted = [];
				$errors = [];
				
				// Intentar primero sin ON DUPLICATE KEY para ver el error real
				$stmt = $db->prepare("INSERT INTO Alumnos_X_Materia (Materia_ID_materia, Estudiante_ID_Estudiante, Estado) VALUES (?, ?, ?)");
				
				foreach ($body as $item) {
					if (!isset($item['Materia_ID_materia']) || !isset($item['Estudiante_ID_Estudiante'])) {
						$errors[] = "Item inválido: " . json_encode($item);
						continue;
					}
					
					$materiaId = (int)$item['Materia_ID_materia'];
					$estudianteId = (int)$item['Estudiante_ID_Estudiante'];
					$estado = isset($item['Estado']) ? $item['Estado'] : 'INSCRITO';
					
					// Validar que los IDs sean válidos
					if ($materiaId <= 0 || $estudianteId <= 0) {
						$errors[] = "IDs inválidos: materia=$materiaId, estudiante=$estudianteId";
						continue;
					}
					
					try {
						$stmt->execute([$materiaId, $estudianteId, $estado]);
						$inserted[] = ['Materia_ID_materia' => $materiaId, 'Estudiante_ID_Estudiante' => $estudianteId];
						error_log("Insertado: materia=$materiaId, estudiante=$estudianteId");
					} catch (PDOException $e) {
						$errorMsg = $e->getMessage();
						$errors[] = "Error con materia $materiaId, estudiante $estudianteId: $errorMsg";
						error_log("Error insertando: " . $errorMsg);
						
						// Si es error de duplicado, intentar UPDATE
						if (strpos($errorMsg, 'Duplicate entry') !== false || strpos($errorMsg, '23000') !== false) {
							try {
								$updateStmt = $db->prepare("UPDATE Alumnos_X_Materia SET Estado = ? WHERE Materia_ID_materia = ? AND Estudiante_ID_Estudiante = ?");
								$updateStmt->execute([$estado, $materiaId, $estudianteId]);
								$inserted[] = ['Materia_ID_materia' => $materiaId, 'Estudiante_ID_Estudiante' => $estudianteId, 'updated' => true];
								error_log("Actualizado (duplicado): materia=$materiaId, estudiante=$estudianteId");
							} catch (PDOException $e2) {
								$errors[] = "Error actualizando materia $materiaId: " . $e2->getMessage();
							}
						}
					}
				}
				
				if (!empty($errors)) {
					respond(207, ['success' => true, 'inserted' => $inserted, 'warnings' => $errors]);
				} else {
					respond(201, ['success' => true, 'inserted' => $inserted, 'message' => count($inserted) . ' relaciones guardadas']);
				}
			} else {
				// Un solo registro
				if (!isset($body['Materia_ID_materia']) || !isset($body['Estudiante_ID_Estudiante'])) {
					respond(400, ['success' => false, 'message' => 'Faltan campos requeridos: Materia_ID_materia o Estudiante_ID_Estudiante']);
				}
				
				$materiaId = (int)$body['Materia_ID_materia'];
				$estudianteId = (int)$body['Estudiante_ID_Estudiante'];
				$estado = isset($body['Estado']) ? $body['Estado'] : 'INSCRITO';
				
				if ($materiaId <= 0 || $estudianteId <= 0) {
					respond(400, ['success' => false, 'message' => 'IDs inválidos']);
				}
				
				try {
					$stmt = $db->prepare("INSERT INTO Alumnos_X_Materia (Materia_ID_materia, Estudiante_ID_Estudiante, Estado) VALUES (?, ?, ?)");
					$stmt->execute([$materiaId, $estudianteId, $estado]);
					error_log("Insertado único: materia=$materiaId, estudiante=$estudianteId");
					respond(201, ['success' => true, 'Materia_ID_materia' => $materiaId, 'Estudiante_ID_Estudiante' => $estudianteId]);
				} catch (PDOException $e) {
					$errorMsg = $e->getMessage();
					error_log("Error insertando único: " . $errorMsg);
					
					// Si es duplicado, actualizar
					if (strpos($errorMsg, 'Duplicate entry') !== false || strpos($errorMsg, '23000') !== false) {
						try {
							$updateStmt = $db->prepare("UPDATE Alumnos_X_Materia SET Estado = ? WHERE Materia_ID_materia = ? AND Estudiante_ID_Estudiante = ?");
							$updateStmt->execute([$estado, $materiaId, $estudianteId]);
							respond(200, ['success' => true, 'Materia_ID_materia' => $materiaId, 'Estudiante_ID_Estudiante' => $estudianteId, 'updated' => true]);
						} catch (PDOException $e2) {
							respond(500, ['success' => false, 'message' => 'Error actualizando: ' . $e2->getMessage()]);
						}
					} else {
						respond(500, ['success' => false, 'message' => 'Error insertando: ' . $errorMsg]);
					}
				}
			}
		
		case 'DELETE':
			$estudianteId = isset($_GET['estudianteId']) ? (int)$_GET['estudianteId'] : null;
			$materiaId = isset($_GET['materiaId']) ? (int)$_GET['materiaId'] : null;
			
			if (!$estudianteId && !$materiaId) {
				respond(400, ['success' => false, 'message' => 'Debe especificar estudianteId o materiaId']);
			}
			
			$where = [];
			$params = [];
			
			if ($estudianteId) {
				$where[] = "Estudiante_ID_Estudiante = ?";
				$params[] = $estudianteId;
			}
			if ($materiaId) {
				$where[] = "Materia_ID_materia = ?";
				$params[] = $materiaId;
			}
			
			$sql = "DELETE FROM Alumnos_X_Materia WHERE " . implode(' AND ', $where);
			$stmt = $db->prepare($sql);
			$stmt->execute($params);
			
			respond(200, ['success' => true, 'deleted' => $stmt->rowCount()]);

		default:
			respond(405, ['success' => false, 'message' => 'Método no permitido']);
	}

} catch (Throwable $e) {
	$errorDetails = [
		'success' => false,
		'message' => 'Error del servidor',
		'error' => $e->getMessage(),
		'file' => $e->getFile(),
		'line' => $e->getLine()
	];
	respond(500, $errorDetails);
}

