-- ============================================================
-- Crestline: listings, listing_images tables + RLS policies
-- Also re-applies agents table RLS in case it wasn't run yet.
-- Run this in the Supabase SQL Editor.
-- ============================================================

-- Updated-at helper (idempotent)
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- AGENTS (idempotent: safe to run even if already created)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  slug TEXT UNIQUE,
  title TEXT,
  phone TEXT,
  email TEXT,
  bio TEXT,
  specialties TEXT[] NOT NULL DEFAULT '{}',
  city TEXT,
  years_experience INTEGER,
  profile_image_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;

DROP TRIGGER IF EXISTS agents_set_updated_at ON public.agents;
CREATE TRIGGER agents_set_updated_at
  BEFORE UPDATE ON public.agents
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Allow everyone to read agents
DROP POLICY IF EXISTS "public_select_agents" ON public.agents;
CREATE POLICY "public_select_agents"
  ON public.agents FOR SELECT
  USING (true);

-- Allow any authenticated user to manage agents
-- (Admin-only access is enforced at the application layer via ProtectedAdminRoute)
DROP POLICY IF EXISTS "auth_insert_agents" ON public.agents;
CREATE POLICY "auth_insert_agents"
  ON public.agents FOR INSERT TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "auth_update_agents" ON public.agents;
CREATE POLICY "auth_update_agents"
  ON public.agents FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "auth_delete_agents" ON public.agents;
CREATE POLICY "auth_delete_agents"
  ON public.agents FOR DELETE TO authenticated
  USING (true);

-- ============================================================
-- LISTINGS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  price NUMERIC,
  location TEXT,
  beds INTEGER,
  baths INTEGER,
  sqft INTEGER,
  type TEXT,
  status TEXT DEFAULT 'For Sale',
  description TEXT,
  image_url TEXT,
  agent_id UUID REFERENCES public.agents(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;

DROP TRIGGER IF EXISTS listings_set_updated_at ON public.listings;
CREATE TRIGGER listings_set_updated_at
  BEFORE UPDATE ON public.listings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Allow everyone to read listings
DROP POLICY IF EXISTS "public_select_listings" ON public.listings;
CREATE POLICY "public_select_listings"
  ON public.listings FOR SELECT
  USING (true);

-- Allow any authenticated user to manage listings
DROP POLICY IF EXISTS "auth_insert_listings" ON public.listings;
CREATE POLICY "auth_insert_listings"
  ON public.listings FOR INSERT TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "auth_update_listings" ON public.listings;
CREATE POLICY "auth_update_listings"
  ON public.listings FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "auth_delete_listings" ON public.listings;
CREATE POLICY "auth_delete_listings"
  ON public.listings FOR DELETE TO authenticated
  USING (true);

-- ============================================================
-- LISTING IMAGES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.listing_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  image_path TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.listing_images ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_select_listing_images" ON public.listing_images;
CREATE POLICY "public_select_listing_images"
  ON public.listing_images FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "auth_insert_listing_images" ON public.listing_images;
CREATE POLICY "auth_insert_listing_images"
  ON public.listing_images FOR INSERT TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "auth_update_listing_images" ON public.listing_images;
CREATE POLICY "auth_update_listing_images"
  ON public.listing_images FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "auth_delete_listing_images" ON public.listing_images;
CREATE POLICY "auth_delete_listing_images"
  ON public.listing_images FOR DELETE TO authenticated
  USING (true);

-- ============================================================
-- STORAGE: agent-images bucket
-- ============================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('agent-images', 'agent-images', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "public_read_agent_images" ON storage.objects;
CREATE POLICY "public_read_agent_images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'agent-images');

DROP POLICY IF EXISTS "auth_upload_agent_images" ON storage.objects;
CREATE POLICY "auth_upload_agent_images"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'agent-images');

DROP POLICY IF EXISTS "auth_update_agent_images" ON storage.objects;
CREATE POLICY "auth_update_agent_images"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'agent-images');

DROP POLICY IF EXISTS "auth_delete_agent_images" ON storage.objects;
CREATE POLICY "auth_delete_agent_images"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'agent-images');

-- ============================================================
-- STORAGE: listing-images bucket
-- ============================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('listing-images', 'listing-images', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "public_read_listing_images" ON storage.objects;
CREATE POLICY "public_read_listing_images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'listing-images');

DROP POLICY IF EXISTS "auth_upload_listing_images" ON storage.objects;
CREATE POLICY "auth_upload_listing_images"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'listing-images');

DROP POLICY IF EXISTS "auth_update_listing_images" ON storage.objects;
CREATE POLICY "auth_update_listing_images"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'listing-images');

DROP POLICY IF EXISTS "auth_delete_listing_images" ON storage.objects;
CREATE POLICY "auth_delete_listing_images"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'listing-images');
