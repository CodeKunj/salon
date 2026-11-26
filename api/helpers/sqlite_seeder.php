<?php
// api/helpers/sqlite_seeder.php

function seedSqliteDatabase(PDO $pdo): void {
    $pdo->exec("PRAGMA foreign_keys = OFF;");

    $tables = [
        "CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            password_hash TEXT NOT NULL,
            role TEXT NOT NULL DEFAULT 'receptionist',
            phone TEXT,
            avatar TEXT,
            is_active INTEGER NOT NULL DEFAULT 1,
            two_factor_enabled INTEGER NOT NULL DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )",
        "CREATE TABLE IF NOT EXISTS categories (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            slug TEXT NOT NULL UNIQUE,
            description TEXT,
            image_url TEXT,
            icon TEXT,
            sort_order INTEGER NOT NULL DEFAULT 0,
            is_active INTEGER NOT NULL DEFAULT 1
        )",
        "CREATE TABLE IF NOT EXISTS services (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            category_id INTEGER NOT NULL,
            name TEXT NOT NULL,
            slug TEXT NOT NULL UNIQUE,
            description TEXT,
            duration_minutes INTEGER NOT NULL DEFAULT 45,
            base_price REAL NOT NULL,
            offer_price REAL,
            image_url TEXT,
            is_featured INTEGER NOT NULL DEFAULT 0,
            is_taxable INTEGER NOT NULL DEFAULT 1,
            is_active INTEGER NOT NULL DEFAULT 1,
            sort_order INTEGER NOT NULL DEFAULT 0
        )",
        "CREATE TABLE IF NOT EXISTS packages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            slug TEXT NOT NULL UNIQUE,
            tagline TEXT,
            description TEXT,
            price REAL NOT NULL,
            original_price REAL,
            duration_minutes INTEGER NOT NULL DEFAULT 120,
            image_url TEXT,
            is_featured INTEGER NOT NULL DEFAULT 1,
            is_active INTEGER NOT NULL DEFAULT 1,
            sort_order INTEGER NOT NULL DEFAULT 0
        )",
        "CREATE TABLE IF NOT EXISTS package_services (
            package_id INTEGER NOT NULL,
            service_id INTEGER NOT NULL,
            PRIMARY KEY (package_id, service_id)
        )",
        "CREATE TABLE IF NOT EXISTS stylists (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            name TEXT NOT NULL,
            role_title TEXT NOT NULL,
            bio TEXT,
            avatar_url TEXT,
            rating REAL NOT NULL DEFAULT 4.9,
            review_count INTEGER NOT NULL DEFAULT 120,
            commission_pct REAL NOT NULL DEFAULT 15.00,
            is_active INTEGER NOT NULL DEFAULT 1,
            sort_order INTEGER NOT NULL DEFAULT 0
        )",
        "CREATE TABLE IF NOT EXISTS stylist_services (
            stylist_id INTEGER NOT NULL,
            service_id INTEGER NOT NULL,
            PRIMARY KEY (stylist_id, service_id)
        )",
        "CREATE TABLE IF NOT EXISTS stylist_schedules (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            stylist_id INTEGER NOT NULL,
            day_of_week INTEGER NOT NULL,
            start_time TEXT NOT NULL DEFAULT '09:00:00',
            end_time TEXT NOT NULL DEFAULT '20:00:00',
            break_start TEXT DEFAULT '13:00:00',
            break_end TEXT DEFAULT '14:00:00',
            is_working INTEGER NOT NULL DEFAULT 1
        )",
        "CREATE TABLE IF NOT EXISTS business_hours (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            day_of_week INTEGER NOT NULL UNIQUE,
            day_name TEXT NOT NULL,
            open_time TEXT NOT NULL DEFAULT '09:00:00',
            close_time TEXT NOT NULL DEFAULT '20:00:00',
            break_start TEXT DEFAULT '13:00:00',
            break_end TEXT DEFAULT '14:00:00',
            is_closed INTEGER NOT NULL DEFAULT 0
        )",
        "CREATE TABLE IF NOT EXISTS special_closures (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            closure_date TEXT NOT NULL,
            is_full_day INTEGER NOT NULL DEFAULT 1,
            start_time TEXT,
            end_time TEXT,
            reason TEXT
        )",
        "CREATE TABLE IF NOT EXISTS promo_codes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            code TEXT NOT NULL UNIQUE,
            discount_type TEXT NOT NULL DEFAULT 'percentage',
            discount_value REAL NOT NULL,
            min_order_value REAL NOT NULL DEFAULT 0.00,
            max_discount REAL,
            start_date TEXT,
            end_date TEXT,
            usage_limit INTEGER NOT NULL DEFAULT 1000,
            times_used INTEGER NOT NULL DEFAULT 0,
            is_active INTEGER NOT NULL DEFAULT 1
        )",
        "CREATE TABLE IF NOT EXISTS bookings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            booking_reference TEXT NOT NULL UNIQUE,
            customer_name TEXT NOT NULL,
            customer_email TEXT NOT NULL,
            customer_phone TEXT NOT NULL,
            stylist_id INTEGER,
            booking_date TEXT NOT NULL,
            start_time TEXT NOT NULL,
            end_time TEXT NOT NULL,
            total_duration INTEGER NOT NULL,
            subtotal REAL NOT NULL,
            discount_amount REAL NOT NULL DEFAULT 0.00,
            tax_amount REAL NOT NULL DEFAULT 0.00,
            total_amount REAL NOT NULL,
            deposit_amount REAL NOT NULL DEFAULT 0.00,
            payment_mode TEXT NOT NULL DEFAULT 'pay_at_salon',
            payment_status TEXT NOT NULL DEFAULT 'pending',
            booking_status TEXT NOT NULL DEFAULT 'pending',
            promo_code TEXT,
            notes TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )",
        "CREATE TABLE IF NOT EXISTS booking_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            booking_id INTEGER NOT NULL,
            service_id INTEGER,
            package_id INTEGER,
            item_name TEXT NOT NULL,
            price REAL NOT NULL,
            duration_minutes INTEGER NOT NULL
        )",
        "CREATE TABLE IF NOT EXISTS settings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            setting_group TEXT NOT NULL,
            setting_key TEXT NOT NULL UNIQUE,
            setting_value TEXT,
            is_secret INTEGER NOT NULL DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )",
        "CREATE TABLE IF NOT EXISTS cms_hero (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            headline TEXT NOT NULL,
            subheadline TEXT NOT NULL,
            badge_text TEXT DEFAULT 'HAUTE COIFFURE & LUXURY AESTHETICS',
            cta_text TEXT DEFAULT 'Book Your Experience',
            cta_link TEXT DEFAULT '#book',
            preview_card_1_title TEXT,
            preview_card_1_sub TEXT,
            preview_card_1_image TEXT,
            preview_card_2_title TEXT,
            preview_card_2_sub TEXT,
            preview_card_2_image TEXT,
            is_active INTEGER NOT NULL DEFAULT 1
        )",
        "CREATE TABLE IF NOT EXISTS cms_gallery (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            category TEXT NOT NULL,
            image_url TEXT NOT NULL,
            tag TEXT,
            sort_order INTEGER NOT NULL DEFAULT 0,
            is_active INTEGER NOT NULL DEFAULT 1
        )",
        "CREATE TABLE IF NOT EXISTS cms_testimonials (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            client_name TEXT NOT NULL,
            service_tag TEXT NOT NULL,
            review_text TEXT NOT NULL,
            rating INTEGER NOT NULL DEFAULT 5,
            avatar_url TEXT,
            sort_order INTEGER NOT NULL DEFAULT 0,
            is_active INTEGER NOT NULL DEFAULT 1
        )",
        "CREATE TABLE IF NOT EXISTS cms_faqs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            question TEXT NOT NULL,
            answer TEXT NOT NULL,
            category TEXT NOT NULL DEFAULT 'General',
            sort_order INTEGER NOT NULL DEFAULT 0,
            is_active INTEGER NOT NULL DEFAULT 1
        )",
        "CREATE TABLE IF NOT EXISTS audit_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            action TEXT NOT NULL,
            entity TEXT,
            entity_id TEXT,
            ip_address TEXT,
            user_agent TEXT,
            details TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )"
    ];

    foreach ($tables as $sql) {
        $pdo->exec($sql);
    }

    // Now insert seed data if users table is empty
    $count = $pdo->query("SELECT COUNT(*) FROM users")->fetchColumn();
    if ($count == 0) {
        // Users
        $hash = password_hash('Admin@123', PASSWORD_BCRYPT);
        $clientHash = password_hash('Client@123', PASSWORD_BCRYPT);
        $stmt = $pdo->prepare("INSERT INTO users (id, name, email, password_hash, role, phone, avatar, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
        $stmt->execute([1, 'Elena Vance', 'admin@salon.com', $hash, 'super_admin', '+1 (555) 234-0001', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80', 1]);
        $stmt->execute([2, 'Marcus Thorne', 'manager@salon.com', $hash, 'branch_manager', '+1 (555) 234-0002', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80', 1]);
        $stmt->execute([3, 'Sophia Chen', 'reception@salon.com', $hash, 'receptionist', '+1 (555) 234-0003', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80', 1]);
        $stmt->execute([4, 'Camilla Davenport', 'camilla.d@example.com', $clientHash, 'customer', '+1 (555) 891-2301', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80', 1]);

        // Categories
        $catStmt = $pdo->prepare("INSERT INTO categories (id, name, slug, description, image_url, icon, sort_order, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
        $catStmt->execute([1, 'Hair Styling & Couture Color', 'hair-styling', 'Architectural cuts, bespoke balayage, and restorative keratin gloss rituals.', 'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=800&q=80', 'Scissors', 1, 1]);
        $catStmt->execute([2, 'Couture Bridal & Glamour', 'bridal-glamour', 'Bespoke bridal styling, high-fashion contouring, and luminous red-carpet artistry.', 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=800&q=80', 'Sparkles', 2, 1]);
        $catStmt->execute([3, 'Clinical Skincare & Facials', 'skincare-facials', 'Advanced peptide infusions, bio-cellular hydration, and lifting dermal therapies.', 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=800&q=80', 'Smile', 3, 1]);
        $catStmt->execute([4, 'Haute Nail Atelier', 'nail-atelier', 'Japanese gel craftsmanship, organic keratin manicure, and minimalist sculpted nail art.', 'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=800&q=80', 'Hand', 4, 1]);
        $catStmt->execute([5, 'Holistic Spa & Body Rituals', 'spa-rituals', 'Botanical aromatherapy, warm basalt stone therapy, and anti-stress scalp revitalization.', 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80', 'Heart', 5, 1]);

        // Services
        $srvStmt = $pdo->prepare("INSERT INTO services (id, category_id, name, slug, description, duration_minutes, base_price, offer_price, image_url, is_featured, is_taxable, is_active, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
        $srvStmt->execute([1, 1, 'Signature Sculptural Cut & Blowout', 'sculptural-cut-blowout', 'Custom hair architecture contoured to bone structure, followed by botanical deep conditioning and high-volume silk blowout.', 60, 110.00, 95.00, 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=600&q=80', 1, 1, 1, 1]);
        $srvStmt->execute([2, 1, 'Bespoke Parisian Balayage', 'parisian-balayage', 'Hand-painted sun-kissed dimension using ammonia-free Italian lightener and glossy bond-building toning glaze.', 150, 245.00, 220.00, 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=600&q=80', 1, 1, 1, 2]);
        $srvStmt->execute([3, 1, 'Liquid Gold Silk Keratin Therapy', 'liquid-gold-keratin', 'Formaldehyde-free smoothing infused with micro-keratin and argan elixirs to eliminate frizz and create glass hair.', 120, 210.00, NULL, 'https://images.unsplash.com/photo-1519699047748-de8e457a634e?auto=format&fit=crop&w=600&q=80', 0, 1, 1, 3]);
        $srvStmt->execute([4, 1, 'Caviar Scalp Detox & Revival Treatment', 'caviar-scalp-detox', 'Exfoliating salicylic scalp scrub, steam infusion, targeted botanical micro-circulation massage, and intensive mask.', 45, 85.00, NULL, 'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&w=600&q=80', 0, 1, 1, 4]);
        $srvStmt->execute([5, 2, 'Haute Bridal Makeup & Crown Styling', 'bridal-makeup-styling', 'Full waterproof high-definition contouring, premium mink lashes, veil setting, and couture updo with hair pearls.', 150, 320.00, 290.00, 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=600&q=80', 1, 1, 1, 5]);
        $srvStmt->execute([6, 2, 'Red Carpet Evening Glamour', 'evening-glamour', 'Camera-ready radiant skin, customized smokey eye or clean french liner, sculpted brows, and plush pout.', 75, 140.00, 125.00, 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=600&q=80', 0, 1, 1, 6]);
        $srvStmt->execute([7, 2, 'Bridal Trial Consultation & Look Design', 'bridal-trial-consultation', 'Interactive 2-hour bespoke trial exploring two distinct aesthetics with personalized color analysis.', 120, 180.00, NULL, 'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=600&q=80', 0, 1, 1, 7]);
        $srvStmt->execute([8, 3, 'Hydra-Infusion Bio-Cellular Facial', 'hydra-infusion-facial', 'Deep ultrasonic pore cleansing, lactic peel, hyperbaric oxygen serum mist, and lymphatic drainage contouring.', 60, 155.00, 135.00, 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=600&q=80', 1, 1, 1, 8]);
        $srvStmt->execute([9, 3, '24K Gold Collagen Sculpting Treatment', 'gold-collagen-facial', 'Radiofrequency skin tightening paired with pure 24K gold foil sheets to restore elasticity and youthful glow.', 75, 195.00, NULL, 'https://images.unsplash.com/photo-1512290900672-1f4175319808?auto=format&fit=crop&w=600&q=80', 0, 1, 1, 9]);
        $srvStmt->execute([10, 3, 'Purifying Botanical Clarity Peel', 'botanical-clarity-peel', 'Gentle multi-acid peel targeting hyperpigmentation, uneven texture, and blemishes with calming azulene mask.', 45, 95.00, 85.00, 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=600&q=80', 0, 1, 1, 10]);
        $srvStmt->execute([11, 4, 'Japanese Builder Gel Architectural Manicure', 'japanese-gel-manicure', 'Cuticle care with Russian e-file precision, structured rubber base fortification, and high-shine non-wipe top coat.', 60, 80.00, 70.00, 'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=600&q=80', 1, 1, 1, 11]);
        $srvStmt->execute([12, 4, 'Couture Hand-Painted Minimalist Nail Art', 'couture-nail-art', 'Bespoke hand-drawn chrome accents, tortoiseshell gradients, or delicate French micro-tips.', 75, 110.00, NULL, 'https://images.unsplash.com/photo-1632345031435-8727f6897d53?auto=format&fit=crop&w=600&q=80', 0, 1, 1, 12]);
        $srvStmt->execute([13, 4, 'Rose Quartz Aromatherapy Luxury Pedicure', 'luxury-pedicure', 'Organic rose petal milk bath, sugar exfoliation, volcanic stone massage, and breathable long-wear polish.', 60, 85.00, NULL, 'https://images.unsplash.com/photo-1519014816548-bf785179c2ff?auto=format&fit=crop&w=600&q=80', 0, 1, 1, 13]);
        $srvStmt->execute([14, 5, 'Warm Basalt Stone Body Rebalancing', 'basalt-stone-massage', 'Heated volcanic stones glide with wild lavender essential oils to melt away deep muscular tension.', 75, 145.00, 130.00, 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=600&q=80', 1, 1, 1, 14]);
        $srvStmt->execute([15, 5, 'Shirodhara Mind-Calm Scalp Therapy', 'shirodhara-scalp-therapy', 'Warm herbal oil pour onto the forehead center followed by restorative cervical and shoulder acupressure.', 60, 120.00, NULL, 'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?auto=format&fit=crop&w=600&q=80', 0, 1, 1, 15]);

        // Packages
        $pkgStmt = $pdo->prepare("INSERT INTO packages (id, name, slug, tagline, description, price, original_price, duration_minutes, image_url, is_featured, is_active, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
        $pkgStmt->execute([1, 'The Empress Royal Bridal Suite', 'royal-bridal-suite', 'The Ultimate Pre-Wedding Splendor', 'Complete head-to-toe couture transformation: haute bridal makeup, floral hair styling, 24K gold facial, and architectural gel manicure.', 480.00, 580.00, 240, 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=800&q=80', 1, 1, 1]);
        $pkgStmt->execute([2, 'The Parisian Glow & Hair Metier', 'parisian-glow-metier', 'Weekend Radiance Ritual', 'Bespoke Parisian balayage or gloss toning, signature sculptural cut, silk blowout, and a luminous Hydra-Infusion facial.', 320.00, 400.00, 180, 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80', 1, 1, 2]);
        $pkgStmt->execute([3, 'Ultimate Cellular Reset & Spa Escape', 'cellular-reset-escape', 'Full-Body Revitalization', 'Deep tissue warm basalt massage, Shirodhara scalp therapy, and Botanical Clarity peel with complimentary herbal tea ceremony.', 260.00, 325.00, 150, 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80', 1, 1, 3]);
        $pkgStmt->execute([4, 'The Red Carpet Quick-Glow Combo', 'red-carpet-quick-glow', 'Express Event Perfection', 'Instant Hydra-Infusion boost, camera-ready evening glam makeup, and silk glass-hair blowout.', 210.00, 260.00, 120, 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=800&q=80', 1, 1, 4]);

        // Stylists
        $styStmt = $pdo->prepare("INSERT INTO stylists (id, user_id, name, role_title, bio, avatar_url, rating, review_count, commission_pct, is_active, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
        $styStmt->execute([1, NULL, 'Genevieve Laurent', 'Creative Hair Director & Balayage Master', 'Trained in Paris and Milan with 14 years shaping iconic hair trends for Vogue editorial features and Cannes red carpets.', 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80', 4.9, 184, 18.00, 1, 1]);
        $styStmt->execute([2, NULL, 'Mateo Rossi', 'Senior Colorist & Texture Specialist', 'Renowned for dimensional lived-in blondes, liquid keratin treatments, and seamless curly hair tailoring.', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80', 4.8, 142, 15.00, 1, 2]);
        $styStmt->execute([3, NULL, 'Amara Sinclair', 'Lead Bridal & Haute Glamour Artist', 'Specializes in timeless bridal beauty, radiant dewy skin, and effortless Hollywood waves that stay pristine for 16 hours.', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80', 5.0, 210, 20.00, 1, 3]);
        $styStmt->execute([4, NULL, 'Dr. Celine Moreau', 'Clinical Aesthetician & Dermal Specialist', 'Certified dermal therapist dedicated to non-invasive cellular renewal, lymphatic contouring, and holistic skin barrier healing.', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80', 4.9, 168, 16.00, 1, 4]);
        $styStmt->execute([5, NULL, 'Kai Tanaka', 'Master Nail Architect & Japanese Gel Artist', 'Pioneer of minimalist Japanese nail sculpting, meticulous Russian cuticle alignment, and delicate micro-line artwork.', 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80', 4.9, 115, 14.00, 1, 5]);

        // Business Hours
        $hrsStmt = $pdo->prepare("INSERT INTO business_hours (id, day_of_week, day_name, open_time, close_time, break_start, break_end, is_closed) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
        $hrsStmt->execute([1, 1, 'Monday', '09:00:00', '20:00:00', '13:00:00', '14:00:00', 0]);
        $hrsStmt->execute([2, 2, 'Tuesday', '09:00:00', '20:00:00', '13:00:00', '14:00:00', 0]);
        $hrsStmt->execute([3, 3, 'Wednesday', '09:00:00', '20:00:00', '13:00:00', '14:00:00', 0]);
        $hrsStmt->execute([4, 4, 'Thursday', '09:00:00', '20:00:00', '13:00:00', '14:00:00', 0]);
        $hrsStmt->execute([5, 5, 'Friday', '09:00:00', '20:00:00', '13:00:00', '14:00:00', 0]);
        $hrsStmt->execute([6, 6, 'Saturday', '09:00:00', '19:00:00', '13:00:00', '14:00:00', 0]);
        $hrsStmt->execute([7, 0, 'Sunday', '10:00:00', '17:00:00', NULL, NULL, 0]);

        // Stylist Schedules
        $ssStmt = $pdo->prepare("INSERT INTO stylist_schedules (stylist_id, day_of_week, start_time, end_time, break_start, break_end, is_working) VALUES (?, ?, ?, ?, ?, ?, ?)");
        for ($sty = 1; $sty <= 5; $sty++) {
            for ($d = 0; $d <= 6; $d++) {
                $isWorking = ($d === 0) ? ($sty === 3 || $sty === 5 ? 1 : 0) : 1;
                $start = ($d === 0) ? '10:00:00' : '09:00:00';
                $end = ($d === 6) ? '19:00:00' : (($d === 0) ? '16:00:00' : '20:00:00');
                $ssStmt->execute([$sty, $d, $start, $end, '13:00:00', '14:00:00', $isWorking]);
            }
        }

        // Promo Codes
        $pStmt = $pdo->prepare("INSERT INTO promo_codes (id, code, discount_type, discount_value, min_order_value, max_discount, start_date, end_date, usage_limit, times_used, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
        $pStmt->execute([1, 'WELCOME20', 'percentage', 20.00, 50.00, 50.00, '2026-01-01', '2027-12-31', 500, 42, 1]);
        $pStmt->execute([2, 'GLOW10', 'fixed', 15.00, 75.00, 15.00, '2026-01-01', '2027-12-31', 1000, 68, 1]);
        $pStmt->execute([3, 'BRIDAL50', 'fixed', 50.00, 250.00, 50.00, '2026-01-01', '2027-12-31', 200, 19, 1]);

        // CMS Hero
        $hStmt = $pdo->prepare("INSERT INTO cms_hero (id, headline, subheadline, badge_text, cta_text, cta_link, preview_card_1_title, preview_card_1_sub, preview_card_1_image, preview_card_2_title, preview_card_2_sub, preview_card_2_image, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
        $hStmt->execute([1, 'Haute Coiffure & Bespoke Aesthetic Artistry', 'Immerse in an editorial sanctuary where world-class master colorists, clinical dermal specialists, and bridal artisans craft your signature look.', 'OPEN TODAY • 09:00 - 20:00', 'Book Your Experience', '#book', 'Parisian Balayage', 'Couture Hand-Painted Dimension', 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=600&q=80', 'Hydra-Infusion Facial', 'Bio-Cellular Rejuvenation', 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=600&q=80', 1]);

        // CMS Gallery
        $gStmt = $pdo->prepare("INSERT INTO cms_gallery (id, title, category, image_url, tag, sort_order, is_active) VALUES (?, ?, ?, ?, ?, ?, ?)");
        $gStmt->execute([1, 'Sunkissed Dimensional Blonde Balayage', 'Hair Styling', 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80', 'Color Metier', 1, 1]);
        $gStmt->execute([2, 'Couture Royal Bridal Glow & Crown Chignon', 'Bridal Makeup', 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=800&q=80', 'Bridal Couture', 2, 1]);
        $gStmt->execute([3, 'Cellular Hydro-Lifting & Lymphatic Sculpt', 'Skincare', 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=800&q=80', 'Dermal Therapy', 3, 1]);
        $gStmt->execute([4, 'Japanese Builder Gel Minimalist Lineage', 'Nail Art', 'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=800&q=80', 'Japanese Gel', 4, 1]);
        $gStmt->execute([5, 'Luxe Volcanic Basalt Deep Relaxation', 'Spa', 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80', 'Holistic Ritual', 5, 1]);
        $gStmt->execute([6, 'High-Gloss Silk Glass Hair Revitalization', 'Hair Styling', 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80', 'Hair Metier', 6, 1]);

        // CMS Testimonials
        $tStmt = $pdo->prepare("INSERT INTO cms_testimonials (id, client_name, service_tag, review_text, rating, avatar_url, sort_order, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
        $tStmt->execute([1, 'Victoria Montclaire', 'Parisian Balayage & Silk Blowout', 'Genevieve transformed my hair into sheer silk. The dimension looks effortlessly radiant under daylight and camera flashes alike. The atelier atmosphere is pure serenity.', 5, 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80', 1, 1]);
        $tStmt->execute([2, 'Isabella Castiglione', 'Royal Bridal Suite Experience', 'Amara designed my wedding look with unmatched poise and attention. My makeup remained impeccable through 14 hours of tears and dancing. I felt like royalty.', 5, 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80', 2, 1]);
        $tStmt->execute([3, 'Charlotte Dupont', 'Hydra-Infusion Cellular Facial', 'Dr. Celine is an absolute dermal wizard. My skin was dull and exhausted from frequent international flights; one session restored a glass-like dewiness.', 5, 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80', 3, 1]);
        $tStmt->execute([4, 'Olivia Kensington', 'Japanese Gel Atelier', 'The precision here is unmatched. Not a single cuticle out of place, and my gel manicures stay flawless for over four weeks without chipping.', 5, 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80', 4, 1]);

        // CMS FAQs
        $fStmt = $pdo->prepare("INSERT INTO cms_faqs (id, question, answer, category, sort_order, is_active) VALUES (?, ?, ?, ?, ?, ?)");
        $fStmt->execute([1, 'What is your appointment cancellation and rescheduling policy?', 'We respect your schedule and prepare dedicated atelier time for each guest. You may cancel or reschedule up to 24 hours prior to your reservation without any fee. Late cancellations within 24 hours are subject to a 50% deposit retention.', 'Booking', 1, 1]);
        $fStmt->execute([2, 'How far in advance should I reserve a bridal or event package?', 'For bridal suites and major seasonal galas, we recommend reserving 2 to 6 months in advance to guarantee your preferred master artist and private dressing suite.', 'Bridal', 2, 1]);
        $fStmt->execute([3, 'Can I request a specific stylist or colorist?', 'Yes, absolutely. Our booking engine allows you to select your preferred artist or choose Any Available to view the earliest open slots across our entire team.', 'Services', 3, 1]);
        $fStmt->execute([4, 'What premium product lines do you utilize in treatments?', 'We curate clean luxury formulations from Kérastase, Oribe, Shu Uemura Art of Hair, Biologique Recherche, and Japanese leafgel systems to ensure optimal hair and skin integrity.', 'Products', 4, 1]);
        $fStmt->execute([5, 'Do you accept walk-in guests?', 'While our atelier operates primarily on advance reservations to guarantee individualized care, we warmly accommodate walk-in visits based on daily stylist availability.', 'General', 5, 1]);

        // Settings - All 9 Modules
        $sStmt = $pdo->prepare("INSERT INTO settings (setting_group, setting_key, setting_value, is_secret) VALUES (?, ?, ?, ?)");
        $settings = [
            // General
            ['general', 'salon_name', 'RiTiVerse Salon & Aesthetics', 0],
            ['general', 'tagline', 'Where Haute Couture Artistry Meets Holistic Hair & Skin Wellness', 0],
            ['general', 'logo_light', '/assets/logo-aura.svg', 0],
            ['general', 'logo_dark', '/assets/logo-aura.svg', 0],
            ['general', 'favicon', '/favicon.ico', 0],
            ['general', 'address', '452 Boulevard Saint-Honoré, Suite 400, Fashion District', 0],
            ['general', 'phone', '+1 (555) 234-5678', 0],
            ['general', 'whatsapp', '+15552345678', 0],
            ['general', 'email', 'concierge@ritiverse.com', 0],
            ['general', 'maps_embed_url', 'https://maps.google.com/maps?q=Fashion+District+New+York&t=&z=13&ie=UTF8&iwloc=&output=embed', 0],
            ['general', 'currency', 'INR', 0],
            ['general', 'currency_symbol', '₹', 0],
            ['general', 'timezone', 'America/New_York', 0],
            ['general', 'date_format', 'YYYY-MM-DD', 0],
            ['general', 'time_format', '12h', 0],
            ['general', 'tax_id', 'GST-US-992834-B', 0],
            ['general', 'social_instagram', 'https://instagram.com/ritiversesalon', 0],
            ['general', 'social_facebook', 'https://facebook.com/ritiversesalon', 0],
            ['general', 'social_tiktok', 'https://tiktok.com/@ritiversesalon', 0],
            ['general', 'social_pinterest', 'https://pinterest.com/ritiversesalon', 0],
            // Hours
            ['hours', 'break_window_enabled', '1', 0],
            ['hours', 'holiday_mode', '0', 0],
            // Booking Rules
            ['booking_rules', 'slot_duration_minutes', '30', 0],
            ['booking_rules', 'slot_buffer_minutes', '15', 0],
            ['booking_rules', 'min_advance_booking_hours', '2', 0],
            ['booking_rules', 'max_advance_booking_days', '60', 0],
            ['booking_rules', 'max_concurrent_bookings_per_slot', '4', 0],
            ['booking_rules', 'auto_confirm_bookings', '1', 0],
            ['booking_rules', 'cancellation_cutoff_hours', '24', 0],
            ['booking_rules', 'rescheduling_cutoff_hours', '12', 0],
            ['booking_rules', 'walkin_mode_enabled', '1', 0],
            // Pricing Rules
            ['pricing_rules', 'service_deposit_type', 'percentage', 0],
            ['pricing_rules', 'service_deposit_percentage', '25', 0],
            ['pricing_rules', 'enable_tips', '1', 0],
            // Staff Rules
            ['staff_rules', 'allow_any_stylist_selection', '1', 0],
            ['staff_rules', 'default_stylist_commission', '15.00', 0],
            // Payments
            ['payments', 'payment_pay_at_salon', '1', 0],
            ['payments', 'payment_online_full', '1', 0],
            ['payments', 'payment_online_deposit', '1', 0],
            ['payments', 'payment_deposit_percentage', '25', 0],
            ['payments', 'payment_gateway', 'stripe', 0],
            ['payments', 'gateway_mode', 'test', 0],
            ['payments', 'stripe_publishable_key', '', 0],
            ['payments', 'stripe_secret_key', '', 1],
            ['payments', 'razorpay_key_id', '', 0],
            ['payments', 'razorpay_key_secret', '', 1],
            ['payments', 'tax_rate', '8.5', 0],
            ['payments', 'tax_inclusive', '0', 0],
            ['payments', 'tax_name', 'Sales Tax / GST', 0],
            // Notifications
            ['notifications', 'smtp_host', 'smtp.mailtrap.io', 0],
            ['notifications', 'smtp_port', '587', 0],
            ['notifications', 'smtp_user', '', 0],
            ['notifications', 'smtp_pass', '', 1],
            ['notifications', 'smtp_encryption', 'tls', 0],
            ['notifications', 'smtp_from_name', 'RiTiVerse Concierge Desk', 0],
            ['notifications', 'smtp_from_email', 'concierge@ritiverse.com', 0],
            ['notifications', 'whatsapp_api_provider', 'twilio', 0],
            ['notifications', 'whatsapp_api_key', '', 1],
            ['notifications', 'whatsapp_phone_number', '+15552345678', 0],
            ['notifications', 'sms_api_key', '', 1],
            ['notifications', 'reminder_24h_enabled', '1', 0],
            ['notifications', 'reminder_2h_enabled', '1', 0],
            ['notifications', 'feedback_request_enabled', '1', 0],
            ['notifications', 'notify_admin_on_booking', '1', 0],
            ['notifications', 'admin_notification_email', 'admin@ritiverse.com', 0],
            // SEO & Analytics
            ['seo_analytics', 'maintenance_mode', '0', 0],
            ['seo_analytics', 'maintenance_message', 'We are curating new seasonal beauty experiences. Our studio reopens shortly.', 0],
            ['seo_analytics', 'seo_meta_title', 'RiTiVerse Salon & Aesthetics | Luxury Hair, Bridal & Skincare Studio', 0],
            ['seo_analytics', 'seo_meta_description', 'Experience bespoke haircuts, Parisian balayage, couture bridal makeup, and clinical skincare at RiTiVerse. Book your appointment with master stylists.', 0],
            ['seo_analytics', 'seo_keywords', 'ritiverse, luxury hair salon, bridal makeup, balayage, facial skincare, nail art, hair spa', 0],
            ['seo_analytics', 'seo_og_title', 'RiTiVerse Salon & Aesthetics | Luxury Hair, Bridal & Skincare Studio', 0],
            ['seo_analytics', 'seo_og_description', 'Where haute couture artistry meets holistic hair & skin wellness. Reserve your private session.', 0],
            ['seo_analytics', 'seo_og_image', 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1200&q=80', 0],
            ['seo_analytics', 'seo_robots_directive', 'index, follow', 0],
            ['seo_analytics', 'seo_canonical_url', 'https://ritiverse.com', 0],
            ['seo_analytics', 'seo_robots_txt', "User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /api/\nSitemap: https://ritiverse.com/sitemap.xml", 0],
            ['seo_analytics', 'ga4_enabled', '0', 0],
            ['seo_analytics', 'ga4_measurement_id', '', 0],
            ['seo_analytics', 'ga4_event_view_service', '1', 0],
            ['seo_analytics', 'ga4_event_begin_booking', '1', 0],
            ['seo_analytics', 'ga4_event_booking_confirmed', '1', 0],
            ['seo_analytics', 'clarity_enabled', '0', 0],
            ['seo_analytics', 'clarity_project_id', '', 0],
            ['seo_analytics', 'clarity_mask_sensitive', '1', 0],
            ['seo_analytics', 'gsc_method', 'meta_tag', 0],
            ['seo_analytics', 'gsc_meta_tag', '', 0],
            ['seo_analytics', 'gsc_file_name', '', 0],
            ['seo_analytics', 'gsc_file_content', '', 0],
            ['seo_analytics', 'meta_pixel_enabled', '0', 0],
            ['seo_analytics', 'meta_pixel_id', '', 0],
            ['seo_analytics', 'meta_pixel_event_pageview', '1', 0],
            ['seo_analytics', 'meta_pixel_event_viewcontent', '1', 0],
            ['seo_analytics', 'meta_pixel_event_schedule', '1', 0],
            ['seo_analytics', 'meta_pixel_event_purchase', '1', 0],
            ['seo_analytics', 'meta_capi_token', '', 1],
            ['seo_analytics', 'meta_capi_test_code', '', 0],
            // Security
            ['security', 'session_timeout_minutes', '120', 0],
            ['security', 'password_min_length', '8', 0],
            ['security', 'password_require_special', '1', 0],
            ['security', 'two_factor_auth_required', '0', 0],
            ['security', 'max_login_attempts', '5', 0],
            ['security', 'lockout_time_minutes', '15', 0]
        ];

        foreach ($settings as $st) {
            $sStmt->execute($st);
        }

        // Sample bookings (including upcoming + past history for demo client Camilla)
        $bStmt = $pdo->prepare("INSERT INTO bookings (id, booking_reference, customer_name, customer_email, customer_phone, stylist_id, booking_date, start_time, end_time, total_duration, subtotal, discount_amount, tax_amount, total_amount, deposit_amount, payment_mode, payment_status, booking_status, promo_code, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
        $today = date('Y-m-d');
        $tomorrow = date('Y-m-d', strtotime('+1 day'));
        $upcoming4d = date('Y-m-d', strtotime('+4 days'));
        $past14d = date('Y-m-d', strtotime('-14 days'));
        $past35d = date('Y-m-d', strtotime('-35 days'));
        $bStmt->execute([1, 'AURA-782194', 'Camilla Davenport', 'camilla.d@example.com', '+1 (555) 891-2301', 1, $today, '11:00:00', '12:00:00', 60, 110.00, 22.00, 7.48, 95.48, 0.00, 'pay_at_salon', 'pending', 'confirmed', 'WELCOME20', 'Prefers quiet session with iced matcha tea.']);
        $bStmt->execute([2, 'AURA-782195', 'Seraphina Vance', 'seraphina@example.com', '+1 (555) 782-9012', 3, $tomorrow, '14:00:00', '16:30:00', 150, 320.00, 0.00, 27.20, 347.20, 86.80, 'online_deposit', 'paid', 'confirmed', NULL, 'Pre-wedding bridal trial consultation.']);
        $bStmt->execute([3, 'AURA-782210', 'Camilla Davenport', 'camilla.d@example.com', '+1 (555) 891-2301', 4, $upcoming4d, '15:00:00', '17:00:00', 120, 205.00, 0.00, 17.43, 222.43, 55.61, 'online_deposit', 'paid', 'confirmed', NULL, 'Hydra-Infusion facial paired with Japanese builder gel manicure.']);
        $bStmt->execute([4, 'AURA-782101', 'Camilla Davenport', 'camilla.d@example.com', '+1 (555) 891-2301', 1, $past14d, '13:00:00', '15:30:00', 150, 220.00, 0.00, 18.70, 238.70, 238.70, 'online_full', 'paid', 'completed', NULL, 'Autumn dimensional gloss refresh with bond-building masque.']);
        $bStmt->execute([5, 'AURA-782055', 'Camilla Davenport', 'camilla.d@example.com', '+1 (555) 891-2301', 4, $past35d, '16:00:00', '17:15:00', 75, 130.00, 0.00, 11.05, 141.05, 0.00, 'pay_at_salon', 'refunded', 'cancelled', NULL, 'Rescheduled due to travel delay.']);

        $biStmt = $pdo->prepare("INSERT INTO booking_items (id, booking_id, service_id, package_id, item_name, price, duration_minutes) VALUES (?, ?, ?, ?, ?, ?, ?)");
        $biStmt->execute([1, 1, 1, NULL, 'Signature Sculptural Cut & Blowout', 110.00, 60]);
        $biStmt->execute([2, 2, 5, NULL, 'Haute Bridal Makeup & Crown Styling', 320.00, 150]);
        $biStmt->execute([3, 3, 8, NULL, 'Hydra-Infusion Bio-Cellular Facial', 135.00, 60]);
        $biStmt->execute([4, 3, 11, NULL, 'Japanese Builder Gel Architectural Manicure', 70.00, 60]);
        $biStmt->execute([5, 4, 2, NULL, 'Bespoke Parisian Balayage', 220.00, 150]);
        $biStmt->execute([6, 5, 14, NULL, 'Warm Basalt Stone Body Rebalancing', 130.00, 75]);
    }

    $pdo->exec("PRAGMA foreign_keys = ON;");
}
