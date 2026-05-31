<?php
/**
 * Custom PC build requests — matches database_v2.custom_requests
 */
define('NEXCORE_ACCESS', true);
require_once __DIR__ . '/config.php';

$action = $_POST['action'] ?? '';

switch ($action) {
    case 'add_custom_request':
        addCustomRequest();
        break;
    default:
        jsonResponse(false, null, 'Unknown action');
}

function addCustomRequest() {
    $name = trim($_POST['name'] ?? '');
    $phone = trim($_POST['phone'] ?? '');
    $email = trim($_POST['email'] ?? '');
    $budget = trim($_POST['budget'] ?? '');
    $description = trim($_POST['description'] ?? '');

    if ($name === '' || $phone === '' || $email === '') {
        jsonResponse(false, null, 'Please enter name, phone, and email');
    }

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        jsonResponse(false, null, 'Invalid email format');
    }

    try {
        $db = getDB();
        $stmt = $db->prepare(
            'INSERT INTO custom_requests (name, phone, email, budget, description, status, created_at) VALUES (?, ?, ?, ?, ?, \'new\', NOW())'
        );
        $stmt->execute([$name, $phone, $email, $budget ?: null, $description ?: null]);

        jsonResponse(true, ['id' => $db->lastInsertId()], 'Request submitted');
    } catch (PDOException $e) {
        error_log('Custom request error: ' . $e->getMessage());
        jsonResponse(false, null, 'Could not save your request');
    }
}
