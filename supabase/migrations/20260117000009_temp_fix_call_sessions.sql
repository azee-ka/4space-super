-- Temporary fix: Allow all authenticated users to see active call sessions
-- This will help confirm that RLS is the issue

DROP POLICY IF EXISTS "Allow room members to read active call sessions" ON call_sessions;
CREATE POLICY "Temp: Allow authenticated users to read active call sessions"
  ON call_sessions FOR SELECT
  USING (is_active = true AND auth.uid() IS NOT NULL);

-- Keep other policies
DROP POLICY IF EXISTS "Allow authenticated users to insert call sessions" ON call_sessions;
CREATE POLICY "Allow authenticated users to insert call sessions"
  ON call_sessions FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND host_id = auth.uid()::text);

DROP POLICY IF EXISTS "Allow session host to update call sessions" ON call_sessions;
CREATE POLICY "Allow session host to update call sessions"
  ON call_sessions FOR UPDATE
  USING (host_id = auth.uid()::text);