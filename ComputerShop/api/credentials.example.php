<?php
/**
 * Copy to credentials.php and adjust. Blocked from direct web access via .htaccess.
 */
defined('NEXCORE_ACCESS') || die('No direct script access.');

define('DB_HOST', 'localhost');
define('DB_USER', 'root');
define('DB_PASS', '');
define('DB_NAME', 'nexcore_shop');

/** Send order confirmation email with PHP mail(). Set false on local XAMPP if mail is not configured. */
define('MAIL_ORDER_ENABLED', true);
/** Must be a valid mailbox on your domain in production (SPF/DKIM help deliverability). */
define('MAIL_FROM', 'noreply@yourdomain.com');
define('MAIL_FROM_NAME', 'NEXCORE');
/** Optional: receive a copy of each new order (leave '' to disable). */
define('MAIL_ADMIN_NOTIFY', '');
