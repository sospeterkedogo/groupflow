-- Migration: v17_fix_profile_fields
-- Description: Adds missing columns to profiles table and ensures data accuracy for new accounts.

-- 1. Add missing identity and roadmap columns
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS course_name TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS enrollment_year INTEGER;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS completion_year INTEGER;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'collaborator';

-- 2. Update existing entries to have safe defaults if needed (optional)
-- UPDATE public.profiles SET role = 'collaborator' WHERE role IS NULL;

-- 3. Update the handle_new_user function to be more robust
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (
    id, 
    email, 
    full_name,
    school_id,
    role,
    course_name,
    enrollment_year,
    completion_year
  )
  VALUES (
    new.id, 
    new.email, 
    COALESCE(new.raw_user_meta_data->>'full_name', new.email),
    new.raw_user_meta_data->>'school_id',
    'collaborator',
    'Independent Researcher',
    extract(year from now())::int,
    (extract(year from now()) + 3)::int
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Verification Comment
COMMENT ON COLUMN public.profiles.course_name IS 'Current academic course or degree path';
COMMENT ON COLUMN public.profiles.enrollment_year IS 'The year the user started their academic journey';
COMMENT ON COLUMN public.profiles.completion_year IS 'The estimated year of graduation or completion';
