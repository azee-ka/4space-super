-- Fix RLS policies for room settings to allow message retention changes

-- =====================================================
-- FIX ROOM SETTINGS RLS POLICY
-- =====================================================
-- Allow room members (not just admins) to update room settings
-- The set_room_message_retention function does its own auth checks
DROP POLICY IF EXISTS "room_settings_update_admin" ON public.room_settings;
CREATE POLICY "room_settings_update_member"
  ON public.room_settings FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.room_members rm
      WHERE rm.room_id = room_settings.room_id
      AND rm.user_id = auth.uid()
    )
  );