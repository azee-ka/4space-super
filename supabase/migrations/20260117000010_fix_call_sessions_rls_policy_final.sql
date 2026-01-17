-- Fix call_sessions visibility for room members
-- Created: 2026-01-17
-- Description: Allow room members and room creators to see active sessions

DROP POLICY IF EXISTS "Allow room members to read active call sessions" ON call_sessions;
DROP POLICY IF EXISTS "Debug: Allow authenticated users to read active call sessions" ON call_sessions;
DROP POLICY IF EXISTS "Temp: Allow authenticated users to read active call sessions" ON call_sessions;
DROP POLICY IF EXISTS "Allow read access to active call sessions" ON call_sessions;

CREATE POLICY "Allow room access to active call sessions"
  ON call_sessions FOR SELECT
  USING (
    is_active = true
    AND auth.uid() IS NOT NULL
    AND (
      EXISTS (
        SELECT 1
        FROM public.room_members rm
        WHERE rm.room_id::text = call_sessions.room_id
          AND rm.user_id = auth.uid()
      )
      OR EXISTS (
        SELECT 1
        FROM public.rooms r
        WHERE r.id::text = call_sessions.room_id
          AND r.created_by = auth.uid()
      )
    )
  );

ALTER TABLE call_sessions ENABLE ROW LEVEL SECURITY;
