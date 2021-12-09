import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    common: require('../locales/en/common.json')
  },
  ja: {
    common: require('../locales/ja/common.json')
  }
};

i18n
.use(LanguageDetector)
.use(initReactI18next) // passes i18n down to react-i18next
.init({
  resources,

  fallbackLng: 'en',

  debug: true,

  interpolation: {
    escapeValue: false // react already safes from xss
  }
});

export default i18n;
