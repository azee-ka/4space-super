import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Text } from 'react-native';
import { theme } from '../../src/styles/theme';

export default function TabsLayout() {
  const tabColors = {
    dashboard: { base: '#22d3ee', active: '#06b6d4' },
    messages: { base: '#f472b6', active: '#ec4899' },
    spaces: { base: '#34d399', active: '#10b981' },
    settings: { base: '#fbbf24', active: '#f59e0b' },
  };

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.colors.base,
          borderTopColor: theme.colors.base,
          borderTopWidth: 0,
          height: 74,
          paddingBottom: 16,
          paddingTop: 8,
        },
        tabBarItemStyle: {
          paddingTop: 4,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarLabel: ({ focused }) => (
            <Text style={{ fontSize: 11, color: focused ? tabColors.dashboard.active : tabColors.dashboard.base }}>
              Home
            </Text>
          ),
          tabBarIcon: ({ size, focused }) => (
            <Ionicons
              name="grid-outline"
              size={size}
              color={focused ? tabColors.dashboard.active : tabColors.dashboard.base}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="messages/index"
        options={{
          title: 'Messages',
          tabBarLabel: ({ focused }) => (
            <Text style={{ fontSize: 11, color: focused ? tabColors.messages.active : tabColors.messages.base }}>
              Messages
            </Text>
          ),
          tabBarIcon: ({ size, focused }) => (
            <Ionicons
              name="chatbubbles-outline"
              size={size}
              color={focused ? tabColors.messages.active : tabColors.messages.base}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="spaces/index"
        options={{
          title: 'Spaces',
          tabBarLabel: ({ focused }) => (
            <Text style={{ fontSize: 11, color: focused ? tabColors.spaces.active : tabColors.spaces.base }}>
              Spaces
            </Text>
          ),
          tabBarIcon: ({ size, focused }) => (
            <Ionicons
              name="apps-outline"
              size={size}
              color={focused ? tabColors.spaces.active : tabColors.spaces.base}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="settings/index"
        options={{
          title: 'Settings',
          tabBarLabel: ({ focused }) => (
            <Text style={{ fontSize: 11, color: focused ? tabColors.settings.active : tabColors.settings.base }}>
              Settings
            </Text>
          ),
          tabBarIcon: ({ size, focused }) => (
            <Ionicons
              name="settings-outline"
              size={size}
              color={focused ? tabColors.settings.active : tabColors.settings.base}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="messages/[id]"
        options={{
          href: null,
          title: 'Chat',
          tabBarStyle: { display: 'none' },
        }}
      />
      <Tabs.Screen
        name="messages/[id]/settings"
        options={{
          href: null,
          title: 'Chat Settings',
          tabBarStyle: { display: 'none' },
        }}
      />
    </Tabs>
  );
}
