import { Slot, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { queryClient } from '../src/lib/queryClient';
import { useAuthStore } from '../src/store/authStore';
import { LoadingSpinner } from '../src/components/ui';
import { theme } from '../src/styles/theme';

export default function RootLayout() {
  const { user, initialized, initialize } = useAuthStore();
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

  if (!initialized) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <StatusBar style="light" backgroundColor={theme.colors.base} />
        <Slot />
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
