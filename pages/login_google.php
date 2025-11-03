<?php
// Inicia OAuth con Google: redirige al usuario al consentimiento
session_start();
require_once __DIR__ . '/../config/oauth_google.php'; // copiar desde oauth_google.sample.php

$state = bin2hex(random_bytes(16));
$_SESSION['oauth2state'] = $state;

$params = http_build_query([
    'client_id' => GOOGLE_CLIENT_ID,
    'redirect_uri' => GOOGLE_REDIRECT_URI,
    'response_type' => 'code',
    'scope' => GOOGLE_OAUTH_SCOPE,
    'state' => $state,
    'access_type' => 'offline',
    'include_granted_scopes' => 'true',
    'prompt' => 'consent'
]);

$authUrl = 'https://accounts.google.com/o/oauth2/v2/auth?' . $params;
header('Location: ' . $authUrl);
exit;
?>


