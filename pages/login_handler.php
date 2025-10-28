<?php
// --- 1. configuración inicial ---
// se indica que la respuesta será en formato json (para que el frontend lo entienda)
header('Content-Type: application/json');

// se inicia la sesión (sirve para guardar datos del usuario si se loguea)
session_start();

// se incluye el archivo con la configuración de la base de datos
require_once __DIR__ . '/../config/database.php';


// --- 2. validación del método de solicitud ---
// solo se permite que la solicitud sea por post (por seguridad)
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405); // 405 = método no permitido
    echo json_encode(['success' => false, 'message' => 'método no permitido.']);
    exit; // se corta la ejecución del código
}


// --- 3. obtener y limpiar los datos del input ---
// se obtienen los datos que vienen en formato json desde el frontend
$data = json_decode(file_get_contents('php://input'), true);

// se guardan los datos en variables, si no existen se pone vacío
$email = $data['email'] ?? '';
$password = $data['password'] ?? '';


// --- 4. validación de los datos ---
// se controla que el email y la contraseña no estén vacíos
if (empty($email) || empty($password)) {
    http_response_code(400); // 400 = error de solicitud (bad request)
    echo json_encode(['success' => false, 'message' => 'el email y la contraseña son obligatorios.']);
    exit;
}


// --- 5. conexión con la base de datos y verificación del usuario ---
try {
    // se crea la conexión con la base de datos usando pdo
    $pdo = new PDO(
        "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET,
        DB_USER,
        DB_PASS
    );

    // se configura para que lance errores si algo sale mal
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // se busca al usuario por su correo electrónico
    $stmt = $pdo->prepare("SELECT * FROM Usuarios_docente WHERE Email_docente = ?");
    $stmt->execute([$email]); // se ejecuta la consulta
    $user = $stmt->fetch(PDO::FETCH_ASSOC); // se guarda el resultado

    // se verifica que exista el usuario y que la contraseña coincida
    if ($user && password_verify($password, $user['Contraseña'])) {
        // si la contraseña es correcta, el login es exitoso
        
        // se regenera el id de sesión por seguridad
        session_regenerate_id(true);

        // se guardan los datos del usuario en la sesión
        $_SESSION['user_id'] = $user['ID_docente'];
        $_SESSION['user_name'] = $user['Nombre_docente'];
        $_SESSION['user_lastname'] = $user['Apellido_docente'];
        $_SESSION['user_email'] = $user['Email_docente'];
        $_SESSION['user_role'] = $user['Tipo_usuario'];
        $_SESSION['logged_in'] = true;

        // se prepara la información del usuario para devolverla al frontend
        $userData = [
            'id' => $user['ID_docente'],
            'name' => $user['Nombre_docente'] . ' ' . $user['Apellido_docente'],
            'email' => $user['Email_docente'],
            'role' => $user['Tipo_usuario']
        ];

        // se devuelve una respuesta con código 200 (ok) y el usuario logueado
        http_response_code(200);
        echo json_encode(['success' => true, 'message' => 'inicio de sesión exitoso.', 'user' => $userData]);

    } else {
        // si el usuario no existe o la contraseña está mal
        http_response_code(401); // 401 = no autorizado
        echo json_encode(['success' => false, 'message' => 'email o contraseña incorrectos.']);
    }

} catch (PDOException $e) {
    // si hay un error con la base de datos, se devuelve un error 500
    http_response_code(500); // 500 = error interno del servidor
    echo json_encode(['success' => false, 'message' => 'error interno del servidor.']);
}
?>
