import { createConnection } from '@/lib/db';
import { NextResponse } from 'next/server';
import logger from '@/lib/logger';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    const db = await createConnection();

    // Get orders with daily_order_number and order_date for display format
    const [orders] = await db.execute(`
      SELECT 
        o.id, o.total_amount, o.status, o.created_at, o.daily_order_number, o.order_date,
        JSON_ARRAYAGG(
          JSON_OBJECT('name', m.name, 'qty', oi.quantity, 'price', oi.price_at_time, 'shop', m.shop)
        ) as items
      FROM orders o
      JOIN order_items oi ON o.id = oi.order_id
      JOIN menu_items m ON oi.menu_item_id = m.id
      WHERE o.user_id = ?
      GROUP BY o.id, o.total_amount, o.status, o.created_at, o.daily_order_number, o.order_date
      ORDER BY o.created_at DESC
    `, [userId]);

    // Parse items JSON if needed
    const parsedOrders = orders.map(order => ({
      ...order,
      items: typeof order.items === 'string' ? JSON.parse(order.items) : order.items
    }));

    return NextResponse.json(parsedOrders);
  } catch (error) {
    logger.error(`Failed to fetch user orders`, { error: error.message });
    return NextResponse.json([], { status: 200 }); // Return empty array instead of error for better UX
  }
}