-- ─────────────────────────────────────────────────────────────────────────────
-- 003_rls.sql
-- Row Level Security policies
-- ─────────────────────────────────────────────────────────────────────────────

-- ── Helper function ───────────────────────────────────────────────────────────
create or replace function public.is_admin()
returns boolean language sql security definer as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- ── profiles ─────────────────────────────────────────────────────────────────
alter table public.profiles enable row level security;

-- Users can read/update their own profile
create policy "profiles: self read"   on public.profiles for select using (id = auth.uid());
create policy "profiles: self update" on public.profiles for update using (id = auth.uid());

-- Admins can read all profiles
create policy "profiles: admin read"  on public.profiles for select using (public.is_admin());

-- ── addresses ────────────────────────────────────────────────────────────────
alter table public.addresses enable row level security;

create policy "addresses: owner CRUD" on public.addresses
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- ── brands ───────────────────────────────────────────────────────────────────
alter table public.brands enable row level security;

-- Public read
create policy "brands: public read" on public.brands for select using (true);
-- Admin write
create policy "brands: admin insert" on public.brands for insert with check (public.is_admin());
create policy "brands: admin update" on public.brands for update using (public.is_admin());
create policy "brands: admin delete" on public.brands for delete using (public.is_admin());

-- ── products ─────────────────────────────────────────────────────────────────
alter table public.products enable row level security;

-- Public read (published only for anonymous users)
create policy "products: public read" on public.products
  for select using (is_published = true or public.is_admin());

-- Admin write
create policy "products: admin insert" on public.products for insert with check (public.is_admin());
create policy "products: admin update" on public.products for update using (public.is_admin());
create policy "products: admin delete" on public.products for delete using (public.is_admin());

-- ── journals ─────────────────────────────────────────────────────────────────
alter table public.journals enable row level security;

create policy "journals: public read" on public.journals
  for select using (is_published = true or public.is_admin());

create policy "journals: admin write" on public.journals
  for all using (public.is_admin()) with check (public.is_admin());

-- ── deals ────────────────────────────────────────────────────────────────────
alter table public.deals enable row level security;

create policy "deals: public read" on public.deals
  for select using (is_active = true or public.is_admin());

create policy "deals: admin write" on public.deals
  for all using (public.is_admin()) with check (public.is_admin());
