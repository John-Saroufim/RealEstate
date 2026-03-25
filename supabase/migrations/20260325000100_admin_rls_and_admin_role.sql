-- ============================================================
-- RealEstate Admin DB-level RLS (Crestline)
-- - Adds an `is_admin()` helper used by RLS policies
-- - Enforces admin-only writes for agents/listings/images
-- - Restricts inquiry CRUD to admins
-- - Updates admin review policies to use `is_admin()`
--
-- IMPORTANT:
-- - Run this in the Supabase SQL Editor (or as a migration run by Supabase).
-- - Seed admin email(s) here to bootstrap admin access until you add rows to `public.user_roles`.
-- ============================================================

-- Admin email whitelist: used to bootstrap admin access by email.
CREATE TABLE IF NOT EXISTS public.admin_email_whitelist (
  email TEXT PRIMARY KEY
);

-- Seed from your current local env:
--   VITE_ADMIN_EMAILS=chatgpt.0@outlook.com
INSERT INTO public.admin_email_whitelist (email)
VALUES ('chatgpt.0@outlook.com')
ON CONFLICT (email) DO NOTHING;

-- Unified admin check:
-- 1) `public.user_roles.role = 'admin'`
-- 2) email is present in `public.admin_email_whitelist`
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    EXISTS (
      SELECT 1
      FROM public.user_roles ur
      WHERE ur.user_id = auth.uid()
        AND ur.role = 'admin'
    )
    OR
    EXISTS (
      SELECT 1
      FROM public.admin_email_whitelist w
      WHERE lower(w.email) = lower(auth.jwt() ->> 'email')
    );
$$;

-- ============================================================
-- AGENTS: admin-only writes
-- ============================================================
DROP POLICY IF EXISTS "auth_insert_agents" ON public.agents;
CREATE POLICY "auth_insert_agents"
  ON public.agents FOR INSERT TO authenticated
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "auth_update_agents" ON public.agents;
CREATE POLICY "auth_update_agents"
  ON public.agents FOR UPDATE TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "auth_delete_agents" ON public.agents;
CREATE POLICY "auth_delete_agents"
  ON public.agents FOR DELETE TO authenticated
  USING (public.is_admin());

-- ============================================================
-- LISTINGS: admin-only writes
-- ============================================================
DROP POLICY IF EXISTS "auth_insert_listings" ON public.listings;
CREATE POLICY "auth_insert_listings"
  ON public.listings FOR INSERT TO authenticated
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "auth_update_listings" ON public.listings;
CREATE POLICY "auth_update_listings"
  ON public.listings FOR UPDATE TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "auth_delete_listings" ON public.listings;
CREATE POLICY "auth_delete_listings"
  ON public.listings FOR DELETE TO authenticated
  USING (public.is_admin());

-- ============================================================
-- LISTING IMAGES: admin-only writes
-- ============================================================
DROP POLICY IF EXISTS "auth_insert_listing_images" ON public.listing_images;
CREATE POLICY "auth_insert_listing_images"
  ON public.listing_images FOR INSERT TO authenticated
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "auth_update_listing_images" ON public.listing_images;
CREATE POLICY "auth_update_listing_images"
  ON public.listing_images FOR UPDATE TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "auth_delete_listing_images" ON public.listing_images;
CREATE POLICY "auth_delete_listing_images"
  ON public.listing_images FOR DELETE TO authenticated
  USING (public.is_admin());

-- ============================================================
-- STORAGE: admin-only uploads/deletes for image buckets
-- ============================================================

DROP POLICY IF EXISTS "auth_upload_agent_images" ON storage.objects;
CREATE POLICY "auth_upload_agent_images"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'agent-images' AND public.is_admin());

DROP POLICY IF EXISTS "auth_update_agent_images" ON storage.objects;
CREATE POLICY "auth_update_agent_images"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'agent-images' AND public.is_admin())
  WITH CHECK (bucket_id = 'agent-images' AND public.is_admin());

DROP POLICY IF EXISTS "auth_delete_agent_images" ON storage.objects;
CREATE POLICY "auth_delete_agent_images"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'agent-images' AND public.is_admin());

DROP POLICY IF EXISTS "auth_upload_listing_images" ON storage.objects;
CREATE POLICY "auth_upload_listing_images"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'listing-images' AND public.is_admin());

DROP POLICY IF EXISTS "auth_update_listing_images" ON storage.objects;
CREATE POLICY "auth_update_listing_images"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'listing-images' AND public.is_admin())
  WITH CHECK (bucket_id = 'listing-images' AND public.is_admin());

DROP POLICY IF EXISTS "auth_delete_listing_images" ON storage.objects;
CREATE POLICY "auth_delete_listing_images"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'listing-images' AND public.is_admin());

-- ============================================================
-- INQUIRIES: allow public insert; admin-only select/update/delete
-- (Assumes columns used by the app exist: archived, read, status, etc.)
-- ============================================================
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'inquiries'
  ) THEN
    BEGIN
      EXECUTE 'ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY';
    EXCEPTION WHEN others THEN
      NULL;
    END;

    -- Public can submit contact/inquiry forms; admins handle follow-ups.
    EXECUTE 'DROP POLICY IF EXISTS "public_insert_inquiries" ON public.inquiries';
    EXECUTE 'DROP POLICY IF EXISTS "public_insert_inquiries_auth" ON public.inquiries';
    EXECUTE '
      CREATE POLICY "public_insert_inquiries"
        ON public.inquiries FOR INSERT TO anon
        WITH CHECK (archived = false AND read = false AND status = ''new'')
    ';
    EXECUTE '
      CREATE POLICY "public_insert_inquiries_auth"
        ON public.inquiries FOR INSERT TO authenticated
        WITH CHECK (archived = false AND read = false AND status = ''new'')
    ';

    -- Admin can read inbox items.
    EXECUTE 'DROP POLICY IF EXISTS "admin_select_inquiries" ON public.inquiries';
    EXECUTE '
      CREATE POLICY "admin_select_inquiries"
        ON public.inquiries FOR SELECT TO authenticated
        USING (public.is_admin())
    ';

    -- Admin can update status/read/archive flags.
    EXECUTE 'DROP POLICY IF EXISTS "admin_update_inquiries" ON public.inquiries';
    EXECUTE '
      CREATE POLICY "admin_update_inquiries"
        ON public.inquiries FOR UPDATE TO authenticated
        USING (public.is_admin())
        WITH CHECK (public.is_admin())
    ';

    -- Admin can delete inquiries.
    EXECUTE 'DROP POLICY IF EXISTS "admin_delete_inquiries" ON public.inquiries';
    EXECUTE '
      CREATE POLICY "admin_delete_inquiries"
        ON public.inquiries FOR DELETE TO authenticated
        USING (public.is_admin())
    ';
  END IF;
END $$;

-- ============================================================
-- REVIEWS: ensure admin policies use `is_admin()`
-- ============================================================
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'reviews'
  ) THEN
    BEGIN
      EXECUTE 'ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY';
    EXCEPTION WHEN others THEN
      NULL;
    END;

    EXECUTE 'DROP POLICY IF EXISTS "admin_select_reviews" ON public.reviews';
    EXECUTE '
      CREATE POLICY "admin_select_reviews"
        ON public.reviews FOR SELECT TO authenticated
        USING (public.is_admin())
    ';

    EXECUTE 'DROP POLICY IF EXISTS "admin_update_reviews" ON public.reviews';
    EXECUTE '
      CREATE POLICY "admin_update_reviews"
        ON public.reviews FOR UPDATE TO authenticated
        USING (public.is_admin())
        WITH CHECK (public.is_admin())
    ';

    EXECUTE 'DROP POLICY IF EXISTS "admin_delete_reviews" ON public.reviews';
    EXECUTE '
      CREATE POLICY "admin_delete_reviews"
        ON public.reviews FOR DELETE TO authenticated
        USING (public.is_admin())
    ';
  END IF;
END $$;

