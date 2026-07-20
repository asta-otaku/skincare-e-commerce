# Priority 4 — Admin CRUD & Dashboard

Products, journals, deals, and orders were already live from earlier work. This pass finishes the remaining mock surfaces.

---

## What’s included

| Piece | Status | Location |
|---|---|---|
| Products CRUD | Done (earlier) | `admin-product-form`, `lib/supabase/products.ts` |
| Journals CRUD | Done (earlier) | `admin-journal-editor`, `lib/supabase/journals.ts` |
| Deals CRUD | Done (earlier) | `admin/deals/*`, `lib/supabase/deals.ts` |
| Orders status | Done (earlier) | `admin/orders/*`, `updateOrderStatus` |
| Live dashboard | **New** | `admin/dashboard`, `lib/supabase/admin-dashboard.ts` |
| Users / roles | **New** | `admin/users`, `lib/supabase/users.ts`, migration `013` |

---

## Step 1 — Run migration 013

In Supabase **SQL Editor**, run `supabase/migrations/013_admin_users.sql`.

Adds:

- `profiles.is_suspended`
- Admin RLS update policy on `profiles` (role + suspend)

---

## Step 2 — Smoke checklist

1. `/admin/dashboard` — KPIs and charts reflect real paid orders / products / customers  
2. `/admin/users` — lists profiles; Make Admin / Suspend persists after refresh  
3. Products / journals / deals / orders still create & update as before  

---

## Notes

- Dashboard uses **₦** and paid-order data only for revenue.  
- “Orders this week” replaces the old fake traffic chart (no analytics provider yet).  
- Image storage for products/journals was already on Supabase Storage (P1/P2 era).  
