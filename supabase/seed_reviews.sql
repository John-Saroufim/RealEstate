-- ============================================================
-- Reviews: customer reviews with admin approval workflow
-- ============================================================
-- Run this in the Supabase SQL editor.
-- Creates `public.reviews` and RLS policies:
-- - Public can insert only `pending` reviews
-- - Public can select only `approved` reviews
-- - Admin users can select/update/delete all reviews
-- ============================================================

-- Ensure updated-at helper exists (safe if already present)
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Reviews table
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- updated_at trigger (optional but keeps table consistent)
DROP TRIGGER IF EXISTS reviews_set_updated_at ON public.reviews;
CREATE TRIGGER reviews_set_updated_at
  BEFORE UPDATE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================
-- RLS Policies
-- ============================================================

-- Public can view only approved reviews
DROP POLICY IF EXISTS "public_select_approved_reviews" ON public.reviews;
CREATE POLICY "public_select_approved_reviews"
  ON public.reviews FOR SELECT TO anon
  USING (status = 'approved');

DROP POLICY IF EXISTS "auth_select_approved_reviews" ON public.reviews;
CREATE POLICY "auth_select_approved_reviews"
  ON public.reviews FOR SELECT TO authenticated
  USING (status = 'approved');

-- Public can insert only pending reviews
DROP POLICY IF EXISTS "public_insert_pending_reviews" ON public.reviews;
CREATE POLICY "public_insert_pending_reviews"
  ON public.reviews FOR INSERT TO anon
  WITH CHECK (
    status = 'pending' AND
    rating BETWEEN 1 AND 5 AND
    name IS NOT NULL AND
    email IS NOT NULL AND
    message IS NOT NULL
  );

DROP POLICY IF EXISTS "auth_insert_pending_reviews" ON public.reviews;
CREATE POLICY "auth_insert_pending_reviews"
  ON public.reviews FOR INSERT TO authenticated
  WITH CHECK (
    status = 'pending' AND
    rating BETWEEN 1 AND 5 AND
    name IS NOT NULL AND
    email IS NOT NULL AND
    message IS NOT NULL
  );

-- Admin can select all reviews
DROP POLICY IF EXISTS "admin_select_reviews" ON public.reviews;
CREATE POLICY "admin_select_reviews"
  ON public.reviews FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.user_roles ur
      WHERE ur.user_id = auth.uid()
        AND ur.role = 'admin'
    )
  );

-- Admin can update status (approve/reject) and generally manage reviews
DROP POLICY IF EXISTS "admin_update_reviews" ON public.reviews;
CREATE POLICY "admin_update_reviews"
  ON public.reviews FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.user_roles ur
      WHERE ur.user_id = auth.uid()
        AND ur.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.user_roles ur
      WHERE ur.user_id = auth.uid()
        AND ur.role = 'admin'
    )
  );

-- Admin can delete reviews
DROP POLICY IF EXISTS "admin_delete_reviews" ON public.reviews;
CREATE POLICY "admin_delete_reviews"
  ON public.reviews FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.user_roles ur
      WHERE ur.user_id = auth.uid()
        AND ur.role = 'admin'
    )
  );

-- ============================================================
-- Optional: minimal seed (disabled by default)
-- ============================================================
-- INSERT INTO public.reviews (name, email, rating, message, status)
-- VALUES
--   ('Demo Client', 'demo@example.com', 5, 'Luxury service and a seamless experience.', 'approved');

