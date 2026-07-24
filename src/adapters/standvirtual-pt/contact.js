import {
  ASIDE_SELLER_SELECTOR,
  CONTACT_PHONE_SELECTOR,
  CONTENT_CONTACT_SELECTOR,
} from './selectors.js';
import { phoneDigitsFromTelHref, normalizePtPhoneDigits } from '../shared/normalize.js';

/**
 * @typedef {{
 *   ok: true,
 *   phone: string,
 *   clicked: boolean,
 *   alreadyVisible: boolean,
 * } | {
 *   ok: false,
 *   reason: 'no-button' | 'timeout' | 'cancelled',
 *   phone?: undefined,
 * }} RevealPhoneResult
 */

const REVEAL_LABEL = /ver\s+telefone/i;

/**
 * @param {number} ms
 * @param {AbortSignal} [signal]
 * @returns {Promise<'ok' | 'cancelled'>}
 */
function sleep(ms, signal) {
  if (ms <= 0) {
    return Promise.resolve(signal?.aborted ? 'cancelled' : 'ok');
  }
  if (signal?.aborted) {
    return Promise.resolve('cancelled');
  }
  return new Promise((resolve) => {
    const timer = setTimeout(() => {
      signal?.removeEventListener('abort', onAbort);
      resolve('ok');
    }, ms);
    const onAbort = () => {
      clearTimeout(timer);
      resolve('cancelled');
    };
    signal?.addEventListener('abort', onAbort, { once: true });
  });
}

/**
 * @param {Element | null} el
 * @returns {el is HTMLElement}
 */
function isClickableElement(el) {
  return Boolean(el && typeof el.click === 'function');
}

/**
 * @param {Element} el
 * @returns {{ display: string, visibility: string, opacity: string } | null}
 */
function readStyles(el) {
  try {
    if (typeof getComputedStyle !== 'function') {
      return null;
    }
    const style = getComputedStyle(/** @type {HTMLElement} */ (el));
    return {
      display: style.display || '',
      visibility: style.visibility || '',
      opacity: style.opacity || '',
    };
  } catch {
    return null;
  }
}

/**
 * @param {Element} el
 * @returns {number}
 */
function elementArea(el) {
  try {
    const rect = /** @type {HTMLElement} */ (el).getBoundingClientRect();
    return Math.max(0, rect.width) * Math.max(0, rect.height);
  } catch {
    return 0;
  }
}

/**
 * @param {Element} el
 * @returns {boolean}
 */
export function isCssHidden(el) {
  /** @type {HTMLElement} */
  const htmlEl = /** @type {HTMLElement} */ (el);
  if (htmlEl.hidden) {
    return true;
  }
  const style = readStyles(el);
  if (!style) {
    return false;
  }
  return (
    style.display === 'none' ||
    style.visibility === 'hidden' ||
    style.opacity === '0'
  );
}

/**
 * @param {Element} el
 * @returns {boolean}
 */
export function isVisibleElement(el) {
  if (!el || typeof el.getBoundingClientRect !== 'function') {
    return false;
  }
  if (isCssHidden(el)) {
    return false;
  }
  if (typeof el.checkVisibility === 'function') {
    try {
      if (
        el.checkVisibility({
          checkOpacity: true,
          checkVisibilityCSS: true,
        })
      ) {
        return true;
      }
    } catch {
      // fall through
    }
  }
  const area = elementArea(el);
  if (area > 0) {
    return true;
  }
  const style = readStyles(el);
  return Boolean(style && style.display !== 'none' && style.visibility !== 'hidden');
}

/**
 * Whether a button looks like the phone reveal control (not already a tel: link).
 * @param {Element} el
 * @returns {boolean}
 */
function isRevealButton(el) {
  if (!isClickableElement(el)) {
    return false;
  }
  if (el.closest('a[href^="tel:"]')) {
    return false;
  }
  const text = (el.textContent || '').replace(/\s+/g, ' ').trim();
  return REVEAL_LABEL.test(text);
}

/**
 * Collect "Ver telefone" buttons, preferring aside then content contact box.
 * @param {ParentNode} [root]
 * @returns {HTMLElement[]}
 */
export function queryPhoneRevealButtons(root = document) {
  /** @type {HTMLElement[]} */
  const ordered = [];
  const seen = new Set();

  /**
   * @param {string} scopeSelector
   */
  function collectFrom(scopeSelector) {
    const scope = root.querySelector?.(scopeSelector) || null;
    if (!scope) {
      return;
    }
    for (const el of scope.querySelectorAll('button')) {
      if (!isRevealButton(el) || seen.has(el)) {
        continue;
      }
      seen.add(el);
      ordered.push(/** @type {HTMLElement} */ (el));
    }
  }

  collectFrom(ASIDE_SELLER_SELECTOR);
  collectFrom(CONTENT_CONTACT_SELECTOR);

  // Fallback: any matching button on the page.
  for (const el of root.querySelectorAll?.('button') || []) {
    if (!isRevealButton(el) || seen.has(el)) {
      continue;
    }
    seen.add(el);
    ordered.push(/** @type {HTMLElement} */ (el));
  }

  return ordered;
}

/**
 * Prefer aside "Ver telefone", then a visible non-hidden candidate.
 * @param {ParentNode} [root]
 * @returns {HTMLElement | null}
 */
export function findPhoneRevealButton(root = document) {
  const buttons = queryPhoneRevealButtons(root);
  if (buttons.length === 0) {
    return null;
  }
  if (buttons.length === 1) {
    return buttons[0];
  }

  const aside = root.querySelector?.(ASIDE_SELLER_SELECTOR);
  if (aside) {
    const inAside = buttons.find((btn) => aside.contains(btn) && !isCssHidden(btn));
    if (inAside) {
      return inAside;
    }
  }

  const notHidden = buttons.filter((btn) => !isCssHidden(btn));
  const pool = notHidden.length > 0 ? notHidden : buttons;

  const ranked = [...pool].sort((a, b) => {
    const visA = isVisibleElement(a) ? 1 : 0;
    const visB = isVisibleElement(b) ? 1 : 0;
    if (visA !== visB) {
      return visB - visA;
    }
    return elementArea(b) - elementArea(a);
  });

  return ranked[0] || buttons[0];
}

/**
 * Prefer a currently visible reveal control (not merely present in the DOM).
 * @param {ParentNode} [root]
 * @returns {HTMLElement | null}
 */
export function findVisiblePhoneRevealButton(root = document) {
  const preferred = findPhoneRevealButton(root);
  if (preferred && isVisibleElement(preferred)) {
    return preferred;
  }
  for (const btn of queryPhoneRevealButtons(root)) {
    if (isVisibleElement(btn)) {
      return btn;
    }
  }
  return null;
}

/**
 * Read a revealed phone number from the listing DOM.
 * Prefers digits from tel: href; falls back to visible text digits.
 * @param {ParentNode} [root]
 * @returns {string | null}
 */
export function readRevealedPhone(root = document) {
  const candidates = [...(root.querySelectorAll?.(CONTACT_PHONE_SELECTOR) || [])];

  // Prefer aside tel: links.
  const aside = root.querySelector?.(ASIDE_SELLER_SELECTOR);
  const ordered =
    aside && candidates.length > 1
      ? [
          ...candidates.filter((el) => aside.contains(el)),
          ...candidates.filter((el) => !aside.contains(el)),
        ]
      : candidates;

  for (const el of ordered) {
    if (ordered.length > 1 && isCssHidden(el)) {
      continue;
    }
    const href = el.getAttribute('href') || '';
    const fromHref = phoneDigitsFromTelHref(href);
    if (fromHref) {
      return fromHref;
    }
    const digits = normalizePtPhoneDigits(el.textContent || '');
    if (digits) {
      return digits;
    }
  }

  if (ordered.length > 0) {
    const el = ordered[0];
    const href = el.getAttribute('href') || '';
    const fromHref = phoneDigitsFromTelHref(href);
    if (fromHref) {
      return fromHref;
    }
    const digits = normalizePtPhoneDigits(el.textContent || '');
    if (digits) {
      return digits;
    }
  }
  return null;
}

/**
 * @param {HTMLElement} el
 * @returns {boolean}
 */
export function invokeReactClick(el) {
  try {
    const key = Object.keys(el).find(
      (k) =>
        k.startsWith('__reactProps$') || k.startsWith('__reactEventHandlers$'),
    );
    if (!key) {
      return false;
    }
    const props = /** @type {{ onClick?: (event: object) => void }} */ (el[key]);
    if (typeof props?.onClick !== 'function') {
      return false;
    }
    const fakeEvent = {
      type: 'click',
      target: el,
      currentTarget: el,
      bubbles: true,
      cancelable: true,
      defaultPrevented: false,
      isTrusted: true,
      preventDefault() {
        this.defaultPrevented = true;
      },
      stopPropagation() {},
      persist() {},
      nativeEvent: { isTrusted: true },
    };
    props.onClick(fakeEvent);
    return true;
  } catch {
    return false;
  }
}

/**
 * @param {HTMLElement} el
 */
export function clickLikeUser(el) {
  try {
    el.click();
  } catch {
    // ignore
  }
  invokeReactClick(el);
}

/**
 * Click "Ver telefone" when present and wait for the phone link to appear.
 * After the tab is shown, the site may delay rendering the control — wait in
 * discrete attempts before giving up without a phone.
 * @param {object} [options]
 * @param {ParentNode} [options.root]
 * @param {number} [options.timeoutMs] wait for phone after click
 * @param {number} [options.intervalMs]
 * @param {number} [options.buttonAppearDelayMs] delay before each button check
 * @param {number} [options.buttonAppearAttempts] how many delayed checks
 * @param {AbortSignal} [options.signal]
 * @returns {Promise<RevealPhoneResult>}
 */
export async function revealContactPhone(options = {}) {
  const {
    root = document,
    timeoutMs = 15000,
    intervalMs = 250,
    buttonAppearDelayMs = 2000,
    buttonAppearAttempts = 2,
    signal,
  } = options;

  const existing = readRevealedPhone(root);
  if (existing) {
    return {
      ok: true,
      phone: existing,
      clicked: false,
      alreadyVisible: true,
    };
  }

  if (signal?.aborted) {
    return { ok: false, reason: 'cancelled' };
  }

  /** @type {HTMLElement | null} */
  let button = null;
  const attempts = Math.max(1, buttonAppearAttempts);
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    const waited = await sleep(buttonAppearDelayMs, signal);
    if (waited === 'cancelled' || signal?.aborted) {
      return { ok: false, reason: 'cancelled' };
    }
    button = findVisiblePhoneRevealButton(root);
    if (button) {
      break;
    }
  }

  if (!button) {
    return { ok: false, reason: 'no-button' };
  }

  const deadline = Date.now() + timeoutMs;
  clickLikeUser(button);

  while (Date.now() < deadline) {
    if (signal?.aborted) {
      return { ok: false, reason: 'cancelled' };
    }
    const phone = readRevealedPhone(root);
    if (phone) {
      return {
        ok: true,
        phone,
        clicked: true,
        alreadyVisible: false,
      };
    }
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }

  return { ok: false, reason: 'timeout' };
}
