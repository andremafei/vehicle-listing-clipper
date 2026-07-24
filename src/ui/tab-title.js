/**
 * Browser tab title prefixes for capture-phase status across many listing tabs.
 */

/** @type {readonly string[]} */
export const TAB_TITLE_PREFIXES = Object.freeze([
  '\u23F3', // hourglass — processing
  '\u{1F514}', // bell — needs tab focus for phone
  '\u{1F4CB}', // clipboard — ready to copy
  '\u2705', // check — copied
  '\u26D4', // no-entry — no data
]);

const PREFIX_PROCESSING = TAB_TITLE_PREFIXES[0];
const PREFIX_NEEDS_FOCUS = TAB_TITLE_PREFIXES[1];
const PREFIX_READY = TAB_TITLE_PREFIXES[2];
const PREFIX_COPIED = TAB_TITLE_PREFIXES[3];
const PREFIX_FAILED = TAB_TITLE_PREFIXES[4];

/** @type {string | null} */
let baseTitle = null;

/**
 * Strip a known status prefix from a document title.
 * @param {string} title
 * @returns {string}
 */
export function stripTabTitlePrefix(title) {
  const value = String(title ?? '');
  for (const prefix of TAB_TITLE_PREFIXES) {
    if (value.startsWith(`${prefix} `)) {
      return value.slice(prefix.length + 1);
    }
    if (value.startsWith(prefix)) {
      return value.slice(prefix.length).trimStart();
    }
  }
  return value;
}

/**
 * Map a capture phase string to a short tab-title emoji prefix.
 * @param {string} phase
 * @returns {string | null} Prefix emoji, or null when phase is unknown
 */
export function phaseToTabPrefix(phase) {
  const normalized = String(phase || '')
    .trim()
    .toLowerCase();
  if (!normalized) {
    return null;
  }
  if (
    normalized === 'waiting' ||
    normalized === 'reading' ||
    normalized.startsWith('analisando imagem')
  ) {
    return PREFIX_PROCESSING;
  }
  if (normalized === 'lendo tel') {
    return PREFIX_NEEDS_FOCUS;
  }
  if (normalized === 'ready to copy') {
    return PREFIX_READY;
  }
  if (normalized === 'data copied') {
    return PREFIX_COPIED;
  }
  if (normalized === 'no data found.') {
    return PREFIX_FAILED;
  }
  return null;
}

/**
 * Ensure base title is captured once (from current document.title, stripped).
 * @param {Document} [doc]
 * @returns {string}
 */
function ensureBaseTitle(doc = globalThis.document) {
  if (baseTitle == null) {
    baseTitle = stripTabTitlePrefix(doc?.title ?? '');
  }
  return baseTitle;
}

/**
 * Apply a capture-phase emoji prefix to document.title.
 * @param {string} phase
 * @param {Document} [doc]
 */
export function applyTabTitleForPhase(phase, doc = globalThis.document) {
  if (!doc) {
    return;
  }
  const prefix = phaseToTabPrefix(phase);
  if (!prefix) {
    return;
  }
  const base = ensureBaseTitle(doc);
  doc.title = `${prefix} ${base}`;
}

/**
 * Restore the original document.title captured on first apply.
 * @param {Document} [doc]
 */
export function restoreTabTitle(doc = globalThis.document) {
  if (baseTitle == null) {
    return;
  }
  if (doc) {
    doc.title = baseTitle;
  }
  baseTitle = null;
}
