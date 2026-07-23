import { STORAGE_PREFIX } from '../environment.js';
import { gmGetValue, gmSetValue } from '../userscript/gm-api.js';

const CACHE_KEY = 'listingCache';

/** Two days in milliseconds. */
export const LISTING_CACHE_TTL_MS = 2 * 24 * 60 * 60 * 1000;

/**
 * @typedef {object} ListingCacheEntry
 * @property {number} processedAt
 * @property {string} phone
 * @property {string} clipboard
 * @property {string} [fallbackId]
 * @property {object} listingRecord
 */

/**
 * @returns {string}
 */
function storageKey() {
  return `${STORAGE_PREFIX}${CACHE_KEY}`;
}

/**
 * @param {unknown} value
 * @returns {value is ListingCacheEntry}
 */
function isValidEntry(value) {
  if (!value || typeof value !== 'object') {
    return false;
  }
  const entry = /** @type {Record<string, unknown>} */ (value);
  return (
    typeof entry.processedAt === 'number' &&
    Number.isFinite(entry.processedAt) &&
    typeof entry.phone === 'string' &&
    typeof entry.clipboard === 'string' &&
    entry.listingRecord != null &&
    typeof entry.listingRecord === 'object'
  );
}

/**
 * @param {unknown} raw
 * @returns {Record<string, ListingCacheEntry>}
 */
function normalizeCacheMap(raw) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return {};
  }
  /** @type {Record<string, ListingCacheEntry>} */
  const out = {};
  for (const [url, entry] of Object.entries(raw)) {
    if (typeof url === 'string' && url && isValidEntry(entry)) {
      out[url] = {
        processedAt: entry.processedAt,
        phone: entry.phone,
        clipboard: entry.clipboard,
        fallbackId:
          typeof entry.fallbackId === 'string' ? entry.fallbackId : '',
        listingRecord: entry.listingRecord,
      };
    }
  }
  return out;
}

/**
 * @returns {Promise<Record<string, ListingCacheEntry>>}
 */
export async function loadListingCache() {
  const raw = await gmGetValue(storageKey(), {});
  return normalizeCacheMap(raw);
}

/**
 * @param {Record<string, ListingCacheEntry>} cache
 * @returns {Promise<void>}
 */
async function saveListingCache(cache) {
  await gmSetValue(storageKey(), cache);
}

/**
 * Drop entries older than TTL.
 * @param {number} [now]
 * @returns {Promise<Record<string, ListingCacheEntry>>}
 */
export async function pruneListingCache(now = Date.now()) {
  const cache = await loadListingCache();
  /** @type {Record<string, ListingCacheEntry>} */
  const next = {};
  let changed = false;
  for (const [url, entry] of Object.entries(cache)) {
    if (now - entry.processedAt <= LISTING_CACHE_TTL_MS) {
      next[url] = entry;
    } else {
      changed = true;
    }
  }
  if (changed || Object.keys(next).length !== Object.keys(cache).length) {
    await saveListingCache(next);
  }
  return next;
}

/**
 * @param {string} url
 * @param {number} [now]
 * @returns {Promise<ListingCacheEntry | null>}
 */
export async function getListingCacheEntry(url, now = Date.now()) {
  const key = typeof url === 'string' ? url.trim() : '';
  if (!key) {
    return null;
  }
  const cache = await pruneListingCache(now);
  const entry = cache[key];
  return entry && isValidEntry(entry) ? entry : null;
}

/**
 * @param {string} url
 * @param {ListingCacheEntry} entry
 * @param {number} [now]
 * @returns {Promise<ListingCacheEntry | null>}
 */
export async function setListingCacheEntry(url, entry, now = Date.now()) {
  const key = typeof url === 'string' ? url.trim() : '';
  if (!key || !isValidEntry(entry)) {
    return null;
  }
  const cache = await pruneListingCache(now);
  const nextEntry = {
    processedAt: entry.processedAt,
    phone: entry.phone,
    clipboard: entry.clipboard,
    fallbackId: typeof entry.fallbackId === 'string' ? entry.fallbackId : '',
    listingRecord: entry.listingRecord,
  };
  cache[key] = nextEntry;
  await saveListingCache(cache);
  return nextEntry;
}

/**
 * Remove a single listing cache entry by URL.
 * @param {string} url
 * @param {number} [now]
 * @returns {Promise<boolean>} true if an entry was removed
 */
export async function deleteListingCacheEntry(url, now = Date.now()) {
  const key = typeof url === 'string' ? url.trim() : '';
  if (!key) {
    return false;
  }
  const cache = await pruneListingCache(now);
  if (!(key in cache)) {
    return false;
  }
  delete cache[key];
  await saveListingCache(cache);
  return true;
}
