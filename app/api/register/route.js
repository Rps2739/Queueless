import { createConnection } from '@/lib/db';
import { NextResponse } from 'next/server';
import logger from '@/lib/logger';

export async function POST(request) {
  try {
    const { fullName, prn, email, password, phone } = await request.json();
    const db = await createConnection();

    // Check if user exists
    const [existing] = await db.execute('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      logger.warn(`Registration Failed: Email already exists`, { email });
      return NextResponse.json({ error: 'User already exists' }, { status: 400 });
    }

    // Insert User with PRN
    await db.execute(
      'INSERT INTO users (full_name, prn, email, password, phone) VALUES (?, ?, ?, ?, ?)',
      [fullName, prn || `PRN${Date.now()}`, email, password, phone]
    );

    logger.info(`New Student Registered`, { fullName, email });
    return NextResponse.json({ success: true });

  } catch (error) {
    logger.error(`Registration Error`, { error: error.message });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}