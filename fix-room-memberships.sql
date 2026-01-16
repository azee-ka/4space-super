-- SQL script to add all space members to existing rooms
-- Run this in your Supabase SQL editor or database console

-- Add all space members to all existing rooms
INSERT INTO room_members (room_id, user_id, role, joined_at)
SELECT r.id, sm.user_id, 'member', NOW()
FROM rooms r
JOIN space_members sm ON sm.space_id = r.space_id
WHERE sm.user_id NOT IN (
    SELECT rm.user_id
    FROM room_members rm
    WHERE rm.room_id = r.id
);

-- Verify the results
SELECT
    r.name as room_name,
    COUNT(DISTINCT rm.user_id) as room_members,
    COUNT(DISTINCT sm.user_id) as space_members
FROM rooms r
LEFT JOIN room_members rm ON r.id = rm.room_id
LEFT JOIN space_members sm ON r.space_id = sm.space_id
GROUP BY r.id, r.name
ORDER BY r.name;