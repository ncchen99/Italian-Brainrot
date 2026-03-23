import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import zhTW from './locales/zh-TW.json';
import en from './locales/en.json';

const resources = {
  'zh-TW': {
    translation: zhTW
  },
  en: {
    translation: en
  }
};

const savedLng = localStorage.getItem('app_lang') || 'zh-TW';

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: savedLng,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false // react already safes from xss
    }
  });

i18n.on('languageChanged', (lng) => {
  localStorage.setItem('app_lang', lng);
});

export default i18n;
