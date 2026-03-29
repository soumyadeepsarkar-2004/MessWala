import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/__tests__/setup.js'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'src/__tests__/'],
    },
    include: ['src/**/*.{test,spec}.{js,jsx,ts,tsx}'],
    server: {
      deps: {
        inline: ['react-joyride'],
      },
    },
  },
  ssr: {
    noExternal: ['react-joyride'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
