-- ╔════════════════════════════════════════════════════════════════╗
-- ║  STEP 4: CREATE INDEXES                                        ║
-- ║  Add indexes for performance optimization                      ║
-- ╚════════════════════════════════════════════════════════════════╝

-- Profiles indexes (for search)
CREATE INDEX idx_profiles_email_lower ON public.profiles(LOWER(email));
CREATE INDEX idx_profiles_username_lower ON public.profiles(LOWER(username));
CREATE INDEX idx_profiles_display_name_lower ON public.profiles(LOWER(display_name));

-- Spaces indexes
CREATE INDEX idx_spaces_owner_id ON public.spaces(owner_id);

-- Space members indexes
CREATE INDEX idx_space_members_space_id ON public.space_members(space_id);
CREATE INDEX idx_space_members_user_id ON public.space_members(user_id);

-- Conversations indexes
CREATE INDEX idx_conversations_created_by ON public.conversations(created_by);
CREATE INDEX idx_conversations_last_message_at ON public.conversations(last_message_at DESC);

-- Conversation participants indexes
CREATE INDEX idx_conversation_participants_conversation_id ON public.conversation_participants(conversation_id);
CREATE INDEX idx_conversation_participants_user_id ON public.conversation_participants(user_id);

-- Messages indexes
CREATE INDEX idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX idx_messages_space_id ON public.messages(space_id);
CREATE INDEX idx_messages_sender_id ON public.messages(sender_id);
CREATE INDEX idx_messages_created_at ON public.messages(created_at DESC);
CREATE INDEX idx_messages_reply_to_id ON public.messages(reply_to_id) WHERE reply_to_id IS NOT NULL;

-- Message reactions indexes
CREATE INDEX idx_message_reactions_message_id ON public.message_reactions(message_id);
CREATE INDEX idx_message_reactions_user_id ON public.message_reactions(user_id);

-- Message read receipts indexes
CREATE INDEX idx_message_read_receipts_message_id ON public.message_read_receipts(message_id);
CREATE INDEX idx_message_read_receipts_user_id ON public.message_read_receipts(user_id);

-- Typing indicators indexes
CREATE INDEX idx_typing_indicators_conversation_id ON public.typing_indicators(conversation_id);
CREATE INDEX idx_typing_indicators_space_id ON public.typing_indicators(space_id) WHERE space_id IS NOT NULL;
CREATE INDEX idx_typing_indicators_user_id ON public.typing_indicators(user_id);

-- Notifications indexes
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_created_at ON public.notifications(created_at DESC);
CREATE INDEX idx_notifications_read ON public.notifications(user_id, read);
CREATE INDEX idx_notifications_type ON public.notifications(type);

-- Space invitations indexes
CREATE INDEX idx_space_invitations_space_id ON public.space_invitations(space_id);
CREATE INDEX idx_space_invitations_invited_user ON public.space_invitations(invited_user_id);
CREATE INDEX idx_space_invitations_invited_by ON public.space_invitations(invited_by_user_id);

-- Media files indexes
CREATE INDEX idx_media_files_space_id ON public.media_files(space_id);

-- Calls indexes
CREATE INDEX idx_calls_space_id ON public.calls(space_id);

SELECT '✅ Step 4 Complete: All indexes created (25+ indexes)' as status;