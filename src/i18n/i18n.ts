import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import enCommon from './locales/en/common.json';
import enLogin from './locales/en/login.json';
import enUsers from './locales/en/users.json';
import enAuditLogs from './locales/en/auditLogs.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        common: enCommon,
        login: enLogin,
        users: enUsers,
        auditLogs: enAuditLogs,
      },
    },
    supportedLngs: ['en'],
    fallbackLng: 'en',
    defaultNS: 'common',
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'i18n_language',
      caches: ['localStorage'],
    },
  });

// Sync HTML lang attribute with i18next (WCAG 3.1.1)
i18n.on('languageChanged', (lng) => {
  document.documentElement.lang = lng;
});
document.documentElement.lang = i18n.resolvedLanguage || i18n.language || 'en';

export default i18n;
