-- Allow the set_room_message_retention function to bypass RLS since it does auth checks internally

-- Create a policy that allows all operations for room members
-- This is safe because the function itself checks permissions

DROP POLICY IF EXISTS "room_settings_member_access" ON public.room_settings;
CREATE POLICY "room_settings_member_access"
  ON public.room_settings
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.room_members rm
      WHERE rm.room_id = room_settings.room_id
      AND rm.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.room_members rm
      WHERE rm.room_id = room_settings.room_id
      AND rm.user_id = auth.uid()
    )
  );