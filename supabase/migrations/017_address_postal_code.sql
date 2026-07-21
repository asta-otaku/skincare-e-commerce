-- 017: Add postal_code to saved addresses
alter table public.addresses
  add column if not exists postal_code text;
