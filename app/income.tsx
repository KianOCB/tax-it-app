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
import { addIncome, getIncomeSummary } from '../lib/api';

const PLATFORMS = ['Uber', 'Bolt', 'InDriver', 'Mr D', 'Bolt Food', 'Other'];

export default function IncomeScreen() {
  const router = useRouter();
  const [summary, setSummary] = useState<any>(null);
  const [platform, setPlatform] = useState('Uber');
  const [showPlatformPicker, setShowPlatformPicker] = useState(false);
  const [periodStart, setPeriodStart] = useState('');
  const [periodEnd, setPeriodEnd] = useState('');
  const [grossEarnings, setGrossEarnings] = useState('');
  const [commission, setCommission] = useState('');
  const [commissionVat, setCommissionVat] = useState('');
  const [incentives, setIncentives] = useState('');
  const [tips, setTips] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getIncomeSummary().then(setSummary).catch(() => {});
  }, []);

  const netPayout = (() => {
    const g = parseFloat(grossEarnings) || 0;
    const c = parseFloat(commission) || 0;
    const i = parseFloat(incentives) || 0;
    const t = parseFloat(tips) || 0;
    return (g - c + i + t).toFixed(2);
  })();

  const handleSave = async () => {
    if (!grossEarnings) {
      Alert.alert('Error', 'Please enter gross earnings');
      return;
    }
    setSaving(true);
    try {
      await addIncome({
        platform,
        period_start: periodStart || null,
        period_end: periodEnd || null,
        gross_earnings: parseFloat(grossEarnings),
        platform_commission: parseFloat(commission) || 0,
        platform_vat_on_commission: parseFloat(commissionVat) || 0,
        incentives: parseFloat(incentives) || 0,
        tips: parseFloat(tips) || 0,
        net_payout: parseFloat(netPayout),
        source: 'manual_entry',
      });
      Alert.alert('Saved', 'Income record added', [
        { text: 'Add Another', onPress: () => { setGrossEarnings(''); setCommission(''); setCommissionVat(''); setIncentives(''); setTips(''); } },
        { text: 'View History', onPress: () => router.push('/income-history') },
      ]);
      getIncomeSummary().then(setSummary).catch(() => {});
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Monthly summary */}
        {summary && (
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>This Month</Text>
            <View style={styles.summaryRow}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryValue}>R {(summary.total_gross ?? 0).toLocaleString()}</Text>
                <Text style={styles.summaryLabel}>Gross</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryValue, { color: '#EF4444' }]}>R {(summary.total_commission ?? 0).toLocaleString()}</Text>
                <Text style={styles.summaryLabel}>Commission</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryValue, { color: '#10B981' }]}>R {(summary.total_net ?? 0).toLocaleString()}</Text>
                <Text style={styles.summaryLabel}>Net</Text>
              </View>
            </View>
          </View>
        )}

        <Text style={styles.title}>Add Income</Text>

        {/* Platform picker */}
        <View style={styles.field}>
          <Text style={styles.label}>Platform</Text>
          <Pressable style={styles.picker} onPress={() => setShowPlatformPicker(!showPlatformPicker)}>
            <Text style={styles.pickerText}>{platform}</Text>
            <Ionicons name="chevron-down" size={20} color="#666" />
          </Pressable>
          {showPlatformPicker && (
            <View style={styles.dropdown}>
              {PLATFORMS.map((p) => (
                <Pressable
                  key={p}
                  style={[styles.dropdownItem, p === platform && styles.dropdownActive]}
                  onPress={() => { setPlatform(p); setShowPlatformPicker(false); }}
                >
                  <Text style={styles.dropdownText}>{p}</Text>
                </Pressable>
              ))}
            </View>
          )}
        </View>

        {/* Period */}
        <View style={styles.row}>
          <View style={[styles.field, { flex: 1 }]}>
            <Text style={styles.label}>Period Start</Text>
            <TextInput style={styles.input} value={periodStart} onChangeText={setPeriodStart} placeholder="YYYY-MM-DD" placeholderTextColor="#999" />
          </View>
          <View style={[styles.field, { flex: 1 }]}>
            <Text style={styles.label}>Period End</Text>
            <TextInput style={styles.input} value={periodEnd} onChangeText={setPeriodEnd} placeholder="YYYY-MM-DD" placeholderTextColor="#999" />
          </View>
        </View>

        {/* Amounts */}
        <View style={styles.field}>
          <Text style={styles.label}>Gross Earnings (R)</Text>
          <TextInput style={styles.input} value={grossEarnings} onChangeText={setGrossEarnings} keyboardType="decimal-pad" placeholder="0.00" placeholderTextColor="#999" />
        </View>

        <View style={styles.row}>
          <View style={[styles.field, { flex: 1 }]}>
            <Text style={styles.label}>Commission (R)</Text>
            <TextInput style={styles.input} value={commission} onChangeText={setCommission} keyboardType="decimal-pad" placeholder="0.00" placeholderTextColor="#999" />
          </View>
          <View style={[styles.field, { flex: 1 }]}>
            <Text style={styles.label}>VAT on Commission</Text>
            <TextInput style={styles.input} value={commissionVat} onChangeText={setCommissionVat} keyboardType="decimal-pad" placeholder="0.00" placeholderTextColor="#999" />
          </View>
        </View>

        <View style={styles.row}>
          <View style={[styles.field, { flex: 1 }]}>
            <Text style={styles.label}>Incentives (R)</Text>
            <TextInput style={styles.input} value={incentives} onChangeText={setIncentives} keyboardType="decimal-pad" placeholder="0.00" placeholderTextColor="#999" />
          </View>
          <View style={[styles.field, { flex: 1 }]}>
            <Text style={styles.label}>Tips (R)</Text>
            <TextInput style={styles.input} value={tips} onChangeText={setTips} keyboardType="decimal-pad" placeholder="0.00" placeholderTextColor="#999" />
          </View>
        </View>

        {/* Net payout */}
        <View style={styles.netCard}>
          <Text style={styles.netLabel}>Net Payout</Text>
          <Text style={styles.netValue}>R {netPayout}</Text>
        </View>

        <Pressable style={[styles.primaryBtn, saving && { opacity: 0.6 }]} onPress={handleSave} disabled={saving}>
          <Text style={styles.primaryBtnText}>{saving ? 'Saving...' : 'Save Income'}</Text>
        </Pressable>

        <Pressable style={styles.linkBtn} onPress={() => router.push('/income-history')}>
          <Ionicons name="list" size={18} color="#1F4E79" />
          <Text style={styles.linkBtnText}>View Income History</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  scroll: { padding: 16, paddingBottom: 40 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#1F4E79', marginBottom: 20 },
  summaryCard: { backgroundColor: '#fff', borderRadius: 12, padding: 20, marginBottom: 20, elevation: 2, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 3, shadowOffset: { width: 0, height: 1 } },
  summaryTitle: { fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 12 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-around' },
  summaryItem: { alignItems: 'center' },
  summaryValue: { fontSize: 18, fontWeight: 'bold', color: '#1F4E79' },
  summaryLabel: { fontSize: 12, color: '#666', marginTop: 2 },
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
  netCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#D1FAE5', borderRadius: 8, padding: 16, marginBottom: 16 },
  netLabel: { fontSize: 16, fontWeight: '600', color: '#065F46' },
  netValue: { fontSize: 22, fontWeight: 'bold', color: '#065F46' },
  primaryBtn: { backgroundColor: '#1F4E79', borderRadius: 8, padding: 16, alignItems: 'center', marginTop: 8 },
  primaryBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  linkBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 16 },
  linkBtnText: { fontSize: 15, color: '#1F4E79', fontWeight: '500' },
});
