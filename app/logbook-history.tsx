import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { deleteLogbookEntry, getLogbookEntries, getLogbookSummary } from '../lib/api';

export default function LogbookHistoryScreen() {
  const [entries, setEntries] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [month, setMonth] = useState(() => new Date().toISOString().slice(0, 7));
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [e, s] = await Promise.all([
        getLogbookEntries(month),
        getLogbookSummary(month),
      ]);
      setEntries(e);
      setSummary(s);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [month]);

  useEffect(() => { load(); }, [load]);

  const handleDelete = (id: string) => {
    Alert.alert('Delete Trip', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteLogbookEntry(id);
          load();
        },
      },
    ]);
  };

  const changeMonth = (delta: number) => {
    const d = new Date(month + '-01');
    d.setMonth(d.getMonth() + delta);
    setMonth(d.toISOString().slice(0, 7));
  };

  const renderItem = ({ item }: { item: any }) => {
    const distance = (item.end_odometer - item.start_odometer).toFixed(1);
    const isBusiness = item.trip_type === 'business';
    return (
      <Pressable style={styles.entry} onLongPress={() => handleDelete(item.id)}>
        <View style={styles.entryLeft}>
          <Text style={styles.entryDate}>{item.date}</Text>
          <Text style={styles.entryPurpose} numberOfLines={1}>{item.purpose || 'No purpose'}</Text>
        </View>
        <View style={styles.entryRight}>
          <Text style={styles.entryDistance}>{distance} km</Text>
          <View style={[styles.badge, isBusiness ? styles.badgeBusiness : styles.badgePrivate]}>
            <Text style={[styles.badgeText, isBusiness ? styles.badgeTextBusiness : styles.badgeTextPrivate]}>
              {isBusiness ? 'Business' : 'Private'}
            </Text>
          </View>
        </View>
      </Pressable>
    );
  };

  return (
    <View style={styles.container}>
      {/* Month picker */}
      <View style={styles.monthPicker}>
        <Pressable onPress={() => changeMonth(-1)}>
          <Ionicons name="chevron-back" size={24} color="#1F4E79" />
        </Pressable>
        <Text style={styles.monthText}>{month}</Text>
        <Pressable onPress={() => changeMonth(1)}>
          <Ionicons name="chevron-forward" size={24} color="#1F4E79" />
        </Pressable>
      </View>

      {/* Summary */}
      {summary && (
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{summary.total_km?.toFixed(0) ?? 0}</Text>
              <Text style={styles.summaryLabel}>Total km</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryValue, { color: '#10B981' }]}>{summary.business_km?.toFixed(0) ?? 0}</Text>
              <Text style={styles.summaryLabel}>Business km</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryValue, { color: '#F59E0B' }]}>{summary.private_km?.toFixed(0) ?? 0}</Text>
              <Text style={styles.summaryLabel}>Private km</Text>
            </View>
          </View>
          <View style={styles.percentageBar}>
            <View style={[styles.percentageFill, { width: `${summary.business_use_percentage ?? 0}%` }]} />
          </View>
          <Text style={styles.percentageText}>
            {(summary.business_use_percentage ?? 0).toFixed(0)}% business use
          </Text>
        </View>
      )}

      {/* Entries */}
      <FlatList
        data={entries}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="car-outline" size={48} color="#ccc" />
            <Text style={styles.emptyText}>No trips logged for {month}</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  monthPicker: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 16, paddingVertical: 12, backgroundColor: '#fff' },
  monthText: { fontSize: 18, fontWeight: '600', color: '#1F4E79' },
  summaryCard: { backgroundColor: '#fff', margin: 12, borderRadius: 12, padding: 16, elevation: 2, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 3, shadowOffset: { width: 0, height: 1 } },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-around' },
  summaryItem: { alignItems: 'center' },
  summaryValue: { fontSize: 22, fontWeight: 'bold', color: '#1F4E79' },
  summaryLabel: { fontSize: 12, color: '#666', marginTop: 2 },
  percentageBar: { height: 6, backgroundColor: '#F59E0B', borderRadius: 3, marginTop: 12 },
  percentageFill: { height: 6, backgroundColor: '#10B981', borderRadius: 3 },
  percentageText: { fontSize: 12, color: '#666', textAlign: 'center', marginTop: 6 },
  list: { padding: 12 },
  entry: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#fff', borderRadius: 8, padding: 14, marginBottom: 8 },
  entryLeft: { flex: 1 },
  entryDate: { fontSize: 14, fontWeight: '600', color: '#333' },
  entryPurpose: { fontSize: 13, color: '#666', marginTop: 2 },
  entryRight: { alignItems: 'flex-end' },
  entryDistance: { fontSize: 16, fontWeight: 'bold', color: '#1F4E79' },
  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10, marginTop: 4 },
  badgeBusiness: { backgroundColor: '#D1FAE5' },
  badgePrivate: { backgroundColor: '#FEF3C7' },
  badgeText: { fontSize: 11, fontWeight: '600' },
  badgeTextBusiness: { color: '#065F46' },
  badgeTextPrivate: { color: '#92400E' },
  empty: { alignItems: 'center', paddingVertical: 40 },
  emptyText: { fontSize: 14, color: '#999', marginTop: 8 },
});
