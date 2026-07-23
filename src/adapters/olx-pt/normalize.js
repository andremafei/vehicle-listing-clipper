/**
 * Re-export shared normalizers for OLX PT (backward-compatible import path).
 */
export {
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
