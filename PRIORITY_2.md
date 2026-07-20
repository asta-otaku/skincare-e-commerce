# Priority 2 — Checkout & Payments

Guide for wiring Paystack, the `orders` / `promo_codes` tables, webhooks, and admin/customer order UIs.

---

## What’s included

| Piece | Location |
|---|---|
| Orders + promo SQL | `supabase/migrations/007_orders.sql` |
| Promo seed | bottom of `supabase/seed.sql` (or run SQL below) |
| Create order + Paystack init | `POST /api/orders` |
| Verify payment | `POST /api/orders/verify` |
| Paystack webhook | `POST /api/webhooks/paystack` |
| Validate promo | `POST /api/promo` |
| Checkout UI | `app/(storefront)/checkout/page.tsx` |
| Payment return page | `app/(storefront)/checkout/callback/page.tsx` |
| Order helpers | `lib/supabase/orders.ts` |
| Service-role client | `lib/supabase/admin.ts` |
| Admin orders | `app/(admin)/admin/orders/*` |
| Customer orders | `app/(storefront)/account/orders/*` |

---

## Step 1 — Environment variables

Add to `.env` / `.env.local` (see `.env.local.example`):

```env
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_xxxx
PAYSTACK_SECRET_KEY=sk_test_xxxx
NEXT_PUBLIC_SITE_URL=http://localhost:3000
SUPABASE_SERVICE_ROLE_KEY=eyJ...   # required for webhook stock updates
```

Get Paystack test keys from [Paystack Dashboard → Settings → API Keys & Webhooks](https://dashboard.paystack.com/#/settings/developer).

Restart `pnpm dev` after changing env vars.

---

## Step 2 — Run migration 007

In the Supabase **SQL Editor**, paste and run `supabase/migrations/007_orders.sql`.

This creates:

- `public.orders` — cart snapshot, shipping, totals, Paystack reference, status
- `public.promo_codes` — discount codes
- RLS: customers read own orders; admins read/update all; inserts allowed for checkout
- `decrement_product_stock(items jsonb)` + `complete_order_payment(reference)` (security definer — used by verify/webhook)

Then run **`008_guest_order_claim.sql`**, then **`011_claim_misattributed_orders.sql`** so signed-in customers reclaim guest checkouts (and orders wrongly attached to an admin session) that used their email.

---

## Step 3 — Seed promo codes

```sql
insert into public.promo_codes (code, discount_pct, max_uses, used_count, expires_at, is_active)
values
  ('HAYDA10',    10, null, 0, null, true),
  ('WELCOME15',  15, 500,  0, null, true),
  ('SKINCARE20', 20, 100,  0, (now() + interval '90 days')::timestamptz, true)
on conflict (code) do nothing;
```

---

## Step 4 — Configure Paystack webhook (test)

**You can skip this for local checkout testing.**  
After Paystack redirects back, `/checkout/callback` calls `/api/orders/verify`, which marks the order paid. The webhook is a backup for when the browser never returns (closed tab, network drop). Use it when you want end-to-end webhook coverage or before production.

### Option A — Paystack CLI (recommended for local)

You already completed `paystack login`. Next:

1. **Keep `pnpm dev` running** on port 3000.

2. **(First time)** The CLI tunnels via ngrok. Create a free account at [ngrok.com](https://ngrok.com), copy your **Auth Token**, then set it once:

```bash
# Prefer installing ngrok and saving the token to its config:
ngrok config add-authtoken YOUR_TOKEN_HERE

# Or export for the session (name varies by ngrok version):
export NGROK_AUTHTOKEN=YOUR_TOKEN_HERE
```

There is no `paystack config` command on `@paystack-oss/dev-cli`.

3. **Start the listener** (leave this terminal open). Your CLI requires `--forward`:

```bash
paystack webhook listen --forward localhost:3000/api/webhooks/paystack
```

You should see “Forwarding webhook events to…”. The CLI also updates the **Test Webhook URL** on your Paystack dashboard. Stop with `Ctrl+C` (it restores the previous webhook URL).

4. **Optional health check** (another terminal, while listen is still running):

```bash
paystack webhook ping
```

Defaults to a sample `charge.success` payload. Expect a `200` from your app. If you get `401`, your `PAYSTACK_SECRET_KEY` in `.env` must match the **test** secret for the same integration you logged into.

### Option B — Manual ngrok

```bash
ngrok http 3000
```

Then in Paystack Dashboard → **Settings → API Keys & Webhooks** set Test Webhook URL to:

```
https://YOUR_NGROK_HOST/api/webhooks/paystack
```

### Production

Set the live webhook URL to your deployed host:

```
https://your-domain.com/api/webhooks/paystack
```

Events needed: `charge.success`.

The webhook verifies `x-paystack-signature` (HMAC SHA512 of the raw body with `PAYSTACK_SECRET_KEY`), then:

1. Sets order `payment_status = paid`, `status = processing`
2. Decrements product stock
3. Increments promo `used_count` if a code was applied

The `/checkout/callback` verify route is a second path so orders still complete if the webhook is delayed.

---

## Step 5 — Checkout flow (happy path)

```
Cart → /checkout (shipping → payment method → review)
  → POST /api/orders
  → Paystack authorization_url (redirect)
  → Customer pays
  → Redirect to /checkout/callback?reference=...
  → POST /api/orders/verify
  → Clear cart + confirmation UI
```

**Guest checkout** is supported: `user_id` is null and `guest_email` is stored.

**Signed-in users:** `user_id` is taken from the Supabase session cookie when present.

Amounts are in **NGN**. Paystack receives **kobo** (`total * 100`).

---

## Step 6 — Manual test checklist

Without real Paystack keys (mock mode):

- If `PAYSTACK_SECRET_KEY` is missing, `POST /api/orders` still creates a pending order and returns `{ mock: true, reference }` so you can click through locally. No charge is made.

With test keys:

1. Add a product to cart → Checkout
2. Fill shipping (use a real email you control)
3. Apply promo `HAYDA10` → discount should appear
4. Review → Pay Now → Paystack test checkout
5. Use Paystack test card: `4084084084084081`, CVV `408`, any future expiry, PIN `0000`
6. Land on confirmation; order appears under **Account → Orders** (if signed in)
7. Admin → **Orders** shows the order; change status to Shipped / Fulfilled
8. Product stock decreased by purchased qty

---

## Step 7 — Admin & customer UIs

| Page | Behaviour |
|---|---|
| `/admin/orders` | Lists live orders from Supabase; status dropdown updates DB |
| `/admin/orders/[id]` | Order detail from DB |
| `/account/orders` | Signed-in user’s paid/processing+ orders |
| `/account/orders/[id]` | Detail for that user’s order only (RLS) |

---

## Troubleshooting

| Symptom | Fix |
|---|---|
| `Paystack not configured` | Set `PAYSTACK_SECRET_KEY` and restart |
| Webhook 401 / ignored | Check signature; use raw body; confirm secret key matches dashboard |
| Order stays `unpaid` / pending after Paystack email | Paystack must return to **this** app’s `/checkout/callback`. If `NEXT_PUBLIC_SITE_URL` pointed at Vercel while you paid on localhost, verify never ran. Restart `pnpm dev` after setting `NEXT_PUBLIC_SITE_URL=http://localhost:3000`, or open the order and click **I’ve paid — confirm order**. |
| Stock not decreasing | Ensure `SUPABASE_SERVICE_ROLE_KEY` is set (webhook/verify use admin client) |
| Promo always invalid | Run promo seed SQL; confirm `is_active` and `expires_at` |
| Admin can’t see orders | Profile `role` must be `admin` |

---

## Out of scope (later priorities)

- Resend order-confirmation email (Priority / Week 2 polish → often Week 5)
- Flutterwave alternative (same pattern; swap init/verify URLs)
- Server-side cart persistence (Priority 3)
- Refunds via Paystack API

---

## File map (quick)

```
supabase/migrations/007_orders.sql
lib/supabase/admin.ts
lib/supabase/orders.ts
lib/paystack.ts
app/api/orders/route.ts
app/api/orders/verify/route.ts
app/api/webhooks/paystack/route.ts
app/api/promo/route.ts
app/(storefront)/checkout/page.tsx
app/(storefront)/checkout/callback/page.tsx
PRIORITY_2.md          ← this file
```
