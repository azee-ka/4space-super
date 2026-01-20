-- Fix RLS policies and constraints for user content tables
-- This addresses 500 errors when querying with joins

-- =====================================================
-- DROP EXISTING PROBLEMATIC POLICIES
-- =====================================================

-- Drop existing policies on user_kept_messages
DROP POLICY IF EXISTS "user_kept_messages_select_own" ON public.user_kept_messages;
DROP POLICY IF EXISTS "user_kept_messages_insert_own" ON public.user_kept_messages;
DROP POLICY IF EXISTS "user_kept_messages_delete_own" ON public.user_kept_messages;

-- Drop existing policies on user_saved_messages
DROP POLICY IF EXISTS "user_saved_messages_select_own" ON public.user_saved_messages;
DROP POLICY IF EXISTS "user_saved_messages_insert_own" ON public.user_saved_messages;
DROP POLICY IF EXISTS "user_saved_messages_delete_own" ON public.user_saved_messages;

-- =====================================================
-- CREATE ENHANCED RLS POLICIES FOR USER_KEPT_MESSAGES
-- =====================================================

-- Users can view their own kept messages
-- This policy allows joins to messages table
CREATE POLICY "user_kept_messages_select_own"
  ON public.user_kept_messages FOR SELECT
  USING (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM public.messages m
      WHERE m.id = user_kept_messages.message_id
      AND m.deleted_at IS NULL
    )
  );

-- Users can insert their own kept messages
-- Ensure they can only keep messages they have access to
CREATE POLICY "user_kept_messages_insert_own"
  ON public.user_kept_messages FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM public.messages m
      WHERE m.id = message_id
      AND m.deleted_at IS NULL
      AND (
        -- Message in a conversation the user is part of
        (
          m.conversation_id IS NOT NULL
          AND EXISTS (
            SELECT 1 FROM public.conversation_participants cp
            WHERE cp.conversation_id = m.conversation_id
            AND cp.user_id = auth.uid()
          )
        )
        -- Or message in a space the user is part of
        OR (
          m.space_id IS NOT NULL
          AND (
            EXISTS (
              SELECT 1 FROM public.spaces s
              WHERE s.id = m.space_id
              AND s.owner_id = auth.uid()
            )
            OR EXISTS (
              SELECT 1 FROM public.space_members sm
              WHERE sm.space_id = m.space_id
              AND sm.user_id = auth.uid()
            )
          )
        )
      )
    )
  );

-- Users can delete their own kept messages
CREATE POLICY "user_kept_messages_delete_own"
  ON public.user_kept_messages FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- CREATE ENHANCED RLS POLICIES FOR USER_SAVED_MESSAGES
-- =====================================================

-- Users can view their own saved messages
-- This policy allows joins to messages table
CREATE POLICY "user_saved_messages_select_own"
  ON public.user_saved_messages FOR SELECT
  USING (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM public.messages m
      WHERE m.id = user_saved_messages.message_id
      AND m.deleted_at IS NULL
    )
  );

-- Users can insert their own saved messages
-- Ensure they can only save messages they have access to
CREATE POLICY "user_saved_messages_insert_own"
  ON public.user_saved_messages FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM public.messages m
      WHERE m.id = message_id
      AND m.deleted_at IS NULL
      AND (
        -- Message in a conversation the user is part of
        (
          m.conversation_id IS NOT NULL
          AND EXISTS (
            SELECT 1 FROM public.conversation_participants cp
            WHERE cp.conversation_id = m.conversation_id
            AND cp.user_id = auth.uid()
          )
        )
        -- Or message in a space the user is part of
        OR (
          m.space_id IS NOT NULL
          AND (
            EXISTS (
              SELECT 1 FROM public.spaces s
              WHERE s.id = m.space_id
              AND s.owner_id = auth.uid()
            )
            OR EXISTS (
              SELECT 1 FROM public.space_members sm
              WHERE sm.space_id = m.space_id
              AND sm.user_id = auth.uid()
            )
          )
        )
      )
    )
  );

-- Users can delete their own saved messages
CREATE POLICY "user_saved_messages_delete_own"
  ON public.user_saved_messages FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- FIX CONVERSATION_PARTICIPANTS RLS IF NEEDED
-- =====================================================

-- Recreate conversation_participants policies to ensure proper access
DROP POLICY IF EXISTS "conversation_participants_select_own" ON public.conversation_participants;

CREATE POLICY "conversation_participants_select_own"
  ON public.conversation_participants FOR SELECT
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.conversation_participants cp
      WHERE cp.conversation_id = conversation_participants.conversation_id
      AND cp.user_id = auth.uid()
    )
  );

-- =====================================================
-- ENSURE UPDATE_UPDATED_AT FUNCTION EXISTS
-- =====================================================

-- Create or replace the update_updated_at function
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- CLEAN UP ANY ORPHANED RECORDS
-- =====================================================

-- Remove any kept messages that reference non-existent messages
DELETE FROM public.user_kept_messages
WHERE NOT EXISTS (
  SELECT 1 FROM public.messages
  WHERE messages.id = user_kept_messages.message_id
);

-- Remove any saved messages that reference non-existent messages
DELETE FROM public.user_saved_messages
WHERE NOT EXISTS (
  SELECT 1 FROM public.messages
  WHERE messages.id = user_saved_messages.message_id
);

-- =====================================================
-- ADD HELPFUL COMMENTS
-- =====================================================

COMMENT ON TABLE public.user_kept_messages IS 'Messages that users want to keep even after conversation retention period expires';
COMMENT ON TABLE public.user_saved_messages IS 'Messages that users have bookmarked/saved for later reference';
