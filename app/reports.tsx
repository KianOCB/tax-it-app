import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Linking,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { generateReport, getReportDownloadUrl, getReports, getVehicles } from '../lib/api';

const REPORT_TYPES = [
  { key: 'vat201', label: 'VAT201 Return', icon: 'document-text' },
  { key: 'itr12-summary', label: 'ITR12 Summary', icon: 'calculator' },
  { key: 'expense-report', label: 'Expense Report', icon: 'receipt' },
];

export default function ReportsScreen() {
  const [reportType, setReportType] = useState('vat201');
  const [periodStart, setPeriodStart] = useState('');
  const [periodEnd, setPeriodEnd] = useState('');
  const [year, setYear] = useState('2026');
  const [vehicleId, setVehicleId] = useState<string | null>(null);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    getVehicles().then((v) => {
      setVehicles(v);
      if (v.length > 0) setVehicleId(v[0].id);
    }).catch(() => {});
    getReports().then(setReports).catch(() => {});
  }, []);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const params: Record<string, unknown> = {};
      if (reportType === 'vat201') {
        params.period_start = periodStart;
        params.period_end = periodEnd;
      } else if (reportType === 'itr12-summary') {
        params.tax_year = parseInt(year);
      } else {
        params.period_start = periodStart;
        params.period_end = periodEnd;
        if (vehicleId) params.vehicle_id = vehicleId;
      }

      await generateReport(reportType, params);
      Alert.alert('Success', 'Report generated successfully');
      getReports().then(setReports).catch(() => {});
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = (reportId: string) => {
    const url = getReportDownloadUrl(reportId);
    Linking.openURL(url);
  };

  const selected = REPORT_TYPES.find((r) => r.key === reportType);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Reports</Text>
      </View>

      {/* Report type selector */}
      <View style={styles.typeRow}>
        {REPORT_TYPES.map((t) => (
          <Pressable
            key={t.key}
            style={[styles.typeBtn, reportType === t.key && styles.typeBtnActive]}
            onPress={() => setReportType(t.key)}
          >
            <Ionicons name={t.icon as any} size={20} color={reportType === t.key ? '#fff' : '#1F4E79'} />
            <Text style={[styles.typeText, reportType === t.key && styles.typeTextActive]}>{t.label}</Text>
          </Pressable>
        ))}
      </View>

      {/* Period inputs */}
      <View style={styles.formCard}>
        {reportType === 'itr12-summary' ? (
          <View style={styles.field}>
            <Text style={styles.label}>Tax Year</Text>
            <View style={styles.yearRow}>
              {['2025', '2026'].map((y) => (
                <Pressable key={y} style={[styles.yearBtn, year === y && styles.yearBtnActive]} onPress={() => setYear(y)}>
                  <Text style={[styles.yearText, year === y && styles.yearTextActive]}>{y}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        ) : (
          <View style={styles.row}>
            <View style={[styles.field, { flex: 1 }]}>
              <Text style={styles.label}>From</Text>
              <View style={styles.inputLike}>
                <Text style={periodStart ? styles.inputText : styles.placeholderText}>
                  {periodStart || 'YYYY-MM-DD'}
                </Text>
              </View>
            </View>
            <View style={[styles.field, { flex: 1 }]}>
              <Text style={styles.label}>To</Text>
              <View style={styles.inputLike}>
                <Text style={periodEnd ? styles.inputText : styles.placeholderText}>
                  {periodEnd || 'YYYY-MM-DD'}
                </Text>
              </View>
            </View>
          </View>
        )}

        <Pressable
          style={[styles.generateBtn, generating && { opacity: 0.6 }]}
          onPress={handleGenerate}
          disabled={generating}
        >
          {generating ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Ionicons name="document" size={20} color="#fff" />
          )}
          <Text style={styles.generateText}>{generating ? 'Generating...' : 'Generate Report'}</Text>
        </Pressable>
      </View>

      {/* Past reports */}
      <Text style={styles.sectionTitle}>Generated Reports</Text>
      <FlatList
        data={reports}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.reportRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.reportType}>{item.type?.replace('-', ' ').replace('_', ' ')}</Text>
              <Text style={styles.reportDate}>{item.created_at?.slice(0, 10)}</Text>
            </View>
            <Pressable style={styles.downloadBtn} onPress={() => handleDownload(item.id)}>
              <Ionicons name="download" size={18} color="#1F4E79" />
            </Pressable>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No reports generated yet</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { padding: 16, paddingBottom: 8 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#1F4E79' },
  typeRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, marginBottom: 16 },
  typeBtn: { flex: 1, alignItems: 'center', padding: 12, borderRadius: 10, borderWidth: 1, borderColor: '#1F4E79', gap: 4 },
  typeBtnActive: { backgroundColor: '#1F4E79' },
  typeText: { fontSize: 11, fontWeight: '600', color: '#1F4E79', textAlign: 'center' },
  typeTextActive: { color: '#fff' },
  formCard: { backgroundColor: '#fff', marginHorizontal: 16, borderRadius: 12, padding: 16, marginBottom: 16 },
  field: { marginBottom: 12 },
  label: { fontSize: 13, fontWeight: '600', color: '#555', marginBottom: 6 },
  row: { flexDirection: 'row', gap: 12 },
  inputLike: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, backgroundColor: '#f9f9f9' },
  inputText: { fontSize: 16, color: '#333' },
  placeholderText: { fontSize: 16, color: '#999' },
  yearRow: { flexDirection: 'row', gap: 12 },
  yearBtn: { flex: 1, padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#1F4E79', alignItems: 'center' },
  yearBtnActive: { backgroundColor: '#1F4E79' },
  yearText: { fontSize: 16, fontWeight: '600', color: '#1F4E79' },
  yearTextActive: { color: '#fff' },
  generateBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#1F4E79', borderRadius: 8, padding: 14, marginTop: 4 },
  generateText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#333', paddingHorizontal: 16, marginBottom: 8 },
  list: { paddingHorizontal: 16 },
  reportRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 8, padding: 14, marginBottom: 8 },
  reportType: { fontSize: 15, fontWeight: '500', color: '#333', textTransform: 'capitalize' },
  reportDate: { fontSize: 12, color: '#666', marginTop: 2 },
  downloadBtn: { padding: 8 },
  empty: { alignItems: 'center', paddingVertical: 24 },
  emptyText: { fontSize: 14, color: '#999' },
});
