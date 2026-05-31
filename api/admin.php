<?php
/**
 * Admin JSON API — requires logged-in admin (PHP session).
 */
define('NEXCORE_ACCESS', true);
require_once __DIR__ . '/config.php';

header('Content-Type: application/json; charset=utf-8');

if (!isAdmin()) {
    echo json_encode(['success' => false, 'message' => 'Access denied']);
    exit;
}

$action = $_GET['action'] ?? $_POST['action'] ?? '';

switch ($action) {
    case 'get_stats':
        getStats();
        break;
    case 'get_orders':
        getOrders();
        break;
    case 'update_order_status':
        updateOrderStatus();
        break;
    case 'get_all_products':
        getAllProducts();
        break;
    case 'get_custom_requests':
        getCustomRequests();
        break;
    case 'update_custom_status':
        updateCustomStatus();
        break;
    default:
        echo json_encode(['success' => false, 'message' => 'Unknown action']);
}

function getStats() {
    try {
        $db = getDB();

        $total_orders = (int) $db->query('SELECT COUNT(*) FROM orders')->fetchColumn();
        $new_orders = (int) $db->query("SELECT COUNT(*) FROM orders WHERE status = 'new'")->fetchColumn();
        $total_products = (int) $db->query('SELECT COUNT(*) FROM products')->fetchColumn();
        $custom_requests = (int) $db->query('SELECT COUNT(*) FROM custom_requests')->fetchColumn();

        echo json_encode([
            'success' => true,
            'stats' => [
                'total_orders' => $total_orders,
                'new_orders' => $new_orders,
                'total_products' => $total_products,
                'custom_requests' => $custom_requests,
            ],
        ], JSON_UNESCAPED_UNICODE);
    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
    }
}

function getOrders() {
    try {
        $db = getDB();
        $stmt = $db->query(
            'SELECT o.*, p.name AS product_name
             FROM orders o
             LEFT JOIN products p ON o.product_id = p.id
             ORDER BY o.created_at DESC'
        );
        $orders = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode(['success' => true, 'orders' => $orders], JSON_UNESCAPED_UNICODE);
    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
    }
}

function updateOrderStatus() {
    $id = (int) ($_POST['id'] ?? 0);
    $status = trim((string) ($_POST['status'] ?? ''));
    $allowed = ['new', 'processing', 'shipped', 'delivered', 'cancelled'];

    if ($id <= 0 || !in_array($status, $allowed, true)) {
        echo json_encode(['success' => false, 'message' => 'Invalid data']);
        return;
    }

    try {
        $db = getDB();
        $stmt = $db->prepare('UPDATE orders SET status = ?, updated_at = NOW() WHERE id = ?');
        $stmt->execute([$status, $id]);
        echo json_encode(['success' => true]);
    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
    }
}

function getAllProducts() {
    try {
        $db = getDB();
        $stmt = $db->query(
            "SELECT p.*,
                (SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = 1 LIMIT 1) AS primary_image
             FROM products p
             ORDER BY p.created_at DESC"
        );
        $products = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode(['success' => true, 'products' => $products], JSON_UNESCAPED_UNICODE);
    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
    }
}

function getCustomRequests() {
    try {
        $db = getDB();
        $stmt = $db->query('SELECT * FROM custom_requests ORDER BY created_at DESC');
        $requests = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode(['success' => true, 'requests' => $requests], JSON_UNESCAPED_UNICODE);
    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
    }
}

function updateCustomStatus() {
    $id = (int) ($_POST['id'] ?? 0);
    $status = trim((string) ($_POST['status'] ?? ''));
    $allowed = ['new', 'contacted', 'completed'];

    if ($id <= 0 || !in_array($status, $allowed, true)) {
        echo json_encode(['success' => false, 'message' => 'Invalid data']);
        return;
    }

    try {
        $db = getDB();
        $stmt = $db->prepare('UPDATE custom_requests SET status = ? WHERE id = ?');
        $stmt->execute([$status, $id]);
        echo json_encode(['success' => true]);
    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
    }
}
