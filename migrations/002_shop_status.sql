-- SIBM Canteen Database Migration for MySQL
-- Run this script to add new tables and columns

-- Shop Status Table
CREATE TABLE IF NOT EXISTS shop_status (
  shop_name VARCHAR(100) PRIMARY KEY,
  is_accepting_orders BOOLEAN DEFAULT TRUE,
  scheduled_close_time TIME NULL,
  scheduled_open_time TIME NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Add daily order number column to orders (MySQL compatible)
-- Run these one at a time, ignore errors if columns already exist

ALTER TABLE orders ADD COLUMN daily_order_number INT DEFAULT NULL;
-- If you get "Duplicate column name" error, the column already exists - that's OK

ALTER TABLE orders ADD COLUMN order_date DATE DEFAULT NULL;
-- If you get "Duplicate column name" error, the column already exists - that's OK

-- Create index for faster daily order queries (ignore if exists)
CREATE INDEX idx_orders_date ON orders(order_date);
-- If you get "Duplicate key name" error, the index already exists - that's OK
