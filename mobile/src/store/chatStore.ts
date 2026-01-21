import { create } from 'zustand';
import { Conversation, Message, TypingIndicator } from '../types';

interface ChatState {
  activeConversation: Conversation | null;
  typingUsers: Map<string, TypingIndicator[]>;
  replyingTo: Message | null;
  
  setActiveConversation: (conversation: Conversation | null) => void;
  addTypingUser: (conversationId: string, indicator: TypingIndicator) => void;
  removeTypingUser: (conversationId: string, userId: string) => void;
  setReplyingTo: (message: Message | null) => void;
  clearTypingUsers: (conversationId: string) => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  activeConversation: null,
  typingUsers: new Map(),
  replyingTo: null,

  setActiveConversation: (conversation) => set({ activeConversation: conversation }),

  addTypingUser: (conversationId, indicator) => {
    const typingUsers = new Map(get().typingUsers);
    const currentTyping = typingUsers.get(conversationId) || [];
    
    // Remove existing indicator for this user
    const filtered = currentTyping.filter(t => t.user_id !== indicator.user_id);
    
    // Add new indicator
    typingUsers.set(conversationId, [...filtered, indicator]);
    set({ typingUsers });

    // Auto-remove after 3 seconds
    setTimeout(() => {
      get().removeTypingUser(conversationId, indicator.user_id);
    }, 3000);
  },

  removeTypingUser: (conversationId, userId) => {
    const typingUsers = new Map(get().typingUsers);
    const currentTyping = typingUsers.get(conversationId) || [];
    const filtered = currentTyping.filter(t => t.user_id !== userId);
    
    if (filtered.length > 0) {
      typingUsers.set(conversationId, filtered);
    } else {
      typingUsers.delete(conversationId);
    }
    
    set({ typingUsers });
  },

  clearTypingUsers: (conversationId) => {
    const typingUsers = new Map(get().typingUsers);
    typingUsers.delete(conversationId);
    set({ typingUsers });
  },

  setReplyingTo: (message) => set({ replyingTo: message }),
}));
