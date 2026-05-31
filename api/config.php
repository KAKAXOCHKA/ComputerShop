<?php
/**
 * NEXCORE SHOP — application bootstrap (sessions, helpers, PDO).
 * Database host/user/password/name live in credentials.php (not in version control on real servers).
 */

if (!defined('NEXCORE_ACCESS')) {
    define('NEXCORE_ACCESS', true);
}

require_once __DIR__ . '/credentials.php';

define('SESSION_LIFETIME', 3600);
define('PASSWORD_HASH_ALGO', PASSWORD_BCRYPT);
define('PASSWORD_HASH_COST', 10);

/**
 * @return PDO
 */
function getDB() {
    static $conn = null;

    if ($conn === null) {
        try {
            $dsn = 'mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=utf8mb4';
            $options = [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
                PDO::MYSQL_ATTR_INIT_COMMAND => 'SET NAMES utf8mb4',
            ];

            $conn = new PDO($dsn, DB_USER, DB_PASS, $options);
        } catch (PDOException $e) {
            error_log('Database connection error: ' . $e->getMessage());
            http_response_code(500);
            header('Content-Type: application/json; charset=utf-8');
            die(json_encode([
                'success' => false,
                'message' => 'Database connection failed. Please try again later.',
            ]));
        }
    }

    return $conn;
}

function startSecureSession() {
    if (session_status() === PHP_SESSION_NONE) {
        ini_set('session.cookie_httponly', '1');
        ini_set('session.use_only_cookies', '1');
        ini_set('session.cookie_secure', '0');
        session_start();
    }
}

function isLoggedIn() {
    startSecureSession();
    return isset($_SESSION['user_id']) && $_SESSION['user_id'] !== '';
}

function isAdmin() {
    startSecureSession();
    return isLoggedIn() && !empty($_SESSION['is_admin']);
}

function getCurrentUser() {
    if (!isLoggedIn()) {
        return null;
    }

    try {
        $db = getDB();
        $stmt = $db->prepare('SELECT id, name, surname, email, phone, is_admin FROM users WHERE id = ?');
        $stmt->execute([$_SESSION['user_id']]);
        return $stmt->fetch();
    } catch (PDOException $e) {
        error_log('Get current user error: ' . $e->getMessage());
        return null;
    }
}

function sanitize($data) {
    return htmlspecialchars(strip_tags(trim((string) $data)), ENT_QUOTES, 'UTF-8');
}

function jsonResponse($success, $data = null, $message = '') {
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode([
        'success' => $success,
        'data' => $data,
        'message' => $message,
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

startSecureSession();

if (strpos($_SERVER['REQUEST_URI'] ?? '', '/api/') !== false) {
    header('Content-Type: application/json; charset=utf-8');
}
