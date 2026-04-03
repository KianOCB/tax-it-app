import { useState } from 'react';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { addVehicle } from '../../lib/api';

export default function VehicleScreen() {
  const router = useRouter();
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('');
  const [vehicleType, setVehicleType] = useState('car');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!make || !model || !year) return;
    setSaving(true);
    try {
      await addVehicle({ make, model, year: parseInt(year), vehicle_type: vehicleType });
    } catch {}
    setSaving(false);
    router.push('/onboarding/first-scan');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.dots}>
          {[0, 1, 2, 3, 4].map((i) => (
            <View key={i} style={[styles.dot, i === 2 && styles.dotActive]} />
          ))}
        </View>
        <Text style={styles.title}>Add your vehicle</Text>
        <Text style={styles.subtitle}>Needed for logbook and tax calculations</Text>

        <View style={styles.field}>
          <Text style={styles.label}>Make</Text>
          <TextInput style={styles.input} value={make} onChangeText={setMake} placeholder="e.g. Toyota" placeholderTextColor="#999" />
        </View>
        <View style={styles.field}>
          <Text style={styles.label}>Model</Text>
          <TextInput style={styles.input} value={model} onChangeText={setModel} placeholder="e.g. Corolla" placeholderTextColor="#999" />
        </View>
        <View style={styles.row}>
          <View style={[styles.field, { flex: 1 }]}>
            <Text style={styles.label}>Year</Text>
            <TextInput style={styles.input} value={year} onChangeText={setYear} keyboardType="numeric" placeholder="2022" placeholderTextColor="#999" />
          </View>
          <View style={[styles.field, { flex: 1 }]}>
            <Text style={styles.label}>Type</Text>
            <View style={styles.typeRow}>
              {['car', 'van'].map((t) => (
                <Pressable key={t} style={[styles.typeBtn, vehicleType === t && styles.typeBtnActive]} onPress={() => setVehicleType(t)}>
                  <Text style={[styles.typeText, vehicleType === t && styles.typeTextActive]}>{t.charAt(0).toUpperCase() + t.slice(1)}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>
      <View style={styles.footer}>
        <Pressable style={styles.skipBtn} onPress={() => router.push('/onboarding/first-scan')}>
          <Text style={styles.skipText}>Skip for now</Text>
        </Pressable>
        <Pressable
          style={[styles.nextBtn, (!make || !model || !year) && { opacity: 0.4 }]}
          onPress={handleSave}
          disabled={!make || !model || !year || saving}
        >
          <Text style={styles.nextText}>{saving ? 'Saving...' : 'Next'}</Text>
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
  field: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '600', color: '#555', marginBottom: 6 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 14, fontSize: 16, backgroundColor: '#f9f9f9' },
  row: { flexDirection: 'row', gap: 12 },
  typeRow: { flexDirection: 'row', gap: 8 },
  typeBtn: { flex: 1, padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#1F4E79', alignItems: 'center' },
  typeBtnActive: { backgroundColor: '#1F4E79' },
  typeText: { fontSize: 14, fontWeight: '600', color: '#1F4E79' },
  typeTextActive: { color: '#fff' },
  footer: { flexDirection: 'row', padding: 24, gap: 12, backgroundColor: '#fff', borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#eee' },
  skipBtn: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 16 },
  skipText: { color: '#666', fontSize: 15 },
  nextBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#1F4E79', borderRadius: 8, padding: 16 },
  nextText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
