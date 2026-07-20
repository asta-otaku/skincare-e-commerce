-- 008_guest_order_claim.sql
-- Let signed-in customers see + claim guest checkouts that used their email.
-- Run after 007_orders.sql

-- ── Read: own user_id OR matching guest_email ────────────────────────────────
drop policy if exists "orders: owner read" on public.orders;

create policy "orders: owner read"
  on public.orders for select
  using (
    auth.uid() = user_id
    or (
      guest_email is not null
      and lower(guest_email) = lower(coalesce(auth.jwt() ->> 'email', ''))
    )
  );

-- ── Update unpaid: same ownership rules ──────────────────────────────────────
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
    )
  );

-- ── Claim null user_id rows that match the signed-in email ───────────────────
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

  update public.orders
  set user_id = uid,
      updated_at = now()
  where user_id is null
    and guest_email is not null
    and lower(guest_email) = em;

  get diagnostics n = row_count;
  return n;
end;
$$;

grant execute on function public.claim_guest_orders() to authenticated;
