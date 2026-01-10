import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { Space } from '@4space/shared';

interface SpacesState {
  spaces: Space[];
  selectedSpace: Space | null;
  loading: boolean;
  fetchSpaces: () => Promise<void>;
  createSpace: (space: Partial<Space>) => Promise<Space>;
  selectSpace: (space: Space) => void;
  deleteSpace: (id: string) => Promise<void>;
}

// Helper function to ensure profile exists
async function ensureProfileExists() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Check if profile exists
  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', user.id)
    .single();

  // If no profile, create one
  if (!profile) {
    const { error } = await supabase
      .from('profiles')
      .insert({
        id: user.id,
        email: user.email,
        username: user.email?.split('@')[0] || 'user',
        display_name: user.user_metadata?.display_name || user.email?.split('@')[0] || 'User',
      });

    if (error) {
      console.error('Error creating profile:', error);
      throw new Error('Failed to create user profile');
    }
  }

  return user;
}

export const useSpacesStore = create<SpacesState>((set, get) => ({
  spaces: [],
  selectedSpace: null,
  loading: false,

  fetchSpaces: async () => {
    set({ loading: true });
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        set({ loading: false });
        return;
      }

      // FIXED: Changed from direct query to function call
      const { data, error } = await supabase.rpc('get_user_spaces');

      if (error) throw error;
      set({ spaces: data || [], loading: false });
    } catch (error) {
      console.error('Error fetching spaces:', error);
      set({ loading: false });
    }
  },

  createSpace: async (spaceData) => {
    // Ensure profile exists before creating space
    const user = await ensureProfileExists();

    const { data, error } = await supabase
      .from('spaces')
      .insert({
        name: spaceData.name,
        description: spaceData.description,
        privacy: spaceData.privacy || 'private',
        icon: spaceData.icon,
        color: spaceData.color,
        owner_id: user.id,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating space:', error);
      throw error;
    }

    set((state) => ({ spaces: [data, ...state.spaces] }));
    return data;
  },

  selectSpace: (space) => {
    set({ selectedSpace: space });
  },

  deleteSpace: async (id) => {
    const { error } = await supabase
      .from('spaces')
      .delete()
      .eq('id', id);

    if (error) throw error;

    set((state) => ({
      spaces: state.spaces.filter((s) => s.id !== id),
      selectedSpace: state.selectedSpace?.id === id ? null : state.selectedSpace,
    }));
  },
}));