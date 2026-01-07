import { create } from 'zustand';
import { Space } from '@4space/shared';
import { supabase } from '../lib/supabase';
import { EncryptionService } from '@4space/shared';

interface SpacesState {
  spaces: Space[];
  loading: boolean;
  selectedSpace: Space | null;
  fetchSpaces: () => Promise<void>;
  createSpace: (name: string, description?: string) => Promise<Space>;
  selectSpace: (space: Space) => void;
}

export const useSpacesStore = create<SpacesState>((set, get) => ({
  spaces: [],
  loading: false,
  selectedSpace: null,

  fetchSpaces: async () => {
    set({ loading: true });
    try {
      const { data, error } = await supabase
        .from('spaces')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      set({ spaces: data || [], loading: false });
    } catch (error) {
      console.error('Fetch spaces error:', error);
      set({ loading: false });
    }
  },

  createSpace: async (name, description) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const spaceKey = EncryptionService.generateSpaceKey();

    const { data, error } = await supabase
      .from('spaces')
      .insert({
        name,
        description,
        owner_id: user.id,
        privacy: 'private',
      })
      .select()
      .single();

    if (error) throw error;

    localStorage.setItem(`space_key_${data.id}`, spaceKey);

    await get().fetchSpaces();
    return data;
  },

  selectSpace: (space) => set({ selectedSpace: space }),
}));
