import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getTaxCalculation, getVehicles } from '../lib/api';

export default function TaxComparisonScreen() {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [vehicleId, setVehicleId] = useState<string | null>(null);
  const [showPicker, setShowPicker] = useState(false);
  const [comparison, setComparison] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getVehicles().then((v) => {
      setVehicles(v);
      if (v.length > 0) setVehicleId(v[0].id);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!vehicleId) return;
    setLoading(true);
    const period = '2025-03-01:2026-02-28';
    getTaxCalculation(vehicleId, period)
      .then(setComparison)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [vehicleId]);

  const selected = vehicles.find((v) => v.id === vehicleId);
  const ac = comparison?.actual_cost;
  const dc = comparison?.deemed_cost;
  const rec = comparison?.recommended_method;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scroll}>
      <Text style={styles.title}>Tax Method Comparison</Text>
      <Text style={styles.subtitle}>2025/2026 Tax Year</Text>

      {/* Vehicle picker */}
      <View style={styles.field}>
        <Text style={styles.label}>Vehicle</Text>
        <Pressable style={styles.picker} onPress={() => setShowPicker(!showPicker)}>
          <Text style={styles.pickerText}>
            {selected ? `${selected.make} ${selected.model}` : 'Select vehicle'}
          </Text>
          <Ionicons name="chevron-down" size={20} color="#666" />
        </Pressable>
        {showPicker && vehicles.map((v) => (
          <Pressable key={v.id} style={[styles.dropdownItem, v.id === vehicleId && styles.dropdownActive]}
            onPress={() => { setVehicleId(v.id); setShowPicker(false); }}>
            <Text style={styles.dropdownText}>{v.make} {v.model} ({v.year})</Text>
          </Pressable>
        ))}
      </View>

      {loading && <ActivityIndicator size="large" color="#1F4E79" style={{ marginTop: 40 }} />}

      {comparison && !loading && (
        <>
          {/* Recommendation badge */}
          <View style={styles.recBadge}>
            <Ionicons name="trophy" size={20} color="#065F46" />
            <Text style={styles.recText}>
              {rec === 'actual_cost' ? 'Actual Cost' : 'Deemed Cost'} method saves you R {comparison.difference?.toLocaleString()} more
            </Text>
          </View>

          {/* Side by side */}
          <View style={styles.columns}>
            {/* Actual Cost */}
            <View style={[styles.methodCard, rec === 'actual_cost' && styles.methodCardWinner]}>
              {rec === 'actual_cost' && <View style={styles.winnerBadge}><Text style={styles.winnerText}>BEST</Text></View>}
              <Text style={styles.methodTitle}>Actual Cost</Text>
              <Text style={styles.methodTotal}>R {ac?.total_deduction?.toLocaleString()}</Text>
              <View style={styles.methodDetail}>
                <Text style={styles.detailLabel}>Total expenses</Text>
                <Text style={styles.detailValue}>R {ac?.total_expenses?.toLocaleString()}</Text>
              </View>
              <View style={styles.methodDetail}>
                <Text style={styles.detailLabel}>Business use</Text>
                <Text style={styles.detailValue}>{ac?.business_use_pct}%</Text>
              </View>
              <View style={styles.methodDetail}>
                <Text style={styles.detailLabel}>VAT credits</Text>
                <Text style={styles.detailValue}>R {ac?.vat_input_credits?.toLocaleString()}</Text>
              </View>
            </View>

            {/* Deemed Cost */}
            <View style={[styles.methodCard, rec === 'deemed_cost' && styles.methodCardWinner]}>
              {rec === 'deemed_cost' && <View style={styles.winnerBadge}><Text style={styles.winnerText}>BEST</Text></View>}
              <Text style={styles.methodTitle}>Deemed Cost</Text>
              <Text style={styles.methodTotal}>R {dc?.total_deduction?.toLocaleString()}</Text>
              <View style={styles.methodDetail}>
                <Text style={styles.detailLabel}>Fixed cost</Text>
                <Text style={styles.detailValue}>R {dc?.fixed_cost?.toLocaleString()}</Text>
              </View>
              <View style={styles.methodDetail}>
                <Text style={styles.detailLabel}>Fuel</Text>
                <Text style={styles.detailValue}>R {dc?.fuel_cost?.toLocaleString()}</Text>
              </View>
              <View style={styles.methodDetail}>
                <Text style={styles.detailLabel}>Maintenance</Text>
                <Text style={styles.detailValue}>R {dc?.maintenance_cost?.toLocaleString()}</Text>
              </View>
              <View style={styles.methodDetail}>
                <Text style={styles.detailLabel}>Tolls & parking</Text>
                <Text style={styles.detailValue}>R {dc?.additional_tolls_parking?.toLocaleString()}</Text>
              </View>
            </View>
          </View>

          {/* Category breakdown */}
          {ac?.by_category?.length > 0 && (
            <View style={styles.breakdownCard}>
              <Text style={styles.breakdownTitle}>Actual Cost Breakdown</Text>
              {ac.by_category.map((cat: any, i: number) => (
                <View key={i} style={styles.breakdownRow}>
                  <Text style={styles.breakdownCat}>{cat.category}</Text>
                  <Text style={styles.breakdownAmt}>R {cat.total?.toLocaleString()}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Tooltips */}
          <View style={styles.tipCard}>
            <Ionicons name="information-circle" size={20} color="#1F4E79" />
            <Text style={styles.tipText}>
              <Text style={{ fontWeight: '600' }}>Actual Cost:</Text> Claim your real expenses apportioned by business-use from your logbook.{'\n\n'}
              <Text style={{ fontWeight: '600' }}>Deemed Cost:</Text> SARS calculates a fixed allowance based on your vehicle's purchase price and km driven. Tolls and parking can be claimed additionally.
            </Text>
          </View>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  scroll: { padding: 16, paddingBottom: 40 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#1F4E79' },
  subtitle: { fontSize: 14, color: '#666', marginTop: 4, marginBottom: 16 },
  field: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '600', color: '#555', marginBottom: 6 },
  picker: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, backgroundColor: '#fff' },
  pickerText: { fontSize: 16, color: '#333' },
  dropdownItem: { padding: 12, backgroundColor: '#fff', borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#eee' },
  dropdownActive: { backgroundColor: '#E8F0F8' },
  dropdownText: { fontSize: 15, color: '#333' },
  recBadge: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#D1FAE5', borderRadius: 8, padding: 14, marginBottom: 16 },
  recText: { fontSize: 14, fontWeight: '600', color: '#065F46', flex: 1 },
  columns: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  methodCard: { flex: 1, backgroundColor: '#fff', borderRadius: 12, padding: 16, borderWidth: 2, borderColor: 'transparent' },
  methodCardWinner: { borderColor: '#10B981' },
  winnerBadge: { position: 'absolute', top: -1, right: 12, backgroundColor: '#10B981', borderBottomLeftRadius: 6, borderBottomRightRadius: 6, paddingHorizontal: 8, paddingVertical: 2 },
  winnerText: { fontSize: 10, fontWeight: 'bold', color: '#fff' },
  methodTitle: { fontSize: 14, fontWeight: '600', color: '#555', marginBottom: 4 },
  methodTotal: { fontSize: 22, fontWeight: 'bold', color: '#1F4E79', marginBottom: 12 },
  methodDetail: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  detailLabel: { fontSize: 12, color: '#666' },
  detailValue: { fontSize: 12, fontWeight: '600', color: '#333' },
  breakdownCard: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 16 },
  breakdownTitle: { fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 10 },
  breakdownRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#eee' },
  breakdownCat: { fontSize: 14, color: '#333', textTransform: 'capitalize' },
  breakdownAmt: { fontSize: 14, fontWeight: '600', color: '#1F4E79' },
  tipCard: { flexDirection: 'row', gap: 10, backgroundColor: '#E8F0F8', borderRadius: 12, padding: 16 },
  tipText: { flex: 1, fontSize: 13, color: '#555', lineHeight: 18 },
});
