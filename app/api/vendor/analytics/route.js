import { createConnection } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const shopName = searchParams.get('shop');
    const period = searchParams.get('period') || 'today'; // today, week, month, custom
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    if (!shopName) {
        return NextResponse.json({ error: 'Shop name required' }, { status: 400 });
    }

    const pool = await createConnection();

    try {
        // Build date filter
        let dateFilter = '';
        let dateParams = [];

        switch (period) {
            case 'today':
                dateFilter = 'AND DATE(o.created_at) = CURDATE()';
                break;
            case 'week':
                dateFilter = 'AND o.created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)';
                break;
            case 'month':
                dateFilter = 'AND o.created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)';
                break;
            case 'custom':
                if (startDate && endDate) {
                    dateFilter = 'AND DATE(o.created_at) BETWEEN ? AND ?';
                    dateParams = [startDate, endDate];
                }
                break;
        }

        // KPIs: Revenue, Orders, Avg Order Value
        const [kpis] = await pool.execute(`
      SELECT 
        COALESCE(SUM(o.total_amount), 0) as total_revenue,
        COUNT(DISTINCT o.id) as total_orders,
        COALESCE(AVG(o.total_amount), 0) as avg_order_value
      FROM orders o
      JOIN order_items oi ON o.id = oi.order_id
      JOIN menu_items m ON oi.menu_item_id = m.id
      WHERE m.shop = ? ${dateFilter}
    `, [shopName, ...dateParams]);

        // Top Selling Items
        const [topItems] = await pool.execute(`
      SELECT m.name, m.image_emoji, SUM(oi.quantity) as total_qty, 
             SUM(oi.quantity * oi.price_at_time) as revenue
      FROM order_items oi
      JOIN orders o ON oi.order_id = o.id
      JOIN menu_items m ON oi.menu_item_id = m.id
      WHERE m.shop = ? ${dateFilter}
      GROUP BY m.id, m.name, m.image_emoji
      ORDER BY total_qty DESC
      LIMIT 5
    `, [shopName, ...dateParams]);

        // Hourly Sales Distribution
        const [hourlyData] = await pool.execute(`
      SELECT HOUR(o.created_at) as hour, COUNT(*) as order_count,
             SUM(o.total_amount) as revenue
      FROM orders o
      JOIN order_items oi ON o.id = oi.order_id
      JOIN menu_items m ON oi.menu_item_id = m.id
      WHERE m.shop = ? ${dateFilter}
      GROUP BY HOUR(o.created_at)
      ORDER BY hour
    `, [shopName, ...dateParams]);

        // Category Distribution
        const [categoryData] = await pool.execute(`
      SELECT m.category, SUM(oi.quantity * oi.price_at_time) as revenue,
             COUNT(*) as order_count
      FROM order_items oi
      JOIN orders o ON oi.order_id = o.id
      JOIN menu_items m ON oi.menu_item_id = m.id
      WHERE m.shop = ? ${dateFilter}
      GROUP BY m.category
      ORDER BY revenue DESC
    `, [shopName, ...dateParams]);

        // Daily Trend (last 7 days)
        const [dailyTrend] = await pool.execute(`
      SELECT DATE(o.created_at) as date, 
             COUNT(DISTINCT o.id) as orders,
             SUM(o.total_amount) as revenue
      FROM orders o
      JOIN order_items oi ON o.id = oi.order_id
      JOIN menu_items m ON oi.menu_item_id = m.id
      WHERE m.shop = ? AND o.created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
      GROUP BY DATE(o.created_at)
      ORDER BY date
    `, [shopName]);

        // Market Basket Analysis: Frequently Bought Together
        const [basketAnalysis] = await pool.execute(`
      SELECT m1.name as item1, m2.name as item2, COUNT(*) as frequency
      FROM order_items oi1
      JOIN order_items oi2 ON oi1.order_id = oi2.order_id AND oi1.menu_item_id < oi2.menu_item_id
      JOIN menu_items m1 ON oi1.menu_item_id = m1.id
      JOIN menu_items m2 ON oi2.menu_item_id = m2.id
      WHERE m1.shop = ?
      GROUP BY m1.id, m2.id, m1.name, m2.name
      ORDER BY frequency DESC
      LIMIT 5
    `, [shopName]);

        // Upsell Opportunities: Low quantity items in orders that could have more
        const [upsellItems] = await pool.execute(`
      SELECT m.name, m.image_emoji, m.price, AVG(oi.quantity) as avg_qty,
             m.stock_quantity as stock
      FROM order_items oi
      JOIN menu_items m ON oi.menu_item_id = m.id
      WHERE m.shop = ? AND m.price > 50
      GROUP BY m.id, m.name, m.image_emoji, m.price, m.stock_quantity
      HAVING avg_qty < 2
      ORDER BY m.price DESC
      LIMIT 3
    `, [shopName]);

        // Cross-sell: Items often bought by same customers but not together
        const [crossSell] = await pool.execute(`
      SELECT m.name, m.image_emoji, COUNT(DISTINCT o.user_id) as buyer_count
      FROM menu_items m
      JOIN order_items oi ON m.id = oi.menu_item_id
      JOIN orders o ON oi.order_id = o.id
      WHERE m.shop = ?
      GROUP BY m.id, m.name, m.image_emoji
      ORDER BY buyer_count DESC
      LIMIT 5
    `, [shopName]);

        return NextResponse.json({
            kpis: {
                totalRevenue: Number(kpis[0]?.total_revenue || 0),
                totalOrders: Number(kpis[0]?.total_orders || 0),
                avgOrderValue: Number(kpis[0]?.avg_order_value || 0).toFixed(2)
            },
            topItems,
            hourlyData: hourlyData.map(h => ({ ...h, hour: `${h.hour}:00` })),
            categoryData,
            dailyTrend: dailyTrend.map(d => ({
                ...d,
                date: new Date(d.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
            })),
            recommendations: {
                basket: basketAnalysis,
                upsell: upsellItems,
                crossSell
            }
        });

    } catch (error) {
        console.error('Analytics error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
