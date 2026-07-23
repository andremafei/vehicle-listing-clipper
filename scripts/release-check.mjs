import { readFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const prodPath = resolve(root, 'dist/vehicle-listing-clipper.user.js');

const FORBIDDEN = ['localhost', '127.0.0.1', '4173', 'LOCAL DEV'];

let content;
try {
  content = await readFile(prodPath, 'utf8');
} catch {
  console.error(`Missing production userscript: ${prodPath}`);
  console.error('Run npm run build first.');
  process.exit(1);
}

if (!content.startsWith('// ==UserScript==')) {
  console.error(`${prodPath} must start with // ==UserScript==`);
  process.exit(1);
}

const failures = FORBIDDEN.filter((needle) => content.includes(needle));
if (failures.length > 0) {
  console.error(`${prodPath} contains forbidden strings:`);
  for (const needle of failures) {
    console.error(`  - ${needle}`);
  }
  process.exit(1);
}

console.log('release:check passed');
