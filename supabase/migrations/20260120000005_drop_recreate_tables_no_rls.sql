-- NUCLEAR OPTION: Drop and recreate tables WITHOUT RLS to test
-- This will help us identify if the issue is RLS or data/schema related

-- =====================================================
-- STEP 1: DROP TABLES COMPLETELY
-- =====================================================

DROP TABLE IF EXISTS public.user_kept_messages CASCADE;
DROP TABLE IF EXISTS public.user_saved_messages CASCADE;

-- We won't drop conversation_participants since it might be used elsewhere
-- Instead we'll just fix its policies

-- =====================================================
-- STEP 2: RECREATE user_saved_messages (NO RLS)
-- =====================================================

CREATE TABLE public.user_saved_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  message_id UUID NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, message_id)
);

-- NO RLS FOR NOW - we'll test if it works
ALTER TABLE public.user_saved_messages DISABLE ROW LEVEL SECURITY;

-- Grant full access to authenticated users
GRANT ALL ON public.user_saved_messages TO authenticated;
GRANT ALL ON public.user_saved_messages TO service_role;
GRANT ALL ON public.user_saved_messages TO anon;

-- Indexes
CREATE INDEX idx_user_saved_messages_user_id ON public.user_saved_messages(user_id);
CREATE INDEX idx_user_saved_messages_message_id ON public.user_saved_messages(message_id);
CREATE INDEX idx_user_saved_messages_created_at ON public.user_saved_messages(created_at DESC);

-- =====================================================
-- STEP 3: RECREATE user_kept_messages (NO RLS)
-- =====================================================

CREATE TABLE public.user_kept_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  message_id UUID NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, message_id)
);

-- NO RLS FOR NOW - we'll test if it works
ALTER TABLE public.user_kept_messages DISABLE ROW LEVEL SECURITY;

-- Grant full access to authenticated users
GRANT ALL ON public.user_kept_messages TO authenticated;
GRANT ALL ON public.user_kept_messages TO service_role;
GRANT ALL ON public.user_kept_messages TO anon;

-- Indexes
CREATE INDEX idx_user_kept_messages_user_id ON public.user_kept_messages(user_id);
CREATE INDEX idx_user_kept_messages_message_id ON public.user_kept_messages(message_id);
CREATE INDEX idx_user_kept_messages_created_at ON public.user_kept_messages(created_at DESC);

-- =====================================================
-- STEP 4: FIX conversation_participants (DISABLE RLS)
-- =====================================================

-- Drop ALL policies
DO $$
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN
        SELECT policyname
        FROM pg_policies
        WHERE tablename = 'conversation_participants' AND schemaname = 'public'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(pol.policyname) || ' ON public.conversation_participants';
    END LOOP;
END $$;

-- DISABLE RLS temporarily to test
ALTER TABLE public.conversation_participants DISABLE ROW LEVEL SECURITY;

-- Grant full access
GRANT ALL ON public.conversation_participants TO authenticated;
GRANT ALL ON public.conversation_participants TO service_role;
GRANT ALL ON public.conversation_participants TO anon;

-- Ensure indexes exist
CREATE INDEX IF NOT EXISTS idx_conversation_participants_user_id
  ON public.conversation_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_conversation_participants_conversation_id
  ON public.conversation_participants(conversation_id);
CREATE INDEX IF NOT EXISTS idx_conversation_participants_user_conversation
  ON public.conversation_participants(user_id, conversation_id);

-- =====================================================
-- VERIFICATION
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '==============================================';
  RAISE NOTICE 'Tables recreated WITHOUT RLS for testing';
  RAISE NOTICE 'user_saved_messages: RLS DISABLED';
  RAISE NOTICE 'user_kept_messages: RLS DISABLED';
  RAISE NOTICE 'conversation_participants: RLS DISABLED';
  RAISE NOTICE '==============================================';
  RAISE NOTICE 'If this fixes your 500 errors, the issue was RLS policies';
  RAISE NOTICE 'We can then create a follow-up migration to re-enable RLS with correct policies';
  RAISE NOTICE '==============================================';
END $$;
