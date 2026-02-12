import { createConnection } from '@/lib/db';
import { NextResponse } from 'next/server';
import logger from '@/lib/logger';

export async function POST(request) {
  const pool = await createConnection();
  const connection = await pool.getConnection();

  try {
    const { userId, items, total } = await request.json();

    await connection.beginTransaction();

    // Get the shop from items
    const shopName = items[0]?.shop || 'Canteen';
    const shopCode = shopName.substring(0, 3).toUpperCase();
    const today = new Date();
    const dayOfMonth = today.getDate().toString().padStart(2, '0');
    const orderDate = today.toISOString().split('T')[0];

    // Get the next daily order number for today
    const [lastOrder] = await connection.execute(
      'SELECT MAX(daily_order_number) as last_num FROM orders WHERE order_date = ?',
      [orderDate]
    );
    const dailyNum = (lastOrder[0]?.last_num || 0) + 1;
    const dailyOrderNumber = dailyNum.toString().padStart(3, '0');

    // Format: CAF-07-001 (ShopCode-Day-Sequence)
    const orderDisplayId = `${shopCode}-${dayOfMonth}-${dailyOrderNumber}`;

    const [orderRes] = await connection.execute(
      'INSERT INTO orders (user_id, total_amount, daily_order_number, order_date) VALUES (?, ?, ?, ?)',
      [userId, total, dailyNum, orderDate]
    );
    const orderId = orderRes.insertId;

    logger.info(`Processing Order #${orderId} (${orderDisplayId})`, { userId, itemCount: items.length, total });

    for (const item of items) {
      // ATOMIC UPDATE: Decrement stock only if sufficient stock exists
      // This prevents race conditions where multiple users try to buy the last item
      const [updateRes] = await connection.execute(
        'UPDATE menu_items SET stock_quantity = stock_quantity - ? WHERE id = ? AND stock_quantity >= ?',
        [item.quantity, item.id, item.quantity]
      );

      if (updateRes.affectedRows === 0) {
        // If no rows were updated, it means stock was insufficient or item doesn't exist
        // Fetch current stock just for the error message (read-only, doesn't affect logic)
        const [stockRes] = await connection.execute('SELECT name, stock_quantity FROM menu_items WHERE id = ?', [item.id]);
        const currentStock = stockRes[0]?.stock_quantity || 0;
        const itemName = stockRes[0]?.name || 'Unknown Item';

        logger.warn(`Order #${orderId} Failed: Out of Stock`, { item: itemName, requested: item.quantity, available: currentStock });
        throw new Error(`Item '${itemName}' is out of stock (Only ${currentStock} left).`);
      }

      // If update succeeded, record the item in order_items
      await connection.execute(
        'INSERT INTO order_items (order_id, menu_item_id, quantity, price_at_time) VALUES (?, ?, ?, ?)',
        [orderId, item.id, item.quantity, item.price]
      );
    }

    await connection.commit();
    logger.info(`Order #${orderId} (${orderDisplayId}) Placed Successfully`);
    return NextResponse.json({ success: true, orderId, displayId: orderDisplayId });

  } catch (error) {
    await connection.rollback();
    logger.error(`Order Transaction Failed`, { error: error.message });
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  } finally {
    connection.release();
  }
}