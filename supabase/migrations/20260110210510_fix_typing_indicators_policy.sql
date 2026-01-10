-- Fix typing indicators policy to be more restrictive

DROP POLICY IF EXISTS "Manage typing indicators" ON public.typing_indicators;

-- Split into separate policies for better security
CREATE POLICY "Users can view typing indicators"
  ON public.typing_indicators FOR SELECT
  USING (
    -- Can view typing in conversations you're part of
    (conversation_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.conversation_participants
      WHERE conversation_participants.conversation_id = typing_indicators.conversation_id
        AND conversation_participants.user_id = (SELECT auth.uid())
    ))
    OR
    -- Can view typing in spaces you're member of
    (space_id IS NOT NULL AND (
      EXISTS (
        SELECT 1 FROM public.spaces
        WHERE spaces.id = typing_indicators.space_id
          AND spaces.owner_id = (SELECT auth.uid())
      )
      OR EXISTS (
        SELECT 1 FROM public.space_members
        WHERE space_members.space_id = typing_indicators.space_id
          AND space_members.user_id = (SELECT auth.uid())
      )
    ))
  );

CREATE POLICY "Users can manage own typing status"
  ON public.typing_indicators FOR ALL
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));