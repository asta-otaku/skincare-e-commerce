-- 012_points_per_100_naira.sql
-- Earn 1 point per ₦100 spent (was ₦10). Run after 009_customer_features.sql

create or replace function public.award_order_points(p_order public.orders)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  pts integer;
begin
  if p_order.user_id is null then
    return;
  end if;
  if exists (
    select 1 from public.points_ledger
    where order_id = p_order.id and delta > 0
  ) then
    return;
  end if;

  pts := greatest(1, floor(p_order.total / 100)::integer);
  insert into public.points_ledger (user_id, delta, label, order_id)
  values (p_order.user_id, pts, 'Order ' || p_order.reference, p_order.id);
end;
$$;
