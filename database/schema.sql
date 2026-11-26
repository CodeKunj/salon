-- ===================================================================
-- AURA Salon & Aesthetics - Database Schema & Comprehensive Seed Data
-- Compatible with MySQL 8.0+ / MariaDB 10.4+ / cPanel phpMyAdmin
-- ===================================================================

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS `audit_logs`;
DROP TABLE IF EXISTS `booking_items`;
DROP TABLE IF EXISTS `bookings`;
DROP TABLE IF EXISTS `promo_codes`;
DROP TABLE IF EXISTS `special_closures`;
DROP TABLE IF EXISTS `business_hours`;
DROP TABLE IF EXISTS `stylist_schedules`;
DROP TABLE IF EXISTS `stylist_services`;
DROP TABLE IF EXISTS `stylists`;
DROP TABLE IF EXISTS `package_services`;
DROP TABLE IF EXISTS `packages`;
DROP TABLE IF EXISTS `services`;
DROP TABLE IF EXISTS `categories`;
DROP TABLE IF EXISTS `settings`;
DROP TABLE IF EXISTS `cms_hero`;
DROP TABLE IF EXISTS `cms_gallery`;
DROP TABLE IF EXISTS `cms_testimonials`;
DROP TABLE IF EXISTS `cms_faqs`;
DROP TABLE IF EXISTS `users`;
SET FOREIGN_KEY_CHECKS = 1;

-- --------------------------------------------------------
-- Table: users
-- --------------------------------------------------------
CREATE TABLE `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(150) NOT NULL,
  `email` VARCHAR(191) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `role` ENUM('super_admin', 'branch_manager', 'receptionist', 'stylist', 'customer') NOT NULL DEFAULT 'receptionist',
  `phone` VARCHAR(50) DEFAULT NULL,
  `avatar` VARCHAR(255) DEFAULT NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `two_factor_enabled` TINYINT(1) NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table: categories
-- --------------------------------------------------------
CREATE TABLE `categories` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `slug` VARCHAR(100) NOT NULL UNIQUE,
  `description` TEXT,
  `image_url` VARCHAR(255) DEFAULT NULL,
  `icon` VARCHAR(50) DEFAULT NULL,
  `sort_order` INT NOT NULL DEFAULT 0,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table: services
-- --------------------------------------------------------
CREATE TABLE `services` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `category_id` INT NOT NULL,
  `name` VARCHAR(150) NOT NULL,
  `slug` VARCHAR(150) NOT NULL UNIQUE,
  `description` TEXT,
  `duration_minutes` INT NOT NULL DEFAULT 45,
  `base_price` DECIMAL(10,2) NOT NULL,
  `offer_price` DECIMAL(10,2) DEFAULT NULL,
  `image_url` VARCHAR(255) DEFAULT NULL,
  `is_featured` TINYINT(1) NOT NULL DEFAULT 0,
  `is_taxable` TINYINT(1) NOT NULL DEFAULT 1,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `sort_order` INT NOT NULL DEFAULT 0,
  FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table: packages
-- --------------------------------------------------------
CREATE TABLE `packages` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(150) NOT NULL,
  `slug` VARCHAR(150) NOT NULL UNIQUE,
  `tagline` VARCHAR(255) DEFAULT NULL,
  `description` TEXT,
  `price` DECIMAL(10,2) NOT NULL,
  `original_price` DECIMAL(10,2) DEFAULT NULL,
  `duration_minutes` INT NOT NULL DEFAULT 120,
  `image_url` VARCHAR(255) DEFAULT NULL,
  `is_featured` TINYINT(1) NOT NULL DEFAULT 1,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `sort_order` INT NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table: package_services
-- --------------------------------------------------------
CREATE TABLE `package_services` (
  `package_id` INT NOT NULL,
  `service_id` INT NOT NULL,
  PRIMARY KEY (`package_id`, `service_id`),
  FOREIGN KEY (`package_id`) REFERENCES `packages`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`service_id`) REFERENCES `services`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table: stylists
-- --------------------------------------------------------
CREATE TABLE `stylists` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT DEFAULT NULL,
  `name` VARCHAR(150) NOT NULL,
  `role_title` VARCHAR(100) NOT NULL,
  `bio` TEXT,
  `avatar_url` VARCHAR(255) DEFAULT NULL,
  `rating` DECIMAL(2,1) NOT NULL DEFAULT 4.9,
  `review_count` INT NOT NULL DEFAULT 120,
  `commission_pct` DECIMAL(5,2) NOT NULL DEFAULT 15.00,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `sort_order` INT NOT NULL DEFAULT 0,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table: stylist_services
-- --------------------------------------------------------
CREATE TABLE `stylist_services` (
  `stylist_id` INT NOT NULL,
  `service_id` INT NOT NULL,
  PRIMARY KEY (`stylist_id`, `service_id`),
  FOREIGN KEY (`stylist_id`) REFERENCES `stylists`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`service_id`) REFERENCES `services`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table: stylist_schedules
-- --------------------------------------------------------
CREATE TABLE `stylist_schedules` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `stylist_id` INT NOT NULL,
  `day_of_week` TINYINT NOT NULL, -- 0=Sun, 1=Mon, ..., 6=Sat
  `start_time` TIME NOT NULL DEFAULT '09:00:00',
  `end_time` TIME NOT NULL DEFAULT '20:00:00',
  `break_start` TIME DEFAULT '13:00:00',
  `break_end` TIME DEFAULT '14:00:00',
  `is_working` TINYINT(1) NOT NULL DEFAULT 1,
  FOREIGN KEY (`stylist_id`) REFERENCES `stylists`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table: business_hours
-- --------------------------------------------------------
CREATE TABLE `business_hours` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `day_of_week` TINYINT NOT NULL UNIQUE, -- 0=Sun, 1=Mon, ..., 6=Sat
  `day_name` VARCHAR(20) NOT NULL,
  `open_time` TIME NOT NULL DEFAULT '09:00:00',
  `close_time` TIME NOT NULL DEFAULT '20:00:00',
  `break_start` TIME DEFAULT '13:00:00',
  `break_end` TIME DEFAULT '14:00:00',
  `is_closed` TINYINT(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table: special_closures
-- --------------------------------------------------------
CREATE TABLE `special_closures` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(150) NOT NULL,
  `closure_date` DATE NOT NULL,
  `is_full_day` TINYINT(1) NOT NULL DEFAULT 1,
  `start_time` TIME DEFAULT NULL,
  `end_time` TIME DEFAULT NULL,
  `reason` TEXT DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table: promo_codes
-- --------------------------------------------------------
CREATE TABLE `promo_codes` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `code` VARCHAR(50) NOT NULL UNIQUE,
  `discount_type` ENUM('percentage', 'fixed') NOT NULL DEFAULT 'percentage',
  `discount_value` DECIMAL(10,2) NOT NULL,
  `min_order_value` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `max_discount` DECIMAL(10,2) DEFAULT NULL,
  `start_date` DATE DEFAULT NULL,
  `end_date` DATE DEFAULT NULL,
  `usage_limit` INT NOT NULL DEFAULT 1000,
  `times_used` INT NOT NULL DEFAULT 0,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table: bookings
-- --------------------------------------------------------
CREATE TABLE `bookings` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `booking_reference` VARCHAR(30) NOT NULL UNIQUE,
  `customer_name` VARCHAR(150) NOT NULL,
  `customer_email` VARCHAR(191) NOT NULL,
  `customer_phone` VARCHAR(50) NOT NULL,
  `stylist_id` INT DEFAULT NULL,
  `booking_date` DATE NOT NULL,
  `start_time` TIME NOT NULL,
  `end_time` TIME NOT NULL,
  `total_duration` INT NOT NULL,
  `subtotal` DECIMAL(10,2) NOT NULL,
  `discount_amount` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `tax_amount` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `total_amount` DECIMAL(10,2) NOT NULL,
  `deposit_amount` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `payment_mode` ENUM('pay_at_salon', 'online_deposit', 'online_full') NOT NULL DEFAULT 'pay_at_salon',
  `payment_status` ENUM('pending', 'paid', 'partially_paid', 'refunded') NOT NULL DEFAULT 'pending',
  `booking_status` ENUM('pending', 'confirmed', 'completed', 'cancelled') NOT NULL DEFAULT 'pending',
  `promo_code` VARCHAR(50) DEFAULT NULL,
  `notes` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`stylist_id`) REFERENCES `stylists`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table: booking_items
-- --------------------------------------------------------
CREATE TABLE `booking_items` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `booking_id` INT NOT NULL,
  `service_id` INT DEFAULT NULL,
  `package_id` INT DEFAULT NULL,
  `item_name` VARCHAR(150) NOT NULL,
  `price` DECIMAL(10,2) NOT NULL,
  `duration_minutes` INT NOT NULL,
  FOREIGN KEY (`booking_id`) REFERENCES `bookings`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`service_id`) REFERENCES `services`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`package_id`) REFERENCES `packages`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table: settings (Stores all 9 settings modules)
-- --------------------------------------------------------
CREATE TABLE `settings` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `setting_group` VARCHAR(50) NOT NULL,
  `setting_key` VARCHAR(100) NOT NULL UNIQUE,
  `setting_value` MEDIUMTEXT DEFAULT NULL,
  `is_secret` TINYINT(1) NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table: cms_hero
-- --------------------------------------------------------
CREATE TABLE `cms_hero` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `headline` VARCHAR(255) NOT NULL,
  `subheadline` TEXT NOT NULL,
  `badge_text` VARCHAR(100) DEFAULT 'HAUTE COIFFURE & LUXURY AESTHETICS',
  `cta_text` VARCHAR(50) DEFAULT 'Book Your Experience',
  `cta_link` VARCHAR(100) DEFAULT '#book',
  `preview_card_1_title` VARCHAR(100) DEFAULT 'Luminous Balayage',
  `preview_card_1_sub` VARCHAR(100) DEFAULT 'Signature Color Metier',
  `preview_card_1_image` VARCHAR(255) DEFAULT 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=600&q=80',
  `preview_card_2_title` VARCHAR(100) DEFAULT 'Hydra-Infusion Facial',
  `preview_card_2_sub` VARCHAR(100) DEFAULT 'Bio-Cellular Rejuvenation',
  `preview_card_2_image` VARCHAR(255) DEFAULT 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=600&q=80',
  `is_active` TINYINT(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table: cms_gallery
-- --------------------------------------------------------
CREATE TABLE `cms_gallery` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(150) NOT NULL,
  `category` VARCHAR(50) NOT NULL,
  `image_url` VARCHAR(255) NOT NULL,
  `tag` VARCHAR(50) DEFAULT NULL,
  `sort_order` INT NOT NULL DEFAULT 0,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table: cms_testimonials
-- --------------------------------------------------------
CREATE TABLE `cms_testimonials` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `client_name` VARCHAR(100) NOT NULL,
  `service_tag` VARCHAR(100) NOT NULL,
  `review_text` TEXT NOT NULL,
  `rating` INT NOT NULL DEFAULT 5,
  `avatar_url` VARCHAR(255) DEFAULT NULL,
  `sort_order` INT NOT NULL DEFAULT 0,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table: cms_faqs
-- --------------------------------------------------------
CREATE TABLE `cms_faqs` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `question` VARCHAR(255) NOT NULL,
  `answer` TEXT NOT NULL,
  `category` VARCHAR(50) NOT NULL DEFAULT 'General',
  `sort_order` INT NOT NULL DEFAULT 0,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table: audit_logs
-- --------------------------------------------------------
CREATE TABLE `audit_logs` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT DEFAULT NULL,
  `action` VARCHAR(100) NOT NULL,
  `entity` VARCHAR(100) DEFAULT NULL,
  `entity_id` VARCHAR(50) DEFAULT NULL,
  `ip_address` VARCHAR(50) DEFAULT NULL,
  `user_agent` TEXT DEFAULT NULL,
  `details` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===================================================================
-- SEED DATA
-- ===================================================================

-- Initial Users (Staff: Admin@123 | Demo Client: Client@123)
INSERT INTO `users` (`id`, `name`, `email`, `password_hash`, `role`, `phone`, `avatar`, `is_active`) VALUES
(1, 'Elena Vance', 'admin@salon.com', '$2y$12$a8s65DynKQvk9rJWMq88E.0wbeAdE9SetHQbID3Xe6gRchnIe9AFu', 'super_admin', '+1 (555) 234-0001', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80', 1),
(2, 'Marcus Thorne', 'manager@salon.com', '$2y$12$a8s65DynKQvk9rJWMq88E.0wbeAdE9SetHQbID3Xe6gRchnIe9AFu', 'branch_manager', '+1 (555) 234-0002', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80', 1),
(3, 'Sophia Chen', 'reception@salon.com', '$2y$12$a8s65DynKQvk9rJWMq88E.0wbeAdE9SetHQbID3Xe6gRchnIe9AFu', 'receptionist', '+1 (555) 234-0003', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80', 1),
(4, 'Camilla Davenport', 'camilla.d@example.com', '$2y$12$Zsh0gyHRI73TwwEofpviqOVVktqpoAvd4.FuLOZWW9KhjUDtJ7Dbe', 'customer', '+1 (555) 891-2301', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80', 1);

-- Categories
INSERT INTO `categories` (`id`, `name`, `slug`, `description`, `image_url`, `icon`, `sort_order`, `is_active`) VALUES
(1, 'Hair Styling & Couture Color', 'hair-styling', 'Architectural cuts, bespoke balayage, and restorative keratin gloss rituals.', 'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=800&q=80', 'Scissors', 1, 1),
(2, 'Couture Bridal & Glamour', 'bridal-glamour', 'Bespoke bridal styling, high-fashion contouring, and luminous red-carpet artistry.', 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=800&q=80', 'Sparkles', 2, 1),
(3, 'Clinical Skincare & Facials', 'skincare-facials', 'Advanced peptide infusions, bio-cellular hydration, and lifting dermal therapies.', 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=800&q=80', 'Smile', 3, 1),
(4, 'Haute Nail Atelier', 'nail-atelier', 'Japanese gel craftsmanship, organic keratin manicure, and minimalist sculpted nail art.', 'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=800&q=80', 'Hand', 4, 1),
(5, 'Holistic Spa & Body Rituals', 'spa-rituals', 'Botanical aromatherapy, warm basalt stone therapy, and anti-stress scalp revitalization.', 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80', 'Heart', 5, 1);

-- Services
INSERT INTO `services` (`id`, `category_id`, `name`, `slug`, `description`, `duration_minutes`, `base_price`, `offer_price`, `image_url`, `is_featured`, `is_taxable`, `is_active`, `sort_order`) VALUES
-- Hair
(1, 1, 'Signature Sculptural Cut & Blowout', 'sculptural-cut-blowout', 'Custom hair architecture contoured to bone structure, followed by botanical deep conditioning and high-volume silk blowout.', 60, 110.00, 95.00, 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=600&q=80', 1, 1, 1, 1),
(2, 1, 'Bespoke Parisian Balayage', 'parisian-balayage', 'Hand-painted sun-kissed dimension using ammonia-free Italian lightener and glossy bond-building toning glaze.', 150, 245.00, 220.00, 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=600&q=80', 1, 1, 1, 2),
(3, 1, 'Liquid Gold Silk Keratin Therapy', 'liquid-gold-keratin', 'Formaldehyde-free smoothing infused with micro-keratin and argan elixirs to eliminate frizz and create glass hair.', 120, 210.00, NULL, 'https://images.unsplash.com/photo-1519699047748-de8e457a634e?auto=format&fit=crop&w=600&q=80', 0, 1, 1, 3),
(4, 1, 'Caviar Scalp Detox & Revival Treatment', 'caviar-scalp-detox', 'Exfoliating salicylic scalp scrub, steam infusion, targeted botanical micro-circulation massage, and intensive mask.', 45, 85.00, NULL, 'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&w=600&q=80', 0, 1, 1, 4),

-- Bridal & Glamour
(5, 2, 'Haute Bridal Makeup & Crown Styling', 'bridal-makeup-styling', 'Full waterproof high-definition contouring, premium mink lashes, veil setting, and couture updo with hair pearls.', 150, 320.00, 290.00, 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=600&q=80', 1, 1, 1, 5),
(6, 2, 'Red Carpet Evening Glamour', 'evening-glamour', 'Camera-ready radiant skin, customized smokey eye or clean french liner, sculpted brows, and plush pout.', 75, 140.00, 125.00, 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=600&q=80', 0, 1, 1, 6),
(7, 2, 'Bridal Trial Consultation & Look Design', 'bridal-trial-consultation', 'Interactive 2-hour bespoke trial exploring two distinct aesthetics with personalized color analysis.', 120, 180.00, NULL, 'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=600&q=80', 0, 1, 1, 7),

-- Skincare
(8, 3, 'Hydra-Infusion Bio-Cellular Facial', 'hydra-infusion-facial', 'Deep ultrasonic pore cleansing, lactic peel, hyperbaric oxygen serum mist, and lymphatic drainage contouring.', 60, 155.00, 135.00, 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=600&q=80', 1, 1, 1, 8),
(9, 3, '24K Gold Collagen Sculpting Treatment', 'gold-collagen-facial', 'Radiofrequency skin tightening paired with pure 24K gold foil sheets to restore elasticity and youthful glow.', 75, 195.00, NULL, 'https://images.unsplash.com/photo-1512290900672-1f4175319808?auto=format&fit=crop&w=600&q=80', 0, 1, 1, 9),
(10, 3, 'Purifying Botanical Clarity Peel', 'botanical-clarity-peel', 'Gentle multi-acid peel targeting hyperpigmentation, uneven texture, and blemishes with calming azulene mask.', 45, 95.00, 85.00, 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=600&q=80', 0, 1, 1, 10),

-- Nails
(11, 4, 'Japanese Builder Gel Architectural Manicure', 'japanese-gel-manicure', 'Cuticle care with Russian e-file precision, structured rubber base fortification, and high-shine non-wipe top coat.', 60, 80.00, 70.00, 'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=600&q=80', 1, 1, 1, 11),
(12, 4, 'Couture Hand-Painted Minimalist Nail Art', 'couture-nail-art', 'Bespoke hand-drawn chrome accents, tortoiseshell gradients, or delicate French micro-tips.', 75, 110.00, NULL, 'https://images.unsplash.com/photo-1632345031435-8727f6897d53?auto=format&fit=crop&w=600&q=80', 0, 1, 1, 12),
(13, 4, 'Rose Quartz Aromatherapy Luxury Pedicure', 'luxury-pedicure', 'Organic rose petal milk bath, sugar exfoliation, volcanic stone massage, and breathable long-wear polish.', 60, 85.00, NULL, 'https://images.unsplash.com/photo-1519014816548-bf785179c2ff?auto=format&fit=crop&w=600&q=80', 0, 1, 1, 13),

-- Spa
(14, 5, 'Warm Basalt Stone Body Rebalancing', 'basalt-stone-massage', 'Heated volcanic stones glide with wild lavender essential oils to melt away deep muscular tension.', 75, 145.00, 130.00, 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=600&q=80', 1, 1, 1, 14),
(15, 5, 'Shirodhara Mind-Calm Scalp Therapy', 'shirodhara-scalp-therapy', 'Warm herbal oil pour onto the forehead center followed by restorative cervical and shoulder acupressure.', 60, 120.00, NULL, 'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?auto=format&fit=crop&w=600&q=80', 0, 1, 1, 15);

-- Packages
INSERT INTO `packages` (`id`, `name`, `slug`, `tagline`, `description`, `price`, `original_price`, `duration_minutes`, `image_url`, `is_featured`, `is_active`, `sort_order`) VALUES
(1, 'The Empress Royal Bridal Suite', 'royal-bridal-suite', 'The Ultimate Pre-Wedding Splendor', 'Complete head-to-toe couture transformation: haute bridal makeup, floral hair styling, 24K gold facial, and architectural gel manicure.', 480.00, 580.00, 240, 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=800&q=80', 1, 1, 1),
(2, 'The Parisian Glow & Hair Metier', 'parisian-glow-metier', 'Weekend Radiance Ritual', 'Bespoke Parisian balayage or gloss toning, signature sculptural cut, silk blowout, and a luminous Hydra-Infusion facial.', 320.00, 400.00, 180, 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80', 1, 1, 2),
(3, 'Ultimate Cellular Reset & Spa Escape', 'cellular-reset-escape', 'Full-Body Revitalization', 'Deep tissue warm basalt massage, Shirodhara scalp therapy, and Botanical Clarity peel with complimentary herbal tea ceremony.', 260.00, 325.00, 150, 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80', 1, 1, 3),
(4, 'The Red Carpet Quick-Glow Combo', 'red-carpet-quick-glow', 'Express Event Perfection', 'Instant Hydra-Infusion boost, camera-ready evening glam makeup, and silk glass-hair blowout.', 210.00, 260.00, 120, 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=800&q=80', 1, 1, 4);

-- Stylists
INSERT INTO `stylists` (`id`, `user_id`, `name`, `role_title`, `bio`, `avatar_url`, `rating`, `review_count`, `commission_pct`, `is_active`, `sort_order`) VALUES
(1, NULL, 'Genevieve Laurent', 'Creative Hair Director & Balayage Master', 'Trained in Paris and Milan with 14 years shaping iconic hair trends for Vogue editorial features and Cannes red carpets.', 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80', 4.9, 184, 18.00, 1, 1),
(2, NULL, 'Mateo Rossi', 'Senior Colorist & Texture Specialist', 'Renowned for dimensional lived-in blondes, liquid keratin treatments, and seamless curly hair tailoring.', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80', 4.8, 142, 15.00, 1, 2),
(3, NULL, 'Amara Sinclair', 'Lead Bridal & Haute Glamour Artist', 'Specializes in timeless bridal beauty, radiant dewy skin, and effortless Hollywood waves that stay pristine for 16 hours.', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80', 5.0, 210, 20.00, 1, 3),
(4, NULL, 'Dr. Celine Moreau', 'Clinical Aesthetician & Dermal Specialist', 'Certified dermal therapist dedicated to non-invasive cellular renewal, lymphatic contouring, and holistic skin barrier healing.', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80', 4.9, 168, 16.00, 1, 4),
(5, NULL, 'Kai Tanaka', 'Master Nail Architect & Japanese Gel Artist', 'Pioneer of minimalist Japanese nail sculpting, meticulous Russian cuticle alignment, and delicate micro-line artwork.', 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80', 4.9, 115, 14.00, 1, 5);

-- Stylist Services
INSERT INTO `stylist_services` (`stylist_id`, `service_id`) VALUES
(1, 1), (1, 2), (1, 3),
(2, 1), (2, 2), (2, 3), (2, 4),
(3, 5), (3, 6), (3, 7),
(4, 8), (4, 9), (4, 10), (4, 14), (4, 15),
(5, 11), (5, 12), (5, 13);

-- Stylist Weekly Schedules (Mon-Sat, 09:00 - 19:00)
INSERT INTO `stylist_schedules` (`stylist_id`, `day_of_week`, `start_time`, `end_time`, `break_start`, `break_end`, `is_working`) VALUES
(1, 1, '09:00:00', '19:00:00', '13:00:00', '14:00:00', 1),
(1, 2, '09:00:00', '19:00:00', '13:00:00', '14:00:00', 1),
(1, 3, '09:00:00', '19:00:00', '13:00:00', '14:00:00', 1),
(1, 4, '09:00:00', '19:00:00', '13:00:00', '14:00:00', 1),
(1, 5, '09:00:00', '19:00:00', '13:00:00', '14:00:00', 1),
(1, 6, '10:00:00', '18:00:00', '13:00:00', '14:00:00', 1),
(1, 0, '00:00:00', '00:00:00', NULL, NULL, 0),

(2, 1, '09:00:00', '19:00:00', '13:00:00', '14:00:00', 1),
(2, 2, '09:00:00', '19:00:00', '13:00:00', '14:00:00', 1),
(2, 3, '09:00:00', '19:00:00', '13:00:00', '14:00:00', 1),
(2, 4, '09:00:00', '19:00:00', '13:00:00', '14:00:00', 1),
(2, 5, '09:00:00', '19:00:00', '13:00:00', '14:00:00', 1),
(2, 6, '10:00:00', '18:00:00', '13:00:00', '14:00:00', 1),
(2, 0, '00:00:00', '00:00:00', NULL, NULL, 0),

(3, 1, '10:00:00', '19:00:00', '13:00:00', '14:00:00', 1),
(3, 2, '10:00:00', '19:00:00', '13:00:00', '14:00:00', 1),
(3, 3, '10:00:00', '19:00:00', '13:00:00', '14:00:00', 1),
(3, 4, '10:00:00', '19:00:00', '13:00:00', '14:00:00', 1),
(3, 5, '10:00:00', '20:00:00', '13:00:00', '14:00:00', 1),
(3, 6, '09:00:00', '19:00:00', '13:00:00', '14:00:00', 1),
(3, 0, '10:00:00', '16:00:00', NULL, NULL, 1),

(4, 1, '09:00:00', '18:00:00', '13:00:00', '14:00:00', 1),
(4, 2, '09:00:00', '18:00:00', '13:00:00', '14:00:00', 1),
(4, 3, '09:00:00', '18:00:00', '13:00:00', '14:00:00', 1),
(4, 4, '09:00:00', '18:00:00', '13:00:00', '14:00:00', 1),
(4, 5, '09:00:00', '18:00:00', '13:00:00', '14:00:00', 1),
(4, 6, '10:00:00', '17:00:00', '13:00:00', '14:00:00', 1),
(4, 0, '00:00:00', '00:00:00', NULL, NULL, 0),

(5, 2, '09:00:00', '19:00:00', '13:00:00', '14:00:00', 1),
(5, 3, '09:00:00', '19:00:00', '13:00:00', '14:00:00', 1),
(5, 4, '09:00:00', '19:00:00', '13:00:00', '14:00:00', 1),
(5, 5, '09:00:00', '19:00:00', '13:00:00', '14:00:00', 1),
(5, 6, '09:00:00', '19:00:00', '13:00:00', '14:00:00', 1),
(5, 0, '10:00:00', '16:00:00', NULL, NULL, 1),
(5, 1, '00:00:00', '00:00:00', NULL, NULL, 0);

-- Business Hours (Mon-Sat Open, Sun Reduced)
INSERT INTO `business_hours` (`id`, `day_of_week`, `day_name`, `open_time`, `close_time`, `break_start`, `break_end`, `is_closed`) VALUES
(1, 1, 'Monday', '09:00:00', '20:00:00', '13:00:00', '14:00:00', 0),
(2, 2, 'Tuesday', '09:00:00', '20:00:00', '13:00:00', '14:00:00', 0),
(3, 3, 'Wednesday', '09:00:00', '20:00:00', '13:00:00', '14:00:00', 0),
(4, 4, 'Thursday', '09:00:00', '20:00:00', '13:00:00', '14:00:00', 0),
(5, 5, 'Friday', '09:00:00', '20:00:00', '13:00:00', '14:00:00', 0),
(6, 6, 'Saturday', '09:00:00', '19:00:00', '13:00:00', '14:00:00', 0),
(7, 0, 'Sunday', '10:00:00', '17:00:00', NULL, NULL, 0);

-- Special Closures / Holidays
INSERT INTO `special_closures` (`id`, `title`, `closure_date`, `is_full_day`, `start_time`, `end_time`, `reason`) VALUES
(1, 'New Year Studio Reset', '2027-01-01', 1, NULL, NULL, 'Annual deep studio sanitization and inventory review'),
(2, 'Metier Summer Gala', '2027-07-04', 1, NULL, NULL, 'National Independence Day Observation');

-- Promo Codes
INSERT INTO `promo_codes` (`id`, `code`, `discount_type`, `discount_value`, `min_order_value`, `max_discount`, `start_date`, `end_date`, `usage_limit`, `times_used`, `is_active`) VALUES
(1, 'WELCOME20', 'percentage', 20.00, 50.00, 50.00, '2026-01-01', '2027-12-31', 500, 42, 1),
(2, 'GLOW10', 'fixed', 15.00, 75.00, 15.00, '2026-01-01', '2027-12-31', 1000, 68, 1),
(3, 'BRIDAL50', 'fixed', 50.00, 250.00, 50.00, '2026-01-01', '2027-12-31', 200, 19, 1);

-- Sample Bookings
INSERT INTO `bookings` (`id`, `booking_reference`, `customer_name`, `customer_email`, `customer_phone`, `stylist_id`, `booking_date`, `start_time`, `end_time`, `total_duration`, `subtotal`, `discount_amount`, `tax_amount`, `total_amount`, `deposit_amount`, `payment_mode`, `payment_status`, `booking_status`, `promo_code`, `notes`) VALUES
(1, 'AURA-782194', 'Camilla Davenport', 'camilla.d@example.com', '+1 (555) 891-2301', 1, CURDATE(), '11:00:00', '12:00:00', 60, 110.00, 22.00, 7.48, 95.48, 0.00, 'pay_at_salon', 'pending', 'confirmed', 'WELCOME20', 'Prefers quiet session with iced matcha tea.'),
(2, 'AURA-782195', 'Seraphina Vance', 'seraphina@example.com', '+1 (555) 782-9012', 3, DATE_ADD(CURDATE(), INTERVAL 1 DAY), '14:00:00', '16:30:00', 150, 320.00, 0.00, 27.20, 347.20, 86.80, 'online_deposit', 'paid', 'confirmed', NULL, 'Pre-wedding bridal trial consultation. Veil will be brought.'),
(3, 'AURA-782196', 'Vivienne Sterling', 'v.sterling@example.com', '+1 (555) 345-6712', 4, DATE_ADD(CURDATE(), INTERVAL 2 DAY), '10:30:00', '11:30:00', 60, 155.00, 15.00, 11.90, 151.90, 0.00, 'pay_at_salon', 'pending', 'pending', 'GLOW10', 'Sensitive skin prone to mild redness.'),
(4, 'AURA-782210', 'Camilla Davenport', 'camilla.d@example.com', '+1 (555) 891-2301', 4, DATE_ADD(CURDATE(), INTERVAL 4 DAY), '15:00:00', '17:00:00', 120, 205.00, 0.00, 17.43, 222.43, 55.61, 'online_deposit', 'paid', 'confirmed', NULL, 'Hydra-Infusion facial paired with Japanese builder gel manicure.'),
(5, 'AURA-782101', 'Camilla Davenport', 'camilla.d@example.com', '+1 (555) 891-2301', 1, DATE_SUB(CURDATE(), INTERVAL 14 DAY), '13:00:00', '15:30:00', 150, 220.00, 0.00, 18.70, 238.70, 238.70, 'online_full', 'paid', 'completed', NULL, 'Autumn dimensional gloss refresh with bond-building masque.'),
(6, 'AURA-782055', 'Camilla Davenport', 'camilla.d@example.com', '+1 (555) 891-2301', 4, DATE_SUB(CURDATE(), INTERVAL 35 DAY), '16:00:00', '17:15:00', 75, 130.00, 0.00, 11.05, 141.05, 0.00, 'pay_at_salon', 'refunded', 'cancelled', NULL, 'Rescheduled due to travel delay.');

INSERT INTO `booking_items` (`id`, `booking_id`, `service_id`, `package_id`, `item_name`, `price`, `duration_minutes`) VALUES
(1, 1, 1, NULL, 'Signature Sculptural Cut & Blowout', 110.00, 60),
(2, 2, 5, NULL, 'Haute Bridal Makeup & Crown Styling', 320.00, 150),
(3, 3, 8, NULL, 'Hydra-Infusion Bio-Cellular Facial', 155.00, 60),
(4, 4, 8, NULL, 'Hydra-Infusion Bio-Cellular Facial', 135.00, 60),
(5, 4, 11, NULL, 'Japanese Builder Gel Architectural Manicure', 70.00, 60),
(6, 5, 2, NULL, 'Bespoke Parisian Balayage', 220.00, 150),
(7, 6, 14, NULL, 'Warm Basalt Stone Body Rebalancing', 130.00, 75);

-- CMS Hero
INSERT INTO `cms_hero` (`id`, `headline`, `subheadline`, `badge_text`, `cta_text`, `cta_link`, `preview_card_1_title`, `preview_card_1_sub`, `preview_card_1_image`, `preview_card_2_title`, `preview_card_2_sub`, `preview_card_2_image`, `is_active`) VALUES
(1, 'Haute Coiffure & Bespoke Aesthetic Artistry', 'Immerse in an editorial sanctuary where world-class master colorists, clinical dermal specialists, and bridal artisans craft your signature look.', 'OPEN TODAY • 09:00 - 20:00', 'Book Your Experience', '#book', 'Parisian Balayage', 'Couture Hand-Painted Dimension', 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=600&q=80', 'Hydra-Infusion Facial', 'Bio-Cellular Rejuvenation', 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=600&q=80', 1);

-- CMS Gallery
INSERT INTO `cms_gallery` (`id`, `title`, `category`, `image_url`, `tag`, `sort_order`, `is_active`) VALUES
(1, 'Sunkissed Dimensional Blonde Balayage', 'Hair Styling', 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80', 'Color Metier', 1, 1),
(2, 'Couture Royal Bridal Glow & Crown Chignon', 'Bridal Makeup', 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=800&q=80', 'Bridal Couture', 2, 1),
(3, 'Cellular Hydro-Lifting & Lymphatic Sculpt', 'Skincare', 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=800&q=80', 'Dermal Therapy', 3, 1),
(4, 'Japanese Builder Gel Minimalist Lineage', 'Nail Art', 'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=800&q=80', 'Japanese Gel', 4, 1),
(5, 'Luxe Volcanic Basalt Deep Relaxation', 'Spa', 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80', 'Holistic Ritual', 5, 1),
(6, 'High-Gloss Silk Glass Hair Revitalization', 'Hair Styling', 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80', 'Hair Metier', 6, 1);

-- CMS Testimonials
INSERT INTO `cms_testimonials` (`id`, `client_name`, `service_tag`, `review_text`, `rating`, `avatar_url`, `sort_order`, `is_active`) VALUES
(1, 'Victoria Montclaire', 'Parisian Balayage & Silk Blowout', 'Genevieve transformed my hair into sheer silk. The dimension looks effortlessly radiant under daylight and camera flashes alike. The atelier atmosphere is pure serenity.', 5, 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80', 1, 1),
(2, 'Isabella Castiglione', 'Royal Bridal Suite Experience', 'Amara designed my wedding look with unmatched poise and attention. My makeup remained impeccable through 14 hours of tears and dancing. I felt like royalty.', 5, 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80', 2, 1),
(3, 'Charlotte Dupont', 'Hydra-Infusion Cellular Facial', 'Dr. Celine is an absolute dermal wizard. My skin was dull and exhausted from frequent international flights; one session restored a glass-like dewiness.', 5, 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80', 3, 1),
(4, 'Olivia Kensington', 'Japanese Gel Atelier', 'The precision here is unmatched. Not a single cuticle out of place, and my gel manicures stay flawless for over four weeks without chipping.', 5, 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80', 4, 1);

-- CMS FAQs
INSERT INTO `cms_faqs` (`id`, `question`, `answer`, `category`, `sort_order`, `is_active`) VALUES
(1, 'What is your appointment cancellation and rescheduling policy?', 'We respect your schedule and prepare dedicated atelier time for each guest. You may cancel or reschedule up to 24 hours prior to your reservation without any fee. Late cancellations within 24 hours are subject to a 50% deposit retention.', 'Booking', 1, 1),
(2, 'How far in advance should I reserve a bridal or event package?', 'For bridal suites and major seasonal galas, we recommend reserving 2 to 6 months in advance to guarantee your preferred master artist and private dressing suite.', 'Bridal', 2, 1),
(3, 'Can I request a specific stylist or colorist?', 'Yes, absolutely. Our booking engine allows you to select your preferred artist or choose Any Available to view the earliest open slots across our entire team.', 'Services', 3, 1),
(4, 'What premium product lines do you utilize in treatments?', 'We curate clean luxury formulations from Kérastase, Oribe, Shu Uemura Art of Hair, Biologique Recherche, and Japanese leafgel systems to ensure optimal hair and skin integrity.', 'Products', 4, 1),
(5, 'Do you accept walk-in guests?', 'While our atelier operates primarily on advance reservations to guarantee individualized care, we warmly accommodate walk-in visits based on daily stylist availability.', 'General', 5, 1);

-- All 9 Settings Modules
INSERT INTO `settings` (`setting_group`, `setting_key`, `setting_value`, `is_secret`) VALUES
-- 1. General & Business Profile
('general', 'salon_name', 'RiTiVerse Salon & Aesthetics', 0),
('general', 'tagline', 'Where Haute Couture Artistry Meets Holistic Hair & Skin Wellness', 0),
('general', 'logo_light', '/assets/logo-aura.svg', 0),
('general', 'logo_dark', '/assets/logo-aura.svg', 0),
('general', 'favicon', '/favicon.ico', 0),
('general', 'address', '452 Boulevard Saint-Honoré, Suite 400, Fashion District', 0),
('general', 'phone', '+1 (555) 234-5678', 0),
('general', 'whatsapp', '+15552345678', 0),
('general', 'email', 'concierge@ritiverse.com', 0),
('general', 'maps_embed_url', 'https://maps.google.com/maps?q=Fashion+District+New+York&t=&z=13&ie=UTF8&iwloc=&output=embed', 0),
('general', 'currency', 'INR', 0),
('general', 'currency_symbol', '₹', 0),
('general', 'timezone', 'America/New_York', 0),
('general', 'date_format', 'YYYY-MM-DD', 0),
('general', 'time_format', '12h', 0),
('general', 'tax_id', 'GST-US-992834-B', 0),
('general', 'social_instagram', 'https://instagram.com/ritiversesalon', 0),
('general', 'social_facebook', 'https://facebook.com/ritiversesalon', 0),
('general', 'social_tiktok', 'https://tiktok.com/@ritiversesalon', 0),
('general', 'social_pinterest', 'https://pinterest.com/ritiversesalon', 0),

-- 2. Business Hours & Holidays
('hours', 'break_window_enabled', '1', 0),
('hours', 'holiday_mode', '0', 0),

-- 3. Appointment & Booking Rules
('booking_rules', 'slot_duration_minutes', '30', 0),
('booking_rules', 'slot_buffer_minutes', '15', 0),
('booking_rules', 'min_advance_booking_hours', '2', 0),
('booking_rules', 'max_advance_booking_days', '60', 0),
('booking_rules', 'max_concurrent_bookings_per_slot', '4', 0),
('booking_rules', 'auto_confirm_bookings', '1', 0),
('booking_rules', 'cancellation_cutoff_hours', '24', 0),
('booking_rules', 'rescheduling_cutoff_hours', '12', 0),
('booking_rules', 'walkin_mode_enabled', '1', 0),

-- 4. Services & Pricing Rules
('pricing_rules', 'service_deposit_type', 'percentage', 0),
('pricing_rules', 'service_deposit_percentage', '25', 0),
('pricing_rules', 'enable_tips', '1', 0),

-- 5. Staff & Stylist Management Rules
('staff_rules', 'allow_any_stylist_selection', '1', 0),
('staff_rules', 'default_stylist_commission', '15.00', 0),

-- 6. Payments, Taxes & Discounts
('payments', 'payment_pay_at_salon', '1', 0),
('payments', 'payment_online_full', '1', 0),
('payments', 'payment_online_deposit', '1', 0),
('payments', 'payment_deposit_percentage', '25', 0),
('payments', 'payment_gateway', 'stripe', 0),
('payments', 'gateway_mode', 'test', 0),
('payments', 'stripe_publishable_key', '', 0),
('payments', 'stripe_secret_key', '', 1),
('payments', 'razorpay_key_id', '', 0),
('payments', 'razorpay_key_secret', '', 1),
('payments', 'tax_rate', '8.5', 0),
('payments', 'tax_inclusive', '0', 0),
('payments', 'tax_name', 'Sales Tax / GST', 0),

-- 7. Notifications & Reminders
('notifications', 'smtp_host', 'smtp.mailtrap.io', 0),
('notifications', 'smtp_port', '587', 0),
('notifications', 'smtp_user', '', 0),
('notifications', 'smtp_pass', '', 1),
('notifications', 'smtp_encryption', 'tls', 0),
('notifications', 'smtp_from_name', 'RiTiVerse Concierge Desk', 0),
('notifications', 'smtp_from_email', 'concierge@ritiverse.com', 0),
('notifications', 'whatsapp_api_provider', 'twilio', 0),
('notifications', 'whatsapp_api_key', '', 1),
('notifications', 'whatsapp_phone_number', '+15552345678', 0),
('notifications', 'sms_api_key', '', 1),
('notifications', 'reminder_24h_enabled', '1', 0),
('notifications', 'reminder_2h_enabled', '1', 0),
('notifications', 'feedback_request_enabled', '1', 0),
('notifications', 'notify_admin_on_booking', '1', 0),
('notifications', 'admin_notification_email', 'admin@ritiverse.com', 0),

-- 8. CMS, SEO & Analytics Integrations
('seo_analytics', 'maintenance_mode', '0', 0),
('seo_analytics', 'maintenance_message', 'We are curating new seasonal beauty experiences. Our studio reopens shortly.', 0),
('seo_analytics', 'seo_meta_title', 'RiTiVerse Salon & Aesthetics | Luxury Hair, Bridal & Skincare Studio', 0),
('seo_analytics', 'seo_meta_description', 'Experience bespoke haircuts, Parisian balayage, couture bridal makeup, and clinical skincare at RiTiVerse. Book your appointment with master stylists.', 0),
('seo_analytics', 'seo_keywords', 'ritiverse, luxury hair salon, bridal makeup, balayage, facial skincare, nail art, hair spa', 0),
('seo_analytics', 'seo_og_title', 'RiTiVerse Salon & Aesthetics | Luxury Hair, Bridal & Skincare Studio', 0),
('seo_analytics', 'seo_og_description', 'Where haute couture artistry meets holistic hair & skin wellness. Reserve your private session.', 0),
('seo_analytics', 'seo_og_image', 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1200&q=80', 0),
('seo_analytics', 'seo_robots_directive', 'index, follow', 0),
('seo_analytics', 'seo_canonical_url', 'https://ritiverse.com', 0),
('seo_analytics', 'seo_robots_txt', "User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /api/\nSitemap: https://ritiverse.com/sitemap.xml", 0),
('seo_analytics', 'ga4_enabled', '0', 0),
('seo_analytics', 'ga4_measurement_id', '', 0),
('seo_analytics', 'ga4_event_view_service', '1', 0),
('seo_analytics', 'ga4_event_begin_booking', '1', 0),
('seo_analytics', 'ga4_event_booking_confirmed', '1', 0),
('seo_analytics', 'clarity_enabled', '0', 0),
('seo_analytics', 'clarity_project_id', '', 0),
('seo_analytics', 'clarity_mask_sensitive', '1', 0),
('seo_analytics', 'gsc_method', 'meta_tag', 0),
('seo_analytics', 'gsc_meta_tag', '', 0),
('seo_analytics', 'gsc_file_name', '', 0),
('seo_analytics', 'gsc_file_content', '', 0),
('seo_analytics', 'meta_pixel_enabled', '0', 0),
('seo_analytics', 'meta_pixel_id', '', 0),
('seo_analytics', 'meta_pixel_event_pageview', '1', 0),
('seo_analytics', 'meta_pixel_event_viewcontent', '1', 0),
('seo_analytics', 'meta_pixel_event_schedule', '1', 0),
('seo_analytics', 'meta_pixel_event_purchase', '1', 0),
('seo_analytics', 'meta_capi_token', '', 1),
('seo_analytics', 'meta_capi_test_code', '', 0),

-- 9. Users, Roles & Security
('security', 'session_timeout_minutes', '120', 0),
('security', 'password_min_length', '8', 0),
('security', 'password_require_special', '1', 0),
('security', 'two_factor_auth_required', '0', 0),
('security', 'max_login_attempts', '5', 0),
('security', 'lockout_time_minutes', '15', 0);

-- Initial Audit Log
INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `entity`, `entity_id`, `ip_address`, `details`) VALUES
(1, 1, 'SYSTEM_INIT', 'database', '1', '127.0.0.1', 'RiTiVerse Salon database schema and initial settings initialized successfully.');
