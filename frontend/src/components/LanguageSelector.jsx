import React from 'react';
import { useI18n } from '../services/i18n';

export default function LanguageSelector() {
  const { i18n, language } = useI18n();

  const languages = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'hi', name: 'हिंदी', flag: '🇮🇳' },
  ];

  return (
    <div className="language-selector">
      <select
        value={language}
        onChange={(e) => i18n.setLanguage(e.target.value)}
        className="language-select"
      >
        {languages.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.flag} {lang.name}
          </option>
        ))}
      </select>
    </div>
  );
}
