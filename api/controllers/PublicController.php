<?php
// api/controllers/PublicController.php

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/../helpers/validator.php';
require_once __DIR__ . '/../helpers/slot_calculator.php';
require_once __DIR__ . '/../helpers/auth.php';

class PublicController {
    public static function getBootstrap(): void {
        $pdo = Database::getConnection();

        // 1. Fetch all settings (filter OUT is_secret=1)
        $settingsStmt = $pdo->query("SELECT setting_group, setting_key, setting_value FROM settings WHERE is_secret = 0");
        $rawSettings = $settingsStmt->fetchAll();
        $settings = [];
        foreach ($rawSettings as $row) {
            $settings[$row['setting_group']][$row['setting_key']] = $row['setting_value'];
        }

        // 2. Business Hours
        $hours = $pdo->query("SELECT day_of_week, day_name, open_time, close_time, break_start, break_end, is_closed FROM business_hours ORDER BY day_of_week ASC")->fetchAll();

        // 3. Special Closures (upcoming only)
        $today = date('Y-m-d');
        $closuresStmt = $pdo->prepare("SELECT id, title, closure_date, is_full_day, start_time, end_time, reason FROM special_closures WHERE closure_date >= ? ORDER BY closure_date ASC");
        $closuresStmt->execute([$today]);
        $closures = $closuresStmt->fetchAll();

        // 4. Categories & Services
        $categories = $pdo->query("SELECT id, name, slug, description, image_url, icon, sort_order FROM categories WHERE is_active = 1 ORDER BY sort_order ASC")->fetchAll();
        $services = $pdo->query("SELECT s.id, s.category_id, s.name, s.slug, s.description, s.duration_minutes, s.base_price, s.offer_price, s.image_url, s.is_featured, s.is_taxable, c.name as category_name, c.slug as category_slug FROM services s JOIN categories c ON s.category_id = c.id WHERE s.is_active = 1 ORDER BY s.sort_order ASC, s.id ASC")->fetchAll();

        // 5. Packages
        $packages = $pdo->query("SELECT id, name, slug, tagline, description, price, original_price, duration_minutes, image_url, is_featured FROM packages WHERE is_active = 1 ORDER BY sort_order ASC")->fetchAll();

        // 6. Stylists
        $stylists = $pdo->query("SELECT id, name, role_title, bio, avatar_url, rating, review_count FROM stylists WHERE is_active = 1 ORDER BY sort_order ASC")->fetchAll();

        // 7. Lookbook Gallery
        $gallery = $pdo->query("SELECT id, title, category, image_url, tag, sort_order FROM cms_gallery WHERE is_active = 1 ORDER BY sort_order ASC")->fetchAll();

        // 8. Testimonials
        $testimonials = $pdo->query("SELECT id, client_name, service_tag, review_text, rating, avatar_url FROM cms_testimonials WHERE is_active = 1 ORDER BY sort_order ASC")->fetchAll();

        // 9. FAQs
        $faqs = $pdo->query("SELECT id, question, answer, category, sort_order FROM cms_faqs WHERE is_active = 1 ORDER BY sort_order ASC")->fetchAll();

        // 10. CMS Hero Banner
        $hero = $pdo->query("SELECT * FROM cms_hero WHERE is_active = 1 ORDER BY id DESC LIMIT 1")->fetch() ?: [
            'headline' => 'Haute Coiffure & Bespoke Aesthetic Artistry',
            'subheadline' => 'Immerse in an editorial sanctuary where master stylists craft your signature look.',
            'badge_text' => 'OPEN TODAY • 09:00 - 20:00',
            'cta_text' => 'Book Your Experience',
            'cta_link' => '#book'
        ];

        // Public tracking configuration strictly sanitized
        $tracking = [
            'ga4' => [
                'enabled' => ($settings['seo_analytics']['ga4_enabled'] ?? '0') === '1',
                'measurement_id' => $settings['seo_analytics']['ga4_measurement_id'] ?? '',
                'events' => [
                    'view_service' => ($settings['seo_analytics']['ga4_event_view_service'] ?? '0') === '1',
                    'begin_booking' => ($settings['seo_analytics']['ga4_event_begin_booking'] ?? '0') === '1',
                    'booking_confirmed' => ($settings['seo_analytics']['ga4_event_booking_confirmed'] ?? '0') === '1'
                ]
            ],
            'clarity' => [
                'enabled' => ($settings['seo_analytics']['clarity_enabled'] ?? '0') === '1',
                'project_id' => $settings['seo_analytics']['clarity_project_id'] ?? '',
                'mask_sensitive' => ($settings['seo_analytics']['clarity_mask_sensitive'] ?? '1') === '1'
            ],
            'gsc' => [
                'method' => $settings['seo_analytics']['gsc_method'] ?? 'meta_tag',
                'meta_tag' => $settings['seo_analytics']['gsc_meta_tag'] ?? ''
            ],
            'meta_pixel' => [
                'enabled' => ($settings['seo_analytics']['meta_pixel_enabled'] ?? '0') === '1',
                'pixel_id' => $settings['seo_analytics']['meta_pixel_id'] ?? '',
                'events' => [
                    'page_view' => ($settings['seo_analytics']['meta_pixel_event_pageview'] ?? '1') === '1',
                    'view_content' => ($settings['seo_analytics']['meta_pixel_event_viewcontent'] ?? '1') === '1',
                    'schedule' => ($settings['seo_analytics']['meta_pixel_event_schedule'] ?? '1') === '1',
                    'purchase' => ($settings['seo_analytics']['meta_pixel_event_purchase'] ?? '1') === '1'
                ]
            ]
        ];

        // SEO meta tags for frontend injection
        $seo = [
            'title' => $settings['seo_analytics']['seo_meta_title'] ?? 'RiTiVerse Salon & Aesthetics',
            'description' => $settings['seo_analytics']['seo_meta_description'] ?? '',
            'keywords' => $settings['seo_analytics']['seo_keywords'] ?? '',
            'og_title' => $settings['seo_analytics']['seo_og_title'] ?? '',
            'og_description' => $settings['seo_analytics']['seo_og_description'] ?? '',
            'og_image' => $settings['seo_analytics']['seo_og_image'] ?? '',
            'robots' => $settings['seo_analytics']['seo_robots_directive'] ?? 'index, follow',
            'canonical' => $settings['seo_analytics']['seo_canonical_url'] ?? ''
        ];

        // Payment public rules
        $payments = [
            'pay_at_salon' => ($settings['payments']['payment_pay_at_salon'] ?? '1') === '1',
            'online_deposit' => ($settings['payments']['payment_online_deposit'] ?? '1') === '1',
            'online_full' => ($settings['payments']['payment_online_full'] ?? '1') === '1',
            'deposit_percentage' => (float)($settings['payments']['payment_deposit_percentage'] ?? 25),
            'tax_rate' => (float)($settings['payments']['tax_rate'] ?? 0),
            'tax_inclusive' => ($settings['payments']['tax_inclusive'] ?? '0') === '1',
            'tax_name' => $settings['payments']['tax_name'] ?? 'Tax',
            'currency' => $settings['general']['currency'] ?? 'INR',
            'currency_symbol' => $settings['general']['currency_symbol'] ?? '₹',
            'gateway' => $settings['payments']['payment_gateway'] ?? 'stripe',
            'gateway_mode' => $settings['payments']['gateway_mode'] ?? 'test',
            'stripe_publishable_key' => $settings['payments']['stripe_publishable_key'] ?? '',
            'razorpay_key_id' => $settings['payments']['razorpay_key_id'] ?? ''
        ];

        // Maintenance state
        $maintenance = [
            'enabled' => ($settings['seo_analytics']['maintenance_mode'] ?? '0') === '1',
            'message' => $settings['seo_analytics']['maintenance_message'] ?? 'Studio undergoes maintenance.'
        ];

        jsonResponse([
            'salon' => $settings['general'] ?? [],
            'hours' => $hours,
            'special_closures' => $closures,
            'categories' => $categories,
            'services' => $services,
            'packages' => $packages,
            'stylists' => $stylists,
            'gallery' => $gallery,
            'testimonials' => $testimonials,
            'faqs' => $faqs,
            'hero' => $hero,
            'booking_rules' => $settings['booking_rules'] ?? [],
            'payments' => $payments,
            'tracking' => $tracking,
            'seo' => $seo,
            'maintenance' => $maintenance
        ], 200, 'Bootstrap loaded');
    }

    public static function getSlots(): void {
        $date = trim((string)($_GET['date'] ?? date('Y-m-d')));
        if (!Validator::validateDate($date)) {
            errorResponse('Please provide a valid appointment date (YYYY-MM-DD).', 422);
        }
        $serviceIdsRaw = $_GET['services'] ?? '';
        $stylistId = !empty($_GET['stylist_id']) ? (int)$_GET['stylist_id'] : null;
        $customDuration = !empty($_GET['duration']) ? (int)$_GET['duration'] : 0;

        $serviceIds = [];
        if (!empty($serviceIdsRaw)) {
            $parts = explode(',', $serviceIdsRaw);
            foreach ($parts as $p) {
                $val = (int)trim($p);
                if ($val > 0) $serviceIds[] = $val;
            }
        }

        $result = SlotCalculator::getAvailableSlots($date, $serviceIds, $stylistId, $customDuration);
        jsonResponse($result);
    }

    public static function validatePromo(): void {
        $input = getJsonInput();
        $code = strtoupper(trim($input['code'] ?? ''));
        $subtotal = (float)($input['subtotal'] ?? 0);

        if (empty($code)) {
            errorResponse('Promo code is required.', 422);
        }

        $pdo = Database::getConnection();
        $stmt = $pdo->prepare("SELECT * FROM promo_codes WHERE code = ? AND is_active = 1 LIMIT 1");
        $stmt->execute([$code]);
        $promo = $stmt->fetch();

        if (!$promo) {
            errorResponse('Invalid promo code.', 404);
        }

        $today = date('Y-m-d');
        if (!empty($promo['start_date']) && $promo['start_date'] > $today) {
            errorResponse('Promo code is not active yet.', 400);
        }
        if (!empty($promo['end_date']) && $promo['end_date'] < $today) {
            errorResponse('Promo code has expired.', 400);
        }
        if ($promo['usage_limit'] > 0 && $promo['times_used'] >= $promo['usage_limit']) {
            errorResponse('Promo code usage limit reached.', 400);
        }
        if ($subtotal < (float)$promo['min_order_value']) {
            $symStmt = $pdo->query("SELECT setting_value FROM settings WHERE setting_key = 'currency_symbol'");
            $sym = $symStmt->fetchColumn() ?: '₹';
            errorResponse("Minimum order amount of {$sym}" . number_format((float)$promo['min_order_value'], 2) . " required for this code.", 400);
        }

        $discount = 0.0;
        if ($promo['discount_type'] === 'percentage') {
            $discount = ($subtotal * (float)$promo['discount_value']) / 100.0;
            if (!empty($promo['max_discount']) && $discount > (float)$promo['max_discount']) {
                $discount = (float)$promo['max_discount'];
            }
        } else {
            $discount = (float)$promo['discount_value'];
            if ($discount > $subtotal) {
                $discount = $subtotal;
            }
        }

        jsonResponse([
            'valid' => true,
            'code' => $promo['code'],
            'discount_type' => $promo['discount_type'],
            'discount_value' => (float)$promo['discount_value'],
            'discount_amount' => round($discount, 2),
            'new_subtotal' => round(max(0, $subtotal - $discount), 2)
        ], 200, 'Promo code applied');
    }

    public static function bookAppointment(): void {
        $input = getJsonInput();
        $pdo = Database::getConnection();

        // Validate basic fields
        $name = trim($input['name'] ?? '');
        $email = strtolower(trim($input['email'] ?? ''));
        $phone = trim($input['phone'] ?? '');
        $date = trim($input['date'] ?? '');
        $startTime = trim($input['start_time'] ?? '');
        $stylistId = !empty($input['stylist_id']) ? (int)$input['stylist_id'] : null;
        $serviceIds = (array)($input['service_ids'] ?? []);
        $packageId = !empty($input['package_id']) ? (int)$input['package_id'] : null;
        $paymentMode = in_array($input['payment_mode'] ?? '', ['pay_at_salon', 'online_deposit', 'online_full']) ? $input['payment_mode'] : 'pay_at_salon';
        $promoCode = trim($input['promo_code'] ?? '');
        $notes = trim($input['notes'] ?? '');

        if (empty($name) || empty($email) || empty($phone) || empty($date) || empty($startTime)) {
            errorResponse('Please fill in all required customer and appointment details.', 422);
        }

        if (!Validator::validateDate($date)) {
            errorResponse('Please provide a valid appointment date (YYYY-MM-DD).', 422);
        }

        if ($date < date('Y-m-d')) {
            errorResponse('Appointments cannot be booked for past dates.', 422);
        }

        if (!Validator::validateTime($startTime)) {
            errorResponse('Please select a valid appointment time slot.', 422);
        }

        if (!Validator::validateEmail($email)) {
            errorResponse('Please provide a valid email address.', 422);
        }

        if (empty($serviceIds) && empty($packageId)) {
            errorResponse('Please select at least one service or package.', 422);
        }

        if ($stylistId) {
            $stCheck = $pdo->prepare("SELECT id FROM stylists WHERE id = ? AND is_active = 1 LIMIT 1");
            $stCheck->execute([$stylistId]);
            if (!$stCheck->fetch()) {
                errorResponse('Selected stylist is currently unavailable.', 422);
            }
        }

        // Calculate items, prices, duration
        $bookingItems = [];
        $subtotal = 0.0;
        $totalDuration = 0;

        if (!empty($packageId)) {
            $pkgStmt = $pdo->prepare("SELECT id, name, price, duration_minutes FROM packages WHERE id = ? AND is_active = 1");
            $pkgStmt->execute([$packageId]);
            $pkg = $pkgStmt->fetch();
            if ($pkg) {
                $bookingItems[] = [
                    'package_id' => $pkg['id'],
                    'service_id' => null,
                    'item_name' => $pkg['name'],
                    'price' => (float)$pkg['price'],
                    'duration_minutes' => (int)$pkg['duration_minutes']
                ];
                $subtotal += (float)$pkg['price'];
                $totalDuration += (int)$pkg['duration_minutes'];
            }
        }

        if (!empty($serviceIds)) {
            $inClause = implode(',', array_fill(0, count($serviceIds), '?'));
            $srvStmt = $pdo->prepare("SELECT id, name, base_price, offer_price, duration_minutes FROM services WHERE id IN ($inClause) AND is_active = 1");
            $srvStmt->execute($serviceIds);
            $srvs = $srvStmt->fetchAll();
            foreach ($srvs as $srv) {
                $itemPrice = $srv['offer_price'] !== null ? (float)$srv['offer_price'] : (float)$srv['base_price'];
                $bookingItems[] = [
                    'package_id' => null,
                    'service_id' => $srv['id'],
                    'item_name' => $srv['name'],
                    'price' => $itemPrice,
                    'duration_minutes' => (int)$srv['duration_minutes']
                ];
                $subtotal += $itemPrice;
                $totalDuration += (int)$srv['duration_minutes'];
            }
        }

        if (empty($bookingItems)) {
            errorResponse('Selected services or package are unavailable.', 404);
        }

        // Calculate end time
        $startTimestamp = strtotime("{$date} {$startTime}");
        if ($startTimestamp === false) {
            errorResponse('Invalid appointment date or time provided.', 422);
        }
        $endTimestamp = $startTimestamp + ($totalDuration * 60);
        $endTime = date('H:i:s', $endTimestamp);

        // Check auto-confirm and currency/tax rules safely before transaction write
        $discountAmount = 0.0;
        $promoIdToIncrement = null;
        if (!empty($promoCode)) {
            $pStmt = $pdo->prepare("SELECT * FROM promo_codes WHERE code = ? AND is_active = 1 LIMIT 1");
            $pStmt->execute([$promoCode]);
            $promo = $pStmt->fetch();
            if ($promo && $subtotal >= (float)$promo['min_order_value']) {
                if ($promo['discount_type'] === 'percentage') {
                    $discountAmount = ($subtotal * (float)$promo['discount_value']) / 100.0;
                    if (!empty($promo['max_discount']) && $discountAmount > (float)$promo['max_discount']) {
                        $discountAmount = (float)$promo['max_discount'];
                    }
                } else {
                    $discountAmount = min($subtotal, (float)$promo['discount_value']);
                }
                $promoIdToIncrement = (int)$promo['id'];
            }
        }

        // Calculate Tax
        $taxStmt = $pdo->query("SELECT setting_value FROM settings WHERE setting_key = 'tax_rate'");
        $taxRate = (float)($taxStmt->fetchColumn() ?: 0);
        $taxInclusiveStmt = $pdo->query("SELECT setting_value FROM settings WHERE setting_key = 'tax_inclusive'");
        $taxInclusive = ($taxInclusiveStmt->fetchColumn() ?: '0') === '1';

        $discountedSubtotal = max(0, $subtotal - $discountAmount);
        $taxAmount = 0.0;
        if ($taxInclusive) {
            $taxAmount = round($discountedSubtotal - ($discountedSubtotal / (1 + ($taxRate / 100))), 2);
            $totalAmount = $discountedSubtotal;
        } else {
            $taxAmount = round(($discountedSubtotal * $taxRate) / 100, 2);
            $totalAmount = round($discountedSubtotal + $taxAmount, 2);
        }

        // Calculate Deposit Amount
        $depositAmount = 0.0;
        $depositPctStmt = $pdo->query("SELECT setting_value FROM settings WHERE setting_key = 'payment_deposit_percentage'");
        $depositPct = (float)($depositPctStmt->fetchColumn() ?: 25);

        if ($paymentMode === 'online_deposit') {
            $depositAmount = round(($totalAmount * $depositPct) / 100, 2);
        } elseif ($paymentMode === 'online_full') {
            $depositAmount = $totalAmount;
        }

        // Auto-assign stylist if 'Any Available'
        if (!$stylistId) {
            $slotsData = SlotCalculator::getAvailableSlots($date, $serviceIds, null, $totalDuration);
            $matchedSlot = null;
            $slotTime24 = date('H:i', $startTimestamp);
            foreach ($slotsData['slots'] as $sl) {
                if ($sl['time'] === $slotTime24 && $sl['available'] && !empty($sl['available_stylists'])) {
                    $matchedSlot = $sl;
                    break;
                }
            }
            if ($matchedSlot && !empty($matchedSlot['available_stylists'])) {
                $stylistId = $matchedSlot['available_stylists'][0]['id'];
            } else {
                // Pick first active stylist fallback
                $firstSty = $pdo->query("SELECT id FROM stylists WHERE is_active = 1 LIMIT 1")->fetchColumn();
                $stylistId = $firstSty ? (int)$firstSty : null;
            }
        }

        // Check auto-confirm setting
        $autoConfirmStmt = $pdo->query("SELECT setting_value FROM settings WHERE setting_key = 'auto_confirm_bookings'");
        $autoConfirm = ($autoConfirmStmt->fetchColumn() ?: '1') === '1';
        $bookingStatus = $autoConfirm ? 'confirmed' : 'pending';
        $paymentStatus = ($paymentMode === 'online_full' || $paymentMode === 'online_deposit') ? 'paid' : 'pending';

        // Generate unique reference ID
        $reference = 'AURA-' . strtoupper(substr(md5(uniqid((string)mt_rand(), true)), 0, 6));

        $pdo->beginTransaction();
        try {
            if ($promoIdToIncrement) {
                $pdo->prepare("UPDATE promo_codes SET times_used = times_used + 1 WHERE id = ?")->execute([$promoIdToIncrement]);
            }

            // Insert booking record
            $insStmt = $pdo->prepare("INSERT INTO bookings (
                booking_reference, customer_name, customer_email, customer_phone, stylist_id,
                booking_date, start_time, end_time, total_duration, subtotal, discount_amount,
                tax_amount, total_amount, deposit_amount, payment_mode, payment_status,
                booking_status, promo_code, notes
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");

            $insStmt->execute([
                $reference, $name, $email, $phone, $stylistId,
                $date, date('H:i:s', $startTimestamp), $endTime, $totalDuration, $subtotal, $discountAmount,
                $taxAmount, $totalAmount, $depositAmount, $paymentMode, $paymentStatus,
                $bookingStatus, $promoCode ?: null, $notes ?: null
            ]);

            $bookingId = (int)$pdo->lastInsertId();

            // Insert booking items
            $itemStmt = $pdo->prepare("INSERT INTO booking_items (booking_id, service_id, package_id, item_name, price, duration_minutes) VALUES (?, ?, ?, ?, ?, ?)");
            foreach ($bookingItems as $item) {
                $itemStmt->execute([
                    $bookingId,
                    $item['service_id'],
                    $item['package_id'],
                    $item['item_name'],
                    $item['price'],
                    $item['duration_minutes']
                ]);
            }

            $pdo->commit();
        } catch (Throwable $e) {
            if ($pdo->inTransaction()) {
                $pdo->rollBack();
            }
            throw $e;
        }

        // Fetch assigned stylist name
        $stylistName = 'Master Team Artist';
        if ($stylistId) {
            $stNameStmt = $pdo->prepare("SELECT name FROM stylists WHERE id = ?");
            $stNameStmt->execute([$stylistId]);
            $stylistName = $stNameStmt->fetchColumn() ?: 'Master Team Artist';
        }

        // Audit log
        Auth::logAudit(null, 'BOOKING_CREATED', 'bookings', (string)$bookingId, "New booking {$reference} for {$name} ({$email})");

        $currStmt = $pdo->query("SELECT setting_value FROM settings WHERE setting_key = 'currency'");
        $currencyCode = $currStmt->fetchColumn() ?: 'INR';

        // Optional server-side Meta Conversions API (CAPI) forwarder if enabled
        self::triggerMetaCAPI('Schedule', [
            'booking_reference' => $reference,
            'value' => $totalAmount,
            'currency' => $currencyCode,
            'email' => $email,
            'phone' => $phone
        ]);

        jsonResponse([
            'booking_id' => $bookingId,
            'booking_reference' => $reference,
            'customer_name' => $name,
            'customer_email' => $email,
            'customer_phone' => $phone,
            'stylist_name' => $stylistName,
            'date' => $date,
            'start_time' => date('g:i A', $startTimestamp),
            'end_time' => date('g:i A', $endTimestamp),
            'total_duration' => $totalDuration,
            'subtotal' => $subtotal,
            'discount_amount' => $discountAmount,
            'tax_amount' => $taxAmount,
            'total_amount' => $totalAmount,
            'deposit_amount' => $depositAmount,
            'payment_mode' => $paymentMode,
            'payment_status' => $paymentStatus,
            'booking_status' => $bookingStatus,
            'items' => $bookingItems
        ], 201, 'Appointment successfully booked');
    }

    public static function trackEvent(): void {
        $input = getJsonInput();
        $eventName = trim($input['event_name'] ?? '');
        $eventData = (array)($input['data'] ?? []);

        // Optional server-side Meta CAPI dispatch
        if (!empty($eventName)) {
            self::triggerMetaCAPI($eventName, $eventData);
        }

        jsonResponse(['status' => 'tracked', 'event' => $eventName]);
    }

    private static function triggerMetaCAPI(string $eventName, array $customData): void {
        try {
            $pdo = Database::getConnection();
            $metaSettingsStmt = $pdo->query("SELECT setting_key, setting_value FROM settings WHERE setting_group = 'seo_analytics' AND setting_key IN ('meta_pixel_id', 'meta_capi_token', 'meta_capi_test_code', 'meta_pixel_enabled')");
            $metaConf = [];
            foreach ($metaSettingsStmt->fetchAll() as $row) {
                $metaConf[$row['setting_key']] = $row['setting_value'];
            }

            if (($metaConf['meta_pixel_enabled'] ?? '0') !== '1') {
                return;
            }

            $pixelId = $metaConf['meta_pixel_id'] ?? '';
            $capiToken = $metaConf['meta_capi_token'] ?? '';
            if (empty($pixelId) || empty($capiToken) || str_contains($capiToken, 'SAMPLE_TOKEN')) {
                return; // Gracefully skip in test/sample mode
            }

            // In production, dispatch via cURL to graph.facebook.com/v19.0/{pixel_id}/events
        } catch (Exception $e) {
            // Never break client flow for analytics errors
        }
    }
}
