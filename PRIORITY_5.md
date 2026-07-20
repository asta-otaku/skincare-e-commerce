# Priority 5 — Communication & Third-Party Services

Transactional email (Resend), newsletter + contact/wholesale inbox in Supabase, WhatsApp number from env. Image storage (5.5) was already done earlier.

---

## What’s included

| Piece | Location |
|---|---|
| Resend mail layer | `lib/email/*` |
| Newsletter API + DB | `app/api/newsletter`, `newsletter_subscribers` |
| Contact / wholesale | `app/api/contact`, `app/api/wholesale` + tables |
| Order / ship / welcome / reward emails | verify + webhook, admin status API, `/api/email/*` |
| WhatsApp env | `lib/whatsapp.ts`, `NEXT_PUBLIC_WHATSAPP_NUMBER` |
| Admin inbox | `/admin/inbox` |
| Forgot password | `/forgot-password` (Supabase Auth email) |
| Migration | `supabase/migrations/014_comms.sql` |

---

## Step 1 — Environment

Add to `.env` (see `.env.local.example`):

```env
RESEND_API_KEY=re_xxxx
EMAIL_FROM=HAYDA SKINCo. <onboarding@resend.dev>
EMAIL_TO=your-resend-account-email@example.com
NEXT_PUBLIC_WHATSAPP_NUMBER=2348137309609
```

**Domain caveat:** Until you verify `haydaskinco.com` in Resend, use `onboarding@resend.dev` as the from address. Resend will **only deliver to the email on your Resend account** (any other `to` address returns 403 and the UI will now show that error). Subscribe / test with that same address. After verification, set:

```env
EMAIL_FROM=HAYDA SKINCo. <hello@haydaskinco.com>
EMAIL_TO=hello@haydaskinco.com
```

Newsletter welcome uses promo code **`WELCOME10`** (seeded in migration 014 — 10% off).

---

## Step 2 — Run migration 014

In Supabase **SQL Editor**, run `supabase/migrations/014_comms.sql`.

Creates:

- `newsletter_subscribers`, `contact_submissions`, `wholesale_enquiries`
- RLS: public insert, admin select
- `WELCOME10` promo code (if missing)

---

## Step 3 — Smoke checklist

1. Newsletter (popup or footer) → row in `newsletter_subscribers` + welcome email with `WELCOME10`
2. Contact / wholesale forms → DB row + notify email to `EMAIL_TO`
3. Paid order (verify or webhook) → order confirmation (not on “Already paid” re-runs)
4. Admin order → Shipped / Fulfilled → customer email
5. Register → welcome email
6. Redeem reward → promo code email
7. Forgot password → Supabase reset email
8. WhatsApp links use `+234 813 730 9609`
9. `/admin/inbox` lists submissions

---

## Notes

- Missing `RESEND_API_KEY` logs and skips send — checkout still works.
- No Mailchimp; subscribers live in Supabase.
- No tracking numbers on ship emails yet.
