-- ╔════════════════════════════════════════════════════════════════╗
-- ║  STEP 7: RLS POLICIES (Part 2 of 2)                            ║
-- ║  Create security policies for remaining tables                 ║
-- ╚════════════════════════════════════════════════════════════════╝

-- ========================================
-- MESSAGE READ RECEIPTS
-- ========================================

CREATE POLICY "Users can view read receipts"
  ON public.message_read_receipts FOR SELECT
  USING (true);

CREATE POLICY "Users can mark messages as read"
  ON public.message_read_receipts FOR INSERT
  WITH CHECK (user_id = (SELECT auth.uid()));

-- ========================================
-- MESSAGE THREADS
-- ========================================

CREATE POLICY "Users can view message threads"
  ON public.message_threads FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.messages m
      WHERE m.id = message_threads.parent_message_id
        AND (
          (
            m.conversation_id IS NOT NULL
            AND EXISTS (
              SELECT 1 FROM public.conversation_participants
              WHERE conversation_participants.conversation_id = m.conversation_id
                AND conversation_participants.user_id = (SELECT auth.uid())
            )
          )
          OR (
            m.space_id IS NOT NULL
            AND (
              EXISTS (
                SELECT 1 FROM public.spaces
                WHERE spaces.id = m.space_id
                  AND spaces.owner_id = (SELECT auth.uid())
              )
              OR EXISTS (
                SELECT 1 FROM public.space_members
                WHERE space_members.space_id = m.space_id
                  AND space_members.user_id = (SELECT auth.uid())
              )
            )
          )
        )
    )
  );

-- ========================================
-- TYPING INDICATORS
-- ========================================

CREATE POLICY "Manage typing indicators"
  ON public.typing_indicators FOR ALL
  USING (true)
  WITH CHECK (user_id = (SELECT auth.uid()));

-- ========================================
-- NOTIFICATIONS
-- ========================================

CREATE POLICY "Users can view their own notifications"
  ON public.notifications FOR SELECT
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can update their own notifications"
  ON public.notifications FOR UPDATE
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can delete their own notifications"
  ON public.notifications FOR DELETE
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "System can create notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (true);

-- ========================================
-- SPACE INVITATIONS
-- ========================================

CREATE POLICY "Users can view their invitations"
  ON public.space_invitations FOR SELECT
  USING (
    invited_user_id = (SELECT auth.uid())
    OR invited_by_user_id = (SELECT auth.uid())
    OR space_id IN (
      SELECT id FROM public.spaces WHERE owner_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "Space owners can create invitations"
  ON public.space_invitations FOR INSERT
  WITH CHECK (
    space_id IN (
      SELECT id FROM public.spaces WHERE owner_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "Invited users can update their invitations"
  ON public.space_invitations FOR UPDATE
  USING (invited_user_id = (SELECT auth.uid()))
  WITH CHECK (invited_user_id = (SELECT auth.uid()));

-- ========================================
-- MEDIA FILES
-- ========================================

CREATE POLICY "Users can view media in their spaces"
  ON public.media_files FOR SELECT
  USING (
    space_id IN (
      SELECT id FROM public.spaces
      WHERE owner_id = (SELECT auth.uid())
    )
    OR space_id IN (
      SELECT space_id FROM public.space_members
      WHERE user_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "Users can upload media to their spaces"
  ON public.media_files FOR INSERT
  WITH CHECK (
    uploader_id = (SELECT auth.uid())
    AND (
      space_id IN (
        SELECT id FROM public.spaces
        WHERE owner_id = (SELECT auth.uid())
      )
      OR space_id IN (
        SELECT space_id FROM public.space_members
        WHERE user_id = (SELECT auth.uid())
      )
    )
  );

-- ========================================
-- CALLS
-- ========================================

CREATE POLICY "Users can view calls in their spaces"
  ON public.calls FOR SELECT
  USING (
    space_id IN (
      SELECT id FROM public.spaces
      WHERE owner_id = (SELECT auth.uid())
    )
    OR space_id IN (
      SELECT space_id FROM public.space_members
      WHERE user_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "Users can create calls in their spaces"
  ON public.calls FOR INSERT
  WITH CHECK (
    initiated_by = (SELECT auth.uid())
    AND (
      space_id IN (
        SELECT id FROM public.spaces
        WHERE owner_id = (SELECT auth.uid())
      )
      OR space_id IN (
        SELECT space_id FROM public.space_members
        WHERE user_id = (SELECT auth.uid())
      )
    )
  );

SELECT '✅ Step 7 Complete: RLS policies created for remaining 7 tables (part 2 of 2)' as status;