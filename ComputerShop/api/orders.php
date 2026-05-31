<?php
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/mail_order.php';

$action = $_POST['action'] ?? '';

switch ($action) {
    case 'create_order':
        createOrder();
        break;
    default:
        echo json_encode(['success' => false, 'message' => 'Unknown action']);
}

function createOrder() {
    $product_id = (int) ($_POST['product_id'] ?? 0);
    $name = trim((string) ($_POST['name'] ?? ''));
    $surname = trim((string) ($_POST['surname'] ?? ''));
    $email = trim((string) ($_POST['email'] ?? ''));
    $phone = trim((string) ($_POST['phone'] ?? ''));
    $address = trim((string) ($_POST['address'] ?? ''));

    if ($name === '' || $surname === '' || $email === '' || $phone === '' || $address === '' || $product_id <= 0) {
        echo json_encode(['success' => false, 'message' => 'Please fill in all fields']);
        return;
    }

    try {
        $db = getDB();

        $stmt = $db->prepare('SELECT * FROM products WHERE id = ?');
        $stmt->execute([$product_id]);
        $product = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$product) {
            echo json_encode(['success' => false, 'message' => 'Product not found']);
            return;
        }

        $order_number = 'NC' . date('Ymd') . random_int(1000, 9999);

        $stmt = $db->prepare(
            'INSERT INTO orders (order_number, product_id, name, surname, email, phone, address, total_price, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, \'new\', NOW())'
        );
        $stmt->execute([$order_number, $product_id, $name, $surname, $email, $phone, $address, $product['price']]);

        $priceStr = number_format((float) $product['price'], 2, '.', '');
        $emailSent = sendOrderConfirmationEmail(
            $order_number,
            $email,
            $name,
            $surname,
            $product['name'],
            $priceStr,
            $phone,
            $address
        );

        echo json_encode([
            'success' => true,
            'order_number' => $order_number,
            'email_sent' => $emailSent,
            'message' => 'Order placed successfully',
        ]);
    } catch (PDOException $e) {
        error_log('createOrder: ' . $e->getMessage());
        echo json_encode(['success' => false, 'message' => 'Could not complete order. Please try again.']);
    }
}
