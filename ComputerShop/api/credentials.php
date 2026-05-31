<?php
/**
 * Local database credentials (XAMMPP default).
 * For production: use strong password and restrict MySQL user to this DB only.
 */
defined('NEXCORE_ACCESS') || die('No direct script access.');

if (!defined('DB_HOST')) {
    define('DB_HOST', 'localhost');
    define('DB_USER', 'root');
    define('DB_PASS', '');
    define('DB_NAME', 'nexcore_shop');
}

/*
 * Order emails (PHP mail()). On XAMPP/Windows you often need Mercury or real SMTP.
 * Set MAIL_ORDER_ENABLED to true when your server can send mail (production or configured localhost).
 */
if (!defined('MAIL_ORDER_ENABLED')) {
    define('MAIL_ORDER_ENABLED', true);
}
if (!defined('MAIL_FROM')) {
    define('MAIL_FROM', 'noreply@localhost');
}
if (!defined('MAIL_FROM_NAME')) {
    define('MAIL_FROM_NAME', 'NEXCORE');
}
/** Optional: store email for new-order alerts (leave empty to skip). */
if (!defined('MAIL_ADMIN_NOTIFY')) {
    define('MAIL_ADMIN_NOTIFY', '');
}
