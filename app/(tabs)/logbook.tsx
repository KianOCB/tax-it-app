import { useCallback, useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getLogbookSummary, getVehicles } from '../../lib/api';

export default function LogbookTab() {
  const router = useRouter();
  const [summary, setSummary] = useState<any>(null);
  const [hasVehicles, setHasVehicles] = useState(true);

  const load = useCallback(async () => {
    try {
      const vehicles = await getVehicles();
      setHasVehicles(vehicles.length > 0);
      if (vehicles.length > 0) {
        const s = await getLogbookSummary();
        setSummary(s);
      }
    } catch {}
  }, []);

  useEffect(() => { load(); }, [load]);

  if (!hasVehicles) {
    return (
      <View style={styles.container}>
        <View style={styles.empty}>
          <Ionicons name="car-outline" size={64} color="#ccc" />
          <Text style={styles.emptyTitle}>Add a Vehicle First</Text>
          <Text style={styles.emptyText}>You need a vehicle before logging trips.</Text>
          <Pressable style={styles.primaryBtn} onPress={() => router.push('/vehicles')}>
            <Ionicons name="add" size={20} color="#fff" />
            <Text style={styles.primaryBtnText}>Add Vehicle</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scroll}>
      {/* Summary card */}
      {summary && (
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>This Month</Text>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{summary.total_km?.toFixed(0) ?? 0}</Text>
              <Text style={styles.summaryLabel}>Total km</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryValue, { color: '#10B981' }]}>{summary.business_km?.toFixed(0) ?? 0}</Text>
              <Text style={styles.summaryLabel}>Business</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryValue, { color: '#1F4E79' }]}>{(summary.business_use_percentage ?? 0).toFixed(0)}%</Text>
              <Text style={styles.summaryLabel}>Business use</Text>
            </View>
          </View>
        </View>
      )}

      {/* Quick actions */}
      <View style={styles.actions}>
        <Pressable style={styles.actionCard} onPress={() => router.push('/logbook')}>
          <Ionicons name="add-circle" size={32} color="#1F4E79" />
          <Text style={styles.actionTitle}>Log a Trip</Text>
          <Text style={styles.actionDesc}>Record odometer readings</Text>
        </Pressable>

        <Pressable style={styles.actionCard} onPress={() => router.push('/logbook-history')}>
          <Ionicons name="list" size={32} color="#1F4E79" />
          <Text style={styles.actionTitle}>Trip History</Text>
          <Text style={styles.actionDesc}>View past trips</Text>
        </Pressable>
      </View>

      <Pressable style={styles.vehicleLink} onPress={() => router.push('/vehicles')}>
        <Ionicons name="car-sport" size={20} color="#1F4E79" />
        <Text style={styles.vehicleLinkText}>Manage Vehicles</Text>
        <Ionicons name="chevron-forward" size={18} color="#999" />
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  scroll: { padding: 16 },
  summaryCard: { backgroundColor: '#fff', borderRadius: 12, padding: 20, marginBottom: 16, elevation: 2, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 3, shadowOffset: { width: 0, height: 1 } },
  summaryTitle: { fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 12 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-around' },
  summaryItem: { alignItems: 'center' },
  summaryValue: { fontSize: 24, fontWeight: 'bold', color: '#1F4E79' },
  summaryLabel: { fontSize: 12, color: '#666', marginTop: 2 },
  actions: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  actionCard: { flex: 1, backgroundColor: '#fff', borderRadius: 12, padding: 20, alignItems: 'center', elevation: 2, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 3, shadowOffset: { width: 0, height: 1 } },
  actionTitle: { fontSize: 15, fontWeight: '600', color: '#333', marginTop: 8 },
  actionDesc: { fontSize: 12, color: '#666', marginTop: 2 },
  vehicleLink: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#fff', borderRadius: 12, padding: 16 },
  vehicleLinkText: { flex: 1, fontSize: 15, fontWeight: '500', color: '#333' },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: '#666', marginTop: 16 },
  emptyText: { fontSize: 14, color: '#999', marginTop: 4, marginBottom: 24 },
  primaryBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#1F4E79', borderRadius: 8, paddingVertical: 14, paddingHorizontal: 24 },
  primaryBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
