-- ╔════════════════════════════════════════════════════════════════╗
-- ║  STEP 6: RLS POLICIES (Part 1 of 2)                            ║
-- ║  Create security policies for first half of tables             ║
-- ╚════════════════════════════════════════════════════════════════╝

-- ========================================
-- PROFILES
-- ========================================

CREATE POLICY "Public profiles viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (id = (SELECT auth.uid()))
  WITH CHECK (id = (SELECT auth.uid()));

-- ========================================
-- SPACES
-- ========================================

CREATE POLICY "Users can view own and public spaces"
  ON public.spaces FOR SELECT
  USING (
    owner_id = (SELECT auth.uid())
    OR privacy = 'public'
  );

CREATE POLICY "Users can create spaces"
  ON public.spaces FOR INSERT
  WITH CHECK (owner_id = (SELECT auth.uid()));

CREATE POLICY "Owners can update spaces"
  ON public.spaces FOR UPDATE
  USING (owner_id = (SELECT auth.uid()))
  WITH CHECK (owner_id = (SELECT auth.uid()));

CREATE POLICY "Owners can delete spaces"
  ON public.spaces FOR DELETE
  USING (owner_id = (SELECT auth.uid()));

-- ========================================
-- SPACE MEMBERS
-- ========================================

CREATE POLICY "Users can view their memberships"
  ON public.space_members FOR SELECT
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Only owners add members directly"
  ON public.space_members FOR INSERT
  WITH CHECK (
    space_id IN (
      SELECT id FROM public.spaces
      WHERE owner_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "Owners can update member roles"
  ON public.space_members FOR UPDATE
  USING (
    space_id IN (
      SELECT id FROM public.spaces
      WHERE owner_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "Owners can remove or users can leave"
  ON public.space_members FOR DELETE
  USING (
    space_id IN (
      SELECT id FROM public.spaces
      WHERE owner_id = (SELECT auth.uid())
    )
    OR user_id = (SELECT auth.uid())
  );

-- ========================================
-- CONVERSATIONS
-- ========================================

CREATE POLICY "Users can view their conversations"
  ON public.conversations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.conversation_participants
      WHERE conversation_participants.conversation_id = conversations.id
        AND conversation_participants.user_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "Users can create conversations"
  ON public.conversations FOR INSERT
  WITH CHECK (created_by = (SELECT auth.uid()));

CREATE POLICY "Participants can update conversations"
  ON public.conversations FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.conversation_participants
      WHERE conversation_participants.conversation_id = conversations.id
        AND conversation_participants.user_id = (SELECT auth.uid())
    )
  );

-- ========================================
-- CONVERSATION PARTICIPANTS
-- ========================================

CREATE POLICY "Users can manage conversation participation"
  ON public.conversation_participants FOR ALL
  USING (
    user_id = (SELECT auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.conversation_participants cp
      WHERE cp.conversation_id = conversation_participants.conversation_id
        AND cp.user_id = (SELECT auth.uid())
    )
  )
  WITH CHECK (user_id = (SELECT auth.uid()));

-- ========================================
-- MESSAGES
-- ========================================

CREATE POLICY "Users can view messages in their conversations or spaces"
  ON public.messages FOR SELECT
  USING (
    (
      conversation_id IS NOT NULL
      AND EXISTS (
        SELECT 1 FROM public.conversation_participants
        WHERE conversation_participants.conversation_id = messages.conversation_id
          AND conversation_participants.user_id = (SELECT auth.uid())
      )
    )
    OR
    (
      space_id IS NOT NULL
      AND (
        EXISTS (
          SELECT 1 FROM public.spaces
          WHERE spaces.id = messages.space_id
            AND spaces.owner_id = (SELECT auth.uid())
        )
        OR EXISTS (
          SELECT 1 FROM public.space_members
          WHERE space_members.space_id = messages.space_id
            AND space_members.user_id = (SELECT auth.uid())
        )
      )
    )
  );

CREATE POLICY "Users can send messages"
  ON public.messages FOR INSERT
  WITH CHECK (
    sender_id = (SELECT auth.uid())
    AND (
      (
        conversation_id IS NOT NULL
        AND EXISTS (
          SELECT 1 FROM public.conversation_participants
          WHERE conversation_participants.conversation_id = messages.conversation_id
            AND conversation_participants.user_id = (SELECT auth.uid())
        )
      )
      OR
      (
        space_id IS NOT NULL
        AND (
          EXISTS (
            SELECT 1 FROM public.spaces
            WHERE spaces.id = messages.space_id
              AND spaces.owner_id = (SELECT auth.uid())
          )
          OR EXISTS (
            SELECT 1 FROM public.space_members
            WHERE space_members.space_id = messages.space_id
              AND space_members.user_id = (SELECT auth.uid())
          )
        )
      )
    )
  );

CREATE POLICY "Users can update own messages"
  ON public.messages FOR UPDATE
  USING (sender_id = (SELECT auth.uid()))
  WITH CHECK (sender_id = (SELECT auth.uid()));

CREATE POLICY "Users can delete own messages"
  ON public.messages FOR DELETE
  USING (sender_id = (SELECT auth.uid()));

-- ========================================
-- MESSAGE REACTIONS
-- ========================================

CREATE POLICY "Anyone can view reactions"
  ON public.message_reactions FOR SELECT
  USING (true);

CREATE POLICY "Users can add reactions"
  ON public.message_reactions FOR INSERT
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can delete own reactions"
  ON public.message_reactions FOR DELETE
  USING (user_id = (SELECT auth.uid()));

SELECT '✅ Step 6 Complete: RLS policies created for 7 tables (part 1 of 2)' as status;