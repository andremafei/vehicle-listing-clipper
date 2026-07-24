/**
 * LEAD_CLIP_V1 — clipboard trailer for CRM filler automation.
 * Human-readable listing text stays above the delimited JSON block.
 *
 * `clientName` is the advertiser/seller display name from the listing page
 * (OLX user-profile-user-name / Standvirtual advert.seller.name). The CRM
 * panel splits it into name + surname; it must not use `title` for that.
 */

import { normalizeDescription } from '../adapters/shared/normalize.js';
import { resolveClipboardId } from './full-text.js';

export const LEAD_CLIP_START = '<<<LEAD_CLIP_V1>>>';
export const LEAD_CLIP_END = '<<<END_LEAD_CLIP>>>';

/**
 * @typedef {object} LeadClipPayload
 * @property {1} v
 * @property {string} id
 * @property {string} phone
 * @property {string} plate
 * @property {string} clientName
 * @property {string} make
 * @property {string} model
 * @property {string} year
 * @property {string} mileageKm
 * @property {string} transmission
 * @property {string} fuel
 * @property {string} engine
 * @property {string} powerCv
 * @property {string} customerValueEur
 * @property {string} url
 * @property {string} siteId
 * @property {string} title
 * @property {string} description
 */

/**
 * @param {object} record listing record from createListingRecord
 * @param {{ phone?: string, fallbackId?: string }} [opts]
 * @returns {LeadClipPayload}
 */
export function buildLeadClipPayload(record, opts = {}) {
  const fields = record?.fields || {};
  const source = record?.source || {};
  const phone = opts.phone == null ? '' : String(opts.phone).trim();
  const id = resolveClipboardId({
    plate: fields.plate,
    phone,
    fallbackId: opts.fallbackId,
  });

  return {
    v: 1,
    id,
    phone,
    plate: String(fields.plate || ''),
    clientName: String(fields.clientName || source.clientName || '').trim(),
    make: String(fields.make || ''),
    model: String(fields.model || ''),
    year: String(fields.year || ''),
    mileageKm: String(fields.mileageKm || ''),
    transmission: String(fields.transmission || ''),
    fuel: String(fields.fuel || ''),
    engine: String(fields.engine || ''),
    powerCv: String(fields.powerCv || ''),
    customerValueEur: String(fields.customerValueEur || ''),
    url: String(fields.url || source.url || ''),
    siteId: String(source.siteId || ''),
    title: String(source.title || ''),
    description: normalizeDescription(source.description || ''),
  };
}

/**
 * Append the LEAD_CLIP_V1 block after human-readable clipboard text.
 * @param {string} fullText
 * @param {LeadClipPayload} payload
 * @returns {string}
 */
export function appendLeadClipJson(fullText, payload) {
  const body = JSON.stringify(payload, null, 2);
  const base = String(fullText || '').replace(/\s+$/, '');
  return `${base}\n\n${LEAD_CLIP_START}\n${body}\n${LEAD_CLIP_END}\n`;
}

/**
 * Extract and parse LEAD_CLIP_V1 from clipboard / pasted text.
 * @param {string} text
 * @returns {{ ok: true, payload: LeadClipPayload, humanText: string } | { ok: false, error: string }}
 */
export function parseLeadClip(text) {
  const raw = String(text || '');
  const start = raw.indexOf(LEAD_CLIP_START);
  if (start < 0) {
    return { ok: false, error: 'LEAD_CLIP_V1 block not found' };
  }
  const afterStart = start + LEAD_CLIP_START.length;
  const end = raw.indexOf(LEAD_CLIP_END, afterStart);
  if (end < 0) {
    return { ok: false, error: 'LEAD_CLIP_V1 end delimiter missing' };
  }
  const jsonText = raw.slice(afterStart, end).trim();
  const humanText = raw.slice(0, start).replace(/\s+$/, '');
  try {
    const parsed = JSON.parse(jsonText);
    if (!parsed || parsed.v !== 1 || typeof parsed !== 'object') {
      return { ok: false, error: 'Invalid LEAD_CLIP payload (expected v:1)' };
    }
    return {
      ok: true,
      payload: /** @type {LeadClipPayload} */ (parsed),
      humanText,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'JSON parse failed';
    return { ok: false, error: message };
  }
}
