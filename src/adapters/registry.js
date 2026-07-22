import { olxPtAdapter } from './olx-pt/index.js';

/** @typedef {typeof olxPtAdapter} SiteAdapter */

/** @type {Map<string, SiteAdapter>} */
const adapters = new Map();

/**
 * @param {SiteAdapter} adapter
 */
export function registerAdapter(adapter) {
  adapters.set(adapter.siteId, adapter);
}

/**
 * @param {string} siteId
 * @returns {SiteAdapter | undefined}
 */
export function getAdapter(siteId) {
  return adapters.get(siteId);
}

/**
 * Resolve the adapter for the current page.
 * Stage 2: only olx-pt is registered; userscript @match already scopes hosts.
 * @returns {SiteAdapter}
 */
export function resolveAdapter() {
  return getAdapter('olx-pt') || olxPtAdapter;
}

registerAdapter(olxPtAdapter);

export { olxPtAdapter };
