-- Minimum order quantity + optional volume price tiers on products.
-- price_tiers: [{ "qty": 3, "price": 4500 }, ...] — unit price when cart qty >= qty

alter table public.products
  add column if not exists moq integer not null default 1
    check (moq >= 1);

alter table public.products
  add column if not exists price_tiers jsonb not null default '[]'::jsonb;

comment on column public.products.moq is
  'Minimum order quantity on storefront / cart (default 1).';

comment on column public.products.price_tiers is
  'Optional volume pricing: array of { qty, price } unit prices at quantity thresholds.';
