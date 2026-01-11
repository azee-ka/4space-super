-- FINAL FIX: Make invitations visible in the app
-- Run this in Supabase SQL Editor

-- ================================================================
-- FIX 1: SPACE_INVITATIONS - Allow users to see their invitations
-- ================================================================

DROP POLICY IF EXISTS "Users can view their invitations" ON public.space_invitations;

CREATE POLICY "Users can view their invitations"
  ON public.space_invitations FOR SELECT
  USING (
    invited_user_id = auth.uid()
    OR invited_by_user_id = auth.uid()
  );

-- ================================================================
-- FIX 2: SPACES - Allow invited users to see space details
-- ================================================================

DROP POLICY IF EXISTS "Users can view spaces they're members of" ON public.spaces;

CREATE POLICY "Users can view spaces they're members of"
  ON public.spaces FOR SELECT
  USING (
    owner_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.space_members
      WHERE space_members.space_id = spaces.id
      AND space_members.user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.space_invitations
      WHERE space_invitations.space_id = spaces.id
      AND space_invitations.invited_user_id = auth.uid()
      AND space_invitations.status = 'pending'
    )
    OR privacy IN ('public', 'unlisted')
  );

-- ================================================================
-- FIX 3: PROFILES - Allow everyone to see profile info
-- ================================================================

DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;

CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

-- ================================================================
-- VERIFICATION: Check policies are created
-- ================================================================

SELECT 
  '✅ Policies created:' as status,
  COUNT(*) as count
FROM pg_policies
WHERE tablename IN ('spaces', 'space_invitations', 'profiles')
  AND cmd = 'SELECT';

-- Show all SELECT policies
SELECT 
  tablename,
  policyname,
  '✅' as status
FROM pg_policies
WHERE tablename IN ('spaces', 'space_invitations', 'profiles')
  AND cmd = 'SELECT'
ORDER BY tablename;

-- ================================================================
-- EXPECTED RESULT:
-- You should see 3 policies:
-- 1. spaces - "Users can view spaces they're members of"
-- 2. space_invitations - "Users can view their invitations"
-- 3. profiles - "Public profiles are viewable by everyone"
-- ================================================================