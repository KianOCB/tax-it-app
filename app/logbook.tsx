import { useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { addLogbookEntry, getLogbookEntries, getVehicles } from '../lib/api';

export default function LogbookScreen() {
  const router = useRouter();
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [vehicleId, setVehicleId] = useState<string | null>(null);
  const [showVehiclePicker, setShowVehiclePicker] = useState(false);
  const [startOdo, setStartOdo] = useState('');
  const [endOdo, setEndOdo] = useState('');
  const [tripDate, setTripDate] = useState(new Date().toISOString().slice(0, 10));
  const [tripType, setTripType] = useState<'business' | 'private'>('business');
  const [purpose, setPurpose] = useState('');
  const [saving, setSaving] = useState(false);
  const [lastEndOdo, setLastEndOdo] = useState<number | null>(null);

  useEffect(() => {
    getVehicles()
      .then((v) => {
        setVehicles(v);
        if (v.length > 0) setVehicleId(v[0].id);
      })
      .catch(() => {});

    getLogbookEntries()
      .then((entries) => {
        if (entries.length > 0) {
          setLastEndOdo(entries[0].end_odometer);
        }
      })
      .catch(() => {});
  }, []);

  const distance =
    startOdo && endOdo ? Math.max(0, parseFloat(endOdo) - parseFloat(startOdo)) : 0;

  const prefillFromLast = () => {
    if (lastEndOdo !== null) {
      setStartOdo(String(lastEndOdo));
    }
  };

  const handleSave = async () => {
    if (!vehicleId) {
      Alert.alert('Error', 'Please select a vehicle');
      return;
    }
    if (!startOdo || !endOdo) {
      Alert.alert('Error', 'Please enter odometer readings');
      return;
    }
    if (parseFloat(endOdo) <= parseFloat(startOdo)) {
      Alert.alert('Error', 'End odometer must be greater than start');
      return;
    }
    setSaving(true);
    try {
      await addLogbookEntry({
        vehicle_id: vehicleId,
        date: tripDate,
        start_odometer: parseFloat(startOdo),
        end_odometer: parseFloat(endOdo),
        trip_type: tripType,
        purpose,
      });
      Alert.alert('Saved', 'Trip logged successfully', [
        { text: 'Log Another', onPress: () => { setStartOdo(endOdo); setEndOdo(''); setPurpose(''); } },
        { text: 'View History', onPress: () => router.push('/logbook-history') },
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setSaving(false);
    }
  };

  const selectedVehicle = vehicles.find((v) => v.id === vehicleId);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>Log a Trip</Text>

        {/* Vehicle selector */}
        <View style={styles.field}>
          <Text style={styles.label}>Vehicle</Text>
          {vehicles.length === 0 ? (
            <Pressable style={styles.addVehicleBtn} onPress={() => router.push('/vehicles')}>
              <Ionicons name="add-circle" size={20} color="#1F4E79" />
              <Text style={styles.addVehicleText}>Add a vehicle first</Text>
            </Pressable>
          ) : (
            <Pressable style={styles.picker} onPress={() => setShowVehiclePicker(!showVehiclePicker)}>
              <Text style={styles.pickerText}>
                {selectedVehicle ? `${selectedVehicle.make} ${selectedVehicle.model}` : 'Select vehicle'}
              </Text>
              <Ionicons name="chevron-down" size={20} color="#666" />
            </Pressable>
          )}
          {showVehiclePicker && (
            <View style={styles.dropdown}>
              {vehicles.map((v) => (
                <Pressable
                  key={v.id}
                  style={[styles.dropdownItem, v.id === vehicleId && styles.dropdownActive]}
                  onPress={() => { setVehicleId(v.id); setShowVehiclePicker(false); }}
                >
                  <Text style={styles.dropdownText}>{v.make} {v.model} ({v.year})</Text>
                </Pressable>
              ))}
            </View>
          )}
        </View>

        {/* Date */}
        <View style={styles.field}>
          <Text style={styles.label}>Date</Text>
          <TextInput style={styles.input} value={tripDate} onChangeText={setTripDate} placeholder="YYYY-MM-DD" placeholderTextColor="#999" />
        </View>

        {/* Trip type toggle */}
        <View style={styles.field}>
          <Text style={styles.label}>Trip Type</Text>
          <View style={styles.toggleRow}>
            <Pressable
              style={[styles.toggleBtn, tripType === 'business' && styles.toggleActive]}
              onPress={() => setTripType('business')}
            >
              <Ionicons name="briefcase" size={18} color={tripType === 'business' ? '#fff' : '#1F4E79'} />
              <Text style={[styles.toggleText, tripType === 'business' && styles.toggleTextActive]}>Business</Text>
            </Pressable>
            <Pressable
              style={[styles.toggleBtn, tripType === 'private' && styles.toggleActive]}
              onPress={() => setTripType('private')}
            >
              <Ionicons name="car" size={18} color={tripType === 'private' ? '#fff' : '#1F4E79'} />
              <Text style={[styles.toggleText, tripType === 'private' && styles.toggleTextActive]}>Private</Text>
            </Pressable>
          </View>
        </View>

        {/* Odometer readings */}
        <View style={styles.row}>
          <View style={[styles.field, { flex: 1 }]}>
            <Text style={styles.label}>Start Odometer (km)</Text>
            <TextInput style={styles.input} value={startOdo} onChangeText={setStartOdo} keyboardType="numeric" placeholder="0" placeholderTextColor="#999" />
          </View>
          <View style={[styles.field, { flex: 1 }]}>
            <Text style={styles.label}>End Odometer (km)</Text>
            <TextInput style={styles.input} value={endOdo} onChangeText={setEndOdo} keyboardType="numeric" placeholder="0" placeholderTextColor="#999" />
          </View>
        </View>

        {lastEndOdo !== null && !startOdo && (
          <Pressable style={styles.quickFill} onPress={prefillFromLast}>
            <Ionicons name="flash" size={16} color="#1F4E79" />
            <Text style={styles.quickFillText}>Same as last trip ({lastEndOdo} km)</Text>
          </Pressable>
        )}

        {distance > 0 && (
          <View style={styles.distanceCard}>
            <Text style={styles.distanceLabel}>Distance</Text>
            <Text style={styles.distanceValue}>{distance.toFixed(1)} km</Text>
          </View>
        )}

        {/* Purpose */}
        <View style={styles.field}>
          <Text style={styles.label}>Purpose</Text>
          <TextInput
            style={[styles.input, { minHeight: 60 }]}
            value={purpose}
            onChangeText={setPurpose}
            placeholder="e.g. Uber trips Sandton area"
            placeholderTextColor="#999"
            multiline
          />
        </View>

        <Pressable
          style={[styles.primaryBtn, saving && { opacity: 0.6 }]}
          onPress={handleSave}
          disabled={saving}
        >
          <Text style={styles.primaryBtnText}>{saving ? 'Saving...' : 'Log Trip'}</Text>
        </Pressable>

        <Pressable style={styles.linkBtn} onPress={() => router.push('/logbook-history')}>
          <Ionicons name="list" size={18} color="#1F4E79" />
          <Text style={styles.linkBtnText}>View Trip History</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  scroll: { padding: 16, paddingBottom: 40 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#1F4E79', marginBottom: 20 },
  field: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '600', color: '#555', marginBottom: 6 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, fontSize: 16, backgroundColor: '#fff' },
  row: { flexDirection: 'row', gap: 12 },
  picker: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, backgroundColor: '#fff' },
  pickerText: { fontSize: 16, color: '#333' },
  dropdown: { marginTop: 4, borderWidth: 1, borderColor: '#ddd', borderRadius: 8, backgroundColor: '#fff' },
  dropdownItem: { padding: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#eee' },
  dropdownActive: { backgroundColor: '#E8F0F8' },
  dropdownText: { fontSize: 15, color: '#333' },
  toggleRow: { flexDirection: 'row', gap: 12 },
  toggleBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#1F4E79' },
  toggleActive: { backgroundColor: '#1F4E79' },
  toggleText: { fontSize: 15, fontWeight: '600', color: '#1F4E79' },
  toggleTextActive: { color: '#fff' },
  quickFill: { flexDirection: 'row', alignItems: 'center', gap: 6, padding: 10, backgroundColor: '#E8F0F8', borderRadius: 8, marginBottom: 16 },
  quickFillText: { fontSize: 13, color: '#1F4E79', fontWeight: '500' },
  distanceCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#E8F0F8', borderRadius: 8, padding: 14, marginBottom: 16 },
  distanceLabel: { fontSize: 14, color: '#555' },
  distanceValue: { fontSize: 20, fontWeight: 'bold', color: '#1F4E79' },
  primaryBtn: { backgroundColor: '#1F4E79', borderRadius: 8, padding: 16, alignItems: 'center', marginTop: 8 },
  primaryBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  addVehicleBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12, backgroundColor: '#E8F0F8', borderRadius: 8 },
  addVehicleText: { fontSize: 15, color: '#1F4E79', fontWeight: '500' },
  linkBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 16 },
  linkBtnText: { fontSize: 15, color: '#1F4E79', fontWeight: '500' },
});
