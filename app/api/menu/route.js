import { createConnection } from '@/lib/db';
import { NextResponse } from 'next/server';
import logger from '@/lib/logger';

export async function GET() {
  try {
    const db = await createConnection();
    
    // ✅ FIX: Only show items that are Active
    const [rows] = await db.execute('SELECT * FROM menu_items WHERE is_active = 1');
    
    return NextResponse.json(rows);
  } catch (error) {
    logger.error(`Failed to fetch menu`, { error: error.message });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}