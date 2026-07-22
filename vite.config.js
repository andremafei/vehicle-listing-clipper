import { defineConfig } from 'vite';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * @param {'development' | 'production'} mode
 */
function createViteConfig(mode) {
  const isDev = mode === 'development';

  return defineConfig({
    define: {
      __VLC_ENV__: JSON.stringify(isDev ? 'local' : 'production'),
    },
    build: {
      outDir: isDev ? 'dist-dev' : 'dist',
      emptyOutDir: false,
      lib: {
        entry: resolve(__dirname, 'src/main.js'),
        name: 'VehicleListingClipper',
        formats: ['iife'],
        fileName: () =>
          isDev
            ? 'vehicle-listing-clipper.dev.js'
            : 'vehicle-listing-clipper.bundle.js',
      },
      rollupOptions: {
        output: {
          inlineDynamicImports: true,
          extend: true,
        },
      },
      minify: !isDev,
      sourcemap: isDev,
      target: 'es2020',
    },
  });
}

export default defineConfig(({ mode }) => createViteConfig(mode));
