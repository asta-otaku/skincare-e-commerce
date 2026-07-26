-- Deals treated like products: discount %, multi-brand, concerns, ratings.
-- Wishlist / reviews may reference deal__{id} as well as product ids.

alter table public.deals
  add column if not exists discount_pct integer not null default 0
    check (discount_pct >= 0 and discount_pct <= 100);

alter table public.deals
  add column if not exists brand_ids text[] not null default '{}';

alter table public.deals
  add column if not exists concerns text[] not null default '{}';

alter table public.deals
  add column if not exists rating numeric(3, 2) not null default 0;

alter table public.deals
  add column if not exists review_count integer not null default 0;

-- Backfill concerns from legacy free-text description ("A · B") when empty
update public.deals
set concerns = (
  select coalesce(array_agg(trim(part)), '{}')
  from unnest(string_to_array(description, '·')) as part
  where trim(part) <> ''
)
where coalesce(cardinality(concerns), 0) = 0
  and description is not null
  and description like '%·%';

-- Allow wishlist / reviews on deals (deal__*) as well as products
alter table public.wishlist drop constraint if exists wishlist_product_id_fkey;
alter table public.reviews drop constraint if exists reviews_product_id_fkey;

create or replace function public.refresh_product_rating(p_product_id text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  avg_r numeric(3, 2);
  cnt integer;
  bare_id text;
begin
  select
    coalesce(round(avg(rating)::numeric, 2), 0),
    count(*)::integer
  into avg_r, cnt
  from public.reviews
  where product_id = p_product_id;

  if p_product_id like 'deal__%' then
    bare_id := substring(p_product_id from 7);
    update public.deals
    set rating = avg_r,
        review_count = cnt,
        updated_at = now()
    where id = bare_id;
  else
    update public.products
    set rating = avg_r,
        review_count = cnt,
        updated_at = now()
    where id = p_product_id;
  end if;
end;
$$;
