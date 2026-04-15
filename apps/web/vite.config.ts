import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@marketmosaic/shared': path.resolve(__dirname, '../../packages/shared/src'),
      '@marketmosaic/manifest': path.resolve(__dirname, '../../packages/manifest/src'),
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api': 'http://localhost:3001',
    },
  },
});
