-- 010_cart_items.sql
-- Server-side cart for signed-in users (syncs across devices).
-- product_id is free text so deal bundles (deal__*) can sit in the cart.
-- Run after 009_customer_features.sql

create table if not exists public.cart_items (
  user_id    uuid not null references public.profiles (id) on delete cascade,
  product_id text not null,
  quantity   integer not null default 1 check (quantity > 0),
  -- Snapshot for display / checkout if product row changes or is a deal
  snapshot   jsonb not null default '{}',
  updated_at timestamptz not null default now(),
  primary key (user_id, product_id)
);

create index if not exists cart_items_user on public.cart_items (user_id);

drop trigger if exists cart_items_updated_at on public.cart_items;
create trigger cart_items_updated_at
  before update on public.cart_items
  for each row execute procedure public.set_updated_at();

alter table public.cart_items enable row level security;

drop policy if exists "cart: owner all" on public.cart_items;
create policy "cart: owner all"
  on public.cart_items for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
