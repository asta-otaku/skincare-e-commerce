-- 006_profile_preferences.sql
-- Notification preferences JSON on profiles
-- Safe to re-run

alter table public.profiles
  add column if not exists preferences jsonb not null
  default '{"newsletter":true,"orderUpdates":true,"newProducts":false,"saleAlerts":true}'::jsonb;
