import { createConnection } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(request) {
    const pool = await createConnection();

    try {
        let shops = [];
        try {
            // Get all vendors and their status
            // If fetching from vendors table fails (e.g. table doesn't exist), fallback to menu_items
            const [shopRows] = await pool.execute(`
                SELECT v.shop_name as shop, 
                       COALESCE(s.is_accepting_orders, 1) as is_accepting_orders,
                       s.scheduled_close_time,
                       s.scheduled_open_time
                FROM vendors v
                LEFT JOIN shop_status s ON v.shop_name = s.shop_name
                UNION
                SELECT DISTINCT m.shop, 
                       COALESCE(s.is_accepting_orders, 1) as is_accepting_orders,
                       s.scheduled_close_time,
                       s.scheduled_open_time
                FROM menu_items m
                LEFT JOIN shop_status s ON m.shop = s.shop_name
            `);

            // Deduplicate shops
            const uniqueShops = new Map();
            shopRows.forEach(s => {
                if (!uniqueShops.has(s.shop)) {
                    uniqueShops.set(s.shop, s);
                }
            });

            shops = Array.from(uniqueShops.values()).map(s => ({
                name: s.shop,
                isOpen: s.is_accepting_orders === 1 || s.is_accepting_orders === true,
                scheduleClose: s.scheduled_close_time,
                scheduleOpen: s.scheduled_open_time
            }));
        } catch (tableErr) {
            // Fallback if vendors table issue
            const [menuShops] = await pool.execute('SELECT DISTINCT shop FROM menu_items');
            shops = menuShops.map(s => ({
                name: s.shop,
                isOpen: true,
                scheduleClose: null,
                scheduleOpen: null
            }));
        }

        let todayOrders = 0;
        try {
            const [orderCount] = await pool.execute(
                'SELECT COUNT(*) as count FROM orders WHERE DATE(created_at) = CURDATE()'
            );
            todayOrders = orderCount[0]?.count || 0;
        } catch (e) { }

        let trendingItem = { name: 'Masala Dosa', emoji: '🥘' };
        try {
            const [trending] = await pool.execute(`
                SELECT m.name, m.image_emoji, COUNT(*) as order_count
                FROM order_items oi
                JOIN orders o ON oi.order_id = o.id
                JOIN menu_items m ON oi.menu_item_id = m.id
                WHERE DATE(o.created_at) = CURDATE()
                GROUP BY m.id, m.name, m.image_emoji
                ORDER BY order_count DESC
                LIMIT 1
            `);
            if (trending.length > 0) {
                trendingItem = { name: trending[0].name, emoji: trending[0].image_emoji };
            }
        } catch (e) { }

        let estimatedWait = '10-15 mins';
        try {
            const [waitTime] = await pool.execute(`
                SELECT AVG(TIMESTAMPDIFF(MINUTE, created_at, updated_at)) as avg_wait
                FROM orders
                WHERE DATE(created_at) = CURDATE() AND status = 'Completed'
            `);
            const avgWait = waitTime[0]?.avg_wait;
            if (avgWait) {
                estimatedWait = `${Math.round(avgWait)}-${Math.round(avgWait) + 5} mins`;
            }
        } catch (e) { }

        let popularItems = [];
        try {
            const [popular] = await pool.execute(`
                SELECT m.id, m.name, m.image_emoji, m.price, COUNT(*) as order_count
                FROM order_items oi
                JOIN orders o ON oi.order_id = o.id
                JOIN menu_items m ON oi.menu_item_id = m.id
                WHERE o.created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
                GROUP BY m.id, m.name, m.image_emoji, m.price
                ORDER BY order_count DESC
                LIMIT 3
            `);
            popularItems = popular.map(p => ({
                id: p.id,
                name: p.name,
                emoji: p.image_emoji,
                price: p.price,
                orders: p.order_count
            }));
        } catch (e) { }

        return NextResponse.json({
            shops,
            trending: trendingItem,
            estimatedWait,
            todayOrders,
            popularItems
        });

    } catch (error) {
        console.error('Stats error:', error);
        return NextResponse.json({
            shops: [],
            trending: { name: 'Masala Dosa', emoji: '🥘' },
            estimatedWait: '10-15 mins',
            todayOrders: 0,
            popularItems: []
        });
    }
}
