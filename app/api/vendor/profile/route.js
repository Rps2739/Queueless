import { createConnection } from '@/lib/db';
import { NextResponse } from 'next/server';
import logger from '@/lib/logger';

export async function DELETE(request) {
    try {
        const { searchParams } = new URL(request.url);
        const shop = searchParams.get('shop');

        if (!shop) {
            return NextResponse.json({ error: 'Shop name required' }, { status: 400 });
        }

        const db = await createConnection();

        // 1. Delete from shop_status
        await db.execute('DELETE FROM shop_status WHERE shop_name = ?', [shop]);

        // 2. Delete from vendors
        await db.execute('DELETE FROM vendors WHERE shop_name = ?', [shop]);

        // 3. Optional: Delete empty menu items if any (though testvendor has none)
        // We won't delete actual menu items to preserve order history integrity for now, 
        // or we could soft delete. For 'testvendor' with 0 items, this is fine.

        logger.info(`Shop Deleted`, { shop });
        return NextResponse.json({ success: true });
    } catch (e) {
        logger.error(`Shop Deletion Error`, { error: e.message });
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
