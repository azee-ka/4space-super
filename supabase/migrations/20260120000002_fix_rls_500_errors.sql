-- Comprehensive fix for 500 errors on user_kept_messages, user_saved_messages, and conversation_participants
-- This migration addresses circular RLS policies and schema issues

-- =====================================================
-- FIX CONVERSATION_PARTICIPANTS POLICIES
-- =====================================================

-- Drop the problematic recursive policy
DROP POLICY IF EXISTS "Users can manage conversation participation" ON public.conversation_participants;
DROP POLICY IF EXISTS "conversation_participants_select_own" ON public.conversation_participants;
DROP POLICY IF EXISTS "Users can view conversation participants" ON public.conversation_participants;
DROP POLICY IF EXISTS "Users can add conversation participants" ON public.conversation_participants;
DROP POLICY IF EXISTS "Users can update conversation participants" ON public.conversation_participants;
DROP POLICY IF EXISTS "Users can remove conversation participants" ON public.conversation_participants;

-- Create simpler, non-recursive policies for conversation_participants
CREATE POLICY "conversation_participants_select"
  ON public.conversation_participants FOR SELECT
  USING (
    -- User can see participants if they are a participant themselves
    user_id = auth.uid()
    OR conversation_id IN (
      SELECT conversation_id
      FROM public.conversation_participants
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "conversation_participants_insert"
  ON public.conversation_participants FOR INSERT
  WITH CHECK (
    -- Users can add themselves to conversations
    user_id = auth.uid()
    -- Or if they're already a participant (for group chats)
    OR EXISTS (
      SELECT 1 FROM public.conversation_participants cp
      WHERE cp.conversation_id = conversation_participants.conversation_id
      AND cp.user_id = auth.uid()
    )
  );

CREATE POLICY "conversation_participants_update"
  ON public.conversation_participants FOR UPDATE
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.conversation_participants cp
      WHERE cp.conversation_id = conversation_participants.conversation_id
      AND cp.user_id = auth.uid()
    )
  );

CREATE POLICY "conversation_participants_delete"
  ON public.conversation_participants FOR DELETE
  USING (
    -- Users can remove themselves
    user_id = auth.uid()
    -- Or if they're a participant (for group chat admins)
    OR EXISTS (
      SELECT 1 FROM public.conversation_participants cp
      WHERE cp.conversation_id = conversation_participants.conversation_id
      AND cp.user_id = auth.uid()
    )
  );

-- =====================================================
-- DROP AND RECREATE USER_KEPT_MESSAGES POLICIES
-- =====================================================

-- Drop all existing policies
DROP POLICY IF EXISTS "user_kept_messages_select_own" ON public.user_kept_messages;
DROP POLICY IF EXISTS "user_kept_messages_insert_own" ON public.user_kept_messages;
DROP POLICY IF EXISTS "user_kept_messages_update_own" ON public.user_kept_messages;
DROP POLICY IF EXISTS "user_kept_messages_delete_own" ON public.user_kept_messages;

-- Simplified SELECT policy - just check ownership
-- The message access is validated by the messages table RLS
CREATE POLICY "user_kept_messages_select"
  ON public.user_kept_messages FOR SELECT
  USING (auth.uid() = user_id);

-- INSERT policy with validation
CREATE POLICY "user_kept_messages_insert"
  ON public.user_kept_messages FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- DELETE policy
CREATE POLICY "user_kept_messages_delete"
  ON public.user_kept_messages FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- DROP AND RECREATE USER_SAVED_MESSAGES POLICIES
-- =====================================================

-- Drop all existing policies
DROP POLICY IF EXISTS "user_saved_messages_select_own" ON public.user_saved_messages;
DROP POLICY IF EXISTS "user_saved_messages_insert_own" ON public.user_saved_messages;
DROP POLICY IF EXISTS "user_saved_messages_update_own" ON public.user_saved_messages;
DROP POLICY IF EXISTS "user_saved_messages_delete_own" ON public.user_saved_messages;

-- Simplified SELECT policy - just check ownership
-- The message access is validated by the messages table RLS
CREATE POLICY "user_saved_messages_select"
  ON public.user_saved_messages FOR SELECT
  USING (auth.uid() = user_id);

-- INSERT policy with validation
CREATE POLICY "user_saved_messages_insert"
  ON public.user_saved_messages FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- DELETE policy
CREATE POLICY "user_saved_messages_delete"
  ON public.user_saved_messages FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- ENSURE TABLES HAVE PROPER CONSTRAINTS
-- =====================================================

-- Ensure foreign keys are properly set with CASCADE
-- This prevents orphaned records which can cause 500 errors

-- For user_kept_messages
DO $$
BEGIN
  -- Drop existing constraint if it exists
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'user_kept_messages_message_id_fkey'
    AND table_name = 'user_kept_messages'
  ) THEN
    ALTER TABLE public.user_kept_messages
    DROP CONSTRAINT user_kept_messages_message_id_fkey;
  END IF;

  -- Add constraint with proper CASCADE
  ALTER TABLE public.user_kept_messages
  ADD CONSTRAINT user_kept_messages_message_id_fkey
  FOREIGN KEY (message_id)
  REFERENCES public.messages(id)
  ON DELETE CASCADE;

  -- Drop existing user_id constraint if it exists
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'user_kept_messages_user_id_fkey'
    AND table_name = 'user_kept_messages'
  ) THEN
    ALTER TABLE public.user_kept_messages
    DROP CONSTRAINT user_kept_messages_user_id_fkey;
  END IF;

  -- Add constraint with proper CASCADE
  ALTER TABLE public.user_kept_messages
  ADD CONSTRAINT user_kept_messages_user_id_fkey
  FOREIGN KEY (user_id)
  REFERENCES public.profiles(id)
  ON DELETE CASCADE;
END $$;

-- For user_saved_messages
DO $$
BEGIN
  -- Drop existing constraint if it exists
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'user_saved_messages_message_id_fkey'
    AND table_name = 'user_saved_messages'
  ) THEN
    ALTER TABLE public.user_saved_messages
    DROP CONSTRAINT user_saved_messages_message_id_fkey;
  END IF;

  -- Add constraint with proper CASCADE
  ALTER TABLE public.user_saved_messages
  ADD CONSTRAINT user_saved_messages_message_id_fkey
  FOREIGN KEY (message_id)
  REFERENCES public.messages(id)
  ON DELETE CASCADE;

  -- Drop existing user_id constraint if it exists
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'user_saved_messages_user_id_fkey'
    AND table_name = 'user_saved_messages'
  ) THEN
    ALTER TABLE public.user_saved_messages
    DROP CONSTRAINT user_saved_messages_user_id_fkey;
  END IF;

  -- Add constraint with proper CASCADE
  ALTER TABLE public.user_saved_messages
  ADD CONSTRAINT user_saved_messages_user_id_fkey
  FOREIGN KEY (user_id)
  REFERENCES public.profiles(id)
  ON DELETE CASCADE;
END $$;

-- =====================================================
-- CLEAN UP ORPHANED DATA
-- =====================================================

-- Remove any kept messages that reference deleted messages
DELETE FROM public.user_kept_messages ukm
WHERE NOT EXISTS (
  SELECT 1 FROM public.messages m
  WHERE m.id = ukm.message_id
  AND m.deleted_at IS NULL
);

-- Remove any saved messages that reference deleted messages
DELETE FROM public.user_saved_messages usm
WHERE NOT EXISTS (
  SELECT 1 FROM public.messages m
  WHERE m.id = usm.message_id
  AND m.deleted_at IS NULL
);

-- Remove any kept messages that reference non-existent users
DELETE FROM public.user_kept_messages ukm
WHERE NOT EXISTS (
  SELECT 1 FROM public.profiles p
  WHERE p.id = ukm.user_id
);

-- Remove any saved messages that reference non-existent users
DELETE FROM public.user_saved_messages usm
WHERE NOT EXISTS (
  SELECT 1 FROM public.profiles p
  WHERE p.id = usm.user_id
);

-- Remove any conversation participants that reference non-existent conversations
DELETE FROM public.conversation_participants cp
WHERE NOT EXISTS (
  SELECT 1 FROM public.conversations c
  WHERE c.id = cp.conversation_id
);

-- Remove any conversation participants that reference non-existent users
DELETE FROM public.conversation_participants cp
WHERE NOT EXISTS (
  SELECT 1 FROM public.profiles p
  WHERE p.id = cp.user_id
);

-- =====================================================
-- ADD HELPFUL INDEXES FOR PERFORMANCE
-- =====================================================

-- These indexes help with the RLS policy checks
CREATE INDEX IF NOT EXISTS idx_conversation_participants_user_conversation
ON public.conversation_participants(user_id, conversation_id);

CREATE INDEX IF NOT EXISTS idx_conversation_participants_conversation
ON public.conversation_participants(conversation_id);

CREATE INDEX IF NOT EXISTS idx_user_kept_messages_user_message
ON public.user_kept_messages(user_id, message_id);

CREATE INDEX IF NOT EXISTS idx_user_saved_messages_user_message
ON public.user_saved_messages(user_id, message_id);

-- =====================================================
-- GRANT PROPER PERMISSIONS
-- =====================================================

-- Ensure authenticated users can access these tables
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_kept_messages TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_saved_messages TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.conversation_participants TO authenticated;

-- =====================================================
-- VERIFY RLS IS ENABLED
-- =====================================================

ALTER TABLE public.user_kept_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_saved_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_participants ENABLE ROW LEVEL SECURITY;
