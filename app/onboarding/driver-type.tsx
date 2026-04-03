import { useState } from 'react';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../../lib/api';

const TYPES = [
  { key: 'ehailing', label: 'E-hailing', sub: 'Uber / Bolt', icon: 'car' },
  { key: 'food_delivery', label: 'Food Delivery', sub: 'Mr D / Bolt Food', icon: 'fast-food' },
  { key: 'bike_courier', label: 'Bike Courier', sub: 'Courier services', icon: 'bicycle' },
  { key: 'minibus_taxi', label: 'Minibus Taxi', sub: 'Public transport', icon: 'bus' },
  { key: 'freight', label: 'Freight / Trucking', sub: 'Long haul', icon: 'cube' },
  { key: 'other', label: 'Other', sub: 'Something else', icon: 'ellipsis-horizontal' },
];

export default function DriverTypeScreen() {
  const router = useRouter();
  const [selected, setSelected] = useState<string | null>(null);

  const handleNext = async () => {
    if (!selected) return;
    api.put('/api/auth/me', { driver_type: selected }).catch(() => {});
    router.push('/onboarding/platform');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.dots}>
          {[0, 1, 2, 3, 4].map((i) => (
            <View key={i} style={[styles.dot, i === 0 && styles.dotActive]} />
          ))}
        </View>
        <Text style={styles.title}>What do you do?</Text>
        <Text style={styles.subtitle}>This helps us tailor Tax-IT for your needs</Text>

        {TYPES.map((t) => (
          <Pressable
            key={t.key}
            style={[styles.card, selected === t.key && styles.cardActive]}
            onPress={() => setSelected(t.key)}
          >
            <Ionicons name={t.icon as any} size={32} color={selected === t.key ? '#fff' : '#1F4E79'} />
            <View style={{ marginLeft: 16, flex: 1 }}>
              <Text style={[styles.cardLabel, selected === t.key && styles.cardLabelActive]}>{t.label}</Text>
              <Text style={[styles.cardSub, selected === t.key && styles.cardSubActive]}>{t.sub}</Text>
            </View>
            {selected === t.key && <Ionicons name="checkmark-circle" size={24} color="#fff" />}
          </Pressable>
        ))}
      </ScrollView>
      <View style={styles.footer}>
        <Pressable
          style={[styles.nextBtn, !selected && { opacity: 0.4 }]}
          onPress={handleNext}
          disabled={!selected}
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
  card: { flexDirection: 'row', alignItems: 'center', borderWidth: 2, borderColor: '#E8F0F8', borderRadius: 12, padding: 16, marginBottom: 12 },
  cardActive: { backgroundColor: '#1F4E79', borderColor: '#1F4E79' },
  cardLabel: { fontSize: 17, fontWeight: '600', color: '#333' },
  cardLabelActive: { color: '#fff' },
  cardSub: { fontSize: 13, color: '#666', marginTop: 2 },
  cardSubActive: { color: '#B0C8E0' },
  footer: { padding: 24, backgroundColor: '#fff', borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#eee' },
  nextBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#1F4E79', borderRadius: 8, padding: 16 },
  nextText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
