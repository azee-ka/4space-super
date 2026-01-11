-- DIAGNOSIS: Space data is returning NULL in invitation query
-- This means RLS on the spaces table is blocking access

-- 1. Check current RLS policies on spaces table
SELECT 
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'spaces'
  AND cmd = 'SELECT'
ORDER BY policyname;

-- 2. Check if the space actually exists
SELECT 
  id,
  name,
  owner_id,
  privacy
FROM spaces
WHERE id = '63a6b3ef-38d9-429f-9ac1-2a281fec698f';  -- Your space_id from the log

-- 3. FIX: Update the spaces SELECT policy to allow invited users to see the space
DROP POLICY IF EXISTS "Users can view spaces they're members of" ON public.spaces;

CREATE POLICY "Users can view spaces they're members of"
  ON public.spaces FOR SELECT
  USING (
    -- Owner can see
    owner_id = auth.uid()
    
    -- OR members can see
    OR EXISTS (
      SELECT 1 FROM space_members
      WHERE space_members.space_id = spaces.id
      AND space_members.user_id = auth.uid()
    )
    
    -- OR invited users can see (THIS WAS MISSING!)
    OR EXISTS (
      SELECT 1 FROM space_invitations
      WHERE space_invitations.space_id = spaces.id
      AND space_invitations.invited_user_id = auth.uid()
      AND space_invitations.status = 'pending'
    )
    
    -- OR public/unlisted spaces
    OR privacy IN ('public', 'unlisted')
  );

-- 4. Verify the fix works
-- Run this as the invited user to test
SELECT 
  s.id,
  s.name,
  s.description,
  s.privacy,
  'Can access!' as status
FROM spaces s
WHERE s.id IN (
  SELECT space_id 
  FROM space_invitations 
  WHERE invited_user_id = auth.uid() 
  AND status = 'pending'
);

-- 5. Test the full invitation query again
SELECT 
  si.*,
  s.name as space_name,
  s.privacy as space_privacy,
  p.email as inviter_email
FROM space_invitations si
LEFT JOIN spaces s ON s.id = si.space_id
LEFT JOIN profiles p ON p.id = si.invited_by_user_id
WHERE si.invited_user_id = auth.uid()
  AND si.status = 'pending';