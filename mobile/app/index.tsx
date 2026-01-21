import { Redirect } from 'expo-router';
import { useAuthStore } from '../src/store/authStore';
import { LoadingSpinner } from '../src/components/ui';

export default function Index() {
  const { user, initialized } = useAuthStore();

  if (!initialized) {
    return <LoadingSpinner fullScreen />;
  }

  if (user) {
    return <Redirect href="/(tabs)" />;
  }

  return <Redirect href="/login" />;
}
