-- COMPLETE RLS FIX: Fix all policies to work together properly
-- This ensures both space access AND member visibility work

-- ========================================
-- 1. FIX SPACE_MEMBERS - Show all members in spaces you belong to
-- ========================================

DROP POLICY IF EXISTS "Users can view their memberships" ON public.space_members;
DROP POLICY IF EXISTS "Members can view all members in their spaces" ON public.space_members;
DROP POLICY IF EXISTS "View all members in your spaces" ON public.space_members;

-- This policy allows you to see ALL members of ANY space where you are also a member
CREATE POLICY "View all members in your spaces"
  ON public.space_members FOR SELECT
  USING (
    -- Can see all members of spaces where you're a member or owner
    EXISTS (
      SELECT 1 FROM public.space_members sm
      WHERE sm.space_id = space_members.space_id
      AND sm.user_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM public.spaces s
      WHERE s.id = space_members.space_id
      AND s.owner_id = auth.uid()
    )
  );

-- Recreate INSERT policy
DROP POLICY IF EXISTS "Only owners add members directly" ON public.space_members;
CREATE POLICY "Only owners add members directly"
  ON public.space_members FOR INSERT
  WITH CHECK (
    space_id IN (
      SELECT id FROM public.spaces
      WHERE owner_id = auth.uid()
    )
  );

-- Recreate UPDATE policy
DROP POLICY IF EXISTS "Owners can update member roles" ON public.space_members;
CREATE POLICY "Owners can update member roles"
  ON public.space_members FOR UPDATE
  USING (
    space_id IN (
      SELECT id FROM public.spaces
      WHERE owner_id = auth.uid()
    )
  );

-- Recreate DELETE policy
DROP POLICY IF EXISTS "Owners can remove or users can leave" ON public.space_members;
CREATE POLICY "Owners can remove or users can leave"
  ON public.space_members FOR DELETE
  USING (
    space_id IN (
      SELECT id FROM public.spaces
      WHERE owner_id = auth.uid()
    )
    OR user_id = auth.uid()
  );

-- ========================================
-- 2. VERIFY SPACES POLICY - Ensure owners/members can see their spaces
-- ========================================

DROP POLICY IF EXISTS "Users can view spaces they're members of" ON public.spaces;
DROP POLICY IF EXISTS "Users can view own and public spaces" ON public.spaces;
DROP POLICY IF EXISTS "Users can view their spaces" ON public.spaces;

CREATE POLICY "Users can view their spaces"
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

-- ========================================
-- 3. VERIFICATION
-- ========================================

-- Show all active policies
SELECT 
  tablename,
  policyname,
  cmd
FROM pg_policies
WHERE tablename IN ('spaces', 'space_members')
ORDER BY tablename, cmd, policyname;