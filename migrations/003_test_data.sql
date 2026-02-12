-- SIBM Canteen Test Data Script (Clean Version)
-- Uses realistic item names for proper display  
-- Test items identified by stock=999
-- NOTE: Ignore any "Duplicate column" errors - they're harmless

-- =============================================
-- 1. INSERT TEST USER
-- =============================================
INSERT INTO users (full_name, prn, phone, email, password) VALUES
('Demo Student', 'DEMO001', '9999900001', 'demo@sibm.edu.in', 'demo123')
ON DUPLICATE KEY UPDATE full_name = VALUES(full_name);

SET @test_user_id = (SELECT id FROM users WHERE email = 'demo@sibm.edu.in' LIMIT 1);

-- =============================================
-- 2. INSERT SHOP STATUS
-- =============================================
INSERT INTO shop_status (shop_name, is_accepting_orders, scheduled_close_time, scheduled_open_time) VALUES
('Cafeteria', 1, '18:00:00', '08:00:00'),
('Bakery', 1, '17:00:00', '09:00:00')
ON DUPLICATE KEY UPDATE updated_at = CURRENT_TIMESTAMP;

-- =============================================
-- 3. INSERT MENU ITEMS (Clean names, stock=999)
-- =============================================
INSERT INTO menu_items (name, price, category, image_emoji, shop, stock_quantity) VALUES
('Veg Biryani', 120, 'Main Course', '🍚', 'Cafeteria', 999),
('Chicken Burger', 150, 'Snack', '🍔', 'Cafeteria', 999),
('Masala Dosa', 80, 'Main', '🥘', 'Cafeteria', 999),
('Paneer Tikka', 140, 'Main', '🧀', 'Cafeteria', 999),
('Cold Coffee', 60, 'Beverage', '☕', 'Cafeteria', 999),
('Fresh Orange Juice', 50, 'Beverage', '🍊', 'Bakery', 999),
('Mango Shake', 70, 'Beverage', '🥭', 'Bakery', 999),
('Chocolate Cake', 90, 'Dessert', '🍰', 'Bakery', 999)
ON DUPLICATE KEY UPDATE stock_quantity = 999;

-- Get menu item IDs (use price+name combo for unique match)
SET @biryani_id = (SELECT id FROM menu_items WHERE name = 'Veg Biryani' AND price = 120 LIMIT 1);
SET @burger_id = (SELECT id FROM menu_items WHERE name = 'Chicken Burger' AND price = 150 LIMIT 1);
SET @dosa_id = (SELECT id FROM menu_items WHERE name = 'Masala Dosa' AND price = 80 LIMIT 1);
SET @paneer_id = (SELECT id FROM menu_items WHERE name = 'Paneer Tikka' AND price = 140 LIMIT 1);
SET @coffee_id = (SELECT id FROM menu_items WHERE name = 'Cold Coffee' AND price = 60 LIMIT 1);
SET @orange_id = (SELECT id FROM menu_items WHERE name = 'Fresh Orange Juice' AND price = 50 LIMIT 1);
SET @mango_id = (SELECT id FROM menu_items WHERE name = 'Mango Shake' AND price = 70 LIMIT 1);
SET @cake_id = (SELECT id FROM menu_items WHERE name = 'Chocolate Cake' AND price = 90 LIMIT 1);

-- =============================================
-- 4. TODAY'S ORDERS (For trending & wait time)
-- =============================================

-- Order 1: Completed
INSERT INTO orders (user_id, total_amount, status, daily_order_number, order_date, created_at)
VALUES (@test_user_id, 200, 'Completed', 901, CURDATE(), DATE_SUB(NOW(), INTERVAL 2 HOUR));
SET @o1 = LAST_INSERT_ID();
UPDATE orders SET updated_at = DATE_SUB(NOW(), INTERVAL 112 MINUTE) WHERE id = @o1;
INSERT INTO order_items (order_id, menu_item_id, quantity, price_at_time) VALUES
(@o1, @biryani_id, 1, 120), (@o1, @dosa_id, 1, 80);

-- Order 2: Completed
INSERT INTO orders (user_id, total_amount, status, daily_order_number, order_date, created_at)
VALUES (@test_user_id, 290, 'Completed', 902, CURDATE(), DATE_SUB(NOW(), INTERVAL 3 HOUR));
SET @o2 = LAST_INSERT_ID();
UPDATE orders SET updated_at = DATE_SUB(NOW(), INTERVAL 168 MINUTE) WHERE id = @o2;
INSERT INTO order_items (order_id, menu_item_id, quantity, price_at_time) VALUES
(@o2, @burger_id, 1, 150), (@o2, @paneer_id, 1, 140);

-- Order 3: Completed
INSERT INTO orders (user_id, total_amount, status, daily_order_number, order_date, created_at)
VALUES (@test_user_id, 160, 'Completed', 903, CURDATE(), DATE_SUB(NOW(), INTERVAL 1 HOUR));
SET @o3 = LAST_INSERT_ID();
UPDATE orders SET updated_at = DATE_SUB(NOW(), INTERVAL 50 MINUTE) WHERE id = @o3;
INSERT INTO order_items (order_id, menu_item_id, quantity, price_at_time) VALUES
(@o3, @dosa_id, 2, 80);

-- Order 4: Pending
INSERT INTO orders (user_id, total_amount, status, daily_order_number, order_date, created_at)
VALUES (@test_user_id, 180, 'Pending', 904, CURDATE(), NOW());
SET @o4 = LAST_INSERT_ID();
INSERT INTO order_items (order_id, menu_item_id, quantity, price_at_time) VALUES
(@o4, @biryani_id, 1, 120), (@o4, @coffee_id, 1, 60);

-- =============================================
-- 5. PAST WEEK ORDERS (For analytics charts)
-- =============================================

-- Yesterday
INSERT INTO orders (user_id, total_amount, status, daily_order_number, order_date, created_at)
VALUES (@test_user_id, 350, 'Completed', 801, DATE_SUB(CURDATE(), INTERVAL 1 DAY), DATE_SUB(NOW(), INTERVAL 1 DAY));
SET @o5 = LAST_INSERT_ID();
UPDATE orders SET updated_at = DATE_ADD(DATE_SUB(NOW(), INTERVAL 1 DAY), INTERVAL 15 MINUTE) WHERE id = @o5;
INSERT INTO order_items (order_id, menu_item_id, quantity, price_at_time) VALUES
(@o5, @biryani_id, 2, 120), (@o5, @coffee_id, 2, 60);

INSERT INTO orders (user_id, total_amount, status, daily_order_number, order_date, created_at)
VALUES (@test_user_id, 230, 'Completed', 802, DATE_SUB(CURDATE(), INTERVAL 1 DAY), 
        DATE_ADD(DATE_SUB(NOW(), INTERVAL 1 DAY), INTERVAL 2 HOUR));
SET @o6 = LAST_INSERT_ID();
UPDATE orders SET updated_at = DATE_ADD(DATE_SUB(NOW(), INTERVAL 1 DAY), INTERVAL 132 MINUTE) WHERE id = @o6;
INSERT INTO order_items (order_id, menu_item_id, quantity, price_at_time) VALUES
(@o6, @burger_id, 1, 150), (@o6, @dosa_id, 1, 80);

-- 2 days ago
INSERT INTO orders (user_id, total_amount, status, daily_order_number, order_date, created_at)
VALUES (@test_user_id, 400, 'Completed', 701, DATE_SUB(CURDATE(), INTERVAL 2 DAY), DATE_SUB(NOW(), INTERVAL 2 DAY));
SET @o7 = LAST_INSERT_ID();
UPDATE orders SET updated_at = DATE_ADD(DATE_SUB(NOW(), INTERVAL 2 DAY), INTERVAL 10 MINUTE) WHERE id = @o7;
INSERT INTO order_items (order_id, menu_item_id, quantity, price_at_time) VALUES
(@o7, @paneer_id, 2, 140), (@o7, @biryani_id, 1, 120);

-- 3 days ago
INSERT INTO orders (user_id, total_amount, status, daily_order_number, order_date, created_at)
VALUES (@test_user_id, 280, 'Completed', 601, DATE_SUB(CURDATE(), INTERVAL 3 DAY), DATE_SUB(NOW(), INTERVAL 3 DAY));
SET @o8 = LAST_INSERT_ID();
UPDATE orders SET updated_at = DATE_ADD(DATE_SUB(NOW(), INTERVAL 3 DAY), INTERVAL 8 MINUTE) WHERE id = @o8;
INSERT INTO order_items (order_id, menu_item_id, quantity, price_at_time) VALUES
(@o8, @dosa_id, 2, 80), (@o8, @mango_id, 2, 70);

-- 5 days ago
INSERT INTO orders (user_id, total_amount, status, daily_order_number, order_date, created_at)
VALUES (@test_user_id, 190, 'Completed', 401, DATE_SUB(CURDATE(), INTERVAL 5 DAY), DATE_SUB(NOW(), INTERVAL 5 DAY));
SET @o9 = LAST_INSERT_ID();
UPDATE orders SET updated_at = DATE_ADD(DATE_SUB(NOW(), INTERVAL 5 DAY), INTERVAL 14 MINUTE) WHERE id = @o9;
INSERT INTO order_items (order_id, menu_item_id, quantity, price_at_time) VALUES
(@o9, @orange_id, 2, 50), (@o9, @mango_id, 1, 70);

-- =============================================
-- 6. HOURLY ORDERS TODAY (Peak hours chart)
-- =============================================

INSERT INTO orders (user_id, total_amount, status, daily_order_number, order_date, created_at)
VALUES (@test_user_id, 80, 'Completed', 905, CURDATE(), TIMESTAMP(CURDATE(), '09:00:00'));
SET @h1 = LAST_INSERT_ID();
UPDATE orders SET updated_at = TIMESTAMP(CURDATE(), '09:10:00') WHERE id = @h1;
INSERT INTO order_items (order_id, menu_item_id, quantity, price_at_time) VALUES (@h1, @dosa_id, 1, 80);

INSERT INTO orders (user_id, total_amount, status, daily_order_number, order_date, created_at)
VALUES (@test_user_id, 120, 'Completed', 906, CURDATE(), TIMESTAMP(CURDATE(), '12:00:00'));
SET @h2 = LAST_INSERT_ID();
UPDATE orders SET updated_at = TIMESTAMP(CURDATE(), '12:08:00') WHERE id = @h2;
INSERT INTO order_items (order_id, menu_item_id, quantity, price_at_time) VALUES (@h2, @biryani_id, 1, 120);

INSERT INTO orders (user_id, total_amount, status, daily_order_number, order_date, created_at)
VALUES (@test_user_id, 150, 'Completed', 907, CURDATE(), TIMESTAMP(CURDATE(), '12:30:00'));
SET @h3 = LAST_INSERT_ID();
UPDATE orders SET updated_at = TIMESTAMP(CURDATE(), '12:42:00') WHERE id = @h3;
INSERT INTO order_items (order_id, menu_item_id, quantity, price_at_time) VALUES (@h3, @burger_id, 1, 150);

INSERT INTO orders (user_id, total_amount, status, daily_order_number, order_date, created_at)
VALUES (@test_user_id, 160, 'Completed', 908, CURDATE(), TIMESTAMP(CURDATE(), '13:00:00'));
SET @h4 = LAST_INSERT_ID();
UPDATE orders SET updated_at = TIMESTAMP(CURDATE(), '13:11:00') WHERE id = @h4;
INSERT INTO order_items (order_id, menu_item_id, quantity, price_at_time) VALUES (@h4, @dosa_id, 2, 80);

INSERT INTO orders (user_id, total_amount, status, daily_order_number, order_date, created_at)
VALUES (@test_user_id, 130, 'Completed', 909, CURDATE(), TIMESTAMP(CURDATE(), '16:00:00'));
SET @h5 = LAST_INSERT_ID();
UPDATE orders SET updated_at = TIMESTAMP(CURDATE(), '16:09:00') WHERE id = @h5;
INSERT INTO order_items (order_id, menu_item_id, quantity, price_at_time) VALUES 
(@h5, @coffee_id, 1, 60), (@h5, @mango_id, 1, 70);

-- =============================================
-- 7. VERIFY DATA
-- =============================================
SELECT '=== TEST DATA LOADED ===' as Status;
SELECT COUNT(*) as 'Test Menu Items' FROM menu_items WHERE stock_quantity = 999;
SELECT COUNT(*) as 'Orders Today' FROM orders WHERE order_date = CURDATE();
SELECT COUNT(*) as 'Orders This Week' FROM orders WHERE order_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY);

SELECT m.name as 'Trending Today', COUNT(*) as Orders 
FROM order_items oi JOIN orders o ON oi.order_id = o.id JOIN menu_items m ON oi.menu_item_id = m.id 
WHERE DATE(o.created_at) = CURDATE() GROUP BY m.id, m.name ORDER BY Orders DESC LIMIT 1;

SELECT ROUND(AVG(TIMESTAMPDIFF(MINUTE, created_at, updated_at))) as 'Avg Wait (mins)'
FROM orders WHERE DATE(created_at) = CURDATE() AND status = 'Completed';
