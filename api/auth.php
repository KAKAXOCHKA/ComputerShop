<?php
require_once 'config.php';

$action = $_POST['action'] ?? '';

switch ($action) {
    case 'register':
        register();
        break;
    case 'login':
        login();
        break;
    case 'logout':
        logout();
        break;
    case 'forgot_password':
        forgotPassword();
        break;
    default:
        echo json_encode(['success' => false, 'message' => 'Unknown action']);
}

function register() {
    $name = trim($_POST['name'] ?? '');
    $surname = trim($_POST['surname'] ?? '');
    $email = trim($_POST['email'] ?? '');
    $phone = trim($_POST['phone'] ?? '');
    $password = $_POST['password'] ?? '';

    if (empty($name) || empty($surname) || empty($email) || empty($password)) {
        echo json_encode(['success' => false, 'message' => 'Please fill in all required fields']);
        return;
    }

    if (strlen($password) < 6) {
        echo json_encode(['success' => false, 'message' => 'Password must be at least 6 characters']);
        return;
    }

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        echo json_encode(['success' => false, 'message' => 'Invalid email format']);
        return;
    }

    try {
        $db = getDB();

        $stmt = $db->prepare('SELECT id FROM users WHERE email = ?');
        $stmt->execute([$email]);
        if ($stmt->fetch()) {
            echo json_encode(['success' => false, 'message' => 'This email is already registered']);
            return;
        }

        $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
        $stmt = $db->prepare('INSERT INTO users (name, surname, email, phone, password, created_at) VALUES (?, ?, ?, ?, ?, NOW())');
        $stmt->execute([$name, $surname, $email, $phone, $hashedPassword]);

        echo json_encode(['success' => true, 'message' => 'Registration successful']);
    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'message' => 'Registration error: ' . $e->getMessage()]);
    }
}

function login() {
    $email = trim($_POST['email'] ?? '');
    $password = $_POST['password'] ?? '';

    if (empty($email) || empty($password)) {
        echo json_encode(['success' => false, 'message' => 'Please fill in all fields']);
        return;
    }

    try {
        $db = getDB();
        $stmt = $db->prepare('SELECT * FROM users WHERE email = ?');
        $stmt->execute([$email]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$user || !password_verify($password, $user['password'])) {
            echo json_encode(['success' => false, 'message' => 'Invalid email or password']);
            return;
        }

        $_SESSION['user_id'] = $user['id'];
        $_SESSION['user_email'] = $user['email'];
        $_SESSION['is_admin'] = $user['is_admin'];

        unset($user['password']);
        echo json_encode([
            'success' => true,
            'user' => [
                'id' => $user['id'],
                'name' => $user['name'],
                'surname' => $user['surname'],
                'email' => $user['email'],
                'is_admin' => (bool) $user['is_admin'],
            ],
        ]);
    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'message' => 'Login error: ' . $e->getMessage()]);
    }
}

function logout() {
    session_destroy();
    echo json_encode(['success' => true]);
}

function forgotPassword() {
    $email = trim($_POST['email'] ?? '');
    if (empty($email)) {
        echo json_encode(['success' => false, 'message' => 'Please enter your email']);
        return;
    }
    try {
        $db = getDB();
        $stmt = $db->prepare('SELECT id FROM users WHERE email = ?');
        $stmt->execute([$email]);
        if (!$stmt->fetch()) {
            echo json_encode(['success' => false, 'message' => 'No account found with this email']);
            return;
        }
        $newPass = 'NC' . strtoupper(substr(bin2hex(random_bytes(4)), 0, 6));
        $hashed = password_hash($newPass, PASSWORD_DEFAULT);
        $stmt = $db->prepare('UPDATE users SET password = ? WHERE email = ?');
        $stmt->execute([$hashed, $email]);
        echo json_encode(['success' => true, 'new_password' => $newPass]);
    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
    }
}
