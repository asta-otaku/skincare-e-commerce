# Priority 6 — Loyalty polish & ship readiness

Core loyalty (points ledger, order/review earn, redeem → promo, live rewards page) shipped in Priority 3. Reward emails shipped in Priority 5. This pass finishes polish and ship readiness.

---

## What’s included

| Piece | Location |
|---|---|
| Profile complete +100 (one-time) | migration `015`, `claim_profile_bonus`, settings + rewards UI |
| Password recovery UX | `/forgot-password` → `/reset-password` |
| Catalog on Supabase | featured, related, search, homepage new arrivals, concern/ingredient |
| Guide | this file |

---

## Step 1 — Run migration 015

In Supabase **SQL Editor**, run `supabase/migrations/015_profile_bonus.sql`.

Adds:

- `profiles.profile_bonus_claimed`
- RPC `claim_profile_bonus()` — +100 points when `full_name` + `phone` are set (once)

---

## Step 2 — Smoke checklist

1. Save profile with name + phone → +100 points once; second save does not double-credit  
2. Rewards page shows “Complete your profile — +100”  
3. Forgot password → email → `/reset-password` → set new password → sign in  
4. Homepage featured / new arrivals, search, concern & ingredient pages show DB products  
5. Paid order → points; review → +50; redeem → checkout promo still works  

---

## Step 3 — Production deploy checklist

1. Migrations **001–015** applied in production Supabase  
2. Vercel env: Supabase URL/anon/service role, Paystack (live), Resend + `EMAIL_FROM`/`EMAIL_TO`, `NEXT_PUBLIC_WHATSAPP_NUMBER`, `NEXT_PUBLIC_SITE_URL`  
3. Supabase Auth → Redirect URLs include `https://your-domain/reset-password` and site URL  
4. Paystack live webhook → `https://your-domain/api/webhooks/paystack`  
5. Prefer verified Resend domain before marketing email to all customers  
6. Confirm email signup enabled if desired; test guest + signed-in checkout  

---

## Out of scope (still)

- Refer-a-friend  
- Ship tracking numbers  
- Flutterwave / WhatsApp Business API automation  
