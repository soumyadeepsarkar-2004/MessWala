/**
 * Backend i18n (Internationalization) Support
 * Provides translation utilities for server-side responses
 */

const translations = {
  en: require('../locales/en.json'),
  hi: require('../locales/hi.json'),
};

/**
 * Get user's preferred language from request
 * Priority: query param > header > default (en)
 */
function getUserLanguage(req) {
  const queryLang = req.query.lang || req.query.language;
  const headerLang = req.headers['accept-language']?.split(',')[0]?.split('-')[0];
  const userLang = req.user?.language;

  if (queryLang && queryLang in translations) {
    return queryLang;
  }
  if (userLang && userLang in translations) {
    return userLang;
  }
  if (headerLang && headerLang in translations) {
    return headerLang;
  }

  return 'en'; // Default to English
}

/**
 * Translate a key to the target language
 */
function translate(key, language = 'en', defaultValue = key) {
  if (!(language in translations)) {
    language = 'en';
  }

  const keys = key.split('.');
  let value = translations[language];

  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k];
    } else {
      return defaultValue;
    }
  }

  return value;
}

/**
 * i18n Middleware
 * Attaches i18n utilities to the request object
 */
function i18nMiddleware(req, res, next) {
  req.language = getUserLanguage(req);
  req.t = (key, defaultValue) => translate(key, req.language, defaultValue);

  res.json = (function (json) {
    return function (data) {
      // Translate error and success messages if present
      if (data.message && typeof data.message === 'string') {
        data.message = req.t(data.message, data.message);
      }

      if (data.error && typeof data.error === 'string') {
        data.error = req.t(data.error, data.error);
      }

      // Add language info to response
      data.language = req.language;

      return json.call(this, data);
    };
  })(res.json);

  next();
}

/**
 * Helper to return translated messages in API responses
 */
function getTranslatedMessage(req, key, defaultMessage) {
  return req.t(`messages.${key}`, defaultMessage);
}

/**
 * Helper to generate i18n-aware error response
 */
function sendLocalizedError(req, res, status, messageKey, defaultMessage) {
  const message = getTranslatedMessage(req, messageKey, defaultMessage);
  return res.status(status).json({
    success: false,
    error: message,
    language: req.language,
  });
}

/**
 * Helper to generate i18n-aware success response
 */
function sendLocalizedSuccess(req, res, data, messageKey, defaultMessage) {
  const message = messageKey ? getTranslatedMessage(req, messageKey, defaultMessage) : null;
  return res.json({
    success: true,
    data,
    message,
    language: req.language,
  });
}

// Export routes file for backend translations
function createI18nRoutes() {
  const express = require('express');
  const router = express.Router();

  /**
   * GET /api/i18n/languages
   * Get available languages
   */
  router.get('/languages', (req, res) => {
    res.json({
      success: true,
      languages: Object.keys(translations),
      current: req.language,
    });
  });

  /**
   * GET /api/i18n/translations/:language
   * Get all translations for a language
   */
  router.get('/translations/:language', (req, res) => {
    const { language } = req.params;

    if (!(language in translations)) {
      return res.status(404).json({
        success: false,
        error: 'Language not supported',
        language: req.language,
      });
    }

    res.json({
      success: true,
      language,
      translations: translations[language],
    });
  });

  /**
   * GET /api/i18n/keys
   * Get all translation keys
   */
  router.get('/keys', (req, res) => {
    const getKeys = (obj, prefix = '') => {
      const keys = [];
      Object.entries(obj).forEach(([key, value]) => {
        const fullKey = prefix ? `${prefix}.${key}` : key;
        if (typeof value === 'object' && !Array.isArray(value)) {
          keys.push(...getKeys(value, fullKey));
        } else {
          keys.push(fullKey);
        }
      });
      return keys;
    };

    res.json({
      success: true,
      keys: getKeys(translations['en']),
      language: req.language,
    });
  });

  return router;
}

module.exports = {
  i18nMiddleware,
  translate,
  getUserLanguage,
  getTranslatedMessage,
  sendLocalizedError,
  sendLocalizedSuccess,
  createI18nRoutes,
  translations,
};
