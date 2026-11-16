# QueueLess: Product Requirements Document

| | |
|---|---|
| **Product** | QueueLess, SIBM canteen pre-ordering |
| **Status** | MVP built and tested with users; next iteration planned |
| **Users** | ~1,200 SIBM Bengaluru students, 2–5 campus food vendors, campus admin |

---

## 1. Problem

During short breaks between lectures, students cannot predict how long the canteen will take. They abandon queues, downgrade their order (a snack instead of a meal) or skip food. Vendors take orders verbally while handling cash and cooking, which causes errors and lost sales during the peak rush.

**Problem statement:** Students need predictability and control over getting food during short breaks. Vendors need orders to arrive in a clear sequence, without verbal chaos.

## 2. Users and needs

| User | Need | Today's workaround |
|---|---|---|
| **Rushed student** (primary user) | Know the food will be ready in time; order without queuing | Queue and hope, buy a quick snack, or go to the mess |
| **Busy vendor** (primary customer) | A clear list of what to cook next; no cash at the counter | Memory, shouting, cash handling |
| **Campus admin** | Sales visibility for audits | Manual records |

## 3. Goals and success metrics

| Goal | Metric | Target (hypothesis, not yet measured) |
|---|---|---|
| Remove queue uncertainty | Students who know their pickup time before leaving class | Every order shows a live status |
| Cut time spent in the canteen | Time from arriving at the counter to collecting food | Large reduction vs queuing (research goal: up to 80%) |
| Vendor adoption | Vendors running the order screen unassisted at peak | All onboarded vendors, zero training |
| Engagement | Daily active users | ~500 (the threshold for sponsor revenue) |
| Order accuracy | Wrong or missed orders reported | Fewer than with verbal ordering |

**Guardrail metric:** vendor order-handling time at peak must not get worse.

## 4. Scope

**In scope (MVP):** student web app, vendor order screen, admin analytics, UPI payment hand-off.

**Out of scope:** delivery, supply-chain inventory, payment settlement (handled by UPI apps), native mobile apps.

## 5. User stories and requirements

| ID | As a… | I want to… | So that… | Acceptance criteria |
|---|---|---|---|---|
| S1 | student | browse each shop's menu with stock levels | I don't order something that's sold out | Items show price and stock; sold-out items can't be added |
| S2 | student | add items from different shops into one cart | I check out once | Cart totals correctly across shops |
| S3 | student | pay through my UPI app | I don't handle cash at the counter | Checkout opens the UPI app; the order gets a token number |
| S4 | student | see my order's status live | I leave class only when it's ready | Status moves Preparing → Ready → Completed without a manual refresh |
| S5 | student | see my past orders | I can check what I paid | History lists items, amounts and token numbers |
| V1 | vendor | see new orders in arrival order | I cook in sequence | First-in-first-out list; **new orders appear on their own** (gap found in testing) |
| V2 | vendor | move an order along with one tap | I don't type during the rush | One button per step |
| V3 | vendor | update the menu and stock and close the shop | students only order what I can make | Stock edits show to students at once; a closed shop takes no orders |
| A1 | admin | see revenue and top items for any period | I can audit and plan the menu | Daily, weekly, monthly and custom ranges |

**Non-functional:** API responses under 500 ms; handle the 11 AM peak (up to ~1,000 concurrent users); store no payment data; personal data handled in line with India's DPDP Act.

## 6. Prioritisation

| Priority | Item | Reason |
|---|---|---|
| P0 | Vendor order screen auto-refresh | Missed orders broke trust in testing; vendor adoption is the biggest risk |
| P0 | Store passwords hashed | Must be done before any public launch |
| P1 | Persistent cart | Mobile users lose their cart when switching apps |
| P1 | Order cancellation within a short window | Needed when an item runs out after an order is accepted |
| P2 | Push or WhatsApp "order ready" alert | Better than students keeping the page open |
| P2 | Sponsor ad slots | Revenue, only after ~500 daily users |

## 7. Business model

- Free for students and vendors. Any fee was the main adoption risk for both sides.
- Planned revenue: local businesses sponsoring placements aimed at MBA students, once usage reaches ~500 daily users.
- Market sizing: SIBM (~1,200 students) → Bangalore B-schools (~50 institutes) → Indian college canteens as a SaaS product.

## 8. Risks and assumptions

| Risk or assumption | How we tested or plan to |
|---|---|
| Students will actually pre-order (not just say they would) | Track repeat orders in a pilot |
| A vendor with limited tech exposure can run a tablet screen | Tested: the one-tap flow needed no training |
| Campus Wi-Fi is reliable at peak | Pilot during real breaks |
| Removing queues loses the social side of waiting with friends | Open question from testing |
