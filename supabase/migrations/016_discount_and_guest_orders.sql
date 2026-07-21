-- 016_discount_and_guest_orders.sql
-- Product discount_pct + stronger guest order claim / RLS by shipping email

-- ── Product discount (0–100 %) ────────────────────────────────────────────────
alter table public.products
  add column if not exists discount_pct integer not null default 0
  check (discount_pct >= 0 and discount_pct <= 100);

-- ── RLS: also match shipping_address email ────────────────────────────────────
drop policy if exists "orders: owner read" on public.orders;

create policy "orders: owner read"
  on public.orders for select
  using (
    auth.uid() = user_id
    or (
      guest_email is not null
      and lower(guest_email) = lower(coalesce(auth.jwt() ->> 'email', ''))
    )
    or (
      shipping_address ? 'email'
      and lower(shipping_address ->> 'email') = lower(coalesce(auth.jwt() ->> 'email', ''))
    )
  );

drop policy if exists "orders: owner update unpaid" on public.orders;

create policy "orders: owner update unpaid"
  on public.orders for update
  using (
    payment_status = 'unpaid'
    and (
      auth.uid() = user_id
      or (
        guest_email is not null
        and lower(guest_email) = lower(coalesce(auth.jwt() ->> 'email', ''))
      )
      or (
        shipping_address ? 'email'
        and lower(shipping_address ->> 'email') = lower(coalesce(auth.jwt() ->> 'email', ''))
      )
    )
  );

-- ── Claim: match guest_email OR shipping email; backfill guest_email ──────────
create or replace function public.claim_guest_orders()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  em  text := lower(coalesce(auth.jwt() ->> 'email', ''));
  n   integer := 0;
begin
  if uid is null or em = '' then
    return 0;
  end if;

  -- Normalize missing guest_email from shipping address when email matches
  update public.orders
  set guest_email = lower(shipping_address ->> 'email'),
      updated_at = now()
  where (guest_email is null or trim(guest_email) = '')
    and shipping_address ? 'email'
    and lower(shipping_address ->> 'email') = em;

  update public.orders o
  set user_id = uid,
      guest_email = coalesce(nullif(lower(trim(o.guest_email)), ''), em),
      updated_at = now()
  where o.user_id is distinct from uid
    and (
      (o.guest_email is not null and lower(o.guest_email) = em)
      or (
        o.shipping_address ? 'email'
        and lower(o.shipping_address ->> 'email') = em
      )
    )
    and (
      o.user_id is null
      or not exists (
        select 1
        from public.profiles p
        where p.id = o.user_id
          and p.email is not null
          and lower(p.email) = em
      )
    );

  get diagnostics n = row_count;
  return n;
end;
$$;

grant execute on function public.claim_guest_orders() to authenticated;
