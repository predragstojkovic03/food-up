import i18next from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';

import enAuth from './en/auth.json';
import enBusiness from './en/business.json';
import enChangeRequests from './en/changeRequests.json';
import enCommon from './en/common.json';
import enEmployees from './en/employees.json';
import enMeals from './en/meals.json';
import enPreferences from './en/preferences.json';
import enSuppliers from './en/suppliers.json';
import srAuth from './sr/auth.json';
import srBusiness from './sr/business.json';
import srChangeRequests from './sr/changeRequests.json';
import srCommon from './sr/common.json';
import srEmployees from './sr/employees.json';
import srMeals from './sr/meals.json';
import srPreferences from './sr/preferences.json';
import srSuppliers from './sr/suppliers.json';

export const defaultNS = 'common' as const;

export const resources = {
  en: {
    common: enCommon,
    auth: enAuth,
    preferences: enPreferences,
    suppliers: enSuppliers,
    employees: enEmployees,
    meals: enMeals,
    changeRequests: enChangeRequests,
    business: enBusiness,
  },
  sr: {
    common: srCommon,
    auth: srAuth,
    preferences: srPreferences,
    suppliers: srSuppliers,
    employees: srEmployees,
    meals: srMeals,
    changeRequests: srChangeRequests,
    business: srBusiness,
  },
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
