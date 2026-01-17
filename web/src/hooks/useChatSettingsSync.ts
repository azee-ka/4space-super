// web/src/hooks/useChatSettingsSync.ts
import { useEffect, useRef } from 'react';
import type { SupabaseClient } from '@supabase/supabase-js';
import { SettingsService } from '@4space/shared/src/services/settings.service';
import type { UserChatSettings } from '@4space/shared/src/types/chatSettings';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { selectUserChatSettings, useChatSettingsStore } from '../store/chatSettingsStore';

const settingsService = new SettingsService(
  supabase as unknown as SupabaseClient<any, 'public', 'public', any, any>
);

export function useChatSettingsSync() {
  const user = useAuthStore((state) => state.user);
  const hydrateSettings = useChatSettingsStore((state) => state.hydrateSettings);
  const lastSentRef = useRef<string>('');
  const hydratingRef = useRef(false);
  const loadedRef = useRef(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!user) return;

    let isMounted = true;
    hydratingRef.current = true;
    lastSentRef.current = '';

    settingsService
      .getUserChatSettings()
      .then((settings) => {
        if (!isMounted) return;
        hydrateSettings(settings);
        loadedRef.current = true;
      })
      .catch(() => {
        loadedRef.current = true;
      })
      .finally(() => {
        hydratingRef.current = false;
      });

    return () => {
      isMounted = false;
    };
  }, [user?.id, hydrateSettings]);

  useEffect(() => {
    if (!user) return;

    const unsubscribe = useChatSettingsStore.subscribe(
      selectUserChatSettings,
      (settings) => {
        if (hydratingRef.current || !loadedRef.current) return;

        const serialized = JSON.stringify(settings);
        if (serialized === lastSentRef.current) return;

        if (debounceRef.current) {
          clearTimeout(debounceRef.current);
        }

        debounceRef.current = setTimeout(() => {
          settingsService
            .updateUserChatSettings(settings as UserChatSettings)
            .then(() => {
              lastSentRef.current = serialized;
            })
            .catch(() => {
              // Keep lastSentRef unchanged to retry on next update.
            });
        }, 400);
      }
    );

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      unsubscribe();
    };
  }, [user?.id]);
}
