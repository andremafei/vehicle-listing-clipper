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
const prodBundle = resolve(root, 'dist/vehicle-listing-clipper.bundle.js');

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
    'generates local loader, production loader, and production bundle',
    () => {
      runBuild();
      expect(existsSync(localLoader)).toBe(true);
      expect(existsSync(prodUserscript)).toBe(true);
      expect(existsSync(prodBundle)).toBe(true);
      // App bundle must stay lean — ORT is @require'd, not inlined.
      expect(statSync(prodBundle).size).toBeLessThan(2_000_000);
      // Loader is a thin fetch+eval shell.
      expect(statSync(prodUserscript).size).toBeLessThan(10_000);
    },
    60_000,
  );

  it(
    'puts userscript metadata first in both loaders',
    () => {
      runBuild();
      const local = readFileSync(localLoader, 'utf8');
      const prod = readFileSync(prodUserscript, 'utf8');
      expect(local.startsWith('// ==UserScript==')).toBe(true);
      expect(prod.startsWith('// ==UserScript==')).toBe(true);
      expect(local).toContain('Vehicle Listing Clipper [LOCAL DEV]');
      expect(prod).toContain('@name         Vehicle Listing Clipper');
      expect(prod).not.toContain('[LOCAL DEV]');
      expect(prod).toContain('@match        https://crm.flexicar.pt/*');
      expect(local).toContain('@match        https://crm.flexicar.pt/*');
      expect(prod).toContain('onnxruntime-web@1.22.0/dist/ort.min.js');
      expect(local).toContain('onnxruntime-web@1.22.0/dist/ort.min.js');
      // GitHub release assets redirect here; without @connect Tampermonkey fails with Network error.
      expect(prod).toContain('@connect      release-assets.githubusercontent.com');
      expect(local).toContain('@connect      release-assets.githubusercontent.com');
      expect(prod).toContain('@connect      raw.githubusercontent.com');
      expect(prod).toContain(
        'raw.githubusercontent.com/andremafei/vehicle-listing-clipper/main/dist/vehicle-listing-clipper.bundle.js',
      );
      expect(prod).toContain('eval(response.responseText)');
    },
    60_000,
  );

  it(
    'keeps forbidden local markers out of production loader and bundle',
    () => {
      runBuild();
      const prod = readFileSync(prodUserscript, 'utf8');
      const bundle = readFileSync(prodBundle, 'utf8');
      for (const needle of ['localhost', '127.0.0.1', '4173', 'LOCAL DEV']) {
        expect(prod.includes(needle), `loader must not contain ${needle}`).toBe(
          false,
        );
        expect(
          bundle.includes(needle),
          `bundle must not contain ${needle}`,
        ).toBe(false);
      }
    },
    60_000,
  );

  it(
    'embeds production storage names (not local) in the bundle',
    () => {
      runBuild();
      const prod = readFileSync(prodUserscript, 'utf8');
      const bundle = readFileSync(prodBundle, 'utf8');
      expect(bundle).toContain('vlc_prod_');
      expect(bundle).toContain('vehicle-listing-clipper');
      expect(bundle).not.toContain('vlc_local_');
      expect(bundle).not.toContain('vehicle-listing-clipper-local');
      // Thin loader must not embed the app storage constants.
      expect(prod).not.toContain('vlc_prod_');
    },
    60_000,
  );
});
