/**
 * Normalize listing field values for the clipboard template.
 * Shared across site adapters (OLX PT, Standvirtual, …).
 */

/**
 * @param {unknown} raw
 * @returns {string}
 */
export function normalizeMileageKm(raw) {
  if (raw == null || raw === '') {
    return '';
  }
  const digits = String(raw).replace(/[^\d]/g, '');
  return digits || '';
}

/**
 * @param {unknown} raw
 * @returns {string}
 */
export function normalizePriceEur(raw) {
  if (raw == null || raw === '') {
    return '';
  }
  if (typeof raw === 'number' && Number.isFinite(raw)) {
    return String(Math.round(raw));
  }
  const digits = String(raw).replace(/[^\d]/g, '');
  return digits || '';
}

/**
 * @param {unknown} raw
 * @returns {string}
 */
export function normalizeTransmission(raw) {
  if (raw == null || raw === '') {
    return '';
  }
  const s = String(raw).trim().toLowerCase();
  if (!s) {
    return '';
  }
  if (s.includes('manual')) {
    return 'MANUAL';
  }
  if (
    s.includes('auto') ||
    s.includes('cvt') ||
    s.includes('dsg') ||
    s.includes('eat')
  ) {
    return 'AUTOMÁTICA';
  }
  return String(raw).trim().toUpperCase();
}

/**
 * @param {unknown} raw
 * @returns {string}
 */
export function normalizeFuel(raw) {
  if (raw == null || raw === '') {
    return '';
  }
  const s = String(raw)
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '');
  if (!s) {
    return '';
  }
  if (s.includes('gasolina') || s.includes('gasoline') || s === 'petrol') {
    return 'GASOLINA';
  }
  if (s.includes('diesel') || s.includes('gasoleo') || s.includes('gásóleo')) {
    return 'DIESEL';
  }
  if (s.includes('eletr') || s.includes('electr')) {
    return 'ELÉTRICO';
  }
  if (s.includes('hibr') || s.includes('hybrid')) {
    return 'HÍBRIDO';
  }
  if (s.includes('gpl') || s.includes('lpg') || s.includes('gnv')) {
    return 'GPL';
  }
  return String(raw).trim().toUpperCase();
}

/**
 * Cilindrada PT (e.g. 1.500 → 1.5 liters). Values already in liters stay as-is.
 * @param {unknown} raw
 * @returns {string}
 */
export function normalizeEngine(raw) {
  if (raw == null || raw === '') {
    return '';
  }
  const cleaned = String(raw).trim();
  if (!cleaned) {
    return '';
  }
  const asCc = cleaned.replace(/\s/g, '').replace(/\./g, '').replace(/,/g, '');
  if (/^\d+$/.test(asCc)) {
    const n = Number.parseInt(asCc, 10);
    if (n === 99 || n === 999) {
      return '1.0';
    }
    if (n >= 100) {
      return (n / 1000).toFixed(1);
    }
  }
  const asLiters = cleaned.replace(',', '.');
  if (asLiters === '1') {
    return '1.0';
  }
  return asLiters;
}

/**
 * @param {unknown} raw
 * @returns {string}
 */
export function normalizePowerCv(raw) {
  if (raw == null || raw === '') {
    return '';
  }
  const s = String(raw).trim();
  if (!s) {
    return '';
  }
  if (/\bcv\b/i.test(s)) {
    const digits = s.replace(/[^\d]/g, '');
    return digits ? `${digits} CV` : s.toUpperCase().replace(/\s+/g, ' ');
  }
  const digits = s.replace(/[^\d]/g, '');
  return digits ? `${digits} CV` : s;
}

/**
 * @param {unknown} raw
 * @returns {string}
 */
export function normalizeYear(raw) {
  if (raw == null || raw === '') {
    return '';
  }
  const digits = String(raw).replace(/[^\d]/g, '');
  if (digits.length >= 4) {
    return digits.slice(0, 4);
  }
  return digits;
}

/**
 * @param {unknown} raw
 * @returns {string}
 */
export function normalizeUpper(raw) {
  if (raw == null || raw === '') {
    return '';
  }
  return String(raw).trim().toUpperCase();
}

/**
 * Strip query/hash and truncate at `.html` when present.
 * @param {unknown} href
 * @param {string} [baseHref]
 * @returns {string}
 */
export function canonicalizeListingUrl(href, baseHref = 'https://www.olx.pt/') {
  if (href == null || href === '') {
    return '';
  }
  try {
    const u = new URL(String(href), baseHref);
    let out = `${u.origin}${u.pathname}`;
    const lower = out.toLowerCase();
    const idx = lower.indexOf('.html');
    if (idx !== -1) {
      out = out.slice(0, idx + 5);
    }
    return out;
  } catch {
    return '';
  }
}
