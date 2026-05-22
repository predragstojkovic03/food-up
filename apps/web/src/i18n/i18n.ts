import i18next from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';

import enAuth from './en/auth.json';
import enCommon from './en/common.json';
import enPreferences from './en/preferences.json';
import srAuth from './sr/auth.json';
import srCommon from './sr/common.json';
import srPreferences from './sr/preferences.json';

export const defaultNS = 'common' as const;

export const resources = {
  en: { common: enCommon, auth: enAuth, preferences: enPreferences },
  sr: { common: srCommon, auth: srAuth, preferences: srPreferences },
} as const;

i18next
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    supportedLngs: ['en', 'sr'],
    defaultNS,
    interpolation: { escapeValue: false },
    detection: { order: ['localStorage', 'navigator'] },
  });

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: typeof defaultNS;
    resources: (typeof resources)['en'];
  }
}

export default i18next;
