import { LISTING_FIELD_IDS, LISTING_FIELD_LABELS } from '../listing/record.js';

/**
 * Fallback listing ID: 99XXXXX99 (XXXXX = 5 random digits).
 * @returns {string}
 */
export function generateFallbackId() {
  const middle = String(Math.floor(Math.random() * 100000)).padStart(5, '0');
  return `99${middle}99`;
}

/**
 * Describe clipboard ID and whether it is a generated random fallback.
 * Priority: plate → phone → remembered fallback → generated 99XXXXX99.
 * @param {{ plate?: string | null, phone?: string | null, fallbackId?: string | null }} parts
 * @returns {{ id: string, isRandom: boolean }}
 */
export function describeClipboardId({ plate, phone, fallbackId } = {}) {
  const plateValue = plate == null ? '' : String(plate).trim();
  if (plateValue) {
    return { id: plateValue, isRandom: false };
  }
  const phoneValue = phone == null ? '' : String(phone).trim();
  if (phoneValue) {
    return { id: phoneValue, isRandom: false };
  }
  const remembered = fallbackId == null ? '' : String(fallbackId).trim();
  if (remembered) {
    return { id: remembered, isRandom: true };
  }
  return { id: generateFallbackId(), isRandom: true };
}

/**
 * Resolve clipboard ID: plate → phone → remembered fallback → generated 99XXXXX99.
 * @param {{ plate?: string | null, phone?: string | null, fallbackId?: string | null }} parts
 * @returns {string}
 */
export function resolveClipboardId(parts = {}) {
  return describeClipboardId(parts).id;
}

/**
 * Read the `ID:` line from a previously formatted clipboard payload.
 * @param {string} text
 * @returns {string}
 */
export function parseClipboardId(text) {
  const match = /^ID:\s*(.+)\s*$/m.exec(String(text || ''));
  return match ? match[1].trim() : '';
}

/**
 * Format the Stage 6 full-text clipboard template.
 * @param {import('../listing/record.js').ListingFields | Record<string, string>} fields
 * @param {{ phone?: string | null, fallbackId?: string | null }} [options]
 * @returns {string}
 */
export function formatFullText(fields, { phone = '', fallbackId = '' } = {}) {
  const f = fields || {};
  const phoneValue = phone == null ? '' : String(phone).trim();
  const plateValue = f.plate == null ? '' : String(f.plate).trim();
  const id = resolveClipboardId({
    plate: plateValue,
    phone: phoneValue,
    fallbackId,
  });

  const lines = [`ID: ${id}`, `Telefone: ${phoneValue}`, ''];

  for (const idKey of LISTING_FIELD_IDS) {
    if (idKey === 'url') {
      continue;
    }
    const label = LISTING_FIELD_LABELS[idKey];
    let value = f[idKey] == null ? '' : String(f[idKey]);
    if (idKey === 'customerValueEur' && value && !/€/.test(value)) {
      value = `${value} €`;
    }
    lines.push(`${label}: ${value}`);
  }

  const url = f.url == null ? '' : String(f.url);
  lines.push('');
  lines.push(url);
  return lines.join('\n');
}
