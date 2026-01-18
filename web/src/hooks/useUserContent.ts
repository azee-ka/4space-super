// web/src/hooks/useUserContent.ts
import type { SupabaseClient } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { createUserContentHooks } from '@4space/shared/src/hooks/useUserContent';

const userContentHooks = createUserContentHooks(
  supabase as unknown as SupabaseClient<any, 'public', 'public', any, any>
);

export const useUserNotes = userContentHooks.useUserNotes;
export const useCreateUserNote = userContentHooks.useCreateUserNote;
export const useUpdateUserNote = userContentHooks.useUpdateUserNote;
export const useDeleteUserNote = userContentHooks.useDeleteUserNote;

export const useUserReminders = userContentHooks.useUserReminders;
export const useCreateUserReminder = userContentHooks.useCreateUserReminder;
export const useUpdateUserReminder = userContentHooks.useUpdateUserReminder;
export const useDeleteUserReminder = userContentHooks.useDeleteUserReminder;

export const useUserSavedMessages = userContentHooks.useUserSavedMessages;
export const useSaveMessage = userContentHooks.useSaveMessage;
export const useUnsaveMessage = userContentHooks.useUnsaveMessage;

export const useUserKeptMessages = userContentHooks.useUserKeptMessages;
export const useKeepMessage = userContentHooks.useKeepMessage;
export const useUnkeepMessage = userContentHooks.useUnkeepMessage;