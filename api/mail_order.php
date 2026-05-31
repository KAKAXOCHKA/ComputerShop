<?php
/**
 * Order confirmation email (UTF-8 plain text).
 * Configure MAIL_* constants in credentials.php.
 */
defined('NEXCORE_ACCESS') || die('No direct script access.');

/**
 * Send order confirmation to customer and optional copy to admin.
 *
 * @param string $order_number
 * @param string $customer_email
 * @param string $first_name
 * @param string $last_name
 * @param string $product_name
 * @param string $total_price formatted or raw number
 * @param string $phone
 * @param string $address
 * @return bool true if mail() reported success (does not guarantee delivery)
 */
function sendOrderConfirmationEmail(
    $order_number,
    $customer_email,
    $first_name,
    $last_name,
    $product_name,
    $total_price,
    $phone,
    $address
) {
    if (!defined('MAIL_ORDER_ENABLED') || !MAIL_ORDER_ENABLED) {
        return false;
    }

    if (!filter_var($customer_email, FILTER_VALIDATE_EMAIL)) {
        return false;
    }

    $from = defined('MAIL_FROM') ? MAIL_FROM : 'noreply@localhost';
    $fromName = defined('MAIL_FROM_NAME') ? MAIL_FROM_NAME : 'NEXCORE';
    $adminCopy = defined('MAIL_ADMIN_NOTIFY') ? trim((string) MAIL_ADMIN_NOTIFY) : '';

    $subject = 'Your NEXCORE order #' . $order_number;

    $body = "Hello {$first_name},\r\n\r\n";
    $body .= "Thank you for your purchase at NEXCORE.\r\n\r\n";
    $body .= "ORDER NUMBER: {$order_number}\r\n";
    $body .= "Product: {$product_name}\r\n";
    $body .= "Total: \${$total_price} USD\r\n\r\n";
    $body .= "Shipping to:\r\n{$address}\r\n\r\n";
    $body .= "Contact phone: {$phone}\r\n";
    $body .= "Email on file: {$customer_email}\r\n\r\n";
    $body .= "We will contact you shortly to confirm shipping details.\r\n\r\n";
    $body .= "- NEXCORE\r\n";

    $encodedSubject = '=?UTF-8?B?' . base64_encode($subject) . '?=';
    $encodedFromName = '=?UTF-8?B?' . base64_encode($fromName) . '?=';

    $headers = [
        'MIME-Version: 1.0',
        'Content-Type: text/plain; charset=UTF-8',
        'Content-Transfer-Encoding: 8bit',
        'From: ' . $encodedFromName . ' <' . $from . '>',
        'Reply-To: ' . $from,
    ];

    $headerStr = implode("\r\n", $headers);
    $ok = @mail($customer_email, $encodedSubject, $body, $headerStr);

    if (!$ok) {
        error_log('NEXCORE mail: customer order email failed for ' . $customer_email);
    }

    if ($adminCopy !== '' && filter_var($adminCopy, FILTER_VALIDATE_EMAIL)) {
        $adminSubject = '=?UTF-8?B?' . base64_encode('[NEXCORE] New order #' . $order_number) . '?=';
        $adminBody = "New order #{$order_number}\r\nCustomer: {$first_name} {$last_name}\r\nEmail: {$customer_email}\r\nPhone: {$phone}\r\n\r\nProduct: {$product_name}\r\nTotal: \${$total_price}\r\n\r\nAddress:\r\n{$address}\r\n";
        $adminHeaders = [
            'MIME-Version: 1.0',
            'Content-Type: text/plain; charset=UTF-8',
            'From: ' . $encodedFromName . ' <' . $from . '>',
        ];
        @mail($adminCopy, $adminSubject, $adminBody, implode("\r\n", $adminHeaders));
    }

    return (bool) $ok;
}
