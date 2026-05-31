<?php
/**
 * NEXCORE SHOP - Product Images API
 * Handle product image operations
 */

define('NEXCORE_ACCESS', true);
require_once 'config.php';

$action = $_POST['action'] ?? $_GET['action'] ?? '';

switch($action) {
    case 'get_images':
        getProductImages();
        break;
    case 'add_image':
        addProductImage();
        break;
    case 'delete_image':
        deleteProductImage();
        break;
    case 'set_primary':
        setPrimaryImage();
        break;
    default:
        jsonResponse(false, null, 'Unknown action');
}

/**
 * Get all images for a product
 */
function getProductImages() {
    $productId = $_GET['product_id'] ?? $_POST['product_id'] ?? 0;
    
    if (!$productId) {
        jsonResponse(false, null, 'Product ID is required');
    }
    
    try {
        $db = getDB();
        $stmt = $db->prepare("
            SELECT id, image_url, is_primary, sort_order 
            FROM product_images 
            WHERE product_id = ? 
            ORDER BY is_primary DESC, sort_order ASC
        ");
        $stmt->execute([$productId]);
        $images = $stmt->fetchAll();
        
        jsonResponse(true, ['images' => $images]);
    } catch(PDOException $e) {
        error_log("Get product images error: " . $e->getMessage());
        jsonResponse(false, null, 'Failed to load images');
    }
}

/**
 * Add new image to product
 */
function addProductImage() {
    if (!isAdmin()) {
        jsonResponse(false, null, 'Access denied');
    }
    
    $productId = $_POST['product_id'] ?? 0;
    $imageUrl = sanitize($_POST['image_url'] ?? '');
    $isPrimary = isset($_POST['is_primary']) ? 1 : 0;
    
    if (!$productId || !$imageUrl) {
        jsonResponse(false, null, 'Product ID and image URL are required');
    }
    
    try {
        $db = getDB();
        
        // If setting as primary, unset other primary images
        if ($isPrimary) {
            $stmt = $db->prepare("UPDATE product_images SET is_primary = 0 WHERE product_id = ?");
            $stmt->execute([$productId]);
        }
        
        // Get next sort order
        $stmt = $db->prepare("SELECT COALESCE(MAX(sort_order), 0) + 1 as next_order FROM product_images WHERE product_id = ?");
        $stmt->execute([$productId]);
        $sortOrder = $stmt->fetch()['next_order'];
        
        // Insert new image
        $stmt = $db->prepare("
            INSERT INTO product_images (product_id, image_url, is_primary, sort_order) 
            VALUES (?, ?, ?, ?)
        ");
        $stmt->execute([$productId, $imageUrl, $isPrimary, $sortOrder]);
        
        jsonResponse(true, ['id' => $db->lastInsertId()], 'Image added successfully');
    } catch(PDOException $e) {
        error_log("Add product image error: " . $e->getMessage());
        jsonResponse(false, null, 'Failed to add image');
    }
}

/**
 * Delete product image
 */
function deleteProductImage() {
    if (!isAdmin()) {
        jsonResponse(false, null, 'Access denied');
    }
    
    $imageId = $_POST['image_id'] ?? 0;
    
    if (!$imageId) {
        jsonResponse(false, null, 'Image ID is required');
    }
    
    try {
        $db = getDB();
        $stmt = $db->prepare("DELETE FROM product_images WHERE id = ?");
        $stmt->execute([$imageId]);
        
        jsonResponse(true, null, 'Image deleted successfully');
    } catch(PDOException $e) {
        error_log("Delete product image error: " . $e->getMessage());
        jsonResponse(false, null, 'Failed to delete image');
    }
}

/**
 * Set image as primary
 */
function setPrimaryImage() {
    if (!isAdmin()) {
        jsonResponse(false, null, 'Access denied');
    }
    
    $imageId = $_POST['image_id'] ?? 0;
    
    if (!$imageId) {
        jsonResponse(false, null, 'Image ID is required');
    }
    
    try {
        $db = getDB();
        
        // Get product_id for this image
        $stmt = $db->prepare("SELECT product_id FROM product_images WHERE id = ?");
        $stmt->execute([$imageId]);
        $productId = $stmt->fetch()['product_id'] ?? 0;
        
        if (!$productId) {
            jsonResponse(false, null, 'Image not found');
        }
        
        // Unset all primary images for this product
        $stmt = $db->prepare("UPDATE product_images SET is_primary = 0 WHERE product_id = ?");
        $stmt->execute([$productId]);
        
        // Set this image as primary
        $stmt = $db->prepare("UPDATE product_images SET is_primary = 1 WHERE id = ?");
        $stmt->execute([$imageId]);
        
        jsonResponse(true, null, 'Primary image updated');
    } catch(PDOException $e) {
        error_log("Set primary image error: " . $e->getMessage());
        jsonResponse(false, null, 'Failed to update primary image');
    }
}
?>
