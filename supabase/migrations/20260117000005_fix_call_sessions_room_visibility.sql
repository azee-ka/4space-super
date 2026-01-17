-- Fix Call Sessions Visibility for Room Members
-- Created: 2026-01-17
-- Description: Update call_sessions RLS policies to allow room members to see active sessions

-- Update call_sessions SELECT policy to allow room members to see active sessions
DROP POLICY IF EXISTS "Allow read access to active call sessions" ON call_sessions;
CREATE POLICY "Allow room members to read active call sessions"
  ON call_sessions FOR SELECT
  USING (
    is_active = true AND
    room_id IN (
      SELECT room_id::text FROM room_members WHERE user_id = auth.uid()
    )
  );

-- Keep the insert policy for authenticated users
DROP POLICY IF EXISTS "Allow insert for authenticated users" ON call_sessions;
CREATE POLICY "Allow authenticated users to insert call sessions"
  ON call_sessions FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND host_id = auth.uid()::text);

-- Keep the update policy for session host
DROP POLICY IF EXISTS "Allow update for session host" ON call_sessions;
CREATE POLICY "Allow session host to update call sessions"
  ON call_sessions FOR UPDATE
  USING (host_id = auth.uid()::text);

-- Ensure RLS is enabled
ALTER TABLE call_sessions ENABLE ROW LEVEL SECURITY;