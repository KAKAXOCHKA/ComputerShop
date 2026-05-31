-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Maj 29, 2026 at 11:28 AM
-- Wersja serwera: 10.4.32-MariaDB
-- Wersja PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `nexcore_shop`
--

-- --------------------------------------------------------

--
-- Struktura tabeli dla tabeli `custom_requests`
--

CREATE TABLE `custom_requests` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `phone` varchar(20) NOT NULL,
  `email` varchar(255) NOT NULL,
  `budget` varchar(100) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `status` varchar(20) DEFAULT 'new' COMMENT 'new, contacted, completed',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `custom_requests`
--

INSERT INTO `custom_requests` (`id`, `name`, `phone`, `email`, `budget`, `description`, `status`, `created_at`) VALUES
(1, 'Kristian Slaibi', '+48780627073', 'kristianslaibi69@gmail.com', 'Over $2,500', 'GTA6^ ultra settings', 'completed', '2026-05-14 11:39:17'),
(2, 'Test', '+44 465 457 476', 'example@gmail.com', '$1,000 – $1,500', 'comuter do pracy ( intel core i7 9700k)', 'new', '2026-05-29 08:58:33');

-- --------------------------------------------------------

--
-- Struktura tabeli dla tabeli `orders`
--

CREATE TABLE `orders` (
  `id` int(11) NOT NULL,
  `order_number` varchar(50) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `product_id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `surname` varchar(100) NOT NULL,
  `email` varchar(255) NOT NULL,
  `phone` varchar(20) NOT NULL,
  `address` text NOT NULL,
  `total_price` decimal(10,2) NOT NULL,
  `status` varchar(20) DEFAULT 'new' COMMENT 'new, processing, shipped, delivered, cancelled',
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `orders`
--

INSERT INTO `orders` (`id`, `order_number`, `user_id`, `product_id`, `name`, `surname`, `email`, `phone`, `address`, `total_price`, `status`, `notes`, `created_at`, `updated_at`) VALUES
(1, 'NC202601011234', NULL, 1, 'John', 'Smith', 'john@test.com', '+1-999-111-1111', '123 Main St, New York, NY 10001', 3611.00, 'cancelled', NULL, '2026-05-14 06:25:32', '2026-05-14 10:55:53'),
(2, 'NC202601011235', NULL, 3, 'Mary', 'Johnson', 'mary@test.com', '+1-999-222-2222', '456 Oak Ave, Los Angeles, CA 90001', 1322.00, 'delivered', NULL, '2026-05-14 06:25:32', '2026-05-14 10:55:56'),
(3, 'NC202601011236', NULL, 5, 'Alex', 'Williams', 'alex@test.com', '+1-999-333-3333', '789 Pine Rd, Chicago, IL 60601', 911.00, 'shipped', NULL, '2026-05-14 06:25:32', '2026-05-14 06:25:32'),
(10, 'NC202605145342', NULL, 6, 'Kristian', 'Slaibi', 'kristianslaibi69@gmail.com', '780627073', 'ul.Wyszynskiego 108, mieszkanie 7', 1689.00, 'processing', NULL, '2026-05-14 11:01:31', '2026-05-14 11:01:59'),
(11, 'NC202605148119', NULL, 1, 'm', 'i', 'ztopchikee@gmail.com', '698969550', 'wyczółkowskiego 24', 3611.00, 'delivered', NULL, '2026-05-14 11:21:26', '2026-05-14 11:21:54'),
(12, 'NC202605296759', NULL, 19, 'Kristian', 'Slaibi', 'asdaf@gmail.com', '+48 888 888 888', '108 UL.WYSZYŃSKIEGO', 5999.00, 'new', NULL, '2026-05-29 08:52:35', '2026-05-29 08:52:35'),
(13, 'NC202605297595', NULL, 19, 'Kristian', 'Slaibi', 'asdaf@gmail.com', '+48 888 888 888', '108 UL.WYSZYŃSKIEGO', 5999.00, 'new', NULL, '2026-05-29 08:52:37', '2026-05-29 08:52:37'),
(14, 'NC202605293394', NULL, 20, 'sdfsdf', 'sdfsdf', 'qweqw@gmail.com', '0780627073', 'Одес, Да Да Да', 1500.00, 'new', NULL, '2026-05-29 09:02:57', '2026-05-29 09:02:57'),
(15, 'NC202605299728', NULL, 20, 'sdfsdf', 'sdfsdf', 'qweqw@gmail.com', '0780627073', 'Одес, Да Да Да', 1500.00, 'new', NULL, '2026-05-29 09:02:59', '2026-05-29 09:02:59'),
(16, 'NC202605294416', NULL, 20, 'sdfsdf', 'sdfsdf', 'qweqw@gmail.com', '0780627073', 'Одес, Да Да Да', 1500.00, 'new', NULL, '2026-05-29 09:03:01', '2026-05-29 09:03:01');

-- --------------------------------------------------------

--
-- Struktura tabeli dla tabeli `products`
--

CREATE TABLE `products` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `type` varchar(50) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `old_price` decimal(10,2) DEFAULT NULL,
  `cpu` varchar(255) NOT NULL,
  `gpu` varchar(255) NOT NULL,
  `ram` varchar(100) NOT NULL,
  `storage` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `badge` varchar(20) DEFAULT NULL COMMENT 'hot, new, sale',
  `visible` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`id`, `name`, `type`, `price`, `old_price`, `cpu`, `gpu`, `ram`, `storage`, `description`, `badge`, `visible`, `created_at`, `updated_at`) VALUES
(1, 'NEXCORE PLASMA TITAN', 'Gaming', 3611.00, 4111.00, 'Intel Core i9-14900KS', 'RTX 4090 24GB', '64 GB DDR5', '4TB NVMe SSD', 'Flagship gaming beast for maximum performance', 'hot', 1, '2026-05-14 06:25:32', '2026-05-14 06:25:32'),
(2, 'NEXCORE PLASMA ULTRA', 'Gaming', 2100.00, 2444.00, 'AMD Ryzen 9 7950X', 'RTX 4080 16GB', '32 GB DDR5', '2TB NVMe SSD', 'Top gaming build with excellent price-to-performance ratio', 'new', 1, '2026-05-14 06:25:32', '2026-05-14 06:25:32'),
(3, 'NEXCORE PLASMA STRIKE', 'Gaming', 1322.00, NULL, 'Intel Core i7-14700K', 'RTX 4070 Ti 12GB', '32 GB DDR5', '1TB NVMe SSD', 'Powerful gaming PC for 1440p gaming', NULL, 1, '2026-05-14 06:25:32', '2026-05-14 06:25:32'),
(4, 'NEXCORE AMPERE PRO', 'Professional', 3089.00, NULL, 'AMD Ryzen 9 7950X', 'RTX 4090 24GB', '128 GB DDR5', '8TB NVMe SSD', 'Workstation for 3D rendering and AI', 'new', 1, '2026-05-14 06:25:32', '2026-05-14 06:25:32'),
(5, 'NEXCORE PLASMA ENTRY', 'Gaming', 911.00, 1056.00, 'Intel Core i5-14600K', 'RTX 4060 Ti 16GB', '16 GB DDR5', '1TB NVMe SSD', 'Great start in gaming', 'sale', 0, '2026-05-14 06:25:32', '2026-05-29 08:38:22'),
(6, 'NEXCORE STREAM PRO', 'Streaming', 1689.00, NULL, 'AMD Ryzen 7 7800X3D', 'RTX 4070 Super 12GB', '32 GB DDR5', '2TB NVMe SSD', 'Perfect build for streaming and content creation', NULL, 1, '2026-05-14 06:25:32', '2026-05-14 06:25:32'),
(19, 'HyperPC', 'Gaming', 5999.00, 8999.00, 'Intel core i9 12900k', 'RTX 5080 TI', '64 GB DDR5', 'x2 SSD M2 2TB', 'Охуенный игровой пк', 'hot', 1, '2026-05-14 11:00:39', '2026-05-14 11:00:39'),
(20, 'Test', 'Workstation', 1500.00, 2000.00, 'intel i9 9900k', 'RTX 5070TI', '32 GB DDR 5', 'x2 SSD M2 2TB', 'Laptop roboczy', 'new', 1, '2026-05-29 09:02:03', '2026-05-29 09:02:03');

-- --------------------------------------------------------

--
-- Struktura tabeli dla tabeli `product_images`
--

CREATE TABLE `product_images` (
  `id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `image_url` varchar(500) NOT NULL,
  `is_primary` tinyint(1) DEFAULT 0,
  `sort_order` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `product_images`
--

INSERT INTO `product_images` (`id`, `product_id`, `image_url`, `is_primary`, `sort_order`, `created_at`) VALUES
(1, 1, 'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=800', 1, 1, '2026-05-14 06:25:32'),
(2, 1, 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=800', 0, 2, '2026-05-14 06:25:32'),
(3, 1, 'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=800', 0, 3, '2026-05-14 06:25:32'),
(4, 2, 'https://images.unsplash.com/photo-1591799265444-d66432b91588?w=800', 1, 1, '2026-05-14 06:25:32'),
(5, 2, 'https://images.unsplash.com/photo-1600861194942-f883de0dfe96?w=800', 0, 2, '2026-05-14 06:25:32'),
(6, 2, 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=800', 0, 3, '2026-05-14 06:25:32'),
(7, 3, 'https://images.unsplash.com/photo-1593640495253-23196b27a87f?w=800', 1, 1, '2026-05-14 06:25:32'),
(8, 3, 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=800', 0, 2, '2026-05-14 06:25:32'),
(9, 4, 'https://images.unsplash.com/photo-1587202372583-49330a15584d?w=800', 1, 1, '2026-05-14 06:25:32'),
(10, 4, 'https://images.unsplash.com/photo-1593640497055-23d04d1f0b47?w=800', 0, 2, '2026-05-14 06:25:32'),
(11, 5, 'https://images.unsplash.com/photo-1591238371732-d75eb8d9f6e7?w=800', 1, 1, '2026-05-14 06:25:32'),
(12, 5, 'https://images.unsplash.com/photo-1587202372616-b43abea06c2a?w=800', 0, 2, '2026-05-14 06:25:32'),
(13, 6, 'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=800', 1, 1, '2026-05-14 06:25:32'),
(14, 6, 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=800', 0, 2, '2026-05-14 06:25:32'),
(15, 1, 'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=800', 1, 1, '2026-05-14 10:55:00'),
(16, 1, 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=800', 0, 2, '2026-05-14 10:55:00'),
(17, 1, 'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=800', 0, 3, '2026-05-14 10:55:00'),
(18, 2, 'https://images.unsplash.com/photo-1591799265444-d66432b91588?w=800', 1, 1, '2026-05-14 10:55:00'),
(19, 2, 'https://images.unsplash.com/photo-1600861194942-f883de0dfe96?w=800', 0, 2, '2026-05-14 10:55:00'),
(20, 2, 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=800', 0, 3, '2026-05-14 10:55:00'),
(21, 3, 'https://images.unsplash.com/photo-1593640495253-23196b27a87f?w=800', 1, 1, '2026-05-14 10:55:00'),
(22, 3, 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=800', 0, 2, '2026-05-14 10:55:00'),
(23, 4, 'https://images.unsplash.com/photo-1587202372583-49330a15584d?w=800', 1, 1, '2026-05-14 10:55:00'),
(24, 4, 'https://images.unsplash.com/photo-1593640497055-23d04d1f0b47?w=800', 0, 2, '2026-05-14 10:55:00'),
(25, 5, 'https://images.unsplash.com/photo-1591238371732-d75eb8d9f6e7?w=800', 1, 1, '2026-05-14 10:55:00'),
(26, 5, 'https://images.unsplash.com/photo-1587202372616-b43abea06c2a?w=800', 0, 2, '2026-05-14 10:55:00'),
(27, 6, 'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=800', 1, 1, '2026-05-14 10:55:00'),
(28, 6, 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=800', 0, 2, '2026-05-14 10:55:00'),
(29, 1, 'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=800', 1, 1, '2026-05-14 10:55:17'),
(30, 1, 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=800', 0, 2, '2026-05-14 10:55:17'),
(31, 1, 'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=800', 0, 3, '2026-05-14 10:55:17'),
(32, 2, 'https://images.unsplash.com/photo-1591799265444-d66432b91588?w=800', 1, 1, '2026-05-14 10:55:17'),
(33, 2, 'https://images.unsplash.com/photo-1600861194942-f883de0dfe96?w=800', 0, 2, '2026-05-14 10:55:17'),
(34, 2, 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=800', 0, 3, '2026-05-14 10:55:17'),
(35, 3, 'https://images.unsplash.com/photo-1593640495253-23196b27a87f?w=800', 1, 1, '2026-05-14 10:55:17'),
(36, 3, 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=800', 0, 2, '2026-05-14 10:55:17'),
(37, 4, 'https://images.unsplash.com/photo-1587202372583-49330a15584d?w=800', 1, 1, '2026-05-14 10:55:17'),
(38, 4, 'https://images.unsplash.com/photo-1593640497055-23d04d1f0b47?w=800', 0, 2, '2026-05-14 10:55:17'),
(39, 5, 'https://images.unsplash.com/photo-1591238371732-d75eb8d9f6e7?w=800', 1, 1, '2026-05-14 10:55:17'),
(40, 5, 'https://images.unsplash.com/photo-1587202372616-b43abea06c2a?w=800', 0, 2, '2026-05-14 10:55:17'),
(41, 6, 'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=800', 1, 1, '2026-05-14 10:55:17'),
(42, 6, 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=800', 0, 2, '2026-05-14 10:55:17'),
(43, 19, 'https://hyperpc.ru/images/product/gaming-pc/play/play-5/dc-ch260/main/black/water/hyperpc-play-5-black-water-full.jpg', 1, 1, '2026-05-14 11:00:39');

-- --------------------------------------------------------

--
-- Struktura tabeli dla tabeli `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `surname` varchar(100) NOT NULL,
  `email` varchar(255) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `is_admin` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `surname`, `email`, `phone`, `password`, `is_admin`, `created_at`) VALUES
(1, 'Admin', 'NEXCORE', 'admin@nexcore.com', '+1-800-111-2233', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 1, '2026-05-14 06:25:32'),
(2, 'Кристиан', 'Slaibi', 'kristianslaibi69@gmail.com', '+380780627073', '$2y$10$BdpJO0zD1N5g2eotoFG1ue/TAsKcyogRjYNTbWE8UAwij/GBLtRqK', 1, '2026-05-14 06:27:47'),
(5, 'popka', 'mami', 'ztopchikee@gmal.com', '+48 880 817 626', '$2y$10$22oCZBVQxexYDze2XTu02uPgPSl6cY86kIflTnoLOf519GdOaptjq', 0, '2026-05-14 11:23:15'),
(6, 'Kristian', 'Smith', 'examle@gmail.com', '+48 666 888 999', '$2y$10$IHZDFv.hzIk/xagcwsQEa.LeRYcgbiHNyr9yFT/saBsXDZGDnUIia', 0, '2026-05-29 08:56:36');

--
-- Indeksy dla zrzutów tabel
--

--
-- Indeksy dla tabeli `custom_requests`
--
ALTER TABLE `custom_requests`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_status` (`status`);

--
-- Indeksy dla tabeli `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `order_number` (`order_number`),
  ADD KEY `product_id` (`product_id`),
  ADD KEY `idx_order_number` (`order_number`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_email` (`email`);

--
-- Indeksy dla tabeli `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_type` (`type`),
  ADD KEY `idx_price` (`price`),
  ADD KEY `idx_visible` (`visible`);

--
-- Indeksy dla tabeli `product_images`
--
ALTER TABLE `product_images`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_product_id` (`product_id`),
  ADD KEY `idx_primary` (`is_primary`);

--
-- Indeksy dla tabeli `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `custom_requests`
--
ALTER TABLE `custom_requests`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `orders`
--
ALTER TABLE `orders`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT for table `product_images`
--
ALTER TABLE `product_images`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=44;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `orders_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `product_images`
--
ALTER TABLE `product_images`
  ADD CONSTRAINT `product_images_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
