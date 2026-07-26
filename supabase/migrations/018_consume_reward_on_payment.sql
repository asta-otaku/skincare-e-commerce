-- 018: On successful payment, consume reward promo + delete redemption row
-- so a redeemed reward cannot be applied twice.

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

  if o.promo_code is not null then
    update public.promo_codes
    set used_count = used_count + 1,
        is_active = false
    where code = o.promo_code;

    -- Remove reward redemption so it cannot be listed / reused
    delete from public.reward_redemptions
    where promo_code = o.promo_code;
  end if;

  perform public.award_order_points(o);

  return jsonb_build_object('ok', true);
end;
$$;
