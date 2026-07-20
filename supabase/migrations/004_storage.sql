-- ─────────────────────────────────────────────────────────────────────────────
-- 004_storage.sql
-- Supabase Storage bucket + RLS policies for product images
-- Run AFTER 003_rls.sql (depends on the is_admin() function)
-- ─────────────────────────────────────────────────────────────────────────────

-- ── Create the product-images bucket ─────────────────────────────────────────
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'product-images',
  'product-images',
  true,                                      -- publicly readable via URL
  5242880,                                   -- 5 MB per file
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif']
)
on conflict (id) do nothing;

-- ── RLS policies ─────────────────────────────────────────────────────────────
-- NOTE: storage.objects usually already has RLS enabled on Supabase.
-- If you get "RLS not enabled" warnings, run:
--   alter table storage.objects enable row level security;

-- Anyone can view images in this bucket (needed for storefront product images)
create policy "product-images: public read"
  on storage.objects for select
  to public
  using (bucket_id = 'product-images');

-- Only admins can upload new images
create policy "product-images: admin insert"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'product-images' and public.is_admin());

-- Only admins can overwrite (upsert) images
create policy "product-images: admin update"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'product-images' and public.is_admin());

-- Only admins can delete images
create policy "product-images: admin delete"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'product-images' and public.is_admin());
