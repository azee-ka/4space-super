-- Re-enable RLS with simple, working policies
-- The key is to keep policies simple and let the application handle complex authorization

-- =====================================================
-- STEP 1: ENABLE RLS ON user_saved_messages
-- =====================================================

ALTER TABLE public.user_saved_messages ENABLE ROW LEVEL SECURITY;

-- Simple policy: users can only see/modify their own saved messages
-- We don't check message access here - that's handled by the messages table RLS
CREATE POLICY "user_saved_messages_policy"
  ON public.user_saved_messages
  AS PERMISSIVE
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- =====================================================
-- STEP 2: ENABLE RLS ON user_kept_messages
-- =====================================================

ALTER TABLE public.user_kept_messages ENABLE ROW LEVEL SECURITY;

-- Simple policy: users can only see/modify their own kept messages
-- We don't check message access here - that's handled by the messages table RLS
CREATE POLICY "user_kept_messages_policy"
  ON public.user_kept_messages
  AS PERMISSIVE
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- =====================================================
-- STEP 3: ENABLE RLS ON conversation_participants
-- =====================================================

ALTER TABLE public.conversation_participants ENABLE ROW LEVEL SECURITY;

-- Policy 1: Users can see participants in conversations they're part of
CREATE POLICY "conversation_participants_select"
  ON public.conversation_participants
  AS PERMISSIVE
  FOR SELECT
  TO authenticated
  USING (
    -- Either they are the participant being queried
    user_id = auth.uid()
    -- Or they are in the same conversation (using a simple subquery)
    OR conversation_id IN (
      SELECT conversation_id
      FROM public.conversation_participants
      WHERE user_id = auth.uid()
    )
  );

-- Policy 2: Users can add themselves to conversations
CREATE POLICY "conversation_participants_insert"
  ON public.conversation_participants
  AS PERMISSIVE
  FOR INSERT
  TO authenticated
  WITH CHECK (
    -- Can only add yourself, unless you're already a participant
    user_id = auth.uid()
    OR conversation_id IN (
      SELECT conversation_id
      FROM public.conversation_participants
      WHERE user_id = auth.uid()
    )
  );

-- Policy 3: Users can update their own participation
CREATE POLICY "conversation_participants_update"
  ON public.conversation_participants
  AS PERMISSIVE
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Policy 4: Users can remove themselves from conversations
CREATE POLICY "conversation_participants_delete"
  ON public.conversation_participants
  AS PERMISSIVE
  FOR DELETE
  TO authenticated
  USING (
    user_id = auth.uid()
    -- Allow participants to remove others (for group admins)
    OR conversation_id IN (
      SELECT conversation_id
      FROM public.conversation_participants
      WHERE user_id = auth.uid()
    )
  );

-- =====================================================
-- STEP 4: REVOKE UNNECESSARY PERMISSIONS
-- =====================================================

-- Remove anon access (authenticated users only)
REVOKE ALL ON public.user_saved_messages FROM anon;
REVOKE ALL ON public.user_kept_messages FROM anon;
REVOKE ALL ON public.conversation_participants FROM anon;

-- Keep authenticated and service_role
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_saved_messages TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_kept_messages TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.conversation_participants TO authenticated;

GRANT ALL ON public.user_saved_messages TO service_role;
GRANT ALL ON public.user_kept_messages TO service_role;
GRANT ALL ON public.conversation_participants TO service_role;

-- =====================================================
-- VERIFICATION
-- =====================================================

DO $$
DECLARE
  rls_saved BOOLEAN;
  rls_kept BOOLEAN;
  rls_participants BOOLEAN;
  policy_count_saved INT;
  policy_count_kept INT;
  policy_count_participants INT;
BEGIN
  -- Check RLS is enabled
  SELECT relrowsecurity INTO rls_saved
  FROM pg_class WHERE oid = 'public.user_saved_messages'::regclass;

  SELECT relrowsecurity INTO rls_kept
  FROM pg_class WHERE oid = 'public.user_kept_messages'::regclass;

  SELECT relrowsecurity INTO rls_participants
  FROM pg_class WHERE oid = 'public.conversation_participants'::regclass;

  -- Count policies
  SELECT COUNT(*) INTO policy_count_saved
  FROM pg_policies WHERE tablename = 'user_saved_messages' AND schemaname = 'public';

  SELECT COUNT(*) INTO policy_count_kept
  FROM pg_policies WHERE tablename = 'user_kept_messages' AND schemaname = 'public';

  SELECT COUNT(*) INTO policy_count_participants
  FROM pg_policies WHERE tablename = 'conversation_participants' AND schemaname = 'public';

  RAISE NOTICE '==============================================';
  RAISE NOTICE 'RLS RE-ENABLED WITH SIMPLE POLICIES';
  RAISE NOTICE '==============================================';
  RAISE NOTICE 'user_saved_messages: RLS=% (% policies)', rls_saved, policy_count_saved;
  RAISE NOTICE 'user_kept_messages: RLS=% (% policies)', rls_kept, policy_count_kept;
  RAISE NOTICE 'conversation_participants: RLS=% (% policies)', rls_participants, policy_count_participants;
  RAISE NOTICE '==============================================';

  IF NOT (rls_saved AND rls_kept AND rls_participants) THEN
    RAISE EXCEPTION 'RLS is not enabled on all tables!';
  END IF;

  IF policy_count_saved = 0 OR policy_count_kept = 0 OR policy_count_participants = 0 THEN
    RAISE EXCEPTION 'Some tables have no policies!';
  END IF;

  RAISE NOTICE 'SUCCESS: All tables secured with RLS';
  RAISE NOTICE '==============================================';
END $$;
