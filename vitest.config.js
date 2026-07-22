import { defineConfig } from 'vitest/config';

export default defineConfig({
  define: {
    __VLC_ENV__: JSON.stringify('local'),
  },
  test: {
    environment: 'jsdom',
    include: ['tests/**/*.test.js'],
  },
});
