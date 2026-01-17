-- Debug: Check what's in call_sessions and room_members tables
-- This is a temporary migration to help debug the issue

-- Check if there are any active sessions
SELECT 'Active sessions:' as info, COUNT(*) as count FROM call_sessions WHERE is_active = true;

-- Check room membership for the test room
SELECT 'Room members for f4614eab-e74d-40a5-94d5-f7d3373b0f1d:' as info,
       rm.user_id::text,
       rm.room_id::text
FROM room_members rm
WHERE rm.room_id::text = 'f4614eab-e74d-40a5-94d5-f7d3373b0f1d';

-- Check what sessions exist for this room
SELECT 'Sessions for room f4614eab-e74d-40a5-94d5-f7d3373b0f1d:' as info,
       cs.id,
       cs.room_id,
       cs.is_active,
       cs.host_id::text
FROM call_sessions cs
WHERE cs.room_id = 'f4614eab-e74d-40a5-94d5-f7d3373b0f1d';