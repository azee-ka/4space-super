-- Fix ambiguous column by using AS to alias the returned column
-- The issue is that we're returning a column named "space_id" but have a variable "v_space_id"

DROP FUNCTION IF EXISTS public.accept_space_invitation(UUID);

CREATE OR REPLACE FUNCTION public.accept_space_invitation(p_invitation_id UUID)
RETURNS TABLE(space_id UUID)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_space_id UUID;
  v_user_id UUID;
  v_role member_role;
  v_invited_by UUID;
BEGIN
  -- Get invitation details
  SELECT 
    si.space_id,
    si.invited_user_id,
    si.role,
    si.invited_by_user_id
  INTO 
    v_space_id,
    v_user_id,
    v_role,
    v_invited_by
  FROM public.space_invitations si
  WHERE si.id = p_invitation_id 
    AND si.invited_user_id = auth.uid() 
    AND si.status = 'pending';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invitation not found or already processed';
  END IF;

  -- Add user to space
  INSERT INTO public.space_members (space_id, user_id, role)
  VALUES (v_space_id, v_user_id, v_role)
  ON CONFLICT (space_id, user_id) DO NOTHING;

  -- Update invitation status
  UPDATE public.space_invitations
  SET status = 'accepted', updated_at = NOW()
  WHERE id = p_invitation_id;

  -- Create notification for inviter
  INSERT INTO public.notifications (user_id, type, title, message, data)
  VALUES (
    v_invited_by,
    'member_joined',
    'Invitation Accepted',
    'Someone accepted your space invitation',
    jsonb_build_object('space_id', v_space_id, 'user_id', v_user_id)
  );

  -- Return the space_id - use AS to explicitly alias it
  RETURN QUERY SELECT v_space_id AS space_id;
END;
$$;

SELECT '✅ Fixed ambiguous column with explicit AS alias' as status;