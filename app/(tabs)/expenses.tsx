import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function ExpensesScreen() {
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: '#666', marginTop: 16 },
  emptyText: { fontSize: 14, color: '#999', textAlign: 'center', marginTop: 8 },
});
