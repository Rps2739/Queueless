CREATE DATABASE IF NOT EXISTS sibm_canteen;
USE sibm_canteen;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    prn VARCHAR(50) UNIQUE NOT NULL,
    phone VARCHAR(15),
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Menu Items (with Shop Category and Image Emoji)
CREATE TABLE IF NOT EXISTS menu_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    shop ENUM('Cafeteria', 'Bakery') NOT NULL,
    category VARCHAR(50) DEFAULT 'Snack', -- e.g., 'Beverage', 'Main Course'
    price DECIMAL(10,2) NOT NULL,
    image_emoji VARCHAR(10) DEFAULT '🍱', -- Visual placeholder
    stock_quantity INT DEFAULT 50
);

-- 3. Orders & Items (Standard)
CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    total_amount DECIMAL(10,2),
    status VARCHAR(20) DEFAULT 'Preparing',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT,
    menu_item_id INT,
    quantity INT,
    price_at_time DECIMAL(10,2),
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (menu_item_id) REFERENCES menu_items(id)
);

-- Seed Data (Run this only once)
INSERT INTO menu_items (name, shop, category, price, image_emoji) VALUES
('Veg Grilled Sandwich', 'Cafeteria', 'Snack', 50, '🥪'),
('Masala Dosa', 'Cafeteria', 'Main', 70, '🥘'),
('Cold Coffee', 'Cafeteria', 'Beverage', 60, '🥤'),
('Chicken Puff', 'Bakery', 'Snack', 40, '🥐'),
('Chocolate Truffle', 'Bakery', 'Dessert', 90, '🍰'),
('Fresh Lime Soda', 'Bakery', 'Beverage', 40, '🍹');




USE sibm_canteen;

-- 1. Fix missing 'role' column
ALTER TABLE users ADD COLUMN role VARCHAR(20) DEFAULT 'student';

-- 2. Fix missing 'image_emoji' if that was also skipped
ALTER TABLE menu_items ADD COLUMN image_emoji VARCHAR(10) DEFAULT '🍱';

-- 3. (Optional) Reset users to avoid bad data from previous tests
-- TRUNCATE TABLE users;



select * from users;





USE sibm_canteen;

-- 1. Populate Cafeteria & Bakery with more items
INSERT INTO menu_items (name, shop, category, price, image_emoji, stock_quantity) VALUES
-- Cafeteria
('Schezwan Noodles', 'Cafeteria', 'Chinese', 120, '🍜', 15),
('Veg Fried Rice', 'Cafeteria', 'Chinese', 110, '🍚', 20),
('Paneer Butter Masala', 'Cafeteria', 'Main', 150, '🥘', 10),
('Butter Naan', 'Cafeteria', 'Main', 40, '🫓', 50),
('Masala Chai', 'Cafeteria', 'Beverage', 20, '☕', 100),
('Chole Bhature', 'Cafeteria', 'Main', 90, '🍛', 5), -- Low stock test
-- Bakery
('Red Velvet Cake', 'Bakery', 'Dessert', 110, '🍰', 8),
('Chicken Burger', 'Bakery', 'Snack', 80, '🍔', 12),
('Blueberry Muffin', 'Bakery', 'Dessert', 60, '🧁', 15),
('Iced Tea', 'Bakery', 'Beverage', 50, '🥤', 30),
('Club Sandwich', 'Bakery', 'Snack', 70, '🥪', 20);

-- 2. (Optional) Reset Order Data for fresh testing
-- TRUNCATE TABLE order_items;
-- TRUNCATE TABLE orders;


commit;


USE sibm_canteen;

-- Create account for Cafeteria Manager
INSERT INTO vendors (full_name, email, password, phone, shop_name)
VALUES ('Cafeteria Manager', 'cafeteria@sibm.edu.in', 'admin123', '9999999999', 'Cafeteria');

-- Create account for Bakery Manager
INSERT INTO vendors (full_name, email, password, phone, shop_name)
VALUES ('Bakery Manager', 'bakery@sibm.edu.in', 'admin123', '8888888888', 'Bakery');

USE sibm_canteen;

-- Create the Vendors table (If it doesn't exist yet)
CREATE TABLE IF NOT EXISTS vendors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(15),
    shop_name ENUM('Cafeteria', 'Bakery') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

commit;
select * from users;
select * from vendors;
select * from menu_items;


USE sibm_canteen;

-- 1. Allow any text for shop_name in vendors table
ALTER TABLE vendors MODIFY COLUMN shop_name VARCHAR(100) NOT NULL;

-- 2. Allow any text for shop in menu_items table
ALTER TABLE menu_items MODIFY COLUMN shop VARCHAR(100) NOT NULL;

commit;


