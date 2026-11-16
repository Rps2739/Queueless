# QueueLess: User research summary

The process followed design thinking: **Empathize → Define → Ideate → Prototype → Test**, with a loop back after testing. Participants are not named here. The personas are composites.

## 1. Methods

- **5 student interviews**, open-ended, 15–20 minutes each
- **2 contextual inquiries**: shadowing the canteen and tuck shop during the 11 AM and 1 PM peaks
- **Short survey** on mess vs canteen habits
- **2 follow-up vendor interviews** after the first prototype test showed that vendor adoption was the biggest risk

## 2. What we heard

- "I spend 10 minutes of my 20-minute break waiting for a dosa."
- Students reported leaving the queue several times and **switching to a quicker item** because the wait was unpredictable.
- Vendor: the 15-minute break is the hard part, when cooking can't keep up with the rush.
- Vendors pay **fixed rent whatever their sales are**, so every walk-away is lost margin.
- The mess is "already paid, no waiting", which makes it the canteen's real competitor.

**Survey highlights:** students eat at the canteen or bakery about 3 times a week; about 80% of their non-mess eating goes to the cafeteria; every interviewee said they would use online pre-ordering.

## 3. Personas

**"The Rushed MBA" (primary user).** 23, hostel resident, pays for everything with UPI. Wants a proper meal and to be back in class on time. Frustrated by unpredictable waits and settling for snacks.

**"The Overwhelmed Vendor" (primary customer).** 45, runs a campus canteen and works long days. Takes orders verbally while cooking and handling cash. Wants a simple screen that tells him what to cook next.

## 4. Journey: ordering during a 15-minute break (today)

| Stage | Time | Feeling | Pain point |
|---|---|---|---|
| Decide: mess or canteen? | 1 min | Neutral | No idea how busy the canteen is |
| Walk over | 2 min | Rushed | Time pressure builds |
| Look at the queue | 0.5 min | Anxious | **Can't estimate the wait** (moment of truth #1) |
| Wait in the queue | 3–7 min | Frustrated | "Should I stay or leave?" |
| Order at the counter | 0.5 min | Stressed | Noisy; the order may be misheard |
| Wait for the food | 3–5 min | Impatient | **No status update** (moment of truth #2) |
| Eat and walk back | 4 min | Rushed | Often late to class |

**Total: 12–18 minutes for a 15-minute break.** Ordering and eating comfortably is impossible.

## 5. Define

**POV (student):** a rushed MBA student needs predictability and control over getting food in short breaks, because the uncertainty itself, more than slow service, makes him skip meals or downgrade to snacks.

**POV (vendor):** a canteen owner needs orders to arrive in a clear sequence, because his peak-hour errors come from doing too many things at once (taking orders, handling cash, cooking), not from lack of skill.

**How might we…**
1. give students certainty about wait time before they leave class?
2. separate *ordering* from *queuing* entirely?
3. reduce the vendor's mental load with a visual, ordered queue?
4. remove cash handling at the counter?

## 6. Ideation and prototypes

- Two brainstorming rounds using the 6-3-5 brainwriting method produced 50+ ideas, ranked on impact vs feasibility.
- Prototypes went **paper sketches → clickable Figma wireframes → working web app**.

## 7. Test findings

| Worked | Didn't work, so we're changing it |
|---|---|
| Ordering from class felt like "exactly what I needed" | The vendor screen didn't refresh on its own, so orders were missed → auto-refresh |
| Live status ended the "is it ready?" questions | The cart was lost on refresh → keep the cart saved |
| Vendors needed zero training for the one-tap flow | No way to cancel an order → add a cancel option within a time window |

**Open question:** waiting in line with friends is partly social. What happens to the canteen's social life when the queue disappears?
