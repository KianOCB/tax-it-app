import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

interface TrialBannerProps {
  daysRemaining: number;
}

export default function TrialBanner({ daysRemaining }: TrialBannerProps) {
  const router = useRouter();

  if (daysRemaining <= 0) return null;

  const color = daysRemaining <= 7 ? '#DC2626' : daysRemaining <= 14 ? '#D97706' : '#065F46';
  const bg = daysRemaining <= 7 ? '#FEE2E2' : daysRemaining <= 14 ? '#FEF3C7' : '#D1FAE5';

  return (
    <Pressable style={[styles.banner, { backgroundColor: bg }]} onPress={() => router.push('/subscription')}>
      <Ionicons name="time" size={18} color={color} />
      <Text style={[styles.text, { color }]}>
        Pro Trial: {daysRemaining} day{daysRemaining === 1 ? '' : 's'} remaining
      </Text>
      <Ionicons name="chevron-forward" size={16} color={color} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  banner: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12, marginHorizontal: 16, marginTop: 8, borderRadius: 8 },
  text: { flex: 1, fontSize: 13, fontWeight: '600' },
});
