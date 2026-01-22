import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Text } from 'react-native';
import { theme } from '../../src/styles/theme';

export default function TabsLayout() {
  const tabColors = {
    dashboard: { active: '#06b6d4' },
    messages: { active: '#ec4899' },
    spaces: { active: '#10b981' },
    settings: { active: '#a855f7' },
  };
  const inactiveColor = theme.colors.textSubtle;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.colors.base,
          borderTopColor: theme.colors.base,
          borderTopWidth: 0,
          height: 92,
          paddingBottom: 32,
          paddingTop: 10,
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
            <Text style={{ fontSize: 11, color: focused ? tabColors.dashboard.active : inactiveColor }}>
              Home
            </Text>
          ),
          tabBarIcon: ({ size, focused }) => (
            <Ionicons
              name="grid-outline"
              size={size}
              color={focused ? tabColors.dashboard.active : inactiveColor}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: 'Messages',
          tabBarLabel: ({ focused }) => (
            <Text style={{ fontSize: 11, color: focused ? tabColors.messages.active : inactiveColor }}>
              Messages
            </Text>
          ),
          tabBarIcon: ({ size, focused }) => (
            <Ionicons
              name="chatbubbles-outline"
              size={size}
              color={focused ? tabColors.messages.active : inactiveColor}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="spaces/index"
        options={{
          title: 'Spaces',
          tabBarLabel: ({ focused }) => (
            <Text style={{ fontSize: 11, color: focused ? tabColors.spaces.active : inactiveColor }}>
              Spaces
            </Text>
          ),
          tabBarIcon: ({ size, focused }) => (
            <Ionicons
              name="apps-outline"
              size={size}
              color={focused ? tabColors.spaces.active : inactiveColor}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarLabel: ({ focused }) => (
            <Text style={{ fontSize: 11, color: focused ? tabColors.settings.active : inactiveColor }}>
              Settings
            </Text>
          ),
          tabBarIcon: ({ size, focused }) => (
            <Ionicons
              name="settings-outline"
              size={size}
              color={focused ? tabColors.settings.active : inactiveColor}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="spaces/[id]"
        options={{
          tabBarStyle: { display: 'none' },
          tabBarButton: () => null,
        }}
      />
    </Tabs>
  );
}
