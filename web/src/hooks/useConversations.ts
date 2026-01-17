// web/src/hooks/useConversations.ts
import type { SupabaseClient } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { createConversationHooks } from '@4space/shared/src/hooks/useConversations';

const conversationHooks = createConversationHooks(
  supabase as unknown as SupabaseClient<any, 'public', 'public', any, any>
);

export const useConversations = conversationHooks.useConversations;
export const useConversation = conversationHooks.useConversation;
export const useConversationParticipants = conversationHooks.useConversationParticipants;
export const useConversationMessages = conversationHooks.useConversationMessages;
export const usePinnedConversationMessages = conversationHooks.usePinnedConversationMessages;
export const useSearchUsers = conversationHooks.useSearchUsers;
export const useCreateDirectConversation = conversationHooks.useCreateDirectConversation;
export const useCreateGroupConversation = conversationHooks.useCreateGroupConversation;
export const useSendConversationMessage = conversationHooks.useSendConversationMessage;
export const useUpdateConversationMessage = conversationHooks.useUpdateConversationMessage;
export const useDeleteConversationMessage = conversationHooks.useDeleteConversationMessage;
export const usePinConversationMessage = conversationHooks.usePinConversationMessage;
export const useAddConversationReaction = conversationHooks.useAddConversationReaction;
export const useRemoveConversationReaction = conversationHooks.useRemoveConversationReaction;
export const useMarkConversationAsRead = conversationHooks.useMarkConversationAsRead;

export { conversationKeys } from '@4space/shared/src/hooks/useConversations';
