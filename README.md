# QueueLess: pre-order canteen food at SIBM Bengaluru

Students order from class, track their order live and pick it up when it's ready. Vendors get a simple order screen instead of a shouting crowd.

> **Demo video:** _add link here_  ·  **Live app:** _add link here_  ·  Built for the Creativity & Design Thinking course, SIBM Bengaluru (Feb 2026)

---

## The problem

SIBM students get short breaks between lectures, and the canteen rush is concentrated in those 15 minutes. Our research found that the real pain is **not knowing how long it will take**, not slow food as such:

- Students can't tell from the queue whether they'll make it back to class, so they **downgrade their order** (a quick snack instead of a meal), leave the queue or skip food.
- Once they've ordered, they get **no status update**. "Did they forget my order?"
- Vendors take orders verbally, handle cash and cook at the same time. Their mistakes come from **overload, not carelessness**.
- The canteen's real competitor is the **mess**: it's already paid for and there's no wait.

So we reframed the problem from *"How can the canteen serve more orders per hour?"* to *"How might we give students predictability and control over their break?"*

## What we learned (research summary)

| Method | What we did |
|---|---|
| Interviews | 5 one-on-one student interviews, then 2 more vendor-focused interviews after the first prototype test |
| Observation | Shadowed the canteen and tuck shop during peak breaks (11 AM, 1 PM) |
| Survey | Short questionnaire on mess vs canteen habits |

**Key insights**

1. Uncertainty, not speed, drives queue abandonment and worse food choices.
2. Vendor errors are a workflow problem: verbal orders plus cash plus cooking at once.
3. Vendor adoption, not student interest, is the biggest risk. That changed our design priorities.

Full synthesis: [`product/USER-RESEARCH.md`](product/USER-RESEARCH.md)

## What it does

**For students**
- Browse menus by shop with live stock levels
- One cart across vendors; check out using UPI
- Live order status (Preparing → Ready → Completed) with a daily token number
- Order history

**For vendors (order screen, designed for a tablet)**
- Incoming orders in first-come order, with one-tap *Accept → Preparing → Ready*
- Menu and stock management, plus an "accepting orders" on/off switch

**For the canteen and admin**
- Revenue by day, week, month or custom range
- Top-selling items, order count and average order value

## Key product decisions

| Decision | Why |
|---|---|
| Mobile web app, not a native app | No app-store install. Students open a link or scan a QR code at the counter. |
| Free for students *and* vendors | Students are price-sensitive and vendors pay fixed rent. Any fee kills adoption, so revenue is planned from local sponsors once usage reaches ~500 daily users. |
| One big button per step on the vendor screen | The primary user is a busy canteen owner with limited tech exposure, so it needs zero training. |
| Pickup only, no delivery | Keeps the scope to the actual pain (the 15-minute break). |
| Polling every 5 seconds for status | The simplest way to get "live" status for an MVP. WebSockets come next (see below). |

## Testing and what changed

We tested the working MVP with students and canteen staff.

- ✅ Students liked ordering from class, and live status stopped the "is my order ready?" questions.
- ✅ Vendors used the one-tap buttons **without any training**.
- ❌ The vendor screen didn't refresh on its own, so new orders were missed. **Top priority for the next version.**
- ❌ The cart was lost on page refresh, and there was no way to cancel an order.

Next iteration backlog: auto-refreshing vendor screen, a persistent cart, and order cancellation within a short time window.

## Docs

| Document | What's in it |
|---|---|
| [`product/PRD.md`](product/PRD.md) | Problem, users, goals and success metrics, scope, requirements, risks |
| [`product/USER-RESEARCH.md`](product/USER-RESEARCH.md) | Personas, journey map, POV and "How might we" statements, test findings |
| [`product/ARCHITECTURE.md`](product/ARCHITECTURE.md) | System design, data model, API map, known gaps |

## Tech stack

Next.js (App Router) · React · MySQL · Tailwind CSS · Winston logging

## Run it locally

```bash
npm install
# create .env.local with DB_HOST, DB_USER, DB_PASSWORD, DB_NAME
# create the database from projectdbsql.sql, then apply migrations/
npm run dev        # http://localhost:3000   (vendor screen at /vendor)
```

Or with Docker: `docker compose up` (MySQL plus the app).

## Team

Built by Team QueueLess, SIBM Bengaluru. **My role:** _add your role, e.g. "led research synthesis and built the full-stack MVP"_.
