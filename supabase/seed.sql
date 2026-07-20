-- ─────────────────────────────────────────────────────────────────────────────
-- seed.sql
-- Initial data: brands, products, journals, deals
-- Run after migrations. Safe to re-run (uses ON CONFLICT DO NOTHING).
-- ─────────────────────────────────────────────────────────────────────────────

-- ── Brands ───────────────────────────────────────────────────────────────────
insert into public.brands (id, name, tagline) values
  ('cerave',         'CeraVe',          'Developed with dermatologists'),
  ('the-ordinary',   'The Ordinary',    'Clinical formulations with integrity'),
  ('la-roche-posay', 'La Roche-Posay',  'Recommended by dermatologists worldwide'),
  ('cosrx',          'COSRX',           'Korean skincare essentials'),
  ('neutrogena',     'Neutrogena',      'Dermatologist recommended'),
  ('paulas-choice',  'Paula''s Choice', 'Ingredient-focused formulas'),
  ('cetaphil',       'Cetaphil',        'Gentle care for all skin types'),
  ('bioderma',       'Bioderma',        'Pioneering dermocosmetics'),
  ('vichy',          'Vichy',           'Volcanic mineralising water'),
  ('hayda',          'HAYDA',           'Curated by HAYDA SKINCo.')
on conflict (id) do nothing;

-- ── Products ──────────────────────────────────────────────────────────────────
insert into public.products
  (id, brand_id, brand_name, name, tagline, description, price,
   image_url, image_urls, category, tag, benefits, ingredients, concerns,
   stock, size, rating, review_count, is_published)
values

('cerave-hydrating-cleanser', 'cerave', 'CeraVe',
 'Hydrating Facial Cleanser',
 'Gentle daily cleanser for normal to dry skin',
 'This gentle non-foaming cleanser is formulated with three essential ceramides and hyaluronic acid to help maintain the skin''s natural protective barrier while effectively removing dirt and makeup.',
 5500,
 '/product-cleanser.png',
 array['/product-cleanser.png', '/product-cream.png', '/product-toner.png'],
 'Cleansers', 'Bestseller',
 array['Cleanses without stripping', 'Maintains moisture barrier', 'Non-comedogenic', 'Fragrance-free'],
 array['Ceramides', 'Hyaluronic Acid', 'Glycerin'],
 array['Dry Skin', 'Sensitive Skin'],
 48, '237ml', 4.8, 342, true),

('ordinary-niacinamide', 'the-ordinary', 'The Ordinary',
 'Niacinamide 10% + Zinc 1%',
 'High-strength vitamin and mineral blemish formula',
 'A high-strength vitamin and mineral blemish formula that visibly addresses uneven skin tone, blemishes, and enlarged pores. Contains 10% niacinamide and 1% zinc PCA.',
 3800,
 '/product-serum.png',
 array['/product-serum.png', '/product-toner.png', '/product-oil.png'],
 'Serums', 'Bestseller',
 array['Reduces blemishes', 'Minimises pore appearance', 'Evens skin tone', 'Regulates sebum'],
 array['Niacinamide', 'Zinc PCA'],
 array['Acne', 'Oily Skin', 'Hyperpigmentation'],
 65, '30ml', 4.7, 512, true),

('ordinary-vitamin-c', 'the-ordinary', 'The Ordinary',
 'Vitamin C Suspension 23% + HA 2%',
 'Potent antioxidant brightening serum',
 'A potent brightening formula with 23% L-Ascorbic Acid and 2% Hyaluronic Acid Spheres to brighten the complexion and combat oxidative stress.',
 3600,
 '/product-serum.png',
 array['/product-serum.png', '/product-oil.png'],
 'Serums', 'Sale',
 array['Brightens complexion', 'Antioxidant protection', 'Reduces dark spots', 'Anti-ageing'],
 array['Vitamin C', 'Hyaluronic Acid'],
 array['Hyperpigmentation', 'Anti-Ageing'],
 30, '30ml', 4.5, 289, true),

('lrp-toleriane-moisturiser', 'la-roche-posay', 'La Roche-Posay',
 'Toleriane Double Repair Moisturiser',
 'Prebiotic moisturiser restores skin barrier',
 'Formulated with a prebiotic formula and niacinamide, this moisturiser instantly hydrates and repairs the skin''s natural barrier for up to 48 hours.',
 12500,
 '/product-cream.png',
 array['/product-cream.png', '/product-serum.png', '/product-toner.png'],
 'Moisturisers', 'Bestseller',
 array['48-hour hydration', 'Repairs skin barrier', 'Prebiotic formula', 'Fragrance-free'],
 array['Niacinamide', 'Ceramides', 'Glycerin'],
 array['Dry Skin', 'Sensitive Skin'],
 22, '75ml', 4.9, 198, true),

('cosrx-snail-mucin', 'cosrx', 'COSRX',
 'Advanced Snail 96 Mucin Power Essence',
 '96% snail secretion filtrate essence',
 'This essence contains 96% Snail Secretion Filtrate to heal blemishes and boost radiance. Lightweight formula absorbs quickly, improving moisture and elasticity.',
 8900,
 '/product-serum.png',
 array['/product-serum.png', '/product-toner.png'],
 'Serums', null,
 array['Heals blemishes', 'Boosts radiance', 'Improves elasticity', 'Lightweight'],
 array['Snail Secretion Filtrate', 'Hyaluronic Acid'],
 array['Acne', 'Dry Skin', 'Anti-Ageing'],
 35, '100ml', 4.8, 467, true),

('paulas-bha', 'paulas-choice', 'Paula''s Choice',
 'Skin Perfecting 2% BHA Liquid Exfoliant',
 'Leave-on exfoliant for blackheads & pores',
 'This leave-on exfoliant with 2% salicylic acid gently unclogs and minimises enlarged pores, removes dead skin on the surface and inside the pore, and smooths the skin.',
 18500,
 '/product-toner.png',
 array['/product-toner.png', '/product-serum.png', '/product-cleanser.png'],
 'Treatments', 'Bestseller',
 array['Unclogs pores', 'Smooths skin texture', 'Reduces blackheads', 'Anti-inflammatory'],
 array['AHA/BHA', 'Salicylic Acid', 'Methylpropanediol'],
 array['Acne', 'Oily Skin'],
 18, '118ml', 4.9, 623, true),

('lrp-anthelios-spf50', 'la-roche-posay', 'La Roche-Posay',
 'Anthelios UVMune 400 SPF 50+',
 'Invisible fluid broad-spectrum SPF 50+',
 'Lightweight invisible fluid sun protection with Mexoryl 400 technology providing exceptional UVA protection. Suitable for sensitive skin.',
 16000,
 '/product-cream.png',
 array['/product-cream.png', '/product-oil.png'],
 'Sunscreen', 'Bestseller',
 array['SPF 50+ protection', 'UVA/UVB broad spectrum', 'Lightweight invisible', 'Water resistant'],
 array['SPF', 'Mexoryl 400', 'Tinosorb S'],
 array['Anti-Ageing', 'Sensitive Skin'],
 40, '50ml', 4.7, 334, true),

('neutrogena-retinol', 'neutrogena', 'Neutrogena',
 'Rapid Wrinkle Repair Retinol Serum',
 'Accelerated retinol SA for visibly smoother skin',
 'An accelerated retinol formula with hyaluronic acid and glycerin that visibly reduces the look of fine lines and wrinkles in just one week.',
 11500,
 '/product-serum.png',
 array['/product-serum.png', '/product-oil.png', '/product-cream.png'],
 'Serums', 'Sale',
 array['Reduces fine lines', 'Smooths texture', 'Deep hydration', 'Clinically proven'],
 array['Retinol', 'Hyaluronic Acid', 'Glycerin'],
 array['Anti-Ageing'],
 25, '30ml', 4.5, 278, true),

('cerave-eye-repair', 'cerave', 'CeraVe',
 'Eye Repair Cream',
 'Gentle eye cream for dark circles & puffiness',
 'Formulated with ceramides and niacinamide to reduce the appearance of dark circles and puffiness around the delicate eye area.',
 5800,
 '/product-eye.png',
 array['/product-eye.png', '/product-cream.png'],
 'Eye Care', 'Sale',
 array['Reduces dark circles', 'Minimises puffiness', 'Ceramide-rich', 'Fragrance-free'],
 array['Ceramides', 'Niacinamide', 'Hyaluronic Acid'],
 array['Anti-Ageing', 'Dry Skin'],
 30, '14.2g', 4.6, 189, true),

('bioderma-sensibio', 'bioderma', 'Bioderma',
 'Sensibio H2O Micellar Water',
 'Original micellar cleansing water for sensitive skin',
 'The original micellar water that gently removes makeup, cleanses, and soothes even the most sensitive skin without rinsing.',
 9500,
 '/product-cleanser.png',
 array['/product-cleanser.png', '/product-toner.png', '/product-serum.png'],
 'Cleansers', 'Bestseller',
 array['Removes all makeup', 'Soothes sensitive skin', 'No rinse needed', 'pH-balanced'],
 array['Cucumber Extract', 'Fructooligosaccharides'],
 array['Sensitive Skin'],
 55, '500ml', 4.8, 445, true),

('ordinary-aha-bha', 'the-ordinary', 'The Ordinary',
 'AHA 30% + BHA 2% Peeling Solution',
 '10-minute exfoliating facial mask',
 'An exfoliating solution with 30% alpha hydroxy acids (AHA) and 2% beta hydroxy acid (BHA) to help visibly improve skin radiance and texture in just 10 minutes.',
 4800,
 '/product-toner.png',
 array['/product-toner.png', '/product-serum.png'],
 'Treatments', 'New',
 array['Deep exfoliation', 'Improved radiance', 'Reduced texture', 'Targets dark spots'],
 array['AHA/BHA', 'Glycolic Acid', 'Salicylic Acid', 'Vitamin C'],
 array['Hyperpigmentation', 'Acne', 'Anti-Ageing'],
 42, '30ml', 4.6, 512, true),

('cerave-moisturising-cream', 'cerave', 'CeraVe',
 'Moisturising Cream',
 'Rich 24-hour barrier cream for dry to very dry skin',
 'Rich, non-greasy cream with three essential ceramides and MVE technology for 24-hour hydration. Restores and maintains the skin''s natural barrier.',
 8900,
 '/product-cream.png',
 array['/product-cream.png', '/product-cleanser.png', '/product-serum.png'],
 'Moisturisers', 'Bestseller',
 array['24-hour hydration', 'Restores skin barrier', 'Non-greasy', 'Suitable for face & body'],
 array['Ceramides', 'Hyaluronic Acid', 'Petrolatum'],
 array['Dry Skin', 'Sensitive Skin'],
 60, '454g', 4.9, 789, true)

on conflict (id) do nothing;

-- ── Product variants (stored in jsonb on the products row) ───────────────────
update public.products
set variants = '[{"label":"237ml","price":5500},{"label":"473ml","price":9200},{"label":"1L","price":16500}]'
where id = 'cerave-hydrating-cleanser';

-- ── Journals ──────────────────────────────────────────────────────────────────
insert into public.journals
  (slug, title, excerpt, body, cover_url, category, tags, author, read_time, is_published, published_at)
values
(
  'art-of-layering-skincare-ritual',
  'The Art of Layering: How to Build Your Perfect Skincare Ritual',
  'Understanding the correct order to apply your skincare products can make the difference between a ritual that transforms and one that merely touches the surface.',
  E'Understanding the correct order to apply your skincare products can make the difference between a ritual that transforms and one that merely touches the surface.\n\n## Why Order Matters\n\nWhen it comes to skincare layering, the golden rule is to work from lightest to heaviest texture. This ensures each formula penetrates effectively without being blocked by heavier occlusive ingredients.\n\n## The HAYDA Method\n\n**Step 1: Cleanse**\nBegin with our Gentle Resurfacing Cleanser to remove impurities while maintaining your skin''s delicate moisture barrier. Massage in circular motions for 60 seconds.\n\n**Step 2: Tone**\nOur Lavender Calm Toner prepares the skin to receive active ingredients, balancing pH and delivering a first wave of hydration.\n\n**Step 3: Serum**\nApply the Radiance Renewal Serum to damp skin — the Vitamin C and hyaluronic acid penetrate most effectively at this stage.\n\n**Step 4: Eye Care**\nThe Illuminating Eye Concentrate should be applied with the ring finger, using gentle tapping motions around the orbital bone.\n\n**Step 5: Oil**\nA single drop of the Gold Infusion Face Oil pressed between palms and patted onto the face seals in the layers beneath.\n\n**Step 6: Moisturise**\nFinish with the Velvet Hydration Cream to lock in moisture and smooth the surface.\n\n*Allow 30 seconds between layers for optimal absorption.*',
  '/journal-ritual.png',
  'Rituals',
  array['layering', 'ritual', 'guide'],
  'HAYDA Editorial',
  '6',
  true,
  '2024-11-15T00:00:00Z'
),
(
  'vitamin-c-science-behind-glow',
  'Vitamin C: The Science Behind the Glow',
  'Not all Vitamin C is created equal. We explore the science of stabilised ascorbic acid and why temperature and formulation make all the difference.',
  E'Not all Vitamin C is created equal. We explore the science of stabilised ascorbic acid and why temperature and formulation make all the difference.\n\n## The Challenge with Vitamin C\n\nAscorbic acid — the pure form of Vitamin C — is notoriously unstable. Exposed to light, heat, or oxygen, it oxidises rapidly, turning orange and losing its efficacy.\n\n## How HAYDA SKINCo. Sources Vitamin C\n\nOur Radiance Renewal Serum uses a patented stabilisation method that encapsulates the ascorbic acid molecules until they come into contact with skin.\n\n## The Ferulic Acid Synergy\n\nCombined with Ferulic Acid, the effectiveness of Vitamin C is doubled.\n\n## What to Expect\n\nWith consistent daily use, most clients notice a measurable improvement in radiance within 3 weeks.',
  '/journal-ingredients.png',
  'Ingredients',
  array['vitamin c', 'ingredients', 'science'],
  'Dr. Sophie Renard',
  '8',
  true,
  '2024-10-28T00:00:00Z'
),
(
  'gold-skincare-ancient-wisdom-modern-science',
  'Gold in Skincare: Ancient Wisdom Meets Modern Science',
  'From Cleopatra''s legendary milk baths to today''s advanced 24k gold formulations, the precious metal has always held a place in beauty.',
  E'From Cleopatra''s legendary milk baths to today''s advanced 24k gold formulations, the precious metal has always held a place in beauty.\n\n## A History Written in Gold\n\nGold''s association with beauty and longevity stretches back millennia.\n\n## The Modern Science\n\nToday, we understand that gold nanoparticles can penetrate the dermis and stimulate cellular regeneration.\n\n## 24k in Practice\n\nOur Gold Infusion Face Oil suspends genuine 24k gold flakes in a base of cold-pressed marula and squalane.',
  '/journal-gold.png',
  'Ingredients',
  array['gold', 'luxury', 'history'],
  'HAYDA Editorial',
  '5',
  false,
  null
)
on conflict (slug) do nothing;

-- ── Deals / Bundles ───────────────────────────────────────────────────────────
-- Requires migration 005 (brand_name, highlight columns)
insert into public.deals
  (id, title, tagline, brand_name, tag, description, price, original_price, items, is_active, highlight)
values
(
  'barrier-repair',
  'Barrier Repair Bundle',
  'Complete daily routine for dry & sensitive skin',
  'CeraVe',
  'Save 17%',
  'Dry Skin · Sensitive Skin',
  18000, 21600,
  '[{"name":"Hydrating Facial Cleanser","size":"237ml","price":5500},{"name":"Moisturising Cream","size":"454g","price":8900},{"name":"Eye Repair Cream","size":"14.2g","price":7200}]'::jsonb,
  true, true
),
(
  'glow-starter',
  'Glow Starter Kit',
  'Targeted actives for brighter, clearer skin',
  'The Ordinary',
  'Save 18%',
  'Acne · Hyperpigmentation',
  10500, 12800,
  '[{"name":"Niacinamide 10% + Zinc 1%","size":"30ml","price":3800},{"name":"Vitamin C Suspension 23%","size":"30ml","price":4200},{"name":"AHA 30% + BHA 2% Peeling Solution","size":"30ml","price":4800}]'::jsonb,
  true, false
),
(
  'k-beauty',
  'K-Beauty Essentials',
  'Korean skincare trio for smooth, hydrated skin',
  'COSRX',
  'Save 17%',
  'Acne · Oily Skin',
  18000, 21600,
  '[{"name":"Snail 96 Mucin Power Essence","size":"100ml","price":8900},{"name":"BHA Blackhead Power Liquid","size":"100ml","price":7500},{"name":"Low pH Good Morning Cleanser","size":"150ml","price":5200}]'::jsonb,
  true, false
),
(
  'sun-protection',
  'SPF Essentials Duo',
  'Daily moisturiser + premium sunscreen',
  'La Roche-Posay',
  'Save 15%',
  'Anti-Ageing · Sensitive Skin',
  24200, 28500,
  '[{"name":"Toleriane Double Repair Moisturiser","size":"75ml","price":12500},{"name":"Anthelios UVMune 400 SPF 50+","size":"50ml","price":16000}]'::jsonb,
  true, false
),
(
  'acne-fighter',
  'Acne Fighter Kit',
  'Proven actives to clear breakouts and prevent scarring',
  'Mixed',
  'Save 20%',
  'Acne · Oily Skin',
  22200, 27800,
  '[{"name":"CeraVe Hydrating Cleanser","size":"237ml","price":5500},{"name":"The Ordinary Niacinamide 10%","size":"30ml","price":3800},{"name":"Paula''s Choice 2% BHA Liquid Exfoliant","size":"118ml","price":18500}]'::jsonb,
  true, false
),
(
  'anti-ageing',
  'Anti-Ageing Routine',
  'Retinol + SPF + vitamin C — the core trio',
  'Mixed',
  'Save 16%',
  'Anti-Ageing',
  29200, 34700,
  '[{"name":"Neutrogena Rapid Wrinkle Repair Serum","size":"30ml","price":14500},{"name":"The Ordinary Vitamin C 23%","size":"30ml","price":4200},{"name":"La Roche-Posay Anthelios SPF 50+","size":"50ml","price":16000}]'::jsonb,
  false, false
)
on conflict (id) do nothing;

-- ── Promo codes ───────────────────────────────────────────────────────────────
insert into public.promo_codes (code, discount_pct, max_uses, used_count, expires_at, is_active)
values
  ('HAYDA10',    10, null, 0, null, true),
  ('WELCOME15',  15, 500,  0, null, true),
  ('SKINCARE20', 20, 100,  0, (now() + interval '90 days'), true)
on conflict (code) do nothing;
