import { createConnection } from '@/lib/db';
import { NextResponse } from 'next/server';
import logger from '@/lib/logger';

export async function POST(request) {
  try {
    const { email, password } = await request.json();
    const db = await createConnection();

    const [rows] = await db.execute(
      'SELECT id, full_name, email, shop_name FROM vendors WHERE email = ? AND password = ?', 
      [email, password]
    );

    if (rows.length > 0) {
      const vendor = rows[0];
      logger.info(`Vendor Logged In`, { shop: vendor.shop_name, email: vendor.email });
      return NextResponse.json({ success: true, vendor });
    } else {
      logger.warn(`Vendor Login Failed`, { email });
      return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 });
    }

  } catch (error) {
    logger.error(`Vendor Login Error`, { error: error.message });
    return NextResponse.json({ success: false, error: 'Server connection failed' }, { status: 500 });
  }
}