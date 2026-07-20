-- 014_comms.sql
-- Newsletter, contact, wholesale inbox + WELCOME10 promo
-- Run after 013_admin_users.sql (needs is_admin())

-- ── newsletter_subscribers ────────────────────────────────────────────────────
create table if not exists public.newsletter_subscribers (
  id             uuid primary key default uuid_generate_v4(),
  email          text not null,
  source         text not null default 'site',
  discount_code  text not null default 'WELCOME10',
  created_at     timestamptz not null default now(),
  constraint newsletter_subscribers_email_unique unique (email)
);

create index if not exists newsletter_subscribers_created_at_idx
  on public.newsletter_subscribers (created_at desc);

alter table public.newsletter_subscribers enable row level security;

drop policy if exists "newsletter: public insert" on public.newsletter_subscribers;
create policy "newsletter: public insert"
  on public.newsletter_subscribers for insert
  with check (true);

drop policy if exists "newsletter: admin read" on public.newsletter_subscribers;
create policy "newsletter: admin read"
  on public.newsletter_subscribers for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('admin', 'staff')
    )
  );

-- ── contact_submissions ───────────────────────────────────────────────────────
create table if not exists public.contact_submissions (
  id         uuid primary key default uuid_generate_v4(),
  name       text not null,
  email      text not null,
  subject    text not null default '',
  message    text not null,
  created_at timestamptz not null default now()
);

create index if not exists contact_submissions_created_at_idx
  on public.contact_submissions (created_at desc);

alter table public.contact_submissions enable row level security;

drop policy if exists "contact: public insert" on public.contact_submissions;
create policy "contact: public insert"
  on public.contact_submissions for insert
  with check (true);

drop policy if exists "contact: admin read" on public.contact_submissions;
create policy "contact: admin read"
  on public.contact_submissions for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('admin', 'staff')
    )
  );

-- ── wholesale_enquiries ───────────────────────────────────────────────────────
create table if not exists public.wholesale_enquiries (
  id         uuid primary key default uuid_generate_v4(),
  name       text not null,
  business   text not null,
  email      text not null,
  phone      text not null default '',
  type       text not null default '',
  volume     text not null default '',
  message    text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists wholesale_enquiries_created_at_idx
  on public.wholesale_enquiries (created_at desc);

alter table public.wholesale_enquiries enable row level security;

drop policy if exists "wholesale: public insert" on public.wholesale_enquiries;
create policy "wholesale: public insert"
  on public.wholesale_enquiries for insert
  with check (true);

drop policy if exists "wholesale: admin read" on public.wholesale_enquiries;
create policy "wholesale: admin read"
  on public.wholesale_enquiries for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('admin', 'staff')
    )
  );

-- ── WELCOME10 promo (10% newsletter welcome) ──────────────────────────────────
insert into public.promo_codes (code, discount_pct, discount_ngn, max_uses, used_count, is_active)
values ('WELCOME10', 10, null, null, 0, true)
on conflict (code) do nothing;
