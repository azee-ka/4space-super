// web/src/hooks/useMessages.ts
import type { SupabaseClient } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { createMessageHooks } from '@4space/shared/src/hooks/useMessages';

// Create hooks with the web supabase client
const messageHooks = createMessageHooks(supabase as unknown as SupabaseClient<any, 'public', 'public', any, any>);

// Export all hooks
export const useSpaceRooms = messageHooks.useSpaceRooms;
export const useRoom = messageHooks.useRoom;
export const useRoomMessages = messageHooks.useRoomMessages;
export const useRoomMembers = messageHooks.useRoomMembers;
export const usePinnedMessages = messageHooks.usePinnedMessages;
export const useBookmarkedMessages = messageHooks.useBookmarkedMessages;
export const useSearchMessages = messageHooks.useSearchMessages;
export const useUnreadCount = messageHooks.useUnreadCount;
export const useCreateRoom = messageHooks.useCreateRoom;
export const useUpdateRoom = messageHooks.useUpdateRoom;
export const useDeleteRoom = messageHooks.useDeleteRoom;
export const useSendMessage = messageHooks.useSendMessage;
export const useUpdateMessage = messageHooks.useUpdateMessage;
export const useDeleteMessage = messageHooks.useDeleteMessage;
export const usePinMessage = messageHooks.usePinMessage;
export const useAddReaction = messageHooks.useAddReaction;
export const useRemoveReaction = messageHooks.useRemoveReaction;
export const useMarkAsRead = messageHooks.useMarkAsRead;
export const useMarkRoomAsRead = messageHooks.useMarkRoomAsRead;
export const useBookmarkMessage = messageHooks.useBookmarkMessage;
export const useRemoveBookmark = messageHooks.useRemoveBookmark;
export const useAddRoomMember = messageHooks.useAddRoomMember;
export const useRemoveRoomMember = messageHooks.useRemoveRoomMember;
export const useUpdateRoomMemberRole = messageHooks.useUpdateRoomMemberRole;

// Re-export query keys
export { messageKeys } from '@4space/shared/src/hooks/useMessages.ts';