import { defineConfig } from 'vite';
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
  server: {
    port: 3000,
    proxy: {
      '/api': 'http://localhost:4000',
    },
  },
});
