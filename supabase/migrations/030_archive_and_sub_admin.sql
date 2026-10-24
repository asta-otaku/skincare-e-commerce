-- Product archive flag + sub_admin role.
-- Sub admins can run the store (products, orders, catalog, journals, brands)
-- and cannot manage users, inbox, or deals.
-- Suspended accounts fail is_admin() / is_store_manager() immediately.

alter table public.products
  add column if not exists is_archived boolean not null default false;

create index if not exists products_is_archived on public.products (is_archived);

do $$
declare
  r record;
begin
  for r in
    select con.conname
    from pg_constraint con
    join pg_class rel on rel.oid = con.conrelid
    join pg_namespace nsp on nsp.oid = rel.relnamespace
    where nsp.nspname = 'public'
      and rel.relname = 'profiles'
      and con.contype = 'c'
      and pg_get_constraintdef(con.oid) ilike '%role%'
  loop
    execute format('alter table public.profiles drop constraint %I', r.conname);
  end loop;
end $$;

alter table public.profiles
  add constraint profiles_role_check
  check (role in ('customer', 'admin', 'staff', 'sub_admin'));

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid()
      and role = 'admin'
      and coalesce(is_suspended, false) = false
  );
$$;

create or replace function public.is_store_manager()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid()
      and role in ('admin', 'sub_admin')
      and coalesce(is_suspended, false) = false
  );
$$;

grant execute on function public.is_store_manager() to anon, authenticated, service_role;

-- Customer totals for the dashboard without letting sub admins list profiles.
create or replace function public.admin_customer_counts(since timestamptz)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if not public.is_store_manager() then
    return jsonb_build_object('total', 0, 'recent', 0);
  end if;
  return jsonb_build_object(
    'total', (select count(*) from public.profiles where role = 'customer'),
    'recent', (select count(*) from public.profiles where role = 'customer' and created_at >= since)
  );
end;
$$;

revoke all on function public.admin_customer_counts(timestamptz) from public;
grant execute on function public.admin_customer_counts(timestamptz) to authenticated;

-- ── products ────────────────────────────────────────────────────────────────
drop policy if exists "products: public read" on public.products;
create policy "products: public read" on public.products
  for select using (
    (is_published = true and is_archived = false)
    or public.is_store_manager()
  );

drop policy if exists "products: admin insert" on public.products;
create policy "products: admin insert" on public.products
  for insert with check (public.is_store_manager());

drop policy if exists "products: admin update" on public.products;
create policy "products: admin update" on public.products
  for update using (public.is_store_manager());

drop policy if exists "products: admin delete" on public.products;
create policy "products: admin delete" on public.products
  for delete using (public.is_store_manager());

-- ── brands ──────────────────────────────────────────────────────────────────
drop policy if exists "brands: admin insert" on public.brands;
create policy "brands: admin insert" on public.brands
  for insert with check (public.is_store_manager());

drop policy if exists "brands: admin update" on public.brands;
create policy "brands: admin update" on public.brands
  for update using (public.is_store_manager());

drop policy if exists "brands: admin delete" on public.brands;
create policy "brands: admin delete" on public.brands
  for delete using (public.is_store_manager());

-- ── journals ────────────────────────────────────────────────────────────────
drop policy if exists "journals: public read" on public.journals;
create policy "journals: public read" on public.journals
  for select using (is_published = true or public.is_store_manager());

drop policy if exists "journals: admin write" on public.journals;
create policy "journals: admin write" on public.journals
  for all using (public.is_store_manager()) with check (public.is_store_manager());

-- ── categories ──────────────────────────────────────────────────────────────
drop policy if exists "category_sections: admin write" on public.category_sections;
create policy "category_sections: admin write" on public.category_sections
  for all using (public.is_store_manager()) with check (public.is_store_manager());

drop policy if exists "categories: admin write" on public.categories;
create policy "categories: admin write" on public.categories
  for all using (public.is_store_manager()) with check (public.is_store_manager());

-- ── catalog ─────────────────────────────────────────────────────────────────
drop policy if exists "catalog_ingredients_public_read" on public.catalog_ingredients;
create policy "catalog_ingredients_public_read"
  on public.catalog_ingredients for select
  using (is_active = true or public.is_store_manager());

drop policy if exists "catalog_ingredients_admin_write" on public.catalog_ingredients;
create policy "catalog_ingredients_admin_write"
  on public.catalog_ingredients for all
  using (public.is_store_manager())
  with check (public.is_store_manager());

drop policy if exists "catalog_concerns_public_read" on public.catalog_concerns;
create policy "catalog_concerns_public_read"
  on public.catalog_concerns for select
  using (is_active = true or public.is_store_manager());

drop policy if exists "catalog_concerns_admin_write" on public.catalog_concerns;
create policy "catalog_concerns_admin_write"
  on public.catalog_concerns for all
  using (public.is_store_manager())
  with check (public.is_store_manager());

-- ── orders ──────────────────────────────────────────────────────────────────
drop policy if exists "orders: admin all" on public.orders;
create policy "orders: admin all" on public.orders
  for all using (public.is_store_manager()) with check (public.is_store_manager());

-- ── product images ──────────────────────────────────────────────────────────
drop policy if exists "product-images: admin insert" on storage.objects;
create policy "product-images: admin insert"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'product-images' and public.is_store_manager());

drop policy if exists "product-images: admin update" on storage.objects;
create policy "product-images: admin update"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'product-images' and public.is_store_manager());

drop policy if exists "product-images: admin delete" on storage.objects;
create policy "product-images: admin delete"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'product-images' and public.is_store_manager());
