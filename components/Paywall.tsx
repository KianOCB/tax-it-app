import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

interface PaywallProps {
  feature: string;
  onDismiss: () => void;
}

export default function Paywall({ feature, onDismiss }: PaywallProps) {
  const router = useRouter();

  return (
    <View style={styles.overlay}>
      <View style={styles.card}>
        <Pressable style={styles.closeBtn} onPress={onDismiss}>
          <Ionicons name="close" size={24} color="#666" />
        </Pressable>

        <Ionicons name="lock-closed" size={48} color="#1F4E79" />
        <Text style={styles.title}>Pro Feature</Text>
        <Text style={styles.description}>
          <Text style={styles.featureName}>{feature}</Text> is available on the Pro plan.
          Upgrade to unlock unlimited access.
        </Text>

        <Pressable
          style={styles.upgradeBtn}
          onPress={() => { onDismiss(); router.push('/subscription'); }}
        >
          <Text style={styles.upgradeBtnText}>Upgrade to Pro</Text>
        </Pressable>

        <Pressable
          style={styles.trialBtn}
          onPress={() => { onDismiss(); router.push('/subscription'); }}
        >
          <Text style={styles.trialBtnText}>Start Free Trial</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    zIndex: 100,
  },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 32, alignItems: 'center', width: '100%', maxWidth: 340 },
  closeBtn: { position: 'absolute', top: 12, right: 12, padding: 4 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#1F4E79', marginTop: 16 },
  description: { fontSize: 15, color: '#555', textAlign: 'center', marginTop: 8, lineHeight: 22 },
  featureName: { fontWeight: '600', color: '#1F4E79' },
  upgradeBtn: { backgroundColor: '#1F4E79', borderRadius: 8, padding: 14, alignItems: 'center', width: '100%', marginTop: 24 },
  upgradeBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  trialBtn: { marginTop: 12 },
  trialBtnText: { color: '#1F4E79', fontSize: 14, fontWeight: '500' },
});
