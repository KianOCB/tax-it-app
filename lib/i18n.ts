import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { getLocales } from 'expo-localization';
import { Platform } from 'react-native';

import en from '../locales/en.json';
import zu from '../locales/zu.json';
import xh from '../locales/xh.json';
import af from '../locales/af.json';

const LANGUAGE_KEY = 'tax-it-language';

const resources = {
  en: { translation: en },
  zu: { translation: zu },
  xh: { translation: xh },
  af: { translation: af },
};

const deviceLocale = getLocales()[0]?.languageCode ?? 'en';
const fallbackLng = Object.keys(resources).includes(deviceLocale) ? deviceLocale : 'en';

i18n.use(initReactI18next).init({
  resources,
  lng: fallbackLng,
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
  compatibilityJSON: 'v4',
});

// Load saved language preference (skip during SSR)
if (Platform.OS !== 'web' || typeof window !== 'undefined') {
  const AsyncStorage = require('@react-native-async-storage/async-storage').default;
  AsyncStorage.getItem(LANGUAGE_KEY).then((lang: string | null) => {
    if (lang && Object.keys(resources).includes(lang)) {
      i18n.changeLanguage(lang);
    }
  });
}

export async function setLanguage(lang: string) {
  if (Platform.OS !== 'web' || typeof window !== 'undefined') {
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    await AsyncStorage.setItem(LANGUAGE_KEY, lang);
  }
  await i18n.changeLanguage(lang);
}

export default i18n;
