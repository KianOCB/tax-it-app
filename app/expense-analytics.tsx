import { useEffect, useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, View } from 'react-native';
import { BarChart, PieChart } from 'react-native-chart-kit';
import { api } from '../lib/api';

const screenWidth = Dimensions.get('window').width - 32;

const COLORS = ['#1F4E79', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#6B7280'];

const chartConfig = {
  backgroundGradientFrom: '#fff',
  backgroundGradientTo: '#fff',
  color: (opacity = 1) => `rgba(31, 78, 121, ${opacity})`,
  labelColor: () => '#666',
  barPercentage: 0.6,
  decimalPlaces: 0,
  propsForLabels: { fontSize: 11 },
};

export default function ExpenseAnalyticsScreen() {
  const [summary, setSummary] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    api.get<any>('/api/expenses/summary').then(setSummary).catch(() => {});
    api.get<any>('/api/receipts/stats').then(setStats).catch(() => {});
  }, []);

  const categories = summary?.categories || [];
  const topCategories = stats?.top_categories || [];

  // Pie chart data
  const pieData = categories.slice(0, 6).map((cat: any, i: number) => ({
    name: (cat.category || 'Other').slice(0, 12),
    amount: Math.round(cat.total || 0),
    color: COLORS[i % COLORS.length],
    legendFontColor: '#666',
    legendFontSize: 12,
  }));

  // Bar chart: category totals
  const barData = {
    labels: topCategories.slice(0, 5).map((c: any) => (c.category || '?').slice(0, 8)),
    datasets: [{ data: topCategories.slice(0, 5).map((c: any) => c.total || 0) }],
  };

  // MoM comparison
  const momData = categories.length > 0
    ? {
        labels: categories.slice(0, 5).map((c: any) => (c.category || '?').slice(0, 8)),
        datasets: [
          { data: categories.slice(0, 5).map((c: any) => c.total || 0) },
          { data: categories.slice(0, 5).map((c: any) => c.previous_month_total || 0) },
        ],
      }
    : null;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scroll}>
      <Text style={styles.title}>Expense Analytics</Text>

      {/* Category pie chart */}
      {pieData.length > 0 && (
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Spending by Category</Text>
          <PieChart
            data={pieData}
            width={screenWidth}
            height={200}
            chartConfig={chartConfig}
            accessor="amount"
            backgroundColor="transparent"
            paddingLeft="0"
          />
        </View>
      )}

      {/* Top categories bar chart */}
      {barData.labels.length > 0 && (
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Top Categories (This Month)</Text>
          <BarChart
            data={barData}
            width={screenWidth}
            height={220}
            chartConfig={chartConfig}
            yAxisLabel="R "
            yAxisSuffix=""
            fromZero
            style={styles.chart}
          />
        </View>
      )}

      {/* Month-over-month */}
      {momData && momData.labels.length > 0 && (
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Month-over-Month Comparison</Text>
          <View style={styles.legendRow}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#1F4E79' }]} />
              <Text style={styles.legendText}>This Month</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#93C5FD' }]} />
              <Text style={styles.legendText}>Last Month</Text>
            </View>
          </View>
          <BarChart
            data={{
              labels: momData.labels,
              datasets: [{ data: momData.datasets[0].data }],
            }}
            width={screenWidth}
            height={220}
            chartConfig={chartConfig}
            yAxisLabel="R "
            yAxisSuffix=""
            fromZero
            style={styles.chart}
          />
        </View>
      )}

      {/* VAT split */}
      {stats && (
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>VAT Summary</Text>
          <View style={styles.vatRow}>
            <View style={styles.vatItem}>
              <Text style={styles.vatValue}>R {(stats.total_spent_this_month ?? 0).toLocaleString()}</Text>
              <Text style={styles.vatLabel}>Total Spent</Text>
            </View>
            <View style={styles.vatItem}>
              <Text style={[styles.vatValue, { color: '#10B981' }]}>R {(stats.total_vat_claimable ?? 0).toLocaleString()}</Text>
              <Text style={styles.vatLabel}>VAT Claimable</Text>
            </View>
            <View style={styles.vatItem}>
              <Text style={[styles.vatValue, { color: '#EF4444' }]}>R {((stats.total_spent_this_month ?? 0) - (stats.total_vat_claimable ?? 0)).toLocaleString()}</Text>
              <Text style={styles.vatLabel}>Non-claimable</Text>
            </View>
          </View>
        </View>
      )}

      {/* Empty state */}
      {!summary && !stats && (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>Scan some receipts to see your analytics here.</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  scroll: { padding: 16, paddingBottom: 40 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#1F4E79', marginBottom: 16 },
  chartCard: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 16, overflow: 'hidden' },
  chartTitle: { fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 12 },
  chart: { borderRadius: 8 },
  legendRow: { flexDirection: 'row', gap: 16, marginBottom: 8 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { fontSize: 12, color: '#666' },
  vatRow: { flexDirection: 'row', justifyContent: 'space-around' },
  vatItem: { alignItems: 'center' },
  vatValue: { fontSize: 18, fontWeight: 'bold', color: '#1F4E79' },
  vatLabel: { fontSize: 12, color: '#666', marginTop: 4 },
  empty: { alignItems: 'center', paddingVertical: 40 },
  emptyText: { fontSize: 14, color: '#999' },
});
