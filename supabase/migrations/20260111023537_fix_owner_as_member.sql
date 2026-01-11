-- CRITICAL FIX: Ensure space owner is ALWAYS added as a member
-- This is the ROOT CAUSE of the access issue

-- ========================================
-- 1. Check if trigger exists
-- ========================================

SELECT 
  trigger_name,
  event_manipulation,
  action_statement
FROM information_schema.triggers
WHERE event_object_table = 'spaces'
  AND trigger_name LIKE '%owner%';

-- ========================================
-- 2. Drop and recreate the trigger function
-- ========================================

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_space_created ON public.spaces;
DROP FUNCTION IF EXISTS handle_new_space();

-- Create function that adds owner as member
CREATE OR REPLACE FUNCTION handle_new_space()
RETURNS TRIGGER AS $$
BEGIN
  -- Add the space owner as a member with 'owner' role
  INSERT INTO public.space_members (space_id, user_id, role)
  VALUES (NEW.id, NEW.owner_id, 'owner');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger that fires after space insert
CREATE TRIGGER on_space_created
  AFTER INSERT ON public.spaces
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_space();

-- ========================================
-- 3. Fix existing spaces - add owners as members
-- ========================================

-- Find spaces where owner is NOT a member
INSERT INTO public.space_members (space_id, user_id, role)
SELECT 
  s.id as space_id,
  s.owner_id as user_id,
  'owner' as role
FROM public.spaces s
WHERE NOT EXISTS (
  SELECT 1 FROM public.space_members sm
  WHERE sm.space_id = s.id
  AND sm.user_id = s.owner_id
)
ON CONFLICT (space_id, user_id) DO NOTHING;

-- ========================================
-- 4. Verify the fix
-- ========================================

-- Check: All spaces should have owner as member
SELECT 
  s.id,
  s.name,
  s.owner_id,
  EXISTS (
    SELECT 1 FROM space_members sm
    WHERE sm.space_id = s.id AND sm.user_id = s.owner_id
  ) as owner_is_member
FROM spaces s
ORDER BY s.created_at DESC
LIMIT 10;

SELECT '✅ Fixed! Owners are now members of their spaces' as status;