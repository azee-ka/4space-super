-- Fix Call History Visibility for Room Members
-- Created: 2026-01-17
-- Description: Update call_history RLS policies to allow all room members to see call history

-- Update call_history SELECT policy to allow room members to see call history
DROP POLICY IF EXISTS "Allow users to read their own call history" ON call_history;
CREATE POLICY "Allow room members to read call history"
  ON call_history FOR SELECT
  USING (
    room_id IN (
      SELECT room_id::text FROM room_members WHERE user_id = auth.uid()
    )
  );

-- Keep the insert policy for authenticated users (call initiators)
-- This ensures only authenticated users can create call history entries
DROP POLICY IF EXISTS "Allow users to insert their own call history" ON call_history;
CREATE POLICY "Allow authenticated users to insert call history"
  ON call_history FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND user_id = auth.uid()::text);

-- Ensure RLS is enabled
ALTER TABLE call_history ENABLE ROW LEVEL SECURITY;