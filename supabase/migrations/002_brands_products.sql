-- ─────────────────────────────────────────────────────────────────────────────
-- 002_brands_products.sql
-- Brands catalogue + Products table
-- ─────────────────────────────────────────────────────────────────────────────

-- ── brands ───────────────────────────────────────────────────────────────────
create table if not exists public.brands (
  id          text primary key,               -- e.g. "cerave", "the-ordinary"
  name        text not null unique,
  tagline     text,
  logo_url    text,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now()
);

-- ── products ─────────────────────────────────────────────────────────────────
create table if not exists public.products (
  id           text primary key,             -- human-readable slug
  brand_id     text references public.brands (id) on delete set null,
  brand_name   text,                         -- denormalised for fast reads
  name         text not null,
  tagline      text,
  description  text,
  price        numeric(12, 2) not null,
  image_url    text,
  image_urls   text[],                       -- gallery images
  category     text,
  tag          text check (tag in ('Bestseller','New','Sale','Low Stock')),
  benefits     text[] not null default '{}',
  ingredients  text[] not null default '{}',
  concerns     text[] not null default '{}',
  stock        integer not null default 0,
  size         text,
  how_to_use   text,
  variants     jsonb,                        -- [{ label, price }]
  rating       numeric(3, 2) not null default 0,
  review_count integer not null default 0,
  is_published boolean not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create trigger products_updated_at
  before update on public.products
  for each row execute procedure public.set_updated_at();

-- Indexes for common filter patterns
create index if not exists products_brand_id   on public.products (brand_id);
create index if not exists products_category   on public.products (category);
create index if not exists products_tag        on public.products (tag);
create index if not exists products_published  on public.products (is_published);

-- Full-text search
create index if not exists products_fts on public.products
  using gin (to_tsvector('english', coalesce(name,'') || ' ' || coalesce(description,'') || ' ' || coalesce(brand_name,'')));

-- ── journals ─────────────────────────────────────────────────────────────────
create table if not exists public.journals (
  id           uuid primary key default uuid_generate_v4(),
  slug         text not null unique,
  title        text not null,
  excerpt      text,
  body         text,                          -- MDX/Markdown content
  cover_url    text,
  category     text,
  tags         text[] not null default '{}',
  author       text,
  author_image text,
  read_time    text,
  is_published boolean not null default true,
  published_at timestamptz,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create trigger journals_updated_at
  before update on public.journals
  for each row execute procedure public.set_updated_at();

-- ── deals / bundles ───────────────────────────────────────────────────────────
create table if not exists public.deals (
  id           text primary key,
  title        text not null,
  tagline      text,
  description  text,
  image_url    text,
  price        numeric(12, 2) not null,
  original_price numeric(12, 2),
  items        jsonb not null default '[]',   -- [{ productId, name, qty }]
  tag          text,
  is_active    boolean not null default true,
  valid_until  date,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create trigger deals_updated_at
  before update on public.deals
  for each row execute procedure public.set_updated_at();
