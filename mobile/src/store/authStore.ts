import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { User } from '../types';
import { Session } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  initialized: boolean;
  
  initialize: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, username: string) => Promise<void>;
  signOut: () => Promise<void>;
  setUser: (user: User | null) => void;
  setSession: (session: Session | null) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  loading: false,
  initialized: false,

  initialize: async () => {
    try {
      set({ loading: true });
      
      // Get current session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        // Fetch user profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (profile) {
          set({
            user: profile as User,
            session,
            initialized: true,
            loading: false,
          });
        }
      } else {
        set({ initialized: true, loading: false });
      }

      // Listen to auth changes
      supabase.auth.onAuthStateChange(async (_event, session) => {
        if (session?.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (profile) {
            set({ user: profile as User, session });
          }
        } else {
          set({ user: null, session: null });
        }
      });
    } catch (error) {
      console.error('Auth initialization error:', error);
      set({ initialized: true, loading: false });
    }
  },

  signIn: async (email: string, password: string) => {
    try {
      set({ loading: true });
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (profile) {
          set({ user: profile as User, session: data.session, loading: false });
        }
      }
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  signUp: async (email: string, password: string, username: string) => {
    try {
      set({ loading: true });
      
      // Check if username is taken
      const { data: existingUser } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', username)
        .single();

      if (existingUser) {
        throw new Error('Username already taken');
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
            display_name: username,
          },
        },
      });

      if (error) throw error;

      set({ loading: false });
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  signOut: async () => {
    try {
      set({ loading: true });
      await supabase.auth.signOut();
      set({ user: null, session: null, loading: false });
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  setUser: (user: User | null) => set({ user }),
  setSession: (session: Session | null) => set({ session }),
}));
