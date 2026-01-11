// web/src/hooks/useRealtime.ts
import { supabase } from '../lib/supabase';

// Re-export all realtime hooks
export {
  useRealtimeMessages,
  usePresence,
  useTypingIndicator,
  useOnlineStatus,
  useRealtimeChat,
} from '@4space/shared/src/hooks/useRealtime.ts';

// Helper to use with web supabase client
export const createRealtimeHook = () => supabase;