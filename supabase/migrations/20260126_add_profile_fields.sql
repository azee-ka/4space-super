-- Migration: Add new profile fields for enhanced user profiles
-- Created: 2026-01-26

-- Add new columns to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS pronoun TEXT,
ADD COLUMN IF NOT EXISTS location TEXT,
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS website TEXT,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active' CHECK (status IN ('active', 'away', 'busy', 'offline')),
ADD COLUMN IF NOT EXISTS status_message TEXT,
ADD COLUMN IF NOT EXISTS timezone TEXT,
ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'English',
ADD COLUMN IF NOT EXISTS theme_preference TEXT DEFAULT 'OLED Black',
ADD COLUMN IF NOT EXISTS font_size TEXT DEFAULT 'Medium',
ADD COLUMN IF NOT EXISTS last_seen_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS is_online BOOLEAN DEFAULT false;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_is_online ON profiles(is_online);
CREATE INDEX IF NOT EXISTS idx_profiles_status ON profiles(status);
CREATE INDEX IF NOT EXISTS idx_profiles_language ON profiles(language);

-- Update RLS policies if needed
-- Ensure users can update their own profile fields
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Allow users to view other profiles (respecting privacy settings)
DROP POLICY IF EXISTS "Profiles are viewable by authenticated users" ON profiles;
CREATE POLICY "Profiles are viewable by authenticated users" ON profiles
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Create a function to update last_seen_at
CREATE OR REPLACE FUNCTION update_last_seen()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_seen_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update last_seen_at on profile updates
DROP TRIGGER IF EXISTS update_profile_last_seen ON profiles;
CREATE TRIGGER update_profile_last_seen
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_last_seen();

-- Add comments for documentation
COMMENT ON COLUMN profiles.pronoun IS 'User preferred pronouns (e.g., they/them, she/her, he/him)';
COMMENT ON COLUMN profiles.location IS 'User location (e.g., City, Country)';
COMMENT ON COLUMN profiles.bio IS 'User bio/description (max 160 characters)';
COMMENT ON COLUMN profiles.website IS 'User website or portfolio URL';
COMMENT ON COLUMN profiles.status IS 'User current status (active, away, busy, offline)';
COMMENT ON COLUMN profiles.status_message IS 'Custom status message';
COMMENT ON COLUMN profiles.timezone IS 'User timezone';
COMMENT ON COLUMN profiles.language IS 'Preferred app language';
COMMENT ON COLUMN profiles.theme_preference IS 'Preferred theme style';
COMMENT ON COLUMN profiles.font_size IS 'Preferred font size';
COMMENT ON COLUMN profiles.last_seen_at IS 'Last time user was active';
COMMENT ON COLUMN profiles.is_online IS 'Whether user is currently online';
