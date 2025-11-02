<?php
// C:\xampp\htdocs\utnproject\api\asistencia.php
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
		return $stmt->fetch() !== false;
	} catch (PDOException $e) {
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
			// Filtros opcionales: ?id=, ?estudianteId=, ?materiaId=, ?fecha=
			if ($id) {
				// Si hay docente logueado, verificar que la asistencia pertenece a una de sus materias
				if ($docente_id) {
					$stmt = $db->prepare("
						SELECT a.* FROM Asistencia a
						INNER JOIN Materia m ON a.Materia_ID_materia = m.ID_materia
						WHERE a.ID_Asistencia = ? AND m.Usuarios_docente_ID_docente = ?
					");
					$stmt->execute([$id, $docente_id]);
				} else {
					$stmt = $db->prepare("SELECT * FROM Asistencia WHERE ID_Asistencia = ?");
					$stmt->execute([$id]);
				}
				$row = $stmt->fetch();
				if (!$row) respond(404, ['success'=>false,'message'=>'Asistencia no encontrada']);
				respond(200, $row);
			}
			
			$where = [];
			$params = [];
			
			// Si hay docente logueado, filtrar solo asistencias de sus materias
			if ($docente_id) {
				$sql = "SELECT a.* FROM Asistencia a
						INNER JOIN Materia m ON a.Materia_ID_materia = m.ID_materia
						WHERE m.Usuarios_docente_ID_docente = ?";
				$params[] = $docente_id;
				
				if (isset($_GET['estudianteId'])) {
					$where[] = "a.Estudiante_ID_Estudiante = ?";
					$params[] = (int)$_GET['estudianteId'];
				}
				if (isset($_GET['materiaId'])) {
					$where[] = "a.Materia_ID_materia = ?";
					$params[] = (int)$_GET['materiaId'];
				}
				if (isset($_GET['fecha'])) {
					$where[] = "a.Fecha = ?";
					$params[] = $_GET['fecha'];
				}
				
				if ($where) {
					$sql .= " AND " . implode(' AND ', $where);
				}
				
				$sql .= " ORDER BY a.Fecha DESC, a.ID_Asistencia DESC";
				$stmt = $db->prepare($sql);
				$stmt->execute($params);
			} else {
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
				if (isset($_GET['fecha'])) {
					$where[] = "Fecha = ?";
					$params[] = $_GET['fecha'];
				}
				
				$sql = "SELECT * FROM Asistencia";
				if ($where) {
					$sql .= " WHERE " . implode(' AND ', $where);
				}
				$sql .= " ORDER BY Fecha DESC, ID_Asistencia DESC";
				$stmt = $db->prepare($sql);
				$stmt->execute($params);
			}
			
			respond(200, $stmt->fetchAll());
			
		case 'POST':
			$body = readJson();
			
			// Log para debugging
			if (defined('APP_DEBUG') && APP_DEBUG) {
				error_log("POST asistencia - Body recibido: " . json_encode($body));
			}
			
			if (!isset($body['Estudiante_ID_Estudiante']) || !isset($body['Materia_ID_materia']) || !isset($body['Fecha']) || !isset($body['Presente'])) {
				respond(400, ['success'=>false,'message'=>'Faltan campos requeridos: Estudiante_ID_Estudiante, Materia_ID_materia, Fecha, Presente']);
			}
			
			$Estudiante_ID_Estudiante = (int)$body['Estudiante_ID_Estudiante'];
			$Materia_ID_materia = (int)$body['Materia_ID_materia'];
			$Fecha = trim($body['Fecha']);
			$Presente = strtoupper(trim($body['Presente'])); // Y, N, P, A, J según schema
			$Observaciones = isset($body['Observaciones']) ? trim($body['Observaciones']) : null;
			
			// Log valores procesados
			if (defined('APP_DEBUG') && APP_DEBUG) {
				error_log("POST asistencia - Valores procesados: Estudiante=$Estudiante_ID_Estudiante, Materia=$Materia_ID_materia, Fecha=$Fecha, Presente=$Presente");
			}
			
			// Validar formato de fecha
			if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $Fecha)) {
				respond(400, ['success'=>false,'message'=>'Formato de fecha inválido. Use YYYY-MM-DD']);
			}
			
			// Validar Presente - Intentar con diferentes formatos según el schema
			// Primero verificar si la BD acepta Y/N/T o P/A/J
			// Por ahora aceptamos ambos formatos y convertimos
			$validValues = ['Y', 'N', 'T', 'P', 'A', 'J'];
			if (!in_array($Presente, $validValues)) {
				respond(400, ['success'=>false,'message'=>'Valor de Presente inválido. Use Y o P (presente), N o A (ausente), T (tarde), J (justificado)']);
			}
			
			// Convertir formato si es necesario (normalizar a Y/N/T para compatibilidad)
			if ($Presente === 'P') $Presente = 'Y';
			if ($Presente === 'A') $Presente = 'N';
			
			if ($Estudiante_ID_Estudiante <= 0 || $Materia_ID_materia <= 0) {
				respond(400, ['success'=>false,'message'=>'IDs inválidos']);
			}
			
			// Si hay docente logueado, validar que la materia le pertenece
			if ($docente_id && !validarMateriaDelDocente($db, $Materia_ID_materia, $docente_id)) {
				respond(403, ['success'=>false,'message'=>'No tiene permiso para marcar asistencia en esta materia']);
			}
			
			// Verificar si ya existe un registro para este estudiante, materia y fecha
			$stmt = $db->prepare("SELECT ID_Asistencia FROM Asistencia WHERE Estudiante_ID_Estudiante = ? AND Materia_ID_materia = ? AND Fecha = ?");
			$stmt->execute([$Estudiante_ID_Estudiante, $Materia_ID_materia, $Fecha]);
			$existing = $stmt->fetch();
			
			if ($existing) {
				// Actualizar registro existente
				try {
					$stmt = $db->prepare("UPDATE Asistencia SET Presente = ?, Observaciones = ? WHERE ID_Asistencia = ?");
					$stmt->execute([$Presente, $Observaciones, $existing['ID_Asistencia']]);
					
					if (defined('APP_DEBUG') && APP_DEBUG) {
						error_log("UPDATE asistencia exitoso - ID: " . $existing['ID_Asistencia']);
					}
					
					respond(200, [
						'success' => true,
						'message' => 'Asistencia actualizada exitosamente',
						'id' => $existing['ID_Asistencia']
					]);
				} catch (PDOException $e) {
					error_log("Error UPDATE asistencia: " . $e->getMessage());
					respond(500, ['success'=>false,'message'=>'Error al actualizar asistencia: ' . $e->getMessage()]);
				}
			} else {
				// Insertar nuevo registro
				try {
					$stmt = $db->prepare("INSERT INTO Asistencia (Estudiante_ID_Estudiante, Materia_ID_materia, Fecha, Presente, Observaciones) VALUES (?, ?, ?, ?, ?)");
					$stmt->execute([$Estudiante_ID_Estudiante, $Materia_ID_materia, $Fecha, $Presente, $Observaciones]);
					
					$newId = $db->lastInsertId();
					
					if (defined('APP_DEBUG') && APP_DEBUG) {
						error_log("INSERT asistencia exitoso - ID: " . $newId);
					}
					
					respond(201, [
						'success' => true,
						'message' => 'Asistencia guardada exitosamente',
						'id' => $newId
					]);
				} catch (PDOException $e) {
					error_log("Error INSERT asistencia: " . $e->getMessage());
					respond(500, ['success'=>false,'message'=>'Error al guardar asistencia: ' . $e->getMessage()]);
				}
			}
			
		case 'PUT':
			if (!$id) respond(400, ['success'=>false,'message'=>'Se requiere ID para actualizar']);
			
			$body = readJson();
			
			// Verificar que la asistencia existe y pertenece al docente
			if ($docente_id) {
				$stmt = $db->prepare("
					SELECT a.ID_Asistencia FROM Asistencia a
					INNER JOIN Materia m ON a.Materia_ID_materia = m.ID_materia
					WHERE a.ID_Asistencia = ? AND m.Usuarios_docente_ID_docente = ?
				");
				$stmt->execute([$id, $docente_id]);
			} else {
				$stmt = $db->prepare("SELECT ID_Asistencia FROM Asistencia WHERE ID_Asistencia = ?");
				$stmt->execute([$id]);
			}
			
			if (!$stmt->fetch()) {
				respond(404, ['success'=>false,'message'=>'Asistencia no encontrada o sin permisos']);
			}
			
			$updates = [];
			$params = [];
			
			if (isset($body['Presente'])) {
				$Presente = strtoupper(trim($body['Presente']));
				if (!in_array($Presente, ['Y', 'N', 'P', 'A', 'J'])) {
					respond(400, ['success'=>false,'message'=>'Valor de Presente inválido']);
				}
				$updates[] = "Presente = ?";
				$params[] = $Presente;
			}
			
			if (isset($body['Observaciones'])) {
				$updates[] = "Observaciones = ?";
				$params[] = trim($body['Observaciones']);
			}
			
			if (isset($body['Fecha'])) {
				$Fecha = trim($body['Fecha']);
				if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $Fecha)) {
					respond(400, ['success'=>false,'message'=>'Formato de fecha inválido']);
				}
				$updates[] = "Fecha = ?";
				$params[] = $Fecha;
			}
			
			if (empty($updates)) {
				respond(400, ['success'=>false,'message'=>'No hay campos para actualizar']);
			}
			
			$params[] = $id;
			$sql = "UPDATE Asistencia SET " . implode(', ', $updates) . " WHERE ID_Asistencia = ?";
			$stmt = $db->prepare($sql);
			$stmt->execute($params);
			
			respond(200, ['success'=>true,'message'=>'Asistencia actualizada exitosamente']);
			
		case 'DELETE':
			if (!$id) respond(400, ['success'=>false,'message'=>'Se requiere ID para eliminar']);
			
			// Verificar que la asistencia existe y pertenece al docente
			if ($docente_id) {
				$stmt = $db->prepare("
					SELECT a.ID_Asistencia FROM Asistencia a
					INNER JOIN Materia m ON a.Materia_ID_materia = m.ID_materia
					WHERE a.ID_Asistencia = ? AND m.Usuarios_docente_ID_docente = ?
				");
				$stmt->execute([$id, $docente_id]);
			} else {
				$stmt = $db->prepare("SELECT ID_Asistencia FROM Asistencia WHERE ID_Asistencia = ?");
				$stmt->execute([$id]);
			}
			
			if (!$stmt->fetch()) {
				respond(404, ['success'=>false,'message'=>'Asistencia no encontrada o sin permisos']);
			}
			
			$stmt = $db->prepare("DELETE FROM Asistencia WHERE ID_Asistencia = ?");
			$stmt->execute([$id]);
			
			respond(200, ['success'=>true,'message'=>'Asistencia eliminada exitosamente']);
			
		default:
			respond(405, ['success'=>false,'message'=>'Método no permitido']);
	}
} catch (Exception $e) {
	error_log("Error en asistencia.php: " . $e->getMessage());
	respond(500, ['success'=>false,'message'=>'Error del servidor: ' . $e->getMessage()]);
}

