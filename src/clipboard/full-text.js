import { LISTING_FIELD_IDS, LISTING_FIELD_LABELS } from '../listing/record.js';

/**
 * Format the Stage 6 full-text clipboard template.
 * @param {import('../listing/record.js').ListingFields | Record<string, string>} fields
 * @returns {string}
 */
export function formatFullText(fields) {
  const f = fields || {};
  const lines = [];

  for (const id of LISTING_FIELD_IDS) {
    if (id === 'url') {
      continue;
    }
    const label = LISTING_FIELD_LABELS[id];
    let value = f[id] == null ? '' : String(f[id]);
    if (id === 'customerValueEur' && value && !/€/.test(value)) {
      value = `${value} €`;
    }
    lines.push(`${label}: ${value}`);
  }

  const url = f.url == null ? '' : String(f.url);
  lines.push('');
  lines.push(url);
  return lines.join('\n');
}
