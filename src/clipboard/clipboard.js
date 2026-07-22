import { gmSetClipboard } from '../userscript/gm-api.js';

/**
 * Build clipboard payload from plate and/or phone.
 * @param {{ plate?: string | null, phone?: string | null }} parts
 * @returns {string}
 */
export function formatClipboardPayload({ plate, phone } = {}) {
  const lines = [];
  if (plate) {
    lines.push(plate);
  }
  if (phone) {
    lines.push(phone);
  }
  return lines.join('\n');
}

/**
 * Copy text to the clipboard via GM with navigator fallback.
 * @param {string} text
 * @returns {Promise<{ ok: boolean, method: 'gm' | 'navigator' | 'none' }>}
 */
export async function copyText(text) {
  const gmOk = await gmSetClipboard(text);
  if (gmOk) {
    // gmSetClipboard returns true for GM or navigator — distinguish lightly
    if (typeof GM_setClipboard === 'function') {
      return { ok: true, method: 'gm' };
    }
    if (typeof GM !== 'undefined' && GM?.setClipboard) {
      return { ok: true, method: 'gm' };
    }
    return { ok: true, method: 'navigator' };
  }
  return { ok: false, method: 'none' };
}
