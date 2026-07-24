import {
  CONTACT_PHONE_SELECTOR,
  PHONE_REVEAL_BUTTON_SELECTOR,
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
 * Tampermonkey sandboxes break `instanceof HTMLButtonElement` against page nodes.
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
 * Area helper — Tampermonkey sandboxes sometimes report 0×0 for real page nodes.
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
 * Whether CSS clearly hides the element.
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
 * OLX renders duplicate "Ver número" buttons (same testid); only one is shown.
 * Prefer CSS visibility over getBoundingClientRect — TM sandbox often returns 0×0.
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
      // checkVisibility can false-negative across TM sandbox realms; keep going.
    } catch {
      // fall through
    }
  }
  const area = elementArea(el);
  if (area > 0) {
    return true;
  }
  // Style says not hidden, but rect is empty (common in TM sandbox) → treat as candidate.
  const style = readStyles(el);
  return Boolean(style && style.display !== 'none' && style.visibility !== 'hidden');
}

/**
 * @param {ParentNode} [root]
 * @returns {HTMLElement[]}
 */
export function queryPhoneRevealButtons(root = document) {
  return [...root.querySelectorAll(PHONE_REVEAL_BUTTON_SELECTOR)].filter(
    (el) => isClickableElement(el),
  );
}

/**
 * Prefer a visible reveal button.
 * If visibility is inconclusive, prefer the last non-CSS-hidden match
 * (OLX puts the desktop control after a display:none duplicate).
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

  // Prefer the last among top-ranked ties so we skip the early hidden duplicate
  // when areas are all 0 in the Tampermonkey sandbox.
  const bestScore = (() => {
    const top = ranked[0];
    return {
      visible: isVisibleElement(top) ? 1 : 0,
      area: elementArea(top),
    };
  })();
  const ties = ranked.filter(
    (btn) =>
      (isVisibleElement(btn) ? 1 : 0) === bestScore.visible &&
      elementArea(btn) === bestScore.area,
  );
  return ties[ties.length - 1] || ranked[ranked.length - 1] || buttons[buttons.length - 1];
}

/**
 * Read a revealed phone number from the listing DOM.
 * Prefers digits from tel: href; falls back to visible text digits.
 * @param {ParentNode} [root]
 * @returns {string | null}
 */
export function readRevealedPhone(root = document) {
  const candidates = [...root.querySelectorAll(CONTACT_PHONE_SELECTOR)];
  for (const el of candidates) {
    if (candidates.length > 1 && isCssHidden(el)) {
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
  // Last resort: any tel link under mainContent, even if visibility is unclear.
  if (candidates.length > 0) {
    const el = candidates[candidates.length - 1];
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
 * Invoke React onClick props when present.
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
 * Click the reveal control the same way the working console snippet does,
 * with optional React-prop fallback.
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
 * Click "Ver número" when present and wait for the phone link to appear.
 * After the tab is shown, the site may delay rendering the control — wait in
 * discrete attempts before giving up without a phone.
 * No-ops gracefully when the listing has no phone reveal button.
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
