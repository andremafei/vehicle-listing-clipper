import { readFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const prodLoaderPath = resolve(root, 'dist/vehicle-listing-clipper.user.js');
const prodBundlePath = resolve(root, 'dist/vehicle-listing-clipper.bundle.js');

const FORBIDDEN = ['localhost', '127.0.0.1', '4173', 'LOCAL DEV'];

/**
 * @param {string} path
 * @param {{ requireUserscriptHeader?: boolean }} [opts]
 */
async function checkFile(path, opts = {}) {
  let content;
  try {
    content = await readFile(path, 'utf8');
  } catch {
    console.error(`Missing production file: ${path}`);
    console.error('Run npm run build first.');
    process.exit(1);
  }

  if (opts.requireUserscriptHeader && !content.startsWith('// ==UserScript==')) {
    console.error(`${path} must start with // ==UserScript==`);
    process.exit(1);
  }

  const failures = FORBIDDEN.filter((needle) => content.includes(needle));
  if (failures.length > 0) {
    console.error(`${path} contains forbidden strings:`);
    for (const needle of failures) {
      console.error(`  - ${needle}`);
    }
    process.exit(1);
  }
}

await checkFile(prodLoaderPath, { requireUserscriptHeader: true });
await checkFile(prodBundlePath);

console.log('release:check passed');
