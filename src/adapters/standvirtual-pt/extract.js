import {
  canonicalizeListingUrl,
  normalizeDescription,
  normalizeEngine,
  normalizeFuel,
  normalizeMileageKm,
  normalizePowerCv,
  normalizePriceEur,
  normalizeTransmission,
  normalizeUpper,
  normalizeYear,
  stripHtmlToText,
} from '../shared/normalize.js';
import {
  AD_PRICE_SELECTOR,
  CANONICAL_LINK_SELECTOR,
  DESCRIPTION_SELECTOR,
  NEXT_DATA_SELECTOR,
  OFFER_TITLE_SELECTOR,
  SELLER_NAME_SELECTOR,
  detailValueSelector,
} from './selectors.js';

/**
 * @typedef {object} ExtractedListing
 * @property {string} siteId
 * @property {string} url
 * @property {string} listingId
 * @property {string} title
 * @property {string} description
 * @property {string} clientName
 * @property {string} make
 * @property {string} model
 * @property {string} year
 * @property {string} mileageKm
 * @property {string} transmission
 * @property {string} fuel
 * @property {string} engine
 * @property {string} powerCv
 * @property {string} priceEur
 * @property {string[]} extractedFields
 * @property {string[]} warnings
 */

const SITE_BASE = 'https://www.standvirtual.com/';

/**
 * @param {object | null | undefined} param
 * @returns {{ value: string, label: string }}
 */
export function readParamEntry(param) {
  if (!param || typeof param !== 'object') {
    return { value: '', label: '' };
  }
  const values = Array.isArray(param.values) ? param.values : [];
  const first = values[0];
  if (!first || typeof first !== 'object') {
    return { value: '', label: '' };
  }
  return {
    value: first.value == null ? '' : String(first.value).trim(),
    label: first.label == null ? '' : String(first.label).trim(),
  };
}

/**
 * Prefer human label for display fields; fall back to raw value.
 * @param {object | null | undefined} param
 * @returns {string}
 */
export function readParamLabel(param) {
  const { value, label } = readParamEntry(param);
  return label || value;
}

/**
 * Prefer machine value for numeric fields; fall back to label.
 * @param {object | null | undefined} param
 * @returns {string}
 */
export function readParamValue(param) {
  const { value, label } = readParamEntry(param);
  return value || label;
}

/**
 * @param {ParentNode} root
 * @returns {object | null}
 */
export function readAdvertFromNextData(root) {
  const script = root.querySelector?.(NEXT_DATA_SELECTOR);
  const raw = script?.textContent || '';
  if (!raw.trim()) {
    return null;
  }
  try {
    const data = JSON.parse(raw);
    const advert = data?.props?.pageProps?.advert;
    return advert && typeof advert === 'object' ? advert : null;
  } catch {
    return null;
  }
}

/**
 * @param {ParentNode} root
 * @returns {string}
 */
function readCanonicalUrl(root) {
  const link =
    root.querySelector?.(CANONICAL_LINK_SELECTOR) ||
    (typeof document !== 'undefined'
      ? document.querySelector(CANONICAL_LINK_SELECTOR)
      : null);
  const href = link?.getAttribute?.('href') || '';
  if (href) {
    return canonicalizeListingUrl(href, SITE_BASE);
  }
  if (typeof location !== 'undefined' && location?.href) {
    return canonicalizeListingUrl(location.href, SITE_BASE);
  }
  return '';
}

/**
 * @param {string} url
 * @param {object | null} advert
 * @returns {string}
 */
function resolveListingId(url, advert) {
  const m = String(url).match(/-ID([A-Za-z0-9]+)\.html/i);
  if (m?.[1]) {
    return m[1];
  }
  if (advert?.id != null && String(advert.id).trim()) {
    return String(advert.id).trim();
  }
  return '';
}

/**
 * @param {ParentNode} root
 * @param {string} key
 * @returns {string}
 */
function readDomDetail(root, key) {
  const el = root.querySelector?.(detailValueSelector(key));
  return (el?.textContent || '').replace(/\s+/g, ' ').trim();
}

/**
 * Extract structured listing fields from a Standvirtual page DOM.
 * Prefers `__NEXT_DATA__` advert; falls back to data-testid DOM.
 * @param {ParentNode} [root]
 * @returns {ExtractedListing}
 */
export function extractListing(root = document) {
  /** @type {string[]} */
  const extractedFields = [];
  /** @type {string[]} */
  const warnings = [];

  /**
   * @param {string} key
   * @param {string} value
   */
  function mark(key, value) {
    if (value) {
      extractedFields.push(key);
    }
  }

  const advert = readAdvertFromNextData(root);
  const params = advert?.parametersDict || {};

  let url = '';
  if (advert?.url) {
    url = canonicalizeListingUrl(advert.url, SITE_BASE);
  }
  if (!url) {
    url = readCanonicalUrl(root);
  }
  mark('url', url);

  const listingId = resolveListingId(url, advert);
  mark('listingId', listingId);

  const titleEl = root.querySelector?.(OFFER_TITLE_SELECTOR);
  const title = (
    advert?.title ||
    titleEl?.textContent ||
    ''
  )
    .replace(/\s+/g, ' ')
    .trim();
  mark('title', title);

  let description = '';
  if (advert?.description) {
    description = stripHtmlToText(advert.description);
  }
  if (!description) {
    const descEl = root.querySelector?.(DESCRIPTION_SELECTOR);
    description = normalizeDescription(descEl?.textContent || '');
  }
  mark('description', description);

  let clientName = '';
  if (advert?.seller?.name) {
    clientName = String(advert.seller.name).replace(/\s+/g, ' ').trim();
  }
  if (!clientName) {
    const nameEl = root.querySelector?.(SELLER_NAME_SELECTOR);
    clientName = (nameEl?.textContent || '').replace(/\s+/g, ' ').trim();
  }
  mark('clientName', clientName);

  let make =
    readParamLabel(params.make) || readDomDetail(root, 'make') || '';
  make = normalizeUpper(make);
  mark('make', make);

  let model =
    readParamLabel(params.model) || readDomDetail(root, 'model') || '';
  model = normalizeUpper(model);
  mark('model', model);

  let year =
    readParamValue(params.first_registration_year) ||
    readDomDetail(root, 'first_registration_year') ||
    '';
  year = normalizeYear(year);
  mark('year', year);

  const mileageKm = normalizeMileageKm(
    readParamValue(params.mileage) || readDomDetail(root, 'mileage') || '',
  );
  mark('mileageKm', mileageKm);

  // Record "transmission" = gearbox type (Manual/Automática), NOT drive traction.
  const transmission = normalizeTransmission(
    readParamLabel(params.gearbox) ||
      readDomDetail(root, 'gearbox') ||
      '',
  );
  mark('transmission', transmission);

  const fuel = normalizeFuel(
    readParamLabel(params.fuel_type) ||
      readDomDetail(root, 'fuel_type') ||
      '',
  );
  mark('fuel', fuel);

  const engineRaw =
    readParamValue(params.engine_capacity) ||
    readDomDetail(root, 'engine_capacity') ||
    '';
  // DOM labels are often "1 242 cm3"; strip unit then digits so normalizeEngine sees cc.
  const engineForNormalize = /cm\s*3|cm3|\bcc\b/i.test(engineRaw)
    ? engineRaw
        .replace(/cm\s*3|cm3|\bcc\b/gi, '')
        .replace(/[^\d]/g, '')
    : engineRaw;
  const engine = normalizeEngine(engineForNormalize);
  mark('engine', engine);

  const powerCv = normalizePowerCv(
    readParamValue(params.engine_power) ||
      readParamLabel(params.engine_power) ||
      readDomDetail(root, 'engine_power') ||
      '',
  );
  mark('powerCv', powerCv);

  let priceRaw = advert?.price?.value;
  if (priceRaw == null || priceRaw === '') {
    const priceEl = root.querySelector?.(AD_PRICE_SELECTOR);
    priceRaw = priceEl?.textContent || '';
  }
  const priceEur = normalizePriceEur(priceRaw);
  mark('priceEur', priceEur);

  if (!make || !model) {
    warnings.push('missing-make-or-model');
  }
  if (!url) {
    warnings.push('missing-url');
  }

  return {
    siteId: 'standvirtual-pt',
    url,
    listingId,
    title,
    description,
    clientName,
    make,
    model,
    year,
    mileageKm,
    transmission,
    fuel,
    engine,
    powerCv,
    priceEur,
    extractedFields: [...new Set(extractedFields)],
    warnings,
  };
}
