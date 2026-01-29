import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export interface ChatFolder {
  id: string;
  name: string;
  icon: string;
  color: string;
  conversationIds: string[];
  createdAt: string;
}

export interface ChatTimer {
  conversationId: string;
  expiryTime: number;
  action: 'archive' | 'delete' | 'mute';
}

export interface ScheduledMessage {
  id: string;
  conversationId: string;
  content: string;
  scheduledFor: number;
  status: 'pending' | 'sent' | 'cancelled';
}

export interface QuickReply {
  id: string;
  label: string;
  content: string;
  emoji?: string;
}

interface InboxPreferencesState {
  // Lock system
  lockCode: string | null;
  lockedConversations: string[];
  isUnlocked: boolean;
  unlockExpiry: number | null;

  // Folders
  folders: ChatFolder[];

  // Timers
  timers: ChatTimer[];

  // Scheduled messages
  scheduledMessages: ScheduledMessage[];

  // Quick replies
  quickReplies: QuickReply[];

  // Self chat
  selfChatId: string | null;

  // Settings
  autoLockTimeout: number; // minutes
  showReadReceipts: boolean;
  showTypingIndicators: boolean;
  compactMode: boolean;

  // Actions - Lock
  setLockCode: (code: string | null) => void;
  toggleLockedConversation: (conversationId: string) => void;
  unlockWithCode: (code: string) => boolean;
  lockApp: () => void;

  // Actions - Folders
  createFolder: (folder: Omit<ChatFolder, 'id' | 'createdAt'>) => void;
  deleteFolder: (folderId: string) => void;
  updateFolder: (folderId: string, updates: Partial<ChatFolder>) => void;
  addConversationToFolder: (folderId: string, conversationId: string) => void;
  removeConversationFromFolder: (folderId: string, conversationId: string) => void;

  // Actions - Timers
  setTimer: (timer: Omit<ChatTimer, 'expiryTime'> & { hours: number }) => void;
  removeTimer: (conversationId: string) => void;
  checkTimers: () => string[]; // Returns conversation IDs that need action

  // Actions - Scheduled Messages
  scheduleMessage: (message: Omit<ScheduledMessage, 'id' | 'status'>) => void;
  cancelScheduledMessage: (messageId: string) => void;
  markScheduledMessageSent: (messageId: string) => void;
  getPendingScheduledMessages: () => ScheduledMessage[];

  // Actions - Quick Replies
  addQuickReply: (reply: Omit<QuickReply, 'id'>) => void;
  deleteQuickReply: (replyId: string) => void;
  updateQuickReply: (replyId: string, updates: Partial<QuickReply>) => void;

  // Actions - Self Chat
  setSelfChatId: (conversationId: string) => void;

  // Actions - Settings
  setAutoLockTimeout: (minutes: number) => void;
  setShowReadReceipts: (show: boolean) => void;
  setShowTypingIndicators: (show: boolean) => void;
  setCompactMode: (compact: boolean) => void;
}

const DEFAULT_FOLDERS: ChatFolder[] = [
  {
    id: 'work',
    name: 'Work',
    icon: 'briefcase',
    color: '#3b82f6',
    conversationIds: [],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'personal',
    name: 'Personal',
    icon: 'heart',
    color: '#ec4899',
    conversationIds: [],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'important',
    name: 'Important',
    icon: 'star',
    color: '#fbbf24',
    conversationIds: [],
    createdAt: new Date().toISOString(),
  },
];

const DEFAULT_QUICK_REPLIES: QuickReply[] = [
  { id: '1', label: 'Thanks', content: 'Thanks!', emoji: '🙏' },
  { id: '2', label: 'On my way', content: "On my way!", emoji: '🚗' },
  { id: '3', label: 'Busy', content: "I'm busy right now, I'll get back to you later.", emoji: '⏰' },
  { id: '4', label: 'Got it', content: 'Got it! 👍', emoji: '✅' },
];

export const useInboxPreferencesStore = create<InboxPreferencesState>()(
  persist(
    (set, get) => ({
      // Initial state
      lockCode: null,
      lockedConversations: [],
      isUnlocked: false,
      unlockExpiry: null,
      folders: DEFAULT_FOLDERS,
      timers: [],
      scheduledMessages: [],
      quickReplies: DEFAULT_QUICK_REPLIES,
      selfChatId: null,
      autoLockTimeout: 5, // 5 minutes
      showReadReceipts: true,
      showTypingIndicators: true,
      compactMode: false,

      // Lock actions
      setLockCode: (code) => set({ lockCode: code }),

      toggleLockedConversation: (conversationId) =>
        set((state) => ({
          lockedConversations: state.lockedConversations.includes(conversationId)
            ? state.lockedConversations.filter((id) => id !== conversationId)
            : [...state.lockedConversations, conversationId],
        })),

      unlockWithCode: (code) => {
        const state = get();
        if (state.lockCode === code) {
          const expiryTime = Date.now() + state.autoLockTimeout * 60 * 1000;
          set({ isUnlocked: true, unlockExpiry: expiryTime });
          return true;
        }
        return false;
      },

      lockApp: () => set({ isUnlocked: false, unlockExpiry: null }),

      // Folder actions
      createFolder: (folder) =>
        set((state) => ({
          folders: [
            ...state.folders,
            {
              ...folder,
              id: Date.now().toString(),
              createdAt: new Date().toISOString(),
            },
          ],
        })),

      deleteFolder: (folderId) =>
        set((state) => ({
          folders: state.folders.filter((f) => f.id !== folderId),
        })),

      updateFolder: (folderId, updates) =>
        set((state) => ({
          folders: state.folders.map((f) =>
            f.id === folderId ? { ...f, ...updates } : f
          ),
        })),

      addConversationToFolder: (folderId, conversationId) =>
        set((state) => ({
          folders: state.folders.map((f) =>
            f.id === folderId && !f.conversationIds.includes(conversationId)
              ? { ...f, conversationIds: [...f.conversationIds, conversationId] }
              : f
          ),
        })),

      removeConversationFromFolder: (folderId, conversationId) =>
        set((state) => ({
          folders: state.folders.map((f) =>
            f.id === folderId
              ? { ...f, conversationIds: f.conversationIds.filter((id) => id !== conversationId) }
              : f
          ),
        })),

      // Timer actions
      setTimer: (timer) =>
        set((state) => {
          const expiryTime = Date.now() + timer.hours * 60 * 60 * 1000;
          const existingIndex = state.timers.findIndex(
            (t) => t.conversationId === timer.conversationId
          );

          if (existingIndex >= 0) {
            const newTimers = [...state.timers];
            newTimers[existingIndex] = { ...timer, expiryTime };
            return { timers: newTimers };
          }

          return { timers: [...state.timers, { ...timer, expiryTime }] };
        }),

      removeTimer: (conversationId) =>
        set((state) => ({
          timers: state.timers.filter((t) => t.conversationId !== conversationId),
        })),

      checkTimers: () => {
        const state = get();
        const now = Date.now();
        const expiredTimers = state.timers.filter((t) => t.expiryTime <= now);

        if (expiredTimers.length > 0) {
          set({
            timers: state.timers.filter((t) => t.expiryTime > now),
          });
        }

        return expiredTimers.map((t) => t.conversationId);
      },

      // Scheduled messages actions
      scheduleMessage: (message) =>
        set((state) => ({
          scheduledMessages: [
            ...state.scheduledMessages,
            {
              ...message,
              id: Date.now().toString(),
              status: 'pending',
            },
          ],
        })),

      cancelScheduledMessage: (messageId) =>
        set((state) => ({
          scheduledMessages: state.scheduledMessages.map((m) =>
            m.id === messageId ? { ...m, status: 'cancelled' } : m
          ),
        })),

      markScheduledMessageSent: (messageId) =>
        set((state) => ({
          scheduledMessages: state.scheduledMessages.map((m) =>
            m.id === messageId ? { ...m, status: 'sent' } : m
          ),
        })),

      getPendingScheduledMessages: () => {
        const state = get();
        const now = Date.now();
        return state.scheduledMessages.filter(
          (m) => m.status === 'pending' && m.scheduledFor <= now
        );
      },

      // Quick replies actions
      addQuickReply: (reply) =>
        set((state) => ({
          quickReplies: [
            ...state.quickReplies,
            { ...reply, id: Date.now().toString() },
          ],
        })),

      deleteQuickReply: (replyId) =>
        set((state) => ({
          quickReplies: state.quickReplies.filter((r) => r.id !== replyId),
        })),

      updateQuickReply: (replyId, updates) =>
        set((state) => ({
          quickReplies: state.quickReplies.map((r) =>
            r.id === replyId ? { ...r, ...updates } : r
          ),
        })),

      // Self chat actions
      setSelfChatId: (conversationId) => set({ selfChatId: conversationId }),

      // Settings actions
      setAutoLockTimeout: (minutes) => set({ autoLockTimeout: minutes }),
      setShowReadReceipts: (show) => set({ showReadReceipts: show }),
      setShowTypingIndicators: (show) => set({ showTypingIndicators: show }),
      setCompactMode: (compact) => set({ compactMode: compact }),
    }),
    {
      name: 'inbox-preferences',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

// Auto-lock checker - call this periodically in the app
export const checkAutoLock = () => {
  const state = useInboxPreferencesStore.getState();
  if (state.isUnlocked && state.unlockExpiry && Date.now() > state.unlockExpiry) {
    state.lockApp();
  }
};
