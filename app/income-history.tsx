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
import { deleteIncome, getIncomeRecords, getIncomeSummary } from '../lib/api';

const PLATFORM_ICONS: Record<string, string> = {
  Uber: 'car',
  Bolt: 'flash',
  InDriver: 'navigate',
  'Mr D': 'fast-food',
  'Bolt Food': 'restaurant',
  Other: 'cash',
};

export default function IncomeHistoryScreen() {
  const [records, setRecords] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [month, setMonth] = useState(() => new Date().toISOString().slice(0, 7));
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [r, s] = await Promise.all([
        getIncomeRecords(month),
        getIncomeSummary(month),
      ]);
      setRecords(r);
      setSummary(s);
    } catch {}
    setLoading(false);
  }, [month]);

  useEffect(() => { load(); }, [load]);

  const handleDelete = (id: string) => {
    Alert.alert('Delete Record', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => { await deleteIncome(id); load(); } },
    ]);
  };

  const changeMonth = (delta: number) => {
    const d = new Date(month + '-01');
    d.setMonth(d.getMonth() + delta);
    setMonth(d.toISOString().slice(0, 7));
  };

  const renderItem = ({ item }: { item: any }) => {
    const iconName = (PLATFORM_ICONS[item.platform] || 'cash') as any;
    return (
      <Pressable style={styles.record} onLongPress={() => handleDelete(item.id)}>
        <Ionicons name={iconName} size={28} color="#1F4E79" />
        <View style={styles.recordInfo}>
          <Text style={styles.recordPlatform}>{item.platform}</Text>
          <Text style={styles.recordPeriod}>
            {item.period_start || '?'} — {item.period_end || '?'}
          </Text>
        </View>
        <View style={styles.recordAmounts}>
          <Text style={styles.recordGross}>R {(item.gross_earnings ?? 0).toLocaleString()}</Text>
          <Text style={styles.recordNet}>Net: R {(item.net_payout ?? 0).toLocaleString()}</Text>
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

      {/* Monthly total */}
      {summary && (
        <View style={styles.totalBar}>
          <View>
            <Text style={styles.totalLabel}>Monthly Total</Text>
            <Text style={styles.totalGross}>Gross: R {(summary.total_gross ?? 0).toLocaleString()}</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.totalNet}>R {(summary.total_net ?? 0).toLocaleString()}</Text>
            <Text style={styles.totalLabel}>Net Payout</Text>
          </View>
        </View>
      )}

      <FlatList
        data={records}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="wallet-outline" size={48} color="#ccc" />
            <Text style={styles.emptyText}>No income recorded for {month}</Text>
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
  totalBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', marginHorizontal: 12, marginTop: 12, borderRadius: 12, padding: 16 },
  totalLabel: { fontSize: 12, color: '#666' },
  totalGross: { fontSize: 14, color: '#333', marginTop: 2 },
  totalNet: { fontSize: 22, fontWeight: 'bold', color: '#10B981' },
  list: { padding: 12 },
  record: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 8, padding: 14, marginBottom: 8, gap: 12 },
  recordInfo: { flex: 1 },
  recordPlatform: { fontSize: 15, fontWeight: '600', color: '#333' },
  recordPeriod: { fontSize: 12, color: '#666', marginTop: 2 },
  recordAmounts: { alignItems: 'flex-end' },
  recordGross: { fontSize: 15, fontWeight: '600', color: '#1F4E79' },
  recordNet: { fontSize: 12, color: '#10B981', marginTop: 2 },
  empty: { alignItems: 'center', paddingVertical: 40 },
  emptyText: { fontSize: 14, color: '#999', marginTop: 8 },
});
