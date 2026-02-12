import { createConnection } from '@/lib/db';
import { NextResponse } from 'next/server';
import logger from '@/lib/logger';

export async function GET() {
  try {
    const db = await createConnection();
    
    const [rows] = await db.execute(`
      SELECT DISTINCT shop AS shop_name FROM menu_items
      UNION
      SELECT DISTINCT shop_name FROM vendors
    `);
    
    const shopList = rows.map(r => r.shop_name);
    // logger.info(`Shops List Fetched`, { count: shopList.length });
    
    return NextResponse.json(shopList);
  } catch (e) {
    logger.error(`Failed to fetch shops`, { error: e.message });
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}