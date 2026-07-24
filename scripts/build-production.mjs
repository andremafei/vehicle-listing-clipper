import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'vite';
import { PRODUCTION_LOADER_SOURCE } from '../src/userscript/production-loader.js';

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

// Promote Tampermonkey @require `var ort` onto globalThis before the app IIFE.
// The production loader also binds ort before eval; keep this bridge in the
// published bundle so a direct load of the IIFE still works.
const ortBridge = `(function(){try{if(typeof ort!=="undefined"&&ort){if(typeof globalThis!=="undefined")globalThis.ort=ort;if(typeof window!=="undefined")window.ort=ort;}}catch(e){console.error("[Vehicle Listing Clipper] Failed to bind ort",e);}})();\n`;

await writeFile(bundlePath, `${ortBridge}${bundle}`, 'utf8');
await writeFile(outPath, PRODUCTION_LOADER_SOURCE, 'utf8');

console.log(`Wrote ${bundlePath}`);
console.log(`Wrote ${outPath}`);
