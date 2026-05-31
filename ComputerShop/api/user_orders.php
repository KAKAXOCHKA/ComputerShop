<?php
/**
 * NEXCORE SHOP - User Orders API
 * Handle customer order viewing
 */

define('NEXCORE_ACCESS', true);
require_once 'config.php';

$action = $_POST['action'] ?? $_GET['action'] ?? '';

switch($action) {
    case 'get_my_orders':
        getMyOrders();
        break;
    case 'get_order_by_number':
        getOrderByNumber();
        break;
    case 'get_order_details':
        getOrderDetails();
        break;
    default:
        jsonResponse(false, null, 'Unknown action');
}

/**
 * Get orders for logged-in user
 */
function getMyOrders() {
    if (!isLoggedIn()) {
        jsonResponse(false, null, 'Please login to view your orders');
    }
    
    try {
        $db = getDB();
        $userId = $_SESSION['user_id'];
        
        $stmt = $db->prepare("
            SELECT o.*, p.name as product_name, p.type as product_type,
                   (SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = 1 LIMIT 1) as product_image
            FROM orders o
            JOIN products p ON o.product_id = p.id
            WHERE o.user_id = ? OR o.email = (SELECT email FROM users WHERE id = ?)
            ORDER BY o.created_at DESC
        ");
        $stmt->execute([$userId, $userId]);
        $orders = $stmt->fetchAll();
        
        jsonResponse(true, ['orders' => $orders]);
    } catch(PDOException $e) {
        error_log("Get my orders error: " . $e->getMessage());
        jsonResponse(false, null, 'Failed to load orders');
    }
}

/**
 * Get order by order number (for guests)
 */
function getOrderByNumber() {
    $orderNumber = sanitize($_POST['order_number'] ?? $_GET['order_number'] ?? '');
    $email = sanitize($_POST['email'] ?? $_GET['email'] ?? '');
    
    if (empty($orderNumber) || empty($email)) {
        jsonResponse(false, null, 'Order number and email are required');
    }
    
    try {
        $db = getDB();
        $stmt = $db->prepare("
            SELECT o.*, p.name as product_name, p.type as product_type, p.cpu, p.gpu, p.ram, p.storage,
                   (SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = 1 LIMIT 1) as product_image
            FROM orders o
            JOIN products p ON o.product_id = p.id
            WHERE o.order_number = ? AND o.email = ?
        ");
        $stmt->execute([$orderNumber, $email]);
        $order = $stmt->fetch();
        
        if (!$order) {
            jsonResponse(false, null, 'Order not found or email does not match');
        }
        
        jsonResponse(true, ['order' => $order]);
    } catch(PDOException $e) {
        error_log("Get order by number error: " . $e->getMessage());
        jsonResponse(false, null, 'Failed to load order');
    }
}

/**
 * Get detailed order information
 */
function getOrderDetails() {
    $orderId = $_POST['order_id'] ?? $_GET['order_id'] ?? 0;
    
    if (!$orderId) {
        jsonResponse(false, null, 'Order ID is required');
    }
    
    try {
        $db = getDB();
        
        // Check if user has access to this order
        $sql = "
            SELECT o.*, p.name as product_name, p.type as product_type, p.cpu, p.gpu, p.ram, p.storage, p.description,
                   (SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = 1 LIMIT 1) as product_image
            FROM orders o
            JOIN products p ON o.product_id = p.id
            WHERE o.id = ?
        ";
        
        if (isLoggedIn() && !isAdmin()) {
            $sql .= " AND (o.user_id = ? OR o.email = (SELECT email FROM users WHERE id = ?))";
            $stmt = $db->prepare($sql);
            $stmt->execute([$orderId, $_SESSION['user_id'], $_SESSION['user_id']]);
        } else {
            $stmt = $db->prepare($sql);
            $stmt->execute([$orderId]);
        }
        
        $order = $stmt->fetch();
        
        if (!$order) {
            jsonResponse(false, null, 'Order not found or access denied');
        }
        
        // Get all product images
        $stmt = $db->prepare("
            SELECT image_url FROM product_images 
            WHERE product_id = (SELECT product_id FROM orders WHERE id = ?)
            ORDER BY is_primary DESC, sort_order ASC
        ");
        $stmt->execute([$orderId]);
        $order['product_images'] = $stmt->fetchAll(PDO::FETCH_COLUMN);
        
        jsonResponse(true, ['order' => $order]);
    } catch(PDOException $e) {
        error_log("Get order details error: " . $e->getMessage());
        jsonResponse(false, null, 'Failed to load order details');
    }
}
?>
