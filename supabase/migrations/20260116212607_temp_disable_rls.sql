-- Temporarily disable RLS for room_settings to test if that's causing the 400 error
-- This is for debugging - we'll re-enable with proper policies later

ALTER TABLE public.room_settings DISABLE ROW LEVEL SECURITY;