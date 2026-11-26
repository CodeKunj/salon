<?php
// api/helpers/slot_calculator.php

require_once __DIR__ . '/../config/database.php';

class SlotCalculator {
    public static function getAvailableSlots(string $date, array $serviceIds = [], ?int $stylistId = null, int $customDuration = 0): array {
        $pdo = Database::getConnection();

        // 1. Validate date
        $bookingTimestamp = strtotime($date);
        $todayTimestamp = strtotime(date('Y-m-d'));
        if (!$bookingTimestamp || $bookingTimestamp < $todayTimestamp) {
            return ['status' => 'past_date', 'message' => 'Cannot book appointments for past dates.', 'slots' => []];
        }

        // Get booking rules settings
        $settings = self::getSettingsMap($pdo, 'booking_rules');
        $maxAdvanceDays = (int)($settings['max_advance_booking_days'] ?? 60);
        $minAdvanceHours = (int)($settings['min_advance_booking_hours'] ?? 2);
        $slotInterval = (int)($settings['slot_duration_minutes'] ?? 30);
        $bufferMinutes = (int)($settings['slot_buffer_minutes'] ?? 15);
        $maxConcurrent = (int)($settings['max_concurrent_bookings_per_slot'] ?? 4);

        if ($bookingTimestamp > strtotime("+{$maxAdvanceDays} days", $todayTimestamp)) {
            return ['status' => 'too_far', 'message' => "Bookings can only be made up to {$maxAdvanceDays} days in advance.", 'slots' => []];
        }

        // 2. Check Special Closures
        $closureStmt = $pdo->prepare("SELECT * FROM special_closures WHERE closure_date = ?");
        $closureStmt->execute([$date]);
        $closures = $closureStmt->fetchAll();
        foreach ($closures as $c) {
            if ($c['is_full_day']) {
                return ['status' => 'holiday', 'message' => 'Studio is closed on this date: ' . ($c['reason'] ?: $c['title']), 'slots' => []];
            }
        }

        // 3. Check Salon Business Hours
        $dayOfWeek = (int)date('w', $bookingTimestamp); // 0=Sun, 1=Mon...
        $hoursStmt = $pdo->prepare("SELECT * FROM business_hours WHERE day_of_week = ? LIMIT 1");
        $hoursStmt->execute([$dayOfWeek]);
        $businessHours = $hoursStmt->fetch();

        if (!$businessHours || $businessHours['is_closed']) {
            return ['status' => 'closed_day', 'message' => 'Studio is closed on ' . date('l', $bookingTimestamp) . 's.', 'slots' => []];
        }

        $salonOpen = strtotime("{$date} {$businessHours['open_time']}");
        $salonClose = strtotime("{$date} {$businessHours['close_time']}");
        $salonBreakStart = $businessHours['break_start'] ? strtotime("{$date} {$businessHours['break_start']}") : null;
        $salonBreakEnd = $businessHours['break_end'] ? strtotime("{$date} {$businessHours['break_end']}") : null;

        // 4. Calculate total required duration
        $totalDuration = $customDuration;
        if ($totalDuration <= 0 && !empty($serviceIds)) {
            $inClause = implode(',', array_fill(0, count($serviceIds), '?'));
            $srvStmt = $pdo->prepare("SELECT SUM(duration_minutes) as total_dur FROM services WHERE id IN ($inClause)");
            $srvStmt->execute($serviceIds);
            $totalDuration = (int)($srvStmt->fetchColumn() ?: 45);
        }
        if ($totalDuration <= 0) {
            $totalDuration = 45; // Default 45 mins
        }

        // 5. Get stylists to evaluate
        $stylists = [];
        if ($stylistId && $stylistId > 0) {
            $stStmt = $pdo->prepare("SELECT id, name FROM stylists WHERE id = ? AND is_active = 1");
            $stStmt->execute([$stylistId]);
            $s = $stStmt->fetch();
            if ($s) {
                $stylists[] = $s;
            }
        } else {
            // All active stylists
            $stStmt = $pdo->query("SELECT id, name FROM stylists WHERE is_active = 1 ORDER BY sort_order ASC");
            $stylists = $stStmt->fetchAll();
        }

        if (empty($stylists)) {
            return ['status' => 'no_stylists', 'message' => 'No stylists available for this selection.', 'slots' => []];
        }

        // Fetch schedules for these stylists for this day of week
        $stylistIds = array_column($stylists, 'id');
        $inSty = implode(',', array_fill(0, count($stylistIds), '?'));
        $schStmt = $pdo->prepare("SELECT * FROM stylist_schedules WHERE day_of_week = ? AND stylist_id IN ($inSty)");
        $schStmt->execute(array_merge([$dayOfWeek], $stylistIds));
        $schedules = [];
        foreach ($schStmt->fetchAll() as $sch) {
            $schedules[$sch['stylist_id']] = $sch;
        }

        // Fetch existing bookings for this date (excluding cancelled)
        $bkStmt = $pdo->prepare("SELECT id, stylist_id, start_time, end_time, total_duration FROM bookings WHERE booking_date = ? AND booking_status != 'cancelled'");
        $bkStmt->execute([$date]);
        $existingBookings = $bkStmt->fetchAll();

        // 6. Generate time slots
        $slots = [];
        $currentTime = $salonOpen;
        $now = time();
        $isToday = ($date === date('Y-m-d'));
        $earliestAllowedTime = $now + ($minAdvanceHours * 3600);

        while (($currentTime + ($totalDuration * 60)) <= $salonClose) {
            $slotStart = $currentTime;
            $slotEnd = $currentTime + ($totalDuration * 60);
            $slotTimeStr = date('H:i', $slotStart);
            $formattedTime = date('g:i A', $slotStart);

            $isAvailable = true;
            $unavailabilityReason = '';

            // Check if slot is in the past or violates minimum advance booking
            if ($isToday && $slotStart < $earliestAllowedTime) {
                $isAvailable = false;
                $unavailabilityReason = "Requires {$minAdvanceHours}h advance notice";
            }

            // Check salon break window
            if ($isAvailable && $salonBreakStart && $salonBreakEnd) {
                if ($slotStart < $salonBreakEnd && $slotEnd > $salonBreakStart) {
                    $isAvailable = false;
                    $unavailabilityReason = 'Salon midday refresh window';
                }
            }

            // Check partial closures
            if ($isAvailable) {
                foreach ($closures as $c) {
                    if (!$c['is_full_day'] && $c['start_time'] && $c['end_time']) {
                        $cStart = strtotime("{$date} {$c['start_time']}");
                        $cEnd = strtotime("{$date} {$c['end_time']}");
                        if ($slotStart < $cEnd && $slotEnd > $cStart) {
                            $isAvailable = false;
                            $unavailabilityReason = $c['reason'] ?: 'Special closure';
                            break;
                        }
                    }
                }
            }

            // Check concurrent bookings capacity
            if ($isAvailable) {
                $concurrentCount = 0;
                foreach ($existingBookings as $eb) {
                    $ebStart = strtotime("{$date} {$eb['start_time']}");
                    $ebEnd = strtotime("{$date} {$eb['end_time']}") + ($bufferMinutes * 60);
                    if ($slotStart < $ebEnd && ($slotEnd + ($bufferMinutes * 60)) > $ebStart) {
                        $concurrentCount++;
                    }
                }
                if ($concurrentCount >= $maxConcurrent) {
                    $isAvailable = false;
                    $unavailabilityReason = 'Slot at maximum capacity';
                }
            }

            // Check which stylists are free
            $freeStylists = [];
            if ($isAvailable) {
                foreach ($stylists as $sty) {
                    $sId = $sty['id'];
                    $sch = $schedules[$sId] ?? null;
                    if (!$sch || !$sch['is_working']) {
                        continue; // Stylist off duty today
                    }

                    $styStart = strtotime("{$date} {$sch['start_time']}");
                    $styEnd = strtotime("{$date} {$sch['end_time']}");
                    if ($slotStart < $styStart || $slotEnd > $styEnd) {
                        continue; // Outside stylist work hours
                    }

                    if ($sch['break_start'] && $sch['break_end']) {
                        $styBrkStart = strtotime("{$date} {$sch['break_start']}");
                        $styBrkEnd = strtotime("{$date} {$sch['break_end']}");
                        if ($slotStart < $styBrkEnd && $slotEnd > $styBrkStart) {
                            continue; // Stylist break
                        }
                    }

                    // Check if stylist has overlapping booking
                    $hasConflict = false;
                    foreach ($existingBookings as $eb) {
                        if ($eb['stylist_id'] == $sId) {
                            $ebStart = strtotime("{$date} {$eb['start_time']}");
                            $ebEnd = strtotime("{$date} {$eb['end_time']}") + ($bufferMinutes * 60);
                            if ($slotStart < $ebEnd && ($slotEnd + ($bufferMinutes * 60)) > $ebStart) {
                                $hasConflict = true;
                                break;
                            }
                        }
                    }

                    if (!$hasConflict) {
                        $freeStylists[] = [
                            'id' => $sId,
                            'name' => $sty['name']
                        ];
                    }
                }

                if (empty($freeStylists)) {
                    $isAvailable = false;
                    $unavailabilityReason = 'No stylist available';
                }
            }

            $slots[] = [
                'time' => $slotTimeStr,
                'formatted' => $formattedTime,
                'available' => $isAvailable,
                'duration_minutes' => $totalDuration,
                'reason' => $unavailabilityReason,
                'available_stylists' => $freeStylists
            ];

            $currentTime += ($slotInterval * 60);
        }

        return [
            'status' => 'success',
            'date' => $date,
            'total_duration' => $totalDuration,
            'slots' => $slots
        ];
    }

    private static function getSettingsMap(PDO $pdo, string $group): array {
        $stmt = $pdo->prepare("SELECT setting_key, setting_value FROM settings WHERE setting_group = ?");
        $stmt->execute([$group]);
        $rows = $stmt->fetchAll();
        $map = [];
        foreach ($rows as $r) {
            $map[$r['setting_key']] = $r['setting_value'];
        }
        return $map;
    }
}
