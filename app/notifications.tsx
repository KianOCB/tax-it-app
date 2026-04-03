import { useCallback, useEffect, useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getNotifications, markNotificationRead } from '../lib/api';

const TYPE_ICONS: Record<string, { name: string; color: string }> = {
  vat_deadline: { name: 'calendar', color: '#EF4444' },
  irp6_deadline: { name: 'calendar', color: '#F59E0B' },
  licence_expiry: { name: 'car', color: '#3B82F6' },
  receipt_processed: { name: 'checkmark-circle', color: '#10B981' },
  trial_expiring: { name: 'time', color: '#F59E0B' },
  general: { name: 'notifications', color: '#1F4E79' },
};

const ROUTE_MAP: Record<string, string> = {
  vat_deadline: '/reports',
  irp6_deadline: '/reports',
  licence_expiry: '/vehicles',
  receipt_processed: '/(tabs)/expenses',
  trial_expiring: '/subscription',
};

// Generate deadline-based in-app notifications
function getDeadlineNotifications(): any[] {
  const now = new Date();
  const year = now.getFullYear();
  const deadlines: any[] = [];

  // VAT201 due dates: end of Jan, Mar, May, Jul, Sep, Nov
  const vatMonths = [1, 3, 5, 7, 9, 11];
  for (const m of vatMonths) {
    const due = new Date(year, m - 1, m === 2 ? 28 : 31);
    if (m === 1 || m === 3 || m === 5) due.setDate(31);
    if (m === 9 || m === 11) due.setDate(30);
    const daysUntil = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (daysUntil > 0 && daysUntil <= 14) {
      deadlines.push({
        id: `vat-${year}-${m}`,
        type: 'vat_deadline',
        title: 'VAT201 Return Due',
        body: `Your VAT201 return is due in ${daysUntil} day${daysUntil === 1 ? '' : 's'}`,
        created_at: new Date().toISOString(),
        read: false,
      });
    }
  }

  // IRP6(1) 31 August
  const irp6_1 = new Date(year, 7, 31);
  const daysToIrp6_1 = Math.ceil((irp6_1.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (daysToIrp6_1 > 0 && daysToIrp6_1 <= 14) {
    deadlines.push({
      id: `irp6-1-${year}`,
      type: 'irp6_deadline',
      title: 'IRP6(1) Provisional Tax Due',
      body: `First provisional tax payment due in ${daysToIrp6_1} days`,
      created_at: new Date().toISOString(),
      read: false,
    });
  }

  // IRP6(2) 28/29 February
  const irp6_2 = new Date(year, 1, 28);
  const daysToIrp6_2 = Math.ceil((irp6_2.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (daysToIrp6_2 > 0 && daysToIrp6_2 <= 14) {
    deadlines.push({
      id: `irp6-2-${year}`,
      type: 'irp6_deadline',
      title: 'IRP6(2) Provisional Tax Due',
      body: `Second provisional tax payment due in ${daysToIrp6_2} days`,
      created_at: new Date().toISOString(),
      read: false,
    });
  }

  return deadlines;
}

export default function NotificationsScreen() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const server = await getNotifications().catch(() => []);
      const deadlines = getDeadlineNotifications();
      setNotifications([...deadlines, ...server]);
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleTap = async (item: any) => {
    if (!item.read) {
      markNotificationRead(item.id).catch(() => {});
      setNotifications((prev) =>
        prev.map((n) => (n.id === item.id ? { ...n, read: true } : n))
      );
    }
    const route = ROUTE_MAP[item.type];
    if (route) router.push(route as any);
  };

  const handleDismiss = (id: string) => {
    markNotificationRead(id).catch(() => {});
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const renderItem = ({ item }: { item: any }) => {
    const typeInfo = TYPE_ICONS[item.type] || TYPE_ICONS.general;
    return (
      <Pressable
        style={[styles.notification, !item.read && styles.unread]}
        onPress={() => handleTap(item)}
        onLongPress={() => handleDismiss(item.id)}
      >
        <View style={[styles.iconCircle, { backgroundColor: typeInfo.color + '20' }]}>
          <Ionicons name={typeInfo.name as any} size={22} color={typeInfo.color} />
        </View>
        <View style={styles.notifContent}>
          <Text style={[styles.notifTitle, !item.read && styles.notifTitleUnread]}>{item.title}</Text>
          <Text style={styles.notifBody}>{item.body}</Text>
          <Text style={styles.notifTime}>{item.created_at?.slice(0, 10)}</Text>
        </View>
        {!item.read && <View style={styles.unreadDot} />}
      </Pressable>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={notifications}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="notifications-off-outline" size={64} color="#ccc" />
            <Text style={styles.emptyTitle}>No notifications</Text>
            <Text style={styles.emptyText}>You're all caught up!</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  list: { padding: 12 },
  notification: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    gap: 12,
  },
  unread: { backgroundColor: '#F0F7FF' },
  iconCircle: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  notifContent: { flex: 1 },
  notifTitle: { fontSize: 15, fontWeight: '500', color: '#333' },
  notifTitleUnread: { fontWeight: '700' },
  notifBody: { fontSize: 13, color: '#666', marginTop: 2 },
  notifTime: { fontSize: 11, color: '#999', marginTop: 4 },
  unreadDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#1F4E79' },
  empty: { alignItems: 'center', paddingVertical: 60 },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: '#666', marginTop: 16 },
  emptyText: { fontSize: 14, color: '#999', marginTop: 4 },
});
