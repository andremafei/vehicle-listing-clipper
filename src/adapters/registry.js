import { olxPtAdapter } from './olx-pt/index.js';
import { standvirtualPtAdapter } from './standvirtual-pt/index.js';

/** @typedef {typeof olxPtAdapter | typeof standvirtualPtAdapter} SiteAdapter */

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
 * Resolve the adapter for the current page by hostname.
 * @param {string} [hostname]
 * @returns {SiteAdapter}
 */
export function resolveAdapter(hostname) {
  const host = String(
    hostname ??
      (typeof location !== 'undefined' ? location.hostname : '') ??
      '',
  ).toLowerCase();
  if (host.includes('standvirtual.com')) {
    return getAdapter('standvirtual-pt') || standvirtualPtAdapter;
  }
  return getAdapter('olx-pt') || olxPtAdapter;
}

registerAdapter(olxPtAdapter);
registerAdapter(standvirtualPtAdapter);

export { olxPtAdapter, standvirtualPtAdapter };
