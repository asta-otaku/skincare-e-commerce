-- 019: Support multiple promo codes per order
alter table public.orders
  add column if not exists applied_promo_codes text[] not null default '{}';

-- Backfill from legacy single promo_code
update public.orders
set applied_promo_codes = array[promo_code]
where promo_code is not null
  and (applied_promo_codes is null or cardinality(applied_promo_codes) = 0);

create or replace function public.complete_order_payment(p_reference text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  o public.orders%rowtype;
  codes text[];
  c text;
begin
  select * into o from public.orders where reference = p_reference for update;
  if not found then
    return jsonb_build_object('ok', false, 'message', 'Order not found');
  end if;
  if o.payment_status = 'paid' then
    perform public.award_order_points(o);
    return jsonb_build_object('ok', true, 'message', 'Already paid');
  end if;

  update public.orders
  set payment_status = 'paid',
      status = 'processing',
      updated_at = now()
  where reference = p_reference
  returning * into o;

  perform public.decrement_product_stock(o.items);

  codes := coalesce(o.applied_promo_codes, '{}');
  if cardinality(codes) = 0 and o.promo_code is not null then
    codes := array[o.promo_code];
  end if;

  if cardinality(codes) > 0 then
    foreach c in array codes loop
      update public.promo_codes
      set used_count = used_count + 1,
          is_active = case
            when max_uses is not null and used_count + 1 >= max_uses then false
            when code like 'RWD-%' then false
            else is_active
          end
      where code = c;

      delete from public.reward_redemptions
      where promo_code = c;
    end loop;
  end if;

  perform public.award_order_points(o);

  return jsonb_build_object('ok', true);
end;
$$;
