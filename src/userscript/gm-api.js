/**
 * Thin wrappers around Tampermonkey / Violentmonkey GM APIs.
 * Falls back to no-ops / in-memory when GM is unavailable (tests, fixture without TM).
 */

const memoryStore = new Map();

function hasGm() {
  return typeof GM !== 'undefined' && GM != null;
}

/**
 * @param {string} key
 * @param {unknown} defaultValue
 * @returns {Promise<unknown>}
 */
export async function gmGetValue(key, defaultValue = null) {
  if (typeof GM_getValue === 'function') {
    return GM_getValue(key, defaultValue);
  }
  if (hasGm() && typeof GM.getValue === 'function') {
    return GM.getValue(key, defaultValue);
  }
  return memoryStore.has(key) ? memoryStore.get(key) : defaultValue;
}

/**
 * @param {string} key
 * @param {unknown} value
 * @returns {Promise<void>}
 */
export async function gmSetValue(key, value) {
  if (typeof GM_setValue === 'function') {
    GM_setValue(key, value);
    return;
  }
  if (hasGm() && typeof GM.setValue === 'function') {
    await GM.setValue(key, value);
    return;
  }
  memoryStore.set(key, value);
}

/**
 * @param {string} text
 * @returns {Promise<boolean>}
 */
export async function gmSetClipboard(text) {
  if (typeof GM_setClipboard === 'function') {
    GM_setClipboard(text, 'text');
    return true;
  }
  if (hasGm() && typeof GM.setClipboard === 'function') {
    await GM.setClipboard(text, 'text');
    return true;
  }
  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      return false;
    }
  }
  return false;
}

/**
 * Clear in-memory fallback (tests only).
 */
export function __resetGmMemoryStore() {
  memoryStore.clear();
}
