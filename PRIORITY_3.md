# Priority 3 — Customer Features

Reviews, cart persistence, wishlist, loyalty points. Account settings were completed in Priority 1.

---

## What’s included

| Piece | Location |
|---|---|
| Migration | `supabase/migrations/009_customer_features.sql` |
| Cart (server for signed-in) | `components/cart-provider.tsx`, `lib/supabase/cart.ts`, migration `010_cart_items.sql` |
| Wishlist + local cache | `components/favorites-provider.tsx`, `lib/supabase/wishlist.ts` |
| Reviews | `lib/supabase/reviews.ts`, `components/product-reviews.tsx`, `account/reviews` |
| Rewards | `lib/supabase/rewards.ts`, `account/rewards` |
| Promo fixed ₦ discount | `promo_codes.discount_ngn` (for reward codes) |

---

## Step 1 — Run migrations

In Supabase **SQL Editor**, run (if not already):

1. `009_customer_features.sql`
2. `010_cart_items.sql` — server cart for signed-in users (cross-device)

Creates / updates:

- `wishlist`, `reviews`, `review_helpful`, `points_ledger`, `reward_redemptions`
- `cart_items` (per-user lines + product snapshot; supports `deal__*` ids)
- `promo_codes.discount_ngn` (fixed-amount reward codes)
- RPCs: product rating refresh, helpful vote, redeem reward, award points on paid order
- Extends `complete_order_payment` to credit **1 point per ₦100** (paid, once)

**Cart behaviour:** Signed-in → Supabase only (syncs across devices). Guest → temporary browser cart; merges into your account on sign-in.

---

## Step 2 — Smoke checklist

1. Sign in → add to cart → refresh or open another device/browser with same account → cart still there  
2. Sign in → heart a product → refresh → still favourited; shows on `/account/favorites`  
3. Product page → write review (signed in) → appears; account → Reviews lists it  
4. Complete a paid order → `/account/rewards` balance increases  
5. Redeem a reward → get a one-use promo code → works at checkout  

---

## Out of scope here

- Email (Priority 5)  
- Refer-a-friend  
- Anonymous guest carts in the database (guests use a temporary browser cart until sign-in; signed-in carts live in `cart_items`)  
