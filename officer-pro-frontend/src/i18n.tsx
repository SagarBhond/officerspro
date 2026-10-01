import i18n from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import { initReactI18next } from 'react-i18next'
import Backend from 'i18next-http-backend'

i18n.use(LanguageDetector).use(initReactI18next).use(Backend).init({
  debug: false, // Disable debug to reduce console noise
  fallbackLng: 'en',
  returnObjects: true,
  backend: {
    loadPath: '/locales/{{lng}}/{{ns}}.json',
  },
  // Don't fail if translation files are missing
  saveMissing: false,
  load: 'languageOnly',
})
