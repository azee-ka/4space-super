// web/src/store/chatSettingsStore.ts

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ChatSettingsState {
  formattingButtonsEnabled: boolean;
  setFormattingButtonsEnabled: (enabled: boolean) => void;
}

export const useChatSettingsStore = create<ChatSettingsState>()(
  persist(
    (set) => ({
      formattingButtonsEnabled: true, // Default to enabled
      setFormattingButtonsEnabled: (enabled: boolean) => {
        set({ formattingButtonsEnabled: enabled });
      },
    }),
    {
      name: 'chat-settings-storage',
    }
  )
);
