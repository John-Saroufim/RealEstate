-- Demo seed: agents (RealEstate / real estate brokers)
-- Run in Supabase SQL Editor.

-- Updated-at helper (used by triggers)
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 1) Agents table
CREATE TABLE IF NOT EXISTS public.agents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
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

-- If `agents` exists already but was created with a slightly different shape,
-- this keeps the demo from breaking by adding missing columns.
ALTER TABLE public.agents
  ADD COLUMN IF NOT EXISTS slug TEXT;

ALTER TABLE public.agents
  ADD COLUMN IF NOT EXISTS title TEXT;

ALTER TABLE public.agents
  ADD COLUMN IF NOT EXISTS phone TEXT;

ALTER TABLE public.agents
  ADD COLUMN IF NOT EXISTS email TEXT;

ALTER TABLE public.agents
  ADD COLUMN IF NOT EXISTS bio TEXT;

ALTER TABLE public.agents
  ADD COLUMN IF NOT EXISTS specialties TEXT[] NOT NULL DEFAULT '{}';

ALTER TABLE public.agents
  ADD COLUMN IF NOT EXISTS city TEXT;

ALTER TABLE public.agents
  ADD COLUMN IF NOT EXISTS years_experience INTEGER;

ALTER TABLE public.agents
  ADD COLUMN IF NOT EXISTS profile_image_url TEXT;

ALTER TABLE public.agents
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true;

ALTER TABLE public.agents
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT now();

ALTER TABLE public.agents
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

-- Make sure media fields are optional for smoother demo creation.
ALTER TABLE public.agents ALTER COLUMN profile_image_url DROP NOT NULL;

ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;

DROP TRIGGER IF EXISTS agents_set_updated_at ON public.agents;
CREATE TRIGGER agents_set_updated_at
BEFORE UPDATE ON public.agents
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Public can view only active agents
DROP POLICY IF EXISTS "public_select_active_agents" ON public.agents;
CREATE POLICY "public_select_active_agents"
ON public.agents FOR SELECT TO anon
USING (is_active = true);

DROP POLICY IF EXISTS "auth_select_active_agents" ON public.agents;
CREATE POLICY "auth_select_active_agents"
ON public.agents FOR SELECT TO authenticated
USING (is_active = true);

-- Admin manages agents (reuses public.user_roles + role='admin')
DROP POLICY IF EXISTS "admin_select_agents" ON public.agents;
CREATE POLICY "admin_select_agents"
ON public.agents FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
  )
);

DROP POLICY IF EXISTS "admin_insert_agents" ON public.agents;
CREATE POLICY "admin_insert_agents"
ON public.agents FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
  )
);

DROP POLICY IF EXISTS "admin_update_agents" ON public.agents;
CREATE POLICY "admin_update_agents"
ON public.agents FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
  )
);

DROP POLICY IF EXISTS "admin_delete_agents" ON public.agents;
CREATE POLICY "admin_delete_agents"
ON public.agents FOR DELETE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
  )
);

-- 2) Seed sample agents (id auto-generated)
INSERT INTO public.agents (
  full_name,
  slug,
  title,
  phone,
  email,
  bio,
  specialties,
  city,
  years_experience,
  profile_image_url,
  is_active
)
VALUES
  (
    'Alessandra Russo',
    'alessandra-russo',
    'Senior Advisor, Luxury Estates',
    '+1 (212) 555-0114',
    'alessandra@montelibano.example',
    'A decade-plus of experience representing discerning buyers and sellers across Manhattan and beyond.',
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
    'Trusted for waterfront rentals and relocation guidance—private, efficient, and detail-forward.',
    ARRAY['Luxury Rentals', 'Waterfront', 'Relocation'],
    'Palm Beach',
    7,
    NULL,
    true
  ),
  (
    'Mateo De Luca',
    'mateo-de-luca',
    'Advisor, Penthouse Collection',
    '+1 (212) 555-0183',
    'mateo@montelibano.example',
    'Focused on penthouses and trophy listings, curating access with a refined client experience.',
    ARRAY['Penthouse', 'Off-market', 'Negotiation'],
    'Manhattan',
    11,
    NULL,
    true
  );
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

-- 3) Storage bucket for agent images (optional for demo; required for agent photo uploads)
INSERT INTO storage.buckets (id, name, public)
VALUES ('agent-images', 'agent-images', true)
ON CONFLICT (id) DO NOTHING;

ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_select_agent_images" ON storage.objects;
CREATE POLICY "public_select_agent_images"
ON storage.objects FOR SELECT TO anon
USING (bucket_id = 'agent-images');

DROP POLICY IF EXISTS "auth_select_agent_images" ON storage.objects;
CREATE POLICY "auth_select_agent_images"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'agent-images');

DROP POLICY IF EXISTS "admin_insert_agent_images" ON storage.objects;
CREATE POLICY "admin_insert_agent_images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'agent-images' AND
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
  )
);

DROP POLICY IF EXISTS "admin_update_agent_images" ON storage.objects;
CREATE POLICY "admin_update_agent_images"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'agent-images' AND
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
  )
)
WITH CHECK (
  bucket_id = 'agent-images' AND
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
  )
);

DROP POLICY IF EXISTS "admin_delete_agent_images" ON storage.objects;
CREATE POLICY "admin_delete_agent_images"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'agent-images' AND
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
  )
);

