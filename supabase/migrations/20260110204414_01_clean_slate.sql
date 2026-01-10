-- ╔════════════════════════════════════════════════════════════════╗
-- ║  STEP 1: CLEAN SLATE                                           ║
-- ║  Drop everything to start fresh                                ║
-- ║  Run this first to remove all existing objects                 ║
-- ╚════════════════════════════════════════════════════════════════╝

-- Drop all functions first (to avoid conflicts)
DROP FUNCTION IF EXISTS public.search_users(TEXT, INTEGER) CASCADE;
DROP FUNCTION IF EXISTS public.get_user_spaces() CASCADE;
DROP FUNCTION IF EXISTS public.accept_space_invitation(UUID) CASCADE;
DROP FUNCTION IF EXISTS public.reject_space_invitation(UUID) CASCADE;
DROP FUNCTION IF EXISTS public.get_or_create_direct_conversation(UUID) CASCADE;
DROP FUNCTION IF EXISTS public.create_notification(UUID, notification_type, TEXT, TEXT, JSONB) CASCADE;
DROP FUNCTION IF EXISTS public.update_space_members_count() CASCADE;
DROP FUNCTION IF EXISTS public.update_conversation_timestamp() CASCADE;
DROP FUNCTION IF EXISTS public.update_updated_at() CASCADE;
DROP FUNCTION IF EXISTS public.auto_add_space_owner() CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.clean_typing_indicators() CASCADE;
DROP FUNCTION IF EXISTS public.delete_expired_messages() CASCADE;

-- Drop all tables in reverse dependency order
DROP TABLE IF EXISTS public.calls CASCADE;
DROP TABLE IF EXISTS public.media_files CASCADE;
DROP TABLE IF EXISTS public.space_invitations CASCADE;
DROP TABLE IF EXISTS public.notifications CASCADE;
DROP TABLE IF EXISTS public.typing_indicators CASCADE;
DROP TABLE IF EXISTS public.message_threads CASCADE;
DROP TABLE IF EXISTS public.message_read_receipts CASCADE;
DROP TABLE IF EXISTS public.message_reactions CASCADE;
DROP TABLE IF EXISTS public.messages CASCADE;
DROP TABLE IF EXISTS public.conversation_participants CASCADE;
DROP TABLE IF EXISTS public.conversations CASCADE;
DROP TABLE IF EXISTS public.space_members CASCADE;
DROP TABLE IF EXISTS public.spaces CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Drop enums if they exist
DROP TYPE IF EXISTS notification_type CASCADE;
DROP TYPE IF EXISTS invitation_status CASCADE;
DROP TYPE IF EXISTS message_type CASCADE;
DROP TYPE IF EXISTS member_role CASCADE;
DROP TYPE IF EXISTS space_privacy CASCADE;
DROP TYPE IF EXISTS space_type CASCADE;

SELECT '✅ Step 1 Complete: All existing objects dropped' as status;