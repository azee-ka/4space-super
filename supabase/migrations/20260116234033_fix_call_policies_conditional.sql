-- Fix Call System Policies - Conditional Creation
-- Created: 2026-01-16
-- Description: Update call system policies to handle duplicates gracefully

-- Drop and recreate policies for call_sessions (everyone in room can see active sessions)
DROP POLICY IF EXISTS "Allow read access to active call sessions" ON call_sessions;
CREATE POLICY "Allow read access to active call sessions"
  ON call_sessions FOR SELECT
  USING (is_active = true);

DROP POLICY IF EXISTS "Allow insert for authenticated users" ON call_sessions;
CREATE POLICY "Allow insert for authenticated users"
  ON call_sessions FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow update for session host" ON call_sessions;
CREATE POLICY "Allow update for session host"
  ON call_sessions FOR UPDATE
  USING (host_id = auth.uid()::text);

-- Drop and recreate policies for call_history (users can see their own history)
DROP POLICY IF EXISTS "Allow users to read their own call history" ON call_history;
CREATE POLICY "Allow users to read their own call history"
  ON call_history FOR SELECT
  USING (user_id = auth.uid()::text);

DROP POLICY IF EXISTS "Allow users to insert their own call history" ON call_history;
CREATE POLICY "Allow users to insert their own call history"
  ON call_history FOR INSERT
  WITH CHECK (user_id = auth.uid()::text);

-- Drop and recreate policies for screen_share_sessions
DROP POLICY IF EXISTS "Allow read access to screen share sessions" ON screen_share_sessions;
CREATE POLICY "Allow read access to screen share sessions"
  ON screen_share_sessions FOR SELECT
  USING (is_active = true);

DROP POLICY IF EXISTS "Allow insert for presenters" ON screen_share_sessions;
CREATE POLICY "Allow insert for presenters"
  ON screen_share_sessions FOR INSERT
  WITH CHECK (presenter_id = auth.uid()::text);

DROP POLICY IF EXISTS "Allow update for presenters" ON screen_share_sessions;
CREATE POLICY "Allow update for presenters"
  ON screen_share_sessions FOR UPDATE
  USING (presenter_id = auth.uid()::text);

-- Drop and recreate policies for call_messages
DROP POLICY IF EXISTS "Allow read access to call messages" ON call_messages;
CREATE POLICY "Allow read access to call messages"
  ON call_messages FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Allow insert for authenticated users" ON call_messages;
CREATE POLICY "Allow insert for authenticated users"
  ON call_messages FOR INSERT
  WITH CHECK (user_id = auth.uid()::text);

-- Drop and recreate policies for call_reactions
DROP POLICY IF EXISTS "Allow read access to reactions" ON call_reactions;
CREATE POLICY "Allow read access to reactions"
  ON call_reactions FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Allow insert for authenticated users" ON call_reactions;
CREATE POLICY "Allow insert for authenticated users"
  ON call_reactions FOR INSERT
  WITH CHECK (user_id = auth.uid()::text);