/**
 * Page Visibility helpers for deferring UI-sensitive work until the tab is shown.
 */

/**
 * True when the document is visible to the user (not background/hidden).
 * @param {Document} [doc]
 * @returns {boolean}
 */
export function isDocumentVisible(doc = document) {
  if (!doc) {
    return true;
  }
  if (typeof doc.visibilityState === 'string') {
    return doc.visibilityState === 'visible';
  }
  return !doc.hidden;
}

/**
 * Resolve when the document becomes visible, or immediately if already visible.
 * Rejects / resolves with cancelled semantics via AbortSignal.
 * @param {object} [options]
 * @param {Document} [options.doc]
 * @param {AbortSignal} [options.signal]
 * @returns {Promise<'visible' | 'cancelled'>}
 */
export function waitForDocumentVisible(options = {}) {
  const { doc = document, signal } = options;

  if (signal?.aborted) {
    return Promise.resolve('cancelled');
  }
  if (isDocumentVisible(doc)) {
    return Promise.resolve('visible');
  }

  return new Promise((resolve) => {
    const onAbort = () => {
      cleanup();
      resolve('cancelled');
    };
    const onVisibility = () => {
      if (!isDocumentVisible(doc)) {
        return;
      }
      cleanup();
      resolve('visible');
    };
    const cleanup = () => {
      doc.removeEventListener('visibilitychange', onVisibility);
      signal?.removeEventListener('abort', onAbort);
    };

    doc.addEventListener('visibilitychange', onVisibility);
    if (signal) {
      signal.addEventListener('abort', onAbort, { once: true });
    }
  });
}
