-- Drop ALL policies on messages table
DROP POLICY IF EXISTS "Room members can send messages" ON messages;
DROP POLICY IF EXISTS "Users can delete own messages" ON messages;
DROP POLICY IF EXISTS "Users can send messages" ON messages;
DROP POLICY IF EXISTS "Users can update own messages" ON messages;
DROP POLICY IF EXISTS "Users can view messages in their conversations or spaces" ON messages;
DROP POLICY IF EXISTS "Users can view room messages" ON messages;
DROP POLICY IF EXISTS "messages_delete_own" ON messages;
DROP POLICY IF EXISTS "messages_insert_own" ON messages;
DROP POLICY IF EXISTS "messages_select_all" ON messages;
DROP POLICY IF EXISTS "messages_update_own" ON messages;

-- ============================================
-- CREATE CLEAN POLICIES
-- ============================================

-- SELECT: Users can view messages in rooms they're members of
CREATE POLICY "select_room_messages"
ON messages FOR SELECT
TO authenticated
USING (
  room_id IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM room_members
    WHERE room_members.room_id = messages.room_id
    AND room_members.user_id = auth.uid()
  )
);

-- SELECT: Users can view messages in conversations they're part of (if you use conversations)
CREATE POLICY "select_conversation_messages"
ON messages FOR SELECT
TO authenticated
USING (
  conversation_id IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM conversation_participants
    WHERE conversation_participants.conversation_id = messages.conversation_id
    AND conversation_participants.user_id = auth.uid()
  )
);

-- INSERT: Users can send messages in rooms they're members of
CREATE POLICY "insert_room_messages"
ON messages FOR INSERT
TO authenticated
WITH CHECK (
  room_id IS NOT NULL
  AND sender_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM room_members
    WHERE room_members.room_id = messages.room_id
    AND room_members.user_id = auth.uid()
  )
);

-- INSERT: Users can send messages in conversations they're part of
CREATE POLICY "insert_conversation_messages"
ON messages FOR INSERT
TO authenticated
WITH CHECK (
  conversation_id IS NOT NULL
  AND sender_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM conversation_participants
    WHERE conversation_participants.conversation_id = messages.conversation_id
    AND conversation_participants.user_id = auth.uid()
  )
);

-- UPDATE: Users can update their own messages
CREATE POLICY "update_own_messages"
ON messages FOR UPDATE
TO authenticated
USING (sender_id = auth.uid())
WITH CHECK (sender_id = auth.uid());

-- DELETE: Users can delete their own messages (soft delete)
CREATE POLICY "delete_own_messages"
ON messages FOR DELETE
TO authenticated
USING (sender_id = auth.uid());