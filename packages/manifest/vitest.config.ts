import { resolve } from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      '@marketmosaic/shared': resolve(__dirname, '../shared/src/index.ts'),
    },
  },
  test: { globals: true, environment: 'node' },
});