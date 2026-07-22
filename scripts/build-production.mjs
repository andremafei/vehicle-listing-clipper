import { mkdir, readFile, writeFile, unlink } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'vite';
import { PRODUCTION_METADATA } from '../src/userscript/production-metadata.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const distDir = resolve(root, 'dist');
const bundlePath = resolve(distDir, 'vehicle-listing-clipper.bundle.js');
const outPath = resolve(distDir, 'vehicle-listing-clipper.user.js');

await mkdir(distDir, { recursive: true });

await build({
  configFile: resolve(root, 'vite.config.js'),
  mode: 'production',
});

const bundle = await readFile(bundlePath, 'utf8');
const userscript = `${PRODUCTION_METADATA}\n${bundle}`;
await writeFile(outPath, userscript, 'utf8');

try {
  await unlink(bundlePath);
} catch {
  // ignore if already removed
}

console.log(`Wrote ${outPath}`);
