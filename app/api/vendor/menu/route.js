import { createConnection } from '@/lib/db';
import { NextResponse } from 'next/server';

// ADD NEW ITEM
export async function POST(request) {
  try {
    const { name, shop, category, price, stock, emoji } = await request.json();
    const db = await createConnection();
    
    await db.execute(
      'INSERT INTO menu_items (name, shop, category, price, stock_quantity, image_emoji) VALUES (?, ?, ?, ?, ?, ?)',
      [name, shop, category, price, stock, emoji || '🍽️']
    );

    
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// UPDATE STOCK
export async function PUT(request) {
  try {
    const { id, stock } = await request.json();
    const db = await createConnection();
    
    await db.execute('UPDATE menu_items SET stock_quantity = ? WHERE id = ?', [stock, id]);
    
    
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// DELETE ITEM
export async function DELETE(request) {
  try {
    const { id } = await request.json();
    const db = await createConnection();
    
    await db.execute('DELETE FROM menu_items WHERE id = ?', [id]);
    
    
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}