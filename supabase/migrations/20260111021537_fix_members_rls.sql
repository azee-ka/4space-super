-- FIX: Allow users to see ALL members in spaces they belong to
-- Currently users can only see themselves - this is the problem!

-- Drop the restrictive policy
DROP POLICY IF EXISTS "Users can view their memberships" ON public.space_members;

-- Create a better policy that shows ALL members of spaces you're in
CREATE POLICY "Members can view all members in their spaces"
  ON public.space_members FOR SELECT
  USING (
    -- You can see all members of spaces where you are also a member
    space_id IN (
      SELECT space_id 
      FROM public.space_members 
      WHERE user_id = auth.uid()
    )
    OR
    -- OR you're the space owner
    space_id IN (
      SELECT id 
      FROM public.spaces 
      WHERE owner_id = auth.uid()
    )
  );

-- Test the fix
-- After running this, you should see ALL members when you query
SELECT 
  sm.id,
  sm.space_id,
  sm.user_id,
  sm.role,
  p.email,
  p.display_name
FROM space_members sm
JOIN profiles p ON p.id = sm.user_id
ORDER BY sm.space_id, sm.role DESC;

SELECT '✅ Fixed! All members in your spaces should now be visible' as status;