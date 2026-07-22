import { INDEXED_DB_NAME } from '../environment.js';
import { gmXmlHttpRequest } from '../userscript/gm-api.js';

const STORE_NAME = 'models';
const DB_VERSION = 1;

/** @type {Promise<IDBDatabase> | null} */
let dbPromise = null;

/** Test helper */
export function __resetModelCacheDb() {
  dbPromise = null;
}

/**
 * @returns {Promise<IDBDatabase>}
 */
function openDb() {
  if (typeof indexedDB === 'undefined') {
    return Promise.reject(new Error('IndexedDB is unavailable'));
  }
  if (dbPromise) {
    return dbPromise;
  }
  dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(INDEXED_DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error || new Error('IndexedDB open failed'));
  });
  return dbPromise;
}

/**
 * @param {ArrayBuffer} buffer
 * @returns {Promise<string>}
 */
export async function sha256Hex(buffer) {
  const digest = await crypto.subtle.digest('SHA-256', buffer);
  return [...new Uint8Array(digest)]
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * @param {string} id
 * @returns {Promise<ArrayBuffer | null>}
 */
export async function getCachedModel(id) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const req = tx.objectStore(STORE_NAME).get(id);
    req.onsuccess = () => {
      const row = req.result;
      resolve(row?.bytes || null);
    };
    req.onerror = () => reject(req.error);
  });
}

/**
 * @param {string} id
 * @param {ArrayBuffer} bytes
 * @param {string} sha256
 */
export async function putCachedModel(id, bytes, sha256) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).put({ id, bytes, sha256, storedAt: Date.now() });
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function clearModelCache() {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).clear();
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

/**
 * @param {{ id: string, url: string, sha256: string }} asset
 * @param {object} [options]
 * @param {(msg: string) => void} [options.onStatus]
 * @param {AbortSignal} [options.signal]
 * @returns {Promise<{ bytes: ArrayBuffer, cacheHit: boolean }>}
 */
export async function loadModelAsset(asset, options = {}) {
  const { onStatus, signal } = options;
  const cached = await getCachedModel(asset.id).catch(() => null);
  if (cached) {
    const hash = await sha256Hex(cached);
    if (hash === asset.sha256) {
      onStatus?.(`Model cache hit: ${asset.id}`);
      return { bytes: cached, cacheHit: true };
    }
  }

  onStatus?.(`Downloading model: ${asset.id}`);
  const response = await gmXmlHttpRequest({
    method: 'GET',
    url: asset.url,
    responseType: 'arraybuffer',
    signal,
  });

  const bytes =
    response instanceof ArrayBuffer
      ? response
      : Object.prototype.toString.call(response) === '[object ArrayBuffer]'
        ? /** @type {ArrayBuffer} */ (response)
        : null;

  if (!bytes) {
    throw new Error(`Model download did not return ArrayBuffer: ${asset.id}`);
  }

  const hash = await sha256Hex(bytes);
  if (hash !== asset.sha256) {
    throw new Error(
      `SHA-256 mismatch for ${asset.id}: expected ${asset.sha256}, got ${hash}`,
    );
  }

  await putCachedModel(asset.id, bytes, hash).catch(() => {
    // Cache write failure is non-fatal.
  });

  return { bytes, cacheHit: false };
}
