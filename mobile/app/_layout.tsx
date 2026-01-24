import { Stack, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { queryClient } from '../src/lib/queryClient';
import { useAuthStore } from '../src/store/authStore';
import { LoadingSpinner } from '../src/components/ui';
import { theme } from '../src/styles/theme';
import { supabase } from '../src/lib/supabase';
import { usePresenceStore } from '../src/store/presenceStore';
import { usePrivacyStore } from '../src/store/privacyStore';

export default function RootLayout() {
  const { user, session, initialized, initialize } = useAuthStore();
  const setOnlineUserIds = usePresenceStore((state) => state.setOnlineUserIds);
  const setLastSeen = usePresenceStore((state) => state.setLastSeen);
  const onlineVisibility = usePrivacyStore((state) => state.onlineVisibility);
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    initialize();
  }, []);

  useEffect(() => {
    if (!initialized) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!user && !inAuthGroup) {
      router.replace('/login');
    } else if (user && inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [user, initialized, segments]);

  useEffect(() => {
    if (!user) {
      supabase.realtime.setAuth('');
      setOnlineUserIds([]);
      return;
    }

    if (session?.access_token) {
      supabase.realtime.setAuth(session.access_token);
    }

    const channel = supabase.channel('online', {
      config: { presence: { key: user.id } },
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        setOnlineUserIds(Object.keys(state || {}));
      })
      .on('presence', { event: 'join' }, () => {
        const state = channel.presenceState();
        setOnlineUserIds(Object.keys(state || {}));
      })
      .on('presence', { event: 'leave' }, (payload) => {
        const state = channel.presenceState();
        setOnlineUserIds(Object.keys(state || {}));
        if (payload?.key) {
          setLastSeen(payload.key, Date.now());
        }
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          try {
            if (onlineVisibility === 'everyone') {
              await channel.track({ user_id: user.id });
            }
          } catch (error) {
            console.warn('Global presence track failed', error);
          }
        }
      });

    return () => {
      channel.unsubscribe();
    };
  }, [user, session?.access_token, setOnlineUserIds, onlineVisibility, setLastSeen]);

  if (!initialized) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <StatusBar style="light" backgroundColor={theme.colors.base} />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="messages/[id]" />
          <Stack.Screen name="messages/[id]/settings" />
          <Stack.Screen name="messages/new" />
        </Stack>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
