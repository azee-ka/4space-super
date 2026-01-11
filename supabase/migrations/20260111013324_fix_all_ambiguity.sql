-- Complete rewrite to avoid ALL possible ambiguities
-- Use completely different variable names that don't match ANY column names

DROP FUNCTION IF EXISTS public.accept_space_invitation(UUID);

CREATE OR REPLACE FUNCTION public.accept_space_invitation(p_invitation_id UUID)
RETURNS TABLE(result_space_id UUID)  -- Changed return column name
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  var_space_id UUID;        -- Changed variable name
  var_user_id UUID;         -- Changed variable name
  var_role member_role;     -- Changed variable name
  var_invited_by UUID;      -- Changed variable name
BEGIN
  -- Get invitation details with explicit column references
  SELECT 
    si.space_id,
    si.invited_user_id,
    si.role,
    si.invited_by_user_id
  INTO 
    var_space_id,
    var_user_id,
    var_role,
    var_invited_by
  FROM public.space_invitations si
  WHERE si.id = p_invitation_id 
    AND si.invited_user_id = auth.uid() 
    AND si.status = 'pending';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invitation not found or already processed';
  END IF;

  -- Add user to space - use variables
  INSERT INTO public.space_members (space_id, user_id, role)
  VALUES (var_space_id, var_user_id, var_role)
  ON CONFLICT (space_id, user_id) DO NOTHING;

  -- Update invitation status
  UPDATE public.space_invitations si
  SET status = 'accepted', updated_at = NOW()
  WHERE si.id = p_invitation_id;

  -- Create notification for inviter
  INSERT INTO public.notifications (user_id, type, title, message, data)
  VALUES (
    var_invited_by,
    'member_joined',
    'Invitation Accepted',
    'Someone accepted your space invitation',
    jsonb_build_object('space_id', var_space_id, 'user_id', var_user_id)
  );

  -- Return the space_id
  RETURN QUERY SELECT var_space_id;
END;
$$;

SELECT '✅ Function rewritten with non-conflicting variable names' as status;