-- Category sections (e.g. Face, Bath and Body) + subcategories for product catalog.

create table if not exists public.category_sections (
  id         text primary key,
  name       text not null,
  slug       text not null unique,
  sort_order integer not null default 0,
  is_active  boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.categories (
  id         text primary key,
  section_id text not null references public.category_sections (id) on delete cascade,
  name       text not null,
  slug       text not null unique,
  sort_order integer not null default 0,
  is_active  boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists categories_section_id on public.categories (section_id, sort_order);

drop trigger if exists category_sections_updated_at on public.category_sections;
create trigger category_sections_updated_at
  before update on public.category_sections
  for each row execute procedure public.set_updated_at();

drop trigger if exists categories_updated_at on public.categories;
create trigger categories_updated_at
  before update on public.categories
  for each row execute procedure public.set_updated_at();

alter table public.category_sections enable row level security;
alter table public.categories enable row level security;

drop policy if exists "category_sections: public read" on public.category_sections;
create policy "category_sections: public read"
  on public.category_sections for select using (true);

drop policy if exists "category_sections: admin write" on public.category_sections;
create policy "category_sections: admin write"
  on public.category_sections for all
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "categories: public read" on public.categories;
create policy "categories: public read"
  on public.categories for select using (true);

drop policy if exists "categories: admin write" on public.categories;
create policy "categories: admin write"
  on public.categories for all
  using (public.is_admin()) with check (public.is_admin());

-- Seed default tree (idempotent)
insert into public.category_sections (id, name, slug, sort_order) values
  ('face', 'Face', 'face', 1),
  ('bath-and-body', 'Bath and Body', 'bath-and-body', 2),
  ('perfume', 'Perfume', 'perfume', 3)
on conflict (id) do update set
  name = excluded.name,
  slug = excluded.slug,
  sort_order = excluded.sort_order;

insert into public.categories (id, section_id, name, slug, sort_order) values
  -- Face
  ('cleansing-oils-balms', 'face', 'Cleansing Oils & Balms', 'cleansing-oils-balms', 1),
  ('eye-creams-treatments', 'face', 'Eye Creams & Treatments', 'eye-creams-treatments', 2),
  ('exfoliators-peels-scrubs', 'face', 'Exfoliators, Peels & Scrubs', 'exfoliators-peels-scrubs', 3),
  ('face-cleansers-wash', 'face', 'Face Cleansers & Wash', 'face-cleansers-wash', 4),
  ('face-mask', 'face', 'Face Mask', 'face-mask', 5),
  ('face-moisturizers', 'face', 'Face Moisturizers', 'face-moisturizers', 6),
  ('face-toners-mists', 'face', 'Face Toners & Mists', 'face-toners-mists', 7),
  ('lipbalm-lip-oils', 'face', 'Lipbalm & Lip Oils', 'lipbalm-lip-oils', 8),
  ('micellar-water', 'face', 'Micellar Water', 'micellar-water', 9),
  ('serums-treatment', 'face', 'Serums & Treatment', 'serums-treatment', 10),
  ('sunscreens', 'face', 'Sunscreens', 'sunscreens', 11),
  -- Bath and Body
  ('body-moisturizers-oils', 'bath-and-body', 'Body Moisturizers & Oils', 'body-moisturizers-oils', 1),
  ('body-scrubs', 'bath-and-body', 'Body Scrubs', 'body-scrubs', 2),
  ('body-wash', 'bath-and-body', 'Body Wash', 'body-wash', 3),
  ('cleansing-bar', 'bath-and-body', 'Cleansing Bar', 'cleansing-bar', 4),
  ('hand-cream', 'bath-and-body', 'Hand Cream', 'hand-cream', 5),
  ('personal-care', 'bath-and-body', 'Personal Care', 'personal-care', 6),
  -- Perfume
  ('body-mist-and-spray', 'perfume', 'Body mist and spray', 'body-mist-and-spray', 1),
  ('roll-on', 'perfume', 'Roll on', 'roll-on', 2)
on conflict (id) do update set
  section_id = excluded.section_id,
  name = excluded.name,
  slug = excluded.slug,
  sort_order = excluded.sort_order;
