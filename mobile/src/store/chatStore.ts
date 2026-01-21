import { create } from 'zustand';
import { Conversation, Message, TypingIndicator } from '../types';

interface ConversationSettings {
  readReceipts: boolean;
  typingIndicators: boolean;
  muteNotifications: boolean;
  pinned: boolean;
}

export const DEFAULT_CONVERSATION_SETTINGS: ConversationSettings = {
  readReceipts: true,
  typingIndicators: true,
  muteNotifications: false,
  pinned: false,
};

interface ChatState {
  activeConversation: Conversation | null;
  typingUsers: Map<string, TypingIndicator[]>;
  replyingTo: Message | null;
  conversationSettings: Record<string, ConversationSettings>;
  
  setActiveConversation: (conversation: Conversation | null) => void;
  addTypingUser: (conversationId: string, indicator: TypingIndicator) => void;
  removeTypingUser: (conversationId: string, userId: string) => void;
  setReplyingTo: (message: Message | null) => void;
  clearTypingUsers: (conversationId: string) => void;
  setConversationSettings: (conversationId: string, updates: Partial<ConversationSettings>) => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  activeConversation: null,
  typingUsers: new Map(),
  replyingTo: null,
  conversationSettings: {},

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
  setConversationSettings: (conversationId, updates) =>
    set((state) => ({
      conversationSettings: {
        ...state.conversationSettings,
        [conversationId]: {
          ...DEFAULT_CONVERSATION_SETTINGS,
          ...state.conversationSettings[conversationId],
          ...updates,
        },
      },
    })),
}));
