-- ============================================================
-- Realistic Demo Test Data Seeder (RealEstate) - v2
-- ============================================================
-- Upserts/replaces demo content for UI testing:
-- - listings (100)
-- - listing_images (2 per listing)
-- - inquiries (100)
-- - reviews (100)
--
-- Photo URLs:
-- - Uses Unsplash Source queries so images are real and building-related.
--
-- How to use:
-- 1) Supabase -> SQL Editor
-- 2) Paste entire file
-- 3) Run
--
-- This script is safe to re-run: it deletes rows tagged with MARKER.
-- ============================================================

BEGIN;

DO $$
BEGIN
  BEGIN EXECUTE 'ALTER TABLE public.reviews DISABLE ROW LEVEL SECURITY'; EXCEPTION WHEN others THEN NULL; END;
  BEGIN EXECUTE 'ALTER TABLE public.listings DISABLE ROW LEVEL SECURITY'; EXCEPTION WHEN others THEN NULL; END;
  BEGIN EXECUTE 'ALTER TABLE public.listing_images DISABLE ROW LEVEL SECURITY'; EXCEPTION WHEN others THEN NULL; END;
  BEGIN EXECUTE 'ALTER TABLE public.inquiries DISABLE ROW LEVEL SECURITY'; EXCEPTION WHEN others THEN NULL; END;
END $$;

-- Unique marker used for cleanup on re-runs
DO $$
DECLARE marker TEXT := 'SEED_DEMO_REALISTIC_DATA_V2';
BEGIN
  DELETE FROM public.listing_images
  WHERE listing_id IN (
    SELECT id FROM public.listings WHERE description ILIKE '%' || marker || '%'
  );

  DELETE FROM public.listings WHERE description ILIKE '%' || marker || '%';
  DELETE FROM public.inquiries WHERE message ILIKE '%' || marker || '%';
  DELETE FROM public.reviews WHERE message ILIKE '%' || marker || '%';
END $$;

-- ------------------------------------------------------------
-- Ensure some agents exist (required for listings)
-- ------------------------------------------------------------
INSERT INTO public.agents (
  full_name, slug, title, phone, email, bio, specialties, city, years_experience, profile_image_url, is_active
)
VALUES
  (
    'Alessandra Russo',
    'alessandra-russo',
    'Senior Advisor, Luxury Estates',
    '+1 (212) 555-0114',
    'alessandra@montelibano.example',
    'Known for discretion and deal execution across prime Manhattan and beyond.',
    ARRAY['Luxury Estates', 'Off-market Sales', 'Townhomes'],
    'New York',
    12,
    NULL,
    true
  ),
  (
    'Giovanni Bellini',
    'giovanni-bellini',
    'Investment Advisory Lead',
    '+1 (212) 555-0140',
    'giovanni@montelibano.example',
    'Specializes in investment-grade opportunities with data-driven strategy and discreet execution.',
    ARRAY['Investments', 'Portfolio Advisory', 'High-yield Assets'],
    'Palm Beach',
    9,
    NULL,
    true
  ),
  (
    'Sofia Marzano',
    'sofia-marzano',
    'Broker, Waterfront & Rentals',
    '+1 (212) 555-0168',
    'sofia@montelibano.example',
    'Focused on waterfront rentals and relocation guidance — private, efficient, and detail-forward.',
    ARRAY['Luxury Rentals', 'Waterfront', 'Relocation'],
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
  is_active = EXCLUDED.is_active;

-- ------------------------------------------------------------
-- Seed listings (100)
-- ------------------------------------------------------------
WITH
  gen AS (SELECT generate_series(1, 100) AS i),
  cities AS (
    SELECT ARRAY[
      'New York, NY',
      'Palm Beach, FL',
      'Miami, FL',
      'San Francisco, CA',
      'Los Angeles, CA',
      'Boston, MA'
    ] AS arr
  ),
  types_arr AS (
    SELECT ARRAY[
      'Penthouse',
      'Estate',
      'Villa',
      'Townhouse',
      'Condo',
      'Waterfront'
    ] AS arr
  ),
  type_keywords AS (
    -- Index-aligned with `types_arr.arr`
    SELECT ARRAY[
      'luxury,penthouse,skyline,city-view',
      'luxury,estate,mansion,private-garden',
      'luxury,villa,mediterranean,ocean-view',
      'luxury,townhouse,classic-architecture,city-center',
      'luxury,condo,modern,city-lights',
      'luxury,waterfront,coastal,marina-view'
    ] AS arr
  ),
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
  CASE
    WHEN l_type = 'Penthouse' THEN 'The ' || split_part(l_city, ',', 1) || ' Skyline Penthouse'
    WHEN l_type = 'Estate' THEN 'Grand ' || split_part(l_city, ',', 1) || ' Estate Retreat'
    WHEN l_type = 'Villa' THEN 'Mediterranean Villa in ' || split_part(l_city, ',', 1)
    WHEN l_type = 'Townhouse' THEN split_part(l_city, ',', 1) || ' Classic Townhome'
    WHEN l_type = 'Condo' THEN 'Luxury ' || split_part(l_city, ',', 1) || ' Sky Residence'
    WHEN l_type = 'Waterfront' THEN 'Waterfront Residence in ' || split_part(l_city, ',', 1)
    ELSE 'Luxury Property'
  END AS title,
  (2500000 + (gen.i * 85000))::numeric AS price,
  l_city AS location,
  (2 + (gen.i % 6))::int AS beds,
  (2 + ((gen.i + 2) % 5))::int AS baths,
  (900 + (gen.i * 120))::int AS sqft,
  l_type AS type,
  CASE
    WHEN gen.i % 11 = 0 THEN 'Featured'
    WHEN gen.i % 7 = 0 THEN 'For Rent'
    WHEN gen.i % 17 = 0 THEN 'Sold'
    ELSE 'For Sale'
  END AS status,
  'Realistic seeded listing for UI testing. ' ||
  'Includes gallery images, inquiries, and review examples. ' ||
  'SEED_DEMO_REALISTIC_DATA_V2' AS description,
  -- Deterministic stable images (picsum uses a fixed id; no redirects/quirky query parsing)
  'https://picsum.photos/id/' || ((gen.i % 1000) + 1)::text || '/1200/900' AS image_url,
  (
    SELECT ap.id
    FROM agent_pick ap, agent_count ac
    WHERE ap.rn = ((gen.i - 1) % ac.n) + 1
    LIMIT 1
  ) AS agent_id
FROM gen
JOIN cities c ON TRUE
JOIN types_arr ta ON TRUE
CROSS JOIN LATERAL (
  SELECT
    c.arr[(gen.i - 1) % 6 + 1] AS l_city,
    ta.arr[(gen.i - 1) % 6 + 1] AS l_type
) l;

-- ------------------------------------------------------------
-- Seed listing images (2 per listing)
-- ------------------------------------------------------------
WITH gen AS (SELECT generate_series(1, 100) AS i),
     img AS (SELECT generate_series(1, 2) AS j)
INSERT INTO public.listing_images (listing_id, image_url, image_path, sort_order)
SELECT
  lp.id AS listing_id,
  'https://picsum.photos/id/' || (((lp.rn * 10 + img.j) % 1000) + 1)::text || '/1200/900' AS image_url,
  NULL AS image_path,
  img.j AS sort_order
FROM (
  SELECT
    l.id,
    l.type,
    l.location,
    row_number() OVER (ORDER BY l.created_at DESC) AS rn
  FROM public.listings l
  WHERE l.description ILIKE '%SEED_DEMO_REALISTIC_DATA_V2%'
    AND l.id IS NOT NULL
) lp
JOIN gen g
  ON lp.rn = g.i
CROSS JOIN img;

-- ------------------------------------------------------------
-- Seed inquiries (100)
-- ------------------------------------------------------------
WITH
  gen AS (SELECT generate_series(1, 100) AS i),
  first_names AS (
    SELECT ARRAY['Jordan','Avery','Cameron','Taylor','Riley','Morgan','Casey','Quinn','Harper','Logan'] AS arr
  ),
  last_names AS (
    SELECT ARRAY['Bennett','Carter','Donovan','Edwards','Foster','Garcia','Hayes','Iverson','Keller','Mitchell'] AS arr
  ),
  listing_pick AS (
    SELECT id, row_number() OVER (ORDER BY created_at DESC) AS rn
    FROM public.listings
    WHERE description ILIKE '%SEED_DEMO_REALISTIC_DATA_V2%'
  ),
  listing_count AS (
    SELECT GREATEST(COUNT(*), 1)::int AS n FROM public.listings WHERE description ILIKE '%SEED_DEMO_REALISTIC_DATA_V2%'
  )
INSERT INTO public.inquiries (
  full_name, email, phone, message,
  property_id, property_title_snapshot, agent_id,
  inquiry_type, status, read, archived
)
SELECT
  (SELECT arr[(gen.i - 1) % 10 + 1] FROM first_names) || ' ' ||
  (SELECT arr[(gen.i - 1) % 10 + 1] FROM last_names) AS full_name,
  'lead-' || gen.i || '@example.com',
  CASE WHEN gen.i % 3 = 0
    THEN '+1 (212) 555-0' || LPAD((gen.i % 1000)::text, 3, '0')
    ELSE NULL
  END AS phone,
  'Realistic seeded inquiry #' || gen.i || '. ' ||
  'SEED_DEMO_REALISTIC_DATA_V2',
  lp.id AS property_id,
  l.title AS property_title_snapshot,
  l.agent_id,
  CASE WHEN gen.i % 2 = 0 THEN 'property_inquiry' ELSE 'general_inquiry' END::text,
  CASE
    WHEN gen.i % 4 = 0 THEN 'new'
    WHEN gen.i % 4 = 1 THEN 'in_review'
    WHEN gen.i % 4 = 2 THEN 'contacted'
    ELSE 'closed'
  END::text,
  false,
  false
FROM gen
JOIN listing_count lc ON TRUE
JOIN listing_pick lp
  ON lp.rn = ((gen.i - 1) % lc.n) + 1
JOIN public.listings l ON l.id = lp.id;

-- ------------------------------------------------------------
-- Seed reviews (100)
-- - 80 approved (public shows these)
-- - 20 pending (tests admin filtering)
-- ------------------------------------------------------------
WITH
  gen AS (SELECT generate_series(1, 100) AS i),
  first_names AS (
    SELECT ARRAY['Alex','Sam','Jordan','Casey','Rachael','Drew','Victor','Natalie','Taylor','Leah'] AS arr
  ),
  last_names AS (
    SELECT ARRAY['Hughes','Parker','Reed','Ward','Flores','Robinson','Santos','Diaz','Coleman','Baker'] AS arr
  )
INSERT INTO public.reviews (name, email, rating, message, status)
SELECT
  (SELECT arr[(gen.i - 1) % 10 + 1] FROM first_names) || ' ' ||
  (SELECT arr[(gen.i - 1) % 10 + 1] FROM last_names) AS name,
  'reviewer-' || gen.i || '@example.com',
  (1 + (gen.i % 5))::int AS rating,
  'Realistic seeded review #' || gen.i || '. SEED_DEMO_REALISTIC_DATA_V2',
  CASE WHEN gen.i <= 80 THEN 'approved' ELSE 'pending' END::text AS status
FROM gen;

DO $$
BEGIN
  BEGIN EXECUTE 'ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY'; EXCEPTION WHEN others THEN NULL; END;
  BEGIN EXECUTE 'ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY'; EXCEPTION WHEN others THEN NULL; END;
  BEGIN EXECUTE 'ALTER TABLE public.listing_images ENABLE ROW LEVEL SECURITY'; EXCEPTION WHEN others THEN NULL; END;
  BEGIN EXECUTE 'ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY'; EXCEPTION WHEN others THEN NULL; END;
END $$;

COMMIT;

