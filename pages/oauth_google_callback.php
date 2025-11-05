<?php
// Callback de Google OAuth: intercambia code por tokens y crea/inicia sesión
session_start();

// Habilitar la visualización de errores para depuración
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

require_once __DIR__ . '/../config/oauth_google.php';
require_once __DIR__ . '/../config/database.php';

if (!isset($_GET['code']) || !isset($_GET['state'])) {
    die('Error: Solicitud inválida. Faltan los parámetros "code" o "state".');
}

if (!isset($_SESSION['oauth2state']) || $_GET['state'] !== $_SESSION['oauth2state']) {
    die('Error: Estado de seguridad no válido. Posible ataque CSRF.');
}

$code = $_GET['code'];

// 1) Intercambiar code por tokens
$postFields = [
    'code' => $code,
    'client_id' => GOOGLE_CLIENT_ID,
    'client_secret' => GOOGLE_CLIENT_SECRET,
    'redirect_uri' => GOOGLE_REDIRECT_URI,
    'grant_type' => 'authorization_code'
];

$ch = curl_init('https://oauth2.googleapis.com/token');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($postFields));
$tokenResponse = curl_exec($ch);

if ($tokenResponse === false) {
    die('Error de cURL al obtener token de Google: ' . curl_error($ch));
}
$tokens = json_decode($tokenResponse, true);
curl_close($ch);

if (!isset($tokens['access_token'])) {
    die('Error: Autenticación con Google fallida. No se recibió un access_token. Respuesta de Google: ' . htmlspecialchars($tokenResponse));
}

// 2) Obtener perfil del usuario
$ch = curl_init('https://www.googleapis.com/oauth2/v2/userinfo');
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Authorization: Bearer ' . $tokens['access_token']]);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$userInfoResponse = curl_exec($ch);

if ($userInfoResponse === false) {
    die('Error de cURL al obtener información del usuario: ' . curl_error($ch));
}
curl_close($ch);

$gUser = json_decode($userInfoResponse, true);
if (!isset($gUser['email'])) {
    die('Error: No se pudo obtener el email de Google. Respuesta de Google: ' . htmlspecialchars($userInfoResponse));
}

$email = $gUser['email'];
$googleId = $gUser['id'] ?? null;
$name = $gUser['given_name'] ?? '';
$lastname = $gUser['family_name'] ?? '';
$picture = $gUser['picture'] ?? null;

// 3) Buscar o crear usuario local
try {
    $pdo = new PDO("mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET, DB_USER, DB_PASS);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $pdo->beginTransaction();

    $stmt = $pdo->prepare("SELECT * FROM Usuarios_docente WHERE Email_docente = ?");
    $stmt->execute([$email]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($user) {
        $upd = $pdo->prepare("UPDATE Usuarios_docente SET google_id = COALESCE(google_id, ?), oauth_provider = 'GOOGLE', Avatar = COALESCE(?, Avatar) WHERE ID_docente = ?");
        $upd->execute([$googleId, $picture, $user['ID_docente']]);
        $userId = $user['ID_docente'];
        $userName = $user['Nombre_docente'];
        $userLast = $user['Apellido_docente'];
        $userRole = $user['Tipo_usuario'];
    } else {
        // Crear un usuario básico (rol por defecto PROFESOR)
        $randomPass = password_hash(bin2hex(random_bytes(8)), PASSWORD_BCRYPT);
        $ins = $pdo->prepare("INSERT INTO Usuarios_docente (Nombre_docente, Apellido_docente, Email_docente, Contraseña, Estado, Tipo_usuario, google_id, oauth_provider, Avatar) VALUES (?,?,?,?, 'ACTIVO','PROFESOR', ?, 'GOOGLE', ?)");
        $ins->execute([$name, $lastname, $email, $randomPass, $googleId, $picture]);
        $userId = (int)$pdo->lastInsertId();
        $userName = $name;
        $userLast = $lastname;
        $userRole = 'PROFESOR';
    }

    $pdo->commit();

    // 4) Iniciar sesión
    session_regenerate_id(true);
    $_SESSION['user_id'] = $userId;
    $_SESSION['user_name'] = $userName;
    $_SESSION['user_lastname'] = $userLast;
    $_SESSION['user_email'] = $email;
    $_SESSION['user_role'] = $userRole;
    $_SESSION['logged_in'] = true;

    // Redirigir al usuario a la página principal de la aplicación
    header('Location: http://localhost/utnproject/pages/home.html');
    exit();

} catch (PDOException $e) {
    if ($pdo && $pdo->inTransaction()) { $pdo->rollBack(); }
    die('Error de base de datos: ' . $e->getMessage());
}
?>