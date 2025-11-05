<?php
// inicia oauth con google: redirige al usuario al consentimiento
session_start();
require_once __DIR__ . '/../config/oauth_google.php'; // asegúrate que define GOOGLE_CLIENT_ID, GOOGLE_REDIRECT_URI, GOOGLE_OAUTH_SCOPE

// generar state anti csrf
$state = bin2hex(random_bytes(16));
$_SESSION['oauth2state'] = $state;

// asegurar que 'openid' esté en el scope
$scope = GOOGLE_OAUTH_SCOPE;
if (strpos($scope, 'openid') === false) {
    $scope = trim($scope . ' openid');
}

// parámetros de la autorización
$params = [
    'client_id' => GOOGLE_CLIENT_ID,
    'redirect_uri' => GOOGLE_REDIRECT_URI,
    'response_type' => 'code',          // flujo de servidor (authorization code)
    'scope' => $scope,
    'state' => $state,
    'access_type' => 'offline',         // para refresh_token
    'include_granted_scopes' => 'true',
    'prompt' => 'consent'               // para pruebas; en producción evaluar cambiar o quitar
];

// build query usando RFC3986 para codificar espacios como %20
$authUrl = 'https://accounts.google.com/o/oauth2/v2/auth?' . http_build_query($params, '', '&', PHP_QUERY_RFC3986);

// debug temporal: descomentar para ver la url que se genera (útil para confirmar redirect_uri y client_id)
// echo $authUrl; exit;

// redirigir al usuario a google
header('Location: ' . $authUrl);
exit;
?>



