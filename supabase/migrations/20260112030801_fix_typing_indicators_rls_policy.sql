-- Fix typing_indicators RLS policies to allow INSERT properly
-- The current policy "Users can update own typing status" FOR ALL might not work correctly for INSERT

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view typing indicators" ON typing_indicators;
DROP POLICY IF EXISTS "Users can update own typing status" ON typing_indicators;

-- SELECT: Users can view typing indicators in rooms they're members of
CREATE POLICY "Users can view typing indicators" ON typing_indicators
  FOR SELECT USING (
    room_id IN (SELECT room_id FROM room_members WHERE user_id = auth.uid())
  );

-- INSERT: Users can insert their own typing indicators
CREATE POLICY "Users can insert own typing status" ON typing_indicators
  FOR INSERT WITH CHECK (
    user_id = auth.uid()
    AND room_id IN (SELECT room_id FROM room_members WHERE user_id = auth.uid())
  );

-- UPDATE: Users can update their own typing indicators
CREATE POLICY "Users can update own typing status" ON typing_indicators
  FOR UPDATE USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- DELETE: Users can delete their own typing indicators
CREATE POLICY "Users can delete own typing status" ON typing_indicators
  FOR DELETE USING (user_id = auth.uid());
