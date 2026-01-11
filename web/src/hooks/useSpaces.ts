// web/src/hooks/useSpaces.ts
import type { SupabaseClient } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { createSpaceHooks } from '@4space/shared';

// Create hooks with the web supabase client
const spaceHooks = createSpaceHooks(supabase as unknown as SupabaseClient<any, "public", "public", any, any>);

// Export all hooks
export const useSpaces = spaceHooks.useSpaces;
export const useSpace = spaceHooks.useSpace;
export const useSpaceStats = spaceHooks.useSpaceStats;
export const useSpaceMembers = spaceHooks.useSpaceMembers;
export const useCreateSpace = spaceHooks.useCreateSpace;
export const useUpdateSpace = spaceHooks.useUpdateSpace;
export const useDeleteSpace = spaceHooks.useDeleteSpace;
export const useConvertSpacePrivacy = spaceHooks.useConvertSpacePrivacy;

// Re-export query keys
export { spaceKeys } from '@4space/shared';