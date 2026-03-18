import '@testing-library/jest-dom';
import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {}, // deprecated
    removeListener: () => {}, // deprecated
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
});

// Mock localStorage
const localStorageMock = {
  getItem: (key) => localStorage[key] || null,
  setItem: (key, value) => {
    localStorage[key] = value.toString();
  },
  removeItem: (key) => {
    delete localStorage[key];
  },
  clear: () => {
    Object.keys(localStorage).forEach((key) => {
      delete localStorage[key];
    });
  },
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});
