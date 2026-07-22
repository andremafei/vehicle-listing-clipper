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
 * @typedef {object} GmXhrOptions
 * @property {string} method
 * @property {string} url
 * @property {'arraybuffer' | 'blob' | 'json' | 'text'} [responseType]
 * @property {Record<string, string>} [headers]
 * @property {AbortSignal} [signal]
 */

/** @type {((options: GmXhrOptions) => Promise<unknown>) | null} */
let xhrOverride = null;

/**
 * Test helper: inject a fake XHR implementation.
 * @param {((options: GmXhrOptions) => Promise<unknown>) | null} fn
 */
export function __setGmXmlHttpRequestOverride(fn) {
  xhrOverride = fn;
}

/**
 * Privileged cross-origin request (Tampermonkey / Violentmonkey).
 * @param {GmXhrOptions} options
 * @returns {Promise<unknown>}
 */
export function gmXmlHttpRequest(options) {
  if (xhrOverride) {
    return xhrOverride(options);
  }

  const { method, url, responseType = 'arraybuffer', headers, signal } = options;

  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException('Aborted', 'AbortError'));
      return;
    }

    /** @type {{ abort?: () => void } | null} */
    let requestHandle = null;

    const onAbort = () => {
      try {
        requestHandle?.abort?.();
      } catch {
        // ignore
      }
      reject(new DOMException('Aborted', 'AbortError'));
    };

    signal?.addEventListener('abort', onAbort, { once: true });

    /** @param {object} details */
    const send = (details) => {
      if (typeof GM !== 'undefined' && GM && typeof GM.xmlHttpRequest === 'function') {
        requestHandle = GM.xmlHttpRequest(details);
        return;
      }
      if (typeof GM_xmlhttpRequest === 'function') {
        requestHandle = GM_xmlhttpRequest(details);
        return;
      }
      reject(
        new Error(
          'GM.xmlHttpRequest is unavailable. Install via Tampermonkey / Violentmonkey.',
        ),
      );
    };

    send({
      method,
      url,
      responseType,
      headers,
      onload(response) {
        signal?.removeEventListener('abort', onAbort);
        const status = response.status;
        if (status < 200 || status >= 300) {
          reject(new Error(`HTTP ${status} for ${url}`));
          return;
        }
        resolve(response.response);
      },
      onerror() {
        signal?.removeEventListener('abort', onAbort);
        reject(new Error(`Network error for ${url}`));
      },
      ontimeout() {
        signal?.removeEventListener('abort', onAbort);
        reject(new Error(`Timeout for ${url}`));
      },
    });
  });
}

/**
 * Clear in-memory fallback (tests only).
 */
export function __resetGmMemoryStore() {
  memoryStore.clear();
}
