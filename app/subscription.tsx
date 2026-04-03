import { useEffect, useState } from 'react';
import { Alert, Linking, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { cancelSubscription, getCheckoutUrl, getSubscription } from '../lib/api';

const PLANS = [
  {
    key: 'free',
    name: 'Free',
    monthly: 0,
    annual: 0,
    features: ['5 scans/month', '1 vehicle', 'Basic summary'],
  },
  {
    key: 'pro',
    name: 'Pro',
    monthly: 99,
    annual: 899,
    savings: 289,
    features: ['Unlimited scans', 'VAT calculations', 'PDF reports', 'Deadline alerts', 'Unlimited vehicles', '5-year storage'],
  },
  {
    key: 'fleet',
    name: 'Fleet',
    monthly: 399,
    annual: 3599,
    savings: 1189,
    features: ['Up to 20 drivers', 'Bulk reports', 'API access', 'Priority support', 'All Pro features'],
  },
];

export default function SubscriptionScreen() {
  const [sub, setSub] = useState<any>(null);
  const [isAnnual, setIsAnnual] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);

  useEffect(() => {
    getSubscription().then(setSub).catch(() => {});
  }, []);

  const currentPlan = sub?.plan || 'free';
  const trialDaysLeft = sub?.trial_days_remaining ?? null;

  const handleUpgrade = async (planKey: string) => {
    setLoading(planKey);
    try {
      const { url } = await getCheckoutUrl(planKey);
      if (url) Linking.openURL(url);
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(null);
    }
  };

  const handleCancel = () => {
    Alert.alert('Cancel Subscription', 'Are you sure you want to cancel?', [
      { text: 'Keep', style: 'cancel' },
      {
        text: 'Cancel Subscription',
        style: 'destructive',
        onPress: async () => {
          try {
            await cancelSubscription();
            getSubscription().then(setSub).catch(() => {});
          } catch (error: any) {
            Alert.alert('Error', error.message);
          }
        },
      },
    ]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scroll}>
      {/* Trial banner */}
      {trialDaysLeft !== null && trialDaysLeft > 0 && (
        <View style={[styles.trialBanner, trialDaysLeft <= 7 ? styles.trialUrgent : trialDaysLeft <= 14 ? styles.trialWarning : {}]}>
          <Ionicons name="time" size={20} color={trialDaysLeft <= 7 ? '#DC2626' : trialDaysLeft <= 14 ? '#D97706' : '#065F46'} />
          <Text style={[styles.trialText, trialDaysLeft <= 7 ? { color: '#DC2626' } : trialDaysLeft <= 14 ? { color: '#D97706' } : {}]}>
            Pro Trial: {trialDaysLeft} day{trialDaysLeft === 1 ? '' : 's'} remaining
          </Text>
        </View>
      )}

      <Text style={styles.title}>Choose Your Plan</Text>

      {/* Billing toggle */}
      <View style={styles.toggleRow}>
        <Text style={[styles.toggleLabel, !isAnnual && styles.toggleLabelActive]}>Monthly</Text>
        <Switch
          value={isAnnual}
          onValueChange={setIsAnnual}
          trackColor={{ false: '#ddd', true: '#1F4E79' }}
          thumbColor="#fff"
        />
        <Text style={[styles.toggleLabel, isAnnual && styles.toggleLabelActive]}>Annual</Text>
        {isAnnual && <View style={styles.saveBadge}><Text style={styles.saveText}>Save up to 25%</Text></View>}
      </View>

      {/* Plan cards */}
      {PLANS.map((plan) => {
        const isCurrent = currentPlan === plan.key;
        const price = isAnnual ? plan.annual : plan.monthly;
        const period = isAnnual ? '/yr' : '/mo';

        return (
          <View key={plan.key} style={[styles.planCard, isCurrent && styles.planCardCurrent]}>
            {isCurrent && (
              <View style={styles.currentBadge}>
                <Text style={styles.currentText}>CURRENT</Text>
              </View>
            )}
            <Text style={styles.planName}>{plan.name}</Text>
            <View style={styles.priceRow}>
              <Text style={styles.planPrice}>R {price.toLocaleString()}</Text>
              {price > 0 && <Text style={styles.planPeriod}>{period}</Text>}
            </View>
            {isAnnual && plan.savings && (
              <Text style={styles.planSavings}>Save R {plan.savings.toLocaleString()}/yr</Text>
            )}

            <View style={styles.featureList}>
              {plan.features.map((f, i) => (
                <View key={i} style={styles.featureRow}>
                  <Ionicons name="checkmark" size={16} color="#10B981" />
                  <Text style={styles.featureText}>{f}</Text>
                </View>
              ))}
            </View>

            {!isCurrent && plan.key !== 'free' && (
              <Pressable
                style={[styles.upgradeBtn, loading === plan.key && { opacity: 0.6 }]}
                onPress={() => handleUpgrade(plan.key)}
                disabled={loading === plan.key}
              >
                <Text style={styles.upgradeBtnText}>
                  {loading === plan.key ? 'Loading...' : `Upgrade to ${plan.name}`}
                </Text>
              </Pressable>
            )}
            {isCurrent && currentPlan !== 'free' && (
              <Pressable style={styles.cancelBtn} onPress={handleCancel}>
                <Text style={styles.cancelBtnText}>Cancel Subscription</Text>
              </Pressable>
            )}
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  scroll: { padding: 16, paddingBottom: 40 },
  trialBanner: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#D1FAE5', borderRadius: 8, padding: 14, marginBottom: 16 },
  trialWarning: { backgroundColor: '#FEF3C7' },
  trialUrgent: { backgroundColor: '#FEE2E2' },
  trialText: { fontSize: 14, fontWeight: '600', color: '#065F46' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#1F4E79', marginBottom: 16 },
  toggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 20 },
  toggleLabel: { fontSize: 15, color: '#999' },
  toggleLabelActive: { color: '#1F4E79', fontWeight: '600' },
  saveBadge: { backgroundColor: '#D1FAE5', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 },
  saveText: { fontSize: 12, fontWeight: '600', color: '#065F46' },
  planCard: { backgroundColor: '#fff', borderRadius: 16, padding: 20, marginBottom: 16, borderWidth: 2, borderColor: 'transparent' },
  planCardCurrent: { borderColor: '#1F4E79' },
  currentBadge: { position: 'absolute', top: -1, right: 16, backgroundColor: '#1F4E79', borderBottomLeftRadius: 8, borderBottomRightRadius: 8, paddingHorizontal: 12, paddingVertical: 4 },
  currentText: { fontSize: 10, fontWeight: 'bold', color: '#fff' },
  planName: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', marginTop: 4 },
  planPrice: { fontSize: 32, fontWeight: 'bold', color: '#1F4E79' },
  planPeriod: { fontSize: 16, color: '#666', marginLeft: 4 },
  planSavings: { fontSize: 13, color: '#10B981', fontWeight: '500', marginTop: 4 },
  featureList: { marginTop: 16, gap: 8 },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  featureText: { fontSize: 14, color: '#555' },
  upgradeBtn: { backgroundColor: '#1F4E79', borderRadius: 8, padding: 14, alignItems: 'center', marginTop: 16 },
  upgradeBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  cancelBtn: { alignItems: 'center', marginTop: 12 },
  cancelBtnText: { color: '#EF4444', fontSize: 14, fontWeight: '500' },
});
