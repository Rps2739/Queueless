import { createConnection } from '@/lib/db';
import { NextResponse } from 'next/server';
import logger from '@/lib/logger';

export async function POST(request) {
  try {
    const { email, password } = await request.json();
    const db = await createConnection();

    const [rows] = await db.execute('SELECT * FROM users WHERE email = ? AND password = ?', [email, password]);

    if (rows.length > 0) {
      const user = rows[0];
      logger.info(`Student Logged In`, { userId: user.id, email: user.email });
      return NextResponse.json({ success: true, user });
    } else {
      logger.warn(`Login Failed: Invalid Credentials`, { email });
      return NextResponse.json({ success: false, error: 'Invalid email or password' }, { status: 401 });
    }

  } catch (error) {
    logger.error(`Login System Error`, { error: error.message });
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}