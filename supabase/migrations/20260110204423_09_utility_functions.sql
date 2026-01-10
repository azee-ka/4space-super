-- ╔════════════════════════════════════════════════════════════════╗
-- ║  STEP 9: UTILITY FUNCTIONS                                     ║
-- ║  Create helper functions for app functionality                 ║
-- ╚════════════════════════════════════════════════════════════════╝

-- ========================================
-- FUNCTION: Search users
-- ========================================

CREATE FUNCTION public.search_users(
  p_query TEXT,
  p_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
  id UUID,
  email TEXT,
  username TEXT,
  display_name TEXT,
  avatar_url TEXT,
  relevance_score INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.email,
    p.username,
    p.display_name,
    p.avatar_url,
    CASE
      WHEN LOWER(p.email) = LOWER(p_query) THEN 100
      WHEN LOWER(p.email) LIKE LOWER(p_query) || '%' THEN 90
      WHEN LOWER(p.username) = LOWER(p_query) THEN 85
      WHEN LOWER(p.username) LIKE LOWER(p_query) || '%' THEN 80
      WHEN LOWER(p.display_name) = LOWER(p_query) THEN 75
      WHEN LOWER(p.display_name) LIKE LOWER(p_query) || '%' THEN 70
      WHEN LOWER(p.email) LIKE '%' || LOWER(p_query) || '%' THEN 60
      WHEN LOWER(p.username) LIKE '%' || LOWER(p_query) || '%' THEN 55
      WHEN LOWER(p.display_name) LIKE '%' || LOWER(p_query) || '%' THEN 50
      ELSE 0
    END AS relevance_score
  FROM public.profiles p
  WHERE
    p.id != auth.uid()
    AND (
      LOWER(p.email) LIKE '%' || LOWER(p_query) || '%'
      OR LOWER(p.username) LIKE '%' || LOWER(p_query) || '%'
      OR LOWER(p.display_name) LIKE '%' || LOWER(p_query) || '%'
    )
  ORDER BY relevance_score DESC, p.display_name
  LIMIT p_limit;
END;
$$;

-- ========================================
-- FUNCTION: Get user spaces
-- ========================================

CREATE FUNCTION public.get_user_spaces()
RETURNS TABLE (
  id UUID,
  name TEXT,
  description TEXT,
  type space_type,
  privacy space_privacy,
  icon TEXT,
  color TEXT,
  owner_id UUID,
  members_count INTEGER,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  is_owner BOOLEAN,
  user_role member_role
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    s.id,
    s.name,
    s.description,
    s.type,
    s.privacy,
    s.icon,
    s.color,
    s.owner_id,
    s.members_count,
    s.created_at,
    s.updated_at,
    (s.owner_id = auth.uid()) AS is_owner,
    COALESCE(sm.role, 'viewer'::member_role) AS user_role
  FROM public.spaces s
  LEFT JOIN public.space_members sm ON sm.space_id = s.id AND sm.user_id = auth.uid()
  WHERE
    s.owner_id = auth.uid()
    OR sm.user_id = auth.uid()
  ORDER BY s.updated_at DESC;
END;
$$;

-- ========================================
-- FUNCTION: Get or create direct conversation
-- ========================================

CREATE FUNCTION public.get_or_create_direct_conversation(other_user_id UUID)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_conversation_id UUID;
  v_current_user_id UUID;
BEGIN
  v_current_user_id := auth.uid();

  -- Check if conversation already exists
  SELECT c.id INTO v_conversation_id
  FROM public.conversations c
  WHERE c.is_group = false
    AND EXISTS (
      SELECT 1 FROM public.conversation_participants cp1
      WHERE cp1.conversation_id = c.id AND cp1.user_id = v_current_user_id
    )
    AND EXISTS (
      SELECT 1 FROM public.conversation_participants cp2
      WHERE cp2.conversation_id = c.id AND cp2.user_id = other_user_id
    )
    AND (
      SELECT COUNT(*) FROM public.conversation_participants cp3
      WHERE cp3.conversation_id = c.id
    ) = 2;

  IF v_conversation_id IS NOT NULL THEN
    RETURN v_conversation_id;
  END IF;

  -- Create new conversation
  INSERT INTO public.conversations (is_group, created_by)
  VALUES (false, v_current_user_id)
  RETURNING id INTO v_conversation_id;

  -- Add participants
  INSERT INTO public.conversation_participants (conversation_id, user_id)
  VALUES (v_conversation_id, v_current_user_id), (v_conversation_id, other_user_id);

  RETURN v_conversation_id;
END;
$$;

-- ========================================
-- FUNCTION: Accept space invitation
-- ========================================

CREATE FUNCTION public.accept_space_invitation(invitation_id UUID)
RETURNS VOID
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
  SELECT space_id, invited_user_id, role, invited_by_user_id
  INTO v_space_id, v_user_id, v_role, v_invited_by
  FROM public.space_invitations
  WHERE id = invitation_id AND invited_user_id = auth.uid() AND status = 'pending';

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
  WHERE id = invitation_id;

  -- Create notification for inviter
  INSERT INTO public.notifications (user_id, type, title, message, data)
  VALUES (
    v_invited_by,
    'member_joined',
    'Invitation Accepted',
    'Someone accepted your space invitation',
    jsonb_build_object('space_id', v_space_id, 'user_id', v_user_id)
  );
END;
$$;

-- ========================================
-- FUNCTION: Reject space invitation
-- ========================================

CREATE FUNCTION public.reject_space_invitation(invitation_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.space_invitations
  SET status = 'rejected', updated_at = NOW()
  WHERE id = invitation_id AND invited_user_id = auth.uid() AND status = 'pending';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invitation not found or already processed';
  END IF;
END;
$$;

SELECT '✅ Step 9 Complete: Utility functions created (search, get_user_spaces, conversations, invitations)' as status;