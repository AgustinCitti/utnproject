<?php
/**
 * API endpoint to sync PHP session to localStorage for client-side authentication
 * Used primarily for Google OAuth users
 */

header('Content-Type: application/json');
session_start();

// Check if user is logged in via session
if (isset($_SESSION['logged_in']) && $_SESSION['logged_in'] === true) {
    $sessionData = [
        'success' => true,
        'user' => [
            'id' => $_SESSION['user_id'] ?? null,
            'name' => ($_SESSION['user_name'] ?? '') . ' ' . ($_SESSION['user_lastname'] ?? ''),
            'email' => $_SESSION['user_email'] ?? '',
            'role' => $_SESSION['user_role'] ?? '',
        ],
        'isLoggedIn' => true
    ];
    
    http_response_code(200);
    echo json_encode($sessionData);
} else {
    http_response_code(401);
    echo json_encode([
        'success' => false,
        'isLoggedIn' => false,
        'message' => 'No active session'
    ]);
}
?>

