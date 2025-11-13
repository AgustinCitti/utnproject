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
	$stmt = $db->prepare("SELECT ID_materia FROM Materia WHERE ID_materia = ? AND Usuarios_docente_ID_docente = ?");
	$stmt->execute([$materiaId, $docenteId]);
	return $stmt->fetch() !== false;
}

// Función para actualizar el curso del estudiante basado en sus materias
function updateStudentCourseFromSubjects($db, $estudianteId) {
	try {
		// Verificar si la columna Curso_ID_curso existe
		$stmtCheck = $db->query("SHOW COLUMNS FROM Estudiante LIKE 'Curso_ID_curso'");
		$hasCursoIdColumn = $stmtCheck->rowCount() > 0;
		
		if (!$hasCursoIdColumn) {
			return; // La columna no existe, no hacer nada
		}
		
		// Obtener todas las materias del estudiante
		$stmt = $db->prepare("
			SELECT DISTINCT m.Curso_division, m.Usuarios_docente_ID_docente
			FROM Alumnos_X_Materia axm
			INNER JOIN Materia m ON axm.Materia_ID_materia = m.ID_materia
			WHERE axm.Estudiante_ID_Estudiante = ?
		");
		$stmt->execute([$estudianteId]);
		$materias = $stmt->fetchAll();
		
		if (empty($materias)) {
			return; // No hay materias, no actualizar curso
		}
		
		// Obtener cursos únicos
		$cursosUnicos = [];
		foreach ($materias as $materia) {
			$cursoDivision = $materia['Curso_division'];
			$docenteId = $materia['Usuarios_docente_ID_docente'];
			
			if (!isset($cursosUnicos[$cursoDivision])) {
				$cursosUnicos[$cursoDivision] = $docenteId;
			}
		}
		
		// Si todas las materias pertenecen al mismo curso, actualizar
		if (count($cursosUnicos) === 1) {
			$cursoDivision = array_key_first($cursosUnicos);
			$docenteId = $cursosUnicos[$cursoDivision];
			
			// Buscar el ID del curso en la tabla Curso
			$cursoStmt = $db->prepare("
				SELECT ID_curso FROM Curso 
				WHERE Curso_division = ? AND Usuarios_docente_ID_docente = ? AND Estado = 'ACTIVO'
				LIMIT 1
			");
			$cursoStmt->execute([$cursoDivision, $docenteId]);
			$curso = $cursoStmt->fetch();
			
			if ($curso && $curso['ID_curso']) {
				// Actualizar el curso del estudiante
				$updateStmt = $db->prepare("UPDATE Estudiante SET Curso_ID_curso = ? WHERE ID_Estudiante = ?");
				$updateStmt->execute([$curso['ID_curso'], $estudianteId]);
				error_log("Actualizado Curso_ID_curso del estudiante $estudianteId a curso " . $curso['ID_curso']);
			}
		}
	} catch (Exception $e) {
		// No fallar si hay error al actualizar el curso
		error_log("Error en updateStudentCourseFromSubjects: " . $e->getMessage());
	}
}

// Función para asignar todos los temas de una materia a un estudiante
function assignAllTopicsToStudent($db, $materiaId, $estudianteId) {
	try {
		// Obtener todos los temas (contenidos) de esta materia
		$topicsStmt = $db->prepare("SELECT ID_contenido FROM Contenido WHERE Materia_ID_materia = ?");
		$topicsStmt->execute([$materiaId]);
		$topics = $topicsStmt->fetchAll();
		
		if (empty($topics)) {
			return; // No hay temas para asignar
		}
		
		// Verificar si ya existe un registro tema_estudiante antes de insertar
		$checkStmt = $db->prepare("
			SELECT COUNT(*) as count 
			FROM Tema_estudiante 
			WHERE Contenido_ID_contenido = ? AND Estudiante_ID_Estudiante = ?
		");
		$insertStmt = $db->prepare("
			INSERT INTO Tema_estudiante (Contenido_ID_contenido, Estudiante_ID_Estudiante, Estado) 
			VALUES (?, ?, 'PENDIENTE')
		");
		
		$assignedCount = 0;
		foreach ($topics as $topic) {
			$contenidoId = (int)$topic['ID_contenido'];
			try {
				// Verificar si ya existe
				$checkStmt->execute([$contenidoId, $estudianteId]);
				$exists = $checkStmt->fetch()['count'] > 0;
				
				if (!$exists) {
					// Solo insertar si no existe
					$insertStmt->execute([$contenidoId, $estudianteId]);
					$assignedCount++;
				}
			} catch (PDOException $e) {
				// Registrar errores pero no fallar
				error_log("Error asignando tema $contenidoId a estudiante $estudianteId: " . $e->getMessage());
			}
		}
		
		if ($assignedCount > 0) {
			error_log("Asignados $assignedCount tema(s) al estudiante $estudianteId de la materia $materiaId");
		}
	} catch (Exception $e) {
		// No fallar si hay error al asignar temas
		error_log("Error en assignAllTopicsToStudent: " . $e->getMessage());
	}
}

try {
	$db = pdo();
	$method = $_SERVER['REQUEST_METHOD'];
	
	// Obtener ID del docente logueado (si existe)
	$docente_id = $_SESSION['user_id'] ?? null;

	switch ($method) {
		case 'GET':
			// Filtros opcionales: ?estudianteId=, ?materiaId=
			$where = [];
			$params = [];
			
			// Si hay docente logueado, filtrar solo inscripciones de sus materias
			if ($docente_id) {
				$sql = "SELECT axm.* FROM Alumnos_X_Materia axm
						INNER JOIN Materia m ON axm.Materia_ID_materia = m.ID_materia
						WHERE m.Usuarios_docente_ID_docente = ?";
				$params[] = $docente_id;
				
				if (isset($_GET['estudianteId'])) {
					$where[] = "axm.Estudiante_ID_Estudiante = ?";
					$params[] = (int)$_GET['estudianteId'];
				}
				if (isset($_GET['materiaId'])) {
					$where[] = "axm.Materia_ID_materia = ?";
					$params[] = (int)$_GET['materiaId'];
				}
				
				if ($where) $sql .= " AND " . implode(' AND ', $where);
				$sql .= " ORDER BY axm.Fecha_inscripcion DESC";
			} else {
				// Sin docente logueado, mostrar todos (para admin)
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
			}
			
			$stmt = $db->prepare($sql);
			$stmt->execute($params);
			respond(200, $stmt->fetchAll());
		
		case 'POST':
			$body = readJson();
			
			// Log para debug
			error_log("alumnos_x_materia POST recibido: " . json_encode($body));
			error_log("Tipo de body: " . gettype($body) . ", es array: " . (is_array($body) ? 'sí' : 'no'));
			if (is_array($body)) {
				error_log("Cantidad de elementos: " . count($body));
				if (count($body) > 0) {
					error_log("Primer elemento es array: " . (is_array($body[0]) ? 'sí' : 'no'));
				}
			}
			
			if (empty($body)) {
				respond(400, ['success' => false, 'message' => 'Body vacío']);
			}
			
			// Puede ser un solo registro o múltiples
			// Verificar si es un array numérico (múltiples registros)
			$isMultiple = is_array($body) && isset($body[0]) && is_array($body[0]) && isset($body[0]['Materia_ID_materia']);
			
			if ($isMultiple) {
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
					
					// Validar que la materia pertenezca al docente logueado
					if (!validarMateriaDelDocente($db, $materiaId, $docente_id)) {
						$errors[] = "No tiene permiso para inscribir en la materia ID=$materiaId";
						continue;
					}
					
					try {
						$stmt->execute([$materiaId, $estudianteId, $estado]);
						$inserted[] = ['Materia_ID_materia' => $materiaId, 'Estudiante_ID_Estudiante' => $estudianteId];
						error_log("Insertado: materia=$materiaId, estudiante=$estudianteId");
						
						// Actualizar el curso del estudiante basado en sus materias
						updateStudentCourseFromSubjects($db, $estudianteId);
						
						// Asignar automáticamente todos los temas existentes de esta materia al estudiante
						if ($estado === 'INSCRITO') {
							assignAllTopicsToStudent($db, $materiaId, $estudianteId);
						}
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
								
								// Actualizar el curso del estudiante basado en sus materias
								updateStudentCourseFromSubjects($db, $estudianteId);
								
								// Asignar temas si el estado es INSCRITO
								if ($estado === 'INSCRITO') {
									assignAllTopicsToStudent($db, $materiaId, $estudianteId);
								}
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
				
				// Validar que la materia pertenezca al docente logueado
				if (!validarMateriaDelDocente($db, $materiaId, $docente_id)) {
					respond(403, ['success' => false, 'message' => 'No tiene permiso para inscribir en esta materia']);
				}
				
				try {
					$stmt = $db->prepare("INSERT INTO Alumnos_X_Materia (Materia_ID_materia, Estudiante_ID_Estudiante, Estado) VALUES (?, ?, ?)");
					$stmt->execute([$materiaId, $estudianteId, $estado]);
					error_log("Insertado único: materia=$materiaId, estudiante=$estudianteId");
					
					// Actualizar el curso del estudiante basado en sus materias
					updateStudentCourseFromSubjects($db, $estudianteId);
					
					// Asignar automáticamente todos los temas existentes de esta materia al estudiante
					if ($estado === 'INSCRITO') {
						assignAllTopicsToStudent($db, $materiaId, $estudianteId);
					}
					
					respond(201, ['success' => true, 'Materia_ID_materia' => $materiaId, 'Estudiante_ID_Estudiante' => $estudianteId]);
				} catch (PDOException $e) {
					$errorMsg = $e->getMessage();
					error_log("Error insertando único: " . $errorMsg);
					
					// Si es duplicado, actualizar
					if (strpos($errorMsg, 'Duplicate entry') !== false || strpos($errorMsg, '23000') !== false) {
						try {
							$updateStmt = $db->prepare("UPDATE Alumnos_X_Materia SET Estado = ? WHERE Materia_ID_materia = ? AND Estudiante_ID_Estudiante = ?");
							$updateStmt->execute([$estado, $materiaId, $estudianteId]);
							
							// Actualizar el curso del estudiante basado en sus materias
							updateStudentCourseFromSubjects($db, $estudianteId);
							
							// Asignar temas si el estado es INSCRITO
							if ($estado === 'INSCRITO') {
								assignAllTopicsToStudent($db, $materiaId, $estudianteId);
							}
							
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
			
			// Guardar los IDs de estudiantes afectados antes de eliminar
			$affectedStudentIds = [];
			if ($estudianteId) {
				$affectedStudentIds[] = $estudianteId;
			} else {
				// Si se elimina por materia, obtener los estudiantes afectados
				$stmt = $db->prepare("SELECT DISTINCT Estudiante_ID_Estudiante FROM Alumnos_X_Materia WHERE Materia_ID_materia = ?");
				$stmt->execute([$materiaId]);
				$affectedStudentIds = array_column($stmt->fetchAll(), 'Estudiante_ID_Estudiante');
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
			
			// Actualizar el curso de los estudiantes afectados después de eliminar materias
			foreach ($affectedStudentIds as $affectedId) {
				updateStudentCourseFromSubjects($db, $affectedId);
			}
			
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

