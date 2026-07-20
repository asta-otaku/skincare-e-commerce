-- 005_deals_extra_columns.sql
-- Add brand_name + highlight columns used by the admin deals UI
-- Safe to re-run (IF NOT EXISTS)

alter table public.deals
  add column if not exists brand_name text;

alter table public.deals
  add column if not exists highlight boolean not null default false;
