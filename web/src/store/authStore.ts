// web/src/store/authStore.ts

import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { logger } from '@4space/shared/src/utils/logger';
import type { User, AuthError } from '@supabase/supabase-js';

/**
 * Authentication state store
 * 
 * Security notes:
 * - Uses Supabase Auth which handles JWT tokens securely
 * - Tokens are stored in httpOnly cookies or localStorage (based on config)
 * - All auth operations go through Supabase's secure endpoints
 * - Row Level Security (RLS) policies enforce data access on the database
 * - Never exposes API keys or sensitive credentials
 */

interface AuthState {
  user: User | null;
  loading: boolean;
  initialized: boolean;
  error: AuthError | null;
  signUp: (email: string, password: string, username: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  initialize: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  loading: true,
  initialized: false,
  error: null,

  clearError: () => {
    set({ error: null });
  },

  initialize: async () => {
    // Prevent multiple initializations
    if (get().initialized) {
      logger.debug('Auth already initialized', { component: 'authStore' });
      return;
    }

    logger.info('Initializing authentication', { component: 'authStore' });

    try {
      // Get current session from Supabase
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) {
        logger.error('Failed to get session', error, { component: 'authStore' });
        set({ user: null, loading: false, initialized: true, error });
        return;
      }

      if (session?.user) {
        logger.info('User session restored', {
          component: 'authStore',
          userId: session.user.id,
          email: session.user.email,
        });
        set({ user: session.user, loading: false, initialized: true, error: null });
      } else {
        logger.info('No active user session', { component: 'authStore' });
        set({ user: null, loading: false, initialized: true, error: null });
      }
    } catch (error) {
      logger.error('Auth initialization error', error, { component: 'authStore' });
      set({ user: null, loading: false, initialized: true, error: error as AuthError });
    }

    // Set up auth state listener
    // This automatically updates when user signs in/out in another tab
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      logger.authEvent(`Auth state changed: ${event}`, {
        userId: session?.user?.id,
        email: session?.user?.email,
      });

      if (session?.user) {
        set({ user: session.user, loading: false, error: null });
      } else {
        set({ user: null, loading: false, error: null });
      }
    });

    // Cleanup subscription on unmount (if needed in the future)
    // subscription.unsubscribe()
  },

  signUp: async (email: string, password: string, username: string) => {
    logger.info('Sign up initiated', { 
      component: 'authStore', 
      email,
      username,
    });

    set({ loading: true, error: null });

    try {
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
        logger.error('Sign up failed', error, { 
          component: 'authStore',
          email,
        });
        set({ loading: false, error });
        throw error;
      }

      logger.info('Sign up successful', { 
        component: 'authStore',
        userId: data.user?.id,
        email: data.user?.email,
      });

      set({ loading: false, error: null });
    } catch (error) {
      set({ loading: false, error: error as AuthError });
      throw error;
    }
  },

  signIn: async (email: string, password: string) => {
    logger.info('Sign in initiated', { 
      component: 'authStore',
      email,
    });

    set({ loading: true, error: null });

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        logger.error('Sign in failed', error, { 
          component: 'authStore',
          email,
        });
        set({ loading: false, error });
        throw error;
      }

      logger.info('Sign in successful', { 
        component: 'authStore',
        userId: data.user?.id,
        email: data.user?.email,
      });

      set({ user: data.user, loading: false, error: null });
    } catch (error) {
      set({ loading: false, error: error as AuthError });
      throw error;
    }
  },

  signOut: async () => {
    logger.info('Sign out initiated', { 
      component: 'authStore',
      userId: get().user?.id,
    });

    set({ loading: true, error: null });

    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        logger.error('Sign out failed', error, { component: 'authStore' });
        set({ loading: false, error });
        throw error;
      }

      logger.info('Sign out successful', { component: 'authStore' });
      set({ user: null, loading: false, error: null });
    } catch (error) {
      set({ loading: false, error: error as AuthError });
      throw error;
    }
  },
}));