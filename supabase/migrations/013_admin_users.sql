-- 013_admin_users.sql
-- Profile suspension flag + admin can update any profile (role / suspend).
-- Run after 003_rls.sql

alter table public.profiles
  add column if not exists is_suspended boolean not null default false;

drop policy if exists "profiles: admin update" on public.profiles;
create policy "profiles: admin update"
  on public.profiles for update
  using (public.is_admin())
  with check (public.is_admin());
