-- ============================================================
-- Demo Test Data Seeder (RealEstate)
-- ============================================================
-- Inserts up to 100 items each for:
-- - public.listings
-- - public.listing_images (2 per listing)
-- - public.inquiries
-- - public.reviews
--
-- Notes:
-- - This script is intended to be run in Supabase SQL Editor.
-- - It deletes any previous rows created by this script using prefixes:
--   - listings.title starts with 'DEMO Listing #'
--   - inquiries.full_name starts with 'Demo Lead #'
--   - reviews.name starts with 'Demo Reviewer #'
--
-- How to use:
-- 1) Open Supabase -> SQL Editor
-- 2) Paste the whole file
-- 3) Run
-- ============================================================

-- Optional: reduce noise if you re-run the script
BEGIN;

-- Try to disable RLS for the tables we touch (recommended when available).
-- If you don't have permission, the inserts may fail—then re-run as a privileged user.
DO $$
BEGIN
  BEGIN EXECUTE 'ALTER TABLE public.reviews DISABLE ROW LEVEL SECURITY'; EXCEPTION WHEN others THEN NULL; END;
  BEGIN EXECUTE 'ALTER TABLE public.listings DISABLE ROW LEVEL SECURITY'; EXCEPTION WHEN others THEN NULL; END;
  BEGIN EXECUTE 'ALTER TABLE public.listing_images DISABLE ROW LEVEL SECURITY'; EXCEPTION WHEN others THEN NULL; END;
  BEGIN EXECUTE 'ALTER TABLE public.inquiries DISABLE ROW LEVEL SECURITY'; EXCEPTION WHEN others THEN NULL; END;
END $$;

-- ------------------------------------------------------------
-- Cleanup old demo rows (safe to re-run)
-- ------------------------------------------------------------
DELETE FROM public.listing_images
WHERE listing_id IN (
  SELECT id FROM public.listings WHERE title LIKE 'DEMO Listing #%'
);

DELETE FROM public.listings WHERE title LIKE 'DEMO Listing #%';

DELETE FROM public.inquiries WHERE full_name LIKE 'Demo Lead #%';

DELETE FROM public.reviews WHERE name LIKE 'Demo Reviewer #%';

-- ------------------------------------------------------------
-- Ensure some agents exist (required for listings)
-- ------------------------------------------------------------
INSERT INTO public.agents (
  full_name, slug, title, phone, email, bio, specialties, city, years_experience, profile_image_url, is_active
)
VALUES
  (
    'Demo Alessandra Russo',
    'demo-alessandra-russo',
    'Senior Advisor, Luxury Estates',
    '+1 (212) 555-0114',
    'demo.alessandra@montelibano.example',
    'Demo agent for UI testing (inserted by seed_demo_test_data.sql).',
    ARRAY['Luxury Estates','Off-market Sales','Townhomes'],
    'New York',
    12,
    NULL,
    true
  ),
  (
    'Demo Giovanni Bellini',
    'demo-giovanni-bellini',
    'Investment Advisory Lead',
    '+1 (212) 555-0140',
    'demo.giovanni@montelibano.example',
    'Demo agent for UI testing (inserted by seed_demo_test_data.sql).',
    ARRAY['Investments','Portfolio Advisory','High-yield Assets'],
    'Palm Beach',
    9,
    NULL,
    true
  ),
  (
    'Demo Sofia Marzano',
    'demo-sofia-marzano',
    'Broker, Waterfront & Rentals',
    '+1 (212) 555-0168',
    'demo.sofia@montelibano.example',
    'Demo agent for UI testing (inserted by seed_demo_test_data.sql).',
    ARRAY['Luxury Rentals','Waterfront','Relocation'],
    'Palm Beach',
    7,
    NULL,
    true
  )
ON CONFLICT (slug) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  title = EXCLUDED.title,
  phone = EXCLUDED.phone,
  email = EXCLUDED.email,
  bio = EXCLUDED.bio,
  specialties = EXCLUDED.specialties,
  city = EXCLUDED.city,
  years_experience = EXCLUDED.years_experience,
  profile_image_url = EXCLUDED.profile_image_url,
  is_active = EXCLUDED.is_active;

-- ------------------------------------------------------------
-- Seed listings (100)
-- ------------------------------------------------------------
WITH
  gen AS (SELECT generate_series(1, 100) AS i),
  agent_pick AS (
    SELECT id, row_number() OVER (ORDER BY created_at DESC) AS rn
    FROM public.agents
    WHERE is_active = true
  ),
  agent_count AS (
    SELECT GREATEST(COUNT(*), 1)::int AS n FROM public.agents WHERE is_active = true
  )
INSERT INTO public.listings (
  title, price, location, beds, baths, sqft, type, status, description, image_url, agent_id
)
SELECT
  'DEMO Listing #' || gen.i,
  (2500000 + (gen.i * 85000))::numeric,
  (ARRAY[
    'New York, NY',
    'Palm Beach, FL',
    'Miami, FL',
    'San Francisco, CA',
    'Los Angeles, CA',
    'Boston, MA'
  ])[ (gen.i - 1) % 6 + 1 ],
  (2 + (gen.i % 6)),
  (2 + ((gen.i + 2) % 5)),
  (900 + (gen.i * 120))::int,
  (ARRAY[
    'Penthouse',
    'Estate',
    'Waterfront',
    'Townhome',
    'Condo',
    'Villa'
  ])[ (gen.i - 1) % 6 + 1 ],
  'For Sale',
  'Demo luxury property used to test the RealEstate UI. Includes gallery images, inquiries, and review examples.',
  'https://picsum.photos/seed/demo-listing-' || gen.i || '-1/1200/900',
  (
    SELECT ap.id
    FROM agent_pick ap, agent_count ac
    WHERE ap.rn = ((gen.i - 1) % ac.n) + 1
    LIMIT 1
  )
FROM gen;

-- ------------------------------------------------------------
-- Seed listing images (2 per listing = up to 200 rows)
-- ------------------------------------------------------------
WITH gen AS (SELECT generate_series(1, 100) AS i),
     img AS (SELECT generate_series(1, 2) AS j)
INSERT INTO public.listing_images (
  listing_id, image_url, image_path, sort_order
)
SELECT
  l.id,
  'https://picsum.photos/seed/demo-listing-' || g.i || '-img-' || g2.j || '/1200/900',
  NULL,
  g2.j
FROM gen g
CROSS JOIN img g2
JOIN public.listings l
  ON l.title = 'DEMO Listing #' || g.i;

-- ------------------------------------------------------------
-- Seed inquiries (100)
-- ------------------------------------------------------------
WITH
  gen AS (SELECT generate_series(1, 100) AS i),
  listing_pick AS (
    SELECT id, row_number() OVER (ORDER BY created_at DESC) AS rn
    FROM public.listings
    WHERE title LIKE 'DEMO Listing #%'
  ),
  listing_count AS (
    SELECT GREATEST(COUNT(*), 1)::int AS n
    FROM public.listings
    WHERE title LIKE 'DEMO Listing #%'
  )
INSERT INTO public.inquiries (
  full_name,
  email,
  phone,
  message,
  property_id,
  property_title_snapshot,
  agent_id,
  inquiry_type,
  status,
  read,
  archived
)
SELECT
  'Demo Lead #' || gen.i,
  'demo-lead-' || gen.i || '@example.com',
  CASE WHEN gen.i % 3 = 0 THEN '+1 (212) 555-01' || LPAD((gen.i % 1000)::text, 3, '0') ELSE NULL END,
  'Demo inquiry #' || gen.i || ': I am interested in discussing availability and next steps for your luxury real estate. Please share timing, pricing guidance, and whether there are similar alternatives.',
  lp.id,
  l.title,
  l.agent_id,
  (CASE WHEN gen.i % 2 = 0 THEN 'property_inquiry' ELSE 'general_inquiry' END)::text,
  (CASE
    WHEN gen.i % 4 = 0 THEN 'new'
    WHEN gen.i % 4 = 1 THEN 'in_review'
    WHEN gen.i % 4 = 2 THEN 'contacted'
    ELSE 'closed'
  END)::text,
  false,
  false
FROM gen
JOIN listing_count lc ON TRUE
JOIN listing_pick lp
  ON lp.rn = ((gen.i - 1) % lc.n) + 1
JOIN public.listings l ON l.id = lp.id;

-- ------------------------------------------------------------
-- Seed reviews (100)
-- - 80 approved (shows on public pages)
-- - 20 pending (tests admin review filtering)
-- ------------------------------------------------------------
WITH gen AS (SELECT generate_series(1, 100) AS i)
INSERT INTO public.reviews (
  name, email, rating, message, status
)
SELECT
  'Demo Reviewer #' || gen.i,
  'demo-reviewer-' || gen.i || '@example.com',
  (1 + (gen.i % 5))::int,
  'Demo review #' || gen.i || ': Excellent communication and a seamless experience throughout the luxury buying process. I especially appreciated the attention to detail and follow-through.',
  (CASE WHEN gen.i <= 80 THEN 'approved' ELSE 'pending' END)::text
FROM gen;

-- Re-enable RLS (best practice if we managed to disable it)
DO $$
BEGIN
  BEGIN EXECUTE 'ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY'; EXCEPTION WHEN others THEN NULL; END;
  BEGIN EXECUTE 'ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY'; EXCEPTION WHEN others THEN NULL; END;
  BEGIN EXECUTE 'ALTER TABLE public.listing_images ENABLE ROW LEVEL SECURITY'; EXCEPTION WHEN others THEN NULL; END;
  BEGIN EXECUTE 'ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY'; EXCEPTION WHEN others THEN NULL; END;
END $$;

COMMIT;

-- ============================================================
-- End
-- ============================================================

