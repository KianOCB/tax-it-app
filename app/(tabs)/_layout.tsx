import { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Tabs, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getUnreadCount } from '../../lib/api';

function NotificationBell() {
  const router = useRouter();
  const [count, setCount] = useState(0);

  useEffect(() => {
    getUnreadCount().then((d) => setCount(d?.count ?? 0)).catch(() => {});
    const interval = setInterval(() => {
      getUnreadCount().then((d) => setCount(d?.count ?? 0)).catch(() => {});
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Pressable onPress={() => router.push('/notifications')} style={{ marginRight: 16 }}>
      <Ionicons name="notifications-outline" size={24} color="#fff" />
      {count > 0 && (
        <View style={{
          position: 'absolute', top: -4, right: -6,
          backgroundColor: '#EF4444', borderRadius: 9, minWidth: 18, height: 18,
          justifyContent: 'center', alignItems: 'center',
        }}>
          <Text style={{ color: '#fff', fontSize: 10, fontWeight: 'bold' }}>{count > 9 ? '9+' : count}</Text>
        </View>
      )}
    </Pressable>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#1F4E79',
        tabBarInactiveTintColor: '#999',
        headerStyle: { backgroundColor: '#1F4E79' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
        headerRight: () => <NotificationBell />,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <Ionicons name="home" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="scan"
        options={{
          title: 'Scan',
          tabBarIcon: ({ color, size }) => <Ionicons name="camera" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="logbook"
        options={{
          title: 'Logbook',
          tabBarIcon: ({ color, size }) => <Ionicons name="speedometer" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="expenses"
        options={{
          title: 'Expenses',
          tabBarIcon: ({ color, size }) => <Ionicons name="receipt" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <Ionicons name="person" size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
