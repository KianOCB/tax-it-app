import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { getTaxDashboard } from '../../lib/api';

function SummaryCard({ title, value, subtitle, color }: { title: string; value: string; subtitle: string; color?: string }) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={[styles.cardValue, color ? { color } : {}]}>{value}</Text>
      <Text style={styles.cardSubtitle}>{subtitle}</Text>
    </View>
  );
}

function QuickAction({ icon, label, onPress }: { icon: string; label: string; onPress: () => void }) {
  return (
    <Pressable style={styles.quickAction} onPress={onPress}>
      <Ionicons name={icon as any} size={24} color="#1F4E79" />
      <Text style={styles.quickActionText}>{label}</Text>
    </Pressable>
  );
}

export default function HomeScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [dashboard, setDashboard] = useState<any>(null);

  useEffect(() => {
    getTaxDashboard().then(setDashboard).catch(() => {});
  }, []);

  const d = dashboard;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.greeting}>
        Welcome{user?.email ? `, ${user.email.split('@')[0]}` : ''}
      </Text>
      <Text style={styles.period}>Tax Year 2025/2026</Text>

      {/* Quick actions */}
      <View style={styles.quickActions}>
        <QuickAction icon="camera" label="Scan Receipt" onPress={() => router.push('/(tabs)/scan')} />
        <QuickAction icon="speedometer" label="Log Trip" onPress={() => router.push('/logbook')} />
        <QuickAction icon="wallet" label="Add Income" onPress={() => router.push('/income')} />
        <QuickAction icon="document-text" label="Reports" onPress={() => router.push('/reports')} />
      </View>

      {/* Summary cards */}
      <View style={styles.grid}>
        <SummaryCard
          title="Estimated Annual Deductions"
          value={`R ${(d?.estimated_annual_deductions ?? 0).toLocaleString()}`}
          subtitle="Across all categories"
          color="#10B981"
        />
        <SummaryCard
          title="VAT Reclaimable"
          value={`R ${(d?.estimated_vat_refund ?? 0).toLocaleString()}`}
          subtitle="From VAT-eligible receipts"
          color="#3B82F6"
        />
        <SummaryCard
          title="Receipts This Month"
          value={String(d?.receipts_this_month ?? 0)}
          subtitle="Scanned and processed"
          color="#F59E0B"
        />
        <SummaryCard
          title="Business km This Month"
          value={`${(d?.business_km_this_month ?? 0).toFixed(0)} km`}
          subtitle="Logged in the logbook"
          color="#8B5CF6"
        />
      </View>

      {/* Tax comparison teaser */}
      <Pressable style={styles.comparisonCard} onPress={() => router.push('/tax-comparison')}>
        <View>
          <Text style={styles.comparisonTitle}>Tax Method Comparison</Text>
          <Text style={styles.comparisonSubtitle}>Actual Cost vs Deemed Cost — see which saves you more</Text>
        </View>
        <Ionicons name="chevron-forward" size={24} color="#1F4E79" />
      </Pressable>

      {/* Upcoming deadlines */}
      <View style={styles.deadlinesCard}>
        <Text style={styles.deadlinesTitle}>Upcoming Deadlines</Text>
        <View style={styles.deadline}>
          <Ionicons name="calendar" size={18} color="#EF4444" />
          <View style={{ marginLeft: 10, flex: 1 }}>
            <Text style={styles.deadlineName}>VAT201 Return</Text>
            <Text style={styles.deadlineDate}>Due 31 May 2026</Text>
          </View>
        </View>
        <View style={styles.deadline}>
          <Ionicons name="calendar" size={18} color="#F59E0B" />
          <View style={{ marginLeft: 10, flex: 1 }}>
            <Text style={styles.deadlineName}>IRP6(1) Provisional Tax</Text>
            <Text style={styles.deadlineDate}>Due 31 August 2026</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  content: { padding: 16, paddingBottom: 32 },
  greeting: { fontSize: 24, fontWeight: 'bold', color: '#1F4E79' },
  period: { fontSize: 14, color: '#666', marginTop: 4, marginBottom: 16 },
  quickActions: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  quickAction: { flex: 1, backgroundColor: '#fff', borderRadius: 12, padding: 14, alignItems: 'center', elevation: 2, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 3, shadowOffset: { width: 0, height: 1 } },
  quickActionText: { fontSize: 11, color: '#333', marginTop: 6, fontWeight: '500', textAlign: 'center' },
  grid: { gap: 12, marginBottom: 16 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 3, elevation: 2 },
  cardTitle: { fontSize: 14, color: '#666', marginBottom: 4 },
  cardValue: { fontSize: 28, fontWeight: 'bold', color: '#1F4E79' },
  cardSubtitle: { fontSize: 12, color: '#999', marginTop: 4 },
  comparisonCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#E8F0F8', borderRadius: 12, padding: 16, marginBottom: 16 },
  comparisonTitle: { fontSize: 16, fontWeight: '600', color: '#1F4E79' },
  comparisonSubtitle: { fontSize: 13, color: '#555', marginTop: 2 },
  deadlinesCard: { backgroundColor: '#fff', borderRadius: 12, padding: 16 },
  deadlinesTitle: { fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 12 },
  deadline: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#eee' },
  deadlineName: { fontSize: 14, fontWeight: '500', color: '#333' },
  deadlineDate: { fontSize: 12, color: '#666', marginTop: 1 },
});
