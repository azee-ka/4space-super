// WebRTC hooks for the web app
import { supabase } from '../lib/supabase';
import { createWebRTCHooks } from '@4space/shared/src/hooks/useWebRTC';

export const useWebRTC = createWebRTCHooks(supabase);