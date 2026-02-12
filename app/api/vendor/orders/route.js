import { createConnection } from '@/lib/db';
import { NextResponse } from 'next/server';
import logger from '@/lib/logger';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const shop = searchParams.get('shop');

    const db = await createConnection();

    // Base query for fetching orders
    let query = `
      SELECT 
        o.id, o.user_id, o.total_amount as total, o.status, o.created_at, u.full_name as customer_name,
        JSON_ARRAYAGG(
          JSON_OBJECT('name', m.name, 'qty', oi.quantity, 'price', oi.price_at_time, 'shop', m.shop)
        ) as items
      FROM orders o
      JOIN users u ON o.user_id = u.id
      JOIN order_items oi ON o.id = oi.order_id
      JOIN menu_items m ON oi.menu_item_id = m.id
      WHERE o.status != 'Completed'
    `;

    const params = [];

    // Filter by shop if provided
    if (shop) {
      query += ` AND m.shop = ?`;
      params.push(shop);
    }

    query += ` GROUP BY o.id ORDER BY o.created_at ASC`;

    const [orders] = await db.execute(query, params);

    // Parse items JSON if needed (MySQL returns as string sometimes)
    const parsedOrders = orders.map(order => ({
      ...order,
      items: typeof order.items === 'string' ? JSON.parse(order.items) : order.items
    }));

    return NextResponse.json(parsedOrders);
  } catch (e) {
    logger.error(`Vendor Orders Fetch Error`, { error: e.message });
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const { orderId, status } = await request.json();
    const db = await createConnection();

    // Also update updated_at timestamp for completed orders
    if (status === 'Completed') {
      await db.execute('UPDATE orders SET status = ?, updated_at = NOW() WHERE id = ?', [status, orderId]);
    } else {
      await db.execute('UPDATE orders SET status = ? WHERE id = ?', [status, orderId]);
    }

    logger.info(`Order Status Updated`, { orderId, newStatus: status });
    return NextResponse.json({ success: true });
  } catch (e) {
    logger.error(`Order Status Update Error`, { error: e.message });
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}