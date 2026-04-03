import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';

export default function ProfileScreen() {
  const { user, signOut } = useAuth();

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: signOut },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={40} color="#fff" />
        </View>
        <Text style={styles.email}>{user?.email}</Text>
      </View>

      <View style={styles.section}>
        <Pressable style={styles.row}>
          <Ionicons name="settings-outline" size={22} color="#1F4E79" />
          <Text style={styles.rowText}>Settings</Text>
          <Ionicons name="chevron-forward" size={20} color="#ccc" />
        </Pressable>
        <Pressable style={styles.row}>
          <Ionicons name="help-circle-outline" size={22} color="#1F4E79" />
          <Text style={styles.rowText}>Help & Support</Text>
          <Ionicons name="chevron-forward" size={20} color="#ccc" />
        </Pressable>
      </View>

      <Pressable style={styles.signOutButton} onPress={handleSignOut}>
        <Ionicons name="log-out-outline" size={20} color="#dc3545" />
        <Text style={styles.signOutText}>Sign Out</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { alignItems: 'center', paddingVertical: 32, backgroundColor: '#fff' },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#1F4E79',
    justifyContent: 'center',
    alignItems: 'center',
  },
  email: { fontSize: 16, color: '#333', marginTop: 12 },
  section: { backgroundColor: '#fff', marginTop: 16 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#eee',
  },
  rowText: { flex: 1, fontSize: 16, color: '#333', marginLeft: 12 },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#fff',
    marginTop: 16,
    padding: 16,
  },
  signOutText: { fontSize: 16, color: '#dc3545', fontWeight: '600' },
});
