-- Add all space members to existing rooms and create trigger for future rooms
-- This ensures all space members can participate in room chats

-- Function to add all space members to a room
CREATE OR REPLACE FUNCTION add_space_members_to_room(p_room_id UUID)
RETURNS VOID AS $$
DECLARE
    v_space_id UUID;
BEGIN
    -- Get the space_id for this room
    SELECT r.space_id INTO v_space_id
    FROM rooms r
    WHERE r.id = p_room_id;

    -- Insert all space members into room_members (skip if already exists)
    INSERT INTO room_members (room_id, user_id, role, joined_at)
    SELECT p_room_id, sm.user_id, 'member', NOW()
    FROM space_members sm
    WHERE sm.space_id = v_space_id
    AND sm.user_id NOT IN (
        SELECT rm.user_id FROM room_members rm WHERE rm.room_id = p_room_id
    );
END;
$$ LANGUAGE plpgsql;

-- Function to automatically add space members to new rooms
CREATE OR REPLACE FUNCTION add_space_members_to_new_room()
RETURNS TRIGGER AS $$
BEGIN
    -- Add all space members to the new room
    PERFORM add_space_members_to_room(NEW.id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for new rooms
DROP TRIGGER IF EXISTS trigger_add_space_members_to_new_room ON rooms;
CREATE TRIGGER trigger_add_space_members_to_new_room
    AFTER INSERT ON rooms
    FOR EACH ROW
    EXECUTE FUNCTION add_space_members_to_new_room();

-- Add all space members to existing rooms
DO $$
DECLARE
    room_record RECORD;
BEGIN
    FOR room_record IN SELECT id FROM rooms LOOP
        PERFORM add_space_members_to_room(room_record.id);
    END LOOP;
END $$;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION add_space_members_to_room(UUID) TO authenticated;