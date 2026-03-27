import { Tabs } from 'expo-router';
import { Colors } from '@core/theme';

/**
 * Bottom tab navigator — equivalent to Android's BottomNavigationView.
 * Preloads account and category stores so transaction upsert has data ready.
 */
export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.text.tertiary,
        tabBarStyle: {
          backgroundColor: Colors.surface,
          borderTopColor: Colors.border,
          borderTopWidth: 1,
        },
        headerStyle: { backgroundColor: Colors.surface },
        headerTintColor: Colors.text.primary,
        headerShadowVisible: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarLabel: 'Dashboard',
          tabBarIcon: ({ color }) => <TabIcon label="📊" color={color} />,
          headerTitle: 'Dashboard',
        }}
      />
      <Tabs.Screen
        name="transactions"
        options={{
          title: 'Transactions',
          tabBarLabel: 'Transactions',
          tabBarIcon: ({ color }) => <TabIcon label="💳" color={color} />,
          headerTitle: 'Transactions',
        }}
      />
      <Tabs.Screen
        name="accounts"
        options={{
          title: 'Accounts',
          tabBarLabel: 'Accounts',
          tabBarIcon: ({ color }) => <TabIcon label="🏦" color={color} />,
          headerTitle: 'Accounts',
        }}
      />
      <Tabs.Screen
        name="categories"
        options={{
          title: 'Categories',
          tabBarLabel: 'Categories',
          tabBarIcon: ({ color }) => <TabIcon label="🏷️" color={color} />,
          headerTitle: 'Categories',
        }}
      />
      <Tabs.Screen
        name="reports"
        options={{
          title: 'Reports',
          tabBarLabel: 'Reports',
          tabBarIcon: ({ color }) => <TabIcon label="📈" color={color} />,
          headerTitle: 'Reports',
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarLabel: 'Settings',
          tabBarIcon: ({ color }) => <TabIcon label="⚙️" color={color} />,
          headerTitle: 'Settings',
        }}
      />
    </Tabs>
  );
}

import { Text } from 'react-native';

function TabIcon({ label, color }: { label: string; color: string }) {
  return <Text style={{ fontSize: 20, opacity: color === Colors.primary ? 1 : 0.6 }}>{label}</Text>;
}
