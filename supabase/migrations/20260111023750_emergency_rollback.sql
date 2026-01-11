-- EMERGENCY ROLLBACK: Restore ORIGINAL working RLS policies
-- This undoes ALL the broken changes and restores the exact original state

-- ========================================
-- 1. DROP ALL BROKEN POLICIES
-- ========================================

-- Drop all current space policies
DROP POLICY IF EXISTS "Users can view their spaces" ON public.spaces;
DROP POLICY IF EXISTS "Owners and members can view spaces" ON public.spaces;
DROP POLICY IF EXISTS "Users can view spaces they're members of" ON public.spaces;
DROP POLICY IF EXISTS "Users can view own and public spaces" ON public.spaces;
DROP POLICY IF EXISTS "Users can create spaces" ON public.spaces;
DROP POLICY IF EXISTS "Owners can update spaces" ON public.spaces;
DROP POLICY IF EXISTS "Owners can delete spaces" ON public.spaces;

-- Drop all current space_members policies
DROP POLICY IF EXISTS "View all members in your spaces" ON public.space_members;
DROP POLICY IF EXISTS "See all members of your spaces" ON public.space_members;
DROP POLICY IF EXISTS "Members can view all members in their spaces" ON public.space_members;
DROP POLICY IF EXISTS "Users can view their memberships" ON public.space_members;
DROP POLICY IF EXISTS "Only owners add members directly" ON public.space_members;
DROP POLICY IF EXISTS "Owners can update member roles" ON public.space_members;
DROP POLICY IF EXISTS "Owners can remove or users can leave" ON public.space_members;

-- ========================================
-- 2. RESTORE ORIGINAL WORKING POLICIES
-- ========================================

-- SPACES - ORIGINAL POLICIES
CREATE POLICY "Users can view own and public spaces"
  ON public.spaces FOR SELECT
  USING (
    owner_id = (SELECT auth.uid())
    OR privacy = 'public'
  );

CREATE POLICY "Users can create spaces"
  ON public.spaces FOR INSERT
  WITH CHECK (owner_id = (SELECT auth.uid()));

CREATE POLICY "Owners can update spaces"
  ON public.spaces FOR UPDATE
  USING (owner_id = (SELECT auth.uid()))
  WITH CHECK (owner_id = (SELECT auth.uid()));

CREATE POLICY "Owners can delete spaces"
  ON public.spaces FOR DELETE
  USING (owner_id = (SELECT auth.uid()));

-- SPACE_MEMBERS - ORIGINAL POLICIES
CREATE POLICY "Users can view their memberships"
  ON public.space_members FOR SELECT
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Only owners add members directly"
  ON public.space_members FOR INSERT
  WITH CHECK (
    space_id IN (
      SELECT id FROM public.spaces
      WHERE owner_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "Owners can update member roles"
  ON public.space_members FOR UPDATE
  USING (
    space_id IN (
      SELECT id FROM public.spaces
      WHERE owner_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "Owners can remove or users can leave"
  ON public.space_members FOR DELETE
  USING (
    space_id IN (
      SELECT id FROM public.spaces
      WHERE owner_id = (SELECT auth.uid())
    )
    OR user_id = (SELECT auth.uid())
  );

-- ========================================
-- 3. VERIFY ROLLBACK
-- ========================================

SELECT '✅ ROLLBACK COMPLETE - Restored to original working state' as status;

-- Show the restored policies
SELECT 
  tablename,
  policyname,
  cmd
FROM pg_policies
WHERE tablename IN ('spaces', 'space_members')
ORDER BY tablename, policyname;