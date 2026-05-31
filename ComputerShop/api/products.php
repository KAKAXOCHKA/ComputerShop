<?php
/**
 * NEXCORE SHOP - Products API
 * Handle product operations with images support
 */

define('NEXCORE_ACCESS', true);
require_once 'config.php';

$action = $_POST['action'] ?? $_GET['action'] ?? '';

switch($action) {
    case 'get_products':
        getProducts();
        break;
    case 'get_product':
        getProduct();
        break;
    case 'add_product':
        addProduct();
        break;
    case 'update_product':
        updateProduct();
        break;
    case 'delete_product':
        deleteProduct();
        break;
    case 'set_visible':
        setProductVisible();
        break;
    default:
        jsonResponse(false, null, 'Unknown action');
}

/**
 * Get products with filters and images
 */
function getProducts() {
    try {
        $db = getDB();
        
        $sql = "SELECT p.*, 
                (SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = 1 LIMIT 1) as primary_image,
                (SELECT COUNT(*) FROM product_images WHERE product_id = p.id) as image_count
                FROM products p 
                WHERE p.visible = 1";
        $params = [];

        // Filters
        if (!empty($_POST['search'])) {
            $sql .= " AND (p.name LIKE ? OR p.cpu LIKE ? OR p.gpu LIKE ?)";
            $search = '%' . $_POST['search'] . '%';
            $params[] = $search;
            $params[] = $search;
            $params[] = $search;
        }

        if (!empty($_POST['type'])) {
            $sql .= " AND p.type = ?";
            $params[] = $_POST['type'];
        }

        if (!empty($_POST['gpu'])) {
            $sql .= " AND p.gpu LIKE ?";
            $params[] = '%' . $_POST['gpu'] . '%';
        }

        if (!empty($_POST['price_min'])) {
            $sql .= " AND p.price >= ?";
            $params[] = $_POST['price_min'];
        }

        if (!empty($_POST['price_max'])) {
            $sql .= " AND p.price <= ?";
            $params[] = $_POST['price_max'];
        }

        $sql .= " ORDER BY p.created_at DESC";

        $stmt = $db->prepare($sql);
        $stmt->execute($params);
        $products = $stmt->fetchAll();

        jsonResponse(true, ['products' => $products]);
    } catch(PDOException $e) {
        error_log("Get products error: " . $e->getMessage());
        jsonResponse(false, null, 'Failed to load products');
    }
}

/**
 * Get single product with all images
 */
function getProduct() {
    $id = $_POST['id'] ?? $_GET['id'] ?? 0;

    if (!$id) {
        jsonResponse(false, null, 'Product ID is required');
    }

    try {
        $db = getDB();
        
        // Get product
        $stmt = $db->prepare("SELECT * FROM products WHERE id = ?");
        $stmt->execute([$id]);
        $product = $stmt->fetch();

        if (!$product) {
            jsonResponse(false, null, 'Product not found');
        }
        
        // Get images
        $stmt = $db->prepare("
            SELECT id, image_url, is_primary, sort_order 
            FROM product_images 
            WHERE product_id = ? 
            ORDER BY is_primary DESC, sort_order ASC
        ");
        $stmt->execute([$id]);
        $product['images'] = $stmt->fetchAll();

        jsonResponse(true, ['product' => $product]);
    } catch(PDOException $e) {
        error_log("Get product error: " . $e->getMessage());
        jsonResponse(false, null, 'Failed to load product');
    }
}

/**
 * Add new product
 */
function addProduct() {
    if (!isAdmin()) {
        jsonResponse(false, null, 'Access denied');
    }

    $name = sanitize($_POST['name'] ?? '');
    $type = sanitize($_POST['type'] ?? '');
    $price = floatval($_POST['price'] ?? 0);
    $oldPrice = !empty($_POST['old_price']) ? floatval($_POST['old_price']) : null;
    $cpu = sanitize($_POST['cpu'] ?? '');
    $gpu = sanitize($_POST['gpu'] ?? '');
    $ram = sanitize($_POST['ram'] ?? '');
    $storage = sanitize($_POST['storage'] ?? '');
    $description = sanitize($_POST['description'] ?? '');
    $badge = sanitize($_POST['badge'] ?? '');

    if (empty($name) || empty($type) || $price <= 0 || empty($cpu) || empty($gpu) || empty($ram) || empty($storage)) {
        jsonResponse(false, null, 'Please fill all required fields');
    }

    try {
        $db = getDB();
        $stmt = $db->prepare("
            INSERT INTO products (name, type, price, old_price, cpu, gpu, ram, storage, description, badge, created_at) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
        ");
        $stmt->execute([$name, $type, $price, $oldPrice, $cpu, $gpu, $ram, $storage, $description, $badge]);

        $newId = (int) $db->lastInsertId();
        $primaryUrl = trim((string) ($_POST['primary_image_url'] ?? ''));
        if ($newId > 0 && $primaryUrl !== '') {
            $img = $db->prepare(
                'INSERT INTO product_images (product_id, image_url, is_primary, sort_order) VALUES (?, ?, 1, 1)'
            );
            $img->execute([$newId, $primaryUrl]);
        }

        jsonResponse(true, ['id' => $newId], 'Product added successfully');
    } catch(PDOException $e) {
        error_log("Add product error: " . $e->getMessage());
        jsonResponse(false, null, 'Failed to add product');
    }
}

/**
 * Update product
 */
function updateProduct() {
    if (!isAdmin()) {
        jsonResponse(false, null, 'Access denied');
    }

    $id = $_POST['id'] ?? 0;
    $name = sanitize($_POST['name'] ?? '');
    $type = sanitize($_POST['type'] ?? '');
    $price = floatval($_POST['price'] ?? 0);
    $oldPrice = !empty($_POST['old_price']) ? floatval($_POST['old_price']) : null;
    $cpu = sanitize($_POST['cpu'] ?? '');
    $gpu = sanitize($_POST['gpu'] ?? '');
    $ram = sanitize($_POST['ram'] ?? '');
    $storage = sanitize($_POST['storage'] ?? '');
    $description = sanitize($_POST['description'] ?? '');
    $badge = sanitize($_POST['badge'] ?? '');

    if (!$id || empty($name) || empty($type) || $price <= 0) {
        jsonResponse(false, null, 'Invalid data');
    }

    try {
        $db = getDB();
        $stmt = $db->prepare("
            UPDATE products 
            SET name=?, type=?, price=?, old_price=?, cpu=?, gpu=?, ram=?, storage=?, description=?, badge=?, updated_at=NOW()
            WHERE id=?
        ");
        $stmt->execute([$name, $type, $price, $oldPrice, $cpu, $gpu, $ram, $storage, $description, $badge, $id]);

        jsonResponse(true, null, 'Product updated successfully');
    } catch(PDOException $e) {
        error_log("Update product error: " . $e->getMessage());
        jsonResponse(false, null, 'Failed to update product');
    }
}

/**
 * Delete product
 */
function deleteProduct() {
    if (!isAdmin()) {
        jsonResponse(false, null, 'Access denied');
    }

    $id = $_POST['id'] ?? 0;

    if (!$id) {
        jsonResponse(false, null, 'Product ID is required');
    }

    try {
        $db = getDB();
        $stmt = $db->prepare("DELETE FROM products WHERE id = ?");
        $stmt->execute([$id]);

        jsonResponse(true, null, 'Product deleted successfully');
    } catch(PDOException $e) {
        error_log("Delete product error: " . $e->getMessage());
        jsonResponse(false, null, 'Failed to delete product');
    }
}

function setProductVisible() {
    if (!isAdmin()) {
        jsonResponse(false, null, 'Access denied');
    }

    $id = (int) ($_POST['id'] ?? 0);
    $visible = isset($_POST['visible']) ? ((int) $_POST['visible'] ? 1 : 0) : -1;

    if ($id <= 0 || $visible < 0) {
        jsonResponse(false, null, 'Invalid data');
    }

    try {
        $db = getDB();
        $stmt = $db->prepare('UPDATE products SET visible = ?, updated_at = NOW() WHERE id = ?');
        $stmt->execute([$visible, $id]);
        jsonResponse(true, null, 'Visibility updated');
    } catch (PDOException $e) {
        error_log('Set visible error: ' . $e->getMessage());
        jsonResponse(false, null, 'Failed to update visibility');
    }
}
?>
