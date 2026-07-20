-- 011_claim_misattributed_orders.sql
-- Reclaim orders whose guest_email matches the signed-in user but user_id
-- points at someone else (e.g. admin was logged in during checkout).
-- Run after 008_guest_order_claim.sql

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

  update public.orders o
  set user_id = uid,
      updated_at = now()
  where o.guest_email is not null
    and lower(o.guest_email) = em
    and o.user_id is distinct from uid
    and (
      o.user_id is null
      or not exists (
        select 1
        from public.profiles p
        where p.id = o.user_id
          and p.email is not null
          and lower(p.email) = lower(o.guest_email)
      )
    );

  get diagnostics n = row_count;
  return n;
end;
$$;

grant execute on function public.claim_guest_orders() to authenticated;
