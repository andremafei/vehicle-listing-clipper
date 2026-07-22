import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { LOCAL_LOADER_SOURCE } from '../src/userscript/local-loader.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const outPath = resolve(root, 'dist-dev/vehicle-listing-clipper-local.user.js');

await mkdir(dirname(outPath), { recursive: true });
await writeFile(outPath, LOCAL_LOADER_SOURCE, 'utf8');
console.log(`Wrote ${outPath}`);
