import { createConnection } from '@/lib/db';
import { NextResponse } from 'next/server';
import logger from '@/lib/logger';

export async function POST(request) {
  try {
    const { fullName, email, password, phone, shopName } = await request.json();

    if (!shopName || !fullName || !email || !password) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    const db = await createConnection();

    const [existing] = await db.execute('SELECT id FROM vendors WHERE email = ?', [email]);
    if (existing.length > 0) {
      logger.warn(`Vendor Registration Failed: Email exists`, { email });
      return NextResponse.json({ error: 'Vendor email already exists' }, { status: 400 });
    }

    await db.execute(
      'INSERT INTO vendors (full_name, email, password, phone, shop_name) VALUES (?, ?, ?, ?, ?)',
      [fullName, email, password, phone, shopName]
    );

    logger.info(`New Vendor Registered`, { shopName, email });
    return NextResponse.json({ success: true });

  } catch (e) {
    logger.error(`Vendor Registration Error`, { error: e.message });
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}