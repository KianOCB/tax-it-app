import { useCallback, useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../../lib/api';

export default function ExpensesScreen() {
  const router = useRouter();
  const [receipts, setReceipts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get<any>('/api/receipts?per_page=50');
      setReceipts(res.receipts || []);
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  if (!loading && receipts.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.empty}>
          <Ionicons name="receipt-outline" size={64} color="#ccc" />
          <Text style={styles.emptyTitle}>No expenses yet</Text>
          <Text style={styles.emptyText}>
            Scan a receipt or add an expense manually to get started.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Pressable style={styles.analyticsBtn} onPress={() => router.push('/expense-analytics')}>
        <Ionicons name="bar-chart" size={18} color="#1F4E79" />
        <Text style={styles.analyticsBtnText}>View Analytics</Text>
        <Ionicons name="chevron-forward" size={16} color="#999" />
      </Pressable>

      <FlatList
        data={receipts}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.receipt}>
            <View style={{ flex: 1 }}>
              <Text style={styles.merchant}>{item.merchant_name || 'Unknown'}</Text>
              <Text style={styles.date}>{item.receipt_date?.slice(0, 10) || ''} · {item.category || 'uncategorised'}</Text>
            </View>
            <Text style={styles.amount}>R {(item.total_amount ?? 0).toFixed(2)}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  list: { padding: 12 },
  analyticsBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#E8F0F8', margin: 12, marginBottom: 0, borderRadius: 8, padding: 12 },
  analyticsBtnText: { flex: 1, fontSize: 14, fontWeight: '500', color: '#1F4E79' },
  receipt: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 8, padding: 14, marginBottom: 8 },
  merchant: { fontSize: 15, fontWeight: '600', color: '#333' },
  date: { fontSize: 12, color: '#666', marginTop: 2 },
  amount: { fontSize: 16, fontWeight: 'bold', color: '#1F4E79' },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: '#666', marginTop: 16 },
  emptyText: { fontSize: 14, color: '#999', textAlign: 'center', marginTop: 8 },
});
