import { Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../../lib/api';

export default function CompleteScreen() {
  const router = useRouter();

  const handleFinish = async () => {
    api.put('/api/auth/me', { onboarding_completed: true }).catch(() => {});
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.content}>
        <View style={styles.dots}>
          {[0, 1, 2, 3, 4].map((i) => (
            <View key={i} style={[styles.dot, i === 4 && styles.dotActive]} />
          ))}
        </View>

        <View style={styles.iconWrap}>
          <Ionicons name="checkmark-circle" size={100} color="#10B981" />
        </View>

        <Text style={styles.title}>You're all set!</Text>
        <Text style={styles.subtitle}>
          Tax-IT is ready to help you track expenses, manage your logbook, and maximise your tax deductions.
        </Text>

        <View style={styles.trialBadge}>
          <Ionicons name="star" size={20} color="#F59E0B" />
          <Text style={styles.trialText}>Pro Trial: 30 days remaining</Text>
        </View>

        <View style={styles.checkList}>
          <View style={styles.checkItem}>
            <Ionicons name="checkmark" size={18} color="#10B981" />
            <Text style={styles.checkText}>Profile configured</Text>
          </View>
          <View style={styles.checkItem}>
            <Ionicons name="checkmark" size={18} color="#10B981" />
            <Text style={styles.checkText}>Platform connected</Text>
          </View>
          <View style={styles.checkItem}>
            <Ionicons name="checkmark" size={18} color="#10B981" />
            <Text style={styles.checkText}>Ready to scan receipts</Text>
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <Pressable style={styles.goBtn} onPress={handleFinish}>
          <Text style={styles.goText}>Go to Dashboard</Text>
          <Ionicons name="arrow-forward" size={20} color="#fff" />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  content: { flex: 1, padding: 24, justifyContent: 'center', alignItems: 'center' },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 32 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#ddd' },
  dotActive: { backgroundColor: '#1F4E79', width: 24 },
  iconWrap: { marginBottom: 24 },
  title: { fontSize: 32, fontWeight: 'bold', color: '#1F4E79', textAlign: 'center' },
  subtitle: { fontSize: 15, color: '#666', textAlign: 'center', marginTop: 12, lineHeight: 22, maxWidth: 300 },
  trialBadge: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#FEF3C7', borderRadius: 24, paddingVertical: 10, paddingHorizontal: 20, marginTop: 24 },
  trialText: { fontSize: 15, fontWeight: '600', color: '#92400E' },
  checkList: { marginTop: 32, gap: 12 },
  checkItem: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  checkText: { fontSize: 15, color: '#333' },
  footer: { padding: 24, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#eee' },
  goBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#1F4E79', borderRadius: 8, padding: 16 },
  goText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
