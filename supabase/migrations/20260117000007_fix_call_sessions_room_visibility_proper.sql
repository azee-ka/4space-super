-- Fix Call Sessions Room Visibility with Proper Type Casting
-- Created: 2026-01-17
-- Description: Fix the RLS policy with proper UUID/text casting for room membership

-- Fix the call_sessions SELECT policy with proper type casting
DROP POLICY IF EXISTS "Debug: Allow authenticated users to read active call sessions" ON call_sessions;
CREATE POLICY "Allow room members to read active call sessions"
  ON call_sessions FOR SELECT
  USING (
    is_active = true AND
    room_id IN (
      SELECT room_id::text FROM room_members WHERE user_id::text = auth.uid()::text
    )
  );

-- Keep other policies
DROP POLICY IF EXISTS "Allow authenticated users to insert call sessions" ON call_sessions;
CREATE POLICY "Allow authenticated users to insert call sessions"
  ON call_sessions FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND host_id = auth.uid()::text);

DROP POLICY IF EXISTS "Allow session host to update call sessions" ON call_sessions;
CREATE POLICY "Allow session host to update call sessions"
  ON call_sessions FOR UPDATE
  USING (host_id = auth.uid()::text);