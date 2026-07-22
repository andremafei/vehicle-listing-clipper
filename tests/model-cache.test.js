import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  __resetModelCacheDb,
  loadModelAsset,
  sha256Hex,
} from '../src/anpr/model-cache.js';
import { __setGmXmlHttpRequestOverride } from '../src/userscript/gm-api.js';

function installFakeIdb() {
  const store = new Map();

  vi.stubGlobal('indexedDB', {
    open() {
      const fakeDb = {
        objectStoreNames: { contains: () => true },
        transaction() {
          const tx = {
            error: null,
            objectStore() {
              return {
                get(id) {
                  const req = {
                    result: store.has(id) ? store.get(id) : undefined,
                    onsuccess: null,
                    onerror: null,
                  };
                  queueMicrotask(() => req.onsuccess?.({ target: req }));
                  return req;
                },
                put(row) {
                  store.set(row.id, row);
                },
                clear() {
                  store.clear();
                },
              };
            },
          };
          Object.defineProperty(tx, 'oncomplete', {
            set(fn) {
              queueMicrotask(() => fn?.());
            },
          });
          Object.defineProperty(tx, 'onerror', {
            set() {},
          });
          return tx;
        },
      };

      const req = {
        result: fakeDb,
        error: null,
        onupgradeneeded: null,
        onsuccess: null,
        onerror: null,
      };
      queueMicrotask(() => {
        req.onupgradeneeded?.({ target: req });
        req.onsuccess?.({ target: req });
      });
      return req;
    },
  });

  return store;
}

describe('model cache', () => {
  beforeEach(() => {
    __resetModelCacheDb();
    installFakeIdb();
  });

  afterEach(() => {
    __setGmXmlHttpRequestOverride(null);
    __resetModelCacheDb();
    vi.unstubAllGlobals();
  });

  it('reports cache miss then hit', async () => {
    const bytes = new Uint8Array([1, 2, 3, 4]).buffer;
    const sha = await sha256Hex(bytes);
    __setGmXmlHttpRequestOverride(async () => bytes);

    const asset = {
      id: 'test-model',
      url: 'https://example.com/model.onnx',
      sha256: sha,
    };

    const first = await loadModelAsset(asset);
    expect(first.cacheHit).toBe(false);

    const second = await loadModelAsset(asset);
    expect(second.cacheHit).toBe(true);
  });
});
