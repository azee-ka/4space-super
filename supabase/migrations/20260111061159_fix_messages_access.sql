-- ============================================
-- FIX MESSAGES & ROOM_MEMBERS ACCESS ERRORS
-- ============================================

-- The 406 and 400 errors mean RLS is blocking legitimate access
-- We need to allow users to see messages and members in rooms they have access to

-- ============================================
-- STEP 1: Fix ROOM_MEMBERS policies
-- ============================================

-- Drop the overly permissive policy
DROP POLICY IF EXISTS "room_members_all" ON public.room_members;

-- Allow users to see members in rooms they created
CREATE POLICY "room_members_select_created"
  ON public.room_members FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.rooms r
      WHERE r.id = room_members.room_id
      AND r.created_by = auth.uid()
    )
  );

-- Allow users to see their own memberships
CREATE POLICY "room_members_select_self"
  ON public.room_members FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Allow room creators to insert members
CREATE POLICY "room_members_insert"
  ON public.room_members FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.rooms r
      WHERE r.id = room_members.room_id
      AND r.created_by = auth.uid()
    )
  );

-- Allow room creators to delete members
CREATE POLICY "room_members_delete"
  ON public.room_members FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.rooms r
      WHERE r.id = room_members.room_id
      AND r.created_by = auth.uid()
    )
  );

-- ============================================
-- STEP 2: Fix MESSAGES policies
-- ============================================

-- Drop any existing message policies
DROP POLICY IF EXISTS "messages_select" ON public.messages;
DROP POLICY IF EXISTS "messages_insert" ON public.messages;
DROP POLICY IF EXISTS "messages_update" ON public.messages;
DROP POLICY IF EXISTS "messages_delete" ON public.messages;

-- Allow users to SELECT messages in rooms they created
CREATE POLICY "messages_select_created_rooms"
  ON public.messages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.rooms r
      WHERE r.id = messages.room_id
      AND r.created_by = auth.uid()
    )
  );

-- Allow users to SELECT messages in rooms they're members of
CREATE POLICY "messages_select_member_rooms"
  ON public.messages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.room_members rm
      WHERE rm.room_id = messages.room_id
      AND rm.user_id = auth.uid()
    )
  );

-- Allow users to INSERT messages in rooms they created
CREATE POLICY "messages_insert_created_rooms"
  ON public.messages FOR INSERT
  TO authenticated
  WITH CHECK (
    sender_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.rooms r
      WHERE r.id = messages.room_id
      AND r.created_by = auth.uid()
    )
  );

-- Allow users to INSERT messages in rooms they're members of
CREATE POLICY "messages_insert_member_rooms"
  ON public.messages FOR INSERT
  TO authenticated
  WITH CHECK (
    sender_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.room_members rm
      WHERE rm.room_id = messages.room_id
      AND rm.user_id = auth.uid()
    )
  );

-- Allow users to UPDATE their own messages
CREATE POLICY "messages_update_own"
  ON public.messages FOR UPDATE
  TO authenticated
  USING (sender_id = auth.uid())
  WITH CHECK (sender_id = auth.uid());

-- Allow users to DELETE their own messages
CREATE POLICY "messages_delete_own"
  ON public.messages FOR DELETE
  TO authenticated
  USING (sender_id = auth.uid());

-- ============================================
-- STEP 3: Ensure RLS is enabled
-- ============================================

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_members ENABLE ROW LEVEL SECURITY;

-- ============================================
-- STEP 4: Grant permissions
-- ============================================

GRANT ALL ON public.messages TO authenticated;
GRANT ALL ON public.room_members TO authenticated;

-- ============================================
-- VERIFICATION
-- ============================================

-- Test 1: Can you see room members?
-- SELECT * FROM room_members 
-- WHERE room_id IN (SELECT id FROM rooms WHERE created_by = auth.uid());

-- Test 2: Can you send a message?
-- INSERT INTO messages (room_id, sender_id, content, type)
-- VALUES ('your-room-id', auth.uid(), 'Test message', 'text')
-- RETURNING *;

-- Test 3: Can you see messages?
-- SELECT * FROM messages 
-- WHERE room_id IN (SELECT id FROM rooms WHERE created_by = auth.uid());