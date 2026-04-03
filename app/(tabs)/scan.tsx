import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function ScanScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.placeholder}>
        <Ionicons name="camera-outline" size={80} color="#1F4E79" />
        <Text style={styles.title}>Receipt Scanner</Text>
        <Text style={styles.description}>
          Snap a photo of your receipt and we'll extract the details automatically using AI.
        </Text>
        <Pressable style={styles.button}>
          <Ionicons name="camera" size={20} color="#fff" />
          <Text style={styles.buttonText}>Scan Receipt</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', justifyContent: 'center', padding: 24 },
  placeholder: { alignItems: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#1F4E79', marginTop: 16 },
  description: { fontSize: 14, color: '#666', textAlign: 'center', marginTop: 8, lineHeight: 20 },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#1F4E79',
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 24,
    marginTop: 24,
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
