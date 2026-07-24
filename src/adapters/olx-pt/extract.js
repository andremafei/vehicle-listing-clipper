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
  AD_PARAMETERS_SELECTOR,
  AD_PRICE_SELECTOR,
  BREADCRUMB_ITEM_SELECTOR,
  CANONICAL_LINK_SELECTOR,
  DESCRIPTION_SELECTOR,
  JSON_LD_SELECTOR,
  OFFER_TITLE_SELECTOR,
  USER_PROFILE_NAME_SELECTOR,
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

/**
 * Parse `Label: value` paragraphs from the parameters container.
 * @param {ParentNode} root
 * @returns {Map<string, string>}
 */
export function parseParameterMap(root) {
  /** @type {Map<string, string>} */
  const map = new Map();
  const container = root.querySelector(AD_PARAMETERS_SELECTOR);
  if (!container) {
    return map;
  }
  for (const p of container.querySelectorAll('p')) {
    const text = (p.textContent || '').replace(/\s+/g, ' ').trim();
    if (!text) {
      continue;
    }
    const colon = text.indexOf(':');
    if (colon <= 0) {
      continue;
    }
    const label = text.slice(0, colon).trim().toLowerCase();
    const value = text.slice(colon + 1).trim();
    if (label && value) {
      map.set(label, value);
    }
  }
  return map;
}

/**
 * @param {ParentNode} root
 * @returns {object | null}
 */
export function readVehicleJsonLd(root) {
  const scripts = root.querySelectorAll(JSON_LD_SELECTOR);
  for (const script of scripts) {
    const raw = script.textContent || '';
    if (!raw.trim()) {
      continue;
    }
    try {
      const data = JSON.parse(raw);
      const candidates = Array.isArray(data) ? data : [data];
      for (const item of candidates) {
        if (item && item['@type'] === 'Vehicle') {
          return item;
        }
      }
    } catch {
      // ignore malformed JSON-LD
    }
  }
  return null;
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
    return canonicalizeListingUrl(href);
  }
  if (typeof location !== 'undefined' && location?.href) {
    return canonicalizeListingUrl(location.href);
  }
  return '';
}

/**
 * @param {ParentNode} root
 * @returns {string}
 */
function readBrandFromBreadcrumbs(root) {
  const items = root.querySelectorAll(BREADCRUMB_ITEM_SELECTOR);
  for (const el of items) {
    const href = el.getAttribute?.('href') || '';
    const match = href.match(/\/carros\/([^/?#]+)\//i);
    if (match?.[1]) {
      try {
        return decodeURIComponent(match[1]).replace(/-/g, ' ');
      } catch {
        return match[1].replace(/-/g, ' ');
      }
    }
  }
  return '';
}

/**
 * @param {object | null} jsonLd
 * @returns {string}
 */
function brandFromJsonLd(jsonLd) {
  if (!jsonLd?.brand) {
    return '';
  }
  if (typeof jsonLd.brand === 'string') {
    return jsonLd.brand;
  }
  if (typeof jsonLd.brand?.name === 'string') {
    return jsonLd.brand.name;
  }
  return '';
}

/**
 * @param {string} url
 * @param {object | null} jsonLd
 * @returns {string}
 */
function resolveListingId(url, jsonLd) {
  if (jsonLd?.sku != null && String(jsonLd.sku).trim()) {
    return String(jsonLd.sku).trim();
  }
  const m = String(url).match(/-ID([A-Za-z0-9]+)\.html/i);
  return m?.[1] || '';
}

/**
 * Prefer the visible description DOM: OLX JSON-LD flattens `<br>` to spaces.
 * Skip the "Descrição" heading when present.
 * @param {ParentNode} root
 * @returns {string}
 */
function readDescriptionFromDom(root) {
  const descEl = root.querySelector?.(DESCRIPTION_SELECTOR);
  if (!descEl) {
    return '';
  }
  const contentEl = [...(descEl.children || [])].find(
    (el) => String(el.tagName || '').toUpperCase() !== 'H3',
  );
  if (contentEl) {
    return stripHtmlToText(contentEl.innerHTML || '');
  }
  let text = stripHtmlToText(descEl.innerHTML || '');
  text = text.replace(/^Descrição\s*/i, '');
  return normalizeDescription(text);
}

/**
 * Extract structured listing fields from an OLX PT page DOM.
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

  const params = parseParameterMap(root);
  const jsonLd = readVehicleJsonLd(root);

  const url = readCanonicalUrl(root);
  mark('url', url);

  const listingId = resolveListingId(url, jsonLd);
  mark('listingId', listingId);

  const titleEl = root.querySelector(OFFER_TITLE_SELECTOR);
  const title = (
    titleEl?.textContent ||
    jsonLd?.name ||
    ''
  )
    .replace(/\s+/g, ' ')
    .trim();
  mark('title', title);

  let description = readDescriptionFromDom(root);
  if (!description) {
    description = stripHtmlToText(jsonLd?.description || '');
  }
  mark('description', description);

  const nameEl = root.querySelector(USER_PROFILE_NAME_SELECTOR);
  const clientName = (nameEl?.textContent || '').replace(/\s+/g, ' ').trim();
  mark('clientName', clientName);

  let make = brandFromJsonLd(jsonLd);
  if (!make) {
    make = readBrandFromBreadcrumbs(root);
  }
  make = normalizeUpper(make);
  mark('make', make);

  let model = params.get('modelo') || jsonLd?.model || '';
  model = normalizeUpper(model);
  mark('model', model);

  let year =
    params.get('ano') ||
    jsonLd?.productionDate ||
    jsonLd?.modelDate ||
    '';
  year = normalizeYear(year);
  mark('year', year);

  const mileageKm = normalizeMileageKm(params.get('quilómetros') || params.get('quilometros') || '');
  mark('mileageKm', mileageKm);

  const transmission = normalizeTransmission(
    params.get('tipo de caixa') || '',
  );
  mark('transmission', transmission);

  const fuel = normalizeFuel(params.get('combustível') || params.get('combustivel') || '');
  mark('fuel', fuel);

  const engine = normalizeEngine(params.get('cilindrada') || '');
  mark('engine', engine);

  const powerCv = normalizePowerCv(params.get('potência') || params.get('potencia') || '');
  mark('powerCv', powerCv);

  let priceRaw = jsonLd?.offers?.price;
  if (priceRaw == null || priceRaw === '') {
    const priceEl = root.querySelector(AD_PRICE_SELECTOR);
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
    siteId: 'olx-pt',
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
