import { Stack } from 'expo-router';

export default function MessagesLayout() {
  return (
    <Stack
      initialRouteName="index"
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
      }}
    />
  );
}
