-- Multi tags on products + mutable ingredient/concern catalogs

alter table public.products
  add column if not exists tags text[] not null default '{}';

-- Backfill from legacy single tag
update public.products
set tags = array[tag]
where coalesce(trim(tag), '') <> ''
  and (tags = '{}' or tags is null);

create index if not exists products_tags_gin on public.products using gin (tags);

-- ── Catalog: key ingredients ──────────────────────────────────
create table if not exists public.catalog_ingredients (
  id         text primary key,
  name       text not null unique,
  slug       text not null unique,
  sort_order integer not null default 0,
  is_active  boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ── Catalog: skin concerns ────────────────────────────────────
create table if not exists public.catalog_concerns (
  id         text primary key,
  name       text not null unique,
  slug       text not null unique,
  sort_order integer not null default 0,
  is_active  boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.catalog_ingredients enable row level security;
alter table public.catalog_concerns enable row level security;

drop policy if exists "catalog_ingredients_public_read" on public.catalog_ingredients;
create policy "catalog_ingredients_public_read"
  on public.catalog_ingredients for select
  using (is_active = true or exists (
    select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'
  ));

drop policy if exists "catalog_ingredients_admin_write" on public.catalog_ingredients;
create policy "catalog_ingredients_admin_write"
  on public.catalog_ingredients for all
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'))
  with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

drop policy if exists "catalog_concerns_public_read" on public.catalog_concerns;
create policy "catalog_concerns_public_read"
  on public.catalog_concerns for select
  using (is_active = true or exists (
    select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'
  ));

drop policy if exists "catalog_concerns_admin_write" on public.catalog_concerns;
create policy "catalog_concerns_admin_write"
  on public.catalog_concerns for all
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'))
  with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

-- Seed ingredients (idempotent)
insert into public.catalog_ingredients (id, name, slug, sort_order) values
  ('niacinamide', 'Niacinamide', 'niacinamide', 1),
  ('vitamin-c', 'Vitamin C', 'vitamin-c', 2),
  ('salicylic-acid-bha', 'Salicylic Acid (BHA)', 'salicylic-acid-bha', 3),
  ('glycolic-acid-aha', 'Glycolic Acid (AHA)', 'glycolic-acid-aha', 4),
  ('lactic-acid-aha', 'Lactic Acid (AHA)', 'lactic-acid-aha', 5),
  ('mandelic-acid', 'Mandelic Acid', 'mandelic-acid', 6),
  ('azelaic-acid', 'Azelaic Acid', 'azelaic-acid', 7),
  ('tranexamic-acid', 'Tranexamic Acid', 'tranexamic-acid', 8),
  ('kojic-acid', 'Kojic Acid', 'kojic-acid', 9),
  ('alpha-arbutin', 'Alpha Arbutin', 'alpha-arbutin', 10),
  ('retinol', 'Retinol', 'retinol', 11),
  ('retinal', 'Retinal', 'retinal', 12),
  ('bakuchiol', 'Bakuchiol', 'bakuchiol', 13),
  ('hyaluronic-acid', 'Hyaluronic Acid', 'hyaluronic-acid', 14),
  ('ceramides', 'Ceramides', 'ceramides', 15),
  ('panthenol-vitamin-b5', 'Panthenol (Vitamin B5)', 'panthenol-vitamin-b5', 16),
  ('glycerin', 'Glycerin', 'glycerin', 17),
  ('squalane', 'Squalane', 'squalane', 18),
  ('snail-mucin', 'Snail Mucin', 'snail-mucin', 19),
  ('centella-asiatica-cica', 'Centella Asiatica (Cica)', 'centella-asiatica-cica', 20),
  ('aloe-vera', 'Aloe Vera', 'aloe-vera', 21),
  ('green-tea-extract', 'Green Tea Extract', 'green-tea-extract', 22),
  ('licorice-root-extract', 'Licorice Root Extract', 'licorice-root-extract', 23),
  ('zinc-pca', 'Zinc PCA', 'zinc-pca', 24),
  ('peptides', 'Peptides', 'peptides', 25),
  ('caffeine', 'Caffeine', 'caffeine', 26),
  ('vitamin-e', 'Vitamin E', 'vitamin-e', 27),
  ('ferulic-acid', 'Ferulic Acid', 'ferulic-acid', 28),
  ('allantoin', 'Allantoin', 'allantoin', 29),
  ('colloidal-oatmeal', 'Colloidal Oatmeal', 'colloidal-oatmeal', 30),
  ('tea-tree-oil', 'Tea Tree Oil', 'tea-tree-oil', 31),
  ('sulfur', 'Sulfur', 'sulfur', 32),
  ('benzoyl-peroxide', 'Benzoyl Peroxide', 'benzoyl-peroxide', 33),
  ('urea', 'Urea', 'urea', 34),
  ('shea-butter', 'Shea Butter', 'shea-butter', 35),
  ('jojoba-oil', 'Jojoba Oil', 'jojoba-oil', 36),
  ('rosehip-oil', 'Rosehip Oil', 'rosehip-oil', 37)
on conflict (id) do update set
  name = excluded.name,
  slug = excluded.slug,
  sort_order = excluded.sort_order;

-- Seed concerns (idempotent)
insert into public.catalog_concerns (id, name, slug, sort_order) values
  ('acne', 'Acne', 'acne', 1),
  ('breakouts', 'Breakouts', 'breakouts', 2),
  ('blackheads', 'Blackheads', 'blackheads', 3),
  ('whiteheads', 'Whiteheads', 'whiteheads', 4),
  ('clogged-pores', 'Clogged Pores', 'clogged-pores', 5),
  ('enlarged-pores', 'Enlarged Pores', 'enlarged-pores', 6),
  ('excess-oil', 'Excess Oil', 'excess-oil', 7),
  ('uneven-skin-tone', 'Uneven Skin Tone', 'uneven-skin-tone', 8),
  ('hyperpigmentation', 'Hyperpigmentation', 'hyperpigmentation', 9),
  ('dark-spots', 'Dark Spots', 'dark-spots', 10),
  ('post-acne-marks-pih', 'Post-Acne Marks (PIH)', 'post-acne-marks-pih', 11),
  ('melasma', 'Melasma', 'melasma', 12),
  ('dullness', 'Dullness', 'dullness', 13),
  ('dryness', 'Dryness', 'dryness', 14),
  ('dehydration', 'Dehydration', 'dehydration', 15),
  ('rough-texture', 'Rough Texture', 'rough-texture', 16),
  ('uneven-texture', 'Uneven Texture', 'uneven-texture', 17),
  ('fine-lines', 'Fine Lines', 'fine-lines', 18),
  ('wrinkles', 'Wrinkles', 'wrinkles', 19),
  ('loss-of-firmness', 'Loss of Firmness', 'loss-of-firmness', 20),
  ('redness', 'Redness', 'redness', 21),
  ('sensitivity', 'Sensitivity', 'sensitivity', 22),
  ('damaged-skin-barrier', 'Damaged Skin Barrier', 'damaged-skin-barrier', 23),
  ('irritation', 'Irritation', 'irritation', 24),
  ('sun-damage', 'Sun Damage', 'sun-damage', 25),
  ('keratosis-pilaris', 'Keratosis Pilaris', 'keratosis-pilaris', 26),
  ('body-acne', 'Body Acne', 'body-acne', 27),
  ('ingrown-hairs', 'Ingrown Hairs', 'ingrown-hairs', 28),
  ('dark-under-eyes', 'Dark Under-Eyes', 'dark-under-eyes', 29),
  ('puffiness', 'Puffiness', 'puffiness', 30)
on conflict (id) do update set
  name = excluded.name,
  slug = excluded.slug,
  sort_order = excluded.sort_order;
