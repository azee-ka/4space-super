import { create } from 'zustand';

interface PresenceState {
  onlineUserIds: string[];
  lastSeenByUserId: Record<string, number>;
  setOnlineUserIds: (ids: string[]) => void;
  setLastSeen: (userId: string, timestamp: number) => void;
}

export const usePresenceStore = create<PresenceState>((set) => ({
  onlineUserIds: [],
  lastSeenByUserId: {},
  setOnlineUserIds: (ids) => set({ onlineUserIds: ids }),
  setLastSeen: (userId, timestamp) =>
    set((state) => ({
      lastSeenByUserId: {
        ...state.lastSeenByUserId,
        [userId]: timestamp,
      },
    })),
}));
