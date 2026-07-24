/**
 * ANPR download/decode resolution helpers (medium pass vs high-res retry).
 */

/** Long-edge cap for medium-resolution decode (and Apollo `;s=` width). */
export const ANPR_MEDIUM_LONG_EDGE = 1440;

/** Apollo CDN size token for medium pass (width × auto height). */
export const ANPR_MEDIUM_APOLLO_SIZE = `${ANPR_MEDIUM_LONG_EDGE}x0`;

const APOLLO_CDN = /apollo\.olxcdn\.com/i;
const APOLLO_SIZE = /;s=\d+x\d+/i;

/**
 * @param {string} url
 * @returns {boolean}
 */
export function isApolloCdnUrl(url) {
  return typeof url === 'string' && APOLLO_CDN.test(url);
}

/**
 * Set or strip Apollo `;s=WxH` on a CDN URL. Non-Apollo URLs are returned unchanged.
 * @param {string} url
 * @param {string | null} sizeToken e.g. `'1440x0'`; null strips the size token
 * @returns {string}
 */
export function withApolloImageSize(url, sizeToken) {
  if (!url || typeof url !== 'string' || !isApolloCdnUrl(url)) {
    return url;
  }

  const withoutSize = url.replace(APOLLO_SIZE, '');
  if (!sizeToken) {
    return withoutSize;
  }

  if (/;q=/i.test(withoutSize)) {
    return withoutSize.replace(/;q=/i, `;s=${sizeToken};q=`);
  }
  return `${withoutSize};s=${sizeToken}`;
}

/**
 * Gallery URL → medium-resolution download URL for pass 1.
 * @param {string} url
 * @returns {string}
 */
export function toMediumAnprImageUrl(url) {
  return withApolloImageSize(url, ANPR_MEDIUM_APOLLO_SIZE);
}

/**
 * Gallery URL → high-resolution download URL for pass 2 (strip `;s=`).
 * @param {string} url
 * @returns {string}
 */
export function toHighAnprImageUrl(url) {
  return withApolloImageSize(url, null);
}
