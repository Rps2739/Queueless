import { createConnection } from '@/lib/db';
import { NextResponse } from 'next/server';

// GET - Fetch vendor's shop status
export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const shopName = searchParams.get('shop');

    if (!shopName) {
        return NextResponse.json({ error: 'Shop name required' }, { status: 400 });
    }

    const pool = await createConnection();

    try {
        const [rows] = await pool.execute(
            'SELECT * FROM shop_status WHERE shop_name = ?',
            [shopName]
        );

        if (rows.length === 0) {
            // No status record, default to open
            return NextResponse.json({
                shopName,
                isAcceptingOrders: true,
                scheduledCloseTime: null,
                scheduledOpenTime: null
            });
        }

        return NextResponse.json({
            shopName: rows[0].shop_name,
            isAcceptingOrders: Boolean(rows[0].is_accepting_orders),
            scheduledCloseTime: rows[0].scheduled_close_time,
            scheduledOpenTime: rows[0].scheduled_open_time
        });

    } catch (error) {
        console.error('Status fetch error:', error);
        return NextResponse.json({ isAcceptingOrders: true });
    }
}

// PUT - Toggle shop status
export async function PUT(request) {
    const body = await request.json();
    const { shopName, isAcceptingOrders, scheduledCloseTime, scheduledOpenTime } = body;

    if (!shopName) {
        return NextResponse.json({ error: 'Shop name required' }, { status: 400 });
    }

    const pool = await createConnection();

    try {
        // Upsert shop status
        await pool.execute(`
      INSERT INTO shop_status (shop_name, is_accepting_orders, scheduled_close_time, scheduled_open_time)
      VALUES (?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE 
        is_accepting_orders = VALUES(is_accepting_orders),
        scheduled_close_time = VALUES(scheduled_close_time),
        scheduled_open_time = VALUES(scheduled_open_time),
        updated_at = CURRENT_TIMESTAMP
    `, [shopName, isAcceptingOrders ? 1 : 0, scheduledCloseTime || null, scheduledOpenTime || null]);

        return NextResponse.json({
            success: true,
            isAcceptingOrders,
            message: isAcceptingOrders ? 'Now accepting orders' : 'Orders paused'
        });

    } catch (error) {
        console.error('Status update error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
