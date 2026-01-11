-- EMERGENCY FIX: Restore simple, working RLS policies
-- This will get everything working again

-- ========================================
-- SPACES TABLE - Simple and working
-- ========================================

-- Drop all existing space policies
DROP POLICY IF EXISTS "Users can view their spaces" ON public.spaces;
DROP POLICY IF EXISTS "Users can view spaces they're members of" ON public.spaces;
DROP POLICY IF EXISTS "Users can view own and public spaces" ON public.spaces;

-- Simple policy: owners and members can see spaces
CREATE POLICY "Owners and members can view spaces"
  ON public.spaces FOR SELECT
  USING (
    -- You're the owner
    owner_id = auth.uid()
    OR
    -- You're a member
    id IN (
      SELECT space_id 
      FROM public.space_members 
      WHERE user_id = auth.uid()
    )
    OR
    -- It's public
    privacy IN ('public', 'unlisted')
  );

-- Keep existing INSERT/UPDATE/DELETE policies
DROP POLICY IF EXISTS "Users can create spaces" ON public.spaces;
CREATE POLICY "Users can create spaces"
  ON public.spaces FOR INSERT
  WITH CHECK (owner_id = auth.uid());

DROP POLICY IF EXISTS "Owners can update spaces" ON public.spaces;
CREATE POLICY "Owners can update spaces"
  ON public.spaces FOR UPDATE
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

DROP POLICY IF EXISTS "Owners can delete spaces" ON public.spaces;
CREATE POLICY "Owners can delete spaces"
  ON public.spaces FOR DELETE
  USING (owner_id = auth.uid());

-- ========================================
-- SPACE_MEMBERS TABLE - Show all members
-- ========================================

-- Drop all existing member policies
DROP POLICY IF EXISTS "View all members in your spaces" ON public.space_members;
DROP POLICY IF EXISTS "Members can view all members in their spaces" ON public.space_members;
DROP POLICY IF EXISTS "Users can view their memberships" ON public.space_members;

-- THE KEY POLICY: See all members of spaces you belong to
CREATE POLICY "See all members of your spaces"
  ON public.space_members FOR SELECT
  USING (
    -- Show all members of any space where YOU are also a member
    space_id IN (
      SELECT sm.space_id 
      FROM public.space_members sm
      WHERE sm.user_id = auth.uid()
    )
    OR
    -- Show all members of spaces you own
    space_id IN (
      SELECT s.id
      FROM public.spaces s
      WHERE s.owner_id = auth.uid()
    )
  );

-- Keep existing INSERT/UPDATE/DELETE policies
DROP POLICY IF EXISTS "Only owners add members directly" ON public.space_members;
CREATE POLICY "Only owners add members directly"
  ON public.space_members FOR INSERT
  WITH CHECK (
    space_id IN (
      SELECT id FROM public.spaces WHERE owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Owners can update member roles" ON public.space_members;
CREATE POLICY "Owners can update member roles"
  ON public.space_members FOR UPDATE
  USING (
    space_id IN (
      SELECT id FROM public.spaces WHERE owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Owners can remove or users can leave" ON public.space_members;
CREATE POLICY "Owners can remove or users can leave"
  ON public.space_members FOR DELETE
  USING (
    space_id IN (
      SELECT id FROM public.spaces WHERE owner_id = auth.uid()
    )
    OR user_id = auth.uid()
  );

-- ========================================
-- VERIFICATION
-- ========================================

SELECT '✅ RLS policies restored to working state' as status;

-- Show what we created
SELECT 
  tablename,
  policyname,
  cmd
FROM pg_policies
WHERE tablename IN ('spaces', 'space_members')
ORDER BY tablename, cmd, policyname;