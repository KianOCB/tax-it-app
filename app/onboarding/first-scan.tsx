import { Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function FirstScanScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.content}>
        <View style={styles.dots}>
          {[0, 1, 2, 3, 4].map((i) => (
            <View key={i} style={[styles.dot, i === 3 && styles.dotActive]} />
          ))}
        </View>

        <View style={styles.demo}>
          <View style={styles.receiptMock}>
            <Ionicons name="receipt" size={80} color="#1F4E79" />
            <Text style={styles.mockText}>Sample Receipt</Text>
            <View style={styles.mockLine} />
            <View style={styles.mockLine} />
            <View style={[styles.mockLine, { width: '60%' }]} />
            <View style={styles.mockTotal}>
              <Text style={styles.mockTotalLabel}>TOTAL</Text>
              <Text style={styles.mockTotalValue}>R 156.80</Text>
            </View>
          </View>
        </View>

        <Text style={styles.title}>Your first scan</Text>
        <Text style={styles.subtitle}>
          Point your camera at any receipt and Tax-IT will automatically extract the merchant, amount, and VAT details.
        </Text>
        <Text style={styles.magic}>It's like magic ✨</Text>
      </View>

      <View style={styles.footer}>
        <Pressable style={styles.skipBtn} onPress={() => router.push('/onboarding/complete')}>
          <Text style={styles.skipText}>Skip for now</Text>
        </Pressable>
        <Pressable style={styles.scanBtn} onPress={() => {
          // Navigate to scanner, then on completion go to complete
          router.push('/(tabs)/scan');
        }}>
          <Ionicons name="camera" size={20} color="#fff" />
          <Text style={styles.scanText}>Scan a Receipt</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  content: { flex: 1, padding: 24, justifyContent: 'center' },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 32 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#ddd' },
  dotActive: { backgroundColor: '#1F4E79', width: 24 },
  demo: { alignItems: 'center', marginBottom: 32 },
  receiptMock: { width: 200, backgroundColor: '#F9FAFB', borderRadius: 12, padding: 20, alignItems: 'center', borderWidth: 1, borderColor: '#E5E7EB', borderStyle: 'dashed' },
  mockText: { fontSize: 14, fontWeight: '600', color: '#999', marginTop: 8 },
  mockLine: { width: '80%', height: 8, backgroundColor: '#E5E7EB', borderRadius: 4, marginTop: 8 },
  mockTotal: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginTop: 16, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#E5E7EB' },
  mockTotalLabel: { fontSize: 14, fontWeight: '600', color: '#333' },
  mockTotalValue: { fontSize: 14, fontWeight: 'bold', color: '#1F4E79' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#1F4E79', textAlign: 'center' },
  subtitle: { fontSize: 15, color: '#666', textAlign: 'center', marginTop: 12, lineHeight: 22 },
  magic: { fontSize: 16, color: '#1F4E79', textAlign: 'center', marginTop: 8, fontWeight: '600' },
  footer: { flexDirection: 'row', padding: 24, gap: 12, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#eee' },
  skipBtn: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 16 },
  skipText: { color: '#666', fontSize: 15 },
  scanBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#1F4E79', borderRadius: 8, padding: 16 },
  scanText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
