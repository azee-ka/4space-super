-- Temporary Debug: Make call_sessions fully visible for testing
-- Created: 2026-01-17
-- Description: Temporarily allow all authenticated users to see active call sessions for debugging

-- Temporarily make call_sessions visible to all authenticated users (for debugging)
DROP POLICY IF EXISTS "Allow room members to read active call sessions" ON call_sessions;
CREATE POLICY "Debug: Allow authenticated users to read active call sessions"
  ON call_sessions FOR SELECT
  USING (is_active = true AND auth.uid() IS NOT NULL);

-- Keep other policies the same
DROP POLICY IF EXISTS "Allow authenticated users to insert call sessions" ON call_sessions;
CREATE POLICY "Allow authenticated users to insert call sessions"
  ON call_sessions FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND host_id = auth.uid()::text);

DROP POLICY IF EXISTS "Allow session host to update call sessions" ON call_sessions;
CREATE POLICY "Allow session host to update call sessions"
  ON call_sessions FOR UPDATE
  USING (host_id = auth.uid()::text);