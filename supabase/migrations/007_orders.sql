-- 007_orders.sql
-- Orders, promo codes, stock decrement helper, RLS
-- Run after 003_rls.sql (needs is_admin())

-- ── promo_codes ───────────────────────────────────────────────────────────────
create table if not exists public.promo_codes (
  code          text primary key,
  discount_pct  integer not null check (discount_pct > 0 and discount_pct <= 100),
  max_uses      integer,
  used_count    integer not null default 0,
  expires_at    timestamptz,
  is_active     boolean not null default true,
  created_at    timestamptz not null default now()
);

alter table public.promo_codes enable row level security;

create policy "promo_codes: public read active"
  on public.promo_codes for select
  using (is_active = true);

create policy "promo_codes: admin write"
  on public.promo_codes for all
  using (public.is_admin())
  with check (public.is_admin());

-- ── orders ────────────────────────────────────────────────────────────────────
create table if not exists public.orders (
  id               uuid primary key default uuid_generate_v4(),
  reference        text not null unique,
  user_id          uuid references public.profiles (id) on delete set null,
  guest_email      text,
  items            jsonb not null default '[]',
  shipping_address jsonb not null default '{}',
  shipping_method  text not null default 'standard',
  shipping_cost    numeric(12, 2) not null default 0,
  subtotal         numeric(12, 2) not null default 0,
  tax              numeric(12, 2) not null default 0,
  discount         numeric(12, 2) not null default 0,
  promo_code       text references public.promo_codes (code) on delete set null,
  total            numeric(12, 2) not null default 0,
  status           text not null default 'pending'
                     check (status in ('pending','processing','shipped','fulfilled','cancelled','refunded')),
  payment_status   text not null default 'unpaid'
                     check (payment_status in ('unpaid','paid','failed','refunded')),
  payment_method   text,
  paystack_access_code text,
  notes            text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create trigger orders_updated_at
  before update on public.orders
  for each row execute procedure public.set_updated_at();

create index if not exists orders_user_id on public.orders (user_id);
create index if not exists orders_reference on public.orders (reference);
create index if not exists orders_status on public.orders (status);
create index if not exists orders_created_at on public.orders (created_at desc);

alter table public.orders enable row level security;

-- Customers: read own orders
create policy "orders: owner read"
  on public.orders for select
  using (auth.uid() = user_id);

-- Guests / checkout: anyone can insert a pending order (validated in API)
create policy "orders: insert checkout"
  on public.orders for insert
  with check (true);

-- Owners can update only while unpaid (e.g. abandon) — prefer service role for payment updates
create policy "orders: owner update unpaid"
  on public.orders for update
  using (auth.uid() = user_id and payment_status = 'unpaid');

-- Admins: full access
create policy "orders: admin all"
  on public.orders for all
  using (public.is_admin())
  with check (public.is_admin());

-- ── Stock decrement after paid ────────────────────────────────────────────────
create or replace function public.decrement_product_stock(p_items jsonb)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  item jsonb;
  pid text;
  qty integer;
begin
  for item in select * from jsonb_array_elements(p_items)
  loop
    pid := item->>'productId';
    qty := coalesce((item->>'quantity')::integer, 0);
    if pid is null or qty <= 0 then
      continue;
    end if;
    -- Skip deal bundle ids
    if pid like 'deal__%' then
      continue;
    end if;
    update public.products
    set stock = greatest(0, stock - qty),
        updated_at = now()
    where id = pid;
  end loop;
end;
$$;

-- Mark order paid + stock + promo (callable from verify/webhook without service role)
create or replace function public.complete_order_payment(p_reference text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  o public.orders%rowtype;
begin
  select * into o from public.orders where reference = p_reference for update;
  if not found then
    return jsonb_build_object('ok', false, 'message', 'Order not found');
  end if;
  if o.payment_status = 'paid' then
    return jsonb_build_object('ok', true, 'message', 'Already paid');
  end if;

  update public.orders
  set payment_status = 'paid',
      status = 'processing',
      updated_at = now()
  where reference = p_reference;

  perform public.decrement_product_stock(o.items);

  if o.promo_code is not null then
    update public.promo_codes
    set used_count = used_count + 1
    where code = o.promo_code;
  end if;

  return jsonb_build_object('ok', true);
end;
$$;

grant execute on function public.complete_order_payment(text) to anon, authenticated, service_role;
