import { STORAGE_PREFIX } from '../environment.js';
import { DEFAULT_VALUATION } from '../listing/record.js';
import { gmGetValue, gmSetValue } from '../userscript/gm-api.js';

const DEFAULTS_KEY = 'valuationDefaults';

/**
 * Persist only settings (not listing records).
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

/**
 * @returns {Promise<typeof DEFAULT_VALUATION>}
 */
export async function getValuationDefaults() {
  const stored = await getSetting(DEFAULTS_KEY, null);
  if (!stored || typeof stored !== 'object') {
    return { ...DEFAULT_VALUATION };
  }
  return {
    ...DEFAULT_VALUATION,
    ...stored,
  };
}

/**
 * @param {Partial<typeof DEFAULT_VALUATION>} defaults
 * @returns {Promise<typeof DEFAULT_VALUATION>}
 */
export async function setValuationDefaults(defaults) {
  const next = {
    ...DEFAULT_VALUATION,
    ...defaults,
  };
  await setSetting(DEFAULTS_KEY, next);
  return next;
}
