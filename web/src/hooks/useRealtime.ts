// web/src/hooks/useRealtime.ts
import { supabase } from '../lib/supabase';

// Re-export the working realtime chat hook
export { useRealtimeChat } from '@4space/shared/src/hooks/useRealtimeChat';

// Helper to use with web supabase client
export const createRealtimeHook = () => supabase;