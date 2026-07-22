import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const localLoader = resolve(
  root,
  'dist-dev/vehicle-listing-clipper-local.user.js',
);
const prodUserscript = resolve(root, 'dist/vehicle-listing-clipper.user.js');

function runBuild() {
  execFileSync('node', [resolve(root, 'scripts/build-production.mjs')], {
    cwd: root,
    stdio: 'pipe',
  });
  execFileSync('node', [resolve(root, 'scripts/build-local-loader.mjs')], {
    cwd: root,
    stdio: 'pipe',
  });
}

describe('build outputs', () => {
  it(
    'generates local loader and production userscript',
    () => {
      runBuild();
      expect(existsSync(localLoader)).toBe(true);
      expect(existsSync(prodUserscript)).toBe(true);
      // App bundle must stay lean — ORT is @require'd, not inlined.
      expect(statSync(prodUserscript).size).toBeLessThan(2_000_000);
    },
    60_000,
  );

  it(
    'puts userscript metadata first in both outputs',
    () => {
      runBuild();
      const local = readFileSync(localLoader, 'utf8');
      const prod = readFileSync(prodUserscript, 'utf8');
      expect(local.startsWith('// ==UserScript==')).toBe(true);
      expect(prod.startsWith('// ==UserScript==')).toBe(true);
      expect(local).toContain('Vehicle Listing Clipper [LOCAL DEV]');
      expect(prod).toContain('@name         Vehicle Listing Clipper');
      expect(prod).not.toContain('[LOCAL DEV]');
      expect(prod).toContain('onnxruntime-web@1.22.0/dist/ort.min.js');
      expect(local).toContain('onnxruntime-web@1.22.0/dist/ort.min.js');
    },
    60_000,
  );

  it(
    'keeps forbidden local markers out of production',
    () => {
      runBuild();
      const prod = readFileSync(prodUserscript, 'utf8');
      for (const needle of ['localhost', '127.0.0.1', '4173', 'LOCAL DEV']) {
        expect(prod.includes(needle), `must not contain ${needle}`).toBe(false);
      }
    },
    60_000,
  );

  it(
    'embeds production storage names (not local) in the bundle',
    () => {
      runBuild();
      const prod = readFileSync(prodUserscript, 'utf8');
      expect(prod).toContain('vlc_prod_');
      expect(prod).toContain('vehicle-listing-clipper');
      expect(prod).not.toContain('vlc_local_');
      expect(prod).not.toContain('vehicle-listing-clipper-local');
    },
    60_000,
  );
});
