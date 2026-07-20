# Supabase Setup Guide — HAYDA SKINCo.

This document walks you through creating your Supabase project, running the migration scripts, seeding the database, and connecting the app end-to-end.

---

## Prerequisites

- A free [Supabase account](https://supabase.com)
- Node.js 18+ installed
- pnpm installed (`npm install -g pnpm`)

---

## Step 1 — Install the Supabase packages

In your project folder, run:

```bash
pnpm add @supabase/supabase-js @supabase/ssr
```

> If you see a peer-dependency warning, add `--no-strict-peer-dependencies` or use `npm install @supabase/supabase-js @supabase/ssr --legacy-peer-deps`.

---

## Step 2 — Create a Supabase project

1. Go to [https://supabase.com](https://supabase.com) and sign in.
2. Click **New project**.
3. Fill in:
   - **Name:** `hayda-skinco` (or any name you like)
   - **Database password:** choose a strong password and **save it somewhere safe**
   - **Region:** pick the one closest to Nigeria — `eu-west-2 (London)` or `af-south-1 (Cape Town)` are your best options for low latency
4. Click **Create new project** and wait ~1 minute for it to provision.

---

## Step 3 — Get your API keys

1. In the Supabase dashboard, open your project.
2. Go to **Project Settings** (gear icon, bottom-left) → **API**.
3. Copy the following values:

| Value | Where to find it |
|---|---|
| **Project URL** | "Project URL" box — looks like `https://xxxxxxxxxxxx.supabase.co` |
| **Anon / Public key** | Under "Project API keys" → `anon public` |
| **Service role key** | Under "Project API keys" → `service_role` (click the eye icon to reveal) |

> **Never commit the service role key to Git.** It bypasses all Row Level Security.

---

## Step 4 — Configure your environment

1. Copy the example env file:

```bash
cp .env.local.example .env.local
```

2. Open `.env.local` and replace the placeholder values:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...your-anon-key...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...your-service-role-key...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

> Also update the `.env` file in the project root with the same URL and anon key — it is read by the dev server.

---

## Step 5 — Run Migration 001: Profiles & Addresses

This creates the `profiles` and `addresses` tables and the trigger that auto-creates a profile when a user signs up.

1. In the Supabase dashboard, click **SQL Editor** (left sidebar).
2. Click **New query**.
3. Open `supabase/migrations/001_profiles.sql` in your editor, **copy the entire contents**, and paste it into the SQL editor.
4. Click **Run** (or press `Ctrl+Enter` / `Cmd+Enter`).
5. You should see: `Success. No rows returned.`

---

## Step 6 — Run Migration 002: Brands, Products, Journals & Deals

1. Click **New query** again in the SQL editor.
2. Open `supabase/migrations/002_brands_products.sql`, copy and paste it.
3. Click **Run**.

---

## Step 7 — Run Migration 003: Row Level Security

This locks down every table so users can only access what they're allowed to.

1. Click **New query**.
2. Open `supabase/migrations/003_rls.sql`, copy and paste it.
3. Click **Run**.

> After this, anonymous users can read published products/brands/journals/deals but cannot write anything.

---

## Step 8 — Run Migration 004: Storage bucket

This creates the `product-images` storage bucket and its access policies so admins can upload images and the storefront can display them.

1. Click **New query** in the SQL editor.
2. Open `supabase/migrations/004_storage.sql`, copy and paste it.
3. Click **Run**.

> Alternatively you can create the bucket manually: **Storage** → **New bucket** → name it `product-images` → tick **Public bucket** → **Create bucket**. Then run only the RLS policy section of the file.

---

## Step 8b — Run Migration 005: Deals extra columns

Adds `brand_name` and `highlight` to the `deals` table (used by the admin deals form).

1. Click **New query**.
2. Open `supabase/migrations/005_deals_extra_columns.sql`, copy and paste it.
3. Click **Run**.

```sql
alter table public.deals add column if not exists brand_name text;
alter table public.deals add column if not exists highlight boolean not null default false;
```

---

## Step 8c — Run Migration 006: Profile preferences

Adds a `preferences` JSON column on `profiles` for notification toggles.

1. Click **New query**.
2. Open `supabase/migrations/006_profile_preferences.sql`, copy and paste it.
3. Click **Run**.

```sql
alter table public.profiles
  add column if not exists preferences jsonb not null
  default '{"newsletter":true,"orderUpdates":true,"newProducts":false,"saleAlerts":true}'::jsonb;
```

---

## Step 9 — Seed the database

This populates brands, products, journals, and deals.

1. Click **New query**.
2. Open `supabase/seed.sql`, copy and paste it.
3. Click **Run**.
4. To verify it worked, run this quick check query:

```sql
select name, brand_name, price from products order by name;
```

You should see 12 product rows. Also verify:

```sql
select slug, title, is_published from journals;
select id, title, is_active from deals;
```

---

## Step 9 — Create your first admin account

### 9a — Sign up via the app

1. Start the dev server: `pnpm dev`
2. Go to `http://localhost:3000/admin/register`
3. Register with your email and a secure password.

### 9b — Grant admin role in the database

After signing up, run this in the Supabase SQL editor (replace with your actual email):

```sql
UPDATE public.profiles
SET role = 'admin'
WHERE email = 'your-email@example.com';
```

### 9c — Verify it worked

```sql
SELECT email, role FROM public.profiles;
```

You should see your row with `role = 'admin'`.

---

## Step 10 — Configure Supabase Auth settings

1. In the dashboard, go to **Authentication** → **URL Configuration**.
2. Set:
   - **Site URL:** `http://localhost:3000` (change to your production domain when deploying)
   - **Redirect URLs:** add `http://localhost:3000/**`
3. Go to **Authentication** → **Providers** → **Email**.
4. Make sure **Enable Email provider** is on.

> **⚠️ Do this now or logins will fail with `email_not_confirmed`:**
> Toggle **Confirm email** OFF for development so registered accounts can sign in immediately.
> Path: **Authentication → Providers → Email → Confirm email → toggle off → Save**.
> Remember to turn it back on before going live.

---

## Step 11 — Test the full flow

| What to test | Where |
|---|---|
| Admin login | `http://localhost:3000/admin/login` |
| Admin dashboard | `http://localhost:3000/admin/dashboard` |
| Add a product | `http://localhost:3000/admin/products/new` |
| Storefront shop | `http://localhost:3000/shop` (should show DB products) |
| Storefront product detail | Click any product card |
| User sign up | `http://localhost:3000/register` |
| User sign in | `http://localhost:3000/login` |
| Account area (protected) | `http://localhost:3000/account` |

---

## Troubleshooting

### Login fails with "Email not confirmed"
**Quick fix for development:** Go to **Authentication → Providers → Email** in the Supabase dashboard and toggle **Confirm email** off.

If you need confirmation on (e.g. production), you can resend the email: the login page now has a **Resend confirmation email** button that appears automatically when this error occurs.

---

### "Invalid API key" or 401 errors
- Double-check `.env.local` has the correct URL and anon key.
- Restart the dev server after changing env files: `Ctrl+C` then `pnpm dev`.

### Products page shows mock data instead of DB data
- Confirm `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set correctly.
- Open browser DevTools → Console and look for Supabase errors.
- Make sure migration 003 (RLS) ran successfully; the anon user must be allowed to read published products.

### Admin login says "Access denied"
- Make sure you ran the `UPDATE profiles SET role='admin'` query in Step 9b.
- The role check queries `public.profiles` — confirm the row exists with the correct email.

### "relation does not exist" SQL errors
- Migrations must be run in order: 001 → 002 → 003 → 004 → seed.
- Make sure you ran all four migration files before the seed.

### Image upload fails with "Bucket not found"
- Make sure you ran `004_storage.sql` or created the `product-images` bucket manually in the Storage section.
- Confirm the bucket is set to **public**.

### Image upload fails with "row violates RLS policy"
- The signed-in user must have `role = 'admin'` in the `profiles` table.
- Check via: `SELECT email, role FROM profiles WHERE email = 'you@email.com';`

### Auth trigger not creating profile row
- In the Supabase dashboard go to **Database** → **Functions** and confirm `handle_new_user` is listed.
- If missing, re-run `001_profiles.sql`.

---

## Deploying to production (when ready)

1. Add your production domain to Supabase Auth → URL Configuration.
2. Set the same env variables in your hosting provider (Vercel, Railway, etc.).
3. Change `NEXT_PUBLIC_SITE_URL` to your live URL.
4. Turn **Confirm email** back on in Authentication settings.
5. Remove or hide the demo credentials notice from the admin login page.

---

## File reference

```
supabase/
├── migrations/
│   ├── 001_profiles.sql        ← profiles + addresses + auth trigger
│   ├── 002_brands_products.sql ← brands, products, journals, deals tables
│   ├── 003_rls.sql             ← Row Level Security for all tables
│   ├── 004_storage.sql              ← product-images storage bucket + policies
│   ├── 005_deals_extra_columns.sql  ← brand_name + highlight on deals
│   ├── 006_profile_preferences.sql  ← notification prefs JSON on profiles
│   └── 007_orders.sql               ← orders, promo_codes, stock helper (Priority 2)
└── seed.sql                    ← 10 brands + 12 starter products

lib/supabase/
├── client.ts    ← browser Supabase client (used in React components)
├── server.ts    ← server Supabase client (used in Server Components)
├── products.ts  ← product/brand query & save functions (with mock fallback)
└── storage.ts   ← uploadProductImage / deleteProductImage helpers

middleware.ts    ← refreshes auth sessions on every request
.env.local       ← your actual keys (git-ignored)
.env.local.example ← template to copy from
```
