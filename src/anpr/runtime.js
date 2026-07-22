/**
 * ONNX Runtime Web session helpers — WebGPU first, WASM fallback.
 * `ort` comes from Tampermonkey @require (sandbox `var ort`, not always on globalThis).
 */

import { getModelManifest } from './model-manifest.js';

/** @type {string | null} */
let activeProvider = null;

/** @type {any} */
let ortOverride = null;

/**
 * Test helper.
 * @param {any} value
 */
export function __setOrtOverride(value) {
  ortOverride = value;
}

/**
 * Locate the ORT API across Tampermonkey sandbox / page globals.
 * @returns {any}
 */
function findOrtGlobal() {
  if (ortOverride) {
    return ortOverride;
  }

  const scopes = [];
  if (typeof globalThis !== 'undefined') {
    scopes.push(globalThis);
  }
  // Tampermonkey / Violentmonkey page window (when granted)
  try {
    // eslint-disable-next-line no-undef
    if (typeof unsafeWindow !== 'undefined' && unsafeWindow) {
      // eslint-disable-next-line no-undef
      scopes.push(unsafeWindow);
    }
  } catch {
    // ignore
  }
  if (typeof window !== 'undefined') {
    scopes.push(window);
  }
  if (typeof self !== 'undefined') {
    scopes.push(self);
  }

  for (const scope of scopes) {
    if (scope?.ort) {
      return scope.ort;
    }
  }

  // Sandbox free binding from @require ("var ort=...") — not always on globalThis.
  try {
    // Indirect eval resolves bare identifiers against the userscript global scope.
    const fromSandbox = (0, eval)('typeof ort !== "undefined" ? ort : null');
    if (fromSandbox) {
      if (typeof globalThis !== 'undefined' && !globalThis.ort) {
        globalThis.ort = fromSandbox;
      }
      return fromSandbox;
    }
  } catch {
    // ignore
  }

  return null;
}

/**
 * Resolve the ORT API (global from @require, or test override).
 */
export function getOrt() {
  const api = findOrtGlobal();
  if (api) {
    return api;
  }
  throw new Error(
    'onnxruntime-web (global ort) is unavailable. Ensure the userscript @require for ort.min.js is installed, then reinstall/update the script in Tampermonkey.',
  );
}

/** Convenience export used by detector/ocr — resolved lazily where needed. */
export const ort = new Proxy(
  {},
  {
    get(_target, prop) {
      return getOrt()[prop];
    },
  },
);

/**
 * Configure WASM asset base URL (CDN).
 */
export function configureOrtEnv() {
  const api = getOrt();
  const manifest = getModelManifest();
  if (api?.env?.wasm) {
    api.env.wasm.wasmPaths = manifest.ortWasmBaseUrl;
    api.env.wasm.numThreads = 1;
  }
}

/**
 * @param {ArrayBuffer} modelBytes
 * @param {object} [options]
 * @param {string[]} [options.prefer]
 * @returns {Promise<{ session: any, provider: string }>}
 */
export async function createInferenceSession(modelBytes, options = {}) {
  configureOrtEnv();
  const api = getOrt();
  const prefer = options.prefer || ['webgpu', 'wasm'];
  const errors = [];

  for (const provider of prefer) {
    try {
      const session = await api.InferenceSession.create(modelBytes, {
        executionProviders: [provider],
      });
      activeProvider = provider;
      return { session, provider };
    } catch (error) {
      errors.push(
        `${provider}: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  throw new Error(`Failed to create ORT session. Tried: ${errors.join(' | ')}`);
}

export function getActiveProvider() {
  return activeProvider;
}
