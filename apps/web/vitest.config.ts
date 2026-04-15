import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@brokerflow/shared': path.resolve(__dirname, '../../packages/shared/src'),
      '@brokerflow/manifest': path.resolve(__dirname, '../../packages/manifest/src'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: [],
  },
});
