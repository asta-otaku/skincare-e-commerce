-- Multi-category products + skin types
alter table public.products
  add column if not exists categories text[] not null default '{}';

alter table public.products
  add column if not exists skin_types text[] not null default '{}';

-- Backfill categories from legacy single category text
update public.products
set categories = array[category]
where coalesce(trim(category), '') <> ''
  and (categories = '{}' or categories is null);

create index if not exists products_categories_gin on public.products using gin (categories);
create index if not exists products_skin_types_gin on public.products using gin (skin_types);
