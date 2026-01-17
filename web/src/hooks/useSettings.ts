// web/src/hooks/useSettings.ts
import type { SupabaseClient } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { createSettingsHooks } from '@4space/shared/src/hooks/useSettings';

const settingsHooks = createSettingsHooks(
  supabase as unknown as SupabaseClient<any, 'public', 'public', any, any>
);

export const useUserChatSettings = settingsHooks.useUserChatSettings;
export const useUpdateUserChatSettings = settingsHooks.useUpdateUserChatSettings;
export const useSpaceSettings = settingsHooks.useSpaceSettings;
export const useUpdateSpaceSettings = settingsHooks.useUpdateSpaceSettings;
export const useRoomSettings = settingsHooks.useRoomSettings;
export const useUpdateRoomSettings = settingsHooks.useUpdateRoomSettings;
export const useUpdateRoomMessageRetention = settingsHooks.useUpdateRoomMessageRetention;
export const useRoomMemberSettings = settingsHooks.useRoomMemberSettings;
export const useUpdateRoomMemberSettings = settingsHooks.useUpdateRoomMemberSettings;
