-- Add Privacy Settings to Profiles
-- Migration: 20260114000000_add_privacy_and_room_features

-- Add privacy settings columns to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS show_online_status BOOLEAN DEFAULT true;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS show_read_receipts BOOLEAN DEFAULT true;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS show_typing_indicator BOOLEAN DEFAULT true;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS show_last_seen BOOLEAN DEFAULT true;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS show_profile_photo BOOLEAN DEFAULT true;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS message_preview_in_notifications BOOLEAN DEFAULT true;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS auto_download_media BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS auto_download_videos BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS screen_security BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS two_factor_auth BOOLEAN DEFAULT false;

-- Add room guidelines column to rooms table
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS guidelines TEXT;

-- Create room_resources table for pinned links and files
CREATE TABLE IF NOT EXISTS room_resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  description TEXT,
  resource_type TEXT DEFAULT 'link' CHECK (resource_type IN ('link', 'file', 'document')),
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster room resource lookups
CREATE INDEX IF NOT EXISTS idx_room_resources_room_id ON room_resources(room_id);
CREATE INDEX IF NOT EXISTS idx_room_resources_created_by ON room_resources(created_by);

-- Add RLS policies for room_resources
ALTER TABLE room_resources ENABLE ROW LEVEL SECURITY;

-- Allow users to view resources in rooms they're members of
CREATE POLICY "Users can view room resources in their rooms"
  ON room_resources FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM room_members
      WHERE room_members.room_id = room_resources.room_id
      AND room_members.user_id = auth.uid()
    )
  );

-- Allow users to create resources in rooms they're members of
CREATE POLICY "Users can create resources in their rooms"
  ON room_resources FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM room_members
      WHERE room_members.room_id = room_resources.room_id
      AND room_members.user_id = auth.uid()
    )
  );

-- Allow users to update resources they created
CREATE POLICY "Users can update their own resources"
  ON room_resources FOR UPDATE
  USING (created_by = auth.uid());

-- Allow users to delete resources they created or if they're room admins
CREATE POLICY "Users can delete their resources or admins can delete any"
  ON room_resources FOR DELETE
  USING (
    created_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM room_members
      WHERE room_members.room_id = room_resources.room_id
      AND room_members.user_id = auth.uid()
      AND room_members.role IN ('admin', 'owner')
    )
  );

-- Add updated_at trigger for room_resources
CREATE OR REPLACE FUNCTION update_room_resources_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_room_resources_updated_at_trigger
  BEFORE UPDATE ON room_resources
  FOR EACH ROW
  EXECUTE FUNCTION update_room_resources_updated_at();

-- Add comment for documentation
COMMENT ON TABLE room_resources IS 'Stores pinned links, files, and resources for rooms';
COMMENT ON COLUMN profiles.show_online_status IS 'Privacy: Whether to show online status to others';
COMMENT ON COLUMN profiles.show_read_receipts IS 'Privacy: Whether to show read receipts';
COMMENT ON COLUMN profiles.show_typing_indicator IS 'Privacy: Whether to show typing indicators';
COMMENT ON COLUMN profiles.show_last_seen IS 'Privacy: Whether to show last seen timestamp';
COMMENT ON COLUMN profiles.show_profile_photo IS 'Privacy: Whether to show profile photo to others';
COMMENT ON COLUMN profiles.message_preview_in_notifications IS 'Whether to show message content in notifications';
COMMENT ON COLUMN profiles.auto_download_media IS 'Whether to automatically download images';
COMMENT ON COLUMN profiles.auto_download_videos IS 'Whether to automatically download videos';
COMMENT ON COLUMN profiles.screen_security IS 'Whether to prevent screenshots';
COMMENT ON COLUMN profiles.two_factor_auth IS 'Whether two-factor authentication is enabled';
COMMENT ON COLUMN rooms.guidelines IS 'Room guidelines and rules in markdown format';
