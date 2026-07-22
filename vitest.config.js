import { defineConfig } from 'vitest/config';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  define: {
    __VLC_ENV__: JSON.stringify('local'),
  },
  resolve: {
    alias: {
      'onnxruntime-web': resolve(__dirname, 'tests/mocks/onnxruntime-web.js'),
    },
  },
  test: {
    environment: 'jsdom',
    include: ['tests/**/*.test.js'],
  },
});
