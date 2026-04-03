import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { setLanguage } from '../../lib/i18n';

const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'zu', name: 'isiZulu' },
  { code: 'xh', name: 'isiXhosa' },
  { code: 'af', name: 'Afrikaans' },
];

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const { t, i18n } = useTranslation();
  const [showLangPicker, setShowLangPicker] = useState(false);

  const handleSignOut = () => {
    Alert.alert(t('auth.signOut'), t('auth.signOutConfirm'), [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('auth.signOut'), style: 'destructive', onPress: signOut },
    ]);
  };

  const handleLanguageChange = async (code: string) => {
    await setLanguage(code);
    setShowLangPicker(false);
  };

  const currentLang = LANGUAGES.find((l) => l.code === i18n.language) || LANGUAGES[0];

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
          <Text style={styles.rowText}>{t('profile.settings')}</Text>
          <Ionicons name="chevron-forward" size={20} color="#ccc" />
        </Pressable>
        <Pressable style={styles.row} onPress={() => setShowLangPicker(!showLangPicker)}>
          <Ionicons name="language-outline" size={22} color="#1F4E79" />
          <Text style={styles.rowText}>{t('profile.language')}</Text>
          <Text style={styles.rowValue}>{currentLang.name}</Text>
          <Ionicons name="chevron-forward" size={20} color="#ccc" />
        </Pressable>
        {showLangPicker && (
          <View style={styles.langPicker}>
            {LANGUAGES.map((lang) => (
              <Pressable
                key={lang.code}
                style={[styles.langOption, lang.code === i18n.language && styles.langOptionActive]}
                onPress={() => handleLanguageChange(lang.code)}
              >
                <Text style={[styles.langText, lang.code === i18n.language && styles.langTextActive]}>
                  {lang.name}
                </Text>
                {lang.code === i18n.language && (
                  <Ionicons name="checkmark" size={18} color="#1F4E79" />
                )}
              </Pressable>
            ))}
          </View>
        )}
        <Pressable style={styles.row}>
          <Ionicons name="help-circle-outline" size={22} color="#1F4E79" />
          <Text style={styles.rowText}>{t('profile.helpSupport')}</Text>
          <Ionicons name="chevron-forward" size={20} color="#ccc" />
        </Pressable>
      </View>

      <Pressable style={styles.signOutButton} onPress={handleSignOut}>
        <Ionicons name="log-out-outline" size={20} color="#dc3545" />
        <Text style={styles.signOutText}>{t('auth.signOut')}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { alignItems: 'center', paddingVertical: 32, backgroundColor: '#fff' },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#1F4E79', justifyContent: 'center', alignItems: 'center' },
  email: { fontSize: 16, color: '#333', marginTop: 12 },
  section: { backgroundColor: '#fff', marginTop: 16 },
  row: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#eee' },
  rowText: { flex: 1, fontSize: 16, color: '#333', marginLeft: 12 },
  rowValue: { fontSize: 14, color: '#666', marginRight: 8 },
  langPicker: { backgroundColor: '#f9f9f9', paddingHorizontal: 16 },
  langOption: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, paddingHorizontal: 8, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#eee' },
  langOptionActive: { backgroundColor: '#E8F0F8', borderRadius: 8, marginVertical: 2, paddingHorizontal: 12 },
  langText: { fontSize: 15, color: '#333' },
  langTextActive: { color: '#1F4E79', fontWeight: '600' },
  signOutButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#fff', marginTop: 16, padding: 16 },
  signOutText: { fontSize: 16, color: '#dc3545', fontWeight: '600' },
});
