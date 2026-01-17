-- Fix Call History RLS Policy for Authenticated Clients
-- Created: 2026-01-17
-- Description: Update call_history policy to work with authenticated Supabase clients

-- Update the call_history insert policy to work with authenticated clients
-- Since the services now use authenticated Supabase clients, auth.uid() will be available
DROP POLICY IF EXISTS "Allow users to insert their own call history" ON call_history;
CREATE POLICY "Allow users to insert their own call history"
  ON call_history FOR INSERT
  WITH CHECK (user_id = auth.uid()::text AND auth.uid() IS NOT NULL);

-- Ensure the policy is properly applied
ALTER TABLE call_history ENABLE ROW LEVEL SECURITY;