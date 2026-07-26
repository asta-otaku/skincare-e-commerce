-- Clarify price_tiers shape: { qty, value } where value is absolute ₦ off base.
-- (Legacy { qty, price } unit-price rows are converted in app read/write helpers.)

comment on column public.products.price_tiers is
  'Quantity promotions: [{ "qty": 10, "value": 500 }, ...] — value is absolute NGN off product base_price. Unit = base − value + (sku_price − base). Listing discount_pct is separate and not used in cart.';
