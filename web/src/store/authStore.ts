import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  loading: boolean;
  initialized: boolean;
  signUp: (email: string, password: string, username: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  loading: true,
  initialized: false,

  initialize: async () => {
    // Prevent multiple initializations
    if (get().initialized) {
      console.log('Already initialized');
      return;
    }

    console.log('🔐 Initializing auth...');
    
    try {
      // Get current session
      const { data: { session }, error } = await supabase.auth.getSession();
      
      console.log('Session check:', { 
        hasSession: !!session, 
        hasUser: !!session?.user,
        error: error?.message 
      });

      if (error) {
        console.error('Session error:', error);
        set({ user: null, loading: false, initialized: true });
        return;
      }

      if (session?.user) {
        console.log('✅ User found:', session.user.email);
        set({ user: session.user, loading: false, initialized: true });
      } else {
        console.log('❌ No user session');
        set({ user: null, loading: false, initialized: true });
      }
    } catch (error) {
      console.error('Initialize error:', error);
      // Even if there's an error, set loading to false so UI can render
      set({ user: null, loading: false, initialized: true });
    }

    // Set up auth state listener
    supabase.auth.onAuthStateChange((event, session) => {
      console.log('🔄 Auth state changed:', event, session?.user?.email);
      
      if (session?.user) {
        set({ user: session.user, loading: false });
      } else {
        set({ user: null, loading: false });
      }
    });
  },

  signUp: async (email, password, username) => {
    console.log('📝 Signing up:', email);
    
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

    if (error) {
      console.error('Signup error:', error);
      throw error;
    }

    console.log('✅ Signup successful:', data.user?.email);
  },

  signIn: async (email, password) => {
    console.log('🔑 Signing in:', email);
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('Sign in error:', error);
      throw error;
    }

    console.log('✅ Sign in successful:', data.user?.email);
    set({ user: data.user, loading: false });
  },

  signOut: async () => {
    console.log('👋 Signing out');
    
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error('Sign out error:', error);
      throw error;
    }

    set({ user: null });
    console.log('✅ Signed out');
  },
}));