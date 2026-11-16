# QueueLess: Architecture

## System overview

```
Student phone (web)        Vendor tablet (web)        Admin (web)
        │                          │                       │
        └────────────── Next.js app (pages + API routes) ──┘
                                   │
                                MySQL
```

A single Next.js app serves the student pages, the vendor screen (`/vendor`) and the analytics, along with the API routes under `app/api/*`. MySQL stores users, vendors, menu items, orders and order items.

## Data model

| Table | Purpose |
|---|---|
| `users` | Students: name, college ID (PRN), phone, email |
| `vendors` | Shop accounts |
| `menu_items` | Item, price, category, shop, stock level |
| `orders` | Order header: student, total, status, **daily token number**, date |
| `order_items` | Items and quantities in each order |
| `shop_status` | Whether a shop is open and taking orders, plus scheduled times |

## API map

| Area | Routes |
|---|---|
| Student | `register`, `login`, `menu`, `shops`, `order`, `user/orders`, `user/profile` |
| Vendor | `vendor/register`, `vendor/login`, `vendor/orders`, `vendor/menu`, `vendor/inventory`, `vendor/status`, `vendor/profile` |
| Analytics | `stats`, `vendor/analytics` |
| Media | `upload` (menu item images) |

## Design choices

- **One codebase for all three user groups.** Simple to build and deploy on a free tier.
- **Order status by polling every 5 seconds.** The quickest way to make status feel live in an MVP; WebSockets or server push are planned.
- **Daily token numbers** (e.g. `CAF-18-003`), so students and vendors can match orders at the counter without names.
- **UPI hand-off** instead of a payment gateway, so no payment data is stored.

## Known gaps before a public launch

| Gap | Fix |
|---|---|
| Passwords are stored and compared as plain text | Hash them (bcrypt) and check against the hash |
| The login session is kept in browser storage | Use secure, server-checked sessions |
| Image uploads are written to the server's own folder | Use object storage (e.g. Vercel Blob), since hosted servers don't keep local files |
| Logs are written to local files | Log to the console or a logging service when hosted |
| The vendor screen doesn't refresh on its own | Auto-refresh or server push (top item in the PRD) |

## Hosting plan

Next.js on Vercel, plus a hosted MySQL-compatible database (e.g. TiDB Cloud Starter). Connection settings come from environment variables; nothing secret goes in the repo.
