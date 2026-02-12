import { createConnection } from '@/lib/db';
import { NextResponse } from 'next/server';
import logger from '@/lib/logger';

export async function DELETE(request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'User ID required' }, { status: 400 });
        }

        const db = await createConnection();

        // 1. Delete user's orders (and order items)
        // First get order IDs to delete items
        const [orders] = await db.execute('SELECT id FROM orders WHERE user_id = ?', [id]);
        const orderIds = orders.map(o => o.id);

        if (orderIds.length > 0) {
            // Delete order items
            // Create placeholders for the IN clause
            const placeholders = orderIds.map(() => '?').join(',');
            await db.execute(`DELETE FROM order_items WHERE order_id IN (${placeholders})`, orderIds);

            // Delete orders
            await db.execute('DELETE FROM orders WHERE user_id = ?', [id]);
        }

        // 2. Delete the user
        await db.execute('DELETE FROM users WHERE id = ?', [id]);

        logger.info(`User Account Deleted`, { userId: id });
        return NextResponse.json({ success: true });
    } catch (e) {
        logger.error(`User Deletion Error`, { error: e.message });
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
