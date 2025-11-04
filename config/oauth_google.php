<?php
// Copiar como oauth_google.php y completar con tus credenciales de Google Cloud
// Console: https://console.cloud.google.com/apis/credentials

define('GOOGLE_CLIENT_ID', 'TU_CLIENT_ID.apps.googleusercontent.com');
define('GOOGLE_CLIENT_SECRET', 'TU_CLIENT_SECRET');

// Debe coincidir exactamente con lo configurado en Google
define('GOOGLE_REDIRECT_URI', 'http://localhost/utnproject/pages/oauth_google_callback.php');

// Scopes requeridos: email y perfil básico
define('GOOGLE_OAUTH_SCOPE', 'openid email profile');

?>

