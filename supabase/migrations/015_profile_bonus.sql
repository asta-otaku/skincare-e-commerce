-- 015_profile_bonus.sql
-- One-time +100 points when profile has full_name + phone
-- Run after 009_customer_features.sql (needs points_ledger)

alter table public.profiles
  add column if not exists profile_bonus_claimed boolean not null default false;

create or replace function public.claim_profile_bonus()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  p public.profiles%rowtype;
begin
  if uid is null then
    return jsonb_build_object('ok', false, 'message', 'Not signed in');
  end if;

  select * into p from public.profiles where id = uid for update;
  if not found then
    return jsonb_build_object('ok', false, 'message', 'Profile not found');
  end if;

  if p.profile_bonus_claimed then
    return jsonb_build_object('ok', true, 'claimed', false, 'message', 'Already claimed');
  end if;

  if coalesce(trim(p.full_name), '') = '' or coalesce(trim(p.phone), '') = '' then
    return jsonb_build_object('ok', false, 'message', 'Name and phone required');
  end if;

  insert into public.points_ledger (user_id, delta, label)
  values (uid, 100, 'Completed profile');

  update public.profiles
  set profile_bonus_claimed = true,
      updated_at = now()
  where id = uid;

  return jsonb_build_object('ok', true, 'claimed', true, 'points', 100);
end;
$$;

grant execute on function public.claim_profile_bonus() to authenticated;
