<?php
/**
 * EduSync - Database Configuration
 * Configuración centralizada de la base de datos
 */

// Database Configuration
define('DB_HOST', 'localhost');
define('DB_NAME', 'edusync');
define('DB_USER', 'root');
define('DB_PASS', ''); // Cambia si tu MySQL tiene contraseña
define('DB_CHARSET', 'utf8mb4');

// Session Configuration
define('SESSION_LIFETIME', 3600); // 1 hora

// Application Configuration
define('APP_NAME', 'EduSync');
define('APP_URL', 'http://localhost/utnproject');

// Error Reporting (desactivar en producción)
error_reporting(E_ALL);
ini_set('display_errors', 1);