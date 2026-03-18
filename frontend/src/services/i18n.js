import React, { useState, useEffect, createContext } from 'react';
import en from '../locales/en.json';
import hi from '../locales/hi.json';

const translations = {
  en,
  hi,
};

class I18n {
  constructor(defaultLanguage = 'en') {
    this.currentLanguage = defaultLanguage;
    this.setsListener = new Set();
  }

  setLanguage(language) {
    if (language in translations) {
      this.currentLanguage = language;
      localStorage.setItem('language', language);
      this.notifyListeners();
    }
  }

  getLanguage() {
    return this.currentLanguage;
  }

  t(key, defaultValue = key) {
    const keys = key.split('.');
    let value = translations[this.currentLanguage];

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return defaultValue;
      }
    }

    return value;
  }

  subscribe(listener) {
    this.setsListener.add(listener);
    return () => this.setsListener.delete(listener);
  }

  notifyListeners() {
    this.setsListener.forEach((listener) => listener(this.currentLanguage));
  }

  // Initialize from localStorage or browser language
  initialize() {
    const savedLanguage = localStorage.getItem('language');
    if (savedLanguage && savedLanguage in translations) {
      this.currentLanguage = savedLanguage;
    } else {
      const browserLanguage = navigator.language.split('-')[0];
      if (browserLanguage in translations) {
        this.currentLanguage = browserLanguage;
      }
    }
  }
}

export const i18n = new I18n();

// React Hook
export function useTranslation() {
  const [language, setLanguage] = useState(i18n.getLanguage());

  useEffect(() => {
    const unsubscribe = i18n.subscribe(setLanguage);
    return unsubscribe;
  }, []);

  return {
    t: (key, defaultValue) => i18n.t(key, defaultValue),
    i18n,
    language,
    changeLanguage: (lang) => i18n.setLanguage(lang),
    availableLanguages: ['en', 'hi'],
  };
}

// React Context (alternative approach)
export const I18nContext = createContext(i18n);

// eslint-disable-next-line react/prop-types
export function I18nProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    i18n.initialize();
    return i18n.getLanguage();
  });

  useEffect(() => {
    const unsubscribe = i18n.subscribe(setLanguage);
    return unsubscribe;
  }, []);

  return <I18nContext.Provider value={{ ...i18n, language }}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  return React.useContext(I18nContext);
}
