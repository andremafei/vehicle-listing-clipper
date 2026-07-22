import { STORAGE_PREFIX } from '../environment.js';
import { gmGetValue, gmSetValue } from '../userscript/gm-api.js';

/**
 * Persist only settings (not listing records). Stage 1: minimal stub.
 */

/**
 * @param {string} key
 * @param {unknown} fallback
 * @returns {Promise<unknown>}
 */
export async function getSetting(key, fallback = null) {
  return gmGetValue(`${STORAGE_PREFIX}${key}`, fallback);
}

/**
 * @param {string} key
 * @param {unknown} value
 * @returns {Promise<void>}
 */
export async function setSetting(key, value) {
  await gmSetValue(`${STORAGE_PREFIX}${key}`, value);
}
