import { useState } from 'react';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../../lib/api';

const PLATFORMS = ['Uber', 'Bolt', 'InDriver', 'Mr D', 'Bolt Food', 'Swoove', 'Other'];

export default function PlatformScreen() {
  const router = useRouter();
  const [selected, setSelected] = useState<string[]>([]);

  const toggle = (p: string) => {
    setSelected((prev) => prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]);
  };

  const handleNext = async () => {
    if (selected.length === 0) return;
    api.put('/api/auth/me', { primary_platform: selected[0], platforms: selected }).catch(() => {});
    router.push('/onboarding/vehicle');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.dots}>
          {[0, 1, 2, 3, 4].map((i) => (
            <View key={i} style={[styles.dot, i === 1 && styles.dotActive]} />
          ))}
        </View>
        <Text style={styles.title}>Which platforms?</Text>
        <Text style={styles.subtitle}>Select all that apply — you can change these later</Text>

        <View style={styles.grid}>
          {PLATFORMS.map((p) => {
            const isActive = selected.includes(p);
            return (
              <Pressable key={p} style={[styles.chip, isActive && styles.chipActive]} onPress={() => toggle(p)}>
                {isActive && <Ionicons name="checkmark" size={16} color="#fff" />}
                <Text style={[styles.chipText, isActive && styles.chipTextActive]}>{p}</Text>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
      <View style={styles.footer}>
        <Pressable
          style={[styles.nextBtn, selected.length === 0 && { opacity: 0.4 }]}
          onPress={handleNext}
          disabled={selected.length === 0}
        >
          <Text style={styles.nextText}>Next</Text>
          <Ionicons name="arrow-forward" size={20} color="#fff" />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  scroll: { padding: 24, paddingBottom: 100 },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 24 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#ddd' },
  dotActive: { backgroundColor: '#1F4E79', width: 24 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#1F4E79' },
  subtitle: { fontSize: 15, color: '#666', marginTop: 8, marginBottom: 24 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  chip: { paddingVertical: 12, paddingHorizontal: 20, borderRadius: 24, borderWidth: 2, borderColor: '#E8F0F8', flexDirection: 'row', alignItems: 'center', gap: 6 },
  chipActive: { backgroundColor: '#1F4E79', borderColor: '#1F4E79' },
  chipText: { fontSize: 15, fontWeight: '600', color: '#333' },
  chipTextActive: { color: '#fff' },
  footer: { padding: 24, backgroundColor: '#fff', borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#eee' },
  nextBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#1F4E79', borderRadius: 8, padding: 16 },
  nextText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
