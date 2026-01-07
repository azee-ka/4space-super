import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { User } from '@supabase/supabase-js';
import { EncryptionService } from '@4space/shared';
import * as SecureStore from 'expo-secure-store';

interface AuthState {
  user: User | null;
  loading: boolean;
  initialize: () => Promise<void>;
  signUp: (email: string, password: string, username: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,

  initialize: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      set({ user: session?.user ?? null, loading: false });

      supabase.auth.onAuthStateChange((_event, session) => {
        set({ user: session?.user ?? null });
      });
    } catch (error) {
      console.error('Initialize error:', error);
      set({ loading: false });
    }
  },

  signUp: async (email, password, username) => {
    const keyPair = EncryptionService.generateKeyPair();
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
          display_name: username,
          public_key: keyPair.publicKey,
        },
      },
    });

    if (error) throw error;

    if (data.user) {
      await SecureStore.setItemAsync(
        `user_secret_key_${data.user.id}`,
        keyPair.secretKey
      );
    }
  },

  signIn: async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null });
  },
}));
