// web/src/store/navbarStore.ts
// Global store for navbar visibility control

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface NavbarState {
  // Global navbar visibility for toggleable routes
  showNavbar: boolean;

  // Actions
  setShowNavbar: (show: boolean) => void;
  toggleNavbar: () => void;

  // Legacy support - keep for backwards compatibility
  showNavbarInGeneralChat: boolean;
  showNavbarInSpaceChat: boolean;
  setShowNavbarInGeneralChat: (show: boolean) => void;
  setShowNavbarInSpaceChat: (show: boolean) => void;
  toggleNavbarInGeneralChat: () => void;
  toggleNavbarInSpaceChat: () => void;
}

export const useNavbarStore = create<NavbarState>()(
  persist(
    (set) => ({
      // Default: navbar hidden on toggleable routes
      showNavbar: false,

      setShowNavbar: (show: boolean) => set({ showNavbar: show }),
      toggleNavbar: () => set((state) => ({ showNavbar: !state.showNavbar })),

      // Legacy support (maps to global state)
      showNavbarInGeneralChat: false,
      showNavbarInSpaceChat: false,
      setShowNavbarInGeneralChat: (show: boolean) => set({ showNavbar: show, showNavbarInGeneralChat: show }),
      setShowNavbarInSpaceChat: (show: boolean) => set({ showNavbar: show, showNavbarInSpaceChat: show }),
      toggleNavbarInGeneralChat: () => set((state) => ({
        showNavbar: !state.showNavbar,
        showNavbarInGeneralChat: !state.showNavbar
      })),
      toggleNavbarInSpaceChat: () => set((state) => ({
        showNavbar: !state.showNavbar,
        showNavbarInSpaceChat: !state.showNavbar
      })),
    }),
    {
      name: 'navbar-visibility-storage',
    }
  )
);
