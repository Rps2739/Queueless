import { createConnection } from '@/lib/db';
import { NextResponse } from 'next/server';
import logger from '@/lib/logger';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const shop = searchParams.get('shop');
    const db = await createConnection();
    
    // ✅ FIX: Only fetch items that are NOT deleted (is_active = 1)
    const [rows] = await db.execute('SELECT * FROM menu_items WHERE shop = ? AND is_active = 1', [shop]);
    
    return NextResponse.json(rows);
  } catch (e) {
    logger.error(`Inventory Fetch Error`, { error: e.message });
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const item = await request.json();
    const db = await createConnection();
    
    // Default is_active is 1 (True)
    await db.execute(
      'INSERT INTO menu_items (name, price, stock_quantity, category, image_emoji, shop, is_active) VALUES (?, ?, ?, ?, ?, ?, 1)',
      [item.name, item.price, item.stock, item.category, item.emoji, item.shop]
    );
    logger.info(`Item Added to Inventory`, { item: item.name, shop: item.shop });
    return NextResponse.json({ success: true });
  } catch (e) {
    logger.error(`Add Item Error`, { error: e.message });
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const { id, stock } = await request.json();
    const db = await createConnection();
    await db.execute('UPDATE menu_items SET stock_quantity = ? WHERE id = ?', [stock, id]);
    logger.info(`Stock Updated`, { itemId: id, newStock: stock });
    return NextResponse.json({ success: true });
  } catch (e) {
    logger.error(`Update Stock Error`, { error: e.message });
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { id } = await request.json();
    const db = await createConnection();
    
    // ✅ CRITICAL FIX: "Soft Delete"
    // Instead of DELETE FROM..., we update is_active to 0.
    // This hides the item but keeps it in the database for Order History.
    await db.execute('UPDATE menu_items SET is_active = 0 WHERE id = ?', [id]);
    
    logger.info(`Item Soft-Deleted`, { itemId: id });
    return NextResponse.json({ success: true });
  } catch (e) {
    logger.error(`Delete Item Error`, { error: e.message });
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}