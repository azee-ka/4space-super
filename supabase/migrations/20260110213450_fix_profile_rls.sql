-- Fix profiles RLS policies to allow users to create their own profile

-- Drop existing policies
DROP POLICY IF EXISTS "Public profiles viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- Recreate with INSERT permission
CREATE POLICY "Public profiles viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (id = (SELECT auth.uid()));

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (id = (SELECT auth.uid()))
  WITH CHECK (id = (SELECT auth.uid()));

SELECT '✅ Fixed profiles RLS policies - users can now create their own profile' as status;