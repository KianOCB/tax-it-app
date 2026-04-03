import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';

function SummaryCard({ title, value, subtitle }: { title: string; value: string; subtitle: string }) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.cardValue}>{value}</Text>
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
        <QuickAction icon="car" label="Vehicles" onPress={() => router.push('/vehicles')} />
      </View>

      <View style={styles.grid}>
        <SummaryCard title="Total Deductions" value="R 0.00" subtitle="0 qualifying expenses" />
        <SummaryCard title="VAT Claimable" value="R 0.00" subtitle="0 VAT invoices processed" />
        <SummaryCard title="Receipts Scanned" value="0" subtitle="Scan receipts to get started" />
        <SummaryCard title="Estimated Refund" value="R 0.00" subtitle="Based on current data" />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  content: { padding: 16 },
  greeting: { fontSize: 24, fontWeight: 'bold', color: '#1F4E79' },
  period: { fontSize: 14, color: '#666', marginTop: 4, marginBottom: 16 },
  quickActions: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  quickAction: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
  },
  quickActionText: { fontSize: 11, color: '#333', marginTop: 6, fontWeight: '500', textAlign: 'center' },
  grid: { gap: 12 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  cardTitle: { fontSize: 14, color: '#666', marginBottom: 4 },
  cardValue: { fontSize: 28, fontWeight: 'bold', color: '#1F4E79' },
  cardSubtitle: { fontSize: 12, color: '#999', marginTop: 4 },
});
