import { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { addVehicle, deleteVehicle, getVehicles, updateVehicle } from '../lib/api';

const VEHICLE_TYPES = ['car', 'motorcycle', 'van', 'truck'];

export default function VehiclesScreen() {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('');
  const [vehicleType, setVehicleType] = useState('car');
  const [regNumber, setRegNumber] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [purchaseDate, setPurchaseDate] = useState('');
  const [businessUse, setBusinessUse] = useState('80');
  const [saving, setSaving] = useState(false);

  const load = () => {
    getVehicles().then(setVehicles).catch(() => {});
  };

  useEffect(() => { load(); }, []);

  const resetForm = () => {
    setMake(''); setModel(''); setYear(''); setVehicleType('car');
    setRegNumber(''); setPurchasePrice(''); setPurchaseDate(''); setBusinessUse('80');
    setEditingId(null); setShowForm(false);
  };

  const startEdit = (v: any) => {
    setMake(v.make || ''); setModel(v.model || ''); setYear(String(v.year || ''));
    setVehicleType(v.vehicle_type || 'car'); setRegNumber(v.registration_number || '');
    setPurchasePrice(String(v.purchase_price || '')); setPurchaseDate(v.purchase_date || '');
    setBusinessUse(String(v.business_use_percentage || '80'));
    setEditingId(v.id); setShowForm(true);
  };

  const handleSave = async () => {
    if (!make || !model || !year) {
      Alert.alert('Error', 'Make, model, and year are required');
      return;
    }
    setSaving(true);
    try {
      const data = {
        make, model, year: parseInt(year), vehicle_type: vehicleType,
        registration_number: regNumber || null,
        purchase_price: purchasePrice ? parseFloat(purchasePrice) : null,
        purchase_date: purchaseDate || null,
        business_use_percentage: parseFloat(businessUse) || 80,
      };
      if (editingId) {
        await updateVehicle(editingId, data);
      } else {
        await addVehicle(data);
      }
      resetForm();
      load();
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert('Delete Vehicle', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => { await deleteVehicle(id); load(); },
      },
    ]);
  };

  if (showForm) {
    return (
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <Text style={styles.title}>{editingId ? 'Edit Vehicle' : 'Add Vehicle'}</Text>

          <View style={styles.row}>
            <View style={[styles.field, { flex: 1 }]}>
              <Text style={styles.label}>Make</Text>
              <TextInput style={styles.input} value={make} onChangeText={setMake} placeholder="e.g. Toyota" placeholderTextColor="#999" />
            </View>
            <View style={[styles.field, { flex: 1 }]}>
              <Text style={styles.label}>Model</Text>
              <TextInput style={styles.input} value={model} onChangeText={setModel} placeholder="e.g. Corolla" placeholderTextColor="#999" />
            </View>
          </View>

          <View style={styles.row}>
            <View style={[styles.field, { flex: 1 }]}>
              <Text style={styles.label}>Year</Text>
              <TextInput style={styles.input} value={year} onChangeText={setYear} keyboardType="numeric" placeholder="2022" placeholderTextColor="#999" />
            </View>
            <View style={[styles.field, { flex: 1 }]}>
              <Text style={styles.label}>Registration</Text>
              <TextInput style={styles.input} value={regNumber} onChangeText={setRegNumber} placeholder="CA 123-456" autoCapitalize="characters" placeholderTextColor="#999" />
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Vehicle Type</Text>
            <View style={styles.typeRow}>
              {VEHICLE_TYPES.map((t) => (
                <Pressable
                  key={t}
                  style={[styles.typeBtn, vehicleType === t && styles.typeBtnActive]}
                  onPress={() => setVehicleType(t)}
                >
                  <Text style={[styles.typeText, vehicleType === t && styles.typeTextActive]}>
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          <View style={styles.row}>
            <View style={[styles.field, { flex: 1 }]}>
              <Text style={styles.label}>Purchase Price (R)</Text>
              <TextInput style={styles.input} value={purchasePrice} onChangeText={setPurchasePrice} keyboardType="decimal-pad" placeholder="250000" placeholderTextColor="#999" />
            </View>
            <View style={[styles.field, { flex: 1 }]}>
              <Text style={styles.label}>Purchase Date</Text>
              <TextInput style={styles.input} value={purchaseDate} onChangeText={setPurchaseDate} placeholder="YYYY-MM-DD" placeholderTextColor="#999" />
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Business Use %</Text>
            <TextInput style={styles.input} value={businessUse} onChangeText={setBusinessUse} keyboardType="numeric" placeholder="80" placeholderTextColor="#999" />
          </View>

          <View style={styles.formActions}>
            <Pressable style={styles.secondaryBtn} onPress={resetForm}>
              <Text style={styles.secondaryBtnText}>Cancel</Text>
            </Pressable>
            <Pressable style={[styles.primaryBtn, saving && { opacity: 0.6 }]} onPress={handleSave} disabled={saving}>
              <Text style={styles.primaryBtnText}>{saving ? 'Saving...' : 'Save Vehicle'}</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={vehicles}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.title}>My Vehicles</Text>
            <Pressable style={styles.addBtn} onPress={() => setShowForm(true)}>
              <Ionicons name="add" size={20} color="#fff" />
              <Text style={styles.addBtnText}>Add</Text>
            </Pressable>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.vehicleCard}>
            <View style={styles.vehicleInfo}>
              <Ionicons name="car-sport" size={28} color="#1F4E79" />
              <View style={{ marginLeft: 12, flex: 1 }}>
                <Text style={styles.vehicleName}>{item.make} {item.model}</Text>
                <Text style={styles.vehicleDetail}>
                  {item.year} · {item.vehicle_type} · {item.registration_number || 'No reg'}
                </Text>
                <Text style={styles.vehicleDetail}>
                  Business use: {item.business_use_percentage ?? 80}%
                  {item.purchase_price ? ` · R${Number(item.purchase_price).toLocaleString()}` : ''}
                </Text>
              </View>
            </View>
            <View style={styles.vehicleActions}>
              <Pressable onPress={() => startEdit(item)} style={styles.iconBtn}>
                <Ionicons name="pencil" size={18} color="#1F4E79" />
              </Pressable>
              <Pressable onPress={() => handleDelete(item.id)} style={styles.iconBtn}>
                <Ionicons name="trash" size={18} color="#EF4444" />
              </Pressable>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="car-outline" size={64} color="#ccc" />
            <Text style={styles.emptyTitle}>No vehicles yet</Text>
            <Text style={styles.emptyText}>Add a vehicle to start logging trips.</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  scroll: { padding: 16, paddingBottom: 40 },
  list: { padding: 12 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#1F4E79' },
  field: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '600', color: '#555', marginBottom: 6 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, fontSize: 16, backgroundColor: '#fff' },
  row: { flexDirection: 'row', gap: 12 },
  typeRow: { flexDirection: 'row', gap: 8 },
  typeBtn: { flex: 1, padding: 10, borderRadius: 8, borderWidth: 1, borderColor: '#1F4E79', alignItems: 'center' },
  typeBtnActive: { backgroundColor: '#1F4E79' },
  typeText: { fontSize: 13, fontWeight: '600', color: '#1F4E79' },
  typeTextActive: { color: '#fff' },
  formActions: { flexDirection: 'row', gap: 12, marginTop: 8 },
  primaryBtn: { flex: 1, backgroundColor: '#1F4E79', borderRadius: 8, padding: 16, alignItems: 'center' },
  primaryBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  secondaryBtn: { flex: 1, backgroundColor: '#f0f0f0', borderRadius: 8, padding: 16, alignItems: 'center' },
  secondaryBtnText: { color: '#1F4E79', fontSize: 16, fontWeight: '600' },
  addBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#1F4E79', borderRadius: 8, paddingVertical: 8, paddingHorizontal: 14 },
  addBtnText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  vehicleCard: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  vehicleInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  vehicleName: { fontSize: 16, fontWeight: '600', color: '#333' },
  vehicleDetail: { fontSize: 13, color: '#666', marginTop: 2 },
  vehicleActions: { flexDirection: 'row', gap: 8 },
  iconBtn: { padding: 8 },
  empty: { alignItems: 'center', paddingVertical: 60 },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: '#666', marginTop: 16 },
  emptyText: { fontSize: 14, color: '#999', marginTop: 4 },
});
