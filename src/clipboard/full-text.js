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
 * Resolve clipboard ID: plate → phone → generated 99XXXXX99.
 * @param {{ plate?: string | null, phone?: string | null }} parts
 * @returns {string}
 */
export function resolveClipboardId({ plate, phone } = {}) {
  const plateValue = plate == null ? '' : String(plate).trim();
  if (plateValue) {
    return plateValue;
  }
  const phoneValue = phone == null ? '' : String(phone).trim();
  if (phoneValue) {
    return phoneValue;
  }
  return generateFallbackId();
}

/**
 * Format the Stage 6 full-text clipboard template.
 * @param {import('../listing/record.js').ListingFields | Record<string, string>} fields
 * @param {{ phone?: string | null }} [options]
 * @returns {string}
 */
export function formatFullText(fields, { phone = '' } = {}) {
  const f = fields || {};
  const phoneValue = phone == null ? '' : String(phone).trim();
  const plateValue = f.plate == null ? '' : String(f.plate).trim();
  const id = resolveClipboardId({ plate: plateValue, phone: phoneValue });

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
