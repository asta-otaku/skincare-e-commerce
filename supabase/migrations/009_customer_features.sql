-- 009_customer_features.sql
-- Wishlist, reviews, loyalty points. Run after 008_guest_order_claim.sql

-- ── promo: optional fixed ₦ discount (reward redemptions) ─────────────────────
alter table public.promo_codes
  add column if not exists discount_ngn integer;

alter table public.promo_codes drop constraint if exists promo_codes_discount_pct_check;
alter table public.promo_codes alter column discount_pct drop not null;
alter table public.promo_codes
  add constraint promo_codes_discount_pct_check
  check (discount_pct is null or (discount_pct > 0 and discount_pct <= 100));

alter table public.promo_codes drop constraint if exists promo_codes_discount_ngn_check;
alter table public.promo_codes
  add constraint promo_codes_discount_ngn_check
  check (discount_ngn is null or discount_ngn > 0);

alter table public.promo_codes drop constraint if exists promo_codes_discount_kind;
alter table public.promo_codes
  add constraint promo_codes_discount_kind
  check (
    (discount_pct is not null and discount_ngn is null)
    or (discount_pct is null and discount_ngn is not null)
  );

-- ── wishlist ──────────────────────────────────────────────────────────────────
create table if not exists public.wishlist (
  user_id    uuid not null references public.profiles (id) on delete cascade,
  product_id text not null references public.products (id) on delete cascade,
  added_at   timestamptz not null default now(),
  primary key (user_id, product_id)
);

alter table public.wishlist enable row level security;

drop policy if exists "wishlist: owner all" on public.wishlist;
create policy "wishlist: owner all"
  on public.wishlist for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ── reviews ───────────────────────────────────────────────────────────────────
create table if not exists public.reviews (
  id            uuid primary key default uuid_generate_v4(),
  product_id    text not null references public.products (id) on delete cascade,
  user_id       uuid references public.profiles (id) on delete set null,
  author_name   text not null,
  rating        integer not null check (rating between 1 and 5),
  title         text not null default '',
  body          text not null default '',
  verified      boolean not null default false,
  helpful_count integer not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

drop trigger if exists reviews_updated_at on public.reviews;
create trigger reviews_updated_at
  before update on public.reviews
  for each row execute procedure public.set_updated_at();

create index if not exists reviews_product_id on public.reviews (product_id);
create index if not exists reviews_user_id on public.reviews (user_id);
create unique index if not exists reviews_one_per_user_product
  on public.reviews (user_id, product_id)
  where user_id is not null;

alter table public.reviews enable row level security;

drop policy if exists "reviews: public read" on public.reviews;
create policy "reviews: public read"
  on public.reviews for select using (true);

drop policy if exists "reviews: auth insert" on public.reviews;
create policy "reviews: auth insert"
  on public.reviews for insert with check (auth.uid() = user_id);

drop policy if exists "reviews: owner update" on public.reviews;
create policy "reviews: owner update"
  on public.reviews for update using (auth.uid() = user_id);

drop policy if exists "reviews: owner delete" on public.reviews;
create policy "reviews: owner delete"
  on public.reviews for delete using (auth.uid() = user_id);

drop policy if exists "reviews: admin all" on public.reviews;
create policy "reviews: admin all"
  on public.reviews for all
  using (public.is_admin()) with check (public.is_admin());

-- ── review_helpful ────────────────────────────────────────────────────────────
create table if not exists public.review_helpful (
  review_id  uuid not null references public.reviews (id) on delete cascade,
  user_id    uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (review_id, user_id)
);

alter table public.review_helpful enable row level security;

drop policy if exists "review_helpful: read" on public.review_helpful;
create policy "review_helpful: read"
  on public.review_helpful for select using (true);

drop policy if exists "review_helpful: insert own" on public.review_helpful;
create policy "review_helpful: insert own"
  on public.review_helpful for insert with check (auth.uid() = user_id);

drop policy if exists "review_helpful: delete own" on public.review_helpful;
create policy "review_helpful: delete own"
  on public.review_helpful for delete using (auth.uid() = user_id);

-- ── points_ledger ─────────────────────────────────────────────────────────────
create table if not exists public.points_ledger (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid not null references public.profiles (id) on delete cascade,
  delta      integer not null,
  label      text not null,
  order_id   uuid references public.orders (id) on delete set null,
  review_id  uuid references public.reviews (id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists points_ledger_user on public.points_ledger (user_id, created_at desc);

create unique index if not exists points_ledger_order_earn
  on public.points_ledger (order_id)
  where order_id is not null and delta > 0;

create unique index if not exists points_ledger_review_earn
  on public.points_ledger (review_id)
  where review_id is not null and delta > 0;

alter table public.points_ledger enable row level security;

drop policy if exists "points: owner read" on public.points_ledger;
create policy "points: owner read"
  on public.points_ledger for select using (auth.uid() = user_id);

drop policy if exists "points: admin all" on public.points_ledger;
create policy "points: admin all"
  on public.points_ledger for all
  using (public.is_admin()) with check (public.is_admin());

-- ── reward_redemptions ────────────────────────────────────────────────────────
create table if not exists public.reward_redemptions (
  id           uuid primary key default uuid_generate_v4(),
  user_id      uuid not null references public.profiles (id) on delete cascade,
  reward_id    text not null,
  promo_code   text references public.promo_codes (code) on delete set null,
  points_spent integer not null,
  redeemed_at  timestamptz not null default now()
);

alter table public.reward_redemptions enable row level security;

drop policy if exists "redemptions: owner read" on public.reward_redemptions;
create policy "redemptions: owner read"
  on public.reward_redemptions for select using (auth.uid() = user_id);

drop policy if exists "redemptions: admin all" on public.reward_redemptions;
create policy "redemptions: admin all"
  on public.reward_redemptions for all
  using (public.is_admin()) with check (public.is_admin());

-- ── Refresh product rating aggregates ─────────────────────────────────────────
create or replace function public.refresh_product_rating(p_product_id text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.products
  set
    rating = coalesce((
      select round(avg(rating)::numeric, 2) from public.reviews where product_id = p_product_id
    ), 0),
    review_count = (
      select count(*)::integer from public.reviews where product_id = p_product_id
    ),
    updated_at = now()
  where id = p_product_id;
end;
$$;

create or replace function public.trg_reviews_refresh_rating()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'DELETE' then
    perform public.refresh_product_rating(old.product_id);
    return old;
  end if;
  perform public.refresh_product_rating(new.product_id);
  return new;
end;
$$;

drop trigger if exists reviews_refresh_rating on public.reviews;
create trigger reviews_refresh_rating
  after insert or update or delete on public.reviews
  for each row execute procedure public.trg_reviews_refresh_rating();

-- ── Helpful vote ──────────────────────────────────────────────────────────────
create or replace function public.mark_review_helpful(p_review_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  cnt integer;
begin
  if uid is null then
    return jsonb_build_object('ok', false, 'message', 'Sign in required');
  end if;

  insert into public.review_helpful (review_id, user_id)
  values (p_review_id, uid)
  on conflict do nothing;

  update public.reviews r
  set helpful_count = (
    select count(*)::integer from public.review_helpful h where h.review_id = r.id
  )
  where r.id = p_review_id
  returning helpful_count into cnt;

  return jsonb_build_object('ok', true, 'helpful_count', coalesce(cnt, 0));
end;
$$;

grant execute on function public.mark_review_helpful(uuid) to authenticated;

-- ── Award points when order is paid (1 pt / ₦10) ──────────────────────────────
create or replace function public.award_order_points(p_order public.orders)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  pts integer;
begin
  if p_order.user_id is null then
    return;
  end if;
  if exists (
    select 1 from public.points_ledger
    where order_id = p_order.id and delta > 0
  ) then
    return;
  end if;

  pts := greatest(1, floor(p_order.total / 100)::integer);
  insert into public.points_ledger (user_id, delta, label, order_id)
  values (p_order.user_id, pts, 'Order ' || p_order.reference, p_order.id);
end;
$$;

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
    set used_count = used_count + 1
    where code = o.promo_code;
  end if;

  perform public.award_order_points(o);

  return jsonb_build_object('ok', true);
end;
$$;

-- ── Redeem reward → one-use promo code ────────────────────────────────────────
create or replace function public.redeem_reward(
  p_reward_id text,
  p_points_cost integer,
  p_discount_ngn integer,
  p_label text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  bal integer;
  code text;
begin
  if uid is null then
    return jsonb_build_object('ok', false, 'message', 'Sign in required');
  end if;
  if p_points_cost is null or p_points_cost <= 0 or p_discount_ngn is null or p_discount_ngn <= 0 then
    return jsonb_build_object('ok', false, 'message', 'Invalid reward');
  end if;

  select coalesce(sum(delta), 0)::integer into bal
  from public.points_ledger where user_id = uid;

  if bal < p_points_cost then
    return jsonb_build_object('ok', false, 'message', 'Not enough points');
  end if;

  code := 'RWD-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 10));

  insert into public.promo_codes (code, discount_pct, discount_ngn, max_uses, used_count, is_active)
  values (code, null, p_discount_ngn, 1, 0, true);

  insert into public.points_ledger (user_id, delta, label)
  values (uid, -p_points_cost, 'Redeemed: ' || coalesce(p_label, p_reward_id));

  insert into public.reward_redemptions (user_id, reward_id, promo_code, points_spent)
  values (uid, p_reward_id, code, p_points_cost);

  return jsonb_build_object('ok', true, 'promo_code', code, 'discount_ngn', p_discount_ngn);
end;
$$;

grant execute on function public.redeem_reward(text, integer, integer, text) to authenticated;

-- ── Submit / upsert review + optional +50 pts ─────────────────────────────────
create or replace function public.submit_review(
  p_product_id text,
  p_rating integer,
  p_title text,
  p_body text,
  p_author_name text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  is_verified boolean := false;
  new_id uuid;
  name text;
  is_new boolean := false;
begin
  if uid is null then
    return jsonb_build_object('ok', false, 'message', 'Sign in required');
  end if;
  if p_rating is null or p_rating < 1 or p_rating > 5 then
    return jsonb_build_object('ok', false, 'message', 'Invalid rating');
  end if;

  select exists (
    select 1 from public.orders o
    where o.user_id = uid
      and o.payment_status = 'paid'
      and exists (
        select 1 from jsonb_array_elements(o.items) item
        where item->>'productId' = p_product_id
      )
  ) into is_verified;

  select coalesce(
    nullif(trim(p_author_name), ''),
    (select coalesce(nullif(full_name, ''), nullif(first_name, ''), split_part(email, '@', 1))
     from public.profiles where id = uid),
    'Customer'
  ) into name;

  if exists (select 1 from public.reviews where user_id = uid and product_id = p_product_id) then
    update public.reviews
    set rating = p_rating,
        title = coalesce(p_title, ''),
        body = coalesce(p_body, ''),
        author_name = name,
        verified = is_verified,
        updated_at = now()
    where user_id = uid and product_id = p_product_id
    returning id into new_id;
  else
    insert into public.reviews (product_id, user_id, author_name, rating, title, body, verified)
    values (p_product_id, uid, name, p_rating, coalesce(p_title, ''), coalesce(p_body, ''), is_verified)
    returning id into new_id;
    is_new := true;
  end if;

  if is_new and not exists (
    select 1 from public.points_ledger where review_id = new_id and delta > 0
  ) then
    insert into public.points_ledger (user_id, delta, label, review_id)
    values (uid, 50, 'Product review', new_id);
  end if;

  return jsonb_build_object('ok', true, 'id', new_id, 'verified', is_verified);
end;
$$;

grant execute on function public.submit_review(text, integer, text, text, text) to authenticated;
